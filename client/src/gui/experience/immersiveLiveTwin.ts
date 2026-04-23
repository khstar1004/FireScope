import type {
  BattleSpectatorSnapshot,
  BattleSpectatorUnitSnapshot,
} from "@/game/Game";
import type {
  AssetExperienceKind,
  AssetExperienceSummary,
} from "@/gui/experience/assetExperience";
import type {
  BundleModelBundle,
  BundleModelSelection,
} from "@/gui/experience/bundleModels";
import {
  getBundleModelById,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import {
  buildVistaSummary,
  clampVistaMetric,
  getVistaModelRole,
  getVistaRangeReference,
  getVistaSectionLabels,
  getVistaStatusLabel,
  getVistaTaskLabel,
  getVistaWeaponReference,
  type VistaLineupEntry,
  type VistaSummary,
} from "@/gui/experience/vistaState";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import { getDistanceBetweenTwoPoints } from "@/utils/mapFunctions";

export interface ImmersiveLiveTwinComparisonSelection {
  id: string;
  bundle: BundleModelBundle;
  path: string;
  label: string;
}

export interface ImmersiveLiveTwinFeedMetric {
  label: string;
  value: string;
}

export interface ImmersiveLiveTwinFeed {
  sourceLabel: string;
  timeLabel: string;
  targetLabel: string;
  eventHeadline: string;
  eventItems: string[];
  metrics: ImmersiveLiveTwinFeedMetric[];
}

export interface ImmersiveLiveTwinRuntime {
  source: "battle-snapshot";
  focusUnitId: string;
  focusAsset: AssetExperienceSummary;
  comparisonSelections: ImmersiveLiveTwinComparisonSelection[];
  lineup: VistaLineupEntry[];
  summary: VistaSummary;
  feed: ImmersiveLiveTwinFeed;
}

const MAX_LIVE_LINEUP_UNITS = 5;
const MAX_LIVE_COMPARISON_MODELS = 4;
const MAX_LIVE_EVENT_ITEMS = 3;

function formatSnapshotTime(timestamp: number) {
  if (!Number.isFinite(timestamp)) {
    return "--:--:--";
  }

  return new Date(timestamp * 1000).toISOString().slice(11, 19);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function resolveAssetKind(
  unit: BattleSpectatorUnitSnapshot
): AssetExperienceKind {
  switch (unit.entityType) {
    case "aircraft":
      return "aircraft";
    case "ship":
      return "ship";
    case "airbase":
      return "airbase";
    case "army":
    case "facility":
      return "facility";
  }
}

function buildSnapshotAsset(
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
    kind: resolveAssetKind(unit),
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

function resolveUnitModel(
  unit: BattleSpectatorUnitSnapshot,
  profile: ImmersiveExperienceProfile
) {
  const liveModel = getBundleModelById(unit.modelId);
  if (liveModel) {
    return liveModel;
  }

  const snapshotAsset = buildSnapshotAsset(unit);
  return (
    selectImmersiveExperienceModel(snapshotAsset, unit.profileHint) ??
    selectImmersiveExperienceModel(snapshotAsset, profile)
  );
}

function findFocusUnit(
  snapshot: BattleSpectatorSnapshot,
  asset: AssetExperienceSummary
) {
  return (
    snapshot.units.find((unit) => unit.id === asset.id) ??
    snapshot.units.find(
      (unit) =>
        unit.className === asset.className && unit.name === asset.name
    ) ??
    snapshot.units.find((unit) => unit.selected) ??
    null
  );
}

function matchesProfile(
  unit: BattleSpectatorUnitSnapshot,
  profile: ImmersiveExperienceProfile
) {
  switch (profile) {
    case "ground":
      return unit.groundUnit || unit.profileHint === "ground";
    case "fires":
      return unit.profileHint === "fires" || unit.statusFlags.includes("fires");
    case "defense":
      return (
        unit.profileHint === "defense" || unit.statusFlags.includes("air-defense")
      );
    case "maritime":
      return unit.entityType === "ship" || unit.profileHint === "maritime";
    case "base":
      return unit.entityType === "aircraft" || unit.entityType === "airbase";
  }
}

function scoreFriendlyUnit(
  unit: BattleSpectatorUnitSnapshot,
  focusUnit: BattleSpectatorUnitSnapshot,
  profile: ImmersiveExperienceProfile
) {
  const distanceKm = getDistanceBetweenTwoPoints(
    focusUnit.latitude,
    focusUnit.longitude,
    unit.latitude,
    unit.longitude
  );
  let score = Math.max(0, 40 - distanceKm * 0.8);

  if (matchesProfile(unit, profile)) {
    score += 72;
  }
  if (unit.id === focusUnit.homeBaseId) {
    score += profile === "base" ? 90 : 28;
  }
  if (unit.statusFlags.includes("engaged")) {
    score += 20;
  }
  if (unit.statusFlags.includes("selected")) {
    score += 12;
  }
  if (unit.statusFlags.includes("air-defense") && profile === "defense") {
    score += 24;
  }
  if (unit.statusFlags.includes("fires") && profile === "fires") {
    score += 24;
  }
  if (unit.groundUnit && profile === "ground") {
    score += 24;
  }
  if (unit.entityType === "aircraft" && profile === "base") {
    score += 18;
  }
  if (unit.entityType === "ship" && profile === "maritime") {
    score += 18;
  }
  if (unit.entityType === "airbase" && profile === "base") {
    score += 16;
  }

  return score;
}

function buildFuelPct(unit: BattleSpectatorUnitSnapshot) {
  if (typeof unit.fuelFraction === "number" && Number.isFinite(unit.fuelFraction)) {
    return Math.round(
      clampVistaMetric(unit.fuelFraction * 100, 12, 100)
    );
  }

  if (unit.entityType === "airbase") {
    return Math.round(
      clampVistaMetric(((unit.aircraftCount ?? 0) / 12) * 100, 42, 98)
    );
  }

  return unit.entityType === "ship"
    ? 76
    : unit.groundUnit
      ? 72
      : unit.entityType === "aircraft"
        ? 78
        : 80;
}

function buildOrdnancePct(
  unit: BattleSpectatorUnitSnapshot,
  profile: ImmersiveExperienceProfile
) {
  const quantity = unit.weaponInventory.reduce((sum, item) => sum + item.quantity, 0);
  const maxQuantity = unit.weaponInventory.reduce(
    (sum, item) => sum + item.maxQuantity,
    0
  );

  if (maxQuantity > 0) {
    return Math.round(
      clampVistaMetric((quantity / maxQuantity) * 100, 12, 100)
    );
  }

  if (unit.entityType === "airbase") {
    return Math.round(
      clampVistaMetric(((unit.aircraftCount ?? 0) / 10) * 100, 36, 98)
    );
  }

  return Math.round(
    clampVistaMetric(
      (unit.weaponCount / Math.max(1, getVistaWeaponReference(profile))) *
        100,
      24,
      100
    )
  );
}

function buildCoveragePct(
  unit: BattleSpectatorUnitSnapshot,
  profile: ImmersiveExperienceProfile
) {
  const rangeReference = Math.max(unit.detectionRangeNm, unit.engagementRangeNm);

  if (rangeReference > 0) {
    return Math.round(
      clampVistaMetric(
        (rangeReference / getVistaRangeReference(profile)) * 100,
        24,
        100
      )
    );
  }

  if (unit.entityType === "airbase") {
    return Math.round(
      clampVistaMetric(((unit.aircraftCount ?? 0) / 8) * 100, 48, 96)
    );
  }

  return profile === "ground" ? 62 : 70;
}

function buildLiveStatusLabel(
  unit: BattleSpectatorUnitSnapshot,
  profile: ImmersiveExperienceProfile,
  readinessPct: number,
  fuelPct: number,
  ordnancePct: number
) {
  if (unit.statusFlags.includes("critical-damage")) {
    return "전투 손실";
  }
  if (unit.statusFlags.includes("runway-degraded")) {
    return "활주로 피해";
  }
  if (unit.statusFlags.includes("rtb")) {
    return "복귀 중";
  }
  if (unit.statusFlags.includes("low-fuel") || fuelPct < 42) {
    return profile === "base" ? "정비 복귀" : "재보급";
  }
  if (unit.statusFlags.includes("empty-launcher") || ordnancePct < 35) {
    return profile === "defense" ? "재장전" : "재무장";
  }
  if (unit.statusFlags.includes("engaged")) {
    switch (profile) {
      case "defense":
        return "교전 중";
      case "base":
        return "출격 수행";
      case "maritime":
        return "해상 교전";
      default:
        return "작전 수행";
    }
  }

  return getVistaStatusLabel(profile, readinessPct, fuelPct, ordnancePct);
}

function buildLiveTaskLabel(
  unit: BattleSpectatorUnitSnapshot,
  focusUnit: BattleSpectatorUnitSnapshot,
  profile: ImmersiveExperienceProfile,
  operationMode: string,
  index: number,
  primary: boolean
) {
  if (unit.id === focusUnit.homeBaseId) {
    return profile === "base" ? "회복·재출격 지원" : "후방 회복 거점";
  }
  if (unit.statusFlags.includes("engaged")) {
    switch (profile) {
      case "ground":
        return primary ? "주공 돌파" : "측방 교전";
      case "fires":
        return primary ? "실사격 집행" : "후속 포격";
      case "defense":
        return primary ? "실시간 교전 통제" : "요격 전개";
      case "maritime":
        return primary ? "전투단 주기동" : "해상 엄호";
      case "base":
        return primary ? "즉응 출격" : "편대 지원";
    }
  }
  if (unit.statusFlags.includes("rtb")) {
    return "복귀 라인";
  }

  return getVistaTaskLabel(profile, operationMode, index, primary);
}

function buildLineupEntries(
  focusUnit: BattleSpectatorUnitSnapshot,
  supportingUnits: BattleSpectatorUnitSnapshot[],
  profile: ImmersiveExperienceProfile,
  operationMode: string
) {
  const sectionLabels = getVistaSectionLabels(profile);
  const lineupUnits = [focusUnit, ...supportingUnits].slice(0, MAX_LIVE_LINEUP_UNITS);

  return lineupUnits.map((unit, index) => {
    const primary = index === 0;
    const resolvedModel = resolveUnitModel(unit, profile);
    const fuelPct = buildFuelPct(unit);
    const ordnancePct = buildOrdnancePct(unit, profile);
    const coveragePct = buildCoveragePct(unit, profile);
    const readinessPct = Math.round(
      clampVistaMetric(
        unit.hpFraction * 100 * 0.38 +
          fuelPct * 0.24 +
          ordnancePct * 0.19 +
          coveragePct * 0.19,
        0,
        100
      )
    );

    return {
      id: unit.id,
      label: unit.name,
      section: sectionLabels[index] ?? sectionLabels[sectionLabels.length - 1],
      role: resolvedModel
        ? getVistaModelRole(profile, resolvedModel)
        : unit.profileHint === "defense"
          ? "방어 지원"
          : unit.profileHint === "fires"
            ? "화력 지원"
            : unit.groundUnit
              ? "지상 전력"
              : unit.entityType,
      task: buildLiveTaskLabel(
        unit,
        focusUnit,
        profile,
        operationMode,
        index,
        primary
      ),
      status: buildLiveStatusLabel(
        unit,
        profile,
        readinessPct,
        fuelPct,
        ordnancePct
      ),
      readinessPct,
      fuelPct,
      ordnancePct,
      coveragePct,
      primary,
    } satisfies VistaLineupEntry;
  });
}

function buildComparisonSelections(
  supportingUnits: BattleSpectatorUnitSnapshot[],
  profile: ImmersiveExperienceProfile,
  activeModel: BundleModelSelection | null,
  selectedModels: BundleModelSelection[]
) {
  const selections: ImmersiveLiveTwinComparisonSelection[] = [];
  const usedModelIds = new Set<string>(
    activeModel ? [activeModel.id] : []
  );

  supportingUnits.forEach((unit) => {
    if (
      selections.length >= MAX_LIVE_COMPARISON_MODELS ||
      unit.entityType === "airbase"
    ) {
      return;
    }

    const model = resolveUnitModel(unit, profile);
    if (!model || usedModelIds.has(model.id)) {
      return;
    }

    usedModelIds.add(model.id);
    selections.push({
      id: unit.id,
      bundle: model.bundle,
      path: model.path,
      label: unit.name,
    });
  });

  selectedModels.forEach((model) => {
    if (
      selections.length >= MAX_LIVE_COMPARISON_MODELS ||
      (activeModel && model.id === activeModel.id) ||
      usedModelIds.has(model.id)
    ) {
      return;
    }

    usedModelIds.add(model.id);
    selections.push({
      id: model.id,
      bundle: model.bundle,
      path: model.path,
      label: model.label,
    });
  });

  return selections;
}

function buildFeed(
  snapshot: BattleSpectatorSnapshot,
  focusUnit: BattleSpectatorUnitSnapshot,
  supportingUnits: BattleSpectatorUnitSnapshot[],
  lineup: VistaLineupEntry[]
): ImmersiveLiveTwinFeed {
  const hostileUnits = snapshot.units.filter((unit) => unit.sideId !== focusUnit.sideId);
  const targetUnit =
    (focusUnit.targetId
      ? snapshot.units.find((unit) => unit.id === focusUnit.targetId) ?? null
      : null) ??
    null;
  const relevantEvents = snapshot.recentEvents
    .filter(
      (event) =>
        event.actorId === focusUnit.id ||
        event.targetId === focusUnit.id ||
        event.sideId === focusUnit.sideId ||
        event.targetId === focusUnit.targetId
    )
    .slice(-MAX_LIVE_EVENT_ITEMS)
    .reverse();
  const eventItems = (relevantEvents.length > 0
    ? relevantEvents
    : [...snapshot.recentEvents].slice(-MAX_LIVE_EVENT_ITEMS).reverse()
  ).map((event) => `${formatSnapshotTime(event.timestamp)} · ${event.message}`);
  const readinessAverage = Math.round(
    average(lineup.map((entry) => entry.readinessPct))
  );

  return {
    sourceLabel: "LIVE SNAPSHOT",
    timeLabel: formatSnapshotTime(snapshot.currentTime),
    targetLabel: targetUnit?.name ?? "표적 미지정",
    eventHeadline:
      eventItems[0] ??
      (snapshot.weapons.length > 0
        ? `${snapshot.weapons.length}개 무장이 실시간 추적 중입니다.`
        : `${focusUnit.name} 전장 링크가 활성화되었습니다.`),
    eventItems:
      eventItems.length > 0 ? eventItems : ["최근 교전 이벤트가 아직 없습니다."],
    metrics: [
      {
        label: "Friendly",
        value: `${snapshot.units.filter((unit) => unit.sideId === focusUnit.sideId).length}`,
      },
      { label: "Hostile", value: `${hostileUnits.length}` },
      { label: "Linked", value: `${supportingUnits.length + 1}` },
      { label: "Weapons", value: `${snapshot.weapons.length}` },
      { label: "Readiness", value: `${readinessAverage}%` },
    ],
  };
}

export function buildImmersiveLiveTwinRuntime(
  snapshot: BattleSpectatorSnapshot | undefined,
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  activeModel: BundleModelSelection | null,
  selectedModels: BundleModelSelection[],
  operationMode: string
): ImmersiveLiveTwinRuntime | null {
  if (!snapshot) {
    return null;
  }

  const focusUnit = findFocusUnit(snapshot, asset);
  if (!focusUnit) {
    return null;
  }

  const supportingUnits = snapshot.units
    .filter((unit) => unit.id !== focusUnit.id)
    .filter((unit) => unit.sideId === focusUnit.sideId)
    .filter((unit) => resolveUnitModel(unit, profile) !== null || unit.entityType === "airbase")
    .sort(
      (left, right) =>
        scoreFriendlyUnit(right, focusUnit, profile) -
        scoreFriendlyUnit(left, focusUnit, profile)
    )
    .slice(0, MAX_LIVE_LINEUP_UNITS - 1);
  const lineup = buildLineupEntries(
    focusUnit,
    supportingUnits,
    profile,
    operationMode
  );
  const focusAsset = buildSnapshotAsset(focusUnit);

  return {
    source: "battle-snapshot",
    focusUnitId: focusUnit.id,
    focusAsset,
    comparisonSelections: buildComparisonSelections(
      supportingUnits,
      profile,
      activeModel,
      selectedModels
    ),
    lineup,
    summary: buildVistaSummary(focusAsset, profile, lineup),
    feed: buildFeed(snapshot, focusUnit, supportingUnits, lineup),
  };
}
