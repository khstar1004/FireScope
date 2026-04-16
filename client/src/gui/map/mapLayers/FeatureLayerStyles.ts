import { FeatureLike } from "ol/Feature.js";
import {
  Style,
  Icon,
  Fill,
  Stroke,
  Text,
  Circle as CircleStyle,
} from "ol/style.js";

import { toRadians } from "@/utils/mapFunctions";
import { colorNameToColorArray, SIDE_COLOR } from "@/utils/colors";
import {
  isDroneAircraftClassName,
  isTankFacilityClassName,
} from "@/utils/assetTypeCatalog";

import FlightIconSvg from "@/gui/assets/svg/flight_black_24dp.svg";
import DroneMapIconSvg from "@/gui/assets/svg/drone_map_24dp.svg";
import RadarIconSvg from "@/gui/assets/svg/radar_black_24dp.svg";
import TankMapIconSvg from "@/gui/assets/svg/tank_map_24dp.svg";
import FlightTakeoffSvg from "@/gui/assets/svg/flight_takeoff_black_24dp.svg";
import ChevronRightSvg from "@/gui/assets/svg/chevron_right_black_24dp.svg";
import WeaponSvg from "@/gui/assets/svg/keyboard_double_arrow_up_black_24dp.svg";
import DirectionsBoatSvg from "@/gui/assets/svg/directions_boat_black_24dp.svg";
import PinDropSvg from "@/gui/assets/svg/pin_drop_24dp_E8EAED.svg";
import { LineString, Point } from "ol/geom";

function clampHealthRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 1);
}

function hasCombatStats(properties: Record<string, unknown>): boolean {
  return (
    typeof properties.currentHp === "number" &&
    typeof properties.maxHp === "number"
  );
}

function getHealthRatio(properties: Record<string, unknown>): number {
  if (typeof properties.healthRatio === "number") {
    return clampHealthRatio(properties.healthRatio);
  }
  if (hasCombatStats(properties) && Number(properties.maxHp) > 0) {
    return clampHealthRatio(
      Number(properties.currentHp) / Number(properties.maxHp)
    );
  }
  return 0;
}

function getHealthTone(healthRatio: number) {
  if (healthRatio <= 0.25) {
    return {
      code: "CRIT",
      color: "#ef5350",
      glow: "rgba(239, 83, 80, 0.2)",
      text: "#ffd7d2",
    };
  }
  if (healthRatio <= 0.6) {
    return {
      code: "WARN",
      color: "#f0b429",
      glow: "rgba(240, 180, 41, 0.18)",
      text: "#ffefc1",
    };
  }
  return {
    code: "OK",
    color: "#5ac878",
    glow: "rgba(90, 200, 120, 0.16)",
    text: "#d8ffe1",
  };
}

function roundCombatStat(value: unknown): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(Number(value))) : 0;
}

function truncateLabel(label: unknown, maxLength = 20): string {
  const normalizedLabel = typeof label === "string" ? label : "Unknown";
  if (normalizedLabel.length <= maxLength) {
    return normalizedLabel;
  }
  return `${normalizedLabel.slice(0, Math.max(maxLength - 3, 1))}...`;
}

function buildHealthMeter(healthRatio: number, segments = 8): string {
  const boundedRatio = clampHealthRatio(healthRatio);
  const filledSegments = Math.round(boundedRatio * segments);
  return `[${"|".repeat(filledSegments)}${".".repeat(
    segments - filledSegments
  )}]`;
}

function createHealthRingStyle(
  feature: FeatureLike,
  radius: number
): Style | null {
  const properties = feature.getProperties();
  if (!hasCombatStats(properties)) {
    return null;
  }

  const healthRatio = getHealthRatio(properties);
  const tone = getHealthTone(healthRatio);
  const selected = Boolean(properties.selected);

  return new Style({
    image: new CircleStyle({
      radius,
      fill: new Fill({
        color: selected ? tone.glow : "rgba(18, 24, 33, 0.5)",
      }),
      stroke: new Stroke({
        color: tone.color,
        width: selected ? 2.75 : 2,
      }),
    }),
  });
}

function createIconStyle(options: {
  feature: FeatureLike;
  src: string;
  rotation?: number;
  scale?: number;
  opacity?: number;
}) {
  return new Style({
    image: new Icon({
      opacity: options.opacity ?? 1,
      src: options.src,
      rotation: options.rotation,
      scale: options.scale ?? 1,
      color: options.feature.getProperties().sideColor,
    }),
  });
}

export const aircraftStyle = function (feature: FeatureLike) {
  const className = feature.getProperties().className;
  const isDrone = isDroneAircraftClassName(className);
  const ringStyle = createHealthRingStyle(feature, isDrone ? 10.5 : 12);
  const iconStyle = createIconStyle({
    feature,
    opacity: feature.getProperties().selected ? 0.5 : 1,
    src: isDrone ? DroneMapIconSvg : FlightIconSvg,
    rotation: toRadians(feature.getProperties().heading),
    scale: isDrone ? 0.72 : 1,
  });

  return ringStyle ? [ringStyle, iconStyle] : iconStyle;
};

export const facilityStyle = function (feature: FeatureLike) {
  const className = feature.getProperties().className;
  const isTank = isTankFacilityClassName(className);
  const ringStyle = createHealthRingStyle(feature, isTank ? 11 : 12.5);
  const iconStyle = createIconStyle({
    feature,
    opacity: 1,
    src: isTank ? TankMapIconSvg : RadarIconSvg,
    rotation: toRadians(feature.getProperties().heading ?? 0),
    scale: isTank ? 0.76 : 1,
  });

  return ringStyle ? [ringStyle, iconStyle] : iconStyle;
};

