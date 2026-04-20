export type GuideRailAlertId =
  | "no-assets"
  | "no-friendly-assets"
  | "no-hostiles"
  | "no-missions"
  | "engagement-live"
  | "drawer-open";

export type GuideRailAssetMixId =
  | "manned-aircraft"
  | "drone"
  | "airbase"
  | "facility"
  | "armor"
  | "ship";

export type GuideRailAssetSelectionLabels = Partial<
  Record<GuideRailAssetMixId, string>
>;

export interface GuideRailPlacementFocusIntent {
  assetType: GuideRailAssetMixId;
  signal: number;
}
