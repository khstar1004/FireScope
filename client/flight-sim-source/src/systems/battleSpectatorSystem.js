import * as Cesium from "cesium";
import { resolveAssetUrl as assetUrl } from "../utils/assetPaths";
import {
  buildUnitModelRenderContext,
  hasGroundModelBudget,
  isGroundRenderUnit,
  resolveDisplayedUnitPoint,
  resolveUnitModelRenderProfile,
} from "./battleSpectatorModelRender";
import { resolveUnitModelScaleProfile } from "./battleSpectatorModelScale";

const SIDE_COLOR_MAP = {
  blue: "#7fe7ff",
  red: "#ff6b6b",
  silver: "#dce5f2",
  yellow: "#ffd166",
  green: "#80ed99",
  black: "#f1f5f9",
};

const AIRCRAFT_MODEL_MAP = [
  [
    /\b(kf-21|boramae)\b/i,
    "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
  ],
  [
    /\b(f-35|lightning|stealth|raptor)\b/i,
    "/3d-bundles/aircraft/models/f-35_lightning_ii_-_fighter_jet_-_free.glb",
  ],
  [
    /\b(f-16|kf-16|falcon|fa-50|ta-50|t-50)\b/i,
    "/3d-bundles/aircraft/models/lockheed_martin_f-16ef_fighting_falcon.glb",
  ],
  [
    /\b(f-15|strike eagle|eagle)\b/i,
    "/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb",
  ],
  [
    /\b(apache|ah-64)\b/i,
    "/3d-bundles/aircraft/models/boeing_ah-64d_apache_combat_helicopter.glb",
  ],
  [
    /\b(black hawk|blackhawk|uh-60|helicopter|helo|chinook)\b/i,
    "/3d-bundles/aircraft/models/sikorsky_uh-60m_blackhawk.glb",
  ],
  [
    /\b(drone|uav|mq-|rq-|reaper|predator|global hawk)\b/i,
    "/3d-bundles/drone/models/animated_drone.glb",
  ],
];

const SHIP_MODEL_MAP = [
  [
    /\b(submarine|ssn|sss|sub)\b/i,
    "/3d-bundles/ships/uss_texas_ssn-775_submarine.glb",
  ],
  [
    /\b(carrier|dokdo|amphibious|lhd)\b/i,
    "/3d-bundles/ships/hms_queen_elizabeth_r08_aircraft_carrier.glb",
  ],
];

const FACILITY_MODEL_MAP = [
  [
    /\b(patriot|mim-104)\b/i,
    "/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb",
  ],
  [
    /\b(nasams)\b/i,
    "/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb",
  ],
  [/\b(thaad|l-sam)\b/i, "/3d-bundles/artillery/models/thaad-2.glb"],
  [
    /\b(hyunmoo|ballistic|surface-to-surface|surface to surface|launcher)\b/i,
    "/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb",
  ],
  [
    /\b(chunmoo|mlrs|himars|rocket)\b/i,
    "/3d-bundles/artillery/models/k9_thunder_artillery (1).glb",
  ],
  [
    /\b(k9|k55|howitzer|artillery|paladin|m109)\b/i,
    "/3d-bundles/artillery/models/k9_thunder_artillery.glb",
  ],
  [
    /\b(command vehicle|command post|m577)\b/i,
    "/3d-bundles/tank/models/m577_command_vehicle.glb",
  ],
  [
    /\b(km900|humvee|hmmwv|wheeled)\b/i,
    "/3d-bundles/tank/models/south_korean_km900_apc.glb",
  ],
  [/\b(m113|apc)\b/i, "/3d-bundles/tank/models/m113a1.glb"],
  [
    /\b(k2|tank|armor|tracked)\b/i,
    "/3d-bundles/tank/models/t-50_war_thunder.glb",
  ],
];

const WEAPON_MODEL_MAP = [
  [
    /\b(aim-|agm-|jassm|tomahawk|missile)\b/i,
    "/3d-bundles/missile/aim-120c_amraam.glb",
  ],
  [
    /\b(shell|round|rocket|artillery)\b/i,
    "/3d-bundles/artillery/models/artillery_shell.glb",
  ],
];

const DEFAULT_UNIT_MODEL = {
  aircraft: "/3d-bundles/aircraft/models/f-15.glb",
  ship: "/3d-bundles/ships/type-45_destroyer_class.glb",
  facility: "/3d-bundles/tank/models/t-50_war_thunder.glb",
};

// Keep imported assets grounded against the Korea-scale globe view.
const UNIT_MODEL_SCALE_PRESET = {
  ship: {
    default: 0.24,
    submarine: 0.16,
    minimumPixelSize: 12,
    maximumScale: 52,
  },
  aircraft: {
    default: 0.22,
    drone: 0.26,
    minimumPixelSize: 10,
    maximumScale: 36,
  },
  ground: {
    default: 0.16,
    launcher: 0.2,
    minimumPixelSize: 8,
    maximumScale: 24,
  },
};

const UNIT_MODEL_URI_BY_ID = {
  "aircraft-apache":
    "/3d-bundles/aircraft/models/boeing_ah-64d_apache_combat_helicopter.glb",
  "aircraft-blackhawk":
    "/3d-bundles/aircraft/models/sikorsky_uh-60m_blackhawk.glb",
  "aircraft-f15-basic": "/3d-bundles/aircraft/models/f-15.glb",
  "aircraft-f15-lowpoly": "/3d-bundles/aircraft/models/low_poly_f-15.glb",
  "aircraft-f15-strike":
    "/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb",
  "aircraft-f16":
    "/3d-bundles/aircraft/models/lockheed_martin_f-16ef_fighting_falcon.glb",
  "aircraft-f35":
    "/3d-bundles/aircraft/models/f-35_lightning_ii_-_fighter_jet_-_free.glb",
  "aircraft-kf21": "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
  "artillery-d30": "/3d-bundles/artillery/models/d-30_howitzer.glb",
  "artillery-howitzer":
    "/3d-bundles/artillery/models/howitzer_artillery_tank.glb",
  "artillery-hyunmoo": "/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb",
  "artillery-k9": "/3d-bundles/artillery/models/k9_thunder_artillery.glb",
  "artillery-k9-variant":
    "/3d-bundles/artillery/models/k9_thunder_artillery (1).glb",
  "artillery-nasams":
    "/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb",
  "artillery-nasams-battery":
    "/3d-bundles/artillery/models/nasams_battery.glb",
  "artillery-paladin":
    "/3d-bundles/artillery/models/m109a6_paladin_self-propelled_howitzer.glb",
  "artillery-patriot":
    "/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb",
  "artillery-roketsan": "/3d-bundles/artillery/models/roketsan_missiles.glb",
  "artillery-thaad": "/3d-bundles/artillery/models/thaad-2.glb",
  "drone-animated": "/3d-bundles/drone/models/animated_drone.glb",
  "drone-quad": "/3d-bundles/drone/models/drone.glb",
  "ship-carrier":
    "/3d-bundles/ships/hms_queen_elizabeth_r08_aircraft_carrier.glb",
  "ship-destroyer": "/3d-bundles/ships/type-45_destroyer_class.glb",
  "ship-submarine": "/3d-bundles/ships/uss_texas_ssn-775_submarine.glb",
  "tank-k2": "/3d-bundles/tank/models/k2_black_panther_tank.glb",
  "tank-k21": "/3d-bundles/tank/models/k21_armored_warfare.glb",
  "tank-km900": "/3d-bundles/tank/models/south_korean_km900_apc.glb",
  "tank-m113": "/3d-bundles/tank/models/m113a1.glb",
  "tank-m577": "/3d-bundles/tank/models/m577_command_vehicle.glb",
  "tank-stryker": "/3d-bundles/tank/models/m1126_stryker_50_cal.glb",
  "tank-tracked-armor": "/3d-bundles/tank/models/t-50_war_thunder.glb",
};

const WEAPON_MODEL_URI_BY_ID = {
  "weapon-air-to-air-missile": "/3d-bundles/missile/aim-120c_amraam.glb",
  "weapon-surface-missile": "/3d-bundles/missile/aim-120c_amraam.glb",
  "weapon-artillery-shell": "/3d-bundles/artillery/models/artillery_shell.glb",
};
const TRAJECTORY_WEAPON_SIGNATURE =
  /\b(aim-|agm-|asm|sam|aam|atgm|jdam|jassm|tomahawk|hyunmoo|guided|missile|rocket)\b/i;
const NON_TRAJECTORY_WEAPON_SIGNATURE =
  /\b(shell|round|bullet|cannon|gun|30mm|20mm|40mm|57mm|76mm|90mm|105mm|120mm|125mm|127mm|130mm|152mm|155mm)\b/i;

const DEFAULT_LOD_LEVEL = "balanced";
const DEFAULT_CAMERA_PROFILE = "tactical";
const UNIT_SAMPLE_SECONDS = 0.35;
const WEAPON_SAMPLE_SECONDS = 0.28;
const LOD_CONFIG = {
  cinematic: {
    facilityModelBudget: 180,
    labelDistance: 180000,
    unitLabelBudget: 14,
    weaponImpactLabelBudget: 6,
    eventBudget: 7,
    eventLabelBudget: 3,
    hotspotBudget: 3,
    hotspotLabelBudget: 2,
    sidePressureLabelBudget: 2,
    sidePressureBudget: 4,
    sidePressureDistance: 210000,
    sidePressureArrowWidth: 4.4,
    targetLinkBudget: 18,
    targetLinkDistance: 175000,
    targetLinkWidth: 3.8,
    targetLinkGlowPower: 0.24,
    unitGuideDistance: 190000,
    unitGuideWidth: 2.8,
    weaponGuideDistance: 210000,
    weaponGuideWidth: 2.8,
    unitTrailTime: 22,
    unitTrailWidth: 3,
    weaponImpactLinkDistance: 220000,
    weaponImpactLinkWidth: 4.2,
    weaponTrajectoryDistance: 240000,
    weaponTrajectoryWidth: 5,
    weaponTrajectoryProjectedWidth: 3.9,
    weaponTrailTime: 9.4,
    weaponPathWidth: 6.6,
    weaponGlowPower: 0.3,
    weaponModelScale: 0.42,
    weaponMinimumPixelSize: 18,
    weaponMaximumScale: 88,
    weaponPointSize: 12,
    impactLifetimeSeconds: 2.1,
    impactSmokeLifetimeSeconds: 5.6,
  },
  balanced: {
    facilityModelBudget: 96,
    labelDistance: 125000,
    unitLabelBudget: 9,
    weaponImpactLabelBudget: 4,
    eventBudget: 5,
    eventLabelBudget: 2,
    hotspotBudget: 2,
    hotspotLabelBudget: 1,
    sidePressureLabelBudget: 1,
    sidePressureBudget: 3,
    sidePressureDistance: 150000,
    sidePressureArrowWidth: 3.9,
    targetLinkBudget: 12,
    targetLinkDistance: 132000,
    targetLinkWidth: 3.1,
    targetLinkGlowPower: 0.2,
    unitGuideDistance: 138000,
    unitGuideWidth: 2.3,
    weaponGuideDistance: 150000,
    weaponGuideWidth: 2.4,
    unitTrailTime: 16,
    unitTrailWidth: 2.4,
    weaponImpactLinkDistance: 168000,
    weaponImpactLinkWidth: 3.6,
    weaponTrajectoryDistance: 184000,
    weaponTrajectoryWidth: 4.4,
    weaponTrajectoryProjectedWidth: 3.3,
    weaponTrailTime: 7.4,
    weaponPathWidth: 5.6,
    weaponGlowPower: 0.26,
    weaponModelScale: 0.38,
    weaponMinimumPixelSize: 16,
    weaponMaximumScale: 72,
    weaponPointSize: 10,
    impactLifetimeSeconds: 1.6,
    impactSmokeLifetimeSeconds: 4.2,
  },
  performance: {
    facilityModelBudget: 24,
    labelDistance: 60000,
    unitLabelBudget: 4,
    weaponImpactLabelBudget: 1,
    eventBudget: 3,
    eventLabelBudget: 1,
    hotspotBudget: 1,
    hotspotLabelBudget: 0,
    sidePressureLabelBudget: 0,
    sidePressureBudget: 2,
    sidePressureDistance: 80000,
    sidePressureArrowWidth: 2.8,
    targetLinkBudget: 4,
    targetLinkDistance: 70000,
    targetLinkWidth: 2.2,
    targetLinkGlowPower: 0.16,
    unitGuideDistance: 75000,
    unitGuideWidth: 1.6,
    weaponGuideDistance: 88000,
    weaponGuideWidth: 1.8,
    unitTrailTime: 8,
    unitTrailWidth: 1.6,
    weaponImpactLinkDistance: 98000,
    weaponImpactLinkWidth: 2.5,
    weaponTrajectoryDistance: 108000,
    weaponTrajectoryWidth: 2.9,
    weaponTrajectoryProjectedWidth: 2.2,
    weaponTrailTime: 4.2,
    weaponPathWidth: 3.6,
    weaponGlowPower: 0.2,
    weaponModelScale: 0.28,
    weaponMinimumPixelSize: 10,
    weaponMaximumScale: 34,
    weaponPointSize: 7,
    impactLifetimeSeconds: 1,
    impactSmokeLifetimeSeconds: 2.6,
  },
};

const scratchPoint = new Cesium.Cartesian3();
const scratchHpr = new Cesium.HeadingPitchRoll();
const scratchOrientation = new Cesium.Quaternion();
const IMPACT_FLASH_BASE_COLOR = Cesium.Color.fromCssColorString("#ffd7a3");
const IMPACT_EMBER_BASE_COLOR = Cesium.Color.fromCssColorString("#ff8757");
const IMPACT_SMOKE_BASE_COLOR = Cesium.Color.fromCssColorString("#d7dee8");

function getLodConfig(lodLevel) {
  return LOD_CONFIG[lodLevel] ?? LOD_CONFIG[DEFAULT_LOD_LEVEL];
}

function resolveImpactFlashColor(alpha = 1) {
  return IMPACT_FLASH_BASE_COLOR.withAlpha(alpha);
}

function resolveImpactEmberColor(alpha = 1) {
  return IMPACT_EMBER_BASE_COLOR.withAlpha(alpha);
}

function resolveImpactSmokeColor(alpha = 1) {
  return IMPACT_SMOKE_BASE_COLOR.withAlpha(alpha);
}

function normalizeCameraProfile(cameraProfile) {
  return cameraProfile === "side" ||
    cameraProfile === "chase" ||
    cameraProfile === "orbit"
    ? cameraProfile
    : DEFAULT_CAMERA_PROFILE;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeHeading(headingDeg) {
  return ((headingDeg % 360) + 360) % 360;
}

function colorForSide(sideColor, alpha = 1) {
  const normalized =
    typeof sideColor === "string" && sideColor.trim().length > 0
      ? sideColor.trim().toLowerCase()
      : "silver";
  const cssColor = SIDE_COLOR_MAP[normalized] ?? normalized;
  return Cesium.Color.fromCssColorString(cssColor).withAlpha(alpha);
}

function buildSignature(item) {
  return `${item?.className ?? ""} ${item?.name ?? ""}`.toLowerCase();
}

function cartesianFromSnapshot(point, fallback = scratchPoint) {
  return Cesium.Cartesian3.fromDegrees(
    Number(point?.longitude) || 0,
    Number(point?.latitude) || 0,
    Math.max(0, Number(point?.altitudeMeters) || 0),
    undefined,
    fallback
  );
}

function resolveUnitModelHeightReference(unit) {
  return isGroundRenderUnit(unit)
    ? Cesium.HeightReference.RELATIVE_TO_GROUND
    : Cesium.HeightReference.NONE;
}

function resolveUnitOverlayHeightReference(unit) {
  return isGroundRenderUnit(unit)
    ? Cesium.HeightReference.CLAMP_TO_GROUND
    : Cesium.HeightReference.NONE;
}

function resolveHeadingOrientation(point, headingDeg) {
  const position = cartesianFromSnapshot(point);
  scratchHpr.heading = Cesium.Math.toRadians(normalizeHeading(headingDeg || 0));
  scratchHpr.pitch = 0;
  scratchHpr.roll = 0;

  return Cesium.Transforms.headingPitchRollQuaternion(
    position,
    scratchHpr,
    undefined,
    undefined,
    scratchOrientation
  );
}

function createPositionProperty(point) {
  const property = new Cesium.SampledPositionProperty();
  property.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
  property.setInterpolationOptions({
    interpolationDegree: 1,
    interpolationAlgorithm: Cesium.LinearApproximation,
  });
  property.addSample(Cesium.JulianDate.now(), cartesianFromSnapshot(point));
  return property;
}

function groundPointFromSnapshot(point) {
  return {
    longitude: Number(point?.longitude) || 0,
    latitude: Number(point?.latitude) || 0,
    altitudeMeters: 0,
  };
}

function addPositionSample(positionProperty, point, seconds) {
  const targetTime = Cesium.JulianDate.addSeconds(
    Cesium.JulianDate.now(),
    seconds,
    new Cesium.JulianDate()
  );
  positionProperty.addSample(targetTime, cartesianFromSnapshot(point));
}

function buildVerticalGuidePositions(point) {
  return Cesium.Cartesian3.fromDegreesArrayHeights([
    Number(point?.longitude) || 0,
    Number(point?.latitude) || 0,
    Math.max(0, Number(point?.altitudeMeters) || 0),
    Number(point?.longitude) || 0,
    Number(point?.latitude) || 0,
    0,
  ]);
}

function buildArcPolylinePositions(
  sourcePoint,
  targetPoint,
  arcLiftMeters = 0
) {
  const sourceLongitude = Number(sourcePoint?.longitude);
  const sourceLatitude = Number(sourcePoint?.latitude);
  const sourceAltitudeMeters = Math.max(
    0,
    Number(sourcePoint?.altitudeMeters) || 0
  );
  const targetLongitude = Number(targetPoint?.longitude);
  const targetLatitude = Number(targetPoint?.latitude);
  const targetAltitudeMeters = Math.max(
    0,
    Number(targetPoint?.altitudeMeters) || 0
  );

  if (
    !Number.isFinite(sourceLongitude) ||
    !Number.isFinite(sourceLatitude) ||
    !Number.isFinite(targetLongitude) ||
    !Number.isFinite(targetLatitude)
  ) {
    return null;
  }

  const midpointLongitude = (sourceLongitude + targetLongitude) * 0.5;
  const midpointLatitude = (sourceLatitude + targetLatitude) * 0.5;
  const horizontalDistanceMeters = distanceMetersBetweenPoints(
    sourcePoint,
    targetPoint
  );
  const sampleCount = Math.max(
    7,
    Math.round(clamp((horizontalDistanceMeters || 0) / 12000, 7, 17))
  );
  const coordinates = [];

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const t = sampleIndex / (sampleCount - 1);
    const longitude = Cesium.Math.lerp(sourceLongitude, targetLongitude, t);
    const latitude = Cesium.Math.lerp(sourceLatitude, targetLatitude, t);
    const linearAltitude = Cesium.Math.lerp(
      sourceAltitudeMeters,
      targetAltitudeMeters,
      t
    );
    const arcWeight = Math.pow(4 * t * (1 - t), 0.94);
    const altitude =
      linearAltitude + Math.max(0, arcLiftMeters) * arcWeight * 0.98;

    coordinates.push(longitude, latitude, altitude);
  }

  return coordinates.length >= 6
    ? Cesium.Cartesian3.fromDegreesArrayHeights(coordinates)
    : Cesium.Cartesian3.fromDegreesArrayHeights([
        sourceLongitude,
        sourceLatitude,
        sourceAltitudeMeters,
        midpointLongitude,
        midpointLatitude,
        Math.max(sourceAltitudeMeters, targetAltitudeMeters) + arcLiftMeters,
        targetLongitude,
        targetLatitude,
        targetAltitudeMeters,
      ]);
}

function buildLinearPolylinePositions(points) {
  const coordinates = [];
  points.forEach((point) => {
    const longitude = Number(point?.longitude);
    const latitude = Number(point?.latitude);
    const altitudeMeters = Math.max(0, Number(point?.altitudeMeters) || 0);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return;
    }

    coordinates.push(longitude, latitude, altitudeMeters);
  });

  return coordinates.length >= 6
    ? Cesium.Cartesian3.fromDegreesArrayHeights(coordinates)
    : null;
}

function distanceMetersBetweenPoints(sourcePoint, targetPoint) {
  const sourceCartesian = Cesium.Cartesian3.fromDegrees(
    Number(sourcePoint?.longitude) || 0,
    Number(sourcePoint?.latitude) || 0,
    Math.max(0, Number(sourcePoint?.altitudeMeters) || 0)
  );
  const targetCartesian = Cesium.Cartesian3.fromDegrees(
    Number(targetPoint?.longitude) || 0,
    Number(targetPoint?.latitude) || 0,
    Math.max(0, Number(targetPoint?.altitudeMeters) || 0)
  );

  return Cesium.Cartesian3.distance(sourceCartesian, targetCartesian);
}

function bearingDegreesBetweenPoints(sourcePoint, targetPoint) {
  const latitudeRadians = Cesium.Math.toRadians(
    ((Number(sourcePoint?.latitude) || 0) +
      (Number(targetPoint?.latitude) || 0)) *
      0.5
  );
  const eastMeters =
    ((Number(targetPoint?.longitude) || 0) -
      (Number(sourcePoint?.longitude) || 0)) *
    111320 *
    Math.max(Math.cos(latitudeRadians), 0.01);
  const northMeters =
    ((Number(targetPoint?.latitude) || 0) -
      (Number(sourcePoint?.latitude) || 0)) *
    110540;

  return normalizeHeading(
    Cesium.Math.toDegrees(Math.atan2(eastMeters, northMeters))
  );
}

function offsetPointByHeadingMeters(
  point,
  headingDeg,
  forwardMeters,
  rightMeters = 0,
  altitudeMeters = point?.altitudeMeters ?? 0
) {
  const headingRadians = Cesium.Math.toRadians(
    normalizeHeading(headingDeg || 0)
  );
  const eastMeters =
    Math.sin(headingRadians) * forwardMeters +
    Math.cos(headingRadians) * rightMeters;
  const northMeters =
    Math.cos(headingRadians) * forwardMeters -
    Math.sin(headingRadians) * rightMeters;
  const latitude = Number(point?.latitude) || 0;
  const longitude = Number(point?.longitude) || 0;
  const nextLatitude = latitude + northMeters / 110540;
  const nextLongitude =
    longitude +
    eastMeters /
      (111320 * Math.max(Math.cos(Cesium.Math.toRadians(latitude)), 0.01));

  return {
    longitude: nextLongitude,
    latitude: nextLatitude,
    altitudeMeters: Math.max(0, Number(altitudeMeters) || 0),
  };
}

