import * as Cesium from "cesium";
import { normalizeVWorldRuntimeUrl } from "./vworldRuntimeUrls";

let viewer;
let miniViewer;
let pauseMiniViewer;
let vworldMap;
let vworldScriptPromise;
let vworldInitPromise;
let koreaBuildingsTileset;
let koreaBuildingsPromise;
let renderOptimizedForMenu = false;

const ionToken = (import.meta.env.VITE_CESIUM_ION_TOKEN ?? "").trim();
const runtimeConfig = window.__FLIGHT_SIM_CONFIG__ ?? {};
const vworldApiKey = (runtimeConfig.vworldApiKey ?? "").trim();
const configuredVworldDomain = (runtimeConfig.vworldDomain ?? "").trim();
const mapTilerApiKey = (runtimeConfig.mapTilerApiKey ?? "").trim();
const flightSimSearchParams =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
const queryOfflineMapRegion = (
  flightSimSearchParams.get("offlineMap") ?? ""
).trim();
const offlineMapPortEnabled =
  typeof window !== "undefined" &&
  ["49154", "49164"].includes(window.location.port);
const offlineMapConfig = {
  ...(runtimeConfig.offlineMap ?? {}),
  enabled:
    offlineMapPortEnabled &&
    (runtimeConfig.offlineMap?.enabled === true ||
      queryOfflineMapRegion.length > 0),
  region: queryOfflineMapRegion || runtimeConfig.offlineMap?.region,
  label:
    flightSimSearchParams.get("offlineMapLabel") ??
    runtimeConfig.offlineMap?.label,
  imageryTemplateUrl:
    flightSimSearchParams.get("offlineImageryTileUrl") ??
    runtimeConfig.offlineMap?.imageryTemplateUrl,
  cesiumTerrainUrl:
    flightSimSearchParams.get("offlineCesiumTerrainUrl") ??
    runtimeConfig.offlineMap?.cesiumTerrainUrl,
};
if (offlineMapConfig.region && !offlineMapConfig.imageryTemplateUrl) {
  offlineMapConfig.imageryTemplateUrl = `/offline-map/${offlineMapConfig.region}/raster/satellite/{z}/{x}/{y}.jpg`;
}
const offlineMapEnabled = offlineMapConfig.enabled === true;
const mapTilerTerrainUrl = mapTilerApiKey
  ? `https://api.maptiler.com/tiles/terrain-quantized-mesh-v2/?key=${mapTilerApiKey}`
  : null;
const koreaRectangle = Cesium.Rectangle.fromDegrees(124.5, 33.0, 132.5, 39.5);
const runtimeState = {
  mapProvider: "initializing",
  vworld: {
    configuredDomain: configuredVworldDomain || null,
    pageHost: null,
    pageHostname: null,
    runtimeDomains: [],
    scriptCandidates: [],
    loadedScriptUrl: null,
    scriptLoaded: false,
    scriptGlobalsReady: false,
    viewerReady: false,
    viewerDetected: false,
    callbackFired: false,
    mapStartRequested: false,
    eligible: false,
    requestedStartInKorea: false,
    initializationStage: "idle",
    initialPosition: null,
    layerName: null,
    layerActivated: false,
    layerCandidates: [],
    moduleDetected: false,
    lastError: null,
  },
};

if (typeof window !== "undefined") {
  updateRuntimeState({
    vworld: {
      pageHost: window.location.host ?? null,
      pageHostname: window.location.hostname ?? null,
    },
  });
  window.__FLIGHT_SIM_RUNTIME__ = runtimeState;
}

Cesium.Ion.defaultAccessToken = ionToken;

function updateRuntimeState(patch = {}) {
  if (patch.mapProvider) {
    runtimeState.mapProvider = patch.mapProvider;
  }

  if (patch.vworld) {
    Object.assign(runtimeState.vworld, patch.vworld);
  }

  if (typeof window !== "undefined") {
    window.__FLIGHT_SIM_RUNTIME__ = runtimeState;
  }
}

export function shouldPreferVWorldRuntime(initialPosition = {}) {
  if (offlineMapEnabled) {
    return false;
  }

  const { lon, lat } = normalizeInitialPosition(initialPosition);
  return Boolean(vworldApiKey) && isInsideKorea(lon, lat);
}

function shouldUseVWorldWebGL(initialPosition = {}) {
  return shouldPreferVWorldRuntime(initialPosition);
}

function getVWorldUnavailableReason(initialPosition = {}) {
  if (!vworldApiKey) {
    return "vworld-api-key-missing";
  }

  if (!shouldPreferVWorldRuntime(initialPosition)) {
    return "vworld-outside-korea";
  }

  return "vworld-runtime-unavailable";
}

function isInsideKorea(lon, lat) {
  return lon >= 124.5 && lon <= 132.5 && lat >= 33.0 && lat <= 39.5;
}

