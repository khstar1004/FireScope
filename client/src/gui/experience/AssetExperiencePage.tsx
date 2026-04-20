import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LaunchIcon from "@mui/icons-material/Launch";
import AssetExperienceViewer from "@/gui/experience/AssetExperienceViewer";
import BundleModelViewport from "@/gui/experience/BundleModelViewport";
import {
  AssetExperienceKind,
  AssetExperienceSummary,
  inferAircraftExperienceCraft,
} from "@/gui/experience/assetExperience";
import { buildBundleViewerSceneProps } from "@/gui/experience/bundleSceneProps";
import {
  getImmersiveExperienceModelOptions,
  selectAssetExperienceModel,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import {
  preloadBundleViewer,
  preloadTacticalSim,
} from "@/gui/experience/modelPreload";
import {
  getImmersiveExperienceLabel,
  inferImmersiveExperienceProfile,
} from "@/gui/experience/immersiveExperience";
import {
  type DefenseVisualizationPolicy,
  resolveDefenseVisualizationPolicy,
} from "@/utils/airDefenseModeling";
import { getDisplayName } from "@/utils/koreanCatalog";

interface AssetExperiencePageProps {
  asset: AssetExperienceSummary | null;
  onBack: () => void;
  openFlightSimPage: (center?: number[], craft?: string) => void;
  openImmersiveExperiencePage: (
    asset: AssetExperienceSummary,
    profile?: ReturnType<typeof inferImmersiveExperienceProfile>,
    options?: {
      modelId?: string;
    }
  ) => void;
}

interface MetricCard {
  label: string;
  value: string;
  hint: string;
  fill: number;
}

interface ThemeConfig {
  overline: string;
  title: string;
  description: string;
  accentColor: string;
  glowColor: string;
  background: string;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function formatNumber(value: number | undefined, fractionDigits = 0) {
  if (value === undefined) return "N/A";
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function getTheme(kind: AssetExperienceKind): ThemeConfig {
  switch (kind) {
    case "aircraft":
      return {
        overline: "FIRE SCOPE AIR COMBAT LAB",
        title: "전투기 3D 쇼룸",
        description:
          "속도, 고도, 탐지 범위와 무장 구성을 한 화면에서 확인하고, 3D 프로파일로 자산 특성을 바로 비교합니다.",
        accentColor: "#7dc7ff",
        glowColor: "#57f0ff",
        background:
          "radial-gradient(circle at top, #14304f 0%, #08111f 42%, #04070d 100%)",
      };
    case "ship":
      return {
        overline: "FIRE SCOPE MARITIME LAB",
        title: "함정 3D 쇼룸",
        description:
          "해상 자산의 속도, 감시 범위, 탑재 전력을 3D 실루엣과 함께 확인합니다.",
        accentColor: "#69d4ff",
        glowColor: "#3df0d4",
        background:
          "radial-gradient(circle at top, #10374b 0%, #08131d 44%, #03070b 100%)",
      };
    case "weapon":
      return {
        overline: "FIRE SCOPE STRIKE LAB",
        title: "무기 3D 쇼룸",
        description:
          "유도무기 속도, 사거리, 명중력을 3D 시각화와 함께 빠르게 비교할 수 있습니다.",
        accentColor: "#ff9a5a",
        glowColor: "#ffd866",
        background:
          "radial-gradient(circle at top, #432612 0%, #130d0a 42%, #050404 100%)",
      };
    case "facility":
      return {
        overline: "FIRE SCOPE DEFENSE LAB",
        title: "시설 3D 쇼룸",
        description:
          "방공/레이더 시설의 배치 구조와 탐지 범위를 3D 전술 패널로 확인합니다.",
        accentColor: "#95ffa0",
        glowColor: "#5bf0d2",
        background:
          "radial-gradient(circle at top, #17381d 0%, #0b130d 44%, #040705 100%)",
      };
    case "airbase":
      return {
        overline: "FIRE SCOPE BASE OPERATIONS LAB",
        title: "기지 3D 쇼룸",
        description:
          "출격 거점의 고도와 탑재 자산 현황을 3D 운영 보드로 확인합니다.",
        accentColor: "#d4b87c",
        glowColor: "#8fe1ff",
        background:
          "radial-gradient(circle at top, #3e3420 0%, #120f0b 44%, #050403 100%)",
      };
  }
}

function buildMetrics(asset: AssetExperienceSummary): MetricCard[] {
  switch (asset.kind) {
    case "aircraft":
      return [
        {
          label: "속도",
          value: `${formatNumber(asset.speed)} KTS`,
          hint: "최대 성능 체감",
          fill: clamp01((asset.speed ?? 0) / 2000),
        },
        {
          label: "고도",
          value: `${formatNumber(asset.altitude)} FT`,
          hint: "운용 고도",
          fill: clamp01(asset.altitude / 50000),
        },
        {
          label: "탐지 범위",
          value: `${formatNumber(asset.range)} NM`,
          hint: "센서 커버리지",
          fill: clamp01((asset.range ?? 0) / 250),
        },
        {
          label: "연료 잔량",
          value:
            asset.currentFuel !== undefined && asset.maxFuel !== undefined
              ? `${formatNumber(asset.currentFuel)} / ${formatNumber(asset.maxFuel)} LBS`
              : "N/A",
          hint: "지속 전투 시간",
          fill: clamp01(
            asset.currentFuel !== undefined && asset.maxFuel
              ? asset.currentFuel / asset.maxFuel
              : 0
          ),
        },
        {
          label: "연료 소모",
          value: `${formatNumber(asset.fuelRate)} LBS/HR`,
          hint: "고속 운용 부담",
          fill: clamp01((asset.fuelRate ?? 0) / 12000),
        },
        {
          label: "탑재 무장",
          value: `${formatNumber(asset.weaponCount)} EA`,
          hint: "즉시 사용 가능 수량",
          fill: clamp01((asset.weaponCount ?? 0) / 12),
        },
      ];
    case "ship":
      return [
        {
          label: "속도",
          value: `${formatNumber(asset.speed, 1)} KTS`,
          hint: "기동 능력",
          fill: clamp01((asset.speed ?? 0) / 60),
        },
        {
          label: "탐지 범위",
          value: `${formatNumber(asset.range)} NM`,
          hint: "해상 감시 범위",
          fill: clamp01((asset.range ?? 0) / 300),
        },
        {
          label: "연료 잔량",
          value:
            asset.currentFuel !== undefined && asset.maxFuel !== undefined
              ? `${formatNumber(asset.currentFuel)} / ${formatNumber(asset.maxFuel)} LBS`
              : "N/A",
          hint: "지속 작전 능력",
          fill: clamp01(
            asset.currentFuel !== undefined && asset.maxFuel
              ? asset.currentFuel / asset.maxFuel
              : 0
          ),
        },
        {
          label: "연료 소모",
          value: `${formatNumber(asset.fuelRate)} LBS/HR`,
          hint: "고속 항해 부담",
          fill: clamp01((asset.fuelRate ?? 0) / 1000000),
        },
        {
          label: "탑재 항공기",
          value: `${formatNumber(asset.aircraftCount)} EA`,
          hint: "함재기 운용 여력",
          fill: clamp01((asset.aircraftCount ?? 0) / 24),
        },
        {
          label: "무장 수",
          value: `${formatNumber(asset.weaponCount)} TYPE`,
          hint: "장착 무장 종류",
          fill: clamp01((asset.weaponCount ?? 0) / 12),
        },
      ];
    case "weapon":
      return [
        {
          label: "속도",
          value: `${formatNumber(asset.speed)} KTS`,
          hint: "종말 속도 기준",
          fill: clamp01((asset.speed ?? 0) / 4000),
        },
        {
          label: "교전 사거리",
          value: `${formatNumber(asset.range)} NM`,
          hint: "도달 가능 구간",
          fill: clamp01((asset.range ?? 0) / 300),
        },
        {
          label: "명중력",
          value:
            asset.lethality !== undefined
              ? `${formatNumber(asset.lethality * 100)}%`
              : "N/A",
          hint: "격파 기대치",
          fill: clamp01(asset.lethality ?? 0),
        },
        {
          label: "잔여 수량",
          value:
            asset.currentQuantity !== undefined &&
            asset.maxQuantity !== undefined
              ? `${formatNumber(asset.currentQuantity)} / ${formatNumber(asset.maxQuantity)}`
              : "N/A",
          hint: "현재 인벤토리",
          fill: clamp01(
            asset.currentQuantity !== undefined && asset.maxQuantity
              ? asset.currentQuantity / asset.maxQuantity
              : 0
          ),
        },
        {
          label: "연료 잔량",
          value:
            asset.currentFuel !== undefined && asset.maxFuel !== undefined
              ? `${formatNumber(asset.currentFuel)} / ${formatNumber(asset.maxFuel)} LBS`
              : "N/A",
          hint: "비행 지속 시간",
          fill: clamp01(
            asset.currentFuel !== undefined && asset.maxFuel
              ? asset.currentFuel / asset.maxFuel
              : 0
          ),
        },
        {
          label: "연료 소모",
          value: `${formatNumber(asset.fuelRate)} LBS/HR`,
          hint: "추진 부담",
          fill: clamp01((asset.fuelRate ?? 0) / 400),
        },
      ];
    case "facility":
      return [
        {
          label: "탐지 범위",
          value: `${formatNumber(asset.range)} NM`,
          hint: "영역 감시 능력",
          fill: clamp01((asset.range ?? 0) / 300),
        },
        {
          label: "배치 고도",
          value: `${formatNumber(asset.altitude)} FT`,
          hint: "지형 기준 고도",
          fill: clamp01(asset.altitude / 8000),
        },
        {
          label: "무장 수",
          value: `${formatNumber(asset.weaponCount)} TYPE`,
          hint: "연동 무기 체계",
          fill: clamp01((asset.weaponCount ?? 0) / 16),
        },
      ];
    case "airbase":
      return [
        {
          label: "기지 고도",
          value: `${formatNumber(asset.altitude)} FT`,
          hint: "활주 조건",
          fill: clamp01(asset.altitude / 8000),
        },
        {
          label: "탑재 항공기",
          value: `${formatNumber(asset.aircraftCount)} EA`,
          hint: "출격 준비 자산",
          fill: clamp01((asset.aircraftCount ?? 0) / 24),
        },
      ];
  }
}

function getStatusPills(asset: AssetExperienceSummary) {
  const pills = [
    `세력 ${asset.sideName}`,
    `분류 ${getDisplayName(asset.className)}`,
  ];

  if (asset.missionName) {
    pills.push(`임무 ${asset.missionName}`);
  }
  if (asset.weaponCount !== undefined) {
    pills.push(`무장 ${formatNumber(asset.weaponCount)}종`);
  }
  if (asset.aircraftCount !== undefined) {
    pills.push(`탑재 ${formatNumber(asset.aircraftCount)}대`);
  }

  return pills;
}

function buildVisualizationPolicyDetails(policy: DefenseVisualizationPolicy) {
  const specLabel =
    policy.threatRangeNm !== null && policy.detectionArcDegrees !== null
      ? `${policy.threatRangeNm} NM / ${policy.detectionArcDegrees}°`
      : policy.reasonLabel;
  const presentationLabel =
    policy.mode === "closest" && policy.proxyModelLabel
      ? `${policy.proxyModelLabel} 프록시`
      : `${policy.categoryLabel} 개념형`;

  return [
    { label: "방공 계층", value: policy.categoryLabel },
    { label: "표현 방식", value: presentationLabel },
    ...(policy.mode === "concept"
      ? [{ label: "개념 형상", value: policy.silhouetteLabel }]
      : []),
    { label: "제원 기준", value: specLabel },
    ...(policy.sourceLabel
      ? [{ label: "자료 근거", value: policy.sourceLabel }]
      : []),
  ];
}

export default function AssetExperiencePage({
  asset,
  onBack,
  openFlightSimPage,
  openImmersiveExperiencePage,
}: Readonly<AssetExperiencePageProps>) {
  const immersiveProfile = asset
    ? inferImmersiveExperienceProfile(asset)
    : "ground";
  const bundleModel = asset ? selectAssetExperienceModel(asset) : null;
  const immersiveModelOptions =
    asset && asset.kind !== "aircraft"
      ? getImmersiveExperienceModelOptions(asset, immersiveProfile)
      : bundleModel
        ? [bundleModel]
        : [];
  const preferredImmersiveModel = asset
    ? asset.kind === "aircraft"
      ? bundleModel
      : selectImmersiveExperienceModel(asset, immersiveProfile)
    : null;
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    preferredImmersiveModel?.id ??
      immersiveModelOptions[0]?.id ??
      bundleModel?.id ??
      null
  );

  useEffect(() => {
    setSelectedModelId(
      preferredImmersiveModel?.id ??
        immersiveModelOptions[0]?.id ??
        bundleModel?.id ??
        null
    );
  }, [
    asset?.id,
    bundleModel?.id,
    preferredImmersiveModel?.id,
    immersiveModelOptions,
  ]);

  const activeModel =
    immersiveModelOptions.find((model) => model.id === selectedModelId) ??
    preferredImmersiveModel ??
    bundleModel ??
    null;
  const sceneProps = useMemo(
    () =>
      asset && activeModel
        ? buildBundleViewerSceneProps(asset, activeModel, "detail")
        : [],
    [activeModel, asset]
  );

  useEffect(() => {
    void preloadBundleViewer(activeModel, sceneProps);
    void preloadTacticalSim(activeModel);
  }, [activeModel?.path, sceneProps]);

  if (!asset) {
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
        <Stack
          spacing={2}
          sx={{
            maxWidth: 520,
            p: 4,
            borderRadius: 4,
            backgroundColor: "rgba(20, 13, 13, 0.82)",
            border: "1px solid rgba(255, 173, 173, 0.18)",
          }}
        >
          <Typography variant="overline" sx={{ letterSpacing: "0.18em" }}>
            FIRE SCOPE EXPERIENCE
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            3D 쇼룸 대상을 찾지 못했습니다.
          </Typography>
          <Typography sx={{ color: "rgba(255, 244, 244, 0.8)" }}>
            지도에서 자산을 다시 선택한 뒤 3D 보기로 진입해야 합니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ alignSelf: "flex-start" }}
          >
            지도 복귀
          </Button>
        </Stack>
      </Box>
    );
  }

  const theme = getTheme(asset.kind);
  const metrics = buildMetrics(asset);
  const statusPills = getStatusPills(asset);
  const immersiveLabel = getImmersiveExperienceLabel(immersiveProfile);
  const defenseVisualizationPolicy =
    asset.kind === "facility"
      ? resolveDefenseVisualizationPolicy(asset.className, asset.name)
      : null;
  const visualizationPolicyDetails = defenseVisualizationPolicy
    ? buildVisualizationPolicyDetails(defenseVisualizationPolicy)
    : [];
  const conceptVariant =
    !activeModel && asset.kind === "facility"
      ? defenseVisualizationPolicy?.conceptVariant
      : !activeModel && asset.kind === "airbase"
        ? "airbase"
        : undefined;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: theme.background,
        color: "#eef7ff",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 28%, rgba(127, 199, 255, 0.06) 72%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "380px minmax(0, 1fr)" },
          gap: 2.5,
          minHeight: "100%",
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack
          spacing={2}
          sx={{
            p: { xs: 2.25, md: 3 },
            borderRadius: 4,
            backdropFilter: "blur(16px)",
            backgroundColor: "rgba(6, 12, 22, 0.7)",
            border: "1px solid rgba(154, 212, 255, 0.14)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.32)",
            alignSelf: "start",
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: theme.accentColor,
                  letterSpacing: "0.18em",
                  fontFamily: "AceCombat, Bahnschrift, sans-serif",
                }}
              >
                {theme.overline}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  fontFamily: "AceCombat, Bahnschrift, sans-serif",
                }}
              >
                {theme.title}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                height: "fit-content",
                color: "#eef7ff",
                borderColor: "rgba(200, 228, 255, 0.3)",
              }}
            >
              돌아가기
            </Button>
          </Stack>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {asset.name}
            </Typography>
            <Typography sx={{ mt: 0.5, color: "rgba(226, 240, 255, 0.76)" }}>
              {getDisplayName(asset.className)}
            </Typography>
          </Box>

          <Typography sx={{ color: "rgba(226, 240, 255, 0.82)" }}>
            {theme.description}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {statusPills.map((pill) => (
              <Box
                key={pill}
                sx={{
                  px: 1.25,
                  py: 0.7,
                  borderRadius: 999,
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  color: "#f0f8ff",
                  backgroundColor: "rgba(14, 26, 43, 0.72)",
                  border: "1px solid rgba(154, 212, 255, 0.14)",
                }}
              >
                {pill}
              </Box>
            ))}
          </Stack>

          {immersiveModelOptions.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "rgba(8, 16, 28, 0.68)",
                border: "1px solid rgba(154, 212, 255, 0.12)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.18em" }}
              >
                Showroom Model
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  mb: 1.2,
                  fontSize: 13,
                  color: "rgba(226, 240, 255, 0.74)",
                }}
              >
                여기서 고른 3D 모델이 그대로 다음 작전 브리프와 실전
                시뮬레이터로 연결됩니다.
              </Typography>
              <Stack spacing={0.9}>
                {immersiveModelOptions.map((model) => {
                  const isActive = model.id === activeModel?.id;

                  return (
                    <Button
                      key={model.id}
                      variant={isActive ? "contained" : "outlined"}
                      onClick={() => setSelectedModelId(model.id)}
                      sx={{
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        textAlign: "left",
                        textTransform: "none",
                        px: 1.2,
                        py: 1,
                        borderColor: "rgba(154, 212, 255, 0.18)",
                        backgroundColor: isActive
                          ? theme.accentColor
                          : "rgba(9, 17, 28, 0.35)",
                        color: isActive ? "#07111b" : "#eef7ff",
                        "&:hover": {
                          backgroundColor: isActive
                            ? theme.glowColor
                            : "rgba(17, 29, 44, 0.78)",
                          borderColor: theme.accentColor,
                        },
                      }}
                    >
                      <Stack spacing={0.35} sx={{ alignItems: "flex-start" }}>
                        <Typography sx={{ fontWeight: 800 }}>
                          {model.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: isActive
                              ? "rgba(7, 17, 27, 0.72)"
                              : "rgba(226, 240, 255, 0.72)",
                          }}
                        >
                          {model.note}
                        </Typography>
                      </Stack>
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          )}

          {visualizationPolicyDetails.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "rgba(8, 16, 28, 0.68)",
                border: "1px solid rgba(143, 225, 255, 0.14)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.18em" }}
              >
                Visualization Policy
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  mb: 1.2,
                  fontSize: 13,
                  color: "rgba(226, 240, 255, 0.74)",
                }}
              >
                {defenseVisualizationPolicy?.description}
              </Typography>
              <Stack spacing={1.05}>
                {visualizationPolicyDetails.map((detail) => (
                  <Box
                    key={detail.label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography sx={{ color: "rgba(226, 240, 255, 0.72)" }}>
                      {detail.label}
                    </Typography>
                    <Typography
                      sx={{ maxWidth: 220, textAlign: "right", fontWeight: 700 }}
                    >
                      {detail.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap">
            {asset.kind === "aircraft" && (
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                onClick={() => {
                  openFlightSimPage(
                    [asset.longitude, asset.latitude],
                    inferAircraftExperienceCraft(asset.className)
                  );
                }}
                sx={{
                  backgroundColor: theme.accentColor,
                  color: "#07111b",
                  fontWeight: 800,
                }}
              >
                항공 시뮬레이터 열기
              </Button>
            )}
            {asset.kind !== "aircraft" && (
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                onClick={() =>
                  openImmersiveExperiencePage(asset, immersiveProfile, {
                    modelId: activeModel?.id,
                  })
                }
                sx={{
                  backgroundColor: theme.accentColor,
                  color: "#07111b",
                  fontWeight: 800,
                }}
              >
                {immersiveLabel} 열기
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={onBack}
              sx={{
                color: "#eef7ff",
                borderColor: "rgba(200, 228, 255, 0.24)",
              }}
            >
              지도에서 계속 보기
            </Button>
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: "rgba(8, 16, 28, 0.68)",
              border: "1px solid rgba(154, 212, 255, 0.12)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: theme.accentColor, letterSpacing: "0.18em" }}
            >
              Tactical Snapshot
            </Typography>
            <Stack spacing={1.15} sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography sx={{ color: "rgba(226, 240, 255, 0.72)" }}>
                  좌표
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {asset.latitude.toFixed(2)}, {asset.longitude.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography sx={{ color: "rgba(226, 240, 255, 0.72)" }}>
                  고도
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {formatNumber(asset.altitude)} FT
                </Typography>
              </Box>
              {asset.heading !== undefined && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ color: "rgba(226, 240, 255, 0.72)" }}>
                    방위
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {formatNumber(asset.heading, 2)}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography sx={{ color: "rgba(226, 240, 255, 0.72)" }}>
                  자산 ID
                </Typography>
                <Typography
                  sx={{
                    maxWidth: 210,
                    textAlign: "right",
                    fontWeight: 700,
                    wordBreak: "break-all",
                  }}
                >
                  {asset.id}
                </Typography>
              </Box>
              {activeModel && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ color: "rgba(226, 240, 255, 0.72)" }}>
                    연결 모델
                  </Typography>
                  <Typography
                    sx={{ maxWidth: 210, textAlign: "right", fontWeight: 700 }}
                  >
                    {activeModel.label}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={2.5}>
          {activeModel ? (
            <BundleModelViewport
              selection={activeModel}
              assetName={asset.name}
              accentColor={theme.accentColor}
              glowColor={theme.glowColor}
              viewerChrome="minimal"
              sceneProps={sceneProps}
              sx={{
                minHeight: { xs: 360, md: 520 },
                borderRadius: 4,
                border: "1px solid rgba(135, 190, 255, 0.18)",
                background:
                  "linear-gradient(180deg, rgba(9, 16, 28, 0.96), rgba(5, 10, 18, 0.98))",
                boxShadow: "0 28px 80px rgba(0, 0, 0, 0.45)",
              }}
            />
          ) : (
            <AssetExperienceViewer
              kind={asset.kind}
              conceptVariant={conceptVariant}
              accentColor={theme.accentColor}
              glowColor={theme.glowColor}
            />
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {metrics.map((metric) => (
              <Box
                key={metric.label}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: "rgba(7, 14, 24, 0.74)",
                  border: "1px solid rgba(154, 212, 255, 0.12)",
                  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: theme.accentColor, letterSpacing: "0.14em" }}
                  >
                    {metric.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 800 }}>
                    {metric.value}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.72)",
                  }}
                >
                  {metric.hint}
                </Typography>
                <Box
                  sx={{
                    mt: 1.6,
                    height: 7,
                    borderRadius: 999,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${metric.fill * 100}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${theme.accentColor}, ${theme.glowColor})`,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
