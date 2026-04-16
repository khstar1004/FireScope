import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type Game from "@/game/Game";
import { SimulationLogType } from "@/game/log/SimulationLogs";
import FlightSimPage from "@/gui/flightSim/FlightSimPage";
import type { FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";

function createFocusFireSummary() {
  return {
    objectiveName: "집중포격 목표",
    objectiveLatitude: 37.5665,
    objectiveLongitude: 126.978,
    active: false,
    captureProgress: 42,
    aircraftCount: 3,
    artilleryCount: 4,
    armorCount: 2,
    weaponsInFlight: 1,
    statusLabel: "집중포격 준비",
    launchPlatforms: [],
    weaponTracks: [],
  };
}

function createGameWithFocusFireSummary(): Game {
  return {
    getFocusFireSummary: vi.fn(() => createFocusFireSummary()),
  } as unknown as Game;
}

function createBattleSpectatorState(): FlightSimBattleSpectatorState {
  return {
    scenarioId: "battle-demo",
    scenarioName: "전장 관전자 데모",
    currentTime: 1770000000,
    currentSideId: "blue-side",
    currentSideName: "청군",
    centerLongitude: 126.978,
    centerLatitude: 37.5665,
    units: [
      {
        id: "unit-1",
        name: "KF-21 #201",
        className: "KF-21 Boramae",
        entityType: "aircraft",
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.5665,
        longitude: 126.978,
        altitudeMeters: 8000,
        headingDeg: 90,
        speedKts: 340,
        weaponCount: 4,
        hpFraction: 1,
        selected: true,
      },
      {
        id: "unit-2",
        name: "적 포대",
        className: "K9 Thunder",
        entityType: "facility",
        sideId: "red-side",
        sideName: "적군",
        sideColor: "red",
        latitude: 37.61,
        longitude: 127.05,
        altitudeMeters: 0,
        headingDeg: 10,
        speedKts: 0,
        weaponCount: 0,
        hpFraction: 0.86,
        selected: false,
      },
    ],
    weapons: [
      {
        id: "weapon-1",
        name: "AIM-120 AMRAAM #1",
        className: "AIM-120 AMRAAM",
        launcherId: "unit-1",
        launcherName: "KF-21 #201",
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        latitude: 37.58,
        longitude: 127.01,
        altitudeMeters: 7800,
        launchLatitude: 37.5665,
        launchLongitude: 126.978,
        launchAltitudeMeters: 8000,
        headingDeg: 88,
        speedKts: 600,
        targetId: "target-1",
        targetLatitude: 37.61,
        targetLongitude: 127.05,
      },
    ],
    recentEvents: [
      {
        id: "log-1",
        timestamp: 1770000000,
        sideId: "blue-side",
        sideName: "청군",
        sideColor: "blue",
        type: SimulationLogType.WEAPON_LAUNCHED,
        message: "KF-21 #201이(가) 적 표적을 향해 AIM-120을 발사했습니다.",
        actorId: "unit-1",
        sourceLatitude: 37.5665,
        sourceLongitude: 126.978,
        targetId: "unit-2",
        targetLatitude: 37.61,
        targetLongitude: 127.05,
        weaponId: "weapon-1",
        focusLatitude: 37.58,
        focusLongitude: 127.01,
      },
      {
        id: "log-2",
        timestamp: 1770000005,
        sideId: "red-side",
        sideName: "적군",
        sideColor: "red",
        type: SimulationLogType.WEAPON_LAUNCHED,
        message: "적 포대가 대응 사격을 시작했습니다.",
        actorId: "unit-2",
        sourceLatitude: 37.61,
        sourceLongitude: 127.05,
        targetId: "unit-1",
        targetLatitude: 37.5665,
        targetLongitude: 126.978,
      },
    ],
    stats: {
      aircraft: 1,
      facilities: 1,
      airbases: 0,
      ships: 0,
      weaponsInFlight: 1,
      sides: 2,
    },
    continueSimulation: true,
  };
}

function createGameWithBattleSpectatorState(): Game {
  return {
    getBattleSpectatorSnapshot: vi.fn(() => createBattleSpectatorState()),
  } as unknown as Game;
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("FlightSimPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true }) as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("keeps general jet experience free of focus-fire runtime state", async () => {
    const game = createGameWithFocusFireSummary();
    const { container } = render(
      <FlightSimPage
        onBack={vi.fn()}
        initialCraft="jet"
        initialLocation={{ lon: 126.978, lat: 37.5665 }}
        game={game}
      />
    );
    await flushEffects();
    const iframe = container.querySelector("iframe");

    expect(iframe).not.toBeNull();

    const iframeUrl = new URL((iframe as HTMLIFrameElement).src);
    expect(iframeUrl.searchParams.get("focusFire")).toBeNull();
  });

  test("sends focus-fire runtime state only for explicit focus-fire airwatch sessions", async () => {
    const postMessageSpy = vi.fn();
    const focusFireAirwatch = {
      objectiveName: "집중포격 목표",
      objectiveLon: 126.978,
      objectiveLat: 37.5665,
      active: true,
      captureProgress: 55,
      aircraftCount: 3,
      artilleryCount: 4,
      armorCount: 2,
      weaponsInFlight: 2,
      statusLabel: "집중포격 진행 중",
      launchPlatforms: [],
      weaponTracks: [],
    };
    const { container } = render(
      <FlightSimPage
        onBack={vi.fn()}
        initialCraft="jet"
        initialLocation={{ lon: 126.978, lat: 37.5665 }}
        game={createGameWithFocusFireSummary()}
        focusFireAirwatch={focusFireAirwatch}
      />
    );
    await flushEffects();
    const iframe = container.querySelector("iframe");

    expect(iframe).not.toBeNull();
    expect(screen.getByText("집중포격 분석")).toBeInTheDocument();
    expect(screen.getByText(/충격량 지수/)).toBeInTheDocument();
    const iframeElement = iframe as HTMLIFrameElement;

    const iframeUrl = new URL(iframeElement.src);
    expect(iframeUrl.searchParams.get("focusFire")).toBe("1");
    expect(iframeUrl.searchParams.get("objectiveLon")).toBe("126.978000");
    expect(iframeUrl.searchParams.get("objectiveLat")).toBe("37.566500");

    Object.defineProperty(iframeElement, "contentWindow", {
      configurable: true,
      value: {
        postMessage: postMessageSpy,
      },
    });

    fireEvent.load(iframeElement);
    await flushEffects();

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "firescope-focus-fire-update",
          payload: expect.objectContaining({
            objectiveName: "집중포격 목표",
            objectiveLon: 126.978,
            objectiveLat: 37.5665,
          }),
        }),
        window.location.origin
      );
    });
  });

  test("sends battle spectator runtime state for live battle observer sessions", async () => {
    const postMessageSpy = vi.fn();
    const battleSpectator = createBattleSpectatorState();
    const { container } = render(
      <FlightSimPage
        onBack={vi.fn()}
        initialCraft="drone"
        initialLocation={{ lon: 126.978, lat: 37.5665 }}
        game={createGameWithBattleSpectatorState()}
        continueSimulation
        battleSpectator={battleSpectator}
      />
    );
    await flushEffects();
    const iframe = container.querySelector("iframe");

    expect(iframe).not.toBeNull();
    expect(screen.getByText("실시간 전장 상태")).toBeInTheDocument();

    const iframeElement = iframe as HTMLIFrameElement;
    const iframeUrl = new URL(iframeElement.src);
    expect(iframeUrl.searchParams.get("battleSpectator")).toBe("1");

    Object.defineProperty(iframeElement, "contentWindow", {
      configurable: true,
      value: {
        postMessage: postMessageSpy,
      },
    });

    fireEvent.load(iframeElement);
    await flushEffects();

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "firescope-battle-spectator-update",
          payload: expect.objectContaining({
            scenarioId: "battle-demo",
            scenarioName: "전장 관전자 데모",
            view: expect.objectContaining({
              followTargetId: null,
              lodLevel: "balanced",
            }),
          }),
        }),
        window.location.origin
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "최신 교전으로 점프" })
    );

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "firescope-battle-spectator-command",
          payload: expect.objectContaining({
            command: "jump-to-point",
            longitude: 127.01,
            latitude: 37.58,
          }),
        }),
        window.location.origin
      );
    });
  });

  test("keeps follow-target options readable and prefixes unit tracking ids", async () => {
    const postMessageSpy = vi.fn();
    const { container } = render(
      <FlightSimPage
        onBack={vi.fn()}
        initialCraft="drone"
        initialLocation={{ lon: 126.978, lat: 37.5665 }}
        game={createGameWithBattleSpectatorState()}
        continueSimulation
        battleSpectator={createBattleSpectatorState()}
      />
    );
    await flushEffects();
    const iframeElement = container.querySelector("iframe") as HTMLIFrameElement;

    expect(
      screen.getByRole("option", { name: "[청군] KF-21 #201" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "[적군] 적 포대" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "[탄체] AIM-120 AMRAAM #1" })
    ).toBeInTheDocument();

    Object.defineProperty(iframeElement, "contentWindow", {
      configurable: true,
      value: {
        postMessage: postMessageSpy,
      },
    });

    fireEvent.load(iframeElement);
    await flushEffects();

    fireEvent.click(screen.getByRole("button", { name: "선택 유닛 추적" }));

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "firescope-battle-spectator-update",
          payload: expect.objectContaining({
            view: expect.objectContaining({
              followTargetId: "unit:unit-1",
            }),
          }),
        }),
        window.location.origin
      );
    });
  });

  test("filters recent battle events with the selected side", async () => {
    render(
      <FlightSimPage
        onBack={vi.fn()}
        initialCraft="drone"
        initialLocation={{ lon: 126.978, lat: 37.5665 }}
        game={createGameWithBattleSpectatorState()}
        continueSimulation
        battleSpectator={createBattleSpectatorState()}
      />
    );
    await flushEffects();

    expect(
      screen.getByText("KF-21 #201이(가) 적 표적을 향해 AIM-120을 발사했습니다.")
    ).toBeInTheDocument();
    expect(screen.getByText("적 포대가 대응 사격을 시작했습니다.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "청군" }));

    await waitFor(() => {
      expect(
        screen.getByText("KF-21 #201이(가) 적 표적을 향해 AIM-120을 발사했습니다.")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("적 포대가 대응 사격을 시작했습니다.")
      ).not.toBeInTheDocument();
    });
  });
});
