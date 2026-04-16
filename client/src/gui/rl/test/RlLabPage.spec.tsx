import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RlLabPage from "@/gui/rl/RlLabPage";
import { RL_CHECKPOINT_SPECTATOR_KEY } from "@/gui/rl/rlLabRoute";

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

function createCommanderCapabilitiesResponse() {
  return {
    available: true,
    mode: "local",
    pythonCommand: "python",
    gymRoot: "C:/gym",
    commanderScriptPath:
      "C:/gym/scripts/fixed_target_strike/commander_optimize.py",
    presets: [
      {
        key: "smoke",
        label: "스모크 점검",
        description: "Smoke",
        candidateLimit: 6,
        maxResourceCombinations: 3,
        distanceScales: [0.7, 1],
        bearingOffsetsDeg: [-30, 0, 30],
        formationSpreadsNm: [0],
      },
    ],
    defaultForm: {
      preset: "smoke",
      candidateLimit: 6,
      retainTopK: 3,
      minAllies: 1,
      maxAllies: null,
      maxResourceCombinations: 3,
      distanceScales: [0.7, 1],
      bearingOffsetsDeg: [-30, 0, 30],
      formationSpreadsNm: [0],
      highValueTargetSearchMode: "fixed",
      dryRun: true,
    },
  };
}

function createRlJobSnapshot() {
  const checkpoints = [
    {
      algorithm: "ppo",
      timesteps: 0,
      eval_mean_reward: 12,
      eval_std_reward: 0,
      eval_success_rate: 0.25,
      replay_available: true,
      recording_path:
        "C:/jobs/job-1/runs/ppo/checkpoints/0000000/eval_recording.jsonl",
    },
    {
      algorithm: "ppo",
      timesteps: 512,
      eval_mean_reward: 28,
      eval_std_reward: 0,
      eval_success_rate: 0.75,
      replay_available: true,
      recording_path:
        "C:/jobs/job-1/runs/ppo/checkpoints/0000512/eval_recording.jsonl",
    },
  ];
  return {
    id: "job-1",
    status: "running",
    createdAt: "2026-04-14T00:00:00.000Z",
    startedAt: "2026-04-14T00:00:01.000Z",
    finishedAt: null,
    request: {
      algorithms: ["ppo"],
      timesteps: 1000,
      maxEpisodeSteps: 200,
      evalEpisodes: 1,
      evalSeedCount: 1,
      curriculumEnabled: false,
      seed: 7,
      progressEvalFrequency: 256,
      progressEvalEpisodes: 1,
      controllableSideName: "BLUE",
      targetSideName: "RED",
      allyIds: ["blue-1"],
      targetIds: ["target-1"],
      highValueTargetIds: ["target-1"],
      rewardConfig: {
        killBase: 10,
        highValueTargetBonus: 5,
      },
    },
    stdoutLines: [],
    stderrLines: [],
    progress: {
      status: "running",
      training_mode: "standard",
      current_timesteps: 512,
      timesteps_target: 1000,
      overall_timesteps: 512,
      overall_timesteps_target: 1000,
      current_algorithm: "ppo",
      algorithms: ["ppo"],
      checkpoints,
      episodes: [],
      algorithm_runs: {
        ppo: {
          algorithm: "ppo",
          status: "running",
          current_timesteps: 512,
          timesteps_target: 1000,
          checkpoints,
          episodes: [],
          best_checkpoint: checkpoints[1],
          final_evaluation: null,
          selected_model_path: null,
          final_model_path: null,
          error: null,
        },
      },
      best_run: null,
      error: null,
    },
    summary: null,
    artifacts: {
      scenario: true,
      model: false,
      summary: false,
      progress: true,
      evalScenario: false,
      evalRecording: false,
    },
  };
}

describe("RlLabPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const jobSnapshot = createRlJobSnapshot();

        if (url === "/api/rl/fixed-target-strike/capabilities") {
          return {
            ok: true,
            json: async () => createCapabilitiesResponse(),
          } as Response;
        }

        if (url === "/api/rl/commander/capabilities") {
          return {
            ok: true,
            json: async () => createCommanderCapabilitiesResponse(),
          } as Response;
        }

        if (url === "/api/rl/jobs") {
          return {
            ok: true,
            json: async () => [jobSnapshot],
          } as Response;
        }

        if (url === "/api/rl/commander/jobs") {
          return {
            ok: true,
            json: async () => [],
          } as Response;
        }

        if (url === "/api/rl/jobs/job-1") {
          return {
            ok: true,
            json: async () => jobSnapshot,
          } as Response;
        }

        if (
          url ===
          "/api/rl/jobs/job-1/checkpoint-recording?algorithm=ppo&timesteps=512"
        ) {
          return {
            ok: true,
            text: async () => "checkpoint replay content",
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
      expect(
        screen.getByText("고정표적 타격 강화학습 설계")
      ).toBeInTheDocument()
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
    expect(screen.getByText("지휘관 자원·배치 최적화")).toBeInTheDocument();
  });

  test("applies the beginner baseline setup with the standard preset", async () => {
    render(
      <RlLabPage
        onBack={vi.fn()}
        initialJobId={null}
        onJobIdChange={vi.fn()}
        openReplayOnMap={vi.fn()}
      />
    );

    const baselineButton = await screen.findByRole("button", {
      name: "체험 기본 세팅",
    });

    fireEvent.click(baselineButton);

    await waitFor(() =>
      expect(
        screen.getByText(/기본 시나리오 기준 기본 세팅을 적용했습니다/)
      ).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Timesteps")).toHaveValue(4096);
    expect(screen.getByLabelText("Eval Episodes")).toHaveValue(2);
    expect(screen.getByLabelText("Progress Eval Frequency")).toHaveValue(512);
  });

  test("opens the latest checkpoint replay on the map", async () => {
    const openReplayOnMap = vi.fn();

    render(
      <RlLabPage
        onBack={vi.fn()}
        initialJobId="job-1"
        onJobIdChange={vi.fn()}
        openReplayOnMap={openReplayOnMap}
      />
    );

    const checkpointReplayButton = await screen.findByRole("button", {
      name: "최신 체크포인트 리플레이",
    });

    await waitFor(() => expect(checkpointReplayButton).toBeEnabled());

    fireEvent.click(checkpointReplayButton);

    await waitFor(() =>
      expect(openReplayOnMap).toHaveBeenCalledWith(
        "checkpoint replay content",
        "PPO 체크포인트 512 리플레이"
      )
    );
  });

  test("starts checkpoint spectator mode on the main map", async () => {
    const openReplayOnMap = vi.fn();

    render(
      <RlLabPage
        onBack={vi.fn()}
        initialJobId="job-1"
        onJobIdChange={vi.fn()}
        openReplayOnMap={openReplayOnMap}
      />
    );

    const spectatorButton = await screen.findByRole("button", {
      name: "메인 맵 자동 감시",
    });

    await waitFor(() => expect(spectatorButton).toBeEnabled());

    fireEvent.click(spectatorButton);

    await waitFor(() =>
      expect(openReplayOnMap).toHaveBeenCalledWith(
        "checkpoint replay content",
        "PPO 체크포인트 512 리플레이"
      )
    );
    expect(
      window.sessionStorage.getItem(RL_CHECKPOINT_SPECTATOR_KEY)
    ).toContain('"jobId":"job-1"');
  });
});
