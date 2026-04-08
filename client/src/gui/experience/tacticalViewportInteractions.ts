import type {
  TacticalContactDomain,
  TacticalPoint,
} from "@/gui/experience/tacticalExperience";

export interface TacticalViewportHostileSnapshot {
  id: string;
  label: string;
  role: string;
  domain: TacticalContactDomain;
  position: TacticalPoint;
  health: number;
  hitRadiusM: number;
  destroyed: boolean;
}

export interface TacticalViewportThreatRow {
  id: string;
  label: string;
  role: string;
  domain: TacticalContactDomain;
  distanceM: number;
  health: number;
}

export function distanceBetweenPoints(a: TacticalPoint, b: TacticalPoint) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function findSelectableThreatId(
  hostiles: TacticalViewportHostileSnapshot[],
  clickPoint: TacticalPoint,
  maxDistanceM = 400
) {
  const nearest = hostiles
    .filter((hostile) => !hostile.destroyed)
    .map((hostile) => ({
      id: hostile.id,
      distanceM: distanceBetweenPoints(hostile.position, clickPoint),
    }))
    .sort((left, right) => left.distanceM - right.distanceM)[0];

  if (!nearest || nearest.distanceM > maxDistanceM) {
    return null;
  }

  return nearest.id;
}

export function buildThreatRoster(
  hostiles: TacticalViewportHostileSnapshot[],
  referencePoint: TacticalPoint
) {
  return hostiles
    .filter((hostile) => !hostile.destroyed)
    .map((hostile) => ({
      id: hostile.id,
      label: hostile.label,
      role: hostile.role,
      domain: hostile.domain,
      distanceM: Math.round(
        distanceBetweenPoints(referencePoint, hostile.position)
      ),
      health: Math.max(0, Math.round(hostile.health)),
    }))
    .sort((left, right) => left.distanceM - right.distanceM);
}
