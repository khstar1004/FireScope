import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import { resolveUnitVisualProfileId } from "@/game/db/unitVisualProfiles";
import {
  buildAssetSignature,
  isDefenseAssetSignature,
  resolveDefenseVisualizationPolicy,
} from "@/utils/airDefenseModeling";
import { resolvePublicAssetPath } from "@/utils/publicAssetUrl";

export type BundleModelBundle =
  | "aircraft"
  | "drone"
  | "artillery"
  | "tank"
  | "ship";

export interface BundleModelSelection {
  id: string;
  bundle: BundleModelBundle;
  path: string;
  label: string;
  note: string;
}

function createModel(
  id: string,
  bundle: BundleModelBundle,
  path: string,
  label: string,
  note: string
): BundleModelSelection {
  return {
    id,
    bundle,
    path: resolvePublicAssetPath(path),
    label,
    note,
  };
}

const DRONE_MODELS = {
  animated: createModel(
    "drone-animated",
    "drone",
    "/3d-bundles/drone/models/animated_drone.glb",
    "Animated Drone",
    "정찰/감시 드론 계열"
  ),
  quad: createModel(
    "drone-quad",
    "drone",
    "/3d-bundles/drone/models/drone.glb",
    "Quad Drone",
    "소형 회전익 드론 계열"
  ),
};

const AIRCRAFT_MODELS = {
  apache: createModel(
    "aircraft-apache",
    "aircraft",
    "/3d-bundles/aircraft/models/boeing_ah-64d_apache_combat_helicopter.glb",
    "AH-64 Apache",
    "공격 헬기 계열"
  ),
  blackhawk: createModel(
    "aircraft-blackhawk",
    "aircraft",
    "/3d-bundles/aircraft/models/sikorsky_uh-60m_blackhawk.glb",
    "UH-60 Black Hawk",
    "수송/다목적 헬기 계열"
  ),
  f15Basic: createModel(
    "aircraft-f15-basic",
    "aircraft",
    "/3d-bundles/aircraft/models/f-15.glb",
    "F-15",
    "기본 전투기 실루엣"
  ),
  f15LowPoly: createModel(
    "aircraft-f15-lowpoly",
    "aircraft",
    "/3d-bundles/aircraft/models/low_poly_f-15.glb",
    "F-15 Low Poly",
    "경량 전시용 전투기 모델"
  ),
  f15Strike: createModel(
    "aircraft-f15-strike",
    "aircraft",
    "/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb",
    "F-15 Strike Eagle",
    "중형 공격전투기 계열"
  ),
  kf21: createModel(
    "aircraft-kf21",
    "aircraft",
    "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
    "KF-21 Boramae",
    "한국형 멀티롤 전투기 계열"
  ),
  f16: createModel(
    "aircraft-f16",
    "aircraft",
    "/3d-bundles/aircraft/models/lockheed_martin_f-16ef_fighting_falcon.glb",
    "F-16 Fighting Falcon",
    "경량 멀티롤 전투기 계열"
  ),
  f35: createModel(
    "aircraft-f35",
    "aircraft",
    "/3d-bundles/aircraft/models/f-35_lightning_ii_-_fighter_jet_-_free.glb",
    "F-35 Lightning II",
    "스텔스 전투기 계열"
  ),
};

