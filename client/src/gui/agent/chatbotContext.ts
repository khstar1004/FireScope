import type Game from "@/game/Game";
import PatrolMission from "@/game/mission/PatrolMission";
import { unixToLocalTime } from "@/utils/dateTimeFunctions";
import { getDisplayName } from "@/utils/koreanCatalog";

const MAX_RECENT_LOGS = 8;
const MAX_NOTABLE_ITEMS = 5;

interface MissionSnapshot {
  name: string;
  type: "patrol" | "strike" | "mission";
  active: boolean;
  assignedUnits: string[];
  assignedTargets?: string[];
  assignedArea?: string[];
}

interface SideSnapshot {
  name: string;
  score: number;
  allies: string[];
  hostiles: string[];
  assets: {
    aircraft: number;
    ships: number;
    facilities: number;
    airbases: number;
    referencePoints: number;
    weapons: number;
  };
  alerts: {
    lowFuelAircraft: string[];
    returningAircraft: string[];
    engagedUnits: string[];
  };
  missions: MissionSnapshot[];
}

export interface ScenarioSnapshot {
  scenarioName: string;
  currentTime: {
    unix: number;
    label: string;
  };
  currentSide: string;
  selectedUnit: string | null;
  scenarioPaused: boolean;
  recordingScenario: boolean;
  totals: {
    sides: number;
    aircraft: number;
    ships: number;
    facilities: number;
    airbases: number;
    referencePoints: number;
    weaponsInFlight: number;
    missions: number;
  };
  currentSideEnemyTargetCount: number;
  sides: SideSnapshot[];
  recentLogs: string[];
}

