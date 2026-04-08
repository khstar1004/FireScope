import { describe, expect, test } from "vitest";
import {
  SimulationLogType,
  type SimulationLog,
} from "@/game/log/SimulationLogs";
import {
  buildLiveCommentaryNotification,
  isMajorSimulationLog,
} from "@/gui/map/toolbar/liveCommentary";

function createLog(
  type: SimulationLogType,
  message: string
): SimulationLog {
  return {
    id: `${type}-log`,
    timestamp: 1712472000,
    type,
    sideId: "north",
    message,
  };
}

describe("liveCommentary", () => {
  test("marks hit and crash logs as major commentary events", () => {
    expect(
      isMajorSimulationLog(
        createLog(
          SimulationLogType.WEAPON_HIT,
          "AGM-65 Maverick #772이(가) Seoul Air Base을(를) 명중시켜 파괴했습니다."
        )
      )
    ).toBe(true);
    expect(
      isMajorSimulationLog(
        createLog(
          SimulationLogType.WEAPON_CRASHED,
          "AGM-65 Maverick #478이(가) 표적을 상실해 더 이상 작동하지 않습니다."
        )
      )
    ).toBe(true);
    expect(
      isMajorSimulationLog(
        createLog(
          SimulationLogType.WEAPON_LAUNCHED,
          "발사 로그는 별도 해설 알림 대상이 아닙니다."
        )
      )
    ).toBe(false);
  });

  test("builds commentary that reflects the log outcome", () => {
    const hitNotification = buildLiveCommentaryNotification(
      createLog(
        SimulationLogType.WEAPON_HIT,
        "AGM-65 Maverick #772이(가) Seoul Air Base을(를) 명중시켜 파괴했습니다."
      ),
      "북한",
      "red"
    );
    const lostTrackNotification = buildLiveCommentaryNotification(
      createLog(
        SimulationLogType.WEAPON_CRASHED,
        "AGM-65 Maverick #478이(가) 표적을 상실해 더 이상 작동하지 않습니다."
      ),
      "북한",
      "red"
    );

    expect(hitNotification.headline).toContain("명중시켜 파괴");
    expect(hitNotification.commentary).toContain("주요 표적 손실");
    expect(hitNotification.tone).toBe("success");
    expect(lostTrackNotification.commentary).toContain("추적을 잃었습니다");
    expect(lostTrackNotification.tone).toBe("warning");
  });
});
