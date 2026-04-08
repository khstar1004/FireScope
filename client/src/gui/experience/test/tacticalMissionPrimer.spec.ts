import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import { buildExperienceMissionPlan } from "@/gui/experience/experienceRuntime";
import { buildTacticalMissionPrimer } from "@/gui/experience/tacticalMissionPrimer";
import { createTacticalExperienceScenario } from "@/gui/experience/tacticalExperience";

describe("tacticalMissionPrimer", () => {
  test("builds a defense primer with battlespace and 3D map guidance", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "facility-defense-primer",
      name: "L-SAM Battery",
      className: "L-SAM",
      sideName: "BLUE",
      latitude: 37.4,
      longitude: 126.9,
      altitude: 210,
      range: 120,
      weaponCount: 4,
    };

    const mission = buildExperienceMissionPlan(
      "defense",
      "layered-shield",
      asset,
      null
    );
    const scenario = createTacticalExperienceScenario(asset, "defense");
    const primer = buildTacticalMissionPrimer(mission, scenario);

    expect(primer.designIntent).toContain("방공 통제관");
    expect(primer.battlespaceSummary).toContain("센서 반경");
    expect(primer.threatSummary).toContain("공중 3개");
    expect(primer.quickStartSteps[0]).toContain("임무 시작");
    expect(primer.decisionChecklist).toHaveLength(3);
    expect(primer.phaseChecklist[0]).toContain("센서 탐색");
    expect(primer.successCriteria[0]).toContain("레이더 기반");
    expect(primer.mapHints[0]).toContain("마우스 휠");
  });
});
