import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Game, {
  type FocusFireLaunchPlatform,
  type FocusFireWeaponTrack,
} from "@/game/Game";
import {
  buildFocusFireInsight,
  buildSimulationOutcomeSummary,
  requestSimulationOutcomeNarrative,
  type SimulationOutcomeNarrativeSource,
  type SimulationOutcomeSummary,
} from "@/gui/analysis/operationInsight";
import SimulationOutcomeDialog from "@/gui/shared/SimulationOutcomeDialog";
import {
  DEFAULT_JET_CRAFT_ID,
  getJetCraftCatalogEntry,
  isJetCraftId,
  JET_CRAFT_CATALOG,
  type JetCraftId,
} from "@/gui/flightSim/jetCraftCatalog";
import {
  hasFiniteFlightSimLocation,
  isInsideFlightSimKorea,
  normalizeFlightSimStartLocation,
} from "@/gui/flightSim/flightSimLocation";

const FLIGHT_SIM_ENTRY = "/flight-sim/index.html";
const FLIGHT_SIM_REVISION = "20260406-flight-sim-korea-start-fix";

type AssetState = "checking" | "ready" | "missing";
type CraftMode = "jet" | "drone";
type FlightSimRuntimeInfo = {
  mapProvider?: "initializing" | "vworld-webgl" | "cesium-fallback";
  vworld?: {
    configuredDomain?: string | null;
    pageHost?: string | null;
    pageHostname?: string | null;
    runtimeDomains?: string[];
    scriptCandidates?: string[];
    loadedScriptUrl?: string | null;
    scriptLoaded?: boolean;
    scriptGlobalsReady?: boolean;
    viewerReady?: boolean;
    viewerDetected?: boolean;
    callbackFired?: boolean;
    mapStartRequested?: boolean;
    eligible?: boolean;
    requestedStartInKorea?: boolean;
    initializationStage?: string | null;
    initialPosition?: {
      lon: number;
      lat: number;
      alt: number;
    } | null;
    layerName?: string | null;
    layerActivated?: boolean;
    layerCandidates?: string[];
    moduleDetected?: boolean;
    lastError?: string | null;
  };
};

type FocusFireAirwatchState = {
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
  launchPlatforms?: FocusFireLaunchPlatform[];
  weaponTracks?: FocusFireWeaponTrack[];
  continueSimulation?: boolean;
};

function resolveInitialJetCraftId(initialCraft?: string): JetCraftId {
  return isJetCraftId(initialCraft) ? initialCraft : DEFAULT_JET_CRAFT_ID;
}

function hasFocusFireObjective(
  focusFireAirwatch?: FocusFireAirwatchState
): focusFireAirwatch is FocusFireAirwatchState & {
  objectiveLon: number;
  objectiveLat: number;
} {
  return (
    typeof focusFireAirwatch?.objectiveLon === "number" &&
    Number.isFinite(focusFireAirwatch.objectiveLon) &&
    typeof focusFireAirwatch?.objectiveLat === "number" &&
    Number.isFinite(focusFireAirwatch.objectiveLat)
  );
}

function buildFocusFireAirwatchState(
  game?: Game,
  continueSimulation = false,
  fallback?: FocusFireAirwatchState
): FocusFireAirwatchState | undefined {
  const summary = game?.getFocusFireSummary();
  if (
    summary?.objectiveLatitude === null ||
    summary?.objectiveLongitude === null ||
    summary?.objectiveLatitude === undefined ||
    summary?.objectiveLongitude === undefined
  ) {
    return fallback
      ? {
          ...fallback,
          continueSimulation: fallback.continueSimulation ?? continueSimulation,
        }
      : undefined;
  }

  return {
    objectiveName: summary.objectiveName ?? fallback?.objectiveName,
    objectiveLon: summary.objectiveLongitude,
    objectiveLat: summary.objectiveLatitude,
    active: summary.active,
    captureProgress: summary.captureProgress,
    aircraftCount: summary.aircraftCount,
    artilleryCount: summary.artilleryCount,
    armorCount: summary.armorCount,
    weaponsInFlight: summary.weaponsInFlight,
    statusLabel: summary.statusLabel,
    launchPlatforms: summary.launchPlatforms,
    weaponTracks: summary.weaponTracks,
    continueSimulation: fallback?.continueSimulation ?? continueSimulation,
  };
}

