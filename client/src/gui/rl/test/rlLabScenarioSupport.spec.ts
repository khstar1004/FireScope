import {
  analyzeRlScenario,
  validateRlScenarioSelection,
} from "@/gui/rl/rlLabScenarioSupport";

describe("rlLabScenarioSupport", () => {
  test("builds beginner-friendly recommendations from a fixed target strike scenario", () => {
    const scenarioText = JSON.stringify({
      currentScenario: {
        name: "Fixed Target Strike Training",
        sides: [
          { id: "blue-side", name: "BLUE" },
          { id: "red-side", name: "RED" },
        ],
        aircraft: [
          {
            id: "blue-striker-1",
            name: "Blue Striker 1",
            sideId: "blue-side",
            weapons: [{ currentQuantity: 2 }],
          },
          {
            id: "blue-striker-2",
            name: "Blue Striker 2",
            sideId: "blue-side",
            weapons: [{ currentQuantity: 4 }],
          },
        ],
        facilities: [
          {
            id: "red-sam-site",
            name: "SAM Site Alpha",
            sideId: "red-side",
            className: "SAM Battery",
          },
        ],
        airbases: [
          {
            id: "red-airbase",
            name: "Red Airbase",
            sideId: "red-side",
            className: "Main Airbase",
          },
        ],
        ships: [],
      },
    });

    const analysis = analyzeRlScenario(scenarioText);

    expect(analysis.status).toBe("valid");
    expect(analysis.scenarioName).toBe("Fixed Target Strike Training");
    expect(analysis.recommendedControllableSideName).toBe("BLUE");
    expect(analysis.recommendedTargetSideName).toBe("RED");
    expect(analysis.recommendedAllyIds).toEqual([
      "blue-striker-2",
      "blue-striker-1",
    ]);
    expect(analysis.recommendedTargetIds).toEqual([
      "red-airbase",
      "red-sam-site",
    ]);
    expect(analysis.recommendedHighValueTargetIds).toEqual(["red-airbase"]);
    expect(
      validateRlScenarioSelection(analysis, {
        controllableSideName: "BLUE",
        targetSideName: "RED",
        allyIds: analysis.recommendedAllyIds,
        targetIds: analysis.recommendedTargetIds,
        highValueTargetIds: analysis.recommendedHighValueTargetIds,
      })
    ).toEqual([]);
  });

  test("ignores moving ships and caps recommendations to a small starter subset", () => {
    const scenarioText = JSON.stringify({
      currentScenario: {
        name: "Large Scenario",
        sides: [
          { id: "blue", name: "BLUE" },
          { id: "red", name: "RED" },
        ],
        aircraft: [
          { id: "a-1", sideId: "blue", weapons: [{ currentQuantity: 5 }] },
          { id: "a-2", sideId: "blue", weapons: [{ currentQuantity: 4 }] },
          { id: "a-3", sideId: "blue", weapons: [{ currentQuantity: 3 }] },
          { id: "a-4", sideId: "blue", weapons: [{ currentQuantity: 2 }] },
          { id: "a-5", sideId: "blue", weapons: [{ currentQuantity: 1 }] },
        ],
        facilities: [
          { id: "t-1", sideId: "red", className: "SAM" },
          { id: "t-2", sideId: "red", className: "Radar" },
          { id: "t-3", sideId: "red", className: "Launcher" },
        ],
        airbases: [
          { id: "airbase-1", sideId: "red", className: "Airbase" },
          { id: "airbase-2", sideId: "red", className: "Airbase" },
        ],
        ships: [
          { id: "moving-ship", sideId: "red", speed: 15, className: "Destroyer" },
          { id: "fixed-ship", sideId: "red", speed: 0, className: "Command Ship" },
        ],
      },
    });

    const analysis = analyzeRlScenario(scenarioText);

    expect(analysis.status).toBe("valid");
    expect(analysis.targetOptions.map((target) => target.id)).toContain("fixed-ship");
    expect(analysis.targetOptions.map((target) => target.id)).not.toContain(
      "moving-ship"
    );
    expect(analysis.recommendedAllyIds).toHaveLength(4);
    expect(analysis.recommendedTargetIds).toHaveLength(4);
    expect(analysis.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("아군 항공기 4대만 추천"),
        expect.stringContaining("표적 4개만 추천"),
      ])
    );
  });

  test("reports selection mismatches against detected scenario entities", () => {
    const scenarioText = JSON.stringify({
      currentScenario: {
        sides: [
          { id: "blue-side", name: "BLUE" },
          { id: "red-side", name: "RED" },
        ],
        aircraft: [{ id: "blue-1", sideId: "blue-side", weapons: [{ currentQuantity: 2 }] }],
        facilities: [{ id: "red-1", sideId: "red-side", className: "SAM" }],
        airbases: [],
        ships: [],
      },
    });

    const analysis = analyzeRlScenario(scenarioText);
    const issues = validateRlScenarioSelection(analysis, {
      controllableSideName: "BLUE",
      targetSideName: "RED",
      allyIds: ["missing-ally"],
      targetIds: ["red-1"],
      highValueTargetIds: ["missing-hvt"],
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        "아군 항공기 ID 'missing-ally'를 시나리오에서 찾지 못했습니다.",
        "고가치 표적 ID 'missing-hvt'는 선택한 고정 표적 목록 안에 있어야 합니다.",
      ])
    );
  });
});
