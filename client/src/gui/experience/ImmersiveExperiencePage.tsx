import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LaunchIcon from "@mui/icons-material/Launch";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import BundleModelViewport from "@/gui/experience/BundleModelViewport";
import ImmersiveAssetViewport from "@/gui/experience/ImmersiveAssetViewport";
import {
  AssetExperienceSummary,
  inferAircraftExperienceCraft,
} from "@/gui/experience/assetExperience";
import {
  BundleModelSelection,
  getImmersiveExperienceModelOptions,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import {
  buildImmersiveModeBrief,
  buildImmersiveOperationsDeck,
  getDefaultImmersiveOperationMode,
  getImmersiveOperationOptions,
} from "@/gui/experience/immersiveOperations";
import {
  ImmersiveExperienceProfile,
  ImmersiveExperienceRoute,
} from "@/gui/experience/immersiveExperience";
import {
  buildExperienceMissionPlan,
  getExperienceTheme,
} from "@/gui/experience/experienceRuntime";
import {
  preloadBundleViewer,
  preloadTacticalSim,
} from "@/gui/experience/modelPreload";
import { getDisplayName } from "@/utils/koreanCatalog";

interface ImmersiveExperiencePageProps {
  route: ImmersiveExperienceRoute | null;
  onBack: () => void;
  onBackToMap: () => void;
  openFlightSimPage: (center?: number[], craft?: string) => void;
  openTacticalSimPage: (
    asset: AssetExperienceSummary,
    profile: ImmersiveExperienceProfile,
    options?: {
      modelId?: string;
      operationMode?: string;
    }
  ) => void;
  backLabel?: string;
}

function formatNumber(value: number | undefined, fractionDigits = 0) {
  if (value === undefined) return "N/A";

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function buildTelemetry(asset: AssetExperienceSummary) {
  return [
    {
      label: "분류",
      value: getDisplayName(asset.className),
      hint: "현재 자산 분류",
    },
    {
      label: "좌표",
      value: `${asset.latitude.toFixed(2)}, ${asset.longitude.toFixed(2)}`,
      hint: "현재 전술 위치",
    },
    {
      label: "고도",
      value: `${formatNumber(asset.altitude)} FT`,
      hint: "배치 기준 고도",
    },
    {
      label: asset.range !== undefined ? "유효 범위" : "세력",
      value:
        asset.range !== undefined
          ? `${formatNumber(asset.range)} NM`
          : asset.sideName,
      hint:
        asset.range !== undefined ? "탐지 또는 교전 거리" : "작전 편성 세력",
    },
    {
      label: asset.speed !== undefined ? "속도" : "무장",
      value:
        asset.speed !== undefined
          ? `${formatNumber(asset.speed, 1)} KTS`
          : `${formatNumber(asset.weaponCount)} TYPE`,
      hint: asset.speed !== undefined ? "즉시 기동 성능" : "연동 무기 체계 수",
    },
  ];
}

function buildFocusList(profile: ImmersiveExperienceProfile) {
  switch (profile) {
    case "ground":
      return ["기동축 확인", "차체/포탑 실루엣 비교", "정면 교전 방향 체감"];
    case "fires":
      return ["발사 축 추적", "포대/런처 배치 감각", "화력 집중 방향 확인"];
    case "defense":
      return ["레이더 스윕 확인", "요격축 체감", "배터리 방어 범위 시각화"];
    case "maritime":
      return [
        "해상 감시 축 확인",
        "구축함·항모·잠수함 실루엣 비교",
        "항주 방향과 전투단 역할 체감",
      ];
    case "base":
      return [
        "활주/이동 축 확인",
        "전투기·헬기·드론 주기 배치 비교",
        "격납·관제·출격 흐름 확인",
      ];
  }
}

function buildModelDeckTitle(profile: ImmersiveExperienceProfile) {
  switch (profile) {
    case "maritime":
      return "함정 모델 선택";
    case "base":
      return "주둔 자산 선택";
    case "ground":
      return "지상 플랫폼 선택";
    case "fires":
      return "화력 플랫폼 선택";
    case "defense":
      return "방공 플랫폼 선택";
  }
}

function buildModelDeckDescription(profile: ImmersiveExperienceProfile) {
  switch (profile) {
    case "maritime":
      return "구축함, 항모, 잠수함을 다중 선택해 전투단 구성을 비교합니다.";
    case "base":
      return "전투기, 헬기, 드론을 다중 선택해 비행단 구성을 비교합니다.";
    case "ground":
      return "장갑차/지휘차/전차 모델을 고르고 기동 구성을 비교합니다.";
    case "fires":
      return "포병, 런처, 미사일 계열을 묶어서 화력 구성을 비교합니다.";
    case "defense":
      return "Patriot, NASAMS, THAAD 등 방공 체계를 함께 비교합니다.";
  }
}

function buildComparisonDeckTitle(profile: ImmersiveExperienceProfile) {
  switch (profile) {
    case "maritime":
      return "Task Group Gallery";
    case "base":
      return "Flight Line Gallery";
    case "ground":
      return "Platform Gallery";
    case "fires":
      return "Battery Gallery";
    case "defense":
      return "Defense Gallery";
  }
}

function buildComparisonDeckDescription(profile: ImmersiveExperienceProfile) {
  switch (profile) {
    case "maritime":
      return "선택한 함형을 한 번에 띄워서 함대 구성을 비교합니다.";
    case "base":
      return "선택한 항공자산을 한 번에 띄워서 기지 라인업을 비교합니다.";
    case "ground":
      return "선택한 지상 플랫폼을 한 번에 띄워서 차체 구성을 비교합니다.";
    case "fires":
      return "선택한 화력 플랫폼을 한 번에 띄워서 포대 구성을 비교합니다.";
    case "defense":
      return "선택한 방공 체계를 한 번에 띄워서 방어 계층을 비교합니다.";
  }
}

function buildViewportControls(hasBundleModel: boolean) {
  if (hasBundleModel) {
    return [
      "`Drag`: 3D 모델 회전",
      "`Wheel`: 확대 / 축소",
      "`모델 선택`: 기준 플랫폼 전환",
      "`Mission Mode`: 작전 모드 변경",
      "`비교 토글`: 다중 비교 라인업 구성",
      "`시뮬레이터 시작`: 실제 3D 지도 페이지 진입",
      "`지도 복귀`: 메인 화면 복귀",
    ];
  }

  return [
    "`Drag`: 궤도 회전",
    "`Wheel`, `Q/E`: 확대 축소",
    "`W/S`: 시점 상하 조정",
    "`A/D`: 방위 회전",
    "`Space`: 자동 모션 토글",
    "`Enter`: 전술 액션 펄스",
    "`R`: 시점 초기화",
  ];
}

function buildInitialSelectedModelIds(modelOptions: BundleModelSelection[]) {
  return modelOptions.map((model) => model.id);
}

const EMPTY_MODEL_OPTIONS: BundleModelSelection[] = [];

export default function ImmersiveExperiencePage({
  route,
  onBack,
  onBackToMap,
  openFlightSimPage,
  openTacticalSimPage,
  backLabel = "쇼룸으로",
}: Readonly<ImmersiveExperiencePageProps>) {
  const asset = route?.asset ?? null;
  const profile = route?.profile ?? null;
  const preferredModel =
    route && asset && profile
      ? selectImmersiveExperienceModel(asset, profile)
      : null;
  const modelOptions =
    route && asset && profile
      ? getImmersiveExperienceModelOptions(asset, profile)
      : EMPTY_MODEL_OPTIONS;
  const requestedModel =
    route?.modelId && modelOptions.length > 0
      ? (modelOptions.find((model) => model.id === route.modelId) ?? null)
      : null;
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    requestedModel?.id ?? preferredModel?.id ?? modelOptions[0]?.id ?? null
  );
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(
    buildInitialSelectedModelIds(modelOptions)
  );
  const [operationMode, setOperationMode] = useState<string>(
    profile ? getDefaultImmersiveOperationMode(profile) : "breakthrough"
  );
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setSelectedModelId(
      requestedModel?.id ?? preferredModel?.id ?? modelOptions[0]?.id ?? null
    );
    setSelectedModelIds(buildInitialSelectedModelIds(modelOptions));
    setShowGuide(false);
    if (profile) {
      setOperationMode(getDefaultImmersiveOperationMode(profile));
    }
  }, [
    asset?.id,
    requestedModel?.id,
    preferredModel?.id,
    modelOptions,
    profile,
  ]);

  const selectedModels = modelOptions.filter((model) =>
    selectedModelIds.includes(model.id)
  );

  const activeModel =
    modelOptions.find((model) => model.id === selectedModelId) ??
    selectedModels[0] ??
    preferredModel ??
    null;

  useEffect(() => {
    void preloadBundleViewer(activeModel);
    void preloadTacticalSim(activeModel);
  }, [activeModel]);

  if (!route) {
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
            몰입형 시뮬레이션 대상을 찾지 못했습니다.
          </Typography>
          <Typography sx={{ color: "rgba(255, 244, 244, 0.78)" }}>
            자산 상세 페이지에서 다시 진입해야 합니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={onBackToMap}
          >
            지도 복귀
          </Button>
        </Stack>
      </Box>
    );
  }

  const resolvedAsset = route.asset;
  const resolvedProfile = route.profile;
  const theme = getExperienceTheme(resolvedProfile);
  const telemetry = buildTelemetry(resolvedAsset);
  const operationOptions = getImmersiveOperationOptions(resolvedProfile);
  const operationsDeck = buildImmersiveOperationsDeck(
    resolvedAsset,
    resolvedProfile,
    activeModel,
    selectedModels,
    operationMode
  );
  const modeBrief = buildImmersiveModeBrief(
    resolvedProfile,
    operationMode,
    selectedModels
  );
  const missionPlan = buildExperienceMissionPlan(
    resolvedProfile,
    operationMode,
    resolvedAsset,
    activeModel
  );
  const viewportControls = buildViewportControls(Boolean(activeModel));

  const handleToggleModel = (modelId: string) => {
    const isSelected = selectedModelIds.includes(modelId);

    if (isSelected) {
      if (selectedModelIds.length === 1) {
        return;
      }

      const nextIds = selectedModelIds.filter((id) => id !== modelId);
      setSelectedModelIds(nextIds);

      if (selectedModelId === modelId) {
        setSelectedModelId(nextIds[0] ?? null);
      }

      return;
    }

    setSelectedModelIds([...selectedModelIds, modelId]);
    setSelectedModelId(modelId);
  };

  const handleSelectAllModels = () => {
    setSelectedModelIds(buildInitialSelectedModelIds(modelOptions));
  };

  const handleSelectPrimaryOnly = () => {
    const targetId =
      selectedModelId ?? preferredModel?.id ?? modelOptions[0]?.id ?? null;

    if (!targetId) {
      return;
    }

    setSelectedModelIds([targetId]);
    setSelectedModelId(targetId);
  };

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
      {activeModel ? (
        <BundleModelViewport
          selection={activeModel}
          assetName={resolvedAsset.name}
          accentColor={theme.accentColor}
          glowColor={theme.glowColor}
          mode="immersive"
          viewerChrome="minimal"
          showBadge={false}
          sx={{ position: "absolute", inset: 0 }}
        />
      ) : (
        <ImmersiveAssetViewport
          profile={resolvedProfile}
          assetKind={resolvedAsset.kind}
          assetName={resolvedAsset.name}
          accentColor={theme.accentColor}
          glowColor={theme.glowColor}
        />
      )}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          height: "100%",
          p: { xs: 2, md: 3 },
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack
            spacing={1.1}
            sx={{
              maxWidth: 640,
              p: { xs: 2, md: 2.5 },
              borderRadius: 4,
              backdropFilter: "blur(16px)",
              backgroundColor: "rgba(7, 14, 24, 0.54)",
              border: "1px solid rgba(176, 220, 255, 0.14)",
              pointerEvents: "auto",
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: theme.accentColor,
                letterSpacing: "0.18em",
                fontFamily: "AceCombat, Bahnschrift, sans-serif",
              }}
            >
              {theme.labOverline}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                lineHeight: 0.98,
                fontFamily: "AceCombat, Bahnschrift, sans-serif",
              }}
            >
              {missionPlan.briefingTitle}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {resolvedAsset.name}
            </Typography>
            {showGuide && (
              <Typography sx={{ color: "rgba(226, 240, 255, 0.82)" }}>
                {missionPlan.briefingSummary} 현재 선택은 `
                {activeModel?.label ?? getDisplayName(resolvedAsset.className)}`
                기준으로 실전 맵에 연결됩니다.
              </Typography>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1.1}
            useFlexGap
            flexWrap="wrap"
            sx={{ pointerEvents: "auto" }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
            >
              {backLabel}
            </Button>
            <Button
              variant="contained"
              startIcon={<LaunchIcon />}
              onClick={() =>
                openTacticalSimPage(resolvedAsset, resolvedProfile, {
                  modelId: activeModel?.id,
                  operationMode,
                })
              }
              sx={{
                backgroundColor: theme.accentColor,
                color: "#08111b",
                fontWeight: 800,
              }}
            >
              {missionPlan.launchLabel}
            </Button>
            <Button
              variant={showGuide ? "contained" : "outlined"}
              startIcon={<MenuBookOutlinedIcon />}
              onClick={() => setShowGuide((current) => !current)}
              sx={
                showGuide
                  ? {
                      backgroundColor: "rgba(238, 247, 255, 0.14)",
                      color: "#eef7ff",
                      borderColor: "rgba(176, 220, 255, 0.22)",
                    }
                  : undefined
              }
            >
              {showGuide ? "가이드 숨기기" : "가이드 보기"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<MapOutlinedIcon />}
              onClick={onBackToMap}
            >
              지도 복귀
            </Button>
            {resolvedAsset.kind === "aircraft" && (
              <Button
                variant="outlined"
                startIcon={<LaunchIcon />}
                onClick={() =>
                  openFlightSimPage(
                    [resolvedAsset.longitude, resolvedAsset.latitude],
                    inferAircraftExperienceCraft(resolvedAsset.className)
                  )
                }
              >
                항공 시뮬레이터 열기
              </Button>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "320px 1fr 300px" },
            alignItems: "start",
            gap: 2,
            mt: 2,
          }}
        >
          <Stack spacing={1.6} sx={{ pointerEvents: "auto" }}>
            {showGuide && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: "rgba(6, 12, 22, 0.56)",
                  border: "1px solid rgba(176, 220, 255, 0.12)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Core Loop
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 1 }}>
                  {missionPlan.coreLoops.map((item) => (
                    <Typography
                      key={item}
                      sx={{ color: "rgba(226, 240, 255, 0.78)" }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
            {showGuide && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: "rgba(6, 12, 22, 0.56)",
                  border: "1px solid rgba(176, 220, 255, 0.12)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Page Identity
                </Typography>
                <Stack spacing={0.9} sx={{ mt: 1 }}>
                  <Typography>운용 역할: {missionPlan.operatorRole}</Typography>
                  <Typography>화면 성격: {missionPlan.pageIdentity}</Typography>
                  <Typography>환경: {missionPlan.environmentLabel}</Typography>
                  <Typography>HUD: {missionPlan.hudModeLabel}</Typography>
                  {activeModel && (
                    <Typography>3D 모델: {activeModel.label}</Typography>
                  )}
                  <Typography>세력: {resolvedAsset.sideName}</Typography>
                </Stack>
              </Box>
            )}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "rgba(6, 12, 22, 0.56)",
                border: "1px solid rgba(176, 220, 255, 0.12)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
              >
                {buildModelDeckTitle(resolvedProfile)}
              </Typography>
              {showGuide && (
                <Typography
                  sx={{
                    mt: 0.6,
                    mb: 1.2,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.72)",
                  }}
                >
                  {buildModelDeckDescription(resolvedProfile)}
                </Typography>
              )}
              <Stack
                direction="row"
                spacing={0.8}
                useFlexGap
                flexWrap="wrap"
                sx={{ mb: 1.2 }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectAllModels}
                  sx={{ borderColor: "rgba(176, 220, 255, 0.2)" }}
                >
                  전체 선택
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectPrimaryOnly}
                  disabled={!activeModel}
                  sx={{ borderColor: "rgba(176, 220, 255, 0.2)" }}
                >
                  기준만 보기
                </Button>
                <Typography
                  sx={{
                    ml: "auto",
                    alignSelf: "center",
                    fontSize: 12,
                    color: "rgba(226, 240, 255, 0.72)",
                  }}
                >
                  {selectedModels.length} / {modelOptions.length} 선택
                </Typography>
              </Stack>
              <Stack
                spacing={1}
                sx={{
                  maxHeight: { xs: 260, xl: 340 },
                  overflowY: "auto",
                  pr: 0.4,
                }}
              >
                {modelOptions.map((model) => {
                  const isActive = model.id === activeModel?.id;
                  const isSelected = selectedModelIds.includes(model.id);

                  return (
                    <Box
                      key={model.id}
                      sx={{
                        p: 0.8,
                        borderRadius: 2.4,
                        backgroundColor: isSelected
                          ? "rgba(13, 24, 38, 0.82)"
                          : "rgba(9, 17, 28, 0.5)",
                        border: isActive
                          ? `1px solid ${theme.accentColor}`
                          : "1px solid rgba(176, 220, 255, 0.12)",
                      }}
                    >
                      <Stack direction="row" spacing={0.8}>
                        <Button
                          variant={isActive ? "contained" : "outlined"}
                          onClick={() => setSelectedModelId(model.id)}
                          sx={{
                            flex: 1,
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            textAlign: "left",
                            textTransform: "none",
                            px: 1.2,
                            py: 1.05,
                            borderColor: "rgba(176, 220, 255, 0.2)",
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
                          <Stack
                            spacing={0.35}
                            sx={{ alignItems: "flex-start" }}
                          >
                            <Typography sx={{ fontWeight: 800 }}>
                              {model.label}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: isActive
                                  ? "rgba(7, 17, 27, 0.74)"
                                  : "rgba(226, 240, 255, 0.72)",
                              }}
                            >
                              {model.note}
                            </Typography>
                          </Stack>
                        </Button>
                        <Button
                          size="small"
                          variant={isSelected ? "contained" : "outlined"}
                          onClick={() => handleToggleModel(model.id)}
                          sx={{
                            minWidth: 76,
                            flexShrink: 0,
                            borderColor: "rgba(176, 220, 255, 0.2)",
                            backgroundColor: isSelected
                              ? theme.glowColor
                              : "transparent",
                            color: isSelected ? "#08111b" : "#eef7ff",
                            fontWeight: 700,
                          }}
                        >
                          {isSelected ? "선택됨" : "비교"}
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Stack>

          {showGuide && (
            <Stack spacing={1.6} sx={{ pointerEvents: "auto" }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: "rgba(6, 12, 22, 0.56)",
                  border: "1px solid rgba(176, 220, 255, 0.12)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Mission Phases
                </Typography>
                <Typography
                  sx={{
                    mt: 0.6,
                    mb: 1.2,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.72)",
                  }}
                >
                  페이지마다 같은 HUD를 쓰지 않도록, 시작부터 자유 시뮬레이션
                  전환까지의 흐름을 단계별로 고정합니다.
                </Typography>
                <Stack spacing={1.1}>
                  {missionPlan.missionPhases.map((phase, index) => (
                    <Box
                      key={phase.id}
                      sx={{
                        p: 1.2,
                        borderRadius: 2.4,
                        backgroundColor: "rgba(9, 17, 28, 0.58)",
                        border: "1px solid rgba(176, 220, 255, 0.12)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography sx={{ fontWeight: 800 }}>
                          {index + 1}. {phase.title}
                        </Typography>
                        <Typography
                          sx={{
                            px: 1,
                            py: 0.35,
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 800,
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            color: theme.accentColor,
                          }}
                        >
                          {phase.cameraCue.toUpperCase()}
                        </Typography>
                      </Stack>
                      <Typography sx={{ mt: 0.7, fontSize: 13 }}>
                        {phase.objective}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 12,
                          color: "rgba(226, 240, 255, 0.7)",
                        }}
                      >
                        {phase.instruction}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.45,
                          fontSize: 12,
                          color: "rgba(226, 240, 255, 0.62)",
                        }}
                      >
                        {phase.successHint}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: "rgba(6, 12, 22, 0.56)",
                  border: "1px solid rgba(176, 220, 255, 0.12)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Interface Layout
                </Typography>
                <Stack spacing={1.15} sx={{ mt: 1.1 }}>
                  {missionPlan.interfaceBlocks.map((item) => (
                    <Box key={item.title}>
                      <Typography
                        sx={{
                          fontSize: 11,
                          letterSpacing: "0.12em",
                          color: theme.accentColor,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography sx={{ mt: 0.3, fontWeight: 800 }}>
                        {missionPlan.title}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 12,
                          color: "rgba(226, 240, 255, 0.7)",
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}

          <Stack spacing={1.6} sx={{ pointerEvents: "auto" }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                alignSelf: "start",
                backgroundColor: "rgba(6, 12, 22, 0.56)",
                border: "1px solid rgba(176, 220, 255, 0.12)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
              >
                Mission Mode
              </Typography>
              {showGuide && (
                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.72)",
                  }}
                >
                  {missionPlan.missionStatement}
                </Typography>
              )}
              {showGuide && (
                <Typography
                  sx={{
                    mt: 0.8,
                    fontSize: 12,
                    color: "rgba(226, 240, 255, 0.62)",
                  }}
                >
                  {modeBrief}
                </Typography>
              )}
              <Stack spacing={0.9} sx={{ mt: 1.2 }}>
                {operationOptions.map((option) => {
                  const isActive = option.id === operationMode;

                  return (
                    <Button
                      key={option.id}
                      variant={isActive ? "contained" : "outlined"}
                      onClick={() => setOperationMode(option.id)}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        textTransform: "none",
                        px: 1.2,
                        py: 1,
                        borderColor: "rgba(176, 220, 255, 0.2)",
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
                      <Stack spacing={0.25} sx={{ alignItems: "flex-start" }}>
                        <Typography sx={{ fontWeight: 800 }}>
                          {option.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: isActive
                              ? "rgba(7, 17, 27, 0.74)"
                              : "rgba(226, 240, 255, 0.72)",
                          }}
                        >
                          {option.note}
                        </Typography>
                      </Stack>
                    </Button>
                  );
                })}
              </Stack>
            </Box>
            {showGuide && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  alignSelf: "start",
                  backgroundColor: "rgba(6, 12, 22, 0.56)",
                  border: "1px solid rgba(176, 220, 255, 0.12)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Controls
                </Typography>
                <Stack
                  spacing={0.85}
                  sx={{ mt: 1, color: "rgba(226, 240, 255, 0.82)" }}
                >
                  {viewportControls.map((control) => (
                    <Typography key={control}>{control}</Typography>
                  ))}
                </Stack>
              </Box>
            )}
            {showGuide && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  alignSelf: "start",
                  backgroundColor: "rgba(6, 12, 22, 0.56)",
                  border: "1px solid rgba(176, 220, 255, 0.12)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Selection Snapshot
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: "rgba(9, 17, 28, 0.48)",
                      border: "1px solid rgba(176, 220, 255, 0.08)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      자유 시뮬레이션 전환
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 12,
                        color: "rgba(226, 240, 255, 0.68)",
                      }}
                    >
                      {missionPlan.freePlayLabel}
                    </Typography>
                  </Box>
                  {operationsDeck.map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "rgba(9, 17, 28, 0.48)",
                        border: "1px solid rgba(176, 220, 255, 0.08)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 700 }}>
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 12,
                          color: "rgba(226, 240, 255, 0.68)",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                  {selectedModels.map((model) => (
                    <Box
                      key={model.id}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "rgba(9, 17, 28, 0.48)",
                        border: "1px solid rgba(176, 220, 255, 0.08)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 700 }}>
                        {model.label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 12,
                          color: "rgba(226, 240, 255, 0.68)",
                        }}
                      >
                        {model.note}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: 1.4,
            pb: { xs: 1, md: 0 },
          }}
        >
          {telemetry.map((item) => (
            <Box
              key={item.label}
              sx={{
                p: 1.8,
                borderRadius: 3,
                backdropFilter: "blur(14px)",
                backgroundColor: "rgba(6, 12, 22, 0.56)",
                border: "1px solid rgba(176, 220, 255, 0.12)",
                pointerEvents: "auto",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
              >
                {item.label}
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 800 }}>
                {item.value}
              </Typography>
              {showGuide && (
                <Typography
                  sx={{
                    mt: 0.6,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.7)",
                  }}
                >
                  {item.hint}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
