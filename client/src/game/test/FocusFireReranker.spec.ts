import {
  getFocusFireRerankerConfidence,
  createDefaultFocusFireRerankerModel,
  describeFocusFireRerankerModel,
  explainFocusFireRerankerCandidate,
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

  test("supports imported tree-ensemble rankers for option ordering", () => {
    const baseModel = createDefaultFocusFireRerankerModel();
    const treeModel: FocusFireRerankerModel = {
      ...baseModel,
      source: "telemetry-tree-ensemble",
      modelFamily: "tree-ensemble",
      origin: "imported-json",
      sampleCount: 24,
      operatorFeedbackCount: 10,
      ruleSeedCount: 8,
      epochCount: 20,
      intercept: 0,
      weights: Object.fromEntries(
        Object.keys(baseModel.weights).map((key) => [key, 0])
      ) as FocusFireRerankerModel["weights"],
      treeEnsemble: {
        trainer: "LightGBM LambdaMART",
        trees: [
          {
            root: {
              feature: "blockedRatio",
              threshold: 0.1,
              left: {
                feature: "threatAdjustedCoverage",
                threshold: 0.72,
                left: {
                  value: -0.2,
                },
                right: {
                  value: 0.95,
                },
              },
              right: {
                value: -0.7,
              },
            },
          },
        ],
      },
    };
    const preferred = createCandidate("TreePreferred", {
      expectedStrikeEffect: 4.1,
      desiredEffect: 4,
      blockedLauncherCount: 0,
      threatExposureScore: 1.3,
    });
    const blocked = createCandidate("Blocked", {
      expectedStrikeEffect: 3.3,
      desiredEffect: 4,
      blockedLauncherCount: 2,
      launcherCount: 2,
      threatExposureScore: 3.8,
    });

    const ranked = rerankFocusFireCandidates([blocked, preferred], treeModel);

    expect(ranked[0]?.candidate.label).toBe("TreePreferred");
    expect(ranked[0]?.rawRerankerScore).toBeGreaterThan(
      ranked[1]?.rawRerankerScore ?? 0
    );
  });

  test("describes built-in models as bundled and not downloaded", () => {
    const descriptor = describeFocusFireRerankerModel(
      createDefaultFocusFireRerankerModel()
    );

    expect(descriptor.displayName).toBe("내장 기본 선형 랭커");
    expect(descriptor.originLabel).toBe("앱 내장");
    expect(descriptor.downloadLabel).toBe("별도 다운로드 없음");
    expect(descriptor.storageLabel).toContain("client/src/game/focusFireReranker.ts");
    expect(descriptor.topFeatureLabels.length).toBeGreaterThan(0);
  });

  test("describes imported lightgbm tree models as external lambdamart rankers", () => {
    const baseModel = createDefaultFocusFireRerankerModel();
    const descriptor = describeFocusFireRerankerModel({
      ...baseModel,
      source: "telemetry-tree-ensemble",
      modelFamily: "tree-ensemble",
      origin: "imported-json",
      treeEnsemble: {
        trainer: "LightGBM LambdaMART",
        trees: [
          {
            root: {
              feature: "blockedRatio",
              threshold: 0.2,
              left: {
                value: 0.4,
              },
              right: {
                value: -0.3,
              },
            },
          },
        ],
      },
    });

    expect(descriptor.displayName).toBe("외부 LambdaMART 트리 랭커");
    expect(descriptor.familyLabel).toContain("트리 앙상블");
    expect(descriptor.downloadLabel).toBe("사용자가 선택한 JSON 파일");
    expect(descriptor.topFeatureLabels).toContain("차단 비율");
  });

  test("produces readable positive and negative ranking signals", () => {
    const model = createDefaultFocusFireRerankerModel();
    const candidate = createCandidate("Explained", {
      immediateLaunchReadyCount: 1,
      repositionRequiredCount: 0,
      blockedLauncherCount: 1,
      averageTimeToFireSeconds: 20,
      threatExposureScore: 4.8,
      expectedStrikeEffect: 2.2,
      desiredEffect: 4,
    });

    const explanation = explainFocusFireRerankerCandidate(candidate, model);

    expect(explanation.summary.length).toBeGreaterThan(0);
    expect(explanation.positiveSignals.length).toBeGreaterThan(0);
    expect(explanation.negativeSignals.length).toBeGreaterThan(0);
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
