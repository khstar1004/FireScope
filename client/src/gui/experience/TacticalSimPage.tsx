import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import {
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
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";
import { getDisplayName } from "@/utils/koreanCatalog";

const TACTICAL_SIM_ENTRY = "/tactical-sim/index.html";
const TACTICAL_SIM_APP = "/tactical-sim/app.js";
const TACTICAL_SIM_REVISION = "20260407-defense-map-bootstrap-fix";

type AssetState = "checking" | "ready" | "missing";

interface TacticalSimPageProps {
  route: TacticalSimRoute | null;
  onBack: () => void;
  onBackToMap: () => void;
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
}

function resolveModel(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  modelId?: string
) {
  const modelOptions = getImmersiveExperienceModelOptions(asset, profile);
  const preferredModel = selectImmersiveExperienceModel(asset, profile);

  return (
    modelOptions.find((model) => model.id === modelId) ??
    preferredModel ??
    modelOptions[0] ??
    null
  );
}

function buildRuntimePayload(
  route: TacticalSimRoute
): TacticalSimRuntimePayload {
  const theme = getExperienceTheme(route.profile);
  const model = resolveModel(route.asset, route.profile, route.modelId);
  const mission = buildExperienceMissionPlan(
    route.profile,
    route.operationMode,
    route.asset,
    model
  );
  const scenario = createTacticalExperienceScenario(route.asset, route.profile);

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
  };
}

function formatSensorRange(sensorRangeM: number) {
  return sensorRangeM >= 1000
    ? `${(sensorRangeM / 1000).toFixed(1)} km`
    : `${Math.round(sensorRangeM)} m`;
}

function buildRuntimeHint(profile: ImmersiveExperienceProfile) {
  if (profile === "defense") {
    return "360 모델에서 드래그하면 방공 자산 주위를 회전하며 실제 3D 모델을 확인할 수 있습니다.";
  }

  return "360 모델에서 드래그하면 자산 주위를 회전하고, 휠로 확대·축소할 수 있습니다.";
}

export default function TacticalSimPage({
  route,
  onBack,
  onBackToMap,
}: Readonly<TacticalSimPageProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [assetState, setAssetState] = useState<AssetState>("checking");
  const runtimePayload = useMemo(
    () => (route ? buildRuntimePayload(route) : null),
    [route]
  );
  const runtimeKey = useMemo(() => {
    if (!route) {
      return null;
    }

    return [
      "firescope",
      "tactical-sim",
      route.asset.id,
      route.profile,
      route.operationMode,
      route.modelId ?? "default",
    ].join(":");
  }, [route]);

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
            소개 페이지에서 다시 `시뮬레이터 시작`으로 진입해야 합니다.
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
      ? "런타임 준비 완료"
      : assetState === "checking"
        ? "런타임 예열 중"
        : "런타임 파일 확인 필요";

  const sendRuntimeCommand = (command: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "firescope-tactical-command",
        payload: { command },
      },
      window.location.origin
    );
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
            "linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 32%, rgba(0, 0, 0, 0.16) 100%)",
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
          width: { xs: "calc(100% - 24px)", sm: 380, md: 420 },
          maxWidth: "calc(100vw - 24px)",
          p: { xs: 1.6, md: 2 },
          borderRadius: 3,
          backdropFilter: "blur(18px)",
          backgroundColor: "rgba(7, 14, 24, 0.74)",
          border: "1px solid rgba(176, 220, 255, 0.16)",
          boxShadow: "0 18px 48px rgba(0, 0, 0, 0.32)",
          pointerEvents: "auto",
        }}
      >
        <Stack spacing={1.4}>
          <Stack direction="row" justifyContent="space-between" spacing={1.2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.18em" }}
              >
                {theme.opsOverline}
              </Typography>
              <Typography
                variant="h5"
                sx={{ mt: 0.2, fontWeight: 900, lineHeight: 1.05 }}
              >
                {theme.opsTitle}
              </Typography>
              <Typography
                sx={{
                  mt: 0.55,
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
            <Box
              sx={{
                px: 1.1,
                py: 0.55,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                color: theme.accentColor,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {runtimeStatusLabel}
            </Box>
            <Box
              sx={{
                px: 1.1,
                py: 0.55,
                borderRadius: 999,
                fontSize: 12,
                color: "rgba(226, 240, 255, 0.8)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {operationOption?.label ?? route.operationMode}
            </Box>
            <Box
              sx={{
                px: 1.1,
                py: 0.55,
                borderRadius: 999,
                fontSize: 12,
                color: "rgba(226, 240, 255, 0.8)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {providerLabel}
            </Box>
          </Stack>

          <Typography sx={{ fontSize: 13, color: "rgba(226, 240, 255, 0.8)" }}>
            {modeBrief}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(226, 240, 255, 0.68)" }}>
            {primer.threatSummary}
          </Typography>

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
                  borderRadius: 2,
                  backgroundColor: "rgba(9, 17, 28, 0.56)",
                  border: "1px solid rgba(176, 220, 255, 0.1)",
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

          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
            <Button
              size="small"
              variant="contained"
              disabled={!canControlRuntime}
              onClick={() => sendRuntimeCommand("mission-view")}
              sx={{ backgroundColor: theme.accentColor, color: "#07111b" }}
            >
              임무 시작
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
              전장
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={!canControlRuntime}
              onClick={() => sendRuntimeCommand("showcase-view")}
              sx={{
                borderColor: "rgba(214, 227, 188, 0.24)",
                color: "#eef7ff",
              }}
            >
              360 모델
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
              표적 추적
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

          <Typography sx={{ fontSize: 12, color: "rgba(226, 240, 255, 0.68)" }}>
            {buildRuntimeHint(route.profile)} 휠은 확대·축소, 지도 클릭은 우선
            표적 지정에 사용합니다.
          </Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(226, 240, 255, 0.56)" }}>
            {mission.operatorRole} · {mission.hudModeLabel}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
