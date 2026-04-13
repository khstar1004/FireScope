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
import { RL_LAB_SCENARIO_KEY } from "@/gui/rl/rlLabRoute";
import {
  analyzeRlScenario,
  validateRlScenarioSelection,
} from "@/gui/rl/rlLabScenarioSupport";
import {
  RL_LAB_SUPPORTED_ALGORITHMS,
  applyTrainingRequestToForm,
  formatCommaSeparatedIds,
  normalizeAlgorithmIds,
  parseCommaSeparatedIds,
  retainAllowedIds,
  toggleIdSelection,
} from "@/gui/rl/rlLabTrainingSupport";

interface RlCapabilities {
  available: boolean;
  mode: string;
  pythonCommand: string;
  gymRoot: string;
  supportedAlgorithms?: string[];
  defaultScenarioText: string;
  defaultForm: {
    algorithms?: string[];
    timesteps: number;
    maxEpisodeSteps: number;
    evalEpisodes: number;
    evalSeedCount: number;
    curriculumEnabled: boolean;
    seed: number;
    progressEvalFrequency: number;
    progressEvalEpisodes: number;
    controllableSideName: string;
    targetSideName: string;
    allyIds: string[];
    targetIds: string[];
    highValueTargetIds: string[];
    rewardConfig: Record<string, number>;
  };
}

interface RlSeedVariabilitySummary {
  warning?: boolean;
  reasons?: string[];
  success_rate_std?: number;
  mean_reward_std?: number;
  survivability_std?: number;
  weapon_efficiency_std?: number;
  time_to_ready_std?: number;
  tot_quality_std?: number;
}

interface RlJobEvaluation {
  evaluation_seed?: number;
  mean_reward: number;
  std_reward: number;
  mean_episode_steps?: number;
  success_rate?: number;
  failure_rate?: number;
  truncated_rate?: number;
  win_rate?: number;
  survivability?: number;
  weapon_efficiency?: number;
  time_to_ready?: number;
  tot_quality?: number;
  benchmark_seed_count?: number;
  benchmark_seeds?: number[];
  recording_seed?: number;
  seed_variability_warning?: boolean;
  seed_variability?: RlSeedVariabilitySummary;
  done_reason?: string;
  done_reason_detail?: string;
  selected_target_id?: string | null;
  selected_target_ids?: string[];
  selected_target_assignments?: Record<string, string>;
  launch_count?: number;
  reward_breakdown?: Record<string, unknown>;
  observation_version?: number;
  reward_version?: number;
  curriculum_stage?: string | null;
  per_seed_evaluations?: RlJobEvaluation[];
  export_path?: string;
}

interface RlJobCheckpoint {
  algorithm?: string;
  timesteps: number;
  eval_mean_reward: number;
  eval_std_reward: number;
  eval_success_rate?: number;
  eval_failure_rate?: number;
  eval_truncated_rate?: number;
  survivability?: number;
  weapon_efficiency?: number;
  time_to_ready?: number;
  tot_quality?: number;
  mean_episode_steps?: number;
  done_reason?: string;
  done_reason_detail?: string;
  selected_target_id?: string | null;
  selected_target_ids?: string[];
  selected_target_assignments?: Record<string, string>;
  launch_count?: number;
  reward_breakdown?: Record<string, unknown>;
  curriculum_stage?: string | null;
}

interface RlJobEpisode {
  algorithm?: string;
  timesteps: number;
  reward: number;
  length: number;
}

interface RlJobAlgorithmProgress {
  algorithm?: string;
  status: string;
  current_timesteps: number;
  timesteps_target: number;
  checkpoints: RlJobCheckpoint[];
  episodes: RlJobEpisode[];
  best_checkpoint?: RlJobCheckpoint | null;
  final_evaluation?: RlJobEvaluation;
  selected_model_path?: string | null;
  final_model_path?: string | null;
  error?: string | null;
}

interface RlJobProgress {
  status: string;
  training_mode?: string;
  current_timesteps: number;
  timesteps_target: number;
  overall_timesteps?: number;
  overall_timesteps_target?: number;
  current_algorithm?: string | null;
  current_stage?: string | null;
  algorithms?: string[];
  checkpoints: RlJobCheckpoint[];
  episodes: RlJobEpisode[];
  algorithm_runs?: Record<string, RlJobAlgorithmProgress>;
  best_run?: {
    algorithm: string;
    evaluation: RlJobEvaluation;
    model_path?: string;
  } | null;
  final_evaluation?: RlJobEvaluation;
  error?: string | null;
}

interface RlJobSummaryRun {
  algorithm: string;
  timesteps?: number;
  training_strategy?: string;
  rollout_steps?: number | null;
  batch_size?: number | null;
  buffer_size?: number | null;
  learning_starts?: number | null;
  selection_source?: string;
  curriculum?: {
    enabled: boolean;
    stage_count: number;
    completed_stage_count: number;
    segment_timesteps: number;
  } | null;
  model_path: string;
  model_metadata_path?: string | null;
  final_model_path?: string | null;
  final_model_metadata_path?: string | null;
  best_checkpoint_model_path?: string | null;
  best_checkpoint_model_metadata_path?: string | null;
  export_path?: string;
  eval_recording_path?: string;
  evaluation: RlJobEvaluation;
}

interface RlJobSummary {
  summary_schema_version?: number;
  model_path: string;
  model_metadata_path?: string;
  scenario_path: string;
  progress_path: string;
  eval_recording_path: string;
  timesteps: number;
  timesteps_total?: number;
  eval_seed_count?: number;
  training_mode?: string;
  observation_version?: number;
  reward_version?: number;
  algorithms?: string[];
  selected_algorithm?: string;
  selection_metric?: string;
  checkpoint_compatibility?: {
    legacy_models_reusable?: boolean;
    load_policy?: string;
  };
  artifact_policy?: {
    top_level_model?: string;
    per_algorithm_artifacts?: string[];
  };
  evaluation?: RlJobEvaluation;
  best_run?: RlJobSummaryRun;
  runs?: RlJobSummaryRun[];
}

interface RlJobSnapshot {
  id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  request: {
    algorithms?: string[];
    timesteps: number;
    maxEpisodeSteps: number;
    evalEpisodes: number;
    evalSeedCount?: number;
    curriculumEnabled?: boolean;
    seed: number;
    progressEvalFrequency: number;
    progressEvalEpisodes: number;
    controllableSideName: string;
    targetSideName: string;
    allyIds: string[];
    targetIds: string[];
    highValueTargetIds: string[];
    rewardConfig: Record<string, number>;
  };
  stdoutLines: string[];
  stderrLines: string[];
  progress: RlJobProgress | null;
  summary: RlJobSummary | null;
  artifacts: {
    scenario: boolean;
    model: boolean;
    summary: boolean;
    progress: boolean;
    evalScenario: boolean;
    evalRecording: boolean;
  };
}

interface RlJobListItem extends RlJobSnapshot {
  exitCode?: number | null;
  cancelRequested?: boolean;
}

interface RewardConfigForm {
  killBase: number;
  highValueTargetBonus: number;
  totWeight: number;
  totTauSeconds: number;
  etaProgressWeight: number;
  readyToFireBonus: number;
  stagnationPenaltyPerAssignment: number;
  targetSwitchPenalty: number;
  threatStepPenalty: number;
  launchCostPerWeapon: number;
  timeCostPerStep: number;
  lossPenaltyPerAlly: number;
  successBonus: number;
  failurePenalty: number;
}

