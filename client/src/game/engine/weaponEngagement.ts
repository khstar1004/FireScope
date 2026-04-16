import { randomUUID } from "@/utils/generateUUID";
import { NAUTICAL_MILES_TO_METERS } from "@/utils/constants";
import Aircraft from "@/game/units/Aircraft";
import Facility from "@/game/units/Facility";
import Scenario from "@/game/Scenario";
import Weapon from "@/game/units/Weapon";
import {
  getBearingBetweenTwoPoints,
  getDistanceBetweenTwoPoints,
  getNextCoordinates,
  getTerminalCoordinatesFromDistanceAndBearing,
  randomInt,
} from "@/utils/mapFunctions";
import { isTargetInsideSector } from "@/utils/threatCoverage";
import Airbase from "@/game/units/Airbase";
import Ship from "@/game/units/Ship";
import SimulationLogs, {
  SimulationLogType,
  type SimulationLogEntityType,
  type SimulationLogMetadata,
} from "@/game/log/SimulationLogs";
import {
  processKill,
  processWeaponIneffective,
} from "@/game/engine/scoreCalculator";
import ReferencePoint from "@/game/units/ReferencePoint";

export type Target =
  | Aircraft
  | Facility
  | Weapon
  | Airbase
  | Ship
  | ReferencePoint;
type Detector = Facility | Ship | Aircraft;
type LaunchPlatform = Aircraft | Facility | Ship;
type LocatableTarget = {
  latitude: number;
  longitude: number;
};

function getEntityType(
  entity: LaunchPlatform | Target | null | undefined
): SimulationLogEntityType {
  if (entity instanceof Aircraft) {
    return "aircraft";
  }
  if (entity instanceof Facility) {
    return "facility";
  }
  if (entity instanceof Ship) {
    return "ship";
  }
  if (entity instanceof Airbase) {
    return "airbase";
  }
  if (entity instanceof Weapon) {
    return "weapon";
  }
  if (entity instanceof ReferencePoint) {
    return "referencePoint";
  }
  return "unknown";
}

function resolveLauncher(currentScenario: Scenario, weapon: Weapon) {
  return (
    currentScenario.getAircraft(weapon.launcherId) ??
    currentScenario.getFacility(weapon.launcherId) ??
    currentScenario.getShip(weapon.launcherId) ??
    null
  );
}

function buildWeaponLogMetadata(
  currentScenario: Scenario,
  weapon: Weapon,
  target: Target | null,
  metadata: Partial<SimulationLogMetadata> = {}
): SimulationLogMetadata {
  const launcher = resolveLauncher(currentScenario, weapon);

  return {
    actorId: launcher?.id ?? weapon.launcherId,
    actorName: launcher?.name ?? weapon.launcherId,
    actorType: getEntityType(launcher),
    launcherId: weapon.launcherId,
    launcherName: launcher?.name ?? weapon.launcherId,
    launcherType: getEntityType(launcher),
    weaponId: weapon.id,
    weaponName: weapon.name,
    weaponClassName: weapon.className,
    targetId: target?.id ?? weapon.targetId ?? undefined,
    targetName: target?.name,
    targetType: getEntityType(target),
    ...metadata,
  };
}

function buildLaunchLogMetadata(
  origin: LaunchPlatform,
  target: Target,
  launchedWeapon: Weapon,
  launchedWeaponQuantity: number,
  metadata: Partial<SimulationLogMetadata> = {}
): SimulationLogMetadata {
  return {
    actorId: origin.id,
    actorName: origin.name,
    actorType: getEntityType(origin),
    launcherId: origin.id,
    launcherName: origin.name,
    launcherType: getEntityType(origin),
    weaponId: launchedWeapon.id,
    weaponName: launchedWeapon.name,
    weaponClassName: launchedWeapon.className,
    targetId: target.id,
    targetName: target.name,
    targetType: getEntityType(target),
    quantity: launchedWeaponQuantity,
    ...metadata,
  };
}

export function isThreatDetected(
  threat: LocatableTarget,
  detector: Detector
): boolean {
  return isTargetInsideSector(
    detector.latitude,
    detector.longitude,
    threat.latitude,
    threat.longitude,
    detector.getDetectionRange(),
    detector.getDetectionHeading(),
    detector.getDetectionArcDegrees()
  );
}

