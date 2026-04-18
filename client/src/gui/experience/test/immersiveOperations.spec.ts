import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import {
  buildImmersiveModeBrief,
  buildImmersiveOperationsDeck,
  getDefaultImmersiveOperationMode,
  getImmersiveOperationOptions,
} from "@/gui/experience/immersiveOperations";

function createModel(
  id: string,
  label: string,
  note: string
): BundleModelSelection {
  return {
    id,
    bundle: "aircraft",
    path: `/mock/${id}.glb`,
    label,
    note,
  };
}

describe("immersiveOperations", () => {
  test("exposes maritime operation modes including carrier escort", () => {
    const options = getImmersiveOperationOptions("maritime");

    expect(options.map((option) => option.id)).toEqual([
      "surface-action",
      "carrier-screen",
      "silent-patrol",
    ]);
    expect(getDefaultImmersiveOperationMode("maritime")).toBe("surface-action");
  });

  test("builds a maritime operations deck with comparison metrics", () => {
    const asset: AssetExperienceSummary = {
      kind: "ship",
      id: "ship-1",
      name: "Sejong the Great",
      className: "Destroyer",
      sideName: "BLUE",
      latitude: 0,
      longitude: 0,
      altitude: 0,
      aircraftCount: 2,
    };
    const selectedModels = [
      createModel("destroyer", "Type 45 Destroyer", "구축함 계열"),
      createModel("carrier", "HMS Queen Elizabeth", "항모 계열"),
    ];

    const deck = buildImmersiveOperationsDeck(
      asset,
      "maritime",
      selectedModels[0],
      selectedModels,
      "carrier-screen"
    );

    expect(deck).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Mission Mode",
          value: "Carrier Screen",
        }),
        expect.objectContaining({
          label: "Compare Set",
          value: "2 Selected",
          hint: "Type 45 Destroyer / HMS Queen Elizabeth",
        }),
      ])
    );
  });

  test("describes base operations using the selected air lineup", () => {
    const selectedModels = [
      createModel("f15", "F-15 Strike Eagle", "전투기 계열"),
      createModel("apache", "AH-64 Apache", "공격 헬기 계열"),
      createModel("drone", "Animated Drone", "정찰 드론 계열"),
    ];

    const brief = buildImmersiveModeBrief(
      "base",
      "drone-watch",
      selectedModels
    );

    expect(brief).toContain("무인기 감시");
    expect(brief).toContain("F-15 Strike Eagle");
    expect(brief).toContain("비교 3종");
    expect(brief).toContain("출격 대기 라인");
  });
});
