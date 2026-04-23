import {
  OLLAMA_TERRAIN_REPORT_SCHEMA,
  TERRAIN_INTEL_LAYER_DEFS,
  buildTerrainVlmPrompt,
  buildTerrainIntelAnalysis,
  getDefaultTerrainIntelSelection,
  loadTerrainIntelLayers,
  parseTerrainVlmReport,
  resolveTerrainIntelRuntimeConfig,
  extractOllamaModelNames,
  selectOllamaVisionModel,
} from "/terrain-3d/terrainIntel.js";
import { createTerrainPlacementRuntime } from "/terrain-3d/placementRuntime.js";

const Cesium = window.Cesium;
const runtimeConfig = window.__FLIGHT_SIM_CONFIG__ ?? {};
const searchParams = new URLSearchParams(window.location.search);
const intelRuntimeConfig = resolveTerrainIntelRuntimeConfig(
  runtimeConfig,
  searchParams
);
const mapTilerApiKey = String(runtimeConfig.mapTilerApiKey ?? "").trim();
const vworldApiKey = intelRuntimeConfig.vworldApiKey;
const mapTilerTerrainUrl = mapTilerApiKey
  ? `https://api.maptiler.com/tiles/terrain-quantized-mesh-v2/?key=${mapTilerApiKey}`
  : "";
const koreaRectangle = Cesium?.Rectangle?.fromDegrees?.(
  124.5,
  33.0,
  132.5,
  39.5
);
const gridColumns = 10;
const gridRows = 10;

const loadingOverlay = document.getElementById("loadingOverlay");
const loadingTitle = document.getElementById("loadingTitle");
const loadingDetail = document.getElementById("loadingDetail");
const statusText = document.getElementById("statusText");
const providerBadge = document.getElementById("providerBadge");
const centerMetric = document.getElementById("centerMetric");
const spanMetric = document.getElementById("spanMetric");
const topViewButton = document.getElementById("topViewButton");
const obliqueViewButton = document.getElementById("obliqueViewButton");
const resetViewButton = document.getElementById("resetViewButton");
const terrainInfoPanel = document.getElementById("terrainInfoPanel");
const terrainPanelBody = document.getElementById("terrainPanelBody");
const toggleTerrainPanelButton = document.getElementById(
  "toggleTerrainPanelButton"
);
const terrainPanelTabButtons = Array.from(
  document.querySelectorAll("[data-terrain-panel-tab]")
);
const terrainPanelGroups = Array.from(
  document.querySelectorAll("[data-terrain-panel-group]")
);
const reloadIntelLayersButton = document.getElementById(
  "reloadIntelLayersButton"
);
const toggleIntelLayersButton = document.getElementById(
  "toggleIntelLayersButton"
);
const intelLayerPanelBody = document.getElementById("intelLayerPanelBody");
const intelLayerList = document.getElementById("intelLayerList");
const layerStatusText = document.getElementById("layerStatusText");
const analysisStatusText = document.getElementById("analysisStatusText");
const runEngineAnalysisButton = document.getElementById(
  "runEngineAnalysisButton"
);
const runVlmAnalysisButton = document.getElementById("runVlmAnalysisButton");
const placementBadge = document.getElementById("placementBadge");
const analysisHud = document.getElementById("analysisHud");
const analysisHudLines = document.getElementById("analysisHudLines");
const analysisHudCards = document.getElementById("analysisHudCards");
const vlmRuntimeBadge = document.getElementById("vlmRuntimeBadge");
const captureStatusText = document.getElementById("captureStatusText");
const vlmReport = document.getElementById("vlmReport");
const sceneToWindowCoordinates =
  Cesium?.SceneTransforms?.worldToWindowCoordinates ??
  Cesium?.SceneTransforms?.wgs84ToWindowCoordinates;

const ANALYSIS_HUD_LAYOUT = Object.freeze({
  artillery: {
    kicker: "Fire Position",
    offsetX: -330,
    offsetY: -216,
  },
  concealment: {
    kicker: "Cover Node",
    offsetX: 130,
    offsetY: 96,
  },
  crossing: {
    kicker: "Crossing Window",
    offsetX: 128,
    offsetY: -212,
  },
  summary: {
    kicker: "AI Overview",
    offsetX: -164,
    offsetY: -296,
  },
});

const viewerState = {
  viewer: null,
  bounds: null,
  widthMeters: 0,
  heightMeters: 0,
  layerSelection: getDefaultTerrainIntelSelection(),
  layerResults: [],
  layerDataSources: [],
  analysis: null,
  analysisHudEntries: [],
  hudInsets: {
    left: 0,
    right: 0,
  },
  visualOptions: {
    showTerrainBriefing: true,
  },
  markerEntities: [],
  analysisOverlayEntities: [],
  vlmResult: null,
  captureTimestamp: null,
  busy: {
    layers: false,
    engine: false,
    vlm: false,
  },
};

function setLoadingState(title, detail) {
  if (loadingTitle) {
    loadingTitle.textContent = title;
  }
  if (loadingDetail) {
    loadingDetail.textContent = detail;
  }
}

function hideLoadingOverlay() {
  loadingOverlay?.classList.add("is-hidden");
}

function setStatusMessage(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function setProviderBadge(message) {
  if (providerBadge) {
    providerBadge.textContent = message;
  }
}

function setOptionalText(element, message) {
  if (!element) {
    return;
  }

  const text = String(message ?? "").trim();
  element.textContent = text;
  element.hidden = text.length === 0;
}

function setPlacementBadge(message) {
  if (placementBadge) {
    placementBadge.textContent = message;
  }
}

function setVlmRuntimeBadge(message) {
  setOptionalText(vlmRuntimeBadge, message);
}

function setCaptureStatusMessage(message) {
  setOptionalText(captureStatusText, message);
}

function setTerrainPanelCollapsed(collapsed) {
  terrainInfoPanel?.classList.toggle("is-collapsed", collapsed);
  if (terrainPanelBody) {
    terrainPanelBody.hidden = collapsed;
  }
  if (toggleTerrainPanelButton) {
    toggleTerrainPanelButton.textContent = collapsed ? "펼치기" : "접기";
    toggleTerrainPanelButton.setAttribute(
      "aria-expanded",
      collapsed ? "false" : "true"
    );
  }
}

function setIntelLayerBodyCollapsed(collapsed) {
  if (intelLayerPanelBody) {
    intelLayerPanelBody.hidden = collapsed;
  }
  if (toggleIntelLayersButton) {
    toggleIntelLayersButton.textContent = collapsed ? "펼치기" : "접기";
    toggleIntelLayersButton.setAttribute(
      "aria-expanded",
      collapsed ? "false" : "true"
    );
  }
}

function setActiveTerrainPanelTab(tabName) {
  terrainPanelTabButtons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const active = button.dataset.terrainPanelTab === tabName;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });

  terrainPanelGroups.forEach((group) => {
    if (!(group instanceof HTMLElement)) {
      return;
    }

    const active = group.dataset.terrainPanelGroup === tabName;
    group.classList.toggle("is-active", active);
    group.hidden = !active;
  });

  if (terrainPanelBody) {
    terrainPanelBody.scrollTop = 0;
  }
}

function wirePanelControls() {
  toggleTerrainPanelButton?.addEventListener("click", () => {
    const nextCollapsed = !terrainInfoPanel?.classList.contains("is-collapsed");
    setTerrainPanelCollapsed(nextCollapsed);
  });
  terrainPanelTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      setActiveTerrainPanelTab(button.dataset.terrainPanelTab ?? "overview");
    });
  });
  toggleIntelLayersButton?.addEventListener("click", () => {
    setIntelLayerBodyCollapsed(!intelLayerPanelBody?.hidden);
  });
  setActiveTerrainPanelTab("overview");
  setTerrainPanelCollapsed(false);
  setIntelLayerBodyCollapsed(false);
}

