import Scenario from "@/game/Scenario";

export function isScenarioEmptyForOnboarding(scenario: Scenario) {
  return (
    scenario.aircraft.length === 0 &&
    scenario.ships.length === 0 &&
    scenario.facilities.length === 0 &&
    scenario.airbases.length === 0 &&
    scenario.weapons.length === 0 &&
    scenario.referencePoints.length === 0 &&
    scenario.missions.length === 0
  );
}
