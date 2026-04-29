// @ts-nocheck

export default function FlightSimScenarioSidebarPanel({ ctx }) {
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
      {battleSpectatorEnabled && battleSpectatorSidebarEntries.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: { xs: 112, sm: 118 },
            left: 20,
            zIndex: 4,
            width: { xs: "min(320px, calc(100% - 40px))", sm: 320 },
            maxHeight: {
              xs: "min(40vh, calc(100vh - 240px))",
              sm: "min(58vh, calc(100vh - 220px))",
            },
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <ToolbarCollapsible
            title="관전 요소"
            subtitle="클릭 즉시 해당 3D 시점으로 이동"
            headerBadges={[
              {
                label: `${battleSpectatorSidebarEntries.length}개`,
                tone: "accent",
              },
            ]}
            prependIcon={DocumentScannerOutlinedIcon}
            open={true}
            content={
              <Stack spacing={1} sx={{ gap: "8px" }}>
                {battleSpectatorSidebarEntries.map((entry) => {
                  const active =
                    entry.sourceKind === "scene"
                      ? battleSpectatorHighlightedPatrolTargetId === entry.id
                      : battleSpectatorFollowTargetId === entry.followTargetId;

                  return (
                    <MenuItem
                      key={entry.id}
                      onClick={() => focusBattleSpectatorSidebarEntry(entry)}
                      sx={{
                        borderRadius: 1.5,
                        border: active
                          ? "1px solid rgba(98, 230, 208, 0.32)"
                          : "1px solid rgba(45, 214, 196, 0.1)",
                        backgroundColor: active
                          ? "rgba(98, 230, 208, 0.12)"
                          : "rgba(255,255,255,0.03)",
                        alignItems: "center",
                        px: 1.1,
                        py: 0.95,
                        "&:hover": {
                          backgroundColor: active
                            ? "rgba(98, 230, 208, 0.16)"
                            : "rgba(98, 230, 208, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 34 }}>
                        <EntityIcon
                          type={entry.iconType}
                          width={21}
                          height={21}
                          color={entry.iconColor}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={entry.label}
                        secondary={entry.detail}
                        primaryTypographyProps={{
                          fontWeight: 700,
                          fontSize: 13.2,
                          color: "#ecfffb",
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            mt: 0.25,
                            fontSize: 10.8,
                            color: "rgba(236, 255, 251, 0.62)",
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          ml: 1,
                          fontSize: 10.8,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          color: active
                            ? "#62e6d0"
                            : "rgba(236, 255, 251, 0.46)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.cameraProfile === "chase"
                          ? "추적"
                          : entry.cameraProfile === "side"
                            ? "측면"
                            : entry.cameraProfile === "orbit"
                              ? "오비트"
                              : "전술"}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </Stack>
            }
          />
        </Box>
      )}
    </>
  );
}