function setLayerStatusMessage(message) {
  setOptionalText(layerStatusText, message);
}

function setAnalysisStatusMessage(message) {
  setOptionalText(analysisStatusText, message);
}

function parseFiniteNumber(value) {
  const parsed = Number(value ?? Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBounds(bounds, minimumSpanDegrees = 0.002) {
  const west = Math.min(bounds.west, bounds.east);
  const east = Math.max(bounds.west, bounds.east);
  const south = Math.min(bounds.south, bounds.north);
  const north = Math.max(bounds.south, bounds.north);

  const centerLon = (west + east) / 2;
  const centerLat = (south + north) / 2;
  const width = Math.max(east - west, minimumSpanDegrees);
  const height = Math.max(north - south, minimumSpanDegrees);

  return {
    west: Math.max(-180, centerLon - width / 2),
    south: Math.max(-85, centerLat - height / 2),
    east: Math.min(180, centerLon + width / 2),
    north: Math.min(85, centerLat + height / 2),
  };
}

function expandBounds(bounds, ratio = 0.08, minimumPadding = 0.0006) {
  const widthPadding = Math.max(
    (bounds.east - bounds.west) * ratio,
    minimumPadding
  );
  const heightPadding = Math.max(
    (bounds.north - bounds.south) * ratio,
    minimumPadding
  );

  return normalizeBounds({
    west: bounds.west - widthPadding,
    south: bounds.south - heightPadding,
    east: bounds.east + widthPadding,
    north: bounds.north + heightPadding,
  });
}

function parseBoundsFromLocation() {
  const west = parseFiniteNumber(searchParams.get("west"));
  const south = parseFiniteNumber(searchParams.get("south"));
  const east = parseFiniteNumber(searchParams.get("east"));
  const north = parseFiniteNumber(searchParams.get("north"));

  if (west === null || south === null || east === null || north === null) {
    return null;
  }

  return normalizeBounds({
    west,
    south,
    east,
    north,
  });
}

function buildRectangle(bounds) {
  return Cesium.Rectangle.fromDegrees(
    bounds.west,
    bounds.south,
    bounds.east,
    bounds.north
  );
}

function getCenter(bounds) {
  return {
    lon: (bounds.west + bounds.east) / 2,
    lat: (bounds.south + bounds.north) / 2,
  };
}

function formatCoordinate(value) {
  return value.toFixed(4);
}

function formatDistanceKm(valueInKilometers) {
  return valueInKilometers >= 100
    ? `${valueInKilometers.toFixed(0)}km`
    : `${valueInKilometers.toFixed(1)}km`;
}

function formatMeters(valueInMeters) {
  return `${Math.round(valueInMeters).toLocaleString("ko-KR")}m`;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatScore(value) {
  return formatPercent(Math.min(Math.max(value, 0), 1));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function measureDistanceMeters(startLon, startLat, endLon, endLat) {
  const geodesic = new Cesium.EllipsoidGeodesic(
    Cesium.Cartographic.fromDegrees(startLon, startLat),
    Cesium.Cartographic.fromDegrees(endLon, endLat)
  );
  return Number.isFinite(geodesic.surfaceDistance)
    ? geodesic.surfaceDistance
    : 0;
}

function updateMetrics(bounds) {
  const center = getCenter(bounds);
  const widthMeters = measureDistanceMeters(
    bounds.west,
    center.lat,
    bounds.east,
    center.lat
  );
  const heightMeters = measureDistanceMeters(
    center.lon,
    bounds.south,
    center.lon,
    bounds.north
  );

  if (centerMetric) {
    centerMetric.textContent = `${formatCoordinate(center.lat)}, ${formatCoordinate(center.lon)}`;
  }

  if (spanMetric) {
    spanMetric.textContent = `${formatDistanceKm(widthMeters / 1000)} x ${formatDistanceKm(
      heightMeters / 1000
    )}`;
  }

  return {
    center,
    widthMeters,
    heightMeters,
  };
}

function isInsideKorea(bounds) {
  if (!koreaRectangle) {
    return false;
  }

  const center = getCenter(bounds);
  return Cesium.Rectangle.contains(
    koreaRectangle,
    Cesium.Cartographic.fromDegrees(center.lon, center.lat)
  );
}

function createBaseLayer(bounds) {
  if (mapTilerApiKey) {
    return new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}@2x.jpg?key=${mapTilerApiKey}`,
        credit: "MapTiler",
        tileWidth: 512,
        tileHeight: 512,
        hasAlphaChannel: false,
        rectangle: buildRectangle(bounds),
      })
    );
  }

  if (vworldApiKey && isInsideKorea(bounds)) {
    return new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: `https://api.vworld.kr/req/wmts/1.0.0/${vworldApiKey}/Satellite/{z}/{y}/{x}.jpeg`,
        credit: "VWorld",
        minimumLevel: 6,
        maximumLevel: 19,
        rectangle: buildRectangle(bounds),
      })
    );
  }

  return new Cesium.ImageryLayer(
    new Cesium.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/",
    })
  );
}

async function createTerrainProvider() {
  if (!mapTilerTerrainUrl) {
    return {
      provider: new Cesium.EllipsoidTerrainProvider(),
      providerLabel: "영상 전용",
      hasTerrain: false,
    };
  }

  try {
    const provider = await Cesium.CesiumTerrainProvider.fromUrl(
      mapTilerTerrainUrl,
      {
        requestVertexNormals: true,
      }
    );
    return {
      provider,
      providerLabel: "MapTiler Terrain",
      hasTerrain: true,
    };
  } catch (error) {
    console.warn(
      "Failed to initialize terrain provider. Falling back to ellipsoid.",
      error
    );
    return {
      provider: new Cesium.EllipsoidTerrainProvider(),
      providerLabel: "영상 전용",
      hasTerrain: false,
    };
  }
}

function estimateRangeMeters(widthMeters, heightMeters) {
  const dominantSpan = Math.max(widthMeters, heightMeters, 200);
  return Math.max(dominantSpan * 2.6, 1400);
}

function configureViewer(viewer, limitRectangle, widthMeters, heightMeters) {
  viewer.scene.requestRenderMode = true;
  viewer.scene.maximumRenderTimeChange = Number.POSITIVE_INFINITY;
  viewer.scene.globe.cartographicLimitRectangle = limitRectangle;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#061015");
  viewer.scene.globe.showGroundAtmosphere = false;
  viewer.scene.globe.maximumScreenSpaceError = 3;
  viewer.scene.skyAtmosphere.show = false;
  viewer.scene.fog.enabled = false;
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#02060c");
  viewer.shadows = false;
  viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.25);

  const controller = viewer.scene.screenSpaceCameraController;
  controller.minimumZoomDistance = Math.min(
    36,
    Math.max(12, Math.min(widthMeters, heightMeters) * 0.002)
  );
  controller.maximumZoomDistance =
    Math.max(widthMeters, heightMeters) * 20 + 4000;
  controller.enableCollisionDetection = true;
  controller.inertiaSpin = 0.65;
  controller.inertiaTranslate = 0.65;
  controller.inertiaZoom = 0.55;
  controller.maximumTiltAngle =
    Cesium.Math.PI_OVER_TWO - Cesium.Math.toRadians(5);

  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );

  const creditContainer = viewer.cesiumWidget.creditContainer;
  if (creditContainer) {
    creditContainer.style.display = "none";
  }
}

