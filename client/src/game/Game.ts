import { randomUUID } from "@/utils/generateUUID";
import Aircraft from "@/game/units/Aircraft";
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

const MAX_HISTORY_SIZE = 20;
const FOCUS_FIRE_OBJECTIVE_NAME = "집중포격 목표";
const FOCUS_FIRE_CAPTURE_RADIUS_KM = 1.6;
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

export interface FocusFireOperation {
  enabled: boolean;
  active: boolean;
  sideId: string | null;
  objectiveReferencePointId: string | null;
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

export interface FocusFireSummary {
  enabled: boolean;
  active: boolean;
  objectiveName: string | null;
  objectiveLatitude: number | null;
  objectiveLongitude: number | null;
  captureProgress: number;
  artilleryCount: number;
  armorCount: number;
  aircraftCount: number;
  weaponsInFlight: number;
  statusLabel: string;
  launchPlatforms: FocusFireLaunchPlatform[];
  weaponTracks: FocusFireWeaponTrack[];
}

function getFocusFireAltitudeMeters(altitudeFeet: number) {
  return Math.max(0, altitudeFeet) * FEET_TO_METERS;
}

function createDefaultFocusFireOperation(): FocusFireOperation {
  return {
    enabled: false,
    active: false,
    sideId: null,
    objectiveReferencePointId: null,
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
  ): Facility[] {
    if (!sideId) return [];
    return this.currentScenario.facilities.filter(
      (facility) =>
        facility.sideId === sideId &&
        isFiresFacilityClassName(facility.className) &&
        facility.weapons.some((weapon) => weapon.currentQuantity > 0)
    );
  }

  getFocusFireArmorFacilities(
    sideId = this.focusFireOperation.sideId
  ): Facility[] {
    if (!sideId) return [];
    return this.currentScenario.facilities.filter(
      (facility) =>
        facility.sideId === sideId &&
        isTankFacilityClassName(facility.className)
    );
  }

  getFocusFireLaunchVariant(
    platform: Aircraft | Facility
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

  getFocusFireSummary(): FocusFireSummary {
    const objective = this.getFocusFireObjective();
    const aircraftCount = this.getFocusFireAircraft().length;
    const artilleryCount = this.getFocusFireArtilleryFacilities().length;
    const armorCount = this.getFocusFireArmorFacilities().length;
    const launchPlatforms = this.getFocusFireLaunchPlatforms();
    const weaponTracks = this.getFocusFireWeaponTracks(objective);
    const weaponsInFlight = weaponTracks.length;

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
      captureProgress: this.focusFireOperation.captureProgress,
      artilleryCount,
      armorCount,
      aircraftCount,
      weaponsInFlight,
      statusLabel,
      launchPlatforms,
      weaponTracks,
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
      captureProgress: 0,
      launchedPlatformIds: [],
    };

    this.simulationLogs.addLog(
      this.currentSideId,
      `${FOCUS_FIRE_OBJECTIVE_NAME}을(를) 지정했습니다. 모든 화력이 목표 지점에 집중됩니다.`,
      this.currentScenario.currentTime,
      SimulationLogType.OTHER
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
    origin: Aircraft | Facility,
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

  aircraftReturnToBase(aircraftId: string) {
    const aircraft = this.currentScenario.getAircraft(aircraftId);
    if (aircraft) {
      this.recordHistory();
      if (aircraft.rtb) {
        this.simulationLogs.addLog(
          aircraft.sideId,
          `${aircraft.name}의 복귀 명령이 취소되었습니다.`,
          this.currentScenario.currentTime,
          SimulationLogType.RETURN_TO_BASE
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
            SimulationLogType.RETURN_TO_BASE
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
      focusFireOperation: this.focusFireOperation,
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
    });
    savedScenario.aircraft.forEach((aircraft: Aircraft) => {
      const aircraftWeapons: Weapon[] = aircraft.weapons?.map(
        (weapon: Weapon) => {
          return new Weapon({
            id: weapon.id,
            launcherId: "None",
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
            maxQuantity: weapon.maxQuantity,
            currentQuantity: weapon.currentQuantity,
            sideColor: weapon.sideColor,
          });
        }
      );
      const newAircraft = new Aircraft({
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
      });
      loadedScenario.aircraft.push(newAircraft);
    });
    savedScenario.airbases.forEach((airbase: Airbase) => {
      const airbaseAircraft: Aircraft[] = [];
      airbase.aircraft.forEach((aircraft: Aircraft) => {
        const aircraftWeapons: Weapon[] = aircraft.weapons?.map(
          (weapon: Weapon) => {
            return new Weapon({
              id: weapon.id,
              launcherId: "None",
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
              maxQuantity: weapon.maxQuantity,
              currentQuantity: weapon.currentQuantity,
              sideColor: weapon.sideColor,
            });
          }
        );
        const newAircraft = new Aircraft({
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
        });
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
      });
      loadedScenario.airbases.push(newAirbase);
    });
    savedScenario.facilities.forEach((facility: Facility) => {
      const facilityWeapons: Weapon[] = facility.weapons?.map(
        (weapon: Weapon) => {
          return new Weapon({
            id: weapon.id,
            launcherId: "None",
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
            maxQuantity: weapon.maxQuantity,
            currentQuantity: weapon.currentQuantity,
            sideColor: weapon.sideColor,
          });
        }
      );
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
      });
      loadedScenario.facilities.push(newFacility);
    });
    savedScenario.weapons.forEach((weapon: Weapon) => {
      const newWeapon = new Weapon({
        id: weapon.id,
        launcherId: "None",
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
        maxQuantity: weapon.maxQuantity,
        currentQuantity: weapon.currentQuantity,
        sideColor: weapon.sideColor,
      });
      loadedScenario.weapons.push(newWeapon);
    });
    savedScenario.ships?.forEach((ship: Ship) => {
      const shipAircraft: Aircraft[] = [];
      ship.aircraft.forEach((aircraft: Aircraft) => {
        const aircraftWeapons: Weapon[] = aircraft.weapons?.map(
          (weapon: Weapon) => {
            return new Weapon({
              id: weapon.id,
              launcherId: "None",
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
              maxQuantity: weapon.maxQuantity,
              currentQuantity: weapon.currentQuantity,
              sideColor: weapon.sideColor,
            });
          }
        );
        const newAircraft = new Aircraft({
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
        });
        shipAircraft.push(newAircraft);
      });
      const shipWeapons: Weapon[] = ship.weapons?.map((weapon: Weapon) => {
        return new Weapon({
          id: weapon.id,
          launcherId: "None",
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
          maxQuantity: weapon.maxQuantity,
          currentQuantity: weapon.currentQuantity,
          sideColor: weapon.sideColor,
        });
      });
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
  }

  toggleGodMode(enabled: boolean = !this.godMode) {
    this.godMode = enabled;
  }

  toggleEraserMode(enabled: boolean = !this.eraserMode) {
    this.eraserMode = enabled;
  }

  facilityAutoDefense() {
    this.currentScenario.facilities.forEach((facility) => {
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

          // SUCCESS CONDITION: Is the primary target destroyed?
          const target =
            this.currentScenario.getFacility(mission.assignedTargetIds[0]) ||
            this.currentScenario.getShip(mission.assignedTargetIds[0]) ||
            this.currentScenario.getAirbase(mission.assignedTargetIds[0]) ||
            this.currentScenario.getAircraft(mission.assignedTargetIds[0]);

          if (!target) {
            isMissionOngoing = false;
            processStrikeMissionSuccess(this.currentScenario, mission);
            this.simulationLogs.addLog(
              mission.sideId,
              `타격 임무 '${mission.name}' 완료: 목표가 파괴되었습니다.`,
              this.currentScenario.currentTime,
              SimulationLogType.STRIKE_MISSION_SUCCESS
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
              SimulationLogType.STRIKE_MISSION_ABORTED
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
          const target =
            this.currentScenario.getFacility(mission.assignedTargetIds[0]) ||
            this.currentScenario.getShip(mission.assignedTargetIds[0]) ||
            this.currentScenario.getAirbase(mission.assignedTargetIds[0]) ||
            this.currentScenario.getAircraft(mission.assignedTargetIds[0]);
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
              mission.assignedTargetIds[0],
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
        this.moveFacility(facility.id, latitude, longitude, true);
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
        SimulationLogType.STRIKE_MISSION_SUCCESS
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
        processPatrolMissionSuccess(this.currentScenario, mission);
        mission.lastScoringTime = this.currentScenario.currentTime; // Update the last scoring time
        this.simulationLogs.addLog(
          mission.sideId,
          `초계 임무 '${mission.name}' 유지 중입니다. 점수를 획득했습니다.`,
          this.currentScenario.currentTime,
          SimulationLogType.PATROL_MISSION_SUCCESS
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
        processFuelExhaustion(this.currentScenario, aircraft);
        this.removeAircraft(aircraft.id);
        this.simulationLogs.addLog(
          aircraft.sideId,
          `${aircraft.name}의 연료가 소진되어 추락했습니다.`,
          this.currentScenario.currentTime,
          SimulationLogType.AIRCRAFT_CRASHED
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
    this.currentScenario.facilities.forEach((facility) => {
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

  _getInfo() {
    return null;
  }

  step(): [Scenario, number, boolean, boolean, null] {
    this.updateGameState();
    const terminated = false; // FIXME
    const truncated = this.checkGameEnded(); //FIXME
    const reward = 0;
    const observation = this._getObservation();
    const info = this._getInfo();
    return [observation, reward, terminated, truncated, info];
  }

  reset() {}
  // TODO: send string msg instead
  checkGameEnded(): boolean {
    // 1. Time Limit - works!
    if (this.currentScenario.currentTime >= this.currentScenario.endTime) {
      console.log(
        "this.currentScenario.currentTime: ",
        this.currentScenario.currentTime
      );
      console.log(
        "this.currentScenario.duration",
        this.currentScenario.duration
      );
      return true;
    }

    // 2. Annihilation (Future Implementation)
    // const sidesWithUnits = this.currentScenario.sides.filter(side => {
    //   const hasAircraft = this.currentScenario.aircraft.some(u => u.sideId === side.id);
    //   const hasShips = this.currentScenario.ships.some(u => u.sideId === side.id);
    //   const hasFacilities = this.currentScenario.facilities.some(u => u.sideId === side.id);
    //   const hasAirbases = this.currentScenario.airbases.some(u => u.sideId === side.id);
    //   return hasAircraft || hasShips || hasFacilities || hasAirbases;
    // });
    // if (sidesWithUnits.length <= 1) {
    //   return true;
    // }

    // else
    return false;
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
