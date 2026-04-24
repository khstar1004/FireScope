import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import type { BundleViewerSceneProp } from "@/gui/experience/bundleSceneProps";
import type { BundleViewerComparisonSelection } from "@/gui/experience/BundleModelViewport";
import { resolvePublicAssetPath } from "@/utils/publicAssetUrl";

const bundleViewerShellAssets = [
  resolvePublicAssetPath("/3d-bundles/viewer/index.html"),
  resolvePublicAssetPath("/3d-bundles/viewer/style.css"),
  resolvePublicAssetPath("/3d-bundles/viewer/viewer.js"),
  resolvePublicAssetPath("/3d-bundles/viewer/battleRuntime.js"),
  resolvePublicAssetPath("/3d-bundles/viewer/lib/three.module.js"),
  resolvePublicAssetPath("/3d-bundles/viewer/lib/three.core.js"),
  resolvePublicAssetPath("/3d-bundles/viewer/controls/OrbitControls.js"),
  resolvePublicAssetPath("/3d-bundles/viewer/loaders/GLTFLoader.js"),
  resolvePublicAssetPath("/3d-bundles/viewer/utils/BufferGeometryUtils.js"),
];

const tacticalSimShellAssets = [
  resolvePublicAssetPath("/tactical-sim/index.html"),
  resolvePublicAssetPath("/tactical-sim/style.css"),
  resolvePublicAssetPath("/tactical-sim/app.js"),
  resolvePublicAssetPath("/flight-sim/config.js"),
  resolvePublicAssetPath("/flight-sim/cesium/Cesium.js"),
  resolvePublicAssetPath("/flight-sim/cesium/Widgets/widgets.css"),
];

const inflightPreloads = new Map<string, Promise<Response | null>>();

function uniqueUrls(urls: Array<string | null | undefined>) {
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}

export function buildBundleViewerPreloadUrls(
  modelPath?: string | null,
  sceneProps: BundleViewerSceneProp[] = [],
  comparisonSelections: BundleViewerComparisonSelection[] = []
) {
  return uniqueUrls([
    ...bundleViewerShellAssets,
    modelPath ? resolvePublicAssetPath(modelPath) : modelPath,
    ...sceneProps.map((prop) => resolvePublicAssetPath(prop.path)),
    ...comparisonSelections.map((selection) =>
      resolvePublicAssetPath(selection.path)
    ),
  ]);
}

export function buildTacticalSimPreloadUrls(modelPath?: string | null) {
  return uniqueUrls([
    ...tacticalSimShellAssets,
    modelPath ? resolvePublicAssetPath(modelPath) : modelPath,
  ]);
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

export async function preloadAssetGroup(
  urls: Array<string | null | undefined>
) {
  await Promise.allSettled(
    uniqueUrls(urls).map((url) => preloadStaticAsset(url))
  );
}

export function preloadBundleViewer(
  selection?: Pick<BundleModelSelection, "path"> | null,
  sceneProps: BundleViewerSceneProp[] = [],
  comparisonSelections: BundleViewerComparisonSelection[] = []
) {
  return preloadAssetGroup(
    buildBundleViewerPreloadUrls(
      selection?.path,
      sceneProps,
      comparisonSelections
    )
  );
}

export function preloadTacticalSim(
  selection?: Pick<BundleModelSelection, "path"> | null
) {
  return preloadAssetGroup(buildTacticalSimPreloadUrls(selection?.path));
}