function findFirstMatchingModel(signature, candidates, fallbackModel) {
  for (const [pattern, modelPath] of candidates) {
    if (pattern.test(signature)) {
      return modelPath;
    }
  }

  return fallbackModel;
}

function resolveTrackedModelColor(unit, tracked) {
  return tracked
    ? Cesium.Color.WHITE.withAlpha(0.94)
    : colorForSide(unit.sideColor, 0.86);
}

function resolveTrackedModelBlendAmount(tracked) {
  return tracked ? 0.08 : 0.2;
}

function resolveTrackedModelSilhouette(unit, emphasized, tracked) {
  if (tracked) {
    return {
      color: Cesium.Color.WHITE.withAlpha(0.96),
      size: 3.4,
    };
  }

  return {
    color: colorForSide(unit.sideColor, emphasized ? 0.82 : 0.48),
    size: emphasized ? 1.9 : 0.8,
  };
}

function createUnitModelGraphics(unit, model, emphasized, tracked = false) {
  const silhouette = resolveTrackedModelSilhouette(unit, emphasized, tracked);
  return new Cesium.ModelGraphics({
    uri: assetUrl(model.uri, "Battle spectator model"),
    scale: model.scale,
    minimumPixelSize: model.minimumPixelSize,
    maximumScale: model.maximumScale,
    heightReference: resolveUnitModelHeightReference(unit),
    color: resolveTrackedModelColor(unit, tracked),
    colorBlendAmount: resolveTrackedModelBlendAmount(tracked),
    silhouetteColor: silhouette.color,
    silhouetteSize: silhouette.size,
  });
}

function createUnitPointGraphics(unit, emphasized) {
  return new Cesium.PointGraphics({
    pixelSize: unit.selected ? 12 : isGroundRenderUnit(unit) ? 10 : 9,
    color: colorForSide(unit.sideColor, 0.95),
    outlineColor: Cesium.Color.BLACK.withAlpha(0.72),
    outlineWidth: 2,
    heightReference: resolveUnitOverlayHeightReference(unit),
    disableDepthTestDistance:
      emphasized || isGroundRenderUnit(unit) ? Number.POSITIVE_INFINITY : 0,
  });
}

function syncUnitPrimaryVisual(record, unit, model, emphasized, tracked = false) {
  if (model) {
    const silhouette = resolveTrackedModelSilhouette(unit, emphasized, tracked);
    if (!record.entity.model) {
      record.entity.model = createUnitModelGraphics(
        unit,
        model,
        emphasized,
        tracked
      );
    }
    record.entity.model.uri = assetUrl(model.uri, "Battle spectator model");
    record.entity.model.scale = model.scale;
    record.entity.model.minimumPixelSize = model.minimumPixelSize;
    record.entity.model.maximumScale = model.maximumScale;
    record.entity.model.heightReference = resolveUnitModelHeightReference(unit);
    record.entity.model.color = resolveTrackedModelColor(unit, tracked);
    record.entity.model.colorBlendAmount =
      resolveTrackedModelBlendAmount(tracked);
    record.entity.model.silhouetteColor = silhouette.color;
    record.entity.model.silhouetteSize = silhouette.size;
    record.entity.point = undefined;
    return;
  }

  if (!record.entity.point) {
    record.entity.point = createUnitPointGraphics(unit, emphasized);
  }
  record.entity.point.pixelSize = unit.selected
    ? 12
    : isGroundRenderUnit(unit)
      ? 10
      : 9;
  record.entity.point.color = colorForSide(unit.sideColor, 0.95);
  record.entity.point.outlineColor = Cesium.Color.BLACK.withAlpha(0.72);
  record.entity.point.outlineWidth = 2;
  record.entity.point.heightReference = resolveUnitOverlayHeightReference(unit);
  record.entity.point.disableDepthTestDistance =
    emphasized || isGroundRenderUnit(unit) ? Number.POSITIVE_INFINITY : 0;
  record.entity.model = undefined;
}

function resolveUnitModelFromProfileId(unit, renderContext, lodConfig) {
  const uri = UNIT_MODEL_URI_BY_ID[unit?.modelId];
  if (!uri || unit?.entityType === "airbase") {
    return null;
  }

  if (
    (unit.entityType === "facility" || unit.entityType === "army") &&
    !hasGroundModelBudget(renderContext, lodConfig.facilityModelBudget)
  ) {
    return null;
  }

  if (unit.entityType === "ship") {
    return {
      uri,
      scale:
        unit.modelId === "ship-submarine"
          ? UNIT_MODEL_SCALE_PRESET.ship.submarine
          : UNIT_MODEL_SCALE_PRESET.ship.default,
      minimumPixelSize: UNIT_MODEL_SCALE_PRESET.ship.minimumPixelSize,
      maximumScale: UNIT_MODEL_SCALE_PRESET.ship.maximumScale,
    };
  }

  if (unit.entityType === "aircraft") {
    return {
      uri,
      scale:
        unit.modelId === "drone-animated" || unit.modelId === "drone-quad"
          ? UNIT_MODEL_SCALE_PRESET.aircraft.drone
          : UNIT_MODEL_SCALE_PRESET.aircraft.default,
      minimumPixelSize: UNIT_MODEL_SCALE_PRESET.aircraft.minimumPixelSize,
      maximumScale: UNIT_MODEL_SCALE_PRESET.aircraft.maximumScale,
    };
  }

  const measuredScaleProfile = resolveUnitModelScaleProfile(unit?.modelId, uri);
  if (measuredScaleProfile) {
    return {
      uri,
      ...measuredScaleProfile,
    };
  }

  return {
    uri,
    scale:
      unit.modelId === "artillery-patriot" ||
      unit.modelId === "artillery-nasams" ||
      unit.modelId === "artillery-thaad" ||
      unit.modelId === "artillery-hyunmoo"
        ? UNIT_MODEL_SCALE_PRESET.ground.launcher
        : UNIT_MODEL_SCALE_PRESET.ground.default,
    minimumPixelSize: UNIT_MODEL_SCALE_PRESET.ground.minimumPixelSize,
    maximumScale: UNIT_MODEL_SCALE_PRESET.ground.maximumScale,
  };
}

function resolveUnitModel(unit, renderContext, lodConfig) {
  if (unit.entityType === "airbase") {
    return null;
  }

  const resolvedByProfileId = resolveUnitModelFromProfileId(
    unit,
    renderContext,
    lodConfig
  );
  if (resolvedByProfileId) {
    return resolvedByProfileId;
  }

  const signature = buildSignature(unit);
  if (unit.entityType === "aircraft") {
    const uri = findFirstMatchingModel(
      signature,
      AIRCRAFT_MODEL_MAP,
      DEFAULT_UNIT_MODEL.aircraft
    );
    return {
      uri,
      scale: /\b(drone|uav|mq-|rq-)\b/i.test(signature)
        ? UNIT_MODEL_SCALE_PRESET.aircraft.drone
        : UNIT_MODEL_SCALE_PRESET.aircraft.default,
      minimumPixelSize: UNIT_MODEL_SCALE_PRESET.aircraft.minimumPixelSize,
      maximumScale: UNIT_MODEL_SCALE_PRESET.aircraft.maximumScale,
    };
  }

  if (unit.entityType === "ship") {
    const uri = findFirstMatchingModel(
      signature,
      SHIP_MODEL_MAP,
      DEFAULT_UNIT_MODEL.ship
    );
    return {
      uri,
      scale: /\b(submarine|ssn|sss|sub)\b/i.test(signature)
        ? UNIT_MODEL_SCALE_PRESET.ship.submarine
        : UNIT_MODEL_SCALE_PRESET.ship.default,
      minimumPixelSize: UNIT_MODEL_SCALE_PRESET.ship.minimumPixelSize,
      maximumScale: UNIT_MODEL_SCALE_PRESET.ship.maximumScale,
    };
  }

  if (
    (unit.entityType === "facility" || unit.entityType === "army") &&
    hasGroundModelBudget(renderContext, lodConfig.facilityModelBudget)
  ) {
    const uri = findFirstMatchingModel(
      signature,
      FACILITY_MODEL_MAP,
      DEFAULT_UNIT_MODEL.facility
    );
    const measuredScaleProfile = resolveUnitModelScaleProfile(
      unit?.modelId,
      uri
    );
    if (measuredScaleProfile) {
      return {
        uri,
        ...measuredScaleProfile,
      };
    }

    return {
      uri,
      scale: /\b(patriot|nasams|thaad|hyunmoo|launcher)\b/i.test(signature)
        ? UNIT_MODEL_SCALE_PRESET.ground.launcher
        : UNIT_MODEL_SCALE_PRESET.ground.default,
      minimumPixelSize: UNIT_MODEL_SCALE_PRESET.ground.minimumPixelSize,
      maximumScale: UNIT_MODEL_SCALE_PRESET.ground.maximumScale,
    };
  }

  return null;
}

function resolveWeaponModel(weapon) {
  if (weapon?.modelId && WEAPON_MODEL_URI_BY_ID[weapon.modelId]) {
    return WEAPON_MODEL_URI_BY_ID[weapon.modelId];
  }

  return findFirstMatchingModel(
    buildSignature(weapon),
    WEAPON_MODEL_MAP,
    "/3d-bundles/artillery/models/artillery_shell.glb"
  );
}

function createLabel(name, sideColor, maxDistance, options = {}) {
  const emphasized = options.emphasized === true;
  const heightReference =
    options.heightReference ?? Cesium.HeightReference.NONE;
  const disableDepthTestDistance =
    typeof options.disableDepthTestDistance === "number"
      ? options.disableDepthTestDistance
      : emphasized
        ? Number.POSITIVE_INFINITY
        : 0;
  const offsetY =
    typeof options.pixelOffsetY === "number"
      ? options.pixelOffsetY
      : emphasized
        ? -32
        : -20;

  return new Cesium.LabelGraphics({
    text: name,
    scale: emphasized ? 0.58 : 0.48,
    showBackground: true,
    backgroundColor: colorForSide(sideColor, emphasized ? 0.2 : 0.11),
    fillColor: Cesium.Color.WHITE.withAlpha(emphasized ? 1 : 0.94),
    outlineColor: Cesium.Color.BLACK.withAlpha(emphasized ? 0.82 : 0.58),
    outlineWidth: emphasized ? 3 : 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    font: emphasized
      ? "700 24px Bahnschrift, sans-serif"
      : "600 20px Bahnschrift, sans-serif",
    pixelOffset: new Cesium.Cartesian2(0, offsetY),
    scaleByDistance: new Cesium.NearFarScalar(
      2500,
      emphasized ? 1 : 0.96,
      maxDistance,
      emphasized ? 0.76 : 0.62
    ),
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
      0,
      maxDistance
    ),
    heightReference,
    disableDepthTestDistance,
  });
}

function truncateBattleLabelText(text, maxLength = 18) {
  if (typeof text !== "string") {
    return "";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function formatBattleLabelAltitude(altitudeMeters) {
  return `${Math.round(Math.max(0, altitudeMeters || 0))}m`;
}

function formatBattleLabelSpeed(speedKts) {
  return `${Math.round(Math.max(0, speedKts || 0))}kt`;
}

function formatBattleLabelHp(hpFraction) {
  return `${Math.round(clamp(hpFraction || 0, 0, 1) * 100)}%`;
}

function buildUnitLabelText(unit, followTargetId) {
  const highlighted =
    unit.selected || isTrackedTarget(followTargetId, "unit", unit.id);

  if (!highlighted) {
    return truncateBattleLabelText(unit.name, 20);
  }

  return [
    unit.name,
    `${formatBattleLabelAltitude(unit.altitudeMeters)} · ${formatBattleLabelSpeed(
      unit.speedKts
    )} · HP ${formatBattleLabelHp(unit.hpFraction)} · WPN ${unit.weaponCount}`,
  ].join("\n");
}

function resolveUnitLabelPriority(unit, followTargetId) {
  let score = 0;

  if (unit.selected) {
    score += 1200;
  }
  if (isTrackedTarget(followTargetId, "unit", unit.id)) {
    score += 1100;
  }
  if (unit.entityType === "aircraft") {
    score += 260;
  } else if (unit.entityType === "ship") {
    score += 180;
  } else if (unit.entityType === "airbase") {
    score += 120;
  }

  score += Math.min(180, unit.weaponCount * 22);
  score += Math.min(140, unit.speedKts * 0.18);
  score += Math.min(90, (unit.statusFlags?.length ?? 0) * 18);

  if (typeof unit.targetId === "string" && unit.targetId.length > 0) {
    score += 100;
  }
  if ((unit.hpFraction ?? 1) < 0.55) {
    score += 70;
  }
  if (unit.rtb) {
    score -= 24;
  }
  if (
    (unit.entityType === "facility" || unit.entityType === "army") &&
    unit.speedKts < 8
  ) {
    score -= 90;
  }

  return score;
}

function shouldShowUnitTrail(unit, followTargetId, lodLevel) {
  if (unit.selected || isTrackedTarget(followTargetId, "unit", unit.id)) {
    return true;
  }

  if (unit.entityType === "aircraft") {
    return lodLevel !== "performance";
  }

  if (unit.entityType === "ship") {
    return lodLevel === "cinematic" && unit.speedKts >= 18;
  }

  return false;
}

function createUnitTrailGraphics(unit, lodConfig) {
  return new Cesium.PathGraphics({
    show: true,
    leadTime: 0,
    trailTime: lodConfig.unitTrailTime,
    width:
      unit.selected || unit.entityType === "aircraft"
        ? lodConfig.unitTrailWidth
        : Math.max(1.4, lodConfig.unitTrailWidth - 0.4),
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: unit.selected ? 0.2 : 0.12,
      color: colorForSide(unit.sideColor, unit.selected ? 0.72 : 0.4),
    }),
  });
}

function resolveWeaponImpactPoint(state, weapon) {
  if (
    Number.isFinite(weapon.targetLongitude) &&
    Number.isFinite(weapon.targetLatitude)
  ) {
    return {
      longitude: weapon.targetLongitude,
      latitude: weapon.targetLatitude,
      altitudeMeters: 0,
    };
  }

  if (typeof weapon.targetId === "string" && weapon.targetId.length > 0) {
    return resolveTargetPoint(state, weapon.targetId);
  }

  return null;
}

function isTrajectoryWeapon(weapon) {
  if (!weapon) {
    return false;
  }

  if (
    weapon.modelId === "weapon-air-to-air-missile" ||
    weapon.modelId === "weapon-surface-missile"
  ) {
    return true;
  }
  if (weapon.modelId === "weapon-artillery-shell") {
    return false;
  }

  const signature = buildSignature(weapon);
  if (NON_TRAJECTORY_WEAPON_SIGNATURE.test(signature)) {
    return false;
  }

  return TRAJECTORY_WEAPON_SIGNATURE.test(signature);
}

function shouldShowWeaponTrajectoryCorridor(weapon, followTargetId, lodLevel) {
  if (isTrackedTarget(followTargetId, "weapon", weapon.id)) {
    return true;
  }

  if (!isTrajectoryWeapon(weapon)) {
    return false;
  }

  return lodLevel !== "performance";
}

function resolveWeaponImpactLabelPriority(state, weapon, followTargetId) {
  if (!isTrajectoryWeapon(weapon)) {
    return -1;
  }

  const timeToImpactSec = estimateWeaponTimeToImpactSec(state, weapon);
  let score = 120;

  if (isTrackedTarget(followTargetId, "weapon", weapon.id)) {
    score += 1200;
  }
  if (Number.isFinite(timeToImpactSec)) {
    score += Math.max(0, 220 - Math.min(220, timeToImpactSec * 4));
  }
  score += Math.min(150, resolveWeaponImpactRadiusMeters(weapon) * 0.18);
  score += Math.min(120, (weapon.speedKts ?? 0) * 0.05);

  return score;
}

function resolveEventPriority(event) {
  let score = 0;

  if (event.resultTag === "kill") {
    score += 260;
  } else if (event.resultTag === "damage" || event.resultTag === "impact") {
    score += 180;
  } else if (isLaunchEvent(event)) {
    score += 110;
  } else {
    score += 70;
  }

  score += Number(event.timestamp) || 0;
  return score;
}

function buildPrioritizedIdSet(
  items,
  budget,
  scoreFn,
  idResolver = (item) => item.id
) {
  if (!Array.isArray(items) || budget <= 0) {
    return new Set();
  }

  return new Set(
    [...items]
      .sort((left, right) => scoreFn(right) - scoreFn(left))
      .slice(0, budget)
      .map((item) => idResolver(item))
      .filter((id) => typeof id === "string" && id.length > 0)
  );
}

function resolveWeaponTrajectoryTargetPoint(state, weapon) {
  const impactPoint = resolveWeaponImpactPoint(state, weapon);
  if (impactPoint) {
    return impactPoint;
  }

  return offsetPointByHeadingMeters(
    weapon,
    weapon.headingDeg,
    clamp(Math.max(140, Number(weapon.speedKts) || 0) * 24, 2600, 18000),
    0,
    Math.max(0, Number(weapon.altitudeMeters) || 0)
  );
}

function normalizePointSnapshot(point) {
  if (
    !point ||
    !Number.isFinite(Number(point.longitude)) ||
    !Number.isFinite(Number(point.latitude))
  ) {
    return null;
  }

  return {
    longitude: Number(point.longitude),
    latitude: Number(point.latitude),
    altitudeMeters: Math.max(0, Number(point.altitudeMeters) || 0),
  };
}

function normalizeWeaponInventoryItem(item) {
  if (
    !item ||
    typeof item.id !== "string" ||
    typeof item.name !== "string" ||
    typeof item.className !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    className: item.className,
    quantity: Math.max(0, Number(item.quantity) || 0),
    maxQuantity: Math.max(0, Number(item.maxQuantity) || 0),
    modelId: typeof item.modelId === "string" ? item.modelId : undefined,
  };
}

function shouldShowWeaponImpactLink(weapon, followTargetId, lodLevel) {
  if (isTrackedTarget(followTargetId, "weapon", weapon.id)) {
    return true;
  }

  return lodLevel !== "performance";
}

function resolveTrackingOffsetRange(snapshot, type) {
  const speedKts = Math.max(0, Number(snapshot?.speedKts) || 0);
  switch (type) {
    case "weapon":
      return clamp(420 + speedKts * 0.22, 520, 2400);
    case "unit":
    default:
      if (snapshot?.entityType === "aircraft") {
        return clamp(1600 + speedKts * 1.18, 2200, 7600);
      }
      if (snapshot?.entityType === "ship") {
        return clamp(2100 + speedKts * 34, 2500, 6400);
      }
      return clamp(920 + speedKts * 0.58, 1150, 3400);
  }
}

function resolveTrackingPitchDegrees(snapshot, type) {
  if (type === "weapon") {
    return -10;
  }
  if (snapshot?.entityType === "aircraft") {
    return -20;
  }
  if (snapshot?.entityType === "ship") {
    return -24;
  }
  return -22;
}

function isGroundTrackingUnit(snapshot, type) {
  return (
    type === "unit" &&
    snapshot?.entityType !== "aircraft" &&
    snapshot?.entityType !== "ship"
  );
}

function resolvePointFrameOffset(cameraProfile, altitudeMeters = 0) {
  const normalizedProfile = normalizeCameraProfile(cameraProfile);
  const normalizedAltitude = Math.max(0, Number(altitudeMeters) || 0);
  if (normalizedProfile === "side") {
    return new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(108),
      Cesium.Math.toRadians(-16),
      Math.max(5200, 4400 + normalizedAltitude * 0.22)
    );
  }
  if (normalizedProfile === "chase") {
    return new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(168),
      Cesium.Math.toRadians(-20),
      Math.max(3600, 3200 + normalizedAltitude * 0.14)
    );
  }
  if (normalizedProfile === "orbit") {
    return new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(44),
      Cesium.Math.toRadians(-34),
      Math.max(4300, 3700 + normalizedAltitude * 0.18)
    );
  }

  return new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(24),
    Cesium.Math.toRadians(-58),
    Math.max(4600, 4000 + normalizedAltitude * 0.2)
  );
}

export function resolveTrackingCameraView(snapshot, type, cameraProfile) {
  const normalizedProfile = normalizeCameraProfile(cameraProfile);
  const range = resolveTrackingOffsetRange(snapshot, type);
  const groundTrackingUnit = isGroundTrackingUnit(snapshot, type);
  if (normalizedProfile === "side") {
    const height =
      type === "weapon"
        ? Math.max(180, range * 0.16)
        : snapshot?.entityType === "aircraft"
          ? Math.max(720, range * 0.22)
          : snapshot?.entityType === "ship"
            ? Math.max(480, range * 0.2)
            : groundTrackingUnit
              ? Math.max(620, range * 0.44)
              : Math.max(320, range * 0.18);
    return {
      viewFrom: new Cesium.Cartesian3(
        range * (groundTrackingUnit ? 0.56 : 0.72),
        -range * (groundTrackingUnit ? 0.08 : 0.18),
        height
      ),
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(102),
        Cesium.Math.toRadians(
          type === "weapon" ? -9 : groundTrackingUnit ? -14 : -14
        ),
        range * (groundTrackingUnit ? 0.66 : 0.82)
      ),
    };
  }
  if (normalizedProfile === "chase") {
    const height =
      type === "weapon"
        ? Math.max(180, range * 0.16)
        : snapshot?.entityType === "aircraft"
          ? Math.max(760, range * 0.26)
          : snapshot?.entityType === "ship"
            ? Math.max(500, range * 0.22)
            : groundTrackingUnit
              ? Math.max(760, range * 0.58)
              : Math.max(340, range * 0.18);
    return {
      viewFrom: new Cesium.Cartesian3(
        range * (groundTrackingUnit ? 0.04 : 0.02),
        -range * (groundTrackingUnit ? 0.42 : 0.6),
        height
      ),
      offset: new Cesium.HeadingPitchRange(
        0,
        Cesium.Math.toRadians(
          type === "weapon" ? -12 : groundTrackingUnit ? -24 : -18
        ),
        range * (groundTrackingUnit ? 0.62 : 0.72)
      ),
    };
  }
  if (normalizedProfile === "orbit") {
    const height =
      type === "weapon"
        ? Math.max(200, range * 0.18)
        : snapshot?.entityType === "aircraft"
          ? Math.max(880, range * 0.3)
          : snapshot?.entityType === "ship"
            ? Math.max(560, range * 0.24)
            : groundTrackingUnit
              ? Math.max(920, range * 0.72)
              : Math.max(360, range * 0.2);
    return {
      viewFrom: new Cesium.Cartesian3(
        range * (groundTrackingUnit ? 0.24 : 0.44),
        -range * (groundTrackingUnit ? 0.16 : 0.34),
        height
      ),
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(40),
        Cesium.Math.toRadians(
          type === "weapon" ? -11 : groundTrackingUnit ? -28 : -24
        ),
        range * (groundTrackingUnit ? 0.52 : 0.68)
      ),
    };
  }

  const height =
    type === "weapon"
      ? Math.max(220, range * 0.22)
      : snapshot?.entityType === "aircraft"
        ? Math.max(1080, range * 0.42)
        : snapshot?.entityType === "ship"
          ? Math.max(760, range * 0.34)
          : Math.max(520, range * 0.28);
  const lateral = type === "weapon" ? range * 0.08 : range * 0.18;
  return {
    viewFrom: new Cesium.Cartesian3(lateral, -range * 0.72, height),
    offset: new Cesium.HeadingPitchRange(
      0,
      Cesium.Math.toRadians(resolveTrackingPitchDegrees(snapshot, type)),
      range * 0.78
    ),
  };
}

