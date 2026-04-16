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

export interface FocusFireRerankerModel {
  version: number;
  trainedAt: string;
  source: "default" | "telemetry-pairwise";
  sampleCount: number;
  operatorFeedbackCount: number;
  ruleSeedCount: number;
  epochCount: number;
  learningRate: number;
  intercept: number;
  weights: FocusFireRerankerFeatureVector;
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
    sampleCount: 0,
    operatorFeedbackCount: 0,
    ruleSeedCount: 0,
    epochCount: 0,
    learningRate: 0,
    intercept: 0,
    weights: {
      ...DEFAULT_FEATURE_WEIGHTS,
    },
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
  const priorConfidence = model.source === "default" ? 0.34 : 0.4;
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

export function scoreFocusFireRerankerCandidate(
  candidate: FocusFireRerankerCandidate,
  model: FocusFireRerankerModel
) {
  const featureVector = buildFocusFireRerankerFeatureVector(candidate);
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
  const weights: FocusFireRerankerFeatureVector = {
    ...seedModel.weights,
  };
  let intercept = seedModel.intercept;
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
    version: seedModel.version + 1,
    trainedAt: new Date().toISOString(),
    source: "telemetry-pairwise",
    sampleCount: telemetryRecords.length,
    operatorFeedbackCount: seedModel.operatorFeedbackCount,
    ruleSeedCount: seedModel.ruleSeedCount,
    epochCount: epochs,
    learningRate,
    intercept: roundToDigits(intercept, 6),
    weights: Object.fromEntries(
      FOCUS_FIRE_RERANKER_FEATURE_NAMES.map((featureName) => [
        featureName,
        roundToDigits(weights[featureName], 6),
      ])
    ) as FocusFireRerankerFeatureVector,
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