function dedupeAndLimit(values: string[], limit: number = MAX_NOTABLE_ITEMS) {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

function formatPlatformName(name: string, className?: string) {
  const displayName = getDisplayName(name);
  const displayClassName = getDisplayName(className);
  if (!displayClassName || displayName === displayClassName) {
    return displayName;
  }
  return `${displayName} (${displayClassName})`;
}

function resolveEntityName(game: Game, entityId: string) {
  const scenario = game.currentScenario;
  const aircraft = scenario.getAircraft(entityId);
  if (aircraft) {
    return formatPlatformName(aircraft.name, aircraft.className);
  }
  const ship = scenario.getShip(entityId);
  if (ship) {
    return formatPlatformName(ship.name, ship.className);
  }
  const facility = scenario.getFacility(entityId);
  if (facility) {
    return formatPlatformName(facility.name, facility.className);
  }
  const airbase = scenario.getAirbase(entityId);
  if (airbase) {
    return formatPlatformName(airbase.name, airbase.className);
  }
  const referencePoint = scenario.getReferencePoint(entityId);
  if (referencePoint) {
    return referencePoint.name;
  }
  return entityId;
}

function summarizeMission(
  game: Game,
  mission: Game["currentScenario"]["missions"][number]
): MissionSnapshot {
  const assignedUnits = dedupeAndLimit(
    mission.assignedUnitIds.map((unitId) => resolveEntityName(game, unitId))
  );

  if (mission instanceof PatrolMission) {
    return {
      name: mission.name,
      type: "patrol",
      active: mission.active,
      assignedUnits,
      assignedArea: dedupeAndLimit(
        mission.assignedArea.map((referencePoint) => referencePoint.name),
        8
      ),
    };
  }

  return {
    name: mission.name,
    type: "strike",
    active: mission.active,
    assignedUnits,
    assignedTargets: dedupeAndLimit(
      mission.assignedTargetIds.map((targetId) =>
        resolveEntityName(game, targetId)
      ),
      8
    ),
  };
}

function summarizeSide(game: Game, sideId: string): SideSnapshot {
  const scenario = game.currentScenario;
  const side = scenario.getSide(sideId);
  const sideAircraft = scenario.aircraft.filter(
    (aircraft) => aircraft.sideId === sideId
  );
  const sideShips = scenario.ships.filter((ship) => ship.sideId === sideId);
  const sideFacilities = scenario.facilities.filter(
    (facility) => facility.sideId === sideId
  );
  const sideAirbases = scenario.airbases.filter(
    (airbase) => airbase.sideId === sideId
  );
  const sideReferencePoints = scenario.referencePoints.filter(
    (referencePoint) => referencePoint.sideId === sideId
  );
  const sideMissions = scenario.missions.filter(
    (mission) => mission.sideId === sideId
  );

  const lowFuelAircraft = dedupeAndLimit(
    sideAircraft
      .filter(
        (aircraft) =>
          aircraft.maxFuel > 0 && aircraft.currentFuel / aircraft.maxFuel <= 0.3
      )
      .map((aircraft) => formatPlatformName(aircraft.name, aircraft.className))
  );

  const returningAircraft = dedupeAndLimit(
    sideAircraft
      .filter((aircraft) => aircraft.rtb)
      .map((aircraft) => formatPlatformName(aircraft.name, aircraft.className))
  );

  const engagedUnits = dedupeAndLimit(
    [
      ...sideAircraft
        .filter((aircraft) => aircraft.targetId)
        .map(
          (aircraft) =>
            `${formatPlatformName(aircraft.name, aircraft.className)} -> ${resolveEntityName(
              game,
              aircraft.targetId
            )}`
        ),
      ...sideShips
        .filter((ship) => ship.route.length > 0)
        .map((ship) => formatPlatformName(ship.name, ship.className)),
    ],
    6
  );

  return {
    name: side?.name ?? sideId,
    score: side?.totalScore ?? 0,
    allies: scenario.relationships
      .getAllies(sideId)
      .map((allyId) => scenario.getSideName(allyId)),
    hostiles: scenario.relationships
      .getHostiles(sideId)
      .map((hostileId) => scenario.getSideName(hostileId)),
    assets: {
      aircraft: sideAircraft.length,
      ships: sideShips.length,
      facilities: sideFacilities.length,
      airbases: sideAirbases.length,
      referencePoints: sideReferencePoints.length,
      weapons:
        sideAircraft.reduce(
          (sum, aircraft) => sum + aircraft.getTotalWeaponQuantity(),
          0
        ) +
        sideShips.reduce(
          (sum, ship) => sum + ship.getTotalWeaponQuantity(),
          0
        ) +
        sideFacilities.reduce(
          (sum, facility) => sum + facility.getTotalWeaponQuantity(),
          0
        ),
    },
    alerts: {
      lowFuelAircraft,
      returningAircraft,
      engagedUnits,
    },
    missions: sideMissions.map((mission) => summarizeMission(game, mission)),
  };
}

function getSelectedUnitLabel(game: Game) {
  if (!game.selectedUnitId) {
    return null;
  }
  return resolveEntityName(game, game.selectedUnitId);
}

function getRecentLogs(game: Game) {
  return game.simulationLogs
    .getLogs()
    .slice(-MAX_RECENT_LOGS)
    .map((log) => {
      const sideName = game.currentScenario.getSideName(log.sideId);
      return `${unixToLocalTime(log.timestamp)} [${sideName}] ${log.message}`;
    });
}

export function buildScenarioSnapshot(game: Game): ScenarioSnapshot {
  const scenario = game.currentScenario;

  return {
    scenarioName: scenario.name,
    currentTime: {
      unix: scenario.currentTime,
      label: unixToLocalTime(scenario.currentTime),
    },
    currentSide: scenario.getSideName(game.currentSideId),
    selectedUnit: getSelectedUnitLabel(game),
    scenarioPaused: game.scenarioPaused,
    recordingScenario: game.recordingScenario,
    totals: {
      sides: scenario.sides.length,
      aircraft: scenario.aircraft.length,
      ships: scenario.ships.length,
      facilities: scenario.facilities.length,
      airbases: scenario.airbases.length,
      referencePoints: scenario.referencePoints.length,
      weaponsInFlight: scenario.weapons.length,
      missions: scenario.missions.length,
    },
    currentSideEnemyTargetCount: game.currentSideId
      ? scenario.getAllTargetsFromEnemySides(game.currentSideId).length
      : 0,
    sides: scenario.sides.map((side) => summarizeSide(game, side.id)),
    recentLogs: getRecentLogs(game),
  };
}

export function buildAssistantSystemPrompt() {
  return [
    "You are AI지휘결심지원(ArmyGPT), FireScope's operation planning assistant.",
    "Always answer in Korean.",
    "Base every claim on the provided scenario snapshot and conversation history.",
    "If the snapshot does not support a conclusion, explicitly say the information is missing.",
    "Focus on operational planning, risk assessment, force summary, and mission recommendations.",
    "When useful, structure the answer as: 1) 상황 요약 2) 핵심 위험 3) 권고 조치.",
    "This assistant is read-only for now. If the user asks you to modify the scenario directly, explain the change in steps instead of claiming it was executed.",
    "Keep answers concise, concrete, and action-oriented.",
  ].join("\n");
}

export function buildScenarioContextMessage(game: Game, userMessage: string) {
  const snapshot = buildScenarioSnapshot(game);
  return [
    "현재 FireScope 시나리오 스냅샷입니다.",
    JSON.stringify(snapshot, null, 2),
    "",
    "사용자 요청:",
    userMessage,
  ].join("\n");
}
