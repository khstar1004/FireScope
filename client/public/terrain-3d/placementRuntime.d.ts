export function sortPlacementUnitsForPanel(
  left: Record<string, unknown>,
  right: Record<string, unknown>
): number;

export function resolveFocusCameraPreset(
  unit: Record<string, unknown> | null | undefined,
  model: Record<string, unknown> | null | undefined,
  displayPoint: Record<string, unknown> | null | undefined
): {
  headingDeg: number;
  pitchDeg: number;
  rangeMeters: number;
  targetHeightOffsetMeters: number;
};

export function resolveEffectTimelineValue(
  progress: number,
  stops:
    | Array<{
        at?: number;
        value?: number;
      }>
    | null
    | undefined,
  fallback?: number
): number;

export function resolveWeaponModelProfile(
  weapon: Record<string, unknown> | null | undefined
): {
  uri: string;
  scale: number;
  minimumPixelSize: number;
  maximumScale: number;
  visibleDistanceMeters: number;
  colorAlpha: number;
  colorBlendAmount: number;
  silhouetteAlpha: number;
  silhouetteSize: number;
};

export function resolveModelAxisCorrectionProfile(
  uri: string | null | undefined
): {
  nodeName: string;
  convention:
    | "gltf-y-up-x-forward"
    | "gltf-y-up-y-forward"
    | "z-up-x-forward"
    | "z-up-y-forward"
    | "y-up-x-forward";
  upAxis: "Y" | "Z";
  forwardAxis: "X" | "Y";
} | null;

export function resolveUnitModel(
  unit: Record<string, unknown> | null | undefined,
  renderContext?: Record<string, unknown> | null | undefined
): {
  uri: string;
  scale: number;
  minimumPixelSize: number;
  maximumScale: number;
} | null;

export function resolveUnitModelHeadingDeg(
  unit: Record<string, unknown> | null | undefined,
  model: Record<string, unknown> | null | undefined
): number;

export function resolveUnitModelScreenSizing(
  unit: Record<string, unknown> | null | undefined,
  model: Record<string, unknown> | null | undefined,
  emphasized: boolean
): {
  scale: number;
  minimumPixelSize: number;
  maximumScale: number;
  enlargedModel: boolean;
};

export function resolveUnitProxyDimensions(
  unit: Record<string, unknown> | null | undefined,
  model: Record<string, unknown> | null | undefined,
  emphasized?: boolean
): {
  x: number;
  y: number;
  z: number;
};

export function shouldRenderUnitModel(
  unit: Record<string, unknown> | null | undefined,
  model: Record<string, unknown> | null | undefined,
  emphasized?: boolean
): boolean;

export function resolveUnitModelHeightReference(
  Cesium: {
    HeightReference: {
      CLAMP_TO_GROUND: unknown;
      NONE: unknown;
      RELATIVE_TO_GROUND: unknown;
    };
  },
  unit: Record<string, unknown> | null | undefined
): unknown;

export function resolveFocusFireImpactBoxState(
  snapshot: Record<string, unknown> | null | undefined,
  accumulatedImpactCount?: number
): {
  longitude: number;
  latitude: number;
  altitudeMeters: number;
  impactLoad: number;
  weaponsInFlight: number;
  expectedStrikeEffect: number | null;
  text: string;
} | null;

export function ensureCesiumColorMaterialProperty<T>(
  Cesium: {
    ColorMaterialProperty: new (color: unknown) => T;
  },
  colorProperty: unknown
): T;

export function createTerrainPlacementRuntime(options: {
  Cesium: Record<string, unknown>;
  bounds: Record<string, unknown>;
  widthMeters: number;
  heightMeters: number;
  liveRuntimeEnabled?: boolean;
  setStatusMessage?: (message: string) => void;
  setPlacementBadge?: (message: string) => void;
}): {
  attach: (viewerInstance: unknown) => Promise<void>;
  applySnapshot: (snapshot: unknown) => void;
  clearPlacement: () => void;
  handleMessage: (event: MessageEvent) => void;
};
