import { describe, expect, test } from "vitest";
import {
  buildOfflineTerrainStyle,
  buildMapTilerTerrainStyle,
  canUseMapTilerTerrainPlanA,
  isFatalMapLibreSetupError,
  prepareOfflineTerrainManifestForRuntime,
} from "../../../../public/terrain-3d/maptilerTerrainPlanA.js";

describe("maptilerTerrainPlanA", () => {
  test("builds a MapLibre style backed by MapTiler Terrain RGB DEM", () => {
    const style = buildMapTilerTerrainStyle("sample-key");

    expect(style.sources["maptiler-terrain-dem"]).toEqual(
      expect.objectContaining({
        type: "raster-dem",
        tileSize: 256,
        maxzoom: 14,
      })
    );
    expect(style.sources["maptiler-terrain-dem"].url).toContain(
      "/tiles/terrain-rgb/tiles.json?key=sample-key"
    );
    expect(style.terrain).toEqual({
      source: "maptiler-terrain-dem",
      exaggeration: 1.5,
    });
  });

  test("requires both MapLibre and a MapTiler key for Plan A", () => {
    expect(
      canUseMapTilerTerrainPlanA({
        mapLibre: { Map: function Map() {} },
        mapTilerApiKey: "sample-key",
      })
    ).toBe(true);
    expect(
      canUseMapTilerTerrainPlanA({
        mapLibre: { Map: function Map() {} },
        mapTilerApiKey: "",
      })
    ).toBe(false);
    expect(
      canUseMapTilerTerrainPlanA({
        mapLibre: {},
        mapTilerApiKey: "sample-key",
      })
    ).toBe(false);
  });

  test("builds an offline MapLibre terrain style from a manifest", () => {
    const style = buildOfflineTerrainStyle({
      __manifestUrl: "http://localhost/offline-map/seungjin/manifest.json",
      label: "Seungjin",
      sources: {
        base: {
          tiles: "./raster/basic/{z}/{x}/{y}.png",
          tileSize: 256,
        },
        terrainDem: {
          tiles: "./terrain/terrarium/{z}/{x}/{y}.png",
          encoding: "terrarium",
          tileSize: 256,
        },
      },
      terrain: {
        exaggeration: 1.35,
      },
      bounds: {
        west: 127.13,
        south: 37.91,
        east: 127.58,
        north: 38.24,
      },
      intel: {
        buildings: {
          data: "./intel/buildings.geojson",
        },
      },
    });

    expect(style.sources["maptiler-terrain-dem"]).toEqual(
      expect.objectContaining({
        type: "raster-dem",
        encoding: "terrarium",
        tileSize: 256,
      })
    );
    expect(style.sources["maptiler-terrain-dem"].tiles[0]).toBe(
      "/offline-map/seungjin/terrain/terrarium/{z}/{x}/{y}.png"
    );
    expect(style.sources["maptiler-terrain-dem"].bounds).toEqual([
      127.13, 37.91, 127.58, 38.24,
    ]);
    expect(style.terrain).toEqual({
      source: "maptiler-terrain-dem",
      exaggeration: 1.35,
    });
    expect(style.layers.some((layer) => layer.id === "offline-buildings")).toBe(
      true
    );
  });

  test("can use Plan A with an offline manifest instead of a MapTiler key", () => {
    expect(
      canUseMapTilerTerrainPlanA({
        mapLibre: { Map: function Map() {} },
        mapTilerApiKey: "",
        offlineMapManifest: { id: "seungjin" },
      })
    ).toBe(true);
  });

  test("disables missing offline raster imagery before MapLibre loads it", async () => {
    const manifest = {
      __manifestUrl: "http://localhost/offline-map/seungjin/manifest.json",
      center: {
        longitude: 127.354386,
        latitude: 38.07775,
      },
      zoom: {
        preferred: 12,
      },
      sources: {
        satellite: {
          enabled: true,
          tiles: "./raster/satellite/{z}/{x}/{y}.jpg",
          minzoom: 6,
          maxzoom: 15,
        },
      },
    };
    const requestedUrls = [];

    const runtimeManifest = await prepareOfflineTerrainManifestForRuntime(
      manifest,
      {
        fetchImpl: async (url) => {
          requestedUrls.push(url);
          return {
            ok: true,
            headers: {
              get: () => "image/svg+xml; charset=utf-8",
            },
          };
        },
      }
    );
    const style = buildOfflineTerrainStyle(runtimeManifest);

    expect(runtimeManifest.sources.satellite.enabled).toBe(false);
    expect(style.sources["maptiler-satellite"]).toBeUndefined();
    expect(style.layers.some((layer) => layer.id === "offline-satellite")).toBe(
      false
    );
    expect(requestedUrls[0]).toBe(
      "/offline-map/seungjin/raster/satellite/15/27976/12630.jpg"
    );
  });

  test("keeps packaged offline raster imagery when the probe is decodable", async () => {
    const manifest = {
      __manifestUrl: "http://localhost/offline-map/seungjin/manifest.json",
      center: {
        longitude: 127.354386,
        latitude: 38.07775,
      },
      zoom: {
        preferred: 12,
      },
      sources: {
        satellite: {
          enabled: true,
          tiles: "./raster/satellite/{z}/{x}/{y}.jpg",
          minzoom: 6,
          maxzoom: 15,
        },
      },
    };

    const runtimeManifest = await prepareOfflineTerrainManifestForRuntime(
      manifest,
      {
        fetchImpl: async () => ({
          ok: true,
          headers: {
            get: () => "image/jpeg",
          },
        }),
      }
    );

    expect(runtimeManifest.sources.satellite.enabled).toBe(true);
  });

  test("can remove raster imagery for the offline DEM-only 3D runtime", async () => {
    const manifest = {
      __manifestUrl: "http://localhost/offline-map/seungjin/manifest.json",
      sources: {
        satellite: {
          enabled: true,
          tiles: "./raster/satellite/{z}/{x}/{y}.jpg",
          minzoom: 6,
          maxzoom: 15,
        },
        terrainDem: {
          tiles: "./terrain/terrarium/{z}/{x}/{y}.png",
          minzoom: 6,
          maxzoom: 13,
        },
      },
    };

    const runtimeManifest = await prepareOfflineTerrainManifestForRuntime(
      manifest,
      {
        disableRasterImagery: true,
        fetchImpl: async () => ({
          ok: true,
          headers: {
            get: () => "image/png",
          },
        }),
      }
    );
    const style = buildOfflineTerrainStyle(runtimeManifest);

    expect(runtimeManifest.sources.satellite.enabled).toBe(false);
    expect(style.sources["maptiler-satellite"]).toBeUndefined();
  });

  test("clamps offline DEM maxzoom to the highest decodable local tile", async () => {
    const manifest = {
      __manifestUrl: "http://localhost/offline-map/seungjin/manifest.json",
      center: {
        longitude: 127.354386,
        latitude: 38.07775,
      },
      zoom: {
        preferred: 12,
      },
      sources: {
        terrainDem: {
          tiles: "./terrain/terrarium/{z}/{x}/{y}.png",
          encoding: "terrarium",
          minzoom: 6,
          maxzoom: 15,
        },
      },
    };

    const runtimeManifest = await prepareOfflineTerrainManifestForRuntime(
      manifest,
      {
        fetchImpl: async (url) => ({
          ok: true,
          headers: {
            get: () => (url.includes("/13/") ? "image/png" : "text/html"),
          },
        }),
      }
    );
    const style = buildOfflineTerrainStyle(runtimeManifest);

    expect(runtimeManifest.sources.terrainDem.maxzoom).toBe(13);
    expect(style.sources["maptiler-terrain-dem"].maxzoom).toBe(13);
  });

  test("does not fail over for recoverable offline tile decode errors", () => {
    expect(
      isFatalMapLibreSetupError(
        new Error("InvalidStateError: The source image could not be decoded.")
      )
    ).toBe(false);
    expect(
      isFatalMapLibreSetupError(new Error("Terrain source does not exist."))
    ).toBe(true);
    expect(isFatalMapLibreSetupError({ status: 403 })).toBe(true);
  });
});
