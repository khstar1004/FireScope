import {
  getFocusFireRerankerConfidence,
  createDefaultFocusFireRerankerModel,
  rerankFocusFireCandidates,
  scoreFocusFireRerankerCandidate,
  trainFocusFireRerankerFromTelemetry,
  type FocusFireRerankerCandidate,
  type FocusFireRerankerModel,
} from "@/game/focusFireReranker";

function createCandidate(
  label: string,
  overrides: Partial<FocusFireRerankerCandidate> = {}
): FocusFireRerankerCandidate {
  return {
    label,
    weaponName: label,
    ammoType: "범용",
    shotCount: 4,
    launcherCount: 2,
    immediateLaunchReadyCount: 1,
    repositionRequiredCount: 1,
    blockedLauncherCount: 0,
    averageDistanceKm: 60,
    averageTimeToFireSeconds: 120,
    threatExposureScore: 2,
    expectedStrikeEffect: 3,
    suitabilityScore: 60,
    desiredEffect: 4,
    ...overrides,
  };
}

function createZeroSeedModel(): FocusFireRerankerModel {
  const defaultModel = createDefaultFocusFireRerankerModel();
  return {
    ...defaultModel,
    weights: Object.fromEntries(
      Object.keys(defaultModel.weights).map((key) => [key, 0])
    ) as FocusFireRerankerModel["weights"],
  };
}

describe("focus fire reranker", () => {
  test("uses the linear model to prefer the stronger candidate", () => {
    const model = createDefaultFocusFireRerankerModel();
    const immediateCandidate = createCandidate("Immediate", {
      immediateLaunchReadyCount: 2,
      repositionRequiredCount: 0,
      averageTimeToFireSeconds: 0,
      threatExposureScore: 1,
      suitabilityScore: 58,
    });
    const delayedCandidate = createCandidate("Delayed", {
      immediateLaunchReadyCount: 0,
      repositionRequiredCount: 2,
      averageTimeToFireSeconds: 420,
      threatExposureScore: 4.5,
      suitabilityScore: 68,
    });

    const ranked = rerankFocusFireCandidates(
      [delayedCandidate, immediateCandidate],
      model
    );

    expect(ranked[0]?.candidate.label).toBe("Immediate");
    expect(ranked[0]?.rerankerScore).toBeGreaterThan(
      ranked[1]?.rerankerScore ?? 0
    );
  });

  test("penalizes obvious overkill when desired effect is small", () => {
    const model = createDefaultFocusFireRerankerModel();
    const balancedCandidate = createCandidate("Balanced", {
      expectedStrikeEffect: 2.1,
      shotCount: 3,
      desiredEffect: 2,
      suitabilityScore: 56,
    });
    const overkillCandidate = createCandidate("Overkill", {
      expectedStrikeEffect: 6.8,
      shotCount: 8,
      desiredEffect: 2,
      suitabilityScore: 70,
    });

    const ranked = rerankFocusFireCandidates(
      [overkillCandidate, balancedCandidate],
      model
    );

    expect(ranked[0]?.candidate.label).toBe("Balanced");
  });

  test("improves preferred-vs-rejected score margin after telemetry training", () => {
    const preferred = createCandidate("Preferred", {
      immediateLaunchReadyCount: 1,
      repositionRequiredCount: 0,
      blockedLauncherCount: 0,
      averageDistanceKm: 42,
      averageTimeToFireSeconds: 35,
      threatExposureScore: 1.2,
      suitabilityScore: 45,
      expectedStrikeEffect: 2.5,
    });
    const rejected = createCandidate("Rejected", {
      immediateLaunchReadyCount: 0,
      repositionRequiredCount: 1,
      blockedLauncherCount: 1,
      averageDistanceKm: 48,
      averageTimeToFireSeconds: 260,
      threatExposureScore: 5.4,
      suitabilityScore: 84,
      expectedStrikeEffect: 3.4,
    });
    const seedModel = createZeroSeedModel();
    const baselineMargin =
      scoreFocusFireRerankerCandidate(preferred, seedModel) -
      scoreFocusFireRerankerCandidate(rejected, seedModel);

    const { model, summary } = trainFocusFireRerankerFromTelemetry(
      [
        {
          recommendedOptionLabel: preferred.label,
          desiredEffect: 4,
          options: [preferred, rejected],
        },
        {
          recommendedOptionLabel: preferred.label,
          desiredEffect: 4,
          options: [preferred, rejected],
        },
      ],
      seedModel,
      10,
      0.12
    );
    const trainedMargin =
      scoreFocusFireRerankerCandidate(preferred, model) -
      scoreFocusFireRerankerCandidate(rejected, model);

    expect(summary.comparisons).toBeGreaterThan(0);
    expect(summary.recordsUsed).toBeGreaterThan(0);
    expect(model.source).toBe("telemetry-pairwise");
    expect(trainedMargin).toBeGreaterThan(baselineMargin);
  });

  test("raises model confidence as operator feedback accumulates", () => {
    const defaultModel = createDefaultFocusFireRerankerModel();
    const trainedModel: FocusFireRerankerModel = {
      ...defaultModel,
      source: "telemetry-pairwise",
      sampleCount: 12,
      operatorFeedbackCount: 6,
      ruleSeedCount: 4,
      epochCount: 8,
    };

    expect(getFocusFireRerankerConfidence(defaultModel)).toBeGreaterThan(0.3);
    expect(getFocusFireRerankerConfidence(trainedModel)).toBeGreaterThan(
      getFocusFireRerankerConfidence(defaultModel)
    );
  });
});
