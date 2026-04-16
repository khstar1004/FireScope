import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_FILE = path.join(moduleDir, "data", "scenarios.json");
const MAX_SCENARIOS = 5;

function ensureDataFile(dataFilePath) {
  mkdirSync(path.dirname(dataFilePath), { recursive: true });
  if (!existsSync(dataFilePath)) {
    writeFileSync(dataFilePath, "[]\n", "utf-8");
  }
}

function readRecords(dataFilePath) {
  ensureDataFile(dataFilePath);
  try {
    const raw = readFileSync(dataFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(dataFilePath, records) {
  ensureDataFile(dataFilePath);
  writeFileSync(dataFilePath, JSON.stringify(records, null, 2) + "\n", "utf-8");
}

function sortByUpdatedAt(records) {
  return [...records].sort((left, right) =>
    `${right.updatedAt ?? ""}`.localeCompare(`${left.updatedAt ?? ""}`)
  );
}

function toCloudScenario(record) {
  return {
    scenarioId: record.scenarioId,
    name: record.name,
    scenarioString: record.scenarioString,
  };
}

function parseScenarioEnvelope(scenarioString) {
  const parsed = JSON.parse(scenarioString);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Scenario payload must be a JSON object.");
  }
  return parsed;
}

function deriveScenarioName(scenarioEnvelope) {
  const candidateName = scenarioEnvelope.currentScenario?.name;
  if (typeof candidateName === "string" && candidateName.trim().length > 0) {
    return candidateName.trim();
  }
  return "새 시나리오";
}

export function createScenarioStore(options = {}) {
  const dataFilePath = options.dataFilePath ?? DEFAULT_DATA_FILE;

  return {
    getDataFilePath() {
      return dataFilePath;
    },

    listScenarios() {
      return sortByUpdatedAt(readRecords(dataFilePath)).map(toCloudScenario);
    },

    saveScenario(scenarioString) {
      if (typeof scenarioString !== "string" || scenarioString.trim().length === 0) {
        throw new Error("Scenario payload is required.");
      }

      const normalizedScenarioString = scenarioString.trim();
      const scenarioEnvelope = parseScenarioEnvelope(normalizedScenarioString);
      const now = new Date().toISOString();
      const nextRecord = {
        scenarioId: randomUUID(),
        name: deriveScenarioName(scenarioEnvelope),
        scenarioString: normalizedScenarioString,
        createdAt: now,
        updatedAt: now,
      };

      const nextRecords = [nextRecord, ...sortByUpdatedAt(readRecords(dataFilePath))].slice(
        0,
        MAX_SCENARIOS
      );
      writeRecords(dataFilePath, nextRecords);
      return nextRecords.map(toCloudScenario);
    },

    deleteScenario(scenarioId) {
      const currentRecords = readRecords(dataFilePath);
      const nextRecords = currentRecords.filter(
        (record) => record.scenarioId !== scenarioId
      );
      if (nextRecords.length === currentRecords.length) {
        return false;
      }

      writeRecords(dataFilePath, nextRecords);
      return true;
    },
  };
}

export { DEFAULT_DATA_FILE, MAX_SCENARIOS };
