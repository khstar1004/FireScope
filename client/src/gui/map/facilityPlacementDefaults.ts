import {
  getBearingBetweenTwoPoints,
  getTerminalCoordinatesFromDistanceAndBearing,
} from "@/utils/mapFunctions";
import type { AssetPlacementDeploymentDefaults } from "@/gui/map/toolbar/assetPlacementPreview";

export function resolveFacilityPlacementHeading(
  originLatitude: number,
  originLongitude: number,
  directionLatitude: number,
  directionLongitude: number,
  deploymentDefaults?: AssetPlacementDeploymentDefaults | null
) {
  if (
    originLatitude === directionLatitude &&
    originLongitude === directionLongitude
  ) {
    return deploymentDefaults?.headingDegrees ?? 0;
  }

  return getBearingBetweenTwoPoints(
    originLatitude,
    originLongitude,
    directionLatitude,
    directionLongitude
  );
}

export function resolveFacilityPlacementArcDegrees(
  templateArcDegrees?: number | null,
  deploymentDefaults?: AssetPlacementDeploymentDefaults | null
) {
  return deploymentDefaults?.arcDegrees ?? templateArcDegrees ?? 120;
}

function offsetPoint(
  latitude: number,
  longitude: number,
  distanceKm: number,
  bearingDegrees: number
) {
  const [nextLatitude, nextLongitude] =
    getTerminalCoordinatesFromDistanceAndBearing(
      latitude,
      longitude,
      distanceKm,
      bearingDegrees
    );

  return {
    latitude: nextLatitude,
    longitude: nextLongitude,
  };
}

export function buildFacilityFormationLayout(
  anchorLatitude: number,
  anchorLongitude: number,
  headingDegrees: number,
  deploymentDefaults?: AssetPlacementDeploymentDefaults | null
) {
  const formation = deploymentDefaults?.formation;
  if (!formation || formation.unitCount <= 1) {
    return [
      {
        latitude: anchorLatitude,
        longitude: anchorLongitude,
        heading: headingDegrees,
      },
    ];
  }

  const centerIndex = (formation.unitCount - 1) / 2;

  return Array.from({ length: formation.unitCount }, (_value, index) => {
    const lateralIndex = index - centerIndex;
    const lateralOffsetKm = lateralIndex * formation.lateralSpacingKm;
    const depthOffsetKm =
      formation.depthSpacingKm && Math.abs(lateralIndex) > 0
        ? formation.depthSpacingKm * Math.abs(lateralIndex)
        : 0;

    let point = {
      latitude: anchorLatitude,
      longitude: anchorLongitude,
    };

    if (depthOffsetKm > 0) {
      point = offsetPoint(
        point.latitude,
        point.longitude,
        depthOffsetKm,
        headingDegrees
      );
    }

    if (lateralOffsetKm !== 0) {
      point = offsetPoint(
        point.latitude,
        point.longitude,
        Math.abs(lateralOffsetKm),
        lateralOffsetKm > 0
          ? (headingDegrees + 90) % 360
          : (headingDegrees + 270) % 360
      );
    }

    return {
      latitude: point.latitude,
      longitude: point.longitude,
      heading: headingDegrees,
    };
  });
}
