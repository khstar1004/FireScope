import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import Game, {
  type BattleSpectatorEntityType,
  type BattleSpectatorEvent,
  type BattleSpectatorUnitSnapshot,
  type BattleSpectatorWeaponSnapshot,
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
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import {
  getBundleModelById,
  selectAssetExperienceModel,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import { buildImmersiveLiveTwinRuntime } from "@/gui/experience/immersiveLiveTwin";
import {
  inferImmersiveExperienceProfile,
  type ImmersiveExperienceProfile,
} from "@/gui/experience/immersiveExperience";
import BattleSpectatorHeroViewport, {
  type BattleSpectatorHeroViewportMetric,
  type BattleSpectatorHeroViewportState,
} from "@/gui/flightSim/BattleSpectatorHeroViewport";
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
import type { FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";
import BattleSpectatorScenarioSidebar from "@/gui/flightSim/BattleSpectatorScenarioSidebar";
import EntityIcon from "@/gui/map/toolbar/EntityIcon";
import ToolbarCollapsible from "@/gui/map/toolbar/ToolbarCollapsible";
import {
  isDroneAircraftClassName,
  isFiresFacilityClassName,
  isTankFacilityClassName,
  type ToolbarEntityType,
} from "@/utils/assetTypeCatalog";
import { GAME_SPEED_DELAY_MS } from "@/utils/constants";
import blankScenarioJson from "@/scenarios/blank_scenario.json";
import defaultScenarioJson from "@/scenarios/default_scenario.json";
import armyDemoScenarioJson from "@/scenarios/army_demo_1.json";
import focusedTrainingDemoJson from "@/scenarios/focused_training_demo.json";
import focusFireEconomyDemo from "@/scenarios/focusFireEconomyDemo";
import rlFirstSuccessDemoJson from "@/scenarios/rl_first_success_demo.json";
import rlBattleOptimizationDemoJson from "@/scenarios/rl_battle_optimization_demo.json";
import { strategicScenarioPresets } from "@/scenarios/iranVsUsScenarios";
import { randomUUID } from "@/utils/generateUUID";

const FLIGHT_SIM_ENTRY = "/flight-sim/index.html";
const FLIGHT_SIM_REVISION = "20260419-battle-spectator-cinematic-v1";
const FLIGHT_SIM_SCENARIO_NAME_REGEX = /^[a-zA-Z0-9가-힣 :-]{1,25}$/;

type FlightSimScenarioPresetDefinition = {
  name: string;
  displayName: string;
  regenerateScenarioId?: boolean;
  scenario: Record<string, unknown>;
};

const FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS: FlightSimScenarioPresetDefinition[] = [
  {
    name: "default_scenario",
    displayName: "기본 데모",
    scenario: defaultScenarioJson as Record<string, unknown>,
  },
  {
    name: "rl_first_success_demo",
    displayName: "RL 첫 체감 데모",
    scenario: rlFirstSuccessDemoJson as Record<string, unknown>,
  },
  {
    name: "rl_battle_optimization_demo",
    displayName: "RL 전장 최적화 데모",
    scenario: rlBattleOptimizationDemoJson as Record<string, unknown>,
  },
  {
    name: "focused_training_demo",
    displayName: "가용화력자산",
    scenario: focusedTrainingDemoJson as Record<string, unknown>,
  },
  {
    name: "focus_fire_economy_demo",
    displayName: "화력 배치 경제성 비교",
    scenario: focusFireEconomyDemo as Record<string, unknown>,
  },
  {
    name: "army_demo",
    displayName: "전장 데모",
    scenario: armyDemoScenarioJson as Record<string, unknown>,
  },
  ...strategicScenarioPresets.map((preset) => ({
    name: preset.name,
    displayName: preset.displayName,
    regenerateScenarioId: preset.regenerateScenarioId,
    scenario: preset.scenario as Record<string, unknown>,
  })),
];

const FLIGHT_SIM_SCENARIO_ID_REFRESH_PRESET_NAMES = new Set([
  "blank_scenario",
  "default_scenario",
  "rl_first_success_demo",
  "rl_battle_optimization_demo",
  "focused_training_demo",
  "focus_fire_economy_demo",
]);

type AssetState = "checking" | "ready" | "missing";
type BattleSpectatorDockTab =
  | "overview"
  | "briefing"
  | "engagements"
  | "analysis";
type CraftMode = "jet" | "drone";
type BattleSpectatorSideTrendSnapshot = {
  sideId: string;
  sideName: string;
  sideColor: string;
  unitCount: number;
  aircraftCount: number;
  facilityCount: number;
  airbaseCount: number;
  shipCount: number;
  weaponsInFlight: number;
  totalWeaponCapacity: number;
  averageHpFraction: number;
  recentLaunches: number;
  recentImpacts: number;
  powerScore: number;
};
type BattleSpectatorSideTrendEntry = {
  scenarioId: string;
  currentTime: number;
  signature: string;
  sides: BattleSpectatorSideTrendSnapshot[];
};
type BattleSpectatorHotspotRow = {
  id: string;
  label: string;
  longitude: number;
  latitude: number;
  altitudeMeters: number;
  score: number;
  eventCount: number;
  launchCount: number;
  impactCount: number;
  activeWeapons: number;
  latestTimestamp: number;
  latestMessage: string | null;
  dominantSideName: string;
  dominantSideColor: string;
};
type BattleSpectatorTempoRow = {
  unit: BattleSpectatorUnitSnapshot;
  tempoScore: number;
  outgoingWeapons: number;
  incomingWeapons: number;
  recentLaunches: number;
  recentImpacts: number;
  targetName: string | null;
};
type BattleSpectatorTrajectoryRow = {
  weapon: BattleSpectatorWeaponSnapshot;
  launcherName: string;
  targetName: string | null;
  targetPoint: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  } | null;
  totalDistanceKm: number | null;
  remainingDistanceKm: number | null;
  progressPercent: number | null;
  timeToImpactSec: number | null;
  threatRadiusMeters: number;
  phaseLabel: string;
  targetTypeLabel: string;
};
type BattleSpectatorImpactTimelineRow = {
  id: string;
  weapon: BattleSpectatorWeaponSnapshot;
  targetName: string;
  targetPoint: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  } | null;
  etaSec: number;
  threatRadiusMeters: number;
  urgencyLabel: string;
  urgencyTone: string;
  progressPercent: number;
};
type BattleSpectatorAssetRiskRow = {
  id: string;
  unit: BattleSpectatorUnitSnapshot;
  incomingCount: number;
  earliestEtaSec: number;
  maxThreatRadiusMeters: number;
  highlightedWeapon: BattleSpectatorWeaponSnapshot;
  targetPoint: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  } | null;
};
type BattleSpectatorCameraProfile = "tactical" | "side" | "chase" | "orbit";
type BattleSpectatorAlertRow = {
  id: string;
  label: string;
  detail: string;
  severityLabel: string;
  severityTone: string;
  actionLabel: string;
  point: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  };
  followTargetId?: string;
  cameraProfile?: BattleSpectatorCameraProfile;
};
type BattleSpectatorPatrolTargetKind =
  | "impact"
  | "drone"
  | "armor"
  | "fires"
  | "aircraft"
  | "ship"
  | "ground"
  | "hotspot"
  | "engagement";
type BattleSpectatorPatrolTarget = {
  id: string;
  label: string;
  detail: string;
  kind: BattleSpectatorPatrolTargetKind;
  point: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  };
  followTargetId?: string;
  cameraProfile?: BattleSpectatorCameraProfile;
  durationSeconds?: number;
  headingDegrees?: number;
  pitchDegrees?: number;
  rangeMeters?: number;
};
type BattleSpectatorSidebarEntry = {
  id: string;
  label: string;
  detail: string;
  iconType: ToolbarEntityType;
  iconColor: string;
  point: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  };
  followTargetId?: string;
  cameraProfile: BattleSpectatorCameraProfile;
  sourceKind: "scene" | "unit";
  durationSeconds?: number;
  headingDegrees?: number;
  pitchDegrees?: number;
  rangeMeters?: number;
};
type BattleSpectatorBriefingAction = {
  id: string;
  label: string;
  detail: string;
  point: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  };
  followTargetId?: string;
  cameraProfile?: BattleSpectatorCameraProfile;
};
type BattleSpectatorBriefing = {
  stageLabel: string;
  stageTone: string;
  headline: string;
  detail: string;
  recommendation: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  actions: BattleSpectatorBriefingAction[];
};
type BattleSpectatorPriorityFilter =
  | "all"
  | "urgent"
  | "imminent"
  | "saturation";
type BattleSpectatorBriefingLogEntry = {
  id: string;
  timestampLabel: string;
  stageLabel: string;
  stageTone: string;
  headline: string;
  detail: string;
  point: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  };
  followTargetId?: string;
  cameraProfile?: BattleSpectatorCameraProfile;
};
type BattleSpectatorSelectedUnitInsight = {
  incomingWeapons: number;
  outgoingWeapons: number;
  targetName: string | null;
};
type BattleSpectatorRuntimeSelectionPayload = {
  followTargetId?: string;
};
type BattleSpectatorInspectTarget =
  | {
      kind: "unit";
      followTargetId: string;
      unit: BattleSpectatorUnitSnapshot;
      insight: BattleSpectatorSelectedUnitInsight;
    }
  | {
      kind: "weapon";
      followTargetId: string;
      weapon: BattleSpectatorWeaponSnapshot;
      trajectory: BattleSpectatorTrajectoryRow | null;
      impactTimeline: BattleSpectatorImpactTimelineRow | null;
      launcherUnit?: BattleSpectatorUnitSnapshot;
      targetUnit?: BattleSpectatorUnitSnapshot;
    };
