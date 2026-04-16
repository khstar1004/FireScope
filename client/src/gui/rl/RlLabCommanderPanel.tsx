import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  LinearProgress,
  MenuItem,
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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import StopIcon from "@mui/icons-material/Stop";
import MapIcon from "@mui/icons-material/Map";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import type {
  RlScenarioAnalysis,
  RlScenarioUnitOption,
} from "@/gui/rl/rlLabScenarioSupport";
import type { RlLabTrainingRequestLike } from "@/gui/rl/rlLabTrainingSupport";
import { RL_LAB_PALETTE } from "@/gui/rl/rlLabPalette";

type CommanderPresetKey = "smoke" | "quick" | "standard";
type CommanderSearchMode = "fixed" | "single" | "pair";
type CommanderJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

interface CommanderPreset {
  key: CommanderPresetKey;
  label: string;
  description: string;
  candidateLimit: number;
  maxResourceCombinations: number;
  distanceScales: number[];
  bearingOffsetsDeg: number[];
  formationSpreadsNm: number[];
}

interface CommanderCapabilities {
  available: boolean;
  pythonCommand: string;
  presets: CommanderPreset[];
  defaultForm: {
    preset: CommanderPresetKey;
    candidateLimit: number;
    retainTopK: number;
    minAllies: number;
    maxAllies: number | null;
    maxResourceCombinations: number;
    distanceScales: number[];
    bearingOffsetsDeg: number[];
    formationSpreadsNm: number[];
    highValueTargetSearchMode: CommanderSearchMode;
    dryRun: boolean;
  };
}

interface CommanderEvalSummary {
  success_rate?: number;
  mean_reward?: number;
  survivability?: number;
  time_to_ready?: number;
}

interface CommanderLeaderboardEntry {
  rank: number;
  candidate_id: string;
  label: string;
  evaluation_summary?: CommanderEvalSummary;
}

interface CommanderJobSnapshot {
  id: string;
  status: CommanderJobStatus;
  createdAt: string;
  stdoutLines: string[];
  stderrLines: string[];
  progress: {
    status?: string;
    candidate_count?: number;
    finished_candidate_count?: number;
    current_candidate_label?: string | null;
    leaderboard?: CommanderLeaderboardEntry[];
  } | null;
  summary: {
    dry_run?: boolean;
    selection_metric?: string;
    selected_candidate_label?: string | null;
    leaderboard?: CommanderLeaderboardEntry[];
    search_space?: { candidate_count?: number };
  } | null;
  artifacts: {
    summary: boolean;
    selectedEvalRecording: boolean;
  };
}

interface CommanderForm {
  preset: CommanderPresetKey;
  candidateLimit: number;
  retainTopK: number;
  candidateAllyIds: string[];
  minAllies: number;
  maxAlliesText: string;
  maxResourceCombinations: number;
  distanceScalesText: string;
  bearingOffsetsDegText: string;
  formationSpreadsNmText: string;
  highValueTargetSearchMode: CommanderSearchMode;
  dryRun: boolean;
}

interface RlLabCommanderPanelProps {
  scenarioText: string;
  scenarioAnalysis: RlScenarioAnalysis;
  availableAllies: RlScenarioUnitOption[];
  controllableSideName: string;
  targetSideName: string;
  allyIds: string[];
  targetIds: string[];
  highValueTargetIds: string[];
  selectionIssues: string[];
  trainingRequest: RlLabTrainingRequestLike;
  openReplayOnMap: (recording: string, label?: string) => void;
}

