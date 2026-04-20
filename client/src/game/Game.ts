import { randomUUID } from "@/utils/generateUUID";
import Aircraft from "@/game/units/Aircraft";
import Army from "@/game/units/Army";
import Facility from "@/game/units/Facility";
import Scenario from "@/game/Scenario";

import {
  getBearingBetweenTwoPoints,
  getNextCoordinates,
  getDistanceBetweenTwoPoints,
  getTerminalCoordinatesFromDistanceAndBearing,
  randomInt,
} from "@/utils/mapFunctions";
import {
  aircraftPursuit,
  isThreatDetected,
  checkTargetTrackedByCount,
  launchWeapon,
  type Target,
  platformCanEngageTarget,
  routeAircraftToStrikePosition,
  weaponEngagement,
  weaponCanEngageTarget,
} from "@/game/engine/weaponEngagement";
import Airbase from "@/game/units/Airbase";
import Side from "@/game/Side";
import Weapon from "@/game/units/Weapon";
import {
  GAME_SPEED_DELAY_MS,
  KILOMETERS_TO_NAUTICAL_MILES,
  NAUTICAL_MILES_TO_METERS,
} from "@/utils/constants";
import Ship from "@/game/units/Ship";
import ReferencePoint from "@/game/units/ReferencePoint";
import PatrolMission from "@/game/mission/PatrolMission";
import StrikeMission from "@/game/mission/StrikeMission";
import PlaybackRecorder from "@/game/playback/PlaybackRecorder";
import RecordingPlayer from "@/game/playback/RecordingPlayer";
import { SIDE_COLOR } from "@/utils/colors";
import Relationships from "@/game/Relationships";
import Dba from "@/game/db/Dba";
import SimulationLogs, { SimulationLogType } from "@/game/log/SimulationLogs";
import { DoctrineType, SideDoctrine } from "@/game/Doctrine";
import {
  getFacilityDetectionArcDegrees,
  getFacilityThreatRange,
} from "@/game/db/facilityThreatProfiles";
import {
  inferBattle3dProfileHint,
  isGroundVisualProfileId,
  resolveUnitVisualProfileId,
  type Battle3dProfileHint,
  type UnitVisualProfileId,
} from "@/game/db/unitVisualProfiles";
import {
  getScenarioFacilityPlacementGroups,
  setScenarioFacilityPlacementGroups,
} from "@/game/facilityPlacementGroups";
import { getDisplayName } from "@/utils/koreanCatalog";
import {
  processFuelExhaustion,
  processPatrolMissionSuccess,
  processStrikeMissionSuccess,
} from "@/game/engine/scoreCalculator";
import { none } from "ol/centerconstraint";
import {
  isDroneAircraftClassName,
  isFiresFacilityClassName,
  isSupportAircraftClassName,
  isTankFacilityClassName,
} from "@/utils/assetTypeCatalog";
import { isTargetInsideSector } from "@/utils/threatCoverage";
import {
  FOCUS_FIRE_RERANKER_FEATURE_NAMES,
  type FocusFireRerankerModel,
  createDefaultFocusFireRerankerModel,
  explainFocusFireRerankerCandidate,
  getFocusFireRerankerConfidence,
  rerankFocusFireCandidates,
  trainFocusFireRerankerFromTelemetry,
} from "@/game/focusFireReranker";

const MAX_HISTORY_SIZE = 20;
const FOCUS_FIRE_OBJECTIVE_NAME = "집중포격 목표";
const FOCUS_FIRE_CAPTURE_RADIUS_KM = 1.6;
const FOCUS_FIRE_TARGET_ANALYSIS_RADIUS_KM = 5;
const FEET_TO_METERS = 0.3048;

interface IMapView {
  defaultCenter: number[];
  currentCameraCenter: number[];
  defaultZoom: number;
  currentCameraZoom: number;
}

interface IAttackParams {
  autoAttack: boolean;
  currentAttackerId: string;
  currentWeaponId: string;
  currentWeaponQuantity: number;
}

export type Mission = PatrolMission | StrikeMission;

export type GameDoneReason = "in_progress" | "terminated" | "truncated";

export type GameDoneReasonDetail =
  | "in_progress"
  | "time_limit"
  | "single_side_remaining"
  | "no_active_sides";

export interface GameStepInfo {
  doneReason: GameDoneReason;
  doneReasonDetail: GameDoneReasonDetail;
  activeSideIds: string[];
  activeSideNames: string[];
}

export type GameStepResult = [Scenario, number, boolean, boolean, GameStepInfo];

export interface FocusFireOperation {
  enabled: boolean;
  active: boolean;
  sideId: string | null;
  objectiveReferencePointId: string | null;
  desiredEffectOverride: number | null;
  captureProgress: number;
  launchedPlatformIds: string[];
}

export type FocusFireLaunchVariant = "artillery" | "aircraft" | "armor";

export interface FocusFireLaunchPlatform {
  id: string;
  name: string;
  className: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  variant: FocusFireLaunchVariant;
  launched: boolean;
}

export interface FocusFireWeaponTrack {
  id: string;
  launcherId: string;
  launcherName: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  launcherLatitude: number;
  launcherLongitude: number;
  launcherAltitudeMeters: number;
  targetLatitude: number;
  targetLongitude: number;
  variant: FocusFireLaunchVariant;
}

export type BattleSpectatorEntityType =
  | "aircraft"
  | "army"
  | "facility"
  | "airbase"
  | "ship";

export interface BattleSpectatorPointSnapshot {
  latitude: number;
  longitude: number;
  altitudeMeters: number;
}

export interface BattleSpectatorWeaponInventorySnapshot {
  id: string;
  name: string;
  className: string;
  quantity: number;
  maxQuantity: number;
  modelId?: UnitVisualProfileId;
}

export interface BattleSpectatorUnitSnapshot {
  id: string;
  name: string;
  className: string;
  entityType: BattleSpectatorEntityType;
  modelId?: UnitVisualProfileId;
  profileHint: Battle3dProfileHint;
  groundUnit: boolean;
  sideId: string;
  sideName: string;
  sideColor: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  headingDeg: number;
  speedKts: number;
  weaponCount: number;
  hpFraction: number;
  damageFraction: number;
  detectionRangeNm: number;
  detectionArcDegrees: number;
  detectionHeadingDeg: number;
  engagementRangeNm: number;
  currentFuel?: number;
  maxFuel?: number;
  fuelFraction?: number;
  route: BattleSpectatorPointSnapshot[];
  desiredRoute: BattleSpectatorPointSnapshot[];
  weaponInventory: BattleSpectatorWeaponInventorySnapshot[];
  aircraftCount?: number;
  homeBaseId?: string;
  rtb?: boolean;
  statusFlags: string[];
  selected: boolean;
  targetId?: string;
}

export interface BattleSpectatorWeaponSnapshot {
  id: string;
  name: string;
  className: string;
  modelId?: UnitVisualProfileId;
  launcherId: string;
  launcherName: string;
  sideId: string;
  sideName: string;
  sideColor: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  launchLatitude: number;
  launchLongitude: number;
  launchAltitudeMeters: number;
  headingDeg: number;
  speedKts: number;
  hpFraction: number;
  targetId: string | null;
  targetLatitude?: number;
  targetLongitude?: number;
}

export interface BattleSpectatorEvent {
  id: string;
  timestamp: number;
  sideId: string;
  sideName: string;
  sideColor: string;
  type: SimulationLogType;
  message: string;
  actorId?: string;
  actorName?: string;
  sourceLatitude?: number;
  sourceLongitude?: number;
  sourceAltitudeMeters?: number;
  targetId?: string;
  targetName?: string;
  targetLatitude?: number;
  targetLongitude?: number;
  targetAltitudeMeters?: number;
  weaponId?: string;
  focusLatitude?: number;
  focusLongitude?: number;
  focusAltitudeMeters?: number;
  resultTag?: string;
}

export interface BattleSpectatorSnapshot {
  schemaVersion: number;
  scenarioId: string;
  scenarioName: string;
  currentTime: number;
  currentSideId: string;
  currentSideName: string;
  selectedUnitId: string;
  centerLongitude: number | null;
  centerLatitude: number | null;
  units: BattleSpectatorUnitSnapshot[];
  weapons: BattleSpectatorWeaponSnapshot[];
  recentEvents: BattleSpectatorEvent[];
  stats: {
    aircraft: number;
    facilities: number;
    airbases: number;
    ships: number;
    groundUnits: number;
    weaponsInFlight: number;
    sides: number;
  };
}

interface FocusFireAnalysisTarget {
  id: string;
  name: string;
  sideId: string;
  className: string;
  latitude: number;
  longitude: number;
  entityType: "aircraft" | "army" | "facility" | "airbase" | "ship";
  weaponInventory: number;
}

interface FocusFireObjectivePoint {
  name: string | null;
  latitude: number;
  longitude: number;
}

interface FocusFireRecommendationAccumulator {
  weaponName: string;
  shotCount: number;
  expectedStrikeEffect: number;
  weightedDistanceSum: number;
  minimumDistanceKm: number;
  maximumDistanceKm: number;
  immediateLaunchReadyCount: number;
  repositionRequiredCount: number;
  blockedLauncherCount: number;
  totalTimeToFireSeconds: number;
  maximumTimeToFireSeconds: number | null;
  threatExposureScore: number;
  firingPlan: FocusFireFiringPlanItem[];
}

export interface FocusFireTargetComposition {
  label: string;
  count: number;
  combatPower: number;
}

export type FocusFireExecutionState = "ready" | "reposition" | "blocked";

export interface FocusFireFiringPlanItem {
  launcherId: string;
  launcherName: string;
  launcherClassName: string;
  variant: FocusFireLaunchVariant;
  ammoType: string;
  weaponName: string;
  shotCount: number;
  distanceKm: number;
  expectedStrikeEffect: number;
  executionState: FocusFireExecutionState;
  estimatedTimeToFireSeconds: number | null;
  threatExposureScore: number;
}

export interface FocusFireRecommendationOption {
  label: string;
  ammoType: string | null;
  weaponName: string | null;
  shotCount: number;
  launcherCount: number;
  firingUnitNames: string[];
  averageDistanceKm: number | null;
  minimumDistanceKm: number | null;
  maximumDistanceKm: number | null;
  immediateLaunchReadyCount: number;
  repositionRequiredCount: number;
  blockedLauncherCount: number;
  averageTimeToFireSeconds: number | null;
  maximumTimeToFireSeconds: number | null;
  threatExposureScore: number;
  executionReadinessLabel: string;
  expectedStrikeEffect: number;
  heuristicScore: number;
  rerankerScore: number | null;
  suitabilityScore: number;
  aiReasonSummary?: string | null;
  aiPositiveSignals?: string[];
  aiNegativeSignals?: string[];
  rationale: string;
  firingPlan: FocusFireFiringPlanItem[];
}

export interface FocusFireRecommendation {
  recommendedOptionLabel: string | null;
  primaryTargetId: string | null;
  priorityScore: number;
  missionKind: string;
  targetPriorityLabel: string;
  desiredEffectLabel: string;
  ammoType: string | null;
  desiredEffectEstimated: number;
  desiredEffectIsUserDefined: boolean;
  firingUnitNames: string[];
  targetName: string | null;
  targetSideNames: string[];
  targetCount: number;
  targetComposition: FocusFireTargetComposition[];
  targetLatitude: number | null;
  targetLongitude: number | null;
  targetCombatPower: number;
  desiredEffect: number;
  targetDistanceKm: number | null;
  minimumTargetDistanceKm: number | null;
  maximumTargetDistanceKm: number | null;
  immediateLaunchReadyCount: number;
  repositionRequiredCount: number;
  blockedLauncherCount: number;
  averageTimeToFireSeconds: number | null;
  threatExposureScore: number;
  launchReadinessLabel: string;
  selectionModelLabel: string;
  rerankerApplied: boolean;
  weaponName: string | null;
  shotCount: number;
  expectedStrikeEffect: number;
  options: FocusFireRecommendationOption[];
}

export interface FireRecommendationTargetPriority {
  targetId: string;
  targetName: string;
  targetClassName: string;
  targetSideId: string;
  targetSideName: string;
  priorityRank: number;
  priorityScore: number;
  recommendation: FocusFireRecommendation;
}

export interface FocusFireSummary {
  enabled: boolean;
  active: boolean;
  objectiveName: string | null;
  objectiveLatitude: number | null;
  objectiveLongitude: number | null;
  desiredEffectOverride: number | null;
  captureProgress: number;
  artilleryCount: number;
  armorCount: number;
  aircraftCount: number;
  weaponsInFlight: number;
  statusLabel: string;
  launchPlatforms: FocusFireLaunchPlatform[];
  weaponTracks: FocusFireWeaponTrack[];
  recommendation: FocusFireRecommendation | null;
}

export interface FocusFireRecommendationTelemetryOption {
  label: string;
  weaponName: string | null;
  ammoType: string | null;
  suitabilityScore: number;
  heuristicScore: number;
  rerankerScore: number | null;
  executionReadinessLabel: string;
  averageTimeToFireSeconds: number | null;
  threatExposureScore: number;
  shotCount: number;
  expectedStrikeEffect: number;
  launcherCount: number;
  immediateLaunchReadyCount: number;
  repositionRequiredCount: number;
  blockedLauncherCount: number;
  averageDistanceKm: number | null;
}

export interface FocusFireRecommendationTelemetryRecord {
  id: string;
  timestamp: number;
  sideId: string | null;
  objectiveName: string | null;
  objectiveLatitude: number | null;
  objectiveLongitude: number | null;
  primaryTargetId: string | null;
  targetName: string | null;
  missionKind: string | null;
  recommendedOptionLabel: string | null;
  weaponName: string | null;
  ammoType: string | null;
  priorityScore: number | null;
  desiredEffect: number | null;
  expectedStrikeEffect: number | null;
  launchReadinessLabel: string | null;
  averageTimeToFireSeconds: number | null;
  threatExposureScore: number | null;
  selectionModelLabel: string | null;
  rerankerApplied: boolean;
  immediateLaunchReadyCount: number;
  repositionRequiredCount: number;
  blockedLauncherCount: number;
  rerankerModelVersion: number | null;
  feedbackOptionLabel: string | null;
  feedbackCapturedAt: number | null;
  options: FocusFireRecommendationTelemetryOption[];
}

function getFocusFireAltitudeMeters(altitudeFeet: number) {
  return Math.max(0, altitudeFeet) * FEET_TO_METERS;
}

function roundToDigits(value: number, digits: number) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function getFocusFireTravelTimeSeconds(distanceKm: number, speedKts: number) {
  if (!(distanceKm > 0) || !(speedKts > 0)) {
    return 0;
  }

  return ((distanceKm * KILOMETERS_TO_NAUTICAL_MILES) / speedKts) * 3600;
}

function getFocusFireExecutionReadinessLabel(
  immediateLaunchReadyCount: number,
  repositionRequiredCount: number,
  blockedLauncherCount: number
) {
  if (
    immediateLaunchReadyCount > 0 &&
    repositionRequiredCount === 0 &&
    blockedLauncherCount === 0
  ) {
    return "즉시 발사 가능";
  }
  if (immediateLaunchReadyCount > 0 && repositionRequiredCount > 0) {
    return "즉시/기동 혼합";
  }
  if (immediateLaunchReadyCount > 0 && blockedLauncherCount > 0) {
    return "일부 즉시 발사";
  }
  if (repositionRequiredCount > 0) {
    return blockedLauncherCount > 0 ? "기동 후 제한적 발사" : "기동 후 발사";
  }
  return "현재 발사 곤란";
}

function getFocusFireAnalysisTargetBaseValue(target: FocusFireAnalysisTarget) {
  switch (target.entityType) {
    case "airbase":
      return 40;
    case "ship":
      return 28;
    case "aircraft":
      return 20;
    case "army":
    case "facility":
      if (isFiresFacilityClassName(target.className)) {
        return 22;
      }
      if (isTankFacilityClassName(target.className)) {
        return 18;
      }
      return 12;
  }
}

function getFocusFireAnalysisTargetCombatValue(
  target: FocusFireAnalysisTarget
) {
  return (
    getFocusFireAnalysisTargetBaseValue(target) +
    Math.min(target.weaponInventory, 24) * 0.6
  );
}

function buildFocusFireTargetLabel(
  primaryTarget: FocusFireAnalysisTarget | undefined,
  targetCount: number,
  objectiveName: string | null
) {
  if (!primaryTarget) {
    return objectiveName;
  }

  const primaryLabel = getDisplayName(primaryTarget.name);
  if (targetCount <= 1) {
    return primaryLabel;
  }

  return `${primaryLabel} 외 ${targetCount - 1}`;
}

function getFocusFireAnalysisTargetCategoryLabel(
  target: FocusFireAnalysisTarget
) {
  switch (target.entityType) {
    case "aircraft":
      return "항공기";
    case "airbase":
      return "기지";
    case "ship":
      return "함정";
    case "army":
      if (isFiresFacilityClassName(target.className)) {
        return "화력 부대";
      }
      if (isTankFacilityClassName(target.className)) {
        return "기갑 부대";
      }
      return "지상군";
    case "facility":
      if (isFiresFacilityClassName(target.className)) {
        return "화력 시설";
      }
      if (isTankFacilityClassName(target.className)) {
        return "기갑 시설";
      }
      return "지상 시설";
  }
}

type FocusFireWeaponProfile =
  | "cluster"
  | "precision"
  | "antiArmor"
  | "antiShip"
  | "general";

function getFocusFireWeaponProfile(weaponName: string) {
  const signature = weaponName.toLowerCase();

  if (
    /\b(dpicm|cluster|rocket|mlrs|guided rocket|chunmoo|130mm|ksrr)\b/i.test(
      signature
    ) ||
    /(천무|다연장|유도로켓|로켓)/i.test(weaponName)
  ) {
    return "cluster" as const;
  }
  if (
    /\b(tank round|hellfire|brimstone|tow|anti-armor)\b/i.test(signature) ||
    /(전차포탄|대전차)/i.test(weaponName)
  ) {
    return "antiArmor" as const;
  }
  if (
    /\b(harpoon|c-star|haeseong|naval strike)\b/i.test(signature) ||
    /(대함|해성|하푼)/i.test(weaponName)
  ) {
    return "antiShip" as const;
  }
  if (
    /\b(maverick|jassm|tomahawk|hyunmoo|tactical surface|guided|kggb)\b/i.test(
      signature
    ) ||
    /(매버릭|정밀|현무|유도무기|유도탄)/i.test(weaponName)
  ) {
    return "precision" as const;
  }
  return "general" as const;
}

function getFocusFireAmmoType(
  weaponName: string,
  profile: FocusFireWeaponProfile
) {
  const signature = weaponName.toLowerCase();

  switch (profile) {
    case "cluster":
      if (
        /\b(130mm|rocket|mlrs|chunmoo|ksrr)\b/i.test(signature) ||
        /(천무|다연장|유도로켓|로켓)/i.test(weaponName)
      ) {
        return "DPICM";
      }
      return "HE";
    case "precision":
      if (
        /\b(maverick|hellfire|brimstone|guided)\b/i.test(signature) ||
        /(매버릭|정밀유도)/i.test(weaponName)
      ) {
        return "정밀유도";
      }
      if (
        /\b(hyunmoo|jassm|tomahawk|surface)\b/i.test(signature) ||
        /(현무|지대지유도무기)/i.test(weaponName)
      ) {
        return "장거리 정밀탄";
      }
      return "정밀유도";
    case "antiArmor":
      return "HEAT";
    case "antiShip":
      return "대함";
    case "general":
      if (/\b(tank round|shell|howitzer)\b/i.test(signature)) {
        return "HE";
      }
      return "범용";
  }
}

function getFocusFireMissionKind(
  targetComposition: FocusFireTargetComposition[],
  targetCount: number,
  highValueTargetCount: number,
  armorTargetCount: number
) {
  const shipTargetCount = targetComposition
    .filter((entry) => entry.label === "함정")
    .reduce((sum, entry) => sum + entry.count, 0);
  const firesTargetCount = targetComposition
    .filter((entry) => entry.label === "화력 시설")
    .reduce((sum, entry) => sum + entry.count, 0);

  if (shipTargetCount > 0) {
    return "대함 타격";
  }
  if (firesTargetCount > 0) {
    return "대화력전";
  }
  if (armorTargetCount > 0 && targetCount <= 3) {
    return "기갑 제압";
  }
  if (highValueTargetCount > 0 && targetCount <= 2) {
    return "정밀 타격";
  }
  if (targetCount >= 4) {
    return "지역 제압";
  }
  return "시설 제압";
}

function getFocusFireTargetPriorityLabel(
  targetCombatPower: number,
  highValueTargetCount: number
) {
  if (highValueTargetCount >= 2 || targetCombatPower >= 80) {
    return "최우선";
  }
  if (highValueTargetCount >= 1 || targetCombatPower >= 40) {
    return "우선";
  }
  return "보통";
}

function getFocusFireDesiredEffectLabel(
  missionKind: string,
  targetCount: number,
  highValueTargetCount: number,
  desiredEffect: number
) {
  if (missionKind === "정밀 타격" || highValueTargetCount >= 1) {
    return desiredEffect >= 8 ? "파괴" : "무력화";
  }
  if (missionKind === "대화력전" || missionKind === "기갑 제압") {
    return "제압";
  }
  if (targetCount >= 4) {
    return "지역 무력화";
  }
  return "무력화";
}

function buildFocusFireRecommendationRationale(
  ammoType: string,
  weaponName: string,
  profile: FocusFireWeaponProfile,
  missionKind: string,
  executionReadinessLabel: string,
  launcherCount: number,
  targetCount: number,
  highValueTargetCount: number
) {
  const readinessTail =
    launcherCount > 1
      ? ` ${launcherCount}개 발포 부대 기준 ${executionReadinessLabel} 상태입니다.`
      : ` 단일 발포 부대 기준 ${executionReadinessLabel} 상태입니다.`;

  switch (profile) {
    case "cluster":
      return `${ammoType} 계열(${weaponName})은(는) ${missionKind}에 맞는 광역 압박에 유리합니다.${readinessTail}`;
    case "precision":
      return `${ammoType} 계열(${weaponName})은(는) 고가치 표적 ${
        highValueTargetCount > 0 ? "정밀 타격" : "우선 타격"
      }에 유리합니다.${readinessTail}`;
    case "antiArmor":
      return `${ammoType} 계열(${weaponName})은(는) 장갑 표적 억제에 적합합니다.${readinessTail}`;
    case "antiShip":
      return `${ammoType} 계열(${weaponName})은(는) 해상 표적에 최적화된 선택입니다.${readinessTail}`;
    case "general":
      if (targetCount > 1) {
        return `${ammoType} 계열(${weaponName})은(는) 현재 목표 구역의 혼합 표적군에 무난한 범용 선택입니다.${readinessTail}`;
      }
      return `${ammoType} 계열(${weaponName})은(는) 현재 주표적에 적용 가능한 기본 선택입니다.${readinessTail}`;
  }
}

function buildFocusFireRecommendationTelemetryKey(
  sideId: string | null | undefined,
  objectiveName: string | null | undefined,
  objectiveLatitude: number | null | undefined,
  objectiveLongitude: number | null | undefined,
  primaryTargetId: string | null | undefined
) {
  return [
    sideId ?? "none",
    objectiveName ?? "objective",
    objectiveLatitude?.toFixed(4) ?? "na",
    objectiveLongitude?.toFixed(4) ?? "na",
    primaryTargetId ?? "no-target",
  ].join("|");
}

function buildFocusFireRecommendationTelemetryOptionsSnapshot(
  options:
    | FocusFireRecommendationOption[]
    | FocusFireRecommendationTelemetryOption[]
) {
  return options.map((option) => ({
    label: option.label,
    weaponName: option.weaponName,
    ammoType: option.ammoType,
    suitabilityScore: option.suitabilityScore,
    heuristicScore: option.heuristicScore,
    rerankerScore: option.rerankerScore,
    executionReadinessLabel: option.executionReadinessLabel,
    averageTimeToFireSeconds: option.averageTimeToFireSeconds,
    threatExposureScore: option.threatExposureScore,
    shotCount: option.shotCount,
    expectedStrikeEffect: option.expectedStrikeEffect,
    launcherCount: option.launcherCount,
    immediateLaunchReadyCount: option.immediateLaunchReadyCount,
    repositionRequiredCount: option.repositionRequiredCount,
    blockedLauncherCount: option.blockedLauncherCount,
    averageDistanceKm: option.averageDistanceKm,
  }));
}

