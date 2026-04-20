import Game from "@/game/Game";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Facility from "@/game/units/Facility";
import {
  getScenarioFacilityPlacementGroups,
  setScenarioFacilityPlacementGroups,
} from "@/game/facilityPlacementGroups";

describe("facility placement group metadata", () => {
  test("preserves artillery placement groups through export and reload", () => {
    const blue = new Side({ id: "blue", name: "BLUE", color: "blue" });
    const facilityA = new Facility({
      id: "facility-a",
      name: "Battery A",
      sideId: blue.id,
      className: "Chunmoo MRLS",
      latitude: 37.5,
      longitude: 126.9,
      altitude: 0,
      range: 80,
      heading: 320,
      speed: 0,
      sideColor: "blue",
      weapons: [],
    });
    const facilityB = new Facility({
      id: "facility-b",
      name: "Battery B",
      sideId: blue.id,
      className: "Chunmoo MRLS",
      latitude: 37.6,
      longitude: 127.0,
      altitude: 0,
      range: 80,
      heading: 320,
      speed: 0,
      sideColor: "blue",
      weapons: [],
    });
    const scenario = new Scenario({
      id: "scenario-1",
      name: "metadata persistence",
      startTime: 0,
      duration: 3600,
      sides: [blue],
      facilities: [facilityA, facilityB],
    });
    scenario.metadata = setScenarioFacilityPlacementGroups(
      scenario.metadata,
      [
        {
          id: "group-alpha",
          label: "천무 · 기본 2포대 분산",
          facilityIds: [facilityA.id, facilityB.id],
          createdAt: 100,
        },
      ],
      scenario.facilities.map((facility) => facility.id)
    );

    const game = new Game(scenario);
    const exportedScenario = game.exportCurrentScenario();
    const reloadedGame = new Game(
      new Scenario({
        id: "scenario-2",
        name: "reloaded",
        startTime: 0,
        duration: 3600,
        sides: [blue],
      })
    );

    reloadedGame.loadScenario(exportedScenario);

    expect(
      getScenarioFacilityPlacementGroups(
        reloadedGame.currentScenario.metadata,
        reloadedGame.currentScenario.facilities.map((facility) => facility.id)
      )
    ).toEqual([
      {
        id: "group-alpha",
        label: "천무 · 기본 2포대 분산",
        facilityIds: [facilityA.id, facilityB.id],
        createdAt: 100,
      },
    ]);
  });

  test("drops stale facility ids when a saved group is reloaded", () => {
    const blue = new Side({ id: "blue", name: "BLUE", color: "blue" });
    const facilityA = new Facility({
      id: "facility-a",
      name: "Battery A",
      sideId: blue.id,
      className: "Chunmoo MRLS",
      latitude: 37.5,
      longitude: 126.9,
      altitude: 0,
      range: 80,
      heading: 320,
      speed: 0,
      sideColor: "blue",
      weapons: [],
    });
    const scenario = new Scenario({
      id: "scenario-3",
      name: "stale metadata",
      startTime: 0,
      duration: 3600,
      sides: [blue],
      facilities: [facilityA],
    });
    const game = new Game(scenario);

    game.loadScenario(
      JSON.stringify({
        currentScenario: {
          ...scenario,
          metadata: {
            ui: {
              facilityPlacementGroups: [
                {
                  id: "group-stale",
                  label: "stale",
                  facilityIds: [facilityA.id, "missing-id"],
                  createdAt: 1,
                },
              ],
            },
          },
        },
        currentSideId: blue.id,
        selectedUnitId: "",
        mapView: game.mapView,
        simulationLogs: [],
      })
    );

    expect(
      getScenarioFacilityPlacementGroups(
        game.currentScenario.metadata,
        game.currentScenario.facilities.map((facility) => facility.id)
      )
    ).toEqual([]);
  });
});
