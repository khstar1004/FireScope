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
export function buildKhuzestanArmorBreakthroughScenario() {
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