type FlightSimRuntimeInfo = {
  mapProvider?: "initializing" | "vworld-webgl" | "cesium-fallback";
  startup?: {
    phase?: "loading" | "ready" | "failed";
    failed?: boolean;
    loadingMessage?: string | null;
    readyForSimulation?: boolean;
    battleSpectatorOverlayMode?: boolean;
    battleSpectatorSessionStarted?: boolean;
    currentState?: string;
    audioReady?: boolean;
    modelReady?: boolean;
    cesiumReady?: boolean;
    globeReady?: boolean;
  };
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

type BattleSpectatorState = FlightSimBattleSpectatorState;
type BattleSpectatorLodLevel = "cinematic" | "balanced" | "performance";

const BATTLE_SPECTATOR_LOD_OPTIONS: Array<{
  id: BattleSpectatorLodLevel;
  label: string;
  description: string;
}> = [
  {
    id: "cinematic",
    label: "영상형",
    description: "모델과 궤적을 넉넉하게 표시",
  },
  {
    id: "balanced",
    label: "균형",
    description: "기본 관전 품질",
  },
  {
    id: "performance",
    label: "성능",
    description: "마커 위주 경량 관전",
  },
];
const BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS: Array<{
  id: BattleSpectatorCameraProfile;
  label: string;
  description: string;
}> = [
  {
    id: "tactical",
    label: "전술",
    description: "상공에서 전장을 넓게 보는 기본 시점",
  },
  {
    id: "side",
    label: "측면",
    description: "미사일 궤적과 고도 변화를 옆에서 확인",
  },
  {
    id: "chase",
    label: "추적",
    description: "표적 뒤를 물며 가까이 보는 몰입형 시점",
  },
  {
    id: "orbit",
    label: "오비트",
    description: "선택 자산을 중심으로 둘러보는 시점",
  },
];
const BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS: Array<{
  id: BattleSpectatorPriorityFilter;
  label: string;
  description: string;
}> = [
  {
    id: "all",
    label: "전체",
    description: "모든 유도 궤적과 ETA를 표시",
  },
  {
    id: "urgent",
    label: "즉시",
    description: "종말 단계 또는 ETA 30초 이내",
  },
  {
    id: "imminent",
    label: "1분 내",
    description: "ETA 60초 이내 접근 위협",
  },
  {
    id: "saturation",
    label: "다중 위협",
    description: "동일 자산에 2발 이상 집중된 경우",
  },
];

const TRAJECTORY_WEAPON_SIGNATURE =
  /\b(aim-|agm-|asm|sam|aam|atgm|jdam|jassm|tomahawk|hyunmoo|guided|missile|rocket)\b/i;
const NON_TRAJECTORY_WEAPON_SIGNATURE =
  /\b(shell|round|bullet|cannon|gun|30mm|20mm|40mm|57mm|76mm|90mm|105mm|120mm|125mm|127mm|130mm|152mm|155mm)\b/i;

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

function buildBattleSpectatorState(
  game?: Game,
  continueSimulation = false,
  fallback?: BattleSpectatorState
): BattleSpectatorState | undefined {
  const snapshot = game?.getBattleSpectatorSnapshot();
  if (!snapshot) {
    return fallback
      ? {
          ...fallback,
          continueSimulation: fallback.continueSimulation ?? continueSimulation,
        }
      : undefined;
  }

  return {
    ...snapshot,
    continueSimulation: fallback?.continueSimulation ?? continueSimulation,
  };
}

function sanitizeFlightSimScenarioFilename(name: string) {
  const normalizedName = name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
  return normalizedName.length > 0 ? normalizedName : "scenario";
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

function formatRuntimeProviderLabel(
  runtimeProvider: "checking" | "vworld-webgl" | "cesium-fallback" | "unknown"
) {
  if (runtimeProvider === "vworld-webgl") {
    return "VWorld WebGL 3D";
  }
  if (runtimeProvider === "cesium-fallback") {
    return "Cesium + MapTiler";
  }
  if (runtimeProvider === "checking") {
    return "엔진 판별 중";
  }
  return "초기화 중";
}

function formatRuntimeProviderTone(
  runtimeProvider: "checking" | "vworld-webgl" | "cesium-fallback" | "unknown"
) {
  if (runtimeProvider === "vworld-webgl") {
    return "#62e6d0";
  }
  if (runtimeProvider === "cesium-fallback") {
    return "#7fe7ff";
  }
  if (runtimeProvider === "checking") {
    return "#ffd166";
  }
  return "#c5d4df";
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
  battleSpectator?: BattleSpectatorState;
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
    overline: "항공 시뮬레이터 비행 모드",
    title: "전투기 시뮬레이터",
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
    overline: "항공 시뮬레이터 드론 모드",
    title: "드론 시뮬레이터",
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

const battleSpectatorCopy = {
  overline: "전장 3D 관전 모드",
  title: "전장 3D 관전",
  description:
    "현재 시나리오의 유닛, 미사일 궤적, 최근 교전선을 3D 지형 위에서 실시간으로 관전합니다. 전술·측면·추적 시점을 바꾸며 궤적을 옆에서 확인하고, 위협 상위 유닛과 최근 교전을 오가며 전장 흐름을 빠르게 읽을 수 있습니다.",
  controls: [
    "`마우스 드래그`: 시야 회전",
    "`마우스 휠`: 확대 / 축소",
    "`Shift + 드래그`: 시점 기울이기",
    "`좌측 패널`: 세력 필터 · 시점 프로파일 · 교전 점프",
    "`모바일`: 패널 열기 / 닫기",
  ],
};

function buildBattleSpectatorStats(state: BattleSpectatorState) {
  const sides = new Set<string>();
  state.units.forEach((unit) => sides.add(unit.sideId));
  state.weapons.forEach((weapon) => sides.add(weapon.sideId));

  return {
    aircraft: state.units.filter((unit) => unit.entityType === "aircraft")
      .length,
    facilities: state.units.filter(
      (unit) => unit.entityType === "facility" || unit.entityType === "army"
    ).length,
    airbases: state.units.filter((unit) => unit.entityType === "airbase")
      .length,
    ships: state.units.filter((unit) => unit.entityType === "ship").length,
    groundUnits: state.units.filter((unit) => unit.groundUnit).length,
    weaponsInFlight: state.weapons.length,
    sides: sides.size,
  };
}

function isBattleSpectatorLaunchEvent(event: BattleSpectatorEvent) {
  return (
    event.resultTag === "launch" ||
    event.resultTag === "counterfire" ||
    event.type === "WEAPON_LAUNCHED"
  );
}

function isBattleSpectatorImpactEvent(event: BattleSpectatorEvent) {
  return (
    event.resultTag === "impact" ||
    event.resultTag === "damage" ||
    event.resultTag === "kill" ||
    event.resultTag === "miss" ||
    event.type === "WEAPON_HIT" ||
    event.type === "WEAPON_MISSED"
  );
}

function buildBattleSpectatorActivitySummary(
  state: BattleSpectatorState | undefined
) {
  if (!state) {
    return null;
  }

  const recentLaunches = state.recentEvents.filter((event) =>
    isBattleSpectatorLaunchEvent(event)
  ).length;
  const recentImpacts = state.recentEvents.filter((event) =>
    isBattleSpectatorImpactEvent(event)
  ).length;
  const eventTracers = state.recentEvents.filter(
    (event) =>
      isBattleSpectatorLaunchEvent(event) &&
      !event.weaponId &&
      hasFiniteBattleSpectatorPoint(
        event.sourceLongitude,
        event.sourceLatitude
      ) &&
      hasFiniteBattleSpectatorPoint(event.focusLongitude, event.focusLatitude)
  ).length;
  const latestEvent = state.recentEvents[state.recentEvents.length - 1];

  if (state.units.length === 0 && state.weapons.length === 0) {
    return {
      statusLabel: "전장 데이터 없음",
      statusTone: "#ffd166",
      statusDetail:
        "메인 맵에서 시뮬레이션을 재생한 뒤 다시 열거나, 첫 교전이 생길 때까지 잠시 기다리세요.",
      activeWeapons: 0,
      recentLaunches,
      recentImpacts,
      eventTracers,
      latestMessage: latestEvent?.message ?? null,
    };
  }

  if (state.weapons.length > 0) {
    return {
      statusLabel: "실시간 탄체 추적 가능",
      statusTone: "#62e6d0",
      statusDetail:
        "현재 비행 중인 탄체를 바로 추적할 수 있습니다. `활성 탄체 추적`이나 자동 포착을 사용하면 바로 붙습니다.",
      activeWeapons: state.weapons.length,
      recentLaunches,
      recentImpacts,
      eventTracers,
      latestMessage: latestEvent?.message ?? null,
    };
  }

  if (recentLaunches > 0 || eventTracers > 0) {
    return {
      statusLabel: "로그 기반 교전선 표시 중",
      statusTone: "#84d8ff",
      statusDetail:
        "실제 Weapon 엔티티가 없는 사격도 최근 이벤트 트레이서로 표시됩니다.",
      activeWeapons: state.weapons.length,
      recentLaunches,
      recentImpacts,
      eventTracers,
      latestMessage: latestEvent?.message ?? null,
    };
  }

  return {
    statusLabel: "교전 대기 상태",
    statusTone: "#ffd166",
    statusDetail:
      "유닛은 들어와 있지만 아직 최근 발사나 명중 로그가 없습니다. 시뮬레이션을 더 진행해 보세요.",
    activeWeapons: state.weapons.length,
    recentLaunches,
    recentImpacts,
    eventTracers,
    latestMessage: latestEvent?.message ?? null,
  };
}

function roundBattleSpectatorSignatureNumber(
  value: number | null | undefined,
  digits = 3
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(digits));
}

function buildBattleSpectatorStateSignature(
  state: BattleSpectatorState | undefined
) {
  if (!state) {
    return "none";
  }

  return JSON.stringify({
    scenarioId: state.scenarioId,
    currentTime: state.currentTime,
    currentSideId: state.currentSideId,
    centerLongitude: roundBattleSpectatorSignatureNumber(
      state.centerLongitude,
      4
    ),
    centerLatitude: roundBattleSpectatorSignatureNumber(
      state.centerLatitude,
      4
    ),
    stats: state.stats,
    units: state.units.map((unit) => [
      unit.id,
      unit.sideId,
      roundBattleSpectatorSignatureNumber(unit.latitude, 4),
      roundBattleSpectatorSignatureNumber(unit.longitude, 4),
      roundBattleSpectatorSignatureNumber(unit.altitudeMeters, 0),
      roundBattleSpectatorSignatureNumber(unit.headingDeg, 0),
      roundBattleSpectatorSignatureNumber(unit.speedKts, 0),
      unit.weaponCount,
      roundBattleSpectatorSignatureNumber(unit.hpFraction, 3),
      unit.selected ? 1 : 0,
      unit.targetId ?? "",
    ]),
    weapons: state.weapons.map((weapon) => [
      weapon.id,
      weapon.sideId,
      weapon.launcherId,
      weapon.targetId ?? "",
      roundBattleSpectatorSignatureNumber(weapon.latitude, 4),
      roundBattleSpectatorSignatureNumber(weapon.longitude, 4),
      roundBattleSpectatorSignatureNumber(weapon.altitudeMeters, 0),
      roundBattleSpectatorSignatureNumber(weapon.speedKts, 0),
    ]),
    recentEvents: state.recentEvents.map((event) => [
      event.id,
      event.timestamp,
      event.sideId,
      event.type,
      event.actorId ?? "",
      event.targetId ?? "",
      event.weaponId ?? "",
      event.resultTag ?? "",
      roundBattleSpectatorSignatureNumber(event.focusLongitude, 4),
      roundBattleSpectatorSignatureNumber(event.focusLatitude, 4),
    ]),
  });
}

function buildBattleSpectatorRuntimeSignature(options: {
  state: BattleSpectatorState;
  followTargetId: string;
  lodLevel: BattleSpectatorLodLevel;
  cameraProfile: BattleSpectatorCameraProfile;
}) {
  return JSON.stringify({
    state: JSON.parse(buildBattleSpectatorStateSignature(options.state)),
    followTargetId: options.followTargetId || null,
    lodLevel: options.lodLevel,
    cameraProfile: options.cameraProfile,
  });
}

function buildBattleSpectatorSideTrendHistoryEntry(
  state: BattleSpectatorState | undefined
): BattleSpectatorSideTrendEntry | null {
  if (!state) {
    return null;
  }

  const sideMap = new Map<
    string,
    Omit<BattleSpectatorSideTrendSnapshot, "powerScore">
  >();
  const ensureSide = (
    sideId: string,
    sideName: string,
    sideColor: string = "silver"
  ) => {
    if (!sideMap.has(sideId)) {
      sideMap.set(sideId, {
        sideId,
        sideName,
        sideColor,
        unitCount: 0,
        aircraftCount: 0,
        facilityCount: 0,
        airbaseCount: 0,
        shipCount: 0,
        weaponsInFlight: 0,
        totalWeaponCapacity: 0,
        averageHpFraction: 0,
        recentLaunches: 0,
        recentImpacts: 0,
      });
    }

    return sideMap.get(sideId)!;
  };

  const hpSums = new Map<string, number>();
  state.units.forEach((unit) => {
    const side = ensureSide(unit.sideId, unit.sideName, unit.sideColor);
    side.unitCount += 1;
    side.totalWeaponCapacity += unit.weaponCount;
    hpSums.set(unit.sideId, (hpSums.get(unit.sideId) ?? 0) + unit.hpFraction);

    switch (unit.entityType) {
      case "aircraft":
        side.aircraftCount += 1;
        break;
      case "army":
      case "facility":
        side.facilityCount += 1;
        break;
      case "airbase":
        side.airbaseCount += 1;
        break;
      case "ship":
        side.shipCount += 1;
        break;
      default:
        break;
    }
  });

  state.weapons.forEach((weapon) => {
    const side = ensureSide(weapon.sideId, weapon.sideName, weapon.sideColor);
    side.weaponsInFlight += 1;
  });

  state.recentEvents.forEach((event) => {
    const side = ensureSide(event.sideId, event.sideName);
    if (isBattleSpectatorLaunchEvent(event)) {
      side.recentLaunches += 1;
    }
    if (isBattleSpectatorImpactEvent(event)) {
      side.recentImpacts += 1;
    }
  });

  const sides = [...sideMap.values()]
    .map((side) => {
      const averageHpFraction =
        side.unitCount > 0
          ? (hpSums.get(side.sideId) ?? 0) / side.unitCount
          : 0;
      const weightedPresence =
        side.aircraftCount * 22 +
        side.shipCount * 18 +
        side.airbaseCount * 15 +
        side.facilityCount * 12;
      const powerScore = Math.round(
        weightedPresence +
          side.totalWeaponCapacity * 2 +
          side.weaponsInFlight * 9 +
          averageHpFraction * 24 +
          side.recentLaunches * 4 +
          side.recentImpacts * 3
      );

      return {
        ...side,
        averageHpFraction,
        powerScore,
      };
    })
    .sort((left, right) => {
      if (left.powerScore !== right.powerScore) {
        return right.powerScore - left.powerScore;
      }
      return left.sideName.localeCompare(right.sideName, "ko-KR");
    });

  const signature = JSON.stringify(
    sides.map((side) => [
      side.sideId,
      side.unitCount,
      side.weaponsInFlight,
      side.totalWeaponCapacity,
      roundBattleSpectatorSignatureNumber(side.averageHpFraction, 3),
      side.recentLaunches,
      side.recentImpacts,
      side.powerScore,
    ])
  );

  return {
    scenarioId: state.scenarioId,
    currentTime: state.currentTime,
    signature,
    sides,
  };
}

function buildBattleSpectatorSideTrendRows(
  history: BattleSpectatorSideTrendEntry[],
  sideFilterId: string
) {
  if (history.length === 0) {
    return [];
  }

  const latestEntry = history[history.length - 1];
  const sideIds = new Set<string>();
  history.forEach((entry) => {
    entry.sides.forEach((side) => sideIds.add(side.sideId));
  });

  const rows = [...sideIds]
    .map((sideId) => {
      const latestAvailableSide =
        [...history]
          .reverse()
          .flatMap((entry) => entry.sides)
          .find((side) => side.sideId === sideId) ?? null;
      if (!latestAvailableSide) {
        return null;
      }

      const currentSide =
        latestEntry.sides.find((side) => side.sideId === sideId) ??
        ({
          ...latestAvailableSide,
          unitCount: 0,
          aircraftCount: 0,
          facilityCount: 0,
          airbaseCount: 0,
          shipCount: 0,
          weaponsInFlight: 0,
          totalWeaponCapacity: 0,
          averageHpFraction: 0,
          recentLaunches: 0,
          recentImpacts: 0,
          powerScore: 0,
        } satisfies BattleSpectatorSideTrendSnapshot);
      const powerHistory = history.map(
        (entry) =>
          entry.sides.find((side) => side.sideId === sideId)?.powerScore ?? 0
      );
      const firstPower = powerHistory[0] ?? 0;
      const lastPower = powerHistory[powerHistory.length - 1] ?? 0;
      const delta = lastPower - firstPower;

      return {
        ...currentSide,
        powerHistory,
        delta,
        trendLabel: delta >= 8 ? "상승" : delta <= -8 ? "약화" : "유지",
        isFiltered: sideFilterId !== "all" && sideFilterId === sideId,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((left, right) => {
      if (left.isFiltered !== right.isFiltered) {
        return left.isFiltered ? -1 : 1;
      }
      if (left.powerScore !== right.powerScore) {
        return right.powerScore - left.powerScore;
      }
      return left.sideName.localeCompare(right.sideName, "ko-KR");
    });

  return rows;
}

function buildBattleSpectatorInitiativeSummary(
  rows: ReturnType<typeof buildBattleSpectatorSideTrendRows>
) {
  if (rows.length === 0) {
    return null;
  }

  const leadingSide = rows[0];
  const nextSide = rows[1];
  const gap = leadingSide.powerScore - (nextSide?.powerScore ?? 0);

  return {
    sideName: leadingSide.sideName,
    gap,
    label: gap >= 25 ? "우세 확대" : gap >= 10 ? "근소 우세" : "혼전",
    detail:
      rows.length > 1
        ? `${leadingSide.sideName} 전력 우세 +${gap}`
        : `${leadingSide.sideName} 단독 관측 중`,
  };
}

function buildBattleSpectatorBriefing(options: {
  state: BattleSpectatorState | undefined;
  initiativeSummary: ReturnType<typeof buildBattleSpectatorInitiativeSummary>;
  alertRows: BattleSpectatorAlertRow[];
  impactTimelineRows: BattleSpectatorImpactTimelineRow[];
  assetRiskRows: BattleSpectatorAssetRiskRow[];
  hotspotRows: BattleSpectatorHotspotRow[];
  trajectoryRows: BattleSpectatorTrajectoryRow[];
}) {
  const topAlert = options.alertRows[0] ?? null;
  const topImpact = options.impactTimelineRows[0] ?? null;
  const topAssetRisk = options.assetRiskRows[0] ?? null;
  const topHotspot = options.hotspotRows[0] ?? null;

  if (
    !topAlert &&
    !topImpact &&
    !topAssetRisk &&
    !topHotspot &&
    !options.initiativeSummary
  ) {
    return null as BattleSpectatorBriefing | null;
  }

  const currentSideId = options.state?.currentSideId ?? null;
  const isFriendlyAssetRisk =
    topAssetRisk !== null && currentSideId !== null
      ? topAssetRisk.unit.sideId === currentSideId
      : false;

  let stageLabel = "상황 감시";
  let stageTone = "#84d8ff";
  let headline = "전장 감시 유지";
  let detail = `유도 궤적 ${options.trajectoryRows.length}건과 교전 축점 ${options.hotspotRows.length}곳을 기준으로 관전 우선순위를 정렬했습니다.`;
  let recommendation =
    "전장 개관을 유지한 뒤 우선 경보와 착탄 타임라인부터 확인하십시오.";

  if (
    topAssetRisk &&
    isFriendlyAssetRisk &&
    topAssetRisk.earliestEtaSec <= 45
  ) {
    stageLabel = "방어 긴급";
    stageTone = "#ff7b72";
    headline = `${topAssetRisk.unit.name} 방어 1순위`;
    detail = `${topAssetRisk.unit.sideName} 자산에 ${topAssetRisk.incomingCount}발 접근 중이며 최단 ETA ${formatBattleSpectatorEta(
      topAssetRisk.earliestEtaSec
    )}, 최대 위험 반경 ${formatBattleSpectatorThreatRadius(
      topAssetRisk.maxThreatRadiusMeters
    )}입니다.`;
    recommendation =
      "자산 추적으로 전환해 종말 단계 탄체와 잔여 체력을 함께 확인하십시오.";
  } else if (
    topImpact &&
    topImpact.etaSec <= 90 &&
    topAssetRisk &&
    !isFriendlyAssetRisk
  ) {
    stageLabel = "타격 확인";
    stageTone = "#62e6d0";
    headline = `${topAssetRisk.unit.name} 타격 확인`;
    detail = `${topAssetRisk.highlightedWeapon.sideName} 탄체가 ${topAssetRisk.unit.sideName} 자산에 접근 중이며 최단 ETA ${formatBattleSpectatorEta(
      topAssetRisk.earliestEtaSec
    )}입니다. 영향 반경은 ${formatBattleSpectatorThreatRadius(
      topAssetRisk.maxThreatRadiusMeters
    )}로 추정됩니다.`;
    recommendation =
      "측면 시점으로 전환해 종말 유도, 착탄 지점, 위험 반경을 한 화면에서 확인하십시오.";
  } else if (topImpact && topImpact.etaSec <= 90) {
    stageLabel = "착탄 임박";
    stageTone = topImpact.etaSec <= 30 ? "#ff7b72" : "#ffd166";
    headline = `${topImpact.targetName} ETA ${formatBattleSpectatorEta(
      topImpact.etaSec
    )}`;
    detail = `${topImpact.weapon.sideName} ${topImpact.weapon.name}의 도달이 임박했습니다. 위험 반경은 ${formatBattleSpectatorThreatRadius(
      topImpact.threatRadiusMeters
    )}입니다.`;
    recommendation =
      "착탄점 보기로 이동해 목표 지점 상공에서 접근축을 재확인하십시오.";
  } else if (topHotspot && topHotspot.score >= 18) {
    stageLabel = "교전 집중";
    stageTone = "#84d8ff";
    headline = `${topHotspot.label} 재관찰 필요`;
    detail = `${topHotspot.dominantSideName} 우세 구역에서 이벤트 ${topHotspot.eventCount}건, 활성 탄체 ${topHotspot.activeWeapons}발이 같은 축선에 집중되고 있습니다.`;
    recommendation =
      "핫스팟 재확인으로 이동해 동일 표적군에 대한 집중 타격 여부를 확인하십시오.";
  } else if (options.initiativeSummary) {
    stageLabel = options.initiativeSummary.label;
    stageTone =
      options.initiativeSummary.gap >= 25
        ? "#62e6d0"
        : options.initiativeSummary.gap >= 10
          ? "#ffd166"
          : "#84d8ff";
    headline = `${options.initiativeSummary.sideName} 전황 주도`;
    detail = options.initiativeSummary.detail;
    recommendation =
      "전장 개관을 유지하면서 우세 축선과 잔여 유도탄 흐름을 같이 확인하십시오.";
  }

  const metrics = [
    {
      label: "주도권",
      value: options.initiativeSummary
        ? `${options.initiativeSummary.sideName} ${options.initiativeSummary.label}`
        : "판단 보류",
    },
    {
      label: "최단 ETA",
      value: topImpact ? formatBattleSpectatorEta(topImpact.etaSec) : "없음",
    },
    {
      label: "관심 자산",
      value: topAssetRisk
        ? `${topAssetRisk.unit.name} ${topAssetRisk.incomingCount}발`
        : "없음",
    },
    {
      label: "교전 축점",
      value: topHotspot
        ? `${topHotspot.label} ${topHotspot.score}`
        : options.trajectoryRows.length > 0
          ? `유도탄 ${options.trajectoryRows.length}발`
          : "없음",
    },
  ];

  const actions: BattleSpectatorBriefingAction[] = [];
  const seenActionIds = new Set<string>();
  const pushAction = (action: BattleSpectatorBriefingAction) => {
    if (seenActionIds.has(action.id)) {
      return;
    }

    seenActionIds.add(action.id);
    actions.push(action);
  };

  if (topImpact) {
    pushAction({
      id: `briefing-impact-${topImpact.weapon.id}`,
      label: "타격 축선 보기",
      detail: `${topImpact.targetName} · ETA ${formatBattleSpectatorEta(
        topImpact.etaSec
      )} · ${topImpact.weapon.name}`,
      point:
        topImpact.targetPoint ??
        resolveBattleSpectatorWeaponJumpPoint(topImpact.weapon),
      followTargetId:
        typeof topImpact.weapon.targetId === "string"
          ? `unit:${topImpact.weapon.targetId}`
          : `weapon:${topImpact.weapon.id}`,
      cameraProfile: "side",
    });
  }

  if (topAssetRisk) {
    pushAction({
      id: `briefing-asset-${topAssetRisk.unit.id}`,
      label: isFriendlyAssetRisk ? "방어 자산 추적" : "표적 자산 추적",
      detail: `${topAssetRisk.unit.name} · 접근 ${topAssetRisk.incomingCount}발 · ETA ${formatBattleSpectatorEta(
        topAssetRisk.earliestEtaSec
      )}`,
      point: resolveBattleSpectatorUnitJumpPoint(topAssetRisk.unit),
      followTargetId: `unit:${topAssetRisk.unit.id}`,
      cameraProfile: resolveBattleSpectatorUnitCameraProfile(topAssetRisk.unit),
    });
  }

  if (topAlert) {
    pushAction({
      id: `briefing-alert-${topAlert.id}`,
      label: "최우선 경보 보기",
      detail: topAlert.label,
      point: topAlert.point,
      followTargetId: topAlert.followTargetId,
      cameraProfile: topAlert.cameraProfile,
    });
  }

  if (topHotspot) {
    pushAction({
      id: `briefing-hotspot-${topHotspot.id}`,
      label: "핫스팟 재확인",
      detail: `${topHotspot.label} · 강도 ${topHotspot.score} · 탄체 ${topHotspot.activeWeapons}`,
      point: {
        longitude: topHotspot.longitude,
        latitude: topHotspot.latitude,
        altitudeMeters: topHotspot.altitudeMeters,
      },
      cameraProfile: "side",
    });
  }

  return {
    stageLabel,
    stageTone,
    headline,
    detail,
    recommendation,
    metrics,
    actions: actions.slice(0, 3),
  } satisfies BattleSpectatorBriefing;
}

function buildBattleSpectatorSaturationTargetIds(
  assetRiskRows: BattleSpectatorAssetRiskRow[]
) {
  return new Set(
    assetRiskRows
      .filter((row) => row.incomingCount >= 2)
      .map((row) => row.unit.id)
  );
}

function filterBattleSpectatorTrajectoryRows(
  rows: BattleSpectatorTrajectoryRow[],
  priorityFilter: BattleSpectatorPriorityFilter,
  saturationTargetIds: Set<string>
) {
  if (priorityFilter === "all") {
    return rows;
  }

  return rows.filter((row) => {
    if (priorityFilter === "urgent") {
      return (
        row.phaseLabel === "종말" ||
        (typeof row.timeToImpactSec === "number" && row.timeToImpactSec <= 30)
      );
    }

    if (priorityFilter === "imminent") {
      return (
        typeof row.timeToImpactSec === "number" && row.timeToImpactSec <= 60
      );
    }

    return (
      typeof row.weapon.targetId === "string" &&
      saturationTargetIds.has(row.weapon.targetId)
    );
  });
}

function filterBattleSpectatorImpactTimelineRows(
  rows: BattleSpectatorImpactTimelineRow[],
  priorityFilter: BattleSpectatorPriorityFilter,
  saturationTargetIds: Set<string>
) {
  if (priorityFilter === "all") {
    return rows;
  }

  return rows.filter((row) => {
    if (priorityFilter === "urgent") {
      return row.etaSec <= 30;
    }

    if (priorityFilter === "imminent") {
      return row.etaSec <= 60;
    }

    return (
      typeof row.weapon.targetId === "string" &&
      saturationTargetIds.has(row.weapon.targetId)
    );
  });
}

function filterBattleSpectatorAssetRiskRows(
  rows: BattleSpectatorAssetRiskRow[],
  priorityFilter: BattleSpectatorPriorityFilter
) {
  if (priorityFilter === "all") {
    return rows;
  }

  return rows.filter((row) => {
    if (priorityFilter === "urgent") {
      return row.earliestEtaSec <= 30;
    }

    if (priorityFilter === "imminent") {
      return row.earliestEtaSec <= 60;
    }

    return row.incomingCount >= 2;
  });
}

function getBattleSpectatorTrendTone(delta: number) {
  if (delta >= 8) {
    return "#62e6d0";
  }
  if (delta <= -8) {
    return "#ff7b72";
  }
  return "#ffd166";
}

function getBattleSpectatorSideCssColor(sideColor: string) {
  switch (sideColor.trim().toLowerCase()) {
    case "blue":
      return "#7fe7ff";
    case "red":
      return "#ff6b6b";
    case "yellow":
      return "#ffd166";
    case "green":
      return "#80ed99";
    case "black":
      return "#f1f5f9";
    case "silver":
      return "#dce5f2";
    default:
      return sideColor;
  }
}

function buildBattleSpectatorPowerHistoryBars(history: number[]) {
  if (history.length === 0) {
    return [];
  }

  const maxPower = Math.max(...history, 1);
  return history.map((value, index) => ({
    id: `${index}-${value}`,
    heightPercent: Math.max(18, Math.round((value / maxPower) * 100)),
    active: index === history.length - 1,
  }));
}

function filterBattleSpectatorState(
  state: BattleSpectatorState,
  sideFilterId: string
): BattleSpectatorState {
  if (sideFilterId === "all") {
    return state;
  }

  const units = state.units.filter((unit) => unit.sideId === sideFilterId);
  const visibleUnitIds = new Set(units.map((unit) => unit.id));
  const weapons = state.weapons.filter(
    (weapon) =>
      weapon.sideId === sideFilterId ||
      visibleUnitIds.has(weapon.launcherId) ||
      (typeof weapon.targetId === "string" &&
        visibleUnitIds.has(weapon.targetId))
  );
  const recentEvents = state.recentEvents.filter(
    (event) =>
      event.sideId === sideFilterId ||
      (typeof event.actorId === "string" &&
        visibleUnitIds.has(event.actorId)) ||
      (typeof event.targetId === "string" && visibleUnitIds.has(event.targetId))
  );

  return {
    ...state,
    units,
    weapons,
    recentEvents,
    stats: buildBattleSpectatorStats({
      ...state,
      units,
      weapons,
    }),
  };
}

function hasFiniteBattleSpectatorPoint(
  longitude: number | null | undefined,
  latitude: number | null | undefined
) {
  return (
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    typeof latitude === "number" &&
    Number.isFinite(latitude)
  );
}

function resolveBattleSpectatorJumpPoint(state?: BattleSpectatorState) {
  if (!state) {
    return null;
  }

  const latestWeapon =
    state.weapons.length > 0 ? state.weapons[state.weapons.length - 1] : null;
  if (latestWeapon) {
    return {
      longitude: latestWeapon.longitude,
      latitude: latestWeapon.latitude,
      altitudeMeters: Math.max(1800, latestWeapon.altitudeMeters + 900),
      followTargetId: `weapon:${latestWeapon.id}`,
    };
  }

  const latestEventWithPoint = [...state.recentEvents]
    .reverse()
    .find((event) =>
      hasFiniteBattleSpectatorPoint(event.focusLongitude, event.focusLatitude)
    );

  if (latestEventWithPoint) {
    return {
      longitude: latestEventWithPoint.focusLongitude as number,
      latitude: latestEventWithPoint.focusLatitude as number,
      altitudeMeters: Math.max(
        2600,
        (latestEventWithPoint.focusAltitudeMeters ?? 0) + 3200
      ),
      followTargetId:
        typeof latestEventWithPoint.weaponId === "string"
          ? `weapon:${latestEventWithPoint.weaponId}`
          : typeof latestEventWithPoint.targetId === "string"
            ? `unit:${latestEventWithPoint.targetId}`
            : typeof latestEventWithPoint.actorId === "string"
              ? `unit:${latestEventWithPoint.actorId}`
              : undefined,
    };
  }

  const selectedUnit =
    state.units.find((unit) => unit.selected) ?? state.units[0];
  if (selectedUnit) {
    return {
      longitude: selectedUnit.longitude,
      latitude: selectedUnit.latitude,
      altitudeMeters: Math.max(2600, selectedUnit.altitudeMeters + 2600),
      followTargetId: `unit:${selectedUnit.id}`,
    };
  }

  if (
    hasFiniteBattleSpectatorPoint(state.centerLongitude, state.centerLatitude)
  ) {
    return {
      longitude: state.centerLongitude as number,
      latitude: state.centerLatitude as number,
      altitudeMeters: 9000,
      followTargetId: undefined,
    };
  }

  return null;
}

function parseBattleSpectatorFollowTargetId(followTargetId: string) {
  if (!followTargetId) {
    return null;
  }

  if (followTargetId.startsWith("weapon:")) {
    return {
      type: "weapon" as const,
      id: followTargetId.slice("weapon:".length),
    };
  }

  if (followTargetId.startsWith("unit:")) {
    return {
      type: "unit" as const,
      id: followTargetId.slice("unit:".length),
    };
  }

  return {
    type: "unit" as const,
    id: followTargetId,
  };
}

function resolveInitialBattleSpectatorPanelOpen() {
  return false;
}

function resolveBattleSpectatorInspectTarget(
  inspectTargetId: string,
  state: BattleSpectatorState | undefined,
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>,
  allWeaponsById: Map<string, BattleSpectatorWeaponSnapshot>,
  allTrajectoryRows: BattleSpectatorTrajectoryRow[],
  allImpactTimelineRows: BattleSpectatorImpactTimelineRow[]
): BattleSpectatorInspectTarget | null {
  const parsedInspectTarget = parseBattleSpectatorFollowTargetId(inspectTargetId);
  if (!parsedInspectTarget) {
    return null;
  }

  if (parsedInspectTarget.type === "weapon") {
    const weapon = allWeaponsById.get(parsedInspectTarget.id);
    if (!weapon) {
      return null;
    }

    return {
      kind: "weapon",
      followTargetId: `weapon:${weapon.id}`,
      weapon,
      trajectory:
        allTrajectoryRows.find((row) => row.weapon.id === weapon.id) ?? null,
      impactTimeline:
        allImpactTimelineRows.find((row) => row.weapon.id === weapon.id) ??
        null,
      launcherUnit: allUnitsById.get(weapon.launcherId),
      targetUnit: weapon.targetId
        ? allUnitsById.get(weapon.targetId)
        : undefined,
    };
  }

  const unit = allUnitsById.get(parsedInspectTarget.id);
  const insight = buildBattleSpectatorSelectedUnitInsight(
    unit,
    state,
    allUnitsById
  );
  if (!unit || !insight) {
    return null;
  }

  return {
    kind: "unit",
    followTargetId: `unit:${unit.id}`,
    unit,
    insight,
  };
}

function formatBattleSpectatorEntityType(
  entityType: BattleSpectatorEntityType
) {
  switch (entityType) {
    case "aircraft":
      return "항공";
    case "army":
      return "지상군";
    case "facility":
      return "지상시설";
    case "airbase":
      return "기지";
    case "ship":
      return "함정";
    default:
      return entityType;
  }
}

function formatBattleSpectatorHeading(headingDeg: number) {
  const normalizedHeading = ((Math.round(headingDeg) % 360) + 360) % 360;
  return `${normalizedHeading.toString().padStart(3, "0")}°`;
}

function formatBattleSpectatorHp(hpFraction: number) {
  return `${Math.round(Math.max(0, Math.min(1, hpFraction)) * 100)}%`;
}

function formatBattleSpectatorAltitude(altitudeMeters: number) {
  if (!Number.isFinite(altitudeMeters)) {
    return "-";
  }

  if (altitudeMeters >= 1000) {
    return `${(altitudeMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(altitudeMeters)} m`;
}

function formatBattleSpectatorTimestamp(timestamp: number | null | undefined) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return "--:--:--";
  }

  const resolvedTimestamp =
    timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;

  return new Date(resolvedTimestamp).toLocaleTimeString("ko-KR", {
    hour12: false,
  });
}

function getBattleSpectatorHpTone(hpFraction: number) {
  if (hpFraction >= 0.75) {
    return "#6ef0c8";
  }
  if (hpFraction >= 0.45) {
    return "#ffd166";
  }
  return "#ff7b72";
}

function resolveBattleSpectatorUnitJumpPoint(
  unit: BattleSpectatorUnitSnapshot
) {
  const altitudeOffset = unit.entityType === "aircraft" ? 1000 : 2200;
  const minimumAltitude = unit.entityType === "aircraft" ? 1800 : 2600;

  return {
    longitude: unit.longitude,
    latitude: unit.latitude,
    altitudeMeters: Math.max(
      minimumAltitude,
      unit.altitudeMeters + altitudeOffset
    ),
    followTargetId: `unit:${unit.id}`,
  };
}

function resolveBattleSpectatorWeaponJumpPoint(
  weapon: BattleSpectatorWeaponSnapshot
) {
  return {
    longitude: weapon.longitude,
    latitude: weapon.latitude,
    altitudeMeters: Math.max(1600, weapon.altitudeMeters + 700),
    followTargetId: `weapon:${weapon.id}`,
  };
}

function resolveBattleSpectatorWeaponFocusFraming(
  weapon: BattleSpectatorWeaponSnapshot
): {
  durationSeconds: number;
  pitchDegrees: number;
  rangeMeters: number;
  headingDegrees?: number;
} {
  return {
    durationSeconds: 1.05,
    headingDegrees: weapon.headingDeg + 170,
    pitchDegrees: -15,
    rangeMeters: weapon.altitudeMeters >= 2400 ? 2200 : 1700,
  };
}

function formatBattleSpectatorCameraProfileLabel(
  cameraProfile: BattleSpectatorCameraProfile
) {
  return (
    BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS.find(
      (option) => option.id === cameraProfile
    )?.label ?? "전술"
  );
}

function resolveBattleSpectatorHeroProfileForUnit(
  unit: BattleSpectatorUnitSnapshot
): ImmersiveExperienceProfile {
  if (unit.entityType === "aircraft" || unit.entityType === "airbase") {
    return "base";
  }
  if (unit.entityType === "ship") {
    return "maritime";
  }
  return unit.profileHint;
}

function buildBattleSpectatorHeroUnitAsset(
  unit: BattleSpectatorUnitSnapshot
): AssetExperienceSummary {
  const inventoryTotals = unit.weaponInventory.reduce(
    (totals, item) => {
      totals.currentQuantity += item.quantity;
      totals.maxQuantity += item.maxQuantity;
      return totals;
    },
    { currentQuantity: 0, maxQuantity: 0 }
  );
  const rangeReference = Math.max(unit.detectionRangeNm, unit.engagementRangeNm);

  return {
    kind:
      unit.entityType === "aircraft"
        ? "aircraft"
        : unit.entityType === "ship"
          ? "ship"
          : unit.entityType === "airbase"
            ? "airbase"
            : "facility",
    id: unit.id,
    name: unit.name,
    className: unit.className,
    sideName: unit.sideName,
    latitude: unit.latitude,
    longitude: unit.longitude,
    altitude: unit.altitudeMeters,
    heading: unit.headingDeg,
    speed: unit.speedKts,
    range: rangeReference > 0 ? rangeReference : undefined,
    currentFuel: unit.currentFuel,
    maxFuel: unit.maxFuel,
    weaponCount: unit.weaponCount,
    aircraftCount: unit.aircraftCount,
    currentQuantity:
      inventoryTotals.maxQuantity > 0 ? inventoryTotals.currentQuantity : undefined,
    maxQuantity:
      inventoryTotals.maxQuantity > 0 ? inventoryTotals.maxQuantity : undefined,
  };
}

function buildBattleSpectatorHeroWeaponAsset(
  weapon: BattleSpectatorWeaponSnapshot,
  targetUnit?: BattleSpectatorUnitSnapshot
): AssetExperienceSummary {
  const hasTargetPoint =
    typeof weapon.targetLatitude === "number" &&
    typeof weapon.targetLongitude === "number";
  const deltaLatitude = hasTargetPoint
    ? Math.abs((weapon.targetLatitude as number) - weapon.latitude)
    : 0;
  const deltaLongitude = hasTargetPoint
    ? Math.abs((weapon.targetLongitude as number) - weapon.longitude)
    : 0;
  const approximateRange = hasTargetPoint
    ? Math.max(6, Math.round((deltaLatitude + deltaLongitude) * 60))
    : undefined;

  return {
    kind: "weapon",
    id: weapon.id,
    name: weapon.name,
    className: weapon.className,
    sideName: weapon.sideName,
    latitude: weapon.latitude,
    longitude: weapon.longitude,
    altitude: weapon.altitudeMeters,
    heading: weapon.headingDeg,
    speed: weapon.speedKts,
    range: approximateRange,
    weaponCount: 1,
    missionName: targetUnit?.name,
  };
}

function isBattleSpectatorRotaryWingAsset(asset: AssetExperienceSummary) {
  const signature = `${asset.className} ${asset.name}`.toLowerCase();
  return /(apache|blackhawk|black hawk|helicopter|helo|rotary|uh-|ah-|ch-)/.test(
    signature
  );
}

function resolveBattleSpectatorHeroWeaponProfile(
  weapon: BattleSpectatorWeaponSnapshot,
  launcherUnit?: BattleSpectatorUnitSnapshot,
  targetUnit?: BattleSpectatorUnitSnapshot
): ImmersiveExperienceProfile {
  if (
    launcherUnit?.entityType === "aircraft" ||
    targetUnit?.entityType === "aircraft"
  ) {
    return "base";
  }
  if (
    launcherUnit?.entityType === "ship" ||
    targetUnit?.entityType === "ship"
  ) {
    return "maritime";
  }
  return inferImmersiveExperienceProfile(
    buildBattleSpectatorHeroWeaponAsset(weapon, targetUnit)
  );
}

function resolveBattleSpectatorHeroOperationMode(
  profile: ImmersiveExperienceProfile,
  asset: AssetExperienceSummary
) {
  const signature = `${asset.className} ${asset.name}`.toLowerCase();

  switch (profile) {
    case "ground":
      return (asset.speed ?? 0) >= 16 || /tank|ifv|apc|armor|armour|k2|k1|k21/.test(
        signature
      )
        ? "breakthrough"
        : "convoy-guard";
    case "fires":
      return (asset.weaponCount ?? 0) >= 3 ||
        /rocket|mlrs|launcher|battery|chunmoo|himars/.test(signature)
        ? "saturation"
        : "deep-strike";
    case "defense":
      return "point-defense";
    case "maritime":
      return (asset.aircraftCount ?? 0) > 0 || (asset.weaponCount ?? 0) >= 4
        ? "carrier-screen"
        : "silent-patrol";
    case "base":
      return isBattleSpectatorRotaryWingAsset(asset)
        ? "rotary-lift"
        : "drone-watch";
  }
}

function buildBattleSpectatorHeroRelatedEventItems(
  target: BattleSpectatorInspectTarget,
  state: BattleSpectatorState | undefined
) {
  if (!state) {
    return [];
  }

  const relatedEvents = state.recentEvents.filter((event) => {
    if (target.kind === "unit") {
      return (
        event.actorId === target.unit.id ||
        event.targetId === target.unit.id
      );
    }

    return (
      event.weaponId === target.weapon.id ||
      event.actorId === target.weapon.launcherId ||
      event.targetId === target.weapon.targetId
    );
  });

  return relatedEvents
    .slice(Math.max(0, relatedEvents.length - 4))
    .reverse()
    .map((event) => event.message);
}

function resolveBattleSpectatorHeroContextAsset(
  target: BattleSpectatorInspectTarget
) {
  if (target.kind === "unit") {
    return buildBattleSpectatorHeroUnitAsset(target.unit);
  }

  if (target.launcherUnit) {
    return buildBattleSpectatorHeroUnitAsset(target.launcherUnit);
  }

  if (target.targetUnit) {
    return buildBattleSpectatorHeroUnitAsset(target.targetUnit);
  }

  return null;
}

function buildBattleSpectatorHeroFallbackFeed(
  target: BattleSpectatorInspectTarget,
  state: BattleSpectatorState | undefined
) {
  const relatedEventItems = buildBattleSpectatorHeroRelatedEventItems(
    target,
    state
  );

  if (target.kind === "unit") {
    return {
      sourceLabel: target.unit.sideName,
      timeLabel: formatBattleSpectatorTimestamp(state?.currentTime),
      targetLabel: target.insight.targetName ?? target.unit.name,
      eventHeadline: `${target.unit.name} 교전 추적`,
      eventItems:
        relatedEventItems.length > 0
          ? relatedEventItems
          : [`${target.unit.name} 주변 교전 이벤트를 수집 중입니다.`],
      metrics: [
        {
          label: "Incoming",
          value: `${target.insight.incomingWeapons}`,
        },
        {
          label: "Outgoing",
          value: `${target.insight.outgoingWeapons}`,
        },
        {
          label: "Target",
          value: target.insight.targetName ?? "탐색 중",
        },
      ],
    };
  }

  return {
    sourceLabel: target.launcherUnit?.name ?? target.weapon.launcherName,
    timeLabel: formatBattleSpectatorTimestamp(state?.currentTime),
    targetLabel: target.targetUnit?.name ?? target.trajectory?.targetName ?? "미상",
    eventHeadline: `${target.weapon.name} 비행 추적`,
    eventItems:
      relatedEventItems.length > 0
        ? relatedEventItems
        : [`${target.weapon.name} 비행 궤적을 추적 중입니다.`],
    metrics: [
      {
        label: "ETA",
        value: formatBattleSpectatorEta(target.impactTimeline?.etaSec),
      },
      {
        label: "Phase",
        value: target.trajectory?.phaseLabel ?? "비행 중",
      },
      {
        label: "Target",
        value: target.targetUnit?.name ?? target.trajectory?.targetName ?? "미상",
      },
    ],
  };
}

function buildBattleSpectatorHeroView(
  target: BattleSpectatorInspectTarget | null,
  cameraProfile: BattleSpectatorCameraProfile,
  state: BattleSpectatorState | undefined
): BattleSpectatorHeroViewportState | null {
  if (!target) {
    return null;
  }

  if (target.kind === "unit") {
    const asset = buildBattleSpectatorHeroUnitAsset(target.unit);
    const profile = resolveBattleSpectatorHeroProfileForUnit(target.unit);
    const operationMode = resolveBattleSpectatorHeroOperationMode(profile, asset);
    const selection =
      getBundleModelById(target.unit.modelId) ??
      selectImmersiveExperienceModel(asset, profile) ??
      selectAssetExperienceModel(asset);
    if (!selection) {
      return null;
    }
    const liveTwinRuntime = state
      ? buildImmersiveLiveTwinRuntime(
          state,
          asset,
          profile,
          selection,
          [selection],
          operationMode
        )
      : null;
    const fallbackFeed = buildBattleSpectatorHeroFallbackFeed(target, state);

    const accentColor = getBattleSpectatorSideCssColor(target.unit.sideColor);
    const metrics: BattleSpectatorHeroViewportMetric[] = [
      { label: "시점", value: formatBattleSpectatorCameraProfileLabel(cameraProfile) },
      { label: "고도", value: formatBattleSpectatorAltitude(target.unit.altitudeMeters) },
      { label: "속도", value: `${Math.round(target.unit.speedKts)} kt` },
      { label: "내구", value: formatBattleSpectatorHp(target.unit.hpFraction) },
      { label: "무장", value: `${target.unit.weaponCount}` },
      {
        label: "교전",
        value: target.insight.targetName ?? "탐색 중",
      },
    ];

    return {
      id: target.followTargetId,
      title: asset.name,
      subtitle: `${asset.sideName} · ${formatBattleSpectatorEntityType(
        target.unit.entityType
      )} · ${selection.label}`,
      detail: `교전 대상 ${target.insight.targetName ?? "미상"} · incoming ${target.insight.incomingWeapons} · outgoing ${target.insight.outgoingWeapons} · 자동 발사 연출`,
      accentColor,
      glowColor: accentColor,
      asset,
      selection,
      profile,
      simulation: {
        profile,
        operationMode,
        assetKind: asset.kind,
        className: asset.className,
        modelId: selection.id,
        range: asset.range,
        heading: asset.heading,
        speed: asset.speed,
        weaponCount: asset.weaponCount,
        aircraftCount: asset.aircraftCount,
        compareCount: 1 + (liveTwinRuntime?.comparisonSelections.length ?? 0),
      },
      badges: [
        `TRACK ${formatBattleSpectatorCameraProfileLabel(cameraProfile)}`,
        "AUTO FIRE",
        target.unit.selected ? "PRIORITY" : "LIVE",
      ],
      metrics,
      comparisonSelections: liveTwinRuntime?.comparisonSelections ?? [],
      lineup: liveTwinRuntime?.lineup ?? [],
      summary: liveTwinRuntime?.summary ?? null,
      feed: liveTwinRuntime?.feed ?? fallbackFeed,
    };
  }

  const asset = buildBattleSpectatorHeroWeaponAsset(
    target.weapon,
    target.targetUnit
  );
  const profile = resolveBattleSpectatorHeroWeaponProfile(
    target.weapon,
    target.launcherUnit,
    target.targetUnit
  );
  const operationMode = resolveBattleSpectatorHeroOperationMode(profile, asset);
  const selection =
    getBundleModelById(target.weapon.modelId) ??
    selectImmersiveExperienceModel(asset, profile) ??
    selectAssetExperienceModel(asset);
  if (!selection) {
    return null;
  }
  const contextAsset = resolveBattleSpectatorHeroContextAsset(target);
  const liveTwinRuntime =
    state && contextAsset
      ? buildImmersiveLiveTwinRuntime(
          state,
          contextAsset,
          profile,
          selection,
          [selection],
          operationMode
        )
      : null;
  const fallbackFeed = buildBattleSpectatorHeroFallbackFeed(target, state);

  const accentColor = getBattleSpectatorSideCssColor(target.weapon.sideColor);
  const metrics: BattleSpectatorHeroViewportMetric[] = [
    { label: "시점", value: formatBattleSpectatorCameraProfileLabel(cameraProfile) },
    { label: "고도", value: formatBattleSpectatorAltitude(target.weapon.altitudeMeters) },
    { label: "속도", value: `${Math.round(target.weapon.speedKts)} kt` },
    { label: "ETA", value: formatBattleSpectatorEta(target.impactTimeline?.etaSec) },
    { label: "목표", value: target.targetUnit?.name ?? target.trajectory?.targetName ?? "미상" },
    {
      label: "위협",
      value: formatBattleSpectatorThreatRadius(
        target.trajectory?.threatRadiusMeters
      ),
    },
  ];

  return {
    id: target.followTargetId,
    title: asset.name,
    subtitle: `${asset.sideName} · 유도탄 · ${selection.label}`,
    detail: `${target.launcherUnit?.name ?? target.weapon.launcherName} 발사 · ${target.trajectory?.phaseLabel ?? "비행 중"} · 목표 ${target.targetUnit?.name ?? target.trajectory?.targetName ?? "미상"}`,
    accentColor,
    glowColor: accentColor,
    asset,
    selection,
    profile,
    simulation: {
      profile,
      operationMode,
      assetKind: asset.kind,
      className: asset.className,
      modelId: selection.id,
      range: asset.range,
      heading: asset.heading,
      speed: asset.speed,
      weaponCount: 1,
      aircraftCount: 0,
      compareCount: 1 + (liveTwinRuntime?.comparisonSelections.length ?? 0),
    },
    badges: [
      `TRACK ${formatBattleSpectatorCameraProfileLabel(cameraProfile)}`,
      "AUTO FIRE",
      target.trajectory?.phaseLabel ?? "LIVE",
    ],
    metrics,
    comparisonSelections: liveTwinRuntime?.comparisonSelections ?? [],
    lineup: liveTwinRuntime?.lineup ?? [],
    summary: liveTwinRuntime?.summary ?? null,
    feed: liveTwinRuntime?.feed ?? fallbackFeed,
  };
}

function resolveBattleSpectatorUnitCameraProfile(
  unit: BattleSpectatorUnitSnapshot
): BattleSpectatorCameraProfile {
  if (isFiresFacilityClassName(unit.className)) {
    return "side";
  }

  if (
    unit.entityType === "army" ||
    unit.groundUnit ||
    isTankFacilityClassName(unit.className) ||
    unit.modelId === "tank-tracked-armor"
  ) {
    return "chase";
  }

  if (unit.entityType === "ship") {
    return "chase";
  }

  return "orbit";
}

function resolveBattleSpectatorFollowTargetCameraProfile(
  followTargetId: string | undefined,
  state: BattleSpectatorState | undefined
): BattleSpectatorCameraProfile | null {
  const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
    followTargetId ?? ""
  );
  if (!parsedFollowTarget || parsedFollowTarget.type !== "unit" || !state) {
    return null;
  }

  const unit = state.units.find(
    (candidate) => candidate.id === parsedFollowTarget.id
  );
  return unit ? resolveBattleSpectatorUnitCameraProfile(unit) : null;
}

function applyBattleSpectatorFollowTargetSelection(
  followTargetId: string,
  stateForProfile: BattleSpectatorState | undefined,
  currentCameraProfile: BattleSpectatorCameraProfile,
  setFollowTargetId: (followTargetId: string) => void,
  setCameraProfile: (cameraProfile: BattleSpectatorCameraProfile) => void
) {
  setFollowTargetId(followTargetId);
  setCameraProfile(
    resolveBattleSpectatorFollowTargetCameraProfile(
      followTargetId,
      stateForProfile
    ) ?? currentCameraProfile
  );
}

function resolveBattleSpectatorPatrolUnitPreset(
  unit: BattleSpectatorUnitSnapshot
) {
  if (
    unit.entityType === "aircraft" &&
    isDroneAircraftClassName(unit.className)
  ) {
    return {
      kind: "drone" as const,
      label: "드론 시점",
      cameraProfile: resolveBattleSpectatorUnitCameraProfile(unit),
    };
  }

  if (
    isTankFacilityClassName(unit.className) ||
    unit.modelId === "tank-tracked-armor"
  ) {
    return {
      kind: "armor" as const,
      label: "전차 시점",
      cameraProfile: resolveBattleSpectatorUnitCameraProfile(unit),
    };
  }

  if (isFiresFacilityClassName(unit.className)) {
    return {
      kind: "fires" as const,
      label: "포대 시점",
      cameraProfile: "side" as const,
    };
  }

  if (unit.entityType === "ship") {
    return {
      kind: "ship" as const,
      label: "함정 시점",
      cameraProfile: "chase" as const,
    };
  }

  if (unit.entityType === "aircraft") {
    return {
      kind: "aircraft" as const,
      label: "항공 시점",
      cameraProfile: resolveBattleSpectatorUnitCameraProfile(unit),
    };
  }

  if (unit.groundUnit || unit.entityType === "army") {
    return {
      kind: "ground" as const,
      label: "지상 자산 시점",
      cameraProfile: "chase" as const,
    };
  }

  return null;
}

function resolveBattleSpectatorUnitIconType(
  unit: BattleSpectatorUnitSnapshot
): ToolbarEntityType {
  if (
    unit.entityType === "aircraft" &&
    isDroneAircraftClassName(unit.className)
  ) {
    return "drone";
  }
  if (
    isTankFacilityClassName(unit.className) ||
    unit.modelId === "tank-tracked-armor"
  ) {
    return "tank";
  }
  if (unit.entityType === "aircraft") {
    return "aircraft";
  }
  if (unit.entityType === "airbase") {
    return "airbase";
  }
  if (unit.entityType === "ship") {
    return "ship";
  }
  if (unit.entityType === "army") {
    return "tank";
  }
  return "facility";
}

function resolveBattleSpectatorUnitFocusFraming(
  unit: BattleSpectatorUnitSnapshot
): {
  durationSeconds: number;
  pitchDegrees: number;
  rangeMeters: number;
  headingDegrees?: number;
} {
  if (
    unit.entityType === "aircraft" &&
    isDroneAircraftClassName(unit.className)
  ) {
    return {
      durationSeconds: 1.05,
      headingDegrees: unit.headingDeg + 180,
      pitchDegrees: -12,
      rangeMeters: 1850,
    };
  }
  if (unit.entityType === "aircraft") {
    return {
      durationSeconds: 1.1,
      headingDegrees: unit.headingDeg + 180,
      pitchDegrees: -14,
      rangeMeters: 2450,
    };
  }
  if (
    isTankFacilityClassName(unit.className) ||
    unit.modelId === "tank-tracked-armor"
  ) {
    return {
      durationSeconds: 1.05,
      headingDegrees: unit.headingDeg + 180,
      pitchDegrees: -14,
      rangeMeters: 1120,
    };
  }
  if (isFiresFacilityClassName(unit.className)) {
    return {
      durationSeconds: 1.1,
      headingDegrees: unit.headingDeg + 110,
      pitchDegrees: -15,
      rangeMeters: 1420,
    };
  }
  if (unit.entityType === "ship") {
    return {
      durationSeconds: 1.15,
      headingDegrees: unit.headingDeg + 180,
      pitchDegrees: -16,
      rangeMeters: 2100,
    };
  }

  return {
    durationSeconds: 1.05,
    headingDegrees: unit.headingDeg + 180,
    pitchDegrees: -15,
    rangeMeters: 1320,
  };
}

function resolveBattleSpectatorSceneFocusFraming(
  kind: BattleSpectatorPatrolTargetKind
) {
  switch (kind) {
    case "impact":
      return {
        durationSeconds: 1.2,
        pitchDegrees: -18,
        rangeMeters: 2400,
      };
    case "hotspot":
      return {
        durationSeconds: 1.25,
        pitchDegrees: -22,
        rangeMeters: 3200,
      };
    case "engagement":
      return {
        durationSeconds: 1.25,
        pitchDegrees: -20,
        rangeMeters: 2800,
      };
    default:
      return {
        durationSeconds: 1.2,
        pitchDegrees: -18,
        rangeMeters: 2400,
      };
  }
}

function resolveBattleSpectatorPatrolUnitPriority(
  unit: BattleSpectatorUnitSnapshot
) {
  let priority = unit.selected ? 120 : 0;

  if (unit.entityType === "aircraft") {
    priority += 28;
  }
  if (isDroneAircraftClassName(unit.className)) {
    priority += 32;
  }
  if (
    isTankFacilityClassName(unit.className) ||
    unit.modelId === "tank-tracked-armor"
  ) {
    priority += 26;
  }
  if (isFiresFacilityClassName(unit.className)) {
    priority += 18;
  }
  if (unit.entityType === "ship") {
    priority += 16;
  }

  priority += unit.weaponCount * 5;
  priority += Math.round((1 - unit.hpFraction) * 18);
  priority += Math.round(unit.speedKts / 20);

  return priority;
}

function buildBattleSpectatorPatrolUnitTargets(
  state: BattleSpectatorState | undefined
) {
  if (!state) {
    return [] as BattleSpectatorPatrolTarget[];
  }

  const bestTargetsByKind = new Map<
    BattleSpectatorPatrolTargetKind,
    { priority: number; target: BattleSpectatorPatrolTarget }
  >();

  state.units.forEach((unit) => {
    const preset = resolveBattleSpectatorPatrolUnitPreset(unit);
    if (!preset) {
      return;
    }

    const priority = resolveBattleSpectatorPatrolUnitPriority(unit);
    const existing = bestTargetsByKind.get(preset.kind);
    if (existing && existing.priority >= priority) {
      return;
    }

    bestTargetsByKind.set(preset.kind, {
      priority,
      target: {
        id: `patrol-unit-${preset.kind}-${unit.id}`,
        label: preset.label,
        detail: `${unit.name} · ${unit.sideName} · 체력 ${formatBattleSpectatorHp(
          unit.hpFraction
        )}`,
        kind: preset.kind,
        point: resolveBattleSpectatorUnitJumpPoint(unit),
        followTargetId: `unit:${unit.id}`,
        cameraProfile: preset.cameraProfile,
        ...resolveBattleSpectatorUnitFocusFraming(unit),
      },
    });
  });

  const orderedKinds: BattleSpectatorPatrolTargetKind[] = [
    "drone",
    "armor",
    "fires",
    "aircraft",
    "ship",
    "ground",
  ];

  return orderedKinds.flatMap(
    (kind) => bestTargetsByKind.get(kind)?.target ?? []
  );
}

function getBattleSpectatorPatrolTargetTone(
  kind: BattleSpectatorPatrolTargetKind
) {
  switch (kind) {
    case "impact":
      return "#ff8f70";
    case "drone":
      return "#62e6d0";
    case "armor":
      return "#ffd166";
    case "fires":
      return "#ffb347";
    case "aircraft":
      return "#84d8ff";
    case "ship":
      return "#9db4ff";
    case "ground":
      return "#c8f7a6";
    case "hotspot":
      return "#ff7b72";
    default:
      return "#84d8ff";
  }
}

function resolveBattleSpectatorSceneEntryLabel(
  target: BattleSpectatorPatrolTarget
) {
  const detailHeadline = target.detail.split(" · ")[0]?.trim() ?? "";

  if (target.kind === "impact") {
    return detailHeadline ? `${detailHeadline} 타격 지점` : "타격 지점";
  }
  if (target.kind === "hotspot") {
    return detailHeadline || "교전 지점";
  }
  if (target.kind === "engagement") {
    return "최신 교전";
  }

  return target.label;
}

function resolveBattleSpectatorEventJumpPoint(event: BattleSpectatorEvent) {
  if (
    !hasFiniteBattleSpectatorPoint(event.focusLongitude, event.focusLatitude)
  ) {
    return null;
  }

  return {
    longitude: event.focusLongitude as number,
    latitude: event.focusLatitude as number,
    altitudeMeters: Math.max(2000, (event.focusAltitudeMeters ?? 0) + 2000),
  };
}

function resolveBattleSpectatorSideJumpPoint(
  state: BattleSpectatorState,
  sideId: string
) {
  const latestWeapon = [...state.weapons]
    .reverse()
    .find((weapon) => weapon.sideId === sideId);
  if (latestWeapon) {
    return {
      point: resolveBattleSpectatorWeaponJumpPoint(latestWeapon),
      followTargetId: `weapon:${latestWeapon.id}`,
    };
  }

  const latestEvent = [...state.recentEvents]
    .reverse()
    .find(
      (event) =>
        event.sideId === sideId && resolveBattleSpectatorEventJumpPoint(event)
    );
  if (latestEvent) {
    const eventPoint = resolveBattleSpectatorEventJumpPoint(latestEvent);
    if (!eventPoint) {
      return null;
    }

    return {
      point: eventPoint,
      followTargetId:
        typeof latestEvent.weaponId === "string"
          ? `weapon:${latestEvent.weaponId}`
          : typeof latestEvent.targetId === "string"
            ? `unit:${latestEvent.targetId}`
            : typeof latestEvent.actorId === "string"
              ? `unit:${latestEvent.actorId}`
              : undefined,
    };
  }

  const representativeUnit =
    state.units.find((unit) => unit.sideId === sideId && unit.selected) ??
    [...state.units]
      .filter((unit) => unit.sideId === sideId)
      .sort((left, right) => right.weaponCount - left.weaponCount)[0];

  if (!representativeUnit) {
    return null;
  }

  return {
    point: resolveBattleSpectatorUnitJumpPoint(representativeUnit),
    followTargetId: `unit:${representativeUnit.id}`,
  };
}

function clampBattleSpectatorValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distanceKmBetweenBattleSpectatorPoints(
  source: { longitude: number; latitude: number } | null | undefined,
  target: { longitude: number; latitude: number } | null | undefined
) {
  if (
    !source ||
    !target ||
    !Number.isFinite(source.longitude) ||
    !Number.isFinite(source.latitude) ||
    !Number.isFinite(target.longitude) ||
    !Number.isFinite(target.latitude)
  ) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDeltaRadians =
    ((target.latitude - source.latitude) * Math.PI) / 180;
  const longitudeDeltaRadians =
    ((target.longitude - source.longitude) * Math.PI) / 180;
  const sourceLatitudeRadians = (source.latitude * Math.PI) / 180;
  const targetLatitudeRadians = (target.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDeltaRadians / 2) ** 2 +
    Math.cos(sourceLatitudeRadians) *
      Math.cos(targetLatitudeRadians) *
      Math.sin(longitudeDeltaRadians / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function isBattleSpectatorTrajectoryWeapon(
  weapon: BattleSpectatorWeaponSnapshot
) {
  if (
    weapon.modelId === "weapon-air-to-air-missile" ||
    weapon.modelId === "weapon-surface-missile"
  ) {
    return true;
  }
  if (weapon.modelId === "weapon-artillery-shell") {
    return false;
  }

  const signature = `${weapon.className} ${weapon.name}`;
  if (NON_TRAJECTORY_WEAPON_SIGNATURE.test(signature)) {
    return false;
  }

  return TRAJECTORY_WEAPON_SIGNATURE.test(signature);
}

function formatBattleSpectatorDistanceKm(distanceKm: number | null) {
  if (distanceKm === null || !Number.isFinite(distanceKm)) {
    return "거리 미상";
  }

  return distanceKm >= 10
    ? `${distanceKm.toFixed(0)}km`
    : `${distanceKm.toFixed(1)}km`;
}

function estimateBattleSpectatorTimeToImpactSec(
  remainingDistanceKm: number | null,
  speedKts: number
) {
  if (
    remainingDistanceKm === null ||
    !Number.isFinite(remainingDistanceKm) ||
    !Number.isFinite(speedKts)
  ) {
    return null;
  }

  const speedKmh = Math.max(0, speedKts) * 1.852;
  if (speedKmh <= 1) {
    return null;
  }

  return (remainingDistanceKm / speedKmh) * 3600;
}

function resolveBattleSpectatorThreatRadiusMeters(
  weapon: BattleSpectatorWeaponSnapshot,
  targetUnit?: BattleSpectatorUnitSnapshot | null
) {
  if (targetUnit?.entityType === "aircraft") {
    return 280;
  }

  const signature = `${weapon.className} ${weapon.name}`.toLowerCase();
  if (/hyunmoo|jassm|tomahawk|ballistic|cruise/.test(signature)) {
    return 1200;
  }
  if (
    weapon.modelId === "weapon-surface-missile" ||
    /agm|asm|atgm|guided|rocket|sam|missile/.test(signature)
  ) {
    return 650;
  }
  if (
    weapon.modelId === "weapon-air-to-air-missile" ||
    /aim-|aam/.test(signature)
  ) {
    return 320;
  }

  return 420;
}

function formatBattleSpectatorThreatRadius(threatRadiusMeters?: number | null) {
  if (
    typeof threatRadiusMeters !== "number" ||
    !Number.isFinite(threatRadiusMeters) ||
    threatRadiusMeters <= 0
  ) {
    return "위험 반경 미상";
  }

  return threatRadiusMeters >= 1000
    ? `${(threatRadiusMeters / 1000).toFixed(1)}km`
    : `${Math.round(threatRadiusMeters)}m`;
}

function formatBattleSpectatorEta(timeToImpactSec?: number | null) {
  if (
    typeof timeToImpactSec !== "number" ||
    !Number.isFinite(timeToImpactSec) ||
    timeToImpactSec < 0
  ) {
    return "미상";
  }

  if (timeToImpactSec < 60) {
    return `${Math.max(1, Math.round(timeToImpactSec))}초`;
  }

  const minutes = Math.floor(timeToImpactSec / 60);
  const seconds = Math.round(timeToImpactSec % 60);
  if (minutes < 10) {
    return seconds > 0 ? `${minutes}분 ${seconds}초` : `${minutes}분`;
  }

  return `${Math.round(timeToImpactSec / 60)}분`;
}

function formatBattleSpectatorRangeNm(rangeNm: number) {
  return `${Math.round(Math.max(0, rangeNm || 0))}nm`;
}

function formatBattleSpectatorFuelFraction(fuelFraction?: number) {
  if (typeof fuelFraction !== "number" || !Number.isFinite(fuelFraction)) {
    return "미상";
  }

  return `${Math.round(clampBattleSpectatorValue(fuelFraction, 0, 1) * 100)}%`;
}

function resolveBattleSpectatorOverviewPoint(state?: BattleSpectatorState) {
  if (!state) {
    return null;
  }

  if (
    hasFiniteBattleSpectatorPoint(state.centerLongitude, state.centerLatitude)
  ) {
    return {
      longitude: state.centerLongitude as number,
      latitude: state.centerLatitude as number,
      altitudeMeters: Math.max(
        8200,
        5600 + state.units.length * 110 + state.weapons.length * 220
      ),
    };
  }

  const fallbackJumpPoint = resolveBattleSpectatorJumpPoint(state);
  if (!fallbackJumpPoint) {
    return null;
  }

  return {
    longitude: fallbackJumpPoint.longitude,
    latitude: fallbackJumpPoint.latitude,
    altitudeMeters: Math.max(7600, fallbackJumpPoint.altitudeMeters + 2600),
  };
}

function buildBattleSpectatorTrajectoryRows(
  state: BattleSpectatorState | undefined,
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>
) {
  if (!state) {
    return [] as BattleSpectatorTrajectoryRow[];
  }

  return state.weapons
    .filter((weapon) => isBattleSpectatorTrajectoryWeapon(weapon))
    .map((weapon) => {
      const targetUnit = weapon.targetId
        ? (allUnitsById.get(weapon.targetId) ?? null)
        : null;
      const targetPoint =
        typeof weapon.targetLongitude === "number" &&
        typeof weapon.targetLatitude === "number"
          ? {
              longitude: weapon.targetLongitude,
              latitude: weapon.targetLatitude,
              altitudeMeters: targetUnit?.altitudeMeters ?? 0,
            }
          : targetUnit
            ? {
                longitude: targetUnit.longitude,
                latitude: targetUnit.latitude,
                altitudeMeters: targetUnit.altitudeMeters,
              }
            : null;
      const launchPoint = {
        longitude: weapon.launchLongitude,
        latitude: weapon.launchLatitude,
      };
      const currentPoint = {
        longitude: weapon.longitude,
        latitude: weapon.latitude,
      };
      const totalDistanceKm = distanceKmBetweenBattleSpectatorPoints(
        launchPoint,
        targetPoint
      );
      const remainingDistanceKm = distanceKmBetweenBattleSpectatorPoints(
        currentPoint,
        targetPoint
      );
      const traveledDistanceKm = distanceKmBetweenBattleSpectatorPoints(
        launchPoint,
        currentPoint
      );
      const progressPercent =
        totalDistanceKm && totalDistanceKm > 0 && traveledDistanceKm !== null
          ? clampBattleSpectatorValue(
              (traveledDistanceKm / totalDistanceKm) * 100,
              0,
              100
            )
          : null;
      const timeToImpactSec = estimateBattleSpectatorTimeToImpactSec(
        remainingDistanceKm,
        weapon.speedKts
      );
      const threatRadiusMeters = resolveBattleSpectatorThreatRadiusMeters(
        weapon,
        targetUnit
      );
      const phaseLabel =
        progressPercent === null
          ? "탐색"
          : progressPercent >= 82
            ? "종말"
            : progressPercent >= 45
              ? "중간"
              : "초기";
      const targetTypeLabel =
        targetUnit?.entityType === "aircraft"
          ? "공중 표적"
          : targetUnit?.entityType === "ship"
            ? "해상 표적"
            : targetUnit
              ? "지상 표적"
              : targetPoint
                ? "좌표 표적"
                : "표적 미상";

      return {
        weapon,
        launcherName: weapon.launcherName,
        targetName: targetUnit?.name ?? null,
        targetPoint,
        totalDistanceKm,
        remainingDistanceKm,
        progressPercent,
        timeToImpactSec,
        threatRadiusMeters,
        phaseLabel,
        targetTypeLabel,
      };
    })
    .sort((left, right) => {
      const leftRemaining =
        left.remainingDistanceKm ?? Number.POSITIVE_INFINITY;
      const rightRemaining =
        right.remainingDistanceKm ?? Number.POSITIVE_INFINITY;
      if (leftRemaining !== rightRemaining) {
        return leftRemaining - rightRemaining;
      }
      const leftProgress = left.progressPercent ?? -1;
      const rightProgress = right.progressPercent ?? -1;
      if (leftProgress !== rightProgress) {
        return rightProgress - leftProgress;
      }
      return right.weapon.speedKts - left.weapon.speedKts;
    })
    .slice(0, 4);
}

function buildBattleSpectatorImpactTimelineRows(
  trajectoryRows: BattleSpectatorTrajectoryRow[]
) {
  return trajectoryRows
    .filter(
      (
        row
      ): row is BattleSpectatorTrajectoryRow & { timeToImpactSec: number } =>
        typeof row.timeToImpactSec === "number" &&
        Number.isFinite(row.timeToImpactSec)
    )
    .map((row) => {
      const etaSec = row.timeToImpactSec;
      return {
        id: `timeline-${row.weapon.id}`,
        weapon: row.weapon,
        targetName: row.targetName ?? row.targetTypeLabel,
        targetPoint: row.targetPoint,
        etaSec,
        threatRadiusMeters: row.threatRadiusMeters,
        urgencyLabel:
          etaSec <= 30
            ? "즉시"
            : etaSec <= 90
              ? "근접"
              : etaSec <= 180
                ? "주의"
                : "감시",
        urgencyTone:
          etaSec <= 30 ? "#ff7b72" : etaSec <= 90 ? "#ffd166" : "#84d8ff",
        progressPercent: clampBattleSpectatorValue(
          100 - (etaSec / 180) * 100,
          8,
          100
        ),
      };
    })
    .sort((left, right) => {
      if (left.etaSec !== right.etaSec) {
        return left.etaSec - right.etaSec;
      }
      return left.weapon.name.localeCompare(right.weapon.name, "ko-KR");
    })
    .slice(0, 5);
}

function resolveBattleSpectatorTrajectoryTargetUnit(
  row: BattleSpectatorTrajectoryRow,
  units: BattleSpectatorUnitSnapshot[],
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>
) {
  if (typeof row.weapon.targetId === "string") {
    const directTarget = allUnitsById.get(row.weapon.targetId);
    if (directTarget) {
      return directTarget;
    }
  }

  if (!row.targetPoint) {
    return null;
  }

  const closestUnit = [...units]
    .map((unit) => ({
      unit,
      distanceKm: distanceKmBetweenBattleSpectatorPoints(
        {
          longitude: unit.longitude,
          latitude: unit.latitude,
        },
        row.targetPoint
      ),
    }))
    .filter(
      (
        entry
      ): entry is { unit: BattleSpectatorUnitSnapshot; distanceKm: number } =>
        typeof entry.distanceKm === "number" &&
        Number.isFinite(entry.distanceKm)
    )
    .sort((left, right) => left.distanceKm - right.distanceKm)[0];

  if (!closestUnit || closestUnit.distanceKm > 6) {
    return null;
  }

  return closestUnit.unit;
}

function buildBattleSpectatorAssetRiskRows(options: {
  state: BattleSpectatorState | undefined;
  trajectoryRows: BattleSpectatorTrajectoryRow[];
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>;
}) {
  if (!options.state) {
    return [] as BattleSpectatorAssetRiskRow[];
  }

  const groupedRows = new Map<
    string,
    {
      unit: BattleSpectatorUnitSnapshot;
      rows: BattleSpectatorTrajectoryRow[];
    }
  >();

  options.trajectoryRows.forEach((row) => {
    const targetUnit = resolveBattleSpectatorTrajectoryTargetUnit(
      row,
      options.state?.units ?? [],
      options.allUnitsById
    );
    if (!targetUnit || typeof row.timeToImpactSec !== "number") {
      return;
    }

    const existingEntry = groupedRows.get(targetUnit.id);
    if (existingEntry) {
      existingEntry.rows.push(row);
      return;
    }

    groupedRows.set(targetUnit.id, {
      unit: targetUnit,
      rows: [row],
    });
  });

  return [...groupedRows.values()]
    .map((entry) => {
      const sortedRows = [...entry.rows].sort(
        (left, right) =>
          (left.timeToImpactSec ?? Number.POSITIVE_INFINITY) -
          (right.timeToImpactSec ?? Number.POSITIVE_INFINITY)
      );
      const highlightedRow = sortedRows[0];

      return {
        id: `risk-${entry.unit.id}`,
        unit: entry.unit,
        incomingCount: entry.rows.length,
        earliestEtaSec: highlightedRow.timeToImpactSec ?? 0,
        maxThreatRadiusMeters: Math.max(
          ...entry.rows.map((row) => row.threatRadiusMeters)
        ),
        highlightedWeapon: highlightedRow.weapon,
        targetPoint: highlightedRow.targetPoint,
      };
    })
    .sort((left, right) => {
      if (left.earliestEtaSec !== right.earliestEtaSec) {
        return left.earliestEtaSec - right.earliestEtaSec;
      }
      if (left.incomingCount !== right.incomingCount) {
        return right.incomingCount - left.incomingCount;
      }
      return left.unit.name.localeCompare(right.unit.name, "ko-KR");
    })
    .slice(0, 4);
}

function buildBattleSpectatorPatrolTargets(options: {
  state: BattleSpectatorState | undefined;
  impactTimelineRows: BattleSpectatorImpactTimelineRow[];
  alertRows: BattleSpectatorAlertRow[];
  latestEngagementPoint?: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
    followTargetId?: string;
  };
}) {
  const targets: BattleSpectatorPatrolTarget[] = [];
  const seenTargetKeys = new Set<string>();
  const pushTarget = (target: BattleSpectatorPatrolTarget) => {
    const pointKey = `${target.point.longitude.toFixed(4)}:${target.point.latitude.toFixed(
      4
    )}:${target.kind}`;
    const dedupeKey = target.followTargetId
      ? `follow:${target.followTargetId}:${target.kind}`
      : `point:${pointKey}`;
    if (seenTargetKeys.has(dedupeKey)) {
      return;
    }

    seenTargetKeys.add(dedupeKey);
    targets.push(target);
  };

  const topImpact = options.impactTimelineRows[0];
  if (topImpact) {
    pushTarget({
      id: `impact-${topImpact.weapon.id}`,
      label: "타격 지점 시점",
      detail: `${topImpact.targetName} · ETA ${formatBattleSpectatorEta(
        topImpact.etaSec
      )} · 위험 반경 ${formatBattleSpectatorThreatRadius(
        topImpact.threatRadiusMeters
      )}`,
      kind: "impact",
      point:
        topImpact.targetPoint ??
        resolveBattleSpectatorWeaponJumpPoint(topImpact.weapon),
      followTargetId:
        typeof topImpact.weapon.targetId === "string"
          ? `unit:${topImpact.weapon.targetId}`
          : `weapon:${topImpact.weapon.id}`,
      cameraProfile: "side",
      ...resolveBattleSpectatorSceneFocusFraming("impact"),
    });
  }

  buildBattleSpectatorPatrolUnitTargets(options.state).forEach((target) => {
    pushTarget(target);
  });

  const hotspotAlert = options.alertRows.find(
    (alert) => alert.actionLabel === "핫스팟 점프"
  );
  if (hotspotAlert) {
    pushTarget({
      id: `hotspot-${hotspotAlert.id}`,
      label: "교전 지점 시점",
      detail: hotspotAlert.detail,
      kind: "hotspot",
      point: hotspotAlert.point,
      followTargetId: hotspotAlert.followTargetId,
      cameraProfile: hotspotAlert.cameraProfile ?? "side",
      ...resolveBattleSpectatorSceneFocusFraming("hotspot"),
    });
  }

  const fallbackAlert = options.alertRows.find(
    (alert) => alert.followTargetId && alert.actionLabel !== "핫스팟 점프"
  );
  if (fallbackAlert) {
    pushTarget({
      id: `alert-${fallbackAlert.id}`,
      label:
        fallbackAlert.actionLabel === "탄체 추적"
          ? "탄체 시점"
          : "긴급 추적 시점",
      detail: fallbackAlert.detail,
      kind: "impact",
      point: fallbackAlert.point,
      followTargetId: fallbackAlert.followTargetId,
      cameraProfile: fallbackAlert.cameraProfile ?? "side",
      ...resolveBattleSpectatorSceneFocusFraming("impact"),
    });
  }

  if (options.latestEngagementPoint) {
    pushTarget({
      id: "latest-engagement",
      label: "최신 교전 시점",
      detail: "가장 최근에 움직인 교전 축을 다시 붙잡습니다.",
      kind: "engagement",
      point: options.latestEngagementPoint,
      followTargetId: options.latestEngagementPoint.followTargetId,
      cameraProfile: "side",
      ...resolveBattleSpectatorSceneFocusFraming("engagement"),
    });
  }

  return targets.slice(0, 6);
}

function buildBattleSpectatorSelectedUnitInsight(
  selectedUnit: BattleSpectatorUnitSnapshot | undefined,
  state: BattleSpectatorState | undefined,
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>
): BattleSpectatorSelectedUnitInsight | null {
  if (!selectedUnit || !state) {
    return null;
  }

  const incomingWeapons = state.weapons.filter(
    (weapon) => weapon.targetId === selectedUnit.id
  ).length;
  const outgoingWeapons = state.weapons.filter(
    (weapon) => weapon.launcherId === selectedUnit.id
  ).length;
  const targetName =
    (selectedUnit.targetId
      ? (allUnitsById.get(selectedUnit.targetId)?.name ?? selectedUnit.targetId)
      : null) ?? null;

  return {
    incomingWeapons,
    outgoingWeapons,
    targetName,
  };
}

function buildBattleSpectatorThreatRows(
  state: BattleSpectatorState | undefined,
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>
) {
  if (!state) {
    return [];
  }

  const outgoingWeaponsByUnit = new Map<string, number>();
  state.weapons.forEach((weapon) => {
    outgoingWeaponsByUnit.set(
      weapon.launcherId,
      (outgoingWeaponsByUnit.get(weapon.launcherId) ?? 0) + 1
    );
  });

  const recentActivityByUnit = new Map<string, number>();
  state.recentEvents.forEach((event) => {
    if (!event.actorId) {
      return;
    }

    recentActivityByUnit.set(
      event.actorId,
      (recentActivityByUnit.get(event.actorId) ?? 0) + 1
    );
  });

  return [...state.units]
    .map((unit) => {
      const outgoingWeapons = outgoingWeaponsByUnit.get(unit.id) ?? 0;
      const recentActivity = recentActivityByUnit.get(unit.id) ?? 0;
      const baselineScore =
        unit.entityType === "aircraft"
          ? 22
          : unit.entityType === "ship"
            ? 18
            : unit.entityType === "airbase"
              ? 15
              : 12;

      const score = Math.round(
        baselineScore +
          unit.weaponCount * 7 +
          Math.min(unit.speedKts / 28, 16) +
          outgoingWeapons * 12 +
          recentActivity * 8 +
          (unit.targetId ? 6 : 0) +
          unit.hpFraction * 10
      );

      return {
        unit,
        score,
        outgoingWeapons,
        recentActivity,
        targetName: unit.targetId
          ? (allUnitsById.get(unit.targetId)?.name ?? unit.targetId)
          : null,
      };
    })
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      if (left.unit.weaponCount !== right.unit.weaponCount) {
        return right.unit.weaponCount - left.unit.weaponCount;
      }
      return left.unit.name.localeCompare(right.unit.name, "ko-KR");
    })
    .slice(0, 4);
}

function buildBattleSpectatorHotspotRows(
  state: BattleSpectatorState | undefined
): BattleSpectatorHotspotRow[] {
  if (!state) {
    return [];
  }

  const hotspotMap = new Map<
    string,
    {
      weight: number;
      weightedLongitude: number;
      weightedLatitude: number;
      weightedAltitude: number;
      eventCount: number;
      launchCount: number;
      impactCount: number;
      activeWeapons: number;
      latestTimestamp: number;
      latestMessage: string | null;
      sideWeights: Map<string, { name: string; color: string; score: number }>;
    }
  >();
  const addContribution = (options: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
    score: number;
    sideId: string;
    sideName: string;
    sideColor: string;
    timestamp: number;
    message?: string | null;
    kind: "weapon" | "launch" | "impact" | "engagement";
  }) => {
    const gridLongitude = Math.round(options.longitude / 0.04) * 0.04;
    const gridLatitude = Math.round(options.latitude / 0.04) * 0.04;
    const key = `${gridLongitude.toFixed(2)}:${gridLatitude.toFixed(2)}`;
    if (!hotspotMap.has(key)) {
      hotspotMap.set(key, {
        weight: 0,
        weightedLongitude: 0,
        weightedLatitude: 0,
        weightedAltitude: 0,
        eventCount: 0,
        launchCount: 0,
        impactCount: 0,
        activeWeapons: 0,
        latestTimestamp: 0,
        latestMessage: null,
        sideWeights: new Map(),
      });
    }

    const entry = hotspotMap.get(key)!;
    entry.weight += options.score;
    entry.weightedLongitude += options.longitude * options.score;
    entry.weightedLatitude += options.latitude * options.score;
    entry.weightedAltitude += options.altitudeMeters * options.score;
    entry.eventCount += 1;
    if (options.kind === "weapon") {
      entry.activeWeapons += 1;
    }
    if (options.kind === "launch") {
      entry.launchCount += 1;
    }
    if (options.kind === "impact") {
      entry.impactCount += 1;
    }
    if (options.timestamp >= entry.latestTimestamp) {
      entry.latestTimestamp = options.timestamp;
      entry.latestMessage = options.message ?? null;
    }

    const currentSide = entry.sideWeights.get(options.sideId) ?? {
      name: options.sideName,
      color: options.sideColor,
      score: 0,
    };
    currentSide.score += options.score;
    entry.sideWeights.set(options.sideId, currentSide);
  };

  state.weapons.forEach((weapon) => {
    addContribution({
      longitude: weapon.longitude,
      latitude: weapon.latitude,
      altitudeMeters: weapon.altitudeMeters,
      score: 5,
      sideId: weapon.sideId,
      sideName: weapon.sideName,
      sideColor: weapon.sideColor,
      timestamp: state.currentTime,
      message: `${weapon.name} 비행 중`,
      kind: "weapon",
    });
  });

  state.recentEvents.forEach((event) => {
    if (
      !hasFiniteBattleSpectatorPoint(event.focusLongitude, event.focusLatitude)
    ) {
      return;
    }

    addContribution({
      longitude: event.focusLongitude as number,
      latitude: event.focusLatitude as number,
      altitudeMeters: event.focusAltitudeMeters ?? 0,
      score: isBattleSpectatorImpactEvent(event)
        ? 4
        : isBattleSpectatorLaunchEvent(event)
          ? 3
          : 2,
      sideId: event.sideId,
      sideName: event.sideName,
      sideColor: event.sideColor,
      timestamp: event.timestamp,
      message: event.message,
      kind: isBattleSpectatorImpactEvent(event)
        ? "impact"
        : isBattleSpectatorLaunchEvent(event)
          ? "launch"
          : "engagement",
    });
  });

  return [...hotspotMap.entries()]
    .map(([key, entry], index) => {
      const dominantSide = [...entry.sideWeights.values()].sort(
        (left, right) => {
          if (left.score !== right.score) {
            return right.score - left.score;
          }
          return left.name.localeCompare(right.name, "ko-KR");
        }
      )[0] ?? {
        name: "미상 세력",
        color: "silver",
        score: 0,
      };
      const score = Math.round(
        entry.weight + entry.activeWeapons * 3 + entry.impactCount * 2
      );

      return {
        id: `${index}-${key}`,
        label:
          score >= 18
            ? "초고열 구역"
            : score >= 12
              ? "고열 교전"
              : score >= 7
                ? "접전 구역"
                : "활동 구역",
        longitude: entry.weightedLongitude / Math.max(1, entry.weight),
        latitude: entry.weightedLatitude / Math.max(1, entry.weight),
        altitudeMeters: Math.max(
          1600,
          entry.weightedAltitude / Math.max(1, entry.weight)
        ),
        score,
        eventCount: entry.eventCount,
        launchCount: entry.launchCount,
        impactCount: entry.impactCount,
        activeWeapons: entry.activeWeapons,
        latestTimestamp: entry.latestTimestamp,
        latestMessage: entry.latestMessage,
        dominantSideName: dominantSide.name,
        dominantSideColor: dominantSide.color,
      };
    })
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return right.latestTimestamp - left.latestTimestamp;
    })
    .slice(0, 4);
}

