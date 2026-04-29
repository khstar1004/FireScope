import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import Game, {
  type BattleSpectatorSnapshot,
  type FocusFireSummary,
} from "@/game/Game";
import { GAME_SPEED_DELAY_MS } from "@/utils/constants";
import { type Terrain3dBounds } from "@/gui/map/terrain3dRoute";
import { resolvePublicAssetPath } from "@/utils/publicAssetUrl";
import {
  getOfflineMapManifestPath,
  getOfflineMapRegion,
  getOfflineSatelliteTileUrl,
} from "@/gui/map/offlineMapConfig";

const TERRAIN_3D_ENTRY = resolvePublicAssetPath("/terrain-3d/index.html");
const TERRAIN_3D_VIEWER_VERSION = "terrain-glb-direction-20260427";
const TERRAIN_SPEED_STEPS = Object.keys(GAME_SPEED_DELAY_MS)
  .map((speed) => Number(speed))
  .filter((speed) => Number.isFinite(speed))
  .sort((left, right) => left - right);
const TERRAIN_COMMAND_PANEL_HUD_INSET = 344;
const TERRAIN_COMMAND_RAIL_HUD_INSET = 88;
const terrainPanelIconButtonSx = {
  width: 36,
  height: 36,
  border: "1px solid rgba(127, 231, 255, 0.2)",
  color: "#ecfffb",
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  "&:hover": {
    backgroundColor: "rgba(127, 231, 255, 0.12)",
    borderColor: "rgba(127, 231, 255, 0.38)",
  },
};

interface Terrain3dPageProps {
  bounds: Terrain3dBounds;
  game: Game;
  continueSimulation?: boolean;
  offlineDemoMode?: boolean;
  onBack: () => void;
}

interface Terrain3dVisualOptions {
  showWeaponTrails: boolean;
  showEventEffects: boolean;
  autoTrackImpacts: boolean;
  impactCameraShake: boolean;
  showTerrainBriefing: boolean;
}

function buildTerrain3dRuntimeSignature(snapshot: {
  scenarioId?: string;
  currentTime?: number;
  selectedUnitId?: string;
  units?: unknown[];
  weapons?: unknown[];
  recentEvents?: Array<{ id?: string }>;
  focusFireSummary?: FocusFireSummary;
  stats?: {
    aircraft?: number;
    facilities?: number;
    airbases?: number;
    ships?: number;
    groundUnits?: number;
    weaponsInFlight?: number;
    sides?: number;
  };
}) {
  return JSON.stringify({
    scenarioId: snapshot?.scenarioId ?? "unknown-scenario",
    currentTime: Number(snapshot?.currentTime) || 0,
    selectedUnitId: snapshot?.selectedUnitId ?? "",
    unitCount: Array.isArray(snapshot?.units) ? snapshot.units.length : 0,
    weaponCount: Array.isArray(snapshot?.weapons) ? snapshot.weapons.length : 0,
    recentEventIds: Array.isArray(snapshot?.recentEvents)
      ? snapshot.recentEvents.map((event) => event?.id ?? "").join("|")
      : "",
    focusFire: snapshot?.focusFireSummary
      ? {
          enabled: snapshot.focusFireSummary.enabled,
          active: snapshot.focusFireSummary.active,
          objectiveLatitude: snapshot.focusFireSummary.objectiveLatitude,
          objectiveLongitude: snapshot.focusFireSummary.objectiveLongitude,
          captureProgress: Math.round(
            Number(snapshot.focusFireSummary.captureProgress) || 0
          ),
          weaponsInFlight: snapshot.focusFireSummary.weaponsInFlight,
          expectedStrikeEffect:
            snapshot.focusFireSummary.recommendation?.expectedStrikeEffect ??
            null,
        }
      : null,
    stats: {
      aircraft: Math.max(0, Number(snapshot?.stats?.aircraft) || 0),
      facilities: Math.max(0, Number(snapshot?.stats?.facilities) || 0),
      airbases: Math.max(0, Number(snapshot?.stats?.airbases) || 0),
      ships: Math.max(0, Number(snapshot?.stats?.ships) || 0),
      groundUnits: Math.max(0, Number(snapshot?.stats?.groundUnits) || 0),
      weaponsInFlight: Math.max(
        0,
        Number(snapshot?.stats?.weaponsInFlight) || 0
      ),
      sides: Math.max(0, Number(snapshot?.stats?.sides) || 0),
    },
  });
}

