import * as Cesium from 'cesium';
import { resolveAssetUrl as assetUrl } from '../utils/assetPaths';

const SIDE_COLOR_MAP = {
	blue: '#7fe7ff',
	red: '#ff6b6b',
	silver: '#dce5f2',
	yellow: '#ffd166',
	green: '#80ed99',
	black: '#f1f5f9'
};

const AIRCRAFT_MODEL_MAP = [
	[/\b(kf-21|boramae)\b/i, '/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb'],
	[/\b(f-35|lightning|stealth|raptor)\b/i, '/3d-bundles/aircraft/models/f-35_lightning_ii_-_fighter_jet_-_free.glb'],
	[/\b(f-16|kf-16|falcon|fa-50|ta-50|t-50)\b/i, '/3d-bundles/aircraft/models/lockheed_martin_f-16ef_fighting_falcon.glb'],
	[/\b(f-15|strike eagle|eagle)\b/i, '/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb'],
	[/\b(apache|ah-64)\b/i, '/3d-bundles/aircraft/models/boeing_ah-64d_apache_combat_helicopter.glb'],
	[/\b(black hawk|blackhawk|uh-60|helicopter|helo|chinook)\b/i, '/3d-bundles/aircraft/models/sikorsky_uh-60m_blackhawk.glb'],
	[/\b(drone|uav|mq-|rq-|reaper|predator|global hawk)\b/i, '/3d-bundles/drone/models/animated_drone.glb']
];

const SHIP_MODEL_MAP = [
	[/\b(submarine|ssn|sss|sub)\b/i, '/3d-bundles/ships/uss_texas_ssn-775_submarine.glb'],
	[/\b(carrier|dokdo|amphibious|lhd)\b/i, '/3d-bundles/ships/hms_queen_elizabeth_r08_aircraft_carrier.glb']
];

const FACILITY_MODEL_MAP = [
	[/\b(patriot|mim-104)\b/i, '/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb'],
	[/\b(nasams)\b/i, '/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb'],
	[/\b(thaad|l-sam)\b/i, '/3d-bundles/artillery/models/thaad-2.glb'],
	[/\b(hyunmoo|ballistic|surface-to-surface|surface to surface|launcher)\b/i, '/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb'],
	[/\b(chunmoo|mlrs|himars|rocket)\b/i, '/3d-bundles/artillery/models/k9_thunder_artillery (1).glb'],
	[/\b(k9|k55|howitzer|artillery|paladin|m109)\b/i, '/3d-bundles/artillery/models/k9_thunder_artillery.glb'],
	[/\b(command vehicle|command post|m577)\b/i, '/3d-bundles/tank/models/m577_command_vehicle.glb'],
	[/\b(km900|humvee|hmmwv|wheeled)\b/i, '/3d-bundles/tank/models/south_korean_km900_apc.glb'],
	[/\b(m113|apc)\b/i, '/3d-bundles/tank/models/m113a1.glb'],
	[/\b(k2|tank|armor|tracked)\b/i, '/3d-bundles/tank/models/t-50_war_thunder.glb']
];

const WEAPON_MODEL_MAP = [
	[/\b(aim-|agm-|jassm|tomahawk|missile)\b/i, '/3d-bundles/missile/aim-120c_amraam.glb'],
	[/\b(shell|round|rocket|artillery)\b/i, '/3d-bundles/artillery/models/artillery_shell.glb']
];

const DEFAULT_UNIT_MODEL = {
	aircraft: '/3d-bundles/aircraft/models/f-15.glb',
	ship: '/3d-bundles/ships/type-45_destroyer_class.glb',
	facility: '/3d-bundles/tank/models/t-50_war_thunder.glb'
};

const UNIT_MODEL_URI_BY_ID = {
	'aircraft-apache':
		'/3d-bundles/aircraft/models/boeing_ah-64d_apache_combat_helicopter.glb',
	'aircraft-blackhawk':
		'/3d-bundles/aircraft/models/sikorsky_uh-60m_blackhawk.glb',
	'aircraft-f15-basic': '/3d-bundles/aircraft/models/f-15.glb',
	'aircraft-f15-lowpoly': '/3d-bundles/aircraft/models/low_poly_f-15.glb',
	'aircraft-f15-strike':
		'/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb',
	'aircraft-f16':
		'/3d-bundles/aircraft/models/lockheed_martin_f-16ef_fighting_falcon.glb',
	'aircraft-f35':
		'/3d-bundles/aircraft/models/f-35_lightning_ii_-_fighter_jet_-_free.glb',
	'aircraft-kf21':
		'/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb',
	'artillery-d30': '/3d-bundles/artillery/models/d-30_howitzer.glb',
	'artillery-howitzer':
		'/3d-bundles/artillery/models/howitzer_artillery_tank.glb',
	'artillery-hyunmoo':
		'/3d-bundles/artillery/models/hyunmoo5irbmlauncher.glb',
	'artillery-k9':
		'/3d-bundles/artillery/models/k9_thunder_artillery.glb',
	'artillery-k9-variant':
		'/3d-bundles/artillery/models/k9_thunder_artillery (1).glb',
	'artillery-nasams':
		'/3d-bundles/artillery/models/nasams_1_surface-to-air_missile_system.glb',
	'artillery-paladin':
		'/3d-bundles/artillery/models/m109a6_paladin_self-propelled_howitzer.glb',
	'artillery-patriot':
		'/3d-bundles/artillery/models/mim-104_patriot_surface-to-air_missile_sam.glb',
	'artillery-roketsan':
		'/3d-bundles/artillery/models/roketsan_missiles.glb',
	'artillery-thaad': '/3d-bundles/artillery/models/thaad-2.glb',
	'drone-animated': '/3d-bundles/drone/models/animated_drone.glb',
	'drone-quad': '/3d-bundles/drone/models/drone.glb',
	'ship-carrier':
		'/3d-bundles/ships/hms_queen_elizabeth_r08_aircraft_carrier.glb',
	'ship-destroyer': '/3d-bundles/ships/type-45_destroyer_class.glb',
	'ship-submarine': '/3d-bundles/ships/uss_texas_ssn-775_submarine.glb',
	'tank-km900': '/3d-bundles/tank/models/south_korean_km900_apc.glb',
	'tank-m113': '/3d-bundles/tank/models/m113a1.glb',
	'tank-m577': '/3d-bundles/tank/models/m577_command_vehicle.glb',
	'tank-tracked-armor': '/3d-bundles/tank/models/t-50_war_thunder.glb'
};

const WEAPON_MODEL_URI_BY_ID = {
	'weapon-air-to-air-missile': '/3d-bundles/missile/aim-120c_amraam.glb',
	'weapon-surface-missile': '/3d-bundles/missile/aim-120c_amraam.glb',
	'weapon-artillery-shell': '/3d-bundles/artillery/models/artillery_shell.glb'
};
const TRAJECTORY_WEAPON_SIGNATURE =
	/\b(aim-|agm-|asm|sam|aam|atgm|jdam|jassm|tomahawk|hyunmoo|guided|missile|rocket)\b/i;
const NON_TRAJECTORY_WEAPON_SIGNATURE =
	/\b(shell|round|bullet|cannon|gun|30mm|20mm|40mm|57mm|76mm|90mm|105mm|120mm|125mm|127mm|130mm|152mm|155mm)\b/i;

const DEFAULT_LOD_LEVEL = 'balanced';
const UNIT_SAMPLE_SECONDS = 0.35;
const WEAPON_SAMPLE_SECONDS = 0.28;
const LOD_CONFIG = {
	cinematic: {
		facilityModelBudget: 90,
		labelDistance: 140000,
		sidePressureBudget: 4,
		sidePressureDistance: 170000,
		sidePressureArrowWidth: 4.4,
		targetLinkBudget: 14,
		targetLinkDistance: 140000,
		targetLinkWidth: 3.4,
		targetLinkGlowPower: 0.24,
		unitGuideDistance: 150000,
		unitGuideWidth: 2.4,
		weaponGuideDistance: 130000,
		weaponGuideWidth: 2,
		unitTrailTime: 18,
		unitTrailWidth: 2.6,
		weaponImpactLinkDistance: 150000,
		weaponImpactLinkWidth: 3.2,
		weaponTrajectoryDistance: 165000,
		weaponTrajectoryWidth: 3.8,
		weaponTrajectoryProjectedWidth: 2.9,
		weaponTrailTime: 6,
		weaponPathWidth: 5,
		weaponGlowPower: 0.24,
		weaponModelScale: 1.18,
		weaponMinimumPixelSize: 28,
		weaponMaximumScale: 180,
		weaponPointSize: 8,
		impactLifetimeSeconds: 1.8,
		impactSmokeLifetimeSeconds: 4.8
	},
	balanced: {
		facilityModelBudget: 40,
		labelDistance: 90000,
		sidePressureBudget: 3,
		sidePressureDistance: 120000,
		sidePressureArrowWidth: 3.6,
		targetLinkBudget: 9,
		targetLinkDistance: 100000,
		targetLinkWidth: 2.8,
		targetLinkGlowPower: 0.2,
		unitGuideDistance: 110000,
		unitGuideWidth: 2,
		weaponGuideDistance: 90000,
		weaponGuideWidth: 1.7,
		unitTrailTime: 12,
		unitTrailWidth: 2.1,
		weaponImpactLinkDistance: 105000,
		weaponImpactLinkWidth: 2.7,
		weaponTrajectoryDistance: 118000,
		weaponTrajectoryWidth: 3.1,
		weaponTrajectoryProjectedWidth: 2.3,
		weaponTrailTime: 4.2,
		weaponPathWidth: 4,
		weaponGlowPower: 0.2,
		weaponModelScale: 1.05,
		weaponMinimumPixelSize: 22,
		weaponMaximumScale: 140,
		weaponPointSize: 6,
		impactLifetimeSeconds: 1.35,
		impactSmokeLifetimeSeconds: 3.6
	},
	performance: {
		facilityModelBudget: 8,
		labelDistance: 60000,
		sidePressureBudget: 2,
		sidePressureDistance: 80000,
		sidePressureArrowWidth: 2.8,
		targetLinkBudget: 4,
		targetLinkDistance: 70000,
		targetLinkWidth: 2.2,
		targetLinkGlowPower: 0.16,
		unitGuideDistance: 75000,
		unitGuideWidth: 1.6,
		weaponGuideDistance: 65000,
		weaponGuideWidth: 1.4,
		unitTrailTime: 8,
		unitTrailWidth: 1.6,
		weaponImpactLinkDistance: 76000,
		weaponImpactLinkWidth: 2.1,
		weaponTrajectoryDistance: 82000,
		weaponTrajectoryWidth: 2.3,
		weaponTrajectoryProjectedWidth: 1.8,
		weaponTrailTime: 2.8,
		weaponPathWidth: 3,
		weaponGlowPower: 0.16,
		weaponModelScale: 0.92,
		weaponMinimumPixelSize: 18,
		weaponMaximumScale: 100,
		weaponPointSize: 5,
		impactLifetimeSeconds: 1,
		impactSmokeLifetimeSeconds: 2.6
	}
};

const scratchPoint = new Cesium.Cartesian3();
const scratchHpr = new Cesium.HeadingPitchRoll();
const scratchOrientation = new Cesium.Quaternion();

function getLodConfig(lodLevel) {
	return LOD_CONFIG[lodLevel] ?? LOD_CONFIG[DEFAULT_LOD_LEVEL];
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function normalizeHeading(headingDeg) {
	return ((headingDeg % 360) + 360) % 360;
}

function colorForSide(sideColor, alpha = 1) {
	const normalized =
		typeof sideColor === 'string' && sideColor.trim().length > 0
			? sideColor.trim().toLowerCase()
			: 'silver';
	const cssColor = SIDE_COLOR_MAP[normalized] ?? normalized;
	return Cesium.Color.fromCssColorString(cssColor).withAlpha(alpha);
}

function buildSignature(item) {
	return `${item?.className ?? ''} ${item?.name ?? ''}`.toLowerCase();
}

function cartesianFromSnapshot(point, fallback = scratchPoint) {
	return Cesium.Cartesian3.fromDegrees(
		Number(point?.longitude) || 0,
		Number(point?.latitude) || 0,
		Math.max(0, Number(point?.altitudeMeters) || 0),
		undefined,
		fallback
	);
}

function resolveHeadingOrientation(point, headingDeg) {
	const position = cartesianFromSnapshot(point);
	scratchHpr.heading = Cesium.Math.toRadians(normalizeHeading(headingDeg || 0));
	scratchHpr.pitch = 0;
	scratchHpr.roll = 0;

	return Cesium.Transforms.headingPitchRollQuaternion(
		position,
		scratchHpr,
		undefined,
		undefined,
		scratchOrientation
	);
}

function createPositionProperty(point) {
	const property = new Cesium.SampledPositionProperty();
	property.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
	property.setInterpolationOptions({
		interpolationDegree: 1,
		interpolationAlgorithm: Cesium.LinearApproximation
	});
	property.addSample(Cesium.JulianDate.now(), cartesianFromSnapshot(point));
	return property;
}

function groundPointFromSnapshot(point) {
	return {
		longitude: Number(point?.longitude) || 0,
		latitude: Number(point?.latitude) || 0,
		altitudeMeters: 0
	};
}

function addPositionSample(positionProperty, point, seconds) {
	const targetTime = Cesium.JulianDate.addSeconds(
		Cesium.JulianDate.now(),
		seconds,
		new Cesium.JulianDate()
	);
	positionProperty.addSample(targetTime, cartesianFromSnapshot(point));
}

function buildVerticalGuidePositions(point) {
	return Cesium.Cartesian3.fromDegreesArrayHeights([
		Number(point?.longitude) || 0,
		Number(point?.latitude) || 0,
		Math.max(0, Number(point?.altitudeMeters) || 0),
		Number(point?.longitude) || 0,
		Number(point?.latitude) || 0,
		0
	]);
}

function buildArcPolylinePositions(sourcePoint, targetPoint, arcLiftMeters = 0) {
	const sourceLongitude = Number(sourcePoint?.longitude);
	const sourceLatitude = Number(sourcePoint?.latitude);
	const sourceAltitudeMeters = Math.max(
		0,
		Number(sourcePoint?.altitudeMeters) || 0
	);
	const targetLongitude = Number(targetPoint?.longitude);
	const targetLatitude = Number(targetPoint?.latitude);
	const targetAltitudeMeters = Math.max(
		0,
		Number(targetPoint?.altitudeMeters) || 0
	);

	if (
		!Number.isFinite(sourceLongitude) ||
		!Number.isFinite(sourceLatitude) ||
		!Number.isFinite(targetLongitude) ||
		!Number.isFinite(targetLatitude)
	) {
		return null;
	}

	const midpointLongitude = (sourceLongitude + targetLongitude) * 0.5;
	const midpointLatitude = (sourceLatitude + targetLatitude) * 0.5;
	const midpointAltitude =
		Math.max(sourceAltitudeMeters, targetAltitudeMeters) + arcLiftMeters;

	return Cesium.Cartesian3.fromDegreesArrayHeights([
		sourceLongitude,
		sourceLatitude,
		sourceAltitudeMeters,
		midpointLongitude,
		midpointLatitude,
		midpointAltitude,
		targetLongitude,
		targetLatitude,
		targetAltitudeMeters
	]);
}

function buildLinearPolylinePositions(points) {
	const coordinates = [];
	points.forEach((point) => {
		const longitude = Number(point?.longitude);
		const latitude = Number(point?.latitude);
		const altitudeMeters = Math.max(0, Number(point?.altitudeMeters) || 0);
		if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
			return;
		}

		coordinates.push(longitude, latitude, altitudeMeters);
	});

	return coordinates.length >= 6
		? Cesium.Cartesian3.fromDegreesArrayHeights(coordinates)
		: null;
}

