import {
  DEFAULT_FLIGHT_SIM_KOREA_START,
  hasFiniteFlightSimLocation,
  isInsideFlightSimKorea,
  normalizeFlightSimStartLocation,
} from "@/gui/flightSim/flightSimLocation";

describe("flightSimLocation", () => {
  it("keeps Korean start coordinates unchanged", () => {
    expect(
      normalizeFlightSimStartLocation({ lon: 127.0276, lat: 37.4979 })
    ).toEqual({
      lon: 127.0276,
      lat: 37.4979,
    });
  });

  it("falls back to Seoul when the requested start is outside Korea", () => {
    expect(
      normalizeFlightSimStartLocation({ lon: 111.7491, lat: 4.575 })
    ).toEqual(DEFAULT_FLIGHT_SIM_KOREA_START);
  });

  it("falls back to Seoul when the requested start is missing", () => {
    expect(normalizeFlightSimStartLocation()).toEqual(
      DEFAULT_FLIGHT_SIM_KOREA_START
    );
  });

  it("detects whether a location is finite", () => {
    expect(hasFiniteFlightSimLocation({ lon: 126.978, lat: 37.5665 })).toBe(
      true
    );
    expect(hasFiniteFlightSimLocation({ lon: Number.NaN, lat: 37.5665 })).toBe(
      false
    );
  });

  it("recognizes the supported Korea bounds", () => {
    expect(isInsideFlightSimKorea(126.978, 37.5665)).toBe(true);
    expect(isInsideFlightSimKorea(111.7491, 4.575)).toBe(false);
  });
});
