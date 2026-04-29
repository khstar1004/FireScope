import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { writeOfflineVectorBasemap } from "./offlineVectorBasemap.mjs";

const rootDir = process.cwd();
const packageDir = path.join(rootDir, "public", "offline-map", "korea");
const envFiles = [
  path.join(rootDir, ".env"),
  path.join(rootDir, ".env.standalone"),
  path.join(rootDir, ".env.development"),
  path.join(rootDir, ".env.production"),
];
const OVERPASS_URLS = process.env.OVERPASS_URL
  ? [process.env.OVERPASS_URL]
  : [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://z.overpass-api.de/api/interpreter",
    ];

const bounds = {
  west: 124.5,
  south: 33.0,
  east: 132.5,
  north: 39.5,
};
const center = {
  longitude: 127.8,
  latitude: 36.35,
};

for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

const mapTilerApiKey = (
  process.env.MAPTILER_API_KEY ??
  process.env.VITE_MAPTILER_DEFAULT_KEY ??
  ""
).trim();
const satelliteTileUrl = mapTilerApiKey
  ? `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${encodeURIComponent(
      mapTilerApiKey
    )}`
  : "";

function parseIntegerEnv(name, fallback) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseFeatureLimitEnv(name, fallback) {
  return Math.max(0, parseIntegerEnv(name, fallback));
}

function wait(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function lonToTileX(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom);
}

function latToTileY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      2 ** zoom
  );
}

function tileRangeForBounds({ west, south, east, north }, zoom) {
  return {
    minX: lonToTileX(west, zoom),
    maxX: lonToTileX(east, zoom),
    minY: latToTileY(north, zoom),
    maxY: latToTileY(south, zoom),
  };
}

function formatTileUrl(template, { z, x, y }) {
  return template
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

function redactUrl(url) {
  return url.replace(/key=[^&]+/g, "key=<redacted>");
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function downloadFile(url, outputPath) {
  if (existsSync(outputPath) && process.env.OFFLINE_MAP_FORCE !== "1") {
    return "cached";
  }

  const retries = parseIntegerEnv("OFFLINE_MAP_DOWNLOAD_RETRIES", 5);
  const retryDelayMs = parseIntegerEnv("OFFLINE_MAP_RETRY_DELAY_MS", 1500);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await ensureDir(path.dirname(outputPath));
        const buffer = Buffer.from(await response.arrayBuffer());
        await writeFile(outputPath, buffer);
        return "downloaded";
      }

      const shouldRetry =
        (response.status === 429 || response.status >= 500) &&
        attempt < retries;
      if (!shouldRetry) {
        throw new Error(
          `Download failed ${response.status}: ${redactUrl(url)}`
        );
      }
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
    }

    await wait(Math.min(30000, retryDelayMs * 2 ** attempt));
  }

  throw new Error(`Download failed after retries: ${redactUrl(url)}`);
}

async function runWithConcurrency(items, concurrency, worker) {
  let cursor = 0;
  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(concurrency, items.length)) },
      async () => {
        while (cursor < items.length) {
          const item = items[cursor];
          cursor += 1;
          await worker(item);
        }
      }
    )
  );
}

async function downloadSatelliteTiles() {
  if (!satelliteTileUrl) {
    throw new Error(
      "MAPTILER_API_KEY or VITE_MAPTILER_DEFAULT_KEY is required."
    );
  }

  const minZoom = parseIntegerEnv("OFFLINE_KOREA_SATELLITE_MIN_ZOOM", 5);
  const maxZoom = parseIntegerEnv("OFFLINE_KOREA_SATELLITE_MAX_ZOOM", 11);
  const concurrency = parseIntegerEnv("OFFLINE_MAP_DOWNLOAD_CONCURRENCY", 4);
  const tiles = [];

  for (let z = minZoom; z <= maxZoom; z += 1) {
    const { minX, maxX, minY, maxY } = tileRangeForBounds(bounds, z);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        tiles.push({ z, x, y });
      }
    }
  }

  let downloaded = 0;
  let cached = 0;
  await runWithConcurrency(tiles, concurrency, async (tile) => {
    const url = formatTileUrl(satelliteTileUrl, tile);
    const outputPath = path.join(
      packageDir,
      "raster",
      "satellite",
      String(tile.z),
      String(tile.x),
      `${tile.y}.jpg`
    );
    const result = await downloadFile(url, outputPath);
    if (result === "cached") {
      cached += 1;
    } else {
      downloaded += 1;
    }
  });

  return {
    downloaded,
    cached,
    minZoom,
    maxZoom,
    total: tiles.length,
  };
}