function getRuntimeDomains() {
  if (typeof window === "undefined") {
    return configuredVworldDomain ? [configuredVworldDomain] : [];
  }

  const candidates = [
    configuredVworldDomain,
    window.location.hostname ?? "",
    window.location.host ?? "",
  ];

  const runtimeDomains = [
    ...new Set(candidates.filter((candidate) => candidate.length > 0)),
  ];
  updateRuntimeState({
    vworld: {
      runtimeDomains,
    },
  });
  return runtimeDomains;
}

function buildVWorldScriptUrls() {
  const baseUrl = new URL("https://map.vworld.kr/js/webglMapInit.js.do");
  baseUrl.searchParams.set("version", "3.0");
  baseUrl.searchParams.set("apiKey", vworldApiKey);

  const urls = getRuntimeDomains().map((domain) => {
    const scriptUrl = new URL(baseUrl.toString());
    scriptUrl.searchParams.set("domain", domain);
    return scriptUrl.toString();
  });

  urls.push(baseUrl.toString());
  const scriptCandidates = [...new Set(urls)];
  updateRuntimeState({
    vworld: {
      scriptCandidates,
    },
  });
  return scriptCandidates;
}

function normalizeInitialPosition(initialPosition = {}) {
  const lon = Number.isFinite(initialPosition.lon)
    ? initialPosition.lon
    : 126.978;
  const lat = Number.isFinite(initialPosition.lat)
    ? initialPosition.lat
    : 37.5665;
  const alt = Number.isFinite(initialPosition.alt)
    ? Math.max(initialPosition.alt, 5000)
    : 15000;

  return { lon, lat, alt };
}

function loadExternalScript(
  src,
  { async = true, attributeName = "data-vworld-src" } = {}
) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[${attributeName}="${src}"]`
    );
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error(`Failed to load script: ${src}`)),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = async;
    script.setAttribute(attributeName, src);
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load script: ${src}`)),
      { once: true }
    );
    document.head.appendChild(script);
  });
}

