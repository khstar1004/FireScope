// @ts-nocheck

export default function FlightSimBattleHeaderOverlay({ ctx }) {
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
      {battleSpectatorEnabled && (
        <>
          <Button
            variant="contained"
            onClick={() => setBattleSpectatorPanelOpen((open) => !open)}
            sx={{
              display: "inline-flex",
              position: "absolute",
              top: { xs: "auto", sm: "auto" },
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              borderRadius: 999,
              px: 1.75,
              py: 0.95,
              backgroundColor: "rgba(10, 28, 36, 0.92)",
              color: "#ecfffb",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.32)",
              "&:hover": {
                backgroundColor: "rgba(16, 42, 46, 0.96)",
              },
            }}
          >
            {battleSpectatorPanelOpen ? "전황 도크 접기" : "전황 도크"}
          </Button>
          <Box
            onClick={() => setBattleSpectatorPanelOpen(false)}
            sx={{
              display: {
                xs: battleSpectatorPanelOpen ? "block" : "none",
                sm: "none",
              },
              position: "absolute",
              inset: 0,
              zIndex: 2,
              backgroundColor: "rgba(1, 5, 10, 0.38)",
            }}
          />
        </>
      )}

      {battleSpectatorEnabled && displayedBattleSpectator && (
        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            right: { xs: 20, lg: 396 },
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
            <Box
              sx={{
                pointerEvents: "auto",
                minWidth: { lg: 320 },
                p: 1.15,
                borderRadius: 2.2,
                backdropFilter: "blur(14px)",
                background:
                  "linear-gradient(180deg, rgba(7, 20, 24, 0.9) 0%, rgba(5, 14, 18, 0.76) 100%)",
                border: "1px solid rgba(98, 230, 208, 0.18)",
                boxShadow: "0 16px 32px rgba(0, 0, 0, 0.24)",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: "#62e6d0", letterSpacing: "0.16em" }}
                  >
                    전장 3D 관전
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#ecfffb",
                      lineHeight: 1.15,
                    }}
                  >
                    {displayedBattleSpectator.scenarioName}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12.5,
                      color: "rgba(236, 255, 251, 0.74)",
                    }}
                  >
                    유닛 {displayedBattleSpectator.units.length} · 탄체{" "}
                    {displayedBattleSpectator.stats.weaponsInFlight} · 세력{" "}
                    {displayedBattleSpectator.stats.sides} · 필터{" "}
                    {battleSpectatorSideFilter === "all"
                      ? "전체"
                      : (battleSpectatorSideOptions.find(
                          (side) => side.id === battleSpectatorSideFilter
                        )?.name ?? "선택")}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      gap: 0.7,
                    }}
                  >
                    {[
                      [
                        "탄체",
                        `${displayedBattleSpectator.stats.weaponsInFlight}`,
                      ],
                      ["경보", `${battleSpectatorAlertRows.length}`],
                      ["핫스팟", `${battleSpectatorHotspotRows.length}`],
                      ["시점", battleSpectatorCameraProfileOption.label],
                    ].map(([label, value]) => (
                      <Box
                        key={label}
                        sx={{
                          px: 0.8,
                          py: 0.75,
                          borderRadius: 1.5,
                          backgroundColor: "rgba(255, 255, 255, 0.045)",
                          border: "1px solid rgba(98, 230, 208, 0.12)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10,
                            letterSpacing: "0.1em",
                            color: "rgba(98, 230, 208, 0.76)",
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: 12.6,
                            fontWeight: 800,
                            color: "#ecfffb",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={onBack}
                  sx={{
                    flexShrink: 0,
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                    backgroundColor: "rgba(8, 24, 29, 0.56)",
                    "&:hover": {
                      borderColor: "#62e6d0",
                      backgroundColor: "rgba(12, 34, 39, 0.76)",
                    },
                  }}
                >
                  돌아가기
                </Button>
              </Stack>
            </Box>
            <Box
              sx={{
                pointerEvents: "auto",
                flex: 1,
                minWidth: 0,
                p: 1.05,
                borderRadius: 2.2,
                backdropFilter: "blur(14px)",
                background:
                  "linear-gradient(180deg, rgba(6, 18, 22, 0.88) 0%, rgba(4, 12, 16, 0.74) 100%)",
                border: "1px solid rgba(98, 230, 208, 0.14)",
                boxShadow: "0 16px 32px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ flexWrap: "wrap", alignItems: "center" }}
              >
                {[
                  {
                    id: "overview" as const,
                    label: "전장",
                    ref: battleSpectatorOverviewSectionRef,
                  },
                  {
                    id: "briefing" as const,
                    label: "브리핑",
                    ref: battleSpectatorBriefingSectionRef,
                  },
                  {
                    id: "engagements" as const,
                    label: "추적",
                    ref: battleSpectatorEngagementSectionRef,
                  },
                  {
                    id: "analysis" as const,
                    label: "분석",
                    ref: battleSpectatorAnalysisSectionRef,
                  },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    size="small"
                    variant={
                      battleSpectatorDockTab === tab.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => {
                      setBattleSpectatorDockTab(tab.id);
                      setBattleSpectatorPanelOpen(true);
                      window.setTimeout(() => {
                        tab.ref.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 0);
                    }}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorDockTab === tab.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      backgroundColor:
                        battleSpectatorDockTab === tab.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.62)",
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
                {battleSpectatorAlertRows.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setBattleSpectatorDockTab("overview");
                      setBattleSpectatorPanelOpen(true);
                      window.setTimeout(() => {
                        battleSpectatorOverviewSectionRef.current?.scrollIntoView(
                          {
                            behavior: "smooth",
                            block: "start",
                          }
                        );
                      }, 0);
                    }}
                    sx={{
                      minWidth: 0,
                      borderColor: "rgba(255, 123, 114, 0.28)",
                      color: "#ffb1aa",
                    }}
                  >
                    경보 {battleSpectatorAlertRows.length}
                  </Button>
                )}
              </Stack>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={0.8}
                sx={{ mt: 0.9, alignItems: { md: "center" }, flexWrap: "wrap" }}
              >
                <Box
                  sx={{
                    minWidth: { xs: "100%", md: 260 },
                    px: 1.05,
                    py: 0.82,
                    borderRadius: 1.5,
                    border: "1px solid rgba(98, 230, 208, 0.22)",
                    backgroundColor: "rgba(7, 19, 24, 0.94)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.2,
                      letterSpacing: "0.1em",
                      color: "rgba(98, 230, 208, 0.82)",
                    }}
                  >
                    현재 추적
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: 12.6,
                      fontWeight: 700,
                      color: "#ecfffb",
                    }}
                  >
                    {battleSpectatorFollowTargetLabel}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    minWidth: { xs: "100%", md: 280 },
                    px: 1,
                    py: 0.82,
                    borderRadius: 1.5,
                    border: "1px dashed rgba(127, 231, 255, 0.22)",
                    backgroundColor: "rgba(127, 231, 255, 0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.2,
                      letterSpacing: "0.1em",
                      color: "rgba(127, 231, 255, 0.82)",
                    }}
                  >
                    LIVE PICK
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: 11.8,
                      color: "rgba(236, 255, 251, 0.78)",
                    }}
                  >
                    자산 또는 탄체를 클릭하면 우측 인스펙터가 바로 갱신되고,
                    거기서 추적·측면·오비트 시점을 바로 전환할 수 있습니다.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
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
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      backgroundColor:
                        battleSpectatorSideFilter === "all"
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.62)",
                    }}
                  >
                    필터 전체
                  </Button>
                  {battleSpectatorSideOptions.map((side) => (
                    <Button
                      key={`overlay-side-${side.id}`}
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
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        backgroundColor:
                          battleSpectatorSideFilter === side.id
                            ? "#62e6d0"
                            : "rgba(8, 24, 29, 0.62)",
                      }}
                    >
                      {`세력 ${side.name}`}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
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
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        backgroundColor:
                          battleSpectatorCameraProfile === option.id
                            ? "#62e6d0"
                            : "rgba(8, 24, 29, 0.62)",
                      }}
                    >
                      {`시점 ${option.label}`}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!latestBattleEngagementPoint}
                    onClick={() => {
                      if (!latestBattleEngagementPoint) {
                        return;
                      }
                      focusBattleSpectatorView({
                        point: latestBattleEngagementPoint,
                        followTargetId:
                          latestBattleEngagementPoint.followTargetId,
                      });
                    }}
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      color: "#ecfffb",
                    }}
                  >
                    최신 교전
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
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
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      color: "#ecfffb",
                    }}
                  >
                    활성 탄체
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
                      minWidth: 0,
                      color: battleSpectatorAutoCapture ? "#041215" : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      backgroundColor: battleSpectatorAutoCapture
                        ? "#62e6d0"
                        : "rgba(8, 24, 29, 0.62)",
                    }}
                  >
                    즉시 포착
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      )}
    </>
  );
}