function appendFocusFireQueryParams(
  params: URLSearchParams,
  focusFireAirwatch?: FocusFireAirwatchState
) {
  if (!hasFocusFireObjective(focusFireAirwatch)) {
    return;
  }

  params.set("focusFire", "1");
  params.set("objectiveLon", focusFireAirwatch.objectiveLon.toFixed(6));
  params.set("objectiveLat", focusFireAirwatch.objectiveLat.toFixed(6));

  if (focusFireAirwatch.objectiveName) {
    params.set("objectiveName", focusFireAirwatch.objectiveName);
  }
  if (focusFireAirwatch.captureProgress !== undefined) {
    params.set("capture", focusFireAirwatch.captureProgress.toFixed(0));
  }
  if (focusFireAirwatch.active !== undefined) {
    params.set("active", focusFireAirwatch.active ? "1" : "0");
  }
  if (focusFireAirwatch.aircraftCount !== undefined) {
    params.set("aircraft", `${focusFireAirwatch.aircraftCount}`);
  }
  if (focusFireAirwatch.artilleryCount !== undefined) {
    params.set("artillery", `${focusFireAirwatch.artilleryCount}`);
  }
  if (focusFireAirwatch.armorCount !== undefined) {
    params.set("armor", `${focusFireAirwatch.armorCount}`);
  }
  if (focusFireAirwatch.weaponsInFlight !== undefined) {
    params.set("weapons", `${focusFireAirwatch.weaponsInFlight}`);
  }
  if (focusFireAirwatch.statusLabel) {
    params.set("status", focusFireAirwatch.statusLabel);
  }
}

function formatScriptStatus(runtimeInfo: FlightSimRuntimeInfo | null) {
  const vworld = runtimeInfo?.vworld;

  if (!vworld?.loadedScriptUrl) {
    return "대기 중";
  }

  if (vworld.scriptGlobalsReady) {
    return "API 글로벌 준비";
  }

  if (vworld.scriptLoaded) {
    return "파일 로드됨, vw.Map 미생성";
  }

  return "실패";
}

function formatViewerStatus(runtimeInfo: FlightSimRuntimeInfo | null) {
  const vworld = runtimeInfo?.vworld;

  if (vworld?.viewerReady) {
    return "뷰어 준비 완료";
  }

  if (vworld?.viewerDetected) {
    return "뷰어 감지됨";
  }

  if (vworld?.callbackFired) {
    return "초기화 콜백 수신";
  }

  if (vworld?.mapStartRequested) {
    return "map.start() 호출됨";
  }

  if (vworld?.eligible === false) {
    return "VWorld 3D 대상 아님";
  }

  return "대기 중";
}
interface FlightSimPageProps {
  onBack: () => void;
  initialCraft?: string;
  initialLocation?: {
    lon?: number;
    lat?: number;
  };
  game?: Game;
  continueSimulation?: boolean;
  focusFireAirwatch?: FocusFireAirwatchState;
}

const craftCopy: Record<
  CraftMode,
  {
    overline: string;
    title: string;
    description: string;
    controls: string[];
  }
