// @ts-nocheck

import FlightSimBattleHeaderOverlay from "./FlightSimBattleHeaderOverlay";
import FlightSimControlDock from "./FlightSimControlDock";
import FlightSimLoadingOverlay from "./FlightSimLoadingOverlay";
import FlightSimScenarioSidebarPanel from "./FlightSimScenarioSidebarPanel";

export default function FlightSimPageView(ctx) {
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
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, #17354a 0%, #091522 34%, #04070d 100%)",
        color: "#eef7fb",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255, 194, 96, 0.18), transparent 26%, rgba(121, 230, 255, 0.14) 72%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <input
        ref={battleSpectatorScenarioFileInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleBattleSpectatorScenarioFileChange}
      />
      <FlightSimBattleHeaderOverlay ctx={ctx} />
      <FlightSimScenarioSidebarPanel ctx={ctx} />
      <FlightSimControlDock ctx={ctx} />
      <FlightSimLoadingOverlay ctx={ctx} />
      <SimulationOutcomeDialog
        open={simulationOutcomeOpen}
        summary={simulationOutcomeSummary}
        narrative={simulationOutcomeNarrative}
        narrativeSource={simulationOutcomeNarrativeSource}
        loading={simulationOutcomeLoading}
        onClose={() => setSimulationOutcomeOpen(false)}
      />
    </Box>
  );
}
