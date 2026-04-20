import Dba from "@/game/db/Dba";
import {
  buildBaseSelectionAirbaseOptions,
  buildPriorityQuickAddAirbaseOptions,
  PRIORITY_ARTILLERY_BASE_OPTIONS,
  sortBaseSelectionOptionsByDistance,
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

  test("adds focus coordinates and preview copy to artillery presets", () => {
    expect(PRIORITY_ARTILLERY_BASE_OPTIONS[0]).toMatchObject({
      focusCenter: [127.2, 37.233],
      previewBadgeLabel: "포병 프리셋",
      deploymentHeadingDegrees: 8,
      deploymentArcDegrees: 90,
      formation: {
        unitCount: 4,
        lateralSpacingKm: 10,
      },
    });
    expect(PRIORITY_ARTILLERY_BASE_OPTIONS[1]?.previewTitle).toBe(
      "수도권 서부 화력 프리셋"
    );
    expect(PRIORITY_ARTILLERY_BASE_OPTIONS[1]?.sourceLabel).toBe(
      "위키피디아 Capital Artillery Brigade"
    );
  });

  test("keeps quick add airbase options focused on major bases", () => {
    const options = buildPriorityQuickAddAirbaseOptions(airbaseDb);
    const labels = options.map((item) => item.label);

    expect(labels).toContain("서울 공군기지");
    expect(labels).toContain("오산 공군기지");
    expect(labels).not.toContain("Gimhae Air Base");
    expect(options[0]?.focusCenter).toBeDefined();
  });

  test("keeps the full base selection list available after artillery presets", () => {
    const options = buildBaseSelectionAirbaseOptions(airbaseDb);

    expect(options.length).toBe(airbaseDb.length);
    expect(options[0]?.unitType).toBe("airbase");
  });

  test("sorts presets by distance from the current map center", () => {
    const ordered = sortBaseSelectionOptionsByDistance(
      PRIORITY_ARTILLERY_BASE_OPTIONS,
      [127.19, 37.89]
    );

    expect(ordered[0]?.label).toBe("제5포병여단");
    expect(ordered.at(-1)?.label).toBe("지상작전사령부 화력여단");
  });
});
