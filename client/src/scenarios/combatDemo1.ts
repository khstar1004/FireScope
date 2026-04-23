const CENTER_LAT = 38.07;
const CENTER_LON = 127.31;

type SideColor = "blue" | "red";

interface WeaponProfile {
  className: string;
  speed: number;
  maxFuel: number;
  fuelRate: number;
  lethality: number;
  altitude?: number;
}

interface PlatformRef {
  id: string;
  sideId: string;
  sideColor: SideColor;
  latitude: number;
  longitude: number;
  altitude: number;
}

const weaponProfiles: Record<string, WeaponProfile> = {
  // Demo speeds are intentionally reduced so launches stay visible on the map.
  chunmooRocket: {
    className: "Chunmoo Guided Rocket",
    speed: 115,
    maxFuel: 900,
    fuelRate: 80,
    lethality: 0.7,
  },
  tacticalSurfaceMissile: {
    className: "Tactical Surface to Surface Missile",
    speed: 170,
    maxFuel: 1800,
    fuelRate: 110,
    lethality: 0.9,
  },
  lsamInterceptor: {
    className: "L-SAM Interceptor",
    speed: 210,
    maxFuel: 1800,
    fuelRate: 95,
    lethality: 0.9,
    altitude: 10000,
  },
  cheongungInterceptor: {
    className: "Cheongung-II Interceptor",
    speed: 185,
    maxFuel: 1500,
    fuelRate: 90,
    lethality: 0.87,
    altitude: 10000,
  },
  tankRound: {
    className: "120mm Tank Round",
    speed: 95,
    maxFuel: 180,
    fuelRate: 30,
    lethality: 0.62,
  },
  tankGuidedMissile: {
    className: "Tank Guided Missile",
    speed: 90,
    maxFuel: 240,
    fuelRate: 35,
    lethality: 0.74,
  },
  s400Interceptor: {
    className: "48N6 (S-400 Triumf)",
    speed: 210,
    maxFuel: 1900,
    fuelRate: 95,
    lethality: 0.9,
    altitude: 10000,
  },
  hq9Interceptor: {
    className: "HQ-9",
    speed: 180,
    maxFuel: 1800,
    fuelRate: 100,
    lethality: 0.85,
    altitude: 10000,
  },
  pantsirInterceptor: {
    className: "57E6E (Pantsir-S1)",
    speed: 130,
    maxFuel: 900,
    fuelRate: 70,
    lethality: 0.7,
    altitude: 10000,
  },
  torInterceptor: {
    className: "9M331 (Tor-M2)",
    speed: 120,
    maxFuel: 900,
    fuelRate: 65,
    lethality: 0.75,
    altitude: 10000,
  },
  hq17Interceptor: {
    className: "HQ-17",
    speed: 110,
    maxFuel: 900,
    fuelRate: 65,
    lethality: 0.75,
    altitude: 10000,
  },
};

function buildStoredWeapon(
  platform: PlatformRef,
  profileKey: string,
  quantity: number
) {
  const profile = weaponProfiles[profileKey];

  return {
    id: `${platform.id}-${profileKey}`,
    launcherId: platform.id,
    name: profile.className,
    sideId: platform.sideId,
    className: profile.className,
    latitude: 0,
    longitude: 0,
    altitude: profile.altitude ?? platform.altitude,
    heading: 90,
    speed: profile.speed,
    currentFuel: profile.maxFuel,
    maxFuel: profile.maxFuel,
    fuelRate: profile.fuelRate,
    range: 100,
    route: [],
    sideColor: platform.sideColor,
    targetId: null,
    lethality: profile.lethality,
    maxQuantity: quantity,
    currentQuantity: quantity,
  };
}

function buildFacility(
  platform: PlatformRef & {
    name: string;
    className: string;
    heading: number;
    range: number;
    detectionArcDegrees: number;
    weaponLoadout: Array<[string, number]>;
  }
) {
  return {
    id: platform.id,
    name: platform.name,
    sideId: platform.sideId,
    className: platform.className,
    latitude: platform.latitude,
    longitude: platform.longitude,
    altitude: platform.altitude,
    range: platform.range,
    heading: platform.heading,
    speed: 0,
    route: [],
    detectionArcDegrees: platform.detectionArcDegrees,
    sideColor: platform.sideColor,
    weapons: platform.weaponLoadout.map(([profileKey, quantity]) =>
      buildStoredWeapon(platform, profileKey, quantity)
    ),
  };
}