function addSelectionOverlay(viewer, bounds) {
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray([
        bounds.west,
        bounds.south,
        bounds.east,
        bounds.south,
        bounds.east,
        bounds.north,
        bounds.west,
        bounds.north,
        bounds.west,
        bounds.south,
      ]),
      clampToGround: true,
      width: 3,
      material: Cesium.Color.fromCssColorString("#7fe7ff"),
    },
  });

  const center = getCenter(bounds);
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat),
    point: {
      pixelSize: 8,
      color: Cesium.Color.fromCssColorString("#d0fbff"),
      outlineColor: Cesium.Color.fromCssColorString("#0a1b21"),
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

function flyToObliqueView(
  viewer,
  bounds,
  widthMeters,
  heightMeters,
  duration = 0.9
) {
  const boundingSphere = Cesium.BoundingSphere.fromRectangle3D(
    buildRectangle(bounds),
    Cesium.Ellipsoid.WGS84,
    0
  );
  const range = estimateRangeMeters(widthMeters, heightMeters);

  viewer.camera.flyToBoundingSphere(boundingSphere, {
    duration,
    offset: new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(24),
      Cesium.Math.toRadians(-38),
      range
    ),
  });
}

function flyToTopView(viewer, bounds, duration = 0.9) {
  viewer.camera.flyTo({
    destination: buildRectangle(expandBounds(bounds, 0.12, 0.001)),
    duration,
    orientation: {
      heading: 0,
      pitch: -Cesium.Math.PI_OVER_TWO,
      roll: 0,
    },
  });
}

