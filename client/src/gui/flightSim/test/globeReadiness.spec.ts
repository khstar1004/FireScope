import { describe, expect, test } from "vitest";
import {
  isCesiumGlobeReady,
  isGlobeSurfaceReady,
  isVWorldGlobeReady,
} from "../../../../flight-sim-source/src/world/globeReadiness";

describe("flight sim globe readiness", () => {
  test("treats VWorld viewer readiness as globe readiness", () => {
    const runtimeState = {
      mapProvider: "vworld-webgl",
      vworld: {
        viewerReady: true,
      },
    };

    expect(isVWorldGlobeReady(runtimeState)).toBe(true);
    expect(isGlobeSurfaceReady(null, runtimeState)).toBe(true);
  });

  test("keeps waiting when VWorld viewer is not ready", () => {
    const runtimeState = {
      mapProvider: "vworld-webgl",
      vworld: {
        viewerReady: false,
      },
    };

    expect(isVWorldGlobeReady(runtimeState)).toBe(false);
    expect(isGlobeSurfaceReady(null, runtimeState)).toBe(false);
  });

  test("accepts loaded Cesium globe even when the private tile list is missing", () => {
    const viewer = {
      scene: {
        globe: {
          tilesLoaded: true,
        },
      },
    };

    expect(isCesiumGlobeReady(viewer)).toBe(true);
    expect(isGlobeSurfaceReady(viewer, null)).toBe(true);
  });

  test("requires rendered tiles while Cesium is still exposing the tile list", () => {
    const viewer = {
      scene: {
        globe: {
          tilesLoaded: true,
          _surface: {
            _tilesToRender: [],
          },
        },
      },
    };

    expect(isCesiumGlobeReady(viewer)).toBe(false);
    expect(isGlobeSurfaceReady(viewer, null)).toBe(false);
  });

  test("accepts an empty private tile list for the Cesium fallback runtime", () => {
    const viewer = {
      scene: {
        globe: {
          tilesLoaded: true,
          _surface: {
            _tilesToRender: [],
          },
        },
      },
    };
    const runtimeState = {
      mapProvider: "cesium-fallback",
      vworld: {
        viewerReady: false,
        initializationStage: "script-load-failed",
      },
    };

    expect(isCesiumGlobeReady(viewer)).toBe(false);
    expect(isGlobeSurfaceReady(viewer, runtimeState)).toBe(true);
  });
});
