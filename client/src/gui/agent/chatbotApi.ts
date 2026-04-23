import type { LlmMessage } from "./chatbot.types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const HUGGING_FACE_BASE_URL =
  "https://router.huggingface.co/v1/chat/completions";
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 30000;

export type AssistantProvider = "openrouter" | "huggingface" | "mistral";
export type AssistantModelProfile = "quality" | "balanced" | "fast" | "oss";

type AssistantEnv = Record<string, unknown>;

interface AssistantModelPreset {
  model: string;
  fallbackModels: string[];
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  error?:
    | {
        message?: string;
      }
    | string;
  message?: string;
}

interface SingleModelAttemptResult {
  ok: boolean;
  text?: string;
  errorMessage?: string;
  status?: number;
}

export interface AssistantCompletionResult {
  ok: boolean;
  text?: string;
  errorMessage?: string;
}

export interface AssistantRuntimeConfig {
  provider: AssistantProvider;
  modelProfile: AssistantModelProfile;
  apiKey?: string;
  baseUrl: string;
  model: string;
  fallbackModels: string[];
  appName: string;
  siteUrl: string;
}

export interface AssistantRuntimeSummary {
  provider: AssistantProvider;
  providerLabel: string;
  modelProfile: AssistantModelProfile;
  profileLabel: string;
  model: string;
  fallbackModels: string[];
  hasApiKey: boolean;
}

const PROVIDER_LABELS: Record<AssistantProvider, string> = {
  openrouter: "OpenRouter",
  huggingface: "Hugging Face",
  mistral: "Mistral",
};

const PROFILE_LABELS: Record<AssistantModelProfile, string> = {
  quality: "최상 성능",
  balanced: "균형형",
  fast: "저지연",
  oss: "오픈소스",
};

const ASSISTANT_MODEL_PRESETS: Record<
  AssistantProvider,
  Record<AssistantModelProfile, AssistantModelPreset>
> = {
  openrouter: {
    quality: {
      model: "google/gemini-2.5-pro",
      fallbackModels: [
        "anthropic/claude-sonnet-4",
        "google/gemini-2.5-flash",
        "qwen/qwen3.6-plus",
      ],
    },
    balanced: {
      model: "qwen/qwen3.6-plus",
      fallbackModels: [
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-lite",
        "qwen/qwen3.6-plus:free",
      ],
    },
    fast: {
      model: "google/gemini-2.5-flash-lite",
      fallbackModels: ["google/gemini-2.5-flash", "qwen/qwen3.6-plus:free"],
    },
    oss: {
      model: "qwen/qwen3.6-plus:free",
      fallbackModels: ["qwen/qwen3.6-plus", "google/gemini-2.5-flash-lite"],
    },
  },
  huggingface: {
    quality: {
      model: "zai-org/GLM-4.5:fastest",
      fallbackModels: [
        "openai/gpt-oss-120b:fastest",
        "deepseek-ai/DeepSeek-R1:fastest",
      ],
    },
    balanced: {
      model: "openai/gpt-oss-120b:fastest",
      fallbackModels: [
        "zai-org/GLM-4.5:fastest",
        "Qwen/Qwen2.5-7B-Instruct-1M:fastest",
      ],
    },
    fast: {
      model: "Qwen/Qwen2.5-7B-Instruct-1M:fastest",
      fallbackModels: ["openai/gpt-oss-120b:fastest"],
    },
    oss: {
      model: "zai-org/GLM-4.5:fastest",
      fallbackModels: [
        "deepseek-ai/DeepSeek-R1:fastest",
        "openai/gpt-oss-120b:fastest",
      ],
    },
  },
  mistral: {
    quality: {
      model: "mistral-small-latest",
      fallbackModels: ["ministral-8b-latest", "ministral-3b-latest"],
    },
    balanced: {
      model: "mistral-small-latest",
      fallbackModels: ["ministral-8b-latest", "ministral-3b-latest"],
    },
    fast: {
      model: "ministral-3b-latest",
      fallbackModels: ["ministral-8b-latest", "mistral-small-latest"],
    },
    oss: {
      model: "ministral-8b-latest",
      fallbackModels: ["ministral-3b-latest", "mistral-small-latest"],
    },
  },
};

function getTrimmedEnvValue(env: AssistantEnv, ...keys: string[]) {
  for (const key of keys) {
    const rawValue = env[key];
    if (typeof rawValue !== "string") {
      continue;
    }
    const trimmedValue = rawValue.trim();
    if (trimmedValue) {
      return trimmedValue;
    }
  }
  return undefined;
}

