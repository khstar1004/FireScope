import {
  addAirbase,
  addAircraft,
  addAircraftToAirbase,
  addAircraftToShip,
  addFacility,
  addReferencePoint,
  addShip,
  createPatrolMission,
  createScenarioContext,
  createStrikeMission,
  exportScenario,
  unixTime,
  type FacilityOptions,
} from "../builders";
export function buildAlDhafraDroneRaidScenario() {
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


