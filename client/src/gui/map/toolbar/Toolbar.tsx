import React, { useContext, useEffect, useRef, useState } from "react";
import {
  AppBar,
  Button,
  CardActions,
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
import SendIcon from "@mui/icons-material/Send";
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
import CurrentActionContextDisplay from "@/gui/map/toolbar/CurrentActionContextDisplay";
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
import HealthCheck from "@/gui/map/toolbar/HealthCheck";
import {
  SetUnitDbContext,
  UnitDbContext,
} from "@/gui/contextProviders/contexts/UnitDbContext";
import { useChatbot } from "@/gui/agent/chatbot";
import { buildFocusFireInsight } from "@/gui/analysis/operationInsight";
import { isScenarioEmptyForOnboarding } from "@/gui/map/scenarioOnboarding";
import { getDisplayName, getEntityTypeLabel } from "@/utils/koreanCatalog";
import { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import {
  isDroneAircraftClassName,
  isTankFacilityClassName,
  ToolbarEntityType,
} from "@/utils/assetTypeCatalog";
import Dba from "@/game/db/Dba";
import FireRecommendationPanel from "@/gui/fires/FireRecommendationPanel";

interface ToolBarProps {
  mobileView: boolean;
  drawerOpen: boolean;
  featureEntitiesPlotted: FeatureEntityState[];
  deleteFeatureEntity: (feature: FeatureEntityState) => void;
  addAircraftOnClick: (unitClassName: string) => void;
  addFacilityOnClick: (unitClassName: string) => void;
  addAirbaseOnClick: (
    coordinates: number[],
    name?: string,
    realCoordinates?: number[]
  ) => void;
  addShipOnClick: (unitClassName: string) => void;
  addReferencePointOnClick: () => void;
  playOnClick: () => void;
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
  openDrawer: () => void;
  closeDrawer: () => void;
  openRlLabPage: () => void;
  openFlightSimPage: (craft?: string) => void;
  openImmersiveExperiencePage: (profile: ImmersiveExperienceProfile) => void;
  toggleFocusFireMode: () => void;
  armFocusFireObjectiveSelection: () => void;
  clearFocusFireObjective: () => void;
  openBattleSpectator: () => void;
  openFocusFireAirwatch: () => void;
}

const scenarioNameRegex: RegExp = /^[a-zA-Z0-9가-힣 :-]{1,25}$/;

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
  marginTop: "-12px",
}));

const toolbarDrawerStyle = {
  backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
  width: APP_DRAWER_WIDTH,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: APP_DRAWER_WIDTH + 13,
    boxSizing: "border-box",
    overflow: "hidden",
    boxShadow: "18px 0 36px rgba(0, 0, 0, 0.42)",
  },
};

const toolbarStyle = {
  backgroundColor: "rgba(6, 22, 29, 0.78)",
  backdropFilter: "blur(18px)",
  borderBottom: "1px solid",
  borderBottomColor: "rgba(45, 214, 196, 0.18)",
  boxShadow: "0 18px 34px rgba(0, 0, 0, 0.24)",
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
  description: string;
  onClick?: () => void;
}

