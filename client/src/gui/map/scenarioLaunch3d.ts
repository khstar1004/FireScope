import type {
  FocusFireLaunchPlatform,
  FocusFireSummary,
  FocusFireWeaponTrack,
} from "@/game/Game";

interface ScenarioLaunch3dFocusFireAirwatch {
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

type OpenFlightSimPage = (
  center?: number[],
  craft?: string,
  focusFireAirwatch?: ScenarioLaunch3dFocusFireAirwatch
) => void;

interface OpenScenarioLaunch3dFlightSimOptions {
  openFlightSimPage: OpenFlightSimPage;
  defaultCenter?: number[];
  focusFireSummary?: FocusFireSummary;
  continueSimulation?: boolean;
}

function hasObjective(
  focusFireSummary?: FocusFireSummary
): focusFireSummary is FocusFireSummary & {
  objectiveLongitude: number;
  objectiveLatitude: number;
} {
  return (
    typeof focusFireSummary?.objectiveLongitude === "number" &&
    Number.isFinite(focusFireSummary.objectiveLongitude) &&
    typeof focusFireSummary?.objectiveLatitude === "number" &&
    Number.isFinite(focusFireSummary.objectiveLatitude)
  );
}

export function openScenarioLaunch3dFlightSim({
  openFlightSimPage,
  defaultCenter,
  focusFireSummary,
  continueSimulation = true,
}: OpenScenarioLaunch3dFlightSimOptions) {
  if (hasObjective(focusFireSummary)) {
    openFlightSimPage(
      [
        focusFireSummary.objectiveLongitude,
        focusFireSummary.objectiveLatitude,
      ],
      "jet",
      {
        objectiveName: focusFireSummary.objectiveName ?? undefined,
        objectiveLon: focusFireSummary.objectiveLongitude,
        objectiveLat: focusFireSummary.objectiveLatitude,
        active: focusFireSummary.active,
        captureProgress: focusFireSummary.captureProgress,
        aircraftCount: focusFireSummary.aircraftCount,
        artilleryCount: focusFireSummary.artilleryCount,
        armorCount: focusFireSummary.armorCount,
        weaponsInFlight: focusFireSummary.weaponsInFlight,
        statusLabel: focusFireSummary.statusLabel,
        launchPlatforms: focusFireSummary.launchPlatforms,
        weaponTracks: focusFireSummary.weaponTracks,
        continueSimulation,
      }
    );
    return;
  }

  openFlightSimPage(defaultCenter, "jet", {
    continueSimulation,
  });
}