interface TrainingForm {
  algorithms: string[];
  timesteps: number;
  maxEpisodeSteps: number;
  evalEpisodes: number;
  evalSeedCount: number;
  curriculumEnabled: boolean;
  seed: number;
  progressEvalFrequency: number;
  progressEvalEpisodes: number;
  controllableSideName: string;
  targetSideName: string;
  allyIds: string;
  targetIds: string;
  highValueTargetIds: string;
  scenarioText: string;
  rewardConfig: RewardConfigForm;
}

interface TrainingPreset {
  key: string;
  label: string;
  description: string;
  values: Pick<
    TrainingForm,
    | "timesteps"
    | "maxEpisodeSteps"
    | "evalEpisodes"
    | "evalSeedCount"
    | "curriculumEnabled"
    | "progressEvalFrequency"
    | "progressEvalEpisodes"
  >;
}

interface RlLabPageProps {
  onBack: () => void;
  initialJobId?: string | null;
  onJobIdChange: (jobId: string | null) => void;
  openReplayOnMap: (recording: string, label?: string) => void;
}

const fallbackForm: TrainingForm = {
  algorithms: ["ppo"],
  timesteps: 4096,
  maxEpisodeSteps: 240,
  evalEpisodes: 1,
  evalSeedCount: 3,
  curriculumEnabled: false,
  seed: 7,
  progressEvalFrequency: 512,
  progressEvalEpisodes: 1,
  controllableSideName: "BLUE",
  targetSideName: "RED",
  allyIds: "blue-striker-1, blue-striker-2",
  targetIds: "red-sam-site, red-airbase",
  highValueTargetIds: "red-airbase",
  scenarioText: "",
  rewardConfig: {
    killBase: 100,
    highValueTargetBonus: 50,
    totWeight: 40,
    totTauSeconds: 8,
    etaProgressWeight: 6,
    readyToFireBonus: 2.5,
    stagnationPenaltyPerAssignment: -0.15,
    targetSwitchPenalty: -0.3,
    threatStepPenalty: -2,
    launchCostPerWeapon: -1,
    timeCostPerStep: -0.05,
    lossPenaltyPerAlly: -80,
    successBonus: 150,
    failurePenalty: -150,
  },
};

const trainingPresets: TrainingPreset[] = [
  {
    key: "smoke",
    label: "스모크 점검",
    description: "가장 짧게 환경/보상/로그 흐름만 확인합니다.",
    values: {
      timesteps: 512,
      maxEpisodeSteps: 120,
      evalEpisodes: 1,
      evalSeedCount: 1,
      curriculumEnabled: false,
      progressEvalFrequency: 128,
      progressEvalEpisodes: 1,
    },
  },
  {
    key: "quick",
    label: "빠른 반복",
    description: "시나리오와 보상 수정을 짧게 검증할 때 적합합니다.",
    values: {
      timesteps: 2048,
      maxEpisodeSteps: 180,
      evalEpisodes: 1,
      evalSeedCount: 2,
      curriculumEnabled: false,
      progressEvalFrequency: 256,
      progressEvalEpisodes: 1,
    },
  },
  {
    key: "standard",
    label: "표준 학습",
    description: "초심자 기본 권장값입니다.",
    values: {
      timesteps: 4096,
      maxEpisodeSteps: 240,
      evalEpisodes: 2,
      evalSeedCount: 3,
      curriculumEnabled: false,
      progressEvalFrequency: 512,
      progressEvalEpisodes: 1,
    },
  },
  {
    key: "extended",
    label: "심화 학습",
    description: "더 긴 수렴과 평가 안정성을 보고 싶을 때 사용합니다.",
    values: {
      timesteps: 12288,
      maxEpisodeSteps: 320,
      evalEpisodes: 3,
      evalSeedCount: 5,
      curriculumEnabled: false,
      progressEvalFrequency: 1024,
      progressEvalEpisodes: 2,
    },
  },
  {
    key: "curriculum",
    label: "커리큘럼",
    description:
      "쉬운 단계부터 시작해 표적 수, 위협 반경, 시작 거리, 제한시간을 단계적으로 높입니다.",
    values: {
      timesteps: 8192,
      maxEpisodeSteps: 240,
      evalEpisodes: 2,
      evalSeedCount: 4,
      curriculumEnabled: true,
      progressEvalFrequency: 256,
      progressEvalEpisodes: 1,
    },
  },
];

function buildCommandPreview(form: TrainingForm) {
  const allyIds = parseCommaSeparatedIds(form.allyIds).join(" ");
  const targetIds = parseCommaSeparatedIds(form.targetIds).join(" ");
  const highValueTargetIds = parseCommaSeparatedIds(form.highValueTargetIds).join(
    " "
  );
  return [
    "cd gym",
    ".\\.venv\\Scripts\\python.exe scripts\\fixed_target_strike\\train.py",
    `--algorithms ${form.algorithms.join(" ")}`,
    `--timesteps ${form.timesteps}`,
    `--max-episode-steps ${form.maxEpisodeSteps}`,
    `--eval-episodes ${form.evalEpisodes}`,
    `--eval-seed-count ${form.evalSeedCount}`,
    ...(form.curriculumEnabled ? ["--curriculum-enabled"] : []),
    `--seed ${form.seed}`,
    `--progress-eval-frequency ${form.progressEvalFrequency}`,
    `--progress-eval-episodes ${form.progressEvalEpisodes}`,
    `--controllable-side-name ${form.controllableSideName}`,
    `--target-side-name ${form.targetSideName}`,
    `--ally-ids ${allyIds}`,
    `--target-ids ${targetIds}`,
    `--high-value-target-ids ${highValueTargetIds}`,
  ].join(" ");
}

function formatAlgorithmLabel(algorithm: string | undefined) {
  return algorithm ? algorithm.toUpperCase() : "-";
}

