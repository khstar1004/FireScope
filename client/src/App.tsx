import { useEffect, useMemo, useState, type ReactNode } from "react";
import { randomUUID } from "@/utils/generateUUID";
import { get as getProjection, transform } from "ol/proj.js";
import ScenarioMap from "@/gui/map/ScenarioMap";
import Scenario from "@/game/Scenario";
import Game, {
  type FocusFireLaunchPlatform,
  type FocusFireWeaponTrack,
} from "@/game/Game";
import { DEFAULT_OL_PROJECTION_CODE } from "@/utils/constants";
import blankScenarioJson from "@/scenarios/blank_scenario.json";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";
import WelcomePopover from "@/WelcomePopover";
import { useAuth0 } from "@auth0/auth0-react";
import { type FlightSimBattleSpectatorState } from "@/gui/flightSim/battleSpectatorState";
import AssetExperiencePage from "@/gui/experience/AssetExperiencePage";
import ImmersiveExperiencePage from "@/gui/experience/ImmersiveExperiencePage";
import TacticalSimPage from "@/gui/experience/TacticalSimPage";
import RlLabPage from "@/gui/rl/RlLabPage";
import AirCombatOverlay from "@/gui/experience/AirCombatOverlay";
import FlightSimPage from "@/gui/flightSim/FlightSimPage";
import Terrain3dPage from "@/gui/map/Terrain3dPage";
import {
  buildAirCombatTacticalRoute,
  type FocusFireAirwatchLaunchState,
} from "@/gui/experience/airCombatRoute";
import {
  AssetExperienceSummary,
  buildAssetExperienceHash,
  getAssetExperienceQueryParams,
  isAssetExperienceRoute,
  parseAssetExperienceQueryParams,
} from "@/gui/experience/assetExperience";
import {
  buildImmersiveExperienceHash,
  getImmersiveExperienceQueryParams,
  isImmersiveExperienceDemoAsset,
  isImmersiveExperienceRoute,
  parseImmersiveExperienceQueryParams,
} from "@/gui/experience/immersiveExperience";
import {
  buildTacticalSimHash,
  getTacticalSimQueryParams,
  isTacticalSimRoute,
  parseTacticalSimQueryParams,
} from "@/gui/experience/tacticalSimRoute";
import {
  RL_LAB_SCENARIO_KEY,
  RL_PENDING_RECORDING_KEY,
  RL_PENDING_RECORDING_LABEL_KEY,
  buildRlLabHash,
  getRlLabQueryParams,
  isRlLabRoute,
} from "@/gui/rl/rlLabRoute";
import {
  buildTerrain3dHash,
  getTerrain3dQueryParams,
  isTerrain3dRoute,
  parseTerrain3dContinueSimulation,
  parseTerrain3dQueryParams,
  type Terrain3dBounds,
} from "@/gui/map/terrain3dRoute";
import {
  KOREA_OFFLINE_REGION,
  SEUNGJIN_OFFLINE_REGION,
} from "@/gui/map/offlineMapConfig";

const FLIGHT_SIM_HASH = "#/flight-sim";

function isFlightSimRoute(hash: string) {
  return hash.startsWith(FLIGHT_SIM_HASH);
}

