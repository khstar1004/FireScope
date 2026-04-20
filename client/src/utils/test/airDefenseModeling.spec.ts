import {
  inferDefenseProxyVisualProfileId,
  resolveDefenseVisualizationPolicy,
} from "@/utils/airDefenseModeling";

describe("airDefenseModeling", () => {
  test("maps medium-area defense systems to curated closest proxies", () => {
    const cheongungPolicy = resolveDefenseVisualizationPolicy(
      "Cheongung-II (KM-SAM Block II)",
      "천궁-II 방호권"
    );
    const hq16Policy = resolveDefenseVisualizationPolicy("HQ-16", "Lavan HQ-16 Site");

    expect(cheongungPolicy).toMatchObject({
      mode: "closest",
      tier: "area",
      proxyVisualProfileId: "artillery-patriot",
      conceptVariant: "defense-area",
    });
    expect(hq16Policy).toMatchObject({
      mode: "closest",
      tier: "area",
      proxyVisualProfileId: "artillery-nasams-battery",
      conceptVariant: "defense-area",
    });
  });

  test("keeps short-range defense systems in concept mode instead of forcing a wrong proxy", () => {
    const torPolicy = resolveDefenseVisualizationPolicy("Tor-M2", "Harbor Tor Screen");
    const pantsirPolicy = resolveDefenseVisualizationPolicy(
      "Pantsir-S1",
      "Forward Pantsir"
    );

    expect(torPolicy).toMatchObject({
      mode: "concept",
      tier: "point",
      proxyVisualProfileId: null,
      conceptVariant: "defense-point-launcher",
      silhouetteLabel: "미사일 중심 점방어",
    });
    expect(pantsirPolicy).toMatchObject({
      mode: "concept",
      tier: "point",
      proxyVisualProfileId: null,
      conceptVariant: "defense-point-hybrid",
      silhouetteLabel: "포·미사일 복합 점방어",
    });
  });

  test("routes upper-tier systems to the strategic defense proxy", () => {
    const lSamPolicy = resolveDefenseVisualizationPolicy("L-SAM", "Capital L-SAM Belt");

    expect(lSamPolicy).toMatchObject({
      mode: "closest",
      tier: "strategic",
      proxyVisualProfileId: "artillery-thaad",
      conceptVariant: "defense-strategic",
    });
  });

  test("does not misclassify exact Patriot-family systems as fallback proxies", () => {
    expect(
      inferDefenseProxyVisualProfileId("mim-104 patriot patriot battery alpha")
    ).toBeNull();
    expect(resolveDefenseVisualizationPolicy("MIM-104 Patriot", "Patriot Alpha")).toBeNull();
  });
});