function wireViewButtons(viewer, bounds, widthMeters, heightMeters) {
  obliqueViewButton?.addEventListener("click", () => {
    flyToObliqueView(viewer, bounds, widthMeters, heightMeters);
  });

  topViewButton?.addEventListener("click", () => {
    flyToTopView(viewer, bounds);
  });

  resetViewButton?.addEventListener("click", () => {
    flyToObliqueView(viewer, bounds, widthMeters, heightMeters);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderIntelLayerControls() {
  if (!intelLayerList) {
    return;
  }

  intelLayerList.innerHTML = "";
  for (const layerDef of TERRAIN_INTEL_LAYER_DEFS) {
    const layerResult = viewerState.layerResults.find(
      (result) => result.key === layerDef.key
    );
    const button = document.createElement("button");
    button.type = "button";
    button.className = "terrain-layer-toggle";
    button.setAttribute(
      "aria-pressed",
      viewerState.layerSelection[layerDef.key] === true ? "true" : "false"
    );
    if (viewerState.layerSelection[layerDef.key] === true) {
      button.classList.add("is-active");
    }
    button.disabled = viewerState.busy.layers;
    button.addEventListener("click", () => {
      if (viewerState.busy.layers) {
        return;
      }
      viewerState.layerSelection[layerDef.key] =
        viewerState.layerSelection[layerDef.key] !== true;
      renderIntelLayerControls();
      if (viewerState.viewer) {
        refreshTerrainIntelLayers(viewerState.viewer);
      }
    });

    const indicator = document.createElement("span");
    indicator.className = "terrain-layer-indicator";
    indicator.setAttribute("aria-hidden", "true");

    const copy = document.createElement("div");
    copy.className = "terrain-layer-copy";
    copy.innerHTML = `<strong>${escapeHtml(layerDef.label)}</strong>`;

    const meta = document.createElement("div");
    meta.className = "terrain-layer-meta";
    meta.innerHTML = `<span class="terrain-layer-count">${
      layerResult?.status === "ready"
        ? `${layerResult.featureCount.toLocaleString("ko-KR")}건`
        : "-"
    }</span><span class="terrain-layer-state">${escapeHtml(
      layerResult?.status === "error"
        ? (layerResult.errorMessage ?? "오류")
        : layerResult?.status === "ready"
          ? "로드됨"
          : ""
    )}</span>`;

    button.appendChild(indicator);
    button.appendChild(copy);
    button.appendChild(meta);
    intelLayerList.appendChild(button);
  }
}

function renderAnalysisSummary() {
  if (!analysisSummary) {
    return;
  }

  if (!viewerState.analysis) {
    analysisSummary.innerHTML = "";
    return;
  }

  const analysis = viewerState.analysis;
  analysisSummary.innerHTML = `
    <article class="terrain-summary-card">
      <h3>핵심 수치</h3>
      <dl class="terrain-summary-grid">
        <div>
          <dt>지형 성격</dt>
          <dd>${escapeHtml(analysis.terrainClass)}</dd>
        </div>
        <div>
          <dt>기복</dt>
          <dd>${escapeHtml(formatMeters(analysis.reliefMeters))}</dd>
        </div>
        <div>
          <dt>평균 가시율</dt>
          <dd>${escapeHtml(formatPercent(analysis.meanVisibilityRatio))}</dd>
        </div>
        <div>
          <dt>평균 차폐도</dt>
          <dd>${escapeHtml(formatScore(analysis.meanConcealmentScore))}</dd>
        </div>
        <div>
          <dt>최고 포대 점수</dt>
          <dd>${escapeHtml(formatScore(analysis.maxArtilleryScore))}</dd>
        </div>
        <div>
          <dt>실교차 수</dt>
          <dd>${escapeHtml(String(analysis.crossingIntersections.length))}</dd>
        </div>
      </dl>
    </article>
    <article class="terrain-summary-card">
      <h3>사선 제약</h3>
      ${renderFirePlanSummary(analysis.firePlans)}
    </article>
    <article class="terrain-summary-card">
      <h3>차폐 히트맵</h3>
      ${renderHeatmapSummary(analysis.topConcealmentCells, analysis.topExposureCells)}
    </article>
  `;
}

function renderFirePlanSummary(firePlans) {
  if (!Array.isArray(firePlans) || firePlans.length === 0) {
    return "";
  }

  return `<ul class="terrain-list">${firePlans
    .map((plan) => {
      const openLabel =
        plan.openSectors.length > 0
          ? plan.openSectors
              .map(
                (sector) =>
                  `${escapeHtml(sector.label)} ${escapeHtml(
                    formatPercent(sector.visibleRatio)
                  )}`
              )
              .join(", ")
          : "개방 섹터 없음";
      const blockedLabel =
        plan.blockedSectors.length > 0
          ? plan.blockedSectors
              .map(
                (sector) =>
                  `${escapeHtml(sector.label)} ${escapeHtml(
                    formatPercent(sector.visibleRatio)
                  )}`
              )
              .join(", ")
          : "차단 섹터 없음";

      return `<li><strong>${escapeHtml(plan.markerId)}</strong> 유효 거리 ${escapeHtml(
        formatDistanceKm((plan.recommendedMinRangeMeters ?? 0) / 1000)
      )} - ${escapeHtml(
        formatDistanceKm((plan.recommendedMaxRangeMeters ?? 0) / 1000)
      )}<br /><span class="terrain-report-copy">${openLabel} / ${blockedLabel}</span></li>`;
    })
    .join("")}</ul>`;
}

function renderHeatmapSummary(topConcealmentCells, topExposureCells) {
  const concealmentItems = Array.isArray(topConcealmentCells)
    ? topConcealmentCells
    : [];
  const exposureItems = Array.isArray(topExposureCells) ? topExposureCells : [];

  return `
    <section>
      <h3>차폐 우세 셀</h3>
      ${
        concealmentItems.length > 0
          ? `<ul class="terrain-list">${concealmentItems
              .slice(0, 3)
              .map(
                (cell) =>
                  `<li>R${cell.rowIndex + 1} C${cell.columnIndex + 1} · ${escapeHtml(
                    formatScore(cell.concealmentScore)
                  )}</li>`
              )
              .join("")}</ul>`
          : ""
      }
    </section>
    <section>
      <h3>노출 우세 셀</h3>
      ${
        exposureItems.length > 0
          ? `<ul class="terrain-list">${exposureItems
              .slice(0, 3)
              .map(
                (cell) =>
                  `<li>R${cell.rowIndex + 1} C${cell.columnIndex + 1} · ${escapeHtml(
                    formatScore(cell.exposureScore)
                  )}</li>`
              )
              .join("")}</ul>`
          : ""
      }
    </section>
  `;
}

function renderVlmReport() {
  if (!vlmReport) {
    return;
  }

  if (!viewerState.vlmResult) {
    vlmReport.innerHTML = "";
    return;
  }

  const report = viewerState.vlmResult;
  vlmReport.innerHTML = `
    <article class="terrain-report-card">
      <h3>상황 요약</h3>
      <p class="terrain-report-copy">${escapeHtml(report.executiveSummary ?? "")}</p>
    </article>
    ${renderReportListCard("포격 시사점", report.artilleryImplications)}
    ${renderReportListCard("기동 시사점", report.maneuverImplications)}
    ${renderReportListCard("위험 요소", report.risks)}
    ${renderReportListCard("기회 요소", report.opportunities)}
  `;
}

function renderReportListCard(title, items) {
  const listItems = Array.isArray(items) ? items : [];
  return `
    <article class="terrain-report-card">
      <h3>${escapeHtml(title)}</h3>
      ${
        listItems.length > 0
          ? `<ul class="terrain-list">${listItems
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}</ul>`
          : ""
      }
    </article>
  `;
}

function getTopMarker(markers, type) {
  return (markers ?? [])
    .filter((marker) => marker.type === type)
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))[0];
}

function getEntryMetrics(analysis, marker) {
  if (marker.type === "artillery") {
    const firePlan = (analysis.firePlans ?? []).find(
      (plan) => plan.markerId === marker.id
    );
    return [
      ["점수", formatScore(marker.score ?? 0)],
      ["경사", `${marker.slopeDegrees.toFixed(1)}°`],
      [
        "사거리",
        firePlan
          ? formatDistanceKm((firePlan.recommendedMaxRangeMeters ?? 0) / 1000)
          : formatDistanceKm(Math.max(analysis.widthMeters, 1) / 1000),
      ],
    ];
  }

  if (marker.type === "concealment") {
    return [
      ["차폐", formatScore(marker.concealmentScore ?? 0)],
      ["가시", formatPercent(marker.visibilityRatio ?? 0)],
      ["경사", `${marker.slopeDegrees.toFixed(1)}°`],
    ];
  }

  return [
    ["점수", formatScore(marker.score ?? 0)],
    ["표고", formatMeters(marker.heightMeters)],
    ["경사", `${marker.slopeDegrees.toFixed(1)}°`],
  ];
}

function getEntrySummary(analysis, marker) {
  const markerCallout = getMarkerCalloutForHud(marker.id);

  if (marker.type === "artillery") {
    if (markerCallout) {
      return markerCallout;
    }
    if (viewerState.vlmResult?.artilleryImplications?.[0]) {
      return viewerState.vlmResult.artilleryImplications[0];
    }
    const firePlan = (analysis.firePlans ?? []).find(
      (plan) => plan.markerId === marker.id
    );
    if (!firePlan) {
      return `${analysis.terrainClass} 지형에서 상단 화력 노드로 분류됐습니다.`;
    }
    const openLabel =
      firePlan.openSectors.length > 0
        ? firePlan.openSectors
            .map(
              (sector) =>
                `${sector.label} ${formatPercent(sector.visibleRatio)}`
            )
            .join(", ")
        : "개방 섹터 없음";
    return `개방 섹터 ${openLabel}`;
  }

  if (marker.type === "concealment") {
    if (markerCallout) {
      return markerCallout;
    }
    if (viewerState.vlmResult?.maneuverImplications?.[0]) {
      return viewerState.vlmResult.maneuverImplications[0];
    }
    return `${analysis.terrainClass} 지형의 차폐 우세 지점입니다.`;
  }

  if (markerCallout) {
    return markerCallout;
  }
  if (viewerState.vlmResult?.opportunities?.[0]) {
    return viewerState.vlmResult.opportunities[0];
  }

  return `${analysis.terrainClass} 지형의 기동 및 도하 전개 후보입니다.`;
}

function getEntryHighlights(analysis, marker) {
  if (marker.type === "artillery") {
    const firePlan = (analysis.firePlans ?? []).find(
      (plan) => plan.markerId === marker.id
    );
    return [
      marker.reason,
      ...getVlmHighlights("artilleryImplications", 2),
      firePlan?.blockedSectors?.length
        ? `차단 섹터 ${firePlan.blockedSectors
            .map(
              (sector) =>
                `${sector.label} ${formatPercent(sector.visibleRatio)}`
            )
            .join(", ")}`
        : analysis.engineBrief?.artillery?.[0],
    ]
      .filter(Boolean)
      .slice(0, 3);
  }

  if (marker.type === "concealment") {
    const matchingCell = (analysis.topConcealmentCells ?? []).find(
      (cell) =>
        cell.rowIndex === marker.rowIndex &&
        cell.columnIndex === marker.columnIndex
    );
    return [
      marker.reason,
      ...getVlmHighlights("maneuverImplications", 2),
      matchingCell
        ? `상위 차폐 셀 R${matchingCell.rowIndex + 1} C${matchingCell.columnIndex + 1} · ${formatScore(
            matchingCell.concealmentScore
          )}`
        : analysis.engineBrief?.maneuver?.[0],
    ]
      .filter(Boolean)
      .slice(0, 3);
  }

  return [
    marker.reason,
    ...getVlmHighlights("risks", 1),
    ...getVlmHighlights("opportunities", 1),
    analysis.engineBrief?.opportunities?.[0] ??
      analysis.engineBrief?.maneuver?.[0],
  ]
    .filter(Boolean)
    .slice(0, 3);
}

function buildAnalysisHudEntries(analysis) {
  if (!analysis) {
    return [];
  }

  const entries = ["artillery", "crossing", "concealment"]
    .map((type) => {
      const marker = getTopMarker(analysis.markers, type);
      if (!marker) {
        return null;
      }

      const layout = ANALYSIS_HUD_LAYOUT[type];
      return {
        key: marker.id,
        type,
        marker,
        kicker: layout?.kicker ?? "Terrain Intel",
        title: `${marker.id} ${marker.title}`,
        summary: getEntrySummary(analysis, marker),
        metrics: getEntryMetrics(analysis, marker),
        highlights: getEntryHighlights(analysis, marker).slice(0, 3),
      };
    })
    .filter(Boolean);

  const overviewEntry = viewerState.visualOptions.showTerrainBriefing
    ? buildOverviewHudEntry(analysis)
    : null;
  if (overviewEntry) {
    entries.unshift(overviewEntry);
  }

  if (entries.length > 0) {
    return entries;
  }

  return [
    {
      key: "summary",
      type: "crossing",
      marker: {
        lon: getCenter(analysis.bounds).lon,
        lat: getCenter(analysis.bounds).lat,
        heightMeters: analysis.meanElevation ?? 0,
        score: analysis.meanVisibilityRatio ?? 0,
        slopeDegrees: analysis.meanSlopeDegrees ?? 0,
      },
      kicker: "Terrain Intel",
      title: "분석 개요",
      summary: `${analysis.terrainClass} · 기복 ${formatMeters(
        analysis.reliefMeters
      )}`,
      metrics: [
        ["가시", formatPercent(analysis.meanVisibilityRatio ?? 0)],
        ["차폐", formatScore(analysis.meanConcealmentScore ?? 0)],
        ["경사", `${(analysis.meanSlopeDegrees ?? 0).toFixed(1)}°`],
      ],
      highlights: [
        analysis.engineBrief?.overview?.[0] ??
          "핵심 후보 마커 없이 지형 전체 요약만 표시합니다.",
        analysis.engineBrief?.risks?.[0] ??
          analysis.engineBrief?.opportunities?.[0],
      ].filter(Boolean),
    },
  ];
}

function buildOverviewHudEntry(analysis) {
  const center = getCenter(analysis.bounds);
  const anchorMarker = getTopMarker(analysis.markers, "artillery") ??
    getTopMarker(analysis.markers, "crossing") ?? {
      lon: center.lon,
      lat: center.lat,
      heightMeters: analysis.meanElevation ?? 0,
      score: analysis.meanVisibilityRatio ?? 0,
      slopeDegrees: analysis.meanSlopeDegrees ?? 0,
    };
  const layout = ANALYSIS_HUD_LAYOUT.summary;
  const overviewHighlights = [
    viewerState.vlmResult?.executiveSummary,
    ...getVlmHighlights("risks", 1),
    analysis.engineBrief?.overview?.[0],
  ]
    .filter(Boolean)
    .slice(0, 2);

  return {
    key: "overview",
    type: "summary",
    marker: anchorMarker,
    kicker: layout.kicker,
    title: "AI 지형 브리핑",
    summary:
      viewerState.vlmResult?.executiveSummary ??
      `${analysis.terrainClass} · 기복 ${formatMeters(analysis.reliefMeters)}`,
    metrics: [
      ["가시", formatPercent(analysis.meanVisibilityRatio ?? 0)],
      ["차폐", formatScore(analysis.meanConcealmentScore ?? 0)],
      ["포대", formatScore(analysis.maxArtilleryScore ?? 0)],
    ],
    highlights: overviewHighlights,
  };
}

function getMarkerCalloutForHud(markerId) {
  const markerCallouts = viewerState.vlmResult?.markerCallouts;
  if (!Array.isArray(markerCallouts)) {
    return "";
  }

  const matchedCallout = markerCallouts.find(
    (callout) => callout.id === markerId
  );
  return typeof matchedCallout?.significance === "string"
    ? matchedCallout.significance
    : typeof matchedCallout?.title === "string"
      ? matchedCallout.title
      : "";
}

function getVlmHighlights(field, limit) {
  const items = viewerState.vlmResult?.[field];
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .slice(0, limit);
}

function clearAnalysisHud() {
  viewerState.analysisHudEntries = [];
  analysisHud?.classList.remove("is-visible");
  if (analysisHudCards) {
    analysisHudCards.innerHTML = "";
  }
  if (analysisHudLines) {
    analysisHudLines.innerHTML = "";
  }
}

function renderAnalysisHud(viewer) {
  if (!analysisHud || !analysisHudCards || !analysisHudLines) {
    return;
  }

  viewerState.analysisHudEntries = buildAnalysisHudEntries(
    viewerState.analysis
  );
  if (viewerState.analysisHudEntries.length === 0) {
    clearAnalysisHud();
    return;
  }

  analysisHud.classList.add("is-visible");
  analysisHudCards.innerHTML = viewerState.analysisHudEntries
    .map(
      (entry) => `
        <article
          class="terrain-analysis-callout"
          data-entry-key="${escapeHtml(entry.key)}"
          data-type="${escapeHtml(entry.type)}"
        >
          <div class="terrain-analysis-callout-head">
            <span class="terrain-analysis-callout-kicker">${escapeHtml(
              entry.kicker
            )}</span>
            <span class="terrain-analysis-callout-score">${escapeHtml(
              formatScore(entry.marker.score ?? 0)
            )}</span>
          </div>
          <h3 class="terrain-analysis-callout-title">${escapeHtml(entry.title)}</h3>
          <p class="terrain-analysis-callout-copy">${escapeHtml(
            entry.summary
          )}</p>
          <dl class="terrain-analysis-callout-grid">
            ${entry.metrics
              .map(
                ([label, value]) => `
                  <div>
                    <dt>${escapeHtml(label)}</dt>
                    <dd>${escapeHtml(value)}</dd>
                  </div>
                `
              )
              .join("")}
          </dl>
          ${
            entry.highlights.length > 0
              ? `<ul class="terrain-analysis-callout-list">
                  ${entry.highlights
                    .map((item) => `<li>${escapeHtml(item)}</li>`)
                    .join("")}
                </ul>`
              : ""
          }
        </article>
      `
    )
    .join("");

  syncAnalysisHudLayout(viewer);
}

function syncAnalysisHudLayout(viewer) {
  if (
    !analysisHud ||
    !analysisHudCards ||
    !analysisHudLines ||
    viewerState.analysisHudEntries.length === 0
  ) {
    return;
  }

  const compactHud = window.innerWidth <= 720;
  if (compactHud) {
    analysisHudCards
      .querySelectorAll(".terrain-analysis-callout")
      .forEach((card) => {
        if (card instanceof HTMLElement) {
          card.dataset.hidden = "false";
          card.style.left = "";
          card.style.top = "";
        }
      });
    analysisHudLines.innerHTML = "";
    return;
  }

  if (typeof sceneToWindowCoordinates !== "function") {
    analysisHudCards
      .querySelectorAll(".terrain-analysis-callout")
      .forEach((card) => {
        if (card instanceof HTMLElement) {
          card.dataset.hidden = "true";
        }
      });
    analysisHudLines.innerHTML = "";
    return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 24;
  const topInset = viewportWidth >= 1200 ? 72 : 64;
  const availableLeft = getHudAvailableLeft(margin);
  const availableRight = getHudAvailableRight(viewportWidth, margin);
  const pathMarkup = [];

  analysisHudLines.setAttribute(
    "viewBox",
    `0 0 ${viewportWidth} ${viewportHeight}`
  );
  analysisHudLines.setAttribute("width", `${viewportWidth}`);
  analysisHudLines.setAttribute("height", `${viewportHeight}`);

  viewerState.analysisHudEntries.forEach((entry) => {
    const card = analysisHudCards.querySelector(
      `[data-entry-key="${entry.key}"]`
    );
    if (!(card instanceof HTMLElement)) {
      return;
    }

    card.dataset.hidden = "false";
    const slot = getHudCardSlot({
      entry,
      viewportWidth,
      viewportHeight,
      cardWidth: card.offsetWidth,
      cardHeight: card.offsetHeight,
      margin,
      topInset,
      availableLeft,
      availableRight,
    });
    const desiredLeft = slot.left;
    const desiredTop = slot.top;

    card.style.left = `${desiredLeft}px`;
    card.style.top = `${desiredTop}px`;

    if (entry.type !== "summary") {
      const scenePoint = sceneToWindowCoordinates(
        viewer.scene,
        Cesium.Cartesian3.fromDegrees(
          entry.marker.lon,
          entry.marker.lat,
          (entry.marker.heightMeters ?? 0) + 18
        )
      );

      if (
        !scenePoint ||
        !Number.isFinite(scenePoint.x) ||
        !Number.isFinite(scenePoint.y)
      ) {
        card.dataset.hidden = "true";
        return;
      }

      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const anchorOnLeft = cardCenterX > scenePoint.x;
      const endX = anchorOnLeft ? rect.left : rect.right;
      const endY = clamp(scenePoint.y, rect.top + 26, rect.bottom - 26);
      const elbowX = anchorOnLeft
        ? Math.min(
            endX - 46,
            scenePoint.x + Math.abs(endX - scenePoint.x) * 0.56
          )
        : Math.max(
            endX + 46,
            scenePoint.x - Math.abs(endX - scenePoint.x) * 0.56
          );
      const elbowY = scenePoint.y + (cardCenterY - scenePoint.y) * 0.26;
      const path = [
        `M ${scenePoint.x.toFixed(1)} ${scenePoint.y.toFixed(1)}`,
        `L ${elbowX.toFixed(1)} ${elbowY.toFixed(1)}`,
        `L ${elbowX.toFixed(1)} ${endY.toFixed(1)}`,
        `L ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      ].join(" ");
      const strokeColor =
        entry.type === "artillery"
          ? "#ff9576"
          : entry.type === "concealment"
            ? "#7de9a8"
            : "#71d9ff";

      pathMarkup.push(
        `<path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
      );
      pathMarkup.push(
        `<circle cx="${scenePoint.x.toFixed(1)}" cy="${scenePoint.y.toFixed(
          1
        )}" r="4.5" fill="${strokeColor}" />`
      );
    }
  });

  analysisHudLines.innerHTML = pathMarkup.join("");
}

function getHudCardSlot({
  entry,
  viewportWidth,
  viewportHeight,
  cardWidth,
  cardHeight,
  margin,
  topInset,
  availableLeft,
  availableRight,
}) {
  const maxLeft = Math.max(availableLeft, availableRight - cardWidth);
  const rightRail = maxLeft;
  const bottomRail = viewportHeight - cardHeight - margin;
  const centerRail =
    availableLeft + (availableRight - availableLeft - cardWidth) / 2;
  const slotMap = {
    summary: {
      left: centerRail,
      top: topInset,
    },
    artillery: {
      left: availableLeft,
      top: Math.max(topInset + 256, viewportHeight * 0.58),
    },
    crossing: {
      left: rightRail,
      top: Math.max(topInset + 128, viewportHeight * 0.3),
    },
    concealment: {
      left: rightRail,
      top: Math.max(topInset + 292, viewportHeight * 0.62),
    },
  };
  const slot = slotMap[entry.type] ?? slotMap.summary;

  return {
    left: clamp(slot.left, availableLeft, maxLeft),
    top: clamp(slot.top, topInset, bottomRail),
  };
}

function getHudAvailableLeft(margin) {
  const inset = Number(viewerState.hudInsets?.left) || 0;
  return Math.max(margin, inset + margin);
}

function getHudAvailableRight(viewportWidth, margin) {
  const rightInset = Number(viewerState.hudInsets?.right) || 0;
  const defaultRight = Math.max(margin, viewportWidth - margin - rightInset);
  if (
    !terrainInfoPanel ||
    window.innerWidth <= 720 ||
    terrainInfoPanel.classList.contains("is-collapsed")
  ) {
    return defaultRight;
  }

  const panelRect = terrainInfoPanel.getBoundingClientRect();
  if (
    panelRect.width <= 0 ||
    panelRect.height <= 0 ||
    panelRect.left >= viewportWidth ||
    panelRect.right <= 0
  ) {
    return defaultRight;
  }

  return Math.max(margin, Math.min(defaultRight, panelRect.left - margin));
}

function setAnalysisHudInsets(payload) {
  const left = Math.max(0, Number(payload?.left) || 0);
  const right = Math.max(0, Number(payload?.right) || 0);
  viewerState.hudInsets = { left, right };

  if (viewerState.viewer) {
    syncAnalysisHudLayout(viewerState.viewer);
    viewerState.viewer.scene.requestRender();
  }
}

function setTerrainViewerVisualOptions(options) {
  if (!options || typeof options !== "object") {
    return;
  }

  viewerState.visualOptions = {
    ...viewerState.visualOptions,
    showTerrainBriefing:
      typeof options.showTerrainBriefing === "boolean"
        ? options.showTerrainBriefing
        : viewerState.visualOptions.showTerrainBriefing,
  };

  if (viewerState.viewer && viewerState.analysis) {
    renderAnalysisHud(viewerState.viewer);
    viewerState.viewer.scene.requestRender();
  }
}

function handleTerrainViewerCommand(event) {
  if (event.origin !== window.location.origin) {
    return;
  }

  const payload =
    event.data?.payload && typeof event.data.payload === "object"
      ? event.data.payload
      : null;
  if (event.data?.type !== "terrain3d:command" || !payload) {
    return;
  }

  if (payload.command === "set-hud-insets") {
    setAnalysisHudInsets(payload);
  }
  if (payload.command === "set-visual-options") {
    setTerrainViewerVisualOptions(payload.options);
  }
}

function clearLayerDataSources(viewer) {
  viewerState.layerDataSources.forEach((dataSource) => {
    viewer.dataSources.remove(dataSource, true);
  });
  viewerState.layerDataSources = [];
}

function clearMarkerEntities(viewer) {
  viewerState.markerEntities.forEach((entity) => {
    viewer.entities.remove(entity);
  });
  viewerState.markerEntities = [];
}

function clearAnalysisOverlayEntities(viewer) {
  viewerState.analysisOverlayEntities.forEach((entity) => {
    viewer.entities.remove(entity);
  });
  viewerState.analysisOverlayEntities = [];
}

function setButtonBusy(button, busy, label) {
  if (!button) {
    return;
  }

  button.disabled = busy;
  if (label) {
    button.textContent = label;
  }
}

async function refreshTerrainIntelLayers(viewer) {
  if (!viewerState.bounds) {
    return;
  }

  viewerState.busy.layers = true;
  renderIntelLayerControls();

  if (!vworldApiKey) {
    clearLayerDataSources(viewer);
    viewerState.layerResults = [];
    setLayerStatusMessage(
      "VWorld API 키가 없어 벡터 레이어를 불러오지 못했습니다."
    );
    viewerState.busy.layers = false;
    renderIntelLayerControls();
    return;
  }

  try {
    const selectedLayerKeys = TERRAIN_INTEL_LAYER_DEFS.filter(
      (layerDef) => viewerState.layerSelection[layerDef.key]
    ).map((layerDef) => layerDef.key);

    if (selectedLayerKeys.length === 0) {
      clearLayerDataSources(viewer);
      viewerState.layerResults = [];
      viewerState.analysis = null;
      clearMarkerEntities(viewer);
      clearAnalysisOverlayEntities(viewer);
      clearAnalysisHud();
      setAnalysisStatusMessage("");
      setLayerStatusMessage("선택된 보조 레이어가 없습니다.");
      viewer.scene.requestRender();
      return;
    }

    clearLayerDataSources(viewer);
    viewerState.layerResults = await loadTerrainIntelLayers({
      bounds: viewerState.bounds,
      selectedLayerKeys,
      runtimeConfig: intelRuntimeConfig,
    });

    for (const result of viewerState.layerResults) {
      if (result.status !== "ready" || result.featureCount === 0) {
        continue;
      }
      const dataSource = await Cesium.GeoJsonDataSource.load(
        result.featureCollection,
        {
          clampToGround: true,
        }
      );
      applyLayerStyle(dataSource, result.layerDef);
      await viewer.dataSources.add(dataSource);
      viewerState.layerDataSources.push(dataSource);
    }

    viewerState.analysis = null;
    clearMarkerEntities(viewer);
    clearAnalysisOverlayEntities(viewer);
    clearAnalysisHud();
    setAnalysisStatusMessage("");

    const loadedFeatureCount = viewerState.layerResults.reduce(
      (total, result) => total + result.featureCount,
      0
    );
    setLayerStatusMessage(
      `${selectedLayerKeys.length}개 레이어, 총 ${loadedFeatureCount.toLocaleString(
        "ko-KR"
      )}건을 선택 범위로 반영했습니다.`
    );
    viewer.scene.requestRender();
  } catch (error) {
    console.error("Failed to refresh VWorld terrain-intel layers.", error);
    setLayerStatusMessage(
      error instanceof Error
        ? error.message
        : "브이월드 레이어를 반영하지 못했습니다."
    );
  } finally {
    viewerState.busy.layers = false;
    renderIntelLayerControls();
  }
}

function applyLayerStyle(dataSource, layerDef) {
  const strokeColor = Cesium.Color.fromCssColorString(layerDef.style.stroke);
  const fillColor = Cesium.Color.fromCssColorString(layerDef.style.fill);

  dataSource.entities.values.forEach((entity) => {
    if (entity.polygon) {
      entity.polygon.material = fillColor;
      entity.polygon.outline = false;
      entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
    }
    if (entity.polyline) {
      entity.polyline.material = strokeColor;
      entity.polyline.width = layerDef.style.width;
      entity.polyline.clampToGround = true;
    }
    if (entity.point) {
      entity.point.color = strokeColor;
      entity.point.pixelSize = 6;
      entity.point.outlineColor = Cesium.Color.fromCssColorString("#04161d");
      entity.point.outlineWidth = 2;
    }
  });
}

async function sampleTerrainGrid(viewer, bounds, columns = 10, rows = 10) {
  const center = getCenter(bounds);
  const lonStep = (bounds.east - bounds.west) / columns;
  const latStep = (bounds.north - bounds.south) / rows;
  const samples = [];
  const terrainProvider = viewer.terrainProvider;
  const supportsTerrain =
    terrainProvider &&
    !(terrainProvider instanceof Cesium.EllipsoidTerrainProvider);

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const lon = bounds.west + lonStep * (columnIndex + 0.5);
      const lat = bounds.south + latStep * (rowIndex + 0.5);
      samples.push({
        rowIndex,
        columnIndex,
        lon,
        lat,
        cartographic: Cesium.Cartographic.fromDegrees(lon, lat),
      });
    }
  }

  if (supportsTerrain) {
    await Cesium.sampleTerrainMostDetailed(
      terrainProvider,
      samples.map((sample) => sample.cartographic)
    );
  }

  const metersPerLongitude = 111320 * Math.cos((center.lat * Math.PI) / 180);
  const enrichedSamples = samples.map((sample) => {
    const sampledHeight = Number.isFinite(sample.cartographic.height)
      ? sample.cartographic.height
      : 0;
    const localX = (sample.lon - center.lon) * metersPerLongitude;
    const localY = (sample.lat - center.lat) * 111320;

    return {
      ...sample,
      heightMeters: sampledHeight,
      localX,
      localY,
      distanceFromCenterMeters: Math.hypot(localX, localY),
      slopeDegrees: 0,
    };
  });

  return calculateSampleSlopes(enrichedSamples);
}

