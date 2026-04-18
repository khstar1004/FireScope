import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import { RL_LAB_PALETTE } from "@/gui/rl/rlLabPalette";
import RlLabInfoButton from "@/gui/rl/RlLabInfoButton";

interface RlBattleWatchPanelProps {
  statusLabel: string;
  algorithmLabel: string;
  latestCheckpointStep: number | null;
  latestWinRateLabel: string;
  latestRewardLabel: string;
  selectedTargetLabel: string;
  launchCount: number;
  assignmentLabels: string[];
  rewardLabels: string[];
  canStartAutoSpectator: boolean;
  canOpenCheckpointReplay: boolean;
  canOpenEvaluationReplay: boolean;
  onStartAutoSpectator: () => void;
  onOpenCheckpointReplay: () => void;
  onOpenEvaluationReplay: () => void;
}

const WATCH_CARD_SX = {
  p: 1.5,
  borderRadius: 2.5,
  border: `1px solid ${RL_LAB_PALETTE.surfaceStrongBorder}`,
  backgroundColor: RL_LAB_PALETTE.surfaceRaisedStrong,
  color: RL_LAB_PALETTE.text,
} as const;

const WATCH_GRID_SX = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    lg: "repeat(3, minmax(0, 1fr))",
  },
} as const;

function renderChips(labels: string[]) {
  if (labels.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: RL_LAB_PALETTE.mutedText }}>
        아직 표시할 교전 신호가 없습니다.
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      {labels.map((label) => (
        <Chip key={label} size="small" variant="outlined" label={label} />
      ))}
    </Stack>
  );
}

export default function RlBattleWatchPanel(
  props: Readonly<RlBattleWatchPanelProps>
) {
  return (
    <Box sx={WATCH_GRID_SX}>
      <Box sx={WATCH_CARD_SX}>
        <Stack spacing={1.2}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              맵 리플레이
            </Typography>
            <RlLabInfoButton
              title="맵 리플레이"
              content={
                "전투 결과는 메인 맵에서 확인하는 것이 가장 직관적입니다.\n자동 감시는 체크포인트가 갱신될 때마다 최신 전투를 다시 열고, 우하단 RL 패널에서 step 보상도 같이 볼 수 있습니다."
              }
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<MapIcon />}
              onClick={props.onStartAutoSpectator}
              disabled={!props.canStartAutoSpectator}
              sx={{
                backgroundColor: RL_LAB_PALETTE.accent,
                color: RL_LAB_PALETTE.heroText,
                "&:hover": {
                  backgroundColor: RL_LAB_PALETTE.accentHover,
                },
              }}
            >
              체크포인트 자동 감시
            </Button>
            <Button
              variant="outlined"
              startIcon={<MapIcon />}
              onClick={props.onOpenCheckpointReplay}
              disabled={!props.canOpenCheckpointReplay}
            >
              최신 체크포인트
            </Button>
            <Button
              variant="outlined"
              startIcon={<MapIcon />}
              onClick={props.onOpenEvaluationReplay}
              disabled={!props.canOpenEvaluationReplay}
            >
              최종 평가
            </Button>
          </Stack>
          <Divider />
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip size="small" label={`상태 ${props.statusLabel}`} />
            <Chip size="small" label={`알고리즘 ${props.algorithmLabel}`} />
            <Chip
              size="small"
              label={`체크포인트 ${
                props.latestCheckpointStep !== null
                  ? props.latestCheckpointStep
                  : "-"
              }`}
            />
          </Stack>
        </Stack>
      </Box>

      <Box sx={WATCH_CARD_SX}>
        <Stack spacing={1.2}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              교전 신호
            </Typography>
            <RlLabInfoButton
              title="교전 신호"
              content={
                "승률과 보상이 올라가고, 선택 표적이 안정되고, 발사 수가 늘면 정책이 전투 흐름을 더 잘 잡기 시작한 것입니다.\n배정 칩에서는 어떤 아군이 어떤 표적을 맡는지 바로 볼 수 있습니다."
              }
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip size="small" label={`승률 ${props.latestWinRateLabel}`} />
            <Chip size="small" label={`보상 ${props.latestRewardLabel}`} />
            <Chip size="small" label={`표적 ${props.selectedTargetLabel}`} />
            <Chip size="small" label={`발사 ${props.launchCount}`} />
          </Stack>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            표적 배정
          </Typography>
          {renderChips(props.assignmentLabels)}
        </Stack>
      </Box>

      <Box sx={WATCH_CARD_SX}>
        <Stack spacing={1.2}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              보상 해석
            </Typography>
            <RlLabInfoButton
              title="보상 해석"
              content={
                "TOT, Threat, Launch, Terminal 항목을 보면 현재 장면이 왜 좋거나 나쁜지 바로 해석할 수 있습니다.\n아래 칩은 최신 평가 또는 최신 체크포인트에서 계산된 보상 분해값입니다."
              }
            />
          </Stack>
          {renderChips(props.rewardLabels)}
        </Stack>
      </Box>
    </Box>
  );
}
