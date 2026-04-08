import Dba from "@/game/db/Dba";
import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Weapon from "@/game/units/Weapon";
import { SIDE_COLOR } from "@/utils/colors";
import { randomUUID } from "@/utils/generateUUID";

type RoutePoint = [number, number];

interface WeaponEntry {
  className: string;
  quantity: number;
}

interface ScenarioBuilderContext {
  game: Game;
  scenarioName: string;
  usSideId: string;
  iranSideId: string;
}

interface ScenarioSideConfig {
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

interface AircraftOptions {
  altitude?: number;
  clearWeapons?: boolean;
  heading?: number;
  route?: RoutePoint[];
  weaponLoadout?: WeaponEntry[];
}

interface FacilityOptions {
  heading?: number;
  range?: number;
  route?: RoutePoint[];
  weaponLoadout?: WeaponEntry[];
}

interface ShipOptions {
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

function unixTime(dateStringUtc: string) {
  return Math.floor(new Date(dateStringUtc).getTime() / 1000);
}

function expectDefined<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Missing required scenario value: ${label}`);
  }
  return value;
}

function getAircraftModel(className: string) {
  return expectDefined(
    dba.getAircraftDb().find((entry) => entry.className === className),
    `aircraft model ${className}`
  );
}

function getShipModel(className: string) {
  return expectDefined(
    dba.getShipDb().find((entry) => entry.className === className),
    `ship model ${className}`
  );
}

function getWeaponModel(className: string) {
  return expectDefined(
    dba.getWeaponDb().find((entry) => entry.className === className),
    `weapon model ${className}`
  );
}

function setSide(context: ScenarioBuilderContext, sideId: string) {
  context.game.currentSideId = sideId;
}

function createWeaponLoadout(
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

function createScenarioContext(
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

function addAirbase(
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

function addAircraft(
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

function addAircraftToAirbase(
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

function addShip(
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

function addAircraftToShip(
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

function addFacility(
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

function addReferencePoint(
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

function createPatrolMission(
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

function createStrikeMission(
  context: ScenarioBuilderContext,
  sideId: string,
  name: string,
  unitIds: string[],
  targetIds: string[]
) {
  setSide(context, sideId);
  context.game.createStrikeMission(name, unitIds, targetIds);
}

function exportScenario(
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

function buildHormuzBlockadeScenario() {
  const context = createScenarioContext(
    "iran-vs-us-hormuz-blockade",
    "이란 vs 미국 - 호르무즈 봉쇄",
    unixTime("2026-03-04T06:00:00Z"),
    [56.55, 26.32],
    7.2
  );

  const khasabBase = addAirbase(
    context,
    context.usSideId,
    "Khasab Forward Strip",
    26.171,
    56.243
  );
  const fujairahBase = addAirbase(
    context,
    context.usSideId,
    "Fujairah Dispersal Strip",
    25.124,
    56.326
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    khasabBase.id,
    "A-10 Close Support Reserve",
    "A-10C Thunderbolt II",
    {
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 4 }],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    khasabBase.id,
    "C-130 Logistics 1",
    "C-130 Hercules",
    {
      clearWeapons: true,
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    fujairahBase.id,
    "F-15 Alert Reserve",
    "F-15 Eagle",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    fujairahBase.id,
    "Huron Relay Reserve",
    "C-12 Huron",
    {
      clearWeapons: true,
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    khasabBase.id,
    "C-17 Logistics 2",
    "C-17 Globemaster III",
    {
      clearWeapons: true,
    }
  );

  const patriot = addFacility(
    context,
    context.usSideId,
    "Khasab Patriot Battery",
    "MIM-104 Patriot",
    26.176,
    56.248,
    {
      heading: 350,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Fujairah THAAD Site",
    "THAAD",
    25.182,
    56.334,
    {
      heading: 330,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Khasab NASAMS (Proxy)",
    "NASAMS",
    26.165,
    56.268,
    {
      heading: 350,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Airfield Security APC",
    "M113A1",
    26.164,
    56.238
  );
  addFacility(
    context,
    context.usSideId,
    "Forward Command Vehicle",
    "M577 Command Vehicle",
    26.18,
    56.234
  );
  addFacility(
    context,
    context.usSideId,
    "Perimeter QRF Platoon",
    "KM900 APC",
    26.19,
    56.261
  );
  addFacility(
    context,
    context.usSideId,
    "Musandam Armor Detachment",
    "K2 Black Panther",
    26.158,
    56.256
  );

  const carrier = addShip(
    context,
    context.usSideId,
    "USS Theodore Roosevelt",
    "Aircraft Carrier",
    26.1,
    57.35,
    {
      heading: 78,
      route: [
        [26.02, 57.65],
        [25.96, 57.92],
      ],
    }
  );
  const destroyer = addShip(
    context,
    context.usSideId,
    "USS Arleigh Burke",
    "Destroyer",
    26.06,
    57.14,
    {
      heading: 88,
      route: [
        [26.04, 57.42],
        [25.98, 57.7],
      ],
    }
  );
  const frigate = addShip(
    context,
    context.usSideId,
    "USS Gulf Screen",
    "Frigate",
    25.92,
    57.28,
    {
      heading: 74,
      route: [
        [25.86, 57.52],
        [25.8, 57.78],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "USS Bataan",
    "Amphibious Assault Ship",
    25.78,
    56.88,
    {
      heading: 58,
      route: [
        [25.72, 57.12],
        [25.68, 57.34],
      ],
    }
  );

  addAircraftToShip(
    context,
    context.usSideId,
    carrier.id,
    "Hornet Reserve 201",
    "F/A-18 Hornet",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-84 Harpoon", quantity: 2 },
      ],
    }
  );
  addAircraftToShip(
    context,
    context.usSideId,
    carrier.id,
    "Hornet Reserve 202",
    "F/A-18 Hornet",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-84 Harpoon", quantity: 2 },
      ],
    }
  );

  const hornetCap = addAircraft(
    context,
    context.usSideId,
    "Hornet CAP 11",
    "F/A-18 Hornet",
    26.18,
    57.08,
    {
      altitude: 24000,
      heading: 35,
      route: [
        [26.28, 57.34],
        [26.42, 57.58],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-84 Harpoon", quantity: 2 },
      ],
    }
  );
  const raptorCap = addAircraft(
    context,
    context.usSideId,
    "Raptor CAP 01",
    "F-22 Raptor",
    26.42,
    57.55,
    {
      altitude: 32000,
      heading: 255,
      route: [
        [26.46, 57.22],
        [26.26, 57.04],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const lightningSead = addAircraft(
    context,
    context.usSideId,
    "Lightning SEAD 31",
    "F-35A Lightning II",
    25.96,
    57.62,
    {
      altitude: 28000,
      heading: 300,
      route: [
        [26.18, 57.22],
        [26.46, 56.58],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AGM-158 JASSM", quantity: 2 },
      ],
    }
  );
  const reaperScout = addAircraft(
    context,
    context.usSideId,
    "Reaper Scout 51",
    "MQ-9 Reaper",
    26.75,
    56.95,
    {
      altitude: 18000,
      heading: 255,
      route: [
        [26.72, 56.64],
        [26.58, 56.18],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "Texaco 61",
    "KC-135R Stratotanker",
    25.88,
    56.65,
    {
      altitude: 30000,
      heading: 90,
      route: [
        [25.9, 56.95],
        [25.92, 56.45],
      ],
      clearWeapons: true,
    }
  );
  const lancerStrike = addAircraft(
    context,
    context.usSideId,
    "Lancer 71",
    "B-1B Lancer",
    25.34,
    58.34,
    {
      altitude: 34000,
      heading: 275,
      route: [
        [25.86, 57.88],
        [26.24, 57.22],
      ],
      weaponLoadout: [{ className: "AGM-158 JASSM", quantity: 6 }],
    }
  );

  const bandarAbbas = addAirbase(
    context,
    context.iranSideId,
    "Bandar Abbas Air Base",
    27.218,
    56.377
  );
  const jaskBase = addAirbase(
    context,
    context.iranSideId,
    "Jask Air Base",
    25.651,
    57.775
  );
  const qeshmStrip = addAirbase(
    context,
    context.iranSideId,
    "Qeshm UAV Strip",
    26.936,
    56.118
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bandarAbbas.id,
    "Tomcat Reserve 201",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bandarAbbas.id,
    "Tomcat Reserve 202",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bandarAbbas.id,
    "Phantom Reserve 301",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    jaskBase.id,
    "Phantom Reserve 302",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    qeshmStrip.id,
    "Recon Drone Reserve 303",
    "MQ-9 Reaper",
    {
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const s300 = addFacility(
    context,
    context.iranSideId,
    "Bandar Abbas Long-Range SAM",
    "S-300V4",
    27.189,
    56.278,
    {
      heading: 190,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Qeshm Point Defense",
    "Pantsir-S1",
    26.952,
    56.289,
    {
      heading: 170,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Larak Short-Range SAM",
    "Tor-M2",
    26.862,
    56.366,
    {
      heading: 205,
    }
  );
  const qeshmLauncher = addFacility(
    context,
    context.iranSideId,
    "Qeshm Anti-Ship Battery",
    "Tactical Surface to Surface Missile Launcher",
    26.936,
    56.149,
    {
      heading: 150,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Abu Musa Rocket Group",
    "Chunmoo MRLS",
    25.874,
    55.055,
    {
      heading: 65,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Qeshm Armor Troop (Proxy)",
    "K2 Black Panther",
    26.724,
    55.949
  );
  addFacility(
    context,
    context.iranSideId,
    "Larak Security Platoon (Proxy)",
    "KM900 APC",
    26.878,
    56.404
  );
  addFacility(
    context,
    context.iranSideId,
    "Qeshm Command Node (Proxy)",
    "M577 Command Vehicle",
    26.832,
    56.241
  );

  const fastBoat1 = addShip(
    context,
    context.iranSideId,
    "IRGC Fast Boat 1",
    "Patrol Boat",
    26.601,
    56.338,
    {
      heading: 245,
      route: [
        [26.49, 56.17],
        [26.34, 56.01],
      ],
    }
  );
  addShip(
    context,
    context.iranSideId,
    "IRGC Fast Boat 2",
    "Patrol Boat",
    26.502,
    56.182,
    {
      heading: 230,
      route: [
        [26.32, 55.98],
        [26.08, 55.82],
      ],
    }
  );
  addShip(
    context,
    context.iranSideId,
    "IRIN Corvette 1",
    "Corvette",
    26.779,
    56.182,
    {
      heading: 210,
      route: [
        [26.52, 56.06],
        [26.25, 55.92],
      ],
    }
  );
  const iranDestroyer = addShip(
    context,
    context.iranSideId,
    "IRIN Destroyer 1",
    "Destroyer",
    26.389,
    56.853,
    {
      heading: 118,
      route: [
        [26.28, 57.1],
        [26.16, 57.42],
      ],
    }
  );

  const tomcatIntercept = addAircraft(
    context,
    context.iranSideId,
    "Tomcat Intercept 21",
    "F-14 Tomcat",
    26.884,
    56.702,
    {
      altitude: 30000,
      heading: 120,
      route: [
        [26.72, 56.94],
        [26.44, 57.16],
      ],
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const phantomStrike = addAircraft(
    context,
    context.iranSideId,
    "Phantom Strike 41",
    "F-4 Phantom II",
    26.456,
    56.083,
    {
      altitude: 22000,
      heading: 145,
      route: [
        [26.2, 56.52],
        [26.06, 56.96],
      ],
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );

  const usCapBox = [
    addReferencePoint(context, context.usSideId, "US CAP RP-1", 26.48, 57.14),
    addReferencePoint(context, context.usSideId, "US CAP RP-2", 26.62, 57.54),
    addReferencePoint(context, context.usSideId, "US CAP RP-3", 26.24, 57.78),
    addReferencePoint(context, context.usSideId, "US CAP RP-4", 26.04, 57.3),
  ];
  createPatrolMission(
    context,
    context.usSideId,
    "미국 CAP - 해협 입구 방공",
    [raptorCap.id, hornetCap.id],
    usCapBox
  );
  createStrikeMission(
    context,
    context.usSideId,
    "미국 타격 - 해협 재개방",
    [lightningSead.id, lancerStrike.id, reaperScout.id],
    [s300.id, qeshmLauncher.id, iranDestroyer.id, fastBoat1.id]
  );

  const iranCapBox = [
    addReferencePoint(context, context.iranSideId, "IR CAP RP-1", 26.92, 56.22),
    addReferencePoint(context, context.iranSideId, "IR CAP RP-2", 27.08, 56.62),
    addReferencePoint(context, context.iranSideId, "IR CAP RP-3", 26.82, 56.94),
    addReferencePoint(context, context.iranSideId, "IR CAP RP-4", 26.58, 56.48),
  ];
  createPatrolMission(
    context,
    context.iranSideId,
    "이란 CAP - 케심 차단선",
    [tomcatIntercept.id],
    iranCapBox
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "이란 타격 - 해협 돌파 저지",
    [phantomStrike.id, tomcatIntercept.id],
    [carrier.id, destroyer.id, patriot.id, frigate.id]
  );

  return exportScenario(context);
}

function buildBandarAbbasSortieScenario() {
  const context = createScenarioContext(
    "iran-vs-us-bandar-abbas-sortie",
    "이란 vs 미국 - 반다르아바스 출격",
    unixTime("2026-03-06T05:30:00Z"),
    [56.3, 26.95],
    7.05
  );

  const fujairahBase = addAirbase(
    context,
    context.usSideId,
    "Fujairah Expeditionary Base",
    25.124,
    56.326
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    fujairahBase.id,
    "F-15 Reserve 401",
    "F-15 Eagle",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    fujairahBase.id,
    "F-16 Reserve 402",
    "F-16 Fighting Falcon",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    fujairahBase.id,
    "A-10 Reserve 403",
    "A-10C Thunderbolt II",
    {
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 4 }],
    }
  );

  addFacility(
    context,
    context.usSideId,
    "Fujairah Patriot Battery",
    "MIM-104 Patriot",
    25.135,
    56.31,
    {
      heading: 330,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Mountain THAAD Position",
    "THAAD",
    25.184,
    56.405,
    {
      heading: 320,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Fujairah NASAMS (Proxy)",
    "NASAMS",
    25.112,
    56.348,
    {
      heading: 320,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Harbor Security APC",
    "M113A1",
    25.127,
    56.289
  );
  addFacility(
    context,
    context.usSideId,
    "Harbor Command Vehicle",
    "M577 Command Vehicle",
    25.102,
    56.306
  );

  const usDestroyer = addShip(
    context,
    context.usSideId,
    "USS Porter",
    "Destroyer",
    25.672,
    57.046,
    {
      heading: 290,
      route: [
        [25.82, 56.72],
        [26.02, 56.36],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "USS Curts",
    "Frigate",
    25.571,
    56.806,
    {
      heading: 300,
      route: [
        [25.74, 56.52],
        [25.96, 56.18],
      ],
    }
  );

  const spiritStrike = addAircraft(
    context,
    context.usSideId,
    "Spirit 81",
    "B-2 Spirit",
    25.082,
    57.842,
    {
      altitude: 36000,
      heading: 310,
      route: [
        [25.72, 57.22],
        [26.34, 56.48],
      ],
      weaponLoadout: [{ className: "AGM-158 JASSM", quantity: 4 }],
    }
  );
  const buffStrike = addAircraft(
    context,
    context.usSideId,
    "Buff 91",
    "B-52 Stratofortress",
    25.406,
    57.992,
    {
      altitude: 33000,
      heading: 295,
      route: [
        [25.98, 57.32],
        [26.58, 56.62],
      ],
      weaponLoadout: [{ className: "AGM-86 ALCM", quantity: 6 }],
    }
  );
  const f35Lead = addAircraft(
    context,
    context.usSideId,
    "Lightning Strike 11",
    "F-35A Lightning II",
    25.476,
    57.26,
    {
      altitude: 29000,
      heading: 320,
      route: [
        [25.88, 56.98],
        [26.4, 56.45],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AGM-158 JASSM", quantity: 2 },
      ],
    }
  );
  const f35Wing = addAircraft(
    context,
    context.usSideId,
    "Lightning Strike 12",
    "F-35A Lightning II",
    25.332,
    57.108,
    {
      altitude: 29000,
      heading: 325,
      route: [
        [25.78, 56.86],
        [26.28, 56.34],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AGM-158 JASSM", quantity: 2 },
      ],
    }
  );
  const f22Escort = addAircraft(
    context,
    context.usSideId,
    "Raptor Escort 13",
    "F-22 Raptor",
    25.824,
    57.502,
    {
      altitude: 32000,
      heading: 300,
      route: [
        [26.1, 57.16],
        [26.36, 56.86],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const reaper = addAircraft(
    context,
    context.usSideId,
    "Reaper ISR 15",
    "MQ-9 Reaper",
    26.126,
    56.972,
    {
      altitude: 18000,
      heading: 310,
      route: [
        [26.34, 56.74],
        [26.66, 56.54],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "Huron Recon 17",
    "C-12 Huron",
    25.464,
    56.932,
    {
      altitude: 16000,
      heading: 355,
      route: [
        [25.7, 56.86],
        [26.06, 56.72],
      ],
      clearWeapons: true,
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "Texaco 19",
    "KC-135R Stratotanker",
    25.226,
    56.726,
    {
      altitude: 30000,
      heading: 95,
      route: [
        [25.18, 57.06],
        [25.16, 56.46],
      ],
      clearWeapons: true,
    }
  );

  const bandarAbbas = addAirbase(
    context,
    context.iranSideId,
    "Bandar Abbas Air Base",
    27.218,
    56.377
  );
  const bushehrAux = addAirbase(
    context,
    context.iranSideId,
    "Havadarya Auxiliary Strip",
    27.102,
    56.162
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bandarAbbas.id,
    "Tomcat Reserve 501",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bandarAbbas.id,
    "Phantom Reserve 502",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bushehrAux.id,
    "Phantom Reserve 503",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );

  const hq9 = addFacility(
    context,
    context.iranSideId,
    "Bandar Abbas Long-Range SAM (Proxy)",
    "HQ-9",
    27.178,
    56.33,
    {
      heading: 195,
    }
  );
  const hq16 = addFacility(
    context,
    context.iranSideId,
    "Bandar Abbas Medium SAM (Proxy)",
    "HQ-16",
    27.086,
    56.284,
    {
      heading: 190,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Bandar Abbas Point Defense",
    "Pantsir-S1",
    27.142,
    56.392,
    {
      heading: 180,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Harbor Tor Site",
    "Tor-M2",
    27.124,
    56.241,
    {
      heading: 205,
    }
  );
  const tacticalLauncher = addFacility(
    context,
    context.iranSideId,
    "Bandar Abbas Missile Group",
    "Tactical Surface to Surface Missile Launcher",
    26.944,
    56.128,
    {
      heading: 168,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Qeshm Rocket Battery",
    "Chunmoo MRLS",
    26.858,
    56.074,
    {
      heading: 165,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Base Security Armor (Proxy)",
    "K2 Black Panther",
    27.201,
    56.452
  );
  addFacility(
    context,
    context.iranSideId,
    "Harbor APC Screen (Proxy)",
    "KM900 APC",
    27.045,
    56.419
  );
  addFacility(
    context,
    context.iranSideId,
    "Command Vehicle (Proxy)",
    "M577 Command Vehicle",
    27.024,
    56.233
  );

  const iranFrigate = addShip(
    context,
    context.iranSideId,
    "IRIN Frigate 12",
    "Frigate",
    26.784,
    56.438,
    {
      heading: 150,
      route: [
        [26.58, 56.6],
        [26.28, 56.88],
      ],
    }
  );
  addShip(
    context,
    context.iranSideId,
    "IRIN Corvette 13",
    "Corvette",
    26.742,
    56.246,
    {
      heading: 180,
      route: [
        [26.46, 56.22],
        [26.22, 56.2],
      ],
    }
  );
  const patrolBoat = addShip(
    context,
    context.iranSideId,
    "IRGC Fast Boat 14",
    "Patrol Boat",
    26.62,
    56.566,
    {
      heading: 155,
      route: [
        [26.42, 56.72],
        [26.24, 56.88],
      ],
    }
  );

  const iranTomcat = addAircraft(
    context,
    context.iranSideId,
    "Tomcat CAP 31",
    "F-14 Tomcat",
    26.964,
    56.802,
    {
      altitude: 29000,
      heading: 135,
      route: [
        [26.72, 57.04],
        [26.42, 57.22],
      ],
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const iranPhantom = addAircraft(
    context,
    context.iranSideId,
    "Phantom Strike 32",
    "F-4 Phantom II",
    26.662,
    56.304,
    {
      altitude: 22000,
      heading: 160,
      route: [
        [26.36, 56.64],
        [25.94, 57.04],
      ],
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );

  const usPatrolBox = [
    addReferencePoint(context, context.usSideId, "US Strike RP-1", 25.96, 57.06),
    addReferencePoint(context, context.usSideId, "US Strike RP-2", 26.34, 56.72),
    addReferencePoint(context, context.usSideId, "US Strike RP-3", 26.54, 56.34),
    addReferencePoint(context, context.usSideId, "US Strike RP-4", 26.18, 56.12),
  ];
  createPatrolMission(
    context,
    context.usSideId,
    "미국 CAP - 반다르아바스 동측",
    [f22Escort.id, f35Lead.id],
    usPatrolBox
  );
  createStrikeMission(
    context,
    context.usSideId,
    "미국 타격 - 항만 방공 억제",
    [spiritStrike.id, buffStrike.id, f35Lead.id, f35Wing.id, reaper.id],
    [hq9.id, hq16.id, tacticalLauncher.id, iranFrigate.id, patrolBoat.id]
  );

  const iranPatrolBox = [
    addReferencePoint(context, context.iranSideId, "IR Patrol RP-1", 27.06, 56.36),
    addReferencePoint(context, context.iranSideId, "IR Patrol RP-2", 27.16, 56.86),
    addReferencePoint(context, context.iranSideId, "IR Patrol RP-3", 26.88, 57.08),
    addReferencePoint(context, context.iranSideId, "IR Patrol RP-4", 26.72, 56.54),
  ];
  createPatrolMission(
    context,
    context.iranSideId,
    "이란 CAP - 반다르아바스 북문",
    [iranTomcat.id],
    iranPatrolBox
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "이란 타격 - 후자이라 원정기지 압박",
    [iranPhantom.id, iranTomcat.id],
    [usDestroyer.id, fujairahBase.id]
  );

  return exportScenario(context);
}

function buildAlUdeidCounterstrikeScenario() {
  const context = createScenarioContext(
    "iran-vs-us-al-udeid-counterstrike",
    "이란 vs 미국 - 알우데이드 반격",
    unixTime("2026-03-08T03:00:00Z"),
    [52.62, 25.52],
    6.65
  );

  const alUdeid = addAirbase(
    context,
    context.usSideId,
    "Al Udeid Air Base",
    25.117,
    51.315
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    alUdeid.id,
    "C-17 Evac Lift 1",
    "C-17 Globemaster III",
    {
      clearWeapons: true,
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    alUdeid.id,
    "C-130 Evac Lift 2",
    "C-130 Hercules",
    {
      clearWeapons: true,
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    alUdeid.id,
    "F-15 Ready 3",
    "F-15 Eagle",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );

  const patriot = addFacility(
    context,
    context.usSideId,
    "Al Udeid Patriot Battery",
    "MIM-104 Patriot",
    25.106,
    51.294,
    {
      heading: 15,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Al Udeid THAAD Battery",
    "THAAD",
    25.084,
    51.356,
    {
      heading: 20,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Doha NASAMS (Proxy)",
    "NASAMS",
    25.326,
    51.498,
    {
      heading: 30,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Runway Point Defense (Proxy)",
    "Biho Hybrid",
    25.121,
    51.341,
    {
      heading: 0,
    }
  );
  addFacility(
    context,
    context.usSideId,
    "Base Security APC",
    "M113A1",
    25.112,
    51.272
  );
  addFacility(
    context,
    context.usSideId,
    "QRF Motor Pool",
    "KM900 APC",
    25.132,
    51.256
  );
  addFacility(
    context,
    context.usSideId,
    "Airbase Command Vehicle",
    "M577 Command Vehicle",
    25.098,
    51.332
  );

  const carrier = addShip(
    context,
    context.usSideId,
    "USS Enterprise",
    "Aircraft Carrier",
    25.62,
    52.44,
    {
      heading: 108,
      route: [
        [25.48, 52.72],
        [25.28, 52.96],
      ],
    }
  );
  const destroyer = addShip(
    context,
    context.usSideId,
    "USS Mason",
    "Destroyer",
    25.76,
    52.26,
    {
      heading: 102,
      route: [
        [25.56, 52.54],
        [25.34, 52.8],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "USS Gulf Patrol",
    "Patrol Boat",
    25.42,
    52.08,
    {
      heading: 96,
      route: [
        [25.24, 52.28],
        [25.08, 52.52],
      ],
    }
  );

  addAircraftToShip(
    context,
    context.usSideId,
    carrier.id,
    "Hornet Reserve 601",
    "F/A-18 Hornet",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-84 Harpoon", quantity: 2 },
      ],
    }
  );
  addAircraftToShip(
    context,
    context.usSideId,
    carrier.id,
    "Hornet Reserve 602",
    "F/A-18 Hornet",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-84 Harpoon", quantity: 2 },
      ],
    }
  );

  const falcon = addAircraft(
    context,
    context.usSideId,
    "Falcon CAP 61",
    "F-16 Fighting Falcon",
    25.48,
    52.18,
    {
      altitude: 26000,
      heading: 70,
      route: [
        [25.58, 52.46],
        [25.66, 52.74],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const raptor = addAircraft(
    context,
    context.usSideId,
    "Raptor CAP 62",
    "F-22 Raptor",
    25.82,
    52.64,
    {
      altitude: 32000,
      heading: 60,
      route: [
        [25.94, 52.92],
        [25.96, 53.18],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const reaper = addAircraft(
    context,
    context.usSideId,
    "Reaper Track 63",
    "MQ-9 Reaper",
    25.66,
    51.94,
    {
      altitude: 17000,
      heading: 40,
      route: [
        [25.96, 52.26],
        [26.18, 52.62],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "Texaco 64",
    "KC-135R Stratotanker",
    24.92,
    52.02,
    {
      altitude: 29000,
      heading: 92,
      route: [
        [24.96, 52.32],
        [24.98, 51.72],
      ],
      clearWeapons: true,
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "Huron Recon 65",
    "C-12 Huron",
    25.28,
    51.78,
    {
      altitude: 15000,
      heading: 40,
      route: [
        [25.52, 52.08],
        [25.76, 52.42],
      ],
      clearWeapons: true,
    }
  );

  const bushehr = addAirbase(
    context,
    context.iranSideId,
    "Bushehr Air Base",
    28.944,
    50.834
  );
  const asaluyeh = addAirbase(
    context,
    context.iranSideId,
    "Asaluyeh Forward Strip",
    27.483,
    52.615
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bushehr.id,
    "Tomcat Reserve 701",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    asaluyeh.id,
    "Phantom Reserve 702",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );

  const hq9 = addFacility(
    context,
    context.iranSideId,
    "Asaluyeh Long-Range SAM (Proxy)",
    "HQ-9",
    27.392,
    52.704,
    {
      heading: 170,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Asaluyeh Medium SAM (Proxy)",
    "HQ-16",
    27.436,
    52.544,
    {
      heading: 165,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "South Coast Point Defense",
    "Pantsir-S1",
    27.504,
    52.462,
    {
      heading: 170,
    }
  );
  const tacticalLauncher = addFacility(
    context,
    context.iranSideId,
    "South Coast Missile Brigade",
    "Tactical Surface to Surface Missile Launcher",
    27.286,
    52.612,
    {
      heading: 160,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "South Coast Rocket Brigade",
    "Chunmoo MRLS",
    27.242,
    52.492,
    {
      heading: 160,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "Coastal Armor Group (Proxy)",
    "K2 Black Panther",
    27.328,
    52.71
  );
  addFacility(
    context,
    context.iranSideId,
    "Harbor APC Group (Proxy)",
    "KM900 APC",
    27.39,
    52.8
  );

  const iranCorvette = addShip(
    context,
    context.iranSideId,
    "IRIN Corvette 21",
    "Corvette",
    26.52,
    52.28,
    {
      heading: 202,
      route: [
        [26.24, 52.18],
        [25.94, 52.12],
      ],
    }
  );
  const iranPatrol = addShip(
    context,
    context.iranSideId,
    "IRGC Fast Boat 22",
    "Patrol Boat",
    26.32,
    52.14,
    {
      heading: 214,
      route: [
        [26.02, 52.04],
        [25.72, 51.96],
      ],
    }
  );

  const iranTomcat = addAircraft(
    context,
    context.iranSideId,
    "Tomcat Intercept 71",
    "F-14 Tomcat",
    26.78,
    52.84,
    {
      altitude: 30000,
      heading: 198,
      route: [
        [26.48, 52.56],
        [26.18, 52.28],
      ],
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const iranPhantom = addAircraft(
    context,
    context.iranSideId,
    "Phantom Strike 72",
    "F-4 Phantom II",
    26.24,
    52.56,
    {
      altitude: 22000,
      heading: 215,
      route: [
        [25.92, 52.22],
        [25.56, 51.88],
      ],
      weaponLoadout: [
        { className: "AGM-65 Maverick", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );

  const usPatrolBox = [
    addReferencePoint(context, context.usSideId, "US Gulf RP-1", 25.72, 52.18),
    addReferencePoint(context, context.usSideId, "US Gulf RP-2", 25.94, 52.64),
    addReferencePoint(context, context.usSideId, "US Gulf RP-3", 25.66, 53.02),
    addReferencePoint(context, context.usSideId, "US Gulf RP-4", 25.36, 52.56),
  ];
  createPatrolMission(
    context,
    context.usSideId,
    "미국 CAP - 알우데이드 북동부",
    [falcon.id, raptor.id],
    usPatrolBox
  );
  createStrikeMission(
    context,
    context.usSideId,
    "미국 타격 - 남부 해안 미사일대",
    [falcon.id, reaper.id],
    [tacticalLauncher.id, iranCorvette.id, iranPatrol.id]
  );

  const iranPatrolBox = [
    addReferencePoint(context, context.iranSideId, "IR Gulf RP-1", 26.74, 52.42),
    addReferencePoint(context, context.iranSideId, "IR Gulf RP-2", 26.96, 52.88),
    addReferencePoint(context, context.iranSideId, "IR Gulf RP-3", 26.64, 53.04),
    addReferencePoint(context, context.iranSideId, "IR Gulf RP-4", 26.36, 52.66),
  ];
  createPatrolMission(
    context,
    context.iranSideId,
    "이란 CAP - 카타르 접근 축",
    [iranTomcat.id],
    iranPatrolBox
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "이란 타격 - 알우데이드 반격",
    [iranPhantom.id, iranTomcat.id],
    [alUdeid.id, patriot.id, destroyer.id, carrier.id, hq9.id]
  );

  return exportScenario(context);
}

function buildAbuMusaLandingScenario() {
  const context = createScenarioContext(
    "iran-vs-us-abu-musa-landing",
    "이란 vs 미국 - 아부무사 상륙전",
    unixTime("2026-03-10T04:00:00Z"),
    [55.03, 25.88],
    8.1,
    28800
  );

  const khasab = addAirbase(
    context,
    context.usSideId,
    "Khasab Staging Strip",
    26.171,
    56.243
  );
  const beachhead = addAirbase(
    context,
    context.usSideId,
    "Abu Musa Beachhead Strip",
    25.882,
    55.03
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    khasab.id,
    "Falcon Reserve 201",
    "F-16 Fighting Falcon",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    khasab.id,
    "Warthog Reserve 202",
    "A-10C Thunderbolt II",
    {
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 4 }],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    beachhead.id,
    "C-130 Shore Lift",
    "C-130 Hercules",
    {
      clearWeapons: true,
    }
  );

  const beachheadNasams = addFacility(
    context,
    context.usSideId,
    "Beachhead NASAMS Screen",
    "NASAMS",
    25.886,
    55.022,
    {
      heading: 40,
    }
  );
  const usTank = addFacility(
    context,
    context.usSideId,
    "Marine Armor Spearhead",
    "K2 Black Panther",
    25.874,
    55.018,
    {
      route: [
        [25.878, 55.036],
        [25.886, 55.05],
      ],
    }
  );
  const abuMusaUsFacilities: Array<{
    name: string;
    className: string;
    latitude: number;
    longitude: number;
    options?: FacilityOptions;
  }> = [
    {
      name: "Beachhead Point Defense",
      className: "Biho Hybrid",
      latitude: 25.89,
      longitude: 55.036,
      options: { heading: 90 },
    },
    {
      name: "Beachhead APC Column",
      className: "KM900 APC",
      latitude: 25.87,
      longitude: 55.012,
      options: {
        route: [
          [25.875, 55.03],
          [25.884, 55.046],
        ],
      },
    },
    {
      name: "Shore Command Post",
      className: "M577 Command Vehicle",
      latitude: 25.868,
      longitude: 55.006,
    },
    {
      name: "Harbor Security Track",
      className: "M113A1",
      latitude: 25.889,
      longitude: 55.011,
    },
  ];
  abuMusaUsFacilities.forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(context, context.usSideId, name, className, latitude, longitude, options)
  );

  const carrier = addShip(
    context,
    context.usSideId,
    "USS Midway",
    "Aircraft Carrier",
    25.98,
    55.64,
    {
      heading: 112,
      route: [
        [25.92, 55.42],
        [25.88, 55.18],
      ],
    }
  );
  const amphibious = addShip(
    context,
    context.usSideId,
    "USS America",
    "Amphibious Assault Ship",
    25.93,
    55.41,
    {
      heading: 104,
      route: [
        [25.91, 55.24],
        [25.89, 55.08],
      ],
    }
  );
  const usDestroyer = addShip(
    context,
    context.usSideId,
    "USS Momsen",
    "Destroyer",
    26.02,
    55.52,
    {
      heading: 120,
      route: [
        [25.96, 55.28],
        [25.92, 55.08],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "USS Littoral Screen",
    "Patrol Boat",
    25.9,
    55.32,
    {
      heading: 135,
      route: [
        [25.86, 55.18],
        [25.84, 55.02],
      ],
    }
  );
  addAircraftToShip(
    context,
    context.usSideId,
    carrier.id,
    "Hornet Reserve 203",
    "F/A-18 Hornet",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-84 Harpoon", quantity: 2 },
      ],
    }
  );

  const hornetCover = addAircraft(
    context,
    context.usSideId,
    "Hornet Cover 211",
    "F/A-18 Hornet",
    25.98,
    55.33,
    {
      altitude: 24000,
      heading: 120,
      route: [
        [25.93, 55.16],
        [25.86, 54.98],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-84 Harpoon", quantity: 2 },
      ],
    }
  );
  const falconCover = addAircraft(
    context,
    context.usSideId,
    "Falcon Cover 212",
    "F-16 Fighting Falcon",
    26.04,
    55.46,
    {
      altitude: 26000,
      heading: 145,
      route: [
        [25.96, 55.24],
        [25.88, 55.02],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const warthog = addAircraft(
    context,
    context.usSideId,
    "Warthog 213",
    "A-10C Thunderbolt II",
    25.94,
    55.2,
    {
      altitude: 12000,
      heading: 130,
      route: [
        [25.9, 55.08],
        [25.86, 54.98],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 4 }],
    }
  );
  const usDrone = addAircraft(
    context,
    context.usSideId,
    "Watchtower 214",
    "MQ-9 Reaper",
    26.08,
    55.18,
    {
      altitude: 18000,
      heading: 170,
      route: [
        [25.98, 55.04],
        [25.88, 54.92],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const bandarLengeh = addAirbase(
    context,
    context.iranSideId,
    "Bandar Lengeh Air Base",
    26.533,
    54.824
  );
  const qeshm = addAirbase(
    context,
    context.iranSideId,
    "Qeshm Island Strip",
    26.81,
    55.892
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bandarLengeh.id,
    "Tomcat Reserve 221",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 2 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    qeshm.id,
    "Phantom Reserve 222",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );

  const abuMusaHq17 = addFacility(
    context,
    context.iranSideId,
    "Abu Musa HQ-17 Site",
    "HQ-17",
    25.885,
    55.036,
    {
      heading: 245,
    }
  );
  const abuMusaPantsir = addFacility(
    context,
    context.iranSideId,
    "Abu Musa Pantsir Screen",
    "Pantsir-S1",
    25.881,
    55.052,
    {
      heading: 250,
    }
  );
  const sirriLauncher = addFacility(
    context,
    context.iranSideId,
    "Sirri Tactical Missile Battery",
    "Tactical Surface to Surface Missile Launcher",
    25.901,
    54.538,
    {
      heading: 110,
    }
  );
  const abuMusaIranFacilities: Array<{
    name: string;
    className: string;
    latitude: number;
    longitude: number;
    options?: FacilityOptions;
  }> = [
    {
      name: "Island Armor Reserve",
      className: "K2 Black Panther",
      latitude: 25.889,
      longitude: 55.067,
      options: {
        route: [
          [25.886, 55.054],
          [25.882, 55.04],
        ],
      },
    },
    {
      name: "Island APC Reserve",
      className: "KM900 APC",
      latitude: 25.893,
      longitude: 55.075,
      options: {
        route: [
          [25.888, 55.06],
          [25.882, 55.046],
        ],
      },
    },
    {
      name: "Island Command Node",
      className: "M577 Command Vehicle",
      latitude: 25.896,
      longitude: 55.058,
    },
    {
      name: "Sirri Rocket Battery",
      className: "Chunmoo MRLS",
      latitude: 25.909,
      longitude: 54.552,
      options: { heading: 110 },
    },
  ];
  abuMusaIranFacilities.forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(
      context,
      context.iranSideId,
      name,
      className,
      latitude,
      longitude,
      options
    )
  );

  const iranCorvette = addShip(
    context,
    context.iranSideId,
    "IRINS Abu Musa Guard",
    "Corvette",
    25.95,
    55.11,
    {
      heading: 285,
      route: [
        [25.92, 55.02],
        [25.89, 54.96],
      ],
    }
  );
  const iranPatrol = addShip(
    context,
    context.iranSideId,
    "IRGCN Fast Swarm 1",
    "Patrol Boat",
    25.98,
    55.18,
    {
      heading: 275,
      route: [
        [25.94, 55.06],
        [25.9, 54.96],
      ],
    }
  );

  const iranTomcat = addAircraft(
    context,
    context.iranSideId,
    "Tomcat Cover 223",
    "F-14 Tomcat",
    26.18,
    55.02,
    {
      altitude: 30000,
      heading: 220,
      route: [
        [26.04, 54.92],
        [25.92, 54.94],
      ],
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 2 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const iranPhantom = addAircraft(
    context,
    context.iranSideId,
    "Phantom Hammer 224",
    "F-4 Phantom II",
    26.04,
    54.92,
    {
      altitude: 19000,
      heading: 130,
      route: [
        [25.96, 55.02],
        [25.9, 55.08],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const iranDrone = addAircraft(
    context,
    context.iranSideId,
    "Island UAV 225",
    "MQ-9 Reaper",
    25.98,
    54.76,
    {
      altitude: 17000,
      heading: 100,
      route: [
        [25.94, 54.94],
        [25.89, 55.06],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const usPatrolBox = [
    addReferencePoint(context, context.usSideId, "US Abu RP-1", 25.96, 55.11),
    addReferencePoint(context, context.usSideId, "US Abu RP-2", 25.93, 54.97),
    addReferencePoint(context, context.usSideId, "US Abu RP-3", 25.84, 54.98),
    addReferencePoint(context, context.usSideId, "US Abu RP-4", 25.85, 55.13),
  ];
  createPatrolMission(
    context,
    context.usSideId,
    "미국 CAP - 아부무사 상공 엄호",
    [hornetCover.id, falconCover.id],
    usPatrolBox
  );
  createStrikeMission(
    context,
    context.usSideId,
    "미국 타격 - 섬 방공망 제거",
    [warthog.id, usDrone.id, hornetCover.id],
    [
      abuMusaHq17.id,
      abuMusaPantsir.id,
      iranCorvette.id,
      iranPatrol.id,
      sirriLauncher.id,
    ]
  );

  const iranPatrolBox = [
    addReferencePoint(context, context.iranSideId, "IR Abu RP-1", 26.02, 55.04),
    addReferencePoint(context, context.iranSideId, "IR Abu RP-2", 25.98, 54.84),
    addReferencePoint(context, context.iranSideId, "IR Abu RP-3", 25.84, 54.9),
    addReferencePoint(context, context.iranSideId, "IR Abu RP-4", 25.86, 55.08),
  ];
  createPatrolMission(
    context,
    context.iranSideId,
    "이란 CAP - 섬 동측 반격축",
    [iranTomcat.id, iranDrone.id],
    iranPatrolBox
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "이란 타격 - 상륙선단 저지",
    [iranPhantom.id, iranDrone.id],
    [amphibious.id, beachhead.id, beachheadNasams.id, usTank.id, usDestroyer.id]
  );

  return exportScenario(context);
}

function buildAlDhafraDroneRaidScenario() {
  const context = createScenarioContext(
    "iran-vs-us-al-dhafra-drone-raid",
    "이란 vs 미국 - 알다프라 드론 공습",
    unixTime("2026-03-11T02:30:00Z"),
    [54.56, 24.34],
    7.15,
    32400
  );

  const alDhafra = addAirbase(
    context,
    context.usSideId,
    "Al Dhafra Air Base",
    24.248,
    54.548
  );
  const jebelAli = addAirbase(
    context,
    context.usSideId,
    "Jebel Ali Dispersal Strip",
    24.985,
    55.062
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    alDhafra.id,
    "F-35 Ready 301",
    "F-35A Lightning II",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AGM-158 JASSM", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    alDhafra.id,
    "C-17 Lift 302",
    "C-17 Globemaster III",
    {
      clearWeapons: true,
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    jebelAli.id,
    "C-130 Fuel Shuttle",
    "C-130 Hercules",
    {
      clearWeapons: true,
    }
  );

  const alDhafraPatriot = addFacility(
    context,
    context.usSideId,
    "Al Dhafra Patriot Battery",
    "MIM-104 Patriot",
    24.236,
    54.526,
    {
      heading: 25,
    }
  );
  const khuzestanUsFacilities: Array<{
    name: string;
    className: string;
    latitude: number;
    longitude: number;
    options?: FacilityOptions;
  }> = [
    {
      name: "Al Dhafra THAAD",
      className: "THAAD",
      latitude: 24.262,
      longitude: 54.59,
      options: { heading: 35 },
    },
    {
      name: "Jebel Ali NASAMS",
      className: "NASAMS",
      latitude: 24.978,
      longitude: 55.048,
      options: { heading: 40 },
    },
    {
      name: "Runway Point Defense",
      className: "Biho Hybrid",
      latitude: 24.252,
      longitude: 54.564,
      options: { heading: 0 },
    },
    {
      name: "Perimeter Armor Troop",
      className: "K2 Black Panther",
      latitude: 24.22,
      longitude: 54.502,
    },
    {
      name: "Flightline APC",
      className: "M113A1",
      latitude: 24.224,
      longitude: 54.57,
    },
    {
      name: "Rapid Reaction Column",
      className: "KM900 APC",
      latitude: 24.272,
      longitude: 54.518,
    },
    {
      name: "Base Command Shelter",
      className: "M577 Command Vehicle",
      latitude: 24.244,
      longitude: 54.546,
    },
  ];
  khuzestanUsFacilities.forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(context, context.usSideId, name, className, latitude, longitude, options)
  );

  const usDestroyer = addShip(
    context,
    context.usSideId,
    "USS Laboon",
    "Destroyer",
    24.58,
    54.12,
    {
      heading: 78,
      route: [
        [24.64, 54.36],
        [24.72, 54.62],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "USS Gulf Shield",
    "Frigate",
    24.48,
    54.34,
    {
      heading: 82,
      route: [
        [24.54, 54.54],
        [24.6, 54.76],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "Harbor Interceptor",
    "Patrol Boat",
    24.66,
    54.74,
    {
      heading: 95,
      route: [
        [24.72, 54.88],
        [24.8, 55.02],
      ],
    }
  );

  const lightningCap = addAircraft(
    context,
    context.usSideId,
    "Lightning CAP 311",
    "F-35A Lightning II",
    24.68,
    54.78,
    {
      altitude: 30000,
      heading: 55,
      route: [
        [24.82, 55.02],
        [24.94, 55.22],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AGM-158 JASSM", quantity: 2 },
      ],
    }
  );
  const raptorCap = addAircraft(
    context,
    context.usSideId,
    "Raptor CAP 312",
    "F-22 Raptor",
    24.92,
    54.66,
    {
      altitude: 32000,
      heading: 60,
      route: [
        [25.02, 54.88],
        [25.08, 55.08],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const falconInterdiction = addAircraft(
    context,
    context.usSideId,
    "Falcon Interdiction 313",
    "F-16 Fighting Falcon",
    24.52,
    54.62,
    {
      altitude: 24000,
      heading: 75,
      route: [
        [24.7, 54.86],
        [24.88, 55.12],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const usDrone = addAircraft(
    context,
    context.usSideId,
    "Sentinel 314",
    "MQ-9 Reaper",
    24.86,
    54.92,
    {
      altitude: 18000,
      heading: 65,
      route: [
        [25.02, 55.12],
        [25.18, 55.28],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "Texaco 315",
    "KC-135R Stratotanker",
    24.32,
    54.24,
    {
      altitude: 30000,
      heading: 80,
      route: [
        [24.42, 54.52],
        [24.52, 54.82],
      ],
      clearWeapons: true,
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "Huron Relay 316",
    "C-12 Huron",
    24.74,
    54.5,
    {
      altitude: 16000,
      heading: 60,
      route: [
        [24.88, 54.72],
        [24.98, 54.96],
      ],
      clearWeapons: true,
    }
  );

  const sirri = addAirbase(
    context,
    context.iranSideId,
    "Sirri Island Strip",
    25.909,
    54.539
  );
  const bandarLengeh = addAirbase(
    context,
    context.iranSideId,
    "Bandar Lengeh Air Base",
    26.533,
    54.824
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    sirri.id,
    "Phantom Reserve 321",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    bandarLengeh.id,
    "Tomcat Reserve 322",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 2 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );

  const sirriHq9 = addFacility(
    context,
    context.iranSideId,
    "Sirri HQ-9 Site",
    "HQ-9",
    25.913,
    54.551,
    {
      heading: 230,
    }
  );
  const qeshmLauncher = addFacility(
    context,
    context.iranSideId,
    "Qeshm Tactical Launcher",
    "Tactical Surface to Surface Missile Launcher",
    26.83,
    55.998,
    {
      heading: 215,
    }
  );
  const khuzestanIranFacilities: Array<{
    name: string;
    className: string;
    latitude: number;
    longitude: number;
    options?: FacilityOptions;
  }> = [
    {
      name: "Lavan HQ-16 Site",
      className: "HQ-16",
      latitude: 26.796,
      longitude: 53.356,
      options: { heading: 220 },
    },
    {
      name: "Sirri Pantsir Screen",
      className: "Pantsir-S1",
      latitude: 25.904,
      longitude: 54.563,
      options: { heading: 220 },
    },
    {
      name: "Lavan Tor Site",
      className: "Tor-M2",
      latitude: 26.79,
      longitude: 53.338,
      options: { heading: 215 },
    },
    {
      name: "Sirri Rocket Battery",
      className: "Chunmoo MRLS",
      latitude: 25.918,
      longitude: 54.529,
      options: { heading: 210 },
    },
    {
      name: "Sirri Security Armor",
      className: "K2 Black Panther",
      latitude: 25.902,
      longitude: 54.522,
    },
  ];
  khuzestanIranFacilities.forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(
      context,
      context.iranSideId,
      name,
      className,
      latitude,
      longitude,
      options
    )
  );

  const iranDestroyer = addShip(
    context,
    context.iranSideId,
    "IRINS Strait Shield",
    "Destroyer",
    25.24,
    54.48,
    {
      heading: 125,
      route: [
        [25.1, 54.7],
        [24.96, 54.96],
      ],
    }
  );
  addShip(
    context,
    context.iranSideId,
    "IRGCN Missile Corvette",
    "Corvette",
    25.34,
    54.62,
    {
      heading: 118,
      route: [
        [25.16, 54.86],
        [25.04, 55.06],
      ],
    }
  );

  const iranTomcat = addAircraft(
    context,
    context.iranSideId,
    "Tomcat CAP 323",
    "F-14 Tomcat",
    25.74,
    54.78,
    {
      altitude: 30000,
      heading: 140,
      route: [
        [25.58, 54.96],
        [25.42, 55.18],
      ],
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 2 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const iranPhantom = addAircraft(
    context,
    context.iranSideId,
    "Phantom Raid 324",
    "F-4 Phantom II",
    25.54,
    54.66,
    {
      altitude: 18000,
      heading: 130,
      route: [
        [25.3, 54.92],
        [25.08, 55.16],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const iranDrone1 = addAircraft(
    context,
    context.iranSideId,
    "UAV Wave 325",
    "MQ-9 Reaper",
    25.66,
    54.72,
    {
      altitude: 15000,
      heading: 125,
      route: [
        [25.46, 54.96],
        [25.22, 55.16],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  const iranDrone2 = addAircraft(
    context,
    context.iranSideId,
    "UAV Wave 326",
    "MQ-9 Reaper",
    25.48,
    54.6,
    {
      altitude: 15000,
      heading: 125,
      route: [
        [25.28, 54.84],
        [25.04, 55.04],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const usPatrolBox = [
    addReferencePoint(context, context.usSideId, "US UAE RP-1", 24.72, 54.74),
    addReferencePoint(context, context.usSideId, "US UAE RP-2", 24.94, 55.04),
    addReferencePoint(context, context.usSideId, "US UAE RP-3", 24.82, 55.26),
    addReferencePoint(context, context.usSideId, "US UAE RP-4", 24.58, 54.92),
  ];
  createPatrolMission(
    context,
    context.usSideId,
    "미국 CAP - 알다프라 방공권 유지",
    [lightningCap.id, raptorCap.id],
    usPatrolBox
  );
  createStrikeMission(
    context,
    context.usSideId,
    "미국 타격 - 도서 미사일대 억제",
    [falconInterdiction.id, usDrone.id, lightningCap.id],
    [sirriHq9.id, qeshmLauncher.id, iranDestroyer.id]
  );

  const iranPatrolBox = [
    addReferencePoint(context, context.iranSideId, "IR UAE RP-1", 25.58, 54.82),
    addReferencePoint(context, context.iranSideId, "IR UAE RP-2", 25.34, 55.02),
    addReferencePoint(context, context.iranSideId, "IR UAE RP-3", 25.12, 55.22),
    addReferencePoint(context, context.iranSideId, "IR UAE RP-4", 25.26, 54.84),
  ];
  createPatrolMission(
    context,
    context.iranSideId,
    "이란 CAP - 서부 도서 방공권",
    [iranTomcat.id, iranDrone1.id],
    iranPatrolBox
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "이란 타격 - 알다프라 포화 공습",
    [iranPhantom.id, iranDrone2.id],
    [alDhafra.id, alDhafraPatriot.id, usDestroyer.id, jebelAli.id]
  );

  return exportScenario(context);
}

function buildKhuzestanArmorBreakthroughScenario() {
  const context = createScenarioContext(
    "iran-vs-us-khuzestan-armor-breakthrough",
    "이란 vs 미국 - 후제스탄 기갑 돌파",
    unixTime("2026-03-13T05:00:00Z"),
    [48.78, 30.56],
    7.05,
    36000
  );

  const basra = addAirbase(
    context,
    context.usSideId,
    "Basra Logistics Strip",
    30.549,
    47.662
  );
  const rumaila = addAirbase(
    context,
    context.usSideId,
    "Rumaila Desert Strip",
    30.382,
    47.74
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    basra.id,
    "Warthog Reserve 401",
    "A-10C Thunderbolt II",
    {
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 4 }],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    rumaila.id,
    "Falcon Reserve 402",
    "F-16 Fighting Falcon",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    basra.id,
    "C-130 Forward Sustainment",
    "C-130 Hercules",
    {
      clearWeapons: true,
    }
  );

  const usPatriot = addFacility(
    context,
    context.usSideId,
    "Basra Patriot Belt",
    "MIM-104 Patriot",
    30.534,
    47.648,
    {
      heading: 90,
    }
  );
  const usTank1 = addFacility(
    context,
    context.usSideId,
    "Armor Troop Alpha",
    "K2 Black Panther",
    30.29,
    47.96,
    {
      route: [
        [30.3, 48.12],
        [30.31, 48.24],
      ],
    }
  );
  const khuzestanUsFacilities: Array<{
    name: string;
    className: string;
    latitude: number;
    longitude: number;
    options?: FacilityOptions;
  }> = [
    {
      name: "Rumaila NASAMS",
      className: "NASAMS",
      latitude: 30.37,
      longitude: 47.726,
      options: { heading: 95 },
    },
    {
      name: "Corridor SHORAD",
      className: "Biho Hybrid",
      latitude: 30.324,
      longitude: 47.892,
      options: { heading: 85 },
    },
    {
      name: "Armor Troop Bravo",
      className: "K2 Black Panther",
      latitude: 30.24,
      longitude: 48.02,
      options: {
        route: [
          [30.26, 48.18],
          [30.28, 48.32],
        ],
      },
    },
    {
      name: "Mechanized Screen",
      className: "KM900 APC",
      latitude: 30.2,
      longitude: 47.98,
      options: {
        route: [
          [30.22, 48.16],
          [30.24, 48.28],
        ],
      },
    },
    {
      name: "River Security Track",
      className: "M113A1",
      latitude: 30.176,
      longitude: 48.01,
    },
    {
      name: "Forward Command Vehicle",
      className: "M577 Command Vehicle",
      latitude: 30.26,
      longitude: 47.88,
    },
    {
      name: "Counterbattery Rocket Battery",
      className: "Chunmoo MRLS",
      latitude: 30.322,
      longitude: 47.786,
      options: { heading: 80 },
    },
  ];
  khuzestanUsFacilities.forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(context, context.usSideId, name, className, latitude, longitude, options)
  );

  const usPatrolBoat = addShip(
    context,
    context.usSideId,
    "US Riverine 1",
    "Patrol Boat",
    29.998,
    48.568,
    {
      heading: 50,
      route: [
        [30.06, 48.72],
        [30.1, 48.88],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "US Coastal Screen",
    "Corvette",
    29.94,
    48.72,
    {
      heading: 55,
      route: [
        [30.02, 48.88],
        [30.08, 49.02],
      ],
    }
  );

  const warthog = addAircraft(
    context,
    context.usSideId,
    "Warthog 411",
    "A-10C Thunderbolt II",
    30.36,
    47.96,
    {
      altitude: 13000,
      heading: 80,
      route: [
        [30.38, 48.18],
        [30.42, 48.36],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 4 }],
    }
  );
  const falcon = addAircraft(
    context,
    context.usSideId,
    "Falcon 412",
    "F-16 Fighting Falcon",
    30.42,
    47.88,
    {
      altitude: 24000,
      heading: 75,
      route: [
        [30.48, 48.12],
        [30.56, 48.34],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const usDrone = addAircraft(
    context,
    context.usSideId,
    "Reaper 413",
    "MQ-9 Reaper",
    30.48,
    47.72,
    {
      altitude: 18000,
      heading: 70,
      route: [
        [30.56, 47.98],
        [30.64, 48.26],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const omidiyeh = addAirbase(
    context,
    context.iranSideId,
    "Omidiyeh Air Base",
    30.835,
    49.534
  );
  const ahvaz = addAirbase(
    context,
    context.iranSideId,
    "Ahvaz Forward Strip",
    31.338,
    48.762
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    omidiyeh.id,
    "Tomcat Reserve 421",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 2 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    ahvaz.id,
    "Phantom Reserve 422",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );

  const iranHq16 = addFacility(
    context,
    context.iranSideId,
    "Khorramshahr HQ-16 Belt",
    "HQ-16",
    30.44,
    48.74,
    {
      heading: 275,
    }
  );
  const iranTank1 = addFacility(
    context,
    context.iranSideId,
    "Armor Spearhead 1",
    "K2 Black Panther",
    30.48,
    48.94,
    {
      route: [
        [30.42, 48.72],
        [30.36, 48.5],
      ],
    }
  );
  const iranTank2 = addFacility(
    context,
    context.iranSideId,
    "Armor Spearhead 2",
    "K2 Black Panther",
    30.62,
    49.08,
    {
      route: [
        [30.54, 48.88],
        [30.44, 48.62],
      ],
    }
  );
  const iranLauncher = addFacility(
    context,
    context.iranSideId,
    "Rear Tactical Launcher",
    "Tactical Surface to Surface Missile Launcher",
    30.78,
    49.28,
    {
      heading: 255,
    }
  );
  const khuzestanIranFacilities: Array<{
    name: string;
    className: string;
    latitude: number;
    longitude: number;
    options?: FacilityOptions;
  }> = [
    {
      name: "Corridor Tor Screen",
      className: "Tor-M2",
      latitude: 30.56,
      longitude: 48.86,
      options: { heading: 270 },
    },
    {
      name: "Forward Pantsir",
      className: "Pantsir-S1",
      latitude: 30.62,
      longitude: 49.02,
      options: { heading: 265 },
    },
    {
      name: "Mechanized Assault Group",
      className: "KM900 APC",
      latitude: 30.54,
      longitude: 48.98,
      options: {
        route: [
          [30.46, 48.78],
          [30.38, 48.58],
        ],
      },
    },
    {
      name: "Assault Command Vehicle",
      className: "M577 Command Vehicle",
      latitude: 30.58,
      longitude: 48.9,
    },
    {
      name: "Khorramshahr Rocket Battery",
      className: "Chunmoo MRLS",
      latitude: 30.66,
      longitude: 49.12,
      options: { heading: 260 },
    },
  ];
  khuzestanIranFacilities.forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(
      context,
      context.iranSideId,
      name,
      className,
      latitude,
      longitude,
      options
    )
  );

  const iranPatrolBoat = addShip(
    context,
    context.iranSideId,
    "IRGCN River Patrol",
    "Patrol Boat",
    30.016,
    48.886,
    {
      heading: 230,
      route: [
        [29.98, 48.74],
        [29.94, 48.58],
      ],
    }
  );
  const iranCorvette = addShip(
    context,
    context.iranSideId,
    "IRINS Northern Gulf Corvette",
    "Corvette",
    29.954,
    49.024,
    {
      heading: 240,
      route: [
        [29.92, 48.9],
        [29.88, 48.72],
      ],
    }
  );

  const iranTomcat = addAircraft(
    context,
    context.iranSideId,
    "Tomcat 423",
    "F-14 Tomcat",
    30.92,
    49.34,
    {
      altitude: 29000,
      heading: 260,
      route: [
        [30.78, 49.04],
        [30.64, 48.78],
      ],
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 2 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const iranPhantom = addAircraft(
    context,
    context.iranSideId,
    "Phantom 424",
    "F-4 Phantom II",
    30.74,
    49.12,
    {
      altitude: 17000,
      heading: 255,
      route: [
        [30.58, 48.86],
        [30.44, 48.6],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const iranDrone = addAircraft(
    context,
    context.iranSideId,
    "Recon Drone 425",
    "MQ-9 Reaper",
    30.68,
    48.96,
    {
      altitude: 17000,
      heading: 255,
      route: [
        [30.56, 48.72],
        [30.42, 48.48],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const usPatrolBox = [
    addReferencePoint(context, context.usSideId, "US Land RP-1", 30.46, 47.98),
    addReferencePoint(context, context.usSideId, "US Land RP-2", 30.58, 48.26),
    addReferencePoint(context, context.usSideId, "US Land RP-3", 30.34, 48.42),
    addReferencePoint(context, context.usSideId, "US Land RP-4", 30.22, 48.1),
  ];
  createPatrolMission(
    context,
    context.usSideId,
    "미국 CAP - 돌파 축 감시",
    [falcon.id, usDrone.id],
    usPatrolBox
  );
  createStrikeMission(
    context,
    context.usSideId,
    "미국 타격 - 기갑 돌파 차단",
    [warthog.id, falcon.id, usDrone.id],
    [iranTank1.id, iranTank2.id, iranHq16.id, iranLauncher.id, iranCorvette.id]
  );

  const iranPatrolBox = [
    addReferencePoint(context, context.iranSideId, "IR Land RP-1", 30.72, 48.96),
    addReferencePoint(context, context.iranSideId, "IR Land RP-2", 30.58, 48.72),
    addReferencePoint(context, context.iranSideId, "IR Land RP-3", 30.42, 48.46),
    addReferencePoint(context, context.iranSideId, "IR Land RP-4", 30.58, 49.12),
  ];
  createPatrolMission(
    context,
    context.iranSideId,
    "이란 CAP - 후제스탄 전장 상공",
    [iranTomcat.id, iranDrone.id],
    iranPatrolBox
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "이란 타격 - 바스라 병참선 압박",
    [iranPhantom.id, iranDrone.id],
    [basra.id, rumaila.id, usPatriot.id, usTank1.id, usPatrolBoat.id]
  );

  return exportScenario(context);
}

function buildKoreaVsNorthKoreaWestSeaScenario() {
  const context = createScenarioContext(
    "korea-vs-north-korea-west-sea-defense",
    "한국 vs 북한 - 서해 합동 방어",
    unixTime("2026-04-02T02:00:00Z"),
    [126.42, 37.42],
    7.35,
    28800,
    {
      usSideId: "rok-side",
      iranSideId: "dprk-side",
      usSideName: "한국",
      iranSideName: "북한",
    }
  );

  const seoul = addAirbase(
    context,
    context.usSideId,
    "Seoul Air Base",
    37.4408,
    127.1083
  );
  const seosan = addAirbase(
    context,
    context.usSideId,
    "Seosan Air Base",
    36.7852,
    126.4657
  );
  const cheongju = addAirbase(
    context,
    context.usSideId,
    "Cheongju Air Base",
    36.5681,
    127.5
  );
  const sacheon = addAirbase(
    context,
    context.usSideId,
    "Sacheon Air Base",
    35.0885,
    128.07
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    seoul.id,
    "ROK F-15 Reserve 1",
    "F-15 Eagle",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    seoul.id,
    "ROK KF-21 Reserve 3",
    "KF-21 Boramae",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    seosan.id,
    "ROK KF-16 Reserve 4",
    "KF-16",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    cheongju.id,
    "ROK FA-50 Reserve 5",
    "FA-50 Fighting Eagle",
    {
      weaponLoadout: [
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    cheongju.id,
    "ROK C-130 Sustainment",
    "C-130 Hercules",
    {
      clearWeapons: true,
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    sacheon.id,
    "ROK KC-135 Reserve 6",
    "KC-135R Stratotanker",
    {
      clearWeapons: true,
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    sacheon.id,
    "ROK MQ-9 Reserve 7",
    "MQ-9 Reaper",
    {
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  addAircraftToAirbase(
    context,
    context.usSideId,
    seosan.id,
    "ROK F-35 Reserve 2",
    "F-35A Lightning II",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AGM-158 JASSM", quantity: 2 },
      ],
    }
  );

  const lSam = addFacility(
    context,
    context.usSideId,
    "Capital L-SAM Belt",
    "L-SAM",
    37.512,
    126.94,
    {
      heading: 320,
    }
  );
  [
    {
      name: "Incheon Cheongung-II",
      className: "Cheongung-II (KM-SAM Block II)",
      latitude: 37.462,
      longitude: 126.69,
      options: { heading: 315 },
    },
    {
      name: "West Corridor Pegasus",
      className: "Pegasus (K-SAM)",
      latitude: 37.38,
      longitude: 126.74,
      options: { heading: 315 },
    },
    {
      name: "Airbase Point Defense",
      className: "Biho Hybrid",
      latitude: 36.79,
      longitude: 126.49,
      options: { heading: 300 },
    },
    {
      name: "ROK Armor Troop",
      className: "K2 Black Panther",
      latitude: 37.08,
      longitude: 126.72,
    },
    {
      name: "ROK Mechanized Screen",
      className: "KM900 APC",
      latitude: 37.14,
      longitude: 126.78,
    },
    {
      name: "ROK Command Vehicle",
      className: "M577 Command Vehicle",
      latitude: 37.2,
      longitude: 126.82,
    },
    {
      name: "ROK Counterfire Battery",
      className: "Chunmoo MRLS",
      latitude: 37.02,
      longitude: 126.86,
      options: { heading: 330 },
    },
  ].forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(context, context.usSideId, name, className, latitude, longitude, options)
  );
  const cheongung = addFacility(
    context,
    context.usSideId,
    "Capital Cheongung Belt",
    "Cheongung (M-SAM)",
    37.56,
    126.88,
    {
      heading: 320,
    }
  );
  const hyunmooBattery = addFacility(
    context,
    context.usSideId,
    "ROK Tactical Missile Battery",
    "Tactical Surface to Surface Missile Launcher",
    37.04,
    126.94,
    {
      heading: 340,
    }
  );
  const rokTank2 = addFacility(
    context,
    context.usSideId,
    "ROK Armor Troop 2",
    "K2 Black Panther",
    37.22,
    126.74,
    {
      route: [
        [37.26, 126.62],
        [37.3, 126.48],
      ],
    }
  );
  addFacility(
    context,
    context.usSideId,
    "ROK Forward APC Section",
    "M113A1",
    37.16,
    126.7
  );
  addFacility(
    context,
    context.usSideId,
    "ROK Counterfire Battery 2",
    "Chunmoo MRLS",
    37.12,
    126.98,
    {
      heading: 335,
    }
  );
  [
    {
      name: "Capital L-SAM Reserve",
      className: "L-SAM",
      latitude: 37.64,
      longitude: 126.78,
      options: { heading: 322 },
    },
    {
      name: "West Sea Cheongung Screen",
      className: "Cheongung-II (KM-SAM Block II)",
      latitude: 37.66,
      longitude: 126.58,
      options: { heading: 318 },
    },
    {
      name: "Forward Pegasus Screen",
      className: "Pegasus (K-SAM)",
      latitude: 37.52,
      longitude: 126.6,
      options: { heading: 320 },
    },
    {
      name: "ROK Armor Reserve 3",
      className: "K2 Black Panther",
      latitude: 37.32,
      longitude: 126.88,
      options: {
        route: [
          [37.46, 126.68],
          [37.62, 126.46],
        ],
      },
    },
    {
      name: "ROK Mechanized Reserve 2",
      className: "KM900 APC",
      latitude: 37.28,
      longitude: 126.84,
      options: {
        route: [
          [37.42, 126.66],
          [37.56, 126.5],
        ],
      },
    },
    {
      name: "ROK Forward Air Defense",
      className: "Biho Hybrid",
      latitude: 37.42,
      longitude: 126.72,
      options: { heading: 318 },
    },
    {
      name: "ROK Deep Counterfire Battery",
      className: "Chunmoo MRLS",
      latitude: 37.26,
      longitude: 126.98,
      options: { heading: 338 },
    },
  ].forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(context, context.usSideId, name, className, latitude, longitude, options)
  );

  const rokDestroyer = addShip(
    context,
    context.usSideId,
    "ROKS Jeongjo",
    "Jeongjo the Great-class Destroyer",
    37.22,
    126.02,
    {
      heading: 18,
      route: [
        [37.38, 126.08],
        [37.54, 126.16],
      ],
    }
  );
  const rokSejong = addShip(
    context,
    context.usSideId,
    "ROKS Sejong",
    "Sejong the Great-class Destroyer",
    37.08,
    125.94,
    {
      heading: 20,
      route: [
        [37.28, 126.0],
        [37.48, 126.08],
      ],
    }
  );
  const rokDokdo = addShip(
    context,
    context.usSideId,
    "ROKS Dokdo",
    "Dokdo-class Amphibious Assault Ship",
    37.18,
    126.22,
    {
      heading: 22,
      route: [
        [37.34, 126.26],
        [37.52, 126.32],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "ROKS Daegu",
    "Daegu-class Frigate",
    37.4,
    126.18,
    {
      heading: 25,
      route: [
        [37.56, 126.22],
        [37.68, 126.28],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "PKMR Coastal Patrol",
    "Yoon Youngha-class Patrol Craft",
    37.54,
    126.12,
    {
      heading: 28,
      route: [
        [37.66, 126.18],
        [37.78, 126.24],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "ROKS Incheon",
    "Incheon-class Frigate",
    37.3,
    126.1,
    {
      heading: 24,
      route: [
        [37.44, 126.16],
        [37.58, 126.22],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "ROKS Yulgok Yi I",
    "Sejong the Great-class Destroyer",
    37.52,
    126.16,
    {
      heading: 20,
      route: [
        [37.72, 126.2],
        [37.94, 126.22],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "ROKS Gyeonggi",
    "Incheon-class Frigate",
    37.64,
    126.2,
    {
      heading: 24,
      route: [
        [37.82, 126.22],
        [37.98, 126.26],
      ],
    }
  );
  addShip(
    context,
    context.usSideId,
    "PKMR Northern Screen",
    "Yoon Youngha-class Patrol Craft",
    37.76,
    126.18,
    {
      heading: 28,
      route: [
        [37.92, 126.2],
        [38.04, 126.22],
      ],
    }
  );

  const rokF15 = addAircraft(
    context,
    context.usSideId,
    "ROK Eagle 11",
    "F-15 Eagle",
    37.24,
    126.82,
    {
      altitude: 28000,
      heading: 300,
      route: [
        [37.5, 126.54],
        [37.72, 126.34],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const rokF16 = addAircraft(
    context,
    context.usSideId,
    "ROK Falcon 12",
    "F-16 Fighting Falcon",
    37.08,
    126.64,
    {
      altitude: 25000,
      heading: 305,
      route: [
        [37.32, 126.38],
        [37.58, 126.18],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const rokDrone = addAircraft(
    context,
    context.usSideId,
    "ROK ISR 13",
    "MQ-9 Reaper",
    37.32,
    126.52,
    {
      altitude: 17000,
      heading: 300,
      route: [
        [37.54, 126.28],
        [37.74, 126.12],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  const rokKf21 = addAircraft(
    context,
    context.usSideId,
    "ROK Boramae 14",
    "KF-21 Boramae",
    37.14,
    126.88,
    {
      altitude: 29000,
      heading: 302,
      route: [
        [37.34, 126.58],
        [37.6, 126.36],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const rokFa50 = addAircraft(
    context,
    context.usSideId,
    "ROK Fighting Eagle 15",
    "FA-50 Fighting Eagle",
    36.94,
    126.86,
    {
      altitude: 21000,
      heading: 315,
      route: [
        [37.18, 126.56],
        [37.42, 126.3],
      ],
      weaponLoadout: [
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const rokDrone2 = addAircraft(
    context,
    context.usSideId,
    "ROK ISR 16",
    "MQ-9 Reaper",
    37.12,
    126.46,
    {
      altitude: 16500,
      heading: 305,
      route: [
        [37.38, 126.22],
        [37.62, 126.08],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "ROK Texaco 17",
    "KC-135R Stratotanker",
    36.84,
    127.18,
    {
      altitude: 29000,
      heading: 315,
      route: [
        [37.02, 126.94],
        [37.2, 126.72],
      ],
      clearWeapons: true,
    }
  );
  addAircraft(
    context,
    context.usSideId,
    "ROK Relay 18",
    "C-12 Huron",
    37.02,
    127.06,
    {
      altitude: 15000,
      heading: 310,
      route: [
        [37.2, 126.82],
        [37.4, 126.58],
      ],
      clearWeapons: true,
    }
  );
  const rokF35 = addAircraft(
    context,
    context.usSideId,
    "ROK Ghost 19",
    "F-35A Lightning II",
    37.34,
    126.78,
    {
      altitude: 32000,
      heading: 304,
      route: [
        [37.64, 126.44],
        [37.92, 126.18],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AGM-158 JASSM", quantity: 2 },
      ],
    }
  );
  const rokKf16 = addAircraft(
    context,
    context.usSideId,
    "ROK Viper 20",
    "KF-16",
    37.22,
    126.72,
    {
      altitude: 27000,
      heading: 304,
      route: [
        [37.52, 126.42],
        [37.8, 126.22],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const rokF15Wing = addAircraft(
    context,
    context.usSideId,
    "ROK Eagle 21",
    "F-15 Eagle",
    37.44,
    126.9,
    {
      altitude: 30000,
      heading: 302,
      route: [
        [37.7, 126.62],
        [37.96, 126.36],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 4 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const rokDrone3 = addAircraft(
    context,
    context.usSideId,
    "ROK ISR 22",
    "MQ-9 Reaper",
    37.48,
    126.64,
    {
      altitude: 16000,
      heading: 302,
      route: [
        [37.76, 126.34],
        [37.98, 126.18],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const haeju = addAirbase(
    context,
    context.iranSideId,
    "Haeju Forward Strip",
    38.032,
    125.714
  );
  const kaesong = addAirbase(
    context,
    context.iranSideId,
    "Kaesong Forward Strip",
    37.985,
    126.554
  );
  const nampo = addAirbase(
    context,
    context.iranSideId,
    "Nampo Coastal Strip",
    38.732,
    125.407
  );
  const sariwon = addAirbase(
    context,
    context.iranSideId,
    "Sariwon Rear Strip",
    38.507,
    125.762
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    haeju.id,
    "DPRK Interceptor Proxy 1",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    kaesong.id,
    "DPRK Interceptor Proxy 2",
    "F-14 Tomcat",
    {
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 2 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
      ],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    nampo.id,
    "DPRK Drone Reserve 3",
    "MQ-9 Reaper",
    {
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  addAircraftToAirbase(
    context,
    context.iranSideId,
    sariwon.id,
    "DPRK Strike Reserve 4",
    "F-4 Phantom II",
    {
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );

  const dprkLauncher = addFacility(
    context,
    context.iranSideId,
    "DPRK Tactical Launcher Belt",
    "Tactical Surface to Surface Missile Launcher",
    38.06,
    126.64,
    {
      heading: 160,
    }
  );
  [
    {
      name: "DPRK Rocket Artillery Proxy",
      className: "Chunmoo MRLS",
      latitude: 38.18,
      longitude: 126.4,
      options: { heading: 160 },
    },
    {
      name: "DPRK HQ-17 Proxy",
      className: "HQ-17",
      latitude: 38.14,
      longitude: 126.3,
      options: { heading: 155 },
    },
    {
      name: "DPRK HQ-7 Proxy",
      className: "HQ-7",
      latitude: 38.02,
      longitude: 126.5,
      options: { heading: 156 },
    },
    {
      name: "DPRK Armor Column",
      className: "K2 Black Panther",
      latitude: 38.02,
      longitude: 126.54,
    },
    {
      name: "DPRK Mechanized Column",
      className: "KM900 APC",
      latitude: 38.06,
      longitude: 126.58,
    },
    {
      name: "DPRK Command Vehicle",
      className: "M577 Command Vehicle",
      latitude: 38.1,
      longitude: 126.52,
    },
  ].forEach(({ name, className, latitude, longitude, options }) =>
    addFacility(
      context,
      context.iranSideId,
      name,
      className,
      latitude,
      longitude,
      options
    )
  );
  const dprkHq9 = addFacility(
    context,
    context.iranSideId,
    "DPRK Long-Range SAM Proxy",
    "HQ-9",
    38.18,
    126.14,
    {
      heading: 155,
    }
  );
  const dprkHq16 = addFacility(
    context,
    context.iranSideId,
    "DPRK Medium SAM Proxy",
    "HQ-16",
    38.16,
    126.32,
    {
      heading: 156,
    }
  );
  const dprkTank2 = addFacility(
    context,
    context.iranSideId,
    "DPRK Armor Column 2",
    "K2 Black Panther",
    37.96,
    126.66,
    {
      route: [
        [37.84, 126.56],
        [37.7, 126.42],
      ],
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "DPRK Point Defense Proxy",
    "Pantsir-S1",
    38.06,
    126.6,
    {
      heading: 156,
    }
  );
  addFacility(
    context,
    context.iranSideId,
    "DPRK APC Reserve",
    "M113A1",
    37.98,
    126.62
  );
  addFacility(
    context,
    context.iranSideId,
    "DPRK Rocket Artillery Proxy 2",
    "Chunmoo MRLS",
    38.04,
    126.4,
    {
      heading: 160,
    }
  );

  const dprkCorvette = addShip(
    context,
    context.iranSideId,
    "DPRK Corvette Proxy",
    "Corvette",
    38.04,
    125.78,
    {
      heading: 140,
      route: [
        [37.88, 125.96],
        [37.7, 126.12],
      ],
    }
  );
  const dprkFrigate = addShip(
    context,
    context.iranSideId,
    "DPRK Frigate Proxy",
    "Frigate",
    37.92,
    125.68,
    {
      heading: 138,
      route: [
        [37.78, 125.9],
        [37.58, 126.06],
      ],
    }
  );
  addShip(
    context,
    context.iranSideId,
    "DPRK Patrol Boat Proxy",
    "Patrol Boat",
    38.1,
    125.9,
    {
      heading: 135,
      route: [
        [37.94, 126.02],
        [37.76, 126.16],
      ],
    }
  );
  addShip(
    context,
    context.iranSideId,
    "DPRK Patrol Boat Proxy 2",
    "Patrol Boat",
    38.04,
    125.76,
    {
      heading: 132,
      route: [
        [37.88, 125.96],
        [37.7, 126.14],
      ],
    }
  );

  const dprkF4 = addAircraft(
    context,
    context.iranSideId,
    "DPRK Strike Proxy 11",
    "F-4 Phantom II",
    38.14,
    126.38,
    {
      altitude: 18000,
      heading: 145,
      route: [
        [37.96, 126.32],
        [37.72, 126.22],
      ],
      weaponLoadout: [
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AGM-65 Maverick", quantity: 2 },
      ],
    }
  );
  const dprkDrone = addAircraft(
    context,
    context.iranSideId,
    "DPRK Drone Proxy 12",
    "MQ-9 Reaper",
    38.18,
    126.16,
    {
      altitude: 15000,
      heading: 145,
      route: [
        [37.98, 126.22],
        [37.78, 126.26],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );
  const dprkTomcat = addAircraft(
    context,
    context.iranSideId,
    "DPRK Interceptor Proxy 13",
    "F-14 Tomcat",
    38.2,
    126.28,
    {
      altitude: 23000,
      heading: 145,
      route: [
        [38.04, 126.22],
        [37.82, 126.16],
      ],
      weaponLoadout: [
        { className: "AIM-54 Phoenix", quantity: 1 },
        { className: "AIM-120 AMRAAM", quantity: 2 },
        { className: "AIM-9 Sidewinder", quantity: 2 },
      ],
    }
  );
  const dprkDrone2 = addAircraft(
    context,
    context.iranSideId,
    "DPRK Drone Proxy 14",
    "MQ-9 Reaper",
    38.08,
    126.02,
    {
      altitude: 14500,
      heading: 145,
      route: [
        [37.92, 126.1],
        [37.74, 126.22],
      ],
      weaponLoadout: [{ className: "AGM-65 Maverick", quantity: 2 }],
    }
  );

  const rokPatrolBox = [
    addReferencePoint(context, context.usSideId, "ROK RP-1", 37.72, 126.16),
    addReferencePoint(context, context.usSideId, "ROK RP-2", 37.92, 126.04),
    addReferencePoint(context, context.usSideId, "ROK RP-3", 38.04, 126.18),
    addReferencePoint(context, context.usSideId, "ROK RP-4", 37.84, 126.34),
  ];
  createPatrolMission(
    context,
    context.usSideId,
    "한국 CAP - 서해 및 수도권 접근축",
    [
      rokF15.id,
      rokKf21.id,
      rokF35.id,
      rokF15Wing.id,
      rokDrone2.id,
      rokDrone3.id,
    ],
    rokPatrolBox
  );
  createStrikeMission(
    context,
    context.usSideId,
    "한국 타격 - 북측 방공 및 발사대 제압",
    [rokF16.id, rokDrone.id, rokFa50.id, rokKf16.id],
    [dprkLauncher.id, dprkHq16.id, dprkHq9.id, dprkTank2.id]
  );
  createStrikeMission(
    context,
    context.usSideId,
    "한국 타격 - 서해 해상 차단",
    [rokKf21.id, rokDrone2.id, rokF15.id],
    [dprkFrigate.id, dprkCorvette.id, dprkLauncher.id]
  );
  createStrikeMission(
    context,
    context.usSideId,
    "한국 타격 - 북측 활주로 및 지휘절단",
    [rokF35.id, rokF15Wing.id, rokDrone3.id],
    [haeju.id, kaesong.id, dprkHq9.id, dprkLauncher.id]
  );

  const dprkPatrolBox = [
    addReferencePoint(context, context.iranSideId, "DPRK RP-1", 38.16, 126.0),
    addReferencePoint(context, context.iranSideId, "DPRK RP-2", 38.04, 126.14),
    addReferencePoint(context, context.iranSideId, "DPRK RP-3", 37.92, 126.28),
    addReferencePoint(context, context.iranSideId, "DPRK RP-4", 38.08, 126.4),
  ];
  createPatrolMission(
    context,
    context.iranSideId,
    "북한 CAP - 서해 남하 축",
    [dprkF4.id, dprkDrone.id, dprkTomcat.id, dprkDrone2.id],
    dprkPatrolBox
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "북한 타격 - 수도권 압박",
    [dprkF4.id, dprkDrone.id, dprkTomcat.id],
    [seoul.id, lSam.id, cheongung.id, rokDestroyer.id, rokSejong.id]
  );
  createStrikeMission(
    context,
    context.iranSideId,
    "북한 타격 - 서해 축 교란",
    [dprkDrone2.id, dprkTomcat.id],
    [seosan.id, rokDokdo.id, hyunmooBattery.id, rokTank2.id]
  );

  return exportScenario(context);
}

const legacyIranVsUsScenarioBuilders = [
  buildBandarAbbasSortieScenario,
  buildAlUdeidCounterstrikeScenario,
  buildAbuMusaLandingScenario,
  buildKhuzestanArmorBreakthroughScenario,
];
void legacyIranVsUsScenarioBuilders;

export const iranVsUsScenarioPresets: ScenarioPresetDefinition[] = [
  {
    name: "iran_vs_us_hormuz_blockade",
    displayName: "이란 vs 미국 - 호르무즈 봉쇄",
    regenerateScenarioId: true,
    designIntent:
      "좁은 해협에서는 함정 숫자보다 해안 방공, 상시 ISR, 호위 편대의 배치가 작전 템포를 좌우한다는 점을 보여주기 위한 시나리오입니다.",
    assetHighlights: [
      "항모 전단",
      "해안 방공",
      "공중급유기",
      "무인기 ISR",
      "전진기지",
    ],
    scenario: buildHormuzBlockadeScenario(),
  },
  {
    name: "iran_vs_us_al_dhafra_drone_raid",
    displayName: "이란 vs 미국 - 알다프라 드론 공습",
    regenerateScenarioId: true,
    designIntent:
      "기지 생존성은 전투기 성능이 아니라 분산기지, 수송기, 방공 다층망, 저속 드론 대응 체계까지 합쳐져야 유지된다는 점을 말하려는 시나리오입니다.",
    assetHighlights: [
      "대형 공군기지",
      "드론 공습",
      "패트리엇/사드",
      "수송기",
      "기지 방호 장갑차",
    ],
    scenario: buildAlDhafraDroneRaidScenario(),
  },
];

export const koreaVsNorthKoreaScenarioPresets: ScenarioPresetDefinition[] = [
  {
    name: "korea_vs_north_korea_west_sea_defense",
    displayName: "한국 vs 북한 - 서해 합동 방어",
    regenerateScenarioId: true,
    designIntent:
      "서해와 수도권 접근축에서는 함정, 방공망, 전차, 반격 포병, 전술기, 드론이 동시에 묶여야 억제가 성립한다는 점을 보여주기 위한 시나리오입니다.",
    assetHighlights: [
      "한국형 방공망",
      "서해 함정",
      "수도권 방어",
      "북측 발사대 압박",
      "드론 ISR",
    ],
    scenario: buildKoreaVsNorthKoreaWestSeaScenario(),
  },
];

export const strategicScenarioPresets: ScenarioPresetDefinition[] = [
  ...iranVsUsScenarioPresets,
  ...koreaVsNorthKoreaScenarioPresets,
];

export function findIranVsUsScenarioPreset(name: string) {
  return iranVsUsScenarioPresets.find((preset) => preset.name === name);
}

export function findKoreaVsNorthKoreaScenarioPreset(name: string) {
  return koreaVsNorthKoreaScenarioPresets.find(
    (preset) => preset.name === name
  );
}

export function findStrategicScenarioPreset(name: string) {
  return strategicScenarioPresets.find((preset) => preset.name === name);
}
