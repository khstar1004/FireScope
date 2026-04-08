import { useEffect, useMemo, useState } from "react";
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
import FlightSimPage from "@/gui/flightSim/FlightSimPage";
import AssetExperiencePage from "@/gui/experience/AssetExperiencePage";
import ImmersiveExperiencePage from "@/gui/experience/ImmersiveExperiencePage";
import TacticalSimPage from "@/gui/experience/TacticalSimPage";
import RlLabPage from "@/gui/rl/RlLabPage";
import { normalizeFlightSimStartLocation } from "@/gui/flightSim/flightSimLocation";
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

const FLIGHT_SIM_HASH = "#/flight-sim";

function isFlightSimRoute(hash: string) {
  return hash.startsWith(FLIGHT_SIM_HASH);
}

function getFlightSimQueryParams(hash: string) {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

export default function App() {
  const { isAuthenticated } = useAuth0();
  const [openWelcomePopover, setOpenWelcomePopover] = useState(
    import.meta.env.VITE_ENV === "production"
  );
  const [currentHash, setCurrentHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash
  );

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
  const flightSimQueryParams = getFlightSimQueryParams(currentHash);
  const assetExperienceQueryParams = getAssetExperienceQueryParams(currentHash);
  const immersiveExperienceQueryParams =
    getImmersiveExperienceQueryParams(currentHash);
  const tacticalSimQueryParams = getTacticalSimQueryParams(currentHash);
  const rlLabQueryParams = getRlLabQueryParams(currentHash);
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
    return game;
  }, []);
  const projection = useMemo(
    () => getProjection(DEFAULT_OL_PROJECTION_CODE) ?? undefined,
    []
  );

  const openFlightSimPage = (
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
    }
  ) => {
    const params = new URLSearchParams();
    const [lon, lat] = center ?? [];
    const normalizedStart = normalizeFlightSimStartLocation(
      Number.isFinite(lon) && Number.isFinite(lat) ? { lon, lat } : undefined
    );

    params.set("lon", normalizedStart.lon.toFixed(6));
    params.set("lat", normalizedStart.lat.toFixed(6));
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
      if (focusFireAirwatch.captureProgress !== undefined) {
        params.set("capture", focusFireAirwatch.captureProgress.toFixed(0));
      }
      if (focusFireAirwatch.active !== undefined) {
        params.set("active", focusFireAirwatch.active ? "1" : "0");
      }
      if (focusFireAirwatch.aircraftCount !== undefined) {
        params.set("aircraft", `${focusFireAirwatch.aircraftCount}`);
      }
      if (focusFireAirwatch.artilleryCount !== undefined) {
        params.set("artillery", `${focusFireAirwatch.artilleryCount}`);
      }
      if (focusFireAirwatch.armorCount !== undefined) {
        params.set("armor", `${focusFireAirwatch.armorCount}`);
      }
      if (focusFireAirwatch.weaponsInFlight !== undefined) {
        params.set("weapons", `${focusFireAirwatch.weaponsInFlight}`);
      }
      if (focusFireAirwatch.statusLabel) {
        params.set("status", focusFireAirwatch.statusLabel);
      }
      if (focusFireAirwatch.continueSimulation) {
        params.set("continueSimulation", "1");
      }
    }

    window.location.hash = params.toString()
      ? `${FLIGHT_SIM_HASH}?${params.toString()}`
      : FLIGHT_SIM_HASH;
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
    setCurrentHash("");
  };

  if (isFlightSimPage) {
    const flightSimLon = flightSimQueryParams.get("lon");
    const flightSimLat = flightSimQueryParams.get("lat");
    const focusFireEnabled = flightSimQueryParams.get("focusFire") === "1";
    const focusFireObjectiveLon = flightSimQueryParams.get("objectiveLon");
    const focusFireObjectiveLat = flightSimQueryParams.get("objectiveLat");

    return (
      <FlightSimPage
        onBack={returnToScenarioMap}
        initialCraft={flightSimQueryParams.get("craft") ?? undefined}
        initialLocation={{
          lon: flightSimLon === null ? undefined : Number(flightSimLon),
          lat: flightSimLat === null ? undefined : Number(flightSimLat),
        }}
        game={theGame}
        continueSimulation={
          flightSimQueryParams.get("continueSimulation") === "1"
        }
        focusFireAirwatch={
          focusFireEnabled
            ? {
                objectiveName:
                  flightSimQueryParams.get("objectiveName") ?? undefined,
                objectiveLon:
                  focusFireObjectiveLon === null
                    ? undefined
                    : Number(focusFireObjectiveLon),
                objectiveLat:
                  focusFireObjectiveLat === null
                    ? undefined
                    : Number(focusFireObjectiveLat),
                active: flightSimQueryParams.get("active") === "1",
                captureProgress: Number(
                  flightSimQueryParams.get("capture") ?? "0"
                ),
                aircraftCount: Number(
                  flightSimQueryParams.get("aircraft") ?? "0"
                ),
                artilleryCount: Number(
                  flightSimQueryParams.get("artillery") ?? "0"
                ),
                armorCount: Number(flightSimQueryParams.get("armor") ?? "0"),
                weaponsInFlight: Number(
                  flightSimQueryParams.get("weapons") ?? "0"
                ),
                statusLabel: flightSimQueryParams.get("status") ?? undefined,
                continueSimulation:
                  flightSimQueryParams.get("continueSimulation") === "1",
              }
            : undefined
        }
      />
    );
  }

  if (isRlLabPage) {
    return (
      <RlLabPage
        onBack={returnToScenarioMap}
        initialJobId={rlLabQueryParams.get("jobId")}
        onJobIdChange={updateRlLabJobId}
        openReplayOnMap={openRlReplayOnMap}
      />
    );
  }

  if (isAssetExperiencePage) {
    return (
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

    return (
      <ImmersiveExperiencePage
        route={immersiveRoute}
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

    return (
      <TacticalSimPage
        route={tacticalRoute}
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

  return (
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
        openFlightSimPage={openFlightSimPage}
        openAssetExperiencePage={openAssetExperiencePage}
        openImmersiveExperiencePage={openImmersiveExperiencePage}
        openRlLabPage={openRlLabPage}
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
