import Scenario from "@/game/Scenario";

export type ScenarioLaunchMode = "2d" | "3d";

export function isScenarioAtLaunchBoundary(scenario: Scenario) {
  return scenario.currentTime <= scenario.startTime;
}

export function shouldRunScenarioImmediatelyAfterLaunchModeSelection(
  mode: ScenarioLaunchMode
) {
  return mode === "2d";
}

export function shouldPromptScenarioLaunchModeSelection(options: {
  scenario: Scenario;
  scenarioPaused: boolean;
}) {
  return options.scenarioPaused && isScenarioAtLaunchBoundary(options.scenario);
}
