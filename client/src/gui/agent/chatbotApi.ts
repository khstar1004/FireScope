import type { LlmMessage } from "./chatbot.types";

const DEFAULT_LLM_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_LLM_MODEL = "qwen/qwen3.6-plus";
const DEFAULT_LLM_FALLBACK_MODELS = [
  "qwen/qwen3.6-plus:free",
  "qwen/qwen-plus",
];
const DEFAULT_TIMEOUT_MS = 30000;

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  error?: {
    message?: string;
  };
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

function parseModelList(rawValue?: string) {
  return (rawValue ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getRuntimeConfig() {
  const model =
    import.meta.env.LLM_MODEL ??
    import.meta.env.VITE_LLM_MODEL ??
    DEFAULT_LLM_MODEL;
  const fallbackModels = [
    ...parseModelList(
      import.meta.env.LLM_FALLBACK_MODELS ??
        import.meta.env.VITE_LLM_FALLBACK_MODELS
    ),
    ...DEFAULT_LLM_FALLBACK_MODELS,
  ].filter((candidateModel, index, values) => {
    return candidateModel !== model && values.indexOf(candidateModel) === index;
  });

  return {
    apiKey: import.meta.env.LLM_API_KEY ?? import.meta.env.VITE_LLM_API_KEY,
    baseUrl:
      import.meta.env.LLM_BASE_URL ??
      import.meta.env.VITE_LLM_BASE_URL ??
      DEFAULT_LLM_BASE_URL,
    model,
    fallbackModels,
    appName:
      import.meta.env.LLM_APP_NAME ??
      import.meta.env.VITE_LLM_APP_NAME ??
      "FireScope",
    siteUrl:
      import.meta.env.LLM_SITE_URL ??
      import.meta.env.VITE_LLM_SITE_URL ??
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"),
  };
}

function buildOpenRouterErrorMessage(
  errorMessage: string,
  attemptedModel: string
) {
  if (errorMessage.includes("No endpoints found")) {
    return `OpenRouter에서 현재 사용 가능한 엔드포인트를 찾지 못했습니다. 시도 모델: ${attemptedModel}. 무료 계정이면 \`:free\` 모델이 필요하거나, 유료 모델 사용을 위해 크레딧이 필요할 수 있습니다.`;
  }
  return errorMessage;
}

function isRetryableModelError(
  model: string,
  status?: number,
  errorMessage?: string
) {
  if (!errorMessage) {
    return false;
  }
  if (status === 404 && errorMessage.includes("No endpoints found")) {
    return true;
  }
  if (status === 429 && model.includes(":free")) {
    return true;
  }
  return false;
}

async function requestSingleModelCompletion(
  baseUrl: string,
  apiKey: string,
  appName: string,
  siteUrl: string,
  model: string,
  messages: LlmMessage[]
): Promise<SingleModelAttemptResult> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": siteUrl,
        "X-Title": appName,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        provider: {
          allow_fallbacks: true,
        },
      }),
      signal: controller.signal,
    });

    const payload = (await response.json()) as ChatCompletionResponse;
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        errorMessage: buildOpenRouterErrorMessage(
          payload.error?.message ??
            "작전 도우미 호출에 실패했습니다. 모델 이름과 API 설정을 확인해 주세요.",
          model
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
          ? `작전 도우미 응답 생성에 실패했습니다: ${error.message}`
          : "작전 도우미 응답 생성에 실패했습니다.",
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

export async function requestAssistantCompletionResult(
  messages: LlmMessage[]
): Promise<AssistantCompletionResult> {
  const { apiKey, baseUrl, model, fallbackModels, appName, siteUrl } =
    getRuntimeConfig();
  if (!apiKey) {
    return {
      ok: false,
      errorMessage:
        "도우미 API 키를 찾지 못했습니다. `client/.env`에 `LLM_API_KEY`를 설정하고 개발 서버를 다시 시작해 주세요.",
    };
  }
  const attemptedModels = [model, ...fallbackModels];

  const failureMessages: string[] = [];

  for (const attemptedModel of attemptedModels) {
    const result = await requestSingleModelCompletion(
      baseUrl,
      apiKey,
      appName,
      siteUrl,
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
      !isRetryableModelError(attemptedModel, result.status, result.errorMessage)
    ) {
      return {
        ok: false,
        errorMessage:
          result.errorMessage ?? "작전 도우미 응답 생성에 실패했습니다.",
      };
    }
  }

  return {
    ok: false,
    errorMessage: `작전 도우미 응답 생성에 실패했습니다.\n${failureMessages.join("\n")}`,
  };
}

export async function requestAssistantCompletion(
  messages: LlmMessage[]
): Promise<string> {
  const result = await requestAssistantCompletionResult(messages);
  if (result.ok && result.text) {
    return result.text;
  }
  return result.errorMessage ?? "작전 도우미 응답 생성에 실패했습니다.";
}
