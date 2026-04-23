import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";

type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

interface FixedTargetStrikeRunRequest {
  scenarioText?: string;
  experimentLabel?: string;
  algorithms?: string[];
  timesteps?: number;
  maxEpisodeSteps?: number;
  evalEpisodes?: number;
  evalSeedCount?: number;
  curriculumEnabled?: boolean;
  guidedLaunchBootstrapSteps?: number;
  seed?: number;
  progressEvalFrequency?: number;
  progressEvalEpisodes?: number;
  controllableSideName?: string;
  targetSideName?: string;
  allyIds?: string[];
  targetIds?: string[];
  highValueTargetIds?: string[];
  rewardConfig?: Record<string, number>;
}

type CommanderPresetKey = "smoke" | "quick" | "standard";
type CommanderHighValueTargetSearchMode = "fixed" | "single" | "pair";

interface CommanderRunRequest extends FixedTargetStrikeRunRequest {
  preset?: CommanderPresetKey;
  candidateLimit?: number;
  retainTopK?: number;
  candidateAllyIds?: string[];
  minAllies?: number;
  maxAllies?: number | null;
  maxResourceCombinations?: number;
  distanceScales?: number[];
  bearingOffsetsDeg?: number[];
  formationSpreadsNm?: number[];
  highValueTargetSearchMode?: CommanderHighValueTargetSearchMode;
  dryRun?: boolean;
}

interface JobArtifacts {
  jobDir: string;
  metadataPath: string;
  scenarioPath: string;
  modelPath: string;
  summaryPath: string;
  progressPath: string;
  evalScenarioPath: string;
  evalRecordingPath: string;
}

interface JobRecord {
  id: string;
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  scenarioName: string | null;
  request: FixedTargetStrikeRunRequest;
  artifacts: JobArtifacts;
  stdoutLines: string[];
  stderrLines: string[];
  exitCode: number | null;
  cancelRequested: boolean;
  process: ChildProcess | null;
}

interface CommanderJobArtifacts {
  jobDir: string;
  metadataPath: string;
  runLabel: string;
  runDir: string;
  scenarioPath: string;
  summaryPath: string;
  progressPath: string;
  selectedScenarioPath: string;
  selectedModelPath: string;
  selectedModelMetadataPath: string;
  selectedEvalScenarioPath: string;
  selectedEvalRecordingPath: string;
}

interface CommanderJobRecord {
  id: string;
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  scenarioName: string | null;
  request: CommanderRunRequest;
  artifacts: CommanderJobArtifacts;
  stdoutLines: string[];
  stderrLines: string[];
  exitCode: number | null;
  cancelRequested: boolean;
  process: ChildProcess | null;
}

const DEFAULT_FORM = {
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
  allyIds: ["blue-striker-1", "blue-striker-2"],
  targetIds: ["red-airbase"],
  highValueTargetIds: ["red-airbase"],
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

const SUPPORTED_ALGORITHMS = ["ppo", "a2c", "sac", "ddpg", "td3"] as const;
const JOBS = new Map<string, JobRecord>();
const COMMANDER_JOBS = new Map<string, CommanderJobRecord>();
const COMMANDER_PRESETS = {
  smoke: {
    label: "스모크 점검",
    description: "후보 생성과 최소 평가 예산만 빠르게 점검합니다.",
    candidateLimit: 6,
    maxResourceCombinations: 3,
    distanceScales: [0.7, 1.0],
    bearingOffsetsDeg: [-30, 0, 30],
    formationSpreadsNm: [0],
  },
  quick: {
    label: "빠른 탐색",
    description: "자산 조합과 배치를 짧게 비교하는 기본 모드입니다.",
    candidateLimit: 12,
    maxResourceCombinations: 4,
    distanceScales: [0.6, 0.85, 1.0],
    bearingOffsetsDeg: [-45, 0, 45],
    formationSpreadsNm: [0, 8],
  },
  standard: {
    label: "표준 탐색",
    description: "더 넓은 자원 조합과 배치 축선을 비교합니다.",
    candidateLimit: 18,
    maxResourceCombinations: 6,
    distanceScales: [0.55, 0.75, 1.0],
    bearingOffsetsDeg: [-60, -20, 0, 20, 60],
    formationSpreadsNm: [0, 6, 12],
  },
} satisfies Record<
  CommanderPresetKey,
  {
    label: string;
    description: string;
    candidateLimit: number;
    maxResourceCombinations: number;
    distanceScales: number[];
    bearingOffsetsDeg: number[];
    formationSpreadsNm: number[];
  }
>;

const moduleDirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDirname, "..", "..");
const gymRoot = path.join(repoRoot, "gym");
const defaultScenarioPath = path.join(
  repoRoot,
  "client",
  "src",
  "scenarios",
  "rl_first_success_demo.json"
);
const trainScriptPath = path.join(
  gymRoot,
  "scripts",
  "fixed_target_strike",
  "train.py"
);
const commanderScriptPath = path.join(
  gymRoot,
  "scripts",
  "fixed_target_strike",
  "commander_optimize.py"
);
const jobsRoot = path.join(repoRoot, ".vista_rl_jobs");
const commanderJobsRoot = path.join(repoRoot, ".vista_rl_commander_jobs");
const runtimeRoot = path.join(gymRoot, ".runtime");
const matplotlibConfigRoot = path.join(runtimeRoot, "mplconfig");
const VWORLD_PROXY_PREFIX = "/api/vworld";
const VWORLD_PROXY_BASE_URL = "https://api.vworld.kr";
const OLLAMA_PROXY_PREFIX = "/api/ollama";
const OLLAMA_PROXY_BASE_URL =
  process.env.OLLAMA_BASE_URL ??
  process.env.VITE_OLLAMA_BASE_URL ??
  "http://127.0.0.1:11434";

function clampPositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function clampFiniteNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

