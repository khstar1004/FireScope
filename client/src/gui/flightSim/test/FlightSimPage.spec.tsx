import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type Game from "@/game/Game";
import FlightSimPage from "@/gui/flightSim/FlightSimPage";

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
});