function buildBattleSpectatorTempoRows(
  state: BattleSpectatorState | undefined,
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>
): BattleSpectatorTempoRow[] {
  if (!state) {
    return [];
  }

  const outgoingWeaponsByUnit = new Map<string, number>();
  const incomingWeaponsByUnit = new Map<string, number>();
  state.weapons.forEach((weapon) => {
    outgoingWeaponsByUnit.set(
      weapon.launcherId,
      (outgoingWeaponsByUnit.get(weapon.launcherId) ?? 0) + 1
    );
    if (weapon.targetId) {
      incomingWeaponsByUnit.set(
        weapon.targetId,
        (incomingWeaponsByUnit.get(weapon.targetId) ?? 0) + 1
      );
    }
  });

  const launchCounts = new Map<string, number>();
  const impactCounts = new Map<string, number>();
  state.recentEvents.forEach((event) => {
    if (event.actorId && isBattleSpectatorLaunchEvent(event)) {
      launchCounts.set(
        event.actorId,
        (launchCounts.get(event.actorId) ?? 0) + 1
      );
    }
    if (event.targetId && isBattleSpectatorImpactEvent(event)) {
      impactCounts.set(
        event.targetId,
        (impactCounts.get(event.targetId) ?? 0) + 1
      );
    }
  });

  return [...state.units]
    .map((unit) => {
      const outgoingWeapons = outgoingWeaponsByUnit.get(unit.id) ?? 0;
      const incomingWeapons = incomingWeaponsByUnit.get(unit.id) ?? 0;
      const recentLaunches = launchCounts.get(unit.id) ?? 0;
      const recentImpacts = impactCounts.get(unit.id) ?? 0;
      const tempoScore = Math.round(
        outgoingWeapons * 10 +
          incomingWeapons * 9 +
          recentLaunches * 8 +
          recentImpacts * 7 +
          unit.weaponCount * 2 +
          (unit.targetId ? 4 : 0) +
          unit.hpFraction * 6
      );

      return {
        unit,
        tempoScore,
        outgoingWeapons,
        incomingWeapons,
        recentLaunches,
        recentImpacts,
        targetName: unit.targetId
          ? (allUnitsById.get(unit.targetId)?.name ?? unit.targetId)
          : null,
      };
    })
    .sort((left, right) => {
      if (left.tempoScore !== right.tempoScore) {
        return right.tempoScore - left.tempoScore;
      }
      return left.unit.name.localeCompare(right.unit.name, "ko-KR");
    })
    .slice(0, 4);
}