function clampOptionalPositiveInt(
  value: unknown,
  fallback: number | null = null
) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function clampNonNegativeInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function normalizeOptionalLabel(value: unknown) {
  const normalized = `${value ?? ""}`.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  const normalized = value
    .map((item) => `${item}`.trim())
    .filter((item) => item.length > 0);
  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeAlgorithmList(value: unknown, fallback: string[]) {
  const supportedAlgorithmSet = new Set<string>(SUPPORTED_ALGORITHMS);
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  const normalized = Array.from(
    new Set(
      value
        .map((item) => `${item}`.trim().toLowerCase())
        .filter((item) => supportedAlgorithmSet.has(item))
    )
  );
  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeFiniteNumberList(value: unknown, fallback: number[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  const normalized = value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeCommanderPreset(value: unknown): CommanderPresetKey {
  const preset = `${value ?? ""}`.trim().toLowerCase();
  if (preset === "smoke" || preset === "quick" || preset === "standard") {
    return preset;
  }
  return "quick";
}

function normalizeHighValueTargetSearchMode(
  value: unknown
): CommanderHighValueTargetSearchMode {
  const mode = `${value ?? ""}`.trim().toLowerCase();
  if (mode === "single" || mode === "pair") {
    return mode;
  }
  return "fixed";
}

function readTextIfExists(filePath: string) {
  if (!existsSync(filePath)) {
    return null;
  }
  return readFileSync(filePath, "utf-8");
}

function readJsonIfExists(filePath: string) {
  const text = readTextIfExists(filePath);
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractScenarioName(scenarioText: string) {
  try {
    const parsed = JSON.parse(scenarioText) as {
      name?: unknown;
      currentScenario?: { name?: unknown };
    };
    const name =
      `${parsed?.name ?? parsed?.currentScenario?.name ?? ""}`.trim();
    return name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function buildProxyHeaders(req: IncomingMessage) {
  const headers: Record<string, string> = {};
  const acceptedHeaderNames = [
    "accept",
    "accept-language",
    "content-type",
    "origin",
    "referer",
    "user-agent",
  ] as const;

  for (const headerName of acceptedHeaderNames) {
    const headerValue = req.headers[headerName];
    if (typeof headerValue === "string" && headerValue.trim().length > 0) {
      headers[headerName] = headerValue;
    }
  }

  return headers;
}

function buildOllamaProxyHeaders(req: IncomingMessage) {
  const headers: Record<string, string> = {};
  const acceptedHeaderNames = ["accept", "content-type", "user-agent"] as const;

  for (const headerName of acceptedHeaderNames) {
    const headerValue = req.headers[headerName];
    if (typeof headerValue === "string" && headerValue.trim().length > 0) {
      headers[headerName] = headerValue;
    }
  }

  return headers;
}

async function proxyVworldRequest(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  const upstreamPath = url.pathname.slice(VWORLD_PROXY_PREFIX.length);
  if (!upstreamPath.startsWith("/req/")) {
    sendJson(res, 404, { error: "Unsupported VWorld proxy path." });
    return;
  }

  const upstreamUrl = new URL(`${upstreamPath}${url.search}`, VWORLD_PROXY_BASE_URL);
  const method = req.method ?? "GET";

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: buildProxyHeaders(req),
      body:
        method === "GET" || method === "HEAD" ? undefined : await readBody(req),
    });

    res.statusCode = upstreamResponse.status;

    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    const cacheControl = upstreamResponse.headers.get("cache-control");
    if (cacheControl) {
      res.setHeader("Cache-Control", cacheControl);
    }

    const responseBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.end(responseBuffer);
  } catch (error) {
    sendJson(res, 502, {
      error:
        error instanceof Error
          ? error.message
          : "Failed to proxy VWorld request.",
    });
  }
}

async function proxyOllamaRequest(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
) {
  const upstreamPath = url.pathname.slice(OLLAMA_PROXY_PREFIX.length);
  if (upstreamPath !== "/api/tags" && upstreamPath !== "/api/chat") {
    sendJson(res, 404, { error: "Unsupported Ollama proxy path." });
    return;
  }

  const upstreamUrl = new URL(
    `${upstreamPath}${url.search}`,
    OLLAMA_PROXY_BASE_URL
  );
  const method = req.method ?? "GET";

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: buildOllamaProxyHeaders(req),
      body:
        method === "GET" || method === "HEAD" ? undefined : await readBody(req),
    });

    res.statusCode = upstreamResponse.status;

    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    const responseBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.end(responseBuffer);
  } catch (error) {
    sendJson(res, 502, {
      error:
        error instanceof Error
          ? error.message
          : "Failed to proxy Ollama request.",
    });
  }
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function resolvePythonCommand() {
  const windowsVenv = path.join(gymRoot, ".venv", "Scripts", "python.exe");
  const posixVenv = path.join(gymRoot, ".venv", "bin", "python");
  if (existsSync(windowsVenv)) {
    return windowsVenv;
  }
  if (existsSync(posixVenv)) {
    return posixVenv;
  }
  return "python";
}

function getPythonChildEnv() {
  mkdirSync(matplotlibConfigRoot, { recursive: true });
  return {
    ...process.env,
    MPLCONFIGDIR: matplotlibConfigRoot,
  };
}

function toPersistedJob(job: JobRecord) {
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    scenarioName: job.scenarioName,
    request: job.request,
    artifacts: job.artifacts,
    stdoutLines: job.stdoutLines,
    stderrLines: job.stderrLines,
    exitCode: job.exitCode,
    cancelRequested: job.cancelRequested,
  };
}

function toPersistedCommanderJob(job: CommanderJobRecord) {
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    scenarioName: job.scenarioName,
    request: job.request,
    artifacts: job.artifacts,
    stdoutLines: job.stdoutLines,
    stderrLines: job.stderrLines,
    exitCode: job.exitCode,
    cancelRequested: job.cancelRequested,
  };
}

function persistJob(job: JobRecord) {
  mkdirSync(job.artifacts.jobDir, { recursive: true });
  writeFileSync(
    job.artifacts.metadataPath,
    JSON.stringify(toPersistedJob(job), null, 2),
    "utf-8"
  );
}

function persistCommanderJob(job: CommanderJobRecord) {
  mkdirSync(job.artifacts.jobDir, { recursive: true });
  writeFileSync(
    job.artifacts.metadataPath,
    JSON.stringify(toPersistedCommanderJob(job), null, 2),
    "utf-8"
  );
}

function reviveJobRecord(payload: unknown): JobRecord | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const record = payload as Partial<JobRecord>;
  if (
    typeof record.id !== "string" ||
    typeof record.status !== "string" ||
    typeof record.createdAt !== "string" ||
    !record.request ||
    !record.artifacts
  ) {
    return null;
  }
  return {
    id: record.id,
    status: record.status as JobStatus,
    createdAt: record.createdAt,
    startedAt: typeof record.startedAt === "string" ? record.startedAt : null,
    finishedAt:
      typeof record.finishedAt === "string" ? record.finishedAt : null,
    scenarioName:
      typeof record.scenarioName === "string" ? record.scenarioName : null,
    request: record.request as FixedTargetStrikeRunRequest,
    artifacts: record.artifacts as JobArtifacts,
    stdoutLines: Array.isArray(record.stdoutLines)
      ? record.stdoutLines.map((line) => `${line}`)
      : [],
    stderrLines: Array.isArray(record.stderrLines)
      ? record.stderrLines.map((line) => `${line}`)
      : [],
    exitCode: typeof record.exitCode === "number" ? record.exitCode : null,
    cancelRequested: Boolean(record.cancelRequested),
    process: null,
  };
}

