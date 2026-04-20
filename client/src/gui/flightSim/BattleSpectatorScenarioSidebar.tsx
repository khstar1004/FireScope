import { useEffect, useMemo, useRef, useState } from "react";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AirlineStopsOutlinedIcon from "@mui/icons-material/AirlineStopsOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Pause, PlayArrow, Save, Undo } from "@mui/icons-material";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type Game from "@/game/Game";
import type {
  BattleSpectatorUnitSnapshot,
  FocusFireSummary,
} from "@/game/Game";
import { useChatbot } from "@/gui/agent/chatbot";
import { buildFocusFireInsight } from "@/gui/analysis/operationInsight";
import type { FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";
import { resolveFocusFireDockStage } from "@/gui/fires/focusFireDockState";
import ArmyGptPanel, {
  type ArmyGptBriefingCard,
} from "@/gui/map/toolbar/ArmyGptPanel";
import { isScenarioEmptyForOnboarding } from "@/gui/map/scenarioOnboarding";
import ToolbarCollapsible from "@/gui/map/toolbar/ToolbarCollapsible";
import { getDisplayName } from "@/utils/koreanCatalog";

type FocusFireAirwatchSidebarState = {
  objectiveName?: string;
  objectiveLon?: number;
  objectiveLat?: number;
  active?: boolean;
  captureProgress?: number;
  aircraftCount?: number;
  artilleryCount?: number;
  armorCount?: number;
  weaponsInFlight?: number;
  statusLabel?: string;
};

type ScenarioPresetItem = {
  name: string;
  displayName: string;
};

type CommandPanelRiskTone = "neutral" | "accent" | "warning" | "danger";

interface BattleSpectatorScenarioSidebarProps {
  game: Game;
  battleSpectator?: FlightSimBattleSpectatorState;
  focusFireAirwatch?: FocusFireAirwatchSidebarState;
  scenarioName: string;
  scenarioPaused: boolean;
  scenarioTimeCompression: number;
  visibleScenarioPresets: readonly ScenarioPresetItem[];
  presetListExpanded: boolean;
  selectedUnit?: BattleSpectatorUnitSnapshot;
  selectedUnitTargetName?: string | null;
  onNewScenario: () => void;
  onLoadScenarioClick: () => void;
  onRestartScenario: () => void;
  onStepScenario: () => void;
  onTogglePlay: () => void;
  onToggleTimeCompression: () => void;
  onExportScenario: () => void;
  onRenameScenario: () => void;
  onTogglePresetListExpanded: () => void;
  onLoadPresetScenario: (preset: ScenarioPresetItem) => void;
  onFocusObjective?: () => void;
  onFocusSelectedUnit?: () => void;
  onTrackSelectedUnit?: () => void;
}

function buildFocusFireSummary(
  focusFireAirwatch?: FocusFireAirwatchSidebarState
): FocusFireSummary {
  const hasObjective =
    typeof focusFireAirwatch?.objectiveLon === "number" &&
    Number.isFinite(focusFireAirwatch.objectiveLon) &&
    typeof focusFireAirwatch?.objectiveLat === "number" &&
    Number.isFinite(focusFireAirwatch.objectiveLat);
  const enabled =
    Boolean(focusFireAirwatch?.active) ||
    hasObjective ||
    Boolean(focusFireAirwatch?.objectiveName);

  return {
    enabled,
    active: focusFireAirwatch?.active ?? false,
    objectiveName: focusFireAirwatch?.objectiveName ?? null,
    objectiveLatitude: hasObjective ? focusFireAirwatch?.objectiveLat ?? null : null,
    objectiveLongitude: hasObjective
      ? focusFireAirwatch?.objectiveLon ?? null
      : null,
    desiredEffectOverride: null,
    captureProgress: focusFireAirwatch?.captureProgress ?? 0,
    artilleryCount: focusFireAirwatch?.artilleryCount ?? 0,
    armorCount: focusFireAirwatch?.armorCount ?? 0,
    aircraftCount: focusFireAirwatch?.aircraftCount ?? 0,
    weaponsInFlight: focusFireAirwatch?.weaponsInFlight ?? 0,
    statusLabel: focusFireAirwatch?.statusLabel ?? "대기 중",
    launchPlatforms: [],
    weaponTracks: [],
    recommendation: null,
  };
}

function countAssetsBySideId(
  scenario: Game["currentScenario"] | undefined,
  sideId: string | null,
  godMode = false
) {
  const aircraft = scenario?.aircraft ?? [];
  const airbases = scenario?.airbases ?? [];
  const armies = scenario?.armies ?? [];
  const facilities = scenario?.facilities ?? [];
  const ships = scenario?.ships ?? [];

  const countBySide = <T extends { sideId: string }>(items: T[]) => {
    if (godMode || !sideId) {
      return items.length;
    }
    return items.filter((item) => item.sideId === sideId).length;
  };

  return {
    aircraft: countBySide(aircraft),
    airbases: countBySide(airbases),
    armies: countBySide(armies),
    facilities: countBySide(facilities),
    ships: countBySide(ships),
  };
}

function getMissionTypeLabel(mission: { constructor?: { name?: string } }) {
  const typeName = mission.constructor?.name ?? "Mission";
  return typeName.replace(/Mission$/, "") || "Mission";
}

function getRiskToneColor(riskTone: CommandPanelRiskTone) {
  if (riskTone === "danger") {
    return "#ffb0b0";
  }
  if (riskTone === "warning") {
    return "var(--fs-sand)";
  }
  return "var(--fs-accent-soft)";
}

function getRiskToneBorderColor(riskTone: CommandPanelRiskTone) {
  if (riskTone === "danger") {
    return "rgba(255, 122, 122, 0.26)";
  }
  if (riskTone === "warning") {
    return "rgba(240, 187, 109, 0.28)";
  }
  return "rgba(45, 214, 196, 0.24)";
}

function getRiskToneBackgroundColor(riskTone: CommandPanelRiskTone) {
  if (riskTone === "danger") {
    return "rgba(255, 122, 122, 0.08)";
  }
  if (riskTone === "warning") {
    return "rgba(240, 187, 109, 0.08)";
  }
  return "rgba(45, 214, 196, 0.08)";
}

export default function BattleSpectatorScenarioSidebar(
  props: Readonly<BattleSpectatorScenarioSidebarProps>
) {
  const scenario = props.game.currentScenario;
  const currentSideId =
    scenario?.getSide?.(props.game.currentSideId)?.id ??
    props.battleSpectator?.currentSideId ??
    null;
  const currentSideName =
    scenario?.getSideName?.(props.game.currentSideId) ??
    props.battleSpectator?.currentSideName ??
    "관전자";
  const scenarioAssetCount =
    (scenario?.aircraft?.length ?? 0) +
    (scenario?.airbases?.length ?? 0) +
    (scenario?.armies?.length ?? 0) +
    (scenario?.facilities?.length ?? 0) +
    (scenario?.ships?.length ?? 0);
  const scenarioMissionCount = scenario?.missions?.length ?? 0;
  const scenarioWeaponsInFlight = scenario?.weapons?.length ?? 0;
  const currentSideMissionCount =
    scenario?.missions?.filter((mission) => mission.sideId === currentSideId)
      .length ?? 0;
  const currentSideAssetCounts = useMemo(
    () =>
      countAssetsBySideId(scenario, currentSideId, Boolean(props.game.godMode)),
    [currentSideId, props.game.godMode, scenario]
  );
  const currentSideOperationalFeatureCount =
    currentSideAssetCounts.aircraft +
    currentSideAssetCounts.airbases +
    currentSideAssetCounts.armies +
    currentSideAssetCounts.facilities +
    currentSideAssetCounts.ships;
  const hasScenarioCollections =
    Array.isArray(scenario?.aircraft) &&
    Array.isArray(scenario?.ships) &&
    Array.isArray(scenario?.facilities) &&
    Array.isArray(scenario?.airbases) &&
    Array.isArray(scenario?.armies) &&
    Array.isArray(scenario?.referencePoints);
  const isEmptyScenario =
    scenario && hasScenarioCollections
      ? isScenarioEmptyForOnboarding(scenario)
      : scenarioAssetCount === 0;
  const scenarioStatusLabel = props.scenarioPaused ? "일시정지" : "실행 중";
  const focusFireSummary = useMemo(
    () => buildFocusFireSummary(props.focusFireAirwatch),
    [props.focusFireAirwatch]
  );
  const focusFireInsight = useMemo(
    () => buildFocusFireInsight(focusFireSummary),
    [focusFireSummary]
  );
  const focusFireDockStage = useMemo(
    () => resolveFocusFireDockStage(focusFireSummary),
    [focusFireSummary]
  );
  const focusFireSectionOpen =
    focusFireSummary.enabled ||
    focusFireSummary.active ||
    Boolean(focusFireSummary.objectiveName);
  const missionSectionOpen = currentSideMissionCount > 0;
  const focusFireRiskTone: CommandPanelRiskTone =
    focusFireInsight.shockIndex >= 70 || scenarioWeaponsInFlight >= 4
      ? "danger"
      : focusFireInsight.shockIndex >= 40 || scenarioWeaponsInFlight >= 2
        ? "warning"
        : focusFireSummary.enabled || focusFireSummary.objectiveName
          ? "accent"
          : "neutral";
  const commandPanelSummary = useMemo(() => {
    if (isEmptyScenario) {
      return {
        riskLabel: "구성 전",
        riskTone: "neutral" as const,
        summary: "자산 배치 필요",
        action: "정찰·화력 자산 우선 배치",
        recommendedMissionValue: "초기 배치",
        recommendedMissionDetail: "첫 임무 생성",
      };
    }

    if (
      focusFireSummary.active &&
      (focusFireInsight.shockIndex >= 70 || scenarioWeaponsInFlight >= 4)
    ) {
      return {
        riskLabel: "긴급",
        riskTone: "danger" as const,
        summary: `${
          focusFireSummary.objectiveName ?? "목표 축"
        } 화력 집중 · 비행탄 ${scenarioWeaponsInFlight}발`,
        action: "방호 축 우선 정리",
        recommendedMissionValue: "화력 대응",
        recommendedMissionDetail: "즉응 자산 우선",
      };
    }

    if (
      currentSideMissionCount === 0 &&
      currentSideOperationalFeatureCount > 0
    ) {
      return {
        riskLabel: "주의",
        riskTone: "warning" as const,
        summary: `자산 ${currentSideOperationalFeatureCount} · 임무 없음`,
        action: "초계/타격 임무 생성",
        recommendedMissionValue: "임무 생성 필요",
        recommendedMissionDetail: "표적 또는 순찰 축 지정",
      };
    }

    if (focusFireSummary.enabled || focusFireSummary.objectiveName) {
      return {
        riskLabel: "공세 준비",
        riskTone: "accent" as const,
        summary: `${
          focusFireSummary.objectiveName ?? "목표 축"
        } ${focusFireSummary.statusLabel}`,
        action: "목표·발사 패키지 점검",
        recommendedMissionValue: "화력 임무 준비",
        recommendedMissionDetail: focusFireSummary.statusLabel,
      };
    }

    if (scenarioWeaponsInFlight > 0 || currentSideMissionCount >= 3) {
      return {
        riskLabel: "경계",
        riskTone: "warning" as const,
        summary: `임무 ${currentSideMissionCount} · 비행탄 ${scenarioWeaponsInFlight}`,
        action: "우선순위 재정렬",
        recommendedMissionValue: "임무 재정렬",
        recommendedMissionDetail: "핵심 축 재집중",
      };
    }

    return {
      riskLabel: "안정",
      riskTone: "accent" as const,
      summary: `자산 ${currentSideOperationalFeatureCount} · 임무 ${currentSideMissionCount}`,
      action: "현재 흐름 유지",
      recommendedMissionValue: "현재 임무 유지",
      recommendedMissionDetail: "필요 시 화력 전환",
    };
  }, [
    currentSideMissionCount,
    currentSideOperationalFeatureCount,
    focusFireInsight.shockIndex,
    focusFireSummary.active,
    focusFireSummary.enabled,
    focusFireSummary.objectiveName,
    focusFireSummary.statusLabel,
    isEmptyScenario,
    scenarioWeaponsInFlight,
  ]);
  const sectionHeaderBadges = useMemo(
    () => ({
      recording: [
        {
          label: props.scenarioPaused ? "정지" : "진행",
          tone: props.scenarioPaused ? "warning" : "accent",
        },
        {
          label: `속도 ${props.scenarioTimeCompression}x`,
          tone: "default",
        },
      ] as const,
      assets: [
        {
          label: `${scenarioAssetCount}개`,
          tone: scenarioAssetCount > 0 ? "accent" : "default",
        },
        {
          label: props.game.godMode ? "전체 시점" : currentSideName,
          tone: props.game.godMode ? "warning" : "default",
        },
      ] as const,
      focusFire: [
        {
          label: `충격량 ${focusFireInsight.shockIndex}`,
          tone:
            focusFireRiskTone === "danger"
              ? "danger"
              : focusFireRiskTone === "warning"
                ? "warning"
                : "accent",
        },
        {
          label: focusFireSummary.statusLabel,
          tone: focusFireSummary.active
            ? "danger"
            : focusFireSummary.enabled
              ? "accent"
              : "default",
        },
      ] as const,
      mission: [
        {
          label: `${currentSideMissionCount}개`,
          tone: currentSideMissionCount > 0 ? "accent" : "default",
        },
        {
          label: currentSideName,
          tone: "default",
        },
      ] as const,
    }),
    [
      currentSideMissionCount,
      currentSideName,
      focusFireInsight.shockIndex,
      focusFireRiskTone,
      focusFireSummary.active,
      focusFireSummary.enabled,
      focusFireSummary.statusLabel,
      props.game.godMode,
      props.scenarioPaused,
      props.scenarioTimeCompression,
      scenarioAssetCount,
    ]
  );
  const armyGptBriefingCards: ArmyGptBriefingCard[] = useMemo(
    () => [
      {
        label: "전력",
        value: `자산 ${currentSideOperationalFeatureCount} · 임무 ${currentSideMissionCount}`,
        description: props.game.godMode
          ? `전체 시점 기준으로 자산 ${scenarioAssetCount}개를 관전 중입니다.`
          : `${currentSideName} 기준 현재 전장 자산과 임무 흐름을 추적합니다.`,
        tone: currentSideMissionCount > 0 ? "accent" : "neutral",
      },
      {
        label: "위협",
        value: commandPanelSummary.riskLabel,
        description: commandPanelSummary.summary,
        tone: commandPanelSummary.riskTone,
      },
      {
        label: "권고 임무",
        value: commandPanelSummary.recommendedMissionValue,
        description: commandPanelSummary.recommendedMissionDetail,
        tone:
          commandPanelSummary.riskTone === "danger" ? "warning" : "accent",
      },
    ],
    [
      commandPanelSummary.recommendedMissionDetail,
      commandPanelSummary.recommendedMissionValue,
      commandPanelSummary.riskLabel,
      commandPanelSummary.riskTone,
      commandPanelSummary.summary,
      currentSideMissionCount,
      currentSideName,
      currentSideOperationalFeatureCount,
      props.game.godMode,
      scenarioAssetCount,
    ]
  );
  const { messages, inputValue, setInputValue, handleSendMessage, isLoading } =
    useChatbot({ game: props.game });
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = chatMessagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [isLoading, messages]);

  const currentSideMissions =
    scenario?.missions?.filter((mission) => mission.sideId === currentSideId) ?? [];
  const selectedUnitSubtitle = props.selectedUnit
    ? `${props.selectedUnit.name} · ${props.selectedUnit.sideName}`
    : "현재 편성 현황";

  return (
    <Box
      sx={{
        width: { xs: "min(340px, calc(100vw - 32px))", lg: 320 },
        height: "calc(100vh - 92px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 3,
        backgroundColor: "#071116",
        border: "1px solid rgba(45, 214, 196, 0.18)",
        boxShadow: "0 20px 42px rgba(0, 0, 0, 0.32)",
        pointerEvents: "auto",
      }}
    >
      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: "auto", p: 1 }}>
        <Stack>
          <Box
            sx={{
              mx: 1,
              mb: 0.9,
              p: 1.15,
              borderRadius: 2.6,
              background:
                "radial-gradient(circle at top left, rgba(53, 217, 198, 0.12) 0%, transparent 42%), linear-gradient(180deg, rgba(9, 24, 30, 0.98) 0%, rgba(6, 16, 21, 0.96) 100%)",
              border: "1px solid rgba(45, 214, 196, 0.12)",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {`${props.scenarioName} 관전 패널`}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: 11.8,
                    lineHeight: 1.45,
                    color: "text.secondary",
                  }}
                >
                  {isEmptyScenario
                    ? "자산 배치 필요"
                    : `자산 ${scenarioAssetCount} · 임무 ${scenarioMissionCount} · 비행탄 ${scenarioWeaponsInFlight}`}
                </Typography>
                <Box
                  sx={{
                    mt: 0.95,
                    px: 0.95,
                    py: 0.8,
                    borderRadius: 2.2,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(45, 214, 196, 0.1)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11.2,
                      fontWeight: 700,
                      lineHeight: 1.45,
                      color: getRiskToneColor(commandPanelSummary.riskTone),
                    }}
                  >
                    {commandPanelSummary.summary}
                  </Typography>
                </Box>
              </Box>
              <Stack spacing={0.8} sx={{ flexShrink: 0 }}>
                <Chip
                  size="small"
                  variant={props.scenarioPaused ? "outlined" : "filled"}
                  label={scenarioStatusLabel}
                  sx={{ flexShrink: 0 }}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={commandPanelSummary.riskLabel}
                  sx={{
                    flexShrink: 0,
                    color: getRiskToneColor(commandPanelSummary.riskTone),
                    borderColor: getRiskToneBorderColor(
                      commandPanelSummary.riskTone
                    ),
                    backgroundColor: getRiskToneBackgroundColor(
                      commandPanelSummary.riskTone
                    ),
                  }}
                />
              </Stack>
            </Stack>
          </Box>
          <CardActions
            sx={{
              display: "flex",
              justifyContent: "center",
              px: 1,
              py: 0.2,
            }}
          >
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={1}
              sx={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                px: 0.75,
                py: 0.45,
                borderRadius: 2.2,
                backgroundColor: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(45, 214, 196, 0.08)",
              }}
            >
              <Tooltip title="새로 만들기">
                <IconButton onClick={props.onNewScenario}>
                  <InsertDriveFileIcon
                    fontSize="medium"
                    sx={{ color: "var(--fs-text)" }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="불러오기">
                <IconButton onClick={props.onLoadScenarioClick}>
                  <UploadFileOutlinedIcon
                    fontSize="medium"
                    sx={{ color: "var(--fs-text)" }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="관전 모드에서는 클라우드 저장을 지원하지 않습니다.">
                <span>
                  <IconButton disabled>
                    <Save
                      fontSize="medium"
                      sx={{ color: "rgba(221, 255, 250, 0.3)" }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="파일 저장">
                <IconButton onClick={props.onExportScenario}>
                  <FileDownloadOutlinedIcon
                    fontSize="medium"
                    sx={{ color: "var(--fs-text)" }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="이름 바꾸기">
                <IconButton onClick={props.onRenameScenario}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </CardActions>
          <CardActions
            sx={{
              display: "flex",
              justifyContent: "center",
              px: 1,
              py: 0.35,
            }}
          >
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={1}
              sx={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                px: 0.75,
                py: 0.3,
                borderRadius: 2.2,
                backgroundColor: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(45, 214, 196, 0.08)",
              }}
            >
              <Tooltip title="1단계 진행">
                <Chip
                  variant="outlined"
                  label="1단계"
                  onClick={props.onStepScenario}
                />
              </Tooltip>
              <Tooltip title="다시 시작">
                <IconButton onClick={props.onRestartScenario}>
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="실행 취소는 메인 맵에서만 지원합니다.">
                <span>
                  <IconButton disabled>
                    <Undo />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title={
                  props.scenarioPaused
                    ? "시뮬레이션 실행"
                    : "시뮬레이션 일시정지"
                }
              >
                <IconButton onClick={props.onTogglePlay}>
                  {props.scenarioPaused ? <PlayArrow /> : <Pause />}
                </IconButton>
              </Tooltip>
              <Tooltip title="속도 바꾸기">
                <Chip
                  onClick={props.onToggleTimeCompression}
                  variant="outlined"
                  label={`속도 ${props.scenarioTimeCompression}x`}
                  sx={{ minWidth: "82px" }}
                />
              </Tooltip>
            </Stack>
          </CardActions>
        </Stack>
        <List
          sx={{
            py: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
          component="nav"
          aria-labelledby="battle-spectator-scenario-sidebar"
          subheader={
            <ListSubheader
              color="inherit"
              component="div"
              id="battle-spectator-scenario-sidebar"
              sx={{
                ...visuallyHidden,
                backgroundColor: "transparent",
              }}
            >
              기능
            </ListSubheader>
          }
        >
          <ToolbarCollapsible
            title="기록 / 재생"
            subtitle={`${props.scenarioPaused ? "정지" : "진행"} · 속도 ${
              props.scenarioTimeCompression
            }x`}
            headerBadges={sectionHeaderBadges.recording}
            prependIcon={RadioButtonCheckedIcon}
            open={false}
            content={
              <Stack spacing={1} sx={{ p: 0.35 }}>
                <Box
                  sx={{
                    p: 1.05,
                    borderRadius: 1.8,
                    backgroundColor: "rgba(7, 19, 24, 0.92)",
                    border: "1px solid rgba(98, 230, 208, 0.12)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      color: "rgba(98, 230, 208, 0.82)",
                    }}
                  >
                    현재 시나리오
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: "#ecfffb",
                    }}
                  >
                    {props.scenarioName}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12,
                      color: "rgba(236, 255, 251, 0.68)",
                    }}
                  >
                    실행 상태 {props.scenarioPaused ? "정지" : "진행"} · 속도{" "}
                    {props.scenarioTimeCompression}x
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 0.95,
                    borderRadius: 1.8,
                    backgroundColor: "rgba(5, 16, 18, 0.72)",
                    border: "1px solid rgba(98, 230, 208, 0.08)",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography
                      sx={{
                        fontSize: 10.8,
                        letterSpacing: "0.1em",
                        color: "rgba(98, 230, 208, 0.82)",
                      }}
                    >
                      프리셋 시나리오
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={props.onTogglePresetListExpanded}
                      sx={{ minWidth: 0, px: 0, color: "#62e6d0" }}
                    >
                      {props.presetListExpanded ? "간단히 보기" : "전체 보기"}
                    </Button>
                  </Stack>
                  <Stack spacing={0.55} sx={{ mt: 0.8 }}>
                    {props.visibleScenarioPresets.map((preset) => (
                      <MenuItem
                        key={`spectator-sidebar-preset-${preset.name}`}
                        onClick={() => props.onLoadPresetScenario(preset)}
                        sx={{
                          borderRadius: 1.4,
                          px: 1,
                          py: 0.75,
                          border: "1px solid rgba(98, 230, 208, 0.08)",
                          backgroundColor: "rgba(8, 24, 29, 0.62)",
                          "&:hover": {
                            backgroundColor: "rgba(98, 230, 208, 0.08)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={preset.displayName}
                          primaryTypographyProps={{
                            fontSize: 12.6,
                            fontWeight: 700,
                            color: "#ecfffb",
                          }}
                        />
                      </MenuItem>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            }
          />
          <ToolbarCollapsible
            title="자산 배치"
            subtitle={selectedUnitSubtitle}
            headerBadges={sectionHeaderBadges.assets}
            prependIcon={DocumentScannerOutlinedIcon}
            open={isEmptyScenario}
            content={
              <Stack spacing={1} sx={{ p: 0.35 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.75,
                  }}
                >
                  {[
                    ["항공기", currentSideAssetCounts.aircraft],
                    ["기지", currentSideAssetCounts.airbases],
                    ["지상군", currentSideAssetCounts.armies],
                    ["무기체계", currentSideAssetCounts.facilities],
                    ["함정", currentSideAssetCounts.ships],
                    ["총 자산", currentSideOperationalFeatureCount],
                  ].map(([label, value]) => (
                    <Box
                      key={`asset-summary-${label}`}
                      sx={{
                        p: 0.82,
                        borderRadius: 1.4,
                        backgroundColor: "rgba(9, 24, 29, 0.78)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10.2,
                          letterSpacing: "0.08em",
                          color: "rgba(98, 230, 208, 0.76)",
                        }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.2,
                          fontSize: 12.4,
                          fontWeight: 700,
                          color: "#ecfffb",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {props.selectedUnit ? (
                  <Box
                    sx={{
                      p: 1.05,
                      borderRadius: 1.8,
                      backgroundColor: "rgba(7, 19, 24, 0.92)",
                      border: "1px solid rgba(98, 230, 208, 0.12)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10.8,
                        letterSpacing: "0.1em",
                        color: "rgba(98, 230, 208, 0.82)",
                      }}
                    >
                      현재 선택 자산
                    </Typography>
                    <Typography sx={{ mt: 0.2, fontSize: 14, fontWeight: 800 }}>
                      {props.selectedUnit.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: 12,
                        color: "rgba(236, 255, 251, 0.72)",
                      }}
                    >
                      {props.selectedUnit.sideName} ·{" "}
                      {getDisplayName(props.selectedUnit.className)}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.6,
                        fontSize: 12,
                        color: "rgba(236, 255, 251, 0.72)",
                      }}
                    >
                      체력 {Math.round(props.selectedUnit.hpFraction * 100)}% ·
                      속도 {Math.round(props.selectedUnit.speedKts)} kt · 잔여 무장{" "}
                      {props.selectedUnit.weaponCount}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.45,
                        fontSize: 12,
                        color: "rgba(236, 255, 251, 0.68)",
                      }}
                    >
                      표적 {props.selectedUnitTargetName ?? "미지정"}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ mt: 0.8, flexWrap: "wrap" }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={props.onFocusSelectedUnit}
                        disabled={!props.onFocusSelectedUnit}
                        sx={{
                          borderColor: "rgba(98, 230, 208, 0.24)",
                          color: "#ecfffb",
                        }}
                      >
                        선택 대상 보기
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={props.onTrackSelectedUnit}
                        disabled={!props.onTrackSelectedUnit}
                        sx={{
                          borderColor: "rgba(98, 230, 208, 0.24)",
                          color: "#ecfffb",
                        }}
                      >
                        선택 대상 추적
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 1.05,
                      borderRadius: 1.8,
                      backgroundColor: "rgba(7, 19, 24, 0.92)",
                      border: "1px solid rgba(98, 230, 208, 0.12)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12.2,
                        color: "rgba(236, 255, 251, 0.72)",
                        lineHeight: 1.6,
                      }}
                    >
                      3D 장면에서 자산을 선택하면 여기서 체력, 속도, 표적과
                      추적 조작을 바로 확인할 수 있습니다.
                    </Typography>
                  </Box>
                )}
              </Stack>
            }
          />
          <ToolbarCollapsible
            title="화력 작전"
            subtitle={focusFireDockStage.title}
            headerBadges={sectionHeaderBadges.focusFire}
            prependIcon={RadioButtonCheckedIcon}
            open={focusFireSectionOpen}
            content={
              <Stack spacing={1} sx={{ p: 0.35 }}>
                <Box
                  sx={{
                    p: 1.05,
                    borderRadius: 1.8,
                    backgroundColor: "rgba(7, 19, 24, 0.92)",
                    border: "1px solid rgba(98, 230, 208, 0.12)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.8,
                      letterSpacing: "0.1em",
                      color: "rgba(98, 230, 208, 0.82)",
                    }}
                  >
                    화력 추천 정보
                  </Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 14, fontWeight: 800 }}>
                    {focusFireSummary.objectiveName ?? "목표 지점 지정 대기"}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {focusFireInsight.summary}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12,
                      color: "rgba(236, 255, 251, 0.68)",
                    }}
                  >
                    항공 {focusFireSummary.aircraftCount} · 포대{" "}
                    {focusFireSummary.artilleryCount} · 기갑{" "}
                    {focusFireSummary.armorCount} · 비행탄{" "}
                    {focusFireSummary.weaponsInFlight}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12,
                      color: "rgba(236, 255, 251, 0.68)",
                    }}
                  >
                    상태 {focusFireSummary.statusLabel} · 충격량{" "}
                    {focusFireInsight.shockIndex}
                  </Typography>
                  {props.onFocusObjective && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={props.onFocusObjective}
                      sx={{
                        mt: 0.85,
                        borderColor: "rgba(98, 230, 208, 0.24)",
                        color: "#ecfffb",
                      }}
                    >
                      목표 지점 보기
                    </Button>
                  )}
                </Box>
              </Stack>
            }
          />
          <ToolbarCollapsible
            title="임무"
            subtitle={
              currentSideMissions[0]
                ? `${currentSideMissions[0].name} 외 ${
                    Math.max(0, currentSideMissions.length - 1)
                  }`
                : "등록된 임무 없음"
            }
            headerBadges={sectionHeaderBadges.mission}
            prependIcon={AirlineStopsOutlinedIcon}
            appendIcon={AddBoxIcon}
            appendIconProps={{
              tooltipProps: {
                title: "3D 관전 모드에서는 임무 생성이 비활성화됩니다.",
              },
              onClick: () => undefined,
            }}
            open={missionSectionOpen}
            content={
              <Stack spacing={0.8} sx={{ p: 0.35 }}>
                {currentSideMissions.length > 0 ? (
                  currentSideMissions.slice(0, 6).map((mission, index) => (
                    <Box
                      key={`sidebar-mission-${mission.name}-${index}`}
                      sx={{
                        p: 0.95,
                        borderRadius: 1.8,
                        backgroundColor: "rgba(8, 24, 29, 0.7)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Typography sx={{ fontSize: 12.4, fontWeight: 700 }}>
                        {mission.name}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 11.2,
                          color: "rgba(236, 255, 251, 0.68)",
                        }}
                      >
                        유형 {getMissionTypeLabel(mission)} · 세력 {currentSideName}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 1.05,
                      borderRadius: 1.8,
                      backgroundColor: "rgba(7, 19, 24, 0.92)",
                      border: "1px solid rgba(98, 230, 208, 0.12)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12.2,
                        color: "rgba(236, 255, 251, 0.72)",
                        lineHeight: 1.6,
                      }}
                    >
                      현재 세력에 등록된 임무가 없습니다. 메인 맵에서 임무를
                      구성한 뒤 3D 관전으로 돌아오면 여기에서 바로 확인할 수
                      있습니다.
                    </Typography>
                  </Box>
                )}
              </Stack>
            }
          />
        </List>
      </Box>
      <ArmyGptPanel
        currentSideName={currentSideName}
        scenarioAssetCount={scenarioAssetCount}
        scenarioMissionCount={scenarioMissionCount}
        scenarioWeaponsInFlight={scenarioWeaponsInFlight}
        briefingCards={armyGptBriefingCards}
        messages={messages}
        inputValue={inputValue}
        isInputFocused={isChatInputFocused}
        isLoading={isLoading}
        chatMessagesContainerRef={chatMessagesContainerRef}
        onInputChange={setInputValue}
        onFocusChange={setIsChatInputFocused}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
}