const ARTILLERY_MODELS = {
  shell: createModel(
    "artillery-shell",
    "artillery",
    "/3d-bundles/artillery/models/artillery_shell.glb",
    "Artillery Shell",
    "미사일/탄체 전시용"
  ),
  drum: createModel(
    "artillery-drum",
    "artillery",
    "/3d-bundles/artillery/models/drum_artillery.glb",
    "Drum Artillery",
    "견인·야포 계열"
  ),
  d30: createModel(
    "artillery-d30",
    "artillery",
    "/3d-bundles/artillery/models/d-30_howitzer.glb",
    "D-30 Howitzer",
    "견인 곡사포 계열"
  ),
  howitzer: createModel(
    "artillery-howitzer",
    "artillery",
    "/3d-bundles/artillery/models/howitzer_artillery_tank.glb",
    "Howitzer",
    "곡사 화력 계열"
  ),
  hyunmoo: createModel(
    "artillery-hyunmoo",
    "artillery",
    "/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb",
    "Hyunmoo Launcher",
    "장거리 미사일 런처 계열"
  ),
  roketsan: createModel(
    "artillery-roketsan",
    "artillery",
    "/3d-bundles/artillery/models/roketsan_missiles.glb",
    "Roketsan Missiles",
    "로켓·미사일 탄체 전시용"
  ),
  k9: createModel(
    "artillery-k9",
    "artillery",
    "/3d-bundles/artillery/models/k9_thunder_artillery.glb",
    "K9 Thunder",
    "한국 자주포 계열"
  ),
  k9Variant: createModel(
    "artillery-k9-variant",
    "artillery",
    "/3d-bundles/artillery/models/k9_thunder_artillery (1).glb",
    "K9 Thunder Variant",
    "K9 자주포 변형 모델"
  ),
  paladin: createModel(
    "artillery-paladin",
    "artillery",
    "/3d-bundles/artillery/models/m109a6_paladin_self-propelled_howitzer.glb",
    "M109A6 Paladin",
    "자주포 계열"
  ),
  patriot: createModel(
    "artillery-patriot",
    "artillery",
    "/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb",
    "Patriot",
    "중거리 방공 체계"
  ),
  nasams: createModel(
    "artillery-nasams",
    "artillery",
    "/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb",
    "NASAMS",
    "기동형 중거리 방공 체계"
  ),
  nasamsBattery: createModel(
    "artillery-nasams-battery",
    "artillery",
    "/3d-bundles/artillery/models/nasams_battery.glb",
    "NASAMS Battery",
    "배터리 단위 중거리 방공 체계"
  ),
  thaad: createModel(
    "artillery-thaad",
    "artillery",
    "/3d-bundles/artillery/models/thaad-2.glb",
    "THAAD",
    "고고도 방공 체계"
  ),
};

const TANK_MODELS = {
  k2: createModel(
    "tank-k2",
    "tank",
    "/3d-bundles/tank/models/k2_black_panther_tank.glb",
    "K2 Black Panther",
    "한국 주력전차 계열"
  ),
  k21: createModel(
    "tank-k21",
    "tank",
    "/3d-bundles/tank/models/k21_armored_warfare.glb",
    "K21 IFV",
    "보병전투차/중형 궤도 장갑차 계열"
  ),
  km900: createModel(
    "tank-km900",
    "tank",
    "/3d-bundles/tank/models/south_korean_km900_apc.glb",
    "KM900 APC",
    "차륜형 장갑차 계열"
  ),
  m113: createModel(
    "tank-m113",
    "tank",
    "/3d-bundles/tank/models/m113a1.glb",
    "M113A1",
    "궤도형 장갑차 계열"
  ),
  m577: createModel(
    "tank-m577",
    "tank",
    "/3d-bundles/tank/models/m577_command_vehicle.glb",
    "M577 Command Vehicle",
    "지휘 차량 계열"
  ),
  stryker: createModel(
    "tank-stryker",
    "tank",
    "/3d-bundles/tank/models/m1126_stryker_50_cal.glb",
    "M1126 Stryker",
    "차륜형 보병 전투차/장갑차 계열"
  ),
  trackedArmor: createModel(
    "tank-tracked-armor",
    "tank",
    "/3d-bundles/tank/models/t-50_war_thunder.glb",
    "Tracked Armor",
    "전차/중장갑 공용 계열"
  ),
};

const SHIP_MODELS = {
  carrier: createModel(
    "ship-carrier",
    "ship",
    "/3d-bundles/ships/hms_queen_elizabeth_r08_aircraft_carrier.glb",
    "HMS Queen Elizabeth",
    "항공모함/대형 강습함 계열"
  ),
  destroyer: createModel(
    "ship-destroyer",
    "ship",
    "/3d-bundles/ships/type-45_destroyer_class.glb",
    "Type 45 Destroyer",
    "구축함/호위함 계열"
  ),
  yiSunShin: createModel(
    "ship-yi-sun-shin",
    "ship",
    "/3d-bundles/ships/yi_sun_shin_class_destroyer.glb",
    "Yi Sun-shin Class Destroyer",
    "한국 구축함/대형 호위함 계열"
  ),
  submarine: createModel(
    "ship-submarine",
    "ship",
    "/3d-bundles/ships/uss_texas_ssn-775_submarine.glb",
    "USS Texas SSN-775",
    "잠수함 계열"
  ),
  tanker: createModel(
    "ship-tanker",
    "ship",
    "/3d-bundles/ships/tanker_ship.glb",
    "Fleet Tanker",
    "보급함/지원함 계열"
  ),
};

