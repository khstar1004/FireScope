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

const DEFAULT_LOD_LEVEL = 'balanced';
const UNIT_SAMPLE_SECONDS = 0.35;
const WEAPON_SAMPLE_SECONDS = 0.28;
const LOD_CONFIG = {
	cinematic: {
		facilityModelBudget: 90,
		labelDistance: 140000,
		weaponTrailTime: 6,
		weaponPathWidth: 5,
		weaponGlowPower: 0.24,
		weaponModelScale: 1.18,
		weaponMinimumPixelSize: 28,
		weaponMaximumScale: 180,
		weaponPointSize: 8,
		impactLifetimeSeconds: 1.8
	},
	balanced: {
		facilityModelBudget: 40,
		labelDistance: 90000,
		weaponTrailTime: 4.2,
		weaponPathWidth: 4,
		weaponGlowPower: 0.2,
		weaponModelScale: 1.05,
		weaponMinimumPixelSize: 22,
		weaponMaximumScale: 140,
		weaponPointSize: 6,
		impactLifetimeSeconds: 1.35
	},
	performance: {
		facilityModelBudget: 8,
		labelDistance: 60000,
		weaponTrailTime: 2.8,
		weaponPathWidth: 3,
		weaponGlowPower: 0.16,
		weaponModelScale: 0.92,
		weaponMinimumPixelSize: 18,
		weaponMaximumScale: 100,
		weaponPointSize: 5,
		impactLifetimeSeconds: 1
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

function addPositionSample(positionProperty, point, seconds) {
	const targetTime = Cesium.JulianDate.addSeconds(
		Cesium.JulianDate.now(),
		seconds,
		new Cesium.JulianDate()
	);
	positionProperty.addSample(targetTime, cartesianFromSnapshot(point));
}

function findFirstMatchingModel(signature, candidates, fallbackModel) {
	for (const [pattern, modelPath] of candidates) {
		if (pattern.test(signature)) {
			return modelPath;
		}
	}

	return fallbackModel;
}

function resolveUnitModel(unit, totalUnits, lodConfig) {
	if (unit.entityType === 'airbase') {
		return null;
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
		unit.entityType === 'facility' &&
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
		selected: unit.selected === true
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
		this.eventRecords = new Map();
		this.effects = [];
		this.trackedBattleEntityId = null;
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
		this.syncCameraTracking();
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
			label: createLabel(unit.name, unit.sideColor, lodConfig.labelDistance)
		});

		return {
			entity,
			positionProperty,
			unit,
			useModel: Boolean(useModel)
		};
	}

	updateUnitRecord(record, unit) {
		const lodConfig = getLodConfig(this.state.view?.lodLevel);
		record.unit = unit;
		addPositionSample(record.positionProperty, unit, UNIT_SAMPLE_SECONDS);

		if (record.entity.label) {
			record.entity.label.text = unit.name;
			record.entity.label.backgroundColor = colorForSide(unit.sideColor, 0.18);
			record.entity.label.distanceDisplayCondition =
				new Cesium.DistanceDisplayCondition(0, lodConfig.labelDistance);
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
			lastWeapon: weapon
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

		this.effects.push({
			elapsed: 0,
			lifetime: lodConfig.impactLifetimeSeconds,
			ringEntity,
			flashEntity,
			sideColor: weapon.sideColor
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
			this.dataSource.entities.remove(record.entity);
			this.weaponRecords.delete(weaponId);
		}
	}

	createEventRecord(event) {
		const currentTime = this.state.currentTime || event.timestamp || 0;
		const ageSeconds = Math.max(0, currentTime - event.timestamp);
		const lifetimeSeconds = getEventLifetimeSeconds(event);
		const ageRatio = clamp(1 - ageSeconds / lifetimeSeconds, 0.15, 1);
		const focusPoint = getEventFocusPoint(event);
		const polylinePositions = buildEventPolylinePositions(event);
		const sideColor = colorForSide(event.sideColor, 0.22 + ageRatio * 0.5);
		const outlineColor = colorForSide(event.sideColor, 0.55 + ageRatio * 0.35);
		const pointEntity = focusPoint
			? this.dataSource.entities.add({
					id: `battle-event-point-${event.id}`,
					position: cartesianFromSnapshot(focusPoint),
					point: {
						pixelSize:
							event.resultTag === 'launch'
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
							event.resultTag === 'launch'
								? 3.5
								: event.resultTag === 'kill'
									? 5
									: 4,
						material:
							event.resultTag === 'launch'
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

		return {
			event,
			pointEntity,
			lineEntity
		};
	}

	updateEventRecord(record, event) {
		const currentTime = this.state.currentTime || event.timestamp || 0;
		const ageSeconds = Math.max(0, currentTime - event.timestamp);
		const lifetimeSeconds = getEventLifetimeSeconds(event);
		const ageRatio = clamp(1 - ageSeconds / lifetimeSeconds, 0.15, 1);
		record.event = event;

		if (record.pointEntity?.point) {
			record.pointEntity.point.color = colorForSide(
				event.sideColor,
				0.55 + ageRatio * 0.35
			);
			record.pointEntity.point.pixelSize =
				event.resultTag === 'launch'
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
				event.resultTag === 'launch'
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

	rebuildEntities() {
		for (const record of this.unitRecords.values()) {
			this.dataSource.entities.remove(record.entity);
		}
		for (const record of this.weaponRecords.values()) {
			this.dataSource.entities.remove(record.entity);
		}
		for (const record of this.eventRecords.values()) {
			this.removeEventRecord(record);
		}
		for (const effect of this.effects) {
			this.dataSource.entities.remove(effect.ringEntity);
			this.dataSource.entities.remove(effect.flashEntity);
		}
		this.unitRecords.clear();
		this.weaponRecords.clear();
		this.eventRecords.clear();
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

	syncCameraTracking() {
		const followTargetId = normalizeFollowTargetId(
			this.state.view?.followTargetId
		);
		if (!followTargetId) {
			this.clearBattleTracking();
			return;
		}

		const nextTrackedEntity = this.resolveFollowTargetEntity();
		if (!nextTrackedEntity) {
			return;
		}

		if (this.trackedBattleEntityId === nextTrackedEntity.id) {
			return;
		}

		this.viewer.trackedEntity = nextTrackedEntity;
		this.trackedBattleEntityId = nextTrackedEntity.id;
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

			if (effect.elapsed < effect.lifetime) {
				continue;
			}

			this.dataSource.entities.remove(effect.ringEntity);
			this.dataSource.entities.remove(effect.flashEntity);
			this.effects.splice(index, 1);
		}
	}

	clear() {
		this.dataSource.entities.removeAll();
		this.unitRecords.clear();
		this.weaponRecords.clear();
		this.eventRecords.clear();
		this.effects = [];
		this.state = defaultBattleState();
		this.clearBattleTracking();
	}

	update(dt) {
		if (this.state.view?.followTargetId) {
			this.syncCameraTracking();
		} else if (this.trackedBattleEntityId) {
			this.clearBattleTracking();
		}

		if (this.effects.length > 0) {
			this.updateEffects(dt);
		}
	}
}
