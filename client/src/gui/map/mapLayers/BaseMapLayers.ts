import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import type { FeatureLike } from "ol/Feature.js";
import { Projection, get as getProjection } from "ol/proj";
import OSM from "ol/source/OSM.js";
import TileJSON from "ol/source/TileJSON.js";
import VectorSource from "ol/source/Vector.js";
import XYZ from "ol/source/XYZ.js";
import { Fill, Stroke, Style, Text, Circle as CircleStyle } from "ol/style.js";
import { DEFAULT_OL_PROJECTION_CODE } from "@/utils/constants";

const defaultProjection = getProjection(DEFAULT_OL_PROJECTION_CODE);
const DEFAULT_HYBRID_OVERLAY_OPACITY = 0.42;
const DEFAULT_LABEL_OVERLAY_OPACITY = 1;
const WEB_MERCATOR_MAX_RESOLUTION = 156543.03392804097;
const MAJOR_OFFLINE_LABELS = new Set([
  "Seoul",
  "Incheon",
  "Daejeon",
  "Daegu",
  "Busan",
  "Gwangju",
  "Jeju",
  "Pyongyang",
  "Nampo",
  "Wonsan",
  "Hamhung",
  "Sinuiju",
  "Gangneung",
  "Suwon",
  "Ulsan",
  "Pohang-si",
]);

type BaseTileSource = OSM | TileJSON | XYZ;
type BaseVectorSource = VectorSource;
type BaseMapLayer = TileLayer<BaseTileSource> | VectorLayer<BaseVectorSource>;
export type BaseMapModeId =
  | "vector"
  | "hybrid"
  | "satellite"
  | "basic"
  | "evening"
  | "osm";

export interface BaseMapModeOption {
  id: BaseMapModeId;
  label: string;
}

export default class BaseMapLayers {
  layers: BaseMapLayer[];
  modeLayerIndexes: number[][];
  modes: (BaseMapModeOption & { layerIndexes: number[] })[];
  projection: Projection;
  currentLayerIndex: number;

  constructor(
    projection?: Projection,
    mapTilerBasicUrl?: string,
    mapTilerSatelliteUrl?: string,
    hybridLabelUrl?: string,
    eveningMapUrl?: string,
    zIndex?: number,
    includeOsmFallback = true,
    offlineVectorMapUrl?: string
  ) {
    this.layers = [];
    this.modeLayerIndexes = [];
    this.modes = [];
    this.projection = projection ?? defaultProjection!;
    let vectorLayerIndex: number | null = null;
    let vectorOverlayLayerIndex: number | null = null;
    let basicLayerIndex: number | null = null;
    let satelliteLayerIndex: number | null = null;
    let hybridLayerIndex: number | null = null;
    let eveningLayerIndex: number | null = null;

    const basicLayerSource = mapTilerBasicUrl
      ? this.createMapTilerRasterSource(mapTilerBasicUrl)
      : null;

    if (basicLayerSource) {
      basicLayerIndex =
        this.layers.push(this.createTileLayer(basicLayerSource, zIndex)) - 1;
    }

    if (mapTilerSatelliteUrl) {
      satelliteLayerIndex =
        this.layers.push(
          this.createMapTilerSatelliteLayer(mapTilerSatelliteUrl, zIndex)
        ) - 1;
    }

    if (offlineVectorMapUrl) {
      vectorLayerIndex =
        this.layers.push(
          this.createOfflineVectorLayer(offlineVectorMapUrl, zIndex)
        ) - 1;
      vectorOverlayLayerIndex =
        this.layers.push(
          this.createOfflineVectorLayer(offlineVectorMapUrl, zIndex, true)
        ) - 1;
    }

    if (satelliteLayerIndex !== null) {
      if (vectorOverlayLayerIndex !== null) {
        hybridLayerIndex = vectorOverlayLayerIndex;
      } else {
        const hybridOverlaySource = hybridLabelUrl
          ? this.createHybridLabelSource(hybridLabelUrl)
          : basicLayerSource;

        if (hybridOverlaySource) {
          hybridLayerIndex =
            this.layers.push(
              this.createTileLayer(
                hybridOverlaySource,
                zIndex,
                hybridLabelUrl
                  ? DEFAULT_LABEL_OVERLAY_OPACITY
                  : DEFAULT_HYBRID_OVERLAY_OPACITY
              )
            ) - 1;
        }
      }
    }

    if (eveningMapUrl) {
      eveningLayerIndex =
        this.layers.push(
          this.createTileLayer(
            this.createMapTilerRasterSource(eveningMapUrl),
            zIndex
          )
        ) - 1;
    }

    const osmLayerIndex = includeOsmFallback
      ? this.layers.push(this.createBaseOsmLayer(zIndex)) - 1
      : null;

    if (satelliteLayerIndex !== null && hybridLayerIndex !== null) {
      this.registerMode("hybrid", "하이브리드", [
        satelliteLayerIndex,
        hybridLayerIndex,
      ]);
    }
    if (vectorLayerIndex !== null) {
      this.registerMode("vector", "벡터", [vectorLayerIndex]);
    }
    if (satelliteLayerIndex !== null) {
      this.registerMode("satellite", "위성", [satelliteLayerIndex]);
    }
    if (basicLayerIndex !== null) {
      this.registerMode("basic", "표준", [basicLayerIndex]);
    }
    if (eveningLayerIndex !== null) {
      this.registerMode("evening", "저녁", [eveningLayerIndex]);
    }
    if (osmLayerIndex !== null) {
      this.registerMode("osm", "OSM", [osmLayerIndex]);
    }

    this.currentLayerIndex = 0;
    this.applyCurrentMode();
  }

