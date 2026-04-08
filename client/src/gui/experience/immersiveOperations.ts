import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";

export interface ImmersiveOperationOption {
  id: string;
  label: string;
  note: string;
}

export interface ImmersiveOperationMetric {
  label: string;
  value: string;
  hint: string;
}

const OPERATION_OPTIONS: Record<
  ImmersiveExperienceProfile,
  ImmersiveOperationOption[]
> = {
  ground: [
    {
      id: "breakthrough",
      label: "Breakthrough",
      note: "기갑 돌파와 전면 압박 중심",
    },
    {
      id: "convoy-guard",
      label: "Convoy Guard",
      note: "기동 호송과 전진 경계 중심",
    },
    {
      id: "command-post",
      label: "Command Post",
      note: "지휘 차량과 전술 통제 중심",
    },
  ],
  fires: [
    {
      id: "deep-strike",
      label: "Deep Strike",
      note: "장거리 화력과 종심 타격 중심",
    },
    {
      id: "counter-battery",
      label: "Counter Battery",
      note: "적 포대 추적과 반격 사격 중심",
    },
    {
      id: "saturation",
      label: "Area Saturation",
      note: "다연장/포대 분산 화력 중심",
    },
  ],
  defense: [
    {
      id: "layered-shield",
      label: "Layered Shield",
      note: "장단거리 계층 방어 중심",
    },
    {
      id: "point-defense",
      label: "Point Defense",
      note: "핵심 거점 근접 방어 중심",
    },
    {
      id: "radar-picket",
      label: "Radar Picket",
      note: "전방 감시와 조기 탐지 중심",
    },
  ],
  maritime: [
    {
      id: "surface-action",
      label: "Surface Action",
      note: "수상전 전투단과 대공/대함 교전 중심",
    },
    {
      id: "carrier-screen",
      label: "Carrier Screen",
      note: "대형 함정 외곽 경계와 호위 중심",
    },
    {
      id: "silent-patrol",
      label: "Silent Patrol",
      note: "잠수 전력과 은밀 접근 중심",
    },
  ],
  base: [
    {
      id: "quick-scramble",
      label: "Quick Scramble",
      note: "즉응 출격과 활주축 관리 중심",
    },
    {
      id: "rotary-lift",
      label: "Rotary Lift",
      note: "헬기 전개와 병력/물자 수송 중심",
    },
    {
      id: "drone-watch",
      label: "Drone Watch",
      note: "무인기 감시와 체공 운용 중심",
    },
  ],
};

