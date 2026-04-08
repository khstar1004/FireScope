import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import {
  buildTacticalSimHash,
  getTacticalSimQueryParams,
  parseTacticalSimQueryParams,
} from "@/gui/experience/tacticalSimRoute";

describe("tacticalSimRoute", () => {
  test("round trips tactical sim route with operation and model selection", () => {
    const asset: AssetExperienceSummary = {
      kind: "facility",
      id: "weapon-31",
      name: "L-SAM Battery Demo",
      className: "L-SAM",
      sideName: "BLUE",
      latitude: 37.5123,
      longitude: 127.0211,
      altitude: 180,
      range: 120,
      weaponCount: 4,
      heading: 34,
    };

    const route = parseTacticalSimQueryParams(
      getTacticalSimQueryParams(
        buildTacticalSimHash(asset, "defense", {
          operationMode: "layered-shield",
          modelId: "artillery-thaad",
        })
      )
    );

    expect(route).toEqual({
      asset,
      profile: "defense",
      operationMode: "layered-shield",
      modelId: "artillery-thaad",
    });
  });

  test("falls back to the profile default operation mode when omitted", () => {
    const asset: AssetExperienceSummary = {
      kind: "ship",
      id: "ship-4",
      name: "Sejong Demo",
      className: "Destroyer",
      sideName: "BLUE",
      latitude: 37.1,
      longitude: 126.9,
      altitude: 0,
      speed: 28,
      range: 180,
    };

    const route = parseTacticalSimQueryParams(
      getTacticalSimQueryParams(buildTacticalSimHash(asset, "maritime"))
    );

    expect(route?.profile).toBe("maritime");
    expect(route?.operationMode).toBe("surface-action");
    expect(route?.modelId).toBeUndefined();
  });
});
