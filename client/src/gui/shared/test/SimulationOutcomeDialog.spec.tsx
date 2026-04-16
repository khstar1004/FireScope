import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import { SimulationLogType } from "@/game/log/SimulationLogs";
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
    relationships: new Relationships({}),
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
});