> = {
  jet: {
    overline: "파이어 스코프 비행 모드",
    title: "전투기 체험",
    description:
      "전투기 조종 방식으로 빠르게 비행합니다. 속도와 기동이 크고, 기존 전투기 전투 화면을 그대로 씁니다.",
    controls: [
      "`W/S`: 엔진 세기 올리기 / 내리기",
      "`↑↓ / ←→`: 기수 들기·내리기 / 기울이기",
      "`A/D`: 좌우 방향 돌리기",
      "`스페이스`: 순간 가속",
      "`F` 또는 `엔터`: 무기 발사",
      "`Esc` 또는 `P`: 잠시 멈추기",
    ],
  },
  drone: {
    overline: "파이어 스코프 드론 모드",
    title: "드론 체험",
    description:
      "드론 자산으로 저고도 비행합니다. 느린 속도로 띄우고, 주변을 살피듯 부드럽게 이동할 수 있습니다.",
    controls: [
      "`W/S`: 앞으로 / 뒤로 이동",
      "`↑ / ↓`: 상승 / 하강",
      "`← / →`: 좌우 이동",
      "`A/D`: 좌우 회전",
      "`마우스 드래그`: 시야 둘러보기",
      "`Esc` 또는 `P`: 잠시 멈추기",
    ],
  },
};

