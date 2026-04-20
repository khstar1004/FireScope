import Feature, { FeatureLike } from "ol/Feature.js";
import { Circle, Geometry, LineString, Polygon } from "ol/geom";
import Point from "ol/geom/Point.js";
import VectorSource from "ol/source/Vector.js";
import { Projection, fromLonLat, get as getProjection } from "ol/proj";
import { Style } from "ol/style";

import Aircraft from "@/game/units/Aircraft";
import Facility from "@/game/units/Facility";
import Airbase from "@/game/units/Airbase";
import Army from "@/game/units/Army";
import {
  DEFAULT_OL_PROJECTION_CODE,
  NAUTICAL_MILES_TO_METERS,
} from "@/utils/constants";
import {
  routeStyle,
  aircraftStyle,
  airbasesStyle,
  facilityStyle,
  facilityPlacementStyle,
  facilityPlacementGroupStyle,
  threatRangeStyle,
  threatRangePlacementStyle,
  weaponStyle,
  weaponTrajectoryStyle,
  featureLabelStyle,
  shipStyle,
  referencePointStyle,
} from "@/gui/map/mapLayers/FeatureLayerStyles";
import Weapon from "@/game/units/Weapon";
import VectorLayer from "ol/layer/Vector";
import Ship from "@/game/units/Ship";
import ReferencePoint from "@/game/units/ReferencePoint";
import { SIDE_COLOR } from "@/utils/colors";
import { normalizeAngleDegrees } from "@/utils/threatCoverage";
import Scenario from "@/game/Scenario";
import {
  resolveUnitVisualProfileId,
  type UnitVisualProfileId,
} from "@/game/db/unitVisualProfiles";
import { FacilityPlacementGroup } from "@/game/facilityPlacementGroups";
import {
  buildFacilityPlacementGroupOverlays,
  type FacilityPlacementGroupOverlay,
} from "@/gui/map/facilityPlacementGroupOverlay";

export type FeatureEntityState = {
  id: string;
  type:
    | "aircraft"
    | "airbase"
    | "army"
    | "facility"
    | "ship"
    | "referencePoint";
  name: string;
  sideId: string;
  sideColor: SIDE_COLOR;
};

type GameEntity =
  | Aircraft
  | Army
  | Facility
  | Airbase
  | Weapon
  | Ship
  | ReferencePoint;
type CombatEntity = Aircraft | Army | Facility | Airbase | Weapon | Ship;
type GameEntityWithRange = Aircraft | Army | Facility | Ship;
type GameEntityWithRoute = Aircraft | Army | Ship;
type WeaponTrajectoryKind = "projected" | "active";
type TrajectoryTarget = {
  longitude: number;
  latitude: number;
};

export type FacilityPlacementPreview = {
  latitude: number;
  longitude: number;
  heading: number;
  className: string;
  sideColor: SIDE_COLOR;
  range: number;
  detectionArcDegrees: number;
};

function isCombatEntity(entity: GameEntity): entity is CombatEntity {
  return !(entity instanceof ReferencePoint);
}

const defaultProjection = getProjection(DEFAULT_OL_PROJECTION_CODE);

