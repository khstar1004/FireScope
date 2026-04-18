import Dba from "@/game/db/Dba";
import { buildAssetPlacementPreview } from "@/gui/map/toolbar/assetPlacementPreview";

describe("assetPlacementPreview", () => {
  const unitDb = new Dba();

  test("maps F-15K placement preview to the strike eagle bundle", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "aircraft",
      "F-15K Slam Eagle"
    );

    expect(preview.asset.kind).toBe("aircraft");
    expect(preview.model?.id).toBe("aircraft-f15-strike");
    expect(preview.sceneProps).toEqual([]);
  });

  test("maps Patriot placement preview to the closest defense bundle", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "facility",
      "MIM-104 Patriot"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.model?.id).toBe("artillery-patriot");
  });

  test("maps Cheongung-II placement preview to a curated closest defense model", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "facility",
      "Cheongung-II (KM-SAM Block II)"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.previewMode).toBe("closest");
    expect(preview.model?.id).toBe("artillery-patriot");
  });

  test("maps foreign strategic SAM placement previews to closest defense proxies", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "RED",
      "facility",
      "S-400 Triumf"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.previewMode).toBe("closest");
    expect(preview.model?.id).toBe("artillery-patriot");
  });

  test("uses a concept preview for short-range SAM systems without a faithful GLB", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "RED",
      "facility",
      "Tor-M2"
    );

    expect(preview.asset.kind).toBe("facility");
    expect(preview.previewMode).toBe("concept");
    expect(preview.model).toBeNull();
  });

  test("uses a concept preview for airbases instead of forcing a misleading 3D model", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "airbase",
      "Seoul Air Base"
    );

    expect(preview.asset.kind).toBe("airbase");
    expect(preview.previewMode).toBe("concept");
    expect(preview.model).toBeNull();
    expect(preview.sceneProps).toEqual([]);
  });

  test("supports overriding the preview display name for curated presets", () => {
    const preview = buildAssetPlacementPreview(
      unitDb,
      "BLUE",
      "facility",
      "Chunmoo MRLS",
      { displayName: "수도포병여단" }
    );

    expect(preview.displayName).toBe("수도포병여단");
    expect(preview.unitClassName).toBe("Chunmoo MRLS");
  });
});
