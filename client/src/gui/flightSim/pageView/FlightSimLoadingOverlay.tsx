// @ts-nocheck

export default function FlightSimLoadingOverlay({ ctx }) {
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
        sx={{
          position: "absolute",
          inset: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: "#02060c",
          transition: "left 180ms ease",
        }}
      >
        <Stack
          spacing={0.75}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            alignItems: "flex-end",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              px: 1.1,
              py: 0.85,
              borderRadius: 999,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(4, 12, 18, 0.68)",
              border: `1px solid ${runtimeProviderTone}44`,
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.2,
                letterSpacing: "0.1em",
                color: runtimeProviderTone,
              }}
            >
              MAP ENGINE
            </Typography>
            <Typography sx={{ mt: 0.15, fontWeight: 700, color: "#ecfffb" }}>
              {runtimeProviderLabel}
            </Typography>
          </Box>
          {battleSpectatorEnabled && (
            <Box
              sx={{
                maxWidth: 360,
                px: 1.05,
                py: 0.82,
                borderRadius: 1.8,
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(4, 12, 18, 0.6)",
                border: "1px solid rgba(98, 230, 208, 0.18)",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.2,
                  letterSpacing: "0.1em",
                  color: "rgba(98, 230, 208, 0.86)",
                }}
              >
                SPECTATOR
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: 12.4,
                  fontWeight: 700,
                  color: "#ecfffb",
                }}
              >
                {battleSpectatorCameraProfileOption.label} ·{" "}
                {battleSpectatorFollowTargetLabel}
              </Typography>
            </Box>
          )}
          {battleSpectatorEnabled && (
            <Box
              sx={{
                width: { xs: "min(calc(100vw - 32px), 368px)", sm: 360 },
                px: 1.1,
                py: 1,
                borderRadius: 2,
                backdropFilter: "blur(14px)",
                background:
                  "linear-gradient(180deg, rgba(4, 12, 18, 0.82) 0%, rgba(5, 14, 21, 0.68) 100%)",
                border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                boxShadow: "0 14px 32px rgba(0, 0, 0, 0.24)",
                pointerEvents: "auto",
              }}
            >
              {inspectedBattleSpectatorTarget ? (
                <>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          mt: 0.2,
                          width: 34,
                          height: 34,
                          borderRadius: 1.4,
                          display: "grid",
                          placeItems: "center",
                          backgroundColor: `${inspectedBattleSpectatorTargetTone}16`,
                          border: `1px solid ${inspectedBattleSpectatorTargetTone}26`,
                        }}
                      >
                        <EntityIcon
                          type={inspectedBattleSpectatorTargetIconType}
                          width={20}
                          height={20}
                          color={inspectedBattleSpectatorTargetTone}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 10.2,
                            letterSpacing: "0.12em",
                            color: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          LIVE INSPECTOR
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: 16.4,
                            fontWeight: 800,
                            color: "#ecfffb",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {inspectedBattleSpectatorTarget.kind === "unit"
                            ? inspectedBattleSpectatorTarget.unit.name
                            : inspectedBattleSpectatorTarget.weapon.name}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: 11.8,
                            color: "rgba(236, 255, 251, 0.7)",
                          }}
                        >
                          {inspectedBattleSpectatorTarget.kind === "unit"
                            ? `${inspectedBattleSpectatorTarget.unit.sideName} · ${formatBattleSpectatorEntityType(
                                inspectedBattleSpectatorTarget.unit.entityType
                              )}`
                            : `${inspectedBattleSpectatorTarget.weapon.sideName} · 유도탄`}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      sx={{
                        flexShrink: 0,
                        px: 0.8,
                        py: 0.3,
                        borderRadius: 99,
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: inspectedBattleSpectatorTargetTone,
                        backgroundColor: `${inspectedBattleSpectatorTargetTone}14`,
                        border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                      }}
                    >
                      {inspectedBattleSpectatorTarget.kind === "unit"
                        ? "자산"
                        : "탄체"}
                    </Typography>
                  </Stack>
                  {inspectedBattleSpectatorTarget.kind === "unit" ? (
                    <>
                      <Box
                        sx={{
                          mt: 1,
                          p: 0.95,
                          borderRadius: 1.5,
                          background: `linear-gradient(180deg, ${inspectedBattleSpectatorTargetTone}16 0%, rgba(255, 255, 255, 0.03) 100%)`,
                          border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10.4,
                            letterSpacing: "0.1em",
                            color: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          QUICK READ
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.3,
                            fontSize: 12.2,
                            color: "rgba(236, 255, 251, 0.82)",
                          }}
                        >
                          표적{" "}
                          {inspectedBattleSpectatorTarget.insight.targetName ??
                            "미지정"}{" "}
                          · 접근 탄체{" "}
                          {
                            inspectedBattleSpectatorTarget.insight
                              .incomingWeapons
                          }
                          발 · 발사 중{" "}
                          {
                            inspectedBattleSpectatorTarget.insight
                              .outgoingWeapons
                          }
                          발
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mt: 0.9,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: 0.7,
                        }}
                      >
                        {[
                          [
                            "체력",
                            formatBattleSpectatorHp(
                              inspectedBattleSpectatorTarget.unit.hpFraction
                            ),
                          ],
                          [
                            "속도",
                            `${Math.round(
                              inspectedBattleSpectatorTarget.unit.speedKts
                            )} kt`,
                          ],
                          [
                            "무장",
                            `${inspectedBattleSpectatorTarget.unit.weaponCount}`,
                          ],
                          [
                            "연료",
                            formatBattleSpectatorFuelFraction(
                              inspectedBattleSpectatorTarget.unit.fuelFraction
                            ),
                          ],
                        ].map(([label, value]) => (
                          <Box
                            key={label}
                            sx={{
                              p: 0.8,
                              borderRadius: 1.4,
                              backgroundColor: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                color: "rgba(236, 255, 251, 0.62)",
                              }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.2,
                                fontSize: 12.2,
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
                          fontSize: 11.9,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        탐지{" "}
                        {formatBattleSpectatorRangeNm(
                          inspectedBattleSpectatorTarget.unit.detectionRangeNm
                        )}{" "}
                        · 교전{" "}
                        {formatBattleSpectatorRangeNm(
                          inspectedBattleSpectatorTarget.unit.engagementRangeNm
                        )}{" "}
                        · 방위{" "}
                        {formatBattleSpectatorHeading(
                          inspectedBattleSpectatorTarget.unit.headingDeg
                        )}
                      </Typography>
                      {inspectedBattleSpectatorTarget.unit.statusFlags.length >
                        0 && (
                        <Stack
                          direction="row"
                          spacing={0.55}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          {inspectedBattleSpectatorTarget.unit.statusFlags
                            .slice(0, 5)
                            .map((statusFlag) => (
                              <Typography
                                key={statusFlag}
                                sx={{
                                  px: 0.7,
                                  py: 0.24,
                                  borderRadius: 99,
                                  fontSize: 10.3,
                                  color: "rgba(236, 255, 251, 0.76)",
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                }}
                              >
                                {statusFlag}
                              </Typography>
                            ))}
                        </Stack>
                      )}
                      <Stack
                        direction="row"
                        spacing={0.7}
                        sx={{ mt: 1, flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            const framing =
                              resolveBattleSpectatorUnitFocusFraming(
                                inspectedBattleSpectatorTarget.unit
                              );
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                              cameraProfile:
                                resolveBattleSpectatorUnitCameraProfile(
                                  inspectedBattleSpectatorTarget.unit
                                ),
                              durationSeconds: framing.durationSeconds,
                              headingDegrees: framing.headingDegrees,
                              pitchDegrees: framing.pitchDegrees,
                              rangeMeters: framing.rangeMeters,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            color: "#041215",
                            backgroundColor: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          추적 보기
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                              cameraProfile: "side",
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: `${inspectedBattleSpectatorTargetTone}44`,
                            color: "#ecfffb",
                          }}
                        >
                          측면 보기
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                              cameraProfile: "orbit",
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: `${inspectedBattleSpectatorTargetTone}44`,
                            color: "#ecfffb",
                          }}
                        >
                          오비트 보기
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            closeBattleSpectatorHeroView();
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId: undefined,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: "rgba(255, 255, 255, 0.14)",
                            color: "rgba(236, 255, 251, 0.84)",
                          }}
                        >
                          개요 보기
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          mt: 1,
                          p: 0.95,
                          borderRadius: 1.5,
                          background: `linear-gradient(180deg, ${inspectedBattleSpectatorTargetTone}16 0%, rgba(255, 255, 255, 0.03) 100%)`,
                          border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10.4,
                            letterSpacing: "0.1em",
                            color: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          TRAJECTORY
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.3,
                            fontSize: 12.2,
                            color: "rgba(236, 255, 251, 0.82)",
                          }}
                        >
                          {inspectedBattleSpectatorTarget.trajectory
                            ?.phaseLabel ?? "비행 중"}{" "}
                          · ETA{" "}
                          {inspectedBattleSpectatorTarget.impactTimeline
                            ? formatBattleSpectatorEta(
                                inspectedBattleSpectatorTarget.impactTimeline
                                  .etaSec
                              )
                            : "계산 중"}{" "}
                          · 위협 반경{" "}
                          {formatBattleSpectatorThreatRadius(
                            inspectedBattleSpectatorTarget.trajectory
                              ?.threatRadiusMeters ?? 0
                          )}
                        </Typography>
                        {typeof inspectedBattleSpectatorTarget.trajectory
                          ?.progressPercent === "number" && (
                          <Box
                            sx={{
                              mt: 0.8,
                              height: 7,
                              borderRadius: 999,
                              overflow: "hidden",
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${Math.max(
                                  6,
                                  Math.round(
                                    inspectedBattleSpectatorTarget.trajectory
                                      .progressPercent
                                  )
                                )}%`,
                                height: "100%",
                                backgroundColor:
                                  inspectedBattleSpectatorTargetTone,
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      <Box
                        sx={{
                          mt: 0.9,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: 0.7,
                        }}
                      >
                        {[
                          [
                            "속도",
                            `${Math.round(
                              inspectedBattleSpectatorTarget.weapon.speedKts
                            )} kt`,
                          ],
                          [
                            "발사",
                            inspectedBattleSpectatorTarget.weapon.launcherName,
                          ],
                          [
                            "목표",
                            inspectedBattleSpectatorTarget.trajectory
                              ?.targetName ??
                              inspectedBattleSpectatorTarget.targetUnit?.name ??
                              "미상",
                          ],
                          [
                            "시점",
                            formatBattleSpectatorCameraProfileLabel(
                              battleSpectatorCameraProfile
                            ),
                          ],
                        ].map(([label, value]) => (
                          <Box
                            key={label}
                            sx={{
                              p: 0.8,
                              borderRadius: 1.4,
                              backgroundColor: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                color: "rgba(236, 255, 251, 0.62)",
                              }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.2,
                                fontSize: 12,
                                fontWeight: 700,
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
                      <Stack
                        direction="row"
                        spacing={0.55}
                        sx={{ mt: 0.8, flexWrap: "wrap" }}
                      >
                        {[
                          inspectedBattleSpectatorTarget.trajectory?.phaseLabel,
                          inspectedBattleSpectatorTarget.trajectory
                            ?.targetTypeLabel,
                        ]
                          .filter(
                            (label): label is string =>
                              typeof label === "string" && label.length > 0
                          )
                          .map((label) => (
                            <Typography
                              key={label}
                              sx={{
                                px: 0.7,
                                py: 0.24,
                                borderRadius: 99,
                                fontSize: 10.3,
                                color: "rgba(236, 255, 251, 0.76)",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              {label}
                            </Typography>
                          ))}
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.7}
                        sx={{ mt: 1, flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            const framing =
                              resolveBattleSpectatorWeaponFocusFraming(
                                inspectedBattleSpectatorTarget.weapon
                              );
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorWeaponJumpPoint(
                                inspectedBattleSpectatorTarget.weapon
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              cameraProfile: "chase",
                              durationSeconds: framing.durationSeconds,
                              headingDegrees: framing.headingDegrees,
                              pitchDegrees: framing.pitchDegrees,
                              rangeMeters: framing.rangeMeters,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            color: "#041215",
                            backgroundColor: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          탄체 추적
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorWeaponJumpPoint(
                                inspectedBattleSpectatorTarget.weapon
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              cameraProfile: "side",
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: `${inspectedBattleSpectatorTargetTone}44`,
                            color: "#ecfffb",
                          }}
                        >
                          측면 축선
                        </Button>
                        {(() => {
                          const launcherUnit =
                            inspectedBattleSpectatorTarget.launcherUnit;
                          if (!launcherUnit) {
                            return null;
                          }

                          return (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                openBattleSpectatorHeroView(
                                  `unit:${launcherUnit.id}`
                                );
                                focusBattleSpectatorView({
                                  point:
                                    resolveBattleSpectatorUnitJumpPoint(
                                      launcherUnit
                                    ),
                                  followTargetId: `unit:${launcherUnit.id}`,
                                  sideFilterId: launcherUnit.sideId,
                                  cameraProfile:
                                    resolveBattleSpectatorUnitCameraProfile(
                                      launcherUnit
                                    ),
                                });
                              }}
                              sx={{
                                minWidth: 0,
                                borderColor: "rgba(255, 255, 255, 0.14)",
                                color: "rgba(236, 255, 251, 0.84)",
                              }}
                            >
                              발사 플랫폼
                            </Button>
                          );
                        })()}
                        {(inspectedBattleSpectatorTarget.targetUnit ??
                          inspectedBattleSpectatorTarget.trajectory
                            ?.targetPoint) && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              if (inspectedBattleSpectatorTarget.targetUnit) {
                                openBattleSpectatorHeroView(
                                  `unit:${inspectedBattleSpectatorTarget.targetUnit.id}`
                                );
                              } else {
                                closeBattleSpectatorHeroView();
                              }
                              focusBattleSpectatorView({
                                point: inspectedBattleSpectatorTarget.targetUnit
                                  ? resolveBattleSpectatorUnitJumpPoint(
                                      inspectedBattleSpectatorTarget.targetUnit
                                    )
                                  : (inspectedBattleSpectatorTarget.trajectory
                                      ?.targetPoint as {
                                      longitude: number;
                                      latitude: number;
                                      altitudeMeters: number;
                                    }),
                                followTargetId:
                                  inspectedBattleSpectatorTarget.targetUnit
                                    ? `unit:${inspectedBattleSpectatorTarget.targetUnit.id}`
                                    : undefined,
                                sideFilterId:
                                  inspectedBattleSpectatorTarget.targetUnit
                                    ?.sideId,
                                cameraProfile: "side",
                              });
                            }}
                            sx={{
                              minWidth: 0,
                              borderColor: "rgba(255, 255, 255, 0.14)",
                              color: "rgba(236, 255, 251, 0.84)",
                            }}
                          >
                            목표 지점
                          </Button>
                        )}
                      </Stack>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontSize: 10.2,
                      letterSpacing: "0.12em",
                      color: "#7fe7ff",
                    }}
                  >
                    LIVE INSPECTOR
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#ecfffb",
                    }}
                  >
                    지형 위 전력이나 탄체를 클릭하세요
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    클릭 즉시 이 카드가 상태 패널로 바뀌고, 추적·측면·오비트
                    같은 세부 시점을 바로 전환할 수 있습니다.
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.6}
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    {["CLICK", "TRACK", "SIDE", "ORBIT"].map((label) => (
                      <Typography
                        key={label}
                        sx={{
                          px: 0.72,
                          py: 0.28,
                          borderRadius: 99,
                          fontSize: 10.4,
                          color: "rgba(236, 255, 251, 0.8)",
                          backgroundColor: "rgba(127, 231, 255, 0.08)",
                          border: "1px solid rgba(127, 231, 255, 0.16)",
                        }}
                      >
                        {label}
                      </Typography>
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          )}
          {battleSpectatorEnabled && game && (
            <BattleSpectatorScenarioSidebar
              game={game}
              battleSpectator={displayedBattleSpectator}
              focusFireAirwatch={currentFocusFireAirwatch}
              scenarioName={battleSpectatorScenarioName}
              scenarioPaused={battleSpectatorScenarioPaused}
              scenarioTimeCompression={battleSpectatorScenarioTimeCompression}
              visibleScenarioPresets={visibleBattleSpectatorScenarioPresets}
              presetListExpanded={battleSpectatorPresetListExpanded}
              selectedUnit={selectedBattleSpectatorUnit}
              selectedUnitTargetName={
                selectedBattleSpectatorInsight?.targetName ?? null
              }
              onNewScenario={handleBattleSpectatorNewScenario}
              onLoadScenarioClick={() =>
                battleSpectatorScenarioFileInputRef.current?.click()
              }
              onRestartScenario={handleBattleSpectatorRestartScenario}
              onStepScenario={handleBattleSpectatorStepScenario}
              onTogglePlay={handleBattleSpectatorTogglePlay}
              onToggleTimeCompression={
                handleBattleSpectatorToggleTimeCompression
              }
              onExportScenario={handleBattleSpectatorExportScenario}
              onRenameScenario={handleBattleSpectatorRenameScenario}
              onTogglePresetListExpanded={() =>
                setBattleSpectatorPresetListExpanded(
                  (currentValue) => !currentValue
                )
              }
              onLoadPresetScenario={(preset) =>
                loadBattleSpectatorPresetScenario(
                  preset as FlightSimScenarioPresetDefinition
                )
              }
              onFocusObjective={handleBattleSpectatorFocusObjective}
              onFocusSelectedUnit={
                selectedBattleSpectatorUnit
                  ? () => {
                      closeBattleSpectatorHeroView();
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorUnitJumpPoint(
                          selectedBattleSpectatorUnit
                        ),
                        followTargetId: undefined,
                        sideFilterId: selectedBattleSpectatorUnit.sideId,
                      });
                    }
                  : undefined
              }
              onTrackSelectedUnit={
                selectedBattleSpectatorUnit
                  ? () => {
                      openBattleSpectatorHeroView(
                        `unit:${selectedBattleSpectatorUnit.id}`
                      );
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorUnitJumpPoint(
                          selectedBattleSpectatorUnit
                        ),
                        followTargetId: `unit:${selectedBattleSpectatorUnit.id}`,
                        sideFilterId: selectedBattleSpectatorUnit.sideId,
                        cameraProfile: resolveBattleSpectatorUnitCameraProfile(
                          selectedBattleSpectatorUnit
                        ),
                        durationSeconds: resolveBattleSpectatorUnitFocusFraming(
                          selectedBattleSpectatorUnit
                        ).durationSeconds,
                        headingDegrees: resolveBattleSpectatorUnitFocusFraming(
                          selectedBattleSpectatorUnit
                        ).headingDegrees,
                        pitchDegrees: resolveBattleSpectatorUnitFocusFraming(
                          selectedBattleSpectatorUnit
                        ).pitchDegrees,
                        rangeMeters: resolveBattleSpectatorUnitFocusFraming(
                          selectedBattleSpectatorUnit
                        ).rangeMeters,
                      });
                    }
                  : undefined
              }
            />
          )}
        </Stack>
        <Box
          component="iframe"
          ref={iframeRef}
          title={selectedFlightSimTitle}
          src={iframeSrc}
          onLoad={() => setFlightSimFrameReady(true)}
          sx={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            backgroundColor: "#02060c",
            borderRadius: battleSpectatorEnabled ? { xs: 0, md: 3 } : 0,
            boxShadow: battleSpectatorEnabled
              ? "0 26px 80px rgba(0, 0, 0, 0.42)"
              : "none",
            outline: battleSpectatorEnabled
              ? "1px solid rgba(127, 231, 255, 0.08)"
              : "none",
          }}
        />
        {battleSpectatorEnabled && battleSpectatorHeroView && (
          <BattleSpectatorHeroViewport
            view={battleSpectatorHeroView}
            onClose={closeBattleSpectatorHeroView}
          />
        )}

        {loadingOverlayVisible && (
          <Stack
            spacing={1.2}
            alignItems="center"
            justifyContent="center"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at center, rgba(8, 18, 30, 0.88) 0%, rgba(2, 6, 12, 0.96) 100%)",
              color: "#eef7fb",
              pointerEvents: "none",
            }}
          >
            <CircularProgress
              size={42}
              thickness={4}
              sx={{ color: "#7fe7ff" }}
            />
            <Typography sx={{ fontWeight: 700 }}>
              {loadingStatusLabel}
            </Typography>
            <Typography sx={{ color: "rgba(238, 247, 251, 0.72)" }}>
              {selectedFlightSimTitle}
            </Typography>
          </Stack>
        )}
      </Box>
    </>
  );
}
