export type JetCraftId = "kf21" | "f15" | "f16" | "f35";

export interface JetCraftCatalogEntry {
  id: JetCraftId;
  label: string;
  hudLabel: string;
  role: string;
  summary: string;
  simNote: string;
  simStats: Array<{
    label: string;
    value: string;
  }>;
  officialNote?: string;
  statusNote?: string;
}

export const DEFAULT_JET_CRAFT_ID: JetCraftId = "f15";

export const JET_CRAFT_CATALOG: JetCraftCatalogEntry[] = [
  {
    id: "f15",
    label: "F-15C Eagle",
    hudLabel: "F-15C",
    role: "기준 기체 / 고속 요격",
    summary:
      "기존 비행 시뮬레이터의 기준 기체입니다. 기본 선택값이며 최고속도와 직진 가속에 가장 무게를 둔 세팅입니다.",
    simNote: "고속 유지 성능을 가장 높게 두고 선회는 중간 수준으로 남겼습니다.",
    simStats: [
      { label: "시뮬 최고속", value: "1,100" },
      { label: "피치 응답", value: "1.20" },
      { label: "롤 응답", value: "2.60" },
      { label: "부스트", value: "1.50x" },
    ],
  },
  {
    id: "kf21",
    label: "KF-21 보라매",
    hudLabel: "KF-21",
    role: "국산 4.5세대 멀티롤",
    summary:
      '추가한 실제 "KF-21A Boramae Fighter Jet" GLB를 우선 사용합니다. F-15 다음 두 번째 전투기 선택지로 배치했습니다.',
    simNote:
      "F-15보다 약간 느리고, F-35보다 더 민첩한 균형형 세팅으로 반영했습니다.",
    simStats: [
      { label: "시뮬 최고속", value: "1,060" },
      { label: "피치 응답", value: "1.38" },
      { label: "롤 응답", value: "3.05" },
      { label: "부스트", value: "1.46x" },
    ],
    officialNote:
      "공개 제원 기준 길이 16.9m, 폭 11.2m, 최대 속도 마하 1.81급으로 알려진 한국형 차세대 전투기입니다.",
    statusNote:
      "이 항목은 사용자 추가 GLB를 우선 로드하고, 파일 문제 시 기존 전투기 모델 후보로만 대체합니다.",
  },
  {
    id: "f16",
    label: "F-16 Fighting Falcon",
    hudLabel: "F-16",
    role: "경량 멀티롤",
    summary:
      "공용 F-15 모델을 그대로 쓰되, 롤과 선회 응답이 가장 빠른 경쾌한 조작감으로 반영했습니다.",
    simNote: "급선회와 방향 전환에 가장 민감한 기체로 조정했습니다.",
    simStats: [
      { label: "시뮬 최고속", value: "1,025" },
      { label: "피치 응답", value: "1.45" },
      { label: "롤 응답", value: "3.35" },
      { label: "부스트", value: "1.48x" },
    ],
  },
  {
    id: "f35",
    label: "F-35A Lightning II",
    hudLabel: "F-35A",
    role: "스텔스 타격",
    summary:
      "공용 F-15 모델을 유지하면서, 급가속보다 안정적인 자세 유지와 무난한 선회 응답에 초점을 맞췄습니다.",
    simNote: "속도 상한은 낮추고 자세 안정성과 부스트 지속 시간을 길게 두었습니다.",
    simStats: [
      { label: "시뮬 최고속", value: "970" },
      { label: "피치 응답", value: "1.30" },
      { label: "롤 응답", value: "2.90" },
      { label: "부스트", value: "1.42x" },
    ],
  },
];

const JET_CRAFT_LOOKUP = Object.fromEntries(
  JET_CRAFT_CATALOG.map((craft) => [craft.id, craft])
) as Record<JetCraftId, JetCraftCatalogEntry>;

export function isJetCraftId(
  value: string | null | undefined
): value is JetCraftId {
  return value === "kf21" || value === "f15" || value === "f16" || value === "f35";
}

export function getJetCraftCatalogEntry(
  craftId?: string | null
): JetCraftCatalogEntry {
  return isJetCraftId(craftId)
    ? JET_CRAFT_LOOKUP[craftId]
    : JET_CRAFT_LOOKUP[DEFAULT_JET_CRAFT_ID];
}