function distanceMetersBetweenPoints(sourcePoint, targetPoint) {
	const sourceCartesian = Cesium.Cartesian3.fromDegrees(
		Number(sourcePoint?.longitude) || 0,
		Number(sourcePoint?.latitude) || 0,
		Math.max(0, Number(sourcePoint?.altitudeMeters) || 0)
	);
	const targetCartesian = Cesium.Cartesian3.fromDegrees(
		Number(targetPoint?.longitude) || 0,
		Number(targetPoint?.latitude) || 0,
		Math.max(0, Number(targetPoint?.altitudeMeters) || 0)
	);

	return Cesium.Cartesian3.distance(sourceCartesian, targetCartesian);
}

function bearingDegreesBetweenPoints(sourcePoint, targetPoint) {
	const latitudeRadians = Cesium.Math.toRadians(
		((Number(sourcePoint?.latitude) || 0) +
			(Number(targetPoint?.latitude) || 0)) *
			0.5
	);
	const eastMeters =
		((Number(targetPoint?.longitude) || 0) -
			(Number(sourcePoint?.longitude) || 0)) *
		111320 *
		Math.max(Math.cos(latitudeRadians), 0.01);
	const northMeters =
		((Number(targetPoint?.latitude) || 0) -
			(Number(sourcePoint?.latitude) || 0)) *
		110540;

	return normalizeHeading(Cesium.Math.toDegrees(Math.atan2(eastMeters, northMeters)));
}

function offsetPointByHeadingMeters(
	point,
	headingDeg,
	forwardMeters,
	rightMeters = 0,
	altitudeMeters = point?.altitudeMeters ?? 0
) {
	const headingRadians = Cesium.Math.toRadians(normalizeHeading(headingDeg || 0));
	const eastMeters =
		Math.sin(headingRadians) * forwardMeters +
		Math.cos(headingRadians) * rightMeters;
	const northMeters =
		Math.cos(headingRadians) * forwardMeters -
		Math.sin(headingRadians) * rightMeters;
	const latitude = Number(point?.latitude) || 0;
	const longitude = Number(point?.longitude) || 0;
	const nextLatitude = latitude + northMeters / 110540;
	const nextLongitude =
		longitude +
		eastMeters /
			(111320 * Math.max(Math.cos(Cesium.Math.toRadians(latitude)), 0.01));

	return {
		longitude: nextLongitude,
		latitude: nextLatitude,
		altitudeMeters: Math.max(0, Number(altitudeMeters) || 0)
	};
}

function findFirstMatchingModel(signature, candidates, fallbackModel) {
	for (const [pattern, modelPath] of candidates) {
		if (pattern.test(signature)) {
			return modelPath;
		}
	}

	return fallbackModel;
}

function resolveUnitModelFromProfileId(unit, totalUnits, lodConfig) {
	const uri = UNIT_MODEL_URI_BY_ID[unit?.modelId];
	if (!uri || unit?.entityType === 'airbase') {
		return null;
	}

	if (
		(unit.entityType === 'facility' || unit.entityType === 'army') &&
		totalUnits > lodConfig.facilityModelBudget
	) {
		return null;
	}

	if (unit.entityType === 'ship') {
		return {
			uri,
			scale: unit.modelId === 'ship-submarine' ? 1.1 : 1.9,
			minimumPixelSize: 36,
			maximumScale: 280
		};
	}

	if (unit.entityType === 'aircraft') {
		return {
			uri,
			scale:
				unit.modelId === 'drone-animated' || unit.modelId === 'drone-quad'
					? 1.2
					: 0.9,
			minimumPixelSize: 34,
			maximumScale: 220
		};
	}

	return {
		uri,
		scale:
			unit.modelId === 'artillery-patriot' ||
			unit.modelId === 'artillery-nasams' ||
			unit.modelId === 'artillery-thaad' ||
			unit.modelId === 'artillery-hyunmoo'
				? 1.15
				: 0.9,
		minimumPixelSize: 28,
		maximumScale: 180
	};
}

function resolveUnitModel(unit, totalUnits, lodConfig) {
	if (unit.entityType === 'airbase') {
		return null;
	}

	const resolvedByProfileId = resolveUnitModelFromProfileId(
		unit,
		totalUnits,
		lodConfig
	);
	if (resolvedByProfileId) {
		return resolvedByProfileId;
	}

	const signature = buildSignature(unit);
	if (unit.entityType === 'aircraft') {
		return {
			uri: findFirstMatchingModel(
				signature,
				AIRCRAFT_MODEL_MAP,
				DEFAULT_UNIT_MODEL.aircraft
			),
			scale: /\b(drone|uav|mq-|rq-)\b/i.test(signature) ? 1.2 : 0.9,
			minimumPixelSize: 34,
			maximumScale: 220
		};
	}

	if (unit.entityType === 'ship') {
		return {
			uri: findFirstMatchingModel(
				signature,
				SHIP_MODEL_MAP,
				DEFAULT_UNIT_MODEL.ship
			),
			scale: /\b(submarine|ssn|sss|sub)\b/i.test(signature) ? 1.1 : 1.9,
			minimumPixelSize: 36,
			maximumScale: 280
		};
	}

	if (
		(unit.entityType === 'facility' || unit.entityType === 'army') &&
		totalUnits <= lodConfig.facilityModelBudget
	) {
		return {
			uri: findFirstMatchingModel(
				signature,
				FACILITY_MODEL_MAP,
				DEFAULT_UNIT_MODEL.facility
			),
			scale: /\b(patriot|nasams|thaad|hyunmoo|launcher)\b/i.test(signature)
				? 1.15
				: 0.9,
			minimumPixelSize: 28,
			maximumScale: 180
		};
	}

	return null;
}

function resolveWeaponModel(weapon) {
	if (weapon?.modelId && WEAPON_MODEL_URI_BY_ID[weapon.modelId]) {
		return WEAPON_MODEL_URI_BY_ID[weapon.modelId];
	}

	return findFirstMatchingModel(
		buildSignature(weapon),
		WEAPON_MODEL_MAP,
		'/3d-bundles/artillery/models/artillery_shell.glb'
	);
}

function createLabel(name, sideColor, maxDistance) {
	return new Cesium.LabelGraphics({
		text: name,
		scale: 0.55,
		showBackground: true,
		backgroundColor: colorForSide(sideColor, 0.18),
		fillColor: Cesium.Color.WHITE,
		font: '600 24px Bahnschrift, sans-serif',
		pixelOffset: new Cesium.Cartesian2(0, -24),
		distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
			0,
			maxDistance
		),
		disableDepthTestDistance: Number.POSITIVE_INFINITY
	});
}

function formatBattleLabelAltitude(altitudeMeters) {
	return `${Math.round(Math.max(0, altitudeMeters || 0))}m`;
}

function formatBattleLabelSpeed(speedKts) {
	return `${Math.round(Math.max(0, speedKts || 0))}kt`;
}

function formatBattleLabelHp(hpFraction) {
	return `${Math.round(clamp(hpFraction || 0, 0, 1) * 100)}%`;
}

function buildUnitLabelText(unit, followTargetId) {
	const highlighted =
		unit.selected ||
		isTrackedTarget(followTargetId, 'unit', unit.id);

	if (!highlighted) {
		return unit.name;
	}

	return [
		unit.name,
		`${formatBattleLabelAltitude(unit.altitudeMeters)} · ${formatBattleLabelSpeed(
			unit.speedKts
		)} · HP ${formatBattleLabelHp(unit.hpFraction)} · WPN ${unit.weaponCount}`
	].join('\n');
}

function shouldShowUnitTrail(unit, followTargetId, lodLevel) {
	if (
		unit.selected ||
		isTrackedTarget(followTargetId, 'unit', unit.id)
	) {
		return true;
	}

	if (unit.entityType === 'aircraft') {
		return lodLevel !== 'performance';
	}

	if (unit.entityType === 'ship') {
		return lodLevel === 'cinematic' && unit.speedKts >= 18;
	}

	return false;
}

function createUnitTrailGraphics(unit, lodConfig) {
	return new Cesium.PathGraphics({
		show: true,
		leadTime: 0,
		trailTime: lodConfig.unitTrailTime,
		width:
			unit.selected || unit.entityType === 'aircraft'
				? lodConfig.unitTrailWidth
				: Math.max(1.4, lodConfig.unitTrailWidth - 0.4),
		material: new Cesium.PolylineGlowMaterialProperty({
			glowPower: unit.selected ? 0.2 : 0.12,
			color: colorForSide(unit.sideColor, unit.selected ? 0.72 : 0.4)
		})
	});
}

function resolveWeaponImpactPoint(state, weapon) {
	if (
		Number.isFinite(weapon.targetLongitude) &&
		Number.isFinite(weapon.targetLatitude)
	) {
		return {
			longitude: weapon.targetLongitude,
			latitude: weapon.targetLatitude,
			altitudeMeters: 0
		};
	}

	if (typeof weapon.targetId === 'string' && weapon.targetId.length > 0) {
		return resolveTargetPoint(state, weapon.targetId);
	}

	return null;
}

function isTrajectoryWeapon(weapon) {
	if (!weapon) {
		return false;
	}

	if (
		weapon.modelId === 'weapon-air-to-air-missile' ||
		weapon.modelId === 'weapon-surface-missile'
	) {
		return true;
	}
	if (weapon.modelId === 'weapon-artillery-shell') {
		return false;
	}

	const signature = buildSignature(weapon);
	if (NON_TRAJECTORY_WEAPON_SIGNATURE.test(signature)) {
		return false;
	}

	return TRAJECTORY_WEAPON_SIGNATURE.test(signature);
}

function shouldShowWeaponTrajectoryCorridor(weapon, followTargetId, lodLevel) {
	if (isTrackedTarget(followTargetId, 'weapon', weapon.id)) {
		return true;
	}

	if (!isTrajectoryWeapon(weapon)) {
		return false;
	}

	return lodLevel !== 'performance';
}

function resolveWeaponTrajectoryTargetPoint(state, weapon) {
	const impactPoint = resolveWeaponImpactPoint(state, weapon);
	if (impactPoint) {
		return impactPoint;
	}

	return offsetPointByHeadingMeters(
		weapon,
		weapon.headingDeg,
		clamp(Math.max(140, Number(weapon.speedKts) || 0) * 24, 2600, 18000),
		0,
		Math.max(0, Number(weapon.altitudeMeters) || 0)
	);
}

function normalizePointSnapshot(point) {
	if (
		!point ||
		!Number.isFinite(Number(point.longitude)) ||
		!Number.isFinite(Number(point.latitude))
	) {
		return null;
	}

	return {
		longitude: Number(point.longitude),
		latitude: Number(point.latitude),
		altitudeMeters: Math.max(0, Number(point.altitudeMeters) || 0)
	};
}

function normalizeWeaponInventoryItem(item) {
	if (
		!item ||
		typeof item.id !== 'string' ||
		typeof item.name !== 'string' ||
		typeof item.className !== 'string'
	) {
		return null;
	}

	return {
		id: item.id,
		name: item.name,
		className: item.className,
		quantity: Math.max(0, Number(item.quantity) || 0),
		maxQuantity: Math.max(0, Number(item.maxQuantity) || 0),
		modelId: typeof item.modelId === 'string' ? item.modelId : undefined
	};
}

function shouldShowWeaponImpactLink(weapon, followTargetId, lodLevel) {
	if (isTrackedTarget(followTargetId, 'weapon', weapon.id)) {
		return true;
	}

	return lodLevel !== 'performance';
}

function resolveTrackingOffsetRange(snapshot, type) {
	const speedKts = Math.max(0, Number(snapshot?.speedKts) || 0);
	switch (type) {
		case 'weapon':
			return clamp(550 + speedKts * 0.3, 650, 3200);
		case 'unit':
		default:
			if (snapshot?.entityType === 'aircraft') {
				return clamp(1800 + speedKts * 1.35, 2400, 9000);
			}
			if (snapshot?.entityType === 'ship') {
				return clamp(2200 + speedKts * 40, 2600, 7200);
			}
			return clamp(1200 + speedKts * 0.8, 1500, 5200);
	}
}

function resolveTrackingPitchDegrees(snapshot, type) {
	if (type === 'weapon') {
		return -18;
	}
	if (snapshot?.entityType === 'aircraft') {
		return -24;
	}
	if (snapshot?.entityType === 'ship') {
		return -30;
	}
	return -26;
}

function averageHeadingDegrees(headings) {
	if (!Array.isArray(headings) || headings.length === 0) {
		return 0;
	}

	let east = 0;
	let north = 0;
	headings.forEach((headingDeg) => {
		const headingRadians = Cesium.Math.toRadians(normalizeHeading(headingDeg));
		east += Math.sin(headingRadians);
		north += Math.cos(headingRadians);
	});

	if (Math.abs(east) < 1e-4 && Math.abs(north) < 1e-4) {
		return 0;
	}

	return normalizeHeading(Cesium.Math.toDegrees(Math.atan2(east, north)));
}

function shouldShowProjectedCourse(unit, followTargetId) {
	return (
		unit.selected ||
		isTrackedTarget(followTargetId, 'unit', unit.id)
	);
}

function resolveProjectedCourseDistanceMeters(unit) {
	if (unit.entityType === 'aircraft') {
		return clamp(unit.speedKts * 58, 4800, 22000);
	}
	if (unit.entityType === 'ship') {
		return clamp(unit.speedKts * 140, 2600, 11000);
	}
	return clamp(unit.speedKts * 55, 1800, 6400);
}

function resolveProjectedCoursePoint(state, unit) {
	const targetPoint =
		typeof unit.targetId === 'string' && unit.targetId.length > 0
			? resolveTargetPoint(state, unit.targetId)
			: null;
	if (
		targetPoint &&
		distanceMetersBetweenPoints(unit, targetPoint) <=
			resolveProjectedCourseDistanceMeters(unit) * 1.6
	) {
		return {
			...targetPoint,
			altitudeMeters:
				unit.entityType === 'aircraft'
					? Math.max(
							unit.altitudeMeters ?? 0,
							(targetPoint.altitudeMeters ?? 0) + 120
					  )
					: Math.max(0, targetPoint.altitudeMeters ?? 0)
		};
	}

	return offsetPointByHeadingMeters(
		unit,
		unit.headingDeg,
		resolveProjectedCourseDistanceMeters(unit),
		0,
		unit.altitudeMeters ?? 0
	);
}

function normalizeFollowTargetId(followTargetId) {
	return typeof followTargetId === 'string' && followTargetId.length > 0
		? followTargetId
		: null;
}

function parseFollowTargetId(followTargetId) {
	const normalizedTargetId = normalizeFollowTargetId(followTargetId);
	if (!normalizedTargetId) {
		return null;
	}

	if (normalizedTargetId.startsWith('weapon:')) {
		return {
			type: 'weapon',
			id: normalizedTargetId.slice('weapon:'.length)
		};
	}

	if (normalizedTargetId.startsWith('unit:')) {
		return {
			type: 'unit',
			id: normalizedTargetId.slice('unit:'.length)
		};
	}

	return {
		type: 'unit',
		id: normalizedTargetId
	};
}

function isTrackedTarget(followTargetId, type, id) {
	const parsedTarget = parseFollowTargetId(followTargetId);
	return Boolean(
		parsedTarget &&
			parsedTarget.type === type &&
			parsedTarget.id === id
	);
}

function isUnitGuideVisible(unit, followTargetId, lodLevel) {
	if (isTrackedTarget(followTargetId, 'unit', unit.id) || unit.selected) {
		return true;
	}

	if (unit.entityType === 'aircraft') {
		return lodLevel !== 'performance' || unit.altitudeMeters >= 300;
	}

	return false;
}

function isWeaponGuideVisible(weapon, followTargetId, lodLevel) {
	if (isTrackedTarget(followTargetId, 'weapon', weapon.id)) {
		return true;
	}

	return (
		lodLevel !== 'performance' &&
		weapon.altitudeMeters >= 500
	);
}

function unitGuideRadiusMeters(unit, emphasized = false) {
	const baseRadius =
		unit.entityType === 'aircraft'
			? 160 + clamp(unit.speedKts * 0.55, 0, 280)
			: 120 + clamp(unit.speedKts * 0.35, 0, 180);
	return emphasized ? baseRadius * 1.25 : baseRadius;
}

function weaponGuideRadiusMeters(weapon, emphasized = false) {
	const baseRadius = 70 + clamp(weapon.speedKts * 0.08, 0, 180);
	return emphasized ? baseRadius * 1.4 : baseRadius;
}

