import type { ExperienceMissionPlan } from "@/gui/experience/experienceRuntime";
import type {
  TacticalContactDomain,
  TacticalScenarioSeed,
} from "@/gui/experience/tacticalExperience";

export interface TacticalMissionPrimer {
  designIntent: string;
  battlespaceSummary: string;
  threatSummary: string;
  quickStartSteps: string[];
  decisionChecklist: string[];
  phaseChecklist: string[];
  successCriteria: string[];
  mapHints: string[];
}

function formatDistanceLabel(value: number) {
  return value >= 1000
    ? `${(value / 1000).toFixed(1)} km`
    : `${Math.round(value)} m`;
}

function formatDomainLabel(domain: TacticalContactDomain) {
  switch (domain) {
    case "air":
      return "공중";
    case "surface":
      return "수상";
    case "ground":
      return "지상";
  }
}

function summarizeThreatCounts(scenario: TacticalScenarioSeed) {
  const counts = scenario.config.hostileContacts.reduce<Record<string, number>>(
    (summary, contact) => {
      const domain = formatDomainLabel(contact.domain);
      summary[domain] = (summary[domain] ?? 0) + 1;
      return summary;
    },
    {}
  );

  return ["공중", "지상", "수상"]
    .filter((domain) => counts[domain] > 0)
    .map((domain) => `${domain} ${counts[domain]}개`)
    .join(" / ");
}

function summarizeThreatRoles(scenario: TacticalScenarioSeed) {
  const roles = [
    ...new Set(scenario.config.hostileContacts.map((contact) => contact.role)),
  ];

  if (roles.length === 0) {
    return "즉시 식별된 위협이 없습니다.";
  }

  if (roles.length === 1) {
    return roles[0];
  }

  if (roles.length === 2) {
    return `${roles[0]}와 ${roles[1]}`;
  }

  return `${roles.slice(0, 2).join(", ")} 외 ${roles.length - 2}종`;
}

function summarizeSites(scenario: TacticalScenarioSeed) {
  const siteLabels = scenario.config.sites.map((site) => site.label);

  if (siteLabels.length === 0) {
    return "현재 자산 주변 전장";
  }

  if (siteLabels.length <= 2) {
    return siteLabels.join(" / ");
  }

  return `${siteLabels[0]} / ${siteLabels[1]} 외 ${siteLabels.length - 2}개 구역`;
}

function buildQuickStartSteps(
  _mission: ExperienceMissionPlan,
  scenario: TacticalScenarioSeed
) {
  switch (scenario.config.profile) {
    case "ground":
      return [
        "`모델 집중`으로 차체 실루엣과 포탑축을 먼저 확인한 뒤 돌파축으로 들어갑니다.",
        "`작전 투입` 후 `다음 위협`으로 선도 전차와 측방 위협의 우선순위를 확정합니다.",
        "`주무장`은 근접 직사 교전, `보조무장`은 후방 고위협 표적 마무리에 배정합니다.",
      ];
    case "fires":
      return [
        "`모델 집중`으로 발사기 자세와 포대 배치를 확인한 뒤 사격 흐름으로 전환합니다.",
        "`전장 개요`에서 목표 격자와 발사 진지를 함께 읽고 `작전 투입`으로 내려갑니다.",
        "`주무장`은 교정 사격, `보조무장`은 살보 또는 대포병 반격으로 구분해 운용합니다.",
      ];
    case "defense":
      return [
        "`모델 집중`으로 레이더와 발사기 방향을 먼저 확인한 뒤 방어 구역으로 들어갑니다.",
        "`작전 투입` 또는 `위협 추적`으로 침투 축을 읽고 우선 요격 표적을 확정합니다.",
        "`주무장`은 근접 즉응 요격, `보조무장`은 장거리 또는 다중 표적 대응에 사용합니다.",
      ];
    default:
      return [
        "`임무 시작`으로 전장 개요에서 실제 운용 시점으로 전환합니다.",
        "`다음 위협` 또는 지도 클릭으로 우선 표적을 고릅니다.",
        "`주무장` 또는 `보조무장` 버튼으로 바로 교전을 시작합니다.",
      ];
  }
}

function buildMapHints(scenario: TacticalScenarioSeed) {
  switch (scenario.config.profile) {
    case "ground":
      return [
        "`모델 집중`에서는 드래그와 휠만 남기고 중앙 표식은 숨겨 차체를 크게 읽습니다.",
        "`작전 투입`은 돌파축 또는 엄호축 기준 카메라로 바로 내려가며 `전장 개요`는 전체 축을 다시 보여줍니다.",
        "`기준 시점`은 교전 후 차체 방향과 돌파선 정렬 상태를 재점검할 때 사용합니다.",
      ];
    case "fires":
      return [
        "`모델 집중`에서 런처와 포신 방향을 확인한 뒤 `작전 투입`으로 화력 통제 시점에 들어갑니다.",
        "`전장 개요`는 목표 격자와 살보 범위를 넓게 읽고 `위협 추적`은 대표 표적 또는 발사 원점을 붙잡습니다.",
        "`기준 시점`은 착탄 후 전과와 재배치 상태를 다시 읽는 화력 통제 복귀점입니다.",
      ];
    case "defense":
      return [
        "`모델 집중`에서는 중앙 표식 없이 방공 자산을 회전하며 발사기와 레이더 방향을 확인합니다.",
        "`전장 개요`는 방어 반경과 침투 축을, `위협 추적`은 우선 요격 표적의 접근 각을 보여줍니다.",
        "`기준 시점`은 요격 후 센서 반경과 잔여 위협 상태를 다시 읽기 위한 방공 통제 복귀점입니다.",
      ];
    default:
      return [
        "`마우스 휠`로 3D 전장을 확대·축소하고 `360 모델`에서는 드래그로 자산 둘레를 회전합니다.",
        "`전장 개요`는 전체 battlespace로 복귀하고 `임무 시점`은 현재 단계 카메라로 돌아옵니다.",
        "`기준 시점`은 임무 카메라 각도와 확대값을 정리해 전장을 다시 읽기 쉽게 만듭니다.",
      ];
  }
}

export function buildTacticalMissionPrimer(
  mission: ExperienceMissionPlan,
  scenario: TacticalScenarioSeed
): TacticalMissionPrimer {
  const threatCountLabel = summarizeThreatCounts(scenario);
  const threatRoleLabel = summarizeThreatRoles(scenario);
  const siteSummary = summarizeSites(scenario);
  const hostileCount = scenario.config.hostileContacts.length;
  const sensorRangeLabel = formatDistanceLabel(scenario.config.sensorRangeM);

  return {
    designIntent: `${mission.operatorRole} 시점에서 ${mission.missionStatement}`,
    battlespaceSummary: `${sensorRangeLabel} 센서 반경 안에 ${hostileCount}개 위협과 ${siteSummary}이 배치되어 있습니다.`,
    threatSummary: `${threatCountLabel} 위협이 접근 중이며, 핵심 교전 축은 ${threatRoleLabel} 대응입니다.`,
    quickStartSteps: buildQuickStartSteps(mission, scenario),
    decisionChecklist: mission.coreLoops.slice(0, 3),
    phaseChecklist: mission.missionPhases
      .slice(0, 3)
      .map((phase) => `${phase.title}: ${phase.instruction}`),
    successCriteria: mission.outcomes.slice(0, 3),
    mapHints: buildMapHints(scenario),
  };
}
