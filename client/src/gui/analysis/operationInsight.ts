import type Game from "@/game/Game";
import type { FocusFireSummary } from "@/game/Game";
import {
  SimulationLogType,
  type SimulationLog,
} from "@/game/log/SimulationLogs";
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

const MAX_RECENT_REPORT_LOGS = 6;
const MAX_REPORT_ITEMS = 3;
const MAX_TURNING_POINTS = 4;

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
  misses: number;
  weaponLosses: number;
  aircraftLosses: number;
  returnToBaseEvents: number;
  abortedMissions: number;
  strikeMissionSuccesses: number;
  patrolMissionSuccesses: number;
  missionSuccesses: number;
}

export interface SimulationOutcomeTurningPoint {
  id: string;
  headline: string;
  detail: string;
  sideName: string;
  category: "strike" | "mission" | "loss" | "withdrawal" | "control" | "other";
  importanceLabel: "높음" | "보통";
  occurredAtUnix: number;
  occurredAtLabel: string;
}

export interface SimulationOutcomeSideAssessment {
  sideId: string;
  name: string;
  combatPosture: string;
  engagementEfficiencyLabel: string;
  hitRate: number | null;
  hitRateLabel: string;
  strengths: string[];
  concerns: string[];
}

export interface SimulationOutcomeReport {
  headline: string;
  executiveSummary: string;
  decisiveFactors: string[];
  sideAssessments: SimulationOutcomeSideAssessment[];
  turningPoints: SimulationOutcomeTurningPoint[];
  operationalRisks: string[];
  recommendations: string[];
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
  report: SimulationOutcomeReport;
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

function takeUnique(values: string[], limit: number = MAX_REPORT_ITEMS) {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

function getHitRate(side: SimulationOutcomeSideSummary) {
  if (side.launches <= 0) {
    return null;
  }
  return side.confirmedHits / side.launches;
}

function formatHitRateLabel(hitRate: number | null) {
  if (hitRate === null) {
    return "교전 제한";
  }
  return `${Math.round(hitRate * 100)}%`;
}

function getEngagementEfficiencyLabel(side: SimulationOutcomeSideSummary) {
  const hitRate = getHitRate(side);
  if (side.launches <= 0) {
    return "교전 제한";
  }
  if (hitRate !== null && hitRate >= 0.5) {
    return "정밀 타격";
  }
  if (hitRate !== null && hitRate >= 0.3) {
    return "유효";
  }
  if (side.confirmedHits > 0) {
    return "소모적";
  }
  return "불발";
}

function formatSignedNumber(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function buildScoreDeltaText(log: SimulationLog) {
  const metadata = log.metadata;
  if (!metadata) {
    return "";
  }
  const actorDelta = metadata.actorScoreDelta;
  const targetDelta = metadata.targetScoreDelta;

  if (actorDelta && targetDelta) {
    return `점수 ${formatSignedNumber(actorDelta)} / 상대 ${formatSignedNumber(
      targetDelta
    )}`;
  }
  if (actorDelta) {
    return `점수 ${formatSignedNumber(actorDelta)}`;
  }
  if (targetDelta) {
    return `상대 점수 ${formatSignedNumber(targetDelta)}`;
  }
  return "";
}

function withScoreSuffix(baseText: string, log: SimulationLog) {
  const scoreText = buildScoreDeltaText(log);
  return scoreText ? `${baseText} ${scoreText}.` : baseText;
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
  const confirmedHits = logs.filter(
    (log) => log.type === SimulationLogType.WEAPON_HIT
  ).length;
  const launches = logs.filter(
    (log) => log.type === SimulationLogType.WEAPON_LAUNCHED
  ).length;
  const misses = logs.filter(
    (log) => log.type === SimulationLogType.WEAPON_MISSED
  ).length;
  const weaponLosses = logs.filter(
    (log) => log.type === SimulationLogType.WEAPON_CRASHED
  ).length;
  const aircraftLosses = logs.filter(
    (log) => log.type === SimulationLogType.AIRCRAFT_CRASHED
  ).length;
  const returnToBaseEvents = logs.filter(
    (log) => log.type === SimulationLogType.RETURN_TO_BASE
  ).length;
  const strikeMissionSuccesses = logs.filter(
    (log) => log.type === SimulationLogType.STRIKE_MISSION_SUCCESS
  ).length;
  const patrolMissionSuccesses = logs.filter(
    (log) => log.type === SimulationLogType.PATROL_MISSION_SUCCESS
  ).length;
  const abortedMissions = logs.filter(
    (log) => log.type === SimulationLogType.STRIKE_MISSION_ABORTED
  ).length;

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
    confirmedHits,
    launches,
    misses,
    weaponLosses,
    aircraftLosses,
    returnToBaseEvents,
    abortedMissions,
    strikeMissionSuccesses,
    patrolMissionSuccesses,
    missionSuccesses: strikeMissionSuccesses + patrolMissionSuccesses,
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

function buildCombatPosture(
  side: SimulationOutcomeSideSummary,
  summary: SimulationOutcomeSummary
) {
  const leader = summary.sides[0];
  if (!leader) {
    return "판정 대기";
  }
  if (summary.winnerName && side.sideId === leader.sideId) {
    return summary.scoreGap >= 100 ? "우세 고착" : "근소 우세";
  }
  if (summary.isTie) {
    return "경합 유지";
  }
  if (side.launches > 0 && side.confirmedHits > 0) {
    return "공세 유지";
  }
  if (side.returnToBaseEvents > 0 || side.abortedMissions > 0) {
    return "재정비 필요";
  }
  return "수세 전환";
}

function buildSideStrengths(
  side: SimulationOutcomeSideSummary,
  summary: SimulationOutcomeSummary
) {
  const averageWeaponInventory =
    summary.sides.reduce(
      (total, current) => total + current.weaponInventory,
      0
    ) / Math.max(summary.sides.length, 1);
  const maxCombatPower = Math.max(
    ...summary.sides.map((current) => current.remainingCombatPower),
    0
  );
  const hitRate = getHitRate(side);
  const strengths: string[] = [];

  if (summary.winnerName && summary.winnerName === side.name) {
    strengths.push(
      `${summary.winnerBasis}를 바탕으로 최종 판정 우세를 확보했습니다.`
    );
  }
  if (
    maxCombatPower > 0 &&
    side.remainingCombatPower >= Math.max(1, maxCombatPower * 0.9)
  ) {
    strengths.push(
      `잔존 전투력 ${side.remainingCombatPower}와 전투 단위 ${side.remainingCombatUnits}개를 유지했습니다.`
    );
  }
  if (side.launches >= 2 && hitRate !== null && hitRate >= 0.5) {
    strengths.push(
      `발사 ${side.launches}회 중 ${side.confirmedHits}회를 유효타로 연결해 효율이 높았습니다.`
    );
  }
  if (side.missionSuccesses > 0) {
    strengths.push(
      `임무 성과 ${side.missionSuccesses}회를 확보해 작전 축을 유지했습니다.`
    );
  }
  if (
    side.weaponInventory >= Math.max(8, averageWeaponInventory) &&
    side.weaponInventory > 0
  ) {
    strengths.push(
      `잔여 무장 ${side.weaponInventory}발로 후속 타격 여력을 남겼습니다.`
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      `잔존 전력 ${side.remainingCombatUnits}개를 유지하며 추가 교전 기반은 남아 있습니다.`
    );
  }

  return takeUnique(strengths);
}

function buildSideConcerns(
  side: SimulationOutcomeSideSummary,
  summary: SimulationOutcomeSummary
) {
  const leader = summary.sides[0];
  const hitRate = getHitRate(side);
  const concerns: string[] = [];

  if (side.launches >= 2 && hitRate !== null && hitRate < 0.25) {
    concerns.push(
      `발사 ${side.launches}회 대비 유효타 ${side.confirmedHits}회로 타격 효율이 낮았습니다.`
    );
  }
  if (side.aircraftLosses > 0) {
    concerns.push(
      `항공 손실 ${side.aircraftLosses}건이 발생해 공중 압박 유지가 어려워졌습니다.`
    );
  }
  if (side.weaponLosses > side.confirmedHits && side.weaponLosses > 0) {
    concerns.push(
      `유효타보다 무장 손실이 많아 화력 소모가 빠르게 진행됐습니다.`
    );
  }
  if (side.returnToBaseEvents > 0 || side.abortedMissions > 0) {
    concerns.push(
      `복귀 ${side.returnToBaseEvents}건, 임무 중단 ${side.abortedMissions}건으로 공세 지속성이 흔들렸습니다.`
    );
  }
  if (leader && leader.sideId !== side.sideId) {
    concerns.push(`선두 대비 점수 ${leader.score - side.score}점 열세입니다.`);
  }
  if (side.weaponInventory <= 4 && side.launches > 0) {
    concerns.push(
      `잔여 무장이 ${side.weaponInventory}발 수준이라 후속 타격 폭이 좁습니다.`
    );
  }

  if (concerns.length === 0) {
    concerns.push(
      "이번 교전에서 두드러진 약점은 제한적이었지만 세부 손실 데이터는 더 필요합니다."
    );
  }

  return takeUnique(concerns);
}

function buildSideAssessments(
  summary: SimulationOutcomeSummary
): SimulationOutcomeSideAssessment[] {
  return summary.sides.map((side) => {
    const hitRate = getHitRate(side);
    return {
      sideId: side.sideId,
      name: side.name,
      combatPosture: buildCombatPosture(side, summary),
      engagementEfficiencyLabel: getEngagementEfficiencyLabel(side),
      hitRate,
      hitRateLabel: formatHitRateLabel(hitRate),
      strengths: buildSideStrengths(side, summary),
      concerns: buildSideConcerns(side, summary),
    };
  });
}

function getTurningPointPriority(type: SimulationLogType) {
  switch (type) {
    case SimulationLogType.STRIKE_MISSION_SUCCESS:
      return 100;
    case SimulationLogType.WEAPON_HIT:
      return 90;
    case SimulationLogType.AIRCRAFT_CRASHED:
      return 88;
    case SimulationLogType.STRIKE_MISSION_ABORTED:
      return 82;
    case SimulationLogType.RETURN_TO_BASE:
      return 72;
    case SimulationLogType.WEAPON_CRASHED:
      return 65;
    case SimulationLogType.WEAPON_MISSED:
      return 55;
    case SimulationLogType.PATROL_MISSION_SUCCESS:
      return 50;
    default:
      return 0;
  }
}

function getTurningPointCategory(
  type: SimulationLogType
): SimulationOutcomeTurningPoint["category"] {
  switch (type) {
    case SimulationLogType.WEAPON_HIT:
      return "strike";
    case SimulationLogType.STRIKE_MISSION_SUCCESS:
    case SimulationLogType.STRIKE_MISSION_ABORTED:
      return "mission";
    case SimulationLogType.AIRCRAFT_CRASHED:
    case SimulationLogType.WEAPON_CRASHED:
      return "loss";
    case SimulationLogType.RETURN_TO_BASE:
      return "withdrawal";
    case SimulationLogType.PATROL_MISSION_SUCCESS:
      return "control";
    default:
      return "other";
  }
}

function buildTurningPointDetail(log: SimulationLog, sideName: string) {
  const metadata = log.metadata;

  switch (log.type) {
    case SimulationLogType.WEAPON_HIT:
      if (metadata?.resultTag === "kill" && metadata.targetName) {
        return withScoreSuffix(
          `${sideName}이 ${metadata.targetName} 격파에 성공해 전력 균형을 흔든 장면입니다.`,
          log
        );
      }
      if (
        metadata?.resultTag === "damage" &&
        metadata.targetName &&
        metadata.damage !== undefined
      ) {
        const hpText =
          metadata.remainingHp !== undefined && metadata.maxHp !== undefined
            ? ` 잔여 HP ${metadata.remainingHp.toFixed(0)}/${metadata.maxHp.toFixed(0)}입니다.`
            : "";
        return withScoreSuffix(
          `${sideName}이 ${metadata.targetName}에 피해 ${metadata.damage.toFixed(
            0
          )}를 가한 장면입니다.${hpText}`,
          log
        );
      }
      if (metadata?.objectiveName) {
        return `${sideName} 화력이 ${metadata.objectiveName} 축에 도달해 전장을 흔든 장면입니다.`;
      }
      return `${sideName}이 유효타를 기록해 전력 균형을 흔든 장면입니다.`;
    case SimulationLogType.STRIKE_MISSION_SUCCESS:
      if (metadata?.missionName) {
        return withScoreSuffix(
          `${sideName}이 임무 '${metadata.missionName}'을 완료해 목표 축을 유지한 구간입니다.`,
          log
        );
      }
      if (metadata?.objectiveName) {
        return `${sideName}이 ${metadata.objectiveName}을(를) 확보하며 통제권을 강화한 구간입니다.`;
      }
      return `${sideName}이 목표 축을 유지하며 점수와 통제권을 동시에 확보한 구간입니다.`;
    case SimulationLogType.STRIKE_MISSION_ABORTED:
      if (metadata?.missionName) {
        return `${sideName}의 임무 '${metadata.missionName}'이 중단되며 후속 압박이 약해진 시점입니다.`;
      }
      return `${sideName}의 공격 흐름이 끊기며 후속 압박이 약해진 시점입니다.`;
    case SimulationLogType.AIRCRAFT_CRASHED:
      if (metadata?.actorName) {
        return withScoreSuffix(
          `${sideName} 항공기 ${metadata.actorName} 손실로 공중전 주도권이 흔들린 장면입니다.`,
          log
        );
      }
      return `${sideName} 항공 전력이 감소해 공중전 주도권이 흔들린 장면입니다.`;
    case SimulationLogType.RETURN_TO_BASE:
      if (metadata?.actorName && metadata?.destinationName) {
        return `${sideName} 전력 ${metadata.actorName}이 ${metadata.destinationName}(으)로 빠지며 즉시 화력이 줄어든 시점입니다.`;
      }
      return `${sideName} 전력이 재정비 단계로 들어가며 즉시 화력이 줄어든 시점입니다.`;
    case SimulationLogType.WEAPON_CRASHED:
      if (metadata?.resultTag === "fuel_loss" && metadata.weaponName) {
        return withScoreSuffix(
          `${sideName} 무장 ${metadata.weaponName}이 연료 부족으로 소멸해 압박 효율이 낮아진 장면입니다.`,
          log
        );
      }
      if (metadata?.resultTag === "target_lost" && metadata.weaponName) {
        return `${sideName} 무장 ${metadata.weaponName}이 표적을 놓치며 타격 흐름이 끊긴 장면입니다.`;
      }
      return `${sideName} 화력이 유효타 없이 소멸해 압박 효율이 낮아진 장면입니다.`;
    case SimulationLogType.WEAPON_MISSED:
      if (metadata?.targetName) {
        return `${sideName}의 ${metadata.targetName} 대상 타격이 성과로 이어지지 않아 후속 교전 부담이 커졌습니다.`;
      }
      return `${sideName}의 타격이 성과로 이어지지 않아 후속 교전 부담이 커졌습니다.`;
    case SimulationLogType.PATROL_MISSION_SUCCESS:
      if (metadata?.missionName) {
        return withScoreSuffix(
          `${sideName}이 초계 임무 '${metadata.missionName}'을 유지하며 공역 감시 축을 지킨 구간입니다.`,
          log
        );
      }
      return `${sideName}이 공역 감시와 통제 축을 유지한 구간입니다.`;
    default:
      return `${sideName} 전황에 의미 있는 변화가 발생한 시점입니다.`;
  }
}

function buildTurningPoints(
  summary: SimulationOutcomeSummary,
  logs: SimulationLog[]
): SimulationOutcomeTurningPoint[] {
  const sideNameById = new Map(
    summary.sides.map((side) => [side.sideId, side.name] as const)
  );
  const rankedLogs = logs
    .map((log) => ({
      log,
      priority: getTurningPointPriority(log.type),
    }))
    .filter((entry) => entry.priority > 0)
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }
      return right.log.timestamp - left.log.timestamp;
    });

  const seenMessages = new Set<string>();
  const turningPoints: SimulationOutcomeTurningPoint[] = [];

  for (const entry of rankedLogs) {
    if (seenMessages.has(entry.log.message)) {
      continue;
    }
    seenMessages.add(entry.log.message);
    const sideName = sideNameById.get(entry.log.sideId) ?? entry.log.sideId;
    turningPoints.push({
      id: entry.log.id,
      headline: entry.log.message,
      detail: buildTurningPointDetail(entry.log, sideName),
      sideName,
      category: getTurningPointCategory(entry.log.type),
      importanceLabel: entry.priority >= 80 ? "높음" : "보통",
      occurredAtUnix: entry.log.timestamp,
      occurredAtLabel: unixToLocalTime(entry.log.timestamp),
    });
    if (turningPoints.length >= MAX_TURNING_POINTS) {
      break;
    }
  }

  return turningPoints;
}

function buildDecisiveFactors(
  summary: SimulationOutcomeSummary,
  logs: SimulationLog[]
) {
  const leader = summary.sides[0];
  const runnerUp = summary.sides[1];
  const recentObjectiveLog = [...logs]
    .reverse()
    .find(
      (log) =>
        log.metadata?.resultTag === "mission_success" ||
        log.metadata?.resultTag === "objective_secured"
    );
  const recentKillLog = [...logs]
    .reverse()
    .find(
      (log) => log.metadata?.resultTag === "kill" && log.metadata.targetName
    );

  if (!leader) {
    return ["세력 정보 부족"];
  }

  if (summary.isTie || !summary.winnerName) {
    const combatPowerDelta =
      runnerUp && leader.remainingCombatPower !== runnerUp.remainingCombatPower
        ? `잔존 전투력 차 ${Math.abs(
            leader.remainingCombatPower - runnerUp.remainingCombatPower
          )}`
        : runnerUp
          ? "잔존 전투력 동일"
          : "";

    return takeUnique([
      summary.scoreGap === 0 ? "점수 동률" : `점수 차 ${summary.scoreGap}점`,
      combatPowerDelta,
      "결정타 부족",
    ]);
  }

  return takeUnique([
    recentObjectiveLog?.metadata?.missionName
      ? `임무 '${recentObjectiveLog.metadata.missionName}' 달성`
      : recentObjectiveLog?.metadata?.objectiveName
        ? `목표 ${recentObjectiveLog.metadata.objectiveName} 확보`
        : "",
    recentKillLog?.metadata?.targetName
      ? `${recentKillLog.metadata.targetName} 격파`
      : "",
    runnerUp ? `점수 ${summary.scoreGap}점 차 우세` : summary.winnerBasis,
    runnerUp
      ? `잔존 전투력 ${leader.remainingCombatPower - runnerUp.remainingCombatPower} 우세`
      : `잔존 전투력 ${leader.remainingCombatPower}`,
    leader.confirmedHits > 0 ? `유효타 ${leader.confirmedHits}회 주도` : "",
    leader.missionSuccesses > 0
      ? `임무 성과 ${leader.missionSuccesses}회 확보`
      : "",
  ]);
}

function buildOperationalRisks(summary: SimulationOutcomeSummary) {
  const leader = summary.sides[0];
  const runnerUp = summary.sides[1];
  const risks: string[] = [];

  if (summary.isTie) {
    risks.push(
      "점수와 잔존 전력 차가 작아 동일 조건 재교전 시 결과가 쉽게 뒤집힐 수 있습니다."
    );
  }
  if (runnerUp && summary.scoreGap > 0 && summary.scoreGap <= 60) {
    risks.push(
      `점수 차가 ${summary.scoreGap}점에 불과해 후속 유효타 한 번에 판정이 바뀔 수 있습니다.`
    );
  }
  if (leader) {
    const leaderHitRate = getHitRate(leader);
    if (
      leader.launches >= 2 &&
      leaderHitRate !== null &&
      leaderHitRate < 0.35
    ) {
      risks.push(
        `${leader.name}도 발사 대비 명중 효율이 낮아 장기전에서는 소모가 커질 수 있습니다.`
      );
    }
    if (leader.weaponInventory <= 6 && leader.weaponInventory > 0) {
      risks.push(
        `${leader.name}의 잔여 무장이 ${leader.weaponInventory}발 수준이라 추격 여력이 제한적입니다.`
      );
    }
  }
  const unstableSide = summary.sides.find(
    (side) => side.returnToBaseEvents > 0 || side.abortedMissions > 0
  );
  if (unstableSide) {
    risks.push(
      `${unstableSide.name}은(는) 복귀 또는 임무 중단 기록이 있어 공세 지속성이 약합니다.`
    );
  }

  if (risks.length === 0) {
    risks.push(
      "이번 결과는 정리됐지만 손실 원인과 교전별 점수 변동 추적은 아직 제한적입니다."
    );
  }

  return takeUnique(risks);
}

function buildRecommendations(summary: SimulationOutcomeSummary) {
  const leader = summary.sides[0];
  const runnerUp = summary.sides[1];

  if (!leader) {
    return ["세력 데이터가 부족해 후속 권고를 생성하지 못했습니다."];
  }

  if (summary.isTie || !summary.winnerName) {
    return takeUnique([
      "정찰과 감시 축을 먼저 복원해 다음 교전의 표적 우선순위를 재설정해야 합니다.",
      "분산 발사보다 고가치 표적 1~2개에 동시 타격을 집중해 결정타를 만들어야 합니다.",
      "복귀 중인 전력과 잔여 무장을 재편성해 다음 교전의 지속 시간을 늘려야 합니다.",
    ]);
  }

  return takeUnique([
    `${leader.name}은(는) 잔존 화력을 보전하면서 고가치 표적 위주로 우세를 굳혀야 합니다.`,
    leader.weaponInventory <= 6
      ? `${leader.name}은(는) 재무장 주기를 먼저 정리해 우세가 끊기지 않도록 해야 합니다.`
      : "",
    runnerUp
      ? `${runnerUp.name}은(는) 임무 중단과 낮은 효율 구간을 복구한 뒤 단일 공격 축으로 다시 압박해야 합니다.`
      : "",
  ]);
}

function buildReportHeadline(summary: SimulationOutcomeSummary) {
  if (summary.isTie || !summary.winnerName) {
    return `${summary.scenarioName} 결과: 무승부`;
  }
  return `${summary.scenarioName} 결과: ${summary.winnerName} 우세`;
}

function buildExecutiveSummary(
  summary: SimulationOutcomeSummary,
  decisiveFactors: string[],
  turningPoints: SimulationOutcomeTurningPoint[]
) {
  const firstFactor = decisiveFactors[0];
  const turningPoint = turningPoints[0];

  if (summary.isTie || !summary.winnerName) {
    if (turningPoint) {
      return `전투는 무승부로 종료됐습니다. 핵심 배경은 ${firstFactor}이며, 가장 큰 전환점은 "${turningPoint.headline}"입니다.`;
    }
    return `전투는 무승부로 종료됐습니다. 핵심 배경은 ${firstFactor}입니다.`;
  }

  if (turningPoint) {
    return `${summary.winnerName} 우세로 종료됐습니다. 핵심 요인은 ${firstFactor}이며, 결정적 장면은 "${turningPoint.headline}"입니다.`;
  }

  return `${summary.winnerName} 우세로 종료됐습니다. 핵심 요인은 ${firstFactor}입니다.`;
}

function buildSimulationOutcomeReport(
  summary: SimulationOutcomeSummary,
  logs: SimulationLog[]
): SimulationOutcomeReport {
  const decisiveFactors = buildDecisiveFactors(summary, logs);
  const turningPoints = buildTurningPoints(summary, logs);

  return {
    headline: buildReportHeadline(summary),
    executiveSummary: buildExecutiveSummary(
      summary,
      decisiveFactors,
      turningPoints
    ),
    decisiveFactors,
    sideAssessments: buildSideAssessments(summary),
    turningPoints,
    operationalRisks: buildOperationalRisks(summary),
    recommendations: buildRecommendations(summary),
  };
}

function buildOutcomeFallbackSummary(summary: SimulationOutcomeSummary) {
  const leader = summary.sides[0];
  const runnerUp = summary.sides[1];
  const recentLog = summary.recentLogs[0];
  const decisiveFactor = summary.report.decisiveFactors[0];

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
  const factorText = decisiveFactor
    ? ` 핵심 요인은 ${decisiveFactor}입니다.`
    : "";

  if (!recentLog) {
    return `${headline} ${detail}${factorText}`;
  }

  return `${headline} ${detail}${factorText} 마지막 주요 기록은 "${recentLog}"입니다.`;
}

export function buildSimulationOutcomeSummary(
  game: Game
): SimulationOutcomeSummary {
  const scenario = game.currentScenario;
  const allLogs = game.simulationLogs.getLogs();
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
    recentLogs: allLogs
      .slice(-MAX_RECENT_REPORT_LOGS)
      .reverse()
      .map((log) => {
        const sideName = scenario.getSideName(log.sideId);
        return `${unixToLocalTime(log.timestamp)} [${sideName}] ${log.message}`;
      }),
    report: {
      headline: "",
      executiveSummary: "",
      decisiveFactors: [],
      sideAssessments: [],
      turningPoints: [],
      operationalRisks: [],
      recommendations: [],
    },
    fallbackSummary: "",
  };

  summary.report = buildSimulationOutcomeReport(summary, allLogs);
  summary.fallbackSummary = buildOutcomeFallbackSummary(summary);
  return summary;
}

function buildSimulationOutcomePrompt(summary: SimulationOutcomeSummary) {
  return [
    "아래는 FireScope 전투 종료 요약입니다.",
    "승자 또는 무승부를 첫 문장에 명확히 말하고, 점수/잔존 전력/유효타 중 근거가 되는 2개 정도만 짚어 주세요.",
    "report.executiveSummary, decisiveFactors, turningPoints를 우선 활용하세요.",
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
