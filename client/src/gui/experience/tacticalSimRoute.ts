import {
  type AssetExperienceSummary,
  buildAssetExperienceHash,
  getAssetExperienceQueryParams,
  parseAssetExperienceQueryParams,
} from "@/gui/experience/assetExperience";
import {
  getDefaultImmersiveOperationMode,
  getImmersiveOperationOptions,
} from "@/gui/experience/immersiveOperations";
import {
  type ImmersiveExperienceProfile,
  inferImmersiveExperienceProfile,
} from "@/gui/experience/immersiveExperience";

export const TACTICAL_SIM_HASH = "#/tactical-sim";

export interface TacticalSimRoute {
  asset: AssetExperienceSummary;
  profile: ImmersiveExperienceProfile;
  operationMode: string;
  modelId?: string;
}

interface TacticalSimHashOptions {
  modelId?: string;
  operationMode?: string;
}

function isImmersiveProfile(
  value: string | null
): value is ImmersiveExperienceProfile {
  return (
    value === "ground" ||
    value === "fires" ||
    value === "defense" ||
    value === "maritime" ||
    value === "base"
  );
}

function resolveOperationMode(
  profile: ImmersiveExperienceProfile,
  operationMode: string | null
) {
  const validOption = getImmersiveOperationOptions(profile).find(
    (option) => option.id === operationMode
  );

  return validOption?.id ?? getDefaultImmersiveOperationMode(profile);
}

export function isTacticalSimRoute(hash: string) {
  return hash.startsWith(TACTICAL_SIM_HASH);
}

export function getTacticalSimQueryParams(hash: string) {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

export function buildTacticalSimHash(
  asset: AssetExperienceSummary,
  profile = inferImmersiveExperienceProfile(asset),
  options: TacticalSimHashOptions = {}
) {
  const params = getAssetExperienceQueryParams(buildAssetExperienceHash(asset));

  params.set("profile", profile);

  const operationMode = resolveOperationMode(profile, options.operationMode ?? null);
  params.set("operation", operationMode);

  if (options.modelId) {
    params.set("modelId", options.modelId);
  }

  return `${TACTICAL_SIM_HASH}?${params.toString()}`;
}

export function parseTacticalSimQueryParams(
  params: URLSearchParams
): TacticalSimRoute | null {
  const asset = parseAssetExperienceQueryParams(params);
  if (!asset) {
    return null;
  }

  const profileParam = params.get("profile");
  const profile = isImmersiveProfile(profileParam)
    ? profileParam
    : inferImmersiveExperienceProfile(asset);

  if (!profile) {
    return null;
  }

  const modelId = params.get("modelId") ?? undefined;

  return {
    asset,
    profile,
    operationMode: resolveOperationMode(profile, params.get("operation")),
    modelId,
  };
}