const AIR_MODEL_OPTIONS = [
  AIRCRAFT_MODELS.f15Strike,
  AIRCRAFT_MODELS.kf21,
  AIRCRAFT_MODELS.f15Basic,
  AIRCRAFT_MODELS.f15LowPoly,
  AIRCRAFT_MODELS.f16,
  AIRCRAFT_MODELS.f35,
  AIRCRAFT_MODELS.apache,
  AIRCRAFT_MODELS.blackhawk,
  DRONE_MODELS.animated,
  DRONE_MODELS.quad,
];

const GROUND_MODEL_OPTIONS = [
  TANK_MODELS.k2,
  TANK_MODELS.k21,
  TANK_MODELS.stryker,
  TANK_MODELS.km900,
  TANK_MODELS.m113,
  TANK_MODELS.m577,
  TANK_MODELS.trackedArmor,
];

const FIRE_MODEL_OPTIONS = [
  ARTILLERY_MODELS.k9,
  ARTILLERY_MODELS.k9Variant,
  ARTILLERY_MODELS.paladin,
  ARTILLERY_MODELS.d30,
  ARTILLERY_MODELS.howitzer,
  ARTILLERY_MODELS.drum,
  ARTILLERY_MODELS.hyunmoo,
  ARTILLERY_MODELS.roketsan,
  ARTILLERY_MODELS.shell,
];

const DEFENSE_MODEL_OPTIONS = [
  ARTILLERY_MODELS.patriot,
  ARTILLERY_MODELS.nasamsBattery,
  ARTILLERY_MODELS.nasams,
  ARTILLERY_MODELS.thaad,
];

const MARITIME_MODEL_OPTIONS = [
  SHIP_MODELS.yiSunShin,
  SHIP_MODELS.destroyer,
  SHIP_MODELS.carrier,
  SHIP_MODELS.tanker,
  SHIP_MODELS.submarine,
];

const ALL_MODEL_OPTIONS = [
  ...AIR_MODEL_OPTIONS,
  ...GROUND_MODEL_OPTIONS,
  ...FIRE_MODEL_OPTIONS,
  ...DEFENSE_MODEL_OPTIONS,
  ...MARITIME_MODEL_OPTIONS,
];

function buildSignature(asset: AssetExperienceSummary) {
  return buildAssetSignature(asset.className, asset.name);
}

function isDroneSignature(signature: string) {
  return /\b(drone|uav|mq-|rq-|global hawk|predator|reaper)\b/i.test(signature);
}

function pickAircraftModel(signature: string) {
  if (isDroneSignature(signature)) {
    return DRONE_MODELS.animated;
  }
  if (/\b(ah-64|apache)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.apache;
  }
  if (
    /\b(uh-60|black hawk|blackhawk|helicopter|helo|ch-47|chinook)\b/i.test(
      signature
    )
  ) {
    return AIRCRAFT_MODELS.blackhawk;
  }
  if (/\b(kf-21|boramae)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.kf21;
  }
  if (/\b(f-35|lightning|stealth|f-22|raptor|b-2)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.f35;
  }
  if (/\b(f-16|kf-16|fa-50|ta-50|t-50|falcon)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.f16;
  }
  if (/\b(f-15|f-15k|slam eagle|strike eagle|eagle)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.f15Strike;
  }
  if (
    /\b(kc-135|c-130|c-17|c-12|tanker|transport|cargo|airlift)\b/i.test(
      signature
    )
  ) {
    return AIRCRAFT_MODELS.f15LowPoly;
  }
  return AIRCRAFT_MODELS.f15Basic;
}

