function readFiniteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function resolveTerrainAltitudeSafety({
  craftProfile,
  altitude,
  terrainHeight,
  verticalSpeed = 0,
}) {
  if (!Number.isFinite(altitude) || !Number.isFinite(terrainHeight)) {
    return {
      adjustedAltitude: altitude,
      aboveGround: null,
      shouldCrash: false,
      wasRecovered: false,
    };
  }

  const crashClearance = Math.max(
    0,
    readFiniteNumber(craftProfile?.crashClearance, 0)
  );
  const terrainSafetyFloor = Math.max(
    crashClearance,
    readFiniteNumber(craftProfile?.terrainSafetyFloor, 0)
  );
  const terrainAutoRecoverDepth = Math.max(
    crashClearance,
    readFiniteNumber(
      craftProfile?.terrainAutoRecoverDepth,
      terrainSafetyFloor + crashClearance
    )
  );
  const terrainAutoRecoverMaxSinkRate = readFiniteNumber(
    craftProfile?.terrainAutoRecoverMaxSinkRate,
    0
  );

  let adjustedAltitude = altitude;
  const aboveGround = altitude - terrainHeight;
  const canAutoRecover =
    craftProfile?.mode === "drone" &&
    terrainSafetyFloor > crashClearance &&
    aboveGround < terrainSafetyFloor &&
    aboveGround >= -terrainAutoRecoverDepth &&
    verticalSpeed >= -terrainAutoRecoverMaxSinkRate;

  if (canAutoRecover) {
    adjustedAltitude = terrainHeight + terrainSafetyFloor;
  }

  const adjustedAboveGround = adjustedAltitude - terrainHeight;
  return {
    adjustedAltitude,
    aboveGround: adjustedAboveGround,
    shouldCrash: adjustedAboveGround <= crashClearance,
    wasRecovered: adjustedAltitude !== altitude,
  };
}
