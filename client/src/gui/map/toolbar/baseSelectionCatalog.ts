import type { IAirbaseModel } from "@/game/db/models/Airbase";
import { getDisplayName } from "@/utils/koreanCatalog";
import { getDistanceBetweenTwoPoints } from "@/utils/mapFunctions";

export interface BaseSelectionOption {
  key: string;
  label: string;
  description: string;
  entityType: "airbase" | "facility";
  unitType: "airbase" | "facility";
  value: string;
  displayName?: string;
  focusCenter?: [number, number];
  focusZoom?: number;
  previewBadgeLabel?: string;
  previewTitle?: string;
  previewDescription?: string;
  regionLabel?: string;
  coverageLabel?: string;
  representativeAssetLabel?: string;
  sourceLabel?: string;
  threatAxisLabel?: string;
  deploymentHeadingDegrees?: number;
  deploymentArcDegrees?: number;
  deploymentRecommendationLabel?: string;
  formation?: {
    unitCount: number;
    lateralSpacingKm: number;
    depthSpacingKm?: number;
    templateLabel?: string;
  };
}

const KOREA_AIRBASE_PATTERN =
  /Seoul Air Base|Seosan Air Base|Cheongju Air Base|Sacheon Air Base|Osan Air Base|Kunsan Air Base/i;
const OVERSEAS_AIRBASE_PATTERN = /Al Udeid|Andersen|Kadena|Osan|Kunsan/i;

export const PRIORITY_ARTILLERY_BASE_OPTIONS: BaseSelectionOption[] = [
  {
    key: "artillery-fires-brigade",
    label: "지상작전사령부 화력여단",
    displayName: "지상작전사령부 화력여단",
    description: "지작사 직할 대화력전 화력여단 프리셋",
    entityType: "facility",
    unitType: "facility",
    value: "Tactical Surface to Surface Missile Launcher",
    focusCenter: [127.2, 37.233],
    focusZoom: 8.6,
    previewBadgeLabel: "포병 프리셋",
    previewTitle: "지작사 화력여단 프리셋",
    previewDescription:
      "지상작전사령부 직할 화력여단 기준 프리셋입니다. 수도권 북부 대응 시나리오에 맞게 용인 축으로 화면을 먼저 이동합니다.",
    regionLabel: "용인 권역",
    coverageLabel: "수도권 북부 대응 축선",
    representativeAssetLabel: getDisplayName(
      "Tactical Surface to Surface Missile Launcher"
    ),
    sourceLabel: "위키피디아 지상작전사령부 편제",
    deploymentHeadingDegrees: 8,
    deploymentArcDegrees: 90,
    formation: {
      unitCount: 4,
      lateralSpacingKm: 10,
      depthSpacingKm: 3,
      templateLabel: "여단 본대 4개 포대 분산",
    },
  },
  {
    key: "artillery-capital-brigade",
    label: "수도포병여단",
    displayName: "수도포병여단",
    description: "시흥 본부, 인천·김포 축선 담당 포병여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
    focusCenter: [126.802887, 37.37986],
    focusZoom: 9.2,
    previewBadgeLabel: "포병 프리셋",
    previewTitle: "수도권 서부 화력 프리셋",
    previewDescription:
      "시흥 본부, 인천·김포 축선을 담당하는 수도포병여단 프리셋입니다. 수도권 서부 축선 검토를 위해 시흥 권역으로 이동합니다.",
    regionLabel: "시흥 권역",
    coverageLabel: "인천·김포 축선",
    representativeAssetLabel: getDisplayName("Chunmoo MRLS"),
    sourceLabel: "위키피디아 Capital Artillery Brigade",
    deploymentHeadingDegrees: 332,
    deploymentArcDegrees: 120,
    formation: {
      unitCount: 3,
      lateralSpacingKm: 8,
      depthSpacingKm: 2,
      templateLabel: "수도권 서부 3개 포대 분산",
    },
  },
  {
    key: "artillery-1st-brigade",
    label: "제1포병여단",
    displayName: "제1포병여단",
    description: "고양 본부, 양주·파주 축선 담당 군단 포병여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
    focusCenter: [126.8, 37.65],
    focusZoom: 9.1,
    previewBadgeLabel: "포병 프리셋",
    previewTitle: "서북부 전선 화력 프리셋",
    previewDescription:
      "고양 본부, 양주·파주 축선을 담당하는 제1포병여단 프리셋입니다. 서북부 전선 검토를 위해 고양 권역으로 이동합니다.",
    regionLabel: "고양 권역",
    coverageLabel: "양주·파주 축선",
    representativeAssetLabel: getDisplayName("Chunmoo MRLS"),
    sourceLabel: "위키피디아 1st Artillery Brigade",
    deploymentHeadingDegrees: 352,
    deploymentArcDegrees: 120,
    formation: {
      unitCount: 3,
      lateralSpacingKm: 8,
      depthSpacingKm: 2,
      templateLabel: "서북부 전선 3개 포대 분산",
    },
  },
  {
    key: "artillery-2nd-brigade",
    label: "제2포병여단",
    displayName: "제2포병여단",
    description: "강원 춘천 본부, 중동부전선 화력지원 포병여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
    focusCenter: [127.733, 37.867],
    focusZoom: 8.9,
    previewBadgeLabel: "포병 프리셋",
    previewTitle: "중동부 전선 화력 프리셋",
    previewDescription:
      "강원 춘천 권역을 기준으로 한 제2포병여단 프리셋입니다. 중동부전선 화력지원 검토를 위해 춘천 권역으로 이동합니다.",
    regionLabel: "춘천 권역",
    coverageLabel: "중동부전선 화력지원",
    representativeAssetLabel: getDisplayName("Chunmoo MRLS"),
    sourceLabel: "정책브리핑 2026-01-29",
    deploymentHeadingDegrees: 28,
    deploymentArcDegrees: 120,
    formation: {
      unitCount: 3,
      lateralSpacingKm: 9,
      depthSpacingKm: 2,
      templateLabel: "중동부 전선 3개 포대 분산",
    },
  },
  {
    key: "artillery-5th-brigade",
    label: "제5포병여단",
    displayName: "제5포병여단",
    description: "포천·철원 축선 전개 중심의 군단 화력지원 여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
    focusCenter: [127.200172, 37.894736],
    focusZoom: 8.8,
    previewBadgeLabel: "포병 프리셋",
    previewTitle: "포천·철원 축선 화력 프리셋",
    previewDescription:
      "포천·철원 축선 전개를 가정한 제5포병여단 프리셋입니다. 경기 북부 화력축 검토를 위해 포천 권역으로 이동합니다.",
    regionLabel: "포천 권역",
    coverageLabel: "포천·연천·철원 축선",
    representativeAssetLabel: getDisplayName("Chunmoo MRLS"),
    sourceLabel: "연합뉴스 2022-11-06 / 2026-04-13",
    deploymentHeadingDegrees: 16,
    deploymentArcDegrees: 120,
    formation: {
      unitCount: 3,
      lateralSpacingKm: 10,
      depthSpacingKm: 2,
      templateLabel: "포천·철원 3개 포대 분산",
    },
  },
];

