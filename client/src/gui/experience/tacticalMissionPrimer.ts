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
    quickStartSteps: [
      "`임무 시작`으로 전장 개요에서 실제 운용 시점으로 전환합니다.",
      "`다음 위협` 또는 지도 클릭으로 우선 표적을 고릅니다.",
      "`주무장` 또는 `보조무장` 버튼으로 바로 교전을 시작합니다.",
    ],
    decisionChecklist: mission.coreLoops.slice(0, 3),
    phaseChecklist: mission.missionPhases
      .slice(0, 3)
      .map((phase) => `${phase.title}: ${phase.instruction}`),
    successCriteria: mission.outcomes.slice(0, 3),
    mapHints: [
      "`마우스 휠`로 3D 전장을 확대·축소하고 `360 모델`에서는 드래그로 자산 둘레를 회전합니다.",
      "`전장 개요`는 전체 battlespace로 복귀하고 `임무 시점`은 현재 단계 카메라로 돌아옵니다.",
      "`기준 시점`은 임무 카메라 각도와 확대값을 정리해 전장을 다시 읽기 쉽게 만듭니다.",
    ],
  };
}
