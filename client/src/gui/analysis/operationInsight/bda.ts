import type Game from "@/game/Game";
import type { FocusFireSummary } from "@/game/Game";
import {
  SimulationLogType,
  type SimulationLog,
} from "@/game/log/SimulationLogs";
import { unixToLocalTime } from "@/utils/dateTimeFunctions";
import { buildFocusFireInsight } from "./focusFireInsight";
import {
  MAX_BDA_BENCHMARK_RUNS,
  MAX_REPORT_ITEMS,
  clamp,
  takeUnique,
} from "./shared";
import type {
  SimulationOutcomeBdaBenchmark,
  SimulationOutcomeBdaBenchmarkRun,
  SimulationOutcomeBdaReason,
  SimulationOutcomeBdaReport,
  SimulationOutcomeMode,
  SimulationOutcomeSummary,
} from "./types";

const bdaBenchmarkHistory = new Map<string, SimulationOutcomeBdaBenchmarkRun[]>();
const recordedBdaBenchmarkRunIds = new Set<string>();
function hasCombatRelationships(game: Game) {
  return game.currentScenario.sides.some(
    (side) => game.currentScenario.relationships.getHostiles(side.id).length > 0
  );
}

export function resolveOutcomeMode(
  game: Game,
  focusFireSummary: FocusFireSummary
): SimulationOutcomeMode {
  if (focusFireSummary.objectiveName) {
    return "bda";
  }

  return hasCombatRelationships(game) ? "battle" : "bda";
}

function findLatestObjectiveName(logs: SimulationLog[]) {
  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const objectiveName = logs[index]?.metadata?.objectiveName?.trim();
    if (objectiveName) {
      return objectiveName;
    }
  }

  return null;
}

function getLaunchQuantity(log: SimulationLog) {
  return Math.max(log.metadata?.quantity ?? 1, 1);
}

