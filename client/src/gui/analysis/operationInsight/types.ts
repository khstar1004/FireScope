import type { FocusFireSummary } from "@/game/Game";
import type { SimulationLogEntityType } from "@/game/log/SimulationLogs";
export type FocusFireInsightSource = Pick<
  FocusFireSummary,
  | "active"
  | "captureProgress"
  | "aircraftCount"
  | "artilleryCount"
  | "armorCount"
  | "weaponsInFlight"
>;

export interface FocusFireInsight {
  shockIndex: number;
  intensityLabel: string;
  dominantAxis: string;
  breakdown: {
    artillery: number;
    aircraft: number;
    armor: number;
    weaponsInFlight: number;
    captureProgress: number;
    total: number;
  };
  summary: string;
}

export interface SimulationOutcomeEntityBreakdown {
  aircraft: number;
  ships: number;
  facilities: number;
  airbases: number;
  weapons: number;
  other: number;
  total: number;
}

export interface SimulationOutcomeSideSummary {
  sideId: string;
  name: string;
  score: number;
  remainingCombatUnits: number;
  remainingCombatPower: number;
  aircraft: number;
  ships: number;
  facilities: number;
  airbases: number;
  weaponInventory: number;
  confirmedHits: number;
  launches: number;
  misses: number;
  weaponLosses: number;
  aircraftLosses: number;
  returnToBaseEvents: number;
  abortedMissions: number;
  strikeMissionSuccesses: number;
  patrolMissionSuccesses: number;
  missionSuccesses: number;
  kills: SimulationOutcomeEntityBreakdown;
  losses: SimulationOutcomeEntityBreakdown;
  attritionBalance: number;
}

export interface SimulationOutcomeTurningPoint {
  id: string;
  headline: string;
  detail: string;
  sideName: string;
  category: "strike" | "mission" | "loss" | "withdrawal" | "control" | "other";
  importanceLabel: "높음" | "보통";
  occurredAtUnix: number;
  occurredAtLabel: string;
}

export interface SimulationOutcomeSideAssessment {
  sideId: string;
  name: string;
  combatPosture: string;
  engagementEfficiencyLabel: string;
  attritionLabel: string;
  hitRate: number | null;
  hitRateLabel: string;
  strengths: string[];
  concerns: string[];
}

export interface SimulationOutcomeReport {
  headline: string;
  executiveSummary: string;
  decisiveFactors: string[];
  sideAssessments: SimulationOutcomeSideAssessment[];
  turningPoints: SimulationOutcomeTurningPoint[];
  operationalRisks: string[];
  recommendations: string[];
}

export type SimulationOutcomeMode = "battle" | "bda";
export type SimulationOutcomeBdaReason = "focus_fire" | "non_combat";

export interface SimulationOutcomeBdaReport {
  actorName: string | null;
  modeReason: SimulationOutcomeBdaReason;
  modeReasonLabel: string;
  operationLabel: string;
  objectiveName: string | null;
  objectiveStatusLabel: string;
  targetSummary: string;
  assetMixSummary: string;
  assessedEffectLabel: string;
  assessedEffectScore: number;
  assessmentConfidenceLabel: string;
  assessmentConfidenceScore: number;
  damageLevelLabel: string;
  requiredEffectScore: number;
  missionThresholdMet: boolean;
  costScore: number;
  economicScore: number;
  deploymentFootprintLabel: string;
  deploymentAssessmentLabel: string;
  resourceEfficiencyLabel: string;
  tempoLabel: string;
  effectSummary: string;
  operatingPicture: string;
  averageTimeToFireSeconds: number | null;
  threatExposureScore: number;
  benchmarkInsight: string;
  benchmark: SimulationOutcomeBdaBenchmark | null;
  launchCount: number;
  confirmedHitCount: number;
  damageEventCount: number;
  killEventCount: number;
  impactEventCount: number;
  missionSuccessCount: number;
  captureProgress: number;
  shockIndex: number;
  dominantAxis: string;
  launchPlatformCount: number;
  launchedPlatformCount: number;
  keyObservations: string[];
  recommendations: string[];
  recentActions: string[];
}

export interface SimulationOutcomeBdaBenchmarkRun {
  runId: string;
  benchmarkKey: string;
  actorName: string | null;
  objectiveName: string | null;
  scenarioName: string;
  endedAtUnix: number;
  endedAtLabel: string;
  assessedEffectScore: number;
  requiredEffectScore: number;
  missionThresholdMet: boolean;
  economicScore: number;
  costScore: number;
  launchCount: number;
  launchedPlatformCount: number;
  deploymentFootprintLabel: string;
  objectiveStatusLabel: string;
  assessmentConfidenceLabel: string;
}

export interface SimulationOutcomeBdaBenchmark {
  benchmarkKey: string;
  currentRunId: string;
  comparisonCount: number;
  bestValueRunId: string | null;
  maxEffectRunId: string | null;
  leanestQualifiedRunId: string | null;
  currentRunRank: number | null;
  runs: SimulationOutcomeBdaBenchmarkRun[];
}

export type SimulationOutcomeEndReasonDetail =
  | "in_progress"
  | "time_limit"
  | "single_side_remaining"
  | "no_active_sides";

export interface SimulationOutcomeSummary {
  scenarioName: string;
  reportMode: SimulationOutcomeMode;
  endReason: string;
  endReasonDetail: SimulationOutcomeEndReasonDetail;
  activeSideIds: string[];
  activeSideNames: string[];
  activeSideSummary: string;
  endedAtUnix: number;
  endedAtLabel: string;
  winnerName: string | null;
  winnerBasis: string;
  isTie: boolean;
  scoreGap: number;
  sides: SimulationOutcomeSideSummary[];
  recentLogs: string[];
  report: SimulationOutcomeReport;
  bdaReport: SimulationOutcomeBdaReport | null;
  fallbackSummary: string;
}

export type SimulationOutcomeNarrativeSource = "llm" | "fallback";

export interface SimulationOutcomeNarrative {
  text: string;
  source: SimulationOutcomeNarrativeSource;
}