function pickGroundModel(signature: string) {
  if (/\b(m577|command vehicle|command post)\b/i.test(signature)) {
    return TANK_MODELS.m577;
  }
  if (/\b(k21|ifv|bmp|bradley|warrior)\b/i.test(signature)) {
    return TANK_MODELS.k21;
  }
  if (/\b(m1126|stryker|lav|wheeled apc|wheeled ifv)\b/i.test(signature)) {
    return TANK_MODELS.stryker;
  }
  if (/\b(km900|humvee|hmmwv|armored car)\b/i.test(signature)) {
    return TANK_MODELS.km900;
  }
  if (/\b(m113|aavp|apc)\b/i.test(signature)) {
    return TANK_MODELS.m113;
  }
  if (/\b(k2|k1|k1a1|k1a2|black panther|mbt)\b/i.test(signature)) {
    return TANK_MODELS.k2;
  }
  return TANK_MODELS.trackedArmor;
}

function pickFiresModel(signature: string) {
  if (/\b(patriot|mim-104)\b/i.test(signature)) {
    return ARTILLERY_MODELS.patriot;
  }
  if (
    /\b(nasams)\b/i.test(signature) &&
    /\b(battery|launcher|system|radar|air defense|surface-to-air|surface to air)\b/i.test(
      signature
    )
  ) {
    return ARTILLERY_MODELS.nasamsBattery;
  }
  if (/\b(nasams)\b/i.test(signature)) {
    return ARTILLERY_MODELS.nasams;
  }
  if (/\b(thaad|l-sam)\b/i.test(signature)) {
    return ARTILLERY_MODELS.thaad;
  }
  if (
    /\b(hyunmoo|ballistic|surface to surface|surface-to-surface|launcher|tactical surface to surface)\b/i.test(
      signature
    )
  ) {
    return ARTILLERY_MODELS.hyunmoo;
  }
  if (/\b(m109|paladin)\b/i.test(signature)) {
    return ARTILLERY_MODELS.paladin;
  }
  if (
    /\b(d-30|d30|fh70|m777|towed howitzer|towed artillery)\b/i.test(signature)
  ) {
    return ARTILLERY_MODELS.d30;
  }
  if (/\b(roketsan)\b/i.test(signature)) {
    return ARTILLERY_MODELS.roketsan;
  }
  if (/\b(chunmoo|mlrs|rocket|himars)\b/i.test(signature)) {
    return ARTILLERY_MODELS.hyunmoo;
  }
  if (/\b(k9|k55|howitzer|artillery)\b/i.test(signature)) {
    return ARTILLERY_MODELS.k9;
  }
  if (/\b(jassm|tomahawk|agm|aim|missile|shell|round)\b/i.test(signature)) {
    return ARTILLERY_MODELS.shell;
  }
  return ARTILLERY_MODELS.howitzer;
}

function pickDefenseModel(signature: string) {
  if (/\b(patriot|mim-104)\b/i.test(signature)) {
    return ARTILLERY_MODELS.patriot;
  }
  if (/\b(nasams)\b/i.test(signature)) {
    return /\b(battery|launcher|system|radar)\b/i.test(signature)
      ? ARTILLERY_MODELS.nasamsBattery
      : ARTILLERY_MODELS.nasams;
  }
  if (/\b(thaad)\b/i.test(signature)) {
    return ARTILLERY_MODELS.thaad;
  }

  const defensePolicy = resolveDefenseVisualizationPolicy(signature);
  if (defensePolicy?.proxyVisualProfileId) {
    return getBundleModelById(defensePolicy.proxyVisualProfileId);
  }

  return null;
}

function pickShipModel(signature: string) {
  if (/\b(submarine|ssn|sss|sub)\b/i.test(signature)) {
    return SHIP_MODELS.submarine;
  }
  if (/\b(carrier|dokdo|amphibious|lhd)\b/i.test(signature)) {
    return SHIP_MODELS.carrier;
  }
  if (/\b(sejong|yi sun|yi-sun|chungmugong|kdx)\b/i.test(signature)) {
    return SHIP_MODELS.yiSunShin;
  }
  if (
    /\b(tanker|oiler|replenishment|supply ship|support ship|cargo ship)\b/i.test(
      signature
    )
  ) {
    return SHIP_MODELS.tanker;
  }
  return SHIP_MODELS.destroyer;
}

