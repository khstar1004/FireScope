import { Box, Stack, Typography } from "@mui/material";
import { RL_LAB_PALETTE } from "@/gui/rl/rlLabPalette";

interface RlLabLineChartPoint {
  x: number;
  y: number;
}

interface RlLabLineChartProps {
  title: string;
  subtitle: string;
  color: string;
  points: RlLabLineChartPoint[];
  emptyLabel: string;
}

function formatValue(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "-";
}

export default function RlLabLineChart(props: Readonly<RlLabLineChartProps>) {
  const width = 520;
  const height = 220;
  const padding = 28;

  if (props.points.length < 2) {
    return (
      <Box
        sx={{
          border: `1px solid ${RL_LAB_PALETTE.surfaceStrongBorder}`,
          borderRadius: 3,
          p: 2,
          background: RL_LAB_PALETTE.surfaceBackground,
          color: RL_LAB_PALETTE.text,
          boxShadow: RL_LAB_PALETTE.shadow,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {props.title}
        </Typography>
        {props.subtitle ? (
          <Typography
            variant="body2"
            sx={{ color: RL_LAB_PALETTE.mutedText, mt: 0.5 }}
          >
            {props.subtitle}
          </Typography>
        ) : null}
        <Typography
          variant="body2"
          sx={{ color: RL_LAB_PALETTE.subtleText, mt: 3 }}
        >
          {props.emptyLabel}
        </Typography>
      </Box>
    );
  }

  const xs = props.points.map((point) => point.x);
  const ys = props.points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const xSpan = Math.max(maxX - minX, 1);
  const ySpan = Math.max(maxY - minY, 1);

  const pathData = props.points
    .map((point, index) => {
      const x = padding + ((point.x - minX) / xSpan) * (width - padding * 2);
      const y =
        height - padding - ((point.y - minY) / ySpan) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const latest = props.points.at(-1);

  return (
    <Box
      sx={{
        border: `1px solid ${RL_LAB_PALETTE.surfaceStrongBorder}`,
        borderRadius: 3,
        p: 2,
        background: RL_LAB_PALETTE.surfaceBackground,
        color: RL_LAB_PALETTE.text,
        boxShadow: RL_LAB_PALETTE.shadow,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "baseline" },
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {props.title}
          </Typography>
          {props.subtitle ? (
            <Typography
              variant="body2"
              sx={{ color: RL_LAB_PALETTE.mutedText }}
            >
              {props.subtitle}
            </Typography>
          ) : null}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: props.color, fontWeight: 700 }}
        >
          최신 {formatValue(latest?.y ?? 0)}
        </Typography>
      </Stack>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke={RL_LAB_PALETTE.surfaceBorder}
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke={RL_LAB_PALETTE.surfaceBorder}
          strokeWidth="1"
        />
        <path
          d={pathData}
          fill="none"
          stroke={props.color}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {props.points.map((point, index) => {
          const x =
            padding + ((point.x - minX) / xSpan) * (width - padding * 2);
          const y =
            height -
            padding -
            ((point.y - minY) / ySpan) * (height - padding * 2);
          return (
            <circle
              key={`${point.x}-${point.y}-${index}`}
              cx={x}
              cy={y}
              r="3.5"
              fill={props.color}
            />
          );
        })}
      </svg>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          mt: 1,
          gap: 0.5,
          color: RL_LAB_PALETTE.mutedText,
        }}
      >
        <Typography variant="caption">min {formatValue(minY)}</Typography>
        <Typography variant="caption">max {formatValue(maxY)}</Typography>
      </Stack>
    </Box>
  );
}
