import { describe, expect, test } from "vitest";
import {
  ensureCesiumColorMaterialProperty,
  resolveEffectTimelineValue,
  resolveFocusFireImpactBoxState,
  resolveFocusCameraPreset,
  resolveWeaponModelProfile,
  sortPlacementUnitsForPanel,
} from "../../../../public/terrain-3d/placementRuntime.js";

describe("terrainPlacementRuntime", () => {
  test("sorts focused and selected units ahead of the rest", () => {
    const units = [
      {
        id: "facility-1",
        name: "K9 자주포 포대",
        entityType: "facility",
        sideName: "Blue",
        selected: false,
        focused: false,
      },
      {
        id: "aircraft-1",
        name: "KF-21 편대",
        entityType: "aircraft",
        sideName: "Blue",
        selected: false,
        focused: true,
      },
      {
        id: "ship-1",
        name: "독도함",
        entityType: "ship",
        sideName: "Blue",
        selected: true,
        focused: false,
      },
    ];

    const sorted = [...units].sort(sortPlacementUnitsForPanel);

    expect(sorted.map((unit) => unit.id)).toEqual([
      "aircraft-1",
      "ship-1",
      "facility-1",
    ]);
  });

  test("returns a tighter close-up preset for launcher-like ground units", () => {
    const preset = resolveFocusCameraPreset(
      {
        entityType: "facility",
        className: "Patriot Launcher",
        name: "패트리어트 포대",
        headingDeg: 30,
      },
      {
        uri: "/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb",
      },
      {
        altitudeMeters: 8,
      }
    );

    expect(preset.rangeMeters).toBe(185);
    expect(preset.pitchDeg).toBe(-44);
    expect(preset.headingDeg).toBe(168);
    expect(preset.targetHeightOffsetMeters).toBe(10);
  });

  test("increases aircraft focus range when altitude is high", () => {
    const lowAltitudePreset = resolveFocusCameraPreset(
      {
        entityType: "aircraft",
        className: "KF-21",
        name: "KF-21",
        headingDeg: 270,
      },
      null,
      {
        altitudeMeters: 400,
      }
    );
    const highAltitudePreset = resolveFocusCameraPreset(
      {
        entityType: "aircraft",
        className: "KF-21",
        name: "KF-21",
        headingDeg: 270,
      },
      null,
      {
        altitudeMeters: 3200,
      }
    );

    expect(highAltitudePreset.rangeMeters).toBeGreaterThan(
      lowAltitudePreset.rangeMeters
    );
    expect(lowAltitudePreset.headingDeg).toBe(42);
    expect(highAltitudePreset.pitchDeg).toBe(-14);
  });

  test("interpolates transient effect timelines with clamped progress", () => {
    const stops = [
      { at: 0, value: 0 },
      { at: 0.5, value: 10 },
      { at: 1, value: 0 },
    ];

    expect(resolveEffectTimelineValue(-1, stops)).toBe(0);
    expect(resolveEffectTimelineValue(0.5, stops)).toBe(10);
    expect(resolveEffectTimelineValue(2, stops)).toBe(0);
    expect(resolveEffectTimelineValue(0.25, stops)).toBeGreaterThan(0);
    expect(resolveEffectTimelineValue(0.25, stops)).toBeLessThan(10);
  });

  test("resolves visible 3D weapon models for shells and missiles", () => {
    const shellProfile = resolveWeaponModelProfile({
      modelId: "weapon-artillery-shell",
      className: "155mm Shell",
      name: "K9 포탄",
    });
    const missileProfile = resolveWeaponModelProfile({
      modelId: "weapon-air-to-air-missile",
      className: "AIM-120 AMRAAM",
      name: "AIM-120 AMRAAM",
    });

    expect(shellProfile.uri).toBe(
      "/3d-bundles/artillery/models/artillery_shell.glb"
    );
    expect(shellProfile.minimumPixelSize).toBeGreaterThanOrEqual(34);
    expect(missileProfile.uri).toBe("/3d-bundles/missile/aim-120c_amraam.glb");
    expect(missileProfile.minimumPixelSize).toBeGreaterThan(
      shellProfile.minimumPixelSize
    );
  });

  test("builds a focus-fire impact accumulation label", () => {
    const state = resolveFocusFireImpactBoxState(
      {
        focusFireSummary: {
          enabled: true,
          active: true,
          objectiveLatitude: 37.4,
          objectiveLongitude: 127.2,
          weaponsInFlight: 5,
          recommendation: {
            expectedStrikeEffect: 7.4,
          },
        },
      },
      3
    );

    expect(state).not.toBeNull();
    expect(state?.text).toContain("충격량 3.0");
    expect(state?.text).toContain("탄착 3 · 비행 5");
    expect(state?.text).toContain("예상 7.4");
  });

  test("wraps callback colors as Cesium material properties", () => {
    const colorCallbackProperty = {
      getValue: () => ({ red: 1, green: 0.5, blue: 0.25, alpha: 0.8 }),
    };
    class ColorMaterialProperty {
      color: unknown;

      constructor(color: unknown) {
        this.color = color;
      }

      getType() {
        return "Color";
      }
    }

    const materialProperty = ensureCesiumColorMaterialProperty(
      { ColorMaterialProperty },
      colorCallbackProperty
    );

    expect(materialProperty).toBeInstanceOf(ColorMaterialProperty);
    expect(materialProperty.color).toBe(colorCallbackProperty);
    expect(typeof materialProperty.getType).toBe("function");
  });
});
