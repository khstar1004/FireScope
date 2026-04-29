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

export {
  randomUUID,
  Aircraft,
  Army,
  Facility,
  Scenario,
  getBearingBetweenTwoPoints,
  getNextCoordinates,
  getDistanceBetweenTwoPoints,
  getTerminalCoordinatesFromDistanceAndBearing,
  randomInt,
  aircraftPursuit,
  isThreatDetected,
  checkTargetTrackedByCount,
  launchWeapon,
  platformCanEngageTarget,
  routeAircraftToStrikePosition,
  weaponEngagement,
  weaponCanEngageTarget,
  Airbase,
  Side,
  Weapon,
  GAME_SPEED_DELAY_MS,
  KILOMETERS_TO_NAUTICAL_MILES,
  NAUTICAL_MILES_TO_METERS,
  Ship,
  ReferencePoint,
  PatrolMission,
  StrikeMission,
  PlaybackRecorder,
  RecordingPlayer,
  SIDE_COLOR,
  Relationships,
  Dba,
  SimulationLogs,
  SimulationLogType,
  DoctrineType,
  getFacilityDetectionArcDegrees,
  getFacilityThreatRange,
  inferBattle3dProfileHint,
  isGroundVisualProfileId,
  resolveUnitVisualProfileId,
  getScenarioFacilityPlacementGroups,
  setScenarioFacilityPlacementGroups,
  getDisplayName,
  processFuelExhaustion,
  processPatrolMissionSuccess,
  processStrikeMissionSuccess,
  none,
  isDroneAircraftClassName,
  isFiresFacilityClassName,
  isSupportAircraftClassName,
  isTankFacilityClassName,
  isTargetInsideSector,
  FOCUS_FIRE_RERANKER_FEATURE_NAMES,
  createDefaultFocusFireRerankerModel,
  explainFocusFireRerankerCandidate,
  getFocusFireRerankerConfidence,
  rerankFocusFireCandidates,
  trainFocusFireRerankerFromTelemetry,
};
export type {
  SideDoctrine,
  Battle3dProfileHint,
  UnitVisualProfileId,
  FocusFireRerankerModel,
  Target,
};
export const MAX_HISTORY_SIZE = 20;
export const FOCUS_FIRE_OBJECTIVE_NAME = "집중포격 목표";
export const FOCUS_FIRE_CAPTURE_RADIUS_KM = 1.6;
export const FOCUS_FIRE_TARGET_ANALYSIS_RADIUS_KM = 5;
export const FEET_TO_METERS = 0.3048;

export interface IMapView {
  defaultCenter: number[];
  currentCameraCenter: number[];
  defaultZoom: number;
  currentCameraZoom: number;
}

export interface IAttackParams {
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
  targetAltitudeMeters?: number;
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

export interface FocusFireAnalysisTarget {
  id: string;
  name: string;
  sideId: string;
  className: string;
  latitude: number;
  longitude: number;
  entityType: "aircraft" | "army" | "facility" | "airbase" | "ship";
  weaponInventory: number;
}

export interface FocusFireObjectivePoint {
  name: string | null;
  latitude: number;
  longitude: number;
}

export interface FocusFireRecommendationAccumulator {
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

export function getFocusFireAltitudeMeters(altitudeFeet: number) {
  return Math.max(0, altitudeFeet) * FEET_TO_METERS;
}

export function roundToDigits(value: number, digits: number) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

export function getFocusFireTravelTimeSeconds(distanceKm: number, speedKts: number) {
  if (!(distanceKm > 0) || !(speedKts > 0)) {
    return 0;
  }

  return ((distanceKm * KILOMETERS_TO_NAUTICAL_MILES) / speedKts) * 3600;
}

export function getFocusFireExecutionReadinessLabel(
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

export function getFocusFireAnalysisTargetBaseValue(target: FocusFireAnalysisTarget) {
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

export function getFocusFireAnalysisTargetCombatValue(
  target: FocusFireAnalysisTarget
) {
  return (
    getFocusFireAnalysisTargetBaseValue(target) +
    Math.min(target.weaponInventory, 24) * 0.6
  );
}

export function buildFocusFireTargetLabel(
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

export function getFocusFireAnalysisTargetCategoryLabel(
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

export type FocusFireWeaponProfile =
  | "cluster"
  | "precision"
  | "antiArmor"
  | "antiShip"
  | "general";

export function getFocusFireWeaponProfile(weaponName: string) {
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

export function getFocusFireAmmoType(
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

export function getFocusFireMissionKind(
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

export function getFocusFireTargetPriorityLabel(
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

export function getFocusFireDesiredEffectLabel(
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

export function buildFocusFireRecommendationRationale(
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

export function buildFocusFireRecommendationTelemetryKey(
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

export function buildFocusFireRecommendationTelemetryOptionsSnapshot(
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

export function buildFocusFireRecommendationTelemetrySignature(
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

export function buildFocusFireRecommendationTelemetryRecordSignature(
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

export function normalizeImportedFocusFireRerankerModel(
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

export function createDefaultFocusFireOperation(): FocusFireOperation {
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

