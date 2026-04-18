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
    schemaVersion: 2,
    scenarioId: "battle-demo",
    scenarioName: "전장 관전자 데모",
    currentTime: 1770000000,
    currentSideId: "blue-side",
    currentSideName: "청군",
    selectedUnitId: "unit-1",
    centerLongitude: 126.978,
    centerLatitude: 37.5665,
    units: [
      {
        id: "unit-1",
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
        altitudeMeters: 8000,
        headingDeg: 90,
        speedKts: 340,
        weaponCount: 4,
        hpFraction: 1,
        damageFraction: 0,
        detectionRangeNm: 60,
        detectionArcDegrees: 360,
        detectionHeadingDeg: 90,
        engagementRangeNm: 50,
        currentFuel: 12000,
        maxFuel: 12000,
        fuelFraction: 1,
        route: [],
        desiredRoute: [],
        weaponInventory: [
          {
            id: "store-1",
            name: "AIM-120 AMRAAM",
            className: "AIM-120 AMRAAM",
            quantity: 4,
            maxQuantity: 4,
            modelId: "weapon-air-to-air-missile",
          },
        ],
        aircraftCount: undefined,
        homeBaseId: "airbase-1",
        rtb: false,
        statusFlags: ["selected", "engaged"],
        selected: true,
        targetId: "unit-2",
      },
      {
        id: "unit-2",
        name: "적 포대",
        className: "K9 Thunder",
        entityType: "facility",
        modelId: "artillery-k9",
        profileHint: "fires",
        groundUnit: false,
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
        damageFraction: 0.14,
        detectionRangeNm: 40,
        detectionArcDegrees: 360,
        detectionHeadingDeg: 10,
        engagementRangeNm: 20,
        route: [],
        desiredRoute: [],
        weaponInventory: [],
        statusFlags: ["engaged", "empty-launcher"],
        selected: false,
        targetId: "unit-1",
      },
    ],
    weapons: [
      {
        id: "weapon-1",
        name: "AIM-120 AMRAAM #1",
        className: "AIM-120 AMRAAM",
        modelId: "weapon-air-to-air-missile",
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
        hpFraction: 1,
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
        actorName: "KF-21 #201",
        sourceLatitude: 37.5665,
        sourceLongitude: 126.978,
        targetId: "unit-2",
        targetName: "적 포대",
        targetLatitude: 37.61,
        targetLongitude: 127.05,
        weaponId: "weapon-1",
        focusLatitude: 37.58,
        focusLongitude: 127.01,
        focusAltitudeMeters: 7800,
        resultTag: "launch",
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
        actorName: "적 포대",
        sourceLatitude: 37.61,
        sourceLongitude: 127.05,
        targetId: "unit-1",
        targetName: "KF-21 #201",
        targetLatitude: 37.5665,
        targetLongitude: 126.978,
        focusLatitude: 37.61,
        focusLongitude: 127.05,
        focusAltitudeMeters: 0,
        resultTag: "counterfire",
      },
    ],
    stats: {
      aircraft: 1,
      facilities: 1,
      airbases: 0,
      ships: 0,
      groundUnits: 0,
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

function cloneBattleSpectatorState(
  state: FlightSimBattleSpectatorState = createBattleSpectatorState()
): FlightSimBattleSpectatorState {
  return {
    ...state,
    units: state.units.map((unit) => ({
      ...unit,
      route: unit.route.map((point) => ({ ...point })),
      desiredRoute: unit.desiredRoute.map((point) => ({ ...point })),
      weaponInventory: unit.weaponInventory.map((inventory) => ({
        ...inventory,
      })),
      statusFlags: [...unit.statusFlags],
    })),
    weapons: state.weapons.map((weapon) => ({ ...weapon })),
    recentEvents: state.recentEvents.map((event) => ({ ...event })),
    stats: { ...state.stats },
  };
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

  test("sends battle spectator runtime state and auto-focuses the latest engagement", async () => {
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
              followTargetId: "weapon:weapon-1",
              lodLevel: "balanced",
            }),
          }),
        }),
        window.location.origin
      );
    });

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

  test("keeps hostile incoming events visible when they involve the filtered side", async () => {
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
        screen.getByText("적 포대가 대응 사격을 시작했습니다.")
      ).toBeInTheDocument();
    });
  });

  test("shows tactical spectator panels and lets recent events drive tracking", async () => {
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

    expect(screen.getByText("선택 유닛 분석")).toBeInTheDocument();
    expect(screen.getByText("위협 상위 유닛")).toBeInTheDocument();
    expect(screen.getByText("전투 확인")).toBeInTheDocument();
    expect(screen.getByText("실시간 탄체 추적 가능")).toBeInTheDocument();
    expect(screen.getByText("탄체 궤적 관제")).toBeInTheDocument();
    expect(screen.getByText("교전 밀집구역")).toBeInTheDocument();
    expect(screen.getByText("유닛별 교전 템포")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전장 개관" })).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes("현재 표적")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "관련 탄체 추적" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "핫스팟 점프" }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "템포 추적" }).length
    ).toBeGreaterThan(0);

    const iframeElement = container.querySelector("iframe") as HTMLIFrameElement;
    const followTargetSelect = container.querySelector(
      "select"
    ) as HTMLSelectElement;
    Object.defineProperty(iframeElement, "contentWindow", {
      configurable: true,
      value: {
        postMessage: postMessageSpy,
      },
    });

    fireEvent.load(iframeElement);
    await flushEffects();

    postMessageSpy.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "전장 개관" }));

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "firescope-battle-spectator-command",
          payload: expect.objectContaining({
            command: "jump-to-point",
            longitude: 126.978,
            latitude: 37.5665,
          }),
        }),
        window.location.origin
      );
    });

    await waitFor(() => {
      expect(followTargetSelect.value).toBe("");
    });

    postMessageSpy.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "관련 탄체 추적" }));
    await flushEffects();

    await waitFor(() => {
      expect(followTargetSelect.value).toBe("weapon:weapon-1");
    });

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

  test("can auto-capture the latest projectile when the operator enables it", async () => {
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
    Object.defineProperty(iframeElement, "contentWindow", {
      configurable: true,
      value: {
        postMessage: postMessageSpy,
      },
    });

    fireEvent.load(iframeElement);
    await flushEffects();

    fireEvent.click(screen.getByRole("button", { name: "자동 포착" }));

    await waitFor(() => {
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "firescope-battle-spectator-update",
          payload: expect.objectContaining({
            view: expect.objectContaining({
              followTargetId: "weapon:weapon-1",
            }),
          }),
        }),
        window.location.origin
      );
    });

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

  test("renders side strength trends and skips duplicate runtime sync for identical snapshots", async () => {
    const postMessageSpy = vi.fn();
    const battleSpectator = createBattleSpectatorState();
    const { container, rerender } = render(
      <FlightSimPage
        onBack={vi.fn()}
        initialCraft="drone"
        initialLocation={{ lon: 126.978, lat: 37.5665 }}
        battleSpectator={battleSpectator}
      />
    );
    await flushEffects();

    expect(screen.getByText("세력별 전력 추이")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "청군만 보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "적군만 보기" })).toBeInTheDocument();

    const iframeElement = container.querySelector("iframe") as HTMLIFrameElement;
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
        }),
        window.location.origin
      );
    });

    postMessageSpy.mockClear();

    rerender(
      <FlightSimPage
        onBack={vi.fn()}
        initialCraft="drone"
        initialLocation={{ lon: 126.978, lat: 37.5665 }}
        battleSpectator={cloneBattleSpectatorState(battleSpectator)}
      />
    );
    await flushEffects();

    expect(postMessageSpy).not.toHaveBeenCalled();
  });
});
