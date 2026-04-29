import type { FocusFireInsight, FocusFireInsightSource } from "./types";
import { clamp } from "./shared";

const FOCUS_FIRE_WEIGHTS = {
  artillery: 4,
  aircraft: 5,
  armor: 3,
  weaponsInFlight: 6,
  captureProgress: 0.2,
} as const;
function getFocusFireIntensityLabel(shockIndex: number) {
  if (shockIndex >= 85) {
    return "압도적";
  }
  if (shockIndex >= 65) {
    return "고강도";
  }
  if (shockIndex >= 40) {
    return "유효";
  }
  if (shockIndex >= 20) {
    return "축적 중";
  }
  return "준비 단계";
}

function getFocusFireDominantAxis(source: FocusFireInsightSource) {
  const weightedAxes = [
    {
      label: "항공 타격",
      value: source.aircraftCount * FOCUS_FIRE_WEIGHTS.aircraft,
    },
    {
      label: "포대 화력",
      value: source.artilleryCount * FOCUS_FIRE_WEIGHTS.artillery,
    },
    {
      label: "기갑 압박",
      value: source.armorCount * FOCUS_FIRE_WEIGHTS.armor,
    },
    {
      label: "비행 중 탄체",
      value: source.weaponsInFlight * FOCUS_FIRE_WEIGHTS.weaponsInFlight,
    },
  ].sort((left, right) => right.value - left.value);

  return weightedAxes[0]?.value ? weightedAxes[0].label : "대기";
}

function buildFocusFireSummaryText(
  source: FocusFireInsightSource,
  shockIndex: number,
  dominantAxis: string
) {
  if (!source.active && shockIndex < 20) {
    return "집중포격 준비 단계입니다. 아직 화력이 본격적으로 수렴하지 않았습니다.";
  }
  if (source.weaponsInFlight === 0 && source.captureProgress < 20) {
    return `${dominantAxis} 중심으로 포격 축을 형성 중입니다. 첫 타격이 들어가기 전 정렬 단계입니다.`;
  }
  if (shockIndex >= 85) {
    return `${dominantAxis}이(가) 전장을 지배하고 있습니다. 목표 지역 방어선이 급격히 흔들릴 가능성이 높습니다.`;
  }
  if (shockIndex >= 65) {
    return `${dominantAxis}이(가) 유의미한 충격을 만들고 있습니다. 화력과 기동이 함께 걸려 목표 고정 효과가 큽니다.`;
  }
  if (shockIndex >= 40) {
    return `${dominantAxis} 위주로 압박이 형성됐습니다. 추가 타격이 누적되면 목표 확보 단계로 넘어갈 수 있습니다.`;
  }
  return "집중포격은 진행 중이지만 아직 결정적 충격은 아닙니다. 화력 밀도를 더 올릴 여지가 있습니다.";
}

export function buildFocusFireInsight(
  source: FocusFireInsightSource
): FocusFireInsight {
  const artillery = Math.round(
    source.artilleryCount * FOCUS_FIRE_WEIGHTS.artillery
  );
  const aircraft = Math.round(
    source.aircraftCount * FOCUS_FIRE_WEIGHTS.aircraft
  );
  const armor = Math.round(source.armorCount * FOCUS_FIRE_WEIGHTS.armor);
  const weaponsInFlight = Math.round(
    source.weaponsInFlight * FOCUS_FIRE_WEIGHTS.weaponsInFlight
  );
  const captureProgress = Math.round(
    source.captureProgress * FOCUS_FIRE_WEIGHTS.captureProgress
  );
  const total = clamp(
    artillery + aircraft + armor + weaponsInFlight + captureProgress,
    0,
    100
  );
  const dominantAxis = getFocusFireDominantAxis(source);

  return {
    shockIndex: total,
    intensityLabel: getFocusFireIntensityLabel(total),
    dominantAxis,
    breakdown: {
      artillery,
      aircraft,
      armor,
      weaponsInFlight,
      captureProgress,
      total,
    },
    summary: buildFocusFireSummaryText(source, total, dominantAxis),
  };
}


