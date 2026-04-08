import {
  isDroneAircraftClassName,
  isTankFacilityClassName,
} from "@/utils/assetTypeCatalog";

describe("assetTypeCatalog", () => {
  test("detects drone aircraft by common class names", () => {
    expect(isDroneAircraftClassName("MQ-9 Reaper")).toBe(true);
    expect(isDroneAircraftClassName("RQ-4 Global Hawk")).toBe(true);
    expect(isDroneAircraftClassName("KF-21 Boramae")).toBe(false);
  });

  test("detects tank and armored vehicle facility names", () => {
    expect(isTankFacilityClassName("K2 Black Panther")).toBe(true);
    expect(isTankFacilityClassName("KM900 APC")).toBe(true);
    expect(isTankFacilityClassName("M113A1")).toBe(true);
    expect(isTankFacilityClassName("L-SAM")).toBe(false);
  });
});