export function platformCanEngageTarget(
  target: Target,
  platform: Detector,
  weapon?: Weapon
): boolean {
  if (!isThreatDetected(target, platform)) {
    return false;
  }

  if (weapon) {
    return weaponCanEngageTarget(target, weapon);
  }

  return true;
}

export function weaponCanEngageTarget(target: Target, weapon: Weapon) {
  const weaponEngagementRangeNm = weapon.getEngagementRange();
  const distanceToTargetKm = getDistanceBetweenTwoPoints(
    weapon.latitude,
    weapon.longitude,
    target.latitude,
    target.longitude
  );
  const distanceToTargetNm =
    (distanceToTargetKm * 1000) / NAUTICAL_MILES_TO_METERS;
  if (distanceToTargetNm < weaponEngagementRangeNm) {
    return true;
  }
  return false;
}

export function checkTargetTrackedByCount(
  currentScenario: Scenario,
  target: Target
) {
  let count = 0;
  currentScenario.weapons.forEach((weapon) => {
    if (weapon.targetId === target.id) count += 1;
  });
  return count;
}

export function weaponEndgame(
  currentScenario: Scenario,
  weapon: Weapon,
  target: Target,
  simulationLogs: SimulationLogs
): boolean {
  currentScenario.weapons = currentScenario.weapons.filter(
    (currentScenarioWeapon) => currentScenarioWeapon.id !== weapon.id
  );
  if (target instanceof ReferencePoint) {
    simulationLogs.addLog(
      weapon.sideId,
      `${weapon.name}이(가) ${target.name} 지점에 착탄했습니다.`,
      currentScenario.currentTime,
      SimulationLogType.WEAPON_HIT,
      buildWeaponLogMetadata(currentScenario, weapon, target, {
        objectiveId: target.id,
        objectiveName: target.name,
        resultTag: "impact",
      })
    );
    return true;
  }

  const damage = target.applyDamage(weapon.attackPower);
  if (!target.isDestroyed()) {
    simulationLogs.addLog(
      weapon.sideId,
      `${weapon.name}이(가) ${target.name}을(를) 명중해 피해 ${damage.toFixed(
        0
      )}를 입혔습니다. 잔여 HP ${target.currentHp.toFixed(
        0
      )}/${target.maxHp.toFixed(0)}.`,
      currentScenario.currentTime,
      SimulationLogType.WEAPON_HIT,
      buildWeaponLogMetadata(currentScenario, weapon, target, {
        resultTag: "damage",
        damage,
        remainingHp: target.currentHp,
        maxHp: target.maxHp,
      })
    );
    return false;
  }

  const victor = resolveLauncher(currentScenario, weapon);
  const scoreDelta = processKill(currentScenario, victor, target);

  if (target instanceof Aircraft) {
    currentScenario.aircraft = currentScenario.aircraft.filter(
      (currentScenarioAircraft) => currentScenarioAircraft.id !== target.id
    );
  } else if (target instanceof Facility) {
    currentScenario.facilities = currentScenario.facilities.filter(
      (currentScenarioFacility) => currentScenarioFacility.id !== target.id
    );
  } else if (target instanceof Weapon) {
    currentScenario.weapons = currentScenario.weapons.filter(
      (currentScenarioWeapon) => currentScenarioWeapon.id !== target.id
    );
  } else if (target instanceof Airbase) {
    currentScenario.airbases = currentScenario.airbases.filter(
      (currentScenarioAirbase) => currentScenarioAirbase.id !== target.id
    );
  } else if (target instanceof Ship) {
    currentScenario.ships = currentScenario.ships.filter(
      (currentScenarioShip) => currentScenarioShip.id !== target.id
    );
  }
  simulationLogs.addLog(
    weapon.sideId,
    `${weapon.name}이(가) ${target.name}을(를) 명중시켜 파괴했습니다.`,
    currentScenario.currentTime,
    SimulationLogType.WEAPON_HIT,
    buildWeaponLogMetadata(currentScenario, weapon, target, {
      resultTag: "kill",
      damage,
      remainingHp: 0,
      maxHp: target.maxHp,
      actorScoreDelta: scoreDelta.actorDelta,
      targetScoreDelta: scoreDelta.targetDelta,
      scoreNetDelta: scoreDelta.netDelta,
    })
  );
  return true;
}

