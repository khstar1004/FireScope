import {
  buildScenarioContextMessage,
  buildScenarioSnapshot,
} from "@/gui/agent/chatbotContext";
import Game from "@/game/Game";
import PatrolMission from "@/game/mission/PatrolMission";
import Relationships from "@/game/Relationships";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Aircraft from "@/game/units/Aircraft";
import ReferencePoint from "@/game/units/ReferencePoint";
import { SIDE_COLOR } from "@/utils/colors";

describe("chatbotContext", () => {
  test("builds a scenario snapshot with side summaries and recent logs", () => {
    const blueSide = new Side({
      id: "blue",
      name: "Blue",
      color: SIDE_COLOR.BLUE,
      totalScore: 12,
    });
    const redSide = new Side({
      id: "red",
      name: "Red",
      color: SIDE_COLOR.RED,
      totalScore: 5,
    });
    const patrolReferencePoints = [
      new ReferencePoint({
        id: "rp-1",
        name: "Alpha",
        sideId: "blue",
        latitude: 37.5,
        longitude: 127.0,
        altitude: 0,
      }),
      new ReferencePoint({
        id: "rp-2",
        name: "Bravo",
        sideId: "blue",
        latitude: 37.8,
        longitude: 127.1,
        altitude: 0,
      }),
      new ReferencePoint({
        id: "rp-3",
        name: "Charlie",
        sideId: "blue",
        latitude: 37.9,
        longitude: 127.4,
        altitude: 0,
      }),
      new ReferencePoint({
        id: "rp-4",
        name: "Delta",
        sideId: "blue",
        latitude: 37.6,
        longitude: 127.5,
        altitude: 0,
      }),
    ];
    const blueAircraft = new Aircraft({
      id: "air-blue-1",
      name: "Blue 1",
      sideId: "blue",
      className: "KF-16",
      latitude: 37.5,
      longitude: 127.0,
      altitude: 30000,
      heading: 90,
      speed: 420,
      currentFuel: 20,
      maxFuel: 100,
      fuelRate: 10,
      range: 450,
      rtb: true,
      targetId: "air-red-1",
    });
    const redAircraft = new Aircraft({
      id: "air-red-1",
      name: "Red 1",
      sideId: "red",
      className: "Fighter",
      latitude: 38.5,
      longitude: 128.0,
      altitude: 32000,
      heading: 270,
      speed: 430,
      currentFuel: 70,
      maxFuel: 100,
      fuelRate: 11,
      range: 460,
    });
    const scenario = new Scenario({
      id: "scenario-1",
      name: "테스트 시나리오",
      startTime: 1710000000,
      currentTime: 1710000600,
      duration: 7200,
      sides: [blueSide, redSide],
      aircraft: [blueAircraft, redAircraft],
      referencePoints: patrolReferencePoints,
      missions: [
        new PatrolMission({
          id: "mission-1",
          name: "CAP-1",
          sideId: "blue",
          assignedUnitIds: ["air-blue-1"],
          assignedArea: patrolReferencePoints,
          active: true,
        }),
      ],
      relationships: new Relationships({
        hostiles: { blue: ["red"], red: ["blue"] },
        allies: { blue: [], red: [] },
      }),
    });
    const game = new Game(scenario);
    game.currentSideId = "blue";
    game.selectedUnitId = "air-blue-1";
    game.simulationLogs.addLog(
      "blue",
      "Blue 1이 요격 대기 구역으로 진입했습니다.",
      1710000600
    );

    const snapshot = buildScenarioSnapshot(game);

    expect(snapshot.scenarioName).toBe("테스트 시나리오");
    expect(snapshot.currentSide).toBe("Blue");
    expect(snapshot.currentSideEnemyTargetCount).toBe(1);
    expect(snapshot.selectedUnit).toContain("Blue 1");
    expect(snapshot.totals.aircraft).toBe(2);

    const blueSummary = snapshot.sides.find((side) => side.name === "Blue");
    expect(blueSummary).toBeDefined();
    expect(blueSummary?.assets.aircraft).toBe(1);
    expect(blueSummary?.alerts.lowFuelAircraft).toHaveLength(1);
    expect(blueSummary?.alerts.returningAircraft).toHaveLength(1);
    expect(blueSummary?.missions[0]?.type).toBe("patrol");
    expect(snapshot.recentLogs[0]).toContain(
      "Blue 1이 요격 대기 구역으로 진입했습니다."
    );
  });

  test("builds a user context message containing the live scenario snapshot", () => {
    const scenario = new Scenario({
      id: "scenario-2",
      name: "간단 시나리오",
      startTime: 1710000000,
      currentTime: 1710000300,
      duration: 3600,
    });
    const game = new Game(scenario);

    const contextMessage = buildScenarioContextMessage(
      game,
      "현재 전력 상태를 요약해줘."
    );

    expect(contextMessage).toContain("현재 VISTA 시나리오 스냅샷입니다.");
    expect(contextMessage).toContain('"scenarioName": "간단 시나리오"');
    expect(contextMessage).toContain("현재 전력 상태를 요약해줘.");
  });
});
