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
export function installGameScenarioSerializationMethods(GameCtor: typeof Game) {
  (GameCtor.prototype as any).exportCurrentScenario = function (): string {
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
  
  ;

  (GameCtor.prototype as any).loadScenario = function (scenarioString: string) {
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
  
  ;
}

