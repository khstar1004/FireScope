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
export function installGameFocusFireStateMethods(GameCtor: typeof Game) {
  (GameCtor.prototype as any).getFocusFireObjective = function (): ReferencePoint | undefined {
      return this.currentScenario.getReferencePoint(
        this.focusFireOperation.objectiveReferencePointId
      );
    }
  
  ;

  (GameCtor.prototype as any).getFocusFireAircraft = function (sideId = this.focusFireOperation.sideId): Aircraft[] {
      if (!sideId) return [];
      return this.currentScenario.aircraft.filter(
        (aircraft) =>
          aircraft.sideId === sideId &&
          aircraft.weapons.some((weapon) => weapon.currentQuantity > 0) &&
          (!isSupportAircraftClassName(aircraft.className) ||
            isDroneAircraftClassName(aircraft.className))
      );
    }
  
  ;

  (GameCtor.prototype as any).getFocusFireArtilleryFacilities = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireArmorFacilities = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireLaunchVariant = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireLaunchPlatforms = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireWeaponTracks = function (
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
  
  ;

  (GameCtor.prototype as any).buildBattleSpectatorPointSnapshot = function (
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
  
  ;

  (GameCtor.prototype as any).buildBattleSpectatorRouteSnapshot = function (
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
  
  ;

  (GameCtor.prototype as any).resolveBattleSpectatorUnitModelId = function (
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
  
  ;

  (GameCtor.prototype as any).resolveBattleSpectatorWeaponModelId = function (weapon: Weapon) {
      return resolveUnitVisualProfileId({
        entityType: "weapon",
        className: weapon.className,
        name: weapon.name,
        dbVisualProfileId: this.unitDba.findWeaponModel(weapon.className)
          ?.visualProfileId,
      });
    }
  
  ;

  (GameCtor.prototype as any).buildBattleSpectatorWeaponInventorySnapshot = function (
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
  
  ;

  (GameCtor.prototype as any).buildBattleSpectatorStatusFlags = function (
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
  
  ;

  (GameCtor.prototype as any).buildBattleSpectatorUnitSnapshot = function (
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
  
  ;

  (GameCtor.prototype as any).getBattleSpectatorSnapshot = function (maxEvents = 8): BattleSpectatorSnapshot {
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
          targetAltitudeMeters:
            target && "altitude" in target
              ? getFocusFireAltitudeMeters(target.altitude)
              : undefined,
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
  
  ;

  (GameCtor.prototype as any).getFocusFireHostileSideIds = function (sideId: string): Set<string> {
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
  
  ;

  (GameCtor.prototype as any).getFocusFireThreatExposureScore = function (
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
  
  ;

  (GameCtor.prototype as any).getFocusFireExecutionAssessment = function (
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
  
  ;
}

