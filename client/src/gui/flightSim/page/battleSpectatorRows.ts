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
  buildBattleSpectatorStats,
  isBattleSpectatorLaunchEvent,
  isBattleSpectatorImpactEvent,
  buildBattleSpectatorActivitySummary,
  roundBattleSpectatorSignatureNumber,
  buildBattleSpectatorStateSignature,
  buildBattleSpectatorRuntimeSignature,
  buildBattleSpectatorSideTrendHistoryEntry,
  buildBattleSpectatorSideTrendRows,
  buildBattleSpectatorInitiativeSummary,
  buildBattleSpectatorBriefing,
  buildBattleSpectatorSaturationTargetIds,
  filterBattleSpectatorTrajectoryRows,
  filterBattleSpectatorImpactTimelineRows,
  filterBattleSpectatorAssetRiskRows,
  getBattleSpectatorTrendTone,
  getBattleSpectatorSideCssColor,
  buildBattleSpectatorPowerHistoryBars,
  filterBattleSpectatorState,
  hasFiniteBattleSpectatorPoint,
  resolveBattleSpectatorJumpPoint,
  parseBattleSpectatorFollowTargetId,
} from './battleSpectatorAnalytics';

import {
  resolveInitialBattleSpectatorPanelOpen,
  resolveBattleSpectatorInspectTarget,
  formatBattleSpectatorEntityType,
  formatBattleSpectatorHeading,
  formatBattleSpectatorHp,
  formatBattleSpectatorAltitude,
  formatBattleSpectatorTimestamp,
  getBattleSpectatorHpTone,
  resolveBattleSpectatorUnitJumpPoint,
  resolveBattleSpectatorWeaponJumpPoint,
  resolveBattleSpectatorWeaponFocusFraming,
  formatBattleSpectatorCameraProfileLabel,
  resolveBattleSpectatorHeroProfileForUnit,
  buildBattleSpectatorHeroUnitAsset,
  buildBattleSpectatorHeroWeaponAsset,
  isBattleSpectatorRotaryWingAsset,
  resolveBattleSpectatorHeroWeaponProfile,
  resolveBattleSpectatorHeroOperationMode,
  buildBattleSpectatorHeroRelatedEventItems,
  resolveBattleSpectatorHeroContextAsset,
  buildBattleSpectatorHeroFallbackFeed,
  buildBattleSpectatorHeroView,
  resolveBattleSpectatorUnitCameraProfile,
  resolveBattleSpectatorFollowTargetCameraProfile,
  applyBattleSpectatorFollowTargetSelection,
  resolveBattleSpectatorPatrolUnitPreset,
  resolveBattleSpectatorUnitIconType,
  resolveBattleSpectatorUnitFocusFraming,
  resolveBattleSpectatorSceneFocusFraming,
  resolveBattleSpectatorPatrolUnitPriority,
  buildBattleSpectatorPatrolUnitTargets,
  getBattleSpectatorPatrolTargetTone,
  resolveBattleSpectatorSceneEntryLabel,
  resolveBattleSpectatorEventJumpPoint,
  resolveBattleSpectatorSideJumpPoint,
  clampBattleSpectatorValue,
  distanceKmBetweenBattleSpectatorPoints,
  isBattleSpectatorTrajectoryWeapon,
  formatBattleSpectatorDistanceKm,
  estimateBattleSpectatorTimeToImpactSec,
} from './battleSpectatorFocus';

export function resolveBattleSpectatorThreatRadiusMeters(
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

export function formatBattleSpectatorThreatRadius(threatRadiusMeters?: number | null) {
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

export function formatBattleSpectatorEta(timeToImpactSec?: number | null) {
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

export function formatBattleSpectatorRangeNm(rangeNm: number) {
  return `${Math.round(Math.max(0, rangeNm || 0))}nm`;
}

export function formatBattleSpectatorFuelFraction(fuelFraction?: number) {
  if (typeof fuelFraction !== "number" || !Number.isFinite(fuelFraction)) {
    return "미상";
  }

  return `${Math.round(clampBattleSpectatorValue(fuelFraction, 0, 1) * 100)}%`;
}

export function resolveBattleSpectatorOverviewPoint(state?: BattleSpectatorState) {
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

export function buildBattleSpectatorTrajectoryRows(
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

export function buildBattleSpectatorImpactTimelineRows(
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

export function resolveBattleSpectatorTrajectoryTargetUnit(
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

export function buildBattleSpectatorAssetRiskRows(options: {
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

export function buildBattleSpectatorPatrolTargets(options: {
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

export function buildBattleSpectatorSelectedUnitInsight(
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

export function buildBattleSpectatorThreatRows(
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

export function buildBattleSpectatorHotspotRows(
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

export function buildBattleSpectatorTempoRows(
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

export function buildBattleSpectatorAlertRows(options: {
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

