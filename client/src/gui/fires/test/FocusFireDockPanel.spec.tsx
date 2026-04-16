import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type Game from "@/game/Game";
import FocusFireDockPanel from "@/gui/fires/FocusFireDockPanel";

function createGame(
  summaryOverrides: Record<string, unknown> = {}
): Game {
  return {
    currentSideId: "blue-side",
    focusFireOperation: {
      sideId: "blue-side",
    },
    getFocusFireSummary: vi.fn(() => ({
      enabled: true,
      active: false,
      objectiveName: "집중포격 목표",
      objectiveLatitude: 37.5665,
      objectiveLongitude: 126.978,
      desiredEffectOverride: null,
      captureProgress: 42,
      artilleryCount: 4,
      armorCount: 2,
      aircraftCount: 3,
      weaponsInFlight: 1,
      statusLabel: "집중포격 준비",
      launchPlatforms: [],
      weaponTracks: [],
      recommendation: null,
      ...summaryOverrides,
    })),
    getFocusFireRerankerState: vi.fn(() => ({
      enabled: false,
      confidenceScore: 0.42,
      model: {
        modelFamily: "linear",
        source: "default",
        version: 2,
        sampleCount: 12,
        operatorFeedbackCount: 1,
        ruleSeedCount: 2,
      },
    })),
    getFocusFireRecommendationTelemetry: vi.fn(() => [
      {
        feedbackOptionLabel: "기본안",
        options: [{ label: "기본안" }, { label: "대안" }],
        rerankerApplied: false,
        recommendedOptionLabel: "기본안",
      },
    ]),
    getFocusFireRecommendationFeedbackLabel: vi.fn(() => null),
    setFocusFireDesiredEffectOverride: vi.fn(() => 2.5),
    setFocusFireRerankerEnabled: vi.fn(() => true),
    trainFocusFireRerankerModel: vi.fn(() => ({
      summary: {
        recordsUsed: 1,
        comparisons: 1,
        operatorFeedbackRecords: 1,
      },
    })),
    resetFocusFireRerankerModel: vi.fn(),
    exportFocusFireRecommendationTelemetryJsonl: vi.fn(() => ""),
    exportFocusFireRecommendationTelemetryCsv: vi.fn(() => ""),
    exportFocusFireRerankerModel: vi.fn(() => ""),
    importFocusFireRerankerModel: vi.fn(),
    setFocusFireRecommendationFeedback: vi.fn(() => null),
  } as unknown as Game;
}

describe("FocusFireDockPanel", () => {
  test("renders a compact dock card when closed", () => {
    const onOpen = vi.fn();

    render(
      <FocusFireDockPanel
        game={
          createGame({
            enabled: false,
            objectiveName: null,
            objectiveLatitude: null,
            objectiveLongitude: null,
            statusLabel: "대기",
          })
        }
        mobileView={false}
        open={false}
        onOpen={onOpen}
        onClose={vi.fn()}
        onToggleFocusFireMode={vi.fn()}
        onArmObjectiveSelection={vi.fn()}
        onClearObjective={vi.fn()}
        onOpenAirwatch={vi.fn()}
      />
    );

    expect(screen.getByText("집중포격 작전")).toBeInTheDocument();
    expect(screen.getByText("집중포격 시작")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "열기" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test("switches tabs and triggers primary action callbacks when open", () => {
    const onArmObjectiveSelection = vi.fn();
    const onOpenAirwatch = vi.fn();

    render(
      <FocusFireDockPanel
        game={createGame()}
        mobileView={false}
        open={true}
        onOpen={vi.fn()}
        onClose={vi.fn()}
        onToggleFocusFireMode={vi.fn()}
        onArmObjectiveSelection={onArmObjectiveSelection}
        onClearObjective={vi.fn()}
        onOpenAirwatch={onOpenAirwatch}
      />
    );

    expect(screen.getByText("집중포격 작전 패널")).toBeInTheDocument();
    expect(screen.getByText("지금 할 일")).toBeInTheDocument();
    expect(screen.getByText("화력 정렬 중")).toBeInTheDocument();
    expect(screen.getByText("전술 조작")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "목표 지정" }));
    fireEvent.click(screen.getAllByRole("button", { name: "공중 관측 3D" })[0]);

    expect(onArmObjectiveSelection).toHaveBeenCalledTimes(1);
    expect(onOpenAirwatch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "추천" }));
    expect(
      screen.getByText("추천 가능한 표적 또는 가용 화력이 없습니다.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "AI" }));
    expect(screen.getByText("AI 제어")).toBeInTheDocument();
    expect(screen.getByText("학습 가능")).toBeInTheDocument();
    expect(screen.getAllByText("1건").length).toBeGreaterThan(0);
  });
});