function buildProjectedSectorCoordinates(
  center: number[],
  radiusM: number,
  sectorCenterDegrees: number,
  sectorArcDegrees: number,
  segmentCount = 48
) {
  const boundedArc = Math.max(Math.min(sectorArcDegrees, 359.9), 1);
  const halfArc = boundedArc / 2;
  const startBearing = sectorCenterDegrees - halfArc;
  const totalSegments = Math.max(
    6,
    Math.ceil((boundedArc / 360) * segmentCount)
  );
  const [centerX, centerY] = center;
  const coordinates = [[centerX, centerY]];

  for (let segmentIndex = 0; segmentIndex <= totalSegments; segmentIndex += 1) {
    const bearingDegrees = normalizeAngleDegrees(
      startBearing + (boundedArc * segmentIndex) / totalSegments
    );
    const bearingRadians = (bearingDegrees * Math.PI) / 180;
    coordinates.push([
      centerX + radiusM * Math.sin(bearingRadians),
      centerY + radiusM * Math.cos(bearingRadians),
    ]);
  }

  coordinates.push([centerX, centerY]);
  return coordinates;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function resolveWeaponTrajectoryProfileId(
  weapon: Weapon
): UnitVisualProfileId | undefined {
  return resolveUnitVisualProfileId({
    entityType: "weapon",
    className: weapon.className,
    name: weapon.name,
  });
}

function isTrajectoryWeaponProfile(profileId?: UnitVisualProfileId) {
  return (
    profileId === "weapon-air-to-air-missile" ||
    profileId === "weapon-surface-missile"
  );
}

function resolveTrajectoryCurveConfig(profileId: UnitVisualProfileId) {
  if (profileId === "weapon-air-to-air-missile") {
    return {
      offsetBase: 0.06,
      minimumOffsetM: 300,
      maximumOffsetM: 22000,
      spreadScale: 0.08,
    };
  }

  return {
    offsetBase: 0.035,
    minimumOffsetM: 180,
    maximumOffsetM: 12000,
    spreadScale: 0.06,
  };
}

function resolveWeaponTargetCoordinates(
  weapon: Weapon,
  scenario: Scenario
): TrajectoryTarget | null {
  const target =
    scenario.getAircraft(weapon.targetId) ??
    scenario.getArmy(weapon.targetId) ??
    scenario.getFacility(weapon.targetId) ??
    scenario.getWeapon(weapon.targetId) ??
    scenario.getShip(weapon.targetId) ??
    scenario.getAirbase(weapon.targetId) ??
    scenario.getReferencePoint(weapon.targetId);

  if (target) {
    return {
      longitude: target.longitude,
      latitude: target.latitude,
    };
  }

  const lastWaypoint = weapon.route[weapon.route.length - 1];
  if (
    Array.isArray(lastWaypoint) &&
    Number.isFinite(lastWaypoint[0]) &&
    Number.isFinite(lastWaypoint[1])
  ) {
    return {
      latitude: Number(lastWaypoint[0]),
      longitude: Number(lastWaypoint[1]),
    };
  }

  return null;
}

function buildQuadraticBezierCoordinates(
  start: number[],
  end: number[],
  weaponId: string,
  profileId: UnitVisualProfileId,
  ratio = 1
) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const distance = Math.hypot(dx, dy);
  if (distance < 1) {
    return [start, end];
  }

  const directionX = dx / distance;
  const directionY = dy / distance;
  const perpendicularX = -directionY;
  const perpendicularY = directionX;
  const hash = hashString(weaponId);
  const curveConfig = resolveTrajectoryCurveConfig(profileId);
  const arcDirection = hash % 2 === 0 ? 1 : -1;
  const spreadBucket =
    ((Math.abs(hash) % 5) - 2) * curveConfig.spreadScale;
  const offsetMagnitude = clamp(
    distance * curveConfig.offsetBase,
    curveConfig.minimumOffsetM,
    curveConfig.maximumOffsetM
  );
  const controlPoint = [
    (start[0] + end[0]) / 2 +
      perpendicularX * offsetMagnitude * (1 + spreadBucket) * arcDirection,
    (start[1] + end[1]) / 2 +
      perpendicularY * offsetMagnitude * (1 + spreadBucket) * arcDirection,
  ];
  const sampledRatio = clamp(ratio, 0, 1);
  const sampleCount = Math.max(
    10,
    Math.min(28, Math.ceil((distance / 1000) * 0.28))
  );
  const totalSteps = Math.max(2, Math.ceil(sampleCount * sampledRatio));
  const coordinates: number[][] = [];

  for (let step = 0; step <= totalSteps; step += 1) {
    const t = sampledRatio * (step / totalSteps);
    const inv = 1 - t;
    coordinates.push([
      inv * inv * start[0] + 2 * inv * t * controlPoint[0] + t * t * end[0],
      inv * inv * start[1] + 2 * inv * t * controlPoint[1] + t * t * end[1],
    ]);
  }

  return coordinates;
}

function buildWeaponTrajectoryFeature(
  coordinates: number[][],
  weapon: Weapon,
  kind: WeaponTrajectoryKind
) {
  return new Feature({
    type: "weaponTrajectory",
    trajectoryKind: kind,
    id: `${weapon.id}-${kind}`,
    weaponId: weapon.id,
    weaponName: weapon.name,
    geometry: new LineString(coordinates),
    sideColor: weapon.sideColor,
  });
}

class FeatureLayer {
  layerSource: VectorSource<Feature<Geometry>>;
  layer: VectorLayer<VectorSource<Feature<Geometry>>>;
  projection: Projection;
  featureCount: number = 0;

