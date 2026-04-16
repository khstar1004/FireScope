export interface FocusFireRerankerCandidate {
  label: string;
  weaponName: string | null;
  ammoType: string | null;
  shotCount: number;
  launcherCount: number;
  immediateLaunchReadyCount: number;
  repositionRequiredCount: number;
  blockedLauncherCount: number;
  averageDistanceKm: number | null;
  averageTimeToFireSeconds: number | null;
  threatExposureScore: number;
  expectedStrikeEffect: number;
  suitabilityScore: number;
  desiredEffect?: number | null;
}

export interface FocusFireRerankerTelemetryOption
  extends FocusFireRerankerCandidate {
  rerankerScore?: number | null;
}

export interface FocusFireRerankerTelemetryRecord {
  recommendedOptionLabel: string | null;
  desiredEffect: number | null;
  options: FocusFireRerankerTelemetryOption[];
}

export const FOCUS_FIRE_RERANKER_FEATURE_NAMES = [
  "heuristicScore",
  "effectCoverage",
  "effectBalance",
  "expectedStrikeEffect",
  "weaponEfficiency",
  "shotDensity",
  "launcherDensity",
  "immediateReadyRatio",
  "repositionRatio",
  "blockedRatio",
  "distanceReadiness",
  "etaReadiness",
  "threatSafety",
  "responseTempo",
  "threatAdjustedCoverage",
] as const;

export type FocusFireRerankerFeatureName =
  (typeof FOCUS_FIRE_RERANKER_FEATURE_NAMES)[number];

export type FocusFireRerankerFeatureVector = Record<
  FocusFireRerankerFeatureName,
  number
>;

export interface FocusFireRerankerTreeSplit {
  feature: FocusFireRerankerFeatureName;
  threshold: number;
  leftValue: number;
  rightValue: number;
}

export interface FocusFireRerankerTreeNode {
  feature?: FocusFireRerankerFeatureName;
  threshold?: number;
  left?: FocusFireRerankerTreeNode;
  right?: FocusFireRerankerTreeNode;
  value?: number;
}

export interface FocusFireRerankerTree {
  root: FocusFireRerankerTreeNode;
}

export type FocusFireRerankerTreeModel =
  | FocusFireRerankerTreeSplit
  | FocusFireRerankerTree;

export interface FocusFireRerankerTreeEnsemble {
  trainer?: string | null;
  trees: FocusFireRerankerTreeModel[];
}

export interface FocusFireRerankerExplanation {
  summary: string;
  positiveSignals: string[];
  negativeSignals: string[];
}

export interface FocusFireRerankerModel {
  version: number;
  trainedAt: string;
  source: "default" | "telemetry-pairwise" | "telemetry-tree-ensemble";
  modelFamily: "linear" | "tree-ensemble";
  sampleCount: number;
  operatorFeedbackCount: number;
  ruleSeedCount: number;
  epochCount: number;
  learningRate: number;
  intercept: number;
  weights: FocusFireRerankerFeatureVector;
  treeEnsemble: FocusFireRerankerTreeEnsemble | null;
}

export interface FocusFireRerankerTrainingSummary {
  comparisons: number;
  recordsUsed: number;
  epochs: number;
  learningRate: number;
}

export interface FocusFireRerankedCandidate<TCandidate> {
  candidate: TCandidate;
  rerankerScore: number;
  rawRerankerScore: number;
  confidenceScore: number;
}

const DEFAULT_FEATURE_WEIGHTS: FocusFireRerankerFeatureVector = {
  heuristicScore: 0.38,
  effectCoverage: 0.98,
  effectBalance: 1.55,
  expectedStrikeEffect: 0.52,
  weaponEfficiency: 0.64,
  shotDensity: 0.1,
  launcherDensity: 0.28,
  immediateReadyRatio: 1.18,
  repositionRatio: 0.16,
  blockedRatio: -1.72,
  distanceReadiness: 0.34,
  etaReadiness: 0.78,
  threatSafety: 0.94,
  responseTempo: 1.02,
  threatAdjustedCoverage: 1.22,
};

const FEATURE_SIGNAL_LABELS: Record<
  FocusFireRerankerFeatureName,
  {
    positive: string;
    negative: string;
  }
