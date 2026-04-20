import { randomUUID } from "@/utils/generateUUID";

export type FacilityPlacementGroup = {
  id: string;
  label: string;
  facilityIds: string[];
  createdAt: number;
};

export type ScenarioUiMetadata = {
  facilityPlacementGroups?: FacilityPlacementGroup[];
  [key: string]: unknown;
};

export type ScenarioMetadata = {
  ui?: ScenarioUiMetadata;
  [key: string]: unknown;
};

type FacilityPlacementCoordinate = {
  id: string;
  latitude: number;
  longitude: number;
};

type FacilityPlacementTeleportPosition = {
  id: string;
  latitude: number;
  longitude: number;
};

function sanitizeFacilityPlacementGroup(
  group: FacilityPlacementGroup
): FacilityPlacementGroup {
  const facilityIds = Array.from(
    new Set(
      (group.facilityIds ?? []).filter(
        (facilityId): facilityId is string =>
          typeof facilityId === "string" && facilityId.trim().length > 0
      )
    )
  );

  return {
    id:
      typeof group.id === "string" && group.id.trim().length > 0
        ? group.id
        : randomUUID(),
    label:
      typeof group.label === "string" && group.label.trim().length > 0
        ? group.label
        : "포대 묶음",
    facilityIds,
    createdAt:
      typeof group.createdAt === "number" && Number.isFinite(group.createdAt)
        ? group.createdAt
        : Date.now(),
  };
}

function cloneFacilityPlacementGroup(
  group: FacilityPlacementGroup
): FacilityPlacementGroup {
  return {
    ...sanitizeFacilityPlacementGroup(group),
    facilityIds: [...sanitizeFacilityPlacementGroup(group).facilityIds],
  };
}

export function cloneScenarioMetadata(
  metadata?: ScenarioMetadata | null
): ScenarioMetadata {
  const clonedMetadata: ScenarioMetadata = metadata ? { ...metadata } : {};
  if (metadata?.ui) {
    clonedMetadata.ui = { ...metadata.ui };
    if (metadata.ui.facilityPlacementGroups) {
      clonedMetadata.ui.facilityPlacementGroups =
        metadata.ui.facilityPlacementGroups.map(cloneFacilityPlacementGroup);
    }
  }
  return clonedMetadata;
}

export function createFacilityPlacementGroup(
  facilityIds: string[],
  label: string,
  createdAt: number = Date.now()
): FacilityPlacementGroup {
  return sanitizeFacilityPlacementGroup({
    id: randomUUID(),
    label,
    facilityIds,
    createdAt,
  });
}

export function findFacilityPlacementGroupByFacilityId(
  groups: FacilityPlacementGroup[],
  facilityId: string
): FacilityPlacementGroup | null {
  return groups.find((group) => group.facilityIds.includes(facilityId)) ?? null;
}

export function resolveMatchingFacilityPlacementGroup(
  groups: FacilityPlacementGroup[],
  facilityIds: string[]
): FacilityPlacementGroup | null {
  const selectionIds = Array.from(new Set(facilityIds));
  return (
    groups.find(
      (group) =>
        group.facilityIds.length === selectionIds.length &&
        group.facilityIds.every((facilityId) =>
          selectionIds.includes(facilityId)
        )
    ) ?? null
  );
}

export function pruneFacilityPlacementGroups(
  groups: FacilityPlacementGroup[],
  activeFacilityIds: Iterable<string>
): FacilityPlacementGroup[] {
  const activeFacilityIdSet = new Set(activeFacilityIds);
  return groups
    .map((group) => {
      const sanitizedGroup = sanitizeFacilityPlacementGroup(group);
      return {
        ...sanitizedGroup,
        facilityIds: sanitizedGroup.facilityIds.filter((facilityId) =>
          activeFacilityIdSet.has(facilityId)
        ),
      };
    })
    .filter((group) => group.facilityIds.length > 1);
}

export function getScenarioFacilityPlacementGroups(
  metadata: ScenarioMetadata | undefined,
  activeFacilityIds: Iterable<string>
): FacilityPlacementGroup[] {
  return pruneFacilityPlacementGroups(
    metadata?.ui?.facilityPlacementGroups ?? [],
    activeFacilityIds
  ).map(cloneFacilityPlacementGroup);
}

export function setScenarioFacilityPlacementGroups(
  metadata: ScenarioMetadata | undefined,
  groups: FacilityPlacementGroup[],
  activeFacilityIds: Iterable<string>
): ScenarioMetadata {
  const nextMetadata = cloneScenarioMetadata(metadata);
  const normalizedGroups = pruneFacilityPlacementGroups(
    groups,
    activeFacilityIds
  );

  if (normalizedGroups.length > 0) {
    nextMetadata.ui = {
      ...nextMetadata.ui,
      facilityPlacementGroups: normalizedGroups.map(
        cloneFacilityPlacementGroup
      ),
    };
    return nextMetadata;
  }

  if (nextMetadata.ui) {
    delete nextMetadata.ui.facilityPlacementGroups;
    if (Object.keys(nextMetadata.ui).length === 0) {
      delete nextMetadata.ui;
    }
  }
  return nextMetadata;
}

export function buildFacilityPlacementGroupTeleportLayout(
  facilities: FacilityPlacementCoordinate[],
  targetLatitude: number,
  targetLongitude: number
): FacilityPlacementTeleportPosition[] {
  if (facilities.length === 0) {
    return [];
  }

  const centroid = facilities.reduce(
    (accumulator, facility) => ({
      latitude: accumulator.latitude + facility.latitude,
      longitude: accumulator.longitude + facility.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );
  const centroidLatitude = centroid.latitude / facilities.length;
  const centroidLongitude = centroid.longitude / facilities.length;
  const latitudeOffset = targetLatitude - centroidLatitude;
  const longitudeOffset = targetLongitude - centroidLongitude;

  return facilities.map((facility) => ({
    id: facility.id,
    latitude: facility.latitude + latitudeOffset,
    longitude: facility.longitude + longitudeOffset,
  }));
}
