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
} from "./builders";
export function buildKoreaVsNorthKoreaWestSeaScenario() {
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
  const rokReserveFacilities: Array<{
    name: string;
    className: string;
    latitude: number;
    longitude: number;
    options: FacilityOptions;
  }> = [
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
  ];

  rokReserveFacilities.forEach(({ name, className, latitude, longitude, options }) =>
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



