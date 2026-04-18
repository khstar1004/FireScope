import Scenario from "@/game/Scenario";
import PatrolMission from "@/game/mission/PatrolMission";
import StrikeMission from "@/game/mission/StrikeMission";
import Airbase from "@/game/units/Airbase";
import Aircraft from "@/game/units/Aircraft";
import Army from "@/game/units/Army";
import Facility from "@/game/units/Facility";
import Ship from "@/game/units/Ship";
import Weapon from "@/game/units/Weapon";

type ScorableUnit = Aircraft | Ship | Army | Facility | Airbase | Weapon;

export const POINT_VALUES = {
  UNIT_DEFEATS_ENEMY: 50,
  FACILITY_DEFEATS_ENEMY: 30,
  UNIT_DEFEATED: -50,
  FACILITY_OR_AIRBASE_DEFEATED: -70,
  UNIT_OUT_OF_FUEL: -100,
  UNIT_SHOOT_DOWN_WEAPON: 10,
  WEAPON_INEFFECTIVE: -5,
  STRIKE_MISSION_SUCCESS: 200,
  PATROL_MISSION_TICK: 10,
} as const;

export interface ScoreDelta {
  actorDelta: number;
  targetDelta: number;
  netDelta: number;
}

function buildScoreDelta(actorDelta: number, targetDelta: number): ScoreDelta {
  return {
    actorDelta,
    targetDelta,
    netDelta: actorDelta + targetDelta,
  };
}

export function getKillScoreDelta(
  victor: ScorableUnit | null,
  defeated: ScorableUnit
): ScoreDelta {
  let actorDelta = 0;

  if (victor instanceof Facility || victor instanceof Army) {
    actorDelta = POINT_VALUES.FACILITY_DEFEATS_ENEMY;
  } else if (victor && defeated instanceof Weapon) {
    actorDelta = POINT_VALUES.UNIT_SHOOT_DOWN_WEAPON;
  } else if (victor) {
    actorDelta = POINT_VALUES.UNIT_DEFEATS_ENEMY;
  }

  const targetDelta =
    defeated instanceof Facility ||
    defeated instanceof Army ||
    defeated instanceof Airbase
      ? POINT_VALUES.FACILITY_OR_AIRBASE_DEFEATED
      : POINT_VALUES.UNIT_DEFEATED;

  return buildScoreDelta(actorDelta, targetDelta);
}

export function getUnitOutOfFuelScoreDelta() {
  return buildScoreDelta(POINT_VALUES.UNIT_OUT_OF_FUEL, 0);
}

export function getWeaponIneffectiveScoreDelta() {
  return buildScoreDelta(POINT_VALUES.WEAPON_INEFFECTIVE, 0);
}

export function getStrikeMissionSuccessScoreDelta() {
  return buildScoreDelta(POINT_VALUES.STRIKE_MISSION_SUCCESS, 0);
}

export function getPatrolMissionSuccessScoreDelta() {
  return buildScoreDelta(POINT_VALUES.PATROL_MISSION_TICK, 0);
}

export function processKill(
  scenario: Scenario,
  victor: ScorableUnit | null,
  defeated: ScorableUnit
): ScoreDelta {
  const scoreDelta = getKillScoreDelta(victor, defeated);

  if (victor) {
    const victorSide = scenario.getSide(victor.sideId);
    if (victorSide) {
      victorSide.totalScore += scoreDelta.actorDelta;
    }
  }

  const defeatedSide = scenario.getSide(defeated.sideId);
  if (defeatedSide) {
    defeatedSide.totalScore += scoreDelta.targetDelta;
  }

  return scoreDelta;
}

export function processFuelExhaustion(
  scenario: Scenario,
  unit: Aircraft | Ship
): ScoreDelta {
  const scoreDelta = getUnitOutOfFuelScoreDelta();
  const side = scenario.getSide(unit.sideId);
  if (side) {
    side.totalScore += scoreDelta.actorDelta;
  }
  return scoreDelta;
}

export function processWeaponIneffective(
  scenario: Scenario,
  unit: Weapon
): ScoreDelta {
  const scoreDelta = getWeaponIneffectiveScoreDelta();
  const side = scenario.getSide(unit.sideId);
  if (side) {
    side.totalScore += scoreDelta.actorDelta;
  }
  return scoreDelta;
}

export function processStrikeMissionSuccess(
  scenario: Scenario,
  mission: StrikeMission
): ScoreDelta {
  const scoreDelta = getStrikeMissionSuccessScoreDelta();
  const side = scenario.getSide(mission.sideId);
  if (side) {
    side.totalScore += scoreDelta.actorDelta;
  }
  return scoreDelta;
}

export function processPatrolMissionSuccess(
  scenario: Scenario,
  mission: PatrolMission
): ScoreDelta {
  const scoreDelta = getPatrolMissionSuccessScoreDelta();
  const side = scenario.getSide(mission.sideId);
  if (side) {
    side.totalScore += scoreDelta.actorDelta;
  }
  return scoreDelta;
}