  constructor(
    styleFunction: (feature: FeatureLike) => Style | Style[],
    projection?: Projection,
    zIndex?: number
  ) {
    this.layerSource = new VectorSource();
    this.layer = new VectorLayer({
      source: this.layerSource,
      style: styleFunction,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
    });
    this.projection = projection ?? defaultProjection!;
    this.layer.setZIndex(zIndex ?? 0);
  }

  refreshFeatures(features: Feature[]) {
    this.layerSource.clear();
    this.layerSource.addFeatures(features);
    this.featureCount = features.length;
  }

  findFeatureByKey(key: string, value: string) {
    return this.layerSource
      .getFeatures()
      .find((feature) => feature.getProperties()[key] === value);
  }

  removeFeatureById(id: string) {
    const feature = this.findFeatureByKey("id", id);
    if (feature) {
      this.layerSource.removeFeature(feature);
      this.featureCount -= 1;
    }
  }
}

export class AircraftLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(aircraftStyle, projection, zIndex);
    this.layer.set("name", "aircraftLayer");
  }

  createAircraftFeature(aircraft: Aircraft) {
    const aircraftFeature = new Feature({
      type: "aircraft",
      geometry: new Point(
        fromLonLat([aircraft.longitude, aircraft.latitude], this.projection)
      ),
      id: aircraft.id,
      name: aircraft.name,
      className: aircraft.className,
      heading: aircraft.heading,
      selected: aircraft.selected,
      sideId: aircraft.sideId,
      sideColor: aircraft.sideColor,
      currentHp: aircraft.currentHp,
      maxHp: aircraft.maxHp,
      healthRatio: aircraft.getHealthFraction(),
    });
    aircraftFeature.setId(aircraft.id);
    return aircraftFeature;
  }

  refresh(aircraftList: Aircraft[]) {
    const aircraftFeatures = aircraftList.map((aircraft) =>
      this.createAircraftFeature(aircraft)
    );
    this.refreshFeatures(aircraftFeatures);
  }

  updateAircraftGeometry(aircraftList: Aircraft[]) {
    aircraftList.forEach((aircraft) => {
      const feature = this.layerSource.getFeatureById(aircraft.id);
      if (feature) {
        feature.setGeometry(
          new Point(
            fromLonLat([aircraft.longitude, aircraft.latitude], this.projection)
          )
        );
      }
    });
  }

  addAircraftFeature(aircraft: Aircraft) {
    this.layerSource.addFeature(this.createAircraftFeature(aircraft));
    this.featureCount += 1;
  }

  updateAircraftFeature(
    aircraftId: string,
    aircraftSelected: boolean,
    aircraftHeading: number
  ) {
    const feature = this.findFeatureByKey("id", aircraftId);
    if (feature) {
      feature.set("selected", aircraftSelected);
      feature.set("heading", aircraftHeading);
    }
  }
}

export class FacilityLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(facilityStyle, projection, zIndex);
    this.layer.set("name", "facilityLayer");
  }

  createFacilityFeature(facility: Facility) {
    return new Feature({
      type: "facility",
      geometry: new Point(
        fromLonLat([facility.longitude, facility.latitude], this.projection)
      ),
      id: facility.id,
      name: facility.name,
      className: facility.className,
      heading: facility.heading,
      sideId: facility.sideId,
      sideColor: facility.sideColor,
      currentHp: facility.currentHp,
      maxHp: facility.maxHp,
      healthRatio: facility.getHealthFraction(),
    });
  }

  refresh(facilities: Facility[]) {
    const facilityFeatures = facilities.map((facility) =>
      this.createFacilityFeature(facility)
    );
    this.refreshFeatures(facilityFeatures);
  }

  addFacilityFeature(facility: Facility) {
    this.layerSource.addFeature(this.createFacilityFeature(facility));
    this.featureCount += 1;
  }
}

