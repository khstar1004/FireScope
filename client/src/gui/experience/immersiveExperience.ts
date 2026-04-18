import {
  AssetExperienceSummary,
  buildAssetExperienceHash,
  getAssetExperienceQueryParams,
  parseAssetExperienceQueryParams,
} from "@/gui/experience/assetExperience";
import {
  buildAssetSignature,
  isDefenseAssetSignature,
} from "@/utils/airDefenseModeling";

export const IMMERSIVE_EXPERIENCE_HASH = "#/immersive-experience";

export type ImmersiveExperienceProfile =
  | "ground"
  | "fires"
  | "defense"
  | "maritime"
  | "base";

export interface ImmersiveExperienceRoute {
  asset: AssetExperienceSummary;
  profile: ImmersiveExperienceProfile;
  modelId?: string;
}

const groundPattern =
  /\b(tank|mbt|abrams|leopard|k1|k2|ifv|apc|armored|armoured|humvee|hmmwv|km900|m113|m577|aavp)\b/i;
const firesPattern =
  /\b(artillery|howitzer|mlrs|rocket|launcher|ballistic|hyunmoo|chunmoo|atacms|paladin|k9|k55|himars|tomahawk|jassm)\b/i;

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

export function isImmersiveExperienceRoute(hash: string) {
  return hash.startsWith(IMMERSIVE_EXPERIENCE_HASH);
}

export function getImmersiveExperienceQueryParams(hash: string) {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

export function inferImmersiveExperienceProfile(
  asset: AssetExperienceSummary
): ImmersiveExperienceProfile {
  if (asset.kind === "ship") {
    return "maritime";
  }

  if (asset.kind === "airbase") {
    return "base";
  }

  const signature = buildAssetSignature(asset.className, asset.name);
  const matchesDefense = isDefenseAssetSignature(signature);
  const matchesFires = firesPattern.test(signature);
  const matchesGround = groundPattern.test(signature);

  if (asset.kind === "facility") {
    if (matchesDefense) return "defense";
    if (matchesFires) return "fires";
    if (matchesGround) return "ground";
    return "base";
  }

  if (asset.kind === "weapon") {
    if (matchesDefense) return "defense";
    return "fires";
  }

  if (matchesGround) {
    return "ground";
  }

  if (matchesDefense) {
    return "defense";
  }

  if (matchesFires) {
    return "fires";
  }

  return "ground";
}

export function getImmersiveExperienceLabel(
  profile: ImmersiveExperienceProfile
) {
  switch (profile) {
    case "ground":
      return "지상 기동 브리프";
    case "fires":
      return "화력 운용 브리프";
    case "defense":
      return "방공 체계 브리프";
    case "maritime":
      return "해상 전력 브리프";
    case "base":
      return "기지 운용 브리프";
  }
}

export function buildImmersiveExperienceHash(
  asset: AssetExperienceSummary,
  profile = inferImmersiveExperienceProfile(asset),
  options?: {
    modelId?: string;
  }
) {
  const params = getAssetExperienceQueryParams(buildAssetExperienceHash(asset));
  params.set("profile", profile);
  if (options?.modelId) {
    params.set("modelId", options.modelId);
  }

  return `${IMMERSIVE_EXPERIENCE_HASH}?${params.toString()}`;
}

export function parseImmersiveExperienceQueryParams(
  params: URLSearchParams
): ImmersiveExperienceRoute | null {
  const asset = parseAssetExperienceQueryParams(params);
  if (!asset) {
    return null;
  }

  const profileParam = params.get("profile");

  return {
    asset,
    profile: isImmersiveProfile(profileParam)
      ? profileParam
      : inferImmersiveExperienceProfile(asset),
    modelId: params.get("modelId") ?? undefined,
  };
}

export function isImmersiveExperienceDemoAsset(asset: AssetExperienceSummary) {
  return asset.id.startsWith("demo-immersive-");
}

export function createImmersiveExperienceDemoAsset(
  profile: ImmersiveExperienceProfile,
  center?: number[]
): AssetExperienceSummary {
  const [longitude = 127.042, latitude = 37.525] = center ?? [];

  switch (profile) {
    case "ground":
      return {
        kind: "facility",
        id: "demo-immersive-ground",
        name: "K2 Black Panther Demo",
        className: "K2 Black Panther",
        sideName: "DEMO",
        latitude,
        longitude,
        altitude: 120,
        speed: 38,
        range: 4,
        weaponCount: 1,
      };
    case "fires":
      return {
        kind: "facility",
        id: "demo-immersive-fires",
        name: "Chunmoo Battery Demo",
        className: "Chunmoo MRLS",
        sideName: "DEMO",
        latitude,
        longitude,
        altitude: 160,
        range: 45,
        weaponCount: 2,
      };
    case "defense":
      return {
        kind: "facility",
        id: "demo-immersive-defense",
        name: "L-SAM Battery Demo",
        className: "L-SAM",
        sideName: "DEMO",
        latitude,
        longitude,
        altitude: 180,
        range: 120,
        weaponCount: 4,
      };
    case "maritime":
      return {
        kind: "ship",
        id: "demo-immersive-maritime",
        name: "Sejong Demo",
        className: "Sejong the Great-class Destroyer",
        sideName: "DEMO",
        latitude,
        longitude,
        altitude: 0,
        speed: 28,
        range: 180,
        weaponCount: 6,
        aircraftCount: 1,
      };
    case "base":
      return {
        kind: "airbase",
        id: "demo-immersive-base",
        name: "Seoul Air Base Demo",
        className: "Airfield",
        sideName: "DEMO",
        latitude,
        longitude,
        altitude: 230,
        aircraftCount: 8,
      };
  }
}
