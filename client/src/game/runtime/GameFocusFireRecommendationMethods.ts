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
  buildFocusFireTargetLabel,
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
export function installGameFocusFireRecommendationMethods(GameCtor: typeof Game) {
  (GameCtor.prototype as any).getFocusFireAnalysisTargets = function (
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
  
  ;

  (GameCtor.prototype as any).buildFocusFireRecommendation = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireRecommendation = function (
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
  
  ;

  (GameCtor.prototype as any).getFireRecommendationForTarget = function (
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
  
  ;

  (GameCtor.prototype as any).getFireRecommendationTargetPriorities = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireSummary = function (): FocusFireSummary {
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
  
  ;
}

