import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Facility from "@/game/units/Facility";
import { PRIORITY_ARTILLERY_BASE_OPTIONS } from "@/gui/map/toolbar/baseSelectionCatalog";
import { buildAdaptiveArtilleryPresetOptions } from "@/gui/map/toolbar/artilleryPresetRecommendations";

describe("artilleryPresetRecommendations", () => {
  test("reorients artillery presets toward the hostile threat axis", () => {
    const blue = new Side({ id: "blue", name: "BLUE", color: "blue" });
    const red = new Side({ id: "red", name: "RED", color: "red" });
    const hostileBattery = new Facility({
      id: "red-battery",
      name: "Red Battery",
      sideId: red.id,
      className: "S-400 Triumf",
      latitude: 37.75,
      longitude: 126.95,
      altitude: 0,
      range: 200,
      heading: 180,
      speed: 0,
      sideColor: "red",
      weapons: [],
    });
    const scenario = new Scenario({
      id: "scenario-1",
      name: "artillery recommendation test",
      startTime: 0,
      duration: 3600,
      sides: [blue, red],
      facilities: [hostileBattery],
    });

    const [recommended] = buildAdaptiveArtilleryPresetOptions(
      PRIORITY_ARTILLERY_BASE_OPTIONS.filter(
        (option) => option.key === "artillery-capital-brigade"
      ),
      scenario,
      blue.id
    );

    expect(recommended?.deploymentHeadingDegrees).toBeGreaterThan(0);
    expect(recommended?.deploymentHeadingDegrees).toBeLessThan(90);
    expect(recommended?.threatAxisLabel).toContain("현재 적 중심축");
    expect(recommended?.deploymentRecommendationLabel).toContain("자동 보정");
  });

  test("keeps static headings when no hostile side can be resolved", () => {
    const blue = new Side({ id: "blue", name: "BLUE", color: "blue" });
    const scenario = new Scenario({
      id: "scenario-2",
      name: "no hostile test",
      startTime: 0,
      duration: 3600,
      sides: [blue],
      facilities: [],
    });

    const [recommended] = buildAdaptiveArtilleryPresetOptions(
      PRIORITY_ARTILLERY_BASE_OPTIONS.filter(
        (option) => option.key === "artillery-capital-brigade"
      ),
      scenario,
      blue.id
    );

    expect(recommended?.deploymentHeadingDegrees).toBe(332);
    expect(recommended?.threatAxisLabel).toBeUndefined();
    expect(recommended?.deploymentRecommendationLabel).toBeUndefined();
  });
});
