import Game from "@/game/Game";
import Scenario from "@/game/Scenario";
import focusFireEconomyDemo from "@/scenarios/focusFireEconomyDemo";
import focusedTrainingDemoJson from "@/scenarios/focused_training_demo.json";
import rlBattleOptimizationDemoJson from "@/scenarios/rl_battle_optimization_demo.json";
import rlFirstSuccessDemoJson from "@/scenarios/rl_first_success_demo.json";

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
    expect(
      game.currentScenario
        .getFacility("chunmoo-alpha")
        ?.weapons.find((weapon) => weapon.id === "chunmoo-alpha-guided")
        ?.speed
    ).toBe(90);
    expect(
      game.currentScenario
        .getFacility("chunmoo-alpha")
        ?.weapons.find((weapon) => weapon.id === "chunmoo-alpha-ksrr")?.speed
    ).toBe(70);
    expect(
      game.currentScenario
        .getFacility("chunmoo-bravo")
        ?.weapons.find((weapon) => weapon.id === "chunmoo-bravo-guided")
        ?.speed
    ).toBe(90);
    expect(
      game.currentScenario
        .getFacility("chunmoo-bravo")
        ?.weapons.find((weapon) => weapon.id === "chunmoo-bravo-ksrr")?.speed
    ).toBe(70);
    expect(game.currentScenario.getFacility("chunmoo-alpha")?.heading).toBe(
      350
    );
    expect(
      game.currentScenario.getFacility("chunmoo-alpha")?.detectionArcDegrees
    ).toBe(170);
    expect(game.currentScenario.getFacility("tactical-charlie")?.heading).toBe(
      22
    );
    expect(
      game.currentScenario.getFacility("tactical-charlie")?.detectionArcDegrees
    ).toBe(140);
    expect(game.currentScenario.relationships.hostiles["focus-force"]).toEqual(
      []
    );
    expect(
      game.currentScenario.getSideDoctrine("focus-force")[
        "Aircraft attack hostile aircraft"
      ]
    ).toBe(false);
  });

  test("loads the RL first success demo with an in-range strike layout", () => {
    const game = new Game(
      new Scenario({
        id: "seed-scenario",
        name: "seed",
        startTime: 0,
        duration: 1,
      })
    );

    game.loadScenario(JSON.stringify(rlFirstSuccessDemoJson));

    expect(game.currentScenario.name).toBe("RL 첫 체감 데모");
    expect(game.currentSideId).toBe("blue-side");
    expect(game.currentScenario.aircraft).toHaveLength(2);
    expect(game.currentScenario.airbases).toHaveLength(1);
    expect(game.currentScenario.facilities).toHaveLength(0);
    expect(game.currentScenario.getAirbase("red-airbase")?.name).toBe(
      "Red Airbase"
    );
    expect(
      game.currentScenario.aircraft.every(
        (aircraft) => aircraft.getTotalWeaponQuantity() >= 2
      )
    ).toBe(true);
  });

  test("loads the RL battle optimization demo with a defended target layout", () => {
    const game = new Game(
      new Scenario({
        id: "seed-scenario",
        name: "seed",
        startTime: 0,
        duration: 1,
      })
    );

    game.loadScenario(JSON.stringify(rlBattleOptimizationDemoJson));

    expect(game.currentScenario.name).toBe("RL 전투·배치 최적화 데모");
    expect(game.currentSideId).toBe("blue-side");
    expect(game.currentScenario.aircraft).toHaveLength(2);
    expect(game.currentScenario.facilities).toHaveLength(1);
    expect(game.currentScenario.airbases).toHaveLength(1);
    expect(game.currentScenario.getFacility("red-sam-site")?.name).toBe(
      "SAM Site Alpha"
    );
    expect(
      game.currentScenario.getFacility("red-sam-site")?.getTotalWeaponQuantity()
    ).toBeGreaterThanOrEqual(1);
    expect(game.currentScenario.getAirbase("red-airbase")?.name).toBe(
      "Red Airbase"
    );
  });

  test("loads the focus-fire economy demo with 3/5/8 artillery cells", () => {
    const game = new Game(
      new Scenario({
        id: "seed-scenario",
        name: "seed",
        startTime: 0,
        duration: 1,
      })
    );

    game.loadScenario(JSON.stringify(focusFireEconomyDemo));

    expect(game.currentScenario.name).toBe("화력 배치 경제성 비교");
    expect(game.currentSideId).toBe("battery-cell-5");
    expect(game.currentScenario.sides).toHaveLength(4);
    expect(
      game.currentScenario.facilities.filter(
        (facility) => facility.sideId === "battery-cell-3"
      )
    ).toHaveLength(3);
    expect(
      game.currentScenario.facilities.filter(
        (facility) => facility.sideId === "battery-cell-5"
      )
    ).toHaveLength(5);
    expect(
      game.currentScenario.facilities.filter(
        (facility) => facility.sideId === "battery-cell-8"
      )
    ).toHaveLength(8);
    expect(game.currentScenario.getFacility("economic-target-command")?.name).toBe(
      "표적 지휘소"
    );
    expect(
      game.currentScenario.relationships.getHostiles("battery-cell-5")
    ).toEqual(["target-cell"]);
    expect(game.currentScenario.relationships.getAllies("battery-cell-5")).toEqual(
      expect.arrayContaining(["battery-cell-3", "battery-cell-8"])
    );
    expect(
      game.currentScenario
        .getFacility("battery-cell-5-battery-1")
        ?.weapons.at(0)?.currentQuantity
    ).toBe(1);
  });
});
