import { describe, expect, test } from "vitest";
import { resolveUnitModelScaleProfile } from "../../../../flight-sim-source/src/systems/battleSpectatorModelScale";

describe("battle spectator ground model scale calibration", () => {
  test("shrinks the oversized K9 artillery asset to a real-world footprint", () => {
    const profile = resolveUnitModelScaleProfile(
      "artillery-k9",
      "/3d-bundles/artillery/models/k9_thunder_artillery.glb"
    );

    expect(profile).not.toBeNull();
    expect(profile?.scale).toBeLessThan(0.001);
    expect(profile?.scale).toBeCloseTo(12 / 256509.45312500003, 8);
    expect(profile?.minimumPixelSize).toBe(2);
  });

  test("shrinks the oversized KM900 APC asset to a real-world footprint", () => {
    const profile = resolveUnitModelScaleProfile(
      "tank-km900",
      "/3d-bundles/tank/models/south_korean_km900_apc.glb"
    );

    expect(profile).not.toBeNull();
    expect(profile?.scale).toBeLessThan(0.01);
    expect(profile?.scale).toBeCloseTo(6.95 / 913.0614013671875, 6);
  });

  test("keeps normally sized armored vehicles near 1:1 scaling", () => {
    const profile = resolveUnitModelScaleProfile(
      "tank-m113",
      "/3d-bundles/tank/models/m113a1.glb"
    );

    expect(profile).not.toBeNull();
    expect(profile?.scale).toBeCloseTo(4.86 / 4.740999831087889, 4);
    expect(profile?.scale).toBeGreaterThan(0.9);
    expect(profile?.scale).toBeLessThan(1.1);
  });
});