export function launchWeapon(
  currentScenario: Scenario,
  origin: Aircraft | Facility | Ship,
  target: Target,
  launchedWeapon: Weapon,
  launchedWeaponQuantity: number,
  simulationLogs: SimulationLogs
) {
  if (
    origin.weapons.length === 0 ||
    launchedWeapon.currentQuantity < launchedWeaponQuantity
  )
    return;

  for (let i = 0; i < launchedWeaponQuantity; i++) {
    const nextWeaponCoordinates = getNextCoordinates(
      origin.latitude,
      origin.longitude,
      target.latitude,
      target.longitude,
      launchedWeapon.speed
    );
    const nextWeaponLatitude = nextWeaponCoordinates[0];
    const nextWeaponLongitude = nextWeaponCoordinates[1];
    const newWeapon = new Weapon({
      id: randomUUID(),
      launcherId: origin.id,
      launchLatitude: origin.latitude,
      launchLongitude: origin.longitude,
      launchAltitude: origin.altitude,
      name: `${launchedWeapon.name} #${randomInt(1000)}`,
      sideId: origin.sideId,
      className: launchedWeapon.className,
      latitude: nextWeaponLatitude,
      longitude: nextWeaponLongitude,
      altitude: launchedWeapon.altitude,
      heading: getBearingBetweenTwoPoints(
        nextWeaponLatitude,
        nextWeaponLongitude,
        target.latitude,
        target.longitude
      ),
      speed: launchedWeapon.speed,
      currentFuel: launchedWeapon.currentFuel,
      maxFuel: launchedWeapon.maxFuel,
      fuelRate: launchedWeapon.fuelRate,
      range: launchedWeapon.range,
      route: [[target.latitude, target.longitude]],
      sideColor: launchedWeapon.sideColor,
      targetId: target.id,
      lethality: launchedWeapon.lethality,
      attackPower: launchedWeapon.attackPower,
      maxQuantity: 1,
      currentQuantity: 1,
      maxHp: launchedWeapon.maxHp,
      currentHp: launchedWeapon.maxHp,
      defense: launchedWeapon.defense,
    });
    currentScenario.weapons.push(newWeapon);
  }
  launchedWeapon.currentQuantity -= launchedWeaponQuantity;
  simulationLogs.addLog(
    origin.sideId,
    `${origin.name}이(가) ${target.name}을(를) 향해 ${launchedWeapon.name} ${launchedWeaponQuantity}발을 발사했습니다.`,
    currentScenario.currentTime,
    SimulationLogType.WEAPON_LAUNCHED,
    buildLaunchLogMetadata(
      origin,
      target,
      launchedWeapon,
      launchedWeaponQuantity,
      {
        resultTag: "launch",
      }
    )
  );
  if (launchedWeapon.currentQuantity < 1) {
    origin.weapons = origin.weapons.filter(
      (currentOriginWeapon) => currentOriginWeapon.id !== launchedWeapon.id
    );
    simulationLogs.addLog(
      origin.sideId,
      `${origin.name}의 ${launchedWeapon.name} 재고가 모두 소진되었습니다.`,
      currentScenario.currentTime,
      SimulationLogType.WEAPON_EXPENDED,
      buildLaunchLogMetadata(origin, target, launchedWeapon, 0)
    );
  }
}

