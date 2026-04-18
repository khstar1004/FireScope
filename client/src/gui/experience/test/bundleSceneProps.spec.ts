import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import { buildBundleViewerSceneProps } from "@/gui/experience/bundleSceneProps";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";

const jetSelection: BundleModelSelection = {
  id: "aircraft-kf21",
  bundle: "aircraft",
  path: "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
  label: "KF-21 Boramae",
  note: "한국형 멀티롤 전투기 계열",
};

describe("bundleSceneProps", () => {
  test("keeps detail showrooms focused on the selected model only", () => {
    const asset: AssetExperienceSummary = {
      kind: "aircraft",
      id: "aircraft-1",
      name: "KF-21 Demo",
      className: "KF-21 Boramae",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(buildBundleViewerSceneProps(asset, jetSelection, "detail")).toEqual(
      []
    );
  });

  test("builds a full flight-line scene for immersive jet views", () => {
    const asset: AssetExperienceSummary = {
      kind: "airbase",
      id: "base-1",
      name: "Osan Air Base",
      className: "Airfield",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    const sceneProps = buildBundleViewerSceneProps(
      asset,
      jetSelection,
      "immersive"
    );

    expect(sceneProps.map((sceneProp) => sceneProp.path).sort()).toEqual(
      [
        "/3d-bundles/infrastructure/models/aircraft_hangar.glb",
        "/3d-bundles/infrastructure/models/air_traffic_control_tower.glb",
        "/3d-bundles/infrastructure/models/airport_tug.glb",
        "/3d-bundles/infrastructure/models/low_poly_cargo_container.glb",
        "/3d-bundles/infrastructure/models/military_tent_hangar.glb",
        "/3d-bundles/infrastructure/models/ural_atz_5_4320_fuel_truck.glb",
      ].sort()
    );
  });

  test("does not add infrastructure props to ground vehicles", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "ground-1",
      name: "K2 Platoon",
      className: "K2 MBT",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };
    const selection: BundleModelSelection = {
      id: "tank-k2",
      bundle: "tank",
      path: "/3d-bundles/tank/models/k2_black_panther_tank.glb",
      label: "K2 Black Panther",
      note: "한국 주력전차 계열",
    };

    expect(buildBundleViewerSceneProps(asset, selection, "immersive")).toEqual(
      []
    );
  });
});
