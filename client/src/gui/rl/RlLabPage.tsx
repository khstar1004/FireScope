import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MapIcon from "@mui/icons-material/Map";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import StopIcon from "@mui/icons-material/Stop";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RlLabLineChart from "@/gui/rl/RlLabLineChart";
import RlLabCommanderPanel from "@/gui/rl/RlLabCommanderPanel";
import RlLabInfoButton from "@/gui/rl/RlLabInfoButton";
import { RL_LAB_PALETTE } from "@/gui/rl/rlLabPalette";
import {
  RL_CHECKPOINT_SPECTATOR_KEY,
  RL_LAB_SCENARIO_KEY,
} from "@/gui/rl/rlLabRoute";
import {
  analyzeRlScenario,
  validateRlScenarioSelection,
} from "@/gui/rl/rlLabScenarioSupport";
import rlFirstSuccessDemoJson from "@/scenarios/rl_first_success_demo.json";
import rlBattleOptimizationDemoJson from "@/scenarios/rl_battle_optimization_demo.json";
import {
  RL_LAB_SUPPORTED_ALGORITHMS,
  applyTrainingRequestToForm,
  formatCommaSeparatedIds,
  normalizeAlgorithmIds,
  parseCommaSeparatedIds,
  retainAllowedIds,
  toggleIdSelection,
} from "@/gui/rl/rlLabTrainingSupport";
import RlBattleWatchPanel from "@/gui/rl/RlBattleWatchPanel";


import {
  ACCORDION_SX,
  applyScenarioRecommendations,
  applyScenarioSetup,
  ApplyScenarioSetupOptions,
  BREAK_TEXT_SX,
  buildCommandPreview,
  CHART_GRID_SX,
  DARK_PANEL_SX,
  DASHBOARD_CARD_SX,
  DASHBOARD_GRID_SX,
  fallbackForm,
  formatAlgorithmLabel,
  formatMetricLeaderLabel,
  formatMetricNumber,
  formatOptionalNumber,
  formatPercent,
  formatRelativeTimestamp,
  formatRewardBreakdownLabels,
  formatSeedVariabilityReasons,
  formatSelectedTargets,
  formatStatusLabel,
  hasCheckpointReplay,
  MUTED_TEXT_SX,
  PRIMARY_BUTTON_SX,
  RewardConfigForm,
  RlAccordionHeader,
  RlAccordionHeaderProps,
  rlBattleOptimizationDemoText,
  RlCapabilities,
  RlDashboardMetricCard,
  RlDashboardMetricCardProps,
  rlFirstSuccessDemoText,
  RlJobAlgorithmProgress,
  RlJobCheckpoint,
  RlJobEpisode,
  RlJobEvaluation,
  RlJobEvaluationSnapshot,
  RlJobLeaderboardEntry,
  RlJobListItem,
  RlJobMetricLeader,
  RlJobProgress,
  RlJobRetainedModel,
  RlJobSnapshot,
  RlJobSummary,
  RlJobSummaryRun,
  RlLabPageProps,
  RlSeedVariabilitySummary,
  SECTION_LABEL_SX,
  statusColor,
  SURFACE_PAPER_SX,
  TABLE_CONTAINER_SX,
  toRewardConfigForm,
  TrainingForm,
  TrainingPreset,
  trainingPresets,
  WRAP_ROW_SX,
} from "./page/RlLabPageSupport";

import RlLabPageView from "./view/RlLabPageView";

