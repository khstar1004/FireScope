import { FacilityPlacementGroup } from "@/game/facilityPlacementGroups";
import { SIDE_COLOR } from "@/utils/colors";

export type FacilityPlacementGroupOverlayFacility = {
  id: string;
  latitude: number;
  longitude: number;
  sideColor: SIDE_COLOR;
};

export type FacilityPlacementGroupOverlay = {
  id: string;
  label: string;
  memberCount: number;
  centerLatitude: number;
  centerLongitude: number;
  ringCoordinates: [number, number][];
  sideColor: SIDE_COLOR;
  emphasized: boolean;
};

const METERS_PER_LATITUDE_DEGREE = 111_320;
const MIN_PADDING_METERS = 2_500;
const MAX_PADDING_METERS = 16_000;
const PADDING_RATIO = 0.22;
const MIN_LATITUDE_PADDING_DEGREES = 0.01;
const MIN_LONGITUDE_PADDING_DEGREES = 0.012;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function longitudeDegreesToMeters(deltaDegrees: number, latitude: number) {
  return (
    deltaDegrees *
    METERS_PER_LATITUDE_DEGREE *
    Math.max(Math.cos((latitude * Math.PI) / 180), 0.1)
  );
}

function metersToLongitudeDegrees(meters: number, latitude: number) {
  return (
    meters /
    (METERS_PER_LATITUDE_DEGREE *
      Math.max(Math.cos((latitude * Math.PI) / 180), 0.1))
  );
}

function buildFacilityPlacementGroupOverlay(
  group: FacilityPlacementGroup,
  facilityById: Map<string, FacilityPlacementGroupOverlayFacility>,
  emphasizedGroupIds: Set<string>
): FacilityPlacementGroupOverlay | null {
  const members = group.facilityIds
    .map((facilityId) => facilityById.get(facilityId))
    .filter(
      (facility): facility is FacilityPlacementGroupOverlayFacility =>
        facility !== undefined
    );

  if (members.length < 2) {
    return null;
  }

  const latitudes = members.map((facility) => facility.latitude);
  const longitudes = members.map((facility) => facility.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const centerLatitude = (minLatitude + maxLatitude) / 2;
  const centerLongitude = (minLongitude + maxLongitude) / 2;
  const latitudeSpanMeters =
    (maxLatitude - minLatitude) * METERS_PER_LATITUDE_DEGREE;
  const longitudeSpanMeters = longitudeDegreesToMeters(
    maxLongitude - minLongitude,
    centerLatitude
  );
  const paddingMeters = clamp(
    Math.max(latitudeSpanMeters, longitudeSpanMeters) * PADDING_RATIO,
    MIN_PADDING_METERS,
    MAX_PADDING_METERS
  );
  const latitudePadding = Math.max(
    paddingMeters / METERS_PER_LATITUDE_DEGREE,
    MIN_LATITUDE_PADDING_DEGREES
  );
  const longitudePadding = Math.max(
    metersToLongitudeDegrees(paddingMeters, centerLatitude),
    MIN_LONGITUDE_PADDING_DEGREES
  );
  const paddedMinLatitude = minLatitude - latitudePadding;
  const paddedMaxLatitude = maxLatitude + latitudePadding;
  const paddedMinLongitude = minLongitude - longitudePadding;
  const paddedMaxLongitude = maxLongitude + longitudePadding;

  return {
    id: group.id,
    label: group.label,
    memberCount: members.length,
    centerLatitude,
    centerLongitude,
    ringCoordinates: [
      [paddedMinLongitude, paddedMinLatitude],
      [paddedMaxLongitude, paddedMinLatitude],
      [paddedMaxLongitude, paddedMaxLatitude],
      [paddedMinLongitude, paddedMaxLatitude],
      [paddedMinLongitude, paddedMinLatitude],
    ],
    sideColor: members[0]?.sideColor ?? SIDE_COLOR.BLACK,
    emphasized: emphasizedGroupIds.has(group.id),
  };
}

export function buildFacilityPlacementGroupOverlays(
  groups: FacilityPlacementGroup[],
  facilities: FacilityPlacementGroupOverlayFacility[],
  emphasizedGroupIds: Iterable<string> = []
): FacilityPlacementGroupOverlay[] {
  const emphasizedIdSet = new Set(emphasizedGroupIds);
  const facilityById = new Map(
    facilities.map((facility) => [facility.id, facility])
  );
  return groups
    .map((group) =>
      buildFacilityPlacementGroupOverlay(group, facilityById, emphasizedIdSet)
    )
    .filter(
      (overlay): overlay is FacilityPlacementGroupOverlay => overlay !== null
    )
    .sort((left, right) => Number(left.emphasized) - Number(right.emphasized));
}
