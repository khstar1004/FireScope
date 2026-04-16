import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

const FLIGHT_SIM_ENTRY = "/flight-sim/index.html";
const FLIGHT_SIM_REVISION = "20260416-battle-spectator-tactical-ui";

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
  overline: "항공 시뮬레이터 전장 관전자",
  title: "전장 관전자 3D 시뮬레이터",
  description:
    "현재 시나리오의 유닛과 비행 중 탄체를 3D 지형 위에서 실시간으로 관전합니다. 추적 대상, 위협 상위 유닛, 최근 교전을 오가며 전장 흐름을 빠르게 확인할 수 있습니다.",
  controls: [
    "`마우스 드래그`: 시야 회전",
    "`마우스 휠`: 확대 / 축소",
    "`Shift + 드래그`: 시점 기울이기",
    "`좌측 패널`: 세력 필터 · 추적 · 교전 점프",
    "`모바일`: 패널 열기 / 닫기",
  ],
};

function buildBattleSpectatorStats(state: BattleSpectatorState) {
  const sides = new Set<string>();
  state.units.forEach((unit) => sides.add(unit.sideId));
  state.weapons.forEach((weapon) => sides.add(weapon.sideId));

  return {
    aircraft: state.units.filter((unit) => unit.entityType === "aircraft").length,
    facilities: state.units.filter((unit) => unit.entityType === "facility")
      .length,
    airbases: state.units.filter((unit) => unit.entityType === "airbase").length,
    ships: state.units.filter((unit) => unit.entityType === "ship").length,
    weaponsInFlight: state.weapons.length,
    sides: sides.size,
  };
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
      (typeof weapon.targetId === "string" && visibleUnitIds.has(weapon.targetId))
  );
  const recentEvents = state.recentEvents.filter(
    (event) =>
      event.sideId === sideFilterId ||
      (typeof event.actorId === "string" && visibleUnitIds.has(event.actorId)) ||
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

  const selectedUnit = state.units.find((unit) => unit.selected) ?? state.units[0];
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
  if (typeof window === "undefined") {
    return true;
  }

  return window.innerWidth >= 600;
}

