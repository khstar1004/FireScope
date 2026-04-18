import type { IAirbaseModel } from "@/game/db/models/Airbase";
import { getDisplayName } from "@/utils/koreanCatalog";

export interface BaseSelectionOption {
  key: string;
  label: string;
  description: string;
  entityType: "airbase" | "facility";
  unitType: "airbase" | "facility";
  value: string;
  displayName?: string;
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
  },
  {
    key: "artillery-capital-brigade",
    label: "수도포병여단",
    displayName: "수도포병여단",
    description: "시흥 본부, 인천·김포 축선 담당 포병여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
  },
  {
    key: "artillery-1st-brigade",
    label: "제1포병여단",
    displayName: "제1포병여단",
    description: "고양 본부, 양주·파주 축선 담당 군단 포병여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
  },
  {
    key: "artillery-2nd-brigade",
    label: "제2포병여단",
    displayName: "제2포병여단",
    description: "강원 춘천 본부, 중동부전선 화력지원 포병여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
  },
  {
    key: "artillery-5th-brigade",
    label: "제5포병여단",
    displayName: "제5포병여단",
    description: "포천·철원 축선 전개 중심의 군단 화력지원 여단",
    entityType: "facility",
    unitType: "facility",
    value: "Chunmoo MRLS",
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
