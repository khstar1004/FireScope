import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { colorPalette } from "@/utils/constants";

interface CombatStatusBarProps {
  currentHp: number;
  maxHp: number;
  defense?: number;
  attackPower?: number;
  compact?: boolean;
}

function roundStat(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function getHealthRatio(currentHp: number, maxHp: number) {
  if (!Number.isFinite(maxHp) || maxHp <= 0) {
    return 0;
  }
  return Math.min(Math.max(currentHp / maxHp, 0), 1);
}

function getHealthTone(healthRatio: number) {
  if (healthRatio <= 0.25) {
    return {
      label: "위험",
      fill: "#ef5350",
      glow: "rgba(239, 83, 80, 0.38)",
      accent: "#ffc3be",
    };
  }
  if (healthRatio <= 0.6) {
    return {
      label: "손상",
      fill: "#f0b429",
      glow: "rgba(240, 180, 41, 0.34)",
      accent: "#ffe7ab",
    };
  }
  return {
    label: "안정",
    fill: "#5ac878",
    glow: "rgba(90, 200, 120, 0.32)",
    accent: "#c6ffd3",
  };
}

function StatPill({
  label,
  value,
  compact = false,
}: Readonly<{
  label: string;
  value: number;
  compact?: boolean;
}>) {
  return (
    <Box
      sx={{
        px: compact ? 0.9 : 1.1,
        py: compact ? 0.35 : 0.45,
        borderRadius: 999,
        bgcolor: "rgba(247, 243, 234, 0.1)",
        border: "1px solid rgba(247, 243, 234, 0.14)",
      }}
    >
        <Typography
        variant="caption"
        sx={{
          color: "rgba(221, 255, 250, 0.74)",
          fontSize: compact ? "0.63rem" : "0.69rem",
          letterSpacing: "0.04em",
        }}
      >
        {label} {roundStat(value)}
      </Typography>
    </Box>
  );
}

export default function CombatStatusBar({
  currentHp,
  maxHp,
  defense,
  attackPower,
  compact = false,
}: Readonly<CombatStatusBarProps>) {
  const healthRatio = getHealthRatio(currentHp, maxHp);
  const healthPercentage = Math.round(healthRatio * 100);
  const tone = getHealthTone(healthRatio);

  return (
    <Box
      sx={{
        mt: compact ? 0.5 : 0,
        mx: compact ? 0 : 2,
        mb: compact ? 0 : 1.5,
        px: compact ? 0 : 1.35,
        py: compact ? 0 : 1.1,
        borderRadius: compact ? 0 : 2.5,
        bgcolor: compact ? "transparent" : "rgba(247, 243, 234, 0.05)",
        border: compact ? "none" : "1px solid rgba(247, 243, 234, 0.08)",
        boxShadow: compact ? "none" : `0 10px 30px ${tone.glow}`,
      }}
    >
      <Stack spacing={compact ? 0.65 : 0.9}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Typography
              variant="caption"
              sx={{
                color: "rgba(221, 255, 250, 0.74)",
                fontWeight: 700,
                letterSpacing: "0.12em",
              }}
            >
              HP
            </Typography>
            <Box
              sx={{
                px: 0.9,
                py: 0.25,
                borderRadius: 999,
                bgcolor: tone.glow,
                border: `1px solid ${tone.fill}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: tone.accent,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {tone.label}
              </Typography>
            </Box>
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: "var(--fs-text)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {roundStat(currentHp)} / {roundStat(maxHp)}
          </Typography>
        </Stack>

        <Box
          sx={{
            position: "relative",
            height: compact ? 10 : 12,
            borderRadius: 999,
            overflow: "hidden",
            bgcolor: "rgba(247, 243, 234, 0.12)",
            boxShadow: "inset 0 0 0 1px rgba(247, 243, 234, 0.1)",
          }}
        >
          <Box
            data-testid="combat-status-bar-fill"
            sx={{
              width: `${healthPercentage}%`,
              minWidth: healthPercentage > 0 ? (compact ? 6 : 8) : 0,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${tone.fill} 0%, ${tone.accent} 100%)`,
              boxShadow: `0 0 18px ${tone.glow}`,
              transition: "width 180ms ease-out",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent 0, transparent 18px, rgba(28, 35, 24, 0.16) 18px, rgba(28, 35, 24, 0.16) 20px)",
              pointerEvents: "none",
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={0.8}
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexWrap: "wrap" }}
        >
          <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
            <StatPill label="HP" value={healthPercentage} compact={compact} />
            {typeof defense === "number" && (
              <StatPill label="DEF" value={defense} compact={compact} />
            )}
            {typeof attackPower === "number" && (
              <StatPill label="ATK" value={attackPower} compact={compact} />
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