export class ArmyLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(facilityStyle, projection, zIndex);
    this.layer.set("name", "armyLayer");
  }

  createArmyFeature(army: Army) {
    const armyFeature = new Feature({
      type: "army",
      geometry: new Point(
        fromLonLat([army.longitude, army.latitude], this.projection)
      ),
      id: army.id,
      name: army.name,
      className: army.className,
      heading: army.heading,
      selected: army.selected,
      sideId: army.sideId,
      sideColor: army.sideColor,
      currentHp: army.currentHp,
      maxHp: army.maxHp,
      healthRatio: army.getHealthFraction(),
    });
    armyFeature.setId(army.id);
    return armyFeature;
  }

  refresh(armies: Army[]) {
    const armyFeatures = armies.map((army) => this.createArmyFeature(army));
    this.refreshFeatures(armyFeatures);
  }

  addArmyFeature(army: Army) {
    this.layerSource.addFeature(this.createArmyFeature(army));
    this.featureCount += 1;
  }

  updateArmyFeature(
    armyId: string,
    armySelected: boolean,
    armyHeading: number
  ) {
    const feature = this.findFeatureByKey("id", armyId);
    if (feature) {
      feature.set("selected", armySelected);
      feature.set("heading", armyHeading);
    }
  }
}

export class AirbasesLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(airbasesStyle, projection, zIndex);
    this.layer.set("name", "airbasesLayer");
  }

  createAirbaseFeature(airbase: Airbase) {
    return new Feature({
      type: "airbase",
      geometry: new Point(
        fromLonLat([airbase.longitude, airbase.latitude], this.projection)
      ),
      id: airbase.id,
      name: airbase.name,
      sideId: airbase.sideId,
      sideColor: airbase.sideColor,
      currentHp: airbase.currentHp,
      maxHp: airbase.maxHp,
      healthRatio: airbase.getHealthFraction(),
    });
  }

  refresh(airbases: Airbase[]) {
    const airbaseFeatures = airbases.map((airbase) =>
      this.createAirbaseFeature(airbase)
    );
    this.refreshFeatures(airbaseFeatures);
  }

  addAirbaseFeature(airbase: Airbase) {
    this.layerSource.addFeature(this.createAirbaseFeature(airbase));
    this.featureCount += 1;
  }
}

export class ThreatRangeLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(threatRangeStyle, projection, zIndex);
    this.layer.set("name", "rangeRingLayer");
  }

  createThreatGeometry(entity: GameEntityWithRange) {
    const arcDegrees = entity.getDetectionArcDegrees();
    const projectedCenter = fromLonLat(
      [entity.longitude, entity.latitude],
      this.projection
    );
    const radiusM = entity.getDetectionRange() * NAUTICAL_MILES_TO_METERS;

    if (arcDegrees >= 360) {
      return new Circle(projectedCenter, radiusM);
    }

    const sectorCoordinates = buildProjectedSectorCoordinates(
      projectedCenter,
      radiusM,
      entity.getDetectionHeading(),
      arcDegrees
    );

    return new Polygon([sectorCoordinates]);
  }

  createRangeFeature(entity: GameEntityWithRange) {
    return new Feature({
      type: "rangeRing",
      id: entity.id,
      geometry: this.createThreatGeometry(entity),
      sideColor: entity.sideColor,
    });
  }

  refresh(entities: GameEntityWithRange[]) {
    const entityFeatures = entities.map((entity) =>
      this.createRangeFeature(entity)
    );
    this.refreshFeatures(entityFeatures);
  }

  addRangeFeature(entity: GameEntityWithRange) {
    this.layerSource.addFeature(this.createRangeFeature(entity));
    this.featureCount += 1;
  }
}

export class FacilityPlacementLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(facilityPlacementStyle, projection, zIndex);
    this.layer.set("name", "facilityPlacementLayer");
  }

  createPreviewFeature(preview: FacilityPlacementPreview) {
    return new Feature({
      type: "facilityPlacementPreview",
      geometry: new Point(
        fromLonLat([preview.longitude, preview.latitude], this.projection)
      ),
      className: preview.className,
      heading: preview.heading,
      sideColor: preview.sideColor,
    });
  }

  showPreview(preview: FacilityPlacementPreview | FacilityPlacementPreview[]) {
    const previews = Array.isArray(preview) ? preview : [preview];
    this.refreshFeatures(
      previews.map((previewEntry) => this.createPreviewFeature(previewEntry))
    );
  }

  clearPreview() {
    this.refreshFeatures([]);
  }
}

