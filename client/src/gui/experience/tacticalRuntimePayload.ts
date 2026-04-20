import type { BattleSpectatorSnapshot } from "@/game/Game";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import {
  getBundleModelById,
  getImmersiveExperienceModelOptions,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import {
  buildExperienceMissionPlan,
  getExperienceModelRuntime,
  getExperienceTheme,
  type ExperienceMissionPlan,
  type ExperienceModelRuntime,
} from "@/gui/experience/experienceRuntime";
import { buildTacticalMissionPrimer } from "@/gui/experience/tacticalMissionPrimer";
import { createTacticalExperienceScenario } from "@/gui/experience/tacticalExperience";
import { buildTacticalScenarioFromBattleSnapshot } from "@/gui/experience/liveTacticalRuntime";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";

export interface TacticalSimRuntimePayload {
  profile: ImmersiveExperienceProfile;
  operationMode: string;
  theme: ReturnType<typeof getExperienceTheme>;
  asset: AssetExperienceSummary;
  model: BundleModelSelection | null;
  modelRuntime: ExperienceModelRuntime | null;
  mission: ExperienceMissionPlan;
  scenario: ReturnType<typeof createTacticalExperienceScenario>;
  primer: ReturnType<typeof buildTacticalMissionPrimer>;
  liveRuntime: {
    source: "seed" | "battle-snapshot";
    focusUnitId: string | null;
    focusSideId: string | null;
    currentTime?: number;
  };
}

function resolveModel(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  modelId?: string,
  liveModelId?: string
) {
  const modelOptions = getImmersiveExperienceModelOptions(asset, profile);
  const preferredModel = selectImmersiveExperienceModel(asset, profile);

  return (
    modelOptions.find((model) => model.id === modelId) ??
    getBundleModelById(liveModelId) ??
    preferredModel ??
    modelOptions[0] ??
    null
  );
}

export function buildTacticalSimRuntimePayload(
  route: TacticalSimRoute,
  liveSnapshot?: BattleSpectatorSnapshot
): TacticalSimRuntimePayload {
  const theme = getExperienceTheme(route.profile);
  const liveFocusModelId =
    liveSnapshot?.units.find((unit) => unit.id === route.asset.id)?.modelId ??
    undefined;
  const model = resolveModel(
    route.asset,
    route.profile,
    route.modelId,
    liveFocusModelId
  );
  const mission = buildExperienceMissionPlan(
    route.profile,
    route.operationMode,
    route.asset,
    model
  );
  const liveRuntime = liveSnapshot
    ? buildTacticalScenarioFromBattleSnapshot(liveSnapshot, route)
    : null;
  const scenario =
    liveRuntime?.scenario ??
    createTacticalExperienceScenario(
      route.asset,
      route.profile,
      route.operationMode
    );

  return {
    profile: route.profile,
    operationMode: route.operationMode,
    theme,
    asset: route.asset,
    model,
    modelRuntime: model ? getExperienceModelRuntime(model, route.profile) : null,
    mission,
    scenario,
    primer: buildTacticalMissionPrimer(mission, scenario),
    liveRuntime:
      liveRuntime?.runtime ??
      ({
        source: "seed",
        focusUnitId: null,
        focusSideId: null,
      } as const),
  };
}
