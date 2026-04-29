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
export function installGameFocusFireTelemetryMethods(GameCtor: typeof Game) {
  (GameCtor.prototype as any).getFocusFireRecommendationTelemetry = function (
      sideId?: string | null
    ): FocusFireRecommendationTelemetryRecord[] {
      if (!sideId) {
        return [...this.focusFireRecommendationTelemetry];
      }
  
      return this.focusFireRecommendationTelemetry.filter(
        (entry) => entry.sideId === sideId
      );
    }
  
  ;

  (GameCtor.prototype as any).clearFocusFireRecommendationTelemetry = function () {
      this.focusFireRecommendationTelemetry = [];
      this.focusFireRecommendationTelemetrySignatures.clear();
    }
  
  ;

  (GameCtor.prototype as any).findLatestFocusFireRecommendationTelemetryRecord = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireRecommendationFeedbackLabel = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireRerankerState = function () {
      return {
        enabled: this.focusFireRerankerEnabled,
        model: this.focusFireRerankerModel,
        confidenceScore: getFocusFireRerankerConfidence(
          this.focusFireRerankerModel
        ),
      };
    }
  
  ;

  (GameCtor.prototype as any).setFocusFireRerankerEnabled = function (enabled: boolean) {
      this.focusFireRerankerEnabled = enabled;
      return this.focusFireRerankerEnabled;
    }
  
  ;

  (GameCtor.prototype as any).resetFocusFireRerankerModel = function () {
      this.focusFireRerankerModel = createDefaultFocusFireRerankerModel();
      this.focusFireRerankerEnabled = false;
      return this.focusFireRerankerModel;
    }
  
  ;

  (GameCtor.prototype as any).trainFocusFireRerankerModel = function () {
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
  
  ;

  (GameCtor.prototype as any).exportFocusFireRecommendationTelemetryJsonl = function (sideId?: string | null): string {
      return this.getFocusFireRecommendationTelemetry(sideId)
        .map((entry) => JSON.stringify(entry))
        .join("\n");
    }
  
  ;

  (GameCtor.prototype as any).exportFocusFireRecommendationTelemetryCsv = function (sideId?: string | null): string {
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
  
  ;

  (GameCtor.prototype as any).exportFocusFireRerankerModel = function () {
      return JSON.stringify(this.focusFireRerankerModel, null, 2);
    }
  
  ;

  (GameCtor.prototype as any).importFocusFireRerankerModel = function (modelJson: string) {
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
  
  ;

  (GameCtor.prototype as any).recordFocusFireRecommendationTelemetry = function (
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
  
  ;

  (GameCtor.prototype as any).setFocusFireRecommendationFeedback = function (
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
  
  ;
}