export class FacilityPlacementGroupLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(facilityPlacementGroupStyle, projection, zIndex);
    this.layer.set("name", "facilityPlacementGroupLayer");
  }

  createGroupFeature(overlay: FacilityPlacementGroupOverlay) {
    return new Feature({
      type: "facilityPlacementGroup",
      geometry: new Polygon([
        overlay.ringCoordinates.map(([longitude, latitude]) =>
          fromLonLat([longitude, latitude], this.projection)
        ),
      ]),
      id: overlay.id,
      label: overlay.label,
      memberCount: overlay.memberCount,
      sideColor: overlay.sideColor,
      emphasized: overlay.emphasized,
    });
  }

  refresh(
    groups: FacilityPlacementGroup[],
    facilities: Facility[],
    emphasizedGroupIds: Iterable<string> = []
  ) {
    const groupFeatures = buildFacilityPlacementGroupOverlays(
      groups,
      facilities,
      emphasizedGroupIds
    ).map((overlay) => this.createGroupFeature(overlay));
    this.refreshFeatures(groupFeatures);
  }
}

export class ThreatPlacementLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(threatRangePlacementStyle, projection, zIndex);
    this.layer.set("name", "threatPlacementLayer");
  }

  createPreviewGeometry(preview: FacilityPlacementPreview) {
    const projectedCenter = fromLonLat(
      [preview.longitude, preview.latitude],
      this.projection
    );
    const radiusM = preview.range * NAUTICAL_MILES_TO_METERS;

    if (preview.detectionArcDegrees >= 360) {
      return new Circle(projectedCenter, radiusM);
    }

    const sectorCoordinates = buildProjectedSectorCoordinates(
      projectedCenter,
      radiusM,
      preview.heading,
      preview.detectionArcDegrees
    );

    return new Polygon([sectorCoordinates]);
  }

  createPreviewFeature(preview: FacilityPlacementPreview) {
    return new Feature({
      type: "threatPlacementPreview",
      geometry: this.createPreviewGeometry(preview),
      sideColor: preview.sideColor,
    });
  }

  showPreview(preview: FacilityPlacementPreview | FacilityPlacementPreview[]) {
    const previews = Array.isArray(preview) ? preview : [preview];
    this.refreshFeatures(
      previews.map((previewEntry) => this.createPreviewFeature(previewEntry))
    );
  }

  clearPreview() {
    this.refreshFeatures([]);
  }
}

export class RouteLayer extends FeatureLayer {
  constructor(layerName: string, projection?: Projection, zIndex?: number) {
    super(routeStyle, projection, zIndex);
    this.layer.set("name", layerName);
  }

  generateRouteWaypoints(
    initialLatitude: number,
    initialLongitude: number,
    route: number[][]
  ) {
    const routeWaypoints = [
      fromLonLat([initialLongitude, initialLatitude], this.projection),
    ];
    route.forEach((waypoint) => {
      const waypointLatitude = waypoint[0];
      const waypointLongitude = waypoint[1];
      const formattedWaypoint = fromLonLat(
        [waypointLongitude, waypointLatitude],
        this.projection
      );
      routeWaypoints.push(formattedWaypoint);
    });
    return routeWaypoints;
  }

  createRouteFeature(moveableUnit: GameEntityWithRoute) {
    const routeWaypoints = this.generateRouteWaypoints(
      moveableUnit.latitude,
      moveableUnit.longitude,
      moveableUnit.route
    );
    const moveableUnitRouteFeature = new Feature({
      type: "route",
      id: moveableUnit.id,
      geometry: new LineString(routeWaypoints),
      sideColor: moveableUnit.sideColor,
    });
    moveableUnitRouteFeature.setId(moveableUnit.id);
    return moveableUnitRouteFeature;
  }

  refresh(moveableUnitList: GameEntityWithRoute[]) {
    const moveableUnitRouteFeatures: Feature<LineString>[] = [];
    moveableUnitList.forEach((moveableUnit) => {
      if (moveableUnit.route.length > 0) {
        moveableUnitRouteFeatures.push(this.createRouteFeature(moveableUnit));
      }
    });
    this.refreshFeatures(moveableUnitRouteFeatures);
  }

  addRouteFeature(moveableUnit: GameEntityWithRoute) {
    if (moveableUnit.route.length > 0) {
      const previousFeature = this.findFeatureByKey("id", moveableUnit.id);
      if (previousFeature) {
        this.layerSource.removeFeature(previousFeature);
        this.featureCount -= 1;
      }
      this.layerSource.addFeature(this.createRouteFeature(moveableUnit));
      this.featureCount += 1;
    }
  }