function buildArmy(
  platform: PlatformRef & {
    name: string;
    className: string;
    heading: number;
    speed: number;
    range: number;
    route: number[][];
    weaponLoadout: Array<[string, number]>;
  }
) {
  return {
    id: platform.id,
    name: platform.name,
    sideId: platform.sideId,
    className: platform.className,
    latitude: platform.latitude,
    longitude: platform.longitude,
    altitude: platform.altitude,
    heading: platform.heading,
    speed: platform.speed,
    currentFuel: 12000,
    maxFuel: 12000,
    fuelRate: 35,
    range: platform.range,
    route: platform.route,
    selected: false,
    sideColor: platform.sideColor,
    weapons: platform.weaponLoadout.map(([profileKey, quantity]) =>
      buildStoredWeapon(platform, profileKey, quantity)
    ),
    desiredRoute: [],
  };
}

function interpolate(
  origin: PlatformRef,
  target: PlatformRef,
  progress: number
) {
  return {
    latitude: origin.latitude + (target.latitude - origin.latitude) * progress,
    longitude:
      origin.longitude + (target.longitude - origin.longitude) * progress,
  };
}

function buildInFlightWeapon(
  id: string,
  nameSuffix: string,
  origin: PlatformRef,
  target: PlatformRef,
  profileKey: string,
  heading: number,
  progress: number
) {
  const profile = weaponProfiles[profileKey];
  const position = interpolate(origin, target, progress);

  return {
    id,
    launcherId: origin.id,
    launchLatitude: origin.latitude,
    launchLongitude: origin.longitude,
    launchAltitude: origin.altitude,
    name: `${profile.className} ${nameSuffix}`,
    sideId: origin.sideId,
    className: profile.className,
    latitude: position.latitude,
    longitude: position.longitude,
    altitude: profile.altitude ?? origin.altitude,
    heading,
    speed: profile.speed,
    currentFuel: profile.maxFuel * 0.92,
    maxFuel: profile.maxFuel,
    fuelRate: profile.fuelRate,
    range: 100,
    route: [[target.latitude, target.longitude]],
    sideColor: origin.sideColor,
    targetId: target.id,
    lethality: profile.lethality,
    maxQuantity: 1,
    currentQuantity: 1,
  };
}

const blueSideId = "combat-demo-1-blue";
const redSideId = "combat-demo-1-red";

const bluePlatforms = {
  chunmoo: {
    id: "blue-chunmoo-1",
    sideId: blueSideId,
    sideColor: "blue" as const,
    latitude: 38.0456,
    longitude: 127.2818,
    altitude: 0,
  },
  tacticalMissile: {
    id: "blue-tactical-missile-1",
    sideId: blueSideId,
    sideColor: "blue" as const,
    latitude: 38.0388,
    longitude: 127.3026,
    altitude: 0,
  },
  lsam: {
    id: "blue-lsam-1",
    sideId: blueSideId,
    sideColor: "blue" as const,
    latitude: 38.0548,
    longitude: 127.3266,
    altitude: 0,
  },
  cheongung: {
    id: "blue-cheongung-1",
    sideId: blueSideId,
    sideColor: "blue" as const,
    latitude: 38.0615,
    longitude: 127.2962,
    altitude: 0,
  },
  k2: {
    id: "blue-k2-1",
    sideId: blueSideId,
    sideColor: "blue" as const,
    latitude: 38.0664,
    longitude: 127.3132,
    altitude: 0,
  },
};

const redPlatforms = {
  s400: {
    id: "red-s400-1",
    sideId: redSideId,
    sideColor: "red" as const,
    latitude: 38.1002,
    longitude: 127.3278,
    altitude: 0,
  },
  hq9: {
    id: "red-hq9-1",
    sideId: redSideId,
    sideColor: "red" as const,
    latitude: 38.0962,
    longitude: 127.2922,
    altitude: 0,
  },
  pantsir: {
    id: "red-pantsir-1",
    sideId: redSideId,
    sideColor: "red" as const,
    latitude: 38.0858,
    longitude: 127.3424,
    altitude: 0,
  },
  tor: {
    id: "red-tor-1",
    sideId: redSideId,
    sideColor: "red" as const,
    latitude: 38.1114,
    longitude: 127.3065,
    altitude: 0,
  },
  hq17: {
    id: "red-hq17-1",
    sideId: redSideId,
    sideColor: "red" as const,
    latitude: 38.0896,
    longitude: 127.3176,
    altitude: 0,
  },
};