function buildFocusFireRecommendationTelemetrySignature(
  recommendation: FocusFireRecommendation | null,
  rerankerModelVersion: number | null,
  feedbackOptionLabel: string | null = null,
  feedbackCapturedAt: number | null = null
) {
  return JSON.stringify({
    missionKind: recommendation?.missionKind ?? null,
    recommendedOptionLabel: recommendation?.recommendedOptionLabel ?? null,
    weaponName: recommendation?.weaponName ?? null,
    ammoType: recommendation?.ammoType ?? null,
    priorityScore: recommendation?.priorityScore ?? null,
    desiredEffect: recommendation?.desiredEffect ?? null,
    expectedStrikeEffect: recommendation?.expectedStrikeEffect ?? null,
    launchReadinessLabel: recommendation?.launchReadinessLabel ?? null,
    averageTimeToFireSeconds: recommendation?.averageTimeToFireSeconds ?? null,
    threatExposureScore: recommendation?.threatExposureScore ?? null,
    selectionModelLabel: recommendation?.selectionModelLabel ?? null,
    rerankerApplied: recommendation?.rerankerApplied ?? false,
    immediateLaunchReadyCount: recommendation?.immediateLaunchReadyCount ?? 0,
    repositionRequiredCount: recommendation?.repositionRequiredCount ?? 0,
    blockedLauncherCount: recommendation?.blockedLauncherCount ?? 0,
    rerankerModelVersion,
    feedbackOptionLabel,
    feedbackCapturedAt,
    options: recommendation
      ? buildFocusFireRecommendationTelemetryOptionsSnapshot(
          recommendation.options
        )
      : [],
  });
}

function buildFocusFireRecommendationTelemetryRecordSignature(
  entry: FocusFireRecommendationTelemetryRecord
) {
  return JSON.stringify({
    missionKind: entry.missionKind,
    recommendedOptionLabel: entry.recommendedOptionLabel,
    weaponName: entry.weaponName,
    ammoType: entry.ammoType,
    priorityScore: entry.priorityScore,
    desiredEffect: entry.desiredEffect,
    expectedStrikeEffect: entry.expectedStrikeEffect,
    launchReadinessLabel: entry.launchReadinessLabel,
    averageTimeToFireSeconds: entry.averageTimeToFireSeconds,
    threatExposureScore: entry.threatExposureScore,
    selectionModelLabel: entry.selectionModelLabel,
    rerankerApplied: entry.rerankerApplied,
    immediateLaunchReadyCount: entry.immediateLaunchReadyCount,
    repositionRequiredCount: entry.repositionRequiredCount,
    blockedLauncherCount: entry.blockedLauncherCount,
    rerankerModelVersion: entry.rerankerModelVersion,
    feedbackOptionLabel: entry.feedbackOptionLabel,
    feedbackCapturedAt: entry.feedbackCapturedAt,
    options: buildFocusFireRecommendationTelemetryOptionsSnapshot(
      entry.options
    ),
  });
}

function normalizeImportedFocusFireRerankerModel(
  importedRerankerModel: Partial<FocusFireRerankerModel> | null | undefined
): FocusFireRerankerModel | null {
  if (!importedRerankerModel || typeof importedRerankerModel !== "object") {
    return null;
  }

  const defaultModel = createDefaultFocusFireRerankerModel();
  const normalizedWeights = {
    ...defaultModel.weights,
  };
  if (
    importedRerankerModel.weights &&
    typeof importedRerankerModel.weights === "object"
  ) {
    for (const featureName of FOCUS_FIRE_RERANKER_FEATURE_NAMES) {
      const importedValue = importedRerankerModel.weights[featureName];
      if (typeof importedValue === "number" && Number.isFinite(importedValue)) {
        normalizedWeights[featureName] = importedValue;
      }
    }
  }

  type ImportedFocusFireTreeNode = {
    feature?: (typeof FOCUS_FIRE_RERANKER_FEATURE_NAMES)[number];
    threshold?: number;
    left?: ImportedFocusFireTreeNode;
    right?: ImportedFocusFireTreeNode;
    value?: number;
  };

  const normalizeImportedFocusFireTreeNode = (
    nodeCandidate: unknown
  ): ImportedFocusFireTreeNode | null => {
    if (!nodeCandidate || typeof nodeCandidate !== "object") {
      return null;
    }
    const nodeRecord = nodeCandidate as Record<string, unknown>;

    const value =
      typeof nodeRecord.value === "number" && Number.isFinite(nodeRecord.value)
        ? nodeRecord.value
        : undefined;
    const feature =
      typeof nodeRecord.feature === "string" &&
      FOCUS_FIRE_RERANKER_FEATURE_NAMES.includes(
        nodeRecord.feature as (typeof FOCUS_FIRE_RERANKER_FEATURE_NAMES)[number]
      )
        ? (nodeRecord.feature as (typeof FOCUS_FIRE_RERANKER_FEATURE_NAMES)[number])
        : undefined;
    const threshold =
      typeof nodeRecord.threshold === "number" &&
      Number.isFinite(nodeRecord.threshold)
        ? nodeRecord.threshold
        : undefined;
    const left = normalizeImportedFocusFireTreeNode(nodeRecord.left);
    const right = normalizeImportedFocusFireTreeNode(nodeRecord.right);

    if (value !== undefined && (!feature || threshold === undefined)) {
      return {
        value,
      };
    }
    if (feature && threshold !== undefined && left && right) {
      return {
        feature,
        threshold,
        left,
        right,
      };
    }

    return null;
  };

  const normalizeImportedFocusFireTreeModel = (treeCandidate: unknown) => {
    if (!treeCandidate || typeof treeCandidate !== "object") {
      return null;
    }
    const treeRecord = treeCandidate as Record<string, unknown>;

    if ("root" in treeRecord) {
      const root = normalizeImportedFocusFireTreeNode(treeRecord.root);
      if (!root) {
        return null;
      }
      return {
        root,
      };
    }

    const feature =
      typeof treeRecord.feature === "string" &&
      FOCUS_FIRE_RERANKER_FEATURE_NAMES.includes(
        treeRecord.feature as (typeof FOCUS_FIRE_RERANKER_FEATURE_NAMES)[number]
      )
        ? (treeRecord.feature as (typeof FOCUS_FIRE_RERANKER_FEATURE_NAMES)[number])
        : null;
    const threshold =
      typeof treeRecord.threshold === "number" &&
      Number.isFinite(treeRecord.threshold)
        ? treeRecord.threshold
        : null;
    const leftValue =
      typeof treeRecord.leftValue === "number" &&
      Number.isFinite(treeRecord.leftValue)
        ? treeRecord.leftValue
        : null;
    const rightValue =
      typeof treeRecord.rightValue === "number" &&
      Number.isFinite(treeRecord.rightValue)
        ? treeRecord.rightValue
        : null;

    if (
      feature &&
      threshold !== null &&
      leftValue !== null &&
      rightValue !== null
    ) {
      return {
        feature,
        threshold,
        leftValue,
        rightValue,
      };
    }

    return null;
  };

  const normalizedTreeEnsemble =
    importedRerankerModel.treeEnsemble &&
    typeof importedRerankerModel.treeEnsemble === "object" &&
    Array.isArray(importedRerankerModel.treeEnsemble.trees)
      ? {
          trainer:
            typeof importedRerankerModel.treeEnsemble.trainer === "string"
              ? importedRerankerModel.treeEnsemble.trainer
              : null,
          trees: importedRerankerModel.treeEnsemble.trees
            .map((tree) => normalizeImportedFocusFireTreeModel(tree))
            .filter((tree): tree is NonNullable<typeof tree> => tree !== null),
        }
      : null;
  const normalizedModelFamily =
    importedRerankerModel.modelFamily === "tree-ensemble" &&
    normalizedTreeEnsemble &&
    normalizedTreeEnsemble.trees.length > 0
      ? "tree-ensemble"
      : defaultModel.modelFamily;

  return {
    version:
      typeof importedRerankerModel.version === "number" &&
      Number.isFinite(importedRerankerModel.version)
        ? importedRerankerModel.version
        : defaultModel.version,
    trainedAt:
      typeof importedRerankerModel.trainedAt === "string"
        ? importedRerankerModel.trainedAt
        : defaultModel.trainedAt,
    source:
      importedRerankerModel.source === "telemetry-pairwise" ||
      importedRerankerModel.source === "telemetry-tree-ensemble"
        ? importedRerankerModel.source
        : normalizedModelFamily === "tree-ensemble"
          ? "telemetry-tree-ensemble"
          : defaultModel.source,
    modelFamily: normalizedModelFamily,
    origin:
      importedRerankerModel.origin === "trained-in-app" ||
      importedRerankerModel.origin === "imported-json"
        ? importedRerankerModel.origin
        : importedRerankerModel.origin === "built-in"
          ? "built-in"
          : importedRerankerModel.source === "default"
            ? "built-in"
            : "imported-json",
    sampleCount:
      typeof importedRerankerModel.sampleCount === "number" &&
      Number.isFinite(importedRerankerModel.sampleCount)
        ? importedRerankerModel.sampleCount
        : defaultModel.sampleCount,
    operatorFeedbackCount:
      typeof importedRerankerModel.operatorFeedbackCount === "number" &&
      Number.isFinite(importedRerankerModel.operatorFeedbackCount)
        ? importedRerankerModel.operatorFeedbackCount
        : defaultModel.operatorFeedbackCount,
    ruleSeedCount:
      typeof importedRerankerModel.ruleSeedCount === "number" &&
      Number.isFinite(importedRerankerModel.ruleSeedCount)
        ? importedRerankerModel.ruleSeedCount
        : defaultModel.ruleSeedCount,
    epochCount:
      typeof importedRerankerModel.epochCount === "number" &&
      Number.isFinite(importedRerankerModel.epochCount)
        ? importedRerankerModel.epochCount
        : defaultModel.epochCount,
    learningRate:
      typeof importedRerankerModel.learningRate === "number" &&
      Number.isFinite(importedRerankerModel.learningRate)
        ? importedRerankerModel.learningRate
        : defaultModel.learningRate,
    intercept:
      typeof importedRerankerModel.intercept === "number" &&
      Number.isFinite(importedRerankerModel.intercept)
        ? importedRerankerModel.intercept
        : defaultModel.intercept,
    weights: normalizedWeights,
    treeEnsemble:
      normalizedModelFamily === "tree-ensemble" ? normalizedTreeEnsemble : null,
  };
}

function createDefaultFocusFireOperation(): FocusFireOperation {
  return {
    enabled: false,
    active: false,
    sideId: null,
    objectiveReferencePointId: null,
    desiredEffectOverride: null,
    captureProgress: 0,
    launchedPlatformIds: [],
  };
}

export default class Game {
  mapView: IMapView = {
    defaultCenter: [0, 0],
    currentCameraCenter: [0, 0],
    defaultZoom: 0,
    currentCameraZoom: 0,
  };
  currentScenario: Scenario;
  currentSideId: string = "";
  scenarioPaused: boolean = true;
  recordingScenario: boolean = false;
  playbackRecorder: PlaybackRecorder = new PlaybackRecorder(10);
  recordingPlayer: RecordingPlayer = new RecordingPlayer();
  addingAircraft: boolean = false;
  addingAirbase: boolean = false;
  addingFacility: boolean = false;
  addingReferencePoint: boolean = false;
  addingShip: boolean = false;
  selectingTarget: boolean = false;
  currentAttackParams: IAttackParams = {
    autoAttack: false,
    currentAttackerId: "",
    currentWeaponId: "",
    currentWeaponQuantity: 0,
  };
  selectedUnitId: string = "";
  selectedUnitClassName: string | null = null;
  numberOfWaypoints: number = 50;
  godMode: boolean = true;
  eraserMode: boolean = false;
  history: string[] = [];
  unitDba: Dba = new Dba();
  demoMode: boolean = true; // flag for features that should be removed in the final product
  simulationLogs: SimulationLogs = new SimulationLogs();
  focusFireOperation: FocusFireOperation = createDefaultFocusFireOperation();
  focusFireRecommendationTelemetry: FocusFireRecommendationTelemetryRecord[] =
    [];
  private focusFireRecommendationTelemetrySignatures: Map<string, string> =
    new Map();
  focusFireRerankerEnabled: boolean = false;
  focusFireRerankerModel: FocusFireRerankerModel =
    createDefaultFocusFireRerankerModel();

  constructor(currentScenario: Scenario) {
    this.currentScenario = currentScenario;
  }

  getDefaultFacilitySpeed(className?: string | null): number {
    if (isTankFacilityClassName(className)) {
      return 24;
    }
    if (isFiresFacilityClassName(className)) {
      return 12;
    }
    return 0;
  }

  getTargetById(targetId: string | null): Target | undefined {
    if (!targetId) {
      return undefined;
    }

    return (
      this.currentScenario.getAircraft(targetId) ??
      this.currentScenario.getArmy(targetId) ??
      this.currentScenario.getFacility(targetId) ??
      this.currentScenario.getShip(targetId) ??
      this.currentScenario.getAirbase(targetId) ??
      this.currentScenario.getReferencePoint(targetId)
    );
  }

  getFocusFireObjective(): ReferencePoint | undefined {
    return this.currentScenario.getReferencePoint(
      this.focusFireOperation.objectiveReferencePointId
    );
  }

  getFocusFireAircraft(sideId = this.focusFireOperation.sideId): Aircraft[] {
    if (!sideId) return [];
    return this.currentScenario.aircraft.filter(
      (aircraft) =>
        aircraft.sideId === sideId &&
        aircraft.weapons.some((weapon) => weapon.currentQuantity > 0) &&
        (!isSupportAircraftClassName(aircraft.className) ||
          isDroneAircraftClassName(aircraft.className))
    );
  }

  getFocusFireArtilleryFacilities(
    sideId = this.focusFireOperation.sideId
  ): Array<Army | Facility> {
    if (!sideId) return [];
    return [
      ...this.currentScenario.facilities,
      ...this.currentScenario.armies,
    ].filter(
      (facility) =>
        facility.sideId === sideId &&
        isFiresFacilityClassName(facility.className) &&
        facility.weapons.some((weapon) => weapon.currentQuantity > 0)
    );
  }

  getFocusFireArmorFacilities(
    sideId = this.focusFireOperation.sideId
  ): Array<Army | Facility> {
    if (!sideId) return [];
    return [
      ...this.currentScenario.facilities,
      ...this.currentScenario.armies,
    ].filter(
      (facility) =>
        facility.sideId === sideId &&
        isTankFacilityClassName(facility.className) &&
        facility.weapons.some((weapon) => weapon.currentQuantity > 0)
    );
  }

  getFocusFireLaunchVariant(
    platform: Aircraft | Army | Facility
  ): FocusFireLaunchVariant {
    if (platform instanceof Aircraft) {
      return "aircraft";
    }

    if (isTankFacilityClassName(platform.className)) {
      return "armor";
    }

    return "artillery";
  }

  getFocusFireLaunchPlatforms(
    sideId = this.focusFireOperation.sideId
  ): FocusFireLaunchPlatform[] {
    if (!sideId) {
      return [];
    }

    const launchedPlatformIds = new Set(
      this.focusFireOperation.launchedPlatformIds
    );
    const platforms = [
      ...this.currentScenario.facilities.filter(
        (facility) =>
          facility.sideId === sideId &&
          isFiresFacilityClassName(facility.className) &&
          (facility.weapons.some((weapon) => weapon.currentQuantity > 0) ||
            launchedPlatformIds.has(facility.id))
      ),
      ...this.currentScenario.armies.filter(
        (army) =>
          army.sideId === sideId &&
          isFiresFacilityClassName(army.className) &&
          (army.weapons.some((weapon) => weapon.currentQuantity > 0) ||
            launchedPlatformIds.has(army.id))
      ),
      ...this.currentScenario.aircraft.filter(
        (aircraft) =>
          aircraft.sideId === sideId &&
          (!isSupportAircraftClassName(aircraft.className) ||
            isDroneAircraftClassName(aircraft.className)) &&
          (aircraft.weapons.some((weapon) => weapon.currentQuantity > 0) ||
            launchedPlatformIds.has(aircraft.id))
      ),
      ...this.getFocusFireArmorFacilities(sideId),
    ];

    return platforms.map((platform) => ({
      id: platform.id,
      name: platform.name,
      className: platform.className,
      latitude: platform.latitude,
      longitude: platform.longitude,
      altitudeMeters: getFocusFireAltitudeMeters(platform.altitude),
      variant: this.getFocusFireLaunchVariant(platform),
      launched: launchedPlatformIds.has(platform.id),
    }));
  }

  getFocusFireWeaponTracks(
    objective = this.getFocusFireObjective()
  ): FocusFireWeaponTrack[] {
    if (!objective) {
      return [];
    }

    return this.currentScenario.weapons
      .filter((weapon) => weapon.targetId === objective.id)
      .map((weapon) => {
        const launcher =
          this.currentScenario.getAircraft(weapon.launcherId) ??
          this.currentScenario.getArmy(weapon.launcherId) ??
          this.currentScenario.getFacility(weapon.launcherId);
        if (!launcher) {
          return null;
        }

        return {
          id: weapon.id,
          launcherId: launcher.id,
          launcherName: launcher.name,
          latitude: weapon.latitude,
          longitude: weapon.longitude,
          altitudeMeters: getFocusFireAltitudeMeters(weapon.altitude),
          launcherLatitude: weapon.launchLatitude ?? launcher.latitude,
          launcherLongitude: weapon.launchLongitude ?? launcher.longitude,
          launcherAltitudeMeters: getFocusFireAltitudeMeters(
            weapon.launchAltitude ?? launcher.altitude
          ),
          targetLatitude: objective.latitude,
          targetLongitude: objective.longitude,
          variant: this.getFocusFireLaunchVariant(launcher),
        };
      })
      .filter((track): track is FocusFireWeaponTrack => track !== null);
  }

  private buildBattleSpectatorPointSnapshot(
    latitude: number,
    longitude: number,
    altitudeFeet = 0
  ): BattleSpectatorPointSnapshot {
    return {
      latitude,
      longitude,
      altitudeMeters: getFocusFireAltitudeMeters(altitudeFeet),
    };
  }

  private buildBattleSpectatorRouteSnapshot(
    route: number[][] | undefined,
    altitudeFeet = 0
  ): BattleSpectatorPointSnapshot[] {
    if (!Array.isArray(route)) {
      return [];
    }

    return route
      .map((point) => {
        const [latitude, longitude] = point ?? [];
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return this.buildBattleSpectatorPointSnapshot(
          latitude,
          longitude,
          altitudeFeet
        );
      })
      .filter((point): point is BattleSpectatorPointSnapshot => point !== null);
  }

  private resolveBattleSpectatorUnitModelId(
    entity: Aircraft | Army | Facility | Airbase | Ship,
    entityType: BattleSpectatorEntityType
  ) {
    const dbVisualProfileId =
      entityType === "aircraft"
        ? this.unitDba.findAircraftModel(entity.className)?.visualProfileId
        : entityType === "facility" || entityType === "army"
          ? this.unitDba.findFacilityModel(entity.className)?.visualProfileId
          : entityType === "ship"
            ? this.unitDba.findShipModel(entity.className)?.visualProfileId
            : this.unitDba.findAirbaseModel(entity.name)?.visualProfileId;

    return resolveUnitVisualProfileId({
      entityType:
        entityType === "airbase"
          ? "airbase"
          : entityType === "army"
            ? "facility"
            : entityType,
      className: entity.className,
      name: entity.name,
      dbVisualProfileId,
    });
  }

  private resolveBattleSpectatorWeaponModelId(weapon: Weapon) {
    return resolveUnitVisualProfileId({
      entityType: "weapon",
      className: weapon.className,
      name: weapon.name,
      dbVisualProfileId: this.unitDba.findWeaponModel(weapon.className)
        ?.visualProfileId,
    });
  }

  private buildBattleSpectatorWeaponInventorySnapshot(
    weapons: Weapon[]
  ): BattleSpectatorWeaponInventorySnapshot[] {
    const inventory = new Map<string, BattleSpectatorWeaponInventorySnapshot>();

    weapons.forEach((weapon) => {
      const key = weapon.className;
      const existing = inventory.get(key);
      if (existing) {
        existing.quantity += weapon.currentQuantity;
        existing.maxQuantity += weapon.maxQuantity;
        return;
      }

      inventory.set(key, {
        id: weapon.id,
        name: weapon.name,
        className: weapon.className,
        quantity: weapon.currentQuantity,
        maxQuantity: weapon.maxQuantity,
        modelId: this.resolveBattleSpectatorWeaponModelId(weapon),
      });
    });

    return [...inventory.values()].sort((left, right) => {
      if (right.quantity !== left.quantity) {
        return right.quantity - left.quantity;
      }
      return left.name.localeCompare(right.name, "ko-KR");
    });
  }

  private buildBattleSpectatorStatusFlags(
    entity: Aircraft | Army | Facility | Airbase | Ship,
    options: {
      entityType: BattleSpectatorEntityType;
      hpFraction: number;
      weaponCount: number;
      selected: boolean;
      targetId?: string;
      fuelFraction?: number;
      modelId?: UnitVisualProfileId;
      profileHint: Battle3dProfileHint;
    }
  ) {
    const flags: string[] = [];

    if (
      (options.entityType === "facility" || options.entityType === "army") &&
      isGroundVisualProfileId(options.modelId)
    ) {
      flags.push("ground-unit");
    }
    if (options.profileHint === "defense") {
      flags.push("air-defense");
    }
    if (options.profileHint === "fires") {
      flags.push("fires");
    }
    if (options.hpFraction <= 0.3) {
      flags.push("critical-damage");
    } else if (options.hpFraction <= 0.65) {
      flags.push("damaged");
    }
    if (
      typeof options.fuelFraction === "number" &&
      Number.isFinite(options.fuelFraction) &&
      options.fuelFraction <= 0.2
    ) {
      flags.push("low-fuel");
    }
    if (options.weaponCount <= 0 && options.entityType !== "airbase") {
      flags.push("empty-launcher");
    }
    if ("rtb" in entity && typeof entity.rtb === "boolean" && entity.rtb) {
      flags.push("rtb");
    }
    if (options.selected) {
      flags.push("selected");
    }
    if (options.targetId) {
      flags.push("engaged");
    }
    if (entity instanceof Airbase && options.hpFraction < 0.5) {
      flags.push("runway-degraded");
    }

    return flags;
  }

  private buildBattleSpectatorUnitSnapshot(
    entity: Aircraft | Army | Facility | Airbase | Ship,
    entityType: BattleSpectatorEntityType
  ): BattleSpectatorUnitSnapshot {
    const modelId = this.resolveBattleSpectatorUnitModelId(entity, entityType);
    const profileHint = inferBattle3dProfileHint(
      entityType === "airbase"
        ? "airbase"
        : entityType === "army"
          ? "facility"
          : entityType,
      entity.className,
      entity.name
    );
    const weaponCount =
      entity instanceof Airbase
        ? entity.aircraft.reduce(
            (total, aircraft) => total + aircraft.getTotalWeaponQuantity(),
            0
          )
        : entity.getTotalWeaponQuantity();
    const weaponInventory = this.buildBattleSpectatorWeaponInventorySnapshot(
      entity instanceof Airbase
        ? entity.aircraft.flatMap((aircraft) => aircraft.weapons)
        : entity.weapons
    );
    const targetId =
      "targetId" in entity &&
      typeof entity.targetId === "string" &&
      entity.targetId.length > 0
        ? entity.targetId
        : undefined;
    const currentFuel =
      "currentFuel" in entity && typeof entity.currentFuel === "number"
        ? entity.currentFuel
        : undefined;
    const maxFuel =
      "maxFuel" in entity && typeof entity.maxFuel === "number"
        ? entity.maxFuel
        : undefined;
    const fuelFraction =
      typeof currentFuel === "number" &&
      typeof maxFuel === "number" &&
      maxFuel > 0
        ? currentFuel / maxFuel
        : undefined;
    const hpFraction = entity.getHealthFraction();
    const selected = this.selectedUnitId === entity.id;
    const detectionRangeNm =
      entity instanceof Airbase ? 0 : entity.getDetectionRange();
    const detectionArcDegrees =
      entity instanceof Airbase ? 360 : entity.getDetectionArcDegrees();
    const detectionHeadingDeg =
      entity instanceof Airbase ? 0 : entity.getDetectionHeading();
    const engagementRangeNm =
      entity instanceof Airbase ? 0 : entity.getWeaponEngagementRange();
    const route =
      "route" in entity
        ? this.buildBattleSpectatorRouteSnapshot(entity.route, entity.altitude)
        : [];
    const desiredRoute =
      "desiredRoute" in entity
        ? this.buildBattleSpectatorRouteSnapshot(
            entity.desiredRoute,
            entity.altitude
          )
        : [];
    const groundUnit =
      entityType === "army" ||
      (entityType === "facility" && isGroundVisualProfileId(modelId));

    return {
      id: entity.id,
      name: entity.name,
      className: entity.className,
      entityType,
      modelId,
      profileHint,
      groundUnit,
      sideId: entity.sideId,
      sideName: this.currentScenario.getSideName(entity.sideId),
      sideColor: `${entity.sideColor ?? this.currentScenario.getSideColor(entity.sideId)}`,
      latitude: entity.latitude,
      longitude: entity.longitude,
      altitudeMeters: getFocusFireAltitudeMeters(entity.altitude),
      headingDeg: "heading" in entity ? (entity.heading ?? 0) : 0,
      speedKts: "speed" in entity ? (entity.speed ?? 0) : 0,
      weaponCount,
      hpFraction,
      damageFraction: 1 - hpFraction,
      detectionRangeNm,
      detectionArcDegrees,
      detectionHeadingDeg,
      engagementRangeNm,
      currentFuel,
      maxFuel,
      fuelFraction,
      route,
      desiredRoute,
      weaponInventory,
      aircraftCount:
        "aircraft" in entity && Array.isArray(entity.aircraft)
          ? entity.aircraft.length
          : undefined,
      homeBaseId:
        "homeBaseId" in entity && typeof entity.homeBaseId === "string"
          ? entity.homeBaseId
          : undefined,
      rtb:
        "rtb" in entity && typeof entity.rtb === "boolean"
          ? entity.rtb
          : undefined,
      statusFlags: this.buildBattleSpectatorStatusFlags(entity, {
        entityType,
        hpFraction,
        weaponCount,
        selected,
        targetId,
        fuelFraction,
        modelId,
        profileHint,
      }),
      selected,
      targetId,
    };
  }