function resolveTrackingFlyDuration(snapshot, type, cameraProfile) {
  const normalizedProfile = normalizeCameraProfile(cameraProfile);
  let duration =
    type === "weapon"
      ? 0.72
      : snapshot?.entityType === "aircraft"
        ? 0.94
        : snapshot?.entityType === "ship"
          ? 1.02
          : 0.88;

  if (normalizedProfile === "side") {
    duration += 0.1;
  }
  if (normalizedProfile === "orbit") {
    duration += 0.06;
  }
  if (normalizedProfile === "chase") {
    duration -= 0.06;
  }
  if (Math.max(0, Number(snapshot?.speedKts) || 0) > 520) {
    duration -= 0.06;
  }

  return clamp(duration, 0.55, 1.18);
}

function resolveTrackingFlyEasing(type, cameraProfile) {
  if (type === "weapon") {
    return Cesium.EasingFunction.QUADRATIC_OUT;
  }

  return normalizeCameraProfile(cameraProfile) === "tactical"
    ? Cesium.EasingFunction.CUBIC_OUT
    : Cesium.EasingFunction.QUADRATIC_IN_OUT;
}

function resolvePointCombatFramingHint(
  state,
  point,
  cameraProfile,
  altitudeMeters = 0
) {
  const normalizedProfile = normalizeCameraProfile(cameraProfile);
  const eventDistanceThreshold =
    normalizedProfile === "tactical" ? 16000 : 9500;
  const unitDistanceThreshold =
    normalizedProfile === "tactical" ? 18000 : 12000;
  const weaponDistanceThreshold =
    normalizedProfile === "tactical" ? 16000 : 10000;
  const nearbyEvents = (state?.recentEvents ?? [])
    .map((event) => {
      const focusPoint = getEventFocusPoint(event);
      if (!focusPoint) {
        return null;
      }

      return {
        event,
        focusPoint,
        sourcePoint: getEventSourcePoint(event),
        distanceMeters: distanceMetersBetweenPoints(point, focusPoint),
      };
    })
    .filter(
      (entry) =>
        entry !== null && entry.distanceMeters <= eventDistanceThreshold
    )
    .sort((left, right) => {
      if (left.event.timestamp !== right.event.timestamp) {
        return (right.event.timestamp ?? 0) - (left.event.timestamp ?? 0);
      }

      return left.distanceMeters - right.distanceMeters;
    });
  const nearbyUnits = (state?.units ?? []).filter(
    (unit) => distanceMetersBetweenPoints(point, unit) <= unitDistanceThreshold
  );
  const nearbyWeapons = (state?.weapons ?? []).filter(
    (weapon) =>
      distanceMetersBetweenPoints(point, weapon) <= weaponDistanceThreshold
  );
  const nearbyImpactCount = nearbyEvents.filter((entry) =>
    isImpactEvent(entry.event)
  ).length;
  const nearbyLaunchCount = nearbyEvents.filter((entry) =>
    isLaunchEvent(entry.event)
  ).length;
  const intensityScore =
    nearbyWeapons.length * 3 +
    nearbyImpactCount * 2.2 +
    nearbyLaunchCount * 1.1 +
    nearbyUnits.length * 0.35;
  const framingEvent = nearbyEvents[0] ?? null;
  const averagedHeading =
    nearbyUnits.length > 0
      ? averageHeadingDegrees(nearbyUnits.map((unit) => unit.headingDeg))
      : null;
  const headingDegrees = framingEvent?.sourcePoint
    ? bearingDegreesBetweenPoints(framingEvent.sourcePoint, point)
    : averagedHeading;
  const baseOffset = resolvePointFrameOffset(normalizedProfile, altitudeMeters);
  const rangeMeters = clamp(
    baseOffset.range *
      (normalizedProfile === "chase"
        ? 0.72
        : normalizedProfile === "orbit"
          ? 0.8
        : normalizedProfile === "side"
          ? 0.82
          : 0.88) +
      intensityScore *
        (normalizedProfile === "tactical"
          ? 320
          : normalizedProfile === "orbit"
            ? 255
            : 230),
    normalizedProfile === "chase" ? 2600 : 3600,
    normalizedProfile === "tactical"
      ? 16500
      : normalizedProfile === "orbit"
        ? 13000
        : 12200
  );
  const pitchDegrees =
    normalizedProfile === "tactical"
      ? intensityScore >= 9
        ? -52
        : intensityScore >= 4
          ? -56
          : -60
      : normalizedProfile === "orbit"
        ? intensityScore >= 9
          ? -40
          : intensityScore >= 4
            ? -44
            : -48
      : normalizedProfile === "side"
        ? intensityScore >= 9
          ? -10
          : -14
        : intensityScore >= 9
          ? -15
          : -19;

  return {
    headingDegrees,
    pitchDegrees,
    rangeMeters,
    intensityScore,
  };
}

function averageHeadingDegrees(headings) {
  if (!Array.isArray(headings) || headings.length === 0) {
    return 0;
  }

  let east = 0;
  let north = 0;
  headings.forEach((headingDeg) => {
    const headingRadians = Cesium.Math.toRadians(normalizeHeading(headingDeg));
    east += Math.sin(headingRadians);
    north += Math.cos(headingRadians);
  });

  if (Math.abs(east) < 1e-4 && Math.abs(north) < 1e-4) {
    return 0;
  }

  return normalizeHeading(Cesium.Math.toDegrees(Math.atan2(east, north)));
}

function shouldShowProjectedCourse(unit, followTargetId) {
  return unit.selected || isTrackedTarget(followTargetId, "unit", unit.id);
}

function resolveProjectedCourseDistanceMeters(unit) {
  if (unit.entityType === "aircraft") {
    return clamp(unit.speedKts * 58, 4800, 22000);
  }
  if (unit.entityType === "ship") {
    return clamp(unit.speedKts * 140, 2600, 11000);
  }
  return clamp(unit.speedKts * 55, 1800, 6400);
}

function resolveProjectedCoursePoint(state, unit) {
  const targetPoint =
    typeof unit.targetId === "string" && unit.targetId.length > 0
      ? resolveTargetPoint(state, unit.targetId)
      : null;
  if (
    targetPoint &&
    distanceMetersBetweenPoints(unit, targetPoint) <=
      resolveProjectedCourseDistanceMeters(unit) * 1.6
  ) {
    return {
      ...targetPoint,
      altitudeMeters:
        unit.entityType === "aircraft"
          ? Math.max(
              unit.altitudeMeters ?? 0,
              (targetPoint.altitudeMeters ?? 0) + 120
            )
          : Math.max(0, targetPoint.altitudeMeters ?? 0),
    };
  }

  return offsetPointByHeadingMeters(
    unit,
    unit.headingDeg,
    resolveProjectedCourseDistanceMeters(unit),
    0,
    unit.altitudeMeters ?? 0
  );
}

function normalizeFollowTargetId(followTargetId) {
  return typeof followTargetId === "string" && followTargetId.length > 0
    ? followTargetId
    : null;
}

function parseFollowTargetId(followTargetId) {
  const normalizedTargetId = normalizeFollowTargetId(followTargetId);
  if (!normalizedTargetId) {
    return null;
  }

  if (normalizedTargetId.startsWith("weapon:")) {
    return {
      type: "weapon",
      id: normalizedTargetId.slice("weapon:".length),
    };
  }

  if (normalizedTargetId.startsWith("unit:")) {
    return {
      type: "unit",
      id: normalizedTargetId.slice("unit:".length),
    };
  }

  return {
    type: "unit",
    id: normalizedTargetId,
  };
}

const BATTLE_PICK_ENTITY_PATTERNS = [
  { prefix: "battle-unit-guide-", type: "unit" },
  { prefix: "battle-unit-course-end-", type: "unit" },
  { prefix: "battle-unit-course-", type: "unit" },
  { prefix: "battle-target-link-", type: "unit" },
  { prefix: "battle-unit-", type: "unit" },
  { prefix: "battle-weapon-guide-", type: "weapon" },
  { prefix: "battle-weapon-impact-link-", type: "weapon" },
  { prefix: "battle-weapon-trajectory-projected-", type: "weapon" },
  { prefix: "battle-weapon-trajectory-progress-", type: "weapon" },
  { prefix: "battle-weapon-trajectory-launch-", type: "weapon" },
  { prefix: "battle-weapon-impact-zone-", type: "weapon" },
  { prefix: "battle-weapon-impact-label-", type: "weapon" },
  { prefix: "battle-weapon-", type: "weapon" },
];

function resolveBattlePickTargetFromEntityId(entityId) {
  if (typeof entityId !== "string" || entityId.length === 0) {
    return null;
  }

  const matchedPattern = BATTLE_PICK_ENTITY_PATTERNS.find((pattern) =>
    entityId.startsWith(pattern.prefix)
  );
  if (!matchedPattern) {
    return null;
  }

  return {
    type: matchedPattern.type,
    id: entityId.slice(matchedPattern.prefix.length),
  };
}

function resolvePickedCesiumEntityId(pickedObject) {
  if (!pickedObject) {
    return null;
  }

  if (typeof pickedObject.id?.id === "string") {
    return pickedObject.id.id;
  }

  if (typeof pickedObject.id === "string") {
    return pickedObject.id;
  }

  if (typeof pickedObject.primitive?.id?.id === "string") {
    return pickedObject.primitive.id.id;
  }

  if (typeof pickedObject.primitive?.id === "string") {
    return pickedObject.primitive.id;
  }

  return null;
}

function postBattleSpectatorSelectionToParent(payload) {
  if (
    typeof window === "undefined" ||
    !window.parent ||
    window.parent === window
  ) {
    return;
  }

  try {
    window.parent.postMessage(
      {
        type: "firescope-battle-spectator-selection",
        payload,
      },
      window.location.origin
    );
  } catch (_error) {
    // Parent selection sync is optional for standalone runtime behavior.
  }
}

function isTrackedTarget(followTargetId, type, id) {
  const parsedTarget = parseFollowTargetId(followTargetId);
  return Boolean(
    parsedTarget && parsedTarget.type === type && parsedTarget.id === id
  );
}

function isUnitGuideVisible(unit, followTargetId, lodLevel) {
  if (isTrackedTarget(followTargetId, "unit", unit.id) || unit.selected) {
    return true;
  }

  if (unit.entityType === "aircraft") {
    if (lodLevel === "cinematic") {
      return unit.altitudeMeters >= 450 && unit.speedKts >= 120;
    }

    if (lodLevel === "balanced") {
      return unit.altitudeMeters >= 1500 && unit.weaponCount > 0;
    }
  }

  return false;
}

function isWeaponGuideVisible(weapon, followTargetId, lodLevel) {
  if (isTrackedTarget(followTargetId, "weapon", weapon.id)) {
    return true;
  }

  return (
    lodLevel === "cinematic" &&
    isTrajectoryWeapon(weapon) &&
    weapon.altitudeMeters >= 1200
  );
}

function unitGuideRadiusMeters(unit, emphasized = false) {
  const baseRadius =
    unit.entityType === "aircraft"
      ? 160 + clamp(unit.speedKts * 0.55, 0, 280)
      : 120 + clamp(unit.speedKts * 0.35, 0, 180);
  return emphasized ? baseRadius * 1.25 : baseRadius;
}

function weaponGuideRadiusMeters(weapon, emphasized = false) {
  const baseRadius = 70 + clamp(weapon.speedKts * 0.08, 0, 180);
  return emphasized ? baseRadius * 1.4 : baseRadius;
}

function resolveTargetPoint(state, targetId) {
  if (typeof targetId !== "string" || targetId.length === 0) {
    return null;
  }

  const targetUnit = state.units.find((unit) => unit.id === targetId);
  if (targetUnit) {
    return {
      longitude: targetUnit.longitude,
      latitude: targetUnit.latitude,
      altitudeMeters: targetUnit.altitudeMeters ?? 0,
    };
  }

  const targetWeapon = state.weapons.find((weapon) => weapon.id === targetId);
  if (targetWeapon) {
    return {
      longitude: targetWeapon.longitude,
      latitude: targetWeapon.latitude,
      altitudeMeters: targetWeapon.altitudeMeters ?? 0,
    };
  }

  return null;
}

function estimateLinkArcLiftMeters(sourcePoint, targetPoint) {
  const sourceCartesian = Cesium.Cartesian3.fromDegrees(
    Number(sourcePoint?.longitude) || 0,
    Number(sourcePoint?.latitude) || 0,
    Math.max(0, Number(sourcePoint?.altitudeMeters) || 0)
  );
  const targetCartesian = Cesium.Cartesian3.fromDegrees(
    Number(targetPoint?.longitude) || 0,
    Number(targetPoint?.latitude) || 0,
    Math.max(0, Number(targetPoint?.altitudeMeters) || 0)
  );
  const distanceMeters = Cesium.Cartesian3.distance(
    sourceCartesian,
    targetCartesian
  );

  return clamp(distanceMeters * 0.14, 600, 14000);
}

function resolveWeaponImpactRadiusMeters(weapon) {
  if (!weapon) {
    return 420;
  }

  if (weapon.modelId === "weapon-air-to-air-missile") {
    return 320;
  }

  const signature = buildSignature(weapon);
  if (/\b(hyunmoo|jassm|tomahawk|ballistic|cruise)\b/.test(signature)) {
    return 1200;
  }
  if (
    weapon.modelId === "weapon-surface-missile" ||
    /\b(agm|asm|atgm|guided|rocket|sam|missile)\b/.test(signature)
  ) {
    return 650;
  }

  return 420;
}

function resolveWeaponTrajectoryProgress(state, weapon) {
  const targetPoint = resolveWeaponTrajectoryTargetPoint(state, weapon);
  if (!targetPoint) {
    return null;
  }

  const launchPoint = {
    longitude: weapon.launchLongitude,
    latitude: weapon.launchLatitude,
    altitudeMeters: weapon.launchAltitudeMeters ?? 0,
  };
  const currentPoint = {
    longitude: weapon.longitude,
    latitude: weapon.latitude,
    altitudeMeters: weapon.altitudeMeters ?? 0,
  };
  const totalDistanceMeters = distanceMetersBetweenPoints(
    launchPoint,
    targetPoint
  );
  const traveledDistanceMeters = distanceMetersBetweenPoints(
    launchPoint,
    currentPoint
  );

  if (
    totalDistanceMeters === null ||
    traveledDistanceMeters === null ||
    totalDistanceMeters <= 0
  ) {
    return null;
  }

  return clamp(traveledDistanceMeters / totalDistanceMeters, 0, 1);
}

function estimateWeaponTimeToImpactSec(state, weapon) {
  const targetPoint = resolveWeaponTrajectoryTargetPoint(state, weapon);
  if (!targetPoint) {
    return null;
  }

  const currentPoint = {
    longitude: weapon.longitude,
    latitude: weapon.latitude,
    altitudeMeters: weapon.altitudeMeters ?? 0,
  };
  const remainingDistanceMeters = distanceMetersBetweenPoints(
    currentPoint,
    targetPoint
  );
  const speedMetersPerSecond =
    Math.max(0, Number(weapon.speedKts) || 0) * 0.514444;

  if (
    remainingDistanceMeters === null ||
    !Number.isFinite(remainingDistanceMeters) ||
    speedMetersPerSecond <= 1
  ) {
    return null;
  }

  return remainingDistanceMeters / speedMetersPerSecond;
}

function formatWeaponImpactEtaLabel(timeToImpactSec) {
  if (
    typeof timeToImpactSec !== "number" ||
    !Number.isFinite(timeToImpactSec)
  ) {
    return "ETA 미상";
  }

  if (timeToImpactSec < 60) {
    return `ETA ${Math.max(1, Math.round(timeToImpactSec))}초`;
  }

  const minutes = Math.floor(timeToImpactSec / 60);
  const seconds = Math.round(timeToImpactSec % 60);
  return seconds > 0 ? `ETA ${minutes}분 ${seconds}초` : `ETA ${minutes}분`;
}

function buildWeaponImpactLabelText(
  weapon,
  timeToImpactSec,
  impactRadiusMeters,
  followTargetId
) {
  const highlighted = isTrackedTarget(followTargetId, "weapon", weapon.id);
  const etaLabel = formatWeaponImpactEtaLabel(timeToImpactSec);

  return highlighted
    ? `${etaLabel}\n반경 ${Math.round(impactRadiusMeters)}m`
    : etaLabel;
}

function normalizeUnit(unit) {
  if (
    !unit ||
    typeof unit.id !== "string" ||
    typeof unit.name !== "string" ||
    typeof unit.entityType !== "string" ||
    !Number.isFinite(Number(unit.latitude)) ||
    !Number.isFinite(Number(unit.longitude))
  ) {
    return null;
  }

  return {
    id: unit.id,
    name: unit.name,
    className: typeof unit.className === "string" ? unit.className : "Unknown",
    entityType: unit.entityType,
    modelId: typeof unit.modelId === "string" ? unit.modelId : undefined,
    profileHint:
      typeof unit.profileHint === "string" ? unit.profileHint : "base",
    groundUnit: unit.groundUnit === true,
    sideId: typeof unit.sideId === "string" ? unit.sideId : "unknown",
    sideName: typeof unit.sideName === "string" ? unit.sideName : "미상",
    sideColor: typeof unit.sideColor === "string" ? unit.sideColor : "silver",
    latitude: Number(unit.latitude),
    longitude: Number(unit.longitude),
    altitudeMeters: Math.max(0, Number(unit.altitudeMeters) || 0),
    headingDeg: Number(unit.headingDeg) || 0,
    speedKts: Math.max(0, Number(unit.speedKts) || 0),
    weaponCount: Math.max(0, Number(unit.weaponCount) || 0),
    hpFraction: clamp(Number(unit.hpFraction) || 0, 0, 1),
    damageFraction: clamp(Number(unit.damageFraction) || 0, 0, 1),
    detectionRangeNm: Math.max(0, Number(unit.detectionRangeNm) || 0),
    detectionArcDegrees: Math.max(0, Number(unit.detectionArcDegrees) || 0),
    detectionHeadingDeg: Number(unit.detectionHeadingDeg) || 0,
    engagementRangeNm: Math.max(0, Number(unit.engagementRangeNm) || 0),
    currentFuel:
      typeof unit.currentFuel === "number" && Number.isFinite(unit.currentFuel)
        ? unit.currentFuel
        : undefined,
    maxFuel:
      typeof unit.maxFuel === "number" && Number.isFinite(unit.maxFuel)
        ? unit.maxFuel
        : undefined,
    fuelFraction:
      typeof unit.fuelFraction === "number" &&
      Number.isFinite(unit.fuelFraction)
        ? clamp(unit.fuelFraction, 0, 1)
        : undefined,
    route: Array.isArray(unit.route)
      ? unit.route.map(normalizePointSnapshot).filter(Boolean)
      : [],
    desiredRoute: Array.isArray(unit.desiredRoute)
      ? unit.desiredRoute.map(normalizePointSnapshot).filter(Boolean)
      : [],
    weaponInventory: Array.isArray(unit.weaponInventory)
      ? unit.weaponInventory.map(normalizeWeaponInventoryItem).filter(Boolean)
      : [],
    aircraftCount: Math.max(0, Number(unit.aircraftCount) || 0),
    homeBaseId:
      typeof unit.homeBaseId === "string" ? unit.homeBaseId : undefined,
    rtb: unit.rtb === true,
    statusFlags: Array.isArray(unit.statusFlags)
      ? unit.statusFlags.filter((flag) => typeof flag === "string")
      : [],
    selected: unit.selected === true,
    targetId: typeof unit.targetId === "string" ? unit.targetId : null,
  };
}

function normalizeWeapon(weapon) {
  if (
    !weapon ||
    typeof weapon.id !== "string" ||
    typeof weapon.name !== "string" ||
    !Number.isFinite(Number(weapon.latitude)) ||
    !Number.isFinite(Number(weapon.longitude))
  ) {
    return null;
  }

  return {
    id: weapon.id,
    name: weapon.name,
    className:
      typeof weapon.className === "string" ? weapon.className : weapon.name,
    modelId: typeof weapon.modelId === "string" ? weapon.modelId : undefined,
    launcherId:
      typeof weapon.launcherId === "string"
        ? weapon.launcherId
        : "unknown-launcher",
    launcherName:
      typeof weapon.launcherName === "string"
        ? weapon.launcherName
        : "발사 플랫폼",
    sideId: typeof weapon.sideId === "string" ? weapon.sideId : "unknown",
    sideName: typeof weapon.sideName === "string" ? weapon.sideName : "미상",
    sideColor:
      typeof weapon.sideColor === "string" ? weapon.sideColor : "silver",
    latitude: Number(weapon.latitude),
    longitude: Number(weapon.longitude),
    altitudeMeters: Math.max(0, Number(weapon.altitudeMeters) || 0),
    launchLatitude: Number.isFinite(Number(weapon.launchLatitude))
      ? Number(weapon.launchLatitude)
      : Number(weapon.latitude),
    launchLongitude: Number.isFinite(Number(weapon.launchLongitude))
      ? Number(weapon.launchLongitude)
      : Number(weapon.longitude),
    launchAltitudeMeters: Math.max(0, Number(weapon.launchAltitudeMeters) || 0),
    headingDeg: Number(weapon.headingDeg) || 0,
    speedKts: Math.max(0, Number(weapon.speedKts) || 0),
    hpFraction: clamp(Number(weapon.hpFraction) || 0, 0, 1),
    targetId: typeof weapon.targetId === "string" ? weapon.targetId : null,
    targetLatitude: Number.isFinite(Number(weapon.targetLatitude))
      ? Number(weapon.targetLatitude)
      : undefined,
    targetLongitude: Number.isFinite(Number(weapon.targetLongitude))
      ? Number(weapon.targetLongitude)
      : undefined,
  };
}