async function writePackageMetadata(tileStatus) {
  const manifest = {
    id: "korea",
    label: "Korea Offline Overview",
    center,
    bounds,
    zoom: {
      min: tileStatus.minZoom,
      max: tileStatus.maxZoom,
      preferred: 7,
    },
    sources: {
      vector: {
        enabled: true,
        data: "./vector/basemap.geojson",
      },
      satellite: {
        enabled: true,
        tiles: "./raster/satellite/{z}/{x}/{y}.jpg",
        tileSize: 256,
        minzoom: tileStatus.minZoom,
        maxzoom: tileStatus.maxZoom,
      },
    },
    dataStatus: "generated",
    generatedAt: new Date().toISOString(),
  };
  const tileJson = {
    tilejson: "2.2.0",
    name: "Korea Offline Satellite Overview",
    attribution: "Offline raster package",
    bounds: [bounds.west, bounds.south, bounds.east, bounds.north],
    center: [center.longitude, center.latitude, 7],
    minzoom: tileStatus.minZoom,
    maxzoom: tileStatus.maxZoom,
    tiles: ["/offline-map/korea/raster/satellite/{z}/{x}/{y}.jpg"],
  };

  await ensureDir(packageDir);
  await writeFile(
    path.join(packageDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  await writeFile(
    path.join(packageDir, "satellite-tiles.json"),
    `${JSON.stringify(tileJson, null, 2)}\n`
  );
  await writeFile(
    path.join(packageDir, "README.md"),
    [
      "# Korea offline overview",
      "",
      "Low-zoom satellite raster tiles for the offline demo entry point.",
      "The high-detail Seungjin firing range package remains in `../seungjin`.",
      "",
    ].join("\n")
  );
}

function buildOverpassQuery() {
  return `
[out:json][timeout:240];
area["ISO3166-1"="KR"][admin_level=2]->.southKorea;
area["ISO3166-1"="KP"][admin_level=2]->.northKorea;
(
  node["place"~"^(city|town)$"](area.southKorea);
  node["place"~"^(city|town)$"](area.northKorea);
  way["highway"~"^(motorway|trunk|primary)$"](area.southKorea);
  way["highway"~"^(motorway|trunk|primary)$"](area.northKorea);
  way["waterway"~"^(river|canal)$"](area.southKorea);
  way["waterway"~"^(river|canal)$"](area.northKorea);
  way["natural"="water"](area.southKorea);
  way["natural"="water"](area.northKorea);
);
out body;
>;
out skel qt;
`;
}

async function fetchOverpassPayload() {
  const query = buildOverpassQuery();
  let lastError = null;

  for (const overpassUrl of OVERPASS_URLS) {
    try {
      const response = await fetch(overpassUrl, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": "FireScope offline map prep",
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `Overpass request failed ${response.status}: ${detail.slice(0, 180)}`
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn("Overpass endpoint failed.", {
        overpassUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw lastError ?? new Error("All Overpass endpoints failed.");
}

function wayCoordinates(way, nodesById) {
  return way.nodes
    .map((nodeId) => nodesById.get(nodeId))
    .filter(Boolean)
    .map((node) => [node.lon, node.lat]);
}

function isClosedWay(way) {
  return (
    Array.isArray(way.nodes) &&
    way.nodes.length > 2 &&
    way.nodes[0] === way.nodes[way.nodes.length - 1]
  );
}

function pointFeature(node, kind) {
  const tags = node.tags ?? {};
  return {
    type: "Feature",
    properties: {
      id: `osm-node-${node.id}`,
      kind,
      name: tags["name:en"] ?? tags.name ?? "",
      place: tags.place ?? "",
      osmId: String(node.id),
      source: "overpass",
    },
    geometry: {
      type: "Point",
      coordinates: [node.lon, node.lat],
    },
  };
}

function wayFeature(way, nodesById, kind) {
  const coordinates = wayCoordinates(way, nodesById);
  if (coordinates.length < 2) {
    return null;
  }

  const tags = way.tags ?? {};
  const geometry =
    kind === "water" && isClosedWay(way)
      ? {
          type: "Polygon",
          coordinates: [coordinates],
        }
      : {
          type: "LineString",
          coordinates,
        };

  return {
    type: "Feature",
    properties: {
      id: `osm-way-${way.id}`,
      kind,
      name: tags["name:en"] ?? tags.name ?? "",
      highway: tags.highway ?? "",
      waterway: tags.waterway ?? "",
      natural: tags.natural ?? "",
      osmId: String(way.id),
      source: "overpass",
    },
    geometry,
  };
}

function coordinateCount(feature) {
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates)) {
    return 0;
  }
  if (feature.geometry?.type === "LineString") {
    return coordinates.length;
  }
  if (feature.geometry?.type === "Polygon") {
    return Array.isArray(coordinates[0]) ? coordinates[0].length : 0;
  }
  return 1;
}

function simplifyCoordinateList(coordinates, maxPoints) {
  if (!Array.isArray(coordinates) || coordinates.length <= maxPoints) {
    return coordinates;
  }

  const step = Math.ceil(coordinates.length / maxPoints);
  const simplified = coordinates.filter((_, index) => index % step === 0);
  const last = coordinates[coordinates.length - 1];
  if (simplified[simplified.length - 1] !== last) {
    simplified.push(last);
  }
  return simplified;
}

function simplifyOverviewFeature(feature) {
  if (feature.geometry?.type === "LineString") {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: simplifyCoordinateList(feature.geometry.coordinates, 80),
      },
    };
  }
  if (feature.geometry?.type === "Polygon") {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: feature.geometry.coordinates.map((ring) =>
          simplifyCoordinateList(ring, 120)
        ),
      },
    };
  }
  return feature;
}

function buildBasemapFeatureSubset({ places, roads, water }) {
  const roadLimit = parseFeatureLimitEnv(
    "OFFLINE_KOREA_BASEMAP_ROAD_LIMIT",
    2400
  );
  const waterLimit = parseFeatureLimitEnv(
    "OFFLINE_KOREA_BASEMAP_WATER_LIMIT",
    1200
  );
  const placeLimit = parseFeatureLimitEnv(
    "OFFLINE_KOREA_BASEMAP_PLACE_LIMIT",
    450
  );
  const roadPriority = {
    motorway: 0,
    trunk: 1,
    primary: 2,
  };

  const overviewRoads = roads
    .filter((feature) => {
      const highway = String(feature.properties?.highway ?? "");
      return (
        highway === "motorway" || highway === "trunk" || highway === "primary"
      );
    })
    .sort((left, right) => {
      const leftHighway = String(left.properties?.highway ?? "");
      const rightHighway = String(right.properties?.highway ?? "");
      const priorityDelta =
        (roadPriority[leftHighway] ?? 9) - (roadPriority[rightHighway] ?? 9);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      const nameDelta =
        Number(Boolean(right.properties?.name)) -
        Number(Boolean(left.properties?.name));
      if (nameDelta !== 0) {
        return nameDelta;
      }
      return coordinateCount(right) - coordinateCount(left);
    })
    .slice(0, roadLimit)
    .map(simplifyOverviewFeature);

  const overviewWater = water
    .filter((feature) => {
      const waterway = String(feature.properties?.waterway ?? "");
      return waterway === "river" || Boolean(feature.properties?.name);
    })
    .sort((left, right) => {
      const riverDelta =
        Number(String(right.properties?.waterway ?? "") === "river") -
        Number(String(left.properties?.waterway ?? "") === "river");
      if (riverDelta !== 0) {
        return riverDelta;
      }
      const nameDelta =
        Number(Boolean(right.properties?.name)) -
        Number(Boolean(left.properties?.name));
      if (nameDelta !== 0) {
        return nameDelta;
      }
      return coordinateCount(right) - coordinateCount(left);
    })
    .slice(0, waterLimit)
    .map(simplifyOverviewFeature);

  const overviewPlaces = places
    .filter((feature) => Boolean(feature.properties?.name))
    .sort((left, right) => {
      const leftPlace = String(left.properties?.place ?? "");
      const rightPlace = String(right.properties?.place ?? "");
      if (leftPlace !== rightPlace) {
        return leftPlace === "city" ? -1 : rightPlace === "city" ? 1 : 0;
      }
      return String(left.properties?.name ?? "").localeCompare(
        String(right.properties?.name ?? ""),
        "ko-KR"
      );
    })
    .slice(0, placeLimit);

  return [...overviewRoads, ...overviewWater, ...overviewPlaces];
}

async function writeGeoJson(outputPath, features) {
  await ensureDir(path.dirname(outputPath));
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        type: "FeatureCollection",
        features,
      },
      null,
      2
    )}\n`
  );
}

async function fetchKoreaVectorIntel() {
  if (
    process.env.OFFLINE_MAP_SKIP_OVERPASS === "1" ||
    process.env.OFFLINE_MAP_REUSE_INTEL === "1"
  ) {
    const intelDir = path.join(packageDir, "intel");
    if (
      existsSync(path.join(intelDir, "places.geojson")) &&
      existsSync(path.join(intelDir, "roads.geojson")) &&
      existsSync(path.join(intelDir, "water.geojson"))
    ) {
      const places = JSON.parse(
        await readFile(path.join(intelDir, "places.geojson"), "utf8")
      ).features;
      const roads = JSON.parse(
        await readFile(path.join(intelDir, "roads.geojson"), "utf8")
      ).features;
      const water = JSON.parse(
        await readFile(path.join(intelDir, "water.geojson"), "utf8")
      ).features;
      return {
        reused: true,
        places: places.length,
        roads: roads.length,
        water: water.length,
        basemapFeatures: buildBasemapFeatureSubset({ places, roads, water }),
      };
    }

    return {
      skipped: true,
      basemapFeatures: [],
    };
  }

  const payload = await fetchOverpassPayload();
  const elements = Array.isArray(payload.elements) ? payload.elements : [];
  const nodesById = new Map(
    elements
      .filter((entry) => entry.type === "node")
      .map((entry) => [entry.id, entry])
  );
  const places = [];
  const roads = [];
  const water = [];

  for (const element of elements) {
    if (element.type === "node" && element.tags?.place) {
      places.push(pointFeature(element, "city"));
      continue;
    }
    if (element.type !== "way") {
      continue;
    }

    const tags = element.tags ?? {};
    if (tags.highway) {
      const feature = wayFeature(element, nodesById, "road");
      if (feature) roads.push(feature);
      continue;
    }
    if (tags.waterway || tags.natural === "water") {
      const feature = wayFeature(element, nodesById, "water");
      if (feature) water.push(feature);
    }
  }

  const intelDir = path.join(packageDir, "intel");
  await writeGeoJson(path.join(intelDir, "places.geojson"), places);
  await writeGeoJson(path.join(intelDir, "roads.geojson"), roads);
  await writeGeoJson(path.join(intelDir, "water.geojson"), water);

  return {
    places: places.length,
    roads: roads.length,
    water: water.length,
    basemapFeatures: buildBasemapFeatureSubset({ places, roads, water }),
  };
}

async function main() {
  await ensureDir(packageDir);
  const satellite = await downloadSatelliteTiles();
  const vectorIntel = await fetchKoreaVectorIntel();
  await writeOfflineVectorBasemap(
    packageDir,
    "korea",
    vectorIntel.basemapFeatures
  );
  await writePackageMetadata(satellite);
  console.log(
    JSON.stringify(
      {
        satellite,
        vectorIntel: {
          skipped: vectorIntel.skipped,
          reused: vectorIntel.reused,
          places: vectorIntel.places,
          roads: vectorIntel.roads,
          water: vectorIntel.water,
        },
        bounds,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
