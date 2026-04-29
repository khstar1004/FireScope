import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import Game, {
  type BattleSpectatorEntityType,
  type BattleSpectatorEvent,
  type BattleSpectatorUnitSnapshot,
  type BattleSpectatorWeaponSnapshot,
  type FocusFireLaunchPlatform,
  type FocusFireWeaponTrack,
} from "@/game/Game";
import {
  buildFocusFireInsight,
  buildSimulationOutcomeSummary,
  requestSimulationOutcomeNarrative,
  type SimulationOutcomeNarrativeSource,
  type SimulationOutcomeSummary,
} from "@/gui/analysis/operationInsight";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import {
  getBundleModelById,
  selectAssetExperienceModel,
  selectImmersiveExperienceModel,
} from "@/gui/experience/bundleModels";
import { buildImmersiveLiveTwinRuntime } from "@/gui/experience/immersiveLiveTwin";
import {
  inferImmersiveExperienceProfile,
  type ImmersiveExperienceProfile,
} from "@/gui/experience/immersiveExperience";
import BattleSpectatorHeroViewport, {
  type BattleSpectatorHeroViewportMetric,
  type BattleSpectatorHeroViewportState,
} from "@/gui/flightSim/BattleSpectatorHeroViewport";
import SimulationOutcomeDialog from "@/gui/shared/SimulationOutcomeDialog";
import {
  DEFAULT_JET_CRAFT_ID,
  getJetCraftCatalogEntry,
  isJetCraftId,
  JET_CRAFT_CATALOG,
  type JetCraftId,
} from "@/gui/flightSim/jetCraftCatalog";
import {
  hasFiniteFlightSimLocation,
  isInsideFlightSimKorea,
  normalizeFlightSimStartLocation,
} from "@/gui/flightSim/flightSimLocation";
import type { FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";
import BattleSpectatorScenarioSidebar from "@/gui/flightSim/BattleSpectatorScenarioSidebar";
import EntityIcon from "@/gui/map/toolbar/EntityIcon";
import ToolbarCollapsible from "@/gui/map/toolbar/ToolbarCollapsible";
import {
  isDroneAircraftClassName,
  isFiresFacilityClassName,
  isTankFacilityClassName,
  type ToolbarEntityType,
} from "@/utils/assetTypeCatalog";
import { GAME_SPEED_DELAY_MS } from "@/utils/constants";
import blankScenarioJson from "@/scenarios/blank_scenario.json";
import defaultScenarioJson from "@/scenarios/default_scenario.json";
import armyDemoScenarioJson from "@/scenarios/army_demo_1.json";
import focusedTrainingDemoJson from "@/scenarios/focused_training_demo.json";
import focusFireEconomyDemo from "@/scenarios/focusFireEconomyDemo";
import rlFirstSuccessDemoJson from "@/scenarios/rl_first_success_demo.json";
import rlBattleOptimizationDemoJson from "@/scenarios/rl_battle_optimization_demo.json";
import { strategicScenarioPresets } from "@/scenarios/iranVsUsScenarios";
import { randomUUID } from "@/utils/generateUUID";
import { resolvePublicAssetPath } from "@/utils/publicAssetUrl";
import {
  getOfflineMapRegion,
  getOfflineSatelliteTileUrl,
} from "@/gui/map/offlineMapConfig";

import FlightSimPageView from "./pageView/FlightSimPageView";
import { useFlightSimPageEffects } from "./hooks/useFlightSimPageEffects";

import {
  appendFocusFireQueryParams,
  applyBattleSpectatorFollowTargetSelection,
  AssetState,
  BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS,
  BATTLE_SPECTATOR_LOD_OPTIONS,
  BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS,
  BattleSpectatorAlertRow,
  BattleSpectatorAssetRiskRow,
  BattleSpectatorBriefing,
  BattleSpectatorBriefingAction,
  BattleSpectatorBriefingLogEntry,
  BattleSpectatorCameraProfile,
  battleSpectatorCopy,
  BattleSpectatorDockTab,
  BattleSpectatorHotspotRow,
  BattleSpectatorImpactTimelineRow,
  BattleSpectatorInspectTarget,
  BattleSpectatorLodLevel,
  BattleSpectatorPatrolTarget,
  BattleSpectatorPatrolTargetKind,
  BattleSpectatorPriorityFilter,
  BattleSpectatorRuntimeSelectionPayload,
  BattleSpectatorSelectedUnitInsight,
  BattleSpectatorSidebarEntry,
  BattleSpectatorSideTrendEntry,
  BattleSpectatorSideTrendSnapshot,
  BattleSpectatorState,
  BattleSpectatorTempoRow,
  BattleSpectatorTrajectoryRow,
  buildBattleSpectatorActivitySummary,
  buildBattleSpectatorAlertRows,
  buildBattleSpectatorAssetRiskRows,
  buildBattleSpectatorBriefing,
  buildBattleSpectatorHeroFallbackFeed,
  buildBattleSpectatorHeroRelatedEventItems,
  buildBattleSpectatorHeroUnitAsset,
  buildBattleSpectatorHeroView,
  buildBattleSpectatorHeroWeaponAsset,
  buildBattleSpectatorHotspotRows,
  buildBattleSpectatorImpactTimelineRows,
  buildBattleSpectatorInitiativeSummary,
  buildBattleSpectatorPatrolTargets,
  buildBattleSpectatorPatrolUnitTargets,
  buildBattleSpectatorPowerHistoryBars,
  buildBattleSpectatorRuntimeSignature,
  buildBattleSpectatorSaturationTargetIds,
  buildBattleSpectatorSelectedUnitInsight,
  buildBattleSpectatorSideTrendHistoryEntry,
  buildBattleSpectatorSideTrendRows,
  buildBattleSpectatorState,
  buildBattleSpectatorStateSignature,
  buildBattleSpectatorStats,
  buildBattleSpectatorTempoRows,
  buildBattleSpectatorThreatRows,
  buildBattleSpectatorTrajectoryRows,
  buildFocusFireAirwatchState,
  clampBattleSpectatorValue,
  craftCopy,
  CraftMode,
  distanceKmBetweenBattleSpectatorPoints,
  estimateBattleSpectatorTimeToImpactSec,
  filterBattleSpectatorAssetRiskRows,
  filterBattleSpectatorImpactTimelineRows,
  filterBattleSpectatorState,
  filterBattleSpectatorTrajectoryRows,
  FLIGHT_SIM_ENTRY,
  FLIGHT_SIM_REVISION,
  FLIGHT_SIM_SCENARIO_ID_REFRESH_PRESET_NAMES,
  FLIGHT_SIM_SCENARIO_NAME_REGEX,
  FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS,
  FlightSimPageProps,
  FlightSimRuntimeInfo,
  FlightSimScenarioPresetDefinition,
  FocusFireAirwatchState,
  formatBattleSpectatorAltitude,
  formatBattleSpectatorCameraProfileLabel,
  formatBattleSpectatorDistanceKm,
  formatBattleSpectatorEntityType,
  formatBattleSpectatorEta,
  formatBattleSpectatorFuelFraction,
  formatBattleSpectatorHeading,
  formatBattleSpectatorHp,
  formatBattleSpectatorRangeNm,
  formatBattleSpectatorThreatRadius,
  formatBattleSpectatorTimestamp,
  formatRuntimeProviderLabel,
  formatRuntimeProviderTone,
  formatScriptStatus,
  formatViewerStatus,
  getBattleSpectatorHpTone,
  getBattleSpectatorPatrolTargetTone,
  getBattleSpectatorSideCssColor,
  getBattleSpectatorTrendTone,
  hasFiniteBattleSpectatorPoint,
  hasFocusFireObjective,
  isBattleSpectatorImpactEvent,
  isBattleSpectatorLaunchEvent,
  isBattleSpectatorRotaryWingAsset,
  isBattleSpectatorTrajectoryWeapon,
  NON_TRAJECTORY_WEAPON_SIGNATURE,
  parseBattleSpectatorFollowTargetId,
  resolveBattleSpectatorEventJumpPoint,
  resolveBattleSpectatorFollowTargetCameraProfile,
  resolveBattleSpectatorHeroContextAsset,
  resolveBattleSpectatorHeroOperationMode,
  resolveBattleSpectatorHeroProfileForUnit,
  resolveBattleSpectatorHeroWeaponProfile,
  resolveBattleSpectatorInspectTarget,
  resolveBattleSpectatorJumpPoint,
  resolveBattleSpectatorOverviewPoint,
  resolveBattleSpectatorPatrolUnitPreset,
  resolveBattleSpectatorPatrolUnitPriority,
  resolveBattleSpectatorSceneEntryLabel,
  resolveBattleSpectatorSceneFocusFraming,
  resolveBattleSpectatorSideJumpPoint,
  resolveBattleSpectatorThreatRadiusMeters,
  resolveBattleSpectatorTrajectoryTargetUnit,
  resolveBattleSpectatorUnitCameraProfile,
  resolveBattleSpectatorUnitFocusFraming,
  resolveBattleSpectatorUnitIconType,
  resolveBattleSpectatorUnitJumpPoint,
  resolveBattleSpectatorWeaponFocusFraming,
  resolveBattleSpectatorWeaponJumpPoint,
  resolveInitialBattleSpectatorPanelOpen,
  resolveInitialJetCraftId,
  roundBattleSpectatorSignatureNumber,
  sanitizeFlightSimScenarioFilename,
  TRAJECTORY_WEAPON_SIGNATURE,
} from "./page";

export default function FlightSimPage({
  onBack,
  initialCraft,
  initialLocation,
  game,
  continueSimulation = false,
  battleSpectator,
  focusFireAirwatch,
  offlineDemoMode = false,
}: Readonly<FlightSimPageProps>) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const battleSpectatorScenarioFileInputRef = useRef<HTMLInputElement | null>(
    null
  );
  const simulationOutcomeRequestIdRef = useRef(0);
  const battleSpectatorAutoCaptureKeyRef = useRef("");
  const battleSpectatorPatrolIndexRef = useRef(0);
  const battleSpectatorInitialJumpScenarioRef = useRef("");
  const battleSpectatorInitialFollowSeededRef = useRef(false);
  const battleSpectatorInitialScenarioSnapshotRef = useRef<string | null>(null);
  const battleSpectatorScenarioRestartedRef = useRef(false);
  const battleSpectatorStateSignatureRef = useRef("");
  const battleSpectatorRuntimeSignatureRef = useRef("");
  const battleSpectatorBriefingLogSignatureRef = useRef("");
  const battleSpectatorOverviewSectionRef = useRef<HTMLDivElement | null>(null);
  const battleSpectatorBriefingSectionRef = useRef<HTMLDivElement | null>(null);
  const battleSpectatorEngagementSectionRef = useRef<HTMLDivElement | null>(
    null
  );
  const battleSpectatorAnalysisSectionRef = useRef<HTMLDivElement | null>(null);
  const [assetState, setAssetState] = useState<AssetState>("checking");
  const [runtimeInfo, setRuntimeInfo] = useState<FlightSimRuntimeInfo | null>(
    null
  );
  const [runtimeProvider, setRuntimeProvider] = useState<
    "checking" | "vworld-webgl" | "cesium-fallback" | "unknown"
  >("checking");
  const [flightSimFrameReady, setFlightSimFrameReady] = useState(false);
  const battleSpectatorEnabled = battleSpectator !== undefined;
  const focusFireAirwatchEnabled = hasFocusFireObjective(focusFireAirwatch);
  const initialBattleSpectatorState = battleSpectatorEnabled
    ? buildBattleSpectatorState(game, continueSimulation, battleSpectator)
    : undefined;
  const [battleSpectatorPanelOpen, setBattleSpectatorPanelOpen] = useState(
    () => !battleSpectatorEnabled || resolveInitialBattleSpectatorPanelOpen()
  );
  const [battleSpectatorDockTab, setBattleSpectatorDockTab] =
    useState<BattleSpectatorDockTab>("engagements");
  const [currentBattleSpectator, setCurrentBattleSpectator] = useState<
    BattleSpectatorState | undefined
  >(() => initialBattleSpectatorState);
  const [currentFocusFireAirwatch, setCurrentFocusFireAirwatch] = useState<
    FocusFireAirwatchState | undefined
  >(() =>
    focusFireAirwatchEnabled
      ? buildFocusFireAirwatchState(game, continueSimulation, focusFireAirwatch)
      : undefined
  );
  const [battleSpectatorSideFilter, setBattleSpectatorSideFilter] =
    useState<string>("all");
  const [battleSpectatorFollowTargetId, setBattleSpectatorFollowTargetId] =
    useState(
      () =>
        resolveBattleSpectatorJumpPoint(initialBattleSpectatorState)
          ?.followTargetId ?? ""
    );
  const [
    battleSpectatorPinnedInspectTargetId,
    setBattleSpectatorPinnedInspectTargetId,
  ] = useState("");
  const [battleSpectatorHeroTargetId, setBattleSpectatorHeroTargetId] =
    useState("");
  const [battleSpectatorCameraProfile, setBattleSpectatorCameraProfile] =
    useState<BattleSpectatorCameraProfile>("tactical");
  const [battleSpectatorLodLevel, setBattleSpectatorLodLevel] =
    useState<BattleSpectatorLodLevel>("balanced");
  const [battleSpectatorAutoCapture, setBattleSpectatorAutoCapture] =
    useState(false);
  const [battleSpectatorAutoPatrol, setBattleSpectatorAutoPatrol] =
    useState(false);
  const [
    battleSpectatorHighlightedPatrolTargetId,
    setBattleSpectatorHighlightedPatrolTargetId,
  ] = useState("");
  const [battleSpectatorPriorityFilter, setBattleSpectatorPriorityFilter] =
    useState<BattleSpectatorPriorityFilter>("all");
  const [battleSpectatorBriefingLog, setBattleSpectatorBriefingLog] = useState<
    BattleSpectatorBriefingLogEntry[]
  >([]);
  const [battleSpectatorTrendHistory, setBattleSpectatorTrendHistory] =
    useState<BattleSpectatorSideTrendEntry[]>([]);
  const [
    battleSpectatorSimulationRevision,
    setBattleSpectatorSimulationRevision,
  ] = useState(0);
  const [
    battleSpectatorPresetListExpanded,
    setBattleSpectatorPresetListExpanded,
  ] = useState(false);
  const [selectedMode, setSelectedMode] = useState<CraftMode>(
    battleSpectatorEnabled || initialCraft === "drone" ? "drone" : "jet"
  );
  const [selectedJetCraftId, setSelectedJetCraftId] = useState<JetCraftId>(
    resolveInitialJetCraftId(initialCraft)
  );
  const [simulationOutcomeSummary, setSimulationOutcomeSummary] =
    useState<SimulationOutcomeSummary | null>(null);
  const [simulationOutcomeNarrative, setSimulationOutcomeNarrative] =
    useState("");
  const [
    simulationOutcomeNarrativeSource,
    setSimulationOutcomeNarrativeSource,
  ] = useState<SimulationOutcomeNarrativeSource>("fallback");
  const [simulationOutcomeLoading, setSimulationOutcomeLoading] =
    useState(false);
  const [simulationOutcomeOpen, setSimulationOutcomeOpen] = useState(false);
  const offlineMapRegion = offlineDemoMode
    ? getOfflineMapRegion({
        forceOffline: true,
      })
    : null;
  const iframeParams = new URLSearchParams();
  const hasInitialStartLocation = hasFiniteFlightSimLocation(initialLocation);
  const normalizedInitialLocation =
    normalizeFlightSimStartLocation(initialLocation);
  const startsInKorea =
    hasInitialStartLocation &&
    isInsideFlightSimKorea(initialLocation.lon, initialLocation.lat);
  const showBattleSpectator = currentBattleSpectator !== undefined;
  const showFocusFireAirwatch =
    focusFireAirwatchEnabled && hasFocusFireObjective(currentFocusFireAirwatch);
  const battleSpectatorSideOptions = useMemo(() => {
    if (!currentBattleSpectator) {
      return [];
    }

    const sideMap = new Map<string, { id: string; name: string }>();
    currentBattleSpectator.units.forEach((unit) => {
      if (!sideMap.has(unit.sideId)) {
        sideMap.set(unit.sideId, {
          id: unit.sideId,
          name: unit.sideName,
        });
      }
    });

    return [...sideMap.values()];
  }, [currentBattleSpectator]);
  const visibleBattleSpectator = useMemo(() => {
    if (!currentBattleSpectator) {
      return undefined;
    }

    return filterBattleSpectatorState(
      currentBattleSpectator,
      battleSpectatorSideFilter
    );
  }, [battleSpectatorSideFilter, currentBattleSpectator]);
  const displayedBattleSpectator =
    visibleBattleSpectator ?? currentBattleSpectator;
  const battleSpectatorHasScenarioControls =
    showBattleSpectator && Boolean(game);
  const battleSpectatorScenarioName =
    game?.currentScenario?.name ??
    displayedBattleSpectator?.scenarioName ??
    "시나리오";
  const battleSpectatorScenarioPaused = game?.scenarioPaused ?? true;
  const battleSpectatorScenarioTimeCompression = Math.max(
    1,
    Number(game?.currentScenario?.timeCompression) || 1
  );
  const visibleBattleSpectatorScenarioPresets =
    battleSpectatorPresetListExpanded
      ? FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS
      : FLIGHT_SIM_SCENARIO_PRESET_DEFINITIONS.slice(0, 6);
  const followTargetOptions = useMemo(() => {
    const units =
      visibleBattleSpectator?.units.length ||
      battleSpectatorSideFilter !== "all"
        ? (visibleBattleSpectator?.units ?? [])
        : (currentBattleSpectator?.units ?? []);
    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorFollowTargetId
    );
    const trackedUnitId =
      parsedFollowTarget?.type === "unit" ? parsedFollowTarget.id : "";
    const sortedUnits = [...units].sort((left, right) => {
      const leftTracked = left.id === trackedUnitId;
      const rightTracked = right.id === trackedUnitId;
      if (leftTracked !== rightTracked) {
        return leftTracked ? -1 : 1;
      }
      if (left.selected !== right.selected) {
        return left.selected ? -1 : 1;
      }
      if (left.weaponCount !== right.weaponCount) {
        return right.weaponCount - left.weaponCount;
      }
      return left.name.localeCompare(right.name, "ko-KR");
    });

    const weapons = visibleBattleSpectator?.weapons ?? [];
    const recentWeapons = weapons
      .slice(Math.max(0, weapons.length - 8))
      .reverse();

    return [
      ...sortedUnits.map((unit) => ({
        id: `unit:${unit.id}`,
        label: `[${unit.sideName}] ${unit.name}`,
      })),
      ...recentWeapons.map((weapon) => ({
        id: `weapon:${weapon.id}`,
        label: `[탄체] ${weapon.name}`,
      })),
    ];
  }, [
    battleSpectatorFollowTargetId,
    battleSpectatorSideFilter,
    currentBattleSpectator?.units,
    visibleBattleSpectator?.weapons,
    visibleBattleSpectator?.units,
  ]);
  const selectedBattleSpectatorUnit = useMemo(() => {
    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorPinnedInspectTargetId || battleSpectatorFollowTargetId
    );
    if (parsedFollowTarget?.type === "unit") {
      const followedUnit = visibleBattleSpectator?.units.find(
        (unit) => unit.id === parsedFollowTarget.id
      );
      if (followedUnit) {
        return followedUnit;
      }
    }

    return visibleBattleSpectator?.units.find((unit) => unit.selected);
  }, [
    battleSpectatorFollowTargetId,
    battleSpectatorPinnedInspectTargetId,
    visibleBattleSpectator,
  ]);
  const allBattleSpectatorUnitsById = useMemo(
    () =>
      new Map(
        (currentBattleSpectator?.units ?? []).map(
          (unit) => [unit.id, unit] as const
        )
      ),
    [currentBattleSpectator?.units]
  );
  const allBattleSpectatorWeaponsById = useMemo(
    () =>
      new Map(
        (currentBattleSpectator?.weapons ?? []).map(
          (weapon) => [weapon.id, weapon] as const
        )
      ),
    [currentBattleSpectator?.weapons]
  );
  const allBattleSpectatorTrajectoryRows = useMemo(
    () =>
      buildBattleSpectatorTrajectoryRows(
        currentBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, currentBattleSpectator]
  );
  const allBattleSpectatorImpactTimelineRows = useMemo(
    () =>
      buildBattleSpectatorImpactTimelineRows(allBattleSpectatorTrajectoryRows),
    [allBattleSpectatorTrajectoryRows]
  );
  const battleSpectatorInspectTargetId =
    battleSpectatorPinnedInspectTargetId || battleSpectatorFollowTargetId;
  const inspectedBattleSpectatorTarget =
    useMemo<BattleSpectatorInspectTarget | null>(
      () =>
        resolveBattleSpectatorInspectTarget(
          battleSpectatorInspectTargetId,
          currentBattleSpectator,
          allBattleSpectatorUnitsById,
          allBattleSpectatorWeaponsById,
          allBattleSpectatorTrajectoryRows,
          allBattleSpectatorImpactTimelineRows
        ),
      [
        allBattleSpectatorImpactTimelineRows,
        allBattleSpectatorTrajectoryRows,
        allBattleSpectatorUnitsById,
        allBattleSpectatorWeaponsById,
        battleSpectatorInspectTargetId,
        currentBattleSpectator,
      ]
    );
  const battleSpectatorHeroTarget =
    useMemo<BattleSpectatorInspectTarget | null>(
      () =>
        resolveBattleSpectatorInspectTarget(
          battleSpectatorHeroTargetId,
          currentBattleSpectator,
          allBattleSpectatorUnitsById,
          allBattleSpectatorWeaponsById,
          allBattleSpectatorTrajectoryRows,
          allBattleSpectatorImpactTimelineRows
        ),
      [
        allBattleSpectatorImpactTimelineRows,
        allBattleSpectatorTrajectoryRows,
        allBattleSpectatorUnitsById,
        allBattleSpectatorWeaponsById,
        battleSpectatorHeroTargetId,
        currentBattleSpectator,
      ]
    );
  const battleSpectatorHeroView = useMemo(
    () =>
      buildBattleSpectatorHeroView(
        battleSpectatorHeroTarget,
        battleSpectatorCameraProfile,
        currentBattleSpectator
      ),
    [
      battleSpectatorCameraProfile,
      battleSpectatorHeroTarget,
      currentBattleSpectator,
    ]
  );
  const inspectedBattleSpectatorTargetTone = useMemo(() => {
    if (!inspectedBattleSpectatorTarget) {
      return "#7fe7ff";
    }

    return getBattleSpectatorSideCssColor(
      inspectedBattleSpectatorTarget.kind === "unit"
        ? inspectedBattleSpectatorTarget.unit.sideColor
        : inspectedBattleSpectatorTarget.weapon.sideColor
    );
  }, [inspectedBattleSpectatorTarget]);
  const inspectedBattleSpectatorTargetIconType = useMemo<
    ToolbarEntityType | "weapon"
  >(() => {
    if (!inspectedBattleSpectatorTarget) {
      return "referencePoint";
    }

    return inspectedBattleSpectatorTarget.kind === "unit"
      ? resolveBattleSpectatorUnitIconType(inspectedBattleSpectatorTarget.unit)
      : "weapon";
  }, [inspectedBattleSpectatorTarget]);
  useEffect(() => {
    if (battleSpectatorHeroTargetId && !battleSpectatorHeroView) {
      setBattleSpectatorHeroTargetId("");
    }
  }, [battleSpectatorHeroTargetId, battleSpectatorHeroView]);
  const selectedBattleSpectatorInsight = useMemo(
    () =>
      buildBattleSpectatorSelectedUnitInsight(
        selectedBattleSpectatorUnit,
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [
      allBattleSpectatorUnitsById,
      selectedBattleSpectatorUnit,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorThreatRows = useMemo(
    () =>
      buildBattleSpectatorThreatRows(
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, visibleBattleSpectator]
  );
  const battleSpectatorHotspotRows = useMemo(
    () => buildBattleSpectatorHotspotRows(visibleBattleSpectator),
    [visibleBattleSpectator]
  );
  const battleSpectatorTempoRows = useMemo(
    () =>
      buildBattleSpectatorTempoRows(
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, visibleBattleSpectator]
  );
  const battleSpectatorTrajectoryRows = useMemo(
    () =>
      buildBattleSpectatorTrajectoryRows(
        visibleBattleSpectator,
        allBattleSpectatorUnitsById
      ),
    [allBattleSpectatorUnitsById, visibleBattleSpectator]
  );
  const battleSpectatorAlertRows = useMemo(
    () =>
      buildBattleSpectatorAlertRows({
        state: visibleBattleSpectator,
        trajectoryRows: battleSpectatorTrajectoryRows,
        hotspotRows: battleSpectatorHotspotRows,
      }),
    [
      battleSpectatorHotspotRows,
      battleSpectatorTrajectoryRows,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorImpactTimelineRows = useMemo(
    () => buildBattleSpectatorImpactTimelineRows(battleSpectatorTrajectoryRows),
    [battleSpectatorTrajectoryRows]
  );
  const battleSpectatorAssetRiskRows = useMemo(
    () =>
      buildBattleSpectatorAssetRiskRows({
        state: visibleBattleSpectator,
        trajectoryRows: battleSpectatorTrajectoryRows,
        allUnitsById: allBattleSpectatorUnitsById,
      }),
    [
      allBattleSpectatorUnitsById,
      battleSpectatorTrajectoryRows,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorSaturationTargetIds = useMemo(
    () => buildBattleSpectatorSaturationTargetIds(battleSpectatorAssetRiskRows),
    [battleSpectatorAssetRiskRows]
  );
  const filteredBattleSpectatorTrajectoryRows = useMemo(
    () =>
      filterBattleSpectatorTrajectoryRows(
        battleSpectatorTrajectoryRows,
        battleSpectatorPriorityFilter,
        battleSpectatorSaturationTargetIds
      ),
    [
      battleSpectatorPriorityFilter,
      battleSpectatorSaturationTargetIds,
      battleSpectatorTrajectoryRows,
    ]
  );
  const filteredBattleSpectatorImpactTimelineRows = useMemo(
    () =>
      filterBattleSpectatorImpactTimelineRows(
        battleSpectatorImpactTimelineRows,
        battleSpectatorPriorityFilter,
        battleSpectatorSaturationTargetIds
      ),
    [
      battleSpectatorImpactTimelineRows,
      battleSpectatorPriorityFilter,
      battleSpectatorSaturationTargetIds,
    ]
  );
  const filteredBattleSpectatorAssetRiskRows = useMemo(
    () =>
      filterBattleSpectatorAssetRiskRows(
        battleSpectatorAssetRiskRows,
        battleSpectatorPriorityFilter
      ),
    [battleSpectatorAssetRiskRows, battleSpectatorPriorityFilter]
  );
  const battleSpectatorOverviewPoint = useMemo(
    () => resolveBattleSpectatorOverviewPoint(displayedBattleSpectator),
    [displayedBattleSpectator]
  );
  const latestBattleEngagementPoint = useMemo(
    () => resolveBattleSpectatorJumpPoint(visibleBattleSpectator),
    [visibleBattleSpectator]
  );
  const latestBattleSpectatorWeapon = useMemo(() => {
    const weapons = visibleBattleSpectator?.weapons ?? [];
    return weapons.length > 0 ? weapons[weapons.length - 1] : undefined;
  }, [visibleBattleSpectator]);
  const latestTrackableBattleSpectatorEvent = useMemo(
    () =>
      [...(visibleBattleSpectator?.recentEvents ?? [])]
        .reverse()
        .find((event) => resolveBattleSpectatorEventJumpPoint(event)),
    [visibleBattleSpectator]
  );
  const battleSpectatorPatrolTargets = useMemo(
    () =>
      buildBattleSpectatorPatrolTargets({
        state: visibleBattleSpectator,
        impactTimelineRows: battleSpectatorImpactTimelineRows,
        alertRows: battleSpectatorAlertRows,
        latestEngagementPoint: latestBattleEngagementPoint ?? undefined,
      }),
    [
      battleSpectatorAlertRows,
      battleSpectatorImpactTimelineRows,
      latestBattleEngagementPoint,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorSidebarEntries = useMemo(() => {
    const sceneEntries = battleSpectatorPatrolTargets
      .filter((target) =>
        ["impact", "hotspot", "engagement"].includes(target.kind)
      )
      .map((target) => ({
        id: target.id,
        label: resolveBattleSpectatorSceneEntryLabel(target),
        detail:
          target.kind === "impact"
            ? "폭격/착탄 지점 시점"
            : target.kind === "hotspot"
              ? "교전 집중 지점 시점"
              : "최신 교전 시점",
        iconType:
          target.kind === "impact"
            ? ("weapon" as const)
            : ("referencePoint" as const),
        iconColor: getBattleSpectatorPatrolTargetTone(target.kind),
        point: target.point,
        followTargetId: target.followTargetId,
        cameraProfile: target.cameraProfile ?? "side",
        sourceKind: "scene" as const,
        durationSeconds: target.durationSeconds,
        headingDegrees: target.headingDegrees,
        pitchDegrees: target.pitchDegrees,
        rangeMeters: target.rangeMeters,
      }));

    const parsedFollowTarget = parseBattleSpectatorFollowTargetId(
      battleSpectatorFollowTargetId
    );
    const trackedUnitId =
      parsedFollowTarget?.type === "unit" ? parsedFollowTarget.id : "";
    const sortedUnits = [...(visibleBattleSpectator?.units ?? [])].sort(
      (left, right) => {
        const leftTracked = left.id === trackedUnitId;
        const rightTracked = right.id === trackedUnitId;
        if (leftTracked !== rightTracked) {
          return leftTracked ? -1 : 1;
        }
        if (left.selected !== right.selected) {
          return left.selected ? -1 : 1;
        }
        const leftPreset = resolveBattleSpectatorPatrolUnitPreset(left);
        const rightPreset = resolveBattleSpectatorPatrolUnitPreset(right);
        if (Boolean(leftPreset) !== Boolean(rightPreset)) {
          return leftPreset ? -1 : 1;
        }
        if (left.weaponCount !== right.weaponCount) {
          return right.weaponCount - left.weaponCount;
        }
        return left.name.localeCompare(right.name, "ko-KR");
      }
    );

    const unitEntries = sortedUnits.map((unit) => {
      const preset = resolveBattleSpectatorPatrolUnitPreset(unit);
      const framing = resolveBattleSpectatorUnitFocusFraming(unit);

      return {
        id: `sidebar-unit-${unit.id}`,
        label: unit.name,
        detail: `${preset?.label ?? `${formatBattleSpectatorEntityType(unit.entityType)} 시점`} · ${unit.sideName}`,
        iconType: resolveBattleSpectatorUnitIconType(unit),
        iconColor: getBattleSpectatorSideCssColor(unit.sideColor),
        point: resolveBattleSpectatorUnitJumpPoint(unit),
        followTargetId: `unit:${unit.id}`,
        cameraProfile: preset?.cameraProfile ?? "chase",
        sourceKind: "unit" as const,
        durationSeconds: framing.durationSeconds,
        headingDegrees: framing.headingDegrees,
        pitchDegrees: framing.pitchDegrees,
        rangeMeters: framing.rangeMeters,
      };
    });

    return [...sceneEntries, ...unitEntries];
  }, [
    battleSpectatorFollowTargetId,
    battleSpectatorPatrolTargets,
    visibleBattleSpectator,
  ]);
  const battleSpectatorHighlightedPatrolTarget = useMemo(
    () =>
      battleSpectatorPatrolTargets.find(
        (target) => target.id === battleSpectatorHighlightedPatrolTargetId
      ) ?? null,
    [battleSpectatorHighlightedPatrolTargetId, battleSpectatorPatrolTargets]
  );
  const battleSpectatorActivitySummary = useMemo(
    () => buildBattleSpectatorActivitySummary(displayedBattleSpectator),
    [displayedBattleSpectator]
  );
  const battleSpectatorSideTrendRows = useMemo(
    () =>
      buildBattleSpectatorSideTrendRows(
        battleSpectatorTrendHistory,
        battleSpectatorSideFilter
      ),
    [battleSpectatorSideFilter, battleSpectatorTrendHistory]
  );
  const battleSpectatorInitiativeSummary = useMemo(
    () => buildBattleSpectatorInitiativeSummary(battleSpectatorSideTrendRows),
    [battleSpectatorSideTrendRows]
  );
  const battleSpectatorBriefing = useMemo(
    () =>
      buildBattleSpectatorBriefing({
        state: visibleBattleSpectator,
        initiativeSummary: battleSpectatorInitiativeSummary,
        alertRows: battleSpectatorAlertRows,
        impactTimelineRows: battleSpectatorImpactTimelineRows,
        assetRiskRows: battleSpectatorAssetRiskRows,
        hotspotRows: battleSpectatorHotspotRows,
        trajectoryRows: battleSpectatorTrajectoryRows,
      }),
    [
      battleSpectatorAlertRows,
      battleSpectatorAssetRiskRows,
      battleSpectatorHotspotRows,
      battleSpectatorImpactTimelineRows,
      battleSpectatorInitiativeSummary,
      battleSpectatorTrajectoryRows,
      visibleBattleSpectator,
    ]
  );
  const battleSpectatorPriorityFilterOption = useMemo(
    () =>
      BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS.find(
        (option) => option.id === battleSpectatorPriorityFilter
      ) ?? BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS[0],
    [battleSpectatorPriorityFilter]
  );
  const runtimeProviderLabel = useMemo(
    () => formatRuntimeProviderLabel(runtimeProvider),
    [runtimeProvider]
  );
  const runtimeProviderTone = useMemo(
    () => formatRuntimeProviderTone(runtimeProvider),
    [runtimeProvider]
  );
  const battleSpectatorRuntimeReady =
    showBattleSpectator &&
    assetState === "ready" &&
    flightSimFrameReady &&
    (runtimeInfo?.startup?.readyForSimulation ?? true);
  const loadingOverlayVisible = showBattleSpectator
    ? !battleSpectatorRuntimeReady
    : assetState !== "ready" || !flightSimFrameReady;
  const battleSpectatorCameraProfileOption = useMemo(
    () =>
      BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS.find(
        (option) => option.id === battleSpectatorCameraProfile
      ) ?? BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS[0],
    [battleSpectatorCameraProfile]
  );
  const battleSpectatorFollowTargetLabel = useMemo(() => {
    if (!showBattleSpectator || !battleSpectatorFollowTargetId) {
      return "자유 시점";
    }

    return (
      followTargetOptions.find(
        (option) => option.id === battleSpectatorFollowTargetId
      )?.label ?? "추적 대상 확인 중"
    );
  }, [battleSpectatorFollowTargetId, followTargetOptions, showBattleSpectator]);

  iframeParams.set("lon", normalizedInitialLocation.lon.toFixed(6));
  iframeParams.set("lat", normalizedInitialLocation.lat.toFixed(6));
  iframeParams.set(
    "craft",
    selectedMode === "drone" ? "drone" : selectedJetCraftId
  );
  iframeParams.set("rev", FLIGHT_SIM_REVISION);
  if (battleSpectatorEnabled) {
    iframeParams.set("battleSpectator", "1");
  }
  if (offlineMapRegion) {
    iframeParams.set("offlineMap", offlineMapRegion.id);
    iframeParams.set("offlineMapLabel", offlineMapRegion.label);
    iframeParams.set(
      "offlineImageryTileUrl",
      getOfflineSatelliteTileUrl(offlineMapRegion, {
        localOnly: offlineDemoMode,
      })
    );
  }
  appendFocusFireQueryParams(iframeParams, currentFocusFireAirwatch);

  const iframeSrc = iframeParams.toString()
    ? `${FLIGHT_SIM_ENTRY}?${iframeParams.toString()}`
    : FLIGHT_SIM_ENTRY;
  const selectedCraftCopy = battleSpectatorEnabled
    ? battleSpectatorCopy
    : craftCopy[selectedMode];
  const selectedJetCraft = getJetCraftCatalogEntry(selectedJetCraftId);
  const selectedFlightSimTitle = battleSpectatorEnabled
    ? "전장 3D 관전"
    : selectedMode === "drone"
      ? "드론 시뮬레이터"
      : `${selectedJetCraft.label} 시뮬레이터`;
  const loadingStatusLabel = battleSpectatorEnabled
    ? assetState === "missing"
      ? "전장 관전 자산을 찾을 수 없습니다."
      : runtimeInfo?.startup?.loadingMessage?.trim() ||
        "전장 관전 화면을 불러오는 중..."
    : assetState === "missing"
      ? "항공 시뮬레이터 자산을 찾을 수 없습니다."
      : "항공 시뮬레이터를 불러오는 중...";
  const focusFireInsight = useMemo(() => {
    if (!currentFocusFireAirwatch) {
      return null;
    }

    return buildFocusFireInsight({
      active: currentFocusFireAirwatch.active ?? false,
      captureProgress: currentFocusFireAirwatch.captureProgress ?? 0,
      aircraftCount: currentFocusFireAirwatch.aircraftCount ?? 0,
      artilleryCount: currentFocusFireAirwatch.artilleryCount ?? 0,
      armorCount: currentFocusFireAirwatch.armorCount ?? 0,
      weaponsInFlight: currentFocusFireAirwatch.weaponsInFlight ?? 0,
    });
  }, [currentFocusFireAirwatch]);

  const postRuntimeToFlightSim = (
    type:
      | "vista-focus-fire-update"
      | "vista-focus-fire-command"
      | "vista-battle-spectator-update"
      | "vista-battle-spectator-command",
    payload: Record<string, unknown>
  ) => {
    if (!iframeRef.current?.contentWindow) {
      return;
    }

    iframeRef.current.contentWindow.postMessage(
      { type, payload },
      window.location.origin
    );
  };

  const jumpToBattleSpectatorPoint = (
    point: {
      longitude: number;
      latitude: number;
      altitudeMeters: number;
    },
    options?: {
      cameraProfile?: BattleSpectatorCameraProfile;
      durationSeconds?: number;
      headingDegrees?: number;
      pitchDegrees?: number;
      rangeMeters?: number;
    }
  ) => {
    if (showBattleSpectator && !battleSpectatorRuntimeReady) {
      return;
    }

    postRuntimeToFlightSim("vista-battle-spectator-command", {
      command: "jump-to-point",
      longitude: point.longitude,
      latitude: point.latitude,
      altitudeMeters: point.altitudeMeters,
      durationSeconds: options?.durationSeconds ?? 1.8,
      cameraProfile: options?.cameraProfile ?? battleSpectatorCameraProfile,
      headingDegrees: options?.headingDegrees,
      pitchDegrees: options?.pitchDegrees,
      rangeMeters: options?.rangeMeters,
    });
  };

  const closeBattleSpectatorPanelOnMobile = () => {
    if (
      showBattleSpectator &&
      typeof window !== "undefined" &&
      window.innerWidth < 600
    ) {
      setBattleSpectatorPanelOpen(false);
    }
  };

  const syncBattleSpectatorRuntime = (
    state: BattleSpectatorState,
    followTargetId: string,
    lodLevel: BattleSpectatorLodLevel,
    cameraProfile: BattleSpectatorCameraProfile
  ) => {
    const runtimePayload = {
      scenarioId: state.scenarioId,
      scenarioName: state.scenarioName,
      currentTime: state.currentTime,
      currentSideId: state.currentSideId,
      currentSideName: state.currentSideName,
      centerLongitude: state.centerLongitude,
      centerLatitude: state.centerLatitude,
      units: state.units,
      weapons: state.weapons,
      recentEvents: state.recentEvents,
      stats: state.stats,
      view: {
        followTargetId: followTargetId || null,
        lodLevel,
        cameraProfile,
      },
    };
    const nextRuntimeSignature = buildBattleSpectatorRuntimeSignature({
      state,
      followTargetId,
      lodLevel,
      cameraProfile,
    });
    if (battleSpectatorRuntimeSignatureRef.current === nextRuntimeSignature) {
      return;
    }

    battleSpectatorRuntimeSignatureRef.current = nextRuntimeSignature;
    postRuntimeToFlightSim("vista-battle-spectator-update", runtimePayload);
  };

  const focusBattleSpectatorView = (options: {
    point: {
      longitude: number;
      latitude: number;
      altitudeMeters: number;
    };
    followTargetId?: string;
    sideFilterId?: string;
    cameraProfile?: BattleSpectatorCameraProfile;
    durationSeconds?: number;
    headingDegrees?: number;
    pitchDegrees?: number;
    rangeMeters?: number;
  }) => {
    const nextCameraProfile =
      options.cameraProfile ??
      resolveBattleSpectatorFollowTargetCameraProfile(
        options.followTargetId,
        visibleBattleSpectator
      ) ??
      battleSpectatorCameraProfile;
    if (options.sideFilterId) {
      setBattleSpectatorSideFilter(options.sideFilterId);
    }
    if (
      options.cameraProfile !== undefined &&
      options.followTargetId === undefined
    ) {
      setBattleSpectatorCameraProfile(nextCameraProfile);
    }
    if (options.followTargetId !== undefined) {
      setBattleSpectatorFollowTargetId(options.followTargetId);
      setBattleSpectatorCameraProfile(nextCameraProfile);
      if (
        battleSpectatorRuntimeReady &&
        showBattleSpectator &&
        visibleBattleSpectator
      ) {
        syncBattleSpectatorRuntime(
          visibleBattleSpectator,
          options.followTargetId,
          battleSpectatorLodLevel,
          nextCameraProfile
        );
      }
    }
    jumpToBattleSpectatorPoint(options.point, {
      cameraProfile: nextCameraProfile,
      durationSeconds: options.durationSeconds,
      headingDegrees: options.headingDegrees,
      pitchDegrees: options.pitchDegrees,
      rangeMeters: options.rangeMeters,
    });
    closeBattleSpectatorPanelOnMobile();
  };

  const openBattleSpectatorHeroView = (followTargetId: string | undefined) => {
    if (!followTargetId) {
      return;
    }

    setBattleSpectatorHeroTargetId(followTargetId);
  };

  const closeBattleSpectatorHeroView = () => {
    setBattleSpectatorHeroTargetId("");
  };

  const focusBattleSpectatorPatrolTarget = (
    target: BattleSpectatorPatrolTarget | undefined,
    options?: { preservePanel?: boolean }
  ) => {
    if (!target) {
      return;
    }

    setBattleSpectatorHighlightedPatrolTargetId(target.id);
    focusBattleSpectatorView({
      point: target.point,
      followTargetId: target.followTargetId,
      cameraProfile: target.cameraProfile,
      durationSeconds: target.durationSeconds,
      headingDegrees: target.headingDegrees,
      pitchDegrees: target.pitchDegrees,
      rangeMeters: target.rangeMeters,
    });
    if (options?.preservePanel) {
      setBattleSpectatorPanelOpen(true);
    }
  };

  const focusBattleSpectatorSidebarEntry = (
    entry: BattleSpectatorSidebarEntry
  ) => {
    if (entry.sourceKind === "scene") {
      setBattleSpectatorHighlightedPatrolTargetId(entry.id);
      closeBattleSpectatorHeroView();
    } else {
      setBattleSpectatorHighlightedPatrolTargetId("");
      openBattleSpectatorHeroView(entry.followTargetId);
    }

    focusBattleSpectatorView({
      point: entry.point,
      followTargetId: entry.followTargetId,
      cameraProfile: entry.cameraProfile,
      durationSeconds: entry.durationSeconds,
      headingDegrees: entry.headingDegrees,
      pitchDegrees: entry.pitchDegrees,
      rangeMeters: entry.rangeMeters,
    });
  };

  const stepBattleSpectatorPatrol = (mode: "advance" | "reset" = "advance") => {
    if (battleSpectatorPatrolTargets.length === 0) {
      return;
    }

    if (mode === "reset") {
      battleSpectatorPatrolIndexRef.current = 0;
    } else {
      battleSpectatorPatrolIndexRef.current =
        (battleSpectatorPatrolIndexRef.current + 1) %
        battleSpectatorPatrolTargets.length;
    }

    focusBattleSpectatorPatrolTarget(
      battleSpectatorPatrolTargets[battleSpectatorPatrolIndexRef.current],
      { preservePanel: true }
    );
  };

  const refreshBattleSpectatorFromGame = (options?: {
    clearFollowTarget?: boolean;
    resetBriefingLog?: boolean;
    resetTrendHistory?: boolean;
    resetPatrolState?: boolean;
    captureScenarioSnapshot?: boolean;
    openPanel?: boolean;
  }) => {
    if (!game || !battleSpectatorEnabled) {
      return;
    }

    const nextBattleSpectatorState = buildBattleSpectatorState(
      game,
      continueSimulation,
      battleSpectator
    );
    battleSpectatorStateSignatureRef.current =
      buildBattleSpectatorStateSignature(nextBattleSpectatorState);
    battleSpectatorRuntimeSignatureRef.current = "";

    if (options?.captureScenarioSnapshot) {
      try {
        if (typeof game.exportCurrentScenario === "function") {
          battleSpectatorInitialScenarioSnapshotRef.current =
            game.exportCurrentScenario();
        }
      } catch (_error) {
        battleSpectatorInitialScenarioSnapshotRef.current = null;
      }
    }

    if (options?.clearFollowTarget) {
      setBattleSpectatorFollowTargetId("");
      battleSpectatorInitialFollowSeededRef.current = false;
      battleSpectatorAutoCaptureKeyRef.current = "";
      battleSpectatorInitialJumpScenarioRef.current = "";
    }

    if (options?.resetBriefingLog) {
      battleSpectatorBriefingLogSignatureRef.current = "";
      setBattleSpectatorBriefingLog([]);
    }

    if (options?.resetTrendHistory) {
      setBattleSpectatorTrendHistory([]);
    }

    if (options?.resetPatrolState) {
      battleSpectatorPatrolIndexRef.current = 0;
      setBattleSpectatorHighlightedPatrolTargetId("");
      setBattleSpectatorAutoPatrol(false);
    }

    setCurrentBattleSpectator(nextBattleSpectatorState);
    setCurrentFocusFireAirwatch(
      focusFireAirwatchEnabled
        ? buildFocusFireAirwatchState(
            game,
            continueSimulation,
            focusFireAirwatch
          )
        : undefined
    );
    setBattleSpectatorSimulationRevision((currentValue) => currentValue + 1);

    if (options?.openPanel !== false) {
      setBattleSpectatorPanelOpen(true);
    }
  };

  const loadBattleSpectatorScenarioString = (scenarioString: string) => {
    if (!game || typeof game.loadScenario !== "function") {
      return;
    }

    try {
      game.scenarioPaused = true;
      game.loadScenario(scenarioString);
      battleSpectatorScenarioRestartedRef.current = true;
    } catch (_error) {
      return;
    }

    refreshBattleSpectatorFromGame({
      clearFollowTarget: true,
      resetBriefingLog: true,
      resetTrendHistory: true,
      resetPatrolState: true,
      captureScenarioSnapshot: true,
      openPanel: true,
    });
  };

  const loadBattleSpectatorPresetScenario = (
    preset: FlightSimScenarioPresetDefinition
  ) => {
    const scenarioJson = JSON.parse(JSON.stringify(preset.scenario)) as Record<
      string,
      unknown
    > & {
      currentScenario?: {
        id?: string;
      };
    };

    if (
      (FLIGHT_SIM_SCENARIO_ID_REFRESH_PRESET_NAMES.has(preset.name) ||
        preset.regenerateScenarioId) &&
      typeof scenarioJson.currentScenario?.id === "string"
    ) {
      scenarioJson.currentScenario.id = randomUUID();
    }

    loadBattleSpectatorScenarioString(JSON.stringify(scenarioJson));
    setBattleSpectatorPresetListExpanded(false);
  };

  const handleBattleSpectatorNewScenario = () => {
    const scenarioJson = JSON.parse(
      JSON.stringify(blankScenarioJson)
    ) as Record<string, unknown> & {
      currentScenario?: {
        id?: string;
      };
    };

    if (typeof scenarioJson.currentScenario?.id === "string") {
      scenarioJson.currentScenario.id = randomUUID();
    }

    loadBattleSpectatorScenarioString(JSON.stringify(scenarioJson));
  };

  const handleBattleSpectatorRestartScenario = () => {
    const scenarioSnapshot = battleSpectatorInitialScenarioSnapshotRef.current;
    if (!scenarioSnapshot) {
      return;
    }

    loadBattleSpectatorScenarioString(scenarioSnapshot);
  };

  const handleBattleSpectatorStepScenario = () => {
    if (!game || typeof game.stepForTimeCompression !== "function") {
      return;
    }

    game.scenarioPaused = true;
    game.stepForTimeCompression(1);
    if (typeof game.recordStep === "function") {
      game.recordStep();
    }

    refreshBattleSpectatorFromGame({
      openPanel: true,
    });
  };

  const handleBattleSpectatorTogglePlay = () => {
    if (!game) {
      return;
    }

    game.scenarioPaused = !game.scenarioPaused;
    setBattleSpectatorSimulationRevision((currentValue) => currentValue + 1);
  };

  const handleBattleSpectatorToggleTimeCompression = () => {
    if (!game) {
      return;
    }

    if (typeof game.switchScenarioTimeCompression === "function") {
      game.switchScenarioTimeCompression();
    } else if (game.currentScenario) {
      const timeCompressions = Object.keys(GAME_SPEED_DELAY_MS).map((speed) =>
        parseInt(speed, 10)
      );
      const currentCompression = game.currentScenario.timeCompression;
      const currentIndex = timeCompressions.findIndex(
        (speed) => speed === currentCompression
      );
      game.currentScenario.timeCompression =
        timeCompressions[
          (currentIndex >= 0 ? currentIndex + 1 : 0) % timeCompressions.length
        ];
    }

    setBattleSpectatorSimulationRevision((currentValue) => currentValue + 1);
  };

  const handleBattleSpectatorExportScenario = () => {
    if (
      !game ||
      typeof game.exportCurrentScenario !== "function" ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    ) {
      return;
    }

    let scenarioString = "";
    try {
      scenarioString = game.exportCurrentScenario();
    } catch (_error) {
      return;
    }

    const objectUrl = window.URL.createObjectURL(
      new Blob([scenarioString], { type: "application/json" })
    );
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = `${sanitizeFlightSimScenarioFilename(
      battleSpectatorScenarioName
    )}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleBattleSpectatorRenameScenario = () => {
    if (typeof window === "undefined" || !game?.currentScenario) {
      return;
    }

    const nextScenarioName = window.prompt(
      "시나리오 이름",
      game.currentScenario.name
    );
    if (nextScenarioName === null) {
      return;
    }

    const trimmedScenarioName = nextScenarioName.trim();
    if (
      trimmedScenarioName.length === 0 ||
      !FLIGHT_SIM_SCENARIO_NAME_REGEX.test(trimmedScenarioName)
    ) {
      window.alert('한글/영문/숫자와 ":,-"만 사용 가능하며 최대 25자입니다.');
      return;
    }

    if (trimmedScenarioName === game.currentScenario.name) {
      return;
    }

    game.currentScenario.name = trimmedScenarioName;
    refreshBattleSpectatorFromGame({
      openPanel: true,
    });
  };

  const handleBattleSpectatorFocusObjective = () => {
    if (!hasFocusFireObjective(currentFocusFireAirwatch)) {
      return;
    }

    focusBattleSpectatorView({
      point: {
        longitude: currentFocusFireAirwatch.objectiveLon,
        latitude: currentFocusFireAirwatch.objectiveLat,
        altitudeMeters: 2600,
      },
      followTargetId: undefined,
      cameraProfile: "tactical",
      rangeMeters: 6200,
      pitchDegrees: -28,
    });
  };

  const handleBattleSpectatorScenarioFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const inputElement = event.target;
    const file = inputElement.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const scenarioString = readerEvent.target?.result;
      if (typeof scenarioString === "string") {
        loadBattleSpectatorScenarioString(scenarioString);
      }
      inputElement.value = "";
    };
    reader.readAsText(file);
  };

  const flightSimPageEffectContext = {
    FLIGHT_SIM_ENTRY,
    allBattleSpectatorUnitsById,
    allBattleSpectatorWeaponsById,
    applyBattleSpectatorFollowTargetSelection,
    assetState,
    battleSpectator,
    battleSpectatorAutoCapture,
    battleSpectatorAutoCaptureKeyRef,
    battleSpectatorAutoPatrol,
    battleSpectatorBriefing,
    battleSpectatorBriefingLogSignatureRef,
    battleSpectatorCameraProfile,
    battleSpectatorEnabled,
    battleSpectatorFollowTargetId,
    battleSpectatorHighlightedPatrolTargetId,
    battleSpectatorInitialFollowSeededRef,
    battleSpectatorInitialJumpScenarioRef,
    battleSpectatorInitialScenarioSnapshotRef,
    battleSpectatorLodLevel,
    battleSpectatorOverviewPoint,
    battleSpectatorPatrolIndexRef,
    battleSpectatorPatrolTargets,
    battleSpectatorPinnedInspectTargetId,
    battleSpectatorRuntimeReady,
    battleSpectatorRuntimeSignatureRef,
    battleSpectatorScenarioRestartedRef,
    battleSpectatorSideFilter,
    battleSpectatorSideOptions,
    battleSpectatorSimulationRevision,
    battleSpectatorStateSignatureRef,
    buildBattleSpectatorSideTrendHistoryEntry,
    buildBattleSpectatorState,
    buildBattleSpectatorStateSignature,
    buildFocusFireAirwatchState,
    buildSimulationOutcomeSummary,
    continueSimulation,
    currentBattleSpectator,
    currentFocusFireAirwatch,
    fetch,
    flightSimFrameReady,
    focusBattleSpectatorPatrolTarget,
    focusBattleSpectatorView,
    focusFireAirwatch,
    focusFireAirwatchEnabled,
    formatBattleSpectatorTimestamp,
    game,
    iframeRef,
    iframeSrc,
    latestBattleEngagementPoint,
    latestBattleSpectatorWeapon,
    latestTrackableBattleSpectatorEvent,
    parseBattleSpectatorFollowTargetId,
    postRuntimeToFlightSim,
    requestSimulationOutcomeNarrative,
    resolveBattleSpectatorEventJumpPoint,
    resolveBattleSpectatorJumpPoint,
    resolveBattleSpectatorWeaponJumpPoint,
    resolveInitialBattleSpectatorPanelOpen,
    setAssetState,
    setBattleSpectatorBriefingLog,
    setBattleSpectatorCameraProfile,
    setBattleSpectatorFollowTargetId,
    setBattleSpectatorHighlightedPatrolTargetId,
    setBattleSpectatorPanelOpen,
    setBattleSpectatorPinnedInspectTargetId,
    setBattleSpectatorPriorityFilter,
    setBattleSpectatorSideFilter,
    setBattleSpectatorTrendHistory,
    setCurrentBattleSpectator,
    setCurrentFocusFireAirwatch,
    setFlightSimFrameReady,
    setRuntimeInfo,
    setRuntimeProvider,
    setSimulationOutcomeLoading,
    setSimulationOutcomeNarrative,
    setSimulationOutcomeNarrativeSource,
    setSimulationOutcomeOpen,
    setSimulationOutcomeSummary,
    showBattleSpectator,
    showFocusFireAirwatch,
    simulationOutcomeRequestIdRef,
    syncBattleSpectatorRuntime,
    useEffect,
    visibleBattleSpectator,
  };

  useFlightSimPageEffects(flightSimPageEffectContext);

  const flightSimPageViewProps = {
    BATTLE_SPECTATOR_CAMERA_PROFILE_OPTIONS,
    BATTLE_SPECTATOR_LOD_OPTIONS,
    BATTLE_SPECTATOR_PRIORITY_FILTER_OPTIONS,
    BattleSpectatorHeroViewport,
    BattleSpectatorScenarioSidebar,
    Box,
    Button,
    CircularProgress,
    DocumentScannerOutlinedIcon,
    EntityIcon,
    JET_CRAFT_CATALOG,
    ListItemIcon,
    ListItemText,
    MenuItem,
    SimulationOutcomeDialog,
    Stack,
    ToolbarCollapsible,
    Typography,
    applyBattleSpectatorFollowTargetSelection,
    battleSpectatorActivitySummary,
    battleSpectatorAlertRows,
    battleSpectatorAnalysisSectionRef,
    battleSpectatorAssetRiskRows,
    battleSpectatorAutoCapture,
    battleSpectatorAutoPatrol,
    battleSpectatorBriefing,
    battleSpectatorBriefingLog,
    battleSpectatorBriefingSectionRef,
    battleSpectatorCameraProfile,
    battleSpectatorCameraProfileOption,
    battleSpectatorDockTab,
    battleSpectatorEnabled,
    battleSpectatorEngagementSectionRef,
    battleSpectatorFollowTargetId,
    battleSpectatorFollowTargetLabel,
    battleSpectatorHasScenarioControls,
    battleSpectatorHeroView,
    battleSpectatorHighlightedPatrolTarget,
    battleSpectatorHighlightedPatrolTargetId,
    battleSpectatorHotspotRows,
    battleSpectatorImpactTimelineRows,
    battleSpectatorInitiativeSummary,
    battleSpectatorLodLevel,
    battleSpectatorOverviewPoint,
    battleSpectatorOverviewSectionRef,
    battleSpectatorPanelOpen,
    battleSpectatorPatrolIndexRef,
    battleSpectatorPatrolTargets,
    battleSpectatorPresetListExpanded,
    battleSpectatorPriorityFilter,
    battleSpectatorPriorityFilterOption,
    battleSpectatorScenarioFileInputRef,
    battleSpectatorScenarioName,
    battleSpectatorScenarioPaused,
    battleSpectatorScenarioTimeCompression,
    battleSpectatorSideFilter,
    battleSpectatorSideOptions,
    battleSpectatorSideTrendRows,
    battleSpectatorSidebarEntries,
    battleSpectatorTempoRows,
    battleSpectatorThreatRows,
    battleSpectatorTrajectoryRows,
    buildBattleSpectatorPowerHistoryBars,
    closeBattleSpectatorHeroView,
    closeBattleSpectatorPanelOnMobile,
    currentBattleSpectator,
    currentFocusFireAirwatch,
    displayedBattleSpectator,
    filteredBattleSpectatorAssetRiskRows,
    filteredBattleSpectatorImpactTimelineRows,
    filteredBattleSpectatorTrajectoryRows,
    focusBattleSpectatorPatrolTarget,
    focusBattleSpectatorSidebarEntry,
    focusBattleSpectatorView,
    focusFireInsight,
    followTargetOptions,
    formatBattleSpectatorCameraProfileLabel,
    formatBattleSpectatorDistanceKm,
    formatBattleSpectatorEntityType,
    formatBattleSpectatorEta,
    formatBattleSpectatorFuelFraction,
    formatBattleSpectatorHeading,
    formatBattleSpectatorHp,
    formatBattleSpectatorRangeNm,
    formatBattleSpectatorThreatRadius,
    formatBattleSpectatorTimestamp,
    formatScriptStatus,
    formatViewerStatus,
    game,
    getBattleSpectatorHpTone,
    getBattleSpectatorPatrolTargetTone,
    getBattleSpectatorSideCssColor,
    getBattleSpectatorTrendTone,
    handleBattleSpectatorExportScenario,
    handleBattleSpectatorFocusObjective,
    handleBattleSpectatorNewScenario,
    handleBattleSpectatorRenameScenario,
    handleBattleSpectatorRestartScenario,
    handleBattleSpectatorScenarioFileChange,
    handleBattleSpectatorStepScenario,
    handleBattleSpectatorTogglePlay,
    handleBattleSpectatorToggleTimeCompression,
    hasInitialStartLocation,
    iframeRef,
    iframeSrc,
    inspectedBattleSpectatorTarget,
    inspectedBattleSpectatorTargetIconType,
    inspectedBattleSpectatorTargetTone,
    latestBattleEngagementPoint,
    latestBattleSpectatorWeapon,
    loadBattleSpectatorPresetScenario,
    loadingOverlayVisible,
    loadingStatusLabel,
    onBack,
    openBattleSpectatorHeroView,
    resolveBattleSpectatorEventJumpPoint,
    resolveBattleSpectatorSideJumpPoint,
    resolveBattleSpectatorUnitCameraProfile,
    resolveBattleSpectatorUnitFocusFraming,
    resolveBattleSpectatorUnitJumpPoint,
    resolveBattleSpectatorWeaponFocusFraming,
    resolveBattleSpectatorWeaponJumpPoint,
    runtimeInfo,
    runtimeProviderLabel,
    runtimeProviderTone,
    selectedBattleSpectatorInsight,
    selectedBattleSpectatorUnit,
    selectedCraftCopy,
    selectedFlightSimTitle,
    selectedJetCraft,
    selectedJetCraftId,
    selectedMode,
    setBattleSpectatorAutoCapture,
    setBattleSpectatorAutoPatrol,
    setBattleSpectatorCameraProfile,
    setBattleSpectatorDockTab,
    setBattleSpectatorFollowTargetId,
    setBattleSpectatorHighlightedPatrolTargetId,
    setBattleSpectatorLodLevel,
    setBattleSpectatorPanelOpen,
    setBattleSpectatorPresetListExpanded,
    setBattleSpectatorPriorityFilter,
    setBattleSpectatorSideFilter,
    setFlightSimFrameReady,
    setSelectedJetCraftId,
    setSelectedMode,
    setSimulationOutcomeOpen,
    showBattleSpectator,
    showFocusFireAirwatch,
    simulationOutcomeLoading,
    simulationOutcomeNarrative,
    simulationOutcomeNarrativeSource,
    simulationOutcomeOpen,
    simulationOutcomeSummary,
    startsInKorea,
    stepBattleSpectatorPatrol,
    visibleBattleSpectator,
    visibleBattleSpectatorScenarioPresets,
  };

  return <FlightSimPageView {...flightSimPageViewProps} />;
}
