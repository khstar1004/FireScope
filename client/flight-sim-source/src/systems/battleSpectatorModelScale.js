// `sourceLongestAxisMeters` values were measured from the shipped GLB scene bounds.
// Each scale profile maps the model's longest rendered axis to an approximate
// real-world overall length in meters.
const MEASURED_UNIT_SCALE_SPECS = {
  "artillery-d30": {
    sourceLongestAxisMeters: 27.466859817504883,
    targetLongestAxisMeters: 5.4,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "artillery-howitzer": {
    sourceLongestAxisMeters: 8.00000037997961,
    targetLongestAxisMeters: 8,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "artillery-hyunmoo": {
    sourceLongestAxisMeters: 1,
    targetLongestAxisMeters: 16,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  "artillery-k9": {
    sourceLongestAxisMeters: 256509.45312500003,
    targetLongestAxisMeters: 12,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  "artillery-k9-variant": {
    sourceLongestAxisMeters: 256509.45312500003,
    targetLongestAxisMeters: 12,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  "artillery-nasams": {
    sourceLongestAxisMeters: 17.79428291320801,
    targetLongestAxisMeters: 7,
    minimumPixelSize: 3,
    maximumScale: 8,
  },
  "artillery-nasams-battery": {
    sourceLongestAxisMeters: 0.99273681640625,
    targetLongestAxisMeters: 8.5,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  "artillery-paladin": {
    sourceLongestAxisMeters: 9.378000445431098,
    targetLongestAxisMeters: 9.1,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "artillery-patriot": {
    sourceLongestAxisMeters: 22.567099571228027,
    targetLongestAxisMeters: 10.5,
    minimumPixelSize: 3,
    maximumScale: 8,
  },
  "artillery-roketsan": {
    sourceLongestAxisMeters: 7.48924720287323,
    targetLongestAxisMeters: 7.5,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "artillery-thaad": {
    sourceLongestAxisMeters: 1,
    targetLongestAxisMeters: 12.3,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  "tank-k2": {
    sourceLongestAxisMeters: 1.4704020619392395,
    targetLongestAxisMeters: 10.8,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "tank-k21": {
    sourceLongestAxisMeters: 7.628900051116943,
    targetLongestAxisMeters: 6.9,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "tank-km900": {
    sourceLongestAxisMeters: 913.0614013671875,
    targetLongestAxisMeters: 6.95,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  "tank-m113": {
    sourceLongestAxisMeters: 4.740999831087889,
    targetLongestAxisMeters: 4.86,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "tank-m577": {
    sourceLongestAxisMeters: 5.1360997005678755,
    targetLongestAxisMeters: 4.86,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "tank-stryker": {
    sourceLongestAxisMeters: 7.598799774077536,
    targetLongestAxisMeters: 6.95,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "tank-tracked-armor": {
    sourceLongestAxisMeters: 5.188339948654175,
    targetLongestAxisMeters: 9.75,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/artillery/models/d-30_howitzer.glb": {
    sourceLongestAxisMeters: 27.466859817504883,
    targetLongestAxisMeters: 5.4,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/artillery/models/howitzer_artillery_tank.glb": {
    sourceLongestAxisMeters: 8.00000037997961,
    targetLongestAxisMeters: 8,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb": {
    sourceLongestAxisMeters: 1,
    targetLongestAxisMeters: 16,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  "/3d-bundles/artillery/models/k9_thunder_artillery.glb": {
    sourceLongestAxisMeters: 256509.45312500003,
    targetLongestAxisMeters: 12,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  "/3d-bundles/artillery/models/k9_thunder_artillery (1).glb": {
    sourceLongestAxisMeters: 256509.45312500003,
    targetLongestAxisMeters: 12,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  "/3d-bundles/artillery/models/m109a6_paladin_self-propelled_howitzer.glb": {
    sourceLongestAxisMeters: 9.378000445431098,
    targetLongestAxisMeters: 9.1,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb":
    {
      sourceLongestAxisMeters: 22.567099571228027,
      targetLongestAxisMeters: 10.5,
      minimumPixelSize: 3,
      maximumScale: 8,
    },
  "/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb": {
    sourceLongestAxisMeters: 17.79428291320801,
    targetLongestAxisMeters: 7,
    minimumPixelSize: 3,
    maximumScale: 8,
  },
  "/3d-bundles/artillery/models/nasams_battery.glb": {
    sourceLongestAxisMeters: 0.99273681640625,
    targetLongestAxisMeters: 8.5,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  "/3d-bundles/artillery/models/roketsan_missiles.glb": {
    sourceLongestAxisMeters: 7.48924720287323,
    targetLongestAxisMeters: 7.5,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/artillery/models/thaad-2.glb": {
    sourceLongestAxisMeters: 1,
    targetLongestAxisMeters: 12.3,
    minimumPixelSize: 3,
    maximumScale: 10,
  },
  "/3d-bundles/tank/models/k2_black_panther_tank.glb": {
    sourceLongestAxisMeters: 1.4704020619392395,
    targetLongestAxisMeters: 10.8,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/tank/models/k21_armored_warfare.glb": {
    sourceLongestAxisMeters: 7.628900051116943,
    targetLongestAxisMeters: 6.9,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/tank/models/m1126_stryker_50_cal.glb": {
    sourceLongestAxisMeters: 7.598799774077536,
    targetLongestAxisMeters: 6.95,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/tank/models/m113a1.glb": {
    sourceLongestAxisMeters: 4.740999831087889,
    targetLongestAxisMeters: 4.86,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/tank/models/m577_command_vehicle.glb": {
    sourceLongestAxisMeters: 5.1360997005678755,
    targetLongestAxisMeters: 4.86,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
  "/3d-bundles/tank/models/south_korean_km900_apc.glb": {
    sourceLongestAxisMeters: 913.0614013671875,
    targetLongestAxisMeters: 6.95,
    minimumPixelSize: 2,
    maximumScale: 4,
  },
  "/3d-bundles/tank/models/t-50_war_thunder.glb": {
    sourceLongestAxisMeters: 5.188339948654175,
    targetLongestAxisMeters: 9.75,
    minimumPixelSize: 2,
    maximumScale: 6,
  },
};

function buildScaleProfile(spec) {
  return {
    scale: spec.targetLongestAxisMeters / spec.sourceLongestAxisMeters,
    minimumPixelSize: spec.minimumPixelSize,
    maximumScale: spec.maximumScale,
  };
}

export function resolveUnitModelScaleProfile(modelId, uri) {
  const spec =
    (typeof modelId === "string" && MEASURED_UNIT_SCALE_SPECS[modelId]) ||
    (typeof uri === "string" && MEASURED_UNIT_SCALE_SPECS[uri]) ||
    null;

  return spec ? buildScaleProfile(spec) : null;
}