function loadExternalStylesheet(href) {
  return new Promise((resolve, reject) => {
    const existingStylesheet = document.querySelector(
      `link[data-vworld-href="${href}"]`
    );
    if (existingStylesheet) {
      if (existingStylesheet.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingStylesheet.addEventListener("load", () => resolve(), {
        once: true,
      });
      existingStylesheet.addEventListener(
        "error",
        () => reject(new Error(`Failed to load stylesheet: ${href}`)),
        { once: true }
      );
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.vworldHref = href;
    link.addEventListener(
      "load",
      () => {
        link.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    link.addEventListener(
      "error",
      () => reject(new Error(`Failed to load stylesheet: ${href}`)),
      { once: true }
    );
    document.head.appendChild(link);
  });
}

function queueVWorldDocumentWrite(chunks, baseUrl) {
  const markup = chunks.join("");
  const trimmedMarkup = markup.trim();
  if (!trimmedMarkup) {
    return Promise.resolve();
  }

  const template = document.createElement("template");
  template.innerHTML = trimmedMarkup;

  const nodes = Array.from(template.content.childNodes);
  return nodes.reduce((promiseChain, node) => {
    return promiseChain.then(async () => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node;
      const tagName = element.tagName.toLowerCase();

      if (tagName === "script") {
        const nestedSrc = element.getAttribute("src");
        if (!nestedSrc) return;

        await loadExternalScript(
          normalizeVWorldRuntimeUrl(nestedSrc, baseUrl),
          {
            async: false,
          }
        );
        return;
      }

      if (tagName === "link") {
        const href = element.getAttribute("href");
        if (!href) return;

        await loadExternalStylesheet(normalizeVWorldRuntimeUrl(href, baseUrl));
        return;
      }

      if (tagName === "style") {
        document.head.appendChild(element.cloneNode(true));
      }
    });
  }, Promise.resolve());
}

function loadVWorldDocumentRuntime(src) {
  return new Promise((resolve, reject) => {
    const originalWrite = document.write.bind(document);
    const originalWriteln =
      typeof document.writeln === "function"
        ? document.writeln.bind(document)
        : (...chunks) => originalWrite(...chunks);
    let pendingWrites = Promise.resolve();
    let writeCount = 0;

    const enqueueWrite = (...chunks) => {
      writeCount += 1;
      pendingWrites = pendingWrites.then(() =>
        queueVWorldDocumentWrite(chunks, src)
      );
    };

    const waitForPendingWrites = () => {
      const observedWriteCount = writeCount;
      const observedPendingWrites = pendingWrites;

      return observedPendingWrites.then(() => {
        if (observedWriteCount !== writeCount) {
          return waitForPendingWrites();
        }
        return undefined;
      });
    };

    document.write = (...chunks) => {
      enqueueWrite(...chunks);
    };
    document.writeln = (...chunks) => {
      enqueueWrite(...chunks, "\n");
    };

    loadExternalScript(src, { async: false })
      .then(() => waitForPendingWrites())
      .then(resolve)
      .catch(reject)
      .finally(() => {
        document.write = originalWrite;
        document.writeln = originalWriteln;
      });
  });
}

function loadVWorldScript(initialPosition = {}) {
  const normalizedInitialPosition = normalizeInitialPosition(initialPosition);
  updateRuntimeState({
    vworld: {
      eligible: shouldUseVWorldWebGL(normalizedInitialPosition),
      requestedStartInKorea: isInsideKorea(
        normalizedInitialPosition.lon,
        normalizedInitialPosition.lat
      ),
      initialPosition: normalizedInitialPosition,
      moduleDetected: Boolean(window.Module),
      initializationStage: "script-loading",
    },
  });

  if (!shouldUseVWorldWebGL(initialPosition)) {
    updateRuntimeState({
      vworld: {
        initializationStage: "skipped",
        lastError: getVWorldUnavailableReason(initialPosition),
      },
    });
    return Promise.resolve(false);
  }

  if (window.vw?.Map && window.ws3d?.viewer) {
    updateRuntimeState({
      vworld: {
        scriptLoaded: true,
        scriptGlobalsReady: true,
        viewerDetected: true,
        initializationStage: "viewer-ready",
        lastError: null,
      },
    });
    return Promise.resolve(true);
  }

  if (!vworldScriptPromise) {
    const scriptUrls = buildVWorldScriptUrls();

    vworldScriptPromise = scriptUrls
      .reduce(
        (promiseChain, scriptUrl) =>
          promiseChain.then(async (alreadyLoaded) => {
            if (alreadyLoaded || window.vw?.Map) {
              return true;
            }

            try {
              await loadVWorldDocumentRuntime(scriptUrl);
              const scriptGlobalsReady = Boolean(window.vw?.Map);
              updateRuntimeState({
                vworld: {
                  loadedScriptUrl: scriptUrl,
                  scriptLoaded: true,
                  scriptGlobalsReady,
                  moduleDetected: Boolean(window.Module),
                  initializationStage: scriptGlobalsReady
                    ? "script-ready"
                    : "script-loaded-without-globals",
                  lastError: scriptGlobalsReady
                    ? null
                    : "vworld-api-globals-missing",
                },
              });
              return scriptGlobalsReady;
            } catch (error) {
              updateRuntimeState({
                vworld: {
                  scriptLoaded: false,
                  scriptGlobalsReady: false,
                  initializationStage: "script-load-failed",
                  lastError: `script-load: ${scriptUrl}`,
                },
              });
              console.warn(
                "Failed to load VWorld WebGL 3.0 script candidate.",
                {
                  scriptUrl,
                  error,
                }
              );
              return false;
            }
          }),
        Promise.resolve(false)
      )
      .catch((error) => {
        updateRuntimeState({
          vworld: {
            initializationStage: "script-load-failed",
            lastError: "script-load-failed",
          },
        });
        console.warn("Failed to load VWorld WebGL 3.0 script.", error);
        return false;
      });
  }

  return vworldScriptPromise;
}

function createBaseLayer() {
  if (offlineMapEnabled) {
    const imageryTemplateUrl = String(
      offlineMapConfig.imageryTemplateUrl ?? ""
    ).trim();
    if (imageryTemplateUrl) {
      return new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: imageryTemplateUrl,
          credit: offlineMapConfig.label ?? "Offline map",
          tileWidth: 256,
          tileHeight: 256,
          hasAlphaChannel: false,
        })
      );
    }

    return new Cesium.ImageryLayer(new Cesium.TileCoordinatesImageryProvider());
  }

  if (mapTilerApiKey) {
    return new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}@2x.jpg?key=${mapTilerApiKey}`,
        credit: "MapTiler",
        tileWidth: 512,
        tileHeight: 512,
        hasAlphaChannel: false,
      })
    );
  }

  return new Cesium.ImageryLayer(
    new Cesium.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/",
    })
  );
}

function createEllipsoidTerrainProvider() {
  return new Cesium.EllipsoidTerrainProvider();
}

function createMapTilerTerrain() {
  if (!mapTilerTerrainUrl) {
    return null;
  }

  return new Cesium.Terrain(
    Cesium.CesiumTerrainProvider.fromUrl(mapTilerTerrainUrl, {
      requestVertexNormals: true,
    })
  );
}

function createTerrainOptions() {
  const offlineTerrainUrl = String(
    offlineMapConfig.cesiumTerrainUrl ?? ""
  ).trim();
  if (offlineMapEnabled && offlineTerrainUrl) {
    return {
      terrain: new Cesium.Terrain(
        Cesium.CesiumTerrainProvider.fromUrl(offlineTerrainUrl, {
          requestVertexNormals: true,
        })
      ),
    };
  }
  if (offlineMapEnabled) {
    return {
      terrainProvider: createEllipsoidTerrainProvider(),
    };
  }

  if (mapTilerTerrainUrl) {
    return {
      terrain: createMapTilerTerrain(),
    };
  }

  if (ionToken) {
    return {
      terrain: Cesium.Terrain.fromWorldTerrain(),
    };
  }

  return {
    terrainProvider: createEllipsoidTerrainProvider(),
  };
}

function bindTerrainFallback(targetViewer, terrain) {
  if (!targetViewer || !terrain?.errorEvent) {
    return;
  }

  let hasFallenBack = false;
  const fallbackToEllipsoidTerrain = (error) => {
    if (hasFallenBack) {
      return;
    }

    hasFallenBack = true;
    console.warn(
      "Cesium World Terrain is unavailable. Falling back to ellipsoid terrain.",
      error
    );
    targetViewer.terrainProvider = createEllipsoidTerrainProvider();
    targetViewer.scene?.requestRender?.();
  };

  terrain.errorEvent.addEventListener((error) => {
    fallbackToEllipsoidTerrain(error);
  });

  terrain.readyEvent?.addEventListener((provider) => {
    provider?.errorEvent?.addEventListener((error) => {
      fallbackToEllipsoidTerrain(error);
    });
  });
}

function createVWorldProvider(layer, fileExtension) {
  return new Cesium.UrlTemplateImageryProvider({
    url: `https://api.vworld.kr/req/wmts/1.0.0/${vworldApiKey}/${layer}/{z}/{y}/{x}.${fileExtension}`,
    credit: "VWorld",
    minimumLevel: 6,
    maximumLevel: 19,
    rectangle: koreaRectangle,
  });
}