export default function Terrain3dPage({
  bounds,
  game,
  continueSimulation = false,
  offlineDemoMode = false,
  onBack,
}: Readonly<Terrain3dPageProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const offlineMapRegion = offlineDemoMode
    ? getOfflineMapRegion({
        forceOffline: true,
      })
    : null;
  const lastPostedSnapshotSignatureRef = useRef("");
  const [runtimeSnapshot, setRuntimeSnapshot] =
    useState<BattleSpectatorSnapshot>(() => game.getBattleSpectatorSnapshot());
  const [scenarioPaused, setScenarioPaused] = useState(game.scenarioPaused);
  const [scenarioTimeCompression, setScenarioTimeCompression] = useState(
    game.currentScenario.timeCompression
  );
  const [simulationRunRevision, setSimulationRunRevision] = useState(
    continueSimulation && !game.scenarioPaused ? 1 : 0
  );
  const [gameEnded, setGameEnded] = useState(false);
  const [visualOptions, setVisualOptions] = useState<Terrain3dVisualOptions>({
    showWeaponTrails: false,
    showEventEffects: false,
    autoTrackImpacts: false,
    impactCameraShake: false,
    showTerrainBriefing: true,
  });
  const [commandPanelCollapsed, setCommandPanelCollapsed] = useState(false);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();

    params.set("west", bounds.west.toFixed(6));
    params.set("south", bounds.south.toFixed(6));
    params.set("east", bounds.east.toFixed(6));
    params.set("north", bounds.north.toFixed(6));
    params.set("viewerVersion", TERRAIN_3D_VIEWER_VERSION);
    params.set("terrainPlan", "cesium");
    if (continueSimulation) {
      params.set("continueSimulation", "1");
    }
    if (offlineMapRegion) {
      params.set("offlineMapRegion", offlineMapRegion.id);
      params.set(
        "offlineMapManifest",
        getOfflineMapManifestPath(offlineMapRegion)
      );
      params.set(
        "offlineSatelliteTileUrl",
        getOfflineSatelliteTileUrl(offlineMapRegion, {
          localOnly: offlineDemoMode,
        })
      );
    }

    return `${TERRAIN_3D_ENTRY}?${params.toString()}`;
  }, [
    bounds.east,
    bounds.north,
    bounds.south,
    bounds.west,
    continueSimulation,
    offlineMapRegion,
    offlineDemoMode,
  ]);
  const postRuntimeCommand = useCallback((payload: Record<string, unknown>) => {
    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow) {
      return;
    }

    iframeWindow.postMessage(
      {
        type: "terrain3d:command",
        payload,
      },
      window.location.origin
    );
  }, []);

  const syncRuntimeSnapshot = useCallback(
    (force = false) => {
      const snapshot = game.getBattleSpectatorSnapshot();
      const focusFireSummary = game.getFocusFireSummary();
      const runtimePayload = {
        ...snapshot,
        focusFireSummary,
      };
      const signature = buildTerrain3dRuntimeSignature(runtimePayload);

      setRuntimeSnapshot(snapshot);
      setScenarioPaused(Boolean(game.scenarioPaused));
      setScenarioTimeCompression(
        Math.max(1, Number(game.currentScenario.timeCompression) || 1)
      );

      if (typeof game.getGameEndState === "function") {
        const endState = game.getGameEndState();
        setGameEnded(Boolean(endState.terminated || endState.truncated));
      }

      const iframeWindow = iframeRef.current?.contentWindow;
      if (
        iframeWindow &&
        (force || lastPostedSnapshotSignatureRef.current !== signature)
      ) {
        lastPostedSnapshotSignatureRef.current = signature;
        iframeWindow.postMessage(
          {
            type: "terrain3d:runtime-snapshot",
            payload: runtimePayload,
          },
          window.location.origin
        );
      }

      return snapshot;
    },
    [game]
  );

  const syncVisualOptions = useCallback(() => {
    postRuntimeCommand({
      command: "set-visual-options",
      options: visualOptions,
    });
  }, [postRuntimeCommand, visualOptions]);
  const syncHudInsets = useCallback(() => {
    postRuntimeCommand({
      command: "set-hud-insets",
      left: commandPanelCollapsed
        ? TERRAIN_COMMAND_RAIL_HUD_INSET
        : TERRAIN_COMMAND_PANEL_HUD_INSET,
      right: 0,
    });
  }, [commandPanelCollapsed, postRuntimeCommand]);

  const visibleAssetRows = useMemo(
    () =>
      runtimeSnapshot.units
        .filter((unit) => {
          const longitude = Number(unit.longitude);
          const latitude = Number(unit.latitude);
          return (
            Number.isFinite(longitude) &&
            Number.isFinite(latitude) &&
            longitude >= bounds.west &&
            longitude <= bounds.east &&
            latitude >= bounds.south &&
            latitude <= bounds.north
          );
        })
        .sort((left, right) => {
          if (left.selected !== right.selected) {
            return left.selected ? -1 : 1;
          }
          return left.name.localeCompare(right.name, "ko-KR");
        }),
    [
      bounds.east,
      bounds.north,
      bounds.south,
      bounds.west,
      runtimeSnapshot.units,
    ]
  );

  const handleFocusAsset = useCallback(
    (unitId: string) => {
      postRuntimeCommand({
        command: "focus-unit",
        unitId,
      });
    },
    [postRuntimeCommand]
  );

  const handlePauseSimulation = useCallback(() => {
    game.scenarioPaused = true;
    setScenarioPaused(true);
    syncRuntimeSnapshot(true);
  }, [game, syncRuntimeSnapshot]);

  const handlePlaySimulation = useCallback(() => {
    if (
      typeof game.getGameEndState !== "function" ||
      typeof game.recordStep !== "function"
    ) {
      return;
    }

    const endState = game.getGameEndState();
    if (endState.terminated || endState.truncated) {
      setGameEnded(true);
      syncRuntimeSnapshot(true);
      return;
    }

    game.recordStep(true);
    game.scenarioPaused = false;
    setGameEnded(false);
    setScenarioPaused(false);
    setSimulationRunRevision((revision) => revision + 1);
    syncRuntimeSnapshot(true);
  }, [game, syncRuntimeSnapshot]);

  const handleStepSimulation = useCallback(() => {
    if (
      typeof game.stepForTimeCompression !== "function" ||
      typeof game.recordStep !== "function"
    ) {
      return;
    }

    const stepSize = Math.max(
      1,
      Number(game.currentScenario.timeCompression) || 1
    );
    const [, , terminated, truncated] = game.stepForTimeCompression(stepSize);
    game.recordStep();
    if (terminated || truncated) {
      game.scenarioPaused = true;
      setScenarioPaused(true);
      setGameEnded(true);
    }
    syncRuntimeSnapshot(true);
  }, [game, syncRuntimeSnapshot]);

  const handleSetTimeCompression = useCallback(
    (nextTimeCompression: number) => {
      game.currentScenario.timeCompression = nextTimeCompression;
      setScenarioTimeCompression(nextTimeCompression);
      syncRuntimeSnapshot(true);
    },
    [game, syncRuntimeSnapshot]
  );

  const handleRefresh = useCallback(() => {
    syncRuntimeSnapshot(true);
  }, [syncRuntimeSnapshot]);

  useEffect(() => {
    if (game.currentScenario.timeCompression !== 1) {
      game.currentScenario.timeCompression = 1;
      setScenarioTimeCompression(1);
    }
    syncRuntimeSnapshot(true);
  }, [game, syncRuntimeSnapshot]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow
      ) {
        return;
      }

      if (event.data?.type === "terrain3d:ready") {
        syncRuntimeSnapshot(true);
        syncVisualOptions();
        syncHudInsets();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [syncHudInsets, syncRuntimeSnapshot, syncVisualOptions]);

  useEffect(() => {
    syncVisualOptions();
  }, [syncVisualOptions]);

  useEffect(() => {
    syncHudInsets();
  }, [syncHudInsets]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.hidden) {
        return;
      }
      syncRuntimeSnapshot();
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [syncRuntimeSnapshot]);

  useEffect(() => {
    if (
      (!continueSimulation && simulationRunRevision === 0) ||
      game.scenarioPaused ||
      typeof game.getGameEndState !== "function" ||
      typeof game.stepForTimeCompression !== "function" ||
      typeof game.recordStep !== "function"
    ) {
      return;
    }

    let cancelled = false;

    const runSimulation = async () => {
      let { terminated: gameTerminated, truncated: gameTruncated } =
        game.getGameEndState();
      let isGameEnded = gameTerminated || gameTruncated;

      while (!cancelled && !game.scenarioPaused && !isGameEnded) {
        const stepSize = Math.max(
          1,
          Number(game.currentScenario.timeCompression) || 1
        );
        const [, , terminated, truncated] =
          game.stepForTimeCompression(stepSize);
        game.recordStep();
        gameTerminated = terminated;
        gameTruncated = truncated;
        isGameEnded = gameTerminated || gameTruncated;
        syncRuntimeSnapshot();
        if (isGameEnded) {
          game.scenarioPaused = true;
          setScenarioPaused(true);
          setGameEnded(true);
          break;
        }
        await new Promise((resolve) =>
          window.setTimeout(
            resolve,
            GAME_SPEED_DELAY_MS[game.currentScenario.timeCompression] ??
              GAME_SPEED_DELAY_MS[1]
          )
        );
      }
    };

    void runSimulation();

    return () => {
      cancelled = true;
    };
  }, [continueSimulation, game, simulationRunRevision, syncRuntimeSnapshot]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#02060c",
      }}
    >
      <Stack
        spacing={1.25}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          bottom: commandPanelCollapsed ? "auto" : 16,
          zIndex: 3,
          width: commandPanelCollapsed ? 56 : "min(92vw, 304px)",
          p: commandPanelCollapsed ? 0.75 : 1.5,
          borderRadius: 3,
          background:
            "linear-gradient(180deg, rgba(4, 16, 22, 0.92) 0%, rgba(3, 12, 18, 0.9) 100%)",
          border: "1px solid rgba(127, 231, 255, 0.18)",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.36)",
          color: "#ecfffb",
          backdropFilter: "blur(18px)",
          overflowY: commandPanelCollapsed ? "visible" : "auto",
          transition:
            "width 180ms ease, padding 180ms ease, background-color 180ms ease",
        }}
      >
        {commandPanelCollapsed ? (
          <Stack spacing={0.75} alignItems="center">
            <Tooltip title="패널 펼치기" placement="right">
              <IconButton
                aria-label="패널 펼치기"
                onClick={() => {
                  setCommandPanelCollapsed(false);
                }}
                sx={terrainPanelIconButtonSx}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="지도 복귀" placement="right">
              <IconButton
                aria-label="지도 복귀"
                onClick={onBack}
                sx={terrainPanelIconButtonSx}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="갱신" placement="right">
              <IconButton
                aria-label="갱신"
                onClick={handleRefresh}
                sx={terrainPanelIconButtonSx}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{
                  borderColor: "rgba(127, 231, 255, 0.26)",
                  color: "#ecfffb",
                }}
              >
                지도 복귀
              </Button>
              <Stack direction="row" spacing={0.75}>
                <Tooltip title="갱신">
                  <IconButton
                    aria-label="갱신"
                    onClick={handleRefresh}
                    sx={terrainPanelIconButtonSx}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="패널 접기">
                  <IconButton
                    aria-label="패널 접기"
                    onClick={() => {
                      setCommandPanelCollapsed(true);
                    }}
                    sx={terrainPanelIconButtonSx}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 2.5,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(127, 231, 255, 0.1)",
              }}
            >
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant={scenarioPaused ? "contained" : "outlined"}
                  startIcon={scenarioPaused ? <PlayArrowIcon /> : <PauseIcon />}
                  onClick={
                    scenarioPaused
                      ? handlePlaySimulation
                      : handlePauseSimulation
                  }
                  sx={{
                    borderColor: "rgba(127, 231, 255, 0.24)",
                    color: scenarioPaused ? "#021217" : "#ecfffb",
                    backgroundColor: scenarioPaused ? "#7fe7ff" : "transparent",
                    "&:hover": {
                      backgroundColor: scenarioPaused
                        ? "rgba(127, 231, 255, 0.86)"
                        : "rgba(127, 231, 255, 0.08)",
                    },
                  }}
                >
                  {scenarioPaused ? "재생" : "일시정지"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SkipNextIcon />}
                  onClick={handleStepSimulation}
                  sx={{
                    minWidth: 116,
                    borderColor: "rgba(127, 231, 255, 0.18)",
                    color: "rgba(236, 255, 251, 0.86)",
                  }}
                >
                  1단계
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 1.25 }}
              >
                {TERRAIN_SPEED_STEPS.map((speed) => (
                  <Chip
                    key={speed}
                    clickable
                    label={`${speed}x`}
                    onClick={() => {
                      handleSetTimeCompression(speed);
                    }}
                    sx={{
                      color:
                        scenarioTimeCompression === speed
                          ? "#021217"
                          : "#ecfffb",
                      backgroundColor:
                        scenarioTimeCompression === speed
                          ? "#7fe7ff"
                          : "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(127, 231, 255, 0.18)",
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                p: 1.25,
                borderRadius: 2.5,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(127, 231, 255, 0.1)",
              }}
            >
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip
                  clickable
                  label={`궤적 ${visualOptions.showWeaponTrails ? "ON" : "OFF"}`}
                  onClick={() => {
                    setVisualOptions((current) => ({
                      ...current,
                      showWeaponTrails: !current.showWeaponTrails,
                    }));
                  }}
                  sx={{
                    color: visualOptions.showWeaponTrails
                      ? "#021217"
                      : "#ecfffb",
                    backgroundColor: visualOptions.showWeaponTrails
                      ? "#7fe7ff"
                      : "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(127, 231, 255, 0.18)",
                  }}
                />
                <Chip
                  clickable
                  label={`폭발효과 ${visualOptions.showEventEffects ? "ON" : "OFF"}`}
                  onClick={() => {
                    setVisualOptions((current) => ({
                      ...current,
                      showEventEffects: !current.showEventEffects,
                    }));
                  }}
                  sx={{
                    color: visualOptions.showEventEffects
                      ? "#021217"
                      : "#ecfffb",
                    backgroundColor: visualOptions.showEventEffects
                      ? "#7fe7ff"
                      : "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(127, 231, 255, 0.18)",
                  }}
                />
                <Chip
                  clickable
                  label={`명중추적 ${visualOptions.autoTrackImpacts ? "ON" : "OFF"}`}
                  onClick={() => {
                    setVisualOptions((current) => ({
                      ...current,
                      autoTrackImpacts: !current.autoTrackImpacts,
                    }));
                  }}
                  sx={{
                    color: visualOptions.autoTrackImpacts
                      ? "#021217"
                      : "#ecfffb",
                    backgroundColor: visualOptions.autoTrackImpacts
                      ? "#7fe7ff"
                      : "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(127, 231, 255, 0.18)",
                  }}
                />
                <Chip
                  clickable
                  label={`카메라셰이크 ${visualOptions.impactCameraShake ? "ON" : "OFF"}`}
                  onClick={() => {
                    setVisualOptions((current) => ({
                      ...current,
                      impactCameraShake: !current.impactCameraShake,
                    }));
                  }}
                  sx={{
                    color: visualOptions.impactCameraShake
                      ? "#021217"
                      : "#ecfffb",
                    backgroundColor: visualOptions.impactCameraShake
                      ? "#7fe7ff"
                      : "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(127, 231, 255, 0.18)",
                  }}
                />
                <Chip
                  clickable
                  label={`AI 브리핑 ${visualOptions.showTerrainBriefing ? "ON" : "OFF"}`}
                  onClick={() => {
                    setVisualOptions((current) => ({
                      ...current,
                      showTerrainBriefing: !current.showTerrainBriefing,
                    }));
                  }}
                  sx={{
                    color: visualOptions.showTerrainBriefing
                      ? "#021217"
                      : "#ecfffb",
                    backgroundColor: visualOptions.showTerrainBriefing
                      ? "#7fe7ff"
                      : "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(127, 231, 255, 0.18)",
                  }}
                />
              </Stack>
            </Box>

            {visibleAssetRows.length > 0 && (
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(127, 231, 255, 0.1)",
                  maxHeight: "min(42vh, 360px)",
                  overflowY: "auto",
                }}
              >
                <Stack spacing={0.75}>
                  {visibleAssetRows.map((unit) => (
                    <Button
                      key={unit.id}
                      fullWidth
                      variant={unit.selected ? "contained" : "outlined"}
                      onClick={() => handleFocusAsset(unit.id)}
                      sx={{
                        justifyContent: "flex-start",
                        minHeight: 36,
                        px: 1.1,
                        borderColor: "rgba(127, 231, 255, 0.18)",
                        color: unit.selected ? "#021217" : "#ecfffb",
                        backgroundColor: unit.selected
                          ? "#7fe7ff"
                          : "rgba(255, 255, 255, 0.02)",
                        textTransform: "none",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        "&:hover": {
                          backgroundColor: unit.selected
                            ? "rgba(127, 231, 255, 0.86)"
                            : "rgba(127, 231, 255, 0.08)",
                        },
                      }}
                    >
                      {unit.name}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Stack>

      <Box
        component="iframe"
        ref={iframeRef}
        title="선택 지형 3D"
        src={iframeSrc}
        allowFullScreen
        onLoad={() => {
          syncRuntimeSnapshot(true);
          syncVisualOptions();
          syncHudInsets();
        }}
        sx={{
          width: "100%",
          height: "100%",
          border: 0,
          display: "block",
        }}
      />
    </Box>
  );
}
