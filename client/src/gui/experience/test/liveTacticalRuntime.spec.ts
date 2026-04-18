import { buildTacticalScenarioFromBattleSnapshot } from "@/gui/experience/liveTacticalRuntime";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";
import type { BattleSpectatorSnapshot } from "@/game/Game";

function createSnapshot(): BattleSpectatorSnapshot {
  return {
    schemaVersion: 2,
    scenarioId: "battle-demo",
    scenarioName: "Battle Demo",
    currentTime: 1770000120,
    currentSideId: "blue-side",
    currentSideName: "청군",
    selectedUnitId: "unit-blue-1",
    centerLongitude: 126.978,
    centerLatitude: 37.5665,
    units: [
      {
        id: "unit-blue-1",
        name: "KF-21 #201",
        className: "KF-21 Boramae",
        entityType: "aircraft",
        modelId: "aircraft-kf21",
        profileHint: "base",
        groundUnit: false,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.5665,
        longitude: 126.978,
        altitudeMeters: 8500,
        headingDeg: 88,
        speedKts: 340,
        weaponCount: 4,
        hpFraction: 0.92,
        damageFraction: 0.08,
        detectionRangeNm: 70,
        detectionArcDegrees: 360,
        detectionHeadingDeg: 88,
        engagementRangeNm: 45,
        currentFuel: 11200,
        maxFuel: 14000,
        fuelFraction: 0.8,
        route: [],
        desiredRoute: [
          {
            latitude: 37.61,
            longitude: 127.04,
            altitudeMeters: 8400,
          },
        ],
        weaponInventory: [
          {
            id: "aim-120",
            name: "AIM-120 AMRAAM",
            className: "AIM-120 AMRAAM",
            quantity: 4,
            maxQuantity: 4,
            modelId: "weapon-air-to-air-missile",
          },
        ],
        homeBaseId: "unit-blue-base",
        rtb: false,
        statusFlags: ["selected", "engaged"],
        selected: true,
        targetId: "unit-red-1",
      },
      {
        id: "unit-blue-base",
        name: "Suwon Airbase",
        className: "Airbase",
        entityType: "airbase",
        profileHint: "base",
        groundUnit: false,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.27,
        longitude: 127.01,
        altitudeMeters: 0,
        headingDeg: 0,
        speedKts: 0,
        weaponCount: 0,
        hpFraction: 1,
        damageFraction: 0,
        detectionRangeNm: 0,
        detectionArcDegrees: 360,
        detectionHeadingDeg: 0,
        engagementRangeNm: 0,
        route: [],
        desiredRoute: [],
        weaponInventory: [],
        aircraftCount: 8,
        statusFlags: [],
        selected: false,
      },
      {
        id: "unit-red-1",
        name: "Enemy Battery",
        className: "K9 Thunder",
        entityType: "facility",
        modelId: "artillery-k9",
        profileHint: "fires",
        groundUnit: false,
        sideId: "red-side",
        sideName: "적군",
        sideColor: "red",
        latitude: 37.61,
        longitude: 127.04,
        altitudeMeters: 0,
        headingDeg: 12,
        speedKts: 0,
        weaponCount: 8,
        hpFraction: 0.84,
        damageFraction: 0.16,
        detectionRangeNm: 35,
        detectionArcDegrees: 120,
        detectionHeadingDeg: 12,
        engagementRangeNm: 20,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "shell-1",
            name: "155mm Shell",
            className: "155mm Shell",
            quantity: 8,
            maxQuantity: 8,
            modelId: "weapon-artillery-shell",
          },
        ],
        statusFlags: ["engaged"],
        selected: false,
      },
    ],
    weapons: [],
    recentEvents: [],
    stats: {
      aircraft: 1,
      facilities: 1,
      airbases: 1,
      ships: 0,
      groundUnits: 0,
      weaponsInFlight: 0,
      sides: 2,
    },
  };
}

describe("live tactical runtime", () => {
  test("projects a battle snapshot into tactical runtime inputs", () => {
    const route: TacticalSimRoute = {
      asset: {
        kind: "aircraft",
        id: "unit-blue-1",
        name: "KF-21 #201",
        className: "KF-21 Boramae",
        sideName: "청군",
        latitude: 37.5665,
        longitude: 126.978,
        altitude: 8500,
        heading: 88,
        speed: 340,
        range: 70,
        weaponCount: 4,
      },
      profile: "base",
      operationMode: "base-defense",
    };

    const runtime = buildTacticalScenarioFromBattleSnapshot(
      createSnapshot(),
      route
    );

    expect(runtime.runtime).toEqual(
      expect.objectContaining({
        source: "battle-snapshot",
        focusUnitId: "unit-blue-1",
        focusSideId: "blue-side",
      })
    );
    expect(runtime.scenario.player).toEqual(
      expect.objectContaining({
        label: "KF-21 #201",
        ammoPrimary: 4,
        headingDeg: 88,
      })
    );
    expect(runtime.scenario.config.primaryWeapon.label).toBe("AIM-120 AMRAAM");
    expect(runtime.scenario.config.hostileContacts).toEqual([
      expect.objectContaining({
        id: "unit-red-1",
        label: "Enemy Battery",
        role: "화력 자산",
        domain: "ground",
      }),
    ]);
    expect(runtime.scenario.config.sites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "unit-blue-base",
          kind: "runway",
        }),
        expect.objectContaining({
          id: "unit-red-1-objective",
          kind: "objective",
        }),
      ])
    );
  });
});
