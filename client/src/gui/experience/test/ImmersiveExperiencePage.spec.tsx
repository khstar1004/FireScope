import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type Game from "@/game/Game";
import type { BattleSpectatorSnapshot } from "@/game/Game";
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

function createLiveSnapshot(): BattleSpectatorSnapshot {
  return {
    schemaVersion: 2,
    scenarioId: "immersive-live-demo",
    scenarioName: "Immersive Live Demo",
    currentTime: 1770000120,
    currentSideId: "blue-side",
    currentSideName: "청군",
    selectedUnitId: "focus-air-1",
    centerLongitude: 126.98,
    centerLatitude: 37.57,
    units: [
      {
        id: "focus-air-1",
        name: "KF-21 #201",
        className: "KF-21 Boramae",
        entityType: "aircraft",
        modelId: "aircraft-kf21",
        profileHint: "base",
        groundUnit: false,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.5665,
        longitude: 126.978,
        altitudeMeters: 8500,
        headingDeg: 88,
        speedKts: 340,
        weaponCount: 4,
        hpFraction: 0.92,
        damageFraction: 0.08,
        detectionRangeNm: 70,
        detectionArcDegrees: 360,
        detectionHeadingDeg: 88,
        engagementRangeNm: 45,
        currentFuel: 11200,
        maxFuel: 14000,
        fuelFraction: 0.8,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "aim-120",
            name: "AIM-120 AMRAAM",
            className: "AIM-120 AMRAAM",
            quantity: 4,
            maxQuantity: 4,
            modelId: "weapon-air-to-air-missile",
          },
        ],
        homeBaseId: "blue-base",
        rtb: false,
        statusFlags: ["selected", "engaged"],
        selected: true,
        targetId: "enemy-battery-1",
      },
      {
        id: "blue-base",
        name: "Suwon Airbase",
        className: "Airbase",
        entityType: "airbase",
        profileHint: "base",
        groundUnit: false,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.27,
        longitude: 127.01,
        altitudeMeters: 0,
        headingDeg: 0,
        speedKts: 0,
        weaponCount: 0,
        hpFraction: 1,
        damageFraction: 0,
        detectionRangeNm: 0,
        detectionArcDegrees: 360,
        detectionHeadingDeg: 0,
        engagementRangeNm: 0,
        route: [],
        desiredRoute: [],
        weaponInventory: [],
        aircraftCount: 8,
        statusFlags: [],
        selected: false,
      },
      {
        id: "escort-helo-1",
        name: "Apache Escort",
        className: "AH-64 Apache",
        entityType: "aircraft",
        modelId: "aircraft-apache",
        profileHint: "base",
        groundUnit: false,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.53,
        longitude: 127.0,
        altitudeMeters: 1100,
        headingDeg: 46,
        speedKts: 130,
        weaponCount: 8,
        hpFraction: 0.88,
        damageFraction: 0.12,
        detectionRangeNm: 28,
        detectionArcDegrees: 180,
        detectionHeadingDeg: 46,
        engagementRangeNm: 10,
        currentFuel: 3800,
        maxFuel: 5200,
        fuelFraction: 0.73,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "hellfire",
            name: "AGM-114 Hellfire",
            className: "AGM-114 Hellfire",
            quantity: 8,
            maxQuantity: 8,
            modelId: "weapon-surface-missile",
          },
        ],
        homeBaseId: "blue-base",
        rtb: false,
        statusFlags: [],
        selected: false,
      },
      {
        id: "blue-def-1",
        name: "Blue Shield Battery",
        className: "NASAMS Battery",
        entityType: "facility",
        modelId: "artillery-nasams-battery",
        profileHint: "defense",
        groundUnit: false,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.45,
        longitude: 127.11,
        altitudeMeters: 0,
        headingDeg: 15,
        speedKts: 0,
        weaponCount: 6,
        hpFraction: 0.95,
        damageFraction: 0.05,
        detectionRangeNm: 48,
        detectionArcDegrees: 360,
        detectionHeadingDeg: 15,
        engagementRangeNm: 26,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "pac-3",
            name: "PAC-3 MSE",
            className: "PAC-3 MSE",
            quantity: 6,
            maxQuantity: 8,
            modelId: "weapon-surface-missile",
          },
        ],
        statusFlags: ["air-defense"],
        selected: false,
      },
      {
        id: "enemy-battery-1",
        name: "Enemy Battery",
        className: "K9 Thunder",
        entityType: "facility",
        modelId: "artillery-k9",
        profileHint: "fires",
        groundUnit: false,
        sideId: "red-side",
        sideName: "적군",
        sideColor: "red",
        latitude: 37.61,
        longitude: 127.04,
        altitudeMeters: 0,
        headingDeg: 12,
        speedKts: 0,
        weaponCount: 8,
        hpFraction: 0.84,
        damageFraction: 0.16,
        detectionRangeNm: 35,
        detectionArcDegrees: 120,
        detectionHeadingDeg: 12,
        engagementRangeNm: 20,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "shell-1",
            name: "155mm Shell",
            className: "155mm Shell",
            quantity: 8,
            maxQuantity: 8,
            modelId: "weapon-artillery-shell",
          },
        ],
        statusFlags: ["engaged"],
        selected: false,
      },
    ],
    weapons: [],
    recentEvents: [
      {
        id: "event-1",
        timestamp: 1770000118,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        type: "STRIKE_MISSION_SUCCESS",
        message: "Scramble detected.",
        actorId: "focus-air-1",
        actorName: "KF-21 #201",
        targetId: "enemy-battery-1",
        targetName: "Enemy Battery",
      },
    ],
    stats: {
      aircraft: 2,
      facilities: 2,
      airbases: 1,
      ships: 0,
      groundUnits: 0,
      weaponsInFlight: 0,
      sides: 2,
    },
  };
}