function resolveTargetPoint(state, targetId) {
	if (typeof targetId !== 'string' || targetId.length === 0) {
		return null;
	}

	const targetUnit = state.units.find((unit) => unit.id === targetId);
	if (targetUnit) {
		return {
			longitude: targetUnit.longitude,
			latitude: targetUnit.latitude,
			altitudeMeters: targetUnit.altitudeMeters ?? 0
		};
	}

	const targetWeapon = state.weapons.find((weapon) => weapon.id === targetId);
	if (targetWeapon) {
		return {
			longitude: targetWeapon.longitude,
			latitude: targetWeapon.latitude,
			altitudeMeters: targetWeapon.altitudeMeters ?? 0
		};
	}

	return null;
}

function estimateLinkArcLiftMeters(sourcePoint, targetPoint) {
	const sourceCartesian = Cesium.Cartesian3.fromDegrees(
		Number(sourcePoint?.longitude) || 0,
		Number(sourcePoint?.latitude) || 0,
		Math.max(0, Number(sourcePoint?.altitudeMeters) || 0)
	);
	const targetCartesian = Cesium.Cartesian3.fromDegrees(
		Number(targetPoint?.longitude) || 0,
		Number(targetPoint?.latitude) || 0,
		Math.max(0, Number(targetPoint?.altitudeMeters) || 0)
	);
	const distanceMeters = Cesium.Cartesian3.distance(
		sourceCartesian,
		targetCartesian
	);

	return clamp(distanceMeters * 0.14, 600, 14000);
}

function normalizeUnit(unit) {
	if (
		!unit ||
		typeof unit.id !== 'string' ||
		typeof unit.name !== 'string' ||
		typeof unit.entityType !== 'string' ||
		!Number.isFinite(Number(unit.latitude)) ||
		!Number.isFinite(Number(unit.longitude))
	) {
		return null;
	}

	return {
		id: unit.id,
		name: unit.name,
		className: typeof unit.className === 'string' ? unit.className : 'Unknown',
		entityType: unit.entityType,
		modelId: typeof unit.modelId === 'string' ? unit.modelId : undefined,
		profileHint:
			typeof unit.profileHint === 'string' ? unit.profileHint : 'base',
		groundUnit: unit.groundUnit === true,
		sideId: typeof unit.sideId === 'string' ? unit.sideId : 'unknown',
		sideName: typeof unit.sideName === 'string' ? unit.sideName : '미상',
		sideColor: typeof unit.sideColor === 'string' ? unit.sideColor : 'silver',
		latitude: Number(unit.latitude),
		longitude: Number(unit.longitude),
		altitudeMeters: Math.max(0, Number(unit.altitudeMeters) || 0),
		headingDeg: Number(unit.headingDeg) || 0,
		speedKts: Math.max(0, Number(unit.speedKts) || 0),
		weaponCount: Math.max(0, Number(unit.weaponCount) || 0),
		hpFraction: clamp(Number(unit.hpFraction) || 0, 0, 1),
		damageFraction: clamp(Number(unit.damageFraction) || 0, 0, 1),
		detectionRangeNm: Math.max(0, Number(unit.detectionRangeNm) || 0),
		detectionArcDegrees: Math.max(0, Number(unit.detectionArcDegrees) || 0),
		detectionHeadingDeg: Number(unit.detectionHeadingDeg) || 0,
		engagementRangeNm: Math.max(0, Number(unit.engagementRangeNm) || 0),
		currentFuel:
			typeof unit.currentFuel === 'number' && Number.isFinite(unit.currentFuel)
				? unit.currentFuel
				: undefined,
		maxFuel:
			typeof unit.maxFuel === 'number' && Number.isFinite(unit.maxFuel)
				? unit.maxFuel
				: undefined,
		fuelFraction:
			typeof unit.fuelFraction === 'number' && Number.isFinite(unit.fuelFraction)
				? clamp(unit.fuelFraction, 0, 1)
				: undefined,
		route: Array.isArray(unit.route)
			? unit.route.map(normalizePointSnapshot).filter(Boolean)
			: [],
		desiredRoute: Array.isArray(unit.desiredRoute)
			? unit.desiredRoute.map(normalizePointSnapshot).filter(Boolean)
			: [],
		weaponInventory: Array.isArray(unit.weaponInventory)
			? unit.weaponInventory.map(normalizeWeaponInventoryItem).filter(Boolean)
			: [],
		aircraftCount: Math.max(0, Number(unit.aircraftCount) || 0),
		homeBaseId:
			typeof unit.homeBaseId === 'string' ? unit.homeBaseId : undefined,
		rtb: unit.rtb === true,
		statusFlags: Array.isArray(unit.statusFlags)
			? unit.statusFlags.filter((flag) => typeof flag === 'string')
			: [],
		selected: unit.selected === true,
		targetId: typeof unit.targetId === 'string' ? unit.targetId : null
	};
}

function normalizeWeapon(weapon) {
	if (
		!weapon ||
		typeof weapon.id !== 'string' ||
		typeof weapon.name !== 'string' ||
		!Number.isFinite(Number(weapon.latitude)) ||
		!Number.isFinite(Number(weapon.longitude))
	) {
		return null;
	}

	return {
		id: weapon.id,
		name: weapon.name,
		className:
			typeof weapon.className === 'string' ? weapon.className : weapon.name,
		modelId: typeof weapon.modelId === 'string' ? weapon.modelId : undefined,
		launcherId:
			typeof weapon.launcherId === 'string' ? weapon.launcherId : 'unknown-launcher',
		launcherName:
			typeof weapon.launcherName === 'string'
				? weapon.launcherName
				: '발사 플랫폼',
		sideId: typeof weapon.sideId === 'string' ? weapon.sideId : 'unknown',
		sideName: typeof weapon.sideName === 'string' ? weapon.sideName : '미상',
		sideColor: typeof weapon.sideColor === 'string' ? weapon.sideColor : 'silver',
		latitude: Number(weapon.latitude),
		longitude: Number(weapon.longitude),
		altitudeMeters: Math.max(0, Number(weapon.altitudeMeters) || 0),
		launchLatitude: Number.isFinite(Number(weapon.launchLatitude))
			? Number(weapon.launchLatitude)
			: Number(weapon.latitude),
		launchLongitude: Number.isFinite(Number(weapon.launchLongitude))
			? Number(weapon.launchLongitude)
			: Number(weapon.longitude),
		launchAltitudeMeters: Math.max(
			0,
			Number(weapon.launchAltitudeMeters) || 0
		),
		headingDeg: Number(weapon.headingDeg) || 0,
		speedKts: Math.max(0, Number(weapon.speedKts) || 0),
		hpFraction: clamp(Number(weapon.hpFraction) || 0, 0, 1),
		targetId: typeof weapon.targetId === 'string' ? weapon.targetId : null,
		targetLatitude: Number.isFinite(Number(weapon.targetLatitude))
			? Number(weapon.targetLatitude)
			: undefined,
		targetLongitude: Number.isFinite(Number(weapon.targetLongitude))
			? Number(weapon.targetLongitude)
			: undefined
	};
}

function normalizeRecentEvent(event) {
	if (
		!event ||
		typeof event.id !== 'string' ||
		typeof event.message !== 'string' ||
		typeof event.sideId !== 'string'
	) {
		return null;
	}

	return {
		id: event.id,
		timestamp: Number(event.timestamp) || 0,
		sideId: event.sideId,
		sideName: typeof event.sideName === 'string' ? event.sideName : '미상',
		sideColor: typeof event.sideColor === 'string' ? event.sideColor : 'silver',
		type: typeof event.type === 'string' ? event.type : 'OTHER',
		message: event.message,
		actorId: typeof event.actorId === 'string' ? event.actorId : undefined,
		actorName: typeof event.actorName === 'string' ? event.actorName : undefined,
		sourceLatitude: Number.isFinite(Number(event.sourceLatitude))
			? Number(event.sourceLatitude)
			: undefined,
		sourceLongitude: Number.isFinite(Number(event.sourceLongitude))
			? Number(event.sourceLongitude)
			: undefined,
		sourceAltitudeMeters: Math.max(0, Number(event.sourceAltitudeMeters) || 0),
		targetId: typeof event.targetId === 'string' ? event.targetId : undefined,
		targetName: typeof event.targetName === 'string' ? event.targetName : undefined,
		targetLatitude: Number.isFinite(Number(event.targetLatitude))
			? Number(event.targetLatitude)
			: undefined,
		targetLongitude: Number.isFinite(Number(event.targetLongitude))
			? Number(event.targetLongitude)
			: undefined,
		targetAltitudeMeters: Math.max(0, Number(event.targetAltitudeMeters) || 0),
		weaponId: typeof event.weaponId === 'string' ? event.weaponId : undefined,
		focusLatitude: Number.isFinite(Number(event.focusLatitude))
			? Number(event.focusLatitude)
			: undefined,
		focusLongitude: Number.isFinite(Number(event.focusLongitude))
			? Number(event.focusLongitude)
			: undefined,
		focusAltitudeMeters: Math.max(0, Number(event.focusAltitudeMeters) || 0),
		resultTag: typeof event.resultTag === 'string' ? event.resultTag : undefined
	};
}

function getEventLifetimeSeconds(event) {
	switch (event.resultTag) {
		case 'launch':
			return 28;
		case 'impact':
		case 'damage':
		case 'kill':
		case 'miss':
			return 42;
		default:
			if (event.type === 'WEAPON_LAUNCHED') {
				return 28;
			}
			if (event.type === 'WEAPON_HIT' || event.type === 'WEAPON_MISSED') {
				return 42;
			}
			return 18;
	}
}

function getEventLabel(event) {
	switch (event.resultTag) {
		case 'launch':
			return '발사';
		case 'impact':
			return '착탄';
		case 'damage':
			return '명중';
		case 'kill':
			return '격파';
		case 'miss':
			return '실패';
		default:
			if (event.type === 'WEAPON_LAUNCHED') {
				return '발사';
			}
			if (event.type === 'WEAPON_HIT') {
				return '명중';
			}
			if (event.type === 'WEAPON_MISSED') {
				return '실패';
			}
			return '교전';
	}
}

function getEventSourcePoint(event) {
	if (
		Number.isFinite(event.sourceLongitude) &&
		Number.isFinite(event.sourceLatitude)
	) {
		return {
			longitude: event.sourceLongitude,
			latitude: event.sourceLatitude,
			altitudeMeters: event.sourceAltitudeMeters ?? 0
		};
	}

	return null;
}

function isLaunchEvent(event) {
	return (
		event.resultTag === 'launch' ||
		event.resultTag === 'counterfire' ||
		event.type === 'WEAPON_LAUNCHED'
	);
}

function isImpactEvent(event) {
	return (
		event.resultTag === 'impact' ||
		event.resultTag === 'damage' ||
		event.resultTag === 'kill' ||
		event.resultTag === 'miss' ||
		event.type === 'WEAPON_HIT' ||
		event.type === 'WEAPON_MISSED'
	);
}

function getEventFocusPoint(event) {
	if (
		Number.isFinite(event.focusLongitude) &&
		Number.isFinite(event.focusLatitude)
	) {
		return {
			longitude: event.focusLongitude,
			latitude: event.focusLatitude,
			altitudeMeters: event.focusAltitudeMeters ?? 0
		};
	}

	if (
		Number.isFinite(event.targetLongitude) &&
		Number.isFinite(event.targetLatitude)
	) {
		return {
			longitude: event.targetLongitude,
			latitude: event.targetLatitude,
			altitudeMeters: event.targetAltitudeMeters ?? 0
		};
	}

	return null;
}

function buildEventPolylinePositions(event) {
	if (
		!Number.isFinite(event.sourceLongitude) ||
		!Number.isFinite(event.sourceLatitude)
	) {
		return null;
	}

	const focusPoint = getEventFocusPoint(event);
	if (!focusPoint) {
		return null;
	}

	return Cesium.Cartesian3.fromDegreesArrayHeights([
		event.sourceLongitude,
		event.sourceLatitude,
		event.sourceAltitudeMeters ?? 0,
		focusPoint.longitude,
		focusPoint.latitude,
		focusPoint.altitudeMeters ?? 0
	]);
}

function estimateEventTracerDurationSeconds(sourcePoint, focusPoint) {
	const sourceCartesian = Cesium.Cartesian3.fromDegrees(
		sourcePoint.longitude,
		sourcePoint.latitude,
		sourcePoint.altitudeMeters ?? 0
	);
	const focusCartesian = Cesium.Cartesian3.fromDegrees(
		focusPoint.longitude,
		focusPoint.latitude,
		focusPoint.altitudeMeters ?? 0
	);
	const distanceMeters = Cesium.Cartesian3.distance(
		sourceCartesian,
		focusCartesian
	);

	return clamp(distanceMeters / 20000, 0.8, 4.8);
}

function buildHotspotRows(state) {
	const hotspotMap = new Map();
	const addContribution = ({
		longitude,
		latitude,
		altitudeMeters,
		score,
		sideId,
		sideName,
		sideColor,
		timestamp,
		message,
		kind
	}) => {
		if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
			return;
		}

		const gridLongitude = Math.round(longitude / 0.04) * 0.04;
		const gridLatitude = Math.round(latitude / 0.04) * 0.04;
		const key = `${gridLongitude.toFixed(2)}:${gridLatitude.toFixed(2)}`;
		if (!hotspotMap.has(key)) {
			hotspotMap.set(key, {
				weight: 0,
				weightedLongitude: 0,
				weightedLatitude: 0,
				weightedAltitude: 0,
				eventCount: 0,
				launchCount: 0,
				impactCount: 0,
				activeWeapons: 0,
				latestTimestamp: 0,
				latestMessage: null,
				sideWeights: new Map()
			});
		}

		const entry = hotspotMap.get(key);
		entry.weight += score;
		entry.weightedLongitude += longitude * score;
		entry.weightedLatitude += latitude * score;
		entry.weightedAltitude += altitudeMeters * score;
		entry.eventCount += 1;
		if (kind === 'weapon') {
			entry.activeWeapons += 1;
		}
		if (kind === 'launch') {
			entry.launchCount += 1;
		}
		if (kind === 'impact') {
			entry.impactCount += 1;
		}
		if (timestamp >= entry.latestTimestamp) {
			entry.latestTimestamp = timestamp;
			entry.latestMessage = message ?? null;
		}

		const currentSide = entry.sideWeights.get(sideId) ?? {
			name: sideName,
			color: sideColor,
			score: 0
		};
		currentSide.score += score;
		entry.sideWeights.set(sideId, currentSide);
	};

	(state.weapons ?? []).forEach((weapon) => {
		addContribution({
			longitude: weapon.longitude,
			latitude: weapon.latitude,
			altitudeMeters: weapon.altitudeMeters ?? 0,
			score: 5,
			sideId: weapon.sideId,
			sideName: weapon.sideName,
			sideColor: weapon.sideColor,
			timestamp: state.currentTime ?? 0,
			message: `${weapon.name} 비행 중`,
			kind: 'weapon'
		});
	});

	(state.recentEvents ?? []).forEach((event) => {
		const focusPoint = getEventFocusPoint(event);
		if (!focusPoint) {
			return;
		}

		addContribution({
			longitude: focusPoint.longitude,
			latitude: focusPoint.latitude,
			altitudeMeters: focusPoint.altitudeMeters ?? 0,
			score: isImpactEvent(event) ? 4 : isLaunchEvent(event) ? 3 : 2,
			sideId: event.sideId,
			sideName: event.sideName,
			sideColor: event.sideColor,
			timestamp: event.timestamp ?? 0,
			message: event.message,
			kind:
				isImpactEvent(event)
					? 'impact'
					: isLaunchEvent(event)
						? 'launch'
						: 'engagement'
		});
	});

	return [...hotspotMap.entries()]
		.map(([key, entry], index) => {
			const dominantSide =
				[...entry.sideWeights.values()].sort((left, right) => {
					if (left.score !== right.score) {
						return right.score - left.score;
					}
					return left.name.localeCompare(right.name, 'ko-KR');
				})[0] ?? {
					name: '미상 세력',
					color: 'silver',
					score: 0
				};
			const score = Math.round(
				entry.weight + entry.activeWeapons * 3 + entry.impactCount * 2
			);

			return {
				id: `${index}-${key}`,
				label:
					score >= 18
						? '초고열'
						: score >= 12
							? '고열'
							: score >= 7
								? '접전'
								: '활동',
				longitude: entry.weightedLongitude / Math.max(1, entry.weight),
				latitude: entry.weightedLatitude / Math.max(1, entry.weight),
				altitudeMeters: entry.weightedAltitude / Math.max(1, entry.weight),
				radiusMeters: clamp(900 + score * 160, 1200, 5200),
				score,
				eventCount: entry.eventCount,
				activeWeapons: entry.activeWeapons,
				dominantSideName: dominantSide.name,
				dominantSideColor: dominantSide.color,
				latestTimestamp: entry.latestTimestamp,
				latestMessage: entry.latestMessage
			};
		})
		.sort((left, right) => {
			if (left.score !== right.score) {
				return right.score - left.score;
			}
			return right.latestTimestamp - left.latestTimestamp;
		})
		.slice(0, 4);
}

