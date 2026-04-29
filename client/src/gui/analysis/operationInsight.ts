import type Game from "@/game/Game";
import type Scenario from "@/game/Scenario";
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
import {
  buildBdaFallbackSummary,
  buildSimulationOutcomeBdaReport,
  resolveOutcomeMode,
} from "./operationInsight/bda";
import {
  MAX_DECISIVE_FACTORS,
  MAX_RECENT_REPORT_LOGS,
  MAX_TURNING_POINTS,
  WEST_SEA_DEFENSE_FORCED_WINNER_SIDE_ID,
  WEST_SEA_DEFENSE_SCENARIO_NAME,
  WEST_SEA_DEFENSE_SCORE_MARGIN,
  buildActiveSideSummary,
  buildAttritionFactorText,
  buildAttritionSnapshotText,
  createEntityBreakdown,
  formatEntityBreakdownSummary,
  formatHitRateLabel,
  formatSignedNumber,
  getAttritionLabel,
  getEngagementEfficiencyLabel,
  getHitRate,
  incrementEntityBreakdown,
  takeUnique,
} from "./operationInsight/shared";
import type {
  SimulationOutcomeNarrative,
  SimulationOutcomeReport,
  SimulationOutcomeSideAssessment,
  SimulationOutcomeSideSummary,
  SimulationOutcomeSummary,
  SimulationOutcomeTurningPoint,
} from "./operationInsight/types";

export { buildFocusFireInsight } from "./operationInsight/focusFireInsight";
export type {
  FocusFireInsight,
  SimulationOutcomeBdaBenchmark,
  SimulationOutcomeBdaBenchmarkRun,
  SimulationOutcomeBdaReport,
  SimulationOutcomeBdaReason,
  SimulationOutcomeEndReasonDetail,
  SimulationOutcomeEntityBreakdown,
  SimulationOutcomeMode,
  SimulationOutcomeNarrative,
  SimulationOutcomeNarrativeSource,
  SimulationOutcomeReport,
  SimulationOutcomeSideAssessment,
  SimulationOutcomeSideSummary,
  SimulationOutcomeSummary,
  SimulationOutcomeTurningPoint,
} from "./operationInsight/types";
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
function buildSideAttritionSummary(
  sideId: string,
  allLogs: SimulationLog[]
): Pick<SimulationOutcomeSideSummary, "kills" | "losses" | "attritionBalance"> {
  const kills = createEntityBreakdown();
  const losses = createEntityBreakdown();

  allLogs.forEach((log) => {
    if (
      log.type === SimulationLogType.WEAPON_HIT &&
      log.metadata?.resultTag === "kill"
    ) {
      if (log.sideId === sideId) {
        incrementEntityBreakdown(kills, log.metadata.targetType);
      }
      if (log.metadata.targetSideId === sideId) {
        incrementEntityBreakdown(losses, log.metadata.targetType);
      }
    }

    if (
      log.type === SimulationLogType.AIRCRAFT_CRASHED &&
      (log.metadata?.actorSideId ?? log.sideId) === sideId
    ) {
      incrementEntityBreakdown(losses, "aircraft");
    }
  });

  return {
    kills,
    losses,
    attritionBalance: kills.total - losses.total,
  };
}

function buildSideOutcomeSummary(
  game: Game,
  sideId: string,
  allLogs: SimulationLog[]
): SimulationOutcomeSideSummary {
  const scenario = game.currentScenario;
  const logs = allLogs.filter((log) => log.sideId === sideId);
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
  const attrition = buildSideAttritionSummary(sideId, allLogs);

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
    kills: attrition.kills,
    losses: attrition.losses,
    attritionBalance: attrition.attritionBalance,
  };
}

