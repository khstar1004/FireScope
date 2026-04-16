import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ImmersiveExperiencePage from "@/gui/experience/ImmersiveExperiencePage";
import {
  createImmersiveExperienceDemoAsset,
  type ImmersiveExperienceRoute,
} from "@/gui/experience/immersiveExperience";

const bundleModelViewportMock = vi.fn(() => (
  <div data-testid="bundle-model-viewport" />
));
let lastBundleModelViewportProps: unknown;

vi.mock("@/gui/experience/BundleModelViewport", () => ({
  default: (props: unknown) => {
    lastBundleModelViewportProps = props;
    return bundleModelViewportMock();
  },
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
  beforeEach(() => {
    bundleModelViewportMock.mockClear();
    lastBundleModelViewportProps = undefined;
  });

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

  test("renders the immersive viewer as a clean 3D viewport without battle runtime", async () => {
    const user = userEvent.setup();
    const route: ImmersiveExperienceRoute = {
      asset: createImmersiveExperienceDemoAsset("base"),
      profile: "base",
    };

    renderPage(route);

    expect(bundleModelViewportMock).toHaveBeenCalled();
    expect(lastBundleModelViewportProps).toMatchObject({
      mode: "immersive",
      viewerChrome: "minimal",
    });
    expect(lastBundleModelViewportProps).not.toHaveProperty("simulation");

    await user.click(screen.getByRole("button", { name: "기준만 보기" }));

    expect(lastBundleModelViewportProps).toMatchObject({
      viewerChrome: "minimal",
    });
    expect(lastBundleModelViewportProps).not.toHaveProperty("simulation");

    await user.click(screen.getByRole("button", { name: /Drone Watch/ }));

    expect(lastBundleModelViewportProps).toMatchObject({
      viewerChrome: "minimal",
    });
    expect(lastBundleModelViewportProps).not.toHaveProperty("simulation");
  });
});
