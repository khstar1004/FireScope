import {
  buildFacilityFormationLayout,
  resolveFacilityPlacementArcDegrees,
  resolveFacilityPlacementHeading,
} from "@/gui/map/facilityPlacementDefaults";

describe("facilityPlacementDefaults", () => {
  test("uses preset heading when the direction point matches the origin", () => {
    expect(
      resolveFacilityPlacementHeading(37.4, 126.8, 37.4, 126.8, {
        headingDegrees: 332,
        arcDegrees: 120,
      })
    ).toBe(332);
  });

  test("uses the measured bearing once the cursor moves", () => {
    const heading = resolveFacilityPlacementHeading(
      37.4,
      126.8,
      37.8,
      126.8,
      {
        headingDegrees: 332,
      }
    );

    expect(Math.round(heading)).toBe(0);
  });

  test("prefers preset arc degrees over the facility template arc", () => {
    expect(
      resolveFacilityPlacementArcDegrees(90, {
        headingDegrees: 8,
        arcDegrees: 120,
      })
    ).toBe(120);
    expect(resolveFacilityPlacementArcDegrees(90, null)).toBe(90);
  });

  test("builds a distributed multi-battery layout around the anchor", () => {
    const layout = buildFacilityFormationLayout(37.4, 126.8, 0, {
      headingDegrees: 0,
      formation: {
        unitCount: 3,
        lateralSpacingKm: 8,
        depthSpacingKm: 2,
      },
    });

    expect(layout).toHaveLength(3);
    expect(layout[1]?.latitude).toBeCloseTo(37.4, 3);
    expect(layout[0]?.longitude).toBeLessThan(126.8);
    expect(layout[2]?.longitude).toBeGreaterThan(126.8);
    expect(layout[0]?.latitude).toBeGreaterThan(37.4);
    expect(layout[2]?.latitude).toBeGreaterThan(37.4);
  });
});
