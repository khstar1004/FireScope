import {
  computeFitDistance,
  computeFocusTarget,
  computeOrbitDistances,
  computeUniformScale,
  getModelRotationOffset,
  getViewFramingPreset,
} from "../../../../public/3d-bundles/viewer/utils/viewFraming.js";

describe("viewFraming", () => {
  test("backs the camera away on narrow viewports", () => {
    const wideDistance = computeFitDistance({
      radius: 2.4,
      fovDegrees: 42,
      aspect: 16 / 9,
      padding: 1.2,
    });
    const narrowDistance = computeFitDistance({
      radius: 2.4,
      fovDegrees: 42,
      aspect: 0.78,
      padding: 1.2,
    });

    expect(narrowDistance).toBeGreaterThan(wideDistance);
  });

  test("anchors the focus target to the live model bounds", () => {
    const target = computeFocusTarget(
      {
        minX: -4,
        minY: -1.5,
        minZ: -3,
        maxX: 6,
        maxY: 2.5,
        maxZ: 5,
      },
      0.48
    );

    expect(target.x).toBeCloseTo(1);
    expect(target.y).toBeCloseTo(0.42);
    expect(target.z).toBeCloseTo(1);
  });

  test("clamps unstable scale inputs to a safe fallback", () => {
    expect(computeUniformScale(0, 5.2)).toBe(1);
    expect(computeUniformScale(200, 5.2)).toBeCloseTo(0.04);
    expect(computeUniformScale(2.6, 5.2)).toBeCloseTo(2);
  });

  test("keeps immersive presets looser than the base bundle view", () => {
    const detailPreset = getViewFramingPreset({
      bundle: "artillery",
      profile: "",
      mode: "detail",
    });
    const immersivePreset = getViewFramingPreset({
      bundle: "artillery",
      profile: "fires",
      mode: "immersive",
    });

    expect(immersivePreset.padding).toBeGreaterThan(detailPreset.padding);
    expect(immersivePreset.cameraVector[2]).toBeGreaterThan(
      detailPreset.cameraVector[2]
    );
  });

  test("applies a dedicated framing override to the K9 artillery model", () => {
    const defaultPreset = getViewFramingPreset({
      bundle: "artillery",
      profile: "defense",
      mode: "immersive",
      modelId: "artillery-thaad",
    });
    const k9Preset = getViewFramingPreset({
      bundle: "artillery",
      profile: "defense",
      mode: "immersive",
      modelId: "artillery-k9",
    });

    expect(k9Preset.padding).toBeGreaterThan(defaultPreset.padding);
    expect(k9Preset.focusHeight).toBeLessThan(defaultPreset.focusHeight);
    expect(k9Preset.modelRotation[2]).toBeCloseTo(Math.PI / 2);
    expect(k9Preset.modelOffset[1]).toBeGreaterThan(0);
    expect(k9Preset.exposureMultiplier).toBeGreaterThan(1);
    expect(k9Preset.rimLightMultiplier).toBeGreaterThan(1);
  });

  test("derives orbit limits from the fitted camera distance", () => {
    const distances = computeOrbitDistances({
      distance: 12,
      radius: 4,
      minDistanceFactor: 0.5,
      maxDistanceFactor: 2.7,
    });

    expect(distances.minDistance).toBeGreaterThanOrEqual(4 * 0.82);
    expect(distances.maxDistance).toBeGreaterThan(12);
  });

  test("applies a 180-degree facing correction to the KF-21 viewer model", () => {
    expect(getModelRotationOffset("aircraft-kf21")).toBeCloseTo(Math.PI);
    expect(getModelRotationOffset("aircraft-f15-strike")).toBe(0);
  });
});
