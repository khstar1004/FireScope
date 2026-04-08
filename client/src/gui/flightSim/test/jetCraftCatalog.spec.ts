import {
  DEFAULT_JET_CRAFT_ID,
  getJetCraftCatalogEntry,
  isJetCraftId,
  JET_CRAFT_CATALOG,
} from "@/gui/flightSim/jetCraftCatalog";

describe("jetCraftCatalog", () => {
  test("defaults to F-15 and keeps KF-21 as the second visible jet option", () => {
    expect(DEFAULT_JET_CRAFT_ID).toBe("f15");
    expect(JET_CRAFT_CATALOG[0]?.id).toBe("f15");
    expect(JET_CRAFT_CATALOG[0]?.label).toBe("F-15C Eagle");
    expect(JET_CRAFT_CATALOG[1]?.id).toBe("kf21");
    expect(JET_CRAFT_CATALOG[1]?.label).toBe("KF-21 보라매");
  });

  test("recognizes the supported jet craft ids", () => {
    expect(isJetCraftId("kf21")).toBe(true);
    expect(isJetCraftId("f15")).toBe(true);
    expect(isJetCraftId("f16")).toBe(true);
    expect(isJetCraftId("f35")).toBe(true);
    expect(isJetCraftId("jet")).toBe(false);
    expect(isJetCraftId("drone")).toBe(false);
  });

  test("falls back to the default craft when an unknown id is provided", () => {
    expect(getJetCraftCatalogEntry("unknown").id).toBe("f15");
    expect(getJetCraftCatalogEntry("f16").label).toBe(
      "F-16 Fighting Falcon"
    );
  });
});
