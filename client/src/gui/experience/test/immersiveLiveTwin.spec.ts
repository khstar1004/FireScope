import type { BattleSpectatorSnapshot } from "@/game/Game";
import { getBundleModelById } from "@/gui/experience/bundleModels";
import { buildImmersiveLiveTwinRuntime } from "@/gui/experience/immersiveLiveTwin";

function createSnapshot(): BattleSpectatorSnapshot {
  return {
    schemaVersion: 2,
    scenarioId: "immersive-live-twin",
    scenarioName: "Immersive Twin",
    currentTime: 1770000120,
    currentSideId: "blue-side",
    currentSideName: "청군",
    selectedUnitId: "ground-focus-1",
    centerLongitude: 127.04,
    centerLatitude: 37.52,
    units: [
      {
        id: "ground-focus-1",
        name: "K2 Spearhead",
        className: "K2 Black Panther",
        entityType: "facility",
        modelId: "tank-k2",
        profileHint: "ground",
        groundUnit: true,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.52,
        longitude: 127.04,
        altitudeMeters: 0,
        headingDeg: 82,
        speedKts: 18,
        weaponCount: 1,
        hpFraction: 0.94,
        damageFraction: 0.06,
        detectionRangeNm: 5,
        detectionArcDegrees: 120,
        detectionHeadingDeg: 82,
        engagementRangeNm: 3.2,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "main-gun",
            name: "120mm Shell",
            className: "120mm Shell",
            quantity: 16,
            maxQuantity: 20,
            modelId: "weapon-artillery-shell",
          },
        ],
        statusFlags: ["selected", "engaged", "ground-unit"],
        selected: true,
        targetId: "enemy-tank-1",
      },
      {
        id: "ground-wing-1",
        name: "K21 Wingman",
        className: "K21 Infantry Fighting Vehicle",
        entityType: "facility",
        modelId: "tank-k21",
        profileHint: "ground",
        groundUnit: true,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.525,
        longitude: 127.046,
        altitudeMeters: 0,
        headingDeg: 88,
        speedKts: 16,
        weaponCount: 1,
        hpFraction: 0.9,
        damageFraction: 0.1,
        detectionRangeNm: 4,
        detectionArcDegrees: 120,
        detectionHeadingDeg: 88,
        engagementRangeNm: 2.4,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "ifv-gun",
            name: "30mm Cannon",
            className: "30mm Cannon",
            quantity: 12,
            maxQuantity: 16,
          },
        ],
        statusFlags: ["ground-unit"],
        selected: false,
      },
      {
        id: "ground-c2-1",
        name: "Forward C2",
        className: "M577 Command Vehicle",
        entityType: "facility",
        modelId: "tank-m577",
        profileHint: "ground",
        groundUnit: true,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.528,
        longitude: 127.048,
        altitudeMeters: 0,
        headingDeg: 90,
        speedKts: 10,
        weaponCount: 0,
        hpFraction: 0.86,
        damageFraction: 0.14,
        detectionRangeNm: 3,
        detectionArcDegrees: 120,
        detectionHeadingDeg: 90,
        engagementRangeNm: 0,
        route: [],
        desiredRoute: [],
        weaponInventory: [],
        statusFlags: ["ground-unit", "empty-launcher"],
        selected: false,
      },
      {
        id: "enemy-tank-1",
        name: "Enemy MBT",
        className: "Tracked Armor",
        entityType: "facility",
        modelId: "tank-tracked-armor",
        profileHint: "ground",
        groundUnit: true,
        sideId: "red-side",
        sideName: "적군",
        sideColor: "red",
        latitude: 37.56,
        longitude: 127.08,
        altitudeMeters: 0,
        headingDeg: 270,
        speedKts: 12,
        weaponCount: 1,
        hpFraction: 0.8,
        damageFraction: 0.2,
        detectionRangeNm: 4,
        detectionArcDegrees: 120,
        detectionHeadingDeg: 270,
        engagementRangeNm: 2.8,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "enemy-gun",
            name: "120mm Shell",
            className: "120mm Shell",
            quantity: 10,
            maxQuantity: 20,
          },
        ],
        statusFlags: ["engaged", "ground-unit"],
        selected: false,
      },
    ],
    weapons: [
      {
        id: "weapon-1",
        name: "120mm Shell",
        className: "120mm Shell",
        modelId: "weapon-artillery-shell",
        launcherId: "ground-focus-1",
        launcherName: "K2 Spearhead",
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.53,
        longitude: 127.05,
        altitudeMeters: 0,
        launchLatitude: 37.52,
        launchLongitude: 127.04,
        launchAltitudeMeters: 0,
        headingDeg: 84,
        speedKts: 1200,
        hpFraction: 1,
        targetId: "enemy-tank-1",
      },
    ],
    recentEvents: [
      {
        id: "event-1",
        timestamp: 1770000118,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        type: "STRIKE_MISSION_SUCCESS",
        message: "Forward armor column is engaging.",
        actorId: "ground-focus-1",
        actorName: "K2 Spearhead",
        targetId: "enemy-tank-1",
        targetName: "Enemy MBT",
      },
    ],
    stats: {
      aircraft: 0,
      facilities: 4,
      airbases: 0,
      ships: 0,
      groundUnits: 4,
      weaponsInFlight: 1,
      sides: 2,
    },
  };
}

describe("immersive live twin", () => {
  test("projects a battle snapshot into a live digital twin board", () => {
    const runtime = buildImmersiveLiveTwinRuntime(
      createSnapshot(),
      {
        kind: "facility",
        id: "ground-focus-1",
        name: "K2 Spearhead",
        className: "K2 Black Panther",
        sideName: "청군",
        latitude: 37.52,
        longitude: 127.04,
        altitude: 0,
        weaponCount: 1,
      },
      "ground",
      getBundleModelById("tank-k2"),
      [
        getBundleModelById("tank-k2"),
        getBundleModelById("tank-k21"),
        getBundleModelById("tank-m577"),
      ].filter((model): model is NonNullable<typeof model> => model !== null),
      "breakthrough"
    );

    expect(runtime).not.toBeNull();
    expect(runtime?.lineup).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ground-focus-1",
          label: "K2 Spearhead",
          primary: true,
          status: "작전 수행",
        }),
        expect.objectContaining({
          id: "ground-c2-1",
          label: "Forward C2",
          status: "재무장",
        }),
      ])
    );
    expect(runtime?.comparisonSelections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "K21 Wingman" }),
        expect.objectContaining({ label: "Forward C2" }),
      ])
    );
    expect(runtime?.summary).toEqual(
      expect.objectContaining({
        headline: "K2 Spearhead 기동대",
      })
    );
    expect(runtime?.feed).toEqual(
      expect.objectContaining({
        sourceLabel: "LIVE SNAPSHOT",
        targetLabel: "Enemy MBT",
        eventHeadline: expect.stringContaining("Forward armor column"),
        metrics: expect.arrayContaining([
          expect.objectContaining({ label: "Weapons", value: "1" }),
        ]),
      })
    );
  });
});
