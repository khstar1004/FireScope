// @ts-ignore Generated viewer bundle is runtime JS without a local declaration file.
import { deriveBattleStatTuning } from "../../../../public/3d-bundles/viewer/battleRuntime.js";

describe("battleRuntime", () => {
  test("derives heading and formation tuning from immersive viewer stats", () => {
    const tuning = deriveBattleStatTuning({
      heading: 405,
      range: 180,
      speed: 42,
      weaponCount: 6,
      aircraftCount: 8,
      compareCount: 9,
    });

    expect(tuning.headingRadians).toBeCloseTo(Math.PI / 4);
    expect(tuning.rangeFactor).toBeCloseTo(1.35);
    expect(tuning.weaponFactor).toBeCloseTo(1.5);
    expect(tuning.compareFactor).toBe(5);
    expect(tuning.extraTargetCount).toBe(2);
    expect(tuning.motionFactor).toBeGreaterThan(1);
    expect(tuning.formationSpread).toBeGreaterThan(1);
  });

  test("clamps sparse stats to safe minimums", () => {
    const tuning = deriveBattleStatTuning({
      heading: -90,
      range: 0,
      speed: 0,
      weaponCount: 0,
      compareCount: 0,
    });

    expect(tuning.headingRadians).toBeCloseTo(Math.PI * 1.5);
    expect(tuning.rangeFactor).toBeCloseTo(0.8);
    expect(tuning.weaponFactor).toBeCloseTo(0.8);
    expect(tuning.compareFactor).toBe(1);
    expect(tuning.extraTargetCount).toBe(0);
    expect(tuning.motionFactor).toBeCloseTo(0.72);
    expect(tuning.formationSpread).toBe(1);
  });
});
