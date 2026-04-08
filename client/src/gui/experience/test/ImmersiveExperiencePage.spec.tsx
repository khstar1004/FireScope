import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ImmersiveExperiencePage from "@/gui/experience/ImmersiveExperiencePage";
import {
  createImmersiveExperienceDemoAsset,
  type ImmersiveExperienceRoute,
} from "@/gui/experience/immersiveExperience";

vi.mock("@/gui/experience/BundleModelViewport", () => ({
  default: () => <div data-testid="bundle-model-viewport" />,
}));

vi.mock("@/gui/experience/ImmersiveAssetViewport", () => ({
  default: () => <div data-testid="immersive-asset-viewport" />,
}));

vi.mock("@/gui/experience/modelPreload", () => ({
  preloadBundleViewer: vi.fn(() => Promise.resolve()),
  preloadTacticalSim: vi.fn(() => Promise.resolve()),
}));

function renderPage(route: ImmersiveExperienceRoute) {
  return render(
    <ImmersiveExperiencePage
      route={route}
      onBack={vi.fn()}
      onBackToMap={vi.fn()}
      openFlightSimPage={vi.fn()}
      openTacticalSimPage={vi.fn()}
    />
  );
}

describe("ImmersiveExperiencePage", () => {
  test("hides guide panels by default and shows them on demand", async () => {
    const user = userEvent.setup();
    const route: ImmersiveExperienceRoute = {
      asset: createImmersiveExperienceDemoAsset("base"),
      profile: "base",
    };

    renderPage(route);

    expect(screen.queryByText("Mission Phases")).not.toBeInTheDocument();
    expect(screen.queryByText(/현재 선택은/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "가이드 보기" }));

    expect(
      screen.getByRole("button", { name: "가이드 숨기기" })
    ).toBeInTheDocument();
    expect(screen.getByText("Mission Phases")).toBeInTheDocument();
    expect(screen.getByText(/현재 선택은/)).toBeInTheDocument();
  });

  test("collapses the guide again when the route changes", async () => {
    const user = userEvent.setup();
    const route: ImmersiveExperienceRoute = {
      asset: createImmersiveExperienceDemoAsset("base"),
      profile: "base",
    };
    const nextRoute: ImmersiveExperienceRoute = {
      asset: {
        ...createImmersiveExperienceDemoAsset("base"),
        id: "demo-immersive-base-next",
        name: "Osan Air Base Demo",
      },
      profile: "base",
    };

    const view = renderPage(route);

    await user.click(screen.getByRole("button", { name: "가이드 보기" }));
    expect(screen.getByText("Mission Phases")).toBeInTheDocument();

    view.rerender(
      <ImmersiveExperiencePage
        route={nextRoute}
        onBack={vi.fn()}
        onBackToMap={vi.fn()}
        openFlightSimPage={vi.fn()}
        openTacticalSimPage={vi.fn()}
      />
    );

    expect(screen.queryByText("Mission Phases")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "가이드 보기" })
    ).toBeInTheDocument();
  });
});
