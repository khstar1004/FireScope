import Game from "@/game/Game";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Aircraft from "@/game/units/Aircraft";
import Airbase from "@/game/units/Airbase";
import Facility from "@/game/units/Facility";
import Weapon from "@/game/units/Weapon";

function createFocusFireGame() {
  const blueSide = new Side({
    id: "blue-side",
    name: "BLUE",
    color: "blue",
  });
  const redSide = new Side({
    id: "red-side",
    name: "RED",
    color: "red",
  });
  const strikeWeapon = new Weapon({
    id: "aircraft-weapon",
    launcherId: "aircraft-1",
    name: "AGM-65 Maverick",
    sideId: blueSide.id,
    className: "AGM-65 Maverick",
    latitude: 37.48,
    longitude: 127.05,
    altitude: 10000,
    heading: 90,
    speed: 600,
    currentFuel: 240,
    maxFuel: 240,
    fuelRate: 120,
    range: 100,
    sideColor: "blue",
    targetId: null,
    lethality: 0.7,
    maxQuantity: 2,
    currentQuantity: 2,
  });
  const artilleryWeapon = new Weapon({
    id: "artillery-weapon",
    launcherId: "facility-1",
    name: "Chunmoo Guided Rocket",
    sideId: blueSide.id,
    className: "Chunmoo Guided Rocket",
    latitude: 37.46,
    longitude: 127.02,
    altitude: 0,
    heading: 90,
    speed: 820,
    currentFuel: 220,
    maxFuel: 220,
    fuelRate: 120,
    range: 100,
    sideColor: "blue",
    targetId: null,
    lethality: 0.7,
    maxQuantity: 4,
    currentQuantity: 4,
  });
  const aircraft = new Aircraft({
    id: "aircraft-1",
    name: "KF-16 #1",
    sideId: blueSide.id,
    className: "KF-16",
    latitude: 37.48,
    longitude: 127.05,
    altitude: 10000,
    heading: 90,
    speed: 1303,
    currentFuel: 12000,
    maxFuel: 12000,
    fuelRate: 6700,
    range: 80,
    sideColor: "blue",
    weapons: [strikeWeapon],
    route: [],
    targetId: "",
  });
  const artillery = new Facility({
    id: "facility-1",
    name: "Chunmoo Battery",
    sideId: blueSide.id,
    className: "Chunmoo MRLS",
    latitude: 37.46,
    longitude: 127.02,
    altitude: 0,
    range: 80,
    heading: 0,
    speed: 12,
    route: [],
    sideColor: "blue",
    weapons: [artilleryWeapon],
  });
  const tank = new Facility({
    id: "facility-2",
    name: "K2 Platoon",
    sideId: blueSide.id,
    className: "K2 Black Panther",
    latitude: 37.44,
    longitude: 127.0,
    altitude: 0,
    range: 8,
    heading: 0,
    speed: 24,
    route: [],
    sideColor: "blue",
    weapons: [
      new Weapon({
        id: "tank-weapon",
        launcherId: "facility-2",
        name: "120mm Tank Round",
        sideId: blueSide.id,
        className: "120mm Tank Round",
        latitude: 37.44,
        longitude: 127.0,
        altitude: 0,
        heading: 0,
        speed: 2500,
        currentFuel: 36,
        maxFuel: 36,
        fuelRate: 36000,
        range: 100,
        sideColor: "blue",
        targetId: null,
        lethality: 0.62,
        maxQuantity: 8,
        currentQuantity: 8,
      }),
    ],
  });
  const hostileCommandPost = new Facility({
    id: "red-command-post",
    name: "Command Tower",
    sideId: redSide.id,
    className: "Command Tower",
    latitude: 37.5,
    longitude: 127.1,
    altitude: 0,
    range: 0,
    heading: 0,
    speed: 0,
    route: [],
    sideColor: "red",
    weapons: [],
  });
  const scenario = new Scenario({
    id: "scenario-1",
    name: "Focus Fire Test",
    startTime: 0,
    currentTime: 0,
    duration: 3600,
    sides: [blueSide, redSide],
    relationships: new Relationships({
      hostiles: {
        [blueSide.id]: [redSide.id],
        [redSide.id]: [blueSide.id],
      },
    }),
    aircraft: [aircraft],
    facilities: [artillery, tank, hostileCommandPost],
    weapons: [],
    referencePoints: [],
  });
  const game = new Game(scenario);
  game.currentSideId = blueSide.id;

  return { game, aircraft, artillery, tank, hostileCommandPost };
}

