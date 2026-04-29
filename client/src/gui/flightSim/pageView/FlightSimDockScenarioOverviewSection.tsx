// @ts-nocheck

export default function FlightSimDockScenarioOverviewSection({ ctx }) {
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
        {battleSpectatorHasScenarioControls && (
          <Box sx={{ mb: 1.05 }}>
            <ToolbarCollapsible
              title="시나리오 제어"
              subtitle={`${battleSpectatorScenarioName} · ${
                battleSpectatorScenarioPaused ? "정지" : "실행"
              }`}
              headerBadges={[
                {
                  label: battleSpectatorScenarioPaused ? "일시정지" : "실행 중",
                  tone: battleSpectatorScenarioPaused ? "warning" : "accent",
                },
                {
                  label: `${battleSpectatorScenarioTimeCompression}x`,
                  tone: "default",
                },
              ]}
              prependIcon={DocumentScannerOutlinedIcon}
              open={true}
              content={
                <Stack spacing={1}>
                  <Box
                    sx={{
                      p: 1.05,
                      borderRadius: 1.8,
                      backgroundColor: "rgba(7, 19, 24, 0.92)",
                      border: "1px solid rgba(98, 230, 208, 0.12)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        color: "rgba(98, 230, 208, 0.82)",
                      }}
                    >
                      현재 시나리오
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 14.5,
                        fontWeight: 800,
                        color: "#ecfffb",
                      }}
                    >
                      {battleSpectatorScenarioName}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.45,
                        fontSize: 12,
                        color: "rgba(236, 255, 251, 0.68)",
                      }}
                    >
                      실행 상태{" "}
                      {battleSpectatorScenarioPaused ? "정지" : "진행"} · 속도{" "}
                      {battleSpectatorScenarioTimeCompression}x
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 0.75,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorNewScenario}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      새 시나리오
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        battleSpectatorScenarioFileInputRef.current?.click()
                      }
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      파일 불러오기
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorRestartScenario}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      다시 시작
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorStepScenario}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      1단계
                    </Button>
                    <Button
                      size="small"
                      variant={
                        battleSpectatorScenarioPaused ? "contained" : "outlined"
                      }
                      onClick={handleBattleSpectatorTogglePlay}
                      sx={{
                        color: battleSpectatorScenarioPaused
                          ? "#041215"
                          : "#ecfffb",
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        backgroundColor: battleSpectatorScenarioPaused
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.62)",
                      }}
                    >
                      {battleSpectatorScenarioPaused ? "실행" : "일시정지"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorToggleTimeCompression}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      속도 {battleSpectatorScenarioTimeCompression}x
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      p: 0.95,
                      borderRadius: 1.8,
                      backgroundColor: "rgba(5, 16, 18, 0.72)",
                      border: "1px solid rgba(98, 230, 208, 0.08)",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography
                        sx={{
                          fontSize: 10.8,
                          letterSpacing: "0.1em",
                          color: "rgba(98, 230, 208, 0.82)",
                        }}
                      >
                        프리셋 시나리오
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          setBattleSpectatorPresetListExpanded(
                            (currentValue) => !currentValue
                          )
                        }
                        sx={{
                          minWidth: 0,
                          px: 0,
                          color: "#62e6d0",
                        }}
                      >
                        {battleSpectatorPresetListExpanded
                          ? "간단히 보기"
                          : "전체 보기"}
                      </Button>
                    </Stack>
                    <Stack spacing={0.55} sx={{ mt: 0.8 }}>
                      {visibleBattleSpectatorScenarioPresets.map((preset) => (
                        <MenuItem
                          key={`spectator-preset-${preset.name}`}
                          onClick={() =>
                            loadBattleSpectatorPresetScenario(preset)
                          }
                          sx={{
                            borderRadius: 1.4,
                            px: 1,
                            py: 0.75,
                            border: "1px solid rgba(98, 230, 208, 0.08)",
                            backgroundColor: "rgba(8, 24, 29, 0.62)",
                            "&:hover": {
                              backgroundColor: "rgba(98, 230, 208, 0.08)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={preset.displayName}
                            primaryTypographyProps={{
                              fontSize: 12.6,
                              fontWeight: 700,
                              color: "#ecfffb",
                            }}
                          />
                        </MenuItem>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              }
            />
          </Box>
        )}
        {showBattleSpectator && displayedBattleSpectator && (
          <Box
            sx={{
              mt: 0.35,
              p: 1.6,
              borderRadius: 2.5,
              background:
                "linear-gradient(180deg, rgba(16, 42, 46, 0.84) 0%, rgba(8, 20, 24, 0.74) 100%)",
              border: "1px solid rgba(98, 230, 208, 0.24)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#62e6d0", letterSpacing: "0.16em" }}
            >
              실시간 전장 상태
            </Typography>
            <Typography sx={{ fontWeight: 800, color: "#ecfffb" }}>
              {displayedBattleSpectator.scenarioName}
            </Typography>
            <Typography
              sx={{
                mt: 0.65,
                fontSize: 12.5,
                color: "rgba(236, 255, 251, 0.76)",
              }}
            >
              유닛 {displayedBattleSpectator.units.length} · 비행 중 탄체{" "}
              {displayedBattleSpectator.stats.weaponsInFlight} · 세력{" "}
              {displayedBattleSpectator.stats.sides}
            </Typography>
            <Box
              sx={{
                mt: 1.05,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 0.8,
              }}
            >
              {[
                ["항공", displayedBattleSpectator.stats.aircraft],
                ["지상시설", displayedBattleSpectator.stats.facilities],
                ["기지", displayedBattleSpectator.stats.airbases],
                ["함정", displayedBattleSpectator.stats.ships],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    p: 0.9,
                    borderRadius: 1.6,
                    backgroundColor: "rgba(8, 24, 29, 0.76)",
                    border: "1px solid rgba(98, 230, 208, 0.12)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.08em",
                      color: "rgba(98, 230, 208, 0.82)",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography sx={{ mt: 0.2, fontWeight: 700 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            {battleSpectatorActivitySummary && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.05,
                  borderRadius: 1.8,
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
                    전투 확인
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.3,
                      borderRadius: 99,
                      fontSize: 10.8,
                      fontWeight: 700,
                      backgroundColor: `${battleSpectatorActivitySummary.statusTone}22`,
                      color: battleSpectatorActivitySummary.statusTone,
                    }}
                  >
                    {battleSpectatorActivitySummary.statusLabel}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 0.75,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.75,
                  }}
                >
                  {[
                    [
                      "실시간 탄체",
                      battleSpectatorActivitySummary.activeWeapons,
                    ],
                    [
                      "최근 발사",
                      battleSpectatorActivitySummary.recentLaunches,
                    ],
                    ["명중/격파", battleSpectatorActivitySummary.recentImpacts],
                    [
                      "이벤트 트레이서",
                      battleSpectatorActivitySummary.eventTracers,
                    ],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        p: 0.8,
                        borderRadius: 1.4,
                        backgroundColor: "rgba(8, 24, 29, 0.76)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10.2,
                          letterSpacing: "0.08em",
                          color: "rgba(98, 230, 208, 0.76)",
                        }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.2,
                          fontSize: 12.8,
                          fontWeight: 700,
                          color: "#ecfffb",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
    </>
  );
}
