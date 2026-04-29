import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { writeOfflineVectorBasemap } from "./offlineVectorBasemap.mjs";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const packageDir = path.join(publicDir, "offline-map", "seungjin");
const vendorDir = path.join(publicDir, "vendor", "maplibre");
const manifestPath = path.join(packageDir, "manifest.json");
const envFiles = [
  path.join(rootDir, ".env"),
  path.join(rootDir, ".env.standalone"),
  path.join(rootDir, ".env.development"),
  path.join(rootDir, ".env.production"),
];

const bounds = {
  west: 127.13,
  south: 37.91,
  east: 127.58,
  north: 38.24,
};

const TERRARIUM_TILE_URL =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
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
const MAPTILER_SATELLITE_TILE_URL = mapTilerApiKey
  ? `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${encodeURIComponent(
      mapTilerApiKey
    )}`
  : "";
const OVERPASS_URLS = process.env.OVERPASS_URL
  ? [process.env.OVERPASS_URL]
  : [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://z.overpass-api.de/api/interpreter",
    ];

function parseIntegerEnv(name, fallback) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function wait(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function parseBooleanEnv(name, fallback) {
  const value = String(process.env[name] ?? "")
    .trim()
    .toLowerCase();
  if (!value) return fallback;
  return !["0", "false", "no", "off"].includes(value);
}

function redactUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("key")) {
      parsed.searchParams.set("key", "<redacted>");
    }
    return parsed.toString();
  } catch (_error) {
    return url.replace(/key=[^&]+/g, "key=<redacted>");
  }
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
  const minX = lonToTileX(west, zoom);
  const maxX = lonToTileX(east, zoom);
  const minY = latToTileY(north, zoom);
  const maxY = latToTileY(south, zoom);
  return { minX, maxX, minY, maxY };
}

function formatTileUrl(template, { z, x, y }) {
  return template
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
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

async function copyMapLibreRuntime() {
  const packageRoot = path.join(rootDir, "node_modules", "maplibre-gl", "dist");
  const scriptSource = path.join(packageRoot, "maplibre-gl.js");
  const styleSource = path.join(packageRoot, "maplibre-gl.css");

  if (!existsSync(scriptSource) || !existsSync(styleSource)) {
    console.warn(
      "maplibre-gl is not installed. Run `npm install maplibre-gl` before using the offline viewer."
    );
    return false;
  }

  await ensureDir(vendorDir);
  await copyFile(scriptSource, path.join(vendorDir, "maplibre-gl.js"));
  await copyFile(styleSource, path.join(vendorDir, "maplibre-gl.css"));
  return true;
}

async function downloadTerrariumTiles() {
  const minZoom = parseIntegerEnv("OFFLINE_TERRAIN_MIN_ZOOM", 6);
  const maxZoom = parseIntegerEnv("OFFLINE_TERRAIN_MAX_ZOOM", 15);
  let downloaded = 0;
  let cached = 0;

  for (let z = minZoom; z <= maxZoom; z += 1) {
    const { minX, maxX, minY, maxY } = tileRangeForBounds(bounds, z);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        const url = formatTileUrl(TERRARIUM_TILE_URL, { z, x, y });
        const outputPath = path.join(
          packageDir,
          "terrain",
          "terrarium",
          String(z),
          String(x),
          `${y}.png`
        );
        const result = await downloadFile(url, outputPath);
        if (result === "cached") {
          cached += 1;
        } else {
          downloaded += 1;
        }
      }
    }
  }

  return { downloaded, cached, minZoom, maxZoom };
}

async function runWithConcurrency(items, concurrency, worker) {
  let cursor = 0;
  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    async () => {
      while (cursor < items.length) {
        const item = items[cursor];
        cursor += 1;
        await worker(item);
      }
    }
  );
  await Promise.all(workers);
}

