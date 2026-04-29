// @ts-nocheck

export default function RlLabConfigColumn({ ctx }) {
  const {
    ACCORDION_SX, Accordion, AccordionDetails,
    AccordionSummary, Alert, ArrowBackIcon,
    AutoFixHighOutlinedIcon, BREAK_TEXT_SX, Box,
    Button, CHART_GRID_SX, Chip,
    DARK_PANEL_SX, DASHBOARD_GRID_SX, Divider,
    DownloadOutlinedIcon, Error, ExpandMoreIcon,
    FormControlLabel, LinearProgress, MUTED_TEXT_SX,
    MapIcon, PRIMARY_BUTTON_SX, Paper,
    PlayArrowIcon, RL_LAB_PALETTE, RefreshIcon,
    RlAccordionHeader, RlBattleWatchPanel, RlDashboardMetricCard,
    RlLabCommanderPanel, RlLabInfoButton, RlLabLineChart,
    SECTION_LABEL_SX, SURFACE_PAPER_SX, Stack,
    StopIcon, Switch, TABLE_CONTAINER_SX,
    Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TextField, Typography, UploadFileOutlinedIcon,
    WRAP_ROW_SX, allyIds, applyNoLaunchTimeoutRecovery,
    applyRecommendedScenarioSetup, availableAllies, availableHighValueTargets,
    availableTargets, baselinePreset, battleWatchAssignmentLabels,
    battleWatchCheckpointStep, battleWatchLaunchCount, battleWatchRewardLabel,
    battleWatchTargetLabel, battleWatchWinRateLabel, capabilities,
    checkpointReplayRows, commandPreview, currentAlgorithm,
    dashboardDoneLabel, dashboardExperimentLabel, dashboardModeLabel,
    dashboardProgressLabel, dashboardReadyLabel, dashboardSurvivalLabel,
    episodeRewardPoints, evalRewardPoints, evalSuccessRatePoints,
    fileInputRef, finalEvaluation, form,
    formatAlgorithmLabel, formatCommaSeparatedIds, formatMetricLeaderLabel,
    formatMetricNumber, formatOptionalNumber, formatPercent,
    formatRelativeTimestamp, formatSeedVariabilityReasons, formatSelectedTargets,
    formatStatusLabel, handleApplyDefaultBaselineSetup, handleApplyMapBaselineSetup,
    handleCancelTraining, handleLoadBattleOptimizationDemo, handleLoadDefaultScenario,
    handleLoadFirstSuccessDemo, handleLoadMapScenario, handleOpenCheckpointReplayOnMap,
    handleOpenReplayOnMap, handleRestoreJobRequest, handleStartCheckpointSpectatorOnMap,
    handleStartTraining, handleUploadScenario, hasImportedMapScenario,
    highValueTargetIds, job, jobId,
    jobs, latestCheckpoint, latestReplayCheckpoint,
    latestRewardBreakdownLabels, leaderboardRankByAlgorithm, loadingCapabilities,
    loadingJobs, metricLeaderEntries, noLaunchTimeoutHint,
    openArtifact, orderedAlgorithmRuns, pageError,
    perSeedEvaluations, perSeedSuccessRatePoints, props,
    readyToTrain, refreshJob, refreshJobs,
    resetRewardConfig, restoringJobId, retainAllowedIds,
    scenarioAnalysis, scenarioMessage, selectedAllyIdSet,
    selectedHighValueTargetIdSet, selectedTargetIdSet, selectionIssues,
    setForm, setIdField, setJobId,
    setNumericFormField, setPageError, setRewardField,
    startingJob, statusColor, supportedAlgorithms,
    targetIds, toggleAlgorithmSelection, toggleAllySelection,
    toggleHighValueTargetSelection, toggleTargetSelection,
  } = ctx;

  return (
    <>
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="시나리오 설계"
                    info={
                      "시나리오 JSON과 아군·적 세력 이름, 학습 대상 ID를 조정하는 영역입니다.\n보통은 데모를 불러온 뒤 여기서 필요할 때만 JSON이나 세력 구성을 수정하면 됩니다."
                    }
                  />
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleLoadDefaultScenario}
                    >
                      기본 시나리오
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleLoadMapScenario}
                    >
                      현재 지도 시나리오
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AutoFixHighOutlinedIcon />}
                      onClick={() =>
                        applyRecommendedScenarioSetup(
                          form.scenarioText,
                          "현재 시나리오에 맞춰 추천 구성을 다시 적용했습니다."
                        )
                      }
                      disabled={scenarioAnalysis.status !== "valid"}
                    >
                      추천 재적용
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UploadFileOutlinedIcon />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      JSON 업로드
                    </Button>
                  </Stack>
                  {scenarioAnalysis.status === "valid" && (
                    <Alert severity="success">
                      추천 세팅: 아군{" "}
                      {scenarioAnalysis.recommendedControllableSideName ?? "-"}/
                      적 {scenarioAnalysis.recommendedTargetSideName ?? "-"} /
                      항공기 {scenarioAnalysis.recommendedAllyIds.length}대 /
                      표적 {scenarioAnalysis.recommendedTargetIds.length}개
                    </Alert>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={handleUploadScenario}
                  />
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="아군 세력명"
                      value={form.controllableSideName}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          controllableSideName: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="적 세력명"
                      value={form.targetSideName}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          targetSideName: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    label="아군 항공기 IDs"
                    value={form.allyIds}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        allyIds: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="적 고정 표적 IDs"
                    value={form.targetIds}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        targetIds: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="고가치 표적 IDs"
                    value={form.highValueTargetIds}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        highValueTargetIds: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                  <TextField
                    label="시나리오 JSON"
                    value={form.scenarioText}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        scenarioText: event.target.value,
                      }))
                    }
                    fullWidth
                    multiline
                    minRows={14}
                    maxRows={24}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontFamily: 'Consolas, "Courier New", monospace',
                      },
                    }}
                  />
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="시나리오 카탈로그"
                    info={
                      "현재 시나리오에서 감지한 아군 항공기와 고정 표적 목록입니다.\n칩을 눌러 선택 대상을 바꿀 수 있고, 고가치 표적도 같은 흐름으로 지정할 수 있습니다."
                    }
                  />

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      label={`선택 아군 ${allyIds.length} / ${availableAllies.length}`}
                    />
                    <Chip
                      label={`선택 표적 ${targetIds.length} / ${availableTargets.length}`}
                    />
                    <Chip
                      label={`고가치 표적 ${highValueTargetIds.length} / ${availableHighValueTargets.length}`}
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      sx={{ justifyContent: "space-between", gap: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        아군 항공기 선택
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setIdField(
                              "allyIds",
                              availableAllies.map((ally) => ally.id)
                            )
                          }
                          disabled={availableAllies.length === 0}
                        >
                          전부 선택
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setIdField(
                              "allyIds",
                              scenarioAnalysis.recommendedAllyIds
                            )
                          }
                          disabled={
                            scenarioAnalysis.recommendedAllyIds.length === 0
                          }
                        >
                          추천 사용
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setIdField("allyIds", [])}
                          disabled={allyIds.length === 0}
                        >
                          비우기
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {availableAllies.length > 0 ? (
                        availableAllies.map((ally) => (
                          <Chip
                            key={ally.id}
                            clickable
                            color={
                              selectedAllyIdSet.has(ally.id)
                                ? "success"
                                : "default"
                            }
                            variant={
                              selectedAllyIdSet.has(ally.id)
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() => toggleAllySelection(ally.id)}
                            label={`${ally.id} · 무장 ${ally.weaponCount}`}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={MUTED_TEXT_SX}>
                          선택한 아군 세력에서 사용할 항공기를 찾지 못했습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      sx={{ justifyContent: "space-between", gap: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        고정 표적 선택
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              targetIds: formatCommaSeparatedIds(
                                availableTargets.map((target) => target.id)
                              ),
                              highValueTargetIds: formatCommaSeparatedIds(
                                retainAllowedIds(
                                  highValueTargetIds,
                                  availableTargets.map((target) => target.id)
                                )
                              ),
                            }))
                          }
                          disabled={availableTargets.length === 0}
                        >
                          전부 선택
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              targetIds: formatCommaSeparatedIds(
                                scenarioAnalysis.recommendedTargetIds
                              ),
                              highValueTargetIds: formatCommaSeparatedIds(
                                retainAllowedIds(
                                  scenarioAnalysis.recommendedHighValueTargetIds,
                                  scenarioAnalysis.recommendedTargetIds
                                )
                              ),
                            }))
                          }
                          disabled={
                            scenarioAnalysis.recommendedTargetIds.length === 0
                          }
                        >
                          추천 사용
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              targetIds: "",
                              highValueTargetIds: "",
                            }))
                          }
                          disabled={targetIds.length === 0}
                        >
                          비우기
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {availableTargets.length > 0 ? (
                        availableTargets.map((target) => (
                          <Chip
                            key={target.id}
                            clickable
                            color={
                              selectedTargetIdSet.has(target.id)
                                ? "warning"
                                : "default"
                            }
                            variant={
                              selectedTargetIdSet.has(target.id)
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() => toggleTargetSelection(target.id)}
                            label={`${target.id} · ${target.kind}`}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={MUTED_TEXT_SX}>
                          선택한 적 세력에서 사용할 고정 표적을 찾지 못했습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      sx={{ justifyContent: "space-between", gap: 1 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        고가치 표적 선택
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setIdField(
                              "highValueTargetIds",
                              retainAllowedIds(
                                scenarioAnalysis.recommendedHighValueTargetIds,
                                targetIds
                              )
                            )
                          }
                          disabled={targetIds.length === 0}
                        >
                          추천 사용
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setIdField("highValueTargetIds", [])}
                          disabled={highValueTargetIds.length === 0}
                        >
                          비우기
                        </Button>
                      </Stack>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {availableHighValueTargets.length > 0 ? (
                        availableHighValueTargets.map((target) => (
                          <Chip
                            key={target.id}
                            clickable
                            color={
                              selectedHighValueTargetIdSet.has(target.id)
                                ? "error"
                                : "default"
                            }
                            variant={
                              selectedHighValueTargetIdSet.has(target.id)
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() =>
                              toggleHighValueTargetSelection(target.id)
                            }
                            label={target.id}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={MUTED_TEXT_SX}>
                          먼저 고정 표적을 선택하면 여기서 고가치 표적을 지정할
                          수 있습니다.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="학습 설정"
                    info={
                      "알고리즘, timesteps, evaluation 주기, seed, bootstrap을 조정합니다.\n모델 선택은 success rate 우선, 동률이면 mean reward, 그다음 episode 길이 순입니다."
                    }
                  />
                  <TextField
                    label="실험 라벨"
                    value={form.experimentLabel}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        experimentLabel: event.target.value,
                      }))
                    }
                    placeholder="예: Codex 첫 사용자 점검 2026-04-16"
                    fullWidth
                  />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                      알고리즘 비교
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {supportedAlgorithms.map((algorithm) => {
                        const selected = form.algorithms.includes(algorithm);
                        return (
                          <Chip
                            key={algorithm}
                            clickable
                            color={selected ? "success" : "default"}
                            variant={selected ? "filled" : "outlined"}
                            onClick={() => toggleAlgorithmSelection(algorithm)}
                            label={formatAlgorithmLabel(algorithm)}
                          />
                        );
                      })}
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`선택 기준 ${form.evalSeedCount} seeds`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          form.curriculumEnabled
                            ? "Mode Curriculum"
                            : "Mode Standard"
                        }
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Bootstrap ${form.guidedLaunchBootstrapSteps} step`}
                      />
                    </Stack>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.curriculumEnabled}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              curriculumEnabled: event.target.checked,
                            }))
                          }
                        />
                      }
                      label="커리큘럼 학습 사용"
                    />
                    {form.curriculumEnabled && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label="Stage 통과 후 다음 난이도로 이동"
                      />
                    )}
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Timesteps"
                      type="number"
                      value={form.timesteps}
                      onChange={(event) =>
                        setNumericFormField("timesteps", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Max Episode Steps"
                      type="number"
                      value={form.maxEpisodeSteps}
                      onChange={(event) =>
                        setNumericFormField(
                          "maxEpisodeSteps",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Eval Episodes"
                      type="number"
                      value={form.evalEpisodes}
                      onChange={(event) =>
                        setNumericFormField("evalEpisodes", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Eval Seed Count"
                      type="number"
                      value={form.evalSeedCount}
                      onChange={(event) =>
                        setNumericFormField("evalSeedCount", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Seed"
                      type="number"
                      value={form.seed}
                      onChange={(event) =>
                        setNumericFormField("seed", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Guided Launch Bootstrap"
                      type="number"
                      value={form.guidedLaunchBootstrapSteps}
                      onChange={(event) =>
                        setNumericFormField(
                          "guidedLaunchBootstrapSteps",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Progress Eval Frequency"
                      type="number"
                      value={form.progressEvalFrequency}
                      onChange={(event) =>
                        setNumericFormField(
                          "progressEvalFrequency",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Progress Eval Episodes"
                      type="number"
                      value={form.progressEvalEpisodes}
                      onChange={(event) =>
                        setNumericFormField(
                          "progressEvalEpisodes",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{ justifyContent: "space-between", gap: 1 }}
                  >
                    <RlAccordionHeader
                      title="보상 계수 설계"
                      info={
                        "Kill, TOT, ETA, Threat, Launch, Time, Terminal 보상을 조정합니다.\n가시적인 설명은 숨겼고, 실제 의미는 상단 보상 해석 카드와 최신 평가 요약에서 바로 확인할 수 있습니다."
                      }
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={resetRewardConfig}
                    >
                      기본값 복원
                    </Button>
                  </Stack>
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                    Terminal Reward
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Kill Base"
                      type="number"
                      value={form.rewardConfig.killBase}
                      onChange={(event) =>
                        setRewardField("killBase", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="High Value Bonus"
                      type="number"
                      value={form.rewardConfig.highValueTargetBonus}
                      onChange={(event) =>
                        setRewardField(
                          "highValueTargetBonus",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Success Bonus"
                      type="number"
                      value={form.rewardConfig.successBonus}
                      onChange={(event) =>
                        setRewardField("successBonus", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Failure Penalty"
                      type="number"
                      value={form.rewardConfig.failurePenalty}
                      onChange={(event) =>
                        setRewardField("failurePenalty", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Divider />
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                    Coordination Shaping
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="TOT Weight"
                      type="number"
                      value={form.rewardConfig.totWeight}
                      onChange={(event) =>
                        setRewardField("totWeight", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="TOT Tau Seconds"
                      type="number"
                      value={form.rewardConfig.totTauSeconds}
                      onChange={(event) =>
                        setRewardField("totTauSeconds", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="ETA Progress Weight"
                      type="number"
                      value={form.rewardConfig.etaProgressWeight}
                      onChange={(event) =>
                        setRewardField("etaProgressWeight", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Ready Bonus"
                      type="number"
                      value={form.rewardConfig.readyToFireBonus}
                      onChange={(event) =>
                        setRewardField("readyToFireBonus", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Divider />
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                    Anti-Stagnation Penalty
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Stagnation Penalty"
                      type="number"
                      value={form.rewardConfig.stagnationPenaltyPerAssignment}
                      onChange={(event) =>
                        setRewardField(
                          "stagnationPenaltyPerAssignment",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Target Switch Penalty"
                      type="number"
                      value={form.rewardConfig.targetSwitchPenalty}
                      onChange={(event) =>
                        setRewardField(
                          "targetSwitchPenalty",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Threat Step Penalty"
                      type="number"
                      value={form.rewardConfig.threatStepPenalty}
                      onChange={(event) =>
                        setRewardField("threatStepPenalty", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                  <Divider />
                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                    Cost Shaping
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      label="Launch Cost"
                      type="number"
                      value={form.rewardConfig.launchCostPerWeapon}
                      onChange={(event) =>
                        setRewardField(
                          "launchCostPerWeapon",
                          event.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Time Cost"
                      type="number"
                      value={form.rewardConfig.timeCostPerStep}
                      onChange={(event) =>
                        setRewardField("timeCostPerStep", event.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Loss Penalty"
                      type="number"
                      value={form.rewardConfig.lossPenaltyPerAlly}
                      onChange={(event) =>
                        setRewardField("lossPenaltyPerAlly", event.target.value)
                      }
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
    </>
  );
}