function formatBattleSpectatorEntityType(entityType: BattleSpectatorEntityType) {
  switch (entityType) {
    case "aircraft":
      return "항공";
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
    altitudeMeters: Math.max(minimumAltitude, unit.altitudeMeters + altitudeOffset),
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

function buildBattleSpectatorSelectedUnitInsight(
  selectedUnit: BattleSpectatorUnitSnapshot | undefined,
  state: BattleSpectatorState | undefined,
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>
) {
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
      ? allUnitsById.get(selectedUnit.targetId)?.name ?? selectedUnit.targetId
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
          ? allUnitsById.get(unit.targetId)?.name ?? unit.targetId
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
  const simulationOutcomeRequestIdRef = useRef(0);
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
  const [battleSpectatorPanelOpen, setBattleSpectatorPanelOpen] = useState(
    () => !battleSpectatorEnabled || resolveInitialBattleSpectatorPanelOpen()
  );
  const [currentBattleSpectator, setCurrentBattleSpectator] = useState<
    BattleSpectatorState | undefined
  >(() =>
    battleSpectatorEnabled
      ? buildBattleSpectatorState(game, continueSimulation, battleSpectator)
      : undefined
  );
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
    useState("");
  const [battleSpectatorLodLevel, setBattleSpectatorLodLevel] =
    useState<BattleSpectatorLodLevel>("balanced");
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
  const followTargetOptions = useMemo(() => {
    const units =
      visibleBattleSpectator?.units.length || battleSpectatorSideFilter !== "all"
        ? (visibleBattleSpectator?.units ?? [])
        : (currentBattleSpectator?.units ?? []);
    const sortedUnits = [...units].sort((left, right) => {
      if (left.selected !== right.selected) {
        return left.selected ? -1 : 1;
      }
      if (left.weaponCount !== right.weaponCount) {
        return right.weaponCount - left.weaponCount;
      }
      return left.name.localeCompare(right.name, "ko-KR");
    });

    const weapons = visibleBattleSpectator?.weapons ?? [];
    const recentWeapons = weapons.slice(Math.max(0, weapons.length - 8)).reverse();

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
    battleSpectatorSideFilter,
    currentBattleSpectator?.units,
    visibleBattleSpectator?.weapons,
    visibleBattleSpectator?.units,
  ]);
  const selectedBattleSpectatorUnit = useMemo(
    () => visibleBattleSpectator?.units.find((unit) => unit.selected),
    [visibleBattleSpectator]
  );
  const allBattleSpectatorUnitsById = useMemo(
    () =>
      new Map(
        (currentBattleSpectator?.units ?? []).map((unit) => [unit.id, unit] as const)
      ),
    [currentBattleSpectator?.units]
  );
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
  const latestBattleEngagementPoint = useMemo(
    () => resolveBattleSpectatorJumpPoint(visibleBattleSpectator),
    [visibleBattleSpectator]
  );
  const latestBattleSpectatorWeapon = useMemo(() => {
    const weapons = visibleBattleSpectator?.weapons ?? [];
    return weapons.length > 0 ? weapons[weapons.length - 1] : undefined;
  }, [visibleBattleSpectator]);

  iframeParams.set("lon", normalizedInitialLocation.lon.toFixed(6));
  iframeParams.set("lat", normalizedInitialLocation.lat.toFixed(6));
  iframeParams.set(
    "craft",
    selectedMode === "drone" ? "drone" : selectedJetCraftId
  );
  iframeParams.set("rev", FLIGHT_SIM_REVISION);
  if (showBattleSpectator) {
    iframeParams.set("battleSpectator", "1");
  }
  appendFocusFireQueryParams(iframeParams, currentFocusFireAirwatch);

  const iframeSrc = iframeParams.toString()
    ? `${FLIGHT_SIM_ENTRY}?${iframeParams.toString()}`
    : FLIGHT_SIM_ENTRY;
  const selectedCraftCopy = showBattleSpectator
    ? battleSpectatorCopy
    : craftCopy[selectedMode];
  const selectedJetCraft = getJetCraftCatalogEntry(selectedJetCraftId);
  const selectedFlightSimTitle = showBattleSpectator
    ? "전장 관전자 3D 시뮬레이터"
    : selectedMode === "drone"
      ? "드론 시뮬레이터"
      : `${selectedJetCraft.label} 시뮬레이터`;
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

  const jumpToBattleSpectatorPoint = (point: {
    longitude: number;
    latitude: number;
    altitudeMeters: number;
  }) => {
    postRuntimeToFlightSim("firescope-battle-spectator-command", {
      command: "jump-to-point",
      longitude: point.longitude,
      latitude: point.latitude,
      altitudeMeters: point.altitudeMeters,
      durationSeconds: 1.8,
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

  const focusBattleSpectatorView = (options: {
    point: {
      longitude: number;
      latitude: number;
      altitudeMeters: number;
    };
    followTargetId?: string;
    sideFilterId?: string;
  }) => {
    if (options.sideFilterId) {
      setBattleSpectatorSideFilter(options.sideFilterId);
    }
    if (options.followTargetId !== undefined) {
      setBattleSpectatorFollowTargetId(options.followTargetId);
    }
    jumpToBattleSpectatorPoint(options.point);
    closeBattleSpectatorPanelOnMobile();
  };

  useEffect(() => {
    setCurrentBattleSpectator(
      battleSpectatorEnabled
        ? buildBattleSpectatorState(game, continueSimulation, battleSpectator)
        : undefined
    );
  }, [battleSpectator, battleSpectatorEnabled, continueSimulation, game]);

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
      return;
    }

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
    if (!showBattleSpectator) {
      setBattleSpectatorPanelOpen(true);
      return;
    }

    setBattleSpectatorPanelOpen(resolveInitialBattleSpectatorPanelOpen());
  }, [showBattleSpectator]);

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
      !showBattleSpectator ||
      !visibleBattleSpectator
    ) {
      return;
    }

    postRuntimeToFlightSim("firescope-battle-spectator-update", {
      scenarioId: visibleBattleSpectator.scenarioId,
      scenarioName: visibleBattleSpectator.scenarioName,
      currentTime: visibleBattleSpectator.currentTime,
      currentSideId: visibleBattleSpectator.currentSideId,
      currentSideName: visibleBattleSpectator.currentSideName,
      centerLongitude: visibleBattleSpectator.centerLongitude,
      centerLatitude: visibleBattleSpectator.centerLatitude,
      units: visibleBattleSpectator.units,
      weapons: visibleBattleSpectator.weapons,
      recentEvents: visibleBattleSpectator.recentEvents,
      stats: visibleBattleSpectator.stats,
      view: {
        followTargetId: battleSpectatorFollowTargetId || null,
        lodLevel: battleSpectatorLodLevel,
      },
    });
  }, [
    battleSpectatorFollowTargetId,
    battleSpectatorLodLevel,
    flightSimFrameReady,
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
    if (!game || !battleSpectatorEnabled || !showBattleSpectator) {
      return;
    }

    let cancelled = false;

    const syncBattleSpectatorState = () => {
      if (cancelled || document.hidden) {
        return;
      }

      setCurrentBattleSpectator(buildBattleSpectatorState(game, continueSimulation));
    };

    syncBattleSpectatorState();
    const syncIntervalId = window.setInterval(syncBattleSpectatorState, 250);

    return () => {
      cancelled = true;
      window.clearInterval(syncIntervalId);
    };
  }, [battleSpectatorEnabled, continueSimulation, game, showBattleSpectator]);

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
      typeof game.checkGameEnded !== "function" ||
      typeof game.step !== "function" ||
      typeof game.recordStep !== "function"
    ) {
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

      {showBattleSpectator && (
        <>
          <Button
            variant="contained"
            onClick={() => setBattleSpectatorPanelOpen((open) => !open)}
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              position: "absolute",
              top: 20,
              left: 20,
              zIndex: 4,
              borderRadius: 999,
              px: 1.5,
              py: 0.9,
              backgroundColor: "rgba(10, 28, 36, 0.92)",
              color: "#ecfffb",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.32)",
              "&:hover": {
                backgroundColor: "rgba(16, 42, 46, 0.96)",
              },
            }}
          >
            {battleSpectatorPanelOpen ? "패널 접기" : "관전 패널"}
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
          pointerEvents: {
            xs: showBattleSpectator && !battleSpectatorPanelOpen ? "none" : "auto",
            sm: "auto",
          },
          transform: {
            xs:
              showBattleSpectator && !battleSpectatorPanelOpen
                ? "translateX(calc(-100% - 28px))"
                : "translateX(0)",
            sm: "translateX(0)",
          },
          transition: "transform 180ms ease, opacity 180ms ease",
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
            {!showBattleSpectator && selectedMode === "jet" && (
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
          {showBattleSpectator
            ? `${selectedCraftCopy.description} 작은 화면에서는 상단 버튼으로 패널을 접고 전장을 넓게 볼 수 있습니다.`
            : `${selectedCraftCopy.description} 화면 안을 한 번 클릭한 뒤 조작하면 됩니다.`}
        </Typography>
        {!showBattleSpectator && (
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
        )}
        {!showBattleSpectator && selectedMode === "jet" && (
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
        {showBattleSpectator && currentBattleSpectator && (
          <Box
            sx={{
              mt: 2,
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
              {currentBattleSpectator.scenarioName}
            </Typography>
            <Typography
              sx={{
                mt: 0.65,
                fontSize: 12.5,
                color: "rgba(236, 255, 251, 0.76)",
              }}
            >
              유닛 {currentBattleSpectator.units.length} · 비행 중 탄체{" "}
              {currentBattleSpectator.stats.weaponsInFlight} · 세력{" "}
              {currentBattleSpectator.stats.sides}
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
                ["항공", currentBattleSpectator.stats.aircraft],
                ["지상시설", currentBattleSpectator.stats.facilities],
                ["기지", currentBattleSpectator.stats.airbases],
                ["함정", currentBattleSpectator.stats.ships],
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
            <Typography
              sx={{
                mt: 1.1,
                fontSize: 12.5,
                color: "rgba(236, 255, 251, 0.72)",
              }}
            >
              전장 상공 시점에서 시작한 뒤 세력 필터, 추적 대상, 전술 카드,
              품질 단계를 바꿔가며 전황을 추적할 수 있습니다.
            </Typography>
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
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.8, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant={
                    battleSpectatorSideFilter === "all" ? "contained" : "outlined"
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
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setBattleSpectatorFollowTargetId(event.target.value)
                }
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
                LOD
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ mt: 0.8, flexWrap: "wrap" }}>
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
              <Stack direction="row" spacing={0.75} sx={{ mt: 1.15, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!selectedBattleSpectatorUnit}
                  onClick={() => {
                    if (!selectedBattleSpectatorUnit) {
                      return;
                    }
                    setBattleSpectatorSideFilter(selectedBattleSpectatorUnit.sideId);
                    setBattleSpectatorFollowTargetId(
                      `unit:${selectedBattleSpectatorUnit.id}`
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
                    focusBattleSpectatorView({
                      point: latestBattleEngagementPoint,
                      followTargetId: latestBattleEngagementPoint.followTargetId,
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
                  variant="text"
                  onClick={() => {
                    setBattleSpectatorFollowTargetId("");
                    closeBattleSpectatorPanelOnMobile();
                  }}
                  disabled={!battleSpectatorFollowTargetId}
                  sx={{ color: "rgba(236, 255, 251, 0.78)" }}
                >
                  자유 시점
                </Button>
              </Stack>
              <Typography
                sx={{
                  mt: 0.9,
                  fontSize: 12,
                  color: "rgba(236, 255, 251, 0.68)",
                }}
              >
                표시 유닛 {visibleBattleSpectator?.units.length ?? 0} · 표시 탄체{" "}
                {visibleBattleSpectator?.weapons.length ?? 0}
              </Typography>
            </Box>
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
                    체력 {formatBattleSpectatorHp(selectedBattleSpectatorUnit.hpFraction)}
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
                  유닛이 띄운 탄체 {selectedBattleSpectatorInsight.outgoingWeapons} ·
                  유닛을 향하는 탄체 {selectedBattleSpectatorInsight.incomingWeapons}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.9, flexWrap: "wrap" }}>
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
                        {formatBattleSpectatorEntityType(row.unit.entityType)} · 속도{" "}
                        {Math.round(row.unit.speedKts)}kt · 잔여 무장{" "}
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
                              point: resolveBattleSpectatorUnitJumpPoint(row.unit),
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
            {(visibleBattleSpectator?.recentEvents.length ?? 0) > 0 && (
              <Stack spacing={0.65} sx={{ mt: 1.15 }}>
                {(visibleBattleSpectator?.recentEvents ?? [])
                  .slice(-4)
                  .reverse()
                  .map((event) => {
                    const eventJumpPoint = resolveBattleSpectatorEventJumpPoint(event);
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
                                  point: resolveBattleSpectatorWeaponJumpPoint(
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
                                  point: resolveBattleSpectatorUnitJumpPoint(
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