const mobilePlatforms = {
  blueK2Reserve: {
    id: "blue-k2-reserve-1",
    sideId: blueSideId,
    sideColor: "blue" as const,
    latitude: 38.0502,
    longitude: 127.2698,
    altitude: 0,
  },
  blueCommandApc: {
    id: "blue-command-apc-1",
    sideId: blueSideId,
    sideColor: "blue" as const,
    latitude: 38.0436,
    longitude: 127.3166,
    altitude: 0,
  },
  redTorScreen: {
    id: "red-tor-screen-1",
    sideId: redSideId,
    sideColor: "red" as const,
    latitude: 38.114,
    longitude: 127.333,
    altitude: 0,
  },
  redHq17Screen: {
    id: "red-hq17-screen-1",
    sideId: redSideId,
    sideColor: "red" as const,
    latitude: 38.106,
    longitude: 127.284,
    altitude: 0,
  },
};

const facilities = [
  buildFacility({
    ...bluePlatforms.chunmoo,
    name: "아군 천무 포대",
    className: "Chunmoo MRLS",
    heading: 32,
    range: 80,
    detectionArcDegrees: 120,
    weaponLoadout: [["chunmooRocket", 5]],
  }),
  buildFacility({
    ...bluePlatforms.tacticalMissile,
    name: "아군 전술지대지 발사대",
    className: "Tactical Surface to Surface Missile Launcher",
    heading: 18,
    range: 180,
    detectionArcDegrees: 90,
    weaponLoadout: [["tacticalSurfaceMissile", 1]],
  }),
  buildFacility({
    ...bluePlatforms.lsam,
    name: "아군 L-SAM 포대",
    className: "L-SAM",
    heading: 350,
    range: 150,
    detectionArcDegrees: 150,
    weaponLoadout: [["lsamInterceptor", 6]],
  }),
  buildFacility({
    ...bluePlatforms.cheongung,
    name: "아군 천궁-II 포대",
    className: "Cheongung-II (KM-SAM Block II)",
    heading: 38,
    range: 65,
    detectionArcDegrees: 150,
    weaponLoadout: [["cheongungInterceptor", 8]],
  }),
  buildFacility({
    ...bluePlatforms.k2,
    name: "아군 K2 차단 소대",
    className: "K2 Black Panther",
    heading: 8,
    range: 8,
    detectionArcDegrees: 100,
    weaponLoadout: [
      ["tankRound", 6],
      ["tankGuidedMissile", 2],
    ],
  }),
  buildFacility({
    ...redPlatforms.s400,
    name: "적군 S-400 포대",
    className: "S-400 Triumf",
    heading: 210,
    range: 200,
    detectionArcDegrees: 140,
    weaponLoadout: [["s400Interceptor", 5]],
  }),
  buildFacility({
    ...redPlatforms.hq9,
    name: "적군 HQ-9 포대",
    className: "HQ-9",
    heading: 152,
    range: 200,
    detectionArcDegrees: 140,
    weaponLoadout: [["hq9Interceptor", 5]],
  }),
  buildFacility({
    ...redPlatforms.pantsir,
    name: "적군 판치르 근접방공",
    className: "Pantsir-S1",
    heading: 236,
    range: 10,
    detectionArcDegrees: 100,
    weaponLoadout: [["pantsirInterceptor", 8]],
  }),
  buildFacility({
    ...redPlatforms.tor,
    name: "적군 Tor-M2 기동방공",
    className: "Tor-M2",
    heading: 184,
    range: 10,
    detectionArcDegrees: 100,
    weaponLoadout: [["torInterceptor", 8]],
  }),
  buildFacility({
    ...redPlatforms.hq17,
    name: "적군 HQ-17 단거리방공",
    className: "HQ-17",
    heading: 206,
    range: 10,
    detectionArcDegrees: 100,
    weaponLoadout: [["hq17Interceptor", 8]],
  }),
];

