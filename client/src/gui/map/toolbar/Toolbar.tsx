import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppBar,
  Button,
  CardActions,
  Dialog,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Menu } from "@/gui/shared/ui/MuiComponents";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Game from "@/game/Game";
import { APP_DISPLAY_NAME, APP_DRAWER_WIDTH } from "@/utils/constants";
import ToolbarCollapsible from "@/gui/map/toolbar/ToolbarCollapsible";
import MenuIcon from "@mui/icons-material/Menu";
import { Toolbar as MapToolbar } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import EraserIcon from "@/gui/assets/img/eraser-icon.png";
import GodModeIcon from "@mui/icons-material/Preview";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ClearIcon from "@mui/icons-material/Clear";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Container } from "@mui/system";
import {
  Cloud,
  Delete,
  Message,
  Pause,
  PlayArrow,
  Save,
  Storage,
  Undo,
} from "@mui/icons-material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import AirlineStopsOutlinedIcon from "@mui/icons-material/AirlineStopsOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import {
  formatSecondsToString,
  getLocalDateTime,
} from "@/utils/dateTimeFunctions";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@/gui/shared/ui/TextField";
import { ToastContext } from "@/gui/contextProviders/contexts/ToastContext";
import EntityIcon from "@/gui/map/toolbar/EntityIcon";
import { FeatureEntityState } from "@/gui/map/mapLayers/FeatureLayers";
import RecordingPlayer from "@/gui/map/toolbar/RecordingPlayer";
import blankScenarioJson from "@/scenarios/blank_scenario.json";
import defaultScenarioJson from "@/scenarios/default_scenario.json";
import armyDemoScenarioJson from "@/scenarios/army_demo_1.json";
import focusedTrainingDemoJson from "@/scenarios/focused_training_demo.json";
import focusFireEconomyDemo from "@/scenarios/focusFireEconomyDemo";
import rlFirstSuccessDemoJson from "@/scenarios/rl_first_success_demo.json";
import rlBattleOptimizationDemoJson from "@/scenarios/rl_battle_optimization_demo.json";
import {
  findStrategicScenarioPreset,
  strategicScenarioPresets,
} from "@/scenarios/iranVsUsScenarios";
import SideSelect from "@/gui/map/toolbar/SideSelect";
import {
  COLOR_PALETTE,
  DEFAULT_ICON_COLOR_FILTER,
  SELECTED_ICON_COLOR_FILTER,
  SIDE_COLOR,
} from "@/utils/colors";
import { useAuth0 } from "@auth0/auth0-react";
import LoginLogout from "@/gui/map/toolbar/LoginLogout";
import { randomUUID } from "@/utils/generateUUID";
import {
  SetUnitDbContext,
  UnitDbContext,
} from "@/gui/contextProviders/contexts/UnitDbContext";
import { useChatbot } from "@/gui/agent/chatbot";
import { buildFocusFireInsight } from "@/gui/analysis/operationInsight";
import { resolveFocusFireDockStage } from "@/gui/fires/focusFireDockState";
import { isScenarioEmptyForOnboarding } from "@/gui/map/scenarioOnboarding";
import { getDisplayName, getEntityTypeLabel } from "@/utils/koreanCatalog";
import { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import {
  isDroneAircraftClassName,
  isTankFacilityClassName,
  ToolbarEntityType,
} from "@/utils/assetTypeCatalog";
import Dba from "@/game/db/Dba";
import AssetPlacementPreviewDialog from "@/gui/map/toolbar/AssetPlacementPreviewDialog";
import ArmyGptPanel, {
  type ArmyGptBriefingCard,
} from "@/gui/map/toolbar/ArmyGptPanel";
import {
  type AssetPlacementDeploymentDefaults,
  buildAssetPlacementPreview,
  type AssetPlacementPreview,
  type AssetPlacementPresetContext,
} from "@/gui/map/toolbar/assetPlacementPreview";
import {
  buildBaseSelectionAirbaseOptions,
  buildPriorityQuickAddAirbaseOptions,
  PRIORITY_ARTILLERY_BASE_OPTIONS,
  sortBaseSelectionOptionsByDistance,
} from "@/gui/map/toolbar/baseSelectionCatalog";
import { buildAdaptiveArtilleryPresetOptions } from "@/gui/map/toolbar/artilleryPresetRecommendations";
import type {
  GuideRailAssetMixId,
  GuideRailAssetSelectionLabels,
  GuideRailPlacementFocusIntent,
} from "@/gui/map/guideRailIntents";
import {
  shouldPromptScenarioLaunchModeSelection,
  type ScenarioLaunchMode,
} from "@/gui/map/scenarioLaunchMode";

const GUIDE_RAIL_SELECTION_STORAGE_KEYS = {
  mannedAircraft: "firescope.guideRail.selection.mannedAircraft",
  drone: "firescope.guideRail.selection.drone",
  airbase: "firescope.guideRail.selection.airbase",
  facility: "firescope.guideRail.selection.facility",
  armor: "firescope.guideRail.selection.armor",
  ship: "firescope.guideRail.selection.ship",
} as const;

function readGuideRailSelection(key: string, fallbackValue: string) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  return window.sessionStorage.getItem(key) ?? fallbackValue;
}

function writeGuideRailSelection(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(key, value);
}

interface ToolBarProps {
  mobileView: boolean;
  drawerOpen: boolean;
  featureEntitiesPlotted: FeatureEntityState[];
  deleteFeatureEntity: (feature: FeatureEntityState) => void;
  addAircraftOnClick: (unitClassName: string) => void;
  addFacilityOnClick: (
    unitClassName: string,
    deploymentDefaults?: AssetPlacementDeploymentDefaults
  ) => void;
  addAirbaseOnClick: (
    coordinates: number[],
    name?: string,
    realCoordinates?: number[]
  ) => void;
  addShipOnClick: (unitClassName: string) => void;
  addReferencePointOnClick: () => void;
  playOnClick: () => void;
  startScenarioOnClick: (mode: ScenarioLaunchMode) => void;
  stepOnClick: () => void;
  pauseOnClick: () => void;
  toggleScenarioTimeCompressionOnClick: () => void;
  toggleRecordEverySeconds: () => void;
  recordScenarioOnClick: () => void;
  stopRecordingScenarioOnClick: () => void;
  loadRecordingOnClick: () => void;
  loadFixedTargetStrikeReplayOnClick: () => void;
  exitReplayModeOnClick: () => void;
  handlePlayRecordingClick: () => void;
  handlePauseRecordingClick: () => void;
  handleStepRecordingToStep: (step: number) => void;
  handleStepRecordingBackwards: () => void;
  handleStepRecordingForwards: () => void;
  handleUndo: () => void;
  switchCurrentSideOnClick: (sideId: string) => void;
  refreshAllLayers: () => void;
  updateMapView: (center: number[], zoom: number) => void;
  loadFeatureEntitiesState: () => void;
  updateScenarioTimeCompression: (scenarioTimeCompression: number) => void;
  updateCurrentScenarioTimeToContext: () => void;
  scenarioTimeCompression: number;
  scenarioCurrentSideId: string;
  game: Game;
  featureLabelVisibility: boolean;
  toggleFeatureLabelVisibility: (featureLabelVisibility: boolean) => void;
  threatRangeVisibility: boolean;
  toggleThreatRangeVisibility: (threatRangeVisibility: boolean) => void;
  routeVisibility: boolean;
  toggleRouteVisibility: (routeVisibility: boolean) => void;
  toggleBaseMapLayer: () => void;
  keyboardShortcutsEnabled: boolean;
  finishRouteDrawLine: () => void;
  toggleMissionCreator: () => void;
  openMissionEditor: (selectedMissionId: string) => void;
  handleOpenSideEditor: (sideId: string | null) => void;
  openSimulationLogs: () => void;
  updateCurrentSimulationLogsToContext: () => void;
  updateCurrentScenarioSidesToContext: () => void;
  assetPlacementOpenSignal: number;
  assetPlacementFocusIntent: GuideRailPlacementFocusIntent;
  onGuideRailSelectionsChange: (labels: GuideRailAssetSelectionLabels) => void;
  onGuideRailActiveAssetTypeChange: (assetType: GuideRailAssetMixId) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openRlLabPage: () => void;
  openFlightSimPage: (craft?: string) => void;
  openImmersiveExperiencePage: (profile: ImmersiveExperienceProfile) => void;
  toggleFocusFireMode: () => void;
  armFocusFireObjectiveSelection: () => void;
  clearFocusFireObjective: () => void;
  openScenario3dView: () => void;
  openFocusFireAirwatch: () => void;
  openFocusFireDock: () => void;
}

const scenarioNameRegex: RegExp = /^[a-zA-Z0-9가-힣 :-]{1,25}$/;

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
  marginTop: "-12px",
}));

const toolbarDrawerStyle = {
  width: APP_DRAWER_WIDTH,
  flexShrink: 0,
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  height: "100dvh",
  display: "flex",
  justifyContent: "flex-end",
  pointerEvents: "none",
  zIndex: 1190,
  "& .MuiDrawer-paper": {
    width: APP_DRAWER_WIDTH,
    height: "100dvh",
    boxSizing: "border-box",
    overflow: "hidden",
    boxShadow: "-18px 0 36px rgba(0, 0, 0, 0.42)",
    pointerEvents: "auto",
  },
};

const toolbarStyle = {
  backgroundColor: "rgba(6, 22, 29, 0.72)",
  backdropFilter: "blur(18px)",
  borderBottom: "1px solid",
  borderBottomColor: "rgba(45, 214, 196, 0.18)",
  boxShadow: "0 14px 28px rgba(0, 0, 0, 0.22)",
};

interface CloudScenario {
  scenarioId: string;
  name: string;
  scenarioString: string;
}

interface QuickAddEntry {
  key: string;
  label: string;
  entityType: ToolbarEntityType;
  unitType?: "aircraft" | "airbase" | "facility" | "ship";
  value?: string;
  displayName?: string;
  focusCenter?: [number, number];
  focusZoom?: number;
  previewBadgeLabel?: string;
  previewTitle?: string;
  previewDescription?: string;
  presetContext?: AssetPlacementPresetContext;
  deploymentDefaults?: AssetPlacementDeploymentDefaults;
  description: string;
  onClick?: () => void;
}

interface QuickAddSection {
  title: string;
  items: QuickAddEntry[];
}

interface AssetSelectionOptions {
  selectionKey?: string;
  displayName?: string;
  focusCenter?: [number, number];
  focusZoom?: number;
  previewBadgeLabel?: string;
  previewTitle?: string;
  previewDescription?: string;
  presetContext?: AssetPlacementPresetContext;
  deploymentDefaults?: AssetPlacementDeploymentDefaults;
}

