import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";

export interface BundleViewerSceneProp {
  id: string;
  path: string;
  position: [number, number, number];
  rotationY?: number;
  targetSize?: number;
  opacity?: number;
}

function createSceneProp(
  id: string,
  path: string,
  position: [number, number, number],
  targetSize: number,
  rotationY = 0,
  opacity = 1
): BundleViewerSceneProp {
  return {
    id,
    path,
    position,
    targetSize,
    rotationY,
    opacity,
  };
}

const INFRASTRUCTURE_PROPS = {
  hangar: createSceneProp(
    "infra-hangar",
    "/3d-bundles/infrastructure/models/aircraft_hangar.glb",
    [-5.2, 0, -4.8],
    3.8,
    Math.PI * 0.08,
    0.94
  ),
  tower: createSceneProp(
    "infra-tower",
    "/3d-bundles/infrastructure/models/air_traffic_control_tower.glb",
    [5.6, 0, -4.6],
    3.2,
    -Math.PI * 0.06,
    0.96
  ),
  tug: createSceneProp(
    "infra-tug",
    "/3d-bundles/infrastructure/models/airport_tug.glb",
    [4.2, 0, 3.1],
    1.45,
    -Math.PI * 0.32,
    0.98
  ),
  fuelTruck: createSceneProp(
    "infra-fuel-truck",
    "/3d-bundles/infrastructure/models/ural_atz_5_4320_fuel_truck.glb",
    [-3.4, 0, 3.3],
    1.8,
    Math.PI * 0.18,
    0.98
  ),
  tentHangar: createSceneProp(
    "infra-tent-hangar",
    "/3d-bundles/infrastructure/models/military_tent_hangar.glb",
    [0.1, 0, -6.1],
    3.4,
    0,
    0.9
  ),
  container: createSceneProp(
    "infra-container",
    "/3d-bundles/infrastructure/models/low_poly_cargo_container.glb",
    [6.1, 0, 4.3],
    1.4,
    Math.PI * 0.1,
    0.92
  ),
};

const JET_DETAIL_SCENE = [
  INFRASTRUCTURE_PROPS.hangar,
  INFRASTRUCTURE_PROPS.tower,
  INFRASTRUCTURE_PROPS.tug,
  INFRASTRUCTURE_PROPS.fuelTruck,
  INFRASTRUCTURE_PROPS.container,
];

const JET_IMMERSIVE_SCENE = [
  ...JET_DETAIL_SCENE,
  INFRASTRUCTURE_PROPS.tentHangar,
];

const ROTARY_DETAIL_SCENE = [
  INFRASTRUCTURE_PROPS.hangar,
  INFRASTRUCTURE_PROPS.tower,
  INFRASTRUCTURE_PROPS.fuelTruck,
  INFRASTRUCTURE_PROPS.container,
];

const ROTARY_IMMERSIVE_SCENE = [
  ...ROTARY_DETAIL_SCENE,
  INFRASTRUCTURE_PROPS.tentHangar,
];

const DRONE_DETAIL_SCENE = [
  INFRASTRUCTURE_PROPS.tower,
  INFRASTRUCTURE_PROPS.tentHangar,
  INFRASTRUCTURE_PROPS.container,
];

const DRONE_IMMERSIVE_SCENE = [
  INFRASTRUCTURE_PROPS.hangar,
  ...DRONE_DETAIL_SCENE,
  INFRASTRUCTURE_PROPS.fuelTruck,
];

function buildSignature(asset: AssetExperienceSummary) {
  return `${asset.className} ${asset.name}`.toLowerCase();
}

function isAircraftContext(
  asset: AssetExperienceSummary,
  selection: BundleModelSelection
) {
  return (
    asset.kind === "aircraft" ||
    asset.kind === "airbase" ||
    selection.bundle === "aircraft" ||
    selection.bundle === "drone"
  );
}

function isRotaryWingSelection(
  signature: string,
  selection: BundleModelSelection
) {
  return (
    selection.id === "aircraft-apache" ||
    selection.id === "aircraft-blackhawk" ||
    /\b(ah-64|apache|uh-60|black hawk|blackhawk|helicopter|helo|ch-47|chinook)\b/i.test(
      signature
    )
  );
}

function isDroneSelection(signature: string, selection: BundleModelSelection) {
  return (
    selection.bundle === "drone" ||
    /\b(drone|uav|mq-|rq-|reaper|global hawk|predator)\b/i.test(signature)
  );
}

export function buildBundleViewerSceneProps(
  asset: AssetExperienceSummary,
  selection: BundleModelSelection,
  mode: "detail" | "immersive" = "detail"
) {
  if (mode !== "immersive") {
    return [] as BundleViewerSceneProp[];
  }

  if (!isAircraftContext(asset, selection)) {
    return [] as BundleViewerSceneProp[];
  }

  const signature = buildSignature(asset);
  const largeScene = mode === "immersive" || asset.kind === "airbase";

  if (isDroneSelection(signature, selection)) {
    return largeScene ? DRONE_IMMERSIVE_SCENE : DRONE_DETAIL_SCENE;
  }

  if (isRotaryWingSelection(signature, selection)) {
    return largeScene ? ROTARY_IMMERSIVE_SCENE : ROTARY_DETAIL_SCENE;
  }

  return largeScene ? JET_IMMERSIVE_SCENE : JET_DETAIL_SCENE;
}
