import { resolvePublicAssetPath } from "@/utils/publicAssetUrl";

export interface OfflineMapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface OfflineMapRegion {
  id: string;
  label: string;
  center: [number, number];
  bounds: OfflineMapBounds;
  rootPath: string;
  defaultZoom: number;
  vectorBasemapPath?: string;
  satelliteTileJsonPath?: string;
}

export interface OfflineMapResolutionOptions {
  forceOffline?: boolean;
  preferredRegionId?: string;
}

export interface OfflineTileUrlOptions {
  localOnly?: boolean;
}

export const SEUNGJIN_OFFLINE_REGION: OfflineMapRegion = {
  id: "seungjin",
  label: "Seungjin Firing Range",
  center: [127.354386, 38.07775],
  bounds: {
    west: 127.13,
    south: 37.91,
    east: 127.58,
    north: 38.24,
  },
  rootPath: "/offline-map/seungjin",
  defaultZoom: 12,
  vectorBasemapPath: "vector/basemap.geojson",
};

export const KOREA_OFFLINE_REGION: OfflineMapRegion = {
  id: "korea",
  label: "Korea Offline Overview",
  center: [127.8, 36.35],
  bounds: {
    west: 124.5,
    south: 33.0,
    east: 132.5,
    north: 39.5,
  },
  rootPath: "/offline-map/korea",
  defaultZoom: 7,
  vectorBasemapPath: "vector/basemap.geojson",
  satelliteTileJsonPath: "satellite-tiles.json",
};

const OFFLINE_REGIONS: Record<string, OfflineMapRegion> = {
  [SEUNGJIN_OFFLINE_REGION.id]: SEUNGJIN_OFFLINE_REGION,
  [KOREA_OFFLINE_REGION.id]: KOREA_OFFLINE_REGION,
};
const OFFLINE_FALLBACK_TILE_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23071118'/%3E%3Cpath d='M0 0H256V256H0Z' fill='none' stroke='%231a2e38' stroke-width='2'/%3E%3C/svg%3E";

function getEnvValue(name: string) {
  const env = import.meta.env as Record<string, string | undefined>;
  return String(env[name] ?? "").trim();
}

export function getOfflineMapRegionId() {
  return getEnvValue("VITE_OFFLINE_MAP_REGION") || SEUNGJIN_OFFLINE_REGION.id;
}

export function isOfflineMapEnabled(options: OfflineMapResolutionOptions = {}) {
  const mapMode = getEnvValue("VITE_MAP_MODE").toLowerCase();
  return (
    options.forceOffline === true ||
    mapMode === "offline" ||
    Boolean(getEnvValue("VITE_OFFLINE_MAP_REGION"))
  );
}

export function getOfflineMapRegion(options: OfflineMapResolutionOptions = {}) {
  if (!isOfflineMapEnabled(options)) {
    return null;
  }

  const regionId = options.preferredRegionId || getOfflineMapRegionId();
  return OFFLINE_REGIONS[regionId] ?? SEUNGJIN_OFFLINE_REGION;
}

export function resolveOfflineMapAssetPath(
  region: OfflineMapRegion,
  path: string
) {
  return resolvePublicAssetPath(
    `${region.rootPath}/${path.replace(/^\/+/, "")}`
  );
}

export function getOfflineMapManifestPath(region: OfflineMapRegion) {
  return resolveOfflineMapAssetPath(region, "manifest.json");
}

export function getOfflineBasicTileUrl(region: OfflineMapRegion) {
  void region;
  return (
    getEnvValue("VITE_OFFLINE_BASIC_TILE_URL") || OFFLINE_FALLBACK_TILE_URL
  );
}

export function getOfflineVectorBasemapUrl(region: OfflineMapRegion) {
  if (!region.vectorBasemapPath) {
    return "";
  }

  return resolveOfflineMapAssetPath(region, region.vectorBasemapPath);
}

function preserveTileTemplateTokens(tileUrl: string) {
  return tileUrl.replace(/%7B/gi, "{").replace(/%7D/gi, "}");
}

export function getOfflineSatelliteTileUrl(
  region: OfflineMapRegion,
  options: OfflineTileUrlOptions = {}
) {
  if (region.satelliteTileJsonPath && !options.localOnly) {
    return resolveOfflineMapAssetPath(region, region.satelliteTileJsonPath);
  }

  const localTileUrl = preserveTileTemplateTokens(
    resolveOfflineMapAssetPath(region, "raster/satellite/{z}/{x}/{y}.jpg")
  );
  if (options.localOnly) {
    return localTileUrl;
  }

  return preserveTileTemplateTokens(
    getEnvValue("VITE_OFFLINE_SATELLITE_TILE_URL") ||
      getEnvValue("VITE_OFFLINE_BASIC_TILE_URL") ||
      localTileUrl ||
      OFFLINE_FALLBACK_TILE_URL
  );
}