  updateRouteFeature(moveableUnit: GameEntityWithRoute) {
    const feature = this.findFeatureByKey("id", moveableUnit.id);
    if (feature && moveableUnit.route.length > 0) {
      const routeWaypoints = this.generateRouteWaypoints(
        moveableUnit.latitude,
        moveableUnit.longitude,
        moveableUnit.route
      );
      feature.setGeometry(new LineString(routeWaypoints));
    }
  }
}

export class WeaponLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(weaponStyle, projection, zIndex);
    this.layer.set("name", "weaponLayer");
  }

  createWeaponFeature(weapon: Weapon) {
    return new Feature({
      type: "weapon",
      geometry: new Point(
        fromLonLat([weapon.longitude, weapon.latitude], this.projection)
      ),
      id: weapon.id,
      name: weapon.name,
      heading: weapon.heading,
      sideId: weapon.sideId,
      sideColor: weapon.sideColor,
      currentHp: weapon.currentHp,
      maxHp: weapon.maxHp,
      healthRatio: weapon.getHealthFraction(),
    });
  }

  refresh(weaponList: Weapon[]) {
    const weaponFeatures = weaponList.map((weapon) =>
      this.createWeaponFeature(weapon)
    );
    this.refreshFeatures(weaponFeatures);
  }
}

export class WeaponTrajectoryLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(weaponTrajectoryStyle, projection, zIndex);
    this.layer.set("name", "weaponTrajectoryLayer");
  }

  createTrajectoryFeatures(weapon: Weapon, scenario: Scenario) {
    const profileId = resolveWeaponTrajectoryProfileId(weapon);
    if (!isTrajectoryWeaponProfile(profileId)) {
      return [];
    }

    const launchLongitude = weapon.launchLongitude ?? weapon.longitude;
    const launchLatitude = weapon.launchLatitude ?? weapon.latitude;
    const start = fromLonLat(
      [launchLongitude, launchLatitude],
      this.projection
    );
    const current = fromLonLat(
      [weapon.longitude, weapon.latitude],
      this.projection
    );
    const activeDistance = Math.hypot(
      current[0] - start[0],
      current[1] - start[1]
    );
    if (activeDistance < 1) {
      return [];
    }

    const targetCoordinates = resolveWeaponTargetCoordinates(weapon, scenario);
    const projectedTarget = targetCoordinates
      ? fromLonLat(
          [targetCoordinates.longitude, targetCoordinates.latitude],
          this.projection
        )
      : null;
    const totalDistance = projectedTarget
      ? Math.hypot(projectedTarget[0] - start[0], projectedTarget[1] - start[1])
      : activeDistance;
    const progressRatio =
      projectedTarget && totalDistance > 0
        ? clamp(activeDistance / totalDistance, 0.04, 0.98)
        : 1;
    const activeCoordinates = buildQuadraticBezierCoordinates(
      start,
      projectedTarget ?? current,
      weapon.id,
      profileId,
      progressRatio
    );

    activeCoordinates[activeCoordinates.length - 1] = current;

    const features = [
      buildWeaponTrajectoryFeature(activeCoordinates, weapon, "active"),
    ];

    if (projectedTarget && totalDistance > activeDistance + 1) {
      features.unshift(
        buildWeaponTrajectoryFeature(
          buildQuadraticBezierCoordinates(
            start,
            projectedTarget,
            weapon.id,
            profileId,
            1
          ),
          weapon,
          "projected"
        )
      );
    }

    return features;
  }

  refresh(weaponList: Weapon[], scenario: Scenario) {
    const trajectoryFeatures = weaponList.flatMap((weapon) =>
      this.createTrajectoryFeatures(weapon, scenario)
    );
    this.refreshFeatures(trajectoryFeatures);
  }
}