export const facilityPlacementStyle = function (feature: FeatureLike) {
  const className = feature.getProperties().className;
  const isTank = isTankFacilityClassName(className);
  return new Style({
    image: new Icon({
      opacity: 0.9,
      src: isTank ? TankMapIconSvg : RadarIconSvg,
      rotation: toRadians(feature.getProperties().heading ?? 0),
      scale: isTank ? 0.88 : 1.12,
      color: feature.getProperties().sideColor,
    }),
  });
};

export const airbasesStyle = function (feature: FeatureLike) {
  const ringStyle = createHealthRingStyle(feature, 11.5);
  const iconStyle = createIconStyle({
    feature,
    opacity: 1,
    src: FlightTakeoffSvg,
  });

  return ringStyle ? [ringStyle, iconStyle] : iconStyle;
};

export const threatRangeStyle = function (feature: FeatureLike) {
  const colorArray = colorNameToColorArray(
    feature.getProperties().sideColor,
    0.035
  );
  return new Style({
    stroke: new Stroke({
      color: feature.getProperties().sideColor,
      width: 1.5,
    }),
    fill: new Fill({
      color: colorArray ?? "rgba(255, 0, 0, 0.1)",
    }),
  });
};

export const threatRangePlacementStyle = function (feature: FeatureLike) {
  const colorArray = colorNameToColorArray(
    feature.getProperties().sideColor,
    0.14
  );
  return new Style({
    stroke: new Stroke({
      color: feature.getProperties().sideColor,
      width: 2.5,
      lineDash: [12, 8],
    }),
    fill: new Fill({
      color: colorArray ?? "rgba(255, 0, 0, 0.14)",
    }),
  });
};

export const routeStyle = function (feature: FeatureLike) {
  const colorArray = colorNameToColorArray(
    feature.getProperties().sideColor ?? SIDE_COLOR.BLACK,
    0.5
  );
  const styles = [
    new Style({
      stroke: new Stroke({
        color: colorArray ?? "rgba(0, 0, 0, 0.5)",
        width: 1.5,
      }),
    }),
  ];

  const lineString = feature.getGeometry() as LineString;
  lineString.forEachSegment(function (start, end) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);
    styles.push(
      new Style({
        geometry: new Point(end),
        image: new Icon({
          src: ChevronRightSvg,
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation,
          color: feature.getProperties().sideColor,
        }),
      })
    );
  });

  return styles;
};

export const routeDrawLineStyle = function (feature: FeatureLike) {
  if (feature.getGeometry()?.getType() !== "LineString") return [];

  const colorArray = colorNameToColorArray(
    feature.getProperties().sideColor ?? SIDE_COLOR.BLACK,
    0.5
  );
  const styles = [
    new Style({
      stroke: new Stroke({
        color: colorArray ?? "rgba(0, 0, 0, 0.5)",
        width: 1.5,
        lineDash: [10, 10],
      }),
    }),
  ];

  return styles;
};

export const weaponStyle = function (feature: FeatureLike) {
  const ringStyle = createHealthRingStyle(feature, 9.5);
  const iconStyle = createIconStyle({
    feature,
    src: WeaponSvg,
    rotation: toRadians(feature.getProperties().heading),
  });

  return ringStyle ? [ringStyle, iconStyle] : iconStyle;
};

export const featureLabelStyle = function (feature: FeatureLike) {
  const properties = feature.getProperties() as Record<string, unknown>;
  const labelStyles = [
    new Style({
      text: new Text({
        font: "600 12.5px Roboto, Helvetica, Arial, sans-serif",
        text: truncateLabel(properties.name),
        placement: "point",
        fill: new Fill({
          color: "#f7f3ea",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.5)",
          width: 0.8,
        }),
        backgroundFill: new Fill({
          color: "rgba(22, 28, 38, 0.82)",
        }),
        backgroundStroke: new Stroke({
          color: String(properties.sideColor ?? "#7F876C"),
          width: 1.4,
        }),
        padding: [4, 8, 4, 8],
        offsetY: 22,
      }),
    }),
  ];

  if (!hasCombatStats(properties)) {
    return labelStyles;
  }

  const healthRatio = getHealthRatio(properties);
  const tone = getHealthTone(healthRatio);
  labelStyles.push(
    new Style({
      text: new Text({
        font: "700 10px monospace",
        text: `${tone.code} ${roundCombatStat(properties.currentHp)}/${roundCombatStat(
          properties.maxHp
        )} ${buildHealthMeter(healthRatio)}`,
        placement: "point",
        fill: new Fill({
          color: tone.text,
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.45)",
          width: 0.7,
        }),
        backgroundFill: new Fill({
          color: "rgba(12, 17, 24, 0.94)",
        }),
        backgroundStroke: new Stroke({
          color: tone.color,
          width: 1.3,
        }),
        padding: [3, 6, 3, 6],
        offsetY: 40,
      }),
    })
  );

  return labelStyles;
};

export const shipStyle = function (feature: FeatureLike) {
  const ringStyle = createHealthRingStyle(feature, 12.5);
  const iconStyle = createIconStyle({
    feature,
    opacity: feature.getProperties().selected ? 0.5 : 1,
    src: DirectionsBoatSvg,
  });

  return ringStyle ? [ringStyle, iconStyle] : iconStyle;
};

export const referencePointStyle = function (feature: FeatureLike) {
  return new Style({
    image: new Icon({
      src: PinDropSvg,
      color: feature.getProperties().sideColor,
    }),
  });
};