export function weaponEngagement(
  currentScenario: Scenario,
  weapon: Weapon,
  simulationLogs: SimulationLogs
) {
  const target =
    currentScenario.getAircraft(weapon.targetId) ??
    currentScenario.getFacility(weapon.targetId) ??
    currentScenario.getWeapon(weapon.targetId) ??
    currentScenario.getShip(weapon.targetId) ??
    currentScenario.getAirbase(weapon.targetId) ??
    currentScenario.getReferencePoint(weapon.targetId);
  if (target) {
    const weaponRoute = weapon.route;
    if (weaponRoute.length > 0) {
      // there is a weird bug where a weapon will be teleported a vast distance if it gets too close to the target but weaponEndgame is not called, current solution is to set threshold to 1 km
      if (
        getDistanceBetweenTwoPoints(
          weapon.latitude,
          weapon.longitude,
          target.latitude,
          target.longitude
        ) < 1
      ) {
        weaponEndgame(currentScenario, weapon, target, simulationLogs);
      } else {
        const nextWeaponCoordinates = getNextCoordinates(
          weapon.latitude,
          weapon.longitude,
          target.latitude,
          target.longitude,
          weapon.speed
        );
        const nextWeaponLatitude = nextWeaponCoordinates[0];
        const nextWeaponLongitude = nextWeaponCoordinates[1];
        weapon.heading = getBearingBetweenTwoPoints(
          nextWeaponLatitude,
          nextWeaponLongitude,
          target.latitude,
          target.longitude
        );
        weapon.latitude = nextWeaponLatitude;
        weapon.longitude = nextWeaponLongitude;
      }
      weapon.currentFuel -= weapon.fuelRate / 3600;
      // if weapon runs out of fuel too
      if (weapon.currentFuel <= 0) {
        // only when weapon fuel run out, the weapon is ineffectively fired, does not apply to target does not exist rn
        const scoreDelta = processWeaponIneffective(currentScenario, weapon);
        currentScenario.weapons = currentScenario.weapons.filter(
          (currentScenarioWeapon) => currentScenarioWeapon.id !== weapon.id
        );
        simulationLogs.addLog(
          weapon.sideId,
          `${weapon.name}의 연료가 소진되어 더 이상 작동하지 않습니다.`,
          currentScenario.currentTime,
          SimulationLogType.WEAPON_CRASHED,
          buildWeaponLogMetadata(currentScenario, weapon, target, {
            resultTag: "fuel_loss",
            actorScoreDelta: scoreDelta.actorDelta,
            scoreNetDelta: scoreDelta.netDelta,
          })
        );
      }
    }
  } else {
    currentScenario.weapons = currentScenario.weapons.filter(
      (currentScenarioWeapon) => currentScenarioWeapon.id !== weapon.id
    );
    simulationLogs.addLog(
      weapon.sideId,
      `${weapon.name}이(가) 표적을 상실해 더 이상 작동하지 않습니다.`,
      currentScenario.currentTime,
      SimulationLogType.WEAPON_CRASHED,
      buildWeaponLogMetadata(currentScenario, weapon, null, {
        resultTag: "target_lost",
      })
    );
  }
}

export function aircraftPursuit(currentScenario: Scenario, aircraft: Aircraft) {
  const target = currentScenario.getAircraft(aircraft.targetId);
  if (!target) {
    aircraft.targetId = "";
    return;
  }
  if (aircraft.weapons.length < 1) return;

  const TRAIL_DISTANCE_NM = 5;
  const trailKm = (TRAIL_DISTANCE_NM * NAUTICAL_MILES_TO_METERS) / 1000;
  const behindBearing = (target.heading + 180) % 360;
  const trailPosition = getTerminalCoordinatesFromDistanceAndBearing(
    target.latitude,
    target.longitude,
    trailKm,
    behindBearing
  );
  const trailLat = trailPosition[0];
  const trailLon = trailPosition[1];

  aircraft.route = [[trailLat, trailLon]];
  aircraft.heading = getBearingBetweenTwoPoints(
    aircraft.latitude,
    aircraft.longitude,
    trailLat,
    trailLon
  );
}

export function routeAircraftToStrikePosition(
  currentScenario: Scenario,
  aircraft: Aircraft,
  targetId: string,
  strikeRadiusNm: number
) {
  const target =
    currentScenario.getFacility(targetId) ||
    currentScenario.getShip(targetId) ||
    currentScenario.getAirbase(targetId) ||
    currentScenario.getAircraft(targetId) ||
    currentScenario.getReferencePoint(targetId);
  if (!target) return;
  if (aircraft.weapons.length < 1) return;

  const bearingBetweenAircraftAndTarget = getBearingBetweenTwoPoints(
    aircraft.latitude,
    aircraft.longitude,
    target.latitude,
    target.longitude
  );
  const bearingBetweenTargetAndAircraft = getBearingBetweenTwoPoints(
    target.latitude,
    target.longitude,
    aircraft.latitude,
    aircraft.longitude
  );
  const strikeLocation = getTerminalCoordinatesFromDistanceAndBearing(
    target.latitude,
    target.longitude,
    (strikeRadiusNm * NAUTICAL_MILES_TO_METERS) / 1000,
    bearingBetweenTargetAndAircraft
  );

  aircraft.route.push([strikeLocation[0], strikeLocation[1]]);
  aircraft.heading = bearingBetweenAircraftAndTarget;
}
