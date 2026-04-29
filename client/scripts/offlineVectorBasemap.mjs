import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const KOREAN_PENINSULA = [
  [125.18, 34.1],
  [126.0, 34.26],
  [126.85, 34.36],
  [127.75, 34.56],
  [128.48, 34.84],
  [129.18, 35.06],
  [129.74, 35.64],
  [129.54, 36.5],
  [129.44, 37.34],
  [129.6, 38.28],
  [129.24, 39.08],
  [128.72, 40.02],
  [128.18, 41.18],
  [127.12, 42.34],
  [126.08, 41.96],
  [125.34, 41.16],
  [124.92, 40.12],
  [124.68, 39.06],
  [125.18, 38.34],
  [126.0, 37.86],
  [126.24, 36.96],
  [125.76, 36.12],
  [125.34, 35.26],
  [125.18, 34.1],
];

const JEJU_ISLAND = [
  [126.12, 33.28],
  [126.36, 33.17],
  [126.74, 33.2],
  [126.98, 33.36],
  [126.82, 33.52],
  [126.38, 33.58],
  [126.12, 33.46],
  [126.12, 33.28],
];

const CHINA_COAST = [
  [118.0, 30.0],
  [124.22, 30.0],
  [124.58, 34.4],
  [124.42, 37.3],
  [124.86, 40.0],
  [123.7, 41.4],
  [121.7, 42.8],
  [118.0, 43.4],
  [118.0, 30.0],
];

const JAPAN_COAST = [
  [129.8, 31.2],
  [131.4, 31.1],
  [132.6, 32.2],
  [133.8, 33.2],
  [135.2, 34.0],
  [136.0, 35.2],
  [134.6, 35.4],
  [132.8, 34.4],
  [131.0, 33.5],
  [129.8, 32.4],
  [129.8, 31.2],
];

const DMZ_LINE = [
  [126.15, 37.83],
  [126.72, 37.9],
  [127.28, 38.02],
  [127.82, 38.15],
  [128.34, 38.25],
  [128.58, 38.34],
];

const SEUNGJIN_LOCAL_ROADS = [
  [
    [127.18, 37.95],
    [127.25, 38.0],
    [127.33, 38.06],
    [127.42, 38.11],
    [127.52, 38.18],
  ],
  [
    [127.22, 38.2],
    [127.3, 38.14],
    [127.38, 38.08],
    [127.47, 37.99],
  ],
  [
    [127.17, 38.06],
    [127.25, 38.07],
    [127.36, 38.075],
    [127.49, 38.09],
  ],
];

const SEUNGJIN_WATER = [
  [
    [127.16, 38.02],
    [127.24, 38.03],
    [127.34, 38.04],
    [127.44, 38.055],
    [127.56, 38.07],
  ],
];

const REGION_PROFILES = {
  korea: {
    label: "Korea Offline Overview",
    bounds: {
      west: 124.5,
      south: 33.0,
      east: 132.5,
      north: 39.5,
    },
    cities: [
      ["Seoul", 126.978, 37.5665],
      ["Incheon", 126.7052, 37.4563],
      ["Daejeon", 127.3845, 36.3504],
      ["Daegu", 128.6014, 35.8714],
      ["Busan", 129.0756, 35.1796],
      ["Gwangju", 126.8526, 35.1595],
      ["Jeju", 126.5312, 33.4996],
      ["Pyongyang", 125.7625, 39.0392],
      ["Seungjin", 127.3544, 38.0778],
    ],
  },
  seungjin: {
    label: "Seungjin Firing Range AOI",
    bounds: {
      west: 127.13,
      south: 37.91,
      east: 127.58,
      north: 38.24,
    },
    cities: [
      ["Seungjin", 127.3544, 38.0778],
      ["Pocheon", 127.2003, 37.8949],
      ["Cheorwon", 127.3133, 38.1469],
    ],
  },
};

function polygonFeature(id, kind, name, coordinates, properties = {}) {
  return {
    type: "Feature",
    properties: {
      id,
      kind,
      name,
      ...properties,
    },
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}

function lineFeature(id, kind, name, coordinates, properties = {}) {
  return {
    type: "Feature",
    properties: {
      id,
      kind,
      name,
      ...properties,
    },
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

function pointFeature(id, kind, name, lon, lat, properties = {}) {
  return {
    type: "Feature",
    properties: {
      id,
      kind,
      name,
      ...properties,
    },
    geometry: {
      type: "Point",
      coordinates: [lon, lat],
    },
  };
}

function aoiFeatures(region, profile) {
  const { west, south, east, north } = profile.bounds;
  return [
    polygonFeature(`${region}-aoi`, "aoi", profile.label, [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ]),
    pointFeature(
      `${region}-center`,
      "target",
      profile.label,
      (west + east) / 2,
      (south + north) / 2
    ),
  ];
}

export function buildOfflineVectorBasemapGeoJson(regionId, extraFeatures = []) {
  const region = String(regionId ?? "korea").toLowerCase();
  const profile = REGION_PROFILES[region] ?? REGION_PROFILES.korea;
  const features = [
    polygonFeature("china-coast", "neighbor", "China Coast", CHINA_COAST),
    polygonFeature("japan-coast", "neighbor", "Japan Coast", JAPAN_COAST),
    polygonFeature(
      "korean-peninsula",
      "land",
      "Korean Peninsula",
      KOREAN_PENINSULA
    ),
    polygonFeature("jeju-island", "land", "Jeju Island", JEJU_ISLAND),
    lineFeature("dmz", "dmz", "DMZ", DMZ_LINE),
    ...aoiFeatures(region, profile),
    ...profile.cities.map(([name, lon, lat]) =>
      pointFeature(`${region}-${name.toLowerCase()}`, "city", name, lon, lat)
    ),
  ];

  if (region === "seungjin") {
    features.push(
      ...SEUNGJIN_LOCAL_ROADS.map((coordinates, index) =>
        lineFeature(
          `seungjin-road-${index + 1}`,
          "road",
          "Local route",
          coordinates
        )
      ),
      ...SEUNGJIN_WATER.map((coordinates, index) =>
        lineFeature(
          `seungjin-water-${index + 1}`,
          "water",
          "Local watercourse",
          coordinates
        )
      )
    );
  }

  return {
    type: "FeatureCollection",
    name: profile.label,
    features: [...features, ...extraFeatures],
  };
}

export async function writeOfflineVectorBasemap(
  packageDir,
  regionId,
  extraFeatures = []
) {
  const vectorDir = path.join(packageDir, "vector");
  await mkdir(vectorDir, { recursive: true });
  await writeFile(
    path.join(vectorDir, "basemap.geojson"),
    `${JSON.stringify(
      buildOfflineVectorBasemapGeoJson(regionId, extraFeatures),
      null,
      2
    )}\n`
  );
}
