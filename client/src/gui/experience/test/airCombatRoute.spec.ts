import {
  buildAirCombatTacticalRoute,
  type FocusFireAirwatchLaunchState,
} from "@/gui/experience/airCombatRoute";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";

describe("airCombatRoute", () => {
  test("keeps a selected aircraft asset on the air combat route", () => {
    const asset: AssetExperienceSummary = {
      kind: "aircraft",
      id: "aircraft-kf21-1",
      name: "KF-21 Alpha",
      className: "KF-21 Boramae",
      sideName: "BLUE",
      latitude: 37.51,
      longitude: 127.03,
      altitude: 2800,
      heading: 35,
      speed: 540,
      range: 24,
      currentFuel: 9200,
      maxFuel: 13200,
      weaponCount: 8,
    };

    const route = buildAirCombatTacticalRoute({ asset });

    expect(route.asset.id).toBe(asset.id);
    expect(route.profile).toBe("base");
    expect(route.operationMode).toBe("quick-scramble");
    expect(route.modelId).toBeTruthy();
  });

  test("builds a drone-watch route for unmanned launches", () => {
    const focusFire: FocusFireAirwatchLaunchState = {
      objectiveName: "강화 해안",
      objectiveLon: 126.48,
      objectiveLat: 37.71,
    };

    const route = buildAirCombatTacticalRoute({
      craft: "drone",
      focusFireAirwatch: focusFire,
    });

    expect(route.asset.kind).toBe("aircraft");
    expect(route.asset.className).toBe("MQ-9 Reaper");
    expect(route.profile).toBe("base");
    expect(route.operationMode).toBe("drone-watch");
  });

  test("prefers tracked aircraft from a battle snapshot", () => {
    const battleSpectator: FlightSimBattleSpectatorState = {
      schemaVersion: 1,
      scenarioId: "battle-live",
      scenarioName: "전장 관전자",
      currentTime: 0,
      currentSideId: "blue",
      currentSideName: "청군",
      selectedUnitId: "jet-1",
      centerLongitude: 127.04,
      centerLatitude: 37.52,
      units: [
        {
          id: "jet-1",
          name: "KF-21 #201",
          className: "KF-21 Boramae",
          entityType: "aircraft",
          modelId: "aircraft-kf21",
          profileHint: "base",
          groundUnit: false,
          sideId: "blue",
          sideName: "청군",
          sideColor: "blue",
          latitude: 37.52,
          longitude: 127.04,
          altitudeMeters: 3400,
          headingDeg: 22,
          speedKts: 540,
          weaponCount: 6,
          hpFraction: 0.96,
          damageFraction: 0.04,
          detectionRangeNm: 28,
          detectionArcDegrees: 360,
          detectionHeadingDeg: 22,
          engagementRangeNm: 26,
          currentFuel: 8200,
          maxFuel: 13200,
          fuelFraction: 0.62,
          route: [],
          desiredRoute: [],
          weaponInventory: [],
          statusFlags: [],
          selected: true,
          targetId: "red-1",
        },
      ],
      weapons: [],
      recentEvents: [],
      stats: {
        aircraft: 1,
        facilities: 0,
        airbases: 0,
        ships: 0,
        groundUnits: 0,
        weaponsInFlight: 0,
        sides: 2,
      },
      continueSimulation: true,
    };

    const route = buildAirCombatTacticalRoute({
      battleSpectator,
      craft: "kf21",
    });

    expect(route.asset.id).toBe("jet-1");
    expect(route.asset.name).toContain("KF-21");
    expect(route.profile).toBe("base");
    expect(route.modelId).toBe("aircraft-kf21");
  });

  test("keeps battle spectator routing when focus-fire airwatch is also provided", () => {
    const focusFire: FocusFireAirwatchLaunchState = {
      objectiveName: "서부 표적지",
      objectiveLon: 126.97,
      objectiveLat: 37.56,
    };
    const battleSpectator: FlightSimBattleSpectatorState = {
      schemaVersion: 1,
      scenarioId: "battle-with-focus-fire",
      scenarioName: "집중포격 관전",
      currentTime: 0,
      currentSideId: "blue",
      currentSideName: "청군",
      selectedUnitId: "uav-1",
      centerLongitude: 126.98,
      centerLatitude: 37.57,
      units: [
        {
          id: "uav-1",
          name: "MQ-9 #1",
          className: "MQ-9 Reaper",
          entityType: "aircraft",
          modelId: "aircraft-mq9",
          profileHint: "base",
          groundUnit: false,
          sideId: "blue",
          sideName: "청군",
          sideColor: "blue",
          latitude: 37.57,
          longitude: 126.98,
          altitudeMeters: 2400,
          headingDeg: 12,
          speedKts: 210,
          weaponCount: 4,
          hpFraction: 0.98,
          damageFraction: 0.02,
          detectionRangeNm: 18,
          detectionArcDegrees: 360,
          detectionHeadingDeg: 12,
          engagementRangeNm: 16,
          currentFuel: 3600,
          maxFuel: 4200,
          fuelFraction: 0.86,
          route: [],
          desiredRoute: [],
          weaponInventory: [],
          statusFlags: [],
          selected: true,
          targetId: "objective-1",
        },
      ],
      weapons: [],
      recentEvents: [],
      stats: {
        aircraft: 1,
        facilities: 0,
        airbases: 0,
        ships: 0,
        groundUnits: 0,
        weaponsInFlight: 0,
        sides: 2,
      },
      continueSimulation: false,
    };

    const route = buildAirCombatTacticalRoute({
      craft: "drone",
      focusFireAirwatch: focusFire,
      battleSpectator,
    });

    expect(route.asset.id).toBe("uav-1");
    expect(route.asset.name).toContain("MQ-9");
    expect(route.operationMode).toBe("drone-watch");
    expect(route.modelId).toBe("aircraft-mq9");
  });
});
