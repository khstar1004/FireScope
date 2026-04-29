import Dba from "@/game/db/Dba";
import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Weapon from "@/game/units/Weapon";
import { SIDE_COLOR } from "@/utils/colors";
import { randomUUID } from "@/utils/generateUUID";

export type RoutePoint = [number, number];

export interface WeaponEntry {
  className: string;
  quantity: number;
}

export interface ScenarioBuilderContext {
  game: Game;
  scenarioName: string;
  usSideId: string;
  iranSideId: string;
}

export interface ScenarioSideConfig {
  usSideId?: string;
  iranSideId?: string;
  usSideName?: string;
  iranSideName?: string;
  usSideColor?: SIDE_COLOR;
  iranSideColor?: SIDE_COLOR;
}

export interface ScenarioPresetDefinition {
  displayName: string;
  name: string;
  regenerateScenarioId?: boolean;
  designIntent?: string;
  assetHighlights?: string[];
  scenario: Record<string, unknown>;
}

export interface AircraftOptions {
  altitude?: number;
  clearWeapons?: boolean;
  heading?: number;
  route?: RoutePoint[];
  weaponLoadout?: WeaponEntry[];
}

export interface FacilityOptions {
  heading?: number;
  range?: number;
  route?: RoutePoint[];
  weaponLoadout?: WeaponEntry[];
}

export interface ShipOptions {
  heading?: number;
  route?: RoutePoint[];
  weaponLoadout?: WeaponEntry[];
}

const AIRBASE_CLASS_NAME = "Airbase";
const dba = new Dba();

// These presets are fictional gameplay extrapolations grounded in public
// reporting on the 2026 Hormuz crisis. Public references used for the design:
// - Reuters via MarketScreener on 2026-03-01: Iranian state media said
//   Supreme Leader Ali Khamenei was dead after U.S.-Israeli strikes.
// - Reuters via Al-Monitor on 2026-04-03: U.S. intelligence assessed Iran was
//   unlikely to ease its Hormuz Strait chokehold soon.
// - U.S. EIA chokepoint analysis: Hormuz remains one of the world's most
//   important energy transit bottlenecks.
// The built-in asset catalog is limited, so several coastal-defense and
// base-defense units below are represented with the closest available proxy.

export function unixTime(dateStringUtc: string) {
  return Math.floor(new Date(dateStringUtc).getTime() / 1000);
}

