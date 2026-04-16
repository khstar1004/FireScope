import { randomUUID } from "@/utils/generateUUID";

export enum SimulationLogType {
  AIRCRAFT_CRASHED = "AIRCRAFT_CRASHED",
  OTHER = "OTHER",
  RETURN_TO_BASE = "RETURN_TO_BASE",
  STRIKE_MISSION_ABORTED = "STRIKE_MISSION_ABORTED",
  STRIKE_MISSION_SUCCESS = "STRIKE_MISSION_SUCCESS",
  WEAPON_CRASHED = "WEAPON_CRASHED",
  WEAPON_EXPENDED = "WEAPON_EXPENDED",
  WEAPON_HIT = "WEAPON_HIT",
  WEAPON_LAUNCHED = "WEAPON_LAUNCHED",
  WEAPON_MISSED = "WEAPON_MISSED",
  PATROL_MISSION_SUCCESS = "PATROL_MISSION_SUCCESS",
}

export type SimulationLogEntityType =
  | "aircraft"
  | "facility"
  | "ship"
  | "airbase"
  | "weapon"
  | "referencePoint"
  | "mission"
  | "unknown";

export type SimulationLogResultTag =
  | "launch"
  | "impact"
  | "damage"
  | "kill"
  | "miss"
  | "fuel_loss"
  | "target_lost"
  | "mission_success"
  | "mission_abort"
  | "rtb_start"
  | "rtb_cancel"
  | "objective_assigned"
  | "objective_secured"
  | "patrol_hold";

export interface SimulationLogMetadata {
  actorId?: string;
  actorName?: string;
  actorSideId?: string;
  actorType?: SimulationLogEntityType;
  launcherId?: string;
  launcherName?: string;
  launcherType?: SimulationLogEntityType;
  weaponId?: string;
  weaponName?: string;
  weaponClassName?: string;
  targetId?: string;
  targetName?: string;
  targetSideId?: string;
  targetType?: SimulationLogEntityType;
  missionId?: string;
  missionName?: string;
  objectiveId?: string;
  objectiveName?: string;
  destinationId?: string;
  destinationName?: string;
  resultTag?: SimulationLogResultTag;
  actorScoreDelta?: number;
  targetScoreDelta?: number;
  scoreNetDelta?: number;
  quantity?: number;
  damage?: number;
  remainingHp?: number;
  maxHp?: number;
}

export interface SimulationLog {
  id: string;
  timestamp: number;
  type: SimulationLogType;
  sideId: string;
  message: string;
  metadata?: SimulationLogMetadata;
}

export default class SimulationLogs {
  private logs: SimulationLog[] = [];
  private hasNewLogs: boolean = false;

  addLog(
    sideId: string,
    message: string,
    timestamp: number = Date.now(),
    type: SimulationLogType = SimulationLogType.OTHER,
    metadata?: SimulationLogMetadata
  ) {
    const newLog: SimulationLog = {
      id: randomUUID(),
      timestamp,
      type,
      sideId,
      message,
      metadata:
        metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    };
    this.logs.push(newLog);
    this.hasNewLogs = true;
  }

  getHasNewLogs() {
    return this.hasNewLogs;
  }

  setHasNewLogs(hasNewLogs: boolean) {
    this.hasNewLogs = hasNewLogs;
  }

  getLogs(
    sideIds?: string[],
    messageTypes?: SimulationLogType[],
    numMessages?: number,
    orderBy: "asc" | "desc" = "asc"
  ): SimulationLog[] {
    let filteredLogs = this.logs;
    if (sideIds) {
      filteredLogs = filteredLogs.filter((log) => sideIds.includes(log.sideId));
    }
    if (messageTypes) {
      filteredLogs = filteredLogs.filter((log) =>
        messageTypes.includes(log.type)
      );
    }
    // if (orderBy === "asc") {
    //   filteredLogs.sort((a, b) => a.timestamp - b.timestamp);
    // } else {
    //   filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
    // }
    if (numMessages) {
      return filteredLogs.slice(0, numMessages);
    }
    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
    this.hasNewLogs = true;
  }
}
