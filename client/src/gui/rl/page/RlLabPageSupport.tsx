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


export interface RlCapabilities {
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

export interface RlSeedVariabilitySummary {
  warning?: boolean;
  reasons?: string[];
  success_rate_std?: number;
  mean_reward_std?: number;
  survivability_std?: number;
  weapon_efficiency_std?: number;
  time_to_ready_std?: number;
  tot_quality_std?: number;
}

export interface RlJobEvaluation {
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

export interface RlJobCheckpoint {
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

export interface RlJobEpisode {
  algorithm?: string;
  timesteps: number;
  reward: number;
  length: number;
}

export interface RlJobAlgorithmProgress {
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

export interface RlJobProgress {
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

export interface RlJobSummaryRun {
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

export interface RlJobEvaluationSnapshot {
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

export interface RlJobLeaderboardEntry {
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

export interface RlJobMetricLeader {
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

export interface RlJobRetainedModel {
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

export interface RlJobSummary {
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

export interface RlJobSnapshot {
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

export interface RlJobListItem extends RlJobSnapshot {
  exitCode?: number | null;
  cancelRequested?: boolean;
}

export interface RewardConfigForm {
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

export interface TrainingForm {
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

export interface TrainingPreset {
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

export interface ApplyScenarioSetupOptions {
  scenarioText: string;
  preset?: TrainingPreset;
  capabilities?: RlCapabilities | null;
}

export interface RlLabPageProps {
  onBack: () => void;
  initialJobId?: string | null;
  onJobIdChange: (jobId: string | null) => void;
  openReplayOnMap: (recording: string, label?: string) => void;
}

export const fallbackForm: TrainingForm = {
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

export const rlFirstSuccessDemoText = JSON.stringify(rlFirstSuccessDemoJson, null, 2);
export const rlBattleOptimizationDemoText = JSON.stringify(
  rlBattleOptimizationDemoJson,
  null,
  2
);

export const trainingPresets: TrainingPreset[] = [
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

export function toRewardConfigForm(
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

export function applyScenarioSetup(
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

export function buildCommandPreview(form: TrainingForm) {
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

export function formatAlgorithmLabel(algorithm: string | undefined) {
  return algorithm ? algorithm.toUpperCase() : "-";
}

export function formatPercent(value: number | undefined, digits = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${(value * 100).toFixed(digits)}%`
    : "-";
}

export function formatSelectedTargets(
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

export function applyScenarioRecommendations(
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

export function formatStatusLabel(
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

export function statusColor(
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

export function formatRelativeTimestamp(value: string | null) {
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

export function formatOptionalNumber(value: number | undefined, digits = 1) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
}

export function formatMetricNumber(value: number | undefined, digits = 2) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
}

export function formatMetricLeaderLabel(metric: string | undefined) {
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

export function formatSeedVariabilityReasons(reasons: string[] | undefined) {
  if (!reasons || reasons.length === 0) {
    return "-";
  }
  return reasons.join(", ");
}

export function formatRewardBreakdownLabels(
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

export function hasCheckpointReplay(checkpoint: RlJobCheckpoint | null | undefined) {
  return Boolean(
    checkpoint?.replay_available &&
      checkpoint.recording_path &&
      checkpoint.recording_path.trim().length > 0
  );
}

export const WRAP_ROW_SX = {
  flexWrap: "wrap",
  alignItems: "flex-start",
  minWidth: 0,
} as const;

export const BREAK_TEXT_SX = {
  overflowWrap: "anywhere",
  wordBreak: "break-word",
} as const;

export const MUTED_TEXT_SX = {
  color: RL_LAB_PALETTE.mutedText,
} as const;

export const SECTION_LABEL_SX = {
  fontWeight: 700,
  color: RL_LAB_PALETTE.heading,
} as const;

export const SURFACE_PAPER_SX = {
  p: 2,
  borderRadius: 3,
  border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
  background: RL_LAB_PALETTE.surfaceBackground,
  color: RL_LAB_PALETTE.text,
  boxShadow: RL_LAB_PALETTE.shadow,
} as const;

export const DARK_PANEL_SX = {
  backgroundColor: RL_LAB_PALETTE.darkPanelBackground,
  color: RL_LAB_PALETTE.darkPanelText,
} as const;

export const PRIMARY_BUTTON_SX = {
  backgroundColor: RL_LAB_PALETTE.accent,
  color: RL_LAB_PALETTE.heroText,
  "&:hover": { backgroundColor: RL_LAB_PALETTE.accentHover },
} as const;

export const DASHBOARD_GRID_SX = {
  display: "grid",
  gap: 1.25,
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
    xl: "repeat(6, minmax(0, 1fr))",
  },
} as const;

export const DASHBOARD_CARD_SX = {
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

export const CHART_GRID_SX = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    xl: "repeat(2, minmax(0, 1fr))",
  },
} as const;

export const ACCORDION_SX = {
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

export const TABLE_CONTAINER_SX = {
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

export interface RlDashboardMetricCardProps {
  label: string;
  value: string;
  meta?: string;
  info?: string;
}

export function RlDashboardMetricCard(props: Readonly<RlDashboardMetricCardProps>) {
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

export interface RlAccordionHeaderProps {
  title: string;
  info?: string;
}

export function RlAccordionHeader(props: Readonly<RlAccordionHeaderProps>) {
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

