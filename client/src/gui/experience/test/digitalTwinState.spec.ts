import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import {
  buildDigitalTwinLineup,
  buildDigitalTwinSummary,
} from "@/gui/experience/digitalTwinState";

const baseAsset: AssetExperienceSummary = {
  kind: "airbase",
  id: "base-1",
  name: "Seoul Air Base",
  className: "Airfield",
  sideName: "BLUE",
  latitude: 37.5,
  longitude: 127,
  altitude: 230,
  aircraftCount: 8,
};

const activeModel: BundleModelSelection = {
  id: "aircraft-f15-strike",
  bundle: "aircraft",
  path: "/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb",
  label: "F-15 Strike Eagle",
  note: "중형 공격전투기 계열",
};

const supportModel: BundleModelSelection = {
  id: "drone-animated",
  bundle: "drone",
  path: "/3d-bundles/drone/models/animated_drone.glb",
  label: "Animated Drone",
  note: "정찰/감시 드론 계열",
};

describe("digitalTwinState", () => {
  test("builds a primary-first lineup with derived readiness metrics", () => {
    const lineup = buildDigitalTwinLineup(
      baseAsset,
      "base",
      activeModel,
      [activeModel, supportModel],
      "scramble"
    );

    expect(lineup).toHaveLength(2);
    expect(lineup[0]).toMatchObject({
      id: "aircraft-f15-strike",
      primary: true,
      section: "ALERT",
    });
    expect(lineup[1]).toMatchObject({
      id: "drone-animated",
      primary: false,
      section: "SCRAMBLE",
    });
    expect(lineup[0].readinessPct).toBeGreaterThan(lineup[1].readinessPct);
  });

  test("summarizes lineup health for the twin board", () => {
    const lineup = buildDigitalTwinLineup(
      baseAsset,
      "base",
      activeModel,
      [activeModel, supportModel],
      "scramble"
    );
    const summary = buildDigitalTwinSummary(baseAsset, "base", lineup);

    expect(summary.headline).toBe("Seoul Air Base 운용 셀");
    expect(summary.readinessPct).toBeGreaterThan(0);
    expect(summary.logisticsPct).toBeGreaterThan(0);
    expect(summary.coveragePct).toBeGreaterThan(0);
    expect(summary.warning.length).toBeGreaterThan(0);
  });
});
