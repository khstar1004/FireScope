import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Feature, MapBrowserEvent, Map as OlMap, Overlay } from "ol";
import { unByKey } from "ol/Observable";
import View from "ol/View";
import { EventsKey } from "ol/events";
import { Geometry, LineString } from "ol/geom";
import Point from "ol/geom/Point.js";
import Draw from "ol/interaction/Draw.js";
import DragBox from "ol/interaction/DragBox.js";
import { Pixel } from "ol/pixel";
import {
  Projection,
  fromLonLat,
  get as getProjection,
  toLonLat,
  transform,
} from "ol/proj";
import VectorSource from "ol/source/Vector";
import { getLength } from "ol/sphere.js";
import { mouseOnly } from "ol/events/condition";
import Game, {
  type FocusFireLaunchPlatform,
  type FocusFireWeaponTrack,
  type GameStepResult,
} from "@/game/Game";
import Scenario from "@/game/Scenario";
import "@/styles/ScenarioMap.css";
import {
  APP_DRAWER_WIDTH,
  DEFAULT_OL_PROJECTION_CODE,
  GAME_SPEED_DELAY_MS,
  NAUTICAL_MILES_TO_METERS,
} from "@/utils/constants";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { randomInt } from "@/utils/mapFunctions";
import { delay } from "@/utils/dateTimeFunctions";
import MultipleFeatureSelector from "@/gui/map/MultipleFeatureSelector";
import { SetScenarioTimeContext } from "@/gui/contextProviders/contexts/ScenarioTimeContext";
import { SetGameStatusContext } from "@/gui/contextProviders/contexts/GameStatusContext";
import { SetMouseMapCoordinatesContext } from "@/gui/contextProviders/contexts/MouseMapCoordinatesContext";
import { ToastContext } from "@/gui/contextProviders/contexts/ToastContext";
import { SetRecordingStepContext } from "@/gui/contextProviders/contexts/RecordingStepContext";
import AirbaseCard from "@/gui/map/feature/AirbaseCard";
import AircraftCard from "@/gui/map/feature/AircraftCard";
import ArmyCard from "@/gui/map/feature/ArmyCard";
import FacilityCard from "@/gui/map/feature/FacilityCard";
import ShipCard from "@/gui/map/feature/ShipCard";
import WeaponCard from "@/gui/map/feature/WeaponCard";
import BaseMapLayers, {
  type BaseMapModeId,
} from "@/gui/map/mapLayers/BaseMapLayers";
import { routeDrawLineStyle } from "@/gui/map/mapLayers/FeatureLayerStyles";
import {
  AirbasesLayer,
  AircraftLayer,
  ArmyLayer,
  FacilityLayer,
  FeatureLabelLayer,
  FacilityPlacementLayer,
  FacilityPlacementGroupLayer,
  RouteLayer,
  ShipLayer,
  ThreatRangeLayer,
  ThreatPlacementLayer,
  WeaponLayer,
  WeaponTrajectoryLayer,
  ReferencePointLayer,
  FeatureEntityState,
  FacilityPlacementPreview,
} from "@/gui/map/mapLayers/FeatureLayers";
import BottomInfoDisplay from "@/gui/map/toolbar/BottomInfoDisplay";
import { type SelectedCombatantSummary } from "@/gui/map/toolbar/SelectedUnitStatusCard";
import LayerVisibilityPanelToggle from "@/gui/map/toolbar/LayerVisibilityToggle";
import Toolbar from "@/gui/map/toolbar/Toolbar";
import type { AssetPlacementDeploymentDefaults } from "@/gui/map/toolbar/assetPlacementPreview";
import {
  buildFacilityFormationLayout,
  resolveFacilityPlacementArcDegrees,
  resolveFacilityPlacementHeading,
} from "@/gui/map/facilityPlacementDefaults";
import {
  buildFacilityPlacementGroupTeleportLayout,
  createFacilityPlacementGroup,
  findFacilityPlacementGroupByFacilityId,
  getScenarioFacilityPlacementGroups,
  resolveMatchingFacilityPlacementGroup,
  setScenarioFacilityPlacementGroups,
  type FacilityPlacementGroup,
} from "@/game/facilityPlacementGroups";
import {
  buildSimulationOutcomeSummary,
  requestSimulationOutcomeNarrative,
  type SimulationOutcomeNarrativeSource,
  type SimulationOutcomeSummary,
} from "@/gui/analysis/operationInsight";
import ReferencePointCard from "@/gui/map/feature/ReferencePointCard";
import ReferencePoint from "@/game/units/ReferencePoint";
import MissionCreatorCard from "@/gui/map/mission/MissionCreatorCard";
import MissionEditorCard from "@/gui/map/mission/MissionEditorCard";
import BaseVectorLayer from "ol/layer/BaseVector";
import VectorLayer from "ol/layer/Vector";
import { convertColorNameToSideColor, SIDE_COLOR } from "@/utils/colors";
import SideEditor from "@/gui/map/toolbar/SideEditor";
import { useAuth0 } from "@auth0/auth0-react";
import MapContextMenu from "@/gui/map/MapContextMenu";
import { UnitDbContext } from "@/gui/contextProviders/contexts/UnitDbContext";
import Aircraft from "@/game/units/Aircraft";
import Airbase from "@/game/units/Airbase";
import Army from "@/game/units/Army";
import Facility from "@/game/units/Facility";
import Ship from "@/game/units/Ship";
import Weapon from "@/game/units/Weapon";
import { SetSimulationLogsContext } from "@/gui/contextProviders/contexts/SimulationLogsContext";
import SimulationLogs from "@/gui/map/toolbar/SimulationLogs";
import LiveCommentaryNotifications from "@/gui/map/toolbar/LiveCommentaryNotifications";
import SimulationOutcomeDialog from "@/gui/shared/SimulationOutcomeDialog";
import { SetScenarioSidesContext } from "@/gui/contextProviders/contexts/ScenarioSidesContext";
import { SideDoctrine } from "@/game/Doctrine";
import { getDisplayName } from "@/utils/koreanCatalog";
import {
  AssetExperienceSummary,
  createAirbaseExperienceSummary,
  createAircraftExperienceSummary,
  createFacilityExperienceSummary,
  createShipExperienceSummary,
  createWeaponExperienceSummary,
} from "@/gui/experience/assetExperience";
import {
  ImmersiveExperienceProfile,
  createImmersiveExperienceDemoAsset,
} from "@/gui/experience/immersiveExperience";
import type { FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";
import {
  fixedTargetStrikeRlDemo,
  FixedTargetStrikeReplayMetric,
} from "@/scenarios/fixedTargetStrikeRlDemo";
import {
  RL_CHECKPOINT_SPECTATOR_KEY,
  RL_PENDING_RECORDING_KEY,
  RL_PENDING_RECORDING_LABEL_KEY,
} from "@/gui/rl/rlLabRoute";
import type { SimulationLog } from "@/game/log/SimulationLogs";
import {
  buildLiveCommentaryNotification,
  isMajorSimulationLog,
  type LiveCommentaryNotification,
} from "@/gui/map/toolbar/liveCommentary";
import FocusFireDockPanel from "@/gui/fires/FocusFireDockPanel";
import TargetFireRecommendationCard from "@/gui/fires/TargetFireRecommendationCard";
import DragSelectionCard from "@/gui/map/DragSelectionCard";
import ExperienceGuideRail from "@/gui/map/ExperienceGuideRail";
import type {
  GuideRailAlertId,
  GuideRailAssetSelectionLabels,
  GuideRailAssetMixId,
  GuideRailPlacementFocusIntent,
} from "@/gui/map/guideRailIntents";
import {
  shouldRunScenarioImmediatelyAfterLaunchModeSelection,
  type ScenarioLaunchMode,
} from "@/gui/map/scenarioLaunchMode";
import type { Terrain3dBounds } from "@/gui/map/terrain3dRoute";

interface ScenarioMapProps {
  zoom: number;
  center: number[];
  game: Game;
  projection?: Projection;
  mobileView: boolean;
  openRlLabPage: (scenarioString: string) => void;
  openFlightSimPage: (
    center?: number[],
    craft?: string,
    focusFireAirwatch?: {
      objectiveName?: string;
      objectiveLon?: number;
      objectiveLat?: number;
      active?: boolean;
      captureProgress?: number;
      aircraftCount?: number;
      artilleryCount?: number;
      armorCount?: number;
      weaponsInFlight?: number;
      statusLabel?: string;
      launchPlatforms?: FocusFireLaunchPlatform[];
      weaponTracks?: FocusFireWeaponTrack[];
      continueSimulation?: boolean;
    },
    battleSpectator?: FlightSimBattleSpectatorState
  ) => void;
  openAirCombatOverlay: (
    asset: AssetExperienceSummary,
    options?: {
      continueSimulation?: boolean;
      craft?: string;
      battleSpectator?: FlightSimBattleSpectatorState;
    }
  ) => void;
  openAssetExperiencePage: (asset: AssetExperienceSummary) => void;
  openImmersiveExperiencePage: (asset: AssetExperienceSummary) => void;
  openTerrain3dPage: (
    bounds: Terrain3dBounds,
    options?: {
      continueSimulation?: boolean;
    }
  ) => void;
}

interface IOpenMultipleFeatureSelector {
  open: boolean;
  top: number;
  left: number;
  features: Feature<Geometry>[];
}

interface RlCheckpointSpectatorSession {
  jobId: string;
  startedAt?: string;
  lastReplayKey?: string;
}

interface RlJobReplayableCheckpoint {
  algorithm: string;
  timesteps: number;
  replay_available?: boolean;
  recording_path?: string | null;
}

const GUIDE_RAIL_ASSET_TYPES: GuideRailAssetMixId[] = [
  "manned-aircraft",
  "drone",
  "airbase",
  "facility",
  "armor",
  "ship",
];

function areGuideRailSelectionLabelsEqual(
  currentLabels: GuideRailAssetSelectionLabels,
  nextLabels: GuideRailAssetSelectionLabels
) {
  return GUIDE_RAIL_ASSET_TYPES.every(
    (assetType) =>
      (currentLabels[assetType] ?? "") === (nextLabels[assetType] ?? "")
  );
}

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: `-${APP_DRAWER_WIDTH}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
    },
  ],
}));

function createScenarioBaseMapLayers(
  projection?: Projection,
  mapTilerBasicUrl?: string,
  mapTilerSatelliteUrl?: string,
  hybridLabelUrl?: string,
  eveningMapUrl?: string
) {
  return new BaseMapLayers(
    projection,
    mapTilerBasicUrl,
    mapTilerSatelliteUrl,
    hybridLabelUrl,
    eveningMapUrl
  );
}

export default function ScenarioMap({
  zoom,
  center,
  game,
  projection,
  mobileView,
  openRlLabPage,
  openFlightSimPage,
  openAirCombatOverlay,
  openAssetExperiencePage,
  openImmersiveExperiencePage,
  openTerrain3dPage,
}: Readonly<ScenarioMapProps>) {
  // checking env key
  const MAPTILER_DEFAULT_KEY =
    import.meta.env.VITE_MAPTILER_DEFAULT_KEY ??
    import.meta.env.MAPTILER_API_KEY;
  if (!MAPTILER_DEFAULT_KEY) {
    console.error(
      "MapTiler key not found. Set VITE_MAPTILER_DEFAULT_KEY or MAPTILER_API_KEY."
    );
    return null;
  }

  const mapRef = useRef<HTMLDivElement | null>(null);
  const scenarioMapActiveRef = useRef(true);
  const defaultProjection = getProjection(DEFAULT_OL_PROJECTION_CODE);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [assetPlacementOpenSignal, setAssetPlacementOpenSignal] = useState(0);
  const [assetPlacementFocusIntent, setAssetPlacementFocusIntent] =
    useState<GuideRailPlacementFocusIntent>({
      assetType: "manned-aircraft",
      signal: 0,
    });
  const [activeGuideRailAssetType, setActiveGuideRailAssetType] =
    useState<GuideRailAssetMixId | null>(null);
  const [guideRailSelectionLabels, setGuideRailSelectionLabels] =
    useState<GuideRailAssetSelectionLabels>({});
  const [focusFireDockOpen, setFocusFireDockOpen] = useState(false);
  const mapTilerBasicUrl = `https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_DEFAULT_KEY}`;
  const mapTilerEveningUrl = `https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${MAPTILER_DEFAULT_KEY}`;
  const mapTilerSatelliteJsonUrl = `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${MAPTILER_DEFAULT_KEY}`;
  const vworldHybridUrl = import.meta.env.VITE_VWORLD_API_KEY
    ? `https://api.vworld.kr/req/wmts/1.0.0/${import.meta.env.VITE_VWORLD_API_KEY}/Hybrid/{z}/{y}/{x}.png`
    : undefined;
  const [baseMapLayers, setBaseMapLayers] = useState(
    createScenarioBaseMapLayers(
      projection,
      mapTilerBasicUrl,
      mapTilerSatelliteJsonUrl,
      vworldHybridUrl,
      mapTilerEveningUrl
    )
  );
  const [baseMapModeId, setBaseMapModeId] = useState<BaseMapModeId>(() =>
    baseMapLayers.getCurrentModeId()
  );
  const baseMapModeIdRef = useRef<BaseMapModeId>(
    baseMapLayers.getCurrentModeId()
  );
  const [aircraftLayer, setAircraftLayer] = useState(
    new AircraftLayer(projection, 3)
  );
  const [airbasesLayer, setAirbasesLayer] = useState(
    new AirbasesLayer(projection, 1)
  );
  const [facilityLayer, setFacilityLayer] = useState(
    new FacilityLayer(projection, 1)
  );
  const [armyLayer, setArmyLayer] = useState(new ArmyLayer(projection, 1));
  const [threatRangeLayer, setThreatRangeLayer] = useState(
    new ThreatRangeLayer(projection)
  );
  const [facilityPlacementGroupLayer] = useState(
    new FacilityPlacementGroupLayer(projection, 3.5)
  );
  const [facilityPlacementLayer, setFacilityPlacementLayer] = useState(
    new FacilityPlacementLayer(projection, 5)
  );
  const [threatPlacementLayer, setThreatPlacementLayer] = useState(
    new ThreatPlacementLayer(projection, 5)
  );
  const [aircraftRouteLayer, setAircraftRouteLayer] = useState(
    new RouteLayer("aircraftRouteLayer", projection)
  );
  const [shipRouteLayer, setShipRouteLayer] = useState(
    new RouteLayer("shipRouteLayer", projection)
  );
  const [armyRouteLayer, setArmyRouteLayer] = useState(
    new RouteLayer("armyRouteLayer", projection)
  );
  const [weaponLayer, setWeaponLayer] = useState(
    new WeaponLayer(projection, 2)
  );
  const [weaponTrajectoryLayer] = useState(() => {
    const layer = new WeaponTrajectoryLayer(projection, 1.8);
    layer.layer.setVisible(false);
    return layer;
  });
  const [shipLayer, setShipLayer] = useState(new ShipLayer(projection, 1));
  const [referencePointLayer, setReferencePointLayer] = useState(
    new ReferencePointLayer(projection, 1)
  );
  const [featureLabelLayer, setFeatureLabelLayer] = useState(
    new FeatureLabelLayer(projection, 4)
  );
  const [featureEntitiesState, setFeatureEntitiesState] = useState<
    FeatureEntityState[]
  >([]);
  const [currentScenarioTimeCompression, setCurrentScenarioTimeCompression] =
    useState(game.currentScenario.timeCompression);
  const [currentRecordingIntervalSeconds, setCurrentRecordingIntervalSeconds] =
    useState(game.playbackRecorder.recordEverySeconds);
  const [recordingPlayerHasRecording, setRecordingPlayerHasRecording] =
    useState(game.recordingPlayer.hasRecording());
  const [activeReplayMetrics, setActiveReplayMetrics] = useState<
    FixedTargetStrikeReplayMetric[] | null
  >(null);
  const [activeReplayMetric, setActiveReplayMetric] =
    useState<FixedTargetStrikeReplayMetric | null>(null);
  const [currentSideId, setCurrentSideId] = useState(game.currentSideId);
  const [openAircraftCard, setOpenAircraftCard] = useState({
    open: false,
    top: 0,
    left: 0,
    aircraftId: "",
  });
  const [openAirbaseCard, setOpenAirbaseCard] = useState({
    open: false,
    top: 0,
    left: 0,
    airbaseId: "",
  });
  const [openFacilityCard, setOpenFacilityCard] = useState({
    open: false,
    top: 0,
    left: 0,
    facilityId: "",
  });
  const [openArmyCard, setOpenArmyCard] = useState({
    open: false,
    top: 0,
    left: 0,
    armyId: "",
  });
  const [openShipCard, setOpenShipCard] = useState({
    open: false,
    top: 0,
    left: 0,
    shipId: "",
  });
  const [openReferencePointCard, setOpenReferencePointCard] = useState({
    open: false,
    top: 0,
    left: 0,
    referencePointId: "",
  });
  const [openWeaponCard, setOpenWeaponCard] = useState({
    open: false,
    top: 0,
    left: 0,
    weaponId: "",
  });
  const [openMultipleFeatureSelector, setOpenMultipleFeatureSelector] =
    useState<IOpenMultipleFeatureSelector>({
      open: false,
      top: 0,
      left: 0,
      features: [],
    });
  const [openSideEditor, setOpenSideEditor] = useState<{
    open: boolean;
    sideId: string | null;
    anchorEl: null | HTMLElement;
  }>({
    open: false,
    sideId: null,
    anchorEl: null,
  });
  const [openMapContextMenu, setOpenMapContextMenu] = useState({
    open: false,
    top: 0,
    left: 0,
    coordinates: [0, 0],
  });
  const [openTargetFireRecommendation, setOpenTargetFireRecommendation] =
    useState({
      open: false,
      top: 0,
      left: 0,
      targetId: "",
    });
  const [dragSelectedFeatures, setDragSelectedFeatures] = useState<
    Feature<Geometry>[]
  >([]);
  const [terrain3dSelectionActive, setTerrain3dSelectionActive] =
    useState(false);
  const [facilityPlacementGroups, setFacilityPlacementGroups] = useState<
    FacilityPlacementGroup[]
  >(() =>
    getScenarioFacilityPlacementGroups(
      game.currentScenario.metadata,
      game.currentScenario.facilities.map((facility) => facility.id)
    )
  );
  const [
    selectedDragRecommendationTargetId,
    setSelectedDragRecommendationTargetId,
  ] = useState<string | null>(null);
  const [
    missionCreatorInitialMissionType,
    setMissionCreatorInitialMissionType,
  ] = useState<"Patrol" | "Strike">("Patrol");
  const [missionCreatorInitialTargetIds, setMissionCreatorInitialTargetIds] =
    useState<string[]>([]);
  const [pendingFacilityPlacement, setPendingFacilityPlacement] = useState<
    number[] | null
  >(null);
  const pendingFacilityPlacementRef = useRef<number[] | null>(null);
  const teleportingFacilityGroupIdRef = useRef<string | null>(null);
  const suppressNextMapClickRef = useRef(false);
  const [selectingFocusFireObjective, setSelectingFocusFireObjective] =
    useState(false);
  const [featureLabelVisible, setFeatureLabelVisible] = useState(true);
  const [threatRangeVisible, setThreatRangeVisible] = useState(true);
  const [routeVisible, setRouteVisible] = useState(true);
  const [weaponTrajectoryVisible, setWeaponTrajectoryVisible] =
    useState(false);
  const [referencePointVisible, setReferencePointVisible] = useState(true);
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] =
    useState(true);
  const [missionCreatorActive, setMissionCreatorActive] = useState(false);
  const [missionEditorActive, setMissionEditorActive] = useState({
    open: false,
    selectedMissionId: "",
  });
  const [simulationLogsActive, setSimulationLogsActive] =
    useState<boolean>(false);
  const [liveCommentaryNotifications, setLiveCommentaryNotifications] =
    useState<LiveCommentaryNotification[]>([]);
  const setCurrentScenarioTimeToContext = useContext(SetScenarioTimeContext);
  const setCurrentRecordingStepToContext = useContext(SetRecordingStepContext);
  const setCurrentGameStatusToContext = useContext(SetGameStatusContext);
  const setCurrentMouseMapCoordinatesToContext = useContext(
    SetMouseMapCoordinatesContext
  );
  const toastContext = useContext(ToastContext);
  const unitDbContext = useContext(UnitDbContext);
  const setCurrentSimulationLogsToContext = useContext(
    SetSimulationLogsContext
  );
  const setCurrentScenarioSidesToContext = useContext(SetScenarioSidesContext);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    minHeight: "auto",
    margin: mobileView ? 0 : 16,
    justifyContent: "flex-end",
  }));

  let routeMeasurementDrawLine: Draw | null = null;
  let routeMeasurementTooltipElement: HTMLDivElement | null = null;
  let routeMeasurementTooltip: Overlay | null = null;
  let routeMeasurementListener: EventsKey | undefined;
  let teleportingUnit = false;

  const map = new OlMap({
    layers: [
      ...baseMapLayers.layers,
      aircraftLayer.layer,
      facilityLayer.layer,
      armyLayer.layer,
      airbasesLayer.layer,
      threatRangeLayer.layer,
      facilityPlacementGroupLayer.layer,
      threatPlacementLayer.layer,
      facilityPlacementLayer.layer,
      aircraftRouteLayer.layer,
      shipRouteLayer.layer,
      armyRouteLayer.layer,
      weaponTrajectoryLayer.layer,
      weaponLayer.layer,
      featureLabelLayer.layer,
      shipLayer.layer,
      referencePointLayer.layer,
    ],
    view: new View({
      center: center,
      zoom: zoom,
      projection: projection ?? defaultProjection!,
    }),
    controls: [],
  });
  const [theMap, setTheMap] = useState(map);

  const [isGameOver, setIsGameOver] = useState(false);
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
  const simulationOutcomeRequestIdRef = useRef(0);
  const liveCommentaryTimeoutsRef = useRef<Record<string, number>>({});
  const rlCheckpointSpectatorRef = useRef<RlCheckpointSpectatorSession | null>(
    null
  );
  const rlCheckpointSpectatorPollingTimeoutRef = useRef<number | null>(null);
  const lastSpectatedCheckpointKeyRef = useRef<string | null>(null);
  const lastObservedSimulationLogIdRef = useRef<string | null>(
    game.simulationLogs.getLogs()[game.simulationLogs.getLogs().length - 1]
      ?.id ?? null
  );
  const lastObservedSimulationLogCountRef = useRef(
    game.simulationLogs.getLogs().length
  );

  useEffect(() => {
    return () => {
      simulationOutcomeRequestIdRef.current += 1;
      Object.values(liveCommentaryTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      if (rlCheckpointSpectatorPollingTimeoutRef.current !== null) {
        window.clearTimeout(rlCheckpointSpectatorPollingTimeoutRef.current);
      }
    };
  }, []);

  function getReplayMetricForStep(
    stepIndex: number,
    replayMetrics: FixedTargetStrikeReplayMetric[] | null = activeReplayMetrics
  ) {
    if (!replayMetrics || stepIndex < 0 || stepIndex >= replayMetrics.length) {
      return null;
    }
    return replayMetrics[stepIndex];
  }

  function setReplayState(
    replayMetrics: FixedTargetStrikeReplayMetric[] | null,
    stepIndex: number = 0
  ) {
    setActiveReplayMetrics(replayMetrics);
    setActiveReplayMetric(getReplayMetricForStep(stepIndex, replayMetrics));
  }

  function parseRlCheckpointSpectatorSession() {
    const rawValue = window.sessionStorage.getItem(RL_CHECKPOINT_SPECTATOR_KEY);
    if (!rawValue) {
      return null;
    }
    try {
      const parsed = JSON.parse(
        rawValue
      ) as Partial<RlCheckpointSpectatorSession>;
      const jobId = `${parsed.jobId ?? ""}`.trim();
      if (!jobId) {
        return null;
      }
      return {
        jobId,
        startedAt:
          typeof parsed.startedAt === "string" &&
          parsed.startedAt.trim().length > 0
            ? parsed.startedAt
            : undefined,
        lastReplayKey:
          typeof parsed.lastReplayKey === "string" &&
          parsed.lastReplayKey.trim().length > 0
            ? parsed.lastReplayKey
            : undefined,
      } satisfies RlCheckpointSpectatorSession;
    } catch {
      return null;
    }
  }

  function clearRlCheckpointSpectatorSession() {
    rlCheckpointSpectatorRef.current = null;
    lastSpectatedCheckpointKeyRef.current = null;
    window.sessionStorage.removeItem(RL_CHECKPOINT_SPECTATOR_KEY);
    if (rlCheckpointSpectatorPollingTimeoutRef.current !== null) {
      window.clearTimeout(rlCheckpointSpectatorPollingTimeoutRef.current);
      rlCheckpointSpectatorPollingTimeoutRef.current = null;
    }
  }

  function findLatestReplayableCheckpoint(
    checkpoints: unknown
  ): RlJobReplayableCheckpoint | null {
    if (!Array.isArray(checkpoints)) {
      return null;
    }

    let latestCheckpoint: RlJobReplayableCheckpoint | null = null;
    for (const checkpoint of checkpoints) {
      if (!checkpoint || typeof checkpoint !== "object") {
        continue;
      }
      const replayAvailable = Boolean(
        (checkpoint as Record<string, unknown>).replay_available
      );
      const recordingPath = (checkpoint as Record<string, unknown>)
        .recording_path;
      if (
        !replayAvailable ||
        typeof recordingPath !== "string" ||
        recordingPath.trim().length === 0
      ) {
        continue;
      }
      const algorithm =
        `${(checkpoint as Record<string, unknown>).algorithm ?? ""}`
          .trim()
          .toLowerCase();
      const timesteps = Number(
        (checkpoint as Record<string, unknown>).timesteps ?? NaN
      );
      if (!algorithm || !Number.isFinite(timesteps)) {
        continue;
      }
      if (
        latestCheckpoint === null ||
        timesteps >= latestCheckpoint.timesteps
      ) {
        latestCheckpoint = {
          algorithm,
          timesteps: Math.floor(timesteps),
          replay_available: true,
          recording_path: recordingPath,
        };
      }
    }

    return latestCheckpoint;
  }

  const facilityPlacementDefaultsRef =
    useRef<AssetPlacementDeploymentDefaults | null>(null);

  function clearPendingFacilityPlacement() {
    pendingFacilityPlacementRef.current = null;
    setPendingFacilityPlacement(null);
    facilityPlacementLayer.clearPreview();
    threatPlacementLayer.clearPreview();
  }

  function clearPendingFacilityGroupTeleport() {
    teleportingFacilityGroupIdRef.current = null;
    refreshFacilityPlacementGroupLayer();
  }

  function getCurrentFacilityIds() {
    return game.currentScenario.facilities.map((facility) => facility.id);
  }

  function persistFacilityPlacementGroups(groups: FacilityPlacementGroup[]) {
    const activeFacilityIds = getCurrentFacilityIds();
    game.currentScenario.metadata = setScenarioFacilityPlacementGroups(
      game.currentScenario.metadata,
      groups,
      activeFacilityIds
    );
    const persistedGroups = getScenarioFacilityPlacementGroups(
      game.currentScenario.metadata,
      activeFacilityIds
    );
    setFacilityPlacementGroups(persistedGroups);
    return persistedGroups;
  }

  function loadFacilityPlacementGroupsFromScenario() {
    const loadedGroups = getScenarioFacilityPlacementGroups(
      game.currentScenario.metadata,
      getCurrentFacilityIds()
    );
    return persistFacilityPlacementGroups(loadedGroups);
  }

  function buildFacilityPlacementGroupLabel(
    className: string,
    memberCount: number,
    templateLabel?: string
  ) {
    const formationLabel = templateLabel ?? `${memberCount}포대 분산`;
    return `${getDisplayName(className)} · ${formationLabel}`;
  }

  function getFacilityFeaturesByIds(facilityIds: string[]) {
    return facilityIds
      .map((facilityId) => facilityLayer.findFeatureByKey("id", facilityId))
      .filter((feature): feature is Feature<Geometry> => Boolean(feature));
  }

  function closeFacilityCard() {
    setOpenFacilityCard({
      open: false,
      top: 0,
      left: 0,
      facilityId: "",
    });
    setKeyboardShortcutsEnabled(true);
  }

  function registerFacilityPlacementGroup(
    facilities: Facility[],
    templateLabel?: string
  ) {
    if (facilities.length < 2) {
      return null;
    }

    const nextGroup = createFacilityPlacementGroup(
      facilities.map((facility) => facility.id),
      buildFacilityPlacementGroupLabel(
        facilities[0]?.className ?? "Facility",
        facilities.length,
        templateLabel
      )
    );

    const nextGroups = [
      nextGroup,
      ...facilityPlacementGroups
        .map((group) => ({
          ...group,
          facilityIds: group.facilityIds.filter(
            (facilityId) => !nextGroup.facilityIds.includes(facilityId)
          ),
        }))
        .filter((group) => group.facilityIds.length > 1),
    ];
    persistFacilityPlacementGroups(nextGroups);

    return nextGroup;
  }

  function selectFacilityPlacementGroup(
    groupOrId: string | FacilityPlacementGroup
  ) {
    const group =
      typeof groupOrId === "string"
        ? facilityPlacementGroups.find((entry) => entry.id === groupOrId)
        : groupOrId;
    if (!group) {
      return;
    }

    const features = getFacilityFeaturesByIds(group.facilityIds);
    if (features.length === 0) {
      return;
    }

    setDragSelectedFeatures(features);
    setSelectedDragRecommendationTargetId(null);
    setCurrentGameStatusToContext(
      `${group.facilityIds.length}개 포대 묶음을 선택했습니다.`
    );
  }

  function queueFacilityPlacementGroupForTeleport(groupId: string) {
    const group = facilityPlacementGroups.find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }

    clearPendingFacilityPlacement();
    facilityPlacementDefaultsRef.current = null;
    game.addingFacility = false;
    clearPendingFacilityGroupTeleport();
    game.selectedUnitId = "";
    teleportingUnit = false;
    teleportingFacilityGroupIdRef.current = groupId;
    refreshFacilityPlacementGroupLayer();
    changeCursorType("");
    setCurrentGameStatusToContext(
      `지도를 클릭해 ${group.facilityIds.length}개 포대 묶음을 평행 이동하세요.`
    );
  }

  function removeFacilityPlacementGroup(groupId: string) {
    const group = facilityPlacementGroups.find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }

    const activeFacilityIds = group.facilityIds.filter((facilityId) =>
      Boolean(game.currentScenario.getFacility(facilityId))
    );
    if (activeFacilityIds.length === 0) {
      persistFacilityPlacementGroups(
        facilityPlacementGroups.filter((entry) => entry.id !== groupId)
      );
      return;
    }

    if (
      openFacilityCard.open &&
      activeFacilityIds.includes(openFacilityCard.facilityId)
    ) {
      closeFacilityCard();
    }

    if (
      dragSelectedFeatures.length > 0 &&
      dragSelectedFeatures.some((feature) =>
        activeFacilityIds.includes(feature.get("id"))
      )
    ) {
      clearDragSelection();
    }

    if (
      game.selectedUnitId &&
      activeFacilityIds.includes(game.selectedUnitId)
    ) {
      game.selectedUnitId = "";
    }

    clearPendingFacilityGroupTeleport();
    activeFacilityIds.forEach((facilityId) => {
      removeFacility(facilityId, true);
    });
    persistFacilityPlacementGroups(
      facilityPlacementGroups.filter((entry) => entry.id !== groupId)
    );
    toastContext?.addToast(
      `${group.label} 묶음 ${activeFacilityIds.length}개를 삭제했습니다.`
    );
  }

  function teleportFacilityPlacementGroup(
    groupId: string,
    coordinates: number[]
  ) {
    const group = facilityPlacementGroups.find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }

    const facilities = group.facilityIds
      .map((facilityId) => game.currentScenario.getFacility(facilityId))
      .filter((facility): facility is Facility => Boolean(facility));
    if (facilities.length === 0) {
      persistFacilityPlacementGroups(
        facilityPlacementGroups.filter((entry) => entry.id !== groupId)
      );
      return;
    }

    const destination = toLonLat(coordinates, theMap.getView().getProjection());
    const nextPositions = buildFacilityPlacementGroupTeleportLayout(
      facilities,
      destination[1],
      destination[0]
    );
    nextPositions.forEach((position) => {
      game.teleportUnit(position.id, position.latitude, position.longitude);
    });
    refreshAllLayers();
    loadFeatureEntitiesState();
    selectFacilityPlacementGroup(groupId);
    toastContext?.addToast(
      `${group.label} 묶음 ${nextPositions.length}개를 이동했습니다.`
    );
  }

  function dismissLiveCommentaryNotification(id: string) {
    const timeoutId = liveCommentaryTimeoutsRef.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete liveCommentaryTimeoutsRef.current[id];
    }

    setLiveCommentaryNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }

  function clearLiveCommentaryNotifications() {
    Object.values(liveCommentaryTimeoutsRef.current).forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    liveCommentaryTimeoutsRef.current = {};
    setLiveCommentaryNotifications([]);
  }

  function syncLiveCommentaryNotifications(
    logs: SimulationLog[],
    options?: {
      announceLiveCommentary?: boolean;
      clearExistingLiveCommentary?: boolean;
    }
  ) {
    if (options?.clearExistingLiveCommentary) {
      clearLiveCommentaryNotifications();
    }

    if (logs.length === 0) {
      lastObservedSimulationLogCountRef.current = 0;
      lastObservedSimulationLogIdRef.current = null;
      return;
    }

    const previousCount = lastObservedSimulationLogCountRef.current;
    const previousLastId = lastObservedSimulationLogIdRef.current;
    let newLogs: SimulationLog[] = [];

    if (previousCount === 0) {
      newLogs = logs;
    } else if (previousLastId) {
      const previousLastIndex = logs.findIndex(
        (log) => log.id === previousLastId
      );
      if (previousLastIndex >= 0) {
        newLogs = logs.slice(previousLastIndex + 1);
      }
    }

    lastObservedSimulationLogCountRef.current = logs.length;
    lastObservedSimulationLogIdRef.current = logs[logs.length - 1]?.id ?? null;

    if (options?.announceLiveCommentary === false || newLogs.length === 0) {
      return;
    }

    const notifications = newLogs
      .filter((log) => isMajorSimulationLog(log))
      .map((log) =>
        buildLiveCommentaryNotification(
          log,
          game.currentScenario.getSideName(log.sideId),
          game.currentScenario.getSideColor(log.sideId) ?? SIDE_COLOR.BLACK
        )
      );

    if (notifications.length === 0) {
      return;
    }

    setLiveCommentaryNotifications((prevNotifications) => {
      const existingIds = new Set(
        notifications.map((notification) => notification.id)
      );
      return [
        ...prevNotifications.filter(
          (notification) => !existingIds.has(notification.id)
        ),
        ...notifications,
      ].slice(-4);
    });

    notifications.forEach((notification, index) => {
      const existingTimeoutId =
        liveCommentaryTimeoutsRef.current[notification.id];
      if (existingTimeoutId) {
        window.clearTimeout(existingTimeoutId);
      }

      liveCommentaryTimeoutsRef.current[notification.id] = window.setTimeout(
        () => {
          dismissLiveCommentaryNotification(notification.id);
        },
        8200 + index * 350
      );
    });
  }

  function getPendingFacilityPlacementPreview(
    directionCoordinates: number[]
  ): FacilityPlacementPreview | null {
    const originCoordinates = pendingFacilityPlacementRef.current;
    if (!originCoordinates) {
      return null;
    }

    const unitClassSelected = game.selectedUnitClassName;
    const facilityTemplate = unitDbContext
      .getFacilityDb()
      .find((facility) => facility.className === unitClassSelected);
    if (!facilityTemplate?.className) {
      return null;
    }

    const [originLongitude, originLatitude] = toLonLat(
      originCoordinates,
      theMap.getView().getProjection()
    );
    const [directionLongitude, directionLatitude] = toLonLat(
      directionCoordinates,
      theMap.getView().getProjection()
    );
    const heading = resolveFacilityPlacementHeading(
      originLatitude,
      originLongitude,
      directionLatitude,
      directionLongitude,
      facilityPlacementDefaultsRef.current
    );

    return {
      latitude: originLatitude,
      longitude: originLongitude,
      heading,
      className: facilityTemplate.className,
      sideColor: game.currentScenario.getSideColor(game.currentSideId),
      range: facilityTemplate.range,
      detectionArcDegrees: resolveFacilityPlacementArcDegrees(
        facilityTemplate.detectionArcDegrees,
        facilityPlacementDefaultsRef.current
      ),
    };
  }

  function getPendingFacilityPlacementPreviews(directionCoordinates: number[]) {
    const preview = getPendingFacilityPlacementPreview(directionCoordinates);
    if (!preview) {
      return null;
    }

    return buildFacilityFormationLayout(
      preview.latitude,
      preview.longitude,
      preview.heading,
      facilityPlacementDefaultsRef.current
    ).map((layoutEntry) => ({
      ...preview,
      latitude: layoutEntry.latitude,
      longitude: layoutEntry.longitude,
      heading: layoutEntry.heading,
    }));
  }

  function updatePendingFacilityPlacementPreview(
    directionCoordinates: number[]
  ) {
    const previews = getPendingFacilityPlacementPreviews(directionCoordinates);
    if (!previews) {
      return;
    }

    facilityPlacementLayer.showPreview(previews);
    threatPlacementLayer.showPreview(previews);
  }

  function clearRecordingPlayer() {
    game.recordingPlayer.clear();
    setRecordingPlayerHasRecording(game.recordingPlayer.hasRecording());
    setCurrentRecordingStepToContext(0);
  }

  function exitReplayMode() {
    clearRlCheckpointSpectatorSession();
    setReplayState(null);
    clearRecordingPlayer();
  }

  function loadRecordingContent(
    content: string,
    options?: {
      replayMetrics?: FixedTargetStrikeReplayMetric[] | null;
      successMessage?: string;
      gameStatus?: string;
      autoPlay?: boolean;
    }
  ) {
    if (!game.recordingPlayer.loadRecording(content)) {
      return false;
    }

    setReplayState(
      options?.replayMetrics ?? null,
      game.recordingPlayer.getCurrentStepIndex()
    );
    setRecordingPlayerHasRecording(game.recordingPlayer.hasRecording());
    game.loadScenario(game.recordingPlayer.getCurrentStep());
    refreshAllLayers();
    updateMapView(
      game.mapView.currentCameraCenter,
      game.mapView.currentCameraZoom
    );
    switchCurrentSide(game.currentSideId);
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
    updateCurrentSimulationLogsToContext({
      announceLiveCommentary: false,
      clearExistingLiveCommentary: true,
    });
    setCurrentScenarioSidesToContext([...game.currentScenario.sides]);
    setCurrentRecordingStepToContext(
      game.recordingPlayer.getCurrentStepIndex()
    );
    loadFeatureEntitiesState();
    if (options?.gameStatus) {
      setCurrentGameStatusToContext(options.gameStatus);
    }
    if (options?.successMessage) {
      toastContext?.addToast(options.successMessage, "success");
    }
    if (options?.autoPlay) {
      window.setTimeout(() => {
        void handlePlayRecordingClick();
      }, 0);
    }
    return true;
  }

  useEffect(() => {
    if (!import.meta.env.VITE_ENV || import.meta.env.VITE_ENV === "standalone")
      return;
    if (!isAuthenticated) return;

    const fetchMapConfig = async () => {
      try {
        const token = await getAccessTokenSilently();
        const resp = await fetch(
          `${import.meta.env.VITE_API_SERVER_URL}/api/v1/map-config`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (resp.ok) {
          const cfg = await resp.json();
          const bml = createScenarioBaseMapLayers(
            projection,
            cfg.basicUrl ?? mapTilerBasicUrl,
            cfg.satelliteJson ?? mapTilerSatelliteJsonUrl,
            cfg.vworldHybridUrl ?? vworldHybridUrl,
            mapTilerEveningUrl
          );
          bml.setMode(baseMapModeIdRef.current);
          setTheMap((prevMap) => {
            prevMap.setLayers([
              ...bml.layers,
              aircraftLayer.layer,
              facilityLayer.layer,
              airbasesLayer.layer,
              threatRangeLayer.layer,
              facilityPlacementGroupLayer.layer,
              threatPlacementLayer.layer,
              facilityPlacementLayer.layer,
              aircraftRouteLayer.layer,
              shipRouteLayer.layer,
              weaponTrajectoryLayer.layer,
              weaponLayer.layer,
              featureLabelLayer.layer,
              shipLayer.layer,
              referencePointLayer.layer,
            ]);
            return prevMap;
          });
          setBaseMapLayers(bml);
          baseMapModeIdRef.current = bml.getCurrentModeId();
          setBaseMapModeId(bml.getCurrentModeId());
        }
      } catch (error) {
        console.error("Error fetching map config:", error);
      }
    };

    fetchMapConfig();
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    scenarioMapActiveRef.current = true;
    theMap.setTarget(mapRef.current!);

    const pointerMoveKey = theMap.on("pointermove", function (event) {
      const coordinatesLatLong = toLonLat(
        event.coordinate,
        theMap.getView().getProjection()
      );
      setCurrentMouseMapCoordinatesToContext({
        latitude: coordinatesLatLong[1],
        longitude: coordinatesLatLong[0],
      });
      if (pendingFacilityPlacementRef.current) {
        updatePendingFacilityPlacementPreview(event.coordinate);
      }
    });

    const moveEndKey = theMap.on("moveend", function (event) {
      const view = event.map.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      if (center) {
        game.mapView.currentCameraCenter = toLonLat(
          center,
          view.getProjection()
        );
      }
      if (zoom) game.mapView.currentCameraZoom = zoom;
    });

    const handleMapContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      const pixel = theMap.getEventPixel(event);
      const coordinate = theMap.getCoordinateFromPixel(pixel);
      const recommendationTargetId = getRecommendationTargetIdAtPixel(pixel);

      if (recommendationTargetId) {
        setOpenMapContextMenu({
          open: false,
          top: 0,
          left: 0,
          coordinates: coordinate,
        });
        setOpenTargetFireRecommendation({
          open: true,
          top: event.clientY,
          left: event.clientX,
          targetId: recommendationTargetId,
        });
        return;
      }

      setOpenTargetFireRecommendation({
        open: false,
        top: 0,
        left: 0,
        targetId: "",
      });
      setOpenMapContextMenu({
        open: true,
        top: event.clientY,
        left: event.clientX,
        coordinates: coordinate,
      });
    };
    theMap.getViewport().addEventListener("contextmenu", handleMapContextMenu);

    refreshAllLayers();
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
    setCurrentScenarioSidesToContext(game.currentScenario.sides);
    loadFeatureEntitiesState();
    const checkpointSpectatorSession = parseRlCheckpointSpectatorSession();
    rlCheckpointSpectatorRef.current = checkpointSpectatorSession;
    lastSpectatedCheckpointKeyRef.current =
      checkpointSpectatorSession?.lastReplayKey ?? null;
    const pendingRecording = window.sessionStorage.getItem(
      RL_PENDING_RECORDING_KEY
    );
    if (pendingRecording) {
      const pendingLabel =
        window.sessionStorage.getItem(RL_PENDING_RECORDING_LABEL_KEY) ??
        "RL 평가 리플레이";
      window.sessionStorage.removeItem(RL_PENDING_RECORDING_KEY);
      window.sessionStorage.removeItem(RL_PENDING_RECORDING_LABEL_KEY);
      const loaded = loadRecordingContent(pendingRecording, {
        replayMetrics: null,
        successMessage: `${pendingLabel}를 불러왔습니다.`,
        gameStatus: checkpointSpectatorSession
          ? "RL 체크포인트 자동 재생 중"
          : "기록 재생 대기 중",
        autoPlay: Boolean(checkpointSpectatorSession),
      });
      if (!loaded) {
        toastContext?.addToast(
          "RL 평가 리플레이를 불러오지 못했습니다.",
          "error"
        );
      }
    }

    const scheduleCheckpointSpectatorPoll = (delayMs: number) => {
      if (!scenarioMapActiveRef.current || !rlCheckpointSpectatorRef.current) {
        return;
      }
      if (rlCheckpointSpectatorPollingTimeoutRef.current !== null) {
        window.clearTimeout(rlCheckpointSpectatorPollingTimeoutRef.current);
      }
      rlCheckpointSpectatorPollingTimeoutRef.current = window.setTimeout(() => {
        void pollLatestCheckpointReplay();
      }, delayMs);
    };

    const pollLatestCheckpointReplay = async () => {
      const activeSession = rlCheckpointSpectatorRef.current;
      if (!scenarioMapActiveRef.current || !activeSession) {
        return;
      }

      try {
        const jobResponse = await fetch(`/api/rl/jobs/${activeSession.jobId}`);
        if (!jobResponse.ok) {
          throw new Error("RL checkpoint spectator job polling failed.");
        }

        const payload = (await jobResponse.json()) as {
          status?: string;
          progress?: { checkpoints?: unknown };
        };
        const latestCheckpoint = findLatestReplayableCheckpoint(
          payload.progress?.checkpoints
        );

        if (latestCheckpoint) {
          const replayKey = `${latestCheckpoint.algorithm}:${latestCheckpoint.timesteps}`;
          if (lastSpectatedCheckpointKeyRef.current !== replayKey) {
            const params = new URLSearchParams({
              algorithm: latestCheckpoint.algorithm,
              timesteps: `${latestCheckpoint.timesteps}`,
            });
            const replayResponse = await fetch(
              `/api/rl/jobs/${activeSession.jobId}/checkpoint-recording?${params.toString()}`
            );
            if (!replayResponse.ok) {
              throw new Error("RL checkpoint spectator replay fetch failed.");
            }
            const replayRecording = await replayResponse.text();
            const loaded = loadRecordingContent(replayRecording, {
              replayMetrics: null,
              successMessage: `RL 체크포인트 ${latestCheckpoint.timesteps}를 불러왔습니다.`,
              gameStatus: `RL 체크포인트 ${latestCheckpoint.timesteps} 자동 재생 중`,
              autoPlay: true,
            });
            if (loaded) {
              lastSpectatedCheckpointKeyRef.current = replayKey;
            }
          }
        } else {
          setCurrentGameStatusToContext("RL 체크포인트 대기 중");
        }

        if (payload.status === "running") {
          scheduleCheckpointSpectatorPoll(2000);
          return;
        }

        clearRlCheckpointSpectatorSession();
        if (payload.status) {
          toastContext?.addToast(
            "RL 체크포인트 자동 감시를 종료했습니다.",
            "info"
          );
        }
      } catch (error) {
        console.error(error);
        scheduleCheckpointSpectatorPoll(4000);
      }
    };

    if (checkpointSpectatorSession) {
      if (!pendingRecording) {
        setCurrentGameStatusToContext("RL 체크포인트 대기 중");
        toastContext?.addToast(
          "RL 체크포인트 자동 감시를 시작했습니다.",
          "info"
        );
      }
      void pollLatestCheckpointReplay();
    }

    return () => {
      scenarioMapActiveRef.current = false;
      if (rlCheckpointSpectatorPollingTimeoutRef.current !== null) {
        window.clearTimeout(rlCheckpointSpectatorPollingTimeoutRef.current);
        rlCheckpointSpectatorPollingTimeoutRef.current = null;
      }
      if (!theMap) return;
      unByKey([pointerMoveKey, moveEndKey]);
      theMap
        .getViewport()
        .removeEventListener("contextmenu", handleMapContextMenu);
      theMap.setTarget();
    };
  }, []);

  useEffect(() => {
    const clickEventKey = theMap.on("click", (event) => {
      if (suppressNextMapClickRef.current) {
        suppressNextMapClickRef.current = false;
        return;
      }
      if (game.selectingTarget) {
        event.stopPropagation();
      }
      handleMapClick(event);
    });

    return () => {
      unByKey(clickEventKey);
    };
  }, [theMap, game, handleMapClick]);

  useEffect(() => {
    const dragBox = new DragBox({
      condition: (event) => {
        const originalEvent = event.originalEvent;
        if (terrain3dSelectionActive) {
          return mouseOnly(event);
        }
        return (
          mouseOnly(event) &&
          "ctrlKey" in originalEvent &&
          Boolean(originalEvent.ctrlKey)
        );
      },
      className: "fs-drag-select-box",
    });
    theMap.addInteraction(dragBox);

    const handleBoxEnd = () => {
      if (terrain3dSelectionActive) {
        const bounds = resolveTerrain3dBounds(
          dragBox.getGeometry().getExtent()
        );
        setTerrain3dSelectionActive(false);
        clearDragSelection();
        suppressNextMapClickRef.current = true;
        openTerrain3dPage(bounds, {
          continueSimulation: !game.scenarioPaused,
        });
        return;
      }

      const selectedFeatures = getFeaturesInExtent(
        dragBox.getGeometry().getExtent()
      );
      setOpenMapContextMenu({
        open: false,
        top: 0,
        left: 0,
        coordinates: [0, 0],
      });
      setOpenTargetFireRecommendation({
        open: false,
        top: 0,
        left: 0,
        targetId: "",
      });
      setOpenMultipleFeatureSelector({
        open: false,
        top: 0,
        left: 0,
        features: [],
      });
      if (selectedFeatures.length === 0) {
        clearDragSelection();
      } else {
        setDragSelectedFeatures(selectedFeatures);
      }
      suppressNextMapClickRef.current = true;
    };

    dragBox.on("boxend", handleBoxEnd);

    return () => {
      theMap.removeInteraction(dragBox);
    };
  }, [openTerrain3dPage, terrain3dSelectionActive, theMap]);

  useEffect(() => {
    if (dragSelectedFeatures.length === 0 || !game.currentSideId) {
      setSelectedDragRecommendationTargetId(null);
      return;
    }

    const priorities = game.getFireRecommendationTargetPriorities(
      game.currentSideId,
      dragSelectedFeatures
        .map((feature) => feature.get("id"))
        .filter((id): id is string => typeof id === "string")
    );

    setSelectedDragRecommendationTargetId(priorities[0]?.targetId ?? null);
  }, [dragSelectedFeatures, game, game.currentSideId]);

  function changeCursorType(cursorType: string = "") {
    if (theMap) {
      theMap.getViewport().style.cursor = cursorType;
    }
  }

  useEffect(() => {
    changeCursorType(terrain3dSelectionActive ? "crosshair" : "");

    return () => {
      changeCursorType("");
    };
  }, [terrain3dSelectionActive, theMap]);

  useEffect(() => {
    if (!terrain3dSelectionActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTerrain3dSelectionActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [terrain3dSelectionActive]);

  function resolveTerrain3dBounds(extent: number[]): Terrain3dBounds {
    const sourceProjection = projection ?? defaultProjection ?? undefined;
    const southwest = toLonLat([extent[0], extent[1]], sourceProjection);
    const southeast = toLonLat([extent[2], extent[1]], sourceProjection);
    const northwest = toLonLat([extent[0], extent[3]], sourceProjection);
    const northeast = toLonLat([extent[2], extent[3]], sourceProjection);
    const longitudes = [
      southwest[0],
      southeast[0],
      northwest[0],
      northeast[0],
    ];
    const latitudes = [
      southwest[1],
      southeast[1],
      northwest[1],
      northeast[1],
    ];

    return {
      west: Math.min(...longitudes),
      south: Math.min(...latitudes),
      east: Math.max(...longitudes),
      north: Math.max(...latitudes),
    };
  }

  function armTerrain3dSelection() {
    if (terrain3dSelectionActive) {
      setTerrain3dSelectionActive(false);
      return;
    }

    clearDragSelection();
    setSelectingFocusFireObjective(false);
    setTerrain3dSelectionActive(true);
    setOpenMapContextMenu({
      open: false,
      top: 0,
      left: 0,
      coordinates: [0, 0],
    });
    setOpenTargetFireRecommendation({
      open: false,
      top: 0,
      left: 0,
      targetId: "",
    });
    setOpenMultipleFeatureSelector({
      open: false,
      top: 0,
      left: 0,
      features: [],
    });
    toastContext?.addToast(
      "지형 3D로 볼 영역을 드래그해서 선택하세요.",
      "info"
    );
  }

  function getSelectedFeatureType(featureId: string): string {
    let featureType = "";
    if (game.currentScenario.getAircraft(featureId)) featureType = "aircraft";
    else if (game.currentScenario.getArmy(featureId)) featureType = "army";
    else if (game.currentScenario.getFacility(featureId))
      featureType = "facility";
    else if (game.currentScenario.getAirbase(featureId))
      featureType = "airbase";
    else if (game.currentScenario.getShip(featureId)) featureType = "ship";
    return featureType;
  }

  function getRecommendationTargetIdAtPixel(pixel: Pixel): string | null {
    if (!game.currentSideId) {
      return null;
    }

    const featuresAtPixel = getFeaturesAtPixel(pixel).filter((feature) =>
      ["aircraft", "army", "facility", "airbase", "ship"].includes(
        feature.getProperties()?.type
      )
    );
    if (featuresAtPixel.length !== 1) {
      return null;
    }

    const targetId = featuresAtPixel[0].get("id");
    const target =
      game.currentScenario.getAircraft(targetId) ??
      game.currentScenario.getArmy(targetId) ??
      game.currentScenario.getFacility(targetId) ??
      game.currentScenario.getShip(targetId) ??
      game.currentScenario.getAirbase(targetId);
    if (!target) {
      return null;
    }

    return game
      .getFocusFireHostileSideIds(game.currentSideId)
      .has(target.sideId)
      ? target.id
      : null;
  }

  function getFeaturesInExtent(extent: number[]): Feature[] {
    const selectedFeatures: Feature[] = [];
    const includedFeatureTypes = [
      "aircraft",
      "army",
      "facility",
      "airbase",
      "ship",
      "referencePoint",
    ];
    const seenIds = new Set<string>();

    theMap
      .getLayers()
      .getArray()
      .filter(
        (layer) =>
          layer instanceof VectorLayer || layer instanceof BaseVectorLayer
      )
      .forEach((layer) => {
        const source = layer.getSource() as VectorSource<Feature<Geometry>>;
        source?.getFeatures().forEach((feature) => {
          const featureType = feature.get("type");
          const featureId = feature.get("id");
          const geometry = feature.getGeometry();
          if (
            !featureId ||
            !includedFeatureTypes.includes(featureType) ||
            !geometry ||
            !geometry.intersectsExtent(extent) ||
            seenIds.has(featureId)
          ) {
            return;
          }

          seenIds.add(featureId);
          selectedFeatures.push(feature as Feature);
        });
      });

    return selectedFeatures;
  }

  function clearDragSelection() {
    setDragSelectedFeatures([]);
    setSelectedDragRecommendationTargetId(null);
  }

  function inspectDragSelectedFeature(feature: Feature<Geometry>) {
    clearDragSelection();
    handleSelectSingleFeature(feature);
  }

  function getMapClickContext(event: MapBrowserEvent<MouseEvent>): string {
    let context = "default";
    const featuresAtPixel = getFeaturesAtPixel(
      theMap.getEventPixel(event.originalEvent)
    );
    const selectedFeatureType = getSelectedFeatureType(game.selectedUnitId);
    const attackerFeatureType = getSelectedFeatureType(
      game.currentAttackParams.currentAttackerId
    );
    if (selectedFeatureType === "aircraft" && routeMeasurementDrawLine) {
      context = "moveAircraft";
    } else if (selectedFeatureType === "army" && routeMeasurementDrawLine) {
      context = "moveArmy";
    } else if (selectedFeatureType === "ship" && routeMeasurementDrawLine) {
      context = "moveShip";
    } else if (teleportingFacilityGroupIdRef.current) {
      context = "teleportFacilityGroup";
    } else if (game.selectedUnitId && teleportingUnit) {
      context = "teleportUnit";
    } else if (selectingFocusFireObjective) {
      context = "focusFireObjective";
    } else if (pendingFacilityPlacement) {
      context = "setFacilityDirection";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "aircraft" &&
      featuresAtPixel.length === 1
    ) {
      context = "aircraftSelectedAttackTarget";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "army" &&
      featuresAtPixel.length === 1
    ) {
      context = "armySelectedAttackTarget";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "ship" &&
      featuresAtPixel.length === 1
    ) {
      context = "shipSelectedAttackTarget";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "aircraft" &&
      featuresAtPixel.length !== 1
    ) {
      context = "aircraftCancelledAttack";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "army" &&
      featuresAtPixel.length !== 1
    ) {
      context = "armyCancelledAttack";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "ship" &&
      featuresAtPixel.length !== 1
    ) {
      context = "shipCancelledAttack";
    } else if (featuresAtPixel.length === 1) {
      context = "selectSingleFeature";
    } else if (featuresAtPixel.length > 1) {
      context = "selectMultipleFeatures";
    } else if (
      game.addingAircraft ||
      game.addingFacility ||
      game.addingAirbase ||
      game.addingShip ||
      game.addingReferencePoint
    ) {
      context = "addUnit";
    }
    return context;
  }

  function handleMapClick(event: MapBrowserEvent<MouseEvent>) {
    const mapClickContext = getMapClickContext(event);
    const featuresAtPixel = getFeaturesAtPixel(
      theMap.getEventPixel(event.originalEvent)
    );
    switch (mapClickContext) {
      case "moveAircraft": {
        moveAircraft(game.selectedUnitId, event.coordinate);
        break;
      }
      case "moveArmy": {
        moveArmy(game.selectedUnitId, event.coordinate);
        break;
      }
      case "moveShip": {
        moveShip(game.selectedUnitId, event.coordinate);
        break;
      }
      case "teleportUnit": {
        teleportingUnit = false;
        teleportUnit(game.selectedUnitId, event.coordinate);
        game.selectedUnitId = "";
        setCurrentGameStatusToContext(
          game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
        );
        break;
      }
      case "teleportFacilityGroup": {
        const teleportingGroupId = teleportingFacilityGroupIdRef.current;
        clearPendingFacilityGroupTeleport();
        if (teleportingGroupId) {
          teleportFacilityPlacementGroup(teleportingGroupId, event.coordinate);
        }
        setCurrentGameStatusToContext(
          game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
        );
        break;
      }
      case "focusFireObjective": {
        setFocusFireObjective(event.coordinate);
        break;
      }
      case "setFacilityDirection": {
        finalizeFacilityPlacement(event.coordinate);
        break;
      }
      case "aircraftSelectedAttackTarget": {
        const targetFeature = featuresAtPixel[0];
        const targetId = targetFeature.getProperties()?.id;
        game.handleAircraftAttack(
          game.currentAttackParams.currentAttackerId,
          targetId,
          game.currentAttackParams.currentWeaponId,
          game.currentAttackParams.currentWeaponQuantity,
          game.currentAttackParams.autoAttack
        );
        resetAttack();
        setCurrentGameStatusToContext("표적을 지정했습니다.");
        break;
      }
      case "shipSelectedAttackTarget": {
        const targetFeature = featuresAtPixel[0];
        const targetId = targetFeature.getProperties()?.id;
        game.handleShipAttack(
          game.currentAttackParams.currentAttackerId,
          targetId,
          game.currentAttackParams.currentWeaponId,
          game.currentAttackParams.currentWeaponQuantity,
          game.currentAttackParams.autoAttack
        );
        resetAttack();
        setCurrentGameStatusToContext("표적을 지정했습니다.");
        break;
      }
      case "armySelectedAttackTarget": {
        const targetFeature = featuresAtPixel[0];
        const targetId = targetFeature.getProperties()?.id;
        game.handleArmyAttack(
          game.currentAttackParams.currentAttackerId,
          targetId,
          game.currentAttackParams.currentWeaponId,
          game.currentAttackParams.currentWeaponQuantity,
          game.currentAttackParams.autoAttack
        );
        resetAttack();
        setCurrentGameStatusToContext("표적을 지정했습니다.");
        break;
      }
      case "aircraftCancelledAttack": {
        resetAttack();
        break;
      }
      case "armyCancelledAttack": {
        resetAttack();
        break;
      }
      case "shipCancelledAttack": {
        resetAttack();
        break;
      }
      case "selectSingleFeature":
        handleSelectSingleFeature(featuresAtPixel[0]);
        break;
      case "selectMultipleFeatures":
        handleSelectMultipleFeatures(featuresAtPixel);
        break;
      case "addUnit":
        handleAddUnit(event.coordinate);
        break;
      case "default":
        break;
    }
  }

  function handleSelectSingleFeature(feature: Feature) {
    const currentSelectedFeatureId = feature.getProperties()?.id;
    const currentSelectedFeatureType = feature.getProperties()?.type;
    const currentSelectedFeatureSideId = feature.getProperties()?.sideId;

    if (
      !game.godMode &&
      currentSelectedFeatureSideId &&
      currentSelectedFeatureSideId !== game.currentSideId
    )
      return;

    if (currentSelectedFeatureId) {
      if (
        currentSelectedFeatureType === "aircraft" &&
        game.currentScenario.getAircraft(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeAircraft(currentSelectedFeatureId);
          return;
        }
        game.selectedUnitId = "";
        const aircraft = game.currentScenario.getAircraft(
          currentSelectedFeatureId
        );
        if (aircraft) {
          aircraft.selected = false;
          aircraftLayer.updateAircraftFeature(
            aircraft.id,
            aircraft.selected,
            aircraft.heading
          );
        }
        const aircraftGeometry = feature.getGeometry() as Point;
        const aircraftCoordinate = aircraftGeometry.getCoordinates();
        const aircraftPixels =
          theMap.getPixelFromCoordinate(aircraftCoordinate);
        setOpenAircraftCard({
          open: true,
          top: aircraftPixels[1],
          left: aircraftPixels[0],
          aircraftId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "airbase" &&
        game.currentScenario.getAirbase(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeAirbase(currentSelectedFeatureId);
          return;
        }
        const airbaseGeometry = feature.getGeometry() as Point;
        const airbaseCoordinate = airbaseGeometry.getCoordinates();
        const airbasePixels = theMap.getPixelFromCoordinate(airbaseCoordinate);
        setOpenAirbaseCard({
          open: true,
          top: airbasePixels[1],
          left: airbasePixels[0],
          airbaseId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "army" &&
        game.currentScenario.getArmy(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeArmy(currentSelectedFeatureId);
          return;
        }
        game.selectedUnitId = "";
        const army = game.currentScenario.getArmy(currentSelectedFeatureId);
        if (army) {
          army.selected = false;
          armyLayer.updateArmyFeature(army.id, army.selected, army.heading);
        }
        const armyGeometry = feature.getGeometry() as Point;
        const armyCoordinate = armyGeometry.getCoordinates();
        const armyPixels = theMap.getPixelFromCoordinate(armyCoordinate);
        setOpenArmyCard({
          open: true,
          top: armyPixels[1],
          left: armyPixels[0],
          armyId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "facility" &&
        game.currentScenario.getFacility(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeFacility(currentSelectedFeatureId);
          return;
        }
        const facilityGeometry = feature.getGeometry() as Point;
        const facilityCoordinate = facilityGeometry.getCoordinates();
        const facilityPixels =
          theMap.getPixelFromCoordinate(facilityCoordinate);
        setOpenFacilityCard({
          open: true,
          top: facilityPixels[1],
          left: facilityPixels[0],
          facilityId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "ship" &&
        game.currentScenario.getShip(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeShip(currentSelectedFeatureId);
          return;
        }
        game.selectedUnitId = "";
        const ship = game.currentScenario.getShip(currentSelectedFeatureId);
        if (ship) {
          ship.selected = false;
          shipLayer.updateShipFeature(ship.id, ship.selected, ship.heading);
        }
        const shipGeometry = feature.getGeometry() as Point;
        const shipCoordinate = shipGeometry.getCoordinates();
        const shipPixels = theMap.getPixelFromCoordinate(shipCoordinate);
        setOpenShipCard({
          open: true,
          top: shipPixels[1],
          left: shipPixels[0],
          shipId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "referencePoint" &&
        game.currentScenario.getReferencePoint(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeReferencePoint(currentSelectedFeatureId);
          return;
        }
        const referencePointGeometry = feature.getGeometry() as Point;
        const referencePointCoordinate =
          referencePointGeometry.getCoordinates();
        const referencePointPixels = theMap.getPixelFromCoordinate(
          referencePointCoordinate
        );
        setOpenReferencePointCard({
          open: true,
          top: referencePointPixels[1],
          left: referencePointPixels[0],
          referencePointId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "weapon" &&
        game.currentScenario.getWeapon(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeWeapon(currentSelectedFeatureId);
          return;
        }
        const weaponGeometry = feature.getGeometry() as Point;
        const weaponCoordinate = weaponGeometry.getCoordinates();
        const weaponPixels = theMap.getPixelFromCoordinate(weaponCoordinate);
        setOpenWeaponCard({
          open: true,
          top: weaponPixels[1],
          left: weaponPixels[0],
          weaponId: currentSelectedFeatureId,
        });
      }
      setKeyboardShortcutsEnabled(false);
    }
  }

  function handleSelectMultipleFeatures(features: Feature[]) {
    if (features.length < 2) return;
    const singleFeatureGeometry = features[0].getGeometry() as Point;
    const singleFeatureCoordinates = singleFeatureGeometry.getCoordinates();
    const singleFeaturePixels = theMap.getPixelFromCoordinate(
      singleFeatureCoordinates
    );
    setOpenMultipleFeatureSelector({
      open: true,
      top: singleFeaturePixels[1],
      left: singleFeaturePixels[0],
      features: features,
    });
  }

  function handleAddUnit(coordinates: number[]) {
    const unitClassSelected = game.selectedUnitClassName;
    if (game.addingAircraft) {
      const aircraftTemplate = unitDbContext
        .getAircraftDb()
        .find((aircraft) => aircraft.className === unitClassSelected);
      addAircraft(
        coordinates,
        aircraftTemplate?.className,
        aircraftTemplate?.speed,
        aircraftTemplate?.maxFuel,
        aircraftTemplate?.fuelRate,
        aircraftTemplate?.range
      );
      game.addingAircraft = false;
    } else if (game.addingFacility) {
      if (!pendingFacilityPlacement) {
        pendingFacilityPlacementRef.current = [...coordinates];
        setPendingFacilityPlacement([...coordinates]);
        updatePendingFacilityPlacementPreview(coordinates);
        setCurrentGameStatusToContext(
          facilityPlacementDefaultsRef.current
            ? `위치를 고정했습니다. ${
                facilityPlacementDefaultsRef.current.formation
                  ? `${facilityPlacementDefaultsRef.current.formation.unitCount}개 포대 분산 템플릿과 권장 부채꼴이 먼저 적용됐습니다.`
                  : "권장 부채꼴이 먼저 적용됐습니다."
              } 마우스를 움직여 수정한 뒤 한 번 더 클릭해 확정하세요.`
            : "위치를 고정했습니다. 마우스를 움직여 부채꼴 방향을 맞추고 한 번 더 클릭해 확정하세요."
        );
        return;
      }
      return;
    } else if (game.addingAirbase) {
      const airbaseTemplate = unitDbContext
        .getAirbaseDb()
        .find((airbase) => airbase.name === unitClassSelected);
      addAirbase(coordinates, airbaseTemplate?.name);
      game.addingAirbase = false;
    } else if (game.addingShip) {
      const shipTemplate = unitDbContext
        .getShipDb()
        .find((ship) => ship.className === unitClassSelected);
      addShip(
        coordinates,
        shipTemplate?.className,
        shipTemplate?.speed,
        shipTemplate?.maxFuel,
        shipTemplate?.fuelRate,
        shipTemplate?.range
      );
      game.addingShip = false;
    } else if (game.addingReferencePoint) {
      addReferencePoint(coordinates);
      game.addingReferencePoint = false;
    }
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    updateSelectedUnitClassName(null);
  }

  function finalizeFacilityPlacement(directionCoordinates: number[]) {
    if (!pendingFacilityPlacementRef.current) {
      return;
    }

    const deploymentDefaults = facilityPlacementDefaultsRef.current;
    const previews = getPendingFacilityPlacementPreviews(directionCoordinates);
    if (!previews || previews.length === 0) {
      clearPendingFacilityPlacement();
      return;
    }

    const createdFacilities = previews
      .map((preview) =>
        addFacility(
          fromLonLat(
            [preview.longitude, preview.latitude],
            theMap.getView().getProjection()
          ),
          preview.className,
          preview.range,
          preview.heading
        )
      )
      .filter((facility): facility is Facility => Boolean(facility));
    const createdFacilityGroup = registerFacilityPlacementGroup(
      createdFacilities,
      deploymentDefaults?.formation?.templateLabel
    );

    clearPendingFacilityPlacement();
    facilityPlacementDefaultsRef.current = null;
    game.addingFacility = false;
    changeCursorType("");
    if (createdFacilityGroup) {
      selectFacilityPlacementGroup(createdFacilityGroup);
      toastContext?.addToast(
        `${createdFacilityGroup.label} 묶음 ${createdFacilityGroup.facilityIds.length}개를 배치했습니다.`
      );
    }
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    updateSelectedUnitClassName(null);
  }

  function toggleFocusFireMode() {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    if (!game.focusFireOperation.enabled) {
      if (!game.currentSideId || game.currentScenario.sides.length === 0) {
        toastContext?.addToast(
          "집중포격 모드를 사용하려면 먼저 세력을 선택하세요.",
          "error"
        );
        return;
      }
      game.setFocusFireMode(true);
      setFocusFireDockOpen(true);
      setCurrentGameStatusToContext(
        "집중포격 모드가 켜졌습니다. 화력을 모은 뒤 목표 지점을 지정하세요."
      );
      return;
    }

    setSelectingFocusFireObjective(false);
    game.setFocusFireMode(false);
    refreshAllLayers();
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
  }

  function armFocusFireObjectiveSelection() {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    if (!game.currentSideId || game.currentScenario.sides.length === 0) {
      toastContext?.addToast(
        "집중포격 목표를 지정하려면 먼저 세력을 선택하세요.",
        "error"
      );
      return;
    }

    if (!game.focusFireOperation.enabled) {
      game.setFocusFireMode(true);
    }

    setFocusFireDockOpen(true);
    setSelectingFocusFireObjective(true);
    changeCursorType("crosshair");
    setCurrentGameStatusToContext("집중포격 목표 지점을 클릭하세요.");
  }

  function setFocusFireObjective(coordinates: number[]) {
    const [longitude, latitude] = toLonLat(
      coordinates,
      theMap.getView().getProjection()
    );
    const objective = game.setFocusFireObjective(latitude, longitude);
    setSelectingFocusFireObjective(false);
    changeCursorType("");
    if (objective) {
      setFocusFireDockOpen(true);
      refreshAllLayers();
      setCurrentGameStatusToContext(
        "집중포격 목표를 지정했습니다. 항공/화력 자산이 즉시 집중됩니다."
      );
    }
  }

  function clearFocusFireObjective() {
    setSelectingFocusFireObjective(false);
    changeCursorType("");
    game.clearFocusFireOperation(true, true);
    refreshAllLayers();
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
  }

  function openFocusFireAirwatch() {
    const summary = game.getFocusFireSummary();
    if (
      summary.objectiveLongitude === null ||
      summary.objectiveLatitude === null
    ) {
      toastContext?.addToast(
        "공중 관측을 열려면 먼저 집중포격 목표를 지정하세요.",
        "error"
      );
      return;
    }

    const continueSimulation = !game.scenarioPaused;

    openFlightSimPage(
      [summary.objectiveLongitude, summary.objectiveLatitude],
      "jet",
      {
        objectiveName: summary.objectiveName ?? undefined,
        objectiveLon: summary.objectiveLongitude,
        objectiveLat: summary.objectiveLatitude,
        active: summary.active,
        captureProgress: summary.captureProgress,
        aircraftCount: summary.aircraftCount,
        artilleryCount: summary.artilleryCount,
        armorCount: summary.armorCount,
        weaponsInFlight: summary.weaponsInFlight,
        statusLabel: summary.statusLabel,
        launchPlatforms: summary.launchPlatforms,
        weaponTracks: summary.weaponTracks,
        continueSimulation,
      }
    );
  }

  function handleStartScenario(mode: ScenarioLaunchMode) {
    if (!shouldRunScenarioImmediatelyAfterLaunchModeSelection(mode)) {
      game.scenarioPaused = true;
      setCurrentGameStatusToContext(
        "3D 영역을 선택한 뒤 3D 창에서 실행을 눌러 시뮬레이션을 시작하세요."
      );
      setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
      armTerrain3dSelection();
      return;
    }

    void handlePlayGameClick();
  }

  function getFeaturesAtPixel(pixel: Pixel): Feature[] {
    const selectedFeatures: Feature[] = [];
    const excludedFeatureTypes = [
      "rangeRing",
      "route",
      "aircraftFeatureLabel",
      "armyFeatureLabel",
      "facilityFeatureLabel",
      "airbaseFeatureLabel",
      "shipFeatureLabel",
    ];
    const includedFeatureTypes = [
      "aircraft",
      "army",
      "facility",
      "airbase",
      "ship",
      "weapon",
      "referencePoint",
    ];
    theMap.forEachFeatureAtPixel(
      pixel,
      function (feature) {
        if (includedFeatureTypes.includes(feature.getProperties()?.type))
          selectedFeatures.push(feature as Feature);
      },
      { hitTolerance: 5 }
    );
    return selectedFeatures;
  }

  function loadFeatureEntitiesState() {
    if (!theMap) return;

    const vectorLayers = theMap
      .getLayers()
      .getArray()
      .filter(
        (layer) =>
          layer instanceof VectorLayer || layer instanceof BaseVectorLayer
      );

    const visibleFeaturesMap: Record<string, FeatureEntityState> = {};

    const features = vectorLayers
      .map((layer) => layer.getSource().getFeatures())
      .flat();

    const entityTypes = [
      "aircraft",
      "airbase",
      "army",
      "facility",
      "ship",
      "referencePoint",
    ];
    for (const feature of features) {
      if (
        ["rangeRing", "route"].includes(feature.get("type")) ||
        visibleFeaturesMap[feature.get("id")] !== undefined
      ) {
        continue;
      }
      if (entityTypes.includes(feature.get("type"))) {
        visibleFeaturesMap[feature.get("id")] = {
          id: feature.get("id"),
          name: feature.get("name"),
          type: feature.get("type"),
          sideId: feature.get("sideId"),
          sideColor: feature.get("sideColor"),
        };
      }
    }

    setFeatureEntitiesState(Object.values(visibleFeaturesMap));
    loadFacilityPlacementGroupsFromScenario();
  }

  function handleFeatureEntityStateAction(
    payload: Partial<FeatureEntityState>,
    action: "add" | "remove"
  ) {
    if (action === "remove") {
      setFeatureEntitiesState((prevFeatures) =>
        prevFeatures.filter((feature) => feature.id !== payload.id)
      );
    }

    if (action === "add") {
      const existingFeature = featureEntitiesState.find(
        (feature) => feature.id === payload.id
      );
      if (!existingFeature) {
        setFeatureEntitiesState((prevFeatures) => [
          payload as FeatureEntityState,
          ...prevFeatures,
        ]);
      }
    }
  }

  function updateSelectedUnitClassName(unitClassName: string | null) {
    game.selectedUnitClassName = unitClassName;
  }

  function setAddingAircraft(unitClassName: string) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingAircraft = !game.addingAircraft;
    game.addingFacility = false;
    game.addingAirbase = false;
    game.addingShip = false;
    game.addingReferencePoint = false;
    if (game.addingAircraft) {
      setCurrentGameStatusToContext("지도를 클릭해 항공기를 배치하세요.");
      updateSelectedUnitClassName(unitClassName);
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingFacility(
    unitClassName: string,
    deploymentDefaults?: AssetPlacementDeploymentDefaults
  ) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = deploymentDefaults ?? null;
    game.addingFacility = !game.addingFacility;
    game.addingAircraft = false;
    game.addingAirbase = false;
    game.addingShip = false;
    game.addingReferencePoint = false;
    if (game.addingFacility) {
      changeCursorType("crosshair");
      setCurrentGameStatusToContext(
        deploymentDefaults?.formation
          ? `지도를 클릭해 ${deploymentDefaults.formation.unitCount}개 포대 분산 템플릿의 중심 위치를 놓으세요.`
          : "지도를 클릭해 지상 무기체계 위치를 놓으세요."
      );
      updateSelectedUnitClassName(unitClassName);
    } else {
      facilityPlacementDefaultsRef.current = null;
      changeCursorType("");
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingAirbase(unitClassName: string) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingAirbase = !game.addingAirbase;
    game.addingAircraft = false;
    game.addingFacility = false;
    game.addingShip = false;
    game.addingReferencePoint = false;
    if (game.addingAirbase) {
      setCurrentGameStatusToContext("지도를 클릭해 기지를 배치하세요.");
      updateSelectedUnitClassName(unitClassName);
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingShip(unitClassName: string) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingShip = !game.addingShip;
    game.addingAircraft = false;
    game.addingFacility = false;
    game.addingAirbase = false;
    game.addingReferencePoint = false;
    if (game.addingShip) {
      setCurrentGameStatusToContext("지도를 클릭해 함정을 배치하세요.");
      updateSelectedUnitClassName(unitClassName);
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingReferencePoint() {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingReferencePoint = !game.addingReferencePoint;
    game.addingAircraft = false;
    game.addingFacility = false;
    game.addingAirbase = false;
    game.addingShip = false;
    if (game.addingReferencePoint) {
      setCurrentGameStatusToContext("지도를 클릭해 참조점을 추가하세요.");
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
    }
  }

  function handleUndo() {
    setGamePaused();
    if (game.undo()) {
      setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
      refreshAllLayers();
      loadFeatureEntitiesState();
    }
  }

  function toggleRecordEverySeconds() {
    game.playbackRecorder.switchRecordingInterval();
    setCurrentRecordingIntervalSeconds(
      game.playbackRecorder.recordEverySeconds
    );
  }

  function handleRecordScenarioClick() {
    game.recordingScenario = true;
    game.startRecording();
  }

  function handleStopRecordingScenarioClick() {
    game.recordingScenario = false;
    // game.exportRecourseRecording();
    game.exportRecording();
  }

  function handleLoadRecording() {
    clearRlCheckpointSpectatorSession();
    setGamePaused();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jsonl";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (
          !loadRecordingContent(content, {
            replayMetrics: null,
            successMessage: "기록 파일을 불러왔습니다.",
            gameStatus: "기록 재생 대기 중",
          })
        ) {
          toastContext?.addToast("기록 파일을 불러오지 못했습니다.", "error");
          return;
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleLoadFixedTargetStrikeReplay() {
    clearRlCheckpointSpectatorSession();
    setGamePaused();
    loadRecordingContent(fixedTargetStrikeRlDemo.recording, {
      replayMetrics: fixedTargetStrikeRlDemo.metrics,
      successMessage: "강화학습 타격 리플레이를 불러왔습니다.",
      gameStatus: "강화학습 리플레이 대기 중",
    });
  }

  async function presentSimulationOutcome() {
    const requestId = simulationOutcomeRequestIdRef.current + 1;
    simulationOutcomeRequestIdRef.current = requestId;

    const summary = buildSimulationOutcomeSummary(game);
    setSimulationOutcomeSummary(summary);
    setSimulationOutcomeNarrative(summary.fallbackSummary);
    setSimulationOutcomeNarrativeSource("fallback");
    setSimulationOutcomeLoading(true);
    setIsGameOver(true);
    setCurrentGameStatusToContext(
      `${summary.endReason} · ${summary.activeSideSummary}`
    );

    const narrative = await requestSimulationOutcomeNarrative(summary);
    if (simulationOutcomeRequestIdRef.current !== requestId) {
      return;
    }

    setSimulationOutcomeNarrative(narrative.text);
    setSimulationOutcomeNarrativeSource(narrative.source);
    setSimulationOutcomeLoading(false);
  }

  function handleStepGameClick() {
    game.recordStep(true);
    setGamePaused();
    const [observation, reward, terminated, truncated, info] =
      stepGameAndDrawFrame();
    // logging as test
    console.log("Located in handleStepGameClick()");
    console.log("Game Step Info:", { observation });
    console.log("Current time: ", game.currentScenario.currentTime);
    if ((terminated as boolean) || (truncated as boolean)) {
      void presentSimulationOutcome();
    }
  }

  function handlePauseGameClick() {
    setGamePaused();
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
  }

  function loadAndDisplayCurrentRecordedFrame(
    refreshAll = false,
    announceLiveCommentary = false
  ) {
    game.loadScenario(game.recordingPlayer.getCurrentStep());
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
    updateCurrentSimulationLogsToContext({
      announceLiveCommentary,
    });
    const recordingStep = game.recordingPlayer.getCurrentStepIndex();
    setCurrentRecordingStepToContext(recordingStep);
    setActiveReplayMetric(getReplayMetricForStep(recordingStep));
    if (refreshAll) refreshAllLayers();
    else drawNextFrame(game.currentScenario);
  }

  async function handlePlayRecordingClick() {
    game.recordingPlayer.playing = true;
    while (
      !game.recordingPlayer.isAtEnd() &&
      !game.recordingPlayer.isPaused()
    ) {
      game.recordingPlayer.nextStep();
      loadAndDisplayCurrentRecordedFrame();
      await delay(50);
    }
  }

  function handlePauseRecordingClick() {
    game.recordingPlayer.playing = false;
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
    setCurrentRecordingStepToContext(
      game.recordingPlayer.getCurrentStepIndex()
    );
  }

  function handleStepRecordingToStep(step: number) {
    if (game.recordingPlayer.isAtStep(step)) return;
    game.recordingPlayer.setCurrentStepIndex(step);
    loadAndDisplayCurrentRecordedFrame(true);
  }

  function handleStepRecordingBackwards() {
    if (game.recordingPlayer.isAtStart()) return;
    game.recordingPlayer.previousStep();
    loadAndDisplayCurrentRecordedFrame(true);
  }

  function handleStepRecordingForwards() {
    if (game.recordingPlayer.isAtEnd()) return;
    game.recordingPlayer.nextStep();
    loadAndDisplayCurrentRecordedFrame(true);
  }

  useEffect(() => {
    if (!game.scenarioPaused) {
      void handlePlayGameClick();
    }
  }, []);

  async function handlePlayGameClick() {
    game.recordStep(true);
    setCurrentGameStatusToContext("시뮬레이션 진행 중");
    game.scenarioPaused = false;
    const initialEndState = game.getGameEndState();
    let gameEnded = initialEndState.terminated || initialEndState.truncated;
    if (gameEnded) {
      void presentSimulationOutcome();
      return;
    }
    while (scenarioMapActiveRef.current && !game.scenarioPaused && !gameEnded) {
      const [_observation, _reward, terminated, truncated, _info] =
        stepGameAndDrawFrame();

      const status = terminated || truncated;
      if ((terminated as boolean) || (truncated as boolean)) {
        console.log("Game ended, located in handlePlayGameClick()");
        console.log("Info:", { terminated, truncated });
        void presentSimulationOutcome();
      }
      gameEnded = status as boolean;

      await delay(
        GAME_SPEED_DELAY_MS[game.currentScenario.timeCompression] ??
          GAME_SPEED_DELAY_MS[1]
      );
    }
  }

  function stepGameForStepSize(stepSize: number): GameStepResult {
    return game.stepForTimeCompression(stepSize);
  }

  function stepGameAndDrawFrame() {
    // const gameStepStartTime = new Date().getTime();
    const [observation, reward, terminated, truncated, info] =
      stepGameForStepSize(game.currentScenario.timeCompression);
    // const gameStepElapsed = new Date().getTime() - gameStepStartTime;

    setCurrentScenarioTimeToContext(observation.currentTime);
    updateCurrentSimulationLogsToContext();

    // const guiDrawStartTime = new Date().getTime();
    drawNextFrame(observation);
    game.recordStep();
    // const guiDrawElapsed = new Date().getTime() - guiDrawStartTime;
    // console.log('gameStepElapsed:', gameStepElapsed, 'guiDrawElapsed:', guiDrawElapsed)

    return [observation, reward, terminated, truncated, info];
  }

  function drawNextFrame(observation: Scenario) {
    aircraftLayer.refresh(observation.aircraft);
    refreshWeaponTrajectoryLayer(observation);
    weaponLayer.refresh(observation.weapons);
    shipLayer.refresh(observation.ships);
    armyLayer.refresh(observation.armies);
    facilityLayer.refresh(observation.facilities);
    airbasesLayer.refresh(observation.airbases);
    refreshRouteLayer(observation);
    if (featureLabelVisible) {
      featureLabelLayer.refreshSubset(observation.aircraft, "aircraft");
      featureLabelLayer.refreshSubset(observation.armies, "army");
      featureLabelLayer.refreshSubset(observation.ships, "ship");
      featureLabelLayer.refreshSubset(observation.facilities, "facility");
      featureLabelLayer.refreshSubset(observation.airbases, "airbase");
    }
    if (threatRangeVisible)
      threatRangeLayer.refresh([
        ...observation.armies,
        ...observation.facilities,
        ...observation.ships,
      ]);
    if (
      referencePointLayer.featureCount !== observation.referencePoints.length
    ) {
      referencePointLayer.refresh(observation.referencePoints);
      if (featureLabelVisible)
        featureLabelLayer.refreshSubset(
          observation.referencePoints,
          "referencePoint"
        );
    }
  }

  function setGamePaused() {
    game.scenarioPaused = true;
    setCurrentGameStatusToContext("시뮬레이션 일시정지");
  }

  function addAircraft(
    coordinates: number[],
    className?: string,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    className = className ?? "F-22Z";
    const aircraftName =
      getDisplayName(className) + " #" + randomInt(1, 5000).toString();
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newAircraft = game.addAircraft(
      aircraftName,
      className,
      latitude,
      longitude,
      speed,
      maxFuel,
      fuelRate,
      range
    );
    if (newAircraft) {
      aircraftLayer.addAircraftFeature(newAircraft);
      handleFeatureEntityStateAction(
        {
          id: newAircraft.id,
          name: newAircraft.name,
          type: "aircraft",
          sideId: newAircraft.sideId,
          sideColor: newAircraft.sideColor,
        },
        "add"
      );
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newAircraft);
    }
  }

  function addAircraftToAirbase(airbaseId: string, aircraftClassName: string) {
    const aircraftTemplate = unitDbContext
      .getAircraftDb()
      .find((aircraft) => aircraft.className === aircraftClassName);
    return game.addAircraftToAirbase(
      airbaseId,
      aircraftClassName,
      aircraftTemplate?.speed,
      aircraftTemplate?.maxFuel,
      aircraftTemplate?.fuelRate,
      aircraftTemplate?.range
    );
  }

  function removeAircraftFromAirbase(airbaseId: string, aircraftIds: string[]) {
    return game.removeAircraftFromAirbase(airbaseId, aircraftIds);
  }

  function addFacility(
    coordinates: number[],
    className?: string,
    range?: number,
    heading: number = 0
  ) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    className = className ?? "SAM";
    const facilityName =
      getDisplayName(className) + " #" + randomInt(1, 5000).toString();
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newFacility = game.addFacility(
      facilityName,
      className,
      latitude,
      longitude,
      range,
      heading
    );
    if (newFacility) {
      facilityLayer.addFacilityFeature(newFacility);
      handleFeatureEntityStateAction(
        {
          id: newFacility.id,
          name: newFacility.name,
          type: "facility",
          sideId: newFacility.sideId,
          sideColor: newFacility.sideColor,
        },
        "add"
      );
      if (threatRangeVisible) threatRangeLayer.addRangeFeature(newFacility);
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newFacility);
    }
    return newFacility;
  }

  function addAirbase(
    olCoordinates: number[],
    name?: string,
    realCoordinates?: number[]
  ) {
    const coordinates =
      realCoordinates ??
      toLonLat(olCoordinates, theMap.getView().getProjection());
    const airbaseName =
      getDisplayName(name ?? "Airfield") + " #" + randomInt(1, 5000).toString();
    const className = "Airfield";
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newAirbase = game.addAirbase(
      airbaseName,
      className,
      latitude,
      longitude
    );
    if (newAirbase) {
      airbasesLayer.addAirbaseFeature(newAirbase);
      handleFeatureEntityStateAction(
        {
          id: newAirbase.id,
          name: newAirbase.name,
          type: "airbase",
          sideId: newAirbase.sideId,
          sideColor: newAirbase.sideColor,
        },
        "add"
      );
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newAirbase);
    }
  }

  function removeAirbase(airbaseId: string) {
    game.removeAirbase(airbaseId);
    airbasesLayer.removeFeatureById(airbaseId);
    handleFeatureEntityStateAction({ id: airbaseId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(airbaseId);
  }

  function closeFeatureCard(feature: FeatureEntityState) {
    let cardClosed = false;

    if (
      feature.type === "airbase" &&
      openAirbaseCard.open &&
      openAirbaseCard.airbaseId === feature.id
    ) {
      setOpenAirbaseCard({
        open: false,
        top: 0,
        left: 0,
        airbaseId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "army" &&
      openArmyCard.open &&
      openArmyCard.armyId === feature.id
    ) {
      setOpenArmyCard({
        open: false,
        top: 0,
        left: 0,
        armyId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "facility" &&
      openFacilityCard.open &&
      openFacilityCard.facilityId === feature.id
    ) {
      setOpenFacilityCard({
        open: false,
        top: 0,
        left: 0,
        facilityId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "aircraft" &&
      openAircraftCard.open &&
      openAircraftCard.aircraftId === feature.id
    ) {
      setOpenAircraftCard({
        open: false,
        top: 0,
        left: 0,
        aircraftId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "ship" &&
      openShipCard.open &&
      openShipCard.shipId === feature.id
    ) {
      setOpenShipCard({
        open: false,
        top: 0,
        left: 0,
        shipId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "referencePoint" &&
      openReferencePointCard.open &&
      openReferencePointCard.referencePointId === feature.id
    ) {
      setOpenReferencePointCard({
        open: false,
        top: 0,
        left: 0,
        referencePointId: "",
      });
      cardClosed = true;
    }

    if (cardClosed) {
      setKeyboardShortcutsEnabled(true);
    }
  }

  function removeFacility(facilityId: string, skipGroupSync: boolean = false) {
    game.removeFacility(facilityId);
    facilityLayer.removeFeatureById(facilityId);
    threatRangeLayer.removeFeatureById(facilityId);
    handleFeatureEntityStateAction({ id: facilityId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(facilityId);
    if (!skipGroupSync) {
      loadFacilityPlacementGroupsFromScenario();
    }
  }

  function removeArmy(armyId: string) {
    game.removeArmy(armyId);
    armyLayer.removeFeatureById(armyId);
    armyRouteLayer.removeFeatureById(armyId);
    threatRangeLayer.removeFeatureById(armyId);
    handleFeatureEntityStateAction({ id: armyId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(armyId);
  }

  function removeAircraft(aircraftId: string) {
    game.removeAircraft(aircraftId);
    aircraftLayer.removeFeatureById(aircraftId);
    aircraftRouteLayer.removeFeatureById(aircraftId);
    handleFeatureEntityStateAction({ id: aircraftId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(aircraftId);
  }

  function addReferencePoint(coordinates: number[], name?: string) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    name = name ?? "참조점 #" + randomInt(1, 5000).toString();
    const newReferencePoint = game.addReferencePoint(
      name,
      coordinates[1],
      coordinates[0]
    );
    if (newReferencePoint) {
      referencePointLayer.addReferencePointFeature(newReferencePoint);
      handleFeatureEntityStateAction(
        {
          id: newReferencePoint.id,
          name: newReferencePoint.name,
          type: "referencePoint",
          sideId: newReferencePoint.sideId,
          sideColor: newReferencePoint.sideColor,
        },
        "add"
      );
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newReferencePoint);
    }
  }

  function removeReferencePoint(referencePointId: string) {
    game.removeReferencePoint(referencePointId);
    referencePointLayer.removeFeatureById(referencePointId);
    handleFeatureEntityStateAction({ id: referencePointId }, "remove");
    if (featureLabelVisible)
      featureLabelLayer.removeFeatureById(referencePointId);
  }

  function handleDeleteFeatureEntity(feature: FeatureEntityState) {
    closeFeatureCard(feature);
    if (game.selectedUnitId === feature.id) {
      game.selectedUnitId = "";
    }

    switch (feature.type) {
      case "aircraft":
        removeAircraft(feature.id);
        break;
      case "airbase":
        removeAirbase(feature.id);
        break;
      case "army":
        removeArmy(feature.id);
        break;
      case "facility":
        removeFacility(feature.id);
        break;
      case "ship":
        removeShip(feature.id);
        break;
      case "referencePoint":
        removeReferencePoint(feature.id);
        break;
      default:
        break;
    }
  }

  function removeWeapon(weaponId: string) {
    game.removeWeapon(weaponId);
    weaponLayer.removeFeatureById(weaponId);
  }

  function addShip(
    coordinates: number[],
    className?: string,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    className = className ?? "Carrier";
    const shipName =
      getDisplayName(className) + " #" + randomInt(1, 5000).toString();
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newShip = game.addShip(
      shipName,
      className,
      latitude,
      longitude,
      speed,
      maxFuel,
      fuelRate,
      range
    );
    if (newShip) {
      shipLayer.addShipFeature(newShip);
      handleFeatureEntityStateAction(
        {
          id: newShip.id,
          name: newShip.name,
          type: "ship",
          sideId: newShip.sideId,
          sideColor: newShip.sideColor,
        },
        "add"
      );
      if (threatRangeVisible) threatRangeLayer.addRangeFeature(newShip);
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newShip);
    }
  }

  function addAircraftToShip(shipId: string, aircraftClassName: string) {
    const aircraftTemplate = unitDbContext
      .getAircraftDb()
      .find((aircraft) => aircraft.className === aircraftClassName);
    return game.addAircraftToShip(
      shipId,
      aircraftClassName,
      aircraftTemplate?.speed,
      aircraftTemplate?.maxFuel,
      aircraftTemplate?.fuelRate,
      aircraftTemplate?.range
    );
  }

  function removeAircraftFromShip(shipId: string, aircraftIds: string[]) {
    return game.removeAircraftFromShip(shipId, aircraftIds);
  }

  function removeShip(shipId: string) {
    game.removeShip(shipId);
    shipLayer.removeFeatureById(shipId);
    shipRouteLayer.removeFeatureById(shipId);
    threatRangeLayer.removeFeatureById(shipId);
    handleFeatureEntityStateAction({ id: shipId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(shipId);
  }

  function moveShip(shipId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    game.moveShip(shipId, destinationLatitude, destinationLongitude);
  }

  function moveArmy(armyId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    game.moveArmy(armyId, destinationLatitude, destinationLongitude);
  }

  function launchAircraftFromShip(shipId: string, aircraftIds: string[]) {
    const launchedAircraft = game.launchAircraftFromShip(shipId, aircraftIds);
    if (launchedAircraft.length > 0) {
      launchedAircraft.forEach((aircraft) => {
        aircraftLayer.addAircraftFeature(aircraft);
        if (featureLabelVisible)
          featureLabelLayer.addFeatureLabelFeature(aircraft);
      });
    }
    let shipAircraft: Aircraft[] = [];
    const ship = game.currentScenario.getShip(shipId);
    if (ship) {
      shipAircraft = ship.aircraft;
    }
    return shipAircraft;
  }

  function moveAircraft(aircraftId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    game.moveAircraft(aircraftId, destinationLatitude, destinationLongitude);
  }

  function teleportUnit(unitId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    const teleportedUnit = game.teleportUnit(
      unitId,
      destinationLatitude,
      destinationLongitude
    );
    if (teleportedUnit) refreshAllLayers();
  }

  function launchAircraftFromAirbase(airbaseId: string, aircraftIds: string[]) {
    const launchedAircraft = game.launchAircraftFromAirbase(
      airbaseId,
      aircraftIds
    );
    if (launchedAircraft.length > 0) {
      launchedAircraft.forEach((aircraft) => {
        aircraftLayer.addAircraftFeature(aircraft);
        if (featureLabelVisible)
          featureLabelLayer.addFeatureLabelFeature(aircraft);
      });
    }
    let airbaseAircraft: Aircraft[] = [];
    const airbase = game.currentScenario.getAirbase(airbaseId);
    if (airbase) {
      airbaseAircraft = airbase.aircraft;
    }
    return airbaseAircraft;
  }

  function resetAttack() {
    game.selectingTarget = false;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: "",
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    changeCursorType("");
  }

  function handleAircraftAttack(
    aircraftId: string,
    weaponId: string,
    weaponQuantity: number = 1
  ) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: aircraftId,
      currentWeaponId: weaponId,
      currentWeaponQuantity: weaponQuantity,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleShipAttack(
    shipId: string,
    weaponId: string,
    weaponQuantity: number = 1
  ) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: shipId,
      currentWeaponId: weaponId,
      currentWeaponQuantity: weaponQuantity,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleAircraftAutoAttack(aircraftId: string) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: true,
      currentAttackerId: aircraftId,
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleShipAutoAttack(shipId: string) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: true,
      currentAttackerId: shipId,
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleArmyAttack(
    armyId: string,
    weaponId: string,
    weaponQuantity: number
  ) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: armyId,
      currentWeaponId: weaponId,
      currentWeaponQuantity: weaponQuantity,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleArmyAutoAttack(armyId: string) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: true,
      currentAttackerId: armyId,
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function queueAircraftForMovement(aircraftId: string) {
    game.selectedUnitId = aircraftId;
    const aircraft = game.currentScenario.getAircraft(aircraftId);
    if (aircraft) {
      aircraft.selected = true;
      aircraftLayer.updateAircraftFeature(
        aircraft.id,
        aircraft.selected,
        aircraft.heading
      );
      addRouteMeasurementInteraction(
        fromLonLat(
          [aircraft.longitude, aircraft.latitude],
          projection ?? defaultProjection!
        ),
        aircraft.sideColor
      );
      aircraft.rtb = false;
      setCurrentGameStatusToContext(
        "지도를 클릭해 항로를 지정하세요. 같은 지점을 두 번 클릭하거나 Esc를 누르면 종료됩니다."
      );
    }
  }

  function queueShipForMovement(shipId: string) {
    game.selectedUnitId = shipId;
    const ship = game.currentScenario.getShip(shipId);
    if (ship) {
      ship.selected = true;
      shipLayer.updateShipFeature(ship.id, ship.selected, ship.heading);
      shipRouteLayer.removeFeatureById(ship.id);
      addRouteMeasurementInteraction(
        fromLonLat(
          [ship.longitude, ship.latitude],
          projection ?? defaultProjection!
        ),
        ship.sideColor
      );
      setCurrentGameStatusToContext(
        "지도를 클릭해 함정 항로를 지정하세요. 같은 지점을 두 번 클릭하거나 Esc를 누르면 종료됩니다."
      );
    }
  }

  function queueArmyForMovement(armyId: string) {
    game.selectedUnitId = armyId;
    const army = game.currentScenario.getArmy(armyId);
    if (army) {
      army.selected = true;
      armyLayer.updateArmyFeature(army.id, army.selected, army.heading);
      armyRouteLayer.removeFeatureById(army.id);
      addRouteMeasurementInteraction(
        fromLonLat(
          [army.longitude, army.latitude],
          projection ?? defaultProjection!
        ),
        army.sideColor
      );
      setCurrentGameStatusToContext(
        "지도를 클릭해 지상군 항로를 지정하세요. 같은 지점을 두 번 클릭하거나 Esc를 누르면 종료됩니다."
      );
    }
  }

  function handleAircraftRtb(aircraftId: string) {
    const aircraftReturningToBase = game.aircraftReturnToBase(aircraftId);
    if (aircraftReturningToBase) {
      if (aircraftReturningToBase.route.length === 0)
        aircraftRouteLayer.removeFeatureById(aircraftId);
      else aircraftRouteLayer.addRouteFeature(aircraftReturningToBase);
    }
  }

  function handleDuplicateAircraft(aircraftId: string) {
    const duplicatedAircraft = game.duplicateUnit(aircraftId, "aircraft");
    if (duplicatedAircraft) {
      aircraftLayer.addAircraftFeature(duplicatedAircraft);
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(duplicatedAircraft);
    }
  }

  function handleAddWeaponToAircraft(
    aircraftId: string,
    weaponClassName: string
  ) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToAircraft(
      aircraftId,
      weaponTemplate?.className,
      weaponTemplate?.speed, // in knots
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate, // in lbs/hr
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromAircraft(
    aircraftId: string,
    weaponId: string
  ) {
    return game.currentScenario.deleteWeaponFromAircraft(aircraftId, weaponId);
  }

  function handleUpdateAircraftWeaponQuantity(
    aircraftId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateAircraftWeaponQuantity(
      aircraftId,
      weaponId,
      increment
    );
  }

  function handleAddWeaponToFacility(
    facilityId: string,
    weaponClassName: string
  ) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToFacility(
      facilityId,
      weaponTemplate?.className,
      weaponTemplate?.speed, // in knots
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate, // in lbs/hr
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromFacility(
    facilityId: string,
    weaponId: string
  ) {
    return game.currentScenario.deleteWeaponFromFacility(facilityId, weaponId);
  }

  function handleUpdateFacilityWeaponQuantity(
    facilityId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateFacilityWeaponQuantity(
      facilityId,
      weaponId,
      increment
    );
  }

  function handleAddWeaponToArmy(armyId: string, weaponClassName: string) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToArmy(
      armyId,
      weaponTemplate?.className,
      weaponTemplate?.speed,
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate,
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromArmy(armyId: string, weaponId: string) {
    return game.currentScenario.deleteWeaponFromArmy(armyId, weaponId);
  }

  function handleUpdateArmyWeaponQuantity(
    armyId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateArmyWeaponQuantity(
      armyId,
      weaponId,
      increment
    );
  }

  function handleAddWeaponToShip(shipId: string, weaponClassName: string) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToShip(
      shipId,
      weaponTemplate?.className,
      weaponTemplate?.speed, // in knots
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate, // in lbs/hr
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromShip(shipId: string, weaponId: string) {
    return game.currentScenario.deleteWeaponFromShip(shipId, weaponId);
  }

  function handleUpdateShipWeaponQuantity(
    shipId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateShipWeaponQuantity(
      shipId,
      weaponId,
      increment
    );
  }

  function handleCreatePatrolMission(
    missionName: string,
    assignedUnits: string[],
    referencePoints: string[]
  ) {
    if (referencePoints.length < 3) return;
    const assignedArea = [];
    for (const referencePointId of referencePoints) {
      const referencePoint =
        game.currentScenario.getReferencePoint(referencePointId);
      if (referencePoint) {
        assignedArea.push(referencePoint);
      }
    }
    game.createPatrolMission(missionName, assignedUnits, assignedArea);
    toastContext?.addToast(
      `초계 임무 [${missionName}]를 생성했습니다.`,
      "success"
    );
  }

  function handleUpdatePatrolMission(
    missionId: string,
    missionName?: string,
    assignedUnits?: string[],
    referencePoints?: string[]
  ) {
    if (referencePoints && referencePoints.length < 3) return;
    const assignedArea = [];
    if (referencePoints) {
      for (const referencePointId of referencePoints) {
        const referencePoint =
          game.currentScenario.getReferencePoint(referencePointId);
        if (referencePoint) {
          assignedArea.push(referencePoint);
        }
      }
    }
    game.updatePatrolMission(
      missionId,
      missionName,
      assignedUnits,
      assignedArea
    );
    toastContext?.addToast(
      `초계 임무 [${missionName}]를 수정했습니다.`,
      "success"
    );
  }

  function handleCreateStrikeMission(
    missionName: string,
    assignedUnits: string[],
    targetIds: string[]
  ) {
    game.createStrikeMission(missionName, assignedUnits, targetIds);
    toastContext?.addToast(
      `타격 임무 [${missionName}]를 생성했습니다.`,
      "success"
    );
  }

  function handleUpdateStrikeMission(
    missionId: string,
    missionName?: string,
    assignedUnits?: string[],
    targetIds?: string[]
  ) {
    game.updateStrikeMission(missionId, missionName, assignedUnits, targetIds);
    toastContext?.addToast(
      `타격 임무 [${missionName}]를 수정했습니다.`,
      "success"
    );
  }

  function handleDeleteMission(missionId: string) {
    game.deleteMission(missionId);
    toastContext?.addToast(`임무를 삭제했습니다.`, "success");
  }

  function openMissionCreator(
    initialMissionType: "Patrol" | "Strike" = "Patrol",
    initialTargetIds: string[] = []
  ) {
    setKeyboardShortcutsEnabled(false);
    setMissionCreatorInitialMissionType(initialMissionType);
    setMissionCreatorInitialTargetIds(initialTargetIds);
    setMissionCreatorActive(true);
  }

  function closeMissionCreator() {
    setKeyboardShortcutsEnabled(true);
    setMissionCreatorInitialMissionType("Patrol");
    setMissionCreatorInitialTargetIds([]);
    setMissionCreatorActive(false);
  }

  function openMissionEditor(selectedMissionId: string = "") {
    const currentSideId = game.currentScenario.getSide(game.currentSideId)?.id;
    if (
      selectedMissionId !== "" &&
      game.currentScenario.missions.filter(
        (mission) =>
          mission.sideId === currentSideId && mission.id === selectedMissionId
      ).length === 0
    )
      return;
    setKeyboardShortcutsEnabled(false);
    setMissionEditorActive({
      open: true,
      selectedMissionId: selectedMissionId,
    });
  }

  function closeMissionEditor() {
    setKeyboardShortcutsEnabled(true);
    setMissionEditorActive({
      open: false,
      selectedMissionId: "",
    });
  }

  function openSimulationLogs() {
    setSimulationLogsActive(true);
  }

  function closeSimulationLogs() {
    setSimulationLogsActive(false);
  }

  function updateCurrentSimulationLogsToContext(options?: {
    announceLiveCommentary?: boolean;
    clearExistingLiveCommentary?: boolean;
  }) {
    if (!game.simulationLogs.getHasNewLogs()) {
      if (options?.clearExistingLiveCommentary) {
        clearLiveCommentaryNotifications();
      }
      return;
    }

    const logs = [...game.simulationLogs.getLogs()];
    setCurrentSimulationLogsToContext(logs);
    syncLiveCommentaryNotifications(logs, options);
    game.simulationLogs.setHasNewLogs(false);
  }

  function handleOpenSideEditor(sideId: string | null) {
    const anchorEl = document.getElementById("side-select");
    if (!anchorEl) return;
    setKeyboardShortcutsEnabled(false);
    setOpenSideEditor({
      open: true,
      sideId: sideId,
      anchorEl: anchorEl,
    });
  }

  function handleCloseSideEditor() {
    setOpenSideEditor({
      open: false,
      anchorEl: null,
      sideId: null,
    });
    setKeyboardShortcutsEnabled(true);
  }

  function handleAddSide(
    sideName: string,
    sideColor: SIDE_COLOR,
    sideHostiles: string[],
    sideAllies: string[],
    sideDoctrine: SideDoctrine
  ) {
    game.addSide(sideName, sideColor, sideHostiles, sideAllies, sideDoctrine);
    if (game.currentScenario.sides.length === 1) {
      switchCurrentSide(game.currentScenario.sides[0].id);
    }
  }

  function handleUpdateSide(
    sideId: string,
    sideName: string,
    sideColor: SIDE_COLOR,
    sideHostiles: string[],
    sideAllies: string[],
    sideDoctrine: SideDoctrine
  ) {
    game.updateSide(
      sideId,
      sideName,
      sideColor,
      sideHostiles,
      sideAllies,
      sideDoctrine
    );
    refreshAllLayers();
    loadFeatureEntitiesState();
  }

  function handleDeleteSide(sideId: string) {
    game.deleteSide(sideId);
    if (game.currentScenario.sides.length > 0) {
      switchCurrentSide(game.currentSideId);
    } else if (game.currentScenario.sides.length === 0) {
      switchCurrentSide("");
    }
    refreshAllLayers();
    loadFeatureEntitiesState();
  }

  function queueUnitForTeleport(unitId: string) {
    clearPendingFacilityGroupTeleport();
    game.selectedUnitId = unitId;
    teleportingUnit = true;
    setCurrentGameStatusToContext("지도를 클릭해 유닛 위치를 이동하세요.");
  }

  function switchCurrentSide(sideId: string) {
    if (missionEditorActive.open) closeMissionEditor();
    game.switchCurrentSide(sideId);
    setCurrentSideId(game.currentSideId);
    toastContext?.addToast(
      `선택 세력: ${game.currentScenario.getSideName(game.currentSideId)}`
    );
  }

  function toggleScenarioTimeCompression() {
    game.switchScenarioTimeCompression();
    setCurrentScenarioTimeCompression(game.currentScenario.timeCompression);
  }

  function refreshAllLayers() {
    aircraftLayer.refresh(game.currentScenario.aircraft);
    armyLayer.refresh(game.currentScenario.armies);
    facilityLayer.refresh(game.currentScenario.facilities);
    airbasesLayer.refresh(game.currentScenario.airbases);
    if (threatRangeVisible)
      threatRangeLayer.refresh([
        ...game.currentScenario.armies,
        ...game.currentScenario.facilities,
        ...game.currentScenario.ships,
      ]);
    refreshFacilityPlacementGroupLayer();
    refreshWeaponTrajectoryLayer(game.currentScenario);
    weaponLayer.refresh(game.currentScenario.weapons);
    shipLayer.refresh(game.currentScenario.ships);
    referencePointLayer.refresh(game.currentScenario.referencePoints);
    if (featureLabelVisible) refreshFeatureLabelLayer();
    if (routeVisible) refreshRouteLayer(game.currentScenario);
  }

  function refreshFeatureLabelLayer() {
    featureLabelLayer.refresh([
      ...game.currentScenario.aircraft,
      ...game.currentScenario.armies,
      ...game.currentScenario.facilities,
      ...game.currentScenario.airbases,
      ...game.currentScenario.ships,
      ...game.currentScenario.referencePoints,
    ]);
  }

  function refreshThreatRangeLayer() {
    threatRangeLayer.refresh([
      ...game.currentScenario.armies,
      ...game.currentScenario.facilities,
      ...game.currentScenario.ships,
    ]);
  }

  function getEmphasizedFacilityPlacementGroupIds() {
    const emphasizedGroupIds = new Set<string>();
    const focusedFacility = openFacilityCard.open
      ? game.currentScenario.getFacility(openFacilityCard.facilityId)
      : undefined;
    const focusedFacilityGroup = focusedFacility
      ? findFacilityPlacementGroupByFacilityId(
          facilityPlacementGroups,
          focusedFacility.id
        )
      : null;
    if (focusedFacilityGroup) {
      emphasizedGroupIds.add(focusedFacilityGroup.id);
    }
    const dragSelectedGroup =
      dragSelectedFeatures.length > 0 &&
      dragSelectedFeatures.every(
        (feature) => feature.get("type") === "facility"
      )
        ? resolveMatchingFacilityPlacementGroup(
            facilityPlacementGroups,
            dragSelectedFeatures
              .map((feature) => feature.get("id"))
              .filter((id): id is string => typeof id === "string")
          )
        : null;
    if (dragSelectedGroup) {
      emphasizedGroupIds.add(dragSelectedGroup.id);
    }
    if (teleportingFacilityGroupIdRef.current) {
      emphasizedGroupIds.add(teleportingFacilityGroupIdRef.current);
    }
    return emphasizedGroupIds;
  }

  function refreshFacilityPlacementGroupLayer() {
    facilityPlacementGroupLayer.refresh(
      facilityPlacementGroups,
      game.currentScenario.facilities,
      getEmphasizedFacilityPlacementGroupIds()
    );
  }

  function refreshRouteLayer(observation: Scenario) {
    if (
      !observation.getAircraft(game.selectedUnitId) &&
      !observation.getArmy(game.selectedUnitId) &&
      !observation.getShip(game.selectedUnitId)
    ) {
      cleanUpRouteDrawLineAndMeasurementTooltip();
      aircraftRouteLayer.refresh(observation.aircraft);
      armyRouteLayer.refresh(observation.armies);
      shipRouteLayer.refresh(observation.ships);
      return;
    }
    aircraftRouteLayer.refresh(observation.aircraft);
    armyRouteLayer.refresh(observation.armies);
    shipRouteLayer.refresh(observation.ships);
  }

  function updateMapView(center: number[], zoom: number) {
    theMap
      .getView()
      .setCenter(transform(center, "EPSG:4326", DEFAULT_OL_PROJECTION_CODE));
    theMap.getView().setZoom(zoom);
  }

  function updateAircraft(
    aircraftId: string,
    aircraftName: string,
    aircraftClassName: string,
    aircraftSpeed: number,
    aircraftCurrentFuel: number,
    aircraftFuelRate: number,
    aircraftRange: number
  ) {
    game.currentScenario.updateAircraft(
      aircraftId,
      aircraftName,
      aircraftClassName,
      aircraftSpeed,
      aircraftCurrentFuel,
      aircraftFuelRate,
      aircraftRange
    );
    featureLabelLayer.updateFeatureLabelFeature(aircraftId, aircraftName);
  }

  function updateFacility(
    facilityId: string,
    facilityName: string,
    facilityClassName: string,
    facilityRange: number
  ) {
    game.currentScenario.updateFacility(
      facilityId,
      facilityName,
      facilityClassName,
      facilityRange
    );
    if (threatRangeVisible) {
      refreshThreatRangeLayer();
    }
    featureLabelLayer.updateFeatureLabelFeature(facilityId, facilityName);
  }

  function updateArmy(
    armyId: string,
    armyName: string,
    armyClassName: string,
    armySpeed: number,
    armyCurrentFuel: number,
    armyRange: number
  ) {
    game.currentScenario.updateArmy(
      armyId,
      armyName,
      armyClassName,
      armySpeed,
      armyCurrentFuel,
      armyRange
    );
    if (threatRangeVisible) {
      refreshThreatRangeLayer();
    }
    featureLabelLayer.updateFeatureLabelFeature(armyId, armyName);
  }

  function updateAirbase(airbaseId: string, airbaseName: string) {
    game.currentScenario.updateAirbase(airbaseId, airbaseName);
    featureLabelLayer.updateFeatureLabelFeature(airbaseId, airbaseName);
  }

  function updateShip(
    shipId: string,
    shipName: string,
    shipClassName: string,
    shipSpeed: number,
    shipCurrentFuel: number,
    shipRange: number
  ) {
    game.currentScenario.updateShip(
      shipId,
      shipName,
      shipClassName,
      shipSpeed,
      shipCurrentFuel,
      shipRange
    );
    if (threatRangeVisible) {
      refreshThreatRangeLayer();
    }
    featureLabelLayer.updateFeatureLabelFeature(shipId, shipName);
  }

  function updateReferencePoint(
    referencePointId: string,
    referencePointName: string
  ) {
    game.currentScenario.updateReferencePoint(
      referencePointId,
      referencePointName
    );
    featureLabelLayer.updateFeatureLabelFeature(
      referencePointId,
      referencePointName
    );
  }

  function toggleFeatureLabelVisibility(on: boolean) {
    setFeatureLabelVisible(on);
    if (on) {
      refreshFeatureLabelLayer();
      featureLabelLayer.layer.setVisible(true);
    } else {
      featureLabelLayer.layer.setVisible(false);
    }
  }

  function toggleThreatRangeVisibility(on: boolean) {
    setThreatRangeVisible(on);
    if (on) {
      refreshThreatRangeLayer();
      threatRangeLayer.layer.setVisible(true);
    } else {
      threatRangeLayer.layer.setVisible(false);
    }
  }

  function toggleRouteVisibility(on: boolean) {
    setRouteVisible(on);
    if (on) {
      refreshRouteLayer(game.currentScenario);
      aircraftRouteLayer.layer.setVisible(true);
      armyRouteLayer.layer.setVisible(true);
      shipRouteLayer.layer.setVisible(true);
    } else {
      aircraftRouteLayer.layer.setVisible(false);
      armyRouteLayer.layer.setVisible(false);
      shipRouteLayer.layer.setVisible(false);
    }
  }

  function refreshWeaponTrajectoryLayer(observation: Scenario) {
    if (!weaponTrajectoryVisible) {
      return;
    }

    weaponTrajectoryLayer.refresh(observation.weapons, observation);
  }

  function toggleWeaponTrajectoryVisibility(on: boolean) {
    setWeaponTrajectoryVisible(on);
    if (on) {
      weaponTrajectoryLayer.refresh(
        game.currentScenario.weapons,
        game.currentScenario
      );
      weaponTrajectoryLayer.layer.setVisible(true);
    } else {
      weaponTrajectoryLayer.refresh([], game.currentScenario);
      weaponTrajectoryLayer.layer.setVisible(false);
    }
  }

  function toggleReferencePointVisibility(on: boolean) {
    setReferencePointVisible(on);
    let referencePointsToRefresh: ReferencePoint[] = [];
    if (on) {
      referencePointLayer.layer.setVisible(true);
      referencePointsToRefresh = game.currentScenario.referencePoints;
    } else {
      referencePointLayer.layer.setVisible(false);
    }
    featureLabelLayer.refresh([
      ...game.currentScenario.aircraft,
      ...game.currentScenario.armies,
      ...game.currentScenario.facilities,
      ...game.currentScenario.airbases,
      ...game.currentScenario.ships,
      ...referencePointsToRefresh,
    ]);
  }

  function toggleBaseMapLayer() {
    baseMapLayers.toggleLayer();
    baseMapModeIdRef.current = baseMapLayers.getCurrentModeId();
    setBaseMapModeId(baseMapLayers.getCurrentModeId());
  }

  function createRouteMeasurementTooltip() {
    if (routeMeasurementTooltipElement) {
      routeMeasurementTooltipElement.parentNode?.removeChild(
        routeMeasurementTooltipElement
      );
    }
    routeMeasurementTooltipElement = document.createElement("div");
    routeMeasurementTooltipElement.className = "ol-tooltip ol-tooltip-measure";
    routeMeasurementTooltip = new Overlay({
      element: routeMeasurementTooltipElement,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false,
    });
    theMap.addOverlay(routeMeasurementTooltip);
  }

  function finishRouteDrawLine() {
    if (selectingFocusFireObjective) {
      setSelectingFocusFireObjective(false);
      changeCursorType("");
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
    }
    theMap.getInteractions().forEach((interaction) => {
      if (interaction instanceof Draw) {
        interaction.finishDrawing();
      }
    });
  }

  function cleanUpRouteDrawLineAndMeasurementTooltip() {
    if (routeMeasurementDrawLine)
      theMap.removeInteraction(routeMeasurementDrawLine);
    routeMeasurementDrawLine = null;
    theMap.getInteractions().forEach((interaction) => {
      if (interaction instanceof Draw) {
        theMap.removeInteraction(interaction);
      }
    });
    if (routeMeasurementTooltipElement) {
      routeMeasurementTooltipElement.parentNode?.removeChild(
        routeMeasurementTooltipElement
      );
    }
    if (routeMeasurementTooltip) theMap.removeOverlay(routeMeasurementTooltip);
    theMap.getOverlays().forEach((overlay) => {
      if (overlay.getElement()?.innerHTML.slice(-2) === "NM") {
        theMap.removeOverlay(overlay);
      }
    });
    routeMeasurementTooltipElement = null;
    routeMeasurementTooltip = null;
    if (routeMeasurementListener) unByKey(routeMeasurementListener);
  }

  const formatRouteLengthDisplay = function (line: LineString) {
    const length = getLength(line, {
      projection: projection ?? defaultProjection!,
    });
    const output = (length / NAUTICAL_MILES_TO_METERS).toFixed(2) + " " + "NM";
    return output;
  };

  function handleRouteDrawEnd() {
    cleanUpRouteDrawLineAndMeasurementTooltip();
    const aircraft = game.currentScenario.getAircraft(game.selectedUnitId);
    if (aircraft) {
      aircraft.selected = !aircraft.selected;
      aircraftLayer.updateAircraftFeature(
        aircraft.id,
        aircraft.selected,
        aircraft.heading
      );
    }
    const ship = game.currentScenario.getShip(game.selectedUnitId);
    if (ship) {
      ship.selected = !ship.selected;
      shipLayer.updateShipFeature(ship.id, ship.selected, ship.heading);
    }
    const army = game.currentScenario.getArmy(game.selectedUnitId);
    if (army) {
      army.selected = !army.selected;
      armyLayer.updateArmyFeature(army.id, army.selected, army.heading);
    }
    game.commitRoute(game.selectedUnitId);
    game.selectedUnitId = "";
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    refreshRouteLayer(game.currentScenario);
  }

  function addRouteMeasurementInteraction(
    startCoordinates: number[],
    sideColor: string | SIDE_COLOR | undefined = undefined
  ) {
    routeMeasurementDrawLine = new Draw({
      source: new VectorSource(),
      type: "LineString",
      style: routeDrawLineStyle,
    });

    theMap.addInteraction(routeMeasurementDrawLine);

    createRouteMeasurementTooltip();

    routeMeasurementDrawLine.on("drawstart", function (event) {
      const drawLineFeature = event.feature;
      drawLineFeature.setProperties({
        sideColor: convertColorNameToSideColor(sideColor),
      });
      routeMeasurementListener = drawLineFeature
        .getGeometry()
        ?.on("change", function (event) {
          const geom = event.target as LineString;
          const firstPoint = geom.getFirstCoordinate();
          const lastPoint = geom.getLastCoordinate();
          const tooltipCoord = [
            (firstPoint[0] + lastPoint[0]) / 2,
            (firstPoint[1] + lastPoint[1]) / 2,
          ];
          if (routeMeasurementTooltipElement) {
            routeMeasurementTooltipElement.innerHTML =
              formatRouteLengthDisplay(geom);
            routeMeasurementTooltipElement.style.color =
              convertColorNameToSideColor(sideColor);
            routeMeasurementTooltipElement.style.fontWeight = "bold";
          }
          routeMeasurementTooltip?.setPosition(tooltipCoord);
        });
    });

    routeMeasurementDrawLine.on("drawend", function (_event) {
      handleRouteDrawEnd();
    });

    routeMeasurementDrawLine.appendCoordinates([startCoordinates]);
  }

  function handleDrawerOpen() {
    setDrawerOpen(true);
  }

  const handleGuideRailSelectionsChange = useCallback(
    (nextLabels: GuideRailAssetSelectionLabels) => {
      setGuideRailSelectionLabels((currentLabels) =>
        areGuideRailSelectionLabelsEqual(currentLabels, nextLabels)
          ? currentLabels
          : nextLabels
      );
    },
    []
  );

  const handleGuideRailActiveAssetTypeChange = useCallback(
    (assetType: GuideRailAssetMixId) => {
      setActiveGuideRailAssetType((currentAssetType) =>
        currentAssetType === assetType ? currentAssetType : assetType
      );
    },
    []
  );

  function handleStartAssetPlacement() {
    setActiveGuideRailAssetType(null);
    setDrawerOpen(true);
    setAssetPlacementOpenSignal((currentValue) => currentValue + 1);
    setCurrentGameStatusToContext(
      "도크에서 자산을 선택한 뒤 지도를 클릭해 배치하세요."
    );
  }

  function handleStartHostilePlacement() {
    setActiveGuideRailAssetType(null);
    const hostileSideId =
      game.currentScenario.sides.find(
        (side) =>
          side.id !== game.currentSideId &&
          (!game.currentSideId ||
            game.currentScenario.isHostile(game.currentSideId, side.id))
      )?.id ??
      game.currentScenario.sides.find((side) => side.id !== game.currentSideId)
        ?.id;

    if (hostileSideId) {
      switchCurrentSide(hostileSideId);
    }

    setDrawerOpen(true);
    setAssetPlacementOpenSignal((currentValue) => currentValue + 1);
    setCurrentGameStatusToContext(
      "적 세력 자산을 선택한 뒤 지도를 클릭해 배치하세요."
    );
  }

  function handleGuideRailAssetMixAction(assetType: GuideRailAssetMixId) {
    const statusLabels: Record<GuideRailAssetMixId, string> = {
      "manned-aircraft": "유인기를 선택한 뒤 지도를 클릭해 배치하세요.",
      drone: "드론을 선택한 뒤 지도를 클릭해 배치하세요.",
      airbase: "기지 자산을 선택한 뒤 지도를 클릭해 배치하세요.",
      facility: "지상 시설을 선택한 뒤 지도를 클릭해 배치하세요.",
      armor: "기갑 자산을 선택한 뒤 지도를 클릭해 배치하세요.",
      ship: "해상 자산을 선택한 뒤 지도를 클릭해 배치하세요.",
    };

    setActiveGuideRailAssetType(assetType);
    setDrawerOpen(true);
    setAssetPlacementOpenSignal((currentValue) => currentValue + 1);
    setAssetPlacementFocusIntent((currentValue) => ({
      assetType,
      signal: currentValue.signal + 1,
    }));
    setCurrentGameStatusToContext(statusLabels[assetType]);
  }

  function handleOpenMissionCreatorFromGuideRail() {
    setActiveGuideRailAssetType(null);
    setDrawerOpen(true);
    openMissionCreator();
    setCurrentGameStatusToContext("임무를 추가하세요.");
  }

  function handleGuideRailAlertAction(alertId: GuideRailAlertId) {
    switch (alertId) {
      case "no-assets":
      case "no-friendly-assets":
      case "drawer-open":
        handleStartAssetPlacement();
        break;
      case "no-hostiles":
        handleStartHostilePlacement();
        break;
      case "no-missions":
        handleOpenMissionCreatorFromGuideRail();
        break;
      case "engagement-live":
        armTerrain3dSelection();
        break;
      default:
        break;
    }
  }

  function handleDrawerClose() {
    setDrawerOpen(false);
  }

  function buildSelectedCombatantSummary(
    combatant: Aircraft | Airbase | Army | Facility | Ship | Weapon,
    type: SelectedCombatantSummary["type"]
  ): SelectedCombatantSummary {
    return {
      type,
      name: combatant.name,
      className: getDisplayName(combatant.className),
      sideName: game.currentScenario.getSideName(combatant.sideId),
      sideColor: combatant.sideColor,
      currentHp: combatant.currentHp,
      maxHp: combatant.maxHp,
      defense: combatant.defense,
      attackPower:
        combatant instanceof Weapon ? combatant.attackPower : undefined,
    };
  }

  function resolveSelectedCombatantSummary(): SelectedCombatantSummary | null {
    if (selectedAircraft) {
      return buildSelectedCombatantSummary(selectedAircraft, "aircraft");
    }
    if (selectedShip) {
      return buildSelectedCombatantSummary(selectedShip, "ship");
    }
    if (selectedArmy) {
      return buildSelectedCombatantSummary(selectedArmy, "army");
    }
    if (selectedFacility) {
      return buildSelectedCombatantSummary(selectedFacility, "facility");
    }
    if (selectedAirbase) {
      return buildSelectedCombatantSummary(selectedAirbase, "airbase");
    }
    if (selectedWeapon) {
      return buildSelectedCombatantSummary(selectedWeapon, "weapon");
    }
    if (!game.selectedUnitId) {
      return null;
    }

    const selectedAircraftFromMap = game.currentScenario.getAircraft(
      game.selectedUnitId
    );
    if (selectedAircraftFromMap) {
      return buildSelectedCombatantSummary(selectedAircraftFromMap, "aircraft");
    }

    const selectedShipFromMap = game.currentScenario.getShip(
      game.selectedUnitId
    );
    if (selectedShipFromMap) {
      return buildSelectedCombatantSummary(selectedShipFromMap, "ship");
    }

    const selectedArmyFromMap = game.currentScenario.getArmy(
      game.selectedUnitId
    );
    if (selectedArmyFromMap) {
      return buildSelectedCombatantSummary(selectedArmyFromMap, "army");
    }

    const selectedFacilityFromMap = game.currentScenario.getFacility(
      game.selectedUnitId
    );
    if (selectedFacilityFromMap) {
      return buildSelectedCombatantSummary(selectedFacilityFromMap, "facility");
    }

    const selectedAirbaseFromMap = game.currentScenario.getAirbase(
      game.selectedUnitId
    );
    if (selectedAirbaseFromMap) {
      return buildSelectedCombatantSummary(selectedAirbaseFromMap, "airbase");
    }

    const selectedWeaponFromMap = game.currentScenario.getWeapon(
      game.selectedUnitId
    );
    if (selectedWeaponFromMap) {
      return buildSelectedCombatantSummary(selectedWeaponFromMap, "weapon");
    }

    return null;
  }

  const selectedAirbase = openAirbaseCard.open
    ? game.currentScenario.getAirbase(openAirbaseCard.airbaseId)
    : undefined;
  const selectedFacility = openFacilityCard.open
    ? game.currentScenario.getFacility(openFacilityCard.facilityId)
    : undefined;
  const selectedFacilityPlacementGroup = selectedFacility
    ? findFacilityPlacementGroupByFacilityId(
        facilityPlacementGroups,
        selectedFacility.id
      )
    : null;
  const selectedArmy = openArmyCard.open
    ? game.currentScenario.getArmy(openArmyCard.armyId)
    : undefined;
  const selectedAircraft = openAircraftCard.open
    ? game.currentScenario.getAircraft(openAircraftCard.aircraftId)
    : undefined;
  const selectedAircraftMission = selectedAircraft
    ? game.currentScenario.getMissionByAssignedUnitId(selectedAircraft.id)
    : undefined;
  const selectedShip = openShipCard.open
    ? game.currentScenario.getShip(openShipCard.shipId)
    : undefined;
  const selectedReferencePoint = openReferencePointCard.open
    ? game.currentScenario.getReferencePoint(
        openReferencePointCard.referencePointId
      )
    : undefined;
  const selectedWeapon = openWeaponCard.open
    ? game.currentScenario.getWeapon(openWeaponCard.weaponId)
    : undefined;
  const dragSelectedTargetPriorities = game.currentSideId
    ? game.getFireRecommendationTargetPriorities(
        game.currentSideId,
        dragSelectedFeatures
          .map((feature) => feature.get("id"))
          .filter((id): id is string => typeof id === "string")
      )
    : [];
  const dragSelectedFacilityPlacementGroup =
    dragSelectedFeatures.length > 0 &&
    dragSelectedFeatures.every((feature) => feature.get("type") === "facility")
      ? resolveMatchingFacilityPlacementGroup(
          facilityPlacementGroups,
          dragSelectedFeatures
            .map((feature) => feature.get("id"))
            .filter((id): id is string => typeof id === "string")
        )
      : null;
  const selectedCombatant = resolveSelectedCombatantSummary();
  const focusFireSummary = game.getFocusFireSummary();
  const guideRailVisible = !mobileView;
  const rightOverlayOffset = mobileView
    ? 16
    : drawerOpen
      ? APP_DRAWER_WIDTH + 20
      : 16;

  useEffect(() => {
    const emphasizedGroupIds = new Set<string>();
    const focusedFacility = openFacilityCard.open
      ? game.currentScenario.getFacility(openFacilityCard.facilityId)
      : undefined;
    const focusedFacilityGroup = focusedFacility
      ? findFacilityPlacementGroupByFacilityId(
          facilityPlacementGroups,
          focusedFacility.id
        )
      : null;
    if (focusedFacilityGroup) {
      emphasizedGroupIds.add(focusedFacilityGroup.id);
    }

    const dragSelectedGroup =
      dragSelectedFeatures.length > 0 &&
      dragSelectedFeatures.every(
        (feature) => feature.get("type") === "facility"
      )
        ? resolveMatchingFacilityPlacementGroup(
            facilityPlacementGroups,
            dragSelectedFeatures
              .map((feature) => feature.get("id"))
              .filter((id): id is string => typeof id === "string")
          )
        : null;
    if (dragSelectedGroup) {
      emphasizedGroupIds.add(dragSelectedGroup.id);
    }

    facilityPlacementGroupLayer.refresh(
      facilityPlacementGroups,
      game.currentScenario.facilities,
      emphasizedGroupIds
    );
  }, [
    dragSelectedFeatures,
    facilityPlacementGroupLayer,
    facilityPlacementGroups,
    game.currentScenario.facilities,
    openFacilityCard.facilityId,
    openFacilityCard.open,
  ]);

  useEffect(() => {
    if (focusFireSummary.enabled || focusFireSummary.objectiveName) {
      setFocusFireDockOpen(true);
    }
  }, [focusFireSummary.enabled, focusFireSummary.objectiveName]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      theMap.updateSize();
    });
    const timeoutId = window.setTimeout(() => {
      theMap.updateSize();
    }, 240);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [theMap, drawerOpen, mobileView]);

  // GUI START
  return (
    <>
      <Toolbar
        drawerOpen={drawerOpen}
        openDrawer={handleDrawerOpen}
        closeDrawer={handleDrawerClose}
        addAircraftOnClick={setAddingAircraft}
        addFacilityOnClick={setAddingFacility}
        addAirbaseOnClick={addAirbase}
        addShipOnClick={setAddingShip}
        addReferencePointOnClick={setAddingReferencePoint}
        playOnClick={handlePlayGameClick}
        startScenarioOnClick={handleStartScenario}
        stepOnClick={handleStepGameClick}
        pauseOnClick={handlePauseGameClick}
        toggleScenarioTimeCompressionOnClick={toggleScenarioTimeCompression}
        toggleRecordEverySeconds={toggleRecordEverySeconds}
        recordScenarioOnClick={handleRecordScenarioClick}
        stopRecordingScenarioOnClick={handleStopRecordingScenarioClick}
        loadRecordingOnClick={handleLoadRecording}
        loadFixedTargetStrikeReplayOnClick={handleLoadFixedTargetStrikeReplay}
        exitReplayModeOnClick={exitReplayMode}
        handlePlayRecordingClick={handlePlayRecordingClick}
        handlePauseRecordingClick={handlePauseRecordingClick}
        handleStepRecordingToStep={handleStepRecordingToStep}
        handleStepRecordingBackwards={handleStepRecordingBackwards}
        handleStepRecordingForwards={handleStepRecordingForwards}
        handleUndo={handleUndo}
        switchCurrentSideOnClick={switchCurrentSide}
        refreshAllLayers={refreshAllLayers}
        updateMapView={updateMapView}
        loadFeatureEntitiesState={loadFeatureEntitiesState}
        updateScenarioTimeCompression={setCurrentScenarioTimeCompression}
        updateCurrentScenarioTimeToContext={() => {
          setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
        }}
        scenarioTimeCompression={currentScenarioTimeCompression}
        scenarioCurrentSideId={currentSideId}
        game={game}
        featureLabelVisibility={featureLabelVisible}
        toggleFeatureLabelVisibility={toggleFeatureLabelVisibility}
        threatRangeVisibility={threatRangeVisible}
        toggleThreatRangeVisibility={toggleThreatRangeVisibility}
        routeVisibility={routeVisible}
        toggleRouteVisibility={toggleRouteVisibility}
        toggleBaseMapLayer={toggleBaseMapLayer}
        keyboardShortcutsEnabled={keyboardShortcutsEnabled}
        finishRouteDrawLine={finishRouteDrawLine}
        toggleMissionCreator={() => {
          if (missionCreatorActive) {
            closeMissionCreator();
            return;
          }
          openMissionCreator();
        }}
        openSimulationLogs={openSimulationLogs}
        updateCurrentSimulationLogsToContext={
          updateCurrentSimulationLogsToContext
        }
        updateCurrentScenarioSidesToContext={() => {
          setCurrentScenarioSidesToContext([...game.currentScenario.sides]);
        }}
        assetPlacementOpenSignal={assetPlacementOpenSignal}
        assetPlacementFocusIntent={assetPlacementFocusIntent}
        onGuideRailSelectionsChange={handleGuideRailSelectionsChange}
        onGuideRailActiveAssetTypeChange={handleGuideRailActiveAssetTypeChange}
        featureEntitiesPlotted={featureEntitiesState}
        deleteFeatureEntity={handleDeleteFeatureEntity}
        openMissionEditor={openMissionEditor}
        handleOpenSideEditor={handleOpenSideEditor}
        mobileView={mobileView}
        openFlightSimPage={(craft?: string) => {
          openFlightSimPage(game.mapView.currentCameraCenter, craft);
        }}
        openImmersiveExperiencePage={(profile: ImmersiveExperienceProfile) => {
          openImmersiveExperiencePage(
            createImmersiveExperienceDemoAsset(
              profile,
              game.mapView.currentCameraCenter
            )
          );
        }}
        openRlLabPage={() => {
          openRlLabPage(game.exportCurrentScenario());
        }}
        toggleFocusFireMode={toggleFocusFireMode}
        armFocusFireObjectiveSelection={armFocusFireObjectiveSelection}
        clearFocusFireObjective={clearFocusFireObjective}
        openScenario3dView={armTerrain3dSelection}
        openFocusFireAirwatch={openFocusFireAirwatch}
        openFocusFireDock={() => setFocusFireDockOpen(true)}
      />

      {guideRailVisible && !terrain3dSelectionActive && (
        <ExperienceGuideRail
          mobileView={mobileView}
          game={game}
          drawerOpen={drawerOpen}
          startAssetPlacement={handleStartAssetPlacement}
          onAlertAction={handleGuideRailAlertAction}
          onAssetMixAction={handleGuideRailAssetMixAction}
          activeAssetMixId={activeGuideRailAssetType}
          assetSelectionLabels={guideRailSelectionLabels}
          playOnClick={handlePlayGameClick}
          pauseOnClick={handlePauseGameClick}
          stepOnClick={handleStepGameClick}
          openScenario3dView={armTerrain3dSelection}
          openSimulationLogs={openSimulationLogs}
        />
      )}

      {terrain3dSelectionActive && (
        <div
          style={{
            position: "absolute",
            top: mobileView ? "1rem" : "1.25rem",
            left: mobileView ? "1rem" : "1.25rem",
            zIndex: 1002,
            maxWidth: mobileView ? "calc(100vw - 2rem)" : 360,
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(127, 231, 255, 0.18)",
            background: "rgba(4, 16, 22, 0.88)",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.32)",
            backdropFilter: "blur(16px)",
            color: "#ecfffb",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "rgba(236, 255, 251, 0.72)",
            }}
          >
            TERRAIN 3D
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "17px",
              fontWeight: 800,
            }}
          >
            드래그해서 3D 지형 영역 선택
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "12.5px",
              lineHeight: 1.5,
              color: "rgba(236, 255, 251, 0.76)",
            }}
          >
            마우스로 사각형을 그리면 선택한 구역만 전용 3D 화면으로
            엽니다. Esc로도 취소할 수 있습니다.
          </div>
          <button
            type="button"
            onClick={() => setTerrain3dSelectionActive(false)}
            style={{
              marginTop: "12px",
              border: "1px solid rgba(127, 231, 255, 0.28)",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.04)",
              color: "#ecfffb",
              padding: "7px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            취소
          </button>
        </div>
      )}

      <LayerVisibilityPanelToggle
        baseMapModes={baseMapLayers.getAvailableModes()}
        activeBaseMapModeId={baseMapModeId}
        featureLabelVisibility={featureLabelVisible}
        toggleFeatureLabelVisibility={toggleFeatureLabelVisibility}
        threatRangeVisibility={threatRangeVisible}
        toggleThreatRangeVisibility={toggleThreatRangeVisibility}
        routeVisibility={routeVisible}
        toggleRouteVisibility={toggleRouteVisibility}
        weaponTrajectoryVisibility={weaponTrajectoryVisible}
        toggleWeaponTrajectoryVisibility={toggleWeaponTrajectoryVisibility}
        toggleBaseMapLayer={toggleBaseMapLayer}
        toggleReferencePointVisibility={toggleReferencePointVisibility}
        referencePointVisibility={referencePointVisible}
        rightOffset={rightOverlayOffset}
      />

      <BottomInfoDisplay
        mobileView={mobileView}
        replayMetric={activeReplayMetric}
        selectedCombatant={selectedCombatant}
        rightOffset={mobileView ? undefined : `${rightOverlayOffset}px`}
        focusFireDock={
          <FocusFireDockPanel
            game={game}
            mobileView={mobileView}
            open={focusFireDockOpen}
            onOpen={() => setFocusFireDockOpen(true)}
            onClose={() => setFocusFireDockOpen(false)}
            onToggleFocusFireMode={toggleFocusFireMode}
            onArmObjectiveSelection={armFocusFireObjectiveSelection}
            onClearObjective={clearFocusFireObjective}
            onOpenAirwatch={openFocusFireAirwatch}
          />
        }
      />

      {dragSelectedFeatures.length > 0 && (
        <DragSelectionCard
          game={game}
          sideId={game.currentSideId}
          mobileView={mobileView}
          rightOffset={mobileView ? undefined : `${rightOverlayOffset}px`}
          features={dragSelectedFeatures}
          priorities={dragSelectedTargetPriorities}
          selectedTargetId={selectedDragRecommendationTargetId}
          onSelectTarget={setSelectedDragRecommendationTargetId}
          onCreateStrikeMission={() => {
            openMissionCreator(
              "Strike",
              dragSelectedTargetPriorities.map((entry) => entry.targetId)
            );
            clearDragSelection();
          }}
          onInspectFeature={inspectDragSelectedFeature}
          onClearSelection={clearDragSelection}
          facilityGroupSummary={
            dragSelectedFacilityPlacementGroup
              ? {
                  label: dragSelectedFacilityPlacementGroup.label,
                  memberCount:
                    dragSelectedFacilityPlacementGroup.facilityIds.length,
                }
              : null
          }
          onMoveFacilityGroup={
            dragSelectedFacilityPlacementGroup
              ? () =>
                  queueFacilityPlacementGroupForTeleport(
                    dragSelectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          onDeleteFacilityGroup={
            dragSelectedFacilityPlacementGroup
              ? () =>
                  removeFacilityPlacementGroup(
                    dragSelectedFacilityPlacementGroup.id
                  )
              : undefined
          }
        />
      )}

      {missionCreatorActive && (
        <MissionCreatorCard
          game={game}
          sideId={game.currentSideId}
          initialMissionType={missionCreatorInitialMissionType}
          initialSelectedTargetIds={missionCreatorInitialTargetIds}
          aircraft={game.currentScenario.aircraft.filter(
            (aircraft) =>
              aircraft.sideId === game.currentSideId &&
              game.currentScenario.missions
                .map((mission) => mission.assignedUnitIds)
                .flat()
                .indexOf(aircraft.id) === -1
          )}
          targets={game.currentScenario.getAllTargetsFromEnemySides(
            game.currentSideId
          )}
          referencePoints={game.currentScenario.referencePoints.filter(
            (referencePoint) => referencePoint.sideId === game.currentSideId
          )}
          handleCloseOnMap={closeMissionCreator}
          createPatrolMission={handleCreatePatrolMission}
          createStrikeMission={handleCreateStrikeMission}
        />
      )}

      {missionEditorActive.open &&
        game.currentScenario.missions.filter(
          (mission) =>
            mission.sideId ===
            game.currentScenario.getSide(game.currentSideId)?.id
        ).length > 0 && (
          <MissionEditorCard
            game={game}
            sideId={game.currentSideId}
            missions={game.currentScenario.missions.filter(
              (mission) =>
                mission.sideId ===
                game.currentScenario.getSide(game.currentSideId)?.id
            )}
            selectedMissionId={missionEditorActive.selectedMissionId}
            aircraft={game.currentScenario.aircraft.filter(
              (aircraft) => aircraft.sideId === game.currentSideId
            )}
            referencePoints={game.currentScenario.referencePoints.filter(
              (referencePoint) => referencePoint.sideId === game.currentSideId
            )}
            targets={game.currentScenario.getAllTargetsFromEnemySides(
              game.currentSideId
            )}
            updatePatrolMission={handleUpdatePatrolMission}
            updateStrikeMission={handleUpdateStrikeMission}
            deleteMission={handleDeleteMission}
            handleCloseOnMap={closeMissionEditor}
          />
        )}

      {simulationLogsActive && (
        <SimulationLogs handleCloseOnMap={closeSimulationLogs} />
      )}

        <LiveCommentaryNotifications
          notifications={liveCommentaryNotifications}
          onDismiss={dismissLiveCommentaryNotification}
          rightOffset={rightOverlayOffset}
        />

      <Main open={drawerOpen}>
        <DrawerHeader />
        <div
          ref={mapRef}
          id="map"
          className={baseMapModeId === "evening" ? "scenario-map--evening" : ""}
        ></div>
      </Main>

      {selectedAirbase && (
        <AirbaseCard
          airbase={selectedAirbase}
          sideName={game.currentScenario.getSideName(selectedAirbase.sideId)}
          handleAddAircraft={addAircraftToAirbase}
          handleDeleteAircraft={removeAircraftFromAirbase}
          handleLaunchAircraft={launchAircraftFromAirbase}
          handleDeleteAirbase={removeAirbase}
          handleEditAirbase={updateAirbase}
          handleTeleportUnit={queueUnitForTeleport}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createAirbaseExperienceSummary(
                selectedAirbase,
                game.currentScenario.getSideName(selectedAirbase.sideId)
              )
            );
          }}
          anchorPositionTop={openAirbaseCard.top}
          anchorPositionLeft={openAirbaseCard.left}
          handleCloseOnMap={() => {
            setOpenAirbaseCard({
              open: false,
              top: 0,
              left: 0,
              airbaseId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedFacility && (
        <FacilityCard
          facility={selectedFacility}
          sideName={game.currentScenario.getSideName(selectedFacility.sideId)}
          handleTeleportUnit={queueUnitForTeleport}
          handleDeleteFacility={removeFacility}
          facilityGroupSummary={
            selectedFacilityPlacementGroup
              ? {
                  label: selectedFacilityPlacementGroup.label,
                  memberCount:
                    selectedFacilityPlacementGroup.facilityIds.length,
                }
              : null
          }
          handleSelectFacilityGroup={
            selectedFacilityPlacementGroup
              ? () =>
                  selectFacilityPlacementGroup(
                    selectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          handleTeleportFacilityGroup={
            selectedFacilityPlacementGroup
              ? () =>
                  queueFacilityPlacementGroupForTeleport(
                    selectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          handleDeleteFacilityGroup={
            selectedFacilityPlacementGroup
              ? () =>
                  removeFacilityPlacementGroup(
                    selectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          handleEditFacility={updateFacility}
          handleAddWeapon={handleAddWeaponToFacility}
          handleDeleteWeapon={handleDeleteWeaponFromFacility}
          handleUpdateWeaponQuantity={handleUpdateFacilityWeaponQuantity}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createFacilityExperienceSummary(
                selectedFacility,
                game.currentScenario.getSideName(selectedFacility.sideId)
              )
            );
          }}
          anchorPositionTop={openFacilityCard.top}
          anchorPositionLeft={openFacilityCard.left}
          handleCloseOnMap={closeFacilityCard}
        />
      )}
      {selectedArmy && (
        <ArmyCard
          army={selectedArmy}
          sideName={game.currentScenario.getSideName(selectedArmy.sideId)}
          handleDeleteArmy={removeArmy}
          handleMoveArmy={queueArmyForMovement}
          handleArmyAttack={handleArmyAttack}
          handleArmyAutoAttack={handleArmyAutoAttack}
          handleTeleportUnit={queueUnitForTeleport}
          handleEditArmy={updateArmy}
          handleAddWeapon={handleAddWeaponToArmy}
          handleDeleteWeapon={handleDeleteWeaponFromArmy}
          handleUpdateWeaponQuantity={handleUpdateArmyWeaponQuantity}
          anchorPositionTop={openArmyCard.top}
          anchorPositionLeft={openArmyCard.left}
          handleCloseOnMap={() => {
            setOpenArmyCard({
              open: false,
              top: 0,
              left: 0,
              armyId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedAircraft && (
        <AircraftCard
          aircraft={selectedAircraft}
          sideName={game.currentScenario.getSideName(selectedAircraft.sideId)}
          currentMissionName={selectedAircraftMission?.name ?? null}
          currentMissionId={selectedAircraftMission?.id ?? ""}
          openMissionEditor={openMissionEditor}
          handleDeleteAircraft={removeAircraft}
          handleMoveAircraft={queueAircraftForMovement}
          handleAircraftAttack={handleAircraftAttack}
          handleAircraftAutoAttack={handleAircraftAutoAttack}
          handleEditAircraft={updateAircraft}
          handleAircraftRtb={handleAircraftRtb}
          handleDuplicateAircraft={handleDuplicateAircraft}
          handleTeleportUnit={queueUnitForTeleport}
          handleAddWeapon={handleAddWeaponToAircraft}
          handleDeleteWeapon={handleDeleteWeaponFromAircraft}
          handleUpdateWeaponQuantity={handleUpdateAircraftWeaponQuantity}
          openTacticalExperience={() => {
            openAirCombatOverlay(
              createAircraftExperienceSummary(
                selectedAircraft,
                game.currentScenario.getSideName(selectedAircraft.sideId),
                selectedAircraftMission?.name
              ),
              {
                continueSimulation: !game.scenarioPaused,
              }
            );
          }}
          anchorPositionTop={openAircraftCard.top}
          anchorPositionLeft={openAircraftCard.left}
          handleCloseOnMap={() => {
            setOpenAircraftCard({
              open: false,
              top: 0,
              left: 0,
              aircraftId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedShip && (
        <ShipCard
          ship={selectedShip}
          sideName={game.currentScenario.getSideName(selectedShip.sideId)}
          handleAddAircraft={addAircraftToShip}
          handleDeleteAircraft={removeAircraftFromShip}
          handleLaunchAircraft={launchAircraftFromShip}
          handleDeleteShip={removeShip}
          handleMoveShip={queueShipForMovement}
          handleShipAttack={handleShipAttack}
          handleShipAutoAttack={handleShipAutoAttack}
          handleTeleportUnit={queueUnitForTeleport}
          handleEditShip={updateShip}
          handleAddWeapon={handleAddWeaponToShip}
          handleDeleteWeapon={handleDeleteWeaponFromShip}
          handleUpdateWeaponQuantity={handleUpdateShipWeaponQuantity}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createShipExperienceSummary(
                selectedShip,
                game.currentScenario.getSideName(selectedShip.sideId)
              )
            );
          }}
          anchorPositionTop={openShipCard.top}
          anchorPositionLeft={openShipCard.left}
          handleCloseOnMap={() => {
            setOpenShipCard({
              open: false,
              top: 0,
              left: 0,
              shipId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedReferencePoint && (
        <ReferencePointCard
          referencePoint={selectedReferencePoint}
          sideName={game.currentScenario.getSideName(
            selectedReferencePoint.sideId
          )}
          handleDeleteReferencePoint={removeReferencePoint}
          handleEditReferencePoint={updateReferencePoint}
          handleTeleportUnit={queueUnitForTeleport}
          anchorPositionTop={openReferencePointCard.top}
          anchorPositionLeft={openReferencePointCard.left}
          handleCloseOnMap={() => {
            setOpenReferencePointCard({
              open: false,
              top: 0,
              left: 0,
              referencePointId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedWeapon && (
        <WeaponCard
          weapon={selectedWeapon}
          sideName={game.currentScenario.getSideName(selectedWeapon.sideId)}
          handleTeleportUnit={queueUnitForTeleport}
          handleDeleteWeapon={removeWeapon}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createWeaponExperienceSummary(
                selectedWeapon,
                game.currentScenario.getSideName(selectedWeapon.sideId)
              )
            );
          }}
          anchorPositionTop={openWeaponCard.top}
          anchorPositionLeft={openWeaponCard.left}
          handleCloseOnMap={() => {
            setOpenWeaponCard({
              open: false,
              top: 0,
              left: 0,
              weaponId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {openMultipleFeatureSelector.open && (
        <MultipleFeatureSelector
          features={openMultipleFeatureSelector.features}
          handleSelectSingleFeature={handleSelectSingleFeature}
          anchorPositionTop={openMultipleFeatureSelector.top}
          anchorPositionLeft={openMultipleFeatureSelector.left}
          handleCloseOnMap={() => {
            setOpenMultipleFeatureSelector({
              open: false,
              top: 0,
              left: 0,
              features: [],
            });
          }}
        />
      )}
      {openSideEditor.open && openSideEditor.anchorEl && (
        <SideEditor
          open={openSideEditor.open}
          anchorEl={openSideEditor.anchorEl}
          side={game.currentScenario.getSide(openSideEditor.sideId)}
          sides={game.currentScenario.sides}
          hostiles={
            openSideEditor.sideId
              ? game.currentScenario.relationships.getHostiles(
                  openSideEditor.sideId
                )
              : []
          }
          allies={
            openSideEditor.sideId
              ? game.currentScenario.relationships.getAllies(
                  openSideEditor.sideId
                )
              : []
          }
          doctrine={
            openSideEditor.sideId
              ? game.currentScenario.getSideDoctrine(openSideEditor.sideId)
              : game.currentScenario.getDefaultSideDoctrine()
          }
          updateSide={handleUpdateSide}
          addSide={handleAddSide}
          deleteSide={handleDeleteSide}
          handleCloseOnMap={handleCloseSideEditor}
        />
      )}
      {openMapContextMenu.open && (
        <MapContextMenu
          anchorPositionTop={openMapContextMenu.top}
          anchorPositionLeft={openMapContextMenu.left}
          handleCloseOnMap={() => {
            setOpenMapContextMenu({
              ...openMapContextMenu,
              open: false,
            });
          }}
          handleAddReferencePoint={() => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "참조점을 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            addReferencePoint(openMapContextMenu.coordinates);
          }}
          handleAddAirbase={() => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "기지를 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            addAirbase(openMapContextMenu.coordinates);
          }}
          handleAddAircraft={(unitClassName: string) => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "항공기를 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            game.addingAircraft = true;
            game.selectedUnitClassName = unitClassName;
            handleAddUnit(openMapContextMenu.coordinates);
          }}
          handleAddShip={(unitClassName: string) => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "함정을 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            game.addingShip = true;
            game.selectedUnitClassName = unitClassName;
            handleAddUnit(openMapContextMenu.coordinates);
          }}
          handleAddFacility={(unitClassName: string) => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "지상 무기체계를 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            game.addingFacility = true;
            game.selectedUnitClassName = unitClassName;
            handleAddUnit(openMapContextMenu.coordinates);
          }}
        />
      )}
      {openTargetFireRecommendation.open &&
        (() => {
          const target = game.getTargetById(
            openTargetFireRecommendation.targetId
          );
          const recommendation = openTargetFireRecommendation.targetId
            ? game.getFireRecommendationForTarget(
                openTargetFireRecommendation.targetId,
                game.currentSideId
              )
            : null;

          if (
            !target ||
            !(
              target instanceof Aircraft ||
              target instanceof Army ||
              target instanceof Facility ||
              target instanceof Ship ||
              target instanceof Airbase
            )
          ) {
            return null;
          }

          return (
            <TargetFireRecommendationCard
              top={openTargetFireRecommendation.top}
              left={openTargetFireRecommendation.left}
              targetName={target.name}
              targetLatitude={target.latitude}
              targetLongitude={target.longitude}
              recommendation={recommendation}
              rerankerModel={game.getFocusFireRerankerState().model}
              handleCloseOnMap={() => {
                setOpenTargetFireRecommendation({
                  open: false,
                  top: 0,
                  left: 0,
                  targetId: "",
                });
              }}
            />
          );
        })()}
      <SimulationOutcomeDialog
        open={isGameOver}
        summary={simulationOutcomeSummary}
        narrative={simulationOutcomeNarrative}
        narrativeSource={simulationOutcomeNarrativeSource}
        loading={simulationOutcomeLoading}
        onClose={() => setIsGameOver(false)}
      />
    </>
    // The end of the return
  );

  // END
}
