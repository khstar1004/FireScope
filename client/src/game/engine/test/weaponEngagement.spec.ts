import { describe, expect, test } from "vitest";

import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Aircraft from "@/game/units/Aircraft";
import Facility from "@/game/units/Facility";
import SimulationLogs from "@/game/log/SimulationLogs";
import Weapon from "@/game/units/Weapon";
import { launchWeapon, weaponEndgame } from "@/game/engine/weaponEngagement";

describe("weaponEngagement HP combat", () => {
  test("starts launched weapons at the launcher before their first flight step", () => {
    const blueSide = new Side({
      id: "blue-side",
      name: "BLUE",
      color: "blue",
    });
    const redSide = new Side({
      id: "red-side",
      name: "RED",
      color: "red",
    });
    const launchedWeapon = new Weapon({
      id: "blue-rocket",
      launcherId: "blue-launcher",
      name: "Guided Rocket",
      sideId: blueSide.id,
      className: "Guided Rocket",
      latitude: 0,
      longitude: 0,
      altitude: 0,
      heading: 90,
      speed: 90,
      currentFuel: 120,
      maxFuel: 120,
      fuelRate: 60,
      range: 100,
      sideColor: "blue",
      targetId: null,
      lethality: 0.65,
      maxQuantity: 2,
      currentQuantity: 2,
    });
    const launcher = new Aircraft({
      id: "blue-launcher",
      name: "Blue Launcher",
      sideId: blueSide.id,
      className: "F-15E",
      latitude: 34.45,
      longitude: 127.56,
      altitude: 10000,
      heading: 90,
      speed: 600,
      currentFuel: 18000,
      maxFuel: 18000,
      fuelRate: 6700,
      range: 40,
      sideColor: "blue",
      weapons: [launchedWeapon],
      targetId: "",
    });
    const target = new Facility({
      id: "red-sam-site",
      name: "SAM Site",
      sideId: redSide.id,
      className: "SAM Site",
      latitude: 34.38,
      longitude: 127.42,
      altitude: 0,
      range: 25,
      sideColor: "red",
      weapons: [],
    });
    const scenario = new Scenario({
      id: "launch-position",
      name: "Launch Position",
      startTime: 0,
      duration: 3600,
      sides: [blueSide, redSide],
      aircraft: [launcher],
      facilities: [target],
    });
    const simulationLogs = new SimulationLogs();

    launchWeapon(
      scenario,
      launcher,
      target,
      launchedWeapon,
      1,
      simulationLogs
    );

    expect(scenario.weapons).toHaveLength(1);
    expect(scenario.weapons[0]).toEqual(
      expect.objectContaining({
        launcherId: launcher.id,
        launchLatitude: launcher.latitude,
        launchLongitude: launcher.longitude,
        launchAltitude: launcher.altitude,
        targetId: target.id,
      })
    );
    expect(scenario.weapons[0].latitude).toBeCloseTo(launcher.latitude);
    expect(scenario.weapons[0].longitude).toBeCloseTo(launcher.longitude);
  });

  test("keeps the target alive until cumulative damage depletes HP", () => {
    const blueSide = new Side({
      id: "blue-side",
      name: "BLUE",
      color: "blue",
    });
    const redSide = new Side({
      id: "red-side",
      name: "RED",
      color: "red",
    });
    const launcher = new Aircraft({
      id: "blue-striker-1",
      name: "Blue Striker",
      sideId: blueSide.id,
      className: "F-15E",
      latitude: 34.45,
      longitude: 127.56,
      altitude: 10000,
      heading: 90,
      speed: 600,
      currentFuel: 18000,
      maxFuel: 18000,
      fuelRate: 6700,
      range: 40,
      sideColor: "blue",
      weapons: [],
      targetId: "",
    });
    const target = new Facility({
      id: "red-sam-site",
      name: "SAM Site",
      sideId: redSide.id,
      className: "SAM Site",
      latitude: 34.38,
      longitude: 127.42,
      altitude: 0,
      range: 25,
      sideColor: "red",
      weapons: [],
      maxHp: 120,
      currentHp: 120,
      defense: 15,
    });
    const scenario = new Scenario({
      id: "hp-combat",
      name: "HP Combat",
      startTime: 0,
      duration: 3600,
      sides: [blueSide, redSide],
      aircraft: [launcher],
      facilities: [target],
    });
    const simulationLogs = new SimulationLogs();

    const firstWeapon = new Weapon({
      id: "blue-weapon-1",
      launcherId: launcher.id,
      name: "AGM-65D Maverick #1",
      sideId: blueSide.id,
      className: "AGM-65D Maverick",
      latitude: launcher.latitude,
      longitude: launcher.longitude,
      altitude: 10000,
      heading: 90,
      speed: 540,
      currentFuel: 30,
      maxFuel: 30,
      fuelRate: 300,
      range: 54,
      route: [[target.latitude, target.longitude]],
      sideColor: "blue",
      targetId: target.id,
      lethality: 0.95,
      attackPower: 75,
      maxQuantity: 1,
      currentQuantity: 1,
    });
    scenario.weapons.push(firstWeapon);

    expect(
      weaponEndgame(scenario, firstWeapon, target, simulationLogs)
    ).toBeFalsy();
    expect(target.currentHp).toBe(60);
    expect(scenario.getFacility(target.id)).toBe(target);
    expect(simulationLogs.getLogs()[0]?.message).toContain("잔여 HP 60/120");

    const secondWeapon = new Weapon({
      id: "blue-weapon-2",
      launcherId: launcher.id,
      name: "AGM-65D Maverick #2",
      sideId: blueSide.id,
      className: "AGM-65D Maverick",
      latitude: launcher.latitude,
      longitude: launcher.longitude,
      altitude: 10000,
      heading: 90,
      speed: 540,
      currentFuel: 30,
      maxFuel: 30,
      fuelRate: 300,
      range: 54,
      route: [[target.latitude, target.longitude]],
      sideColor: "blue",
      targetId: target.id,
      lethality: 0.95,
      attackPower: 75,
      maxQuantity: 1,
      currentQuantity: 1,
    });
    scenario.weapons.push(secondWeapon);

    expect(weaponEndgame(scenario, secondWeapon, target, simulationLogs)).toBeTruthy();
    expect(target.currentHp).toBe(0);
    expect(scenario.getFacility(target.id)).toBeUndefined();
    expect(simulationLogs.getLogs()[1]?.message).toContain("명중시켜 파괴");
  });
});