function attachVWorldImagery(targetViewer) {
  if (offlineMapEnabled || !vworldApiKey || !targetViewer?.scene?.imageryLayers)
    return;

  targetViewer.scene.imageryLayers.addImageryProvider(
    createVWorldProvider("Satellite", "jpeg")
  );
  targetViewer.scene.imageryLayers.addImageryProvider(
    createVWorldProvider("Hybrid", "png")
  );
}

function applyRenderOptimization(targetViewer) {
  if (!targetViewer?.scene) return;

  targetViewer.scene.requestRenderMode = renderOptimizedForMenu;
  targetViewer.scene.maximumRenderTimeChange = renderOptimizedForMenu
    ? Infinity
    : 0;
}

function resolveViewerResolutionScale(main) {
  if (!main) {
    return 0.9;
  }

  if (typeof window === "undefined") {
    return 1;
  }

  return window.innerWidth < 960 ? 0.9 : 1;
}

function configureViewer(targetViewer, { main = false } = {}) {
  if (!targetViewer) return;

  applyRenderOptimization(targetViewer);
  targetViewer.scene.backgroundColor = Cesium.Color.fromCssColorString(
    main ? "#03080d" : "#000000"
  );
  targetViewer.scene.globe.maximumScreenSpaceError = main ? 1.2 : 2.4;
  targetViewer.scene.globe.tileCacheSize = main ? 4096 : 1024;
  targetViewer.scene.globe.preloadAncestors = true;
  targetViewer.scene.globe.preloadSiblings = true;
  targetViewer.scene.globe.loadingDescendantLimit = main ? 28 : 16;
  targetViewer.scene.globe.skipLevelOfDetail = !main;
  targetViewer.scene.globe.baseScreenSpaceError = main ? 256 : 1024;
  targetViewer.scene.globe.skipScreenSpaceErrorFactor = main ? 8 : 16;
  targetViewer.scene.globe.skipLevels = main ? 0 : 1;
  targetViewer.scene.globe.depthTestAgainstTerrain = true;
  targetViewer.resolutionScale = resolveViewerResolutionScale(main);
  const atmosphere =
    targetViewer.scene.skyAtmosphere ?? targetViewer.scene.atmosphere;

  const controller = targetViewer.scene.screenSpaceCameraController;
  controller.enableCollisionDetection = true;
  controller.minimumZoomDistance = 180;
  controller.maximumZoomDistance = 25000000;

  if (!main) {
    targetViewer.scene.globe.enableLighting = false;
    targetViewer.scene.globe.showGroundAtmosphere = false;
    targetViewer.scene.globe.baseColor = Cesium.Color.BLACK;
    if (targetViewer.scene.fog) {
      targetViewer.scene.fog.enabled = false;
    }
    targetViewer.scene.highDynamicRange = false;
    if (targetViewer.scene.postProcessStages?.fxaa) {
      targetViewer.scene.postProcessStages.fxaa.enabled = false;
    }
    if (atmosphere && "show" in atmosphere) {
      atmosphere.show = false;
    }
  }

  if (main) {
    targetViewer.scene.globe.enableLighting = true;
    targetViewer.scene.globe.showGroundAtmosphere = true;
    targetViewer.scene.globe.baseColor =
      Cesium.Color.fromCssColorString("#09131a");
    targetViewer.scene.highDynamicRange = true;
    if ("dynamicAtmosphereLighting" in targetViewer.scene.globe) {
      targetViewer.scene.globe.dynamicAtmosphereLighting = true;
    }
    if ("dynamicAtmosphereLightingFromSun" in targetViewer.scene.globe) {
      targetViewer.scene.globe.dynamicAtmosphereLightingFromSun = true;
    }
    if ("atmosphereBrightnessShift" in targetViewer.scene.globe) {
      targetViewer.scene.globe.atmosphereBrightnessShift = -0.03;
    }
    if ("atmosphereSaturationShift" in targetViewer.scene.globe) {
      targetViewer.scene.globe.atmosphereSaturationShift = -0.05;
    }
    if ("atmosphereHueShift" in targetViewer.scene.globe) {
      targetViewer.scene.globe.atmosphereHueShift = 0.01;
    }
    if (targetViewer.scene.postProcessStages?.fxaa) {
      targetViewer.scene.postProcessStages.fxaa.enabled = true;
    }
    if (targetViewer.scene.fog) {
      targetViewer.scene.fog.enabled = true;
      targetViewer.scene.fog.density = 0.000045;
      if ("minimumBrightness" in targetViewer.scene.fog) {
        targetViewer.scene.fog.minimumBrightness = 0.08;
      }
      if ("screenSpaceErrorFactor" in targetViewer.scene.fog) {
        targetViewer.scene.fog.screenSpaceErrorFactor = 1.8;
      }
    }
    if (atmosphere && "show" in atmosphere) {
      atmosphere.show = true;
    }
  }

  if (targetViewer._cesiumWidget?._creditContainer) {
    targetViewer._cesiumWidget._creditContainer.style.display = "none";
  }
}

