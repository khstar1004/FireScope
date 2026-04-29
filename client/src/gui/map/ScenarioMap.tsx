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
import {
  getOfflineMapRegion,
  getOfflineSatelliteTileUrl,
  getOfflineVectorBasemapUrl,
  KOREA_OFFLINE_REGION,
} from "@/gui/map/offlineMapConfig";

import { useScenarioMapInteractions } from "@/gui/map/hooks/useScenarioMapInteractions";
import { useScenarioMapOperations } from "@/gui/map/hooks/useScenarioMapOperations";
import { useScenarioMapSessionControls } from "@/gui/map/hooks/useScenarioMapSessionControls";
import ScenarioMapView from "@/gui/map/view/ScenarioMapView";

interface ScenarioMapProps {
  zoom: number;
  center: number[];
  game: Game;
  projection?: Projection;
  mobileView: boolean;
  offlineDemoMode?: boolean;
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
  eveningMapUrl?: string,
  includeOsmFallback = true,
  offlineVectorMapUrl?: string
) {
  return new BaseMapLayers(
    projection,
    mapTilerBasicUrl,
    mapTilerSatelliteUrl,
    hybridLabelUrl,
    eveningMapUrl,
    undefined,
    includeOsmFallback,
    offlineVectorMapUrl
  );
}