function buildSafeDownloadTimestamp() {
  return getLocalDateTime().replace(/[:.]/g, "-");
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const dataStr =
    `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function toSelectionOptions(item: QuickAddEntry): AssetSelectionOptions {
  return {
    selectionKey:
      item.unitType === "airbase" || item.focusCenter || item.presetContext
        ? item.key
        : undefined,
    displayName: item.displayName,
    focusCenter: item.focusCenter,
    focusZoom: item.focusZoom,
    previewBadgeLabel: item.previewBadgeLabel,
    previewTitle: item.previewTitle,
    previewDescription: item.previewDescription,
    presetContext: item.presetContext,
    deploymentDefaults: item.deploymentDefaults,
  };
}

export default function Toolbar(props: Readonly<ToolBarProps>) {
  // Hooks and State
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const toastContext = useContext(ToastContext);
  const compactToolbar = useMediaQuery("(max-width:1280px)");
  const ultraCompactToolbar = useMediaQuery("(max-width:960px)");
  const showEntityShortcutStrip = !props.mobileView && !compactToolbar;
  const showSideSelect = !ultraCompactToolbar;
  const showExperienceShortcut = !ultraCompactToolbar;
  const [cloudScenarios, setCloudScenarios] = useState<CloudScenario[]>([]);
  const getCloudScenarios = useCallback(async () => {
    if (!import.meta.env.VITE_ENV || import.meta.env.VITE_ENV === "standalone")
      return;
    if (!isAuthenticated) return;
    const accessToken = await getAccessTokenSilently();
    const resp = await fetch(
      `${import.meta.env.VITE_API_SERVER_URL}/api/v1/scenarios`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (resp.ok) {
      const rawCloudScenarios: CloudScenario[] = await resp.json();
      setCloudScenarios(rawCloudScenarios);
    } else {
      toastContext?.addToast(
        "클라우드 시나리오를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        "error"
      );
    }
  }, [getAccessTokenSilently, isAuthenticated, toastContext]);
  useEffect(() => {
    if (!isAuthenticated) return;
    getCloudScenarios();
  }, [getCloudScenarios, isAuthenticated]);
  const unitDbContext = useContext(UnitDbContext);
  const setUnitDbContext = useContext(SetUnitDbContext);
  const aircraftDb = unitDbContext.getAircraftDb();
  const airbaseDb = unitDbContext.getAirbaseDb();
  const facilityDb = unitDbContext.getFacilityDb();
  const shipDb = unitDbContext.getShipDb();
  const droneAircraftDb = aircraftDb.filter((aircraft) =>
    isDroneAircraftClassName(aircraft.className)
  );
  const mannedAircraftDb = aircraftDb.filter(
    (aircraft) => !isDroneAircraftClassName(aircraft.className)
  );
  const tankFacilityDb = facilityDb.filter((facility) =>
    isTankFacilityClassName(facility.className)
  );
  const supportFacilityDb = facilityDb.filter(
    (facility) => !isTankFacilityClassName(facility.className)
  );
  const [selectedSideId, setSelectedSideId] = useState<string>(
    props.scenarioCurrentSideId
  );
  const [initialScenarioString, setInitialScenarioString] = useState<string>(
    props.game.exportCurrentScenario()
  );
  const [currentScenarioString, setCurrentScenarioString] = useState<
    string | null
  >(null);
  const [scenarioName, setScenarioName] = useState<string>(
    props.game.currentScenario.name ?? "새 시나리오"
  );
  const [scenarioNameError, setScenarioNameError] = useState<boolean>(false);
  const [scenarioPaused, setScenarioPaused] = useState<boolean>(
    props.game.scenarioPaused
  );
  const [scenarioLaunchDialogOpen, setScenarioLaunchDialogOpen] =
    useState<boolean>(false);
  const [recordingScenario, setRecordingScenario] = useState<boolean>(
    props.game.recordingScenario
  );
  const [entityFilterSelectedOptions, setEntityFilterSelectedOptions] =
    useState<string[]>([
      ...(props.game.godMode
        ? props.game.currentScenario.sides.map((side) => side.id)
        : [props.scenarioCurrentSideId]),
      "aircraft",
      "airbase",
      "army",
      "ship",
      "facility",
      "referencePoint",
    ]);
  const [scenarioEditNameAnchorEl, setScenarioEditNameAnchorEl] =
    useState<null | HTMLElement>(null);

  // AI agent
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);

  // Component Logic
  // AI agent
  const { messages, inputValue, setInputValue, handleSendMessage, isLoading } =
    useChatbot({ game: props.game });
  const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);
  const processedGuideRailPlacementSignalRef = useRef(0);

  useEffect(() => {
    const container = chatMessagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleOpenScenarioEditNameMenu = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setScenarioEditNameAnchorEl(event.currentTarget);
  };

  const handleCloseScenarioEditNameMenu = () => {
    setScenarioEditNameAnchorEl(null);
    setScenarioName(props.game.currentScenario.name);
  };

  const handleScenarioNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.trim();
    if (scenarioNameError) {
      if (scenarioNameRegex.test(value)) {
        setScenarioNameError(false);
      }
    }
    setScenarioName(value);
  };

  const handleScenarioNameSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!scenarioNameRegex.test(scenarioName)) {
      setScenarioNameError(true);
      return;
    }
    setScenarioNameError(false);
    props.game.currentScenario.updateScenarioName(scenarioName);
    handleCloseScenarioEditNameMenu();
    toastContext?.addToast("시나리오 이름을 변경했습니다.", "success");
  };

  const handleDeleteFeatureEntity = (
    event: React.MouseEvent<HTMLButtonElement>,
    feature: FeatureEntityState
  ) => {
    event.stopPropagation();
    props.deleteFeatureEntity(feature);
  };

  const [loadScenarioAnchorEl, setLoadScenarioAnchorEl] =
    useState<null | HTMLElement>(null);
  const presetScenarioSelectionMenuOpen = Boolean(loadScenarioAnchorEl);
  const handleLoadScenarioIconClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setLoadScenarioAnchorEl(event.currentTarget);
  };
  const handleLoadScenarioIconClose = () => {
    setLoadScenarioAnchorEl(null);
  };

  const canOpenPlacementMenu = (assetLabel: string) => {
    if (
      !props.game.currentSideId ||
      props.game.currentScenario.sides.length === 0
    ) {
      toastContext?.addToast(
        `${assetLabel}을(를) 추가하려면 먼저 세력을 선택하세요.`,
        "error"
      );
      return false;
    }

    return true;
  };

  const [selectedMannedAircraftUnitClass, setSelectedMannedAircraftUnitClass] =
    useState<string>(() =>
      readGuideRailSelection(
        GUIDE_RAIL_SELECTION_STORAGE_KEYS.mannedAircraft,
        mannedAircraftDb[0]?.className ?? ""
      )
    );
  const [selectedDroneUnitClass, setSelectedDroneUnitClass] = useState<string>(
    () =>
      readGuideRailSelection(
        GUIDE_RAIL_SELECTION_STORAGE_KEYS.drone,
        droneAircraftDb[0]?.className ?? ""
      )
  );
  const [selectedAircraftUnitClass, setSelectedAircraftUnitClass] =
    useState<string>(
      () => selectedMannedAircraftUnitClass || selectedDroneUnitClass || ""
    );
  const [aircraftIconAnchorEl, setAircraftIconAnchorEl] =
    useState<null | HTMLElement>(null);
  const aircraftClassMenuOpen = Boolean(aircraftIconAnchorEl);
  const handleAircraftIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!canOpenPlacementMenu("항공기")) {
      return;
    }
    setAircraftIconAnchorEl(event.currentTarget);
  };
  const handleAircraftIconClose = () => {
    setAircraftIconAnchorEl(null);
  };

  const [droneIconAnchorEl, setDroneIconAnchorEl] =
    useState<null | HTMLElement>(null);
  const droneClassMenuOpen = Boolean(droneIconAnchorEl);
  const handleDroneIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!canOpenPlacementMenu("드론")) {
      return;
    }
    if (droneAircraftDb.length === 0) {
      toastContext?.addToast(
        "등록된 드론 자산이 없습니다. 유닛 자료를 불러오거나 항공 DB를 확인하세요.",
        "warning"
      );
      return;
    }
    setDroneIconAnchorEl(event.currentTarget);
  };
  const handleDroneIconClose = () => {
    setDroneIconAnchorEl(null);
  };

  const [selectedAirbaseUnitClass, setSelectedAirbaseUnitClass] =
    useState<string>(() =>
      readGuideRailSelection(
        GUIDE_RAIL_SELECTION_STORAGE_KEYS.airbase,
        airbaseDb[0]?.name ?? ""
      )
    );
  const [selectedBaseSelectionKey, setSelectedBaseSelectionKey] =
    useState<string>("");
  const [airbaseIconAnchorEl, setAirbaseIconAnchorEl] =
    useState<null | HTMLElement>(null);
  const airbaseClassMenuOpen = Boolean(airbaseIconAnchorEl);
  const handleAirbaseIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!canOpenPlacementMenu("기지")) {
      return;
    }
    setAirbaseIconAnchorEl(event.currentTarget);
  };
  const handleAirbaseClose = () => {
    setAirbaseIconAnchorEl(null);
  };

  const [
    selectedSupportFacilityUnitClass,
    setSelectedSupportFacilityUnitClass,
  ] = useState<string>(() =>
    readGuideRailSelection(
      GUIDE_RAIL_SELECTION_STORAGE_KEYS.facility,
      supportFacilityDb[0]?.className ?? ""
    )
  );
  const [selectedArmorUnitClass, setSelectedArmorUnitClass] = useState<string>(
    () =>
      readGuideRailSelection(
        GUIDE_RAIL_SELECTION_STORAGE_KEYS.armor,
        tankFacilityDb[0]?.className ?? ""
      )
  );
  const [selectedSamUnitClass, setSelectedSamUnitClass] = useState<string>(
    () => selectedSupportFacilityUnitClass || selectedArmorUnitClass || ""
  );
  const [samIconAnchorEl, setSamIconAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const samClassMenuOpen = Boolean(samIconAnchorEl);
  const handleSamIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!canOpenPlacementMenu("지상 무기체계")) {
      return;
    }
    setSamIconAnchorEl(event.currentTarget);
  };
  const handleSamIconClose = () => {
    setSamIconAnchorEl(null);
  };

  const [tankIconAnchorEl, setTankIconAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const tankClassMenuOpen = Boolean(tankIconAnchorEl);
  const handleTankIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!canOpenPlacementMenu("전차/장갑차")) {
      return;
    }
    if (tankFacilityDb.length === 0) {
      toastContext?.addToast(
        "등록된 전차/장갑차 자산이 없습니다. 유닛 자료를 불러오거나 지상 DB를 확인하세요.",
        "warning"
      );
      return;
    }
    setTankIconAnchorEl(event.currentTarget);
  };
  const handleTankIconClose = () => {
    setTankIconAnchorEl(null);
  };

  const [selectedShipUnitClass, setSelectedShipUnitClass] = useState<string>(
    () =>
      readGuideRailSelection(
        GUIDE_RAIL_SELECTION_STORAGE_KEYS.ship,
        shipDb[0]?.className ?? ""
      )
  );
  const [assetPlacementPreview, setAssetPlacementPreview] =
    useState<AssetPlacementPreview | null>(null);
  const [shipIconAnchorEl, setShipIconAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const shipClassMenuOpen = Boolean(shipIconAnchorEl);
  const handleShipIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!canOpenPlacementMenu("함정")) {
      return;
    }
    setShipIconAnchorEl(event.currentTarget);
  };
  const handleShipIconClose = () => {
    setShipIconAnchorEl(null);
  };

  const guideRailSelectionLabels = useMemo<GuideRailAssetSelectionLabels>(
    () => ({
      "manned-aircraft": selectedMannedAircraftUnitClass
        ? getDisplayName(selectedMannedAircraftUnitClass)
        : "",
      drone: selectedDroneUnitClass
        ? getDisplayName(selectedDroneUnitClass)
        : "",
      airbase: selectedAirbaseUnitClass,
      facility: selectedSupportFacilityUnitClass
        ? getDisplayName(selectedSupportFacilityUnitClass)
        : "",
      armor: selectedArmorUnitClass
        ? getDisplayName(selectedArmorUnitClass)
        : "",
      ship: selectedShipUnitClass ? getDisplayName(selectedShipUnitClass) : "",
    }),
    [
      selectedAirbaseUnitClass,
      selectedArmorUnitClass,
      selectedDroneUnitClass,
      selectedMannedAircraftUnitClass,
      selectedShipUnitClass,
      selectedSupportFacilityUnitClass,
    ]
  );

  useEffect(() => {
    props.onGuideRailSelectionsChange(guideRailSelectionLabels);
  }, [guideRailSelectionLabels, props.onGuideRailSelectionsChange]);

  const handleReferencePointIconClick = () => {
    if (!canOpenPlacementMenu("참조점")) {
      return;
    }
    props.addReferencePointOnClick();
  };

  const [unitDbToolsIconAnchorEl, setUnitDbToolsIconAnchorEl] =
    useState<null | HTMLElement>(null);
  const unitDbToolsMenuOpen = Boolean(unitDbToolsIconAnchorEl);
  const handleUnitDbToolsIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setUnitDbToolsIconAnchorEl(event.currentTarget);
  };
  const handleUnitDbToolsIconClose = () => {
    setUnitDbToolsIconAnchorEl(null);
  };

  const [quickAddAnchorEl, setQuickAddAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const quickAddMenuOpen = Boolean(quickAddAnchorEl);
  const handleQuickAddMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setQuickAddAnchorEl((prevAnchorEl) =>
      prevAnchorEl ? null : event.currentTarget
    );
  };
  const handleQuickAddMenuClose = () => {
    setQuickAddAnchorEl(null);
  };

  const [experienceAnchorEl, setExperienceAnchorEl] =
    useState<null | HTMLElement>(null);
  const experienceMenuOpen = Boolean(experienceAnchorEl);
  const handleExperienceMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setExperienceAnchorEl((prevAnchorEl) =>
      prevAnchorEl ? null : event.currentTarget
    );
  };
  const handleExperienceMenuClose = () => {
    setExperienceAnchorEl(null);
  };

  const handleSideChange = (newSelectedSideId: string) => {
    if (newSelectedSideId != null && newSelectedSideId !== "add-side") {
      props.switchCurrentSideOnClick(newSelectedSideId);
    }
  };

  const handleEntitySideChange = useCallback((newSelectedSides: string[]) => {
    setEntityFilterSelectedOptions((prevItems: string[]) => {
      const nonSideFilters = [
        "aircraft",
        "airbase",
        "army",
        "ship",
        "facility",
        "referencePoint",
      ];
      const filtersWithNewSide = prevItems.filter((item) =>
        nonSideFilters.includes(item)
      );
      return [...filtersWithNewSide, ...newSelectedSides];
    });
  }, []);

  useEffect(() => {
    setSelectedSideId(props.scenarioCurrentSideId);
    handleEntitySideChange(
      props.game.godMode
        ? props.game.currentScenario.sides.map((side) => side.id)
        : [props.scenarioCurrentSideId]
    );
  }, [
    handleEntitySideChange,
    props.game.currentScenario.sides,
    props.game.godMode,
    props.scenarioCurrentSideId,
  ]);

  const saveScenarioToCloud = async () => {
    if (!import.meta.env.VITE_ENV || import.meta.env.VITE_ENV === "standalone")
      return;
    if (!isAuthenticated) return;
    if (cloudScenarios.length >= 5) return;
    const exportObject = props.game.exportCurrentScenario();
    const accessToken = await getAccessTokenSilently();
    const resp = await fetch(
      `${import.meta.env.VITE_API_SERVER_URL}/api/v1/scenarios`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: exportObject,
      }
    );
    if (!resp.ok) {
      toastContext?.addToast(
        "시나리오를 클라우드에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        "error"
      );
    } else {
      const rawCloudScenarios: CloudScenario[] = await resp.json();
      setCloudScenarios(rawCloudScenarios);
      toastContext?.addToast("시나리오를 클라우드에 저장했습니다.", "success");
    }
  };

  const deleteScenarioFromCloud = async (scenarioId: string) => {
    if (!import.meta.env.VITE_ENV || import.meta.env.VITE_ENV === "standalone")
      return;
    if (!isAuthenticated) return;
    const accessToken = await getAccessTokenSilently();
    const resp = await fetch(
      `${import.meta.env.VITE_API_SERVER_URL}/api/v1/scenarios/${scenarioId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (resp.ok) {
      const updatedCloudScenarios = cloudScenarios.filter(
        (scenario) => scenario.scenarioId !== scenarioId
      );
      setCloudScenarios(updatedCloudScenarios);
      toastContext?.addToast("시나리오를 삭제했습니다.", "success");
    } else {
      toastContext?.addToast(
        "시나리오를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        "error"
      );
    }
  };

  const exportScenario = () => {
    if (isAuthenticated || import.meta.env.VITE_ENV !== "production") {
      props.pauseOnClick();
      const exportObject = props.game.exportCurrentScenario();
      const [localDateString, time] = getLocalDateTime().split("T");
      const timestamp = `${localDateString.replace(/-/g, "_")}_T${time}`;
      const currentScenarioName = !scenarioName
        ? "firescope_scenario"
        : scenarioName.trim().replace(/\s+/g, "_").toLowerCase();
      const exportName = currentScenarioName + "_" + timestamp;
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(exportObject);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const newScenario = () => {
    loadPresetScenario("blank_scenario");
  };

  const loadCloudScenario = (scenarioId: string) => {
    const scenario = cloudScenarios.find(
      (scenario) => scenario.scenarioId === scenarioId
    );
    if (scenario) {
      props.pauseOnClick();
      setScenarioPaused(true);
      loadScenario(scenario.scenarioString);
      setCurrentScenarioString(scenario.scenarioString);
      toastContext?.addToast("시나리오를 불러왔습니다.", "success");
    } else {
      toastContext?.addToast(
        "시나리오를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.",
        "error"
      );
    }
  };

  const loadPresetScenario = (presetScenarioName: string) => {
    let scenarioJson: object | null = null;
    const strategicPreset = findStrategicScenarioPreset(presetScenarioName);
    switch (presetScenarioName) {
      case "blank_scenario":
        scenarioJson = blankScenarioJson;
        handleLoadScenarioIconClose();
        break;
      case "default_scenario":
        scenarioJson = defaultScenarioJson;
        handleLoadScenarioIconClose();
        break;
      case "army_demo":
        scenarioJson = armyDemoScenarioJson;
        handleLoadScenarioIconClose();
        break;
      case "focused_training_demo":
        scenarioJson = focusedTrainingDemoJson;
        handleLoadScenarioIconClose();
        break;
      case "focus_fire_economy_demo":
        scenarioJson = focusFireEconomyDemo;
        handleLoadScenarioIconClose();
        break;
      case "rl_first_success_demo":
        scenarioJson = rlFirstSuccessDemoJson;
        handleLoadScenarioIconClose();
        break;
      case "rl_battle_optimization_demo":
        scenarioJson = rlBattleOptimizationDemoJson;
        handleLoadScenarioIconClose();
        break;
      case "_upload":
        handleLoadScenarioIconClose();
        uploadScenario();
        return;
      default:
        if (strategicPreset) {
          scenarioJson = strategicPreset.scenario;
          handleLoadScenarioIconClose();
        }
        break;
    }
    if (scenarioJson !== null) {
      try {
        props.pauseOnClick();
        setScenarioPaused(true);
        const scenarioJsonWithNewId = JSON.parse(JSON.stringify(scenarioJson));
        if (
          presetScenarioName === "blank_scenario" ||
          presetScenarioName === "SCS" ||
          presetScenarioName === "default_scenario" ||
          presetScenarioName === "rl_first_success_demo" ||
          presetScenarioName === "rl_battle_optimization_demo" ||
          presetScenarioName === "focused_training_demo" ||
          presetScenarioName === "focus_fire_economy_demo" ||
          strategicPreset?.regenerateScenarioId
        ) {
          if (scenarioJsonWithNewId.currentScenario?.id) {
            scenarioJsonWithNewId.currentScenario.id = randomUUID();
          }
        }
        const scenarioString = JSON.stringify(scenarioJsonWithNewId);
        loadScenario(scenarioString);
        setCurrentScenarioString(scenarioString);
        toastContext?.addToast("시나리오를 불러왔습니다.", "success");
      } catch (error) {
        toastContext?.addToast(
          "시나리오를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.",
          "error"
        );
      }
    }
  };

  const loadScenario = (
    scenarioJson: string,
    updateScenarioName: boolean = true
  ) => {
    props.exitReplayModeOnClick();
    props.game.loadScenario(scenarioJson);
    props.updateMapView(
      props.game.mapView.currentCameraCenter,
      props.game.mapView.currentCameraZoom
    );
    props.updateScenarioTimeCompression(
      props.game.currentScenario.timeCompression
    );
    handleSideChange(props.game.currentSideId);
    if (updateScenarioName) {
      props.game.currentScenario.updateScenarioName(
        props.game.currentScenario.name
      );
      setScenarioName(props.game.currentScenario.name);
    }
    props.refreshAllLayers();
    props.updateCurrentScenarioTimeToContext();
    props.updateCurrentSimulationLogsToContext();
    props.updateCurrentScenarioSidesToContext();
    props.loadFeatureEntitiesState();
  };

  const uploadScenario = () => {
    props.pauseOnClick();
    setScenarioPaused(true);
    const input = document.createElement("input");
    input.style.display = "none";
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      input.remove();
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (readerEvent) => {
          const scenarioString = readerEvent.target?.result as string;
          loadScenario(scenarioString);
          setCurrentScenarioString(scenarioString);
          toastContext?.addToast("시나리오 파일을 업로드했습니다.", "success");
        };
        reader.onerror = () => {
          reader.abort();
          toastContext?.addToast(
            "시나리오 파일 업로드에 실패했습니다. 새로고침 후 다시 시도해 주세요.",
            "error"
          );
        };
      }
    };
    input.click();
  };

  const reloadScenario = () => {
    props.pauseOnClick();
    setScenarioPaused(true);
    setScenarioLaunchDialogOpen(false);
    if (currentScenarioString) {
      try {
        loadScenario(currentScenarioString, false);
        props.game.currentScenario.updateScenarioName(scenarioName);
        setScenarioName(props.game.currentScenario.name);
      } catch {
        toastContext?.addToast(
          "시나리오를 다시 시작하지 못했습니다. 새로고침 후 다시 시도해 주세요.",
          "error"
        );
      }
    } else {
      loadScenario(initialScenarioString, false);
      props.game.currentScenario.updateScenarioName(scenarioName);
      setScenarioName(props.game.currentScenario.name);
    }
  };

  const startScenarioIn2dMode = () => {
    setScenarioLaunchDialogOpen(false);
    setScenarioPaused(false);
    props.startScenarioOnClick("2d");
  };

  const startScenarioIn3dMode = () => {
    setScenarioLaunchDialogOpen(false);
    setScenarioPaused(false);
    props.startScenarioOnClick("3d");
  };

  const handlePlayClick = () => {
    if (scenarioPaused) {
      if (
        shouldPromptScenarioLaunchModeSelection({
          scenario: props.game.currentScenario,
          scenarioPaused,
        })
      ) {
        setScenarioLaunchDialogOpen(true);
        return;
      }

      setScenarioPaused(false);
      props.playOnClick();
    } else {
      setScenarioLaunchDialogOpen(false);
      setScenarioPaused(true);
      props.pauseOnClick();
    }
  };

  const handleUndo = () => {
    setScenarioPaused(true);
    props.handleUndo();
  };

  const handleRecordScenarioClick = () => {
    if (recordingScenario) {
      setRecordingScenario(false);
      props.stopRecordingScenarioOnClick();
    } else {
      setRecordingScenario(true);
      props.recordScenarioOnClick();
    }
  };

  const handleStepClick = () => {
    setScenarioPaused(true);
    props.stepOnClick();
  };

  const handleUnitClassSelect = (
    unitType: "aircraft" | "airbase" | "facility" | "ship",
    unitClassName: string,
    options?: AssetSelectionOptions
  ) => {
    const placementLabels = {
      aircraft: "항공기",
      airbase: "기지",
      facility: "지상 무기체계",
      ship: "함정",
    } satisfies Record<typeof unitType, string>;

    if (!canOpenPlacementMenu(placementLabels[unitType])) {
      return;
    }

    if (options?.selectionKey) {
      setSelectedBaseSelectionKey(options.selectionKey);
    }

    let guideRailAssetType: GuideRailAssetMixId | null = null;

    switch (unitType) {
      case "aircraft":
        setSelectedAircraftUnitClass(unitClassName);
        if (isDroneAircraftClassName(unitClassName)) {
          guideRailAssetType = "drone";
          setSelectedDroneUnitClass(unitClassName);
          writeGuideRailSelection(
            GUIDE_RAIL_SELECTION_STORAGE_KEYS.drone,
            unitClassName
          );
        } else {
          guideRailAssetType = "manned-aircraft";
          setSelectedMannedAircraftUnitClass(unitClassName);
          writeGuideRailSelection(
            GUIDE_RAIL_SELECTION_STORAGE_KEYS.mannedAircraft,
            unitClassName
          );
        }
        break;
      case "airbase":
        guideRailAssetType = "airbase";
        setSelectedAirbaseUnitClass(unitClassName);
        writeGuideRailSelection(
          GUIDE_RAIL_SELECTION_STORAGE_KEYS.airbase,
          unitClassName
        );
        break;
      case "facility":
        setSelectedSamUnitClass(unitClassName);
        if (isTankFacilityClassName(unitClassName)) {
          guideRailAssetType = "armor";
          setSelectedArmorUnitClass(unitClassName);
          writeGuideRailSelection(
            GUIDE_RAIL_SELECTION_STORAGE_KEYS.armor,
            unitClassName
          );
        } else {
          guideRailAssetType = "facility";
          setSelectedSupportFacilityUnitClass(unitClassName);
          writeGuideRailSelection(
            GUIDE_RAIL_SELECTION_STORAGE_KEYS.facility,
            unitClassName
          );
        }
        break;
      case "ship":
        guideRailAssetType = "ship";
        setSelectedShipUnitClass(unitClassName);
        writeGuideRailSelection(
          GUIDE_RAIL_SELECTION_STORAGE_KEYS.ship,
          unitClassName
        );
        break;
      default:
        break;
    }

    if (guideRailAssetType) {
      props.onGuideRailActiveAssetTypeChange(guideRailAssetType);
    }

    if (options?.focusCenter) {
      props.updateMapView(
        options.focusCenter,
        options.focusZoom ?? props.game.mapView.currentCameraZoom
      );
    }

    setAssetPlacementPreview(
      buildAssetPlacementPreview(
        unitDbContext,
        props.game.currentScenario.getSideName(props.game.currentSideId),
        unitType,
        unitClassName,
        {
          displayName: options?.displayName,
          previewBadgeLabel: options?.previewBadgeLabel,
          previewTitle: options?.previewTitle,
          previewDescription: options?.previewDescription,
          presetContext: options?.presetContext,
          deploymentDefaults: options?.deploymentDefaults,
        }
      )
    );
  };

  useEffect(() => {
    if (props.assetPlacementFocusIntent.signal === 0) {
      return;
    }
    if (
      processedGuideRailPlacementSignalRef.current ===
      props.assetPlacementFocusIntent.signal
    ) {
      return;
    }
    processedGuideRailPlacementSignalRef.current =
      props.assetPlacementFocusIntent.signal;

    const currentSideFilters = props.scenarioCurrentSideId
      ? [props.scenarioCurrentSideId]
      : [];

    switch (props.assetPlacementFocusIntent.assetType) {
      case "manned-aircraft": {
        const nextAircraftClass = mannedAircraftDb.some(
          (aircraft) => aircraft.className === selectedMannedAircraftUnitClass
        )
          ? selectedMannedAircraftUnitClass
          : mannedAircraftDb[0]?.className;
        setEntityFilterSelectedOptions([...currentSideFilters, "aircraft"]);
        if (nextAircraftClass) {
          handleUnitClassSelect("aircraft", nextAircraftClass);
        }
        break;
      }
      case "drone": {
        const nextDroneClass = droneAircraftDb.some(
          (aircraft) => aircraft.className === selectedDroneUnitClass
        )
          ? selectedDroneUnitClass
          : droneAircraftDb[0]?.className;
        setEntityFilterSelectedOptions([...currentSideFilters, "aircraft"]);
        if (nextDroneClass) {
          handleUnitClassSelect("aircraft", nextDroneClass);
        }
        break;
      }
      case "airbase": {
        const nextAirbaseClass = airbaseDb.some(
          (airbase) => airbase.name === selectedAirbaseUnitClass
        )
          ? selectedAirbaseUnitClass
          : airbaseDb[0]?.name;
        setEntityFilterSelectedOptions([...currentSideFilters, "airbase"]);
        if (nextAirbaseClass) {
          handleUnitClassSelect("airbase", nextAirbaseClass);
        }
        break;
      }
      case "facility": {
        const nextFacilityClass = supportFacilityDb.some(
          (facility) => facility.className === selectedSupportFacilityUnitClass
        )
          ? selectedSupportFacilityUnitClass
          : supportFacilityDb[0]?.className;
        setEntityFilterSelectedOptions([...currentSideFilters, "facility"]);
        if (nextFacilityClass) {
          handleUnitClassSelect("facility", nextFacilityClass);
        }
        break;
      }
      case "armor": {
        const nextArmorClass = tankFacilityDb.some(
          (facility) => facility.className === selectedArmorUnitClass
        )
          ? selectedArmorUnitClass
          : tankFacilityDb[0]?.className;
        setEntityFilterSelectedOptions([...currentSideFilters, "facility"]);
        if (nextArmorClass) {
          handleUnitClassSelect("facility", nextArmorClass);
        }
        break;
      }
      case "ship": {
        const nextShipClass = shipDb.some(
          (ship) => ship.className === selectedShipUnitClass
        )
          ? selectedShipUnitClass
          : shipDb[0]?.className;
        setEntityFilterSelectedOptions([...currentSideFilters, "ship"]);
        if (nextShipClass) {
          handleUnitClassSelect("ship", nextShipClass);
        }
        break;
      }
      default:
        break;
    }
  }, [
    aircraftDb,
    airbaseDb,
    droneAircraftDb,
    facilityDb,
    mannedAircraftDb,
    props.assetPlacementFocusIntent.assetType,
    props.assetPlacementFocusIntent.signal,
    props.scenarioCurrentSideId,
    selectedAirbaseUnitClass,
    selectedArmorUnitClass,
    selectedDroneUnitClass,
    selectedMannedAircraftUnitClass,
    selectedShipUnitClass,
    selectedSupportFacilityUnitClass,
    shipDb,
    supportFacilityDb,
    tankFacilityDb,
  ]);

  const handleAssetPlacementPreviewClose = () => {
    setAssetPlacementPreview(null);
  };

  const handleAssetPlacementPreviewConfirm = () => {
    if (!assetPlacementPreview) {
      return;
    }

    switch (assetPlacementPreview.unitType) {
      case "aircraft":
        setSelectedAircraftUnitClass(assetPlacementPreview.unitClassName);
        props.addAircraftOnClick(assetPlacementPreview.unitClassName);
        break;
      case "airbase": {
        setSelectedAirbaseUnitClass(assetPlacementPreview.unitClassName);
        const airbaseTemplate = unitDbContext.findAirbaseModel(
          assetPlacementPreview.unitClassName
        );
        props.addAirbaseOnClick([0, 0], airbaseTemplate?.name, [
          airbaseTemplate?.longitude ?? 0,
          airbaseTemplate?.latitude ?? 0,
        ]);
        break;
      }
      case "facility":
        setSelectedSamUnitClass(assetPlacementPreview.unitClassName);
        props.addFacilityOnClick(
          assetPlacementPreview.unitClassName,
          assetPlacementPreview.deploymentDefaults ?? undefined
        );
        break;
      case "ship":
        setSelectedShipUnitClass(assetPlacementPreview.unitClassName);
        props.addShipOnClick(assetPlacementPreview.unitClassName);
        break;
      default:
        break;
    }

    setAssetPlacementPreview(null);
  };

  const buildQuickAddSections = (): QuickAddSection[] => {
    const koreanAircraftNames = new Set([
      "KF-21 Boramae",
      "FA-50 Fighting Eagle",
      "T-50 Golden Eagle",
      "TA-50 Lead-In Fighter Trainer",
      "F-15K Slam Eagle",
      "KF-16",
    ]);
    const strikeAircraftPattern = /F-35|F-22|F-16|F-15|F\/A-18|F-4|F-14|A-10/i;
    const supportAircraftPattern = /KC-|C-\d+|B-\d+/i;
    const koreanFacilityPattern =
      /Chunmoo|Tactical Surface to Surface|L-SAM|Cheongung|Pegasus|Biho/i;
    const alliedDefensePattern = /Patriot|THAAD|Aster|Barak|NASAMS/i;
    const hostileDefensePattern = /S-400|S-300|S-500|Buk|Tor|Pantsir|HQ-/i;
    const koreanShipPattern =
      /Jeongjo|Sejong|Chungmugong|Daegu|Incheon|Dokdo|Yoon Youngha/i;

    const toAircraftEntry = (
      className: string,
      description: string,
      entityType: ToolbarEntityType = "aircraft"
    ): QuickAddEntry => ({
      key: `aircraft-${className}`,
      label: getDisplayName(className),
      entityType,
      unitType: "aircraft",
      value: className,
      description,
    });
    const toFacilityEntry = (
      className: string,
      description: string
    ): QuickAddEntry => ({
      key: `facility-${className}`,
      label: getDisplayName(className),
      entityType: "facility",
      unitType: "facility",
      value: className,
      description,
    });
    const toShipEntry = (
      className: string,
      description: string
    ): QuickAddEntry => ({
      key: `ship-${className}`,
      label: getDisplayName(className),
      entityType: "ship",
      unitType: "ship",
      value: className,
      description,
    });
    const prioritizedQuickAddAirbaseOptions =
      sortBaseSelectionOptionsByDistance(
        buildPriorityQuickAddAirbaseOptions(airbaseDb),
        props.game.mapView.currentCameraCenter
      );

    const sections: QuickAddSection[] = [
      {
        title: "드론 전력",
        items: droneAircraftDb.map((aircraft) =>
          toAircraftEntry(
            aircraft.className,
            "무인 정찰·감시·정밀타격 자산 배치",
            "drone"
          )
        ),
      },
      {
        title: "항공 전력",
        items: aircraftDb
          .filter((aircraft) => {
            if (isDroneAircraftClassName(aircraft.className)) {
              return false;
            }

            return (
              koreanAircraftNames.has(aircraft.className) ||
              strikeAircraftPattern.test(aircraft.className) ||
              supportAircraftPattern.test(aircraft.className)
            );
          })
          .map((aircraft) => {
            if (koreanAircraftNames.has(aircraft.className)) {
              return toAircraftEntry(aircraft.className, "한국 항공전력 배치");
            }
            if (supportAircraftPattern.test(aircraft.className)) {
              return toAircraftEntry(
                aircraft.className,
                "폭격·수송·지원 자산 배치"
              );
            }
            return toAircraftEntry(aircraft.className, "전투·공격 자산 배치");
          }),
      },
      {
        title: "기갑 전력",
        items: tankFacilityDb.map((facility) => ({
          key: `facility-${facility.className}`,
          label: getDisplayName(facility.className),
          entityType: "tank",
          unitType: "facility",
          value: facility.className,
          description: "전차·장갑차 계열 지상 자산 배치",
        })),
      },
      {
        title: "지상 전력",
        items: facilityDb
          .filter((facility) => {
            if (isTankFacilityClassName(facility.className)) {
              return false;
            }

            return (
              koreanFacilityPattern.test(facility.className) ||
              alliedDefensePattern.test(facility.className) ||
              hostileDefensePattern.test(facility.className)
            );
          })
          .map((facility) => {
            if (
              /Chunmoo|Tactical Surface to Surface/i.test(facility.className)
            ) {
              return toFacilityEntry(
                facility.className,
                "장거리 화력 자산 배치"
              );
            }
            if (koreanFacilityPattern.test(facility.className)) {
              return toFacilityEntry(
                facility.className,
                "한국 방공·지상 전력 배치"
              );
            }
            if (alliedDefensePattern.test(facility.className)) {
              return toFacilityEntry(facility.className, "연합 방공 자산 배치");
            }
            return toFacilityEntry(facility.className, "적 방공망 자산 배치");
          }),
      },
      {
        title: "해상 전력",
        items: shipDb.map((ship) =>
          toShipEntry(
            ship.className,
            koreanShipPattern.test(ship.className)
              ? "한국 함정 전력 배치"
              : "범용 해상 전력 배치"
          )
        ),
      },
      {
        title: "기지 / 유틸",
        items: [
          ...recommendedArtilleryBaseOptions,
          ...prioritizedQuickAddAirbaseOptions,
          {
            key: "reference-point",
            label: "참조점",
            entityType: "referencePoint",
            description: "기준 위치 또는 작전 포인트 추가",
            onClick: handleReferencePointIconClick,
          },
        ],
      },
    ];

    return sections.filter((section) => section.items.length > 0);
  };

  const recommendedArtilleryBaseOptions = buildAdaptiveArtilleryPresetOptions(
    sortBaseSelectionOptionsByDistance(
      PRIORITY_ARTILLERY_BASE_OPTIONS,
      props.game.mapView.currentCameraCenter
    ),
    props.game.currentScenario,
    props.game.currentSideId
  ).map((item) => ({
    ...item,
    presetContext: {
      regionLabel: item.regionLabel,
      coverageLabel: item.coverageLabel,
      representativeAssetLabel: item.representativeAssetLabel,
      sourceLabel: item.sourceLabel,
      threatAxisLabel: item.threatAxisLabel,
    },
    deploymentDefaults:
      item.deploymentHeadingDegrees !== undefined
        ? {
            headingDegrees: item.deploymentHeadingDegrees,
            arcDegrees: item.deploymentArcDegrees,
            recommendationLabel: item.deploymentRecommendationLabel,
            formation: item.formation,
          }
        : undefined,
  }));

  const experienceSections = [
    {
      title: "지상전",
      items: [
        {
          key: "experience-airwatch-3d",
          label: "공중 관측 3D",
          description: "현재 시나리오를 공중 관측형 3D 화면으로 표시",
          entityType: "facility" as const,
          onClick: props.openScenario3dView,
        },
        {
          key: "experience-ground",
          label: "지상 기동 브리프",
          description: "지상 기동 작전 흐름을 미리 확인하는 준비 화면",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("ground"),
        },
        {
          key: "experience-fires",
          label: "화력 운용 브리프",
          description: "화력 임무 흐름과 발사 구성을 정리하는 준비 화면",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("fires"),
        },
        {
          key: "experience-defense",
          label: "방공 체계 브리프",
          description: "방공 임무 흐름과 요격 구성을 정리하는 준비 화면",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("defense"),
        },
      ],
    },
    {
      title: "해상전",
      items: [
        {
          key: "experience-maritime",
          label: "함정 운용 브리프",
          description: "해상 전력 모델과 임무 흐름을 정리하는 준비 화면",
          entityType: "ship" as const,
          onClick: () => props.openImmersiveExperiencePage("maritime"),
        },
      ],
    },
    {
      title: "항공전",
      items: [
        {
          key: "experience-drone",
          label: "드론 시뮬레이터",
          description: "저속·저고도 드론 시점 비행 시뮬레이션",
          entityType: "aircraft" as const,
          onClick: () => props.openFlightSimPage("drone"),
        },
        {
          key: "experience-helicopter",
          label: "헬기 대응 브리프",
          description: "헬기 출격과 기지 대응 흐름을 정리하는 준비 화면",
          entityType: "aircraft" as const,
          onClick: () => props.openImmersiveExperiencePage("base"),
        },
        {
          key: "experience-jet",
          label: "전투기 시뮬레이터",
          description: "제트 전투기 고속 비행 시뮬레이션",
          entityType: "aircraft" as const,
          onClick: () => props.openFlightSimPage("jet"),
        },
        {
          key: "experience-base",
          label: "기지 운용 브리프",
          description: "기지 방호와 출격 구성을 정리하는 준비 화면",
          entityType: "airbase" as const,
          onClick: () => props.openImmersiveExperiencePage("base"),
        },
      ],
    },
  ];
  const focusFireSummary = props.game.getFocusFireSummary();
  const focusFireInsight = buildFocusFireInsight(focusFireSummary);
  const focusFireDockStage = resolveFocusFireDockStage(focusFireSummary);
  const isEmptyScenario = isScenarioEmptyForOnboarding(
    props.game.currentScenario
  );
  const scenarioAssetCount =
    props.game.currentScenario.aircraft.length +
    props.game.currentScenario.airbases.length +
    props.game.currentScenario.armies.length +
    props.game.currentScenario.facilities.length +
    props.game.currentScenario.ships.length;
  const currentSideId = props.game.currentScenario.getSide(
    props.game.currentSideId
  )?.id;
  const currentSideName = props.game.currentScenario.getSideName(
    props.game.currentSideId
  );
  const currentSideMissionCount = props.game.currentScenario.missions.filter(
    (mission) => mission.sideId === currentSideId
  ).length;
  const entityFilterTypeOptions = [
    "airbase",
    "aircraft",
    "army",
    "ship",
    "facility",
    "referencePoint",
  ];
  const scenarioSideIds = props.game.currentScenario.sides.map(
    (side) => side.id
  );
  const currentlySelectedSideIds = props.game.godMode
    ? scenarioSideIds
    : [props.game.currentSideId];
  const plottedSideFeatures = props.featureEntitiesPlotted.filter(
    (feature: FeatureEntityState) =>
      currentlySelectedSideIds.includes(feature.sideId)
  );
  const selectedEntitySideIds = entityFilterSelectedOptions.filter(
    (selectedOption: string) => scenarioSideIds.includes(selectedOption)
  );
  const selectedEntityTypes = entityFilterSelectedOptions.filter(
    (selectedOption: string) => entityFilterTypeOptions.includes(selectedOption)
  );
  const filteredEntityFeatures = props.featureEntitiesPlotted.filter(
    (feature: FeatureEntityState) => {
      if (selectedEntitySideIds.length > 0) {
        if (selectedEntityTypes.length > 0) {
          return (
            selectedEntityTypes.includes(feature.type) &&
            selectedEntitySideIds.includes(feature.sideId)
          );
        }

        return selectedEntitySideIds.includes(feature.sideId);
      }

      return selectedEntityTypes.includes(feature.type);
    }
  );
  const currentSideOperationalFeatureCount =
    props.featureEntitiesPlotted.filter(
      (feature: FeatureEntityState) =>
        feature.sideId === currentSideId &&
        !feature.type.startsWith("reference")
    ).length;
  const scenarioMissionCount = props.game.currentScenario.missions.length;
  const scenarioWeaponsInFlight = props.game.currentScenario.weapons.length;
  const scenarioStatusLabel = props.game.scenarioPaused
    ? "일시정지"
    : "실행 중";
  const focusFireSectionOpen =
    focusFireSummary.enabled ||
    focusFireSummary.active ||
    Boolean(focusFireSummary.objectiveName);
  const missionSectionOpen = props.game.currentScenario.missions.length > 0;
  const focusFireRiskTone =
    focusFireInsight.shockIndex >= 70 || scenarioWeaponsInFlight >= 4
      ? "danger"
      : focusFireInsight.shockIndex >= 40 || scenarioWeaponsInFlight >= 2
        ? "warning"
        : focusFireSummary.enabled || focusFireSummary.objectiveName
          ? "accent"
          : "neutral";
  const commandPanelSummary = (() => {
    if (isEmptyScenario) {
      return {
        riskLabel: "구성 전",
        riskTone: "neutral" as const,
        summary: "자산 배치 필요",
        action: "정찰·화력 자산 우선 배치",
        recommendedMissionValue: "초기 배치",
        recommendedMissionDetail: "첫 임무 생성",
      };
    }

    if (
      focusFireSummary.active &&
      (focusFireInsight.shockIndex >= 70 || scenarioWeaponsInFlight >= 4)
    ) {
      return {
        riskLabel: "긴급",
        riskTone: "danger" as const,
        summary: `${
          focusFireSummary.objectiveName ?? "목표 축"
        } 화력 집중 · 비행탄 ${scenarioWeaponsInFlight}발`,
        action: focusFireSummary.recommendation?.targetName
          ? `${focusFireSummary.recommendation.targetName} 후속 타격 정리`
          : "방호 축 우선 정리",
        recommendedMissionValue: focusFireSummary.recommendation?.missionKind
          ? `${focusFireSummary.recommendation.missionKind}`
          : "화력 대응",
        recommendedMissionDetail: focusFireSummary.recommendation
          ?.recommendedOptionLabel
          ? `${focusFireSummary.recommendation.recommendedOptionLabel} · ${focusFireSummary.recommendation.launchReadinessLabel}`
          : "즉응 자산 우선",
      };
    }

    if (
      currentSideMissionCount === 0 &&
      currentSideOperationalFeatureCount > 0
    ) {
      return {
        riskLabel: "주의",
        riskTone: "warning" as const,
        summary: `자산 ${currentSideOperationalFeatureCount} · 임무 없음`,
        action: "초계/타격 임무 생성",
        recommendedMissionValue: "임무 생성 필요",
        recommendedMissionDetail: "표적 또는 순찰 축 지정",
      };
    }

    if (focusFireSummary.enabled || focusFireSummary.objectiveName) {
      return {
        riskLabel: "공세 준비",
        riskTone: "accent" as const,
        summary: `${
          focusFireSummary.objectiveName ?? "목표 축"
        } ${focusFireSummary.statusLabel}`,
        action: focusFireSummary.recommendation?.targetName
          ? `${focusFireSummary.recommendation.targetName} 패키지 점검`
          : "목표·발사 패키지 점검",
        recommendedMissionValue: focusFireSummary.recommendation?.targetName
          ? `${focusFireSummary.recommendation.targetName} 타격`
          : "화력 임무 준비",
        recommendedMissionDetail:
          focusFireSummary.recommendation?.launchReadinessLabel ??
          "발사 준비 확인",
      };
    }

    if (scenarioWeaponsInFlight > 0 || currentSideMissionCount >= 3) {
      return {
        riskLabel: "경계",
        riskTone: "warning" as const,
        summary: `임무 ${currentSideMissionCount} · 비행탄 ${scenarioWeaponsInFlight}`,
        action: "우선순위 재정렬",
        recommendedMissionValue: "임무 재정렬",
        recommendedMissionDetail: "핵심 축 재집중",
      };
    }

    return {
      riskLabel: "안정",
      riskTone: "accent" as const,
      summary: `자산 ${currentSideOperationalFeatureCount} · 임무 ${currentSideMissionCount}`,
      action: "현재 흐름 유지",
      recommendedMissionValue: "현재 임무 유지",
      recommendedMissionDetail:
        focusFireSummary.recommendation?.recommendedOptionLabel ??
        "필요 시 화력 전환",
    };
  })();
  const sectionHeaderBadges = {
    recording: [
      {
        label: props.game.recordingPlayer.hasRecording()
          ? "재생 준비"
          : "기록 대기",
        tone: props.game.recordingPlayer.hasRecording() ? "accent" : "default",
      },
      {
        label: recordingScenario
          ? "REC"
          : `간격 ${formatSecondsToString(
              props.game.playbackRecorder.recordEverySeconds
            )}`,
        tone: recordingScenario ? "warning" : "default",
      },
    ] as const,
    assets: [
      {
        label: `${filteredEntityFeatures.length}개`,
        tone: filteredEntityFeatures.length > 0 ? "accent" : "default",
      },
      {
        label: props.game.godMode ? "전체 시점" : currentSideName,
        tone: props.game.godMode ? "warning" : "default",
      },
    ] as const,
    focusFire: [
      {
        label: `충격량 ${focusFireInsight.shockIndex}`,
        tone:
          focusFireRiskTone === "danger"
            ? "danger"
            : focusFireRiskTone === "warning"
              ? "warning"
              : "accent",
      },
      {
        label: focusFireSummary.statusLabel,
        tone: focusFireSummary.active
          ? "danger"
          : focusFireSummary.enabled
            ? "accent"
            : "default",
      },
    ] as const,
    mission: [
      {
        label: `${currentSideMissionCount}개`,
        tone: currentSideMissionCount > 0 ? "accent" : "default",
      },
      {
        label: currentSideName,
        tone: "default",
      },
    ] as const,
  };
  const armyGptBriefingCards: ArmyGptBriefingCard[] = [
    {
      label: "전력",
      value: `자산 ${currentSideOperationalFeatureCount} · 임무 ${currentSideMissionCount}`,
      description: props.game.godMode
        ? `전체 시점 기준 표시 자산 ${plottedSideFeatures.length}개를 추적 중입니다.`
        : `${currentSideName} 기준 현재 전장 자산과 임무 흐름을 추적합니다.`,
      tone: currentSideMissionCount > 0 ? "accent" : "neutral",
    },
    {
      label: "위협",
      value: commandPanelSummary.riskLabel,
      description: commandPanelSummary.summary,
      tone: commandPanelSummary.riskTone,
    },
    {
      label: "권고 임무",
      value: commandPanelSummary.recommendedMissionValue,
      description: commandPanelSummary.recommendedMissionDetail,
      tone: commandPanelSummary.riskTone === "danger" ? "warning" : "accent",
    },
  ];

  const focusFireSection = () => (
    <Stack spacing={1} sx={{ p: 0.35 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(45, 214, 196, 0.08)",
        }}
      >
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
          <Chip
            size="small"
            color={focusFireSummary.active ? "warning" : "default"}
            label={focusFireSummary.statusLabel}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`점령 ${focusFireSummary.captureProgress.toFixed(0)}%`}
          />
        </Stack>

        <Typography variant="body2" sx={{ mt: 0.85, color: "text.secondary" }}>
          목표 {focusFireSummary.objectiveName ?? "미지정"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.45, color: "text.secondary" }}>
          포대 {focusFireSummary.artilleryCount} · 기갑{" "}
          {focusFireSummary.armorCount} · 항공 {focusFireSummary.aircraftCount}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.45, color: "text.secondary" }}>
          다음 단계 {focusFireDockStage.title}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button
          size="small"
          variant={focusFireSummary.enabled ? "outlined" : "contained"}
          onClick={props.toggleFocusFireMode}
        >
          {focusFireSummary.enabled ? "모드 해제" : "모드 켜기"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={props.armFocusFireObjectiveSelection}
        >
          목표 지정
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={props.openFocusFireDock}
        >
          작전 패널
        </Button>
      </Stack>

      <Typography sx={{ fontSize: 12, color: "text.secondary", px: 0.2 }}>
        충격량 {focusFireInsight.shockIndex} · {focusFireInsight.intensityLabel}
      </Typography>
    </Stack>
  );

  const handleGodModeToggle = () => {
    props.game.toggleGodMode();
    if (props.game.godMode) {
      handleEntitySideChange(
        props.game.currentScenario.sides.map((side) => side.id)
      );
    } else {
      handleEntitySideChange([props.game.currentSideId]);
    }
    toastContext?.addToast(
      `전체 시점: ${props.game.godMode ? "켜짐" : "꺼짐"}`
    );
  };

  const handleEraserModeToggle = () => {
    props.game.toggleEraserMode();
    toastContext?.addToast(
      `지우개 모드: ${props.game.eraserMode ? "켜짐" : "꺼짐"}`
    );
  };

  // handles "hotkey" mechanic
  const keyboardEventHandler = (event: KeyboardEvent) => {
    const key = event.key;
    switch (key) {
      case " ":
        event.preventDefault();
        handlePlayClick();
        break;
      case "n":
        event.preventDefault();
        handleStepClick();
        break;
      case "r":
        event.preventDefault();
        reloadScenario();
        break;
      case "f":
        event.preventDefault();
        props.toggleScenarioTimeCompressionOnClick();
        break;
      case "g":
        event.preventDefault();
        handleGodModeToggle();
        break;
      case "e":
        event.preventDefault();
        handleEraserModeToggle();
        break;
      case "z":
        event.preventDefault();
        handleUndo();
        break;
      case "1":
        event.preventDefault();
        if (selectedAircraftUnitClass) {
          props.addAircraftOnClick(selectedAircraftUnitClass);
        }
        break;
      case "2":
        event.preventDefault();
        if (selectedAirbaseUnitClass) {
          const airbaseTemplate = unitDbContext
            .getAirbaseDb()
            .find((airbase) => airbase.name === selectedAirbaseUnitClass);
          props.addAirbaseOnClick([0, 0], airbaseTemplate?.name, [
            airbaseTemplate?.longitude ?? 0,
            airbaseTemplate?.latitude ?? 0,
          ]);
        }
        break;
      case "3":
        event.preventDefault();
        if (selectedSamUnitClass) {
          props.addFacilityOnClick(selectedSamUnitClass);
        }
        break;
      case "4":
        event.preventDefault();
        if (selectedShipUnitClass) {
          props.addShipOnClick(selectedShipUnitClass);
        }
        break;
      case "5":
        event.preventDefault();
        props.addReferencePointOnClick();
        break;
      case "6":
        event.preventDefault();
        props.toggleBaseMapLayer();
        break;
      case "7":
        event.preventDefault();
        props.toggleRouteVisibility(!props.routeVisibility);
        break;
      case "8":
        event.preventDefault();
        props.toggleThreatRangeVisibility(!props.threatRangeVisibility);
        break;
      case "9":
        event.preventDefault();
        props.toggleFeatureLabelVisibility(!props.featureLabelVisibility);
        break;
      case "Escape":
        event.preventDefault();
        props.finishRouteDrawLine();
        break;
      default:
        break;
    }
  };

  if (
    props.keyboardShortcutsEnabled &&
    !scenarioEditNameAnchorEl &&
    !isChatInputFocused &&
    !assetPlacementPreview &&
    !scenarioLaunchDialogOpen
  ) {
    document.onkeydown = keyboardEventHandler;
  } else {
    document.onkeydown = null;
  }

  const ScenarioDb = [
    { name: "default_scenario", displayName: "기본 데모" },
    { name: "rl_first_success_demo", displayName: "RL 첫 체감 데모" },
    {
      name: "rl_battle_optimization_demo",
      displayName: "RL 전투·배치 최적화 데모",
    },
    { name: "focused_training_demo", displayName: "가용화력자산" },
    { name: "focus_fire_economy_demo", displayName: "화력 배치 경제성 비교" },
    { name: "army_demo", displayName: "전장 데모" },
    ...strategicScenarioPresets.map((scenario) => ({
      name: scenario.name,
      displayName: scenario.displayName,
    })),
    { name: "_upload", displayName: "파일 불러오기..." },
  ];

  const presetScenarioSelectionMenu = () => {
    return (
      <Menu
        id="preset-scenario-selection-menu"
        anchorEl={loadScenarioAnchorEl}
        open={presetScenarioSelectionMenuOpen}
        onClose={handleLoadScenarioIconClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          root: { sx: { ".MuiList-root": { padding: 0 } } },
          list: {
            "aria-labelledby": "add-aircraft-icon-button",
          },
        }}
      >
        <Stack
          direction={"row"}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
            pl: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            불러오기
          </Typography>
          <IconButton onClick={handleLoadScenarioIconClose}>
            <ClearIcon sx={{ fontSize: 15, color: "red" }} />
          </IconButton>
        </Stack>
        {ScenarioDb.map((scenario) => (
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) =>
              loadPresetScenario(scenario.name)
            }
            key={scenario.name}
            value={scenario.name}
          >
            {scenario.displayName}
          </MenuItem>
        ))}
        {cloudScenarios.map((scenario: CloudScenario) => (
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) =>
              loadCloudScenario(scenario.scenarioId)
            }
            key={scenario.scenarioId}
            value={scenario.scenarioId}
            sx={{ paddingTop: 0 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Cloud />
                </ListItemIcon>
                <ListItemText
                  primary={scenario.name}
                  sx={{
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                />
              </Box>

              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteScenarioFromCloud(scenario.scenarioId);
                }}
                sx={{ ml: 2 }}
              >
                <Delete color="error" />
              </IconButton>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    );
  };

  const recordingSection = () => {
    return (
      <Stack spacing={1} direction={"column"}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            px: 1,
            py: 0.8,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(45, 214, 196, 0.12)",
          }}
        >
          <Chip
            variant="outlined"
            label={recordingScenario ? "기록 종료" : "기록 시작"}
            onClick={handleRecordScenarioClick}
          />
          <Chip
            variant="outlined"
            label={`간격 ${formatSecondsToString(props.game.playbackRecorder.recordEverySeconds)}`}
            onClick={props.toggleRecordEverySeconds}
          />
          <Tooltip title="기록 파일 열기">
            <IconButton onClick={props.loadRecordingOnClick}>
              <UploadFileOutlinedIcon
                fontSize="medium"
                sx={{ color: "var(--fs-text)" }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
        <Chip
          variant="filled"
          label="RL 타격 데모"
          onClick={props.loadFixedTargetStrikeReplayOnClick}
          sx={{
            alignSelf: "center",
            backgroundColor: "rgba(45, 214, 196, 0.92)",
            color: "#031114",
            fontWeight: 700,
          }}
        />
        {props.game.recordingPlayer.hasRecording() && (
          <RecordingPlayer
            recordingPaused={props.game.recordingPlayer.isPaused()}
            timelineStart={props.game.recordingPlayer.getStartStepIndex()}
            timelineEnd={props.game.recordingPlayer.getEndStepIndex()}
            handlePlayRecordingClick={props.handlePlayRecordingClick}
            handlePauseRecordingClick={props.handlePauseRecordingClick}
            handleStepRecordingToStep={props.handleStepRecordingToStep}
            handleStepRecordingBackwards={props.handleStepRecordingBackwards}
            handleStepRecordingForwards={props.handleStepRecordingForwards}
            formatTimelineMark={(recordingStep: number) =>
              props.game.recordingPlayer.getStepScenarioTime(recordingStep)
            }
          />
        )}
      </Stack>
    );
  };

  const missionSection = () => {
    const sideMissions = props.game.currentScenario.missions.filter(
      (mission) => mission.sideId === currentSideId
    );
    if (!sideMissions || !Array.isArray(sideMissions) || !sideMissions.length) {
      return (
        <Box
          sx={{
            px: 1.2,
            py: 1,
            borderRadius: 1.5,
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(45, 214, 196, 0.1)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            표시할 항목이 없습니다.
          </Typography>
        </Box>
      );
    }

    //Return statement (core visuals)
    return (
      <Stack spacing={1} direction="column">
        {sideMissions.map((mission) => (
          <Tooltip
            key={mission.id}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  임무명: {mission.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  세력: {props.game.currentScenario.getSideName(mission.sideId)}
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              onClick={() => {
                props.openMissionEditor(mission.id);
              }}
              key={mission.id}
              value={mission.name}
              sx={{
                borderRadius: 1.5,
                border: "1px solid rgba(45, 214, 196, 0.1)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <ListItemText primary={mission.name} />
            </MenuItem>
          </Tooltip>
        ))}
      </Stack>
    );
  };

  const quickAddSections = buildQuickAddSections();
  const baseSelectionAirbaseOptions = sortBaseSelectionOptionsByDistance(
    buildBaseSelectionAirbaseOptions(airbaseDb),
    props.game.mapView.currentCameraCenter
  );

  const quickAddMenu = () => (
    <Menu
      id="quick-add-menu"
      anchorEl={quickAddAnchorEl}
      open={quickAddMenuOpen}
      onClose={handleQuickAddMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        root: {
          sx: {
            ".MuiList-root": {
              py: 0,
              minWidth: 360,
              maxHeight: 520,
            },
          },
        },
      }}
    >
      {quickAddSections.map((section, sectionIndex) => (
        <React.Fragment key={section.title}>
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            {section.title}
          </ListSubheader>
          {section.items.map((item) => (
            <MenuItem
              key={item.key}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.unitType && item.value) {
                  handleUnitClassSelect(
                    item.unitType,
                    item.value,
                    toSelectionOptions(item)
                  );
                }
                handleQuickAddMenuClose();
              }}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
          {sectionIndex < quickAddSections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Menu>
  );

  const experienceMenu = () => (
    <Menu
      id="toolbar-3d-experience-menu"
      anchorEl={experienceAnchorEl}
      open={experienceMenuOpen}
      onClose={handleExperienceMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        root: {
          sx: {
            ".MuiList-root": {
              py: 0,
              minWidth: 340,
            },
          },
        },
      }}
    >
      {experienceSections.map((section, sectionIndex) => (
        <React.Fragment key={section.title}>
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            {section.title}
          </ListSubheader>
          {section.items.map((item) => (
            <MenuItem
              key={item.key}
              onClick={() => {
                item.onClick();
                handleExperienceMenuClose();
              }}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
          {sectionIndex < experienceSections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Menu>
  );

  const entityMenuButtons = () => {
    const toolbarAssetIconButtonSx = {
      mx: props.mobileView ? 0 : 0.15,
      width: 34,
      height: 34,
      borderRadius: 1.5,
      color: "var(--fs-text)",
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(45, 214, 196, 0.12)",
      boxShadow: "inset 0 1px 0 rgba(134, 255, 242, 0.04)",
      "&:hover": {
        backgroundColor: "rgba(45, 214, 196, 0.14)",
        borderColor: "rgba(45, 214, 196, 0.24)",
      },
    };

    return (
      <Stack
        direction={"row"}
        spacing={props.mobileView ? 2 : 0}
        sx={
          props.mobileView
            ? { justifyContent: "center", flexWrap: "wrap" }
            : {
                alignItems: "center",
                px: 0.35,
                py: 0.15,
                borderRadius: 999,
                border: "1px solid rgba(45, 214, 196, 0.12)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }
        }
      >
        {/** Add Aircraft Menu/Button */}
        <Tooltip title="항공기 추가">
          <IconButton
            id="add-aircraft-icon-button"
            aria-controls={
              aircraftClassMenuOpen ? "aircraft-classes-menu" : undefined
            }
            aria-haspopup="true"
            aria-expanded={aircraftClassMenuOpen ? "true" : undefined}
            onClick={handleAircraftIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="aircraft" />
          </IconButton>
        </Tooltip>
        <Menu
          id="aircraft-classes-menu"
          anchorEl={aircraftIconAnchorEl}
          open={aircraftClassMenuOpen}
          onClose={handleAircraftIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-aircraft-icon-button",
            },
          }}
        >
          <Stack
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              항공기 선택
            </Typography>
            <IconButton onClick={handleAircraftIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {unitDbContext.getAircraftDb().map((aircraft) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("aircraft", aircraft.className);
                handleAircraftIconClose();
              }}
              selected={aircraft.className === selectedAircraftUnitClass}
              key={aircraft.className}
              value={aircraft.className}
            >
              {getDisplayName(aircraft.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Drone Menu/Button */}
        <Tooltip title="드론 추가">
          <IconButton
            id="add-drone-icon-button"
            aria-controls={
              droneClassMenuOpen ? "drone-classes-menu" : undefined
            }
            aria-haspopup="true"
            aria-expanded={droneClassMenuOpen ? "true" : undefined}
            onClick={handleDroneIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="drone" />
          </IconButton>
        </Tooltip>
        <Menu
          id="drone-classes-menu"
          anchorEl={droneIconAnchorEl}
          open={droneClassMenuOpen}
          onClose={handleDroneIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-drone-icon-button",
            },
          }}
        >
          <Stack
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              드론 선택
            </Typography>
            <IconButton onClick={handleDroneIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {droneAircraftDb.map((aircraft) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("aircraft", aircraft.className);
                handleDroneIconClose();
              }}
              selected={aircraft.className === selectedDroneUnitClass}
              key={aircraft.className}
              value={aircraft.className}
            >
              {getDisplayName(aircraft.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Airbase Menu/Button */}
        <Tooltip title="기지/포병 프리셋 추가">
          <IconButton
            id="add-airbase-icon-button"
            aria-controls={
              airbaseClassMenuOpen ? "airbase-classes-menu" : undefined
            }
            aria-haspopup="true"
            aria-expanded={airbaseClassMenuOpen ? "true" : undefined}
            onClick={handleAirbaseIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="airbase" />
          </IconButton>
        </Tooltip>
        <Menu
          id="airbase-classes-menu"
          anchorEl={airbaseIconAnchorEl}
          open={airbaseClassMenuOpen}
          onClose={handleAirbaseClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: {
              sx: {
                ".MuiList-root": {
                  padding: 0,
                  minWidth: 360,
                  maxHeight: 520,
                },
              },
            },
            list: {
              "aria-labelledby": "add-airbase-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              기지/포병 선택
            </Typography>
            <IconButton onClick={handleAirbaseClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            포병 우선 · 가까운 권역순
          </ListSubheader>
          {recommendedArtilleryBaseOptions.map((item) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect(
                  item.unitType,
                  item.value,
                  toSelectionOptions(item)
                );
                handleAirbaseClose();
              }}
              selected={item.key === selectedBaseSelectionKey}
              key={item.key}
              value={item.value}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
          <Divider />
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            공군기지 · 가까운 권역순
          </ListSubheader>
          {baseSelectionAirbaseOptions.map((item) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect(
                  item.unitType,
                  item.value,
                  toSelectionOptions(item)
                );
                handleAirbaseClose();
              }}
              selected={item.key === selectedBaseSelectionKey}
              key={item.key}
              value={item.value}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
        </Menu>
        {/** Add Sam Menu/Button */}
        <Tooltip title="지상 무기체계 추가">
          <IconButton
            id="add-sam-icon-button"
            aria-controls={samClassMenuOpen ? "sam-classes-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={samClassMenuOpen ? "true" : undefined}
            onClick={handleSamIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="facility" />
          </IconButton>
        </Tooltip>
        <Menu
          id="sam-classes-menu"
          anchorEl={samIconAnchorEl}
          open={samClassMenuOpen}
          onClose={handleSamIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-sam-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              지상 무기체계 선택
            </Typography>
            <IconButton onClick={handleSamIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {unitDbContext.getFacilityDb().map((facility) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("facility", facility.className);
                handleSamIconClose();
              }}
              selected={facility.className === selectedSamUnitClass}
              key={facility.className}
              value={facility.className}
            >
              {getDisplayName(facility.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Tank Menu/Button */}
        <Tooltip title="전차/장갑차 추가">
          <IconButton
            id="add-tank-icon-button"
            aria-controls={tankClassMenuOpen ? "tank-classes-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={tankClassMenuOpen ? "true" : undefined}
            onClick={handleTankIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="tank" />
          </IconButton>
        </Tooltip>
        <Menu
          id="tank-classes-menu"
          anchorEl={tankIconAnchorEl}
          open={tankClassMenuOpen}
          onClose={handleTankIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-tank-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              전차/장갑차 선택
            </Typography>
            <IconButton onClick={handleTankIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {tankFacilityDb.map((facility) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("facility", facility.className);
                handleTankIconClose();
              }}
              selected={facility.className === selectedArmorUnitClass}
              key={facility.className}
              value={facility.className}
            >
              {getDisplayName(facility.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Ship Menu/Button */}
        <Tooltip title="함정 추가">
          <IconButton
            id="add-ship-icon-button"
            aria-controls={shipClassMenuOpen ? "ship-classes-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={shipClassMenuOpen ? "true" : undefined}
            onClick={handleShipIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="ship" />
          </IconButton>
        </Tooltip>
        <Menu
          id="ship-classes-menu"
          anchorEl={shipIconAnchorEl}
          open={shipClassMenuOpen}
          onClose={handleShipIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-ship-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              함정 선택
            </Typography>
            <IconButton onClick={handleShipIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {unitDbContext.getShipDb().map((ship) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("ship", ship.className);
                handleShipIconClose();
              }}
              selected={ship.className === selectedShipUnitClass}
              key={ship.className}
              value={ship.className}
            >
              {getDisplayName(ship.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Reference Point */}
        <Tooltip title="참조점 추가">
          <IconButton
            onClick={handleReferencePointIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="referencePoint" />
          </IconButton>
        </Tooltip>
        {/** Unit Db Functions */}
        <Tooltip title="자료 도구">
          <IconButton
            onClick={handleUnitDbToolsIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <Storage />
          </IconButton>
        </Tooltip>
        <Menu
          id="unit-db-functions-menu"
          anchorEl={unitDbToolsIconAnchorEl}
          open={unitDbToolsMenuOpen}
          onClose={handleUnitDbToolsIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "unit-db-functions-button",
            },
          }}
        >
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const exportedUnitDb = unitDbContext.exportToJson();
              downloadTextFile(
                `firescope_units_${buildSafeDownloadTimestamp()}.json`,
                exportedUnitDb,
                "text/json"
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"export-unit-db"}
          >
            유닛 자료 저장
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const diagnostics = unitDbContext.buildDiagnosticsReport();
              downloadTextFile(
                `firescope_unit_db_diagnostics_${buildSafeDownloadTimestamp()}.json`,
                JSON.stringify(diagnostics, null, 2),
                "application/json"
              );
              toastContext?.addToast(
                `검증 완료: 오류 ${diagnostics.summary.errorCount}건, 경고 ${diagnostics.summary.warningCount}건입니다.`,
                diagnostics.summary.errorCount > 0 ? "warning" : "success",
                7000
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"validate-unit-db"}
          >
            유닛 자료 검증 리포트
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const parityReport = unitDbContext.buildPythonParityReport();
              downloadTextFile(
                `firescope_unit_db_ts_python_parity_${buildSafeDownloadTimestamp()}.json`,
                JSON.stringify(parityReport, null, 2),
                "application/json"
              );
              toastContext?.addToast(
                `비교 완료: 오류 ${parityReport.summary.errorCount}건, 경고 ${parityReport.summary.warningCount}건입니다.`,
                parityReport.summary.errorCount > 0 ? "warning" : "success",
                7000
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"validate-unit-db-parity"}
          >
            TS/Python 정합성 리포트
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const syncPlan = unitDbContext.buildPythonSyncPlan();
              downloadTextFile(
                `firescope_unit_db_ts_python_sync_plan_${buildSafeDownloadTimestamp()}.json`,
                JSON.stringify(syncPlan, null, 2),
                "application/json"
              );
              toastContext?.addToast(
                `동기화 후보 ${syncPlan.summary.actionCount}건을 정리했습니다. 우선순위 높음 ${syncPlan.summary.highPriorityCount}건입니다.`,
                syncPlan.summary.highPriorityCount > 0 ? "warning" : "success",
                7000
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"unit-db-sync-plan"}
          >
            TS/Python 동기화 후보
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              props.pauseOnClick();
              setScenarioPaused(true);
              const input = document.createElement("input");
              input.style.display = "none";
              input.type = "file";
              input.accept = ".json";
              input.onchange = (event) => {
                input.remove();
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.readAsText(file, "UTF-8");
                  reader.onload = (readerEvent) => {
                    try {
                      const unitDbString = readerEvent.target?.result as string;
                      const importedUnitDb = Dba.fromJson(unitDbString);
                      const diagnostics =
                        importedUnitDb.buildDiagnosticsReport();
                      setUnitDbContext(importedUnitDb);
                      toastContext?.addToast(
                        `유닛 자료를 불러왔습니다. 오류 ${diagnostics.summary.errorCount}건, 경고 ${diagnostics.summary.warningCount}건입니다.`,
                        diagnostics.summary.errorCount > 0
                          ? "warning"
                          : "success",
                        7000
                      );
                      setUnitDbToolsIconAnchorEl(null);
                    } catch (_error) {
                      toastContext?.addToast(
                        "자료 형식이 올바르지 않아 불러오지 못했습니다.",
                        "error"
                      );
                    }
                  };
                  reader.onerror = () => {
                    reader.abort();
                    toastContext?.addToast(
                      "자료 불러오기에 실패했습니다.",
                      "error"
                    );
                  };
                }
              };
              input.click();
            }}
            key={"import-unit-db"}
          >
            유닛 자료 불러오기
          </MenuItem>
        </Menu>
        {/** Enable Eraser */}
        <Tooltip title="지우개">
          <IconButton onClick={handleEraserModeToggle}>
            <img
              src={EraserIcon}
              alt="지우개 아이콘"
              width={24}
              height={24}
              style={{
                filter: props.game.eraserMode
                  ? SELECTED_ICON_COLOR_FILTER
                  : DEFAULT_ICON_COLOR_FILTER,
              }}
            />
          </IconButton>
        </Tooltip>
        {/** Enable God Mode */}
        <Tooltip title="전체 보기">
          <IconButton onClick={handleGodModeToggle}>
            <GodModeIcon
              sx={{
                color: props.game.godMode ? SIDE_COLOR.GREEN : "var(--fs-text)",
                width: 24,
                height: 24,
              }}
            />
          </IconButton>
        </Tooltip>
        {/** Open Simulation Logs*/}
        <Tooltip title="진행 기록">
          <IconButton onClick={props.openSimulationLogs}>
            <Message
              sx={{
                color: "var(--fs-text)",
                width: 24,
                height: 24,
              }}
            />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  const entitiesSection = () => {
    if (
      !entityFilterSelectedOptions.length ||
      !props.featureEntitiesPlotted.length ||
      !plottedSideFeatures.length ||
      !filteredEntityFeatures.length
    ) {
      return (
        <Box
          sx={{
            px: 1.2,
            py: 1,
            borderRadius: 1.5,
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(45, 214, 196, 0.1)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            표시할 항목이 없습니다.
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1} direction={"column"} sx={{ gap: "8px" }}>
        {props.mobileView && entityMenuButtons()}
        {filteredEntityFeatures.map((feature: FeatureEntityState) => (
          <Tooltip
            key={feature.id}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  이름: {feature.name}
                </Typography>
                {!feature.type.startsWith("reference") && (
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    유형: {getEntityTypeLabel(feature.type)}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  세력: {props.game.currentScenario.getSideName(feature.sideId)}
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              disableRipple
              sx={{
                cursor: "help",
                borderRadius: 1.5,
                border: "1px solid rgba(45, 214, 196, 0.1)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
              key={feature.id}
              value={feature.name}
            >
              <ListItemIcon>
                <EntityIcon type={feature.type} color={feature.sideColor} />
              </ListItemIcon>
              <ListItemText primary={feature.name} sx={{ mr: 1 }} />
              <Tooltip title={`${feature.name} 삭제`}>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`${feature.name} 삭제`}
                  onClick={(event) => handleDeleteFeatureEntity(event, feature)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </MenuItem>
          </Tooltip>
        ))}
      </Stack>
    );
  };

  return (
    <>
      <Dialog
        open={scenarioLaunchDialogOpen}
        onClose={() => setScenarioLaunchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            px: { xs: 2, sm: 3 },
            py: { xs: 2.5, sm: 3 },
            borderRadius: 4,
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Button
            variant="contained"
            onClick={startScenarioIn2dMode}
            sx={{
              flex: 1,
              minHeight: 92,
              fontSize: "1.3rem",
              fontWeight: 800,
              borderRadius: 3,
            }}
          >
            2D모드
          </Button>
          <Button
            variant="contained"
            onClick={startScenarioIn3dMode}
            sx={{
              flex: 1,
              minHeight: 92,
              fontSize: "1.3rem",
              fontWeight: 800,
              borderRadius: 3,
            }}
          >
            3D모드
          </Button>
        </Stack>
      </Dialog>

      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <MapToolbar
          variant="dense"
          sx={{
            ...toolbarStyle,
            overflow: "hidden",
            gap: 1,
            px: 1.25,
            py: 0.65,
          }}
          disableGutters
        >
          {props.drawerOpen ? (
            <Tooltip title="실행 도크 닫기">
              <IconButton
                color="inherit"
                aria-label="실행 도크 닫기"
                onClick={props.closeDrawer}
                edge="start"
                sx={{ color: COLOR_PALETTE.BLACK }}
              >
                <MenuOpenOutlinedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="실행 도크 열기">
              <IconButton
                color="inherit"
                aria-label="실행 도크 열기"
                onClick={props.openDrawer}
                edge="start"
                sx={{ color: COLOR_PALETTE.BLACK }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          <Stack
            direction={"row"}
            sx={{
              alignItems: "center",
              gap: compactToolbar ? 0.75 : 1.25,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: compactToolbar ? 0.75 : 1.25,
                pr: 0.5,
                minWidth: 0,
                flexShrink: 1,
              }}
            >
              <Box
                component="img"
                src="/main-logo.svg"
                alt={`${APP_DISPLAY_NAME} 로고`}
                sx={{
                  width: compactToolbar ? 34 : 38,
                  height: compactToolbar ? 34 : 38,
                  borderRadius: 0.75,
                  objectFit: "cover",
                  boxShadow: "0 0 18px rgba(45, 214, 196, 0.18)",
                  flexShrink: 0,
                }}
              />
              <Box
                sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}
              >
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    display: "flex",
                    fontWeight: 700,
                    color: COLOR_PALETTE.BLACK,
                    lineHeight: 1.05,
                    fontSize: compactToolbar ? "1rem" : undefined,
                  }}
                >
                  {APP_DISPLAY_NAME}
                </Typography>
                {!compactToolbar && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "var(--fs-text-soft)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    3D 시뮬레이션 중심 전장 체험
                  </Typography>
                )}
              </Box>
            </Box>
            {showEntityShortcutStrip && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    borderColor: COLOR_PALETTE.DARK_GRAY,
                    mx: 0.4,
                  }}
                />
                {entityMenuButtons()}
              </>
            )}
            {(showEntityShortcutStrip || !ultraCompactToolbar) && (
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{
                  borderColor: COLOR_PALETTE.DARK_GRAY,
                  mr: compactToolbar ? 0.8 : 1.6,
                }}
              />
            )}
            <Box
              sx={{
                px: 0.45,
                py: 0.35,
                borderRadius: 999,
                backgroundColor: quickAddMenuOpen
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(255, 255, 255, 0.1)",
                border: quickAddMenuOpen
                  ? "1px solid rgba(134, 255, 242, 0.26)"
                  : "1px solid rgba(134, 255, 242, 0.14)",
              }}
            >
              <Button
                variant="contained"
                onClick={handleQuickAddMenuToggle}
                startIcon={<AddBoxIcon />}
                endIcon={
                  !ultraCompactToolbar ? <KeyboardArrowDownIcon /> : undefined
                }
                sx={{
                  borderRadius: "999px",
                  border: quickAddMenuOpen
                    ? "1px solid rgba(134, 255, 242, 0.72)"
                    : "1px solid rgba(134, 255, 242, 0.3)",
                  backgroundColor: quickAddMenuOpen
                    ? "rgba(134, 255, 242, 0.96)"
                    : "rgba(53, 217, 198, 0.94)",
                  color: "#031114",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                  px: ultraCompactToolbar ? 1.15 : 1.45,
                  minWidth: ultraCompactToolbar ? "auto" : undefined,
                  boxShadow: quickAddMenuOpen
                    ? "0 0 0 1px rgba(134, 255, 242, 0.18), 0 0 24px rgba(53, 217, 198, 0.38)"
                    : "0 0 0 1px rgba(53, 217, 198, 0.14), 0 12px 24px rgba(53, 217, 198, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(134, 255, 242, 0.98)",
                    boxShadow:
                      "0 0 0 1px rgba(134, 255, 242, 0.18), 0 0 26px rgba(53, 217, 198, 0.44)",
                  },
                }}
              >
                {ultraCompactToolbar ? "자산" : "자산 종류"}
              </Button>
            </Box>
            {quickAddMenu()}
            {showSideSelect && (
              <SideSelect
                sides={props.game.currentScenario.sides}
                currentSideId={selectedSideId}
                onSideSelect={handleSideChange}
                openSideEditor={props.handleOpenSideEditor}
              />
            )}
            {showExperienceShortcut && (
              <Button
                variant="outlined"
                onClick={props.openScenario3dView}
                startIcon={<VisibilityOutlinedIcon />}
                sx={{
                  borderColor: "rgba(45, 214, 196, 0.28)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {compactToolbar ? "3D" : "공중 관측 3D"}
              </Button>
            )}
            {showExperienceShortcut && (
              <Button
                variant="contained"
                onClick={handleExperienceMenuToggle}
                startIcon={<ViewInArOutlinedIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
              >
                {compactToolbar ? "3D" : "3D 모드"}
              </Button>
            )}
            {experienceMenu()}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <LoginLogout />
        </MapToolbar>
      </AppBar>
      {/** Side Drawer */}
      <Drawer
        sx={toolbarDrawerStyle}
        variant="persistent"
        anchor="right"
        open={props.drawerOpen}
      >
        {/** Container/Wrapper */}
        <Container
          disableGutters
          sx={{
            backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            flexGrow: 1,
            borderLeft: "1px solid",
            borderLeftColor: COLOR_PALETTE.DARK_GRAY,
            overflow: "hidden",
          }}
        >
          <DrawerHeader />
          <Box
            sx={{ flexGrow: 1, minHeight: 0, overflowY: "auto", padding: 1 }}
          >
            <Stack>
              <Box
                sx={{
                  mx: 1,
                  mb: 0.9,
                  p: 1.15,
                  borderRadius: 2.6,
                  background:
                    "radial-gradient(circle at top left, rgba(53, 217, 198, 0.12) 0%, transparent 42%), linear-gradient(180deg, rgba(9, 24, 30, 0.98) 0%, rgba(6, 16, 21, 0.96) 100%)",
                  border: "1px solid rgba(45, 214, 196, 0.12)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {props.game.currentScenario.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.45,
                        fontSize: 11.8,
                        lineHeight: 1.45,
                        color: "text.secondary",
                      }}
                    >
                      {isEmptyScenario
                        ? "자산 배치 필요"
                        : `자산 ${scenarioAssetCount} · 임무 ${scenarioMissionCount} · 비행탄 ${scenarioWeaponsInFlight}`}
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.95,
                        px: 0.95,
                        py: 0.8,
                        borderRadius: 2.2,
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(45, 214, 196, 0.1)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11.2,
                          fontWeight: 700,
                          lineHeight: 1.45,
                          color:
                            commandPanelSummary.riskTone === "danger"
                              ? "#ffb0b0"
                              : commandPanelSummary.riskTone === "warning"
                                ? "var(--fs-sand)"
                                : "var(--fs-accent-soft)",
                        }}
                      >
                        {commandPanelSummary.summary}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={0.8} sx={{ flexShrink: 0 }}>
                    <Chip
                      size="small"
                      variant={
                        props.game.scenarioPaused ? "outlined" : "filled"
                      }
                      label={scenarioStatusLabel}
                      sx={{ flexShrink: 0 }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={commandPanelSummary.riskLabel}
                      sx={{
                        flexShrink: 0,
                        color:
                          commandPanelSummary.riskTone === "danger"
                            ? "#ffb0b0"
                            : commandPanelSummary.riskTone === "warning"
                              ? "var(--fs-sand)"
                              : "var(--fs-accent-soft)",
                        borderColor:
                          commandPanelSummary.riskTone === "danger"
                            ? "rgba(255, 122, 122, 0.26)"
                            : commandPanelSummary.riskTone === "warning"
                              ? "rgba(240, 187, 109, 0.28)"
                              : "rgba(45, 214, 196, 0.24)",
                        backgroundColor:
                          commandPanelSummary.riskTone === "danger"
                            ? "rgba(255, 122, 122, 0.08)"
                            : commandPanelSummary.riskTone === "warning"
                              ? "rgba(240, 187, 109, 0.08)"
                              : "rgba(45, 214, 196, 0.08)",
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 1,
                  py: 0.2,
                }}
              >
                <Stack
                  direction="row"
                  divider={<Divider orientation="vertical" flexItem />}
                  spacing={1}
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    px: 0.75,
                    py: 0.45,
                    borderRadius: 2.2,
                    backgroundColor: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(45, 214, 196, 0.08)",
                  }}
                >
                  <Tooltip title="새로 만들기">
                    <IconButton onClick={newScenario}>
                      <InsertDriveFileIcon
                        fontSize="medium"
                        sx={{ color: "var(--fs-text)" }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="불러오기">
                    <IconButton onClick={handleLoadScenarioIconClick}>
                      <UploadFileOutlinedIcon
                        fontSize="medium"
                        sx={{ color: "var(--fs-text)" }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      isAuthenticated
                        ? cloudScenarios.length > 4
                          ? "클라우드 저장 한도에 도달했습니다. 기존 시나리오를 삭제한 뒤 다시 저장하세요."
                          : "클라우드 저장"
                        : "로그인 후 저장할 수 있습니다."
                    }
                  >
                    <IconButton onClick={saveScenarioToCloud}>
                      <Save
                        fontSize="medium"
                        sx={{
                          color: isAuthenticated
                            ? "var(--fs-text)"
                            : "rgba(221, 255, 250, 0.3)",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      isAuthenticated ||
                      import.meta.env.VITE_ENV !== "production"
                        ? "파일 저장"
                        : "로그인 후 저장할 수 있습니다."
                    }
                  >
                    <IconButton onClick={exportScenario}>
                      <FileDownloadOutlinedIcon
                        fontSize="medium"
                        sx={{
                          color:
                            isAuthenticated ||
                            import.meta.env.VITE_ENV !== "production"
                              ? "var(--fs-text)"
                              : "rgba(221, 255, 250, 0.3)",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  {/* Scenario Name Edit Menu/Button  */}
                  <Tooltip title="이름 바꾸기">
                    <IconButton onClick={handleOpenScenarioEditNameMenu}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardActions>
              <Menu
                anchorEl={scenarioEditNameAnchorEl}
                open={Boolean(scenarioEditNameAnchorEl)}
                onClose={handleCloseScenarioEditNameMenu}
                slotProps={{
                  root: { sx: { ".MuiList-root": { padding: 0 } } },
                }}
              >
                <Typography variant="h6" sx={{ textAlign: "center", p: 1 }}>
                  이름 바꾸기
                </Typography>

                <form
                  onSubmit={handleScenarioNameSubmit}
                  style={{
                    width: "100%",
                  }}
                >
                  <Stack direction={"column"} spacing={1} sx={{ p: 1 }}>
                    <TextField
                      error={scenarioNameError}
                      helperText={
                        scenarioNameError
                          ? '한글/영문/숫자 사용 가능, ":,-" 허용, 최대 25자'
                          : ""
                      }
                      autoComplete="off"
                      id="scenario-name-text-field"
                      label="시나리오 이름"
                      sx={{ width: "100%" }}
                      onChange={handleScenarioNameChange}
                      defaultValue={scenarioName}
                    />
                    <Stack direction={"row"} spacing={1}>
                      <Button
                        disabled={
                          !scenarioName.length ||
                          props.game.currentScenario.name === scenarioName
                        }
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="small"
                      >
                        저장
                      </Button>
                      <Button
                        onClick={handleCloseScenarioEditNameMenu}
                        type="button"
                        fullWidth
                        variant="contained"
                        size="small"
                        color="error"
                      >
                        취소
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Menu>
              {presetScenarioSelectionMenu()}
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 1,
                  py: 0.35,
                }}
              >
                <Stack
                  direction="row"
                  divider={<Divider orientation="vertical" flexItem />}
                  spacing={1}
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    px: 0.75,
                    py: 0.3,
                    borderRadius: 2.2,
                    backgroundColor: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(45, 214, 196, 0.08)",
                  }}
                >
                  <Tooltip title="1단계 진행">
                    <Chip
                      variant="outlined"
                      label="1단계"
                      onClick={handleStepClick}
                    />
                  </Tooltip>
                  <Tooltip title="다시 시작">
                    <IconButton onClick={reloadScenario}>
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={"실행 취소"}>
                    <IconButton onClick={handleUndo}>{<Undo />}</IconButton>
                  </Tooltip>
                  <Tooltip title={!scenarioPaused ? "일시정지" : "실행"}>
                    <IconButton onClick={handlePlayClick}>
                      {!scenarioPaused ? <Pause /> : <PlayArrow />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="속도 바꾸기">
                    <Chip
                      onClick={props.toggleScenarioTimeCompressionOnClick}
                      variant="outlined"
                      label={`속도 ${props.scenarioTimeCompression}x`}
                      sx={{
                        minWidth: "82px",
                      }}
                    />
                  </Tooltip>
                </Stack>
              </CardActions>
            </Stack>
            {/** Toolbar Feature Controls Dropdown/List Section */}
            <List
              sx={{
                py: 0,
                width: "100%",
                backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
              component="nav"
              aria-labelledby="feature-controls-dropdown-list"
              subheader={
                <ListSubheader
                  color="inherit"
                  component="div"
                  id="feature-controls-dropdown-list"
                  sx={{
                    ...visuallyHidden, // screen reader only
                    backgroundColor: "transparent",
                  }}
                >
                  기능
                </ListSubheader>
              }
            >
              <ToolbarCollapsible
                title="기록 / 재생"
                headerBadges={sectionHeaderBadges.recording}
                prependIcon={RadioButtonCheckedIcon}
                content={recordingSection()}
                open={false}
              />
              <ToolbarCollapsible
                title="자산 배치"
                headerBadges={sectionHeaderBadges.assets}
                prependIcon={DocumentScannerOutlinedIcon}
                content={entitiesSection()}
                enableFilter={true}
                openSignal={props.assetPlacementOpenSignal}
                filterProps={{
                  options: [
                    { label: "항공기", value: "aircraft" },
                    { label: "기지", value: "airbase" },
                    { label: "지상군", value: "army" },
                    { label: "지상 무기체계", value: "facility" },
                    { label: "함정", value: "ship" },
                    { label: "참조점", value: "referencePoint" },
                  ],
                  onApplyFilterOptions: (selectedOptions: string[]) => {
                    const sideIds = props.game.currentScenario.sides.map(
                      (side) => side.id
                    );
                    const selectedSideIds =
                      entityFilterSelectedOptions.filter((item) =>
                        sideIds.includes(item)
                      ) || [];
                    const updatedOptions = [
                      ...selectedSideIds,
                      ...selectedOptions,
                    ];
                    setEntityFilterSelectedOptions(updatedOptions);
                  },
                }}
                open={isEmptyScenario}
              />
              <ToolbarCollapsible
                title="화력 작전"
                subtitle={focusFireDockStage.title}
                headerBadges={sectionHeaderBadges.focusFire}
                prependIcon={RadioButtonCheckedIcon}
                content={focusFireSection()}
                open={focusFireSectionOpen}
              />
              <ToolbarCollapsible
                title="임무"
                headerBadges={sectionHeaderBadges.mission}
                prependIcon={AirlineStopsOutlinedIcon}
                content={missionSection()}
                appendIcon={AddBoxIcon}
                appendIconProps={{
                  tooltipProps: {
                    title: "임무 추가",
                  },
                  onClick: () => {
                    props.toggleMissionCreator();
                  },
                }}
                open={missionSectionOpen}
              />
            </List>
          </Box>
          <ArmyGptPanel
            currentSideName={currentSideName}
            scenarioAssetCount={scenarioAssetCount}
            scenarioMissionCount={scenarioMissionCount}
            scenarioWeaponsInFlight={scenarioWeaponsInFlight}
            briefingCards={armyGptBriefingCards}
            messages={messages}
            inputValue={inputValue}
            isInputFocused={isChatInputFocused}
            isLoading={isLoading}
            chatMessagesContainerRef={chatMessagesContainerRef}
            onInputChange={setInputValue}
            onFocusChange={setIsChatInputFocused}
            onSendMessage={handleSendMessage}
          />
        </Container>
      </Drawer>
      <AssetPlacementPreviewDialog
        open={Boolean(assetPlacementPreview)}
        preview={assetPlacementPreview}
        onClose={handleAssetPlacementPreviewClose}
        onConfirm={handleAssetPlacementPreviewConfirm}
      />
    </>
  );
}
