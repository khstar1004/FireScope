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
export function installGameSimulationMethods(GameCtor: typeof Game) {
  (GameCtor.prototype as any).facilityAutoDefense = function () {
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
  
  ;

  (GameCtor.prototype as any).shipAutoDefense = function () {
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
  
  ;

  (GameCtor.prototype as any).aircraftAirToAirEngagement = function () {
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
  
  ;

  (GameCtor.prototype as any).updateUnitsOnPatrolMission = function () {
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
  
  ;

  (GameCtor.prototype as any).clearCompletedStrikeMissions = function () {
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
  ;

  (GameCtor.prototype as any).updateUnitsOnStrikeMission = function () {
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
  
  ;

  (GameCtor.prototype as any).updateFocusFireOperation = function () {
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
  
  ;

  (GameCtor.prototype as any).updatePatrolMissionScoring = function () {
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
  
  ;

  (GameCtor.prototype as any).updateOnBoardWeaponPositions = function () {
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
  
  ;

  (GameCtor.prototype as any).getStrikeMissionCurrentTarget = function (mission: StrikeMission) {
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
  
  ;

  (GameCtor.prototype as any).updateAllAircraftPosition = function () {
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
  
  ;

  (GameCtor.prototype as any).updateAllShipPosition = function () {
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
  
  ;

  (GameCtor.prototype as any).updateAllFacilityPosition = function () {
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
  
  ;

  (GameCtor.prototype as any).updateGameState = function () {
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
  
  ;

  (GameCtor.prototype as any)._getObservation = function (): Scenario {
      return this.currentScenario;
    }
  
  ;

  (GameCtor.prototype as any).getActiveCombatSideIds = function () {
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
  
  ;

  (GameCtor.prototype as any).getGameEndState = function (): {
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
  
  ;

  (GameCtor.prototype as any)._getInfo = function () {
      return this.getGameEndState().info;
    }
  
  ;

  (GameCtor.prototype as any).step = function (): GameStepResult {
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
  
  ;

  (GameCtor.prototype as any).stepForTimeCompression = function (
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
  
  ;

  (GameCtor.prototype as any).reset = function () {}
  
  ;

  (GameCtor.prototype as any).checkGameEnded = function (): boolean {
      const endState = this.getGameEndState();
      return endState.terminated || endState.truncated;
    }
  
  ;

  (GameCtor.prototype as any).startRecording = function () {
      this.playbackRecorder.startRecording(this.currentScenario);
    }
  
  ;

  (GameCtor.prototype as any).recordStep = function (force: boolean = false) {
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
  
  ;

  (GameCtor.prototype as any).exportRecording = function () {
      this.playbackRecorder.exportRecording(this.currentScenario.currentTime);
    }
  
  ;

  (GameCtor.prototype as any).exportRecourseRecording = function () {
      this.playbackRecorder.exportRecording(this.currentScenario.currentTime);
    }
  
  ;

  (GameCtor.prototype as any).recordHistory = function () {
      if (this.history.length > MAX_HISTORY_SIZE) {
        this.history.shift();
      }
      this.history.push(this.exportCurrentScenario());
    }
  
  ;

  (GameCtor.prototype as any).undo = function (): boolean {
      if (this.history.length > 0) {
        const lastScenario = this.history.pop();
        if (lastScenario) {
          this.loadScenario(lastScenario);
          return true;
        }
      }
      return false;
    }
  
  ;
}