function renderPage(route: ImmersiveExperienceRoute, game?: Game) {
  return render(
    <ImmersiveExperiencePage
      route={route}
      game={game}
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

  test("hides the briefing rail by default and opens it on demand", async () => {
    const user = userEvent.setup();
    const route: ImmersiveExperienceRoute = {
      asset: createImmersiveExperienceDemoAsset("base"),
      profile: "base",
    };

    renderPage(route);

    expect(screen.queryByText("작전 단계")).not.toBeInTheDocument();
    expect(screen.queryByText("Launch Checklist")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "브리프 열기" }));

    expect(screen.getByRole("button", { name: "브리프 닫기" })).toBeInTheDocument();
    expect(screen.getByText("작전 단계")).toBeInTheDocument();
    expect(screen.getByText("Launch Checklist")).toBeInTheDocument();
  });

  test("collapses the briefing rail again when the route changes", async () => {
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

    await user.click(screen.getByRole("button", { name: "브리프 열기" }));
    expect(screen.getByText("작전 단계")).toBeInTheDocument();

    view.rerender(
      <ImmersiveExperiencePage
        route={nextRoute}
        onBack={vi.fn()}
        onBackToMap={vi.fn()}
        openFlightSimPage={vi.fn()}
        openTacticalSimPage={vi.fn()}
      />
    );

    expect(screen.queryByText("작전 단계")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "브리프 열기" })).toBeInTheDocument();
  });

  test("renders the immersive viewer as a single-model focus experience by default", async () => {
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
      contextMode: "focus",
      showLineupMarkers: false,
      comparisonSelections: [],
      lineup: [],
      sceneProps: [],
    });
    expect(lastBundleModelViewportProps).not.toHaveProperty("simulation");

    await user.click(screen.getByRole("button", { name: "비교 열기" }));
    await user.click(
      screen.getByRole("button", { name: "비교 추가 AH-64 Apache" })
    );

    expect(lastBundleModelViewportProps).toMatchObject({
      comparisonSelections: expect.arrayContaining([
        expect.objectContaining({ label: "AH-64 Apache" }),
      ]),
    });

    await user.click(screen.getByRole("button", { name: "기준만 보기" }));

    expect(lastBundleModelViewportProps).toMatchObject({
      comparisonSelections: [],
    });
  });

  test("surfaces live battle feed without forcing comparison models into the viewport", async () => {
    const user = userEvent.setup();
    const route: ImmersiveExperienceRoute = {
      asset: {
        kind: "aircraft",
        id: "focus-air-1",
        name: "KF-21 #201",
        className: "KF-21 Boramae",
        sideName: "청군",
        latitude: 37.5665,
        longitude: 126.978,
        altitude: 8500,
        heading: 88,
        speed: 340,
        range: 70,
        weaponCount: 4,
      },
      profile: "base",
    };
    const game = {
      getBattleSpectatorSnapshot: vi.fn(() => createLiveSnapshot()),
    } as unknown as Game;

    renderPage(route, game);

    expect(screen.getByText("LIVE SNAPSHOT")).toBeInTheDocument();
    expect(screen.getByText(/Scramble detected\./)).toBeInTheDocument();
    expect(lastBundleModelViewportProps).toMatchObject({
      comparisonSelections: [],
    });

    await user.click(screen.getByRole("button", { name: "브리프 열기" }));

    expect(await screen.findByText("Live Feed")).toBeInTheDocument();
    expect(screen.getByText(/Enemy Battery/)).toBeInTheDocument();
  });
});