function reviveCommanderJobRecord(payload: unknown): CommanderJobRecord | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const record = payload as Partial<CommanderJobRecord>;
  if (
    typeof record.id !== "string" ||
    typeof record.status !== "string" ||
    typeof record.createdAt !== "string" ||
    !record.request ||
    !record.artifacts
  ) {
    return null;
  }
  return {
    id: record.id,
    status: record.status as JobStatus,
    createdAt: record.createdAt,
    startedAt: typeof record.startedAt === "string" ? record.startedAt : null,
    finishedAt:
      typeof record.finishedAt === "string" ? record.finishedAt : null,
    scenarioName:
      typeof record.scenarioName === "string" ? record.scenarioName : null,
    request: record.request as CommanderRunRequest,
    artifacts: record.artifacts as CommanderJobArtifacts,
    stdoutLines: Array.isArray(record.stdoutLines)
      ? record.stdoutLines.map((line) => `${line}`)
      : [],
    stderrLines: Array.isArray(record.stderrLines)
      ? record.stderrLines.map((line) => `${line}`)
      : [],
    exitCode: typeof record.exitCode === "number" ? record.exitCode : null,
    cancelRequested: Boolean(record.cancelRequested),
    process: null,
  };
}

function readPersistedJobs() {
  if (!existsSync(jobsRoot)) {
    return [];
  }
  return readdirSync(jobsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const jobDir = path.join(jobsRoot, entry.name);
      const metadataPath = path.join(jobDir, "job.json");
      const job = reviveJobRecord(readJsonIfExists(metadataPath));
      if (!job) {
        return null;
      }
      job.artifacts.jobDir = job.artifacts.jobDir ?? jobDir;
      job.artifacts.metadataPath = job.artifacts.metadataPath ?? metadataPath;
      return job;
    })
    .filter((job): job is JobRecord => job !== null);
}

function readPersistedCommanderJobs() {
  if (!existsSync(commanderJobsRoot)) {
    return [];
  }
  return readdirSync(commanderJobsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const jobDir = path.join(commanderJobsRoot, entry.name);
      const metadataPath = path.join(jobDir, "job.json");
      const job = reviveCommanderJobRecord(readJsonIfExists(metadataPath));
      if (!job) {
        return null;
      }
      job.artifacts.jobDir = job.artifacts.jobDir ?? jobDir;
      job.artifacts.metadataPath = job.artifacts.metadataPath ?? metadataPath;
      return job;
    })
    .filter((job): job is CommanderJobRecord => job !== null);
}

function getAllJobs() {
  const jobs = new Map<string, JobRecord>();
  for (const job of readPersistedJobs()) {
    jobs.set(job.id, job);
  }
  for (const [jobId, job] of JOBS.entries()) {
    jobs.set(jobId, job);
  }
  return Array.from(jobs.values());
}

function getAllCommanderJobs() {
  const jobs = new Map<string, CommanderJobRecord>();
  for (const job of readPersistedCommanderJobs()) {
    jobs.set(job.id, job);
  }
  for (const [jobId, job] of COMMANDER_JOBS.entries()) {
    jobs.set(jobId, job);
  }
  return Array.from(jobs.values());
}

function getJobById(jobId: string) {
  return (
    JOBS.get(jobId) ?? getAllJobs().find((job) => job.id === jobId) ?? null
  );
}

function getCommanderJobById(jobId: string) {
  return (
    COMMANDER_JOBS.get(jobId) ??
    getAllCommanderJobs().find((job) => job.id === jobId) ??
    null
  );
}

function toSnapshot(job: JobRecord) {
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    scenarioName: job.scenarioName,
    displayLabel: job.request.experimentLabel ?? job.scenarioName ?? null,
    exitCode: job.exitCode,
    cancelRequested: job.cancelRequested,
    request: job.request,
    stdoutLines: job.stdoutLines.slice(-200),
    stderrLines: job.stderrLines.slice(-200),
    progress: readJsonIfExists(job.artifacts.progressPath),
    summary: readJsonIfExists(job.artifacts.summaryPath),
    artifacts: {
      scenario: existsSync(job.artifacts.scenarioPath),
      model: existsSync(`${job.artifacts.modelPath}.zip`),
      summary: existsSync(job.artifacts.summaryPath),
      progress: existsSync(job.artifacts.progressPath),
      evalScenario: existsSync(job.artifacts.evalScenarioPath),
      evalRecording: existsSync(job.artifacts.evalRecordingPath),
    },
  };
}

function toCommanderSnapshot(job: CommanderJobRecord) {
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    scenarioName: job.scenarioName,
    displayLabel: job.request.experimentLabel ?? job.scenarioName ?? null,
    exitCode: job.exitCode,
    cancelRequested: job.cancelRequested,
    request: job.request,
    stdoutLines: job.stdoutLines.slice(-200),
    stderrLines: job.stderrLines.slice(-200),
    progress: readJsonIfExists(job.artifacts.progressPath),
    summary: readJsonIfExists(job.artifacts.summaryPath),
    artifacts: {
      scenario: existsSync(job.artifacts.scenarioPath),
      summary: existsSync(job.artifacts.summaryPath),
      progress: existsSync(job.artifacts.progressPath),
      selectedScenario: existsSync(job.artifacts.selectedScenarioPath),
      selectedModel: existsSync(job.artifacts.selectedModelPath),
      selectedModelMetadata: existsSync(
        job.artifacts.selectedModelMetadataPath
      ),
      selectedEvalScenario: existsSync(job.artifacts.selectedEvalScenarioPath),
      selectedEvalRecording: existsSync(
        job.artifacts.selectedEvalRecordingPath
      ),
    },
  };
}

function appendOutput(target: string[], chunk: Buffer | string) {
  const lines = `${chunk}`
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
  target.push(...lines);
  if (target.length > 1000) {
    target.splice(0, target.length - 1000);
  }
}

