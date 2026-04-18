import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LaunchIcon from "@mui/icons-material/Launch";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import Game, { type BattleSpectatorSnapshot } from "@/game/Game";
import BundleModelViewport, {
  type BundleViewerComparisonSelection,
} from "@/gui/experience/BundleModelViewport";
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
import { buildBundleViewerSceneProps } from "@/gui/experience/bundleSceneProps";
import {
  buildDigitalTwinLineup,
  buildDigitalTwinSummary,
} from "@/gui/experience/digitalTwinState";
import { buildImmersiveLiveTwinRuntime } from "@/gui/experience/immersiveLiveTwin";
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
  game?: Game;
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
  if (value === undefined) {
    return "N/A";
  }

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
      hint: "현재 선택 자산 유형",
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
        asset.range !== undefined ? "탐지 또는 교전 기준 거리" : "현재 작전 편성",
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
      return ["차체 높이와 전폭", "포탑 회전축과 정면 노출각", "돌파축 또는 엄호축 시야"];
    case "fires":
      return ["발사 자세와 포구 방향", "포대 간 간격과 축 정렬", "살보 이후 착탄 연출 흐름"];
    case "defense":
      return ["레이더 감시 방향", "발사기 고각과 배치 간격", "계층 방어 반경과 빈 구역"];
    case "maritime":
      return ["함형 실루엣과 갑판 구성", "전투단 간격과 호위 위치", "진행축 대비 무장 배치"];
    case "base":
      return ["주기 라인 배치", "격납과 출격 동선", "기지 방호와 대응 자산 위치"];
  }
}

function buildCompareSummary(
  activeModel: BundleModelSelection | null,
  comparisonModels: BundleModelSelection[]
) {
  if (!activeModel) {
    return "연결된 3D 모델 없음";
  }

  if (comparisonModels.length === 0) {
    return `${activeModel.label} 단일 집중 감상`;
  }

  return `${activeModel.label} 기준으로 ${comparisonModels.length + 1}종 플랫폼 비교`;
}

function buildStatusChips(
  postureLabel: string,
  operationLabel: string | undefined,
  compareSummary: string,
  liveSourceLabel?: string
) {
  return [
    operationLabel ?? "작전 모드",
    `POSTURE ${postureLabel}`,
    compareSummary,
    liveSourceLabel ?? "SHOWCASE LINK",
  ];
}

const EMPTY_MODEL_OPTIONS: BundleModelSelection[] = [];
const MAX_VIEWPORT_COMPARISON_MODELS = 4;

