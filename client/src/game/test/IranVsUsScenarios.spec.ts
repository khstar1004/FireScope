import Game from "@/game/Game";
import Scenario from "@/game/Scenario";
import {
  findIranVsUsScenarioPreset,
  iranVsUsScenarioPresets,
  findKoreaVsNorthKoreaScenarioPreset,
  koreaVsNorthKoreaScenarioPresets,
} from "@/scenarios/iranVsUsScenarios";

function createSeedGame() {
  return new Game(
    new Scenario({
      id: "seed-scenario",
      name: "seed",
      startTime: 0,
      duration: 1,
    })
  );
}

describe("Iran vs US preset scenarios", () => {
  test.each(iranVsUsScenarioPresets)(
    "loads $displayName with every major gameplay bucket populated",
    ({ scenario, displayName, designIntent, assetHighlights }) => {
      const game = createSeedGame();

      game.loadScenario(JSON.stringify(scenario));

      expect(designIntent).toBeTruthy();
      expect(assetHighlights?.length).toBeGreaterThan(0);
      expect(game.currentScenario.name).toBe(displayName);
      expect(game.currentScenario.sides).toHaveLength(2);
      expect(game.currentScenario.aircraft.length).toBeGreaterThan(0);
      expect(game.currentScenario.airbases.length).toBeGreaterThan(0);
      expect(game.currentScenario.facilities.length).toBeGreaterThan(0);
      expect(game.currentScenario.referencePoints.length).toBeGreaterThan(0);
      expect(game.currentScenario.missions.length).toBeGreaterThan(0);
      expect(game.currentScenario.ships.length).toBeGreaterThan(0);
    }
  );

  test("registers the Hormuz blockade preset for toolbar lookup", () => {
    expect(findIranVsUsScenarioPreset("iran_vs_us_hormuz_blockade")).toEqual(
      expect.objectContaining({
        displayName: "이란 vs 미국 - 호르무즈 봉쇄",
      })
    );
  });

  test("registers the Al Dhafra raid preset for toolbar lookup", () => {
    expect(
      findIranVsUsScenarioPreset("iran_vs_us_al_dhafra_drone_raid")
    ).toEqual(
      expect.objectContaining({
        displayName: "이란 vs 미국 - 알다프라 드론 공습",
      })
    );
  });

  test.each(koreaVsNorthKoreaScenarioPresets)(
    "loads $displayName with Korean theater metadata",
    ({ scenario, displayName, designIntent, assetHighlights }) => {
      const game = createSeedGame();

      game.loadScenario(JSON.stringify(scenario));

      expect(designIntent).toBeTruthy();
      expect(assetHighlights?.length).toBeGreaterThan(0);
      expect(game.currentScenario.name).toBe(displayName);
      expect(game.currentScenario.sides).toHaveLength(2);
      expect(game.currentScenario.aircraft.length).toBeGreaterThan(14);
      expect(game.currentScenario.facilities.length).toBeGreaterThan(18);
      expect(game.currentScenario.ships.length).toBeGreaterThan(8);
      expect(game.currentScenario.missions.length).toBeGreaterThan(5);
    }
  );

  test("registers the Korea preset for toolbar lookup", () => {
    expect(
      findKoreaVsNorthKoreaScenarioPreset(
        "korea_vs_north_korea_west_sea_defense"
      )
    ).toEqual(
      expect.objectContaining({
        displayName: "한국 vs 북한 - 서해 합동 방어",
      })
    );
  });
});
