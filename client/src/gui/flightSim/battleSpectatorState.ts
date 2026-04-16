import type { BattleSpectatorSnapshot } from "@/game/Game";

export const FLIGHT_SIM_BATTLE_SPECTATOR_STORAGE_KEY =
  "firescope_flight_sim_battle_spectator_state";

export type FlightSimBattleSpectatorState = BattleSpectatorSnapshot & {
  continueSimulation?: boolean;
};

export function parseFlightSimBattleSpectatorState(
  serializedState: string | null
): FlightSimBattleSpectatorState | undefined {
  if (!serializedState) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(serializedState) as FlightSimBattleSpectatorState;
    if (
      !parsed ||
      typeof parsed.scenarioId !== "string" ||
      typeof parsed.scenarioName !== "string" ||
      !Array.isArray(parsed.units) ||
      !Array.isArray(parsed.weapons) ||
      !Array.isArray(parsed.recentEvents)
    ) {
      return undefined;
    }

    return parsed;
  } catch (_error) {
    return undefined;
  }
}
