import BaseMapLayers from "@/gui/map/mapLayers/BaseMapLayers";

describe("BaseMapLayers", () => {
  it("starts in hybrid mode when satellite and labels are available", () => {
    const layers = new BaseMapLayers(
      undefined,
      "https://example.com/basic/{z}/{x}/{y}.png",
      "https://example.com/satellite/tiles.json",
      undefined,
      "https://example.com/evening/{z}/{x}/{y}.png"
    );

    expect(layers.currentLayerIndex).toBe(0);
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      false,
      true,
      true,
      false,
      false,
    ]);
  });

  it("cycles through hybrid, satellite, basic, evening, and osm modes", () => {
    const layers = new BaseMapLayers(
      undefined,
      "https://example.com/basic/{z}/{x}/{y}.png",
      "https://example.com/satellite/tiles.json",
      undefined,
      "https://example.com/evening/{z}/{x}/{y}.png"
    );

    layers.toggleLayer();
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      false,
      true,
      false,
      false,
      false,
    ]);

    layers.toggleLayer();
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      true,
      false,
      false,
      false,
      false,
    ]);

    layers.toggleLayer();
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      false,
      false,
      false,
      true,
      false,
    ]);

    layers.toggleLayer();
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it("sets the requested mode directly when available", () => {
    const layers = new BaseMapLayers(
      undefined,
      "https://example.com/basic/{z}/{x}/{y}.png",
      "https://example.com/satellite/tiles.json",
      undefined,
      "https://example.com/evening/{z}/{x}/{y}.png"
    );

    layers.setMode("evening");

    expect(layers.getCurrentModeId()).toBe("evening");
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      false,
      false,
      false,
      true,
      false,
    ]);
  });

  it("accepts offline satellite XYZ templates", () => {
    const layers = new BaseMapLayers(
      undefined,
      "/offline-map/seungjin/raster/basic/{z}/{x}/{y}.png",
      "/offline-map/seungjin/raster/satellite/{z}/{x}/{y}.jpg"
    );

    expect(layers.getAvailableModes().map((mode) => mode.id)).toEqual([
      "hybrid",
      "satellite",
      "basic",
      "osm",
    ]);
  });

  it("can omit the online OSM fallback in closed-network demo mode", () => {
    const layers = new BaseMapLayers(
      undefined,
      "/offline-map/seungjin/raster/basic/{z}/{x}/{y}.png",
      "/offline-map/seungjin/raster/satellite/{z}/{x}/{y}.jpg",
      undefined,
      undefined,
      undefined,
      false
    );

    expect(layers.getAvailableModes().map((mode) => mode.id)).toEqual([
      "hybrid",
      "satellite",
      "basic",
    ]);
  });

  it("uses offline hybrid as the first closed-network mode", () => {
    const layers = new BaseMapLayers(
      undefined,
      undefined,
      "/offline-map/korea/raster/satellite/{z}/{x}/{y}.jpg",
      undefined,
      undefined,
      undefined,
      false,
      "data:application/geo+json,%7B%22type%22%3A%22FeatureCollection%22%2C%22features%22%3A%5B%5D%7D"
    );

    expect(layers.getCurrentModeId()).toBe("hybrid");
    expect(layers.getAvailableModes().map((mode) => mode.id)).toEqual([
      "hybrid",
      "vector",
      "satellite",
    ]);
  });
});
