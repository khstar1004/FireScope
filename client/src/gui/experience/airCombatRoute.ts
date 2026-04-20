import type { BattleSpectatorUnitSnapshot } from "@/game/Game";
import {
  type AssetExperienceSummary,
  inferAircraftExperienceCraft,
} from "@/gui/experience/assetExperience";
import { selectAssetExperienceModel } from "@/gui/experience/bundleModels";
import { getDefaultImmersiveOperationMode } from "@/gui/experience/immersiveOperations";
import {
  inferImmersiveExperienceProfile,
  type ImmersiveExperienceProfile,
} from "@/gui/experience/immersiveExperience";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";
import type { FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";
import { getJetCraftCatalogEntry } from "@/gui/flightSim/jetCraftCatalog";
import { normalizeFlightSimStartLocation } from "@/gui/flightSim/flightSimLocation";

export interface FocusFireAirwatchLaunchState {
  objectiveName?: string;
  objectiveLon?: number;
  objectiveLat?: number;
}

interface AirCombatRouteInput {
  center?: number[];
  craft?: string;
  focusFireAirwatch?: FocusFireAirwatchLaunchState;
  battleSpectator?: FlightSimBattleSpectatorState;
  asset?: AssetExperienceSummary;
}

function createDemoAircraftSummary(
  center?: number[],
  craft?: string,
  focusFireAirwatch?: FocusFireAirwatchLaunchState
): AssetExperienceSummary {
  const [lon, lat] =
    center ??
    (typeof focusFireAirwatch?.objectiveLon === "number" &&
    typeof focusFireAirwatch?.objectiveLat === "number"
      ? [focusFireAirwatch.objectiveLon, focusFireAirwatch.objectiveLat]
      : []);
  const normalizedStart = normalizeFlightSimStartLocation(
    Number.isFinite(lon) && Number.isFinite(lat) ? { lon, lat } : undefined
  );
  const inferredCraft = inferAircraftExperienceCraft(craft ?? "");

  if (inferredCraft === "drone") {
    return {
      kind: "aircraft",
      id: "demo-air-combat-drone",
      name: focusFireAirwatch?.objectiveName
        ? `${focusFireAirwatch.objectiveName} 감시 드론`
        : "MQ-9 감시 편대",
      className: "MQ-9 Reaper",
      sideName: "DEMO",
      latitude: normalizedStart.lat,
      longitude: normalizedStart.lon,
      altitude: 1800,
      heading: 18,
      speed: 210,
      range: 14,
      currentFuel: 3600,
      maxFuel: 4200,
      fuelRate: 180,
      weaponCount: 4,
    };
  }

  const craftEntry = getJetCraftCatalogEntry(inferredCraft);

  return {
    kind: "aircraft",
    id: `demo-air-combat-${craftEntry.id}`,
    name: focusFireAirwatch?.objectiveName
      ? `${focusFireAirwatch.objectiveName} CAP`
      : `${craftEntry.hudLabel} 전술 편대`,
    className: craftEntry.label,
    sideName: "DEMO",
    latitude: normalizedStart.lat,
    longitude: normalizedStart.lon,
    altitude: 3200,
    heading: 32,
    speed:
      craftEntry.id === "f35"
        ? 520
        : craftEntry.id === "kf21"
          ? 560
          : craftEntry.id === "f16"
            ? 585
            : 600,
    range: craftEntry.id === "f35" ? 20 : 24,
    currentFuel: craftEntry.id === "f35" ? 9800 : 11200,
    maxFuel: craftEntry.id === "f35" ? 13200 : 14500,
    fuelRate: craftEntry.id === "f35" ? 1080 : 1240,
    weaponCount: craftEntry.id === "f35" ? 6 : 8,
  };
}

function toAssetKind(
  entityType: BattleSpectatorUnitSnapshot["entityType"]
): AssetExperienceSummary["kind"] {
  switch (entityType) {
    case "aircraft":
      return "aircraft";
    case "ship":
      return "ship";
    case "airbase":
      return "airbase";
    case "facility":
      return "facility";
    case "army":
    default:
      return "facility";
  }
}

function toAssetSummary(unit: BattleSpectatorUnitSnapshot): AssetExperienceSummary {
  return {
    kind: toAssetKind(unit.entityType),
    id: unit.id,
    name: unit.name,
    className: unit.className,
    sideName: unit.sideName,
    latitude: unit.latitude,
    longitude: unit.longitude,
    altitude: unit.altitudeMeters,
    heading: unit.headingDeg,
    speed: unit.speedKts,
    range: unit.engagementRangeNm,
    currentFuel: unit.currentFuel,
    maxFuel: unit.maxFuel,
    weaponCount: unit.weaponCount,
    aircraftCount: unit.aircraftCount,
  };
}

function findBattleSpectatorFocusUnit(
  snapshot: FlightSimBattleSpectatorState,
  craft?: string
) {
  const selectedUnit =
    snapshot.units.find((unit) => unit.id === snapshot.selectedUnitId) ??
    snapshot.units.find((unit) => unit.selected) ??
    null;
  const aircraftUnits = snapshot.units.filter(
    (unit) => unit.entityType === "aircraft"
  );
  const matchingAircraftUnits =
    inferAircraftExperienceCraft(craft ?? "") === "drone"
      ? aircraftUnits.filter(
          (unit) => inferAircraftExperienceCraft(unit.className) === "drone"
        )
      : aircraftUnits;

  return (
    matchingAircraftUnits[0] ??
    (selectedUnit?.entityType === "aircraft" ? selectedUnit : null) ??
    selectedUnit ??
    aircraftUnits[0] ??
    snapshot.units[0] ??
    null
  );
}

function resolveAirProfile(asset: AssetExperienceSummary): ImmersiveExperienceProfile {
  if (asset.kind === "aircraft") {
    return "base";
  }

  return inferImmersiveExperienceProfile(asset);
}

function resolveOperationMode(
  asset: AssetExperienceSummary,
  craft?: string
) {
  if (asset.kind === "aircraft") {
    return inferAircraftExperienceCraft(craft ?? asset.className) === "drone"
      ? "drone-watch"
      : "quick-scramble";
  }

  return getDefaultImmersiveOperationMode(resolveAirProfile(asset));
}

export function buildAirCombatTacticalRoute({
  center,
  craft,
  focusFireAirwatch,
  battleSpectator,
  asset,
}: AirCombatRouteInput): TacticalSimRoute {
  const focusUnit = battleSpectator
    ? findBattleSpectatorFocusUnit(battleSpectator, craft)
    : null;
  const resolvedAsset =
    asset ??
    (focusUnit ? toAssetSummary(focusUnit) : null) ??
    createDemoAircraftSummary(center, craft, focusFireAirwatch);
  const profile = resolveAirProfile(resolvedAsset);
  const selectedModel = selectAssetExperienceModel(resolvedAsset);

  return {
    asset: resolvedAsset,
    profile,
    operationMode: resolveOperationMode(resolvedAsset, craft),
    modelId: focusUnit?.modelId ?? selectedModel?.id,
  };
}
