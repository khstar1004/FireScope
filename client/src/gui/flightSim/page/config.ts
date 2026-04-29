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
import { resolvePublicAssetPath } from "@/utils/publicAssetUrl";
import {
  getOfflineMapRegion,
  getOfflineSatelliteTileUrl,
} from "@/gui/map/offlineMapConfig";


export const FLIGHT_SIM_ENTRY = resolvePublicAssetPath("/flight-sim/index.html");
export const FLIGHT_SIM_REVISION = "20260419-battle-spectator-cinematic-v1";
export const FLIGHT_SIM_SCENARIO_NAME_REGEX = /^[a-zA-Z0-9가-힣 :-]{1,25}$/;

export type FlightSimScenarioPresetDefinition = {
  name: string;
  displayName: string;
  regenerateScenarioId?: boolean;
  scenario: Record<string, unknown>;
};

export const FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS: FlightSimScenarioPresetDefinition[] =
  [
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

export const FLIGHT_SIM_SCENARIO_ID_REFRESH_PRESET_NAMES = new Set([
  "blank_scenario",
  "default_scenario",
  "rl_first_success_demo",
  "rl_battle_optimization_demo",
  "focused_training_demo",
  "focus_fire_economy_demo",
]);

export type AssetState = "checking" | "ready" | "missing";
export type BattleSpectatorDockTab =
  | "overview"
  | "briefing"
  | "engagements"
  | "analysis";
export type CraftMode = "jet" | "drone";
export type BattleSpectatorSideTrendSnapshot = {
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
export type BattleSpectatorSideTrendEntry = {
  scenarioId: string;
  currentTime: number;
  signature: string;
  sides: BattleSpectatorSideTrendSnapshot[];
};
export type BattleSpectatorHotspotRow = {
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
export type BattleSpectatorTempoRow = {
  unit: BattleSpectatorUnitSnapshot;
  tempoScore: number;
  outgoingWeapons: number;
  incomingWeapons: number;
  recentLaunches: number;
  recentImpacts: number;
  targetName: string | null;
};
export type BattleSpectatorTrajectoryRow = {
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
export type BattleSpectatorImpactTimelineRow = {
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
export type BattleSpectatorAssetRiskRow = {
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
export type BattleSpectatorCameraProfile = "tactical" | "side" | "chase" | "orbit";
export type BattleSpectatorAlertRow = {
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
export type BattleSpectatorPatrolTargetKind =
  | "impact"
  | "drone"
  | "armor"
  | "fires"
  | "aircraft"
  | "ship"
  | "ground"
  | "hotspot"
  | "engagement";
export type BattleSpectatorPatrolTarget = {
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
export type BattleSpectatorSidebarEntry = {
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
export type BattleSpectatorBriefingAction = {
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
export type BattleSpectatorBriefing = {
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
export type BattleSpectatorPriorityFilter =
  | "all"
  | "urgent"
  | "imminent"
  | "saturation";
export type BattleSpectatorBriefingLogEntry = {
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
export type BattleSpectatorSelectedUnitInsight = {
  incomingWeapons: number;
  outgoingWeapons: number;
  targetName: string | null;
};
export type BattleSpectatorRuntimeSelectionPayload = {
  followTargetId?: string;
};
export type BattleSpectatorInspectTarget =
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
export type FlightSimRuntimeInfo = {
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

export type FocusFireAirwatchState = {
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

export type BattleSpectatorState = FlightSimBattleSpectatorState;
export type BattleSpectatorLodLevel = "cinematic" | "balanced" | "performance";

export const BATTLE_SPECTATOR_LOD_OPTIONS: Array<{
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
export const BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS: Array<{
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
export const BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS: Array<{
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

export const TRAJECTORY_WEAPON_SIGNATURE =
  /\b(aim-|agm-|asm|sam|aam|atgm|jdam|jassm|tomahawk|hyunmoo|guided|missile|rocket)\b/i;
export const NON_TRAJECTORY_WEAPON_SIGNATURE =
  /\b(shell|round|bullet|cannon|gun|30mm|20mm|40mm|57mm|76mm|90mm|105mm|120mm|125mm|127mm|130mm|152mm|155mm)\b/i;

export function resolveInitialJetCraftId(initialCraft?: string): JetCraftId {
  return isJetCraftId(initialCraft) ? initialCraft : DEFAULT_JET_CRAFT_ID;
}

export function hasFocusFireObjective(
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

export function buildFocusFireAirwatchState(
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

export function buildBattleSpectatorState(
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

export function sanitizeFlightSimScenarioFilename(name: string) {
  const normalizedName = name.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
  return normalizedName.length > 0 ? normalizedName : "scenario";
}

export function appendFocusFireQueryParams(
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

export function formatScriptStatus(runtimeInfo: FlightSimRuntimeInfo | null) {
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

export function formatViewerStatus(runtimeInfo: FlightSimRuntimeInfo | null) {
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

export function formatRuntimeProviderLabel(
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

export function formatRuntimeProviderTone(
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

export interface FlightSimPageProps {
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
  offlineDemoMode?: boolean;
}

export const craftCopy: Record<
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

export const battleSpectatorCopy = {
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

