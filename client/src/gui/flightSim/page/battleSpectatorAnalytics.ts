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


import {
  FLIGHT_SIM_ENTRY,
  FLIGHT_SIM_REVISION,
  FLIGHT_SIM_SCENARIO_NAME_REGEX,
  FlightSimScenarioPresetDefinition,
  FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS,
  FLIGHT_SIM_SCENARIO_ID_REFRESH_PRESET_NAMES,
  AssetState,
  BattleSpectatorDockTab,
  CraftMode,
  BattleSpectatorSideTrendSnapshot,
  BattleSpectatorSideTrendEntry,
  BattleSpectatorHotspotRow,
  BattleSpectatorTempoRow,
  BattleSpectatorTrajectoryRow,
  BattleSpectatorImpactTimelineRow,
  BattleSpectatorAssetRiskRow,
  BattleSpectatorCameraProfile,
  BattleSpectatorAlertRow,
  BattleSpectatorPatrolTargetKind,
  BattleSpectatorPatrolTarget,
  BattleSpectatorSidebarEntry,
  BattleSpectatorBriefingAction,
  BattleSpectatorBriefing,
  BattleSpectatorPriorityFilter,
  BattleSpectatorBriefingLogEntry,
  BattleSpectatorSelectedUnitInsight,
  BattleSpectatorRuntimeSelectionPayload,
  BattleSpectatorInspectTarget,
  FlightSimRuntimeInfo,
  FocusFireAirwatchState,
  BattleSpectatorState,
  BattleSpectatorLodLevel,
  BATTLE_SPECTATOR_LOD_OPTIONS,
  BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS,
  BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS,
  TRAJECTORY_WEAPON_SIGNATURE,
  NON_TRAJECTORY_WEAPON_SIGNATURE,
  resolveInitialJetCraftId,
  hasFocusFireObjective,
  buildFocusFireAirwatchState,
  buildBattleSpectatorState,
  sanitizeFlightSimScenarioFilename,
  appendFocusFireQueryParams,
  formatScriptStatus,
  formatViewerStatus,
  formatRuntimeProviderLabel,
  formatRuntimeProviderTone,
  FlightSimPageProps,
  craftCopy,
  battleSpectatorCopy,
} from './config';

import {
  resolveBattleSpectatorUnitCameraProfile,
  resolveBattleSpectatorUnitJumpPoint,
  resolveBattleSpectatorWeaponJumpPoint,
} from "./battleSpectatorFocus";
import {
  formatBattleSpectatorEta,
  formatBattleSpectatorThreatRadius,
} from "./battleSpectatorRows";

export function buildBattleSpectatorStats(state: BattleSpectatorState) {
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

export function isBattleSpectatorLaunchEvent(event: BattleSpectatorEvent) {
  return (
    event.resultTag === "launch" ||
    event.resultTag === "counterfire" ||
    event.type === "WEAPON_LAUNCHED"
  );
}

export function isBattleSpectatorImpactEvent(event: BattleSpectatorEvent) {
  return (
    event.resultTag === "impact" ||
    event.resultTag === "damage" ||
    event.resultTag === "kill" ||
    event.resultTag === "miss" ||
    event.type === "WEAPON_HIT" ||
    event.type === "WEAPON_MISSED"
  );
}

export function buildBattleSpectatorActivitySummary(
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

export function roundBattleSpectatorSignatureNumber(
  value: number | null | undefined,
  digits = 3
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(digits));
}

export function buildBattleSpectatorStateSignature(
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

export function buildBattleSpectatorRuntimeSignature(options: {
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

export function buildBattleSpectatorSideTrendHistoryEntry(
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

export function buildBattleSpectatorSideTrendRows(
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

export function buildBattleSpectatorInitiativeSummary(
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

export function buildBattleSpectatorBriefing(options: {
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

export function buildBattleSpectatorSaturationTargetIds(
  assetRiskRows: BattleSpectatorAssetRiskRow[]
) {
  return new Set(
    assetRiskRows
      .filter((row) => row.incomingCount >= 2)
      .map((row) => row.unit.id)
  );
}

export function filterBattleSpectatorTrajectoryRows(
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

export function filterBattleSpectatorImpactTimelineRows(
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

export function filterBattleSpectatorAssetRiskRows(
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

export function getBattleSpectatorTrendTone(delta: number) {
  if (delta >= 8) {
    return "#62e6d0";
  }
  if (delta <= -8) {
    return "#ff7b72";
  }
  return "#ffd166";
}

export function getBattleSpectatorSideCssColor(sideColor: string) {
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

export function buildBattleSpectatorPowerHistoryBars(history: number[]) {
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

export function filterBattleSpectatorState(
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

export function hasFiniteBattleSpectatorPoint(
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

export function resolveBattleSpectatorJumpPoint(state?: BattleSpectatorState) {
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

export function parseBattleSpectatorFollowTargetId(followTargetId: string) {
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

