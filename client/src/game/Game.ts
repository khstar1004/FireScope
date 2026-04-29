import {
  createDefaultFocusFireOperation,
  createDefaultFocusFireRerankerModel,
  Dba,
  PlaybackRecorder,
  RecordingPlayer,
  type Aircraft,
  type BattleSpectatorSnapshot,
  type FireRecommendationTargetPriority,
  type FocusFireLaunchPlatform,
  Scenario,
  type ReferencePoint,
  SimulationLogs,
  type FocusFireOperation,
  type FocusFireRecommendation,
  type FocusFireRecommendationTelemetryRecord,
  type FocusFireRerankerModel,
  type FocusFireSummary,
  type FocusFireWeaponTrack,
  type IAttackParams,
  type IMapView,
} from "./GameSupport";
import { installGameCoreMethods } from "./runtime/GameCoreMethods";
import { installGameFocusFireOperationMethods } from "./runtime/GameFocusFireOperationMethods";
import { installGameFocusFireRecommendationMethods } from "./runtime/GameFocusFireRecommendationMethods";
import { installGameFocusFireStateMethods } from "./runtime/GameFocusFireStateMethods";
import { installGameFocusFireTelemetryMethods } from "./runtime/GameFocusFireTelemetryMethods";
import { installGameScenarioEditingMethods } from "./runtime/GameScenarioEditingMethods";
import { installGameScenarioSerializationMethods } from "./runtime/GameScenarioSerializationMethods";
import { installGameSimulationMethods } from "./runtime/GameSimulationMethods";

export type {
  BattleSpectatorEntityType,
  BattleSpectatorEvent,
  BattleSpectatorPointSnapshot,
  BattleSpectatorSnapshot,
  BattleSpectatorUnitSnapshot,
  BattleSpectatorWeaponInventorySnapshot,
  BattleSpectatorWeaponSnapshot,
  FireRecommendationTargetPriority,
  FocusFireExecutionState,
  FocusFireFiringPlanItem,
  FocusFireLaunchPlatform,
  FocusFireLaunchVariant,
  FocusFireOperation,
  FocusFireRecommendation,
  FocusFireRecommendationOption,
  FocusFireRecommendationTelemetryOption,
  FocusFireRecommendationTelemetryRecord,
  FocusFireSummary,
  FocusFireTargetComposition,
  FocusFireWeaponTrack,
  GameDoneReason,
  GameDoneReasonDetail,
  GameStepInfo,
  GameStepResult,
  Mission,
} from "./GameSupport";

export class Game {
  [key: string]: any;

  mapView: IMapView = {
    defaultCenter: [0, 0],
    currentCameraCenter: [0, 0],
    defaultZoom: 0,
    currentCameraZoom: 0,
  };
  currentScenario: Scenario;
  currentSideId: string = "";
  scenarioPaused: boolean = true;
  recordingScenario: boolean = false;
  playbackRecorder: PlaybackRecorder = new PlaybackRecorder(10);
  recordingPlayer: RecordingPlayer = new RecordingPlayer();
  addingAircraft: boolean = false;
  addingAirbase: boolean = false;
  addingFacility: boolean = false;
  addingReferencePoint: boolean = false;
  addingShip: boolean = false;
  selectingTarget: boolean = false;
  currentAttackParams: IAttackParams = {
    autoAttack: false,
    currentAttackerId: "",
    currentWeaponId: "",
    currentWeaponQuantity: 0,
  };
  selectedUnitId: string = "";
  selectedUnitClassName: string | null = null;
  numberOfWaypoints: number = 50;
  godMode: boolean = true;
  eraserMode: boolean = false;
  history: string[] = [];
  unitDba: Dba = new Dba();
  demoMode: boolean = true; // flag for features that should be removed in the final product
  simulationLogs: SimulationLogs = new SimulationLogs();
  focusFireOperation: FocusFireOperation = createDefaultFocusFireOperation();
  focusFireRecommendationTelemetry: FocusFireRecommendationTelemetryRecord[] =
    [];
  private focusFireRecommendationTelemetrySignatures: Map<string, string> =
    new Map();
  focusFireRerankerEnabled: boolean = false;
  focusFireRerankerModel: FocusFireRerankerModel =
    createDefaultFocusFireRerankerModel();

  constructor(currentScenario: Scenario) {
    this.currentScenario = currentScenario;
  }
}

export interface Game {
  getBattleSpectatorSnapshot(maxEvents?: number): BattleSpectatorSnapshot;
  getFocusFireLaunchPlatforms(
    sideId?: string | null
  ): FocusFireLaunchPlatform[];
  getFocusFireWeaponTracks(objective?: ReferencePoint): FocusFireWeaponTrack[];
  getFocusFireRecommendationTelemetry(
    sideId?: string | null
  ): FocusFireRecommendationTelemetryRecord[];
  getFocusFireRerankerState(): {
    enabled: boolean;
    model: FocusFireRerankerModel;
    confidenceScore: number;
  };
  getFireRecommendationForTarget(
    targetId: string,
    sideId?: string,
    desiredEffectOverride?: number | null
  ): FocusFireRecommendation | null;
  getFireRecommendationTargetPriorities(
    sideId?: string,
    targetIds?: string[]
  ): FireRecommendationTargetPriority[];
  getFocusFireSummary(): FocusFireSummary;
  launchAircraftFromShip(shipId: string, aircraftIds: string[]): Aircraft[];
  launchAircraftFromAirbase(
    airbaseId: string,
    aircraftIds: string[]
  ): Aircraft[];
  setFocusFireObjective(
    latitude: number,
    longitude: number
  ): ReferencePoint | undefined;
  updateFocusFireOperation(): void;
}

installGameCoreMethods(Game);
installGameFocusFireStateMethods(Game);
installGameFocusFireTelemetryMethods(Game);
installGameFocusFireRecommendationMethods(Game);
installGameFocusFireOperationMethods(Game);
installGameScenarioEditingMethods(Game);
installGameScenarioSerializationMethods(Game);
installGameSimulationMethods(Game);

export default Game;
