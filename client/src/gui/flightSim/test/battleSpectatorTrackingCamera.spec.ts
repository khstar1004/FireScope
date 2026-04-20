import { describe, expect, test } from "vitest";
import { resolveTrackingCameraView } from "../../../../flight-sim-source/src/systems/battleSpectatorSystem";

const DEGREE_TO_RADIAN = Math.PI / 180;

describe("battle spectator tracking camera", () => {
  test("lifts orbit views higher over tracked ground units", () => {
    const view = resolveTrackingCameraView(
      {
        entityType: "facility",
        speedKts: 24,
      },
      "unit",
      "orbit"
    );

    expect(view.viewFrom.z).toBeGreaterThan(900);
    expect(view.offset.pitch).toBeCloseTo(-28 * DEGREE_TO_RADIAN, 6);
    expect(view.offset.range).toBeCloseTo(1150 * 0.52, 6);
  });

  test("keeps chase views above tracked ground units instead of hugging terrain", () => {
    const view = resolveTrackingCameraView(
      {
        entityType: "facility",
        speedKts: 0,
      },
      "unit",
      "chase"
    );

    expect(view.viewFrom.z).toBeGreaterThanOrEqual(760);
    expect(view.offset.pitch).toBeCloseTo(-24 * DEGREE_TO_RADIAN, 6);
    expect(view.offset.range).toBeCloseTo(1150 * 0.62, 6);
  });
});
