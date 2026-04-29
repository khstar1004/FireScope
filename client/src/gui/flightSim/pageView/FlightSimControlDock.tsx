// @ts-nocheck

import FlightSimDockAnalysisRuntimeSection from "./FlightSimDockAnalysisRuntimeSection";
import FlightSimDockBriefingSection from "./FlightSimDockBriefingSection";
import FlightSimDockEngagementSection from "./FlightSimDockEngagementSection";
import FlightSimDockScenarioOverviewSection from "./FlightSimDockScenarioOverviewSection";

export default function FlightSimControlDock({ ctx }) {
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
      <Box
        sx={{
          position: "absolute",
          top: battleSpectatorEnabled ? "auto" : 20,
          bottom: battleSpectatorEnabled ? 20 : "auto",
          left: battleSpectatorEnabled ? 20 : 20,
          right: battleSpectatorEnabled ? 20 : "auto",
          zIndex: 3,
          width: battleSpectatorEnabled
            ? "auto"
            : { xs: "calc(100% - 40px)", sm: 360 },
          maxWidth: battleSpectatorEnabled ? 1180 : undefined,
          maxHeight: battleSpectatorEnabled
            ? "min(52vh, 620px)"
            : "calc(100% - 40px)",
          overflowY: "auto",
          p: battleSpectatorEnabled ? 1.6 : 2.5,
          pointerEvents: battleSpectatorEnabled
            ? battleSpectatorPanelOpen
              ? "auto"
              : "none"
            : {
                xs:
                  battleSpectatorEnabled && !battleSpectatorPanelOpen
                    ? "none"
                    : "auto",
                sm: "auto",
              },
          transform: battleSpectatorEnabled
            ? battleSpectatorPanelOpen
              ? "translateY(0)"
              : "translateY(calc(100% + 28px))"
            : {
                xs:
                  battleSpectatorEnabled && !battleSpectatorPanelOpen
                    ? "translateX(calc(-100% - 28px))"
                    : "translateX(0)",
                sm: "translateX(0)",
              },
          opacity: battleSpectatorEnabled
            ? battleSpectatorPanelOpen
              ? 1
              : 0
            : 1,
          transition: "transform 180ms ease, opacity 180ms ease",
          borderRadius: battleSpectatorEnabled ? 2.4 : 3,
          backdropFilter: "blur(18px)",
          background: battleSpectatorEnabled
            ? "linear-gradient(180deg, rgba(5, 16, 18, 0.94) 0%, rgba(4, 12, 15, 0.82) 100%)"
            : "linear-gradient(180deg, rgba(6, 15, 28, 0.9) 0%, rgba(4, 10, 20, 0.76) 100%)",
          border: battleSpectatorEnabled
            ? "1px solid rgba(98, 230, 208, 0.18)"
            : "1px solid rgba(121, 230, 255, 0.22)",
          boxShadow: battleSpectatorEnabled
            ? "0 20px 54px rgba(0, 0, 0, 0.38)"
            : "0 20px 54px rgba(0, 7, 16, 0.55)",
        }}
      >
        {!battleSpectatorEnabled && (
          <>
            <Stack direction="row" justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "#7fe7ff", letterSpacing: "0.18em" }}
                >
                  {selectedCraftCopy.overline}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, lineHeight: 1.1 }}
                >
                  {selectedCraftCopy.title}
                </Typography>
                {selectedMode === "jet" && (
                  <Typography
                    sx={{
                      mt: 0.6,
                      color: "#7fe7ff",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {selectedJetCraft.label}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                onClick={onBack}
                sx={{
                  alignSelf: "flex-start",
                  borderColor: "rgba(121, 230, 255, 0.34)",
                  color: "#eef7fb",
                  backgroundColor: "rgba(12, 28, 41, 0.42)",
                  "&:hover": {
                    borderColor: "#7fe7ff",
                    backgroundColor: "rgba(20, 48, 68, 0.55)",
                  },
                }}
              >
                돌아가기
              </Button>
            </Stack>

            <Typography sx={{ mt: 1.5, color: "rgba(238, 247, 251, 0.84)" }}>
              {`${selectedCraftCopy.description} 화면 안을 한 번 클릭한 뒤 조작하면 됩니다.`}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant={selectedMode === "jet" ? "contained" : "outlined"}
                onClick={() => setSelectedMode("jet")}
                sx={{
                  minWidth: 92,
                  borderColor: "rgba(121, 230, 255, 0.34)",
                  color: selectedMode === "jet" ? "#07111d" : "#eef7fb",
                  backgroundColor:
                    selectedMode === "jet"
                      ? "#7fe7ff"
                      : "rgba(10, 24, 37, 0.44)",
                  "&:hover": {
                    borderColor: "#7fe7ff",
                    backgroundColor:
                      selectedMode === "jet"
                        ? "#9cefff"
                        : "rgba(20, 48, 68, 0.58)",
                  },
                }}
              >
                전투기
              </Button>
              <Button
                variant={selectedMode === "drone" ? "contained" : "outlined"}
                onClick={() => setSelectedMode("drone")}
                sx={{
                  minWidth: 92,
                  borderColor: "rgba(121, 230, 255, 0.34)",
                  color: selectedMode === "drone" ? "#07111d" : "#eef7fb",
                  backgroundColor:
                    selectedMode === "drone"
                      ? "#7fe7ff"
                      : "rgba(10, 24, 37, 0.44)",
                  "&:hover": {
                    borderColor: "#7fe7ff",
                    backgroundColor:
                      selectedMode === "drone"
                        ? "#9cefff"
                        : "rgba(20, 48, 68, 0.58)",
                  },
                }}
              >
                드론
              </Button>
            </Stack>
            {selectedMode === "jet" && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.6,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(8, 18, 30, 0.72)",
                  border: "1px solid rgba(121, 230, 255, 0.18)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "#7fe7ff", letterSpacing: "0.16em" }}
                >
                  전투기 선택
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 1 }}>
                  {JET_CRAFT_CATALOG.map((craft) => {
                    const isSelected = selectedJetCraftId === craft.id;

                    return (
                      <Button
                        key={craft.id}
                        variant={isSelected ? "contained" : "outlined"}
                        onClick={() => setSelectedJetCraftId(craft.id)}
                        sx={{
                          justifyContent: "space-between",
                          textAlign: "left",
                          textTransform: "none",
                          px: 1.2,
                          py: 1,
                          borderColor: "rgba(121, 230, 255, 0.18)",
                          backgroundColor: isSelected
                            ? "#7fe7ff"
                            : "rgba(9, 19, 31, 0.56)",
                          color: isSelected ? "#07111d" : "#eef7fb",
                          "&:hover": {
                            borderColor: "#7fe7ff",
                            backgroundColor: isSelected
                              ? "#9cefff"
                              : "rgba(20, 48, 68, 0.58)",
                          },
                        }}
                      >
                        <Box sx={{ textAlign: "left" }}>
                          <Typography sx={{ fontWeight: 700 }}>
                            {craft.label}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.2,
                              fontSize: 11.5,
                              color: isSelected
                                ? "rgba(7, 17, 29, 0.72)"
                                : "rgba(238, 247, 251, 0.66)",
                            }}
                          >
                            {craft.role}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            ml: 1,
                            fontSize: 11.5,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {craft.hudLabel}
                        </Typography>
                      </Button>
                    );
                  })}
                </Stack>
                <Box
                  sx={{
                    mt: 1.4,
                    p: 1.3,
                    borderRadius: 2,
                    backgroundColor: "rgba(4, 12, 22, 0.64)",
                    border: "1px solid rgba(121, 230, 255, 0.12)",
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {selectedJetCraft.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.7,
                      fontSize: 13,
                      color: "rgba(238, 247, 251, 0.8)",
                    }}
                  >
                    {selectedJetCraft.summary}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.8,
                      fontSize: 12.5,
                      color: "rgba(127, 231, 255, 0.88)",
                    }}
                  >
                    {selectedJetCraft.simNote}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1.15,
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 0.8,
                    }}
                  >
                    {selectedJetCraft.simStats.map((stat) => (
                      <Box
                        key={stat.label}
                        sx={{
                          p: 0.9,
                          borderRadius: 1.6,
                          backgroundColor: "rgba(11, 22, 37, 0.7)",
                          border: "1px solid rgba(121, 230, 255, 0.1)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10.5,
                            letterSpacing: "0.1em",
                            color: "rgba(127, 231, 255, 0.82)",
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography sx={{ mt: 0.25, fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  {selectedJetCraft.officialNote && (
                    <Typography
                      sx={{
                        mt: 1.1,
                        fontSize: 12.5,
                        color: "rgba(255, 212, 148, 0.92)",
                      }}
                    >
                      {selectedJetCraft.officialNote}
                    </Typography>
                  )}
                  {selectedJetCraft.statusNote && (
                    <Typography
                      sx={{
                        mt: 0.7,
                        fontSize: 12.5,
                        color: "rgba(238, 247, 251, 0.72)",
                      }}
                    >
                      {selectedJetCraft.statusNote}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
        {battleSpectatorEnabled && (
          <>
            <Box
              ref={battleSpectatorOverviewSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                mb: 1.1,
                px: 0.2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  전황 도크
                </Typography>
                <Typography
                  sx={{ mt: 0.15, fontWeight: 700, color: "#ecfffb" }}
                >
                  {battleSpectatorCameraProfileOption.label} ·{" "}
                  {battleSpectatorFollowTargetLabel}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.7} sx={{ flexWrap: "wrap" }}>
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
                    key={`dock-${tab.id}`}
                    size="small"
                    variant={
                      battleSpectatorDockTab === tab.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => {
                      setBattleSpectatorDockTab(tab.id);
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
              </Stack>
            </Box>
          </>
        )}
        <FlightSimDockScenarioOverviewSection ctx={ctx} />
        <FlightSimDockBriefingSection ctx={ctx} />
        <FlightSimDockEngagementSection ctx={ctx} />
        <FlightSimDockAnalysisRuntimeSection ctx={ctx} />
      </Box>
  );
}
