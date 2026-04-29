// @ts-nocheck

export default function RlLabResultsColumn({ ctx }) {
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
                    title="실행 패널"
                    info={
                      "실행 패널은 학습 시작, 중지, 새로고침, 아티팩트 다운로드를 담당합니다.\n결과 관측은 상단 대시보드에서 먼저 하고, 여기서는 제어와 내보내기에 집중하면 됩니다."
                    }
                  />
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleStartTraining}
                      disabled={
                        startingJob ||
                        job?.status === "running" ||
                        !readyToTrain
                      }
                      sx={PRIMARY_BUTTON_SX}
                    >
                      학습 시작
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<StopIcon />}
                      onClick={() => {
                        void handleCancelTraining().catch((error) => {
                          setPageError(
                            error instanceof Error
                              ? error.message
                              : "RL job cancellation failed."
                          );
                        });
                      }}
                      disabled={!jobId || job?.status !== "running"}
                    >
                      중지
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => {
                        void refreshJob().catch((error) => {
                          setPageError(
                            error instanceof Error
                              ? error.message
                              : "RL job refresh failed."
                          );
                        });
                      }}
                      disabled={!jobId}
                    >
                      새로고침
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={() => openArtifact("summary")}
                      disabled={!job?.artifacts.summary}
                    >
                      요약 JSON
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={() => openArtifact("evalScenario")}
                      disabled={!job?.artifacts.evalScenario}
                    >
                      평가 시나리오
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon />}
                      onClick={() => openArtifact("model")}
                      disabled={!job?.artifacts.model}
                    >
                      모델 ZIP
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip label={`상태 ${formatStatusLabel(job?.status)}`} />
                    {jobId && <Chip label={`Job ${jobId.slice(0, 8)}`} />}
                    <Chip
                      label={`선택 알고리즘 ${form.algorithms.map(formatAlgorithmLabel).join(", ")}`}
                    />
                    {job?.progress && (
                      <Chip
                        label={`진행 ${job.progress.current_timesteps} / ${job.progress.timesteps_target}`}
                      />
                    )}
                    {job?.progress?.overall_timesteps_target !== undefined && (
                      <Chip
                        label={`전체 ${job.progress.overall_timesteps ?? 0} / ${job.progress.overall_timesteps_target}`}
                      />
                    )}
                    {currentAlgorithm && (
                      <Chip
                        label={`현재 알고리즘 ${formatAlgorithmLabel(currentAlgorithm)}`}
                      />
                    )}
                    <Chip
                      color={readyToTrain ? "success" : "default"}
                      label={readyToTrain ? "학습 준비 완료" : "입력 확인 필요"}
                    />
                    <Chip
                      label={`발사 보조 ${form.guidedLaunchBootstrapSteps} step`}
                    />
                  </Stack>
                  <Divider />

                  <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                    로컬 실행 명령 미리보기
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      borderRadius: 2,
                      ...DARK_PANEL_SX,
                      whiteSpace: "pre-wrap",
                      overflowX: "auto",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      fontSize: 12,
                      fontFamily: 'Consolas, "Courier New", monospace',
                    }}
                  >
                    {commandPreview}
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    sx={{ justifyContent: "space-between", gap: 1 }}
                  >
                    <RlAccordionHeader
                      title="최근 실험"
                      info={
                        "최근 실험은 이전 실행 결과를 다시 여는 곳입니다.\n동일한 시나리오에서 여러 실험을 비교할 때는 여기서 원하는 job을 다시 불러오면 됩니다."
                      }
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        void refreshJobs().catch((error) => {
                          setPageError(
                            error instanceof Error
                              ? error.message
                              : "RL job list refresh failed."
                          );
                        });
                      }}
                    >
                      목록 새로고침
                    </Button>
                  </Stack>

                  {loadingJobs && <LinearProgress />}

                  {jobs.length === 0 && !loadingJobs && (
                    <Typography variant="body2" sx={MUTED_TEXT_SX}>
                      아직 실행한 RL 실험이 없습니다.
                    </Typography>
                  )}

                  <Stack spacing={1}>
                    {jobs.slice(0, 6).map((candidateJob) => {
                      const candidateLatestCheckpoint =
                        candidateJob.progress?.checkpoints.at(-1);
                      const candidateEvaluation =
                        candidateJob.summary?.evaluation ??
                        candidateJob.progress?.final_evaluation;
                      const candidateAlgorithm =
                        candidateJob.summary?.selected_algorithm ??
                        candidateJob.summary?.best_run?.algorithm ??
                        candidateJob.progress?.best_run?.algorithm ??
                        candidateJob.progress?.current_algorithm ??
                        candidateJob.request.algorithms?.[0];
                      const candidateDisplayLabel =
                        candidateJob.displayLabel ??
                        candidateJob.request.experimentLabel ??
                        null;

                      return (
                        <Box
                          key={candidateJob.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
                            backgroundColor:
                              candidateJob.id === jobId
                                ? RL_LAB_PALETTE.accentSoft
                                : RL_LAB_PALETTE.surfaceRaised,
                            color: RL_LAB_PALETTE.text,
                          }}
                        >
                          <Stack spacing={1}>
                            {(candidateDisplayLabel ||
                              candidateJob.scenarioName) && (
                              <Stack spacing={0.25}>
                                {candidateDisplayLabel && (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {candidateDisplayLabel}
                                  </Typography>
                                )}
                                {candidateJob.scenarioName && (
                                  <Typography
                                    variant="caption"
                                    sx={MUTED_TEXT_SX}
                                  >
                                    시나리오: {candidateJob.scenarioName}
                                  </Typography>
                                )}
                              </Stack>
                            )}
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              sx={{ justifyContent: "space-between", gap: 1 }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: "wrap" }}
                              >
                                <Chip
                                  size="small"
                                  color={statusColor(candidateJob.status)}
                                  label={formatStatusLabel(candidateJob.status)}
                                />
                                <Chip
                                  size="small"
                                  label={`Job ${candidateJob.id.slice(0, 8)}`}
                                />
                                <Chip
                                  size="small"
                                  label={formatRelativeTimestamp(
                                    candidateJob.createdAt
                                  )}
                                />
                                {candidateJob.id === jobId && (
                                  <Chip
                                    size="small"
                                    color="success"
                                    label="현재 열림"
                                  />
                                )}
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: "wrap" }}
                              >
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setJobId(candidateJob.id)}
                                >
                                  결과 열기
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    void handleRestoreJobRequest(candidateJob);
                                  }}
                                  disabled={restoringJobId === candidateJob.id}
                                >
                                  {restoringJobId === candidateJob.id
                                    ? "불러오는 중"
                                    : "설정 복원"}
                                </Button>
                              </Stack>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ flexWrap: "wrap" }}
                            >
                              <Chip
                                size="small"
                                label={`Timesteps ${candidateJob.request.timesteps}`}
                              />
                              <Chip
                                size="small"
                                label={`Bootstrap ${
                                  candidateJob.request
                                    .guidedLaunchBootstrapSteps ?? 0
                                }`}
                              />
                              <Chip
                                size="small"
                                label={`Algo ${formatAlgorithmLabel(candidateAlgorithm)}`}
                              />
                              <Chip
                                size="small"
                                label={`Win ${formatPercent(
                                  candidateEvaluation?.success_rate ??
                                    candidateEvaluation?.win_rate ??
                                    candidateLatestCheckpoint?.eval_success_rate
                                )}`}
                              />
                              <Chip
                                size="small"
                                label={`Eval ${formatOptionalNumber(
                                  candidateEvaluation?.mean_reward ??
                                    candidateLatestCheckpoint?.eval_mean_reward
                                )}`}
                              />
                              <Chip
                                size="small"
                                label={`Target ${formatSelectedTargets(
                                  candidateEvaluation?.selected_target_id,
                                  candidateEvaluation?.selected_target_ids ??
                                    candidateLatestCheckpoint?.selected_target_ids
                                )}`}
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>


              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="최신 평가 요약"
                    info={
                      "최신 평가 요약은 상단 대시보드보다 더 자세한 항목을 보여줍니다.\n알고리즘 비교, 체크포인트 리플레이 목록, 멀티시드 상세는 이 영역에서 확인합니다."
                    }
                  />
                  <Stack direction="row" spacing={1.5} sx={WRAP_ROW_SX}>
                    <Chip
                      label={`Algorithm ${formatAlgorithmLabel(currentAlgorithm)}`}
                    />
                    <Chip
                      label={`Mode ${
                        job?.summary?.training_mode ??
                        job?.progress?.training_mode ??
                        (form.curriculumEnabled ? "curriculum" : "standard")
                      }`}
                    />
                    <Chip
                      label={`Win ${formatPercent(
                        finalEvaluation?.success_rate ??
                          finalEvaluation?.win_rate ??
                          latestCheckpoint?.eval_success_rate
                      )}`}
                    />
                    <Chip
                      label={`Latest eval ${
                        latestCheckpoint
                          ? latestCheckpoint.eval_mean_reward.toFixed(1)
                          : "-"
                      }`}
                    />
                    <Chip
                      label={`Done ${
                        finalEvaluation?.done_reason ??
                        latestCheckpoint?.done_reason ??
                        "-"
                      }`}
                    />
                    <Chip
                      label={`Target ${formatSelectedTargets(
                        finalEvaluation?.selected_target_id,
                        finalEvaluation?.selected_target_ids ??
                          latestCheckpoint?.selected_target_ids
                      )}`}
                    />
                    <Chip
                      label={`Launch ${
                        finalEvaluation?.launch_count ??
                        latestCheckpoint?.launch_count ??
                        0
                      }`}
                    />
                    <Chip
                      label={`Seeds ${
                        finalEvaluation?.benchmark_seed_count ??
                        job?.summary?.eval_seed_count ??
                        form.evalSeedCount
                      }`}
                    />
                    <Chip
                      label={`Replay Seed ${
                        finalEvaluation?.recording_seed ?? "-"
                      }`}
                    />
                    <Chip
                      label={`Survival ${formatPercent(
                        finalEvaluation?.survivability,
                        1
                      )}`}
                    />
                    <Chip
                      label={`Efficiency ${formatMetricNumber(
                        finalEvaluation?.weapon_efficiency,
                        2
                      )}`}
                    />
                    <Chip
                      label={`Ready ${formatMetricNumber(
                        finalEvaluation?.time_to_ready,
                        1
                      )}`}
                    />
                    <Chip
                      label={`TOT ${formatMetricNumber(
                        finalEvaluation?.tot_quality,
                        2
                      )}`}
                    />
                    <Chip
                      label={`Obs v${
                        finalEvaluation?.observation_version ??
                        job?.summary?.observation_version ??
                        "-"
                      } / Reward v${
                        finalEvaluation?.reward_version ??
                        job?.summary?.reward_version ??
                        "-"
                      }`}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ ...MUTED_TEXT_SX, ...BREAK_TEXT_SX }}
                  >
                    선택 기준:{" "}
                    {job?.summary?.selection_metric ??
                      "success_rate_then_mean_reward_then_shorter_mean_episode_steps"}
                  </Typography>
                  {finalEvaluation?.seed_variability_warning && (
                    <Alert severity="warning">
                      seed별 편차가 큽니다. 변동 원인:{" "}
                      {formatSeedVariabilityReasons(
                        finalEvaluation.seed_variability?.reasons
                      )}
                    </Alert>
                  )}
                  {Object.keys(
                    finalEvaluation?.selected_target_assignments ??
                      latestCheckpoint?.selected_target_assignments ??
                      {}
                  ).length > 0 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {Object.entries(
                        finalEvaluation?.selected_target_assignments ??
                          latestCheckpoint?.selected_target_assignments ??
                          {}
                      ).map(([allyId, targetId]) => (
                        <Chip
                          key={`${allyId}-${targetId}`}
                          size="small"
                          variant="outlined"
                          label={`${allyId} -> ${targetId}`}
                        />
                      ))}
                    </Stack>
                  )}
                  {metricLeaderEntries.length > 0 && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                        Metric Leader
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: "wrap" }}
                      >
                        {metricLeaderEntries.map((leader) => (
                          <Chip
                            key={leader.metric}
                            size="small"
                            variant={
                              leader.metric === "overall"
                                ? "filled"
                                : "outlined"
                            }
                            color={
                              leader.metric === "overall"
                                ? "success"
                                : "default"
                            }
                            label={`${formatMetricLeaderLabel(
                              leader.metric
                            )} ${formatAlgorithmLabel(leader.algorithm)}`}
                          />
                        ))}
                        {job?.summary?.retained_models?.model_count !==
                          undefined && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Retained ${
                              job?.summary?.retained_models?.model_count ?? "-"
                            }`}
                          />
                        )}
                      </Stack>
                      {job?.summary?.retained_models?.manifest_path && (
                        <Typography
                          variant="caption"
                          sx={{ ...MUTED_TEXT_SX, ...BREAK_TEXT_SX }}
                        >
                          보관 manifest:{" "}
                          {job?.summary?.retained_models?.manifest_path}
                        </Typography>
                      )}
                    </Stack>
                  )}
                  {orderedAlgorithmRuns.length > 1 && (
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={SECTION_LABEL_SX}>
                        알고리즘 비교
                      </Typography>
                      <Stack spacing={1}>
                        {orderedAlgorithmRuns.map((run) => (
                          <Box
                            key={run.algorithm}
                            sx={{
                              p: 1.25,
                              borderRadius: 2,
                              border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
                              backgroundColor:
                                run.algorithm ===
                                job?.summary?.selected_algorithm
                                  ? RL_LAB_PALETTE.accentSoft
                                  : RL_LAB_PALETTE.surfaceRaised,
                              color: RL_LAB_PALETTE.text,
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack
                                direction={{ xs: "column", md: "row" }}
                                sx={{ justifyContent: "space-between", gap: 1 }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ flexWrap: "wrap" }}
                                >
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`#${leaderboardRankByAlgorithm.get(run.algorithm) ?? "-"}`}
                                  />
                                  <Chip
                                    size="small"
                                    color={
                                      run.algorithm ===
                                      job?.summary?.selected_algorithm
                                        ? "success"
                                        : "default"
                                    }
                                    label={formatAlgorithmLabel(run.algorithm)}
                                  />
                                  <Chip
                                    size="small"
                                    label={`Win ${formatPercent(
                                      run.evaluation.success_rate ??
                                        run.evaluation.win_rate
                                    )}`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`Eval ${formatOptionalNumber(
                                      run.evaluation.mean_reward
                                    )}`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`Survival ${formatPercent(
                                      run.evaluation.survivability,
                                      1
                                    )}`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`TOT ${formatMetricNumber(
                                      run.evaluation.tot_quality,
                                      2
                                    )}`}
                                  />
                                </Stack>
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`선택 ${run.selection_source ?? "-"}`}
                                />
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: "wrap" }}
                              >
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Done ${
                                    run.evaluation.done_reason ?? "-"
                                  }`}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Steps ${formatOptionalNumber(
                                    run.evaluation.mean_episode_steps,
                                    1
                                  )}`}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Ready ${formatMetricNumber(
                                    run.evaluation.time_to_ready,
                                    1
                                  )}`}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`Model ${run.model_path.split(/[\\\\/]/).at(-1) ?? run.model_path}`}
                                />
                              </Stack>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                  {latestRewardBreakdownLabels.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap" }}
                    >
                      {latestRewardBreakdownLabels.map((label) => (
                        <Chip
                          key={label}
                          size="small"
                          variant="outlined"
                          label={label}
                        />
                      ))}
                    </Stack>
                  )}
                  {checkpointReplayRows.length > 0 && (
                    <Accordion
                      elevation={0}
                      sx={{
                        backgroundColor: RL_LAB_PALETTE.surfaceRaisedStrong,
                        color: RL_LAB_PALETTE.text,
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 700 }}>
                          체크포인트 리플레이 ({checkpointReplayRows.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer sx={TABLE_CONTAINER_SX}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Algorithm</TableCell>
                                <TableCell align="right">Step</TableCell>
                                <TableCell align="right">Win</TableCell>
                                <TableCell align="right">Reward</TableCell>
                                <TableCell align="right">Done</TableCell>
                                <TableCell align="right">Replay</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {checkpointReplayRows.map((checkpoint) => {
                                const checkpointAlgorithm =
                                  checkpoint.algorithm ?? currentAlgorithm;
                                return (
                                  <TableRow
                                    key={`${checkpointAlgorithm ?? "unknown"}-${checkpoint.timesteps}`}
                                  >
                                    <TableCell>
                                      {formatAlgorithmLabel(
                                        checkpointAlgorithm
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {checkpoint.timesteps}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatPercent(
                                        checkpoint.eval_success_rate
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatMetricNumber(
                                        checkpoint.eval_mean_reward,
                                        1
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {checkpoint.done_reason ?? "-"}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<MapIcon />}
                                        onClick={() => {
                                          void handleOpenCheckpointReplayOnMap(
                                            checkpoint
                                          ).catch((error) => {
                                            setPageError(
                                              error instanceof Error
                                                ? error.message
                                                : "Checkpoint replay load failed."
                                            );
                                          });
                                        }}
                                      >
                                        열기
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  {perSeedEvaluations.length > 0 && (
                    <Accordion
                      elevation={0}
                      sx={{
                        backgroundColor: RL_LAB_PALETTE.surfaceRaisedStrong,
                        color: RL_LAB_PALETTE.text,
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 700 }}>
                          멀티시드 결과 상세 ({perSeedEvaluations.length} seeds)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer sx={TABLE_CONTAINER_SX}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Seed</TableCell>
                                <TableCell align="right">Win</TableCell>
                                <TableCell align="right">Reward</TableCell>
                                <TableCell align="right">Survival</TableCell>
                                <TableCell align="right">Efficiency</TableCell>
                                <TableCell align="right">Ready</TableCell>
                                <TableCell align="right">TOT</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {perSeedEvaluations.map((evaluation, index) => (
                                <TableRow
                                  key={`seed-${evaluation.evaluation_seed ?? index}`}
                                >
                                  <TableCell>
                                    {evaluation.evaluation_seed ??
                                      finalEvaluation?.benchmark_seeds?.[
                                        index
                                      ] ??
                                      index + 1}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatPercent(
                                      evaluation.success_rate ??
                                        evaluation.win_rate,
                                      0
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatMetricNumber(
                                      evaluation.mean_reward,
                                      1
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatPercent(evaluation.survivability, 0)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatMetricNumber(
                                      evaluation.weapon_efficiency,
                                      2
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatMetricNumber(
                                      evaluation.time_to_ready,
                                      1
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatMetricNumber(
                                      evaluation.tot_quality,
                                      2
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  {job?.summary && (
                    <Alert severity="success" sx={BREAK_TEXT_SX}>
                      최종 선택 모델: {job.summary.model_path}
                    </Alert>
                  )}
                  {job?.progress?.error && (
                    <Alert severity="error">{job.progress.error}</Alert>
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={SURFACE_PAPER_SX}>
                <Stack spacing={1.5}>
                  <RlAccordionHeader
                    title="실행 로그"
                    info={
                      "Python 학습 스크립트의 stdout/stderr 로그입니다.\n학습이 멈추거나 체크포인트가 안 생길 때는 여기서 에러를 먼저 확인합니다."
                    }
                  />
                  <Box
                    sx={{
                      borderRadius: 2,
                      ...DARK_PANEL_SX,
                      p: 1.5,
                      fontFamily: 'Consolas, "Courier New", monospace',
                      fontSize: 12,
                      minHeight: 180,
                      maxHeight: 360,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      ...BREAK_TEXT_SX,
                    }}
                  >
                    {(job?.stdoutLines ?? []).join("\n") ||
                      "학습 로그가 아직 없습니다."}
                    {job?.stderrLines?.length
                      ? `\n\n[stderr]\n${job.stderrLines.join("\n")}`
                      : ""}
                  </Box>
                </Stack>
              </Paper>
            </Stack>
    </>
  );
}