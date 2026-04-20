const DEFAULT_LOD_LEVEL = "balanced";
const DEFAULT_CAMERA_PROFILE = "tactical";
const GROUND_CLUSTER_BUCKET_DEGREES = 0.0012;
const GROUND_CLUSTER_BASE_ALTITUDE_METERS = 2.4;
const GOLDEN_ANGLE_RADIANS = Math.PI * (3 - Math.sqrt(5));

const MODEL_VISIBILITY_POLICY = {
  tactical: {
    cinematic: {
      aircraft: { minimumPixelSize: 20, maximumScale: 220 },
      ship: { minimumPixelSize: 22, maximumScale: 240 },
      ground: { minimumPixelSize: 18, maximumScale: 320 },
    },
    balanced: {
      aircraft: { minimumPixelSize: 16, maximumScale: 180 },
      ship: { minimumPixelSize: 18, maximumScale: 200 },
      ground: { minimumPixelSize: 14, maximumScale: 260 },
    },
    performance: {
      aircraft: { minimumPixelSize: 14, maximumScale: 150 },
      ship: { minimumPixelSize: 16, maximumScale: 170 },
      ground: { minimumPixelSize: 12, maximumScale: 220 },
    },
  },
  chase: {
    cinematic: {
      aircraft: { minimumPixelSize: 12, maximumScale: 68 },
      ship: { minimumPixelSize: 14, maximumScale: 84 },
      ground: { minimumPixelSize: 10, maximumScale: 80 },
    },
    balanced: {
      aircraft: { minimumPixelSize: 10, maximumScale: 60 },
      ship: { minimumPixelSize: 12, maximumScale: 72 },
      ground: { minimumPixelSize: 8, maximumScale: 68 },
    },
    performance: {
      aircraft: { minimumPixelSize: 8, maximumScale: 48 },
      ship: { minimumPixelSize: 10, maximumScale: 56 },
      ground: { minimumPixelSize: 7, maximumScale: 56 },
    },
  },
  orbit: {
    cinematic: {
      aircraft: { minimumPixelSize: 12, maximumScale: 68 },
      ship: { minimumPixelSize: 14, maximumScale: 84 },
      ground: { minimumPixelSize: 10, maximumScale: 80 },
    },
    balanced: {
      aircraft: { minimumPixelSize: 10, maximumScale: 60 },
      ship: { minimumPixelSize: 12, maximumScale: 72 },
      ground: { minimumPixelSize: 8, maximumScale: 68 },
    },
    performance: {
      aircraft: { minimumPixelSize: 8, maximumScale: 48 },
      ship: { minimumPixelSize: 10, maximumScale: 56 },
      ground: { minimumPixelSize: 7, maximumScale: 56 },
    },
  },
  side: {
    cinematic: {
      aircraft: { minimumPixelSize: 12, maximumScale: 68 },
      ship: { minimumPixelSize: 14, maximumScale: 84 },
      ground: { minimumPixelSize: 10, maximumScale: 80 },
    },
    balanced: {
      aircraft: { minimumPixelSize: 10, maximumScale: 60 },
      ship: { minimumPixelSize: 12, maximumScale: 72 },
      ground: { minimumPixelSize: 8, maximumScale: 68 },
    },
    performance: {
      aircraft: { minimumPixelSize: 8, maximumScale: 48 },
      ship: { minimumPixelSize: 10, maximumScale: 56 },
      ground: { minimumPixelSize: 7, maximumScale: 56 },
    },
  },
};

function normalizeLodLevel(lodLevel) {
  return lodLevel === "cinematic" || lodLevel === "performance"
    ? lodLevel
    : DEFAULT_LOD_LEVEL;
}

function normalizeCameraProfile(cameraProfile) {
  return cameraProfile === "side" ||
    cameraProfile === "chase" ||
    cameraProfile === "orbit"
    ? cameraProfile
    : DEFAULT_CAMERA_PROFILE;
}

function resolveModelVisibilityCategory(entityType) {
  if (entityType === "ship") {
    return "ship";
  }

  if (entityType === "aircraft") {
    return "aircraft";
  }

  return "ground";
}

function resolveVisibilityPolicy(entityType, cameraProfile, lodLevel) {
  const normalizedProfile = normalizeCameraProfile(cameraProfile);
  const normalizedLodLevel = normalizeLodLevel(lodLevel);
  const category = resolveModelVisibilityCategory(entityType);

  return MODEL_VISIBILITY_POLICY[normalizedProfile][normalizedLodLevel][category];
}

