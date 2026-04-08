import {
  AssetExperienceSummary,
  buildAssetExperienceHash,
  getAssetExperienceQueryParams,
  inferAircraftExperienceCraft,
  parseAssetExperienceQueryParams,
} from "@/gui/experience/assetExperience";

describe("assetExperience", () => {
  test("round trips an asset summary through hash params", () => {
    const aircraftSummary: AssetExperienceSummary = {
      kind: "aircraft",
      id: "asset-1",
      name: "F-22 Raptor #1060",
      className: "F-22 Raptor",
      sideName: "GREEN",
      latitude: 10.714631,
      longitude: 118.641211,
      altitude: 10000,
      heading: 90,
      speed: 1303,
      range: 150,
      currentFuel: 18000,
      maxFuel: 18000,
      fuelRate: 6700,
      missionName: "Strike Mission #208",
      weaponCount: 3,
    };

    const hash = buildAssetExperienceHash(aircraftSummary);
    const parsedAsset = parseAssetExperienceQueryParams(
      getAssetExperienceQueryParams(hash)
    );

    expect(parsedAsset).toEqual(aircraftSummary);
  });

  test("infers drone craft when the aircraft class name matches an unmanned asset", () => {
    expect(inferAircraftExperienceCraft("MQ-9 Reaper")).toBe("drone");
    expect(inferAircraftExperienceCraft("KF-21 Boramae")).toBe("kf21");
    expect(inferAircraftExperienceCraft("F-15K Slam Eagle")).toBe("f15");
    expect(inferAircraftExperienceCraft("KF-16")).toBe("f16");
    expect(inferAircraftExperienceCraft("F-35A Lightning II")).toBe("f35");
    expect(inferAircraftExperienceCraft("F-22 Raptor")).toBe("f35");
    expect(inferAircraftExperienceCraft("B-52 Stratofortress")).toBe("jet");
  });
});
