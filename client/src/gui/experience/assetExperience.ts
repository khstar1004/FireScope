import Airbase from "@/game/units/Airbase";
import Aircraft from "@/game/units/Aircraft";
import Facility from "@/game/units/Facility";
import Ship from "@/game/units/Ship";
import Weapon from "@/game/units/Weapon";

export const ASSET_EXPERIENCE_HASH = "#/asset-experience";

export type AssetExperienceKind =
  | "aircraft"
  | "ship"
  | "weapon"
  | "facility"
  | "airbase";

export interface AssetExperienceSummary {
  kind: AssetExperienceKind;
  id: string;
  name: string;
  className: string;
  sideName: string;
  latitude: number;
  longitude: number;
  altitude: number;
  heading?: number;
  speed?: number;
  range?: number;
  currentFuel?: number;
  maxFuel?: number;
  fuelRate?: number;
  missionName?: string;
  weaponCount?: number;
  aircraftCount?: number;
  lethality?: number;
  currentQuantity?: number;
  maxQuantity?: number;
}

function parseOptionalNumber(value: string | null) {
  if (value === null || value === "") return undefined;

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function parseOptionalString(value: string | null) {
  return value && value.length > 0 ? value : undefined;
}

export function isAssetExperienceRoute(hash: string) {
  return hash.startsWith(ASSET_EXPERIENCE_HASH);
}

export function getAssetExperienceQueryParams(hash: string) {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

export function buildAssetExperienceHash(asset: AssetExperienceSummary) {
  const params = new URLSearchParams();

  params.set("kind", asset.kind);
  params.set("id", asset.id);
  params.set("name", asset.name);
  params.set("className", asset.className);
  params.set("sideName", asset.sideName);
  params.set("latitude", asset.latitude.toFixed(6));
  params.set("longitude", asset.longitude.toFixed(6));
  params.set("altitude", asset.altitude.toFixed(2));

  if (asset.heading !== undefined) {
    params.set("heading", asset.heading.toFixed(2));
  }
  if (asset.speed !== undefined) {
    params.set("speed", asset.speed.toFixed(2));
  }
  if (asset.range !== undefined) {
    params.set("range", asset.range.toFixed(2));
  }
  if (asset.currentFuel !== undefined) {
    params.set("currentFuel", asset.currentFuel.toFixed(2));
  }
  if (asset.maxFuel !== undefined) {
    params.set("maxFuel", asset.maxFuel.toFixed(2));
  }
  if (asset.fuelRate !== undefined) {
    params.set("fuelRate", asset.fuelRate.toFixed(2));
  }
  if (asset.missionName) {
    params.set("missionName", asset.missionName);
  }
  if (asset.weaponCount !== undefined) {
    params.set("weaponCount", `${asset.weaponCount}`);
  }
  if (asset.aircraftCount !== undefined) {
    params.set("aircraftCount", `${asset.aircraftCount}`);
  }
  if (asset.lethality !== undefined) {
    params.set("lethality", asset.lethality.toFixed(4));
  }
  if (asset.currentQuantity !== undefined) {
    params.set("currentQuantity", `${asset.currentQuantity}`);
  }
  if (asset.maxQuantity !== undefined) {
    params.set("maxQuantity", `${asset.maxQuantity}`);
  }

  return `${ASSET_EXPERIENCE_HASH}?${params.toString()}`;
}

export function parseAssetExperienceQueryParams(params: URLSearchParams) {
  const kind = params.get("kind");

  if (
    kind !== "aircraft" &&
    kind !== "ship" &&
    kind !== "weapon" &&
    kind !== "facility" &&
    kind !== "airbase"
  ) {
    return null;
  }

  const id = params.get("id");
  const name = params.get("name");
  const className = params.get("className");
  const sideName = params.get("sideName");
  const latitude = parseOptionalNumber(params.get("latitude"));
  const longitude = parseOptionalNumber(params.get("longitude"));
  const altitude = parseOptionalNumber(params.get("altitude"));

  if (
    !id ||
    !name ||
    !className ||
    !sideName ||
    latitude === undefined ||
    longitude === undefined ||
    altitude === undefined
  ) {
    return null;
  }

  return {
    kind,
    id,
    name,
    className,
    sideName,
    latitude,
    longitude,
    altitude,
    heading: parseOptionalNumber(params.get("heading")),
    speed: parseOptionalNumber(params.get("speed")),
    range: parseOptionalNumber(params.get("range")),
    currentFuel: parseOptionalNumber(params.get("currentFuel")),
    maxFuel: parseOptionalNumber(params.get("maxFuel")),
    fuelRate: parseOptionalNumber(params.get("fuelRate")),
    missionName: parseOptionalString(params.get("missionName")),
    weaponCount: parseOptionalNumber(params.get("weaponCount")),
    aircraftCount: parseOptionalNumber(params.get("aircraftCount")),
    lethality: parseOptionalNumber(params.get("lethality")),
    currentQuantity: parseOptionalNumber(params.get("currentQuantity")),
    maxQuantity: parseOptionalNumber(params.get("maxQuantity")),
  } satisfies AssetExperienceSummary;
}

export function createAircraftExperienceSummary(
  aircraft: Aircraft,
  sideName: string,
  missionName?: string | null
): AssetExperienceSummary {
  return {
    kind: "aircraft",
    id: aircraft.id,
    name: aircraft.name,
    className: aircraft.className,
    sideName,
    latitude: aircraft.latitude,
    longitude: aircraft.longitude,
    altitude: aircraft.altitude,
    heading: aircraft.heading,
    speed: aircraft.speed,
    range: aircraft.range,
    currentFuel: aircraft.currentFuel,
    maxFuel: aircraft.maxFuel,
    fuelRate: aircraft.fuelRate,
    missionName: missionName ?? undefined,
    weaponCount: aircraft.weapons.length,
  };
}

export function createShipExperienceSummary(
  ship: Ship,
  sideName: string
): AssetExperienceSummary {
  return {
    kind: "ship",
    id: ship.id,
    name: ship.name,
    className: ship.className,
    sideName,
    latitude: ship.latitude,
    longitude: ship.longitude,
    altitude: ship.altitude,
    heading: ship.heading,
    speed: ship.speed,
    range: ship.range,
    currentFuel: ship.currentFuel,
    maxFuel: ship.maxFuel,
    fuelRate: ship.fuelRate,
    weaponCount: ship.weapons.length,
    aircraftCount: ship.aircraft.length,
  };
}

export function createWeaponExperienceSummary(
  weapon: Weapon,
  sideName: string
): AssetExperienceSummary {
  return {
    kind: "weapon",
    id: weapon.id,
    name: weapon.name,
    className: weapon.className,
    sideName,
    latitude: weapon.latitude,
    longitude: weapon.longitude,
    altitude: weapon.altitude,
    heading: weapon.heading,
    speed: weapon.speed,
    range: weapon.getEngagementRange(),
    currentFuel: weapon.currentFuel,
    maxFuel: weapon.maxFuel,
    fuelRate: weapon.fuelRate,
    lethality: weapon.lethality,
    currentQuantity: weapon.currentQuantity,
    maxQuantity: weapon.maxQuantity,
  };
}

export function createFacilityExperienceSummary(
  facility: Facility,
  sideName: string
): AssetExperienceSummary {
  return {
    kind: "facility",
    id: facility.id,
    name: facility.name,
    className: facility.className,
    sideName,
    latitude: facility.latitude,
    longitude: facility.longitude,
    altitude: facility.altitude,
    range: facility.range,
    weaponCount: facility.weapons.length,
  };
}

export function createAirbaseExperienceSummary(
  airbase: Airbase,
  sideName: string
): AssetExperienceSummary {
  return {
    kind: "airbase",
    id: airbase.id,
    name: airbase.name,
    className: airbase.className,
    sideName,
    latitude: airbase.latitude,
    longitude: airbase.longitude,
    altitude: airbase.altitude,
    aircraftCount: airbase.aircraft.length,
  };
}

export function inferAircraftExperienceCraft(className: string) {
  if (/drone|uav|mq-|rq-|global hawk|predator|reaper/i.test(className)) {
    return "drone";
  }

  if (/kf-21|boramae/i.test(className)) {
    return "kf21";
  }

  if (/f-15|f-15k|eagle/i.test(className)) {
    return "f15";
  }

  if (/f-16|kf-16|falcon|fa-50|ta-50|t-50/i.test(className)) {
    return "f16";
  }

  if (/f-35|lightning|f-22|raptor|b-2|stealth/i.test(className)) {
    return "f35";
  }

  return "jet";
}
