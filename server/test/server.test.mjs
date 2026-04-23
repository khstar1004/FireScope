import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createApp } from "../app.mjs";
import { createScenarioStore } from "../scenarioStore.mjs";

function createScenarioPayload(name) {
  return JSON.stringify({
    currentScenario: {
      id: "scenario-1",
      name,
      startTime: 0,
      currentTime: 0,
      duration: 60,
      timeCompression: 1,
      sides: [],
      aircraft: [],
      ships: [],
      facilities: [],
      airbases: [],
      weapons: [],
      referencePoints: [],
      missions: [],
      relationships: { hostiles: {}, allies: {} },
      doctrine: {},
    },
    currentSideId: "",
    selectedUnitId: "",
    mapView: {
      defaultCenter: [0, 0],
      currentCameraCenter: [0, 0],
      defaultZoom: 0,
      currentCameraZoom: 0,
    },
    focusFireOperation: {
      enabled: false,
      active: false,
      sideId: null,
      objectiveReferencePointId: null,
      captureProgress: 0,
      launchedPlatformIds: [],
    },
  });
}

async function withServer(fn) {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "vista-server-test-"));
  const dataFilePath = path.join(tempDir, "scenarios.json");
  const app = createApp({
    store: createScenarioStore({ dataFilePath }),
  });

  await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
  const address = app.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve, reject) =>
      app.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test("health endpoint responds with ok status", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    assert.equal(payload.service, "vista-server");
  });
});

test("map-config endpoint returns null maptiler config without key", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/map-config`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.basicUrl, null);
    assert.equal(payload.satelliteJson, null);
    assert.equal(payload.vworldHybridUrl, null);
  });
});

test("scenario lifecycle endpoints save, list, and delete scenarios", async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/v1/scenarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: createScenarioPayload("테스트 시나리오"),
    });
    const createdList = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(createdList.length, 1);
    assert.equal(createdList[0].name, "테스트 시나리오");
    assert.ok(createdList[0].scenarioId);

    const listResponse = await fetch(`${baseUrl}/api/v1/scenarios`);
    const listedScenarios = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.equal(listedScenarios.length, 1);
    assert.equal(
      listedScenarios[0].scenarioString,
      createScenarioPayload("테스트 시나리오"),
    );

    const deleteResponse = await fetch(
      `${baseUrl}/api/v1/scenarios/${createdList[0].scenarioId}`,
      { method: "DELETE" },
    );
    const deletePayload = await deleteResponse.json();

    assert.equal(deleteResponse.status, 200);
    assert.equal(deletePayload.deleted, true);

    const emptyListResponse = await fetch(`${baseUrl}/api/v1/scenarios`);
    const emptyList = await emptyListResponse.json();

    assert.equal(emptyListResponse.status, 200);
    assert.deepEqual(emptyList, []);
  });
});

test("scenario endpoint keeps only the newest five scenarios", async () => {
  await withServer(async (baseUrl) => {
    for (let index = 1; index <= 6; index += 1) {
      const response = await fetch(`${baseUrl}/api/v1/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: createScenarioPayload(`시나리오 ${index}`),
      });

      assert.equal(response.status, 201);
    }

    const listResponse = await fetch(`${baseUrl}/api/v1/scenarios`);
    const listedScenarios = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.equal(listedScenarios.length, 5);
    assert.deepEqual(
      listedScenarios.map((scenario) => scenario.name),
      ["시나리오 6", "시나리오 5", "시나리오 4", "시나리오 3", "시나리오 2"],
    );
  });
});
