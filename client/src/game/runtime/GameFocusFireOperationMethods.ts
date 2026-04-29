// @ts-nocheck
import type Game from "../Game";
import {
  Aircraft,
  Airbase,
  Army,
  Dba,
  DoctrineType,
  Facility,
  FOCUS_FIRE_CAPTURE_RADIUS_KM,
  FOCUS_FIRE_OBJECTIVE_NAME,
  FOCUS_FIRE_TARGET_ANALYSIS_RADIUS_KM,
  GAME_SPEED_DELAY_MS,
  KILOMETERS_TO_NAUTICAL_MILES,
  MAX_HISTORY_SIZE,
  NAUTICAL_MILES_TO_METERS,
  PatrolMission,
  PlaybackRecorder,
  RecordingPlayer,
  ReferencePoint,
  Relationships,
  SIDE_COLOR,
  Scenario,
  Ship,
  Side,
  SimulationLogType,
  SimulationLogs,
  StrikeMission,
  Weapon,
  aircraftPursuit,
  buildFocusFireRecommendationTelemetryRecordSignature,
  buildFocusFireRecommendationTelemetrySignature,
  buildFocusFireRecommendationTelemetryOptionsSnapshot,
  buildFocusFireRecommendationTelemetryKey,
  buildFocusFireRecommendationRationale,
  checkTargetTrackedByCount,
  createDefaultFocusFireOperation,
  createDefaultFocusFireRerankerModel,
  explainFocusFireRerankerCandidate,
  getBearingBetweenTwoPoints,
  getDisplayName,
  getDistanceBetweenTwoPoints,
  getFacilityDetectionArcDegrees,
  getFacilityThreatRange,
  getFocusFireAltitudeMeters,
  getFocusFireAmmoType,
  getFocusFireAnalysisTargetCategoryLabel,
  getFocusFireAnalysisTargetCombatValue,
  getFocusFireDesiredEffectLabel,
  getFocusFireExecutionReadinessLabel,
  getFocusFireMissionKind,
  getFocusFireTargetPriorityLabel,
  getFocusFireTravelTimeSeconds,
  getFocusFireWeaponProfile,
  getFocusFireRerankerConfidence,
  getNextCoordinates,
  getScenarioFacilityPlacementGroups,
  getTerminalCoordinatesFromDistanceAndBearing,
  inferBattle3dProfileHint,
  isDroneAircraftClassName,
  isFiresFacilityClassName,
  isGroundVisualProfileId,
  isSupportAircraftClassName,
  isTankFacilityClassName,
  isTargetInsideSector,
  isThreatDetected,
  launchWeapon,
  normalizeImportedFocusFireRerankerModel,
  platformCanEngageTarget,
  processFuelExhaustion,
  processPatrolMissionSuccess,
  processStrikeMissionSuccess,
  randomInt,
  randomUUID,
  rerankFocusFireCandidates,
  resolveUnitVisualProfileId,
  routeAircraftToStrikePosition,
  roundToDigits,
  setScenarioFacilityPlacementGroups,
  trainFocusFireRerankerFromTelemetry,
  weaponCanEngageTarget,
  weaponEngagement,
  type Battle3dProfileHint,
  type BattleSpectatorEntityType,
  type BattleSpectatorEvent,
  type BattleSpectatorPointSnapshot,
  type BattleSpectatorSnapshot,
  type BattleSpectatorUnitSnapshot,
  type BattleSpectatorWeaponInventorySnapshot,
  type BattleSpectatorWeaponSnapshot,
  type FireRecommendationTargetPriority,
  type FocusFireAnalysisTarget,
  type FocusFireExecutionState,
  type FocusFireFiringPlanItem,
  type FocusFireLaunchPlatform,
  type FocusFireLaunchVariant,
  type FocusFireObjectivePoint,
  type FocusFireOperation,
  type FocusFireRecommendation,
  type FocusFireRecommendationAccumulator,
  type FocusFireRecommendationOption,
  type FocusFireRecommendationTelemetryOption,
  type FocusFireRecommendationTelemetryRecord,
  type FocusFireRerankerModel,
  type FocusFireSummary,
  type FocusFireTargetComposition,
  type FocusFireWeaponTrack,
  type GameStepInfo,
  type GameStepResult,
  type Mission,
  type Target,
  type UnitVisualProfileId,
} from "../GameSupport";
export function installGameFocusFireOperationMethods(GameCtor: typeof Game) {
  (GameCtor.prototype as any).clearFocusFireOperation = function (
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
  
  ;

  (GameCtor.prototype as any).setFocusFireMode = function (enabled: boolean = !this.focusFireOperation.enabled) {
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
  
  ;

  (GameCtor.prototype as any).setFocusFireDesiredEffectOverride = function (
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
  
  ;

  (GameCtor.prototype as any).setFocusFireObjective = function (latitude: number, longitude: number) {
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
  
  ;

  (GameCtor.prototype as any).getFocusFireArmorDestination = function (
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
  
  ;

  (GameCtor.prototype as any).launchAllWeaponsAtObjective = function (
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
  ;
}

