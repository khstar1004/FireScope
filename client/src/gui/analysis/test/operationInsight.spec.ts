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
    "KF-16이 적 지휘소를 명중시켜 파괴했습니다.",
    3590,
    SimulationLogType.WEAPON_HIT,
    {
      actorId: "blue-jet",
      actorName: "KF-16",
      actorType: "aircraft",
      targetId: "red-command",
      targetName: "적 지휘소",
      targetType: "facility",
      resultTag: "kill",
      actorScoreDelta: 50,
      targetScoreDelta: -70,
      scoreNetDelta: -20,
    }
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
  game.simulationLogs.addLog(
    blue.id,
    "타격 임무 'SEAD-1' 완료: 지정 표적이 모두 무력화되었습니다.",
    3595,
    SimulationLogType.STRIKE_MISSION_SUCCESS,
    {
      missionId: "mission-sead-1",
      missionName: "SEAD-1",
      resultTag: "mission_success",
      actorScoreDelta: 200,
      scoreNetDelta: 200,
    }
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
      misses: 0,
      missionSuccesses: 1,
    });
    expect(summary.sides[1]).toMatchObject({
      name: "RED",
      score: 120,
      remainingCombatUnits: 2,
      confirmedHits: 0,
      launches: 1,
      misses: 0,
      missionSuccesses: 0,
    });
    expect(summary.fallbackSummary).toContain("BLUE 우세");
    expect(summary.report.headline).toContain("BLUE 우세");
    expect(summary.report.executiveSummary).toContain("BLUE 우세");
    expect(summary.report.decisiveFactors).toContain("임무 'SEAD-1' 달성");
    expect(summary.report.decisiveFactors).toContain("적 지휘소 격파");
    expect(summary.report.sideAssessments[0]?.strengths.length).toBeGreaterThan(
      0
    );
    expect(
      summary.report.turningPoints.some(
        (turningPoint) =>
          turningPoint.headline ===
            "타격 임무 'SEAD-1' 완료: 지정 표적이 모두 무력화되었습니다." &&
          turningPoint.detail.includes("SEAD-1")
      )
    ).toBe(true);
    expect(
      summary.report.turningPoints.some(
        (turningPoint) =>
          turningPoint.headline ===
            "KF-16이 적 지휘소를 명중시켜 파괴했습니다." &&
          turningPoint.detail.includes("적 지휘소") &&
          turningPoint.detail.includes("점수 +50")
      )
    ).toBe(true);
    expect(summary.report.operationalRisks.length).toBeGreaterThan(0);
    expect(summary.report.recommendations.length).toBeGreaterThan(0);
    expect(summary.recentLogs).toHaveLength(4);
  });
});
