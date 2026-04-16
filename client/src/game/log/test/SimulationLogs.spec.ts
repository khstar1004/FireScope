import { describe, expect, test } from "vitest";
import SimulationLogs, { SimulationLogType } from "@/game/log/SimulationLogs";

describe("SimulationLogs", () => {
  test("stores optional structured metadata with each log", () => {
    const logs = new SimulationLogs();

    logs.addLog(
      "blue",
      "KF-16이 적 지휘소를 명중시켜 파괴했습니다.",
      3600,
      SimulationLogType.WEAPON_HIT,
      {
        actorId: "blue-jet",
        actorName: "KF-16",
        actorType: "aircraft",
        targetId: "red-command",
        targetName: "적 지휘소",
        targetType: "facility",
        resultTag: "kill",
        actorScoreDelta: 50,
        targetScoreDelta: -70,
      }
    );

    expect(logs.getLogs()[0]).toMatchObject({
      sideId: "blue",
      type: SimulationLogType.WEAPON_HIT,
      metadata: {
        actorName: "KF-16",
        targetName: "적 지휘소",
        resultTag: "kill",
        actorScoreDelta: 50,
        targetScoreDelta: -70,
      },
    });
  });
});
