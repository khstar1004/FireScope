const SIDE_COLOR_MAP = {
  blue: "#7fe7ff",
  red: "#ff6b6b",
  silver: "#dce5f2",
  yellow: "#ffd166",
  green: "#80ed99",
  black: "#f1f5f9",
};

const GROUND_CLUSTER_BUCKET_DEGREES = 0.0012;
const GROUND_CLUSTER_BASE_ALTITUDE_METERS = 2.4;
const GROUND_MODEL_BUDGET = 144;
const GOLDEN_ANGLE_RADIANS = Math.PI * (3 - Math.sqrt(5));
const WEAPON_ARC_SAMPLE_COUNT = 32;
const WEAPON_TRANSIENT_EFFECT_LIMIT = 28;
const EVENT_EFFECT_KEY_LIMIT = 96;
const WEAPON_LAUNCH_EFFECT_MS = 1450;
const WEAPON_IMPACT_EFFECT_MS = 5200;
const EVENT_TRACE_SAMPLE_COUNT = 24;
const MIN_WEAPON_DIRECTION_MAGNITUDE_SQUARED = 0.0001;
const FOCUS_FIRE_IMPACT_EVENT_DISTANCE_METERS = 900;
const EFFECT_TEXTURES = {
  headGlow: "/3d-bundles/effects/textures/focus-fire/head_glow.png",
  launchMuzzle: "/3d-bundles/effects/textures/focus-fire/launch_muzzle.png",
  trailTrace: "/3d-bundles/effects/textures/focus-fire/trail_trace.png",
  trailSmoke: "/3d-bundles/effects/textures/focus-fire/trail_smoke.png",
  impactFlash: "/3d-bundles/effects/textures/focus-fire/impact_flash.png",
  impactSmoke: "/3d-bundles/effects/textures/focus-fire/impact_smoke.png",
  impactDust: "/3d-bundles/effects/textures/focus-fire/impact_dust.png",
  explosionFrames: Array.from(
    { length: 9 },
    (_item, index) =>
      `/3d-bundles/effects/libraries/kenney_smoke_particles/PNG/Explosion/explosion0${index}.png`
  ),
  flashFrames: Array.from(
    { length: 9 },
    (_item, index) =>
      `/3d-bundles/effects/libraries/kenney_smoke_particles/PNG/Flash/flash0${index}.png`
  ),
};

const DEFAULT_WEAPON_MODEL_URI =
  "/3d-bundles/artillery/models/artillery_shell.glb";
const MISSILE_WEAPON_MODEL_URI = "/3d-bundles/missile/aim-120c_amraam.glb";
const WEAPON_MODEL_URI_BY_ID = {
  "weapon-air-to-air-missile": MISSILE_WEAPON_MODEL_URI,
  "weapon-surface-missile": MISSILE_WEAPON_MODEL_URI,
  "weapon-artillery-shell": DEFAULT_WEAPON_MODEL_URI,
};
const WEAPON_MODEL_MAP = [
  [
    /\b(aim-|agm-|asm|sam|aam|atgm|jassm|tomahawk|missile|interceptor|patriot|thaad|nasams)\b/i,
    MISSILE_WEAPON_MODEL_URI,
  ],
  [
    /\b(shell|round|rocket|artillery|howitzer|mlrs|ballistic|hyunmoo|k9|m109|d-30|paladin|cannon|gun|20mm|30mm|120mm|155mm)\b/i,
    DEFAULT_WEAPON_MODEL_URI,
  ],
];

const DEFAULT_UNIT_MODEL = {
  aircraft: "/3d-bundles/aircraft/models/f-15.glb",
  ship: "/3d-bundles/ships/type-45_destroyer_class.glb",
  facility: "/3d-bundles/tank/models/t-50_war_thunder.glb",
};

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
  "artillery-nasams-battery": "/3d-bundles/artillery/models/nasams_battery.glb",
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

