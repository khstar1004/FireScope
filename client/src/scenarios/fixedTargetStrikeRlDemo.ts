import fixedTargetStrikeReplayRecording from "@/scenarios/fixed_target_strike_rl_demo_recording.jsonl?raw";
import fixedTargetStrikeReplayMetricsJson from "@/scenarios/fixed_target_strike_rl_demo_metrics.json";

export interface FixedTargetStrikeReplayTotGroup {
  impactStd: number;
  launchCount: number;
  targetId: string;
}

export interface FixedTargetStrikeReplayRewardBreakdown {
  killReward: number;
  totBonus: number;
  threatPenalty: number;
  launchCost: number;
  timeCost: number;
  lossCost: number;
  terminalBonus: number;
  totalReward: number;
  weaponsFired: number;
  threatExposureCount: number;
  selectedTargetId: string | null;
  totGroupCount: number;
  totGroups: FixedTargetStrikeReplayTotGroup[];
  destroyedTargetIds: string[];
  destroyedHighValueTargetIds: string[];
}

export interface FixedTargetStrikeReplayMetric {
  stepIndex: number;
  currentTime: number;
  scenarioName: string;
  phase: "staging" | "coordinated_launch" | "weapon_flyout" | "mission_success";
  doneReason: string;
  doneReasonDetail: string;
  selectedTargetId: string | null;
  launchCount: number;
  weaponsInFlight: number;
  targetAlive: boolean;
  rewardBreakdown: FixedTargetStrikeReplayRewardBreakdown;
  headline: string;
}

export interface FixedTargetStrikeReplayBundle {
  id: string;
  title: string;
  description: string;
  recording: string;
  metrics: FixedTargetStrikeReplayMetric[];
}

const metrics =
  fixedTargetStrikeReplayMetricsJson as FixedTargetStrikeReplayMetric[];

export const fixedTargetStrikeRlDemo: FixedTargetStrikeReplayBundle = {
  id: "fixed-target-strike-rl-demo",
  title: "Fixed Target Strike RL Demo",
  description:
    "Two strike aircraft coordinate a paired launch against a fixed airbase target.",
  recording: fixedTargetStrikeReplayRecording,
  metrics,
};