function resolveCheckpointArtifactPath(
  job: JobRecord,
  algorithm: string,
  timesteps: number,
  artifactKey: "recording_path" | "export_path"
) {
  const progress = readJsonIfExists(job.artifacts.progressPath) as {
    algorithm_runs?: Record<
      string,
      { checkpoints?: Array<Record<string, unknown>> | null } | null
    >;
  } | null;
  const checkpoints = progress?.algorithm_runs?.[algorithm]?.checkpoints;
  if (!Array.isArray(checkpoints)) {
    return null;
  }

  for (const item of checkpoints) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const checkpointAlgorithm = `${item["algorithm"] ?? algorithm}`
      .trim()
      .toLowerCase();
    if (checkpointAlgorithm !== algorithm) {
      continue;
    }
    if (Number(item["timesteps"]) !== timesteps) {
      continue;
    }
    const artifactPath = item[artifactKey];
    if (typeof artifactPath !== "string" || artifactPath.trim().length === 0) {
      return null;
    }

    const resolvedArtifactPath = path.resolve(artifactPath);
    const resolvedJobRoot = path.resolve(path.dirname(job.artifacts.modelPath));
    const relativeArtifactPath = path.relative(
      resolvedJobRoot,
      resolvedArtifactPath
    );
    if (
      relativeArtifactPath.startsWith("..") ||
      path.isAbsolute(relativeArtifactPath)
    ) {
      return null;
    }
    return resolvedArtifactPath;
  }

  return null;
}

function normalizeTrainingRequest(request: FixedTargetStrikeRunRequest) {
  return {
    experimentLabel: normalizeOptionalLabel(request.experimentLabel),
    algorithms: normalizeAlgorithmList(
      request.algorithms,
      DEFAULT_FORM.algorithms
    ),
    timesteps: clampPositiveInt(request.timesteps, DEFAULT_FORM.timesteps),
    maxEpisodeSteps: clampPositiveInt(
      request.maxEpisodeSteps,
      DEFAULT_FORM.maxEpisodeSteps
    ),
    evalEpisodes: clampPositiveInt(
      request.evalEpisodes,
      DEFAULT_FORM.evalEpisodes
    ),
    evalSeedCount: clampPositiveInt(
      request.evalSeedCount,
      DEFAULT_FORM.evalSeedCount
    ),
    curriculumEnabled: Boolean(
      request.curriculumEnabled ?? DEFAULT_FORM.curriculumEnabled
    ),
    guidedLaunchBootstrapSteps: clampNonNegativeInt(
      request.guidedLaunchBootstrapSteps,
      DEFAULT_FORM.guidedLaunchBootstrapSteps
    ),
    seed: clampPositiveInt(request.seed, DEFAULT_FORM.seed),
    progressEvalFrequency: clampPositiveInt(
      request.progressEvalFrequency,
      DEFAULT_FORM.progressEvalFrequency
    ),
    progressEvalEpisodes: clampPositiveInt(
      request.progressEvalEpisodes,
      DEFAULT_FORM.progressEvalEpisodes
    ),
    controllableSideName:
      `${request.controllableSideName ?? DEFAULT_FORM.controllableSideName}`.trim() ||
      DEFAULT_FORM.controllableSideName,
    targetSideName:
      `${request.targetSideName ?? DEFAULT_FORM.targetSideName}`.trim() ||
      DEFAULT_FORM.targetSideName,
    allyIds: normalizeStringList(request.allyIds, DEFAULT_FORM.allyIds),
    targetIds: normalizeStringList(request.targetIds, DEFAULT_FORM.targetIds),
    highValueTargetIds: normalizeStringList(
      request.highValueTargetIds,
      DEFAULT_FORM.highValueTargetIds
    ),
    rewardConfig: {
      killBase: clampFiniteNumber(
        request.rewardConfig?.killBase,
        DEFAULT_FORM.rewardConfig.killBase
      ),
      highValueTargetBonus: clampFiniteNumber(
        request.rewardConfig?.highValueTargetBonus,
        DEFAULT_FORM.rewardConfig.highValueTargetBonus
      ),
      totWeight: clampFiniteNumber(
        request.rewardConfig?.totWeight,
        DEFAULT_FORM.rewardConfig.totWeight
      ),
      totTauSeconds: clampFiniteNumber(
        request.rewardConfig?.totTauSeconds,
        DEFAULT_FORM.rewardConfig.totTauSeconds
      ),
      etaProgressWeight: clampFiniteNumber(
        request.rewardConfig?.etaProgressWeight,
        DEFAULT_FORM.rewardConfig.etaProgressWeight
      ),
      readyToFireBonus: clampFiniteNumber(
        request.rewardConfig?.readyToFireBonus,
        DEFAULT_FORM.rewardConfig.readyToFireBonus
      ),
      stagnationPenaltyPerAssignment: clampFiniteNumber(
        request.rewardConfig?.stagnationPenaltyPerAssignment,
        DEFAULT_FORM.rewardConfig.stagnationPenaltyPerAssignment
      ),
      targetSwitchPenalty: clampFiniteNumber(
        request.rewardConfig?.targetSwitchPenalty,
        DEFAULT_FORM.rewardConfig.targetSwitchPenalty
      ),
      threatStepPenalty: clampFiniteNumber(
        request.rewardConfig?.threatStepPenalty,
        DEFAULT_FORM.rewardConfig.threatStepPenalty
      ),
      launchCostPerWeapon: clampFiniteNumber(
        request.rewardConfig?.launchCostPerWeapon,
        DEFAULT_FORM.rewardConfig.launchCostPerWeapon
      ),
      timeCostPerStep: clampFiniteNumber(
        request.rewardConfig?.timeCostPerStep,
        DEFAULT_FORM.rewardConfig.timeCostPerStep
      ),
      lossPenaltyPerAlly: clampFiniteNumber(
        request.rewardConfig?.lossPenaltyPerAlly,
        DEFAULT_FORM.rewardConfig.lossPenaltyPerAlly
      ),
      successBonus: clampFiniteNumber(
        request.rewardConfig?.successBonus,
        DEFAULT_FORM.rewardConfig.successBonus
      ),
      failurePenalty: clampFiniteNumber(
        request.rewardConfig?.failurePenalty,
        DEFAULT_FORM.rewardConfig.failurePenalty
      ),
    },
  };
}

