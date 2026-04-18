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
    guidedLaunchBootstrapSteps: number;
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
  export_path?: string | null;
  recording_path?: string | null;
  replay_available?: boolean;
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

interface RlJobEvaluationSnapshot {
  benchmark_seed_count?: number;
  success_rate?: number;
  mean_reward?: number;
  mean_episode_steps?: number;
  survivability?: number;
  weapon_efficiency?: number;
  time_to_ready?: number;
  tot_quality?: number;
  seed_variability_warning?: boolean;
  done_reason?: string | null;
  done_reason_detail?: string | null;
}

interface RlJobLeaderboardEntry {
  rank: number;
  algorithm: string;
  model_path: string;
  selection_source?: string;
  selected?: boolean;
  selection_score?: {
    success_rate?: number;
    mean_reward?: number;
    mean_episode_steps?: number;
  };
  evaluation_summary?: RlJobEvaluationSnapshot;
}

interface RlJobMetricLeader {
  metric: string;
  metric_key?: string | null;
  direction?: string;
  algorithm: string;
  model_path?: string;
  model_metadata_path?: string | null;
  export_path?: string | null;
  eval_recording_path?: string | null;
  retained_model_path?: string | null;
  retained_model_metadata_path?: string | null;
  value?: number | Record<string, number>;
  evaluation_summary?: RlJobEvaluationSnapshot;
}

interface RlJobRetainedModel {
  algorithm: string;
  metrics: string[];
  model_path: string;
  model_metadata_path?: string | null;
  export_path?: string | null;
  eval_recording_path?: string | null;
  evaluation_path?: string | null;
  source_model_path?: string;
  source_model_metadata_path?: string | null;
  source_export_path?: string | null;
  source_eval_recording_path?: string | null;
  evaluation_summary?: RlJobEvaluationSnapshot;
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
    retained_models?: string;
  };
  evaluation?: RlJobEvaluation;
  best_run?: RlJobSummaryRun;
  leaderboard?: RlJobLeaderboardEntry[];
  metric_leaders?: Record<string, RlJobMetricLeader>;
  retained_models?: {
    archive_schema_version?: number;
    generated_at_utc?: string;
    archive_root?: string;
    retention_rule?: string;
    model_count?: number;
    metric_leaders?: Record<string, RlJobMetricLeader>;
    models?: RlJobRetainedModel[];
    manifest_path?: string;
  };
  runs?: RlJobSummaryRun[];
}