function formatPercent(value: number | undefined, digits = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${(value * 100).toFixed(digits)}%`
    : "-";
}

function formatNumber(value: number | undefined, digits = 1) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
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

const FOUR_COLUMN_FIELD_GRID_SX = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(4, minmax(0, 1fr))",
  },
} as const;

const TABLE_CONTAINER_SX = {
  overflowX: "auto",
  "& .MuiTable-root": {
    minWidth: 540,
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

const SURFACE_PAPER_SX = {
  p: 2,
  borderRadius: 3,
  border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
  background: RL_LAB_PALETTE.surfaceBackground,
  color: RL_LAB_PALETTE.text,
  boxShadow: RL_LAB_PALETTE.shadow,
} as const;

const MUTED_TEXT_SX = {
  color: RL_LAB_PALETTE.mutedText,
} as const;

const DARK_PANEL_SX = {
  borderRadius: 2,
  backgroundColor: RL_LAB_PALETTE.darkPanelBackground,
  color: RL_LAB_PALETTE.darkPanelText,
  p: 1.5,
  fontFamily: 'Consolas, "Courier New", monospace',
  fontSize: 12,
} as const;

const PRIMARY_BUTTON_SX = {
  backgroundColor: RL_LAB_PALETTE.accent,
  color: RL_LAB_PALETTE.heroText,
  "&:hover": { backgroundColor: RL_LAB_PALETTE.accentHover },
} as const;

function formatStatusLabel(status: string | undefined) {
  switch (status) {
    case "running":
      return "탐색 중";
    case "completed":
      return "완료";
    case "failed":
      return "실패";
    case "cancelled":
      return "중단됨";
    case "planning":
      return "후보 생성";
    default:
      return "준비";
  }
}

function toNumberListText(values: number[]) {
  return values.join(", ");
}

function parseNumberList(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

function buildForm(
  capabilities: CommanderCapabilities,
  allyIds: string[]
): CommanderForm {
  return {
    preset: capabilities.defaultForm.preset,
    candidateLimit: capabilities.defaultForm.candidateLimit,
    retainTopK: capabilities.defaultForm.retainTopK,
    candidateAllyIds: allyIds,
    minAllies: capabilities.defaultForm.minAllies,
    maxAlliesText:
      capabilities.defaultForm.maxAllies !== null
        ? `${capabilities.defaultForm.maxAllies}`
        : "",
    maxResourceCombinations: capabilities.defaultForm.maxResourceCombinations,
    distanceScalesText: toNumberListText(
      capabilities.defaultForm.distanceScales
    ),
    bearingOffsetsDegText: toNumberListText(
      capabilities.defaultForm.bearingOffsetsDeg
    ),
    formationSpreadsNmText: toNumberListText(
      capabilities.defaultForm.formationSpreadsNm
    ),
    highValueTargetSearchMode:
      capabilities.defaultForm.highValueTargetSearchMode,
    dryRun: capabilities.defaultForm.dryRun,
  };
}

export default function RlLabCommanderPanel(
  props: Readonly<RlLabCommanderPanelProps>
) {
  const [capabilities, setCapabilities] =
    useState<CommanderCapabilities | null>(null);
  const [form, setForm] = useState<CommanderForm | null>(null);
  const [jobs, setJobs] = useState<CommanderJobSnapshot[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<CommanderJobSnapshot | null>(null);
  const [loadingCapabilities, setLoadingCapabilities] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [startingJob, setStartingJob] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingCapabilities(true);
      try {
        const response = await fetch("/api/rl/commander/capabilities");
        if (!response.ok) {
          throw new Error("Commander capabilities could not be loaded.");
        }
        const payload = (await response.json()) as CommanderCapabilities;
        if (!active) {
          return;
        }
        setCapabilities(payload);
        setForm((prev) => prev ?? buildForm(payload, props.allyIds));
      } catch (error) {
        if (active) {
          setPanelError(
            error instanceof Error
              ? error.message
              : "Commander API unavailable."
          );
        }
      } finally {
        if (active) {
          setLoadingCapabilities(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [props.allyIds]);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const load = async () => {
      try {
        setLoadingJobs(true);
        const response = await fetch("/api/rl/commander/jobs");
        if (!response.ok) {
          throw new Error("Commander job list could not be loaded.");
        }
        const payload = (await response.json()) as CommanderJobSnapshot[];
        if (!active) {
          return;
        }
        setJobs(payload);
        if (!jobId && payload.length > 0) {
          setJobId(payload[0].id);
        }
        const shouldPoll = payload.some((item) => item.status === "running");
        timer = window.setTimeout(() => void load(), shouldPoll ? 2500 : 8000);
      } catch (error) {
        if (active) {
          setPanelError(
            error instanceof Error
              ? error.message
              : "Commander job list unavailable."
          );
        }
      } finally {
        if (active) {
          setLoadingJobs(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }
    let active = true;
    let timer: number | undefined;
    const load = async () => {
      const response = await fetch(`/api/rl/commander/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Commander job status could not be loaded.");
      }
      const payload = (await response.json()) as CommanderJobSnapshot;
      if (!active) {
        return;
      }
      setJob(payload);
      if (payload.status === "running") {
        timer = window.setTimeout(() => void load(), 1500);
      }
    };
    void load().catch((error) => {
      if (active) {
        setPanelError(
          error instanceof Error
            ? error.message
            : "Commander job polling failed."
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

  useEffect(() => {
    if (!form) {
      return;
    }
    const available = new Set(props.availableAllies.map((ally) => ally.id));
    const retained = form.candidateAllyIds.filter((allyId) =>
      available.has(allyId)
    );
    if (retained.length === form.candidateAllyIds.length) {
      return;
    }
    setForm({
      ...form,
      candidateAllyIds: retained.length > 0 ? retained : props.allyIds,
    });
  }, [form, props.availableAllies, props.allyIds]);

  const leaderboard = useMemo(
    () => job?.summary?.leaderboard ?? job?.progress?.leaderboard ?? [],
    [job?.progress?.leaderboard, job?.summary?.leaderboard]
  );
  const ready =
    Boolean(capabilities?.available) &&
    Boolean(form) &&
    props.scenarioAnalysis.status === "valid" &&
    props.selectionIssues.length === 0 &&
    (form?.candidateAllyIds.length ?? 0) > 0 &&
    props.targetIds.length > 0;

  const commandPreview = useMemo(() => {
    if (!form) {
      return "";
    }
    return [
      "cd gym",
      `${capabilities?.pythonCommand ?? ".\\.venv\\Scripts\\python.exe"} scripts\\fixed_target_strike\\commander_optimize.py`,
      `--preset ${form.preset}`,
      `--candidate-limit ${form.candidateLimit}`,
      `--candidate-ally-ids ${form.candidateAllyIds.join(" ")}`,
      `--target-ids ${props.targetIds.join(" ")}`,
      `--high-value-target-ids ${props.highValueTargetIds.join(" ")}`,
      ...(form.dryRun ? ["--dry-run"] : []),
    ].join(" ");
  }, [
    capabilities?.pythonCommand,
    form,
    props.highValueTargetIds,
    props.targetIds,
  ]);

  const refreshJobs = async () => {
    const response = await fetch("/api/rl/commander/jobs");
    if (!response.ok) {
      throw new Error("Commander refresh failed.");
    }
    setJobs((await response.json()) as CommanderJobSnapshot[]);
  };

  const refreshJob = async () => {
    if (!jobId) {
      return;
    }
    const response = await fetch(`/api/rl/commander/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error("Commander job refresh failed.");
    }
    setJob((await response.json()) as CommanderJobSnapshot);
    await refreshJobs().catch(() => undefined);
  };

  const handleStart = async () => {
    if (!form) {
      return;
    }
    setPanelError(null);
    setStartingJob(true);
    try {
      if (props.scenarioAnalysis.status !== "valid") {
        throw new Error(
          props.scenarioAnalysis.error ?? "시나리오 JSON이 유효하지 않습니다."
        );
      }
      if (props.selectionIssues.length > 0) {
        throw new Error(props.selectionIssues[0]);
      }
      const response = await fetch("/api/rl/commander/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioText: props.scenarioText,
          preset: form.preset,
          candidateLimit: form.candidateLimit,
          retainTopK: form.retainTopK,
          candidateAllyIds: form.candidateAllyIds,
          minAllies: form.minAllies,
          maxAllies:
            form.maxAlliesText.trim().length > 0
              ? Number(form.maxAlliesText.trim())
              : null,
          maxResourceCombinations: form.maxResourceCombinations,
          distanceScales: parseNumberList(form.distanceScalesText),
          bearingOffsetsDeg: parseNumberList(form.bearingOffsetsDegText),
          formationSpreadsNm: parseNumberList(form.formationSpreadsNmText),
          highValueTargetSearchMode: form.highValueTargetSearchMode,
          dryRun: form.dryRun,
          algorithms: props.trainingRequest.algorithms,
          timesteps: props.trainingRequest.timesteps,
          maxEpisodeSteps: props.trainingRequest.maxEpisodeSteps,
          evalEpisodes: props.trainingRequest.evalEpisodes,
          evalSeedCount: props.trainingRequest.evalSeedCount,
          curriculumEnabled: props.trainingRequest.curriculumEnabled,
          seed: props.trainingRequest.seed,
          progressEvalFrequency: props.trainingRequest.progressEvalFrequency,
          progressEvalEpisodes: props.trainingRequest.progressEvalEpisodes,
          controllableSideName: props.controllableSideName,
          targetSideName: props.targetSideName,
          allyIds: props.allyIds,
          targetIds: props.targetIds,
          highValueTargetIds: props.highValueTargetIds,
          rewardConfig: props.trainingRequest.rewardConfig,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Commander job start failed.");
      }
      const payload = (await response.json()) as { jobId: string };
      setJobId(payload.jobId);
      await refreshJobs().catch(() => undefined);
    } catch (error) {
      setPanelError(
        error instanceof Error ? error.message : "Commander job start failed."
      );
    } finally {
      setStartingJob(false);
    }
  };

  const handleCancel = async () => {
    if (!jobId) {
      return;
    }
    const response = await fetch(`/api/rl/commander/jobs/${jobId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Commander job cancellation failed.");
    }
    setJob((await response.json()) as CommanderJobSnapshot);
    await refreshJobs().catch(() => undefined);
  };

  const handleOpenReplay = async () => {
    if (!jobId || !job?.artifacts.selectedEvalRecording) {
      return;
    }
    const response = await fetch(
      `/api/rl/commander/jobs/${jobId}/artifact/selectedEvalRecording`
    );
    if (!response.ok) {
      throw new Error("Commander replay could not be loaded.");
    }
    const recording = await response.text();
    props.openReplayOnMap(
      recording,
      `Commander 선정 리플레이 ${jobId.slice(0, 8)}`
    );
  };

  if (!form) {
    return (
      <Paper elevation={0} sx={SURFACE_PAPER_SX}>
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            지휘관 자원·배치 최적화
          </Typography>
          {loadingCapabilities && <LinearProgress />}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        ...SURFACE_PAPER_SX,
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
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            지휘관 자원·배치 최적화
          </Typography>
          <Typography variant="body2" sx={{ ...MUTED_TEXT_SX, mt: 0.5 }}>
            전술 RL을 내부 평가기로 사용하면서 자산 조합과 초기 배치를 바꿔
            COA를 비교합니다.
          </Typography>
        </Box>

        {(loadingCapabilities || loadingJobs || startingJob) && (
          <LinearProgress />
        )}
        {panelError && <Alert severity="error">{panelError}</Alert>}
        {props.selectionIssues.length > 0 &&
          props.scenarioAnalysis.status === "valid" && (
            <Alert severity="warning">
              현재 전술 RL selection issue가 남아 있어서 commander 탐색도 같은
              제약을 받습니다.
            </Alert>
          )}

        <Stack direction="row" spacing={1} sx={WRAP_ROW_SX}>
          {capabilities?.presets.map((preset) => (
            <Button
              key={preset.key}
              variant={form.preset === preset.key ? "contained" : "outlined"}
              onClick={() => {
                setForm({
                  ...form,
                  preset: preset.key,
                  candidateLimit: preset.candidateLimit,
                  maxResourceCombinations: preset.maxResourceCombinations,
                  distanceScalesText: toNumberListText(preset.distanceScales),
                  bearingOffsetsDegText: toNumberListText(
                    preset.bearingOffsetsDeg
                  ),
                  formationSpreadsNmText: toNumberListText(
                    preset.formationSpreadsNm
                  ),
                });
              }}
              sx={
                form.preset === preset.key
                  ? {
                      ...PRIMARY_BUTTON_SX,
                    }
                  : undefined
              }
            >
              {preset.label}
            </Button>
          ))}
          <Button
            variant="outlined"
            onClick={() =>
              setForm({ ...form, candidateAllyIds: props.allyIds })
            }
          >
            현재 아군 동기화
          </Button>
        </Stack>

        <Box sx={FOUR_COLUMN_FIELD_GRID_SX}>
          <TextField
            label="Candidate Limit"
            type="number"
            value={form.candidateLimit}
            onChange={(event) =>
              setForm({ ...form, candidateLimit: Number(event.target.value) })
            }
            fullWidth
          />
          <TextField
            label="Min Allies"
            type="number"
            value={form.minAllies}
            onChange={(event) =>
              setForm({ ...form, minAllies: Number(event.target.value) })
            }
            fullWidth
          />
          <TextField
            label="Max Allies"
            value={form.maxAlliesText}
            onChange={(event) =>
              setForm({ ...form, maxAlliesText: event.target.value })
            }
            fullWidth
          />
          <TextField
            select
            label="HVT Search"
            value={form.highValueTargetSearchMode}
            onChange={(event) =>
              setForm({
                ...form,
                highValueTargetSearchMode: event.target
                  .value as CommanderSearchMode,
              })
            }
            fullWidth
          >
            <MenuItem value="fixed">기존 유지</MenuItem>
            <MenuItem value="single">단일 순환</MenuItem>
            <MenuItem value="pair">단일/복수 탐색</MenuItem>
          </TextField>
        </Box>

        <Box sx={FOUR_COLUMN_FIELD_GRID_SX}>
          <TextField
            label="Distance Scales"
            value={form.distanceScalesText}
            onChange={(event) =>
              setForm({ ...form, distanceScalesText: event.target.value })
            }
            fullWidth
          />
          <TextField
            label="Bearing Offsets"
            value={form.bearingOffsetsDegText}
            onChange={(event) =>
              setForm({ ...form, bearingOffsetsDegText: event.target.value })
            }
            fullWidth
          />
          <TextField
            label="Formation Spreads"
            value={form.formationSpreadsNmText}
            onChange={(event) =>
              setForm({ ...form, formationSpreadsNmText: event.target.value })
            }
            fullWidth
          />
          <TextField
            label="Max Resource Combos"
            type="number"
            value={form.maxResourceCombinations}
            onChange={(event) =>
              setForm({
                ...form,
                maxResourceCombinations: Number(event.target.value),
              })
            }
            fullWidth
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={form.dryRun}
              onChange={(event) =>
                setForm({ ...form, dryRun: event.target.checked })
              }
            />
          }
          label="먼저 Dry Run으로 후보만 생성"
        />

        <Stack direction="row" spacing={1} sx={WRAP_ROW_SX}>
          {props.availableAllies.map((ally) => {
            const selected = form.candidateAllyIds.includes(ally.id);
            return (
              <Chip
                key={ally.id}
                clickable
                color={selected ? "success" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={() =>
                  setForm({
                    ...form,
                    candidateAllyIds: selected
                      ? form.candidateAllyIds.filter((item) => item !== ally.id)
                      : [...form.candidateAllyIds, ally.id],
                  })
                }
                label={`${ally.id} (${ally.weaponCount})`}
              />
            );
          })}
        </Stack>

        <Box
          sx={{
            ...DARK_PANEL_SX,
            whiteSpace: "pre-wrap",
            overflowX: "auto",
            ...BREAK_TEXT_SX,
          }}
        >
          {commandPreview}
        </Box>

        <Stack direction="row" spacing={1} sx={WRAP_ROW_SX}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => void handleStart()}
            disabled={!ready}
            sx={PRIMARY_BUTTON_SX}
          >
            지휘관 최적화 실행
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() =>
              void refreshJob().catch((error) => {
                setPanelError(
                  error instanceof Error ? error.message : "Refresh failed."
                );
              })
            }
            disabled={!jobId}
          >
            상태 새로고침
          </Button>
          <Button
            variant="outlined"
            startIcon={<StopIcon />}
            onClick={() =>
              void handleCancel().catch((error) => {
                setPanelError(
                  error instanceof Error ? error.message : "Cancel failed."
                );
              })
            }
            disabled={!jobId || job?.status !== "running"}
          >
            중단
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlinedIcon />}
            onClick={() =>
              window.open(
                `/api/rl/commander/jobs/${jobId}/artifact/summary`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            disabled={!jobId || !job?.artifacts.summary}
          >
            Summary
          </Button>
          <Button
            variant="outlined"
            startIcon={<MapIcon />}
            onClick={() =>
              void handleOpenReplay().catch((error) => {
                setPanelError(
                  error instanceof Error ? error.message : "Replay failed."
                );
              })
            }
            disabled={!job?.artifacts.selectedEvalRecording}
          >
            선택 리플레이
          </Button>
        </Stack>

        {jobs.length > 0 && (
          <Stack direction="row" spacing={1} sx={WRAP_ROW_SX}>
            {jobs.slice(0, 5).map((item) => (
              <Chip
                key={item.id}
                clickable
                color={item.id === jobId ? "success" : "default"}
                variant={item.id === jobId ? "filled" : "outlined"}
                label={`${item.id.slice(0, 8)} ${formatStatusLabel(item.status)}`}
                onClick={() => setJobId(item.id)}
              />
            ))}
          </Stack>
        )}

        {job && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={WRAP_ROW_SX}>
              <Chip label={`상태 ${formatStatusLabel(job.status)}`} />
              <Chip
                label={`후보 ${
                  job.summary?.search_space?.candidate_count ??
                  job.progress?.candidate_count ??
                  "-"
                }`}
              />
              <Chip
                label={`완료 ${job.progress?.finished_candidate_count ?? 0}`}
              />
              <Chip
                label={`선정 ${
                  job.summary?.selected_candidate_label ??
                  job.progress?.current_candidate_label ??
                  "-"
                }`}
              />
            </Stack>
            {leaderboard.length > 0 && (
              <TableContainer sx={TABLE_CONTAINER_SX}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Candidate</TableCell>
                      <TableCell align="right">Win</TableCell>
                      <TableCell align="right">Survival</TableCell>
                      <TableCell align="right">Ready</TableCell>
                      <TableCell align="right">Reward</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.slice(0, 5).map((entry) => (
                      <TableRow key={entry.candidate_id}>
                        <TableCell>{entry.rank}</TableCell>
                        <TableCell>{entry.label}</TableCell>
                        <TableCell align="right">
                          {formatPercent(
                            entry.evaluation_summary?.success_rate
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercent(
                            entry.evaluation_summary?.survivability,
                            1
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(
                            entry.evaluation_summary?.time_to_ready,
                            1
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(
                            entry.evaluation_summary?.mean_reward,
                            1
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Typography
              variant="body2"
              sx={{ ...MUTED_TEXT_SX, ...BREAK_TEXT_SX }}
            >
              선택 기준:{" "}
              {job.summary?.selection_metric ??
                "success_rate_then_survivability_then_faster_time_to_ready_then_weapon_efficiency_then_mean_reward_then_shorter_mean_episode_steps"}
            </Typography>
          </Stack>
        )}

        <Box
          sx={{
            ...DARK_PANEL_SX,
            minHeight: 120,
            maxHeight: 240,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            ...BREAK_TEXT_SX,
          }}
        >
          {(job?.stdoutLines ?? []).join("\n") ||
            "지휘관 최적화 로그가 아직 없습니다."}
          {job?.stderrLines?.length
            ? `\n\n[stderr]\n${job.stderrLines.join("\n")}`
            : ""}
        </Box>
      </Stack>
    </Paper>
  );
}
