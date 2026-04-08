import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  getImmersiveExperienceModelOptions,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import {
  buildExperienceMissionPlan,
  getExperienceModelRuntime,
  getExperienceTheme,
} from "@/gui/experience/experienceRuntime";
import { createTacticalExperienceScenario } from "@/gui/experience/tacticalExperience";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";

const TACTICAL_SIM_ENTRY = "/tactical-sim/index.html";
const TACTICAL_SIM_REVISION = "20260405-cesium-tactical-1";

interface FocusFireAirwatchPanelProps {
  objectiveName?: string;
  objectiveLon: number;
  objectiveLat: number;
  onStartBarrage?: () => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  active?: boolean;
  captureProgress?: number;
  aircraftCount?: number;
  artilleryCount?: number;
  armorCount?: number;
  weaponsInFlight?: number;
  statusLabel?: string;
}

export default function FocusFireAirwatchPanel({
  objectiveName,
  objectiveLon,
  objectiveLat,
  onStartBarrage,
  expanded = false,
  onToggleExpanded,
  active = false,
  captureProgress = 0,
  aircraftCount = 0,
  artilleryCount = 0,
  armorCount = 0,
  weaponsInFlight = 0,
  statusLabel = "대기",
}: Readonly<FocusFireAirwatchPanelProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const salvoIntensity = Math.min(1, weaponsInFlight / 12);

  const postFocusFireMessage = (
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

  const triggerVisibleBarrage = (notifyMain = false) => {
    postFocusFireMessage("firescope-focus-fire-command", {
      command: "start-barrage",
      objectiveName,
      bursts: Math.max(
        2,
        Math.min(
          6,
          artilleryCount + Math.ceil(aircraftCount / 2) + Math.ceil(armorCount / 2)
        )
      ),
    });
    if (notifyMain) {
      onStartBarrage?.();
    }
  };
  const asset = useMemo<AssetExperienceSummary>(
    () => ({
      kind: "facility",
      id: "focus-fire-airwatch",
      name: objectiveName ?? "집중포격 목표",
      className: "Chunmoo MRLS",
      sideName: "FOCUS FIRE",
      latitude: objectiveLat,
      longitude: objectiveLon,
      altitude: 160,
      range: 80,
      weaponCount: Math.max(artilleryCount, 1),
    }),
    [artilleryCount, objectiveLat, objectiveLon, objectiveName]
  );
  const theme = useMemo(() => getExperienceTheme("fires"), []);
  const operationMode = "saturation";
  const modelOptions = useMemo(
    () => getImmersiveExperienceModelOptions(asset, "fires"),
    [asset]
  );
  const model = useMemo(
    () =>
      selectImmersiveExperienceModel(asset, "fires") ?? modelOptions[0] ?? null,
    [asset, modelOptions]
  );
  const runtimePayload = useMemo(() => {
    const scenario = createTacticalExperienceScenario(asset, "fires");
    const objectiveSite = scenario.config.sites.find(
      (site) => site.kind === "objective"
    );

    if (objectiveSite) {
      objectiveSite.label = objectiveName ?? "Objective Grid";
    }

    scenario.player.ammoPrimary = Math.max(
      scenario.player.ammoPrimary,
      artilleryCount * 2 + Math.ceil(weaponsInFlight / 2)
    );
    scenario.player.ammoSupport = Math.max(
      scenario.player.ammoSupport,
      aircraftCount + Math.ceil(armorCount / 2) + Math.ceil(weaponsInFlight / 4)
    );
    scenario.config.modeDescription =
      "집중포격 모드 공중 관측. 포대, 기갑, 항공 자산이 목표 지점으로 수렴합니다.";

    return {
      profile: "fires" as const,
      operationMode,
      theme,
      asset,
      model,
      modelRuntime: model ? getExperienceModelRuntime(model, "fires") : null,
      mission: buildExperienceMissionPlan("fires", operationMode, asset, model),
      scenario,
    };
  }, [
    aircraftCount,
    armorCount,
    artilleryCount,
    asset,
    model,
    objectiveName,
    theme,
    weaponsInFlight,
  ]);
  const runtimeKey = useMemo(
    () =>
      [
        "firescope",
        "focus-fire-airwatch",
        objectiveLon.toFixed(4),
        objectiveLat.toFixed(4),
        objectiveName ?? "objective",
      ].join(":"),
    [objectiveLat, objectiveLon, objectiveName]
  );

  useEffect(() => {
    window.sessionStorage.setItem(runtimeKey, JSON.stringify(runtimePayload));

    return () => {
      window.sessionStorage.removeItem(runtimeKey);
    };
  }, [runtimeKey, runtimePayload]);

  useEffect(() => {
    if (!iframeLoaded || !iframeRef.current?.contentWindow) {
      return;
    }

    postFocusFireMessage("firescope-focus-fire-update", {
      objectiveName,
      active,
      captureProgress,
      aircraftCount,
      artilleryCount,
      armorCount,
      weaponsInFlight,
      statusLabel,
    });
  }, [
    active,
    aircraftCount,
    armorCount,
    artilleryCount,
    captureProgress,
    iframeLoaded,
    objectiveName,
    statusLabel,
    weaponsInFlight,
  ]);

  useEffect(() => {
    if (!iframeLoaded) {
      return;
    }

    if (weaponsInFlight > 0) {
      triggerVisibleBarrage(false);
    }
  }, [iframeLoaded, weaponsInFlight]);

  const iframeSrc = `${TACTICAL_SIM_ENTRY}?state=${encodeURIComponent(
    runtimeKey
  )}&rev=${TACTICAL_SIM_REVISION}&profile=fires`;

  return (
    <Box
      sx={{
        position: "absolute",
        left: expanded ? "50%" : "auto",
        top: expanded ? "50%" : "auto",
        right: expanded ? "auto" : { xs: 14, md: 24 },
        bottom: expanded ? "auto" : { xs: 14, md: 22 },
        transform: expanded ? "translate(-50%, -50%)" : "none",
        zIndex: 4,
        width: expanded
          ? { xs: "calc(100% - 28px)", md: "min(78vw, 980px)" }
          : { xs: 250, sm: 320, md: 380 },
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid rgba(255, 183, 77, ${0.3 + salvoIntensity * 0.38})`,
        boxShadow: `0 16px 40px rgba(0, 0, 0, 0.42), 0 0 ${24 + weaponsInFlight * 2}px rgba(255, 140, 66, ${0.12 + salvoIntensity * 0.18})`,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(5, 10, 16, 0.78)",
      }}
    >
      <Stack
        spacing={0.35}
        sx={{
          px: 1.4,
          py: 1.1,
          background:
            "linear-gradient(180deg, rgba(24, 14, 8, 0.92) 0%, rgba(12, 8, 6, 0.72) 100%)",
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: theme.glowColor, letterSpacing: "0.14em" }}
        >
          집중포격 공중 관측
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: "#fff6ec" }}>
              {objectiveName ?? "목표 지점"}
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 246, 236, 0.72)", fontSize: 12.5 }}
            >
              포대 {artilleryCount} / 기갑 {armorCount} / 항공 {aircraftCount} /
              점령 {captureProgress.toFixed(0)}%
            </Typography>
            <Typography
              sx={{
                color: active ? theme.glowColor : "rgba(255, 246, 236, 0.64)",
                fontSize: 11.5,
              }}
            >
              {statusLabel} · 비행 중 탄체 {weaponsInFlight}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={onToggleExpanded}
            sx={{
              minWidth: 88,
              borderColor: "rgba(255, 214, 170, 0.45)",
              color: "#fff2dc",
              backgroundColor: "rgba(44, 20, 6, 0.45)",
              "&:hover": {
                borderColor: "#ffd166",
                backgroundColor: "rgba(76, 30, 8, 0.6)",
              },
            }}
          >
            {expanded ? "축소" : "크게 보기"}
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ position: "relative" }}>
        <Box
          component="iframe"
          ref={iframeRef}
          title="집중포격 공중 관측"
          src={iframeSrc}
          onLoad={() => setIframeLoaded(true)}
          sx={{
            display: "block",
            width: "100%",
            height: expanded
              ? { xs: 260, sm: 360, md: 520 }
              : { xs: 170, sm: 210, md: 230 },
            border: 0,
            backgroundColor: "#000",
            pointerEvents: "none",
          }}
        />
        <Button
          size="small"
          variant="contained"
          disabled={!iframeLoaded}
          onClick={() => triggerVisibleBarrage(true)}
          sx={{
            position: "absolute",
            right: 10,
            bottom: 10,
            minWidth: 98,
            fontWeight: 700,
            color: "#1d0b00",
            background:
              "linear-gradient(180deg, rgba(255, 191, 111, 0.98) 0%, rgba(255, 129, 61, 0.96) 100%)",
            boxShadow: "0 8px 20px rgba(255, 140, 66, 0.35)",
            "&:hover": {
              background:
                "linear-gradient(180deg, rgba(255, 208, 137, 1) 0%, rgba(255, 145, 83, 0.98) 100%)",
            },
          }}
        >
          포격 시작
        </Button>
      </Box>
    </Box>
  );
}
