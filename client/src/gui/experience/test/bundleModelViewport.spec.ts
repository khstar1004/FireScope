import {
  buildViewerSrc,
  type BundleViewerComparisonSelection,
  type BundleViewerLineupEntry,
  type BundleModelViewportSimulation,
} from "@/gui/experience/BundleModelViewport";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import type { BundleViewerSceneProp } from "@/gui/experience/bundleSceneProps";

const selection: BundleModelSelection = {
  id: "artillery-k9",
  bundle: "artillery",
  path: "/3d-bundles/artillery/models/k9_thunder_artillery.glb",
  label: "K9 Thunder",
  note: "한국 자주포 계열",
};

describe("BundleModelViewport", () => {
  test("omits simulation params for non-immersive viewers", () => {
    const simulation: BundleModelViewportSimulation = {
      profile: "fires",
      operationMode: "deep-strike",
      assetKind: "facility",
      className: "K9 THUNDER ARTILLERY",
      modelId: selection.id,
      range: 45,
      weaponCount: 2,
      compareCount: 3,
    };

    const src = buildViewerSrc(
      selection,
      "Chunmoo Battery Demo",
      "#ffb15a",
      "#ffd768",
      "detail",
      simulation
    );
    const url = new URL(src, "https://firescope.local");

    expect(url.searchParams.get("mode")).toBe("detail");
    expect(url.searchParams.get("modelId")).toBe(selection.id);
    expect(url.searchParams.get("profile")).toBeNull();
    expect(url.searchParams.get("operation")).toBeNull();
    expect(url.searchParams.get("weaponCount")).toBeNull();
  });

  test("includes immersive simulation params for live battle playback", () => {
    const simulation: BundleModelViewportSimulation = {
      profile: "defense",
      operationMode: "layered-shield",
      assetKind: "facility",
      className: "L-SAM",
      modelId: "artillery-thaad",
      range: 120,
      heading: 45,
      speed: 12,
      weaponCount: 4,
      aircraftCount: 1,
      compareCount: 5,
    };

    const src = buildViewerSrc(
      selection,
      "L-SAM Battery Demo",
      "#72f0d0",
      "#8dd9ff",
      "immersive",
      simulation
    );
    const url = new URL(src, "https://firescope.local");

    expect(url.pathname).toBe("/3d-bundles/viewer/index.html");
    expect(url.searchParams.get("profile")).toBe("defense");
    expect(url.searchParams.get("operation")).toBe("layered-shield");
    expect(url.searchParams.get("assetKind")).toBe("facility");
    expect(url.searchParams.get("className")).toBe("L-SAM");
    expect(url.searchParams.get("modelId")).toBe("artillery-thaad");
    expect(url.searchParams.get("range")).toBe("120");
    expect(url.searchParams.get("weaponCount")).toBe("4");
    expect(url.searchParams.get("compareCount")).toBe("5");
  });

  test("can request a minimal chrome viewer shell", () => {
    const src = buildViewerSrc(
      selection,
      "K9 Showroom",
      "#72f0d0",
      "#8dd9ff",
      "immersive",
      null,
      "minimal"
    );
    const url = new URL(src, "https://firescope.local");

    expect(url.searchParams.get("chrome")).toBe("minimal");
    expect(url.searchParams.get("profile")).toBeNull();
  });

  test("serializes scene props for enhanced base showrooms", () => {
    const sceneProps: BundleViewerSceneProp[] = [
      {
        id: "infra-hangar",
        path: "/3d-bundles/infrastructure/models/aircraft_hangar.glb",
        position: [-4, 0, -4],
        targetSize: 3.5,
      },
    ];
    const src = buildViewerSrc(
      selection,
      "Osan Air Base",
      "#72f0d0",
      "#8dd9ff",
      "immersive",
      null,
      "minimal",
      sceneProps
    );
    const url = new URL(src, "https://firescope.local");

    expect(JSON.parse(url.searchParams.get("sceneProps") ?? "[]")).toEqual(
      sceneProps
    );
  });

  test("serializes comparison models for immersive lineup rendering", () => {
    const comparisonSelections: BundleViewerComparisonSelection[] = [
      {
        id: "tank-k2",
        bundle: "tank",
        path: "/3d-bundles/tank/models/k2_black_panther_tank.glb",
        label: "K2 Black Panther",
      },
      {
        id: "tank-k21",
        bundle: "tank",
        path: "/3d-bundles/tank/models/k21_armored_warfare.glb",
        label: "K21 IFV",
      },
    ];
    const src = buildViewerSrc(
      selection,
      "Mechanized Brigade",
      "#72f0d0",
      "#8dd9ff",
      "immersive",
      null,
      "minimal",
      [],
      comparisonSelections
    );
    const url = new URL(src, "https://firescope.local");

    expect(JSON.parse(url.searchParams.get("compareModels") ?? "[]")).toEqual(
      comparisonSelections
    );
  });

  test("serializes digital twin lineup entries for viewer overlays", () => {
    const lineup: BundleViewerLineupEntry[] = [
      {
        id: "aircraft-f15-strike",
        label: "F-15 Strike Eagle",
        section: "ALERT",
        role: "출격 편대",
        task: "Scramble 주기 편성",
        status: "즉응 출격",
        readinessPct: 92,
        fuelPct: 88,
        ordnancePct: 94,
        coveragePct: 90,
        primary: true,
      },
    ];
    const src = buildViewerSrc(
      selection,
      "Seoul Air Base",
      "#72f0d0",
      "#8dd9ff",
      "immersive",
      null,
      "minimal",
      [],
      [],
      lineup
    );
    const url = new URL(src, "https://firescope.local");

    expect(JSON.parse(url.searchParams.get("lineup") ?? "[]")).toEqual(lineup);
  });
});
