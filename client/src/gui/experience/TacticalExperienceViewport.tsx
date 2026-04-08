import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Feature, Map as OlMap } from "ol";
import { Circle, LineString, Point } from "ol/geom";
import View from "ol/View";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {
  Circle as CircleStyle,
  Fill,
  RegularShape,
  Stroke,
  Style,
  Text,
} from "ol/style.js";
import BaseMapLayers from "@/gui/map/mapLayers/BaseMapLayers";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import {
  TacticalContactDomain,
  TacticalExperienceConfig,
  TacticalPoint,
  TacticalWeaponConfig,
  createTacticalExperienceScenario,
  localPointToLonLat,
  lonLatToLocalPoint,
  normalizeHeading,
} from "@/gui/experience/tacticalExperience";
import {
  buildThreatRoster,
  findSelectableThreatId,
  type TacticalViewportThreatRow,
} from "@/gui/experience/tacticalViewportInteractions";
import { randomUUID } from "@/utils/generateUUID";

interface TacticalExperienceViewportProps {
  asset: AssetExperienceSummary;
  profile: ImmersiveExperienceProfile;
  accentColor: string;
  glowColor: string;
}

interface RuntimeHostile {
  id: string;
  label: string;
  role: string;
  domain: TacticalContactDomain;
  position: TacticalPoint;
  waypoints: TacticalPoint[];
  waypointIndex: number;
  speedMps: number;
  hitRadiusM: number;
  headingDeg: number;
  health: number;
  destroyed: boolean;
}

interface RuntimeProjectile {
  id: string;
  label: string;
  kind: string;
  role: "primary" | "support";
  position: TacticalPoint;
  previousPosition: TacticalPoint;
  velocity: TacticalPoint;
  targetId?: string;
  targetPoint: TacticalPoint;
  remainingRangeM: number;
  ttlSeconds: number;
  splashRadiusM: number;
  damage: number;
  color: string;
  homing: boolean;
}

interface RuntimeExplosion {
  id: string;
  position: TacticalPoint;
  ttlSeconds: number;
  radiusM: number;
  color: string;
}

interface RuntimeState {
  origin: {
    lon: number;
    lat: number;
  };
  config: TacticalExperienceConfig;
  player: {
    label: string;
    position: TacticalPoint;
    headingDeg: number;
    speedMps: number;
    ammoPrimary: number;
    ammoSupport: number;
    primaryCooldown: number;
    supportCooldown: number;
  };
  hostiles: RuntimeHostile[];
  projectiles: RuntimeProjectile[];
  explosions: RuntimeExplosion[];
  selectedTargetId: string | null;
  followPlayer: boolean;
  lastActionText: string;
  kills: number;
  elapsedSeconds: number;
}

interface HudState {
  statusText: string;
  hostiles: number;
  kills: number;
  ammoPrimary: number;
  ammoSupport: number;
  selectedTarget: string;
  nearestThreat: string;
  speed: string;
  followPlayer: boolean;
  mapMode: string;
}

type TacticalInteractionMode = "target" | "relocate";

