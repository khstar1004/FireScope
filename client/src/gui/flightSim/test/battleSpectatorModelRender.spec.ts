import { describe, expect, test } from "vitest";
import {
  buildUnitModelRenderContext,
  hasGroundModelBudget,
  resolveDisplayedUnitPoint,
  resolveUnitModelRenderProfile,
} from "../../../../flight-sim-source/src/systems/battleSpectatorModelRender";

describe("battle spectator model rendering", () => {
  test("counts only army and facility units against the ground model budget", () => {
    const renderContext = buildUnitModelRenderContext([
      { entityType: "aircraft" },
      { entityType: "facility" },
      { entityType: "army" },
      { entityType: "ship" },
    ]);

    expect(renderContext.groundModelCandidateCount).toBe(2);
    expect(hasGroundModelBudget(renderContext, 2)).toBe(true);
    expect(hasGroundModelBudget(renderContext, 1)).toBe(false);
  });

  test("keeps tactical ground models visible even when their true scale is tiny", () => {
    const profile = resolveUnitModelRenderProfile(
      {
        uri: "/3d-bundles/tank/models/k2_black_panther_tank.glb",
        scale: 0.0001,
        minimumPixelSize: 2,
        maximumScale: 6,
      },
      {
        entityType: "facility",
        selected: false,
      },
      {
        cameraProfile: "tactical",
        lodLevel: "balanced",
      }
    );

    expect(profile?.scale).toBe(0.0001);
    expect(profile?.minimumPixelSize).toBe(14);
    expect(profile?.maximumScale).toBe(260);
  });

  test("gives emphasized tactical aircraft extra headroom in overview mode", () => {
    const profile = resolveUnitModelRenderProfile(
      {
        uri: "/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb",
        scale: 0.22,
        minimumPixelSize: 10,
        maximumScale: 36,
      },
      {
        entityType: "aircraft",
        selected: true,
      },
      {
        cameraProfile: "tactical",
        lodLevel: "balanced",
        emphasized: true,
      }
    );

    expect(profile?.minimumPixelSize).toBe(22);
    expect(profile?.maximumScale).toBeCloseTo(243, 6);
  });

  test("gives tracked ground models extra headroom in orbit mode", () => {
    const profile = resolveUnitModelRenderProfile(
      {
        uri: "/3d-bundles/tank/models/k2_black_panther_tank.glb",
        scale: 7.344418556801542,
        minimumPixelSize: 2,
        maximumScale: 6,
      },
      {
        entityType: "facility",
        selected: false,
      },
      {
        cameraProfile: "orbit",
        lodLevel: "balanced",
        emphasized: true,
      }
    );

    expect(profile?.minimumPixelSize).toBe(20);
    expect(profile?.maximumScale).toBeCloseTo(112.2, 6);
  });

  test("makes actively tracked chase targets read larger on screen", () => {
    const profile = resolveUnitModelRenderProfile(
      {
        uri: "/3d-bundles/tank/models/k2_black_panther_tank.glb",
        scale: 7.344418556801542,
        minimumPixelSize: 2,
        maximumScale: 6,
      },
      {
        entityType: "facility",
        selected: false,
      },
      {
        cameraProfile: "chase",
        lodLevel: "balanced",
        emphasized: true,
        tracked: true,
      }
    );

    expect(profile?.minimumPixelSize).toBe(30);
    expect(profile?.maximumScale).toBeCloseTo(151.47, 6);
  });

  test("spreads clustered ground units and lifts them above terrain", () => {
    const renderContext = buildUnitModelRenderContext([
      {
        id: "facility-1",
        entityType: "facility",
        groundUnit: true,
        sideId: "blue",
        latitude: 37.5,
        longitude: 127,
        altitudeMeters: 0,
        name: "K9 포대 1",
        weaponCount: 6,
      },
      {
        id: "facility-2",
        entityType: "facility",
        groundUnit: true,
        sideId: "blue",
        latitude: 37.5,
        longitude: 127,
        altitudeMeters: 0,
        name: "K9 포대 2",
        weaponCount: 4,
      },
    ]);

    const anchorPoint = resolveDisplayedUnitPoint(
      {
        id: "facility-1",
        entityType: "facility",
        groundUnit: true,
        sideId: "blue",
        latitude: 37.5,
        longitude: 127,
        altitudeMeters: 0,
      },
      renderContext
    );
    const offsetPoint = resolveDisplayedUnitPoint(
      {
        id: "facility-2",
        entityType: "facility",
        groundUnit: true,
        sideId: "blue",
        latitude: 37.5,
        longitude: 127,
        altitudeMeters: 0,
      },
      renderContext
    );

    expect(anchorPoint.altitudeMeters).toBeGreaterThan(2);
    expect(offsetPoint.altitudeMeters).toBeGreaterThan(2);
    expect(offsetPoint.longitude).not.toBe(127);
    expect(offsetPoint.latitude).not.toBe(37.5);
  });
});
