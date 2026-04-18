import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import { SimulationLogType } from "@/game/log/SimulationLogs";
import Facility from "@/game/units/Facility";
import { buildSimulationOutcomeSummary } from "@/gui/analysis/operationInsight";
import SimulationOutcomeDialog from "@/gui/shared/SimulationOutcomeDialog";

function createSummary() {
  const blue = new Side({
    id: "blue",
    name: "BLUE",
    color: "blue",
    totalScore: 300,
  });
  const red = new Side({
    id: "red",
    name: "RED",
    color: "red",
    totalScore: 120,
  });
  const scenario = new Scenario({
    id: "dialog-outcome-scenario",
    name: "Dialog Outcome Test",
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
    facilities: [
      {
        id: "blue-battery",
        sideId: blue.id,
        getTotalWeaponQuantity: () => 10,
      } as never,
      {
        id: "red-sam",
        sideId: red.id,
        getTotalWeaponQuantity: () => 4,
      } as never,
    ],
  });
  const game = new Game(scenario);

  game.simulationLogs.addLog(
    blue.id,
    "천무 포대가 목표를 명중시켰습니다.",
    3590,
    SimulationLogType.WEAPON_HIT,
    {
      actorId: "blue-battery",
      actorName: "천무 포대",
      actorType: "facility",
      targetId: "red-sam",
      targetName: "RED 방공포대",
      targetSideId: red.id,
      targetType: "facility",
      resultTag: "kill",
    }
  );
  game.simulationLogs.addLog(
    blue.id,
    "타격 임무가 성공적으로 종료됐습니다.",
    3595,
    SimulationLogType.STRIKE_MISSION_SUCCESS
  );
  game.simulationLogs.addLog(
    red.id,
    "편대가 기지로 복귀 중입니다.",
    3580,
    SimulationLogType.RETURN_TO_BASE
  );

  return buildSimulationOutcomeSummary(game);
}

function createBdaSummary() {
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
    id: "dialog-bda-scenario",
    name: "Dialog BDA Test",
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

  return buildSimulationOutcomeSummary(game);
}

describe("SimulationOutcomeDialog", () => {
  test("renders compact battle scoreboard sections", () => {
    const summary = createSummary();

    render(
      <SimulationOutcomeDialog
        open={true}
        summary={summary}
        narrative={summary.fallbackSummary}
        narrativeSource="fallback"
        onClose={() => {}}
      />
    );

    expect(screen.getByText("Result Locked")).toBeInTheDocument();
    expect(screen.getByText("전투 통계판")).toBeInTheDocument();
    expect(screen.getByText("핵심 요인")).toBeInTheDocument();
    expect(screen.getByText("작전 메모")).toBeInTheDocument();
    expect(screen.getByText("후속 조치")).toBeInTheDocument();
    expect(screen.getByText("결정 장면")).toBeInTheDocument();
    expect(screen.getByText("점수 차")).toBeInTheDocument();
    expect(screen.getAllByText("BLUE").length).toBeGreaterThan(0);
    expect(screen.getByText("점수 180점 우세")).toBeInTheDocument();
    expect(
      screen.getByText("타격 임무가 성공적으로 종료됐습니다.")
    ).toBeInTheDocument();
    expect(screen.getAllByText("소폭 우세").length).toBeGreaterThan(0);
    expect(screen.getAllByText("생존 세력 BLUE · RED").length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText("격파 1 · 손실 0").length).toBeGreaterThan(0);
  });

  test("renders a dedicated BDA layout for focus-fire outcomes", () => {
    const summary = createBdaSummary();

    render(
      <SimulationOutcomeDialog
        open={true}
        summary={summary}
        narrative={summary.fallbackSummary}
        narrativeSource="fallback"
        onClose={() => {}}
      />
    );

    expect(screen.getByText("BDA Assessment")).toBeInTheDocument();
    expect(screen.getByText("전과 분석 보고서")).toBeInTheDocument();
    expect(screen.getByText("BDA Ready")).toBeInTheDocument();
    expect(screen.getByText("배치 비교")).toBeInTheDocument();
    expect(screen.getByText("경제성 점수")).toBeInTheDocument();
    expect(screen.getByText("BDA 판정")).toBeInTheDocument();
    expect(screen.getByText("평가 보드")).toBeInTheDocument();
    expect(screen.getByText("관측 메모")).toBeInTheDocument();
    expect(screen.getByText("액션 타임라인")).toBeInTheDocument();
    expect(screen.getByText("후속 조치")).toBeInTheDocument();
    expect(screen.getByText("목표 확보 완료")).toBeInTheDocument();
    expect(screen.getByText("결정적 효과")).toBeInTheDocument();
    expect(screen.getByText("집중포격 BDA")).toBeInTheDocument();
    expect(screen.getByText("목표 집중포격 목표")).toBeInTheDocument();
  });
});
