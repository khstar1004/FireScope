import { describe, expect, test } from "vitest";
import Game from "@/game/Game";
import Facility from "@/game/units/Facility";
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
    relationships: new Relationships({
      hostiles: {
        [blue.id]: [red.id],
        [red.id]: [blue.id],
      },
    }),
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
      targetSideId: red.id,
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

function createFocusFireBdaGame() {
  const blue = new Side({
    id: "focus-force",
    name: "집중 전력",
    color: "blue",
  });
  const observer = new Side({
    id: "observation-cell",
    name: "관측 셀",
    color: "silver",
  });
  const scenario = new Scenario({
    id: "focus-bda-scenario",
    name: "Focused BDA Test",
    startTime: 0,
    currentTime: 3600,
    duration: 3600,
    endTime: 3600,
    sides: [blue, observer],
    relationships: new Relationships({
      hostiles: {
        [blue.id]: [],
        [observer.id]: [],
      },
      allies: {
        [blue.id]: [observer.id],
        [observer.id]: [blue.id],
      },
    }),
    facilities: [
      new Facility({
        id: "blue-battery",
        name: "천무 포대",
        sideId: blue.id,
        className: "Chunmoo",
        latitude: 37,
        longitude: 127,
        altitude: 0,
        range: 80,
        sideColor: "blue",
        weapons: [],
      }),
    ],
  });
  const game = new Game(scenario);

  game.currentSideId = blue.id;
  game.setFocusFireMode(true);
  game.setFocusFireObjective(37.01, 127.02);
  game.focusFireOperation.captureProgress = 100;
  game.focusFireOperation.active = false;
  game.focusFireOperation.launchedPlatformIds = ["blue-battery"];
  game.simulationLogs.addLog(
    blue.id,
    "천무 포대가 집중포격 목표에 일제사격을 가했습니다.",
    3588,
    SimulationLogType.WEAPON_LAUNCHED,
    {
      actorId: "blue-battery",
      actorName: "천무 포대",
      actorType: "facility",
      quantity: 6,
      objectiveName: "집중포격 목표",
      resultTag: "launch",
    }
  );
  game.simulationLogs.addLog(
    blue.id,
    "유도탄이 집중포격 목표 지점에 착탄했습니다.",
    3592,
    SimulationLogType.WEAPON_HIT,
    {
      objectiveName: "집중포격 목표",
      resultTag: "impact",
    }
  );
  game.simulationLogs.addLog(
    blue.id,
    "집중포격 목표를 확보했습니다. 집중포격 작전이 종료됩니다.",
    3598,
    SimulationLogType.STRIKE_MISSION_SUCCESS,
    {
      objectiveName: "집중포격 목표",
      resultTag: "objective_secured",
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
    expect(summary.endReason).toBe("시나리오 종료 시간 도달");
    expect(summary.endReasonDetail).toBe("time_limit");
    expect(summary.activeSideSummary).toBe("생존 세력 BLUE · RED");
    expect(summary.activeSideNames).toEqual(["BLUE", "RED"]);
    expect(summary.sides[0]).toMatchObject({
      name: "BLUE",
      score: 250,
      remainingCombatUnits: 3,
      confirmedHits: 1,
      launches: 1,
      misses: 0,
      missionSuccesses: 1,
    });
    expect(summary.sides[0]?.kills).toMatchObject({
      facilities: 1,
      total: 1,
    });
    expect(summary.sides[0]?.losses.total).toBe(0);
    expect(summary.sides[0]?.attritionBalance).toBe(1);
    expect(summary.sides[1]).toMatchObject({
      name: "RED",
      score: 120,
      remainingCombatUnits: 2,
      confirmedHits: 0,
      launches: 1,
      misses: 0,
      missionSuccesses: 0,
    });
    expect(summary.sides[1]?.losses).toMatchObject({
      facilities: 1,
      total: 1,
    });
    expect(summary.report.sideAssessments[0]?.attritionLabel).toBe("소폭 우세");
    expect(summary.fallbackSummary).toContain("BLUE 우세");
    expect(summary.report.headline).toContain("BLUE 우세");
    expect(summary.report.executiveSummary).toContain("BLUE 우세");
    expect(summary.report.decisiveFactors).toContain("임무 'SEAD-1' 달성");
    expect(summary.report.decisiveFactors).toContain("적 지휘소 격파");
    expect(summary.report.decisiveFactors).toContain("소모전 차 +1");
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
    expect(summary.fallbackSummary).toContain("소모전 차 +1 대 -1");
    expect(summary.fallbackSummary).toContain(
      "종료 시점 생존 세력 BLUE · RED 상태였습니다."
    );
    expect(summary.report.executiveSummary).toContain(
      "생존 세력 BLUE · RED를 유지한 채"
    );
    expect(summary.recentLogs).toHaveLength(4);
  });

  test("switches to a BDA summary when focus-fire closes out the scenario", () => {
    const summary = buildSimulationOutcomeSummary(createFocusFireBdaGame());

    expect(summary.reportMode).toBe("bda");
    expect(summary.bdaReport).not.toBeNull();
    expect(summary.bdaReport?.modeReason).toBe("focus_fire");
    expect(summary.bdaReport?.objectiveName).toBe("집중포격 목표");
    expect(summary.bdaReport?.objectiveStatusLabel).toBe("목표 확보 완료");
    expect(summary.bdaReport?.damageLevelLabel).toBe("목표 확보");
    expect(summary.bdaReport?.assessedEffectLabel).toBe("결정적 효과");
    expect(summary.bdaReport?.assessmentConfidenceLabel).toBe("높음");
    expect(summary.bdaReport?.resourceEfficiencyLabel).toBe("양호");
    expect(summary.bdaReport?.tempoLabel).toBe("종결 단계");
    expect(summary.bdaReport?.requiredEffectScore).toBeGreaterThan(0);
    expect(summary.bdaReport?.missionThresholdMet).toBe(true);
    expect(summary.bdaReport?.economicScore).toBeGreaterThan(0);
    expect(summary.bdaReport?.deploymentAssessmentLabel).toBe("최적 편성");
    expect(summary.bdaReport?.effectSummary).toContain("탄착 1");
    expect(summary.bdaReport?.operatingPicture).toContain("분석 신뢰도는 높음");
    expect(summary.bdaReport?.benchmark?.comparisonCount).toBeGreaterThanOrEqual(1);
    expect(summary.bdaReport?.benchmarkInsight).toContain("같은 목표");
    expect(summary.bdaReport?.launchCount).toBe(6);
    expect(summary.bdaReport?.confirmedHitCount).toBe(1);
    expect(summary.bdaReport?.recentActions[0]).toContain("집중포격 목표를 확보");
    expect(summary.fallbackSummary).toContain("집중포격 목표 BDA");
  });
});
