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

  test("matches K2 ground assets to the dedicated K2 bundle model", () => {
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
      "K2 Black Panther"
    );
  });

  test("matches ship assets to the Korean destroyer bundle catalog", () => {
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

    expect(selectAssetExperienceModel(asset)?.label).toBe(
      "Yi Sun-shin Class Destroyer"
    );
  });

  test("uses conceptual preview fallback for airbase assets without a dedicated bundle", () => {
    const asset: AssetExperienceSummary = {
      kind: "airbase",
      id: "base-hangar",
      name: "Seoul Air Base",
      className: "Seoul Air Base",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectAssetExperienceModel(asset)).toBeNull();
  });

  test("maps Cheongung-II to the closest available air-defense bundle", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "cheongung-2",
      name: "천궁-II 방호권",
      className: "Cheongung-II (KM-SAM Block II)",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectAssetExperienceModel(asset)?.label).toBe("Patriot");
  });

  test("maps long-range foreign SAM systems to the closest defense proxy bundle", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "s400-1",
      name: "Capital S-400 Belt",
      className: "S-400 Triumf",
      sideName: "RED",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectAssetExperienceModel(asset)?.label).toBe("Patriot");
  });

  test("keeps concept-only short-range SAM systems out of artillery bundle fallbacks", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "tor-1",
      name: "Harbor Tor Screen",
      className: "Tor-M2",
      sideName: "RED",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    expect(selectAssetExperienceModel(asset)).toBeNull();
    expect(getImmersiveExperienceModelOptions(asset, "defense")).toEqual([]);
    expect(selectImmersiveExperienceModel(asset, "defense")).toBeNull();
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

  test("keeps the fires catalog limited to artillery and strike bundles", () => {
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
    expect(options.some((option) => option.label === "Roketsan Missiles")).toBe(
      true
    );
    expect(options.some((option) => option.label === "Patriot")).toBe(false);
    expect(options.some((option) => option.label === "NASAMS Battery")).toBe(
      false
    );
    expect(options.some((option) => option.label === "THAAD")).toBe(false);
  });

  test("exposes K2, K21, and Stryker models in the ground catalog", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "ground-catalog",
      name: "Mechanized Brigade",
      className: "Armored Battalion",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    const options = getImmersiveExperienceModelOptions(asset, "ground");

    expect(options.some((option) => option.label === "K2 Black Panther")).toBe(
      true
    );
    expect(options.some((option) => option.label === "K21 IFV")).toBe(true);
    expect(options.some((option) => option.label === "M1126 Stryker")).toBe(
      true
    );
  });

  test("keeps the defense catalog limited to air-defense bundles", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "defense-catalog",
      name: "Capital Defense Belt",
      className: "Cheongung-II (KM-SAM Block II)",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    };

    const options = getImmersiveExperienceModelOptions(asset, "defense");

    expect(options.some((option) => option.label === "Patriot")).toBe(true);
    expect(options.some((option) => option.label === "NASAMS Battery")).toBe(
      true
    );
    expect(options.some((option) => option.label === "THAAD")).toBe(true);
    expect(options.some((option) => option.label === "K9 Thunder")).toBe(false);
    expect(options.some((option) => option.label === "Hyunmoo Launcher")).toBe(
      false
    );
  });
});
