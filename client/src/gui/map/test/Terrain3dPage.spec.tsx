import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type Game from "@/game/Game";
import Terrain3dPage from "@/gui/map/Terrain3dPage";

const SAMPLE_SNAPSHOT = {
  schemaVersion: 2,
  scenarioId: "scenario-1",
  scenarioName: "테스트",
  currentTime: 0,
  currentSideId: "blue",
  currentSideName: "Blue",
  selectedUnitId: "unit-1",
  centerLongitude: 127.1,
  centerLatitude: 37.5,
  units: [],
  weapons: [],
  recentEvents: [],
  stats: {
    aircraft: 0,
    facilities: 0,
    airbases: 0,
    ships: 0,
    groundUnits: 0,
    weaponsInFlight: 0,
    sides: 1,
  },
};

function createGameMock() {
  return {
    getBattleSpectatorSnapshot: vi.fn(() => SAMPLE_SNAPSHOT),
    getFocusFireSummary: vi.fn(() => undefined),
    getGameEndState: vi.fn(() => ({
      terminated: false,
      truncated: false,
    })),
    stepForTimeCompression: vi.fn(() => [null, null, true, false]),
    recordStep: vi.fn(),
    scenarioPaused: false,
    currentScenario: {
      timeCompression: 1,
    },
  } as unknown as Game;
}

function attachIframeWindow(iframe: HTMLIFrameElement) {
  const postMessage = vi.fn();
  const frameWindow = {
    postMessage,
  } as unknown as Window;

  Object.defineProperty(iframe, "contentWindow", {
    configurable: true,
    value: frameWindow,
  });

  return {
    frameWindow,
    postMessage,
  };
}

function queryPlayPauseButton() {
  return screen.queryByRole("button", { name: /재생|일시정지/ });
}