  getBattleSpectatorSnapshot(maxEvents = 8): BattleSpectatorSnapshot {
    const [centerLongitude, centerLatitude] =
      Array.isArray(this.mapView.currentCameraCenter) &&
      this.mapView.currentCameraCenter.length >= 2 &&
      Number.isFinite(this.mapView.currentCameraCenter[0]) &&
      Number.isFinite(this.mapView.currentCameraCenter[1])
        ? this.mapView.currentCameraCenter
        : [null, null];

    const units = [
      ...this.currentScenario.aircraft.map((entity) =>
        this.buildBattleSpectatorUnitSnapshot(entity, "aircraft")
      ),
      ...this.currentScenario.armies.map((entity) =>
        this.buildBattleSpectatorUnitSnapshot(entity, "army")
      ),
      ...this.currentScenario.facilities.map((entity) =>
        this.buildBattleSpectatorUnitSnapshot(entity, "facility")
      ),
      ...this.currentScenario.airbases.map((entity) =>
        this.buildBattleSpectatorUnitSnapshot(entity, "airbase")
      ),
      ...this.currentScenario.ships.map((entity) =>
        this.buildBattleSpectatorUnitSnapshot(entity, "ship")
      ),
    ];

    const weapons = this.currentScenario.weapons.map((weapon) => {
      const target = this.getTargetById(weapon.targetId);

      return {
        id: weapon.id,
        name: weapon.name,
        className: weapon.className,
        modelId: this.resolveBattleSpectatorWeaponModelId(weapon),
        launcherId: weapon.launcherId,
        launcherName:
          this.currentScenario.getAircraft(weapon.launcherId)?.name ??
          this.currentScenario.getArmy(weapon.launcherId)?.name ??
          this.currentScenario.getFacility(weapon.launcherId)?.name ??
          this.currentScenario.getShip(weapon.launcherId)?.name ??
          weapon.launcherId,
        sideId: weapon.sideId,
        sideName: this.currentScenario.getSideName(weapon.sideId),
        sideColor: `${weapon.sideColor ?? this.currentScenario.getSideColor(weapon.sideId)}`,
        latitude: weapon.latitude,
        longitude: weapon.longitude,
        altitudeMeters: getFocusFireAltitudeMeters(weapon.altitude),
        launchLatitude: weapon.launchLatitude ?? weapon.latitude,
        launchLongitude: weapon.launchLongitude ?? weapon.longitude,
        launchAltitudeMeters: getFocusFireAltitudeMeters(
          weapon.launchAltitude ?? weapon.altitude
        ),
        headingDeg: weapon.heading,
        speedKts: weapon.speed,
        hpFraction: weapon.getHealthFraction(),
        targetId: weapon.targetId,
        targetLatitude: target?.latitude,
        targetLongitude: target?.longitude,
      };
    });

    const recentEvents = this.simulationLogs
      .getLogs(undefined, undefined, undefined, "asc")
      .slice(-Math.max(1, maxEvents))
      .map((log) => {
        const actorId =
          log.metadata?.actorId ?? log.metadata?.launcherId ?? null;
        const actor =
          this.getTargetById(actorId) ??
          this.currentScenario.getWeapon(actorId);
        const target =
          this.getTargetById(log.metadata?.targetId ?? null) ??
          this.currentScenario.getWeapon(log.metadata?.targetId ?? null);
        const weapon =
          this.currentScenario.getWeapon(log.metadata?.weaponId ?? null) ??
          null;
        const focusTarget = weapon ?? target ?? actor;
        const sourceAltitudeFeet =
          actor && "altitude" in actor ? actor.altitude : 0;
        const targetAltitudeFeet =
          target && "altitude" in target ? target.altitude : 0;
        const focusAltitudeFeet =
          focusTarget && "altitude" in focusTarget ? focusTarget.altitude : 0;

        return {
          id: log.id,
          timestamp: log.timestamp,
          sideId: log.sideId,
          sideName: this.currentScenario.getSideName(log.sideId),
          sideColor: this.currentScenario.getSideColor(log.sideId),
          type: log.type,
          message: log.message,
          actorId: log.metadata?.actorId,
          actorName: log.metadata?.actorName,
          sourceLatitude: actor?.latitude,
          sourceLongitude: actor?.longitude,
          sourceAltitudeMeters: getFocusFireAltitudeMeters(sourceAltitudeFeet),
          targetId: log.metadata?.targetId,
          targetName: log.metadata?.targetName,
          targetLatitude: target?.latitude,
          targetLongitude: target?.longitude,
          targetAltitudeMeters: getFocusFireAltitudeMeters(targetAltitudeFeet),
          weaponId: log.metadata?.weaponId,
          focusLatitude: focusTarget?.latitude,
          focusLongitude: focusTarget?.longitude,
          focusAltitudeMeters: getFocusFireAltitudeMeters(focusAltitudeFeet),
          resultTag: log.metadata?.resultTag,
        };
      });

    return {
      schemaVersion: 2,
      scenarioId: this.currentScenario.id,
      scenarioName: this.currentScenario.name,
      currentTime: this.currentScenario.currentTime,
      currentSideId: this.currentSideId,
      currentSideName: this.currentScenario.getSideName(this.currentSideId),
      selectedUnitId: this.selectedUnitId,
      centerLongitude:
        typeof centerLongitude === "number" ? centerLongitude : null,
      centerLatitude:
        typeof centerLatitude === "number" ? centerLatitude : null,
      units,
      weapons,
      recentEvents,
      stats: {
        aircraft: this.currentScenario.aircraft.length,
        facilities:
          this.currentScenario.facilities.length +
          this.currentScenario.armies.length,
        airbases: this.currentScenario.airbases.length,
        ships: this.currentScenario.ships.length,
        groundUnits: units.filter((unit) => unit.groundUnit).length,
        weaponsInFlight: this.currentScenario.weapons.length,
        sides: this.currentScenario.sides.length,
      },
    };
  }

  getFocusFireHostileSideIds(sideId: string): Set<string> {
    const declaredHostiles =
      this.currentScenario.relationships.getHostiles(sideId);
    if (declaredHostiles.length > 0) {
      return new Set(declaredHostiles);
    }

    return new Set(
      this.currentScenario.sides
        .filter((side) => side.id !== sideId)
        .map((side) => side.id)
    );
  }

  getFocusFireThreatExposureScore(
    sideId: string,
    latitude: number,
    longitude: number
  ) {
    const hostileSideIds = this.getFocusFireHostileSideIds(sideId);
    let exposureScore = 0;

    [
      ...this.currentScenario.facilities,
      ...this.currentScenario.armies,
    ].forEach((facility) => {
      if (!hostileSideIds.has(facility.sideId)) {
        return;
      }

      const threatRange = getFacilityThreatRange(
        facility.className,
        Math.max(
          facility.getWeaponEngagementRange(),
          facility.getDetectionRange()
        )
      );
      const threatArc = getFacilityDetectionArcDegrees(
        facility.className,
        facility.getDetectionArcDegrees()
      );
      if (
        isTargetInsideSector(
          facility.latitude,
          facility.longitude,
          latitude,
          longitude,
          threatRange,
          facility.getDetectionHeading(),
          threatArc
        )
      ) {
        exposureScore += 1 + Math.min(threatRange / 120, 1.5);
      }
    });

    this.currentScenario.ships.forEach((ship) => {
      if (!hostileSideIds.has(ship.sideId)) {
        return;
      }

      const threatRange = Math.max(
        ship.getWeaponEngagementRange(),
        ship.getDetectionRange()
      );
      if (
        threatRange > 0 &&
        isTargetInsideSector(
          ship.latitude,
          ship.longitude,
          latitude,
          longitude,
          threatRange,
          ship.getDetectionHeading(),
          ship.getDetectionArcDegrees()
        )
      ) {
        exposureScore += 1 + Math.min(threatRange / 150, 1.2);
      }
    });

    this.currentScenario.aircraft.forEach((aircraft) => {
      if (!hostileSideIds.has(aircraft.sideId)) {
        return;
      }

      const threatRange = Math.max(
        aircraft.getWeaponEngagementRange(),
        aircraft.getDetectionRange()
      );
      if (
        threatRange > 0 &&
        isTargetInsideSector(
          aircraft.latitude,
          aircraft.longitude,
          latitude,
          longitude,
          threatRange,
          aircraft.getDetectionHeading(),
          aircraft.getDetectionArcDegrees()
        )
      ) {
        exposureScore += 0.8 + Math.min(threatRange / 180, 1);
      }
    });

    return roundToDigits(exposureScore, 1);
  }

  getFocusFireExecutionAssessment(
    platform: Aircraft | Army | Facility,
    weapon: Weapon,
    objective: FocusFireObjectivePoint,
    sideId: string
  ): {
    executionState: FocusFireExecutionState;
    estimatedTimeToFireSeconds: number | null;
    threatExposureScore: number;
  } {
    const distanceToObjectiveKm = getDistanceBetweenTwoPoints(
      platform.latitude,
      platform.longitude,
      objective.latitude,
      objective.longitude
    );
    const distanceToObjectiveNm =
      (distanceToObjectiveKm * 1000) / NAUTICAL_MILES_TO_METERS;
    const detectionRangeNm = platform.getDetectionRange();
    const weaponRangeNm = weapon.getEngagementRange();
    const immediateLaunchReady =
      distanceToObjectiveNm <= weaponRangeNm &&
      isTargetInsideSector(
        platform.latitude,
        platform.longitude,
        objective.latitude,
        objective.longitude,
        detectionRangeNm,
        platform.getDetectionHeading(),
        platform.getDetectionArcDegrees()
      );

    if (immediateLaunchReady) {
      return {
        executionState: "ready",
        estimatedTimeToFireSeconds: 0,
        threatExposureScore: this.getFocusFireThreatExposureScore(
          sideId,
          platform.latitude,
          platform.longitude
        ),
      };
    }

    if (platform instanceof Aircraft) {
      const strikeRadiusNm = Math.min(detectionRangeNm, weaponRangeNm);
      if (!(platform.speed > 0) || !(strikeRadiusNm > 0)) {
        return {
          executionState: "blocked",
          estimatedTimeToFireSeconds: null,
          threatExposureScore: this.getFocusFireThreatExposureScore(
            sideId,
            platform.latitude,
            platform.longitude
          ),
        };
      }

      const travelDistanceNm = Math.max(
        distanceToObjectiveNm - strikeRadiusNm * 0.95,
        0
      );
      const travelDistanceKm = travelDistanceNm / KILOMETERS_TO_NAUTICAL_MILES;
      const approachBearing = getBearingBetweenTwoPoints(
        objective.latitude,
        objective.longitude,
        platform.latitude,
        platform.longitude
      );
      const [strikeLatitude, strikeLongitude] =
        getTerminalCoordinatesFromDistanceAndBearing(
          objective.latitude,
          objective.longitude,
          travelDistanceKm,
          approachBearing
        );

      return {
        executionState: "reposition",
        estimatedTimeToFireSeconds: roundToDigits(
          getFocusFireTravelTimeSeconds(travelDistanceKm, platform.speed),
          1
        ),
        threatExposureScore: this.getFocusFireThreatExposureScore(
          sideId,
          strikeLatitude,
          strikeLongitude
        ),
      };
    }

    if (isTankFacilityClassName(platform.className) && platform.speed > 0) {
      const effectiveLaunchRadiusNm = Math.min(
        detectionRangeNm,
        weaponRangeNm * 1.05
      );
      const travelDistanceNm = Math.max(
        distanceToObjectiveNm - effectiveLaunchRadiusNm,
        0
      );
      const travelDistanceKm = travelDistanceNm / KILOMETERS_TO_NAUTICAL_MILES;

      return {
        executionState: "reposition",
        estimatedTimeToFireSeconds: roundToDigits(
          getFocusFireTravelTimeSeconds(travelDistanceKm, platform.speed),
          1
        ),
        threatExposureScore: this.getFocusFireThreatExposureScore(
          sideId,
          objective.latitude,
          objective.longitude
        ),
      };
    }

    return {
      executionState: "blocked",
      estimatedTimeToFireSeconds: null,
      threatExposureScore: this.getFocusFireThreatExposureScore(
        sideId,
        platform.latitude,
        platform.longitude
      ),
    };
  }

  getFocusFireRecommendationTelemetry(
    sideId?: string | null
  ): FocusFireRecommendationTelemetryRecord[] {
    if (!sideId) {
      return [...this.focusFireRecommendationTelemetry];
    }

    return this.focusFireRecommendationTelemetry.filter(
      (entry) => entry.sideId === sideId
    );
  }

  clearFocusFireRecommendationTelemetry() {
    this.focusFireRecommendationTelemetry = [];
    this.focusFireRecommendationTelemetrySignatures.clear();
  }

  private findLatestFocusFireRecommendationTelemetryRecord(
    sideId: string | null | undefined,
    objective: FocusFireObjectivePoint | undefined,
    primaryTargetId: string | null | undefined
  ) {
    const telemetryKey = buildFocusFireRecommendationTelemetryKey(
      sideId,
      objective?.name ?? null,
      objective?.latitude ?? null,
      objective?.longitude ?? null,
      primaryTargetId
    );
    for (
      let index = this.focusFireRecommendationTelemetry.length - 1;
      index >= 0;
      index -= 1
    ) {
      const candidate = this.focusFireRecommendationTelemetry[index];
      if (
        buildFocusFireRecommendationTelemetryKey(
          candidate.sideId,
          candidate.objectiveName,
          candidate.objectiveLatitude,
          candidate.objectiveLongitude,
          candidate.primaryTargetId
        ) === telemetryKey
      ) {
        return candidate;
      }
    }
    return null;
  }

  getFocusFireRecommendationFeedbackLabel(
    objective:
      | FocusFireObjectivePoint
      | undefined = this.getFocusFireObjective(),
    sideId = this.focusFireOperation.sideId,
    primaryTargetId: string | null = null
  ) {
    return (
      this.findLatestFocusFireRecommendationTelemetryRecord(
        sideId,
        objective,
        primaryTargetId
      )?.feedbackOptionLabel ?? null
    );
  }

  getFocusFireRerankerState() {
    return {
      enabled: this.focusFireRerankerEnabled,
      model: this.focusFireRerankerModel,
      confidenceScore: getFocusFireRerankerConfidence(
        this.focusFireRerankerModel
      ),
    };
  }

  setFocusFireRerankerEnabled(enabled: boolean) {
    this.focusFireRerankerEnabled = enabled;
    return this.focusFireRerankerEnabled;
  }

  resetFocusFireRerankerModel() {
    this.focusFireRerankerModel = createDefaultFocusFireRerankerModel();
    this.focusFireRerankerEnabled = false;
    return this.focusFireRerankerModel;
  }