const armies = [
  buildArmy({
    ...mobilePlatforms.blueK2Reserve,
    name: "아군 K2 기동 예비대",
    className: "K2 Black Panther",
    heading: 62,
    speed: 7,
    range: 8,
    route: [
      [38.0578, 127.285],
      [38.0642, 127.3014],
    ],
    weaponLoadout: [
      ["tankRound", 4],
      ["tankGuidedMissile", 1],
    ],
  }),
  buildArmy({
    ...mobilePlatforms.blueCommandApc,
    name: "아군 KM900 기동 지휘차량",
    className: "KM900 APC",
    heading: 352,
    speed: 5,
    range: 6,
    route: [
      [38.0508, 127.3192],
      [38.0586, 127.3146],
    ],
    weaponLoadout: [],
  }),
  buildArmy({
    ...mobilePlatforms.redTorScreen,
    name: "적군 Tor-M2 이동 방공조",
    className: "Tor-M2",
    heading: 206,
    speed: 6,
    range: 10,
    route: [
      [38.1038, 127.327],
      [38.0948, 127.321],
    ],
    weaponLoadout: [["torInterceptor", 4]],
  }),
  buildArmy({
    ...mobilePlatforms.redHq17Screen,
    name: "적군 HQ-17 이동 방공조",
    className: "HQ-17",
    heading: 144,
    speed: 5,
    range: 10,
    route: [
      [38.099, 127.2936],
      [38.0912, 127.3024],
    ],
    weaponLoadout: [["hq17Interceptor", 4]],
  }),
];

const weapons = [
  buildInFlightWeapon(
    "blue-chunmoo-rocket-inbound-1",
    "#401",
    bluePlatforms.chunmoo,
    redPlatforms.hq9,
    "chunmooRocket",
    18,
    0.14
  ),
  buildInFlightWeapon(
    "blue-tactical-missile-inbound-1",
    "#402",
    bluePlatforms.tacticalMissile,
    redPlatforms.s400,
    "tacticalSurfaceMissile",
    25,
    0.12
  ),
  buildInFlightWeapon(
    "blue-tank-round-inbound-1",
    "#403",
    bluePlatforms.k2,
    redPlatforms.hq17,
    "tankRound",
    22,
    0.1
  ),
  buildInFlightWeapon(
    "red-hq9-inbound-1",
    "#501",
    redPlatforms.hq9,
    bluePlatforms.lsam,
    "hq9Interceptor",
    214,
    0.14
  ),
  buildInFlightWeapon(
    "red-s400-inbound-1",
    "#502",
    redPlatforms.s400,
    bluePlatforms.cheongung,
    "s400Interceptor",
    220,
    0.12
  ),
  buildInFlightWeapon(
    "red-tor-inbound-1",
    "#503",
    redPlatforms.tor,
    bluePlatforms.k2,
    "torInterceptor",
    186,
    0.1
  ),
];

const combatDemo1 = {
  currentScenario: {
    id: "combat-demo-1",
    name: "전투데모#1",
    startTime: 1770000000,
    currentTime: 1770000000,
    duration: 5400,
    endTime: 1770005400,
    sides: [
      {
        id: blueSideId,
        name: "아군",
        totalScore: 0,
        color: "blue",
      },
      {
        id: redSideId,
        name: "적군",
        totalScore: 0,
        color: "red",
      },
    ],
    timeCompression: 1,
    aircraft: [],
    armies,
    ships: [],
    facilities,
    airbases: [],
    weapons,
    referencePoints: [
      {
        id: "combat-demo-1-center",
        name: "승진 중심",
        sideId: blueSideId,
        latitude: CENTER_LAT,
        longitude: CENTER_LON,
        altitude: 0,
        sideColor: "blue",
      },
      {
        id: "combat-demo-1-forward-line",
        name: "교전 기준선",
        sideId: blueSideId,
        latitude: 38.079,
        longitude: 127.31,
        altitude: 0,
        sideColor: "blue",
      },
    ],
    missions: [],
    relationships: {
      hostiles: {
        [blueSideId]: [redSideId],
        [redSideId]: [blueSideId],
      },
      allies: {
        [blueSideId]: [],
        [redSideId]: [],
      },
    },
    doctrine: {
      [blueSideId]: {
        "Aircraft attack hostile aircraft": true,
        "Aircraft chase hostile aircraft": true,
        "Aircraft RTB when out of range of homebase": false,
        "Aircraft RTB when strike mission complete": false,
        "SAMs attack hostile aircraft": false,
        "Ships attack hostile aircraft": true,
      },
      [redSideId]: {
        "Aircraft attack hostile aircraft": true,
        "Aircraft chase hostile aircraft": true,
        "Aircraft RTB when out of range of homebase": false,
        "Aircraft RTB when strike mission complete": false,
        "SAMs attack hostile aircraft": false,
        "Ships attack hostile aircraft": true,
      },
    },
  },
  currentSideId: blueSideId,
  selectedUnitId: "",
  mapView: {
    defaultCenter: [CENTER_LON, CENTER_LAT],
    currentCameraCenter: [CENTER_LON, CENTER_LAT],
    defaultZoom: 10.8,
    currentCameraZoom: 10.8,
  },
};

export default combatDemo1;