function createTrainArgs(
  request: FixedTargetStrikeRunRequest,
  artifacts: JobArtifacts
) {
  const normalizedRequest = normalizeTrainingRequest(request);

  const args = [
    "-u",
    trainScriptPath,
    "--timesteps",
    `${normalizedRequest.timesteps}`,
    "--max-episode-steps",
    `${normalizedRequest.maxEpisodeSteps}`,
    "--eval-episodes",
    `${normalizedRequest.evalEpisodes}`,
    "--eval-seed-count",
    `${normalizedRequest.evalSeedCount}`,
    "--seed",
    `${normalizedRequest.seed}`,
    "--guided-launch-bootstrap-steps",
    `${normalizedRequest.guidedLaunchBootstrapSteps}`,
    "--progress-eval-frequency",
    `${normalizedRequest.progressEvalFrequency}`,
    "--progress-eval-episodes",
    `${normalizedRequest.progressEvalEpisodes}`,
    ...(normalizedRequest.curriculumEnabled ? ["--curriculum-enabled"] : []),
    "--scenario-path",
    artifacts.scenarioPath,
    "--algorithms",
    ...normalizedRequest.algorithms,
    "--model-path",
    artifacts.modelPath,
    "--export-path",
    artifacts.evalScenarioPath,
    "--summary-path",
    artifacts.summaryPath,
    "--progress-path",
    artifacts.progressPath,
    "--eval-recording-path",
    artifacts.evalRecordingPath,
    "--controllable-side-name",
    normalizedRequest.controllableSideName,
    "--target-side-name",
    normalizedRequest.targetSideName,
    "--ally-ids",
    ...normalizedRequest.allyIds,
    "--target-ids",
    ...normalizedRequest.targetIds,
    "--high-value-target-ids",
    ...normalizedRequest.highValueTargetIds,
    "--kill-base",
    `${normalizedRequest.rewardConfig.killBase}`,
    "--high-value-target-bonus",
    `${normalizedRequest.rewardConfig.highValueTargetBonus}`,
    "--tot-weight",
    `${normalizedRequest.rewardConfig.totWeight}`,
    "--tot-tau-seconds",
    `${normalizedRequest.rewardConfig.totTauSeconds}`,
    "--eta-progress-weight",
    `${normalizedRequest.rewardConfig.etaProgressWeight}`,
    "--ready-to-fire-bonus",
    `${normalizedRequest.rewardConfig.readyToFireBonus}`,
    "--stagnation-penalty-per-assignment",
    `${normalizedRequest.rewardConfig.stagnationPenaltyPerAssignment}`,
    "--target-switch-penalty",
    `${normalizedRequest.rewardConfig.targetSwitchPenalty}`,
    "--threat-step-penalty",
    `${normalizedRequest.rewardConfig.threatStepPenalty}`,
    "--launch-cost-per-weapon",
    `${normalizedRequest.rewardConfig.launchCostPerWeapon}`,
    "--time-cost-per-step",
    `${normalizedRequest.rewardConfig.timeCostPerStep}`,
    "--loss-penalty-per-ally",
    `${normalizedRequest.rewardConfig.lossPenaltyPerAlly}`,
    "--success-bonus",
    `${normalizedRequest.rewardConfig.successBonus}`,
    "--failure-penalty",
    `${normalizedRequest.rewardConfig.failurePenalty}`,
  ];

  return { args, normalizedRequest };
}

function createJob(request: FixedTargetStrikeRunRequest) {
  mkdirSync(jobsRoot, { recursive: true });
  const jobId = randomUUID();
  const jobDir = path.join(jobsRoot, jobId);
  mkdirSync(jobDir, { recursive: true });

  const metadataPath = path.join(jobDir, "job.json");
  const scenarioPath = path.join(jobDir, "scenario.json");
  const summaryPath = path.join(jobDir, "summary.json");
  const progressPath = path.join(jobDir, "progress.json");
  const modelPath = path.join(jobDir, "fixed_target_strike_policy");
  const evalScenarioPath = path.join(jobDir, "eval_scenario.json");
  const evalRecordingPath = path.join(jobDir, "eval_recording.jsonl");
  const scenarioText =
    request.scenarioText && request.scenarioText.trim().length > 0
      ? request.scenarioText
      : (readTextIfExists(defaultScenarioPath) ?? "");

  if (!scenarioText.trim()) {
    throw new Error("No scenario text was provided for the RL job.");
  }

  writeFileSync(scenarioPath, scenarioText, "utf-8");
  const scenarioName = extractScenarioName(scenarioText);

  const artifacts: JobArtifacts = {
    jobDir,
    metadataPath,
    scenarioPath,
    modelPath,
    summaryPath,
    progressPath,
    evalScenarioPath,
    evalRecordingPath,
  };
  const { args, normalizedRequest } = createTrainArgs(request, artifacts);
  const command = resolvePythonCommand();
  const child = spawn(command, args, {
    cwd: gymRoot,
    env: getPythonChildEnv(),
    stdio: ["ignore", "pipe", "pipe"],
  });

  const job: JobRecord = {
    id: jobId,
    status: "running",
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    scenarioName,
    request: normalizedRequest,
    artifacts,
    stdoutLines: [],
    stderrLines: [],
    exitCode: null,
    cancelRequested: false,
    process: child,
  };

  child.stdout.on("data", (chunk) => {
    appendOutput(job.stdoutLines, chunk);
    persistJob(job);
  });
  child.stderr.on("data", (chunk) => {
    appendOutput(job.stderrLines, chunk);
    persistJob(job);
  });
  child.on("close", (code) => {
    job.exitCode = code;
    job.finishedAt = new Date().toISOString();
    if (job.cancelRequested) {
      job.status = "cancelled";
      persistJob(job);
      return;
    }
    job.status = code === 0 ? "completed" : "failed";
    persistJob(job);
  });
  child.on("error", (error) => {
    job.finishedAt = new Date().toISOString();
    job.status = "failed";
    job.stderrLines.push(error.message);
    persistJob(job);
  });

  JOBS.set(jobId, job);
  persistJob(job);
  return job;
}

