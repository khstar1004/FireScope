import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import Game, { type BattleSpectatorSnapshot } from "@/game/Game";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import {
  getBundleModelById,
  getImmersiveExperienceModelOptions,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import {
  buildImmersiveModeBrief,
  getImmersiveOperationOptions,
} from "@/gui/experience/immersiveOperations";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import {
  buildExperienceMissionPlan,
  getExperienceModelRuntime,
  getExperienceTheme,
  type ExperienceMissionPlan,
  type ExperienceModelRuntime,
} from "@/gui/experience/experienceRuntime";
import {
  preloadStaticAsset,
  preloadTacticalSim,
} from "@/gui/experience/modelPreload";
import {
  buildTacticalMissionPrimer,
  type TacticalMissionPrimer,
} from "@/gui/experience/tacticalMissionPrimer";
import { createTacticalExperienceScenario } from "@/gui/experience/tacticalExperience";
import { buildTacticalScenarioFromBattleSnapshot } from "@/gui/experience/liveTacticalRuntime";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";
import { getDisplayName } from "@/utils/koreanCatalog";
import { resolvePublicAssetPath } from "@/utils/publicAssetUrl";

const TACTICAL_SIM_ENTRY = resolvePublicAssetPath("/tactical-sim/index.html");
const TACTICAL_SIM_APP = resolvePublicAssetPath("/tactical-sim/app.js");
const TACTICAL_SIM_REVISION = "20260417-model-focus-brief-layout";

type AssetState = "checking" | "ready" | "missing";

interface TacticalSimPageProps {
  route: TacticalSimRoute | null;
  onBack: () => void;
  onBackToMap: () => void;
  game?: Game;
  continueSimulation?: boolean;
}

interface TacticalSimRuntimePayload {
  profile: ImmersiveExperienceProfile;
  operationMode: string;
  theme: ReturnType<typeof getExperienceTheme>;
  asset: AssetExperienceSummary;
  model: BundleModelSelection | null;
  modelRuntime: ExperienceModelRuntime | null;
  mission: ExperienceMissionPlan;
  scenario: ReturnType<typeof createTacticalExperienceScenario>;
  primer: TacticalMissionPrimer;
  liveRuntime: {
    source: "seed" | "battle-snapshot";
    focusUnitId: string | null;
    focusSideId: string | null;
    currentTime?: number;
  };
}

function resolveModel(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  modelId?: string,
  liveModelId?: string
) {
  const modelOptions = getImmersiveExperienceModelOptions(asset, profile);
  const preferredModel = selectImmersiveExperienceModel(asset, profile);

  return (
    modelOptions.find((model) => model.id === modelId) ??
    getBundleModelById(liveModelId) ??
    preferredModel ??
    modelOptions[0] ??
    null
  );
}

function buildRuntimePayload(
  route: TacticalSimRoute,
  liveSnapshot?: BattleSpectatorSnapshot
): TacticalSimRuntimePayload {
  const theme = getExperienceTheme(route.profile);
  const liveFocusModelId =
    liveSnapshot?.units.find((unit) => unit.id === route.asset.id)?.modelId ??
    undefined;
  const model = resolveModel(
    route.asset,
    route.profile,
    route.modelId,
    liveFocusModelId
  );
  const mission = buildExperienceMissionPlan(
    route.profile,
    route.operationMode,
    route.asset,
    model
  );
  const liveRuntime = liveSnapshot
    ? buildTacticalScenarioFromBattleSnapshot(liveSnapshot, route)
    : null;
  const scenario =
    liveRuntime?.scenario ??
    createTacticalExperienceScenario(
      route.asset,
      route.profile,
      route.operationMode
    );

  return {
    profile: route.profile,
    operationMode: route.operationMode,
    theme,
    asset: route.asset,
    model,
    modelRuntime: model
      ? getExperienceModelRuntime(model, route.profile)
      : null,
    mission,
    scenario,
    primer: buildTacticalMissionPrimer(mission, scenario),
    liveRuntime:
      liveRuntime?.runtime ??
      ({
        source: "seed",
        focusUnitId: null,
        focusSideId: null,
      } as const),
  };
}

function formatSensorRange(sensorRangeM: number) {
  return sensorRangeM >= 1000
    ? `${(sensorRangeM / 1000).toFixed(1)} km`
    : `${Math.round(sensorRangeM)} m`;
}

function buildRuntimeHint(profile: ImmersiveExperienceProfile) {
  if (profile === "defense") {
    return "모델 집중에서는 중앙 표식을 숨기고 방공 자산을 360도로 회전해 레이더와 발사기 방향을 확인합니다.";
  }

  if (profile === "fires") {
    return "모델 집중에서는 중앙 표식을 숨기고 포대 축과 발사 자세를 먼저 읽습니다.";
  }

  if (profile === "ground") {
    return "모델 집중에서는 중앙 표식을 숨기고 차체와 포탑 방향을 먼저 읽은 뒤 작전 투입으로 내려갑니다.";
  }

  return "모델 집중에서는 중앙 표식을 숨기고 자산 주위를 드래그로 회전하며 3D 모델을 크게 확인합니다.";
}

export default function TacticalSimPage({
  route,
  onBack,
  onBackToMap,
  game,
  continueSimulation = true,
}: Readonly<TacticalSimPageProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const demoTimerIdsRef = useRef<number[]>([]);
  const liveSnapshotSignatureRef = useRef<string>("");
  const initialFocusAppliedRef = useRef(false);
  const [assetState, setAssetState] = useState<AssetState>("checking");
  const [iframeReady, setIframeReady] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [activeDemoBeatId, setActiveDemoBeatId] = useState<string | null>(null);
  const [liveSnapshot, setLiveSnapshot] = useState<
    BattleSpectatorSnapshot | undefined
  >(() =>
    typeof game?.getBattleSpectatorSnapshot === "function"
      ? game.getBattleSpectatorSnapshot()
      : undefined
  );
  const runtimePayload = useMemo(
    () => (route ? buildRuntimePayload(route, liveSnapshot) : null),
    [liveSnapshot, route]
  );
  const runtimeKey = useMemo(() => {
    if (!route) {
      return null;
    }

    return [
      "vista",
      "tactical-sim",
      route.asset.id,
      route.profile,
      route.operationMode,
      route.modelId ?? "default",
      runtimePayload?.liveRuntime.source ?? "seed",
    ].join(":");
  }, [route, runtimePayload?.liveRuntime.source]);

  useEffect(() => {
    if (!runtimeKey || !runtimePayload) {
      return;
    }

    window.sessionStorage.setItem(runtimeKey, JSON.stringify(runtimePayload));

    return () => {
      window.sessionStorage.removeItem(runtimeKey);
    };
  }, [runtimeKey, runtimePayload]);

  useEffect(() => {
    setIframeReady(false);
    initialFocusAppliedRef.current = false;
  }, [runtimeKey]);

  useEffect(() => {
    if (!route || typeof game?.getBattleSpectatorSnapshot !== "function") {
      return;
    }

    const syncLiveSnapshot = () => {
      const nextSnapshot = game.getBattleSpectatorSnapshot();
      const focusUnit =
        nextSnapshot.units.find((unit) => unit.id === route.asset.id) ?? null;
      const signature = JSON.stringify({
        currentTime: nextSnapshot.currentTime,
        selectedUnitId: nextSnapshot.selectedUnitId,
        unitCount: nextSnapshot.units.length,
        weaponCount: nextSnapshot.weapons.length,
        focusUnit: focusUnit
          ? [
              focusUnit.id,
              Number(focusUnit.latitude.toFixed(4)),
              Number(focusUnit.longitude.toFixed(4)),
              Number(focusUnit.hpFraction.toFixed(3)),
              focusUnit.weaponCount,
            ]
          : null,
      });

      if (signature === liveSnapshotSignatureRef.current) {
        return;
      }

      liveSnapshotSignatureRef.current = signature;
      setLiveSnapshot(nextSnapshot);
    };

    syncLiveSnapshot();
    const intervalId = window.setInterval(syncLiveSnapshot, 250);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [game, route]);

  useEffect(() => {
    let ignore = false;

    const checkBundle = async () => {
      setAssetState("checking");

      try {
        await preloadTacticalSim(runtimePayload?.model);
        const [entryResponse, appResponse] = await Promise.all([
          preloadStaticAsset(TACTICAL_SIM_ENTRY),
          preloadStaticAsset(TACTICAL_SIM_APP),
        ]);
        if (!ignore) {
          setAssetState(
            entryResponse?.ok && appResponse?.ok ? "ready" : "missing"
          );
        }
      } catch (_error) {
        if (!ignore) {
          setAssetState("missing");
        }
      }
    };

    void checkBundle();

    return () => {
      ignore = true;
    };
  }, [runtimePayload?.model?.path]);

  useEffect(() => {
    demoTimerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    demoTimerIdsRef.current = [];
    setDemoPlaying(false);
    setActiveDemoBeatId(null);
  }, [runtimeKey]);

  useEffect(() => {
    return () => {
      demoTimerIdsRef.current.forEach((timerId) =>
        window.clearTimeout(timerId)
      );
      demoTimerIdsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (
      assetState !== "ready" ||
      !runtimePayload ||
      !iframeRef.current?.contentWindow
    ) {
      return;
    }

    iframeRef.current.contentWindow.postMessage(
      {
        type: "vista-tactical-runtime-update",
        payload: runtimePayload,
      },
      window.location.origin
    );
  }, [assetState, runtimePayload]);

  useEffect(() => {
    if (
      assetState !== "ready" ||
      initialFocusAppliedRef.current ||
      !iframeRef.current?.contentWindow
    ) {
      return;
    }

    initialFocusAppliedRef.current = true;
    const timerId = window.setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "vista-tactical-command",
          payload: { command: "showcase-view" },
        },
        window.location.origin
      );
    }, 260);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [assetState, runtimeKey]);

  useEffect(() => {
    if (
      !game ||
      !continueSimulation ||
      typeof game.getGameEndState !== "function" ||
      typeof game.stepForTimeCompression !== "function" ||
      typeof game.recordStep !== "function"
    ) {
      return;
    }

    let cancelled = false;

    const runSimulation = async () => {
      let {
        terminated: gameTerminated,
        truncated: gameTruncated,
      } = game.getGameEndState();
      let gameEnded = gameTerminated || gameTruncated;

      while (!cancelled && !game.scenarioPaused && !gameEnded) {
        const [, , terminated, truncated] = game.stepForTimeCompression();
        game.recordStep();
        gameTerminated = terminated;
        gameTruncated = truncated;
        gameEnded = gameTerminated || gameTruncated;
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
    };

    void runSimulation();

    return () => {
      cancelled = true;
    };
  }, [continueSimulation, game]);

  if (!route || !runtimePayload || !runtimeKey) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          p: 3,
          background:
            "radial-gradient(circle at top, #2b2020 0%, #100c0c 42%, #050404 100%)",
          color: "#fff4f4",
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            전술 시뮬레이션 대상을 찾지 못했습니다.
          </Typography>
          <Typography sx={{ color: "rgba(255, 244, 244, 0.78)" }}>
            브리프 화면의 시작 버튼으로 다시 진입해야 합니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<MapOutlinedIcon />}
            onClick={onBackToMap}
          >
            지도 복귀
          </Button>
        </Stack>
      </Box>
    );
  }

  const theme = runtimePayload.theme;
  const mission = runtimePayload.mission;
  const primer = runtimePayload.primer;
  const operationOption = getImmersiveOperationOptions(route.profile).find(
    (option) => option.id === route.operationMode
  );
  const modeBrief = buildImmersiveModeBrief(
    route.profile,
    route.operationMode,
    runtimePayload.model ? [runtimePayload.model] : []
  );
  const providerLabel =
    (import.meta.env.VITE_MAPTILER_DEFAULT_KEY ??
    import.meta.env.MAPTILER_API_KEY)
      ? "Cesium + MapTiler"
      : "Cesium + OSM";
  const iframeParams = new URLSearchParams({
    state: runtimeKey,
    rev: TACTICAL_SIM_REVISION,
    profile: route.profile,
  });
  const iframeSrc = `${TACTICAL_SIM_ENTRY}?${iframeParams.toString()}`;
  const canControlRuntime = assetState === "ready";
  const runtimeStatusLabel =
    assetState === "ready"
      ? iframeReady
        ? "모델 집중 준비 완료"
        : "런타임 준비 완료"
      : assetState === "checking"
        ? "런타임 예열 중"
        : "런타임 파일 확인 필요";

  const sendRuntimeCommand = (command: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "vista-tactical-command",
        payload: { command },
      },
      window.location.origin
    );
  };

  const stopDemoPlayback = () => {
    demoTimerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    demoTimerIdsRef.current = [];
    setDemoPlaying(false);
    setActiveDemoBeatId(null);
  };

  const playDemoTimeline = () => {
    if (!canControlRuntime || mission.demoTimeline.length === 0) {
      return;
    }

    stopDemoPlayback();
    setDemoPlaying(true);

    let elapsedMs = 0;

    mission.demoTimeline.forEach((beat) => {
      const timerId = window.setTimeout(() => {
        setActiveDemoBeatId(beat.id);
        sendRuntimeCommand(beat.command);
      }, elapsedMs);

      demoTimerIdsRef.current.push(timerId);
      elapsedMs += beat.delayMs ?? 2200;
    });

    const finalizeId = window.setTimeout(() => {
      setDemoPlaying(false);
      setActiveDemoBeatId(null);
    }, elapsedMs + 240);

    demoTimerIdsRef.current.push(finalizeId);
  };

  const quickFacts = [
    {
      label: "센서",
      value: formatSensorRange(runtimePayload.scenario.config.sensorRangeM),
    },
    {
      label: "위협",
      value: `${runtimePayload.scenario.config.hostileContacts.length}개`,
    },
    {
      label: "모델",
      value: runtimePayload.model?.label ?? runtimePayload.asset.name,
    },
    {
      label: "분류",
      value: getDisplayName(runtimePayload.asset.className),
    },
  ];
  const briefCards = [
    { label: "작전 의도", value: primer.designIntent },
    { label: "전장", value: primer.battlespaceSummary },
    { label: "위협", value: primer.threatSummary },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: theme.background,
        color: "#eef7ff",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.06), transparent 30%, rgba(0, 0, 0, 0.18) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {assetState === "ready" ? (
        <Box
          component="iframe"
          ref={iframeRef}
          title={`${theme.opsTitle} iframe`}
          src={iframeSrc}
          onLoad={() => setIframeReady(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            zIndex: 1,
            backgroundColor: "#000",
          }}
        />
      ) : (
        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            backgroundColor: "rgba(4, 8, 3, 0.7)",
          }}
        >
          {assetState === "checking" ? (
            <>
              <CircularProgress sx={{ color: theme.accentColor }} />
              <Typography>
                실제 지도 전술 런타임과 3D 모델을 예열하는 중입니다.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                3D 전술 시뮬레이터 정적 파일을 찾지 못했습니다.
              </Typography>
              <Typography sx={{ color: "rgba(246, 242, 223, 0.78)" }}>
                `client/public/tactical-sim` 자산이 없거나 동기화되지
                않았습니다.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{ backgroundColor: theme.accentColor, color: "#07111b" }}
              >
                다시 확인
              </Button>
            </>
          )}
        </Stack>
      )}

      <Box
        sx={{
          position: "absolute",
          top: { xs: 12, md: 20 },
          left: { xs: 12, md: 20 },
          zIndex: 3,
          width: { xs: "calc(100% - 24px)", sm: 380, lg: 420 },
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100vh - 24px)",
          overflowY: "auto",
          p: { xs: 1.5, md: 1.8 },
          borderRadius: 4,
          backdropFilter: "blur(18px)",
          background:
            "linear-gradient(180deg, rgba(6, 12, 21, 0.76), rgba(6, 12, 21, 0.64))",
          border: "1px solid rgba(176, 220, 255, 0.14)",
          boxShadow: "0 18px 48px rgba(0, 0, 0, 0.32)",
          pointerEvents: "auto",
        }}
      >
        <Stack spacing={1.45}>
          <Stack direction="row" justifyContent="space-between" spacing={1.2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                sx={{
                  color: theme.accentColor,
                  letterSpacing: "0.18em",
                  fontFamily: "AceCombat, Bahnschrift, sans-serif",
                }}
              >
                {theme.opsOverline}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 0.2,
                  fontWeight: 900,
                  lineHeight: 1,
                  fontFamily: "AceCombat, Bahnschrift, sans-serif",
                }}
              >
                {theme.opsTitle}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontWeight: 800,
                  color: "rgba(226, 240, 255, 0.88)",
                }}
              >
                {runtimePayload.asset.name}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.8} sx={{ flexShrink: 0 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{
                  borderColor: "rgba(214, 227, 188, 0.24)",
                  color: "#eef7ff",
                }}
              >
                소개
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MapOutlinedIcon />}
                onClick={onBackToMap}
                sx={{
                  borderColor: "rgba(214, 227, 188, 0.24)",
                  color: "#eef7ff",
                }}
              >
                지도
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
            {[runtimeStatusLabel, operationOption?.label ?? route.operationMode, providerLabel].map(
              (item, index) => (
                <Box
                  key={item}
                  sx={{
                    px: 1.1,
                    py: 0.55,
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: index === 0 ? 700 : 500,
                    color: index === 0 ? theme.accentColor : "rgba(226, 240, 255, 0.8)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {item}
                </Box>
              )
            )}
          </Stack>

          <Typography sx={{ fontSize: 13, color: "rgba(226, 240, 255, 0.82)" }}>
            {modeBrief}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(226, 240, 255, 0.66)" }}>
            {mission.commandersIntent}
          </Typography>

          <Box
            sx={{
              p: 1.2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: theme.accentColor, letterSpacing: "0.14em" }}
            >
              3D Focus
            </Typography>
            <Stack
              direction="row"
              spacing={0.8}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 0.9 }}
            >
              <Button
                size="small"
                variant="contained"
                disabled={!canControlRuntime}
                onClick={() => sendRuntimeCommand("showcase-view")}
                sx={{ backgroundColor: theme.accentColor, color: "#07111b" }}
              >
                모델 집중
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canControlRuntime}
                onClick={() => sendRuntimeCommand("mission-view")}
                sx={{
                  borderColor: "rgba(214, 227, 188, 0.24)",
                  color: "#eef7ff",
                }}
              >
                작전 투입
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canControlRuntime}
                onClick={() => sendRuntimeCommand("overview")}
                sx={{
                  borderColor: "rgba(214, 227, 188, 0.24)",
                  color: "#eef7ff",
                }}
              >
                전장 개요
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canControlRuntime}
                onClick={() => sendRuntimeCommand("threat-view")}
                sx={{
                  borderColor: "rgba(214, 227, 188, 0.24)",
                  color: "#eef7ff",
                }}
              >
                위협 추적
              </Button>
              <Button
                size="small"
                variant={demoPlaying ? "contained" : "outlined"}
                disabled={!canControlRuntime}
                onClick={() => {
                  if (demoPlaying) {
                    stopDemoPlayback();
                    return;
                  }
                  playDemoTimeline();
                }}
                sx={
                  demoPlaying
                    ? {
                        backgroundColor: "rgba(255, 255, 255, 0.14)",
                        color: "#eef7ff",
                      }
                    : {
                        borderColor: "rgba(214, 227, 188, 0.24)",
                        color: "#eef7ff",
                      }
                }
              >
                {demoPlaying ? "데모 정지" : "데모 재생"}
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!canControlRuntime}
                onClick={() => sendRuntimeCommand("reset-view")}
                sx={{
                  borderColor: "rgba(214, 227, 188, 0.24)",
                  color: "#eef7ff",
                }}
              >
                기준 시점
              </Button>
            </Stack>
            <Typography
              sx={{
                mt: 0.9,
                fontSize: 12,
                color: "rgba(226, 240, 255, 0.68)",
              }}
            >
              {buildRuntimeHint(route.profile)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1,
            }}
          >
            {quickFacts.map((fact) => (
              <Box
                key={fact.label}
                sx={{
                  p: 1.1,
                  borderRadius: 2.2,
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    color: theme.accentColor,
                  }}
                >
                  {fact.label}
                </Typography>
                <Typography sx={{ mt: 0.45, fontWeight: 800 }}>
                  {fact.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              p: 1.2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: theme.accentColor, letterSpacing: "0.14em" }}
            >
              Brief Stack
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 0.9 }}>
              {briefCards.map((card) => (
                <Box
                  key={card.label}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: theme.accentColor,
                    }}
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.4,
                      fontSize: 12,
                      color: "rgba(226, 240, 255, 0.78)",
                    }}
                  >
                    {card.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: 1.2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: theme.accentColor, letterSpacing: "0.14em" }}
            >
              결심 체크
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 0.9 }}>
              {primer.quickStartSteps.map((item) => (
                <Typography
                  key={item}
                  sx={{
                    fontSize: 12,
                    color: "rgba(226, 240, 255, 0.78)",
                  }}
                >
                  {item}
                </Typography>
              ))}
              {primer.decisionChecklist.map((item) => (
                <Typography
                  key={item}
                  sx={{
                    fontSize: 12,
                    color: "rgba(226, 240, 255, 0.62)",
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: 1.2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: theme.accentColor, letterSpacing: "0.14em" }}
            >
              교전 흐름
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 0.9 }}>
              {mission.demoTimeline.map((beat, index) => {
                const active = beat.id === activeDemoBeatId;

                return (
                  <Box
                    key={beat.id}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: active
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: active
                        ? `1px solid ${theme.accentColor}`
                        : "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                      {index + 1}. {beat.title}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 12,
                        color: "rgba(226, 240, 255, 0.68)",
                      }}
                    >
                      {beat.description}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              disabled={!canControlRuntime}
              onClick={() => sendRuntimeCommand("next-target")}
              sx={{
                borderColor: "rgba(214, 227, 188, 0.24)",
                color: "#eef7ff",
              }}
            >
              다음 위협
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={!canControlRuntime}
              onClick={() => sendRuntimeCommand("fire-primary")}
              sx={{
                borderColor: "rgba(214, 227, 188, 0.24)",
                color: "#eef7ff",
              }}
            >
              주무장
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={!canControlRuntime}
              onClick={() => sendRuntimeCommand("fire-support")}
              sx={{
                borderColor: "rgba(214, 227, 188, 0.24)",
                color: "#eef7ff",
              }}
            >
              보조무장
            </Button>
          </Stack>

          <Box
            sx={{
              p: 1.2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: theme.accentColor, letterSpacing: "0.14em" }}
            >
              성공 기준
            </Typography>
            <Stack spacing={0.65} sx={{ mt: 0.9 }}>
              {primer.successCriteria.map((item) => (
                <Typography
                  key={item}
                  sx={{
                    fontSize: 12,
                    color: "rgba(226, 240, 255, 0.72)",
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
