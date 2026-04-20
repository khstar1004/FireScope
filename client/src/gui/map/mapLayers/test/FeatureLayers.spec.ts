import { describe, expect, test } from "vitest";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Facility from "@/game/units/Facility";
import Weapon from "@/game/units/Weapon";
import { WeaponTrajectoryLayer } from "@/gui/map/mapLayers/FeatureLayers";

function measureMaxLateralDeviation(coordinates: number[][]) {
  if (coordinates.length < 3) {
    return 0;
  }

  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];
  const chordX = end[0] - start[0];
  const chordY = end[1] - start[1];
  const chordLength = Math.hypot(chordX, chordY);
  if (chordLength < 1) {
    return 0;
  }

  return Math.max(
    ...coordinates.map(([x, y]) =>
      Math.abs(
        chordY * x - chordX * y + end[0] * start[1] - end[1] * start[0]
      ) / chordLength
    )
  );
}

function createScenarioWithTarget() {
  const blue = new Side({
    id: "blue-side",
    name: "BLUE",
    color: "blue",
  });
  const red = new Side({
    id: "red-side",
    name: "RED",
    color: "red",
  });
  const target = new Facility({
    id: "target-facility",
    name: "Enemy SAM",
    sideId: red.id,
    className: "Surface-to-Air Missile Site",
    latitude: 37.64,
    longitude: 127.18,
    altitude: 0,
    range: 20,
    heading: 0,
    speed: 0,
    route: [],
    sideColor: "red",
    weapons: [],
  });
  const scenario = new Scenario({
    id: "weapon-trajectory-test",
    name: "Weapon Trajectory Test",
    startTime: 0,
    currentTime: 60,
    duration: 3600,
    sides: [blue, red],
    relationships: new Relationships({
      hostiles: {
        [blue.id]: [red.id],
        [red.id]: [blue.id],
      },
    }),
    facilities: [target],
    weapons: [],
  });

  return { blue, scenario, target };
}

describe("WeaponTrajectoryLayer", () => {
  test("renders trajectories for missiles and guided rockets but excludes shells", () => {
    const { blue, scenario, target } = createScenarioWithTarget();
    const layer = new WeaponTrajectoryLayer();
    const missile = new Weapon({
      id: "aim-120-1",
      launcherId: "fighter-1",
      launchLatitude: 37.45,
      launchLongitude: 126.95,
      launchAltitude: 22000,
      name: "AIM-120 AMRAAM #1",
      sideId: blue.id,
      className: "AIM-120 AMRAAM",
      latitude: 37.53,
      longitude: 127.04,
      altitude: 18000,
      heading: 72,
      speed: 600,
      currentFuel: 40,
      maxFuel: 40,
      fuelRate: 120,
      range: 50,
      sideColor: "blue",
      targetId: target.id,
      lethality: 0.7,
      maxQuantity: 1,
      currentQuantity: 1,
    });
    const rocket = new Weapon({
      id: "rocket-1",
      launcherId: "battery-1",
      launchLatitude: 37.35,
      launchLongitude: 126.9,
      launchAltitude: 0,
      name: "130mm Guided Rocket-II #1",
      sideId: blue.id,
      className: "130mm Guided Rocket-II",
      latitude: 37.42,
      longitude: 127.0,
      altitude: 8000,
      heading: 60,
      speed: 500,
      currentFuel: 20,
      maxFuel: 20,
      fuelRate: 100,
      range: 40,
      sideColor: "blue",
      targetId: target.id,
      lethality: 0.7,
      maxQuantity: 1,
      currentQuantity: 1,
    });
    const shell = new Weapon({
      id: "shell-1",
      launcherId: "tank-1",
      launchLatitude: 37.38,
      launchLongitude: 126.88,
      launchAltitude: 0,
      name: "120mm Tank Round #1",
      sideId: blue.id,
      className: "120mm Tank Round",
      latitude: 37.4,
      longitude: 126.92,
      altitude: 0,
      heading: 48,
      speed: 90,
      currentFuel: 5,
      maxFuel: 5,
      fuelRate: 60,
      range: 5,
      sideColor: "blue",
      targetId: target.id,
      lethality: 0.35,
      maxQuantity: 1,
      currentQuantity: 1,
    });

    layer.refresh([missile, rocket, shell], scenario);

    expect(layer.featureCount).toBe(4);
    expect(
      layer.layerSource.getFeatures().map((feature) => feature.get("weaponId"))
    ).toEqual(
      expect.arrayContaining([missile.id, missile.id, rocket.id, rocket.id])
    );
    expect(
      layer.layerSource
        .getFeatures()
        .some((feature) => feature.get("weaponId") === shell.id)
    ).toBe(false);
  });

  test("falls back to weapon route when the target entity is unavailable", () => {
    const { blue, scenario } = createScenarioWithTarget();
    const layer = new WeaponTrajectoryLayer();
    const missile = new Weapon({
      id: "fallback-route-1",
      launcherId: "fighter-2",
      launchLatitude: 37.5,
      launchLongitude: 127.0,
      launchAltitude: 20000,
      name: "AGM-65D Maverick #1",
      sideId: blue.id,
      className: "AGM-65D Maverick",
      latitude: 37.56,
      longitude: 127.08,
      altitude: 15000,
      heading: 68,
      speed: 540,
      currentFuel: 30,
      maxFuel: 30,
      fuelRate: 120,
      range: 40,
      route: [[37.68, 127.22]],
      sideColor: "blue",
      targetId: "missing-target",
      lethality: 0.8,
      maxQuantity: 1,
      currentQuantity: 1,
    });

    layer.refresh([missile], scenario);

    expect(layer.featureCount).toBe(2);
    expect(
      layer.layerSource
        .getFeatures()
        .every((feature) => feature.get("weaponId") === missile.id)
    ).toBe(true);
  });

  test("keeps short-range projected trajectories close to the direct line in 2D", () => {
    const { blue, scenario } = createScenarioWithTarget();
    const layer = new WeaponTrajectoryLayer();
    const missile = new Weapon({
      id: "short-range-cleanup-1",
      launcherId: "launcher-1",
      launchLatitude: 37.61,
      launchLongitude: 127.145,
      launchAltitude: 0,
      name: "130mm Guided Rocket-II #2",
      sideId: blue.id,
      className: "130mm Guided Rocket-II",
      latitude: 37.615,
      longitude: 127.152,
      altitude: 2500,
      heading: 48,
      speed: 260,
      currentFuel: 12,
      maxFuel: 12,
      fuelRate: 60,
      range: 12,
      sideColor: "blue",
      targetId: "target-facility",
      lethality: 0.45,
      maxQuantity: 1,
      currentQuantity: 1,
    });

    layer.refresh([missile], scenario);

    const projectedFeature = layer.layerSource
      .getFeatures()
      .find((feature) => feature.get("trajectoryKind") === "projected");
    const projectedCoordinates = projectedFeature
      ?.getGeometry()
      ?.getCoordinates();

    expect(projectedCoordinates).toBeDefined();
    expect(measureMaxLateralDeviation(projectedCoordinates ?? [])).toBeLessThan(
      400
    );
  });
});