describe("Terrain3dPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("posts the runtime snapshot when the iframe loads", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { postMessage } = attachIframeWindow(iframe);

    fireEvent.load(iframe);

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "terrain3d:runtime-snapshot",
        payload: SAMPLE_SNAPSHOT,
      },
      window.location.origin
    );
  });

  test("keeps the feature-complete Cesium terrain runtime as the default", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;

    expect(iframe.src).toContain(
      "viewerVersion=terrain-glb-direction-20260427"
    );
    expect(iframe.src).toContain("terrainPlan=cesium");
    expect(iframe.src).not.toContain("offlineMapManifest");
  });

  test("passes the closed-network Seungjin package to the 3D terrain runtime in demo mode", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        offlineDemoMode
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const src = new URL(iframe.src);

    expect(src.searchParams.get("terrainPlan")).toBe("cesium");
    expect(src.searchParams.get("offlineMapRegion")).toBe("seungjin");
    expect(src.searchParams.get("offlineMapManifest")).toContain(
      "/offline-map/seungjin/manifest.json"
    );
    expect(src.searchParams.get("offlineSatelliteTileUrl")).toContain(
      "/offline-map/seungjin/raster/satellite/{z}/{x}/{y}.jpg"
    );
  });

  test("reposts the snapshot when the viewer announces readiness", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { frameWindow, postMessage } = attachIframeWindow(iframe);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: frameWindow as unknown as MessageEventSource,
          data: {
            type: "terrain3d:ready",
          },
        })
      );
    });

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "terrain3d:runtime-snapshot",
        payload: SAMPLE_SNAPSHOT,
      },
      window.location.origin
    );
  });

  test("refresh button sends the latest runtime snapshot", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { postMessage } = attachIframeWindow(iframe);

    fireEvent.click(screen.getByRole("button", { name: "갱신" }));

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "terrain3d:runtime-snapshot",
        payload: SAMPLE_SNAPSHOT,
      },
      window.location.origin
    );
  });

  test("collapses and restores the command sidebar", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    expect(queryPlayPauseButton()).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "패널 접기" }));

    expect(queryPlayPauseButton()).toBeNull();
    expect(screen.getByRole("button", { name: "패널 펼치기" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "패널 펼치기" }));

    expect(queryPlayPauseButton()).toBeTruthy();
  });

  test("renders in-bounds assets on the left panel and focuses them in the viewer", () => {
    const snapshot = {
      ...SAMPLE_SNAPSHOT,
      units: [
        {
          id: "unit-1",
          name: "Alpha",
          className: "Tank",
          latitude: 37.5,
          longitude: 127.1,
          selected: false,
        },
        {
          id: "unit-2",
          name: "Outside",
          className: "Tank",
          latitude: 38.5,
          longitude: 128.1,
          selected: false,
        },
      ],
    };
    const game = {
      ...createGameMock(),
      getBattleSpectatorSnapshot: vi.fn(() => snapshot),
    } as unknown as Game;

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { postMessage } = attachIframeWindow(iframe);

    expect(screen.getByRole("button", { name: "Alpha" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Outside" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Alpha" }));

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "terrain3d:command",
        payload: {
          command: "focus-unit",
          unitId: "unit-1",
        },
      },
      window.location.origin
    );
  });

  test("streams live runtime snapshots while continueSimulation is enabled", async () => {
    let currentTime = 0;
    const game = {
      ...createGameMock(),
      getBattleSpectatorSnapshot: vi.fn(() => ({
        ...SAMPLE_SNAPSHOT,
        currentTime: currentTime++,
      })),
    } as unknown as Game;

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        continueSimulation
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { postMessage } = attachIframeWindow(iframe);

    fireEvent.load(iframe);

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(postMessage.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(postMessage.mock.calls.at(-1)).toEqual([
      {
        type: "terrain3d:runtime-snapshot",
        payload: expect.objectContaining({
          currentTime: expect.any(Number),
        }),
      },
      window.location.origin,
    ]);
  });

  test("advances the game loop while continueSimulation is enabled", async () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        continueSimulation
        onBack={vi.fn()}
      />
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(game.stepForTimeCompression).toHaveBeenCalled();
    expect(game.recordStep).toHaveBeenCalled();
  });

  test("lets the operator change time compression from the sidebar", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "4x" }));

    expect(game.currentScenario.timeCompression).toBe(4);
  });

  test("sends visual option commands to the terrain runtime", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { postMessage } = attachIframeWindow(iframe);

    fireEvent.load(iframe);
    fireEvent.click(screen.getByRole("button", { name: "궤적 OFF" }));

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "terrain3d:command",
        payload: {
          command: "set-visual-options",
          options: expect.objectContaining({
            showWeaponTrails: true,
          }),
        },
      },
      window.location.origin
    );
  });

  test("lets the operator hide the AI terrain briefing", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { postMessage } = attachIframeWindow(iframe);

    fireEvent.load(iframe);
    fireEvent.click(screen.getByRole("button", { name: "AI 브리핑 ON" }));

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "terrain3d:command",
        payload: {
          command: "set-visual-options",
          options: expect.objectContaining({
            showTerrainBriefing: false,
          }),
        },
      },
      window.location.origin
    );
  });

  test("defaults impact auto-tracking to off", () => {
    const game = createGameMock();

    render(
      <Terrain3dPage
        bounds={{
          west: 127.0,
          south: 37.4,
          east: 127.2,
          north: 37.6,
        }}
        game={game}
        onBack={vi.fn()}
      />
    );

    const iframe = screen.getByTitle("선택 지형 3D") as HTMLIFrameElement;
    const { frameWindow, postMessage } = attachIframeWindow(iframe);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: window.location.origin,
          source: frameWindow as unknown as MessageEventSource,
          data: {
            type: "terrain3d:ready",
          },
        })
      );
    });

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: "terrain3d:command",
        payload: {
          command: "set-visual-options",
          options: expect.objectContaining({
            autoTrackImpacts: false,
          }),
        },
      },
      window.location.origin
    );
  });
});
