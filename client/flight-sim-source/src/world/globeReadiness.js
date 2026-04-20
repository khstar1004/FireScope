export function isVWorldGlobeReady(runtimeState) {
  return (
    runtimeState?.mapProvider === "vworld-webgl" &&
    runtimeState?.vworld?.viewerReady === true
  );
}

export function isCesiumGlobeReady(viewer) {
  const globe = viewer?.scene?.globe;
  if (!globe || globe.tilesLoaded !== true) {
    return false;
  }

  const tilesToRender = globe._surface?._tilesToRender;
  if (!Array.isArray(tilesToRender)) {
    return true;
  }

  return tilesToRender.length > 0;
}

export function isGlobeSurfaceReady(viewer, runtimeState) {
  return isVWorldGlobeReady(runtimeState) || isCesiumGlobeReady(viewer);
}
