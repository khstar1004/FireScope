import type { BundleModelSelection } from "@/gui/experience/bundleModels";

const bundleViewerShellAssets = [
  "/3d-bundles/viewer/index.html",
  "/3d-bundles/viewer/style.css",
  "/3d-bundles/viewer/viewer.js",
  "/3d-bundles/viewer/battleRuntime.js",
  "/3d-bundles/viewer/lib/three.module.js",
  "/3d-bundles/viewer/lib/three.core.js",
  "/3d-bundles/viewer/controls/OrbitControls.js",
  "/3d-bundles/viewer/loaders/GLTFLoader.js",
  "/3d-bundles/viewer/utils/BufferGeometryUtils.js",
];

const tacticalSimShellAssets = [
  "/tactical-sim/index.html",
  "/tactical-sim/style.css",
  "/tactical-sim/app.js",
  "/flight-sim/config.js",
  "/flight-sim/cesium/Cesium.js",
  "/flight-sim/cesium/Widgets/widgets.css",
];

const inflightPreloads = new Map<string, Promise<Response | null>>();

function uniqueUrls(urls: Array<string | null | undefined>) {
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}

export function buildBundleViewerPreloadUrls(modelPath?: string | null) {
  return uniqueUrls([...bundleViewerShellAssets, modelPath]);
}

export function buildTacticalSimPreloadUrls(modelPath?: string | null) {
  return uniqueUrls([...tacticalSimShellAssets, modelPath]);
}

export async function preloadStaticAsset(url: string) {
  if (!url || typeof window === "undefined" || typeof fetch !== "function") {
    return null;
  }

  const existing = inflightPreloads.get(url);
  if (existing) {
    return existing;
  }

  const request = fetch(url, { cache: "force-cache" }).catch(() => null);
  inflightPreloads.set(url, request);
  return request;
}

export async function preloadAssetGroup(urls: Array<string | null | undefined>) {
  await Promise.allSettled(
    uniqueUrls(urls).map((url) => preloadStaticAsset(url))
  );
}

export function preloadBundleViewer(
  selection?: Pick<BundleModelSelection, "path"> | null
) {
  return preloadAssetGroup(buildBundleViewerPreloadUrls(selection?.path));
}

export function preloadTacticalSim(
  selection?: Pick<BundleModelSelection, "path"> | null
) {
  return preloadAssetGroup(buildTacticalSimPreloadUrls(selection?.path));
}