function buildBattleSpectatorAlertRows(options: {
  state: BattleSpectatorState | undefined;
  trajectoryRows: BattleSpectatorTrajectoryRow[];
  hotspotRows: BattleSpectatorHotspotRow[];
}) {
  if (!options.state) {
    return [] as BattleSpectatorAlertRow[];
  }

  const alerts: Array<BattleSpectatorAlertRow & { priority: number }> = [];

  options.trajectoryRows.forEach((row) => {
    if (row.phaseLabel !== "종말") {
      return;
    }

    const remainingDistanceKm = row.remainingDistanceKm ?? 0;
    alerts.push({
      id: `terminal-weapon-${row.weapon.id}`,
      label: row.targetName
        ? `${row.targetName} 접근 탄체`
        : `${row.targetTypeLabel} 접근 탄체`,
      detail: `${row.weapon.name} · ${formatBattleSpectatorDistanceKm(
        row.remainingDistanceKm
      )} 남음 · ETA ${formatBattleSpectatorEta(row.timeToImpactSec)} · 위험 반경 ${formatBattleSpectatorThreatRadius(
        row.threatRadiusMeters
      )} · ${
        typeof row.progressPercent === "number"
          ? `${Math.round(row.progressPercent)}% 진행`
          : "진행률 미상"
      }`,
      severityLabel: remainingDistanceKm <= 8 ? "즉시 확인" : "종말 단계",
      severityTone: remainingDistanceKm <= 8 ? "#ff7b72" : "#ffd166",
      actionLabel: "탄체 추적",
      point: resolveBattleSpectatorWeaponJumpPoint(row.weapon),
      followTargetId: `weapon:${row.weapon.id}`,
      cameraProfile: "side",
      priority: 110 - Math.min(40, remainingDistanceKm * 4),
    });
  });

  options.state.units.forEach((unit) => {
    if (
      unit.entityType === "aircraft" &&
      typeof unit.fuelFraction === "number" &&
      unit.fuelFraction <= 0.25
    ) {
      alerts.push({
        id: `low-fuel-${unit.id}`,
        label: `${unit.name} 연료 저하`,
        detail: `${unit.sideName} · 연료 ${formatBattleSpectatorFuelFraction(
          unit.fuelFraction
        )} · 속도 ${Math.round(unit.speedKts)}kt`,
        severityLabel: unit.fuelFraction <= 0.12 ? "복귀 필요" : "연료 경고",
        severityTone: unit.fuelFraction <= 0.12 ? "#ff7b72" : "#ffd166",
        actionLabel: "유닛 추적",
        point: resolveBattleSpectatorUnitJumpPoint(unit),
        followTargetId: `unit:${unit.id}`,
        cameraProfile: resolveBattleSpectatorUnitCameraProfile(unit),
        priority: 80 - unit.fuelFraction * 100,
      });
    }

    if (unit.hpFraction <= 0.42) {
      alerts.push({
        id: `damaged-${unit.id}`,
        label: `${unit.name} 피해 누적`,
        detail: `${unit.sideName} · 체력 ${formatBattleSpectatorHp(
          unit.hpFraction
        )} · 방위 ${formatBattleSpectatorHeading(unit.headingDeg)}`,
        severityLabel: unit.hpFraction <= 0.22 ? "긴급" : "피해 경고",
        severityTone: unit.hpFraction <= 0.22 ? "#ff7b72" : "#ffd166",
        actionLabel: "유닛 추적",
        point: resolveBattleSpectatorUnitJumpPoint(unit),
        followTargetId: `unit:${unit.id}`,
        cameraProfile: resolveBattleSpectatorUnitCameraProfile(unit),
        priority: 74 - unit.hpFraction * 100,
      });
    }
  });

  options.hotspotRows.forEach((hotspot) => {
    if (hotspot.score < 16) {
      return;
    }

    alerts.push({
      id: `hotspot-${hotspot.id}`,
      label: `${hotspot.label} 재확인 필요`,
      detail: `${hotspot.dominantSideName} 우세 · 강도 ${hotspot.score} · 탄체 ${hotspot.activeWeapons}`,
      severityLabel: hotspot.impactCount >= 2 ? "타격 집중" : "교전 집중",
      severityTone: hotspot.impactCount >= 2 ? "#ff7b72" : "#84d8ff",
      actionLabel: "핫스팟 점프",
      point: {
        longitude: hotspot.longitude,
        latitude: hotspot.latitude,
        altitudeMeters: hotspot.altitudeMeters,
      },
      cameraProfile: "side",
      priority: 52 + hotspot.score,
    });
  });

  return alerts
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }
      return left.label.localeCompare(right.label, "ko-KR");
    })
    .slice(0, 4)
    .map(({ priority: _priority, ...alert }) => alert);
}

