import { describe, expect, test } from "vitest";
import Game from "@/game/Game";
import Scenario from "@/game/Scenario";
import Side from "@/game/Side";
import Aircraft from "@/game/units/Aircraft";
import Facility from "@/game/units/Facility";
import { buildSimulationOutcomeSummary } from "@/gui/analysis/operationInsight";

describe("Game end state", () => {
  test("treats scenario end time as truncation and does not advance further", () => {
    const blue = new Side({
      id: "blue",
      name: "BLUE",
      color: "blue",
    });
    const red = new Side({
      id: "red",
      name: "RED",
      color: "red",
    });
    const scenario = new Scenario({
      id: "time-limit-scenario",
      name: "Time Limit Scenario",
      startTime: 0,
      currentTime: 10,
      duration: 10,
      endTime: 10,
      sides: [blue, red],
      aircraft: [
        {
          id: "blue-aircraft",
          sideId: blue.id,
          getTotalWeaponQuantity: () => 0,
        } as never,
      ],
      facilities: [
        {
          id: "red-facility",
          sideId: red.id,
          getTotalWeaponQuantity: () => 0,
        } as never,
      ],
    });
    const game = new Game(scenario);

    const [observation, reward, terminated, truncated, info] = game.step();

    expect(observation.currentTime).toBe(10);
    expect(reward).toBe(0);
    expect(terminated).toBe(false);
    expect(truncated).toBe(true);
    expect(info).toMatchObject({
      doneReason: "truncated",
      doneReasonDetail: "time_limit",
      activeSideIds: [blue.id, red.id],
      activeSideNames: ["BLUE", "RED"],
    });
  });

  test("terminates when only one side retains combat units", () => {
    const blue = new Side({
      id: "blue",
      name: "BLUE",
      color: "blue",
      totalScore: 120,
    });
    const red = new Side({
      id: "red",
      name: "RED",
      color: "red",
      totalScore: 40,
    });
    const scenario = new Scenario({
      id: "annihilation-scenario",
      name: "Annihilation Scenario",
      startTime: 0,
      currentTime: 5,
      duration: 100,
      endTime: 100,
      sides: [blue, red],
      aircraft: [
        {
          id: "blue-aircraft",
          sideId: blue.id,
          getTotalWeaponQuantity: () => 2,
        } as never,
      ],
    });
    const game = new Game(scenario);

    const [observation, reward, terminated, truncated, info] = game.step();
    const summary = buildSimulationOutcomeSummary(game);

    expect(observation.currentTime).toBe(5);
    expect(reward).toBe(0);
    expect(terminated).toBe(true);
    expect(truncated).toBe(false);
    expect(game.checkGameEnded()).toBe(true);
    expect(info).toMatchObject({
      doneReason: "terminated",
      doneReasonDetail: "single_side_remaining",
      activeSideIds: [blue.id],
      activeSideNames: ["BLUE"],
    });
    expect(summary.endReason).toBe("단일 세력 생존");
    expect(summary.endReasonDetail).toBe("single_side_remaining");
    expect(summary.activeSideSummary).toBe("생존 세력 BLUE");
  });

  test("stops compressed stepping as soon as the game ends", () => {
    const blue = new Side({
      id: "blue",
      name: "BLUE",
      color: "blue",
    });
    const red = new Side({
      id: "red",
      name: "RED",
      color: "red",
    });
    const scenario = new Scenario({
      id: "compressed-time-limit-scenario",
      name: "Compressed Time Limit Scenario",
      startTime: 0,
      currentTime: 0,
      duration: 2,
      endTime: 2,
      timeCompression: 5,
      sides: [blue, red],
      aircraft: [
        new Aircraft({
          id: "blue-aircraft",
          name: "Blue Jet",
          sideId: blue.id,
          className: "Fighter",
          latitude: 37,
          longitude: 127,
          altitude: 20000,
          heading: 0,
          speed: 300,
          currentFuel: 1000,
          maxFuel: 1000,
          fuelRate: 10,
          range: 100,
          sideColor: "blue",
          weapons: [],
          route: [],
        }),
      ],
      facilities: [
        new Facility({
          id: "red-facility",
          name: "Red SAM",
          sideId: red.id,
          className: "SAM",
          latitude: 37.2,
          longitude: 127.2,
          altitude: 0,
          range: 50,
          sideColor: "red",
          weapons: [],
        }),
      ],
    });
    const game = new Game(scenario);

    const [observation, , terminated, truncated, info] =
      game.stepForTimeCompression();

    expect(observation.currentTime).toBe(2);
    expect(terminated).toBe(false);
    expect(truncated).toBe(true);
    expect(info.doneReasonDetail).toBe("time_limit");
  });

  test("terminates when no side retains active combat units", () => {
    const blue = new Side({
      id: "blue",
      name: "BLUE",
      color: "blue",
    });
    const red = new Side({
      id: "red",
      name: "RED",
      color: "red",
    });
    const scenario = new Scenario({
      id: "no-active-sides-scenario",
      name: "No Active Sides Scenario",
      startTime: 0,
      currentTime: 1,
      duration: 20,
      endTime: 20,
      sides: [blue, red],
    });
    const game = new Game(scenario);

    const [, , terminated, truncated, info] = game.step();
    const summary = buildSimulationOutcomeSummary(game);

    expect(terminated).toBe(true);
    expect(truncated).toBe(false);
    expect(info).toMatchObject({
      doneReason: "terminated",
      doneReasonDetail: "no_active_sides",
      activeSideIds: [],
      activeSideNames: [],
    });
    expect(summary.endReason).toBe("활성 전력 소실");
    expect(summary.endReasonDetail).toBe("no_active_sides");
    expect(summary.activeSideSummary).toBe("잔존 전력 없음");
  });
});