export function expectDefined<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Missing required scenario value: ${label}`);
  }
  return value;
}

export function getAircraftModel(className: string) {
  return expectDefined(
    dba.getAircraftDb().find((entry) => entry.className === className),
    `aircraft model ${className}`
  );
}

export function getShipModel(className: string) {
  return expectDefined(
    dba.getShipDb().find((entry) => entry.className === className),
    `ship model ${className}`
  );
}

export function getWeaponModel(className: string) {
  return expectDefined(
    dba.getWeaponDb().find((entry) => entry.className === className),
    `weapon model ${className}`
  );
}

export function setSide(context: ScenarioBuilderContext, sideId: string) {
  context.game.currentSideId = sideId;
}

export function createWeaponLoadout(
  context: ScenarioBuilderContext,
  sideId: string,
  entries: WeaponEntry[],
  altitude = 10000
) {
  const sideColor = context.game.currentScenario.getSideColor(sideId);
  return entries.map(({ className, quantity }) => {
    const model = getWeaponModel(className);
    return new Weapon({
      id: randomUUID(),
      launcherId: "None",
      name: className,
      sideId,
      className,
      latitude: 0,
      longitude: 0,
      altitude,
      heading: 90,
      speed: model.speed,
      currentFuel: model.maxFuel,
      maxFuel: model.maxFuel,
      fuelRate: model.fuelRate,
      range: 100,
      route: [],
      sideColor,
      targetId: null,
      lethality: model.lethality,
      maxQuantity: quantity,
      currentQuantity: quantity,
    });
  });
}

export function createScenarioContext(
  scenarioId: string,
  scenarioName: string,
  startTime: number,
  center: [number, number],
  zoom: number,
  duration = 21600,
  sideConfig: ScenarioSideConfig = {}
): ScenarioBuilderContext {
  const usSideId = sideConfig.usSideId ?? "us-side";
  const iranSideId = sideConfig.iranSideId ?? "iran-side";
  const usSideName = sideConfig.usSideName ?? "미국";
  const iranSideName = sideConfig.iranSideName ?? "이란";
  const usSideColor = sideConfig.usSideColor ?? SIDE_COLOR.BLUE;
  const iranSideColor = sideConfig.iranSideColor ?? SIDE_COLOR.RED;
  const scenario = new Scenario({
    id: scenarioId,
    name: scenarioName,
    startTime,
    duration,
    sides: [
      new Side({
        id: usSideId,
        name: usSideName,
        color: usSideColor,
      }),
      new Side({
        id: iranSideId,
        name: iranSideName,
        color: iranSideColor,
      }),
    ],
    relationships: new Relationships({
      hostiles: {
        [usSideId]: [iranSideId],
        [iranSideId]: [usSideId],
      },
      allies: {
        [usSideId]: [],
        [iranSideId]: [],
      },
    }),
  });

  const game = new Game(scenario);
  game.currentSideId = usSideId;
  game.mapView = {
    defaultCenter: center,
    currentCameraCenter: center,
    defaultZoom: zoom,
    currentCameraZoom: zoom,
  };

  return {
    game,
    scenarioName,
    usSideId,
    iranSideId,
  };
}

export function addAirbase(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  latitude: number,
  longitude: number
) {
  setSide(context, sideId);
  return expectDefined(
    context.game.addAirbase(name, AIRBASE_CLASS_NAME, latitude, longitude),
    `${context.scenarioName} airbase ${name}`
  );
}

export function addAircraft(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  className: string,
  latitude: number,
  longitude: number,
  options: AircraftOptions = {}
) {
  setSide(context, sideId);
  const model = getAircraftModel(className);
  const aircraft = expectDefined(
    context.game.addAircraft(
      name,
      className,
      latitude,
      longitude,
      model.speed,
      model.maxFuel,
      model.fuelRate,
      model.range
    ),
    `${context.scenarioName} aircraft ${name}`
  );

  aircraft.altitude = options.altitude ?? aircraft.altitude;
  aircraft.heading = options.heading ?? aircraft.heading;
  aircraft.route = options.route ?? [];

  if (options.clearWeapons) {
    aircraft.weapons = [];
  }
  if (options.weaponLoadout) {
    aircraft.weapons = createWeaponLoadout(
      context,
      sideId,
      options.weaponLoadout,
      aircraft.altitude
    );
  }

  return aircraft;
}

export function addAircraftToAirbase(
  context: ScenarioBuilderContext,
  sideId: string,
  airbaseId: string,
  name: string,
  className: string,
  options: AircraftOptions = {}
) {
  setSide(context, sideId);
  const model = getAircraftModel(className);
  const airbase = expectDefined(
    context.game.currentScenario.getAirbase(airbaseId),
    `${context.scenarioName} airbase ${airbaseId}`
  );

  context.game.addAircraftToAirbase(
    airbase.id,
    className,
    model.speed,
    model.maxFuel,
    model.fuelRate,
    model.range
  );

  const aircraft = expectDefined(
    airbase.aircraft[airbase.aircraft.length - 1],
    `${context.scenarioName} reserve aircraft ${name}`
  );

  aircraft.name = name;
  aircraft.altitude = options.altitude ?? aircraft.altitude;
  aircraft.heading = options.heading ?? aircraft.heading;
  aircraft.route = options.route ?? [];

  if (options.clearWeapons) {
    aircraft.weapons = [];
  }
  if (options.weaponLoadout) {
    aircraft.weapons = createWeaponLoadout(
      context,
      sideId,
      options.weaponLoadout,
      aircraft.altitude
    );
  }

  return aircraft;
}

export function addShip(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  className: string,
  latitude: number,
  longitude: number,
  options: ShipOptions = {}
) {
  setSide(context, sideId);
  const model = getShipModel(className);
  const ship = expectDefined(
    context.game.addShip(
      name,
      className,
      latitude,
      longitude,
      model.speed,
      model.maxFuel,
      model.fuelRate,
      model.range
    ),
    `${context.scenarioName} ship ${name}`
  );

  ship.heading = options.heading ?? ship.heading;
  ship.route = options.route ?? [];

  if (options.weaponLoadout) {
    ship.weapons = createWeaponLoadout(context, sideId, options.weaponLoadout);
  }

  return ship;
}

export function addAircraftToShip(
  context: ScenarioBuilderContext,
  sideId: string,
  shipId: string,
  name: string,
  className: string,
  options: AircraftOptions = {}
) {
  setSide(context, sideId);
  const model = getAircraftModel(className);
  const ship = expectDefined(
    context.game.currentScenario.getShip(shipId),
    `${context.scenarioName} ship ${shipId}`
  );

  context.game.addAircraftToShip(
    ship.id,
    className,
    model.speed,
    model.maxFuel,
    model.fuelRate,
    model.range
  );

  const aircraft = expectDefined(
    ship.aircraft[ship.aircraft.length - 1],
    `${context.scenarioName} reserve ship aircraft ${name}`
  );

  aircraft.name = name;
  aircraft.altitude = options.altitude ?? aircraft.altitude;
  aircraft.heading = options.heading ?? aircraft.heading;
  aircraft.route = options.route ?? [];

  if (options.clearWeapons) {
    aircraft.weapons = [];
  }
  if (options.weaponLoadout) {
    aircraft.weapons = createWeaponLoadout(
      context,
      sideId,
      options.weaponLoadout,
      aircraft.altitude
    );
  }

  return aircraft;
}

export function addFacility(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  className: string,
  latitude: number,
  longitude: number,
  options: FacilityOptions = {}
) {
  setSide(context, sideId);
  const facility = expectDefined(
    context.game.addFacility(
      name,
      className,
      latitude,
      longitude,
      options.range,
      options.heading
    ),
    `${context.scenarioName} facility ${name}`
  );

  facility.route = options.route ?? [];

  if (options.weaponLoadout) {
    facility.weapons = createWeaponLoadout(context, sideId, options.weaponLoadout);
  }

  return facility;
}

export function addReferencePoint(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  latitude: number,
  longitude: number
) {
  setSide(context, sideId);
  return expectDefined(
    context.game.addReferencePoint(name, latitude, longitude),
    `${context.scenarioName} reference point ${name}`
  );
}

export function createPatrolMission(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  unitIds: string[],
  referencePoints: { id: string }[]
) {
  setSide(context, sideId);
  const assignedArea = referencePoints.map((referencePoint) =>
    expectDefined(
      context.game.currentScenario.getReferencePoint(referencePoint.id),
      `${context.scenarioName} patrol point ${referencePoint.id}`
    )
  );
  context.game.createPatrolMission(name, unitIds, assignedArea);
}

export function createStrikeMission(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  unitIds: string[],
  targetIds: string[]
) {
  setSide(context, sideId);
  context.game.createStrikeMission(name, unitIds, targetIds);
}

export function exportScenario(
  context: ScenarioBuilderContext,
  startingSideId = context.usSideId
) {
  context.game.currentSideId = startingSideId;
  context.game.selectedUnitId = "";
  return JSON.parse(context.game.exportCurrentScenario()) as Record<
    string,
    unknown
  >;
}