> = {
  heuristicScore: {
    positive: "기본 규칙 점수가 높음",
    negative: "기본 규칙 점수가 낮음",
  },
  effectCoverage: {
    positive: "요망 효과 충족도가 높음",
    negative: "요망 효과 충족이 부족함",
  },
  effectBalance: {
    positive: "과잉 화력이 적고 효과 균형이 좋음",
    negative: "과잉 화력 또는 효과 불균형이 큼",
  },
  expectedStrikeEffect: {
    positive: "예상 타격효과가 충분함",
    negative: "예상 타격효과가 부족함",
  },
  weaponEfficiency: {
    positive: "발당 효과 효율이 높음",
    negative: "발당 효과 효율이 낮음",
  },
  shotDensity: {
    positive: "투입 화력량이 충분함",
    negative: "투입 화력량이 얕음",
  },
  launcherDensity: {
    positive: "가용 발포 부대가 충분함",
    negative: "가용 발포 부대가 제한됨",
  },
  immediateReadyRatio: {
    positive: "즉시 발사 가능한 부대 비율이 높음",
    negative: "즉시 발사 가능한 부대 비율이 낮음",
  },
  repositionRatio: {
    positive: "기동 여력이 허용 범위임",
    negative: "기동 필요 부대 비율이 높음",
  },
  blockedRatio: {
    positive: "차단 발포 부대 비율이 낮음",
    negative: "차단 발포 부대 비율이 높음",
  },
  distanceReadiness: {
    positive: "사거리가 유리함",
    negative: "사거리가 불리함",
  },
  etaReadiness: {
    positive: "발사 ETA가 짧음",
    negative: "발사 ETA가 긺",
  },
  threatSafety: {
    positive: "위협 노출이 낮음",
    negative: "위협 노출이 큼",
  },
  responseTempo: {
    positive: "대응 속도가 빠름",
    negative: "대응 속도가 느림",
  },
  threatAdjustedCoverage: {
    positive: "효과 대비 위험 균형이 좋음",
    negative: "효과 대비 위험이 큼",
  },
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function roundToDigits(value: number, digits: number) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function normalizePositive(value: number | null | undefined, ceiling: number) {
  if (value == null || !Number.isFinite(value) || ceiling <= 0) {
    return 0;
  }
  return clamp(value / ceiling, 0, 1);
}

function computeEffectCoverage(
  expectedStrikeEffect: number,
  desiredEffect: number | null | undefined
) {
  return desiredEffect && desiredEffect > 0
    ? clamp(expectedStrikeEffect / desiredEffect, 0, 1)
    : 0.5;
}

function computeEffectBalance(
  expectedStrikeEffect: number,
  desiredEffect: number | null | undefined
) {
  if (!(desiredEffect && desiredEffect > 0)) {
    return 0.5;
  }

  const coverageRatio = expectedStrikeEffect / desiredEffect;
  if (coverageRatio <= 1) {
    return clamp(coverageRatio, 0, 1);
  }

  // Allow modest overmatch but penalize obvious overkill so small targets do not
  // consistently absorb large salvos just because they are immediately available.
  return 1 - clamp((coverageRatio - 1) / 1.25, 0, 1) * 0.85;
}

export function createDefaultFocusFireRerankerModel(): FocusFireRerankerModel {
  return {
    version: 2,
    trainedAt: new Date(0).toISOString(),
    source: "default",
    modelFamily: "linear",
    sampleCount: 0,
    operatorFeedbackCount: 0,
    ruleSeedCount: 0,
    epochCount: 0,
    learningRate: 0,
    intercept: 0,
    weights: {
      ...DEFAULT_FEATURE_WEIGHTS,
    },
    treeEnsemble: null,
  };
}

export function buildFocusFireRerankerFeatureVector(
  candidate: FocusFireRerankerCandidate
): FocusFireRerankerFeatureVector {
  const launcherCount = Math.max(candidate.launcherCount, 0);
  const readyDenominator = Math.max(launcherCount, 1);
  const desiredEffect = candidate.desiredEffect ?? null;
  const effectCoverage = computeEffectCoverage(
    candidate.expectedStrikeEffect,
    desiredEffect
  );
  const effectBalance = computeEffectBalance(
    candidate.expectedStrikeEffect,
    desiredEffect
  );
  const immediateReadyRatio = clamp(
    candidate.immediateLaunchReadyCount / readyDenominator,
    0,
    1
  );
  const repositionRatio = clamp(
    candidate.repositionRequiredCount / readyDenominator,
    0,
    1
  );
  const blockedRatio = clamp(
    candidate.blockedLauncherCount /
      Math.max(launcherCount + candidate.blockedLauncherCount, 1),
    0,
    1
  );
  const distanceReadiness =
    1 - normalizePositive(candidate.averageDistanceKm ?? 0, 250);
  const etaReadiness =
    1 - normalizePositive(candidate.averageTimeToFireSeconds ?? 0, 900);
  const threatSafety = 1 - normalizePositive(candidate.threatExposureScore, 8);
  const weaponEfficiency = normalizePositive(
    candidate.expectedStrikeEffect / Math.max(candidate.shotCount, 1),
    1.5
  );

  return {
    heuristicScore: normalizePositive(candidate.suitabilityScore, 120),
    effectCoverage,
    effectBalance,
    expectedStrikeEffect: normalizePositive(candidate.expectedStrikeEffect, 12),
    weaponEfficiency,
    shotDensity: normalizePositive(candidate.shotCount, 24),
    launcherDensity: normalizePositive(launcherCount, 6),
    immediateReadyRatio,
    repositionRatio,
    blockedRatio,
    distanceReadiness,
    etaReadiness,
    threatSafety,
    responseTempo: clamp(
      immediateReadyRatio * 0.6 + etaReadiness * 0.4 - blockedRatio * 0.2,
      0,
      1
    ),
    threatAdjustedCoverage: clamp(
      effectCoverage * 0.55 + effectBalance * 0.25 + threatSafety * 0.2,
      0,
      1
    ),
  };
}

export function getFocusFireRerankerConfidence(model: FocusFireRerankerModel) {
  const priorConfidence =
    model.source === "default"
      ? 0.34
      : model.modelFamily === "tree-ensemble"
        ? 0.48
        : 0.4;
  if (model.source === "default") {
    return priorConfidence;
  }

  const operatorFeedbackSignal = clamp(model.operatorFeedbackCount / 8, 0, 1);
  const sampleSignal = clamp(model.sampleCount / 24, 0, 1);
  const ruleSeedSignal = clamp(model.ruleSeedCount / 24, 0, 1);
  const epochSignal = clamp(model.epochCount / 8, 0, 1);

  return roundToDigits(
    clamp(
      priorConfidence +
        operatorFeedbackSignal * 0.35 +
        sampleSignal * 0.15 +
        ruleSeedSignal * 0.05 +
        epochSignal * 0.05,
      priorConfidence,
      1
    ),
    4
  );
}

function scoreFocusFireTreeEnsembleCandidate(
  featureVector: FocusFireRerankerFeatureVector,
  model: FocusFireRerankerModel
) {
  const trees = model.treeEnsemble?.trees ?? [];
  let score = model.intercept;

  for (const tree of trees) {
    score += scoreFocusFireTreeModel(featureVector, tree);
  }

  return roundToDigits(score, 4);
}

function scoreFocusFireTreeNode(
  featureVector: FocusFireRerankerFeatureVector,
  node: FocusFireRerankerTreeNode
): number {
  if (
    typeof node.value === "number" &&
    Number.isFinite(node.value) &&
    (!node.left || !node.right || !node.feature)
  ) {
    return node.value;
  }
  if (
    !node.feature ||
    typeof node.threshold !== "number" ||
    !Number.isFinite(node.threshold) ||
    !node.left ||
    !node.right
  ) {
    return 0;
  }
  return featureVector[node.feature] <= node.threshold
    ? scoreFocusFireTreeNode(featureVector, node.left)
    : scoreFocusFireTreeNode(featureVector, node.right);
}

function scoreFocusFireTreeModel(
  featureVector: FocusFireRerankerFeatureVector,
  tree: FocusFireRerankerTreeModel
) {
  if ("root" in tree) {
    return scoreFocusFireTreeNode(featureVector, tree.root);
  }

  const featureValue = featureVector[tree.feature];
  return featureValue <= tree.threshold ? tree.leftValue : tree.rightValue;
}

function collectFocusFireTreeNodeContributions(
  featureVector: FocusFireRerankerFeatureVector,
  node: FocusFireRerankerTreeNode,
  pathFeatures: FocusFireRerankerFeatureName[] = []
): {
  score: number;
  pathFeatures: FocusFireRerankerFeatureName[];
} {
  if (
    typeof node.value === "number" &&
    Number.isFinite(node.value) &&
    (!node.left || !node.right || !node.feature)
  ) {
    return {
      score: node.value,
      pathFeatures,
    };
  }
  if (
    !node.feature ||
    typeof node.threshold !== "number" ||
    !Number.isFinite(node.threshold) ||
    !node.left ||
    !node.right
  ) {
    return {
      score: 0,
      pathFeatures,
    };
  }

  return featureVector[node.feature] <= node.threshold
    ? collectFocusFireTreeNodeContributions(featureVector, node.left, [
        ...pathFeatures,
        node.feature,
      ])
    : collectFocusFireTreeNodeContributions(featureVector, node.right, [
        ...pathFeatures,
        node.feature,
      ]);
}

function getFocusFireFeatureContributions(
  featureVector: FocusFireRerankerFeatureVector,
  model: FocusFireRerankerModel
) {
  const contributions = Object.fromEntries(
    FOCUS_FIRE_RERANKER_FEATURE_NAMES.map((featureName) => [featureName, 0])
  ) as FocusFireRerankerFeatureVector;

  if (model.modelFamily === "tree-ensemble") {
    for (const tree of model.treeEnsemble?.trees ?? []) {
      if ("root" in tree) {
        const nodeContribution = collectFocusFireTreeNodeContributions(
          featureVector,
          tree.root
        );
        const uniquePathFeatures = [...new Set(nodeContribution.pathFeatures)];
        const splitCount = Math.max(uniquePathFeatures.length, 1);
        for (const featureName of uniquePathFeatures) {
          contributions[featureName] += nodeContribution.score / splitCount;
        }
      } else {
        contributions[tree.feature] +=
          featureVector[tree.feature] <= tree.threshold
            ? tree.leftValue
            : tree.rightValue;
      }
    }
    return contributions;
  }

  for (const featureName of FOCUS_FIRE_RERANKER_FEATURE_NAMES) {
    contributions[featureName] =
      featureVector[featureName] * model.weights[featureName];
  }

  return contributions;
}

export function explainFocusFireRerankerCandidate(
  candidate: FocusFireRerankerCandidate,
  model: FocusFireRerankerModel,
  maxSignalsPerSide = 2
): FocusFireRerankerExplanation {
  const featureVector = buildFocusFireRerankerFeatureVector(candidate);
  const contributions = getFocusFireFeatureContributions(featureVector, model);
  const sortedSignals = FOCUS_FIRE_RERANKER_FEATURE_NAMES.map(
    (featureName) => ({
      featureName,
      contribution: contributions[featureName],
    })
  ).sort(
    (left, right) => Math.abs(right.contribution) - Math.abs(left.contribution)
  );
  const positiveSignals = sortedSignals
    .filter((signal) => signal.contribution > 0.02)
    .slice(0, maxSignalsPerSide)
    .map((signal) => FEATURE_SIGNAL_LABELS[signal.featureName].positive);
  const negativeSignals = sortedSignals
    .filter((signal) => signal.contribution < -0.02)
    .slice(0, maxSignalsPerSide)
    .map((signal) => FEATURE_SIGNAL_LABELS[signal.featureName].negative);

  let summary = "규칙 점수와 AI 재정렬 차이가 크지 않습니다.";
  if (positiveSignals.length > 0 && negativeSignals.length > 0) {
    summary = `${positiveSignals[0]}, 다만 ${negativeSignals[0]}.`;
  } else if (positiveSignals.length > 0) {
    summary = `${positiveSignals[0]}.`;
  } else if (negativeSignals.length > 0) {
    summary = `${negativeSignals[0]}.`;
  }

  return {
    summary,
    positiveSignals,
    negativeSignals,
  };
}

export function scoreFocusFireRerankerCandidate(
  candidate: FocusFireRerankerCandidate,
  model: FocusFireRerankerModel
) {
  const featureVector = buildFocusFireRerankerFeatureVector(candidate);
  if (model.modelFamily === "tree-ensemble") {
    return scoreFocusFireTreeEnsembleCandidate(featureVector, model);
  }

  let score = model.intercept;

  for (const featureName of FOCUS_FIRE_RERANKER_FEATURE_NAMES) {
    score += featureVector[featureName] * model.weights[featureName];
  }

  return roundToDigits(score, 4);
}

export function rerankFocusFireCandidates<
  TCandidate extends FocusFireRerankerCandidate,
>(
  candidates: TCandidate[],
  model: FocusFireRerankerModel
): FocusFireRerankedCandidate<TCandidate>[] {
  const confidenceScore = getFocusFireRerankerConfidence(model);
  return candidates
    .map((candidate, index) => ({
      candidate,
      index,
      rawRerankerScore: scoreFocusFireRerankerCandidate(candidate, model),
      blendedHeuristicScore:
        normalizePositive(candidate.suitabilityScore, 120) * 4,
    }))
    .sort((left, right) => {
      const leftCombinedScore =
        left.rawRerankerScore * confidenceScore +
        left.blendedHeuristicScore * (1 - confidenceScore);
      const rightCombinedScore =
        right.rawRerankerScore * confidenceScore +
        right.blendedHeuristicScore * (1 - confidenceScore);
      if (rightCombinedScore !== leftCombinedScore) {
        return rightCombinedScore - leftCombinedScore;
      }
      if (right.rawRerankerScore !== left.rawRerankerScore) {
        return right.rawRerankerScore - left.rawRerankerScore;
      }
      if (
        right.candidate.suitabilityScore !== left.candidate.suitabilityScore
      ) {
        return (
          right.candidate.suitabilityScore - left.candidate.suitabilityScore
        );
      }
      return left.index - right.index;
    })
    .map(({ candidate, rawRerankerScore, blendedHeuristicScore }) => ({
      candidate,
      rerankerScore: roundToDigits(
        rawRerankerScore * confidenceScore +
          blendedHeuristicScore * (1 - confidenceScore),
        4
      ),
      rawRerankerScore,
      confidenceScore,
    }));
}

function addScaledDifferenceToWeights(
  weights: FocusFireRerankerFeatureVector,
  left: FocusFireRerankerFeatureVector,
  right: FocusFireRerankerFeatureVector,
  scale: number
) {
  for (const featureName of FOCUS_FIRE_RERANKER_FEATURE_NAMES) {
    weights[featureName] += (left[featureName] - right[featureName]) * scale;
  }
}

export function trainFocusFireRerankerFromTelemetry(
  telemetryRecords: FocusFireRerankerTelemetryRecord[],
  seedModel: FocusFireRerankerModel = createDefaultFocusFireRerankerModel(),
  epochs = 8,
  learningRate = 0.08
): {
  model: FocusFireRerankerModel;
  summary: FocusFireRerankerTrainingSummary;
} {
  const linearSeedModel =
    seedModel.modelFamily === "tree-ensemble"
      ? {
          ...createDefaultFocusFireRerankerModel(),
          version: seedModel.version,
          trainedAt: seedModel.trainedAt,
          sampleCount: seedModel.sampleCount,
          operatorFeedbackCount: seedModel.operatorFeedbackCount,
          ruleSeedCount: seedModel.ruleSeedCount,
        }
      : seedModel;
  const weights: FocusFireRerankerFeatureVector = {
    ...linearSeedModel.weights,
  };
  let intercept = linearSeedModel.intercept;
  let comparisons = 0;
  let recordsUsed = 0;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    for (const record of telemetryRecords) {
      if (!Array.isArray(record.options) || record.options.length < 2) {
        continue;
      }

      const preferredOption =
        record.options.find(
          (option) => option.label === record.recommendedOptionLabel
        ) ?? record.options[0];
      if (!preferredOption) {
        continue;
      }

      const preferredCandidate = {
        ...preferredOption,
        desiredEffect: record.desiredEffect,
      } satisfies FocusFireRerankerCandidate;
      const preferredVector =
        buildFocusFireRerankerFeatureVector(preferredCandidate);
      let usedRecord = false;

      for (const option of record.options) {
        if (option.label === preferredOption.label) {
          continue;
        }

        const comparisonCandidate = {
          ...option,
          desiredEffect: record.desiredEffect,
        } satisfies FocusFireRerankerCandidate;
        const comparisonVector =
          buildFocusFireRerankerFeatureVector(comparisonCandidate);
        let margin = intercept;
        for (const featureName of FOCUS_FIRE_RERANKER_FEATURE_NAMES) {
          margin +=
            (preferredVector[featureName] - comparisonVector[featureName]) *
            weights[featureName];
        }

        comparisons += 1;
        if (margin < 1) {
          addScaledDifferenceToWeights(
            weights,
            preferredVector,
            comparisonVector,
            learningRate
          );
          intercept += learningRate * (1 - margin);
        }
        usedRecord = true;
      }

      if (usedRecord) {
        recordsUsed += 1;
      }
    }
  }

  const model: FocusFireRerankerModel = {
    version: linearSeedModel.version + 1,
    trainedAt: new Date().toISOString(),
    source: "telemetry-pairwise",
    modelFamily: "linear",
    sampleCount: telemetryRecords.length,
    operatorFeedbackCount: linearSeedModel.operatorFeedbackCount,
    ruleSeedCount: linearSeedModel.ruleSeedCount,
    epochCount: epochs,
    learningRate,
    intercept: roundToDigits(intercept, 6),
    weights: Object.fromEntries(
      FOCUS_FIRE_RERANKER_FEATURE_NAMES.map((featureName) => [
        featureName,
        roundToDigits(weights[featureName], 6),
      ])
    ) as FocusFireRerankerFeatureVector,
    treeEnsemble: null,
  };

  return {
    model,
    summary: {
      comparisons,
      recordsUsed,
      epochs,
      learningRate,
    },
  };
}
