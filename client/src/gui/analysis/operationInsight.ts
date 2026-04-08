import type Game from "@/game/Game";
import type { FocusFireSummary } from "@/game/Game";
import { SimulationLogType } from "@/game/log/SimulationLogs";
import {
  requestAssistantCompletionResult,
  type AssistantCompletionResult,
} from "@/gui/agent/chatbotApi";
import type { LlmMessage } from "@/gui/agent/chatbot.types";
import { unixToLocalTime } from "@/utils/dateTimeFunctions";

const FOCUS_FIRE_WEIGHTS = {
  artillery: 4,
  aircraft: 5,
  armor: 3,
  weaponsInFlight: 6,
  captureProgress: 0.2,
} as const;

type FocusFireInsightSource = Pick<
  FocusFireSummary,
  | "active"
  | "captureProgress"
  | "aircraftCount"
  | "artilleryCount"
  | "armorCount"
  | "weaponsInFlight"
>;

export interface FocusFireInsight {
  shockIndex: number;
  intensityLabel: string;
  dominantAxis: string;
  breakdown: {
    artillery: number;
    aircraft: number;
    armor: number;
    weaponsInFlight: number;
    captureProgress: number;
    total: number;
  };
  summary: string;
}

export interface SimulationOutcomeSideSummary {
  sideId: string;
  name: string;
  score: number;
  remainingCombatUnits: number;
  remainingCombatPower: number;
  aircraft: number;
  ships: number;
  facilities: number;
  airbases: number;
  weaponInventory: number;
  confirmedHits: number;
  launches: number;
  missionSuccesses: number;
}

export interface SimulationOutcomeSummary {
  scenarioName: string;
  endReason: string;
  endedAtUnix: number;
  endedAtLabel: string;
  winnerName: string | null;
  winnerBasis: string;
  isTie: boolean;
  scoreGap: number;
  sides: SimulationOutcomeSideSummary[];
  recentLogs: string[];
  fallbackSummary: string;
}

export type SimulationOutcomeNarrativeSource = "llm" | "fallback";