function buildBdaTargetSummary(
  focusFireSummary: FocusFireSummary,
  includeTargetAnalysis: boolean,
  objectiveName: string | null
) {
  const recommendation = focusFireSummary.recommendation;
  if (includeTargetAnalysis && recommendation?.targetCount) {
    const compositionSummary = recommendation.targetComposition
      .slice(0, MAX_REPORT_ITEMS)
      .map((entry) => `${entry.label} ${entry.count}`)
      .join(" · ");

    return [
      recommendation.targetName ? `주요 표적 ${recommendation.targetName}` : "",
      compositionSummary,
      recommendation.targetCombatPower > 0
        ? `전투 가치 ${recommendation.targetCombatPower}`
        : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (objectiveName) {
    return `목표 ${objectiveName} 축 관측`;
  }

  return "지정 목표 없이 종료";
}

function buildBdaAssetMixSummary(focusFireSummary: FocusFireSummary) {
  const mix = [
    focusFireSummary.artilleryCount > 0
      ? `포대 ${focusFireSummary.artilleryCount}`
      : "",
    focusFireSummary.aircraftCount > 0
      ? `항공 ${focusFireSummary.aircraftCount}`
      : "",
    focusFireSummary.armorCount > 0 ? `기갑 ${focusFireSummary.armorCount}` : "",
  ].filter(Boolean);

  if (mix.length > 0) {
    return mix.join(" · ");
  }

  return focusFireSummary.launchPlatforms.length > 0
    ? `발사 플랫폼 ${focusFireSummary.launchPlatforms.length}`
    : "가용 화력 기록 제한";
}

function buildBdaRequiredEffectScore(
  recommendation: FocusFireSummary["recommendation"]
) {
  const desiredEffect =
    recommendation?.desiredEffect ?? recommendation?.desiredEffectEstimated ?? 6;
  return clamp(Math.round(desiredEffect * 8), 35, 90);
}

function buildBdaCostScore(parameters: {
  launchedPlatformCount: number;
  launchCount: number;
  averageTimeToFireSeconds: number | null;
  threatExposureScore: number;
}) {
  return clamp(
    Math.round(
      parameters.launchedPlatformCount * 5.5 +
        parameters.launchCount * 0.45 +
        (parameters.averageTimeToFireSeconds ?? 0) / 45 +
        parameters.threatExposureScore * 3.1
    ),
    0,
    100
  );
}

function buildBdaEconomicScore(parameters: {
  assessedEffectScore: number;
  requiredEffectScore: number;
  missionThresholdMet: boolean;
  costScore: number;
}) {
  if (!parameters.missionThresholdMet) {
    return clamp(
      Math.round(
        parameters.assessedEffectScore -
          parameters.costScore -
          (parameters.requiredEffectScore - parameters.assessedEffectScore) * 1.2
      ),
      0,
      100
    );
  }

  const overshootPenalty = Math.max(
    0,
    parameters.assessedEffectScore - parameters.requiredEffectScore
  );

  return clamp(
    Math.round(
      parameters.assessedEffectScore -
        parameters.costScore -
        overshootPenalty * 0.45 +
        18
    ),
    0,
    100
  );
}

function buildDeploymentFootprintLabel(parameters: {
  launchedPlatformCount: number;
  launchCount: number;
}) {
  if (parameters.launchedPlatformCount > 0) {
    return `${parameters.launchedPlatformCount}개 플랫폼 · ${parameters.launchCount}발`;
  }
  if (parameters.launchCount > 0) {
    return `플랫폼 미상 · ${parameters.launchCount}발`;
  }
  return "투입 기록 제한";
}

function buildBdaEffectScore(parameters: {
  shockIndex: number;
  captureProgress: number;
  confirmedHitCount: number;
  damageEventCount: number;
  killEventCount: number;
  missionSuccessCount: number;
}) {
  return clamp(
    Math.round(
      parameters.shockIndex * 0.45 +
        parameters.captureProgress * 0.32 +
        parameters.confirmedHitCount * 6 +
        parameters.damageEventCount * 10 +
        parameters.killEventCount * 18 +
        parameters.missionSuccessCount * 14
    ),
    0,
    100
  );
}

function getBdaAssessedEffectLabel(parameters: {
  effectScore: number;
  captureProgress: number;
  killEventCount: number;
  damageEventCount: number;
  confirmedHitCount: number;
  missionSuccessCount: number;
}) {
  if (parameters.captureProgress >= 100 || parameters.effectScore >= 85) {
    return "결정적 효과";
  }
  if (
    parameters.killEventCount > 0 ||
    parameters.missionSuccessCount > 0 ||
    parameters.effectScore >= 60
  ) {
    return "유효 타격";
  }
  if (parameters.damageEventCount > 0 || parameters.effectScore >= 35) {
    return "부분 효과";
  }
  if (parameters.confirmedHitCount > 0 || parameters.effectScore >= 15) {
    return "탄착 확인";
  }
  return "효과 미확인";
}

function getBdaDamageLevelLabel(parameters: {
  captureProgress: number;
  killEventCount: number;
  damageEventCount: number;
  impactEventCount: number;
  confirmedHitCount: number;
}) {
  if (parameters.captureProgress >= 100) {
    return "목표 확보";
  }
  if (parameters.killEventCount >= 2) {
    return "주요 표적 파괴";
  }
  if (parameters.killEventCount === 1) {
    return "표적 파괴 확인";
  }
  if (parameters.damageEventCount > 0) {
    return "피해 누적";
  }
  if (parameters.impactEventCount > 0 || parameters.confirmedHitCount > 0) {
    return "탄착 확인";
  }
  return "평가 제한";
}

function buildBdaConfidenceScore(parameters: {
  objectiveName: string | null;
  confirmedHitCount: number;
  damageEventCount: number;
  killEventCount: number;
  missionSuccessCount: number;
  recentActionCount: number;
  captureProgress: number;
  includeTargetAnalysis: boolean;
}) {
  return clamp(
    Math.round(
      (parameters.objectiveName ? 16 : 8) +
        parameters.confirmedHitCount * 10 +
        parameters.damageEventCount * 12 +
        parameters.killEventCount * 18 +
        parameters.missionSuccessCount * 10 +
        parameters.recentActionCount * 6 +
        parameters.captureProgress * 0.18 +
        (parameters.includeTargetAnalysis ? 8 : 0)
    ),
    18,
    100
  );
}

function getBdaConfidenceLabel(confidenceScore: number) {
  if (confidenceScore >= 70) {
    return "높음";
  }
  if (confidenceScore >= 45) {
    return "보통";
  }
  return "제한";
}

function getBdaResourceEfficiencyLabel(parameters: {
  launchCount: number;
  confirmedHitCount: number;
  damageEventCount: number;
  killEventCount: number;
}) {
  if (parameters.launchCount < 1) {
    return "기록 부족";
  }

  const hitRatio = parameters.confirmedHitCount / parameters.launchCount;
  if (parameters.killEventCount > 0 || hitRatio >= 0.35) {
    return "우수";
  }
  if (parameters.damageEventCount > 0 || hitRatio >= 0.15) {
    return "양호";
  }
  if (parameters.confirmedHitCount > 0) {
    return "보통";
  }
  return "낮음";
}

function getBdaTempoLabel(parameters: {
  objectiveStatusLabel: string;
  weaponsInFlight: number;
  missionSuccessCount: number;
  launchCount: number;
}) {
  if (parameters.objectiveStatusLabel === "목표 확보 완료") {
    return "종결 단계";
  }
  if (parameters.weaponsInFlight > 0) {
    return "후속 탄착 대기";
  }
  if (parameters.missionSuccessCount > 0) {
    return "목표 전환 가능";
  }
  if (parameters.launchCount > 0) {
    return "재타격 판단";
  }
  return "관측 단계";
}

function buildBdaEffectSummary(parameters: {
  killEventCount: number;
  damageEventCount: number;
  impactEventCount: number;
  confirmedHitCount: number;
}) {
  return [
    `파괴 ${parameters.killEventCount}`,
    `직접 피해 ${parameters.damageEventCount}`,
    `탄착 ${Math.max(parameters.impactEventCount, parameters.confirmedHitCount)}`,
  ].join(" · ");
}

function buildBdaOperatingPicture(parameters: {
  objectiveName: string | null;
  assessedEffectLabel: string;
  damageLevelLabel: string;
  dominantAxis: string;
  targetSummary: string;
  assessmentConfidenceLabel: string;
}) {
  const objectiveText = parameters.objectiveName
    ? `목표 ${parameters.objectiveName}`
    : parameters.targetSummary;

  return `${objectiveText} 기준 ${parameters.assessedEffectLabel}로 판정합니다. ${parameters.dominantAxis} 축이 주도했고 피해 판정은 ${parameters.damageLevelLabel}, 분석 신뢰도는 ${parameters.assessmentConfidenceLabel}입니다.`;
}

function buildBdaBenchmarkKey(
  summary: SimulationOutcomeSummary,
  bdaReport: Pick<SimulationOutcomeBdaReport, "objectiveName" | "targetSummary">
) {
  return `${summary.scenarioName}::${bdaReport.objectiveName ?? bdaReport.targetSummary}`;
}

function buildBdaBenchmarkRunId(
  summary: SimulationOutcomeSummary,
  benchmarkKey: string,
  bdaReport: Pick<
    SimulationOutcomeBdaReport,
    | "actorName"
    | "launchCount"
    | "launchedPlatformCount"
    | "assessedEffectScore"
    | "economicScore"
    | "objectiveStatusLabel"
  >
) {
  return [
    benchmarkKey,
    summary.endedAtUnix,
    bdaReport.actorName ?? "unknown",
    bdaReport.launchedPlatformCount,
    bdaReport.launchCount,
    bdaReport.assessedEffectScore,
    bdaReport.economicScore,
    bdaReport.objectiveStatusLabel,
  ].join("::");
}

function buildBaseDeploymentAssessmentLabel(parameters: {
  missionThresholdMet: boolean;
  requiredEffectScore: number;
  assessedEffectScore: number;
  launchedPlatformCount: number;
}) {
  if (!parameters.missionThresholdMet) {
    return "과소투입";
  }
  if (
    parameters.assessedEffectScore - parameters.requiredEffectScore >= 22 &&
    parameters.launchedPlatformCount >= 6
  ) {
    return "과투입 의심";
  }
  return "균형 운용";
}

function upsertBdaBenchmarkRun(run: SimulationOutcomeBdaBenchmarkRun) {
  if (recordedBdaBenchmarkRunIds.has(run.runId)) {
    return;
  }

  recordedBdaBenchmarkRunIds.add(run.runId);
  const existingRuns = bdaBenchmarkHistory.get(run.benchmarkKey) ?? [];
  const nextRuns = [...existingRuns, run]
    .sort((left, right) => right.endedAtUnix - left.endedAtUnix)
    .slice(0, MAX_BDA_BENCHMARK_RUNS);

  bdaBenchmarkHistory.set(run.benchmarkKey, nextRuns);
}

function buildBdaBenchmark(
  currentRun: SimulationOutcomeBdaBenchmarkRun
): SimulationOutcomeBdaBenchmark {
  upsertBdaBenchmarkRun(currentRun);
  const history = bdaBenchmarkHistory.get(currentRun.benchmarkKey) ?? [currentRun];
  const rankedRuns = [...history].sort((left, right) => {
    if (right.economicScore !== left.economicScore) {
      return right.economicScore - left.economicScore;
    }
    if (right.assessedEffectScore !== left.assessedEffectScore) {
      return right.assessedEffectScore - left.assessedEffectScore;
    }
    return left.costScore - right.costScore;
  });
  const bestValueRunId = rankedRuns[0]?.runId ?? null;
  const maxEffectRunId =
    [...history].sort((left, right) => {
      if (right.assessedEffectScore !== left.assessedEffectScore) {
        return right.assessedEffectScore - left.assessedEffectScore;
      }
      return left.costScore - right.costScore;
    })[0]?.runId ?? null;
  const qualifiedRuns = history.filter((run) => run.missionThresholdMet);
  const leanestQualifiedRunId =
    [...(qualifiedRuns.length > 0 ? qualifiedRuns : history)].sort((left, right) => {
      if (left.launchedPlatformCount !== right.launchedPlatformCount) {
        return left.launchedPlatformCount - right.launchedPlatformCount;
      }
      return left.costScore - right.costScore;
    })[0]?.runId ?? null;
  const currentRunRank =
    rankedRuns.findIndex((run) => run.runId === currentRun.runId) + 1 || null;

  return {
    benchmarkKey: currentRun.benchmarkKey,
    currentRunId: currentRun.runId,
    comparisonCount: history.length,
    bestValueRunId,
    maxEffectRunId,
    leanestQualifiedRunId,
    currentRunRank,
    runs: rankedRuns.slice(0, 4),
  };
}

function resolveBdaDeploymentAssessmentLabel(
  currentRun: SimulationOutcomeBdaBenchmarkRun,
  benchmark: SimulationOutcomeBdaBenchmark
) {
  if (!currentRun.missionThresholdMet) {
    return "과소투입";
  }
  if (benchmark.bestValueRunId === currentRun.runId) {
    return "최적 편성";
  }
  if (benchmark.maxEffectRunId === currentRun.runId) {
    return "과투입";
  }
  if (benchmark.leanestQualifiedRunId === currentRun.runId) {
    return "저비용 성공";
  }
  return "균형 운용";
}

function buildBdaBenchmarkInsight(
  currentRun: SimulationOutcomeBdaBenchmarkRun,
  benchmark: SimulationOutcomeBdaBenchmark
) {
  if (benchmark.comparisonCount < 2) {
    return "같은 목표에서 추가 런을 쌓으면 3·5·8 배치 간 경제성 비교가 더 선명해집니다.";
  }

  if (benchmark.bestValueRunId === currentRun.runId) {
    return `${currentRun.deploymentFootprintLabel} 편성이 현재 비교군 중 경제성이 가장 높습니다.`;
  }

  const bestValueRun = benchmark.runs.find(
    (run) => run.runId === benchmark.bestValueRunId
  );
  if (!bestValueRun) {
    return "최근 비교군 대비 경제성 판단을 정리 중입니다.";
  }

  if (!currentRun.missionThresholdMet) {
    return `현재 편성은 임무 기준 ${currentRun.requiredEffectScore}점을 넘지 못했습니다. ${bestValueRun.deploymentFootprintLabel} 수준이 기준 충족에 더 가깝습니다.`;
  }

  if (benchmark.maxEffectRunId === currentRun.runId) {
    return `현재 편성은 효과는 가장 크지만 ${bestValueRun.deploymentFootprintLabel} 대비 비용이 높아 경제성에서 밀립니다.`;
  }

  return `${bestValueRun.deploymentFootprintLabel} 편성이 현재 비교군의 기준점입니다. 현재 런은 경제성 순위 ${benchmark.currentRunRank}위입니다.`;
}

function buildBdaRecentActions(logs: SimulationLog[]) {
  return logs
    .filter(
      (log) =>
        log.type === SimulationLogType.WEAPON_LAUNCHED ||
        log.type === SimulationLogType.WEAPON_HIT ||
        log.type === SimulationLogType.STRIKE_MISSION_SUCCESS ||
        log.type === SimulationLogType.PATROL_MISSION_SUCCESS ||
        log.metadata?.resultTag === "objective_assigned" ||
        log.metadata?.resultTag === "objective_secured"
    )
    .slice(-MAX_REPORT_ITEMS)
    .reverse()
    .map((log) => log.message);
}

function buildBdaObservations(parameters: {
  objectiveName: string | null;
  objectiveStatusLabel: string;
  targetSummary: string;
  damageLevelLabel: string;
  requiredEffectScore: number;
  missionThresholdMet: boolean;
  economicScore: number;
  deploymentAssessmentLabel: string;
  killEventCount: number;
  damageEventCount: number;
  launchCount: number;
  confirmedHitCount: number;
  missionSuccessCount: number;
  dominantAxis: string;
  shockIndex: number;
  recentActions: string[];
}) {
  return takeUnique(
    [
      parameters.objectiveName
        ? `목표 ${parameters.objectiveName}은(는) ${parameters.objectiveStatusLabel} 상태로 정리됐습니다.`
        : `시뮬레이션은 ${parameters.objectiveStatusLabel} 상태로 종료됐습니다.`,
      parameters.killEventCount > 0
        ? `격파 ${parameters.killEventCount}건, 추가 피해 ${parameters.damageEventCount}건으로 ${parameters.damageLevelLabel} 단계가 확인됐습니다.`
        : parameters.damageEventCount > 0
          ? `직접 피해 ${parameters.damageEventCount}건이 누적됐고 최종 판정은 ${parameters.damageLevelLabel}입니다.`
          : parameters.confirmedHitCount > 0
            ? `유효타 ${parameters.confirmedHitCount}건이 기록됐지만 직접 피해 평가는 아직 제한적입니다.`
            : "직접 피해 기록이 부족해 추가 관측 근거가 필요합니다.",
      parameters.launchCount > 0
        ? `발사 ${parameters.launchCount}발, 유효타 ${parameters.confirmedHitCount}건, 임무 성과 ${parameters.missionSuccessCount}건이 집계됐습니다.`
        : "",
      `임무 기준 ${parameters.requiredEffectScore}점 대비 ${parameters.missionThresholdMet ? "기준 충족" : "기준 미달"}이며 경제성 점수는 ${parameters.economicScore}점입니다.`,
      `현재 편성 판정은 ${parameters.deploymentAssessmentLabel}입니다.`,
      parameters.shockIndex > 0
        ? `${parameters.dominantAxis} 축이 충격량 지수 ${parameters.shockIndex}를 형성했습니다.`
        : "",
      parameters.targetSummary ? `평가 대상: ${parameters.targetSummary}.` : "",
      parameters.recentActions[0]
        ? `최근 관측 기록: ${parameters.recentActions[0]}`
        : "",
    ],
    4
  );
}

function buildBdaRecommendations(parameters: {
  objectiveName: string | null;
  objectiveStatusLabel: string;
  assessedEffectLabel: string;
  missionThresholdMet: boolean;
  deploymentAssessmentLabel: string;
  benchmarkInsight: string;
  confirmedHitCount: number;
  killEventCount: number;
  launchPlatformCount: number;
  launchedPlatformCount: number;
  weaponsInFlight: number;
  captureProgress: number;
}) {
  if (
    parameters.objectiveStatusLabel === "목표 확보 완료" ||
    parameters.assessedEffectLabel === "결정적 효과"
  ) {
    return takeUnique([
      parameters.benchmarkInsight,
      "잔존 자산을 재정비하고 주변 잔여 표적 유무만 최종 확인하면 됩니다.",
      parameters.weaponsInFlight > 0
        ? "비행 중 탄체가 모두 정리된 뒤 최종 BDA를 잠가야 합니다."
        : "",
      "다음 목표 전환 전까지 ISR 자산으로 재공격 필요성만 확인하세요.",
    ]);
  }

  if (parameters.confirmedHitCount < 1) {
    return takeUnique([
      parameters.benchmarkInsight,
      "탄착 확인이 부족하므로 재관측 자산을 먼저 붙여 좌표와 표적 식별을 다시 검증해야 합니다.",
      parameters.objectiveName
        ? `${parameters.objectiveName} 축에 대한 접근 경로와 무장 조합을 조정한 뒤 재타격을 검토하세요.`
        : "재타격 전에 표적 기준점과 관측 축을 먼저 고정해야 합니다.",
    ]);
  }

  return takeUnique([
    parameters.benchmarkInsight,
    parameters.deploymentAssessmentLabel === "과투입"
      ? "임무 기준을 넘긴 뒤 추가 편성은 효익보다 비용 증가가 커질 수 있으므로 축소 편성을 검토해야 합니다."
      : "",
    !parameters.missionThresholdMet
      ? "현재 편성은 임무 기준 미달이므로 최소 화력 패키지를 한 단계 올려 재실행해야 합니다."
      : "",
    parameters.killEventCount > 0
      ? "생존 표적만 분리해 고가치 순으로 2차 타격 여부를 결정해야 합니다."
      : "피해가 누적된 표적부터 재관측해 2차 타격 우선순위를 다시 매겨야 합니다.",
    parameters.captureProgress < 100 && parameters.objectiveName
      ? `${parameters.objectiveName} 축은 아직 완전 확보 전이므로 남은 화력을 다시 집중할 필요가 있습니다.`
      : "",
    parameters.launchedPlatformCount < parameters.launchPlatformCount
      ? "미투입 자산은 후속 차수 후보로 유지해 타격 창을 늘려야 합니다."
      : "",
    parameters.weaponsInFlight > 0
      ? "비행 중 탄체 결과가 모두 반영될 때까지 과도한 낙관 판정은 보류해야 합니다."
      : "",
  ]);
}

export function buildSimulationOutcomeBdaReport(
  game: Game,
  summary: SimulationOutcomeSummary,
  logs: SimulationLog[],
  modeReason: SimulationOutcomeBdaReason,
  focusFireSummary: FocusFireSummary
): SimulationOutcomeBdaReport {
  const focusFireInsight = buildFocusFireInsight(focusFireSummary);
  const includeTargetAnalysis = hasCombatRelationships(game);
  const objectiveName =
    focusFireSummary.objectiveName ?? findLatestObjectiveName(logs);
  const recommendation = focusFireSummary.recommendation;
  const hitLogs = logs.filter((log) => log.type === SimulationLogType.WEAPON_HIT);
  const launchLogs = logs.filter(
    (log) => log.type === SimulationLogType.WEAPON_LAUNCHED
  );
  const missionSuccessCount = logs.filter(
    (log) =>
      log.type === SimulationLogType.STRIKE_MISSION_SUCCESS ||
      log.type === SimulationLogType.PATROL_MISSION_SUCCESS
  ).length;
  const confirmedHitCount = hitLogs.length;
  const damageEventCount = hitLogs.filter(
    (log) => log.metadata?.resultTag === "damage"
  ).length;
  const killEventCount = hitLogs.filter(
    (log) => log.metadata?.resultTag === "kill"
  ).length;
  const impactEventCount = hitLogs.filter(
    (log) => log.metadata?.resultTag === "impact"
  ).length;
  const launchCount = launchLogs.reduce(
    (sum, log) => sum + getLaunchQuantity(log),
    0
  );
  const launchedPlatformCount = focusFireSummary.launchPlatforms.filter(
    (platform) => platform.launched
  ).length;
  const recentActions = buildBdaRecentActions(logs);
  const focusFireActorSide = game.focusFireOperation.sideId
    ? summary.sides.find((side) => side.sideId === game.focusFireOperation.sideId)
    : undefined;
  const actorSide =
    focusFireActorSide ??
    summary.sides.find((side) => side.launches > 0 || side.confirmedHits > 0) ??
    summary.sides[0];
  const effectScore = buildBdaEffectScore({
    shockIndex: focusFireInsight.shockIndex,
    captureProgress: focusFireSummary.captureProgress,
    confirmedHitCount,
    damageEventCount,
    killEventCount,
    missionSuccessCount,
  });
  const assessedEffectLabel = getBdaAssessedEffectLabel({
    effectScore,
    captureProgress: focusFireSummary.captureProgress,
    killEventCount,
    damageEventCount,
    confirmedHitCount,
    missionSuccessCount,
  });
  const objectiveStatusLabel =
    objectiveName && focusFireSummary.statusLabel !== "대기"
      ? focusFireSummary.statusLabel
      : summary.endReason === "시나리오 종료 시간 도달"
        ? "관측 종료"
        : "사후 평가";
  const damageLevelLabel = getBdaDamageLevelLabel({
    captureProgress: focusFireSummary.captureProgress,
    killEventCount,
    damageEventCount,
    impactEventCount,
    confirmedHitCount,
  });
  const targetSummary = buildBdaTargetSummary(
    focusFireSummary,
    includeTargetAnalysis,
    objectiveName
  );
  const assessmentConfidenceScore = buildBdaConfidenceScore({
    objectiveName,
    confirmedHitCount,
    damageEventCount,
    killEventCount,
    missionSuccessCount,
    recentActionCount: recentActions.length,
    captureProgress: focusFireSummary.captureProgress,
    includeTargetAnalysis,
  });
  const assessmentConfidenceLabel = getBdaConfidenceLabel(
    assessmentConfidenceScore
  );
  const requiredEffectScore = buildBdaRequiredEffectScore(recommendation);
  const missionThresholdMet = effectScore >= requiredEffectScore;
  const costScore = buildBdaCostScore({
    launchedPlatformCount,
    launchCount,
    averageTimeToFireSeconds: recommendation?.averageTimeToFireSeconds ?? null,
    threatExposureScore: recommendation?.threatExposureScore ?? 0,
  });
  const economicScore = buildBdaEconomicScore({
    assessedEffectScore: effectScore,
    requiredEffectScore,
    missionThresholdMet,
    costScore,
  });
  const deploymentFootprintLabel = buildDeploymentFootprintLabel({
    launchedPlatformCount,
    launchCount,
  });
  const resourceEfficiencyLabel = getBdaResourceEfficiencyLabel({
    launchCount,
    confirmedHitCount,
    damageEventCount,
    killEventCount,
  });
  const tempoLabel = getBdaTempoLabel({
    objectiveStatusLabel,
    weaponsInFlight: focusFireSummary.weaponsInFlight,
    missionSuccessCount,
    launchCount,
  });
  const effectSummary = buildBdaEffectSummary({
    killEventCount,
    damageEventCount,
    impactEventCount,
    confirmedHitCount,
  });
  const operatingPicture = buildBdaOperatingPicture({
    objectiveName,
    assessedEffectLabel,
    damageLevelLabel,
    dominantAxis: focusFireInsight.dominantAxis,
    targetSummary,
    assessmentConfidenceLabel,
  });
  const benchmarkKey = buildBdaBenchmarkKey(summary, {
    objectiveName,
    targetSummary,
  });
  const currentRun: SimulationOutcomeBdaBenchmarkRun = {
    runId: buildBdaBenchmarkRunId(summary, benchmarkKey, {
      actorName: actorSide?.name ?? null,
      launchCount,
      launchedPlatformCount,
      assessedEffectScore: effectScore,
      economicScore,
      objectiveStatusLabel,
    }),
    benchmarkKey,
    actorName: actorSide?.name ?? null,
    objectiveName,
    scenarioName: summary.scenarioName,
    endedAtUnix: summary.endedAtUnix,
    endedAtLabel: summary.endedAtLabel,
    assessedEffectScore: effectScore,
    requiredEffectScore,
    missionThresholdMet,
    economicScore,
    costScore,
    launchCount,
    launchedPlatformCount,
    deploymentFootprintLabel,
    objectiveStatusLabel,
    assessmentConfidenceLabel,
  };
  const benchmark = buildBdaBenchmark(currentRun);
  const deploymentAssessmentLabel = resolveBdaDeploymentAssessmentLabel(
    currentRun,
    benchmark
  );
  const benchmarkInsight = buildBdaBenchmarkInsight(currentRun, benchmark);

  return {
    actorName: actorSide?.name ?? null,
    modeReason,
    modeReasonLabel:
      modeReason === "focus_fire"
        ? "집중포격 목표 기반 보고서"
        : "비전투 시나리오 BDA",
    operationLabel:
      modeReason === "focus_fire" ? "집중포격 BDA" : "운용 효과 BDA",
    objectiveName,
    objectiveStatusLabel,
    targetSummary,
    assetMixSummary: buildBdaAssetMixSummary(focusFireSummary),
    assessedEffectLabel,
    assessedEffectScore: effectScore,
    assessmentConfidenceLabel,
    assessmentConfidenceScore,
    damageLevelLabel,
    requiredEffectScore,
    missionThresholdMet,
    costScore,
    economicScore,
    deploymentFootprintLabel,
    deploymentAssessmentLabel,
    resourceEfficiencyLabel,
    tempoLabel,
    effectSummary,
    operatingPicture,
    averageTimeToFireSeconds: recommendation?.averageTimeToFireSeconds ?? null,
    threatExposureScore: recommendation?.threatExposureScore ?? 0,
    benchmarkInsight,
    benchmark,
    launchCount,
    confirmedHitCount,
    damageEventCount,
    killEventCount,
    impactEventCount,
    missionSuccessCount,
    captureProgress: focusFireSummary.captureProgress,
    shockIndex: focusFireInsight.shockIndex,
    dominantAxis: focusFireInsight.dominantAxis,
    launchPlatformCount: focusFireSummary.launchPlatforms.length,
    launchedPlatformCount,
    keyObservations: buildBdaObservations({
      objectiveName,
      objectiveStatusLabel,
      targetSummary,
      damageLevelLabel,
      requiredEffectScore,
      missionThresholdMet,
      economicScore,
      deploymentAssessmentLabel,
      killEventCount,
      damageEventCount,
      launchCount,
      confirmedHitCount,
      missionSuccessCount,
      dominantAxis: focusFireInsight.dominantAxis,
      shockIndex: focusFireInsight.shockIndex,
      recentActions,
    }),
    recommendations: buildBdaRecommendations({
      objectiveName,
      objectiveStatusLabel,
      assessedEffectLabel,
      missionThresholdMet,
      deploymentAssessmentLabel,
      benchmarkInsight,
      confirmedHitCount,
      killEventCount,
      launchPlatformCount: focusFireSummary.launchPlatforms.length,
      launchedPlatformCount,
      weaponsInFlight: focusFireSummary.weaponsInFlight,
      captureProgress: focusFireSummary.captureProgress,
    }),
    recentActions,
  };
}

export function buildBdaFallbackSummary(
  summary: SimulationOutcomeSummary,
  bdaReport: SimulationOutcomeBdaReport
) {
  const objectiveLabel = bdaReport.objectiveName
    ? `${bdaReport.objectiveName} BDA`
    : `${summary.scenarioName} BDA`;
  const damageSummary =
    bdaReport.killEventCount > 0
      ? `격파 ${bdaReport.killEventCount}건`
      : bdaReport.damageEventCount > 0
        ? `피해 ${bdaReport.damageEventCount}건`
        : bdaReport.confirmedHitCount > 0
          ? `탄착 ${bdaReport.confirmedHitCount}건`
          : "직접 피해 미확인";

  return `${objectiveLabel}: ${bdaReport.assessedEffectLabel}. ${bdaReport.objectiveStatusLabel} 상태에서 ${damageSummary}, 발사 ${bdaReport.launchCount}발, 경제성 ${bdaReport.economicScore}점, 분석 신뢰도 ${bdaReport.assessmentConfidenceLabel}로 평가됩니다.`;
}