function createCommanderArgs(
  request: CommanderRunRequest,
  artifacts: CommanderJobArtifacts
) {
  const normalizedTrainingRequest = normalizeTrainingRequest(request);
  const preset = normalizeCommanderPreset(request.preset);
  const presetDefaults = COMMANDER_PRESETS[preset];
  const normalizedRequest = {
    ...normalizedTrainingRequest,
    preset,
    candidateLimit: clampPositiveInt(
      request.candidateLimit,
      presetDefaults.candidateLimit
    ),
    retainTopK: clampPositiveInt(request.retainTopK, 3),
    candidateAllyIds: normalizeStringList(
      request.candidateAllyIds,
      normalizedTrainingRequest.allyIds
    ),
    minAllies: clampPositiveInt(request.minAllies, 1),
    maxAllies: clampOptionalPositiveInt(request.maxAllies, null),
    maxResourceCombinations: clampPositiveInt(
      request.maxResourceCombinations,
      presetDefaults.maxResourceCombinations
    ),
    distanceScales: normalizeFiniteNumberList(
      request.distanceScales,
      presetDefaults.distanceScales
    ),
    bearingOffsetsDeg: normalizeFiniteNumberList(
      request.bearingOffsetsDeg,
      presetDefaults.bearingOffsetsDeg
    ),
    formationSpreadsNm: normalizeFiniteNumberList(
      request.formationSpreadsNm,
      presetDefaults.formationSpreadsNm
    ),
    highValueTargetSearchMode: normalizeHighValueTargetSearchMode(
      request.highValueTargetSearchMode
    ),
    dryRun: Boolean(request.dryRun),
  };

  const args = [
    "-u",
    commanderScriptPath,
    "--preset",
    normalizedRequest.preset,
    "--run-label",
    artifacts.runLabel,
    "--output-root",
    artifacts.jobDir,
    "--summary-name",
    path.basename(artifacts.summaryPath),
    "--commander-progress-path",
    artifacts.progressPath,
    "--candidate-limit",
    `${normalizedRequest.candidateLimit}`,
    "--retain-top-k",
    `${normalizedRequest.retainTopK}`,
    "--candidate-ally-ids",
    ...normalizedRequest.candidateAllyIds,
    "--min-allies",
    `${normalizedRequest.minAllies}`,
    ...(normalizedRequest.maxAllies
      ? ["--max-allies", `${normalizedRequest.maxAllies}`]
      : []),
    "--max-resource-combinations",
    `${normalizedRequest.maxResourceCombinations}`,
    "--distance-scales",
    ...normalizedRequest.distanceScales.map((value) => `${value}`),
    "--bearing-offsets-deg",
    ...normalizedRequest.bearingOffsetsDeg.map((value) => `${value}`),
    "--formation-spreads-nm",
    ...normalizedRequest.formationSpreadsNm.map((value) => `${value}`),
    "--high-value-target-search-mode",
    normalizedRequest.highValueTargetSearchMode,
    ...(normalizedRequest.dryRun ? ["--dry-run"] : []),
    "--scenario-path",
    artifacts.scenarioPath,
    "--algorithms",
    ...normalizedRequest.algorithms,
    "--timesteps",
    `${normalizedRequest.timesteps}`,
    "--max-episode-steps",
    `${normalizedRequest.maxEpisodeSteps}`,
    "--eval-episodes",
    `${normalizedRequest.evalEpisodes}`,
    "--eval-seed-count",
    `${normalizedRequest.evalSeedCount}`,
    ...(normalizedRequest.curriculumEnabled ? ["--curriculum-enabled"] : []),
    "--guided-launch-bootstrap-steps",
    `${normalizedRequest.guidedLaunchBootstrapSteps}`,
    "--seed",
    `${normalizedRequest.seed}`,
    "--progress-eval-frequency",
    `${normalizedRequest.progressEvalFrequency}`,
    "--progress-eval-episodes",
    `${normalizedRequest.progressEvalEpisodes}`,
    "--controllable-side-name",
    normalizedRequest.controllableSideName,
    "--target-side-name",
    normalizedRequest.targetSideName,
    "--ally-ids",
    ...normalizedRequest.allyIds,
    "--target-ids",
    ...normalizedRequest.targetIds,
    "--high-value-target-ids",
    ...normalizedRequest.highValueTargetIds,
    "--kill-base",
    `${normalizedRequest.rewardConfig.killBase}`,
    "--high-value-target-bonus",
    `${normalizedRequest.rewardConfig.highValueTargetBonus}`,
    "--tot-weight",
    `${normalizedRequest.rewardConfig.totWeight}`,
    "--tot-tau-seconds",
    `${normalizedRequest.rewardConfig.totTauSeconds}`,
    "--eta-progress-weight",
    `${normalizedRequest.rewardConfig.etaProgressWeight}`,
    "--ready-to-fire-bonus",
    `${normalizedRequest.rewardConfig.readyToFireBonus}`,
    "--stagnation-penalty-per-assignment",
    `${normalizedRequest.rewardConfig.stagnationPenaltyPerAssignment}`,
    "--target-switch-penalty",
    `${normalizedRequest.rewardConfig.targetSwitchPenalty}`,
    "--threat-step-penalty",
    `${normalizedRequest.rewardConfig.threatStepPenalty}`,
    "--launch-cost-per-weapon",
    `${normalizedRequest.rewardConfig.launchCostPerWeapon}`,
    "--time-cost-per-step",
    `${normalizedRequest.rewardConfig.timeCostPerStep}`,
    "--loss-penalty-per-ally",
    `${normalizedRequest.rewardConfig.lossPenaltyPerAlly}`,
    "--success-bonus",
    `${normalizedRequest.rewardConfig.successBonus}`,
    "--failure-penalty",
    `${normalizedRequest.rewardConfig.failurePenalty}`,
  ];

  return { args, normalizedRequest };
}

function createCommanderJob(request: CommanderRunRequest) {
  mkdirSync(commanderJobsRoot, { recursive: true });
  const jobId = randomUUID();
  const jobDir = path.join(commanderJobsRoot, jobId);
  const runLabel = "commander-run";
  const runDir = path.join(jobDir, runLabel);
  mkdirSync(jobDir, { recursive: true });

  const metadataPath = path.join(jobDir, "job.json");
  const scenarioPath = path.join(jobDir, "scenario.json");
  const summaryPath = path.join(runDir, "commander_summary.json");
  const progressPath = path.join(runDir, "commander_progress.json");
  const selectedScenarioPath = path.join(
    runDir,
    "selected_candidate_scenario.json"
  );
  const selectedModelPath = path.join(runDir, "selected_candidate_model.zip");
  const selectedModelMetadataPath = path.join(
    runDir,
    "selected_candidate_model.metadata.json"
  );
  const selectedEvalScenarioPath = path.join(
    runDir,
    "selected_candidate_eval_scenario.json"
  );
  const selectedEvalRecordingPath = path.join(
    runDir,
    "selected_candidate_eval_recording.jsonl"
  );
  const scenarioText =
    request.scenarioText && request.scenarioText.trim().length > 0
      ? request.scenarioText
      : (readTextIfExists(defaultScenarioPath) ?? "");

  if (!scenarioText.trim()) {
    throw new Error("No scenario text was provided for the commander job.");
  }

  writeFileSync(scenarioPath, scenarioText, "utf-8");
  const scenarioName = extractScenarioName(scenarioText);

  const artifacts: CommanderJobArtifacts = {
    jobDir,
    metadataPath,
    runLabel,
    runDir,
    scenarioPath,
    summaryPath,
    progressPath,
    selectedScenarioPath,
    selectedModelPath,
    selectedModelMetadataPath,
    selectedEvalScenarioPath,
    selectedEvalRecordingPath,
  };
  const { args, normalizedRequest } = createCommanderArgs(request, artifacts);
  const command = resolvePythonCommand();
  const child = spawn(command, args, {
    cwd: gymRoot,
    env: getPythonChildEnv(),
    stdio: ["ignore", "pipe", "pipe"],
  });

  const job: CommanderJobRecord = {
    id: jobId,
    status: "running",
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    scenarioName,
    request: normalizedRequest,
    artifacts,
    stdoutLines: [],
    stderrLines: [],
    exitCode: null,
    cancelRequested: false,
    process: child,
  };

  child.stdout.on("data", (chunk) => {
    appendOutput(job.stdoutLines, chunk);
    persistCommanderJob(job);
  });
  child.stderr.on("data", (chunk) => {
    appendOutput(job.stderrLines, chunk);
    persistCommanderJob(job);
  });
  child.on("close", (code) => {
    job.exitCode = code;
    job.finishedAt = new Date().toISOString();
    if (job.cancelRequested) {
      job.status = "cancelled";
      persistCommanderJob(job);
      return;
    }
    job.status = code === 0 ? "completed" : "failed";
    persistCommanderJob(job);
  });
  child.on("error", (error) => {
    job.finishedAt = new Date().toISOString();
    job.status = "failed";
    job.stderrLines.push(error.message);
    persistCommanderJob(job);
  });

  COMMANDER_JOBS.set(jobId, job);
  persistCommanderJob(job);
  return job;
}

