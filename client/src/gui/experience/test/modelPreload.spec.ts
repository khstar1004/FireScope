import {
  buildBundleViewerPreloadUrls,
  buildTacticalSimPreloadUrls,
} from "@/gui/experience/modelPreload";

describe("modelPreload", () => {
  test("builds deduplicated viewer preload urls with the selected model", () => {
    const urls = buildBundleViewerPreloadUrls(
      "/3d-bundles/tank/models/m113a1.glb",
      [
        {
          id: "infra-hangar",
          path: "/3d-bundles/infrastructure/models/aircraft_hangar.glb",
          position: [-4, 0, -4],
        },
      ],
      [
        {
          id: "tank-k2",
          bundle: "tank",
          path: "/3d-bundles/tank/models/k2_black_panther_tank.glb",
          label: "K2 Black Panther",
        },
      ]
    );

    expect(urls).toContain("/3d-bundles/viewer/index.html");
    expect(urls).toContain("/3d-bundles/viewer/viewer.js");
    expect(urls).toContain("/3d-bundles/tank/models/m113a1.glb");
    expect(urls).toContain(
      "/3d-bundles/infrastructure/models/aircraft_hangar.glb"
    );
    expect(urls).toContain("/3d-bundles/tank/models/k2_black_panther_tank.glb");
    expect(
      urls.filter((url) => url === "/3d-bundles/viewer/viewer.js")
    ).toHaveLength(1);
  });

  test("builds tactical preload urls with shell assets and model path", () => {
    const urls = buildTacticalSimPreloadUrls(
      "/3d-bundles/artillery/models/thaad-2.glb"
    );

    expect(urls).toContain("/tactical-sim/index.html");
    expect(urls).toContain("/tactical-sim/app.js");
    expect(urls).toContain("/flight-sim/cesium/Cesium.js");
    expect(urls).toContain("/3d-bundles/artillery/models/thaad-2.glb");
  });
});
