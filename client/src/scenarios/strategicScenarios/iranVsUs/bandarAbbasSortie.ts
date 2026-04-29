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
export function buildBandarAbbasSortieScenario() {
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