function normalizeRecentEvent(event) {
  if (
    !event ||
    typeof event.id !== "string" ||
    typeof event.message !== "string" ||
    typeof event.sideId !== "string"
  ) {
    return null;
  }

  return {
    id: event.id,
    timestamp: Number(event.timestamp) || 0,
    sideId: event.sideId,
    sideName: typeof event.sideName === "string" ? event.sideName : "미상",
    sideColor: typeof event.sideColor === "string" ? event.sideColor : "silver",
    type: typeof event.type === "string" ? event.type : "OTHER",
    message: event.message,
    actorId: typeof event.actorId === "string" ? event.actorId : undefined,
    actorName:
      typeof event.actorName === "string" ? event.actorName : undefined,
    sourceLatitude: Number.isFinite(Number(event.sourceLatitude))
      ? Number(event.sourceLatitude)
      : undefined,
    sourceLongitude: Number.isFinite(Number(event.sourceLongitude))
      ? Number(event.sourceLongitude)
      : undefined,
    sourceAltitudeMeters: Math.max(0, Number(event.sourceAltitudeMeters) || 0),
    targetId: typeof event.targetId === "string" ? event.targetId : undefined,
    targetName:
      typeof event.targetName === "string" ? event.targetName : undefined,
    targetLatitude: Number.isFinite(Number(event.targetLatitude))
      ? Number(event.targetLatitude)
      : undefined,
    targetLongitude: Number.isFinite(Number(event.targetLongitude))
      ? Number(event.targetLongitude)
      : undefined,
    targetAltitudeMeters: Math.max(0, Number(event.targetAltitudeMeters) || 0),
    weaponId: typeof event.weaponId === "string" ? event.weaponId : undefined,
    focusLatitude: Number.isFinite(Number(event.focusLatitude))
      ? Number(event.focusLatitude)
      : undefined,
    focusLongitude: Number.isFinite(Number(event.focusLongitude))
      ? Number(event.focusLongitude)
      : undefined,
    focusAltitudeMeters: Math.max(0, Number(event.focusAltitudeMeters) || 0),
    resultTag:
      typeof event.resultTag === "string" ? event.resultTag : undefined,
  };
}

function getEventLifetimeSeconds(event) {
  switch (event.resultTag) {
    case "launch":
      return 28;
    case "impact":
    case "damage":
    case "kill":
    case "miss":
      return 42;
    default:
      if (event.type === "WEAPON_LAUNCHED") {
        return 28;
      }
      if (event.type === "WEAPON_HIT" || event.type === "WEAPON_MISSED") {
        return 42;
      }
      return 18;
  }
}

function getEventLabel(event) {
  switch (event.resultTag) {
    case "launch":
      return "발사";
    case "impact":
      return "착탄";
    case "damage":
      return "명중";
    case "kill":
      return "격파";
    case "miss":
      return "실패";
    default:
      if (event.type === "WEAPON_LAUNCHED") {
        return "발사";
      }
      if (event.type === "WEAPON_HIT") {
        return "명중";
      }
      if (event.type === "WEAPON_MISSED") {
        return "실패";
      }
      return "교전";
  }
}

function getEventSourcePoint(event) {
  if (
    Number.isFinite(event.sourceLongitude) &&
    Number.isFinite(event.sourceLatitude)
  ) {
    return {
      longitude: event.sourceLongitude,
      latitude: event.sourceLatitude,
      altitudeMeters: event.sourceAltitudeMeters ?? 0,
    };
  }

  return null;
}

function isLaunchEvent(event) {
  return (
    event.resultTag === "launch" ||
    event.resultTag === "counterfire" ||
    event.type === "WEAPON_LAUNCHED"
  );
}

function isImpactEvent(event) {
  return (
    event.resultTag === "impact" ||
    event.resultTag === "damage" ||
    event.resultTag === "kill" ||
    event.resultTag === "miss" ||
    event.type === "WEAPON_HIT" ||
    event.type === "WEAPON_MISSED"
  );
}

function getEventFocusPoint(event) {
  if (
    Number.isFinite(event.focusLongitude) &&
    Number.isFinite(event.focusLatitude)
  ) {
    return {
      longitude: event.focusLongitude,
      latitude: event.focusLatitude,
      altitudeMeters: event.focusAltitudeMeters ?? 0,
    };
  }

  if (
    Number.isFinite(event.targetLongitude) &&
    Number.isFinite(event.targetLatitude)
  ) {
    return {
      longitude: event.targetLongitude,
      latitude: event.targetLatitude,
      altitudeMeters: event.targetAltitudeMeters ?? 0,
    };
  }

  return null;
}

function buildEventPolylinePositions(event) {
  if (
    !Number.isFinite(event.sourceLongitude) ||
    !Number.isFinite(event.sourceLatitude)
  ) {
    return null;
  }

  const focusPoint = getEventFocusPoint(event);
  if (!focusPoint) {
    return null;
  }

  return Cesium.Cartesian3.fromDegreesArrayHeights([
    event.sourceLongitude,
    event.sourceLatitude,
    event.sourceAltitudeMeters ?? 0,
    focusPoint.longitude,
    focusPoint.latitude,
    focusPoint.altitudeMeters ?? 0,
  ]);
}

function estimateEventTracerDurationSeconds(sourcePoint, focusPoint) {
  const sourceCartesian = Cesium.Cartesian3.fromDegrees(
    sourcePoint.longitude,
    sourcePoint.latitude,
    sourcePoint.altitudeMeters ?? 0
  );
  const focusCartesian = Cesium.Cartesian3.fromDegrees(
    focusPoint.longitude,
    focusPoint.latitude,
    focusPoint.altitudeMeters ?? 0
  );
  const distanceMeters = Cesium.Cartesian3.distance(
    sourceCartesian,
    focusCartesian
  );

  return clamp(distanceMeters / 20000, 0.8, 4.8);
}

function buildHotspotRows(state) {
  const hotspotMap = new Map();
  const addContribution = ({
    longitude,
    latitude,
    altitudeMeters,
    score,
    sideId,
    sideName,
    sideColor,
    timestamp,
    message,
    kind,
  }) => {
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return;
    }

    const gridLongitude = Math.round(longitude / 0.04) * 0.04;
    const gridLatitude = Math.round(latitude / 0.04) * 0.04;
    const key = `${gridLongitude.toFixed(2)}:${gridLatitude.toFixed(2)}`;
    if (!hotspotMap.has(key)) {
      hotspotMap.set(key, {
        weight: 0,
        weightedLongitude: 0,
        weightedLatitude: 0,
        weightedAltitude: 0,
        eventCount: 0,
        launchCount: 0,
        impactCount: 0,
        activeWeapons: 0,
        latestTimestamp: 0,
        latestMessage: null,
        sideWeights: new Map(),
      });
    }

    const entry = hotspotMap.get(key);
    entry.weight += score;
    entry.weightedLongitude += longitude * score;
    entry.weightedLatitude += latitude * score;
    entry.weightedAltitude += altitudeMeters * score;
    entry.eventCount += 1;
    if (kind === "weapon") {
      entry.activeWeapons += 1;
    }
    if (kind === "launch") {
      entry.launchCount += 1;
    }
    if (kind === "impact") {
      entry.impactCount += 1;
    }
    if (timestamp >= entry.latestTimestamp) {
      entry.latestTimestamp = timestamp;
      entry.latestMessage = message ?? null;
    }

    const currentSide = entry.sideWeights.get(sideId) ?? {
      name: sideName,
      color: sideColor,
      score: 0,
    };
    currentSide.score += score;
    entry.sideWeights.set(sideId, currentSide);
  };

  (state.weapons ?? []).forEach((weapon) => {
    addContribution({
      longitude: weapon.longitude,
      latitude: weapon.latitude,
      altitudeMeters: weapon.altitudeMeters ?? 0,
      score: 5,
      sideId: weapon.sideId,
      sideName: weapon.sideName,
      sideColor: weapon.sideColor,
      timestamp: state.currentTime ?? 0,
      message: `${weapon.name} 비행 중`,
      kind: "weapon",
    });
  });

  (state.recentEvents ?? []).forEach((event) => {
    const focusPoint = getEventFocusPoint(event);
    if (!focusPoint) {
      return;
    }

    addContribution({
      longitude: focusPoint.longitude,
      latitude: focusPoint.latitude,
      altitudeMeters: focusPoint.altitudeMeters ?? 0,
      score: isImpactEvent(event) ? 4 : isLaunchEvent(event) ? 3 : 2,
      sideId: event.sideId,
      sideName: event.sideName,
      sideColor: event.sideColor,
      timestamp: event.timestamp ?? 0,
      message: event.message,
      kind: isImpactEvent(event)
        ? "impact"
        : isLaunchEvent(event)
          ? "launch"
          : "engagement",
    });
  });

  return [...hotspotMap.entries()]
    .map(([key, entry], index) => {
      const dominantSide = [...entry.sideWeights.values()].sort(
        (left, right) => {
          if (left.score !== right.score) {
            return right.score - left.score;
          }
          return left.name.localeCompare(right.name, "ko-KR");
        }
      )[0] ?? {
        name: "미상 세력",
        color: "silver",
        score: 0,
      };
      const score = Math.round(
        entry.weight + entry.activeWeapons * 3 + entry.impactCount * 2
      );

      return {
        id: `${index}-${key}`,
        label:
          score >= 18
            ? "초고열"
            : score >= 12
              ? "고열"
              : score >= 7
                ? "접전"
                : "활동",
        longitude: entry.weightedLongitude / Math.max(1, entry.weight),
        latitude: entry.weightedLatitude / Math.max(1, entry.weight),
        altitudeMeters: entry.weightedAltitude / Math.max(1, entry.weight),
        radiusMeters: clamp(900 + score * 160, 1200, 5200),
        score,
        eventCount: entry.eventCount,
        activeWeapons: entry.activeWeapons,
        dominantSideName: dominantSide.name,
        dominantSideColor: dominantSide.color,
        latestTimestamp: entry.latestTimestamp,
        latestMessage: entry.latestMessage,
      };
    })
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return right.latestTimestamp - left.latestTimestamp;
    })
    .slice(0, 4);
}

function hotspotColumnLengthMeters(hotspot) {
  return clamp(240 + hotspot.score * 52, 320, 1200);
}

function buildSidePressureRows(state) {
  const sideMap = new Map();

  (state.units ?? []).forEach((unit) => {
    const weight =
      (unit.entityType === "aircraft"
        ? 1.2
        : unit.entityType === "ship"
          ? 1.6
          : unit.entityType === "airbase"
            ? 1.3
            : 1) *
      (0.7 + clamp(unit.hpFraction ?? 0.6, 0.2, 1));
    if (!sideMap.has(unit.sideId)) {
      sideMap.set(unit.sideId, {
        sideId: unit.sideId,
        sideName: unit.sideName,
        sideColor: unit.sideColor,
        units: [],
        weightedLongitude: 0,
        weightedLatitude: 0,
        weightedAltitude: 0,
        totalWeight: 0,
        aircraftCount: 0,
        shipCount: 0,
        weaponCapacity: 0,
        headings: [],
        weaponsInFlight: 0,
        recentLaunches: 0,
        recentImpacts: 0,
      });
    }

    const entry = sideMap.get(unit.sideId);
    entry.units.push(unit);
    entry.weightedLongitude += unit.longitude * weight;
    entry.weightedLatitude += unit.latitude * weight;
    entry.weightedAltitude += (unit.altitudeMeters ?? 0) * weight;
    entry.totalWeight += weight;
    entry.weaponCapacity += unit.weaponCount ?? 0;
    if ((unit.speedKts ?? 0) >= 6) {
      entry.headings.push(unit.headingDeg ?? 0);
    }
    if (unit.entityType === "aircraft") {
      entry.aircraftCount += 1;
    }
    if (unit.entityType === "ship") {
      entry.shipCount += 1;
    }
  });

  (state.weapons ?? []).forEach((weapon) => {
    const entry = sideMap.get(weapon.sideId);
    if (!entry) {
      return;
    }
    entry.weaponsInFlight += 1;
  });

  (state.recentEvents ?? []).forEach((event) => {
    const entry = sideMap.get(event.sideId);
    if (!entry) {
      return;
    }
    if (isLaunchEvent(event)) {
      entry.recentLaunches += 1;
    }
    if (isImpactEvent(event)) {
      entry.recentImpacts += 1;
    }
  });

  const centers = [...sideMap.values()].map((entry) => ({
    sideId: entry.sideId,
    sideName: entry.sideName,
    sideColor: entry.sideColor,
    unitCount: entry.units.length,
    center: {
      longitude: entry.weightedLongitude / Math.max(1, entry.totalWeight),
      latitude: entry.weightedLatitude / Math.max(1, entry.totalWeight),
      altitudeMeters: entry.weightedAltitude / Math.max(1, entry.totalWeight),
    },
    headings: entry.headings,
    weaponCapacity: entry.weaponCapacity,
    weaponsInFlight: entry.weaponsInFlight,
    recentLaunches: entry.recentLaunches,
    recentImpacts: entry.recentImpacts,
    aircraftCount: entry.aircraftCount,
    shipCount: entry.shipCount,
    units: entry.units,
  }));

  return centers
    .map((entry) => {
      const otherCenters = centers.filter(
        (candidate) => candidate.sideId !== entry.sideId
      );
      const opponentCenter =
        otherCenters.length > 0
          ? {
              longitude:
                otherCenters.reduce(
                  (sum, candidate) =>
                    sum + candidate.center.longitude * candidate.unitCount,
                  0
                ) /
                otherCenters.reduce(
                  (sum, candidate) => sum + candidate.unitCount,
                  0
                ),
              latitude:
                otherCenters.reduce(
                  (sum, candidate) =>
                    sum + candidate.center.latitude * candidate.unitCount,
                  0
                ) /
                otherCenters.reduce(
                  (sum, candidate) => sum + candidate.unitCount,
                  0
                ),
              altitudeMeters: 0,
            }
          : null;
      const headingDeg = opponentCenter
        ? bearingDegreesBetweenPoints(entry.center, opponentCenter)
        : averageHeadingDegrees(entry.headings);
      const spreadMeters = entry.units.reduce((maxDistance, unit) => {
        return Math.max(
          maxDistance,
          distanceMetersBetweenPoints(entry.center, unit)
        );
      }, 0);
      const pressureScore = Math.round(
        entry.units.length * 2.4 +
          entry.weaponsInFlight * 3.2 +
          entry.recentLaunches * 1.3 +
          entry.recentImpacts * 1.2 +
          entry.aircraftCount * 1.6 +
          entry.shipCount * 2.1 +
          entry.weaponCapacity * 0.1
      );
      const semiMajorAxis = clamp(
        spreadMeters * 0.92 + 900 + entry.weaponsInFlight * 120,
        1400,
        14000
      );
      const semiMinorAxis = clamp(
        spreadMeters * 0.58 + 700 + entry.units.length * 90,
        900,
        10000
      );
      const arrowLengthMeters = clamp(
        semiMajorAxis * 0.78 +
          entry.recentLaunches * 220 +
          entry.weaponsInFlight * 180,
        1800,
        16000
      );

      return {
        sideId: entry.sideId,
        sideName: entry.sideName,
        sideColor: entry.sideColor,
        center: entry.center,
        headingDeg,
        pressureScore,
        semiMajorAxis,
        semiMinorAxis,
        arrowLengthMeters,
        frontPoint: offsetPointByHeadingMeters(
          entry.center,
          headingDeg,
          arrowLengthMeters,
          0,
          0
        ),
        unitCount: entry.units.length,
        weaponsInFlight: entry.weaponsInFlight,
      };
    })
    .sort((left, right) => {
      if (left.pressureScore !== right.pressureScore) {
        return right.pressureScore - left.pressureScore;
      }
      return right.unitCount - left.unitCount;
    });
}

function defaultBattleState() {
  return {
    scenarioId: "unknown-scenario",
    scenarioName: "전장 관전자",
    currentTime: 0,
    currentSideId: "",
    currentSideName: "",
    units: [],
    weapons: [],
    recentEvents: [],
    stats: {
      aircraft: 0,
      facilities: 0,
      airbases: 0,
      ships: 0,
      weaponsInFlight: 0,
      sides: 0,
    },
    view: {
      followTargetId: null,
      lodLevel: DEFAULT_LOD_LEVEL,
      cameraProfile: DEFAULT_CAMERA_PROFILE,
    },
  };
}

