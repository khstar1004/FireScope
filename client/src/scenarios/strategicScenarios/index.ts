import type { ScenarioPresetDefinition } from "./builders";
import {
  buildAlDhafraDroneRaidScenario,
  buildAlUdeidCounterstrikeScenario,
  buildAbuMusaLandingScenario,
  buildBandarAbbasSortieScenario,
  buildHormuzBlockadeScenario,
  buildKhuzestanArmorBreakthroughScenario,
} from "./iranVsUsPresetBuilders";
import { buildKoreaVsNorthKoreaWestSeaScenario } from "./koreaVsNorthKoreaPresetBuilders";

export type { ScenarioPresetDefinition } from "./builders";
const legacyIranVsUsScenarioBuilders = [
  buildBandarAbbasSortieScenario,
  buildAlUdeidCounterstrikeScenario,
  buildAbuMusaLandingScenario,
  buildKhuzestanArmorBreakthroughScenario,
];
void legacyIranVsUsScenarioBuilders;

export const iranVsUsScenarioPresets: ScenarioPresetDefinition[] = [
  {
    name: "iran_vs_us_hormuz_blockade",
    displayName: "이란 vs 미국 - 호르무즈 봉쇄",
    regenerateScenarioId: true,
    designIntent:
      "좁은 해협에서는 함정 숫자보다 해안 방공, 상시 ISR, 호위 편대의 배치가 작전 템포를 좌우한다는 점을 보여주기 위한 시나리오입니다.",
    assetHighlights: [
      "항모 전단",
      "해안 방공",
      "공중급유기",
      "무인기 ISR",
      "전진기지",
    ],
    scenario: buildHormuzBlockadeScenario(),
  },
  {
    name: "iran_vs_us_al_dhafra_drone_raid",
    displayName: "이란 vs 미국 - 알다프라 드론 공습",
    regenerateScenarioId: true,
    designIntent:
      "기지 생존성은 전투기 성능이 아니라 분산기지, 수송기, 방공 다층망, 저속 드론 대응 체계까지 합쳐져야 유지된다는 점을 말하려는 시나리오입니다.",
    assetHighlights: [
      "대형 공군기지",
      "드론 공습",
      "패트리엇/사드",
      "수송기",
      "기지 방호 장갑차",
    ],
    scenario: buildAlDhafraDroneRaidScenario(),
  },
];

export const koreaVsNorthKoreaScenarioPresets: ScenarioPresetDefinition[] = [
  {
    name: "korea_vs_north_korea_west_sea_defense",
    displayName: "한국 vs 북한 - 서해 합동 방어",
    regenerateScenarioId: true,
    designIntent:
      "서해와 수도권 접근축에서는 함정, 방공망, 전차, 반격 포병, 전술기, 드론이 동시에 묶여야 억제가 성립한다는 점을 보여주기 위한 시나리오입니다.",
    assetHighlights: [
      "한국형 방공망",
      "서해 함정",
      "수도권 방어",
      "북측 발사대 압박",
      "드론 ISR",
    ],
    scenario: buildKoreaVsNorthKoreaWestSeaScenario(),
  },
];

export const strategicScenarioPresets: ScenarioPresetDefinition[] = [
  ...iranVsUsScenarioPresets,
  ...koreaVsNorthKoreaScenarioPresets,
];

export function findIranVsUsScenarioPreset(name: string) {
  return iranVsUsScenarioPresets.find((preset) => preset.name === name);
}

export function findKoreaVsNorthKoreaScenarioPreset(name: string) {
  return koreaVsNorthKoreaScenarioPresets.find(
    (preset) => preset.name === name
  );
}

export function findStrategicScenarioPreset(name: string) {
  return strategicScenarioPresets.find((preset) => preset.name === name);
}

