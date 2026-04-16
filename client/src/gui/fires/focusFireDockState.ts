import type { FocusFireSummary } from "@/game/Game";

export type FocusFireDockPreferredTab = "operations" | "recommendation";

export type FocusFireDockAction =
  | "enable"
  | "objective"
  | "recommendation"
  | "airwatch";

export interface FocusFireDockStage {
  key: "setup" | "objective" | "analysis" | "review" | "execute";
  step: 1 | 2 | 3 | 4;
  progress: number;
  title: string;
  description: string;
  action: FocusFireDockAction;
  actionLabel: string;
  panelButtonLabel: string;
  preferredTab: FocusFireDockPreferredTab;
}

export function hasFocusFireObjective(summary: FocusFireSummary) {
  return (
    summary.objectiveLatitude != null &&
    summary.objectiveLongitude != null
  );
}

export function resolveFocusFireDockStage(
  summary: FocusFireSummary
): FocusFireDockStage {
  const hasObjective = hasFocusFireObjective(summary);

  if (!summary.enabled) {
    return {
      key: "setup",
      step: 1,
      progress: 16,
      title: "집중포격 시작",
      description: "모드를 켜고 화력을 한 축으로 모을 준비를 시작하세요.",
      action: "enable",
      actionLabel: "모드 켜기",
      panelButtonLabel: "작전 준비",
      preferredTab: "operations",
    };
  }

  if (!hasObjective) {
    return {
      key: "objective",
      step: 2,
      progress: 38,
      title: "목표 지점 지정",
      description: "지도에서 목표를 클릭해 집중포격 축을 고정하세요.",
      action: "objective",
      actionLabel: "목표 지정",
      panelButtonLabel: "목표 지정",
      preferredTab: "operations",
    };
  }

  if (summary.active) {
    return {
      key: "execute",
      step: 4,
      progress: Math.max(82, Math.min(100, 82 + summary.captureProgress * 0.18)),
      title: "타격 진행 확인",
      description: "공중 관측과 충격량을 보며 타격 흐름을 계속 확인하세요.",
      action: "airwatch",
      actionLabel: "공중 관측 3D",
      panelButtonLabel: "작전 보기",
      preferredTab: "operations",
    };
  }

  if (summary.recommendation) {
    return {
      key: "review",
      step: 3,
      progress: 68,
      title: "추천안 검토",
      description: "추천 화력안을 확인하고 요망 효과나 학습 기준을 다듬으세요.",
      action: "recommendation",
      actionLabel: "추천 보기",
      panelButtonLabel: "추천 보기",
      preferredTab: "recommendation",
    };
  }

  return {
    key: "analysis",
    step: 3,
    progress: 56,
    title: "화력 정렬 중",
    description: "가용 화력을 목표 기준으로 정렬하고 있습니다.",
    action: "airwatch",
    actionLabel: "공중 관측 3D",
    panelButtonLabel: "현황 보기",
    preferredTab: "operations",
  };
}
