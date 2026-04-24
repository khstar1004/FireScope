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
