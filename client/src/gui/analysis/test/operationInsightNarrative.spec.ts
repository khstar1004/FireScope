import { describe, expect, test, vi } from "vitest";
import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import {
  buildSimulationOutcomeSummary,
  requestSimulationOutcomeNarrative,
} from "@/gui/analysis/operationInsight";
import { SimulationLogType } from "@/game/log/SimulationLogs";
import { requestAssistantCompletionResult } from "@/gui/agent/chatbotApi";

vi.mock("@/gui/agent/chatbotApi", () => ({
  requestAssistantCompletionResult: vi.fn(),
}));

function createOutcomeTestSummary() {
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
    facilities: [
      {
        id: "blue-battery",
        sideId: blue.id,
        getTotalWeaponQuantity: () => 12,
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

  return buildSimulationOutcomeSummary(game);
}

describe("requestSimulationOutcomeNarrative", () => {
  test("returns llm source when the assistant replies", async () => {
    vi.mocked(requestAssistantCompletionResult).mockResolvedValue({
      ok: true,
      text: "북한이 우세합니다.",
    });

    const narrative = await requestSimulationOutcomeNarrative(
      createOutcomeTestSummary()
    );

    expect(narrative).toEqual({
      text: "북한이 우세합니다.",
      source: "llm",
    });
  });

  test("falls back to deterministic summary when the assistant is unavailable", async () => {
    vi.mocked(requestAssistantCompletionResult).mockResolvedValue({
      ok: false,
      errorMessage: "missing api key",
    });

    const summary = createOutcomeTestSummary();
    const narrative = await requestSimulationOutcomeNarrative(summary);

    expect(narrative.source).toBe("fallback");
    expect(narrative.text).toBe(summary.fallbackSummary);
  });
});
