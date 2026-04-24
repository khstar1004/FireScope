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
