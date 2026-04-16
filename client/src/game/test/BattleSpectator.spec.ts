import Game from "@/game/Game";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Aircraft from "@/game/units/Aircraft";
import Airbase from "@/game/units/Airbase";
import Facility from "@/game/units/Facility";
import Ship from "@/game/units/Ship";
import Weapon from "@/game/units/Weapon";
import { SimulationLogType } from "@/game/log/SimulationLogs";

describe("battle spectator snapshot", () => {
  test("builds a live snapshot with units, weapons, and recent events", () => {
    const blueSide = new Side({
      id: "blue-side",
      name: "청군",
      color: "blue",
    });
    const redSide = new Side({
      id: "red-side",
      name: "적군",
      color: "red",
    });
    const aircraft = new Aircraft({
      id: "aircraft-1",
      name: "KF-21 #201",
      sideId: blueSide.id,
      className: "KF-21 Boramae",
      latitude: 37.56,
      longitude: 126.98,
      altitude: 24000,
      heading: 82,
      speed: 340,
      currentFuel: 12000,
      maxFuel: 12000,
      fuelRate: 6700,
      range: 60,
      sideColor: "blue",
      weapons: [],
      route: [],
      targetId: "facility-1",
    });
    const facility = new Facility({
      id: "facility-1",
      name: "Enemy Battery",
      sideId: redSide.id,
      className: "K9 Thunder",
      latitude: 37.61,
      longitude: 127.03,
      altitude: 0,
      range: 40,
      heading: 10,
      speed: 0,
      route: [],
      sideColor: "red",
      weapons: [],
    });
    const airbase = new Airbase({
      id: "airbase-1",
      name: "Suwon Airbase",
      sideId: blueSide.id,
      className: "Airbase",
      latitude: 37.27,
      longitude: 127.01,
      altitude: 0,
      sideColor: "blue",
      aircraft: [],
    });
    const ship = new Ship({
      id: "ship-1",
      name: "Sejong Destroyer",
      sideId: blueSide.id,
      className: "Type 45 Destroyer",
      latitude: 37.4,
      longitude: 126.7,
      altitude: 0,
      heading: 120,
      speed: 22,
      currentFuel: 15000,
      maxFuel: 15000,
      fuelRate: 3000,
      range: 120,
      route: [],
      sideColor: "blue",
      weapons: [],
      aircraft: [],
    });
    const inFlightWeapon = new Weapon({
      id: "weapon-1",
      launcherId: aircraft.id,
      launchLatitude: aircraft.latitude,
      launchLongitude: aircraft.longitude,
      launchAltitude: aircraft.altitude,
      name: "AIM-120 AMRAAM #1",
      sideId: blueSide.id,
      className: "AIM-120 AMRAAM",
      latitude: 37.58,
      longitude: 127.0,
      altitude: 22000,
      heading: 85,
      speed: 600,
      currentFuel: 320,
      maxFuel: 320,
      fuelRate: 220,
      range: 100,
      sideColor: "blue",
      targetId: facility.id,
      lethality: 0.7,
      maxQuantity: 1,
      currentQuantity: 1,
    });

    const scenario = new Scenario({
      id: "battle-demo",
      name: "Battle Demo",
      startTime: 1770000000,
      currentTime: 1770000120,
      duration: 3600,
      sides: [blueSide, redSide],
      aircraft: [aircraft],
      facilities: [facility],
      airbases: [airbase],
      ships: [ship],
      weapons: [inFlightWeapon],
    });
    const game = new Game(scenario);
    game.currentSideId = blueSide.id;
    game.selectedUnitId = aircraft.id;
    game.mapView.currentCameraCenter = [126.99, 37.57];
    game.simulationLogs.addLog(
      blueSide.id,
      "KF-21 #201이(가) AIM-120을 발사했습니다.",
      scenario.currentTime,
      SimulationLogType.WEAPON_LAUNCHED,
      {
        actorId: aircraft.id,
        actorName: aircraft.name,
        weaponId: inFlightWeapon.id,
        targetId: facility.id,
        targetName: facility.name,
        resultTag: "launch",
      }
    );

    const snapshot = game.getBattleSpectatorSnapshot();

    expect(snapshot.scenarioId).toBe("battle-demo");
    expect(snapshot.currentSideName).toBe("청군");
    expect(snapshot.centerLongitude).toBe(126.99);
    expect(snapshot.centerLatitude).toBe(37.57);
    expect(snapshot.units).toHaveLength(4);
    expect(snapshot.weapons).toHaveLength(1);
    expect(snapshot.stats.weaponsInFlight).toBe(1);
    expect(
      snapshot.units.find((unit) => unit.id === aircraft.id)
    ).toEqual(
      expect.objectContaining({
        entityType: "aircraft",
        selected: true,
        targetId: facility.id,
      })
    );
    expect(snapshot.recentEvents).toEqual([
      expect.objectContaining({
        sideName: "청군",
        sideColor: "blue",
        actorId: aircraft.id,
        actorName: aircraft.name,
        sourceLatitude: aircraft.latitude,
        sourceLongitude: aircraft.longitude,
        targetId: facility.id,
        targetName: facility.name,
        targetLatitude: facility.latitude,
        targetLongitude: facility.longitude,
        resultTag: "launch",
      }),
    ]);
  });
});
