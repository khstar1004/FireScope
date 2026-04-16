import TileLayer from "ol/layer/Tile.js";
import { Projection, get as getProjection } from "ol/proj";
import OSM from "ol/source/OSM.js";
import TileJSON from "ol/source/TileJSON.js";
import XYZ from "ol/source/XYZ.js";
import { DEFAULT_OL_PROJECTION_CODE } from "@/utils/constants";

const defaultProjection = getProjection(DEFAULT_OL_PROJECTION_CODE);
const DEFAULT_HYBRID_OVERLAY_OPACITY = 0.42;
const DEFAULT_LABEL_OVERLAY_OPACITY = 1;

type BaseTileSource = OSM | TileJSON | XYZ;

export default class BaseMapLayers {
  layers: TileLayer<BaseTileSource>[];
  modeLayerIndexes: number[][];
  projection: Projection;
  currentLayerIndex: number;

  constructor(
    projection?: Projection,
    mapTilerBasicUrl?: string,
    mapTilerSatelliteUrl?: string,
    hybridLabelUrl?: string,
    zIndex?: number
  ) {
    this.layers = [];
    this.modeLayerIndexes = [];
    let basicLayerIndex: number | null = null;
    let satelliteLayerIndex: number | null = null;
    let hybridLayerIndex: number | null = null;

    const basicLayerSource = mapTilerBasicUrl
      ? this.createMapTilerBasicSource(mapTilerBasicUrl)
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

    if (satelliteLayerIndex !== null) {
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

    const osmLayerIndex = this.layers.push(this.createBaseOsmLayer(zIndex)) - 1;

    if (satelliteLayerIndex !== null && hybridLayerIndex !== null) {
      this.modeLayerIndexes.push([satelliteLayerIndex, hybridLayerIndex]);
    }
    if (satelliteLayerIndex !== null) {
      this.modeLayerIndexes.push([satelliteLayerIndex]);
    }
    if (basicLayerIndex !== null) {
      this.modeLayerIndexes.push([basicLayerIndex]);
    }
    this.modeLayerIndexes.push([osmLayerIndex]);

    this.projection = projection ?? defaultProjection!;
    this.currentLayerIndex = 0;
    this.applyCurrentMode();
  }

  createBaseOsmLayer = (zIndex?: number) => {
    return this.createTileLayer(new OSM(), zIndex);
  };

  createMapTilerBasicSource = (url: string) => {
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

  createMapTilerSatelliteLayer = (url: string, zIndex?: number) => {
    const mapTilerSatelliteSource = new TileJSON({
      url: url,
      tileSize: 512,
      crossOrigin: "anonymous",
    });
    return this.createTileLayer(mapTilerSatelliteSource, zIndex);
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
}
