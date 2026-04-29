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
export function installGameScenarioEditingMethods(GameCtor: typeof Game) {
  (GameCtor.prototype as any).addSide = function (
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
  
  ;

  (GameCtor.prototype as any).updateSide = function (
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
  
  ;

  (GameCtor.prototype as any).deleteSide = function (sideId: string) {
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
  
  ;

  (GameCtor.prototype as any).getDefaultWeapons = function (
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
  
  ;

  (GameCtor.prototype as any).getDefaultAircraftWeapons = function (
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
  
  ;

  (GameCtor.prototype as any).getDefaultFacilityWeapons = function (
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
  
  ;

  (GameCtor.prototype as any).getDefaultShipWeapons = function (
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
  
  ;

  (GameCtor.prototype as any).addAircraft = function (
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
  
  ;

  (GameCtor.prototype as any).addAircraftToAirbase = function (
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
  
  ;

  (GameCtor.prototype as any).removeAircraftFromAirbase = function (
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
  
  ;

  (GameCtor.prototype as any).addAirbase = function (
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
  
  ;

  (GameCtor.prototype as any).addReferencePoint = function (
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
  
  ;

  (GameCtor.prototype as any).removeReferencePoint = function (referencePointId: string) {
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
  
  ;

  (GameCtor.prototype as any).removeWeapon = function (weaponId: string) {
      this.recordHistory();
      this.currentScenario.weapons = this.currentScenario.weapons.filter(
        (weapon) => weapon.id !== weaponId
      );
    }
  
  ;

  (GameCtor.prototype as any).removeAirbase = function (airbaseId: string) {
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
  
  ;

  (GameCtor.prototype as any).removeFacility = function (facilityId: string) {
      this.recordHistory();
      this.currentScenario.facilities = this.currentScenario.facilities.filter(
        (facility) => facility.id !== facilityId
      );
      this.focusFireOperation.launchedPlatformIds =
        this.focusFireOperation.launchedPlatformIds.filter(
          (id) => id !== facilityId
        );
    }
  
  ;

  (GameCtor.prototype as any).removeArmy = function (armyId: string) {
      this.recordHistory();
      this.currentScenario.armies = this.currentScenario.armies.filter(
        (army) => army.id !== armyId
      );
      this.focusFireOperation.launchedPlatformIds =
        this.focusFireOperation.launchedPlatformIds.filter((id) => id !== armyId);
    }
  
  ;

  (GameCtor.prototype as any).removeAircraft = function (aircraftId: string) {
      this.recordHistory();
      this.currentScenario.aircraft = this.currentScenario.aircraft.filter(
        (aircraft) => aircraft.id !== aircraftId
      );
      this.focusFireOperation.launchedPlatformIds =
        this.focusFireOperation.launchedPlatformIds.filter(
          (id) => id !== aircraftId
        );
    }
  
  ;

  (GameCtor.prototype as any).addFacility = function (
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
  
  ;

  (GameCtor.prototype as any).addArmy = function (
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
  
  ;

  (GameCtor.prototype as any).addShip = function (
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
  
  ;

  (GameCtor.prototype as any).duplicateUnit = function (unitId: string, unitType: string) {
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
  
  ;

  (GameCtor.prototype as any).addAircraftToShip = function (
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
  
  ;

  (GameCtor.prototype as any).launchAircraftFromShip = function (shipId: string, aircraftIds: string[]) {
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
  
  ;

  (GameCtor.prototype as any).removeAircraftFromShip = function (shipId: string, aircraftIds: string[]): Aircraft[] {
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
  
  ;

  (GameCtor.prototype as any).removeShip = function (shipId: string) {
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
  
  ;

  (GameCtor.prototype as any).createPatrolMission = function (
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
  
  ;

  (GameCtor.prototype as any).updatePatrolMission = function (
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
  
  ;

  (GameCtor.prototype as any).createStrikeMission = function (
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
  
  ;

  (GameCtor.prototype as any).updateStrikeMission = function (
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
  
  ;

  (GameCtor.prototype as any).deleteMission = function (missionId: string) {
      this.recordHistory();
      this.currentScenario.missions = this.currentScenario.missions.filter(
        (mission) => mission.id !== missionId
      );
    }
  
  ;

  (GameCtor.prototype as any).moveAircraft = function (aircraftId: string, newLatitude: number, newLongitude: number) {
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
  
  ;

  (GameCtor.prototype as any).moveShip = function (shipId: string, newLatitude: number, newLongitude: number) {
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
  
  ;

  (GameCtor.prototype as any).moveArmy = function (armyId: string, newLatitude: number, newLongitude: number) {
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
  
  ;

  (GameCtor.prototype as any).moveFacility = function (
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
  
  ;

  (GameCtor.prototype as any).moveGroundUnit = function (
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
  
  ;

  (GameCtor.prototype as any).commitRoute = function (unitId: string) {
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
  
  ;

  (GameCtor.prototype as any).teleportUnit = function (unitId: string, newLatitude: number, newLongitude: number) {
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
  
  ;

  (GameCtor.prototype as any).launchAircraftFromAirbase = function (airbaseId: string, aircraftIds: string[]) {
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
  
  ;

  (GameCtor.prototype as any).handleAircraftAttack = function (
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
  
  ;

  (GameCtor.prototype as any).handleShipAttack = function (
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
  
  ;

  (GameCtor.prototype as any).handleArmyAttack = function (
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
  
  ;

  (GameCtor.prototype as any).aircraftReturnToBase = function (aircraftId: string) {
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
  
  ;

  (GameCtor.prototype as any).getFuelNeededToReturnToBase = function (aircraft: Aircraft) {
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
  
  ;

  (GameCtor.prototype as any).landAircraft = function (aircraftId: string) {
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
  
  ;

  (GameCtor.prototype as any).switchCurrentSide = function (sideId: string) {
      if (this.currentScenario.getSide(sideId)) {
        this.currentSideId = sideId;
      }
    }
  
  ;

  (GameCtor.prototype as any).switchScenarioTimeCompression = function () {
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
  
  ;
}

