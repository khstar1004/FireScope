declare module "../../../../flight-sim-source/src/systems/battleSpectatorModelRender" {
  export interface BattleSpectatorRenderContext {
    groundModelCandidateCount: number;
    groundOffsetsByUnitId: Record<
      string,
      {
        eastMeters: number;
        northMeters: number;
        altitudeMeters: number;
      }
    >;
  }

  export interface BattleSpectatorModelProfile {
    uri?: string;
    scale?: number;
    minimumPixelSize?: number;
    maximumScale?: number;
  }

  export interface BattleSpectatorDisplayPoint {
    latitude?: number;
    longitude?: number;
    altitudeMeters?: number;
  }

  export function isGroundRenderUnit(unit: unknown): boolean;
  export function buildUnitModelRenderContext(
    units?: Array<Record<string, unknown>>
  ): BattleSpectatorRenderContext;
  export function hasGroundModelBudget(
    renderContext: BattleSpectatorRenderContext | null | undefined,
    facilityModelBudget: number
  ): boolean;
  export function resolveUnitModelRenderProfile(
    model: BattleSpectatorModelProfile | null | undefined,
    unit: Record<string, unknown> | null | undefined,
    options?: {
      cameraProfile?: string;
      lodLevel?: string;
      emphasized?: boolean;
      tracked?: boolean;
    }
  ): BattleSpectatorModelProfile | null;
  export function resolveDisplayedUnitPoint(
    unit: BattleSpectatorDisplayPoint & Record<string, unknown>,
    renderContext: BattleSpectatorRenderContext | null | undefined
  ): BattleSpectatorDisplayPoint & Record<string, unknown>;
}

declare module "../../../../flight-sim-source/src/systems/battleSpectatorModelScale" {
  export interface BattleSpectatorScaleProfile {
    scale: number;
    minimumPixelSize: number;
    maximumScale: number;
  }

  export function resolveUnitModelScaleProfile(
    modelId?: string | null,
    uri?: string | null
  ): BattleSpectatorScaleProfile | null;
}

declare module "../../../../flight-sim-source/src/systems/battleSpectatorSystem" {
  export interface BattleSpectatorTrackingVector {
    x: number;
    y: number;
    z: number;
  }

  export interface BattleSpectatorTrackingOffset {
    heading: number;
    pitch: number;
    range: number;
  }

  export function resolveTrackingCameraView(
    snapshot: Record<string, unknown> | null | undefined,
    type: "unit" | "weapon",
    cameraProfile?: string
  ): {
    viewFrom: BattleSpectatorTrackingVector;
    offset: BattleSpectatorTrackingOffset;
  };
}

declare module "../../../../flight-sim-source/src/world/globeReadiness" {
  export function isVWorldGlobeReady(runtimeState: unknown): boolean;
  export function isCesiumGlobeReady(viewer: unknown): boolean;
  export function isGlobeSurfaceReady(
    viewer: unknown,
    runtimeState: unknown
  ): boolean;
}
