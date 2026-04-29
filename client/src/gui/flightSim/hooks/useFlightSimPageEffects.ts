// @ts-nocheck

export function useFlightSimPageEffects(ctx) {
  const {
    FLIGHT_SIM_ENTRY,
    allBattleSpectatorUnitsById,
    allBattleSpectatorWeaponsById,
    applyBattleSpectatorFollowTargetSelection,
    assetState,
    battleSpectator,
    battleSpectatorAutoCapture,
    battleSpectatorAutoCaptureKeyRef,
    battleSpectatorAutoPatrol,
    battleSpectatorBriefing,
    battleSpectatorBriefingLogSignatureRef,
    battleSpectatorCameraProfile,
    battleSpectatorEnabled,
    battleSpectatorFollowTargetId,
    battleSpectatorHighlightedPatrolTargetId,
    battleSpectatorInitialFollowSeededRef,
    battleSpectatorInitialJumpScenarioRef,
    battleSpectatorInitialScenarioSnapshotRef,
    battleSpectatorLodLevel,
    battleSpectatorOverviewPoint,
    battleSpectatorPatrolIndexRef,
    battleSpectatorPatrolTargets,
    battleSpectatorPinnedInspectTargetId,
    battleSpectatorRuntimeReady,
    battleSpectatorRuntimeSignatureRef,
    battleSpectatorScenarioRestartedRef,
    battleSpectatorSideFilter,
    battleSpectatorSideOptions,
    battleSpectatorSimulationRevision,
    battleSpectatorStateSignatureRef,
    buildBattleSpectatorSideTrendHistoryEntry,
    buildBattleSpectatorState,
    buildBattleSpectatorStateSignature,
    buildFocusFireAirwatchState,
    buildSimulationOutcomeSummary,
    continueSimulation,
    currentBattleSpectator,
    currentFocusFireAirwatch,
    fetch,
    flightSimFrameReady,
    focusBattleSpectatorPatrolTarget,
    focusBattleSpectatorView,
    focusFireAirwatch,
    focusFireAirwatchEnabled,
    formatBattleSpectatorTimestamp,
    game,
    iframeRef,
    iframeSrc,
    latestBattleEngagementPoint,
    latestBattleSpectatorWeapon,
    latestTrackableBattleSpectatorEvent,
    parseBattleSpectatorFollowTargetId,
    postRuntimeToFlightSim,
    requestSimulationOutcomeNarrative,
    resolveBattleSpectatorEventJumpPoint,
    resolveBattleSpectatorJumpPoint,
    resolveBattleSpectatorWeaponJumpPoint,
    resolveInitialBattleSpectatorPanelOpen,
    setAssetState,
    setBattleSpectatorBriefingLog,
    setBattleSpectatorCameraProfile,
    setBattleSpectatorFollowTargetId,
    setBattleSpectatorHighlightedPatrolTargetId,
    setBattleSpectatorPanelOpen,
    setBattleSpectatorPinnedInspectTargetId,
    setBattleSpectatorPriorityFilter,
    setBattleSpectatorSideFilter,
    setBattleSpectatorTrendHistory,
    setCurrentBattleSpectator,
    setCurrentFocusFireAirwatch,
    setFlightSimFrameReady,
    setRuntimeInfo,
    setRuntimeProvider,
    setSimulationOutcomeLoading,
    setSimulationOutcomeNarrative,
    setSimulationOutcomeNarrativeSource,
    setSimulationOutcomeOpen,
    setSimulationOutcomeSummary,
    showBattleSpectator,
    showFocusFireAirwatch,
    simulationOutcomeRequestIdRef,
    syncBattleSpectatorRuntime,
    useEffect,
    visibleBattleSpectator,
  } = ctx;

  useEffect(() => {
    battleSpectatorScenarioRestartedRef.current = false;
    if (
      !game ||
      !battleSpectatorEnabled ||
      !continueSimulation ||
      typeof game.exportCurrentScenario !== "function"
    ) {
      battleSpectatorInitialScenarioSnapshotRef.current = null;
      return;
    }

    try {
      battleSpectatorInitialScenarioSnapshotRef.current =
        game.exportCurrentScenario();
    } catch (_error) {
      battleSpectatorInitialScenarioSnapshotRef.current = null;
    }
  }, [battleSpectatorEnabled, continueSimulation, game]);

  useEffect(() => {
    const nextBattleSpectatorState = battleSpectatorEnabled
      ? buildBattleSpectatorState(game, continueSimulation, battleSpectator)
      : undefined;
    const nextSignature = buildBattleSpectatorStateSignature(
      nextBattleSpectatorState
    );

    if (battleSpectatorStateSignatureRef.current === nextSignature) {
      return;
    }

    battleSpectatorStateSignatureRef.current = nextSignature;
    setCurrentBattleSpectator(nextBattleSpectatorState);
  }, [battleSpectator, battleSpectatorEnabled, continueSimulation, game]);

  useEffect(() => {
    setCurrentFocusFireAirwatch(
      focusFireAirwatchEnabled
        ? buildFocusFireAirwatchState(
            game,
            continueSimulation,
            focusFireAirwatch
          )
        : undefined
    );
  }, [continueSimulation, focusFireAirwatch, focusFireAirwatchEnabled, game]);

  useEffect(() => {
    if (!currentBattleSpectator) {
      setBattleSpectatorSideFilter("all");
      setBattleSpectatorFollowTargetId("");
      setBattleSpectatorPinnedInspectTargetId("");
      setBattleSpectatorPriorityFilter("all");
      setBattleSpectatorBriefingLog([]);
      battleSpectatorInitialFollowSeededRef.current = false;
      battleSpectatorBriefingLogSignatureRef.current = "";
      return;
    }
    setBattleSpectatorHighlightedPatrolTargetId("");

    if (
      battleSpectatorSideFilter !== "all" &&
      !battleSpectatorSideOptions.some(
        (side) => side.id === battleSpectatorSideFilter
      )
    ) {
      setBattleSpectatorSideFilter("all");
    }
  }, [
    battleSpectatorSideFilter,
    battleSpectatorSideOptions,
    currentBattleSpectator,
  ]);

  useEffect(() => {
    if (!battleSpectatorPinnedInspectTargetId) {
      return;
    }

    const parsedInspectTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorPinnedInspectTargetId
    );
    const targetExists =
      parsedInspectTarget?.type === "weapon"
        ? allBattleSpectatorWeaponsById.has(parsedInspectTarget.id)
        : parsedInspectTarget?.type === "unit"
          ? allBattleSpectatorUnitsById.has(parsedInspectTarget.id)
          : false;
    if (!targetExists) {
      setBattleSpectatorPinnedInspectTargetId("");
    }
  }, [
    allBattleSpectatorUnitsById,
    allBattleSpectatorWeaponsById,
    battleSpectatorPinnedInspectTargetId,
  ]);

  useEffect(() => {
    const handleBattleSpectatorSelectionMessage = (
      event: MessageEvent<{
        type?: string;
        payload?: BattleSpectatorRuntimeSelectionPayload;
      }>
    ) => {
      if (
        (event.origin.length > 0 && event.origin !== window.location.origin) ||
        event.data?.type !== "vista-battle-spectator-selection"
      ) {
        return;
      }

      const followTargetId =
        typeof event.data.payload?.followTargetId === "string"
          ? event.data.payload.followTargetId
          : "";
      const parsedInspectTarget =
        parseBattleSpectatorFollowTargetId(followTargetId);
      const targetExists =
        parsedInspectTarget?.type === "weapon"
          ? allBattleSpectatorWeaponsById.has(parsedInspectTarget.id)
          : parsedInspectTarget?.type === "unit"
            ? allBattleSpectatorUnitsById.has(parsedInspectTarget.id)
            : false;
      if (!targetExists) {
        return;
      }

      setBattleSpectatorHighlightedPatrolTargetId("");
      setBattleSpectatorPinnedInspectTargetId(followTargetId);
    };

    window.addEventListener("message", handleBattleSpectatorSelectionMessage);
    return () => {
      window.removeEventListener(
        "message",
        handleBattleSpectatorSelectionMessage
      );
    };
  }, [allBattleSpectatorUnitsById, allBattleSpectatorWeaponsById]);

  useEffect(() => {
    if (!battleSpectatorHighlightedPatrolTargetId) {
      return;
    }

    const targetExists = battleSpectatorPatrolTargets.some(
      (target) => target.id === battleSpectatorHighlightedPatrolTargetId
    );
    if (!targetExists) {
      setBattleSpectatorHighlightedPatrolTargetId("");
    }
  }, [battleSpectatorHighlightedPatrolTargetId, battleSpectatorPatrolTargets]);

  useEffect(() => {
    if (!showBattleSpectator || !battleSpectatorBriefing) {
      if (!showBattleSpectator) {
        battleSpectatorBriefingLogSignatureRef.current = "";
        setBattleSpectatorBriefingLog([]);
      }
      return;
    }

    const primaryAction = battleSpectatorBriefing.actions[0];
    const fallbackPoint =
      latestBattleEngagementPoint ?? battleSpectatorOverviewPoint;
    if (!primaryAction && !fallbackPoint) {
      return;
    }

    const nextSignature = [
      battleSpectatorBriefing.stageLabel,
      battleSpectatorBriefing.headline,
      battleSpectatorBriefing.detail,
      primaryAction?.id ?? "",
    ].join("|");
    if (battleSpectatorBriefingLogSignatureRef.current === nextSignature) {
      return;
    }

    battleSpectatorBriefingLogSignatureRef.current = nextSignature;
    const eventPoint = primaryAction?.point ?? fallbackPoint;
    if (!eventPoint) {
      return;
    }

    const timestampSource =
      visibleBattleSpectator?.currentTime ??
      currentBattleSpectator?.currentTime ??
      Date.now();
    const nextEntry: BattleSpectatorBriefingLogEntry = {
      id: `briefing-log-${timestampSource}-${battleSpectatorBriefing.stageLabel}`,
      timestampLabel: formatBattleSpectatorTimestamp(timestampSource),
      stageLabel: battleSpectatorBriefing.stageLabel,
      stageTone: battleSpectatorBriefing.stageTone,
      headline: battleSpectatorBriefing.headline,
      detail: battleSpectatorBriefing.detail,
      point: eventPoint,
      followTargetId: primaryAction?.followTargetId,
      cameraProfile:
        primaryAction?.cameraProfile ?? battleSpectatorCameraProfile,
    };

    setBattleSpectatorBriefingLog((currentLog) =>
      [nextEntry, ...currentLog].slice(0, 6)
    );
  }, [
    battleSpectatorBriefing,
    battleSpectatorCameraProfile,
    battleSpectatorOverviewPoint,
    currentBattleSpectator,
    latestBattleEngagementPoint,
    showBattleSpectator,
    visibleBattleSpectator,
  ]);

  useEffect(() => {
    if (!showBattleSpectator) {
      battleSpectatorInitialFollowSeededRef.current = false;
      return;
    }

    if (battleSpectatorFollowTargetId) {
      battleSpectatorInitialFollowSeededRef.current = true;
      return;
    }

    if (
      battleSpectatorInitialFollowSeededRef.current ||
      !currentBattleSpectator
    ) {
      return;
    }

    const initialJumpPoint = resolveBattleSpectatorJumpPoint(
      currentBattleSpectator
    );
    battleSpectatorInitialFollowSeededRef.current = true;
    if (!initialJumpPoint?.followTargetId) {
      return;
    }

    applyBattleSpectatorFollowTargetSelection(
      initialJumpPoint.followTargetId,
      currentBattleSpectator,
      battleSpectatorCameraProfile,
      setBattleSpectatorFollowTargetId,
      setBattleSpectatorCameraProfile
    );
  }, [
    battleSpectatorCameraProfile,
    battleSpectatorFollowTargetId,
    currentBattleSpectator,
    applyBattleSpectatorFollowTargetSelection,
    showBattleSpectator,
  ]);

  useEffect(() => {
    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorFollowTargetId
    );

    if (!parsedFollowTarget) {
      return;
    }

    const followTargetExists =
      parsedFollowTarget.type === "weapon"
        ? (visibleBattleSpectator?.weapons ?? []).some(
            (weapon) => weapon.id === parsedFollowTarget.id
          )
        : (visibleBattleSpectator?.units ?? []).some(
            (unit) => unit.id === parsedFollowTarget.id
          );

    if (!followTargetExists) {
      setBattleSpectatorFollowTargetId("");
    }
  }, [battleSpectatorFollowTargetId, visibleBattleSpectator]);

  useEffect(() => {
    if (!showBattleSpectator || !battleSpectatorAutoCapture) {
      battleSpectatorAutoCaptureKeyRef.current = "";
      return;
    }

    if (!battleSpectatorRuntimeReady) {
      return;
    }

    if (latestBattleSpectatorWeapon) {
      const nextKey = `weapon:${latestBattleSpectatorWeapon.id}`;
      if (battleSpectatorAutoCaptureKeyRef.current === nextKey) {
        return;
      }

      battleSpectatorAutoCaptureKeyRef.current = nextKey;
      focusBattleSpectatorView({
        point: resolveBattleSpectatorWeaponJumpPoint(
          latestBattleSpectatorWeapon
        ),
        followTargetId: nextKey,
      });
      return;
    }

    if (!latestTrackableBattleSpectatorEvent) {
      return;
    }

    const eventPoint = resolveBattleSpectatorEventJumpPoint(
      latestTrackableBattleSpectatorEvent
    );
    if (!eventPoint) {
      return;
    }

    const followTargetId =
      typeof latestTrackableBattleSpectatorEvent.weaponId === "string"
        ? `weapon:${latestTrackableBattleSpectatorEvent.weaponId}`
        : typeof latestTrackableBattleSpectatorEvent.targetId === "string"
          ? `unit:${latestTrackableBattleSpectatorEvent.targetId}`
          : typeof latestTrackableBattleSpectatorEvent.actorId === "string"
            ? `unit:${latestTrackableBattleSpectatorEvent.actorId}`
            : undefined;
    const nextKey =
      followTargetId ??
      `event:${latestTrackableBattleSpectatorEvent.id}:${eventPoint.longitude.toFixed(
        4
      )}:${eventPoint.latitude.toFixed(4)}`;

    if (battleSpectatorAutoCaptureKeyRef.current === nextKey) {
      return;
    }

    battleSpectatorAutoCaptureKeyRef.current = nextKey;
    focusBattleSpectatorView({
      point: eventPoint,
      followTargetId,
    });
  }, [
    battleSpectatorAutoCapture,
    battleSpectatorRuntimeReady,
    latestBattleSpectatorWeapon,
    latestTrackableBattleSpectatorEvent,
    showBattleSpectator,
  ]);

  useEffect(() => {
    if (
      !showBattleSpectator ||
      !battleSpectatorRuntimeReady ||
      !battleSpectatorAutoPatrol ||
      battleSpectatorAutoCapture ||
      battleSpectatorPatrolTargets.length === 0
    ) {
      battleSpectatorPatrolIndexRef.current = 0;
      return;
    }

    battleSpectatorPatrolIndexRef.current = 0;
    focusBattleSpectatorPatrolTarget(battleSpectatorPatrolTargets[0], {
      preservePanel: true,
    });

    const intervalId = window.setInterval(() => {
      battleSpectatorPatrolIndexRef.current =
        (battleSpectatorPatrolIndexRef.current + 1) %
        battleSpectatorPatrolTargets.length;
      focusBattleSpectatorPatrolTarget(
        battleSpectatorPatrolTargets[battleSpectatorPatrolIndexRef.current],
        {
          preservePanel: true,
        }
      );
    }, 6500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    battleSpectatorAutoCapture,
    battleSpectatorAutoPatrol,
    battleSpectatorPatrolTargets,
    battleSpectatorRuntimeReady,
    showBattleSpectator,
  ]);

  useEffect(() => {
    if (!showBattleSpectator) {
      setBattleSpectatorPanelOpen(true);
      battleSpectatorInitialJumpScenarioRef.current = "";
      return;
    }

    setBattleSpectatorPanelOpen(resolveInitialBattleSpectatorPanelOpen());
  }, [showBattleSpectator]);

  useEffect(() => {
    if (
      !showBattleSpectator ||
      !battleSpectatorRuntimeReady ||
      battleSpectatorAutoCapture ||
      battleSpectatorAutoPatrol ||
      !visibleBattleSpectator ||
      !latestBattleEngagementPoint
    ) {
      if (!showBattleSpectator) {
        battleSpectatorInitialJumpScenarioRef.current = "";
      }
      return;
    }

    const initialJumpScenarioKey = visibleBattleSpectator.scenarioId;
    if (
      battleSpectatorInitialJumpScenarioRef.current === initialJumpScenarioKey
    ) {
      return;
    }

    battleSpectatorInitialJumpScenarioRef.current = initialJumpScenarioKey;
    focusBattleSpectatorView({
      point: latestBattleEngagementPoint,
      followTargetId: latestBattleEngagementPoint.followTargetId,
    });
  }, [
    battleSpectatorAutoCapture,
    battleSpectatorAutoPatrol,
    battleSpectatorRuntimeReady,
    latestBattleEngagementPoint,
    showBattleSpectator,
    visibleBattleSpectator,
  ]);

  useEffect(() => {
    if (!currentBattleSpectator) {
      setBattleSpectatorTrendHistory([]);
      return;
    }

    const nextEntry = buildBattleSpectatorSideTrendHistoryEntry(
      currentBattleSpectator
    );
    if (!nextEntry) {
      return;
    }

    setBattleSpectatorTrendHistory((currentHistory) => {
      if (currentHistory.length === 0) {
        return [nextEntry];
      }

      const lastEntry = currentHistory[currentHistory.length - 1];
      if (
        lastEntry.scenarioId === nextEntry.scenarioId &&
        lastEntry.signature === nextEntry.signature
      ) {
        return currentHistory;
      }

      const sameScenarioHistory = currentHistory.filter(
        (entry) => entry.scenarioId === nextEntry.scenarioId
      );

      return [...sameScenarioHistory, nextEntry].slice(-10);
    });
  }, [currentBattleSpectator]);

  useEffect(() => {
    setFlightSimFrameReady(false);
  }, [iframeSrc]);

  useEffect(() => {
    let ignore = false;

    const checkFlightSimBundle = async () => {
      setAssetState("checking");

      try {
        const response = await fetch(FLIGHT_SIM_ENTRY, { cache: "no-store" });
        if (!ignore) {
          setAssetState(response.ok ? "ready" : "missing");
        }
      } catch (_error) {
        if (!ignore) {
          setAssetState("missing");
        }
      }
    };

    void checkFlightSimBundle();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (assetState !== "ready") {
      setRuntimeProvider("checking");
      return;
    }

    const updateRuntimeProvider = () => {
      const iframeWindow = iframeRef.current?.contentWindow as
        | (Window & {
            __FLIGHT_SIM_RUNTIME__?: FlightSimRuntimeInfo;
          })
        | null
        | undefined;
      const runtimeSource = iframeWindow?.__FLIGHT_SIM_RUNTIME__ ?? null;
      const nextRuntimeInfo = runtimeSource
        ? (JSON.parse(JSON.stringify(runtimeSource)) as FlightSimRuntimeInfo)
        : null;
      const provider = nextRuntimeInfo?.mapProvider;
      setRuntimeInfo(nextRuntimeInfo);
      setRuntimeProvider(
        provider === "vworld-webgl" || provider === "cesium-fallback"
          ? provider
          : provider === "initializing"
            ? "checking"
            : "unknown"
      );
    };

    const intervalId = window.setInterval(updateRuntimeProvider, 250);
    updateRuntimeProvider();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [assetState, iframeSrc]);

  useEffect(() => {
    if (
      !game ||
      !battleSpectatorEnabled ||
      !continueSimulation ||
      !battleSpectatorRuntimeReady ||
      battleSpectatorScenarioRestartedRef.current
    ) {
      return;
    }

    battleSpectatorScenarioRestartedRef.current = true;
    const initialScenarioSnapshot =
      battleSpectatorInitialScenarioSnapshotRef.current;
    if (!initialScenarioSnapshot || typeof game.loadScenario !== "function") {
      return;
    }

    try {
      game.loadScenario(initialScenarioSnapshot);
    } catch (_error) {
      return;
    }

    const restartedBattleSpectatorState = buildBattleSpectatorState(
      game,
      continueSimulation,
      battleSpectator
    );
    battleSpectatorStateSignatureRef.current =
      buildBattleSpectatorStateSignature(restartedBattleSpectatorState);
    battleSpectatorRuntimeSignatureRef.current = "";
    battleSpectatorBriefingLogSignatureRef.current = "";
    battleSpectatorAutoCaptureKeyRef.current = "";
    battleSpectatorPatrolIndexRef.current = 0;
    battleSpectatorInitialJumpScenarioRef.current = "";
    battleSpectatorInitialFollowSeededRef.current = false;
    setCurrentBattleSpectator(restartedBattleSpectatorState);
    setBattleSpectatorFollowTargetId("");
    setBattleSpectatorBriefingLog([]);
    setBattleSpectatorTrendHistory([]);
    setCurrentFocusFireAirwatch(
      focusFireAirwatchEnabled
        ? buildFocusFireAirwatchState(
            game,
            continueSimulation,
            focusFireAirwatch
          )
        : undefined
    );
  }, [
    battleSpectator,
    battleSpectatorEnabled,
    battleSpectatorRuntimeReady,
    continueSimulation,
    focusFireAirwatch,
    focusFireAirwatchEnabled,
    game,
  ]);

  useEffect(() => {
    if (
      !showBattleSpectator ||
      !visibleBattleSpectator ||
      !battleSpectatorRuntimeReady
    ) {
      if (!showBattleSpectator || !battleSpectatorRuntimeReady) {
        battleSpectatorRuntimeSignatureRef.current = "";
      }
      return;
    }

    syncBattleSpectatorRuntime(
      visibleBattleSpectator,
      battleSpectatorFollowTargetId,
      battleSpectatorLodLevel,
      battleSpectatorCameraProfile
    );
  }, [
    battleSpectatorCameraProfile,
    battleSpectatorFollowTargetId,
    battleSpectatorLodLevel,
    battleSpectatorRuntimeReady,
    showBattleSpectator,
    visibleBattleSpectator,
  ]);

  useEffect(() => {
    if (
      !flightSimFrameReady ||
      !showFocusFireAirwatch ||
      !currentFocusFireAirwatch
    ) {
      return;
    }

    postRuntimeToFlightSim("vista-focus-fire-update", {
      objectiveName: currentFocusFireAirwatch.objectiveName,
      objectiveLon: currentFocusFireAirwatch.objectiveLon,
      objectiveLat: currentFocusFireAirwatch.objectiveLat,
      active: currentFocusFireAirwatch.active,
      captureProgress: currentFocusFireAirwatch.captureProgress,
      aircraftCount: currentFocusFireAirwatch.aircraftCount,
      artilleryCount: currentFocusFireAirwatch.artilleryCount,
      armorCount: currentFocusFireAirwatch.armorCount,
      weaponsInFlight: currentFocusFireAirwatch.weaponsInFlight,
      statusLabel: currentFocusFireAirwatch.statusLabel,
      launchPlatforms: currentFocusFireAirwatch.launchPlatforms,
      weaponTracks: currentFocusFireAirwatch.weaponTracks,
    });
  }, [currentFocusFireAirwatch, flightSimFrameReady, showFocusFireAirwatch]);

  useEffect(() => {
    if (!game || !battleSpectatorEnabled || !showBattleSpectator) {
      return;
    }

    let cancelled = false;

    const syncBattleSpectatorState = () => {
      if (cancelled || document.hidden) {
        return;
      }

      const nextBattleSpectatorState = buildBattleSpectatorState(
        game,
        continueSimulation
      );
      const nextSignature = buildBattleSpectatorStateSignature(
        nextBattleSpectatorState
      );

      if (battleSpectatorStateSignatureRef.current === nextSignature) {
        return;
      }

      battleSpectatorStateSignatureRef.current = nextSignature;
      setCurrentBattleSpectator(nextBattleSpectatorState);
    };

    syncBattleSpectatorState();
    const syncIntervalId = window.setInterval(syncBattleSpectatorState, 250);

    return () => {
      cancelled = true;
      window.clearInterval(syncIntervalId);
    };
  }, [battleSpectatorEnabled, continueSimulation, game, showBattleSpectator]);

  useEffect(() => {
    if (!game || !focusFireAirwatchEnabled || !showFocusFireAirwatch) {
      return;
    }

    let cancelled = false;

    const syncFocusFireState = () => {
      const summary = game.getFocusFireSummary();
      if (
        cancelled ||
        document.hidden ||
        summary.objectiveLatitude === null ||
        summary.objectiveLongitude === null
      ) {
        return;
      }

      setCurrentFocusFireAirwatch(
        buildFocusFireAirwatchState(game, continueSimulation)
      );
    };

    syncFocusFireState();
    const syncIntervalId = window.setInterval(syncFocusFireState, 250);

    return () => {
      cancelled = true;
      window.clearInterval(syncIntervalId);
    };
  }, [
    continueSimulation,
    focusFireAirwatchEnabled,
    game,
    showFocusFireAirwatch,
  ]);

  useEffect(() => {
    if (
      !game ||
      !continueSimulation ||
      (showBattleSpectator && !battleSpectatorRuntimeReady) ||
      typeof game.getGameEndState !== "function" ||
      typeof game.stepForTimeCompression !== "function" ||
      typeof game.recordStep !== "function"
    ) {
      return;
    }

    let cancelled = false;

    const runSimulation = async () => {
      let { terminated: gameTerminated, truncated: gameTruncated } =
        game.getGameEndState();
      let gameEnded = gameTerminated || gameTruncated;

      while (!cancelled && !game.scenarioPaused && !gameEnded) {
        const [, , terminated, truncated] = game.stepForTimeCompression();
        game.recordStep();
        gameTerminated = terminated;
        gameTruncated = truncated;
        gameEnded = gameTerminated || gameTruncated;
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }

      if (!cancelled && gameEnded) {
        const requestId = simulationOutcomeRequestIdRef.current + 1;
        simulationOutcomeRequestIdRef.current = requestId;
        const summary = buildSimulationOutcomeSummary(game);

        setSimulationOutcomeSummary(summary);
        setSimulationOutcomeNarrative(summary.fallbackSummary);
        setSimulationOutcomeNarrativeSource("fallback");
        setSimulationOutcomeLoading(true);
        setSimulationOutcomeOpen(true);

        const narrative = await requestSimulationOutcomeNarrative(summary);
        if (cancelled || simulationOutcomeRequestIdRef.current !== requestId) {
          return;
        }

        setSimulationOutcomeNarrative(narrative.text);
        setSimulationOutcomeNarrativeSource(narrative.source);
        setSimulationOutcomeLoading(false);
      }
    };

    void runSimulation();

    return () => {
      cancelled = true;
      simulationOutcomeRequestIdRef.current += 1;
    };
  }, [
    battleSpectatorRuntimeReady,
    battleSpectatorSimulationRevision,
    continueSimulation,
    game,
    showBattleSpectator,
  ]);
}
