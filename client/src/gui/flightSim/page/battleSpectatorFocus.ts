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
  buildBattleSpectatorSelectedUnitInsight,
  formatBattleSpectatorEta,
  formatBattleSpectatorThreatRadius,
} from "./battleSpectatorRows";

export function resolveInitialBattleSpectatorPanelOpen() {
  return false;
}

export function resolveBattleSpectatorInspectTarget(
  inspectTargetId: string,
  state: BattleSpectatorState | undefined,
  allUnitsById: Map<string, BattleSpectatorUnitSnapshot>,
  allWeaponsById: Map<string, BattleSpectatorWeaponSnapshot>,
  allTrajectoryRows: BattleSpectatorTrajectoryRow[],
  allImpactTimelineRows: BattleSpectatorImpactTimelineRow[]
): BattleSpectatorInspectTarget | null {
  const parsedInspectTarget =
    parseBattleSpectatorFollowTargetId(inspectTargetId);
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

export function formatBattleSpectatorEntityType(
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

export function formatBattleSpectatorHeading(headingDeg: number) {
  const normalizedHeading = ((Math.round(headingDeg) % 360) + 360) % 360;
  return `${normalizedHeading.toString().padStart(3, "0")}°`;
}

export function formatBattleSpectatorHp(hpFraction: number) {
  return `${Math.round(Math.max(0, Math.min(1, hpFraction)) * 100)}%`;
}

export function formatBattleSpectatorAltitude(altitudeMeters: number) {
  if (!Number.isFinite(altitudeMeters)) {
    return "-";
  }

  if (altitudeMeters >= 1000) {
    return `${(altitudeMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(altitudeMeters)} m`;
}

export function formatBattleSpectatorTimestamp(timestamp: number | null | undefined) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return "--:--:--";
  }

  const resolvedTimestamp =
    timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;

  return new Date(resolvedTimestamp).toLocaleTimeString("ko-KR", {
    hour12: false,
  });
}

export function getBattleSpectatorHpTone(hpFraction: number) {
  if (hpFraction >= 0.75) {
    return "#6ef0c8";
  }
  if (hpFraction >= 0.45) {
    return "#ffd166";
  }
  return "#ff7b72";
}

export function resolveBattleSpectatorUnitJumpPoint(
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

export function resolveBattleSpectatorWeaponJumpPoint(
  weapon: BattleSpectatorWeaponSnapshot
) {
  return {
    longitude: weapon.longitude,
    latitude: weapon.latitude,
    altitudeMeters: Math.max(1600, weapon.altitudeMeters + 700),
    followTargetId: `weapon:${weapon.id}`,
  };
}

export function resolveBattleSpectatorWeaponFocusFraming(
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

export function formatBattleSpectatorCameraProfileLabel(
  cameraProfile: BattleSpectatorCameraProfile
) {
  return (
    BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS.find(
      (option) => option.id === cameraProfile
    )?.label ?? "전술"
  );
}

export function resolveBattleSpectatorHeroProfileForUnit(
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

export function buildBattleSpectatorHeroUnitAsset(
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
  const rangeReference = Math.max(
    unit.detectionRangeNm,
    unit.engagementRangeNm
  );

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
      inventoryTotals.maxQuantity > 0
        ? inventoryTotals.currentQuantity
        : undefined,
    maxQuantity:
      inventoryTotals.maxQuantity > 0 ? inventoryTotals.maxQuantity : undefined,
  };
}

export function buildBattleSpectatorHeroWeaponAsset(
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

export function isBattleSpectatorRotaryWingAsset(asset: AssetExperienceSummary) {
  const signature = `${asset.className} ${asset.name}`.toLowerCase();
  return /(apache|blackhawk|black hawk|helicopter|helo|rotary|uh-|ah-|ch-)/.test(
    signature
  );
}

export function resolveBattleSpectatorHeroWeaponProfile(
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

export function resolveBattleSpectatorHeroOperationMode(
  profile: ImmersiveExperienceProfile,
  asset: AssetExperienceSummary
) {
  const signature = `${asset.className} ${asset.name}`.toLowerCase();

  switch (profile) {
    case "ground":
      return (asset.speed ?? 0) >= 16 ||
        /tank|ifv|apc|armor|armour|k2|k1|k21/.test(signature)
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

export function buildBattleSpectatorHeroRelatedEventItems(
  target: BattleSpectatorInspectTarget,
  state: BattleSpectatorState | undefined
) {
  if (!state) {
    return [];
  }

  const relatedEvents = state.recentEvents.filter((event) => {
    if (target.kind === "unit") {
      return (
        event.actorId === target.unit.id || event.targetId === target.unit.id
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

export function resolveBattleSpectatorHeroContextAsset(
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

export function buildBattleSpectatorHeroFallbackFeed(
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
    targetLabel:
      target.targetUnit?.name ?? target.trajectory?.targetName ?? "미상",
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
        value:
          target.targetUnit?.name ?? target.trajectory?.targetName ?? "미상",
      },
    ],
  };
}

export function buildBattleSpectatorHeroView(
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
    const operationMode = resolveBattleSpectatorHeroOperationMode(
      profile,
      asset
    );
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
      {
        label: "시점",
        value: formatBattleSpectatorCameraProfileLabel(cameraProfile),
      },
      {
        label: "고도",
        value: formatBattleSpectatorAltitude(target.unit.altitudeMeters),
      },
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
    {
      label: "시점",
      value: formatBattleSpectatorCameraProfileLabel(cameraProfile),
    },
    {
      label: "고도",
      value: formatBattleSpectatorAltitude(target.weapon.altitudeMeters),
    },
    { label: "속도", value: `${Math.round(target.weapon.speedKts)} kt` },
    {
      label: "ETA",
      value: formatBattleSpectatorEta(target.impactTimeline?.etaSec),
    },
    {
      label: "목표",
      value: target.targetUnit?.name ?? target.trajectory?.targetName ?? "미상",
    },
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

export function resolveBattleSpectatorUnitCameraProfile(
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

export function resolveBattleSpectatorFollowTargetCameraProfile(
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

export function applyBattleSpectatorFollowTargetSelection(
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

export function resolveBattleSpectatorPatrolUnitPreset(
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

export function resolveBattleSpectatorUnitIconType(
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

export function resolveBattleSpectatorUnitFocusFraming(
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

export function resolveBattleSpectatorSceneFocusFraming(
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

export function resolveBattleSpectatorPatrolUnitPriority(
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

export function buildBattleSpectatorPatrolUnitTargets(
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

export function getBattleSpectatorPatrolTargetTone(
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

export function resolveBattleSpectatorSceneEntryLabel(
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

export function resolveBattleSpectatorEventJumpPoint(event: BattleSpectatorEvent) {
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

export function resolveBattleSpectatorSideJumpPoint(
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

export function clampBattleSpectatorValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function distanceKmBetweenBattleSpectatorPoints(
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

export function isBattleSpectatorTrajectoryWeapon(
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

export function formatBattleSpectatorDistanceKm(distanceKm: number | null) {
  if (distanceKm === null || !Number.isFinite(distanceKm)) {
    return "거리 미상";
  }

  return distanceKm >= 10
    ? `${distanceKm.toFixed(0)}km`
    : `${distanceKm.toFixed(1)}km`;
}

export function estimateBattleSpectatorTimeToImpactSec(
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