interface QuickAddSection {
  title: string;
  items: QuickAddEntry[];
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

export default function Toolbar(props: Readonly<ToolBarProps>) {
  // Hooks and State
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const compactToolbar = useMediaQuery("(max-width:1280px)");
  const ultraCompactToolbar = useMediaQuery("(max-width:960px)");
  const showEntityShortcutStrip = !props.mobileView && !compactToolbar;
  const showSideSelect = !ultraCompactToolbar;
  const showExperienceShortcut = !ultraCompactToolbar;
  const showRlLabShortcut = !ultraCompactToolbar;
  const showHealthCheck = !compactToolbar;
  const [cloudScenarios, setCloudScenarios] = useState<CloudScenario[]>([]);
  const getCloudScenarios = async () => {
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
  };
  useEffect(() => {
    if (!isAuthenticated) return;
    getCloudScenarios();
  }, [isAuthenticated]);
  const toastContext = useContext(ToastContext);
  const unitDbContext = useContext(UnitDbContext);
  const setUnitDbContext = useContext(SetUnitDbContext);
  const aircraftDb = unitDbContext.getAircraftDb();
  const airbaseDb = unitDbContext.getAirbaseDb();
  const facilityDb = unitDbContext.getFacilityDb();
  const shipDb = unitDbContext.getShipDb();
  const droneAircraftDb = aircraftDb.filter((aircraft) =>
    isDroneAircraftClassName(aircraft.className)
  );
  const tankFacilityDb = facilityDb.filter((facility) =>
    isTankFacilityClassName(facility.className)
  );
  const [selectedSideId, setSelectedSideId] = useState<string>(
    props.scenarioCurrentSideId
  );
  useEffect(() => {
    setSelectedSideId(props.scenarioCurrentSideId);
    handleEntitySideChange(
      props.game.godMode
        ? props.game.currentScenario.sides.map((side) => side.id)
        : [props.scenarioCurrentSideId]
    );
  }, [props.scenarioCurrentSideId]);
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

  const [selectedAircraftUnitClass, setSelectedAircraftUnitClass] =
    useState<string>(aircraftDb[0]?.className ?? "");
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
    useState<string>(airbaseDb[0]?.name ?? "");
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

  const [selectedSamUnitClass, setSelectedSamUnitClass] = useState<string>(
    facilityDb[0]?.className ?? ""
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
    shipDb[0]?.className ?? ""
  );
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

  const handleEntitySideChange = (newSelectedSides: string[]) => {
    setEntityFilterSelectedOptions((prevItems: string[]) => {
      const nonSideFilters = [
        "aircraft",
        "airbase",
        "ship",
        "facility",
        "referencePoint",
      ];
      const filtersWithNewSide = prevItems.filter((item) =>
        nonSideFilters.includes(item)
      );
      return [...filtersWithNewSide, ...newSelectedSides];
    });
  };

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
          presetScenarioName === "focused_training_demo" ||
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

  const handlePlayClick = () => {
    if (scenarioPaused) {
      setScenarioPaused(false);
      props.playOnClick();
    } else {
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
    unitClassName: string
  ) => {
    switch (unitType) {
      case "aircraft":
        setSelectedAircraftUnitClass(unitClassName);
        props.addAircraftOnClick(unitClassName);
        break;
      case "airbase": {
        setSelectedAirbaseUnitClass(unitClassName);
        const airbaseTemplate = unitDbContext
          .getAirbaseDb()
          .find((airbase) => airbase.name === unitClassName);
        props.addAirbaseOnClick([0, 0], airbaseTemplate?.name, [
          airbaseTemplate?.longitude ?? 0,
          airbaseTemplate?.latitude ?? 0,
        ]);
        break;
      }
      case "facility":
        setSelectedSamUnitClass(unitClassName);
        props.addFacilityOnClick(unitClassName);
        break;
      case "ship":
        setSelectedShipUnitClass(unitClassName);
        props.addShipOnClick(unitClassName);
        break;
      default:
        break;
    }
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
    const koreaAirbasePattern =
      /Seoul Air Base|Seosan Air Base|Cheongju Air Base|Sacheon Air Base|Osan Air Base|Kunsan Air Base/i;

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
    const toAirbaseEntry = (
      name: string,
      description: string
    ): QuickAddEntry => ({
      key: `airbase-${name}`,
      label: getDisplayName(name),
      entityType: "airbase",
      unitType: "airbase",
      value: name,
      description,
    });

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
          ...airbaseDb
            .filter(
              (airbase) =>
                koreaAirbasePattern.test(airbase.name) ||
                /Al Udeid|Andersen|Kadena|Osan|Kunsan/i.test(airbase.name)
            )
            .map((airbase) =>
              toAirbaseEntry(
                airbase.name,
                koreaAirbasePattern.test(airbase.name)
                  ? "주요 한국 공군기지 배치"
                  : "전진/해외 기지 배치"
              )
            ),
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

  const experienceSections = [
    {
      title: "항공 시뮬레이터",
      items: [
        {
          key: "experience-jet",
          label: "전투기 3D 시뮬레이터",
          description: "현재 시점에서 제트 전투기 비행 시뮬레이션",
          entityType: "aircraft" as const,
          onClick: () => props.openFlightSimPage("jet"),
        },
        {
          key: "experience-drone",
          label: "드론 3D 시뮬레이터",
          description: "저속·저고도 드론 시점 비행 시뮬레이션",
          entityType: "aircraft" as const,
          onClick: () => props.openFlightSimPage("drone"),
        },
        {
          key: "experience-air-wing",
          label: "항공자산 3D 시뮬레이터",
          description: "전투기, Apache, Black Hawk, 드론 모델 전환 시뮬레이션",
          entityType: "aircraft" as const,
          onClick: () => props.openImmersiveExperiencePage("base"),
        },
      ],
    },
    {
      title: "전장 시뮬레이터",
      items: [
        {
          key: "experience-battle-spectator",
          label: "전장 관전자 3D 시뮬레이터",
          description: "현재 시나리오를 3D 지형 위에서 실시간 관전",
          entityType: "facility" as const,
          onClick: props.openBattleSpectator,
        },
        {
          key: "experience-ground",
          label: "지상 기동 3D 시뮬레이터",
          description: "전차·장갑차 계열 시점 전술 시뮬레이션",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("ground"),
        },
        {
          key: "experience-fires",
          label: "화력 운용 3D 시뮬레이터",
          description: "포병·미사일 발사축 시뮬레이션",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("fires"),
        },
        {
          key: "experience-defense",
          label: "방공 체계 3D 시뮬레이터",
          description: "탐지·추적·요격 레이더 HUD 시뮬레이션",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("defense"),
        },
        {
          key: "experience-maritime",
          label: "함정 운용 3D 시뮬레이터",
          description:
            "구축함·항모·잠수함 모델을 바꿔보는 해상 전력 시뮬레이션",
          entityType: "ship" as const,
          onClick: () => props.openImmersiveExperiencePage("maritime"),
        },
        {
          key: "experience-base",
          label: "기지 운영 3D 시뮬레이터",
          description: "전투기·헬기·드론 모델을 바꿔보는 기지 운용 시뮬레이션",
          entityType: "airbase" as const,
          onClick: () => props.openImmersiveExperiencePage("base"),
        },
      ],
    },
  ];
  const focusFireSummary = props.game.getFocusFireSummary();
  const focusFireInsight = buildFocusFireInsight(focusFireSummary);
  const focusFireRecommendation = focusFireSummary.recommendation;
  const focusFireRerankerState = props.game.getFocusFireRerankerState();
  const focusFireRecommendationTelemetry =
    props.game.getFocusFireRecommendationTelemetry(
      props.game.currentSideId || undefined
    );
  const focusFireRecommendationTelemetryCount =
    focusFireRecommendationTelemetry.length;
  const focusFireFeedbackCount = focusFireRecommendationTelemetry.filter(
    (entry) => entry.feedbackOptionLabel
  ).length;
  const focusFireTrainableCount = focusFireRecommendationTelemetry.filter(
    (entry) =>
      entry.options.length >= 2 &&
      Boolean(
        entry.feedbackOptionLabel ||
          (!entry.rerankerApplied && entry.recommendedOptionLabel)
      )
  ).length;
  const focusFireFeedbackOptionLabel =
    focusFireRecommendation &&
    focusFireSummary.objectiveLatitude != null &&
    focusFireSummary.objectiveLongitude != null
      ? props.game.getFocusFireRecommendationFeedbackLabel(
          {
            name: focusFireSummary.objectiveName ?? "집중포격 목표",
            latitude: focusFireSummary.objectiveLatitude,
            longitude: focusFireSummary.objectiveLongitude,
          },
          props.game.focusFireOperation.sideId,
          focusFireRecommendation.primaryTargetId
        )
      : null;
  const showEmptyScenarioGuide = isScenarioEmptyForOnboarding(
    props.game.currentScenario
  );
  const [focusFireDesiredEffectInput, setFocusFireDesiredEffectInput] =
    useState("");
  const [, setFocusFireAiRevision] = useState(0);

  useEffect(() => {
    setFocusFireDesiredEffectInput(
      focusFireSummary.desiredEffectOverride != null
        ? `${focusFireSummary.desiredEffectOverride}`
        : ""
    );
  }, [focusFireSummary.desiredEffectOverride]);

  const applyFocusFireDesiredEffectOverride = () => {
    if (!focusFireSummary.enabled) {
      toastContext?.addToast("집중포격 모드를 먼저 켜세요.", "error");
      return;
    }

    const trimmedValue = focusFireDesiredEffectInput.trim();
    if (!trimmedValue) {
      props.game.setFocusFireDesiredEffectOverride(null);
      setFocusFireDesiredEffectInput("");
      toastContext?.addToast("요망 효과를 자동 산정값으로 되돌렸습니다.");
      return;
    }

    const parsedValue = Number(trimmedValue);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      toastContext?.addToast(
        "요망 효과는 0보다 큰 숫자로 입력하세요.",
        "error"
      );
      return;
    }

    const appliedValue =
      props.game.setFocusFireDesiredEffectOverride(parsedValue);
    if (appliedValue == null) {
      toastContext?.addToast(
        "요망 효과를 적용할 수 없습니다. 세력과 집중포격 상태를 확인하세요.",
        "error"
      );
      return;
    }

    setFocusFireDesiredEffectInput(`${appliedValue}`);
    toastContext?.addToast(
      `요망 효과 ${appliedValue.toFixed(1)}을 반영했습니다.`
    );
  };

  const resetFocusFireDesiredEffectOverride = () => {
    props.game.setFocusFireDesiredEffectOverride(null);
    setFocusFireDesiredEffectInput("");
    toastContext?.addToast("요망 효과를 자동 산정값으로 전환했습니다.");
  };

  const bumpFocusFireAiRevision = () => {
    setFocusFireAiRevision((previousRevision) => previousRevision + 1);
  };

  const handleFocusFireRerankerToggle = () => {
    const enabled = props.game.setFocusFireRerankerEnabled(
      !focusFireRerankerState.enabled
    );
    bumpFocusFireAiRevision();
    toastContext?.addToast(`AI 재정렬: ${enabled ? "켜짐" : "꺼짐"}`);
  };

  const handleFocusFireRerankerTrain = () => {
    if (focusFireTrainableCount === 0) {
      toastContext?.addToast(
        "AI 학습에는 운용자 피드백 또는 규칙 기반 추천 기록이 더 필요합니다.",
        "error"
      );
      return;
    }

    const result = props.game.trainFocusFireRerankerModel();
    if (result.summary.recordsUsed === 0) {
      toastContext?.addToast(
        "학습 가능한 기록이 없어 모델을 업데이트하지 않았습니다.",
        "error"
      );
      return;
    }
    bumpFocusFireAiRevision();
    toastContext?.addToast(
      `AI 재정렬 모델을 학습했습니다. 비교 ${result.summary.comparisons}건, 기록 ${result.summary.recordsUsed}건, 피드백 ${result.summary.operatorFeedbackRecords}건, 신뢰도 ${Math.round(
        props.game.getFocusFireRerankerState().confidenceScore * 100
      )}%.`
    );
  };

  const handleFocusFireRerankerReset = () => {
    props.game.resetFocusFireRerankerModel();
    bumpFocusFireAiRevision();
    toastContext?.addToast("AI 재정렬 모델을 초기화했습니다.");
  };

  const handleExportFocusFireTelemetryJsonl = () => {
    const content = props.game.exportFocusFireRecommendationTelemetryJsonl(
      props.game.currentSideId || undefined
    );
    if (!content.trim()) {
      toastContext?.addToast("내보낼 추천 데이터가 없습니다.", "error");
      return;
    }

    downloadTextFile(
      `focus_fire_recommendations_${buildSafeDownloadTimestamp()}.jsonl`,
      content,
      "text/plain"
    );
    toastContext?.addToast("추천 데이터 JSONL을 내보냈습니다.");
  };

  const handleExportFocusFireTelemetryCsv = () => {
    const content = props.game.exportFocusFireRecommendationTelemetryCsv(
      props.game.currentSideId || undefined
    );
    if (!content.trim()) {
      toastContext?.addToast("내보낼 추천 데이터가 없습니다.", "error");
      return;
    }

    downloadTextFile(
      `focus_fire_recommendations_${buildSafeDownloadTimestamp()}.csv`,
      content,
      "text/csv"
    );
    toastContext?.addToast("추천 데이터 CSV를 내보냈습니다.");
  };

  const handleExportFocusFireRerankerModel = () => {
    const content = props.game.exportFocusFireRerankerModel();
    if (!content.trim()) {
      toastContext?.addToast("내보낼 AI 모델이 없습니다.", "error");
      return;
    }

    downloadTextFile(
      `focus_fire_reranker_model_${buildSafeDownloadTimestamp()}.json`,
      content,
      "application/json"
    );
    toastContext?.addToast("집중포격 AI 모델 JSON을 내보냈습니다.");
  };

  const handleImportFocusFireRerankerModel = () => {
    const input = document.createElement("input");
    input.style.display = "none";
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      input.remove();
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (readerEvent) => {
        try {
          const modelJson = readerEvent.target?.result as string;
          const result = props.game.importFocusFireRerankerModel(modelJson);
          bumpFocusFireAiRevision();
          toastContext?.addToast(
            `AI 모델 v${result.model.version} (${result.model.source})을 불러왔습니다.`,
            "success"
          );
        } catch (_error) {
          toastContext?.addToast(
            "AI 모델 JSON 형식이 올바르지 않아 불러오지 못했습니다.",
            "error"
          );
        }
      };
      reader.onerror = () => {
        reader.abort();
        toastContext?.addToast("AI 모델 파일을 읽지 못했습니다.", "error");
      };
    };
    input.click();
  };

  const handleRecordFocusFireFeedback = (optionLabel: string) => {
    if (
      !focusFireRecommendation ||
      focusFireSummary.objectiveLatitude == null ||
      focusFireSummary.objectiveLongitude == null
    ) {
      toastContext?.addToast(
        "현재 추천안이 없어 피드백을 기록할 수 없습니다.",
        "error"
      );
      return;
    }

    const record = props.game.setFocusFireRecommendationFeedback(
      optionLabel,
      {
        name: focusFireSummary.objectiveName ?? "집중포격 목표",
        latitude: focusFireSummary.objectiveLatitude,
        longitude: focusFireSummary.objectiveLongitude,
      },
      props.game.focusFireOperation.sideId,
      focusFireRecommendation
    );
    if (!record) {
      toastContext?.addToast("피드백 기록에 실패했습니다.", "error");
      return;
    }

    bumpFocusFireAiRevision();
    toastContext?.addToast(
      `${optionLabel}을(를) 운용자 학습 기준으로 기록했습니다.`
    );
  };

  const focusFireSection = () => (
    <Stack spacing={1.2} sx={{ p: 1.5 }}>
      <Box
        sx={{
          p: 1.2,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(45, 214, 196, 0.12)",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
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

        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          목표: {focusFireSummary.objectiveName ?? "미지정"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.45, color: "text.secondary" }}>
          화력 포대 {focusFireSummary.artilleryCount} / 기갑{" "}
          {focusFireSummary.armorCount} / 항공 {focusFireSummary.aircraftCount}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.45, color: "text.secondary" }}>
          비행 중 탄체: {focusFireSummary.weaponsInFlight}
        </Typography>
      </Box>

      <Box
        sx={{
          p: 1.2,
          borderRadius: 2,
          background:
            "linear-gradient(180deg, rgba(14, 40, 46, 0.98) 0%, rgba(8, 23, 28, 0.96) 100%)",
          border: "1px solid rgba(45, 214, 196, 0.24)",
          boxShadow:
            "0 18px 34px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(134, 255, 242, 0.06)",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 700 }}>화력 추천</Typography>
          <Chip
            size="small"
            variant="filled"
            label={focusFireRecommendation ? "권장안 준비" : "분석 대기"}
          />
        </Stack>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 1, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <TextField
            id="focus-fire-desired-effect-input"
            size="small"
            type="number"
            label="요망 효과 입력"
            value={focusFireDesiredEffectInput}
            onChange={(event) =>
              setFocusFireDesiredEffectInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFocusFireDesiredEffectOverride();
              }
            }}
            inputProps={{ min: 0.1, step: 0.1 }}
            disabled={!focusFireSummary.enabled}
            sx={{
              mb: 0,
              minWidth: 140,
              flex: 1,
              bgcolor: "rgba(255,255,255,0.04)",
            }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={applyFocusFireDesiredEffectOverride}
            disabled={!focusFireSummary.enabled}
          >
            반영
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={resetFocusFireDesiredEffectOverride}
            disabled={
              !focusFireSummary.enabled &&
              focusFireSummary.desiredEffectOverride == null
            }
          >
            자동
          </Button>
        </Stack>
        <Typography sx={{ mt: 0.7, fontSize: 12, color: "text.secondary" }}>
          자동 산정값:{" "}
          {focusFireRecommendation
            ? focusFireRecommendation.desiredEffectEstimated.toFixed(1)
            : "산출 대기"}{" "}
          · 현재 기준:{" "}
          {focusFireRecommendation?.desiredEffectIsUserDefined
            ? "사용자 입력"
            : "자동 산정"}
        </Typography>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 1, alignItems: "center", flexWrap: "wrap" }}
        >
          <Chip
            size="small"
            color={focusFireRerankerState.enabled ? "success" : "default"}
            label={
              focusFireRerankerState.enabled ? "AI 재정렬 ON" : "AI 재정렬 OFF"
            }
          />
          <Chip
            size="small"
            variant="outlined"
            label={`데이터 ${focusFireRecommendationTelemetryCount}건`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`피드백 ${focusFireFeedbackCount}건`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`학습 가능 ${focusFireTrainableCount}건`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`모델 ${focusFireRerankerState.model.source}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`신뢰도 ${Math.round(
              focusFireRerankerState.confidenceScore * 100
            )}%`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`v${focusFireRerankerState.model.version} / 표본 ${focusFireRerankerState.model.sampleCount}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`운용자 ${focusFireRerankerState.model.operatorFeedbackCount} / 규칙 ${focusFireRerankerState.model.ruleSeedCount}`}
          />
        </Stack>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 1, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <Button
            size="small"
            variant="contained"
            onClick={handleFocusFireRerankerToggle}
          >
            {focusFireRerankerState.enabled ? "AI 끄기" : "AI 켜기"}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleFocusFireRerankerTrain}
          >
            AI 학습
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={handleFocusFireRerankerReset}
          >
            AI 초기화
          </Button>
        </Stack>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 0.6, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={handleExportFocusFireRerankerModel}
          >
            모델 JSON
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleImportFocusFireRerankerModel}
          >
            모델 불러오기
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleExportFocusFireTelemetryJsonl}
          >
            JSONL
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleExportFocusFireTelemetryCsv}
          >
            CSV
          </Button>
        </Stack>
        <FireRecommendationPanel
          recommendation={focusFireRecommendation}
          objectiveName={focusFireSummary.objectiveName}
          objectiveLatitude={focusFireSummary.objectiveLatitude}
          objectiveLongitude={focusFireSummary.objectiveLongitude}
          feedbackOptionLabel={focusFireFeedbackOptionLabel}
          onRecordFeedback={handleRecordFocusFireFeedback}
        />
      </Box>

      <Box
        sx={{
          p: 1.2,
          borderRadius: 2,
          background:
            "linear-gradient(180deg, rgba(10, 26, 34, 0.95) 0%, rgba(6, 17, 22, 0.92) 100%)",
          border: "1px solid rgba(45, 214, 196, 0.16)",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 700 }}>
            충격량 지수 {focusFireInsight.shockIndex}
          </Typography>
          <Chip
            size="small"
            color={focusFireInsight.shockIndex >= 65 ? "warning" : "default"}
            label={focusFireInsight.intensityLabel}
          />
        </Stack>
        <Typography sx={{ mt: 0.8, fontSize: 12.5, color: "text.secondary" }}>
          포대 {focusFireInsight.breakdown.artillery} + 항공{" "}
          {focusFireInsight.breakdown.aircraft} + 기갑{" "}
          {focusFireInsight.breakdown.armor} + 탄체{" "}
          {focusFireInsight.breakdown.weaponsInFlight} + 점령{" "}
          {focusFireInsight.breakdown.captureProgress}
        </Typography>
        <Typography sx={{ mt: 0.7, fontSize: 12.5, color: "text.secondary" }}>
          주도 축: {focusFireInsight.dominantAxis}
        </Typography>
        <Typography sx={{ mt: 0.7, fontSize: 12.5, color: "text.secondary" }}>
          {focusFireInsight.summary}
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
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button
          size="small"
          variant="contained"
          onClick={props.openFocusFireAirwatch}
          disabled={!focusFireSummary.objectiveName}
        >
          공중 관측 3D
        </Button>
        <Button
          size="small"
          variant="text"
          color="error"
          onClick={props.clearFocusFireObjective}
          disabled={
            !focusFireSummary.enabled && !focusFireSummary.objectiveName
          }
        >
          초기화
        </Button>
      </Stack>
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
    !isChatInputFocused
  ) {
    document.onkeydown = keyboardEventHandler;
  } else {
    document.onkeydown = null;
  }

  const ScenarioDb = [
    { name: "default_scenario", displayName: "기본 데모" },
    { name: "focused_training_demo", displayName: "가용화력자산" },
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
    const currentSideId = props.game.currentScenario.getSide(
      props.game.currentSideId
    )?.id;
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
                  handleUnitClassSelect(item.unitType, item.value);
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
              selected={aircraft.className === selectedAircraftUnitClass}
              key={aircraft.className}
              value={aircraft.className}
            >
              {getDisplayName(aircraft.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Airbase Menu/Button */}
        <Tooltip title="기지 추가">
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
            root: { sx: { ".MuiList-root": { padding: 0 } } },
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
              기지 선택
            </Typography>
            <IconButton onClick={handleAirbaseClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {unitDbContext.getAirbaseDb().map((airbase) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("airbase", airbase.name);
                handleAirbaseClose();
              }}
              selected={airbase.name === selectedAirbaseUnitClass}
              key={airbase.name}
              value={airbase.name}
            >
              {getDisplayName(airbase.name)}
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
              selected={facility.className === selectedSamUnitClass}
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
    const sideIds = props.game.currentScenario.sides.map((side) => side.id);
    const currentlySelectedSides = props.game.godMode
      ? sideIds
      : [props.game.currentSideId];
    const plottedSideFeatures = props.featureEntitiesPlotted.filter(
      (feature: FeatureEntityState) =>
        currentlySelectedSides.includes(feature.sideId)
    );
    if (
      !entityFilterSelectedOptions.length ||
      !props.featureEntitiesPlotted.length ||
      !plottedSideFeatures.length
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
        {props.featureEntitiesPlotted
          .filter((feature: FeatureEntityState) => {
            const selectedSideIds = entityFilterSelectedOptions.filter(
              (selectedOption: string) => sideIds.includes(selectedOption)
            );
            const selectedTypes = entityFilterSelectedOptions.filter(
              (selectedOption: string) =>
                [
                  "airbase",
                  "aircraft",
                  "ship",
                  "facility",
                  "referencePoint",
                ].includes(selectedOption)
            );

            // Side color(s) selected, prioritize 'side color' first
            if (selectedSideIds.length) {
              // Type(s) selected too - filter both 'type' and 'side color'
              if (selectedTypes.length) {
                return (
                  selectedTypes.includes(feature.type) &&
                  selectedSideIds.includes(feature.sideId)
                );
              }
              // Only side color selected in options - filter 'side color'
              return selectedSideIds.includes(feature.sideId);
            }

            // No side color filter(s) - filter 'type'
            return selectedTypes.includes(feature.type);
          })
          .map((feature: FeatureEntityState) => (
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
                    세력:{" "}
                    {props.game.currentScenario.getSideName(feature.sideId)}
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
                    onClick={(event) =>
                      handleDeleteFeatureEntity(event, feature)
                    }
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
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <MapToolbar
          variant="dense"
          sx={{ ...toolbarStyle, overflow: "hidden", gap: 0.8 }}
          disableGutters
        >
          {props.drawerOpen ? (
            <Tooltip title="패널 닫기">
              <IconButton
                color="inherit"
                aria-label="패널 닫기"
                onClick={props.closeDrawer}
                edge="start"
                sx={[
                  {
                    ml: 1,
                    color: COLOR_PALETTE.BLACK,
                  },
                ]}
              >
                <MenuOpenOutlinedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="패널 열기">
              <IconButton
                color="inherit"
                aria-label="패널 열기"
                onClick={props.openDrawer}
                edge="start"
                sx={[
                  {
                    ml: 1,
                    color: COLOR_PALETTE.BLACK,
                  },
                ]}
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
                    ArmyAicenter 제작
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
                onClick={props.openBattleSpectator}
                startIcon={<VisibilityOutlinedIcon />}
                sx={{
                  ml: 1.2,
                  borderRadius: "999px",
                  borderColor: "rgba(45, 214, 196, 0.32)",
                  color: "var(--fs-text)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  "&:hover": {
                    borderColor: "var(--fs-accent)",
                    backgroundColor: "rgba(45, 214, 196, 0.08)",
                  },
                }}
              >
                {compactToolbar ? "관전" : "전장 관전자 3D"}
              </Button>
            )}
            {showExperienceShortcut && (
              <Button
                variant="contained"
                onClick={handleExperienceMenuToggle}
                startIcon={<ViewInArOutlinedIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  ml: 1.2,
                  borderRadius: "999px",
                  backgroundColor: "var(--fs-accent)",
                  color: "#031114",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "var(--fs-accent-strong)",
                    color: "#031114",
                    boxShadow: "none",
                  },
                }}
              >
                {compactToolbar ? "3D" : "3D 시뮬레이터"}
              </Button>
            )}
            {experienceMenu()}
            {showRlLabShortcut && (
              <Button
                variant="outlined"
                onClick={props.openRlLabPage}
                startIcon={<Storage />}
                sx={{
                  ml: 1.2,
                  borderRadius: "999px",
                  borderColor: "rgba(45, 214, 196, 0.28)",
                  color: COLOR_PALETTE.BLACK,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    borderColor: "var(--fs-accent)",
                    backgroundColor: "rgba(45, 214, 196, 0.08)",
                  },
                }}
              >
                {compactToolbar ? "RL" : "강화학습 설계"}
              </Button>
            )}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          {showHealthCheck && <HealthCheck />}
          {showHealthCheck && (
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ borderColor: COLOR_PALETTE.DARK_GRAY, mr: 1.6 }}
            />
          )}
          <LoginLogout />
        </MapToolbar>
      </AppBar>
      {/** Side Drawer */}
      <Drawer
        sx={toolbarDrawerStyle}
        variant="persistent"
        anchor="left"
        open={props.drawerOpen}
      >
        {/** Container/Wrapper */}
        <Container
          disableGutters
          sx={{
            backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
            // The container is now a flex column to manage the main layout.
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flexGrow: 1,
            borderRight: "1px solid",
            borderRightColor: COLOR_PALETTE.DARK_GRAY,
            overflow: "hidden", // Hide overflow here, child will handle scrolling
          }}
        >
          <DrawerHeader />
          {/* Two boxes for the side drawer, utils and chatbot */}
          {/* This new Box contains all the scrollable content. */}
          {/* It will grow to fill available space, pushing the chatbot down. */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 1 }}>
            {/** Scenario Section */}
            <Stack>
              {/** Scenario Name */}
              <Box
                sx={{
                  mx: 1,
                  mb: 1,
                  px: 1.2,
                  py: 1.05,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(45, 214, 196, 0.12)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {props.game.currentScenario.name}
                </Typography>
              </Box>
              {/** Context Notification Text Section */}
              <Stack spacing={0.5} direction="column" sx={{ p: 0, mt: 0 }}>
                <CurrentActionContextDisplay />
              </Stack>
              {/** Scenario Actions */}{" "}
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 1,
                  py: 0.5,
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
                    px: 0.9,
                    py: 0.35,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(45, 214, 196, 0.12)",
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
              {showEmptyScenarioGuide && (
                <Box
                  sx={{
                    mx: 1,
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    background:
                      "linear-gradient(180deg, rgba(10, 26, 34, 0.95) 0%, rgba(6, 17, 22, 0.92) 100%)",
                    border: "1px solid rgba(45, 214, 196, 0.18)",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      빈 화면에서 바로 배치를 시작할 수 있습니다.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      기존 데모나 저장된 시나리오는 <strong>불러오기</strong>를
                      눌러야만 지도에 표시됩니다.
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      새 배치를 시작하려면 세력을 확인한 뒤 상단의{" "}
                      <strong>자산 종류</strong> 또는 자산 아이콘을 선택하고,
                      지도에서 원하는 위치를 클릭하세요.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleLoadScenarioIconClick}
                        sx={{
                          backgroundColor: "var(--fs-accent)",
                          color: "#031114",
                          boxShadow: "none",
                          "&:hover": {
                            backgroundColor: "var(--fs-accent-strong)",
                            boxShadow: "none",
                          },
                        }}
                      >
                        불러오기
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          props.handleOpenSideEditor(selectedSideId || null)
                        }
                        sx={{
                          borderColor: "rgba(45, 214, 196, 0.24)",
                          color: COLOR_PALETTE.BLACK,
                        }}
                      >
                        세력 편집
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 1,
                  py: 0.5,
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
                    px: 0.9,
                    py: 0.35,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(45, 214, 196, 0.12)",
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
                gap: "15px",
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
                title="기록"
                prependIcon={RadioButtonCheckedIcon}
                content={recordingSection()}
                open={false}
              />
              <ToolbarCollapsible
                title="배치 목록"
                prependIcon={DocumentScannerOutlinedIcon}
                content={entitiesSection()}
                enableFilter={true}
                filterProps={{
                  options: [
                    { label: "항공기", value: "aircraft" },
                    { label: "기지", value: "airbase" },
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
                open={false}
              />
              <ToolbarCollapsible
                title="집중포격"
                prependIcon={RadioButtonCheckedIcon}
                content={focusFireSection()}
                open={true}
              />
              <ToolbarCollapsible
                title="임무"
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
                open={true}
              />
            </List>
          </Box>
          {/* The chatbot interface is now outside the scrollable Box and a direct */}
          {/* child of the main flex container, making it stick to the bottom. */}
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid rgba(45, 214, 196, 0.22)",
              background:
                "linear-gradient(180deg, rgba(9, 22, 28, 0.96) 0%, rgba(5, 14, 18, 0.98) 100%)",
            }}
          >
            {/* Chatbot Label */}
            <Box
              sx={{
                p: 1.5,
                borderBottom: "1px solid rgba(45, 214, 196, 0.18)",
              }}
            >
              <Typography
                variant="h5"
                sx={{ textAlign: "center", fontWeight: 600 }}
              >
                AI지휘결심지원(ArmyGPT)
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mt: 0.35,
                  color: "text.secondary",
                }}
              >
                생성형 AI 기반 작전·지휘결심 지원
              </Typography>
            </Box>
            {/* Message Display Area */}
            <Box
              ref={chatMessagesContainerRef}
              sx={{ height: "250px", overflowY: "auto", p: 2 }}
            >
              {messages.map((message) => {
                const isUser = message.sender === "user";
                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start", // Align bubble left or right
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "3px",
                        backgroundColor: isUser
                          ? "rgba(45, 214, 196, 0.9)"
                          : "rgba(255,255,255,0.05)",
                        color: isUser ? "#031114" : "var(--fs-text)",
                        border: isUser
                          ? "1px solid rgba(45, 214, 196, 0.72)"
                          : "1px solid rgba(45, 214, 196, 0.16)",
                        maxWidth: "80%",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <Typography variant="body2">{message.text}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Input Area */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 1, borderTop: "1px solid rgba(45, 214, 196, 0.18)" }}
            >
              <TextField
                id="chatbot-input"
                fullWidth
                size="small"
                placeholder="예: 현재 전력 요약 / 가장 위험한 위협 분석 / 블루팀 임무 추천"
                value={inputValue}
                disabled={isLoading}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                onFocus={() => setIsChatInputFocused(true)}
                onBlur={() => setIsChatInputFocused(false)}
                sx={{ mb: 0, bgcolor: "rgba(255,255,255,0.05)" }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={isLoading || inputValue.trim().length === 0}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Drawer>
    </>
  );
}
