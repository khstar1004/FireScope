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
export function buildHormuzBlockadeScenario() {
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