function formatMetricNumber(value: number | undefined, fractionDigits = 0) {
  if (value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function getOperationOption(
  profile: ImmersiveExperienceProfile,
  operationModeId: string
) {
  const options = OPERATION_OPTIONS[profile];

  return options.find((option) => option.id === operationModeId) ?? options[0];
}

function buildSelectionSummary(selectedModels: BundleModelSelection[]) {
  if (selectedModels.length === 0) {
    return "No Models Selected";
  }

  if (selectedModels.length <= 2) {
    return selectedModels.map((model) => model.label).join(" / ");
  }

  return `${selectedModels[0].label}, ${selectedModels[1].label} +${
    selectedModels.length - 2
  }`;
}

function buildCountLabel(selectedModels: BundleModelSelection[]) {
  return `${selectedModels.length} Selected`;
}

export function getImmersiveOperationOptions(
  profile: ImmersiveExperienceProfile
) {
  return OPERATION_OPTIONS[profile];
}

export function getDefaultImmersiveOperationMode(
  profile: ImmersiveExperienceProfile
) {
  return OPERATION_OPTIONS[profile][0].id;
}

export function buildImmersiveModeBrief(
  profile: ImmersiveExperienceProfile,
  operationModeId: string,
  selectedModels: BundleModelSelection[]
) {
  const option = getOperationOption(profile, operationModeId);

  switch (profile) {
    case "ground":
      return `${option.note}. 현재 ${buildCountLabel(
        selectedModels
      )} 기준으로 차체와 기동축을 비교합니다.`;
    case "fires":
      return `${option.note}. 현재 ${buildCountLabel(
        selectedModels
      )} 기준으로 포대와 발사축을 비교합니다.`;
    case "defense":
      return `${option.note}. 현재 ${buildCountLabel(
        selectedModels
      )} 기준으로 방어 계층과 센서 구역을 비교합니다.`;
    case "maritime":
      return `${option.note}. 현재 ${buildCountLabel(
        selectedModels
      )} 기준으로 전투단 구성을 비교합니다.`;
    case "base":
      return `${option.note}. 현재 ${buildCountLabel(
        selectedModels
      )} 기준으로 전투기, 헬기, 드론 라인업을 비교합니다.`;
  }
}

export function buildImmersiveOperationsDeck(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  activeModel: BundleModelSelection | null,
  selectedModels: BundleModelSelection[],
  operationModeId: string
): ImmersiveOperationMetric[] {
  const option = getOperationOption(profile, operationModeId);
  const selectionSummary = buildSelectionSummary(selectedModels);
  const compareCount = buildCountLabel(selectedModels);

  switch (profile) {
    case "ground":
      return [
        {
          label: "Armor Set",
          value: activeModel?.label ?? "Ground Unit",
          hint: "현재 기준 플랫폼",
        },
        {
          label: "Mission Mode",
          value: option.label,
          hint: option.note,
        },
        {
          label: "Compare Set",
          value: compareCount,
          hint: selectionSummary,
        },
        {
          label: "Maneuver Axis",
          value:
            asset.heading !== undefined
              ? `${formatMetricNumber(asset.heading)} DEG`
              : "Frontline",
          hint: "정면 교전 방향 기준",
        },
      ];
    case "fires":
      return [
        {
          label: "Battery Layout",
          value: activeModel?.label ?? "Fires Battery",
          hint: "현재 기준 포대/런처",
        },
        {
          label: "Mission Mode",
          value: option.label,
          hint: option.note,
        },
        {
          label: "Compare Set",
          value: compareCount,
          hint: selectionSummary,
        },
        {
          label: "Strike Radius",
          value:
            asset.range !== undefined
              ? `${formatMetricNumber(asset.range)} NM`
              : "N/A",
          hint: "화력 도달 거리",
        },
      ];
    case "defense":
      return [
        {
          label: "Battery Mode",
          value: activeModel?.label ?? "Defense Grid",
          hint: "현재 기준 방공 체계",
        },
        {
          label: "Mission Mode",
          value: option.label,
          hint: option.note,
        },
        {
          label: "Compare Set",
          value: compareCount,
          hint: selectionSummary,
        },
        {
          label: "Sensor Ring",
          value:
            asset.range !== undefined
              ? `${formatMetricNumber(asset.range)} NM`
              : "N/A",
          hint: "탐지 및 요격 범위",
        },
      ];
    case "maritime":
      return [
        {
          label: "Task Group",
          value: activeModel?.label ?? "Surface Group",
          hint: "현재 기준 함형",
        },
        {
          label: "Mission Mode",
          value: option.label,
          hint: option.note,
        },
        {
          label: "Compare Set",
          value: compareCount,
          hint: selectionSummary,
        },
        {
          label: "Deck / Bay",
          value:
            asset.aircraftCount !== undefined
              ? `${formatMetricNumber(asset.aircraftCount)} EA`
              : "N/A",
          hint: "탑재 자산 또는 내부 운용 구획",
        },
      ];
    case "base":
      return [
        {
          label: "Ready Rack",
          value:
            asset.aircraftCount !== undefined
              ? `${formatMetricNumber(asset.aircraftCount)} EA`
              : "N/A",
          hint: "출격 대기 자산 수",
        },
        {
          label: "Mission Mode",
          value: option.label,
          hint: option.note,
        },
        {
          label: "Flight Line",
          value: selectionSummary,
          hint: "선택된 전개 라인업",
        },
        {
          label: "Launch Window",
          value:
            option.id === "rotary-lift"
              ? "Lift Corridor"
              : option.id === "drone-watch"
                ? "Persistent Orbit"
                : "Immediate Launch",
          hint: "활주/이동/체공 중심 운용 상태",
        },
      ];
  }
}