function calculateSampleSlopes(samples) {
  const sampleLookup = new Map(
    samples.map((sample) => [
      `${sample.rowIndex}:${sample.columnIndex}`,
      sample,
    ])
  );

  return samples.map((sample) => {
    const left =
      sampleLookup.get(`${sample.rowIndex}:${sample.columnIndex - 1}`) ??
      sample;
    const right =
      sampleLookup.get(`${sample.rowIndex}:${sample.columnIndex + 1}`) ??
      sample;
    const down =
      sampleLookup.get(`${sample.rowIndex - 1}:${sample.columnIndex}`) ??
      sample;
    const up =
      sampleLookup.get(`${sample.rowIndex + 1}:${sample.columnIndex}`) ??
      sample;
    const deltaX = right.localX - left.localX || 1;
    const deltaY = up.localY - down.localY || 1;
    const dzdx = (right.heightMeters - left.heightMeters) / deltaX;
    const dzdy = (up.heightMeters - down.heightMeters) / deltaY;
    const slopeDegrees =
      Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy)) * (180 / Math.PI);

    return {
      ...sample,
      slopeDegrees: Number.isFinite(slopeDegrees) ? slopeDegrees : 0,
    };
  });
}

function addTerrainMarkers(viewer, markers) {
  clearMarkerEntities(viewer);

  markers.forEach((marker) => {
    const markerColor =
      marker.type === "artillery"
        ? Cesium.Color.fromCssColorString("#ffd26d")
        : marker.type === "crossing"
          ? Cesium.Color.fromCssColorString("#71d9ff")
          : Cesium.Color.fromCssColorString("#58d17e");
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        marker.lon,
        marker.lat,
        marker.heightMeters + 12
      ),
      point: {
        pixelSize: 9,
        color: markerColor,
        outlineColor: Cesium.Color.fromCssColorString("#051117"),
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: marker.id,
        font: "700 11px 'Segoe UI', 'Noto Sans KR', sans-serif",
        fillColor: Cesium.Color.fromCssColorString("#ecfffb"),
        showBackground: true,
        backgroundColor:
          Cesium.Color.fromCssColorString("#04161d").withAlpha(0.8),
        pixelOffset: new Cesium.Cartesian2(0, -18),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      description: `${marker.reason}\n점수 ${formatScore(marker.score ?? 0)}`,
    });
    viewerState.markerEntities.push(entity);
  });
}

