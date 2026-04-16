import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import {
  createTacticalExperienceScenario,
  localPointToLonLat,
  lonLatToLocalPoint,
  normalizeHeading,
} from "@/gui/experience/tacticalExperience";

describe("tacticalExperience", () => {
  test("creates a ground scenario with mobile hostile armor and mapped controls", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "facility-ground-1",
      name: "K2 Black Panther",
      className: "K2 MBT",
      sideName: "BLUE",
      latitude: 37.52,
      longitude: 127.03,
      altitude: 120,
      heading: 405,
      speed: 38,
      range: 4,
      weaponCount: 1,
    };

    const scenario = createTacticalExperienceScenario(asset, "ground");

    expect(scenario.player.headingDeg).toBe(45);
    expect(scenario.config.modeTitle).toContain("시뮬레이터");
    expect(scenario.config.hostileContacts.length).toBeGreaterThanOrEqual(3);
    expect(scenario.config.controls).toContain("`F`: 전차포 발사");
    expect(scenario.config.primaryWeapon.kind).toBe("shell");
    expect(scenario.config.supportWeapon.homing).toBe(true);
  });

  test("creates a defense scenario with airborne threats and interceptor weapons", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "facility-defense-1",
      name: "L-SAM Battery",
      className: "L-SAM",
      sideName: "BLUE",
      latitude: 37.4,
      longitude: 126.9,
      altitude: 210,
      range: 120,
      weaponCount: 4,
    };

    const scenario = createTacticalExperienceScenario(asset, "defense");

    expect(scenario.config.sensorRangeM).toBeLessThanOrEqual(9500);
    expect(
      scenario.config.hostileContacts.some((contact) => contact.domain === "air")
    ).toBe(true);
    expect(scenario.config.primaryWeapon.kind).toBe("interceptor");
    expect(scenario.config.supportWeapon.kind).toBe("missile");
  });

  test("round trips local coordinates through lon/lat conversion", () => {
    const origin = { lon: 127.031, lat: 37.519 };
    const point = { x: 1530, y: -870 };

    const lonLat = localPointToLonLat(origin, point);
    const projectedBack = lonLatToLocalPoint(origin, lonLat);

    expect(projectedBack.x).toBeCloseTo(point.x, 4);
    expect(projectedBack.y).toBeCloseTo(point.y, 4);
  });

  test("normalizes headings into the 0-359 band", () => {
    expect(normalizeHeading(-90)).toBe(270);
    expect(normalizeHeading(720)).toBe(0);
    expect(normalizeHeading(361.5)).toBeCloseTo(1.5);
  });
});