function getFlightSimQueryParams(hash: string) {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

function parseFlightSimNumberParam(value: string | null) {
  const parsed = Number(value ?? NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isOfflineOnlySite() {
  const mapMode = String(import.meta.env.VITE_MAP_MODE ?? "").toLowerCase();
  if (
    mapMode === "offline" ||
    Boolean(import.meta.env.VITE_OFFLINE_MAP_REGION)
  ) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return ["49154", "49164"].includes(window.location.port);
}

interface ActiveAirCombatLaunch {
  route: ReturnType<typeof buildAirCombatTacticalRoute>;
  continueSimulation: boolean;
}

export default function App() {
  const { isAuthenticated } = useAuth0();
  const [openWelcomePopover, setOpenWelcomePopover] = useState(
    import.meta.env.VITE_ENV === "production"
  );
  const [currentHash, setCurrentHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash
  );
  const offlineDemoMode = isOfflineOnlySite();
  const [activeAirCombatLaunch, setActiveAirCombatLaunch] =
    useState<ActiveAirCombatLaunch | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setOpenWelcomePopover(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const isMobile = useMediaQuery("(max-width:600px)");
  const isFlightSimPage = isFlightSimRoute(currentHash);
  const isAssetExperiencePage = isAssetExperienceRoute(currentHash);
  const isImmersiveExperiencePage = isImmersiveExperienceRoute(currentHash);
  const isTacticalSimExperiencePage = isTacticalSimRoute(currentHash);
  const isRlLabPage = isRlLabRoute(currentHash);
  const isTerrain3dPage = isTerrain3dRoute(currentHash);
  const flightSimQueryParams = getFlightSimQueryParams(currentHash);
  const assetExperienceQueryParams = getAssetExperienceQueryParams(currentHash);
  const immersiveExperienceQueryParams =
    getImmersiveExperienceQueryParams(currentHash);
  const tacticalSimQueryParams = getTacticalSimQueryParams(currentHash);
  const rlLabQueryParams = getRlLabQueryParams(currentHash);
  const terrain3dQueryParams = getTerrain3dQueryParams(currentHash);
  const theGame = useMemo(() => {
    // TODO: make this dynamic
    // startTime <-- takes real time
    // duration <-- remains
    // endTime <-- startTime + duration
    const currentScenario = new Scenario({
      id: randomUUID(),
      name: "새 시나리오",
      startTime: 1699073110,
      duration: 14400,
    });
    const game = new Game(currentScenario);

    game.loadScenario(JSON.stringify(blankScenarioJson));
    if (offlineDemoMode) {
      game.mapView.currentCameraCenter = [...KOREA_OFFLINE_REGION.center];
      game.mapView.currentCameraZoom = KOREA_OFFLINE_REGION.defaultZoom;
    }
    return game;
  }, [offlineDemoMode]);
  const projection = useMemo(
    () => getProjection(DEFAULT_OL_PROJECTION_CODE) ?? undefined,
    []
  );

  const openFlightSimPage = (
    center?: number[],
    craft?: string,
    focusFireAirwatch?: FocusFireAirwatchLaunchState & {
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
  ) => {
    const params = new URLSearchParams();
    const launchCenter = offlineDemoMode
      ? SEUNGJIN_OFFLINE_REGION.center
      : center;
    const [lon, lat] = launchCenter ?? [];
    if (typeof lon === "number" && Number.isFinite(lon)) {
      params.set("lon", lon.toFixed(6));
    }
    if (typeof lat === "number" && Number.isFinite(lat)) {
      params.set("lat", lat.toFixed(6));
    }
    if (craft) {
      params.set("craft", craft);
    }
    if (
      typeof focusFireAirwatch?.objectiveLon === "number" &&
      Number.isFinite(focusFireAirwatch.objectiveLon) &&
      typeof focusFireAirwatch?.objectiveLat === "number" &&
      Number.isFinite(focusFireAirwatch.objectiveLat)
    ) {
      params.set("focusFire", "1");
      params.set("objectiveLon", focusFireAirwatch.objectiveLon.toFixed(6));
      params.set("objectiveLat", focusFireAirwatch.objectiveLat.toFixed(6));
      if (focusFireAirwatch.objectiveName) {
        params.set("objectiveName", focusFireAirwatch.objectiveName);
      }
    }
    if (
      battleSpectator?.continueSimulation ||
      focusFireAirwatch?.continueSimulation
    ) {
      params.set("continueSimulation", "1");
    }

    setActiveAirCombatLaunch(null);
    window.location.hash = params.toString()
      ? `${FLIGHT_SIM_HASH}?${params.toString()}`
      : FLIGHT_SIM_HASH;
  };

  const openAirCombatOverlay = (
    asset: AssetExperienceSummary,
    options?: {
      continueSimulation?: boolean;
      craft?: string;
      battleSpectator?: FlightSimBattleSpectatorState;
    }
  ) => {
    setActiveAirCombatLaunch({
      route: buildAirCombatTacticalRoute({
        asset,
        craft: options?.craft,
        battleSpectator: options?.battleSpectator,
      }),
      continueSimulation: options?.continueSimulation ?? false,
    });
  };

  const openAssetExperiencePage = (asset: AssetExperienceSummary) => {
    window.location.hash = buildAssetExperienceHash(asset);
  };

  const openImmersiveExperiencePage = (
    asset: AssetExperienceSummary,
    profile?: Parameters<typeof buildImmersiveExperienceHash>[1],
    options?: Parameters<typeof buildImmersiveExperienceHash>[2]
  ) => {
    window.location.hash = buildImmersiveExperienceHash(
      asset,
      profile,
      options
    );
  };

  const openTacticalSimPage = (
    asset: AssetExperienceSummary,
    profile: Parameters<typeof buildTacticalSimHash>[1],
    options?: Parameters<typeof buildTacticalSimHash>[2]
  ) => {
    window.location.hash = buildTacticalSimHash(asset, profile, options);
  };

  const openRlLabPage = (scenarioString?: string) => {
    if (scenarioString) {
      window.sessionStorage.setItem(RL_LAB_SCENARIO_KEY, scenarioString);
    }
    window.location.hash = buildRlLabHash();
  };

  const openTerrain3dPage = (
    bounds: Terrain3dBounds,
    options?: {
      continueSimulation?: boolean;
    }
  ) => {
    setActiveAirCombatLaunch(null);
    window.location.hash = buildTerrain3dHash(
      offlineDemoMode ? SEUNGJIN_OFFLINE_REGION.bounds : bounds,
      options
    );
  };

  const updateRlLabJobId = (jobId: string | null) => {
    window.location.hash = buildRlLabHash(jobId);
  };

  const openRlReplayOnMap = (recording: string, label?: string) => {
    window.sessionStorage.setItem(RL_PENDING_RECORDING_KEY, recording);
    if (label) {
      window.sessionStorage.setItem(RL_PENDING_RECORDING_LABEL_KEY, label);
    } else {
      window.sessionStorage.removeItem(RL_PENDING_RECORDING_LABEL_KEY);
    }
    returnToScenarioMap();
  };

  const returnToScenarioMap = () => {
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    );
    setActiveAirCombatLaunch(null);
    setCurrentHash("");
  };

  const closeAirCombatOverlay = () => {
    setActiveAirCombatLaunch(null);
  };
  const airCombatOverlay = activeAirCombatLaunch ? (
    <AirCombatOverlay
      route={activeAirCombatLaunch.route}
      game={theGame}
      continueSimulation={activeAirCombatLaunch.continueSimulation}
      onClose={closeAirCombatOverlay}
    />
  ) : null;

  const renderWithOverlay = (content: ReactNode) => (
    <>
      {content}
      {airCombatOverlay}
    </>
  );

  if (isRlLabPage) {
    return renderWithOverlay(
      <RlLabPage
        onBack={returnToScenarioMap}
        initialJobId={rlLabQueryParams.get("jobId")}
        onJobIdChange={updateRlLabJobId}
        openReplayOnMap={openRlReplayOnMap}
      />
    );
  }

  if (isFlightSimPage) {
    const focusFireAirwatch =
      flightSimQueryParams.get("focusFire") === "1"
        ? {
            objectiveName:
              flightSimQueryParams.get("objectiveName") ?? undefined,
            objectiveLon: parseFlightSimNumberParam(
              flightSimQueryParams.get("objectiveLon")
            ),
            objectiveLat: parseFlightSimNumberParam(
              flightSimQueryParams.get("objectiveLat")
            ),
            continueSimulation:
              flightSimQueryParams.get("continueSimulation") === "1",
          }
        : undefined;

    return renderWithOverlay(
      <FlightSimPage
        onBack={returnToScenarioMap}
        initialCraft={flightSimQueryParams.get("craft") ?? undefined}
        initialLocation={{
          lon: offlineDemoMode
            ? SEUNGJIN_OFFLINE_REGION.center[0]
            : parseFlightSimNumberParam(flightSimQueryParams.get("lon")),
          lat: offlineDemoMode
            ? SEUNGJIN_OFFLINE_REGION.center[1]
            : parseFlightSimNumberParam(flightSimQueryParams.get("lat")),
        }}
        game={theGame}
        continueSimulation={
          flightSimQueryParams.get("continueSimulation") === "1"
        }
        focusFireAirwatch={focusFireAirwatch}
        offlineDemoMode={offlineDemoMode}
      />
    );
  }

  if (isTerrain3dPage) {
    const terrainBounds = parseTerrain3dQueryParams(terrain3dQueryParams);

    if (!terrainBounds) {
      return renderWithOverlay(
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            backgroundColor: "#02060c",
            color: "#ecfffb",
            p: 3,
          }}
        >
          선택한 3D 영역 정보를 읽지 못했습니다.
        </Box>
      );
    }

    return renderWithOverlay(
      <Terrain3dPage
        bounds={
          offlineDemoMode ? SEUNGJIN_OFFLINE_REGION.bounds : terrainBounds
        }
        game={theGame}
        continueSimulation={parseTerrain3dContinueSimulation(
          terrain3dQueryParams
        )}
        onBack={returnToScenarioMap}
        offlineDemoMode={offlineDemoMode}
      />
    );
  }

  if (isAssetExperiencePage) {
    return renderWithOverlay(
      <AssetExperiencePage
        asset={parseAssetExperienceQueryParams(assetExperienceQueryParams)}
        onBack={returnToScenarioMap}
        openFlightSimPage={openFlightSimPage}
        openImmersiveExperiencePage={openImmersiveExperiencePage}
      />
    );
  }

  if (isImmersiveExperiencePage) {
    const immersiveRoute = parseImmersiveExperienceQueryParams(
      immersiveExperienceQueryParams
    );

    return renderWithOverlay(
      <ImmersiveExperiencePage
        route={immersiveRoute}
        game={theGame}
        onBack={() => {
          if (
            immersiveRoute &&
            !isImmersiveExperienceDemoAsset(immersiveRoute.asset)
          ) {
            openAssetExperiencePage(immersiveRoute.asset);
            return;
          }
          returnToScenarioMap();
        }}
        onBackToMap={returnToScenarioMap}
        openFlightSimPage={openFlightSimPage}
        openTacticalSimPage={openTacticalSimPage}
        backLabel={
          immersiveRoute && isImmersiveExperienceDemoAsset(immersiveRoute.asset)
            ? "지도 복귀"
            : undefined
        }
      />
    );
  }

  if (isTacticalSimExperiencePage) {
    const tacticalRoute = parseTacticalSimQueryParams(tacticalSimQueryParams);

    return renderWithOverlay(
      <TacticalSimPage
        route={tacticalRoute}
        game={theGame}
        continueSimulation
        onBack={() => {
          if (tacticalRoute) {
            openImmersiveExperiencePage(
              tacticalRoute.asset,
              tacticalRoute.profile,
              { modelId: tacticalRoute.modelId }
            );
            return;
          }
          returnToScenarioMap();
        }}
        onBackToMap={returnToScenarioMap}
      />
    );
  }

  return renderWithOverlay(
    <Box className="App" sx={{ position: "fixed", inset: 0, display: "flex" }}>
      <ScenarioMap
        center={transform(
          theGame.mapView.currentCameraCenter,
          "EPSG:4326",
          DEFAULT_OL_PROJECTION_CODE
        )}
        zoom={theGame.mapView.currentCameraZoom}
        game={theGame}
        projection={projection}
        mobileView={isMobile}
        offlineDemoMode={offlineDemoMode}
        openFlightSimPage={openFlightSimPage}
        openAirCombatOverlay={openAirCombatOverlay}
        openAssetExperiencePage={openAssetExperiencePage}
        openImmersiveExperiencePage={openImmersiveExperiencePage}
        openRlLabPage={openRlLabPage}
        openTerrain3dPage={openTerrain3dPage}
      />
    </Box>
  );
}

/*
<WelcomePopover
  open={openWelcomePopover}
  onClose={() => setOpenWelcomePopover(false)}
/>
*/