function createMiniViewer(containerId) {
  const createdViewer = new Cesium.Viewer(containerId, {
    baseLayer: createBaseLayer(),
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    timeline: false,
    animation: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    shouldAnimate: false,
    skyBox: false,
    skyAtmosphere: false,
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true,
      },
    },
  });

  configureViewer(createdViewer, { main: false });
  attachVWorldImagery(createdViewer);
  return createdViewer;
}

function ensureMiniViewer(kind = "main") {
  if (kind === "pause") {
    if (!pauseMiniViewer) {
      pauseMiniViewer = createMiniViewer("pauseMinimapCesium");
    }
    return pauseMiniViewer;
  }

  if (!miniViewer) {
    miniViewer = createMiniViewer("minimapCesium");
  }
  return miniViewer;
}

function createFallbackMainViewer() {
  const terrainOptions = createTerrainOptions();
  const createdViewer = new Cesium.Viewer("cesiumContainer", {
    baseLayer: createBaseLayer(),
    ...terrainOptions,
    timeline: false,
    animation: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    shouldAnimate: false,
  });

  if (terrainOptions.terrain) {
    bindTerrainFallback(createdViewer, terrainOptions.terrain);
  }

  configureViewer(createdViewer, { main: true });
  attachVWorldImagery(createdViewer);
  return createdViewer;
}

function hasTerrainData(targetViewer) {
  const terrainProvider =
    targetViewer?.terrainProvider ?? targetViewer?.scene?.terrainProvider;
  return (
    Boolean(terrainProvider) &&
    !(terrainProvider instanceof Cesium.EllipsoidTerrainProvider)
  );
}

async function ensureKoreaBuildingsTileset() {
  if (offlineMapEnabled) {
    return null;
  }

  if (!viewer || koreaBuildingsTileset || koreaBuildingsPromise) {
    return koreaBuildingsPromise ?? koreaBuildingsTileset;
  }

  koreaBuildingsPromise = Cesium.Cesium3DTileset.fromUrl(
    "https://xdworld.vworld.kr/TDServer/services/facility_LOD4/vworld_3d_facility.json",
    {
      maximumScreenSpaceError: 10,
      dynamicScreenSpaceError: false,
      skipLevelOfDetail: false,
      preferLeaves: true,
    }
  )
    .then((tileset) => {
      koreaBuildingsTileset = viewer.scene.primitives.add(tileset);
      koreaBuildingsTileset.show = false;
      return koreaBuildingsTileset;
    })
    .catch((error) => {
      console.warn("Failed to load fallback VWorld Korea 3D tileset.", error);
      return null;
    })
    .finally(() => {
      koreaBuildingsPromise = null;
    });

  return koreaBuildingsPromise;
}

