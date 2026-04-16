import Game from "@/game/Game";
import Scenario from "@/game/Scenario";
import focusedTrainingDemoJson from "@/scenarios/focused_training_demo.json";

describe("preset scenarios", () => {
  test("loads the focused training demo without hostile strike logic", () => {
    const game = new Game(
      new Scenario({
        id: "seed-scenario",
        name: "seed",
        startTime: 0,
        duration: 1,
      })
    );

    game.loadScenario(JSON.stringify(focusedTrainingDemoJson));

    expect(game.currentScenario.name).toBe("가용화력자산");
    expect(game.currentSideId).toBe("focus-force");
    expect(game.currentScenario.sides).toHaveLength(2);
    expect(game.currentScenario.aircraft.length).toBeGreaterThanOrEqual(7);
    expect(
      game.currentScenario.aircraft.some(
        (aircraft) => aircraft.className === "TA-50 Lead-In Fighter Trainer"
      )
    ).toBe(true);
    expect(
      game.currentScenario.aircraft.filter(
        (aircraft) => aircraft.className === "KF-21 Boramae"
      ).length
    ).toBeGreaterThanOrEqual(3);
    expect(
      game.currentScenario.aircraft.some(
        (aircraft) => aircraft.className === "MQ-9 Reaper"
      )
    ).toBe(true);
    expect(
      game.currentScenario.facilities.some(
        (facility) => facility.name === "영향권 중심"
      )
    ).toBe(true);
    expect(
      game.currentScenario.facilities.some(
        (facility) => facility.className === "L-SAM"
      )
    ).toBe(true);
    expect(
      game.currentScenario.facilities.filter(
        (facility) => facility.className === "K2 Black Panther"
      ).length
    ).toBeGreaterThanOrEqual(5);
    expect(game.currentScenario.getAircraft("kf21-201")?.speed).toBe(340);
    expect(
      game.currentScenario
        .getAircraft("kf21-201")
        ?.weapons.find((weapon) => weapon.id === "kf21-aim120")?.speed
    ).toBe(600);
    expect(
      game.currentScenario
        .getFacility("tactical-charlie")
        ?.weapons.find((weapon) => weapon.id === "tactical-charlie-missile")
        ?.speed
    ).toBe(500);
    expect(game.currentScenario.getFacility("chunmoo-alpha")?.heading).toBe(350);
    expect(game.currentScenario.getFacility("chunmoo-alpha")?.detectionArcDegrees).toBe(170);
    expect(game.currentScenario.getFacility("tactical-charlie")?.heading).toBe(22);
    expect(game.currentScenario.getFacility("tactical-charlie")?.detectionArcDegrees).toBe(140);
    expect(game.currentScenario.relationships.hostiles["focus-force"]).toEqual(
      []
    );
    expect(
      game.currentScenario.getSideDoctrine("focus-force")[
        "Aircraft attack hostile aircraft"
      ]
    ).toBe(false);
  });
});
