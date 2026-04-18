import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CombatStatusBar from "@/gui/map/feature/shared/CombatStatusBar";
import EntityIcon from "@/gui/map/toolbar/EntityIcon";
import { colorPalette } from "@/utils/constants";
import { colorNameToHex, SIDE_COLOR } from "@/utils/colors";

export interface SelectedCombatantSummary {
  type: "aircraft" | "airbase" | "army" | "facility" | "ship" | "weapon";
  name: string;
  className: string;
  sideName: string;
  sideColor: SIDE_COLOR;
  currentHp: number;
  maxHp: number;
  defense: number;
  attackPower?: number;
}

const COMBATANT_TYPE_LABEL: Record<SelectedCombatantSummary["type"], string> = {
  aircraft: "항공기",
  airbase: "기지",
  army: "지상군",
  facility: "시설",
  ship: "함정",
  weapon: "무장",
};

interface SelectedUnitStatusCardProps {
  combatant: SelectedCombatantSummary;
  mobileView: boolean;
}

export default function SelectedUnitStatusCard({
  combatant,
  mobileView,
}: Readonly<SelectedUnitStatusCardProps>) {
  const accentColor = colorNameToHex(combatant.sideColor);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: mobileView ? "min(320px, calc(100vw - 2em))" : 320,
        borderRadius: 3,
        px: 1.6,
        pt: 1.8,
        pb: 1.45,
        background:
          "linear-gradient(145deg, rgba(40, 44, 52, 0.96) 0%, rgba(28, 35, 24, 0.94) 100%)",
        border: "1px solid rgba(247, 243, 234, 0.1)",
        boxShadow: `0 16px 40px ${accentColor}33`,
        backdropFilter: "blur(12px)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${accentColor} 0%, rgba(247, 243, 234, 0.85) 100%)`,
        }}
      />

      <Stack spacing={1.3}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: `${accentColor}22`,
              border: `1px solid ${accentColor}55`,
              flexShrink: 0,
            }}
          >
            <EntityIcon
              type={combatant.type}
              color={combatant.sideColor}
              width={24}
              height={24}
            />
          </Box>

          <Stack spacing={0.3} sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(221, 255, 250, 0.74)",
                fontWeight: 700,
                letterSpacing: "0.12em",
              }}
            >
              선택 유닛
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "var(--fs-text)",
                fontWeight: 700,
                lineHeight: 1.15,
              }}
              noWrap
            >
              {combatant.name}
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ flexWrap: "wrap" }}
            >
              <Typography
                variant="caption"
                sx={{ color: "rgba(221, 255, 250, 0.74)" }}
              >
                {combatant.className}
              </Typography>
              <Box
                sx={{
                  px: 0.7,
                  py: 0.15,
                  borderRadius: 999,
                  bgcolor: "rgba(247, 243, 234, 0.08)",
                  border: "1px solid rgba(247, 243, 234, 0.12)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "var(--fs-text)",
                    fontSize: "0.67rem",
                    fontWeight: 700,
                  }}
                >
                  {COMBATANT_TYPE_LABEL[combatant.type]}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: "rgba(221, 255, 250, 0.74)" }}
              >
                세력 {combatant.sideName}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <CombatStatusBar
          currentHp={combatant.currentHp}
          maxHp={combatant.maxHp}
          defense={combatant.defense}
          attackPower={combatant.attackPower}
          compact
        />
      </Stack>
    </Box>
  );
}
