const TARGET_LAT = 38.07775;
const TARGET_LON = 127.354386;

type SideColor = "blue" | "teal" | "orange" | "red";

interface BatteryPlacement {
  latitude: number;
  longitude: number;
  heading: number;
}

interface BatterySideConfig {
  id: string;
  name: string;
  color: SideColor;
  placements: BatteryPlacement[];
}

// Simulation-only deployment concepts anchored near the training-center
// coordinate so the 3/5/8 cell comparison shows dispersion vs density tradeoffs.
const batterySides: BatterySideConfig[] = [
  {
    id: "battery-cell-3",
    name: "3포대 셀",
    color: "teal",
    placements: [
      { latitude: 38.03875, longitude: 127.295186, heading: 18 },
      { latitude: 38.04495, longitude: 127.306786, heading: 26 },
      { latitude: 38.03655, longitude: 127.316586, heading: 34 },
    ],
  },
  {
    id: "battery-cell-5",
    name: "5포대 셀",
    color: "blue",
    placements: [
      { latitude: 38.04925, longitude: 127.324186, heading: 18 },
      { latitude: 38.05355, longitude: 127.332586, heading: 14 },
      { latitude: 38.05095, longitude: 127.343886, heading: 6 },
      { latitude: 38.05615, longitude: 127.353186, heading: 352 },
      { latitude: 38.05985, longitude: 127.362886, heading: 344 },
    ],
  },
  {
    id: "battery-cell-8",
    name: "8포대 셀",
    color: "orange",
    placements: [
      { latitude: 38.05855, longitude: 127.336586, heading: 12 },
      { latitude: 38.06215, longitude: 127.342986, heading: 10 },
      { latitude: 38.06455, longitude: 127.348786, heading: 8 },
      { latitude: 38.06725, longitude: 127.354186, heading: 4 },
      { latitude: 38.06895, longitude: 127.359586, heading: 358 },
      { latitude: 38.06655, longitude: 127.364786, heading: 350 },
      { latitude: 38.06295, longitude: 127.369386, heading: 344 },
      { latitude: 38.05975, longitude: 127.373586, heading: 338 },
    ],
  },
];

function buildBatteryWeapon(sideId: string, sideColor: SideColor, id: string) {
  return {
    id: `${id}-rocket`,
    launcherId: id,
    name: "Chunmoo Guided Rocket",
    sideId,
    className: "Chunmoo Guided Rocket",
    latitude: 0,
    longitude: 0,
    altitude: 0,
    heading: 45,
    speed: 520,
    currentFuel: 160,
    maxFuel: 160,
    fuelRate: 80,
    range: 90,
    route: [],
    sideColor,
    targetId: "",
    lethality: 0.74,
    maxQuantity: 1,
    currentQuantity: 1,
  };
}

function buildBatteryFacility(
  config: BatterySideConfig,
  placement: BatteryPlacement,
  index: number
) {
  const id = `${config.id}-battery-${index + 1}`;
  return {
    id,
    name: `${config.name} 천무 ${index + 1}`,
    sideId: config.id,
    className: "Chunmoo",
    latitude: placement.latitude,
    longitude: placement.longitude,
    altitude: 0,
    range: 48,
    heading: placement.heading,
    speed: 12,
    route: [],
    detectionArcDegrees: 170,
    sideColor: config.color,
    weapons: [buildBatteryWeapon(config.id, config.color, id)],
  };
}

