import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Game from "@/game/Game";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import ExperienceGuideRail from "@/gui/map/ExperienceGuideRail";
import type {
  GuideRailAssetSelectionLabels,
  GuideRailAssetMixId,
} from "@/gui/map/guideRailIntents";

function createGame() {
  const game = new Game(
    new Scenario({
      id: "guide-rail-scenario",
      name: "새 시나리오",
      startTime: 0,
      duration: 3600,
      sides: [new Side({ id: "blue", name: "청군", color: "blue" })],
    })
  );

  game.currentSideId = "blue";
  game.scenarioPaused = true;

  return game;
}

function renderGuideRail(options?: {
  drawerOpen?: boolean;
  startAssetPlacement?: () => void;
  onAlertAction?: (alertId: string) => void;
  onAssetMixAction?: (assetType: string) => void;
  activeAssetMixId?: GuideRailAssetMixId | null;
  assetSelectionLabels?: GuideRailAssetSelectionLabels;
}) {
  const game = createGame();

  return render(
    <ExperienceGuideRail
      mobileView={false}
      game={game}
      drawerOpen={options?.drawerOpen ?? false}
      startAssetPlacement={options?.startAssetPlacement ?? vi.fn()}
      onAlertAction={options?.onAlertAction ?? vi.fn()}
      onAssetMixAction={options?.onAssetMixAction ?? vi.fn()}
      activeAssetMixId={options?.activeAssetMixId ?? null}
      assetSelectionLabels={options?.assetSelectionLabels ?? {}}
      playOnClick={vi.fn()}
      pauseOnClick={vi.fn()}
      stepOnClick={vi.fn()}
      openScenario3dView={vi.fn()}
      openSimulationLogs={vi.fn()}
    />
  );
}

describe("ExperienceGuideRail", () => {
  test("renders a compact setup panel and starts asset placement", async () => {
    const user = userEvent.setup();
    const startAssetPlacement = vi.fn();

    renderGuideRail({ startAssetPlacement });

    expect(screen.getByText("빠른 배치")).toBeInTheDocument();
    expect(screen.getByText("공백")).toBeInTheDocument();
    expect(screen.getByText("전력 없음")).toBeInTheDocument();
    expect(screen.queryByText("전개할 자산을 고릅니다")).not.toBeInTheDocument();
    expect(
      screen.queryByText("첫 자산을 지도에 배치합니다")
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "배치 시작" }));

    expect(startAssetPlacement).toHaveBeenCalledTimes(1);
  });

  test("shows a compact placement state after the drawer is opened", () => {
    renderGuideRail({ drawerOpen: true });

    expect(screen.getByText("도크 열림")).toBeInTheDocument();
    expect(screen.getByText("단계")).toBeInTheDocument();
    expect(screen.queryByText("세력 확인")).not.toBeInTheDocument();
    expect(screen.queryByText("지도 클릭 배치")).not.toBeInTheDocument();
  });

  test("routes gap chips to alert actions", async () => {
    const user = userEvent.setup();
    const onAlertAction = vi.fn();

    renderGuideRail({ onAlertAction });

    await user.click(screen.getByText("적 없음"));

    expect(onAlertAction).toHaveBeenCalledWith("no-hostiles");
  });

  test("routes asset mix chips to placement focus actions", async () => {
    const user = userEvent.setup();
    const onAssetMixAction = vi.fn();

    renderGuideRail({ onAssetMixAction });

    await user.click(screen.getByRole("button", { name: "유인기" }));

    expect(onAssetMixAction).toHaveBeenCalledWith("manned-aircraft");
  });

  test("shows only the active quick placement model label", () => {
    renderGuideRail({
      activeAssetMixId: "manned-aircraft",
      assetSelectionLabels: {
        "manned-aircraft": "KF-21",
        drone: "MQ-9",
      },
    });

    expect(screen.getByText("KF-21")).toBeInTheDocument();
    expect(screen.queryByText("MQ-9")).not.toBeInTheDocument();
  });
});
