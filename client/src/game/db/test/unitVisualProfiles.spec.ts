import {
  inferBattle3dProfileHint,
  resolveUnitVisualProfileId,
} from "@/game/db/unitVisualProfiles";

describe("unitVisualProfiles", () => {
  test("maps strategic SAM facilities to curated proxy visual profiles", () => {
    expect(
      resolveUnitVisualProfileId({
        entityType: "facility",
        className: "S-400 Triumf",
        name: "Capital S-400 Belt",
      })
    ).toBe("artillery-patriot");

    expect(
      resolveUnitVisualProfileId({
        entityType: "facility",
        className: "HQ-19",
        name: "HQ-19 Battery",
      })
    ).toBe("artillery-thaad");
  });

  test("leaves concept-only short-range SAM facilities without a misleading proxy model", () => {
    expect(
      resolveUnitVisualProfileId({
        entityType: "facility",
        className: "Tor-M2",
        name: "Harbor Tor Screen",
      })
    ).toBeUndefined();
  });

  test("treats air-defense interceptor weapons as missiles rather than shells", () => {
    expect(
      resolveUnitVisualProfileId({
        entityType: "weapon",
        className: "L-SAM Interceptor",
        name: "L-SAM Interceptor",
      })
    ).toBe("weapon-surface-missile");
  });

  test("preserves defense profile hints even when no exact 3D facility model exists", () => {
    expect(
      inferBattle3dProfileHint("facility", "Tor-M2", "Harbor Tor Screen")
    ).toBe("defense");
  });
});