interface RlJobSnapshot {
  id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  scenarioName?: string | null;
  displayLabel?: string | null;
  request: {
    experimentLabel?: string;
    algorithms?: string[];
    timesteps: number;
    maxEpisodeSteps: number;
    evalEpisodes: number;
    evalSeedCount?: number;
    curriculumEnabled?: boolean;
    guidedLaunchBootstrapSteps?: number;
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
  experimentLabel: string;
  algorithms: string[];
  timesteps: number;
  maxEpisodeSteps: number;
  evalEpisodes: number;
  evalSeedCount: number;
  curriculumEnabled: boolean;
  guidedLaunchBootstrapSteps: number;
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

interface ApplyScenarioSetupOptions {
  scenarioText: string;
  preset?: TrainingPreset;
  capabilities?: RlCapabilities | null;
}

interface RlLabPageProps {
  onBack: () => void;
  initialJobId?: string | null;
  onJobIdChange: (jobId: string | null) => void;
  openReplayOnMap: (recording: string, label?: string) => void;
}

const fallbackForm: TrainingForm = {
  experimentLabel: "",
  algorithms: ["ppo"],
  timesteps: 4096,
  maxEpisodeSteps: 240,
  evalEpisodes: 1,
  evalSeedCount: 3,
  curriculumEnabled: false,
  guidedLaunchBootstrapSteps: 12,
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

const rlFirstSuccessDemoText = JSON.stringify(rlFirstSuccessDemoJson, null, 2);
const rlBattleOptimizationDemoText = JSON.stringify(
  rlBattleOptimizationDemoJson,
  null,
  2
);

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

function toRewardConfigForm(
  rewardConfig?: Record<string, number>
): RewardConfigForm {
  const source = rewardConfig ?? fallbackForm.rewardConfig;
  return {
    killBase: source.killBase ?? fallbackForm.rewardConfig.killBase,
    highValueTargetBonus:
      source.highValueTargetBonus ??
      fallbackForm.rewardConfig.highValueTargetBonus,
    totWeight: source.totWeight ?? fallbackForm.rewardConfig.totWeight,
    totTauSeconds:
      source.totTauSeconds ?? fallbackForm.rewardConfig.totTauSeconds,
    etaProgressWeight:
      source.etaProgressWeight ?? fallbackForm.rewardConfig.etaProgressWeight,
    readyToFireBonus:
      source.readyToFireBonus ?? fallbackForm.rewardConfig.readyToFireBonus,
    stagnationPenaltyPerAssignment:
      source.stagnationPenaltyPerAssignment ??
      fallbackForm.rewardConfig.stagnationPenaltyPerAssignment,
    targetSwitchPenalty:
      source.targetSwitchPenalty ??
      fallbackForm.rewardConfig.targetSwitchPenalty,
    threatStepPenalty:
      source.threatStepPenalty ?? fallbackForm.rewardConfig.threatStepPenalty,
    launchCostPerWeapon:
      source.launchCostPerWeapon ??
      fallbackForm.rewardConfig.launchCostPerWeapon,
    timeCostPerStep:
      source.timeCostPerStep ?? fallbackForm.rewardConfig.timeCostPerStep,
    lossPenaltyPerAlly:
      source.lossPenaltyPerAlly ?? fallbackForm.rewardConfig.lossPenaltyPerAlly,
    successBonus: source.successBonus ?? fallbackForm.rewardConfig.successBonus,
    failurePenalty:
      source.failurePenalty ?? fallbackForm.rewardConfig.failurePenalty,
  };
}

function applyScenarioSetup(
  form: TrainingForm,
  options: ApplyScenarioSetupOptions
) {
  const presetValues = options.preset?.values ?? {};
  const nextForm: TrainingForm = {
    ...form,
    algorithms: normalizeAlgorithmIds(
      options.capabilities?.defaultForm.algorithms,
      form.algorithms
    ),
    ...presetValues,
    rewardConfig: toRewardConfigForm(
      options.capabilities?.defaultForm.rewardConfig
    ),
    scenarioText: options.scenarioText,
  };
  return applyScenarioRecommendations(nextForm, options.scenarioText);
}

function buildCommandPreview(form: TrainingForm) {
  const allyIds = parseCommaSeparatedIds(form.allyIds).join(" ");
  const targetIds = parseCommaSeparatedIds(form.targetIds).join(" ");
  const highValueTargetIds = parseCommaSeparatedIds(
    form.highValueTargetIds
  ).join(" ");
  return [
    "cd gym",
    ".\\.venv\\Scripts\\python.exe scripts\\fixed_target_strike\\train.py",
    `--algorithms ${form.algorithms.join(" ")}`,
    `--timesteps ${form.timesteps}`,
    `--max-episode-steps ${form.maxEpisodeSteps}`,
    `--eval-episodes ${form.evalEpisodes}`,
    `--eval-seed-count ${form.evalSeedCount}`,
    ...(form.curriculumEnabled ? ["--curriculum-enabled"] : []),
    `--guided-launch-bootstrap-steps ${form.guidedLaunchBootstrapSteps}`,
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

function applyScenarioRecommendations(
  form: TrainingForm,
  scenarioText: string
) {
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
    nextForm.highValueTargetIds =
      analysis.recommendedHighValueTargetIds.join(", ");
  }
  return nextForm;
}

function formatStatusLabel(
  status: RlJobSnapshot["status"] | string | undefined
) {
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

function formatMetricLeaderLabel(metric: string | undefined) {
  switch (metric) {
    case "overall":
      return "Overall";
    case "success_rate":
      return "Win";
    case "mean_reward":
      return "Reward";
    case "survivability":
      return "Survival";
    case "weapon_efficiency":
      return "Efficiency";
    case "time_to_ready":
      return "Ready";
    case "tot_quality":
      return "TOT";
    default:
      return metric ?? "-";
  }
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

function hasCheckpointReplay(checkpoint: RlJobCheckpoint | null | undefined) {
  return Boolean(
    checkpoint?.replay_available &&
      checkpoint.recording_path &&
      checkpoint.recording_path.trim().length > 0
  );
}

const WRAP_ROW_SX = {
  flexWrap: "wrap",
  alignItems: "flex-start",
  minWidth: 0,
} as const;

const BREAK_TEXT_SX = {
  overflowWrap: "anywhere",
  wordBreak: "break-word",
} as const;

const MUTED_TEXT_SX = {
  color: RL_LAB_PALETTE.mutedText,
} as const;

const SECTION_LABEL_SX = {
  fontWeight: 700,
  color: RL_LAB_PALETTE.heading,
} as const;

const SURFACE_PAPER_SX = {
  p: 2,
  borderRadius: 3,
  border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
  background: RL_LAB_PALETTE.surfaceBackground,
  color: RL_LAB_PALETTE.text,
  boxShadow: RL_LAB_PALETTE.shadow,
} as const;

const DARK_PANEL_SX = {
  backgroundColor: RL_LAB_PALETTE.darkPanelBackground,
  color: RL_LAB_PALETTE.darkPanelText,
} as const;

const PRIMARY_BUTTON_SX = {
  backgroundColor: RL_LAB_PALETTE.accent,
  color: RL_LAB_PALETTE.heroText,
  "&:hover": { backgroundColor: RL_LAB_PALETTE.accentHover },
} as const;

const DASHBOARD_GRID_SX = {
  display: "grid",
  gap: 1.25,
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
    xl: "repeat(6, minmax(0, 1fr))",
  },
} as const;

const DASHBOARD_CARD_SX = {
  p: 1.5,
  borderRadius: 3,
  border: `1px solid ${RL_LAB_PALETTE.surfaceStrongBorder}`,
  backgroundColor: RL_LAB_PALETTE.surfaceRaisedStrong,
  color: RL_LAB_PALETTE.text,
  minHeight: 122,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
} as const;

const CHART_GRID_SX = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    xl: "repeat(2, minmax(0, 1fr))",
  },
} as const;

const ACCORDION_SX = {
  borderRadius: 3,
  border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
  backgroundColor: RL_LAB_PALETTE.surfaceBackground,
  color: RL_LAB_PALETTE.text,
  boxShadow: RL_LAB_PALETTE.shadow,
  overflow: "hidden",
  "&::before": {
    display: "none",
  },
  "& .MuiAccordionSummary-root": {
    minHeight: 68,
  },
  "& .MuiAccordionSummary-content": {
    my: 1,
  },
} as const;

const TABLE_CONTAINER_SX = {
  overflowX: "auto",
  "& .MuiTable-root": {
    minWidth: 560,
  },
  "& .MuiTableCell-root": {
    color: RL_LAB_PALETTE.text,
    whiteSpace: "normal",
    ...BREAK_TEXT_SX,
  },
  "& .MuiTableCell-head": {
    color: RL_LAB_PALETTE.heading,
    fontWeight: 700,
  },
} as const;

interface RlDashboardMetricCardProps {
  label: string;
  value: string;
  meta?: string;
  info?: string;
}

function RlDashboardMetricCard(props: Readonly<RlDashboardMetricCardProps>) {
  return (
    <Box sx={DASHBOARD_CARD_SX}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <Typography variant="caption" sx={{ color: RL_LAB_PALETTE.mutedText }}>
          {props.label}
        </Typography>
        {props.info ? (
          <RlLabInfoButton
            title={props.label}
            content={props.info}
            label={`${props.label} 설명`}
          />
        ) : null}
      </Stack>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.03em",
            ...BREAK_TEXT_SX,
          }}
        >
          {props.value}
        </Typography>
        {props.meta ? (
          <Typography
            variant="body2"
            sx={{ color: RL_LAB_PALETTE.mutedText, mt: 0.5, ...BREAK_TEXT_SX }}
          >
            {props.meta}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

interface RlAccordionHeaderProps {
  title: string;
  info?: string;
}

function RlAccordionHeader(props: Readonly<RlAccordionHeaderProps>) {
  return (
    <Stack
      direction="row"
      sx={{
        flex: 1,
        minWidth: 0,
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {props.title}
      </Typography>
      {props.info ? (
        <RlLabInfoButton
          title={props.title}
          content={props.info}
          label={`${props.title} 설명`}
        />
      ) : null}
    </Stack>
  );
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

  return (
    <Box
      data-testid="rl-lab-page"
      sx={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
        background: RL_LAB_PALETTE.pageBackground,
        color: RL_LAB_PALETTE.text,
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 2.5, md: 3.5 },
          "& .MuiChip-root": {
            maxWidth: "100%",
            height: "auto",
            alignItems: "flex-start",
          },
          "& .MuiChip-label": {
            display: "block",
            whiteSpace: "normal",
            lineHeight: 1.25,
            py: 0.75,
            ...BREAK_TEXT_SX,
          },
          "& .MuiInputLabel-root": {
            color: RL_LAB_PALETTE.mutedText,
          },
          "& .MuiFormHelperText-root": {
            color: RL_LAB_PALETTE.subtleText,
          },
          "& .MuiInputBase-input, & .MuiInputBase-inputMultiline": {
            color: RL_LAB_PALETTE.text,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: RL_LAB_PALETTE.surfaceBorder,
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: RL_LAB_PALETTE.accent,
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: RL_LAB_PALETTE.accent,
            },
        }}
      >
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
              background: RL_LAB_PALETTE.heroBackground,
              color: RL_LAB_PALETTE.heroText,
              boxShadow: RL_LAB_PALETTE.shadow,
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ justifyContent: "space-between", gap: 1.5 }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography
                      variant="overline"
                      sx={{ letterSpacing: "0.12em", opacity: 0.72 }}
                    >
                      FIRE SCOPE RL LAB
                    </Typography>
                    <RlLabInfoButton
                      tone="dark"
                      title="강화학습 설계 탭"
                      content={
                        "상단은 결과 대시보드입니다.\n승률, 보상, 표적, 발사 수, 체크포인트를 먼저 보고, 필요할 때만 아래 설계 섹션을 열어 시나리오와 보상을 조정하면 됩니다."
                      }
                    />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    고정표적 타격 강화학습 설계
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={dashboardExperimentLabel}
                      sx={{
                        color: RL_LAB_PALETTE.heroText,
                        borderColor: "rgba(248, 250, 252, 0.18)",
                        backgroundColor: "rgba(248, 250, 252, 0.08)",
                      }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`시나리오 ${
                        scenarioAnalysis.scenarioName ?? "불러오기 대기"
                      }`}
                      sx={{
                        color: RL_LAB_PALETTE.heroText,
                        borderColor: "rgba(248, 250, 252, 0.18)",
                        backgroundColor: "rgba(248, 250, 252, 0.08)",
                      }}
                    />
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} sx={WRAP_ROW_SX}>
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
                      color: RL_LAB_PALETTE.heroText,
                      borderColor: "rgba(248, 250, 252, 0.32)",
                    }}
                  >
                    지도 복귀
                  </Button>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleLoadFirstSuccessDemo}
                  sx={PRIMARY_BUTTON_SX}
                >
                  성공 체감 데모
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleLoadBattleOptimizationDemo}
                  sx={PRIMARY_BUTTON_SX}
                >
                  전투·배치 최적화 데모
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleApplyDefaultBaselineSetup}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.32)",
                  }}
                >
                  체험 기본 세팅
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartTraining}
                  disabled={
                    startingJob || job?.status === "running" || !readyToTrain
                  }
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.32)",
                  }}
                >
                  학습 시작
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip
                  variant="outlined"
                  label={`알고리즘 ${form.algorithms
                    .map(formatAlgorithmLabel)
                    .join(", ")}`}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.18)",
                    backgroundColor: "rgba(248, 250, 252, 0.08)",
                  }}
                />
                <Chip
                  variant="outlined"
                  label={`진행 ${dashboardProgressLabel}`}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.18)",
                    backgroundColor: "rgba(248, 250, 252, 0.08)",
                  }}
                />
                <Chip
                  variant="outlined"
                  label={`체크포인트 ${
                    battleWatchCheckpointStep !== null
                      ? battleWatchCheckpointStep
                      : "-"
                  }`}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.18)",
                    backgroundColor: "rgba(248, 250, 252, 0.08)",
                  }}
                />
              </Stack>

              {(job?.status === "running" || startingJob) && <LinearProgress />}
            </Stack>
          </Paper>

          {pageError && <Alert severity="error">{pageError}</Alert>}
          {scenarioMessage && <Alert severity="info">{scenarioMessage}</Alert>}
          {loadingCapabilities && <LinearProgress />}
          {capabilities && !capabilities.available && (
            <Alert severity="warning">
              RL 로컬 API를 찾지 못했습니다. `npm run standalone` 또는 `npm run
              start` 로 client를 띄운 뒤 사용하세요.
            </Alert>
          )}

          <Paper elevation={0} sx={SURFACE_PAPER_SX}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ justifyContent: "space-between", gap: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  학습 대시보드
                </Typography>
                <RlLabInfoButton
                  title="학습 대시보드"
                  content={
                    "강화학습에서 먼저 볼 것은 승률, 보상, 선택 표적, 발사 수, 체크포인트입니다.\n아래 카드와 그래프를 먼저 보고, 결과가 마음에 들지 않을 때만 하단의 시나리오·학습·보상 설정을 조정하면 됩니다."
                  }
                />
              </Stack>

              <Box sx={DASHBOARD_GRID_SX}>
                <RlDashboardMetricCard
                  label="상태"
                  value={formatStatusLabel(job?.status)}
                  meta={`Mode ${dashboardModeLabel}`}
                  info="현재 학습 상태와 학습 모드를 보여줍니다. running이면 정책이 계속 업데이트되고 있는 중입니다."
                />
                <RlDashboardMetricCard
                  label="승률"
                  value={battleWatchWinRateLabel}
                  meta={`Done ${dashboardDoneLabel}`}
                  info="체크포인트 또는 최종 평가 기준 성공률입니다. 가장 먼저 확인할 핵심 지표입니다."
                />
                <RlDashboardMetricCard
                  label="평가 보상"
                  value={battleWatchRewardLabel}
                  meta={`체크포인트 ${battleWatchCheckpointStep ?? "-"}`}
                  info="보상 함수 전체 합계입니다. 승률과 함께 보면 정책이 보상 구조를 제대로 타고 있는지 판단할 수 있습니다."
                />
                <RlDashboardMetricCard
                  label="선택 표적"
                  value={battleWatchTargetLabel}
                  meta={`발사 ${battleWatchLaunchCount}`}
                  info="지금 정책이 집중하는 표적입니다. 표적이 안정되면 행동 정책도 덜 흔들리는 경우가 많습니다."
                />
                <RlDashboardMetricCard
                  label="생존율"
                  value={dashboardSurvivalLabel}
                  meta={`Ready ${dashboardReadyLabel}`}
                  info="아군 보존 정도와 발사 준비 시간을 같이 봅니다. 승률이 높아도 손실이 크면 전술 품질은 낮을 수 있습니다."
                />
                <RlDashboardMetricCard
                  label="학습 진행"
                  value={dashboardProgressLabel}
                  meta={formatAlgorithmLabel(currentAlgorithm)}
                  info="현재 알고리즘과 목표 step 대비 진행량입니다. checkpoint가 쌓일수록 위 그래프도 더 의미 있어집니다."
                />
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => {
                    void handleStartCheckpointSpectatorOnMap().catch((error) => {
                      setPageError(
                        error instanceof Error
                          ? error.message
                          : "Checkpoint spectator could not start."
                      );
                    });
                  }}
                  disabled={!jobId}
                >
                  메인 맵 자동 감시
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => {
                    if (!latestReplayCheckpoint) {
                      return;
                    }
                    void handleOpenCheckpointReplayOnMap(
                      latestReplayCheckpoint
                    ).catch((error) => {
                      setPageError(
                        error instanceof Error
                          ? error.message
                          : "Checkpoint replay load failed."
                      );
                    });
                  }}
                  disabled={!latestReplayCheckpoint}
                >
                  최신 체크포인트 리플레이
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
                  onClick={handleApplyMapBaselineSetup}
                  disabled={!hasImportedMapScenario}
                >
                  지도 시나리오 기본 세팅
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AutoFixHighOutlinedIcon />}
                  onClick={() =>
                    applyRecommendedScenarioSetup(
                      form.scenarioText,
                      "현재 편집 중인 시나리오를 다시 분석했습니다."
                    )
                  }
                  disabled={scenarioAnalysis.status !== "valid"}
                >
                  추천 구성 적용
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip
                  variant="outlined"
                  label={`기본 체험 ${baselinePreset.label} · ${baselinePreset.values.timesteps} step`}
                />
                <Chip
                  label={`세력 ${scenarioAnalysis.sideSummaries.length}`}
                  color={
                    scenarioAnalysis.status === "valid" ? "success" : "default"
                  }
                />
                <Chip label={`항공기 ${scenarioAnalysis.allyOptions.length}`} />
                <Chip
                  label={`고정 표적 ${scenarioAnalysis.targetOptions.length}`}
                />
                {scenarioAnalysis.recommendedControllableSideName && (
                  <Chip
                    label={`아군 ${scenarioAnalysis.recommendedControllableSideName}`}
                  />
                )}
                {scenarioAnalysis.recommendedTargetSideName && (
                  <Chip
                    label={`적 ${scenarioAnalysis.recommendedTargetSideName}`}
                  />
                )}
              </Stack>

              {selectionIssues.length > 0 &&
                scenarioAnalysis.status === "valid" && (
                  <Alert severity="warning">
                    <Box component="ul" sx={{ pl: 2.5, mb: 0, mt: 0 }}>
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
                  <Box component="ul" sx={{ pl: 2.5, mb: 0, mt: 0 }}>
                    {scenarioAnalysis.warnings.map((warning) => (
                      <li key={warning}>
                        <Typography variant="body2">{warning}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}

              {scenarioAnalysis.error && (
                <Alert severity="error">{scenarioAnalysis.error}</Alert>
              )}

              {noLaunchTimeoutHint && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={applyNoLaunchTimeoutRecovery}
                    >
                      무발사 시간초과 보정
                    </Button>
                  }
                >
                  최근 평가에서 발사 없이 시간 제한에 걸렸습니다.
                </Alert>
              )}

              <RlBattleWatchPanel
                statusLabel={formatStatusLabel(job?.status)}
                algorithmLabel={formatAlgorithmLabel(currentAlgorithm)}
                latestCheckpointStep={battleWatchCheckpointStep}
                latestWinRateLabel={battleWatchWinRateLabel}
                latestRewardLabel={battleWatchRewardLabel}
                selectedTargetLabel={battleWatchTargetLabel}
                launchCount={battleWatchLaunchCount}
                assignmentLabels={battleWatchAssignmentLabels}
                rewardLabels={latestRewardBreakdownLabels}
                canStartAutoSpectator={Boolean(jobId)}
                canOpenCheckpointReplay={Boolean(latestReplayCheckpoint)}
                canOpenEvaluationReplay={Boolean(job?.artifacts.evalRecording)}
                onStartAutoSpectator={() => {
                  void handleStartCheckpointSpectatorOnMap().catch((error) => {
                    setPageError(
                      error instanceof Error
                        ? error.message
                        : "Checkpoint spectator could not start."
                    );
                  });
                }}
                onOpenCheckpointReplay={() => {
                  if (!latestReplayCheckpoint) {
                    return;
                  }
                  void handleOpenCheckpointReplayOnMap(
                    latestReplayCheckpoint
                  ).catch((error) => {
                    setPageError(
                      error instanceof Error
                        ? error.message
                        : "Checkpoint replay load failed."
                    );
                  });
                }}
                onOpenEvaluationReplay={() => {
                  void handleOpenReplayOnMap().catch((error) => {
                    setPageError(
                      error instanceof Error
                        ? error.message
                        : "Evaluation replay load failed."
                    );
                  });
                }}
              />
            </Stack>
          </Paper>

          <Paper elevation={0} sx={SURFACE_PAPER_SX}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ justifyContent: "space-between", gap: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  핵심 그래프
                </Typography>
                <RlLabInfoButton
                  title="핵심 그래프"
                  content={
                    "승률과 평가 보상은 정책이 실제로 좋아지고 있는지 보는 핵심 그래프입니다.\nEpisode reward는 학습 중 흔들림을, 멀티시드는 최종 정책의 안정성을 보여줍니다."
                  }
                />
              </Stack>
              <Box sx={CHART_GRID_SX}>
                <RlLabLineChart
                  title="승률"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartWin}
                  points={evalSuccessRatePoints}
                  emptyLabel="평가가 누적되면 승률 추이가 여기에 표시됩니다."
                />
                <RlLabLineChart
                  title="평가 보상"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartReward}
                  points={evalRewardPoints}
                  emptyLabel="checkpoint 평가 보상이 여기에 누적됩니다."
                />
                <RlLabLineChart
                  title="Episode Reward"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartEpisode}
                  points={episodeRewardPoints}
                  emptyLabel="훈련 중 종료된 episode reward가 여기에 누적됩니다."
                />
                <RlLabLineChart
                  title="멀티시드"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartSeed}
                  points={perSeedSuccessRatePoints}
                  emptyLabel="최종 multi-seed evaluation 이후 안정성이 표시됩니다."
                />
              </Box>
            </Stack>
          </Paper>

          <Accordion defaultExpanded={false} elevation={0} sx={ACCORDION_SX}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <RlAccordionHeader
                title="지휘관 자원·배치 최적화"
                info={
                  "지휘관 탐색은 동일한 RL 평가기를 사용해 자산 조합과 초기 배치를 비교합니다.\n학습이 끝난 뒤 어떤 배치가 더 잘 싸우는지 보고 싶을 때 여기를 엽니다."
                }
              />
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pb: 0 }}>
              <RlLabCommanderPanel
                scenarioText={form.scenarioText}
                scenarioAnalysis={scenarioAnalysis}
                availableAllies={availableAllies}
                controllableSideName={form.controllableSideName}
                targetSideName={form.targetSideName}
                allyIds={allyIds}
                targetIds={targetIds}
                highValueTargetIds={highValueTargetIds}
                selectionIssues={selectionIssues}
                trainingRequest={{
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
                  rewardConfig: { ...form.rewardConfig },
                }}
                openReplayOnMap={props.openReplayOnMap}
              />
            </AccordionDetails>
          </Accordion>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              alignItems: "start",
              gridTemplateColumns: "minmax(0, 1fr)",
              "@media (min-width: 1800px)": {
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
              },
            }}
          >
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="시나리오 설계"
                    info={
                      "시나리오 JSON과 아군·적 세력 이름, 학습 대상 ID를 조정하는 영역입니다.\n보통은 데모를 불러온 뒤 여기서 필요할 때만 JSON이나 세력 구성을 수정하면 됩니다."
                    }
                  />
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleLoadDefaultScenario}
                    >
                      기본 시나리오
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleLoadMapScenario}
                    >
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
                      추천 세팅: 아군{" "}
                      {scenarioAnalysis.recommendedControllableSideName ?? "-"}/
                      적 {scenarioAnalysis.recommendedTargetSideName ?? "-"} /
                      항공기 {scenarioAnalysis.recommendedAllyIds.length}대 /
                      표적 {scenarioAnalysis.recommendedTargetIds.length}개
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
                    value={form.allyIds}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        allyIds: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="적 고정 표적 IDs"
                    value={form.targetIds}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        targetIds: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="고가치 표적 IDs"
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

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="시나리오 카탈로그"
                    info={
                      "현재 시나리오에서 감지한 아군 항공기와 고정 표적 목록입니다.\n칩을 눌러 선택 대상을 바꿀 수 있고, 고가치 표적도 같은 흐름으로 지정할 수 있습니다."
                    }
                  />

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      label={`선택 아군 ${allyIds.length} / ${availableAllies.length}`}
                    />
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
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
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
                          disabled={
                            scenarioAnalysis.recommendedAllyIds.length === 0
                          }
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {availableAllies.length > 0 ? (
                        availableAllies.map((ally) => (
                          <Chip
                            key={ally.id}
                            clickable
                            color={
                              selectedAllyIdSet.has(ally.id)
                                ? "success"
                                : "default"
                            }
                            variant={
                              selectedAllyIdSet.has(ally.id)
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() => toggleAllySelection(ally.id)}
                            label={`${ally.id} · 무장 ${ally.weaponCount}`}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={MUTED_TEXT_SX}>
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
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
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
                          disabled={
                            scenarioAnalysis.recommendedTargetIds.length === 0
                          }
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {availableTargets.length > 0 ? (
                        availableTargets.map((target) => (
                          <Chip
                            key={target.id}
                            clickable
                            color={
                              selectedTargetIdSet.has(target.id)
                                ? "warning"
                                : "default"
                            }
                            variant={
                              selectedTargetIdSet.has(target.id)
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() => toggleTargetSelection(target.id)}
                            label={`${target.id} · ${target.kind}`}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={MUTED_TEXT_SX}>
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
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
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
                            onClick={() =>
                              toggleHighValueTargetSelection(target.id)
                            }
                            label={target.id}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={MUTED_TEXT_SX}>
                          먼저 고정 표적을 선택하면 여기서 고가치 표적을 지정할
                          수 있습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="학습 설정"
                    info={
                      "알고리즘, timesteps, evaluation 주기, seed, bootstrap을 조정합니다.\n모델 선택은 success rate 우선, 동률이면 mean reward, 그다음 episode 길이 순입니다."
                    }
                  />
                  <TextField
                    label="실험 라벨"
                    value={form.experimentLabel}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        experimentLabel: event.target.value,
                      }))
                    }
                    placeholder="예: Codex 첫 사용자 점검 2026-04-16"
                    fullWidth
                  />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                      알고리즘 비교
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
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
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Bootstrap ${form.guidedLaunchBootstrapSteps} step`}
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
                      <Chip
                        size="small"
                        variant="outlined"
                        label="Stage 통과 후 다음 난이도로 이동"
                      />
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
                        setNumericFormField(
                          "maxEpisodeSteps",
                          event.target.value
                        )
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
                    <TextField
                      label="Guided Launch Bootstrap"
                      type="number"
                      value={form.guidedLaunchBootstrapSteps}
                      onChange={(event) =>
                        setNumericFormField(
                          "guidedLaunchBootstrapSteps",
                          event.target.value
                        )
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

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{ justifyContent: "space-between", gap: 1 }}
                  >
                    <RlAccordionHeader
                      title="보상 계수 설계"
                      info={
                        "Kill, TOT, ETA, Threat, Launch, Time, Terminal 보상을 조정합니다.\n가시적인 설명은 숨겼고, 실제 의미는 상단 보상 해석 카드와 최신 평가 요약에서 바로 확인할 수 있습니다."
                      }
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={resetRewardConfig}
                    >
                      기본값 복원
                    </Button>
                  </Stack>
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
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
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
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
                        setRewardField("etaProgressWeight", event.target.value)
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
                  <Divider />
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
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
                        setRewardField(
                          "targetSwitchPenalty",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Threat Step Penalty"
                      type="number"
                      value={form.rewardConfig.threatStepPenalty}
                      onChange={(event) =>
                        setRewardField("threatStepPenalty", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Divider />
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
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
                        setRewardField("lossPenaltyPerAlly", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Stack>

            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="실행 패널"
                    info={
                      "실행 패널은 학습 시작, 중지, 새로고침, 아티팩트 다운로드를 담당합니다.\n결과 관측은 상단 대시보드에서 먼저 하고, 여기서는 제어와 내보내기에 집중하면 됩니다."
                    }
                  />
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleStartTraining}
                      disabled={
                        startingJob ||
                        job?.status === "running" ||
                        !readyToTrain
                      }
                      sx={PRIMARY_BUTTON_SX}
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
                    <Chip
                      label={`선택 알고리즘 ${form.algorithms.map(formatAlgorithmLabel).join(", ")}`}
                    />
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
                      <Chip
                        label={`현재 알고리즘 ${formatAlgorithmLabel(currentAlgorithm)}`}
                      />
                    )}
                    <Chip
                      color={readyToTrain ? "success" : "default"}
                      label={readyToTrain ? "학습 준비 완료" : "입력 확인 필요"}
                    />
                    <Chip
                      label={`발사 보조 ${form.guidedLaunchBootstrapSteps} step`}
                    />
                  </Stack>
                  <Divider />

                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                    로컬 실행 명령 미리보기
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      borderRadius: 2,
                      ...DARK_PANEL_SX,
                      whiteSpace: "pre-wrap",
                      overflowX: "auto",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      fontSize: 12,
                      fontFamily: 'Consolas, "Courier New", monospace',
                    }}
                  >
                    {commandPreview}
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{ justifyContent: "space-between", gap: 1 }}
                  >
                    <RlAccordionHeader
                      title="최근 실험"
                      info={
                        "최근 실험은 이전 실행 결과를 다시 여는 곳입니다.\n동일한 시나리오에서 여러 실험을 비교할 때는 여기서 원하는 job을 다시 불러오면 됩니다."
                      }
                    />
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
                    <Typography variant="body2" sx={MUTED_TEXT_SX}>
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
                      const candidateDisplayLabel =
                        candidateJob.displayLabel ??
                        candidateJob.request.experimentLabel ??
                        null;

                      return (
                        <Box
                          key={candidateJob.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
                            backgroundColor:
                              candidateJob.id === jobId
                                ? RL_LAB_PALETTE.accentSoft
                                : RL_LAB_PALETTE.surfaceRaised,
                            color: RL_LAB_PALETTE.text,
                          }}
                        >
                          <Stack spacing={1}>
                            {(candidateDisplayLabel ||
                              candidateJob.scenarioName) && (
                              <Stack spacing={0.25}>
                                {candidateDisplayLabel && (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {candidateDisplayLabel}
                                  </Typography>
                                )}
                                {candidateJob.scenarioName && (
                                  <Typography
                                    variant="caption"
                                    sx={MUTED_TEXT_SX}
                                  >
                                    시나리오: {candidateJob.scenarioName}
                                  </Typography>
                                )}
                              </Stack>
                            )}
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
                                  <Chip
                                    size="small"
                                    color="success"
                                    label="현재 열림"
                                  />
                                )}
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: "wrap" }}
                              >
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

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ flexWrap: "wrap" }}
                            >
                              <Chip
                                size="small"
                                label={`Timesteps ${candidateJob.request.timesteps}`}
                              />
                              <Chip
                                size="small"
                                label={`Bootstrap ${
                                  candidateJob.request
                                    .guidedLaunchBootstrapSteps ?? 0
                                }`}
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
                                label={`Target ${formatSelectedTargets(
                                  candidateEvaluation?.selected_target_id,
                                  candidateEvaluation?.selected_target_ids ??
                                    candidateLatestCheckpoint?.selected_target_ids
                                )}`}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>


              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="최신 평가 요약"
                    info={
                      "최신 평가 요약은 상단 대시보드보다 더 자세한 항목을 보여줍니다.\n알고리즘 비교, 체크포인트 리플레이 목록, 멀티시드 상세는 이 영역에서 확인합니다."
                    }
                  />
                  <Stack direction="row" spacing={1.5} sx={WRAP_ROW_SX}>
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
                      label={`Win ${formatPercent(
                        finalEvaluation?.success_rate ??
                          finalEvaluation?.win_rate ??
                          latestCheckpoint?.eval_success_rate
                      )}`}
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
                      label={`Target ${formatSelectedTargets(
                        finalEvaluation?.selected_target_id,
                        finalEvaluation?.selected_target_ids ??
                          latestCheckpoint?.selected_target_ids
                      )}`}
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
                  <Typography
                    variant="body2"
                    sx={{ ...MUTED_TEXT_SX, ...BREAK_TEXT_SX }}
                  >
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
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
                  {metricLeaderEntries.length > 0 && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                        Metric Leader
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        {metricLeaderEntries.map((leader) => (
                          <Chip
                            key={leader.metric}
                            size="small"
                            variant={
                              leader.metric === "overall"
                                ? "filled"
                                : "outlined"
                            }
                            color={
                              leader.metric === "overall"
                                ? "success"
                                : "default"
                            }
                            label={`${formatMetricLeaderLabel(
                              leader.metric
                            )} ${formatAlgorithmLabel(leader.algorithm)}`}
                          />
                        ))}
                        {job?.summary?.retained_models?.model_count !==
                          undefined && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Retained ${
                              job?.summary?.retained_models?.model_count ?? "-"
                            }`}
                          />
                        )}
                      </Stack>
                      {job?.summary?.retained_models?.manifest_path && (
                        <Typography
                          variant="caption"
                          sx={{ ...MUTED_TEXT_SX, ...BREAK_TEXT_SX }}
                        >
                          보관 manifest:{" "}
                          {job?.summary?.retained_models?.manifest_path}
                        </Typography>
                      )}
                    </Stack>
                  )}
                  {orderedAlgorithmRuns.length > 1 && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                        알고리즘 비교
                      </Typography>
                      <Stack spacing={1}>
                        {orderedAlgorithmRuns.map((run) => (
                          <Box
                            key={run.algorithm}
                            sx={{
                              p: 1.25,
                              borderRadius: 2,
                              border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
                              backgroundColor:
                                run.algorithm ===
                                job?.summary?.selected_algorithm
                                  ? RL_LAB_PALETTE.accentSoft
                                  : RL_LAB_PALETTE.surfaceRaised,
                              color: RL_LAB_PALETTE.text,
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
                                    variant="outlined"
                                    label={`#${leaderboardRankByAlgorithm.get(run.algorithm) ?? "-"}`}
                                  />
                                  <Chip
                                    size="small"
                                    color={
                                      run.algorithm ===
                                      job?.summary?.selected_algorithm
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {latestRewardBreakdownLabels.map((label) => (
                        <Chip
                          key={label}
                          size="small"
                          variant="outlined"
                          label={label}
                        />
                      ))}
                    </Stack>
                  )}
                  {checkpointReplayRows.length > 0 && (
                    <Accordion
                      elevation={0}
                      sx={{
                        backgroundColor: RL_LAB_PALETTE.surfaceRaisedStrong,
                        color: RL_LAB_PALETTE.text,
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 700 }}>
                          체크포인트 리플레이 ({checkpointReplayRows.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer sx={TABLE_CONTAINER_SX}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Algorithm</TableCell>
                                <TableCell align="right">Step</TableCell>
                                <TableCell align="right">Win</TableCell>
                                <TableCell align="right">Reward</TableCell>
                                <TableCell align="right">Done</TableCell>
                                <TableCell align="right">Replay</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {checkpointReplayRows.map((checkpoint) => {
                                const checkpointAlgorithm =
                                  checkpoint.algorithm ?? currentAlgorithm;
                                return (
                                  <TableRow
                                    key={`${checkpointAlgorithm ?? "unknown"}-${checkpoint.timesteps}`}
                                  >
                                    <TableCell>
                                      {formatAlgorithmLabel(
                                        checkpointAlgorithm
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {checkpoint.timesteps}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatPercent(
                                        checkpoint.eval_success_rate
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatMetricNumber(
                                        checkpoint.eval_mean_reward,
                                        1
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {checkpoint.done_reason ?? "-"}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<MapIcon />}
                                        onClick={() => {
                                          void handleOpenCheckpointReplayOnMap(
                                            checkpoint
                                          ).catch((error) => {
                                            setPageError(
                                              error instanceof Error
                                                ? error.message
                                                : "Checkpoint replay load failed."
                                            );
                                          });
                                        }}
                                      >
                                        열기
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  {perSeedEvaluations.length > 0 && (
                    <Accordion
                      elevation={0}
                      sx={{
                        backgroundColor: RL_LAB_PALETTE.surfaceRaisedStrong,
                        color: RL_LAB_PALETTE.text,
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 700 }}>
                          멀티시드 결과 상세 ({perSeedEvaluations.length} seeds)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer sx={TABLE_CONTAINER_SX}>
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
                                      finalEvaluation?.benchmark_seeds?.[
                                        index
                                      ] ??
                                      index + 1}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatPercent(
                                      evaluation.success_rate ??
                                        evaluation.win_rate,
                                      0
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatMetricNumber(
                                      evaluation.mean_reward,
                                      1
                                    )}
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
                                    {formatMetricNumber(
                                      evaluation.time_to_ready,
                                      1
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatMetricNumber(
                                      evaluation.tot_quality,
                                      2
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  {job?.summary && (
                    <Alert severity="success" sx={BREAK_TEXT_SX}>
                      최종 선택 모델: {job.summary.model_path}
                    </Alert>
                  )}
                  {job?.progress?.error && (
                    <Alert severity="error">{job.progress.error}</Alert>
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="실행 로그"
                    info={
                      "Python 학습 스크립트의 stdout/stderr 로그입니다.\n학습이 멈추거나 체크포인트가 안 생길 때는 여기서 에러를 먼저 확인합니다."
                    }
                  />
                  <Box
                    sx={{
                      borderRadius: 2,
                      ...DARK_PANEL_SX,
                      p: 1.5,
                      fontFamily: 'Consolas, "Courier New", monospace',
                      fontSize: 12,
                      minHeight: 180,
                      maxHeight: 360,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      ...BREAK_TEXT_SX,
                    }}
                  >
                    {(job?.stdoutLines ?? []).join("\n") ||
                      "학습 로그가 아직 없습니다."}
                    {job?.stderrLines?.length
                      ? `\n\n[stderr]\n${job.stderrLines.join("\n")}`
                      : ""}
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
