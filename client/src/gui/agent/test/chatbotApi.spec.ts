import { describe, expect, test } from "vitest";
import type { LlmMessage } from "@/gui/agent/chatbot.types";
import {
  buildAssistantRequest,
  extractAssistantText,
  resolveAssistantRuntimeConfig,
} from "@/gui/agent/chatbotApi";

const SAMPLE_MESSAGES: LlmMessage[] = [
  {
    role: "user",
    content: "현재 전황을 분석해 줘.",
  },
];

describe("resolveAssistantRuntimeConfig", () => {
  test("uses the OpenRouter quality preset by default", () => {
    const config = resolveAssistantRuntimeConfig(
      {
        LLM_API_KEY: "or-key",
      },
      {
        siteUrl: "https://firescope.local",
      }
    );

    expect(config.provider).toBe("openrouter");
    expect(config.modelProfile).toBe("quality");
    expect(config.model).toBe("google/gemini-2.5-pro");
    expect(config.fallbackModels).toEqual([
      "anthropic/claude-sonnet-4",
      "google/gemini-2.5-flash",
      "qwen/qwen3.6-plus",
    ]);
    expect(config.baseUrl).toBe(
      "https://openrouter.ai/api/v1/chat/completions"
    );
  });

  test("switches to the Hugging Face OSS preset for open-source deployments", () => {
    const config = resolveAssistantRuntimeConfig(
      {
        LLM_MODEL_PROFILE: "oss",
        HF_TOKEN: "hf-key",
      },
      {
        siteUrl: "https://firescope.local",
      }
    );

    expect(config.provider).toBe("huggingface");
    expect(config.modelProfile).toBe("oss");
    expect(config.model).toBe("zai-org/GLM-4.5:fastest");
    expect(config.fallbackModels).toEqual([
      "deepseek-ai/DeepSeek-R1:fastest",
      "openai/gpt-oss-120b:fastest",
    ]);
    expect(config.baseUrl).toBe(
      "https://router.huggingface.co/v1/chat/completions"
    );
  });

  test("deduplicates explicit fallback models and respects explicit overrides", () => {
    const config = resolveAssistantRuntimeConfig(
      {
        LLM_PROVIDER: "openrouter",
        LLM_MODEL_PROFILE: "balanced",
        LLM_MODEL: "anthropic/claude-sonnet-4",
        LLM_FALLBACK_MODELS:
          "google/gemini-2.5-flash,google/gemini-2.5-flash,qwen/qwen3.6-plus",
        LLM_API_KEY: "or-key",
      },
      {
        siteUrl: "https://firescope.local",
      }
    );

    expect(config.model).toBe("anthropic/claude-sonnet-4");
    expect(config.fallbackModels).toEqual([
      "google/gemini-2.5-flash",
      "qwen/qwen3.6-plus",
      "google/gemini-2.5-flash-lite",
      "qwen/qwen3.6-plus:free",
    ]);
  });

  test("infers the Mistral provider from the base URL and uses Mistral presets", () => {
    const config = resolveAssistantRuntimeConfig(
      {
        LLM_BASE_URL: "https://api.mistral.ai/v1/chat/completions",
        LLM_API_KEY: "mistral-key",
      },
      {
        siteUrl: "https://firescope.local",
      }
    );

    expect(config.provider).toBe("mistral");
    expect(config.modelProfile).toBe("quality");
    expect(config.model).toBe("mistral-small-latest");
    expect(config.fallbackModels).toEqual([
      "ministral-8b-latest",
      "ministral-3b-latest",
    ]);
    expect(config.baseUrl).toBe("https://api.mistral.ai/v1/chat/completions");
  });
});

describe("buildAssistantRequest", () => {
  test("adds OpenRouter-specific headers and fallback options", () => {
    const config = resolveAssistantRuntimeConfig(
      {
        LLM_PROVIDER: "openrouter",
        LLM_MODEL_PROFILE: "quality",
        LLM_API_KEY: "or-key",
      },
      {
        siteUrl: "https://firescope.local",
      }
    );

    const request = buildAssistantRequest(
      config,
      config.model,
      SAMPLE_MESSAGES
    );

    expect(request.url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(request.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer or-key",
      "HTTP-Referer": "https://firescope.local",
      "X-Title": "FireScope",
    });
    expect(request.body).toEqual({
      model: "google/gemini-2.5-pro",
      messages: SAMPLE_MESSAGES,
      temperature: 0.3,
      provider: {
        allow_fallbacks: true,
      },
    });
  });

  test("omits OpenRouter-only metadata for Hugging Face requests", () => {
    const config = resolveAssistantRuntimeConfig(
      {
        LLM_PROVIDER: "huggingface",
        LLM_MODEL_PROFILE: "oss",
        HF_TOKEN: "hf-key",
      },
      {
        siteUrl: "https://firescope.local",
      }
    );

    const request = buildAssistantRequest(
      config,
      config.model,
      SAMPLE_MESSAGES
    );

    expect(request.url).toBe(
      "https://router.huggingface.co/v1/chat/completions"
    );
    expect(request.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer hf-key",
    });
    expect(request.body).toEqual({
      model: "zai-org/GLM-4.5:fastest",
      messages: SAMPLE_MESSAGES,
      temperature: 0.3,
    });
  });

  test("uses Mistral-compatible payloads without OpenRouter-specific metadata", () => {
    const config = resolveAssistantRuntimeConfig(
      {
        LLM_PROVIDER: "mistral",
        MISTRAL_API_KEY: "mistral-key",
        LLM_MODEL: "mistral-small-latest",
      },
      {
        siteUrl: "https://firescope.local",
      }
    );

    const request = buildAssistantRequest(
      config,
      config.model,
      SAMPLE_MESSAGES
    );

    expect(request.url).toBe("https://api.mistral.ai/v1/chat/completions");
    expect(request.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer mistral-key",
    });
    expect(request.body).toEqual({
      model: "mistral-small-latest",
      messages: SAMPLE_MESSAGES,
      temperature: 0.3,
    });
  });
});

describe("extractAssistantText", () => {
  test("joins structured text parts into a single message", () => {
    const text = extractAssistantText([
      {
        type: "text",
        text: "상황 요약",
      },
      {
        type: "text",
        text: "권고 조치",
      },
    ]);

    expect(text).toBe("상황 요약\n권고 조치");
  });
});
