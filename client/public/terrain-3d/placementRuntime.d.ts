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
