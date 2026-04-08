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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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

          <Box>
            <Typography sx={{ fontWeight: 700 }}>판정 근거</Typography>
            <Typography sx={{ mt: 0.6, color: "text.secondary" }}>
              {summary.winnerBasis}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={1}>
            {summary.sides.map((side) => (
              <Box
                key={side.sideId}
                sx={{
                  p: 1.3,
                  borderRadius: 2,
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{side.name}</Typography>
                <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                  점수 {side.score} / 잔존 전력 {side.remainingCombatUnits} /
                  유효타 {side.confirmedHits} / 발사 {side.launches}
                </Typography>
                <Typography sx={{ mt: 0.4, color: "text.secondary" }}>
                  항공 {side.aircraft} · 함정 {side.ships} · 지상{" "}
                  {side.facilities} · 기지 {side.airbases} · 잔탄{" "}
                  {side.weaponInventory}
                </Typography>
              </Box>
            ))}
          </Stack>

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