function configureVWorldViewer(targetViewer) {
  configureViewer(targetViewer, { main: true });

  const controller = targetViewer.scene.screenSpaceCameraController;
  controller.enableRotate = false;
  controller.enableTranslate = false;
  controller.enableZoom = false;
  controller.enableTilt = false;
  controller.enableLook = false;
}

function getModuleLayerElement(layerName) {
  try {
    return (
      window.Module?.getTileLayerList?.()?.nameAtLayer?.(layerName) ?? null
    );
  } catch (_error) {
    return null;
  }
}

function getVWorldLayerElement(mapInstance, layerName) {
  return (
    mapInstance?.getLayerElement?.(layerName) ??
    mapInstance?.getElementById?.(layerName) ??
    getModuleLayerElement(layerName)
  );
}

function findVWorldLayerElement(candidates) {
  if (!vworldMap && !window.ws3d?.viewer?.map) {
    return null;
  }

  updateRuntimeState({
    vworld: {
      layerCandidates: candidates,
    },
  });

  const mapInstance = window.ws3d?.viewer?.map ?? vworldMap;

  for (const label of candidates) {
    try {
      const layerElement = getVWorldLayerElement(mapInstance, label);
      if (layerElement) {
        return {
          label,
          element: layerElement,
        };
      }
    } catch (error) {
      console.warn("Failed to query a VWorld 3D layer candidate.", error);
    }
  }

  return null;
}

function showVWorldLayerElement(
  layerDescriptor,
  { trackRuntimeState = true } = {}
) {
  if (!layerDescriptor?.element) return false;

  const { element: layerElement, label } = layerDescriptor;

  const attemptedMethods = [
    () => layerElement.show?.(),
    () => layerElement.setVisible?.(true),
    () => layerElement.setEnable?.(true),
    () => layerElement.setActive?.(true),
    () => {
      if ("visible" in layerElement) {
        layerElement.visible = true;
      }
    },
    () => {
      if ("show" in layerElement && typeof layerElement.show !== "function") {
        layerElement.show = true;
      }
    },
  ];

  let activated = false;
  for (const invoke of attemptedMethods) {
    try {
      invoke();
      activated = true;
    } catch (_error) {
      // Best effort: VWorld layer objects vary by runtime.
    }
  }

  if ("simple_real3d" in layerElement) {
    try {
      layerElement.simple_real3d = false;
      activated = true;
    } catch (_error) {
      // Some runtimes expose this as a read-only property.
    }
  }

  if ("lod_object_detail_ratio" in layerElement) {
    try {
      layerElement.lod_object_detail_ratio = 1;
    } catch (_error) {
      // Ignore optional layer tuning failures.
    }
  }

  const tileset = layerElement._tileset;
  if (tileset) {
    tileset.show = true;
    tileset.maximumScreenSpaceError = 6;
    tileset.dynamicScreenSpaceError = false;
    tileset.skipLevelOfDetail = false;
    tileset.preferLeaves = true;
    activated = true;
  }

  if (trackRuntimeState) {
    updateRuntimeState({
      vworld: {
        layerName: label,
        layerActivated: activated,
      },
    });
  }

  return activated;
}

function hideVWorldLayerByName(layerName) {
  if (!layerName) return;

  const mapInstance = window.ws3d?.viewer?.map ?? vworldMap;
  const layerElement = mapInstance?.getLayerElement?.(layerName);
  if (!layerElement) return;

  try {
    layerElement.hide?.();
  } catch (_error) {
    // Ignore layer APIs that are unavailable in the current runtime.
  }
}

function configureVWorldSceneQuality(targetViewer) {
  if (!targetViewer?.scene) return;

  targetViewer.scene.highDynamicRange = false;
  targetViewer.scene.globe.depthTestAgainstTerrain = true;
  targetViewer.scene.globe.maximumScreenSpaceError = 0.95;
  targetViewer.scene.globe.tileCacheSize = 4096;
  targetViewer.scene.globe.preloadAncestors = true;
  targetViewer.scene.globe.preloadSiblings = true;
  targetViewer.scene.globe.loadingDescendantLimit = 28;
  targetViewer.resolutionScale = resolveViewerResolutionScale(true);
  if (targetViewer.scene.postProcessStages?.fxaa) {
    targetViewer.scene.postProcessStages.fxaa.enabled = true;
  }
  if (targetViewer.scene.fog) {
    targetViewer.scene.fog.enabled = true;
    targetViewer.scene.fog.density = 0.00005;
  }

  if (window.ws3d?.viewer?.setting) {
    window.ws3d.viewer.setting.useSunLighting = true;
  }
}

function activateOptionalVWorldLayer(candidates) {
  const layer = findVWorldLayerElement(candidates);
  if (!layer) {
    return false;
  }

  return showVWorldLayerElement(layer, { trackRuntimeState: false });
}