export default function ScenarioMap({
  zoom,
  center,
  game,
  projection,
  mobileView,
  offlineDemoMode = false,
  openRlLabPage,
  openFlightSimPage,
  openAirCombatOverlay,
  openAssetExperiencePage,
  openImmersiveExperiencePage,
  openTerrain3dPage,
}: Readonly<ScenarioMapProps>) {
  // checking env key
  const offlineMapRegion = offlineDemoMode
    ? getOfflineMapRegion({
        forceOffline: true,
        preferredRegionId: KOREA_OFFLINE_REGION.id,
      })
    : null;
  const MAPTILER_DEFAULT_KEY =
    import.meta.env.VITE_MAPTILER_DEFAULT_KEY ??
    import.meta.env.MAPTILER_API_KEY;
  if (!MAPTILER_DEFAULT_KEY && !offlineMapRegion) {
    console.error(
      "MapTiler key not found. Set VITE_MAPTILER_DEFAULT_KEY or MAPTILER_API_KEY, or enable VITE_MAP_MODE=offline."
    );
  }

  const mapRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef(game);
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
  const mapTilerBasicUrl =
    !offlineMapRegion && MAPTILER_DEFAULT_KEY
      ? `https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_DEFAULT_KEY}`
      : undefined;
  const mapTilerEveningUrl =
    !offlineMapRegion && MAPTILER_DEFAULT_KEY
      ? `https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${MAPTILER_DEFAULT_KEY}`
      : undefined;
  const mapTilerSatelliteJsonUrl = offlineMapRegion
    ? getOfflineSatelliteTileUrl(offlineMapRegion)
    : MAPTILER_DEFAULT_KEY
      ? `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${MAPTILER_DEFAULT_KEY}`
      : undefined;
  const offlineVectorMapUrl = offlineMapRegion
    ? getOfflineVectorBasemapUrl(offlineMapRegion)
    : undefined;
  const vworldHybridUrl =
    !offlineMapRegion && import.meta.env.VITE_VWORLD_API_KEY
      ? `https://api.vworld.kr/req/wmts/1.0.0/${import.meta.env.VITE_VWORLD_API_KEY}/Hybrid/{z}/{y}/{x}.png`
      : undefined;
  const [baseMapLayers, setBaseMapLayers] = useState(
    createScenarioBaseMapLayers(
      projection,
      mapTilerBasicUrl,
      mapTilerSatelliteJsonUrl,
      vworldHybridUrl,
      mapTilerEveningUrl,
      !offlineMapRegion,
      offlineVectorMapUrl
    )
  );
  const [baseMapModeId, setBaseMapModeId] = useState<BaseMapModeId>(() =>
    baseMapLayers.getCurrentModeId()
  );
  const baseMapModeIdRef = useRef<BaseMapModeId>(
    baseMapLayers.getCurrentModeId()
  );

  gameRef.current = game;
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
  const [weaponTrajectoryVisible, setWeaponTrajectoryVisible] = useState(false);
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

  const routeMeasurementDrawLineRef = useRef<Draw | null>(null);
  const routeMeasurementTooltipElementRef =
    useRef<HTMLDivElement | null>(null);
  const routeMeasurementTooltipRef = useRef<Overlay | null>(null);
  const routeMeasurementListenerRef = useRef<EventsKey | undefined>(undefined);
  const teleportingUnitRef = useRef(false);

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

  function buildMapLayerStack(nextBaseMapLayers: BaseMapLayers) {
    return [
      ...nextBaseMapLayers.layers,
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
    ];
  }

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

  const scenarioMapRuntimeRef = useRef<Record<string, (...args: any[]) => any>>({});
  const scenarioMapRuntime = scenarioMapRuntimeRef.current;
  const scenarioMapRuntimeProxies = {
    addAirbase: (...args: any[]) => scenarioMapRuntime.addAirbase?.(...args),
    addAircraft: (...args: any[]) => scenarioMapRuntime.addAircraft?.(...args),
    addAircraftToAirbase: (...args: any[]) => scenarioMapRuntime.addAircraftToAirbase?.(...args),
    addAircraftToShip: (...args: any[]) => scenarioMapRuntime.addAircraftToShip?.(...args),
    addFacility: (...args: any[]) => scenarioMapRuntime.addFacility?.(...args),
    addReferencePoint: (...args: any[]) => scenarioMapRuntime.addReferencePoint?.(...args),
    addRouteMeasurementInteraction: (...args: any[]) => scenarioMapRuntime.addRouteMeasurementInteraction?.(...args),
    addShip: (...args: any[]) => scenarioMapRuntime.addShip?.(...args),
    armFocusFireObjectiveSelection: (...args: any[]) => scenarioMapRuntime.armFocusFireObjectiveSelection?.(...args),
    armTerrain3dSelection: (...args: any[]) => scenarioMapRuntime.armTerrain3dSelection?.(...args),
    buildFacilityPlacementGroupLabel: (...args: any[]) => scenarioMapRuntime.buildFacilityPlacementGroupLabel?.(...args),
    changeCursorType: (...args: any[]) => scenarioMapRuntime.changeCursorType?.(...args),
    cleanUpRouteDrawLineAndMeasurementTooltip: (...args: any[]) => scenarioMapRuntime.cleanUpRouteDrawLineAndMeasurementTooltip?.(...args),
    clearDragSelection: (...args: any[]) => scenarioMapRuntime.clearDragSelection?.(...args),
    clearFocusFireObjective: (...args: any[]) => scenarioMapRuntime.clearFocusFireObjective?.(...args),
    clearLiveCommentaryNotifications: (...args: any[]) => scenarioMapRuntime.clearLiveCommentaryNotifications?.(...args),
    clearPendingFacilityGroupTeleport: (...args: any[]) => scenarioMapRuntime.clearPendingFacilityGroupTeleport?.(...args),
    clearPendingFacilityPlacement: (...args: any[]) => scenarioMapRuntime.clearPendingFacilityPlacement?.(...args),
    clearRecordingPlayer: (...args: any[]) => scenarioMapRuntime.clearRecordingPlayer?.(...args),
    clearRlCheckpointSpectatorSession: (...args: any[]) => scenarioMapRuntime.clearRlCheckpointSpectatorSession?.(...args),
    closeFacilityCard: (...args: any[]) => scenarioMapRuntime.closeFacilityCard?.(...args),
    closeFeatureCard: (...args: any[]) => scenarioMapRuntime.closeFeatureCard?.(...args),
    closeMissionCreator: (...args: any[]) => scenarioMapRuntime.closeMissionCreator?.(...args),
    closeMissionEditor: (...args: any[]) => scenarioMapRuntime.closeMissionEditor?.(...args),
    closeSimulationLogs: (...args: any[]) => scenarioMapRuntime.closeSimulationLogs?.(...args),
    createRouteMeasurementTooltip: (...args: any[]) => scenarioMapRuntime.createRouteMeasurementTooltip?.(...args),
    dismissLiveCommentaryNotification: (...args: any[]) => scenarioMapRuntime.dismissLiveCommentaryNotification?.(...args),
    drawNextFrame: (...args: any[]) => scenarioMapRuntime.drawNextFrame?.(...args),
    exitReplayMode: (...args: any[]) => scenarioMapRuntime.exitReplayMode?.(...args),
    facilityPlacementDefaultsRef: (...args: any[]) => scenarioMapRuntime.facilityPlacementDefaultsRef?.(...args),
    finalizeFacilityPlacement: (...args: any[]) => scenarioMapRuntime.finalizeFacilityPlacement?.(...args),
    findLatestReplayableCheckpoint: (...args: any[]) => scenarioMapRuntime.findLatestReplayableCheckpoint?.(...args),
    finishRouteDrawLine: (...args: any[]) => scenarioMapRuntime.finishRouteDrawLine?.(...args),
    formatRouteLengthDisplay: (...args: any[]) => scenarioMapRuntime.formatRouteLengthDisplay?.(...args),
    getCurrentFacilityIds: (...args: any[]) => scenarioMapRuntime.getCurrentFacilityIds?.(...args),
    getEmphasizedFacilityPlacementGroupIds: (...args: any[]) => scenarioMapRuntime.getEmphasizedFacilityPlacementGroupIds?.(...args),
    getFacilityFeaturesByIds: (...args: any[]) => scenarioMapRuntime.getFacilityFeaturesByIds?.(...args),
    getFeaturesAtPixel: (...args: any[]) => scenarioMapRuntime.getFeaturesAtPixel?.(...args),
    getFeaturesInExtent: (...args: any[]) => scenarioMapRuntime.getFeaturesInExtent?.(...args),
    getMapClickContext: (...args: any[]) => scenarioMapRuntime.getMapClickContext?.(...args),
    getPendingFacilityPlacementPreview: (...args: any[]) => scenarioMapRuntime.getPendingFacilityPlacementPreview?.(...args),
    getPendingFacilityPlacementPreviews: (...args: any[]) => scenarioMapRuntime.getPendingFacilityPlacementPreviews?.(...args),
    getRecommendationTargetIdAtPixel: (...args: any[]) => scenarioMapRuntime.getRecommendationTargetIdAtPixel?.(...args),
    getReplayMetricForStep: (...args: any[]) => scenarioMapRuntime.getReplayMetricForStep?.(...args),
    getSelectedFeatureType: (...args: any[]) => scenarioMapRuntime.getSelectedFeatureType?.(...args),
    handleAddSide: (...args: any[]) => scenarioMapRuntime.handleAddSide?.(...args),
    handleAddUnit: (...args: any[]) => scenarioMapRuntime.handleAddUnit?.(...args),
    handleAddWeaponToAircraft: (...args: any[]) => scenarioMapRuntime.handleAddWeaponToAircraft?.(...args),
    handleAddWeaponToArmy: (...args: any[]) => scenarioMapRuntime.handleAddWeaponToArmy?.(...args),
    handleAddWeaponToFacility: (...args: any[]) => scenarioMapRuntime.handleAddWeaponToFacility?.(...args),
    handleAddWeaponToShip: (...args: any[]) => scenarioMapRuntime.handleAddWeaponToShip?.(...args),
    handleAircraftAttack: (...args: any[]) => scenarioMapRuntime.handleAircraftAttack?.(...args),
    handleAircraftAutoAttack: (...args: any[]) => scenarioMapRuntime.handleAircraftAutoAttack?.(...args),
    handleAircraftRtb: (...args: any[]) => scenarioMapRuntime.handleAircraftRtb?.(...args),
    handleArmyAttack: (...args: any[]) => scenarioMapRuntime.handleArmyAttack?.(...args),
    handleArmyAutoAttack: (...args: any[]) => scenarioMapRuntime.handleArmyAutoAttack?.(...args),
    handleCloseSideEditor: (...args: any[]) => scenarioMapRuntime.handleCloseSideEditor?.(...args),
    handleCreatePatrolMission: (...args: any[]) => scenarioMapRuntime.handleCreatePatrolMission?.(...args),
    handleCreateStrikeMission: (...args: any[]) => scenarioMapRuntime.handleCreateStrikeMission?.(...args),
    handleDeleteFeatureEntity: (...args: any[]) => scenarioMapRuntime.handleDeleteFeatureEntity?.(...args),
    handleDeleteMission: (...args: any[]) => scenarioMapRuntime.handleDeleteMission?.(...args),
    handleDeleteSide: (...args: any[]) => scenarioMapRuntime.handleDeleteSide?.(...args),
    handleDeleteWeaponFromAircraft: (...args: any[]) => scenarioMapRuntime.handleDeleteWeaponFromAircraft?.(...args),
    handleDeleteWeaponFromArmy: (...args: any[]) => scenarioMapRuntime.handleDeleteWeaponFromArmy?.(...args),
    handleDeleteWeaponFromFacility: (...args: any[]) => scenarioMapRuntime.handleDeleteWeaponFromFacility?.(...args),
    handleDeleteWeaponFromShip: (...args: any[]) => scenarioMapRuntime.handleDeleteWeaponFromShip?.(...args),
    handleDuplicateAircraft: (...args: any[]) => scenarioMapRuntime.handleDuplicateAircraft?.(...args),
    handleFeatureEntityStateAction: (...args: any[]) => scenarioMapRuntime.handleFeatureEntityStateAction?.(...args),
    handleLoadFixedTargetStrikeReplay: (...args: any[]) => scenarioMapRuntime.handleLoadFixedTargetStrikeReplay?.(...args),
    handleLoadRecording: (...args: any[]) => scenarioMapRuntime.handleLoadRecording?.(...args),
    handleMapClick: (...args: any[]) => scenarioMapRuntime.handleMapClick?.(...args),
    handleOpenSideEditor: (...args: any[]) => scenarioMapRuntime.handleOpenSideEditor?.(...args),
    handlePauseGameClick: (...args: any[]) => scenarioMapRuntime.handlePauseGameClick?.(...args),
    handlePauseRecordingClick: (...args: any[]) => scenarioMapRuntime.handlePauseRecordingClick?.(...args),
    handlePlayGameClick: (...args: any[]) => scenarioMapRuntime.handlePlayGameClick?.(...args),
    handlePlayRecordingClick: (...args: any[]) => scenarioMapRuntime.handlePlayRecordingClick?.(...args),
    handleRecordScenarioClick: (...args: any[]) => scenarioMapRuntime.handleRecordScenarioClick?.(...args),
    handleRouteDrawEnd: (...args: any[]) => scenarioMapRuntime.handleRouteDrawEnd?.(...args),
    handleSelectMultipleFeatures: (...args: any[]) => scenarioMapRuntime.handleSelectMultipleFeatures?.(...args),
    handleSelectSingleFeature: (...args: any[]) => scenarioMapRuntime.handleSelectSingleFeature?.(...args),
    handleShipAttack: (...args: any[]) => scenarioMapRuntime.handleShipAttack?.(...args),
    handleShipAutoAttack: (...args: any[]) => scenarioMapRuntime.handleShipAutoAttack?.(...args),
    handleStartScenario: (...args: any[]) => scenarioMapRuntime.handleStartScenario?.(...args),
    handleStepGameClick: (...args: any[]) => scenarioMapRuntime.handleStepGameClick?.(...args),
    handleStepRecordingBackwards: (...args: any[]) => scenarioMapRuntime.handleStepRecordingBackwards?.(...args),
    handleStepRecordingForwards: (...args: any[]) => scenarioMapRuntime.handleStepRecordingForwards?.(...args),
    handleStepRecordingToStep: (...args: any[]) => scenarioMapRuntime.handleStepRecordingToStep?.(...args),
    handleStopRecordingScenarioClick: (...args: any[]) => scenarioMapRuntime.handleStopRecordingScenarioClick?.(...args),
    handleUndo: (...args: any[]) => scenarioMapRuntime.handleUndo?.(...args),
    handleUpdateAircraftWeaponQuantity: (...args: any[]) => scenarioMapRuntime.handleUpdateAircraftWeaponQuantity?.(...args),
    handleUpdateArmyWeaponQuantity: (...args: any[]) => scenarioMapRuntime.handleUpdateArmyWeaponQuantity?.(...args),
    handleUpdateFacilityWeaponQuantity: (...args: any[]) => scenarioMapRuntime.handleUpdateFacilityWeaponQuantity?.(...args),
    handleUpdatePatrolMission: (...args: any[]) => scenarioMapRuntime.handleUpdatePatrolMission?.(...args),
    handleUpdateShipWeaponQuantity: (...args: any[]) => scenarioMapRuntime.handleUpdateShipWeaponQuantity?.(...args),
    handleUpdateSide: (...args: any[]) => scenarioMapRuntime.handleUpdateSide?.(...args),
    handleUpdateStrikeMission: (...args: any[]) => scenarioMapRuntime.handleUpdateStrikeMission?.(...args),
    inspectDragSelectedFeature: (...args: any[]) => scenarioMapRuntime.inspectDragSelectedFeature?.(...args),
    launchAircraftFromAirbase: (...args: any[]) => scenarioMapRuntime.launchAircraftFromAirbase?.(...args),
    launchAircraftFromShip: (...args: any[]) => scenarioMapRuntime.launchAircraftFromShip?.(...args),
    loadAndDisplayCurrentRecordedFrame: (...args: any[]) => scenarioMapRuntime.loadAndDisplayCurrentRecordedFrame?.(...args),
    loadFacilityPlacementGroupsFromScenario: (...args: any[]) => scenarioMapRuntime.loadFacilityPlacementGroupsFromScenario?.(...args),
    loadFeatureEntitiesState: (...args: any[]) => scenarioMapRuntime.loadFeatureEntitiesState?.(...args),
    loadRecordingContent: (...args: any[]) => scenarioMapRuntime.loadRecordingContent?.(...args),
    moveAircraft: (...args: any[]) => scenarioMapRuntime.moveAircraft?.(...args),
    moveArmy: (...args: any[]) => scenarioMapRuntime.moveArmy?.(...args),
    moveShip: (...args: any[]) => scenarioMapRuntime.moveShip?.(...args),
    openFocusFireAirwatch: (...args: any[]) => scenarioMapRuntime.openFocusFireAirwatch?.(...args),
    openMissionCreator: (...args: any[]) => scenarioMapRuntime.openMissionCreator?.(...args),
    openMissionEditor: (...args: any[]) => scenarioMapRuntime.openMissionEditor?.(...args),
    openSimulationLogs: (...args: any[]) => scenarioMapRuntime.openSimulationLogs?.(...args),
    parseRlCheckpointSpectatorSession: (...args: any[]) => scenarioMapRuntime.parseRlCheckpointSpectatorSession?.(...args),
    persistFacilityPlacementGroups: (...args: any[]) => scenarioMapRuntime.persistFacilityPlacementGroups?.(...args),
    presentSimulationOutcome: (...args: any[]) => scenarioMapRuntime.presentSimulationOutcome?.(...args),
    queueAircraftForMovement: (...args: any[]) => scenarioMapRuntime.queueAircraftForMovement?.(...args),
    queueArmyForMovement: (...args: any[]) => scenarioMapRuntime.queueArmyForMovement?.(...args),
    queueFacilityPlacementGroupForTeleport: (...args: any[]) => scenarioMapRuntime.queueFacilityPlacementGroupForTeleport?.(...args),
    queueShipForMovement: (...args: any[]) => scenarioMapRuntime.queueShipForMovement?.(...args),
    queueUnitForTeleport: (...args: any[]) => scenarioMapRuntime.queueUnitForTeleport?.(...args),
    refreshAllLayers: (...args: any[]) => scenarioMapRuntime.refreshAllLayers?.(...args),
    refreshFacilityPlacementGroupLayer: (...args: any[]) => scenarioMapRuntime.refreshFacilityPlacementGroupLayer?.(...args),
    refreshFeatureLabelLayer: (...args: any[]) => scenarioMapRuntime.refreshFeatureLabelLayer?.(...args),
    refreshRouteLayer: (...args: any[]) => scenarioMapRuntime.refreshRouteLayer?.(...args),
    refreshThreatRangeLayer: (...args: any[]) => scenarioMapRuntime.refreshThreatRangeLayer?.(...args),
    refreshWeaponTrajectoryLayer: (...args: any[]) => scenarioMapRuntime.refreshWeaponTrajectoryLayer?.(...args),
    registerFacilityPlacementGroup: (...args: any[]) => scenarioMapRuntime.registerFacilityPlacementGroup?.(...args),
    removeAirbase: (...args: any[]) => scenarioMapRuntime.removeAirbase?.(...args),
    removeAircraft: (...args: any[]) => scenarioMapRuntime.removeAircraft?.(...args),
    removeAircraftFromAirbase: (...args: any[]) => scenarioMapRuntime.removeAircraftFromAirbase?.(...args),
    removeAircraftFromShip: (...args: any[]) => scenarioMapRuntime.removeAircraftFromShip?.(...args),
    removeArmy: (...args: any[]) => scenarioMapRuntime.removeArmy?.(...args),
    removeFacility: (...args: any[]) => scenarioMapRuntime.removeFacility?.(...args),
    removeFacilityPlacementGroup: (...args: any[]) => scenarioMapRuntime.removeFacilityPlacementGroup?.(...args),
    removeReferencePoint: (...args: any[]) => scenarioMapRuntime.removeReferencePoint?.(...args),
    removeShip: (...args: any[]) => scenarioMapRuntime.removeShip?.(...args),
    removeWeapon: (...args: any[]) => scenarioMapRuntime.removeWeapon?.(...args),
    resetAttack: (...args: any[]) => scenarioMapRuntime.resetAttack?.(...args),
    resolveTerrain3dBounds: (...args: any[]) => scenarioMapRuntime.resolveTerrain3dBounds?.(...args),
    selectFacilityPlacementGroup: (...args: any[]) => scenarioMapRuntime.selectFacilityPlacementGroup?.(...args),
    setAddingAirbase: (...args: any[]) => scenarioMapRuntime.setAddingAirbase?.(...args),
    setAddingAircraft: (...args: any[]) => scenarioMapRuntime.setAddingAircraft?.(...args),
    setAddingFacility: (...args: any[]) => scenarioMapRuntime.setAddingFacility?.(...args),
    setAddingReferencePoint: (...args: any[]) => scenarioMapRuntime.setAddingReferencePoint?.(...args),
    setAddingShip: (...args: any[]) => scenarioMapRuntime.setAddingShip?.(...args),
    setFocusFireObjective: (...args: any[]) => scenarioMapRuntime.setFocusFireObjective?.(...args),
    setGamePaused: (...args: any[]) => scenarioMapRuntime.setGamePaused?.(...args),
    setReplayState: (...args: any[]) => scenarioMapRuntime.setReplayState?.(...args),
    stepGameAndDrawFrame: (...args: any[]) => scenarioMapRuntime.stepGameAndDrawFrame?.(...args),
    stepGameForStepSize: (...args: any[]) => scenarioMapRuntime.stepGameForStepSize?.(...args),
    switchCurrentSide: (...args: any[]) => scenarioMapRuntime.switchCurrentSide?.(...args),
    syncLiveCommentaryNotifications: (...args: any[]) => scenarioMapRuntime.syncLiveCommentaryNotifications?.(...args),
    teleportFacilityPlacementGroup: (...args: any[]) => scenarioMapRuntime.teleportFacilityPlacementGroup?.(...args),
    teleportUnit: (...args: any[]) => scenarioMapRuntime.teleportUnit?.(...args),
    toggleBaseMapLayer: (...args: any[]) => scenarioMapRuntime.toggleBaseMapLayer?.(...args),
    toggleFeatureLabelVisibility: (...args: any[]) => scenarioMapRuntime.toggleFeatureLabelVisibility?.(...args),
    toggleFocusFireMode: (...args: any[]) => scenarioMapRuntime.toggleFocusFireMode?.(...args),
    toggleRecordEverySeconds: (...args: any[]) => scenarioMapRuntime.toggleRecordEverySeconds?.(...args),
    toggleReferencePointVisibility: (...args: any[]) => scenarioMapRuntime.toggleReferencePointVisibility?.(...args),
    toggleRouteVisibility: (...args: any[]) => scenarioMapRuntime.toggleRouteVisibility?.(...args),
    toggleScenarioTimeCompression: (...args: any[]) => scenarioMapRuntime.toggleScenarioTimeCompression?.(...args),
    toggleThreatRangeVisibility: (...args: any[]) => scenarioMapRuntime.toggleThreatRangeVisibility?.(...args),
    toggleWeaponTrajectoryVisibility: (...args: any[]) => scenarioMapRuntime.toggleWeaponTrajectoryVisibility?.(...args),
    updateAirbase: (...args: any[]) => scenarioMapRuntime.updateAirbase?.(...args),
    updateAircraft: (...args: any[]) => scenarioMapRuntime.updateAircraft?.(...args),
    updateArmy: (...args: any[]) => scenarioMapRuntime.updateArmy?.(...args),
    updateCurrentSimulationLogsToContext: (...args: any[]) => scenarioMapRuntime.updateCurrentSimulationLogsToContext?.(...args),
    updateFacility: (...args: any[]) => scenarioMapRuntime.updateFacility?.(...args),
    updateMapView: (...args: any[]) => scenarioMapRuntime.updateMapView?.(...args),
    updatePendingFacilityPlacementPreview: (...args: any[]) => scenarioMapRuntime.updatePendingFacilityPlacementPreview?.(...args),
    updateReferencePoint: (...args: any[]) => scenarioMapRuntime.updateReferencePoint?.(...args),
    updateSelectedUnitClassName: (...args: any[]) => scenarioMapRuntime.updateSelectedUnitClassName?.(...args),
    updateShip: (...args: any[]) => scenarioMapRuntime.updateShip?.(...args),
  };
  const scenarioMapHookContext = {
    BaseVectorLayer, DEFAULT_OL_PROJECTION_CODE, Draw,
    GAME_SPEED_DELAY_MS, NAUTICAL_MILES_TO_METERS, NaN,
    Overlay, RL_CHECKPOINT_SPECTATOR_KEY, SIDE_COLOR,
    VectorLayer, activeReplayMetrics, airbasesLayer,
    aircraftLayer, aircraftRouteLayer, armyLayer,
    armyRouteLayer, baseMapLayers, baseMapModeIdRef,
    buildFacilityFormationLayout, buildFacilityPlacementGroupTeleportLayout, buildLiveCommentaryNotification,
    buildSimulationOutcomeSummary, createFacilityPlacementGroup, defaultProjection,
    delay, dragSelectedFeatures, facilityLayer,
    facilityPlacementGroupLayer, facilityPlacementGroups, facilityPlacementLayer,
    featureEntitiesState, featureLabelLayer, featureLabelVisible,
    findFacilityPlacementGroupByFacilityId, fixedTargetStrikeRlDemo, fromLonLat,
    game, getDisplayName, getLength,
    getScenarioFacilityPlacementGroups, isMajorSimulationLog, lastObservedSimulationLogCountRef,
    lastObservedSimulationLogIdRef, lastSpectatedCheckpointKeyRef, liveCommentaryTimeoutsRef,
    missionEditorActive, openAirbaseCard, openAircraftCard,
    openArmyCard, openFacilityCard, openFlightSimPage,
    openReferencePointCard, openShipCard, pendingFacilityPlacement,
    pendingFacilityPlacementRef, projection, randomInt,
    referencePointLayer, requestSimulationOutcomeNarrative, resolveFacilityPlacementArcDegrees,
    resolveFacilityPlacementHeading, resolveMatchingFacilityPlacementGroup, rlCheckpointSpectatorPollingTimeoutRef,
    rlCheckpointSpectatorRef, routeMeasurementDrawLineRef, routeMeasurementListenerRef,
    routeMeasurementTooltipRef, routeMeasurementTooltipElementRef, routeVisible,
    scenarioMapActiveRef, selectingFocusFireObjective, setActiveReplayMetric,
    setActiveReplayMetrics, setBaseMapModeId, setCurrentGameStatusToContext,
    setCurrentRecordingIntervalSeconds, setCurrentRecordingStepToContext, setCurrentScenarioSidesToContext,
    setCurrentScenarioTimeCompression, setCurrentScenarioTimeToContext, setCurrentSideId,
    setCurrentSimulationLogsToContext, setDragSelectedFeatures, setFacilityPlacementGroups,
    setFeatureEntitiesState, setFeatureLabelVisible, setFocusFireDockOpen,
    setIsGameOver, setKeyboardShortcutsEnabled, setLiveCommentaryNotifications,
    setMissionCreatorActive, setMissionCreatorInitialMissionType, setMissionCreatorInitialTargetIds,
    setMissionEditorActive, setOpenAirbaseCard, setOpenAircraftCard,
    setOpenArmyCard, setOpenFacilityCard, setOpenMapContextMenu,
    setOpenMultipleFeatureSelector, setOpenReferencePointCard, setOpenShipCard,
    setOpenSideEditor, setOpenTargetFireRecommendation, setOpenWeaponCard,
    setPendingFacilityPlacement, setRecordingPlayerHasRecording, setReferencePointVisible,
    setRouteVisible, setScenarioFacilityPlacementGroups, setSelectedDragRecommendationTargetId,
    setSelectingFocusFireObjective, setSimulationLogsActive, setSimulationOutcomeLoading,
    setSimulationOutcomeNarrative, setSimulationOutcomeNarrativeSource, setSimulationOutcomeSummary,
    setTerrain3dSelectionActive, setThreatRangeVisible, setWeaponTrajectoryVisible,
    shipLayer, shipRouteLayer, shouldRunScenarioImmediatelyAfterLaunchModeSelection,
    simulationOutcomeRequestIdRef, teleportingFacilityGroupIdRef, teleportingUnitRef,
    terrain3dSelectionActive, theMap, threatPlacementLayer,
    threatRangeLayer, threatRangeVisible, toLonLat,
    toastContext, transform, unByKey,
    unitDbContext, useEffect, useRef,
    weaponLayer, weaponTrajectoryLayer, weaponTrajectoryVisible,
    ...scenarioMapRuntimeProxies,
  };
  const scenarioMapSessionControls = useScenarioMapSessionControls(scenarioMapHookContext);
  Object.assign(scenarioMapRuntime, scenarioMapSessionControls);
  const {
    buildFacilityPlacementGroupLabel, clearLiveCommentaryNotifications, clearPendingFacilityGroupTeleport,
    clearPendingFacilityPlacement, clearRecordingPlayer, clearRlCheckpointSpectatorSession,
    closeFacilityCard, dismissLiveCommentaryNotification, exitReplayMode,
    facilityPlacementDefaultsRef, findLatestReplayableCheckpoint, getCurrentFacilityIds,
    getFacilityFeaturesByIds, getPendingFacilityPlacementPreview, getPendingFacilityPlacementPreviews,
    getReplayMetricForStep, loadFacilityPlacementGroupsFromScenario, loadRecordingContent,
    parseRlCheckpointSpectatorSession, persistFacilityPlacementGroups, queueFacilityPlacementGroupForTeleport,
    registerFacilityPlacementGroup, removeFacilityPlacementGroup, selectFacilityPlacementGroup,
    setReplayState, syncLiveCommentaryNotifications, teleportFacilityPlacementGroup,
    updatePendingFacilityPlacementPreview,
  } = scenarioMapSessionControls;
  const scenarioMapInteractionControls = useScenarioMapInteractions({
    ...scenarioMapHookContext,
    ...scenarioMapSessionControls,
  });
  Object.assign(scenarioMapRuntime, scenarioMapInteractionControls);
  const {
    armFocusFireObjectiveSelection, armTerrain3dSelection, changeCursorType,
    clearDragSelection, clearFocusFireObjective, finalizeFacilityPlacement,
    getFeaturesAtPixel, getFeaturesInExtent, getMapClickContext,
    getRecommendationTargetIdAtPixel, getSelectedFeatureType, handleAddUnit,
    handleFeatureEntityStateAction, handleLoadFixedTargetStrikeReplay, handleLoadRecording,
    handleMapClick, handlePauseGameClick, handlePauseRecordingClick,
    handlePlayGameClick, handlePlayRecordingClick, handleRecordScenarioClick,
    handleSelectMultipleFeatures, handleSelectSingleFeature, handleStartScenario,
    handleStepGameClick, handleStepRecordingBackwards, handleStepRecordingForwards,
    handleStepRecordingToStep, handleStopRecordingScenarioClick, handleUndo,
    inspectDragSelectedFeature, loadAndDisplayCurrentRecordedFrame, loadFeatureEntitiesState,
    openFocusFireAirwatch, presentSimulationOutcome, resolveTerrain3dBounds,
    setAddingAirbase, setAddingAircraft, setAddingFacility,
    setAddingReferencePoint, setAddingShip, setFocusFireObjective,
    toggleFocusFireMode, toggleRecordEverySeconds, updateSelectedUnitClassName,
  } = scenarioMapInteractionControls;
  useEffect(() => {
    const nextBaseMapLayers = createScenarioBaseMapLayers(
      projection,
      mapTilerBasicUrl,
      mapTilerSatelliteJsonUrl,
      vworldHybridUrl,
      mapTilerEveningUrl,
      !offlineMapRegion,
      offlineVectorMapUrl
    );
    const preferredMode = offlineMapRegion
      ? "hybrid"
      : baseMapModeIdRef.current;
    nextBaseMapLayers.setMode(preferredMode);

    setTheMap((prevMap) => {
      prevMap.setLayers(buildMapLayerStack(nextBaseMapLayers));
      return prevMap;
    });
    setBaseMapLayers(nextBaseMapLayers);
    baseMapModeIdRef.current = nextBaseMapLayers.getCurrentModeId();
    setBaseMapModeId(nextBaseMapLayers.getCurrentModeId());
  }, [
    mapTilerBasicUrl,
    mapTilerEveningUrl,
    mapTilerSatelliteJsonUrl,
    offlineMapRegion,
    offlineVectorMapUrl,
    projection,
    vworldHybridUrl,
  ]);

  useEffect(() => {
    if (!offlineMapRegion) {
      return;
    }

    const view = theMap.getView();
    const offlineCenter = fromLonLat(
      offlineMapRegion.center,
      view.getProjection()
    );
    view.animate({
      center: offlineCenter,
      zoom: offlineMapRegion.defaultZoom,
      duration: 320,
    });
    gameRef.current.mapView.currentCameraCenter = [...offlineMapRegion.center];
    gameRef.current.mapView.currentCameraZoom = offlineMapRegion.defaultZoom;
  }, [offlineMapRegion, theMap]);

  useEffect(() => {
    if (!import.meta.env.VITE_ENV || import.meta.env.VITE_ENV === "standalone")
      return;
    if (offlineMapRegion) return;
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
            mapTilerEveningUrl,
            true
          );
          bml.setMode(baseMapModeIdRef.current);
          setTheMap((prevMap) => {
            prevMap.setLayers(buildMapLayerStack(bml));
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
  }, [
    isAuthenticated,
    getAccessTokenSilently,
    mapTilerBasicUrl,
    mapTilerEveningUrl,
    mapTilerSatelliteJsonUrl,
    offlineMapRegion,
    projection,
    vworldHybridUrl,
  ]);

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

  const scenarioMapOperationControls = useScenarioMapOperations({
    ...scenarioMapHookContext,
    ...scenarioMapSessionControls,
    ...scenarioMapInteractionControls,
  });
  Object.assign(scenarioMapRuntime, scenarioMapOperationControls);
  const {
    addAirbase, addAircraft, addAircraftToAirbase,
    addAircraftToShip, addFacility, addReferencePoint,
    addRouteMeasurementInteraction, addShip, cleanUpRouteDrawLineAndMeasurementTooltip,
    closeFeatureCard, closeMissionCreator, closeMissionEditor,
    closeSimulationLogs, createRouteMeasurementTooltip, drawNextFrame,
    finishRouteDrawLine, formatRouteLengthDisplay, getEmphasizedFacilityPlacementGroupIds,
    handleAddSide, handleAddWeaponToAircraft, handleAddWeaponToArmy,
    handleAddWeaponToFacility, handleAddWeaponToShip, handleAircraftAttack,
    handleAircraftAutoAttack, handleAircraftRtb, handleArmyAttack,
    handleArmyAutoAttack, handleCloseSideEditor, handleCreatePatrolMission,
    handleCreateStrikeMission, handleDeleteFeatureEntity, handleDeleteMission,
    handleDeleteSide, handleDeleteWeaponFromAircraft, handleDeleteWeaponFromArmy,
    handleDeleteWeaponFromFacility, handleDeleteWeaponFromShip, handleDuplicateAircraft,
    handleOpenSideEditor, handleRouteDrawEnd, handleShipAttack,
    handleShipAutoAttack, handleUpdateAircraftWeaponQuantity, handleUpdateArmyWeaponQuantity,
    handleUpdateFacilityWeaponQuantity, handleUpdatePatrolMission, handleUpdateShipWeaponQuantity,
    handleUpdateSide, handleUpdateStrikeMission, launchAircraftFromAirbase,
    launchAircraftFromShip, moveAircraft, moveArmy,
    moveShip, openMissionCreator, openMissionEditor,
    openSimulationLogs, queueAircraftForMovement, queueArmyForMovement,
    queueShipForMovement, queueUnitForTeleport, refreshAllLayers,
    refreshFacilityPlacementGroupLayer, refreshFeatureLabelLayer, refreshRouteLayer,
    refreshThreatRangeLayer, refreshWeaponTrajectoryLayer, removeAirbase,
    removeAircraft, removeAircraftFromAirbase, removeAircraftFromShip,
    removeArmy, removeFacility, removeReferencePoint,
    removeShip, removeWeapon, resetAttack,
    setGamePaused, stepGameAndDrawFrame, stepGameForStepSize,
    switchCurrentSide, teleportUnit, toggleBaseMapLayer,
    toggleFeatureLabelVisibility, toggleReferencePointVisibility, toggleRouteVisibility,
    toggleScenarioTimeCompression, toggleThreatRangeVisibility, toggleWeaponTrajectoryVisibility,
    updateAirbase, updateAircraft, updateArmy,
    updateCurrentSimulationLogsToContext, updateFacility, updateMapView,
    updateReferencePoint, updateShip,
  } = scenarioMapOperationControls;

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
  const scenarioMapViewProps = {
    Airbase, AirbaseCard, Aircraft,
    AircraftCard, Army, ArmyCard,
    BottomInfoDisplay, DragSelectionCard, DrawerHeader,
    ExperienceGuideRail, Facility, FacilityCard,
    FocusFireDockPanel, LayerVisibilityPanelToggle, LiveCommentaryNotifications,
    Main, MapContextMenu, MissionCreatorCard,
    MissionEditorCard, MultipleFeatureSelector, ReferencePointCard,
    Ship, ShipCard, SideEditor,
    SimulationLogs, SimulationOutcomeDialog, TargetFireRecommendationCard,
    Toolbar, WeaponCard, activeGuideRailAssetType,
    activeReplayMetric, addAirbase, addAircraftToAirbase,
    addAircraftToShip, addReferencePoint, armFocusFireObjectiveSelection,
    armTerrain3dSelection, assetPlacementFocusIntent, assetPlacementOpenSignal,
    baseMapLayers, baseMapModeId, clearDragSelection,
    clearFocusFireObjective, closeFacilityCard, closeMissionCreator,
    closeMissionEditor, closeSimulationLogs, createAirbaseExperienceSummary,
    createAircraftExperienceSummary, createFacilityExperienceSummary, createImmersiveExperienceDemoAsset,
    createShipExperienceSummary, createWeaponExperienceSummary, currentScenarioTimeCompression,
    currentSideId, dismissLiveCommentaryNotification, dragSelectedFacilityPlacementGroup,
    dragSelectedFeatures, dragSelectedTargetPriorities, drawerOpen,
    exitReplayMode, featureEntitiesState, featureLabelVisible,
    finishRouteDrawLine, focusFireDockOpen, game,
    guideRailSelectionLabels, guideRailVisible, handleAddSide,
    handleAddUnit, handleAddWeaponToAircraft, handleAddWeaponToArmy,
    handleAddWeaponToFacility, handleAddWeaponToShip, handleAircraftAttack,
    handleAircraftAutoAttack, handleAircraftRtb, handleArmyAttack,
    handleArmyAutoAttack, handleCloseSideEditor, handleCreatePatrolMission,
    handleCreateStrikeMission, handleDeleteFeatureEntity, handleDeleteMission,
    handleDeleteSide, handleDeleteWeaponFromAircraft, handleDeleteWeaponFromArmy,
    handleDeleteWeaponFromFacility, handleDeleteWeaponFromShip, handleDrawerClose,
    handleDrawerOpen, handleDuplicateAircraft, handleGuideRailActiveAssetTypeChange,
    handleGuideRailAlertAction, handleGuideRailAssetMixAction, handleGuideRailSelectionsChange,
    handleLoadFixedTargetStrikeReplay, handleLoadRecording, handleOpenSideEditor,
    handlePauseGameClick, handlePauseRecordingClick, handlePlayGameClick,
    handlePlayRecordingClick, handleRecordScenarioClick, handleSelectSingleFeature,
    handleShipAttack, handleShipAutoAttack, handleStartAssetPlacement,
    handleStartScenario, handleStepGameClick, handleStepRecordingBackwards,
    handleStepRecordingForwards, handleStepRecordingToStep, handleStopRecordingScenarioClick,
    handleUndo, handleUpdateAircraftWeaponQuantity, handleUpdateArmyWeaponQuantity,
    handleUpdateFacilityWeaponQuantity, handleUpdatePatrolMission, handleUpdateShipWeaponQuantity,
    handleUpdateSide, handleUpdateStrikeMission, inspectDragSelectedFeature,
    isGameOver, keyboardShortcutsEnabled, launchAircraftFromAirbase,
    launchAircraftFromShip, liveCommentaryNotifications, loadFeatureEntitiesState,
    mapRef, missionCreatorActive, missionCreatorInitialMissionType,
    missionCreatorInitialTargetIds, missionEditorActive, mobileView,
    openAirCombatOverlay, openAirbaseCard, openAircraftCard,
    openArmyCard, openAssetExperiencePage, openFacilityCard,
    openFlightSimPage, openFocusFireAirwatch, openImmersiveExperiencePage,
    openMapContextMenu, openMissionCreator, openMissionEditor,
    openMultipleFeatureSelector, openReferencePointCard, openRlLabPage,
    openShipCard, openSideEditor, openSimulationLogs,
    openTargetFireRecommendation, openWeaponCard, queueAircraftForMovement,
    queueArmyForMovement, queueFacilityPlacementGroupForTeleport, queueShipForMovement,
    queueUnitForTeleport, referencePointVisible, refreshAllLayers,
    removeAirbase, removeAircraft, removeAircraftFromAirbase,
    removeAircraftFromShip, removeArmy, removeFacility,
    removeFacilityPlacementGroup, removeReferencePoint, removeShip,
    removeWeapon, rightOverlayOffset, routeVisible,
    selectFacilityPlacementGroup, selectedAirbase, selectedAircraft,
    selectedAircraftMission, selectedArmy, selectedCombatant,
    selectedDragRecommendationTargetId, selectedFacility, selectedFacilityPlacementGroup,
    selectedReferencePoint, selectedShip, selectedWeapon,
    setAddingAircraft, setAddingFacility, setAddingReferencePoint,
    setAddingShip, setCurrentScenarioSidesToContext, setCurrentScenarioTimeCompression,
    setCurrentScenarioTimeToContext, setFocusFireDockOpen, setIsGameOver,
    setKeyboardShortcutsEnabled, setOpenAirbaseCard, setOpenAircraftCard,
    setOpenArmyCard, setOpenMapContextMenu, setOpenMultipleFeatureSelector,
    setOpenReferencePointCard, setOpenShipCard, setOpenTargetFireRecommendation,
    setOpenWeaponCard, setSelectedDragRecommendationTargetId, setTerrain3dSelectionActive,
    simulationLogsActive, simulationOutcomeLoading, simulationOutcomeNarrative,
    simulationOutcomeNarrativeSource, simulationOutcomeSummary, switchCurrentSide,
    terrain3dSelectionActive, threatRangeVisible, toastContext,
    toggleBaseMapLayer, toggleFeatureLabelVisibility, toggleFocusFireMode,
    toggleRecordEverySeconds, toggleReferencePointVisibility, toggleRouteVisibility,
    toggleScenarioTimeCompression, toggleThreatRangeVisibility, toggleWeaponTrajectoryVisibility,
    updateAirbase, updateAircraft, updateArmy,
    updateCurrentSimulationLogsToContext, updateFacility, updateMapView,
    updateReferencePoint, updateShip, weaponTrajectoryVisible,
  };

  return <ScenarioMapView {...scenarioMapViewProps} />;
}