export interface SimulationOutcomeNarrative {
  text: string;
  source: SimulationOutcomeNarrativeSource;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFocusFireIntensityLabel(shockIndex: number) {
  if (shockIndex >= 85) {
    return "압도적";
  }
  if (shockIndex >= 65) {
    return "고강도";
  }
  if (shockIndex >= 40) {
    return "유효";
  }
  if (shockIndex >= 20) {
    return "축적 중";
  }
  return "준비 단계";
}

function getFocusFireDominantAxis(source: FocusFireInsightSource) {
  const weightedAxes = [
    {
      label: "항공 타격",
      value: source.aircraftCount * FOCUS_FIRE_WEIGHTS.aircraft,
    },
    {
      label: "포대 화력",
      value: source.artilleryCount * FOCUS_FIRE_WEIGHTS.artillery,
    },
    {
      label: "기갑 압박",
      value: source.armorCount * FOCUS_FIRE_WEIGHTS.armor,
    },
    {
      label: "비행 중 탄체",
      value: source.weaponsInFlight * FOCUS_FIRE_WEIGHTS.weaponsInFlight,
    },
  ].sort((left, right) => right.value - left.value);

  return weightedAxes[0]?.value ? weightedAxes[0].label : "대기";
}

function buildFocusFireSummaryText(
  source: FocusFireInsightSource,
  shockIndex: number,
  dominantAxis: string
) {
  if (!source.active && shockIndex < 20) {
    return "집중포격 준비 단계입니다. 아직 화력이 본격적으로 수렴하지 않았습니다.";
  }
  if (source.weaponsInFlight === 0 && source.captureProgress < 20) {
    return `${dominantAxis} 중심으로 포격 축을 형성 중입니다. 첫 타격이 들어가기 전 정렬 단계입니다.`;
  }
  if (shockIndex >= 85) {
    return `${dominantAxis}이(가) 전장을 지배하고 있습니다. 목표 지역 방어선이 급격히 흔들릴 가능성이 높습니다.`;
  }
  if (shockIndex >= 65) {
    return `${dominantAxis}이(가) 유의미한 충격을 만들고 있습니다. 화력과 기동이 함께 걸려 목표 고정 효과가 큽니다.`;
  }
  if (shockIndex >= 40) {
    return `${dominantAxis} 위주로 압박이 형성됐습니다. 추가 타격이 누적되면 목표 확보 단계로 넘어갈 수 있습니다.`;
  }
  return "집중포격은 진행 중이지만 아직 결정적 충격은 아닙니다. 화력 밀도를 더 올릴 여지가 있습니다.";
}

export function buildFocusFireInsight(
  source: FocusFireInsightSource
): FocusFireInsight {
  const artillery = Math.round(
    source.artilleryCount * FOCUS_FIRE_WEIGHTS.artillery
  );
  const aircraft = Math.round(
    source.aircraftCount * FOCUS_FIRE_WEIGHTS.aircraft
  );
  const armor = Math.round(source.armorCount * FOCUS_FIRE_WEIGHTS.armor);
  const weaponsInFlight = Math.round(
    source.weaponsInFlight * FOCUS_FIRE_WEIGHTS.weaponsInFlight
  );
  const captureProgress = Math.round(
    source.captureProgress * FOCUS_FIRE_WEIGHTS.captureProgress
  );
  const total = clamp(
    artillery + aircraft + armor + weaponsInFlight + captureProgress,
    0,
    100
  );
  const dominantAxis = getFocusFireDominantAxis(source);

  return {
    shockIndex: total,
    intensityLabel: getFocusFireIntensityLabel(total),
    dominantAxis,
    breakdown: {
      artillery,
      aircraft,
      armor,
      weaponsInFlight,
      captureProgress,
      total,
    },
    summary: buildFocusFireSummaryText(source, total, dominantAxis),
  };
}

function buildSideOutcomeSummary(
  game: Game,
  sideId: string
): SimulationOutcomeSideSummary {
  const scenario = game.currentScenario;
  const logs = game.simulationLogs.getLogs([sideId]);
  const aircraft = scenario.aircraft.filter((unit) => unit.sideId === sideId);
  const ships = scenario.ships.filter((unit) => unit.sideId === sideId);
  const facilities = scenario.facilities.filter(
    (unit) => unit.sideId === sideId
  );
  const airbases = scenario.airbases.filter((unit) => unit.sideId === sideId);
  const weaponInventory =
    aircraft.reduce((sum, unit) => sum + unit.getTotalWeaponQuantity(), 0) +
    ships.reduce((sum, unit) => sum + unit.getTotalWeaponQuantity(), 0) +
    facilities.reduce((sum, unit) => sum + unit.getTotalWeaponQuantity(), 0);
  const remainingCombatUnits =
    aircraft.length + ships.length + facilities.length + airbases.length;
  const remainingCombatPower = Math.round(
    aircraft.length * 4 +
      ships.length * 5 +
      facilities.length * 3 +
      airbases.length * 4 +
      Math.min(weaponInventory, 60) * 0.2
  );

  return {
    sideId,
    name: scenario.getSideName(sideId),
    score: scenario.getSide(sideId)?.totalScore ?? 0,
    remainingCombatUnits,
    remainingCombatPower,
    aircraft: aircraft.length,
    ships: ships.length,
    facilities: facilities.length,
    airbases: airbases.length,
    weaponInventory,
    confirmedHits: logs.filter(
      (log) => log.type === SimulationLogType.WEAPON_HIT
    ).length,
    launches: logs.filter(
      (log) => log.type === SimulationLogType.WEAPON_LAUNCHED
    ).length,
    missionSuccesses: logs.filter(
      (log) =>
        log.type === SimulationLogType.STRIKE_MISSION_SUCCESS ||
        log.type === SimulationLogType.PATROL_MISSION_SUCCESS
    ).length,
  };
}

function compareOutcomeSides(
  left: SimulationOutcomeSideSummary,
  right: SimulationOutcomeSideSummary
) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }
  if (right.remainingCombatPower !== left.remainingCombatPower) {
    return right.remainingCombatPower - left.remainingCombatPower;
  }
  if (right.confirmedHits !== left.confirmedHits) {
    return right.confirmedHits - left.confirmedHits;
  }
  return left.name.localeCompare(right.name, "ko");
}

function buildWinnerBasis(
  leader: SimulationOutcomeSideSummary,
  runnerUp?: SimulationOutcomeSideSummary
) {
  if (!runnerUp) {
    return "단독 생존 전력";
  }
  if (leader.score !== runnerUp.score) {
    return `점수 ${leader.score - runnerUp.score}점 우세`;
  }
  if (leader.remainingCombatPower !== runnerUp.remainingCombatPower) {
    return `잔존 전력 ${leader.remainingCombatPower - runnerUp.remainingCombatPower} 우세`;
  }
  if (leader.confirmedHits !== runnerUp.confirmedHits) {
    return `유효타 ${leader.confirmedHits - runnerUp.confirmedHits}회 우세`;
  }
  return "판정 불가";
}

