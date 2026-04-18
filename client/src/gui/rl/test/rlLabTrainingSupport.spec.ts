import {
  applyTrainingRequestToForm,
  formatCommaSeparatedIds,
  normalizeAlgorithmIds,
  parseCommaSeparatedIds,
  type RlLabTrainingFormLike,
  type RlLabTrainingRequestLike,
  retainAllowedIds,
  toggleIdSelection,
} from "@/gui/rl/rlLabTrainingSupport";

describe("rlLabTrainingSupport", () => {
  test("applies a prior job request back into the training form", () => {
    const baseForm: RlLabTrainingFormLike<{
      killBase: number;
      highValueTargetBonus: number;
    }> = {
      experimentLabel: "",
      algorithms: ["ppo"],
      timesteps: 4096,
      maxEpisodeSteps: 240,
      evalEpisodes: 1,
      evalSeedCount: 3,
      curriculumEnabled: false,
      guidedLaunchBootstrapSteps: 12,
      seed: 7,
      progressEvalFrequency: 512,
      progressEvalEpisodes: 1,
      controllableSideName: "BLUE",
      targetSideName: "RED",
      allyIds: "blue-1, blue-2",
      targetIds: "target-1",
      highValueTargetIds: "target-1",
      scenarioText: "{}",
      rewardConfig: {
        killBase: 100,
        highValueTargetBonus: 50,
      },
    };
    const request: RlLabTrainingRequestLike<{
      killBase: number;
      highValueTargetBonus: number;
    }> = {
      algorithms: ["TD3", "DDPG", "SAC", "ppo", "unsupported", "sac"],
      timesteps: 2048,
      maxEpisodeSteps: 180,
      curriculumEnabled: true,
      guidedLaunchBootstrapSteps: 8,
      progressEvalFrequency: 256,
      controllableSideName: "ALPHA",
      targetSideName: "BRAVO",
      allyIds: ["alpha-1"],
      targetIds: ["bravo-1", "bravo-2"],
      highValueTargetIds: ["bravo-2"],
      rewardConfig: {
        killBase: 120,
      },
    };
    const nextForm = applyTrainingRequestToForm(
      baseForm,
      request,
      '{"scenario":true}'
    );

    expect(nextForm.algorithms).toEqual(["td3", "ddpg", "sac", "ppo"]);
    expect(nextForm.timesteps).toBe(2048);
    expect(nextForm.maxEpisodeSteps).toBe(180);
    expect(nextForm.curriculumEnabled).toBe(true);
    expect(nextForm.guidedLaunchBootstrapSteps).toBe(8);
    expect(nextForm.progressEvalFrequency).toBe(256);
    expect(nextForm.controllableSideName).toBe("ALPHA");
    expect(nextForm.targetSideName).toBe("BRAVO");
    expect(nextForm.allyIds).toBe("alpha-1");
    expect(nextForm.targetIds).toBe("bravo-1, bravo-2");
    expect(nextForm.highValueTargetIds).toBe("bravo-2");
    expect(nextForm.scenarioText).toBe('{"scenario":true}');
    expect(nextForm.rewardConfig).toEqual({
      killBase: 120,
      highValueTargetBonus: 50,
    });
  });

  test("toggles selections and prunes invalid high value targets", () => {
    const nextIds = toggleIdSelection(["a", "b"], "c");
    const removedIds = toggleIdSelection(nextIds, "b");

    expect(nextIds).toEqual(["a", "b", "c"]);
    expect(removedIds).toEqual(["a", "c"]);
    expect(retainAllowedIds(["t-1", "t-2"], ["t-2", "t-3"])).toEqual(["t-2"]);
  });

  test("parses and formats comma separated ids without duplicates", () => {
    expect(parseCommaSeparatedIds("alpha, beta, , alpha")).toEqual([
      "alpha",
      "beta",
      "alpha",
    ]);
    expect(formatCommaSeparatedIds(["alpha", "beta", "alpha", ""])).toBe(
      "alpha, beta"
    );
  });

  test("normalizes algorithm ids and falls back to PPO when none are valid", () => {
    expect(
      normalizeAlgorithmIds(["TD3", "DDPG", "SAC", "ppo", "invalid", "sac"])
    ).toEqual(["td3", "ddpg", "sac", "ppo"]);
    expect(normalizeAlgorithmIds(["invalid"], ["bad"])).toEqual(["ppo"]);
  });
});
