export function isVWorldGlobeReady(runtimeState) {
  return (
    runtimeState?.mapProvider === "vworld-webgl" &&
    runtimeState?.vworld?.viewerReady === true
  );
}

export function isCesiumGlobeReady(viewer, options = {}) {
  const globe = viewer?.scene?.globe;
  if (!globe || globe.tilesLoaded !== true) {
    return false;
  }

  const tilesToRender = globe._surface?._tilesToRender;
  if (!Array.isArray(tilesToRender)) {
    return true;
  }

  return options.acceptEmptyTileList === true || tilesToRender.length > 0;
}

export function isGlobeSurfaceReady(viewer, runtimeState) {
  if (isVWorldGlobeReady(runtimeState)) {
    return true;
  }

  return isCesiumGlobeReady(viewer, {
    acceptEmptyTileList: runtimeState?.mapProvider === "cesium-fallback",
  });
}