function distanceBetween(a: TacticalPoint, b: TacticalPoint) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function headingBetween(a: TacticalPoint, b: TacticalPoint) {
  return normalizeHeading((Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI);
}

function directionFromHeading(headingDeg: number) {
  const headingRadians = (headingDeg * Math.PI) / 180;
  return {
    x: Math.sin(headingRadians),
    y: Math.cos(headingRadians),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatRange(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    return "범위 밖";
  }

  return value >= 1000
    ? `${(value / 1000).toFixed(1)} km`
    : `${Math.round(value)} m`;
}

function resolveMapMode() {
  return import.meta.env.VITE_MAPTILER_DEFAULT_KEY ?? import.meta.env.MAPTILER_API_KEY
    ? "MapTiler"
    : "OSM";
}

function buildHudState(runtime: RuntimeState, mapMode: string): HudState {
  const liveHostiles = runtime.hostiles.filter((hostile) => !hostile.destroyed);
  const selectedTarget = liveHostiles.find(
    (hostile) => hostile.id === runtime.selectedTargetId
  );
  const nearestThreatDistance =
    liveHostiles.length > 0
      ? Math.min(
          ...liveHostiles.map((hostile) =>
            distanceBetween(runtime.player.position, hostile.position)
          )
        )
      : undefined;

  return {
    statusText: runtime.lastActionText,
    hostiles: liveHostiles.length,
    kills: runtime.kills,
    ammoPrimary: runtime.player.ammoPrimary,
    ammoSupport: runtime.player.ammoSupport,
    selectedTarget: selectedTarget
      ? `${selectedTarget.label} / ${selectedTarget.role}`
      : "자동 표적 선택",
    nearestThreat: formatRange(nearestThreatDistance),
    speed: `${Math.round(Math.abs(runtime.player.speedMps) * 3.6)} km/h`,
    followPlayer: runtime.followPlayer,
    mapMode,
  };
}

function createPlayerStyle(
  profile: ImmersiveExperienceProfile,
  headingDeg: number,
  accentColor: string,
  label: string
) {
  const isMaritime = profile === "maritime";
  const isDefense = profile === "defense";

  return new Style({
    image: new RegularShape({
      points: isMaritime ? 3 : isDefense ? 6 : 4,
      radius: isDefense ? 13 : 12,
      angle: isMaritime ? 0 : Math.PI / 4,
      rotation: (headingDeg * Math.PI) / 180,
      fill: new Fill({ color: accentColor }),
      stroke: new Stroke({ color: "#04121b", width: 2 }),
    }),
    text: new Text({
      text: label,
      offsetY: -20,
      font: "700 12px Bahnschrift, sans-serif",
      fill: new Fill({ color: "#eef7ff" }),
      stroke: new Stroke({ color: "rgba(4, 18, 27, 0.92)", width: 3 }),
    }),
  });
}

function createHostileStyle(
  domain: TacticalContactDomain,
  headingDeg: number,
  label: string,
  selected: boolean
) {
  const isAir = domain === "air";
  const isSurface = domain === "surface";

  return new Style({
    image: isAir
      ? new RegularShape({
          points: 3,
          radius: selected ? 12 : 10,
          rotation: (headingDeg * Math.PI) / 180,
          fill: new Fill({ color: selected ? "#ff8fab" : "#ff6b6b" }),
          stroke: new Stroke({ color: "#23070b", width: 2 }),
        })
      : isSurface
        ? new CircleStyle({
            radius: selected ? 10 : 8,
            fill: new Fill({ color: selected ? "#ff8c42" : "#ef476f" }),
            stroke: new Stroke({ color: "#23070b", width: 2 }),
          })
        : new RegularShape({
            points: 4,
            radius: selected ? 11 : 9,
            angle: Math.PI / 4,
            rotation: (headingDeg * Math.PI) / 180,
            fill: new Fill({ color: selected ? "#ff8c42" : "#ef476f" }),
            stroke: new Stroke({ color: "#23070b", width: 2 }),
          }),
    text: new Text({
      text: label,
      offsetY: -18,
      font: "600 11px Bahnschrift, sans-serif",
      fill: new Fill({ color: "#fff4f4" }),
      stroke: new Stroke({ color: "rgba(35, 7, 11, 0.92)", width: 3 }),
    }),
  });
}

function createLineStyle(color: string, width: number) {
  return new Style({
    stroke: new Stroke({
      color,
      width,
      lineCap: "round",
      lineJoin: "round",
    }),
  });
}

function createCircleStyle(
  strokeColor: string,
  fillColor: string,
  lineDash?: number[]
) {
  return new Style({
    stroke: new Stroke({
      color: strokeColor,
      width: 2,
      lineDash,
    }),
    fill: new Fill({
      color: fillColor,
    }),
  });
}

function buildRuntimeState(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile
): RuntimeState {
  const scenario = createTacticalExperienceScenario(asset, profile);

  return {
    origin: scenario.origin,
    config: scenario.config,
    player: {
      label: scenario.player.label,
      position: { ...scenario.player.position },
      headingDeg: scenario.player.headingDeg,
      speedMps: 0,
      ammoPrimary: scenario.player.ammoPrimary,
      ammoSupport: scenario.player.ammoSupport,
      primaryCooldown: 0,
      supportCooldown: 0,
    },
    hostiles: scenario.config.hostileContacts.map((hostile) => ({
      ...hostile,
      position: { ...hostile.position },
      waypointIndex: hostile.waypoints.length > 1 ? 1 : 0,
      headingDeg:
        hostile.waypoints.length > 1
          ? headingBetween(hostile.position, hostile.waypoints[1])
          : 0,
      health: hostile.health,
      destroyed: false,
    })),
    projectiles: [],
    explosions: [],
    selectedTargetId: null,
    followPlayer: true,
    lastActionText: scenario.config.modeDescription,
    kills: 0,
    elapsedSeconds: 0,
  };
}

function selectTarget(
  runtime: RuntimeState,
  weapon: TacticalWeaponConfig
): RuntimeHostile | null {
  const activeHostiles = runtime.hostiles.filter((hostile) => !hostile.destroyed);
  if (activeHostiles.length === 0) {
    return null;
  }

  const selectedTarget = activeHostiles.find(
    (hostile) => hostile.id === runtime.selectedTargetId
  );
  if (
    selectedTarget &&
    distanceBetween(runtime.player.position, selectedTarget.position) <=
      weapon.maxRangeM
  ) {
    return selectedTarget;
  }

  const sorted = [...activeHostiles].sort(
    (left, right) =>
      distanceBetween(runtime.player.position, left.position) -
      distanceBetween(runtime.player.position, right.position)
  );

  return (
    sorted.find(
      (hostile) =>
        distanceBetween(runtime.player.position, hostile.position) <=
        weapon.maxRangeM
    ) ?? null
  );
}

function createExplosion(
  runtime: RuntimeState,
  point: TacticalPoint,
  radiusM: number,
  damage: number,
  color: string
) {
  runtime.explosions.push({
    id: randomUUID(),
    position: { ...point },
    ttlSeconds: 0.55,
    radiusM,
    color,
  });

  runtime.hostiles.forEach((hostile) => {
    if (hostile.destroyed) {
      return;
    }

    const distance = distanceBetween(point, hostile.position);
    if (distance > radiusM + hostile.hitRadiusM) {
      return;
    }

    const falloff = clamp(1 - distance / Math.max(radiusM, 1), 0.25, 1);
    hostile.health -= damage * falloff;
    if (hostile.health <= 0) {
      hostile.destroyed = true;
      runtime.kills += 1;
      runtime.lastActionText = `${hostile.label} 격파`;
      if (runtime.selectedTargetId === hostile.id) {
        runtime.selectedTargetId = null;
      }
    }
  });
}

function fireWeapon(runtime: RuntimeState, role: "primary" | "support") {
  const weapon =
    role === "primary" ? runtime.config.primaryWeapon : runtime.config.supportWeapon;
  const ammoKey = role === "primary" ? "ammoPrimary" : "ammoSupport";
  const cooldownKey =
    role === "primary" ? "primaryCooldown" : "supportCooldown";

  if (runtime.player[cooldownKey] > 0) {
    runtime.lastActionText = `${weapon.label} 재장전 중`;
    return;
  }

  if (runtime.player[ammoKey] <= 0) {
    runtime.lastActionText = `${weapon.label} 잔탄 없음`;
    return;
  }

  const target = selectTarget(runtime, weapon);
  if (!target) {
    runtime.lastActionText = `${weapon.label} 사정권 내 표적 없음`;
    return;
  }

  const distanceToTarget = distanceBetween(
    runtime.player.position,
    target.position
  );
  if (distanceToTarget > weapon.maxRangeM) {
    runtime.lastActionText = `${target.label} 사정권 외부`;
    return;
  }

  const salvoCount = Math.min(weapon.salvo, runtime.player[ammoKey]);
  const baseHeading = headingBetween(runtime.player.position, target.position);

  for (let index = 0; index < salvoCount; index += 1) {
    const spread = (index - (salvoCount - 1) / 2) * 2.5;
    const headingDeg = normalizeHeading(baseHeading + spread);
    const direction = directionFromHeading(headingDeg);
    const spawnPoint = {
      x: runtime.player.position.x + direction.x * 36,
      y: runtime.player.position.y + direction.y * 36,
    };

    runtime.projectiles.push({
      id: randomUUID(),
      label: weapon.label,
      kind: weapon.kind,
      role,
      position: spawnPoint,
      previousPosition: { ...spawnPoint },
      velocity: {
        x: direction.x * weapon.speedMps,
        y: direction.y * weapon.speedMps,
      },
      targetId: weapon.homing ? target.id : undefined,
      targetPoint: { ...target.position },
      remainingRangeM: weapon.maxRangeM,
      ttlSeconds: weapon.maxRangeM / weapon.speedMps + 1,
      splashRadiusM: weapon.splashRadiusM,
      damage: weapon.damage,
      color: weapon.color,
      homing: weapon.homing,
    });
  }

  runtime.player[ammoKey] -= salvoCount;
  runtime.player[cooldownKey] = weapon.cooldownSeconds;
  runtime.lastActionText = `${weapon.label} 발사: ${target.label}`;
  runtime.selectedTargetId = target.id;
}

function updateHostiles(runtime: RuntimeState, deltaSeconds: number) {
  runtime.hostiles.forEach((hostile) => {
    if (hostile.destroyed || hostile.speedMps <= 0 || hostile.waypoints.length < 2) {
      return;
    }

    const targetWaypoint = hostile.waypoints[hostile.waypointIndex];
    const distanceToWaypoint = distanceBetween(hostile.position, targetWaypoint);
    const maxStep = hostile.speedMps * deltaSeconds;

    if (distanceToWaypoint <= maxStep + 5) {
      hostile.position = { ...targetWaypoint };
      hostile.waypointIndex =
        (hostile.waypointIndex + 1) % hostile.waypoints.length;
    } else {
      const headingDeg = headingBetween(hostile.position, targetWaypoint);
      const direction = directionFromHeading(headingDeg);
      hostile.headingDeg = headingDeg;
      hostile.position = {
        x: hostile.position.x + direction.x * maxStep,
        y: hostile.position.y + direction.y * maxStep,
      };
    }
  });
}

function updateProjectiles(runtime: RuntimeState, deltaSeconds: number) {
  for (let index = runtime.projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = runtime.projectiles[index];
    projectile.previousPosition = { ...projectile.position };

    const target =
      projectile.targetId !== undefined
        ? runtime.hostiles.find(
            (hostile) =>
              hostile.id === projectile.targetId && !hostile.destroyed
          )
        : undefined;

    if (projectile.homing && target) {
      const headingDeg = headingBetween(projectile.position, target.position);
      const direction = directionFromHeading(headingDeg);
      projectile.velocity = {
        x: direction.x * Math.hypot(projectile.velocity.x, projectile.velocity.y),
        y: direction.y * Math.hypot(projectile.velocity.x, projectile.velocity.y),
      };
      projectile.targetPoint = { ...target.position };
    }

    projectile.position = {
      x: projectile.position.x + projectile.velocity.x * deltaSeconds,
      y: projectile.position.y + projectile.velocity.y * deltaSeconds,
    };

    const traveledDistance = distanceBetween(
      projectile.previousPosition,
      projectile.position
    );
    projectile.remainingRangeM -= traveledDistance;
    projectile.ttlSeconds -= deltaSeconds;

    const targetDistance = distanceBetween(
      projectile.position,
      projectile.targetPoint
    );
    const hasImpacted =
      targetDistance <= Math.max(projectile.splashRadiusM * 0.45, 26) ||
      projectile.remainingRangeM <= 0 ||
      projectile.ttlSeconds <= 0;

    if (!hasImpacted) {
      continue;
    }

    createExplosion(
      runtime,
      target ? target.position : projectile.position,
      projectile.splashRadiusM,
      projectile.damage,
      projectile.color
    );

    runtime.projectiles.splice(index, 1);
  }
}

function updateExplosions(runtime: RuntimeState, deltaSeconds: number) {
  for (let index = runtime.explosions.length - 1; index >= 0; index -= 1) {
    runtime.explosions[index].ttlSeconds -= deltaSeconds;
    if (runtime.explosions[index].ttlSeconds <= 0) {
      runtime.explosions.splice(index, 1);
    }
  }
}

function updatePlayer(
  runtime: RuntimeState,
  pressedKeys: Set<string>,
  deltaSeconds: number
) {
  const moveForward = pressedKeys.has("w") || pressedKeys.has("arrowup");
  const moveBackward = pressedKeys.has("s") || pressedKeys.has("arrowdown");
  const turnLeft = pressedKeys.has("a") || pressedKeys.has("arrowleft");
  const turnRight = pressedKeys.has("d") || pressedKeys.has("arrowright");

  if (turnLeft) {
    runtime.player.headingDeg = normalizeHeading(
      runtime.player.headingDeg - runtime.config.turnRateDeg * deltaSeconds
    );
  }
  if (turnRight) {
    runtime.player.headingDeg = normalizeHeading(
      runtime.player.headingDeg + runtime.config.turnRateDeg * deltaSeconds
    );
  }

  const targetSpeed = moveForward
    ? runtime.config.maxSpeedMps
    : moveBackward
      ? -runtime.config.reverseSpeedMps
      : 0;
  const acceleration = moveForward || moveBackward ? 2.6 : 2.2;

  runtime.player.speedMps +=
    (targetSpeed - runtime.player.speedMps) *
    Math.min(1, deltaSeconds * acceleration);

  const direction = directionFromHeading(runtime.player.headingDeg);
  runtime.player.position = {
    x: runtime.player.position.x + direction.x * runtime.player.speedMps * deltaSeconds,
    y: runtime.player.position.y + direction.y * runtime.player.speedMps * deltaSeconds,
  };
  runtime.player.primaryCooldown = Math.max(
    0,
    runtime.player.primaryCooldown - deltaSeconds
  );
  runtime.player.supportCooldown = Math.max(
    0,
    runtime.player.supportCooldown - deltaSeconds
  );
}

function rebuildDynamicLayers(
  runtime: RuntimeState,
  entitySource: VectorSource,
  projectileSource: VectorSource,
  effectSource: VectorSource,
  accentColor: string,
  glowColor: string
) {
  entitySource.clear(true);
  projectileSource.clear(true);
  effectSource.clear(true);

  const playerLonLat = localPointToLonLat(runtime.origin, runtime.player.position);
  const playerCoordinate = fromLonLat([playerLonLat.lon, playerLonLat.lat]);

  const sensorRingFeature = new Feature(
    new Circle(playerCoordinate, runtime.config.sensorRangeM)
  );
  sensorRingFeature.setStyle(
    createCircleStyle(
      `${accentColor}99`,
      `${accentColor}16`,
      runtime.config.profile === "defense" ? [10, 8] : undefined
    )
  );
  entitySource.addFeature(sensorRingFeature);

  const playerFeature = new Feature(new Point(playerCoordinate));
  playerFeature.setStyle(
    createPlayerStyle(
      runtime.config.profile,
      runtime.player.headingDeg,
      accentColor,
      runtime.config.unitLabel
    )
  );
  entitySource.addFeature(playerFeature);

  runtime.hostiles.forEach((hostile) => {
    if (hostile.destroyed) {
      return;
    }

    const hostileLonLat = localPointToLonLat(runtime.origin, hostile.position);
    const hostileCoordinate = fromLonLat([hostileLonLat.lon, hostileLonLat.lat]);

    if (runtime.selectedTargetId === hostile.id) {
      const selectedRingFeature = new Feature(
        new Circle(hostileCoordinate, hostile.hitRadiusM + 26)
      );
      selectedRingFeature.setStyle(
        createCircleStyle(`${glowColor}bb`, `${glowColor}12`, [6, 6])
      );
      effectSource.addFeature(selectedRingFeature);
    }

    const hostileFeature = new Feature(new Point(hostileCoordinate));
    hostileFeature.setStyle(
      createHostileStyle(
        hostile.domain,
        hostile.headingDeg,
        hostile.label,
        runtime.selectedTargetId === hostile.id
      )
    );
    entitySource.addFeature(hostileFeature);
  });

  runtime.projectiles.forEach((projectile) => {
    const startLonLat = localPointToLonLat(runtime.origin, projectile.previousPosition);
    const endLonLat = localPointToLonLat(runtime.origin, projectile.position);

    const trailFeature = new Feature(
      new LineString([
        fromLonLat([startLonLat.lon, startLonLat.lat]),
        fromLonLat([endLonLat.lon, endLonLat.lat]),
      ])
    );
    trailFeature.setStyle(createLineStyle(projectile.color, 2));
    projectileSource.addFeature(trailFeature);

    const projectileFeature = new Feature(
      new Point(fromLonLat([endLonLat.lon, endLonLat.lat]))
    );
    projectileFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: projectile.role === "support" ? 5 : 4,
          fill: new Fill({ color: projectile.color }),
          stroke: new Stroke({ color: "#fff7e6", width: 1.5 }),
        }),
      })
    );
    projectileSource.addFeature(projectileFeature);
  });

  runtime.explosions.forEach((explosion) => {
    const explosionLonLat = localPointToLonLat(runtime.origin, explosion.position);
    const explosionFeature = new Feature(
      new Circle(
        fromLonLat([explosionLonLat.lon, explosionLonLat.lat]),
        explosion.radiusM * (1.15 - explosion.ttlSeconds)
      )
    );
    explosionFeature.setStyle(
      createCircleStyle(
        `${explosion.color}cc`,
        `${explosion.color}22`,
        undefined
      )
    );
    effectSource.addFeature(explosionFeature);
  });
}

