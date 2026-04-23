import { useMemo } from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type Game from "@/game/Game";
import type {
  GuideRailAlertId,
  GuideRailAssetSelectionLabels,
  GuideRailAssetMixId,
} from "@/gui/map/guideRailIntents";
import { APP_GUIDE_RAIL_WIDTH } from "@/utils/constants";
import { colorNameToHex } from "@/utils/colors";

type GuideStageId =
  | "select"
  | "placement"
  | "simulate"
  | "spectate"
  | "analysis";

type GuideStageState = "complete" | "active" | "upcoming";

interface ExperienceGuideRailProps {
  mobileView: boolean;
  game: Game;
  drawerOpen: boolean;
  startAssetPlacement: () => void;
  onAlertAction: (alertId: GuideRailAlertId) => void;
  onAssetMixAction: (assetType: GuideRailAssetMixId) => void;
  activeAssetMixId: GuideRailAssetMixId | null;
  assetSelectionLabels: GuideRailAssetSelectionLabels;
  playOnClick: () => void;
  pauseOnClick: () => void;
  stepOnClick: () => void;
  openScenario3dView: () => void;
  openSimulationLogs: () => void;
}

interface GuideStageDefinition {
  id: GuideStageId;
  title: string;
}

interface GuideStage extends GuideStageDefinition {
  state: GuideStageState;
}

interface RailActionModel {
  label: string;
  onClick: () => void;
  icon: React.JSX.Element;
}

interface RailAlert {
  id: GuideRailAlertId;
  label: string;
  tone: "warning" | "info";
}

function resolveActiveStageId(options: {
  hasAssets: boolean;
  hasActivity: boolean;
  scenarioPaused: boolean;
}): GuideStageId {
  if (!options.hasAssets) {
    return "select";
  }

  if (options.hasActivity && options.scenarioPaused) {
    return "analysis";
  }

  if (options.hasActivity && !options.scenarioPaused) {
    return "spectate";
  }

  if (!options.scenarioPaused) {
    return "simulate";
  }

  return "placement";
}

