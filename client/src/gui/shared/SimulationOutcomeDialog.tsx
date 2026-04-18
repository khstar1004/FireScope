import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type {
  SimulationOutcomeNarrativeSource,
  SimulationOutcomeSummary,
} from "@/gui/analysis/operationInsight";

interface SimulationOutcomeDialogProps {
  open: boolean;
  summary: SimulationOutcomeSummary | null;
  narrative: string;
  narrativeSource: SimulationOutcomeNarrativeSource;
  loading?: boolean;
  onClose: () => void;
}

interface ComparisonRow {
  label: string;
  leftValue: string;
  rightValue: string;
  leftNote?: string;
  rightNote?: string;
  emphasis?: boolean;
}

function formatSignedNumber(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatGap(value: number, unit: string, zeroLabel: string) {
  if (value === 0) {
    return zeroLabel;
  }
  return `${value}${unit}`;
}

function condenseText(text: string, fallback: string, limit: number = 104) {
  const compact = (text || fallback).replace(/\s+/g, " ").trim() || fallback;

  if (compact.length <= limit) {
    return compact;
  }

  return `${compact.slice(0, limit - 3)}...`;
}

function pickPrimary(items: string[], fallback: string) {
  return items.find(Boolean)?.trim() ?? fallback;
}

function buildInsightLabel(
  narrativeSource: SimulationOutcomeNarrativeSource,
  loading: boolean
) {
  if (loading) {
    return "해석 갱신 중";
  }
  return narrativeSource === "llm" ? "LLM 브리핑" : "자동 브리핑";
}

function buildComparisonValue(
  value: string,
  note?: string,
  align: "left" | "right" = "left"
) {
  return (
    <Box
      sx={{
        minWidth: 0,
        textAlign: align,
      }}
    >
      <Typography
        sx={{
          fontSize: 16.5,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: "0.01em",
        }}
      >
        {value}
      </Typography>
      {note && (
        <Typography
          sx={{
            mt: 0.18,
            fontSize: 11.25,
            color: "text.secondary",
            lineHeight: 1.3,
          }}
        >
          {note}
        </Typography>
      )}
    </Box>
  );
}

export default function SimulationOutcomeDialog({
  open,
  summary,
  narrative,
  narrativeSource,
  loading = false,
  onClose,
}: Readonly<SimulationOutcomeDialogProps>) {
  if (!summary) {
    return null;
  }

  if (summary.reportMode === "bda" && summary.bdaReport) {
    const bdaReport = summary.bdaReport;
    const benchmarkRuns = bdaReport.benchmark?.runs ?? [];
    const briefingText = condenseText(
      narrative,
      summary.fallbackSummary,
      156
    );

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        aria-labelledby="simulation-outcome-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            background: (theme) =>
              `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha("#031114", 0.99)} 100%)`,
          },
        }}
      >
        <DialogTitle
          id="simulation-outcome-dialog-title"
          component="div"
          sx={{
            px: { xs: 1.8, sm: 2.2 },
            py: 1.45,
            borderBottom: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0)} 76%)`,
          }}
        >
          <Typography
            component="span"
            sx={{
              display: "block",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            BDA Assessment
          </Typography>
          <Typography
            component="span"
            variant="h5"
            sx={{ mt: 0.25, display: "block" }}
          >
            전과 분석 보고서
          </Typography>
          <Typography
            component="span"
            sx={{ mt: 0.35, display: "block", color: "text.secondary" }}
          >
            {summary.scenarioName}
          </Typography>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            px: { xs: 1.3, sm: 2 },
            py: 1.35,
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.12),
          }}
        >
          <Stack spacing={1.05}>
            <Box
              sx={{
                position: "relative",
                p: { xs: 1, sm: 1.2 },
                borderRadius: 3,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                background: (theme) =>
                  `linear-gradient(150deg, ${alpha(theme.palette.warning.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.26)} 54%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                boxShadow: (theme) =>
                  `0 0 0 1px ${alpha(theme.palette.warning.main, 0.05)} inset`,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  borderRadius: 3,
                  background: (theme) =>
                    `repeating-linear-gradient(180deg, transparent 0, transparent 18px, ${alpha(theme.palette.warning.main, 0.02)} 18px, ${alpha(theme.palette.warning.main, 0.02)} 19px)`,
                },
              }}
            >
              <Stack
                direction="row"
                spacing={0.55}
                sx={{ flexWrap: "wrap", position: "relative", zIndex: 1 }}
              >
                <Chip
                  size="small"
                  color="warning"
                  label={bdaReport.operationLabel}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  size="small"
                  color={bdaReport.deploymentAssessmentLabel === "최적 편성" ? "success" : "default"}
                  variant={bdaReport.deploymentAssessmentLabel === "최적 편성" ? "filled" : "outlined"}
                  label={bdaReport.deploymentAssessmentLabel}
                />
                <Chip size="small" variant="outlined" label={bdaReport.modeReasonLabel} />
                <Chip size="small" variant="outlined" label={summary.endReason} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`경제성 ${bdaReport.economicScore}`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`종료 ${summary.endedAtLabel}`}
                />
              </Stack>

              <Box
                sx={{
                  mt: 0.9,
                  display: "grid",
                  gap: 0.9,
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "minmax(0, 1.45fr) minmax(260px, 0.9fr)",
                  },
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2.4,
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                    background: (theme) =>
                      `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.28)} 0%, ${alpha(theme.palette.background.paper, 0.12)} 100%)`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    Battle Damage Assessment
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 34,
                      fontWeight: 900,
                      lineHeight: 1.03,
                      color:
                        bdaReport.assessedEffectLabel === "결정적 효과"
                          ? "warning.light"
                          : "primary.light",
                    }}
                  >
                    {bdaReport.assessedEffectLabel}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.55,
                      fontSize: 16.5,
                      fontWeight: 700,
                      lineHeight: 1.35,
                    }}
                  >
                    {bdaReport.objectiveName
                      ? `목표 ${bdaReport.objectiveName}`
                      : bdaReport.targetSummary}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.28,
                      fontSize: 12.5,
                      color: "text.secondary",
                    }}
                  >
                    {bdaReport.actorName
                      ? `${bdaReport.actorName} 화력 평가`
                      : bdaReport.modeReasonLabel}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.55}
                    sx={{ mt: 0.85, flexWrap: "wrap" }}
                  >
                    <Chip size="small" variant="outlined" label={bdaReport.objectiveStatusLabel} />
                    <Chip size="small" variant="outlined" label={bdaReport.damageLevelLabel} />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`신뢰도 ${bdaReport.assessmentConfidenceLabel}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`템포 ${bdaReport.tempoLabel}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`비용 ${bdaReport.costScore}`}
                    />
                    <Chip size="small" variant="outlined" label={bdaReport.assetMixSummary} />
                  </Stack>

                  <Typography
                    sx={{
                      mt: 0.9,
                      fontSize: 13.2,
                      fontWeight: 700,
                      lineHeight: 1.55,
                    }}
                  >
                    {bdaReport.operatingPicture}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.55,
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.55,
                    }}
                  >
                    {briefingText}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2.8,
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                    background: (theme) =>
                      `radial-gradient(circle at 50% 12%, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 48%, ${alpha(theme.palette.background.paper, 0.64)} 100%)`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                    boxShadow: (theme) =>
                      `0 0 28px ${alpha(theme.palette.warning.main, 0.12)}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                    }}
                  >
                    BDA Ready
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 42,
                      fontWeight: 900,
                      lineHeight: 1.02,
                      color: "warning.light",
                    }}
                  >
                    {bdaReport.assessedEffectScore}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: 12.5,
                      color: "text.secondary",
                    }}
                  >
                    효과 판정 점수
                  </Typography>

                  <Box
                    sx={{
                      mt: 0.85,
                      display: "grid",
                      gap: 0.55,
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    }}
                  >
                    <Box
                      sx={{
                        p: 0.8,
                        borderRadius: 2,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.background.paper, 0.42),
                      }}
                    >
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                        분석 신뢰도
                      </Typography>
                      <Typography sx={{ mt: 0.2, fontWeight: 800 }}>
                        {bdaReport.assessmentConfidenceLabel}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 0.8,
                        borderRadius: 2,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.background.paper, 0.42),
                      }}
                    >
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                        화력 효율
                      </Typography>
                      <Typography sx={{ mt: 0.2, fontWeight: 800 }}>
                        {bdaReport.resourceEfficiencyLabel}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 11.25,
                      color: "text.secondary",
                      letterSpacing: "0.03em",
                      lineHeight: 1.45,
                    }}
                  >
                    {bdaReport.deploymentFootprintLabel} · {bdaReport.targetSummary}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gap: 0.75,
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(6, minmax(0, 1fr))",
                },
              }}
            >
              <Box
                sx={{
                  p: 0.9,
                  borderRadius: 2.4,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  확인 타격
                </Typography>
                <Typography sx={{ mt: 0.2, fontSize: 24, fontWeight: 900 }}>
                  {bdaReport.confirmedHitCount}
                </Typography>
                <Typography sx={{ mt: 0.18, fontSize: 11.5, color: "text.secondary" }}>
                  파괴 {bdaReport.killEventCount} · 피해 {bdaReport.damageEventCount}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.9,
                  borderRadius: 2.4,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.success.main, 0.06),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  화력 투입
                </Typography>
                <Typography sx={{ mt: 0.2, fontSize: 24, fontWeight: 900 }}>
                  {bdaReport.launchCount}
                </Typography>
                <Typography sx={{ mt: 0.18, fontSize: 11.5, color: "text.secondary" }}>
                  플랫폼 {bdaReport.launchedPlatformCount}/{bdaReport.launchPlatformCount}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.9,
                  borderRadius: 2.4,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.warning.main, 0.06),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.warning.main, 0.16)}`,
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  충격량 지수
                </Typography>
                <Typography sx={{ mt: 0.2, fontSize: 24, fontWeight: 900 }}>
                  {bdaReport.shockIndex}
                </Typography>
                <Typography sx={{ mt: 0.18, fontSize: 11.5, color: "text.secondary" }}>
                  {bdaReport.dominantAxis}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.9,
                  borderRadius: 2.4,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.secondary.main, 0.06),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.secondary.main, 0.16)}`,
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  경제성 점수
                </Typography>
                <Typography sx={{ mt: 0.2, fontSize: 24, fontWeight: 900 }}>
                  {bdaReport.economicScore}
                </Typography>
                <Typography sx={{ mt: 0.18, fontSize: 11.5, color: "text.secondary" }}>
                  {bdaReport.deploymentAssessmentLabel}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.9,
                  borderRadius: 2.4,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.info.main, 0.06),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  임무 기준
                </Typography>
                <Typography sx={{ mt: 0.2, fontSize: 24, fontWeight: 900 }}>
                  {bdaReport.requiredEffectScore}
                </Typography>
                <Typography sx={{ mt: 0.18, fontSize: 11.5, color: "text.secondary" }}>
                  {bdaReport.missionThresholdMet ? "기준 충족" : "기준 미달"}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.9,
                  borderRadius: 2.4,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.error.main, 0.06),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.error.main, 0.16)}`,
                }}
              >
                <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                  위협 노출
                </Typography>
                <Typography sx={{ mt: 0.2, fontSize: 24, fontWeight: 900 }}>
                  {Math.round(bdaReport.threatExposureScore * 10) / 10}
                </Typography>
                <Typography sx={{ mt: 0.18, fontSize: 11.5, color: "text.secondary" }}>
                  비용 {bdaReport.costScore} · 신뢰도 {bdaReport.assessmentConfidenceLabel}
                </Typography>
              </Box>
            </Box>

            {bdaReport.benchmark && (
              <Box
                sx={{
                  p: { xs: 0.95, sm: 1.05 },
                  borderRadius: 3,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={0.9}
                  sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>배치 비교</Typography>
                    <Typography sx={{ mt: 0.15, fontSize: 12.5, color: "text.secondary" }}>
                      동일 목표 기준 최근 {bdaReport.benchmark.comparisonCount}회 비교
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`현재 순위 ${bdaReport.benchmark.currentRunRank ?? "-"}위`}
                  />
                </Stack>
                <Typography
                  sx={{
                    mt: 0.65,
                    fontSize: 12.75,
                    color: "text.secondary",
                    lineHeight: 1.5,
                  }}
                >
                  {bdaReport.benchmarkInsight}
                </Typography>
                <Stack spacing={0.55} sx={{ mt: 0.8 }}>
                  {benchmarkRuns.map((run) => {
                    const isCurrent = run.runId === bdaReport.benchmark?.currentRunId;
                    const isBestValue = run.runId === bdaReport.benchmark?.bestValueRunId;
                    const isMaxEffect = run.runId === bdaReport.benchmark?.maxEffectRunId;

                    return (
                      <Box
                        key={run.runId}
                        sx={{
                          p: 0.7,
                          borderRadius: 1.9,
                          backgroundColor: (theme) =>
                            alpha(
                              isCurrent
                                ? theme.palette.warning.main
                                : isBestValue
                                  ? theme.palette.success.main
                                  : theme.palette.background.paper,
                              isCurrent ? 0.1 : isBestValue ? 0.08 : 0.18
                            ),
                          border: (theme) =>
                            `1px solid ${alpha(
                              isCurrent
                                ? theme.palette.warning.main
                                : isBestValue
                                  ? theme.palette.success.main
                                  : theme.palette.primary.main,
                              isCurrent || isBestValue ? 0.22 : 0.08
                            )}`,
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={0.7}
                          sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={0.45}
                              sx={{ flexWrap: "wrap", alignItems: "center" }}
                            >
                              <Typography sx={{ fontWeight: 700 }}>
                                {run.actorName ?? "현재 편성"}
                              </Typography>
                              {isCurrent && (
                                <Chip size="small" color="warning" label="현재 런" />
                              )}
                              {isBestValue && (
                                <Chip size="small" color="success" label="경제성 최고" />
                              )}
                              {isMaxEffect && (
                                <Chip size="small" variant="outlined" label="최대 효과" />
                              )}
                            </Stack>
                            <Typography
                              sx={{ mt: 0.18, fontSize: 12, color: "text.secondary" }}
                            >
                              {run.deploymentFootprintLabel} · {run.objectiveStatusLabel} · 종료 {run.endedAtLabel}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "grid",
                              gap: 0.7,
                              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                              minWidth: { md: 276 },
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                                BDA
                              </Typography>
                              <Typography sx={{ fontWeight: 800 }}>
                                {run.assessedEffectScore}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                                경제성
                              </Typography>
                              <Typography sx={{ fontWeight: 800 }}>
                                {run.economicScore}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                                기준
                              </Typography>
                              <Typography sx={{ fontWeight: 800 }}>
                                {run.missionThresholdMet ? "충족" : "미달"}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
              <Box
                sx={{
                  flex: 1.05,
                  p: 0.95,
                  borderRadius: 2.6,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Typography sx={{ fontWeight: 700 }}>BDA 판정</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    평가 보드
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 0.72,
                    display: "grid",
                    gap: 0.55,
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  }}
                >
                  <Box
                    sx={{
                      p: 0.7,
                      borderRadius: 1.9,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.paper, 0.24),
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      효과 요약
                    </Typography>
                    <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                      {bdaReport.effectSummary}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 0.7,
                      borderRadius: 1.9,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.paper, 0.24),
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      화력 효율
                    </Typography>
                    <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                      {bdaReport.resourceEfficiencyLabel}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 0.7,
                      borderRadius: 1.9,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.paper, 0.24),
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      분석 신뢰도
                    </Typography>
                    <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                      {bdaReport.assessmentConfidenceLabel} {bdaReport.assessmentConfidenceScore}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 0.7,
                      borderRadius: 1.9,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.paper, 0.24),
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      운용 템포
                    </Typography>
                    <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                      {bdaReport.tempoLabel}
                    </Typography>
                  </Box>
                </Box>
                <Stack spacing={0.55} sx={{ mt: 0.75 }}>
                  {(bdaReport.keyObservations.length > 0
                    ? bdaReport.keyObservations
                    : ["관측 내용을 정리 중입니다."]
                  ).map((item) => (
                    <Box
                      key={item}
                      sx={{
                        p: 0.7,
                        borderRadius: 1.8,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.background.paper, 0.22),
                      }}
                    >
                      <Typography sx={{ fontSize: 12.75, lineHeight: 1.5 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 0.95,
                  borderRadius: 2.6,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.success.main, 0.06),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.success.main, 0.14)}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
                >
                  <Typography sx={{ fontWeight: 700 }}>관측 메모</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    액션 타임라인
                  </Typography>
                  <Chip
                    size="small"
                    color={narrativeSource === "llm" ? "primary" : "default"}
                    variant={narrativeSource === "llm" ? "filled" : "outlined"}
                    label={buildInsightLabel(narrativeSource, loading)}
                  />
                </Stack>
                <Typography
                  sx={{ mt: 0.65, color: "text.secondary", lineHeight: 1.55, fontSize: 13 }}
                >
                  {briefingText}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    fontSize: 12,
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  최근 액션
                </Typography>
                <Stack spacing={0.45} sx={{ mt: 0.45 }}>
                  {(bdaReport.recentActions.length > 0
                    ? bdaReport.recentActions
                    : ["추가 관측 로그 없음"]
                  ).map((item) => (
                    <Box
                      key={item}
                      sx={{
                        position: "relative",
                        pl: 1.35,
                        py: 0.2,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0.25,
                          top: 6,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: (theme) =>
                            alpha(theme.palette.success.main, 0.86),
                          boxShadow: (theme) =>
                            `0 0 0 4px ${alpha(theme.palette.success.main, 0.12)}`,
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          left: 0.6,
                          top: 18,
                          bottom: -8,
                          width: 1,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.success.main, 0.2),
                        },
                        "&:last-of-type::after": {
                          display: "none",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          color: "text.secondary",
                          lineHeight: 1.45,
                        }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 0.95,
                  p: 0.95,
                  borderRadius: 2.6,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.warning.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>후속 조치</Typography>
                <Stack spacing={0.55} sx={{ mt: 0.75 }}>
                  {(bdaReport.recommendations.length > 0
                    ? bdaReport.recommendations
                    : ["후속 권고 정리 중"]
                  ).map((item) => (
                    <Box
                      key={item}
                      sx={{
                        p: 0.7,
                        borderRadius: 1.8,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.background.paper, 0.2),
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 1.8, sm: 2.4 },
            py: 1.2,
            borderTop: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const assessmentBySideId = new Map(
    summary.report.sideAssessments.map((assessment) => [
      assessment.sideId,
      assessment,
    ])
  );
  const displaySides = summary.sides.slice(0, 2);
  const leftSide = displaySides[0];
  const rightSide = displaySides[1];
  const leftAssessment = leftSide
    ? assessmentBySideId.get(leftSide.sideId)
    : undefined;
  const rightAssessment = rightSide
    ? assessmentBySideId.get(rightSide.sideId)
    : undefined;
  const topTurningPoint = summary.report.turningPoints[0];
  const decisiveFactors = summary.report.decisiveFactors.slice(0, 4);
  const combatPowerGap =
    leftSide && rightSide
      ? Math.abs(leftSide.remainingCombatPower - rightSide.remainingCombatPower)
      : 0;
  const comparisonRows: ComparisonRow[] = [
    {
      label: "점수",
      leftValue: `${leftSide?.score ?? 0}`,
      rightValue: `${rightSide?.score ?? 0}`,
      leftNote: leftSide
        ? `격차 ${formatGap(
            Math.abs((leftSide?.score ?? 0) - (rightSide?.score ?? 0)),
            "점",
            "동률"
          )}`
        : undefined,
      rightNote: rightSide
        ? `격차 ${formatGap(
            Math.abs((leftSide?.score ?? 0) - (rightSide?.score ?? 0)),
            "점",
            "동률"
          )}`
        : undefined,
      emphasis: true,
    },
    {
      label: "잔존 전력",
      leftValue: `${leftSide?.remainingCombatPower ?? 0}`,
      rightValue: `${rightSide?.remainingCombatPower ?? 0}`,
      leftNote: leftSide
        ? `전투 단위 ${leftSide.remainingCombatUnits}개`
        : undefined,
      rightNote: rightSide
        ? `전투 단위 ${rightSide.remainingCombatUnits}개`
        : undefined,
      emphasis: true,
    },
    {
      label: "유효타",
      leftValue: `${leftSide?.confirmedHits ?? 0}`,
      rightValue: `${rightSide?.confirmedHits ?? 0}`,
      leftNote: leftAssessment?.engagementEfficiencyLabel ?? "평가 제한",
      rightNote: rightAssessment?.engagementEfficiencyLabel ?? "평가 제한",
    },
    {
      label: "명중률",
      leftValue: leftAssessment?.hitRateLabel ?? "교전 제한",
      rightValue: rightAssessment?.hitRateLabel ?? "교전 제한",
      leftNote: leftSide ? `발사 ${leftSide.launches}` : undefined,
      rightNote: rightSide ? `발사 ${rightSide.launches}` : undefined,
    },
    {
      label: "소모전",
      leftValue:
        leftAssessment?.attritionLabel ??
        formatSignedNumber(leftSide?.attritionBalance ?? 0),
      rightValue:
        rightAssessment?.attritionLabel ??
        formatSignedNumber(rightSide?.attritionBalance ?? 0),
      leftNote: leftSide
        ? `격파 ${leftSide.kills.total} · 손실 ${leftSide.losses.total}`
        : undefined,
      rightNote: rightSide
        ? `격파 ${rightSide.kills.total} · 손실 ${rightSide.losses.total}`
        : undefined,
      emphasis: true,
    },
    {
      label: "임무 성과",
      leftValue: `${leftSide?.missionSuccesses ?? 0}`,
      rightValue: `${rightSide?.missionSuccesses ?? 0}`,
      leftNote: leftSide
        ? `타격 ${leftSide.strikeMissionSuccesses} · 초계 ${leftSide.patrolMissionSuccesses}`
        : undefined,
      rightNote: rightSide
        ? `타격 ${rightSide.strikeMissionSuccesses} · 초계 ${rightSide.patrolMissionSuccesses}`
        : undefined,
    },
    {
      label: "잔여 무장",
      leftValue: `${leftSide?.weaponInventory ?? 0}`,
      rightValue: `${rightSide?.weaponInventory ?? 0}`,
      leftNote: leftSide
        ? `미명중 ${leftSide.misses} · 무장 손실 ${leftSide.weaponLosses}`
        : undefined,
      rightNote: rightSide
        ? `미명중 ${rightSide.misses} · 무장 손실 ${rightSide.weaponLosses}`
        : undefined,
    },
  ];
  const briefingText = condenseText(narrative, summary.report.executiveSummary, 92);
  const riskText = condenseText(
    pickPrimary(
      summary.report.operationalRisks,
      "즉시 확인된 추가 위험은 크지 않습니다."
    ),
    "즉시 확인된 추가 위험은 크지 않습니다.",
    78
  );
  const recommendationText = condenseText(
    pickPrimary(
      summary.report.recommendations,
      "현 전과를 유지할 수 있도록 감시와 재정비를 병행해야 합니다."
    ),
    "현 전과를 유지할 수 있도록 감시와 재정비를 병행해야 합니다.",
    78
  );
  const extraSides = summary.sides.slice(2);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="simulation-outcome-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          background: (theme) =>
            `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha("#031114", 0.99)} 100%)`,
        },
      }}
    >
      <DialogTitle
        id="simulation-outcome-dialog-title"
        component="div"
        sx={{
          px: { xs: 1.8, sm: 2.2 },
          py: 1.45,
          borderBottom: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0)} 76%)`,
        }}
      >
        <Typography
          component="span"
          sx={{
            display: "block",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          Battle Outcome Report
        </Typography>
        <Typography
          component="span"
          variant="h5"
          sx={{ mt: 0.25, display: "block" }}
        >
          전투 결과
        </Typography>
        <Typography
          component="span"
          sx={{ mt: 0.35, display: "block", color: "text.secondary" }}
        >
          {summary.scenarioName}
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: { xs: 1.3, sm: 2 },
          py: 1.35,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.12),
        }}
      >
        <Stack spacing={1.05}>
          <Box
            sx={{
              position: "relative",
              p: { xs: 1, sm: 1.2 },
              borderRadius: 3,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              background: (theme) =>
                `linear-gradient(155deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.22)} 52%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
              boxShadow: (theme) =>
                `0 0 0 1px ${alpha(theme.palette.primary.main, 0.04)} inset`,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                borderRadius: 3,
                background: (theme) =>
                  `repeating-linear-gradient(180deg, transparent 0, transparent 16px, ${alpha(theme.palette.primary.main, 0.018)} 16px, ${alpha(theme.palette.primary.main, 0.018)} 17px)`,
              },
            }}
          >
            <Stack
              direction="row"
              spacing={0.55}
              sx={{ flexWrap: "wrap", position: "relative", zIndex: 1 }}
            >
              <Chip
                size="small"
                color={summary.winnerName ? "success" : "secondary"}
                label={summary.winnerName ?? "무승부"}
                sx={{ fontWeight: 800 }}
              />
              <Chip size="small" variant="outlined" label={summary.endReason} />
              <Chip
                size="small"
                variant="outlined"
                label={summary.activeSideSummary}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`종료 ${summary.endedAtLabel}`}
              />
            </Stack>

            <Box
              sx={{
                mt: 0.9,
                display: "grid",
                gap: 0.8,
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0, 1fr) 208px minmax(0, 1fr)",
                },
                position: "relative",
                zIndex: 1,
              }}
            >
              {displaySides.map((side, index) => {
                const assessment = assessmentBySideId.get(side.sideId);
                const isWinner =
                  Boolean(summary.winnerName) &&
                  summary.winnerName === side.name;
                const accentColor = isWinner ? "#4cd67a" : "#35d9c6";
                const accentTone = isWinner
                  ? "WINNER"
                  : index === 0
                    ? "LEADER"
                    : "RUNNER-UP";

                return (
                  <Box
                    key={side.sideId}
                    sx={{
                      p: 0.95,
                      borderRadius: 2.2,
                      border: (theme) =>
                        `1px solid ${alpha(
                          isWinner
                            ? theme.palette.success.main
                            : theme.palette.primary.main,
                          isWinner ? 0.26 : 0.14
                        )}`,
                      background: (theme) =>
                        `linear-gradient(180deg, ${alpha(accentColor, isWinner ? 0.16 : 0.09)} 0%, ${alpha(theme.palette.background.paper, 0.34)} 100%)`,
                      boxShadow: isWinner
                        ? `0 0 26px ${alpha(accentColor, 0.16)}`
                        : "none",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.7}
                      sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 10.5,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "text.secondary",
                          }}
                        >
                          {accentTone}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 22,
                            fontWeight: 800,
                            color: isWinner ? "success.main" : "text.primary",
                            lineHeight: 1.02,
                          }}
                        >
                          {side.name}
                        </Typography>
                      </Box>
                      {assessment && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={assessment.combatPosture}
                          sx={{
                            height: 24,
                            color: isWinner ? "success.main" : "text.primary",
                            borderColor: alpha(accentColor, 0.34),
                            backgroundColor: alpha(accentColor, 0.1),
                          }}
                        />
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 0.7, justifyContent: "space-between", alignItems: "flex-end" }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 28,
                            fontWeight: 900,
                            lineHeight: 0.98,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {side.score}
                        </Typography>
                        <Typography
                          sx={{ mt: 0.12, fontSize: 11, color: "text.secondary" }}
                        >
                          SCORE
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
                          {side.remainingCombatPower}
                        </Typography>
                        <Typography
                          sx={{ mt: 0.12, fontSize: 11, color: "text.secondary" }}
                        >
                          COMBAT POWER
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      sx={{
                        mt: 0.75,
                        display: "grid",
                        gap: 0.45,
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      }}
                    >
                      <Box
                        sx={{
                          p: 0.55,
                          borderRadius: 1.6,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.background.paper, 0.34),
                        }}
                      >
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                          명중률
                        </Typography>
                        <Typography sx={{ mt: 0.1, fontSize: 13.5, fontWeight: 800 }}>
                          {leftSide?.sideId === side.sideId
                            ? leftAssessment?.hitRateLabel ?? "교전 제한"
                            : rightAssessment?.hitRateLabel ?? "교전 제한"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 0.55,
                          borderRadius: 1.6,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.background.paper, 0.34),
                        }}
                      >
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                          유효타
                        </Typography>
                        <Typography sx={{ mt: 0.1, fontSize: 13.5, fontWeight: 800 }}>
                          {side.confirmedHits}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 0.55,
                          borderRadius: 1.6,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.background.paper, 0.34),
                        }}
                      >
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                          소모전
                        </Typography>
                        <Typography sx={{ mt: 0.1, fontSize: 13.5, fontWeight: 800 }}>
                          {assessment?.attritionLabel ??
                            formatSignedNumber(side.attritionBalance)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              <Box
                sx={{
                  order: { xs: -1, md: 0 },
                  p: 1,
                  borderRadius: 2.8,
                  border: (theme) =>
                    `1px solid ${alpha(
                      summary.winnerName
                        ? theme.palette.success.main
                        : theme.palette.secondary.main,
                      0.22
                    )}`,
                  background: (theme) =>
                    `radial-gradient(circle at 50% 12%, ${alpha(
                      summary.winnerName
                        ? theme.palette.success.main
                        : theme.palette.secondary.main,
                      0.18
                    )} 0%, ${alpha(theme.palette.background.paper, 0.5)} 46%, ${alpha(theme.palette.background.paper, 0.62)} 100%)`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: (theme) =>
                    `0 0 28px ${alpha(
                      summary.winnerName
                        ? theme.palette.success.main
                        : theme.palette.secondary.main,
                      0.12
                    )}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                  }}
                >
                  Result Locked
                </Typography>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: 36,
                    fontWeight: 900,
                    lineHeight: 1.04,
                    color: summary.winnerName
                      ? "success.main"
                      : "secondary.main",
                  }}
                >
                  {summary.winnerName ?? "무승부"}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.5,
                    color: "text.secondary",
                    lineHeight: 1.45,
                  }}
                >
                  {summary.winnerBasis}
                </Typography>
                <Box
                  sx={{
                    mt: 0.8,
                    display: "grid",
                    gap: 0.55,
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  }}
                >
                  <Box
                    sx={{
                      p: 0.8,
                      borderRadius: 2,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.paper, 0.42),
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      점수 차
                    </Typography>
                    <Typography sx={{ mt: 0.2, fontWeight: 800 }}>
                      {formatGap(summary.scoreGap, "점", "동률")}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 0.8,
                      borderRadius: 2,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.paper, 0.42),
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      잔존 차
                    </Typography>
                    <Typography sx={{ mt: 0.2, fontWeight: 800 }}>
                      {formatGap(combatPowerGap, "", "동급")}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: 11.25,
                    color: "text.secondary",
                    letterSpacing: "0.03em",
                  }}
                >
                  {summary.activeSideSummary}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 0.75,
                p: 0.85,
                borderRadius: 2.4,
                backgroundColor: (theme) =>
                  alpha(theme.palette.background.paper, 0.3),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ justifyContent: "space-between" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    결정 장면
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.32,
                      fontSize: 15,
                      fontWeight: 700,
                      lineHeight: 1.45,
                    }}
                  >
                    {topTurningPoint?.headline ?? "결정적 장면 기록 없음"}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    topTurningPoint
                      ? `${topTurningPoint.sideName} · ${topTurningPoint.occurredAtLabel}`
                      : summary.activeSideSummary
                  }
                />
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 0.95, sm: 1.05 },
              borderRadius: 3,
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.05),
              border: (theme) =>
                `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={0.9}
              sx={{
                justifyContent: "space-between",
                alignItems: { md: "center" },
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>전투 통계판</Typography>
              <Chip
                size="small"
                variant="outlined"
                label={`${leftSide?.name ?? "-"} vs ${rightSide?.name ?? "-"}`}
              />
            </Stack>

            {leftSide && (
              <Box
                sx={{
                  mt: 0.7,
                  display: { xs: "grid", md: "grid" },
                  gap: 0.55,
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    md: "minmax(0, 1fr) 84px minmax(0, 1fr)",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.7,
                    textAlign: "center",
                    backgroundColor: (theme) =>
                      alpha(theme.palette.success.main, 0.1),
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {leftSide.name}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }} />
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.7,
                    textAlign: "center",
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {rightSide?.name ?? "상대 없음"}
                  </Typography>
                </Box>
              </Box>
            )}

            <Stack spacing={0.45} sx={{ mt: 0.55 }}>
              {comparisonRows.map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    p: 0.55,
                    borderRadius: 1.8,
                    backgroundColor: (theme) =>
                      alpha(
                        theme.palette.background.paper,
                        row.emphasis ? 0.28 : 0.16
                      ),
                    border: (theme) =>
                      `1px solid ${alpha(
                        row.emphasis
                          ? theme.palette.primary.main
                          : theme.palette.primary.main,
                        row.emphasis ? 0.14 : 0.08
                      )}`,
                  }}
                >
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    <Typography
                      sx={{
                        mb: 0.4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "text.secondary",
                        textAlign: "center",
                      }}
                    >
                      {row.label}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 0.55,
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      }}
                    >
                      {buildComparisonValue(row.leftValue, row.leftNote)}
                      {buildComparisonValue(
                        row.rightValue,
                        row.rightNote,
                        "right"
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: { xs: "none", md: "grid" },
                      gap: 0.55,
                      gridTemplateColumns: "minmax(0, 1fr) 84px minmax(0, 1fr)",
                      alignItems: "center",
                    }}
                  >
                    {buildComparisonValue(row.leftValue, row.leftNote)}
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: row.emphasis ? "primary.light" : "text.secondary",
                        textAlign: "center",
                        letterSpacing: row.emphasis ? "0.04em" : undefined,
                      }}
                    >
                      {row.label}
                    </Typography>
                    {buildComparisonValue(
                      row.rightValue,
                      row.rightNote,
                      "right"
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
            <Box
              sx={{
                flex: 0.95,
                p: 0.95,
                borderRadius: 2.6,
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.05),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>핵심 요인</Typography>
              <Stack
                direction="row"
                spacing={0.8}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                {(decisiveFactors.length > 0
                  ? decisiveFactors
                  : ["결정 요인 정리 중"]
                ).map((factor) => (
                  <Chip
                    key={factor}
                    size="small"
                    variant="outlined"
                    label={factor}
                  />
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                flex: 1.1,
                p: 0.95,
                borderRadius: 2.6,
                backgroundColor: (theme) =>
                  alpha(theme.palette.success.main, 0.06),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.success.main, 0.14)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
              >
                <Typography sx={{ fontWeight: 700 }}>작전 메모</Typography>
                <Chip
                  size="small"
                  color={narrativeSource === "llm" ? "primary" : "default"}
                  variant={narrativeSource === "llm" ? "filled" : "outlined"}
                  label={buildInsightLabel(narrativeSource, loading)}
                />
              </Stack>
              <Typography
                sx={{ mt: 0.65, color: "text.secondary", lineHeight: 1.5, fontSize: 13 }}
              >
                {briefingText}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 0.95,
                borderRadius: 2.6,
                backgroundColor: (theme) =>
                  alpha(theme.palette.warning.main, 0.05),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>후속 조치</Typography>
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 12,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                위험
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 12.5,
                  color: "text.secondary",
                  lineHeight: 1.45,
                }}
              >
                {riskText}
              </Typography>
              <Typography
                sx={{
                  mt: 0.8,
                  fontSize: 12,
                  color: "text.secondary",
                  fontWeight: 700,
                }}
              >
                권고
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 12.5,
                  color: "text.secondary",
                  lineHeight: 1.45,
                }}
              >
                {recommendationText}
              </Typography>
            </Box>
          </Stack>

          {extraSides.length > 0 && (
            <Box
              sx={{
                p: 1.05,
                borderRadius: 2.4,
                backgroundColor: (theme) =>
                  alpha(theme.palette.background.paper, 0.2),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>기타 세력</Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.7, flexWrap: "wrap" }}
              >
                {extraSides.map((side) => (
                  <Chip
                    key={side.sideId}
                    size="small"
                    variant="outlined"
                    label={`${side.name} · 점수 ${side.score}`}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 1.8, sm: 2.4 },
          py: 1.2,
          borderTop: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
