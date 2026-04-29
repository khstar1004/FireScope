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
import {
  APP_DISPLAY_NAME,
  APP_DRAWER_WIDTH,
} from "@/utils/constants";
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
import combatDemo1 from "@/scenarios/combatDemo1";
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
  shouldRunScenarioImmediatelyAfterLaunchModeSelection,
  shouldPromptScenarioLaunchModeSelection,
  type ScenarioLaunchMode,
} from "@/gui/map/scenarioLaunchMode";

const GUIDE_RAIL_SELECTION_STORAGE_KEYS = {
  mannedAircraft: "vista.guideRail.selection.mannedAircraft",
  drone: "vista.guideRail.selection.drone",
  airbase: "vista.guideRail.selection.airbase",
  facility: "vista.guideRail.selection.facility",
  armor: "vista.guideRail.selection.armor",
  ship: "vista.guideRail.selection.ship",
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

import { useToolbarRenderSections } from "@/gui/map/toolbar/hooks/useToolbarRenderSections";
import ToolbarView from "@/gui/map/toolbar/view/ToolbarView";

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
        ? "vista_scenario"
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
      case "combat_demo_1":
        scenarioJson = combatDemo1;
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
          presetScenarioName === "combat_demo_1" ||
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
    setScenarioPaused(
      !shouldRunScenarioImmediatelyAfterLaunchModeSelection("3d")
    );
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

  const toolbarSectionContext = {
    Box, Button, COLOR_PALETTE,
    Chip, ClearIcon, Cloud,
    DEFAULT_ICON_COLOR_FILTER, Dba, Delete,
    Divider, EntityIcon, EraserIcon,
    FileReader, GodModeIcon, IconButton,
    ListItemIcon, ListItemText, ListSubheader,
    Menu, MenuItem, Message,
    PRIORITY_ARTILLERY_BASE_OPTIONS, React, RecordingPlayer,
    SELECTED_ICON_COLOR_FILTER, SIDE_COLOR, Stack,
    Storage, Tooltip, Typography,
    UploadFileOutlinedIcon, airbaseClassMenuOpen, airbaseDb,
    airbaseIconAnchorEl, aircraftClassMenuOpen, aircraftDb,
    aircraftIconAnchorEl, assetPlacementPreview, buildAdaptiveArtilleryPresetOptions,
    buildBaseSelectionAirbaseOptions, buildFocusFireInsight, buildPriorityQuickAddAirbaseOptions,
    buildSafeDownloadTimestamp, cloudScenarios, deleteScenarioFromCloud,
    downloadTextFile, droneAircraftDb, droneClassMenuOpen,
    droneIconAnchorEl, entityFilterSelectedOptions, experienceAnchorEl,
    experienceMenuOpen, facilityDb, formatSecondsToString,
    getDisplayName, getEntityTypeLabel, handleAirbaseClose,
    handleAirbaseIconClick, handleAircraftIconClick, handleAircraftIconClose,
    handleDeleteFeatureEntity, handleDroneIconClick, handleDroneIconClose,
    handleEntitySideChange, handleExperienceMenuClose, handleLoadScenarioIconClose,
    handlePlayClick, handleQuickAddMenuClose, handleRecordScenarioClick,
    handleReferencePointIconClick, handleSamIconClick, handleSamIconClose,
    handleShipIconClick, handleShipIconClose, handleStepClick,
    handleTankIconClick, handleTankIconClose, handleUndo,
    handleUnitClassSelect, handleUnitDbToolsIconClick, handleUnitDbToolsIconClose,
    isChatInputFocused, isDroneAircraftClassName, isScenarioEmptyForOnboarding,
    isTankFacilityClassName, loadCloudScenario, loadPresetScenario,
    loadScenarioAnchorEl, presetScenarioSelectionMenuOpen, props,
    quickAddAnchorEl, quickAddMenuOpen, recordingScenario,
    reloadScenario, resolveFocusFireDockStage, samClassMenuOpen,
    samIconAnchorEl, scenarioEditNameAnchorEl, scenarioLaunchDialogOpen,
    selectedAirbaseUnitClass, selectedAircraftUnitClass, selectedArmorUnitClass,
    selectedBaseSelectionKey, selectedDroneUnitClass, selectedSamUnitClass,
    selectedShipUnitClass, selectedSideId, setScenarioPaused,
    setUnitDbContext, setUnitDbToolsIconAnchorEl, shipClassMenuOpen,
    shipDb, shipIconAnchorEl, sortBaseSelectionOptionsByDistance,
    strategicScenarioPresets, tankClassMenuOpen, tankFacilityDb,
    tankIconAnchorEl, toSelectionOptions, toastContext,
    unitDbContext, unitDbToolsIconAnchorEl, unitDbToolsMenuOpen,
  };
  const toolbarSections = useToolbarRenderSections(toolbarSectionContext);
  const {
    ScenarioDb, armyGptBriefingCards, baseSelectionAirbaseOptions,
    buildQuickAddSections, commandPanelSummary, currentSideId,
    currentSideMissionCount, currentSideName, currentSideOperationalFeatureCount,
    currentlySelectedSideIds, entitiesSection, entityFilterTypeOptions,
    entityMenuButtons, experienceMenu, experienceSections,
    filteredEntityFeatures, focusFireDockStage, focusFireInsight,
    focusFireRiskTone, focusFireSection, focusFireSectionOpen,
    focusFireSummary, handleEraserModeToggle, handleGodModeToggle,
    isEmptyScenario, keyboardEventHandler, missionSection,
    missionSectionOpen, plottedSideFeatures, presetScenarioSelectionMenu,
    quickAddMenu, quickAddSections, recommendedArtilleryBaseOptions,
    recordingSection, scenarioAssetCount, scenarioMissionCount,
    scenarioSideIds, scenarioStatusLabel, scenarioWeaponsInFlight,
    sectionHeaderBadges, selectedEntitySideIds, selectedEntityTypes,
    sideSelectCurrentSideId,
  } = toolbarSections;
  const toolbarViewProps = {
    APP_DISPLAY_NAME, AddBoxIcon, AirlineStopsOutlinedIcon,
    AppBar, ArmyGptPanel, AssetPlacementPreviewDialog,
    Box, Button, COLOR_PALETTE,
    CardActions, Chip, Container,
    Dialog, Divider, DocumentScannerOutlinedIcon,
    Drawer, DrawerHeader, EditIcon,
    FileDownloadOutlinedIcon, IconButton, InsertDriveFileIcon,
    KeyboardArrowDownIcon, List, ListSubheader,
    LoginLogout, MapToolbar, Menu,
    MenuIcon, MenuOpenOutlinedIcon, Pause,
    PlayArrow, RadioButtonCheckedIcon, RestartAltIcon,
    Save, SideSelect, Stack,
    TextField, ToolbarCollapsible, Tooltip,
    Typography, Undo, UploadFileOutlinedIcon,
    ViewInArOutlinedIcon, VisibilityOutlinedIcon, armyGptBriefingCards,
    assetPlacementPreview, chatMessagesContainerRef, cloudScenarios,
    commandPanelSummary, compactToolbar, currentSideName,
    entitiesSection, entityFilterSelectedOptions, entityMenuButtons,
    experienceMenu, exportScenario, focusFireDockStage,
    focusFireSection, focusFireSectionOpen, handleAssetPlacementPreviewClose,
    handleAssetPlacementPreviewConfirm, handleCloseScenarioEditNameMenu, handleExperienceMenuToggle,
    handleLoadScenarioIconClick, handleOpenScenarioEditNameMenu, handlePlayClick,
    handleQuickAddMenuToggle, handleScenarioNameChange, handleScenarioNameSubmit,
    handleSendMessage, handleSideChange, handleStepClick,
    handleUndo, inputValue, isAuthenticated,
    isChatInputFocused, isEmptyScenario, isLoading,
    messages, missionSection,
    missionSectionOpen, newScenario, presetScenarioSelectionMenu,
    props, quickAddMenu, quickAddMenuOpen,
    recordingSection, reloadScenario, saveScenarioToCloud,
    scenarioAssetCount, scenarioEditNameAnchorEl, scenarioLaunchDialogOpen,
    scenarioMissionCount, scenarioName, scenarioNameError,
    scenarioPaused, scenarioStatusLabel, scenarioWeaponsInFlight,
    sectionHeaderBadges, setEntityFilterSelectedOptions, setInputValue,
    setIsChatInputFocused, setScenarioLaunchDialogOpen, showEntityShortcutStrip,
    showExperienceShortcut, showSideSelect, sideSelectCurrentSideId,
    startScenarioIn2dMode, startScenarioIn3dMode, toolbarDrawerStyle,
    toolbarStyle, ultraCompactToolbar, visuallyHidden,
  };

  return <ToolbarView {...toolbarViewProps} />;
}
