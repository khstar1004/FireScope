import { describe, expect, test } from "vitest";
import {
  buildOfflineIntelGeoJson,
  buildOfflineMapTileSvg,
} from "../../../../scripts/createOfflineMapFallbackPlugin";

describe("offline map fallback plugin", () => {
  test("renders a local map tile instead of an offline fallback placeholder", () => {
    const svg = buildOfflineMapTileSvg({
      region: "korea",
      layer: "satellite",
      z: "6",
      x: "54",
      y: "24",
    });

    expect(svg).toContain("<svg");
    expect(svg).toContain("KOREA");
    expect(svg).toContain("Seoul");
    expect(svg).not.toContain("OFFLINE FALLBACK");
    expect(svg).not.toContain("z6 / x54 / y24");
  });

  test("marks the Seungjin AOI for offline 3D imagery requests", () => {
    const svg = buildOfflineMapTileSvg({
      region: "seungjin",
      layer: "satellite",
      z: "12",
      x: "3497",
      y: "1578",
    });

    expect(svg).toContain("Seungjin");
    expect(svg).toContain('class="aoi"');
    expect(svg).not.toContain("OFFLINE FALLBACK");
  });

  test("generates local GeoJSON placeholders for missing 3D intel layers", () => {
    expect(
      buildOfflineIntelGeoJson({
        region: "seungjin",
        layer: "roads",
      })
    ).toEqual({
      type: "FeatureCollection",
      features: [],
    });

    const aoi = buildOfflineIntelGeoJson({
      region: "seungjin",
      layer: "aoi",
    });

    expect(aoi.features).toHaveLength(2);
    expect(aoi.features[0].geometry.type).toBe("Polygon");
    expect(aoi.features[1].geometry.type).toBe("Point");
  });
});
