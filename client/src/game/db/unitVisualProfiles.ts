import {
  isDroneAircraftClassName,
  isFiresFacilityClassName,
  isSupportAircraftClassName,
  isTankFacilityClassName,
} from "@/utils/assetTypeCatalog";
import {
  buildAssetSignature,
  isDefenseAssetSignature,
  resolveDefenseVisualizationPolicy,
} from "@/utils/airDefenseModeling";

export type UnitVisualEntityType =
  | "aircraft"
  | "facility"
  | "airbase"
  | "ship"
  | "weapon";

export type UnitVisualProfileId =
  | "aircraft-apache"
  | "aircraft-blackhawk"
  | "aircraft-f15-basic"
  | "aircraft-f15-lowpoly"
  | "aircraft-f15-strike"
  | "aircraft-f16"
  | "aircraft-f35"
  | "aircraft-kf21"
  | "artillery-d30"
  | "artillery-howitzer"
  | "artillery-hyunmoo"
  | "artillery-k9"
  | "artillery-k9-variant"
  | "artillery-nasams"
  | "artillery-nasams-battery"
  | "artillery-paladin"
  | "artillery-patriot"
  | "artillery-roketsan"
  | "artillery-shell"
  | "artillery-thaad"
  | "drone-animated"
  | "drone-quad"
  | "ship-carrier"
  | "ship-destroyer"
  | "ship-tanker"
  | "ship-yi-sun-shin"
  | "ship-submarine"
  | "tank-k2"
  | "tank-k21"
  | "tank-km900"
  | "tank-m113"
  | "tank-m577"
  | "tank-stryker"
  | "tank-tracked-armor"
  | "weapon-air-to-air-missile"
  | "weapon-surface-missile"
  | "weapon-artillery-shell";

export type Battle3dProfileHint =
  | "ground"
  | "fires"
  | "defense"
  | "maritime"
  | "base";

export interface ResolveUnitVisualProfileOptions {
  entityType: UnitVisualEntityType;
  className: string;
  name?: string;
  dbVisualProfileId?: string | null;
}

const EXACT_AIRCRAFT_PROFILE_IDS: Record<string, UnitVisualProfileId> = {
  "AH-64 Apache": "aircraft-apache",
  "AH-64D Apache": "aircraft-apache",
  "CH-47 Chinook": "aircraft-blackhawk",
  "F-15": "aircraft-f15-strike",
  "F-15 Eagle": "aircraft-f15-strike",
  "F-15K Slam Eagle": "aircraft-f15-strike",
  "F-16 Fighting Falcon": "aircraft-f16",
  "F-16C Fighting Falcon": "aircraft-f16",
  "F-35 Lightning II": "aircraft-f35",
  "KF-16 Fighting Falcon": "aircraft-f16",
  "KF-21 Boramae": "aircraft-kf21",
  "KC-135R Stratotanker": "aircraft-f15-lowpoly",
  "RQ-4 Global Hawk": "drone-animated",
  "UH-60 Black Hawk": "aircraft-blackhawk",
};

const EXACT_FACILITY_PROFILE_IDS: Record<string, UnitVisualProfileId> = {
  "155mm Artillery Shell": "artillery-shell",
  "D-30 Howitzer": "artillery-d30",
  "K2 Black Panther": "tank-k2",
  "K21 Infantry Fighting Vehicle": "tank-k21",
  "K9 Thunder": "artillery-k9",
  "KM900 APC": "tank-km900",
  "M109A6 Paladin": "artillery-paladin",
  "M113 APC": "tank-m113",
  "M577 Command Vehicle": "tank-m577",
  "M1126 Stryker": "tank-stryker",
  NASAMS: "artillery-nasams-battery",
  "NASAMS Battery": "artillery-nasams-battery",
  Patriot: "artillery-patriot",
  "THAAD Battery": "artillery-thaad",
};

const EXACT_SHIP_PROFILE_IDS: Record<string, UnitVisualProfileId> = {
  "Dokdo-class Amphibious Assault Ship": "ship-carrier",
  "Sejong the Great-class Destroyer": "ship-yi-sun-shin",
  "Type 45 Destroyer": "ship-destroyer",
  "Yi Sun-shin-class Destroyer": "ship-yi-sun-shin",
  "Chungmugong Yi Sun-sin-class Destroyer": "ship-yi-sun-shin",
  "Fast Combat Support Ship": "ship-tanker",
  "USS Texas SSN-775": "ship-submarine",
};