function pickBaseModel(signature: string) {
  if (isDroneSignature(signature)) {
    return DRONE_MODELS.animated;
  }
  if (/\b(ah-64|apache)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.apache;
  }
  if (
    /\b(uh-60|black hawk|blackhawk|helicopter|helo|ch-47|chinook)\b/i.test(
      signature
    )
  ) {
    return AIRCRAFT_MODELS.blackhawk;
  }
  if (/\b(kf-21|boramae)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.kf21;
  }
  if (/\b(f-35|lightning|stealth|f-22|raptor|b-2)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.f35;
  }
  if (/\b(f-16|kf-16|fa-50|ta-50|t-50|falcon)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.f16;
  }
  if (
    /\b(kc-135|c-130|c-17|c-12|tanker|transport|cargo|airlift)\b/i.test(
      signature
    )
  ) {
    return AIRCRAFT_MODELS.f15LowPoly;
  }
  if (/\b(f-15|f-15k|slam eagle|strike eagle|eagle)\b/i.test(signature)) {
    return AIRCRAFT_MODELS.f15Strike;
  }
  return AIRCRAFT_MODELS.f15Strike;
}

export function getImmersiveExperienceModelOptions(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile
) {
  const defensePolicy =
    asset.kind === "facility" && profile === "defense"
      ? resolveDefenseVisualizationPolicy(asset.className, asset.name)
      : null;

  if (defensePolicy?.mode === "concept") {
    return [];
  }

  switch (profile) {
    case "ground":
      return GROUND_MODEL_OPTIONS;
    case "fires":
      return FIRE_MODEL_OPTIONS;
    case "defense":
      return DEFENSE_MODEL_OPTIONS;
    case "maritime":
      return MARITIME_MODEL_OPTIONS;
    case "base":
      return AIR_MODEL_OPTIONS;
  }
}

export function getBundleModelById(modelId?: string) {
  if (!modelId) {
    return null;
  }

  return ALL_MODEL_OPTIONS.find((model) => model.id === modelId) ?? null;
}

function resolveAssetVisualModel(asset: AssetExperienceSummary) {
  const entityType =
    asset.kind === "weapon"
      ? "weapon"
      : asset.kind === "facility"
        ? "facility"
        : asset.kind === "ship"
          ? "ship"
          : asset.kind === "airbase"
            ? "airbase"
            : "aircraft";

  return getBundleModelById(
    resolveUnitVisualProfileId({
      entityType,
      className: asset.className,
      name: asset.name,
    })
  );
}

export function selectAssetExperienceModel(asset: AssetExperienceSummary) {
  const resolvedModel = resolveAssetVisualModel(asset);
  if (resolvedModel) {
    return resolvedModel;
  }

  const signature = buildSignature(asset);

  if (asset.kind === "aircraft") {
    return pickAircraftModel(signature);
  }
  if (asset.kind === "ship") {
    return pickShipModel(signature);
  }
  if (asset.kind === "weapon" || asset.kind === "facility") {
    return isDefenseAssetSignature(signature)
      ? pickDefenseModel(signature)
      : pickFiresModel(signature);
  }

  return null;
}

export function selectImmersiveExperienceModel(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile
) {
  const signature = buildSignature(asset);
  const defensePolicy =
    asset.kind === "facility" && profile === "defense"
      ? resolveDefenseVisualizationPolicy(asset.className, asset.name)
      : null;

  if (defensePolicy?.mode === "concept") {
    return null;
  }

  const resolvedModel = resolveAssetVisualModel(asset);
  if (
    resolvedModel &&
    getImmersiveExperienceModelOptions(asset, profile).some(
      (model) => model.id === resolvedModel.id
    )
  ) {
    return resolvedModel;
  }

  switch (profile) {
    case "ground":
      return pickGroundModel(signature);
    case "fires":
      return pickFiresModel(signature);
    case "defense":
      return pickDefenseModel(signature);
    case "maritime":
      return pickShipModel(signature);
    case "base":
      return pickBaseModel(signature);
  }
}
