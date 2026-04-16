export const RL_LAB_SUPPORTED_ALGORITHMS = ["ppo", "a2c", "sac", "ddpg", "td3"] as const;
export type RlLabSupportedAlgorithm =
  (typeof RL_LAB_SUPPORTED_ALGORITHMS)[number];

export interface RlLabTrainingRequestLike<
  TRewardConfig extends object = Record<string, number>,
> {
  algorithms?: string[];
  timesteps?: number;
  maxEpisodeSteps?: number;
  evalEpisodes?: number;
  evalSeedCount?: number;
  curriculumEnabled?: boolean;
  seed?: number;
  progressEvalFrequency?: number;
  progressEvalEpisodes?: number;
  controllableSideName?: string;
  targetSideName?: string;
  allyIds?: string[];
  targetIds?: string[];
  highValueTargetIds?: string[];
  rewardConfig?: Partial<TRewardConfig>;
}

export interface RlLabTrainingFormLike<
  TRewardConfig extends object = Record<string, number>,
> {
  algorithms: string[];
  timesteps: number;
  maxEpisodeSteps: number;
  evalEpisodes: number;
  evalSeedCount: number;
  curriculumEnabled: boolean;
  seed: number;
  progressEvalFrequency: number;
  progressEvalEpisodes: number;
  controllableSideName: string;
  targetSideName: string;
  allyIds: string;
  targetIds: string;
  highValueTargetIds: string;
  scenarioText: string;
  rewardConfig: TRewardConfig;
}

export function parseCommaSeparatedIds(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function formatCommaSeparatedIds(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(
    ", "
  );
}

export function toggleIdSelection(values: string[], id: string) {
  return values.includes(id)
    ? values.filter((value) => value !== id)
    : [...values, id];
}

export function retainAllowedIds(values: string[], allowedIds: string[]) {
  const allowedIdSet = new Set(allowedIds);
  return values.filter((value) => allowedIdSet.has(value));
}

export function normalizeAlgorithmIds(
  values: string[] | undefined,
  fallback: string[] = [RL_LAB_SUPPORTED_ALGORITHMS[0]]
) {
  const supportedAlgorithmSet = new Set<string>(RL_LAB_SUPPORTED_ALGORITHMS);
  const fallbackNormalized = Array.from(
    new Set(
      fallback
        .map((value) => `${value}`.trim().toLowerCase())
        .filter((value) => supportedAlgorithmSet.has(value))
    )
  );
  const normalized = Array.from(
    new Set(
      (values ?? fallbackNormalized)
        .map((value) => `${value}`.trim().toLowerCase())
        .filter((value) => supportedAlgorithmSet.has(value))
    )
  );
  return normalized.length > 0
    ? normalized
    : fallbackNormalized.length > 0
      ? fallbackNormalized
      : [RL_LAB_SUPPORTED_ALGORITHMS[0]];
}

export function applyTrainingRequestToForm<
  TRewardConfig extends object,
  T extends RlLabTrainingFormLike<TRewardConfig>,
>(
  baseForm: T,
  request: RlLabTrainingRequestLike<TRewardConfig>,
  scenarioText: string
) {
  return {
    ...baseForm,
    algorithms: normalizeAlgorithmIds(request.algorithms, baseForm.algorithms),
    timesteps: request.timesteps ?? baseForm.timesteps,
    maxEpisodeSteps: request.maxEpisodeSteps ?? baseForm.maxEpisodeSteps,
    evalEpisodes: request.evalEpisodes ?? baseForm.evalEpisodes,
    evalSeedCount: request.evalSeedCount ?? baseForm.evalSeedCount,
    curriculumEnabled:
      request.curriculumEnabled ?? baseForm.curriculumEnabled,
    seed: request.seed ?? baseForm.seed,
    progressEvalFrequency:
      request.progressEvalFrequency ?? baseForm.progressEvalFrequency,
    progressEvalEpisodes:
      request.progressEvalEpisodes ?? baseForm.progressEvalEpisodes,
    controllableSideName:
      request.controllableSideName ?? baseForm.controllableSideName,
    targetSideName: request.targetSideName ?? baseForm.targetSideName,
    allyIds: formatCommaSeparatedIds(
      request.allyIds ?? parseCommaSeparatedIds(baseForm.allyIds)
    ),
    targetIds: formatCommaSeparatedIds(
      request.targetIds ?? parseCommaSeparatedIds(baseForm.targetIds)
    ),
    highValueTargetIds: formatCommaSeparatedIds(
      request.highValueTargetIds ??
        parseCommaSeparatedIds(baseForm.highValueTargetIds)
    ),
    scenarioText,
    rewardConfig: {
      ...baseForm.rewardConfig,
      ...(request.rewardConfig ?? {}),
    },
  } satisfies T;
}
