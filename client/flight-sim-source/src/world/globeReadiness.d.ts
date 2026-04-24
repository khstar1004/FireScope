export function isVWorldGlobeReady(runtimeState: unknown): boolean;
export function isCesiumGlobeReady(
  viewer: unknown,
  options?: { acceptEmptyTileList?: boolean }
): boolean;
export function isGlobeSurfaceReady(
  viewer: unknown,
  runtimeState: unknown
): boolean;