function addAnalysisOverlays(viewer, analysis) {
  clearAnalysisOverlayEntities(viewer);

  addHeatmapOverlay(viewer, analysis.concealmentCells);
  addLosOverlay(viewer, analysis.losSegments);
}

function addHeatmapOverlay(viewer, cells) {
  if (!Array.isArray(cells)) {
    return;
  }

  cells.forEach((cell) => {
    const dominantScore =
      cell.dominantType === "concealment"
        ? cell.concealmentScore
        : cell.exposureScore;
    if (dominantScore < 0.4) {
      return;
    }

    const alpha = 0.08 + dominantScore * 0.2;
    const fillColor =
      cell.dominantType === "concealment"
        ? Cesium.Color.fromCssColorString("#58d17e").withAlpha(alpha)
        : Cesium.Color.fromCssColorString("#ff8b7c").withAlpha(alpha * 0.92);
    const entity = viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          cell.west,
          cell.south,
          cell.east,
          cell.south,
          cell.east,
          cell.north,
          cell.west,
          cell.north,
        ]),
        material: fillColor,
        outline: false,
        classificationType: Cesium.ClassificationType.TERRAIN,
      },
    });
    viewerState.analysisOverlayEntities.push(entity);
  });
}

function addLosOverlay(viewer, losSegments) {
  if (!Array.isArray(losSegments)) {
    return;
  }

  losSegments.forEach((segment) => {
    if (
      !Number.isFinite(segment.startLon) ||
      !Number.isFinite(segment.startLat) ||
      !Number.isFinite(segment.endLon) ||
      !Number.isFinite(segment.endLat)
    ) {
      return;
    }

    const isOpenSegment = segment.type === "open";
    const entity = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          segment.startLon,
          segment.startLat,
          (segment.startHeightMeters ?? 0) + 28,
          segment.endLon,
          segment.endLat,
          (segment.endHeightMeters ?? 0) + 20,
        ]),
        width: isOpenSegment ? 2.2 : 1.8,
        clampToGround: false,
        material: isOpenSegment
          ? Cesium.Color.fromCssColorString("#8cff9f").withAlpha(0.9)
          : new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("#ff8b7c").withAlpha(0.88),
              dashLength: 14,
            }),
      },
    });
    viewerState.analysisOverlayEntities.push(entity);
  });
}

