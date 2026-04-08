import {
  isBearingInsideSector,
  isTargetInsideSector,
  smallestAngleDeltaDegrees,
} from "@/utils/threatCoverage";

describe("threatCoverage", () => {
  test("accepts bearings inside a wrapped sector", () => {
    expect(isBearingInsideSector(350, 0, 40)).toBe(true);
    expect(isBearingInsideSector(15, 0, 40)).toBe(true);
    expect(isBearingInsideSector(40, 0, 40)).toBe(false);
  });

  test("measures smallest angle deltas across north correctly", () => {
    expect(smallestAngleDeltaDegrees(350, 10)).toBe(-20);
    expect(smallestAngleDeltaDegrees(10, 350)).toBe(20);
  });

  test("checks range and sector together for a target", () => {
    expect(
      isTargetInsideSector(37, 127, 37.25, 127, 40, 0, 90)
    ).toBe(true);
    expect(
      isTargetInsideSector(37, 127, 37, 127.35, 40, 0, 90)
    ).toBe(false);
    expect(
      isTargetInsideSector(37, 127, 38.2, 127, 40, 0, 90)
    ).toBe(false);
  });
});
