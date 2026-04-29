import type { SimulationLogEntityType } from "@/game/log/SimulationLogs";
import type {
  SimulationOutcomeEntityBreakdown,
  SimulationOutcomeSideSummary,
} from "./types";

export const MAX_RECENT_REPORT_LOGS = 6;
export const MAX_REPORT_ITEMS = 3;
export const MAX_DECISIVE_FACTORS = 4;
export const MAX_TURNING_POINTS = 4;
export const MAX_BDA_BENCHMARK_RUNS = 8;
export const WEST_SEA_DEFENSE_SCENARIO_NAME = "한국 vs 북한 - 서해 합동 방어";
export const WEST_SEA_DEFENSE_FORCED_WINNER_SIDE_ID = "rok-side";
export const WEST_SEA_DEFENSE_SCORE_MARGIN = 120;
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function takeUnique(values: string[], limit: number = MAX_REPORT_ITEMS) {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

export function formatSideNameList(sideNames: string[]) {
  return sideNames.join(" · ");
}

export function buildActiveSideSummary(activeSideNames: string[]) {
  if (activeSideNames.length < 1) {
    return "잔존 전력 없음";
  }

  return `생존 세력 ${formatSideNameList(activeSideNames)}`;
}

export function createEntityBreakdown(): SimulationOutcomeEntityBreakdown {
  return {
    aircraft: 0,
    ships: 0,
    facilities: 0,
    airbases: 0,
    weapons: 0,
    other: 0,
    total: 0,
  };
}

export function getEntityBreakdownKey(
  entityType?: SimulationLogEntityType
): keyof Omit<SimulationOutcomeEntityBreakdown, "total"> {
  switch (entityType) {
    case "aircraft":
      return "aircraft";
    case "ship":
      return "ships";
    case "army":
    case "facility":
      return "facilities";
    case "airbase":
      return "airbases";
    case "weapon":
      return "weapons";
    default:
      return "other";
  }
}

export function incrementEntityBreakdown(
  breakdown: SimulationOutcomeEntityBreakdown,
  entityType?: SimulationLogEntityType
) {
  const key = getEntityBreakdownKey(entityType);
  breakdown[key] += 1;
  breakdown.total += 1;
}

export function formatEntityBreakdownSummary(
  breakdown: SimulationOutcomeEntityBreakdown
) {
  return [
    breakdown.aircraft > 0 ? `항공 ${breakdown.aircraft}` : "",
    breakdown.ships > 0 ? `함정 ${breakdown.ships}` : "",
    breakdown.facilities > 0 ? `지상 ${breakdown.facilities}` : "",
    breakdown.airbases > 0 ? `기지 ${breakdown.airbases}` : "",
    breakdown.weapons > 0 ? `무장 ${breakdown.weapons}` : "",
    breakdown.other > 0 ? `기타 ${breakdown.other}` : "",
  ]
    .filter(Boolean)
    .slice(0, MAX_REPORT_ITEMS)
    .join(" · ");
}

export function buildAttritionFactorText(side: SimulationOutcomeSideSummary) {
  if (side.attritionBalance > 0) {
    return `소모전 차 ${formatSignedNumber(side.attritionBalance)}`;
  }
  if (side.kills.total > 0) {
    return `적 전투 단위 ${side.kills.total}개 격파`;
  }
  return "";
}

export function buildAttritionSnapshotText(
  leader: SimulationOutcomeSideSummary,
  runnerUp?: SimulationOutcomeSideSummary
) {
  if (!runnerUp) {
    if (leader.kills.total === 0 && leader.losses.total === 0) {
      return "";
    }
    return `소모전 차 ${formatSignedNumber(leader.attritionBalance)}`;
  }
  if (
    leader.kills.total === 0 &&
    leader.losses.total === 0 &&
    runnerUp.kills.total === 0 &&
    runnerUp.losses.total === 0
  ) {
    return "";
  }
  return `소모전 차 ${formatSignedNumber(leader.attritionBalance)} 대 ${formatSignedNumber(runnerUp.attritionBalance)}`;
}

export function getHitRate(side: SimulationOutcomeSideSummary) {
  if (side.launches <= 0) {
    return null;
  }
  return side.confirmedHits / side.launches;
}

export function formatHitRateLabel(hitRate: number | null) {
  if (hitRate === null) {
    return "교전 제한";
  }
  return `${Math.round(hitRate * 100)}%`;
}

export function getEngagementEfficiencyLabel(side: SimulationOutcomeSideSummary) {
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

export function getAttritionLabel(side: SimulationOutcomeSideSummary) {
  if (side.attritionBalance >= 2) {
    return "격파 우세";
  }
  if (side.attritionBalance > 0) {
    return "소폭 우세";
  }
  if (side.attritionBalance < 0) {
    return "손실 우세";
  }
  if (side.kills.total > 0 || side.losses.total > 0) {
    return "교환전";
  }
  return "변화 제한";
}

export function formatSignedNumber(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

