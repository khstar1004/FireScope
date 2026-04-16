import http from "node:http";
import { createScenarioStore } from "./scenarioStore.mjs";

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function buildMapConfig() {
  const mapTilerKey =
    process.env.VITE_MAPTILER_DEFAULT_KEY ??
    process.env.MAPTILER_API_KEY ??
    process.env.MAPTILER_KEY ??
    "";
  const vworldApiKey =
    process.env.VWORLD_API_KEY ?? process.env.VITE_VWORLD_API_KEY ?? "";

  if (!mapTilerKey) {
    return {
      basicUrl: null,
      satelliteJson: null,
      vworldHybridUrl: vworldApiKey
        ? `https://api.vworld.kr/req/wmts/1.0.0/${vworldApiKey}/Hybrid/{z}/{y}/{x}.png`
        : null,
    };
  }

  return {
    basicUrl: `https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`,
    satelliteJson: `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${mapTilerKey}`,
    vworldHybridUrl: vworldApiKey
      ? `https://api.vworld.kr/req/wmts/1.0.0/${vworldApiKey}/Hybrid/{z}/{y}/{x}.png`
      : null,
  };
}

export function createApp(options = {}) {
  const store = options.store ?? createScenarioStore();

  return http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (!req.url) {
      sendJson(res, 400, { error: "Request URL is required." });
      return;
    }

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/health") {
      sendJson(res, 200, {
        status: "ok",
        service: "firescope-server",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/v1/map-config") {
      sendJson(res, 200, buildMapConfig());
      return;
    }

    if (req.method === "GET" && pathname === "/api/v1/scenarios") {
      sendJson(res, 200, store.listScenarios());
      return;
    }

    if (req.method === "POST" && pathname === "/api/v1/scenarios") {
      try {
        const body = await readBody(req);
        const savedScenarios = store.saveScenario(body);
        sendJson(res, 201, savedScenarios);
      } catch (error) {
        sendJson(res, 400, {
          error:
            error instanceof Error
              ? error.message
              : "Scenario could not be saved.",
        });
      }
      return;
    }

    const deleteMatch = pathname.match(/^\/api\/v1\/scenarios\/([^/]+)$/);
    if (req.method === "DELETE" && deleteMatch) {
      const deleted = store.deleteScenario(deleteMatch[1]);
      if (!deleted) {
        sendJson(res, 404, { error: "Scenario not found." });
        return;
      }
      sendJson(res, 200, { scenarioId: deleteMatch[1], deleted: true });
      return;
    }

    sendJson(res, 404, { error: "Not found." });
  });
}