function hotspotColumnLengthMeters(hotspot) {
	return clamp(240 + hotspot.score * 52, 320, 1200);
}

function buildSidePressureRows(state) {
	const sideMap = new Map();

	(state.units ?? []).forEach((unit) => {
		const weight =
			(unit.entityType === 'aircraft'
				? 1.2
				: unit.entityType === 'ship'
					? 1.6
					: unit.entityType === 'airbase'
						? 1.3
						: 1) *
			(0.7 + clamp(unit.hpFraction ?? 0.6, 0.2, 1));
		if (!sideMap.has(unit.sideId)) {
			sideMap.set(unit.sideId, {
				sideId: unit.sideId,
				sideName: unit.sideName,
				sideColor: unit.sideColor,
				units: [],
				weightedLongitude: 0,
				weightedLatitude: 0,
				weightedAltitude: 0,
				totalWeight: 0,
				aircraftCount: 0,
				shipCount: 0,
				weaponCapacity: 0,
				headings: [],
				weaponsInFlight: 0,
				recentLaunches: 0,
				recentImpacts: 0
			});
		}

		const entry = sideMap.get(unit.sideId);
		entry.units.push(unit);
		entry.weightedLongitude += unit.longitude * weight;
		entry.weightedLatitude += unit.latitude * weight;
		entry.weightedAltitude += (unit.altitudeMeters ?? 0) * weight;
		entry.totalWeight += weight;
		entry.weaponCapacity += unit.weaponCount ?? 0;
		if ((unit.speedKts ?? 0) >= 6) {
			entry.headings.push(unit.headingDeg ?? 0);
		}
		if (unit.entityType === 'aircraft') {
			entry.aircraftCount += 1;
		}
		if (unit.entityType === 'ship') {
			entry.shipCount += 1;
		}
	});

	(state.weapons ?? []).forEach((weapon) => {
		const entry = sideMap.get(weapon.sideId);
		if (!entry) {
			return;
		}
		entry.weaponsInFlight += 1;
	});

	(state.recentEvents ?? []).forEach((event) => {
		const entry = sideMap.get(event.sideId);
		if (!entry) {
			return;
		}
		if (isLaunchEvent(event)) {
			entry.recentLaunches += 1;
		}
		if (isImpactEvent(event)) {
			entry.recentImpacts += 1;
		}
	});

	const centers = [...sideMap.values()].map((entry) => ({
		sideId: entry.sideId,
		sideName: entry.sideName,
		sideColor: entry.sideColor,
		unitCount: entry.units.length,
		center: {
			longitude: entry.weightedLongitude / Math.max(1, entry.totalWeight),
			latitude: entry.weightedLatitude / Math.max(1, entry.totalWeight),
			altitudeMeters: entry.weightedAltitude / Math.max(1, entry.totalWeight)
		},
		headings: entry.headings,
		weaponCapacity: entry.weaponCapacity,
		weaponsInFlight: entry.weaponsInFlight,
		recentLaunches: entry.recentLaunches,
		recentImpacts: entry.recentImpacts,
		aircraftCount: entry.aircraftCount,
		shipCount: entry.shipCount,
		units: entry.units
	}));

	return centers
		.map((entry) => {
			const otherCenters = centers.filter((candidate) => candidate.sideId !== entry.sideId);
			const opponentCenter =
				otherCenters.length > 0
					? {
							longitude:
								otherCenters.reduce(
									(sum, candidate) => sum + candidate.center.longitude * candidate.unitCount,
									0
								) /
								otherCenters.reduce(
									(sum, candidate) => sum + candidate.unitCount,
									0
								),
							latitude:
								otherCenters.reduce(
									(sum, candidate) => sum + candidate.center.latitude * candidate.unitCount,
									0
								) /
								otherCenters.reduce(
									(sum, candidate) => sum + candidate.unitCount,
									0
								),
							altitudeMeters: 0
					  }
					: null;
			const headingDeg = opponentCenter
				? bearingDegreesBetweenPoints(entry.center, opponentCenter)
				: averageHeadingDegrees(entry.headings);
			const spreadMeters = entry.units.reduce((maxDistance, unit) => {
				return Math.max(
					maxDistance,
					distanceMetersBetweenPoints(entry.center, unit)
				);
			}, 0);
			const pressureScore = Math.round(
				entry.units.length * 2.4 +
					entry.weaponsInFlight * 3.2 +
					entry.recentLaunches * 1.3 +
					entry.recentImpacts * 1.2 +
					entry.aircraftCount * 1.6 +
					entry.shipCount * 2.1 +
					entry.weaponCapacity * 0.1
			);
			const semiMajorAxis = clamp(
				spreadMeters * 0.92 + 900 + entry.weaponsInFlight * 120,
				1400,
				14000
			);
			const semiMinorAxis = clamp(
				spreadMeters * 0.58 + 700 + entry.units.length * 90,
				900,
				10000
			);
			const arrowLengthMeters = clamp(
				semiMajorAxis * 0.78 +
					entry.recentLaunches * 220 +
					entry.weaponsInFlight * 180,
				1800,
				16000
			);

			return {
				sideId: entry.sideId,
				sideName: entry.sideName,
				sideColor: entry.sideColor,
				center: entry.center,
				headingDeg,
				pressureScore,
				semiMajorAxis,
				semiMinorAxis,
				arrowLengthMeters,
				frontPoint: offsetPointByHeadingMeters(
					entry.center,
					headingDeg,
					arrowLengthMeters,
					0,
					0
				),
				unitCount: entry.units.length,
				weaponsInFlight: entry.weaponsInFlight
			};
		})
		.sort((left, right) => {
			if (left.pressureScore !== right.pressureScore) {
				return right.pressureScore - left.pressureScore;
			}
			return right.unitCount - left.unitCount;
		});
}

function defaultBattleState() {
	return {
		scenarioId: 'unknown-scenario',
		scenarioName: '전장 관전자',
		currentTime: 0,
		currentSideId: '',
		currentSideName: '',
		units: [],
		weapons: [],
		recentEvents: [],
		stats: {
			aircraft: 0,
			facilities: 0,
			airbases: 0,
			ships: 0,
			weaponsInFlight: 0,
			sides: 0
		},
		view: {
			followTargetId: null,
			lodLevel: DEFAULT_LOD_LEVEL
		}
	};
}

export class BattleSpectatorSystem {
	constructor(viewer) {
		this.viewer = viewer;
		this.dataSource = new Cesium.CustomDataSource('firescope-battle-spectator');
		this.viewer.dataSources.add(this.dataSource);
		this.state = defaultBattleState();
		this.unitRecords = new Map();
		this.weaponRecords = new Map();
		this.linkRecords = new Map();
		this.sidePressureRecords = new Map();
		this.eventRecords = new Map();
		this.hotspotRecords = new Map();
		this.effects = [];
		this.trackedBattleEntityId = null;
		this.animationTime = 0;
	}

	normalizeState(payload = {}) {
		return {
			scenarioId:
				typeof payload.scenarioId === 'string'
					? payload.scenarioId
					: 'unknown-scenario',
			scenarioName:
				typeof payload.scenarioName === 'string'
					? payload.scenarioName
					: '전장 관전자',
			currentTime: Number(payload.currentTime) || 0,
			currentSideId:
				typeof payload.currentSideId === 'string' ? payload.currentSideId : '',
			currentSideName:
				typeof payload.currentSideName === 'string'
					? payload.currentSideName
					: '',
			units: Array.isArray(payload.units)
				? payload.units.map(normalizeUnit).filter(Boolean)
				: [],
			weapons: Array.isArray(payload.weapons)
				? payload.weapons.map(normalizeWeapon).filter(Boolean)
				: [],
			recentEvents: Array.isArray(payload.recentEvents)
				? payload.recentEvents.map(normalizeRecentEvent).filter(Boolean)
				: [],
			stats: {
				aircraft: Math.max(0, Number(payload.stats?.aircraft) || 0),
				facilities: Math.max(0, Number(payload.stats?.facilities) || 0),
				airbases: Math.max(0, Number(payload.stats?.airbases) || 0),
				ships: Math.max(0, Number(payload.stats?.ships) || 0),
				weaponsInFlight: Math.max(
					0,
					Number(payload.stats?.weaponsInFlight) || 0
				),
				sides: Math.max(0, Number(payload.stats?.sides) || 0)
			},
			view: {
				followTargetId: normalizeFollowTargetId(payload.view?.followTargetId),
				lodLevel:
					typeof payload.view?.lodLevel === 'string' &&
					LOD_CONFIG[payload.view.lodLevel]
						? payload.view.lodLevel
						: DEFAULT_LOD_LEVEL
			}
		};
	}

	setState(payload = {}) {
		const nextState = this.normalizeState(payload);
		const lodChanged =
			nextState.view.lodLevel !== this.state.view?.lodLevel;
		this.state = nextState;
		if (lodChanged) {
			this.rebuildEntities();
		}
		this.syncUnits();
		this.syncWeapons();
		this.syncRecentEvents();
		this.syncHotspots();
		this.syncSidePressures();
		this.syncTargetLinks();
		this.syncCameraTracking();
	}