async function downloadSatelliteTiles() {
  const shouldDownload = parseBooleanEnv(
    "OFFLINE_MAP_DOWNLOAD_SATELLITE",
    Boolean(MAPTILER_SATELLITE_TILE_URL)
  );
  if (!shouldDownload) {
    return { downloaded: 0, cached: 0, skipped: true };
  }
  if (!MAPTILER_SATELLITE_TILE_URL) {
    console.warn(
      "Satellite tile download skipped. Set MAPTILER_API_KEY or VITE_MAPTILER_DEFAULT_KEY."
    );
    return { downloaded: 0, cached: 0, skipped: true, missingApiKey: true };
  }

  const minZoom = parseIntegerEnv("OFFLINE_SATELLITE_MIN_ZOOM", 6);
  const maxZoom = parseIntegerEnv("OFFLINE_SATELLITE_MAX_ZOOM", 15);
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
    const url = formatTileUrl(MAPTILER_SATELLITE_TILE_URL, tile);
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

function buildOverpassQuery() {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  return `
[out:json][timeout:180];
(
  way["highway"](${bbox});
  way["waterway"](${bbox});
  way["natural"="water"](${bbox});
  way["water"](${bbox});
  way["building"](${bbox});
);
out body;
>;
out skel qt;
`;
}

function isClosedWay(way) {
  return (
    Array.isArray(way.nodes) &&
    way.nodes.length > 2 &&
    way.nodes[0] === way.nodes[way.nodes.length - 1]
  );
}

function parseHeight(tags = {}) {
  const explicit = Number.parseFloat(String(tags.height ?? ""));
  if (Number.isFinite(explicit)) {
    return explicit;
  }

  const levels = Number.parseFloat(String(tags["building:levels"] ?? ""));
  return Number.isFinite(levels) ? levels * 3.2 : 10;
}

function wayCoordinates(way, nodesById) {
  return way.nodes
    .map((nodeId) => nodesById.get(nodeId))
    .filter(Boolean)
    .map((node) => [node.lon, node.lat]);
}

function wayToFeature(way, nodesById, kind) {
  const coordinates = wayCoordinates(way, nodesById);
  if (coordinates.length < 2) {
    return null;
  }

  const tags = way.tags ?? {};
  const properties = {
    id: String(way.id),
    kind,
    name: tags.name ?? "",
    highway: tags.highway ?? "",
    waterway: tags.waterway ?? "",
    natural: tags.natural ?? "",
    height: kind === "building" ? parseHeight(tags) : undefined,
  };

  if (kind === "building" || (kind === "water" && isClosedWay(way))) {
    return {
      type: "Feature",
      properties,
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    };
  }

  return {
    type: "Feature",
    properties,
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

async function fetchOverpassIntel() {
  const payload = await fetchOverpassPayload();
  const elements = Array.isArray(payload.elements) ? payload.elements : [];
  const nodesById = new Map(
    elements
      .filter((entry) => entry.type === "node")
      .map((entry) => [entry.id, entry])
  );
  const ways = elements.filter((entry) => entry.type === "way");
  const roads = [];
  const water = [];
  const buildings = [];

  for (const way of ways) {
    const tags = way.tags ?? {};
    if (tags.building) {
      const feature = wayToFeature(way, nodesById, "building");
      if (feature) buildings.push(feature);
      continue;
    }
    if (tags.waterway || tags.natural === "water" || tags.water) {
      const feature = wayToFeature(way, nodesById, "water");
      if (feature) water.push(feature);
      continue;
    }
    if (tags.highway) {
      const feature = wayToFeature(way, nodesById, "road");
      if (feature) roads.push(feature);
    }
  }

  const intelDir = path.join(packageDir, "intel");
  await ensureDir(intelDir);
  await writeGeoJson(path.join(intelDir, "roads.geojson"), roads);
  await writeGeoJson(path.join(intelDir, "water.geojson"), water);
  await writeGeoJson(path.join(intelDir, "buildings.geojson"), buildings);
  await writeAoiGeoJson(intelDir);
  return {
    roads: roads.length,
    water: water.length,
    buildings: buildings.length,
  };
}

function buildAoiFeatures() {
  const coordinates = [
    [bounds.west, bounds.south],
    [bounds.east, bounds.south],
    [bounds.east, bounds.north],
    [bounds.west, bounds.north],
    [bounds.west, bounds.south],
  ];
  return [
    {
      type: "Feature",
      properties: {
        id: "seungjin-aoi",
        kind: "aoi",
        name: "Seungjin Firing Range AOI",
      },
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "seungjin-center",
        kind: "target",
        name: "Seungjin Firing Range",
      },
      geometry: {
        type: "Point",
        coordinates: [
          (bounds.west + bounds.east) / 2,
          (bounds.south + bounds.north) / 2,
        ],
      },
    },
  ];
}

async function writeAoiGeoJson(intelDir) {
  await writeGeoJson(path.join(intelDir, "aoi.geojson"), buildAoiFeatures());
}

async function writeIntelPlaceholders() {
  const intelDir = path.join(packageDir, "intel");
  await ensureDir(intelDir);
  for (const name of ["roads.geojson", "water.geojson", "buildings.geojson"]) {
    const outputPath = path.join(intelDir, name);
    if (!existsSync(outputPath)) {
      await writeGeoJson(outputPath, []);
    }
  }
  await writeAoiGeoJson(intelDir);
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

async function writeGeoJson(outputPath, features) {
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

async function updateManifestStatus(status, assets = {}) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.dataStatus = status;
  manifest.generatedAt = new Date().toISOString();
  if (assets.satellite && !assets.satellite.skipped) {
    manifest.sources.satellite.enabled = true;
    manifest.sources.satellite.minzoom = assets.satellite.minZoom;
    manifest.sources.satellite.maxzoom = assets.satellite.maxZoom;
  }
  manifest.sources.vector = {
    enabled: true,
    data: "./vector/basemap.geojson",
  };
  if (assets.terrain && !assets.terrain.skipped) {
    manifest.sources.terrainDem.minzoom = assets.terrain.minZoom;
    manifest.sources.terrainDem.maxzoom = assets.terrain.maxZoom;
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  await ensureDir(packageDir);
  const mapLibreCopied = await copyMapLibreRuntime();
  const terrain =
    process.env.OFFLINE_MAP_SKIP_TERRAIN === "1"
      ? { downloaded: 0, cached: 0, skipped: true }
      : await downloadTerrariumTiles();
  const satellite = await downloadSatelliteTiles();
  await writeOfflineVectorBasemap(packageDir, "seungjin");
  const intel =
    process.env.OFFLINE_MAP_SKIP_OVERPASS === "1"
      ? { skipped: true }
      : await fetchOverpassIntel();
  if (intel.skipped) {
    await writeIntelPlaceholders();
  }

  await updateManifestStatus("generated", { satellite, terrain });
  console.log(
    JSON.stringify(
      {
        mapLibreCopied,
        terrain,
        satellite,
        intel,
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
