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
  if (value > 0) return "#63efb4";
  if (value < 0) return "#ff948b";
  return "#9abcbc";
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
        border: "1px solid rgba(45, 214, 196, 0.22)",
        background:
          "linear-gradient(180deg, rgba(9, 24, 31, 0.96) 0%, rgba(5, 14, 18, 0.98) 100%)",
        boxShadow: "0 18px 34px rgba(0, 0, 0, 0.28)",
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
              backgroundColor: "rgba(45, 214, 196, 0.14)",
              color: "#8efff1",
            }}
          />
        </Stack>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                backgroundColor: "rgba(255,255,255,0.05)",
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

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          상태: {missionState}
        </Typography>
      </Stack>
    </Paper>
  );
}
