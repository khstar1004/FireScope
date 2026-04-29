import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const OFFLINE_RASTER_TILE_PATTERN =
  /^\/offline-map\/(?<region>[^/]+)\/raster\/(?<layer>satellite|basic)\/(?<z>\d+)\/(?<x>\d+)\/(?<y>\d+)\.(?:jpg|jpeg|png|webp|svg)$/i;
const OFFLINE_TERRAIN_TILE_PATTERN =
  /^\/offline-map\/(?<region>[^/]+)\/terrain\/terrarium\/(?<z>\d+)\/(?<x>\d+)\/(?<y>\d+)\.png$/i;
const OFFLINE_INTEL_PATTERN =
  /^\/offline-map\/(?<region>[^/]+)\/intel\/(?<layer>roads|water|buildings|aoi)\.geojson$/i;

const TILE_SIZE = 256;
const FLAT_TERRAIN_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

type Coordinate = [number, number];

interface OfflineMapTileRequest {
  region: string;
  layer: string;
  z: string;
  x: string;
  y: string;
}

interface OfflineIntelRequest {
  region: string;
  layer: string;
}

interface OfflineMapRegionProfile {
  label: string;
  bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
  cities: Array<{
    label: string;
    lon: number;
    lat: number;
    minZoom?: number;
  }>;
}