export class FeatureLabelLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(featureLabelStyle, projection, zIndex);
    this.layer.set("name", "featureLabelLayer");
  }

  getFeatureType(entity: GameEntity) {
    if (entity instanceof Aircraft) {
      return "aircraft";
    } else if (entity instanceof Army) {
      return "army";
    } else if (entity instanceof Facility) {
      return "facility";
    } else if (entity instanceof Airbase) {
      return "airbase";
    } else if (entity instanceof Weapon) {
      return "weapon";
    } else if (entity instanceof Ship) {
      return "ship";
    } else if (entity instanceof ReferencePoint) {
      return "referencePoint";
    } else {
      return "unknown";
    }
  }

  createFeatureLabelFeature(entity: GameEntity) {
    return new Feature({
      type: this.getFeatureType(entity) + "FeatureLabel",
      id: entity.id,
      name: entity.name,
      geometry: new Point(
        fromLonLat([entity.longitude, entity.latitude], this.projection)
      ),
      sideColor: entity.sideColor,
      selected:
        (entity instanceof Aircraft ||
          entity instanceof Army ||
          entity instanceof Ship) &&
        entity.selected,
      ...(isCombatEntity(entity)
        ? {
            currentHp: entity.currentHp,
            maxHp: entity.maxHp,
            healthRatio: entity.getHealthFraction(),
          }
        : {}),
    });
  }

  refresh(entities: GameEntity[]) {
    const entityFeatures = entities.map((entity) =>
      this.createFeatureLabelFeature(entity)
    );
    this.refreshFeatures(entityFeatures);
  }

  refreshSubset(entities: GameEntity[], entityType: string) {
    const featureType = entityType + "FeatureLabel";
    this.layerSource.getFeatures().forEach((feature) => {
      if (feature.getProperties().type === featureType) {
        this.layerSource.removeFeature(feature);
        this.featureCount -= 1;
      }
    });
    entities.forEach((entity) => {
      this.layerSource.addFeature(this.createFeatureLabelFeature(entity));
    });
    this.featureCount += entities.length;
  }

  addFeatureLabelFeature(entity: GameEntity) {
    this.layerSource.addFeature(this.createFeatureLabelFeature(entity));
    this.featureCount += 1;
  }

  updateFeatureLabelFeature(entityId: string, newLabel: string) {
    const feature = this.findFeatureByKey("id", entityId);
    if (feature) {
      feature.set("name", newLabel);
    }
  }
}

export class ShipLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(shipStyle, projection, zIndex);
    this.layer.set("name", "shipLayer");
  }

  createShipFeature(ship: Ship) {
    const shipFeature = new Feature({
      type: "ship",
      geometry: new Point(
        fromLonLat([ship.longitude, ship.latitude], this.projection)
      ),
      id: ship.id,
      name: ship.name,
      heading: ship.heading,
      selected: ship.selected,
      sideId: ship.sideId,
      sideColor: ship.sideColor,
      currentHp: ship.currentHp,
      maxHp: ship.maxHp,
      healthRatio: ship.getHealthFraction(),
    });
    shipFeature.setId(ship.id);
    return shipFeature;
  }

  refresh(shipsList: Ship[]) {
    const shipFeatures = shipsList.map((ship) => this.createShipFeature(ship));
    this.refreshFeatures(shipFeatures);
  }

  addShipFeature(ship: Ship) {
    this.layerSource.addFeature(this.createShipFeature(ship));
    this.featureCount += 1;
  }

  updateShipFeature(
    shipId: string,
    shipSelected: boolean,
    shipHeading: number
  ) {
    const feature = this.findFeatureByKey("id", shipId);
    if (feature) {
      feature.set("selected", shipSelected);
      feature.set("heading", shipHeading);
    }
  }
}

export class ReferencePointLayer extends FeatureLayer {
  constructor(projection?: Projection, zIndex?: number) {
    super(referencePointStyle, projection, zIndex);
    this.layer.set("name", "referencePointLayer");
  }

  createReferencePointFeature(referencePoint: ReferencePoint) {
    return new Feature({
      type: "referencePoint",
      geometry: new Point(
        fromLonLat(
          [referencePoint.longitude, referencePoint.latitude],
          this.projection
        )
      ),
      id: referencePoint.id,
      name: referencePoint.name,
      sideId: referencePoint.sideId,
      sideColor: referencePoint.sideColor,
    });
  }

  refresh(referencePoints: ReferencePoint[]) {
    const referencePointFeatures = referencePoints.map((referencePoint) =>
      this.createReferencePointFeature(referencePoint)
    );
    this.refreshFeatures(referencePointFeatures);
  }

  addReferencePointFeature(referencePoint: ReferencePoint) {
    this.layerSource.addFeature(
      this.createReferencePointFeature(referencePoint)
    );
    this.featureCount += 1;
  }
}
