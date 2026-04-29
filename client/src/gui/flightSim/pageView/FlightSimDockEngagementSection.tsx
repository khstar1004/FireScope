// @ts-nocheck

export default function FlightSimDockEngagementSection({ ctx }) {
  const {
    BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS,
    BATTLE_SPECTATOR_LOD_OPTIONS,
    BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS,
    BattleSpectatorHeroViewport,
    BattleSpectatorScenarioSidebar,
    Box,
    Button,
    CircularProgress,
    DocumentScannerOutlinedIcon,
    EntityIcon,
    JET_CRAFT_CATALOG,
    ListItemIcon,
    ListItemText,
    MenuItem,
    SimulationOutcomeDialog,
    Stack,
    ToolbarCollapsible,
    Typography,
    applyBattleSpectatorFollowTargetSelection,
    battleSpectatorActivitySummary,
    battleSpectatorAlertRows,
    battleSpectatorAnalysisSectionRef,
    battleSpectatorAssetRiskRows,
    battleSpectatorAutoCapture,
    battleSpectatorAutoPatrol,
    battleSpectatorBriefing,
    battleSpectatorBriefingLog,
    battleSpectatorBriefingSectionRef,
    battleSpectatorCameraProfile,
    battleSpectatorCameraProfileOption,
    battleSpectatorDockTab,
    battleSpectatorEnabled,
    battleSpectatorEngagementSectionRef,
    battleSpectatorFollowTargetId,
    battleSpectatorFollowTargetLabel,
    battleSpectatorHasScenarioControls,
    battleSpectatorHeroView,
    battleSpectatorHighlightedPatrolTarget,
    battleSpectatorHighlightedPatrolTargetId,
    battleSpectatorHotspotRows,
    battleSpectatorImpactTimelineRows,
    battleSpectatorInitiativeSummary,
    battleSpectatorLodLevel,
    battleSpectatorOverviewPoint,
    battleSpectatorOverviewSectionRef,
    battleSpectatorPanelOpen,
    battleSpectatorPatrolIndexRef,
    battleSpectatorPatrolTargets,
    battleSpectatorPresetListExpanded,
    battleSpectatorPriorityFilter,
    battleSpectatorPriorityFilterOption,
    battleSpectatorScenarioFileInputRef,
    battleSpectatorScenarioName,
    battleSpectatorScenarioPaused,
    battleSpectatorScenarioTimeCompression,
    battleSpectatorSideFilter,
    battleSpectatorSideOptions,
    battleSpectatorSideTrendRows,
    battleSpectatorSidebarEntries,
    battleSpectatorTempoRows,
    battleSpectatorThreatRows,
    battleSpectatorTrajectoryRows,
    buildBattleSpectatorPowerHistoryBars,
    closeBattleSpectatorHeroView,
    closeBattleSpectatorPanelOnMobile,
    currentBattleSpectator,
    currentFocusFireAirwatch,
    displayedBattleSpectator,
    filteredBattleSpectatorAssetRiskRows,
    filteredBattleSpectatorImpactTimelineRows,
    filteredBattleSpectatorTrajectoryRows,
    focusBattleSpectatorPatrolTarget,
    focusBattleSpectatorSidebarEntry,
    focusBattleSpectatorView,
    focusFireInsight,
    followTargetOptions,
    formatBattleSpectatorCameraProfileLabel,
    formatBattleSpectatorDistanceKm,
    formatBattleSpectatorEntityType,
    formatBattleSpectatorEta,
    formatBattleSpectatorFuelFraction,
    formatBattleSpectatorHeading,
    formatBattleSpectatorHp,
    formatBattleSpectatorRangeNm,
    formatBattleSpectatorThreatRadius,
    formatBattleSpectatorTimestamp,
    formatScriptStatus,
    formatViewerStatus,
    game,
    getBattleSpectatorHpTone,
    getBattleSpectatorPatrolTargetTone,
    getBattleSpectatorSideCssColor,
    getBattleSpectatorTrendTone,
    handleBattleSpectatorExportScenario,
    handleBattleSpectatorFocusObjective,
    handleBattleSpectatorNewScenario,
    handleBattleSpectatorRenameScenario,
    handleBattleSpectatorRestartScenario,
    handleBattleSpectatorScenarioFileChange,
    handleBattleSpectatorStepScenario,
    handleBattleSpectatorTogglePlay,
    handleBattleSpectatorToggleTimeCompression,
    hasInitialStartLocation,
    iframeRef,
    iframeSrc,
    inspectedBattleSpectatorTarget,
    inspectedBattleSpectatorTargetIconType,
    inspectedBattleSpectatorTargetTone,
    latestBattleEngagementPoint,
    latestBattleSpectatorWeapon,
    loadBattleSpectatorPresetScenario,
    loadingOverlayVisible,
    loadingStatusLabel,
    onBack,
    openBattleSpectatorHeroView,
    resolveBattleSpectatorEventJumpPoint,
    resolveBattleSpectatorSideJumpPoint,
    resolveBattleSpectatorUnitCameraProfile,
    resolveBattleSpectatorUnitFocusFraming,
    resolveBattleSpectatorUnitJumpPoint,
    resolveBattleSpectatorWeaponFocusFraming,
    resolveBattleSpectatorWeaponJumpPoint,
    runtimeInfo,
    runtimeProviderLabel,
    runtimeProviderTone,
    selectedBattleSpectatorInsight,
    selectedBattleSpectatorUnit,
    selectedCraftCopy,
    selectedFlightSimTitle,
    selectedJetCraft,
    selectedJetCraftId,
    selectedMode,
    setBattleSpectatorAutoCapture,
    setBattleSpectatorAutoPatrol,
    setBattleSpectatorCameraProfile,
    setBattleSpectatorDockTab,
    setBattleSpectatorFollowTargetId,
    setBattleSpectatorHighlightedPatrolTargetId,
    setBattleSpectatorLodLevel,
    setBattleSpectatorPanelOpen,
    setBattleSpectatorPresetListExpanded,
    setBattleSpectatorPriorityFilter,
    setBattleSpectatorSideFilter,
    setFlightSimFrameReady,
    setSelectedJetCraftId,
    setSelectedMode,
    setSimulationOutcomeOpen,
    showBattleSpectator,
    showFocusFireAirwatch,
    simulationOutcomeLoading,
    simulationOutcomeNarrative,
    simulationOutcomeNarrativeSource,
    simulationOutcomeOpen,
    simulationOutcomeSummary,
    startsInKorea,
    stepBattleSpectatorPatrol,
    visibleBattleSpectator,
    visibleBattleSpectatorScenarioPresets,
  } = ctx;

  return (
    <>
            <Box
              ref={battleSpectatorEngagementSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            <Box
              sx={{
                mt: 1.2,
                p: 1.1,
                borderRadius: 1.8,
                backgroundColor: "rgba(6, 19, 22, 0.76)",
                border: "1px solid rgba(98, 230, 208, 0.1)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                세력 필터
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                <Button
                  size="small"
                  variant={
                    battleSpectatorSideFilter === "all"
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setBattleSpectatorSideFilter("all")}
                  sx={{
                    minWidth: 0,
                    color:
                      battleSpectatorSideFilter === "all"
                        ? "#041215"
                        : "#ecfffb",
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    backgroundColor:
                      battleSpectatorSideFilter === "all"
                        ? "#62e6d0"
                        : "rgba(8, 24, 29, 0.76)",
                  }}
                >
                  전체
                </Button>
                {battleSpectatorSideOptions.map((side) => (
                  <Button
                    key={side.id}
                    size="small"
                    variant={
                      battleSpectatorSideFilter === side.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setBattleSpectatorSideFilter(side.id)}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorSideFilter === side.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      backgroundColor:
                        battleSpectatorSideFilter === side.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.76)",
                    }}
                  >
                    {side.name}
                  </Button>
                ))}
              </Stack>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                추적 대상
              </Typography>
              <Box
                component="select"
                value={battleSpectatorFollowTargetId}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  setBattleSpectatorHighlightedPatrolTargetId("");
                  applyBattleSpectatorFollowTargetSelection(
                    event.target.value,
                    visibleBattleSpectator,
                    battleSpectatorCameraProfile,
                    setBattleSpectatorFollowTargetId,
                    setBattleSpectatorCameraProfile
                  );
                }}
                sx={{
                  mt: 0.7,
                  width: "100%",
                  px: 1.1,
                  py: 0.9,
                  borderRadius: 1.5,
                  border: "1px solid rgba(98, 230, 208, 0.22)",
                  backgroundColor: "rgba(7, 19, 24, 0.94)",
                  color: "#ecfffb",
                }}
              >
                <option value="">자유 시점</option>
                {followTargetOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Box>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                시점 프로파일
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                {BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    size="small"
                    variant={
                      battleSpectatorCameraProfile === option.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setBattleSpectatorCameraProfile(option.id)}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorCameraProfile === option.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      backgroundColor:
                        battleSpectatorCameraProfile === option.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.76)",
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                LOD
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                {BATTLE_SPECTATOR_LOD_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    size="small"
                    variant={
                      battleSpectatorLodLevel === option.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setBattleSpectatorLodLevel(option.id)}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorLodLevel === option.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      backgroundColor:
                        battleSpectatorLodLevel === option.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.76)",
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 1.15, flexWrap: "wrap" }}
              >
                <Button
                  size="small"
                  variant="contained"
                  disabled={!selectedBattleSpectatorUnit}
                  onClick={() => {
                    if (!selectedBattleSpectatorUnit) {
                      return;
                    }
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    setBattleSpectatorSideFilter(
                      selectedBattleSpectatorUnit.sideId
                    );
                    applyBattleSpectatorFollowTargetSelection(
                      `unit:${selectedBattleSpectatorUnit.id}`,
                      visibleBattleSpectator,
                      battleSpectatorCameraProfile,
                      setBattleSpectatorFollowTargetId,
                      setBattleSpectatorCameraProfile
                    );
                    closeBattleSpectatorPanelOnMobile();
                  }}
                  sx={{
                    backgroundColor: "#62e6d0",
                    color: "#041215",
                    "&:hover": {
                      backgroundColor: "#84f2df",
                    },
                  }}
                >
                  선택 유닛 추적
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!latestBattleEngagementPoint}
                  onClick={() => {
                    if (!latestBattleEngagementPoint) {
                      return;
                    }
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    focusBattleSpectatorView({
                      point: latestBattleEngagementPoint,
                      followTargetId:
                        latestBattleEngagementPoint.followTargetId,
                    });
                  }}
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                  }}
                >
                  최신 교전으로 점프
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!latestBattleSpectatorWeapon}
                  onClick={() => {
                    if (!latestBattleSpectatorWeapon) {
                      return;
                    }
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    focusBattleSpectatorView({
                      point: resolveBattleSpectatorWeaponJumpPoint(
                        latestBattleSpectatorWeapon
                      ),
                      followTargetId: `weapon:${latestBattleSpectatorWeapon.id}`,
                    });
                  }}
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                  }}
                >
                  활성 탄체 추적
                </Button>
                <Button
                  size="small"
                  variant={
                    battleSpectatorAutoCapture ? "contained" : "outlined"
                  }
                  onClick={() =>
                    setBattleSpectatorAutoCapture((currentValue) => {
                      const nextValue = !currentValue;
                      if (nextValue) {
                        setBattleSpectatorAutoPatrol(false);
                      }
                      return nextValue;
                    })
                  }
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: battleSpectatorAutoCapture ? "#041215" : "#ecfffb",
                    backgroundColor: battleSpectatorAutoCapture
                      ? "#62e6d0"
                      : "rgba(8, 24, 29, 0.76)",
                    "&:hover": {
                      backgroundColor: battleSpectatorAutoCapture
                        ? "#84f2df"
                        : "rgba(11, 31, 37, 0.9)",
                    },
                  }}
                >
                  자동 포착
                </Button>
                <Button
                  size="small"
                  variant={battleSpectatorAutoPatrol ? "contained" : "outlined"}
                  disabled={battleSpectatorPatrolTargets.length === 0}
                  onClick={() =>
                    setBattleSpectatorAutoPatrol((currentValue) => {
                      const nextValue = !currentValue;
                      if (nextValue) {
                        setBattleSpectatorAutoCapture(false);
                      }
                      return nextValue;
                    })
                  }
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: battleSpectatorAutoPatrol ? "#041215" : "#ecfffb",
                    backgroundColor: battleSpectatorAutoPatrol
                      ? "#62e6d0"
                      : "rgba(8, 24, 29, 0.76)",
                    "&:hover": {
                      backgroundColor: battleSpectatorAutoPatrol
                        ? "#84f2df"
                        : "rgba(11, 31, 37, 0.9)",
                    },
                  }}
                >
                  자동 순회
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={battleSpectatorPatrolTargets.length === 0}
                  onClick={() => {
                    if (battleSpectatorAutoPatrol) {
                      setBattleSpectatorAutoPatrol(false);
                    }
                    stepBattleSpectatorPatrol();
                  }}
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                  }}
                >
                  다음 순회
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setBattleSpectatorFollowTargetId("");
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    closeBattleSpectatorPanelOnMobile();
                  }}
                  disabled={!battleSpectatorFollowTargetId}
                  sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                >
                  자유 시점
                </Button>
              </Stack>
              {battleSpectatorPatrolTargets.length > 0 && (
                <Box
                  sx={{
                    mt: 1.15,
                    p: 1.1,
                    borderRadius: 1.8,
                    backgroundColor: "rgba(6, 19, 22, 0.76)",
                    border: "1px solid rgba(98, 230, 208, 0.1)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ gap: 1, flexWrap: "wrap" }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        letterSpacing: "0.14em",
                        color: "rgba(98, 230, 208, 0.84)",
                      }}
                    >
                      관전 큐
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "rgba(236, 255, 251, 0.66)",
                      }}
                    >
                      자동 순회용 시점 {battleSpectatorPatrolTargets.length}개
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                      mt: 0.9,
                      flexWrap: "wrap",
                      rowGap: 0.75,
                    }}
                  >
                    {battleSpectatorPatrolTargets.map((target, index) => {
                      const active =
                        battleSpectatorHighlightedPatrolTargetId === target.id;
                      const tone = getBattleSpectatorPatrolTargetTone(
                        target.kind
                      );

                      return (
                        <Button
                          key={target.id}
                          size="small"
                          variant={active ? "contained" : "outlined"}
                          onClick={() => {
                            battleSpectatorPatrolIndexRef.current = index;
                            focusBattleSpectatorPatrolTarget(target, {
                              preservePanel: true,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            color: active ? "#041215" : tone,
                            borderColor: `${tone}55`,
                            backgroundColor: active
                              ? tone
                              : "rgba(8, 24, 29, 0.76)",
                            "&:hover": {
                              backgroundColor: active ? tone : `${tone}18`,
                              borderColor: tone,
                            },
                          }}
                        >
                          {target.label}
                        </Button>
                      );
                    })}
                  </Stack>
                  <Typography
                    sx={{
                      mt: 0.85,
                      fontSize: 11.5,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorHighlightedPatrolTarget
                      ? `${battleSpectatorHighlightedPatrolTarget.label} · ${battleSpectatorHighlightedPatrolTarget.detail}`
                      : "드론, 전차, 포대, 타격 지점 같은 핵심 장면을 한 바퀴씩 빠르게 순환합니다."}
                  </Typography>
                </Box>
              )}
              <Typography
                sx={{
                  mt: 0.9,
                  fontSize: 12,
                  color: "rgba(236, 255, 251, 0.68)",
                }}
              >
                표시 유닛 {visibleBattleSpectator?.units.length ?? 0} · 표시
                탄체 {visibleBattleSpectator?.weapons.length ?? 0} · 자동 포착{" "}
                {battleSpectatorAutoCapture ? "ON" : "OFF"} · 자동 순회{" "}
                {battleSpectatorAutoPatrol ? "ON" : "OFF"} · 타격 필터{" "}
                {battleSpectatorPriorityFilterOption.label}
              </Typography>
            </Box>
            {(battleSpectatorTrajectoryRows.length > 0 ||
              battleSpectatorImpactTimelineRows.length > 0 ||
              battleSpectatorAssetRiskRows.length > 0) && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.1,
                  borderRadius: 1.8,
                  backgroundColor: "rgba(6, 19, 22, 0.76)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  타격 우선 필터
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ mt: 0.8, flexWrap: "wrap" }}
                >
                  {BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      size="small"
                      variant={
                        battleSpectatorPriorityFilter === option.id
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() =>
                        setBattleSpectatorPriorityFilter(option.id)
                      }
                      sx={{
                        minWidth: 0,
                        color:
                          battleSpectatorPriorityFilter === option.id
                            ? "#041215"
                            : "#ecfffb",
                        borderColor: "rgba(98, 230, 208, 0.24)",
                        backgroundColor:
                          battleSpectatorPriorityFilter === option.id
                            ? "#62e6d0"
                            : "rgba(8, 24, 29, 0.76)",
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorTrajectoryRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    탄체 궤적 관제
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "rgba(98, 230, 208, 0.12)",
                      color: "#62e6d0",
                    }}
                  >
                    유도 궤적 {filteredBattleSpectatorTrajectoryRows.length}
                    {battleSpectatorPriorityFilter !== "all"
                      ? ` / ${battleSpectatorTrajectoryRows.length}`
                      : ""}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.8)",
                  }}
                >
                  표시 {filteredBattleSpectatorTrajectoryRows.length} · 종말
                  단계{" "}
                  {
                    filteredBattleSpectatorTrajectoryRows.filter(
                      (row) => row.phaseLabel === "종말"
                    ).length
                  }{" "}
                  · 60초 이내{" "}
                  {
                    filteredBattleSpectatorTrajectoryRows.filter(
                      (row) =>
                        typeof row.timeToImpactSec === "number" &&
                        row.timeToImpactSec <= 60
                    ).length
                  }{" "}
                  · 중간 단계{" "}
                  {
                    filteredBattleSpectatorTrajectoryRows.filter(
                      (row) => row.phaseLabel === "중간"
                    ).length
                  }{" "}
                  · 최신 탄체{" "}
                  {latestBattleSpectatorWeapon
                    ? latestBattleSpectatorWeapon.name
                    : "없음"}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ mt: 0.85, flexWrap: "wrap" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!battleSpectatorOverviewPoint}
                    onClick={() => {
                      if (!battleSpectatorOverviewPoint) {
                        return;
                      }
                      focusBattleSpectatorView({
                        point: battleSpectatorOverviewPoint,
                        followTargetId: "",
                      });
                    }}
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      color: "#ecfffb",
                    }}
                  >
                    전장 개관
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    disabled={!latestBattleSpectatorWeapon}
                    onClick={() => {
                      if (!latestBattleSpectatorWeapon) {
                        return;
                      }
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorWeaponJumpPoint(
                          latestBattleSpectatorWeapon
                        ),
                        followTargetId: `weapon:${latestBattleSpectatorWeapon.id}`,
                      });
                    }}
                    sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                  >
                    최신 궤적 고정
                  </Button>
                </Stack>
                {filteredBattleSpectatorTrajectoryRows.length > 0 ? (
                  <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                    {filteredBattleSpectatorTrajectoryRows.map((row, index) => (
                      <Box
                        key={row.weapon.id}
                        sx={{
                          px: 1,
                          py: 0.95,
                          borderRadius: 1.6,
                          backgroundColor: "rgba(8, 24, 29, 0.78)",
                          border: "1px solid rgba(98, 230, 208, 0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: "rgba(98, 230, 208, 0.82)",
                                letterSpacing: "0.08em",
                              }}
                            >
                              #{index + 1} · {row.weapon.sideName}
                            </Typography>
                            <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                              {row.weapon.name}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              px: 0.85,
                              py: 0.35,
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor: "rgba(98, 230, 208, 0.12)",
                              color: "#62e6d0",
                            }}
                          >
                            {row.phaseLabel}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            mt: 0.55,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.72)",
                          }}
                        >
                          발사 {row.launcherName} →{" "}
                          {row.targetName ?? row.targetTypeLabel} · 남은 거리{" "}
                          {formatBattleSpectatorDistanceKm(
                            row.remainingDistanceKm
                          )}
                          {typeof row.progressPercent === "number"
                            ? ` · 진행 ${Math.round(row.progressPercent)}%`
                            : ""}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.68)",
                          }}
                        >
                          현재 고도 {Math.round(row.weapon.altitudeMeters)}m ·
                          속도 {Math.round(row.weapon.speedKts)}kt · 총 비행
                          거리{" "}
                          {formatBattleSpectatorDistanceKm(row.totalDistanceKm)}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.68)",
                          }}
                        >
                          도달 예상{" "}
                          {formatBattleSpectatorEta(row.timeToImpactSec)} · 위험
                          반경{" "}
                          {formatBattleSpectatorThreatRadius(
                            row.threatRadiusMeters
                          )}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              focusBattleSpectatorView({
                                point: resolveBattleSpectatorWeaponJumpPoint(
                                  row.weapon
                                ),
                                followTargetId: `weapon:${row.weapon.id}`,
                              })
                            }
                            sx={{
                              borderColor: "rgba(98, 230, 208, 0.24)",
                              color: "#ecfffb",
                            }}
                          >
                            궤적 추적
                          </Button>
                          {row.targetPoint && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                const targetPoint = row.targetPoint;
                                if (!targetPoint) {
                                  return;
                                }
                                focusBattleSpectatorView({
                                  point: {
                                    longitude: targetPoint.longitude,
                                    latitude: targetPoint.latitude,
                                    altitudeMeters: Math.max(
                                      1800,
                                      targetPoint.altitudeMeters + 1800
                                    ),
                                  },
                                  followTargetId:
                                    typeof row.weapon.targetId === "string"
                                      ? `unit:${row.weapon.targetId}`
                                      : undefined,
                                });
                              }}
                              sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                            >
                              예상 착탄점
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    sx={{
                      mt: 0.9,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorPriorityFilterOption.label} 조건에 맞는 유도
                    궤적이 없습니다.
                  </Typography>
                )}
              </Box>
            )}
            {battleSpectatorImpactTimelineRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    착탄 타임라인
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 209, 102, 0.12)",
                      color: "#ffd166",
                    }}
                  >
                    ETA 추적 {filteredBattleSpectatorImpactTimelineRows.length}
                    {battleSpectatorPriorityFilter !== "all"
                      ? ` / ${battleSpectatorImpactTimelineRows.length}`
                      : ""}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.8)",
                  }}
                >
                  표시 {filteredBattleSpectatorImpactTimelineRows.length} · 30초
                  이내{" "}
                  {
                    filteredBattleSpectatorImpactTimelineRows.filter(
                      (row) => row.etaSec <= 30
                    ).length
                  }{" "}
                  · 60초 이내{" "}
                  {
                    filteredBattleSpectatorImpactTimelineRows.filter(
                      (row) => row.etaSec <= 60
                    ).length
                  }{" "}
                  · 3분 이내{" "}
                  {
                    filteredBattleSpectatorImpactTimelineRows.filter(
                      (row) => row.etaSec <= 180
                    ).length
                  }
                </Typography>
                {filteredBattleSpectatorImpactTimelineRows.length > 0 ? (
                  <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                    {filteredBattleSpectatorImpactTimelineRows.map(
                      (row, index) => (
                        <Box
                          key={row.id}
                          sx={{
                            px: 1,
                            py: 0.95,
                            borderRadius: 1.6,
                            backgroundColor: "rgba(8, 24, 29, 0.78)",
                            border: "1px solid rgba(98, 230, 208, 0.08)",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: "rgba(98, 230, 208, 0.82)",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                #{index + 1} · {row.weapon.sideName}
                              </Typography>
                              <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                                {row.targetName}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                px: 0.85,
                                py: 0.35,
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: `${row.urgencyTone}22`,
                                color: row.urgencyTone,
                              }}
                            >
                              {row.urgencyLabel}
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              mt: 0.55,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.72)",
                            }}
                          >
                            {row.weapon.name} · ETA{" "}
                            {formatBattleSpectatorEta(row.etaSec)} · 위험 반경{" "}
                            {formatBattleSpectatorThreatRadius(
                              row.threatRadiusMeters
                            )}
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.7,
                              height: 7,
                              borderRadius: 999,
                              overflow: "hidden",
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${row.progressPercent}%`,
                                height: "100%",
                                borderRadius: 999,
                                background: `linear-gradient(90deg, ${row.urgencyTone} 0%, rgba(98, 230, 208, 0.92) 100%)`,
                              }}
                            />
                          </Box>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ mt: 0.75, flexWrap: "wrap" }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point: resolveBattleSpectatorWeaponJumpPoint(
                                    row.weapon
                                  ),
                                  followTargetId: `weapon:${row.weapon.id}`,
                                  cameraProfile: "side",
                                })
                              }
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: "#ecfffb",
                              }}
                            >
                              탄체 추적
                            </Button>
                            {row.targetPoint && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  const targetPoint = row.targetPoint;
                                  if (!targetPoint) {
                                    return;
                                  }
                                  focusBattleSpectatorView({
                                    point: {
                                      longitude: targetPoint.longitude,
                                      latitude: targetPoint.latitude,
                                      altitudeMeters: Math.max(
                                        1800,
                                        targetPoint.altitudeMeters + 1800
                                      ),
                                    },
                                    followTargetId:
                                      typeof row.weapon.targetId === "string"
                                        ? `unit:${row.weapon.targetId}`
                                        : undefined,
                                    cameraProfile: "side",
                                  });
                                }}
                                sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                              >
                                착탄점 보기
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      )
                    )}
                  </Stack>
                ) : (
                  <Typography
                    sx={{
                      mt: 0.9,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorPriorityFilterOption.label} 조건에 맞는 착탄
                    타임라인이 없습니다.
                  </Typography>
                )}
              </Box>
            )}
            {battleSpectatorAssetRiskRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    피격 위험 자산
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 123, 114, 0.12)",
                      color: "#ffb1aa",
                    }}
                  >
                    자산 위협 {filteredBattleSpectatorAssetRiskRows.length}
                    {battleSpectatorPriorityFilter !== "all"
                      ? ` / ${battleSpectatorAssetRiskRows.length}`
                      : ""}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.8)",
                  }}
                >
                  표시 {filteredBattleSpectatorAssetRiskRows.length} · 60초 이내{" "}
                  {
                    filteredBattleSpectatorAssetRiskRows.filter(
                      (row) => row.earliestEtaSec <= 60
                    ).length
                  }{" "}
                  · 다중 위협{" "}
                  {
                    filteredBattleSpectatorAssetRiskRows.filter(
                      (row) => row.incomingCount >= 2
                    ).length
                  }
                </Typography>
                {filteredBattleSpectatorAssetRiskRows.length > 0 ? (
                  <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                    {filteredBattleSpectatorAssetRiskRows.map((row, index) => (
                      <Box
                        key={row.id}
                        sx={{
                          px: 1,
                          py: 0.95,
                          borderRadius: 1.6,
                          backgroundColor: "rgba(8, 24, 29, 0.78)",
                          border: "1px solid rgba(98, 230, 208, 0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: "rgba(98, 230, 208, 0.82)",
                                letterSpacing: "0.08em",
                              }}
                            >
                              #{index + 1} · {row.unit.sideName}
                            </Typography>
                            <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                              {row.unit.name}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              px: 0.85,
                              py: 0.35,
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor:
                                row.earliestEtaSec <= 30
                                  ? "rgba(255, 123, 114, 0.14)"
                                  : "rgba(255, 209, 102, 0.14)",
                              color:
                                row.earliestEtaSec <= 30
                                  ? "#ffb1aa"
                                  : "#ffd166",
                            }}
                          >
                            ETA {formatBattleSpectatorEta(row.earliestEtaSec)}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            mt: 0.55,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.72)",
                          }}
                        >
                          접근 탄체 {row.incomingCount} · 대표 위협{" "}
                          {row.highlightedWeapon.name}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.68)",
                          }}
                        >
                          체력 {formatBattleSpectatorHp(row.unit.hpFraction)} ·
                          위험 반경{" "}
                          {formatBattleSpectatorThreatRadius(
                            row.maxThreatRadiusMeters
                          )}
                          {typeof row.unit.fuelFraction === "number"
                            ? ` · 연료 ${formatBattleSpectatorFuelFraction(
                                row.unit.fuelFraction
                              )}`
                            : ""}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              focusBattleSpectatorView({
                                point: resolveBattleSpectatorUnitJumpPoint(
                                  row.unit
                                ),
                                followTargetId: `unit:${row.unit.id}`,
                                cameraProfile:
                                  resolveBattleSpectatorUnitCameraProfile(
                                    row.unit
                                  ),
                              })
                            }
                            sx={{
                              borderColor: "rgba(98, 230, 208, 0.24)",
                              color: "#ecfffb",
                            }}
                          >
                            자산 추적
                          </Button>
                          {row.targetPoint && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                const targetPoint = row.targetPoint;
                                if (!targetPoint) {
                                  return;
                                }
                                focusBattleSpectatorView({
                                  point: {
                                    longitude: targetPoint.longitude,
                                    latitude: targetPoint.latitude,
                                    altitudeMeters: Math.max(
                                      1800,
                                      targetPoint.altitudeMeters + 1800
                                    ),
                                  },
                                  followTargetId: `unit:${row.unit.id}`,
                                  cameraProfile: "side",
                                });
                              }}
                              sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                            >
                              방어 지점
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    sx={{
                      mt: 0.9,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorPriorityFilterOption.label} 조건에 맞는 피격
                    자산이 없습니다.
                  </Typography>
                )}
              </Box>
            )}
    </>
  );
}