const EXACT_WEAPON_PROFILE_IDS: Record<string, UnitVisualProfileId> = {
  "120mm Shell": "weapon-artillery-shell",
  "155mm Shell": "weapon-artillery-shell",
  "AIM-120 AMRAAM": "weapon-air-to-air-missile",
  "AIM-9 Sidewinder": "weapon-air-to-air-missile",
  "AGM-114 Hellfire": "weapon-surface-missile",
  "AGM-158 JASSM": "weapon-surface-missile",
  "PAC-3 MSE": "weapon-surface-missile",
  Tomahawk: "weapon-surface-missile",
};

function resolveAircraftVisualProfileId(
  className: string,
  signature: string
): UnitVisualProfileId {
  const exact = EXACT_AIRCRAFT_PROFILE_IDS[className];
  if (exact) {
    return exact;
  }

  if (isDroneAircraftClassName(className)) {
    return "drone-animated";
  }
  if (/\b(ah-64|apache)\b/i.test(signature)) {
    return "aircraft-apache";
  }
  if (
    /\b(uh-60|black hawk|blackhawk|helicopter|helo|ch-47|chinook)\b/i.test(
      signature
    )
  ) {
    return "aircraft-blackhawk";
  }
  if (/\b(kf-21|boramae)\b/i.test(signature)) {
    return "aircraft-kf21";
  }
  if (/\b(f-35|lightning|stealth|f-22|raptor|b-2)\b/i.test(signature)) {
    return "aircraft-f35";
  }
  if (/\b(f-16|kf-16|fa-50|ta-50|t-50|falcon)\b/i.test(signature)) {
    return "aircraft-f16";
  }
  if (/\b(f-15|f-15k|slam eagle|strike eagle|eagle)\b/i.test(signature)) {
    return "aircraft-f15-strike";
  }
  if (
    isSupportAircraftClassName(className) ||
    /\b(kc-135|c-130|c-17|c-12|tanker|transport|cargo|airlift)\b/i.test(
      signature
    )
  ) {
    return "aircraft-f15-lowpoly";
  }
  return "aircraft-f15-basic";
}

function resolveFacilityVisualProfileId(
  className: string,
  signature: string
): UnitVisualProfileId | undefined {
  const exact = EXACT_FACILITY_PROFILE_IDS[className];
  if (exact) {
    return exact;
  }

  if (/\b(patriot|mim-104)\b/i.test(signature)) {
    return "artillery-patriot";
  }
  if (/\b(nasams)\b/i.test(signature)) {
    return /\b(battery|launcher|system|radar)\b/i.test(signature)
      ? "artillery-nasams-battery"
      : "artillery-nasams";
  }
  if (/\b(thaad)\b/i.test(signature)) {
    return "artillery-thaad";
  }

  const defenseVisualizationPolicy = resolveDefenseVisualizationPolicy(className);
  if (defenseVisualizationPolicy?.proxyVisualProfileId) {
    return defenseVisualizationPolicy.proxyVisualProfileId;
  }
  if (isDefenseAssetSignature(signature)) {
    return undefined;
  }
  if (
    /\b(hyunmoo|ballistic|surface to surface|surface-to-surface|launcher)\b/i.test(
      signature
    )
  ) {
    return "artillery-hyunmoo";
  }
  if (/\b(m109|paladin)\b/i.test(signature)) {
    return "artillery-paladin";
  }
  if (
    /\b(d-30|d30|fh70|m777|towed howitzer|towed artillery)\b/i.test(signature)
  ) {
    return "artillery-d30";
  }
  if (/\b(roketsan)\b/i.test(signature)) {
    return "artillery-roketsan";
  }
  if (/\b(chunmoo|mlrs|rocket|himars)\b/i.test(signature)) {
    return "artillery-k9-variant";
  }
  if (
    isFiresFacilityClassName(className) ||
    /\b(k9|k55|howitzer|artillery)\b/i.test(signature)
  ) {
    return "artillery-k9";
  }
  if (/\b(m577|command vehicle|command post)\b/i.test(signature)) {
    return "tank-m577";
  }
  if (/\b(k21|ifv|bmp|bradley|warrior)\b/i.test(signature)) {
    return "tank-k21";
  }
  if (/\b(m1126|stryker|lav|wheeled apc|wheeled ifv)\b/i.test(signature)) {
    return "tank-stryker";
  }
  if (/\b(km900|humvee|hmmwv|armored car)\b/i.test(signature)) {
    return "tank-km900";
  }
  if (/\b(m113|aavp|apc)\b/i.test(signature)) {
    return "tank-m113";
  }
  if (/\b(k2|k1|k1a1|k1a2|black panther|mbt)\b/i.test(signature)) {
    return "tank-k2";
  }
  if (isTankFacilityClassName(className)) {
    return "tank-k2";
  }
  if (/\b(tank|armor|tracked)\b/i.test(signature)) {
    return "tank-tracked-armor";
  }
  return undefined;
}

