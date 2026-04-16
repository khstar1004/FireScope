import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TacticalSimPage from "@/gui/experience/TacticalSimPage";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";

vi.mock("@/gui/experience/modelPreload", () => ({
  preloadStaticAsset: vi.fn(() => Promise.resolve({ ok: true })),
  preloadTacticalSim: vi.fn(() => Promise.resolve()),
}));

describe("TacticalSimPage", () => {
  test("renders compact runtime controls with a 360 model entry point", async () => {
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
      screen.getByRole("button", { name: "360 모델" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "데모 재생" })
    ).toBeInTheDocument();
    expect(screen.getByText("TODO")).toBeInTheDocument();
    expect(screen.getByText("Demo Flow")).toBeInTheDocument();
    expect(screen.queryByText("성공 기준")).not.toBeInTheDocument();
    expect(screen.queryByText("작전 흐름")).not.toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "임무 시작" })
      ).not.toBeDisabled()
    );

    expect(screen.getByText(/실제 3D 모델/)).toBeInTheDocument();
  });
});
