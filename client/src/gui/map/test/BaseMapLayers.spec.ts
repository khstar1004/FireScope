import BaseMapLayers from "@/gui/map/mapLayers/BaseMapLayers";

describe("BaseMapLayers", () => {
  it("starts in hybrid mode when satellite and labels are available", () => {
    const layers = new BaseMapLayers(
      undefined,
      "https://example.com/basic/{z}/{x}/{y}.png",
      "https://example.com/satellite/tiles.json"
    );

    expect(layers.currentLayerIndex).toBe(0);
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      false,
      true,
      true,
      false,
    ]);
  });

  it("cycles through hybrid, satellite, basic, and osm modes", () => {
    const layers = new BaseMapLayers(
      undefined,
      "https://example.com/basic/{z}/{x}/{y}.png",
      "https://example.com/satellite/tiles.json"
    );

    layers.toggleLayer();
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      false,
      true,
      false,
      false,
    ]);

    layers.toggleLayer();
    expect(layers.layers.map((layer) => layer.getVisible())).toEqual([
      true,
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
    ]);
  });
});
