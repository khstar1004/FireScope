// @ts-nocheck

export default function FlightSimDockBriefingSection({ ctx }) {
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
              ref={battleSpectatorBriefingSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            {battleSpectatorBriefing && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.1,
                  borderRadius: 1.8,
                  background:
                    "linear-gradient(180deg, rgba(6, 20, 24, 0.88) 0%, rgba(4, 14, 17, 0.82) 100%)",
                  border: "1px solid rgba(98, 230, 208, 0.12)",
                  boxShadow: "0 18px 40px rgba(2, 10, 12, 0.24)",
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
                    작전 브리핑
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: `${battleSpectatorBriefing.stageTone}22`,
                      color: battleSpectatorBriefing.stageTone,
                    }}
                  >
                    {battleSpectatorBriefing.stageLabel}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.65,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#ecfffb",
                  }}
                >
                  {battleSpectatorBriefing.headline}
                </Typography>
                <Box
                  sx={{
                    mt: 0.75,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.75,
                  }}
                >
                  {battleSpectatorBriefing.metrics.map((metric) => (
                    <Box
                      key={metric.label}
                      sx={{
                        p: 0.82,
                        borderRadius: 1.45,
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
                        {metric.label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.2,
                          fontSize: 12.8,
                          fontWeight: 700,
                          color: "#ecfffb",
                        }}
                      >
                        {metric.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {battleSpectatorBriefing.actions.length > 0 && (
                  <>
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                        color: "rgba(98, 230, 208, 0.84)",
                      }}
                    >
                      즉시 전환
                    </Typography>
                    <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                      {battleSpectatorBriefing.actions.map((action) => (
                        <Box
                          key={action.id}
                          sx={{
                            px: 1,
                            py: 0.95,
                            borderRadius: 1.6,
                            backgroundColor: "rgba(8, 24, 29, 0.78)",
                            border: "1px solid rgba(98, 230, 208, 0.08)",
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 700, color: "#ecfffb" }}
                          >
                            {action.label}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.72)",
                            }}
                          >
                            {action.detail}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              focusBattleSpectatorView({
                                point: action.point,
                                followTargetId: action.followTargetId,
                                cameraProfile: action.cameraProfile,
                              })
                            }
                            sx={{
                              mt: 0.7,
                              borderColor: "rgba(98, 230, 208, 0.24)",
                              color: "#ecfffb",
                            }}
                          >
                            {action.label}
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            )}
            {battleSpectatorBriefingLog.length > 0 && (
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
                    브리핑 로그
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.3,
                      borderRadius: 99,
                      fontSize: 10.8,
                      fontWeight: 700,
                      backgroundColor: "rgba(98, 230, 208, 0.12)",
                      color: "#62e6d0",
                    }}
                  >
                    최근 판단 {battleSpectatorBriefingLog.length}
                  </Typography>
                </Stack>
                <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                  {battleSpectatorBriefingLog.map((entry) => (
                    <Box
                      key={entry.id}
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
                            {entry.timestampLabel}
                          </Typography>
                          <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                            {entry.headline}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: `${entry.stageTone}22`,
                            color: entry.stageTone,
                          }}
                        >
                          {entry.stageLabel}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.4,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        {entry.detail}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          focusBattleSpectatorView({
                            point: entry.point,
                            followTargetId: entry.followTargetId,
                            cameraProfile: entry.cameraProfile,
                          })
                        }
                        sx={{
                          mt: 0.7,
                          borderColor: "rgba(98, 230, 208, 0.24)",
                          color: "#ecfffb",
                        }}
                      >
                        로그 재생
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorAlertRows.length > 0 && (
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
                    우선 경보
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.3,
                      borderRadius: 99,
                      fontSize: 10.8,
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 123, 114, 0.12)",
                      color: "#ffb1aa",
                    }}
                  >
                    즉시 확인 {battleSpectatorAlertRows.length}
                  </Typography>
                </Stack>
                <Stack spacing={0.8} sx={{ mt: 0.85 }}>
                  {battleSpectatorAlertRows.map((alert) => (
                    <Box
                      key={alert.id}
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
                        <Typography sx={{ fontWeight: 700, color: "#ecfffb" }}>
                          {alert.label}
                        </Typography>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: `${alert.severityTone}22`,
                            color: alert.severityTone,
                          }}
                        >
                          {alert.severityLabel}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.4,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        {alert.detail}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          focusBattleSpectatorView({
                            point: alert.point,
                            followTargetId: alert.followTargetId,
                            cameraProfile: alert.cameraProfile,
                          })
                        }
                        sx={{
                          mt: 0.7,
                          borderColor: "rgba(98, 230, 208, 0.24)",
                          color: "#ecfffb",
                        }}
                      >
                        {alert.actionLabel}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {currentBattleSpectator &&
              battleSpectatorSideTrendRows.length > 0 && (
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
                      세력별 전력 추이
                    </Typography>
                    {battleSpectatorInitiativeSummary && (
                      <Typography
                        sx={{
                          px: 0.85,
                          py: 0.3,
                          borderRadius: 99,
                          fontSize: 10.8,
                          fontWeight: 700,
                          backgroundColor: "rgba(98, 230, 208, 0.12)",
                          color: "#62e6d0",
                        }}
                      >
                        {battleSpectatorInitiativeSummary.label}
                      </Typography>
                    )}
                  </Stack>
                  <Stack spacing={0.85} sx={{ mt: 0.9 }}>
                    {battleSpectatorSideTrendRows.map((row) => {
                      const latestSideJump =
                        resolveBattleSpectatorSideJumpPoint(
                          currentBattleSpectator,
                          row.sideId
                        );

                      return (
                        <Box
                          key={row.sideId}
                          sx={{
                            px: 1,
                            py: 0.95,
                            borderRadius: 1.6,
                            backgroundColor: row.isFiltered
                              ? "rgba(13, 33, 38, 0.92)"
                              : "rgba(8, 24, 29, 0.78)",
                            border: row.isFiltered
                              ? "1px solid rgba(98, 230, 208, 0.24)"
                              : "1px solid rgba(98, 230, 208, 0.08)",
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
                                {row.sideName}
                              </Typography>
                              <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                                전력 점수 {row.powerScore}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                px: 0.85,
                                py: 0.35,
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: `${getBattleSpectatorTrendTone(
                                  row.delta
                                )}22`,
                                color: getBattleSpectatorTrendTone(row.delta),
                              }}
                            >
                              {row.trendLabel} {row.delta >= 0 ? "+" : ""}
                              {row.delta}
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              mt: 0.7,
                              display: "grid",
                              gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                              gap: 0.35,
                              alignItems: "end",
                              height: 34,
                            }}
                          >
                            {buildBattleSpectatorPowerHistoryBars(
                              row.powerHistory
                            ).map((powerBar) => (
                              <Box
                                key={`${row.sideId}-${powerBar.id}`}
                                sx={{
                                  height: `${powerBar.heightPercent}%`,
                                  borderRadius: 999,
                                  backgroundColor: powerBar.active
                                    ? getBattleSpectatorSideCssColor(
                                        row.sideColor || "#62e6d0"
                                      )
                                    : "rgba(98, 230, 208, 0.38)",
                                }}
                              />
                            ))}
                          </Box>
                          <Typography
                            sx={{
                              mt: 0.65,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.72)",
                            }}
                          >
                            유닛 {row.unitCount} · 잔여 무장{" "}
                            {row.totalWeaponCapacity} · 비행 중 탄체{" "}
                            {row.weaponsInFlight} · 평균 체력{" "}
                            {formatBattleSpectatorHp(row.averageHpFraction)}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.3,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.68)",
                            }}
                          >
                            최근 발사 {row.recentLaunches} · 최근 명중/격파{" "}
                            {row.recentImpacts}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ mt: 0.75, flexWrap: "wrap" }}
                          >
                            <Button
                              size="small"
                              variant={
                                row.isFiltered ? "contained" : "outlined"
                              }
                              onClick={() => {
                                setBattleSpectatorSideFilter((currentFilter) =>
                                  currentFilter === row.sideId
                                    ? "all"
                                    : row.sideId
                                );
                                closeBattleSpectatorPanelOnMobile();
                              }}
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: row.isFiltered ? "#041215" : "#ecfffb",
                                backgroundColor: row.isFiltered
                                  ? "#62e6d0"
                                  : "rgba(8, 24, 29, 0.76)",
                              }}
                            >
                              {row.isFiltered
                                ? "전체 보기"
                                : `${row.sideName}만 보기`}
                            </Button>
                            {latestSideJump && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                  focusBattleSpectatorView({
                                    point: latestSideJump.point,
                                    followTargetId:
                                      latestSideJump.followTargetId,
                                    sideFilterId: row.sideId,
                                  })
                                }
                                sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                              >
                                최신 교전 보기
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
    </>
  );
}