function formatElapsedTime(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function truncateQuickSelectionLabel(label: string, maxLength: number = 18) {
  const normalizedLabel = label.replace(/\s+/g, " ").trim();

  if (normalizedLabel.length <= maxLength) {
    return normalizedLabel;
  }

  return `${normalizedLabel.slice(0, maxLength - 3)}...`;
}

export default function ExperienceGuideRail({
  mobileView,
  game,
  drawerOpen,
  startAssetPlacement,
  onAlertAction,
  onAssetMixAction,
  activeAssetMixId,
  assetSelectionLabels,
  playOnClick,
  pauseOnClick,
  stepOnClick,
  openScenario3dView,
  openSimulationLogs,
}: Readonly<ExperienceGuideRailProps>) {
  const scenario = game.currentScenario;
  const scenarioLogs = game.simulationLogs.getLogs();
  const currentSide = scenario.getSide(game.currentSideId);
  const scenarioPaused = game.scenarioPaused;
  const friendlyAircraft = scenario.aircraft.filter(
    (unit) => unit.sideId === game.currentSideId
  );
  const friendlyAirbases = scenario.airbases.filter(
    (unit) => unit.sideId === game.currentSideId
  );
  const friendlyArmies = scenario.armies.filter(
    (unit) => unit.sideId === game.currentSideId
  );
  const friendlyFacilities = scenario.facilities.filter(
    (unit) => unit.sideId === game.currentSideId
  );
  const friendlyShips = scenario.ships.filter(
    (unit) => unit.sideId === game.currentSideId
  );
  const totalAssets =
    friendlyAircraft.length +
    friendlyAirbases.length +
    friendlyArmies.length +
    friendlyFacilities.length +
    friendlyShips.length;
  const currentSideAssetCount = totalAssets;
  const hostileContacts = game.currentSideId
    ? scenario.getAllTargetsFromEnemySides(game.currentSideId).length
    : 0;
  const hasAssets = totalAssets > 0;
  const hasActivity =
    scenario.weapons.length > 0 ||
    scenarioLogs.length > 0 ||
    scenario.currentTime > scenario.startTime;
  const elapsedTime = formatElapsedTime(
    scenario.currentTime - scenario.startTime
  );
  const activeStageId = resolveActiveStageId({
    hasAssets,
    hasActivity,
    scenarioPaused,
  });
  const activeStageIndex = {
    select: 0,
    placement: 1,
    simulate: 2,
    spectate: 3,
    analysis: 4,
  }[activeStageId];
  const currentSideColor = currentSide
    ? colorNameToHex(currentSide.color)
    : "#86fff2";
  const metrics = [
    { label: "자산", value: totalAssets },
    { label: "위협", value: hostileContacts },
    { label: "경과", value: elapsedTime },
  ];
  const assetMix = [
    { id: "manned-aircraft" as const, label: "유인기" },
    { id: "drone" as const, label: "드론" },
    { id: "airbase" as const, label: "기지" },
    { id: "facility" as const, label: "시설" },
    { id: "armor" as const, label: "기갑" },
    { id: "ship" as const, label: "해상" },
  ];
  const activeAssetSelectionLabel = activeAssetMixId
    ? assetSelectionLabels[activeAssetMixId]
    : undefined;

  const primaryAction = useMemo<RailActionModel>(() => {
    if (!hasAssets) {
      return {
        label: "배치 시작",
        onClick: startAssetPlacement,
        icon: <AddCircleOutlineRoundedIcon />,
      };
    }

    if (!hasActivity && scenarioPaused) {
      return {
        label: "실행 시작",
        onClick: playOnClick,
        icon: <PlayArrowRoundedIcon />,
      };
    }

    if (scenarioPaused) {
      return {
        label: "기록",
        onClick: openSimulationLogs,
        icon: <ArticleOutlinedIcon />,
      };
    }

    return {
      label: "영역 3D",
      onClick: openScenario3dView,
      icon: <VisibilityOutlinedIcon />,
    };
  }, [
    hasActivity,
    hasAssets,
    openScenario3dView,
    openSimulationLogs,
    playOnClick,
    scenarioPaused,
    startAssetPlacement,
  ]);

  const secondaryAction = useMemo(() => {
    if (!hasAssets) {
      return null;
    }

    if (!scenarioPaused) {
      return {
        label: "정지",
        onClick: pauseOnClick,
      };
    }

    if (!hasActivity) {
      return {
        label: "1단계",
        onClick: stepOnClick,
      };
    }

    return {
      label: "영역 3D",
      onClick: openScenario3dView,
    };
  }, [
    hasActivity,
    hasAssets,
    openScenario3dView,
    pauseOnClick,
    scenarioPaused,
    stepOnClick,
  ]);

  const alerts = useMemo<RailAlert[]>(() => {
    const nextAlerts: RailAlert[] = [];

    if (!hasAssets) {
      nextAlerts.push({
        id: "no-assets",
        label: "전력 없음",
        tone: "warning",
      });
    } else if (game.currentSideId && currentSideAssetCount === 0) {
      nextAlerts.push({
        id: "no-friendly-assets",
        label: "아군 없음",
        tone: "warning",
      });
    }

    if (hostileContacts === 0) {
      nextAlerts.push({
        id: "no-hostiles",
        label: "적 없음",
        tone: "warning",
      });
    }

    if (hasAssets && scenario.missions.length === 0) {
      nextAlerts.push({
        id: "no-missions",
        label: "임무 없음",
        tone: "info",
      });
    }

    if (!scenarioPaused && scenario.weapons.length > 0) {
      nextAlerts.push({
        id: "engagement-live",
        label: "교전 중",
        tone: "info",
      });
    }

    if (!hasAssets && drawerOpen) {
      nextAlerts.unshift({
        id: "drawer-open",
        label: "도크 열림",
        tone: "info",
      });
    }

    return nextAlerts.slice(0, 4);
  }, [
    currentSideAssetCount,
    drawerOpen,
    game.currentSideId,
    hasAssets,
    hostileContacts,
    scenario.missions.length,
    scenario.weapons.length,
    scenarioPaused,
  ]);

  const stageDefinitions: GuideStageDefinition[] = [
    { id: "select", title: "자산 선택" },
    { id: "placement", title: "자산 배치" },
    { id: "simulate", title: "실행" },
    { id: "spectate", title: "3D 관전" },
    { id: "analysis", title: "결과 분석" },
  ];

  const stages: GuideStage[] = stageDefinitions.map((stage, index) => ({
    ...stage,
    state:
      index < activeStageIndex
        ? "complete"
        : index === activeStageIndex
          ? "active"
          : "upcoming",
  }));

  return (
    <Box
      sx={{
        position: "absolute",
        top: {
          xs: "calc(env(safe-area-inset-top, 0px) + 4.8rem)",
          md: "calc(env(safe-area-inset-top, 0px) + 5.3rem)",
        },
        left: mobileView ? 12 : 16,
        width: {
          xs: "calc(100% - 24px)",
          md: APP_GUIDE_RAIL_WIDTH,
        },
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <Stack
        spacing={1}
        sx={{
          maxHeight: {
            xs: "calc(100dvh - env(safe-area-inset-top, 0px) - 6rem)",
            md: "calc(100dvh - env(safe-area-inset-top, 0px) - 6.8rem)",
          },
          overflowY: "auto",
          pr: 0.2,
          pointerEvents: "auto",
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha("#86fff2", 0.22),
            borderRadius: 999,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          scrollbarColor: `${alpha("#86fff2", 0.22)} transparent`,
        }}
      >
        <Box
          sx={{
            p: 1.15,
            borderRadius: 3,
            backgroundColor: alpha("#07151b", 0.92),
            border: `1px solid ${alpha("#86fff2", 0.1)}`,
            backdropFilter: "blur(18px)",
            boxShadow: `0 18px 34px ${alpha("#000000", 0.22)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 10.5,
              letterSpacing: "0.1em",
              color: "var(--fs-accent-soft)",
            }}
          >
            시나리오
          </Typography>
          <Typography
            sx={{
              mt: 0.3,
              fontSize: 22,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            {scenario.name}
          </Typography>

          <Stack
            direction="row"
            spacing={0.55}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 0.85 }}
          >
            <Chip
              size="small"
              label={scenarioPaused ? "PAUSED" : "LIVE"}
              sx={{
                height: 24,
                backgroundColor: scenarioPaused
                  ? alpha("#ffbe63", 0.16)
                  : alpha("#35d9c6", 0.16),
                color: scenarioPaused ? "#ffcf8e" : "var(--fs-accent-soft)",
              }}
            />
            <Chip
              size="small"
              label={currentSide ? currentSide.name : "세력"}
              sx={{
                height: 24,
                backgroundColor: alpha(currentSideColor, 0.14),
                color: currentSideColor,
              }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={stages[activeStageIndex]?.title}
              sx={{ height: 24 }}
            />
          </Stack>

          <Stack direction="row" spacing={0.6} sx={{ mt: 0.95 }}>
            {metrics.map((item) => (
              <Box
                key={item.label}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  px: 0.7,
                  py: 0.65,
                  borderRadius: 1.9,
                  backgroundColor: alpha("#ffffff", 0.03),
                  border: `1px solid ${alpha("#86fff2", 0.05)}`,
                }}
              >
                <Typography
                  sx={{ fontSize: 10, color: "var(--fs-text-soft)" }}
                >
                  {item.label}
                </Typography>
                <Typography sx={{ mt: 0.18, fontSize: 14, fontWeight: 800 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box
            sx={{
              mt: 0.85,
              px: 0.75,
              py: 0.72,
              borderRadius: 2.1,
              backgroundColor: alpha("#ffffff", 0.03),
              border: `1px solid ${alpha("#86fff2", 0.06)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: 10.5,
                letterSpacing: "0.08em",
                color: "var(--fs-accent-soft)",
              }}
            >
              빠른 배치
            </Typography>
            <Stack
              direction="row"
              spacing={0.45}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 0.55 }}
            >
              {assetMix.map((item) => {
                const isActive = activeAssetMixId === item.id;

                return (
                  <Box
                    key={item.id}
                    component="button"
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onAssetMixAction(item.id)}
                    sx={{
                      minWidth: 58,
                      px: 0.68,
                      py: 0.58,
                      borderRadius: 1.6,
                      backgroundColor: isActive
                        ? alpha("#35d9c6", 0.16)
                        : alpha("#000000", 0.12),
                      border: `1px solid ${
                        isActive
                          ? alpha("#86fff2", 0.22)
                          : alpha("#86fff2", 0.06)
                      }`,
                      boxShadow: isActive
                        ? `inset 0 0 0 1px ${alpha("#86fff2", 0.12)}`
                        : "none",
                      color: "inherit",
                      textAlign: "center",
                      cursor: "pointer",
                      transition:
                        "background-color 140ms ease, border-color 140ms ease",
                      "&:hover": {
                        backgroundColor: alpha("#35d9c6", 0.12),
                        borderColor: alpha("#86fff2", 0.18),
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
            {activeAssetSelectionLabel && (
              <Box
                sx={{
                  mt: 0.52,
                  px: 0.7,
                  py: 0.42,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  maxWidth: "100%",
                  backgroundColor: alpha("#35d9c6", 0.12),
                  border: `1px solid ${alpha("#86fff2", 0.12)}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--fs-accent-soft)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {truncateQuickSelectionLabel(activeAssetSelectionLabel)}
                </Typography>
              </Box>
            )}
          </Box>

          {alerts.length > 0 && (
            <Box
              sx={{
                mt: 0.85,
                px: 0.75,
                py: 0.72,
                borderRadius: 2.1,
                backgroundColor: alpha("#ffffff", 0.03),
                border: `1px solid ${alpha("#86fff2", 0.06)}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  letterSpacing: "0.08em",
                  color: "var(--fs-accent-soft)",
                }}
              >
                공백
              </Typography>
              <Stack
                direction="row"
                spacing={0.55}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 0.55 }}
              >
                {alerts.map((alert) => (
                  <Chip
                    key={alert.id}
                    size="small"
                    label={alert.label}
                    clickable
                    onClick={() => onAlertAction(alert.id)}
                    sx={{
                      height: 24,
                      backgroundColor:
                        alert.tone === "warning"
                          ? alpha("#ffbe63", 0.14)
                          : alpha("#86fff2", 0.12),
                      color:
                        alert.tone === "warning"
                          ? "#ffcf8e"
                          : "var(--fs-accent-soft)",
                      "& .MuiChip-label": {
                        px: 1.1,
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Stack
            direction={secondaryAction ? "row" : "column"}
            spacing={0.7}
            sx={{ mt: 1 }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={primaryAction.icon}
              onClick={primaryAction.onClick}
              sx={{ minHeight: 46, borderRadius: 999, fontWeight: 800 }}
            >
              {primaryAction.label}
            </Button>
            {secondaryAction && (
              <Button
                fullWidth
                variant="outlined"
                onClick={secondaryAction.onClick}
                sx={{ minHeight: 46, borderRadius: 999, fontWeight: 700 }}
              >
                {secondaryAction.label}
              </Button>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            p: 1.05,
            borderRadius: 3,
            backgroundColor: alpha("#07151b", 0.88),
            border: `1px solid ${alpha("#86fff2", 0.09)}`,
            backdropFilter: "blur(18px)",
            boxShadow: `0 18px 34px ${alpha("#000000", 0.2)}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography sx={{ fontSize: 12.5, fontWeight: 800 }}>
              단계
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              {activeStageIndex + 1}/{stages.length}
            </Typography>
          </Stack>

          <Stack spacing={0.45} sx={{ mt: 0.85 }}>
            {stages.map((stage, index) => {
              const isActive = stage.state === "active";
              const isComplete = stage.state === "complete";
              const isNext =
                stage.state === "upcoming" && index === activeStageIndex + 1;

              return (
                <Stack
                  key={stage.id}
                  direction="row"
                  spacing={0.75}
                  alignItems="stretch"
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 12,
                      flexShrink: 0,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {index < stages.length - 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 14,
                          bottom: -14,
                          width: 1,
                          backgroundColor: alpha("#86fff2", 0.08),
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: "relative",
                        mt: 0.55,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: isComplete
                          ? alpha("#35d9c6", 0.92)
                          : isActive
                            ? alpha("#86fff2", 0.92)
                            : alpha("#ffffff", 0.16),
                        boxShadow: isActive
                          ? `0 0 0 3px ${alpha("#35d9c6", 0.12)}`
                          : "none",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      position: "relative",
                      flex: 1,
                      minWidth: 0,
                      p: 0.78,
                      borderRadius: 2.1,
                      backgroundColor: isActive
                        ? alpha("#86fff2", 0.08)
                        : alpha("#ffffff", 0.02),
                      border: isActive
                        ? `1px solid ${alpha("#86fff2", 0.16)}`
                        : `1px solid ${alpha("#86fff2", 0.05)}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.65}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={0.7} alignItems="center">
                        <Typography
                          sx={{
                            fontSize: 10.5,
                            color: "text.secondary",
                          }}
                        >
                          {index + 1}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            minWidth: 0,
                          }}
                        >
                          {stage.title}
                        </Typography>
                      </Stack>
                      {isActive ? (
                        <Chip
                          size="small"
                          color="primary"
                          label="진행"
                          sx={{ height: 22 }}
                        />
                      ) : isComplete ? (
                        <Typography
                          sx={{
                            fontSize: 10,
                            letterSpacing: "0.08em",
                            color: "var(--fs-accent-soft)",
                          }}
                        >
                          DONE
                        </Typography>
                      ) : isNext ? (
                        <Typography
                          sx={{
                            fontSize: 10,
                            letterSpacing: "0.08em",
                            color: "text.secondary",
                          }}
                        >
                          NEXT
                        </Typography>
                      ) : null}
                    </Stack>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