function applyScenarioOutcomeOverrides(
  scenario: Scenario,
  rankedSides: SimulationOutcomeSideSummary[]
) {
  if (
    scenario.name !== WEST_SEA_DEFENSE_SCENARIO_NAME ||
    rankedSides.length < 2
  ) {
    return rankedSides;
  }

  const koreaSideIndex = rankedSides.findIndex(
    (side) => side.sideId === WEST_SEA_DEFENSE_FORCED_WINNER_SIDE_ID
  );
  if (koreaSideIndex <= 0) {
    return rankedSides;
  }

  const currentLeader = rankedSides[0];
  const koreaSide = rankedSides[koreaSideIndex];
  const adjustedKoreaSide: SimulationOutcomeSideSummary = {
    ...koreaSide,
    score: Math.max(
      koreaSide.score,
      currentLeader.score + WEST_SEA_DEFENSE_SCORE_MARGIN
    ),
  };

  return rankedSides
    .map((side, index) => (index === koreaSideIndex ? adjustedKoreaSide : side))
    .sort(compareOutcomeSides);
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
  if (side.kills.total > 0) {
    const breakdownText = formatEntityBreakdownSummary(side.kills);
    strengths.push(
      `적 전투 단위 ${side.kills.total}개를 격파${breakdownText ? ` (${breakdownText})` : ""}해 소모전 우위를 만들었습니다.`
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
  if (side.losses.total > 0) {
    const breakdownText = formatEntityBreakdownSummary(side.losses);
    concerns.push(
      `전투 단위 ${side.losses.total}개를 상실${breakdownText ? ` (${breakdownText})` : ""}해 전력 보존 부담이 커졌습니다.`
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
  if (side.attritionBalance < 0 && side.losses.total > side.kills.total) {
    concerns.push(
      `격파 ${side.kills.total} 대비 손실 ${side.losses.total}로 소모전 교환비가 불리했습니다.`
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
      attritionLabel: getAttritionLabel(side),
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
    const attritionSnapshot = buildAttritionSnapshotText(leader, runnerUp);

    return takeUnique(
      [
        summary.scoreGap === 0 ? "점수 동률" : `점수 차 ${summary.scoreGap}점`,
        combatPowerDelta,
        attritionSnapshot,
        "결정타 부족",
      ],
      MAX_DECISIVE_FACTORS
    );
  }

  return takeUnique(
    [
      recentObjectiveLog?.metadata?.missionName
        ? `임무 '${recentObjectiveLog.metadata.missionName}' 달성`
        : recentObjectiveLog?.metadata?.objectiveName
          ? `목표 ${recentObjectiveLog.metadata.objectiveName} 확보`
          : "",
      recentKillLog?.metadata?.targetName
        ? `${recentKillLog.metadata.targetName} 격파`
        : "",
      runnerUp ? `점수 ${summary.scoreGap}점 차 우세` : summary.winnerBasis,
      buildAttritionFactorText(leader),
      runnerUp
        ? `잔존 전투력 ${leader.remainingCombatPower - runnerUp.remainingCombatPower} 우세`
        : `잔존 전투력 ${leader.remainingCombatPower}`,
      leader.confirmedHits > 0 ? `유효타 ${leader.confirmedHits}회 주도` : "",
      leader.missionSuccesses > 0
        ? `임무 성과 ${leader.missionSuccesses}회 확보`
        : "",
    ],
    MAX_DECISIVE_FACTORS
  );
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
    if (
      runnerUp &&
      leader.attritionBalance <= runnerUp.attritionBalance &&
      (leader.kills.total > 0 || leader.losses.total > 0)
    ) {
      risks.push(
        `${leader.name}은(는) 점수 우세에도 소모전 교환비가 박빙이라 재교전 시 손실 부담이 커질 수 있습니다.`
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
    const fragileSide = summary.sides.find(
      (side) => side.attritionBalance < 0 && side.losses.total > 0
    );

    return takeUnique([
      "정찰과 감시 축을 먼저 복원해 다음 교전의 표적 우선순위를 재설정해야 합니다.",
      "분산 발사보다 고가치 표적 1~2개에 동시 타격을 집중해 결정타를 만들어야 합니다.",
      fragileSide
        ? `${fragileSide.name}은(는) 누적 손실이 난 구간을 줄이도록 방공과 생존성 보강을 우선해야 합니다.`
        : "",
      "복귀 중인 전력과 잔여 무장을 재편성해 다음 교전의 지속 시간을 늘려야 합니다.",
    ]);
  }

  return takeUnique([
    `${leader.name}은(는) 잔존 화력을 보전하면서 고가치 표적 위주로 우세를 굳혀야 합니다.`,
    leader.attritionBalance <= 0 && leader.losses.total > 0
      ? `${leader.name}은(는) 점수 우세와 별개로 소모전 교환비가 빡빡하므로 불필요한 맞교환을 줄여야 합니다.`
      : "",
    leader.weaponInventory <= 6
      ? `${leader.name}은(는) 재무장 주기를 먼저 정리해 우세가 끊기지 않도록 해야 합니다.`
      : "",
    runnerUp
      ? `${runnerUp.name}은(는) 임무 중단과 낮은 효율 구간을 복구한 뒤${runnerUp.attritionBalance < 0 ? " 손실 억제와 방공 재정비를 선행하고" : ""} 단일 공격 축으로 다시 압박해야 합니다.`
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
  const endStateClause = buildEndStateClause(summary);

  if (summary.isTie || !summary.winnerName) {
    if (turningPoint) {
      return `전투는 무승부로 종료됐습니다. ${endStateClause ? `${endStateClause} ` : ""}핵심 배경은 ${firstFactor}이며, 가장 큰 전환점은 "${turningPoint.headline}"입니다.`;
    }
    return `전투는 무승부로 종료됐습니다. ${endStateClause ? `${endStateClause} ` : ""}핵심 배경은 ${firstFactor}입니다.`;
  }

  if (turningPoint) {
    return `${summary.winnerName} 우세로 종료됐습니다. ${endStateClause ? `${endStateClause} ` : ""}핵심 요인은 ${firstFactor}이며, 결정적 장면은 "${turningPoint.headline}"입니다.`;
  }

  return `${summary.winnerName} 우세로 종료됐습니다. ${endStateClause ? `${endStateClause} ` : ""}핵심 요인은 ${firstFactor}입니다.`;
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
  const endStateDetailText = ` 종료 시점 ${summary.activeSideSummary} 상태였습니다.`;

  if (!leader) {
    return "전투 결과를 정리할 수 있는 세력 정보가 없습니다.";
  }

  if (summary.isTie || !summary.winnerName) {
    if (!runnerUp) {
      return `${leader.name}만 남아 있어 전장을 단독 통제 중입니다.${endStateDetailText}`;
    }
    const attritionText = buildAttritionSnapshotText(leader, runnerUp);
    return `${leader.name}와 ${runnerUp.name}이(가) 사실상 무승부로 종료됐습니다. 점수 ${leader.score}점 동률이며 잔존 전력도 큰 차이가 없습니다.${attritionText ? ` ${attritionText}입니다.` : ""}${endStateDetailText}`;
  }

  const headline = `${summary.winnerName} 우세로 시뮬레이션이 종료됐습니다. ${summary.winnerBasis}.`;
  const detail = runnerUp
    ? `점수 ${leader.score} 대 ${runnerUp.score}, 잔존 전력 ${leader.remainingCombatUnits} 대 ${runnerUp.remainingCombatUnits}${buildAttritionSnapshotText(leader, runnerUp) ? `, ${buildAttritionSnapshotText(leader, runnerUp)}` : ""}입니다.`
    : `현재 잔존 전력은 ${leader.remainingCombatUnits}개 전투 단위입니다.`;
  const factorText = decisiveFactor
    ? ` 핵심 요인은 ${decisiveFactor}입니다.`
    : "";

  if (!recentLog) {
    return `${headline} ${detail}${endStateDetailText}${factorText}`;
  }

  return `${headline} ${detail}${endStateDetailText}${factorText} 마지막 주요 기록은 "${recentLog}"입니다.`;
}

function buildEndStateClause(
  summary: Pick<
    SimulationOutcomeSummary,
    "endReasonDetail" | "activeSideNames" | "activeSideSummary"
  >
) {
  switch (summary.endReasonDetail) {
    case "single_side_remaining":
      return summary.activeSideNames[0]
        ? `${summary.activeSideNames[0]}만 생존한 채`
        : "단일 세력만 생존한 채";
    case "no_active_sides":
      return "활성 전력이 모두 소실된 채";
    case "time_limit":
      return summary.activeSideNames.length > 0
        ? `${summary.activeSideSummary}를 유지한 채`
        : "잔존 전력 없이";
    default:
      return "";
  }
}

function buildSimulationEndState(game: Game) {
  const {
    info: { doneReason, doneReasonDetail, activeSideIds, activeSideNames },
  } = game.getGameEndState();
  const activeSideSummary = buildActiveSideSummary(activeSideNames);
  let endReason: string;

  switch (doneReasonDetail) {
    case "time_limit":
      endReason = "시나리오 종료 시간 도달";
      break;
    case "single_side_remaining":
      endReason = "단일 세력 생존";
      break;
    case "no_active_sides":
      endReason = "활성 전력 소실";
      break;
    default:
      endReason = doneReason === "in_progress" ? "교전 진행 중" : "교전 종결";
      break;
  }

  return {
    endReason,
    endReasonDetail: doneReasonDetail,
    activeSideIds,
    activeSideNames,
    activeSideSummary,
  };
}

export function buildSimulationOutcomeSummary(
  game: Game
): SimulationOutcomeSummary {
  const scenario = game.currentScenario;
  const allLogs = game.simulationLogs.getLogs();
  const focusFireSummary = game.getFocusFireSummary();
  const reportMode = resolveOutcomeMode(game, focusFireSummary);
  const rankedSides = applyScenarioOutcomeOverrides(
    scenario,
    scenario.sides
      .map((side) => buildSideOutcomeSummary(game, side.id, allLogs))
      .sort(compareOutcomeSides)
  );
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
  const endState = buildSimulationEndState(game);

  const summary: SimulationOutcomeSummary = {
    scenarioName: scenario.name,
    reportMode,
    endReason: endState.endReason,
    endReasonDetail: endState.endReasonDetail,
    activeSideIds: endState.activeSideIds,
    activeSideNames: endState.activeSideNames,
    activeSideSummary: endState.activeSideSummary,
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
    bdaReport: null,
    fallbackSummary: "",
  };

  summary.report = buildSimulationOutcomeReport(summary, allLogs);
  if (reportMode === "bda") {
    const bdaReport = buildSimulationOutcomeBdaReport(
      game,
      summary,
      allLogs,
      focusFireSummary.objectiveName ? "focus_fire" : "non_combat",
      focusFireSummary
    );
    summary.bdaReport = bdaReport;
    summary.fallbackSummary = buildBdaFallbackSummary(summary, bdaReport);
    return summary;
  }

  summary.fallbackSummary = buildOutcomeFallbackSummary(summary);
  return summary;
}

function buildSimulationOutcomePrompt(summary: SimulationOutcomeSummary) {
  if (summary.reportMode === "bda" && summary.bdaReport) {
    return [
      "아래는 VISTA BDA 분석 요약입니다.",
      "첫 문장에서 BDA 판정(결정적 효과/유효 타격/부분 효과 등)을 명확히 말하고, 목표 상태와 확인된 피해 규모를 함께 정리하세요.",
      "bdaReport.operatingPicture, effectSummary, economicScore, benchmarkInsight, assessmentConfidenceLabel, keyObservations, recommendations, recentActions를 우선 활용하고, 최대 3문장 한국어로 간결하게 작성하세요.",
      "",
      JSON.stringify(summary, null, 2),
    ].join("\n");
  }

  return [
    "아래는 VISTA 전투 종료 요약입니다.",
    "승자 또는 무승부를 첫 문장에 명확히 말하고, 종료 사유와 생존 세력을 먼저 짚은 뒤 점수/잔존 전력/유효타 중 근거가 되는 2개 정도만 짚어 주세요.",
    "report.executiveSummary, decisiveFactors, turningPoints, sideAssessments와 activeSideSummary의 소모전 평가를 우선 활용하세요.",
    "최대 3문장, 한국어, 간결하게 작성하세요.",
    "",
    JSON.stringify(summary, null, 2),
  ].join("\n");
}

function buildSimulationOutcomeMessages(
  summary: SimulationOutcomeSummary
): LlmMessage[] {
  const systemPrompt =
    summary.reportMode === "bda"
      ? [
          "You are VISTA's battle damage assessment analyst.",
          "Always answer in Korean.",
          "Use only the provided structured summary.",
          "State the BDA judgment first.",
          "Focus on target status, observed damage, and immediate follow-up.",
        ].join("\n")
      : [
          "You are VISTA's battle outcome analyst.",
          "Always answer in Korean.",
          "Use only the provided structured summary.",
          "State the winner or a draw first.",
          "Be concise and operationally focused.",
        ].join("\n");

  return [
    {
      role: "system",
      content: systemPrompt,
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

