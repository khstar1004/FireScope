import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TacticalSimPage from "@/gui/experience/TacticalSimPage";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";

vi.mock("@/gui/experience/modelPreload", () => ({
  preloadStaticAsset: vi.fn(() => Promise.resolve({ ok: true })),
  preloadTacticalSim: vi.fn(() => Promise.resolve()),
}));

describe("TacticalSimPage", () => {
  test("renders a model-first tactical control deck", async () => {
    const route: TacticalSimRoute = {
      asset: {
        kind: "facility",
        id: "facility-defense-compact-ui",
        name: "L-SAM Battery Demo",
        className: "L-SAM",
        sideName: "BLUE",
        latitude: 37.4,
        longitude: 126.9,
        altitude: 210,
        range: 120,
        weaponCount: 4,
      },
      profile: "defense",
      operationMode: "layered-shield",
      modelId: "artillery-thaad",
    };

    render(
      <TacticalSimPage route={route} onBack={vi.fn()} onBackToMap={vi.fn()} />
    );

    expect(
      screen.getByRole("button", { name: "모델 집중" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "데모 재생" })
    ).toBeInTheDocument();
    expect(screen.getByText("결심 체크")).toBeInTheDocument();
    expect(screen.getByText("교전 흐름")).toBeInTheDocument();
    expect(screen.queryByText("TODO")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo Flow")).not.toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "작전 투입" })
      ).not.toBeDisabled()
    );

    expect(
      screen.getByText(/방공 자산을 360도로 회전해 레이더와 발사기 방향을 확인합니다\./)
    ).toBeInTheDocument();
  });
});