export default function FlightSimPage({
  onBack,
  initialCraft,
  initialLocation,
  game,
  continueSimulation = false,
  battleSpectator,
  focusFireAirwatch,
}: Readonly<FlightSimPageProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const battleSpectatorScenarioFileInputRef =
    useRef<HTMLInputElement | null>(null);
  const simulationOutcomeRequestIdRef = useRef(0);
  const battleSpectatorAutoCaptureKeyRef = useRef("");
  const battleSpectatorPatrolIndexRef = useRef(0);
  const battleSpectatorInitialJumpScenarioRef = useRef("");
  const battleSpectatorInitialFollowSeededRef = useRef(false);
  const battleSpectatorInitialScenarioSnapshotRef = useRef<string | null>(null);
  const battleSpectatorScenarioRestartedRef = useRef(false);
  const battleSpectatorStateSignatureRef = useRef("");
  const battleSpectatorRuntimeSignatureRef = useRef("");
  const battleSpectatorBriefingLogSignatureRef = useRef("");
  const battleSpectatorOverviewSectionRef = useRef<HTMLDivElement | null>(null);
  const battleSpectatorBriefingSectionRef = useRef<HTMLDivElement | null>(null);
  const battleSpectatorEngagementSectionRef = useRef<HTMLDivElement | null>(
    null
  );
  const battleSpectatorAnalysisSectionRef = useRef<HTMLDivElement | null>(null);
  const [assetState, setAssetState] = useState<AssetState>("checking");
  const [runtimeInfo, setRuntimeInfo] = useState<FlightSimRuntimeInfo | null>(
    null
  );
  const [runtimeProvider, setRuntimeProvider] = useState<
    "checking" | "vworld-webgl" | "cesium-fallback" | "unknown"
  >("checking");
  const [flightSimFrameReady, setFlightSimFrameReady] = useState(false);
  const battleSpectatorEnabled = battleSpectator !== undefined;
  const focusFireAirwatchEnabled = hasFocusFireObjective(focusFireAirwatch);
  const battleSpectatorHybridEnabled =
    !battleSpectatorEnabled &&
    Boolean(game) &&
    continueSimulation &&
    focusFireAirwatchEnabled;
  const battleSpectatorRuntimeEnabled =
    battleSpectatorEnabled || battleSpectatorHybridEnabled;
  const initialBattleSpectatorState = battleSpectatorRuntimeEnabled
    ? buildBattleSpectatorState(game, continueSimulation, battleSpectator)
    : undefined;
  const [battleSpectatorPanelOpen, setBattleSpectatorPanelOpen] = useState(
    () => !battleSpectatorEnabled || resolveInitialBattleSpectatorPanelOpen()
  );
  const [battleSpectatorDockTab, setBattleSpectatorDockTab] =
    useState<BattleSpectatorDockTab>("engagements");
  const [currentBattleSpectator, setCurrentBattleSpectator] = useState<
    BattleSpectatorState | undefined
  >(() => initialBattleSpectatorState);
  const [currentFocusFireAirwatch, setCurrentFocusFireAirwatch] = useState<
    FocusFireAirwatchState | undefined
  >(() =>
    focusFireAirwatchEnabled
      ? buildFocusFireAirwatchState(game, continueSimulation, focusFireAirwatch)
      : undefined
  );
  const [battleSpectatorSideFilter, setBattleSpectatorSideFilter] =
    useState<string>("all");
  const [battleSpectatorFollowTargetId, setBattleSpectatorFollowTargetId] =
    useState(
      () =>
        resolveBattleSpectatorJumpPoint(initialBattleSpectatorState)
          ?.followTargetId ?? ""
    );
  const [
    battleSpectatorPinnedInspectTargetId,
    setBattleSpectatorPinnedInspectTargetId,
  ] = useState("");
  const [battleSpectatorHeroTargetId, setBattleSpectatorHeroTargetId] =
    useState("");
  const [battleSpectatorCameraProfile, setBattleSpectatorCameraProfile] =
    useState<BattleSpectatorCameraProfile>("tactical");
  const [battleSpectatorLodLevel, setBattleSpectatorLodLevel] =
    useState<BattleSpectatorLodLevel>("balanced");
  const [battleSpectatorAutoCapture, setBattleSpectatorAutoCapture] =
    useState(false);
  const [battleSpectatorAutoPatrol, setBattleSpectatorAutoPatrol] =
    useState(false);
  const [
    battleSpectatorHighlightedPatrolTargetId,
    setBattleSpectatorHighlightedPatrolTargetId,
  ] = useState("");
  const [battleSpectatorPriorityFilter, setBattleSpectatorPriorityFilter] =
    useState<BattleSpectatorPriorityFilter>("all");
  const [battleSpectatorBriefingLog, setBattleSpectatorBriefingLog] = useState<
    BattleSpectatorBriefingLogEntry[]
  >([]);
  const [battleSpectatorTrendHistory, setBattleSpectatorTrendHistory] =
    useState<BattleSpectatorSideTrendEntry[]>([]);
  const [battleSpectatorSimulationRevision, setBattleSpectatorSimulationRevision] =
    useState(0);
  const [battleSpectatorPresetListExpanded, setBattleSpectatorPresetListExpanded] =
    useState(false);
  const [selectedMode, setSelectedMode] = useState<CraftMode>(
    battleSpectatorEnabled || initialCraft === "drone" ? "drone" : "jet"
  );
  const [selectedJetCraftId, setSelectedJetCraftId] = useState<JetCraftId>(
    resolveInitialJetCraftId(initialCraft)
  );
  const [simulationOutcomeSummary, setSimulationOutcomeSummary] =
    useState<SimulationOutcomeSummary | null>(null);
  const [simulationOutcomeNarrative, setSimulationOutcomeNarrative] =
    useState("");
  const [
    simulationOutcomeNarrativeSource,
    setSimulationOutcomeNarrativeSource,
  ] = useState<SimulationOutcomeNarrativeSource>("fallback");
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
  const showBattleSpectator = currentBattleSpectator !== undefined;
  const showFocusFireAirwatch =
    focusFireAirwatchEnabled && hasFocusFireObjective(currentFocusFireAirwatch);
  const battleSpectatorSideOptions = useMemo(() => {
    if (!currentBattleSpectator) {
      return [];
    }

    const sideMap = new Map<string, { id: string; name: string }>();
    currentBattleSpectator.units.forEach((unit) => {
      if (!sideMap.has(unit.sideId)) {
        sideMap.set(unit.sideId, {
          id: unit.sideId,
          name: unit.sideName,
        });
      }
    });

    return [...sideMap.values()];
  }, [currentBattleSpectator]);
  const visibleBattleSpectator = useMemo(() => {
    if (!currentBattleSpectator) {
      return undefined;
    }

    return filterBattleSpectatorState(
      currentBattleSpectator,
      battleSpectatorSideFilter
    );
  }, [battleSpectatorSideFilter, currentBattleSpectator]);
  const displayedBattleSpectator =
    visibleBattleSpectator ?? currentBattleSpectator;
  const battleSpectatorHasScenarioControls = showBattleSpectator && Boolean(game);
  const battleSpectatorScenarioName =
    game?.currentScenario?.name ??
    displayedBattleSpectator?.scenarioName ??
    "시나리오";
  const battleSpectatorScenarioPaused = game?.scenarioPaused ?? true;
  const battleSpectatorScenarioTimeCompression = Math.max(
    1,
    Number(game?.currentScenario?.timeCompression) || 1
  );
  const visibleBattleSpectatorScenarioPresets = battleSpectatorPresetListExpanded
    ? FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS
    : FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS.slice(0, 6);
  const followTargetOptions = useMemo(() => {
    const units =
      visibleBattleSpectator?.units.length ||
      battleSpectatorSideFilter !== "all"
        ? (visibleBattleSpectator?.units ?? [])
        : (currentBattleSpectator?.units ?? []);
    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorFollowTargetId
    );
    const trackedUnitId =
      parsedFollowTarget?.type === "unit" ? parsedFollowTarget.id : "";
    const sortedUnits = [...units].sort((left, right) => {
      const leftTracked = left.id === trackedUnitId;
      const rightTracked = right.id === trackedUnitId;
      if (leftTracked !== rightTracked) {
        return leftTracked ? -1 : 1;
      }
      if (left.selected !== right.selected) {
        return left.selected ? -1 : 1;
      }
      if (left.weaponCount !== right.weaponCount) {
        return right.weaponCount - left.weaponCount;
      }
      return left.name.localeCompare(right.name, "ko-KR");
    });

    const weapons = visibleBattleSpectator?.weapons ?? [];
    const recentWeapons = weapons
      .slice(Math.max(0, weapons.length - 8))
      .reverse();

    return [
      ...sortedUnits.map((unit) => ({
        id: `unit:${unit.id}`,
        label: `[${unit.sideName}] ${unit.name}`,
      })),
      ...recentWeapons.map((weapon) => ({
        id: `weapon:${weapon.id}`,
        label: `[탄체] ${weapon.name}`,
      })),
    ];
  }, [
    battleSpectatorFollowTargetId,
    battleSpectatorSideFilter,
    currentBattleSpectator?.units,
    visibleBattleSpectator?.weapons,
    visibleBattleSpectator?.units,
  ]);
  const selectedBattleSpectatorUnit = useMemo(() => {
    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorPinnedInspectTargetId || battleSpectatorFollowTargetId
    );
    if (parsedFollowTarget?.type === "unit") {
      const followedUnit = visibleBattleSpectator?.units.find(
        (unit) => unit.id === parsedFollowTarget.id
      );
      if (followedUnit) {
        return followedUnit;
      }
    }

    return visibleBattleSpectator?.units.find((unit) => unit.selected);
  }, [
    battleSpectatorFollowTargetId,
    battleSpectatorPinnedInspectTargetId,
    visibleBattleSpectator,
  ]);
  const allBattleSpectatorUnitsById = useMemo(
    () =>
      new Map(
        (currentBattleSpectator?.units ?? []).map(
          (unit) => [unit.id, unit] as const
        )
      ),
    [currentBattleSpectator?.units]
  );
  const allBattleSpectatorWeaponsById = useMemo(
    () =>
      new Map(
        (currentBattleSpectator?.weapons ?? []).map(
          (weapon) => [weapon.id, weapon] as const
        )
      ),
    [currentBattleSpectator?.weapons]
  );
  const allBattleSpectatorTrajectoryRows = useMemo(
    () =>
      buildBattleSpectatorTrajectoryRows(
        currentBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, currentBattleSpectator]
  );
  const allBattleSpectatorImpactTimelineRows = useMemo(
    () => buildBattleSpectatorImpactTimelineRows(allBattleSpectatorTrajectoryRows),
    [allBattleSpectatorTrajectoryRows]
  );
  const battleSpectatorInspectTargetId =
    battleSpectatorPinnedInspectTargetId || battleSpectatorFollowTargetId;
  const inspectedBattleSpectatorTarget = useMemo<BattleSpectatorInspectTarget | null>(
    () =>
      resolveBattleSpectatorInspectTarget(
        battleSpectatorInspectTargetId,
        currentBattleSpectator,
        allBattleSpectatorUnitsById,
        allBattleSpectatorWeaponsById,
        allBattleSpectatorTrajectoryRows,
        allBattleSpectatorImpactTimelineRows
      ),
    [
      allBattleSpectatorImpactTimelineRows,
      allBattleSpectatorTrajectoryRows,
      allBattleSpectatorUnitsById,
      allBattleSpectatorWeaponsById,
      battleSpectatorInspectTargetId,
      currentBattleSpectator,
    ]
  );
  const battleSpectatorHeroTarget = useMemo<BattleSpectatorInspectTarget | null>(
    () =>
      resolveBattleSpectatorInspectTarget(
        battleSpectatorHeroTargetId,
        currentBattleSpectator,
        allBattleSpectatorUnitsById,
        allBattleSpectatorWeaponsById,
        allBattleSpectatorTrajectoryRows,
        allBattleSpectatorImpactTimelineRows
      ),
    [
      allBattleSpectatorImpactTimelineRows,
      allBattleSpectatorTrajectoryRows,
      allBattleSpectatorUnitsById,
      allBattleSpectatorWeaponsById,
      battleSpectatorHeroTargetId,
      currentBattleSpectator,
    ]
  );
  const battleSpectatorHeroView = useMemo(
    () =>
      buildBattleSpectatorHeroView(
        battleSpectatorHeroTarget,
        battleSpectatorCameraProfile,
        currentBattleSpectator
      ),
    [
      battleSpectatorCameraProfile,
      battleSpectatorHeroTarget,
      currentBattleSpectator,
    ]
  );
  const inspectedBattleSpectatorTargetTone = useMemo(() => {
    if (!inspectedBattleSpectatorTarget) {
      return "#7fe7ff";
    }

    return getBattleSpectatorSideCssColor(
      inspectedBattleSpectatorTarget.kind === "unit"
        ? inspectedBattleSpectatorTarget.unit.sideColor
        : inspectedBattleSpectatorTarget.weapon.sideColor
    );
  }, [inspectedBattleSpectatorTarget]);
  const inspectedBattleSpectatorTargetIconType = useMemo<
    ToolbarEntityType | "weapon"
  >(() => {
    if (!inspectedBattleSpectatorTarget) {
      return "referencePoint";
    }

    return inspectedBattleSpectatorTarget.kind === "unit"
      ? resolveBattleSpectatorUnitIconType(inspectedBattleSpectatorTarget.unit)
      : "weapon";
  }, [inspectedBattleSpectatorTarget]);
  useEffect(() => {
    if (battleSpectatorHeroTargetId && !battleSpectatorHeroView) {
      setBattleSpectatorHeroTargetId("");
    }
  }, [battleSpectatorHeroTargetId, battleSpectatorHeroView]);
  const selectedBattleSpectatorInsight = useMemo(
    () =>
      buildBattleSpectatorSelectedUnitInsight(
        selectedBattleSpectatorUnit,
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [
      allBattleSpectatorUnitsById,
      selectedBattleSpectatorUnit,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorThreatRows = useMemo(
    () =>
      buildBattleSpectatorThreatRows(
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, visibleBattleSpectator]
  );
  const battleSpectatorHotspotRows = useMemo(
    () => buildBattleSpectatorHotspotRows(visibleBattleSpectator),
    [visibleBattleSpectator]
  );
  const battleSpectatorTempoRows = useMemo(
    () =>
      buildBattleSpectatorTempoRows(
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, visibleBattleSpectator]
  );
  const battleSpectatorTrajectoryRows = useMemo(
    () =>
      buildBattleSpectatorTrajectoryRows(
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, visibleBattleSpectator]
  );
  const battleSpectatorAlertRows = useMemo(
    () =>
      buildBattleSpectatorAlertRows({
        state: visibleBattleSpectator,
        trajectoryRows: battleSpectatorTrajectoryRows,
        hotspotRows: battleSpectatorHotspotRows,
      }),
    [
      battleSpectatorHotspotRows,
      battleSpectatorTrajectoryRows,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorImpactTimelineRows = useMemo(
    () => buildBattleSpectatorImpactTimelineRows(battleSpectatorTrajectoryRows),
    [battleSpectatorTrajectoryRows]
  );
  const battleSpectatorAssetRiskRows = useMemo(
    () =>
      buildBattleSpectatorAssetRiskRows({
        state: visibleBattleSpectator,
        trajectoryRows: battleSpectatorTrajectoryRows,
        allUnitsById: allBattleSpectatorUnitsById,
      }),
    [
      allBattleSpectatorUnitsById,
      battleSpectatorTrajectoryRows,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorSaturationTargetIds = useMemo(
    () => buildBattleSpectatorSaturationTargetIds(battleSpectatorAssetRiskRows),
    [battleSpectatorAssetRiskRows]
  );
  const filteredBattleSpectatorTrajectoryRows = useMemo(
    () =>
      filterBattleSpectatorTrajectoryRows(
        battleSpectatorTrajectoryRows,
        battleSpectatorPriorityFilter,
        battleSpectatorSaturationTargetIds
      ),
    [
      battleSpectatorPriorityFilter,
      battleSpectatorSaturationTargetIds,
      battleSpectatorTrajectoryRows,
    ]
  );
  const filteredBattleSpectatorImpactTimelineRows = useMemo(
    () =>
      filterBattleSpectatorImpactTimelineRows(
        battleSpectatorImpactTimelineRows,
        battleSpectatorPriorityFilter,
        battleSpectatorSaturationTargetIds
      ),
    [
      battleSpectatorImpactTimelineRows,
      battleSpectatorPriorityFilter,
      battleSpectatorSaturationTargetIds,
    ]
  );
  const filteredBattleSpectatorAssetRiskRows = useMemo(
    () =>
      filterBattleSpectatorAssetRiskRows(
        battleSpectatorAssetRiskRows,
        battleSpectatorPriorityFilter
      ),
    [battleSpectatorAssetRiskRows, battleSpectatorPriorityFilter]
  );
  const battleSpectatorOverviewPoint = useMemo(
    () => resolveBattleSpectatorOverviewPoint(displayedBattleSpectator),
    [displayedBattleSpectator]
  );
  const latestBattleEngagementPoint = useMemo(
    () => resolveBattleSpectatorJumpPoint(visibleBattleSpectator),
    [visibleBattleSpectator]
  );
  const latestBattleSpectatorWeapon = useMemo(() => {
    const weapons = visibleBattleSpectator?.weapons ?? [];
    return weapons.length > 0 ? weapons[weapons.length - 1] : undefined;
  }, [visibleBattleSpectator]);
  const latestTrackableBattleSpectatorEvent = useMemo(
    () =>
      [...(visibleBattleSpectator?.recentEvents ?? [])]
        .reverse()
        .find((event) => resolveBattleSpectatorEventJumpPoint(event)),
    [visibleBattleSpectator]
  );
  const battleSpectatorPatrolTargets = useMemo(
    () =>
      buildBattleSpectatorPatrolTargets({
        state: visibleBattleSpectator,
        impactTimelineRows: battleSpectatorImpactTimelineRows,
        alertRows: battleSpectatorAlertRows,
        latestEngagementPoint: latestBattleEngagementPoint ?? undefined,
      }),
    [
      battleSpectatorAlertRows,
      battleSpectatorImpactTimelineRows,
      latestBattleEngagementPoint,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorSidebarEntries = useMemo(() => {
    const sceneEntries = battleSpectatorPatrolTargets
      .filter((target) =>
        ["impact", "hotspot", "engagement"].includes(target.kind)
      )
      .map((target) => ({
        id: target.id,
        label: resolveBattleSpectatorSceneEntryLabel(target),
        detail:
          target.kind === "impact"
            ? "폭격/착탄 지점 시점"
            : target.kind === "hotspot"
              ? "교전 집중 지점 시점"
              : "최신 교전 시점",
        iconType:
          target.kind === "impact"
            ? ("weapon" as const)
            : ("referencePoint" as const),
        iconColor: getBattleSpectatorPatrolTargetTone(target.kind),
        point: target.point,
        followTargetId: target.followTargetId,
        cameraProfile: target.cameraProfile ?? "side",
        sourceKind: "scene" as const,
        durationSeconds: target.durationSeconds,
        headingDegrees: target.headingDegrees,
        pitchDegrees: target.pitchDegrees,
        rangeMeters: target.rangeMeters,
      }));

    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorFollowTargetId
    );
    const trackedUnitId =
      parsedFollowTarget?.type === "unit" ? parsedFollowTarget.id : "";
    const sortedUnits = [...(visibleBattleSpectator?.units ?? [])].sort(
      (left, right) => {
        const leftTracked = left.id === trackedUnitId;
        const rightTracked = right.id === trackedUnitId;
        if (leftTracked !== rightTracked) {
          return leftTracked ? -1 : 1;
        }
        if (left.selected !== right.selected) {
          return left.selected ? -1 : 1;
        }
        const leftPreset = resolveBattleSpectatorPatrolUnitPreset(left);
        const rightPreset = resolveBattleSpectatorPatrolUnitPreset(right);
        if (Boolean(leftPreset) !== Boolean(rightPreset)) {
          return leftPreset ? -1 : 1;
        }
        if (left.weaponCount !== right.weaponCount) {
          return right.weaponCount - left.weaponCount;
        }
        return left.name.localeCompare(right.name, "ko-KR");
      }
    );

    const unitEntries = sortedUnits.map((unit) => {
      const preset = resolveBattleSpectatorPatrolUnitPreset(unit);
      const framing = resolveBattleSpectatorUnitFocusFraming(unit);

      return {
        id: `sidebar-unit-${unit.id}`,
        label: unit.name,
        detail: `${preset?.label ?? `${formatBattleSpectatorEntityType(unit.entityType)} 시점`} · ${unit.sideName}`,
        iconType: resolveBattleSpectatorUnitIconType(unit),
        iconColor: getBattleSpectatorSideCssColor(unit.sideColor),
        point: resolveBattleSpectatorUnitJumpPoint(unit),
        followTargetId: `unit:${unit.id}`,
        cameraProfile: preset?.cameraProfile ?? "chase",
        sourceKind: "unit" as const,
        durationSeconds: framing.durationSeconds,
        headingDegrees: framing.headingDegrees,
        pitchDegrees: framing.pitchDegrees,
        rangeMeters: framing.rangeMeters,
      };
    });

    return [...sceneEntries, ...unitEntries];
  }, [
    battleSpectatorFollowTargetId,
    battleSpectatorPatrolTargets,
    visibleBattleSpectator,
  ]);
  const battleSpectatorHighlightedPatrolTarget = useMemo(
    () =>
      battleSpectatorPatrolTargets.find(
        (target) => target.id === battleSpectatorHighlightedPatrolTargetId
      ) ?? null,
    [battleSpectatorHighlightedPatrolTargetId, battleSpectatorPatrolTargets]
  );
  const battleSpectatorActivitySummary = useMemo(
    () => buildBattleSpectatorActivitySummary(displayedBattleSpectator),
    [displayedBattleSpectator]
  );
  const battleSpectatorSideTrendRows = useMemo(
    () =>
      buildBattleSpectatorSideTrendRows(
        battleSpectatorTrendHistory,
        battleSpectatorSideFilter
      ),
    [battleSpectatorSideFilter, battleSpectatorTrendHistory]
  );
  const battleSpectatorInitiativeSummary = useMemo(
    () => buildBattleSpectatorInitiativeSummary(battleSpectatorSideTrendRows),
    [battleSpectatorSideTrendRows]
  );
  const battleSpectatorBriefing = useMemo(
    () =>
      buildBattleSpectatorBriefing({
        state: visibleBattleSpectator,
        initiativeSummary: battleSpectatorInitiativeSummary,
        alertRows: battleSpectatorAlertRows,
        impactTimelineRows: battleSpectatorImpactTimelineRows,
        assetRiskRows: battleSpectatorAssetRiskRows,
        hotspotRows: battleSpectatorHotspotRows,
        trajectoryRows: battleSpectatorTrajectoryRows,
      }),
    [
      battleSpectatorAlertRows,
      battleSpectatorAssetRiskRows,
      battleSpectatorHotspotRows,
      battleSpectatorImpactTimelineRows,
      battleSpectatorInitiativeSummary,
      battleSpectatorTrajectoryRows,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorPriorityFilterOption = useMemo(
    () =>
      BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS.find(
        (option) => option.id === battleSpectatorPriorityFilter
      ) ?? BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS[0],
    [battleSpectatorPriorityFilter]
  );
  const runtimeProviderLabel = useMemo(
    () => formatRuntimeProviderLabel(runtimeProvider),
    [runtimeProvider]
  );
  const runtimeProviderTone = useMemo(
    () => formatRuntimeProviderTone(runtimeProvider),
    [runtimeProvider]
  );
  const battleSpectatorRuntimeReady =
    showBattleSpectator &&
    assetState === "ready" &&
    flightSimFrameReady &&
    (runtimeInfo?.startup?.readyForSimulation ?? true);
  const loadingOverlayVisible = showBattleSpectator
    ? !battleSpectatorRuntimeReady
    : assetState !== "ready" || !flightSimFrameReady;
  const battleSpectatorCameraProfileOption = useMemo(
    () =>
      BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS.find(
        (option) => option.id === battleSpectatorCameraProfile
      ) ?? BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS[0],
    [battleSpectatorCameraProfile]
  );
  const battleSpectatorFollowTargetLabel = useMemo(() => {
    if (!showBattleSpectator || !battleSpectatorFollowTargetId) {
      return "자유 시점";
    }

    return (
      followTargetOptions.find(
        (option) => option.id === battleSpectatorFollowTargetId
      )?.label ?? "추적 대상 확인 중"
    );
  }, [battleSpectatorFollowTargetId, followTargetOptions, showBattleSpectator]);
  const battleSpectatorRuntimeModeLabel = battleSpectatorEnabled
    ? "SPECTATOR"
    : battleSpectatorHybridEnabled
      ? "BATTLE LINK"
      : null;
  const battleSpectatorRuntimeModeSummary =
    battleSpectatorEnabled || battleSpectatorHybridEnabled
      ? battleSpectatorEnabled
        ? `${battleSpectatorCameraProfileOption.label} · ${battleSpectatorFollowTargetLabel}`
        : selectedBattleSpectatorUnit
          ? `${selectedBattleSpectatorUnit.name} · ${selectedBattleSpectatorUnit.sideName}`
          : battleSpectatorBriefing?.headline ?? "전장 링크 활성화"
      : "";
  const hybridBattleSpectatorSelectedUnitTone = useMemo(() => {
    if (!selectedBattleSpectatorUnit) {
      return "#7fe7ff";
    }

    return getBattleSpectatorSideCssColor(selectedBattleSpectatorUnit.sideColor);
  }, [selectedBattleSpectatorUnit]);
  const hybridBattleSpectatorPrimaryAction = battleSpectatorHybridEnabled
    ? battleSpectatorBriefing?.actions[0] ?? null
    : null;
  const hybridBattleSpectatorTopAlert = battleSpectatorHybridEnabled
    ? battleSpectatorAlertRows[0] ?? null
    : null;
  const hybridBattleSpectatorTopImpact = battleSpectatorHybridEnabled
    ? battleSpectatorImpactTimelineRows[0] ?? null
    : null;
  const hybridBattleSpectatorTopHotspot = battleSpectatorHybridEnabled
    ? battleSpectatorHotspotRows[0] ?? null
    : null;

  iframeParams.set("lon", normalizedInitialLocation.lon.toFixed(6));
  iframeParams.set("lat", normalizedInitialLocation.lat.toFixed(6));
  iframeParams.set(
    "craft",
    selectedMode === "drone" ? "drone" : selectedJetCraftId
  );
  iframeParams.set("rev", FLIGHT_SIM_REVISION);
  if (battleSpectatorEnabled) {
    iframeParams.set("battleSpectator", "1");
  }
  appendFocusFireQueryParams(iframeParams, currentFocusFireAirwatch);

  const iframeSrc = iframeParams.toString()
    ? `${FLIGHT_SIM_ENTRY}?${iframeParams.toString()}`
    : FLIGHT_SIM_ENTRY;
  const selectedCraftCopy = battleSpectatorEnabled
    ? battleSpectatorCopy
    : craftCopy[selectedMode];
  const selectedJetCraft = getJetCraftCatalogEntry(selectedJetCraftId);
  const selectedFlightSimTitle = battleSpectatorEnabled
    ? "전장 3D 관전"
    : selectedMode === "drone"
      ? "드론 시뮬레이터"
      : `${selectedJetCraft.label} 시뮬레이터`;
  const loadingStatusLabel = battleSpectatorEnabled
    ? assetState === "missing"
      ? "전장 관전 자산을 찾을 수 없습니다."
      : runtimeInfo?.startup?.loadingMessage?.trim() ||
        "전장 관전 화면을 불러오는 중..."
    : assetState === "missing"
      ? "항공 시뮬레이터 자산을 찾을 수 없습니다."
      : "항공 시뮬레이터를 불러오는 중...";
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

  const postRuntimeToFlightSim = (
    type:
      | "firescope-focus-fire-update"
      | "firescope-focus-fire-command"
      | "firescope-battle-spectator-update"
      | "firescope-battle-spectator-command",
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

  const jumpToBattleSpectatorPoint = (
    point: {
      longitude: number;
      latitude: number;
      altitudeMeters: number;
    },
    options?: {
      cameraProfile?: BattleSpectatorCameraProfile;
      durationSeconds?: number;
      headingDegrees?: number;
      pitchDegrees?: number;
      rangeMeters?: number;
    }
  ) => {
    if (showBattleSpectator && !battleSpectatorRuntimeReady) {
      return;
    }

    postRuntimeToFlightSim("firescope-battle-spectator-command", {
      command: "jump-to-point",
      longitude: point.longitude,
      latitude: point.latitude,
      altitudeMeters: point.altitudeMeters,
      durationSeconds: options?.durationSeconds ?? 1.8,
      cameraProfile: options?.cameraProfile ?? battleSpectatorCameraProfile,
      headingDegrees: options?.headingDegrees,
      pitchDegrees: options?.pitchDegrees,
      rangeMeters: options?.rangeMeters,
    });
  };

  const closeBattleSpectatorPanelOnMobile = () => {
    if (
      showBattleSpectator &&
      typeof window !== "undefined" &&
      window.innerWidth < 600
    ) {
      setBattleSpectatorPanelOpen(false);
    }
  };

  const syncBattleSpectatorRuntime = (
    state: BattleSpectatorState,
    followTargetId: string,
    lodLevel: BattleSpectatorLodLevel,
    cameraProfile: BattleSpectatorCameraProfile
  ) => {
    const runtimePayload = {
      scenarioId: state.scenarioId,
      scenarioName: state.scenarioName,
      currentTime: state.currentTime,
      currentSideId: state.currentSideId,
      currentSideName: state.currentSideName,
      centerLongitude: state.centerLongitude,
      centerLatitude: state.centerLatitude,
      units: state.units,
      weapons: state.weapons,
      recentEvents: state.recentEvents,
      stats: state.stats,
      view: {
        followTargetId: followTargetId || null,
        lodLevel,
        cameraProfile,
      },
    };
    const nextRuntimeSignature = buildBattleSpectatorRuntimeSignature({
      state,
      followTargetId,
      lodLevel,
      cameraProfile,
    });
    if (battleSpectatorRuntimeSignatureRef.current === nextRuntimeSignature) {
      return;
    }

    battleSpectatorRuntimeSignatureRef.current = nextRuntimeSignature;
    postRuntimeToFlightSim("firescope-battle-spectator-update", runtimePayload);
  };

  const focusBattleSpectatorView = (options: {
    point: {
      longitude: number;
      latitude: number;
      altitudeMeters: number;
    };
    followTargetId?: string;
    sideFilterId?: string;
    cameraProfile?: BattleSpectatorCameraProfile;
    durationSeconds?: number;
    headingDegrees?: number;
    pitchDegrees?: number;
    rangeMeters?: number;
  }) => {
    const nextCameraProfile =
      options.cameraProfile ??
      resolveBattleSpectatorFollowTargetCameraProfile(
        options.followTargetId,
        visibleBattleSpectator
      ) ??
      battleSpectatorCameraProfile;
    if (options.sideFilterId) {
      setBattleSpectatorSideFilter(options.sideFilterId);
    }
    if (
      options.cameraProfile !== undefined &&
      options.followTargetId === undefined
    ) {
      setBattleSpectatorCameraProfile(nextCameraProfile);
    }
    if (options.followTargetId !== undefined) {
      setBattleSpectatorFollowTargetId(options.followTargetId);
      setBattleSpectatorCameraProfile(nextCameraProfile);
      if (battleSpectatorRuntimeReady && showBattleSpectator && visibleBattleSpectator) {
        syncBattleSpectatorRuntime(
          visibleBattleSpectator,
          options.followTargetId,
          battleSpectatorLodLevel,
          nextCameraProfile
        );
      }
    }
    jumpToBattleSpectatorPoint(options.point, {
      cameraProfile: nextCameraProfile,
      durationSeconds: options.durationSeconds,
      headingDegrees: options.headingDegrees,
      pitchDegrees: options.pitchDegrees,
      rangeMeters: options.rangeMeters,
    });
    closeBattleSpectatorPanelOnMobile();
  };

  const openBattleSpectatorHeroView = (followTargetId: string | undefined) => {
    if (!followTargetId) {
      return;
    }

    setBattleSpectatorHeroTargetId(followTargetId);
  };

  const closeBattleSpectatorHeroView = () => {
    setBattleSpectatorHeroTargetId("");
  };

  const focusBattleSpectatorPatrolTarget = (
    target: BattleSpectatorPatrolTarget | undefined,
    options?: { preservePanel?: boolean }
  ) => {
    if (!target) {
      return;
    }

    setBattleSpectatorHighlightedPatrolTargetId(target.id);
    focusBattleSpectatorView({
      point: target.point,
      followTargetId: target.followTargetId,
      cameraProfile: target.cameraProfile,
      durationSeconds: target.durationSeconds,
      headingDegrees: target.headingDegrees,
      pitchDegrees: target.pitchDegrees,
      rangeMeters: target.rangeMeters,
    });
    if (options?.preservePanel) {
      setBattleSpectatorPanelOpen(true);
    }
  };

  const focusBattleSpectatorSidebarEntry = (
    entry: BattleSpectatorSidebarEntry
  ) => {
    if (entry.sourceKind === "scene") {
      setBattleSpectatorHighlightedPatrolTargetId(entry.id);
      closeBattleSpectatorHeroView();
    } else {
      setBattleSpectatorHighlightedPatrolTargetId("");
      openBattleSpectatorHeroView(entry.followTargetId);
    }

    focusBattleSpectatorView({
      point: entry.point,
      followTargetId: entry.followTargetId,
      cameraProfile: entry.cameraProfile,
      durationSeconds: entry.durationSeconds,
      headingDegrees: entry.headingDegrees,
      pitchDegrees: entry.pitchDegrees,
      rangeMeters: entry.rangeMeters,
    });
  };

  const stepBattleSpectatorPatrol = (mode: "advance" | "reset" = "advance") => {
    if (battleSpectatorPatrolTargets.length === 0) {
      return;
    }

    if (mode === "reset") {
      battleSpectatorPatrolIndexRef.current = 0;
    } else {
      battleSpectatorPatrolIndexRef.current =
        (battleSpectatorPatrolIndexRef.current + 1) %
        battleSpectatorPatrolTargets.length;
    }

    focusBattleSpectatorPatrolTarget(
      battleSpectatorPatrolTargets[battleSpectatorPatrolIndexRef.current],
      { preservePanel: true }
    );
  };

  const refreshBattleSpectatorFromGame = (options?: {
    clearFollowTarget?: boolean;
    resetBriefingLog?: boolean;
    resetTrendHistory?: boolean;
    resetPatrolState?: boolean;
    captureScenarioSnapshot?: boolean;
    openPanel?: boolean;
  }) => {
    if (!game || !battleSpectatorRuntimeEnabled) {
      return;
    }

    const nextBattleSpectatorState = buildBattleSpectatorState(
      game,
      continueSimulation,
      battleSpectator
    );
    battleSpectatorStateSignatureRef.current =
      buildBattleSpectatorStateSignature(nextBattleSpectatorState);
    battleSpectatorRuntimeSignatureRef.current = "";

    if (options?.captureScenarioSnapshot) {
      try {
        if (typeof game.exportCurrentScenario === "function") {
          battleSpectatorInitialScenarioSnapshotRef.current =
            game.exportCurrentScenario();
        }
      } catch (_error) {
        battleSpectatorInitialScenarioSnapshotRef.current = null;
      }
    }

    if (options?.clearFollowTarget) {
      setBattleSpectatorFollowTargetId("");
      battleSpectatorInitialFollowSeededRef.current = false;
      battleSpectatorAutoCaptureKeyRef.current = "";
      battleSpectatorInitialJumpScenarioRef.current = "";
    }

    if (options?.resetBriefingLog) {
      battleSpectatorBriefingLogSignatureRef.current = "";
      setBattleSpectatorBriefingLog([]);
    }

    if (options?.resetTrendHistory) {
      setBattleSpectatorTrendHistory([]);
    }

    if (options?.resetPatrolState) {
      battleSpectatorPatrolIndexRef.current = 0;
      setBattleSpectatorHighlightedPatrolTargetId("");
      setBattleSpectatorAutoPatrol(false);
    }

    setCurrentBattleSpectator(nextBattleSpectatorState);
    setCurrentFocusFireAirwatch(
      focusFireAirwatchEnabled
        ? buildFocusFireAirwatchState(
            game,
            continueSimulation,
            focusFireAirwatch
          )
        : undefined
    );
    setBattleSpectatorSimulationRevision((currentValue) => currentValue + 1);

    if (options?.openPanel !== false) {
      setBattleSpectatorPanelOpen(true);
    }
  };

  const loadBattleSpectatorScenarioString = (scenarioString: string) => {
    if (!game || typeof game.loadScenario !== "function") {
      return;
    }

    try {
      game.scenarioPaused = true;
      game.loadScenario(scenarioString);
      battleSpectatorScenarioRestartedRef.current = true;
    } catch (_error) {
      return;
    }

    refreshBattleSpectatorFromGame({
      clearFollowTarget: true,
      resetBriefingLog: true,
      resetTrendHistory: true,
      resetPatrolState: true,
      captureScenarioSnapshot: true,
      openPanel: true,
    });
  };

  const loadBattleSpectatorPresetScenario = (
    preset: FlightSimScenarioPresetDefinition
  ) => {
    const scenarioJson = JSON.parse(JSON.stringify(preset.scenario)) as Record<
      string,
      unknown
    > & {
      currentScenario?: {
        id?: string;
      };
    };

    if (
      (FLIGHT_SIM_SCENARIO_ID_REFRESH_PRESET_NAMES.has(preset.name) ||
        preset.regenerateScenarioId) &&
      typeof scenarioJson.currentScenario?.id === "string"
    ) {
      scenarioJson.currentScenario.id = randomUUID();
    }

    loadBattleSpectatorScenarioString(JSON.stringify(scenarioJson));
    setBattleSpectatorPresetListExpanded(false);
  };

  const handleBattleSpectatorNewScenario = () => {
    const scenarioJson = JSON.parse(
      JSON.stringify(blankScenarioJson)
    ) as Record<string, unknown> & {
      currentScenario?: {
        id?: string;
      };
    };

    if (typeof scenarioJson.currentScenario?.id === "string") {
      scenarioJson.currentScenario.id = randomUUID();
    }

    loadBattleSpectatorScenarioString(JSON.stringify(scenarioJson));
  };

  const handleBattleSpectatorRestartScenario = () => {
    const scenarioSnapshot = battleSpectatorInitialScenarioSnapshotRef.current;
    if (!scenarioSnapshot) {
      return;
    }

    loadBattleSpectatorScenarioString(scenarioSnapshot);
  };

  const handleBattleSpectatorStepScenario = () => {
    if (!game || typeof game.stepForTimeCompression !== "function") {
      return;
    }

    game.scenarioPaused = true;
    game.stepForTimeCompression(1);
    if (typeof game.recordStep === "function") {
      game.recordStep();
    }

    refreshBattleSpectatorFromGame({
      openPanel: true,
    });
  };

  const handleBattleSpectatorTogglePlay = () => {
    if (!game) {
      return;
    }

    game.scenarioPaused = !game.scenarioPaused;
    setBattleSpectatorSimulationRevision((currentValue) => currentValue + 1);
  };

  const handleBattleSpectatorToggleTimeCompression = () => {
    if (!game) {
      return;
    }

    if (typeof game.switchScenarioTimeCompression === "function") {
      game.switchScenarioTimeCompression();
    } else if (game.currentScenario) {
      const timeCompressions = Object.keys(GAME_SPEED_DELAY_MS).map((speed) =>
        parseInt(speed, 10)
      );
      const currentCompression = game.currentScenario.timeCompression;
      const currentIndex = timeCompressions.findIndex(
        (speed) => speed === currentCompression
      );
      game.currentScenario.timeCompression =
        timeCompressions[
          (currentIndex >= 0 ? currentIndex + 1 : 0) % timeCompressions.length
        ];
    }

    setBattleSpectatorSimulationRevision((currentValue) => currentValue + 1);
  };

  const handleBattleSpectatorExportScenario = () => {
    if (
      !game ||
      typeof game.exportCurrentScenario !== "function" ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    ) {
      return;
    }

    let scenarioString = "";
    try {
      scenarioString = game.exportCurrentScenario();
    } catch (_error) {
      return;
    }

    const objectUrl = window.URL.createObjectURL(
      new Blob([scenarioString], { type: "application/json" })
    );
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = `${sanitizeFlightSimScenarioFilename(
      battleSpectatorScenarioName
    )}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleBattleSpectatorRenameScenario = () => {
    if (typeof window === "undefined" || !game?.currentScenario) {
      return;
    }

    const nextScenarioName = window.prompt(
      "시나리오 이름",
      game.currentScenario.name
    );
    if (nextScenarioName === null) {
      return;
    }

    const trimmedScenarioName = nextScenarioName.trim();
    if (
      trimmedScenarioName.length === 0 ||
      !FLIGHT_SIM_SCENARIO_NAME_REGEX.test(trimmedScenarioName)
    ) {
      window.alert('한글/영문/숫자와 ":,-"만 사용 가능하며 최대 25자입니다.');
      return;
    }

    if (trimmedScenarioName === game.currentScenario.name) {
      return;
    }

    game.currentScenario.name = trimmedScenarioName;
    refreshBattleSpectatorFromGame({
      openPanel: true,
    });
  };

  const handleBattleSpectatorFocusObjective = () => {
    if (!hasFocusFireObjective(currentFocusFireAirwatch)) {
      return;
    }

    focusBattleSpectatorView({
      point: {
        longitude: currentFocusFireAirwatch.objectiveLon,
        latitude: currentFocusFireAirwatch.objectiveLat,
        altitudeMeters: 2600,
      },
      followTargetId: undefined,
      cameraProfile: "tactical",
      rangeMeters: 6200,
      pitchDegrees: -28,
    });
  };

  const handleBattleSpectatorScenarioFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const inputElement = event.target;
    const file = inputElement.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const scenarioString = readerEvent.target?.result;
      if (typeof scenarioString === "string") {
        loadBattleSpectatorScenarioString(scenarioString);
      }
      inputElement.value = "";
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    battleSpectatorScenarioRestartedRef.current = false;
    if (
      !game ||
      !battleSpectatorRuntimeEnabled ||
      !continueSimulation ||
      typeof game.exportCurrentScenario !== "function"
    ) {
      battleSpectatorInitialScenarioSnapshotRef.current = null;
      return;
    }

    try {
      battleSpectatorInitialScenarioSnapshotRef.current =
        game.exportCurrentScenario();
    } catch (_error) {
      battleSpectatorInitialScenarioSnapshotRef.current = null;
    }
  }, [battleSpectatorRuntimeEnabled, continueSimulation, game]);

  useEffect(() => {
    const nextBattleSpectatorState = battleSpectatorRuntimeEnabled
      ? buildBattleSpectatorState(game, continueSimulation, battleSpectator)
      : undefined;
    const nextSignature = buildBattleSpectatorStateSignature(
      nextBattleSpectatorState
    );

    if (battleSpectatorStateSignatureRef.current === nextSignature) {
      return;
    }

    battleSpectatorStateSignatureRef.current = nextSignature;
    setCurrentBattleSpectator(nextBattleSpectatorState);
  }, [
    battleSpectator,
    battleSpectatorRuntimeEnabled,
    continueSimulation,
    game,
  ]);

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
    if (!currentBattleSpectator) {
      setBattleSpectatorSideFilter("all");
      setBattleSpectatorFollowTargetId("");
      setBattleSpectatorPinnedInspectTargetId("");
      setBattleSpectatorPriorityFilter("all");
      setBattleSpectatorBriefingLog([]);
      battleSpectatorInitialFollowSeededRef.current = false;
      battleSpectatorBriefingLogSignatureRef.current = "";
      return;
    }
    setBattleSpectatorHighlightedPatrolTargetId("");

    if (
      battleSpectatorSideFilter !== "all" &&
      !battleSpectatorSideOptions.some(
        (side) => side.id === battleSpectatorSideFilter
      )
    ) {
      setBattleSpectatorSideFilter("all");
    }
  }, [
    battleSpectatorSideFilter,
    battleSpectatorSideOptions,
    currentBattleSpectator,
  ]);

  useEffect(() => {
    if (!battleSpectatorPinnedInspectTargetId) {
      return;
    }

    const parsedInspectTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorPinnedInspectTargetId
    );
    const targetExists =
      parsedInspectTarget?.type === "weapon"
        ? allBattleSpectatorWeaponsById.has(parsedInspectTarget.id)
        : parsedInspectTarget?.type === "unit"
          ? allBattleSpectatorUnitsById.has(parsedInspectTarget.id)
          : false;
    if (!targetExists) {
      setBattleSpectatorPinnedInspectTargetId("");
    }
  }, [
    allBattleSpectatorUnitsById,
    allBattleSpectatorWeaponsById,
    battleSpectatorPinnedInspectTargetId,
  ]);

  useEffect(() => {
    const handleBattleSpectatorSelectionMessage = (
      event: MessageEvent<{
        type?: string;
        payload?: BattleSpectatorRuntimeSelectionPayload;
      }>
    ) => {
      if (
        (event.origin.length > 0 &&
          event.origin !== window.location.origin) ||
        event.data?.type !== "firescope-battle-spectator-selection"
      ) {
        return;
      }

      const followTargetId =
        typeof event.data.payload?.followTargetId === "string"
          ? event.data.payload.followTargetId
          : "";
      const parsedInspectTarget = parseBattleSpectatorFollowTargetId(
        followTargetId
      );
      const targetExists =
        parsedInspectTarget?.type === "weapon"
          ? allBattleSpectatorWeaponsById.has(parsedInspectTarget.id)
          : parsedInspectTarget?.type === "unit"
            ? allBattleSpectatorUnitsById.has(parsedInspectTarget.id)
            : false;
      if (!targetExists) {
        return;
      }

      setBattleSpectatorHighlightedPatrolTargetId("");
      setBattleSpectatorPinnedInspectTargetId(followTargetId);
    };

    window.addEventListener("message", handleBattleSpectatorSelectionMessage);
    return () => {
      window.removeEventListener(
        "message",
        handleBattleSpectatorSelectionMessage
      );
    };
  }, [allBattleSpectatorUnitsById, allBattleSpectatorWeaponsById]);

  useEffect(() => {
    if (!battleSpectatorHighlightedPatrolTargetId) {
      return;
    }

    const targetExists = battleSpectatorPatrolTargets.some(
      (target) => target.id === battleSpectatorHighlightedPatrolTargetId
    );
    if (!targetExists) {
      setBattleSpectatorHighlightedPatrolTargetId("");
    }
  }, [battleSpectatorHighlightedPatrolTargetId, battleSpectatorPatrolTargets]);

  useEffect(() => {
    if (!showBattleSpectator || !battleSpectatorBriefing) {
      if (!showBattleSpectator) {
        battleSpectatorBriefingLogSignatureRef.current = "";
        setBattleSpectatorBriefingLog([]);
      }
      return;
    }

    const primaryAction = battleSpectatorBriefing.actions[0];
    const fallbackPoint =
      latestBattleEngagementPoint ?? battleSpectatorOverviewPoint;
    if (!primaryAction && !fallbackPoint) {
      return;
    }

    const nextSignature = [
      battleSpectatorBriefing.stageLabel,
      battleSpectatorBriefing.headline,
      battleSpectatorBriefing.detail,
      primaryAction?.id ?? "",
    ].join("|");
    if (battleSpectatorBriefingLogSignatureRef.current === nextSignature) {
      return;
    }

    battleSpectatorBriefingLogSignatureRef.current = nextSignature;
    const eventPoint = primaryAction?.point ?? fallbackPoint;
    if (!eventPoint) {
      return;
    }

    const timestampSource =
      visibleBattleSpectator?.currentTime ??
      currentBattleSpectator?.currentTime ??
      Date.now();
    const nextEntry: BattleSpectatorBriefingLogEntry = {
      id: `briefing-log-${timestampSource}-${battleSpectatorBriefing.stageLabel}`,
      timestampLabel: formatBattleSpectatorTimestamp(timestampSource),
      stageLabel: battleSpectatorBriefing.stageLabel,
      stageTone: battleSpectatorBriefing.stageTone,
      headline: battleSpectatorBriefing.headline,
      detail: battleSpectatorBriefing.detail,
      point: eventPoint,
      followTargetId: primaryAction?.followTargetId,
      cameraProfile:
        primaryAction?.cameraProfile ?? battleSpectatorCameraProfile,
    };

    setBattleSpectatorBriefingLog((currentLog) =>
      [nextEntry, ...currentLog].slice(0, 6)
    );
  }, [
    battleSpectatorBriefing,
    battleSpectatorCameraProfile,
    battleSpectatorOverviewPoint,
    currentBattleSpectator,
    latestBattleEngagementPoint,
    showBattleSpectator,
    visibleBattleSpectator,
  ]);

  useEffect(() => {
    if (!showBattleSpectator) {
      battleSpectatorInitialFollowSeededRef.current = false;
      return;
    }

    if (battleSpectatorFollowTargetId) {
      battleSpectatorInitialFollowSeededRef.current = true;
      return;
    }

    if (
      battleSpectatorInitialFollowSeededRef.current ||
      !currentBattleSpectator
    ) {
      return;
    }

    const initialJumpPoint = resolveBattleSpectatorJumpPoint(
      currentBattleSpectator
    );
    battleSpectatorInitialFollowSeededRef.current = true;
    if (!initialJumpPoint?.followTargetId) {
      return;
    }

    applyBattleSpectatorFollowTargetSelection(
      initialJumpPoint.followTargetId,
      currentBattleSpectator,
      battleSpectatorCameraProfile,
      setBattleSpectatorFollowTargetId,
      setBattleSpectatorCameraProfile
    );
  }, [
    battleSpectatorCameraProfile,
    battleSpectatorFollowTargetId,
    currentBattleSpectator,
    applyBattleSpectatorFollowTargetSelection,
    showBattleSpectator,
  ]);

  useEffect(() => {
    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorFollowTargetId
    );

    if (!parsedFollowTarget) {
      return;
    }

    const followTargetExists =
      parsedFollowTarget.type === "weapon"
        ? (visibleBattleSpectator?.weapons ?? []).some(
            (weapon) => weapon.id === parsedFollowTarget.id
          )
        : (visibleBattleSpectator?.units ?? []).some(
            (unit) => unit.id === parsedFollowTarget.id
          );

    if (!followTargetExists) {
      setBattleSpectatorFollowTargetId("");
    }
  }, [battleSpectatorFollowTargetId, visibleBattleSpectator]);

  useEffect(() => {
    if (!showBattleSpectator || !battleSpectatorAutoCapture) {
      battleSpectatorAutoCaptureKeyRef.current = "";
      return;
    }

    if (!battleSpectatorRuntimeReady) {
      return;
    }

    if (latestBattleSpectatorWeapon) {
      const nextKey = `weapon:${latestBattleSpectatorWeapon.id}`;
      if (battleSpectatorAutoCaptureKeyRef.current === nextKey) {
        return;
      }

      battleSpectatorAutoCaptureKeyRef.current = nextKey;
      focusBattleSpectatorView({
        point: resolveBattleSpectatorWeaponJumpPoint(
          latestBattleSpectatorWeapon
        ),
        followTargetId: nextKey,
      });
      return;
    }

    if (!latestTrackableBattleSpectatorEvent) {
      return;
    }

    const eventPoint = resolveBattleSpectatorEventJumpPoint(
      latestTrackableBattleSpectatorEvent
    );
    if (!eventPoint) {
      return;
    }

    const followTargetId =
      typeof latestTrackableBattleSpectatorEvent.weaponId === "string"
        ? `weapon:${latestTrackableBattleSpectatorEvent.weaponId}`
        : typeof latestTrackableBattleSpectatorEvent.targetId === "string"
          ? `unit:${latestTrackableBattleSpectatorEvent.targetId}`
          : typeof latestTrackableBattleSpectatorEvent.actorId === "string"
            ? `unit:${latestTrackableBattleSpectatorEvent.actorId}`
            : undefined;
    const nextKey =
      followTargetId ??
      `event:${latestTrackableBattleSpectatorEvent.id}:${eventPoint.longitude.toFixed(
        4
      )}:${eventPoint.latitude.toFixed(4)}`;

    if (battleSpectatorAutoCaptureKeyRef.current === nextKey) {
      return;
    }

    battleSpectatorAutoCaptureKeyRef.current = nextKey;
    focusBattleSpectatorView({
      point: eventPoint,
      followTargetId,
    });
  }, [
    battleSpectatorAutoCapture,
    battleSpectatorRuntimeReady,
    latestBattleSpectatorWeapon,
    latestTrackableBattleSpectatorEvent,
    showBattleSpectator,
  ]);

  useEffect(() => {
    if (
      !showBattleSpectator ||
      !battleSpectatorRuntimeReady ||
      !battleSpectatorAutoPatrol ||
      battleSpectatorAutoCapture ||
      battleSpectatorPatrolTargets.length === 0
    ) {
      battleSpectatorPatrolIndexRef.current = 0;
      return;
    }

    battleSpectatorPatrolIndexRef.current = 0;
    focusBattleSpectatorPatrolTarget(battleSpectatorPatrolTargets[0], {
      preservePanel: true,
    });

    const intervalId = window.setInterval(() => {
      battleSpectatorPatrolIndexRef.current =
        (battleSpectatorPatrolIndexRef.current + 1) %
        battleSpectatorPatrolTargets.length;
      focusBattleSpectatorPatrolTarget(
        battleSpectatorPatrolTargets[battleSpectatorPatrolIndexRef.current],
        {
          preservePanel: true,
        }
      );
    }, 6500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    battleSpectatorAutoCapture,
    battleSpectatorAutoPatrol,
    battleSpectatorPatrolTargets,
    battleSpectatorRuntimeReady,
    showBattleSpectator,
  ]);

  useEffect(() => {
    if (!showBattleSpectator) {
      setBattleSpectatorPanelOpen(true);
      battleSpectatorInitialJumpScenarioRef.current = "";
      return;
    }

    setBattleSpectatorPanelOpen(resolveInitialBattleSpectatorPanelOpen());
  }, [showBattleSpectator]);

  useEffect(() => {
    if (
      !showBattleSpectator ||
      !battleSpectatorRuntimeReady ||
      battleSpectatorAutoCapture ||
      battleSpectatorAutoPatrol ||
      !visibleBattleSpectator ||
      !latestBattleEngagementPoint
    ) {
      if (!showBattleSpectator) {
        battleSpectatorInitialJumpScenarioRef.current = "";
      }
      return;
    }

    const initialJumpScenarioKey = visibleBattleSpectator.scenarioId;
    if (
      battleSpectatorInitialJumpScenarioRef.current === initialJumpScenarioKey
    ) {
      return;
    }

    battleSpectatorInitialJumpScenarioRef.current = initialJumpScenarioKey;
    focusBattleSpectatorView({
      point: latestBattleEngagementPoint,
      followTargetId: latestBattleEngagementPoint.followTargetId,
    });
  }, [
    battleSpectatorAutoCapture,
    battleSpectatorAutoPatrol,
    battleSpectatorRuntimeReady,
    latestBattleEngagementPoint,
    showBattleSpectator,
    visibleBattleSpectator,
  ]);

  useEffect(() => {
    if (!currentBattleSpectator) {
      setBattleSpectatorTrendHistory([]);
      return;
    }

    const nextEntry = buildBattleSpectatorSideTrendHistoryEntry(
      currentBattleSpectator
    );
    if (!nextEntry) {
      return;
    }

    setBattleSpectatorTrendHistory((currentHistory) => {
      if (currentHistory.length === 0) {
        return [nextEntry];
      }

      const lastEntry = currentHistory[currentHistory.length - 1];
      if (
        lastEntry.scenarioId === nextEntry.scenarioId &&
        lastEntry.signature === nextEntry.signature
      ) {
        return currentHistory;
      }

      const sameScenarioHistory = currentHistory.filter(
        (entry) => entry.scenarioId === nextEntry.scenarioId
      );

      return [...sameScenarioHistory, nextEntry].slice(-10);
    });
  }, [currentBattleSpectator]);

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
      const runtimeSource = iframeWindow?.__FLIGHT_SIM_RUNTIME__ ?? null;
      const nextRuntimeInfo = runtimeSource
        ? (JSON.parse(JSON.stringify(runtimeSource)) as FlightSimRuntimeInfo)
        : null;
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

    const intervalId = window.setInterval(updateRuntimeProvider, 250);
    updateRuntimeProvider();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [assetState, iframeSrc]);

  useEffect(() => {
    if (
      !game ||
      !battleSpectatorEnabled ||
      !continueSimulation ||
      !battleSpectatorRuntimeReady ||
      battleSpectatorScenarioRestartedRef.current
    ) {
      return;
    }

    battleSpectatorScenarioRestartedRef.current = true;
    const initialScenarioSnapshot =
      battleSpectatorInitialScenarioSnapshotRef.current;
    if (!initialScenarioSnapshot || typeof game.loadScenario !== "function") {
      return;
    }

    try {
      game.loadScenario(initialScenarioSnapshot);
    } catch (_error) {
      return;
    }

    const restartedBattleSpectatorState = buildBattleSpectatorState(
      game,
      continueSimulation,
      battleSpectator
    );
    battleSpectatorStateSignatureRef.current =
      buildBattleSpectatorStateSignature(restartedBattleSpectatorState);
    battleSpectatorRuntimeSignatureRef.current = "";
    battleSpectatorBriefingLogSignatureRef.current = "";
    battleSpectatorAutoCaptureKeyRef.current = "";
    battleSpectatorPatrolIndexRef.current = 0;
    battleSpectatorInitialJumpScenarioRef.current = "";
    battleSpectatorInitialFollowSeededRef.current = false;
    setCurrentBattleSpectator(restartedBattleSpectatorState);
    setBattleSpectatorFollowTargetId("");
    setBattleSpectatorBriefingLog([]);
    setBattleSpectatorTrendHistory([]);
    setCurrentFocusFireAirwatch(
      focusFireAirwatchEnabled
        ? buildFocusFireAirwatchState(
            game,
            continueSimulation,
            focusFireAirwatch
          )
        : undefined
    );
  }, [
    battleSpectator,
    battleSpectatorEnabled,
    battleSpectatorRuntimeReady,
    continueSimulation,
    focusFireAirwatch,
    focusFireAirwatchEnabled,
    game,
  ]);

  useEffect(() => {
    if (
      !showBattleSpectator ||
      !visibleBattleSpectator ||
      !battleSpectatorRuntimeReady
    ) {
      if (!showBattleSpectator || !battleSpectatorRuntimeReady) {
        battleSpectatorRuntimeSignatureRef.current = "";
      }
      return;
    }

    syncBattleSpectatorRuntime(
      visibleBattleSpectator,
      battleSpectatorFollowTargetId,
      battleSpectatorLodLevel,
      battleSpectatorCameraProfile
    );
  }, [
    battleSpectatorCameraProfile,
    battleSpectatorFollowTargetId,
    battleSpectatorLodLevel,
    battleSpectatorRuntimeReady,
    showBattleSpectator,
    visibleBattleSpectator,
  ]);

  useEffect(() => {
    if (
      !flightSimFrameReady ||
      !showFocusFireAirwatch ||
      !currentFocusFireAirwatch
    ) {
      return;
    }

    postRuntimeToFlightSim("firescope-focus-fire-update", {
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
    if (!game || !battleSpectatorRuntimeEnabled || !showBattleSpectator) {
      return;
    }

    let cancelled = false;

    const syncBattleSpectatorState = () => {
      if (cancelled || document.hidden) {
        return;
      }

      const nextBattleSpectatorState = buildBattleSpectatorState(
        game,
        continueSimulation
      );
      const nextSignature = buildBattleSpectatorStateSignature(
        nextBattleSpectatorState
      );

      if (battleSpectatorStateSignatureRef.current === nextSignature) {
        return;
      }

      battleSpectatorStateSignatureRef.current = nextSignature;
      setCurrentBattleSpectator(nextBattleSpectatorState);
    };

    syncBattleSpectatorState();
    const syncIntervalId = window.setInterval(syncBattleSpectatorState, 250);

    return () => {
      cancelled = true;
      window.clearInterval(syncIntervalId);
    };
  }, [
    battleSpectatorRuntimeEnabled,
    continueSimulation,
    game,
    showBattleSpectator,
  ]);

  useEffect(() => {
    if (!game || !focusFireAirwatchEnabled || !showFocusFireAirwatch) {
      return;
    }

    let cancelled = false;

    const syncFocusFireState = () => {
      const summary = game.getFocusFireSummary();
      if (
        cancelled ||
        document.hidden ||
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
    if (
      !game ||
      !continueSimulation ||
      (showBattleSpectator && !battleSpectatorRuntimeReady) ||
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
      let gameEnded = gameTerminated || gameTruncated;

      while (!cancelled && !game.scenarioPaused && !gameEnded) {
        const [, , terminated, truncated] = game.stepForTimeCompression();
        game.recordStep();
        gameTerminated = terminated;
        gameTruncated = truncated;
        gameEnded = gameTerminated || gameTruncated;
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
  }, [
    battleSpectatorRuntimeReady,
    battleSpectatorSimulationRevision,
    continueSimulation,
    game,
    showBattleSpectator,
  ]);

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
      <input
        ref={battleSpectatorScenarioFileInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleBattleSpectatorScenarioFileChange}
      />

      {battleSpectatorEnabled && (
        <>
          <Button
            variant="contained"
            onClick={() => setBattleSpectatorPanelOpen((open) => !open)}
            sx={{
              display: "inline-flex",
              position: "absolute",
              top: { xs: "auto", sm: "auto" },
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              borderRadius: 999,
              px: 1.75,
              py: 0.95,
              backgroundColor: "rgba(10, 28, 36, 0.92)",
              color: "#ecfffb",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.32)",
              "&:hover": {
                backgroundColor: "rgba(16, 42, 46, 0.96)",
              },
            }}
          >
            {battleSpectatorPanelOpen ? "전황 도크 접기" : "전황 도크"}
          </Button>
          <Box
            onClick={() => setBattleSpectatorPanelOpen(false)}
            sx={{
              display: {
                xs: battleSpectatorPanelOpen ? "block" : "none",
                sm: "none",
              },
              position: "absolute",
              inset: 0,
              zIndex: 2,
              backgroundColor: "rgba(1, 5, 10, 0.38)",
            }}
          />
        </>
      )}

      {battleSpectatorEnabled && displayedBattleSpectator && (
        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            right: { xs: 20, lg: 396 },
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1}>
            <Box
              sx={{
                pointerEvents: "auto",
                minWidth: { lg: 320 },
                p: 1.15,
                borderRadius: 2.2,
                backdropFilter: "blur(14px)",
                background:
                  "linear-gradient(180deg, rgba(7, 20, 24, 0.9) 0%, rgba(5, 14, 18, 0.76) 100%)",
                border: "1px solid rgba(98, 230, 208, 0.18)",
                boxShadow: "0 16px 32px rgba(0, 0, 0, 0.24)",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: "#62e6d0", letterSpacing: "0.16em" }}
                  >
                    전장 3D 관전
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#ecfffb",
                      lineHeight: 1.15,
                    }}
                  >
                    {displayedBattleSpectator.scenarioName}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12.5,
                      color: "rgba(236, 255, 251, 0.74)",
                    }}
                  >
                    유닛 {displayedBattleSpectator.units.length} · 탄체{" "}
                    {displayedBattleSpectator.stats.weaponsInFlight} · 세력{" "}
                    {displayedBattleSpectator.stats.sides} · 필터{" "}
                    {battleSpectatorSideFilter === "all"
                      ? "전체"
                      : (battleSpectatorSideOptions.find(
                          (side) => side.id === battleSpectatorSideFilter
                        )?.name ?? "선택")}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      gap: 0.7,
                    }}
                  >
                    {[
                      [
                        "탄체",
                        `${displayedBattleSpectator.stats.weaponsInFlight}`,
                      ],
                      ["경보", `${battleSpectatorAlertRows.length}`],
                      ["핫스팟", `${battleSpectatorHotspotRows.length}`],
                      ["시점", battleSpectatorCameraProfileOption.label],
                    ].map(([label, value]) => (
                      <Box
                        key={label}
                        sx={{
                          px: 0.8,
                          py: 0.75,
                          borderRadius: 1.5,
                          backgroundColor: "rgba(255, 255, 255, 0.045)",
                          border: "1px solid rgba(98, 230, 208, 0.12)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10,
                            letterSpacing: "0.1em",
                            color: "rgba(98, 230, 208, 0.76)",
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: 12.6,
                            fontWeight: 800,
                            color: "#ecfffb",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  onClick={onBack}
                  sx={{
                    flexShrink: 0,
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                    backgroundColor: "rgba(8, 24, 29, 0.56)",
                    "&:hover": {
                      borderColor: "#62e6d0",
                      backgroundColor: "rgba(12, 34, 39, 0.76)",
                    },
                  }}
                >
                  돌아가기
                </Button>
              </Stack>
            </Box>
            <Box
              sx={{
                pointerEvents: "auto",
                flex: 1,
                minWidth: 0,
                p: 1.05,
                borderRadius: 2.2,
                backdropFilter: "blur(14px)",
                background:
                  "linear-gradient(180deg, rgba(6, 18, 22, 0.88) 0%, rgba(4, 12, 16, 0.74) 100%)",
                border: "1px solid rgba(98, 230, 208, 0.14)",
                boxShadow: "0 16px 32px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ flexWrap: "wrap", alignItems: "center" }}
              >
                {[
                  {
                    id: "overview" as const,
                    label: "전장",
                    ref: battleSpectatorOverviewSectionRef,
                  },
                  {
                    id: "briefing" as const,
                    label: "브리핑",
                    ref: battleSpectatorBriefingSectionRef,
                  },
                  {
                    id: "engagements" as const,
                    label: "추적",
                    ref: battleSpectatorEngagementSectionRef,
                  },
                  {
                    id: "analysis" as const,
                    label: "분석",
                    ref: battleSpectatorAnalysisSectionRef,
                  },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    size="small"
                    variant={
                      battleSpectatorDockTab === tab.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => {
                      setBattleSpectatorDockTab(tab.id);
                      setBattleSpectatorPanelOpen(true);
                      window.setTimeout(() => {
                        tab.ref.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 0);
                    }}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorDockTab === tab.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      backgroundColor:
                        battleSpectatorDockTab === tab.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.62)",
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
                {battleSpectatorAlertRows.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setBattleSpectatorDockTab("overview");
                      setBattleSpectatorPanelOpen(true);
                      window.setTimeout(() => {
                        battleSpectatorOverviewSectionRef.current?.scrollIntoView(
                          {
                            behavior: "smooth",
                            block: "start",
                          }
                        );
                      }, 0);
                    }}
                    sx={{
                      minWidth: 0,
                      borderColor: "rgba(255, 123, 114, 0.28)",
                      color: "#ffb1aa",
                    }}
                  >
                    경보 {battleSpectatorAlertRows.length}
                  </Button>
                )}
              </Stack>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={0.8}
                sx={{ mt: 0.9, alignItems: { md: "center" }, flexWrap: "wrap" }}
              >
                <Box
                  sx={{
                    minWidth: { xs: "100%", md: 260 },
                    px: 1.05,
                    py: 0.82,
                    borderRadius: 1.5,
                    border: "1px solid rgba(98, 230, 208, 0.22)",
                    backgroundColor: "rgba(7, 19, 24, 0.94)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.2,
                      letterSpacing: "0.1em",
                      color: "rgba(98, 230, 208, 0.82)",
                    }}
                  >
                    현재 추적
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: 12.6,
                      fontWeight: 700,
                      color: "#ecfffb",
                    }}
                  >
                    {battleSpectatorFollowTargetLabel}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    minWidth: { xs: "100%", md: 280 },
                    px: 1,
                    py: 0.82,
                    borderRadius: 1.5,
                    border: "1px dashed rgba(127, 231, 255, 0.22)",
                    backgroundColor: "rgba(127, 231, 255, 0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.2,
                      letterSpacing: "0.1em",
                      color: "rgba(127, 231, 255, 0.82)",
                    }}
                  >
                    LIVE PICK
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: 11.8,
                      color: "rgba(236, 255, 251, 0.78)",
                    }}
                  >
                    자산 또는 탄체를 클릭하면 우측 인스펙터가 바로 갱신되고,
                    거기서 추적·측면·오비트 시점을 바로 전환할 수 있습니다.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant={
                      battleSpectatorSideFilter === "all"
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setBattleSpectatorSideFilter("all")}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorSideFilter === "all"
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      backgroundColor:
                        battleSpectatorSideFilter === "all"
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.62)",
                    }}
                  >
                    필터 전체
                  </Button>
                  {battleSpectatorSideOptions.map((side) => (
                    <Button
                      key={`overlay-side-${side.id}`}
                      size="small"
                      variant={
                        battleSpectatorSideFilter === side.id
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => setBattleSpectatorSideFilter(side.id)}
                      sx={{
                        minWidth: 0,
                        color:
                          battleSpectatorSideFilter === side.id
                            ? "#041215"
                            : "#ecfffb",
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        backgroundColor:
                          battleSpectatorSideFilter === side.id
                            ? "#62e6d0"
                            : "rgba(8, 24, 29, 0.62)",
                      }}
                    >
                      {`세력 ${side.name}`}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                  {BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      size="small"
                      variant={
                        battleSpectatorCameraProfile === option.id
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => setBattleSpectatorCameraProfile(option.id)}
                      sx={{
                        minWidth: 0,
                        color:
                          battleSpectatorCameraProfile === option.id
                            ? "#041215"
                            : "#ecfffb",
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        backgroundColor:
                          battleSpectatorCameraProfile === option.id
                            ? "#62e6d0"
                            : "rgba(8, 24, 29, 0.62)",
                      }}
                    >
                      {`시점 ${option.label}`}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!latestBattleEngagementPoint}
                    onClick={() => {
                      if (!latestBattleEngagementPoint) {
                        return;
                      }
                      focusBattleSpectatorView({
                        point: latestBattleEngagementPoint,
                        followTargetId:
                          latestBattleEngagementPoint.followTargetId,
                      });
                    }}
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      color: "#ecfffb",
                    }}
                  >
                    최신 교전
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!latestBattleSpectatorWeapon}
                    onClick={() => {
                      if (!latestBattleSpectatorWeapon) {
                        return;
                      }
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorWeaponJumpPoint(
                          latestBattleSpectatorWeapon
                        ),
                        followTargetId: `weapon:${latestBattleSpectatorWeapon.id}`,
                      });
                    }}
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      color: "#ecfffb",
                    }}
                  >
                    활성 탄체
                  </Button>
                  <Button
                    size="small"
                    variant={
                      battleSpectatorAutoCapture ? "contained" : "outlined"
                    }
                    onClick={() =>
                      setBattleSpectatorAutoCapture((currentValue) => {
                        const nextValue = !currentValue;
                        if (nextValue) {
                          setBattleSpectatorAutoPatrol(false);
                        }
                        return nextValue;
                      })
                    }
                    sx={{
                      minWidth: 0,
                      color: battleSpectatorAutoCapture ? "#041215" : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      backgroundColor: battleSpectatorAutoCapture
                        ? "#62e6d0"
                        : "rgba(8, 24, 29, 0.62)",
                    }}
                  >
                    즉시 포착
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      )}

      {battleSpectatorEnabled && battleSpectatorSidebarEntries.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: { xs: 112, sm: 118 },
            left: 20,
            zIndex: 4,
            width: { xs: "min(320px, calc(100% - 40px))", sm: 320 },
            maxHeight: {
              xs: "min(40vh, calc(100vh - 240px))",
              sm: "min(58vh, calc(100vh - 220px))",
            },
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <ToolbarCollapsible
            title="관전 요소"
            subtitle="클릭 즉시 해당 3D 시점으로 이동"
            headerBadges={[
              {
                label: `${battleSpectatorSidebarEntries.length}개`,
                tone: "accent",
              },
            ]}
            prependIcon={DocumentScannerOutlinedIcon}
            open={true}
            content={
              <Stack spacing={1} sx={{ gap: "8px" }}>
                {battleSpectatorSidebarEntries.map((entry) => {
                  const active =
                    entry.sourceKind === "scene"
                      ? battleSpectatorHighlightedPatrolTargetId === entry.id
                      : battleSpectatorFollowTargetId === entry.followTargetId;

                  return (
                    <MenuItem
                      key={entry.id}
                      onClick={() => focusBattleSpectatorSidebarEntry(entry)}
                      sx={{
                        borderRadius: 1.5,
                        border: active
                          ? "1px solid rgba(98, 230, 208, 0.32)"
                          : "1px solid rgba(45, 214, 196, 0.1)",
                        backgroundColor: active
                          ? "rgba(98, 230, 208, 0.12)"
                          : "rgba(255,255,255,0.03)",
                        alignItems: "center",
                        px: 1.1,
                        py: 0.95,
                        "&:hover": {
                          backgroundColor: active
                            ? "rgba(98, 230, 208, 0.16)"
                            : "rgba(98, 230, 208, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 34 }}>
                        <EntityIcon
                          type={entry.iconType}
                          width={21}
                          height={21}
                          color={entry.iconColor}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={entry.label}
                        secondary={entry.detail}
                        primaryTypographyProps={{
                          fontWeight: 700,
                          fontSize: 13.2,
                          color: "#ecfffb",
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            mt: 0.25,
                            fontSize: 10.8,
                            color: "rgba(236, 255, 251, 0.62)",
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          ml: 1,
                          fontSize: 10.8,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          color: active
                            ? "#62e6d0"
                            : "rgba(236, 255, 251, 0.46)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.cameraProfile === "chase"
                          ? "추적"
                          : entry.cameraProfile === "side"
                            ? "측면"
                            : entry.cameraProfile === "orbit"
                              ? "오비트"
                              : "전술"}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </Stack>
            }
          />
        </Box>
      )}

      {battleSpectatorHybridEnabled && displayedBattleSpectator && (
        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            top: 16,
            left: { xs: 16, sm: 396 },
            right: { xs: 16, lg: 356 },
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              pointerEvents: "auto",
              px: { xs: 1.15, sm: 1.3 },
              py: { xs: 1.05, sm: 1.2 },
              borderRadius: 3,
              backdropFilter: "blur(18px)",
              background:
                "radial-gradient(circle at top left, rgba(98, 230, 208, 0.16) 0%, transparent 34%), radial-gradient(circle at top right, rgba(255, 183, 77, 0.14) 0%, transparent 42%), linear-gradient(180deg, rgba(5, 16, 20, 0.94) 0%, rgba(3, 10, 14, 0.82) 100%)",
              border: "1px solid rgba(98, 230, 208, 0.16)",
              boxShadow: "0 22px 46px rgba(0, 0, 0, 0.34)",
            }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.2}
              alignItems={{ xs: "stretch", lg: "flex-start" }}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={0.65}
                  sx={{ alignItems: "center", flexWrap: "wrap" }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.4,
                      letterSpacing: "0.18em",
                      color: "#62e6d0",
                    }}
                  >
                    TACTICAL FUSION
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.78,
                      py: 0.28,
                      borderRadius: 99,
                      fontSize: 10.2,
                      fontWeight: 800,
                      color: battleSpectatorBriefing?.stageTone ?? "#84d8ff",
                      backgroundColor: `${
                        battleSpectatorBriefing?.stageTone ?? "#84d8ff"
                      }18`,
                      border: `1px solid ${
                        battleSpectatorBriefing?.stageTone ?? "#84d8ff"
                      }24`,
                    }}
                  >
                    {battleSpectatorBriefing?.stageLabel ?? "전장 링크"}
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.78,
                      py: 0.28,
                      borderRadius: 99,
                      fontSize: 10.2,
                      fontWeight: 800,
                      color: battleSpectatorScenarioPaused ? "#ffd166" : "#62e6d0",
                      backgroundColor: battleSpectatorScenarioPaused
                        ? "rgba(255, 209, 102, 0.12)"
                        : "rgba(98, 230, 208, 0.12)",
                      border: battleSpectatorScenarioPaused
                        ? "1px solid rgba(255, 209, 102, 0.2)"
                        : "1px solid rgba(98, 230, 208, 0.2)",
                    }}
                  >
                    {battleSpectatorScenarioPaused ? "PAUSED" : "LIVE"}
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.78,
                      py: 0.28,
                      borderRadius: 99,
                      fontSize: 10.2,
                      fontWeight: 800,
                      color: "rgba(236, 255, 251, 0.84)",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    속도 {battleSpectatorScenarioTimeCompression}x
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: { xs: 18, sm: 20 },
                    fontWeight: 800,
                    color: "#ecfffb",
                    lineHeight: 1.12,
                  }}
                >
                  {battleSpectatorScenarioName}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.6,
                    color: "rgba(236, 255, 251, 0.74)",
                    lineHeight: 1.5,
                  }}
                >
                  {currentFocusFireAirwatch?.objectiveName
                    ? `${currentFocusFireAirwatch.objectiveName} 축을 기준으로 기체 시점과 전장 관전 데이터를 동시에 동기화합니다.`
                    : "전투기 비행 시점 위에 전장 3D 관전 데이터를 겹쳐 지휘형 관전 화면으로 운용합니다."}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}
              >
                {hybridBattleSpectatorPrimaryAction && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() =>
                      focusBattleSpectatorView({
                        point: hybridBattleSpectatorPrimaryAction.point,
                        followTargetId:
                          hybridBattleSpectatorPrimaryAction.followTargetId,
                        cameraProfile:
                          hybridBattleSpectatorPrimaryAction.cameraProfile,
                      })
                    }
                    sx={{
                      minWidth: 0,
                      color: "#041215",
                      backgroundColor:
                        battleSpectatorBriefing?.stageTone ?? "#62e6d0",
                      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
                      "&:hover": {
                        backgroundColor:
                          battleSpectatorBriefing?.stageTone ?? "#62e6d0",
                        filter: "brightness(1.06)",
                      },
                    }}
                  >
                    {hybridBattleSpectatorPrimaryAction.label}
                  </Button>
                )}
                {showFocusFireAirwatch && currentFocusFireAirwatch && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleBattleSpectatorFocusObjective}
                    sx={{
                      minWidth: 0,
                      borderColor: "rgba(255, 183, 77, 0.28)",
                      color: "#fff1df",
                      backgroundColor: "rgba(255, 183, 77, 0.08)",
                    }}
                  >
                    목표 지점
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleBattleSpectatorToggleTimeCompression}
                  sx={{
                    minWidth: 0,
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                  }}
                >
                  속도 {battleSpectatorScenarioTimeCompression}x
                </Button>
              </Stack>
            </Stack>
            <Box
              sx={{
                mt: 1.05,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 0.72,
              }}
            >
              {(battleSpectatorBriefing?.metrics ?? [
                { label: "탄체", value: `${displayedBattleSpectator.stats.weaponsInFlight}` },
                { label: "경보", value: `${battleSpectatorAlertRows.length}` },
                { label: "핫스팟", value: `${battleSpectatorHotspotRows.length}` },
                { label: "시점", value: battleSpectatorCameraProfileOption.label },
              ]).map((metric) => (
                <Box
                  key={metric.label}
                  sx={{
                    px: 0.9,
                    py: 0.82,
                    borderRadius: 1.6,
                    backgroundColor: "rgba(255, 255, 255, 0.045)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.2,
                      letterSpacing: "0.09em",
                      color: "rgba(98, 230, 208, 0.78)",
                    }}
                  >
                    {metric.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.22,
                      fontSize: 12.7,
                      fontWeight: 700,
                      color: "#ecfffb",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {metric.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={0.9}
              sx={{ mt: 0.95 }}
            >
              <Box
                sx={{
                  flex: 1,
                  p: 1.05,
                  borderRadius: 2,
                  background:
                    "linear-gradient(180deg, rgba(7, 22, 29, 0.92) 0%, rgba(5, 14, 18, 0.86) 100%)",
                  border: `1px solid ${hybridBattleSpectatorSelectedUnitTone}20`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.4,
                    letterSpacing: "0.12em",
                    color: hybridBattleSpectatorSelectedUnitTone,
                  }}
                >
                  CURRENT TRACK
                </Typography>
                {selectedBattleSpectatorUnit && selectedBattleSpectatorInsight ? (
                  <>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 0.45 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 15.8,
                            fontWeight: 800,
                            color: "#ecfffb",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {selectedBattleSpectatorUnit.name}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.18,
                            fontSize: 11.8,
                            color: "rgba(236, 255, 251, 0.7)",
                          }}
                        >
                          {selectedBattleSpectatorUnit.sideName} ·{" "}
                          {formatBattleSpectatorEntityType(
                            selectedBattleSpectatorUnit.entityType
                          )}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          flexShrink: 0,
                          px: 0.8,
                          py: 0.28,
                          borderRadius: 99,
                          fontSize: 10.6,
                          fontWeight: 800,
                          color: getBattleSpectatorHpTone(
                            selectedBattleSpectatorUnit.hpFraction
                          ),
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        체력{" "}
                        {formatBattleSpectatorHp(
                          selectedBattleSpectatorUnit.hpFraction
                        )}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        mt: 0.72,
                        fontSize: 12.2,
                        color: "rgba(236, 255, 251, 0.78)",
                        lineHeight: 1.5,
                      }}
                    >
                      표적{" "}
                      {selectedBattleSpectatorInsight.targetName ?? "미지정"} ·
                      접근 탄체 {selectedBattleSpectatorInsight.incomingWeapons}
                      발 · 발사 중 {selectedBattleSpectatorInsight.outgoingWeapons}발
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.48,
                        fontSize: 11.8,
                        color: "rgba(236, 255, 251, 0.66)",
                      }}
                    >
                      속도 {Math.round(selectedBattleSpectatorUnit.speedKts)} kt ·
                      방위{" "}
                      {formatBattleSpectatorHeading(
                        selectedBattleSpectatorUnit.headingDeg
                      )}{" "}
                      · 연료{" "}
                      {formatBattleSpectatorFuelFraction(
                        selectedBattleSpectatorUnit.fuelFraction
                      )}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.7}
                      sx={{ mt: 0.85, flexWrap: "wrap" }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          openBattleSpectatorHeroView(
                            `unit:${selectedBattleSpectatorUnit.id}`
                          );
                          focusBattleSpectatorView({
                            point: resolveBattleSpectatorUnitJumpPoint(
                              selectedBattleSpectatorUnit
                            ),
                            followTargetId: `unit:${selectedBattleSpectatorUnit.id}`,
                            sideFilterId: selectedBattleSpectatorUnit.sideId,
                            cameraProfile: resolveBattleSpectatorUnitCameraProfile(
                              selectedBattleSpectatorUnit
                            ),
                          });
                        }}
                        sx={{
                          minWidth: 0,
                          borderColor: `${hybridBattleSpectatorSelectedUnitTone}44`,
                          color: "#ecfffb",
                        }}
                      >
                        선택 유닛 추적
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Typography
                      sx={{
                        mt: 0.48,
                        fontSize: 15.4,
                        fontWeight: 800,
                        color: "#ecfffb",
                      }}
                    >
                      전력 선택 대기
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.6,
                        fontSize: 12.2,
                        color: "rgba(236, 255, 251, 0.72)",
                        lineHeight: 1.5,
                      }}
                    >
                      지형 위 전력이나 탄체를 클릭하면 이 카드가 즉시 대상
                      추적 상태로 바뀌고, 우측 관전 패널과 함께 세부 상태를
                      띄웁니다.
                    </Typography>
                  </>
                )}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  p: 1.05,
                  borderRadius: 2,
                  background:
                    "linear-gradient(180deg, rgba(29, 17, 10, 0.92) 0%, rgba(13, 8, 5, 0.86) 100%)",
                  border: "1px solid rgba(255, 183, 77, 0.18)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.4,
                    letterSpacing: "0.12em",
                    color: "#ffb74d",
                  }}
                >
                  STRIKE / THREAT
                </Typography>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: 15.8,
                    fontWeight: 800,
                    color: "#fff6ec",
                  }}
                >
                  {showFocusFireAirwatch && focusFireInsight
                    ? `충격량 지수 ${focusFireInsight.shockIndex}`
                    : battleSpectatorBriefing?.headline ??
                      battleSpectatorActivitySummary?.statusLabel ??
                      "실시간 위협 감시"}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.72,
                    fontSize: 12.2,
                    color: "rgba(255, 246, 236, 0.78)",
                    lineHeight: 1.5,
                  }}
                >
                  {showFocusFireAirwatch && focusFireInsight
                    ? focusFireInsight.summary
                    : battleSpectatorBriefing?.detail ??
                      battleSpectatorActivitySummary?.statusDetail ??
                      "전장 이벤트와 탄체 흐름을 기준으로 핵심 위협 축선을 감시합니다."}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.6}
                  sx={{ mt: 0.85, flexWrap: "wrap" }}
                >
                  {showFocusFireAirwatch && focusFireInsight && (
                    <Typography
                      sx={{
                        px: 0.72,
                        py: 0.25,
                        borderRadius: 99,
                        fontSize: 10.4,
                        color: "#fff1df",
                        backgroundColor: "rgba(255, 183, 77, 0.12)",
                        border: "1px solid rgba(255, 183, 77, 0.16)",
                      }}
                    >
                      {focusFireInsight.intensityLabel}
                    </Typography>
                  )}
                  {hybridBattleSpectatorTopImpact && (
                    <Typography
                      sx={{
                        px: 0.72,
                        py: 0.25,
                        borderRadius: 99,
                        fontSize: 10.4,
                        color: "#fff1df",
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      ETA{" "}
                      {formatBattleSpectatorEta(hybridBattleSpectatorTopImpact.etaSec)}
                    </Typography>
                  )}
                  {hybridBattleSpectatorTopAlert && (
                    <Typography
                      sx={{
                        px: 0.72,
                        py: 0.25,
                        borderRadius: 99,
                        fontSize: 10.4,
                        color: hybridBattleSpectatorTopAlert.severityTone,
                        backgroundColor: `${hybridBattleSpectatorTopAlert.severityTone}18`,
                      }}
                    >
                      {hybridBattleSpectatorTopAlert.severityLabel}
                    </Typography>
                  )}
                  {hybridBattleSpectatorTopHotspot && (
                    <Typography
                      sx={{
                        px: 0.72,
                        py: 0.25,
                        borderRadius: 99,
                        fontSize: 10.4,
                        color: "rgba(255, 246, 236, 0.76)",
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      핫스팟 {hybridBattleSpectatorTopHotspot.eventCount}건
                    </Typography>
                  )}
                </Stack>
                <Typography
                  sx={{
                    mt: 0.7,
                    fontSize: 11.8,
                    color: "rgba(255, 246, 236, 0.68)",
                  }}
                >
                  {hybridBattleSpectatorTopImpact
                    ? `${hybridBattleSpectatorTopImpact.targetName} 기준 위험 반경 ${formatBattleSpectatorThreatRadius(
                        hybridBattleSpectatorTopImpact.threatRadiusMeters
                      )}`
                    : hybridBattleSpectatorTopAlert
                      ? hybridBattleSpectatorTopAlert.detail
                      : hybridBattleSpectatorTopHotspot
                        ? `${hybridBattleSpectatorTopHotspot.label} · 이벤트 ${hybridBattleSpectatorTopHotspot.eventCount}건 · 활성 탄체 ${hybridBattleSpectatorTopHotspot.activeWeapons}발`
                        : battleSpectatorActivitySummary?.latestMessage ??
                          "최신 경보가 들어오면 이 영역이 즉시 갱신됩니다."}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      )}

      <Box
        sx={{
          position: "absolute",
          top: battleSpectatorEnabled ? "auto" : 20,
          bottom: battleSpectatorEnabled ? 20 : "auto",
          left: battleSpectatorEnabled ? 20 : 20,
          right: battleSpectatorEnabled ? 20 : "auto",
          zIndex: 3,
          width: battleSpectatorEnabled
            ? "auto"
            : { xs: "calc(100% - 40px)", sm: 360 },
          maxWidth: battleSpectatorEnabled ? 1180 : undefined,
          maxHeight: battleSpectatorEnabled
            ? "min(52vh, 620px)"
            : "calc(100% - 40px)",
          overflowY: "auto",
          p: battleSpectatorEnabled ? 1.6 : 2.5,
          pointerEvents: battleSpectatorEnabled
            ? battleSpectatorPanelOpen
              ? "auto"
              : "none"
            : {
                xs:
                  battleSpectatorEnabled && !battleSpectatorPanelOpen
                    ? "none"
                    : "auto",
                sm: "auto",
              },
          transform: battleSpectatorEnabled
            ? battleSpectatorPanelOpen
              ? "translateY(0)"
              : "translateY(calc(100% + 28px))"
            : {
                xs:
                  battleSpectatorEnabled && !battleSpectatorPanelOpen
                    ? "translateX(calc(-100% - 28px))"
                    : "translateX(0)",
                sm: "translateX(0)",
              },
          opacity: battleSpectatorEnabled ? (battleSpectatorPanelOpen ? 1 : 0) : 1,
          transition: "transform 180ms ease, opacity 180ms ease",
          borderRadius: battleSpectatorEnabled ? 2.4 : 3,
          backdropFilter: "blur(18px)",
          background: battleSpectatorEnabled
            ? "linear-gradient(180deg, rgba(5, 16, 18, 0.94) 0%, rgba(4, 12, 15, 0.82) 100%)"
            : "linear-gradient(180deg, rgba(6, 15, 28, 0.9) 0%, rgba(4, 10, 20, 0.76) 100%)",
          border: battleSpectatorEnabled
            ? "1px solid rgba(98, 230, 208, 0.18)"
            : "1px solid rgba(121, 230, 255, 0.22)",
          boxShadow: battleSpectatorEnabled
            ? "0 20px 54px rgba(0, 0, 0, 0.38)"
            : "0 20px 54px rgba(0, 7, 16, 0.55)",
        }}
      >
        {!battleSpectatorEnabled && (
          <>
            <Stack direction="row" justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "#7fe7ff", letterSpacing: "0.18em" }}
                >
                  {selectedCraftCopy.overline}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, lineHeight: 1.1 }}
                >
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
              {`${selectedCraftCopy.description} 화면 안을 한 번 클릭한 뒤 조작하면 됩니다.`}
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
                    selectedMode === "jet"
                      ? "#7fe7ff"
                      : "rgba(10, 24, 37, 0.44)",
                  "&:hover": {
                    borderColor: "#7fe7ff",
                    backgroundColor:
                      selectedMode === "jet"
                        ? "#9cefff"
                        : "rgba(20, 48, 68, 0.58)",
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
                    selectedMode === "drone"
                      ? "#7fe7ff"
                      : "rgba(10, 24, 37, 0.44)",
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
          </>
        )}
        {battleSpectatorEnabled && (
          <>
            <Box
              ref={battleSpectatorOverviewSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                mb: 1.1,
                px: 0.2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  전황 도크
                </Typography>
                <Typography
                  sx={{ mt: 0.15, fontWeight: 700, color: "#ecfffb" }}
                >
                  {battleSpectatorCameraProfileOption.label} ·{" "}
                  {battleSpectatorFollowTargetLabel}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.7} sx={{ flexWrap: "wrap" }}>
                {[
                  {
                    id: "overview" as const,
                    label: "전장",
                    ref: battleSpectatorOverviewSectionRef,
                  },
                  {
                    id: "briefing" as const,
                    label: "브리핑",
                    ref: battleSpectatorBriefingSectionRef,
                  },
                  {
                    id: "engagements" as const,
                    label: "추적",
                    ref: battleSpectatorEngagementSectionRef,
                  },
                  {
                    id: "analysis" as const,
                    label: "분석",
                    ref: battleSpectatorAnalysisSectionRef,
                  },
                ].map((tab) => (
                  <Button
                    key={`dock-${tab.id}`}
                    size="small"
                    variant={
                      battleSpectatorDockTab === tab.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => {
                      setBattleSpectatorDockTab(tab.id);
                      window.setTimeout(() => {
                        tab.ref.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 0);
                    }}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorDockTab === tab.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.22)",
                      backgroundColor:
                        battleSpectatorDockTab === tab.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.62)",
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </>
        )}
        {battleSpectatorHasScenarioControls && (
          <Box sx={{ mb: 1.05 }}>
            <ToolbarCollapsible
              title="시나리오 제어"
              subtitle={`${battleSpectatorScenarioName} · ${
                battleSpectatorScenarioPaused ? "정지" : "실행"
              }`}
              headerBadges={[
                {
                  label: battleSpectatorScenarioPaused ? "일시정지" : "실행 중",
                  tone: battleSpectatorScenarioPaused ? "warning" : "accent",
                },
                {
                  label: `${battleSpectatorScenarioTimeCompression}x`,
                  tone: "default",
                },
              ]}
              prependIcon={DocumentScannerOutlinedIcon}
              open={true}
              content={
                <Stack spacing={1}>
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
                      {battleSpectatorScenarioName}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.45,
                        fontSize: 12,
                        color: "rgba(236, 255, 251, 0.68)",
                      }}
                    >
                      실행 상태 {battleSpectatorScenarioPaused ? "정지" : "진행"} ·
                      속도 {battleSpectatorScenarioTimeCompression}x
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 0.75,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorNewScenario}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      새 시나리오
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        battleSpectatorScenarioFileInputRef.current?.click()
                      }
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      파일 불러오기
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorRestartScenario}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      다시 시작
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorStepScenario}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      1단계
                    </Button>
                    <Button
                      size="small"
                      variant={
                        battleSpectatorScenarioPaused ? "contained" : "outlined"
                      }
                      onClick={handleBattleSpectatorTogglePlay}
                      sx={{
                        color: battleSpectatorScenarioPaused
                          ? "#041215"
                          : "#ecfffb",
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        backgroundColor: battleSpectatorScenarioPaused
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.62)",
                      }}
                    >
                      {battleSpectatorScenarioPaused ? "실행" : "일시정지"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleBattleSpectatorToggleTimeCompression}
                      sx={{
                        borderColor: "rgba(98, 230, 208, 0.22)",
                        color: "#ecfffb",
                      }}
                    >
                      속도 {battleSpectatorScenarioTimeCompression}x
                    </Button>
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
                        onClick={() =>
                          setBattleSpectatorPresetListExpanded(
                            (currentValue) => !currentValue
                          )
                        }
                        sx={{
                          minWidth: 0,
                          px: 0,
                          color: "#62e6d0",
                        }}
                      >
                        {battleSpectatorPresetListExpanded
                          ? "간단히 보기"
                          : "전체 보기"}
                      </Button>
                    </Stack>
                    <Stack spacing={0.55} sx={{ mt: 0.8 }}>
                      {visibleBattleSpectatorScenarioPresets.map((preset) => (
                        <MenuItem
                          key={`spectator-preset-${preset.name}`}
                          onClick={() =>
                            loadBattleSpectatorPresetScenario(preset)
                          }
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
          </Box>
        )}
        {showBattleSpectator && displayedBattleSpectator && (
          <Box
            sx={{
              mt: 0.35,
              p: 1.6,
              borderRadius: 2.5,
              background:
                "linear-gradient(180deg, rgba(16, 42, 46, 0.84) 0%, rgba(8, 20, 24, 0.74) 100%)",
              border: "1px solid rgba(98, 230, 208, 0.24)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#62e6d0", letterSpacing: "0.16em" }}
            >
              실시간 전장 상태
            </Typography>
            <Typography sx={{ fontWeight: 800, color: "#ecfffb" }}>
              {displayedBattleSpectator.scenarioName}
            </Typography>
            <Typography
              sx={{
                mt: 0.65,
                fontSize: 12.5,
                color: "rgba(236, 255, 251, 0.76)",
              }}
            >
              유닛 {displayedBattleSpectator.units.length} · 비행 중 탄체{" "}
              {displayedBattleSpectator.stats.weaponsInFlight} · 세력{" "}
              {displayedBattleSpectator.stats.sides}
            </Typography>
            <Box
              sx={{
                mt: 1.05,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 0.8,
              }}
            >
              {[
                ["항공", displayedBattleSpectator.stats.aircraft],
                ["지상시설", displayedBattleSpectator.stats.facilities],
                ["기지", displayedBattleSpectator.stats.airbases],
                ["함정", displayedBattleSpectator.stats.ships],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    p: 0.9,
                    borderRadius: 1.6,
                    backgroundColor: "rgba(8, 24, 29, 0.76)",
                    border: "1px solid rgba(98, 230, 208, 0.12)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.08em",
                      color: "rgba(98, 230, 208, 0.82)",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography sx={{ mt: 0.2, fontWeight: 700 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            {battleSpectatorActivitySummary && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.05,
                  borderRadius: 1.8,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    전투 확인
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.3,
                      borderRadius: 99,
                      fontSize: 10.8,
                      fontWeight: 700,
                      backgroundColor: `${battleSpectatorActivitySummary.statusTone}22`,
                      color: battleSpectatorActivitySummary.statusTone,
                    }}
                  >
                    {battleSpectatorActivitySummary.statusLabel}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 0.75,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.75,
                  }}
                >
                  {[
                    [
                      "실시간 탄체",
                      battleSpectatorActivitySummary.activeWeapons,
                    ],
                    [
                      "최근 발사",
                      battleSpectatorActivitySummary.recentLaunches,
                    ],
                    ["명중/격파", battleSpectatorActivitySummary.recentImpacts],
                    [
                      "이벤트 트레이서",
                      battleSpectatorActivitySummary.eventTracers,
                    ],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        p: 0.8,
                        borderRadius: 1.4,
                        backgroundColor: "rgba(8, 24, 29, 0.76)",
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
                          fontSize: 12.8,
                          fontWeight: 700,
                          color: "#ecfffb",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            <Box
              ref={battleSpectatorBriefingSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            {battleSpectatorBriefing && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.1,
                  borderRadius: 1.8,
                  background:
                    "linear-gradient(180deg, rgba(6, 20, 24, 0.88) 0%, rgba(4, 14, 17, 0.82) 100%)",
                  border: "1px solid rgba(98, 230, 208, 0.12)",
                  boxShadow: "0 18px 40px rgba(2, 10, 12, 0.24)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    작전 브리핑
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: `${battleSpectatorBriefing.stageTone}22`,
                      color: battleSpectatorBriefing.stageTone,
                    }}
                  >
                    {battleSpectatorBriefing.stageLabel}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.65,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#ecfffb",
                  }}
                >
                  {battleSpectatorBriefing.headline}
                </Typography>
                <Box
                  sx={{
                    mt: 0.75,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.75,
                  }}
                >
                  {battleSpectatorBriefing.metrics.map((metric) => (
                    <Box
                      key={metric.label}
                      sx={{
                        p: 0.82,
                        borderRadius: 1.45,
                        backgroundColor: "rgba(8, 24, 29, 0.76)",
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
                        {metric.label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.2,
                          fontSize: 12.8,
                          fontWeight: 700,
                          color: "#ecfffb",
                        }}
                      >
                        {metric.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {battleSpectatorBriefing.actions.length > 0 && (
                  <>
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                        color: "rgba(98, 230, 208, 0.84)",
                      }}
                    >
                      즉시 전환
                    </Typography>
                    <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                      {battleSpectatorBriefing.actions.map((action) => (
                        <Box
                          key={action.id}
                          sx={{
                            px: 1,
                            py: 0.95,
                            borderRadius: 1.6,
                            backgroundColor: "rgba(8, 24, 29, 0.78)",
                            border: "1px solid rgba(98, 230, 208, 0.08)",
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 700, color: "#ecfffb" }}
                          >
                            {action.label}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.35,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.72)",
                            }}
                          >
                            {action.detail}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              focusBattleSpectatorView({
                                point: action.point,
                                followTargetId: action.followTargetId,
                                cameraProfile: action.cameraProfile,
                              })
                            }
                            sx={{
                              mt: 0.7,
                              borderColor: "rgba(98, 230, 208, 0.24)",
                              color: "#ecfffb",
                            }}
                          >
                            {action.label}
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            )}
            {battleSpectatorBriefingLog.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.05,
                  borderRadius: 1.8,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    브리핑 로그
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.3,
                      borderRadius: 99,
                      fontSize: 10.8,
                      fontWeight: 700,
                      backgroundColor: "rgba(98, 230, 208, 0.12)",
                      color: "#62e6d0",
                    }}
                  >
                    최근 판단 {battleSpectatorBriefingLog.length}
                  </Typography>
                </Stack>
                <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                  {battleSpectatorBriefingLog.map((entry) => (
                    <Box
                      key={entry.id}
                      sx={{
                        px: 1,
                        py: 0.95,
                        borderRadius: 1.6,
                        backgroundColor: "rgba(8, 24, 29, 0.78)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(98, 230, 208, 0.82)",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {entry.timestampLabel}
                          </Typography>
                          <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                            {entry.headline}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: `${entry.stageTone}22`,
                            color: entry.stageTone,
                          }}
                        >
                          {entry.stageLabel}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.4,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        {entry.detail}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          focusBattleSpectatorView({
                            point: entry.point,
                            followTargetId: entry.followTargetId,
                            cameraProfile: entry.cameraProfile,
                          })
                        }
                        sx={{
                          mt: 0.7,
                          borderColor: "rgba(98, 230, 208, 0.24)",
                          color: "#ecfffb",
                        }}
                      >
                        로그 재생
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorAlertRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.05,
                  borderRadius: 1.8,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    우선 경보
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.3,
                      borderRadius: 99,
                      fontSize: 10.8,
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 123, 114, 0.12)",
                      color: "#ffb1aa",
                    }}
                  >
                    즉시 확인 {battleSpectatorAlertRows.length}
                  </Typography>
                </Stack>
                <Stack spacing={0.8} sx={{ mt: 0.85 }}>
                  {battleSpectatorAlertRows.map((alert) => (
                    <Box
                      key={alert.id}
                      sx={{
                        px: 1,
                        py: 0.95,
                        borderRadius: 1.6,
                        backgroundColor: "rgba(8, 24, 29, 0.78)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography sx={{ fontWeight: 700, color: "#ecfffb" }}>
                          {alert.label}
                        </Typography>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: `${alert.severityTone}22`,
                            color: alert.severityTone,
                          }}
                        >
                          {alert.severityLabel}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.4,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        {alert.detail}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          focusBattleSpectatorView({
                            point: alert.point,
                            followTargetId: alert.followTargetId,
                            cameraProfile: alert.cameraProfile,
                          })
                        }
                        sx={{
                          mt: 0.7,
                          borderColor: "rgba(98, 230, 208, 0.24)",
                          color: "#ecfffb",
                        }}
                      >
                        {alert.actionLabel}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {currentBattleSpectator &&
              battleSpectatorSideTrendRows.length > 0 && (
                <Box
                  sx={{
                    mt: 1.1,
                    p: 1.05,
                    borderRadius: 1.8,
                    backgroundColor: "rgba(5, 16, 18, 0.72)",
                    border: "1px solid rgba(98, 230, 208, 0.1)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                        color: "rgba(98, 230, 208, 0.84)",
                      }}
                    >
                      세력별 전력 추이
                    </Typography>
                    {battleSpectatorInitiativeSummary && (
                      <Typography
                        sx={{
                          px: 0.85,
                          py: 0.3,
                          borderRadius: 99,
                          fontSize: 10.8,
                          fontWeight: 700,
                          backgroundColor: "rgba(98, 230, 208, 0.12)",
                          color: "#62e6d0",
                        }}
                      >
                        {battleSpectatorInitiativeSummary.label}
                      </Typography>
                    )}
                  </Stack>
                  <Stack spacing={0.85} sx={{ mt: 0.9 }}>
                    {battleSpectatorSideTrendRows.map((row) => {
                      const latestSideJump =
                        resolveBattleSpectatorSideJumpPoint(
                          currentBattleSpectator,
                          row.sideId
                        );

                      return (
                        <Box
                          key={row.sideId}
                          sx={{
                            px: 1,
                            py: 0.95,
                            borderRadius: 1.6,
                            backgroundColor: row.isFiltered
                              ? "rgba(13, 33, 38, 0.92)"
                              : "rgba(8, 24, 29, 0.78)",
                            border: row.isFiltered
                              ? "1px solid rgba(98, 230, 208, 0.24)"
                              : "1px solid rgba(98, 230, 208, 0.08)",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: "rgba(98, 230, 208, 0.82)",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                {row.sideName}
                              </Typography>
                              <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                                전력 점수 {row.powerScore}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                px: 0.85,
                                py: 0.35,
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: `${getBattleSpectatorTrendTone(
                                  row.delta
                                )}22`,
                                color: getBattleSpectatorTrendTone(row.delta),
                              }}
                            >
                              {row.trendLabel} {row.delta >= 0 ? "+" : ""}
                              {row.delta}
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              mt: 0.7,
                              display: "grid",
                              gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                              gap: 0.35,
                              alignItems: "end",
                              height: 34,
                            }}
                          >
                            {buildBattleSpectatorPowerHistoryBars(
                              row.powerHistory
                            ).map((powerBar) => (
                              <Box
                                key={`${row.sideId}-${powerBar.id}`}
                                sx={{
                                  height: `${powerBar.heightPercent}%`,
                                  borderRadius: 999,
                                  backgroundColor: powerBar.active
                                    ? getBattleSpectatorSideCssColor(
                                        row.sideColor || "#62e6d0"
                                      )
                                    : "rgba(98, 230, 208, 0.38)",
                                }}
                              />
                            ))}
                          </Box>
                          <Typography
                            sx={{
                              mt: 0.65,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.72)",
                            }}
                          >
                            유닛 {row.unitCount} · 잔여 무장{" "}
                            {row.totalWeaponCapacity} · 비행 중 탄체{" "}
                            {row.weaponsInFlight} · 평균 체력{" "}
                            {formatBattleSpectatorHp(row.averageHpFraction)}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.3,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.68)",
                            }}
                          >
                            최근 발사 {row.recentLaunches} · 최근 명중/격파{" "}
                            {row.recentImpacts}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ mt: 0.75, flexWrap: "wrap" }}
                          >
                            <Button
                              size="small"
                              variant={
                                row.isFiltered ? "contained" : "outlined"
                              }
                              onClick={() => {
                                setBattleSpectatorSideFilter((currentFilter) =>
                                  currentFilter === row.sideId
                                    ? "all"
                                    : row.sideId
                                );
                                closeBattleSpectatorPanelOnMobile();
                              }}
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: row.isFiltered ? "#041215" : "#ecfffb",
                                backgroundColor: row.isFiltered
                                  ? "#62e6d0"
                                  : "rgba(8, 24, 29, 0.76)",
                              }}
                            >
                              {row.isFiltered
                                ? "전체 보기"
                                : `${row.sideName}만 보기`}
                            </Button>
                            {latestSideJump && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                  focusBattleSpectatorView({
                                    point: latestSideJump.point,
                                    followTargetId:
                                      latestSideJump.followTargetId,
                                    sideFilterId: row.sideId,
                                  })
                                }
                                sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                              >
                                최신 교전 보기
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            <Box
              ref={battleSpectatorEngagementSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            <Box
              sx={{
                mt: 1.2,
                p: 1.1,
                borderRadius: 1.8,
                backgroundColor: "rgba(6, 19, 22, 0.76)",
                border: "1px solid rgba(98, 230, 208, 0.1)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                세력 필터
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                <Button
                  size="small"
                  variant={
                    battleSpectatorSideFilter === "all"
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setBattleSpectatorSideFilter("all")}
                  sx={{
                    minWidth: 0,
                    color:
                      battleSpectatorSideFilter === "all"
                        ? "#041215"
                        : "#ecfffb",
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    backgroundColor:
                      battleSpectatorSideFilter === "all"
                        ? "#62e6d0"
                        : "rgba(8, 24, 29, 0.76)",
                  }}
                >
                  전체
                </Button>
                {battleSpectatorSideOptions.map((side) => (
                  <Button
                    key={side.id}
                    size="small"
                    variant={
                      battleSpectatorSideFilter === side.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setBattleSpectatorSideFilter(side.id)}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorSideFilter === side.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      backgroundColor:
                        battleSpectatorSideFilter === side.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.76)",
                    }}
                  >
                    {side.name}
                  </Button>
                ))}
              </Stack>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                추적 대상
              </Typography>
              <Box
                component="select"
                value={battleSpectatorFollowTargetId}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                  setBattleSpectatorHighlightedPatrolTargetId("");
                  applyBattleSpectatorFollowTargetSelection(
                    event.target.value,
                    visibleBattleSpectator,
                    battleSpectatorCameraProfile,
                    setBattleSpectatorFollowTargetId,
                    setBattleSpectatorCameraProfile
                  );
                }}
                sx={{
                  mt: 0.7,
                  width: "100%",
                  px: 1.1,
                  py: 0.9,
                  borderRadius: 1.5,
                  border: "1px solid rgba(98, 230, 208, 0.22)",
                  backgroundColor: "rgba(7, 19, 24, 0.94)",
                  color: "#ecfffb",
                }}
              >
                <option value="">자유 시점</option>
                {followTargetOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Box>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                시점 프로파일
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                {BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    size="small"
                    variant={
                      battleSpectatorCameraProfile === option.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setBattleSpectatorCameraProfile(option.id)}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorCameraProfile === option.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      backgroundColor:
                        battleSpectatorCameraProfile === option.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.76)",
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(98, 230, 208, 0.84)",
                }}
              >
                LOD
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.8, flexWrap: "wrap" }}
              >
                {BATTLE_SPECTATOR_LOD_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    size="small"
                    variant={
                      battleSpectatorLodLevel === option.id
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setBattleSpectatorLodLevel(option.id)}
                    sx={{
                      minWidth: 0,
                      color:
                        battleSpectatorLodLevel === option.id
                          ? "#041215"
                          : "#ecfffb",
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      backgroundColor:
                        battleSpectatorLodLevel === option.id
                          ? "#62e6d0"
                          : "rgba(8, 24, 29, 0.76)",
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 1.15, flexWrap: "wrap" }}
              >
                <Button
                  size="small"
                  variant="contained"
                  disabled={!selectedBattleSpectatorUnit}
                  onClick={() => {
                    if (!selectedBattleSpectatorUnit) {
                      return;
                    }
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    setBattleSpectatorSideFilter(
                      selectedBattleSpectatorUnit.sideId
                    );
                    applyBattleSpectatorFollowTargetSelection(
                      `unit:${selectedBattleSpectatorUnit.id}`,
                      visibleBattleSpectator,
                      battleSpectatorCameraProfile,
                      setBattleSpectatorFollowTargetId,
                      setBattleSpectatorCameraProfile
                    );
                    closeBattleSpectatorPanelOnMobile();
                  }}
                  sx={{
                    backgroundColor: "#62e6d0",
                    color: "#041215",
                    "&:hover": {
                      backgroundColor: "#84f2df",
                    },
                  }}
                >
                  선택 유닛 추적
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!latestBattleEngagementPoint}
                  onClick={() => {
                    if (!latestBattleEngagementPoint) {
                      return;
                    }
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    focusBattleSpectatorView({
                      point: latestBattleEngagementPoint,
                      followTargetId:
                        latestBattleEngagementPoint.followTargetId,
                    });
                  }}
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                  }}
                >
                  최신 교전으로 점프
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!latestBattleSpectatorWeapon}
                  onClick={() => {
                    if (!latestBattleSpectatorWeapon) {
                      return;
                    }
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    focusBattleSpectatorView({
                      point: resolveBattleSpectatorWeaponJumpPoint(
                        latestBattleSpectatorWeapon
                      ),
                      followTargetId: `weapon:${latestBattleSpectatorWeapon.id}`,
                    });
                  }}
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                  }}
                >
                  활성 탄체 추적
                </Button>
                <Button
                  size="small"
                  variant={
                    battleSpectatorAutoCapture ? "contained" : "outlined"
                  }
                  onClick={() =>
                    setBattleSpectatorAutoCapture((currentValue) => {
                      const nextValue = !currentValue;
                      if (nextValue) {
                        setBattleSpectatorAutoPatrol(false);
                      }
                      return nextValue;
                    })
                  }
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: battleSpectatorAutoCapture ? "#041215" : "#ecfffb",
                    backgroundColor: battleSpectatorAutoCapture
                      ? "#62e6d0"
                      : "rgba(8, 24, 29, 0.76)",
                    "&:hover": {
                      backgroundColor: battleSpectatorAutoCapture
                        ? "#84f2df"
                        : "rgba(11, 31, 37, 0.9)",
                    },
                  }}
                >
                  자동 포착
                </Button>
                <Button
                  size="small"
                  variant={battleSpectatorAutoPatrol ? "contained" : "outlined"}
                  disabled={battleSpectatorPatrolTargets.length === 0}
                  onClick={() =>
                    setBattleSpectatorAutoPatrol((currentValue) => {
                      const nextValue = !currentValue;
                      if (nextValue) {
                        setBattleSpectatorAutoCapture(false);
                      }
                      return nextValue;
                    })
                  }
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: battleSpectatorAutoPatrol ? "#041215" : "#ecfffb",
                    backgroundColor: battleSpectatorAutoPatrol
                      ? "#62e6d0"
                      : "rgba(8, 24, 29, 0.76)",
                    "&:hover": {
                      backgroundColor: battleSpectatorAutoPatrol
                        ? "#84f2df"
                        : "rgba(11, 31, 37, 0.9)",
                    },
                  }}
                >
                  자동 순회
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={battleSpectatorPatrolTargets.length === 0}
                  onClick={() => {
                    if (battleSpectatorAutoPatrol) {
                      setBattleSpectatorAutoPatrol(false);
                    }
                    stepBattleSpectatorPatrol();
                  }}
                  sx={{
                    borderColor: "rgba(98, 230, 208, 0.24)",
                    color: "#ecfffb",
                  }}
                >
                  다음 순회
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setBattleSpectatorFollowTargetId("");
                    setBattleSpectatorHighlightedPatrolTargetId("");
                    closeBattleSpectatorPanelOnMobile();
                  }}
                  disabled={!battleSpectatorFollowTargetId}
                  sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                >
                  자유 시점
                </Button>
              </Stack>
              {battleSpectatorPatrolTargets.length > 0 && (
                <Box
                  sx={{
                    mt: 1.15,
                    p: 1.1,
                    borderRadius: 1.8,
                    backgroundColor: "rgba(6, 19, 22, 0.76)",
                    border: "1px solid rgba(98, 230, 208, 0.1)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ gap: 1, flexWrap: "wrap" }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        letterSpacing: "0.14em",
                        color: "rgba(98, 230, 208, 0.84)",
                      }}
                    >
                      관전 큐
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "rgba(236, 255, 251, 0.66)",
                      }}
                    >
                      자동 순회용 시점 {battleSpectatorPatrolTargets.length}개
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                      mt: 0.9,
                      flexWrap: "wrap",
                      rowGap: 0.75,
                    }}
                  >
                    {battleSpectatorPatrolTargets.map((target, index) => {
                      const active =
                        battleSpectatorHighlightedPatrolTargetId === target.id;
                      const tone = getBattleSpectatorPatrolTargetTone(
                        target.kind
                      );

                      return (
                        <Button
                          key={target.id}
                          size="small"
                          variant={active ? "contained" : "outlined"}
                          onClick={() => {
                            battleSpectatorPatrolIndexRef.current = index;
                            focusBattleSpectatorPatrolTarget(target, {
                              preservePanel: true,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            color: active ? "#041215" : tone,
                            borderColor: `${tone}55`,
                            backgroundColor: active
                              ? tone
                              : "rgba(8, 24, 29, 0.76)",
                            "&:hover": {
                              backgroundColor: active ? tone : `${tone}18`,
                              borderColor: tone,
                            },
                          }}
                        >
                          {target.label}
                        </Button>
                      );
                    })}
                  </Stack>
                  <Typography
                    sx={{
                      mt: 0.85,
                      fontSize: 11.5,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorHighlightedPatrolTarget
                      ? `${battleSpectatorHighlightedPatrolTarget.label} · ${battleSpectatorHighlightedPatrolTarget.detail}`
                      : "드론, 전차, 포대, 타격 지점 같은 핵심 장면을 한 바퀴씩 빠르게 순환합니다."}
                  </Typography>
                </Box>
              )}
              <Typography
                sx={{
                  mt: 0.9,
                  fontSize: 12,
                  color: "rgba(236, 255, 251, 0.68)",
                }}
              >
                표시 유닛 {visibleBattleSpectator?.units.length ?? 0} · 표시
                탄체 {visibleBattleSpectator?.weapons.length ?? 0} · 자동 포착{" "}
                {battleSpectatorAutoCapture ? "ON" : "OFF"} · 자동 순회{" "}
                {battleSpectatorAutoPatrol ? "ON" : "OFF"} · 타격 필터{" "}
                {battleSpectatorPriorityFilterOption.label}
              </Typography>
            </Box>
            {(battleSpectatorTrajectoryRows.length > 0 ||
              battleSpectatorImpactTimelineRows.length > 0 ||
              battleSpectatorAssetRiskRows.length > 0) && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.1,
                  borderRadius: 1.8,
                  backgroundColor: "rgba(6, 19, 22, 0.76)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  타격 우선 필터
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ mt: 0.8, flexWrap: "wrap" }}
                >
                  {BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      size="small"
                      variant={
                        battleSpectatorPriorityFilter === option.id
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() =>
                        setBattleSpectatorPriorityFilter(option.id)
                      }
                      sx={{
                        minWidth: 0,
                        color:
                          battleSpectatorPriorityFilter === option.id
                            ? "#041215"
                            : "#ecfffb",
                        borderColor: "rgba(98, 230, 208, 0.24)",
                        backgroundColor:
                          battleSpectatorPriorityFilter === option.id
                            ? "#62e6d0"
                            : "rgba(8, 24, 29, 0.76)",
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorTrajectoryRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    탄체 궤적 관제
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "rgba(98, 230, 208, 0.12)",
                      color: "#62e6d0",
                    }}
                  >
                    유도 궤적 {filteredBattleSpectatorTrajectoryRows.length}
                    {battleSpectatorPriorityFilter !== "all"
                      ? ` / ${battleSpectatorTrajectoryRows.length}`
                      : ""}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.8)",
                  }}
                >
                  표시 {filteredBattleSpectatorTrajectoryRows.length} · 종말
                  단계{" "}
                  {
                    filteredBattleSpectatorTrajectoryRows.filter(
                      (row) => row.phaseLabel === "종말"
                    ).length
                  }{" "}
                  · 60초 이내{" "}
                  {
                    filteredBattleSpectatorTrajectoryRows.filter(
                      (row) =>
                        typeof row.timeToImpactSec === "number" &&
                        row.timeToImpactSec <= 60
                    ).length
                  }{" "}
                  · 중간 단계{" "}
                  {
                    filteredBattleSpectatorTrajectoryRows.filter(
                      (row) => row.phaseLabel === "중간"
                    ).length
                  }{" "}
                  · 최신 탄체{" "}
                  {latestBattleSpectatorWeapon
                    ? latestBattleSpectatorWeapon.name
                    : "없음"}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ mt: 0.85, flexWrap: "wrap" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!battleSpectatorOverviewPoint}
                    onClick={() => {
                      if (!battleSpectatorOverviewPoint) {
                        return;
                      }
                      focusBattleSpectatorView({
                        point: battleSpectatorOverviewPoint,
                        followTargetId: "",
                      });
                    }}
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      color: "#ecfffb",
                    }}
                  >
                    전장 개관
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    disabled={!latestBattleSpectatorWeapon}
                    onClick={() => {
                      if (!latestBattleSpectatorWeapon) {
                        return;
                      }
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorWeaponJumpPoint(
                          latestBattleSpectatorWeapon
                        ),
                        followTargetId: `weapon:${latestBattleSpectatorWeapon.id}`,
                      });
                    }}
                    sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                  >
                    최신 궤적 고정
                  </Button>
                </Stack>
                {filteredBattleSpectatorTrajectoryRows.length > 0 ? (
                  <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                    {filteredBattleSpectatorTrajectoryRows.map((row, index) => (
                      <Box
                        key={row.weapon.id}
                        sx={{
                          px: 1,
                          py: 0.95,
                          borderRadius: 1.6,
                          backgroundColor: "rgba(8, 24, 29, 0.78)",
                          border: "1px solid rgba(98, 230, 208, 0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: "rgba(98, 230, 208, 0.82)",
                                letterSpacing: "0.08em",
                              }}
                            >
                              #{index + 1} · {row.weapon.sideName}
                            </Typography>
                            <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                              {row.weapon.name}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              px: 0.85,
                              py: 0.35,
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor: "rgba(98, 230, 208, 0.12)",
                              color: "#62e6d0",
                            }}
                          >
                            {row.phaseLabel}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            mt: 0.55,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.72)",
                          }}
                        >
                          발사 {row.launcherName} →{" "}
                          {row.targetName ?? row.targetTypeLabel} · 남은 거리{" "}
                          {formatBattleSpectatorDistanceKm(
                            row.remainingDistanceKm
                          )}
                          {typeof row.progressPercent === "number"
                            ? ` · 진행 ${Math.round(row.progressPercent)}%`
                            : ""}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.68)",
                          }}
                        >
                          현재 고도 {Math.round(row.weapon.altitudeMeters)}m ·
                          속도 {Math.round(row.weapon.speedKts)}kt · 총 비행
                          거리{" "}
                          {formatBattleSpectatorDistanceKm(row.totalDistanceKm)}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.68)",
                          }}
                        >
                          도달 예상{" "}
                          {formatBattleSpectatorEta(row.timeToImpactSec)} · 위험
                          반경{" "}
                          {formatBattleSpectatorThreatRadius(
                            row.threatRadiusMeters
                          )}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              focusBattleSpectatorView({
                                point: resolveBattleSpectatorWeaponJumpPoint(
                                  row.weapon
                                ),
                                followTargetId: `weapon:${row.weapon.id}`,
                              })
                            }
                            sx={{
                              borderColor: "rgba(98, 230, 208, 0.24)",
                              color: "#ecfffb",
                            }}
                          >
                            궤적 추적
                          </Button>
                          {row.targetPoint && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                const targetPoint = row.targetPoint;
                                if (!targetPoint) {
                                  return;
                                }
                                focusBattleSpectatorView({
                                  point: {
                                    longitude: targetPoint.longitude,
                                    latitude: targetPoint.latitude,
                                    altitudeMeters: Math.max(
                                      1800,
                                      targetPoint.altitudeMeters + 1800
                                    ),
                                  },
                                  followTargetId:
                                    typeof row.weapon.targetId === "string"
                                      ? `unit:${row.weapon.targetId}`
                                      : undefined,
                                });
                              }}
                              sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                            >
                              예상 착탄점
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    sx={{
                      mt: 0.9,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorPriorityFilterOption.label} 조건에 맞는 유도
                    궤적이 없습니다.
                  </Typography>
                )}
              </Box>
            )}
            {battleSpectatorImpactTimelineRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    착탄 타임라인
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 209, 102, 0.12)",
                      color: "#ffd166",
                    }}
                  >
                    ETA 추적 {filteredBattleSpectatorImpactTimelineRows.length}
                    {battleSpectatorPriorityFilter !== "all"
                      ? ` / ${battleSpectatorImpactTimelineRows.length}`
                      : ""}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.8)",
                  }}
                >
                  표시 {filteredBattleSpectatorImpactTimelineRows.length} · 30초
                  이내{" "}
                  {
                    filteredBattleSpectatorImpactTimelineRows.filter(
                      (row) => row.etaSec <= 30
                    ).length
                  }{" "}
                  · 60초 이내{" "}
                  {
                    filteredBattleSpectatorImpactTimelineRows.filter(
                      (row) => row.etaSec <= 60
                    ).length
                  }{" "}
                  · 3분 이내{" "}
                  {
                    filteredBattleSpectatorImpactTimelineRows.filter(
                      (row) => row.etaSec <= 180
                    ).length
                  }
                </Typography>
                {filteredBattleSpectatorImpactTimelineRows.length > 0 ? (
                  <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                    {filteredBattleSpectatorImpactTimelineRows.map(
                      (row, index) => (
                        <Box
                          key={row.id}
                          sx={{
                            px: 1,
                            py: 0.95,
                            borderRadius: 1.6,
                            backgroundColor: "rgba(8, 24, 29, 0.78)",
                            border: "1px solid rgba(98, 230, 208, 0.08)",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: "rgba(98, 230, 208, 0.82)",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                #{index + 1} · {row.weapon.sideName}
                              </Typography>
                              <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                                {row.targetName}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                px: 0.85,
                                py: 0.35,
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: `${row.urgencyTone}22`,
                                color: row.urgencyTone,
                              }}
                            >
                              {row.urgencyLabel}
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              mt: 0.55,
                              fontSize: 12,
                              color: "rgba(236, 255, 251, 0.72)",
                            }}
                          >
                            {row.weapon.name} · ETA{" "}
                            {formatBattleSpectatorEta(row.etaSec)} · 위험 반경{" "}
                            {formatBattleSpectatorThreatRadius(
                              row.threatRadiusMeters
                            )}
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.7,
                              height: 7,
                              borderRadius: 999,
                              overflow: "hidden",
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${row.progressPercent}%`,
                                height: "100%",
                                borderRadius: 999,
                                background: `linear-gradient(90deg, ${row.urgencyTone} 0%, rgba(98, 230, 208, 0.92) 100%)`,
                              }}
                            />
                          </Box>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ mt: 0.75, flexWrap: "wrap" }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point: resolveBattleSpectatorWeaponJumpPoint(
                                    row.weapon
                                  ),
                                  followTargetId: `weapon:${row.weapon.id}`,
                                  cameraProfile: "side",
                                })
                              }
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: "#ecfffb",
                              }}
                            >
                              탄체 추적
                            </Button>
                            {row.targetPoint && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  const targetPoint = row.targetPoint;
                                  if (!targetPoint) {
                                    return;
                                  }
                                  focusBattleSpectatorView({
                                    point: {
                                      longitude: targetPoint.longitude,
                                      latitude: targetPoint.latitude,
                                      altitudeMeters: Math.max(
                                        1800,
                                        targetPoint.altitudeMeters + 1800
                                      ),
                                    },
                                    followTargetId:
                                      typeof row.weapon.targetId === "string"
                                        ? `unit:${row.weapon.targetId}`
                                        : undefined,
                                    cameraProfile: "side",
                                  });
                                }}
                                sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                              >
                                착탄점 보기
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      )
                    )}
                  </Stack>
                ) : (
                  <Typography
                    sx={{
                      mt: 0.9,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorPriorityFilterOption.label} 조건에 맞는 착탄
                    타임라인이 없습니다.
                  </Typography>
                )}
              </Box>
            )}
            {battleSpectatorAssetRiskRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      color: "rgba(98, 230, 208, 0.84)",
                    }}
                  >
                    피격 위험 자산
                  </Typography>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "rgba(255, 123, 114, 0.12)",
                      color: "#ffb1aa",
                    }}
                  >
                    자산 위협 {filteredBattleSpectatorAssetRiskRows.length}
                    {battleSpectatorPriorityFilter !== "all"
                      ? ` / ${battleSpectatorAssetRiskRows.length}`
                      : ""}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.55,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.8)",
                  }}
                >
                  표시 {filteredBattleSpectatorAssetRiskRows.length} · 60초 이내{" "}
                  {
                    filteredBattleSpectatorAssetRiskRows.filter(
                      (row) => row.earliestEtaSec <= 60
                    ).length
                  }{" "}
                  · 다중 위협{" "}
                  {
                    filteredBattleSpectatorAssetRiskRows.filter(
                      (row) => row.incomingCount >= 2
                    ).length
                  }
                </Typography>
                {filteredBattleSpectatorAssetRiskRows.length > 0 ? (
                  <Stack spacing={0.8} sx={{ mt: 0.9 }}>
                    {filteredBattleSpectatorAssetRiskRows.map((row, index) => (
                      <Box
                        key={row.id}
                        sx={{
                          px: 1,
                          py: 0.95,
                          borderRadius: 1.6,
                          backgroundColor: "rgba(8, 24, 29, 0.78)",
                          border: "1px solid rgba(98, 230, 208, 0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: "rgba(98, 230, 208, 0.82)",
                                letterSpacing: "0.08em",
                              }}
                            >
                              #{index + 1} · {row.unit.sideName}
                            </Typography>
                            <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                              {row.unit.name}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              px: 0.85,
                              py: 0.35,
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor:
                                row.earliestEtaSec <= 30
                                  ? "rgba(255, 123, 114, 0.14)"
                                  : "rgba(255, 209, 102, 0.14)",
                              color:
                                row.earliestEtaSec <= 30
                                  ? "#ffb1aa"
                                  : "#ffd166",
                            }}
                          >
                            ETA {formatBattleSpectatorEta(row.earliestEtaSec)}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            mt: 0.55,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.72)",
                          }}
                        >
                          접근 탄체 {row.incomingCount} · 대표 위협{" "}
                          {row.highlightedWeapon.name}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12,
                            color: "rgba(236, 255, 251, 0.68)",
                          }}
                        >
                          체력 {formatBattleSpectatorHp(row.unit.hpFraction)} ·
                          위험 반경{" "}
                          {formatBattleSpectatorThreatRadius(
                            row.maxThreatRadiusMeters
                          )}
                          {typeof row.unit.fuelFraction === "number"
                            ? ` · 연료 ${formatBattleSpectatorFuelFraction(
                                row.unit.fuelFraction
                              )}`
                            : ""}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              focusBattleSpectatorView({
                                point: resolveBattleSpectatorUnitJumpPoint(
                                  row.unit
                                ),
                                followTargetId: `unit:${row.unit.id}`,
                                cameraProfile:
                                  resolveBattleSpectatorUnitCameraProfile(
                                    row.unit
                                  ),
                              })
                            }
                            sx={{
                              borderColor: "rgba(98, 230, 208, 0.24)",
                              color: "#ecfffb",
                            }}
                          >
                            자산 추적
                          </Button>
                          {row.targetPoint && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                const targetPoint = row.targetPoint;
                                if (!targetPoint) {
                                  return;
                                }
                                focusBattleSpectatorView({
                                  point: {
                                    longitude: targetPoint.longitude,
                                    latitude: targetPoint.latitude,
                                    altitudeMeters: Math.max(
                                      1800,
                                      targetPoint.altitudeMeters + 1800
                                    ),
                                  },
                                  followTargetId: `unit:${row.unit.id}`,
                                  cameraProfile: "side",
                                });
                              }}
                              sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                            >
                              방어 지점
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    sx={{
                      mt: 0.9,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    {battleSpectatorPriorityFilterOption.label} 조건에 맞는 피격
                    자산이 없습니다.
                  </Typography>
                )}
              </Box>
            )}
            <Box
              ref={battleSpectatorAnalysisSectionRef}
              sx={{ scrollMarginTop: 18 }}
            />
            {selectedBattleSpectatorUnit && selectedBattleSpectatorInsight && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  선택 유닛 분석
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 0.45 }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#ecfffb" }}>
                      {selectedBattleSpectatorUnit.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 12,
                        color: "rgba(236, 255, 251, 0.72)",
                      }}
                    >
                      {selectedBattleSpectatorUnit.sideName} ·{" "}
                      {formatBattleSpectatorEntityType(
                        selectedBattleSpectatorUnit.entityType
                      )}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      px: 0.85,
                      py: 0.35,
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "rgba(98, 230, 208, 0.12)",
                      color: "#62e6d0",
                    }}
                  >
                    체력{" "}
                    {formatBattleSpectatorHp(
                      selectedBattleSpectatorUnit.hpFraction
                    )}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 0.85,
                    height: 8,
                    borderRadius: 999,
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <Box
                    sx={{
                      width: `${Math.max(
                        6,
                        Math.round(selectedBattleSpectatorUnit.hpFraction * 100)
                      )}%`,
                      height: "100%",
                      backgroundColor: getBattleSpectatorHpTone(
                        selectedBattleSpectatorUnit.hpFraction
                      ),
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    mt: 0.95,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0.8,
                  }}
                >
                  {[
                    [
                      "속도",
                      `${Math.round(selectedBattleSpectatorUnit.speedKts)} kt`,
                    ],
                    [
                      "방위",
                      formatBattleSpectatorHeading(
                        selectedBattleSpectatorUnit.headingDeg
                      ),
                    ],
                    ["잔여 무장", `${selectedBattleSpectatorUnit.weaponCount}`],
                    [
                      "표적",
                      selectedBattleSpectatorInsight.targetName ?? "미지정",
                    ],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        p: 0.85,
                        borderRadius: 1.5,
                        backgroundColor: "rgba(8, 24, 29, 0.76)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10.5,
                          letterSpacing: "0.08em",
                          color: "rgba(98, 230, 208, 0.76)",
                        }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 12.6,
                          fontWeight: 700,
                          color: "#ecfffb",
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography
                  sx={{
                    mt: 0.9,
                    fontSize: 12.2,
                    color: "rgba(236, 255, 251, 0.72)",
                  }}
                >
                  유닛이 띄운 탄체{" "}
                  {selectedBattleSpectatorInsight.outgoingWeapons} · 유닛을
                  향하는 탄체 {selectedBattleSpectatorInsight.incomingWeapons}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 12,
                    color: "rgba(236, 255, 251, 0.68)",
                  }}
                >
                  탐지{" "}
                  {formatBattleSpectatorRangeNm(
                    selectedBattleSpectatorUnit.detectionRangeNm
                  )}{" "}
                  · 교전{" "}
                  {formatBattleSpectatorRangeNm(
                    selectedBattleSpectatorUnit.engagementRangeNm
                  )}{" "}
                  · 연료{" "}
                  {formatBattleSpectatorFuelFraction(
                    selectedBattleSpectatorUnit.fuelFraction
                  )}
                </Typography>
                {selectedBattleSpectatorUnit.statusFlags.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={0.55}
                    sx={{ mt: 0.8, flexWrap: "wrap" }}
                  >
                    {selectedBattleSpectatorUnit.statusFlags.map(
                      (statusFlag) => (
                        <Typography
                          key={statusFlag}
                          sx={{
                            px: 0.7,
                            py: 0.25,
                            borderRadius: 99,
                            fontSize: 10.6,
                            backgroundColor: "rgba(98, 230, 208, 0.08)",
                            color: "rgba(236, 255, 251, 0.76)",
                          }}
                        >
                          {statusFlag}
                        </Typography>
                      )
                    )}
                  </Stack>
                )}
                {selectedBattleSpectatorUnit.weaponInventory.length > 0 && (
                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 11.8,
                      color: "rgba(236, 255, 251, 0.68)",
                    }}
                  >
                    무장 구성:{" "}
                    {selectedBattleSpectatorUnit.weaponInventory
                      .slice(0, 3)
                      .map(
                        (inventory) => `${inventory.name} ${inventory.quantity}`
                      )
                      .join(" · ")}
                    {selectedBattleSpectatorUnit.weaponInventory.length > 3
                      ? " · ..."
                      : ""}
                  </Typography>
                )}
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ mt: 0.9, flexWrap: "wrap" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorUnitJumpPoint(
                          selectedBattleSpectatorUnit
                        ),
                        followTargetId: undefined,
                      })
                    }
                    sx={{
                      borderColor: "rgba(98, 230, 208, 0.24)",
                      color: "#ecfffb",
                    }}
                  >
                    선택 유닛 지점 보기
                  </Button>
                </Stack>
              </Box>
            )}
            {battleSpectatorThreatRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  위협 상위 유닛
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                  {battleSpectatorThreatRows.map((row, index) => (
                    <Box
                      key={row.unit.id}
                      sx={{
                        px: 1,
                        py: 0.9,
                        borderRadius: 1.6,
                        backgroundColor: "rgba(8, 24, 29, 0.78)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(98, 230, 208, 0.82)",
                              letterSpacing: "0.08em",
                            }}
                          >
                            #{index + 1} · {row.unit.sideName}
                          </Typography>
                          <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                            {row.unit.name}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: "rgba(98, 230, 208, 0.12)",
                            color: "#62e6d0",
                          }}
                        >
                          위협 {row.score}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.55,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        {formatBattleSpectatorEntityType(row.unit.entityType)} ·
                        속도 {Math.round(row.unit.speedKts)}kt · 잔여 무장{" "}
                        {row.unit.weaponCount} · 활동 {row.recentActivity}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.68)",
                        }}
                      >
                        비행 중 탄체 {row.outgoingWeapons} · 현재 표적{" "}
                        {row.targetName ?? "미지정"}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                row.unit
                              ),
                              followTargetId: `unit:${row.unit.id}`,
                              sideFilterId: row.unit.sideId,
                            })
                          }
                          sx={{
                            borderColor: "rgba(98, 230, 208, 0.24)",
                            color: "#ecfffb",
                          }}
                        >
                          추적 {row.unit.name}
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorHotspotRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  교전 밀집구역
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                  {battleSpectatorHotspotRows.map((hotspot, index) => (
                    <Box
                      key={hotspot.id}
                      sx={{
                        px: 1,
                        py: 0.9,
                        borderRadius: 1.6,
                        backgroundColor: "rgba(8, 24, 29, 0.78)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(98, 230, 208, 0.82)",
                              letterSpacing: "0.08em",
                            }}
                          >
                            #{index + 1} · {hotspot.dominantSideName}
                          </Typography>
                          <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                            {hotspot.label}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: `${getBattleSpectatorSideCssColor(
                              hotspot.dominantSideColor
                            )}22`,
                            color: getBattleSpectatorSideCssColor(
                              hotspot.dominantSideColor
                            ),
                          }}
                        >
                          강도 {hotspot.score}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.55,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        비행 중 탄체 {hotspot.activeWeapons} · 발사{" "}
                        {hotspot.launchCount} · 명중/격파 {hotspot.impactCount}{" "}
                        · 이벤트 {hotspot.eventCount}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.68)",
                        }}
                      >
                        최근 확인{" "}
                        {formatBattleSpectatorTimestamp(
                          hotspot.latestTimestamp
                        )}
                        {hotspot.latestMessage
                          ? ` · ${hotspot.latestMessage}`
                          : ""}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ mt: 0.75, flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            focusBattleSpectatorView({
                              point: {
                                longitude: hotspot.longitude,
                                latitude: hotspot.latitude,
                                altitudeMeters: hotspot.altitudeMeters,
                              },
                              followTargetId: undefined,
                            })
                          }
                          sx={{
                            borderColor: "rgba(98, 230, 208, 0.24)",
                            color: "#ecfffb",
                          }}
                        >
                          핫스팟 점프
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {battleSpectatorTempoRows.length > 0 && (
              <Box
                sx={{
                  mt: 1.1,
                  p: 1.15,
                  borderRadius: 1.9,
                  backgroundColor: "rgba(5, 16, 18, 0.72)",
                  border: "1px solid rgba(98, 230, 208, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    color: "rgba(98, 230, 208, 0.84)",
                  }}
                >
                  유닛별 교전 템포
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 0.8 }}>
                  {battleSpectatorTempoRows.map((row, index) => (
                    <Box
                      key={row.unit.id}
                      sx={{
                        px: 1,
                        py: 0.9,
                        borderRadius: 1.6,
                        backgroundColor: "rgba(8, 24, 29, 0.78)",
                        border: "1px solid rgba(98, 230, 208, 0.08)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(98, 230, 208, 0.82)",
                              letterSpacing: "0.08em",
                            }}
                          >
                            #{index + 1} · {row.unit.sideName}
                          </Typography>
                          <Typography sx={{ mt: 0.15, fontWeight: 700 }}>
                            {row.unit.name}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            px: 0.85,
                            py: 0.35,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: "rgba(98, 230, 208, 0.12)",
                            color: "#62e6d0",
                          }}
                        >
                          템포 {row.tempoScore}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          mt: 0.55,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        현재 발사 중 {row.outgoingWeapons} · 피격 위험{" "}
                        {row.incomingWeapons} · 최근 발사 {row.recentLaunches} ·
                        최근 피격 {row.recentImpacts}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.35,
                          fontSize: 12,
                          color: "rgba(236, 255, 251, 0.68)",
                        }}
                      >
                        현재 표적 {row.targetName ?? "미지정"} · 잔여 무장{" "}
                        {row.unit.weaponCount}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ mt: 0.75, flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                row.unit
                              ),
                              followTargetId: `unit:${row.unit.id}`,
                              sideFilterId: row.unit.sideId,
                            })
                          }
                          sx={{
                            borderColor: "rgba(98, 230, 208, 0.24)",
                            color: "#ecfffb",
                          }}
                        >
                          템포 추적
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {(visibleBattleSpectator?.recentEvents.length ?? 0) > 0 && (
              <Stack spacing={0.65} sx={{ mt: 1.15 }}>
                {(visibleBattleSpectator?.recentEvents ?? [])
                  .slice(-4)
                  .reverse()
                  .map((event) => {
                    const eventJumpPoint =
                      resolveBattleSpectatorEventJumpPoint(event);
                    const eventWeapon =
                      typeof event.weaponId === "string"
                        ? (visibleBattleSpectator?.weapons ?? []).find(
                            (weapon) => weapon.id === event.weaponId
                          )
                        : undefined;
                    const eventUnit =
                      typeof event.targetId === "string"
                        ? (visibleBattleSpectator?.units ?? []).find(
                            (unit) => unit.id === event.targetId
                          )
                        : typeof event.actorId === "string"
                          ? (visibleBattleSpectator?.units ?? []).find(
                              (unit) => unit.id === event.actorId
                            )
                          : undefined;

                    return (
                      <Box
                        key={event.id}
                        sx={{
                          px: 1,
                          py: 0.9,
                          borderRadius: 1.6,
                          backgroundColor: "rgba(5, 16, 18, 0.72)",
                          border: "1px solid rgba(98, 230, 208, 0.08)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(98, 230, 208, 0.88)",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {event.sideName}
                          </Typography>
                          <Stack direction="row" spacing={0.65}>
                            <Typography
                              sx={{
                                px: 0.7,
                                py: 0.25,
                                borderRadius: 99,
                                fontSize: 10.5,
                                backgroundColor: "rgba(98, 230, 208, 0.08)",
                                color: "rgba(236, 255, 251, 0.72)",
                              }}
                            >
                              {formatBattleSpectatorTimestamp(event.timestamp)}
                            </Typography>
                            {event.resultTag && (
                              <Typography
                                sx={{
                                  px: 0.7,
                                  py: 0.25,
                                  borderRadius: 99,
                                  fontSize: 10.5,
                                  backgroundColor: "rgba(255, 209, 102, 0.12)",
                                  color: "#ffd166",
                                }}
                              >
                                {event.resultTag}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 12.4,
                            color: "rgba(236, 255, 251, 0.84)",
                          }}
                        >
                          {event.message}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          {eventWeapon && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point:
                                    resolveBattleSpectatorWeaponJumpPoint(
                                      eventWeapon
                                    ),
                                  followTargetId: `weapon:${eventWeapon.id}`,
                                })
                              }
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: "#ecfffb",
                              }}
                            >
                              관련 탄체 추적
                            </Button>
                          )}
                          {!eventWeapon && eventUnit && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point:
                                    resolveBattleSpectatorUnitJumpPoint(
                                      eventUnit
                                    ),
                                  followTargetId: `unit:${eventUnit.id}`,
                                  sideFilterId: eventUnit.sideId,
                                })
                              }
                              sx={{
                                borderColor: "rgba(98, 230, 208, 0.24)",
                                color: "#ecfffb",
                              }}
                            >
                              관련 유닛 추적
                            </Button>
                          )}
                          {eventJumpPoint && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() =>
                                focusBattleSpectatorView({
                                  point: eventJumpPoint,
                                  followTargetId: undefined,
                                })
                              }
                              sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                            >
                              교전 지점 보기
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
              </Stack>
            )}
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
        <Box
          sx={{
            mt: 1.2,
            p: 1.15,
            borderRadius: 1.9,
            background:
              "linear-gradient(180deg, rgba(7, 19, 24, 0.84) 0%, rgba(4, 12, 18, 0.78) 100%)",
            border: "1px solid rgba(121, 230, 255, 0.14)",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: "rgba(127, 231, 255, 0.84)",
                }}
              >
                지도 런타임
              </Typography>
              <Typography sx={{ mt: 0.2, fontWeight: 800 }}>
                {runtimeProviderLabel}
              </Typography>
            </Box>
            <Typography
              sx={{
                px: 0.9,
                py: 0.35,
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: `${runtimeProviderTone}22`,
                color: runtimeProviderTone,
              }}
            >
              {formatViewerStatus(runtimeInfo)}
            </Typography>
          </Stack>
          <Box
            sx={{
              mt: 0.9,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 0.75,
            }}
          >
            <Box
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
                스크립트
              </Typography>
              <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                {formatScriptStatus(runtimeInfo)}
              </Typography>
            </Box>
            <Box
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
                VWorld 대상
              </Typography>
              <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                {runtimeInfo?.vworld?.eligible === true
                  ? "예"
                  : runtimeInfo?.vworld?.eligible === false
                    ? "아니오"
                    : "-"}
              </Typography>
            </Box>
            {battleSpectatorEnabled && (
              <>
                <Box
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
                    카메라
                  </Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                    {battleSpectatorCameraProfileOption.label}
                  </Typography>
                </Box>
                <Box
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
                    관전 품질
                  </Typography>
                  <Typography sx={{ mt: 0.2, fontSize: 12.4, fontWeight: 700 }}>
                    {
                      BATTLE_SPECTATOR_LOD_OPTIONS.find(
                        (option) => option.id === battleSpectatorLodLevel
                      )?.label
                    }
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          {battleSpectatorEnabled && (
            <Typography
              sx={{
                mt: 0.8,
                fontSize: 12.2,
                color: "rgba(236, 255, 251, 0.78)",
              }}
            >
              현재 추적: {battleSpectatorFollowTargetLabel}
            </Typography>
          )}
          {runtimeInfo?.vworld?.lastError && (
            <Typography
              sx={{
                mt: 0.7,
                fontSize: 12.2,
                color: "rgba(255, 194, 96, 0.94)",
              }}
            >
              상태: {runtimeInfo.vworld.lastError}
            </Typography>
          )}
          <Box
            component="details"
            sx={{
              mt: 0.85,
              "& > summary": {
                cursor: "pointer",
                listStyle: "none",
                fontSize: 12.2,
                color: "rgba(238, 247, 251, 0.68)",
              },
              "& > summary::-webkit-details-marker": {
                display: "none",
              },
            }}
          >
            <Box component="summary">런타임 상세</Box>
            <Stack spacing={0.35} sx={{ mt: 0.7, fontSize: 12.5 }}>
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
                스크립트 URL: {runtimeInfo?.vworld?.loadedScriptUrl ?? "-"}
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
            </Stack>
          </Box>
        </Box>

        {battleSpectatorEnabled ? (
          <Box
            component="details"
            sx={{
              mt: 1.2,
              "& > summary": {
                cursor: "pointer",
                listStyle: "none",
                fontSize: 12.2,
                color: "rgba(236, 255, 251, 0.72)",
              },
              "& > summary::-webkit-details-marker": {
                display: "none",
              },
            }}
          >
            <Box component="summary">조작법</Box>
            <Stack spacing={0.7} sx={{ mt: 0.8, fontSize: 13 }}>
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
        ) : (
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
        )}
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          left: 0,
          zIndex: 1,
          backgroundColor: "#02060c",
          transition: "left 180ms ease",
        }}
      >
        <Stack
          spacing={0.75}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            alignItems: "flex-end",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              px: 1.1,
              py: 0.85,
              borderRadius: 999,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(4, 12, 18, 0.68)",
              border: `1px solid ${runtimeProviderTone}44`,
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.22)",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.2,
                letterSpacing: "0.1em",
                color: runtimeProviderTone,
              }}
            >
              MAP ENGINE
            </Typography>
            <Typography sx={{ mt: 0.15, fontWeight: 700, color: "#ecfffb" }}>
              {runtimeProviderLabel}
            </Typography>
          </Box>
          {showBattleSpectator && battleSpectatorRuntimeModeLabel && (
            <Box
              sx={{
                maxWidth: 360,
                px: 1.05,
                py: 0.82,
                borderRadius: 1.8,
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(4, 12, 18, 0.6)",
                border: "1px solid rgba(98, 230, 208, 0.18)",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.2,
                  letterSpacing: "0.1em",
                  color: "rgba(98, 230, 208, 0.86)",
                }}
              >
                {battleSpectatorRuntimeModeLabel}
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: 12.4,
                  fontWeight: 700,
                  color: "#ecfffb",
                }}
              >
                {battleSpectatorRuntimeModeSummary}
              </Typography>
            </Box>
          )}
          {showBattleSpectator && (
            <Box
              sx={{
                width: { xs: "min(calc(100vw - 32px), 368px)", sm: 360 },
                px: 1.1,
                py: 1,
                borderRadius: 2,
                backdropFilter: "blur(14px)",
                background:
                  "linear-gradient(180deg, rgba(4, 12, 18, 0.82) 0%, rgba(5, 14, 21, 0.68) 100%)",
                border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                boxShadow: "0 14px 32px rgba(0, 0, 0, 0.24)",
                pointerEvents: "auto",
              }}
            >
              {inspectedBattleSpectatorTarget ? (
                <>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          mt: 0.2,
                          width: 34,
                          height: 34,
                          borderRadius: 1.4,
                          display: "grid",
                          placeItems: "center",
                          backgroundColor: `${inspectedBattleSpectatorTargetTone}16`,
                          border: `1px solid ${inspectedBattleSpectatorTargetTone}26`,
                        }}
                      >
                        <EntityIcon
                          type={inspectedBattleSpectatorTargetIconType}
                          width={20}
                          height={20}
                          color={inspectedBattleSpectatorTargetTone}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 10.2,
                            letterSpacing: "0.12em",
                            color: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          LIVE INSPECTOR
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: 16.4,
                            fontWeight: 800,
                            color: "#ecfffb",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {inspectedBattleSpectatorTarget.kind === "unit"
                            ? inspectedBattleSpectatorTarget.unit.name
                            : inspectedBattleSpectatorTarget.weapon.name}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: 11.8,
                            color: "rgba(236, 255, 251, 0.7)",
                          }}
                        >
                          {inspectedBattleSpectatorTarget.kind === "unit"
                            ? `${inspectedBattleSpectatorTarget.unit.sideName} · ${formatBattleSpectatorEntityType(
                                inspectedBattleSpectatorTarget.unit.entityType
                              )}`
                            : `${inspectedBattleSpectatorTarget.weapon.sideName} · 유도탄`}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      sx={{
                        flexShrink: 0,
                        px: 0.8,
                        py: 0.3,
                        borderRadius: 99,
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: inspectedBattleSpectatorTargetTone,
                        backgroundColor: `${inspectedBattleSpectatorTargetTone}14`,
                        border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                      }}
                    >
                      {inspectedBattleSpectatorTarget.kind === "unit"
                        ? "자산"
                        : "탄체"}
                    </Typography>
                  </Stack>
                  {inspectedBattleSpectatorTarget.kind === "unit" ? (
                    <>
                      <Box
                        sx={{
                          mt: 1,
                          p: 0.95,
                          borderRadius: 1.5,
                          background: `linear-gradient(180deg, ${inspectedBattleSpectatorTargetTone}16 0%, rgba(255, 255, 255, 0.03) 100%)`,
                          border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10.4,
                            letterSpacing: "0.1em",
                            color: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          QUICK READ
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.3,
                            fontSize: 12.2,
                            color: "rgba(236, 255, 251, 0.82)",
                          }}
                        >
                          표적{" "}
                          {inspectedBattleSpectatorTarget.insight.targetName ??
                            "미지정"}{" "}
                          · 접근 탄체{" "}
                          {inspectedBattleSpectatorTarget.insight.incomingWeapons}
                          발 · 발사 중{" "}
                          {inspectedBattleSpectatorTarget.insight.outgoingWeapons}
                          발
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mt: 0.9,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: 0.7,
                        }}
                      >
                        {[
                          [
                            "체력",
                            formatBattleSpectatorHp(
                              inspectedBattleSpectatorTarget.unit.hpFraction
                            ),
                          ],
                          [
                            "속도",
                            `${Math.round(
                              inspectedBattleSpectatorTarget.unit.speedKts
                            )} kt`,
                          ],
                          [
                            "무장",
                            `${inspectedBattleSpectatorTarget.unit.weaponCount}`,
                          ],
                          [
                            "연료",
                            formatBattleSpectatorFuelFraction(
                              inspectedBattleSpectatorTarget.unit.fuelFraction
                            ),
                          ],
                        ].map(([label, value]) => (
                          <Box
                            key={label}
                            sx={{
                              p: 0.8,
                              borderRadius: 1.4,
                              backgroundColor: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                color: "rgba(236, 255, 251, 0.62)",
                              }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.2,
                                fontSize: 12.2,
                                fontWeight: 700,
                                color: "#ecfffb",
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Typography
                        sx={{
                          mt: 0.9,
                          fontSize: 11.9,
                          color: "rgba(236, 255, 251, 0.72)",
                        }}
                      >
                        탐지{" "}
                        {formatBattleSpectatorRangeNm(
                          inspectedBattleSpectatorTarget.unit.detectionRangeNm
                        )}{" "}
                        · 교전{" "}
                        {formatBattleSpectatorRangeNm(
                          inspectedBattleSpectatorTarget.unit.engagementRangeNm
                        )}{" "}
                        · 방위{" "}
                        {formatBattleSpectatorHeading(
                          inspectedBattleSpectatorTarget.unit.headingDeg
                        )}
                      </Typography>
                      {inspectedBattleSpectatorTarget.unit.statusFlags.length >
                        0 && (
                        <Stack
                          direction="row"
                          spacing={0.55}
                          sx={{ mt: 0.75, flexWrap: "wrap" }}
                        >
                          {inspectedBattleSpectatorTarget.unit.statusFlags
                            .slice(0, 5)
                            .map((statusFlag) => (
                              <Typography
                                key={statusFlag}
                                sx={{
                                  px: 0.7,
                                  py: 0.24,
                                  borderRadius: 99,
                                  fontSize: 10.3,
                                  color: "rgba(236, 255, 251, 0.76)",
                                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                                }}
                              >
                                {statusFlag}
                              </Typography>
                            ))}
                        </Stack>
                      )}
                      <Stack
                        direction="row"
                        spacing={0.7}
                        sx={{ mt: 1, flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            const framing = resolveBattleSpectatorUnitFocusFraming(
                              inspectedBattleSpectatorTarget.unit
                            );
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                              cameraProfile:
                                resolveBattleSpectatorUnitCameraProfile(
                                  inspectedBattleSpectatorTarget.unit
                                ),
                              durationSeconds: framing.durationSeconds,
                              headingDegrees: framing.headingDegrees,
                              pitchDegrees: framing.pitchDegrees,
                              rangeMeters: framing.rangeMeters,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            color: "#041215",
                            backgroundColor: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          추적 보기
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                              cameraProfile: "side",
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: `${inspectedBattleSpectatorTargetTone}44`,
                            color: "#ecfffb",
                          }}
                        >
                          측면 보기
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                              cameraProfile: "orbit",
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: `${inspectedBattleSpectatorTargetTone}44`,
                            color: "#ecfffb",
                          }}
                        >
                          오비트 보기
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            closeBattleSpectatorHeroView();
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorUnitJumpPoint(
                                inspectedBattleSpectatorTarget.unit
                              ),
                              followTargetId: undefined,
                              sideFilterId:
                                inspectedBattleSpectatorTarget.unit.sideId,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: "rgba(255, 255, 255, 0.14)",
                            color: "rgba(236, 255, 251, 0.84)",
                          }}
                        >
                          개요 보기
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          mt: 1,
                          p: 0.95,
                          borderRadius: 1.5,
                          background: `linear-gradient(180deg, ${inspectedBattleSpectatorTargetTone}16 0%, rgba(255, 255, 255, 0.03) 100%)`,
                          border: `1px solid ${inspectedBattleSpectatorTargetTone}22`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10.4,
                            letterSpacing: "0.1em",
                            color: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          TRAJECTORY
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.3,
                            fontSize: 12.2,
                            color: "rgba(236, 255, 251, 0.82)",
                          }}
                        >
                          {inspectedBattleSpectatorTarget.trajectory?.phaseLabel ??
                            "비행 중"}{" "}
                          · ETA{" "}
                          {inspectedBattleSpectatorTarget.impactTimeline
                            ? formatBattleSpectatorEta(
                                inspectedBattleSpectatorTarget.impactTimeline
                                  .etaSec
                              )
                            : "계산 중"}{" "}
                          · 위협 반경{" "}
                          {formatBattleSpectatorThreatRadius(
                            inspectedBattleSpectatorTarget.trajectory
                              ?.threatRadiusMeters ?? 0
                          )}
                        </Typography>
                        {typeof inspectedBattleSpectatorTarget.trajectory
                          ?.progressPercent === "number" && (
                          <Box
                            sx={{
                              mt: 0.8,
                              height: 7,
                              borderRadius: 999,
                              overflow: "hidden",
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${Math.max(
                                  6,
                                  Math.round(
                                    inspectedBattleSpectatorTarget.trajectory
                                      .progressPercent
                                  )
                                )}%`,
                                height: "100%",
                                backgroundColor:
                                  inspectedBattleSpectatorTargetTone,
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      <Box
                        sx={{
                          mt: 0.9,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: 0.7,
                        }}
                      >
                        {[
                          [
                            "속도",
                            `${Math.round(
                              inspectedBattleSpectatorTarget.weapon.speedKts
                            )} kt`,
                          ],
                          [
                            "발사",
                            inspectedBattleSpectatorTarget.weapon.launcherName,
                          ],
                          [
                            "목표",
                            inspectedBattleSpectatorTarget.trajectory
                              ?.targetName ??
                              inspectedBattleSpectatorTarget.targetUnit?.name ??
                              "미상",
                          ],
                          [
                            "시점",
                            formatBattleSpectatorCameraProfileLabel(
                              battleSpectatorCameraProfile
                            ),
                          ],
                        ].map(([label, value]) => (
                          <Box
                            key={label}
                            sx={{
                              p: 0.8,
                              borderRadius: 1.4,
                              backgroundColor: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                color: "rgba(236, 255, 251, 0.62)",
                              }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.2,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#ecfffb",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Stack
                        direction="row"
                        spacing={0.55}
                        sx={{ mt: 0.8, flexWrap: "wrap" }}
                      >
                        {[
                          inspectedBattleSpectatorTarget.trajectory?.phaseLabel,
                          inspectedBattleSpectatorTarget.trajectory
                            ?.targetTypeLabel,
                        ]
                          .filter(
                            (label): label is string =>
                              typeof label === "string" && label.length > 0
                          )
                          .map((label) => (
                            <Typography
                              key={label}
                              sx={{
                                px: 0.7,
                                py: 0.24,
                                borderRadius: 99,
                                fontSize: 10.3,
                                color: "rgba(236, 255, 251, 0.76)",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              {label}
                            </Typography>
                          ))}
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.7}
                        sx={{ mt: 1, flexWrap: "wrap" }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => {
                            const framing = resolveBattleSpectatorWeaponFocusFraming(
                              inspectedBattleSpectatorTarget.weapon
                            );
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorWeaponJumpPoint(
                                inspectedBattleSpectatorTarget.weapon
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              cameraProfile: "chase",
                              durationSeconds: framing.durationSeconds,
                              headingDegrees: framing.headingDegrees,
                              pitchDegrees: framing.pitchDegrees,
                              rangeMeters: framing.rangeMeters,
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            color: "#041215",
                            backgroundColor: inspectedBattleSpectatorTargetTone,
                          }}
                        >
                          탄체 추적
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            openBattleSpectatorHeroView(
                              inspectedBattleSpectatorTarget.followTargetId
                            );
                            focusBattleSpectatorView({
                              point: resolveBattleSpectatorWeaponJumpPoint(
                                inspectedBattleSpectatorTarget.weapon
                              ),
                              followTargetId:
                                inspectedBattleSpectatorTarget.followTargetId,
                              cameraProfile: "side",
                            });
                          }}
                          sx={{
                            minWidth: 0,
                            borderColor: `${inspectedBattleSpectatorTargetTone}44`,
                            color: "#ecfffb",
                          }}
                        >
                          측면 축선
                        </Button>
                        {(() => {
                          const launcherUnit =
                            inspectedBattleSpectatorTarget.launcherUnit;
                          if (!launcherUnit) {
                            return null;
                          }

                          return (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                openBattleSpectatorHeroView(
                                  `unit:${launcherUnit.id}`
                                );
                                focusBattleSpectatorView({
                                  point:
                                    resolveBattleSpectatorUnitJumpPoint(
                                      launcherUnit
                                    ),
                                  followTargetId: `unit:${launcherUnit.id}`,
                                  sideFilterId: launcherUnit.sideId,
                                  cameraProfile:
                                    resolveBattleSpectatorUnitCameraProfile(
                                      launcherUnit
                                    ),
                                });
                              }}
                              sx={{
                                minWidth: 0,
                                borderColor: "rgba(255, 255, 255, 0.14)",
                                color: "rgba(236, 255, 251, 0.84)",
                              }}
                            >
                              발사 플랫폼
                            </Button>
                          );
                        })()}
                        {(inspectedBattleSpectatorTarget.targetUnit ??
                          inspectedBattleSpectatorTarget.trajectory
                            ?.targetPoint) && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              if (inspectedBattleSpectatorTarget.targetUnit) {
                                openBattleSpectatorHeroView(
                                  `unit:${inspectedBattleSpectatorTarget.targetUnit.id}`
                                );
                              } else {
                                closeBattleSpectatorHeroView();
                              }
                              focusBattleSpectatorView({
                                point:
                                  inspectedBattleSpectatorTarget.targetUnit
                                    ? resolveBattleSpectatorUnitJumpPoint(
                                        inspectedBattleSpectatorTarget.targetUnit
                                      )
                                    : (inspectedBattleSpectatorTarget.trajectory
                                        ?.targetPoint as {
                                        longitude: number;
                                        latitude: number;
                                        altitudeMeters: number;
                                      }),
                                followTargetId:
                                  inspectedBattleSpectatorTarget.targetUnit
                                    ? `unit:${inspectedBattleSpectatorTarget.targetUnit.id}`
                                    : undefined,
                                sideFilterId:
                                  inspectedBattleSpectatorTarget.targetUnit
                                    ?.sideId,
                                cameraProfile: "side",
                              });
                            }}
                            sx={{
                              minWidth: 0,
                              borderColor: "rgba(255, 255, 255, 0.14)",
                              color: "rgba(236, 255, 251, 0.84)",
                            }}
                          >
                            목표 지점
                          </Button>
                        )}
                      </Stack>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontSize: 10.2,
                      letterSpacing: "0.12em",
                      color: "#7fe7ff",
                    }}
                  >
                    LIVE INSPECTOR
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#ecfffb",
                    }}
                  >
                    지형 위 전력이나 탄체를 클릭하세요
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: 12.2,
                      color: "rgba(236, 255, 251, 0.72)",
                    }}
                  >
                    클릭 즉시 이 카드가 상태 패널로 바뀌고, 추적·측면·오비트
                    같은 세부 시점을 바로 전환할 수 있습니다.
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.6}
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    {["CLICK", "TRACK", "SIDE", "ORBIT"].map((label) => (
                      <Typography
                        key={label}
                        sx={{
                          px: 0.72,
                          py: 0.28,
                          borderRadius: 99,
                          fontSize: 10.4,
                          color: "rgba(236, 255, 251, 0.8)",
                          backgroundColor: "rgba(127, 231, 255, 0.08)",
                          border: "1px solid rgba(127, 231, 255, 0.16)",
                        }}
                      >
                        {label}
                      </Typography>
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          )}
          {showBattleSpectator && game && (
            <BattleSpectatorScenarioSidebar
              game={game}
              battleSpectator={displayedBattleSpectator}
              focusFireAirwatch={currentFocusFireAirwatch}
              scenarioName={battleSpectatorScenarioName}
              scenarioPaused={battleSpectatorScenarioPaused}
              scenarioTimeCompression={battleSpectatorScenarioTimeCompression}
              visibleScenarioPresets={visibleBattleSpectatorScenarioPresets}
              presetListExpanded={battleSpectatorPresetListExpanded}
              selectedUnit={selectedBattleSpectatorUnit}
              selectedUnitTargetName={
                selectedBattleSpectatorInsight?.targetName ?? null
              }
              onNewScenario={handleBattleSpectatorNewScenario}
              onLoadScenarioClick={() =>
                battleSpectatorScenarioFileInputRef.current?.click()
              }
              onRestartScenario={handleBattleSpectatorRestartScenario}
              onStepScenario={handleBattleSpectatorStepScenario}
              onTogglePlay={handleBattleSpectatorTogglePlay}
              onToggleTimeCompression={handleBattleSpectatorToggleTimeCompression}
              onExportScenario={handleBattleSpectatorExportScenario}
              onRenameScenario={handleBattleSpectatorRenameScenario}
              onTogglePresetListExpanded={() =>
                setBattleSpectatorPresetListExpanded(
                  (currentValue) => !currentValue
                )
              }
              onLoadPresetScenario={(preset) =>
                loadBattleSpectatorPresetScenario(
                  preset as FlightSimScenarioPresetDefinition
                )
              }
              onFocusObjective={
                battleSpectatorEnabled
                  ? handleBattleSpectatorFocusObjective
                  : undefined
              }
              onFocusSelectedUnit={
                battleSpectatorEnabled && selectedBattleSpectatorUnit
                  ? () => {
                      closeBattleSpectatorHeroView();
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorUnitJumpPoint(
                          selectedBattleSpectatorUnit
                        ),
                        followTargetId: undefined,
                        sideFilterId: selectedBattleSpectatorUnit.sideId,
                      });
                    }
                  : undefined
              }
              onTrackSelectedUnit={
                battleSpectatorEnabled && selectedBattleSpectatorUnit
                  ? () => {
                      openBattleSpectatorHeroView(
                        `unit:${selectedBattleSpectatorUnit.id}`
                      );
                      focusBattleSpectatorView({
                        point: resolveBattleSpectatorUnitJumpPoint(
                          selectedBattleSpectatorUnit
                        ),
                        followTargetId: `unit:${selectedBattleSpectatorUnit.id}`,
                        sideFilterId: selectedBattleSpectatorUnit.sideId,
                        cameraProfile: resolveBattleSpectatorUnitCameraProfile(
                          selectedBattleSpectatorUnit
                        ),
                        durationSeconds:
                          resolveBattleSpectatorUnitFocusFraming(
                            selectedBattleSpectatorUnit
                          ).durationSeconds,
                        headingDegrees:
                          resolveBattleSpectatorUnitFocusFraming(
                            selectedBattleSpectatorUnit
                          ).headingDegrees,
                        pitchDegrees:
                          resolveBattleSpectatorUnitFocusFraming(
                            selectedBattleSpectatorUnit
                          ).pitchDegrees,
                        rangeMeters:
                          resolveBattleSpectatorUnitFocusFraming(
                            selectedBattleSpectatorUnit
                          ).rangeMeters,
                      });
                    }
                  : undefined
              }
            />
          )}
        </Stack>
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
            borderRadius: battleSpectatorEnabled ? { xs: 0, md: 3 } : 0,
            boxShadow: battleSpectatorEnabled
              ? "0 26px 80px rgba(0, 0, 0, 0.42)"
              : "none",
            outline: battleSpectatorEnabled
              ? "1px solid rgba(127, 231, 255, 0.08)"
              : "none",
          }}
        />
        {battleSpectatorEnabled && battleSpectatorHeroView && (
          <BattleSpectatorHeroViewport
            view={battleSpectatorHeroView}
            onClose={closeBattleSpectatorHeroView}
          />
        )}

        {loadingOverlayVisible && (
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
              {loadingStatusLabel}
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
