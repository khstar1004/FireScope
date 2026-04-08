import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Aircraft from "@/game/units/Aircraft";
import Facility from "@/game/units/Facility";
import Weapon from "@/game/units/Weapon";

function createFocusFireGame() {
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
  const strikeWeapon = new Weapon({
    id: "aircraft-weapon",
    launcherId: "aircraft-1",
    name: "AGM-65 Maverick",
    sideId: blueSide.id,
    className: "AGM-65 Maverick",
    latitude: 37.48,
    longitude: 127.05,
    altitude: 10000,
    heading: 90,
    speed: 600,
    currentFuel: 240,
    maxFuel: 240,
    fuelRate: 120,
    range: 100,
    sideColor: "blue",
    targetId: null,
    lethality: 0.7,
    maxQuantity: 2,
    currentQuantity: 2,
  });
  const artilleryWeapon = new Weapon({
    id: "artillery-weapon",
    launcherId: "facility-1",
    name: "Chunmoo Guided Rocket",
    sideId: blueSide.id,
    className: "Chunmoo Guided Rocket",
    latitude: 37.46,
    longitude: 127.02,
    altitude: 0,
    heading: 90,
    speed: 820,
    currentFuel: 220,
    maxFuel: 220,
    fuelRate: 120,
    range: 100,
    sideColor: "blue",
    targetId: null,
    lethality: 0.7,
    maxQuantity: 4,
    currentQuantity: 4,
  });
  const aircraft = new Aircraft({
    id: "aircraft-1",
    name: "KF-16 #1",
    sideId: blueSide.id,
    className: "KF-16",
    latitude: 37.48,
    longitude: 127.05,
    altitude: 10000,
    heading: 90,
    speed: 1303,
    currentFuel: 12000,
    maxFuel: 12000,
    fuelRate: 6700,
    range: 80,
    sideColor: "blue",
    weapons: [strikeWeapon],
    route: [],
    targetId: "",
  });
  const artillery = new Facility({
    id: "facility-1",
    name: "Chunmoo Battery",
    sideId: blueSide.id,
    className: "Chunmoo MRLS",
    latitude: 37.46,
    longitude: 127.02,
    altitude: 0,
    range: 80,
    heading: 0,
    speed: 12,
    route: [],
    sideColor: "blue",
    weapons: [artilleryWeapon],
  });
  const tank = new Facility({
    id: "facility-2",
    name: "K2 Platoon",
    sideId: blueSide.id,
    className: "K2 Black Panther",
    latitude: 37.44,
    longitude: 127.0,
    altitude: 0,
    range: 8,
    heading: 0,
    speed: 24,
    route: [],
    sideColor: "blue",
    weapons: [
      new Weapon({
        id: "tank-weapon",
        launcherId: "facility-2",
        name: "120mm Tank Round",
        sideId: blueSide.id,
        className: "120mm Tank Round",
        latitude: 37.44,
        longitude: 127.0,
        altitude: 0,
        heading: 0,
        speed: 2500,
        currentFuel: 36,
        maxFuel: 36,
        fuelRate: 36000,
        range: 100,
        sideColor: "blue",
        targetId: null,
        lethality: 0.62,
        maxQuantity: 8,
        currentQuantity: 8,
      }),
    ],
  });
  const scenario = new Scenario({
    id: "scenario-1",
    name: "Focus Fire Test",
    startTime: 0,
    currentTime: 0,
    duration: 3600,
    sides: [blueSide, redSide],
    relationships: new Relationships({}),
    aircraft: [aircraft],
    facilities: [artillery, tank],
    weapons: [],
    referencePoints: [],
  });
  const game = new Game(scenario);
  game.currentSideId = blueSide.id;

  return { game, aircraft, artillery, tank };
}

describe("focus fire mode", () => {
  test("creates a shared objective and launches available air and fires assets", () => {
    const { game, aircraft, artillery } = createFocusFireGame();

    const objective = game.setFocusFireObjective(37.5, 127.1);
    game.updateFocusFireOperation();
    aircraft.latitude = 37.61;
    aircraft.longitude = 127.21;
    const summary = game.getFocusFireSummary();
    const aircraftTrack = summary.weaponTracks.find(
      (track) => track.launcherId === aircraft.id
    );
    const artilleryTrack = summary.weaponTracks.find(
      (track) => track.launcherId === artillery.id
    );

    expect(objective).toBeDefined();
    expect(game.currentScenario.referencePoints).toHaveLength(1);
    expect(
      game.currentScenario.weapons.some(
        (weapon) => weapon.targetId === objective?.id
      )
    ).toBe(true);
    expect(game.focusFireOperation.launchedPlatformIds).toEqual(
      expect.arrayContaining([aircraft.id, artillery.id])
    );
    expect(summary.launchPlatforms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: aircraft.id,
          launched: true,
          variant: "aircraft",
        }),
        expect.objectContaining({
          id: artillery.id,
          launched: true,
          variant: "artillery",
        }),
      ])
    );
    expect(summary.weaponsInFlight).toBe(summary.weaponTracks.length);
    expect(aircraftTrack).toEqual(
      expect.objectContaining({
        launcherId: aircraft.id,
        launcherLatitude: 37.48,
        launcherLongitude: 127.05,
        targetLatitude: objective?.latitude,
        targetLongitude: objective?.longitude,
        variant: "aircraft",
      })
    );
    expect(artilleryTrack).toEqual(
      expect.objectContaining({
        launcherId: artillery.id,
        launcherLatitude: 37.46,
        launcherLongitude: 127.02,
        targetLatitude: objective?.latitude,
        targetLongitude: objective?.longitude,
        variant: "artillery",
      })
    );
  });

  test("routes armor toward the objective, fires on arrival, and accumulates capture progress on contact", () => {
    const { game, tank } = createFocusFireGame();
    const objective = game.setFocusFireObjective(37.5, 127.1);

    game.updateFocusFireOperation();

    expect(tank.route).toHaveLength(1);

    tank.latitude = objective?.latitude ?? tank.latitude;
    tank.longitude = objective?.longitude ?? tank.longitude;
    tank.route = [];

    for (let step = 0; step < 4; step += 1) {
      game.updateFocusFireOperation();
    }

    expect(game.focusFireOperation.captureProgress).toBeGreaterThan(0);
    expect(game.focusFireOperation.launchedPlatformIds).toContain(tank.id);
  });

  test("does not launch artillery outside its firing sector", () => {
    const { game, artillery } = createFocusFireGame();
    const objective = game.setFocusFireObjective(37.5, 127.1);

    artillery.heading = 200;
    game.updateFocusFireOperation();

    expect(
      game.currentScenario.weapons.some(
        (weapon) =>
          weapon.launcherId === artillery.id &&
          weapon.targetId === objective?.id
      )
    ).toBe(false);
    expect(game.focusFireOperation.launchedPlatformIds).not.toContain(
      artillery.id
    );

    artillery.heading = 45;
    game.updateFocusFireOperation();

    expect(
      game.currentScenario.weapons.some(
        (weapon) =>
          weapon.launcherId === artillery.id &&
          weapon.targetId === objective?.id
      )
    ).toBe(true);
    expect(game.focusFireOperation.launchedPlatformIds).toContain(artillery.id);
  });
});
