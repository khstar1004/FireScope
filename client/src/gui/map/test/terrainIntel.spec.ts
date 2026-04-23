import { describe, expect, test } from "vitest";
import {
  buildVworldServiceUrl,
  extractOllamaModelNames,
  resolveOllamaApiBaseUrl,
  selectOllamaVisionModel,
  shouldUseVworldProxy,
} from "../../../../public/terrain-3d/terrainIntel.js";

describe("terrainIntel", () => {
  test("routes VWorld service requests through the local proxy on localhost", () => {
    const localLocation = {
      hostname: "localhost",
      origin: "http://localhost:49153",
    };

    expect(shouldUseVworldProxy(localLocation)).toBe(true);
    expect(buildVworldServiceUrl("/req/data", localLocation).toString()).toBe(
      "http://localhost:49153/api/vworld/req/data"
    );
  });

  test("routes VWorld service requests through the same-origin proxy on remote hosts", () => {
    const remoteLocation = {
      hostname: "vista.example.com",
      origin: "https://vista.example.com",
    };

    expect(shouldUseVworldProxy(remoteLocation)).toBe(true);
    expect(buildVworldServiceUrl("/req/wfs", remoteLocation).toString()).toBe(
      "https://vista.example.com/api/vworld/req/wfs"
    );
  });

  test("falls back to an installed Ollama model when the configured one is missing", () => {
    expect(
      selectOllamaVisionModel("preferred-model:latest", [
        "installed-model:latest",
      ])
    ).toBe("installed-model:latest");
  });

  test("extracts Ollama model names from the tags response", () => {
    expect(
      extractOllamaModelNames({
        models: [{ name: "installed-model:latest" }, { name: "  " }, {}],
      })
    ).toEqual(["installed-model:latest"]);
  });

  test("routes configured local Ollama requests through the same-origin proxy", () => {
    const remoteLocation = {
      hostname: "desktop-gvn1fkt.tail58a6fa.ts.net",
      origin: "https://desktop-gvn1fkt.tail58a6fa.ts.net:49153",
    };

    expect(
      resolveOllamaApiBaseUrl(
        {
          ollamaBaseUrl: "http://127.0.0.1:11434",
        },
        new URLSearchParams(),
        remoteLocation
      )
    ).toBe("https://desktop-gvn1fkt.tail58a6fa.ts.net:49153/api/ollama");
  });

  test("keeps explicit Ollama URL query overrides", () => {
    expect(
      resolveOllamaApiBaseUrl(
        {
          ollamaBaseUrl: "http://127.0.0.1:11434",
        },
        new URLSearchParams("ollamaUrl=http://localhost:11434/"),
        {
          hostname: "desktop-gvn1fkt.tail58a6fa.ts.net",
          origin: "https://desktop-gvn1fkt.tail58a6fa.ts.net:49153",
        }
      )
    ).toBe("http://localhost:11434");
  });
});
