import Scenario from "@/game/Scenario";
import {
  isScenarioAtLaunchBoundary,
  shouldRunScenarioImmediatelyAfterLaunchModeSelection,
  shouldPromptScenarioLaunchModeSelection,
} from "@/gui/map/scenarioLaunchMode";

function createScenario() {
  return new Scenario({
    id: "launch-mode-scenario",
    name: "Launch Mode",
    startTime: 100,
    duration: 600,
  });
}

describe("scenario launch mode", () => {
  test("treats the initial timeline position as the launch boundary", () => {
    const scenario = createScenario();

    expect(isScenarioAtLaunchBoundary(scenario)).toBe(true);
  });

  test("does not treat an advanced timeline as the launch boundary", () => {
    const scenario = createScenario();
    scenario.currentTime = scenario.startTime + 30;

    expect(isScenarioAtLaunchBoundary(scenario)).toBe(false);
  });

  test("prompts for 2D or 3D only when the scenario is paused at launch", () => {
    const scenario = createScenario();

    expect(
      shouldPromptScenarioLaunchModeSelection({
        scenario,
        scenarioPaused: true,
      })
    ).toBe(true);

    expect(
      shouldPromptScenarioLaunchModeSelection({
        scenario,
        scenarioPaused: false,
      })
    ).toBe(false);

    scenario.currentTime = scenario.startTime + 1;

    expect(
      shouldPromptScenarioLaunchModeSelection({
        scenario,
        scenarioPaused: true,
      })
    ).toBe(false);
  });

  test("keeps 3D launch selection paused until the 3D page play button is pressed", () => {
    expect(shouldRunScenarioImmediatelyAfterLaunchModeSelection("2d")).toBe(
      true
    );
    expect(shouldRunScenarioImmediatelyAfterLaunchModeSelection("3d")).toBe(
      false
    );
  });
});
