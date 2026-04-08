export type FlightSimLocation = {
  lon: number;
  lat: number;
};

export const DEFAULT_FLIGHT_SIM_KOREA_START: FlightSimLocation = Object.freeze({
  lon: 126.978,
  lat: 37.5665,
});

export function isInsideFlightSimKorea(
  lon: number,
  lat: number
): boolean {
  return lon >= 124.5 && lon <= 132.5 && lat >= 33.0 && lat <= 39.5;
}

export function hasFiniteFlightSimLocation(
  location?: Partial<FlightSimLocation> | null
): location is FlightSimLocation {
  return (
    typeof location?.lon === "number" &&
    Number.isFinite(location.lon) &&
    typeof location?.lat === "number" &&
    Number.isFinite(location.lat)
  );
}

export function normalizeFlightSimStartLocation(
  location?: Partial<FlightSimLocation> | null
): FlightSimLocation {
  if (
    hasFiniteFlightSimLocation(location) &&
    isInsideFlightSimKorea(location.lon, location.lat)
  ) {
    return {
      lon: location.lon,
      lat: location.lat,
    };
  }

  return {
    ...DEFAULT_FLIGHT_SIM_KOREA_START,
  };
}
