import { describe, expect, test } from "vitest";
import {
  ensureCesiumColorMaterialProperty,
  resolveEffectTimelineValue,
  resolveFocusFireImpactBoxState,
  resolveFocusCameraPreset,
  resolveModelAxisCorrectionProfile,
  resolveUnitModel,
  resolveUnitModelHeadingDeg,
  resolveUnitProxyDimensions,
  resolveUnitModelHeightReference,
  resolveUnitModelScreenSizing,
  resolveWeaponModelProfile,
  shouldRenderUnitModel,
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

  test("keeps in-flight weapon 3D models compact and close-range", () => {
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
    expect(shellProfile.minimumPixelSize).toBeLessThanOrEqual(12);
    expect(shellProfile.maximumScale).toBeLessThanOrEqual(34);
    expect(shellProfile.visibleDistanceMeters).toBe(1400);
    expect(missileProfile.uri).toBe("/3d-bundles/missile/aim-120c_amraam.glb");
    expect(missileProfile.minimumPixelSize).toBeGreaterThan(
      shellProfile.minimumPixelSize
    );
    expect(missileProfile.visibleDistanceMeters).toBeGreaterThan(
      shellProfile.visibleDistanceMeters
    );
  });

  test("marks source-axis GLB assets for Cesium root-node axis correction", () => {
    const km900Correction = resolveModelAxisCorrectionProfile(
      "/3d-bundles/tank/models/south_korean_km900_apc.glb"
    );
    const kf21Correction = resolveModelAxisCorrectionProfile(
      "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb"
    );

    expect(km900Correction).toEqual({
      nodeName: "Sketchfab_model",
      convention: "gltf-y-up-x-forward",
      upAxis: "Y",
      forwardAxis: "X",
    });
    expect(kf21Correction).toEqual({
      nodeName: "Sketchfab_model",
      convention: "gltf-y-up-y-forward",
      upAxis: "Y",
      forwardAxis: "Y",
    });
    expect(
      resolveModelAxisCorrectionProfile("/3d-bundles/drone/models/drone.glb")
    ).toEqual({
      nodeName: "Sketchfab_model",
      convention: "gltf-y-up-y-forward",
      upAxis: "Y",
      forwardAxis: "Y",
    });
  });

  test("applies source-forward heading offsets for Y-forward GLB assets", () => {
    expect(
      resolveUnitModelHeadingDeg(
        {
          entityType: "aircraft",
          className: "KF-21 Boramae",
          headingDeg: 104,
        },
        {
          uri: "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
        }
      )
    ).toBe(14);

    expect(
      resolveUnitModelHeadingDeg(
        {
          entityType: "facility",
          className: "M577 Command Vehicle",
          headingDeg: 18,
        },
        {
          uri: "/3d-bundles/tank/models/m577_command_vehicle.glb",
        }
      )
    ).toBe(18);
  });

  test("uses visible terrain GLBs for MQ-9 and Korean point-defense assets", () => {
    const droneModel = resolveUnitModel(
      {
        entityType: "aircraft",
        modelId: "drone-animated",
        className: "MQ-9 Reaper",
        name: "MQ-9 리퍼 #01",
      },
      {}
    );
    const bihoModel = resolveUnitModel(
      {
        entityType: "facility",
        className: "Biho Hybrid",
        name: "비호 복합 엄호대",
      },
      {
        groundModelCandidateCount: 1,
      }
    );
    const pegasusModel = resolveUnitModel(
      {
        entityType: "facility",
        className: "Pegasus (K-SAM)",
        name: "천마 엄호대",
      },
      {
        groundModelCandidateCount: 1,
      }
    );
    const cheongungModel = resolveUnitModel(
      {
        entityType: "facility",
        className: "Cheongung-II (KM-SAM Block II)",
        name: "천궁-II 방호권",
      },
      {
        groundModelCandidateCount: 1,
      }
    );

    expect(droneModel).toMatchObject({
      uri: "/3d-bundles/drone/models/drone.glb",
    });
    expect(droneModel?.scale).toBeGreaterThan(2);
    expect(bihoModel).toMatchObject({
      uri: "/3d-bundles/tank/models/m113a1.glb",
    });
    expect(pegasusModel).toMatchObject({
      uri: "/3d-bundles/tank/models/m113a1.glb",
    });
    expect(cheongungModel).toMatchObject({
      uri: "/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb",
    });
  });

  test("keeps selected ground models visible without clamping them to tiny scales", () => {
    const sizing = resolveUnitModelScreenSizing(
      {
        id: "ground-1",
        entityType: "facility",
        modelId: "tank-k2",
        className: "K2 tank",
      },
      {
        scale: 7.35,
        minimumPixelSize: 2,
        maximumScale: 6,
        uri: "/3d-bundles/tank/models/k2_black_panther_tank.glb",
      },
      true
    );

    expect(sizing.minimumPixelSize).toBeGreaterThanOrEqual(72);
    expect(sizing.maximumScale).toBeGreaterThanOrEqual(140);
  });

  test("keeps non-selected tank models readable in the terrain view", () => {
    const sizing = resolveUnitModelScreenSizing(
      {
        id: "ground-2",
        entityType: "facility",
        modelId: "tank-km900",
        className: "KM900 APC",
      },
      {
        scale: 0.008,
        minimumPixelSize: 2,
        maximumScale: 4,
        uri: "/3d-bundles/tank/models/south_korean_km900_apc.glb",
      },
      false
    );

    expect(sizing.minimumPixelSize).toBeGreaterThanOrEqual(22);
    expect(sizing.maximumScale).toBeGreaterThanOrEqual(54);
  });

  test("renders real GLB assets in overview and keeps proxy dimensions as fallback", () => {
    const aircraftDimensions = resolveUnitProxyDimensions(
      {
        entityType: "aircraft",
        className: "KF-21 Boramae",
      },
      null,
      false
    );
    const droneDimensions = resolveUnitProxyDimensions(
      {
        entityType: "aircraft",
        className: "MQ-9 Reaper",
      },
      null,
      false
    );

    expect(aircraftDimensions.y).toBeGreaterThan(300);
    expect(droneDimensions.x).toBeGreaterThan(150);
    expect(
      shouldRenderUnitModel(
        {
          entityType: "aircraft",
          selected: false,
        },
        {
          uri: "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
        },
        false
      )
    ).toBe(true);
    expect(
      shouldRenderUnitModel(
        {
          entityType: "aircraft",
          selected: false,
        },
        {
          uri: "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
        },
        true
      )
    ).toBe(true);
  });

  test("places ground models relative to terrain instead of clamping their model origin", () => {
    const Cesium = {
      HeightReference: {
        CLAMP_TO_GROUND: "clamp",
        NONE: "none",
        RELATIVE_TO_GROUND: "relative",
      },
    };

    expect(
      resolveUnitModelHeightReference(Cesium, {
        entityType: "facility",
        modelId: "tank-k2",
        groundUnit: true,
      })
    ).toBe("relative");
    expect(
      resolveUnitModelHeightReference(Cesium, {
        entityType: "aircraft",
      })
    ).toBe("none");
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