const KOREAN_PENINSULA: Coordinate[] = [
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

const JEJU_ISLAND: Coordinate[] = [
  [126.12, 33.28],
  [126.36, 33.17],
  [126.74, 33.2],
  [126.98, 33.36],
  [126.82, 33.52],
  [126.38, 33.58],
  [126.12, 33.46],
  [126.12, 33.28],
];

const CHINA_COAST: Coordinate[] = [
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

const JAPAN_COAST: Coordinate[] = [
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

const DMZ_LINE: Coordinate[] = [
  [126.15, 37.83],
  [126.72, 37.9],
  [127.28, 38.02],
  [127.82, 38.15],
  [128.34, 38.25],
  [128.58, 38.34],
];

const OFFLINE_REGION_PROFILES: Record<string, OfflineMapRegionProfile> = {
  korea: {
    label: "Korea Offline Overview",
    bounds: {
      west: 124.5,
      south: 33.0,
      east: 132.5,
      north: 39.5,
    },
    cities: [
      { label: "Seoul", lon: 126.978, lat: 37.5665, minZoom: 6 },
      { label: "Incheon", lon: 126.7052, lat: 37.4563, minZoom: 7 },
      { label: "Daejeon", lon: 127.3845, lat: 36.3504, minZoom: 7 },
      { label: "Daegu", lon: 128.6014, lat: 35.8714, minZoom: 7 },
      { label: "Busan", lon: 129.0756, lat: 35.1796, minZoom: 6 },
      { label: "Gwangju", lon: 126.8526, lat: 35.1595, minZoom: 7 },
      { label: "Jeju", lon: 126.5312, lat: 33.4996, minZoom: 7 },
      { label: "Pyongyang", lon: 125.7625, lat: 39.0392, minZoom: 6 },
      { label: "Seungjin", lon: 127.3544, lat: 38.0778, minZoom: 8 },
    ],
  },
  seungjin: {
    label: "Seungjin Firing Range",
    bounds: {
      west: 127.13,
      south: 37.91,
      east: 127.58,
      north: 38.24,
    },
    cities: [
      { label: "Seungjin", lon: 127.3544, lat: 38.0778, minZoom: 8 },
      { label: "Pocheon", lon: 127.2003, lat: 37.8949, minZoom: 10 },
      { label: "Cheorwon", lon: 127.3133, lat: 38.1469, minZoom: 10 },
    ],
  },
};

function isInsideDirectory(parentDir: string, targetPath: string) {
  const relativePath = path.relative(parentDir, targetPath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function publicAssetExists(publicDir: string, pathname: string) {
  const requestedPath = path.resolve(
    publicDir,
    ...pathname.split("/").filter(Boolean)
  );

  return (
    isInsideDirectory(publicDir, requestedPath) && fs.existsSync(requestedPath)
  );
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lonToWorldPixelX(lon: number, zoom: number) {
  return ((lon + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

function latToWorldPixelY(lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    TILE_SIZE *
    2 ** zoom
  );
}

function projectCoordinateToTile(
  [lon, lat]: Coordinate,
  zoom: number,
  tileX: number,
  tileY: number
) {
  return {
    x: lonToWorldPixelX(lon, zoom) - tileX * TILE_SIZE,
    y: latToWorldPixelY(lat, zoom) - tileY * TILE_SIZE,
  };
}

function coordinatePath(
  coordinates: Coordinate[],
  zoom: number,
  tileX: number,
  tileY: number
) {
  return coordinates
    .map((coordinate, index) => {
      const point = projectCoordinateToTile(coordinate, zoom, tileX, tileY);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(
        1
      )}`;
    })
    .join(" ");
}

function buildSeededTerrainLines(seed: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const y = 26 + index * (TILE_SIZE / Math.max(1, count - 1));
    const wobble = ((seed + index * 17) % 29) - 14;
    const amplitude = 9 + ((seed + index * 11) % 13);
    return `M-18 ${(y + wobble).toFixed(1)} C42 ${(y - amplitude).toFixed(
      1
    )} 84 ${(y + amplitude).toFixed(1)} 136 ${(y - wobble).toFixed(
      1
    )} S219 ${(y + amplitude * 0.6).toFixed(1)} 276 ${(y - amplitude).toFixed(
      1
    )}`;
  });
}

function buildGridLines(zoom: number, tileX: number, tileY: number) {
  const worldWidth = TILE_SIZE * 2 ** zoom;
  const west = (tileX * TILE_SIZE * 360) / worldWidth - 180;
  const east = ((tileX + 1) * TILE_SIZE * 360) / worldWidth - 180;
  const northRad = Math.atan(
    Math.sinh(Math.PI * (1 - (2 * tileY) / 2 ** zoom))
  );
  const southRad = Math.atan(
    Math.sinh(Math.PI * (1 - (2 * (tileY + 1)) / 2 ** zoom))
  );
  const north = (northRad * 180) / Math.PI;
  const south = (southRad * 180) / Math.PI;
  const lonStep = zoom <= 6 ? 2 : zoom <= 8 ? 1 : zoom <= 11 ? 0.25 : 0.05;
  const latStep = lonStep;
  const lines: string[] = [];

  for (
    let lon = Math.ceil(west / lonStep) * lonStep;
    lon <= east;
    lon += lonStep
  ) {
    const top = projectCoordinateToTile([lon, north], zoom, tileX, tileY);
    const bottom = projectCoordinateToTile([lon, south], zoom, tileX, tileY);
    lines.push(
      `<line x1="${top.x.toFixed(1)}" y1="${top.y.toFixed(
        1
      )}" x2="${bottom.x.toFixed(1)}" y2="${bottom.y.toFixed(1)}" />`
    );
  }

  for (
    let lat = Math.ceil(south / latStep) * latStep;
    lat <= north;
    lat += latStep
  ) {
    const left = projectCoordinateToTile([west, lat], zoom, tileX, tileY);
    const right = projectCoordinateToTile([east, lat], zoom, tileX, tileY);
    lines.push(
      `<line x1="${left.x.toFixed(1)}" y1="${left.y.toFixed(
        1
      )}" x2="${right.x.toFixed(1)}" y2="${right.y.toFixed(1)}" />`
    );
  }

  return lines.join("\n");
}

function buildAoiPath(
  profile: OfflineMapRegionProfile,
  zoom: number,
  tileX: number,
  tileY: number
) {
  const { west, south, east, north } = profile.bounds;
  return coordinatePath(
    [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ],
    zoom,
    tileX,
    tileY
  );
}

export function buildOfflineIntelGeoJson({
  region,
  layer,
}: OfflineIntelRequest) {
  const profile =
    OFFLINE_REGION_PROFILES[region.toLowerCase()] ??
    OFFLINE_REGION_PROFILES.korea;

  if (layer.toLowerCase() !== "aoi") {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const { west, south, east, north } = profile.bounds;
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: `${region}-aoi`,
          kind: "aoi",
          name: profile.label,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          id: `${region}-center`,
          kind: "target",
          name: profile.label,
        },
        geometry: {
          type: "Point",
          coordinates: [(west + east) / 2, (south + north) / 2],
        },
      },
    ],
  };
}

export function buildOfflineMapTileSvg({
  region,
  layer,
  z,
  x,
  y,
}: OfflineMapTileRequest) {
  const zoom = Number.parseInt(z, 10);
  const tileX = Number.parseInt(x, 10);
  const tileY = Number.parseInt(y, 10);
  const safeZoom = Number.isFinite(zoom) ? zoom : 0;
  const safeTileX = Number.isFinite(tileX) ? tileX : 0;
  const safeTileY = Number.isFinite(tileY) ? tileY : 0;
  const profile =
    OFFLINE_REGION_PROFILES[region.toLowerCase()] ??
    OFFLINE_REGION_PROFILES.korea;
  const regionLabel = region.replace(/[^a-z0-9_-]/gi, "").toUpperCase();
  const seed = Math.abs(
    [region, layer, z, x, y]
      .join(":")
      .split("")
      .reduce((acc, char) => {
        return (acc * 31 + char.charCodeAt(0)) % 9973;
      }, 17)
  );
  const terrainLines = buildSeededTerrainLines(seed, safeZoom >= 10 ? 8 : 5);
  const cityMarkers = profile.cities
    .filter((city) => safeZoom >= (city.minZoom ?? 0))
    .map((city) => {
      const point = projectCoordinateToTile(
        [city.lon, city.lat],
        safeZoom,
        safeTileX,
        safeTileY
      );
      if (
        point.x < -42 ||
        point.x > TILE_SIZE + 42 ||
        point.y < -24 ||
        point.y > TILE_SIZE + 24
      ) {
        return "";
      }

      return `<g class="city">
        <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(
          1
        )}" r="${safeZoom >= 10 ? 4.2 : 3.4}" />
        <text x="${(point.x + 7).toFixed(1)}" y="${(point.y - 7).toFixed(
          1
        )}">${escapeSvgText(city.label)}</text>
      </g>`;
    })
    .filter(Boolean)
    .join("\n");
  const showRegionLabel = safeZoom <= 7;
  const koreaPath = coordinatePath(
    KOREAN_PENINSULA,
    safeZoom,
    safeTileX,
    safeTileY
  );
  const jejuPath = coordinatePath(JEJU_ISLAND, safeZoom, safeTileX, safeTileY);
  const chinaPath = coordinatePath(CHINA_COAST, safeZoom, safeTileX, safeTileY);
  const japanPath = coordinatePath(JAPAN_COAST, safeZoom, safeTileX, safeTileY);
  const dmzPath = coordinatePath(DMZ_LINE, safeZoom, safeTileX, safeTileY);
  const aoiPath = buildAoiPath(profile, safeZoom, safeTileX, safeTileY);
  const landFill = layer.toLowerCase() === "basic" ? "#21392d" : "#243d2b";
  const waterFill = layer.toLowerCase() === "basic" ? "#082230" : "#071d2a";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${waterFill}"/>
      <stop offset="0.52" stop-color="#0b2c32"/>
      <stop offset="1" stop-color="#07131c"/>
    </linearGradient>
    <clipPath id="tileClip"><rect width="256" height="256"/></clipPath>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="0.28"/>
    </filter>
    <style>
      .grid line { stroke: #c7eef0; stroke-width: 0.8; stroke-opacity: 0.07; }
      .terrain path { fill: none; stroke: #9cb476; stroke-width: 5; stroke-opacity: 0.18; }
      .terrain path:nth-child(2n) { stroke: #51a0a8; stroke-width: 3; stroke-opacity: 0.16; }
      .land { fill: ${landFill}; stroke: #7d9f72; stroke-width: 1.4; stroke-opacity: 0.44; filter: url(#softShadow); }
      .coast-detail { fill: none; stroke: #d1d58d; stroke-width: 1; stroke-opacity: 0.28; }
      .dmz { fill: none; stroke: #68f4ff; stroke-width: 1.5; stroke-dasharray: 5 4; stroke-opacity: 0.68; }
      .aoi { fill: rgba(127,231,255,0.06); stroke: #7fe7ff; stroke-width: 1.5; stroke-dasharray: 7 5; stroke-opacity: 0.7; }
      .city circle { fill: #71f0dc; stroke: #021014; stroke-width: 1.5; }
      .city text { fill: #e8fffb; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; paint-order: stroke; stroke: #061015; stroke-width: 3px; stroke-linejoin: round; }
      .region-label { fill: rgba(232,255,251,0.72); font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0; }
      .region-subtitle { fill: rgba(169,221,214,0.72); font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 0; }
    </style>
  </defs>
  <rect width="256" height="256" fill="url(#bg)"/>
  <g clip-path="url(#tileClip)">
    <g class="terrain">
      ${terrainLines.map((line) => `<path d="${line}"/>`).join("\n")}
    </g>
    <path class="land" d="${chinaPath} Z"/>
    <path class="land" d="${japanPath} Z"/>
    <path class="land" d="${koreaPath} Z"/>
    <path class="land" d="${jejuPath} Z"/>
    <path class="coast-detail" d="${koreaPath} Z"/>
    <path class="coast-detail" d="${jejuPath} Z"/>
    <path class="dmz" d="${dmzPath}"/>
    <path class="aoi" d="${aoiPath} Z"/>
    <g class="grid">${buildGridLines(safeZoom, safeTileX, safeTileY)}</g>
    ${cityMarkers}
  </g>
  <rect x="0.5" y="0.5" width="255" height="255" fill="none" stroke="#5aa9b5" stroke-opacity="0.2"/>
  ${
    showRegionLabel
      ? `<text class="region-label" x="14" y="30">${escapeSvgText(
          regionLabel
        )}</text>
  <text class="region-subtitle" x="14" y="48">${escapeSvgText(
    profile.label
  )}</text>`
      : ""
  }
</svg>`;
}

function createOfflineMapTileMiddleware(publicDir: string) {
  return (
    req: { url?: string },
    res: {
      statusCode: number;
      setHeader(name: string, value: string): void;
      end(body?: string | Buffer): void;
    },
    next: () => void
  ) => {
    const requestUrl = req.url ?? "";
    const parsedUrl = new URL(requestUrl, "http://localhost");
    const rasterMatch = parsedUrl.pathname.match(OFFLINE_RASTER_TILE_PATTERN);
    const terrainMatch = parsedUrl.pathname.match(OFFLINE_TERRAIN_TILE_PATTERN);
    const intelMatch = parsedUrl.pathname.match(OFFLINE_INTEL_PATTERN);

    if (!rasterMatch?.groups && !terrainMatch?.groups && !intelMatch?.groups) {
      next();
      return;
    }

    if (publicAssetExists(publicDir, parsedUrl.pathname)) {
      next();
      return;
    }

    if (terrainMatch?.groups) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "no-store");
      res.end(FLAT_TERRAIN_PNG);
      return;
    }

    if (intelMatch?.groups) {
      const geoJson = buildOfflineIntelGeoJson({
        region: intelMatch.groups.region,
        layer: intelMatch.groups.layer,
      });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/geo+json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(`${JSON.stringify(geoJson)}\n`);
      return;
    }

    const match = rasterMatch?.groups;
    if (!match) {
      next();
      return;
    }

    const svg = buildOfflineMapTileSvg({
      region: match.region,
      layer: match.layer,
      z: match.z,
      x: match.x,
      y: match.y,
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(svg);
  };
}

export function createOfflineMapFallbackPlugin(): Plugin {
  const publicDir = path.resolve(process.cwd(), "public");
  const middleware = createOfflineMapTileMiddleware(publicDir);

  return {
    name: "firescope-offline-map-fallback",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
