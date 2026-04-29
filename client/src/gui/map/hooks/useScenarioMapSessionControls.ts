// @ts-nocheck

export function useScenarioMapSessionControls(ctx) {
  const {
    NaN, RL_CHECKPOINT_SPECTATOR_KEY, SIDE_COLOR,
    activeReplayMetrics, buildFacilityFormationLayout, buildFacilityPlacementGroupTeleportLayout,
    buildLiveCommentaryNotification, changeCursorType, clearDragSelection,
    createFacilityPlacementGroup, dragSelectedFeatures, facilityLayer,
    facilityPlacementGroups, facilityPlacementLayer, game,
    getDisplayName, getScenarioFacilityPlacementGroups, handlePlayRecordingClick,
    isMajorSimulationLog, lastObservedSimulationLogCountRef, lastObservedSimulationLogIdRef,
    lastSpectatedCheckpointKeyRef, liveCommentaryTimeoutsRef, loadFeatureEntitiesState,
    openFacilityCard, pendingFacilityPlacementRef, refreshAllLayers,
    refreshFacilityPlacementGroupLayer, removeFacility, resolveFacilityPlacementArcDegrees,
    resolveFacilityPlacementHeading, rlCheckpointSpectatorPollingTimeoutRef, rlCheckpointSpectatorRef,
    setActiveReplayMetric, setActiveReplayMetrics, setCurrentGameStatusToContext,
    setCurrentRecordingStepToContext, setCurrentScenarioSidesToContext, setCurrentScenarioTimeToContext,
    setDragSelectedFeatures, setFacilityPlacementGroups, setKeyboardShortcutsEnabled,
    setLiveCommentaryNotifications, setOpenFacilityCard, setPendingFacilityPlacement,
    setRecordingPlayerHasRecording, setScenarioFacilityPlacementGroups, setSelectedDragRecommendationTargetId,
    simulationOutcomeRequestIdRef, switchCurrentSide, teleportingFacilityGroupIdRef,
    teleportingUnitRef, theMap, threatPlacementLayer,
    toLonLat, toastContext, unitDbContext,
    updateCurrentSimulationLogsToContext, updateMapView, useEffect,
    useRef,
  } = ctx;

  useEffect(() => {
    return () => {
      simulationOutcomeRequestIdRef.current += 1;
      Object.values(liveCommentaryTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      if (rlCheckpointSpectatorPollingTimeoutRef.current !== null) {
        window.clearTimeout(rlCheckpointSpectatorPollingTimeoutRef.current);
      }
    };
  }, []);

  function getReplayMetricForStep(
    stepIndex: number,
    replayMetrics: FixedTargetStrikeReplayMetric[] | null = activeReplayMetrics
  ) {
    if (!replayMetrics || stepIndex < 0 || stepIndex >= replayMetrics.length) {
      return null;
    }
    return replayMetrics[stepIndex];
  }

  function setReplayState(
    replayMetrics: FixedTargetStrikeReplayMetric[] | null,
    stepIndex: number = 0
  ) {
    setActiveReplayMetrics(replayMetrics);
    setActiveReplayMetric(getReplayMetricForStep(stepIndex, replayMetrics));
  }

  function parseRlCheckpointSpectatorSession() {
    const rawValue = window.sessionStorage.getItem(RL_CHECKPOINT_SPECTATOR_KEY);
    if (!rawValue) {
      return null;
    }
    try {
      const parsed = JSON.parse(
        rawValue
      ) as Partial<RlCheckpointSpectatorSession>;
      const jobId = `${parsed.jobId ?? ""}`.trim();
      if (!jobId) {
        return null;
      }
      return {
        jobId,
        startedAt:
          typeof parsed.startedAt === "string" &&
          parsed.startedAt.trim().length > 0
            ? parsed.startedAt
            : undefined,
        lastReplayKey:
          typeof parsed.lastReplayKey === "string" &&
          parsed.lastReplayKey.trim().length > 0
            ? parsed.lastReplayKey
            : undefined,
      } satisfies RlCheckpointSpectatorSession;
    } catch {
      return null;
    }
  }

  function clearRlCheckpointSpectatorSession() {
    rlCheckpointSpectatorRef.current = null;
    lastSpectatedCheckpointKeyRef.current = null;
    window.sessionStorage.removeItem(RL_CHECKPOINT_SPECTATOR_KEY);
    if (rlCheckpointSpectatorPollingTimeoutRef.current !== null) {
      window.clearTimeout(rlCheckpointSpectatorPollingTimeoutRef.current);
      rlCheckpointSpectatorPollingTimeoutRef.current = null;
    }
  }

  function findLatestReplayableCheckpoint(
    checkpoints: unknown
  ): RlJobReplayableCheckpoint | null {
    if (!Array.isArray(checkpoints)) {
      return null;
    }

    let latestCheckpoint: RlJobReplayableCheckpoint | null = null;
    for (const checkpoint of checkpoints) {
      if (!checkpoint || typeof checkpoint !== "object") {
        continue;
      }
      const replayAvailable = Boolean(
        (checkpoint as Record<string, unknown>).replay_available
      );
      const recordingPath = (checkpoint as Record<string, unknown>)
        .recording_path;
      if (
        !replayAvailable ||
        typeof recordingPath !== "string" ||
        recordingPath.trim().length === 0
      ) {
        continue;
      }
      const algorithm =
        `${(checkpoint as Record<string, unknown>).algorithm ?? ""}`
          .trim()
          .toLowerCase();
      const timesteps = Number(
        (checkpoint as Record<string, unknown>).timesteps ?? NaN
      );
      if (!algorithm || !Number.isFinite(timesteps)) {
        continue;
      }
      if (
        latestCheckpoint === null ||
        timesteps >= latestCheckpoint.timesteps
      ) {
        latestCheckpoint = {
          algorithm,
          timesteps: Math.floor(timesteps),
          replay_available: true,
          recording_path: recordingPath,
        };
      }
    }

    return latestCheckpoint;
  }

  const facilityPlacementDefaultsRef =
    useRef<AssetPlacementDeploymentDefaults | null>(null);

  function clearPendingFacilityPlacement() {
    pendingFacilityPlacementRef.current = null;
    setPendingFacilityPlacement(null);
    facilityPlacementLayer.clearPreview();
    threatPlacementLayer.clearPreview();
  }

  function clearPendingFacilityGroupTeleport() {
    teleportingFacilityGroupIdRef.current = null;
    refreshFacilityPlacementGroupLayer();
  }

  function getCurrentFacilityIds() {
    return game.currentScenario.facilities.map((facility) => facility.id);
  }

  function persistFacilityPlacementGroups(groups: FacilityPlacementGroup[]) {
    const activeFacilityIds = getCurrentFacilityIds();
    game.currentScenario.metadata = setScenarioFacilityPlacementGroups(
      game.currentScenario.metadata,
      groups,
      activeFacilityIds
    );
    const persistedGroups = getScenarioFacilityPlacementGroups(
      game.currentScenario.metadata,
      activeFacilityIds
    );
    setFacilityPlacementGroups(persistedGroups);
    return persistedGroups;
  }

  function loadFacilityPlacementGroupsFromScenario() {
    const loadedGroups = getScenarioFacilityPlacementGroups(
      game.currentScenario.metadata,
      getCurrentFacilityIds()
    );
    return persistFacilityPlacementGroups(loadedGroups);
  }

  function buildFacilityPlacementGroupLabel(
    className: string,
    memberCount: number,
    templateLabel?: string
  ) {
    const formationLabel = templateLabel ?? `${memberCount}포대 분산`;
    return `${getDisplayName(className)} · ${formationLabel}`;
  }

  function getFacilityFeaturesByIds(facilityIds: string[]) {
    return facilityIds
      .map((facilityId) => facilityLayer.findFeatureByKey("id", facilityId))
      .filter((feature): feature is Feature<Geometry> => Boolean(feature));
  }

  function closeFacilityCard() {
    setOpenFacilityCard({
      open: false,
      top: 0,
      left: 0,
      facilityId: "",
    });
    setKeyboardShortcutsEnabled(true);
  }

  function registerFacilityPlacementGroup(
    facilities: Facility[],
    templateLabel?: string
  ) {
    if (facilities.length < 2) {
      return null;
    }

    const nextGroup = createFacilityPlacementGroup(
      facilities.map((facility) => facility.id),
      buildFacilityPlacementGroupLabel(
        facilities[0]?.className ?? "Facility",
        facilities.length,
        templateLabel
      )
    );

    const nextGroups = [
      nextGroup,
      ...facilityPlacementGroups
        .map((group) => ({
          ...group,
          facilityIds: group.facilityIds.filter(
            (facilityId) => !nextGroup.facilityIds.includes(facilityId)
          ),
        }))
        .filter((group) => group.facilityIds.length > 1),
    ];
    persistFacilityPlacementGroups(nextGroups);

    return nextGroup;
  }

  function selectFacilityPlacementGroup(
    groupOrId: string | FacilityPlacementGroup
  ) {
    const group =
      typeof groupOrId === "string"
        ? facilityPlacementGroups.find((entry) => entry.id === groupOrId)
        : groupOrId;
    if (!group) {
      return;
    }

    const features = getFacilityFeaturesByIds(group.facilityIds);
    if (features.length === 0) {
      return;
    }

    setDragSelectedFeatures(features);
    setSelectedDragRecommendationTargetId(null);
    setCurrentGameStatusToContext(
      `${group.facilityIds.length}개 포대 묶음을 선택했습니다.`
    );
  }

  function queueFacilityPlacementGroupForTeleport(groupId: string) {
    const group = facilityPlacementGroups.find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }

    clearPendingFacilityPlacement();
    facilityPlacementDefaultsRef.current = null;
    game.addingFacility = false;
    clearPendingFacilityGroupTeleport();
    game.selectedUnitId = "";
    teleportingUnitRef.current = false;
    teleportingFacilityGroupIdRef.current = groupId;
    refreshFacilityPlacementGroupLayer();
    changeCursorType("");
    setCurrentGameStatusToContext(
      `지도를 클릭해 ${group.facilityIds.length}개 포대 묶음을 평행 이동하세요.`
    );
  }

  function removeFacilityPlacementGroup(groupId: string) {
    const group = facilityPlacementGroups.find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }

    const activeFacilityIds = group.facilityIds.filter((facilityId) =>
      Boolean(game.currentScenario.getFacility(facilityId))
    );
    if (activeFacilityIds.length === 0) {
      persistFacilityPlacementGroups(
        facilityPlacementGroups.filter((entry) => entry.id !== groupId)
      );
      return;
    }

    if (
      openFacilityCard.open &&
      activeFacilityIds.includes(openFacilityCard.facilityId)
    ) {
      closeFacilityCard();
    }

    if (
      dragSelectedFeatures.length > 0 &&
      dragSelectedFeatures.some((feature) =>
        activeFacilityIds.includes(feature.get("id"))
      )
    ) {
      clearDragSelection();
    }

    if (
      game.selectedUnitId &&
      activeFacilityIds.includes(game.selectedUnitId)
    ) {
      game.selectedUnitId = "";
    }

    clearPendingFacilityGroupTeleport();
    activeFacilityIds.forEach((facilityId) => {
      removeFacility(facilityId, true);
    });
    persistFacilityPlacementGroups(
      facilityPlacementGroups.filter((entry) => entry.id !== groupId)
    );
    toastContext?.addToast(
      `${group.label} 묶음 ${activeFacilityIds.length}개를 삭제했습니다.`
    );
  }

  function teleportFacilityPlacementGroup(
    groupId: string,
    coordinates: number[]
  ) {
    const group = facilityPlacementGroups.find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }

    const facilities = group.facilityIds
      .map((facilityId) => game.currentScenario.getFacility(facilityId))
      .filter((facility): facility is Facility => Boolean(facility));
    if (facilities.length === 0) {
      persistFacilityPlacementGroups(
        facilityPlacementGroups.filter((entry) => entry.id !== groupId)
      );
      return;
    }

    const destination = toLonLat(coordinates, theMap.getView().getProjection());
    const nextPositions = buildFacilityPlacementGroupTeleportLayout(
      facilities,
      destination[1],
      destination[0]
    );
    nextPositions.forEach((position) => {
      game.teleportUnit(position.id, position.latitude, position.longitude);
    });
    refreshAllLayers();
    loadFeatureEntitiesState();
    selectFacilityPlacementGroup(groupId);
    toastContext?.addToast(
      `${group.label} 묶음 ${nextPositions.length}개를 이동했습니다.`
    );
  }

  function dismissLiveCommentaryNotification(id: string) {
    const timeoutId = liveCommentaryTimeoutsRef.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete liveCommentaryTimeoutsRef.current[id];
    }

    setLiveCommentaryNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }

  function clearLiveCommentaryNotifications() {
    Object.values(liveCommentaryTimeoutsRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    liveCommentaryTimeoutsRef.current = {};
    setLiveCommentaryNotifications([]);
  }

  function syncLiveCommentaryNotifications(
    logs: SimulationLog[],
    options?: {
      announceLiveCommentary?: boolean;
      clearExistingLiveCommentary?: boolean;
    }
  ) {
    if (options?.clearExistingLiveCommentary) {
      clearLiveCommentaryNotifications();
    }

    if (logs.length === 0) {
      lastObservedSimulationLogCountRef.current = 0;
      lastObservedSimulationLogIdRef.current = null;
      return;
    }

    const previousCount = lastObservedSimulationLogCountRef.current;
    const previousLastId = lastObservedSimulationLogIdRef.current;
    let newLogs: SimulationLog[] = [];

    if (previousCount === 0) {
      newLogs = logs;
    } else if (previousLastId) {
      const previousLastIndex = logs.findIndex(
        (log) => log.id === previousLastId
      );
      if (previousLastIndex >= 0) {
        newLogs = logs.slice(previousLastIndex + 1);
      }
    }

    lastObservedSimulationLogCountRef.current = logs.length;
    lastObservedSimulationLogIdRef.current = logs[logs.length - 1]?.id ?? null;

    if (options?.announceLiveCommentary === false || newLogs.length === 0) {
      return;
    }

    const notifications = newLogs
      .filter((log) => isMajorSimulationLog(log))
      .map((log) =>
        buildLiveCommentaryNotification(
          log,
          game.currentScenario.getSideName(log.sideId),
          game.currentScenario.getSideColor(log.sideId) ?? SIDE_COLOR.BLACK
        )
      );

    if (notifications.length === 0) {
      return;
    }

    setLiveCommentaryNotifications((prevNotifications) => {
      const existingIds = new Set(
        notifications.map((notification) => notification.id)
      );
      return [
        ...prevNotifications.filter(
          (notification) => !existingIds.has(notification.id)
        ),
        ...notifications,
      ].slice(-4);
    });

    notifications.forEach((notification, index) => {
      const existingTimeoutId =
        liveCommentaryTimeoutsRef.current[notification.id];
      if (existingTimeoutId) {
        window.clearTimeout(existingTimeoutId);
      }

      liveCommentaryTimeoutsRef.current[notification.id] = window.setTimeout(
        () => {
          dismissLiveCommentaryNotification(notification.id);
        },
        8200 + index * 350
      );
    });
  }

  function getPendingFacilityPlacementPreview(
    directionCoordinates: number[]
  ): FacilityPlacementPreview | null {
    const originCoordinates = pendingFacilityPlacementRef.current;
    if (!originCoordinates) {
      return null;
    }

    const unitClassSelected = game.selectedUnitClassName;
    const facilityTemplate = unitDbContext
      .getFacilityDb()
      .find((facility) => facility.className === unitClassSelected);
    if (!facilityTemplate?.className) {
      return null;
    }

    const [originLongitude, originLatitude] = toLonLat(
      originCoordinates,
      theMap.getView().getProjection()
    );
    const [directionLongitude, directionLatitude] = toLonLat(
      directionCoordinates,
      theMap.getView().getProjection()
    );
    const heading = resolveFacilityPlacementHeading(
      originLatitude,
      originLongitude,
      directionLatitude,
      directionLongitude,
      facilityPlacementDefaultsRef.current
    );

    return {
      latitude: originLatitude,
      longitude: originLongitude,
      heading,
      className: facilityTemplate.className,
      sideColor: game.currentScenario.getSideColor(game.currentSideId),
      range: facilityTemplate.range,
      detectionArcDegrees: resolveFacilityPlacementArcDegrees(
        facilityTemplate.detectionArcDegrees,
        facilityPlacementDefaultsRef.current
      ),
    };
  }

  function getPendingFacilityPlacementPreviews(directionCoordinates: number[]) {
    const preview = getPendingFacilityPlacementPreview(directionCoordinates);
    if (!preview) {
      return null;
    }

    return buildFacilityFormationLayout(
      preview.latitude,
      preview.longitude,
      preview.heading,
      facilityPlacementDefaultsRef.current
    ).map((layoutEntry) => ({
      ...preview,
      latitude: layoutEntry.latitude,
      longitude: layoutEntry.longitude,
      heading: layoutEntry.heading,
    }));
  }

  function updatePendingFacilityPlacementPreview(
    directionCoordinates: number[]
  ) {
    const previews = getPendingFacilityPlacementPreviews(directionCoordinates);
    if (!previews) {
      return;
    }

    facilityPlacementLayer.showPreview(previews);
    threatPlacementLayer.showPreview(previews);
  }

  function clearRecordingPlayer() {
    game.recordingPlayer.clear();
    setRecordingPlayerHasRecording(game.recordingPlayer.hasRecording());
    setCurrentRecordingStepToContext(0);
  }

  function exitReplayMode() {
    clearRlCheckpointSpectatorSession();
    setReplayState(null);
    clearRecordingPlayer();
  }

  function loadRecordingContent(
    content: string,
    options?: {
      replayMetrics?: FixedTargetStrikeReplayMetric[] | null;
      successMessage?: string;
      gameStatus?: string;
      autoPlay?: boolean;
    }
  ) {
    if (!game.recordingPlayer.loadRecording(content)) {
      return false;
    }

    setReplayState(
      options?.replayMetrics ?? null,
      game.recordingPlayer.getCurrentStepIndex()
    );
    setRecordingPlayerHasRecording(game.recordingPlayer.hasRecording());
    game.loadScenario(game.recordingPlayer.getCurrentStep());
    refreshAllLayers();
    updateMapView(
      game.mapView.currentCameraCenter,
      game.mapView.currentCameraZoom
    );
    switchCurrentSide(game.currentSideId);
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
    updateCurrentSimulationLogsToContext({
      announceLiveCommentary: false,
      clearExistingLiveCommentary: true,
    });
    setCurrentScenarioSidesToContext([...game.currentScenario.sides]);
    setCurrentRecordingStepToContext(
      game.recordingPlayer.getCurrentStepIndex()
    );
    loadFeatureEntitiesState();
    if (options?.gameStatus) {
      setCurrentGameStatusToContext(options.gameStatus);
    }
    if (options?.successMessage) {
      toastContext?.addToast(options.successMessage, "success");
    }
    if (options?.autoPlay) {
      window.setTimeout(() => {
        void handlePlayRecordingClick();
      }, 0);
    }
    return true;
  }


  return {
    buildFacilityPlacementGroupLabel, clearLiveCommentaryNotifications, clearPendingFacilityGroupTeleport,
    clearPendingFacilityPlacement, clearRecordingPlayer, clearRlCheckpointSpectatorSession,
    closeFacilityCard, dismissLiveCommentaryNotification, exitReplayMode,
    facilityPlacementDefaultsRef, findLatestReplayableCheckpoint, getCurrentFacilityIds,
    getFacilityFeaturesByIds, getPendingFacilityPlacementPreview, getPendingFacilityPlacementPreviews,
    getReplayMetricForStep, loadFacilityPlacementGroupsFromScenario, loadRecordingContent,
    parseRlCheckpointSpectatorSession, persistFacilityPlacementGroups, queueFacilityPlacementGroupForTeleport,
    registerFacilityPlacementGroup, removeFacilityPlacementGroup, selectFacilityPlacementGroup,
    setReplayState, syncLiveCommentaryNotifications, teleportFacilityPlacementGroup,
    updatePendingFacilityPlacementPreview,
  };
}