export class BattleSpectatorSystem {
  constructor(viewer) {
    this.viewer = viewer;
    this.dataSource = new Cesium.CustomDataSource("firescope-battle-spectator");
    this.viewer.dataSources.add(this.dataSource);
    this.selectionHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    this.state = defaultBattleState();
    this.unitRecords = new Map();
    this.weaponRecords = new Map();
    this.linkRecords = new Map();
    this.sidePressureRecords = new Map();
    this.eventRecords = new Map();
    this.hotspotRecords = new Map();
    this.effects = [];
    this.trackedBattleEntityId = null;
    this.trackedBattleViewKey = null;
    this.animationTime = 0;
    this.unitLabelIds = new Set();
    this.weaponImpactLabelIds = new Set();
    this.eventLabelIds = new Set();
    this.hotspotLabelIds = new Set();
    this.sidePressureLabelIds = new Set();
    this.visibleEvents = [];
    this.hotspotRows = [];
    this.sidePressureRows = [];
    this.selectionHandler.setInputAction(
      (click) => {
        this.handleSceneSelection(click?.position);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
  }

  handleSceneSelection(position) {
    const selectedTarget = this.resolveSceneSelectionTarget(position);
    if (!selectedTarget) {
      return;
    }

    postBattleSpectatorSelectionToParent({
      followTargetId: `${selectedTarget.type}:${selectedTarget.id}`,
    });
  }

  resolveSceneSelectionTarget(position) {
    if (!position) {
      return null;
    }

    const pickedObject = this.viewer.scene.pick(position);
    const pickedEntityId = resolvePickedCesiumEntityId(pickedObject);
    const pickedTarget = resolveBattlePickTargetFromEntityId(pickedEntityId);
    if (!pickedTarget) {
      return null;
    }

    if (pickedTarget.type === "weapon") {
      return this.weaponRecords.has(pickedTarget.id) ? pickedTarget : null;
    }

    return this.unitRecords.has(pickedTarget.id) ? pickedTarget : null;
  }

  normalizeState(payload = {}) {
    return {
      scenarioId:
        typeof payload.scenarioId === "string"
          ? payload.scenarioId
          : "unknown-scenario",
      scenarioName:
        typeof payload.scenarioName === "string"
          ? payload.scenarioName
          : "전장 관전자",
      currentTime: Number(payload.currentTime) || 0,
      currentSideId:
        typeof payload.currentSideId === "string" ? payload.currentSideId : "",
      currentSideName:
        typeof payload.currentSideName === "string"
          ? payload.currentSideName
          : "",
      units: Array.isArray(payload.units)
        ? payload.units.map(normalizeUnit).filter(Boolean)
        : [],
      weapons: Array.isArray(payload.weapons)
        ? payload.weapons.map(normalizeWeapon).filter(Boolean)
        : [],
      recentEvents: Array.isArray(payload.recentEvents)
        ? payload.recentEvents.map(normalizeRecentEvent).filter(Boolean)
        : [],
      stats: {
        aircraft: Math.max(0, Number(payload.stats?.aircraft) || 0),
        facilities: Math.max(0, Number(payload.stats?.facilities) || 0),
        airbases: Math.max(0, Number(payload.stats?.airbases) || 0),
        ships: Math.max(0, Number(payload.stats?.ships) || 0),
        weaponsInFlight: Math.max(
          0,
          Number(payload.stats?.weaponsInFlight) || 0
        ),
        sides: Math.max(0, Number(payload.stats?.sides) || 0),
      },
      view: {
        followTargetId: normalizeFollowTargetId(payload.view?.followTargetId),
        lodLevel:
          typeof payload.view?.lodLevel === "string" &&
          LOD_CONFIG[payload.view.lodLevel]
            ? payload.view.lodLevel
            : DEFAULT_LOD_LEVEL,
        cameraProfile: normalizeCameraProfile(payload.view?.cameraProfile),
      },
    };
  }

  setState(payload = {}) {
    const nextState = this.normalizeState(payload);
    const lodChanged = nextState.view.lodLevel !== this.state.view?.lodLevel;
    this.state = nextState;
    this.refreshVisualPriorities();
    if (lodChanged) {
      this.rebuildEntities();
    }
    this.syncUnits();
    this.syncWeapons();
    this.syncRecentEvents();
    this.syncHotspots();
    this.syncSidePressures();
    this.syncTargetLinks();
    this.syncCameraTracking();
  }

  refreshVisualPriorities() {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const followTargetId = this.state.view?.followTargetId;
    const currentTime = Number(this.state.currentTime) || 0;

    this.unitLabelIds = buildPrioritizedIdSet(
      this.state.units,
      lodConfig.unitLabelBudget,
      (unit) => resolveUnitLabelPriority(unit, followTargetId)
    );
    this.weaponImpactLabelIds = buildPrioritizedIdSet(
      (this.state.weapons ?? []).filter((weapon) => isTrajectoryWeapon(weapon)),
      lodConfig.weaponImpactLabelBudget,
      (weapon) =>
        resolveWeaponImpactLabelPriority(this.state, weapon, followTargetId)
    );

    const visibleEvents = [...(this.state.recentEvents ?? [])]
      .filter((event) => {
        const eventAge = Math.max(0, currentTime - event.timestamp);
        return (
          eventAge <= getEventLifetimeSeconds(event) &&
          (getEventFocusPoint(event) || buildEventPolylinePositions(event))
        );
      })
      .sort((left, right) => resolveEventPriority(right) - resolveEventPriority(left))
      .slice(0, lodConfig.eventBudget)
      .sort((left, right) => (left.timestamp ?? 0) - (right.timestamp ?? 0));

    this.visibleEvents = visibleEvents;
    this.eventLabelIds = buildPrioritizedIdSet(
      visibleEvents,
      lodConfig.eventLabelBudget,
      resolveEventPriority
    );

    this.hotspotRows = buildHotspotRows(this.state).slice(0, lodConfig.hotspotBudget);
    this.hotspotLabelIds = buildPrioritizedIdSet(
      this.hotspotRows,
      lodConfig.hotspotLabelBudget,
      (hotspot) => hotspot.score * 100 + hotspot.latestTimestamp
    );

    this.sidePressureRows = buildSidePressureRows(this.state).slice(
      0,
      lodConfig.sidePressureBudget
    );
    this.sidePressureLabelIds = buildPrioritizedIdSet(
      this.sidePressureRows,
      lodConfig.sidePressureLabelBudget,
      (row) => row.pressureScore * 100 + row.weaponsInFlight * 20 + row.unitCount * 8,
      (row) => row.sideId
    );
  }

  createUnitGuideEntity(unit, displayPoint = unit) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    if (!isUnitGuideVisible(unit, this.state.view?.followTargetId, lodLevel)) {
      return null;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized =
      unit.selected ||
      isTrackedTarget(this.state.view?.followTargetId, "unit", unit.id);
    const radiusMeters = unitGuideRadiusMeters(unit, emphasized);
    const guideColor = colorForSide(unit.sideColor, emphasized ? 0.82 : 0.42);
    const guideEntity = this.dataSource.entities.add({
      id: `battle-unit-guide-${unit.id}`,
      position: cartesianFromSnapshot(groundPointFromSnapshot(displayPoint)),
      polyline: {
        positions: buildVerticalGuidePositions(displayPoint),
        width: emphasized
          ? lodConfig.unitGuideWidth + 0.8
          : lodConfig.unitGuideWidth,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: emphasized ? 0.18 : 0.11,
          color: guideColor,
        }),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.unitGuideDistance
        ),
      },
      ellipse: {
        semiMajorAxis: radiusMeters,
        semiMinorAxis: radiusMeters,
        height: 0,
        material: colorForSide(unit.sideColor, emphasized ? 0.09 : 0.04),
        outline: true,
        outlineColor: guideColor,
        outlineWidth: emphasized ? 2.2 : 1.2,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.unitGuideDistance
        ),
      },
    });

    return {
      entity: guideEntity,
      emphasized,
    };
  }

  updateUnitGuideEntity(record, unit, displayPoint = unit) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    const showGuide = isUnitGuideVisible(
      unit,
      this.state.view?.followTargetId,
      lodLevel
    );
    if (!showGuide) {
      if (record.guideEntity) {
        this.dataSource.entities.remove(record.guideEntity.entity);
        record.guideEntity = null;
      }
      return;
    }

    if (!record.guideEntity) {
      record.guideEntity = this.createUnitGuideEntity(unit, displayPoint);
      return;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized =
      unit.selected ||
      isTrackedTarget(this.state.view?.followTargetId, "unit", unit.id);
    const radiusMeters = unitGuideRadiusMeters(unit, emphasized);
    record.guideEntity.emphasized = emphasized;
    record.guideEntity.entity.position = cartesianFromSnapshot(
      groundPointFromSnapshot(displayPoint)
    );
    if (record.guideEntity.entity.polyline) {
      record.guideEntity.entity.polyline.positions =
        buildVerticalGuidePositions(displayPoint);
      record.guideEntity.entity.polyline.width = emphasized
        ? lodConfig.unitGuideWidth + 0.8
        : lodConfig.unitGuideWidth;
      record.guideEntity.entity.polyline.material =
        new Cesium.PolylineGlowMaterialProperty({
          glowPower: emphasized ? 0.18 : 0.11,
          color: colorForSide(unit.sideColor, emphasized ? 0.82 : 0.42),
        });
      record.guideEntity.entity.polyline.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.unitGuideDistance);
    }
    if (record.guideEntity.entity.ellipse) {
      record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
      record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
      record.guideEntity.entity.ellipse.material = colorForSide(
        unit.sideColor,
        emphasized ? 0.09 : 0.04
      );
      record.guideEntity.entity.ellipse.outlineColor = colorForSide(
        unit.sideColor,
        emphasized ? 0.82 : 0.42
      );
      record.guideEntity.entity.ellipse.outlineWidth = emphasized ? 2.2 : 1.2;
      record.guideEntity.entity.ellipse.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.unitGuideDistance);
    }
  }

  createWeaponGuideEntity(weapon) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    if (
      !isWeaponGuideVisible(weapon, this.state.view?.followTargetId, lodLevel)
    ) {
      return null;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "weapon",
      weapon.id
    );
    const radiusMeters = weaponGuideRadiusMeters(weapon, emphasized);
    const guideColor = colorForSide(weapon.sideColor, emphasized ? 0.86 : 0.45);
    const guideEntity = this.dataSource.entities.add({
      id: `battle-weapon-guide-${weapon.id}`,
      position: cartesianFromSnapshot(groundPointFromSnapshot(weapon)),
      polyline: {
        positions: buildVerticalGuidePositions(weapon),
        width: emphasized
          ? lodConfig.weaponGuideWidth + 0.6
          : lodConfig.weaponGuideWidth,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: emphasized ? 0.24 : 0.14,
          color: guideColor,
        }),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.weaponGuideDistance
        ),
      },
      ellipse: {
        semiMajorAxis: radiusMeters,
        semiMinorAxis: radiusMeters,
        height: 0,
        material: colorForSide(weapon.sideColor, emphasized ? 0.08 : 0.035),
        outline: true,
        outlineColor: guideColor,
        outlineWidth: emphasized ? 1.9 : 1.1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.weaponGuideDistance
        ),
      },
    });

    return {
      entity: guideEntity,
      emphasized,
    };
  }

  updateWeaponGuideEntity(record, weapon) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    const showGuide = isWeaponGuideVisible(
      weapon,
      this.state.view?.followTargetId,
      lodLevel
    );
    if (!showGuide) {
      if (record.guideEntity) {
        this.dataSource.entities.remove(record.guideEntity.entity);
        record.guideEntity = null;
      }
      return;
    }

    if (!record.guideEntity) {
      record.guideEntity = this.createWeaponGuideEntity(weapon);
      return;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "weapon",
      weapon.id
    );
    const radiusMeters = weaponGuideRadiusMeters(weapon, emphasized);
    record.guideEntity.emphasized = emphasized;
    record.guideEntity.entity.position = cartesianFromSnapshot(
      groundPointFromSnapshot(weapon)
    );
    if (record.guideEntity.entity.polyline) {
      record.guideEntity.entity.polyline.positions =
        buildVerticalGuidePositions(weapon);
      record.guideEntity.entity.polyline.width = emphasized
        ? lodConfig.weaponGuideWidth + 0.6
        : lodConfig.weaponGuideWidth;
      record.guideEntity.entity.polyline.material =
        new Cesium.PolylineGlowMaterialProperty({
          glowPower: emphasized ? 0.24 : 0.14,
          color: colorForSide(weapon.sideColor, emphasized ? 0.86 : 0.45),
        });
      record.guideEntity.entity.polyline.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.weaponGuideDistance);
    }
    if (record.guideEntity.entity.ellipse) {
      record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
      record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
      record.guideEntity.entity.ellipse.material = colorForSide(
        weapon.sideColor,
        emphasized ? 0.08 : 0.035
      );
      record.guideEntity.entity.ellipse.outlineColor = colorForSide(
        weapon.sideColor,
        emphasized ? 0.86 : 0.45
      );
      record.guideEntity.entity.ellipse.outlineWidth = emphasized ? 1.9 : 1.1;
      record.guideEntity.entity.ellipse.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.weaponGuideDistance);
    }
  }

  createWeaponImpactLinkEntity(weapon) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    if (
      !shouldShowWeaponImpactLink(
        weapon,
        this.state.view?.followTargetId,
        lodLevel
      )
    ) {
      return null;
    }

    const targetPoint = resolveWeaponImpactPoint(this.state, weapon);
    if (!targetPoint) {
      return null;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "weapon",
      weapon.id
    );
    const positions = buildArcPolylinePositions(
      weapon,
      targetPoint,
      estimateLinkArcLiftMeters(weapon, targetPoint) * 0.72
    );
    if (!positions) {
      return null;
    }

    return this.dataSource.entities.add({
      id: `battle-weapon-impact-link-${weapon.id}`,
      polyline: {
        positions,
        width: emphasized
          ? lodConfig.weaponImpactLinkWidth + 0.8
          : lodConfig.weaponImpactLinkWidth,
        material: new Cesium.PolylineDashMaterialProperty({
          color: colorForSide(weapon.sideColor, emphasized ? 0.82 : 0.48),
          dashLength: emphasized ? 16 : 20,
          gapColor: colorForSide(weapon.sideColor, 0.08),
        }),
        arcType: Cesium.ArcType.NONE,
        clampToGround: false,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.weaponImpactLinkDistance
        ),
      },
    });
  }

  updateWeaponImpactLinkEntity(record, weapon) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    const shouldShow = shouldShowWeaponImpactLink(
      weapon,
      this.state.view?.followTargetId,
      lodLevel
    );
    const targetPoint = resolveWeaponImpactPoint(this.state, weapon);
    if (!shouldShow || !targetPoint) {
      if (record.impactLinkEntity) {
        this.dataSource.entities.remove(record.impactLinkEntity);
        record.impactLinkEntity = null;
      }
      return;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "weapon",
      weapon.id
    );
    const positions = buildArcPolylinePositions(
      weapon,
      targetPoint,
      estimateLinkArcLiftMeters(weapon, targetPoint) * 0.72
    );
    if (!positions) {
      if (record.impactLinkEntity) {
        this.dataSource.entities.remove(record.impactLinkEntity);
        record.impactLinkEntity = null;
      }
      return;
    }

    if (!record.impactLinkEntity) {
      record.impactLinkEntity = this.createWeaponImpactLinkEntity(weapon);
      return;
    }

    record.impactLinkEntity.polyline.positions = positions;
    record.impactLinkEntity.polyline.width = emphasized
      ? lodConfig.weaponImpactLinkWidth + 0.8
      : lodConfig.weaponImpactLinkWidth;
    record.impactLinkEntity.polyline.material =
      new Cesium.PolylineDashMaterialProperty({
        color: colorForSide(weapon.sideColor, emphasized ? 0.82 : 0.48),
        dashLength: emphasized ? 16 : 20,
        gapColor: colorForSide(weapon.sideColor, 0.08),
      });
    record.impactLinkEntity.polyline.distanceDisplayCondition =
      new Cesium.DistanceDisplayCondition(
        0,
        lodConfig.weaponImpactLinkDistance
      );
  }

  createWeaponTrajectoryEntities(weapon) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    if (
      !shouldShowWeaponTrajectoryCorridor(
        weapon,
        this.state.view?.followTargetId,
        lodLevel
      )
    ) {
      return null;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "weapon",
      weapon.id
    );
    const launchPoint = {
      longitude: weapon.launchLongitude,
      latitude: weapon.launchLatitude,
      altitudeMeters: weapon.launchAltitudeMeters ?? 0,
    };
    const currentPoint = {
      longitude: weapon.longitude,
      latitude: weapon.latitude,
      altitudeMeters: weapon.altitudeMeters ?? 0,
    };
    const targetPoint = resolveWeaponTrajectoryTargetPoint(this.state, weapon);
    const impactPoint = resolveWeaponImpactPoint(this.state, weapon);
    const impactRadiusMeters = resolveWeaponImpactRadiusMeters(weapon);
    const timeToImpactSec = estimateWeaponTimeToImpactSec(this.state, weapon);
    const showImpactCallout =
      emphasized || this.weaponImpactLabelIds.has(weapon.id);
    const projectedPositions = targetPoint
      ? buildArcPolylinePositions(
          launchPoint,
          targetPoint,
          estimateLinkArcLiftMeters(launchPoint, targetPoint) *
            (emphasized ? 1.08 : 0.94)
        )
      : null;
    const progressPositions = buildArcPolylinePositions(
      launchPoint,
      currentPoint,
      Math.max(estimateLinkArcLiftMeters(launchPoint, currentPoint) * 0.74, 320)
    );
    if (!projectedPositions && !progressPositions) {
      return null;
    }

    return {
      projectedEntity: projectedPositions
        ? this.dataSource.entities.add({
            id: `battle-weapon-trajectory-projected-${weapon.id}`,
            polyline: {
              positions: projectedPositions,
              width: emphasized
                ? lodConfig.weaponTrajectoryProjectedWidth + 0.6
                : lodConfig.weaponTrajectoryProjectedWidth,
              material: new Cesium.PolylineDashMaterialProperty({
                color: colorForSide(weapon.sideColor, emphasized ? 0.62 : 0.38),
                dashLength: emphasized ? 18 : 22,
                gapColor: colorForSide(weapon.sideColor, 0.06),
              }),
              arcType: Cesium.ArcType.NONE,
              clampToGround: false,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                lodConfig.weaponTrajectoryDistance
              ),
            },
          })
        : null,
      progressEntity: progressPositions
        ? this.dataSource.entities.add({
            id: `battle-weapon-trajectory-progress-${weapon.id}`,
            polyline: {
              positions: progressPositions,
              width: emphasized
                ? lodConfig.weaponTrajectoryWidth + 0.8
                : lodConfig.weaponTrajectoryWidth,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: emphasized ? 0.26 : 0.18,
                color: colorForSide(weapon.sideColor, emphasized ? 0.96 : 0.74),
              }),
              arcType: Cesium.ArcType.NONE,
              clampToGround: false,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                lodConfig.weaponTrajectoryDistance
              ),
            },
          })
        : null,
      launchEntity: this.dataSource.entities.add({
        id: `battle-weapon-trajectory-launch-${weapon.id}`,
        position: cartesianFromSnapshot(launchPoint),
        point: {
          pixelSize: emphasized ? 12 : 9,
          color: colorForSide(weapon.sideColor, emphasized ? 0.92 : 0.7),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.88),
          outlineWidth: 2,
          disableDepthTestDistance:
            Number.POSITIVE_INFINITY,
        },
      }),
      impactZoneEntity: impactPoint && showImpactCallout
        ? this.dataSource.entities.add({
            id: `battle-weapon-impact-zone-${weapon.id}`,
            position: cartesianFromSnapshot(impactPoint),
            ellipse: {
              semiMajorAxis: impactRadiusMeters,
              semiMinorAxis: impactRadiusMeters,
              height: 0,
              material: colorForSide(
                weapon.sideColor,
                emphasized ? 0.08 : 0.035
              ),
              outline: true,
              outlineColor: colorForSide(
                weapon.sideColor,
                emphasized ? 0.9 : 0.48
              ),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                lodConfig.weaponTrajectoryDistance
              ),
            },
          })
        : null,
      impactLabelEntity: impactPoint && showImpactCallout
        ? this.dataSource.entities.add({
            id: `battle-weapon-impact-label-${weapon.id}`,
            position: cartesianFromSnapshot({
              ...impactPoint,
              altitudeMeters: 120,
            }),
            label: {
              text: buildWeaponImpactLabelText(
                weapon,
                timeToImpactSec,
                impactRadiusMeters,
                this.state.view?.followTargetId
              ),
              font: emphasized ? "700 14px sans-serif" : "600 12px sans-serif",
              fillColor: colorForSide(
                weapon.sideColor,
                emphasized ? 0.96 : 0.82
              ),
              outlineColor: Cesium.Color.BLACK.withAlpha(0.78),
              outlineWidth: 3,
              showBackground: true,
              backgroundColor: Cesium.Color.BLACK.withAlpha(
                emphasized ? 0.38 : 0.24
              ),
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -12),
              scale: emphasized ? 0.98 : 0.84,
              disableDepthTestDistance: emphasized ? Number.POSITIVE_INFINITY : 0,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                lodConfig.weaponTrajectoryDistance
              ),
            },
          })
        : null,
    };
  }

  removeWeaponTrajectoryEntities(record) {
    if (!record?.trajectoryEntities) {
      return;
    }

    if (record.trajectoryEntities.projectedEntity) {
      this.dataSource.entities.remove(
        record.trajectoryEntities.projectedEntity
      );
    }
    if (record.trajectoryEntities.progressEntity) {
      this.dataSource.entities.remove(record.trajectoryEntities.progressEntity);
    }
    if (record.trajectoryEntities.launchEntity) {
      this.dataSource.entities.remove(record.trajectoryEntities.launchEntity);
    }
    if (record.trajectoryEntities.impactZoneEntity) {
      this.dataSource.entities.remove(
        record.trajectoryEntities.impactZoneEntity
      );
    }
    if (record.trajectoryEntities.impactLabelEntity) {
      this.dataSource.entities.remove(
        record.trajectoryEntities.impactLabelEntity
      );
    }

    record.trajectoryEntities = null;
  }

  updateWeaponTrajectoryEntities(record, weapon) {
    const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
    const shouldShow = shouldShowWeaponTrajectoryCorridor(
      weapon,
      this.state.view?.followTargetId,
      lodLevel
    );
    if (!shouldShow) {
      this.removeWeaponTrajectoryEntities(record);
      return;
    }

    const lodConfig = getLodConfig(lodLevel);
    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "weapon",
      weapon.id
    );
    const launchPoint = {
      longitude: weapon.launchLongitude,
      latitude: weapon.launchLatitude,
      altitudeMeters: weapon.launchAltitudeMeters ?? 0,
    };
    const currentPoint = {
      longitude: weapon.longitude,
      latitude: weapon.latitude,
      altitudeMeters: weapon.altitudeMeters ?? 0,
    };
    const targetPoint = resolveWeaponTrajectoryTargetPoint(this.state, weapon);
    const impactPoint = resolveWeaponImpactPoint(this.state, weapon);
    const impactRadiusMeters = resolveWeaponImpactRadiusMeters(weapon);
    const timeToImpactSec = estimateWeaponTimeToImpactSec(this.state, weapon);
    const showImpactCallout =
      emphasized || this.weaponImpactLabelIds.has(weapon.id);
    const projectedPositions = targetPoint
      ? buildArcPolylinePositions(
          launchPoint,
          targetPoint,
          estimateLinkArcLiftMeters(launchPoint, targetPoint) *
            (emphasized ? 1.08 : 0.94)
        )
      : null;
    const progressPositions = buildArcPolylinePositions(
      launchPoint,
      currentPoint,
      Math.max(estimateLinkArcLiftMeters(launchPoint, currentPoint) * 0.74, 320)
    );
    if (!projectedPositions && !progressPositions) {
      this.removeWeaponTrajectoryEntities(record);
      return;
    }

    if (!record.trajectoryEntities) {
      record.trajectoryEntities = this.createWeaponTrajectoryEntities(weapon);
      return;
    }

    if (!projectedPositions) {
      if (record.trajectoryEntities.projectedEntity) {
        this.dataSource.entities.remove(
          record.trajectoryEntities.projectedEntity
        );
        record.trajectoryEntities.projectedEntity = null;
      }
    } else if (!record.trajectoryEntities.projectedEntity) {
      record.trajectoryEntities.projectedEntity = this.dataSource.entities.add({
        id: `battle-weapon-trajectory-projected-${weapon.id}`,
        polyline: {
          positions: projectedPositions,
          width: lodConfig.weaponTrajectoryProjectedWidth,
          material: new Cesium.PolylineDashMaterialProperty({
            color: colorForSide(weapon.sideColor, 0.38),
            dashLength: 22,
            gapColor: colorForSide(weapon.sideColor, 0.06),
          }),
          arcType: Cesium.ArcType.NONE,
          clampToGround: false,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            lodConfig.weaponTrajectoryDistance
          ),
        },
      });
    } else {
      record.trajectoryEntities.projectedEntity.polyline.positions =
        projectedPositions;
      record.trajectoryEntities.projectedEntity.polyline.width = emphasized
        ? lodConfig.weaponTrajectoryProjectedWidth + 0.6
        : lodConfig.weaponTrajectoryProjectedWidth;
      record.trajectoryEntities.projectedEntity.polyline.material =
        new Cesium.PolylineDashMaterialProperty({
          color: colorForSide(weapon.sideColor, emphasized ? 0.62 : 0.38),
          dashLength: emphasized ? 18 : 22,
          gapColor: colorForSide(weapon.sideColor, 0.06),
        });
      record.trajectoryEntities.projectedEntity.polyline.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.weaponTrajectoryDistance
        );
    }

    if (!progressPositions) {
      if (record.trajectoryEntities.progressEntity) {
        this.dataSource.entities.remove(
          record.trajectoryEntities.progressEntity
        );
        record.trajectoryEntities.progressEntity = null;
      }
    } else if (!record.trajectoryEntities.progressEntity) {
      record.trajectoryEntities.progressEntity = this.dataSource.entities.add({
        id: `battle-weapon-trajectory-progress-${weapon.id}`,
        polyline: {
          positions: progressPositions,
          width: lodConfig.weaponTrajectoryWidth,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.18,
            color: colorForSide(weapon.sideColor, 0.74),
          }),
          arcType: Cesium.ArcType.NONE,
          clampToGround: false,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            lodConfig.weaponTrajectoryDistance
          ),
        },
      });
    } else {
      record.trajectoryEntities.progressEntity.polyline.positions =
        progressPositions;
      record.trajectoryEntities.progressEntity.polyline.width = emphasized
        ? lodConfig.weaponTrajectoryWidth + 0.8
        : lodConfig.weaponTrajectoryWidth;
      record.trajectoryEntities.progressEntity.polyline.material =
        new Cesium.PolylineGlowMaterialProperty({
          glowPower: emphasized ? 0.26 : 0.18,
          color: colorForSide(weapon.sideColor, emphasized ? 0.96 : 0.74),
        });
      record.trajectoryEntities.progressEntity.polyline.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.weaponTrajectoryDistance
        );
    }

    if (!record.trajectoryEntities.launchEntity) {
      record.trajectoryEntities.launchEntity = this.dataSource.entities.add({
        id: `battle-weapon-trajectory-launch-${weapon.id}`,
        position: cartesianFromSnapshot(launchPoint),
        point: {
          pixelSize: emphasized ? 9 : 7,
          color: colorForSide(weapon.sideColor, emphasized ? 0.92 : 0.7),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.88),
          outlineWidth: 1.8,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    } else {
      record.trajectoryEntities.launchEntity.position =
        cartesianFromSnapshot(launchPoint);
      record.trajectoryEntities.launchEntity.point.pixelSize = emphasized
        ? 12
        : 9;
      record.trajectoryEntities.launchEntity.point.color = colorForSide(
        weapon.sideColor,
        emphasized ? 0.92 : 0.7
      );
      record.trajectoryEntities.launchEntity.point.disableDepthTestDistance =
        Number.POSITIVE_INFINITY;
    }

    if (!impactPoint || !showImpactCallout) {
      if (record.trajectoryEntities.impactZoneEntity) {
        this.dataSource.entities.remove(
          record.trajectoryEntities.impactZoneEntity
        );
        record.trajectoryEntities.impactZoneEntity = null;
      }
      if (record.trajectoryEntities.impactLabelEntity) {
        this.dataSource.entities.remove(
          record.trajectoryEntities.impactLabelEntity
        );
        record.trajectoryEntities.impactLabelEntity = null;
      }
    } else if (!record.trajectoryEntities.impactZoneEntity) {
      record.trajectoryEntities.impactZoneEntity = this.dataSource.entities.add(
        {
          id: `battle-weapon-impact-zone-${weapon.id}`,
          position: cartesianFromSnapshot(impactPoint),
          ellipse: {
            semiMajorAxis: impactRadiusMeters,
            semiMinorAxis: impactRadiusMeters,
            height: 0,
            material: colorForSide(weapon.sideColor, emphasized ? 0.08 : 0.035),
            outline: true,
            outlineColor: colorForSide(
              weapon.sideColor,
              emphasized ? 0.9 : 0.48
            ),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              lodConfig.weaponTrajectoryDistance
            ),
          },
        }
      );
    } else {
      record.trajectoryEntities.impactZoneEntity.position =
        cartesianFromSnapshot(impactPoint);
      record.trajectoryEntities.impactZoneEntity.ellipse.semiMajorAxis =
        impactRadiusMeters;
      record.trajectoryEntities.impactZoneEntity.ellipse.semiMinorAxis =
        impactRadiusMeters;
      record.trajectoryEntities.impactZoneEntity.ellipse.material =
        colorForSide(weapon.sideColor, emphasized ? 0.08 : 0.035);
      record.trajectoryEntities.impactZoneEntity.ellipse.outlineColor =
        colorForSide(weapon.sideColor, emphasized ? 0.9 : 0.48);
      record.trajectoryEntities.impactZoneEntity.ellipse.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.weaponTrajectoryDistance
        );
    }

    if (!impactPoint || !showImpactCallout) {
      return;
    }

    if (!record.trajectoryEntities.impactLabelEntity) {
      record.trajectoryEntities.impactLabelEntity =
        this.dataSource.entities.add({
          id: `battle-weapon-impact-label-${weapon.id}`,
          position: cartesianFromSnapshot({
            ...impactPoint,
            altitudeMeters: 120,
          }),
          label: {
            text: buildWeaponImpactLabelText(
              weapon,
              timeToImpactSec,
              impactRadiusMeters,
              this.state.view?.followTargetId
            ),
            font: emphasized ? "700 14px sans-serif" : "600 12px sans-serif",
            fillColor: colorForSide(weapon.sideColor, emphasized ? 0.96 : 0.82),
            outlineColor: Cesium.Color.BLACK.withAlpha(0.78),
            outlineWidth: 3,
            showBackground: true,
            backgroundColor: Cesium.Color.BLACK.withAlpha(
              emphasized ? 0.38 : 0.24
            ),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            scale: emphasized ? 0.98 : 0.84,
            disableDepthTestDistance: emphasized ? Number.POSITIVE_INFINITY : 0,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              lodConfig.weaponTrajectoryDistance
            ),
          },
        });
    } else {
      record.trajectoryEntities.impactLabelEntity.position =
        cartesianFromSnapshot({
          ...impactPoint,
          altitudeMeters: 120,
        });
      record.trajectoryEntities.impactLabelEntity.label.text =
        buildWeaponImpactLabelText(
          weapon,
          timeToImpactSec,
          impactRadiusMeters,
          this.state.view?.followTargetId
        );
      record.trajectoryEntities.impactLabelEntity.label.font = emphasized
        ? "700 14px sans-serif"
        : "600 12px sans-serif";
      record.trajectoryEntities.impactLabelEntity.label.fillColor =
        colorForSide(weapon.sideColor, emphasized ? 0.96 : 0.82);
      record.trajectoryEntities.impactLabelEntity.label.backgroundColor =
        Cesium.Color.BLACK.withAlpha(emphasized ? 0.38 : 0.24);
      record.trajectoryEntities.impactLabelEntity.label.scale = emphasized
        ? 0.98
        : 0.84;
      record.trajectoryEntities.impactLabelEntity.label.disableDepthTestDistance =
        emphasized ? Number.POSITIVE_INFINITY : 0;
      record.trajectoryEntities.impactLabelEntity.label.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.weaponTrajectoryDistance
        );
    }
  }

  createProjectedCourseEntity(unit, displayPoint = unit) {
    if (!shouldShowProjectedCourse(unit, this.state.view?.followTargetId)) {
      return null;
    }

    const projectedPoint = resolveProjectedCoursePoint(this.state, unit);
    const positions = buildLinearPolylinePositions([displayPoint, projectedPoint]);
    if (!positions) {
      return null;
    }

    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "unit",
      unit.id
    );
    const polyline = this.dataSource.entities.add({
      id: `battle-unit-course-${unit.id}`,
      polyline: {
        positions,
        width: emphasized ? 4.2 : 3.2,
        material: new Cesium.PolylineArrowMaterialProperty(
          colorForSide(unit.sideColor, emphasized ? 0.84 : 0.58)
        ),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          110000
        ),
        arcType: Cesium.ArcType.NONE,
        clampToGround: false,
      },
    });
    const endpoint = this.dataSource.entities.add({
      id: `battle-unit-course-end-${unit.id}`,
      position: cartesianFromSnapshot(projectedPoint),
      point: {
        pixelSize: emphasized ? 10 : 8,
        color: colorForSide(unit.sideColor, emphasized ? 0.92 : 0.72),
        outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    return {
      polyline,
      endpoint,
    };
  }

  updateProjectedCourseEntity(record, unit, displayPoint = unit) {
    const showCourse = shouldShowProjectedCourse(
      unit,
      this.state.view?.followTargetId
    );
    if (!showCourse) {
      if (record.courseEntity) {
        this.dataSource.entities.remove(record.courseEntity.polyline);
        this.dataSource.entities.remove(record.courseEntity.endpoint);
        record.courseEntity = null;
      }
      return;
    }

    const projectedPoint = resolveProjectedCoursePoint(this.state, unit);
    const positions = buildLinearPolylinePositions([displayPoint, projectedPoint]);
    if (!positions) {
      if (record.courseEntity) {
        this.dataSource.entities.remove(record.courseEntity.polyline);
        this.dataSource.entities.remove(record.courseEntity.endpoint);
        record.courseEntity = null;
      }
      return;
    }

    if (!record.courseEntity) {
      record.courseEntity = this.createProjectedCourseEntity(unit, displayPoint);
      return;
    }

    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "unit",
      unit.id
    );
    record.courseEntity.polyline.polyline.positions = positions;
    record.courseEntity.polyline.polyline.width = emphasized ? 4.2 : 3.2;
    record.courseEntity.polyline.polyline.material =
      new Cesium.PolylineArrowMaterialProperty(
        colorForSide(unit.sideColor, emphasized ? 0.84 : 0.58)
      );
    record.courseEntity.endpoint.position =
      cartesianFromSnapshot(projectedPoint);
    record.courseEntity.endpoint.point.pixelSize = emphasized ? 10 : 8;
    record.courseEntity.endpoint.point.color = colorForSide(
      unit.sideColor,
      emphasized ? 0.92 : 0.72
    );
  }

  createUnitRecord(unit, renderContext) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const displayPoint = resolveDisplayedUnitPoint(unit, renderContext);
    const positionProperty = createPositionProperty(displayPoint);
    const tracked = isTrackedTarget(
      this.state.view?.followTargetId,
      "unit",
      unit.id
    );
    const emphasized = unit.selected || tracked;
    const baseModel = resolveUnitModel(unit, renderContext, lodConfig);
    const useModel = resolveUnitModelRenderProfile(baseModel, unit, {
      lodLevel: this.state.view?.lodLevel,
      cameraProfile: this.state.view?.cameraProfile,
      emphasized,
      tracked,
    });
    const showLabel = emphasized || this.unitLabelIds.has(unit.id);
    const entity = this.dataSource.entities.add({
      id: `battle-unit-${unit.id}`,
      position: positionProperty,
      orientation: new Cesium.CallbackProperty(
        () => resolveHeadingOrientation(unit, unit.headingDeg),
        false
      ),
      model: useModel
        ? createUnitModelGraphics(unit, useModel, emphasized, tracked)
        : undefined,
      point: useModel ? undefined : createUnitPointGraphics(unit, emphasized),
      label: showLabel
        ? createLabel(
            buildUnitLabelText(unit, this.state.view?.followTargetId),
            unit.sideColor,
            lodConfig.labelDistance,
            {
              emphasized,
              heightReference: resolveUnitOverlayHeightReference(unit),
              disableDepthTestDistance:
                emphasized || isGroundRenderUnit(unit)
                  ? Number.POSITIVE_INFINITY
                  : 0,
              pixelOffsetY: emphasized ? -34 : -20,
            }
          )
        : undefined,
      path: shouldShowUnitTrail(
        unit,
        this.state.view?.followTargetId,
        this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL
      )
        ? createUnitTrailGraphics(unit, lodConfig)
        : undefined,
    });

    return {
      entity,
      positionProperty,
      displayPoint,
      unit,
      useModel: Boolean(useModel),
      guideEntity: this.createUnitGuideEntity(unit, displayPoint),
      courseEntity: this.createProjectedCourseEntity(unit, displayPoint),
    };
  }

  updateUnitRecord(record, unit, renderContext) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    record.unit = unit;
    const displayPoint = resolveDisplayedUnitPoint(unit, renderContext);
    record.displayPoint = displayPoint;
    addPositionSample(record.positionProperty, displayPoint, UNIT_SAMPLE_SECONDS);
    const tracked = isTrackedTarget(
      this.state.view?.followTargetId,
      "unit",
      unit.id
    );
    const emphasized = unit.selected || tracked;
    const baseModel = resolveUnitModel(unit, renderContext, lodConfig);
    const useModel = resolveUnitModelRenderProfile(baseModel, unit, {
      lodLevel: this.state.view?.lodLevel,
      cameraProfile: this.state.view?.cameraProfile,
      emphasized,
      tracked,
    });
    record.useModel = Boolean(useModel);
    const showLabel = emphasized || this.unitLabelIds.has(unit.id);

    syncUnitPrimaryVisual(record, unit, useModel, emphasized, tracked);

    if (showLabel && !record.entity.label) {
      record.entity.label = createLabel(
        buildUnitLabelText(unit, this.state.view?.followTargetId),
        unit.sideColor,
        lodConfig.labelDistance,
        {
          emphasized,
          heightReference: resolveUnitOverlayHeightReference(unit),
          disableDepthTestDistance:
            emphasized || isGroundRenderUnit(unit)
              ? Number.POSITIVE_INFINITY
              : 0,
          pixelOffsetY: emphasized ? -34 : -20,
        }
      );
    } else if (!showLabel && record.entity.label) {
      record.entity.label = undefined;
    }

    if (record.entity.label) {
      record.entity.label.text = buildUnitLabelText(
        unit,
        this.state.view?.followTargetId
      );
      record.entity.label.scale = emphasized ? 0.58 : 0.48;
      record.entity.label.backgroundColor = colorForSide(
        unit.sideColor,
        emphasized ? 0.2 : 0.11
      );
      record.entity.label.fillColor = Cesium.Color.WHITE.withAlpha(
        emphasized ? 1 : 0.94
      );
      record.entity.label.outlineColor = Cesium.Color.BLACK.withAlpha(
        emphasized ? 0.82 : 0.58
      );
      record.entity.label.outlineWidth = emphasized ? 3 : 2;
      record.entity.label.font = emphasized
        ? "700 24px Bahnschrift, sans-serif"
        : "600 20px Bahnschrift, sans-serif";
      record.entity.label.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.labelDistance);
      record.entity.label.scaleByDistance = new Cesium.NearFarScalar(
        2500,
        emphasized ? 1 : 0.96,
        lodConfig.labelDistance,
        emphasized ? 0.76 : 0.62
      );
      record.entity.label.heightReference = resolveUnitOverlayHeightReference(
        unit
      );
      record.entity.label.disableDepthTestDistance =
        emphasized || isGroundRenderUnit(unit)
          ? Number.POSITIVE_INFINITY
          : 0;
      record.entity.label.pixelOffset =
        emphasized
          ? new Cesium.Cartesian2(0, -34)
          : new Cesium.Cartesian2(0, -20);
    }
    record.entity.orientation = new Cesium.CallbackProperty(
      () => resolveHeadingOrientation(unit, unit.headingDeg),
      false
    );
    const showTrail = shouldShowUnitTrail(
      unit,
      this.state.view?.followTargetId,
      this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL
    );
    if (showTrail) {
      if (!record.entity.path) {
        record.entity.path = createUnitTrailGraphics(unit, lodConfig);
      } else {
        record.entity.path.trailTime = lodConfig.unitTrailTime;
        record.entity.path.width =
          unit.selected || unit.entityType === "aircraft"
            ? lodConfig.unitTrailWidth
            : Math.max(1.4, lodConfig.unitTrailWidth - 0.4);
        record.entity.path.material = new Cesium.PolylineGlowMaterialProperty({
          glowPower: unit.selected ? 0.2 : 0.12,
          color: colorForSide(unit.sideColor, unit.selected ? 0.72 : 0.4),
        });
      }
    } else if (record.entity.path) {
      record.entity.path = undefined;
    }
    this.updateUnitGuideEntity(record, unit, displayPoint);
    this.updateProjectedCourseEntity(record, unit, displayPoint);
  }

  syncUnits() {
    const seenIds = new Set();
    const renderContext = buildUnitModelRenderContext(this.state.units);

    this.state.units.forEach((unit) => {
      seenIds.add(unit.id);
      const existingRecord = this.unitRecords.get(unit.id);
      if (!existingRecord) {
        this.unitRecords.set(
          unit.id,
          this.createUnitRecord(unit, renderContext)
        );
        return;
      }

      this.updateUnitRecord(existingRecord, unit, renderContext);
    });

    for (const [unitId, record] of this.unitRecords.entries()) {
      if (seenIds.has(unitId)) {
        continue;
      }

      if (record.guideEntity) {
        this.dataSource.entities.remove(record.guideEntity.entity);
      }
      if (record.courseEntity) {
        this.dataSource.entities.remove(record.courseEntity.polyline);
        this.dataSource.entities.remove(record.courseEntity.endpoint);
      }
      this.dataSource.entities.remove(record.entity);
      this.unitRecords.delete(unitId);
    }
  }

  createWeaponRecord(weapon) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const positionProperty = createPositionProperty(weapon);
    const sideColor = colorForSide(weapon.sideColor, 0.92);
    const emphasized = isTrackedTarget(
      this.state.view?.followTargetId,
      "weapon",
      weapon.id
    );
    const entity = this.dataSource.entities.add({
      id: `battle-weapon-${weapon.id}`,
      position: positionProperty,
      orientation: new Cesium.VelocityOrientationProperty(positionProperty),
      model: {
        uri: assetUrl(resolveWeaponModel(weapon), "Battle spectator weapon"),
        scale: lodConfig.weaponModelScale,
        minimumPixelSize: lodConfig.weaponMinimumPixelSize,
        maximumScale: lodConfig.weaponMaximumScale,
        color: colorForSide(weapon.sideColor, 0.84),
        colorBlendAmount: 0.26,
        silhouetteColor: Cesium.Color.WHITE.withAlpha(0.72),
        silhouetteSize: emphasized ? 2.4 : 1.8,
      },
      path: new Cesium.PathGraphics({
        show: true,
        leadTime: 0,
        trailTime: lodConfig.weaponTrailTime,
        width: lodConfig.weaponPathWidth,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: lodConfig.weaponGlowPower,
          color: sideColor,
        }),
      }),
      point: {
        pixelSize: emphasized
          ? lodConfig.weaponPointSize + 4
          : lodConfig.weaponPointSize + 2,
        color: sideColor,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.82),
        outlineWidth: 2,
        scaleByDistance: new Cesium.NearFarScalar(
          4000,
          1.2,
          lodConfig.weaponTrajectoryDistance,
          0.92
        ),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    return {
      entity,
      positionProperty,
      lastWeapon: weapon,
      guideEntity: this.createWeaponGuideEntity(weapon),
      impactLinkEntity: this.createWeaponImpactLinkEntity(weapon),
      trajectoryEntities: this.createWeaponTrajectoryEntities(weapon),
    };
  }

  updateWeaponRecord(record, weapon) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    record.lastWeapon = weapon;
    addPositionSample(record.positionProperty, weapon, WEAPON_SAMPLE_SECONDS);
    if (record.entity.model) {
      record.entity.model.color = colorForSide(weapon.sideColor, 0.84);
      record.entity.model.scale = lodConfig.weaponModelScale;
      record.entity.model.minimumPixelSize = lodConfig.weaponMinimumPixelSize;
      record.entity.model.maximumScale = lodConfig.weaponMaximumScale;
      record.entity.model.silhouetteSize = isTrackedTarget(
        this.state.view?.followTargetId,
        "weapon",
        weapon.id
      )
        ? 2.4
        : 1.8;
    }
    if (record.entity.point) {
      record.entity.point.color = colorForSide(weapon.sideColor, 0.92);
      record.entity.point.pixelSize = isTrackedTarget(
        this.state.view?.followTargetId,
        "weapon",
        weapon.id
      )
        ? lodConfig.weaponPointSize + 4
        : lodConfig.weaponPointSize + 2;
      record.entity.point.scaleByDistance = new Cesium.NearFarScalar(
        4000,
        1.2,
        lodConfig.weaponTrajectoryDistance,
        0.92
      );
      record.entity.point.disableDepthTestDistance = Number.POSITIVE_INFINITY;
    }
    if (record.entity.path) {
      record.entity.path.trailTime = lodConfig.weaponTrailTime;
      record.entity.path.width = lodConfig.weaponPathWidth;
      record.entity.path.material = new Cesium.PolylineGlowMaterialProperty({
        glowPower: lodConfig.weaponGlowPower,
        color: colorForSide(weapon.sideColor, 0.92),
      });
    }
    this.updateWeaponGuideEntity(record, weapon);
    this.updateWeaponImpactLinkEntity(record, weapon);
    this.updateWeaponTrajectoryEntities(record, weapon);
  }

  createImpactEffect(weapon) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const impactPoint = {
      longitude:
        typeof weapon.targetLongitude === "number"
          ? weapon.targetLongitude
          : weapon.longitude,
      latitude:
        typeof weapon.targetLatitude === "number"
          ? weapon.targetLatitude
          : weapon.latitude,
      altitudeMeters: 0,
    };
    const position = cartesianFromSnapshot(impactPoint);
    const impactRadiusMeters = resolveWeaponImpactRadiusMeters(weapon);
    const impactIntensity = clamp(
      0.82 +
        impactRadiusMeters * 0.0012 +
        Math.max(0, Number(weapon.speedKts) || 0) * 0.00075,
      0.9,
      1.8
    );
    const ringEntity = this.dataSource.entities.add({
      position,
      ellipse: {
        semiMajorAxis: 52,
        semiMinorAxis: 52,
        height: 0,
        material: colorForSide(weapon.sideColor, 0.18),
        outline: true,
        outlineColor: colorForSide(weapon.sideColor, 0.92),
      },
    });
    const shockwaveEntity = this.dataSource.entities.add({
      position,
      ellipse: {
        semiMajorAxis: 92,
        semiMinorAxis: 92,
        height: 0,
        material: colorForSide(weapon.sideColor, 0.06),
        outline: true,
        outlineColor: resolveImpactFlashColor(0.78),
        outlineWidth: 2,
      },
    });
    const flashEntity = this.dataSource.entities.add({
      position,
      point: {
        pixelSize: 22,
        color: resolveImpactFlashColor(0.98),
        outlineColor: Cesium.Color.WHITE.withAlpha(0.96),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    const emberEntity = this.dataSource.entities.add({
      position: cartesianFromSnapshot({
        ...impactPoint,
        altitudeMeters: 60,
      }),
      point: {
        pixelSize: 16,
        color: resolveImpactEmberColor(0.88),
        outlineColor: resolveImpactFlashColor(0.82),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    const smokeBaseLength = clamp(
      220 + (Number(weapon.speedKts) || 0) * 0.18,
      220,
      780
    );
    const smokeEntity = this.dataSource.entities.add({
      position: cartesianFromSnapshot({
        ...impactPoint,
        altitudeMeters: smokeBaseLength * 0.5,
      }),
      cylinder: {
        length: smokeBaseLength,
        topRadius: 22,
        bottomRadius: 52,
        material: resolveImpactSmokeColor(0.22),
        outline: false,
      },
    });

    this.effects.push({
      elapsed: 0,
      lifetime: lodConfig.impactLifetimeSeconds,
      smokeLifetime: lodConfig.impactSmokeLifetimeSeconds,
      ringEntity,
      shockwaveEntity,
      flashEntity,
      emberEntity,
      smokeEntity,
      sideColor: weapon.sideColor,
      basePoint: impactPoint,
      smokeBaseLength,
      impactIntensity,
    });
  }

  syncWeapons() {
    const seenIds = new Set();

    this.state.weapons.forEach((weapon) => {
      seenIds.add(weapon.id);
      const existingRecord = this.weaponRecords.get(weapon.id);
      if (!existingRecord) {
        this.weaponRecords.set(weapon.id, this.createWeaponRecord(weapon));
        return;
      }

      this.updateWeaponRecord(existingRecord, weapon);
    });

    for (const [weaponId, record] of this.weaponRecords.entries()) {
      if (seenIds.has(weaponId)) {
        continue;
      }

      this.createImpactEffect(record.lastWeapon);
      if (record.guideEntity) {
        this.dataSource.entities.remove(record.guideEntity.entity);
      }
      if (record.impactLinkEntity) {
        this.dataSource.entities.remove(record.impactLinkEntity);
      }
      this.removeWeaponTrajectoryEntities(record);
      this.dataSource.entities.remove(record.entity);
      this.weaponRecords.delete(weaponId);
    }
  }

  createTargetLinkRecord(unit, targetPoint) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const emphasized =
      unit.selected ||
      isTrackedTarget(this.state.view?.followTargetId, "unit", unit.id);
    const positions = buildArcPolylinePositions(
      unit,
      targetPoint,
      estimateLinkArcLiftMeters(unit, targetPoint)
    );
    if (!positions) {
      return null;
    }

    const entity = this.dataSource.entities.add({
      id: `battle-target-link-${unit.id}`,
      polyline: {
        positions,
        width: emphasized
          ? lodConfig.targetLinkWidth + 0.9
          : lodConfig.targetLinkWidth,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: emphasized
            ? lodConfig.targetLinkGlowPower + 0.06
            : lodConfig.targetLinkGlowPower,
          color: colorForSide(unit.sideColor, emphasized ? 0.76 : 0.42),
        }),
        arcType: Cesium.ArcType.NONE,
        clampToGround: false,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.targetLinkDistance
        ),
      },
    });

    return {
      entity,
      unitId: unit.id,
    };
  }

  updateTargetLinkRecord(record, unit, targetPoint) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const emphasized =
      unit.selected ||
      isTrackedTarget(this.state.view?.followTargetId, "unit", unit.id);
    const positions = buildArcPolylinePositions(
      unit,
      targetPoint,
      estimateLinkArcLiftMeters(unit, targetPoint)
    );
    if (!positions) {
      return;
    }

    record.entity.polyline.positions = positions;
    record.entity.polyline.width = emphasized
      ? lodConfig.targetLinkWidth + 0.9
      : lodConfig.targetLinkWidth;
    record.entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
      glowPower: emphasized
        ? lodConfig.targetLinkGlowPower + 0.06
        : lodConfig.targetLinkGlowPower,
      color: colorForSide(unit.sideColor, emphasized ? 0.76 : 0.42),
    });
    record.entity.polyline.distanceDisplayCondition =
      new Cesium.DistanceDisplayCondition(0, lodConfig.targetLinkDistance);
  }

  syncTargetLinks() {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const followTargetId = this.state.view?.followTargetId;
    const seenIds = new Set();
    const candidates = this.state.units
      .filter(
        (unit) => typeof unit.targetId === "string" && unit.targetId.length > 0
      )
      .map((unit) => ({
        unit,
        targetPoint: resolveTargetPoint(this.state, unit.targetId),
      }))
      .filter((entry) => entry.targetPoint !== null)
      .sort((left, right) => {
        const leftTracked = isTrackedTarget(
          followTargetId,
          "unit",
          left.unit.id
        )
          ? 1
          : 0;
        const rightTracked = isTrackedTarget(
          followTargetId,
          "unit",
          right.unit.id
        )
          ? 1
          : 0;
        if (leftTracked !== rightTracked) {
          return rightTracked - leftTracked;
        }
        const leftSelected = left.unit.selected ? 1 : 0;
        const rightSelected = right.unit.selected ? 1 : 0;
        if (leftSelected !== rightSelected) {
          return rightSelected - leftSelected;
        }
        if (left.unit.entityType !== right.unit.entityType) {
          return left.unit.entityType === "aircraft" ? -1 : 1;
        }
        if (left.unit.weaponCount !== right.unit.weaponCount) {
          return right.unit.weaponCount - left.unit.weaponCount;
        }
        return right.unit.speedKts - left.unit.speedKts;
      })
      .slice(0, lodConfig.targetLinkBudget);

    candidates.forEach(({ unit, targetPoint }) => {
      seenIds.add(unit.id);
      const existingRecord = this.linkRecords.get(unit.id);
      if (!existingRecord) {
        const nextRecord = this.createTargetLinkRecord(unit, targetPoint);
        if (nextRecord) {
          this.linkRecords.set(unit.id, nextRecord);
        }
        return;
      }

      this.updateTargetLinkRecord(existingRecord, unit, targetPoint);
    });

    for (const [unitId, record] of this.linkRecords.entries()) {
      if (seenIds.has(unitId)) {
        continue;
      }

      this.dataSource.entities.remove(record.entity);
      this.linkRecords.delete(unitId);
    }
  }

  createEventRecord(event) {
    const currentTime = this.state.currentTime || event.timestamp || 0;
    const ageSeconds = Math.max(0, currentTime - event.timestamp);
    const lifetimeSeconds = getEventLifetimeSeconds(event);
    const ageRatio = clamp(1 - ageSeconds / lifetimeSeconds, 0.15, 1);
    const sourcePoint = getEventSourcePoint(event);
    const focusPoint = getEventFocusPoint(event);
    const polylinePositions = buildEventPolylinePositions(event);
    const outlineColor = colorForSide(event.sideColor, 0.55 + ageRatio * 0.35);
    const launchLikeEvent = isLaunchEvent(event);
    const showLabel = this.eventLabelIds.has(event.id);
    const pointEntity = focusPoint
      ? this.dataSource.entities.add({
          id: `battle-event-point-${event.id}`,
          position: cartesianFromSnapshot(focusPoint),
          point: {
            pixelSize: launchLikeEvent ? 10 + ageRatio * 5 : 15 + ageRatio * 8,
            color: outlineColor,
            outlineColor: Cesium.Color.WHITE.withAlpha(0.95),
            outlineWidth: 2,
            disableDepthTestDistance: showLabel ? Number.POSITIVE_INFINITY : 0,
          },
          label: showLabel
            ? createLabel(getEventLabel(event), event.sideColor, 80000, {
                emphasized: true,
                pixelOffsetY: -28,
              })
            : undefined,
        })
      : null;
    const lineEntity = polylinePositions
      ? this.dataSource.entities.add({
          id: `battle-event-line-${event.id}`,
          polyline: {
            positions: polylinePositions,
            width: launchLikeEvent ? 3.5 : event.resultTag === "kill" ? 5 : 4,
            material: launchLikeEvent
              ? new Cesium.PolylineDashMaterialProperty({
                  color: outlineColor,
                  dashLength: 18,
                  gapColor: colorForSide(event.sideColor, 0.08),
                })
              : new Cesium.PolylineGlowMaterialProperty({
                  color: outlineColor,
                  glowPower: 0.2,
                }),
            arcType: Cesium.ArcType.NONE,
            clampToGround: false,
          },
        })
      : null;
    const tracerEntity =
      sourcePoint &&
      focusPoint &&
      launchLikeEvent &&
      (!event.weaponId || !this.weaponRecords.has(event.weaponId))
        ? this.createEventTracerEntity(event, sourcePoint, focusPoint)
        : null;

    return {
      event,
      pointEntity,
      lineEntity,
      tracerEntity,
    };
  }

  createEventTracerEntity(event, sourcePoint, focusPoint) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const startTime = Cesium.JulianDate.now();
    const durationSeconds = estimateEventTracerDurationSeconds(
      sourcePoint,
      focusPoint
    );
    const endTime = Cesium.JulianDate.addSeconds(
      startTime,
      durationSeconds,
      new Cesium.JulianDate()
    );
    const positionProperty = new Cesium.SampledPositionProperty();
    positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.NONE;
    positionProperty.backwardExtrapolationType = Cesium.ExtrapolationType.NONE;
    positionProperty.setInterpolationOptions({
      interpolationDegree: 1,
      interpolationAlgorithm: Cesium.LinearApproximation,
    });
    positionProperty.addSample(
      startTime,
      cartesianFromSnapshot(sourcePoint, new Cesium.Cartesian3())
    );
    positionProperty.addSample(
      endTime,
      cartesianFromSnapshot(focusPoint, new Cesium.Cartesian3())
    );

    return this.dataSource.entities.add({
      id: `battle-event-tracer-${event.id}`,
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: startTime,
          stop: endTime,
        }),
      ]),
      position: positionProperty,
      orientation: new Cesium.VelocityOrientationProperty(positionProperty),
      point: {
        pixelSize: Math.max(8, lodConfig.weaponPointSize + 3),
        color: colorForSide(event.sideColor, 0.96),
        outlineColor: Cesium.Color.WHITE.withAlpha(0.98),
        outlineWidth: 2,
        disableDepthTestDistance: 0,
      },
      path: new Cesium.PathGraphics({
        show: true,
        leadTime: 0,
        trailTime: Math.min(2.4, durationSeconds),
        width: Math.max(3, lodConfig.weaponPathWidth - 0.5),
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: Math.max(0.2, lodConfig.weaponGlowPower + 0.08),
          color: colorForSide(event.sideColor, 0.96),
        }),
      }),
    });
  }

  updateEventRecord(record, event) {
    const currentTime = this.state.currentTime || event.timestamp || 0;
    const ageSeconds = Math.max(0, currentTime - event.timestamp);
    const lifetimeSeconds = getEventLifetimeSeconds(event);
    const ageRatio = clamp(1 - ageSeconds / lifetimeSeconds, 0.15, 1);
    const launchLikeEvent = isLaunchEvent(event);
    record.event = event;

    if (record.pointEntity?.point) {
      record.pointEntity.point.color = colorForSide(
        event.sideColor,
        0.55 + ageRatio * 0.35
      );
      record.pointEntity.point.pixelSize = launchLikeEvent
        ? 10 + ageRatio * 5
        : 15 + ageRatio * 8;
      record.pointEntity.point.disableDepthTestDistance = this.eventLabelIds.has(
        event.id
      )
        ? Number.POSITIVE_INFINITY
        : 0;
    }
    if (this.eventLabelIds.has(event.id) && record.pointEntity && !record.pointEntity.label) {
      record.pointEntity.label = createLabel(getEventLabel(event), event.sideColor, 80000, {
        emphasized: true,
        pixelOffsetY: -28,
      });
    } else if (!this.eventLabelIds.has(event.id) && record.pointEntity?.label) {
      record.pointEntity.label = undefined;
    }
    if (record.pointEntity?.label) {
      record.pointEntity.label.text = getEventLabel(event);
      record.pointEntity.label.backgroundColor = colorForSide(event.sideColor, 0.2);
    }
    if (record.lineEntity?.polyline) {
      record.lineEntity.polyline.material = launchLikeEvent
        ? new Cesium.PolylineDashMaterialProperty({
            color: colorForSide(event.sideColor, 0.55 + ageRatio * 0.35),
            dashLength: 18,
            gapColor: colorForSide(event.sideColor, 0.08),
          })
        : new Cesium.PolylineGlowMaterialProperty({
            color: colorForSide(event.sideColor, 0.55 + ageRatio * 0.35),
            glowPower: 0.2,
          });
    }
  }

  removeEventRecord(record) {
    if (record.tracerEntity) {
      this.dataSource.entities.remove(record.tracerEntity);
    }
    if (record.lineEntity) {
      this.dataSource.entities.remove(record.lineEntity);
    }
    if (record.pointEntity) {
      this.dataSource.entities.remove(record.pointEntity);
    }
  }

  syncRecentEvents() {
    const visibleEvents = this.visibleEvents ?? [];
    const seenIds = new Set();

    visibleEvents.forEach((event) => {
      seenIds.add(event.id);
      const existingRecord = this.eventRecords.get(event.id);
      if (!existingRecord) {
        const nextRecord = this.createEventRecord(event);
        if (nextRecord) {
          this.eventRecords.set(event.id, nextRecord);
        }
        return;
      }

      this.updateEventRecord(existingRecord, event);
    });

    for (const [eventId, record] of this.eventRecords.entries()) {
      if (seenIds.has(eventId)) {
        continue;
      }

      this.removeEventRecord(record);
      this.eventRecords.delete(eventId);
    }
  }

  createHotspotRecord(hotspot) {
    const showHighlight = this.hotspotLabelIds.has(hotspot.id);
    const hotspotColor = colorForSide(hotspot.dominantSideColor, 0.9);
    const columnLength = hotspotColumnLengthMeters(hotspot);
    const entity = this.dataSource.entities.add({
      id: `battle-hotspot-${hotspot.id}`,
      position: cartesianFromSnapshot({
        longitude: hotspot.longitude,
        latitude: hotspot.latitude,
        altitudeMeters: 0,
      }),
      ellipse: {
        semiMajorAxis: hotspot.radiusMeters,
        semiMinorAxis: hotspot.radiusMeters,
        height: 0,
        material: colorForSide(hotspot.dominantSideColor, 0.08),
        outline: true,
        outlineColor: colorForSide(hotspot.dominantSideColor, 0.46),
        outlineWidth: showHighlight ? 1.8 : 1.2,
      },
      point: {
        pixelSize: showHighlight ? 9 : 7,
        color: hotspotColor,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
        outlineWidth: 2,
        disableDepthTestDistance: showHighlight ? Number.POSITIVE_INFINITY : 0,
      },
      label: showHighlight
        ? createLabel(
            `${hotspot.label} ${hotspot.score}`,
            hotspot.dominantSideColor,
            110000,
            {
              emphasized: true,
              pixelOffsetY: -24,
            }
          )
        : undefined,
    });
    const pulseEntity = showHighlight
      ? this.dataSource.entities.add({
          id: `battle-hotspot-pulse-${hotspot.id}`,
          position: cartesianFromSnapshot({
            longitude: hotspot.longitude,
            latitude: hotspot.latitude,
            altitudeMeters: 0,
          }),
          ellipse: {
            semiMajorAxis: hotspot.radiusMeters * 1.18,
            semiMinorAxis: hotspot.radiusMeters * 1.18,
            height: 0,
            material: colorForSide(hotspot.dominantSideColor, 0.03),
            outline: true,
            outlineColor: colorForSide(hotspot.dominantSideColor, 0.22),
            outlineWidth: 1.1,
          },
        })
      : null;
    const columnEntity = showHighlight
      ? this.dataSource.entities.add({
          id: `battle-hotspot-column-${hotspot.id}`,
          position: cartesianFromSnapshot({
            longitude: hotspot.longitude,
            latitude: hotspot.latitude,
            altitudeMeters: columnLength * 0.5,
          }),
          cylinder: {
            length: columnLength,
            topRadius: clamp(hotspot.radiusMeters * 0.16, 70, 220),
            bottomRadius: clamp(hotspot.radiusMeters * 0.32, 120, 380),
            material: colorForSide(hotspot.dominantSideColor, 0.07),
            outline: false,
          },
        })
      : null;

    return {
      entity,
      pulseEntity,
      columnEntity,
      hotspot,
    };
  }

  updateHotspotRecord(record, hotspot) {
    record.hotspot = hotspot;
    const columnLength = hotspotColumnLengthMeters(hotspot);
    const showHighlight = this.hotspotLabelIds.has(hotspot.id);
    record.entity.position = cartesianFromSnapshot({
      longitude: hotspot.longitude,
      latitude: hotspot.latitude,
      altitudeMeters: 0,
    });
    if (record.entity.ellipse) {
      record.entity.ellipse.semiMajorAxis = hotspot.radiusMeters;
      record.entity.ellipse.semiMinorAxis = hotspot.radiusMeters;
      record.entity.ellipse.material = colorForSide(
        hotspot.dominantSideColor,
        0.08
      );
      record.entity.ellipse.outlineColor = colorForSide(
        hotspot.dominantSideColor,
        0.46
      );
      record.entity.ellipse.outlineWidth = showHighlight ? 1.8 : 1.2;
    }
    if (record.entity.point) {
      record.entity.point.color = colorForSide(hotspot.dominantSideColor, 0.9);
      record.entity.point.pixelSize = showHighlight ? 9 : 7;
      record.entity.point.disableDepthTestDistance = showHighlight
        ? Number.POSITIVE_INFINITY
        : 0;
    }
    if (showHighlight && !record.entity.label) {
      record.entity.label = createLabel(
        `${hotspot.label} ${hotspot.score}`,
        hotspot.dominantSideColor,
        110000,
        {
          emphasized: true,
          pixelOffsetY: -24,
        }
      );
    } else if (!showHighlight && record.entity.label) {
      record.entity.label = undefined;
    }
    if (record.entity.label) {
      record.entity.label.text = `${hotspot.label} ${hotspot.score}`;
      record.entity.label.backgroundColor = colorForSide(
        hotspot.dominantSideColor,
        0.2
      );
    }
    if (showHighlight && !record.pulseEntity) {
      record.pulseEntity = this.dataSource.entities.add({
        id: `battle-hotspot-pulse-${hotspot.id}`,
        position: cartesianFromSnapshot({
          longitude: hotspot.longitude,
          latitude: hotspot.latitude,
          altitudeMeters: 0,
        }),
        ellipse: {
          semiMajorAxis: hotspot.radiusMeters * 1.18,
          semiMinorAxis: hotspot.radiusMeters * 1.18,
          height: 0,
          material: colorForSide(hotspot.dominantSideColor, 0.03),
          outline: true,
          outlineColor: colorForSide(hotspot.dominantSideColor, 0.22),
          outlineWidth: 1.1,
        },
      });
    } else if (!showHighlight && record.pulseEntity) {
      this.dataSource.entities.remove(record.pulseEntity);
      record.pulseEntity = null;
    }
    if (record.pulseEntity) {
      record.pulseEntity.position = cartesianFromSnapshot({
        longitude: hotspot.longitude,
        latitude: hotspot.latitude,
        altitudeMeters: 0,
      });
      if (record.pulseEntity.ellipse) {
        record.pulseEntity.ellipse.semiMajorAxis = hotspot.radiusMeters * 1.18;
        record.pulseEntity.ellipse.semiMinorAxis = hotspot.radiusMeters * 1.18;
        record.pulseEntity.ellipse.material = colorForSide(
          hotspot.dominantSideColor,
          0.03
        );
        record.pulseEntity.ellipse.outlineColor = colorForSide(
          hotspot.dominantSideColor,
          0.22
        );
      }
    }
    if (showHighlight && !record.columnEntity) {
      record.columnEntity = this.dataSource.entities.add({
        id: `battle-hotspot-column-${hotspot.id}`,
        position: cartesianFromSnapshot({
          longitude: hotspot.longitude,
          latitude: hotspot.latitude,
          altitudeMeters: columnLength * 0.5,
        }),
        cylinder: {
          length: columnLength,
          topRadius: clamp(hotspot.radiusMeters * 0.16, 70, 220),
          bottomRadius: clamp(hotspot.radiusMeters * 0.32, 120, 380),
          material: colorForSide(hotspot.dominantSideColor, 0.07),
          outline: false,
        },
      });
    } else if (!showHighlight && record.columnEntity) {
      this.dataSource.entities.remove(record.columnEntity);
      record.columnEntity = null;
    }
    if (record.columnEntity) {
      record.columnEntity.position = cartesianFromSnapshot({
        longitude: hotspot.longitude,
        latitude: hotspot.latitude,
        altitudeMeters: columnLength * 0.5,
      });
      if (record.columnEntity.cylinder) {
        record.columnEntity.cylinder.length = columnLength;
        record.columnEntity.cylinder.topRadius = clamp(
          hotspot.radiusMeters * 0.16,
          70,
          220
        );
        record.columnEntity.cylinder.bottomRadius = clamp(
          hotspot.radiusMeters * 0.32,
          120,
          380
        );
        record.columnEntity.cylinder.material = colorForSide(
          hotspot.dominantSideColor,
          0.07
        );
      }
    }
  }

  removeHotspotRecord(record) {
    if (record.pulseEntity) {
      this.dataSource.entities.remove(record.pulseEntity);
    }
    if (record.columnEntity) {
      this.dataSource.entities.remove(record.columnEntity);
    }
    this.dataSource.entities.remove(record.entity);
  }

  syncHotspots() {
    const hotspotRows = this.hotspotRows ?? [];
    const seenIds = new Set();

    hotspotRows.forEach((hotspot) => {
      seenIds.add(hotspot.id);
      const existingRecord = this.hotspotRecords.get(hotspot.id);
      if (!existingRecord) {
        this.hotspotRecords.set(hotspot.id, this.createHotspotRecord(hotspot));
        return;
      }

      this.updateHotspotRecord(existingRecord, hotspot);
    });

    for (const [hotspotId, record] of this.hotspotRecords.entries()) {
      if (seenIds.has(hotspotId)) {
        continue;
      }

      this.removeHotspotRecord(record);
      this.hotspotRecords.delete(hotspotId);
    }
  }

  createSidePressureRecord(row) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const showLabel = this.sidePressureLabelIds.has(row.sideId);
    const zoneEntity = this.dataSource.entities.add({
      id: `battle-side-pressure-${row.sideId}`,
      position: cartesianFromSnapshot({
        ...row.center,
        altitudeMeters: 0,
      }),
      ellipse: {
        semiMajorAxis: row.semiMajorAxis,
        semiMinorAxis: row.semiMinorAxis,
        height: 0,
        rotation: Cesium.Math.toRadians(row.headingDeg),
        material: colorForSide(row.sideColor, 0.06),
        outline: true,
        outlineColor: colorForSide(row.sideColor, 0.28),
        outlineWidth: showLabel ? 1.8 : 1.1,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.sidePressureDistance
        ),
      },
      label: showLabel
        ? createLabel(
            `${row.sideName} 압력권 · ${row.pressureScore}`,
            row.sideColor,
            lodConfig.sidePressureDistance,
            {
              emphasized: true,
              pixelOffsetY: -26,
            }
          )
        : undefined,
    });
    const pulseEntity = this.dataSource.entities.add({
      id: `battle-side-pressure-pulse-${row.sideId}`,
      position: cartesianFromSnapshot({
        ...row.center,
        altitudeMeters: 0,
      }),
      ellipse: {
        semiMajorAxis: row.semiMajorAxis * 1.06,
        semiMinorAxis: row.semiMinorAxis * 1.06,
        height: 0,
        rotation: Cesium.Math.toRadians(row.headingDeg),
        material: colorForSide(row.sideColor, 0.02),
        outline: true,
        outlineColor: colorForSide(row.sideColor, 0.16),
        outlineWidth: 1.2,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0,
          lodConfig.sidePressureDistance
        ),
      },
    });
    const arrowPositions = buildLinearPolylinePositions([
      row.center,
      row.frontPoint,
    ]);
    const arrowEntity = arrowPositions
      ? this.dataSource.entities.add({
          id: `battle-side-pressure-arrow-${row.sideId}`,
          polyline: {
            positions: arrowPositions,
            width: lodConfig.sidePressureArrowWidth,
            material: new Cesium.PolylineArrowMaterialProperty(
              colorForSide(row.sideColor, 0.72)
            ),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              lodConfig.sidePressureDistance
            ),
            arcType: Cesium.ArcType.NONE,
            clampToGround: false,
          },
        })
      : null;

    return {
      row,
      zoneEntity,
      pulseEntity,
      arrowEntity,
    };
  }

  updateSidePressureRecord(record, row) {
    const lodConfig = getLodConfig(this.state.view?.lodLevel);
    const showLabel = this.sidePressureLabelIds.has(row.sideId);
    record.row = row;
    record.zoneEntity.position = cartesianFromSnapshot({
      ...row.center,
      altitudeMeters: 0,
    });
    record.pulseEntity.position = cartesianFromSnapshot({
      ...row.center,
      altitudeMeters: 0,
    });
    if (record.zoneEntity.ellipse) {
      record.zoneEntity.ellipse.semiMajorAxis = row.semiMajorAxis;
      record.zoneEntity.ellipse.semiMinorAxis = row.semiMinorAxis;
      record.zoneEntity.ellipse.rotation = Cesium.Math.toRadians(
        row.headingDeg
      );
      record.zoneEntity.ellipse.material = colorForSide(row.sideColor, 0.06);
      record.zoneEntity.ellipse.outlineColor = colorForSide(
        row.sideColor,
        0.28
      );
      record.zoneEntity.ellipse.outlineWidth = showLabel ? 1.8 : 1.1;
      record.zoneEntity.ellipse.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.sidePressureDistance);
    }
    if (showLabel && !record.zoneEntity.label) {
      record.zoneEntity.label = createLabel(
        `${row.sideName} 압력권 · ${row.pressureScore}`,
        row.sideColor,
        lodConfig.sidePressureDistance,
        {
          emphasized: true,
          pixelOffsetY: -26,
        }
      );
    } else if (!showLabel && record.zoneEntity.label) {
      record.zoneEntity.label = undefined;
    }
    if (record.zoneEntity.label) {
      record.zoneEntity.label.text = `${row.sideName} 압력권 · ${row.pressureScore}`;
      record.zoneEntity.label.backgroundColor = colorForSide(
        row.sideColor,
        0.2
      );
      record.zoneEntity.label.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.sidePressureDistance);
    }
    if (record.pulseEntity.ellipse) {
      record.pulseEntity.ellipse.semiMajorAxis = row.semiMajorAxis * 1.06;
      record.pulseEntity.ellipse.semiMinorAxis = row.semiMinorAxis * 1.06;
      record.pulseEntity.ellipse.rotation = Cesium.Math.toRadians(
        row.headingDeg
      );
      record.pulseEntity.ellipse.material = colorForSide(row.sideColor, 0.02);
      record.pulseEntity.ellipse.outlineColor = colorForSide(
        row.sideColor,
        0.16
      );
      record.pulseEntity.ellipse.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, lodConfig.sidePressureDistance);
    }

    const arrowPositions = buildLinearPolylinePositions([
      row.center,
      row.frontPoint,
    ]);
    if (arrowPositions) {
      if (!record.arrowEntity) {
        record.arrowEntity = this.dataSource.entities.add({
          id: `battle-side-pressure-arrow-${row.sideId}`,
          polyline: {
            positions: arrowPositions,
            width: lodConfig.sidePressureArrowWidth,
            material: new Cesium.PolylineArrowMaterialProperty(
              colorForSide(row.sideColor, 0.72)
            ),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              lodConfig.sidePressureDistance
            ),
            arcType: Cesium.ArcType.NONE,
            clampToGround: false,
          },
        });
      } else {
        record.arrowEntity.polyline.positions = arrowPositions;
        record.arrowEntity.polyline.width = lodConfig.sidePressureArrowWidth;
        record.arrowEntity.polyline.material =
          new Cesium.PolylineArrowMaterialProperty(
            colorForSide(row.sideColor, 0.72)
          );
        record.arrowEntity.polyline.distanceDisplayCondition =
          new Cesium.DistanceDisplayCondition(
            0,
            lodConfig.sidePressureDistance
          );
      }
    } else if (record.arrowEntity) {
      this.dataSource.entities.remove(record.arrowEntity);
      record.arrowEntity = null;
    }
  }

  removeSidePressureRecord(record) {
    if (record.arrowEntity) {
      this.dataSource.entities.remove(record.arrowEntity);
    }
    this.dataSource.entities.remove(record.pulseEntity);
    this.dataSource.entities.remove(record.zoneEntity);
  }

  syncSidePressures() {
    const rows = this.sidePressureRows ?? [];
    const seenIds = new Set();

    rows.forEach((row) => {
      seenIds.add(row.sideId);
      const existingRecord = this.sidePressureRecords.get(row.sideId);
      if (!existingRecord) {
        this.sidePressureRecords.set(
          row.sideId,
          this.createSidePressureRecord(row)
        );
        return;
      }

      this.updateSidePressureRecord(existingRecord, row);
    });

    for (const [sideId, record] of this.sidePressureRecords.entries()) {
      if (seenIds.has(sideId)) {
        continue;
      }

      this.removeSidePressureRecord(record);
      this.sidePressureRecords.delete(sideId);
    }
  }

  rebuildEntities() {
    for (const record of this.unitRecords.values()) {
      if (record.guideEntity) {
        this.dataSource.entities.remove(record.guideEntity.entity);
      }
      if (record.courseEntity) {
        this.dataSource.entities.remove(record.courseEntity.polyline);
        this.dataSource.entities.remove(record.courseEntity.endpoint);
      }
      this.dataSource.entities.remove(record.entity);
    }
    for (const record of this.weaponRecords.values()) {
      if (record.guideEntity) {
        this.dataSource.entities.remove(record.guideEntity.entity);
      }
      if (record.impactLinkEntity) {
        this.dataSource.entities.remove(record.impactLinkEntity);
      }
      this.removeWeaponTrajectoryEntities(record);
      this.dataSource.entities.remove(record.entity);
    }
    for (const record of this.linkRecords.values()) {
      this.dataSource.entities.remove(record.entity);
    }
    for (const record of this.sidePressureRecords.values()) {
      this.removeSidePressureRecord(record);
    }
    for (const record of this.eventRecords.values()) {
      this.removeEventRecord(record);
    }
    for (const record of this.hotspotRecords.values()) {
      this.removeHotspotRecord(record);
    }
    for (const effect of this.effects) {
      this.dataSource.entities.remove(effect.ringEntity);
      if (effect.shockwaveEntity) {
        this.dataSource.entities.remove(effect.shockwaveEntity);
      }
      this.dataSource.entities.remove(effect.flashEntity);
      if (effect.emberEntity) {
        this.dataSource.entities.remove(effect.emberEntity);
      }
      this.dataSource.entities.remove(effect.smokeEntity);
    }
    this.unitRecords.clear();
    this.weaponRecords.clear();
    this.linkRecords.clear();
    this.sidePressureRecords.clear();
    this.eventRecords.clear();
    this.hotspotRecords.clear();
    this.effects = [];
    this.clearBattleTracking();
  }

  clearBattleTracking() {
    if (
      this.viewer.trackedEntity &&
      String(this.viewer.trackedEntity.id ?? "").startsWith("battle-")
    ) {
      this.viewer.trackedEntity = undefined;
    }
    this.trackedBattleEntityId = null;
    this.trackedBattleViewKey = null;
  }

  resolveFollowTargetEntity(followTargetId = this.state.view?.followTargetId) {
    const parsedFollowTarget = parseFollowTargetId(followTargetId);
    if (!parsedFollowTarget) {
      return null;
    }

    if (parsedFollowTarget.type === "weapon") {
      return this.weaponRecords.get(parsedFollowTarget.id)?.entity ?? null;
    }

    return this.unitRecords.get(parsedFollowTarget.id)?.entity ?? null;
  }

  resolveFollowTargetDescriptor(
    followTargetId = this.state.view?.followTargetId
  ) {
    const parsedFollowTarget = parseFollowTargetId(followTargetId);
    if (!parsedFollowTarget) {
      return null;
    }

    if (parsedFollowTarget.type === "weapon") {
      const record = this.weaponRecords.get(parsedFollowTarget.id);
      if (!record) {
        return null;
      }

      return {
        entity: record.entity,
        snapshot: record.lastWeapon,
        targetType: "weapon",
      };
    }

    const record = this.unitRecords.get(parsedFollowTarget.id);
    if (!record) {
      return null;
    }

    return {
      entity: record.entity,
      snapshot: record.unit,
      targetType: "unit",
    };
  }

  applyTrackingView(entity, snapshot, targetType, cameraProfile) {
    const trackingView = resolveTrackingCameraView(
      snapshot,
      targetType,
      cameraProfile
    );
    entity.viewFrom = trackingView.viewFrom;

    return trackingView.offset;
  }

  focusFollowTarget(
    followTargetId,
    cameraProfile = this.state.view?.cameraProfile,
    options = {}
  ) {
    const nextTrackedDescriptor = this.resolveFollowTargetDescriptor(
      followTargetId
    );
    if (!nextTrackedDescriptor) {
      return false;
    }

    const nextTrackedEntity = nextTrackedDescriptor.entity;
    const normalizedCameraProfile = normalizeCameraProfile(cameraProfile);
    const trackingOffset = this.applyTrackingView(
      nextTrackedEntity,
      nextTrackedDescriptor.snapshot,
      nextTrackedDescriptor.targetType,
      normalizedCameraProfile
    );
    const nextTrackingKey = `${nextTrackedEntity.id}:${normalizedCameraProfile}`;

    if (!options.force && this.trackedBattleViewKey === nextTrackingKey) {
      return true;
    }

    this.viewer.trackedEntity = nextTrackedEntity;
    this.trackedBattleEntityId = nextTrackedEntity.id;
    this.trackedBattleViewKey = nextTrackingKey;
    void this.viewer
      .flyTo(nextTrackedEntity, {
        duration: Math.max(
          0.55,
          Number(options.durationSeconds) ||
            resolveTrackingFlyDuration(
              nextTrackedDescriptor.snapshot,
              nextTrackedDescriptor.targetType,
              normalizedCameraProfile
            )
        ),
        offset: trackingOffset,
        maximumHeight:
          trackingOffset.range *
          (normalizedCameraProfile === "tactical"
            ? 1.85
            : normalizedCameraProfile === "orbit"
              ? 1.55
              : 1.45),
        easingFunction: resolveTrackingFlyEasing(
          nextTrackedDescriptor.targetType,
          normalizedCameraProfile
        ),
      })
      .catch(() => undefined);
    return true;
  }

  syncCameraTracking() {
    const followTargetId = normalizeFollowTargetId(
      this.state.view?.followTargetId
    );
    if (!followTargetId) {
      this.clearBattleTracking();
      return;
    }

    const nextTrackedDescriptor = this.resolveFollowTargetDescriptor();
    if (!nextTrackedDescriptor) {
      return;
    }
    const cameraProfile = normalizeCameraProfile(
      this.state.view?.cameraProfile
    );
    const nextTrackingKey = `${nextTrackedDescriptor.entity.id}:${cameraProfile}`;

    if (this.trackedBattleViewKey === nextTrackingKey) {
      return;
    }

    this.focusFollowTarget(followTargetId, cameraProfile);
  }

  applyCommand(payload = {}) {
    if (payload.command === "focus-follow-target") {
      const followTargetId = normalizeFollowTargetId(payload.followTargetId);
      if (!followTargetId) {
        return;
      }

      this.focusFollowTarget(
        followTargetId,
        payload.cameraProfile ?? this.state.view?.cameraProfile,
        {
          durationSeconds: payload.durationSeconds,
          force: true,
        }
      );
      return;
    }

    if (payload.command === "jump-to-point") {
      const longitude = Number(payload.longitude);
      const latitude = Number(payload.latitude);
      const altitudeMeters = Math.max(
        1200,
        Number(payload.altitudeMeters) || 2500
      );
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return;
      }

      if (!normalizeFollowTargetId(this.state.view?.followTargetId)) {
        this.clearBattleTracking();
      }

      const cameraProfile = normalizeCameraProfile(
        payload.cameraProfile ?? this.state.view?.cameraProfile
      );
      const frameOffset = resolvePointFrameOffset(
        cameraProfile,
        altitudeMeters
      );
      const framingHint = resolvePointCombatFramingHint(
        this.state,
        {
          longitude,
          latitude,
          altitudeMeters,
        },
        cameraProfile,
        altitudeMeters
      );
      const customHeading = Number(payload.headingDegrees);
      const customPitch = Number(payload.pitchDegrees);
      const customRange = Number(payload.rangeMeters);
      const resolvedRange =
        Number.isFinite(customRange) && customRange > 0
          ? customRange
          : framingHint.rangeMeters;
      const resolvedHeadingRadians = Number.isFinite(customHeading)
        ? Cesium.Math.toRadians(customHeading)
        : Number.isFinite(framingHint.headingDegrees)
          ? Cesium.Math.toRadians(framingHint.headingDegrees)
          : frameOffset.heading;
      const resolvedPitchRadians = Number.isFinite(customPitch)
        ? Cesium.Math.toRadians(customPitch)
        : Cesium.Math.toRadians(framingHint.pitchDegrees);
      const durationSeconds = Math.max(
        0.55,
        Number(payload.durationSeconds) ||
          clamp(1.18 + framingHint.intensityScore * 0.04, 1.18, 1.85)
      );
      this.viewer.camera.flyToBoundingSphere(
        new Cesium.BoundingSphere(
          Cesium.Cartesian3.fromDegrees(longitude, latitude, altitudeMeters),
          1
        ),
        {
          duration: durationSeconds,
          offset: new Cesium.HeadingPitchRange(
            resolvedHeadingRadians,
            resolvedPitchRadians,
            resolvedRange
          ),
          maximumHeight: Math.max(
            altitudeMeters * 2.2,
            resolvedRange *
              (cameraProfile === "tactical"
                ? 1.95
                : cameraProfile === "orbit"
                  ? 1.65
                  : 1.55)
          ),
          easingFunction:
            cameraProfile === "tactical"
              ? Cesium.EasingFunction.CUBIC_IN_OUT
              : Cesium.EasingFunction.QUADRATIC_IN_OUT,
        }
      );
      return;
    }

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        Number(payload.longitude) || 0,
        Number(payload.latitude) || 0,
        Math.max(1200, Number(payload.altitudeMeters) || 2500)
      ),
      duration: Math.max(0.4, Number(payload.durationSeconds) || 1.4),
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }

  updateEffects(dt) {
    for (let index = this.effects.length - 1; index >= 0; index -= 1) {
      const effect = this.effects[index];
      effect.elapsed += dt;
      const progress = clamp(effect.elapsed / effect.lifetime, 0, 1);
      const smokeProgress = clamp(
        effect.elapsed / Math.max(effect.smokeLifetime, effect.lifetime),
        0,
        1
      );
      const radius = 50 + progress * 210 * effect.impactIntensity;
      const shockwaveRadius = 90 + progress * 360 * effect.impactIntensity;
      const alpha = clamp(0.18 * (1 - progress), 0, 0.18);
      const shockwaveAlpha = clamp(0.1 * (1 - progress * 0.88), 0, 0.1);
      const outlineAlpha = clamp(0.92 * (1 - progress * 0.85), 0, 0.92);

      effect.ringEntity.ellipse.semiMajorAxis = radius;
      effect.ringEntity.ellipse.semiMinorAxis = radius;
      effect.ringEntity.ellipse.material = colorForSide(
        effect.sideColor,
        alpha
      );
      effect.ringEntity.ellipse.outlineColor = colorForSide(
        effect.sideColor,
        outlineAlpha
      );

      if (effect.shockwaveEntity?.ellipse) {
        effect.shockwaveEntity.ellipse.semiMajorAxis = shockwaveRadius;
        effect.shockwaveEntity.ellipse.semiMinorAxis = shockwaveRadius;
        effect.shockwaveEntity.ellipse.material = colorForSide(
          effect.sideColor,
          shockwaveAlpha
        );
        effect.shockwaveEntity.ellipse.outlineColor = resolveImpactFlashColor(
          clamp(0.72 * (1 - progress * 0.8), 0, 0.72)
        );
      }

      effect.flashEntity.point.pixelSize = 22 + progress * 54 * effect.impactIntensity;
      effect.flashEntity.point.color = resolveImpactFlashColor(
        clamp(0.98 * (1 - progress * 0.92), 0, 0.98)
      );
      effect.flashEntity.point.outlineColor = Cesium.Color.WHITE.withAlpha(
        clamp(0.95 * (1 - progress * 0.8), 0, 0.95)
      );
      effect.flashEntity.position = cartesianFromSnapshot({
        ...effect.basePoint,
        altitudeMeters: 18 + progress * 42 * effect.impactIntensity,
      });
      if (effect.emberEntity?.point) {
        const emberRise = 48 + smokeProgress * 240 * effect.impactIntensity;
        effect.emberEntity.position = cartesianFromSnapshot({
          ...effect.basePoint,
          altitudeMeters: emberRise,
        });
        effect.emberEntity.point.pixelSize =
          14 + (1 - smokeProgress) * 14 * effect.impactIntensity;
        effect.emberEntity.point.color = resolveImpactEmberColor(
          clamp(0.88 * (1 - smokeProgress * 0.92), 0, 0.88)
        );
        effect.emberEntity.point.outlineColor = resolveImpactFlashColor(
          clamp(0.82 * (1 - smokeProgress * 0.84), 0, 0.82)
        );
      }
      if (effect.smokeEntity?.cylinder) {
        const smokeLength =
          effect.smokeBaseLength +
          smokeProgress * effect.smokeBaseLength * 0.94 * effect.impactIntensity;
        effect.smokeEntity.position = cartesianFromSnapshot({
          ...effect.basePoint,
          altitudeMeters: smokeLength * 0.5,
        });
        effect.smokeEntity.cylinder.length = smokeLength;
        effect.smokeEntity.cylinder.topRadius =
          22 + smokeProgress * 34 * effect.impactIntensity;
        effect.smokeEntity.cylinder.bottomRadius =
          52 + smokeProgress * 84 * effect.impactIntensity;
        effect.smokeEntity.cylinder.material = resolveImpactSmokeColor(
          clamp(0.24 * (1 - smokeProgress), 0, 0.24)
        );
      }

      if (effect.elapsed < Math.max(effect.lifetime, effect.smokeLifetime)) {
        continue;
      }

      this.dataSource.entities.remove(effect.ringEntity);
      if (effect.shockwaveEntity) {
        this.dataSource.entities.remove(effect.shockwaveEntity);
      }
      this.dataSource.entities.remove(effect.flashEntity);
      if (effect.emberEntity) {
        this.dataSource.entities.remove(effect.emberEntity);
      }
      this.dataSource.entities.remove(effect.smokeEntity);
      this.effects.splice(index, 1);
    }
  }

  updateGuideAnimations() {
    for (const record of this.unitRecords.values()) {
      if (!record.guideEntity?.entity?.ellipse) {
        continue;
      }

      const emphasized = Boolean(
        record.guideEntity?.emphasized ||
          isTrackedTarget(
            this.state.view?.followTargetId,
            "unit",
            record.unit.id
          )
      );
      const pulse =
        1 +
        Math.sin(this.animationTime * (emphasized ? 2.6 : 1.2)) *
          (emphasized ? 0.1 : 0.025);
      const radiusMeters =
        unitGuideRadiusMeters(record.unit, emphasized) * pulse;
      record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
      record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
    }

    for (const record of this.weaponRecords.values()) {
      if (!record.guideEntity?.entity?.ellipse) {
        if (!record.trajectoryEntities?.impactZoneEntity?.ellipse) {
          continue;
        }
      }

      const emphasized = Boolean(record.guideEntity?.emphasized);
      const pulse =
        1 +
        Math.sin(this.animationTime * (emphasized ? 3.2 : 1.6)) *
          (emphasized ? 0.12 : 0.04);
      const radiusMeters =
        weaponGuideRadiusMeters(record.lastWeapon, emphasized) * pulse;
      if (record.guideEntity?.entity?.ellipse) {
        record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
        record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
      }
      if (record.trajectoryEntities?.impactZoneEntity?.ellipse) {
        const progress = resolveWeaponTrajectoryProgress(
          this.state,
          record.lastWeapon
        );
        const impactRadiusMeters = resolveWeaponImpactRadiusMeters(
          record.lastWeapon
        );
        const impactPulse =
          1 +
          Math.sin(this.animationTime * (emphasized ? 2.9 : 1.5)) *
            (emphasized ? 0.14 : 0.06);
        const urgencyAlpha = clamp(
          0.06 + (progress ?? 0) * (emphasized ? 0.2 : 0.12),
          0.05,
          0.28
        );
        record.trajectoryEntities.impactZoneEntity.ellipse.semiMajorAxis =
          impactRadiusMeters * impactPulse;
        record.trajectoryEntities.impactZoneEntity.ellipse.semiMinorAxis =
          impactRadiusMeters * impactPulse;
        record.trajectoryEntities.impactZoneEntity.ellipse.material =
          colorForSide(record.lastWeapon.sideColor, urgencyAlpha);
        record.trajectoryEntities.impactZoneEntity.ellipse.outlineColor =
          colorForSide(
            record.lastWeapon.sideColor,
            clamp(0.56 + (progress ?? 0) * 0.34, 0.56, 0.94)
          );
      }
    }
  }

  updateHotspotAnimations() {
    for (const record of this.hotspotRecords.values()) {
      const hotspot = record.hotspot;
      if (record.pulseEntity?.ellipse) {
        const pulse =
          1 + Math.sin(this.animationTime * 1.4 + hotspot.score * 0.15) * 0.08;
        record.pulseEntity.ellipse.semiMajorAxis =
          hotspot.radiusMeters * 1.18 * pulse;
        record.pulseEntity.ellipse.semiMinorAxis =
          hotspot.radiusMeters * 1.18 * pulse;
        record.pulseEntity.ellipse.material = colorForSide(
          hotspot.dominantSideColor,
          0.035 + (pulse - 0.92) * 0.05
        );
        record.pulseEntity.ellipse.outlineColor = colorForSide(
          hotspot.dominantSideColor,
          0.28 + (pulse - 0.92) * 0.3
        );
      }
      if (record.columnEntity?.cylinder) {
        const pulse =
          1 + Math.sin(this.animationTime * 1.1 + hotspot.score * 0.12) * 0.06;
        const length = hotspotColumnLengthMeters(hotspot) * pulse;
        record.columnEntity.position = cartesianFromSnapshot({
          longitude: hotspot.longitude,
          latitude: hotspot.latitude,
          altitudeMeters: length * 0.5,
        });
        record.columnEntity.cylinder.length = length;
        record.columnEntity.cylinder.material = colorForSide(
          hotspot.dominantSideColor,
          0.09 + (pulse - 0.94) * 0.18
        );
      }
    }
  }

  updateSidePressureAnimations() {
    for (const record of this.sidePressureRecords.values()) {
      const pulse =
        1 +
        Math.sin(this.animationTime * 0.9 + record.row.pressureScore * 0.08) *
          0.045;
      if (record.pulseEntity?.ellipse) {
        record.pulseEntity.ellipse.semiMajorAxis =
          record.row.semiMajorAxis * 1.06 * pulse;
        record.pulseEntity.ellipse.semiMinorAxis =
          record.row.semiMinorAxis * 1.06 * pulse;
        record.pulseEntity.ellipse.material = colorForSide(
          record.row.sideColor,
          0.025 + (pulse - 0.955) * 0.16
        );
        record.pulseEntity.ellipse.outlineColor = colorForSide(
          record.row.sideColor,
          0.2 + (pulse - 0.955) * 0.26
        );
      }
      if (record.arrowEntity?.polyline) {
        record.arrowEntity.polyline.material =
          new Cesium.PolylineArrowMaterialProperty(
            colorForSide(record.row.sideColor, 0.64 + (pulse - 0.955) * 0.6)
          );
      }
    }
  }

  clear() {
    this.dataSource.entities.removeAll();
    this.unitRecords.clear();
    this.weaponRecords.clear();
    this.linkRecords.clear();
    this.sidePressureRecords.clear();
    this.eventRecords.clear();
    this.hotspotRecords.clear();
    this.effects = [];
    this.state = defaultBattleState();
    this.clearBattleTracking();
    this.animationTime = 0;
    this.unitLabelIds = new Set();
    this.weaponImpactLabelIds = new Set();
    this.eventLabelIds = new Set();
    this.hotspotLabelIds = new Set();
    this.sidePressureLabelIds = new Set();
    this.visibleEvents = [];
    this.hotspotRows = [];
    this.sidePressureRows = [];
  }

  update(dt) {
    this.animationTime += dt;
    if (this.state.view?.followTargetId) {
      this.syncCameraTracking();
    } else if (this.trackedBattleEntityId) {
      this.clearBattleTracking();
    }

    if (this.effects.length > 0) {
      this.updateEffects(dt);
    }
    if (this.unitRecords.size > 0 || this.weaponRecords.size > 0) {
      this.updateGuideAnimations();
    }
    if (this.hotspotRecords.size > 0) {
      this.updateHotspotAnimations();
    }
    if (this.sidePressureRecords.size > 0) {
      this.updateSidePressureAnimations();
    }
  }
}
