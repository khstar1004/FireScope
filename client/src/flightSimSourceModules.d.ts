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
  export function isCesiumGlobeReady(
    viewer: unknown,
    options?: { acceptEmptyTileList?: boolean }
  ): boolean;
  export function isGlobeSurfaceReady(
    viewer: unknown,
    runtimeState: unknown
  ): boolean;
}

declare module "../../../../flight-sim-source/src/world/vworldRuntimeUrls" {
  export function isVWorldHost(hostname?: string): boolean;
  export function normalizeVWorldRuntimeUrl(
    resourceUrl: string,
    baseUrl: string
  ): string;
}

declare module "../../../../flight-sim-source/src/plane/terrainSafety" {
  export function resolveTerrainAltitudeSafety(options: {
    craftProfile?: Record<string, unknown> | null;
    altitude: number;
    terrainHeight: number;
    verticalSpeed?: number;
  }): {
    adjustedAltitude: number;
    aboveGround: number | null;
    shouldCrash: boolean;
    wasRecovered: boolean;
  };
}

declare module "../../../../public/terrain-3d/terrainIntel.js" {
  interface TerrainIntelLocationLike {
    hostname?: string;
    host?: string;
    origin?: string;
  }

  export function shouldUseVworldProxy(
    locationLike?: {
      hostname?: string;
      origin?: string;
    } | null
  ): boolean;
  export function buildVworldServiceUrl(
    pathname: string,
    locationLike?: TerrainIntelLocationLike | null
  ): URL;
  export function resolveOllamaApiBaseUrl(
    runtimeConfig: {
      ollamaBaseUrl?: string;
    },
    searchParams: URLSearchParams,
    locationLike?: TerrainIntelLocationLike | null
  ): string;
  export function extractOllamaModelNames(payload: unknown): string[];
  export function selectOllamaVisionModel(
    preferredModel: string,
    availableModels?: string[]
  ): string;
  export function buildRuntimeAssetTerrainContext(options?: {
    bounds?: {
      west: number;
      south: number;
      east: number;
      north: number;
    };
    units?: Array<Record<string, unknown>>;
    weapons?: Array<Record<string, unknown>>;
    selectedUnitId?: string;
    currentTime?: number;
  }): Record<string, unknown>;
  export function buildAssetTerrainRecommendations(options?: {
    markers?: Array<Record<string, unknown>>;
    runtimeContext?: Record<string, unknown>;
    widthMeters?: number;
    heightMeters?: number;
    limit?: number;
  }): Array<Record<string, unknown>>;
  export function enrichTerrainAnalysisWithRuntimeContext(
    analysis: Record<string, unknown>,
    runtimeSnapshot?: Record<string, unknown> | null
  ): Record<string, unknown>;
  export function buildTerrainVlmPrompt(
    analysis: Record<string, unknown>
  ): string;
}