function buildOutcomeFallbackSummary(summary: SimulationOutcomeSummary) {
  const leader = summary.sides[0];
  const runnerUp = summary.sides[1];
  const recentLog = summary.recentLogs[0];

  if (!leader) {
    return "전투 결과를 정리할 수 있는 세력 정보가 없습니다.";
  }

  if (summary.isTie || !summary.winnerName) {
    if (!runnerUp) {
      return `${leader.name}만 남아 있어 전장을 단독 통제 중입니다.`;
    }
    return `${leader.name}와 ${runnerUp.name}이(가) 사실상 무승부로 종료됐습니다. 점수 ${leader.score}점 동률이며 잔존 전력도 큰 차이가 없습니다.`;
  }

  const headline = `${summary.winnerName} 우세로 시뮬레이션이 종료됐습니다. ${summary.winnerBasis}.`;
  const detail = runnerUp
    ? `점수 ${leader.score} 대 ${runnerUp.score}, 잔존 전력 ${leader.remainingCombatUnits} 대 ${runnerUp.remainingCombatUnits}입니다.`
    : `현재 잔존 전력은 ${leader.remainingCombatUnits}개 전투 단위입니다.`;

  if (!recentLog) {
    return `${headline} ${detail}`;
  }

  return `${headline} ${detail} 마지막 주요 기록은 "${recentLog}"입니다.`;
}

export function buildSimulationOutcomeSummary(
  game: Game
): SimulationOutcomeSummary {
  const scenario = game.currentScenario;
  const rankedSides = scenario.sides
    .map((side) => buildSideOutcomeSummary(game, side.id))
    .sort(compareOutcomeSides);
  const leader = rankedSides[0];
  const runnerUp = rankedSides[1];
  const winnerBasis = leader ? buildWinnerBasis(leader, runnerUp) : "판정 불가";
  const winnerName =
    leader &&
    (!runnerUp ||
      leader.score !== runnerUp.score ||
      leader.remainingCombatPower !== runnerUp.remainingCombatPower ||
      leader.confirmedHits !== runnerUp.confirmedHits)
      ? leader.name
      : null;
  const isTie = winnerName === null && rankedSides.length > 1;
  const scoreGap =
    leader && runnerUp ? Math.abs(leader.score - runnerUp.score) : 0;

  const summary: SimulationOutcomeSummary = {
    scenarioName: scenario.name,
    endReason:
      scenario.currentTime >= scenario.endTime
        ? "시나리오 종료 시간 도달"
        : "교전 종결",
    endedAtUnix: scenario.currentTime,
    endedAtLabel: unixToLocalTime(scenario.currentTime),
    winnerName,
    winnerBasis,
    isTie,
    scoreGap,
    sides: rankedSides,
    recentLogs: game.simulationLogs
      .getLogs()
      .slice(-4)
      .reverse()
      .map((log) => {
        const sideName = scenario.getSideName(log.sideId);
        return `${unixToLocalTime(log.timestamp)} [${sideName}] ${log.message}`;
      }),
    fallbackSummary: "",
  };

  summary.fallbackSummary = buildOutcomeFallbackSummary(summary);
  return summary;
}

function buildSimulationOutcomePrompt(summary: SimulationOutcomeSummary) {
  return [
    "아래는 FireScope 전투 종료 요약입니다.",
    "승자 또는 무승부를 첫 문장에 명확히 말하고, 점수/잔존 전력/유효타 중 근거가 되는 2개 정도만 짚어 주세요.",
    "최대 3문장, 한국어, 간결하게 작성하세요.",
    "",
    JSON.stringify(summary, null, 2),
  ].join("\n");
}

function buildSimulationOutcomeMessages(
  summary: SimulationOutcomeSummary
): LlmMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are FireScope's battle outcome analyst.",
        "Always answer in Korean.",
        "Use only the provided structured summary.",
        "State the winner or a draw first.",
        "Be concise and operationally focused.",
      ].join("\n"),
    },
    {
      role: "user",
      content: buildSimulationOutcomePrompt(summary),
    },
  ];
}

function isUsableAssistantResponse(result: AssistantCompletionResult) {
  return result.ok && Boolean(result.text?.trim());
}

export async function requestSimulationOutcomeNarrative(
  summary: SimulationOutcomeSummary
): Promise<SimulationOutcomeNarrative> {
  const result = await requestAssistantCompletionResult(
    buildSimulationOutcomeMessages(summary)
  );

  if (isUsableAssistantResponse(result)) {
    return {
      text: result.text!.trim(),
      source: "llm",
    };
  }

  return {
    text: summary.fallbackSummary,
    source: "fallback",
  };
}
