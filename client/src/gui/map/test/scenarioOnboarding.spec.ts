import armyDemoScenarioJson from "@/scenarios/army_demo_1.json";
import blankScenarioJson from "@/scenarios/blank_scenario.json";
import Scenario from "@/game/Scenario";
import Game from "@/game/Game";
import { isScenarioEmptyForOnboarding } from "@/gui/map/scenarioOnboarding";

function createSeedGame() {
  return new Game(
    new Scenario({
      id: "seed-scenario",
      name: "seed",
      startTime: 0,
      duration: 1,
    })
  );
}

describe("scenario onboarding", () => {
  test("treats the blank starter scenario as empty", () => {
    const game = createSeedGame();

    game.loadScenario(JSON.stringify(blankScenarioJson));

    expect(isScenarioEmptyForOnboarding(game.currentScenario)).toBe(true);
  });

  test("does not treat the army demo as an empty starter scenario", () => {
    const game = createSeedGame();

    game.loadScenario(JSON.stringify(armyDemoScenarioJson));

    expect(isScenarioEmptyForOnboarding(game.currentScenario)).toBe(false);
  });
});