function buildCapabilities() {
  const pythonCommand = resolvePythonCommand();
  return {
    available: existsSync(trainScriptPath) && existsSync(defaultScenarioPath),
    mode: "vite-local",
    pythonCommand,
    gymRoot,
    supportedAlgorithms: [...SUPPORTED_ALGORITHMS],
    defaultScenarioText: readTextIfExists(defaultScenarioPath) ?? "",
    defaultForm: DEFAULT_FORM,
  };
}

function buildCommanderCapabilities() {
  const pythonCommand = resolvePythonCommand();
  const defaultPreset = COMMANDER_PRESETS.quick;
  return {
    available:
      existsSync(commanderScriptPath) && existsSync(defaultScenarioPath),
    mode: "vite-local",
    pythonCommand,
    gymRoot,
    commanderScriptPath,
    presets: (
      Object.entries(COMMANDER_PRESETS) as Array<
        [
          CommanderPresetKey,
          {
            label: string;
            description: string;
            candidateLimit: number;
            maxResourceCombinations: number;
            distanceScales: number[];
            bearingOffsetsDeg: number[];
            formationSpreadsNm: number[];
          },
        ]
      >
    ).map(([key, preset]) => ({
      key,
      label: preset.label,
      description: preset.description,
      candidateLimit: preset.candidateLimit,
      maxResourceCombinations: preset.maxResourceCombinations,
      distanceScales: preset.distanceScales,
      bearingOffsetsDeg: preset.bearingOffsetsDeg,
      formationSpreadsNm: preset.formationSpreadsNm,
    })),
    defaultForm: {
      preset: "quick",
      candidateLimit: defaultPreset.candidateLimit,
      retainTopK: 3,
      minAllies: 1,
      maxAllies: null,
      maxResourceCombinations: defaultPreset.maxResourceCombinations,
      distanceScales: defaultPreset.distanceScales,
      bearingOffsetsDeg: defaultPreset.bearingOffsetsDeg,
      formationSpreadsNm: defaultPreset.formationSpreadsNm,
      highValueTargetSearchMode: "fixed",
      dryRun: true,
    },
  };
}

function createMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url) {
      next();
      return;
    }

    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    if (pathname.startsWith(`${VWORLD_PROXY_PREFIX}/`)) {
      await proxyVworldRequest(req, res, url);
      return;
    }

    if (pathname.startsWith(`${OLLAMA_PROXY_PREFIX}/`)) {
      await proxyOllamaRequest(req, res, url);
      return;
    }

    if (
      req.method === "GET" &&
      pathname === "/api/rl/fixed-target-strike/capabilities"
    ) {
      sendJson(res, 200, buildCapabilities());
      return;
    }

    if (req.method === "GET" && pathname === "/api/rl/commander/capabilities") {
      sendJson(res, 200, buildCommanderCapabilities());
      return;
    }

    if (req.method === "GET" && pathname === "/api/rl/jobs") {
      sendJson(
        res,
        200,
        getAllJobs()
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map((job) => toSnapshot(job))
      );
      return;
    }

    if (req.method === "GET" && pathname === "/api/rl/commander/jobs") {
      sendJson(
        res,
        200,
        getAllCommanderJobs()
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map((job) => toCommanderSnapshot(job))
      );
      return;
    }

    if (
      req.method === "POST" &&
      pathname === "/api/rl/fixed-target-strike/train"
    ) {
      try {
        const bodyText = await readBody(req);
        const body = bodyText
          ? (JSON.parse(bodyText) as FixedTargetStrikeRunRequest)
          : {};
        const job = createJob(body);
        sendJson(res, 201, { jobId: job.id, status: job.status });
      } catch (error) {
        sendJson(res, 400, {
          error:
            error instanceof Error ? error.message : "Failed to start RL job.",
        });
      }
      return;
    }

    if (req.method === "POST" && pathname === "/api/rl/commander/run") {
      try {
        const bodyText = await readBody(req);
        const body = bodyText
          ? (JSON.parse(bodyText) as CommanderRunRequest)
          : {};
        const job = createCommanderJob(body);
        sendJson(res, 201, { jobId: job.id, status: job.status });
      } catch (error) {
        sendJson(res, 400, {
          error:
            error instanceof Error
              ? error.message
              : "Failed to start commander optimization job.",
        });
      }
      return;
    }

    const jobMatch = pathname.match(/^\/api\/rl\/jobs\/([^/]+)$/);
    if (req.method === "GET" && jobMatch) {
      const job = getJobById(jobMatch[1]);
      if (!job) {
        sendJson(res, 404, { error: "RL job not found." });
        return;
      }
      sendJson(res, 200, toSnapshot(job));
      return;
    }

    const commanderJobMatch = pathname.match(
      /^\/api\/rl\/commander\/jobs\/([^/]+)$/
    );
    if (req.method === "GET" && commanderJobMatch) {
      const job = getCommanderJobById(commanderJobMatch[1]);
      if (!job) {
        sendJson(res, 404, { error: "Commander job not found." });
        return;
      }
      sendJson(res, 200, toCommanderSnapshot(job));
      return;
    }

    if (req.method === "DELETE" && jobMatch) {
      const job = getJobById(jobMatch[1]);
      if (!job) {
        sendJson(res, 404, { error: "RL job not found." });
        return;
      }
      if (job.process && job.status === "running") {
        job.cancelRequested = true;
        job.process.kill();
      }
      job.finishedAt = new Date().toISOString();
      job.status = "cancelled";
      persistJob(job);
      sendJson(res, 200, toSnapshot(job));
      return;
    }

    if (req.method === "DELETE" && commanderJobMatch) {
      const job = getCommanderJobById(commanderJobMatch[1]);
      if (!job) {
        sendJson(res, 404, { error: "Commander job not found." });
        return;
      }
      if (job.process && job.status === "running") {
        job.cancelRequested = true;
        job.process.kill();
      }
      job.finishedAt = new Date().toISOString();
      job.status = "cancelled";
      persistCommanderJob(job);
      sendJson(res, 200, toCommanderSnapshot(job));
      return;
    }

    const checkpointRecordingMatch = pathname.match(
      /^\/api\/rl\/jobs\/([^/]+)\/checkpoint-recording$/
    );
    if (req.method === "GET" && checkpointRecordingMatch) {
      const [, jobId] = checkpointRecordingMatch;
      const job = getJobById(jobId);
      if (!job) {
        sendJson(res, 404, { error: "RL job not found." });
        return;
      }

      const algorithm = `${url.searchParams.get("algorithm") ?? ""}`
        .trim()
        .toLowerCase();
      const timesteps = Number(url.searchParams.get("timesteps") ?? "");
      if (!algorithm || !Number.isFinite(timesteps)) {
        sendJson(res, 400, {
          error: "algorithm and timesteps query parameters are required.",
        });
        return;
      }

      const recordingPath = resolveCheckpointArtifactPath(
        job,
        algorithm,
        Math.floor(timesteps),
        "recording_path"
      );
      if (!recordingPath || !existsSync(recordingPath)) {
        sendJson(res, 404, { error: "Checkpoint replay not found." });
        return;
      }

      const content = readFileSync(recordingPath);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(content);
      return;
    }

    const checkpointScenarioMatch = pathname.match(
      /^\/api\/rl\/jobs\/([^/]+)\/checkpoint-scenario$/
    );
    if (req.method === "GET" && checkpointScenarioMatch) {
      const [, jobId] = checkpointScenarioMatch;
      const job = getJobById(jobId);
      if (!job) {
        sendJson(res, 404, { error: "RL job not found." });
        return;
      }

      const algorithm = `${url.searchParams.get("algorithm") ?? ""}`
        .trim()
        .toLowerCase();
      const timesteps = Number(url.searchParams.get("timesteps") ?? "");
      if (!algorithm || !Number.isFinite(timesteps)) {
        sendJson(res, 400, {
          error: "algorithm and timesteps query parameters are required.",
        });
        return;
      }

      const scenarioPath = resolveCheckpointArtifactPath(
        job,
        algorithm,
        Math.floor(timesteps),
        "export_path"
      );
      if (!scenarioPath || !existsSync(scenarioPath)) {
        sendJson(res, 404, { error: "Checkpoint scenario not found." });
        return;
      }

      const content = readFileSync(scenarioPath);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(content);
      return;
    }

    const artifactMatch = pathname.match(
      /^\/api\/rl\/jobs\/([^/]+)\/artifact\/([^/]+)$/
    );
    if (req.method === "GET" && artifactMatch) {
      const [, jobId, artifactName] = artifactMatch;
      const job = getJobById(jobId);
      if (!job) {
        sendJson(res, 404, { error: "RL job not found." });
        return;
      }

      const artifactPathMap: Record<
        string,
        { path: string; contentType: string }
      > = {
        scenario: {
          path: job.artifacts.scenarioPath,
          contentType: "application/json; charset=utf-8",
        },
        summary: {
          path: job.artifacts.summaryPath,
          contentType: "application/json; charset=utf-8",
        },
        progress: {
          path: job.artifacts.progressPath,
          contentType: "application/json; charset=utf-8",
        },
        evalScenario: {
          path: job.artifacts.evalScenarioPath,
          contentType: "application/json; charset=utf-8",
        },
        evalRecording: {
          path: job.artifacts.evalRecordingPath,
          contentType: "text/plain; charset=utf-8",
        },
        model: {
          path: `${job.artifacts.modelPath}.zip`,
          contentType: "application/zip",
        },
      };

      const artifact = artifactPathMap[artifactName];
      if (!artifact || !existsSync(artifact.path)) {
        sendJson(res, 404, { error: "Artifact not found." });
        return;
      }

      const content = readFileSync(artifact.path);
      res.statusCode = 200;
      res.setHeader("Content-Type", artifact.contentType);
      res.end(content);
      return;
    }

    const commanderArtifactMatch = pathname.match(
      /^\/api\/rl\/commander\/jobs\/([^/]+)\/artifact\/([^/]+)$/
    );
    if (req.method === "GET" && commanderArtifactMatch) {
      const [, jobId, artifactName] = commanderArtifactMatch;
      const job = getCommanderJobById(jobId);
      if (!job) {
        sendJson(res, 404, { error: "Commander job not found." });
        return;
      }

      const artifactPathMap: Record<
        string,
        { path: string; contentType: string }
      > = {
        scenario: {
          path: job.artifacts.scenarioPath,
          contentType: "application/json; charset=utf-8",
        },
        summary: {
          path: job.artifacts.summaryPath,
          contentType: "application/json; charset=utf-8",
        },
        progress: {
          path: job.artifacts.progressPath,
          contentType: "application/json; charset=utf-8",
        },
        selectedScenario: {
          path: job.artifacts.selectedScenarioPath,
          contentType: "application/json; charset=utf-8",
        },
        selectedModel: {
          path: job.artifacts.selectedModelPath,
          contentType: "application/zip",
        },
        selectedModelMetadata: {
          path: job.artifacts.selectedModelMetadataPath,
          contentType: "application/json; charset=utf-8",
        },
        selectedEvalScenario: {
          path: job.artifacts.selectedEvalScenarioPath,
          contentType: "application/json; charset=utf-8",
        },
        selectedEvalRecording: {
          path: job.artifacts.selectedEvalRecordingPath,
          contentType: "text/plain; charset=utf-8",
        },
      };

      const artifact = artifactPathMap[artifactName];
      if (!artifact || !existsSync(artifact.path)) {
        sendJson(res, 404, { error: "Commander artifact not found." });
        return;
      }

      const content = readFileSync(artifact.path);
      res.statusCode = 200;
      res.setHeader("Content-Type", artifact.contentType);
      res.end(content);
      return;
    }

    next();
  };
}

export function createRlDevServerPlugin(): Plugin {
  const middleware = createMiddleware();
  return {
    name: "vista-rl-dev-server",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
