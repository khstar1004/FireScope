import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import {
  getImmersiveExperienceModelOptions,
  selectAssetExperienceModel,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";

describe("bundleModels", () => {
  test("matches drone aircraft to the drone bundle", () => {
    const asset: AssetExperienceSummary = {
      kind: "aircraft",
      id: "air-1",
      name: "MQ-9 Reaper",
      className: "MQ-9 Reaper",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 12000,
    };

    expect(selectAssetExperienceModel(asset)?.path).toBe(
      "/3d-bundles/drone/models/animated_drone.glb"
    );
  });

  test("matches KF-21 aircraft to the dedicated Boramae bundle model", () => {
    const asset: AssetExperienceSummary = {
      kind: "aircraft",
      id: "air-kf21",
      name: "KF-21 Boramae",
      className: "KF-21 Boramae",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 22000,
    };

    expect(selectAssetExperienceModel(asset)?.label).toBe("KF-21 Boramae");
  });

  test("matches air defense assets to the closest defense bundle model", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "def-1",
      name: "Patriot Battery Alpha",
      className: "MIM-104 Patriot",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectAssetExperienceModel(asset)?.label).toBe("Patriot");
  });

  test("matches ground assets to the closest tracked armor bundle model", () => {
    const asset: AssetExperienceSummary = {
      kind: "weapon",
      id: "ground-1",
      name: "K2 Black Panther",
      className: "K2 MBT",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectImmersiveExperienceModel(asset, "ground")?.label).toBe(
      "Tracked Armor"
    );
  });

  test("matches ship assets to the maritime bundle catalog", () => {
    const asset: AssetExperienceSummary = {
      kind: "ship",
      id: "ship-1",
      name: "Sejong the Great",
      className: "Sejong the Great-class Destroyer",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectAssetExperienceModel(asset)?.label).toBe("Type 45 Destroyer");
  });

  test("exposes KF-21, helicopter, and drone models in the base experience catalog", () => {
    const asset: AssetExperienceSummary = {
      kind: "airbase",
      id: "base-1",
      name: "Seoul Air Base",
      className: "Airfield",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    const options = getImmersiveExperienceModelOptions(asset, "base");

    expect(options.some((option) => option.label === "KF-21 Boramae")).toBe(
      true
    );
    expect(options.some((option) => option.label === "AH-64 Apache")).toBe(
      true
    );
    expect(options.some((option) => option.label === "UH-60 Black Hawk")).toBe(
      true
    );
    expect(options.some((option) => option.label === "Animated Drone")).toBe(
      true
    );
  });

  test("prefers the KF-21 model for Boramae signatures in base experience", () => {
    const asset: AssetExperienceSummary = {
      kind: "airbase",
      id: "base-kf21",
      name: "Boramae Flight Line",
      className: "KF-21 Boramae Shelter",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectImmersiveExperienceModel(asset, "base")?.label).toBe(
      "KF-21 Boramae"
    );
  });

  test("exposes newly staged artillery models in the fires catalog", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "fires-1",
      name: "Artillery Brigade",
      className: "Field Artillery",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    const options = getImmersiveExperienceModelOptions(asset, "fires");

    expect(options.some((option) => option.label === "D-30 Howitzer")).toBe(
      true
    );
    expect(
      options.some((option) => option.label === "Roketsan Missiles")
    ).toBe(true);
  });
});