describe("focus fire mode", () => {
  test("creates a shared objective and launches available air and fires assets", () => {
    const { game, aircraft, artillery } = createFocusFireGame();

    const objective = game.setFocusFireObjective(37.5, 127.1);
    game.updateFocusFireOperation();
    aircraft.latitude = 37.61;
    aircraft.longitude = 127.21;
    const summary = game.getFocusFireSummary();
    const aircraftTrack = summary.weaponTracks.find(
      (track) => track.launcherId === aircraft.id
    );
    const artilleryTrack = summary.weaponTracks.find(
      (track) => track.launcherId === artillery.id
    );

    expect(objective).toBeDefined();
    expect(game.currentScenario.referencePoints).toHaveLength(1);
    expect(
      game.currentScenario.weapons.some(
        (weapon) => weapon.targetId === objective?.id
      )
    ).toBe(true);
    expect(game.focusFireOperation.launchedPlatformIds).toEqual(
      expect.arrayContaining([aircraft.id, artillery.id])
    );
    expect(summary.launchPlatforms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: aircraft.id,
          launched: true,
          variant: "aircraft",
        }),
        expect.objectContaining({
          id: artillery.id,
          launched: true,
          variant: "artillery",
        }),
      ])
    );
    expect(summary.weaponsInFlight).toBe(summary.weaponTracks.length);
    expect(aircraftTrack).toEqual(
      expect.objectContaining({
        launcherId: aircraft.id,
        launcherLatitude: 37.48,
        launcherLongitude: 127.05,
        targetLatitude: objective?.latitude,
        targetLongitude: objective?.longitude,
        variant: "aircraft",
      })
    );
    expect(artilleryTrack).toEqual(
      expect.objectContaining({
        launcherId: artillery.id,
        launcherLatitude: 37.46,
        launcherLongitude: 127.02,
        targetLatitude: objective?.latitude,
        targetLongitude: objective?.longitude,
        variant: "artillery",
      })
    );
  });

  test("routes armor toward the objective, fires on arrival, and accumulates capture progress on contact", () => {
    const { game, tank } = createFocusFireGame();
    const objective = game.setFocusFireObjective(37.5, 127.1);

    game.updateFocusFireOperation();

    expect(tank.route).toHaveLength(1);

    tank.latitude = objective?.latitude ?? tank.latitude;
    tank.longitude = objective?.longitude ?? tank.longitude;
    tank.route = [];

    for (let step = 0; step < 4; step += 1) {
      game.updateFocusFireOperation();
    }

    expect(game.focusFireOperation.captureProgress).toBeGreaterThan(0);
    expect(game.focusFireOperation.launchedPlatformIds).toContain(tank.id);
  });

  test("does not launch artillery outside its firing sector", () => {
    const { game, artillery } = createFocusFireGame();
    const objective = game.setFocusFireObjective(37.5, 127.1);

    artillery.heading = 200;
    game.updateFocusFireOperation();

    expect(
      game.currentScenario.weapons.some(
        (weapon) =>
          weapon.launcherId === artillery.id &&
          weapon.targetId === objective?.id
      )
    ).toBe(false);
    expect(game.focusFireOperation.launchedPlatformIds).not.toContain(
      artillery.id
    );

    artillery.heading = 45;
    game.updateFocusFireOperation();

    expect(
      game.currentScenario.weapons.some(
        (weapon) =>
          weapon.launcherId === artillery.id &&
          weapon.targetId === objective?.id
      )
    ).toBe(true);
    expect(game.focusFireOperation.launchedPlatformIds).toContain(artillery.id);
  });

  test("builds recommendation details for the focus-fire summary", () => {
    const { game, artillery, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );

    const summary = game.getFocusFireSummary();

    expect(summary.recommendation).toEqual(
      expect.objectContaining({
        recommendedOptionLabel: "추천 1안",
        missionKind: "시설 제압",
        targetPriorityLabel: "보통",
        desiredEffectLabel: "무력화",
        ammoType: "DPICM",
        firingUnitNames: [artillery.name],
        targetName: "통제 타워",
        weaponName: "천무 유도탄",
        shotCount: 4,
        expectedStrikeEffect: 2.8,
      })
    );
    expect(summary.recommendation?.targetComposition).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "지상 시설",
          count: 1,
        }),
      ])
    );
    expect(summary.recommendation?.options[0]).toEqual(
      expect.objectContaining({
        label: "추천 1안",
        ammoType: "DPICM",
        launcherCount: 1,
      })
    );
    expect(summary.recommendation?.options[0]?.firingPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          launcherName: artillery.name,
          ammoType: "DPICM",
          shotCount: 4,
        }),
      ])
    );
    expect(summary.recommendation?.targetCombatPower).toBeGreaterThan(0);
    expect(summary.recommendation?.desiredEffect).toBeGreaterThan(0);
    expect(summary.recommendation?.targetDistanceKm).toBeGreaterThan(0);
  });

  test("filters blocked artillery from the recommendation set", () => {
    const { game, artillery, hostileCommandPost } = createFocusFireGame();

    artillery.heading = 200;
    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );

    const summary = game.getFocusFireSummary();

    expect(summary.recommendation).toEqual(
      expect.objectContaining({
        weaponName: "AGM-65 매버릭",
        ammoType: "정밀유도",
        launchReadinessLabel: "즉시 발사 가능",
        immediateLaunchReadyCount: 1,
        repositionRequiredCount: 0,
      })
    );
    expect(
      summary.recommendation?.options.some(
        (option) => option.weaponName === "천무 유도탄"
      )
    ).toBe(false);
  });

  test("marks distant aircraft recommendations as repositioned launches with eta", () => {
    const { game, aircraft, artillery, hostileCommandPost } =
      createFocusFireGame();

    artillery.heading = 200;
    aircraft.latitude = 36.4;
    aircraft.longitude = 126.0;
    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );

    const summary = game.getFocusFireSummary();
    const topPlan = summary.recommendation?.options[0]?.firingPlan[0];

    expect(summary.recommendation).toEqual(
      expect.objectContaining({
        weaponName: "AGM-65 매버릭",
        launchReadinessLabel: "기동 후 발사",
        immediateLaunchReadyCount: 0,
        repositionRequiredCount: 1,
      })
    );
    expect(summary.recommendation?.averageTimeToFireSeconds).toBeGreaterThan(0);
    expect(topPlan).toEqual(
      expect.objectContaining({
        launcherId: aircraft.id,
        executionState: "reposition",
      })
    );
    expect(topPlan?.estimatedTimeToFireSeconds).toBeGreaterThan(0);
  });

  test("records focus-fire recommendation telemetry once per unchanged recommendation and preserves it through export/load", () => {
    const { game, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );

    const firstSummary = game.getFocusFireSummary();
    const secondSummary = game.getFocusFireSummary();
    const telemetry = game.getFocusFireRecommendationTelemetry();

    expect(firstSummary.recommendation?.weaponName).toBe(
      secondSummary.recommendation?.weaponName
    );
    expect(telemetry).toHaveLength(1);
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        objectiveName: "집중포격 목표",
        weaponName: firstSummary.recommendation?.weaponName,
        launchReadinessLabel: firstSummary.recommendation?.launchReadinessLabel,
      })
    );
    expect(telemetry[0]?.options[0]).toEqual(
      expect.objectContaining({
        label: "추천 1안",
        weaponName: firstSummary.recommendation?.options[0]?.weaponName,
      })
    );

    const exportedScenario = game.exportCurrentScenario();
    const { game: reloadedGame } = createFocusFireGame();
    reloadedGame.loadScenario(exportedScenario);

    expect(reloadedGame.getFocusFireRecommendationTelemetry()).toHaveLength(1);
    expect(reloadedGame.getFocusFireRecommendationTelemetry()[0]).toEqual(
      expect.objectContaining({
        weaponName: firstSummary.recommendation?.weaponName,
        launchReadinessLabel: firstSummary.recommendation?.launchReadinessLabel,
      })
    );

    reloadedGame.getFocusFireSummary();
    expect(reloadedGame.getFocusFireRecommendationTelemetry()).toHaveLength(1);
  });

  test("records operator feedback in recommendation telemetry and preserves it through export/load", () => {
    const { game, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );
    const summary = game.getFocusFireSummary();
    const feedbackOptionLabel =
      summary.recommendation?.options[1]?.label ??
      summary.recommendation?.options[0]?.label;

    expect(feedbackOptionLabel).toBeDefined();

    const feedbackRecord = game.setFocusFireRecommendationFeedback(
      feedbackOptionLabel ?? ""
    );

    expect(feedbackRecord).toEqual(
      expect.objectContaining({
        feedbackOptionLabel,
        feedbackCapturedAt: game.currentScenario.currentTime,
      })
    );
    expect(game.getFocusFireRecommendationTelemetry()[0]).toEqual(
      expect.objectContaining({
        feedbackOptionLabel,
      })
    );

    const exportedScenario = game.exportCurrentScenario();
    const { game: reloadedGame } = createFocusFireGame();
    reloadedGame.loadScenario(exportedScenario);

    expect(reloadedGame.getFocusFireRecommendationTelemetry()[0]).toEqual(
      expect.objectContaining({
        feedbackOptionLabel,
        feedbackCapturedAt: game.currentScenario.currentTime,
      })
    );
  });

  test("exports recommendation telemetry and preserves reranker state through export/load", () => {
    const { game, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );
    game.getFocusFireSummary();

    const jsonl = game.exportFocusFireRecommendationTelemetryJsonl();
    const csv = game.exportFocusFireRecommendationTelemetryCsv();
    const trainingResult = game.trainFocusFireRerankerModel();
    const aiSummary = game.getFocusFireSummary();

    expect(jsonl).toContain('"recommendedOptionLabel"');
    expect(jsonl).toContain('"weaponName"');
    expect(csv).toContain("option_label");
    expect(csv).toContain("selection_model_label");
    expect(trainingResult.model.source).toBe("telemetry-pairwise");
    expect(game.getFocusFireRerankerState().enabled).toBe(true);
    expect(aiSummary.recommendation?.rerankerApplied).toBe(true);
    expect(aiSummary.recommendation?.selectionModelLabel).toContain(
      "AI 재정렬"
    );
    expect(aiSummary.recommendation?.options[0]?.aiReasonSummary).toBeTruthy();
    expect(
      aiSummary.recommendation?.options[0]?.aiPositiveSignals?.length ?? 0
    ).toBeGreaterThan(0);

    const exportedScenario = game.exportCurrentScenario();
    const { game: reloadedGame } = createFocusFireGame();
    reloadedGame.loadScenario(exportedScenario);

    expect(reloadedGame.getFocusFireRerankerState().enabled).toBe(true);
    expect(reloadedGame.getFocusFireRerankerState().model.source).toBe(
      "telemetry-pairwise"
    );
    expect(reloadedGame.exportFocusFireRecommendationTelemetryCsv()).toContain(
      "option_label"
    );
  });

  test("exports and imports the standalone focus-fire reranker model json", () => {
    const { game, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );
    game.getFocusFireSummary();
    const trainingResult = game.trainFocusFireRerankerModel();
    const exportedModelJson = game.exportFocusFireRerankerModel();

    game.resetFocusFireRerankerModel();
    const imported = game.importFocusFireRerankerModel(exportedModelJson);

    expect(trainingResult.model.source).toBe("telemetry-pairwise");
    expect(imported.enabled).toBe(true);
    expect(imported.model).toEqual(trainingResult.model);
    expect(game.getFocusFireRerankerState().model).toEqual(
      trainingResult.model
    );
  });

  test("imports telemetry tree-ensemble models and enables tree ranking labels", () => {
    const { game, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );

    const imported = game.importFocusFireRerankerModel(
      JSON.stringify({
        version: 7,
        trainedAt: "2026-04-16T00:00:00.000Z",
        source: "telemetry-tree-ensemble",
        modelFamily: "tree-ensemble",
        sampleCount: 18,
        operatorFeedbackCount: 7,
        ruleSeedCount: 5,
        epochCount: 24,
        learningRate: 0.18,
        intercept: 0,
        weights: {},
        treeEnsemble: {
          trainer: "LightGBM LambdaMART",
          trees: [
            {
              root: {
                feature: "blockedRatio",
                threshold: 0.2,
                left: {
                  feature: "responseTempo",
                  threshold: 0.65,
                  left: {
                    value: -0.3,
                  },
                  right: {
                    value: 0.9,
                  },
                },
                right: {
                  value: -0.8,
                },
              },
            },
          ],
        },
      })
    );
    const summary = game.getFocusFireSummary();

    expect(imported.enabled).toBe(true);
    expect(imported.model.modelFamily).toBe("tree-ensemble");
    expect(imported.model.source).toBe("telemetry-tree-ensemble");
    expect(imported.model.origin).toBe("imported-json");
    expect(imported.model.treeEnsemble?.trainer).toBe("LightGBM LambdaMART");
    expect(imported.model.treeEnsemble?.trees).toHaveLength(1);
    expect(summary.recommendation?.rerankerApplied).toBe(true);
    expect(summary.recommendation?.selectionModelLabel).toContain(
      "AI LambdaRank"
    );
  });

  test("skips ai-only telemetry during training until operator feedback is recorded", () => {
    const { game, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );
    game.setFocusFireRerankerEnabled(true);
    const aiSummary = game.getFocusFireSummary();

    const skippedTraining = game.trainFocusFireRerankerModel();

    expect(skippedTraining.summary.recordsUsed).toBe(0);
    expect(skippedTraining.summary.skippedAiOnlyRecords).toBe(1);
    expect(skippedTraining.summary.operatorFeedbackRecords).toBe(0);
    expect(skippedTraining.model.source).toBe("default");

    const feedbackOptionLabel =
      aiSummary.recommendation?.options[1]?.label ??
      aiSummary.recommendation?.options[0]?.label;
    game.setFocusFireRecommendationFeedback(feedbackOptionLabel ?? "");

    const trained = game.trainFocusFireRerankerModel();

    expect(trained.summary.recordsUsed).toBeGreaterThan(0);
    expect(trained.summary.operatorFeedbackRecords).toBe(1);
    expect(trained.model.source).toBe("telemetry-pairwise");
  });

  test("applies user desired effect input to ranking and persists it through export/load", () => {
    const { game, hostileCommandPost } = createFocusFireGame();

    game.setFocusFireObjective(
      hostileCommandPost.latitude,
      hostileCommandPost.longitude
    );
    game.setFocusFireDesiredEffectOverride(1.5);

    const summary = game.getFocusFireSummary();

    expect(game.focusFireOperation.desiredEffectOverride).toBe(1.5);
    expect(summary.desiredEffectOverride).toBe(1.5);
    expect(summary.recommendation).toEqual(
      expect.objectContaining({
        desiredEffect: 1.5,
        desiredEffectIsUserDefined: true,
        weaponName: "AGM-65 매버릭",
        ammoType: "정밀유도",
      })
    );

    const exportedScenario = game.exportCurrentScenario();
    const { game: reloadedGame } = createFocusFireGame();
    reloadedGame.loadScenario(exportedScenario);

    expect(reloadedGame.focusFireOperation.desiredEffectOverride).toBe(1.5);
    expect(reloadedGame.getFocusFireSummary().desiredEffectOverride).toBe(1.5);
    expect(reloadedGame.getFocusFireSummary().recommendation).toEqual(
      expect.objectContaining({
        desiredEffect: 1.5,
        desiredEffectIsUserDefined: true,
        weaponName: "AGM-65 매버릭",
      })
    );
  });

  test("supports direct target recommendation and automatic target prioritization", () => {
    const { game, hostileCommandPost } = createFocusFireGame();
    const hostileRocketBattery = new Facility({
      id: "red-fires-battery",
      name: "Red Rocket Battery",
      sideId: "red-side",
      className: "Chunmoo MRLS",
      latitude: 37.505,
      longitude: 127.102,
      altitude: 0,
      range: 80,
      heading: 0,
      speed: 0,
      route: [],
      sideColor: "red",
      weapons: [],
    });
    const hostileRadar = new Facility({
      id: "red-radar-site",
      name: "Radar Site",
      sideId: "red-side",
      className: "Radar Site",
      latitude: 37.54,
      longitude: 127.12,
      altitude: 0,
      range: 0,
      heading: 0,
      speed: 0,
      route: [],
      sideColor: "red",
      weapons: [],
    });
    const hostileAirbase = new Airbase({
      id: "red-airbase",
      name: "Red Airbase",
      sideId: "red-side",
      className: "Airbase",
      latitude: 37.62,
      longitude: 127.18,
      altitude: 0,
      sideColor: "red",
      aircraft: Array.from({ length: 8 }, (_, index) => {
        return new Aircraft({
          id: `red-aircraft-${index}`,
          name: `Mig #${index + 1}`,
          sideId: "red-side",
          className: "MiG-29",
          latitude: 37.62,
          longitude: 127.18,
          altitude: 0,
          heading: 90,
          speed: 900,
          currentFuel: 1000,
          maxFuel: 1000,
          fuelRate: 200,
          range: 100,
          sideColor: "red",
          weapons: [],
          route: [],
          targetId: "",
        });
      }),
    });
    game.currentScenario.facilities.push(hostileRocketBattery, hostileRadar);
    game.currentScenario.airbases.push(hostileAirbase);

    const directRecommendation = game.getFireRecommendationForTarget(
      hostileCommandPost.id,
      game.currentSideId
    );
    const priorities = game.getFireRecommendationTargetPriorities(
      game.currentSideId,
      [
        hostileRadar.id,
        hostileCommandPost.id,
        hostileRocketBattery.id,
        hostileAirbase.id,
      ]
    );

    expect(directRecommendation).toEqual(
      expect.objectContaining({
        primaryTargetId: hostileCommandPost.id,
        targetName: expect.stringContaining("통제"),
      })
    );
    expect(priorities).toHaveLength(4);
    expect(priorities.map((entry) => entry.priorityRank)).toEqual([1, 2, 3, 4]);
    expect(priorities[0].priorityScore).toBeGreaterThanOrEqual(
      priorities[1].priorityScore
    );
    expect(priorities[1].priorityScore).toBeGreaterThanOrEqual(
      priorities[2].priorityScore
    );
    expect(priorities[2].priorityScore).toBeGreaterThanOrEqual(
      priorities[3].priorityScore
    );
    expect(
      priorities.find((entry) => entry.targetId === hostileAirbase.id)
    ).toEqual(
      expect.objectContaining({
        targetId: hostileAirbase.id,
        priorityRank: expect.any(Number),
      })
    );
    expect(priorities.map((entry) => entry.targetId)).toEqual(
      expect.arrayContaining([
        hostileCommandPost.id,
        hostileRadar.id,
        hostileRocketBattery.id,
        hostileAirbase.id,
      ])
    );
  });

  test("keeps a strike mission active until all assigned targets are resolved", () => {
    const { game, aircraft, hostileCommandPost } = createFocusFireGame();
    const hostileRadar = new Facility({
      id: "red-radar-site-2",
      name: "Backup Radar",
      sideId: "red-side",
      className: "Radar Site",
      latitude: 37.502,
      longitude: 127.105,
      altitude: 0,
      range: 0,
      heading: 0,
      speed: 0,
      route: [],
      sideColor: "red",
      weapons: [],
    });
    game.currentScenario.facilities.push(hostileRadar);
    game.createStrikeMission(
      "Sequential Strike",
      [aircraft.id],
      [hostileCommandPost.id, hostileRadar.id]
    );

    game.currentScenario.facilities = game.currentScenario.facilities.filter(
      (facility) => facility.id !== hostileCommandPost.id
    );
    game.clearCompletedStrikeMissions();
    game.updateUnitsOnStrikeMission();

    expect(game.currentScenario.getAllStrikeMissions()).toHaveLength(1);
    expect(
      game.currentScenario.weapons.some(
        (weapon) =>
          weapon.launcherId === aircraft.id &&
          weapon.targetId === hostileRadar.id
      )
    ).toBe(true);

    game.currentScenario.facilities = game.currentScenario.facilities.filter(
      (facility) => facility.id !== hostileRadar.id
    );
    game.clearCompletedStrikeMissions();

    expect(game.currentScenario.getAllStrikeMissions()).toHaveLength(0);
  });
});