const targetFacilities = [
  {
    id: "economic-target-command",
    name: "표적 지휘소",
    sideId: "target-cell",
    className: "Command Post",
    latitude: TARGET_LAT - 0.0012,
    longitude: TARGET_LON - 0.0018,
    altitude: 0,
    range: 6,
    heading: 180,
    route: [],
    detectionArcDegrees: 90,
    sideColor: "red",
    weapons: [],
  },
  {
    id: "economic-target-radar",
    name: "표적 방공레이더",
    sideId: "target-cell",
    className: "Radar Site",
    latitude: TARGET_LAT + 0.0056,
    longitude: TARGET_LON - 0.0044,
    altitude: 0,
    range: 8,
    heading: 210,
    route: [],
    detectionArcDegrees: 140,
    sideColor: "red",
    weapons: [],
  },
  {
    id: "economic-target-ammo",
    name: "표적 탄약집적소",
    sideId: "target-cell",
    className: "Ammo Depot",
    latitude: TARGET_LAT - 0.0048,
    longitude: TARGET_LON + 0.0058,
    altitude: 0,
    range: 5,
    heading: 120,
    route: [],
    detectionArcDegrees: 120,
    sideColor: "red",
    weapons: [],
  },
];

const referencePoints = [
  {
    id: "economy-rp-west",
    name: "서측 발사 회랑",
    sideId: "battery-cell-5",
    latitude: 38.05675,
    longitude: 127.333386,
    altitude: 0,
    sideColor: "blue",
  },
  {
    id: "economy-rp-east",
    name: "동측 발사 회랑",
    sideId: "battery-cell-5",
    latitude: 38.06475,
    longitude: 127.366386,
    altitude: 0,
    sideColor: "blue",
  },
  {
    id: "economy-rp-target",
    name: "표적 중심",
    sideId: "battery-cell-5",
    latitude: TARGET_LAT,
    longitude: TARGET_LON,
    altitude: 0,
    sideColor: "blue",
  },
];

const hostiles = Object.fromEntries(
  [
    ...batterySides.map((side) => [side.id, ["target-cell"]]),
    ["target-cell", batterySides.map((side) => side.id)],
  ].map(([sideId, hostileIds]) => [sideId, hostileIds])
);

const allies = Object.fromEntries(
  [
    ...batterySides.map((side) => [
      side.id,
      batterySides.filter((ally) => ally.id !== side.id).map((ally) => ally.id),
    ]),
    ["target-cell", []],
  ].map(([sideId, allyIds]) => [sideId, allyIds])
);

const doctrine = Object.fromEntries([
  ...batterySides.map((side) => [
    side.id,
    {
      "Aircraft attack hostile aircraft": false,
      "Aircraft chase hostile aircraft": false,
      "Aircraft RTB when out of range of homebase": false,
      "Aircraft RTB when strike mission complete": false,
      "SAMs attack hostile aircraft": false,
      "Ships attack hostile aircraft": false,
    },
  ]),
  [
    "target-cell",
    {
      "Aircraft attack hostile aircraft": false,
      "Aircraft chase hostile aircraft": false,
      "Aircraft RTB when out of range of homebase": false,
      "Aircraft RTB when strike mission complete": false,
      "SAMs attack hostile aircraft": false,
      "Ships attack hostile aircraft": false,
    },
  ],
]);

const facilities = [
  ...batterySides.flatMap((side) =>
    side.placements.map((placement, index) =>
      buildBatteryFacility(side, placement, index)
    )
  ),
  ...targetFacilities,
];

const focusFireEconomyDemo = {
  currentScenario: {
    id: "focus-fire-economy-demo",
    name: "화력 배치 경제성 비교",
    startTime: 1770000000,
    currentTime: 1770000000,
    duration: 5400,
    endTime: 1770005400,
    sides: [
      ...batterySides.map((side) => ({
        id: side.id,
        name: side.name,
        totalScore: 0,
        color: side.color,
      })),
      {
        id: "target-cell",
        name: "표적 셀",
        totalScore: 0,
        color: "red",
      },
    ],
    timeCompression: 1,
    aircraft: [],
    ships: [],
    facilities,
    airbases: [],
    weapons: [],
    referencePoints,
    missions: [],
    relationships: {
      hostiles,
      allies,
    },
    doctrine,
  },
  currentSideId: "battery-cell-5",
  selectedUnitId: "",
  mapView: {
    defaultCenter: [127.340386, 38.06375],
    currentCameraCenter: [127.340386, 38.06375],
    defaultZoom: 9.5,
    currentCameraZoom: 9.5,
  },
};

export default focusFireEconomyDemo;