async function runEngineAnalysis(viewer) {
  if (!viewerState.bounds) {
    return null;
  }

  viewerState.busy.engine = true;
  setButtonBusy(runEngineAnalysisButton, true, "분석 중");
  setAnalysisStatusMessage(
    "고도 샘플, LOS 레이, 차폐 히트맵을 종합해 전술 콜아웃을 전개합니다."
  );

  try {
    if (viewerState.layerResults.length === 0 && vworldApiKey) {
      await refreshTerrainIntelLayers(viewer);
    }

    const terrainSamples = await sampleTerrainGrid(
      viewer,
      viewerState.bounds,
      gridColumns,
      gridRows
    );
    viewerState.analysis = buildTerrainIntelAnalysis({
      bounds: viewerState.bounds,
      widthMeters: viewerState.widthMeters,
      heightMeters: viewerState.heightMeters,
      terrainSamples,
      layerResults: viewerState.layerResults,
    });
    viewerState.vlmResult = null;
    addTerrainMarkers(viewer, viewerState.analysis.markers);
    addAnalysisOverlays(viewer, viewerState.analysis);
    renderAnalysisHud(viewer);
    renderAnalysisSummary();
    renderVlmReport();
    setAnalysisStatusMessage(
      `${viewerState.analysis.sampledPointCount}개 샘플 기반으로 ${viewerState.analysisHudEntries.length}개 전술 콜아웃을 전개했습니다.`
    );
    viewer.scene.requestRender();
    return viewerState.analysis;
  } catch (error) {
    console.error("Failed to run engine terrain analysis.", error);
    setAnalysisStatusMessage(
      error instanceof Error
        ? error.message
        : "엔진 지형 분석을 수행하지 못했습니다."
    );
    return null;
  } finally {
    viewerState.busy.engine = false;
    setButtonBusy(runEngineAnalysisButton, false, "지형 분석");
  }
}