  createBaseOsmLayer = (zIndex?: number) => {
    return this.createTileLayer(new OSM(), zIndex);
  };

  createMapTilerRasterSource = (url: string) => {
    return new OSM({
      url: url,
      crossOrigin: "anonymous",
    });
  };

  createHybridLabelSource = (url: string) => {
    return new XYZ({
      url,
      crossOrigin: "anonymous",
      minZoom: url.includes("api.vworld.kr") ? 6 : undefined,
      maxZoom: url.includes("api.vworld.kr") ? 19 : undefined,
    });
  };

  createTileLayer = (source: BaseTileSource, zIndex?: number, opacity = 1) => {
    const layer = new TileLayer({
      source,
      opacity,
    });
    layer.setZIndex(zIndex ?? -1);
    return layer;
  };

  createOfflineVectorLayer = (
    url: string,
    zIndex?: number,
    overlayOnly = false
  ) => {
    const layer = new VectorLayer({
      source: new VectorSource({
        url,
        format: new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: this.projection,
        }),
      }),
      renderBuffer: 96,
      declutter: true,
      style: this.createOfflineVectorStyle(overlayOnly),
    });
    layer.setZIndex(zIndex ?? -1);
    return layer;
  };

  createOfflineVectorStyle = (overlayOnly = false) => {
    return (feature: FeatureLike, resolution: number) => {
      const zoom = Math.log2(WEB_MERCATOR_MAX_RESOLUTION / resolution);
      const kind = String(feature.get("kind") ?? "");
      const name = String(feature.get("name") ?? "");
      const highway = String(feature.get("highway") ?? "");
      const waterway = String(feature.get("waterway") ?? "");
      const geometryType = feature.getGeometry()?.getType();

      if (geometryType === "Point") {
        if (kind === "city" && !this.shouldShowOfflinePlaceLabel(name, zoom)) {
          return undefined;
        }

        return new Style({
          image:
            zoom >= 7 || kind === "target"
              ? new CircleStyle({
                  radius: kind === "target" ? 5 : 2.8,
                  fill: new Fill({
                    color: kind === "target" ? "#ff7a5f" : "#b9d7d3",
                  }),
                  stroke: new Stroke({
                    color: "rgba(5, 14, 16, 0.82)",
                    width: 1.1,
                  }),
                })
              : undefined,
          text: new Text({
            text: name,
            offsetX: kind === "target" ? 10 : 0,
            offsetY: kind === "target" ? -8 : -10,
            textAlign: kind === "target" ? "left" : "center",
            font: `${zoom < 7 ? 600 : 700} ${zoom < 8 ? 12 : 11}px Arial, sans-serif`,
            fill: new Fill({ color: overlayOnly ? "#172327" : "#ecfffb" }),
            stroke: new Stroke({
              color: overlayOnly ? "rgba(236, 244, 239, 0.82)" : "#061015",
              width: overlayOnly ? 3.6 : 3,
            }),
          }),
        });
      }

      if (kind === "road") {
        if (!this.shouldShowOfflineRoad(highway, zoom)) {
          return undefined;
        }

        return new Style({
          stroke: new Stroke({
            color: overlayOnly
              ? "rgba(238, 232, 204, 0.46)"
              : "rgba(217, 206, 141, 0.72)",
            width: highway === "motorway" ? 1.45 : 1.05,
          }),
        });
      }

      if (kind === "water") {
        if (zoom < 6.4 && waterway !== "river") {
          return undefined;
        }

        return new Style({
          stroke: new Stroke({
            color: overlayOnly
              ? "rgba(72, 129, 151, 0.42)"
              : "rgba(96, 186, 212, 0.58)",
            width: waterway === "river" ? 1.35 : 0.9,
          }),
          fill: new Fill({
            color: overlayOnly
              ? "rgba(66, 123, 150, 0.18)"
              : "rgba(17, 77, 96, 0.42)",
          }),
        });
      }

      if (overlayOnly && (kind === "land" || kind === "neighbor")) {
        return undefined;
      }

      if (kind === "dmz") {
        return new Style({
          stroke: new Stroke({
            color: overlayOnly
              ? "rgba(56, 96, 110, 0.54)"
              : "rgba(104, 244, 255, 0.78)",
            width: 1.2,
            lineDash: [8, 6],
          }),
        });
      }

      if (kind === "aoi") {
        return zoom >= 8
          ? new Style({
              stroke: new Stroke({
                color: "rgba(127, 231, 255, 0.72)",
                width: 1.7,
                lineDash: [9, 7],
              }),
              fill: new Fill({
                color: overlayOnly
                  ? "rgba(127, 231, 255, 0.02)"
                  : "rgba(127, 231, 255, 0.05)",
              }),
            })
          : undefined;
      }

      return new Style({
        stroke: new Stroke({
          color:
            kind === "neighbor"
              ? "rgba(133, 164, 125, 0.32)"
              : "rgba(168, 205, 132, 0.58)",
          width: kind === "neighbor" ? 1 : 1.4,
        }),
        fill: new Fill({
          color:
            kind === "neighbor"
              ? "rgba(34, 55, 44, 0.42)"
              : "rgba(41, 74, 49, 0.72)",
        }),
      });
    };
  };

  shouldShowOfflinePlaceLabel = (name: string, zoom: number) => {
    if (!name) {
      return false;
    }
    if (zoom < 6.2) {
      return MAJOR_OFFLINE_LABELS.has(name);
    }
    if (zoom < 7.5) {
      return MAJOR_OFFLINE_LABELS.has(name) || !/-/.test(name);
    }
    return zoom >= 9 || MAJOR_OFFLINE_LABELS.has(name);
  };

  shouldShowOfflineRoad = (highway: string, zoom: number) => {
    if (zoom < 6.5) {
      return highway === "motorway";
    }
    if (zoom < 7.8) {
      return highway === "motorway" || highway === "trunk";
    }
    return (
      highway === "motorway" || highway === "trunk" || highway === "primary"
    );
  };

  createMapTilerSatelliteLayer = (url: string, zIndex?: number) => {
    if (url.includes("{z}") && url.includes("{x}") && url.includes("{y}")) {
      return this.createTileLayer(
        new XYZ({
          url,
          crossOrigin: "anonymous",
        }),
        zIndex
      );
    }

    const tileJsonOptions = {
      url: url,
      crossOrigin: "anonymous",
      tileSize: url.includes("/offline-map/") ? undefined : 512,
    };
    const mapTilerSatelliteSource = new TileJSON(tileJsonOptions);
    return this.createTileLayer(mapTilerSatelliteSource, zIndex);
  };

  registerMode = (id: BaseMapModeId, label: string, layerIndexes: number[]) => {
    this.modeLayerIndexes.push(layerIndexes);
    this.modes.push({ id, label, layerIndexes });
  };

  applyCurrentMode = () => {
    const visibleLayerIndexes = new Set(
      this.modeLayerIndexes[this.currentLayerIndex] ?? []
    );

    this.layers.forEach((layer, index) => {
      layer.setVisible(visibleLayerIndexes.has(index));
    });
  };

  toggleLayer = () => {
    this.currentLayerIndex =
      (this.currentLayerIndex + 1) % this.modeLayerIndexes.length;
    this.applyCurrentMode();
  };

  setMode = (modeId: BaseMapModeId) => {
    const modeIndex = this.modes.findIndex((mode) => mode.id === modeId);

    if (modeIndex === -1) {
      return;
    }

    this.currentLayerIndex = modeIndex;
    this.applyCurrentMode();
  };

  getCurrentModeId = (): BaseMapModeId => {
    return this.modes[this.currentLayerIndex]?.id ?? "osm";
  };

  getCurrentModeLabel = () => {
    return this.modes[this.currentLayerIndex]?.label ?? "OSM";
  };

  getAvailableModes = (): BaseMapModeOption[] => {
    return this.modes.map(({ id, label }) => ({ id, label }));
  };
}