function resolveShipVisualProfileId(
  className: string,
  signature: string
): UnitVisualProfileId {
  const exact = EXACT_SHIP_PROFILE_IDS[className];
  if (exact) {
    return exact;
  }

  if (/\b(submarine|ssn|sss|sub)\b/i.test(signature)) {
    return "ship-submarine";
  }
  if (/\b(carrier|dokdo|amphibious|lhd)\b/i.test(signature)) {
    return "ship-carrier";
  }
  if (/\b(sejong|yi sun|yi-sun|chungmugong|kdx)\b/i.test(signature)) {
    return "ship-yi-sun-shin";
  }
  if (
    /\b(tanker|oiler|replenishment|supply ship|support ship|cargo ship)\b/i.test(
      signature
    )
  ) {
    return "ship-tanker";
  }
  return "ship-destroyer";
}

function resolveWeaponVisualProfileId(
  className: string,
  signature: string
): UnitVisualProfileId {
  const exact = EXACT_WEAPON_PROFILE_IDS[className];
  if (exact) {
    return exact;
  }

  if (/\b(aim-|air-to-air|amraam|sidewinder)\b/i.test(signature)) {
    return "weapon-air-to-air-missile";
  }
  if (isDefenseAssetSignature(signature)) {
    return "weapon-surface-missile";
  }
  if (
    /\b(agm-|jassm|tomahawk|pac-3|missile|rocket|hellfire|brimstone)\b/i.test(
      signature
    )
  ) {
    return "weapon-surface-missile";
  }
  return "weapon-artillery-shell";
}

export function resolveUnitVisualProfileId({
  entityType,
  className,
  name,
  dbVisualProfileId,
}: ResolveUnitVisualProfileOptions): UnitVisualProfileId | undefined {
  if (dbVisualProfileId && dbVisualProfileId.trim().length > 0) {
    return dbVisualProfileId as UnitVisualProfileId;
  }

  const signature = buildAssetSignature(className, name);

  switch (entityType) {
    case "aircraft":
      return resolveAircraftVisualProfileId(className, signature);
    case "facility":
      return resolveFacilityVisualProfileId(className, signature);
    case "ship":
      return resolveShipVisualProfileId(className, signature);
    case "weapon":
      return resolveWeaponVisualProfileId(className, signature);
    case "airbase":
      return undefined;
  }
}

export function inferBattle3dProfileHint(
  entityType: UnitVisualEntityType,
  className: string,
  name = ""
): Battle3dProfileHint {
  if (entityType === "ship") {
    return "maritime";
  }
  if (entityType === "airbase" || entityType === "aircraft") {
    return "base";
  }

  const modelId = resolveUnitVisualProfileId({
    entityType,
    className,
    name,
  });
  const signature = buildAssetSignature(className, name);

  if (
    modelId === "tank-km900" ||
    modelId === "tank-m113" ||
    modelId === "tank-m577" ||
    modelId === "tank-k2" ||
    modelId === "tank-k21" ||
    modelId === "tank-stryker" ||
    modelId === "tank-tracked-armor"
  ) {
    return "ground";
  }
  if (
    modelId === "artillery-patriot" ||
    modelId === "artillery-nasams" ||
    modelId === "artillery-nasams-battery" ||
    modelId === "artillery-thaad"
  ) {
    return "defense";
  }
  if (isDefenseAssetSignature(signature)) {
    return "defense";
  }
  return "fires";
}

export function isGroundVisualProfileId(
  profileId: UnitVisualProfileId | undefined
) {
  return (
    profileId === "tank-km900" ||
    profileId === "tank-m113" ||
    profileId === "tank-m577" ||
    profileId === "tank-k2" ||
    profileId === "tank-k21" ||
    profileId === "tank-stryker" ||
    profileId === "tank-tracked-armor"
  );
}
