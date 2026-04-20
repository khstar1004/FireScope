import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AirCombatOverlay from "@/gui/experience/AirCombatOverlay";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";

vi.mock("@/gui/experience/modelPreload", () => ({
  preloadStaticAsset: vi.fn(() => Promise.resolve({ ok: true })),
  preloadTacticalSim: vi.fn(() => Promise.resolve()),
}));

describe("AirCombatOverlay", () => {
  test("renders a cockpit-style control shell for aircraft routes", async () => {
    const route: TacticalSimRoute = {
      asset: {
        kind: "aircraft",
        id: "aircraft-kf21-1",
        name: "KF-21 Alpha",
        className: "KF-21 Boramae",
        sideName: "BLUE",
        latitude: 37.52,
        longitude: 127.04,
        altitude: 3200,
        heading: 24,
        speed: 560,
        range: 24,
        currentFuel: 9000,
        maxFuel: 13200,
        weaponCount: 8,
      },
      profile: "base",
      operationMode: "quick-scramble",
      modelId: "aircraft-kf21",
    };

    render(<AirCombatOverlay route={route} onClose={vi.fn()} />);

    expect(screen.getByText("AIR COMBAT LINK")).toBeInTheDocument();
    expect(screen.getByText("KF-21 Alpha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "종료" })).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /추적 시점/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /주무장 발사/ })
      ).toBeInTheDocument();
    });
  });
});