function createSiteFeatures(
  runtime: RuntimeState,
  accentColor: string,
  glowColor: string
) {
  return runtime.config.sites.flatMap((site) => {
    const lonLat = localPointToLonLat(runtime.origin, site.position);
    const coordinate = fromLonLat([lonLat.lon, lonLat.lat]);

    const areaFeature = new Feature(new Circle(coordinate, site.radiusM));
    areaFeature.setStyle(
      createCircleStyle(
        site.kind === "objective" ? `${glowColor}bb` : `${accentColor}77`,
        site.kind === "objective" ? `${glowColor}14` : `${accentColor}0f`,
        site.kind === "runway" ? [12, 10] : [4, 8]
      )
    );

    const pointFeature = new Feature(new Point(coordinate));
    pointFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: site.kind === "objective" ? glowColor : accentColor,
          }),
          stroke: new Stroke({ color: "#04121b", width: 1.5 }),
        }),
        text: new Text({
          text: site.label,
          offsetY: -18,
          font: "700 11px Bahnschrift, sans-serif",
          fill: new Fill({ color: "#eef7ff" }),
          stroke: new Stroke({ color: "rgba(4, 18, 27, 0.92)", width: 3 }),
        }),
      })
    );

    return [areaFeature, pointFeature];
  });
}