function formatPercent(value: number | undefined, digits = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${(value * 100).toFixed(digits)}%`
    : "-";
}

function formatSelectedTargets(
  primaryTargetId: string | null | undefined,
  targetIds: string[] | undefined
) {
  const normalizedIds = Array.from(
    new Set((targetIds ?? []).filter((targetId) => targetId.trim().length > 0))
  );
  if (normalizedIds.length > 1) {
    return normalizedIds.join(", ");
  }
  if (normalizedIds.length === 1) {
    return normalizedIds[0];
  }
  return primaryTargetId?.trim() ? primaryTargetId : "-";
}

function applyScenarioRecommendations(form: TrainingForm, scenarioText: string) {
  const analysis = analyzeRlScenario(scenarioText);
  const nextForm: TrainingForm = {
    ...form,
    scenarioText,
  };

  if (analysis.status !== "valid") {
    return nextForm;
  }

  if (analysis.recommendedControllableSideName) {
    nextForm.controllableSideName = analysis.recommendedControllableSideName;
  }
  if (analysis.recommendedTargetSideName) {
    nextForm.targetSideName = analysis.recommendedTargetSideName;
  }
  if (analysis.recommendedAllyIds.length > 0) {
    nextForm.allyIds = analysis.recommendedAllyIds.join(", ");
  }
  if (analysis.recommendedTargetIds.length > 0) {
    nextForm.targetIds = analysis.recommendedTargetIds.join(", ");
  }
  if (analysis.recommendedHighValueTargetIds.length > 0) {
    nextForm.highValueTargetIds = analysis.recommendedHighValueTargetIds.join(", ");
  }
  return nextForm;
}

function formatStatusLabel(status: RlJobSnapshot["status"] | string | undefined) {
  switch (status) {
    case "running":
      return "학습 중";
    case "completed":
      return "완료";
    case "failed":
      return "실패";
    case "cancelled":
      return "중단됨";
    case "queued":
      return "대기";
    default:
      return "준비";
  }
}

function statusColor(
  status: RlJobSnapshot["status"] | string | undefined
): "default" | "warning" | "success" | "error" {
  switch (status) {
    case "running":
      return "warning";
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "cancelled":
      return "default";
    default:
      return "default";
  }
}

function formatRelativeTimestamp(value: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatOptionalNumber(value: number | undefined, digits = 1) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
}

function formatMetricNumber(value: number | undefined, digits = 2) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
}

function formatSeedVariabilityReasons(reasons: string[] | undefined) {
  if (!reasons || reasons.length === 0) {
    return "-";
  }
  return reasons.join(", ");
}

function formatRewardBreakdownLabels(
  rewardBreakdown: Record<string, unknown> | undefined
) {
  if (!rewardBreakdown) {
    return [];
  }

  const entries = [
    ["kill_reward", "Kill"],
    ["tot_bonus", "TOT"],
    ["eta_progress_bonus", "ETA"],
    ["ready_to_fire_bonus", "Ready"],
    ["stagnation_penalty", "Stagnation"],
    ["target_switch_penalty", "Switch"],
    ["threat_penalty", "Threat"],
    ["launch_cost", "Launch"],
    ["time_cost", "Time"],
    ["loss_cost", "Loss"],
    ["terminal_bonus", "Terminal"],
  ] as const;

  return entries
    .map(([key, label]) => {
      const value = rewardBreakdown[key];
      return typeof value === "number" && Number.isFinite(value)
        ? `${label} ${value.toFixed(1)}`
        : null;
    })
    .filter((value): value is string => value !== null);
}

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

  useEffect(() => {
    let active = true;

    const loadCapabilities = async () => {
      setLoadingCapabilities(true);
      try {
        const response = await fetch("/api/rl/fixed-target-strike/capabilities");
        if (!response.ok) {
          throw new Error("RL API capabilities could not be loaded.");
        }
        const payload = (await response.json()) as RlCapabilities;
        if (!active) {
          return;
        }
        setCapabilities(payload);
        const importedScenario = window.sessionStorage.getItem(RL_LAB_SCENARIO_KEY);
        const scenarioText = importedScenario ?? payload.defaultScenarioText;
        setScenarioMessage(
          importedScenario
            ? "현재 지도 시나리오와 추천 학습 구성을 자동으로 불러왔습니다."
            : "기본 고정 표적 타격 시나리오와 추천 학습 구성을 불러왔습니다."
        );
        const baseForm: TrainingForm = {
          algorithms: normalizeAlgorithmIds(
            payload.defaultForm.algorithms,
            payload.supportedAlgorithms ?? [...RL_LAB_SUPPORTED_ALGORITHMS]
          ),
          timesteps: payload.defaultForm.timesteps,
          maxEpisodeSteps: payload.defaultForm.maxEpisodeSteps,
          evalEpisodes: payload.defaultForm.evalEpisodes,
          evalSeedCount: payload.defaultForm.evalSeedCount,
          curriculumEnabled: payload.defaultForm.curriculumEnabled,
          seed: payload.defaultForm.seed,
          progressEvalFrequency: payload.defaultForm.progressEvalFrequency,
          progressEvalEpisodes: payload.defaultForm.progressEvalEpisodes,
          controllableSideName: payload.defaultForm.controllableSideName,
          targetSideName: payload.defaultForm.targetSideName,
          allyIds: payload.defaultForm.allyIds.join(", "),
          targetIds: payload.defaultForm.targetIds.join(", "),
          highValueTargetIds: payload.defaultForm.highValueTargetIds.join(", "),
          scenarioText,
          rewardConfig: {
            killBase: payload.defaultForm.rewardConfig.killBase,
            highValueTargetBonus:
              payload.defaultForm.rewardConfig.highValueTargetBonus,
            totWeight: payload.defaultForm.rewardConfig.totWeight,
            totTauSeconds: payload.defaultForm.rewardConfig.totTauSeconds,
            etaProgressWeight:
              payload.defaultForm.rewardConfig.etaProgressWeight,
            readyToFireBonus:
              payload.defaultForm.rewardConfig.readyToFireBonus,
            stagnationPenaltyPerAssignment:
              payload.defaultForm.rewardConfig.stagnationPenaltyPerAssignment,
            targetSwitchPenalty:
              payload.defaultForm.rewardConfig.targetSwitchPenalty,
            threatStepPenalty:
              payload.defaultForm.rewardConfig.threatStepPenalty,
            launchCostPerWeapon:
              payload.defaultForm.rewardConfig.launchCostPerWeapon,
            timeCostPerStep: payload.defaultForm.rewardConfig.timeCostPerStep,
            lossPenaltyPerAlly:
              payload.defaultForm.rewardConfig.lossPenaltyPerAlly,
            successBonus: payload.defaultForm.rewardConfig.successBonus,
            failurePenalty: payload.defaultForm.rewardConfig.failurePenalty,
          },
        };
        setForm(applyScenarioRecommendations(baseForm, scenarioText));
      } catch (error) {
        if (!active) {
          return;
        }
        setPageError(error instanceof Error ? error.message : "RL API unavailable.");
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
        timer = window.setTimeout(() => {
          void loadJobs();
        }, shouldPoll ? 2500 : 8000);
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
  const allyIds = useMemo(() => parseCommaSeparatedIds(form.allyIds), [form.allyIds]);
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
      normalizeAlgorithmIds(
        capabilities?.supportedAlgorithms,
        [...RL_LAB_SUPPORTED_ALGORITHMS]
      ),
    [capabilities?.supportedAlgorithms]
  );
  const algorithmRuns = job?.summary?.runs ?? [];
  const latestCheckpoint = job?.progress?.checkpoints.at(-1);
  const finalEvaluation = job?.summary?.evaluation ?? job?.progress?.final_evaluation;
  const currentAlgorithm =
    job?.progress?.current_algorithm ??
    job?.summary?.selected_algorithm ??
    job?.summary?.best_run?.algorithm ??
    job?.request.algorithms?.[0];
  const latestRewardBreakdownLabels = formatRewardBreakdownLabels(
    finalEvaluation?.reward_breakdown ?? latestCheckpoint?.reward_breakdown
  );
  const commandPreview = buildCommandPreview(form);
  const perSeedEvaluations = finalEvaluation?.per_seed_evaluations ?? [];
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
    const nextHighValueTargetIds = toggleIdSelection(highValueTargetIds, targetId);
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

  const resetRewardConfig = () => {
    startTransition(() => {
      setForm((prev) => ({
        ...prev,
        rewardConfig: {
          ...(capabilities
            ? {
                killBase: capabilities.defaultForm.rewardConfig.killBase,
                highValueTargetBonus:
                  capabilities.defaultForm.rewardConfig.highValueTargetBonus,
                totWeight: capabilities.defaultForm.rewardConfig.totWeight,
                totTauSeconds: capabilities.defaultForm.rewardConfig.totTauSeconds,
                etaProgressWeight:
                  capabilities.defaultForm.rewardConfig.etaProgressWeight,
                readyToFireBonus:
                  capabilities.defaultForm.rewardConfig.readyToFireBonus,
                stagnationPenaltyPerAssignment:
                  capabilities.defaultForm.rewardConfig
                    .stagnationPenaltyPerAssignment,
                targetSwitchPenalty:
                  capabilities.defaultForm.rewardConfig.targetSwitchPenalty,
                threatStepPenalty:
                  capabilities.defaultForm.rewardConfig.threatStepPenalty,
                launchCostPerWeapon:
                  capabilities.defaultForm.rewardConfig.launchCostPerWeapon,
                timeCostPerStep: capabilities.defaultForm.rewardConfig.timeCostPerStep,
                lossPenaltyPerAlly:
                  capabilities.defaultForm.rewardConfig.lossPenaltyPerAlly,
                successBonus: capabilities.defaultForm.rewardConfig.successBonus,
                failurePenalty: capabilities.defaultForm.rewardConfig.failurePenalty,
              }
            : fallbackForm.rewardConfig),
        },
      }));
    });
    setScenarioMessage("보상 계수를 기본 추천값으로 복원했습니다.");
  };

  const applyRecommendedScenarioSetup = (scenarioText: string, message: string) => {
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
          applyTrainingRequestToForm(prev, candidateJob.request, scenarioText)
        );
      });
      setScenarioMessage(
        `Job ${candidateJob.id.slice(0, 8)}의 시나리오와 학습 설정을 불러왔습니다.`
      );
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "학습 설정 복원에 실패했습니다."
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
          algorithms: form.algorithms,
          timesteps: form.timesteps,
          maxEpisodeSteps: form.maxEpisodeSteps,
          evalEpisodes: form.evalEpisodes,
          evalSeedCount: form.evalSeedCount,
          curriculumEnabled: form.curriculumEnabled,
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
    const response = await fetch(`/api/rl/jobs/${jobId}/artifact/evalRecording`);
    if (!response.ok) {
      throw new Error("Evaluation replay could not be loaded.");
    }
    const recording = await response.text();
    props.openReplayOnMap(recording, `RL 평가 리플레이 ${jobId.slice(0, 8)}`);
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

  return (
    <Box
      data-testid="rl-lab-page"
      sx={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
        background:
          "radial-gradient(circle at top left, rgba(95,112,65,0.18) 0%, rgba(247,243,234,0.92) 38%, rgba(214,221,200,0.98) 100%)",
        color: "var(--fs-text)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 2.5, md: 3.5 },
        }}
      >
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid rgba(95, 112, 65, 0.18)",
              background:
                "linear-gradient(135deg, rgba(28,35,24,0.96) 0%, rgba(70,85,47,0.92) 100%)",
              color: "#f7f3ea",
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ justifyContent: "space-between", gap: 1.5 }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ letterSpacing: "0.12em", opacity: 0.78 }}
                  >
                    FIRE SCOPE RL LAB
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Fixed Target Strike 학습 설계실
                  </Typography>
                  <Typography sx={{ mt: 1, maxWidth: 920, opacity: 0.88 }}>
                    시나리오 JSON, 타격 대상, 보상 계수, 학습 길이를 UI에서 조정한 뒤
                    로컬 Python RL 학습을 바로 실행합니다. PPO, A2C, SAC, DDPG,
                    TD3를 같은 시나리오에서 비교할 수 있고 학습 중간 평가 보상과
                    episode reward를 그래프로 보고, 완료 후 평가 리플레이를 지도에서
                    다시 열 수 있습니다.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                  <Chip
                    label={formatStatusLabel(job?.status)}
                    color={statusColor(job?.status)}
                    sx={{ fontWeight: 700 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={props.onBack}
                    sx={{
                      color: "#f7f3ea",
                      borderColor: "rgba(247,243,234,0.36)",
                    }}
                  >
                    지도 복귀
                  </Button>
                </Stack>
              </Stack>
              {(job?.status === "running" || startingJob) && <LinearProgress />}
            </Stack>
          </Paper>

          {pageError && <Alert severity="error">{pageError}</Alert>}
          {scenarioMessage && <Alert severity="info">{scenarioMessage}</Alert>}
          {loadingCapabilities && <LinearProgress />}
          {capabilities && !capabilities.available && (
            <Alert severity="warning">
              RL 로컬 API를 찾지 못했습니다. `npm run standalone` 또는 `npm run start`
              로 client를 띄운 뒤 사용하세요.
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid rgba(120, 133, 103, 0.24)",
              background:
                "linear-gradient(135deg, rgba(247,243,234,0.98) 0%, rgba(228,232,216,0.94) 100%)",
            }}
          >
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  초심자 빠른 시작
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                  1. 시나리오를 불러오면 RL Lab이 세력, 기체, 표적을 자동 분석합니다.
                  2. 추천 구성 적용 또는 학습 프리셋 선택. 3. 바로 학습 시작 후 결과를
                  확인하면 됩니다.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<AutoFixHighOutlinedIcon />}
                  onClick={() =>
                    applyRecommendedScenarioSetup(
                      form.scenarioText,
                      "현재 편집 중인 시나리오를 다시 분석했습니다."
                    )
                  }
                  disabled={scenarioAnalysis.status !== "valid"}
                  sx={{
                    backgroundColor: "#5f7041",
                    "&:hover": { backgroundColor: "#46552f" },
                  }}
                >
                  추천 구성 적용
                </Button>
                {trainingPresets.map((preset) => (
                  <Button
                    key={preset.key}
                    variant="outlined"
                    title={preset.description}
                    onClick={() => applyTrainingPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button variant="outlined" onClick={resetRewardConfig}>
                  보상 기본값 복원
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip
                  label={`시나리오 ${
                    scenarioAnalysis.scenarioName ?? "불러오기 대기"
                  }`}
                />
                <Chip
                  label={`세력 ${scenarioAnalysis.sideSummaries.length}`}
                  color={scenarioAnalysis.status === "valid" ? "success" : "default"}
                />
                <Chip label={`항공기 ${scenarioAnalysis.allyOptions.length}`} />
                <Chip label={`고정 표적 ${scenarioAnalysis.targetOptions.length}`} />
                {scenarioAnalysis.recommendedControllableSideName && (
                  <Chip
                    label={`아군 추천 ${scenarioAnalysis.recommendedControllableSideName}`}
                  />
                )}
                {scenarioAnalysis.recommendedTargetSideName && (
                  <Chip
                    label={`적 추천 ${scenarioAnalysis.recommendedTargetSideName}`}
                  />
                )}
              </Stack>

              {scenarioAnalysis.status === "valid" && (
                <>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    {scenarioAnalysis.sideSummaries.map((side) => (
                      <Chip
                        key={side.id}
                        variant="outlined"
                        label={`${side.name} 항공 ${side.aircraftCount} / 표적 ${side.fixedTargetCount}`}
                      />
                    ))}
                  </Stack>

                  <Stack spacing={0.75}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      추천 아군 항공기
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {scenarioAnalysis.recommendedAllyIds.length > 0 ? (
                        scenarioAnalysis.recommendedAllyIds.map((allyId) => (
                          <Chip key={allyId} size="small" label={allyId} />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          추천 아군 항공기를 만들지 못했습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>

                  <Stack spacing={0.75}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      추천 고정 표적
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {scenarioAnalysis.recommendedTargetIds.length > 0 ? (
                        scenarioAnalysis.recommendedTargetIds.map((targetId) => (
                          <Chip key={targetId} size="small" label={targetId} />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          추천 표적을 만들지 못했습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </>
              )}

              {scenarioAnalysis.error && <Alert severity="error">{scenarioAnalysis.error}</Alert>}

              {selectionIssues.length > 0 && scenarioAnalysis.status === "valid" && (
                <Alert severity="warning">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    학습 시작 전에 확인할 항목
                  </Typography>
                  <Box component="ul" sx={{ pl: 2.5, mb: 0, mt: 0.75 }}>
                    {selectionIssues.map((issue) => (
                      <li key={issue}>
                        <Typography variant="body2">{issue}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}

              {scenarioAnalysis.warnings.length > 0 && (
                <Alert severity="info">
                  <Box component="ul" sx={{ pl: 2.5, mb: 0 }}>
                    {scenarioAnalysis.warnings.map((warning) => (
                      <li key={warning}>
                        <Typography variant="body2">{warning}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}
            </Stack>
          </Paper>

          <Stack direction={{ xs: "column", xl: "row" }} spacing={2}>
            <Stack spacing={2} sx={{ flex: 1.2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    시나리오 설계
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button size="small" variant="outlined" onClick={handleLoadDefaultScenario}>
                      기본 시나리오
                    </Button>
                    <Button size="small" variant="outlined" onClick={handleLoadMapScenario}>
                      현재 지도 시나리오
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AutoFixHighOutlinedIcon />}
                      onClick={() =>
                        applyRecommendedScenarioSetup(
                          form.scenarioText,
                          "현재 시나리오에 맞춰 추천 구성을 다시 적용했습니다."
                        )
                      }
                      disabled={scenarioAnalysis.status !== "valid"}
                    >
                      추천 재적용
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UploadFileOutlinedIcon />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      JSON 업로드
                    </Button>
                  </Stack>
                  {scenarioAnalysis.status === "valid" && (
                    <Alert severity="success">
                      추천 세팅: 아군 {scenarioAnalysis.recommendedControllableSideName ?? "-"}
                      / 적 {scenarioAnalysis.recommendedTargetSideName ?? "-"} / 항공기{" "}
                      {scenarioAnalysis.recommendedAllyIds.length}대 / 표적{" "}
                      {scenarioAnalysis.recommendedTargetIds.length}개
                    </Alert>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={handleUploadScenario}
                  />
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="아군 세력명"
                      value={form.controllableSideName}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          controllableSideName: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="적 세력명"
                      value={form.targetSideName}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          targetSideName: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    label="아군 항공기 IDs"
                    helperText="쉼표로 구분합니다."
                    value={form.allyIds}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, allyIds: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="적 고정 표적 IDs"
                    helperText="쉼표로 구분합니다."
                    value={form.targetIds}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, targetIds: event.target.value }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="고가치 표적 IDs"
                    helperText="쉼표로 구분합니다."
                    value={form.highValueTargetIds}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        highValueTargetIds: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="시나리오 JSON"
                    value={form.scenarioText}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        scenarioText: event.target.value,
                      }))
                    }
                    fullWidth
                    multiline
                    minRows={14}
                    maxRows={24}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontFamily: 'Consolas, "Courier New", monospace',
                      },
                    }}
                  />
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    시나리오 카탈로그
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    현재 시나리오에서 감지한 항공기와 고정 표적입니다. 직접 ID를
                    입력하지 않아도 칩을 눌러 학습 대상을 선택할 수 있습니다.
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip label={`선택 아군 ${allyIds.length} / ${availableAllies.length}`} />
                    <Chip
                      label={`선택 표적 ${targetIds.length} / ${availableTargets.length}`}
                    />
                    <Chip
                      label={`고가치 표적 ${highValueTargetIds.length} / ${availableHighValueTargets.length}`}
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      sx={{ justifyContent: "space-between", gap: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        아군 항공기 선택
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setIdField(
                              "allyIds",
                              availableAllies.map((ally) => ally.id)
                            )
                          }
                          disabled={availableAllies.length === 0}
                        >
                          전부 선택
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setIdField(
                              "allyIds",
                              scenarioAnalysis.recommendedAllyIds
                            )
                          }
                          disabled={scenarioAnalysis.recommendedAllyIds.length === 0}
                        >
                          추천 사용
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setIdField("allyIds", [])}
                          disabled={allyIds.length === 0}
                        >
                          비우기
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {availableAllies.length > 0 ? (
                        availableAllies.map((ally) => (
                          <Chip
                            key={ally.id}
                            clickable
                            color={selectedAllyIdSet.has(ally.id) ? "success" : "default"}
                            variant={selectedAllyIdSet.has(ally.id) ? "filled" : "outlined"}
                            onClick={() => toggleAllySelection(ally.id)}
                            label={`${ally.id} · 무장 ${ally.weaponCount}`}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          선택한 아군 세력에서 사용할 항공기를 찾지 못했습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      sx={{ justifyContent: "space-between", gap: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        고정 표적 선택
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              targetIds: formatCommaSeparatedIds(
                                availableTargets.map((target) => target.id)
                              ),
                              highValueTargetIds: formatCommaSeparatedIds(
                                retainAllowedIds(
                                  highValueTargetIds,
                                  availableTargets.map((target) => target.id)
                                )
                              ),
                            }))
                          }
                          disabled={availableTargets.length === 0}
                        >
                          전부 선택
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              targetIds: formatCommaSeparatedIds(
                                scenarioAnalysis.recommendedTargetIds
                              ),
                              highValueTargetIds: formatCommaSeparatedIds(
                                retainAllowedIds(
                                  scenarioAnalysis.recommendedHighValueTargetIds,
                                  scenarioAnalysis.recommendedTargetIds
                                )
                              ),
                            }))
                          }
                          disabled={scenarioAnalysis.recommendedTargetIds.length === 0}
                        >
                          추천 사용
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              targetIds: "",
                              highValueTargetIds: "",
                            }))
                          }
                          disabled={targetIds.length === 0}
                        >
                          비우기
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {availableTargets.length > 0 ? (
                        availableTargets.map((target) => (
                          <Chip
                            key={target.id}
                            clickable
                            color={selectedTargetIdSet.has(target.id) ? "warning" : "default"}
                            variant={selectedTargetIdSet.has(target.id) ? "filled" : "outlined"}
                            onClick={() => toggleTargetSelection(target.id)}
                            label={`${target.id} · ${target.kind}`}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          선택한 적 세력에서 사용할 고정 표적을 찾지 못했습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      sx={{ justifyContent: "space-between", gap: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        고가치 표적 선택
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setIdField(
                              "highValueTargetIds",
                              retainAllowedIds(
                                scenarioAnalysis.recommendedHighValueTargetIds,
                                targetIds
                              )
                            )
                          }
                          disabled={targetIds.length === 0}
                        >
                          추천 사용
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setIdField("highValueTargetIds", [])}
                          disabled={highValueTargetIds.length === 0}
                        >
                          비우기
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {availableHighValueTargets.length > 0 ? (
                        availableHighValueTargets.map((target) => (
                          <Chip
                            key={target.id}
                            clickable
                            color={
                              selectedHighValueTargetIdSet.has(target.id)
                                ? "error"
                                : "default"
                            }
                            variant={
                              selectedHighValueTargetIdSet.has(target.id)
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() => toggleHighValueTargetSelection(target.id)}
                            label={target.id}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          먼저 고정 표적을 선택하면 여기서 고가치 표적을 지정할 수 있습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    학습 설정
                  </Typography>
                  <Stack spacing={1}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      알고리즘 비교
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      하나 이상 선택하면 같은 시나리오로 순차 학습한 뒤, 승리확률이 가장
                      높은 정책을 최종 모델로 저장합니다.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {supportedAlgorithms.map((algorithm) => {
                        const selected = form.algorithms.includes(algorithm);
                        return (
                          <Chip
                            key={algorithm}
                            clickable
                            color={selected ? "success" : "default"}
                            variant={selected ? "filled" : "outlined"}
                            onClick={() => toggleAlgorithmSelection(algorithm)}
                            label={formatAlgorithmLabel(algorithm)}
                          />
                        );
                      })}
                    </Stack>
                    <Alert severity="info">
                      모델 선택 기준: success rate 우선, 동률이면 mean reward, 그다음
                      더 짧은 평균 episode 길이입니다.
                    </Alert>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`선택 기준 ${form.evalSeedCount} seeds`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          form.curriculumEnabled
                            ? "Mode Curriculum"
                            : "Mode Standard"
                        }
                      />
                    </Stack>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.curriculumEnabled}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              curriculumEnabled: event.target.checked,
                            }))
                          }
                        />
                      }
                      label="커리큘럼 학습 사용"
                    />
                    {form.curriculumEnabled && (
                      <Alert severity="info">
                        쉬운 stage에서 시작해 success rate 기준을 넘기면 다음 난이도로
                        넘어갑니다. 최종 모델 비교는 마지막 full mission 기준
                        multi-seed evaluation으로 수행합니다.
                      </Alert>
                    )}
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Timesteps"
                      type="number"
                      value={form.timesteps}
                      onChange={(event) =>
                        setNumericFormField("timesteps", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Max Episode Steps"
                      type="number"
                      value={form.maxEpisodeSteps}
                      onChange={(event) =>
                        setNumericFormField("maxEpisodeSteps", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Eval Episodes"
                      type="number"
                      value={form.evalEpisodes}
                      onChange={(event) =>
                        setNumericFormField("evalEpisodes", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Eval Seed Count"
                      type="number"
                      value={form.evalSeedCount}
                      onChange={(event) =>
                        setNumericFormField("evalSeedCount", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Seed"
                      type="number"
                      value={form.seed}
                      onChange={(event) =>
                        setNumericFormField("seed", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Progress Eval Frequency"
                      type="number"
                      value={form.progressEvalFrequency}
                      onChange={(event) =>
                        setNumericFormField(
                          "progressEvalFrequency",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Progress Eval Episodes"
                      type="number"
                      value={form.progressEvalEpisodes}
                      onChange={(event) =>
                        setNumericFormField(
                          "progressEvalEpisodes",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{ justifyContent: "space-between", gap: 1 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      보상 계수 설계
                    </Typography>
                    <Button size="small" variant="outlined" onClick={resetRewardConfig}>
                      기본값 복원
                    </Button>
                  </Stack>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    Terminal Reward
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Kill Base"
                      type="number"
                      value={form.rewardConfig.killBase}
                      onChange={(event) =>
                        setRewardField("killBase", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="High Value Bonus"
                      type="number"
                      value={form.rewardConfig.highValueTargetBonus}
                      onChange={(event) =>
                        setRewardField(
                          "highValueTargetBonus",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Success Bonus"
                      type="number"
                      value={form.rewardConfig.successBonus}
                      onChange={(event) =>
                        setRewardField("successBonus", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Failure Penalty"
                      type="number"
                      value={form.rewardConfig.failurePenalty}
                      onChange={(event) =>
                        setRewardField("failurePenalty", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Divider />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    Coordination Shaping
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="TOT Weight"
                      type="number"
                      value={form.rewardConfig.totWeight}
                      onChange={(event) =>
                        setRewardField("totWeight", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="TOT Tau Seconds"
                      type="number"
                      value={form.rewardConfig.totTauSeconds}
                      onChange={(event) =>
                        setRewardField("totTauSeconds", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="ETA Progress Weight"
                      type="number"
                      value={form.rewardConfig.etaProgressWeight}
                      onChange={(event) =>
                        setRewardField(
                          "etaProgressWeight",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Ready Bonus"
                      type="number"
                      value={form.rewardConfig.readyToFireBonus}
                      onChange={(event) =>
                        setRewardField("readyToFireBonus", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    `ETA Progress Weight`는 선택한 표적까지의 launch ETA가 줄어들 때,
                    `Ready Bonus`는 새로 발사 가능 상태에 들어간 기체 수가 늘어날 때
                    추가 보상을 줍니다.
                  </Typography>
                  <Divider />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    Anti-Stagnation Penalty
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Stagnation Penalty"
                      type="number"
                      value={form.rewardConfig.stagnationPenaltyPerAssignment}
                      onChange={(event) =>
                        setRewardField(
                          "stagnationPenaltyPerAssignment",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Target Switch Penalty"
                      type="number"
                      value={form.rewardConfig.targetSwitchPenalty}
                      onChange={(event) =>
                        setRewardField("targetSwitchPenalty", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Threat Step Penalty"
                      type="number"
                      value={form.rewardConfig.threatStepPenalty}
                      onChange={(event) =>
                        setRewardField(
                          "threatStepPenalty",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                  <Divider />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    Cost Shaping
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Launch Cost"
                      type="number"
                      value={form.rewardConfig.launchCostPerWeapon}
                      onChange={(event) =>
                        setRewardField(
                          "launchCostPerWeapon",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Time Cost"
                      type="number"
                      value={form.rewardConfig.timeCostPerStep}
                      onChange={(event) =>
                        setRewardField("timeCostPerStep", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Loss Penalty"
                      type="number"
                      value={form.rewardConfig.lossPenaltyPerAlly}
                      onChange={(event) =>
                        setRewardField(
                          "lossPenaltyPerAlly",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    `Stagnation Penalty`는 같은 표적을 골랐지만 launch ETA가 거의
                    줄지 않는 step에, `Target Switch Penalty`는 살아 있는 표적 사이를
                    불필요하게 바꾸는 step에 적용됩니다.
                  </Typography>
                </Stack>
              </Paper>
            </Stack>

            <Stack spacing={2} sx={{ flex: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    실행 패널
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleStartTraining}
                      disabled={startingJob || job?.status === "running" || !readyToTrain}
                      sx={{
                        backgroundColor: "#5f7041",
                        "&:hover": { backgroundColor: "#46552f" },
                      }}
                    >
                      학습 시작
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<StopIcon />}
                      onClick={() => {
                        void handleCancelTraining().catch((error) => {
                          setPageError(
                            error instanceof Error
                              ? error.message
                              : "RL job cancellation failed."
                          );
                        });
                      }}
                      disabled={!jobId || job?.status !== "running"}
                    >
                      중지
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => {
                        void refreshJob().catch((error) => {
                          setPageError(
                            error instanceof Error
                              ? error.message
                              : "RL job refresh failed."
                          );
                        });
                      }}
                      disabled={!jobId}
                    >
                      새로고침
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MapIcon />}
                      onClick={() => {
                        void handleOpenReplayOnMap().catch((error) => {
                          setPageError(
                            error instanceof Error
                              ? error.message
                              : "Evaluation replay load failed."
                          );
                        });
                      }}
                      disabled={!job?.artifacts.evalRecording}
                    >
                      평가 리플레이 열기
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={() => openArtifact("summary")}
                      disabled={!job?.artifacts.summary}
                    >
                      요약 JSON
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={() => openArtifact("evalScenario")}
                      disabled={!job?.artifacts.evalScenario}
                    >
                      평가 시나리오
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={() => openArtifact("model")}
                      disabled={!job?.artifacts.model}
                    >
                      모델 ZIP
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip label={`상태 ${formatStatusLabel(job?.status)}`} />
                    {jobId && <Chip label={`Job ${jobId.slice(0, 8)}`} />}
                    <Chip label={`선택 알고리즘 ${form.algorithms.map(formatAlgorithmLabel).join(", ")}`} />
                    {job?.progress && (
                      <Chip
                        label={`진행 ${job.progress.current_timesteps} / ${job.progress.timesteps_target}`}
                      />
                    )}
                    {job?.progress?.overall_timesteps_target !== undefined && (
                      <Chip
                        label={`전체 ${job.progress.overall_timesteps ?? 0} / ${job.progress.overall_timesteps_target}`}
                      />
                    )}
                    {currentAlgorithm && (
                      <Chip label={`현재 알고리즘 ${formatAlgorithmLabel(currentAlgorithm)}`} />
                    )}
                    <Chip
                      color={readyToTrain ? "success" : "default"}
                      label={readyToTrain ? "학습 준비 완료" : "입력 확인 필요"}
                    />
                  </Stack>

                  <Divider />

                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    로컬 실행 명령 미리보기
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "rgba(28,35,24,0.92)",
                      color: "#f7f3ea",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: 12,
                      fontFamily: 'Consolas, "Courier New", monospace',
                    }}
                  >
                    {commandPreview}
                  </Box>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{ justifyContent: "space-between", gap: 1 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      최근 실험
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        void refreshJobs().catch((error) => {
                          setPageError(
                            error instanceof Error
                              ? error.message
                              : "RL job list refresh failed."
                          );
                        });
                      }}
                    >
                      목록 새로고침
                    </Button>
                  </Stack>

                  {loadingJobs && <LinearProgress />}

                  {jobs.length === 0 && !loadingJobs && (
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      아직 실행한 RL 실험이 없습니다.
                    </Typography>
                  )}

                  <Stack spacing={1}>
                    {jobs.slice(0, 6).map((candidateJob) => {
                      const candidateLatestCheckpoint =
                        candidateJob.progress?.checkpoints.at(-1);
                      const candidateEvaluation =
                        candidateJob.summary?.evaluation ??
                        candidateJob.progress?.final_evaluation;
                      const candidateAlgorithm =
                        candidateJob.summary?.selected_algorithm ??
                        candidateJob.summary?.best_run?.algorithm ??
                        candidateJob.progress?.best_run?.algorithm ??
                        candidateJob.progress?.current_algorithm ??
                        candidateJob.request.algorithms?.[0];

                      return (
                        <Box
                          key={candidateJob.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid rgba(120, 133, 103, 0.24)",
                            backgroundColor:
                              candidateJob.id === jobId
                                ? "rgba(95, 112, 65, 0.08)"
                                : "rgba(255,255,255,0.56)",
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              sx={{ justifyContent: "space-between", gap: 1 }}
                            >
                              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                <Chip
                                  size="small"
                                  color={statusColor(candidateJob.status)}
                                  label={formatStatusLabel(candidateJob.status)}
                                />
                                <Chip
                                  size="small"
                                  label={`Job ${candidateJob.id.slice(0, 8)}`}
                                />
                                <Chip
                                  size="small"
                                  label={formatRelativeTimestamp(
                                    candidateJob.createdAt
                                  )}
                                />
                                {candidateJob.id === jobId && (
                                  <Chip size="small" color="success" label="현재 열림" />
                                )}
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setJobId(candidateJob.id)}
                                >
                                  결과 열기
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    void handleRestoreJobRequest(candidateJob);
                                  }}
                                  disabled={restoringJobId === candidateJob.id}
                                >
                                  {restoringJobId === candidateJob.id
                                    ? "불러오는 중"
                                    : "설정 복원"}
                                </Button>
                              </Stack>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                              <Chip
                                size="small"
                                label={`Timesteps ${candidateJob.request.timesteps}`}
                              />
                              <Chip
                                size="small"
                                label={`Algo ${formatAlgorithmLabel(candidateAlgorithm)}`}
                              />
                              <Chip
                                size="small"
                                label={`Win ${formatPercent(
                                  candidateEvaluation?.success_rate ??
                                    candidateEvaluation?.win_rate ??
                                    candidateLatestCheckpoint?.eval_success_rate
                                )}`}
                              />
                              <Chip
                                size="small"
                                label={`Eval ${formatOptionalNumber(
                                  candidateEvaluation?.mean_reward ??
                                    candidateLatestCheckpoint?.eval_mean_reward
                                )}`}
                              />
                              <Chip
                                size="small"
                                label={`Target ${
                                  formatSelectedTargets(
                                    candidateEvaluation?.selected_target_id,
                                    candidateEvaluation?.selected_target_ids ??
                                      candidateLatestCheckpoint?.selected_target_ids
                                  )
                                }`}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    결과 그래프
                  </Typography>
                  <RlLabLineChart
                    title="평가 승리확률 추이"
                    subtitle="checkpoint 마다 deterministic evaluation success rate (%)"
                    color="#5f7041"
                    points={evalSuccessRatePoints}
                    emptyLabel="평가가 누적되면 승리확률 추정치가 이곳에 표시됩니다."
                  />
                  <RlLabLineChart
                    title="평가 보상 추이"
                    subtitle="checkpoint 마다 deterministic evaluation mean reward"
                    color="#2f7d59"
                    points={evalRewardPoints}
                    emptyLabel="학습이 시작되면 평가 reward checkpoint가 이곳에 누적됩니다."
                  />
                  <RlLabLineChart
                    title="멀티시드 성공률"
                    subtitle="최종 선택 모델의 seed별 success rate (%)"
                    color="#8a5b24"
                    points={perSeedSuccessRatePoints}
                    emptyLabel="최종 multi-seed evaluation이 완료되면 seed별 성공률이 표시됩니다."
                  />
                  <RlLabLineChart
                    title="Episode Reward 추이"
                    subtitle="훈련 중 종료된 episode reward"
                    color="#b56b2c"
                    points={episodeRewardPoints}
                    emptyLabel="에피소드가 종료되면 reward curve가 이곳에 누적됩니다."
                  />
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    최신 평가 요약
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <Chip
                      label={`Algorithm ${formatAlgorithmLabel(currentAlgorithm)}`}
                    />
                    <Chip
                      label={`Mode ${
                        job?.summary?.training_mode ??
                        job?.progress?.training_mode ??
                        (form.curriculumEnabled ? "curriculum" : "standard")
                      }`}
                    />
                    <Chip
                      label={`Win ${
                        formatPercent(
                          finalEvaluation?.success_rate ??
                            finalEvaluation?.win_rate ??
                            latestCheckpoint?.eval_success_rate
                        )
                      }`}
                    />
                    <Chip
                      label={`Latest eval ${
                        latestCheckpoint
                          ? latestCheckpoint.eval_mean_reward.toFixed(1)
                          : "-"
                      }`}
                    />
                    <Chip
                      label={`Done ${
                        finalEvaluation?.done_reason ??
                        latestCheckpoint?.done_reason ??
                        "-"
                      }`}
                    />
                    <Chip
                      label={`Target ${
                        formatSelectedTargets(
                          finalEvaluation?.selected_target_id,
                          finalEvaluation?.selected_target_ids ??
                            latestCheckpoint?.selected_target_ids
                        )
                      }`}
                    />
                    <Chip
                      label={`Launch ${
                        finalEvaluation?.launch_count ??
                        latestCheckpoint?.launch_count ??
                        0
                      }`}
                    />
                    <Chip
                      label={`Seeds ${
                        finalEvaluation?.benchmark_seed_count ??
                        job?.summary?.eval_seed_count ??
                        form.evalSeedCount
                      }`}
                    />
                    <Chip
                      label={`Replay Seed ${
                        finalEvaluation?.recording_seed ?? "-"
                      }`}
                    />
                    <Chip
                      label={`Survival ${formatPercent(
                        finalEvaluation?.survivability,
                        1
                      )}`}
                    />
                    <Chip
                      label={`Efficiency ${formatMetricNumber(
                        finalEvaluation?.weapon_efficiency,
                        2
                      )}`}
                    />
                    <Chip
                      label={`Ready ${formatMetricNumber(
                        finalEvaluation?.time_to_ready,
                        1
                      )}`}
                    />
                    <Chip
                      label={`TOT ${formatMetricNumber(
                        finalEvaluation?.tot_quality,
                        2
                      )}`}
                    />
                    <Chip
                      label={`Obs v${
                        finalEvaluation?.observation_version ??
                        job?.summary?.observation_version ??
                        "-"
                      } / Reward v${
                        finalEvaluation?.reward_version ??
                        job?.summary?.reward_version ??
                        "-"
                      }`}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    선택 기준:{" "}
                    {job?.summary?.selection_metric ??
                      "success_rate_then_mean_reward_then_shorter_mean_episode_steps"}
                  </Typography>
                  {finalEvaluation?.seed_variability_warning && (
                    <Alert severity="warning">
                      seed별 편차가 큽니다. 변동 원인:{" "}
                      {formatSeedVariabilityReasons(
                        finalEvaluation.seed_variability?.reasons
                      )}
                    </Alert>
                  )}
                  {Object.keys(
                    finalEvaluation?.selected_target_assignments ??
                      latestCheckpoint?.selected_target_assignments ??
                      {}
                  ).length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {Object.entries(
                        finalEvaluation?.selected_target_assignments ??
                          latestCheckpoint?.selected_target_assignments ??
                          {}
                      ).map(([allyId, targetId]) => (
                        <Chip
                          key={`${allyId}-${targetId}`}
                          size="small"
                          variant="outlined"
                          label={`${allyId} -> ${targetId}`}
                        />
                      ))}
                    </Stack>
                  )}
                  {algorithmRuns.length > 1 && (
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "text.secondary" }}
                      >
                        알고리즘 비교
                      </Typography>
                      <Stack spacing={1}>
                        {algorithmRuns.map((run) => (
                          <Box
                            key={run.algorithm}
                            sx={{
                              p: 1.25,
                              borderRadius: 2,
                              border: "1px solid rgba(120, 133, 103, 0.24)",
                              backgroundColor:
                                run.algorithm === job?.summary?.selected_algorithm
                                  ? "rgba(95, 112, 65, 0.08)"
                                  : "rgba(255,255,255,0.52)",
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack
                                direction={{ xs: "column", md: "row" }}
                                sx={{ justifyContent: "space-between", gap: 1 }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ flexWrap: "wrap" }}
                                >
                                  <Chip
                                    size="small"
                                    color={
                                      run.algorithm === job?.summary?.selected_algorithm
                                        ? "success"
                                        : "default"
                                    }
                                    label={formatAlgorithmLabel(run.algorithm)}
                                  />
                                  <Chip
                                    size="small"
                                    label={`Win ${formatPercent(
                                      run.evaluation.success_rate ??
                                        run.evaluation.win_rate
                                    )}`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`Eval ${formatOptionalNumber(
                                      run.evaluation.mean_reward
                                    )}`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`Survival ${formatPercent(
                                      run.evaluation.survivability,
                                      1
                                    )}`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`TOT ${formatMetricNumber(
                                      run.evaluation.tot_quality,
                                      2
                                    )}`}
                                  />
                                </Stack>
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`선택 ${run.selection_source ?? "-"}`}
                                />
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: "wrap" }}
                              >
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Done ${
                                    run.evaluation.done_reason ?? "-"
                                  }`}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Steps ${formatOptionalNumber(
                                    run.evaluation.mean_episode_steps,
                                    1
                                  )}`}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Ready ${formatMetricNumber(
                                    run.evaluation.time_to_ready,
                                    1
                                  )}`}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Model ${run.model_path.split(/[\\\\/]/).at(-1) ?? run.model_path}`}
                                />
                              </Stack>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                  {latestRewardBreakdownLabels.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                      {latestRewardBreakdownLabels.map((label) => (
                        <Chip key={label} size="small" variant="outlined" label={label} />
                      ))}
                    </Stack>
                  )}
                  {perSeedEvaluations.length > 0 && (
                    <Accordion elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.46)" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 700 }}>
                          멀티시드 결과 상세 ({perSeedEvaluations.length} seeds)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Seed</TableCell>
                              <TableCell align="right">Win</TableCell>
                              <TableCell align="right">Reward</TableCell>
                              <TableCell align="right">Survival</TableCell>
                              <TableCell align="right">Efficiency</TableCell>
                              <TableCell align="right">Ready</TableCell>
                              <TableCell align="right">TOT</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {perSeedEvaluations.map((evaluation, index) => (
                              <TableRow
                                key={`seed-${evaluation.evaluation_seed ?? index}`}
                              >
                                <TableCell>
                                  {evaluation.evaluation_seed ??
                                    finalEvaluation?.benchmark_seeds?.[index] ??
                                    index + 1}
                                </TableCell>
                                <TableCell align="right">
                                  {formatPercent(
                                    evaluation.success_rate ?? evaluation.win_rate,
                                    0
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {formatMetricNumber(evaluation.mean_reward, 1)}
                                </TableCell>
                                <TableCell align="right">
                                  {formatPercent(evaluation.survivability, 0)}
                                </TableCell>
                                <TableCell align="right">
                                  {formatMetricNumber(
                                    evaluation.weapon_efficiency,
                                    2
                                  )}
                                </TableCell>
                                <TableCell align="right">
                                  {formatMetricNumber(evaluation.time_to_ready, 1)}
                                </TableCell>
                                <TableCell align="right">
                                  {formatMetricNumber(evaluation.tot_quality, 2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  {job?.summary && (
                    <Alert severity="success">
                      최종 선택 모델: {job.summary.model_path}
                    </Alert>
                  )}
                  {job?.progress?.error && (
                    <Alert severity="error">{job.progress.error}</Alert>
                  )}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(120, 133, 103, 0.24)",
                  backgroundColor: "rgba(247,243,234,0.92)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    실행 로그
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "rgba(28,35,24,0.94)",
                      color: "#f7f3ea",
                      p: 1.5,
                      fontFamily: 'Consolas, "Courier New", monospace',
                      fontSize: 12,
                      minHeight: 180,
                      maxHeight: 360,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {(job?.stdoutLines ?? []).join("\n") || "학습 로그가 아직 없습니다."}
                    {job?.stderrLines?.length
                      ? `\n\n[stderr]\n${job.stderrLines.join("\n")}`
                      : ""}
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