const MEASURED_UNIT_SCALE_ENTRIES = [
  {
    keys: ["artillery-d30", "/3d-bundles/artillery/models/d-30_howitzer.glb"],
    sourceLongestAxisMeters: 27.466859817504883,
    targetLongestAxisMeters: 5.4,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: [
      "artillery-howitzer",
      "/3d-bundles/artillery/models/howitzer_artillery_tank.glb",
    ],
    sourceLongestAxisMeters: 8.00000037997961,
    targetLongestAxisMeters: 8,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: [
      "artillery-hyunmoo",
      "/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb",
    ],
    sourceLongestAxisMeters: 1,
    targetLongestAxisMeters: 16,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  {
    keys: [
      "artillery-k9",
      "/3d-bundles/artillery/models/k9_thunder_artillery.glb",
    ],
    sourceLongestAxisMeters: 256509.45312500003,
    targetLongestAxisMeters: 12,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  {
    keys: [
      "artillery-k9-variant",
      "/3d-bundles/artillery/models/k9_thunder_artillery (1).glb",
    ],
    sourceLongestAxisMeters: 256509.45312500003,
    targetLongestAxisMeters: 12,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  {
    keys: [
      "artillery-nasams",
      "/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb",
    ],
    sourceLongestAxisMeters: 17.79428291320801,
    targetLongestAxisMeters: 7,
    minimumPixelSize: 3,
    maximumScale: 8,
  },
  {
    keys: [
      "artillery-nasams-battery",
      "/3d-bundles/artillery/models/nasams_battery.glb",
    ],
    sourceLongestAxisMeters: 0.99273681640625,
    targetLongestAxisMeters: 8.5,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  {
    keys: [
      "artillery-paladin",
      "/3d-bundles/artillery/models/m109a6_paladin_self-propelled_howitzer.glb",
    ],
    sourceLongestAxisMeters: 9.378000445431098,
    targetLongestAxisMeters: 9.1,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: [
      "artillery-patriot",
      "/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb",
    ],
    sourceLongestAxisMeters: 22.567099571228027,
    targetLongestAxisMeters: 10.5,
    minimumPixelSize: 3,
    maximumScale: 8,
  },
  {
    keys: [
      "artillery-roketsan",
      "/3d-bundles/artillery/models/roketsan_missiles.glb",
    ],
    sourceLongestAxisMeters: 7.48924720287323,
    targetLongestAxisMeters: 7.5,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: ["artillery-thaad", "/3d-bundles/artillery/models/thaad-2.glb"],
    sourceLongestAxisMeters: 1,
    targetLongestAxisMeters: 12.3,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  {
    keys: ["tank-k2", "/3d-bundles/tank/models/k2_black_panther_tank.glb"],
    sourceLongestAxisMeters: 1.4704020619392395,
    targetLongestAxisMeters: 10.8,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: ["tank-k21", "/3d-bundles/tank/models/k21_armored_warfare.glb"],
    sourceLongestAxisMeters: 7.628900051116943,
    targetLongestAxisMeters: 6.9,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: ["tank-km900", "/3d-bundles/tank/models/south_korean_km900_apc.glb"],
    sourceLongestAxisMeters: 913.0614013671875,
    targetLongestAxisMeters: 6.95,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  {
    keys: ["tank-m113", "/3d-bundles/tank/models/m113a1.glb"],
    sourceLongestAxisMeters: 4.740999831087889,
    targetLongestAxisMeters: 4.86,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: ["tank-m577", "/3d-bundles/tank/models/m577_command_vehicle.glb"],
    sourceLongestAxisMeters: 5.1360997005678755,
    targetLongestAxisMeters: 4.86,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: ["tank-stryker", "/3d-bundles/tank/models/m1126_stryker_50_cal.glb"],
    sourceLongestAxisMeters: 7.598799774077536,
    targetLongestAxisMeters: 6.95,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  {
    keys: [
      "tank-tracked-armor",
      "/3d-bundles/tank/models/t-50_war_thunder.glb",
    ],
    sourceLongestAxisMeters: 5.188339948654175,
    targetLongestAxisMeters: 9.75,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
];

function normalizeBounds(bounds, minimumSpanDegrees = 0.002) {
  const west = Math.min(bounds.west, bounds.east);
  const east = Math.max(bounds.west, bounds.east);
  const south = Math.min(bounds.south, bounds.north);
  const north = Math.max(bounds.south, bounds.north);
  const centerLon = (west + east) * 0.5;
  const centerLat = (south + north) * 0.5;
  const width = Math.max(east - west, minimumSpanDegrees);
  const height = Math.max(north - south, minimumSpanDegrees);

  return {
    west: Math.max(-180, centerLon - width * 0.5),
    south: Math.max(-85, centerLat - height * 0.5),
    east: Math.min(180, centerLon + width * 0.5),
    north: Math.min(85, centerLat + height * 0.5),
  };
}

function expandBounds(bounds, ratio = 0.04, minimumPadding = 0.0005) {
  const widthPadding = Math.max(
    (bounds.east - bounds.west) * ratio,
    minimumPadding
  );
  const heightPadding = Math.max(
    (bounds.north - bounds.south) * ratio,
    minimumPadding
  );

  return normalizeBounds({
    west: bounds.west - widthPadding,
    south: bounds.south - heightPadding,
    east: bounds.east + widthPadding,
    north: bounds.north + heightPadding,
  });
}

function normalizeHeading(headingDeg) {
  return (((Number(headingDeg) || 0) % 360) + 360) % 360;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncateText(value, maxLength = 30) {
  const text = `${value ?? ""}`.trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(1, maxLength - 1))}…`;
}

function formatMeters(valueInMeters) {
  return `${Math.round(valueInMeters).toLocaleString("ko-KR")}m`;
}

function formatImpactLoad(value) {
  const safeValue = Math.max(0, Number(value) || 0);
  return safeValue >= 10 ? safeValue.toFixed(0) : safeValue.toFixed(1);
}

function isGroundRenderUnit(unit) {
  return (
    unit?.groundUnit === true ||
    unit?.entityType === "facility" ||
    unit?.entityType === "army" ||
    unit?.entityType === "airbase"
  );
}

function buildGroundClusterKey(unit) {
  const latitude = Number(unit?.latitude);
  const longitude = Number(unit?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return [
    unit?.sideId ?? "unknown",
    Math.round(latitude / GROUND_CLUSTER_BUCKET_DEGREES),
    Math.round(longitude / GROUND_CLUSTER_BUCKET_DEGREES),
  ].join(":");
}

function sortGroundClusterUnits(left, right) {
  const leftSelected = left?.selected === true ? 1 : 0;
  const rightSelected = right?.selected === true ? 1 : 0;
  if (leftSelected !== rightSelected) {
    return rightSelected - leftSelected;
  }

  const leftWeapons = Math.max(0, Number(left?.weaponCount) || 0);
  const rightWeapons = Math.max(0, Number(right?.weaponCount) || 0);
  if (leftWeapons !== rightWeapons) {
    return rightWeapons - leftWeapons;
  }

  return `${left?.name ?? ""}`.localeCompare(`${right?.name ?? ""}`, "ko-KR");
}

function applyEastNorthOffset(point, eastMeters, northMeters, altitudeMeters) {
  const latitude = Number(point?.latitude) || 0;
  const longitude = Number(point?.longitude) || 0;

  return {
    longitude:
      longitude +
      eastMeters /
        (111320 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01)),
    latitude: latitude + northMeters / 110540,
    altitudeMeters:
      Math.max(0, Number(point?.altitudeMeters) || 0) + altitudeMeters,
  };
}

function buildUnitRenderContext(units = []) {
  let groundModelCandidateCount = 0;
  const groundClusters = new Map();

  units.forEach((unit) => {
    if (isGroundRenderUnit(unit)) {
      groundModelCandidateCount += 1;
    }

    if (!isGroundRenderUnit(unit) || typeof unit?.id !== "string") {
      return;
    }

    const clusterKey = buildGroundClusterKey(unit);
    if (!clusterKey) {
      return;
    }

    const cluster = groundClusters.get(clusterKey) ?? [];
    cluster.push(unit);
    groundClusters.set(clusterKey, cluster);
  });

  const groundOffsetsByUnitId = {};

  groundClusters.forEach((clusterUnits) => {
    clusterUnits.sort(sortGroundClusterUnits).forEach((unit, index) => {
      if (index === 0) {
        groundOffsetsByUnitId[unit.id] = {
          eastMeters: 0,
          northMeters: 0,
          altitudeMeters: GROUND_CLUSTER_BASE_ALTITUDE_METERS,
        };
        return;
      }

      const ring = Math.floor((index - 1) / 6);
      const radiusMeters = 28 + ring * 16;
      const angle = index * GOLDEN_ANGLE_RADIANS;

      groundOffsetsByUnitId[unit.id] = {
        eastMeters: Math.cos(angle) * radiusMeters,
        northMeters: Math.sin(angle) * radiusMeters,
        altitudeMeters: GROUND_CLUSTER_BASE_ALTITUDE_METERS + ring * 0.45,
      };
    });
  });

  return {
    groundModelCandidateCount,
    groundOffsetsByUnitId,
  };
}

function hasGroundModelBudget(
  renderContext,
  facilityModelBudget = GROUND_MODEL_BUDGET
) {
  const groundModelCandidateCount = Math.max(
    0,
    Number(renderContext?.groundModelCandidateCount) || 0
  );

  return groundModelCandidateCount <= Math.max(0, facilityModelBudget || 0);
}

function resolveDisplayedUnitPoint(unit, renderContext) {
  if (!isGroundRenderUnit(unit)) {
    return unit;
  }

  const offset =
    renderContext?.groundOffsetsByUnitId && typeof unit?.id === "string"
      ? renderContext.groundOffsetsByUnitId[unit.id]
      : null;

  if (!offset) {
    return applyEastNorthOffset(
      unit,
      0,
      0,
      GROUND_CLUSTER_BASE_ALTITUDE_METERS
    );
  }

  return applyEastNorthOffset(
    unit,
    Number(offset.eastMeters) || 0,
    Number(offset.northMeters) || 0,
    Number(offset.altitudeMeters) || GROUND_CLUSTER_BASE_ALTITUDE_METERS
  );
}

function buildScaleProfile(spec) {
  return {
    scale: spec.targetLongestAxisMeters / spec.sourceLongestAxisMeters,
    minimumPixelSize: spec.minimumPixelSize,
    maximumScale: spec.maximumScale,
  };
}

function resolveUnitModelScaleProfile(modelId, uri) {
  const matchedSpec = MEASURED_UNIT_SCALE_ENTRIES.find((entry) => {
    return entry.keys.includes(modelId) || entry.keys.includes(uri);
  });

  return matchedSpec ? buildScaleProfile(matchedSpec) : null;
}

function findFirstMatchingModel(signature, candidates, fallbackModel) {
  for (const [pattern, modelPath] of candidates) {
    if (pattern.test(signature)) {
      return modelPath;
    }
  }

  return fallbackModel;
}

function buildPlacementSignature(item) {
  return `${item?.className ?? ""} ${item?.name ?? ""}`.toLowerCase();
}

function buildWeaponSignature(weapon) {
  return `${weapon?.modelId ?? ""} ${weapon?.className ?? ""} ${
    weapon?.name ?? ""
  }`.toLowerCase();
}

function colorForSide(Cesium, sideColor, alpha = 1) {
  const normalized =
    typeof sideColor === "string" && sideColor.trim().length > 0
      ? sideColor.trim().toLowerCase()
      : "silver";
  const cssColor = SIDE_COLOR_MAP[normalized] ?? normalized;
  return Cesium.Color.fromCssColorString(cssColor).withAlpha(alpha);
}

function resolveUnitModelFromProfileId(unit, renderContext) {
  const uri = UNIT_MODEL_URI_BY_ID[unit?.modelId];
  if (!uri || unit?.entityType === "airbase") {
    return null;
  }

  if (isGroundRenderUnit(unit) && !hasGroundModelBudget(renderContext)) {
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

function resolveUnitModel(unit, renderContext) {
  if (unit?.entityType === "airbase") {
    return null;
  }

  const resolvedByProfileId = resolveUnitModelFromProfileId(
    unit,
    renderContext
  );
  if (resolvedByProfileId) {
    return resolvedByProfileId;
  }

  const signature = buildPlacementSignature(unit);

  if (unit?.entityType === "aircraft") {
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

  if (unit?.entityType === "ship") {
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

  if (isGroundRenderUnit(unit) && hasGroundModelBudget(renderContext)) {
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

function resolveUnitModelHeightReference(Cesium, unit) {
  return isGroundRenderUnit(unit)
    ? Cesium.HeightReference.RELATIVE_TO_GROUND
    : Cesium.HeightReference.NONE;
}

function resolveUnitOverlayHeightReference(Cesium, unit) {
  return isGroundRenderUnit(unit)
    ? Cesium.HeightReference.CLAMP_TO_GROUND
    : Cesium.HeightReference.NONE;
}

function isPointInsideBounds(point, bounds) {
  const longitude = Number(point?.longitude);
  const latitude = Number(point?.latitude);

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= bounds.west &&
    longitude <= bounds.east &&
    latitude >= bounds.south &&
    latitude <= bounds.north
  );
}

function buildUnitDescription(unit, displayPoint) {
  return [
    `<strong>${escapeHtml(unit?.name ?? "이름 없음")}</strong>`,
    `${escapeHtml(unit?.sideName ?? "세력 없음")} · ${escapeHtml(
      unit?.className ?? unit?.entityType ?? "unknown"
    )}`,
    `위도 ${escapeHtml(Number(unit?.latitude || 0).toFixed(5))} / 경도 ${escapeHtml(
      Number(unit?.longitude || 0).toFixed(5)
    )}`,
    `표시 고도 ${escapeHtml(formatMeters(Math.max(0, Number(displayPoint?.altitudeMeters) || 0)))}`,
    `방위 ${escapeHtml(String(Math.round(normalizeHeading(unit?.headingDeg))))}°`,
  ].join("<br/>");
}

function resolveHeadingOrientation(Cesium, point, headingDeg) {
  const position = Cesium.Cartesian3.fromDegrees(
    Number(point?.longitude) || 0,
    Number(point?.latitude) || 0,
    Math.max(0, Number(point?.altitudeMeters) || 0)
  );
  const hpr = new Cesium.HeadingPitchRoll(
    Cesium.Math.toRadians(normalizeHeading(headingDeg || 0)),
    0,
    0
  );

  return Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
}

function createPlacementLabel(Cesium, unit, emphasized, labelDistance) {
  return {
    text: truncateText(
      unit?.name ?? unit?.className ?? "이름 없음",
      emphasized ? 34 : 24
    ),
    scale: emphasized ? 0.74 : 0.6,
    showBackground: true,
    backgroundColor: colorForSide(
      Cesium,
      unit?.sideColor,
      emphasized ? 0.24 : 0.12
    ),
    fillColor: Cesium.Color.WHITE.withAlpha(emphasized ? 1 : 0.94),
    outlineColor: Cesium.Color.BLACK.withAlpha(emphasized ? 0.86 : 0.64),
    outlineWidth: emphasized ? 3 : 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    font: emphasized
      ? "700 30px Bahnschrift, sans-serif"
      : "600 24px Bahnschrift, sans-serif",
    heightReference: resolveUnitOverlayHeightReference(Cesium, unit),
    disableDepthTestDistance:
      emphasized || isGroundRenderUnit(unit) ? Number.POSITIVE_INFINITY : 0,
    pixelOffset: new Cesium.Cartesian2(0, emphasized ? -42 : -28),
    scaleByDistance: new Cesium.NearFarScalar(
      2500,
      emphasized ? 1.04 : 0.98,
      labelDistance,
      emphasized ? 0.84 : 0.72
    ),
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
      0,
      labelDistance
    ),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  };
}

function createUnitPointGraphics(Cesium, unit, emphasized) {
  return {
    pixelSize: emphasized ? 18 : isGroundRenderUnit(unit) ? 14 : 12,
    color: colorForSide(Cesium, unit?.sideColor, 0.95),
    outlineColor: Cesium.Color.BLACK.withAlpha(0.72),
    outlineWidth: emphasized ? 3 : 2,
    heightReference: resolveUnitOverlayHeightReference(Cesium, unit),
    disableDepthTestDistance:
      emphasized || isGroundRenderUnit(unit) ? Number.POSITIVE_INFINITY : 0,
  };
}

function isTankLikePlacementModel(unit, model) {
  const modelId = `${unit?.modelId ?? ""}`.toLowerCase();
  const modelUri = `${model?.uri ?? ""}`.toLowerCase();
  const signature = buildPlacementSignature(unit);

  return (
    modelId.startsWith("tank-") ||
    modelUri.includes("/3d-bundles/tank/models/") ||
    /\b(tank|armor|tracked|stryker|apc|m113|m577|km900|k2|k21)\b/i.test(
      signature
    )
  );
}

function createUnitModelGraphics(Cesium, unit, model, emphasized) {
  const focusedGroundUnit = emphasized && isGroundRenderUnit(unit);
  const focusedAircraft = emphasized && unit?.entityType === "aircraft";
  const focusedShip = emphasized && unit?.entityType === "ship";
  const aircraftScaleBoost = unit?.entityType === "aircraft" ? 2 : 1;
  const tankScaleBoost = isTankLikePlacementModel(unit, model) ? 2 : 1;
  const scaleBoost = Math.max(aircraftScaleBoost, tankScaleBoost);
  const enlargedModel = scaleBoost > 1;

  return {
    uri: encodeURI(model.uri),
    scale: model.scale * scaleBoost,
    minimumPixelSize: focusedGroundUnit
      ? Math.max(model.minimumPixelSize * scaleBoost, 72)
      : focusedAircraft
        ? Math.max(model.minimumPixelSize * scaleBoost, 96)
        : focusedShip
          ? Math.max(model.minimumPixelSize, 84)
          : enlargedModel
            ? Math.max(model.minimumPixelSize * scaleBoost, 22)
            : model.minimumPixelSize,
    maximumScale: focusedGroundUnit
      ? Math.max(model.maximumScale * scaleBoost, 140)
      : focusedAircraft
        ? Math.max(model.maximumScale * scaleBoost, 128)
        : focusedShip
          ? Math.max(model.maximumScale, 128)
          : enlargedModel
            ? Math.max(model.maximumScale * scaleBoost, 54)
            : model.maximumScale,
    heightReference: resolveUnitModelHeightReference(Cesium, unit),
    color: colorForSide(Cesium, unit?.sideColor, emphasized ? 0.94 : 0.86),
    colorBlendAmount: emphasized ? 0.08 : 0.18,
    silhouetteColor: emphasized
      ? Cesium.Color.WHITE.withAlpha(0.96)
      : colorForSide(Cesium, unit?.sideColor, 0.52),
    silhouetteSize: emphasized ? 3.4 : enlargedModel ? 1.4 : 0.9,
  };
}

function notifyParentReady() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "terrain3d:ready",
      },
      window.location.origin
    );
  }
}

const PLACEMENT_PANEL_TYPE_ORDER = {
  aircraft: 0,
  ship: 1,
  facility: 2,
  army: 3,
  airbase: 4,
};

export function sortPlacementUnitsForPanel(left, right) {
  const leftFocused = left?.focused === true ? 1 : 0;
  const rightFocused = right?.focused === true ? 1 : 0;
  if (leftFocused !== rightFocused) {
    return rightFocused - leftFocused;
  }

  const leftSelected = left?.selected === true ? 1 : 0;
  const rightSelected = right?.selected === true ? 1 : 0;
  if (leftSelected !== rightSelected) {
    return rightSelected - leftSelected;
  }

  const leftTypeOrder =
    PLACEMENT_PANEL_TYPE_ORDER[left?.entityType] ??
    PLACEMENT_PANEL_TYPE_ORDER.facility;
  const rightTypeOrder =
    PLACEMENT_PANEL_TYPE_ORDER[right?.entityType] ??
    PLACEMENT_PANEL_TYPE_ORDER.facility;
  if (leftTypeOrder !== rightTypeOrder) {
    return leftTypeOrder - rightTypeOrder;
  }

  const leftSide = `${left?.sideName ?? left?.sideId ?? ""}`;
  const rightSide = `${right?.sideName ?? right?.sideId ?? ""}`;
  const sideComparison = leftSide.localeCompare(rightSide, "ko-KR");
  if (sideComparison !== 0) {
    return sideComparison;
  }

  return `${left?.name ?? ""}`.localeCompare(`${right?.name ?? ""}`, "ko-KR");
}

export function resolveFocusCameraPreset(unit, model, displayPoint) {
  const signature = buildPlacementSignature(unit);
  const headingDeg = normalizeHeading(unit?.headingDeg || 0);
  const altitudeMeters = Math.max(
    0,
    Number(displayPoint?.altitudeMeters ?? unit?.altitudeMeters) || 0
  );
  const isLauncherLike =
    /\b(patriot|nasams|thaad|hyunmoo|launcher|rocket|howitzer|artillery|paladin)\b/i.test(
      signature
    );

  if (unit?.entityType === "aircraft") {
    return {
      headingDeg: normalizeHeading(headingDeg + 132),
      pitchDeg: altitudeMeters > 1400 ? -14 : -18,
      rangeMeters: Math.max(280, Math.min(720, 260 + altitudeMeters * 0.1)),
      sphereRadiusMeters: Math.max(80, Math.min(180, altitudeMeters * 0.04)),
      targetHeightOffsetMeters: altitudeMeters > 1400 ? 18 : 10,
    };
  }

  if (unit?.entityType === "ship") {
    const largeDeck = /\b(carrier|dokdo|amphibious|lhd)\b/i.test(signature);
    return {
      headingDeg: normalizeHeading(headingDeg + 122),
      pitchDeg: -22,
      rangeMeters: largeDeck ? 520 : 380,
      sphereRadiusMeters: largeDeck ? 120 : 84,
      targetHeightOffsetMeters: largeDeck ? 22 : 16,
    };
  }

  if (isGroundRenderUnit(unit)) {
    return {
      headingDeg: normalizeHeading(headingDeg + (isLauncherLike ? 138 : 146)),
      pitchDeg: isLauncherLike ? -44 : -56,
      rangeMeters: isLauncherLike ? 185 : 128,
      sphereRadiusMeters: isLauncherLike ? 54 : 34,
      targetHeightOffsetMeters: isLauncherLike ? 10 : 6,
    };
  }

  return {
    headingDeg: normalizeHeading(headingDeg + 136),
    pitchDeg: -24,
    rangeMeters: model ? 180 : 120,
    sphereRadiusMeters: model ? 42 : 28,
    targetHeightOffsetMeters: model ? 10 : 6,
  };
}

function formatRuntimeTimestamp(unixSeconds) {
  if (!Number.isFinite(unixSeconds)) {
    return "시간 정보 없음";
  }

  try {
    return new Date(unixSeconds * 1000).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (_error) {
    return `${Math.round(unixSeconds)}s`;
  }
}

function formatCompactCount(value) {
  return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("ko-KR");
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(Number(value) || 0, minimum), maximum);
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function smoothStep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

export function resolveEffectTimelineValue(progress, stops, fallback = 0) {
  const orderedStops = Array.isArray(stops)
    ? stops
        .map((stop) => ({
          at: clamp01(stop?.at),
          value: Number(stop?.value),
        }))
        .filter((stop) => Number.isFinite(stop.value))
        .sort((left, right) => left.at - right.at)
    : [];

  if (orderedStops.length === 0) {
    return fallback;
  }

  const safeProgress = clamp01(progress);
  if (safeProgress <= orderedStops[0].at) {
    return orderedStops[0].value;
  }

  for (let index = 1; index < orderedStops.length; index += 1) {
    const previous = orderedStops[index - 1];
    const next = orderedStops[index];
    if (safeProgress <= next.at) {
      const span = Math.max(0.0001, next.at - previous.at);
      const localProgress = smoothStep((safeProgress - previous.at) / span);
      return previous.value + (next.value - previous.value) * localProgress;
    }
  }

  return orderedStops[orderedStops.length - 1].value;
}

export function ensureCesiumColorMaterialProperty(Cesium, colorProperty) {
  if (colorProperty && typeof colorProperty.getType === "function") {
    return colorProperty;
  }

  return new Cesium.ColorMaterialProperty(colorProperty);
}

function buildCartesianFromPoint(Cesium, point) {
  return Cesium.Cartesian3.fromDegrees(
    Number(point?.longitude) || 0,
    Number(point?.latitude) || 0,
    Math.max(0, Number(point?.altitudeMeters) || 0)
  );
}

function isFiniteGeoPoint(longitude, latitude) {
  return (
    Number.isFinite(Number(longitude)) && Number.isFinite(Number(latitude))
  );
}

function normalizeGeoPoint(longitude, latitude, altitudeMeters = 0) {
  if (!isFiniteGeoPoint(longitude, latitude)) {
    return null;
  }

  return {
    longitude: Number(longitude),
    latitude: Number(latitude),
    altitudeMeters: Math.max(0, Number(altitudeMeters) || 0),
  };
}

function normalizeRoutePoint(routePoint, fallbackAltitudeMeters = 0) {
  if (!Array.isArray(routePoint) || routePoint.length < 2) {
    return null;
  }

  return normalizeGeoPoint(
    routePoint[1],
    routePoint[0],
    Number.isFinite(Number(routePoint[2]))
      ? Number(routePoint[2])
      : fallbackAltitudeMeters
  );
}

function resolveWeaponLaunchPoint(weapon) {
  return (
    normalizeGeoPoint(
      weapon?.launchLongitude,
      weapon?.launchLatitude,
      weapon?.launchAltitudeMeters
    ) ??
    normalizeGeoPoint(
      weapon?.longitude,
      weapon?.latitude,
      weapon?.altitudeMeters
    )
  );
}

function resolveWeaponCurrentPoint(weapon) {
  return normalizeGeoPoint(
    weapon?.longitude,
    weapon?.latitude,
    weapon?.altitudeMeters
  );
}

function offsetPointByHeading(point, headingDeg, distanceMeters) {
  const headingRadians = (Number(headingDeg) || 0) * (Math.PI / 180);
  const latitudeRadians = point.latitude * (Math.PI / 180);
  const deltaNorthMeters = Math.cos(headingRadians) * distanceMeters;
  const deltaEastMeters = Math.sin(headingRadians) * distanceMeters;
  const metersPerLongitude = Math.max(1, 111320 * Math.cos(latitudeRadians));

  return {
    longitude: point.longitude + deltaEastMeters / metersPerLongitude,
    latitude: point.latitude + deltaNorthMeters / 111320,
    altitudeMeters: point.altitudeMeters,
  };
}

function resolveWeaponImpactPoint(weapon) {
  const currentPoint = resolveWeaponCurrentPoint(weapon);
  const targetPoint = normalizeGeoPoint(
    weapon?.targetLongitude,
    weapon?.targetLatitude,
    weapon?.targetAltitudeMeters
  );
  if (targetPoint) {
    return targetPoint;
  }

  const routePoint = normalizeRoutePoint(
    Array.isArray(weapon?.route) ? weapon.route.at(-1) : null,
    currentPoint?.altitudeMeters ?? 0
  );
  if (routePoint) {
    return routePoint;
  }

  if (!currentPoint) {
    return null;
  }

  const fallbackDistanceMeters = clamp(
    (Number(weapon?.speedKts) || Number(weapon?.speed) || 420) * 1.25,
    700,
    4200
  );
  return offsetPointByHeading(
    currentPoint,
    weapon?.headingDeg ?? weapon?.heading,
    fallbackDistanceMeters
  );
}

function approximateDistanceMeters(leftPoint, rightPoint) {
  if (!leftPoint || !rightPoint) {
    return 0;
  }

  const centerLatitude =
    ((leftPoint.latitude + rightPoint.latitude) / 2) * (Math.PI / 180);
  const metersPerLongitude = Math.max(1, 111320 * Math.cos(centerLatitude));
  const deltaX =
    (rightPoint.longitude - leftPoint.longitude) * metersPerLongitude;
  const deltaY = (rightPoint.latitude - leftPoint.latitude) * 111320;
  const deltaZ =
    (rightPoint.altitudeMeters ?? 0) - (leftPoint.altitudeMeters ?? 0);
  return Math.hypot(deltaX, deltaY, deltaZ);
}

function buildWeaponDescription(weapon) {
  return [
    `<strong>${escapeHtml(weapon?.name ?? "무장")}</strong>`,
    `${escapeHtml(weapon?.launcherName ?? "발사 플랫폼")} · ${escapeHtml(
      weapon?.className ?? "weapon"
    )}`,
    `현재 좌표 ${escapeHtml(Number(weapon?.latitude || 0).toFixed(5))}, ${escapeHtml(
      Number(weapon?.longitude || 0).toFixed(5)
    )}`,
    `고도 ${escapeHtml(formatMeters(Math.max(0, Number(weapon?.altitudeMeters) || 0)))}`,
    `속도 ${escapeHtml(`${Math.round(Math.max(0, Number(weapon?.speedKts) || 0))}kts`)}`,
  ].join("<br/>");
}

function resolveWeaponEffectProfile(weapon) {
  const signature = buildWeaponSignature(weapon);
  const artilleryLike =
    /\b(shell|artillery|howitzer|rocket|mlrs|ballistic|hyunmoo|k9|m109|d-30|paladin)\b/i.test(
      signature
    ) || /(포탄|포격|자주포|곡사|로켓|탄도)/i.test(signature);
  const interceptorLike =
    /\b(interceptor|patriot|thaad|nasams|surface-to-air|sam)\b/i.test(
      signature
    );
  const bombLike = /\b(bomb|gbu|jdam)\b/i.test(signature);
  const bulletLike =
    /\b(bullet|round|cannon|gun|vulcan|m61|20mm|30mm)\b/i.test(signature) ||
    /(총알|기관포|탄환)/i.test(signature);
  const missileLike =
    bombLike ||
    interceptorLike ||
    /\b(missile|aim-|agm-|amraam|sidewinder|harpoon|tomahawk)\b/i.test(
      signature
    );

  return {
    artilleryLike,
    interceptorLike,
    bombLike,
    bulletLike,
    missileLike,
    label: artilleryLike ? "포탄" : bulletLike ? "탄환" : "탄체",
    trailWidth: artilleryLike
      ? 8.8
      : bulletLike
        ? 5.8
        : interceptorLike
          ? 7.2
          : 7.8,
    projectedWidth: artilleryLike ? 3.6 : bulletLike ? 2.6 : 3.2,
    glowScale: artilleryLike
      ? 1.46
      : bombLike
        ? 1.34
        : bulletLike
          ? 1.16
          : 1.24,
  };
}

export function resolveWeaponModelProfile(weapon) {
  const effectProfile = resolveWeaponEffectProfile(weapon);
  const explicitUri = WEAPON_MODEL_URI_BY_ID[weapon?.modelId];
  const fallbackUri = effectProfile.missileLike
    ? MISSILE_WEAPON_MODEL_URI
    : DEFAULT_WEAPON_MODEL_URI;
  const uri =
    explicitUri ??
    findFirstMatchingModel(
      buildWeaponSignature(weapon),
      WEAPON_MODEL_MAP,
      fallbackUri
    );

  if (effectProfile.bulletLike) {
    return {
      uri,
      scale: 0.34,
      minimumPixelSize: 24,
      maximumScale: 56,
      colorAlpha: 0.82,
      colorBlendAmount: 0.3,
      silhouetteAlpha: 0.58,
      silhouetteSize: 1.1,
    };
  }

  if (effectProfile.artilleryLike) {
    return {
      uri,
      scale: 0.92,
      minimumPixelSize: 36,
      maximumScale: 116,
      colorAlpha: 0.86,
      colorBlendAmount: 0.24,
      silhouetteAlpha: 0.68,
      silhouetteSize: 1.45,
    };
  }

  return {
    uri,
    scale: effectProfile.bombLike ? 0.82 : 1.42,
    minimumPixelSize: effectProfile.bombLike ? 34 : 44,
    maximumScale: effectProfile.bombLike ? 116 : 154,
    colorAlpha: 0.9,
    colorBlendAmount: 0.2,
    silhouetteAlpha: 0.7,
    silhouetteSize: effectProfile.interceptorLike ? 1.8 : 1.55,
  };
}

function createWeaponPointGraphics(Cesium, weapon) {
  const highAltitudeWeapon =
    Math.max(0, Number(weapon?.altitudeMeters) || 0) > 400;
  const effectProfile = resolveWeaponEffectProfile(weapon);

  return {
    pixelSize: effectProfile.bulletLike ? 6 : highAltitudeWeapon ? 8 : 7,
    color: Cesium.Color.WHITE.withAlpha(0.92),
    outlineColor: Cesium.Color.WHITE.withAlpha(0.96),
    outlineWidth: effectProfile.bulletLike ? 1 : 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

function createWeaponModelGraphics(Cesium, weapon) {
  const modelProfile = resolveWeaponModelProfile(weapon);

  return {
    uri: encodeURI(modelProfile.uri),
    scale: modelProfile.scale,
    minimumPixelSize: modelProfile.minimumPixelSize,
    maximumScale: modelProfile.maximumScale,
    color: colorForSide(Cesium, weapon?.sideColor, modelProfile.colorAlpha),
    colorBlendMode: Cesium.ColorBlendMode.MIX,
    colorBlendAmount: modelProfile.colorBlendAmount,
    silhouetteColor: Cesium.Color.WHITE.withAlpha(modelProfile.silhouetteAlpha),
    silhouetteSize: modelProfile.silhouetteSize,
  };
}

function createWeaponBillboardGraphics(Cesium, weapon) {
  const effectProfile = resolveWeaponEffectProfile(weapon);
  const altitudeMeters = Math.max(0, Number(weapon?.altitudeMeters) || 0);
  const scale =
    altitudeMeters > 1200
      ? 1.45
      : altitudeMeters > 280
        ? 1.15
        : 0.96 * effectProfile.glowScale;

  return {
    image: EFFECT_TEXTURES.headGlow,
    color: colorForSide(Cesium, weapon?.sideColor, 0.94),
    scale,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    width: effectProfile.artilleryLike
      ? 58
      : effectProfile.bulletLike
        ? 42
        : 50,
    height: effectProfile.artilleryLike
      ? 58
      : effectProfile.bulletLike
        ? 42
        : 50,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

function createWeaponLabelGraphics(_Cesium, _weapon) {
  return undefined;
}

function resolveWeaponOrientationTargetPoint(weapon, currentPoint) {
  const impactPoint = resolveWeaponImpactPoint(weapon);
  if (impactPoint && approximateDistanceMeters(currentPoint, impactPoint) > 8) {
    return impactPoint;
  }

  return offsetPointByHeading(
    currentPoint,
    weapon?.headingDeg ?? weapon?.heading,
    180
  );
}

function resolveWeaponOrientation(Cesium, weapon, currentPoint) {
  const originPoint = currentPoint ?? resolveWeaponCurrentPoint(weapon);
  if (!originPoint) {
    return undefined;
  }

  const targetPoint = resolveWeaponOrientationTargetPoint(weapon, originPoint);
  const position = buildCartesianFromPoint(Cesium, originPoint);
  const target = buildCartesianFromPoint(Cesium, targetPoint);
  const direction = Cesium.Cartesian3.subtract(
    target,
    position,
    new Cesium.Cartesian3()
  );

  if (
    Cesium.Cartesian3.magnitudeSquared(direction) <
    MIN_WEAPON_DIRECTION_MAGNITUDE_SQUARED
  ) {
    return resolveHeadingOrientation(
      Cesium,
      originPoint,
      weapon?.headingDeg ?? weapon?.heading
    );
  }

  Cesium.Cartesian3.normalize(direction, direction);

  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  const inverseTransform = Cesium.Matrix4.inverseTransformation(
    transform,
    new Cesium.Matrix4()
  );
  const localDirection = Cesium.Matrix4.multiplyByPointAsVector(
    inverseTransform,
    direction,
    new Cesium.Cartesian3()
  );
  const horizontalMagnitude = Math.hypot(localDirection.x, localDirection.y);
  const hpr = new Cesium.HeadingPitchRoll(
    Math.atan2(localDirection.x, localDirection.y),
    Math.atan2(localDirection.z, Math.max(horizontalMagnitude, 0.0001)),
    0
  );

  return Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
}

function resolveWeaponArcApexMeters(weapon, startPoint, endPoint) {
  const effectProfile = resolveWeaponEffectProfile(weapon);
  const distanceMeters = approximateDistanceMeters(startPoint, endPoint);
  const altitudeDeltaMeters = Math.abs(
    (endPoint?.altitudeMeters ?? 0) - (startPoint?.altitudeMeters ?? 0)
  );

  if (effectProfile.artilleryLike) {
    return clamp(distanceMeters * 0.28 + altitudeDeltaMeters * 0.22, 180, 4200);
  }

  if (effectProfile.bulletLike) {
    return clamp(distanceMeters * 0.018, 18, 180);
  }

  if (effectProfile.missileLike) {
    return clamp(distanceMeters * 0.085 + altitudeDeltaMeters * 0.08, 90, 2200);
  }

  return clamp(distanceMeters * 0.055, 55, 1200);
}

function sampleWeaponArc(startPoint, endPoint, ratio, apexHeightMeters) {
  const t = clamp01(ratio);
  return {
    longitude:
      startPoint.longitude + (endPoint.longitude - startPoint.longitude) * t,
    latitude:
      startPoint.latitude + (endPoint.latitude - startPoint.latitude) * t,
    altitudeMeters:
      startPoint.altitudeMeters +
      (endPoint.altitudeMeters - startPoint.altitudeMeters) * t +
      apexHeightMeters * 4 * t * (1 - t),
  };
}

function buildWeaponArcPointSamples(
  weapon,
  endPoint,
  sampleCount = WEAPON_ARC_SAMPLE_COUNT
) {
  const startPoint = resolveWeaponLaunchPoint(weapon);
  if (!startPoint || !endPoint) {
    return [];
  }

  const apexHeightMeters = resolveWeaponArcApexMeters(
    weapon,
    startPoint,
    endPoint
  );
  const safeSampleCount = Math.max(3, Math.round(Number(sampleCount) || 3));

  return Array.from({ length: safeSampleCount }, (_item, index) =>
    sampleWeaponArc(
      startPoint,
      endPoint,
      index / (safeSampleCount - 1),
      apexHeightMeters
    )
  );
}

function buildCartesianArrayFromPoints(Cesium, points) {
  const positions = [];
  points.forEach((point) => {
    positions.push(
      point.longitude,
      point.latitude,
      Math.max(0, Number(point.altitudeMeters) || 0)
    );
  });

  return positions.length >= 6
    ? Cesium.Cartesian3.fromDegreesArrayHeights(positions)
    : [];
}

function buildWeaponTrajectoryPositions(Cesium, weapon) {
  return buildCartesianArrayFromPoints(
    Cesium,
    buildWeaponArcPointSamples(weapon, resolveWeaponImpactPoint(weapon))
  );
}

function buildWeaponTrailPositions(Cesium, weapon) {
  const currentPoint = resolveWeaponCurrentPoint(weapon);
  const impactPoint = resolveWeaponImpactPoint(weapon);
  const launchPoint = resolveWeaponLaunchPoint(weapon);

  if (!launchPoint || !currentPoint) {
    return [];
  }

  const fullDistance = approximateDistanceMeters(launchPoint, impactPoint);
  const currentDistance = approximateDistanceMeters(launchPoint, currentPoint);
  const progress =
    fullDistance > 1 ? clamp01(currentDistance / fullDistance) : 1;
  const sampleCount = Math.max(
    4,
    Math.round(WEAPON_ARC_SAMPLE_COUNT * progress)
  );

  if (progress < 0.98 && impactPoint) {
    const apexHeightMeters = resolveWeaponArcApexMeters(
      weapon,
      launchPoint,
      impactPoint
    );
    return buildCartesianArrayFromPoints(
      Cesium,
      Array.from({ length: sampleCount }, (_item, index) =>
        sampleWeaponArc(
          launchPoint,
          impactPoint,
          progress * (index / (sampleCount - 1)),
          apexHeightMeters
        )
      )
    );
  }

  return buildCartesianArrayFromPoints(
    Cesium,
    buildWeaponArcPointSamples(weapon, currentPoint, sampleCount)
  );
}

function createWeaponProjectedTrajectoryGraphics(Cesium, weapon, positions) {
  const effectProfile = resolveWeaponEffectProfile(weapon);
  return {
    positions,
    width: effectProfile.projectedWidth,
    material: new Cesium.PolylineDashMaterialProperty({
      color: colorForSide(Cesium, weapon?.sideColor, 0.68),
      gapColor: colorForSide(Cesium, weapon?.sideColor, 0.08),
      dashLength: effectProfile.artilleryLike ? 18 : 14,
    }),
    clampToGround: false,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

function createWeaponTravelTrailGraphics(Cesium, weapon, positions) {
  const effectProfile = resolveWeaponEffectProfile(weapon);
  return {
    positions,
    width: effectProfile.trailWidth,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: effectProfile.artilleryLike ? 0.42 : 0.34,
      taperPower: 0.7,
      color: colorForSide(
        Cesium,
        weapon?.sideColor,
        effectProfile.artilleryLike ? 0.98 : 0.92
      ),
    }),
    clampToGround: false,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

function createWeaponImpactZoneGraphics(Cesium, weapon) {
  const effectProfile = resolveWeaponEffectProfile(weapon);
  const radiusMeters = effectProfile.artilleryLike
    ? 150
    : effectProfile.bulletLike
      ? 42
      : 95;

  return {
    semiMajorAxis: radiusMeters,
    semiMinorAxis: radiusMeters,
    material: colorForSide(Cesium, weapon?.sideColor, 0.08),
    outline: true,
    outlineColor: colorForSide(Cesium, weapon?.sideColor, 0.82),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    classificationType: Cesium.ClassificationType.TERRAIN,
  };
}

function formatCompactDistanceMeters(distanceMeters) {
  const safeDistanceMeters = Math.max(0, Number(distanceMeters) || 0);
  if (safeDistanceMeters >= 1000) {
    const precision = safeDistanceMeters >= 10000 ? 0 : 1;
    return `${(safeDistanceMeters / 1000).toFixed(precision)}km`;
  }

  return `${Math.round(safeDistanceMeters)}m`;
}

function resolveWeaponEtaSeconds(weapon) {
  const currentPoint = resolveWeaponCurrentPoint(weapon);
  const impactPoint = resolveWeaponImpactPoint(weapon);
  const distanceMeters = approximateDistanceMeters(currentPoint, impactPoint);
  const speedMetersPerSecond = Math.max(
    0,
    (Number(weapon?.speedKts) || 0) * 0.514444
  );

  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) {
    return null;
  }

  if (!Number.isFinite(speedMetersPerSecond) || speedMetersPerSecond <= 1) {
    return null;
  }

  return Math.max(1, Math.ceil(distanceMeters / speedMetersPerSecond));
}

function createWeaponImpactCueGraphics(Cesium, weapon) {
  const currentPoint = resolveWeaponCurrentPoint(weapon);
  const impactPoint = resolveWeaponImpactPoint(weapon);
  const distanceMeters = approximateDistanceMeters(currentPoint, impactPoint);
  const etaSeconds = resolveWeaponEtaSeconds(weapon);
  const distanceLabel = formatCompactDistanceMeters(distanceMeters);
  const etaLabel = etaSeconds ? `${etaSeconds}s` : "계산중";

  return {
    text: `예상탄착 ${etaLabel}\n${distanceLabel}`,
    font: "800 13px 'Segoe UI', 'Noto Sans KR', sans-serif",
    fillColor: Cesium.Color.WHITE.withAlpha(0.96),
    outlineColor: Cesium.Color.BLACK.withAlpha(0.86),
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    showBackground: true,
    backgroundColor: colorForSide(Cesium, weapon?.sideColor, 0.5),
    pixelOffset: new Cesium.Cartesian2(0, 30),
    verticalOrigin: Cesium.VerticalOrigin.TOP,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 240000),
  };
}

function isWeaponInsideBounds(weapon, bounds) {
  return (
    isPointInsideBounds(weapon, bounds) ||
    (isFiniteGeoPoint(weapon?.launchLongitude, weapon?.launchLatitude) &&
      Number(weapon.launchLongitude) >= bounds.west &&
      Number(weapon.launchLongitude) <= bounds.east &&
      Number(weapon.launchLatitude) >= bounds.south &&
      Number(weapon.launchLatitude) <= bounds.north) ||
    (isFiniteGeoPoint(weapon?.targetLongitude, weapon?.targetLatitude) &&
      Number(weapon.targetLongitude) >= bounds.west &&
      Number(weapon.targetLongitude) <= bounds.east &&
      Number(weapon.targetLatitude) >= bounds.south &&
      Number(weapon.targetLatitude) <= bounds.north)
  );
}

function resolveEventAnchorPoint(event) {
  if (isFiniteGeoPoint(event?.focusLongitude, event?.focusLatitude)) {
    return {
      longitude: Number(event.focusLongitude),
      latitude: Number(event.focusLatitude),
      altitudeMeters: Math.max(0, Number(event?.focusAltitudeMeters) || 0),
    };
  }

  if (isFiniteGeoPoint(event?.targetLongitude, event?.targetLatitude)) {
    return {
      longitude: Number(event.targetLongitude),
      latitude: Number(event.targetLatitude),
      altitudeMeters: Math.max(0, Number(event?.targetAltitudeMeters) || 0),
    };
  }

  if (isFiniteGeoPoint(event?.sourceLongitude, event?.sourceLatitude)) {
    return {
      longitude: Number(event.sourceLongitude),
      latitude: Number(event.sourceLatitude),
      altitudeMeters: Math.max(0, Number(event?.sourceAltitudeMeters) || 0),
    };
  }

  return null;
}

function resolveEventSourcePoint(event) {
  return normalizeGeoPoint(
    event?.sourceLongitude,
    event?.sourceLatitude,
    event?.sourceAltitudeMeters
  );
}

function resolveEventTargetPoint(event) {
  return (
    normalizeGeoPoint(
      event?.targetLongitude,
      event?.targetLatitude,
      event?.targetAltitudeMeters
    ) ??
    normalizeGeoPoint(
      event?.focusLongitude,
      event?.focusLatitude,
      event?.focusAltitudeMeters
    )
  );
}

function buildEventTraceWeapon(event) {
  const sourcePoint = resolveEventSourcePoint(event);
  const targetPoint = resolveEventTargetPoint(event);

  if (!sourcePoint || !targetPoint) {
    return null;
  }

  if (approximateDistanceMeters(sourcePoint, targetPoint) < 8) {
    return null;
  }

  const signature = `${event?.message ?? ""} ${event?.type ?? ""} ${
    event?.resultTag ?? ""
  }`;
  const impactLike = isImpactLikeEvent(event);
  const launchLike = isLaunchLikeEvent(event);

  if (!impactLike && !launchLike && !event?.weaponId) {
    return null;
  }

  return {
    id: event?.id,
    name: signature,
    className: signature,
    sideColor: event?.sideColor,
    launchLongitude: sourcePoint.longitude,
    launchLatitude: sourcePoint.latitude,
    launchAltitudeMeters: sourcePoint.altitudeMeters,
    longitude: targetPoint.longitude,
    latitude: targetPoint.latitude,
    altitudeMeters: targetPoint.altitudeMeters,
    targetLongitude: targetPoint.longitude,
    targetLatitude: targetPoint.latitude,
    targetAltitudeMeters: targetPoint.altitudeMeters,
    speedKts: 1450,
  };
}

function buildEventTracePositions(Cesium, traceWeapon) {
  return buildCartesianArrayFromPoints(
    Cesium,
    buildWeaponArcPointSamples(
      traceWeapon,
      resolveWeaponImpactPoint(traceWeapon),
      EVENT_TRACE_SAMPLE_COUNT
    )
  );
}

function createEventTraceGlowGraphics(
  Cesium,
  traceWeapon,
  positions,
  freshness
) {
  const effectProfile = resolveWeaponEffectProfile(traceWeapon);
  return {
    positions,
    width: effectProfile.artilleryLike
      ? 7.2
      : effectProfile.bulletLike
        ? 4.8
        : 6.2,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: effectProfile.artilleryLike ? 0.36 : 0.3,
      taperPower: 0.85,
      color: colorForSide(
        Cesium,
        traceWeapon?.sideColor,
        0.22 + freshness * 0.5
      ),
    }),
    clampToGround: false,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

function createEventTraceDashGraphics(
  Cesium,
  traceWeapon,
  positions,
  freshness
) {
  const effectProfile = resolveWeaponEffectProfile(traceWeapon);
  return {
    positions,
    width: effectProfile.artilleryLike
      ? 3.4
      : effectProfile.bulletLike
        ? 2.4
        : 2.9,
    material: new Cesium.PolylineDashMaterialProperty({
      color: colorForSide(
        Cesium,
        traceWeapon?.sideColor,
        0.36 + freshness * 0.42
      ),
      gapColor: colorForSide(Cesium, traceWeapon?.sideColor, 0.04),
      dashLength: effectProfile.artilleryLike ? 18 : 12,
    }),
    clampToGround: false,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

function resolveEventTraceLabelPoint(traceWeapon) {
  const launchPoint = resolveWeaponLaunchPoint(traceWeapon);
  const impactPoint = resolveWeaponImpactPoint(traceWeapon);

  if (!launchPoint || !impactPoint) {
    return null;
  }

  return sampleWeaponArc(
    launchPoint,
    impactPoint,
    0.62,
    resolveWeaponArcApexMeters(traceWeapon, launchPoint, impactPoint)
  );
}

function createEventTraceLabelGraphics(Cesium, event, traceWeapon, freshness) {
  const labelText = isImpactLikeEvent(event) ? "탄착 잔상" : "발사 궤적";
  return {
    text: labelText,
    font: "800 12px 'Segoe UI', 'Noto Sans KR', sans-serif",
    fillColor: Cesium.Color.WHITE.withAlpha(0.72 + freshness * 0.24),
    outlineColor: Cesium.Color.BLACK.withAlpha(0.78),
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    showBackground: true,
    backgroundColor: colorForSide(Cesium, traceWeapon?.sideColor, 0.34),
    pixelOffset: new Cesium.Cartesian2(0, -12),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 220000),
  };
}

function isEventInsideBounds(event, bounds) {
  const points = [
    resolveEventAnchorPoint(event),
    resolveEventSourcePoint(event),
    resolveEventTargetPoint(event),
  ].filter(Boolean);
  return points.some((point) => isPointInsideBounds(point, bounds));
}

function resolveEventPointColor(Cesium, event) {
  const type = `${event?.type ?? ""}`.toLowerCase();
  const resultTag = `${event?.resultTag ?? ""}`.toLowerCase();

  if (
    resultTag.includes("impact") ||
    type.includes("impact") ||
    type.includes("hit") ||
    type.includes("destroy")
  ) {
    return Cesium.Color.fromCssColorString("#ff8b7c").withAlpha(0.92);
  }

  if (
    resultTag.includes("launch") ||
    type.includes("launch") ||
    type.includes("weapon")
  ) {
    return Cesium.Color.fromCssColorString("#ffd166").withAlpha(0.92);
  }

  return Cesium.Color.fromCssColorString("#7fe7ff").withAlpha(0.88);
}

function buildEventDescription(event) {
  return [
    `<strong>${escapeHtml(event?.message ?? "이벤트")}</strong>`,
    `${escapeHtml(event?.sideName ?? "세력 없음")} · ${escapeHtml(
      event?.type ?? "event"
    )}`,
    `시각 ${escapeHtml(formatRuntimeTimestamp(Number(event?.timestamp) || 0))}`,
    event?.actorName ? `행위자 ${escapeHtml(event.actorName)}` : null,
    event?.targetName ? `대상 ${escapeHtml(event.targetName)}` : null,
  ]
    .filter(Boolean)
    .join("<br/>");
}

function isImpactLikeEvent(event) {
  const type = `${event?.type ?? ""}`.toLowerCase();
  const resultTag = `${event?.resultTag ?? ""}`.toLowerCase();
  const message = `${event?.message ?? ""}`.toLowerCase();

  return (
    resultTag.includes("impact") ||
    type.includes("impact") ||
    type.includes("hit") ||
    type.includes("destroy") ||
    /\b(hit|impact|격파|명중|파괴)\b/i.test(message)
  );
}

function isLaunchLikeEvent(event) {
  const type = `${event?.type ?? ""}`.toLowerCase();
  const resultTag = `${event?.resultTag ?? ""}`.toLowerCase();
  const message = `${event?.message ?? ""}`.toLowerCase();

  return (
    resultTag.includes("launch") ||
    type.includes("launch") ||
    type.includes("weapon") ||
    /\b(launch|fired|발사|사격)\b/i.test(message)
  );
}

function resolveFocusFireSummary(snapshot) {
  const summary =
    snapshot?.focusFireSummary && typeof snapshot.focusFireSummary === "object"
      ? snapshot.focusFireSummary
      : snapshot?.focusFire && typeof snapshot.focusFire === "object"
        ? snapshot.focusFire
        : null;

  if (!summary) {
    return null;
  }

  const latitude = Number(summary.objectiveLatitude);
  const longitude = Number(summary.objectiveLongitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    ...summary,
    objectiveLatitude: latitude,
    objectiveLongitude: longitude,
  };
}

function buildFocusFireObjectiveKey(summary) {
  if (!summary) {
    return "";
  }

  return [
    Number(summary.objectiveLatitude).toFixed(5),
    Number(summary.objectiveLongitude).toFixed(5),
  ].join(":");
}

function isFocusFireImpactEvent(event, summary) {
  if (!event || !summary || !isImpactLikeEvent(event)) {
    return false;
  }

  const objectiveName = `${summary.objectiveName ?? ""}`.trim();
  if (objectiveName && `${event?.targetName ?? ""}`.trim() === objectiveName) {
    return true;
  }

  const impactPoint =
    normalizeGeoPoint(
      event?.targetLongitude,
      event?.targetLatitude,
      event?.targetAltitudeMeters
    ) ??
    normalizeGeoPoint(
      event?.focusLongitude,
      event?.focusLatitude,
      event?.focusAltitudeMeters
    );
  if (!impactPoint) {
    return false;
  }

  return (
    approximateDistanceMeters(impactPoint, {
      longitude: summary.objectiveLongitude,
      latitude: summary.objectiveLatitude,
      altitudeMeters: 0,
    }) <= FOCUS_FIRE_IMPACT_EVENT_DISTANCE_METERS
  );
}

export function resolveFocusFireImpactBoxState(
  snapshot,
  accumulatedImpactCount = 0
) {
  const summary = resolveFocusFireSummary(snapshot);
  if (!summary || summary.enabled !== true) {
    return null;
  }

  const weaponsInFlight = Math.max(0, Number(summary.weaponsInFlight) || 0);
  const impactLoad = Math.max(0, Number(accumulatedImpactCount) || 0);
  const expectedStrikeEffect = Number(
    summary?.recommendation?.expectedStrikeEffect
  );
  const expectedText = Number.isFinite(expectedStrikeEffect)
    ? `예상 ${formatImpactLoad(expectedStrikeEffect)}`
    : summary.active === true
      ? "진행 중"
      : `${summary.statusLabel ?? "대기"}`;

  return {
    longitude: summary.objectiveLongitude,
    latitude: summary.objectiveLatitude,
    altitudeMeters: 58,
    impactLoad,
    weaponsInFlight,
    expectedStrikeEffect: Number.isFinite(expectedStrikeEffect)
      ? expectedStrikeEffect
      : null,
    text: [
      `충격량 ${formatImpactLoad(impactLoad)}`,
      `탄착 ${Math.round(impactLoad)} · 비행 ${weaponsInFlight}`,
      expectedText,
    ].join("\n"),
  };
}

export function createTerrainPlacementRuntime({
  Cesium,
  bounds,
  widthMeters,
  heightMeters,
  liveRuntimeEnabled = false,
  setStatusMessage,
  setPlacementBadge,
}) {
  let viewer = null;
  let dataSource = null;
  let weaponDataSource = null;
  let eventDataSource = null;
  let focusFireDataSource = null;
  let effectDataSource = null;
  let pendingSnapshot = null;
  let lastSnapshot = null;
  let focusedUnitId = null;
  let activeUnits = [];
  let interactionHandler = null;

  const unitStateById = new Map();
  const weaponStateById = new Map();
  const activeTransientEffects = new Map();
  const triggeredEventEffectIds = new Set();
  const focusFireSeenImpactEventIds = new Set();
  let focusFireImpactObjectiveKey = "";
  let focusFireImpactCount = 0;
  let focusFireImpactRingEntity = null;
  let focusFireImpactLabelEntity = null;
  const assetPanel = document.getElementById("assetPanel");
  const assetCountBadge = document.getElementById("assetCountBadge");
  const assetFocusHint = document.getElementById("assetFocusHint");
  const assetList = document.getElementById("assetList");
  const assetDetail = document.getElementById("assetDetail");
  const runtimeModeBadge = document.getElementById("runtimeModeBadge");
  const runtimeTimeMetric = document.getElementById("runtimeTimeMetric");
  const runtimeSideMetric = document.getElementById("runtimeSideMetric");
  const runtimeAssetMetric = document.getElementById("runtimeAssetMetric");
  const runtimeWeaponMetric = document.getElementById("runtimeWeaponMetric");
  const runtimeSelectionText = document.getElementById("runtimeSelectionText");
  const runtimeEventList = document.getElementById("runtimeEventList");

  const placementBounds = expandBounds(bounds, 0.04, 0.0005);
  const labelDistance = Math.max(widthMeters, heightMeters) * 7 + 5000;
  const runtimeVisualOptions = {
    showWeaponTrails: true,
    showEventEffects: true,
    autoTrackImpacts: false,
    impactCameraShake: true,
  };
  let lastTrackedImpactEventId = null;

  function requestRender() {
    viewer?.scene?.requestRender?.();
  }

  function getTransientEffectProgress(effect) {
    return clamp01(
      (performance.now() - effect.startedAtMs) / Math.max(1, effect.durationMs)
    );
  }

  function removeTransientEffect(effectKey) {
    const effect = activeTransientEffects.get(effectKey);
    if (!effect) {
      return;
    }

    effect.entities.forEach((entity) => {
      effectDataSource?.entities?.remove(entity);
    });
    activeTransientEffects.delete(effectKey);
  }

  function pruneTransientEffects() {
    const now = performance.now();
    activeTransientEffects.forEach((effect, effectKey) => {
      if (now - effect.startedAtMs >= effect.durationMs) {
        removeTransientEffect(effectKey);
      }
    });

    while (activeTransientEffects.size > WEAPON_TRANSIENT_EFFECT_LIMIT) {
      const oldestKey = activeTransientEffects.keys().next().value;
      if (!oldestKey) {
        break;
      }
      removeTransientEffect(oldestKey);
    }
  }

  let transientEffectLoopActive = false;
  function startTransientEffectLoop() {
    if (transientEffectLoopActive) {
      return;
    }

    transientEffectLoopActive = true;
    const tick = () => {
      pruneTransientEffects();
      requestRender();
      if (activeTransientEffects.size > 0) {
        window.requestAnimationFrame(tick);
      } else {
        transientEffectLoopActive = false;
      }
    };
    window.requestAnimationFrame(tick);
  }

  function rememberTriggeredEventEffect(effectKey) {
    triggeredEventEffectIds.add(effectKey);
    while (triggeredEventEffectIds.size > EVENT_EFFECT_KEY_LIMIT) {
      const oldestKey = triggeredEventEffectIds.values().next().value;
      if (!oldestKey) {
        break;
      }
      triggeredEventEffectIds.delete(oldestKey);
    }
  }

  function makeEffectScaleProperty(effect, startScale, endScale) {
    return new Cesium.CallbackProperty(() => {
      const progress = getTransientEffectProgress(effect);
      return startScale + (endScale - startScale) * progress;
    }, false);
  }

  function makeEffectTimelineNumberProperty(effect, stops, fallback = 0) {
    return new Cesium.CallbackProperty(
      () =>
        resolveEffectTimelineValue(
          getTransientEffectProgress(effect),
          stops,
          fallback
        ),
      false
    );
  }

  function makeEffectFrameImageProperty(
    effect,
    frames,
    startRatio = 0,
    endRatio = 1
  ) {
    const safeFrames =
      Array.isArray(frames) && frames.length > 0 ? frames : [""];
    return new Cesium.CallbackProperty(() => {
      const rawProgress = getTransientEffectProgress(effect);
      const frameProgress = clamp01(
        (rawProgress - startRatio) / Math.max(0.0001, endRatio - startRatio)
      );
      const frameIndex = clamp(
        Math.floor(frameProgress * safeFrames.length),
        0,
        safeFrames.length - 1
      );
      return safeFrames[frameIndex];
    }, false);
  }

  function makeEffectColorProperty(effect, cssColor, startAlpha, endAlpha) {
    return new Cesium.CallbackProperty(() => {
      const progress = getTransientEffectProgress(effect);
      return Cesium.Color.fromCssColorString(cssColor).withAlpha(
        startAlpha + (endAlpha - startAlpha) * progress
      );
    }, false);
  }

  function makeEffectTimelineColorProperty(
    effect,
    cssColor,
    stops,
    fallback = 0
  ) {
    return new Cesium.CallbackProperty(() => {
      const alpha = resolveEffectTimelineValue(
        getTransientEffectProgress(effect),
        stops,
        fallback
      );
      return Cesium.Color.fromCssColorString(cssColor).withAlpha(
        clamp01(alpha)
      );
    }, false);
  }

  function spawnLaunchEffect(effectKey, weapon) {
    if (
      !runtimeVisualOptions.showEventEffects ||
      activeTransientEffects.has(effectKey)
    ) {
      return;
    }

    const launchPoint = resolveWeaponLaunchPoint(weapon);
    if (!launchPoint || !isPointInsideBounds(launchPoint, placementBounds)) {
      return;
    }

    const effect = {
      startedAtMs: performance.now(),
      durationMs: WEAPON_LAUNCH_EFFECT_MS,
      entities: [],
    };
    const effectProfile = resolveWeaponEffectProfile(weapon);
    const position = buildCartesianFromPoint(Cesium, {
      ...launchPoint,
      altitudeMeters: Math.max(18, launchPoint.altitudeMeters + 14),
    });

    effect.entities.push(
      effectDataSource.entities.add({
        id: `terrain-weapon-launch-${effectKey}`,
        position,
        billboard: {
          image: EFFECT_TEXTURES.launchMuzzle,
          scale: makeEffectScaleProperty(
            effect,
            effectProfile.artilleryLike ? 1.25 : 0.92,
            effectProfile.artilleryLike ? 2.45 : 1.75
          ),
          width: effectProfile.artilleryLike ? 96 : 72,
          height: effectProfile.artilleryLike ? 96 : 72,
          color: makeEffectColorProperty(effect, "#ffd166", 0.94, 0.02),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      })
    );

    activeTransientEffects.set(effectKey, effect);
    startTransientEffectLoop();
  }

  function spawnImpactEffect(
    effectKey,
    point,
    sideColor = "yellow",
    options = {}
  ) {
    if (
      !runtimeVisualOptions.showEventEffects ||
      activeTransientEffects.has(effectKey)
    ) {
      return;
    }

    if (!point || !isPointInsideBounds(point, placementBounds)) {
      return;
    }

    const effect = {
      startedAtMs: performance.now(),
      durationMs: options.durationMs ?? WEAPON_IMPACT_EFFECT_MS,
      entities: [],
    };
    const impactColor =
      SIDE_COLOR_MAP[`${sideColor ?? ""}`.toLowerCase()] ?? "#ff9f1c";
    const baseAltitude = Math.max(0, Number(point.altitudeMeters) || 0);
    const radiusMeters = options.radiusMeters ?? 102;
    const centerPosition = buildCartesianFromPoint(Cesium, {
      ...point,
      altitudeMeters: baseAltitude,
    });
    const fireballPosition = buildCartesianFromPoint(Cesium, {
      ...point,
      altitudeMeters: Math.max(30, baseAltitude + 42),
    });
    const smokePosition = buildCartesianFromPoint(Cesium, {
      ...point,
      altitudeMeters: Math.max(52, baseAltitude + 74),
    });
    const highSmokePosition = buildCartesianFromPoint(Cesium, {
      ...point,
      altitudeMeters: Math.max(86, baseAltitude + 112),
    });
    const dustPosition = buildCartesianFromPoint(Cesium, {
      ...point,
      altitudeMeters: Math.max(10, baseAltitude + 10),
    });

    effect.entities.push(
      effectDataSource.entities.add({
        id: `terrain-impact-ring-${effectKey}`,
        position: centerPosition,
        ellipse: {
          semiMajorAxis: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 10 },
            { at: 0.24, value: radiusMeters * 0.78 },
            { at: 0.72, value: radiusMeters * 1.22 },
            { at: 1, value: radiusMeters * 1.34 },
          ]),
          semiMinorAxis: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 10 },
            { at: 0.24, value: radiusMeters * 0.78 },
            { at: 0.72, value: radiusMeters * 1.22 },
            { at: 1, value: radiusMeters * 1.34 },
          ]),
          material: ensureCesiumColorMaterialProperty(
            Cesium,
            makeEffectTimelineColorProperty(effect, impactColor, [
              { at: 0, value: 0.4 },
              { at: 0.12, value: 0.24 },
              { at: 0.52, value: 0.06 },
              { at: 1, value: 0 },
            ])
          ),
          outline: true,
          outlineColor: makeEffectTimelineColorProperty(effect, "#ffd8a1", [
            { at: 0, value: 0.98 },
            { at: 0.22, value: 0.58 },
            { at: 0.62, value: 0.12 },
            { at: 1, value: 0 },
          ]),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          classificationType: Cesium.ClassificationType.TERRAIN,
        },
      }),
      effectDataSource.entities.add({
        id: `terrain-impact-secondary-ring-${effectKey}`,
        position: centerPosition,
        ellipse: {
          semiMajorAxis: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 4 },
            { at: 0.16, value: radiusMeters * 0.42 },
            { at: 0.4, value: radiusMeters * 0.92 },
            { at: 1, value: radiusMeters * 1.08 },
          ]),
          semiMinorAxis: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 4 },
            { at: 0.16, value: radiusMeters * 0.42 },
            { at: 0.4, value: radiusMeters * 0.92 },
            { at: 1, value: radiusMeters * 1.08 },
          ]),
          material: ensureCesiumColorMaterialProperty(
            Cesium,
            makeEffectTimelineColorProperty(effect, "#fff0c2", [
              { at: 0, value: 0.48 },
              { at: 0.1, value: 0.3 },
              { at: 0.28, value: 0.04 },
              { at: 1, value: 0 },
            ])
          ),
          outline: false,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          classificationType: Cesium.ClassificationType.TERRAIN,
        },
      }),
      effectDataSource.entities.add({
        id: `terrain-impact-fireball-${effectKey}`,
        position: fireballPosition,
        billboard: {
          image: makeEffectFrameImageProperty(
            effect,
            EFFECT_TEXTURES.explosionFrames,
            0,
            0.34
          ),
          scale: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 0.36 },
            { at: 0.08, value: 1.18 },
            { at: 0.28, value: 1.96 },
            { at: 0.44, value: 1.36 },
            { at: 1, value: 0.34 },
          ]),
          width: 132,
          height: 132,
          color: makeEffectTimelineColorProperty(effect, "#ffffff", [
            { at: 0, value: 0 },
            { at: 0.03, value: 1 },
            { at: 0.16, value: 0.96 },
            { at: 0.36, value: 0.22 },
            { at: 0.5, value: 0 },
            { at: 1, value: 0 },
          ]),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      }),
      effectDataSource.entities.add({
        id: `terrain-impact-flash-${effectKey}`,
        position: fireballPosition,
        billboard: {
          image: makeEffectFrameImageProperty(
            effect,
            EFFECT_TEXTURES.flashFrames,
            0,
            0.18
          ),
          scale: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 0.32 },
            { at: 0.06, value: 1.34 },
            { at: 0.2, value: 2.12 },
            { at: 0.34, value: 0.5 },
            { at: 1, value: 0.23 },
          ]),
          width: 116,
          height: 116,
          color: makeEffectTimelineColorProperty(effect, "#ffcf7a", [
            { at: 0, value: 0.88 },
            { at: 0.1, value: 1 },
            { at: 0.24, value: 0.2 },
            { at: 0.34, value: 0 },
            { at: 1, value: 0 },
          ]),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      }),
      effectDataSource.entities.add({
        id: `terrain-impact-smoke-${effectKey}`,
        position: smokePosition,
        billboard: {
          image: EFFECT_TEXTURES.impactSmoke,
          scale: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 0.36 },
            { at: 0.18, value: 1 },
            { at: 0.62, value: 2.05 },
            { at: 1, value: 2.66 },
          ]),
          width: 146,
          height: 146,
          color: makeEffectTimelineColorProperty(effect, "#ffffff", [
            { at: 0, value: 0 },
            { at: 0.12, value: 0.58 },
            { at: 0.6, value: 0.42 },
            { at: 0.88, value: 0.1 },
            { at: 1, value: 0 },
          ]),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      }),
      effectDataSource.entities.add({
        id: `terrain-impact-smoke-high-${effectKey}`,
        position: highSmokePosition,
        billboard: {
          image: EFFECT_TEXTURES.trailSmoke,
          scale: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 0.12 },
            { at: 0.28, value: 0.58 },
            { at: 0.7, value: 1.47 },
            { at: 1, value: 1.98 },
          ]),
          width: 132,
          height: 132,
          color: makeEffectTimelineColorProperty(effect, "#dbe2df", [
            { at: 0, value: 0 },
            { at: 0.24, value: 0.34 },
            { at: 0.72, value: 0.18 },
            { at: 1, value: 0 },
          ]),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      }),
      effectDataSource.entities.add({
        id: `terrain-impact-dust-${effectKey}`,
        position: dustPosition,
        billboard: {
          image: EFFECT_TEXTURES.impactDust,
          scale: makeEffectTimelineNumberProperty(effect, [
            { at: 0, value: 0.32 },
            { at: 0.2, value: 1.15 },
            { at: 0.62, value: 1.76 },
            { at: 1, value: 2.22 },
          ]),
          width: 152,
          height: 98,
          color: makeEffectTimelineColorProperty(effect, "#ffd8a1", [
            { at: 0, value: 0.6 },
            { at: 0.2, value: 0.54 },
            { at: 0.76, value: 0.14 },
            { at: 1, value: 0 },
          ]),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      })
    );

    activeTransientEffects.set(effectKey, effect);
    startTransientEffectLoop();
    triggerImpactShake(
      options.shakeIntensity ?? 10,
      options.shakeDurationMs ?? 260
    );
  }

  function syncWeaponTrailVisibility() {
    weaponStateById.forEach((weaponState) => {
      if (!runtimeVisualOptions.showWeaponTrails) {
        if (weaponState?.trajectoryEntity) {
          weaponDataSource.entities.remove(weaponState.trajectoryEntity);
          weaponState.trajectoryEntity = null;
        }
        if (weaponState?.trailEntity) {
          weaponDataSource.entities.remove(weaponState.trailEntity);
          weaponState.trailEntity = null;
        }
        if (weaponState?.impactZoneEntity) {
          weaponDataSource.entities.remove(weaponState.impactZoneEntity);
          weaponState.impactZoneEntity = null;
        }
        if (weaponState?.impactCueEntity) {
          weaponDataSource.entities.remove(weaponState.impactCueEntity);
          weaponState.impactCueEntity = null;
        }
        return;
      }

      if (
        (!weaponState?.trajectoryEntity ||
          !weaponState?.trailEntity ||
          !weaponState?.impactZoneEntity ||
          !weaponState?.impactCueEntity) &&
        weaponState?.weapon
      ) {
        upsertWeaponState(weaponState.weapon);
      }
    });
  }

  function syncEventEffectVisibility() {
    if (lastSnapshot) {
      const visibleEvents = Array.isArray(lastSnapshot.recentEvents)
        ? lastSnapshot.recentEvents
            .filter((event) => isEventInsideBounds(event, placementBounds))
            .slice(-6)
        : [];
      renderEventEntities(visibleEvents);
    }
  }

  function applyRuntimeVisualOptions(options = {}) {
    runtimeVisualOptions.showWeaponTrails =
      options.showWeaponTrails !== undefined
        ? options.showWeaponTrails === true
        : runtimeVisualOptions.showWeaponTrails;
    runtimeVisualOptions.showEventEffects =
      options.showEventEffects !== undefined
        ? options.showEventEffects === true
        : runtimeVisualOptions.showEventEffects;
    runtimeVisualOptions.autoTrackImpacts =
      options.autoTrackImpacts !== undefined
        ? options.autoTrackImpacts === true
        : runtimeVisualOptions.autoTrackImpacts;
    runtimeVisualOptions.impactCameraShake =
      options.impactCameraShake !== undefined
        ? options.impactCameraShake === true
        : runtimeVisualOptions.impactCameraShake;

    if (!runtimeVisualOptions.showEventEffects) {
      effectDataSource?.entities?.removeAll();
      activeTransientEffects.clear();
    }
    syncWeaponTrailVisibility();
    syncEventEffectVisibility();
    requestRender();
  }

  function setRuntimeSelectionText(text) {
    if (runtimeSelectionText) {
      runtimeSelectionText.textContent = text;
    }
  }

  function renderRuntimeEvents(events = []) {
    if (!runtimeEventList) {
      return;
    }

    if (!Array.isArray(events) || events.length === 0) {
      runtimeEventList.innerHTML = "";
      return;
    }

    runtimeEventList.innerHTML = events
      .map((event) => {
        const sideTone =
          SIDE_COLOR_MAP[`${event?.sideColor ?? ""}`.toLowerCase()] ??
          "#7fe7ff";
        return `
          <div class="terrain-event-row">
            <span class="terrain-event-time">${escapeHtml(
              formatRuntimeTimestamp(Number(event?.timestamp) || 0)
            )}</span>
            <div class="terrain-event-copy">
              <span class="terrain-event-pill" style="--terrain-event-tone: ${escapeHtml(
                sideTone
              )}">${escapeHtml(event?.sideName ?? "전장")}</span>
              <strong>${escapeHtml(event?.message ?? "이벤트")}</strong>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderRuntimeSummary(
    snapshot,
    visibleUnits,
    visibleWeapons,
    visibleEvents
  ) {
    if (runtimeModeBadge) {
      runtimeModeBadge.textContent = liveRuntimeEnabled
        ? "실시간 진행"
        : "정적 보기";
    }
    if (runtimeTimeMetric) {
      runtimeTimeMetric.textContent = snapshot
        ? formatRuntimeTimestamp(Number(snapshot.currentTime) || 0)
        : "-";
    }
    if (runtimeSideMetric) {
      runtimeSideMetric.textContent =
        snapshot?.currentSideName ?? snapshot?.currentSideId ?? "세력 없음";
    }
    if (runtimeAssetMetric) {
      runtimeAssetMetric.textContent = snapshot
        ? `${formatCompactCount(visibleUnits.length)} / ${formatCompactCount(
            snapshot.units?.length
          )}`
        : "-";
    }
    if (runtimeWeaponMetric) {
      runtimeWeaponMetric.textContent = snapshot
        ? `${formatCompactCount(visibleWeapons.length)} / ${formatCompactCount(
            snapshot.stats?.weaponsInFlight
          )}`
        : "-";
    }

    if (!snapshot) {
      setRuntimeSelectionText("");
      renderRuntimeEvents([]);
      return;
    }

    const focusedUnitState = getFocusedUnitState();
    const selectedUnit =
      focusedUnitState?.unit ??
      snapshot.units?.find((unit) => unit.id === snapshot.selectedUnitId) ??
      null;

    if (selectedUnit) {
      setRuntimeSelectionText(
        `${selectedUnit.sideName ?? selectedUnit.sideId ?? "세력 없음"} · ${
          selectedUnit.name ?? selectedUnit.className ?? "자산"
        }`
      );
    } else {
      setRuntimeSelectionText("");
    }

    renderRuntimeEvents(visibleEvents);
  }

  function clearFocusFireImpactBox() {
    if (focusFireImpactRingEntity) {
      focusFireDataSource?.entities?.remove(focusFireImpactRingEntity);
      focusFireImpactRingEntity = null;
    }
    if (focusFireImpactLabelEntity) {
      focusFireDataSource?.entities?.remove(focusFireImpactLabelEntity);
      focusFireImpactLabelEntity = null;
    }
  }

  function createFocusFireImpactRingGraphics(state) {
    const radiusMeters = clamp(
      68 + state.impactLoad * 18 + state.weaponsInFlight * 7,
      68,
      260
    );

    return {
      semiMajorAxis: radiusMeters,
      semiMinorAxis: radiusMeters,
      material: Cesium.Color.fromCssColorString("#ffb347").withAlpha(0.16),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString("#ffd166").withAlpha(0.92),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      classificationType: Cesium.ClassificationType.TERRAIN,
    };
  }

  function createFocusFireImpactLabelGraphics(state) {
    return {
      text: state.text,
      font: "800 13px 'Segoe UI', 'Noto Sans KR', sans-serif",
      fillColor: Cesium.Color.fromCssColorString("#07151a").withAlpha(0.96),
      outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
      outlineWidth: 1,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      showBackground: true,
      backgroundColor:
        Cesium.Color.fromCssColorString("#ecffff").withAlpha(0.94),
      pixelOffset: new Cesium.Cartesian2(0, -52),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 260000),
    };
  }

  function accumulateFocusFireImpactEvents(snapshot, summary) {
    const objectiveKey = buildFocusFireObjectiveKey(summary);
    if (objectiveKey !== focusFireImpactObjectiveKey) {
      focusFireImpactObjectiveKey = objectiveKey;
      focusFireSeenImpactEventIds.clear();
      focusFireImpactCount = 0;
    }

    if (!Array.isArray(snapshot?.recentEvents)) {
      return;
    }

    snapshot.recentEvents.forEach((event) => {
      const eventId = `${event?.id ?? ""}`;
      if (!eventId || focusFireSeenImpactEventIds.has(eventId)) {
        return;
      }
      if (!isFocusFireImpactEvent(event, summary)) {
        return;
      }

      focusFireSeenImpactEventIds.add(eventId);
      focusFireImpactCount += 1;
    });
  }

  function updateFocusFireImpactBox(snapshot) {
    const summary = resolveFocusFireSummary(snapshot);
    if (
      !summary ||
      summary.enabled !== true ||
      !isPointInsideBounds(
        {
          longitude: summary.objectiveLongitude,
          latitude: summary.objectiveLatitude,
        },
        placementBounds
      )
    ) {
      clearFocusFireImpactBox();
      return;
    }

    accumulateFocusFireImpactEvents(snapshot, summary);
    const state = resolveFocusFireImpactBoxState(
      {
        ...snapshot,
        focusFireSummary: summary,
      },
      focusFireImpactCount
    );
    if (!state) {
      clearFocusFireImpactBox();
      return;
    }

    const groundPosition = buildCartesianFromPoint(Cesium, {
      longitude: state.longitude,
      latitude: state.latitude,
      altitudeMeters: 0,
    });
    const labelPosition = buildCartesianFromPoint(Cesium, state);

    if (!focusFireImpactRingEntity) {
      focusFireImpactRingEntity = focusFireDataSource.entities.add({
        id: "terrain-focus-fire-impact-ring",
        position: groundPosition,
        ellipse: createFocusFireImpactRingGraphics(state),
      });
    } else {
      focusFireImpactRingEntity.position = groundPosition;
      focusFireImpactRingEntity.ellipse =
        createFocusFireImpactRingGraphics(state);
    }

    if (!focusFireImpactLabelEntity) {
      focusFireImpactLabelEntity = focusFireDataSource.entities.add({
        id: "terrain-focus-fire-impact-label",
        position: labelPosition,
        label: createFocusFireImpactLabelGraphics(state),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString("#ffb347").withAlpha(0.96),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.88),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    } else {
      focusFireImpactLabelEntity.position = labelPosition;
      focusFireImpactLabelEntity.label =
        createFocusFireImpactLabelGraphics(state);
    }
  }

  function clearPlacement() {
    dataSource?.entities?.removeAll();
    weaponDataSource?.entities?.removeAll();
    eventDataSource?.entities?.removeAll();
    focusFireDataSource?.entities?.removeAll();
    effectDataSource?.entities?.removeAll();
    lastSnapshot = null;
    focusedUnitId = null;
    lastTrackedImpactEventId = null;
    activeUnits = [];
    unitStateById.clear();
    weaponStateById.clear();
    activeTransientEffects.clear();
    triggeredEventEffectIds.clear();
    focusFireSeenImpactEventIds.clear();
    focusFireImpactObjectiveKey = "";
    focusFireImpactCount = 0;
    focusFireImpactRingEntity = null;
    focusFireImpactLabelEntity = null;
    renderAssetPanel();
    renderRuntimeSummary(null, [], [], []);
    requestRender();
  }

  function setAssetCount(text) {
    if (assetCountBadge) {
      assetCountBadge.textContent = text;
    }
  }

  function setAssetHint(text) {
    if (assetFocusHint) {
      assetFocusHint.textContent = text;
    }
  }

  function getFocusedUnitState() {
    return focusedUnitId ? (unitStateById.get(focusedUnitId) ?? null) : null;
  }

  function isUnitEmphasized(unit) {
    return (
      unit?.selected === true ||
      unit?.id === lastSnapshot?.selectedUnitId ||
      unit?.id === focusedUnitId
    );
  }

  function syncUnitVisualState(unitState) {
    if (!unitState?.entity) {
      return;
    }

    const emphasized = isUnitEmphasized(unitState.unit);
    unitState.entity.orientation = resolveHeadingOrientation(
      Cesium,
      unitState.displayPoint,
      unitState.unit?.headingDeg
    );
    unitState.entity.label = createPlacementLabel(
      Cesium,
      unitState.unit,
      emphasized,
      labelDistance
    );
    unitState.entity.description = buildUnitDescription(
      unitState.unit,
      unitState.displayPoint
    );

    if (unitState.model) {
      unitState.entity.model = createUnitModelGraphics(
        Cesium,
        unitState.unit,
        unitState.model,
        emphasized
      );
      unitState.entity.point = undefined;
    } else {
      unitState.entity.point = createUnitPointGraphics(
        Cesium,
        unitState.unit,
        emphasized
      );
      unitState.entity.model = undefined;
    }
  }

  function upsertUnitState(unit, renderContext) {
    const displayPoint = resolveDisplayedUnitPoint(unit, renderContext);
    const model = resolveUnitModel(unit, renderContext);
    const position = buildCartesianFromPoint(Cesium, displayPoint);
    const existingState = unitStateById.get(unit.id) ?? null;

    if (!existingState) {
      const entityConfig = {
        id: `terrain-placement-${unit.id}`,
        position,
        orientation: resolveHeadingOrientation(
          Cesium,
          displayPoint,
          unit?.headingDeg
        ),
        label: createPlacementLabel(
          Cesium,
          unit,
          isUnitEmphasized(unit),
          labelDistance
        ),
        description: buildUnitDescription(unit, displayPoint),
      };

      if (model) {
        entityConfig.model = createUnitModelGraphics(
          Cesium,
          unit,
          model,
          isUnitEmphasized(unit)
        );
      } else {
        entityConfig.point = createUnitPointGraphics(
          Cesium,
          unit,
          isUnitEmphasized(unit)
        );
      }

      const entity = dataSource.entities.add(entityConfig);
      const unitState = {
        unit,
        model,
        entity,
        displayPoint,
      };
      unitStateById.set(unit.id, unitState);
      return unitState;
    }

    existingState.unit = unit;
    existingState.model = model;
    existingState.displayPoint = displayPoint;
    existingState.entity.position = position;
    syncUnitVisualState(existingState);
    return existingState;
  }

  function syncFocusedVisuals(previousFocusedUnitId, nextFocusedUnitId) {
    const changedUnitIds = new Set(
      [
        previousFocusedUnitId,
        nextFocusedUnitId,
        lastSnapshot?.selectedUnitId,
      ].filter((unitId) => typeof unitId === "string" && unitId.length > 0)
    );

    changedUnitIds.forEach((unitId) => {
      const unitState = unitStateById.get(unitId);
      if (unitState) {
        syncUnitVisualState(unitState);
      }
    });

    requestRender();
  }

  function removeHiddenUnitStates(nextVisibleUnitIds) {
    [...unitStateById.keys()].forEach((unitId) => {
      if (nextVisibleUnitIds.has(unitId)) {
        return;
      }

      const unitState = unitStateById.get(unitId);
      if (unitState?.entity) {
        dataSource.entities.remove(unitState.entity);
      }
      unitStateById.delete(unitId);
    });
  }

  function upsertWeaponState(weapon) {
    const point = {
      longitude: Number(weapon?.longitude) || 0,
      latitude: Number(weapon?.latitude) || 0,
      altitudeMeters: Math.max(0, Number(weapon?.altitudeMeters) || 0),
    };
    const position = buildCartesianFromPoint(Cesium, point);
    const orientation = resolveWeaponOrientation(Cesium, weapon, point);
    const trajectoryPositions = buildWeaponTrajectoryPositions(Cesium, weapon);
    const trailPositions = buildWeaponTrailPositions(Cesium, weapon);
    const impactPoint = resolveWeaponImpactPoint(weapon);
    const existingState = weaponStateById.get(weapon.id) ?? null;

    if (!existingState) {
      const pointEntity = weaponDataSource.entities.add({
        id: `terrain-weapon-${weapon.id}`,
        position,
        orientation,
        model: createWeaponModelGraphics(Cesium, weapon),
        point: createWeaponPointGraphics(Cesium, weapon),
        billboard: createWeaponBillboardGraphics(Cesium, weapon),
        label: createWeaponLabelGraphics(Cesium, weapon),
        description: buildWeaponDescription(weapon),
      });
      const trajectoryEntity =
        runtimeVisualOptions.showWeaponTrails && trajectoryPositions.length > 0
          ? weaponDataSource.entities.add({
              id: `terrain-weapon-trajectory-${weapon.id}`,
              polyline: createWeaponProjectedTrajectoryGraphics(
                Cesium,
                weapon,
                trajectoryPositions
              ),
            })
          : null;
      const trailEntity =
        runtimeVisualOptions.showWeaponTrails && trailPositions.length > 0
          ? weaponDataSource.entities.add({
              id: `terrain-weapon-trail-${weapon.id}`,
              polyline: createWeaponTravelTrailGraphics(
                Cesium,
                weapon,
                trailPositions
              ),
            })
          : null;
      const impactZoneEntity =
        runtimeVisualOptions.showWeaponTrails && impactPoint
          ? weaponDataSource.entities.add({
              id: `terrain-weapon-impact-zone-${weapon.id}`,
              position: buildCartesianFromPoint(Cesium, impactPoint),
              ellipse: createWeaponImpactZoneGraphics(Cesium, weapon),
            })
          : null;
      const impactCueEntity =
        runtimeVisualOptions.showWeaponTrails && impactPoint
          ? weaponDataSource.entities.add({
              id: `terrain-weapon-impact-cue-${weapon.id}`,
              position: buildCartesianFromPoint(Cesium, {
                ...impactPoint,
                altitudeMeters: Math.max(
                  32,
                  Number(impactPoint.altitudeMeters) || 0
                ),
              }),
              label: createWeaponImpactCueGraphics(Cesium, weapon),
            })
          : null;

      const weaponState = {
        weapon,
        pointEntity,
        trajectoryEntity,
        trailEntity,
        impactZoneEntity,
        impactCueEntity,
      };
      weaponStateById.set(weapon.id, weaponState);
      spawnLaunchEffect(`weapon-${weapon.id}`, weapon);
      return weaponState;
    }

    existingState.weapon = weapon;
    existingState.pointEntity.position = position;
    existingState.pointEntity.orientation = orientation;
    existingState.pointEntity.model = createWeaponModelGraphics(Cesium, weapon);
    existingState.pointEntity.point = createWeaponPointGraphics(Cesium, weapon);
    existingState.pointEntity.billboard = createWeaponBillboardGraphics(
      Cesium,
      weapon
    );
    existingState.pointEntity.label = createWeaponLabelGraphics(Cesium, weapon);
    existingState.pointEntity.description = buildWeaponDescription(weapon);

    if (
      runtimeVisualOptions.showWeaponTrails &&
      trajectoryPositions.length > 0
    ) {
      if (!existingState.trajectoryEntity) {
        existingState.trajectoryEntity = weaponDataSource.entities.add({
          id: `terrain-weapon-trajectory-${weapon.id}`,
          polyline: createWeaponProjectedTrajectoryGraphics(
            Cesium,
            weapon,
            trajectoryPositions
          ),
        });
      } else {
        existingState.trajectoryEntity.polyline =
          createWeaponProjectedTrajectoryGraphics(
            Cesium,
            weapon,
            trajectoryPositions
          );
      }
    } else if (existingState.trajectoryEntity) {
      weaponDataSource.entities.remove(existingState.trajectoryEntity);
      existingState.trajectoryEntity = null;
    }

    if (runtimeVisualOptions.showWeaponTrails && trailPositions.length > 0) {
      if (!existingState.trailEntity) {
        existingState.trailEntity = weaponDataSource.entities.add({
          id: `terrain-weapon-trail-${weapon.id}`,
          polyline: createWeaponTravelTrailGraphics(
            Cesium,
            weapon,
            trailPositions
          ),
        });
      } else {
        existingState.trailEntity.polyline = createWeaponTravelTrailGraphics(
          Cesium,
          weapon,
          trailPositions
        );
      }
    } else if (existingState.trailEntity) {
      weaponDataSource.entities.remove(existingState.trailEntity);
      existingState.trailEntity = null;
    }

    if (runtimeVisualOptions.showWeaponTrails && impactPoint) {
      if (!existingState.impactZoneEntity) {
        existingState.impactZoneEntity = weaponDataSource.entities.add({
          id: `terrain-weapon-impact-zone-${weapon.id}`,
          position: buildCartesianFromPoint(Cesium, impactPoint),
          ellipse: createWeaponImpactZoneGraphics(Cesium, weapon),
        });
      } else {
        existingState.impactZoneEntity.position = buildCartesianFromPoint(
          Cesium,
          impactPoint
        );
        existingState.impactZoneEntity.ellipse = createWeaponImpactZoneGraphics(
          Cesium,
          weapon
        );
      }
    } else if (existingState.impactZoneEntity) {
      weaponDataSource.entities.remove(existingState.impactZoneEntity);
      existingState.impactZoneEntity = null;
    }

    if (runtimeVisualOptions.showWeaponTrails && impactPoint) {
      const cuePosition = buildCartesianFromPoint(Cesium, {
        ...impactPoint,
        altitudeMeters: Math.max(32, Number(impactPoint.altitudeMeters) || 0),
      });
      if (!existingState.impactCueEntity) {
        existingState.impactCueEntity = weaponDataSource.entities.add({
          id: `terrain-weapon-impact-cue-${weapon.id}`,
          position: cuePosition,
          label: createWeaponImpactCueGraphics(Cesium, weapon),
        });
      } else {
        existingState.impactCueEntity.position = cuePosition;
        existingState.impactCueEntity.label = createWeaponImpactCueGraphics(
          Cesium,
          weapon
        );
      }
    } else if (existingState.impactCueEntity) {
      weaponDataSource.entities.remove(existingState.impactCueEntity);
      existingState.impactCueEntity = null;
    }

    return existingState;
  }

  function removeHiddenWeaponStates(nextVisibleWeaponIds) {
    [...weaponStateById.keys()].forEach((weaponId) => {
      if (nextVisibleWeaponIds.has(weaponId)) {
        return;
      }

      const weaponState = weaponStateById.get(weaponId);
      if (weaponState?.pointEntity) {
        weaponDataSource.entities.remove(weaponState.pointEntity);
      }
      if (weaponState?.trajectoryEntity) {
        weaponDataSource.entities.remove(weaponState.trajectoryEntity);
      }
      if (weaponState?.trailEntity) {
        weaponDataSource.entities.remove(weaponState.trailEntity);
      }
      if (weaponState?.impactZoneEntity) {
        weaponDataSource.entities.remove(weaponState.impactZoneEntity);
      }
      if (weaponState?.impactCueEntity) {
        weaponDataSource.entities.remove(weaponState.impactCueEntity);
      }
      const impactPoint = resolveWeaponImpactPoint(weaponState?.weapon);
      if (impactPoint) {
        const effectProfile = resolveWeaponEffectProfile(weaponState?.weapon);
        spawnImpactEffect(
          `weapon-vanish-${weaponId}-${Math.round(performance.now())}`,
          impactPoint,
          weaponState?.weapon?.sideColor,
          {
            radiusMeters: effectProfile.artilleryLike
              ? 124
              : effectProfile.bulletLike
                ? 40
                : 94,
            shakeIntensity: effectProfile.bulletLike ? 5 : 12,
          }
        );
      }
      weaponStateById.delete(weaponId);
    });
  }

  function renderEventEntities(events) {
    eventDataSource?.entities?.removeAll();

    events.forEach((event, eventIndex) => {
      const anchorPoint = resolveEventAnchorPoint(event);
      if (!anchorPoint) {
        return;
      }

      const impactLike = isImpactLikeEvent(event);
      const launchLike = isLaunchLikeEvent(event);
      const eventId =
        event?.id ?? `${eventIndex}-${Number(event?.timestamp) || 0}`;
      const eventEffectKey = `event-${eventId}`;

      if (
        runtimeVisualOptions.showEventEffects &&
        !triggeredEventEffectIds.has(eventEffectKey) &&
        (impactLike || launchLike)
      ) {
        rememberTriggeredEventEffect(eventEffectKey);
        if (impactLike) {
          spawnImpactEffect(eventEffectKey, anchorPoint, event?.sideColor, {
            radiusMeters: 118,
            shakeIntensity: 9,
            durationMs: WEAPON_IMPACT_EFFECT_MS,
          });
        } else {
          spawnLaunchEffect(eventEffectKey, {
            ...event,
            launchLongitude: anchorPoint.longitude,
            launchLatitude: anchorPoint.latitude,
            launchAltitudeMeters: anchorPoint.altitudeMeters,
          });
        }
      }

      if (runtimeVisualOptions.showEventEffects) {
        const traceWeapon = buildEventTraceWeapon(event);
        const tracePositions = traceWeapon
          ? buildEventTracePositions(Cesium, traceWeapon)
          : [];
        if (traceWeapon && tracePositions.length > 0) {
          const freshness =
            events.length > 1 ? clamp01((eventIndex + 1) / events.length) : 1;
          eventDataSource.entities.add({
            id: `terrain-event-trace-glow-${eventId}`,
            polyline: createEventTraceGlowGraphics(
              Cesium,
              traceWeapon,
              tracePositions,
              freshness
            ),
          });
          eventDataSource.entities.add({
            id: `terrain-event-trace-dash-${eventId}`,
            polyline: createEventTraceDashGraphics(
              Cesium,
              traceWeapon,
              tracePositions,
              freshness
            ),
          });

          const labelPoint = resolveEventTraceLabelPoint(traceWeapon);
          if (labelPoint) {
            eventDataSource.entities.add({
              id: `terrain-event-trace-label-${eventId}`,
              position: buildCartesianFromPoint(Cesium, labelPoint),
              label: createEventTraceLabelGraphics(
                Cesium,
                event,
                traceWeapon,
                freshness
              ),
            });
          }
        }
      }

      eventDataSource.entities.add({
        id: `terrain-event-${eventId}`,
        position: buildCartesianFromPoint(Cesium, {
          ...anchorPoint,
          altitudeMeters: Math.max(12, Number(anchorPoint.altitudeMeters) || 0),
        }),
        point: {
          pixelSize: impactLike ? 15 : launchLike ? 12 : 11,
          color: resolveEventPointColor(Cesium, event),
          outlineColor: Cesium.Color.BLACK.withAlpha(0.72),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: buildEventDescription(event),
      });
    });
  }

  function resolveGroundAbsoluteAltitude(displayPoint) {
    const longitude = Number(displayPoint?.longitude);
    const latitude = Number(displayPoint?.latitude);

    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      !viewer?.scene
    ) {
      return Math.max(0, Number(displayPoint?.altitudeMeters) || 0);
    }

    const cartographic = Cesium.Cartographic.fromDegrees(longitude, latitude);
    let terrainHeight = viewer.scene.globe?.getHeight?.(cartographic);

    if (
      !Number.isFinite(terrainHeight) &&
      viewer.scene.sampleHeightSupported === true
    ) {
      try {
        terrainHeight = viewer.scene.sampleHeight(cartographic);
      } catch (_error) {
        terrainHeight = undefined;
      }
    }

    return Math.max(
      0,
      (Number.isFinite(terrainHeight) ? terrainHeight : 0) +
        Math.max(0, Number(displayPoint?.altitudeMeters) || 0)
    );
  }

  function resolveFocusTargetCartesian(unitState, preset) {
    const longitude = Number(unitState?.displayPoint?.longitude) || 0;
    const latitude = Number(unitState?.displayPoint?.latitude) || 0;
    const baseAltitude = isGroundRenderUnit(unitState?.unit)
      ? resolveGroundAbsoluteAltitude(unitState?.displayPoint)
      : Math.max(0, Number(unitState?.displayPoint?.altitudeMeters) || 0);

    return Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      baseAltitude + Math.max(0, Number(preset?.targetHeightOffsetMeters) || 0)
    );
  }

  function buildFocusCameraView(targetCartesian, preset) {
    const headingRadians = Cesium.Math.toRadians(
      normalizeHeading(preset?.headingDeg || 0)
    );
    const pitchRadians = Cesium.Math.toRadians(Number(preset?.pitchDeg) || -45);
    const rangeMeters = Math.max(24, Number(preset?.rangeMeters) || 120);
    const horizontalRange = rangeMeters * Math.cos(-pitchRadians);
    const localOffset = new Cesium.Cartesian3(
      Math.sin(headingRadians) * horizontalRange,
      Math.cos(headingRadians) * horizontalRange,
      rangeMeters * Math.sin(-pitchRadians)
    );
    const transform =
      Cesium.Transforms.eastNorthUpToFixedFrame(targetCartesian);
    const destination = Cesium.Matrix4.multiplyByPoint(
      transform,
      localOffset,
      new Cesium.Cartesian3()
    );
    const direction = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(
        targetCartesian,
        destination,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );
    const geodeticUp = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(
      destination,
      new Cesium.Cartesian3()
    );
    let right = Cesium.Cartesian3.cross(
      direction,
      geodeticUp,
      new Cesium.Cartesian3()
    );

    if (Cesium.Cartesian3.magnitudeSquared(right) < 1e-6) {
      right = Cesium.Cartesian3.cross(
        direction,
        Cesium.Cartesian3.UNIT_Z,
        new Cesium.Cartesian3()
      );
    }

    right = Cesium.Cartesian3.normalize(right, right);
    const up = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );

    return {
      destination,
      orientation: {
        direction,
        up,
      },
    };
  }

  function triggerImpactShake(intensity = 10, durationMs = 260) {
    if (!runtimeVisualOptions.impactCameraShake) {
      return;
    }

    const targetElement =
      viewer?.container ?? document.getElementById("cesiumContainer");
    if (!targetElement) {
      return;
    }

    if (typeof targetElement.animate === "function") {
      targetElement.animate(
        [
          { transform: "translate3d(0, 0, 0)" },
          {
            transform: `translate3d(${Math.round(intensity * 0.5)}px, ${Math.round(
              intensity * -0.35
            )}px, 0)`,
          },
          {
            transform: `translate3d(${Math.round(intensity * -0.45)}px, ${Math.round(
              intensity * 0.25
            )}px, 0)`,
          },
          {
            transform: `translate3d(${Math.round(intensity * 0.2)}px, ${Math.round(
              intensity * 0.1
            )}px, 0)`,
          },
          { transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: durationMs,
          easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        }
      );
      return;
    }

    targetElement.style.transform = `translate(${Math.round(intensity * 0.3)}px, ${Math.round(
      intensity * -0.2
    )}px)`;
    window.setTimeout(() => {
      targetElement.style.transform = "";
    }, durationMs);
  }

  function focusEventByData(event, options = {}) {
    if (!viewer) {
      return;
    }

    const anchorPoint = resolveEventAnchorPoint(event);
    if (!anchorPoint) {
      return;
    }

    const targetCartesian = buildCartesianFromPoint(Cesium, {
      ...anchorPoint,
      altitudeMeters: Math.max(24, Number(anchorPoint.altitudeMeters) || 0),
    });
    const currentHeadingDeg = Number.isFinite(viewer.camera?.heading)
      ? Cesium.Math.toDegrees(viewer.camera.heading)
      : 136;
    const preset = {
      headingDeg: normalizeHeading(currentHeadingDeg + 18),
      pitchDeg: -34,
      rangeMeters: isImpactLikeEvent(event) ? 240 : 300,
      targetHeightOffsetMeters: isImpactLikeEvent(event) ? 24 : 18,
    };
    const focusView = buildFocusCameraView(targetCartesian, preset);

    viewer.camera.cancelFlight?.();
    viewer.camera.flyTo({
      destination: focusView.destination,
      orientation: focusView.orientation,
      duration: typeof options.duration === "number" ? options.duration : 0.72,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
      maximumHeight: Math.max(
        240,
        Math.max(0, Number(preset.rangeMeters) || 0) * 1.8
      ),
      endTransform: Cesium.Matrix4.IDENTITY,
    });

    if (isImpactLikeEvent(event)) {
      triggerImpactShake(12, 320);
    }
    requestRender();
  }

  function renderAssetDetail(unitState) {
    if (!assetDetail) {
      return;
    }

    if (!unitState) {
      assetDetail.innerHTML = "";
      return;
    }

    const { unit, displayPoint } = unitState;
    assetDetail.innerHTML = [
      `<strong>${escapeHtml(unit?.name ?? "이름 없음")}</strong>`,
      `${escapeHtml(unit?.sideName ?? "세력 없음")} · ${escapeHtml(
        unit?.className ?? unit?.entityType ?? "unknown"
      )}`,
      `표시 좌표 ${escapeHtml(
        Number(displayPoint?.latitude || 0).toFixed(5)
      )}, ${escapeHtml(Number(displayPoint?.longitude || 0).toFixed(5))}`,
      `표시 고도 ${escapeHtml(
        formatMeters(Math.max(0, Number(displayPoint?.altitudeMeters) || 0))
      )} · 방위 ${escapeHtml(
        `${Math.round(normalizeHeading(unit?.headingDeg))}°`
      )}`,
    ].join("<br/>");
  }

  function renderAssetPanel() {
    if (!assetPanel || !assetList) {
      return;
    }

    if (activeUnits.length === 0) {
      setAssetCount("자산 0");
      setAssetHint("");
      renderAssetDetail(null);
      assetList.innerHTML = "";
      return;
    }

    const sortedUnits = [...activeUnits].sort((left, right) =>
      sortPlacementUnitsForPanel(
        {
          ...left.unit,
          focused: left.unit.id === focusedUnitId,
        },
        {
          ...right.unit,
          focused: right.unit.id === focusedUnitId,
        }
      )
    );

    setAssetCount(`자산 ${sortedUnits.length.toLocaleString("ko-KR")}개`);
    setAssetHint("");
    renderAssetDetail(getFocusedUnitState());
    assetList.innerHTML = "";

    sortedUnits.forEach((unitState) => {
      const { unit, displayPoint } = unitState;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "terrain-asset-button";
      if (unit.id === focusedUnitId) {
        button.classList.add("is-active");
      }

      button.innerHTML = `
        <span class="terrain-asset-title">
          <strong>${escapeHtml(truncateText(unit?.name ?? "이름 없음", 28))}</strong>
          <span class="terrain-asset-side">${escapeHtml(
            truncateText(unit?.sideName ?? unit?.sideId ?? "Unknown", 10)
          )}</span>
        </span>
        <span class="terrain-asset-meta">${escapeHtml(
          unit?.className ?? unit?.entityType ?? "unknown"
        )}</span>
        <span class="terrain-asset-coord">${escapeHtml(
          `${Number(displayPoint?.latitude || 0).toFixed(4)}, ${Number(
            displayPoint?.longitude || 0
          ).toFixed(4)}`
        )}</span>
      `;
      button.addEventListener("click", () => {
        focusUnitById(unit.id);
      });
      assetList.appendChild(button);
    });
  }

  function focusUnitById(unitId, options = {}) {
    if (!viewer) {
      return;
    }

    if (focusedUnitId !== unitId) {
      const previousFocusedUnitId = focusedUnitId;
      focusedUnitId = unitId;
      syncFocusedVisuals(previousFocusedUnitId, focusedUnitId);
    } else {
      renderAssetPanel();
    }

    const unitState = unitStateById.get(unitId);
    if (!unitState) {
      return;
    }

    const preset = resolveFocusCameraPreset(
      unitState.unit,
      unitState.model,
      unitState.displayPoint
    );
    const targetCartesian = resolveFocusTargetCartesian(unitState, preset);
    const focusView = buildFocusCameraView(targetCartesian, preset);

    viewer.selectedEntity = unitState.entity ?? undefined;
    viewer.camera.cancelFlight?.();
    viewer.camera.flyTo({
      destination: focusView.destination,
      orientation: focusView.orientation,
      duration: typeof options.duration === "number" ? options.duration : 0.65,
      easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
      maximumHeight: Math.max(
        180,
        Math.max(0, Number(preset?.rangeMeters) || 0) * 1.45
      ),
      endTransform: Cesium.Matrix4.IDENTITY,
    });
    renderAssetPanel();
    renderRuntimeSummary(
      lastSnapshot,
      activeUnits.map((unitState) => unitState.unit),
      [...weaponStateById.values()].map((weaponState) => weaponState.weapon),
      Array.isArray(lastSnapshot?.recentEvents)
        ? lastSnapshot.recentEvents.slice(0, 6)
        : []
    );
    requestRender();
  }

  function resolvePickedPlacementEntity(picked) {
    const candidate =
      picked?.id && typeof picked.id === "object"
        ? picked.id
        : picked?.primitive?.id && typeof picked.primitive.id === "object"
          ? picked.primitive.id
          : null;
    const entityId = typeof candidate?.id === "string" ? candidate.id : null;

    return entityId?.startsWith("terrain-placement-") ? candidate : null;
  }

  function wireSceneInteraction() {
    interactionHandler?.destroy?.();
    interactionHandler = new Cesium.ScreenSpaceEventHandler(
      viewer.scene.canvas
    );
    interactionHandler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.position);
      const entity = resolvePickedPlacementEntity(picked);
      if (!entity || typeof entity.id !== "string") {
        return;
      }

      focusUnitById(entity.id.replace(/^terrain-placement-/, ""), {
        duration: 0.5,
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  function applySnapshot(snapshot) {
    if (!dataSource) {
      pendingSnapshot = snapshot;
      return;
    }

    lastSnapshot = snapshot;
    if (!snapshot || !Array.isArray(snapshot.units)) {
      clearPlacement();
      setPlacementBadge?.("배치 없음");
      return;
    }

    const visibleUnits = snapshot.units.filter((unit) =>
      isPointInsideBounds(unit, placementBounds)
    );
    const visibleWeapons = Array.isArray(snapshot.weapons)
      ? snapshot.weapons.filter((weapon) =>
          isWeaponInsideBounds(weapon, placementBounds)
        )
      : [];
    const visibleEvents = Array.isArray(snapshot.recentEvents)
      ? snapshot.recentEvents
          .filter((event) => isEventInsideBounds(event, placementBounds))
          .slice(-6)
      : [];
    const fallbackEvents =
      visibleEvents.length > 0
        ? visibleEvents
        : Array.isArray(snapshot.recentEvents)
          ? snapshot.recentEvents.slice(-6)
          : [];
    const renderContext = buildUnitRenderContext(visibleUnits);
    const nextFocusedUnitId = visibleUnits.some(
      (unit) => unit.id === focusedUnitId
    )
      ? focusedUnitId
      : visibleUnits.some((unit) => unit.id === snapshot?.selectedUnitId)
        ? snapshot.selectedUnitId
        : null;

    const previousFocusedUnitId = focusedUnitId;
    focusedUnitId = nextFocusedUnitId;
    activeUnits = [];

    const nextVisibleUnitIds = new Set();
    visibleUnits.forEach((unit) => {
      nextVisibleUnitIds.add(unit.id);
      const unitState = upsertUnitState(unit, renderContext);
      if (unitState) {
        activeUnits.push(unitState);
      }
    });
    removeHiddenUnitStates(nextVisibleUnitIds);

    const nextVisibleWeaponIds = new Set();
    visibleWeapons.forEach((weapon) => {
      nextVisibleWeaponIds.add(weapon.id);
      upsertWeaponState(weapon);
    });
    removeHiddenWeaponStates(nextVisibleWeaponIds);
    renderEventEntities(fallbackEvents);
    updateFocusFireImpactBox(snapshot);

    const latestVisibleImpactEvent =
      runtimeVisualOptions.autoTrackImpacts === true
        ? ([...fallbackEvents]
            .filter((event) => isImpactLikeEvent(event))
            .sort(
              (left, right) =>
                (Number(right?.timestamp) || 0) - (Number(left?.timestamp) || 0)
            )[0] ?? null)
        : null;

    if (
      latestVisibleImpactEvent &&
      latestVisibleImpactEvent.id !== lastTrackedImpactEventId
    ) {
      lastTrackedImpactEventId = latestVisibleImpactEvent.id;
      focusEventByData(latestVisibleImpactEvent, { duration: 0.78 });
    }

    if (previousFocusedUnitId !== focusedUnitId) {
      syncFocusedVisuals(previousFocusedUnitId, focusedUnitId);
    }

    setPlacementBadge?.(
      visibleUnits.length > 0 || visibleWeapons.length > 0
        ? `자산 ${visibleUnits.length.toLocaleString("ko-KR")} · 무기 ${visibleWeapons.length.toLocaleString("ko-KR")}`
        : "배치 0개"
    );

    if (visibleUnits.length > 0 || visibleWeapons.length > 0) {
      setStatusMessage?.(
        `선택 bbox 내부 전력을 실시간 반영합니다. 자산 ${visibleUnits.length.toLocaleString(
          "ko-KR"
        )}개, 비행 중 무기 ${visibleWeapons.length.toLocaleString("ko-KR")}개를 표시합니다.`
      );
    } else {
      setStatusMessage?.(
        "선택 bbox 내부 전력이 아직 없습니다. 시뮬레이션이 진행되면 여기에 즉시 반영됩니다."
      );
    }

    renderAssetPanel();
    renderRuntimeSummary(
      snapshot,
      visibleUnits,
      visibleWeapons,
      fallbackEvents
    );
    if (focusedUnitId && unitStateById.has(focusedUnitId)) {
      viewer.selectedEntity =
        unitStateById.get(focusedUnitId)?.entity ?? undefined;
    }
    requestRender();
  }

  function handleMessage(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.type === "terrain3d:command") {
      const commandPayload =
        event.data?.payload && typeof event.data.payload === "object"
          ? event.data.payload
          : null;

      if (commandPayload?.command === "set-visual-options") {
        applyRuntimeVisualOptions(commandPayload.options ?? {});
      }
      if (
        commandPayload?.command === "focus-unit" &&
        typeof commandPayload.unitId === "string"
      ) {
        focusUnitById(commandPayload.unitId, { duration: 0.5 });
      }
      return;
    }

    if (
      event.data?.type !== "terrain3d:placement-snapshot" &&
      event.data?.type !== "terrain3d:runtime-snapshot"
    ) {
      return;
    }

    const snapshot = event.data?.payload ?? null;
    if (!dataSource) {
      pendingSnapshot = snapshot;
      return;
    }

    applySnapshot(snapshot);
  }

  async function attach(viewerInstance) {
    viewer = viewerInstance;
    dataSource = new Cesium.CustomDataSource("terrain-placement");
    weaponDataSource = new Cesium.CustomDataSource("terrain-weapons");
    eventDataSource = new Cesium.CustomDataSource("terrain-events");
    focusFireDataSource = new Cesium.CustomDataSource("terrain-focus-fire");
    effectDataSource = new Cesium.CustomDataSource("terrain-effects");
    await viewer.dataSources.add(dataSource);
    await viewer.dataSources.add(weaponDataSource);
    await viewer.dataSources.add(eventDataSource);
    await viewer.dataSources.add(focusFireDataSource);
    await viewer.dataSources.add(effectDataSource);
    wireSceneInteraction();
    setPlacementBadge?.("배치 대기");
    renderAssetPanel();
    renderRuntimeSummary(null, [], [], []);
    notifyParentReady();

    if (pendingSnapshot) {
      const snapshot = pendingSnapshot;
      pendingSnapshot = null;
      applySnapshot(snapshot);
    }
  }

  return {
    attach,
    applySnapshot,
    clearPlacement,
    handleMessage,
  };
}