export default function TacticalExperienceViewport({
  asset,
  profile,
  accentColor,
  glowColor,
}: Readonly<TacticalExperienceViewportProps>) {
  const initialMapMode = resolveMapMode();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<RuntimeState | null>(null);
  const mapRef = useRef<OlMap | null>(null);
  const baseLayersRef = useRef<BaseMapLayers | null>(null);
  const frameRef = useRef<number | null>(null);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const interactionModeRef = useRef<TacticalInteractionMode>("target");
  const [hud, setHud] = useState<HudState>({
    statusText: "전술 환경 초기화 중",
    hostiles: 0,
    kills: 0,
    ammoPrimary: 0,
    ammoSupport: 0,
    selectedTarget: "자동 표적 선택",
    nearestThreat: "범위 밖",
    speed: "0 km/h",
    followPlayer: true,
    mapMode: initialMapMode,
  });
  const [interactionMode, setInteractionMode] =
    useState<TacticalInteractionMode>("target");
  const [threatRoster, setThreatRoster] = useState<TacticalViewportThreatRow[]>(
    []
  );

  const syncOverlayState = () => {
    const activeRuntime = runtimeRef.current;
    if (!activeRuntime) {
      return;
    }

    const mapMode = resolveMapMode();
    setHud(buildHudState(activeRuntime, mapMode));
    setThreatRoster(
      buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
    );
  };

  const setVirtualKeyState = (key: string, pressed: boolean) => {
    if (pressed) {
      pressedKeysRef.current.add(key);
      return;
    }

    pressedKeysRef.current.delete(key);
  };

  const buildVirtualKeyHandlers = (key: string) => ({
    onMouseDown: () => setVirtualKeyState(key, true),
    onMouseUp: () => setVirtualKeyState(key, false),
    onMouseLeave: () => setVirtualKeyState(key, false),
    onTouchStart: (event: { preventDefault: () => void }) => {
      event.preventDefault();
      setVirtualKeyState(key, true);
    },
    onTouchEnd: () => setVirtualKeyState(key, false),
    onTouchCancel: () => setVirtualKeyState(key, false),
  });

  const centerMapOnPoint = (point: TacticalPoint) => {
    const activeRuntime = runtimeRef.current;
    const map = mapRef.current;
    if (!activeRuntime || !map) {
      return;
    }

    const lonLat = localPointToLonLat(activeRuntime.origin, point);
    map.getView().setCenter(fromLonLat([lonLat.lon, lonLat.lat]));
  };

  const selectThreat = (threatId: string | null) => {
    const activeRuntime = runtimeRef.current;
    if (!activeRuntime) {
      return;
    }

    activeRuntime.selectedTargetId = threatId;

    if (!threatId) {
      activeRuntime.lastActionText = "자동 표적 모드";
      syncOverlayState();
      return;
    }

    const threat = activeRuntime.hostiles.find(
      (hostile) => hostile.id === threatId && !hostile.destroyed
    );
    if (!threat) {
      return;
    }

    activeRuntime.followPlayer = false;
    activeRuntime.lastActionText = `${threat.label} 우선 요격 표적 지정`;
    centerMapOnPoint(threat.position);
    syncOverlayState();
  };

  const triggerWeapon = (role: "primary" | "support") => {
    const activeRuntime = runtimeRef.current;
    if (!activeRuntime) {
      return;
    }

    fireWeapon(activeRuntime, role);
    syncOverlayState();
  };

  const toggleFollowPlayer = () => {
    const activeRuntime = runtimeRef.current;
    if (!activeRuntime) {
      return;
    }

    activeRuntime.followPlayer = !activeRuntime.followPlayer;
    activeRuntime.lastActionText = activeRuntime.followPlayer
      ? "플레이어 추적 카메라"
      : "자유 탐색 카메라";
    if (activeRuntime.followPlayer) {
      centerMapOnPoint(activeRuntime.player.position);
    }
    syncOverlayState();
  };

  const toggleRelocationMode = () => {
    const nextMode =
      interactionModeRef.current === "relocate" ? "target" : "relocate";
    interactionModeRef.current = nextMode;
    setInteractionMode(nextMode);

    const activeRuntime = runtimeRef.current;
    if (activeRuntime) {
      activeRuntime.lastActionText =
        nextMode === "relocate"
          ? `${activeRuntime.config.unitLabel} 배치 위치를 지도에서 지정하세요.`
          : "표적 지정 모드";
      syncOverlayState();
    }
  };

  const toggleMapLayer = () => {
    const activeRuntime = runtimeRef.current;
    const baseLayers = baseLayersRef.current;
    if (!activeRuntime || !baseLayers) {
      return;
    }

    baseLayers.toggleLayer();
    activeRuntime.lastActionText = "지도 레이어 전환";
    syncOverlayState();
  };

  const resetView = () => {
    const activeRuntime = runtimeRef.current;
    const map = mapRef.current;
    if (!activeRuntime || !map) {
      return;
    }

    interactionModeRef.current = "target";
    setInteractionMode("target");
    activeRuntime.followPlayer = true;
    activeRuntime.lastActionText = "방공망 기준 시점 복구";
    map.getView().setZoom(activeRuntime.config.baseZoom);
    centerMapOnPoint(activeRuntime.player.position);
    syncOverlayState();
  };

  useEffect(() => {
    if (!mapElementRef.current) {
      return;
    }

    interactionModeRef.current = "target";
    setInteractionMode("target");
    setThreatRoster([]);

    const runtime = buildRuntimeState(asset, profile);
    runtimeRef.current = runtime;

    const mapTilerKey =
      import.meta.env.VITE_MAPTILER_DEFAULT_KEY ?? import.meta.env.MAPTILER_API_KEY;
    const baseLayers = new BaseMapLayers(
      undefined,
      mapTilerKey
        ? `https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`
        : undefined
    );
    baseLayersRef.current = baseLayers;
    baseLayers.layers.forEach((layer, index) => {
      layer.setVisible(index === 0);
    });
    baseLayers.currentLayerIndex = 0;

    const siteSource = new VectorSource();
    const entitySource = new VectorSource();
    const projectileSource = new VectorSource();
    const effectSource = new VectorSource();

    siteSource.addFeatures(createSiteFeatures(runtime, accentColor, glowColor));

    const view = new View({
      center: fromLonLat([runtime.origin.lon, runtime.origin.lat]),
      zoom: runtime.config.baseZoom,
    });

    const map = new OlMap({
      target: mapElementRef.current,
      layers: [
        ...baseLayers.layers,
        new VectorLayer({ source: siteSource }),
        new VectorLayer({ source: entitySource }),
        new VectorLayer({ source: projectileSource }),
        new VectorLayer({ source: effectSource }),
      ],
      view,
      controls: [],
    });
    mapRef.current = map;

    const mapMode = resolveMapMode();
    setHud(buildHudState(runtime, mapMode));
    setThreatRoster(buildThreatRoster(runtime.hostiles, runtime.player.position));

    const handleSingleClick = (event: { coordinate: number[] }) => {
      const activeRuntime = runtimeRef.current;
      if (!activeRuntime) {
        return;
      }

      const [lon, lat] = toLonLat(event.coordinate, map.getView().getProjection());
      const clickPoint = lonLatToLocalPoint(activeRuntime.origin, { lon, lat });
      if (interactionModeRef.current === "relocate") {
        activeRuntime.player.position = { ...clickPoint };
        activeRuntime.player.speedMps = 0;
        activeRuntime.followPlayer = true;
        activeRuntime.lastActionText = `${activeRuntime.config.unitLabel} 재배치 완료`;
        interactionModeRef.current = "target";
        setInteractionMode("target");
        setHud(buildHudState(activeRuntime, mapMode));
        setThreatRoster(
          buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
        );
        return;
      }

      const targetId = findSelectableThreatId(
        activeRuntime.hostiles,
        clickPoint,
        activeRuntime.config.profile === "defense" ? 900 : 400
      );

      if (targetId) {
        const target = activeRuntime.hostiles.find(
          (hostile) => hostile.id === targetId
        );
        activeRuntime.selectedTargetId = targetId;
        activeRuntime.lastActionText = target
          ? `${target.label} 우선 표적 지정`
          : "우선 표적 지정";
      } else {
        activeRuntime.selectedTargetId = null;
        activeRuntime.lastActionText = "자동 표적 모드";
      }

      setHud(buildHudState(activeRuntime, mapMode));
      setThreatRoster(
        buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeRuntime = runtimeRef.current;
      if (!activeRuntime) {
        return;
      }

      const key = event.key.toLowerCase();
      if (
        key === "w" ||
        key === "a" ||
        key === "s" ||
        key === "d" ||
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === " " ||
        key === "enter" ||
        key === "f" ||
        key === "m" ||
        key === "r"
      ) {
        event.preventDefault();
      }

      if (key === "f" && !event.repeat) {
        fireWeapon(activeRuntime, "primary");
        setHud(buildHudState(activeRuntime, mapMode));
        setThreatRoster(
          buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
        );
        return;
      }
      if (key === "enter" && !event.repeat) {
        fireWeapon(activeRuntime, "support");
        setHud(buildHudState(activeRuntime, mapMode));
        setThreatRoster(
          buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
        );
        return;
      }
      if (key === " " && !event.repeat) {
        activeRuntime.followPlayer = !activeRuntime.followPlayer;
        activeRuntime.lastActionText = activeRuntime.followPlayer
          ? "플레이어 추적 카메라"
          : "자유 탐색 카메라";
        setHud(buildHudState(activeRuntime, mapMode));
        setThreatRoster(
          buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
        );
        return;
      }
      if (key === "m" && !event.repeat) {
        baseLayers.toggleLayer();
        activeRuntime.lastActionText = `지도 레이어 전환`;
        setHud(buildHudState(activeRuntime, mapMode));
        setThreatRoster(
          buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
        );
        return;
      }
      if (key === "r" && !event.repeat) {
        activeRuntime.followPlayer = true;
        map.getView().setZoom(activeRuntime.config.baseZoom);
        const playerLonLat = localPointToLonLat(
          activeRuntime.origin,
          activeRuntime.player.position
        );
        map
          .getView()
          .setCenter(fromLonLat([playerLonLat.lon, playerLonLat.lat]));
        setHud(buildHudState(activeRuntime, mapMode));
        setThreatRoster(
          buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
        );
        return;
      }

      pressedKeysRef.current.add(key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.key.toLowerCase());
    };

    map.on("singleclick", handleSingleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let previousTime = 0;
    let lastHudUpdate = 0;

    const animate = (timestamp: number) => {
      const activeRuntime = runtimeRef.current;
      if (!activeRuntime || !mapRef.current) {
        return;
      }

      const deltaSeconds = previousTime
        ? Math.min((timestamp - previousTime) / 1000, 0.05)
        : 0.016;
      previousTime = timestamp;
      activeRuntime.elapsedSeconds += deltaSeconds;

      updatePlayer(activeRuntime, pressedKeysRef.current, deltaSeconds);
      updateHostiles(activeRuntime, deltaSeconds);
      updateProjectiles(activeRuntime, deltaSeconds);
      updateExplosions(activeRuntime, deltaSeconds);

      rebuildDynamicLayers(
        activeRuntime,
        entitySource,
        projectileSource,
        effectSource,
        accentColor,
        glowColor
      );

      if (activeRuntime.followPlayer) {
        const lonLat = localPointToLonLat(
          activeRuntime.origin,
          activeRuntime.player.position
        );
        map.getView().setCenter(fromLonLat([lonLat.lon, lonLat.lat]));
      }

      if (timestamp - lastHudUpdate > 140) {
        setHud(buildHudState(activeRuntime, mapMode));
        setThreatRoster(
          buildThreatRoster(activeRuntime.hostiles, activeRuntime.player.position)
        );
        lastHudUpdate = timestamp;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      runtimeRef.current = null;
      baseLayersRef.current = null;
      pressedKeysRef.current.clear();
      interactionModeRef.current = "target";
      map.un("singleclick", handleSingleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [asset, profile, accentColor, glowColor]);

  return (
    <Box sx={{ position: "absolute", inset: 0 }}>
      <Box
        ref={mapElementRef}
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top, rgba(8, 18, 28, 0.92), rgba(3, 6, 10, 1))",
        }}
      />

      <Stack
        spacing={1.2}
        sx={{
          position: "absolute",
          top: { xs: 12, md: 22 },
          right: { xs: 12, md: 22 },
          zIndex: 2,
          width: { xs: "calc(100% - 24px)", sm: 340 },
          pointerEvents: "auto",
        }}
      >
        <Box
          sx={{
            p: 1.6,
            borderRadius: 3,
            color: "#eef7ff",
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(5, 11, 19, 0.78)",
            border: "1px solid rgba(176, 220, 255, 0.16)",
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: accentColor, letterSpacing: "0.18em" }}
          >
            OPERATOR CONSOLE
          </Typography>
          <Typography sx={{ fontWeight: 800 }}>
            {profile === "defense" ? "방공망 전개 / 요격 콘솔" : "전술 운용 콘솔"}
          </Typography>
          <Typography
            sx={{ mt: 0.6, fontSize: 12, color: "rgba(230, 240, 255, 0.72)" }}
          >
            모드: {interactionMode === "relocate" ? "배치 위치 지정" : "표적 지정"} ·
            클릭으로 {interactionMode === "relocate" ? "포대를 이동" : "위협 선택"}
          </Typography>

          <Stack
            direction="row"
            spacing={0.8}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 1.2 }}
          >
            <Button
              size="small"
              variant="contained"
              onClick={() => triggerWeapon("primary")}
              sx={{ backgroundColor: accentColor, color: "#04121b" }}
            >
              근접 요격
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => triggerWeapon("support")}
              sx={{ backgroundColor: glowColor, color: "#04121b" }}
            >
              장거리 요격
            </Button>
            <Button
              size="small"
              variant={interactionMode === "relocate" ? "contained" : "outlined"}
              onClick={toggleRelocationMode}
            >
              배치 위치 지정
            </Button>
            <Button size="small" variant="outlined" onClick={toggleFollowPlayer}>
              추적 {hud.followPlayer ? "해제" : "복귀"}
            </Button>
            <Button size="small" variant="outlined" onClick={toggleMapLayer}>
              레이어 전환
            </Button>
            <Button size="small" variant="outlined" onClick={resetView}>
              기준 시점
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => selectThreat(null)}
            >
              자동 표적
            </Button>
          </Stack>

          <Box
            sx={{
              mt: 1.4,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 0.7,
            }}
          >
            <Box />
            <Button
              size="small"
              variant="outlined"
              {...buildVirtualKeyHandlers("w")}
            >
              전진
            </Button>
            <Box />
            <Button
              size="small"
              variant="outlined"
              {...buildVirtualKeyHandlers("a")}
            >
              좌선회
            </Button>
            <Button
              size="small"
              variant="outlined"
              {...buildVirtualKeyHandlers("s")}
            >
              후진
            </Button>
            <Button
              size="small"
              variant="outlined"
              {...buildVirtualKeyHandlers("d")}
            >
              우선회
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.6,
            borderRadius: 3,
            color: "#eef7ff",
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(5, 11, 19, 0.78)",
            border: "1px solid rgba(176, 220, 255, 0.16)",
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: accentColor, letterSpacing: "0.18em" }}
          >
            THREAT BOARD
          </Typography>
          <Stack spacing={0.8} sx={{ mt: 0.8 }}>
            {threatRoster.length > 0 ? (
              threatRoster.map((threat) => {
                const selected = runtimeRef.current?.selectedTargetId === threat.id;
                return (
                  <Button
                    key={threat.id}
                    variant={selected ? "contained" : "outlined"}
                    onClick={() => selectThreat(threat.id)}
                    sx={{
                      justifyContent: "space-between",
                      px: 1.1,
                      py: 0.9,
                      textTransform: "none",
                      ...(selected
                        ? { backgroundColor: accentColor, color: "#04121b" }
                        : { color: "#eef7ff", borderColor: "rgba(176, 220, 255, 0.18)" }),
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                      sx={{ width: "100%" }}
                    >
                      <Box sx={{ textAlign: "left" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                          {threat.label}
                        </Typography>
                        <Typography sx={{ fontSize: 11, opacity: 0.8 }}>
                          {threat.role}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                          {threat.distanceM >= 1000
                            ? `${(threat.distanceM / 1000).toFixed(1)} km`
                            : `${threat.distanceM} m`}
                        </Typography>
                        <Typography sx={{ fontSize: 11, opacity: 0.8 }}>
                          HP {threat.health}
                        </Typography>
                      </Box>
                    </Stack>
                  </Button>
                );
              })
            ) : (
              <Typography sx={{ fontSize: 13, color: "rgba(230, 240, 255, 0.72)" }}>
                탐지된 위협이 없습니다.
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>

      <Stack
        spacing={1.1}
        sx={{
          position: "absolute",
          left: { xs: 12, md: 24 },
          bottom: { xs: 12, md: 22 },
          zIndex: 1,
          maxWidth: { xs: "calc(100% - 24px)", md: 420 },
          p: 1.7,
          borderRadius: 3,
          color: "#eef7ff",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(5, 11, 19, 0.7)",
          border: "1px solid rgba(176, 220, 255, 0.16)",
          pointerEvents: "none",
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: accentColor, letterSpacing: "0.18em" }}
        >
          LIVE TACTICAL EXPERIENCE
        </Typography>
        <Typography sx={{ fontWeight: 800 }}>{hud.statusText}</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
            fontSize: 13,
            color: "rgba(230, 240, 255, 0.84)",
          }}
        >
          <Typography>생존 위협: {hud.hostiles}</Typography>
          <Typography>격파: {hud.kills}</Typography>
          <Typography>주무장: {hud.ammoPrimary}</Typography>
          <Typography>보조무장: {hud.ammoSupport}</Typography>
          <Typography>속도: {hud.speed}</Typography>
          <Typography>지도: {hud.mapMode}</Typography>
          <Typography>추적: {hud.followPlayer ? "ON" : "OFF"}</Typography>
          <Typography>
            입력: {interactionMode === "relocate" ? "배치 지정" : "표적 지정"}
          </Typography>
          <Typography>최근접 위협: {hud.nearestThreat}</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: "rgba(230, 240, 255, 0.72)" }}>
          표적: {hud.selectedTarget}
        </Typography>
      </Stack>
    </Box>
  );
}
