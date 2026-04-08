export type ToolbarEntityType =
  | "aircraft"
  | "airbase"
  | "facility"
  | "ship"
  | "referencePoint"
  | "weapon"
  | "circle"
  | "drone"
  | "tank";

const DRONE_AIRCRAFT_PATTERN =
  /\b(drone|uav|uas|ucav|mq-|rq-|global hawk|predator|reaper|bayraktar|wing loong|heron)\b/i;

const TANK_FACILITY_PATTERN =
  /\b(tank|mbt|abrams|leopard|k1|k2|ifv|apc|afv|armored|armoured|humvee|hmmwv|km900|m113(?:a\d+)?|m577|stryker|bradley|bmp|btr|lav|aavp)\b/i;

const FIRES_FACILITY_PATTERN =
  /\b(chunmoo|surface to surface|artillery|howitzer|mlrs|rocket|launcher|hyunmoo|himars|paladin|k9|k55)\b/i;

const SUPPORT_AIRCRAFT_PATTERN =
  /\b(kc-|c-\d+|e-3|e-7|rc-|p-8|tanker|transport|awacs)\b/i;

export function isDroneAircraftClassName(className?: string | null): boolean {
  return !!className && DRONE_AIRCRAFT_PATTERN.test(className);
}

export function isTankFacilityClassName(className?: string | null): boolean {
  return !!className && TANK_FACILITY_PATTERN.test(className);
}

export function isFiresFacilityClassName(className?: string | null): boolean {
  return !!className && FIRES_FACILITY_PATTERN.test(className);
}

export function isSupportAircraftClassName(
  className?: string | null
): boolean {
  return !!className && SUPPORT_AIRCRAFT_PATTERN.test(className);
}
