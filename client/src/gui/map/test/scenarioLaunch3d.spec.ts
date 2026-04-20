import { describe, expect, test, vi } from "vitest";
import { openScenarioLaunch3dFlightSim } from "@/gui/map/scenarioLaunch3d";
import type { FocusFireSummary } from "@/game/Game";

function createFocusFireSummary(
  overrides: Partial<FocusFireSummary> = {}
): FocusFireSummary {
  return {
    enabled: true,
    active: true,
    objectiveName: "집중포격 목표",
    objectiveLatitude: 38.161048,
    objectiveLongitude: 127.309303,
    desiredEffectOverride: null,
    captureProgress: 42,
    artilleryCount: 2,
    armorCount: 1,
    aircraftCount: 3,
    weaponsInFlight: 4,
    statusLabel: "집중포격 진행 중",
    launchPlatforms: [],
    weaponTracks: [],
    recommendation: null,
    ...overrides,
  };
}

describe("scenario launch 3d routing", () => {
  test("opens the flight sim screen with the current scenario objective when available", () => {
    const openFlightSimPage = vi.fn();

    openScenarioLaunch3dFlightSim({
      openFlightSimPage,
      defaultCenter: [126.978, 37.5665],
      focusFireSummary: createFocusFireSummary(),
      continueSimulation: true,
    });

    expect(openFlightSimPage).toHaveBeenCalledWith(
      [127.309303, 38.161048],
      "jet",
      {
        objectiveName: "집중포격 목표",
        objectiveLon: 127.309303,
        objectiveLat: 38.161048,
        active: true,
        captureProgress: 42,
        aircraftCount: 3,
        artilleryCount: 2,
        armorCount: 1,
        weaponsInFlight: 4,
        statusLabel: "집중포격 진행 중",
        launchPlatforms: [],
        weaponTracks: [],
        continueSimulation: true,
      }
    );
  });

  test("falls back to the current scenario center when no objective exists", () => {
    const openFlightSimPage = vi.fn();

    openScenarioLaunch3dFlightSim({
      openFlightSimPage,
      defaultCenter: [126.978, 37.5665],
      focusFireSummary: createFocusFireSummary({
        objectiveName: null,
        objectiveLatitude: null,
        objectiveLongitude: null,
      }),
      continueSimulation: true,
    });

    expect(openFlightSimPage).toHaveBeenCalledWith([126.978, 37.5665], "jet", {
      continueSimulation: true,
    });
  });
});
