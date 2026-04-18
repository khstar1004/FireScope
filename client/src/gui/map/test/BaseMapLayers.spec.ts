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
});