export default function RlLabPage(props: Readonly<RlLabPageProps>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [capabilities, setCapabilities] = useState<RlCapabilities | null>(null);
  const [form, setForm] = useState<TrainingForm>(fallbackForm);
  const [job, setJob] = useState<RlJobSnapshot | null>(null);
  const [jobs, setJobs] = useState<RlJobListItem[]>([]);
  const [jobId, setJobId] = useState<string | null>(props.initialJobId ?? null);
  const [loadingCapabilities, setLoadingCapabilities] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [startingJob, setStartingJob] = useState(false);
  const [restoringJobId, setRestoringJobId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);
  const deferredScenarioText = useDeferredValue(form.scenarioText);
  const baselinePreset =
    trainingPresets.find((preset) => preset.key === "standard") ??
    trainingPresets[0];
  const importedMapScenario =
    typeof window === "undefined"
      ? ""
      : (window.sessionStorage.getItem(RL_LAB_SCENARIO_KEY) ?? "").trim();
  const hasImportedMapScenario = importedMapScenario.length > 0;

  useEffect(() => {
    let active = true;

    const loadCapabilities = async () => {
      setLoadingCapabilities(true);
      try {
        const response = await fetch(
          "/api/rl/fixed-target-strike/capabilities"
        );
        if (!response.ok) {
          throw new Error("RL API capabilities could not be loaded.");
        }
        const payload = (await response.json()) as RlCapabilities;
        if (!active) {
          return;
        }
        setCapabilities(payload);
        const importedScenario =
          window.sessionStorage.getItem(RL_LAB_SCENARIO_KEY);
        const scenarioText = importedScenario ?? payload.defaultScenarioText;
        setScenarioMessage(
          importedScenario
            ? "현재 지도 시나리오와 추천 학습 구성을 자동으로 불러왔습니다."
            : "기본 고정 표적 타격 시나리오와 추천 학습 구성을 불러왔습니다."
        );
        const baseForm: TrainingForm = {
          experimentLabel: "",
          algorithms: normalizeAlgorithmIds(
            payload.defaultForm.algorithms,
            payload.supportedAlgorithms ?? [...RL_LAB_SUPPORTED_ALGORITHMS]
          ),
          timesteps: payload.defaultForm.timesteps,
          maxEpisodeSteps: payload.defaultForm.maxEpisodeSteps,
          evalEpisodes: payload.defaultForm.evalEpisodes,
          evalSeedCount: payload.defaultForm.evalSeedCount,
          curriculumEnabled: payload.defaultForm.curriculumEnabled,
          guidedLaunchBootstrapSteps:
            payload.defaultForm.guidedLaunchBootstrapSteps,
          seed: payload.defaultForm.seed,
          progressEvalFrequency: payload.defaultForm.progressEvalFrequency,
          progressEvalEpisodes: payload.defaultForm.progressEvalEpisodes,
          controllableSideName: payload.defaultForm.controllableSideName,
          targetSideName: payload.defaultForm.targetSideName,
          allyIds: payload.defaultForm.allyIds.join(", "),
          targetIds: payload.defaultForm.targetIds.join(", "),
          highValueTargetIds: payload.defaultForm.highValueTargetIds.join(", "),
          scenarioText,
          rewardConfig: toRewardConfigForm(payload.defaultForm.rewardConfig),
        };
        setForm(applyScenarioRecommendations(baseForm, scenarioText));
      } catch (error) {
        if (!active) {
          return;
        }
        setPageError(
          error instanceof Error ? error.message : "RL API unavailable."
        );
      } finally {
        if (active) {
          setLoadingCapabilities(false);
        }
      }
    };

    void loadCapabilities();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const loadJobs = async () => {
      try {
        if (active) {
          setLoadingJobs(true);
        }
        const response = await fetch("/api/rl/jobs");
        if (!response.ok) {
          throw new Error("RL job list could not be loaded.");
        }
        const payload = (await response.json()) as RlJobListItem[];
        if (!active) {
          return;
        }
        setJobs(payload);
        const shouldPoll = payload.some(
          (item) => item.status === "running" || item.status === "queued"
        );
        timer = window.setTimeout(
          () => {
            void loadJobs();
          },
          shouldPoll ? 2500 : 8000
        );
      } catch (error) {
        if (!active) {
          return;
        }
        setPageError(
          error instanceof Error ? error.message : "RL job list unavailable."
        );
      } finally {
        if (active) {
          setLoadingJobs(false);
        }
      }
    };

    void loadJobs();
    return () => {
      active = false;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    props.onJobIdChange(jobId);
  }, [jobId, props.onJobIdChange]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    let active = true;
    let timer: number | undefined;

    const loadJob = async () => {
      const response = await fetch(`/api/rl/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("RL job status could not be loaded.");
      }
      const payload = (await response.json()) as RlJobSnapshot;
      if (!active) {
        return;
      }
      setJob(payload);
      if (payload.status === "running" || payload.status === "queued") {
        timer = window.setTimeout(() => {
          void loadJob();
        }, 1500);
      }
    };

    void loadJob().catch((error) => {
      if (active) {
        setPageError(
          error instanceof Error ? error.message : "RL job polling failed."
        );
      }
    });

    return () => {
      active = false;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [jobId]);

  const evalRewardPoints = useMemo(
    () =>
      job?.progress?.checkpoints.map((checkpoint) => ({
        x: checkpoint.timesteps,
        y: checkpoint.eval_mean_reward,
      })) ?? [],
    [job]
  );
  const evalSuccessRatePoints = useMemo(
    () =>
      job?.progress?.checkpoints.map((checkpoint) => ({
        x: checkpoint.timesteps,
        y: (checkpoint.eval_success_rate ?? 0) * 100,
      })) ?? [],
    [job]
  );
  const episodeRewardPoints = useMemo(
    () =>
      job?.progress?.episodes.map((episode) => ({
        x: episode.timesteps,
        y: episode.reward,
      })) ?? [],
    [job]
  );
  const allyIds = useMemo(
    () => parseCommaSeparatedIds(form.allyIds),
    [form.allyIds]
  );
  const targetIds = useMemo(
    () => parseCommaSeparatedIds(form.targetIds),
    [form.targetIds]
  );
  const highValueTargetIds = useMemo(
    () => parseCommaSeparatedIds(form.highValueTargetIds),
    [form.highValueTargetIds]
  );
  const scenarioAnalysis = useMemo(
    () => analyzeRlScenario(deferredScenarioText),
    [deferredScenarioText]
  );
  const selectedAllyIdSet = useMemo(() => new Set(allyIds), [allyIds]);
  const selectedTargetIdSet = useMemo(() => new Set(targetIds), [targetIds]);
  const selectedHighValueTargetIdSet = useMemo(
    () => new Set(highValueTargetIds),
    [highValueTargetIds]
  );
  const availableAllies = useMemo(() => {
    if (scenarioAnalysis.status !== "valid") {
      return [];
    }
    const selectedSideName = form.controllableSideName.trim();
    return scenarioAnalysis.allyOptions.filter(
      (ally) => !selectedSideName || ally.sideName === selectedSideName
    );
  }, [form.controllableSideName, scenarioAnalysis]);
  const availableTargets = useMemo(() => {
    if (scenarioAnalysis.status !== "valid") {
      return [];
    }
    const selectedSideName = form.targetSideName.trim();
    return scenarioAnalysis.targetOptions.filter(
      (target) => !selectedSideName || target.sideName === selectedSideName
    );
  }, [form.targetSideName, scenarioAnalysis]);
  const availableHighValueTargets = useMemo(
    () =>
      availableTargets.filter((target) => selectedTargetIdSet.has(target.id)),
    [availableTargets, selectedTargetIdSet]
  );
  const selectionIssues = useMemo(
    () =>
      validateRlScenarioSelection(scenarioAnalysis, {
        controllableSideName: form.controllableSideName,
        targetSideName: form.targetSideName,
        allyIds,
        targetIds,
        highValueTargetIds,
      }),
    [
      allyIds,
      form.controllableSideName,
      form.targetSideName,
      highValueTargetIds,
      scenarioAnalysis,
      targetIds,
    ]
  );
  const readyToTrain =
    Boolean(capabilities?.available) &&
    scenarioAnalysis.status === "valid" &&
    selectionIssues.length === 0;

  const supportedAlgorithms = useMemo(
    () =>
      normalizeAlgorithmIds(capabilities?.supportedAlgorithms, [
        ...RL_LAB_SUPPORTED_ALGORITHMS,
      ]),
    [capabilities?.supportedAlgorithms]
  );
  const algorithmRuns = job?.summary?.runs ?? [];
  const leaderboardEntries = job?.summary?.leaderboard ?? [];
  const orderedAlgorithmRuns = useMemo(() => {
    if (leaderboardEntries.length === 0) {
      return algorithmRuns;
    }
    const rankByAlgorithm = new Map(
      leaderboardEntries.map((entry) => [entry.algorithm, entry.rank] as const)
    );
    return [...algorithmRuns].sort((left, right) => {
      const leftRank =
        rankByAlgorithm.get(left.algorithm) ?? Number.MAX_SAFE_INTEGER;
      const rightRank =
        rankByAlgorithm.get(right.algorithm) ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    });
  }, [algorithmRuns, leaderboardEntries]);
  const leaderboardRankByAlgorithm = useMemo(
    () =>
      new Map(
        leaderboardEntries.map(
          (entry) => [entry.algorithm, entry.rank] as const
        )
      ),
    [leaderboardEntries]
  );
  const metricLeaderEntries = useMemo(
    () => Object.values(job?.summary?.metric_leaders ?? {}),
    [job?.summary?.metric_leaders]
  );
  const latestCheckpoint = job?.progress?.checkpoints.at(-1);
  const finalEvaluation =
    job?.summary?.evaluation ?? job?.progress?.final_evaluation;
  const currentAlgorithm =
    job?.progress?.current_algorithm ??
    job?.summary?.selected_algorithm ??
    job?.summary?.best_run?.algorithm ??
    job?.request.algorithms?.[0];
  const replayableCheckpoints = useMemo(
    () => (job?.progress?.checkpoints ?? []).filter(hasCheckpointReplay),
    [job?.progress?.checkpoints]
  );
  const latestReplayCheckpoint = replayableCheckpoints.at(-1) ?? null;
  const checkpointReplayRows = useMemo(
    () => [...replayableCheckpoints].reverse(),
    [replayableCheckpoints]
  );
  const latestRewardBreakdownLabels = formatRewardBreakdownLabels(
    finalEvaluation?.reward_breakdown ?? latestCheckpoint?.reward_breakdown
  );
  const battleWatchAssignmentLabels = useMemo(() => {
    const assignments =
      finalEvaluation?.selected_target_assignments ??
      latestCheckpoint?.selected_target_assignments ??
      {};
    const labels = Object.entries(assignments).map(
      ([allyId, assignedTargetId]) => `${allyId} -> ${assignedTargetId}`
    );
    if (labels.length > 0) {
      return labels;
    }

    const fallbackTargetLabel = formatSelectedTargets(
      finalEvaluation?.selected_target_id,
      finalEvaluation?.selected_target_ids ?? latestCheckpoint?.selected_target_ids
    );
    return fallbackTargetLabel !== "-" ? [`표적 ${fallbackTargetLabel}`] : [];
  }, [
    finalEvaluation?.selected_target_assignments,
    finalEvaluation?.selected_target_id,
    finalEvaluation?.selected_target_ids,
    latestCheckpoint?.selected_target_assignments,
    latestCheckpoint?.selected_target_ids,
  ]);
  const battleWatchWinRateLabel = formatPercent(
    finalEvaluation?.success_rate ??
      finalEvaluation?.win_rate ??
      latestCheckpoint?.eval_success_rate
  );
  const battleWatchRewardLabel = formatMetricNumber(
    finalEvaluation?.mean_reward ?? latestCheckpoint?.eval_mean_reward,
    1
  );
  const battleWatchTargetLabel = formatSelectedTargets(
    finalEvaluation?.selected_target_id,
    finalEvaluation?.selected_target_ids ?? latestCheckpoint?.selected_target_ids
  );
  const battleWatchLaunchCount =
    finalEvaluation?.launch_count ?? latestCheckpoint?.launch_count ?? 0;
  const battleWatchCheckpointStep =
    latestReplayCheckpoint?.timesteps ?? latestCheckpoint?.timesteps ?? null;
  const dashboardProgressLabel = job?.progress
    ? `${job.progress.current_timesteps} / ${job.progress.timesteps_target}`
    : `${form.timesteps} step`;
  const dashboardModeLabel =
    job?.summary?.training_mode ??
    job?.progress?.training_mode ??
    (form.curriculumEnabled ? "curriculum" : "standard");
  const dashboardSurvivalLabel = formatPercent(finalEvaluation?.survivability, 1);
  const dashboardReadyLabel = formatMetricNumber(
    finalEvaluation?.time_to_ready,
    1
  );
  const dashboardDoneLabel =
    finalEvaluation?.done_reason ?? latestCheckpoint?.done_reason ?? "-";
  const dashboardExperimentLabel =
    (job?.displayLabel ?? form.experimentLabel.trim()) || "실험 라벨 없음";
  const commandPreview = buildCommandPreview(form);
  const perSeedEvaluations = finalEvaluation?.per_seed_evaluations ?? [];
  const noLaunchTimeoutHint = useMemo(() => {
    const launchCount =
      finalEvaluation?.launch_count ?? latestCheckpoint?.launch_count;
    const doneReason =
      finalEvaluation?.done_reason ?? latestCheckpoint?.done_reason;
    const doneReasonDetail =
      finalEvaluation?.done_reason_detail ??
      latestCheckpoint?.done_reason_detail;
    if (
      doneReason !== "truncated" ||
      doneReasonDetail !== "max_episode_steps" ||
      (launchCount ?? 0) > 0
    ) {
      return null;
    }
    const selectedTargetId = `${
      finalEvaluation?.selected_target_id ??
      latestCheckpoint?.selected_target_id ??
      ""
    }`.trim();
    return {
      selectedTargetId: selectedTargetId || null,
    };
  }, [
    finalEvaluation?.done_reason,
    finalEvaluation?.done_reason_detail,
    finalEvaluation?.launch_count,
    finalEvaluation?.selected_target_id,
    latestCheckpoint?.done_reason,
    latestCheckpoint?.done_reason_detail,
    latestCheckpoint?.launch_count,
    latestCheckpoint?.selected_target_id,
  ]);
  const perSeedSuccessRatePoints = useMemo(
    () =>
      perSeedEvaluations.map((evaluation, index) => ({
        x:
          evaluation.evaluation_seed ??
          finalEvaluation?.benchmark_seeds?.[index] ??
          index + 1,
        y: (evaluation.success_rate ?? evaluation.win_rate ?? 0) * 100,
      })),
    [finalEvaluation?.benchmark_seeds, perSeedEvaluations]
  );

  const setNumericFormField = (
    field:
      | "timesteps"
      | "maxEpisodeSteps"
      | "evalEpisodes"
      | "evalSeedCount"
      | "guidedLaunchBootstrapSteps"
      | "seed"
      | "progressEvalFrequency"
      | "progressEvalEpisodes",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const setRewardField = (field: keyof RewardConfigForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      rewardConfig: {
        ...prev.rewardConfig,
        [field]: Number(value),
      },
    }));
  };

  const setIdField = (
    field: "allyIds" | "targetIds" | "highValueTargetIds",
    values: string[]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: formatCommaSeparatedIds(values),
    }));
  };

  const toggleAlgorithmSelection = (algorithm: string) => {
    setForm((prev) => {
      const nextAlgorithms = normalizeAlgorithmIds(
        toggleIdSelection(prev.algorithms, algorithm),
        prev.algorithms
      );
      return {
        ...prev,
        algorithms: nextAlgorithms,
      };
    });
  };

  const toggleAllySelection = (allyId: string) => {
    setIdField("allyIds", toggleIdSelection(allyIds, allyId));
  };

  const toggleTargetSelection = (targetId: string) => {
    const nextTargetIds = toggleIdSelection(targetIds, targetId);
    setForm((prev) => ({
      ...prev,
      targetIds: formatCommaSeparatedIds(nextTargetIds),
      highValueTargetIds: formatCommaSeparatedIds(
        retainAllowedIds(highValueTargetIds, nextTargetIds)
      ),
    }));
  };

  const toggleHighValueTargetSelection = (targetId: string) => {
    const nextTargetIds = targetIds.includes(targetId)
      ? targetIds
      : [...targetIds, targetId];
    const nextHighValueTargetIds = toggleIdSelection(
      highValueTargetIds,
      targetId
    );
    setForm((prev) => ({
      ...prev,
      targetIds: formatCommaSeparatedIds(nextTargetIds),
      highValueTargetIds: formatCommaSeparatedIds(
        retainAllowedIds(nextHighValueTargetIds, nextTargetIds)
      ),
    }));
  };

  const applyTrainingPreset = (preset: TrainingPreset) => {
    startTransition(() => {
      setForm((prev) => ({
        ...prev,
        ...preset.values,
      }));
    });
    setScenarioMessage(`학습 프리셋 '${preset.label}'을 적용했습니다.`);
  };

  const applyNoLaunchTimeoutRecovery = () => {
    startTransition(() => {
      setForm((prev) => {
        const fallbackTargetIds = parseCommaSeparatedIds(prev.targetIds);
        const selectedTargetId =
          noLaunchTimeoutHint?.selectedTargetId ?? fallbackTargetIds[0] ?? null;
        const nextTargetIds = selectedTargetId
          ? [selectedTargetId]
          : fallbackTargetIds;
        let nextHighValueTargetIds = retainAllowedIds(
          parseCommaSeparatedIds(prev.highValueTargetIds),
          nextTargetIds
        );
        if (nextHighValueTargetIds.length === 0 && selectedTargetId) {
          nextHighValueTargetIds = [selectedTargetId];
        }
        return {
          ...prev,
          timesteps: Math.max(prev.timesteps, 1024),
          maxEpisodeSteps: Math.max(prev.maxEpisodeSteps, 240),
          guidedLaunchBootstrapSteps: Math.max(
            prev.guidedLaunchBootstrapSteps,
            12
          ),
          targetIds: formatCommaSeparatedIds(nextTargetIds),
          highValueTargetIds: formatCommaSeparatedIds(nextHighValueTargetIds),
        };
      });
    });
    setScenarioMessage(
      "최근 평가에서 발사 없이 시간 제한에 걸려 episode 길이를 늘리고 표적 구성을 단순화했습니다."
    );
  };

  const resetRewardConfig = () => {
    startTransition(() => {
      setForm((prev) => ({
        ...prev,
        rewardConfig: toRewardConfigForm(
          capabilities?.defaultForm.rewardConfig
        ),
      }));
    });
    setScenarioMessage("보상 계수를 기본 추천값으로 복원했습니다.");
  };

  const applyRecommendedScenarioSetup = (
    scenarioText: string,
    message: string
  ) => {
    const analysis = analyzeRlScenario(scenarioText);
    startTransition(() => {
      setForm((prev) => applyScenarioRecommendations(prev, scenarioText));
    });
    setScenarioMessage(
      analysis.status === "valid"
        ? `${message} 추천 세력, 아군, 표적 구성을 함께 반영했습니다.`
        : message
    );
  };

  const applyBaselineSetup = (scenarioText: string, scenarioLabel: string) => {
    const analysis = analyzeRlScenario(scenarioText);
    startTransition(() => {
      setForm((prev) =>
        applyScenarioSetup(prev, {
          scenarioText,
          preset: baselinePreset,
          capabilities,
        })
      );
    });
    setScenarioMessage(
      analysis.status === "valid"
        ? `${scenarioLabel} 기준 기본 세팅을 적용했습니다. '${baselinePreset.label}' 프리셋, 보상 기본값, 추천 세력/표적 구성을 함께 반영했습니다.`
        : `${scenarioLabel} 기준 기본 세팅을 적용했습니다. '${baselinePreset.label}' 프리셋과 보상 기본값을 반영했습니다.`
    );
  };

  const handleApplyDefaultBaselineSetup = () => {
    const defaultScenarioText =
      capabilities?.defaultScenarioText.trim() || form.scenarioText.trim();
    if (!defaultScenarioText) {
      setScenarioMessage(
        "기본 시나리오가 없어 기본 세팅을 적용하지 못했습니다."
      );
      return;
    }
    applyBaselineSetup(defaultScenarioText, "기본 시나리오");
  };

  const handleApplyMapBaselineSetup = () => {
    if (!hasImportedMapScenario) {
      setScenarioMessage(
        "현재 지도 시나리오가 아직 없어 기본 세팅을 적용하지 못했습니다."
      );
      return;
    }
    applyBaselineSetup(importedMapScenario, "현재 지도 시나리오");
  };

  const refreshJob = async () => {
    if (!jobId) {
      return;
    }
    const response = await fetch(`/api/rl/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error("RL job refresh failed.");
    }
    setJob((await response.json()) as RlJobSnapshot);
    await refreshJobs().catch(() => undefined);
  };

  const refreshJobs = async () => {
    const response = await fetch("/api/rl/jobs");
    if (!response.ok) {
      throw new Error("RL job list refresh failed.");
    }
    setJobs((await response.json()) as RlJobListItem[]);
  };

  const handleRestoreJobRequest = async (candidateJob: RlJobListItem) => {
    setRestoringJobId(candidateJob.id);
    setPageError(null);
    try {
      const response = await fetch(
        `/api/rl/jobs/${candidateJob.id}/artifact/scenario`
      );
      if (!response.ok) {
        throw new Error("학습 시나리오를 불러오지 못했습니다.");
      }
      const scenarioText = await response.text();
      startTransition(() => {
        setForm((prev) =>
          applyTrainingRequestToForm<RewardConfigForm, TrainingForm>(
            prev,
            candidateJob.request,
            scenarioText
          )
        );
      });
      setScenarioMessage(
        `Job ${candidateJob.id.slice(0, 8)}의 시나리오와 학습 설정을 불러왔습니다.`
      );
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "학습 설정 복원에 실패했습니다."
      );
    } finally {
      setRestoringJobId(null);
    }
  };

  const handleStartTraining = async () => {
    setPageError(null);
    setStartingJob(true);
    try {
      const latestScenarioAnalysis = analyzeRlScenario(form.scenarioText);
      const latestSelectionIssues = validateRlScenarioSelection(
        latestScenarioAnalysis,
        {
          controllableSideName: form.controllableSideName,
          targetSideName: form.targetSideName,
          allyIds: parseCommaSeparatedIds(form.allyIds),
          targetIds: parseCommaSeparatedIds(form.targetIds),
          highValueTargetIds: parseCommaSeparatedIds(form.highValueTargetIds),
        }
      );
      if (latestScenarioAnalysis.status !== "valid") {
        throw new Error(
          latestScenarioAnalysis.error ?? "시나리오 JSON을 해석할 수 없습니다."
        );
      }
      if (latestSelectionIssues.length > 0) {
        throw new Error(latestSelectionIssues[0]);
      }
      const response = await fetch("/api/rl/fixed-target-strike/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioText: form.scenarioText,
          experimentLabel: form.experimentLabel.trim() || undefined,
          algorithms: form.algorithms,
          timesteps: form.timesteps,
          maxEpisodeSteps: form.maxEpisodeSteps,
          evalEpisodes: form.evalEpisodes,
          evalSeedCount: form.evalSeedCount,
          curriculumEnabled: form.curriculumEnabled,
          guidedLaunchBootstrapSteps: form.guidedLaunchBootstrapSteps,
          seed: form.seed,
          progressEvalFrequency: form.progressEvalFrequency,
          progressEvalEpisodes: form.progressEvalEpisodes,
          controllableSideName: form.controllableSideName,
          targetSideName: form.targetSideName,
          allyIds,
          targetIds,
          highValueTargetIds,
          rewardConfig: form.rewardConfig,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "RL job start failed.");
      }
      const payload = (await response.json()) as { jobId: string };
      setJobId(payload.jobId);
      await refreshJobs().catch(() => undefined);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "RL training could not start."
      );
    } finally {
      setStartingJob(false);
    }
  };

  const handleCancelTraining = async () => {
    if (!jobId) {
      return;
    }
    const response = await fetch(`/api/rl/jobs/${jobId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("RL job cancellation failed.");
    }
    setJob((await response.json()) as RlJobSnapshot);
    await refreshJobs().catch(() => undefined);
  };

  const handleOpenReplayOnMap = async () => {
    if (!jobId || !job?.artifacts.evalRecording) {
      return;
    }
    const response = await fetch(
      `/api/rl/jobs/${jobId}/artifact/evalRecording`
    );
    if (!response.ok) {
      throw new Error("Evaluation replay could not be loaded.");
    }
    const recording = await response.text();
    props.openReplayOnMap(recording, `RL 평가 리플레이 ${jobId.slice(0, 8)}`);
  };

  const fetchCheckpointReplay = async (checkpoint: RlJobCheckpoint) => {
    if (!jobId) {
      throw new Error("RL job is unavailable.");
    }
    const checkpointAlgorithm =
      `${checkpoint.algorithm ?? currentAlgorithm ?? ""}`.trim().toLowerCase();
    if (!checkpointAlgorithm) {
      throw new Error("Checkpoint algorithm is unavailable.");
    }
    const params = new URLSearchParams({
      algorithm: checkpointAlgorithm,
      timesteps: `${checkpoint.timesteps}`,
    });
    const response = await fetch(
      `/api/rl/jobs/${jobId}/checkpoint-recording?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error("Checkpoint replay could not be loaded.");
    }
    return {
      recording: await response.text(),
      label: `${formatAlgorithmLabel(checkpointAlgorithm)} 체크포인트 ${
        checkpoint.timesteps
      } 리플레이`,
    };
  };

  const handleOpenCheckpointReplayOnMap = async (
    checkpoint: RlJobCheckpoint
  ) => {
    const { recording, label } = await fetchCheckpointReplay(checkpoint);
    props.openReplayOnMap(recording, label);
  };

  const handleStartCheckpointSpectatorOnMap = async () => {
    if (!jobId) {
      return;
    }

    window.sessionStorage.setItem(
      RL_CHECKPOINT_SPECTATOR_KEY,
      JSON.stringify({
        jobId,
        startedAt: new Date().toISOString(),
        lastReplayKey: latestReplayCheckpoint
          ? `${`${latestReplayCheckpoint.algorithm ?? currentAlgorithm ?? ""}`
              .trim()
              .toLowerCase()}:${latestReplayCheckpoint.timesteps}`
          : null,
      })
    );

    if (latestReplayCheckpoint) {
      const { recording, label } = await fetchCheckpointReplay(
        latestReplayCheckpoint
      );
      props.openReplayOnMap(recording, label);
      return;
    }

    props.onBack();
  };

  const handleLoadDefaultScenario = () => {
    if (!capabilities?.defaultScenarioText) {
      return;
    }
    applyRecommendedScenarioSetup(
      capabilities.defaultScenarioText,
      "기본 고정 표적 타격 시나리오를 다시 불러왔습니다."
    );
  };

  const handleLoadFirstSuccessDemo = () => {
    applyBaselineSetup(rlFirstSuccessDemoText, "성공 체감 데모");
  };

  const handleLoadBattleOptimizationDemo = () => {
    applyBaselineSetup(
      rlBattleOptimizationDemoText,
      "전투·배치 최적화 데모"
    );
  };

  const handleLoadMapScenario = () => {
    const importedScenario = window.sessionStorage.getItem(RL_LAB_SCENARIO_KEY);
    if (!importedScenario) {
      setScenarioMessage("현재 지도에서 가져온 시나리오가 아직 없습니다.");
      return;
    }
    applyRecommendedScenarioSetup(
      importedScenario,
      "현재 지도에서 가져온 시나리오를 편집기에 반영했습니다."
    );
  };

  const handleUploadScenario = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    applyRecommendedScenarioSetup(text, `업로드한 시나리오 파일: ${file.name}`);
  };

  const openArtifact = (artifactName: string) => {
    if (!jobId) {
      return;
    }
    window.open(
      `/api/rl/jobs/${jobId}/artifact/${artifactName}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const rlLabPageViewProps = {
    ACCORDION_SX, Accordion, AccordionDetails,
    AccordionSummary, Alert, ArrowBackIcon,
    AutoFixHighOutlinedIcon, BREAK_TEXT_SX, Box,
    Button, CHART_GRID_SX, Chip,
    DARK_PANEL_SX, DASHBOARD_GRID_SX, Divider,
    DownloadOutlinedIcon, Error, ExpandMoreIcon,
    FormControlLabel, LinearProgress, MUTED_TEXT_SX,
    MapIcon, PRIMARY_BUTTON_SX, Paper,
    PlayArrowIcon, RL_LAB_PALETTE, RefreshIcon,
    RlAccordionHeader, RlBattleWatchPanel, RlDashboardMetricCard,
    RlLabCommanderPanel, RlLabInfoButton, RlLabLineChart,
    SECTION_LABEL_SX, SURFACE_PAPER_SX, Stack,
    StopIcon, Switch, TABLE_CONTAINER_SX,
    Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TextField, Typography, UploadFileOutlinedIcon,
    WRAP_ROW_SX, allyIds, applyNoLaunchTimeoutRecovery,
    applyRecommendedScenarioSetup, availableAllies, availableHighValueTargets,
    availableTargets, baselinePreset, battleWatchAssignmentLabels,
    battleWatchCheckpointStep, battleWatchLaunchCount, battleWatchRewardLabel,
    battleWatchTargetLabel, battleWatchWinRateLabel, capabilities,
    checkpointReplayRows, commandPreview, currentAlgorithm,
    dashboardDoneLabel, dashboardExperimentLabel, dashboardModeLabel,
    dashboardProgressLabel, dashboardReadyLabel, dashboardSurvivalLabel,
    episodeRewardPoints, evalRewardPoints, evalSuccessRatePoints,
    fileInputRef, finalEvaluation, form,
    formatAlgorithmLabel, formatCommaSeparatedIds, formatMetricLeaderLabel,
    formatMetricNumber, formatOptionalNumber, formatPercent,
    formatRelativeTimestamp, formatSeedVariabilityReasons, formatSelectedTargets,
    formatStatusLabel, handleApplyDefaultBaselineSetup, handleApplyMapBaselineSetup,
    handleCancelTraining, handleLoadBattleOptimizationDemo, handleLoadDefaultScenario,
    handleLoadFirstSuccessDemo, handleLoadMapScenario, handleOpenCheckpointReplayOnMap,
    handleOpenReplayOnMap, handleRestoreJobRequest, handleStartCheckpointSpectatorOnMap,
    handleStartTraining, handleUploadScenario, hasImportedMapScenario,
    highValueTargetIds, job, jobId,
    jobs, latestCheckpoint, latestReplayCheckpoint,
    latestRewardBreakdownLabels, leaderboardRankByAlgorithm, loadingCapabilities,
    loadingJobs, metricLeaderEntries, noLaunchTimeoutHint,
    openArtifact, orderedAlgorithmRuns, pageError,
    perSeedEvaluations, perSeedSuccessRatePoints, props,
    readyToTrain, refreshJob, refreshJobs,
    resetRewardConfig, restoringJobId, retainAllowedIds,
    scenarioAnalysis, scenarioMessage, selectedAllyIdSet,
    selectedHighValueTargetIdSet, selectedTargetIdSet, selectionIssues,
    setForm, setIdField, setJobId,
    setNumericFormField, setPageError, setRewardField,
    startingJob, statusColor, supportedAlgorithms,
    targetIds, toggleAlgorithmSelection, toggleAllySelection,
    toggleHighValueTargetSelection, toggleTargetSelection,
  };

  return <RlLabPageView {...rlLabPageViewProps} />;
}
