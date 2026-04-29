// @ts-nocheck

export default function FlightSimDockAnalysisRuntimeSection({ ctx }) {
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
              ref={battleSpectatorAnalysisSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            {selectedBattleSpectatorUnit && selectedBattleSpectatorInsight && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
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
                  선택 유닛 분석
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 0.45 }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#ecfffb" }}>
                      {selectedBattleSpectatorUnit.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 12,
                        color: "rgba(236, 255, 251, 0.72)",
                      }}
                    >
                      {selectedBattleSpectatorUnit.sideName} ·{" "}
                      {formatBattleSpectatorEntityType(
                        selectedBattleSpectatorUnit.entityType
                      )}
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
                    체력{" "}
                    {formatBattleSpectatorHp(
                      selectedBattleSpectatorUnit.hpFraction
                    )}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 0.85,
                    height: 8,
                    borderRadius: 999,
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.max(
                        6,
                        Math.round(selectedBattleSpectatorUnit.hpFraction * 100)
                      )}%`,
                      height: "100%",
                      backgroundColor: getBattleSpectatorHpTone(
                        selectedBattleSpectatorUnit.hpFraction
                      ),
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    mt: 0.95,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.8,
                  }}
                >
                  {[
                    [
                      "속도",
                      `${Math.round(selectedBattleSpectatorUnit.speedKts)} kt`,
                    ],
                    [
                      "방위",
                      formatBattleSpectatorHeading(
                        selectedBattleSpectatorUnit.headingDeg
                      ),
                    ],
                    ["잔여 무장", `${selectedBattleSpectatorUnit.weaponCount}`],
                    [
                      "표적",
                      selectedBattleSpectatorInsight.targetName ?? "미지정",
                    ],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        p: 0.85,
                        borderRadius: 1.5,
                        backgroundColor: "rgba(8, 24, 29, 0.76)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10.5,
                          letterSpacing: "0.08em",
                          color: "rgba(98, 230, 208, 0.76)",
                        }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 12.6,
                          fontWeight: 700,
                          color: "#ecfffb",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography
                  sx={{
                    mt: 0.9,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.72)",
                  }}
                >
                  유닛이 띄운 탄체{" "}
                  {selectedBattleSpectatorInsight.outgoingWeapons} · 유닛을
                  향하는 탄체 {selectedBattleSpectatorInsight.incomingWeapons}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 12,
                    color: "rgba(236, 255, 251, 0.68)",
                  }}
                >
                  탐지{" "}
                  {formatBattleSpectatorRangeNm(
                    selectedBattleSpectatorUnit.detectionRangeNm
                  )}{" "}
                  · 교전{" "}
                  {formatBattleSpectatorRangeNm(
                    selectedBattleSpectatorUnit.engagementRangeNm
                  )}{" "}
                  · 연료{" "}
                  {formatBattleSpectatorFuelFraction(
                    selectedBattleSpectatorUnit.fuelFraction
                  )}
                </Typography>
                {selectedBattleSpectatorUnit.statusFlags.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={0.55}
                    sx={{ mt: 0.8, flexWrap: "wrap" }}
                  >
                    {selectedBattleSpectatorUnit.statusFlags.map(
                      (statusFlag) => (
                        <Typography
                          key={statusFlag}
                          sx={{
                            px: 0.7,
                            py: 0.25,
                            borderRadius: 99,
                            fontSize: 10.6,
                            backgroundColor: "rgba(98, 230, 208, 0.08)",
                            color: "rgba(236, 255, 251, 0.76)",
                          }}
                        >
                          {statusFlag}
                        </Typography>
                      )
                    )}
                  </Stack>
                )}
                {selectedBattleSpectatorUnit.weaponInventory.length > 0 && (
                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 11.8,
                      color: "rgba(236, 255, 251, 0.68)",
                    }}
                  >
                    무장 구성:{" "}
                    {selectedBattleSpectatorUnit.weaponInventory
                      .slice(0, 3)
                      .map(
                        (inventory) => `${inventory.name} ${inventory.quantity}`
                      )
                      .join(" · ")}
                    {selectedBattleSpectatorUnit.weaponInventory.length > 3
                      ? " · ..."
                      : ""}
                  </Typography>
                )}
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ mt: 0.9, flexWrap: "wrap" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorUnitJumpPoint(
                          selectedBattleSpectatorUnit
                        ),
                        followTargetId: undefined,
                      })
                    }
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      color: "#ecfffb",
                    }}
                  >
                    선택 유닛 지점 보기
                  </Button>
                </Stack>
              </Box>
            )}
            {battleSpectatorThreatRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
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
                  위협 상위 유닛
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                  {battleSpectatorThreatRows.map((row, index) => (
                    <Box
                      key={row.unit.id}
                      sx={{
                        px: 1,
                        py: 0.9,
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
                            backgroundColor: "rgba(98, 230, 208, 0.12)",
                            color: "#62e6d0",
                          }}
                        >
                          위협 {row.score}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.55,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        {formatBattleSpectatorEntityType(row.unit.entityType)} ·
                        속도 {Math.round(row.unit.speedKts)}kt · 잔여 무장{" "}
                        {row.unit.weaponCount} · 활동 {row.recentActivity}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.68)",
                        }}
                      >
                        비행 중 탄체 {row.outgoingWeapons} · 현재 표적{" "}
                        {row.targetName ?? "미지정"}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                row.unit
                              ),
                              followTargetId: `unit:${row.unit.id}`,
                              sideFilterId: row.unit.sideId,
                            })
                          }
                          sx={{
                            borderColor: "rgba(98, 230, 208, 0.24)",
                            color: "#ecfffb",
                          }}
                        >
                          추적 {row.unit.name}
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorHotspotRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
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
                  교전 밀집구역
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                  {battleSpectatorHotspotRows.map((hotspot, index) => (
                    <Box
                      key={hotspot.id}
                      sx={{
                        px: 1,
                        py: 0.9,
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
                            #{index + 1} · {hotspot.dominantSideName}
                          </Typography>
                          <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                            {hotspot.label}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: `${getBattleSpectatorSideCssColor(
                              hotspot.dominantSideColor
                            )}22`,
                            color: getBattleSpectatorSideCssColor(
                              hotspot.dominantSideColor
                            ),
                          }}
                        >
                          강도 {hotspot.score}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.55,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        비행 중 탄체 {hotspot.activeWeapons} · 발사{" "}
                        {hotspot.launchCount} · 명중/격파 {hotspot.impactCount}{" "}
                        · 이벤트 {hotspot.eventCount}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.68)",
                        }}
                      >
                        최근 확인{" "}
                        {formatBattleSpectatorTimestamp(
                          hotspot.latestTimestamp
                        )}
                        {hotspot.latestMessage
                          ? ` · ${hotspot.latestMessage}`
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
                              point: {
                                longitude: hotspot.longitude,
                                latitude: hotspot.latitude,
                                altitudeMeters: hotspot.altitudeMeters,
                              },
                              followTargetId: undefined,
                            })
                          }
                          sx={{
                            borderColor: "rgba(98, 230, 208, 0.24)",
                            color: "#ecfffb",
                          }}
                        >
                          핫스팟 점프
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorTempoRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
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
                  유닛별 교전 템포
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                  {battleSpectatorTempoRows.map((row, index) => (
                    <Box
                      key={row.unit.id}
                      sx={{
                        px: 1,
                        py: 0.9,
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
                            backgroundColor: "rgba(98, 230, 208, 0.12)",
                            color: "#62e6d0",
                          }}
                        >
                          템포 {row.tempoScore}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.55,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        현재 발사 중 {row.outgoingWeapons} · 피격 위험{" "}
                        {row.incomingWeapons} · 최근 발사 {row.recentLaunches} ·
                        최근 피격 {row.recentImpacts}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.68)",
                        }}
                      >
                        현재 표적 {row.targetName ?? "미지정"} · 잔여 무장{" "}
                        {row.unit.weaponCount}
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
                              sideFilterId: row.unit.sideId,
                            })
                          }
                          sx={{
                            borderColor: "rgba(98, 230, 208, 0.24)",
                            color: "#ecfffb",
                          }}
                        >
                          템포 추적
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {(visibleBattleSpectator?.recentEvents.length ?? 0) > 0 && (
              <Stack spacing={0.65} sx={{ mt: 1.15 }}>
                {(visibleBattleSpectator?.recentEvents ?? [])
                  .slice(-4)
                  .reverse()
                  .map((event) => {
                    const eventJumpPoint =
                      resolveBattleSpectatorEventJumpPoint(event);
                    const eventWeapon =
                      typeof event.weaponId === "string"
                        ? (visibleBattleSpectator?.weapons ?? []).find(
                            (weapon) => weapon.id === event.weaponId
                          )
                        : undefined;
                    const eventUnit =
                      typeof event.targetId === "string"
                        ? (visibleBattleSpectator?.units ?? []).find(
                            (unit) => unit.id === event.targetId
                          )
                        : typeof event.actorId === "string"
                          ? (visibleBattleSpectator?.units ?? []).find(
                              (unit) => unit.id === event.actorId
                            )
                          : undefined;

                    return (
                      <Box
                        key={event.id}
                        sx={{
                          px: 1,
                          py: 0.9,
                          borderRadius: 1.6,
                          backgroundColor: "rgba(5, 16, 18, 0.72)",
                          border: "1px solid rgba(98, 230, 208, 0.08)",
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
                              fontSize: 11,
                              color: "rgba(98, 230, 208, 0.88)",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {event.sideName}
                          </Typography>
                          <Stack direction="row" spacing={0.65}>
                            <Typography
                              sx={{
                                px: 0.7,
                                py: 0.25,
                                borderRadius: 99,
                                fontSize: 10.5,
                                backgroundColor: "rgba(98, 230, 208, 0.08)",
                                color: "rgba(236, 255, 251, 0.72)",
                              }}
                            >
                              {formatBattleSpectatorTimestamp(event.timestamp)}
                            </Typography>
                            {event.resultTag && (
                              <Typography
                                sx={{
                                  px: 0.7,
                                  py: 0.25,
                                  borderRadius: 99,
                                  fontSize: 10.5,
                                  backgroundColor: "rgba(255, 209, 102, 0.12)",
                                  color: "#ffd166",
                                }}
                              >
                                {event.resultTag}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12.4,
                            color: "rgba(236, 255, 251, 0.84)",
                          }}
                        >
                          {event.message}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          {eventWeapon && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point:
                                    resolveBattleSpectatorWeaponJumpPoint(
                                      eventWeapon
                                    ),
                                  followTargetId: `weapon:${eventWeapon.id}`,
                                })
                              }
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: "#ecfffb",
                              }}
                            >
                              관련 탄체 추적
                            </Button>
                          )}
                          {!eventWeapon && eventUnit && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point:
                                    resolveBattleSpectatorUnitJumpPoint(
                                      eventUnit
                                    ),
                                  followTargetId: `unit:${eventUnit.id}`,
                                  sideFilterId: eventUnit.sideId,
                                })
                              }
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: "#ecfffb",
                              }}
                            >
                              관련 유닛 추적
                            </Button>
                          )}
                          {eventJumpPoint && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point: eventJumpPoint,
                                  followTargetId: undefined,
                                })
                              }
                              sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                            >
                              교전 지점 보기
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
              </Stack>
            )}
        {showFocusFireAirwatch && focusFireInsight && (
          <Box
            sx={{
              mt: 2,
              p: 1.6,
              borderRadius: 2.5,
              background:
                "linear-gradient(180deg, rgba(48, 24, 10, 0.82) 0%, rgba(24, 12, 6, 0.72) 100%)",
              border: "1px solid rgba(255, 183, 77, 0.28)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#ffb74d", letterSpacing: "0.16em" }}
            >
              집중포격 분석
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography sx={{ fontWeight: 800, color: "#fff6ec" }}>
                충격량 지수 {focusFireInsight.shockIndex}
              </Typography>
              <Typography sx={{ color: "#ffd89a", fontSize: 13 }}>
                {focusFireInsight.intensityLabel}
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.5,
                color: "rgba(255, 246, 236, 0.8)",
              }}
            >
              포대 {focusFireInsight.breakdown.artillery} + 항공{" "}
              {focusFireInsight.breakdown.aircraft} + 기갑{" "}
              {focusFireInsight.breakdown.armor} + 탄체{" "}
              {focusFireInsight.breakdown.weaponsInFlight} + 점령{" "}
              {focusFireInsight.breakdown.captureProgress}
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.5,
                color: "rgba(255, 216, 154, 0.92)",
              }}
            >
              주도 축: {focusFireInsight.dominantAxis}
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.8,
                color: "rgba(255, 246, 236, 0.82)",
              }}
            >
              {focusFireInsight.summary}
            </Typography>
          </Box>
        )}
        {hasInitialStartLocation && !startsInKorea && (
          <Typography
            sx={{ mt: 1, color: "rgba(127, 231, 255, 0.9)", fontSize: 13 }}
          >
            한국 밖 좌표는 서울 기본 위치로 재설정해 VWorld 3D를 유지합니다.
          </Typography>
        )}
        {!hasInitialStartLocation && (
          <Typography
            sx={{ mt: 1, color: "rgba(127, 231, 255, 0.9)", fontSize: 13 }}
          >
            시작 좌표가 없어 서울 기본 위치에서 시작합니다.
          </Typography>
        )}
        <Box
          sx={{
            mt: 1.2,
            p: 1.15,
            borderRadius: 1.9,
            background:
              "linear-gradient(180deg, rgba(7, 19, 24, 0.84) 0%, rgba(4, 12, 18, 0.78) 100%)",
            border: "1px solid rgba(121, 230, 255, 0.14)",
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
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(127, 231, 255, 0.84)",
                }}
              >
                지도 런타임
              </Typography>
              <Typography sx={{ mt: 0.2, fontWeight: 800 }}>
                {runtimeProviderLabel}
              </Typography>
            </Box>
            <Typography
              sx={{
                px: 0.9,
                py: 0.35,
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: `${runtimeProviderTone}22`,
                color: runtimeProviderTone,
              }}
            >
              {formatViewerStatus(runtimeInfo)}
            </Typography>
          </Stack>
          <Box
            sx={{
              mt: 0.9,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 0.75,
            }}
          >
            <Box
              sx={{
                p: 0.82,
                borderRadius: 1.4,
                backgroundColor: "rgba(9, 24, 29, 0.78)",
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
                스크립트
              </Typography>
              <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                {formatScriptStatus(runtimeInfo)}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 0.82,
                borderRadius: 1.4,
                backgroundColor: "rgba(9, 24, 29, 0.78)",
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
                VWorld 대상
              </Typography>
              <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                {runtimeInfo?.vworld?.eligible === true
                  ? "예"
                  : runtimeInfo?.vworld?.eligible === false
                    ? "아니오"
                    : "-"}
              </Typography>
            </Box>
            {battleSpectatorEnabled && (
              <>
                <Box
                  sx={{
                    p: 0.82,
                    borderRadius: 1.4,
                    backgroundColor: "rgba(9, 24, 29, 0.78)",
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
                    카메라
                  </Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                    {battleSpectatorCameraProfileOption.label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 0.82,
                    borderRadius: 1.4,
                    backgroundColor: "rgba(9, 24, 29, 0.78)",
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
                    관전 품질
                  </Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                    {
                      BATTLE_SPECTATOR_LOD_OPTIONS.find(
                        (option) => option.id === battleSpectatorLodLevel
                      )?.label
                    }
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          {battleSpectatorEnabled && (
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.2,
                color: "rgba(236, 255, 251, 0.78)",
              }}
            >
              현재 추적: {battleSpectatorFollowTargetLabel}
            </Typography>
          )}
          {runtimeInfo?.vworld?.lastError && (
            <Typography
              sx={{
                mt: 0.7,
                fontSize: 12.2,
                color: "rgba(255, 194, 96, 0.94)",
              }}
            >
              상태: {runtimeInfo.vworld.lastError}
            </Typography>
          )}
          <Box
            component="details"
            sx={{
              mt: 0.85,
              "& > summary": {
                cursor: "pointer",
                listStyle: "none",
                fontSize: 12.2,
                color: "rgba(238, 247, 251, 0.68)",
              },
              "& > summary::-webkit-details-marker": {
                display: "none",
              },
            }}
          >
            <Box component="summary">런타임 상세</Box>
            <Stack spacing={0.35} sx={{ mt: 0.7, fontSize: 12.5 }}>
              <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
                시작 좌표:{" "}
                {runtimeInfo?.vworld?.initialPosition
                  ? `${runtimeInfo.vworld.initialPosition.lon.toFixed(4)}, ${runtimeInfo.vworld.initialPosition.lat.toFixed(4)}`
                  : "-"}
              </Typography>
              <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
                설정 도메인: {runtimeInfo?.vworld?.configuredDomain ?? "-"}
              </Typography>
              <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
                실제 호스트: {runtimeInfo?.vworld?.pageHost ?? "-"}
              </Typography>
              <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
                스크립트 URL: {runtimeInfo?.vworld?.loadedScriptUrl ?? "-"}
              </Typography>
              <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
                초기화 단계: {runtimeInfo?.vworld?.initializationStage ?? "-"}
              </Typography>
              <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
                모듈 감지:{" "}
                {runtimeInfo?.vworld?.moduleDetected === true
                  ? "예"
                  : runtimeInfo?.vworld?.moduleDetected === false
                    ? "아니오"
                    : "-"}
              </Typography>
              <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
                LOD4 레이어:{" "}
                {runtimeInfo?.vworld?.layerName
                  ? `${runtimeInfo.vworld.layerName}${runtimeInfo.vworld.layerActivated ? " 활성" : " 비활성"}`
                  : "미발견"}
              </Typography>
              <Typography sx={{ color: "rgba(246, 242, 223, 0.64)" }}>
                레이어 후보:{" "}
                {runtimeInfo?.vworld?.layerCandidates?.length
                  ? runtimeInfo.vworld.layerCandidates.slice(0, 4).join(", ")
                  : "-"}
              </Typography>
            </Stack>
          </Box>
        </Box>

        {battleSpectatorEnabled ? (
          <Box
            component="details"
            sx={{
              mt: 1.2,
              "& > summary": {
                cursor: "pointer",
                listStyle: "none",
                fontSize: 12.2,
                color: "rgba(236, 255, 251, 0.72)",
              },
              "& > summary::-webkit-details-marker": {
                display: "none",
              },
            }}
          >
            <Box component="summary">조작법</Box>
            <Stack spacing={0.7} sx={{ mt: 0.8, fontSize: 13 }}>
              {selectedCraftCopy.controls.map((control) => (
                <Typography
                  key={control}
                  sx={{ color: "rgba(238, 247, 251, 0.82)", fontSize: 13 }}
                >
                  {control}
                </Typography>
              ))}
            </Stack>
          </Box>
        ) : (
          <Stack spacing={0.7} sx={{ mt: 2, fontSize: 13 }}>
            {selectedCraftCopy.controls.map((control) => (
              <Typography
                key={control}
                sx={{ color: "rgba(238, 247, 251, 0.82)", fontSize: 13 }}
              >
                {control}
              </Typography>
            ))}
          </Stack>
        )}
    </>
  );
}