function parseModelList(rawValue?: string) {
  return (rawValue ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeProvider(rawValue?: string): AssistantProvider | undefined {
  if (!rawValue) {
    return undefined;
  }
  const normalizedValue = rawValue.trim().toLowerCase();
  if (normalizedValue === "openrouter" || normalizedValue === "or") {
    return "openrouter";
  }
  if (
    normalizedValue === "huggingface" ||
    normalizedValue === "hf" ||
    normalizedValue === "hugging-face"
  ) {
    return "huggingface";
  }
  if (
    normalizedValue === "mistral" ||
    normalizedValue === "mistralai" ||
    normalizedValue === "mistral-ai"
  ) {
    return "mistral";
  }
  return undefined;
}

function normalizeModelProfile(
  rawValue?: string
): AssistantModelProfile | undefined {
  if (!rawValue) {
    return undefined;
  }
  const normalizedValue = rawValue.trim().toLowerCase();
  if (
    normalizedValue === "quality" ||
    normalizedValue === "best" ||
    normalizedValue === "sota"
  ) {
    return "quality";
  }
  if (normalizedValue === "balanced" || normalizedValue === "general") {
    return "balanced";
  }
  if (
    normalizedValue === "fast" ||
    normalizedValue === "lite" ||
    normalizedValue === "low-latency"
  ) {
    return "fast";
  }
  if (
    normalizedValue === "oss" ||
    normalizedValue === "open-source" ||
    normalizedValue === "opensource"
  ) {
    return "oss";
  }
  return undefined;
}

function inferProviderFromBaseUrl(
  baseUrl?: string
): AssistantProvider | undefined {
  if (!baseUrl) {
    return undefined;
  }
  const normalizedUrl = baseUrl.toLowerCase();
  if (normalizedUrl.includes("openrouter.ai")) {
    return "openrouter";
  }
  if (normalizedUrl.includes("huggingface.co")) {
    return "huggingface";
  }
  if (normalizedUrl.includes("mistral.ai")) {
    return "mistral";
  }
  return undefined;
}

function getDefaultSiteUrl(siteUrl?: string) {
  if (siteUrl) {
    return siteUrl;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost";
}

function getApiKeyFromEnv(env: AssistantEnv, provider: AssistantProvider) {
  if (provider === "huggingface") {
    return getTrimmedEnvValue(
      env,
      "LLM_API_KEY",
      "VITE_LLM_API_KEY",
      "HF_TOKEN",
      "VITE_HF_TOKEN"
    );
  }
  if (provider === "mistral") {
    return getTrimmedEnvValue(
      env,
      "LLM_API_KEY",
      "VITE_LLM_API_KEY",
      "MISTRAL_API_KEY",
      "VITE_MISTRAL_API_KEY"
    );
  }
  return getTrimmedEnvValue(
    env,
    "LLM_API_KEY",
    "VITE_LLM_API_KEY",
    "OPENROUTER_API_KEY",
    "VITE_OPENROUTER_API_KEY"
  );
}

export function resolveAssistantRuntimeConfig(
  env: AssistantEnv = {},
  options?: {
    siteUrl?: string;
  }
): AssistantRuntimeConfig {
  const explicitBaseUrl = getTrimmedEnvValue(
    env,
    "LLM_BASE_URL",
    "VITE_LLM_BASE_URL"
  );
  const explicitProfile = normalizeModelProfile(
    getTrimmedEnvValue(env, "LLM_MODEL_PROFILE", "VITE_LLM_MODEL_PROFILE")
  );
  const provider =
    normalizeProvider(
      getTrimmedEnvValue(env, "LLM_PROVIDER", "VITE_LLM_PROVIDER")
    ) ??
    inferProviderFromBaseUrl(explicitBaseUrl) ??
    (explicitProfile === "oss" ? "huggingface" : "openrouter");
  const modelProfile = explicitProfile ?? "quality";
  const preset = ASSISTANT_MODEL_PRESETS[provider][modelProfile];
  const model =
    getTrimmedEnvValue(env, "LLM_MODEL", "VITE_LLM_MODEL") ?? preset.model;
  const fallbackModels = [
    ...parseModelList(
      getTrimmedEnvValue(env, "LLM_FALLBACK_MODELS", "VITE_LLM_FALLBACK_MODELS")
    ),
    ...preset.fallbackModels,
  ].filter((candidateModel, index, values) => {
    return candidateModel !== model && values.indexOf(candidateModel) === index;
  });

  return {
    provider,
    modelProfile,
    apiKey: getApiKeyFromEnv(env, provider),
    baseUrl:
      explicitBaseUrl ??
      (provider === "huggingface"
        ? HUGGING_FACE_BASE_URL
        : provider === "mistral"
          ? MISTRAL_BASE_URL
          : OPENROUTER_BASE_URL),
    model,
    fallbackModels,
    appName:
      getTrimmedEnvValue(env, "LLM_APP_NAME", "VITE_LLM_APP_NAME") ??
      "VISTA",
    siteUrl: getDefaultSiteUrl(
      getTrimmedEnvValue(env, "LLM_SITE_URL", "VITE_LLM_SITE_URL") ??
        options?.siteUrl
    ),
  };
}

function getRuntimeConfig() {
  return resolveAssistantRuntimeConfig(import.meta.env as AssistantEnv);
}

export function getAssistantRuntimeSummary(
  env: AssistantEnv = import.meta.env as AssistantEnv,
  options?: {
    siteUrl?: string;
  }
): AssistantRuntimeSummary {
  const runtimeConfig = resolveAssistantRuntimeConfig(env, options);
  return {
    provider: runtimeConfig.provider,
    providerLabel: PROVIDER_LABELS[runtimeConfig.provider],
    modelProfile: runtimeConfig.modelProfile,
    profileLabel: PROFILE_LABELS[runtimeConfig.modelProfile],
    model: runtimeConfig.model,
    fallbackModels: runtimeConfig.fallbackModels,
    hasApiKey: Boolean(runtimeConfig.apiKey),
  };
}

function extractErrorMessage(payload: ChatCompletionResponse) {
  if (typeof payload.error === "string") {
    return payload.error;
  }
  if (payload.error?.message) {
    return payload.error.message;
  }
  if (payload.message) {
    return payload.message;
  }
  return undefined;
}

function buildProviderErrorMessage(
  provider: AssistantProvider,
  errorMessage: string,
  attemptedModel: string,
  status?: number
) {
  if (status === 401 || status === 403) {
    if (provider === "huggingface") {
      return "Hugging Face 토큰 인증에 실패했습니다. `LLM_API_KEY` 또는 `HF_TOKEN` 설정을 확인해 주세요.";
    }
    if (provider === "mistral") {
      return "Mistral API 키 인증에 실패했습니다. `LLM_API_KEY` 또는 `MISTRAL_API_KEY` 설정을 확인해 주세요.";
    }
    if (provider === "openrouter") {
      return "OpenRouter API 키 인증에 실패했습니다. `LLM_API_KEY` 또는 `OPENROUTER_API_KEY` 설정을 확인해 주세요.";
    }
  }

  if (
    provider === "openrouter" &&
    errorMessage.includes("No endpoints found")
  ) {
    return `OpenRouter에서 현재 사용 가능한 엔드포인트를 찾지 못했습니다. 시도 모델: ${attemptedModel}. 무료 계정이면 \`:free\` 모델이 필요하거나, 유료 모델 사용을 위해 크레딧이 필요할 수 있습니다.`;
  }
  if (
    provider === "huggingface" &&
    errorMessage.toLowerCase().includes("authorization")
  ) {
    return "Hugging Face 토큰 인증에 실패했습니다. `LLM_API_KEY` 또는 `HF_TOKEN` 설정을 확인해 주세요.";
  }
  if (
    provider === "mistral" &&
    (errorMessage.toLowerCase().includes("unauthorized") ||
      errorMessage.toLowerCase().includes("invalid api key"))
  ) {
    return "Mistral API 키 인증에 실패했습니다. `LLM_API_KEY` 또는 `MISTRAL_API_KEY` 설정을 확인해 주세요.";
  }
  return errorMessage;
}

function isRetryableModelError(
  provider: AssistantProvider,
  model: string,
  status?: number,
  errorMessage?: string
) {
  if (status === undefined) {
    return false;
  }
  if (
    provider === "openrouter" &&
    status === 404 &&
    errorMessage?.includes("No endpoints found")
  ) {
    return true;
  }
  if (status === 429 && model.includes(":free")) {
    return true;
  }
  return [408, 425, 429, 500, 502, 503, 504].includes(status);
}

export function buildAssistantRequest(
  config: AssistantRuntimeConfig,
  model: string,
  messages: LlmMessage[]
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey ?? ""}`,
  };
  if (config.provider === "openrouter") {
    headers["HTTP-Referer"] = config.siteUrl;
    headers["X-Title"] = config.appName;
  }

  return {
    url: config.baseUrl,
    headers,
    body: {
      model,
      messages,
      temperature: 0.3,
      ...(config.provider === "openrouter"
        ? {
            provider: {
              allow_fallbacks: true,
            },
          }
        : {}),
    },
  };
}

async function requestSingleModelCompletion(
  config: AssistantRuntimeConfig,
  model: string,
  messages: LlmMessage[]
): Promise<SingleModelAttemptResult> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    DEFAULT_TIMEOUT_MS
  );

  try {
    const request = buildAssistantRequest(config, model, messages);
    const response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(request.body),
      signal: controller.signal,
    });

    let payload: ChatCompletionResponse = {};
    try {
      payload = (await response.json()) as ChatCompletionResponse;
    } catch {
      payload = {};
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        errorMessage: buildProviderErrorMessage(
          config.provider,
          extractErrorMessage(payload) ??
            "VISTA Assistant 호출에 실패했습니다. 모델 이름과 API 설정을 확인해 주세요.",
          model,
          response.status
        ),
      };
    }

    const text = extractAssistantText(payload.choices?.[0]?.message?.content);
    if (!text) {
      return {
        ok: false,
        status: response.status,
        errorMessage:
          "모델이 비어 있는 응답을 반환했습니다. 다시 시도해 주세요.",
      };
    }

    return {
      ok: true,
      text,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        errorMessage:
          "응답 시간이 길어져 요청을 중단했습니다. 조금 더 짧게 질문하거나 다시 시도해 주세요.",
      };
    }

    console.error("Error requesting assistant completion:", error);
    return {
      ok: false,
      errorMessage:
        error instanceof Error
          ? `VISTA Assistant 응답 생성에 실패했습니다: ${error.message}`
          : "VISTA Assistant 응답 생성에 실패했습니다.",
    };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export function extractAssistantText(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        "text" in part &&
        part.type === "text" &&
        typeof part.text === "string"
      ) {
        return part.text;
      }
      return "";
    })
    .join("\n")
    .trim();
}

function buildMissingApiKeyMessage(provider: AssistantProvider) {
  if (provider === "huggingface") {
    return "VISTA Assistant Hugging Face 토큰을 찾지 못했습니다. `client/.env`에 `LLM_API_KEY` 또는 `HF_TOKEN`을 설정하고 개발 서버를 다시 시작해 주세요.";
  }
  if (provider === "mistral") {
    return "VISTA Assistant Mistral API 키를 찾지 못했습니다. `client/.env`에 `LLM_API_KEY` 또는 `MISTRAL_API_KEY`를 설정하고 개발 서버를 다시 시작해 주세요.";
  }
  return "VISTA Assistant OpenRouter API 키를 찾지 못했습니다. `client/.env`에 `LLM_API_KEY` 또는 `OPENROUTER_API_KEY`를 설정하고 개발 서버를 다시 시작해 주세요.";
}

export async function requestAssistantCompletionResult(
  messages: LlmMessage[]
): Promise<AssistantCompletionResult> {
  const runtimeConfig = getRuntimeConfig();
  if (!runtimeConfig.apiKey) {
    return {
      ok: false,
      errorMessage: buildMissingApiKeyMessage(runtimeConfig.provider),
    };
  }

  const attemptedModels = [
    runtimeConfig.model,
    ...runtimeConfig.fallbackModels,
  ];
  const failureMessages: string[] = [];

  for (const attemptedModel of attemptedModels) {
    const result = await requestSingleModelCompletion(
      runtimeConfig,
      attemptedModel,
      messages
    );

    if (result.ok && result.text) {
      return {
        ok: true,
        text: result.text,
      };
    }

    if (result.errorMessage) {
      failureMessages.push(`[${attemptedModel}] ${result.errorMessage}`);
    }

    if (
      !isRetryableModelError(
        runtimeConfig.provider,
        attemptedModel,
        result.status,
        result.errorMessage
      )
    ) {
      return {
        ok: false,
        errorMessage:
          result.errorMessage ??
          "VISTA Assistant 응답 생성에 실패했습니다.",
      };
    }
  }

  return {
    ok: false,
    errorMessage: `VISTA Assistant 응답 생성에 실패했습니다.\n${failureMessages.join("\n")}`,
  };
}

export async function requestAssistantCompletion(
  messages: LlmMessage[]
): Promise<string> {
  const result = await requestAssistantCompletionResult(messages);
  if (result.ok && result.text) {
    return result.text;
  }
  return (
    result.errorMessage ?? "VISTA Assistant 응답 생성에 실패했습니다."
  );
}
