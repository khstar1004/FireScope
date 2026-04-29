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
export function buildAbuMusaLandingScenario() {
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


