import { Chip, Paper, Stack, Typography } from "@mui/material";
import {
  FixedTargetStrikeReplayMetric,
  FixedTargetStrikeReplayRewardBreakdown,
} from "@/scenarios/fixedTargetStrikeRlDemo";

interface FixedTargetStrikeReplayPanelProps {
  metric: FixedTargetStrikeReplayMetric;
}

const phaseLabelMap: Record<FixedTargetStrikeReplayMetric["phase"], string> = {
  staging: "접근",
  coordinated_launch: "동시 타격",
  weapon_flyout: "무장 비행",
  mission_success: "임무 성공",
};

function formatReward(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}`;
}

function rewardTone(value: number) {
  if (value > 0) return "#24613b";
  if (value < 0) return "#7b2c2c";
  return "#4d5a48";
}

function getRewardChips(
  rewardBreakdown: FixedTargetStrikeReplayRewardBreakdown
): string[] {
  return [
    `총 보상 ${formatReward(rewardBreakdown.totalReward)}`,
    `TOT ${formatReward(rewardBreakdown.totBonus)}`,
    `위협 ${formatReward(rewardBreakdown.threatPenalty)}`,
  ];
}

export default function FixedTargetStrikeReplayPanel(
  props: Readonly<FixedTargetStrikeReplayPanelProps>
) {
  const { metric } = props;
  const rewardChips = getRewardChips(metric.rewardBreakdown);
  const missionState =
    metric.doneReason === "in_progress"
      ? "재생 중"
      : `${metric.doneReason} · ${metric.doneReasonDetail}`;

  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: 290,
        maxWidth: 360,
        px: 1.5,
        py: 1.25,
        border: "1px solid rgba(64, 79, 56, 0.24)",
        background:
          "linear-gradient(180deg, rgba(247,243,234,0.98) 0%, rgba(231,236,223,0.97) 100%)",
        boxShadow: "0 12px 24px rgba(34, 47, 28, 0.12)",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            RL 타격 리플레이
          </Typography>
          <Chip
            size="small"
            label={phaseLabelMap[metric.phase]}
            sx={{
              fontWeight: 700,
              backgroundColor: "rgba(46, 92, 62, 0.12)",
              color: "#20432d",
            }}
          />
        </Stack>

        <Typography variant="body2" sx={{ color: "#3b4936" }}>
          step {metric.stepIndex} · 표적{" "}
          {metric.selectedTargetId ?? "대기"} · 발사 {metric.launchCount}회 ·
          비행 중 {metric.weaponsInFlight}기
        </Typography>

        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          {rewardChips.map((label) => (
            <Chip
              key={label}
              size="small"
              label={label}
              sx={{
                backgroundColor: "rgba(255,255,255,0.72)",
                color:
                  label.startsWith("총 보상")
                    ? rewardTone(metric.rewardBreakdown.totalReward)
                    : label.startsWith("TOT")
                      ? rewardTone(metric.rewardBreakdown.totBonus)
                      : rewardTone(metric.rewardBreakdown.threatPenalty),
              }}
            />
          ))}
        </Stack>

        <Typography variant="caption" sx={{ color: "#4d5a48" }}>
          상태: {missionState}
        </Typography>
      </Stack>
    </Paper>
  );
}

