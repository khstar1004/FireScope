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
export function buildAlUdeidCounterstrikeScenario() {
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