function toAirbaseSelectionOption(
  airbase: IAirbaseModel,
  description: string
): BaseSelectionOption {
  return {
    key: `airbase-${airbase.name}`,
    label: getDisplayName(airbase.name),
    description,
    entityType: "airbase",
    unitType: "airbase",
    value: airbase.name,
    focusCenter: [airbase.longitude, airbase.latitude],
    focusZoom: 8.9,
  };
}

export function buildPriorityQuickAddAirbaseOptions(
  airbaseDb: IAirbaseModel[]
): BaseSelectionOption[] {
  return airbaseDb
    .filter(
      (airbase) =>
        KOREA_AIRBASE_PATTERN.test(airbase.name) ||
        OVERSEAS_AIRBASE_PATTERN.test(airbase.name)
    )
    .map((airbase) =>
      toAirbaseSelectionOption(
        airbase,
        KOREA_AIRBASE_PATTERN.test(airbase.name)
          ? "주요 한국 공군기지 배치"
          : "전진/해외 기지 배치"
      )
    );
}

export function buildBaseSelectionAirbaseOptions(
  airbaseDb: IAirbaseModel[]
): BaseSelectionOption[] {
  return airbaseDb.map((airbase) =>
    toAirbaseSelectionOption(
      airbase,
      KOREA_AIRBASE_PATTERN.test(airbase.name)
        ? "주요 한국 공군기지"
        : "공군기지"
      )
  );
}

function isFiniteMapCenter(center?: number[] | null): center is [number, number] {
  return (
    Array.isArray(center) &&
    center.length >= 2 &&
    Number.isFinite(center[0]) &&
    Number.isFinite(center[1])
  );
}

export function sortBaseSelectionOptionsByDistance(
  options: BaseSelectionOption[],
  mapCenter?: number[] | null
): BaseSelectionOption[] {
  if (!isFiniteMapCenter(mapCenter)) {
    return [...options];
  }

  const [centerLongitude, centerLatitude] = mapCenter;

  return [...options].sort((left, right) => {
    const leftDistance = left.focusCenter
      ? getDistanceBetweenTwoPoints(
          centerLatitude,
          centerLongitude,
          left.focusCenter[1],
          left.focusCenter[0]
        )
      : Number.POSITIVE_INFINITY;
    const rightDistance = right.focusCenter
      ? getDistanceBetweenTwoPoints(
          centerLatitude,
          centerLongitude,
          right.focusCenter[1],
          right.focusCenter[0]
        )
      : Number.POSITIVE_INFINITY;

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }

    return left.label.localeCompare(right.label, "ko");
  });
}
