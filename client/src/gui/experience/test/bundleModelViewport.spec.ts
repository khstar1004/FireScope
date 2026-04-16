import {
  buildViewerSrc,
  type BundleModelViewportSimulation,
} from "@/gui/experience/BundleModelViewport";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";

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
});
