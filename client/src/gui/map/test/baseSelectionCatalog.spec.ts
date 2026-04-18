import Dba from "@/game/db/Dba";
import {
  buildBaseSelectionAirbaseOptions,
  buildPriorityQuickAddAirbaseOptions,
  PRIORITY_ARTILLERY_BASE_OPTIONS,
} from "@/gui/map/toolbar/baseSelectionCatalog";

describe("baseSelectionCatalog", () => {
  const airbaseDb = new Dba().getAirbaseDb();

  test("pins artillery brigade presets ahead of airbases", () => {
    expect(PRIORITY_ARTILLERY_BASE_OPTIONS.map((item) => item.label)).toEqual([
      "지상작전사령부 화력여단",
      "수도포병여단",
      "제1포병여단",
      "제2포병여단",
      "제5포병여단",
    ]);
  });

  test("keeps quick add airbase options focused on major bases", () => {
    const options = buildPriorityQuickAddAirbaseOptions(airbaseDb);
    const labels = options.map((item) => item.label);

    expect(labels).toContain("서울 공군기지");
    expect(labels).toContain("오산 공군기지");
    expect(labels).not.toContain("Gimhae Air Base");
  });

  test("keeps the full base selection list available after artillery presets", () => {
    const options = buildBaseSelectionAirbaseOptions(airbaseDb);

    expect(options.length).toBe(airbaseDb.length);
    expect(options[0]?.unitType).toBe("airbase");
  });
});