	createUnitGuideEntity(unit) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		if (!isUnitGuideVisible(unit, this.state.view?.followTargetId, lodLevel)) {
			return null;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized =
			unit.selected ||
			isTrackedTarget(this.state.view?.followTargetId, 'unit', unit.id);
		const radiusMeters = unitGuideRadiusMeters(unit, emphasized);
		const guideColor = colorForSide(
			unit.sideColor,
			emphasized ? 0.82 : 0.42
		);
		const guideEntity = this.dataSource.entities.add({
			id: `battle-unit-guide-${unit.id}`,
			position: cartesianFromSnapshot(groundPointFromSnapshot(unit)),
			polyline: {
				positions: buildVerticalGuidePositions(unit),
				width: emphasized
					? lodConfig.unitGuideWidth + 0.8
					: lodConfig.unitGuideWidth,
				material: new Cesium.PolylineGlowMaterialProperty({
					glowPower: emphasized ? 0.18 : 0.11,
					color: guideColor
				}),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.unitGuideDistance
				)
			},
			ellipse: {
				semiMajorAxis: radiusMeters,
				semiMinorAxis: radiusMeters,
				height: 0,
				material: colorForSide(
					unit.sideColor,
					emphasized ? 0.09 : 0.04
				),
				outline: true,
				outlineColor: guideColor,
				outlineWidth: emphasized ? 2.2 : 1.2,
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.unitGuideDistance
				)
			}
		});

		return {
			entity: guideEntity,
			emphasized
		};
	}

	updateUnitGuideEntity(record, unit) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		const showGuide = isUnitGuideVisible(
			unit,
			this.state.view?.followTargetId,
			lodLevel
		);
		if (!showGuide) {
			if (record.guideEntity) {
				this.dataSource.entities.remove(record.guideEntity.entity);
				record.guideEntity = null;
			}
			return;
		}

		if (!record.guideEntity) {
			record.guideEntity = this.createUnitGuideEntity(unit);
			return;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized =
			unit.selected ||
			isTrackedTarget(this.state.view?.followTargetId, 'unit', unit.id);
		const radiusMeters = unitGuideRadiusMeters(unit, emphasized);
		record.guideEntity.emphasized = emphasized;
		record.guideEntity.entity.position = cartesianFromSnapshot(
			groundPointFromSnapshot(unit)
		);
		if (record.guideEntity.entity.polyline) {
			record.guideEntity.entity.polyline.positions =
				buildVerticalGuidePositions(unit);
			record.guideEntity.entity.polyline.width = emphasized
				? lodConfig.unitGuideWidth + 0.8
				: lodConfig.unitGuideWidth;
			record.guideEntity.entity.polyline.material =
				new Cesium.PolylineGlowMaterialProperty({
					glowPower: emphasized ? 0.18 : 0.11,
					color: colorForSide(unit.sideColor, emphasized ? 0.82 : 0.42)
				});
			record.guideEntity.entity.polyline.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.unitGuideDistance);
		}
		if (record.guideEntity.entity.ellipse) {
			record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
			record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
			record.guideEntity.entity.ellipse.material = colorForSide(
				unit.sideColor,
				emphasized ? 0.09 : 0.04
			);
			record.guideEntity.entity.ellipse.outlineColor = colorForSide(
				unit.sideColor,
				emphasized ? 0.82 : 0.42
			);
			record.guideEntity.entity.ellipse.outlineWidth = emphasized ? 2.2 : 1.2;
			record.guideEntity.entity.ellipse.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.unitGuideDistance);
		}
	}

	createWeaponGuideEntity(weapon) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		if (!isWeaponGuideVisible(weapon, this.state.view?.followTargetId, lodLevel)) {
			return null;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'weapon',
			weapon.id
		);
		const radiusMeters = weaponGuideRadiusMeters(weapon, emphasized);
		const guideColor = colorForSide(
			weapon.sideColor,
			emphasized ? 0.86 : 0.45
		);
		const guideEntity = this.dataSource.entities.add({
			id: `battle-weapon-guide-${weapon.id}`,
			position: cartesianFromSnapshot(groundPointFromSnapshot(weapon)),
			polyline: {
				positions: buildVerticalGuidePositions(weapon),
				width: emphasized
					? lodConfig.weaponGuideWidth + 0.6
					: lodConfig.weaponGuideWidth,
				material: new Cesium.PolylineGlowMaterialProperty({
					glowPower: emphasized ? 0.24 : 0.14,
					color: guideColor
				}),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.weaponGuideDistance
				)
			},
			ellipse: {
				semiMajorAxis: radiusMeters,
				semiMinorAxis: radiusMeters,
				height: 0,
				material: colorForSide(
					weapon.sideColor,
					emphasized ? 0.08 : 0.035
				),
				outline: true,
				outlineColor: guideColor,
				outlineWidth: emphasized ? 1.9 : 1.1,
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.weaponGuideDistance
				)
			}
		});

		return {
			entity: guideEntity,
			emphasized
		};
	}

	updateWeaponGuideEntity(record, weapon) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		const showGuide = isWeaponGuideVisible(
			weapon,
			this.state.view?.followTargetId,
			lodLevel
		);
		if (!showGuide) {
			if (record.guideEntity) {
				this.dataSource.entities.remove(record.guideEntity.entity);
				record.guideEntity = null;
			}
			return;
		}

		if (!record.guideEntity) {
			record.guideEntity = this.createWeaponGuideEntity(weapon);
			return;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'weapon',
			weapon.id
		);
		const radiusMeters = weaponGuideRadiusMeters(weapon, emphasized);
		record.guideEntity.emphasized = emphasized;
		record.guideEntity.entity.position = cartesianFromSnapshot(
			groundPointFromSnapshot(weapon)
		);
		if (record.guideEntity.entity.polyline) {
			record.guideEntity.entity.polyline.positions =
				buildVerticalGuidePositions(weapon);
			record.guideEntity.entity.polyline.width = emphasized
				? lodConfig.weaponGuideWidth + 0.6
				: lodConfig.weaponGuideWidth;
			record.guideEntity.entity.polyline.material =
				new Cesium.PolylineGlowMaterialProperty({
					glowPower: emphasized ? 0.24 : 0.14,
					color: colorForSide(weapon.sideColor, emphasized ? 0.86 : 0.45)
				});
			record.guideEntity.entity.polyline.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.weaponGuideDistance);
		}
		if (record.guideEntity.entity.ellipse) {
			record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
			record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
			record.guideEntity.entity.ellipse.material = colorForSide(
				weapon.sideColor,
				emphasized ? 0.08 : 0.035
			);
			record.guideEntity.entity.ellipse.outlineColor = colorForSide(
				weapon.sideColor,
				emphasized ? 0.86 : 0.45
			);
			record.guideEntity.entity.ellipse.outlineWidth = emphasized ? 1.9 : 1.1;
			record.guideEntity.entity.ellipse.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.weaponGuideDistance);
		}
	}

	createWeaponImpactLinkEntity(weapon) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		if (
			!shouldShowWeaponImpactLink(
				weapon,
				this.state.view?.followTargetId,
				lodLevel
			)
		) {
			return null;
		}

		const targetPoint = resolveWeaponImpactPoint(this.state, weapon);
		if (!targetPoint) {
			return null;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'weapon',
			weapon.id
		);
		const positions = buildArcPolylinePositions(
			weapon,
			targetPoint,
			estimateLinkArcLiftMeters(weapon, targetPoint) * 0.72
		);
		if (!positions) {
			return null;
		}

		return this.dataSource.entities.add({
			id: `battle-weapon-impact-link-${weapon.id}`,
			polyline: {
				positions,
				width: emphasized
					? lodConfig.weaponImpactLinkWidth + 0.8
					: lodConfig.weaponImpactLinkWidth,
				material: new Cesium.PolylineDashMaterialProperty({
					color: colorForSide(weapon.sideColor, emphasized ? 0.82 : 0.48),
					dashLength: emphasized ? 16 : 20,
					gapColor: colorForSide(weapon.sideColor, 0.08)
				}),
				arcType: Cesium.ArcType.NONE,
				clampToGround: false,
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.weaponImpactLinkDistance
				)
			}
		});
	}

	updateWeaponImpactLinkEntity(record, weapon) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		const shouldShow = shouldShowWeaponImpactLink(
			weapon,
			this.state.view?.followTargetId,
			lodLevel
		);
		const targetPoint = resolveWeaponImpactPoint(this.state, weapon);
		if (!shouldShow || !targetPoint) {
			if (record.impactLinkEntity) {
				this.dataSource.entities.remove(record.impactLinkEntity);
				record.impactLinkEntity = null;
			}
			return;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'weapon',
			weapon.id
		);
		const positions = buildArcPolylinePositions(
			weapon,
			targetPoint,
			estimateLinkArcLiftMeters(weapon, targetPoint) * 0.72
		);
		if (!positions) {
			if (record.impactLinkEntity) {
				this.dataSource.entities.remove(record.impactLinkEntity);
				record.impactLinkEntity = null;
			}
			return;
		}

		if (!record.impactLinkEntity) {
			record.impactLinkEntity = this.createWeaponImpactLinkEntity(weapon);
			return;
		}

		record.impactLinkEntity.polyline.positions = positions;
		record.impactLinkEntity.polyline.width = emphasized
			? lodConfig.weaponImpactLinkWidth + 0.8
			: lodConfig.weaponImpactLinkWidth;
		record.impactLinkEntity.polyline.material =
			new Cesium.PolylineDashMaterialProperty({
				color: colorForSide(weapon.sideColor, emphasized ? 0.82 : 0.48),
				dashLength: emphasized ? 16 : 20,
				gapColor: colorForSide(weapon.sideColor, 0.08)
			});
		record.impactLinkEntity.polyline.distanceDisplayCondition =
			new Cesium.DistanceDisplayCondition(0, lodConfig.weaponImpactLinkDistance);
	}

	createWeaponTrajectoryEntities(weapon) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		if (
			!shouldShowWeaponTrajectoryCorridor(
				weapon,
				this.state.view?.followTargetId,
				lodLevel
			)
		) {
			return null;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'weapon',
			weapon.id
		);
		const launchPoint = {
			longitude: weapon.launchLongitude,
			latitude: weapon.launchLatitude,
			altitudeMeters: weapon.launchAltitudeMeters ?? 0
		};
		const currentPoint = {
			longitude: weapon.longitude,
			latitude: weapon.latitude,
			altitudeMeters: weapon.altitudeMeters ?? 0
		};
		const targetPoint = resolveWeaponTrajectoryTargetPoint(this.state, weapon);
		const projectedPositions = targetPoint
			? buildArcPolylinePositions(
					launchPoint,
					targetPoint,
					estimateLinkArcLiftMeters(launchPoint, targetPoint) *
						(emphasized ? 1.08 : 0.94)
			  )
			: null;
		const progressPositions = buildArcPolylinePositions(
			launchPoint,
			currentPoint,
			Math.max(estimateLinkArcLiftMeters(launchPoint, currentPoint) * 0.74, 320)
		);
		if (!projectedPositions && !progressPositions) {
			return null;
		}

		return {
			projectedEntity: projectedPositions
				? this.dataSource.entities.add({
						id: `battle-weapon-trajectory-projected-${weapon.id}`,
						polyline: {
							positions: projectedPositions,
							width: emphasized
								? lodConfig.weaponTrajectoryProjectedWidth + 0.6
								: lodConfig.weaponTrajectoryProjectedWidth,
							material: new Cesium.PolylineDashMaterialProperty({
								color: colorForSide(
									weapon.sideColor,
									emphasized ? 0.62 : 0.38
								),
								dashLength: emphasized ? 18 : 22,
								gapColor: colorForSide(weapon.sideColor, 0.06)
							}),
							arcType: Cesium.ArcType.NONE,
							clampToGround: false,
							distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
								0,
								lodConfig.weaponTrajectoryDistance
							)
						}
				  })
				: null,
			progressEntity: progressPositions
				? this.dataSource.entities.add({
						id: `battle-weapon-trajectory-progress-${weapon.id}`,
						polyline: {
							positions: progressPositions,
							width: emphasized
								? lodConfig.weaponTrajectoryWidth + 0.8
								: lodConfig.weaponTrajectoryWidth,
							material: new Cesium.PolylineGlowMaterialProperty({
								glowPower: emphasized ? 0.26 : 0.18,
								color: colorForSide(
									weapon.sideColor,
									emphasized ? 0.96 : 0.74
								)
							}),
							arcType: Cesium.ArcType.NONE,
							clampToGround: false,
							distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
								0,
								lodConfig.weaponTrajectoryDistance
							)
						}
				  })
				: null,
			launchEntity: this.dataSource.entities.add({
				id: `battle-weapon-trajectory-launch-${weapon.id}`,
				position: cartesianFromSnapshot(launchPoint),
				point: {
					pixelSize: emphasized ? 9 : 7,
					color: colorForSide(weapon.sideColor, emphasized ? 0.92 : 0.7),
					outlineColor: Cesium.Color.WHITE.withAlpha(0.88),
					outlineWidth: 1.8,
					disableDepthTestDistance: Number.POSITIVE_INFINITY
				}
			})
		};
	}

	removeWeaponTrajectoryEntities(record) {
		if (!record?.trajectoryEntities) {
			return;
		}

		if (record.trajectoryEntities.projectedEntity) {
			this.dataSource.entities.remove(record.trajectoryEntities.projectedEntity);
		}
		if (record.trajectoryEntities.progressEntity) {
			this.dataSource.entities.remove(record.trajectoryEntities.progressEntity);
		}
		if (record.trajectoryEntities.launchEntity) {
			this.dataSource.entities.remove(record.trajectoryEntities.launchEntity);
		}

		record.trajectoryEntities = null;
	}

	updateWeaponTrajectoryEntities(record, weapon) {
		const lodLevel = this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL;
		const shouldShow = shouldShowWeaponTrajectoryCorridor(
			weapon,
			this.state.view?.followTargetId,
			lodLevel
		);
		if (!shouldShow) {
			this.removeWeaponTrajectoryEntities(record);
			return;
		}

		const lodConfig = getLodConfig(lodLevel);
		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'weapon',
			weapon.id
		);
		const launchPoint = {
			longitude: weapon.launchLongitude,
			latitude: weapon.launchLatitude,
			altitudeMeters: weapon.launchAltitudeMeters ?? 0
		};
		const currentPoint = {
			longitude: weapon.longitude,
			latitude: weapon.latitude,
			altitudeMeters: weapon.altitudeMeters ?? 0
		};
		const targetPoint = resolveWeaponTrajectoryTargetPoint(this.state, weapon);
		const projectedPositions = targetPoint
			? buildArcPolylinePositions(
					launchPoint,
					targetPoint,
					estimateLinkArcLiftMeters(launchPoint, targetPoint) *
						(emphasized ? 1.08 : 0.94)
			  )
			: null;
		const progressPositions = buildArcPolylinePositions(
			launchPoint,
			currentPoint,
			Math.max(estimateLinkArcLiftMeters(launchPoint, currentPoint) * 0.74, 320)
		);
		if (!projectedPositions && !progressPositions) {
			this.removeWeaponTrajectoryEntities(record);
			return;
		}

		if (!record.trajectoryEntities) {
			record.trajectoryEntities = this.createWeaponTrajectoryEntities(weapon);
			return;
		}

		if (!projectedPositions) {
			if (record.trajectoryEntities.projectedEntity) {
				this.dataSource.entities.remove(record.trajectoryEntities.projectedEntity);
				record.trajectoryEntities.projectedEntity = null;
			}
		} else if (!record.trajectoryEntities.projectedEntity) {
			record.trajectoryEntities.projectedEntity = this.dataSource.entities.add({
				id: `battle-weapon-trajectory-projected-${weapon.id}`,
				polyline: {
					positions: projectedPositions,
					width: lodConfig.weaponTrajectoryProjectedWidth,
					material: new Cesium.PolylineDashMaterialProperty({
						color: colorForSide(weapon.sideColor, 0.38),
						dashLength: 22,
						gapColor: colorForSide(weapon.sideColor, 0.06)
					}),
					arcType: Cesium.ArcType.NONE,
					clampToGround: false,
					distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
						0,
						lodConfig.weaponTrajectoryDistance
					)
				}
			});
		} else {
			record.trajectoryEntities.projectedEntity.polyline.positions =
				projectedPositions;
			record.trajectoryEntities.projectedEntity.polyline.width = emphasized
				? lodConfig.weaponTrajectoryProjectedWidth + 0.6
				: lodConfig.weaponTrajectoryProjectedWidth;
			record.trajectoryEntities.projectedEntity.polyline.material =
				new Cesium.PolylineDashMaterialProperty({
					color: colorForSide(weapon.sideColor, emphasized ? 0.62 : 0.38),
					dashLength: emphasized ? 18 : 22,
					gapColor: colorForSide(weapon.sideColor, 0.06)
				});
			record.trajectoryEntities.projectedEntity.polyline.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.weaponTrajectoryDistance
				);
		}

		if (!progressPositions) {
			if (record.trajectoryEntities.progressEntity) {
				this.dataSource.entities.remove(record.trajectoryEntities.progressEntity);
				record.trajectoryEntities.progressEntity = null;
			}
		} else if (!record.trajectoryEntities.progressEntity) {
			record.trajectoryEntities.progressEntity = this.dataSource.entities.add({
				id: `battle-weapon-trajectory-progress-${weapon.id}`,
				polyline: {
					positions: progressPositions,
					width: lodConfig.weaponTrajectoryWidth,
					material: new Cesium.PolylineGlowMaterialProperty({
						glowPower: 0.18,
						color: colorForSide(weapon.sideColor, 0.74)
					}),
					arcType: Cesium.ArcType.NONE,
					clampToGround: false,
					distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
						0,
						lodConfig.weaponTrajectoryDistance
					)
				}
			});
		} else {
			record.trajectoryEntities.progressEntity.polyline.positions =
				progressPositions;
			record.trajectoryEntities.progressEntity.polyline.width = emphasized
				? lodConfig.weaponTrajectoryWidth + 0.8
				: lodConfig.weaponTrajectoryWidth;
			record.trajectoryEntities.progressEntity.polyline.material =
				new Cesium.PolylineGlowMaterialProperty({
					glowPower: emphasized ? 0.26 : 0.18,
					color: colorForSide(weapon.sideColor, emphasized ? 0.96 : 0.74)
				});
			record.trajectoryEntities.progressEntity.polyline.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.weaponTrajectoryDistance
				);
		}

		if (!record.trajectoryEntities.launchEntity) {
			record.trajectoryEntities.launchEntity = this.dataSource.entities.add({
				id: `battle-weapon-trajectory-launch-${weapon.id}`,
				position: cartesianFromSnapshot(launchPoint),
				point: {
					pixelSize: emphasized ? 9 : 7,
					color: colorForSide(weapon.sideColor, emphasized ? 0.92 : 0.7),
					outlineColor: Cesium.Color.WHITE.withAlpha(0.88),
					outlineWidth: 1.8,
					disableDepthTestDistance: Number.POSITIVE_INFINITY
				}
			});
		} else {
			record.trajectoryEntities.launchEntity.position =
				cartesianFromSnapshot(launchPoint);
			record.trajectoryEntities.launchEntity.point.pixelSize = emphasized ? 9 : 7;
			record.trajectoryEntities.launchEntity.point.color = colorForSide(
				weapon.sideColor,
				emphasized ? 0.92 : 0.7
			);
		}
	}

	createProjectedCourseEntity(unit) {
		if (!shouldShowProjectedCourse(unit, this.state.view?.followTargetId)) {
			return null;
		}

		const projectedPoint = resolveProjectedCoursePoint(this.state, unit);
		const positions = buildLinearPolylinePositions([unit, projectedPoint]);
		if (!positions) {
			return null;
		}

		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'unit',
			unit.id
		);
		const polyline = this.dataSource.entities.add({
			id: `battle-unit-course-${unit.id}`,
			polyline: {
				positions,
				width: emphasized ? 4.2 : 3.2,
				material: new Cesium.PolylineArrowMaterialProperty(
					colorForSide(unit.sideColor, emphasized ? 0.84 : 0.58)
				),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					110000
				),
				arcType: Cesium.ArcType.NONE,
				clampToGround: false
			}
		});
		const endpoint = this.dataSource.entities.add({
			id: `battle-unit-course-end-${unit.id}`,
			position: cartesianFromSnapshot(projectedPoint),
			point: {
				pixelSize: emphasized ? 10 : 8,
				color: colorForSide(unit.sideColor, emphasized ? 0.92 : 0.72),
				outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
				outlineWidth: 2,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		return {
			polyline,
			endpoint
		};
	}

	updateProjectedCourseEntity(record, unit) {
		const showCourse = shouldShowProjectedCourse(
			unit,
			this.state.view?.followTargetId
		);
		if (!showCourse) {
			if (record.courseEntity) {
				this.dataSource.entities.remove(record.courseEntity.polyline);
				this.dataSource.entities.remove(record.courseEntity.endpoint);
				record.courseEntity = null;
			}
			return;
		}

		const projectedPoint = resolveProjectedCoursePoint(this.state, unit);
		const positions = buildLinearPolylinePositions([unit, projectedPoint]);
		if (!positions) {
			if (record.courseEntity) {
				this.dataSource.entities.remove(record.courseEntity.polyline);
				this.dataSource.entities.remove(record.courseEntity.endpoint);
				record.courseEntity = null;
			}
			return;
		}

		if (!record.courseEntity) {
			record.courseEntity = this.createProjectedCourseEntity(unit);
			return;
		}

		const emphasized = isTrackedTarget(
			this.state.view?.followTargetId,
			'unit',
			unit.id
		);
		record.courseEntity.polyline.polyline.positions = positions;
		record.courseEntity.polyline.polyline.width = emphasized ? 4.2 : 3.2;
		record.courseEntity.polyline.polyline.material =
			new Cesium.PolylineArrowMaterialProperty(
				colorForSide(unit.sideColor, emphasized ? 0.84 : 0.58)
			);
		record.courseEntity.endpoint.position = cartesianFromSnapshot(projectedPoint);
		record.courseEntity.endpoint.point.pixelSize = emphasized ? 10 : 8;
		record.courseEntity.endpoint.point.color = colorForSide(
			unit.sideColor,
			emphasized ? 0.92 : 0.72
		);
	}

	createUnitRecord(unit, totalUnits) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const useModel = resolveUnitModel(unit, totalUnits, lodConfig);
		const positionProperty = createPositionProperty(unit);
		const sideColor = colorForSide(unit.sideColor, 0.95);
		const entity = this.dataSource.entities.add({
			id: `battle-unit-${unit.id}`,
			position: positionProperty,
			orientation: new Cesium.CallbackProperty(
				() => resolveHeadingOrientation(unit, unit.headingDeg),
				false
			),
			model: useModel
				? {
						uri: assetUrl(useModel.uri, 'Battle spectator model'),
						scale: useModel.scale,
						minimumPixelSize: useModel.minimumPixelSize,
						maximumScale: useModel.maximumScale,
						color: colorForSide(unit.sideColor, 0.86),
						colorBlendAmount: 0.2,
						silhouetteColor: colorForSide(unit.sideColor, 0.62),
						silhouetteSize: unit.selected ? 2.2 : 1.2
				  }
				: undefined,
			point: useModel
				? undefined
				: {
						pixelSize: unit.selected ? 12 : 9,
						color: sideColor,
						outlineColor: Cesium.Color.BLACK.withAlpha(0.72),
						outlineWidth: 2,
						disableDepthTestDistance: Number.POSITIVE_INFINITY
				  },
			label: createLabel(
				buildUnitLabelText(unit, this.state.view?.followTargetId),
				unit.sideColor,
				lodConfig.labelDistance
			),
			path: shouldShowUnitTrail(
				unit,
				this.state.view?.followTargetId,
				this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL
			)
				? createUnitTrailGraphics(unit, lodConfig)
				: undefined
		});

		return {
			entity,
			positionProperty,
			unit,
			useModel: Boolean(useModel),
			guideEntity: this.createUnitGuideEntity(unit),
			courseEntity: this.createProjectedCourseEntity(unit)
		};
	}

	updateUnitRecord(record, unit) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		record.unit = unit;
		addPositionSample(record.positionProperty, unit, UNIT_SAMPLE_SECONDS);

		if (record.entity.label) {
			record.entity.label.text = buildUnitLabelText(
				unit,
				this.state.view?.followTargetId
			);
			record.entity.label.backgroundColor = colorForSide(unit.sideColor, 0.18);
			record.entity.label.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.labelDistance);
			record.entity.label.pixelOffset =
				unit.selected ||
				isTrackedTarget(this.state.view?.followTargetId, 'unit', unit.id)
					? new Cesium.Cartesian2(0, -34)
					: new Cesium.Cartesian2(0, -24);
		}
		if (record.entity.point) {
			record.entity.point.color = colorForSide(unit.sideColor, 0.95);
			record.entity.point.pixelSize = unit.selected ? 12 : 9;
		}
		if (record.entity.model) {
			record.entity.model.color = colorForSide(unit.sideColor, 0.86);
			record.entity.model.silhouetteColor = colorForSide(
				unit.sideColor,
				unit.selected ? 0.88 : 0.62
			);
			record.entity.model.silhouetteSize = unit.selected ? 2.2 : 1.2;
		}
		record.entity.orientation = new Cesium.CallbackProperty(
			() => resolveHeadingOrientation(unit, unit.headingDeg),
			false
		);
		const showTrail = shouldShowUnitTrail(
			unit,
			this.state.view?.followTargetId,
			this.state.view?.lodLevel ?? DEFAULT_LOD_LEVEL
		);
		if (showTrail) {
			if (!record.entity.path) {
				record.entity.path = createUnitTrailGraphics(unit, lodConfig);
			} else {
				record.entity.path.trailTime = lodConfig.unitTrailTime;
				record.entity.path.width =
					unit.selected || unit.entityType === 'aircraft'
						? lodConfig.unitTrailWidth
						: Math.max(1.4, lodConfig.unitTrailWidth - 0.4);
				record.entity.path.material = new Cesium.PolylineGlowMaterialProperty({
					glowPower: unit.selected ? 0.2 : 0.12,
					color: colorForSide(unit.sideColor, unit.selected ? 0.72 : 0.4)
				});
			}
		} else if (record.entity.path) {
			record.entity.path = undefined;
		}
		this.updateUnitGuideEntity(record, unit);
		this.updateProjectedCourseEntity(record, unit);
	}

	syncUnits() {
		const seenIds = new Set();
		const totalUnits = this.state.units.length;

		this.state.units.forEach((unit) => {
			seenIds.add(unit.id);
			const existingRecord = this.unitRecords.get(unit.id);
			if (!existingRecord) {
				this.unitRecords.set(unit.id, this.createUnitRecord(unit, totalUnits));
				return;
			}

			this.updateUnitRecord(existingRecord, unit);
		});

		for (const [unitId, record] of this.unitRecords.entries()) {
			if (seenIds.has(unitId)) {
				continue;
			}

			if (record.guideEntity) {
				this.dataSource.entities.remove(record.guideEntity.entity);
			}
			if (record.courseEntity) {
				this.dataSource.entities.remove(record.courseEntity.polyline);
				this.dataSource.entities.remove(record.courseEntity.endpoint);
			}
			this.dataSource.entities.remove(record.entity);
			this.unitRecords.delete(unitId);
		}
	}

	createWeaponRecord(weapon) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const positionProperty = createPositionProperty(weapon);
		const sideColor = colorForSide(weapon.sideColor, 0.92);
		const entity = this.dataSource.entities.add({
			id: `battle-weapon-${weapon.id}`,
			position: positionProperty,
			orientation: new Cesium.VelocityOrientationProperty(positionProperty),
			model: {
				uri: assetUrl(resolveWeaponModel(weapon), 'Battle spectator weapon'),
				scale: lodConfig.weaponModelScale,
				minimumPixelSize: lodConfig.weaponMinimumPixelSize,
				maximumScale: lodConfig.weaponMaximumScale,
				color: colorForSide(weapon.sideColor, 0.84),
				colorBlendAmount: 0.26,
				silhouetteColor: Cesium.Color.WHITE.withAlpha(0.72),
				silhouetteSize: 1.2
			},
			path: new Cesium.PathGraphics({
				show: true,
				leadTime: 0,
				trailTime: lodConfig.weaponTrailTime,
				width: lodConfig.weaponPathWidth,
				material: new Cesium.PolylineGlowMaterialProperty({
					glowPower: lodConfig.weaponGlowPower,
					color: sideColor
				})
			}),
			point: {
				pixelSize: lodConfig.weaponPointSize,
				color: sideColor,
				outlineColor: Cesium.Color.WHITE.withAlpha(0.82),
				outlineWidth: 1.5,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		return {
			entity,
			positionProperty,
			lastWeapon: weapon,
			guideEntity: this.createWeaponGuideEntity(weapon),
			impactLinkEntity: this.createWeaponImpactLinkEntity(weapon),
			trajectoryEntities: this.createWeaponTrajectoryEntities(weapon)
		};
	}

	updateWeaponRecord(record, weapon) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		record.lastWeapon = weapon;
		addPositionSample(record.positionProperty, weapon, WEAPON_SAMPLE_SECONDS);
		if (record.entity.model) {
			record.entity.model.color = colorForSide(weapon.sideColor, 0.84);
			record.entity.model.scale = lodConfig.weaponModelScale;
			record.entity.model.minimumPixelSize = lodConfig.weaponMinimumPixelSize;
			record.entity.model.maximumScale = lodConfig.weaponMaximumScale;
		}
		if (record.entity.point) {
			record.entity.point.color = colorForSide(weapon.sideColor, 0.92);
			record.entity.point.pixelSize = lodConfig.weaponPointSize;
		}
		if (record.entity.path) {
			record.entity.path.trailTime = lodConfig.weaponTrailTime;
			record.entity.path.width = lodConfig.weaponPathWidth;
			record.entity.path.material = new Cesium.PolylineGlowMaterialProperty({
				glowPower: lodConfig.weaponGlowPower,
				color: colorForSide(weapon.sideColor, 0.92)
			});
		}
		this.updateWeaponGuideEntity(record, weapon);
		this.updateWeaponImpactLinkEntity(record, weapon);
		this.updateWeaponTrajectoryEntities(record, weapon);
	}

	createImpactEffect(weapon) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const impactPoint = {
			longitude:
				typeof weapon.targetLongitude === 'number'
					? weapon.targetLongitude
					: weapon.longitude,
			latitude:
				typeof weapon.targetLatitude === 'number'
					? weapon.targetLatitude
					: weapon.latitude,
			altitudeMeters: 0
		};
		const position = cartesianFromSnapshot(impactPoint);
		const ringEntity = this.dataSource.entities.add({
			position,
			ellipse: {
				semiMajorAxis: 45,
				semiMinorAxis: 45,
				height: 0,
				material: colorForSide(weapon.sideColor, 0.16),
				outline: true,
				outlineColor: colorForSide(weapon.sideColor, 0.92)
			}
		});
		const flashEntity = this.dataSource.entities.add({
			position,
			point: {
				pixelSize: 18,
				color: colorForSide(weapon.sideColor, 0.95),
				outlineColor: Cesium.Color.WHITE.withAlpha(0.92),
				outlineWidth: 2,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});
		const smokeBaseLength = clamp(
			220 + (Number(weapon.speedKts) || 0) * 0.18,
			220,
			780
		);
		const smokeEntity = this.dataSource.entities.add({
			position: cartesianFromSnapshot({
				...impactPoint,
				altitudeMeters: smokeBaseLength * 0.5
			}),
			cylinder: {
				length: smokeBaseLength,
				topRadius: 22,
				bottomRadius: 52,
				material: Cesium.Color.LIGHTGRAY.withAlpha(0.22),
				outline: false
			}
		});

		this.effects.push({
			elapsed: 0,
			lifetime: lodConfig.impactLifetimeSeconds,
			smokeLifetime: lodConfig.impactSmokeLifetimeSeconds,
			ringEntity,
			flashEntity,
			smokeEntity,
			sideColor: weapon.sideColor,
			basePoint: impactPoint,
			smokeBaseLength
		});
	}

	syncWeapons() {
		const seenIds = new Set();

		this.state.weapons.forEach((weapon) => {
			seenIds.add(weapon.id);
			const existingRecord = this.weaponRecords.get(weapon.id);
			if (!existingRecord) {
				this.weaponRecords.set(weapon.id, this.createWeaponRecord(weapon));
				return;
			}

			this.updateWeaponRecord(existingRecord, weapon);
		});

		for (const [weaponId, record] of this.weaponRecords.entries()) {
			if (seenIds.has(weaponId)) {
				continue;
			}

			this.createImpactEffect(record.lastWeapon);
			if (record.guideEntity) {
				this.dataSource.entities.remove(record.guideEntity.entity);
			}
			if (record.impactLinkEntity) {
				this.dataSource.entities.remove(record.impactLinkEntity);
			}
			this.removeWeaponTrajectoryEntities(record);
			this.dataSource.entities.remove(record.entity);
			this.weaponRecords.delete(weaponId);
		}
	}

	createTargetLinkRecord(unit, targetPoint) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const emphasized =
			unit.selected ||
			isTrackedTarget(this.state.view?.followTargetId, 'unit', unit.id);
		const positions = buildArcPolylinePositions(
			unit,
			targetPoint,
			estimateLinkArcLiftMeters(unit, targetPoint)
		);
		if (!positions) {
			return null;
		}

		const entity = this.dataSource.entities.add({
			id: `battle-target-link-${unit.id}`,
			polyline: {
				positions,
				width: emphasized
					? lodConfig.targetLinkWidth + 0.9
					: lodConfig.targetLinkWidth,
				material: new Cesium.PolylineGlowMaterialProperty({
					glowPower: emphasized
						? lodConfig.targetLinkGlowPower + 0.06
						: lodConfig.targetLinkGlowPower,
					color: colorForSide(unit.sideColor, emphasized ? 0.76 : 0.42)
				}),
				arcType: Cesium.ArcType.NONE,
				clampToGround: false,
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.targetLinkDistance
				)
			}
		});

		return {
			entity,
			unitId: unit.id
		};
	}

	updateTargetLinkRecord(record, unit, targetPoint) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const emphasized =
			unit.selected ||
			isTrackedTarget(this.state.view?.followTargetId, 'unit', unit.id);
		const positions = buildArcPolylinePositions(
			unit,
			targetPoint,
			estimateLinkArcLiftMeters(unit, targetPoint)
		);
		if (!positions) {
			return;
		}

		record.entity.polyline.positions = positions;
		record.entity.polyline.width = emphasized
			? lodConfig.targetLinkWidth + 0.9
			: lodConfig.targetLinkWidth;
		record.entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
			glowPower: emphasized
				? lodConfig.targetLinkGlowPower + 0.06
				: lodConfig.targetLinkGlowPower,
			color: colorForSide(unit.sideColor, emphasized ? 0.76 : 0.42)
		});
		record.entity.polyline.distanceDisplayCondition =
			new Cesium.DistanceDisplayCondition(0, lodConfig.targetLinkDistance);
	}

	syncTargetLinks() {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const followTargetId = this.state.view?.followTargetId;
		const seenIds = new Set();
		const candidates = this.state.units
			.filter((unit) => typeof unit.targetId === 'string' && unit.targetId.length > 0)
			.map((unit) => ({
				unit,
				targetPoint: resolveTargetPoint(this.state, unit.targetId)
			}))
			.filter((entry) => entry.targetPoint !== null)
			.sort((left, right) => {
				const leftTracked = isTrackedTarget(
					followTargetId,
					'unit',
					left.unit.id
				)
					? 1
					: 0;
				const rightTracked = isTrackedTarget(
					followTargetId,
					'unit',
					right.unit.id
				)
					? 1
					: 0;
				if (leftTracked !== rightTracked) {
					return rightTracked - leftTracked;
				}
				const leftSelected = left.unit.selected ? 1 : 0;
				const rightSelected = right.unit.selected ? 1 : 0;
				if (leftSelected !== rightSelected) {
					return rightSelected - leftSelected;
				}
				if (left.unit.entityType !== right.unit.entityType) {
					return left.unit.entityType === 'aircraft' ? -1 : 1;
				}
				if (left.unit.weaponCount !== right.unit.weaponCount) {
					return right.unit.weaponCount - left.unit.weaponCount;
				}
				return right.unit.speedKts - left.unit.speedKts;
			})
			.slice(0, lodConfig.targetLinkBudget);

		candidates.forEach(({ unit, targetPoint }) => {
			seenIds.add(unit.id);
			const existingRecord = this.linkRecords.get(unit.id);
			if (!existingRecord) {
				const nextRecord = this.createTargetLinkRecord(unit, targetPoint);
				if (nextRecord) {
					this.linkRecords.set(unit.id, nextRecord);
				}
				return;
			}

			this.updateTargetLinkRecord(existingRecord, unit, targetPoint);
		});

		for (const [unitId, record] of this.linkRecords.entries()) {
			if (seenIds.has(unitId)) {
				continue;
			}

			this.dataSource.entities.remove(record.entity);
			this.linkRecords.delete(unitId);
		}
	}

	createEventRecord(event) {
		const currentTime = this.state.currentTime || event.timestamp || 0;
		const ageSeconds = Math.max(0, currentTime - event.timestamp);
		const lifetimeSeconds = getEventLifetimeSeconds(event);
		const ageRatio = clamp(1 - ageSeconds / lifetimeSeconds, 0.15, 1);
		const sourcePoint = getEventSourcePoint(event);
		const focusPoint = getEventFocusPoint(event);
		const polylinePositions = buildEventPolylinePositions(event);
		const outlineColor = colorForSide(event.sideColor, 0.55 + ageRatio * 0.35);
		const launchLikeEvent = isLaunchEvent(event);
		const pointEntity = focusPoint
			? this.dataSource.entities.add({
					id: `battle-event-point-${event.id}`,
					position: cartesianFromSnapshot(focusPoint),
					point: {
						pixelSize:
							launchLikeEvent
								? 12 + ageRatio * 6
								: 18 + ageRatio * 10,
						color: outlineColor,
						outlineColor: Cesium.Color.WHITE.withAlpha(0.95),
						outlineWidth: 2,
						disableDepthTestDistance: Number.POSITIVE_INFINITY
					},
					label: new Cesium.LabelGraphics({
						text: getEventLabel(event),
						scale: 0.52,
						showBackground: true,
						backgroundColor: colorForSide(event.sideColor, 0.2),
						fillColor: Cesium.Color.WHITE,
						font: '700 22px Bahnschrift, sans-serif',
						pixelOffset: new Cesium.Cartesian2(0, -28),
						distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
							0,
							80000
						),
						disableDepthTestDistance: Number.POSITIVE_INFINITY
					})
			  })
			: null;
		const lineEntity = polylinePositions
			? this.dataSource.entities.add({
					id: `battle-event-line-${event.id}`,
					polyline: {
						positions: polylinePositions,
						width:
							launchLikeEvent
								? 3.5
								: event.resultTag === 'kill'
									? 5
									: 4,
						material:
							launchLikeEvent
								? new Cesium.PolylineDashMaterialProperty({
										color: outlineColor,
										dashLength: 18,
										gapColor: colorForSide(event.sideColor, 0.08)
								  })
								: new Cesium.PolylineGlowMaterialProperty({
										color: outlineColor,
										glowPower: 0.2
								  }),
						arcType: Cesium.ArcType.NONE,
						clampToGround: false
					}
			  })
			: null;
		const tracerEntity =
			sourcePoint &&
			focusPoint &&
			launchLikeEvent &&
			(!event.weaponId || !this.weaponRecords.has(event.weaponId))
				? this.createEventTracerEntity(event, sourcePoint, focusPoint)
				: null;

		return {
			event,
			pointEntity,
			lineEntity,
			tracerEntity
		};
	}

	createEventTracerEntity(event, sourcePoint, focusPoint) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const startTime = Cesium.JulianDate.now();
		const durationSeconds = estimateEventTracerDurationSeconds(
			sourcePoint,
			focusPoint
		);
		const endTime = Cesium.JulianDate.addSeconds(
			startTime,
			durationSeconds,
			new Cesium.JulianDate()
		);
		const positionProperty = new Cesium.SampledPositionProperty();
		positionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.NONE;
		positionProperty.backwardExtrapolationType = Cesium.ExtrapolationType.NONE;
		positionProperty.setInterpolationOptions({
			interpolationDegree: 1,
			interpolationAlgorithm: Cesium.LinearApproximation
		});
		positionProperty.addSample(
			startTime,
			cartesianFromSnapshot(sourcePoint, new Cesium.Cartesian3())
		);
		positionProperty.addSample(
			endTime,
			cartesianFromSnapshot(focusPoint, new Cesium.Cartesian3())
		);

		return this.dataSource.entities.add({
			id: `battle-event-tracer-${event.id}`,
			availability: new Cesium.TimeIntervalCollection([
				new Cesium.TimeInterval({
					start: startTime,
					stop: endTime
				})
			]),
			position: positionProperty,
			orientation: new Cesium.VelocityOrientationProperty(positionProperty),
			point: {
				pixelSize: Math.max(8, lodConfig.weaponPointSize + 3),
				color: colorForSide(event.sideColor, 0.96),
				outlineColor: Cesium.Color.WHITE.withAlpha(0.98),
				outlineWidth: 2,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			},
			path: new Cesium.PathGraphics({
				show: true,
				leadTime: 0,
				trailTime: Math.min(2.4, durationSeconds),
				width: Math.max(3, lodConfig.weaponPathWidth - 0.5),
				material: new Cesium.PolylineGlowMaterialProperty({
					glowPower: Math.max(0.2, lodConfig.weaponGlowPower + 0.08),
					color: colorForSide(event.sideColor, 0.96)
				})
			})
		});
	}

	updateEventRecord(record, event) {
		const currentTime = this.state.currentTime || event.timestamp || 0;
		const ageSeconds = Math.max(0, currentTime - event.timestamp);
		const lifetimeSeconds = getEventLifetimeSeconds(event);
		const ageRatio = clamp(1 - ageSeconds / lifetimeSeconds, 0.15, 1);
		const launchLikeEvent = isLaunchEvent(event);
		record.event = event;

		if (record.pointEntity?.point) {
			record.pointEntity.point.color = colorForSide(
				event.sideColor,
				0.55 + ageRatio * 0.35
			);
			record.pointEntity.point.pixelSize =
				launchLikeEvent
					? 12 + ageRatio * 6
					: 18 + ageRatio * 10;
		}
		if (record.pointEntity?.label) {
			record.pointEntity.label.text = getEventLabel(event);
			record.pointEntity.label.backgroundColor = colorForSide(
				event.sideColor,
				0.18
			);
		}
		if (record.lineEntity?.polyline) {
			record.lineEntity.polyline.material =
				launchLikeEvent
					? new Cesium.PolylineDashMaterialProperty({
							color: colorForSide(event.sideColor, 0.55 + ageRatio * 0.35),
							dashLength: 18,
							gapColor: colorForSide(event.sideColor, 0.08)
					  })
					: new Cesium.PolylineGlowMaterialProperty({
							color: colorForSide(event.sideColor, 0.55 + ageRatio * 0.35),
							glowPower: 0.2
					  });
		}
	}

	removeEventRecord(record) {
		if (record.tracerEntity) {
			this.dataSource.entities.remove(record.tracerEntity);
		}
		if (record.lineEntity) {
			this.dataSource.entities.remove(record.lineEntity);
		}
		if (record.pointEntity) {
			this.dataSource.entities.remove(record.pointEntity);
		}
	}

	syncRecentEvents() {
		const currentTime = Number(this.state.currentTime) || 0;
		const visibleEvents = this.state.recentEvents
			.filter((event) => {
				const eventAge = Math.max(0, currentTime - event.timestamp);
				return (
					eventAge <= getEventLifetimeSeconds(event) &&
					(getEventFocusPoint(event) || buildEventPolylinePositions(event))
				);
			})
			.slice(-8);
		const seenIds = new Set();

		visibleEvents.forEach((event) => {
			seenIds.add(event.id);
			const existingRecord = this.eventRecords.get(event.id);
			if (!existingRecord) {
				const nextRecord = this.createEventRecord(event);
				if (nextRecord) {
					this.eventRecords.set(event.id, nextRecord);
				}
				return;
			}

			this.updateEventRecord(existingRecord, event);
		});

		for (const [eventId, record] of this.eventRecords.entries()) {
			if (seenIds.has(eventId)) {
				continue;
			}

			this.removeEventRecord(record);
			this.eventRecords.delete(eventId);
		}
	}

	createHotspotRecord(hotspot) {
		const hotspotColor = colorForSide(hotspot.dominantSideColor, 0.9);
		const columnLength = hotspotColumnLengthMeters(hotspot);
		const entity = this.dataSource.entities.add({
			id: `battle-hotspot-${hotspot.id}`,
			position: cartesianFromSnapshot({
				longitude: hotspot.longitude,
				latitude: hotspot.latitude,
				altitudeMeters: 0
			}),
			ellipse: {
				semiMajorAxis: hotspot.radiusMeters,
				semiMinorAxis: hotspot.radiusMeters,
				height: 0,
				material: colorForSide(hotspot.dominantSideColor, 0.12),
				outline: true,
				outlineColor: hotspotColor,
				outlineWidth: 2
			},
			point: {
				pixelSize: 10,
				color: hotspotColor,
				outlineColor: Cesium.Color.WHITE.withAlpha(0.9),
				outlineWidth: 2,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			},
			label: new Cesium.LabelGraphics({
				text: `${hotspot.label} ${hotspot.score}`,
				scale: 0.56,
				showBackground: true,
				backgroundColor: colorForSide(hotspot.dominantSideColor, 0.18),
				fillColor: Cesium.Color.WHITE,
				font: '700 22px Bahnschrift, sans-serif',
				pixelOffset: new Cesium.Cartesian2(0, -24),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					110000
				),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			})
		});
		const pulseEntity = this.dataSource.entities.add({
			id: `battle-hotspot-pulse-${hotspot.id}`,
			position: cartesianFromSnapshot({
				longitude: hotspot.longitude,
				latitude: hotspot.latitude,
				altitudeMeters: 0
			}),
			ellipse: {
				semiMajorAxis: hotspot.radiusMeters * 1.18,
				semiMinorAxis: hotspot.radiusMeters * 1.18,
				height: 0,
				material: colorForSide(hotspot.dominantSideColor, 0.04),
				outline: true,
				outlineColor: colorForSide(hotspot.dominantSideColor, 0.35),
				outlineWidth: 1.2
			}
		});
		const columnEntity = this.dataSource.entities.add({
			id: `battle-hotspot-column-${hotspot.id}`,
			position: cartesianFromSnapshot({
				longitude: hotspot.longitude,
				latitude: hotspot.latitude,
				altitudeMeters: columnLength * 0.5
			}),
			cylinder: {
				length: columnLength,
				topRadius: clamp(hotspot.radiusMeters * 0.16, 70, 220),
				bottomRadius: clamp(hotspot.radiusMeters * 0.32, 120, 380),
				material: colorForSide(hotspot.dominantSideColor, 0.11),
				outline: false
			}
		});

		return {
			entity,
			pulseEntity,
			columnEntity,
			hotspot
		};
	}

	updateHotspotRecord(record, hotspot) {
		record.hotspot = hotspot;
		const columnLength = hotspotColumnLengthMeters(hotspot);
		record.entity.position = cartesianFromSnapshot({
			longitude: hotspot.longitude,
			latitude: hotspot.latitude,
			altitudeMeters: 0
		});
		if (record.entity.ellipse) {
			record.entity.ellipse.semiMajorAxis = hotspot.radiusMeters;
			record.entity.ellipse.semiMinorAxis = hotspot.radiusMeters;
			record.entity.ellipse.material = colorForSide(
				hotspot.dominantSideColor,
				0.12
			);
			record.entity.ellipse.outlineColor = colorForSide(
				hotspot.dominantSideColor,
				0.9
			);
		}
		if (record.entity.point) {
			record.entity.point.color = colorForSide(hotspot.dominantSideColor, 0.9);
		}
		if (record.entity.label) {
			record.entity.label.text = `${hotspot.label} ${hotspot.score}`;
			record.entity.label.backgroundColor = colorForSide(
				hotspot.dominantSideColor,
				0.18
			);
		}
		if (record.pulseEntity) {
			record.pulseEntity.position = cartesianFromSnapshot({
				longitude: hotspot.longitude,
				latitude: hotspot.latitude,
				altitudeMeters: 0
			});
			if (record.pulseEntity.ellipse) {
				record.pulseEntity.ellipse.semiMajorAxis = hotspot.radiusMeters * 1.18;
				record.pulseEntity.ellipse.semiMinorAxis = hotspot.radiusMeters * 1.18;
				record.pulseEntity.ellipse.material = colorForSide(
					hotspot.dominantSideColor,
					0.04
				);
				record.pulseEntity.ellipse.outlineColor = colorForSide(
					hotspot.dominantSideColor,
					0.35
				);
			}
		}
		if (record.columnEntity) {
			record.columnEntity.position = cartesianFromSnapshot({
				longitude: hotspot.longitude,
				latitude: hotspot.latitude,
				altitudeMeters: columnLength * 0.5
			});
			if (record.columnEntity.cylinder) {
				record.columnEntity.cylinder.length = columnLength;
				record.columnEntity.cylinder.topRadius = clamp(
					hotspot.radiusMeters * 0.16,
					70,
					220
				);
				record.columnEntity.cylinder.bottomRadius = clamp(
					hotspot.radiusMeters * 0.32,
					120,
					380
				);
				record.columnEntity.cylinder.material = colorForSide(
					hotspot.dominantSideColor,
					0.11
				);
			}
		}
	}

	removeHotspotRecord(record) {
		if (record.pulseEntity) {
			this.dataSource.entities.remove(record.pulseEntity);
		}
		if (record.columnEntity) {
			this.dataSource.entities.remove(record.columnEntity);
		}
		this.dataSource.entities.remove(record.entity);
	}

	syncHotspots() {
		const hotspotRows = buildHotspotRows(this.state);
		const seenIds = new Set();

		hotspotRows.forEach((hotspot) => {
			seenIds.add(hotspot.id);
			const existingRecord = this.hotspotRecords.get(hotspot.id);
			if (!existingRecord) {
				this.hotspotRecords.set(hotspot.id, this.createHotspotRecord(hotspot));
				return;
			}

			this.updateHotspotRecord(existingRecord, hotspot);
		});

		for (const [hotspotId, record] of this.hotspotRecords.entries()) {
			if (seenIds.has(hotspotId)) {
				continue;
			}

			this.removeHotspotRecord(record);
			this.hotspotRecords.delete(hotspotId);
		}
	}

	createSidePressureRecord(row) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const zoneEntity = this.dataSource.entities.add({
			id: `battle-side-pressure-${row.sideId}`,
			position: cartesianFromSnapshot({
				...row.center,
				altitudeMeters: 0
			}),
			ellipse: {
				semiMajorAxis: row.semiMajorAxis,
				semiMinorAxis: row.semiMinorAxis,
				height: 0,
				rotation: Cesium.Math.toRadians(row.headingDeg),
				material: colorForSide(row.sideColor, 0.085),
				outline: true,
				outlineColor: colorForSide(row.sideColor, 0.42),
				outlineWidth: 2,
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.sidePressureDistance
				)
			},
			label: new Cesium.LabelGraphics({
				text: `${row.sideName} 압력권 · ${row.pressureScore}`,
				scale: 0.56,
				showBackground: true,
				backgroundColor: colorForSide(row.sideColor, 0.18),
				fillColor: Cesium.Color.WHITE,
				font: '700 22px Bahnschrift, sans-serif',
				pixelOffset: new Cesium.Cartesian2(0, -26),
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.sidePressureDistance
				),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			})
		});
		const pulseEntity = this.dataSource.entities.add({
			id: `battle-side-pressure-pulse-${row.sideId}`,
			position: cartesianFromSnapshot({
				...row.center,
				altitudeMeters: 0
			}),
			ellipse: {
				semiMajorAxis: row.semiMajorAxis * 1.06,
				semiMinorAxis: row.semiMinorAxis * 1.06,
				height: 0,
				rotation: Cesium.Math.toRadians(row.headingDeg),
				material: colorForSide(row.sideColor, 0.03),
				outline: true,
				outlineColor: colorForSide(row.sideColor, 0.24),
				outlineWidth: 1.2,
				distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
					0,
					lodConfig.sidePressureDistance
				)
			}
		});
		const arrowPositions = buildLinearPolylinePositions([
			row.center,
			row.frontPoint
		]);
		const arrowEntity = arrowPositions
			? this.dataSource.entities.add({
					id: `battle-side-pressure-arrow-${row.sideId}`,
					polyline: {
						positions: arrowPositions,
						width: lodConfig.sidePressureArrowWidth,
						material: new Cesium.PolylineArrowMaterialProperty(
							colorForSide(row.sideColor, 0.72)
						),
						distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
							0,
							lodConfig.sidePressureDistance
						),
						arcType: Cesium.ArcType.NONE,
						clampToGround: false
					}
			  })
			: null;

		return {
			row,
			zoneEntity,
			pulseEntity,
			arrowEntity
		};
	}

	updateSidePressureRecord(record, row) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		record.row = row;
		record.zoneEntity.position = cartesianFromSnapshot({
			...row.center,
			altitudeMeters: 0
		});
		record.pulseEntity.position = cartesianFromSnapshot({
			...row.center,
			altitudeMeters: 0
		});
		if (record.zoneEntity.ellipse) {
			record.zoneEntity.ellipse.semiMajorAxis = row.semiMajorAxis;
			record.zoneEntity.ellipse.semiMinorAxis = row.semiMinorAxis;
			record.zoneEntity.ellipse.rotation = Cesium.Math.toRadians(row.headingDeg);
			record.zoneEntity.ellipse.material = colorForSide(row.sideColor, 0.085);
			record.zoneEntity.ellipse.outlineColor = colorForSide(row.sideColor, 0.42);
			record.zoneEntity.ellipse.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.sidePressureDistance);
		}
		if (record.zoneEntity.label) {
			record.zoneEntity.label.text = `${row.sideName} 압력권 · ${row.pressureScore}`;
			record.zoneEntity.label.backgroundColor = colorForSide(row.sideColor, 0.18);
			record.zoneEntity.label.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.sidePressureDistance);
		}
		if (record.pulseEntity.ellipse) {
			record.pulseEntity.ellipse.semiMajorAxis = row.semiMajorAxis * 1.06;
			record.pulseEntity.ellipse.semiMinorAxis = row.semiMinorAxis * 1.06;
			record.pulseEntity.ellipse.rotation = Cesium.Math.toRadians(row.headingDeg);
			record.pulseEntity.ellipse.material = colorForSide(row.sideColor, 0.03);
			record.pulseEntity.ellipse.outlineColor = colorForSide(row.sideColor, 0.24);
			record.pulseEntity.ellipse.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.sidePressureDistance);
		}

		const arrowPositions = buildLinearPolylinePositions([row.center, row.frontPoint]);
		if (arrowPositions) {
			if (!record.arrowEntity) {
				record.arrowEntity = this.dataSource.entities.add({
					id: `battle-side-pressure-arrow-${row.sideId}`,
					polyline: {
						positions: arrowPositions,
						width: lodConfig.sidePressureArrowWidth,
						material: new Cesium.PolylineArrowMaterialProperty(
							colorForSide(row.sideColor, 0.72)
						),
						distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
							0,
							lodConfig.sidePressureDistance
						),
						arcType: Cesium.ArcType.NONE,
						clampToGround: false
					}
				});
			} else {
				record.arrowEntity.polyline.positions = arrowPositions;
				record.arrowEntity.polyline.width = lodConfig.sidePressureArrowWidth;
				record.arrowEntity.polyline.material =
					new Cesium.PolylineArrowMaterialProperty(
						colorForSide(row.sideColor, 0.72)
					);
				record.arrowEntity.polyline.distanceDisplayCondition =
					new Cesium.DistanceDisplayCondition(0, lodConfig.sidePressureDistance);
			}
		} else if (record.arrowEntity) {
			this.dataSource.entities.remove(record.arrowEntity);
			record.arrowEntity = null;
		}
	}

	removeSidePressureRecord(record) {
		if (record.arrowEntity) {
			this.dataSource.entities.remove(record.arrowEntity);
		}
		this.dataSource.entities.remove(record.pulseEntity);
		this.dataSource.entities.remove(record.zoneEntity);
	}

	syncSidePressures() {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		const rows = buildSidePressureRows(this.state).slice(
			0,
			lodConfig.sidePressureBudget
		);
		const seenIds = new Set();

		rows.forEach((row) => {
			seenIds.add(row.sideId);
			const existingRecord = this.sidePressureRecords.get(row.sideId);
			if (!existingRecord) {
				this.sidePressureRecords.set(
					row.sideId,
					this.createSidePressureRecord(row)
				);
				return;
			}

			this.updateSidePressureRecord(existingRecord, row);
		});

		for (const [sideId, record] of this.sidePressureRecords.entries()) {
			if (seenIds.has(sideId)) {
				continue;
			}

			this.removeSidePressureRecord(record);
			this.sidePressureRecords.delete(sideId);
		}
	}

	rebuildEntities() {
		for (const record of this.unitRecords.values()) {
			if (record.guideEntity) {
				this.dataSource.entities.remove(record.guideEntity.entity);
			}
			if (record.courseEntity) {
				this.dataSource.entities.remove(record.courseEntity.polyline);
				this.dataSource.entities.remove(record.courseEntity.endpoint);
			}
			this.dataSource.entities.remove(record.entity);
		}
		for (const record of this.weaponRecords.values()) {
			if (record.guideEntity) {
				this.dataSource.entities.remove(record.guideEntity.entity);
			}
			if (record.impactLinkEntity) {
				this.dataSource.entities.remove(record.impactLinkEntity);
			}
			this.removeWeaponTrajectoryEntities(record);
			this.dataSource.entities.remove(record.entity);
		}
		for (const record of this.linkRecords.values()) {
			this.dataSource.entities.remove(record.entity);
		}
		for (const record of this.sidePressureRecords.values()) {
			this.removeSidePressureRecord(record);
		}
		for (const record of this.eventRecords.values()) {
			this.removeEventRecord(record);
		}
		for (const record of this.hotspotRecords.values()) {
			this.removeHotspotRecord(record);
		}
		for (const effect of this.effects) {
			this.dataSource.entities.remove(effect.ringEntity);
			this.dataSource.entities.remove(effect.flashEntity);
			this.dataSource.entities.remove(effect.smokeEntity);
		}
		this.unitRecords.clear();
		this.weaponRecords.clear();
		this.linkRecords.clear();
		this.sidePressureRecords.clear();
		this.eventRecords.clear();
		this.hotspotRecords.clear();
		this.effects = [];
		this.clearBattleTracking();
	}

	clearBattleTracking() {
		if (
			this.viewer.trackedEntity &&
			String(this.viewer.trackedEntity.id ?? '').startsWith('battle-')
		) {
			this.viewer.trackedEntity = undefined;
		}
		this.trackedBattleEntityId = null;
	}

	resolveFollowTargetEntity() {
		const parsedFollowTarget = parseFollowTargetId(
			this.state.view?.followTargetId
		);
		if (!parsedFollowTarget) {
			return null;
		}

		if (parsedFollowTarget.type === 'weapon') {
			return this.weaponRecords.get(parsedFollowTarget.id)?.entity ?? null;
		}

		return this.unitRecords.get(parsedFollowTarget.id)?.entity ?? null;
	}

	resolveFollowTargetDescriptor() {
		const parsedFollowTarget = parseFollowTargetId(
			this.state.view?.followTargetId
		);
		if (!parsedFollowTarget) {
			return null;
		}

		if (parsedFollowTarget.type === 'weapon') {
			const record = this.weaponRecords.get(parsedFollowTarget.id);
			if (!record) {
				return null;
			}

			return {
				entity: record.entity,
				snapshot: record.lastWeapon,
				targetType: 'weapon'
			};
		}

		const record = this.unitRecords.get(parsedFollowTarget.id);
		if (!record) {
			return null;
		}

		return {
			entity: record.entity,
			snapshot: record.unit,
			targetType: 'unit'
		};
	}

	applyTrackingView(entity, snapshot, targetType) {
		const range = resolveTrackingOffsetRange(snapshot, targetType);
		const height =
			targetType === 'weapon'
				? Math.max(260, range * 0.3)
				: snapshot?.entityType === 'aircraft'
					? Math.max(950, range * 0.42)
					: snapshot?.entityType === 'ship'
						? Math.max(700, range * 0.34)
						: Math.max(520, range * 0.32);
		const lateral =
			targetType === 'weapon' ? range * 0.12 : range * 0.18;
		const viewFrom = new Cesium.Cartesian3(lateral, -range, height);
		entity.viewFrom = viewFrom;

		return new Cesium.HeadingPitchRange(
			0,
			Cesium.Math.toRadians(resolveTrackingPitchDegrees(snapshot, targetType)),
			range
		);
	}

	syncCameraTracking() {
		const followTargetId = normalizeFollowTargetId(
			this.state.view?.followTargetId
		);
		if (!followTargetId) {
			this.clearBattleTracking();
			return;
		}

		const nextTrackedDescriptor = this.resolveFollowTargetDescriptor();
		if (!nextTrackedDescriptor) {
			return;
		}
		const nextTrackedEntity = nextTrackedDescriptor.entity;
		const trackingOffset = this.applyTrackingView(
			nextTrackedDescriptor.entity,
			nextTrackedDescriptor.snapshot,
			nextTrackedDescriptor.targetType
		);

		if (this.trackedBattleEntityId === nextTrackedEntity.id) {
			return;
		}

		this.viewer.trackedEntity = nextTrackedEntity;
		this.trackedBattleEntityId = nextTrackedEntity.id;
		void this.viewer
			.flyTo(nextTrackedEntity, {
				duration: 0.9,
				offset: trackingOffset
			})
			.catch(() => undefined);
	}

	applyCommand(payload = {}) {
		if (payload.command === 'jump-to-point') {
			const longitude = Number(payload.longitude);
			const latitude = Number(payload.latitude);
			const altitudeMeters = Math.max(
				1200,
				Number(payload.altitudeMeters) || 2500
			);
			if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
				return;
			}

			if (!normalizeFollowTargetId(this.state.view?.followTargetId)) {
				this.clearBattleTracking();
			}

			this.viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(
					longitude,
					latitude,
					altitudeMeters
				),
				duration: Math.max(0.4, Number(payload.durationSeconds) || 1.4)
			});
		}
	}

	updateEffects(dt) {
		for (let index = this.effects.length - 1; index >= 0; index -= 1) {
			const effect = this.effects[index];
			effect.elapsed += dt;
			const progress = clamp(effect.elapsed / effect.lifetime, 0, 1);
			const smokeProgress = clamp(
				effect.elapsed / Math.max(effect.smokeLifetime, effect.lifetime),
				0,
				1
			);
			const radius = 45 + progress * 180;
			const alpha = clamp(0.18 * (1 - progress), 0, 0.18);
			const outlineAlpha = clamp(0.92 * (1 - progress * 0.85), 0, 0.92);

			effect.ringEntity.ellipse.semiMajorAxis = radius;
			effect.ringEntity.ellipse.semiMinorAxis = radius;
			effect.ringEntity.ellipse.material = colorForSide(effect.sideColor, alpha);
			effect.ringEntity.ellipse.outlineColor = colorForSide(
				effect.sideColor,
				outlineAlpha
			);

			effect.flashEntity.point.pixelSize = 18 + progress * 40;
			effect.flashEntity.point.color = colorForSide(
				effect.sideColor,
				clamp(0.95 * (1 - progress), 0, 0.95)
			);
			if (effect.smokeEntity?.cylinder) {
				const smokeLength =
					effect.smokeBaseLength + smokeProgress * effect.smokeBaseLength * 0.78;
				effect.smokeEntity.position = cartesianFromSnapshot({
					...effect.basePoint,
					altitudeMeters: smokeLength * 0.5
				});
				effect.smokeEntity.cylinder.length = smokeLength;
				effect.smokeEntity.cylinder.topRadius = 22 + smokeProgress * 32;
				effect.smokeEntity.cylinder.bottomRadius = 52 + smokeProgress * 78;
				effect.smokeEntity.cylinder.material = Cesium.Color.LIGHTGRAY.withAlpha(
					clamp(0.22 * (1 - smokeProgress), 0, 0.22)
				);
			}

			if (
				effect.elapsed <
				Math.max(effect.lifetime, effect.smokeLifetime)
			) {
				continue;
			}

			this.dataSource.entities.remove(effect.ringEntity);
			this.dataSource.entities.remove(effect.flashEntity);
			this.dataSource.entities.remove(effect.smokeEntity);
			this.effects.splice(index, 1);
		}
	}

	updateGuideAnimations() {
		for (const record of this.unitRecords.values()) {
			if (!record.guideEntity?.entity?.ellipse) {
				continue;
			}

			const emphasized = Boolean(record.guideEntity.emphasized);
			const pulse =
				1 +
				Math.sin(this.animationTime * (emphasized ? 2.6 : 1.2)) *
					(emphasized ? 0.1 : 0.025);
			const radiusMeters = unitGuideRadiusMeters(record.unit, emphasized) * pulse;
			record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
			record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
		}

		for (const record of this.weaponRecords.values()) {
			if (!record.guideEntity?.entity?.ellipse) {
				continue;
			}

			const emphasized = Boolean(record.guideEntity.emphasized);
			const pulse =
				1 +
				Math.sin(this.animationTime * (emphasized ? 3.2 : 1.6)) *
					(emphasized ? 0.12 : 0.04);
			const radiusMeters =
				weaponGuideRadiusMeters(record.lastWeapon, emphasized) * pulse;
			record.guideEntity.entity.ellipse.semiMajorAxis = radiusMeters;
			record.guideEntity.entity.ellipse.semiMinorAxis = radiusMeters;
		}
	}

	updateHotspotAnimations() {
		for (const record of this.hotspotRecords.values()) {
			const hotspot = record.hotspot;
			if (record.pulseEntity?.ellipse) {
				const pulse =
					1 + Math.sin(this.animationTime * 1.4 + hotspot.score * 0.15) * 0.08;
				record.pulseEntity.ellipse.semiMajorAxis =
					hotspot.radiusMeters * 1.18 * pulse;
				record.pulseEntity.ellipse.semiMinorAxis =
					hotspot.radiusMeters * 1.18 * pulse;
				record.pulseEntity.ellipse.material = colorForSide(
					hotspot.dominantSideColor,
					0.035 + (pulse - 0.92) * 0.05
				);
				record.pulseEntity.ellipse.outlineColor = colorForSide(
					hotspot.dominantSideColor,
					0.28 + (pulse - 0.92) * 0.3
				);
			}
			if (record.columnEntity?.cylinder) {
				const pulse =
					1 + Math.sin(this.animationTime * 1.1 + hotspot.score * 0.12) * 0.06;
				const length = hotspotColumnLengthMeters(hotspot) * pulse;
				record.columnEntity.position = cartesianFromSnapshot({
					longitude: hotspot.longitude,
					latitude: hotspot.latitude,
					altitudeMeters: length * 0.5
				});
				record.columnEntity.cylinder.length = length;
				record.columnEntity.cylinder.material = colorForSide(
					hotspot.dominantSideColor,
					0.09 + (pulse - 0.94) * 0.18
				);
			}
		}
	}

	updateSidePressureAnimations() {
		for (const record of this.sidePressureRecords.values()) {
			const pulse =
				1 +
				Math.sin(
					this.animationTime * 0.9 + record.row.pressureScore * 0.08
				) *
					0.045;
			if (record.pulseEntity?.ellipse) {
				record.pulseEntity.ellipse.semiMajorAxis =
					record.row.semiMajorAxis * 1.06 * pulse;
				record.pulseEntity.ellipse.semiMinorAxis =
					record.row.semiMinorAxis * 1.06 * pulse;
				record.pulseEntity.ellipse.material = colorForSide(
					record.row.sideColor,
					0.025 + (pulse - 0.955) * 0.16
				);
				record.pulseEntity.ellipse.outlineColor = colorForSide(
					record.row.sideColor,
					0.2 + (pulse - 0.955) * 0.26
				);
			}
			if (record.arrowEntity?.polyline) {
				record.arrowEntity.polyline.material =
					new Cesium.PolylineArrowMaterialProperty(
						colorForSide(
							record.row.sideColor,
							0.64 + (pulse - 0.955) * 0.6
						)
					);
			}
		}
	}

	clear() {
		this.dataSource.entities.removeAll();
		this.unitRecords.clear();
		this.weaponRecords.clear();
		this.linkRecords.clear();
		this.sidePressureRecords.clear();
		this.eventRecords.clear();
		this.hotspotRecords.clear();
		this.effects = [];
		this.state = defaultBattleState();
		this.clearBattleTracking();
		this.animationTime = 0;
	}

	update(dt) {
		this.animationTime += dt;
		if (this.state.view?.followTargetId) {
			this.syncCameraTracking();
		} else if (this.trackedBattleEntityId) {
			this.clearBattleTracking();
		}

		if (this.effects.length > 0) {
			this.updateEffects(dt);
		}
		if (this.unitRecords.size > 0 || this.weaponRecords.size > 0) {
			this.updateGuideAnimations();
		}
		if (this.hotspotRecords.size > 0) {
			this.updateHotspotAnimations();
		}
		if (this.sidePressureRecords.size > 0) {
			this.updateSidePressureAnimations();
		}
	}
}
