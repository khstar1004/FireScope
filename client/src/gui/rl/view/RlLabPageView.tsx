// @ts-nocheck

import RlLabConfigColumn from "./RlLabConfigColumn";
import RlLabResultsColumn from "./RlLabResultsColumn";

export default function RlLabPageView(ctx) {
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
    <Box
      data-testid="rl-lab-page"
      sx={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
        background: RL_LAB_PALETTE.pageBackground,
        color: RL_LAB_PALETTE.text,
      }}
    >
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 2.5, md: 3.5 },
          "& .MuiChip-root": {
            maxWidth: "100%",
            height: "auto",
            alignItems: "flex-start",
          },
          "& .MuiChip-label": {
            display: "block",
            whiteSpace: "normal",
            lineHeight: 1.25,
            py: 0.75,
            ...BREAK_TEXT_SX,
          },
          "& .MuiInputLabel-root": {
            color: RL_LAB_PALETTE.mutedText,
          },
          "& .MuiFormHelperText-root": {
            color: RL_LAB_PALETTE.subtleText,
          },
          "& .MuiInputBase-input, & .MuiInputBase-inputMultiline": {
            color: RL_LAB_PALETTE.text,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: RL_LAB_PALETTE.surfaceBorder,
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: RL_LAB_PALETTE.accent,
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: RL_LAB_PALETTE.accent,
            },
        }}
      >
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${RL_LAB_PALETTE.surfaceBorder}`,
              background: RL_LAB_PALETTE.heroBackground,
              color: RL_LAB_PALETTE.heroText,
              boxShadow: RL_LAB_PALETTE.shadow,
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ justifyContent: "space-between", gap: 1.5 }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography
                      variant="overline"
                      sx={{ letterSpacing: "0.12em", opacity: 0.72 }}
                    >
                      FIRE SCOPE RL LAB
                    </Typography>
                    <RlLabInfoButton
                      tone="dark"
                      title="강화학습 설계 탭"
                      content={
                        "상단은 결과 대시보드입니다.\n승률, 보상, 표적, 발사 수, 체크포인트를 먼저 보고, 필요할 때만 아래 설계 섹션을 열어 시나리오와 보상을 조정하면 됩니다."
                      }
                    />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    고정표적 타격 강화학습 설계
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={dashboardExperimentLabel}
                      sx={{
                        color: RL_LAB_PALETTE.heroText,
                        borderColor: "rgba(248, 250, 252, 0.18)",
                        backgroundColor: "rgba(248, 250, 252, 0.08)",
                      }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`시나리오 ${
                        scenarioAnalysis.scenarioName ?? "불러오기 대기"
                      }`}
                      sx={{
                        color: RL_LAB_PALETTE.heroText,
                        borderColor: "rgba(248, 250, 252, 0.18)",
                        backgroundColor: "rgba(248, 250, 252, 0.08)",
                      }}
                    />
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1} sx={WRAP_ROW_SX}>
                  <Chip
                    label={formatStatusLabel(job?.status)}
                    color={statusColor(job?.status)}
                    sx={{ fontWeight: 700 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={props.onBack}
                    sx={{
                      color: RL_LAB_PALETTE.heroText,
                      borderColor: "rgba(248, 250, 252, 0.32)",
                    }}
                  >
                    지도 복귀
                  </Button>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleLoadFirstSuccessDemo}
                  sx={PRIMARY_BUTTON_SX}
                >
                  성공 체감 데모
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleLoadBattleOptimizationDemo}
                  sx={PRIMARY_BUTTON_SX}
                >
                  전투·배치 최적화 데모
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleApplyDefaultBaselineSetup}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.32)",
                  }}
                >
                  체험 기본 세팅
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartTraining}
                  disabled={
                    startingJob || job?.status === "running" || !readyToTrain
                  }
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.32)",
                  }}
                >
                  학습 시작
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip
                  variant="outlined"
                  label={`알고리즘 ${form.algorithms
                    .map(formatAlgorithmLabel)
                    .join(", ")}`}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.18)",
                    backgroundColor: "rgba(248, 250, 252, 0.08)",
                  }}
                />
                <Chip
                  variant="outlined"
                  label={`진행 ${dashboardProgressLabel}`}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.18)",
                    backgroundColor: "rgba(248, 250, 252, 0.08)",
                  }}
                />
                <Chip
                  variant="outlined"
                  label={`체크포인트 ${
                    battleWatchCheckpointStep !== null
                      ? battleWatchCheckpointStep
                      : "-"
                  }`}
                  sx={{
                    color: RL_LAB_PALETTE.heroText,
                    borderColor: "rgba(248, 250, 252, 0.18)",
                    backgroundColor: "rgba(248, 250, 252, 0.08)",
                  }}
                />
              </Stack>

              {(job?.status === "running" || startingJob) && <LinearProgress />}
            </Stack>
          </Paper>

          {pageError && <Alert severity="error">{pageError}</Alert>}
          {scenarioMessage && <Alert severity="info">{scenarioMessage}</Alert>}
          {loadingCapabilities && <LinearProgress />}
          {capabilities && !capabilities.available && (
            <Alert severity="warning">
              RL 로컬 API를 찾지 못했습니다. `npm run standalone` 또는 `npm run
              start` 로 client를 띄운 뒤 사용하세요.
            </Alert>
          )}

          <Paper elevation={0} sx={SURFACE_PAPER_SX}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ justifyContent: "space-between", gap: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  학습 대시보드
                </Typography>
                <RlLabInfoButton
                  title="학습 대시보드"
                  content={
                    "강화학습에서 먼저 볼 것은 승률, 보상, 선택 표적, 발사 수, 체크포인트입니다.\n아래 카드와 그래프를 먼저 보고, 결과가 마음에 들지 않을 때만 하단의 시나리오·학습·보상 설정을 조정하면 됩니다."
                  }
                />
              </Stack>

              <Box sx={DASHBOARD_GRID_SX}>
                <RlDashboardMetricCard
                  label="상태"
                  value={formatStatusLabel(job?.status)}
                  meta={`Mode ${dashboardModeLabel}`}
                  info="현재 학습 상태와 학습 모드를 보여줍니다. running이면 정책이 계속 업데이트되고 있는 중입니다."
                />
                <RlDashboardMetricCard
                  label="승률"
                  value={battleWatchWinRateLabel}
                  meta={`Done ${dashboardDoneLabel}`}
                  info="체크포인트 또는 최종 평가 기준 성공률입니다. 가장 먼저 확인할 핵심 지표입니다."
                />
                <RlDashboardMetricCard
                  label="평가 보상"
                  value={battleWatchRewardLabel}
                  meta={`체크포인트 ${battleWatchCheckpointStep ?? "-"}`}
                  info="보상 함수 전체 합계입니다. 승률과 함께 보면 정책이 보상 구조를 제대로 타고 있는지 판단할 수 있습니다."
                />
                <RlDashboardMetricCard
                  label="선택 표적"
                  value={battleWatchTargetLabel}
                  meta={`발사 ${battleWatchLaunchCount}`}
                  info="지금 정책이 집중하는 표적입니다. 표적이 안정되면 행동 정책도 덜 흔들리는 경우가 많습니다."
                />
                <RlDashboardMetricCard
                  label="생존율"
                  value={dashboardSurvivalLabel}
                  meta={`Ready ${dashboardReadyLabel}`}
                  info="아군 보존 정도와 발사 준비 시간을 같이 봅니다. 승률이 높아도 손실이 크면 전술 품질은 낮을 수 있습니다."
                />
                <RlDashboardMetricCard
                  label="학습 진행"
                  value={dashboardProgressLabel}
                  meta={formatAlgorithmLabel(currentAlgorithm)}
                  info="현재 알고리즘과 목표 step 대비 진행량입니다. checkpoint가 쌓일수록 위 그래프도 더 의미 있어집니다."
                />
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => {
                    void handleStartCheckpointSpectatorOnMap().catch((error) => {
                      setPageError(
                        error instanceof Error
                          ? error.message
                          : "Checkpoint spectator could not start."
                      );
                    });
                  }}
                  disabled={!jobId}
                >
                  메인 맵 자동 감시
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => {
                    if (!latestReplayCheckpoint) {
                      return;
                    }
                    void handleOpenCheckpointReplayOnMap(
                      latestReplayCheckpoint
                    ).catch((error) => {
                      setPageError(
                        error instanceof Error
                          ? error.message
                          : "Checkpoint replay load failed."
                      );
                    });
                  }}
                  disabled={!latestReplayCheckpoint}
                >
                  최신 체크포인트 리플레이
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => {
                    void handleOpenReplayOnMap().catch((error) => {
                      setPageError(
                        error instanceof Error
                          ? error.message
                          : "Evaluation replay load failed."
                      );
                    });
                  }}
                  disabled={!job?.artifacts.evalRecording}
                >
                  평가 리플레이 열기
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
                <Button
                  variant="outlined"
                  onClick={handleApplyMapBaselineSetup}
                  disabled={!hasImportedMapScenario}
                >
                  지도 시나리오 기본 세팅
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AutoFixHighOutlinedIcon />}
                  onClick={() =>
                    applyRecommendedScenarioSetup(
                      form.scenarioText,
                      "현재 편집 중인 시나리오를 다시 분석했습니다."
                    )
                  }
                  disabled={scenarioAnalysis.status !== "valid"}
                >
                  추천 구성 적용
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip
                  variant="outlined"
                  label={`기본 체험 ${baselinePreset.label} · ${baselinePreset.values.timesteps} step`}
                />
                <Chip
                  label={`세력 ${scenarioAnalysis.sideSummaries.length}`}
                  color={
                    scenarioAnalysis.status === "valid" ? "success" : "default"
                  }
                />
                <Chip label={`항공기 ${scenarioAnalysis.allyOptions.length}`} />
                <Chip
                  label={`고정 표적 ${scenarioAnalysis.targetOptions.length}`}
                />
                {scenarioAnalysis.recommendedControllableSideName && (
                  <Chip
                    label={`아군 ${scenarioAnalysis.recommendedControllableSideName}`}
                  />
                )}
                {scenarioAnalysis.recommendedTargetSideName && (
                  <Chip
                    label={`적 ${scenarioAnalysis.recommendedTargetSideName}`}
                  />
                )}
              </Stack>

              {selectionIssues.length > 0 &&
                scenarioAnalysis.status === "valid" && (
                  <Alert severity="warning">
                    <Box component="ul" sx={{ pl: 2.5, mb: 0, mt: 0 }}>
                      {selectionIssues.map((issue) => (
                        <li key={issue}>
                          <Typography variant="body2">{issue}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Alert>
                )}

              {scenarioAnalysis.warnings.length > 0 && (
                <Alert severity="info">
                  <Box component="ul" sx={{ pl: 2.5, mb: 0, mt: 0 }}>
                    {scenarioAnalysis.warnings.map((warning) => (
                      <li key={warning}>
                        <Typography variant="body2">{warning}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}

              {scenarioAnalysis.error && (
                <Alert severity="error">{scenarioAnalysis.error}</Alert>
              )}

              {noLaunchTimeoutHint && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={applyNoLaunchTimeoutRecovery}
                    >
                      무발사 시간초과 보정
                    </Button>
                  }
                >
                  최근 평가에서 발사 없이 시간 제한에 걸렸습니다.
                </Alert>
              )}

              <RlBattleWatchPanel
                statusLabel={formatStatusLabel(job?.status)}
                algorithmLabel={formatAlgorithmLabel(currentAlgorithm)}
                latestCheckpointStep={battleWatchCheckpointStep}
                latestWinRateLabel={battleWatchWinRateLabel}
                latestRewardLabel={battleWatchRewardLabel}
                selectedTargetLabel={battleWatchTargetLabel}
                launchCount={battleWatchLaunchCount}
                assignmentLabels={battleWatchAssignmentLabels}
                rewardLabels={latestRewardBreakdownLabels}
                canStartAutoSpectator={Boolean(jobId)}
                canOpenCheckpointReplay={Boolean(latestReplayCheckpoint)}
                canOpenEvaluationReplay={Boolean(job?.artifacts.evalRecording)}
                onStartAutoSpectator={() => {
                  void handleStartCheckpointSpectatorOnMap().catch((error) => {
                    setPageError(
                      error instanceof Error
                        ? error.message
                        : "Checkpoint spectator could not start."
                    );
                  });
                }}
                onOpenCheckpointReplay={() => {
                  if (!latestReplayCheckpoint) {
                    return;
                  }
                  void handleOpenCheckpointReplayOnMap(
                    latestReplayCheckpoint
                  ).catch((error) => {
                    setPageError(
                      error instanceof Error
                        ? error.message
                        : "Checkpoint replay load failed."
                    );
                  });
                }}
                onOpenEvaluationReplay={() => {
                  void handleOpenReplayOnMap().catch((error) => {
                    setPageError(
                      error instanceof Error
                        ? error.message
                        : "Evaluation replay load failed."
                    );
                  });
                }}
              />
            </Stack>
          </Paper>

          <Paper elevation={0} sx={SURFACE_PAPER_SX}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                sx={{ justifyContent: "space-between", gap: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  핵심 그래프
                </Typography>
                <RlLabInfoButton
                  title="핵심 그래프"
                  content={
                    "승률과 평가 보상은 정책이 실제로 좋아지고 있는지 보는 핵심 그래프입니다.\nEpisode reward는 학습 중 흔들림을, 멀티시드는 최종 정책의 안정성을 보여줍니다."
                  }
                />
              </Stack>
              <Box sx={CHART_GRID_SX}>
                <RlLabLineChart
                  title="승률"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartWin}
                  points={evalSuccessRatePoints}
                  emptyLabel="평가가 누적되면 승률 추이가 여기에 표시됩니다."
                />
                <RlLabLineChart
                  title="평가 보상"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartReward}
                  points={evalRewardPoints}
                  emptyLabel="checkpoint 평가 보상이 여기에 누적됩니다."
                />
                <RlLabLineChart
                  title="Episode Reward"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartEpisode}
                  points={episodeRewardPoints}
                  emptyLabel="훈련 중 종료된 episode reward가 여기에 누적됩니다."
                />
                <RlLabLineChart
                  title="멀티시드"
                  subtitle=""
                  color={RL_LAB_PALETTE.chartSeed}
                  points={perSeedSuccessRatePoints}
                  emptyLabel="최종 multi-seed evaluation 이후 안정성이 표시됩니다."
                />
              </Box>
            </Stack>
          </Paper>

          <Accordion defaultExpanded={false} elevation={0} sx={ACCORDION_SX}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <RlAccordionHeader
                title="지휘관 자원·배치 최적화"
                info={
                  "지휘관 탐색은 동일한 RL 평가기를 사용해 자산 조합과 초기 배치를 비교합니다.\n학습이 끝난 뒤 어떤 배치가 더 잘 싸우는지 보고 싶을 때 여기를 엽니다."
                }
              />
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pb: 0 }}>
              <RlLabCommanderPanel
                scenarioText={form.scenarioText}
                scenarioAnalysis={scenarioAnalysis}
                availableAllies={availableAllies}
                controllableSideName={form.controllableSideName}
                targetSideName={form.targetSideName}
                allyIds={allyIds}
                targetIds={targetIds}
                highValueTargetIds={highValueTargetIds}
                selectionIssues={selectionIssues}
                trainingRequest={{
                  algorithms: form.algorithms,
                  timesteps: form.timesteps,
                  maxEpisodeSteps: form.maxEpisodeSteps,
                  evalEpisodes: form.evalEpisodes,
                  evalSeedCount: form.evalSeedCount,
                  curriculumEnabled: form.curriculumEnabled,
                  seed: form.seed,
                  progressEvalFrequency: form.progressEvalFrequency,
                  progressEvalEpisodes: form.progressEvalEpisodes,
                  controllableSideName: form.controllableSideName,
                  targetSideName: form.targetSideName,
                  allyIds,
                  targetIds,
                  highValueTargetIds,
                  rewardConfig: { ...form.rewardConfig },
                }}
                openReplayOnMap={props.openReplayOnMap}
              />
            </AccordionDetails>
          </Accordion>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              alignItems: "start",
              gridTemplateColumns: "minmax(0, 1fr)",
              "@media (min-width: 1800px)": {
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
              },
            }}
          >
            <RlLabConfigColumn ctx={ctx} />
            <RlLabResultsColumn ctx={ctx} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