async function captureViewerImageBase64(viewer) {
  viewer.render();
  viewer.scene.requestRender();
  await wait(80);
  const dataUrl = viewer.canvas.toDataURL("image/png");
  return dataUrl.replace(/^data:image\/png;base64,/, "");
}

async function resolveOllamaVisionModel() {
  try {
    const response = await fetch(
      `${intelRuntimeConfig.ollamaBaseUrl}/api/tags`
    );
    if (!response.ok) {
      return intelRuntimeConfig.ollamaVisionModel;
    }

    const payload = await readJsonResponse(response);
    return selectOllamaVisionModel(
      intelRuntimeConfig.ollamaVisionModel,
      extractOllamaModelNames(payload)
    );
  } catch (error) {
    console.warn("Failed to inspect local Ollama models.", error);
    return intelRuntimeConfig.ollamaVisionModel;
  }
}

async function readJsonResponse(response) {
  const responseText = await response.text();
  if (!responseText.trim()) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch (_error) {
    return {
      error: responseText,
    };
  }
}

async function runVlmAnalysis(viewer) {
  viewerState.busy.vlm = true;
  setButtonBusy(runVlmAnalysisButton, true, "브리핑 중");
  setVlmRuntimeBadge("캡처 준비");

  try {
    const analysis = viewerState.analysis ?? (await runEngineAnalysis(viewer));
    if (!analysis) {
      throw new Error("VLM 브리핑 전에 엔진 분석을 만들지 못했습니다.");
    }

    setVlmRuntimeBadge("확인");
    const ollamaVisionModel = await resolveOllamaVisionModel();
    if (!ollamaVisionModel) {
      throw new Error("Ollama 모델을 찾지 못했습니다.");
    }
    const screenshotBase64 = await captureViewerImageBase64(viewer);
    viewerState.captureTimestamp = new Date();
    setCaptureStatusMessage("캡처 완료");
    setVlmRuntimeBadge("분석 중");

    const response = await fetch(
      `${intelRuntimeConfig.ollamaBaseUrl}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: ollamaVisionModel,
          stream: false,
          format: OLLAMA_TERRAIN_REPORT_SCHEMA,
          messages: [
            {
              role: "user",
              content: buildTerrainVlmPrompt(analysis),
              images: [screenshotBase64],
            },
          ],
        }),
      }
    );
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error("Ollama 요청 실패");
    }

    const content = payload?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("분석 응답 본문이 비어 있습니다.");
    }

    viewerState.vlmResult = parseTerrainVlmReport(content);
    renderVlmReport();
    renderAnalysisHud(viewer);
    setVlmRuntimeBadge("브리핑 완료");
    setAnalysisStatusMessage("VLM 브리핑을 HUD 전술 콜아웃에 반영했습니다.");
    viewer.scene.requestRender();
  } catch (error) {
    console.error("Failed to run terrain briefing.", error);
    setVlmRuntimeBadge("브리핑 실패");
    setCaptureStatusMessage(
      error instanceof Error
        ? error.message
        : "분석 브리핑을 수행하지 못했습니다."
    );
  } finally {
    viewerState.busy.vlm = false;
    setButtonBusy(runVlmAnalysisButton, false, "VLM 브리핑");
  }
}

function wait(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function wireIntelControls(viewer) {
  reloadIntelLayersButton?.addEventListener("click", () => {
    refreshTerrainIntelLayers(viewer);
  });
  runEngineAnalysisButton?.addEventListener("click", () => {
    runEngineAnalysis(viewer);
  });
  runVlmAnalysisButton?.addEventListener("click", () => {
    runVlmAnalysis(viewer);
  });
  renderIntelLayerControls();
  clearAnalysisHud();
  renderAnalysisSummary();
  renderVlmReport();
  setVlmRuntimeBadge("");
}

async function initialize() {
  if (!Cesium) {
    throw new Error("Cesium runtime not found.");
  }

  window.CESIUM_BASE_URL = "/flight-sim/cesium/";
  if (typeof Cesium.buildModuleUrl?.setBaseUrl === "function") {
    Cesium.buildModuleUrl.setBaseUrl("/flight-sim/cesium/");
  }

  const bounds = parseBoundsFromLocation();
  if (!bounds) {
    throw new Error("Invalid terrain bounds.");
  }

  viewerState.bounds = bounds;

  setLoadingState(
    "선택 지형 준비 중",
    "선택 범위 안쪽 지형만 렌더링하도록 초기화합니다."
  );
  const { widthMeters, heightMeters } = updateMetrics(bounds);
  viewerState.widthMeters = widthMeters;
  viewerState.heightMeters = heightMeters;
  const placementRuntime = createTerrainPlacementRuntime({
    Cesium,
    bounds,
    widthMeters,
    heightMeters,
    liveRuntimeEnabled: searchParams.get("continueSimulation") === "1",
    setStatusMessage,
    setPlacementBadge,
  });

  window.addEventListener("message", placementRuntime.handleMessage);
  window.addEventListener("message", handleTerrainViewerCommand);
  setPlacementBadge("배치 대기");

  const terrainProviderInfo = await createTerrainProvider();
  const viewer = new Cesium.Viewer("cesiumContainer", {
    baseLayer: createBaseLayer(expandBounds(bounds, 0.14, 0.0012)),
    terrainProvider: terrainProviderInfo.provider,
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
    scene3DOnly: true,
    shadows: false,
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true,
      },
    },
  });
  viewerState.viewer = viewer;

  const limitRectangle = buildRectangle(expandBounds(bounds, 0.08, 0.0006));
  configureViewer(viewer, limitRectangle, widthMeters, heightMeters);
  await placementRuntime.attach(viewer);
  addSelectionOverlay(viewer, bounds);
  flyToObliqueView(viewer, bounds, widthMeters, heightMeters, 0);
  wireViewButtons(viewer, bounds, widthMeters, heightMeters);
  wirePanelControls();
  wireIntelControls(viewer);
  viewer.scene.postRender.addEventListener(() => {
    syncAnalysisHudLayout(viewer);
  });
  window.addEventListener("resize", () => {
    syncAnalysisHudLayout(viewer);
    viewer.scene.requestRender();
  });
  viewer.scene.requestRender();

  window.__terrain3dViewer__ = viewer;
  window.__terrain3dIntelState__ = viewerState;
  window.__terrain3dPlacementRuntime__ = placementRuntime;
  setProviderBadge(terrainProviderInfo.providerLabel);

  if (terrainProviderInfo.hasTerrain) {
    setStatusMessage("선택 bbox 내부만 지형과 영상 타일을 로드합니다.");
  } else {
    setStatusMessage("지형 고도 데이터를 불러오지 못해 영상만 표시합니다.");
  }

  if (vworldApiKey) {
    setLayerStatusMessage(
      "브이월드 벡터 레이어를 범위 기준으로 불러오는 중입니다."
    );
    await refreshTerrainIntelLayers(viewer);
  } else {
    setLayerStatusMessage(
      "VWorld API 키가 없어 벡터 레이어는 비활성 상태입니다."
    );
  }
  setAnalysisStatusMessage("");

  hideLoadingOverlay();
}

initialize().catch((error) => {
  console.error("Failed to initialize terrain 3D viewer.", error);
  setProviderBadge("초기화 실패");
  setPlacementBadge("사용 불가");
  setStatusMessage("선택 영역 전용 3D 뷰어를 시작하지 못했습니다.");
  setLoadingState(
    "3D 지형을 열지 못했습니다.",
    "영역 정보 또는 외부 지형 타일 설정을 확인해 주세요."
  );
  setAnalysisStatusMessage(
    error instanceof Error
      ? error.message
      : "지형 뷰어 초기화 중 오류가 발생했습니다."
  );
});