function activatePreferredVWorldLayers() {
  const buildingLayer = findVWorldLayerElement([
    "facility_build",
    "3차원 입체모형(LoD4)",
    "3차원 입체모형(Lod4)",
    "facility_build_all",
    "facility_build_lod3",
    "facility_build_lod2",
    "facility_build_lod1",
    "facility_LOD4",
    "lod4",
    "LoD4",
    "3차원 입체모형",
  ]);
  let buildingLayerActivated = false;
  if (buildingLayer) {
    buildingLayerActivated = showVWorldLayerElement(buildingLayer);
  } else {
    updateRuntimeState({
      vworld: {
        layerName: null,
        layerActivated: false,
        lastError: "building-layer-not-found",
      },
    });
  }

  activateOptionalVWorldLayer(["poi_base", "명칭(한글)"]);
  activateOptionalVWorldLayer(["hybrid_bound", "행정경계"]);
  hideVWorldLayerByName("명칭(영문)");

  updateRuntimeState({
    vworld: {
      initializationStage: buildingLayerActivated
        ? "layer-ready"
        : buildingLayer
          ? "layer-found"
          : "layer-missing",
    },
  });
}

async function initVWorldMainViewer(initialPosition) {
  const vworldLoaded = await loadVWorldScript(initialPosition);
  if (!vworldLoaded || !window.vw?.Map) {
    updateRuntimeState({
      vworld: {
        viewerReady: false,
        lastError:
          runtimeState.vworld.lastError ??
          getVWorldUnavailableReason(initialPosition),
      },
    });
    return null;
  }

  if (window.ws3d?.viewer && vworldMap) {
    viewer = window.ws3d.viewer;
    configureVWorldViewer(viewer);
    activatePreferredVWorldLayers();
    updateRuntimeState({
      mapProvider: "vworld-webgl",
      vworld: {
        viewerReady: true,
        viewerDetected: true,
        lastError: null,
      },
    });
    return viewer;
  }

  if (!vworldInitPromise) {
    updateRuntimeState({
      vworld: {
        initializationStage: "viewer-waiting",
        mapStartRequested: false,
        callbackFired: false,
        viewerDetected: false,
      },
    });

    vworldInitPromise = new Promise((resolve, reject) => {
      try {
        const vw = window.vw;
        const ws3d = window.ws3d;
        if (!vw?.Map || !vw.CameraPosition || !vw.CoordZ || !vw.Direction) {
          reject(new Error("VWorld WebGL API globals are unavailable."));
          return;
        }

        const previousInitCallback = vw.ws3dInitCallBack;
        const cameraPosition = new vw.CameraPosition(
          new vw.CoordZ(
            initialPosition.lon,
            initialPosition.lat,
            initialPosition.alt
          ),
          new vw.Direction(0, -90, 0)
        );
        let resolved = false;

        vw.ws3dInitCallBack = function () {
          if (typeof previousInitCallback === "function") {
            try {
              previousInitCallback();
            } catch (error) {
              console.warn("Previous VWorld init callback failed.", error);
            }
          }

          if (resolved) return;
          resolved = true;
          updateRuntimeState({
            vworld: {
              callbackFired: true,
              initializationStage: "callback-fired",
            },
          });

          try {
            viewer = window.ws3d?.viewer ?? ws3d?.viewer;
            if (!viewer) {
              reject(
                new Error("VWorld viewer is unavailable after initialization.")
              );
              return;
            }

            configureVWorldViewer(viewer);
            configureVWorldSceneQuality(viewer);
            activatePreferredVWorldLayers();
            updateRuntimeState({
              mapProvider: "vworld-webgl",
              vworld: {
                viewerReady: true,
                viewerDetected: true,
                lastError: null,
              },
            });
            resolve(viewer);
          } catch (error) {
            reject(error);
          }
        };

        vworldMap = new vw.Map();
        vworldMap.setOption({
          mapId: "cesiumContainer",
          initPosition: cameraPosition,
          logo: false,
          navigation: false,
        });
        updateRuntimeState({
          vworld: {
            mapStartRequested: true,
            initializationStage: "map-started",
          },
        });
        vworldMap.start();

        window.setTimeout(() => {
          if (resolved) return;

          viewer = window.ws3d?.viewer ?? ws3d?.viewer;
          if (viewer) {
            resolved = true;
            configureVWorldViewer(viewer);
            configureVWorldSceneQuality(viewer);
            activatePreferredVWorldLayers();
            updateRuntimeState({
              mapProvider: "vworld-webgl",
              vworld: {
                viewerReady: true,
                viewerDetected: true,
                lastError: null,
              },
            });
            resolve(viewer);
            return;
          }

          reject(new Error("Timed out while waiting for the VWorld viewer."));
        }, 12000);
      } catch (error) {
        reject(error);
      }
    })
      .catch((error) => {
        updateRuntimeState({
          vworld: {
            viewerReady: false,
            initializationStage: "viewer-init-failed",
            lastError:
              error instanceof Error ? error.message : "vworld-init-failed",
          },
        });
        console.warn("Failed to initialize VWorld WebGL map.", error);
        return null;
      })
      .finally(() => {
        vworldInitPromise = null;
      });
  }

  return vworldInitPromise;
}

