export interface BattleSpectatorScaleProfile {
  scale: number;
  minimumPixelSize: number;
  maximumScale: number;
}

export function resolveUnitModelScaleProfile(
  modelId?: string | null,
  uri?: string | null
): BattleSpectatorScaleProfile | null;
