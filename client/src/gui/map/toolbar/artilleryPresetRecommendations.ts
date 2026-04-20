import type Scenario from "@/game/Scenario";
import type Aircraft from "@/game/units/Aircraft";
import type Airbase from "@/game/units/Airbase";
import type Army from "@/game/units/Army";
import type Facility from "@/game/units/Facility";
import type Ship from "@/game/units/Ship";
import type { BaseSelectionOption } from "@/gui/map/toolbar/baseSelectionCatalog";
import {
  getBearingBetweenTwoPoints,
  getDistanceBetweenTwoPoints,
} from "@/utils/mapFunctions";

type HostileEntity = Aircraft | Airbase | Army | Facility | Ship;

function formatHeadingLabel(headingDegrees: number) {
  const normalizedHeading = ((headingDegrees % 360) + 360) % 360;
  const labels = [
    "북",
    "북북동",
    "북동",
    "동북동",
    "동",
    "동남동",
    "남동",
    "남남동",
    "남",
    "남남서",
    "남서",
    "서남서",
    "서",
    "서북서",
    "북서",
    "북북서",
  ];
  const bucket = Math.round(normalizedHeading / 22.5) % labels.length;

  return `${labels[bucket]} (${Math.round(normalizedHeading)}deg)`;
}

function resolveHostileSideIds(scenario: Scenario, currentSideId: string) {
  const explicitHostiles = scenario.relationships.getHostiles(currentSideId);
  if (explicitHostiles.length > 0) {
    return new Set(explicitHostiles);
  }

  const allies = new Set(scenario.relationships.getAllies(currentSideId));

  return new Set(
    scenario.sides
      .map((side) => side.id)
      .filter(
        (sideId) => sideId && sideId !== currentSideId && !allies.has(sideId)
      )
  );
}

function collectHostileEntities(scenario: Scenario, currentSideId: string) {
  if (!currentSideId) {
    return [];
  }

  const hostileSideIds = resolveHostileSideIds(scenario, currentSideId);
  const entities: HostileEntity[] = [
    ...scenario.aircraft,
    ...scenario.airbases,
    ...scenario.armies,
    ...scenario.facilities,
    ...scenario.ships,
  ];

  return entities.filter(
    (entity) =>
      hostileSideIds.has(entity.sideId) &&
      typeof entity.isDestroyed === "function" &&
      !entity.isDestroyed()
  );
}

function getThreatCategoryWeight(entity: HostileEntity) {
  if ("homeBaseId" in entity) {
    return 1;
  }
  if ("aircraft" in entity && !("heading" in entity)) {
    return 1.4;
  }
  if ("aircraft" in entity && "heading" in entity) {
    return 1.15;
  }
  if ("weapons" in entity && "heading" in entity) {
    return 1.3;
  }
  if ("range" in entity && "heading" in entity) {
    return 1.2;
  }
  return 1;
}

function buildThreatPoints(
  anchorLatitude: number,
  anchorLongitude: number,
  hostileEntities: HostileEntity[]
) {
  return hostileEntities
    .map((entity) => {
      const distanceKm = getDistanceBetweenTwoPoints(
        anchorLatitude,
        anchorLongitude,
        entity.latitude,
        entity.longitude
      );
      const healthWeight =
        typeof entity.getHealthFraction === "function"
          ? Math.max(entity.getHealthFraction(), 0.2)
          : 1;
      const distanceWeight = 1 / (1 + distanceKm / 220);

      return {
        latitude: entity.latitude,
        longitude: entity.longitude,
        distanceKm,
        weight:
          getThreatCategoryWeight(entity) * healthWeight * distanceWeight,
      };
    })
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, 16)
    .filter((point) => point.weight > 0);
}

function inferThreatAxisRecommendation(
  option: BaseSelectionOption,
  hostileEntities: HostileEntity[]
) {
  if (!option.focusCenter || hostileEntities.length === 0) {
    return null;
  }

  const [anchorLongitude, anchorLatitude] = option.focusCenter;
  const threatPoints = buildThreatPoints(
    anchorLatitude,
    anchorLongitude,
    hostileEntities
  );

  if (threatPoints.length === 0) {
    return null;
  }

  const totalWeight = threatPoints.reduce((sum, point) => sum + point.weight, 0);
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return null;
  }

  const weightedLatitude =
    threatPoints.reduce(
      (sum, point) => sum + point.latitude * point.weight,
      0
    ) / totalWeight;
  const weightedLongitude =
    threatPoints.reduce(
      (sum, point) => sum + point.longitude * point.weight,
      0
    ) / totalWeight;
  const headingDegrees = getBearingBetweenTwoPoints(
    anchorLatitude,
    anchorLongitude,
    weightedLatitude,
    weightedLongitude
  );
  const axisLabel = formatHeadingLabel(headingDegrees);

  return {
    headingDegrees,
    threatAxisLabel: `현재 적 중심축 ${axisLabel}`,
    recommendationLabel: `현재 적 전력 ${threatPoints.length}개 기준 자동 보정`,
  };
}

export function buildAdaptiveArtilleryPresetOptions(
  options: BaseSelectionOption[],
  scenario: Scenario,
  currentSideId: string
) {
  const hostileEntities = collectHostileEntities(scenario, currentSideId);
  if (hostileEntities.length === 0) {
    return [...options];
  }

  return options.map((option) => {
    const recommendation = inferThreatAxisRecommendation(option, hostileEntities);
    if (!recommendation) {
      return option;
    }

    return {
      ...option,
      deploymentHeadingDegrees: recommendation.headingDegrees,
      threatAxisLabel: recommendation.threatAxisLabel,
      deploymentRecommendationLabel: recommendation.recommendationLabel,
    };
  });
}