  trainFocusFireRerankerModel() {
    let operatorFeedbackRecords = 0;
    let ruleSeedRecords = 0;
    let skippedAiOnlyRecords = 0;

    const trainingRecords = this.focusFireRecommendationTelemetry
      .map((entry) => {
        const preferredOptionLabel =
          entry.feedbackOptionLabel ??
          (!entry.rerankerApplied ? entry.recommendedOptionLabel : null);
        if (
          !preferredOptionLabel ||
          !entry.options.some((option) => option.label === preferredOptionLabel)
        ) {
          if (entry.rerankerApplied && !entry.feedbackOptionLabel) {
            skippedAiOnlyRecords += 1;
          }
          return null;
        }

        if (entry.feedbackOptionLabel) {
          operatorFeedbackRecords += 1;
        } else {
          ruleSeedRecords += 1;
        }

        return {
          recommendedOptionLabel: preferredOptionLabel,
          desiredEffect: entry.desiredEffect,
          options: entry.options.map((option) => ({
            ...option,
          })),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (trainingRecords.length === 0) {
      return {
        model: this.focusFireRerankerModel,
        summary: {
          comparisons: 0,
          recordsUsed: 0,
          epochs: 0,
          learningRate: 0,
          telemetryRecordsConsidered:
            this.focusFireRecommendationTelemetry.length,
          operatorFeedbackRecords,
          ruleSeedRecords,
          skippedAiOnlyRecords,
        },
      };
    }

    const { model, summary } = trainFocusFireRerankerFromTelemetry(
      trainingRecords,
      this.focusFireRerankerModel
    );
    this.focusFireRerankerModel = {
      ...model,
      operatorFeedbackCount: operatorFeedbackRecords,
      ruleSeedCount: ruleSeedRecords,
    };
    this.focusFireRerankerEnabled = true;
    return {
      model: this.focusFireRerankerModel,
      summary: {
        ...summary,
        telemetryRecordsConsidered:
          this.focusFireRecommendationTelemetry.length,
        operatorFeedbackRecords,
        ruleSeedRecords,
        skippedAiOnlyRecords,
      },
    };
  }

  exportFocusFireRecommendationTelemetryJsonl(sideId?: string | null): string {
    return this.getFocusFireRecommendationTelemetry(sideId)
      .map((entry) => JSON.stringify(entry))
      .join("\n");
  }

  exportFocusFireRecommendationTelemetryCsv(sideId?: string | null): string {
    const rows: Array<Record<string, string | number>> =
      this.getFocusFireRecommendationTelemetry(sideId).flatMap((entry) =>
        entry.options.map((option) => {
          const trainingPreferredOptionLabel =
            entry.feedbackOptionLabel ??
            (!entry.rerankerApplied ? entry.recommendedOptionLabel : null);
          return {
            timestamp: entry.timestamp,
            side_id: entry.sideId ?? "",
            objective_name: entry.objectiveName ?? "",
            objective_latitude: entry.objectiveLatitude ?? "",
            objective_longitude: entry.objectiveLongitude ?? "",
            primary_target_id: entry.primaryTargetId ?? "",
            target_name: entry.targetName ?? "",
            mission_kind: entry.missionKind ?? "",
            recommended_option_label: entry.recommendedOptionLabel ?? "",
            selection_model_label: entry.selectionModelLabel ?? "",
            reranker_applied: entry.rerankerApplied ? "true" : "false",
            reranker_model_version: entry.rerankerModelVersion ?? "",
            feedback_option_label: entry.feedbackOptionLabel ?? "",
            feedback_captured_at: entry.feedbackCapturedAt ?? "",
            training_preferred_option_label: trainingPreferredOptionLabel ?? "",
            training_record_source: entry.feedbackOptionLabel
              ? "operator_feedback"
              : entry.rerankerApplied
                ? "ai_only"
                : "rule_seed",
            selected_weapon_name: entry.weaponName ?? "",
            selected_ammo_type: entry.ammoType ?? "",
            priority_score: entry.priorityScore ?? "",
            desired_effect: entry.desiredEffect ?? "",
            expected_strike_effect: entry.expectedStrikeEffect ?? "",
            launch_readiness_label: entry.launchReadinessLabel ?? "",
            average_time_to_fire_seconds: entry.averageTimeToFireSeconds ?? "",
            threat_exposure_score: entry.threatExposureScore ?? "",
            immediate_launch_ready_count: entry.immediateLaunchReadyCount,
            reposition_required_count: entry.repositionRequiredCount,
            blocked_launcher_count: entry.blockedLauncherCount,
            option_label: option.label,
            option_weapon_name: option.weaponName ?? "",
            option_ammo_type: option.ammoType ?? "",
            option_heuristic_score: option.heuristicScore,
            option_reranker_score: option.rerankerScore ?? "",
            option_suitability_score: option.suitabilityScore,
            option_execution_readiness_label: option.executionReadinessLabel,
            option_average_time_to_fire_seconds:
              option.averageTimeToFireSeconds ?? "",
            option_threat_exposure_score: option.threatExposureScore,
            option_average_distance_km: option.averageDistanceKm ?? "",
            option_launcher_count: option.launcherCount,
            option_immediate_launch_ready_count:
              option.immediateLaunchReadyCount,
            option_reposition_required_count: option.repositionRequiredCount,
            option_blocked_launcher_count: option.blockedLauncherCount,
            option_shot_count: option.shotCount,
            option_expected_strike_effect: option.expectedStrikeEffect,
            option_selected:
              option.label === entry.recommendedOptionLabel ? "true" : "false",
            option_feedback_selected:
              option.label === entry.feedbackOptionLabel ? "true" : "false",
            option_training_selected:
              option.label === trainingPreferredOptionLabel ? "true" : "false",
          };
        })
      );

    if (rows.length === 0) {
      return "";
    }

    const headers = Object.keys(rows[0]);
    const escapeCsvValue = (value: string | number) => {
      const text = `${value}`;
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    return [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => escapeCsvValue(row[header])).join(",")
      ),
    ].join("\n");
  }

  exportFocusFireRerankerModel() {
    return JSON.stringify(this.focusFireRerankerModel, null, 2);
  }

  importFocusFireRerankerModel(modelJson: string) {
    const importedPayload = JSON.parse(modelJson) as
      | {
          focusFireRerankerModel?: Partial<FocusFireRerankerModel>;
          focusFireRerankerEnabled?: boolean;
        }
      | Partial<FocusFireRerankerModel>;
    const modelCandidate =
      importedPayload &&
      typeof importedPayload === "object" &&
      "focusFireRerankerModel" in importedPayload
        ? importedPayload.focusFireRerankerModel
        : (importedPayload as Partial<FocusFireRerankerModel>);
    const normalizedModel =
      normalizeImportedFocusFireRerankerModel(modelCandidate);
    if (!normalizedModel) {
      throw new Error("유효한 집중포격 AI 모델 JSON이 아닙니다.");
    }

    this.focusFireRerankerModel = normalizedModel;
    this.focusFireRerankerEnabled =
      importedPayload &&
      typeof importedPayload === "object" &&
      "focusFireRerankerEnabled" in importedPayload
        ? importedPayload.focusFireRerankerEnabled === true
        : true;
    return {
      enabled: this.focusFireRerankerEnabled,
      model: this.focusFireRerankerModel,
    };
  }

  recordFocusFireRecommendationTelemetry(
    objective: FocusFireObjectivePoint | undefined,
    sideId: string | null | undefined,
    recommendation: FocusFireRecommendation | null
  ) {
    if (!objective && !recommendation) {
      return null;
    }

    const telemetryKey = buildFocusFireRecommendationTelemetryKey(
      sideId,
      objective?.name ?? null,
      objective?.latitude ?? null,
      objective?.longitude ?? null,
      recommendation?.primaryTargetId ?? null
    );
    const existingRecord =
      this.findLatestFocusFireRecommendationTelemetryRecord(
        sideId,
        objective,
        recommendation?.primaryTargetId ?? null
      );
    const preservedFeedbackOptionLabel =
      existingRecord?.feedbackOptionLabel &&
      recommendation?.options.some(
        (option) => option.label === existingRecord.feedbackOptionLabel
      )
        ? existingRecord.feedbackOptionLabel
        : null;
    const preservedFeedbackCapturedAt = preservedFeedbackOptionLabel
      ? (existingRecord?.feedbackCapturedAt ?? null)
      : null;
    const rerankerModelVersion = recommendation?.rerankerApplied
      ? this.focusFireRerankerModel.version
      : null;
    const signature = buildFocusFireRecommendationTelemetrySignature(
      recommendation,
      rerankerModelVersion,
      preservedFeedbackOptionLabel,
      preservedFeedbackCapturedAt
    );

    if (
      this.focusFireRecommendationTelemetrySignatures.get(telemetryKey) ===
      signature
    ) {
      return null;
    }

    const telemetryRecord: FocusFireRecommendationTelemetryRecord = {
      id: randomUUID(),
      timestamp: this.currentScenario.currentTime,
      sideId: sideId ?? null,
      objectiveName: objective?.name ?? null,
      objectiveLatitude: objective?.latitude ?? null,
      objectiveLongitude: objective?.longitude ?? null,
      primaryTargetId: recommendation?.primaryTargetId ?? null,
      targetName: recommendation?.targetName ?? null,
      missionKind: recommendation?.missionKind ?? null,
      recommendedOptionLabel: recommendation?.recommendedOptionLabel ?? null,
      weaponName: recommendation?.weaponName ?? null,
      ammoType: recommendation?.ammoType ?? null,
      priorityScore: recommendation?.priorityScore ?? null,
      desiredEffect: recommendation?.desiredEffect ?? null,
      expectedStrikeEffect: recommendation?.expectedStrikeEffect ?? null,
      launchReadinessLabel: recommendation?.launchReadinessLabel ?? null,
      averageTimeToFireSeconds:
        recommendation?.averageTimeToFireSeconds ?? null,
      threatExposureScore: recommendation?.threatExposureScore ?? null,
      selectionModelLabel: recommendation?.selectionModelLabel ?? null,
      rerankerApplied: recommendation?.rerankerApplied ?? false,
      immediateLaunchReadyCount: recommendation?.immediateLaunchReadyCount ?? 0,
      repositionRequiredCount: recommendation?.repositionRequiredCount ?? 0,
      blockedLauncherCount: recommendation?.blockedLauncherCount ?? 0,
      rerankerModelVersion,
      feedbackOptionLabel: preservedFeedbackOptionLabel,
      feedbackCapturedAt: preservedFeedbackCapturedAt,
      options: recommendation
        ? buildFocusFireRecommendationTelemetryOptionsSnapshot(
            recommendation.options
          )
        : [],
    };

    this.focusFireRecommendationTelemetrySignatures.set(
      telemetryKey,
      signature
    );
    this.focusFireRecommendationTelemetry.push(telemetryRecord);
    this.focusFireRecommendationTelemetry =
      this.focusFireRecommendationTelemetry.slice(-200);
    return telemetryRecord;
  }

  setFocusFireRecommendationFeedback(
    optionLabel: string,
    objective:
      | FocusFireObjectivePoint
      | undefined = this.getFocusFireObjective(),
    sideId = this.focusFireOperation.sideId,
    recommendation = this.getFocusFireRecommendation(objective, sideId)
  ) {
    const normalizedLabel = optionLabel.trim();
    if (!normalizedLabel || !objective || !sideId || !recommendation) {
      return null;
    }

    if (
      !recommendation.options.some((option) => option.label === normalizedLabel)
    ) {
      return null;
    }

    const telemetryRecord =
      this.recordFocusFireRecommendationTelemetry(
        objective,
        sideId,
        recommendation
      ) ??
      this.findLatestFocusFireRecommendationTelemetryRecord(
        sideId,
        objective,
        recommendation.primaryTargetId
      );
    if (!telemetryRecord) {
      return null;
    }

    telemetryRecord.feedbackOptionLabel = normalizedLabel;
    telemetryRecord.feedbackCapturedAt = this.currentScenario.currentTime;
    this.focusFireRecommendationTelemetrySignatures.set(
      buildFocusFireRecommendationTelemetryKey(
        telemetryRecord.sideId,
        telemetryRecord.objectiveName,
        telemetryRecord.objectiveLatitude,
        telemetryRecord.objectiveLongitude,
        telemetryRecord.primaryTargetId
      ),
      buildFocusFireRecommendationTelemetryRecordSignature(telemetryRecord)
    );
    return telemetryRecord;
  }

  getFocusFireAnalysisTargets(
    objective:
      | FocusFireObjectivePoint
      | undefined = this.getFocusFireObjective(),
    sideId = this.focusFireOperation.sideId,
    primaryTargetId?: string | null
  ): FocusFireAnalysisTarget[] {
    if (!objective || !sideId) {
      return [];
    }

    const hostileSideIds = this.getFocusFireHostileSideIds(sideId);
    const targets: FocusFireAnalysisTarget[] = [
      ...this.currentScenario.aircraft.map((aircraft) => ({
        id: aircraft.id,
        name: aircraft.name,
        sideId: aircraft.sideId,
        className: aircraft.className,
        latitude: aircraft.latitude,
        longitude: aircraft.longitude,
        entityType: "aircraft" as const,
        weaponInventory: aircraft.getTotalWeaponQuantity(),
      })),
      ...this.currentScenario.armies.map((army) => ({
        id: army.id,
        name: army.name,
        sideId: army.sideId,
        className: army.className,
        latitude: army.latitude,
        longitude: army.longitude,
        entityType: "army" as const,
        weaponInventory: army.getTotalWeaponQuantity(),
      })),
      ...this.currentScenario.facilities.map((facility) => ({
        id: facility.id,
        name: facility.name,
        sideId: facility.sideId,
        className: facility.className,
        latitude: facility.latitude,
        longitude: facility.longitude,
        entityType: "facility" as const,
        weaponInventory: facility.getTotalWeaponQuantity(),
      })),
      ...this.currentScenario.airbases.map((airbase) => ({
        id: airbase.id,
        name: airbase.name,
        sideId: airbase.sideId,
        className: airbase.className,
        latitude: airbase.latitude,
        longitude: airbase.longitude,
        entityType: "airbase" as const,
        weaponInventory: airbase.aircraft.length * 4,
      })),
      ...this.currentScenario.ships.map((ship) => ({
        id: ship.id,
        name: ship.name,
        sideId: ship.sideId,
        className: ship.className,
        latitude: ship.latitude,
        longitude: ship.longitude,
        entityType: "ship" as const,
        weaponInventory: ship.getTotalWeaponQuantity(),
      })),
    ];

    return targets
      .filter((target) => hostileSideIds.has(target.sideId))
      .filter(
        (target) =>
          getDistanceBetweenTwoPoints(
            objective.latitude,
            objective.longitude,
            target.latitude,
            target.longitude
          ) <= FOCUS_FIRE_TARGET_ANALYSIS_RADIUS_KM
      )
      .sort((left, right) => {
        if (primaryTargetId) {
          if (left.id === primaryTargetId && right.id !== primaryTargetId) {
            return -1;
          }
          if (right.id === primaryTargetId && left.id !== primaryTargetId) {
            return 1;
          }
        }

        const combatGap =
          getFocusFireAnalysisTargetCombatValue(right) -
          getFocusFireAnalysisTargetCombatValue(left);
        if (combatGap !== 0) {
          return combatGap;
        }

        return (
          getDistanceBetweenTwoPoints(
            objective.latitude,
            objective.longitude,
            left.latitude,
            left.longitude
          ) -
          getDistanceBetweenTwoPoints(
            objective.latitude,
            objective.longitude,
            right.latitude,
            right.longitude
          )
        );
      });
  }

  buildFocusFireRecommendation(
    objective: FocusFireObjectivePoint | undefined,
    sideId: string | null | undefined,
    desiredEffectOverride: number | null = null,
    primaryTargetId: string | null = null
  ): FocusFireRecommendation | null {
    if (!objective || !sideId) {
      return null;
    }

    const analysisTargets = this.getFocusFireAnalysisTargets(
      objective,
      sideId,
      primaryTargetId
    );
    const primaryTarget = analysisTargets[0];
    const engagementPoint = primaryTarget ?? objective;
    const targetSideNames = [
      ...new Set(
        analysisTargets.map((target) =>
          this.currentScenario.getSideName(target.sideId)
        )
      ),
    ].filter((name) => name !== "N/A");
    const targetCompositionMap = new Map<string, FocusFireTargetComposition>();
    let highValueTargetCount = 0;
    let armorTargetCount = 0;

    analysisTargets.forEach((target) => {
      const label = getFocusFireAnalysisTargetCategoryLabel(target);
      const combatPower = getFocusFireAnalysisTargetCombatValue(target);
      const currentEntry = targetCompositionMap.get(label) ?? {
        label,
        count: 0,
        combatPower: 0,
      };

      currentEntry.count += 1;
      currentEntry.combatPower += combatPower;
      targetCompositionMap.set(label, currentEntry);

      if (
        target.entityType === "airbase" ||
        target.entityType === "ship" ||
        (target.entityType === "facility" &&
          isFiresFacilityClassName(target.className))
      ) {
        highValueTargetCount += 1;
      }

      if (
        target.entityType === "facility" &&
        isTankFacilityClassName(target.className)
      ) {
        armorTargetCount += 1;
      }
    });

    const targetComposition = [...targetCompositionMap.values()]
      .map((entry) => ({
        ...entry,
        combatPower: Math.round(entry.combatPower),
      }))
      .sort((left, right) => right.combatPower - left.combatPower);
    const targetCombatPower = Math.round(
      analysisTargets.reduce(
        (sum, target) => sum + getFocusFireAnalysisTargetCombatValue(target),
        0
      )
    );
    const desiredEffect =
      targetCombatPower > 0
        ? roundToDigits(
            targetCombatPower * 0.11 +
              highValueTargetCount * 1.4 +
              armorTargetCount * 0.6,
            1
          )
        : 0;
    const desiredEffectRequested = roundToDigits(
      desiredEffectOverride ?? desiredEffect,
      1
    );
    const desiredEffectIsUserDefined = desiredEffectOverride !== null;
    const missionKind = getFocusFireMissionKind(
      targetComposition,
      analysisTargets.length,
      highValueTargetCount,
      armorTargetCount
    );
    const targetPriorityLabel = getFocusFireTargetPriorityLabel(
      targetCombatPower,
      highValueTargetCount
    );
    const desiredEffectLabel = getFocusFireDesiredEffectLabel(
      missionKind,
      analysisTargets.length,
      highValueTargetCount,
      desiredEffect
    );

    const recommendationMap = new Map<
      string,
      FocusFireRecommendationAccumulator
    >();
    const candidatePlatforms = [
      ...this.getFocusFireArtilleryFacilities(sideId),
      ...this.getFocusFireAircraft(sideId),
    ];

    candidatePlatforms.forEach((platform) => {
      const distanceKm = getDistanceBetweenTwoPoints(
        platform.latitude,
        platform.longitude,
        engagementPoint.latitude,
        engagementPoint.longitude
      );

      platform.weapons
        .filter((weapon) => weapon.currentQuantity > 0)
        .forEach((weapon) => {
          const key = weapon.className || weapon.name;
          const expectedStrikeEffect =
            weapon.currentQuantity * weapon.lethality;
          const ammoType = getFocusFireAmmoType(
            getDisplayName(weapon.className || weapon.name),
            getFocusFireWeaponProfile(
              getDisplayName(weapon.className || weapon.name)
            )
          );
          const executionAssessment = this.getFocusFireExecutionAssessment(
            platform,
            weapon,
            engagementPoint,
            sideId
          );
          const currentGroup = recommendationMap.get(key) ?? {
            weaponName: getDisplayName(weapon.className || weapon.name),
            shotCount: 0,
            expectedStrikeEffect: 0,
            weightedDistanceSum: 0,
            minimumDistanceKm: distanceKm,
            maximumDistanceKm: distanceKm,
            immediateLaunchReadyCount: 0,
            repositionRequiredCount: 0,
            blockedLauncherCount: 0,
            totalTimeToFireSeconds: 0,
            maximumTimeToFireSeconds: null,
            threatExposureScore: 0,
            firingPlan: [],
          };

          if (executionAssessment.executionState === "blocked") {
            currentGroup.blockedLauncherCount += 1;
            recommendationMap.set(key, currentGroup);
            return;
          }

          currentGroup.shotCount += weapon.currentQuantity;
          currentGroup.expectedStrikeEffect += expectedStrikeEffect;
          currentGroup.weightedDistanceSum +=
            distanceKm * weapon.currentQuantity;
          currentGroup.minimumDistanceKm = Math.min(
            currentGroup.minimumDistanceKm,
            distanceKm
          );
          currentGroup.maximumDistanceKm = Math.max(
            currentGroup.maximumDistanceKm,
            distanceKm
          );
          currentGroup.threatExposureScore +=
            executionAssessment.threatExposureScore;
          currentGroup.totalTimeToFireSeconds +=
            executionAssessment.estimatedTimeToFireSeconds ?? 0;
          currentGroup.maximumTimeToFireSeconds =
            executionAssessment.estimatedTimeToFireSeconds == null
              ? currentGroup.maximumTimeToFireSeconds
              : Math.max(
                  currentGroup.maximumTimeToFireSeconds ?? 0,
                  executionAssessment.estimatedTimeToFireSeconds
                );
          if (executionAssessment.executionState === "ready") {
            currentGroup.immediateLaunchReadyCount += 1;
          } else {
            currentGroup.repositionRequiredCount += 1;
          }

          const existingPlan = currentGroup.firingPlan.find(
            (plan) => plan.launcherId === platform.id
          );
          if (existingPlan) {
            existingPlan.shotCount += weapon.currentQuantity;
            existingPlan.expectedStrikeEffect += expectedStrikeEffect;
          } else {
            currentGroup.firingPlan.push({
              launcherId: platform.id,
              launcherName: platform.name,
              launcherClassName: platform.className,
              variant: this.getFocusFireLaunchVariant(platform),
              ammoType,
              weaponName: getDisplayName(weapon.className || weapon.name),
              shotCount: weapon.currentQuantity,
              distanceKm,
              expectedStrikeEffect,
              executionState: executionAssessment.executionState,
              estimatedTimeToFireSeconds:
                executionAssessment.estimatedTimeToFireSeconds,
              threatExposureScore: executionAssessment.threatExposureScore,
            });
          }

          recommendationMap.set(key, currentGroup);
        });
    });

    const heuristicRecommendations = [...recommendationMap.values()]
      .filter((candidate) => candidate.shotCount > 0)
      .map((candidate) => ({
        ...candidate,
        profile: getFocusFireWeaponProfile(candidate.weaponName),
        ammoType: getFocusFireAmmoType(
          candidate.weaponName,
          getFocusFireWeaponProfile(candidate.weaponName)
        ),
        launcherCount:
          candidate.immediateLaunchReadyCount +
          candidate.repositionRequiredCount,
        averageDistanceKm:
          candidate.shotCount > 0
            ? candidate.weightedDistanceSum / candidate.shotCount
            : Number.POSITIVE_INFINITY,
        averageTimeToFireSeconds:
          candidate.immediateLaunchReadyCount +
            candidate.repositionRequiredCount >
          0
            ? candidate.totalTimeToFireSeconds /
              (candidate.immediateLaunchReadyCount +
                candidate.repositionRequiredCount)
            : null,
        executionReadinessLabel: getFocusFireExecutionReadinessLabel(
          candidate.immediateLaunchReadyCount,
          candidate.repositionRequiredCount,
          candidate.blockedLauncherCount
        ),
        firingPlan: [...candidate.firingPlan].sort(
          (left, right) =>
            (left.estimatedTimeToFireSeconds ?? 0) -
              (right.estimatedTimeToFireSeconds ?? 0) ||
            left.distanceKm - right.distanceKm
        ),
      }))
      .map((candidate) => {
        let profileBonus = 2;
        switch (candidate.profile) {
          case "cluster":
            profileBonus +=
              Math.max(analysisTargets.length - 1, 0) * 1.5 +
              targetComposition
                .filter((entry) =>
                  ["기지", "지상 시설", "화력 시설"].includes(entry.label)
                )
                .reduce((sum, entry) => sum + entry.count, 0) *
                1.2;
            if (missionKind === "지역 제압" || missionKind === "대화력전") {
              profileBonus += 4;
            }
            break;
          case "precision":
            profileBonus += highValueTargetCount * 3.2;
            if (analysisTargets.length <= 2) {
              profileBonus += 3;
            }
            if (missionKind === "정밀 타격") {
              profileBonus += 4.5;
            }
            break;
          case "antiArmor":
            profileBonus += armorTargetCount * 3.5;
            if (missionKind === "기갑 제압") {
              profileBonus += 4;
            }
            break;
          case "antiShip":
            profileBonus +=
              targetComposition
                .filter((entry) => entry.label === "함정")
                .reduce((sum, entry) => sum + entry.count, 0) * 4.5;
            if (missionKind === "대함 타격") {
              profileBonus += 5;
            }
            break;
          case "general":
            profileBonus += Math.min(analysisTargets.length, 3);
            break;
        }

        const baseSuitabilityScore =
          candidate.expectedStrikeEffect * 12 +
          profileBonus +
          Math.min(candidate.shotCount, 24) * 0.25 +
          candidate.immediateLaunchReadyCount * 10 +
          candidate.repositionRequiredCount * 4 -
          candidate.blockedLauncherCount * 5 -
          (candidate.averageTimeToFireSeconds ?? 0) / 180 -
          candidate.threatExposureScore * 3 -
          candidate.averageDistanceKm * 0.08;

        const desiredEffectGap = Math.abs(
          candidate.expectedStrikeEffect - desiredEffectRequested
        );
        const requestedCoverageRatio =
          desiredEffectRequested > 0
            ? candidate.expectedStrikeEffect / desiredEffectRequested
            : 1;

        let suitabilityScore = baseSuitabilityScore;
        if (desiredEffectIsUserDefined) {
          const effectMatchScore = Math.max(0, 30 - desiredEffectGap * 18);
          let coverageAdjustment = 0;
          if (requestedCoverageRatio >= 1 && requestedCoverageRatio <= 1.8) {
            coverageAdjustment += 12;
          } else if (requestedCoverageRatio < 1) {
            coverageAdjustment -= (1 - requestedCoverageRatio) * 20;
          } else if (requestedCoverageRatio > 1.8) {
            coverageAdjustment -= Math.min(
              12,
              (requestedCoverageRatio - 1.8) * 10
            );
          }

          suitabilityScore =
            profileBonus * 1.4 +
            effectMatchScore +
            coverageAdjustment +
            candidate.immediateLaunchReadyCount * 8 +
            candidate.repositionRequiredCount * 3 -
            candidate.blockedLauncherCount * 6 -
            (candidate.averageTimeToFireSeconds ?? 0) / 150 -
            candidate.threatExposureScore * 2.5 +
            candidate.shotCount * 0.15 -
            candidate.averageDistanceKm * 0.06;
        }

        suitabilityScore = roundToDigits(suitabilityScore, 1);

        return {
          label: "",
          ammoType: candidate.ammoType,
          weaponName: candidate.weaponName,
          shotCount: candidate.shotCount,
          launcherCount: candidate.launcherCount,
          firingUnitNames: candidate.firingPlan.map(
            (plan) => plan.launcherName
          ),
          averageDistanceKm: roundToDigits(candidate.averageDistanceKm, 1),
          minimumDistanceKm: roundToDigits(candidate.minimumDistanceKm, 1),
          maximumDistanceKm: roundToDigits(candidate.maximumDistanceKm, 1),
          immediateLaunchReadyCount: candidate.immediateLaunchReadyCount,
          repositionRequiredCount: candidate.repositionRequiredCount,
          blockedLauncherCount: candidate.blockedLauncherCount,
          averageTimeToFireSeconds:
            candidate.averageTimeToFireSeconds == null
              ? null
              : roundToDigits(candidate.averageTimeToFireSeconds, 1),
          maximumTimeToFireSeconds:
            candidate.maximumTimeToFireSeconds == null
              ? null
              : roundToDigits(candidate.maximumTimeToFireSeconds, 1),
          threatExposureScore: roundToDigits(candidate.threatExposureScore, 1),
          executionReadinessLabel: candidate.executionReadinessLabel,
          expectedStrikeEffect: roundToDigits(
            candidate.expectedStrikeEffect,
            2
          ),
          heuristicScore: suitabilityScore,
          rerankerScore: null,
          suitabilityScore,
          rationale: buildFocusFireRecommendationRationale(
            candidate.ammoType,
            candidate.weaponName,
            candidate.profile,
            missionKind,
            candidate.executionReadinessLabel,
            candidate.launcherCount,
            analysisTargets.length,
            highValueTargetCount
          ),
          firingPlan: candidate.firingPlan.map((plan) => ({
            ...plan,
            distanceKm: roundToDigits(plan.distanceKm, 1),
            expectedStrikeEffect: roundToDigits(plan.expectedStrikeEffect, 2),
            estimatedTimeToFireSeconds:
              plan.estimatedTimeToFireSeconds == null
                ? null
                : roundToDigits(plan.estimatedTimeToFireSeconds, 1),
            threatExposureScore: roundToDigits(plan.threatExposureScore, 1),
          })),
        } satisfies FocusFireRecommendationOption;
      })
      .sort((left, right) => {
        if (right.suitabilityScore !== left.suitabilityScore) {
          return right.suitabilityScore - left.suitabilityScore;
        }
        if (right.expectedStrikeEffect !== left.expectedStrikeEffect) {
          return right.expectedStrikeEffect - left.expectedStrikeEffect;
        }
        if (right.shotCount !== left.shotCount) {
          return right.shotCount - left.shotCount;
        }
        return (
          (left.averageDistanceKm ?? Number.POSITIVE_INFINITY) -
          (right.averageDistanceKm ?? Number.POSITIVE_INFINITY)
        );
      });

    const rerankerApplied =
      this.focusFireRerankerEnabled && heuristicRecommendations.length > 0;
    const rankedRecommendations = rerankerApplied
      ? rerankFocusFireCandidates(
          heuristicRecommendations.map((option) => ({
            ...option,
            desiredEffect: desiredEffectRequested,
          })),
          this.focusFireRerankerModel
        ).map(({ candidate, rerankerScore }) => {
          const explanation = explainFocusFireRerankerCandidate(
            {
              ...candidate,
              desiredEffect: desiredEffectRequested,
            },
            this.focusFireRerankerModel
          );
          return {
            ...candidate,
            rerankerScore: roundToDigits(rerankerScore, 4),
            aiReasonSummary: explanation.summary,
            aiPositiveSignals: explanation.positiveSignals,
            aiNegativeSignals: explanation.negativeSignals,
          };
        })
      : heuristicRecommendations;
    const recommendations = rankedRecommendations
      .slice(0, 3)
      .map((option, index) => ({
        ...option,
        label: `추천 ${index + 1}안`,
      }));

    const bestRecommendation = recommendations[0] ?? null;
    const rerankerConfidenceScore = rerankerApplied
      ? getFocusFireRerankerConfidence(this.focusFireRerankerModel)
      : 0;
    const treeTrainerLabel =
      this.focusFireRerankerModel.treeEnsemble?.trainer ?? "";
    const rerankerSelectionLabel = rerankerApplied
      ? `${
          this.focusFireRerankerModel.modelFamily === "tree-ensemble"
            ? treeTrainerLabel.includes("LightGBM")
              ? "AI LambdaRank"
              : "AI TreeRank"
            : "AI 재정렬"
        } v${this.focusFireRerankerModel.version} · 신뢰도 ${Math.round(
          rerankerConfidenceScore * 100
        )}%`
      : "규칙 기반";
    let priorityScore =
      targetCombatPower +
      highValueTargetCount * 18 +
      armorTargetCount * 8 +
      Math.max(analysisTargets.length - 1, 0) * 3;

    switch (missionKind) {
      case "대함 타격":
        priorityScore += 18;
        break;
      case "대화력전":
        priorityScore += 14;
        break;
      case "정밀 타격":
        priorityScore += 12;
        break;
      case "기갑 제압":
        priorityScore += 8;
        break;
      case "지역 제압":
        priorityScore += 6;
        break;
      default:
        priorityScore += 4;
        break;
    }

    if (bestRecommendation) {
      priorityScore += bestRecommendation.suitabilityScore * 0.35;
      priorityScore +=
        Math.min(
          bestRecommendation.expectedStrikeEffect,
          desiredEffectRequested
        ) * 1.4;
    }
    priorityScore = roundToDigits(priorityScore, 1);

    return {
      recommendedOptionLabel: bestRecommendation?.label ?? null,
      primaryTargetId: primaryTarget?.id ?? primaryTargetId ?? null,
      priorityScore,
      missionKind,
      targetPriorityLabel,
      desiredEffectLabel,
      ammoType: bestRecommendation?.ammoType ?? null,
      desiredEffectEstimated: desiredEffect,
      desiredEffectIsUserDefined,
      firingUnitNames: bestRecommendation
        ? bestRecommendation.firingUnitNames
        : [],
      targetName: buildFocusFireTargetLabel(
        analysisTargets[0],
        analysisTargets.length,
        objective.name
      ),
      targetSideNames,
      targetCount: analysisTargets.length,
      targetComposition,
      targetLatitude: primaryTarget?.latitude ?? objective.latitude,
      targetLongitude: primaryTarget?.longitude ?? objective.longitude,
      targetCombatPower,
      desiredEffect: desiredEffectRequested,
      targetDistanceKm: bestRecommendation
        ? roundToDigits(bestRecommendation.averageDistanceKm, 1)
        : null,
      minimumTargetDistanceKm: bestRecommendation
        ? bestRecommendation.minimumDistanceKm
        : null,
      maximumTargetDistanceKm: bestRecommendation
        ? bestRecommendation.maximumDistanceKm
        : null,
      immediateLaunchReadyCount:
        bestRecommendation?.immediateLaunchReadyCount ?? 0,
      repositionRequiredCount: bestRecommendation?.repositionRequiredCount ?? 0,
      blockedLauncherCount: bestRecommendation?.blockedLauncherCount ?? 0,
      averageTimeToFireSeconds:
        bestRecommendation?.averageTimeToFireSeconds ?? null,
      threatExposureScore: bestRecommendation?.threatExposureScore ?? 0,
      launchReadinessLabel:
        bestRecommendation?.executionReadinessLabel ?? "추천 없음",
      selectionModelLabel: rerankerSelectionLabel,
      rerankerApplied,
      weaponName: bestRecommendation?.weaponName ?? null,
      shotCount: bestRecommendation?.shotCount ?? 0,
      expectedStrikeEffect: bestRecommendation
        ? bestRecommendation.expectedStrikeEffect
        : 0,
      options: recommendations,
    };
  }

  getFocusFireRecommendation(
    objective:
      | FocusFireObjectivePoint
      | undefined = this.getFocusFireObjective(),
    sideId = this.focusFireOperation.sideId
  ): FocusFireRecommendation | null {
    return this.buildFocusFireRecommendation(
      objective,
      sideId,
      this.focusFireOperation.desiredEffectOverride
    );
  }

  getFireRecommendationForTarget(
    targetId: string,
    sideId = this.currentSideId,
    desiredEffectOverride: number | null = null
  ): FocusFireRecommendation | null {
    if (!sideId) {
      return null;
    }

    const target = this.getTargetById(targetId);
    if (
      !target ||
      !(
        target instanceof Aircraft ||
        target instanceof Army ||
        target instanceof Facility ||
        target instanceof Ship ||
        target instanceof Airbase
      )
    ) {
      return null;
    }

    if (!this.getFocusFireHostileSideIds(sideId).has(target.sideId)) {
      return null;
    }

    return this.buildFocusFireRecommendation(
      {
        name: target.name,
        latitude: target.latitude,
        longitude: target.longitude,
      },
      sideId,
      desiredEffectOverride,
      target.id
    );
  }

  getFireRecommendationTargetPriorities(
    sideId = this.currentSideId,
    targetIds?: string[]
  ): FireRecommendationTargetPriority[] {
    if (!sideId) {
      return [];
    }

    const explicitTargetIds = targetIds?.filter((targetId) => targetId) ?? [];
    const candidateTargets = (
      explicitTargetIds.length > 0
        ? explicitTargetIds
            .map((targetId) => this.getTargetById(targetId))
            .filter((target): target is Target => target !== undefined)
        : this.currentScenario.getAllTargetsFromEnemySides(sideId)
    ).filter(
      (target): target is Aircraft | Army | Facility | Ship | Airbase =>
        target instanceof Aircraft ||
        target instanceof Army ||
        target instanceof Facility ||
        target instanceof Ship ||
        target instanceof Airbase
    );

    return [
      ...new Map(
        candidateTargets.map((target) => [target.id, target])
      ).values(),
    ]
      .map((target) => {
        const recommendation = this.getFireRecommendationForTarget(
          target.id,
          sideId
        );
        if (!recommendation) {
          return null;
        }

        return {
          targetId: target.id,
          targetName: target.name,
          targetClassName: target.className,
          targetSideId: target.sideId,
          targetSideName: this.currentScenario.getSideName(target.sideId),
          priorityRank: 0,
          priorityScore: recommendation.priorityScore,
          recommendation,
        } satisfies FireRecommendationTargetPriority;
      })
      .filter(
        (entry): entry is FireRecommendationTargetPriority => entry !== null
      )
      .sort((left, right) => {
        if (right.priorityScore !== left.priorityScore) {
          return right.priorityScore - left.priorityScore;
        }
        if (
          right.recommendation.targetCombatPower !==
          left.recommendation.targetCombatPower
        ) {
          return (
            right.recommendation.targetCombatPower -
            left.recommendation.targetCombatPower
          );
        }
        return left.targetName.localeCompare(right.targetName);
      })
      .map((entry, index) => ({
        ...entry,
        priorityRank: index + 1,
      }));
  }

  getFocusFireSummary(): FocusFireSummary {
    const objective = this.getFocusFireObjective();
    const aircraftCount = this.getFocusFireAircraft().length;
    const artilleryCount = this.getFocusFireArtilleryFacilities().length;
    const armorCount = this.getFocusFireArmorFacilities().length;
    const launchPlatforms = this.getFocusFireLaunchPlatforms();
    const weaponTracks = this.getFocusFireWeaponTracks(objective);
    const weaponsInFlight = weaponTracks.length;
    const recommendation = this.getFocusFireRecommendation(objective);
    this.recordFocusFireRecommendationTelemetry(
      objective,
      this.focusFireOperation.sideId,
      recommendation
    );

    let statusLabel = "대기";
    if (this.focusFireOperation.enabled && !objective) {
      statusLabel = "목표 지정 대기";
    } else if (this.focusFireOperation.captureProgress >= 100) {
      statusLabel = "목표 확보 완료";
    } else if (this.focusFireOperation.active && objective) {
      statusLabel = "집중포격 진행 중";
    } else if (this.focusFireOperation.enabled && objective) {
      statusLabel = "집중포격 준비";
    }

    return {
      enabled: this.focusFireOperation.enabled,
      active: this.focusFireOperation.active,
      objectiveName: objective?.name ?? null,
      objectiveLatitude: objective?.latitude ?? null,
      objectiveLongitude: objective?.longitude ?? null,
      desiredEffectOverride: this.focusFireOperation.desiredEffectOverride,
      captureProgress: this.focusFireOperation.captureProgress,
      artilleryCount,
      armorCount,
      aircraftCount,
      weaponsInFlight,
      statusLabel,
      launchPlatforms,
      weaponTracks,
      recommendation,
    };
  }

  clearFocusFireOperation(
    removeObjective = true,
    recordHistory = false
  ): FocusFireOperation {
    const objectiveId = this.focusFireOperation.objectiveReferencePointId;
    const sideId = this.focusFireOperation.sideId;

    if (recordHistory) {
      this.recordHistory();
    }

    this.getFocusFireAircraft(sideId).forEach((aircraft) => {
      aircraft.route = [];
      aircraft.targetId = "";
    });
    this.getFocusFireArmorFacilities(sideId).forEach((facility) => {
      facility.route = [];
    });

    if (removeObjective && objectiveId) {
      this.currentScenario.referencePoints =
        this.currentScenario.referencePoints.filter(
          (referencePoint) => referencePoint.id !== objectiveId
        );
    }

    this.focusFireOperation = createDefaultFocusFireOperation();
    return this.focusFireOperation;
  }

  setFocusFireMode(enabled: boolean = !this.focusFireOperation.enabled) {
    if (enabled) {
      if (!this.currentSideId) {
        return false;
      }
      this.focusFireOperation.enabled = true;
      this.focusFireOperation.sideId = this.currentSideId;
      return true;
    }

    this.clearFocusFireOperation(true, true);
    return false;
  }

  setFocusFireDesiredEffectOverride(
    desiredEffectOverride: number | null,
    recordHistory = true
  ) {
    if (!this.focusFireOperation.enabled && !this.currentSideId) {
      return null;
    }

    const normalizedDesiredEffect =
      desiredEffectOverride == null
        ? null
        : roundToDigits(Math.max(desiredEffectOverride, 0.1), 1);

    if (
      this.focusFireOperation.desiredEffectOverride === normalizedDesiredEffect
    ) {
      return this.focusFireOperation.desiredEffectOverride;
    }

    if (recordHistory) {
      this.recordHistory();
    }

    if (!this.focusFireOperation.enabled) {
      this.focusFireOperation.enabled = true;
      this.focusFireOperation.sideId =
        this.focusFireOperation.sideId ?? this.currentSideId;
    }

    this.focusFireOperation.desiredEffectOverride = normalizedDesiredEffect;
    return this.focusFireOperation.desiredEffectOverride;
  }

  setFocusFireObjective(latitude: number, longitude: number) {
    if (!this.currentSideId) {
      return;
    }

    this.recordHistory();

    if (!this.focusFireOperation.enabled) {
      this.focusFireOperation.enabled = true;
    }

    let objective = this.getFocusFireObjective();
    if (objective) {
      objective.latitude = latitude;
      objective.longitude = longitude;
      objective.sideId = this.currentSideId;
      objective.sideColor = this.currentScenario.getSideColor(
        this.currentSideId
      );
      objective.name = FOCUS_FIRE_OBJECTIVE_NAME;
    } else {
      objective = new ReferencePoint({
        id: randomUUID(),
        name: FOCUS_FIRE_OBJECTIVE_NAME,
        sideId: this.currentSideId,
        latitude,
        longitude,
        altitude: 0,
        sideColor: this.currentScenario.getSideColor(this.currentSideId),
      });
      this.currentScenario.referencePoints.push(objective);
    }

    this.getFocusFireAircraft(this.currentSideId).forEach((aircraft) => {
      aircraft.route = [];
      aircraft.targetId = "";
    });
    this.getFocusFireArmorFacilities(this.currentSideId).forEach((facility) => {
      facility.route = [];
    });

    this.focusFireOperation = {
      enabled: true,
      active: true,
      sideId: this.currentSideId,
      objectiveReferencePointId: objective.id,
      desiredEffectOverride: this.focusFireOperation.desiredEffectOverride,
      captureProgress: 0,
      launchedPlatformIds: [],
    };

    this.simulationLogs.addLog(
      this.currentSideId,
      `${FOCUS_FIRE_OBJECTIVE_NAME}을(를) 지정했습니다. 모든 화력이 목표 지점에 집중됩니다.`,
      this.currentScenario.currentTime,
      SimulationLogType.OTHER,
      {
        objectiveId: objective.id,
        objectiveName: objective.name,
        resultTag: "objective_assigned",
      }
    );

    return objective;
  }

  getFocusFireArmorDestination(
    objective: ReferencePoint,
    index: number,
    total: number
  ) {
    if (total <= 1) {
      return [objective.latitude, objective.longitude];
    }

    const bearing = (360 / total) * index;
    return getTerminalCoordinatesFromDistanceAndBearing(
      objective.latitude,
      objective.longitude,
      0.35,
      bearing
    );
  }

  launchAllWeaponsAtObjective(
    origin: Aircraft | Army | Facility,
    objective: ReferencePoint
  ) {
    let launchedCount = 0;
    origin.weapons.forEach((weapon) => {
      weapon.latitude = origin.latitude;
      weapon.longitude = origin.longitude;
    });
    const availableWeapons = origin.weapons.filter(
      (weapon) => weapon.currentQuantity > 0
    );

    availableWeapons.forEach((weapon) => {
      const quantity = weapon.currentQuantity;
      if (quantity <= 0) {
        return;
      }
      launchWeapon(
        this.currentScenario,
        origin,
        objective,
        weapon,
        quantity,
        this.simulationLogs
      );
      launchedCount += quantity;
    });

    return launchedCount;
  }

  addSide(
    sideName: string,
    sideColor: SIDE_COLOR,
    sideHostiles: string[],
    sideAllies: string[],
    sideDoctrine: SideDoctrine
  ) {
    const side = new Side({
      id: randomUUID(),
      name: sideName,
      color: sideColor,
    });
    this.currentScenario.sides.push(side);
    this.currentScenario.relationships.updateRelationship(
      side.id,
      sideHostiles,
      sideAllies
    );
    this.currentScenario.updateSideDoctrine(side.id, sideDoctrine);
  }

  updateSide(
    sideId: string,
    sideName: string,
    sideColor: SIDE_COLOR,
    sideHostiles: string[],
    sideAllies: string[],
    sideDoctrine: SideDoctrine
  ) {
    const side = this.currentScenario.getSide(sideId);
    if (side) {
      this.recordHistory();
      side.name = sideName;
      side.color = sideColor;
      this.currentScenario.airbases.forEach((airbase) => {
        if (airbase.sideId === sideId) {
          airbase.sideColor = sideColor;
          airbase.aircraft.forEach((aircraft) => {
            aircraft.sideColor = sideColor;
            aircraft.weapons.forEach((weapon) => {
              weapon.sideColor = sideColor;
            });
          });
        }
      });
      this.currentScenario.ships.forEach((ship) => {
        if (ship.sideId === sideId) {
          ship.sideColor = sideColor;
          ship.aircraft.forEach((aircraft) => {
            aircraft.sideColor = sideColor;
            aircraft.weapons.forEach((weapon) => {
              weapon.sideColor = sideColor;
            });
          });
          ship.weapons.forEach((weapon) => {
            weapon.sideColor = sideColor;
          });
        }
      });
      this.currentScenario.facilities.forEach((facility) => {
        if (facility.sideId === sideId) {
          facility.sideColor = sideColor;
          facility.weapons.forEach((weapon) => {
            weapon.sideColor = sideColor;
          });
        }
      });
      this.currentScenario.armies.forEach((army) => {
        if (army.sideId === sideId) {
          army.sideColor = sideColor;
          army.weapons.forEach((weapon) => {
            weapon.sideColor = sideColor;
          });
        }
      });
      this.currentScenario.aircraft.forEach((aircraft) => {
        if (aircraft.sideId === sideId) {
          aircraft.sideColor = sideColor;
          aircraft.weapons.forEach((weapon) => {
            weapon.sideColor = sideColor;
          });
        }
      });
      this.currentScenario.weapons.forEach((weapon) => {
        if (weapon.sideId === sideId) {
          weapon.sideColor = sideColor;
        }
      });
      this.currentScenario.referencePoints.forEach((referencePoint) => {
        if (referencePoint.sideId === sideId) {
          referencePoint.sideColor = sideColor;
        }
      });
      this.currentScenario.missions.forEach((mission) => {
        if (mission instanceof PatrolMission) {
          mission.assignedArea.forEach((point) => {
            if (point.sideId === sideId) {
              point.sideColor = sideColor;
            }
          });
        }
      });
      this.currentScenario.relationships.updateRelationship(
        sideId,
        sideHostiles,
        sideAllies
      );
      this.currentScenario.updateSideDoctrine(side.id, sideDoctrine);
    }
  }

  deleteSide(sideId: string) {
    this.recordHistory();
    this.currentScenario.sides = this.currentScenario.sides.filter(
      (side) => side.id !== sideId
    );
    this.currentScenario.aircraft = this.currentScenario.aircraft.filter(
      (aircraft) => aircraft.sideId !== sideId
    );
    this.currentScenario.airbases = this.currentScenario.airbases.filter(
      (airbase) => airbase.sideId !== sideId
    );
    this.currentScenario.armies = this.currentScenario.armies.filter(
      (army) => army.sideId !== sideId
    );
    this.currentScenario.facilities = this.currentScenario.facilities.filter(
      (facility) => facility.sideId !== sideId
    );
    this.currentScenario.ships = this.currentScenario.ships.filter(
      (ship) => ship.sideId !== sideId
    );
    this.currentScenario.missions = this.currentScenario.missions.filter(
      (mission) => mission.sideId !== sideId
    );
    this.currentScenario.weapons = this.currentScenario.weapons.filter(
      (weapon) => weapon.sideId !== sideId
    );
    this.currentScenario.referencePoints =
      this.currentScenario.referencePoints.filter(
        (referencePoint) => referencePoint.sideId !== sideId
      );
    this.currentScenario.relationships.deleteSide(sideId);
    this.currentScenario.removeSideDoctrine(sideId);
    if (this.currentSideId === sideId) {
      this.currentSideId = this.currentScenario.sides[0]?.id ?? "";
    }
  }

  getDefaultWeapons(
    weaponKeys: Record<string, number>,
    sideId: string,
    sideColor: SIDE_COLOR
  ): Weapon[] {
    const weapons: Weapon[] = [];
    const weaponTemplates = this.unitDba
      .getWeaponDb()
      .filter((weapon) => weapon.className in weaponKeys);
    weaponTemplates.forEach((weapon) => {
      const weaponQuantity = weaponKeys[weapon.className];
      const newWeapon = new Weapon({
        id: randomUUID(),
        launcherId: "None",
        name: weapon.className,
        sideId: sideId,
        className: weapon.className,
        latitude: 0.0,
        longitude: 0.0,
        altitude: 10000.0,
        heading: 90.0,
        speed: weapon.speed,
        currentFuel: weapon.maxFuel,
        maxFuel: weapon.maxFuel,
        fuelRate: weapon.fuelRate,
        range: 100,
        sideColor: sideColor,
        targetId: null,
        lethality: weapon.lethality,
        maxQuantity: weaponQuantity,
        currentQuantity: weaponQuantity,
      });
      weapons.push(newWeapon);
    });

    return weapons;
  }

  getDefaultAircraftWeapons(
    sideId: string,
    sideColor: SIDE_COLOR,
    className?: string
  ): Weapon[] {
    const koreanAircraftWeaponKeys: Record<string, Record<string, number>> = {
      "KF-21 Boramae": {
        "AIM-120 AMRAAM": 4,
        "AIM-9 Sidewinder": 2,
        KGGB: 2,
      },
      "FA-50 Fighting Eagle": {
        "AIM-9 Sidewinder": 2,
        KGGB: 2,
      },
      "T-50 Golden Eagle": {
        "AIM-9 Sidewinder": 2,
      },
      "TA-50 Lead-In Fighter Trainer": {
        "AIM-9 Sidewinder": 2,
        KGGB: 2,
      },
      "F-15K Slam Eagle": {
        "AIM-120 AMRAAM": 4,
        "AIM-9 Sidewinder": 2,
        KGGB: 2,
      },
      "KF-16": {
        "AIM-120 AMRAAM": 4,
        "AIM-9 Sidewinder": 2,
        KGGB: 2,
      },
    };
    const aircraftWeaponKeys: Record<string, number> = {
      "AIM-120 AMRAAM": 4,
      "AIM-9 Sidewinder": 2,
      "AGM-65 Maverick": 2,
    };
    if (isDroneAircraftClassName(className)) {
      return this.getDefaultWeapons(
        {
          "AGM-65 Maverick": 2,
        },
        sideId,
        sideColor
      );
    }
    return this.getDefaultWeapons(
      className && koreanAircraftWeaponKeys[className]
        ? koreanAircraftWeaponKeys[className]
        : aircraftWeaponKeys,
      sideId,
      sideColor
    );
  }

  getDefaultFacilityWeapons(
    sideId: string,
    sideColor: SIDE_COLOR,
    className?: string
  ): Weapon[] {
    const koreanFacilityWeaponKeys: Record<string, Record<string, number>> = {
      "Chunmoo MRLS": {
        "Chunmoo Guided Rocket": 12,
        "KSRR (Korea Short Range Rocket)": 12,
      },
      "Tactical Surface to Surface Missile Launcher": {
        "Tactical Surface to Surface Missile": 4,
      },
      "L-SAM": {
        "L-SAM Interceptor": 8,
      },
      "Cheongung-II (KM-SAM Block II)": {
        "Cheongung-II Interceptor": 16,
      },
      "Cheongung (M-SAM)": {
        "Cheongung Interceptor": 16,
      },
      "Pegasus (K-SAM)": {
        "Pegasus SAM": 12,
      },
      "Biho Hybrid": {
        "Chiron MANPADS": 8,
      },
      "K2 Black Panther": {
        "120mm Tank Round": 12,
        "Tank Guided Missile": 4,
      },
    };
    const facilityWeaponKeys: Record<string, number> = {
      "48N6 (S-400 Triumf)": 8,
      "9M96 (S-300V4)": 12,
      "57E6E (Pantsir-S1)": 16,
    };
    return this.getDefaultWeapons(
      className && koreanFacilityWeaponKeys[className]
        ? koreanFacilityWeaponKeys[className]
        : isTankFacilityClassName(className)
          ? {}
          : facilityWeaponKeys,
      sideId,
      sideColor
    );
  }

  getDefaultShipWeapons(
    sideId: string,
    sideColor: SIDE_COLOR,
    className?: string
  ): Weapon[] {
    const koreanShipWeaponKeys: Record<string, Record<string, number>> = {
      "Jeongjo the Great-class Destroyer": {
        "Haegung (K-SAAM)": 24,
        "C-Star (SSM-700K Haeseong)": 8,
        "Red Shark (K-ASROC)": 12,
      },
      "Sejong the Great-class Destroyer": {
        "Haegung (K-SAAM)": 24,
        "C-Star (SSM-700K Haeseong)": 8,
        "Red Shark (K-ASROC)": 12,
      },
      "Chungmugong Yi Sun-sin-class Destroyer": {
        "Haegung (K-SAAM)": 16,
        "C-Star (SSM-700K Haeseong)": 8,
        "Red Shark (K-ASROC)": 8,
      },
      "Daegu-class Frigate": {
        "Haegung (K-SAAM)": 16,
        "C-Star (SSM-700K Haeseong)": 8,
        "Red Shark (K-ASROC)": 6,
      },
      "Incheon-class Frigate": {
        "Haegung (K-SAAM)": 16,
        "C-Star (SSM-700K Haeseong)": 8,
        "Red Shark (K-ASROC)": 4,
      },
      "Dokdo-class Amphibious Assault Ship": {
        "Haegung (K-SAAM)": 8,
        "C-Star (SSM-700K Haeseong)": 4,
      },
      "Yoon Youngha-class Patrol Craft": {
        "Haegung (K-SAAM)": 4,
        "C-Star (SSM-700K Haeseong)": 4,
      },
    };
    const shipWeaponKeys: Record<string, number> = {
      "RIM-174 Standard SM-6": 96,
      "RIM-116 RAM": 42,
      "RGM-84 Harpoon": 8,
    };
    return this.getDefaultWeapons(
      className && koreanShipWeaponKeys[className]
        ? koreanShipWeaponKeys[className]
        : shipWeaponKeys,
      sideId,
      sideColor
    );
  }

  addAircraft(
    aircraftName: string,
    className: string,
    latitude: number,
    longitude: number,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ): Aircraft | undefined {
    if (!this.currentSideId) {
      return;
    }
    this.recordHistory();
    const aircraft = new Aircraft({
      id: randomUUID(),
      name: aircraftName,
      sideId: this.currentSideId,
      className: className,
      latitude: latitude,
      longitude: longitude,
      altitude: 10000.0,
      heading: 90.0,
      speed: speed ?? 300.0,
      currentFuel: maxFuel ?? 10000.0,
      maxFuel: maxFuel ?? 10000.0,
      fuelRate: fuelRate ?? 5000.0,
      range: range ?? 100,
      sideColor: this.currentScenario.getSideColor(this.currentSideId),
      weapons: this.demoMode
        ? this.getDefaultAircraftWeapons(
            this.currentSideId,
            this.currentScenario.getSideColor(this.currentSideId),
            className
          )
        : [],
      homeBaseId: "",
      rtb: false,
      targetId: "",
    });
    this.currentScenario.aircraft.push(aircraft);
    return aircraft;
  }

  addAircraftToAirbase(
    airbaseId: string,
    className: string,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ) {
    let airbaseAircraft: Aircraft[] = [];
    if (!this.currentSideId) {
      return airbaseAircraft;
    }
    const airbase = this.currentScenario.getAirbase(airbaseId);
    if (airbase) {
      this.recordHistory();
      airbaseAircraft = airbase.aircraft;
      if (!(className && speed && maxFuel && fuelRate && range))
        return airbaseAircraft;
      const aircraft = new Aircraft({
        id: randomUUID(),
        name: `${className} #${randomInt(0, 1000)}`,
        sideId: airbase.sideId,
        className: className,
        latitude: airbase.latitude - 0.5,
        longitude: airbase.longitude - 0.5,
        altitude: 10000.0,
        heading: 90.0,
        speed: speed,
        currentFuel: maxFuel,
        maxFuel: maxFuel,
        fuelRate: fuelRate,
        range: range,
        weapons: this.demoMode
          ? this.getDefaultAircraftWeapons(
              this.currentSideId,
              this.currentScenario.getSideColor(this.currentSideId),
              className
            )
          : [],
        homeBaseId: airbase.id,
        rtb: false,
        sideColor: airbase.sideColor,
      });
      airbase.aircraft.push(aircraft);
    }
    return airbaseAircraft;
  }

  removeAircraftFromAirbase(
    airbaseId: string,
    aircraftIds: string[]
  ): Aircraft[] {
    let airbaseAircraft: Aircraft[] = [];
    if (!this.currentSideId) {
      return airbaseAircraft;
    }
    this.recordHistory();
    const airbase = this.currentScenario.getAirbase(airbaseId);
    if (airbase) {
      airbase.aircraft = airbase.aircraft.filter(
        (aircraft) => !aircraftIds.includes(aircraft.id)
      );
      airbaseAircraft = airbase.aircraft;
    }
    return airbaseAircraft;
  }

  addAirbase(
    airbaseName: string,
    className: string,
    latitude: number,
    longitude: number
  ) {
    if (!this.currentSideId) {
      return;
    }
    this.recordHistory();
    const airbase = new Airbase({
      id: randomUUID(),
      name: airbaseName,
      sideId: this.currentSideId,
      className: className,
      latitude: latitude,
      longitude: longitude,
      altitude: 0.0,
      sideColor: this.currentScenario.getSideColor(this.currentSideId),
    });
    this.currentScenario.airbases.push(airbase);
    return airbase;
  }

  addReferencePoint(
    referencePointName: string,
    latitude: number,
    longitude: number
  ) {
    if (!this.currentSideId) {
      return;
    }
    this.recordHistory();
    const referencePoint = new ReferencePoint({
      id: randomUUID(),
      name: referencePointName,
      sideId: this.currentSideId,
      latitude: latitude,
      longitude: longitude,
      altitude: 0.0,
      sideColor: this.currentScenario.getSideColor(this.currentSideId),
    });
    this.currentScenario.referencePoints.push(referencePoint);
    return referencePoint;
  }

  removeReferencePoint(referencePointId: string) {
    this.recordHistory();
    this.currentScenario.referencePoints =
      this.currentScenario.referencePoints.filter(
        (referencePoint) => referencePoint.id !== referencePointId
      );
    if (
      this.focusFireOperation.objectiveReferencePointId === referencePointId
    ) {
      this.focusFireOperation = createDefaultFocusFireOperation();
    }
  }

  removeWeapon(weaponId: string) {
    this.recordHistory();
    this.currentScenario.weapons = this.currentScenario.weapons.filter(
      (weapon) => weapon.id !== weaponId
    );
  }

  removeAirbase(airbaseId: string) {
    this.recordHistory();
    this.currentScenario.airbases = this.currentScenario.airbases.filter(
      (airbase) => airbase.id !== airbaseId
    );
    this.currentScenario.aircraft.forEach((aircraft) => {
      if (aircraft.homeBaseId === airbaseId) {
        aircraft.homeBaseId = "";
        if (aircraft.rtb) {
          aircraft.rtb = false;
          aircraft.route = [];
        }
      }
    });
  }

  removeFacility(facilityId: string) {
    this.recordHistory();
    this.currentScenario.facilities = this.currentScenario.facilities.filter(
      (facility) => facility.id !== facilityId
    );
    this.focusFireOperation.launchedPlatformIds =
      this.focusFireOperation.launchedPlatformIds.filter(
        (id) => id !== facilityId
      );
  }

  removeArmy(armyId: string) {
    this.recordHistory();
    this.currentScenario.armies = this.currentScenario.armies.filter(
      (army) => army.id !== armyId
    );
    this.focusFireOperation.launchedPlatformIds =
      this.focusFireOperation.launchedPlatformIds.filter((id) => id !== armyId);
  }

  removeAircraft(aircraftId: string) {
    this.recordHistory();
    this.currentScenario.aircraft = this.currentScenario.aircraft.filter(
      (aircraft) => aircraft.id !== aircraftId
    );
    this.focusFireOperation.launchedPlatformIds =
      this.focusFireOperation.launchedPlatformIds.filter(
        (id) => id !== aircraftId
      );
  }

  addFacility(
    facilityName: string,
    className: string,
    latitude: number,
    longitude: number,
    range?: number,
    heading: number = 0
  ) {
    if (!this.currentSideId) {
      return;
    }
    this.recordHistory();
    const facility = new Facility({
      id: randomUUID(),
      name: facilityName,
      sideId: this.currentSideId,
      className: className,
      latitude: latitude,
      longitude: longitude,
      altitude: 0.0,
      range: range ?? getFacilityThreatRange(className),
      heading,
      speed: this.getDefaultFacilitySpeed(className),
      route: [],
      sideColor: this.currentScenario.getSideColor(this.currentSideId),
      detectionArcDegrees: getFacilityDetectionArcDegrees(className),
      weapons: this.demoMode
        ? this.getDefaultFacilityWeapons(
            this.currentSideId,
            this.currentScenario.getSideColor(this.currentSideId),
            className
          )
        : [],
    });
    this.currentScenario.facilities.push(facility);
    return facility;
  }

  addArmy(
    armyName: string,
    className: string,
    latitude: number,
    longitude: number,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ) {
    if (!this.currentSideId) {
      return;
    }
    this.recordHistory();
    const army = new Army({
      id: randomUUID(),
      name: armyName,
      sideId: this.currentSideId,
      className,
      latitude,
      longitude,
      altitude: 0.0,
      heading: 0.0,
      speed: speed ?? this.getDefaultFacilitySpeed(className),
      currentFuel: maxFuel ?? 12000,
      maxFuel: maxFuel ?? 12000,
      fuelRate: fuelRate ?? 35,
      range: range ?? getFacilityThreatRange(className),
      route: [],
      selected: false,
      sideColor: this.currentScenario.getSideColor(this.currentSideId),
      weapons: this.demoMode
        ? this.getDefaultFacilityWeapons(
            this.currentSideId,
            this.currentScenario.getSideColor(this.currentSideId),
            className
          )
        : [],
      desiredRoute: [],
    });
    this.currentScenario.armies.push(army);
    return army;
  }

  addShip(
    shipName: string,
    className: string,
    latitude: number,
    longitude: number,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ): Ship | undefined {
    if (!this.currentSideId) {
      return;
    }
    this.recordHistory();
    const ship = new Ship({
      id: randomUUID(),
      name: shipName,
      sideId: this.currentSideId,
      className: className,
      latitude: latitude,
      longitude: longitude,
      altitude: 0.0,
      heading: 0.0,
      speed: speed ?? 30.0,
      currentFuel: maxFuel ?? 32000000.0,
      maxFuel: maxFuel ?? 32000000.0,
      fuelRate: fuelRate ?? 7000.0,
      range: 250,
      route: [],
      selected: false,
      sideColor: this.currentScenario.getSideColor(this.currentSideId),
      weapons: this.demoMode
        ? this.getDefaultShipWeapons(
            this.currentSideId,
            this.currentScenario.getSideColor(this.currentSideId),
            className
          )
        : [],
      aircraft: [],
    });
    this.currentScenario.ships.push(ship);
    return ship;
  }

  duplicateUnit(unitId: string, unitType: string) {
    if (unitType === "aircraft") {
      const aircraft = this.currentScenario.getAircraft(unitId);
      if (aircraft) {
        this.recordHistory();
        const newAircraft = new Aircraft({
          id: randomUUID(),
          name: aircraft.name,
          sideId: aircraft.sideId,
          className: aircraft.className,
          latitude: aircraft.latitude - 0.5,
          longitude: aircraft.longitude - 0.5,
          altitude: aircraft.altitude,
          heading: aircraft.heading,
          speed: aircraft.speed,
          currentFuel: aircraft.maxFuel,
          maxFuel: aircraft.maxFuel,
          fuelRate: aircraft.fuelRate,
          range: aircraft.range,
          route: [],
          selected: false,
          weapons: aircraft.weapons,
          homeBaseId: aircraft.homeBaseId,
          rtb: false,
          targetId: aircraft.targetId,
          sideColor: aircraft.sideColor,
          maxHp: aircraft.maxHp,
          currentHp: aircraft.maxHp,
          defense: aircraft.defense,
        });
        this.currentScenario.aircraft.push(newAircraft);
        return newAircraft;
      }
    }
  }

  addAircraftToShip(
    shipId: string,
    className: string,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ) {
    let shipAircraft: Aircraft[] = [];
    if (!this.currentSideId) {
      return shipAircraft;
    }
    const ship = this.currentScenario.getShip(shipId);
    if (ship) {
      this.recordHistory();
      shipAircraft = ship.aircraft;
      if (!(className && speed && maxFuel && fuelRate && range))
        return shipAircraft;
      const aircraft = new Aircraft({
        id: randomUUID(),
        name: `${className} #${randomInt(0, 1000)}`,
        sideId: ship.sideId,
        className: className,
        latitude: ship.latitude - 0.5,
        longitude: ship.longitude - 0.5,
        altitude: 10000.0,
        heading: 90.0,
        speed: speed,
        currentFuel: maxFuel,
        maxFuel: maxFuel,
        fuelRate: fuelRate,
        range: range,
        weapons: this.demoMode
          ? this.getDefaultAircraftWeapons(
              this.currentSideId,
              this.currentScenario.getSideColor(this.currentSideId),
              className
            )
          : [],
        homeBaseId: ship.id,
        rtb: false,
        sideColor: ship.sideColor,
      });
      ship.aircraft.push(aircraft);
    }
    return shipAircraft;
  }

  launchAircraftFromShip(shipId: string, aircraftIds: string[]) {
    if (!this.currentSideId) {
      return [];
    }
    const ship = this.currentScenario.getShip(shipId);
    if (ship && ship.aircraft.length > 0) {
      this.recordHistory();
      const launchedAircraft: Aircraft[] = [];
      ship.aircraft = ship.aircraft.filter((shipAircraft) => {
        if (aircraftIds.includes(shipAircraft.id)) {
          launchedAircraft.push(shipAircraft);
          return false;
        }
        return true;
      });
      if (launchedAircraft.length > 0) {
        launchedAircraft.forEach((aircraft) => {
          this.currentScenario.aircraft.push(aircraft);
        });
        return launchedAircraft;
      }
    }
    return [];
  }

  removeAircraftFromShip(shipId: string, aircraftIds: string[]): Aircraft[] {
    let shipAircraft: Aircraft[] = [];
    if (!this.currentSideId) {
      return shipAircraft;
    }
    this.recordHistory();
    const ship = this.currentScenario.getShip(shipId);
    if (ship) {
      ship.aircraft = ship.aircraft.filter(
        (aircraft) => !aircraftIds.includes(aircraft.id)
      );
      shipAircraft = ship.aircraft;
    }
    return shipAircraft;
  }

  removeShip(shipId: string) {
    this.recordHistory();
    this.currentScenario.ships = this.currentScenario.ships.filter(
      (ship) => ship.id !== shipId
    );
    this.currentScenario.aircraft.forEach((aircraft) => {
      if (aircraft.homeBaseId === shipId) {
        aircraft.homeBaseId = "";
        if (aircraft.rtb) {
          aircraft.rtb = false;
          aircraft.route = [];
        }
      }
    });
  }

  createPatrolMission(
    missionName: string,
    assignedUnits: string[],
    assignedArea: ReferencePoint[]
  ) {
    if (assignedArea.length < 3) return;
    this.recordHistory();
    const currentSideId = this.currentScenario.getSide(this.currentSideId)?.id;
    const patrolMission = new PatrolMission({
      id: randomUUID(),
      name: missionName,
      sideId: currentSideId ?? this.currentSideId,
      assignedUnitIds: assignedUnits,
      assignedArea: assignedArea,
      active: true,
    });
    this.currentScenario.missions.push(patrolMission);
  }

  updatePatrolMission(
    missionId: string,
    missionName?: string,
    assignedUnits?: string[],
    assignedArea?: ReferencePoint[]
  ) {
    const patrolMission = this.currentScenario.getPatrolMission(missionId);
    if (patrolMission) {
      this.recordHistory();
      if (missionName && missionName !== "") patrolMission.name = missionName;
      if (assignedUnits && assignedUnits.length > 0)
        patrolMission.assignedUnitIds = assignedUnits;
      if (assignedArea && assignedArea.length > 2) {
        patrolMission.assignedArea = assignedArea;
        patrolMission.updatePatrolAreaGeometry();
      }
    }
  }

  createStrikeMission(
    missionName: string,
    assignedAttackers: string[],
    assignedTargets: string[]
  ) {
    this.recordHistory();
    const currentSideId = this.currentScenario.getSide(this.currentSideId)?.id;
    const strikeMission = new StrikeMission({
      id: randomUUID(),
      name: missionName,
      sideId: currentSideId ?? this.currentSideId,
      assignedUnitIds: assignedAttackers,
      assignedTargetIds: assignedTargets,
      active: true,
    });
    this.currentScenario.missions.push(strikeMission);
  }

  updateStrikeMission(
    missionId: string,
    missionName?: string,
    assignedAttackers?: string[],
    assignedTargets?: string[]
  ) {
    const strikeMission = this.currentScenario.getStrikeMission(missionId);
    if (strikeMission) {
      this.recordHistory();
      if (missionName && missionName !== "") strikeMission.name = missionName;
      if (assignedAttackers && assignedAttackers.length > 0)
        strikeMission.assignedUnitIds = assignedAttackers;
      if (assignedTargets && assignedTargets.length > 0)
        strikeMission.assignedTargetIds = assignedTargets;
    }
  }

  deleteMission(missionId: string) {
    this.recordHistory();
    this.currentScenario.missions = this.currentScenario.missions.filter(
      (mission) => mission.id !== missionId
    );
  }

  moveAircraft(aircraftId: string, newLatitude: number, newLongitude: number) {
    const aircraft = this.currentScenario.getAircraft(aircraftId);
    if (aircraft) {
      aircraft.desiredRoute.push([newLatitude, newLongitude]);
      if (aircraft.desiredRoute.length === 1) {
        aircraft.heading = getBearingBetweenTwoPoints(
          aircraft.latitude,
          aircraft.longitude,
          newLatitude,
          newLongitude
        );
      }
      return aircraft;
    }
  }

  moveShip(shipId: string, newLatitude: number, newLongitude: number) {
    const ship = this.currentScenario.getShip(shipId);
    if (ship) {
      ship.desiredRoute.push([newLatitude, newLongitude]);
      if (ship.desiredRoute.length === 1) {
        ship.heading = getBearingBetweenTwoPoints(
          ship.latitude,
          ship.longitude,
          newLatitude,
          newLongitude
        );
      }
      return ship;
    }
  }

  moveArmy(armyId: string, newLatitude: number, newLongitude: number) {
    const army = this.currentScenario.getArmy(armyId);
    if (army) {
      army.desiredRoute.push([newLatitude, newLongitude]);
      if (army.desiredRoute.length === 1) {
        army.heading = getBearingBetweenTwoPoints(
          army.latitude,
          army.longitude,
          newLatitude,
          newLongitude
        );
      }
      return army;
    }
  }

  moveFacility(
    facilityId: string,
    newLatitude: number,
    newLongitude: number,
    replaceRoute: boolean = false
  ) {
    const facility = this.currentScenario.getFacility(facilityId);
    if (facility) {
      if (replaceRoute) {
        facility.route = [];
      }
      facility.route.push([newLatitude, newLongitude]);
      if (facility.route.length === 1) {
        facility.heading = getBearingBetweenTwoPoints(
          facility.latitude,
          facility.longitude,
          newLatitude,
          newLongitude
        );
      }
      return facility;
    }
  }

  moveGroundUnit(
    unitId: string,
    newLatitude: number,
    newLongitude: number,
    replaceRoute: boolean = false
  ) {
    const army = this.currentScenario.getArmy(unitId);
    if (army) {
      if (replaceRoute) {
        army.route = [];
      }
      army.route.push([newLatitude, newLongitude]);
      if (army.route.length === 1) {
        army.heading = getBearingBetweenTwoPoints(
          army.latitude,
          army.longitude,
          newLatitude,
          newLongitude
        );
      }
      return army;
    }

    return this.moveFacility(unitId, newLatitude, newLongitude, replaceRoute);
  }

  commitRoute(unitId: string) {
    const aircraft = this.currentScenario.getAircraft(unitId);
    if (aircraft) {
      this.recordHistory();
      aircraft.route = aircraft.desiredRoute;
      aircraft.desiredRoute = [];
      return aircraft;
    }
    const ship = this.currentScenario.getShip(unitId);
    if (ship) {
      this.recordHistory();
      ship.route = ship.desiredRoute;
      ship.desiredRoute = [];
      return ship;
    }
    const army = this.currentScenario.getArmy(unitId);
    if (army) {
      this.recordHistory();
      army.route = army.desiredRoute;
      army.desiredRoute = [];
      return army;
    }
  }

  teleportUnit(unitId: string, newLatitude: number, newLongitude: number) {
    const aircraft = this.currentScenario.getAircraft(unitId);
    if (aircraft) {
      this.recordHistory();
      aircraft.latitude = newLatitude;
      aircraft.longitude = newLongitude;
      return aircraft;
    }
    const airbase = this.currentScenario.getAirbase(unitId);
    if (airbase) {
      this.recordHistory();
      airbase.latitude = newLatitude;
      airbase.longitude = newLongitude;
      airbase.aircraft.forEach((aircraft) => {
        aircraft.latitude = newLatitude - 0.5;
        aircraft.longitude = newLongitude - 0.5;
      });
      return airbase;
    }
    const facility = this.currentScenario.getFacility(unitId);
    if (facility) {
      this.recordHistory();
      facility.latitude = newLatitude;
      facility.longitude = newLongitude;
      return facility;
    }
    const army = this.currentScenario.getArmy(unitId);
    if (army) {
      this.recordHistory();
      army.latitude = newLatitude;
      army.longitude = newLongitude;
      return army;
    }
    const ship = this.currentScenario.getShip(unitId);
    if (ship) {
      this.recordHistory();
      ship.latitude = newLatitude;
      ship.longitude = newLongitude;
      ship.aircraft.forEach((aircraft) => {
        aircraft.latitude = newLatitude - 0.5;
        aircraft.longitude = newLongitude - 0.5;
      });
      return ship;
    }
    const referencePoint = this.currentScenario.getReferencePoint(unitId);
    if (referencePoint) {
      this.recordHistory();
      referencePoint.latitude = newLatitude;
      referencePoint.longitude = newLongitude;
      this.currentScenario.missions.forEach((mission) => {
        if (
          mission instanceof PatrolMission &&
          mission.assignedArea.some((point) => point.id === referencePoint.id)
        ) {
          mission.assignedArea = mission.assignedArea.map((point) =>
            point.id === referencePoint.id ? referencePoint : point
          );
          mission.updatePatrolAreaGeometry();
        }
      });
      return referencePoint;
    }
    const weapon = this.currentScenario.getWeapon(unitId);
    if (weapon) {
      this.recordHistory();
      weapon.latitude = newLatitude;
      weapon.longitude = newLongitude;
      return weapon;
    }
  }

  launchAircraftFromAirbase(airbaseId: string, aircraftIds: string[]) {
    if (!this.currentSideId) {
      return [];
    }
    const airbase = this.currentScenario.getAirbase(airbaseId);
    if (airbase && airbase.aircraft.length > 0) {
      this.recordHistory();
      const launchedAircraft: Aircraft[] = [];
      airbase.aircraft = airbase.aircraft.filter((airbaseAircraft) => {
        if (aircraftIds.includes(airbaseAircraft.id)) {
          launchedAircraft.push(airbaseAircraft);
          return false;
        }
        return true;
      });
      if (launchedAircraft.length > 0) {
        launchedAircraft.forEach((aircraft) => {
          this.currentScenario.aircraft.push(aircraft);
        });
        return launchedAircraft;
      }
    }
    return [];
  }

  handleAircraftAttack(
    aircraftId: string,
    targetId: string,
    weaponId: string,
    weaponQuantity: number,
    autoAttack: boolean = false
  ) {
    if (!autoAttack && weaponQuantity <= 0) return;
    const target =
      this.currentScenario.getAircraft(targetId) ??
      this.currentScenario.getArmy(targetId) ??
      this.currentScenario.getFacility(targetId) ??
      this.currentScenario.getWeapon(targetId) ??
      this.currentScenario.getShip(targetId) ??
      this.currentScenario.getAirbase(targetId);
    const aircraft = this.currentScenario.getAircraft(aircraftId);
    if (autoAttack) {
      if (
        target &&
        aircraft &&
        target?.sideId !== aircraft?.sideId &&
        target?.id !== aircraft?.id
      ) {
        this.recordHistory();
        const weapons = aircraft.weapons.filter(
          (weapon) => weapon.currentQuantity > 0
        );
        if (weapons.length > 0) {
          weapons.forEach((weapon) => {
            launchWeapon(
              this.currentScenario,
              aircraft,
              target,
              weapon,
              weapon.currentQuantity,
              this.simulationLogs
            );
          });
        }
      }
      return;
    }
    const weapon = aircraft?.weapons.find((weapon) => weapon.id === weaponId);
    if (
      target &&
      aircraft &&
      weapon &&
      target?.sideId !== aircraft?.sideId &&
      target?.id !== aircraft?.id
    ) {
      this.recordHistory();
      launchWeapon(
        this.currentScenario,
        aircraft,
        target,
        weapon,
        weaponQuantity,
        this.simulationLogs
      );
    }
  }

  handleShipAttack(
    shipId: string,
    targetId: string,
    weaponId: string,
    weaponQuantity: number,
    autoAttack: boolean = false
  ) {
    if (!autoAttack && weaponQuantity <= 0) return;
    const target =
      this.currentScenario.getAircraft(targetId) ??
      this.currentScenario.getArmy(targetId) ??
      this.currentScenario.getFacility(targetId) ??
      this.currentScenario.getWeapon(targetId) ??
      this.currentScenario.getShip(targetId) ??
      this.currentScenario.getAirbase(targetId);
    const ship = this.currentScenario.getShip(shipId);
    if (autoAttack) {
      if (
        target &&
        ship &&
        target?.sideId !== ship?.sideId &&
        target?.id !== ship?.id
      ) {
        this.recordHistory();
        const weapons = ship.weapons.filter(
          (weapon) => weapon.currentQuantity > 0
        );
        if (weapons.length > 0) {
          weapons.forEach((weapon) => {
            launchWeapon(
              this.currentScenario,
              ship,
              target,
              weapon,
              weapon.currentQuantity,
              this.simulationLogs
            );
          });
        }
      }
      return;
    }
    const weapon = ship?.weapons.find((weapon) => weapon.id === weaponId);
    if (
      target &&
      ship &&
      weapon &&
      target?.sideId !== ship?.sideId &&
      target?.id !== ship?.id
    ) {
      this.recordHistory();
      launchWeapon(
        this.currentScenario,
        ship,
        target,
        weapon,
        weaponQuantity,
        this.simulationLogs
      );
    }
  }

  handleArmyAttack(
    armyId: string,
    targetId: string,
    weaponId: string,
    weaponQuantity: number,
    autoAttack: boolean = false
  ) {
    if (!autoAttack && weaponQuantity <= 0) return;
    const target =
      this.currentScenario.getAircraft(targetId) ??
      this.currentScenario.getArmy(targetId) ??
      this.currentScenario.getFacility(targetId) ??
      this.currentScenario.getWeapon(targetId) ??
      this.currentScenario.getShip(targetId) ??
      this.currentScenario.getAirbase(targetId);
    const army = this.currentScenario.getArmy(armyId);
    if (autoAttack) {
      if (
        target &&
        army &&
        target.sideId !== army.sideId &&
        target.id !== army.id
      ) {
        this.recordHistory();
        const weapons = army.weapons.filter(
          (weapon) => weapon.currentQuantity > 0
        );
        if (weapons.length > 0) {
          weapons.forEach((weapon) => {
            launchWeapon(
              this.currentScenario,
              army,
              target,
              weapon,
              weapon.currentQuantity,
              this.simulationLogs
            );
          });
        }
      }
      return;
    }
    const weapon = army?.weapons.find((candidate) => candidate.id === weaponId);
    if (
      target &&
      army &&
      weapon &&
      target.sideId !== army.sideId &&
      target.id !== army.id
    ) {
      this.recordHistory();
      launchWeapon(
        this.currentScenario,
        army,
        target,
        weapon,
        weaponQuantity,
        this.simulationLogs
      );
    }
  }

  aircraftReturnToBase(aircraftId: string) {
    const aircraft = this.currentScenario.getAircraft(aircraftId);
    if (aircraft) {
      this.recordHistory();
      if (aircraft.rtb) {
        this.simulationLogs.addLog(
          aircraft.sideId,
          `${aircraft.name}의 복귀 명령이 취소되었습니다.`,
          this.currentScenario.currentTime,
          SimulationLogType.RETURN_TO_BASE,
          {
            actorId: aircraft.id,
            actorName: aircraft.name,
            actorType: "aircraft",
            resultTag: "rtb_cancel",
          }
        );
        aircraft.rtb = false;
        aircraft.route = [];
        return aircraft;
      } else {
        aircraft.rtb = true;
        const homeBase =
          aircraft.homeBaseId !== ""
            ? this.currentScenario.getAircraftHomeBase(aircraftId)
            : this.currentScenario.getClosestBaseToAircraft(aircraftId);
        if (homeBase) {
          if (aircraft.homeBaseId !== homeBase.id)
            aircraft.homeBaseId = homeBase.id;
          this.moveAircraft(aircraftId, homeBase.latitude, homeBase.longitude);
          this.simulationLogs.addLog(
            aircraft.sideId,
            `${aircraft.name}가 ${homeBase.name}(으)로 복귀 중입니다.`,
            this.currentScenario.currentTime,
            SimulationLogType.RETURN_TO_BASE,
            {
              actorId: aircraft.id,
              actorName: aircraft.name,
              actorType: "aircraft",
              destinationId: homeBase.id,
              destinationName: homeBase.name,
              resultTag: "rtb_start",
            }
          );
          return this.commitRoute(aircraftId);
        }
      }
    }
  }

  getFuelNeededToReturnToBase(aircraft: Aircraft) {
    if (aircraft.speed === 0) return 0;
    const homeBase =
      aircraft.homeBaseId !== ""
        ? this.currentScenario.getAircraftHomeBase(aircraft.id)
        : this.currentScenario.getClosestBaseToAircraft(aircraft.id);
    if (homeBase) {
      const distanceBetweenAircraftAndBaseNm =
        (getDistanceBetweenTwoPoints(
          aircraft.latitude,
          aircraft.longitude,
          homeBase.latitude,
          homeBase.longitude
        ) *
          1000) /
        NAUTICAL_MILES_TO_METERS;
      const timeNeededToReturnToBaseHr =
        distanceBetweenAircraftAndBaseNm / aircraft.speed;
      const fuelNeededToReturnToBase =
        timeNeededToReturnToBaseHr * aircraft.fuelRate;
      return fuelNeededToReturnToBase;
    }
    return 0;
  }

  landAircraft(aircraftId: string) {
    const aircraft = this.currentScenario.getAircraft(aircraftId);
    if (aircraft && aircraft.rtb) {
      const homeBase = this.currentScenario.getAircraftHomeBase(aircraftId);
      if (homeBase) {
        const newAircraft = new Aircraft({
          id: aircraft.id,
          name: aircraft.name,
          sideId: aircraft.sideId,
          className: aircraft.className,
          latitude: homeBase.latitude - 0.5,
          longitude: homeBase.longitude - 0.5,
          altitude: aircraft.altitude,
          heading: 90.0,
          speed: aircraft.speed,
          currentFuel: aircraft.maxFuel,
          maxFuel: aircraft.maxFuel,
          fuelRate: aircraft.fuelRate,
          range: aircraft.range,
          weapons: aircraft.weapons,
          homeBaseId: homeBase.id,
          rtb: false,
          targetId: aircraft.targetId,
          sideColor: aircraft.sideColor,
          maxHp: aircraft.maxHp,
          currentHp: aircraft.currentHp,
          defense: aircraft.defense,
        });
        homeBase.aircraft.push(newAircraft);
        this.removeAircraft(aircraft.id);
      }
    }
  }

  switchCurrentSide(sideId: string) {
    if (this.currentScenario.getSide(sideId)) {
      this.currentSideId = sideId;
    }
  }

  switchScenarioTimeCompression() {
    const timeCompressions = Object.keys(GAME_SPEED_DELAY_MS).map((speed) =>
      parseInt(speed)
    );
    for (let i = 0; i < timeCompressions.length; i++) {
      if (this.currentScenario.timeCompression === timeCompressions[i]) {
        this.currentScenario.timeCompression =
          timeCompressions[(i + 1) % timeCompressions.length];
        break;
      }
    }
  }

  exportCurrentScenario(): string {
    const exportObject = {
      currentScenario: this.currentScenario, // TODO clean up some parameters that are not needed before export, e.g. PatrolMission patrolAreaGeometry
      currentSideId: this.currentSideId,
      selectedUnitId: this.selectedUnitId,
      mapView: this.mapView,
      simulationLogs: this.simulationLogs.getLogs(
        undefined,
        undefined,
        undefined,
        "asc"
      ),
      focusFireOperation: this.focusFireOperation,
      focusFireRecommendationTelemetry: this.focusFireRecommendationTelemetry,
      focusFireRerankerEnabled: this.focusFireRerankerEnabled,
      focusFireRerankerModel: this.focusFireRerankerModel,
    };
    return JSON.stringify(exportObject);
  }

  loadScenario(scenarioString: string) {
    const importObject = JSON.parse(scenarioString);
    this.currentSideId = importObject.currentSideId;
    this.selectedUnitId = importObject.selectedUnitId;
    this.mapView = importObject.mapView;
    this.simulationLogs.clearLogs();
    this.focusFireOperation = createDefaultFocusFireOperation();
    this.clearFocusFireRecommendationTelemetry();
    this.resetFocusFireRerankerModel();

    const savedScenario = importObject.currentScenario;
    const savedSides = savedScenario.sides.map((side: Side) => {
      const newSide = new Side({
        id: side.id,
        name: side.name,
        totalScore: side.totalScore,
        color: side.color,
      });
      return newSide;
    });
    const loadedScenario = new Scenario({
      id: savedScenario.id,
      name: savedScenario.name,
      startTime: savedScenario.startTime,
      currentTime: savedScenario.currentTime,
      duration: savedScenario.duration,
      endTime: savedScenario.endTime,
      sides: savedSides,
      timeCompression: savedScenario.timeCompression,
      relationships: new Relationships({
        hostiles: savedScenario.relationships?.hostiles ?? {},
        allies: savedScenario.relationships?.allies ?? {},
      }),
      doctrine: savedScenario.doctrine,
      metadata: savedScenario.metadata,
    });

    const buildWeapon = (weapon: Weapon) =>
      new Weapon({
        id: weapon.id,
        launcherId: weapon.launcherId ?? "None",
        name: weapon.name,
        sideId: weapon.sideId,
        className: weapon.className,
        latitude: weapon.latitude,
        longitude: weapon.longitude,
        altitude: weapon.altitude,
        heading: weapon.heading,
        speed: weapon.speed,
        currentFuel: weapon.currentFuel,
        maxFuel: weapon.maxFuel,
        fuelRate: weapon.fuelRate,
        range: weapon.range,
        route: weapon.route,
        targetId: weapon.targetId,
        lethality: weapon.lethality,
        attackPower: weapon.attackPower,
        maxQuantity: weapon.maxQuantity,
        currentQuantity: weapon.currentQuantity,
        maxHp: weapon.maxHp,
        currentHp: weapon.currentHp,
        defense: weapon.defense,
        sideColor: weapon.sideColor,
      });

    const buildAircraft = (aircraft: Aircraft, aircraftWeapons: Weapon[]) =>
      new Aircraft({
        id: aircraft.id,
        name: aircraft.name,
        sideId: aircraft.sideId,
        className: aircraft.className,
        latitude: aircraft.latitude,
        longitude: aircraft.longitude,
        altitude: aircraft.altitude,
        heading: aircraft.heading,
        speed: aircraft.speed,
        currentFuel: aircraft.currentFuel,
        maxFuel: aircraft.maxFuel,
        fuelRate: aircraft.fuelRate,
        range: aircraft.range,
        route: aircraft.route,
        selected: aircraft.selected,
        weapons: aircraftWeapons,
        homeBaseId: aircraft.homeBaseId,
        rtb: aircraft.rtb,
        targetId: aircraft.targetId ?? "",
        sideColor: aircraft.sideColor,
        maxHp: aircraft.maxHp,
        currentHp: aircraft.currentHp,
        defense: aircraft.defense,
      });

    const buildArmy = (army: Army, armyWeapons: Weapon[]) =>
      new Army({
        id: army.id,
        name: army.name,
        sideId: army.sideId,
        className: army.className,
        latitude: army.latitude,
        longitude: army.longitude,
        altitude: army.altitude,
        heading: army.heading,
        speed: army.speed,
        currentFuel: army.currentFuel,
        maxFuel: army.maxFuel,
        fuelRate: army.fuelRate,
        range: army.range,
        route: army.route ?? [],
        selected: army.selected,
        sideColor: army.sideColor,
        weapons: armyWeapons,
        desiredRoute: army.desiredRoute ?? [],
        maxHp: army.maxHp,
        currentHp: army.currentHp,
        defense: army.defense,
      });

    savedScenario.aircraft.forEach((aircraft: Aircraft) => {
      const aircraftWeapons: Weapon[] = aircraft.weapons?.map(buildWeapon);
      const newAircraft = buildAircraft(aircraft, aircraftWeapons);
      loadedScenario.aircraft.push(newAircraft);
    });
    savedScenario.armies?.forEach((army: Army) => {
      const armyWeapons: Weapon[] = army.weapons?.map(buildWeapon);
      loadedScenario.armies.push(buildArmy(army, armyWeapons));
    });
    savedScenario.airbases.forEach((airbase: Airbase) => {
      const airbaseAircraft: Aircraft[] = [];
      airbase.aircraft.forEach((aircraft: Aircraft) => {
        const aircraftWeapons: Weapon[] = aircraft.weapons?.map(buildWeapon);
        const newAircraft = buildAircraft(aircraft, aircraftWeapons);
        airbaseAircraft.push(newAircraft);
      });
      const newAirbase = new Airbase({
        id: airbase.id,
        name: airbase.name,
        sideId: airbase.sideId,
        className: airbase.className,
        latitude: airbase.latitude,
        longitude: airbase.longitude,
        altitude: airbase.altitude,
        sideColor: airbase.sideColor,
        aircraft: airbaseAircraft,
        maxHp: airbase.maxHp,
        currentHp: airbase.currentHp,
        defense: airbase.defense,
      });
      loadedScenario.airbases.push(newAirbase);
    });
    savedScenario.facilities.forEach((facility: Facility) => {
      const facilityWeapons: Weapon[] = facility.weapons?.map(buildWeapon);
      const newFacility = new Facility({
        id: facility.id,
        name: facility.name,
        sideId: facility.sideId,
        className: facility.className,
        latitude: facility.latitude,
        longitude: facility.longitude,
        altitude: facility.altitude,
        range: facility.range,
        heading: facility.heading,
        speed:
          facility.speed ?? this.getDefaultFacilitySpeed(facility.className),
        route: facility.route ?? [],
        detectionArcDegrees:
          facility.detectionArcDegrees ??
          getFacilityDetectionArcDegrees(facility.className),
        weapons: facilityWeapons,
        sideColor: facility.sideColor,
        maxHp: facility.maxHp,
        currentHp: facility.currentHp,
        defense: facility.defense,
      });
      loadedScenario.facilities.push(newFacility);
    });
    savedScenario.weapons.forEach((weapon: Weapon) => {
      const newWeapon = buildWeapon(weapon);
      loadedScenario.weapons.push(newWeapon);
    });
    savedScenario.ships?.forEach((ship: Ship) => {
      const shipAircraft: Aircraft[] = [];
      ship.aircraft.forEach((aircraft: Aircraft) => {
        const aircraftWeapons: Weapon[] = aircraft.weapons?.map(buildWeapon);
        const newAircraft = buildAircraft(aircraft, aircraftWeapons);
        shipAircraft.push(newAircraft);
      });
      const shipWeapons: Weapon[] = ship.weapons?.map(buildWeapon);
      const newShip = new Ship({
        id: ship.id,
        name: ship.name,
        sideId: ship.sideId,
        className: ship.className,
        latitude: ship.latitude,
        longitude: ship.longitude,
        altitude: ship.altitude,
        heading: ship.heading,
        speed: ship.speed,
        currentFuel: ship.currentFuel,
        maxFuel: ship.maxFuel,
        fuelRate: ship.fuelRate,
        range: ship.range,
        route: ship.route,
        sideColor: ship.sideColor,
        weapons: shipWeapons,
        aircraft: shipAircraft,
        maxHp: ship.maxHp,
        currentHp: ship.currentHp,
        defense: ship.defense,
      });
      loadedScenario.ships.push(newShip);
    });
    savedScenario.referencePoints?.forEach((referencePoint: ReferencePoint) => {
      const newReferencePoint = new ReferencePoint({
        id: referencePoint.id,
        name: referencePoint.name,
        sideId: referencePoint.sideId,
        latitude: referencePoint.latitude,
        longitude: referencePoint.longitude,
        altitude: referencePoint.altitude,
        sideColor: referencePoint.sideColor,
      });
      loadedScenario.referencePoints.push(newReferencePoint);
    });
    savedScenario.missions?.forEach((mission: Mission) => {
      const baseProps = {
        id: mission.id,
        name: mission.name,
        sideId: mission.sideId,
        assignedUnitIds: mission.assignedUnitIds,
        active: mission.active,
      };
      if ("assignedArea" in mission) {
        const assignedArea: ReferencePoint[] = [];
        mission.assignedArea.forEach((point) => {
          const referencePoint = new ReferencePoint({
            id: point.id,
            name: point.name,
            sideId: point.sideId,
            latitude: point.latitude,
            longitude: point.longitude,
            altitude: point.altitude,
            sideColor: point.sideColor,
          });
          assignedArea.push(referencePoint);
        });
        loadedScenario.missions.push(
          new PatrolMission({
            ...baseProps,
            assignedArea: assignedArea,
          })
        );
      } else {
        loadedScenario.missions.push(
          new StrikeMission({
            ...baseProps,
            assignedTargetIds: mission.assignedTargetIds,
          })
        );
      }
    });
    loadedScenario.metadata = setScenarioFacilityPlacementGroups(
      loadedScenario.metadata,
      getScenarioFacilityPlacementGroups(
        loadedScenario.metadata,
        loadedScenario.facilities.map((facility) => facility.id)
      ),
      loadedScenario.facilities.map((facility) => facility.id)
    );

    this.currentScenario = loadedScenario;

    const importedFocusFireOperation = importObject.focusFireOperation as
      | Partial<FocusFireOperation>
      | undefined;
    if (importedFocusFireOperation?.enabled) {
      this.focusFireOperation = {
        enabled: true,
        active: importedFocusFireOperation.active ?? false,
        sideId: importedFocusFireOperation.sideId ?? this.currentSideId ?? null,
        objectiveReferencePointId:
          importedFocusFireOperation.objectiveReferencePointId ?? null,
        desiredEffectOverride:
          typeof importedFocusFireOperation.desiredEffectOverride ===
            "number" &&
          Number.isFinite(importedFocusFireOperation.desiredEffectOverride)
            ? roundToDigits(
                Math.max(importedFocusFireOperation.desiredEffectOverride, 0.1),
                1
              )
            : null,
        captureProgress: importedFocusFireOperation.captureProgress ?? 0,
        launchedPlatformIds: Array.isArray(
          importedFocusFireOperation.launchedPlatformIds
        )
          ? importedFocusFireOperation.launchedPlatformIds
          : [],
      };
      if (
        this.focusFireOperation.objectiveReferencePointId &&
        !this.currentScenario.getReferencePoint(
          this.focusFireOperation.objectiveReferencePointId
        )
      ) {
        this.focusFireOperation = createDefaultFocusFireOperation();
      }
    }

    if (Array.isArray(importObject.focusFireRecommendationTelemetry)) {
      this.focusFireRecommendationTelemetry =
        importObject.focusFireRecommendationTelemetry
          .map((entry: unknown) => {
            if (!entry || typeof entry !== "object") {
              return null;
            }

            const telemetryEntry =
              entry as Partial<FocusFireRecommendationTelemetryRecord>;
            return {
              id: telemetryEntry.id ?? randomUUID(),
              timestamp:
                typeof telemetryEntry.timestamp === "number"
                  ? telemetryEntry.timestamp
                  : this.currentScenario.currentTime,
              sideId: telemetryEntry.sideId ?? null,
              objectiveName: telemetryEntry.objectiveName ?? null,
              objectiveLatitude:
                typeof telemetryEntry.objectiveLatitude === "number"
                  ? telemetryEntry.objectiveLatitude
                  : null,
              objectiveLongitude:
                typeof telemetryEntry.objectiveLongitude === "number"
                  ? telemetryEntry.objectiveLongitude
                  : null,
              primaryTargetId: telemetryEntry.primaryTargetId ?? null,
              targetName: telemetryEntry.targetName ?? null,
              missionKind: telemetryEntry.missionKind ?? null,
              recommendedOptionLabel:
                telemetryEntry.recommendedOptionLabel ?? null,
              weaponName: telemetryEntry.weaponName ?? null,
              ammoType: telemetryEntry.ammoType ?? null,
              priorityScore:
                typeof telemetryEntry.priorityScore === "number"
                  ? telemetryEntry.priorityScore
                  : null,
              desiredEffect:
                typeof telemetryEntry.desiredEffect === "number"
                  ? telemetryEntry.desiredEffect
                  : null,
              expectedStrikeEffect:
                typeof telemetryEntry.expectedStrikeEffect === "number"
                  ? telemetryEntry.expectedStrikeEffect
                  : null,
              launchReadinessLabel: telemetryEntry.launchReadinessLabel ?? null,
              averageTimeToFireSeconds:
                typeof telemetryEntry.averageTimeToFireSeconds === "number"
                  ? telemetryEntry.averageTimeToFireSeconds
                  : null,
              threatExposureScore:
                typeof telemetryEntry.threatExposureScore === "number"
                  ? telemetryEntry.threatExposureScore
                  : null,
              selectionModelLabel: telemetryEntry.selectionModelLabel ?? null,
              rerankerApplied: telemetryEntry.rerankerApplied === true,
              immediateLaunchReadyCount:
                typeof telemetryEntry.immediateLaunchReadyCount === "number"
                  ? telemetryEntry.immediateLaunchReadyCount
                  : 0,
              repositionRequiredCount:
                typeof telemetryEntry.repositionRequiredCount === "number"
                  ? telemetryEntry.repositionRequiredCount
                  : 0,
              blockedLauncherCount:
                typeof telemetryEntry.blockedLauncherCount === "number"
                  ? telemetryEntry.blockedLauncherCount
                  : 0,
              rerankerModelVersion:
                typeof telemetryEntry.rerankerModelVersion === "number"
                  ? telemetryEntry.rerankerModelVersion
                  : null,
              feedbackOptionLabel:
                typeof telemetryEntry.feedbackOptionLabel === "string" &&
                telemetryEntry.feedbackOptionLabel.trim().length > 0
                  ? telemetryEntry.feedbackOptionLabel
                  : null,
              feedbackCapturedAt:
                typeof telemetryEntry.feedbackCapturedAt === "number"
                  ? telemetryEntry.feedbackCapturedAt
                  : null,
              options: Array.isArray(telemetryEntry.options)
                ? telemetryEntry.options
                    .map((option) => {
                      if (!option || typeof option !== "object") {
                        return null;
                      }

                      const telemetryOption =
                        option as Partial<FocusFireRecommendationTelemetryOption>;
                      return {
                        label: telemetryOption.label ?? "추천안",
                        weaponName: telemetryOption.weaponName ?? null,
                        ammoType: telemetryOption.ammoType ?? null,
                        suitabilityScore:
                          typeof telemetryOption.suitabilityScore === "number"
                            ? telemetryOption.suitabilityScore
                            : 0,
                        heuristicScore:
                          typeof telemetryOption.heuristicScore === "number"
                            ? telemetryOption.heuristicScore
                            : typeof telemetryOption.suitabilityScore ===
                                "number"
                              ? telemetryOption.suitabilityScore
                              : 0,
                        rerankerScore:
                          typeof telemetryOption.rerankerScore === "number"
                            ? telemetryOption.rerankerScore
                            : null,
                        executionReadinessLabel:
                          telemetryOption.executionReadinessLabel ?? "미지정",
                        averageTimeToFireSeconds:
                          typeof telemetryOption.averageTimeToFireSeconds ===
                          "number"
                            ? telemetryOption.averageTimeToFireSeconds
                            : null,
                        threatExposureScore:
                          typeof telemetryOption.threatExposureScore ===
                          "number"
                            ? telemetryOption.threatExposureScore
                            : 0,
                        shotCount:
                          typeof telemetryOption.shotCount === "number"
                            ? telemetryOption.shotCount
                            : 0,
                        expectedStrikeEffect:
                          typeof telemetryOption.expectedStrikeEffect ===
                          "number"
                            ? telemetryOption.expectedStrikeEffect
                            : 0,
                        launcherCount:
                          typeof telemetryOption.launcherCount === "number"
                            ? telemetryOption.launcherCount
                            : 0,
                        immediateLaunchReadyCount:
                          typeof telemetryOption.immediateLaunchReadyCount ===
                          "number"
                            ? telemetryOption.immediateLaunchReadyCount
                            : 0,
                        repositionRequiredCount:
                          typeof telemetryOption.repositionRequiredCount ===
                          "number"
                            ? telemetryOption.repositionRequiredCount
                            : 0,
                        blockedLauncherCount:
                          typeof telemetryOption.blockedLauncherCount ===
                          "number"
                            ? telemetryOption.blockedLauncherCount
                            : 0,
                        averageDistanceKm:
                          typeof telemetryOption.averageDistanceKm === "number"
                            ? telemetryOption.averageDistanceKm
                            : null,
                      } satisfies FocusFireRecommendationTelemetryOption;
                    })
                    .filter(
                      (
                        option
                      ): option is FocusFireRecommendationTelemetryOption =>
                        option !== null
                    )
                : [],
            } satisfies FocusFireRecommendationTelemetryRecord;
          })
          .filter(
            (
              entry: FocusFireRecommendationTelemetryRecord | null
            ): entry is FocusFireRecommendationTelemetryRecord => entry !== null
          )
          .slice(-200);
      this.focusFireRecommendationTelemetry.forEach((entry) => {
        const telemetryKey = buildFocusFireRecommendationTelemetryKey(
          entry.sideId,
          entry.objectiveName,
          entry.objectiveLatitude,
          entry.objectiveLongitude,
          entry.primaryTargetId
        );
        const signature =
          buildFocusFireRecommendationTelemetryRecordSignature(entry);
        this.focusFireRecommendationTelemetrySignatures.set(
          telemetryKey,
          signature
        );
      });
    }

    const normalizedImportedModel = normalizeImportedFocusFireRerankerModel(
      importObject.focusFireRerankerModel as
        | Partial<FocusFireRerankerModel>
        | undefined
    );
    if (normalizedImportedModel) {
      this.focusFireRerankerModel = normalizedImportedModel;
    }

    this.focusFireRerankerEnabled =
      importObject.focusFireRerankerEnabled === true;

    if (Array.isArray(importObject.simulationLogs)) {
      this.simulationLogs.replaceLogs(importObject.simulationLogs);
    }
  }

  toggleGodMode(enabled: boolean = !this.godMode) {
    this.godMode = enabled;
  }

  toggleEraserMode(enabled: boolean = !this.eraserMode) {
    this.eraserMode = enabled;
  }

  facilityAutoDefense() {
    [
      ...this.currentScenario.facilities,
      ...this.currentScenario.armies,
    ].forEach((facility) => {
      if (
        this.currentScenario.checkSideDoctrine(
          facility.sideId,
          DoctrineType.SAM_ATTACK_HOSTILE
        )
      ) {
        this.currentScenario.aircraft.forEach((aircraft) => {
          if (
            this.currentScenario.isHostile(facility.sideId, aircraft.sideId)
          ) {
            const facilityWeapon =
              facility.getWeaponWithHighestEngagementRange();
            if (!facilityWeapon) return;
            if (
              platformCanEngageTarget(aircraft, facility, facilityWeapon) &&
              checkTargetTrackedByCount(this.currentScenario, aircraft) < 10
            ) {
              launchWeapon(
                this.currentScenario,
                facility,
                aircraft,
                facilityWeapon,
                1,
                this.simulationLogs
              );
            }
          }
        });
      }
      this.currentScenario.weapons.forEach((weapon) => {
        if (this.currentScenario.isHostile(facility.sideId, weapon.sideId)) {
          const facilityWeapon = facility.getWeaponWithHighestEngagementRange();
          if (!facilityWeapon) return;
          if (
            weapon.targetId === facility.id &&
            platformCanEngageTarget(weapon, facility, facilityWeapon) &&
            checkTargetTrackedByCount(this.currentScenario, weapon) < 5
          ) {
            launchWeapon(
              this.currentScenario,
              facility,
              weapon,
              facilityWeapon,
              1,
              this.simulationLogs
            );
          }
        }
      });
    });
  }

  shipAutoDefense() {
    this.currentScenario.ships.forEach((ship) => {
      if (
        this.currentScenario.checkSideDoctrine(
          ship.sideId,
          DoctrineType.SHIP_ATTACK_HOSTILE
        )
      ) {
        this.currentScenario.aircraft.forEach((aircraft) => {
          if (this.currentScenario.isHostile(ship.sideId, aircraft.sideId)) {
            const shipWeapon = ship.getWeaponWithHighestEngagementRange();
            if (!shipWeapon) return;
            if (
              isThreatDetected(aircraft, ship) &&
              weaponCanEngageTarget(aircraft, shipWeapon) &&
              checkTargetTrackedByCount(this.currentScenario, aircraft) < 10
            ) {
              launchWeapon(
                this.currentScenario,
                ship,
                aircraft,
                shipWeapon,
                1,
                this.simulationLogs
              );
            }
          }
        });
      }
      this.currentScenario.weapons.forEach((weapon) => {
        if (this.currentScenario.isHostile(ship.sideId, weapon.sideId)) {
          const shipWeapon = ship.getWeaponWithHighestEngagementRange();
          if (!shipWeapon) return;
          if (
            weapon.targetId === ship.id &&
            isThreatDetected(weapon, ship) &&
            weaponCanEngageTarget(weapon, shipWeapon) &&
            checkTargetTrackedByCount(this.currentScenario, weapon) < 5
          ) {
            launchWeapon(
              this.currentScenario,
              ship,
              weapon,
              shipWeapon,
              1,
              this.simulationLogs
            );
          }
        }
      });
    });
  }

  aircraftAirToAirEngagement() {
    this.currentScenario.aircraft.forEach((aircraft) => {
      if (aircraft.weapons.length < 1) return;
      const aircraftWeaponWithMaxRange =
        aircraft.getWeaponWithHighestEngagementRange();
      if (!aircraftWeaponWithMaxRange) return;
      if (
        this.currentScenario.checkSideDoctrine(
          aircraft.sideId,
          DoctrineType.AIRCRAFT_ATTACK_HOSTILE
        )
      ) {
        this.currentScenario.aircraft.forEach((enemyAircraft) => {
          if (
            this.currentScenario.isHostile(
              aircraft.sideId,
              enemyAircraft.sideId
            ) &&
            (aircraft.targetId === "" || aircraft.targetId === enemyAircraft.id)
          ) {
            if (
              isThreatDetected(enemyAircraft, aircraft) &&
              weaponCanEngageTarget(
                enemyAircraft,
                aircraftWeaponWithMaxRange
              ) &&
              checkTargetTrackedByCount(this.currentScenario, enemyAircraft) < 1
            ) {
              launchWeapon(
                this.currentScenario,
                aircraft,
                enemyAircraft,
                aircraftWeaponWithMaxRange,
                1,
                this.simulationLogs
              );
              aircraft.targetId = enemyAircraft.id;
            }
          }
        });
      }
      this.currentScenario.weapons.forEach((enemyWeapon) => {
        if (
          this.currentScenario.isHostile(aircraft.sideId, enemyWeapon.sideId)
        ) {
          if (
            enemyWeapon.targetId === aircraft.id &&
            isThreatDetected(enemyWeapon, aircraft) &&
            weaponCanEngageTarget(enemyWeapon, aircraftWeaponWithMaxRange) &&
            checkTargetTrackedByCount(this.currentScenario, enemyWeapon) < 1
          ) {
            launchWeapon(
              this.currentScenario,
              aircraft,
              enemyWeapon,
              aircraftWeaponWithMaxRange,
              1,
              this.simulationLogs
            );
          }
        }
      });
      if (
        this.currentScenario.checkSideDoctrine(
          aircraft.sideId,
          DoctrineType.AIRCRAFT_CHASE_HOSTILE
        ) &&
        aircraft.targetId &&
        aircraft.targetId !== ""
      )
        aircraftPursuit(this.currentScenario, aircraft);
    });
  }

  updateUnitsOnPatrolMission() {
    const activePatrolMissions = this.currentScenario
      .getAllPatrolMissions()
      .filter((mission) => mission.active);
    if (activePatrolMissions.length < 1) return;

    activePatrolMissions.forEach((mission) => {
      if (mission.assignedArea.length < 3) return;
      mission.assignedUnitIds.forEach((unitId) => {
        const unit = this.currentScenario.getAircraft(unitId);
        if (unit) {
          if (unit.route.length === 0) {
            const randomWaypointInPatrolArea =
              mission.generateRandomCoordinatesWithinPatrolArea();
            unit.route.push(randomWaypointInPatrolArea);
          } else if (unit.route.length > 0) {
            if (!mission.checkIfCoordinatesIsWithinPatrolArea(unit.route[0])) {
              unit.route = [];
              const randomWaypointInPatrolArea =
                mission.generateRandomCoordinatesWithinPatrolArea();
              unit.route.push(randomWaypointInPatrolArea);
            }
          }
        }
      });
    });
  }
  // in Game.ts

  clearCompletedStrikeMissions() {
    this.currentScenario.missions = this.currentScenario.missions.filter(
      (mission) => {
        if (mission instanceof StrikeMission) {
          let isMissionOngoing = true;

          // SUCCESS CONDITION: Have all assigned targets been destroyed?
          const target = this.getStrikeMissionCurrentTarget(mission);

          if (!target) {
            isMissionOngoing = false;
            const scoreDelta = processStrikeMissionSuccess(
              this.currentScenario,
              mission
            );
            this.simulationLogs.addLog(
              mission.sideId,
              `타격 임무 '${mission.name}' 완료: 지정 표적이 모두 무력화되었습니다.`,
              this.currentScenario.currentTime,
              SimulationLogType.STRIKE_MISSION_SUCCESS,
              {
                missionId: mission.id,
                missionName: mission.name,
                objectiveId: mission.assignedTargetIds[0],
                objectiveName:
                  mission.assignedTargetIds.length > 1
                    ? `${mission.assignedTargetIds.length}개 지정 표적`
                    : undefined,
                resultTag: "mission_success",
                actorScoreDelta: scoreDelta.actorDelta,
                scoreNetDelta: scoreDelta.netDelta,
              }
            );
          }

          // FAILURE CONDITION: Are all assigned attackers destroyed?
          const attackers = mission.assignedUnitIds
            .map((attackerId) => this.currentScenario.getAircraft(attackerId))
            .filter((attacker) => attacker !== undefined);

          if (attackers.length < 1) {
            isMissionOngoing = false;
            this.simulationLogs.addLog(
              mission.sideId,
              `타격 임무 '${mission.name}' 실패: 투입 항공기를 모두 상실했습니다.`,
              this.currentScenario.currentTime,
              SimulationLogType.STRIKE_MISSION_ABORTED,
              {
                missionId: mission.id,
                missionName: mission.name,
                resultTag: "mission_abort",
              }
            );
          }

          // "out of ammo" check has been removed entirely, solve race condition, moved to `updateUnitsOnStrikeMission `

          if (
            !isMissionOngoing &&
            this.currentScenario.checkSideDoctrine(
              mission.sideId,
              DoctrineType.AIRCRAFT_RTB_WHEN_STRIKE_MISSION_COMPLETE
            )
          ) {
            attackers.forEach(
              (attacker) => attacker && this.aircraftReturnToBase(attacker.id)
            );
          }
          return isMissionOngoing;
        } else {
          return true;
        }
      }
    );
  }

  // TODO: update this with allAttackersHaveExpendedWeapons check
  updateUnitsOnStrikeMission() {
    const activeStrikeMissions = this.currentScenario
      .getAllStrikeMissions()
      .filter((mission) => mission.active);
    if (activeStrikeMissions.length < 1) return;

    activeStrikeMissions.forEach((mission) => {
      if (mission.assignedTargetIds.length < 1) return;
      mission.assignedUnitIds.forEach((attackerId) => {
        const attacker = this.currentScenario.getAircraft(attackerId);
        if (attacker) {
          const target = this.getStrikeMissionCurrentTarget(mission);
          if (!target) return;
          let distanceBetweenWeaponLaunchPositionAndTargetNm = null;
          if (attacker.route.length > 0) {
            distanceBetweenWeaponLaunchPositionAndTargetNm =
              (getDistanceBetweenTwoPoints(
                attacker.route[attacker.route.length - 1][0],
                attacker.route[attacker.route.length - 1][1],
                target.latitude,
                target.longitude
              ) *
                1000) /
              NAUTICAL_MILES_TO_METERS;
          }
          const distanceBetweenAttackerAndTargetNm =
            (getDistanceBetweenTwoPoints(
              attacker.latitude,
              attacker.longitude,
              target.latitude,
              target.longitude
            ) *
              1000) /
            NAUTICAL_MILES_TO_METERS;
          const aircraftWeaponWithMaxRange =
            attacker.getWeaponWithHighestEngagementRange();
          if (!aircraftWeaponWithMaxRange) return;
          if (
            (distanceBetweenWeaponLaunchPositionAndTargetNm !== null &&
              (distanceBetweenWeaponLaunchPositionAndTargetNm >
                attacker.getDetectionRange() * 1.1 ||
                distanceBetweenWeaponLaunchPositionAndTargetNm >
                  aircraftWeaponWithMaxRange.getEngagementRange() * 1.1)) ||
            (distanceBetweenWeaponLaunchPositionAndTargetNm === null &&
              (distanceBetweenAttackerAndTargetNm >
                attacker.getDetectionRange() * 1.1 ||
                distanceBetweenAttackerAndTargetNm >
                  aircraftWeaponWithMaxRange.getEngagementRange() * 1.1))
          ) {
            routeAircraftToStrikePosition(
              this.currentScenario,
              attacker,
              target.id,
              Math.min(
                attacker.getDetectionRange(),
                aircraftWeaponWithMaxRange.getEngagementRange()
              )
            );
          } else if (
            distanceBetweenAttackerAndTargetNm <=
              attacker.getDetectionRange() * 1.1 &&
            distanceBetweenAttackerAndTargetNm <=
              aircraftWeaponWithMaxRange.getEngagementRange() * 1.1
          ) {
            const aircraftWeapon =
              attacker.getWeaponWithHighestEngagementRange();
            if (!aircraftWeapon) return;
            launchWeapon(
              this.currentScenario,
              attacker,
              target,
              aircraftWeapon,
              1,
              this.simulationLogs
            );
            attacker.targetId = target.id;
          }
        }
      });
    });
  }

  updateFocusFireOperation() {
    if (!this.focusFireOperation.enabled || !this.focusFireOperation.active) {
      return;
    }

    const objective = this.getFocusFireObjective();
    const sideId = this.focusFireOperation.sideId;
    if (!objective || !sideId) {
      this.focusFireOperation.active = false;
      return;
    }

    const focusFireAircraft = this.getFocusFireAircraft(sideId);
    const focusFireArtillery = this.getFocusFireArtilleryFacilities(sideId);
    const focusFireArmor = this.getFocusFireArmorFacilities(sideId);

    focusFireArtillery.forEach((facility) => {
      facility.weapons.forEach((weapon) => {
        weapon.latitude = facility.latitude;
        weapon.longitude = facility.longitude;
      });
      if (this.focusFireOperation.launchedPlatformIds.includes(facility.id)) {
        return;
      }

      const longestRangeWeapon = facility.getWeaponWithHighestEngagementRange();
      if (
        !longestRangeWeapon ||
        !platformCanEngageTarget(objective, facility, longestRangeWeapon)
      ) {
        return;
      }

      const launchedCount = this.launchAllWeaponsAtObjective(
        facility,
        objective
      );
      if (launchedCount > 0) {
        this.focusFireOperation.launchedPlatformIds.push(facility.id);
      }
    });

    focusFireAircraft.forEach((aircraft) => {
      aircraft.weapons.forEach((weapon) => {
        weapon.latitude = aircraft.latitude;
        weapon.longitude = aircraft.longitude;
      });
      const longestRangeWeapon = aircraft.getWeaponWithHighestEngagementRange();
      if (!longestRangeWeapon) {
        return;
      }

      const distanceToObjectiveNm =
        (getDistanceBetweenTwoPoints(
          aircraft.latitude,
          aircraft.longitude,
          objective.latitude,
          objective.longitude
        ) *
          1000) /
        NAUTICAL_MILES_TO_METERS;
      const strikeRadiusNm = Math.min(
        aircraft.getDetectionRange(),
        longestRangeWeapon.getEngagementRange()
      );

      if (distanceToObjectiveNm > strikeRadiusNm * 0.95) {
        if (aircraft.route.length === 0) {
          routeAircraftToStrikePosition(
            this.currentScenario,
            aircraft,
            objective.id,
            strikeRadiusNm
          );
        }
        return;
      }

      if (this.focusFireOperation.launchedPlatformIds.includes(aircraft.id)) {
        return;
      }

      const launchedCount = this.launchAllWeaponsAtObjective(
        aircraft,
        objective
      );
      if (launchedCount > 0) {
        aircraft.targetId = objective.id;
        this.focusFireOperation.launchedPlatformIds.push(aircraft.id);
      }
    });

    focusFireArmor.forEach((facility, index) => {
      facility.weapons.forEach((weapon) => {
        weapon.latitude = facility.latitude;
        weapon.longitude = facility.longitude;
      });
      const longestRangeWeapon = facility.getWeaponWithHighestEngagementRange();
      const distanceToObjectiveNm =
        (getDistanceBetweenTwoPoints(
          facility.latitude,
          facility.longitude,
          objective.latitude,
          objective.longitude
        ) *
          1000) /
        NAUTICAL_MILES_TO_METERS;

      if (
        longestRangeWeapon &&
        platformCanEngageTarget(objective, facility, longestRangeWeapon) &&
        !this.focusFireOperation.launchedPlatformIds.includes(facility.id) &&
        distanceToObjectiveNm <= longestRangeWeapon.getEngagementRange() * 1.05
      ) {
        const launchedCount = this.launchAllWeaponsAtObjective(
          facility,
          objective
        );
        if (launchedCount > 0) {
          this.focusFireOperation.launchedPlatformIds.push(facility.id);
        }
      }

      if (facility.route.length === 0) {
        const [latitude, longitude] = this.getFocusFireArmorDestination(
          objective,
          index,
          focusFireArmor.length
        );
        this.moveGroundUnit(facility.id, latitude, longitude, true);
      }
    });

    const capturingArmor = focusFireArmor.filter(
      (facility) =>
        getDistanceBetweenTwoPoints(
          facility.latitude,
          facility.longitude,
          objective.latitude,
          objective.longitude
        ) <= FOCUS_FIRE_CAPTURE_RADIUS_KM
    );

    if (capturingArmor.length > 0) {
      this.focusFireOperation.captureProgress = Math.min(
        100,
        this.focusFireOperation.captureProgress + capturingArmor.length * 3
      );
    }

    if (this.focusFireOperation.captureProgress >= 100) {
      this.focusFireOperation.captureProgress = 100;
      this.focusFireOperation.active = false;
      this.simulationLogs.addLog(
        sideId,
        `${objective.name}을(를) 확보했습니다. 집중포격 작전이 종료됩니다.`,
        this.currentScenario.currentTime,
        SimulationLogType.STRIKE_MISSION_SUCCESS,
        {
          objectiveId: objective.id,
          objectiveName: objective.name,
          resultTag: "objective_secured",
        }
      );
    }
  }

  updatePatrolMissionScoring() {
    // Award points every 300 seconds (5 minutes) of game time
    const PATROL_SCORING_INTERVAL = 300;

    const activePatrolMissions = this.currentScenario
      .getAllPatrolMissions()
      .filter((m) => m.active);

    activePatrolMissions.forEach((mission) => {
      if (
        this.currentScenario.currentTime - (mission.lastScoringTime || 0) <
        PATROL_SCORING_INTERVAL
      ) {
        return;
      }

      // Check if the mission is "healthy" (all assigned units are still active and not returning to base)
      const assignedUnits = mission.assignedUnitIds.map((id) =>
        this.currentScenario.getAircraft(id)
      );
      const isMissionHealthy = assignedUnits.every((unit) => unit && !unit.rtb);

      if (isMissionHealthy) {
        const scoreDelta = processPatrolMissionSuccess(
          this.currentScenario,
          mission
        );
        mission.lastScoringTime = this.currentScenario.currentTime; // Update the last scoring time
        this.simulationLogs.addLog(
          mission.sideId,
          `초계 임무 '${mission.name}' 유지 중입니다. 점수를 획득했습니다.`,
          this.currentScenario.currentTime,
          SimulationLogType.PATROL_MISSION_SUCCESS,
          {
            missionId: mission.id,
            missionName: mission.name,
            objectiveName:
              mission.assignedArea.length > 0
                ? `${mission.assignedArea.length}개 참조점 공역`
                : undefined,
            resultTag: "patrol_hold",
            actorScoreDelta: scoreDelta.actorDelta,
            scoreNetDelta: scoreDelta.netDelta,
          }
        );
      }
    });
  }

  updateOnBoardWeaponPositions() {
    this.currentScenario.aircraft.forEach((aircraft) => {
      aircraft.weapons.forEach((weapon) => {
        weapon.latitude = aircraft.latitude;
        weapon.longitude = aircraft.longitude;
      });
    });
    this.currentScenario.armies.forEach((army) => {
      army.weapons.forEach((weapon) => {
        weapon.latitude = army.latitude;
        weapon.longitude = army.longitude;
      });
    });
    this.currentScenario.facilities.forEach((facility) => {
      facility.weapons.forEach((weapon) => {
        weapon.latitude = facility.latitude;
        weapon.longitude = facility.longitude;
      });
    });
    this.currentScenario.ships.forEach((ship) => {
      ship.weapons.forEach((weapon) => {
        weapon.latitude = ship.latitude;
        weapon.longitude = ship.longitude;
      });
    });
  }

  getStrikeMissionCurrentTarget(mission: StrikeMission) {
    for (const targetId of mission.assignedTargetIds) {
      const target =
        this.currentScenario.getArmy(targetId) ??
        this.currentScenario.getFacility(targetId) ??
        this.currentScenario.getShip(targetId) ??
        this.currentScenario.getAirbase(targetId) ??
        this.currentScenario.getAircraft(targetId);
      if (target) {
        return target;
      }
    }

    return undefined;
  }

  updateAllAircraftPosition() {
    this.currentScenario.aircraft.forEach((aircraft) => {
      if (aircraft.rtb) {
        const aircraftHomeBase =
          aircraft.homeBaseId !== ""
            ? this.currentScenario.getAircraftHomeBase(aircraft.id)
            : this.currentScenario.getClosestBaseToAircraft(aircraft.id);
        if (
          aircraftHomeBase &&
          getDistanceBetweenTwoPoints(
            aircraft.latitude,
            aircraft.longitude,
            aircraftHomeBase.latitude,
            aircraftHomeBase.longitude
          ) < 0.5
        ) {
          this.landAircraft(aircraft.id);
          return;
        }
      }

      const route = aircraft.route;
      if (route.length > 0) {
        const nextWaypoint = route[0];
        const nextWaypointLatitude = nextWaypoint[0];
        const nextWaypointLongitude = nextWaypoint[1];
        if (
          getDistanceBetweenTwoPoints(
            aircraft.latitude,
            aircraft.longitude,
            nextWaypointLatitude,
            nextWaypointLongitude
          ) < 0.5
        ) {
          aircraft.latitude = nextWaypointLatitude;
          aircraft.longitude = nextWaypointLongitude;
          aircraft.route.shift();
        } else {
          const nextAircraftCoordinates = getNextCoordinates(
            aircraft.latitude,
            aircraft.longitude,
            nextWaypointLatitude,
            nextWaypointLongitude,
            aircraft.speed
          );
          const nextAircraftLatitude = nextAircraftCoordinates[0];
          const nextAircraftLongitude = nextAircraftCoordinates[1];
          aircraft.latitude = nextAircraftLatitude;
          aircraft.longitude = nextAircraftLongitude;
          aircraft.heading = getBearingBetweenTwoPoints(
            aircraft.latitude,
            aircraft.longitude,
            nextWaypointLatitude,
            nextWaypointLongitude
          );
        }
      }
      aircraft.currentFuel -= aircraft.fuelRate / 3600;
      const fuelNeededToReturnToBase =
        this.getFuelNeededToReturnToBase(aircraft);
      // if aircraft runs out of fuel
      if (aircraft.currentFuel <= 0) {
        const scoreDelta = processFuelExhaustion(
          this.currentScenario,
          aircraft
        );
        this.removeAircraft(aircraft.id);
        this.simulationLogs.addLog(
          aircraft.sideId,
          `${aircraft.name}의 연료가 소진되어 추락했습니다.`,
          this.currentScenario.currentTime,
          SimulationLogType.AIRCRAFT_CRASHED,
          {
            actorId: aircraft.id,
            actorName: aircraft.name,
            actorSideId: aircraft.sideId,
            actorType: "aircraft",
            resultTag: "fuel_loss",
            actorScoreDelta: scoreDelta.actorDelta,
            scoreNetDelta: scoreDelta.netDelta,
          }
        );
      } else if (
        aircraft.currentFuel < fuelNeededToReturnToBase * 1.1 &&
        !aircraft.rtb &&
        this.currentScenario.checkSideDoctrine(
          aircraft.sideId,
          DoctrineType.AIRCRAFT_RTB_WHEN_OUT_OF_RANGE
        )
      ) {
        this.aircraftReturnToBase(aircraft.id);
      }
    });
  }

  updateAllShipPosition() {
    this.currentScenario.ships.forEach((ship) => {
      const route = ship.route;
      if (route.length > 0) {
        const nextWaypoint = route[0];
        const nextWaypointLatitude = nextWaypoint[0];
        const nextWaypointLongitude = nextWaypoint[1];
        if (
          getDistanceBetweenTwoPoints(
            ship.latitude,
            ship.longitude,
            nextWaypointLatitude,
            nextWaypointLongitude
          ) < 0.5
        ) {
          ship.latitude = nextWaypointLatitude;
          ship.longitude = nextWaypointLongitude;
          ship.route.shift();
        } else {
          const nextShipCoordinates = getNextCoordinates(
            ship.latitude,
            ship.longitude,
            nextWaypointLatitude,
            nextWaypointLongitude,
            ship.speed
          );
          const nextShipLatitude = nextShipCoordinates[0];
          const nextShipLongitude = nextShipCoordinates[1];
          ship.latitude = nextShipLatitude;
          ship.longitude = nextShipLongitude;
          ship.heading = getBearingBetweenTwoPoints(
            ship.latitude,
            ship.longitude,
            nextWaypointLatitude,
            nextWaypointLongitude
          );
        }
        ship.currentFuel -= ship.fuelRate / 3600;
        // if ship runs out of fuel
        if (ship.currentFuel <= 0) {
          processFuelExhaustion(this.currentScenario, ship);
          this.removeShip(ship.id);
        }
      }
    });
  }

  updateAllFacilityPosition() {
    [
      ...this.currentScenario.facilities,
      ...this.currentScenario.armies,
    ].forEach((facility) => {
      if (facility.speed <= 0 || facility.route.length === 0) {
        return;
      }

      const nextWaypoint = facility.route[0];
      const nextWaypointLatitude = nextWaypoint[0];
      const nextWaypointLongitude = nextWaypoint[1];

      if (
        getDistanceBetweenTwoPoints(
          facility.latitude,
          facility.longitude,
          nextWaypointLatitude,
          nextWaypointLongitude
        ) < 0.25
      ) {
        facility.latitude = nextWaypointLatitude;
        facility.longitude = nextWaypointLongitude;
        facility.route.shift();
        return;
      }

      const nextFacilityCoordinates = getNextCoordinates(
        facility.latitude,
        facility.longitude,
        nextWaypointLatitude,
        nextWaypointLongitude,
        facility.speed
      );
      facility.latitude = nextFacilityCoordinates[0];
      facility.longitude = nextFacilityCoordinates[1];
      facility.heading = getBearingBetweenTwoPoints(
        facility.latitude,
        facility.longitude,
        nextWaypointLatitude,
        nextWaypointLongitude
      );
    });
  }

  updateGameState() {
    this.currentScenario.currentTime += 1;

    this.facilityAutoDefense();
    this.shipAutoDefense();
    this.aircraftAirToAirEngagement();

    this.updateUnitsOnPatrolMission();
    this.clearCompletedStrikeMissions();
    this.updateUnitsOnStrikeMission();
    this.updateFocusFireOperation();

    this.currentScenario.weapons.forEach((weapon) => {
      weaponEngagement(this.currentScenario, weapon, this.simulationLogs);
    });

    this.updateAllAircraftPosition();
    this.updateAllShipPosition();
    this.updateAllFacilityPosition();
    this.updateOnBoardWeaponPositions();
    this.updatePatrolMissionScoring();
  }

  _getObservation(): Scenario {
    return this.currentScenario;
  }

  private getActiveCombatSideIds() {
    return [
      ...new Set(
        [
          ...this.currentScenario.aircraft.map((unit) => unit.sideId),
          ...this.currentScenario.ships.map((unit) => unit.sideId),
          ...this.currentScenario.armies.map((unit) => unit.sideId),
          ...this.currentScenario.facilities.map((unit) => unit.sideId),
          ...this.currentScenario.airbases.map((unit) => unit.sideId),
        ].filter(Boolean)
      ),
    ];
  }

  getGameEndState(): {
    terminated: boolean;
    truncated: boolean;
    info: GameStepInfo;
  } {
    const activeSideIds = this.getActiveCombatSideIds();
    const infoBase = {
      activeSideIds,
      activeSideNames: activeSideIds.map((sideId) =>
        this.currentScenario.getSideName(sideId)
      ),
    };

    if (this.currentScenario.currentTime >= this.currentScenario.endTime) {
      return {
        terminated: false,
        truncated: true,
        info: {
          doneReason: "truncated",
          doneReasonDetail: "time_limit",
          ...infoBase,
        },
      };
    }

    if (this.currentScenario.sides.length > 1 && activeSideIds.length === 0) {
      return {
        terminated: true,
        truncated: false,
        info: {
          doneReason: "terminated",
          doneReasonDetail: "no_active_sides",
          ...infoBase,
        },
      };
    }

    if (this.currentScenario.sides.length > 1 && activeSideIds.length === 1) {
      return {
        terminated: true,
        truncated: false,
        info: {
          doneReason: "terminated",
          doneReasonDetail: "single_side_remaining",
          ...infoBase,
        },
      };
    }

    return {
      terminated: false,
      truncated: false,
      info: {
        doneReason: "in_progress",
        doneReasonDetail: "in_progress",
        ...infoBase,
      },
    };
  }

  _getInfo() {
    return this.getGameEndState().info;
  }

  step(): GameStepResult {
    const preStepEndState = this.getGameEndState();
    if (preStepEndState.terminated || preStepEndState.truncated) {
      return [
        this._getObservation(),
        0,
        preStepEndState.terminated,
        preStepEndState.truncated,
        preStepEndState.info,
      ];
    }

    this.updateGameState();
    const endState = this.getGameEndState();
    const reward = 0;
    const observation = this._getObservation();
    return [
      observation,
      reward,
      endState.terminated,
      endState.truncated,
      endState.info,
    ];
  }

  stepForTimeCompression(
    stepSize: number = this.currentScenario.timeCompression
  ): GameStepResult {
    const normalizedStepSize = Math.max(1, Math.floor(stepSize));
    let result = this.step();
    let steps = 1;

    while (steps < normalizedStepSize && !result[2] && !result[3]) {
      result = this.step();
      steps += 1;
    }

    return result;
  }

  reset() {}

  checkGameEnded(): boolean {
    const endState = this.getGameEndState();
    return endState.terminated || endState.truncated;
  }

  startRecording() {
    this.playbackRecorder.startRecording(this.currentScenario);
  }

  recordStep(force: boolean = false) {
    if (
      this.recordingScenario &&
      (this.playbackRecorder.shouldRecord(this.currentScenario.currentTime) ||
        force)
    ) {
      this.playbackRecorder.recordStep(
        this.exportCurrentScenario(),
        this.currentScenario.currentTime
      );
    }
  }

  exportRecording() {
    this.playbackRecorder.exportRecording(this.currentScenario.currentTime);
  }

  exportRecourseRecording() {
    this.playbackRecorder.exportRecording(this.currentScenario.currentTime);
  }

  recordHistory() {
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift();
    }
    this.history.push(this.exportCurrentScenario());
  }

  undo(): boolean {
    if (this.history.length > 0) {
      const lastScenario = this.history.pop();
      if (lastScenario) {
        this.loadScenario(lastScenario);
        return true;
      }
    }
    return false;
  }
}
