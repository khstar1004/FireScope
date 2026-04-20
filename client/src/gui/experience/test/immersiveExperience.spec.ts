import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import {
  createImmersiveExperienceDemoAsset,
  buildImmersiveExperienceHash,
  getImmersiveExperienceQueryParams,
  inferImmersiveExperienceProfile,
  isImmersiveExperienceDemoAsset,
  parseImmersiveExperienceQueryParams,
} from "@/gui/experience/immersiveExperience";

describe("immersiveExperience", () => {
  test("round trips an immersive route through hash params", () => {
    const asset: AssetExperienceSummary = {
      kind: "weapon",
      id: "weapon-11",
      name: "Patriot Battery Alpha",
      className: "MIM-104 Patriot",
      sideName: "BLUE",
      latitude: 37.5123,
      longitude: 127.0211,
      altitude: 320,
      range: 95,
      weaponCount: 4,
    };

    const parsedRoute = parseImmersiveExperienceQueryParams(
      getImmersiveExperienceQueryParams(
        buildImmersiveExperienceHash(asset, "defense", {
          modelId: "artillery-patriot",
        })
      )
    );

    expect(parsedRoute).toEqual({
      asset,
      profile: "defense",
      modelId: "artillery-patriot",
    });
  });

  test("infers expected profiles from asset kinds and class names", () => {
    expect(
      inferImmersiveExperienceProfile({
        kind: "ship",
        id: "ship-1",
        name: "Sejong",
        className: "Destroyer",
        sideName: "BLUE",
        latitude: 0,
        longitude: 0,
        altitude: 0,
      })
    ).toBe("maritime");

    expect(
      inferImmersiveExperienceProfile({
        kind: "facility",
        id: "facility-1",
        name: "Radar Hill",
        className: "L-SAM Radar Facility",
        sideName: "BLUE",
        latitude: 0,
        longitude: 0,
        altitude: 0,
      })
    ).toBe("defense");

    expect(
      inferImmersiveExperienceProfile({
        kind: "facility",
        id: "facility-2",
        name: "Forward Tor Screen",
        className: "Tor-M2",
        sideName: "RED",
        latitude: 0,
        longitude: 0,
        altitude: 0,
      })
    ).toBe("defense");

    expect(
      inferImmersiveExperienceProfile({
        kind: "weapon",
        id: "weapon-2",
        name: "K9 Thunder",
        className: "K9 THUNDER ARTILLERY",
        sideName: "BLUE",
        latitude: 0,
        longitude: 0,
        altitude: 0,
      })
    ).toBe("fires");

    expect(
      inferImmersiveExperienceProfile({
        kind: "facility",
        id: "facility-tank-1",
        name: "K2 Black Panther Platoon",
        className: "K2 MBT",
        sideName: "BLUE",
        latitude: 0,
        longitude: 0,
        altitude: 0,
      })
    ).toBe("ground");

    expect(
      inferImmersiveExperienceProfile({
        kind: "airbase",
        id: "base-1",
        name: "Suwon",
        className: "Airbase",
        sideName: "BLUE",
        latitude: 0,
        longitude: 0,
        altitude: 0,
      })
    ).toBe("base");

    expect(
      inferImmersiveExperienceProfile({
        kind: "aircraft",
        id: "aircraft-1",
        name: "KF-21 Alpha",
        className: "KF-21 Boramae",
        sideName: "BLUE",
        latitude: 0,
        longitude: 0,
        altitude: 0,
      })
    ).toBe("base");
  });

  test("creates demo assets for toolbar-launched immersive experiences", () => {
    const demoAsset = createImmersiveExperienceDemoAsset("ground", [127, 37]);

    expect(demoAsset.id).toBe("demo-immersive-ground");
    expect(demoAsset.longitude).toBe(127);
    expect(demoAsset.latitude).toBe(37);
    expect(isImmersiveExperienceDemoAsset(demoAsset)).toBe(true);
  });
});