function isUsingVWorldMainViewer() {
  return Boolean(window.ws3d?.viewer && viewer === window.ws3d.viewer);
}

export function updateKoreaMapMode(lon, lat) {
  if (!viewer) return;

  if (isUsingVWorldMainViewer()) {
    return;
  }

  const shouldShowKoreaEnhancements =
    Boolean(vworldApiKey) &&
    Number.isFinite(lon) &&
    Number.isFinite(lat) &&
    isInsideKorea(lon, lat);
  const canRenderFallbackBuildings =
    shouldShowKoreaEnhancements && hasTerrainData(viewer);

  if (!canRenderFallbackBuildings) {
    if (koreaBuildingsTileset) {
      koreaBuildingsTileset.show = false;
    }
    viewer.scene.requestRender();
    return;
  }

  void ensureKoreaBuildingsTileset().then((tileset) => {
    if (!tileset || !viewer || isUsingVWorldMainViewer()) {
      return;
    }

    tileset.show = true;
    tileset.maximumScreenSpaceError = 8;
    tileset.dynamicScreenSpaceError = false;
    tileset.skipLevelOfDetail = false;
    tileset.preferLeaves = true;
    viewer.scene.requestRender();
  });
}

export async function initCesium(initialPosition = {}) {
  const normalizedInitialPosition = normalizeInitialPosition(initialPosition);
  updateRuntimeState({
    vworld: {
      eligible: shouldUseVWorldWebGL(normalizedInitialPosition),
      requestedStartInKorea: isInsideKorea(
        normalizedInitialPosition.lon,
        normalizedInitialPosition.lat
      ),
      initialPosition: normalizedInitialPosition,
      moduleDetected: Boolean(window.Module),
    },
  });

  viewer =
    (await initVWorldMainViewer(normalizedInitialPosition)) ??
    createFallbackMainViewer();
  updateRuntimeState({
    mapProvider: isUsingVWorldMainViewer() ? "vworld-webgl" : "cesium-fallback",
    vworld: {
      viewerReady: isUsingVWorldMainViewer(),
    },
  });

  setControlsEnabled(false);
  return viewer;
}

export function setRenderOptimization(isMenu) {
  renderOptimizedForMenu = Boolean(isMenu);

  [viewer, miniViewer, pauseMiniViewer]
    .filter(Boolean)
    .forEach(applyRenderOptimization);
}

export function setControlsEnabled(enabled) {
  if (!viewer) return;

  const controller = viewer.scene.screenSpaceCameraController;
  controller.enableRotate = enabled;
  controller.enableTranslate = enabled;
  controller.enableZoom = enabled;
  controller.enableTilt = enabled;
  controller.enableLook = enabled;
}

export function setCameraToPlane(lon, lat, alt, heading, pitch, roll) {
  if (!viewer) return;

  updateKoreaMapMode(lon, lat);

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
    orientation: {
      heading: Cesium.Math.toRadians(heading),
      pitch: Cesium.Math.toRadians(pitch),
      roll: Cesium.Math.toRadians(roll),
    },
  });

  viewer.scene.requestRender();
}

export function setMinimapCamera(lon, lat, altitude, heading) {
  const activeMiniViewer = miniViewer ?? ensureMiniViewer("main");
  if (!activeMiniViewer) return;

  if (
    activeMiniViewer.canvas.width === 0 ||
    activeMiniViewer.canvas.height === 0
  ) {
    return;
  }

  activeMiniViewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
    orientation: {
      heading: Cesium.Math.toRadians(heading),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
  });

  activeMiniViewer.scene.requestRender();
}

export function setPauseMinimapCamera(lon, lat, altitude, heading) {
  const activePauseMiniViewer = pauseMiniViewer ?? ensureMiniViewer("pause");
  if (!activePauseMiniViewer) return;

  if (
    activePauseMiniViewer.canvas.width === 0 ||
    activePauseMiniViewer.canvas.height === 0
  ) {
    return;
  }

  activePauseMiniViewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
    orientation: {
      heading: Cesium.Math.toRadians(heading),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
  });

  activePauseMiniViewer.scene.requestRender();
}

export function getViewer() {
  return viewer;
}

export function getMiniViewer() {
  return miniViewer;
}

export function getPauseMiniViewer() {
  return pauseMiniViewer;
}
