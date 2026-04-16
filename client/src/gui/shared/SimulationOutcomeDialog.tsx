import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

  const assessmentBySideId = new Map(
    summary.report.sideAssessments.map((assessment) => [
      assessment.sideId,
      assessment,
    ])
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="simulation-outcome-dialog-title"
    >
      <DialogTitle id="simulation-outcome-dialog-title">
        전투 결과 요약
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip
              color={summary.winnerName ? "success" : "default"}
              label={summary.winnerName ?? "무승부"}
            />
            <Chip variant="outlined" label={summary.endReason} />
            <Chip
              variant="outlined"
              label={`종료 시각 ${summary.endedAtLabel}`}
            />
          </Stack>

          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              {summary.report.headline}
            </Typography>
            <Typography sx={{ mt: 0.6, color: "text.secondary" }}>
              {summary.report.executiveSummary}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(95, 112, 65, 0.08)",
              border: "1px solid rgba(95, 112, 65, 0.18)",
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              {narrativeSource === "llm" ? "LLM 전투 해석" : "자동 전투 요약"}
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                whiteSpace: "pre-wrap",
                color: "text.secondary",
              }}
            >
              {narrative}
            </Typography>
            {loading && (
              <Typography
                sx={{ mt: 0.8, fontSize: 12, color: "text.secondary" }}
              >
                LLM 해석을 요청 중이며, 현재는 자동 요약을 먼저 표시합니다.
              </Typography>
            )}
            {!loading && narrativeSource === "fallback" && (
              <Typography
                sx={{ mt: 0.8, fontSize: 12, color: "text.secondary" }}
              >
                LLM 응답을 받지 못해 규칙 기반 요약을 표시했습니다.
              </Typography>
            )}
          </Box>

          {summary.report.decisiveFactors.length > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700 }}>핵심 요인</Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                {summary.report.decisiveFactors.map((factor) => (
                  <Chip
                    key={factor}
                    size="small"
                    variant="outlined"
                    label={factor}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Typography sx={{ fontWeight: 700 }}>판정 근거</Typography>
            <Typography sx={{ mt: 0.6, color: "text.secondary" }}>
              {summary.winnerBasis}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={1}>
            {summary.sides.map((side) => {
              const assessment = assessmentBySideId.get(side.sideId);

              return (
                <Box
                  key={side.sideId}
                  sx={{
                    p: 1.3,
                    borderRadius: 2,
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {side.name}
                    </Typography>
                    {assessment && (
                      <Stack direction="row" spacing={0.8}>
                        <Chip
                          size="small"
                          label={assessment.combatPosture}
                          color={
                            summary.winnerName === side.name
                              ? "success"
                              : "default"
                          }
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${assessment.engagementEfficiencyLabel} · 명중률 ${assessment.hitRateLabel}`}
                        />
                      </Stack>
                    )}
                  </Stack>
                  <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                    점수 {side.score} / 잔존 전력 {side.remainingCombatUnits} /
                    유효타 {side.confirmedHits} / 발사 {side.launches} / 임무
                    성과 {side.missionSuccesses}
                  </Typography>
                  <Typography sx={{ mt: 0.4, color: "text.secondary" }}>
                    항공 {side.aircraft} · 함정 {side.ships} · 지상{" "}
                    {side.facilities} · 기지 {side.airbases} · 잔탄{" "}
                    {side.weaponInventory}
                  </Typography>
                  <Typography sx={{ mt: 0.4, color: "text.secondary" }}>
                    미명중 {side.misses} · 무장 손실 {side.weaponLosses} · 복귀{" "}
                    {side.returnToBaseEvents} · 임무 중단 {side.abortedMissions}
                  </Typography>

                  {assessment && (
                    <Stack spacing={0.7} sx={{ mt: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          강점
                        </Typography>
                        {assessment.strengths.map((item) => (
                          <Typography
                            key={item}
                            sx={{
                              mt: 0.25,
                              fontSize: 13,
                              color: "text.secondary",
                            }}
                          >
                            • {item}
                          </Typography>
                        ))}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          유의점
                        </Typography>
                        {assessment.concerns.map((item) => (
                          <Typography
                            key={item}
                            sx={{
                              mt: 0.25,
                              fontSize: 13,
                              color: "text.secondary",
                            }}
                          >
                            • {item}
                          </Typography>
                        ))}
                      </Box>
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>

          {summary.report.turningPoints.length > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700 }}>전환점</Typography>
              <Stack spacing={1} sx={{ mt: 0.8 }}>
                {summary.report.turningPoints.map((turningPoint) => (
                  <Box
                    key={turningPoint.id}
                    sx={{
                      p: 1.1,
                      borderRadius: 2,
                      backgroundColor: "rgba(95, 112, 65, 0.05)",
                      border: "1px solid rgba(95, 112, 65, 0.14)",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                        {turningPoint.headline}
                      </Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${turningPoint.importanceLabel} · ${turningPoint.occurredAtLabel}`}
                      />
                    </Stack>
                    <Typography
                      sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}
                    >
                      [{turningPoint.sideName}] {turningPoint.detail}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {(summary.report.operationalRisks.length > 0 ||
            summary.report.recommendations.length > 0) && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Box
                sx={{
                  flex: 1,
                  p: 1.3,
                  borderRadius: 2,
                  backgroundColor: "rgba(117, 76, 36, 0.05)",
                  border: "1px solid rgba(117, 76, 36, 0.14)",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>운용 위험</Typography>
                {summary.report.operationalRisks.map((risk) => (
                  <Typography
                    key={risk}
                    sx={{ mt: 0.45, fontSize: 13, color: "text.secondary" }}
                  >
                    • {risk}
                  </Typography>
                ))}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 1.3,
                  borderRadius: 2,
                  backgroundColor: "rgba(51, 88, 127, 0.05)",
                  border: "1px solid rgba(51, 88, 127, 0.14)",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>권고 조치</Typography>
                {summary.report.recommendations.map((recommendation) => (
                  <Typography
                    key={recommendation}
                    sx={{ mt: 0.45, fontSize: 13, color: "text.secondary" }}
                  >
                    • {recommendation}
                  </Typography>
                ))}
              </Box>
            </Stack>
          )}

          {summary.recentLogs.length > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700 }}>최근 주요 기록</Typography>
              <Stack spacing={0.7} sx={{ mt: 0.8 }}>
                {summary.recentLogs.map((log) => (
                  <Typography
                    key={log}
                    sx={{ fontSize: 13, color: "text.secondary" }}
                  >
                    {log}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