export default function ImmersiveExperiencePage({
  route,
  game,
  onBack,
  onBackToMap,
  openFlightSimPage,
  openTacticalSimPage,
  backLabel = "쇼룸으로",
}: Readonly<ImmersiveExperiencePageProps>) {
  const liveSnapshotSignatureRef = useRef<string>("");
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
  const [comparisonModelIds, setComparisonModelIds] = useState<string[]>([]);
  const [operationMode, setOperationMode] = useState<string>(
    profile ? getDefaultImmersiveOperationMode(profile) : "breakthrough"
  );
  const [showGuide, setShowGuide] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [liveSnapshot, setLiveSnapshot] = useState<
    BattleSpectatorSnapshot | undefined
  >(() =>
    typeof game?.getBattleSpectatorSnapshot === "function"
      ? game.getBattleSpectatorSnapshot()
      : undefined
  );

  useEffect(() => {
    setSelectedModelId(
      requestedModel?.id ?? preferredModel?.id ?? modelOptions[0]?.id ?? null
    );
    setComparisonModelIds([]);
    setShowGuide(false);
    setShowComparison(false);
    setShowBackdrop(false);
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

  useEffect(() => {
    setComparisonModelIds((current) =>
      current.filter(
        (modelId) =>
          modelId !== selectedModelId &&
          modelOptions.some((model) => model.id === modelId)
      )
    );
  }, [modelOptions, selectedModelId]);

  useEffect(() => {
    liveSnapshotSignatureRef.current = "";
    setLiveSnapshot(
      typeof game?.getBattleSpectatorSnapshot === "function"
        ? game.getBattleSpectatorSnapshot()
        : undefined
    );
  }, [game, route?.asset.id]);

  const activeModel =
    modelOptions.find((model) => model.id === selectedModelId) ??
    preferredModel ??
    modelOptions[0] ??
    null;
  const comparisonModels = modelOptions
    .filter(
      (model) =>
        comparisonModelIds.includes(model.id) && model.id !== activeModel?.id
    )
    .slice(0, MAX_VIEWPORT_COMPARISON_MODELS);
  const activeComparisonModels = showComparison ? comparisonModels : [];
  const selectedModelsForDeck = activeModel
    ? [activeModel, ...activeComparisonModels]
    : activeComparisonModels;
  const sceneProps = useMemo(
    () =>
      showBackdrop && asset && activeModel
        ? buildBundleViewerSceneProps(asset, activeModel, "immersive")
        : [],
    [activeModel, asset, showBackdrop]
  );
  const comparisonSelections =
    useMemo<BundleViewerComparisonSelection[]>(
      () =>
        activeComparisonModels.map((model) => ({
          id: model.id,
          bundle: model.bundle,
          path: model.path,
          label: model.label,
        })),
      [activeComparisonModels]
    );
  const syntheticDigitalTwinLineup = useMemo(
    () =>
      asset && profile
        ? buildDigitalTwinLineup(
            asset,
            profile,
            activeModel,
            selectedModelsForDeck,
            operationMode
          )
        : [],
    [activeModel, asset, operationMode, profile, selectedModelsForDeck]
  );
  const syntheticDigitalTwinSummary = useMemo(
    () =>
      asset && profile
        ? buildDigitalTwinSummary(asset, profile, syntheticDigitalTwinLineup)
        : {
            headline: "Digital Twin",
            postureLabel: "AMBER",
            readinessPct: 0,
            logisticsPct: 0,
            coveragePct: 0,
            warning: "",
          },
    [asset, profile, syntheticDigitalTwinLineup]
  );
  const liveTwinRuntime = useMemo(
    () =>
      asset && profile
        ? buildImmersiveLiveTwinRuntime(
            liveSnapshot,
            asset,
            profile,
            activeModel,
            selectedModelsForDeck,
            operationMode
          )
        : null,
    [
      activeModel,
      asset,
      liveSnapshot,
      operationMode,
      profile,
      selectedModelsForDeck,
    ]
  );
  const runtimeAsset = liveTwinRuntime?.focusAsset ?? asset;
  const digitalTwinSummary =
    liveTwinRuntime?.summary ?? syntheticDigitalTwinSummary;
  const liveFeed = liveTwinRuntime?.feed ?? null;

  useEffect(() => {
    void preloadBundleViewer(activeModel, sceneProps, comparisonSelections);
    void preloadTacticalSim(activeModel);
  }, [activeModel, comparisonSelections, sceneProps]);

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
        recentEventId: nextSnapshot.recentEvents.at(-1)?.id ?? null,
        focusUnit: focusUnit
          ? [
              focusUnit.id,
              focusUnit.modelId ?? null,
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

  if (!route || !asset || !profile) {
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
            브리프 대상을 찾지 못했습니다.
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

  const resolvedAsset = asset;
  const resolvedProfile = profile;
  const resolvedRuntimeAsset = runtimeAsset ?? resolvedAsset;
  const theme = getExperienceTheme(resolvedProfile);
  const telemetry = buildTelemetry(resolvedRuntimeAsset);
  const operationOptions = getImmersiveOperationOptions(resolvedProfile);
  const selectedOperationOption = operationOptions.find(
    (option) => option.id === operationMode
  );
  const operationsDeck = buildImmersiveOperationsDeck(
    resolvedRuntimeAsset,
    resolvedProfile,
    activeModel,
    selectedModelsForDeck,
    operationMode
  );
  const modeBrief = buildImmersiveModeBrief(
    resolvedProfile,
    operationMode,
    selectedModelsForDeck
  );
  const missionPlan = buildExperienceMissionPlan(
    resolvedProfile,
    operationMode,
    resolvedRuntimeAsset,
    activeModel
  );
  const focusList = buildFocusList(resolvedProfile);
  const compareSummary = buildCompareSummary(activeModel, activeComparisonModels);
  const statusChips = buildStatusChips(
    digitalTwinSummary.postureLabel,
    selectedOperationOption?.label,
    compareSummary,
    liveFeed?.sourceLabel
  );

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setComparisonModelIds((current) => current.filter((id) => id !== modelId));
  };

  const handleToggleComparisonModel = (modelId: string) => {
    if (modelId === activeModel?.id) {
      return;
    }

    setComparisonModelIds((current) => {
      if (current.includes(modelId)) {
        return current.filter((id) => id !== modelId);
      }

      if (current.length >= MAX_VIEWPORT_COMPARISON_MODELS) {
        return current;
      }

      return [...current, modelId];
    });
    setShowComparison(true);
  };

  const handleFocusOnly = () => {
    setComparisonModelIds([]);
    setShowComparison(false);
  };

  const guideSectionSx = {
    p: 2,
    borderRadius: 3,
    backgroundColor: "rgba(5, 12, 21, 0.58)",
    border: "1px solid rgba(176, 220, 255, 0.12)",
  } as const;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: theme.background,
        color: "#eef7ff",
        "--studio-accent": theme.accentColor,
        "--studio-glow": theme.glowColor,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.12), transparent 28%), radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--studio-glow) 34%, transparent), transparent 22%), linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 32%, rgba(0, 0, 0, 0.2) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      {activeModel ? (
        <BundleModelViewport
          selection={activeModel}
          assetName={resolvedRuntimeAsset.name}
          accentColor={theme.accentColor}
          glowColor={theme.glowColor}
          mode="immersive"
          viewerChrome="minimal"
          sceneProps={sceneProps}
          comparisonSelections={comparisonSelections}
          lineup={[]}
          contextMode="focus"
          showLineupMarkers={false}
          showBadge={false}
          sx={{ position: "absolute", inset: 0 }}
        />
      ) : (
        <ImmersiveAssetViewport
          profile={resolvedProfile}
          assetKind={resolvedRuntimeAsset.kind}
          assetName={resolvedRuntimeAsset.name}
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
          p: { xs: 1.5, md: 2.5 },
          gap: { xs: 1.5, md: 2 },
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", xl: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", xl: "flex-start" },
            gap: 1.5,
          }}
        >
          <Stack
            spacing={1.15}
            sx={{
              maxWidth: 760,
              p: { xs: 1.6, md: 2.1 },
              borderRadius: 4,
              backdropFilter: "blur(16px)",
              backgroundColor: "rgba(6, 12, 20, 0.54)",
              border: "1px solid rgba(176, 220, 255, 0.12)",
              boxShadow: "0 18px 44px rgba(0, 0, 0, 0.22)",
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
              {theme.labTitle}
            </Typography>
            <Typography
              sx={{
                maxWidth: 640,
                fontSize: 14,
                color: "rgba(226, 240, 255, 0.78)",
              }}
            >
              {theme.labDescription}
            </Typography>
            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
              {statusChips.map((chip) => (
                <Box
                  key={chip}
                  sx={{
                    px: 1.1,
                    py: 0.55,
                    borderRadius: 999,
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      color: chip.startsWith("POSTURE")
                        ? theme.accentColor
                        : "rgba(238, 247, 255, 0.82)",
                    }}
                  >
                    {chip}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: "rgba(238, 247, 255, 0.92)",
              }}
            >
              {modeBrief}
            </Typography>
            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
              {[
                `RDY ${digitalTwinSummary.readinessPct}%`,
                `LOG ${digitalTwinSummary.logisticsPct}%`,
                `COV ${digitalTwinSummary.coveragePct}%`,
              ].map((metric) => (
                <Typography
                  key={metric}
                  sx={{
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    color: theme.accentColor,
                  }}
                >
                  {metric}
                </Typography>
              ))}
            </Stack>
            {liveFeed && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "rgba(226, 240, 255, 0.7)",
                }}
              >
                {liveFeed.timeLabel} · {liveFeed.eventHeadline}
              </Typography>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ pointerEvents: "auto", alignSelf: { xl: "flex-start" } }}
          >
            <Button
              variant="contained"
              onClick={() =>
                openTacticalSimPage(resolvedRuntimeAsset, resolvedProfile, {
                  modelId: activeModel?.id,
                  operationMode,
                })
              }
              sx={{
                backgroundColor: theme.accentColor,
                color: "#07111b",
                fontWeight: 900,
                "&:hover": {
                  backgroundColor: theme.glowColor,
                },
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
                      backgroundColor: "rgba(255, 255, 255, 0.14)",
                      color: "#eef7ff",
                      borderColor: "rgba(176, 220, 255, 0.2)",
                    }
                  : undefined
              }
            >
              {showGuide ? "브리프 닫기" : "브리프 열기"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
            >
              {backLabel}
            </Button>
            <Button
              variant="outlined"
              startIcon={<MapOutlinedIcon />}
              onClick={onBackToMap}
            >
              지도 복귀
            </Button>
            {resolvedRuntimeAsset.kind === "aircraft" && (
              <Button
                variant="outlined"
                startIcon={<LaunchIcon />}
                onClick={() =>
                  openFlightSimPage(
                    [
                      resolvedRuntimeAsset.longitude,
                      resolvedRuntimeAsset.latitude,
                    ],
                    inferAircraftExperienceCraft(
                      resolvedRuntimeAsset.className
                    )
                  )
                }
              >
                항공 시뮬레이터
              </Button>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "stretch", lg: "flex-end" },
            alignItems: "flex-start",
            minHeight: 0,
          }}
        >
          {showGuide && (
            <Stack
              spacing={1.2}
              sx={{
                width: { xs: "100%", lg: 380 },
                maxHeight: "100%",
                overflowY: "auto",
                p: 0.3,
                pointerEvents: "auto",
              }}
            >
              <Box sx={guideSectionSx}>
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Mission Deck
                </Typography>
                <Typography sx={{ mt: 0.65, fontWeight: 900 }}>
                  {missionPlan.briefingTitle}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.74)",
                  }}
                >
                  {missionPlan.briefingSummary}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.84)",
                  }}
                >
                  {missionPlan.commandersIntent}
                </Typography>
              </Box>

              <Box sx={guideSectionSx}>
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Focus Notes
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 1 }}>
                  {focusList.map((item) => (
                    <Box
                      key={item}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>{item}</Typography>
                    </Box>
                  ))}
                  {missionPlan.coreLoops.slice(0, 3).map((item) => (
                    <Typography
                      key={item}
                      sx={{
                        fontSize: 12,
                        color: "rgba(226, 240, 255, 0.68)",
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>

              <Box sx={guideSectionSx}>
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Telemetry
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  {telemetry.map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          color: theme.accentColor,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography sx={{ mt: 0.4, fontWeight: 800 }}>
                        {item.value}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 11,
                          color: "rgba(226, 240, 255, 0.62)",
                        }}
                      >
                        {item.hint}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 12,
                    color: "rgba(226, 240, 255, 0.68)",
                  }}
                >
                  {digitalTwinSummary.warning}
                </Typography>
              </Box>

              {liveFeed && (
                <Box sx={guideSectionSx}>
                  <Typography
                    variant="overline"
                    sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                  >
                    Live Feed
                  </Typography>
                  <Typography sx={{ mt: 0.7, fontWeight: 900 }}>
                    {liveFeed.eventHeadline}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontSize: 12,
                      color: "rgba(226, 240, 255, 0.68)",
                    }}
                  >
                    {liveFeed.timeLabel} · {liveFeed.targetLabel}
                  </Typography>
                  <Stack spacing={0.7} sx={{ mt: 1 }}>
                    {liveFeed.eventItems.map((item) => (
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
              )}

              <Box sx={guideSectionSx}>
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  Launch Checklist
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 1 }}>
                  {missionPlan.readinessChecklist.map((task) => (
                    <Box
                      key={task.title}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>
                        {task.title}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.3,
                          fontSize: 12,
                          color: "rgba(226, 240, 255, 0.68)",
                        }}
                      >
                        {task.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={guideSectionSx}>
                <Typography
                  variant="overline"
                  sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
                >
                  작전 단계
                </Typography>
                <Stack spacing={0.75} sx={{ mt: 1 }}>
                  {missionPlan.missionPhases.map((phase, index) => (
                    <Box
                      key={phase.id}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>
                        {index + 1}. {phase.title}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.3,
                          fontSize: 12,
                          color: "rgba(226, 240, 255, 0.68)",
                        }}
                      >
                        {phase.instruction}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            pointerEvents: "auto",
            p: { xs: 1.4, md: 1.8 },
            borderRadius: 4,
            backdropFilter: "blur(18px)",
            background:
              "linear-gradient(180deg, rgba(5, 12, 21, 0.48), rgba(5, 12, 21, 0.72))",
            border: "1px solid rgba(176, 220, 255, 0.12)",
            boxShadow: "0 18px 44px rgba(0, 0, 0, 0.24)",
          }}
        >
          <Stack spacing={1.4}>
            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={1.6}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.accentColor,
                    letterSpacing: "0.18em",
                  }}
                >
                  Model Focus
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mt: 0.25,
                    fontWeight: 900,
                    lineHeight: 1,
                    fontFamily: "AceCombat, Bahnschrift, sans-serif",
                  }}
                >
                  {activeModel?.label ?? resolvedRuntimeAsset.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.45,
                    color: "rgba(226, 240, 255, 0.78)",
                  }}
                >
                  {activeModel?.note ?? resolvedRuntimeAsset.className}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 12,
                    color: "rgba(226, 240, 255, 0.66)",
                  }}
                >
                  {compareSummary}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                <Button
                  variant={showComparison ? "contained" : "outlined"}
                  onClick={() => setShowComparison((current) => !current)}
                  sx={
                    showComparison
                      ? {
                          backgroundColor: "rgba(255, 255, 255, 0.14)",
                          color: "#eef7ff",
                          borderColor: "rgba(176, 220, 255, 0.2)",
                        }
                      : undefined
                  }
                >
                  {showComparison ? "비교 숨기기" : "비교 열기"}
                </Button>
                <Button
                  variant={showBackdrop ? "contained" : "outlined"}
                  onClick={() => setShowBackdrop((current) => !current)}
                  sx={
                    showBackdrop
                      ? {
                          backgroundColor: "rgba(255, 255, 255, 0.14)",
                          color: "#eef7ff",
                          borderColor: "rgba(176, 220, 255, 0.2)",
                        }
                      : undefined
                  }
                >
                  {showBackdrop ? "무대 배경 끄기" : "무대 배경 켜기"}
                </Button>
                <Button variant="outlined" onClick={handleFocusOnly}>
                  기준만 보기
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
                gap: 1,
              }}
            >
              {operationsDeck.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 1.1,
                    borderRadius: 2.5,
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      color: theme.accentColor,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography sx={{ mt: 0.45, fontWeight: 800 }}>
                    {item.value}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.3,
                      fontSize: 11,
                      color: "rgba(226, 240, 255, 0.62)",
                    }}
                  >
                    {item.hint}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box>
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
              >
                Mission Mode
              </Typography>
              <Stack
                direction="row"
                spacing={0.8}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 0.8 }}
              >
                {operationOptions.map((option) => {
                  const isActive = option.id === operationMode;

                  return (
                    <Button
                      key={option.id}
                      variant={isActive ? "contained" : "outlined"}
                      onClick={() => setOperationMode(option.id)}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        px: 1.2,
                        py: 0.9,
                        borderColor: "rgba(176, 220, 255, 0.16)",
                        backgroundColor: isActive
                          ? theme.accentColor
                          : "rgba(255, 255, 255, 0.04)",
                        color: isActive ? "#07111b" : "#eef7ff",
                        "&:hover": {
                          backgroundColor: isActive
                            ? theme.glowColor
                            : "rgba(255, 255, 255, 0.08)",
                          borderColor: theme.accentColor,
                        },
                      }}
                    >
                      <Stack spacing={0.2} sx={{ alignItems: "flex-start" }}>
                        <Typography sx={{ fontWeight: 800 }}>
                          {option.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: isActive
                              ? "rgba(7, 17, 27, 0.72)"
                              : "rgba(226, 240, 255, 0.68)",
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

            <Box>
              <Typography
                variant="overline"
                sx={{ color: theme.accentColor, letterSpacing: "0.16em" }}
              >
                Model Deck
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridAutoFlow: "column",
                  gridAutoColumns: {
                    xs: "minmax(224px, 1fr)",
                    md: "minmax(260px, 1fr)",
                  },
                  gap: 1,
                  mt: 0.8,
                  overflowX: "auto",
                  pb: 0.35,
                }}
              >
                {modelOptions.map((model) => {
                  const isActive = model.id === activeModel?.id;
                  const isCompared = comparisonModelIds.includes(model.id);

                  return (
                    <Box
                      key={model.id}
                      sx={{
                        p: 1.1,
                        borderRadius: 2.5,
                        backgroundColor: isActive
                          ? "rgba(12, 23, 36, 0.88)"
                          : "rgba(255, 255, 255, 0.04)",
                        border: isActive
                          ? `1px solid ${theme.accentColor}`
                          : isCompared
                            ? "1px solid rgba(176, 220, 255, 0.22)"
                            : "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => handleSelectModel(model.id)}
                        sx={{
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                          textAlign: "left",
                          textTransform: "none",
                          p: 0,
                          color: "#eef7ff",
                        }}
                      >
                        <Stack spacing={0.35} sx={{ alignItems: "flex-start" }}>
                          <Typography sx={{ fontWeight: 800 }}>
                            {model.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "rgba(226, 240, 255, 0.7)",
                            }}
                          >
                            {model.note}
                          </Typography>
                        </Stack>
                      </Button>
                      <Stack
                        direction="row"
                        spacing={0.8}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 1 }}
                      >
                        <Box
                          sx={{
                            px: 0.9,
                            py: 0.35,
                            borderRadius: 999,
                            fontSize: 11,
                            letterSpacing: "0.08em",
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                            color: isActive
                              ? theme.accentColor
                              : "rgba(226, 240, 255, 0.7)",
                          }}
                        >
                          {isActive ? "PRIMARY" : "DECK"}
                        </Box>
                        {!isActive && (
                          <Button
                            size="small"
                            variant={isCompared ? "contained" : "outlined"}
                            aria-label={`${
                              isCompared ? "비교 해제" : "비교 추가"
                            } ${model.label}`}
                            onClick={() =>
                              handleToggleComparisonModel(model.id)
                            }
                            sx={
                              isCompared
                                ? {
                                    minWidth: 0,
                                    px: 1,
                                    backgroundColor: "rgba(255, 255, 255, 0.14)",
                                    color: "#eef7ff",
                                  }
                                : {
                                    minWidth: 0,
                                    px: 1,
                                    color: "#eef7ff",
                                  }
                            }
                          >
                            {isCompared ? "비교 해제" : "비교 추가"}
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {showComparison && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: "rgba(226, 240, 255, 0.64)",
                }}
              >
                비교 모드에서는 선택한 기준 모델 외 최대{" "}
                {MAX_VIEWPORT_COMPARISON_MODELS}개 플랫폼만 같은 시야에 올립니다.
                무대 배경은 필요할 때만 켜서 모델 시야를 유지합니다.
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
