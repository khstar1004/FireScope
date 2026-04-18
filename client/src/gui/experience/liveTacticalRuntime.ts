import type {
  BattleSpectatorPointSnapshot,
  BattleSpectatorSnapshot,
  BattleSpectatorUnitSnapshot,
} from "@/game/Game";
import { createTacticalExperienceScenario } from "@/gui/experience/tacticalExperience";
import type {
  TacticalContactDomain,
  TacticalContactSeed,
  TacticalScenarioSeed,
  TacticalSiteSeed,
  TacticalWeaponConfig,
} from "@/gui/experience/tacticalExperience";
import type { TacticalSimRoute } from "@/gui/experience/tacticalSimRoute";
import { EARTH_RADIUS_M, NAUTICAL_MILES_TO_METERS } from "@/utils/constants";

export interface TacticalLiveRuntimeInfo {
  source: "seed" | "battle-snapshot";
  focusUnitId: string | null;
  focusSideId: string | null;
  currentTime?: number;
}

export interface TacticalLiveRuntimeScenarioResult {
  scenario: TacticalScenarioSeed;
  runtime: TacticalLiveRuntimeInfo;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hasFinitePoint(point: { x?: number; y?: number } | null | undefined) {
  return (
    typeof point?.x === "number" &&
    Number.isFinite(point.x) &&
    typeof point?.y === "number" &&
    Number.isFinite(point.y)
  );
}

function hasFiniteGeoPoint(
  point:
    | BattleSpectatorPointSnapshot
    | { latitude?: number; longitude?: number }
    | null
    | undefined
) {
  return (
    typeof point?.latitude === "number" &&
    Number.isFinite(point.latitude) &&
    typeof point?.longitude === "number" &&
    Number.isFinite(point.longitude)
  );
}

function lonLatToLocalPoint(
  origin: { lon: number; lat: number },
  point: { longitude: number; latitude: number }
) {
  const latRadians = (origin.lat * Math.PI) / 180;
  return {
    x:
      (((point.longitude - origin.lon) * Math.PI) / 180) *
      EARTH_RADIUS_M *
      Math.cos(latRadians),
    y: (((point.latitude - origin.lat) * Math.PI) / 180) * EARTH_RADIUS_M,
  };
}

function findFocusUnit(
  snapshot: BattleSpectatorSnapshot,
  route: TacticalSimRoute
) {
  return (
    snapshot.units.find((unit) => unit.id === route.asset.id) ??
    snapshot.units.find(
      (unit) =>
        unit.className === route.asset.className && unit.name === route.asset.name
    ) ??
    snapshot.units.find((unit) => unit.selected) ??
    null
  );
}

function resolveOrigin(
  focusUnit: BattleSpectatorUnitSnapshot | null,
  route: TacticalSimRoute
) {
  return {
    lon: focusUnit?.longitude ?? route.asset.longitude,
    lat: focusUnit?.latitude ?? route.asset.latitude,
  };
}

function buildWeaponConfig(
  fallback: TacticalWeaponConfig,
  focusUnit: BattleSpectatorUnitSnapshot | null,
  slot: 0 | 1
) {
  const inventory = focusUnit?.weaponInventory?.[slot];
  const engagementRangeMeters = clamp(
    (focusUnit?.engagementRangeNm ?? fallback.maxRangeM / NAUTICAL_MILES_TO_METERS) *
      NAUTICAL_MILES_TO_METERS,
    Math.min(fallback.maxRangeM, 600),
    Math.max(fallback.maxRangeM, 220000)
  );

  return {
    ...fallback,
    label: inventory?.name ?? fallback.label,
    maxRangeM: engagementRangeMeters,
  };
}

function resolveSupportAmmoCount(
  focusUnit: BattleSpectatorUnitSnapshot | null,
  primaryAmmoCount: number,
  fallbackAmmoCount: number
) {
  if (!focusUnit || focusUnit.weaponInventory.length === 0) {
    return fallbackAmmoCount;
  }

  if (focusUnit.weaponInventory[1]) {
    return focusUnit.weaponInventory[1].quantity;
  }

  return Math.max(
    0,
    focusUnit.weaponInventory.reduce(
      (total, inventory) => total + inventory.quantity,
      0
    ) - primaryAmmoCount
  );
}

function resolveContactDomain(unit: BattleSpectatorUnitSnapshot): TacticalContactDomain {
  if (unit.entityType === "aircraft") {
    return "air";
  }
  if (unit.entityType === "ship") {
    return "surface";
  }
  return "ground";
}

function buildHostileWaypoints(
  unit: BattleSpectatorUnitSnapshot,
  origin: { lon: number; lat: number }
) {
  const routePoints =
    unit.route.length > 0 ? unit.route : unit.desiredRoute;

  return routePoints
    .map((point) =>
      hasFiniteGeoPoint(point) ? lonLatToLocalPoint(origin, point) : null
    )
    .filter((point): point is { x: number; y: number } => point !== null);
}

function buildHostileContacts(
  snapshot: BattleSpectatorSnapshot,
  focusUnit: BattleSpectatorUnitSnapshot | null,
  origin: { lon: number; lat: number }
) {
  const focusSideId = focusUnit?.sideId ?? null;

  return snapshot.units
    .filter((unit) => unit.sideId !== focusSideId)
    .filter((unit) => unit.entityType !== "airbase")
    .map((unit) => {
      const position = lonLatToLocalPoint(origin, unit);
      const waypoints = buildHostileWaypoints(unit, origin);

      const contact: TacticalContactSeed = {
        id: unit.id,
        label: unit.name,
        role:
          unit.profileHint === "defense"
            ? "방공 자산"
            : unit.profileHint === "fires"
              ? "화력 자산"
              : unit.profileHint === "maritime"
                ? "해상 전력"
                : unit.groundUnit
                  ? "지상 기동"
                  : unit.entityType,
        domain: resolveContactDomain(unit),
        position,
        waypoints: waypoints.length > 0 ? [position, ...waypoints] : [position],
        speedMps: clamp(unit.speedKts * 0.514444, 0, 340),
        hitRadiusM:
          unit.entityType === "ship"
            ? 130
            : unit.entityType === "aircraft"
              ? 78
              : unit.groundUnit
                ? 42
                : 56,
        health: Math.max(1, Math.round(unit.hpFraction * 100)),
      };

      return contact;
    })
    .sort(
      (left, right) =>
        Math.hypot(left.position.x, left.position.y) -
        Math.hypot(right.position.x, right.position.y)
    )
    .slice(0, 24);
}

function pushUniqueSite(target: TacticalSiteSeed[], site: TacticalSiteSeed | null) {
  if (!site || !hasFinitePoint(site.position)) {
    return;
  }
  if (target.some((candidate) => candidate.id === site.id)) {
    return;
  }
  target.push(site);
}

function buildSupportSite(
  unit: BattleSpectatorUnitSnapshot,
  origin: { lon: number; lat: number }
): TacticalSiteSeed | null {
  const position = lonLatToLocalPoint(origin, unit);

  return {
    id: unit.id,
    label: unit.name,
    kind: unit.entityType === "airbase" ? "runway" : "support",
    position,
    radiusM: unit.entityType === "airbase" ? 220 : 140,
  };
}

function buildSites(
  snapshot: BattleSpectatorSnapshot,
  focusUnit: BattleSpectatorUnitSnapshot | null,
  origin: { lon: number; lat: number },
  fallbackScenario: TacticalScenarioSeed
) {
  const sites: TacticalSiteSeed[] = [];

  pushUniqueSite(sites, {
    id: `${focusUnit?.id ?? fallbackScenario.player.label}-base`,
    label: focusUnit?.name ?? fallbackScenario.player.label,
    kind: "base",
    position: { x: 0, y: 0 },
    radiusM: 110,
  });

  const objectiveUnit =
    (focusUnit?.targetId
      ? snapshot.units.find((unit) => unit.id === focusUnit.targetId) ?? null
      : null) ??
    snapshot.units.find((unit) => unit.sideId !== focusUnit?.sideId) ??
    null;

  if (objectiveUnit) {
    pushUniqueSite(sites, {
      id: `${objectiveUnit.id}-objective`,
      label: objectiveUnit.name,
      kind: "objective",
      position: lonLatToLocalPoint(origin, objectiveUnit),
      radiusM: 180,
    });
  }

  if (focusUnit?.homeBaseId) {
    const homeBase =
      snapshot.units.find((unit) => unit.id === focusUnit.homeBaseId) ?? null;
    pushUniqueSite(
      sites,
      homeBase ? buildSupportSite(homeBase, origin) : null
    );
  }

  snapshot.units
    .filter((unit) => unit.sideId === focusUnit?.sideId)
    .filter((unit) => unit.id !== focusUnit?.id)
    .filter(
      (unit) =>
        unit.entityType === "airbase" ||
        unit.entityType === "ship" ||
        unit.profileHint === "defense" ||
        unit.profileHint === "fires"
    )
    .slice(0, 8)
    .forEach((unit) => {
      pushUniqueSite(sites, buildSupportSite(unit, origin));
    });

  if (sites.length === 0) {
    return fallbackScenario.config.sites;
  }

  return sites;
}

export function buildTacticalScenarioFromBattleSnapshot(
  snapshot: BattleSpectatorSnapshot,
  route: TacticalSimRoute
): TacticalLiveRuntimeScenarioResult {
  const fallbackScenario = createTacticalExperienceScenario(
    route.asset,
    route.profile,
    route.operationMode
  );
  const focusUnit = findFocusUnit(snapshot, route);
  if (!focusUnit) {
    return {
      scenario: fallbackScenario,
      runtime: {
        source: "seed",
        focusUnitId: null,
        focusSideId: null,
      },
    };
  }

  const origin = resolveOrigin(focusUnit, route);
  const hostileContacts = buildHostileContacts(snapshot, focusUnit, origin);
  const primaryAmmo = focusUnit.weaponInventory[0]?.quantity ?? 0;
  const sites = buildSites(snapshot, focusUnit, origin, fallbackScenario);

  return {
    scenario: {
      ...fallbackScenario,
      origin,
      player: {
        label: focusUnit.name,
        position: { x: 0, y: 0 },
        headingDeg: focusUnit.headingDeg,
        ammoPrimary: primaryAmmo,
        ammoSupport: resolveSupportAmmoCount(
          focusUnit,
          primaryAmmo,
          fallbackScenario.player.ammoSupport
        ),
      },
      config: {
        ...fallbackScenario.config,
        unitLabel: focusUnit.name,
        sensorRangeM: clamp(
          focusUnit.detectionRangeNm * NAUTICAL_MILES_TO_METERS,
          600,
          280000
        ),
        primaryWeapon: buildWeaponConfig(
          fallbackScenario.config.primaryWeapon,
          focusUnit,
          0
        ),
        supportWeapon: buildWeaponConfig(
          fallbackScenario.config.supportWeapon,
          focusUnit,
          1
        ),
        hostileContacts:
          hostileContacts.length > 0
            ? hostileContacts
            : fallbackScenario.config.hostileContacts,
        sites,
      },
    },
    runtime: {
      source: "battle-snapshot",
      focusUnitId: focusUnit.id,
      focusSideId: focusUnit.sideId,
      currentTime: snapshot.currentTime,
    },
  };
}
