import { describe, expect, test } from "vitest";
import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import { SimulationLogType } from "@/game/log/SimulationLogs";
import {
  buildFocusFireInsight,
  buildSimulationOutcomeSummary,
} from "@/gui/analysis/operationInsight";

function createOutcomeTestGame() {
  const blue = new Side({
    id: "blue",
    name: "BLUE",
    color: "blue",
    totalScore: 250,
  });
  const red = new Side({
    id: "red",
    name: "RED",
    color: "red",
    totalScore: 120,
  });
  const scenario = new Scenario({
    id: "outcome-scenario",
    name: "Outcome Test",
    startTime: 0,
    currentTime: 3600,
    duration: 3600,
    endTime: 3600,
    sides: [blue, red],
    relationships: new Relationships({}),
    aircraft: [
      {
        id: "blue-jet",
        sideId: blue.id,
        getTotalWeaponQuantity: () => 6,
      } as never,
    ],
    ships: [
      {
        id: "red-ship",
        sideId: red.id,
        getTotalWeaponQuantity: () => 4,
      } as never,
    ],
    facilities: [
      {
        id: "blue-battery",
        sideId: blue.id,
        getTotalWeaponQuantity: () => 12,
      } as never,
      {
        id: "red-sam",
        sideId: red.id,
        getTotalWeaponQuantity: () => 8,
      } as never,
    ],
    airbases: [
      {
        id: "blue-base",
        sideId: blue.id,
      } as never,
    ],
  });
  const game = new Game(scenario);

  game.simulationLogs.addLog(
    blue.id,
    "KF-16이 목표를 명중시켰습니다.",
    3590,
    SimulationLogType.WEAPON_HIT
  );
  game.simulationLogs.addLog(
    blue.id,
    "천무 포대가 일제사격을 실시했습니다.",
    3585,
    SimulationLogType.WEAPON_LAUNCHED
  );
  game.simulationLogs.addLog(
    red.id,
    "적 방공망이 요격을 시도했습니다.",
    3580,
    SimulationLogType.WEAPON_LAUNCHED
  );

  return game;
}

describe("operationInsight", () => {
  test("calculates a deterministic focus-fire shock index", () => {
    const insight = buildFocusFireInsight({
      active: true,
      captureProgress: 40,
      aircraftCount: 3,
      artilleryCount: 4,
      armorCount: 1,
      weaponsInFlight: 1,
    });

    expect(insight.shockIndex).toBe(48);
    expect(insight.intensityLabel).toBe("유효");
    expect(insight.dominantAxis).toBe("포대 화력");
    expect(insight.summary).toContain("포대 화력");
  });

  test("summarizes the winning side from score and remaining combat power", () => {
    const summary = buildSimulationOutcomeSummary(createOutcomeTestGame());

    expect(summary.winnerName).toBe("BLUE");
    expect(summary.isTie).toBe(false);
    expect(summary.winnerBasis).toContain("점수");
    expect(summary.sides[0]).toMatchObject({
      name: "BLUE",
      score: 250,
      remainingCombatUnits: 3,
      confirmedHits: 1,
      launches: 1,
    });
    expect(summary.sides[1]).toMatchObject({
      name: "RED",
      score: 120,
      remainingCombatUnits: 2,
      confirmedHits: 0,
      launches: 1,
    });
    expect(summary.fallbackSummary).toContain("BLUE 우세");
    expect(summary.recentLogs).toHaveLength(3);
  });
});
