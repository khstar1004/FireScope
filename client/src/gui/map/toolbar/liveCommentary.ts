import {
  SimulationLog,
  SimulationLogType,
} from "@/game/log/SimulationLogs";
import { unixToLocalTime } from "@/utils/dateTimeFunctions";

export type LiveCommentaryTone = "success" | "warning" | "info";

export interface LiveCommentaryNotification {
  id: string;
  headline: string;
  commentary: string;
  occurredAtLabel: string;
  sideName: string;
  sideColor: string;
  tone: LiveCommentaryTone;
}

const MAJOR_SIMULATION_LOG_TYPES = new Set<SimulationLogType>([
  SimulationLogType.WEAPON_HIT,
  SimulationLogType.WEAPON_MISSED,
  SimulationLogType.WEAPON_CRASHED,
  SimulationLogType.AIRCRAFT_CRASHED,
  SimulationLogType.STRIKE_MISSION_SUCCESS,
  SimulationLogType.STRIKE_MISSION_ABORTED,
  SimulationLogType.PATROL_MISSION_SUCCESS,
]);

export function isMajorSimulationLog(log: SimulationLog) {
  return MAJOR_SIMULATION_LOG_TYPES.has(log.type);
}

function getCommentaryTone(log: SimulationLog): LiveCommentaryTone {
  switch (log.type) {
    case SimulationLogType.WEAPON_HIT:
    case SimulationLogType.STRIKE_MISSION_SUCCESS:
    case SimulationLogType.PATROL_MISSION_SUCCESS:
      return "success";
    case SimulationLogType.WEAPON_MISSED:
    case SimulationLogType.WEAPON_CRASHED:
    case SimulationLogType.AIRCRAFT_CRASHED:
    case SimulationLogType.STRIKE_MISSION_ABORTED:
      return "warning";
    default:
      return "info";
  }
}

function buildCommentary(log: SimulationLog, sideName: string) {
  switch (log.type) {
    case SimulationLogType.WEAPON_HIT:
      return `${sideName}의 타격이 실효를 냈습니다. 주요 표적 손실이 전황에 바로 반영됩니다.`;
    case SimulationLogType.WEAPON_MISSED:
      return `${sideName}의 공격은 불발됐습니다. 후속 타격이 이어지는지 지켜봐야 합니다.`;
    case SimulationLogType.WEAPON_CRASHED:
      if (log.message.includes("표적을 상실")) {
        return `${sideName} 유도탄이 추적을 잃었습니다. 교전 효율이 잠시 꺾였습니다.`;
      }
      if (log.message.includes("연료가 소진")) {
        return `${sideName} 무장이 접근 한계에 도달했습니다. 거리 관리가 부족했습니다.`;
      }
      return `${sideName} 무장이 전장 이탈했습니다. 추가 교전 여력이 줄었습니다.`;
    case SimulationLogType.AIRCRAFT_CRASHED:
      return `${sideName} 항공 전력이 감소했습니다. 공중전 부담이 커질 수 있습니다.`;
    case SimulationLogType.STRIKE_MISSION_SUCCESS:
      return `${sideName}의 타격 축이 효과를 냈습니다. 목표 지역 압박이 강화됩니다.`;
    case SimulationLogType.STRIKE_MISSION_ABORTED:
      return `${sideName}의 타격 축이 끊겼습니다. 재정비 후 다시 압박해야 합니다.`;
    case SimulationLogType.PATROL_MISSION_SUCCESS:
      return `${sideName}이 공역 통제를 유지하고 있습니다. 감시망은 아직 살아 있습니다.`;
    default:
      return `${sideName}의 전장 상황이 갱신됐습니다.`;
  }
}

export function buildLiveCommentaryNotification(
  log: SimulationLog,
  sideName: string,
  sideColor: string
): LiveCommentaryNotification {
  return {
    id: log.id,
    headline: log.message,
    commentary: buildCommentary(log, sideName),
    occurredAtLabel: unixToLocalTime(log.timestamp),
    sideName,
    sideColor,
    tone: getCommentaryTone(log),
  };
}
