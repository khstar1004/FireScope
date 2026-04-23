export const TERRAIN_3D_HASH = "#/terrain-3d";

const MIN_TERRAIN_3D_SPAN_DEGREES = 0.002;

export interface Terrain3dBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface Terrain3dRouteOptions {
  continueSimulation?: boolean;
}

function parseFiniteNumber(value: string | null) {
  const parsed = Number(value ?? NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isTerrain3dRoute(hash: string) {
  return hash.startsWith(TERRAIN_3D_HASH);
}

export function getTerrain3dQueryParams(hash: string) {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

export function normalizeTerrain3dBounds(
  bounds: Terrain3dBounds,
  minimumSpanDegrees = MIN_TERRAIN_3D_SPAN_DEGREES
): Terrain3dBounds {
  const west = Math.min(bounds.west, bounds.east);
  const east = Math.max(bounds.west, bounds.east);
  const south = Math.min(bounds.south, bounds.north);
  const north = Math.max(bounds.south, bounds.north);

  const centerLon = (west + east) / 2;
  const centerLat = (south + north) / 2;
  const width = Math.max(east - west, minimumSpanDegrees);
  const height = Math.max(north - south, minimumSpanDegrees);

  const normalizedWest = Math.max(-180, centerLon - width / 2);
  const normalizedEast = Math.min(180, centerLon + width / 2);
  const normalizedSouth = Math.max(-85, centerLat - height / 2);
  const normalizedNorth = Math.min(85, centerLat + height / 2);

  return {
    west: normalizedWest,
    south: normalizedSouth,
    east: normalizedEast,
    north: normalizedNorth,
  };
}

export function buildTerrain3dHash(
  bounds: Terrain3dBounds,
  options?: Terrain3dRouteOptions
) {
  const normalizedBounds = normalizeTerrain3dBounds(bounds);
  const params = new URLSearchParams();

  params.set("west", normalizedBounds.west.toFixed(6));
  params.set("south", normalizedBounds.south.toFixed(6));
  params.set("east", normalizedBounds.east.toFixed(6));
  params.set("north", normalizedBounds.north.toFixed(6));
  if (options?.continueSimulation) {
    params.set("continueSimulation", "1");
  }

  return `${TERRAIN_3D_HASH}?${params.toString()}`;
}

export function parseTerrain3dQueryParams(
  params: URLSearchParams
): Terrain3dBounds | null {
  const west = parseFiniteNumber(params.get("west"));
  const south = parseFiniteNumber(params.get("south"));
  const east = parseFiniteNumber(params.get("east"));
  const north = parseFiniteNumber(params.get("north"));

  if (
    west === null ||
    south === null ||
    east === null ||
    north === null
  ) {
    return null;
  }

  return normalizeTerrain3dBounds({
    west,
    south,
    east,
    north,
  });
}

export function getTerrain3dCenter(bounds: Terrain3dBounds) {
  const normalizedBounds = normalizeTerrain3dBounds(bounds);

  return {
    lon: (normalizedBounds.west + normalizedBounds.east) / 2,
    lat: (normalizedBounds.south + normalizedBounds.north) / 2,
  };
}

export function parseTerrain3dContinueSimulation(params: URLSearchParams) {
  return params.get("continueSimulation") === "1";
}