export default function FlightSimPage({
  onBack,
  initialCraft,
  initialLocation,
  game,
  continueSimulation = false,
  focusFireAirwatch,
}: Readonly<FlightSimPageProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const simulationOutcomeRequestIdRef = useRef(0);
  const [assetState, setAssetState] = useState<AssetState>("checking");
  const [runtimeInfo, setRuntimeInfo] = useState<FlightSimRuntimeInfo | null>(
    null
  );
  const [runtimeProvider, setRuntimeProvider] = useState<
    "checking" | "vworld-webgl" | "cesium-fallback" | "unknown"
  >("checking");
  const [flightSimFrameReady, setFlightSimFrameReady] = useState(false);
  const focusFireAirwatchEnabled = hasFocusFireObjective(focusFireAirwatch);
  const [currentFocusFireAirwatch, setCurrentFocusFireAirwatch] = useState<
    FocusFireAirwatchState | undefined
  >(() =>
    focusFireAirwatchEnabled
      ? buildFocusFireAirwatchState(game, continueSimulation, focusFireAirwatch)
      : undefined
  );
  const [selectedMode, setSelectedMode] = useState<CraftMode>(
    initialCraft === "drone" ? "drone" : "jet"
  );
  const [selectedJetCraftId, setSelectedJetCraftId] = useState<JetCraftId>(
    resolveInitialJetCraftId(initialCraft)
  );
  const [simulationOutcomeSummary, setSimulationOutcomeSummary] =
    useState<SimulationOutcomeSummary | null>(null);
  const [simulationOutcomeNarrative, setSimulationOutcomeNarrative] =
    useState("");
  const [simulationOutcomeNarrativeSource, setSimulationOutcomeNarrativeSource] =
    useState<SimulationOutcomeNarrativeSource>("fallback");
  const [simulationOutcomeLoading, setSimulationOutcomeLoading] =
    useState(false);
  const [simulationOutcomeOpen, setSimulationOutcomeOpen] = useState(false);
  const iframeParams = new URLSearchParams();
  const hasInitialStartLocation = hasFiniteFlightSimLocation(initialLocation);
  const normalizedInitialLocation =
    normalizeFlightSimStartLocation(initialLocation);
  const startsInKorea =
    hasInitialStartLocation &&
    isInsideFlightSimKorea(initialLocation.lon, initialLocation.lat);
  const showFocusFireAirwatch =
    focusFireAirwatchEnabled && hasFocusFireObjective(currentFocusFireAirwatch);

  iframeParams.set("lon", normalizedInitialLocation.lon.toFixed(6));
  iframeParams.set("lat", normalizedInitialLocation.lat.toFixed(6));
  iframeParams.set(
    "craft",
    selectedMode === "drone" ? "drone" : selectedJetCraftId
  );
  iframeParams.set("rev", FLIGHT_SIM_REVISION);
  appendFocusFireQueryParams(iframeParams, currentFocusFireAirwatch);

  const iframeSrc = iframeParams.toString()
    ? `${FLIGHT_SIM_ENTRY}?${iframeParams.toString()}`
    : FLIGHT_SIM_ENTRY;
  const selectedCraftCopy = craftCopy[selectedMode];
  const selectedJetCraft = getJetCraftCatalogEntry(selectedJetCraftId);
  const selectedFlightSimTitle =
    selectedMode === "drone" ? "드론 체험" : `${selectedJetCraft.label} 체험`;
  const focusFireInsight = useMemo(() => {
    if (!currentFocusFireAirwatch) {
      return null;
    }

    return buildFocusFireInsight({
      active: currentFocusFireAirwatch.active ?? false,
      captureProgress: currentFocusFireAirwatch.captureProgress ?? 0,
      aircraftCount: currentFocusFireAirwatch.aircraftCount ?? 0,
      artilleryCount: currentFocusFireAirwatch.artilleryCount ?? 0,
      armorCount: currentFocusFireAirwatch.armorCount ?? 0,
      weaponsInFlight: currentFocusFireAirwatch.weaponsInFlight ?? 0,
    });
  }, [currentFocusFireAirwatch]);

  const postFocusFireToFlightSim = (
    type: "firescope-focus-fire-update" | "firescope-focus-fire-command",
    payload: Record<string, unknown>
  ) => {
    if (!iframeRef.current?.contentWindow) {
      return;
    }

    iframeRef.current.contentWindow.postMessage(
      { type, payload },
      window.location.origin
    );
  };

  useEffect(() => {
    setCurrentFocusFireAirwatch(
      focusFireAirwatchEnabled
        ? buildFocusFireAirwatchState(
            game,
            continueSimulation,
            focusFireAirwatch
          )
        : undefined
    );
  }, [continueSimulation, focusFireAirwatch, focusFireAirwatchEnabled, game]);

  useEffect(() => {
    setFlightSimFrameReady(false);
  }, [iframeSrc]);

  useEffect(() => {
    let ignore = false;

    const checkFlightSimBundle = async () => {
      setAssetState("checking");

      try {
        const response = await fetch(FLIGHT_SIM_ENTRY, { cache: "no-store" });
        if (!ignore) {
          setAssetState(response.ok ? "ready" : "missing");
        }
      } catch (_error) {
        if (!ignore) {
          setAssetState("missing");
        }
      }
    };

    void checkFlightSimBundle();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (assetState !== "ready") {
      setRuntimeProvider("checking");
      return;
    }

    const updateRuntimeProvider = () => {
      const iframeWindow = iframeRef.current?.contentWindow as
        | (Window & {
            __FLIGHT_SIM_RUNTIME__?: FlightSimRuntimeInfo;
          })
        | null
        | undefined;
      const nextRuntimeInfo = iframeWindow?.__FLIGHT_SIM_RUNTIME__ ?? null;
      const provider = nextRuntimeInfo?.mapProvider;
      setRuntimeInfo(nextRuntimeInfo);
      setRuntimeProvider(
        provider === "vworld-webgl" || provider === "cesium-fallback"
          ? provider
          : provider === "initializing"
            ? "checking"
            : "unknown"
      );
    };

    const intervalId = window.setInterval(updateRuntimeProvider, 1000);
    updateRuntimeProvider();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [assetState, iframeSrc]);

  useEffect(() => {
    if (
      !flightSimFrameReady ||
      !showFocusFireAirwatch ||
      !currentFocusFireAirwatch
    ) {
      return;
    }

    postFocusFireToFlightSim("firescope-focus-fire-update", {
      objectiveName: currentFocusFireAirwatch.objectiveName,
      objectiveLon: currentFocusFireAirwatch.objectiveLon,
      objectiveLat: currentFocusFireAirwatch.objectiveLat,
      active: currentFocusFireAirwatch.active,
      captureProgress: currentFocusFireAirwatch.captureProgress,
      aircraftCount: currentFocusFireAirwatch.aircraftCount,
      artilleryCount: currentFocusFireAirwatch.artilleryCount,
      armorCount: currentFocusFireAirwatch.armorCount,
      weaponsInFlight: currentFocusFireAirwatch.weaponsInFlight,
      statusLabel: currentFocusFireAirwatch.statusLabel,
      launchPlatforms: currentFocusFireAirwatch.launchPlatforms,
      weaponTracks: currentFocusFireAirwatch.weaponTracks,
    });
  }, [currentFocusFireAirwatch, flightSimFrameReady, showFocusFireAirwatch]);

  useEffect(() => {
    if (!game || !focusFireAirwatchEnabled || !showFocusFireAirwatch) {
      return;
    }

    let cancelled = false;

    const syncFocusFireState = () => {
      const summary = game.getFocusFireSummary();
      if (
        cancelled ||
        summary.objectiveLatitude === null ||
        summary.objectiveLongitude === null
      ) {
        return;
      }

      setCurrentFocusFireAirwatch(
        buildFocusFireAirwatchState(game, continueSimulation)
      );
    };

    syncFocusFireState();
    const syncIntervalId = window.setInterval(syncFocusFireState, 250);

    return () => {
      cancelled = true;
      window.clearInterval(syncIntervalId);
    };
  }, [
    continueSimulation,
    focusFireAirwatchEnabled,
    game,
    showFocusFireAirwatch,
  ]);

  useEffect(() => {
    if (!game || !continueSimulation) {
      return;
    }

    let cancelled = false;

    const runSimulation = async () => {
      let gameEnded = game.checkGameEnded();

      while (!cancelled && !game.scenarioPaused && !gameEnded) {
        let steps = 1;
        game.step();
        while (steps < game.currentScenario.timeCompression) {
          game.step();
          steps += 1;
        }
        game.recordStep();
        gameEnded = game.checkGameEnded();
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }

      if (!cancelled && gameEnded) {
        const requestId = simulationOutcomeRequestIdRef.current + 1;
        simulationOutcomeRequestIdRef.current = requestId;
        const summary = buildSimulationOutcomeSummary(game);

        setSimulationOutcomeSummary(summary);
        setSimulationOutcomeNarrative(summary.fallbackSummary);
        setSimulationOutcomeNarrativeSource("fallback");
        setSimulationOutcomeLoading(true);
        setSimulationOutcomeOpen(true);

        const narrative = await requestSimulationOutcomeNarrative(summary);
        if (cancelled || simulationOutcomeRequestIdRef.current !== requestId) {
          return;
        }

        setSimulationOutcomeNarrative(narrative.text);
        setSimulationOutcomeNarrativeSource(narrative.source);
        setSimulationOutcomeLoading(false);
      }
    };

    void runSimulation();

    return () => {
      cancelled = true;
      simulationOutcomeRequestIdRef.current += 1;
    };
  }, [continueSimulation, game]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, #17354a 0%, #091522 34%, #04070d 100%)",
        color: "#eef7fb",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255, 194, 96, 0.18), transparent 26%, rgba(121, 230, 255, 0.14) 72%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 3,
          width: { xs: "calc(100% - 40px)", sm: 360 },
          maxHeight: "calc(100% - 40px)",
          overflowY: "auto",
          p: 2.5,
          borderRadius: 3,
          backdropFilter: "blur(18px)",
          background:
            "linear-gradient(180deg, rgba(6, 15, 28, 0.9) 0%, rgba(4, 10, 20, 0.76) 100%)",
          border: "1px solid rgba(121, 230, 255, 0.22)",
          boxShadow: "0 20px 54px rgba(0, 7, 16, 0.55)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "#7fe7ff", letterSpacing: "0.18em" }}
            >
              {selectedCraftCopy.overline}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {selectedCraftCopy.title}
            </Typography>
            {selectedMode === "jet" && (
              <Typography
                sx={{
                  mt: 0.6,
                  color: "#7fe7ff",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {selectedJetCraft.label}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{
              alignSelf: "flex-start",
              borderColor: "rgba(121, 230, 255, 0.34)",
              color: "#eef7fb",
              backgroundColor: "rgba(12, 28, 41, 0.42)",
              "&:hover": {
                borderColor: "#7fe7ff",
                backgroundColor: "rgba(20, 48, 68, 0.55)",
              },
            }}
          >
            돌아가기
          </Button>
        </Stack>

        <Typography sx={{ mt: 1.5, color: "rgba(238, 247, 251, 0.84)" }}>
          {selectedCraftCopy.description} 화면 안을 한 번 클릭한 뒤 조작하면
          됩니다.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant={selectedMode === "jet" ? "contained" : "outlined"}
            onClick={() => setSelectedMode("jet")}
            sx={{
              minWidth: 92,
              borderColor: "rgba(121, 230, 255, 0.34)",
              color: selectedMode === "jet" ? "#07111d" : "#eef7fb",
              backgroundColor:
                selectedMode === "jet" ? "#7fe7ff" : "rgba(10, 24, 37, 0.44)",
              "&:hover": {
                borderColor: "#7fe7ff",
                backgroundColor:
                  selectedMode === "jet" ? "#9cefff" : "rgba(20, 48, 68, 0.58)",
              },
            }}
          >
            전투기
          </Button>
          <Button
            variant={selectedMode === "drone" ? "contained" : "outlined"}
            onClick={() => setSelectedMode("drone")}
            sx={{
              minWidth: 92,
              borderColor: "rgba(121, 230, 255, 0.34)",
              color: selectedMode === "drone" ? "#07111d" : "#eef7fb",
              backgroundColor:
                selectedMode === "drone" ? "#7fe7ff" : "rgba(10, 24, 37, 0.44)",
              "&:hover": {
                borderColor: "#7fe7ff",
                backgroundColor:
                  selectedMode === "drone"
                    ? "#9cefff"
                    : "rgba(20, 48, 68, 0.58)",
              },
            }}
          >
            드론
          </Button>
        </Stack>
        {selectedMode === "jet" && (
          <Box
            sx={{
              mt: 2,
              p: 1.6,
              borderRadius: 2.5,
              backgroundColor: "rgba(8, 18, 30, 0.72)",
              border: "1px solid rgba(121, 230, 255, 0.18)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#7fe7ff", letterSpacing: "0.16em" }}
            >
              전투기 선택
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 1 }}>
              {JET_CRAFT_CATALOG.map((craft) => {
                const isSelected = selectedJetCraftId === craft.id;

                return (
                  <Button
                    key={craft.id}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => setSelectedJetCraftId(craft.id)}
                    sx={{
                      justifyContent: "space-between",
                      textAlign: "left",
                      textTransform: "none",
                      px: 1.2,
                      py: 1,
                      borderColor: "rgba(121, 230, 255, 0.18)",
                      backgroundColor: isSelected
                        ? "#7fe7ff"
                        : "rgba(9, 19, 31, 0.56)",
                      color: isSelected ? "#07111d" : "#eef7fb",
                      "&:hover": {
                        borderColor: "#7fe7ff",
                        backgroundColor: isSelected
                          ? "#9cefff"
                          : "rgba(20, 48, 68, 0.58)",
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "left" }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {craft.label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.2,
                          fontSize: 11.5,
                          color: isSelected
                            ? "rgba(7, 17, 29, 0.72)"
                            : "rgba(238, 247, 251, 0.66)",
                        }}
                      >
                        {craft.role}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        ml: 1,
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {craft.hudLabel}
                    </Typography>
                  </Button>
                );
              })}
            </Stack>
            <Box
              sx={{
                mt: 1.4,
                p: 1.3,
                borderRadius: 2,
                backgroundColor: "rgba(4, 12, 22, 0.64)",
                border: "1px solid rgba(121, 230, 255, 0.12)",
              }}
            >
              <Typography sx={{ fontWeight: 800 }}>
                {selectedJetCraft.label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 13,
                  color: "rgba(238, 247, 251, 0.8)",
                }}
              >
                {selectedJetCraft.summary}
              </Typography>
              <Typography
                sx={{
                  mt: 0.8,
                  fontSize: 12.5,
                  color: "rgba(127, 231, 255, 0.88)",
                }}
              >
                {selectedJetCraft.simNote}
              </Typography>
              <Box
                sx={{
                  mt: 1.15,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 0.8,
                }}
              >
                {selectedJetCraft.simStats.map((stat) => (
                  <Box
                    key={stat.label}
                    sx={{
                      p: 0.9,
                      borderRadius: 1.6,
                      backgroundColor: "rgba(11, 22, 37, 0.7)",
                      border: "1px solid rgba(121, 230, 255, 0.1)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        letterSpacing: "0.1em",
                        color: "rgba(127, 231, 255, 0.82)",
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography sx={{ mt: 0.25, fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {selectedJetCraft.officialNote && (
                <Typography
                  sx={{
                    mt: 1.1,
                    fontSize: 12.5,
                    color: "rgba(255, 212, 148, 0.92)",
                  }}
                >
                  {selectedJetCraft.officialNote}
                </Typography>
              )}
              {selectedJetCraft.statusNote && (
                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: 12.5,
                    color: "rgba(238, 247, 251, 0.72)",
                  }}
                >
                  {selectedJetCraft.statusNote}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {showFocusFireAirwatch && focusFireInsight && (
          <Box
            sx={{
              mt: 2,
              p: 1.6,
              borderRadius: 2.5,
              background:
                "linear-gradient(180deg, rgba(48, 24, 10, 0.82) 0%, rgba(24, 12, 6, 0.72) 100%)",
              border: "1px solid rgba(255, 183, 77, 0.28)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#ffb74d", letterSpacing: "0.16em" }}
            >
              집중포격 분석
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography sx={{ fontWeight: 800, color: "#fff6ec" }}>
                충격량 지수 {focusFireInsight.shockIndex}
              </Typography>
              <Typography sx={{ color: "#ffd89a", fontSize: 13 }}>
                {focusFireInsight.intensityLabel}
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.5,
                color: "rgba(255, 246, 236, 0.8)",
              }}
            >
              포대 {focusFireInsight.breakdown.artillery} + 항공{" "}
              {focusFireInsight.breakdown.aircraft} + 기갑{" "}
              {focusFireInsight.breakdown.armor} + 탄체{" "}
              {focusFireInsight.breakdown.weaponsInFlight} + 점령{" "}
              {focusFireInsight.breakdown.captureProgress}
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.5,
                color: "rgba(255, 216, 154, 0.92)",
              }}
            >
              주도 축: {focusFireInsight.dominantAxis}
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.8,
                color: "rgba(255, 246, 236, 0.82)",
              }}
            >
              {focusFireInsight.summary}
            </Typography>
          </Box>
        )}
        {hasInitialStartLocation && !startsInKorea && (
          <Typography
            sx={{ mt: 1, color: "rgba(127, 231, 255, 0.9)", fontSize: 13 }}
          >
            한국 밖 좌표는 서울 기본 위치로 재설정해 VWorld 3D를 유지합니다.
          </Typography>
        )}
        {!hasInitialStartLocation && (
          <Typography
            sx={{ mt: 1, color: "rgba(127, 231, 255, 0.9)", fontSize: 13 }}
          >
            시작 좌표가 없어 서울 기본 위치에서 시작합니다.
          </Typography>
        )}
        <Typography
          sx={{ mt: 1, color: "rgba(238, 247, 251, 0.74)", fontSize: 13 }}
        >
          지도 엔진:{" "}
          {runtimeProvider === "vworld-webgl"
            ? "VWorld WebGL 3D"
            : runtimeProvider === "cesium-fallback"
              ? "Cesium + MapTiler"
              : runtimeProvider === "checking"
                ? "확인 중"
                : "초기화 중"}
        </Typography>
        <Stack spacing={0.4} sx={{ mt: 1.2, fontSize: 12.5 }}>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            VWorld 대상:{" "}
            {runtimeInfo?.vworld?.eligible === true
              ? "예"
              : runtimeInfo?.vworld?.eligible === false
                ? "아니오"
                : "-"}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            시작 좌표:{" "}
            {runtimeInfo?.vworld?.initialPosition
              ? `${runtimeInfo.vworld.initialPosition.lon.toFixed(4)}, ${runtimeInfo.vworld.initialPosition.lat.toFixed(4)}`
              : "-"}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            설정 도메인: {runtimeInfo?.vworld?.configuredDomain ?? "-"}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            실제 호스트: {runtimeInfo?.vworld?.pageHost ?? "-"}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            스크립트 상태: {formatScriptStatus(runtimeInfo)}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            스크립트 URL: {runtimeInfo?.vworld?.loadedScriptUrl ?? "-"}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            뷰어 상태: {formatViewerStatus(runtimeInfo)}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            초기화 단계: {runtimeInfo?.vworld?.initializationStage ?? "-"}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            모듈 감지:{" "}
            {runtimeInfo?.vworld?.moduleDetected === true
              ? "예"
              : runtimeInfo?.vworld?.moduleDetected === false
                ? "아니오"
                : "-"}
          </Typography>
          <Typography sx={{ color: "rgba(238, 247, 251, 0.66)" }}>
            LOD4 레이어:{" "}
            {runtimeInfo?.vworld?.layerName
              ? `${runtimeInfo.vworld.layerName}${runtimeInfo.vworld.layerActivated ? " 활성" : " 비활성"}`
              : "미발견"}
          </Typography>
          <Typography sx={{ color: "rgba(246, 242, 223, 0.64)" }}>
            레이어 후보:{" "}
            {runtimeInfo?.vworld?.layerCandidates?.length
              ? runtimeInfo.vworld.layerCandidates.slice(0, 4).join(", ")
              : "-"}
          </Typography>
          {runtimeInfo?.vworld?.lastError && (
            <Typography sx={{ color: "rgba(255, 194, 96, 0.92)" }}>
              상태: {runtimeInfo.vworld.lastError}
            </Typography>
          )}
        </Stack>

        <Stack spacing={0.7} sx={{ mt: 2, fontSize: 13 }}>
          {selectedCraftCopy.controls.map((control) => (
            <Typography
              key={control}
              sx={{ color: "rgba(238, 247, 251, 0.82)", fontSize: 13 }}
            >
              {control}
            </Typography>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          left: { xs: 0, sm: 400 },
          zIndex: 1,
          backgroundColor: "#02060c",
        }}
      >
        <Box
          component="iframe"
          ref={iframeRef}
          title={selectedFlightSimTitle}
          src={iframeSrc}
          onLoad={() => setFlightSimFrameReady(true)}
          sx={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
            backgroundColor: "#02060c",
          }}
        />

        {(assetState !== "ready" || !flightSimFrameReady) && (
          <Stack
            spacing={1.2}
            alignItems="center"
            justifyContent="center"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at center, rgba(8, 18, 30, 0.88) 0%, rgba(2, 6, 12, 0.96) 100%)",
              color: "#eef7fb",
              pointerEvents: "none",
            }}
          >
            <CircularProgress
              size={42}
              thickness={4}
              sx={{ color: "#7fe7ff" }}
            />
            <Typography sx={{ fontWeight: 700 }}>
              {assetState === "missing"
                ? "비행 시뮬레이터 자산을 찾을 수 없습니다."
                : "비행 시뮬레이터를 불러오는 중..."}
            </Typography>
            <Typography sx={{ color: "rgba(238, 247, 251, 0.72)" }}>
              {selectedFlightSimTitle}
            </Typography>
          </Stack>
        )}
      </Box>
      <SimulationOutcomeDialog
        open={simulationOutcomeOpen}
        summary={simulationOutcomeSummary}
        narrative={simulationOutcomeNarrative}
        narrativeSource={simulationOutcomeNarrativeSource}
        loading={simulationOutcomeLoading}
        onClose={() => setSimulationOutcomeOpen(false)}
      />
    </Box>
  );
}
