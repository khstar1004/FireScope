import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RlLabPage from "@/gui/rl/RlLabPage";

function createCapabilitiesResponse() {
  return {
    available: true,
    mode: "local",
    pythonCommand: "python",
    gymRoot: "C:/gym",
    supportedAlgorithms: ["ppo", "ddpg", "td3"],
    defaultScenarioText: JSON.stringify(
      {
        name: "RL Test Scenario",
        sides: [
          {
            id: "blue",
            name: "BLUE",
            relationships: [],
            units: [
              {
                id: "blue-1",
                name: "BLUE-1",
                className: "F-16C",
                type: "aircraft",
                latitude: 37.5,
                longitude: 127,
                altitude: 12000,
                speed: 420,
                weapons: [{ id: "aim-120", quantity: 2 }],
              },
            ],
          },
          {
            id: "red",
            name: "RED",
            relationships: [],
            units: [
              {
                id: "target-1",
                name: "Target 1",
                className: "SA-2 Site",
                type: "facility",
                latitude: 37.6,
                longitude: 127.1,
                altitude: 0,
              },
            ],
          },
        ],
      },
      null,
      2
    ),
    defaultForm: {
      algorithms: ["ppo"],
      timesteps: 1000,
      maxEpisodeSteps: 200,
      evalEpisodes: 5,
      evalSeedCount: 4,
      curriculumEnabled: false,
      seed: 7,
      progressEvalFrequency: 100,
      progressEvalEpisodes: 2,
      controllableSideName: "BLUE",
      targetSideName: "RED",
      allyIds: ["blue-1"],
      targetIds: ["target-1"],
      highValueTargetIds: ["target-1"],
      rewardConfig: {
        killBase: 10,
        highValueTargetBonus: 5,
        totWeight: 1,
        totTauSeconds: 60,
        etaProgressWeight: 2,
        readyToFireBonus: 1,
        stagnationPenaltyPerAssignment: -0.15,
        targetSwitchPenalty: -0.3,
        threatStepPenalty: 0.1,
        launchCostPerWeapon: 0.2,
        timeCostPerStep: 0.01,
        lossPenaltyPerAlly: 5,
        successBonus: 15,
        failurePenalty: 12,
      },
    },
  };
}

describe("RlLabPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url === "/api/rl/fixed-target-strike/capabilities") {
          return {
            ok: true,
            json: async () => createCapabilitiesResponse(),
          } as Response;
        }

        if (url === "/api/rl/jobs") {
          return {
            ok: true,
            json: async () => [],
          } as Response;
        }

        throw new Error(`Unexpected fetch request: ${url}`);
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
  });

  test("renders inside a viewport-fixed scroll container", async () => {
    render(
      <RlLabPage
        onBack={vi.fn()}
        initialJobId={null}
        onJobIdChange={vi.fn()}
        openReplayOnMap={vi.fn()}
      />
    );

    await waitFor(() =>
      expect(screen.getByText("Fixed Target Strike 학습 설계실")).toBeInTheDocument()
    );

    expect(screen.getByTestId("rl-lab-page")).toHaveStyle({
      position: "fixed",
      inset: "0",
      overflowY: "auto",
      overflowX: "hidden",
    });
    expect(screen.getByText("DDPG")).toBeInTheDocument();
    expect(screen.getByText("TD3")).toBeInTheDocument();
    expect(screen.getByLabelText("ETA Progress Weight")).toHaveValue(2);
    expect(screen.getByLabelText("Eval Seed Count")).toHaveValue(4);
  });
});