function resolveEmphasizedModelBoost(entityType, cameraProfile) {
  const normalizedProfile = normalizeCameraProfile(cameraProfile);
  const category = resolveModelVisibilityCategory(entityType);
  if (normalizedProfile === "tactical") {
    return {
      minimumPixelBoost: 6,
      maximumScaleMultiplier: 1.35,
    };
  }

  if (category === "ground") {
    return {
      minimumPixelBoost: 12,
      maximumScaleMultiplier: 1.65,
    };
  }

  if (category === "aircraft") {
    return {
      minimumPixelBoost: 10,
      maximumScaleMultiplier: 1.55,
    };
  }

  return {
    minimumPixelBoost: 8,
    maximumScaleMultiplier: 1.45,
  };
}

function resolveTrackedModelBoost(entityType, cameraProfile) {
  const normalizedProfile = normalizeCameraProfile(cameraProfile);
  const category = resolveModelVisibilityCategory(entityType);

  if (category === "ground") {
    if (normalizedProfile === "chase") {
      return {
        minimumPixelBoost: 10,
        maximumScaleMultiplier: 1.35,
      };
    }

    if (normalizedProfile === "orbit") {
      return {
        minimumPixelBoost: 8,
        maximumScaleMultiplier: 1.22,
      };
    }

    return {
      minimumPixelBoost: 6,
      maximumScaleMultiplier: 1.16,
    };
  }

  if (category === "aircraft") {
    return {
      minimumPixelBoost: normalizedProfile === "chase" ? 6 : 4,
      maximumScaleMultiplier: normalizedProfile === "chase" ? 1.2 : 1.12,
    };
  }

  return {
    minimumPixelBoost: 5,
    maximumScaleMultiplier: normalizedProfile === "chase" ? 1.18 : 1.1,
  };
}

export function isGroundRenderUnit(unit) {
  return (
    unit?.groundUnit === true ||
    unit?.entityType === "facility" ||
    unit?.entityType === "army"
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
    altitudeMeters: Math.max(0, Number(point?.altitudeMeters) || 0) + altitudeMeters,
  };
}

export function buildUnitModelRenderContext(units = []) {
  let groundModelCandidateCount = 0;
  const groundClusters = new Map();

  units.forEach((unit) => {
    if (unit?.entityType === "facility" || unit?.entityType === "army") {
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

export function hasGroundModelBudget(renderContext, facilityModelBudget) {
  const groundModelCandidateCount = Math.max(
    0,
    Number(renderContext?.groundModelCandidateCount) || 0
  );

  return groundModelCandidateCount <= Math.max(0, facilityModelBudget || 0);
}

export function resolveUnitModelRenderProfile(model, unit, options = {}) {
  if (!model) {
    return null;
  }

  const visibilityPolicy = resolveVisibilityPolicy(
    unit?.entityType,
    options.cameraProfile,
    options.lodLevel
  );
  const emphasized = options.emphasized === true;
  const tracked = options.tracked === true;
  const emphasizedBoost = emphasized
    ? resolveEmphasizedModelBoost(unit?.entityType, options.cameraProfile)
    : {
        minimumPixelBoost: 0,
        maximumScaleMultiplier: 1,
      };
  const trackedBoost = tracked
    ? resolveTrackedModelBoost(unit?.entityType, options.cameraProfile)
    : {
        minimumPixelBoost: 0,
        maximumScaleMultiplier: 1,
      };

  return {
    ...model,
    minimumPixelSize: Math.max(
      Number(model.minimumPixelSize) || 0,
      visibilityPolicy.minimumPixelSize +
        emphasizedBoost.minimumPixelBoost +
        trackedBoost.minimumPixelBoost
    ),
    maximumScale: Math.max(
      Number(model.maximumScale) || 1,
      visibilityPolicy.maximumScale *
        emphasizedBoost.maximumScaleMultiplier *
        trackedBoost.maximumScaleMultiplier
    ),
  };
}

export function resolveDisplayedUnitPoint(unit, renderContext) {
  if (!isGroundRenderUnit(unit)) {
    return unit;
  }

  const offset =
    renderContext?.groundOffsetsByUnitId &&
    typeof unit?.id === "string"
      ? renderContext.groundOffsetsByUnitId[unit.id]
      : null;

  if (!offset) {
    return applyEastNorthOffset(unit, 0, 0, GROUND_CLUSTER_BASE_ALTITUDE_METERS);
  }

  return applyEastNorthOffset(
    unit,
    Number(offset.eastMeters) || 0,
    Number(offset.northMeters) || 0,
    Number(offset.altitudeMeters) || GROUND_CLUSTER_BASE_ALTITUDE_METERS
  );
}
