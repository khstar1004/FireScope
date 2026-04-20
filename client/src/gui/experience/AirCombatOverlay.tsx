import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RadarRoundedIcon from "@mui/icons-material/RadarRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import AutoAwesomeMotionRoundedIcon from "@mui/icons-material/AutoAwesomeMotionRounded";
import Game, { type BattleSpectatorSnapshot } from "@/game/Game";
import { preloadStaticAsset, preloadTacticalSim } from "@/gui/experience/modelPreload";
import {
  buildTacticalSimRuntimePayload,
  type TacticalSimRuntimePayload,
} from "@/gui/experience/tacticalRuntimePayload";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";
import { getImmersiveOperationOptions } from "@/gui/experience/immersiveOperations";
import { getDisplayName } from "@/utils/koreanCatalog";

const TACTICAL_SIM_ENTRY = "/tactical-sim/index.html";
const TACTICAL_SIM_APP = "/tactical-sim/app.js";
const TACTICAL_SIM_REVISION = "20260420-air-combat-overlay-v1";

type AssetState = "checking" | "ready" | "missing";

interface AirCombatOverlayProps {
  route: TacticalSimRoute | null;
  onClose: () => void;
  game?: Game;
  continueSimulation?: boolean;
}

function formatKnots(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${Math.round(value)} kt`;
}

function formatFuel(current?: number, max?: number) {
  if (
    current === undefined ||
    max === undefined ||
    !Number.isFinite(current) ||
    !Number.isFinite(max)
  ) {
    return "N/A";
  }

  return `${Math.round(current)} / ${Math.round(max)}`;
}

function formatRange(range?: number) {
  if (range === undefined || !Number.isFinite(range)) {
    return "N/A";
  }

  return `${Math.round(range)} nm`;
}

function formatSensorRange(sensorRangeM: number) {
  return sensorRangeM >= 1000
    ? `${(sensorRangeM / 1000).toFixed(1)} km`
    : `${Math.round(sensorRangeM)} m`;
}

function providerLabel() {
  return (import.meta.env.VITE_MAPTILER_DEFAULT_KEY ??
    import.meta.env.MAPTILER_API_KEY)
    ? "Cesium + MapTiler"
    : "Cesium + OSM";
}

function commandButtonSx(accentColor: string) {
  return {
    justifyContent: "flex-start",
    px: 1.4,
    py: 1.05,
    borderRadius: 2.8,
    color: "#eef7ff",
    borderColor: "rgba(173, 217, 255, 0.16)",
    background:
      "linear-gradient(180deg, rgba(6, 18, 28, 0.92), rgba(6, 18, 28, 0.76))",
    backdropFilter: "blur(16px)",
    textTransform: "none",
    fontWeight: 700,
    "&:hover": {
      borderColor: `${accentColor}88`,
      backgroundColor: "rgba(11, 26, 40, 0.96)",
    },
  };
}

export default function AirCombatOverlay({
  route,
  onClose,
  game,
  continueSimulation = false,
}: Readonly<AirCombatOverlayProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const liveSnapshotSignatureRef = useRef<string>("");
  const initialViewAppliedRef = useRef(false);
  const [assetState, setAssetState] = useState<AssetState>("checking");
  const [iframeReady, setIframeReady] = useState(false);
  const [liveSnapshot, setLiveSnapshot] = useState<
    BattleSpectatorSnapshot | undefined
  >(() =>
    typeof game?.getBattleSpectatorSnapshot === "function"
      ? game.getBattleSpectatorSnapshot()
      : undefined
  );

  const runtimePayload = useMemo<TacticalSimRuntimePayload | null>(
    () => (route ? buildTacticalSimRuntimePayload(route, liveSnapshot) : null),
    [liveSnapshot, route]
  );
  const runtimeKey = useMemo(() => {
    if (!route) {
      return null;
    }

    return [
      "firescope",
      "air-combat",
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
    initialViewAppliedRef.current = false;
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
      if (!runtimePayload) {
        return;
      }

      setAssetState("checking");

      try {
        await preloadTacticalSim(runtimePayload.model);
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
  }, [runtimePayload]);

  const sendRuntimeCommand = (command: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "firescope-tactical-command",
        payload: { command },
      },
      window.location.origin
    );
  };

  const sendRuntimeCommandSequence = (commands: string[], delayMs = 90) => {
    commands.forEach((command, index) => {
      window.setTimeout(() => {
        sendRuntimeCommand(command);
      }, index * delayMs);
    });
  };

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
        type: "firescope-tactical-runtime-update",
        payload: runtimePayload,
      },
      window.location.origin
    );
  }, [assetState, runtimePayload]);

  useEffect(() => {
    if (
      assetState !== "ready" ||
      !iframeReady ||
      initialViewAppliedRef.current ||
      !runtimePayload
    ) {
      return;
    }

    initialViewAppliedRef.current = true;
    const timerId = window.setTimeout(() => {
      sendRuntimeCommandSequence(
        route?.asset.kind === "aircraft"
          ? ["mission-view", "chase-view"]
          : ["mission-view"]
      );
    }, 320);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [assetState, iframeReady, route?.asset.kind, runtimePayload]);

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

  useEffect(() => {
    if (!route) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, button, [contenteditable="true"]'
        )
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (assetState !== "ready") {
        return;
      }

      if (key === "1") {
        event.preventDefault();
        sendRuntimeCommandSequence(["mission-view", "chase-view"]);
      } else if (key === "2") {
        event.preventDefault();
        sendRuntimeCommand("showcase-view");
      } else if (key === "3") {
        event.preventDefault();
        sendRuntimeCommand("threat-view");
      } else if (key === "m") {
        event.preventDefault();
        sendRuntimeCommand("overview");
      } else if (key === "t") {
        event.preventDefault();
        sendRuntimeCommand("next-target");
      } else if (key === "f") {
        event.preventDefault();
        sendRuntimeCommand("fire-primary");
      } else if (key === "r") {
        event.preventDefault();
        sendRuntimeCommand("fire-support");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [assetState, onClose, route]);

  if (!route || !runtimePayload || !runtimeKey) {
    return null;
  }

  const operationLabel =
    getImmersiveOperationOptions(route.profile).find(
      (option) => option.id === route.operationMode
    )?.label ?? route.operationMode;
  const runtimeStatusLabel =
    assetState === "ready"
      ? iframeReady
        ? "LIVE LINK"
        : "SYNCING"
      : assetState === "checking"
        ? "WARMING UP"
        : "MISSING";
  const accentColor = runtimePayload.theme.accentColor;
  const iframeSrc = `${TACTICAL_SIM_ENTRY}?${new URLSearchParams({
    state: runtimeKey,
    rev: TACTICAL_SIM_REVISION,
    profile: route.profile,
  }).toString()}`;
  const commandButtons = [
    {
      key: "chase",
      label: "추적 시점",
      hint: "전투기 후방에서 바로 추적",
      action: () => sendRuntimeCommandSequence(["mission-view", "chase-view"]),
      icon: <TrackChangesRoundedIcon fontSize="small" />,
    },
    {
      key: "threat",
      label: "표적 추적",
      hint: "선택 위협에 시점 고정",
      action: () => sendRuntimeCommand("threat-view"),
      icon: <RadarRoundedIcon fontSize="small" />,
    },
    {
      key: "orbit",
      label: "오비트",
      hint: "모델 주위를 360도로 확인",
      action: () => sendRuntimeCommand("showcase-view"),
      icon: <AutoAwesomeMotionRoundedIcon fontSize="small" />,
    },
    {
      key: "next",
      label: "다음 표적",
      hint: "위협 순환",
      action: () => sendRuntimeCommand("next-target"),
      icon: <TrackChangesRoundedIcon fontSize="small" />,
    },
    {
      key: "primary",
      label: "주무장 발사",
      hint: "기본 교전",
      action: () => sendRuntimeCommand("fire-primary"),
      icon: <RocketLaunchRoundedIcon fontSize="small" />,
    },
    {
      key: "support",
      label: "지원무장 발사",
      hint: "확장 교전",
      action: () => sendRuntimeCommand("fire-support"),
      icon: <RocketLaunchRoundedIcon fontSize="small" />,
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1800,
        overflow: "hidden",
        background: "#02070d",
      }}
    >
      {assetState === "ready" ? (
        <Box
          component="iframe"
          ref={iframeRef}
          title={`${runtimePayload.theme.opsTitle} tactical overlay`}
          src={iframeSrc}
          onLoad={() => setIframeReady(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            backgroundColor: "#000",
          }}
        />
      ) : (
        <Stack
          spacing={1.6}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 32%, rgba(24, 37, 49, 0.84), rgba(2, 7, 13, 0.96))",
            color: "#eef7ff",
          }}
        >
          {assetState === "checking" ? (
            <>
              <CircularProgress sx={{ color: accentColor }} />
              <Typography sx={{ fontWeight: 700 }}>
                3D 지도 런타임을 예열하는 중입니다.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                전술 런타임 자산을 찾지 못했습니다.
              </Typography>
              <Typography sx={{ color: "rgba(238, 247, 255, 0.72)" }}>
                `client/public/tactical-sim` 정적 파일 상태를 확인해야 합니다.
              </Typography>
            </>
          )}
        </Stack>
      )}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 56%, transparent 0%, transparent 42%, rgba(2, 7, 13, 0.08) 62%, rgba(2, 7, 13, 0.58) 100%), linear-gradient(180deg, rgba(2, 7, 13, 0.82) 0%, rgba(2, 7, 13, 0.08) 18%, rgba(2, 7, 13, 0.12) 72%, rgba(2, 7, 13, 0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: { xs: 1.4, md: 2.2 },
          pointerEvents: "none",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "flex-start" }}
          spacing={1.2}
        >
          <Stack
            spacing={1}
            sx={{
              width: { xs: "100%", lg: 520 },
              maxWidth: "100%",
              p: { xs: 1.45, md: 1.8 },
              borderRadius: 4,
              border: `1px solid ${accentColor}33`,
              background:
                "linear-gradient(180deg, rgba(4, 12, 20, 0.92), rgba(4, 12, 20, 0.72))",
              backdropFilter: "blur(22px)",
              boxShadow: "0 28px 72px rgba(0, 0, 0, 0.36)",
              pointerEvents: "auto",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    color: accentColor,
                    fontFamily: "AceCombat, Bahnschrift, sans-serif",
                  }}
                >
                  AIR COMBAT LINK
                </Typography>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: { xs: 28, md: 38 },
                    fontWeight: 900,
                    lineHeight: 0.95,
                    color: "#eef7ff",
                    fontFamily: "AceCombat, Bahnschrift, sans-serif",
                  }}
                >
                  {runtimePayload.asset.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 13.2,
                    color: "rgba(238, 247, 255, 0.78)",
                  }}
                >
                  {getDisplayName(runtimePayload.asset.className)} · {operationLabel}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<CloseRoundedIcon />}
                onClick={onClose}
                sx={{
                  flexShrink: 0,
                  color: "#eef7ff",
                  borderColor: "rgba(238, 247, 255, 0.16)",
                }}
              >
                종료
              </Button>
            </Stack>

            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
              {[runtimeStatusLabel, providerLabel(), runtimePayload.liveRuntime.source === "battle-snapshot" ? "LIVE BATTLE" : "DEMO SORTIE"].map(
                (item, index) => (
                  <Box
                    key={item}
                    sx={{
                      px: 1.05,
                      py: 0.5,
                      borderRadius: 999,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backgroundColor:
                        index === 0 ? `${accentColor}16` : "rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10.8,
                        letterSpacing: "0.12em",
                        color: index === 0 ? accentColor : "rgba(238, 247, 255, 0.76)",
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                )
              )}
            </Stack>

            <Typography sx={{ fontSize: 13, color: "rgba(238, 247, 255, 0.72)" }}>
              {runtimePayload.scenario.config.modeDescription}
            </Typography>

            <Stack direction="row" spacing={0.9} useFlexGap flexWrap="wrap">
              {[
                {
                  label: "속도",
                  value: formatKnots(runtimePayload.asset.speed),
                },
                {
                  label: "센서",
                  value: formatSensorRange(runtimePayload.scenario.config.sensorRangeM),
                },
                {
                  label: "항속",
                  value: formatRange(runtimePayload.asset.range),
                },
                {
                  label: "연료",
                  value: formatFuel(
                    runtimePayload.asset.currentFuel,
                    runtimePayload.asset.maxFuel
                  ),
                },
              ].map((metric) => (
                <Box
                  key={metric.label}
                  sx={{
                    minWidth: 92,
                    px: 1.1,
                    py: 0.75,
                    borderRadius: 2.4,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 10.4, color: "rgba(238, 247, 255, 0.58)" }}
                  >
                    {metric.label}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                    {metric.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>

          <Stack
            spacing={0.95}
            sx={{
              width: { xs: "100%", md: 320 },
              pointerEvents: "auto",
            }}
          >
            {commandButtons.map((button) => (
              <Button
                key={button.key}
                variant="outlined"
                onClick={button.action}
                startIcon={button.icon}
                disabled={assetState !== "ready"}
                sx={commandButtonSx(accentColor)}
              >
                <Stack alignItems="flex-start" spacing={0.15}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                    {button.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11.2,
                      color: "rgba(238, 247, 255, 0.62)",
                    }}
                  >
                    {button.hint}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.2}
          alignItems={{ xs: "stretch", lg: "flex-end" }}
          justifyContent="space-between"
        >
          <Stack
            spacing={0.6}
            sx={{
              width: { xs: "100%", lg: 360 },
              p: { xs: 1.2, md: 1.45 },
              borderRadius: 3,
              border: `1px solid ${accentColor}26`,
              background:
                "linear-gradient(180deg, rgba(4, 12, 20, 0.92), rgba(4, 12, 20, 0.72))",
              backdropFilter: "blur(20px)",
              pointerEvents: "auto",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.8,
                letterSpacing: "0.16em",
                color: accentColor,
              }}
            >
              HOT KEYS
            </Typography>
            <Typography sx={{ fontSize: 12.2, color: "rgba(238, 247, 255, 0.74)" }}>
              `1` 추적 시점 · `2` 오비트 · `3` 표적 추적 · `T` 다음 표적
            </Typography>
            <Typography sx={{ fontSize: 12.2, color: "rgba(238, 247, 255, 0.74)" }}>
              `F` 주무장 · `R` 지원무장 · `M` 전장 개요 · `Esc` 종료
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.8}
            useFlexGap
            flexWrap="wrap"
            justifyContent={{ xs: "flex-start", lg: "flex-end" }}
            sx={{ pointerEvents: "auto" }}
          >
            {[
              runtimePayload.scenario.config.primaryWeapon.label,
              runtimePayload.scenario.config.supportWeapon.label,
              `${runtimePayload.scenario.config.hostileContacts.length} TRACKS`,
              `${runtimePayload.scenario.config.sites.length} ZONES`,
            ].map((chip) => (
              <Box
                key={chip}
                sx={{
                  px: 1.05,
                  py: 0.58,
                  borderRadius: 999,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.6,
                    letterSpacing: "0.1em",
                    color: "rgba(238, 247, 255, 0.72)",
                  }}
                >
                  {chip}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
