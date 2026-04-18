import * as Cesium from 'cesium';
import { resolveAssetUrl as assetUrl } from '../utils/assetPaths';

const EARTH_RADIUS_M = 6378137;
const MIN_DIRECTION_MAGNITUDE_SQUARED = 0.0001;

const FOCUS_FIRE_ASSETS = {
	projectiles: {
		artillery: '/3d-bundles/artillery/models/artillery_shell.glb',
		aircraft: '/3d-bundles/missile/aim-120c_amraam.glb',
		armor: '/3d-bundles/artillery/models/artillery_shell.glb'
	},
	textures: {
		headGlow: '/3d-bundles/effects/textures/focus-fire/head_glow.png',
		launchMuzzle: '/3d-bundles/effects/textures/focus-fire/launch_muzzle.png',
		trailTrace: '/3d-bundles/effects/textures/focus-fire/trail_trace.png',
		trailSmoke: '/3d-bundles/effects/textures/focus-fire/trail_smoke.png',
		impactExplosion: '/3d-bundles/effects/textures/impact/explosion.png',
		impactFlash: '/3d-bundles/effects/textures/focus-fire/impact_flash.png',
		impactSmoke: '/3d-bundles/effects/textures/focus-fire/impact_smoke.png',
		impactDust: '/3d-bundles/effects/textures/focus-fire/impact_dust.png'
	}
};

const scratchTransform = new Cesium.Matrix4();
const scratchInverseTransform = new Cesium.Matrix4();
const scratchDirection = new Cesium.Cartesian3();
const scratchLocalDirection = new Cesium.Cartesian3();
const scratchHeadingPitchRoll = new Cesium.HeadingPitchRoll();

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function lerp(start, end, t) {
	return start + (end - start) * t;
}

function randomBetween(min, max) {
	return min + Math.random() * (max - min);
}

function normalizeHeading(heading) {
	return ((heading % 360) + 360) % 360;
}

function color(cssColor, alpha = 1) {
	return Cesium.Color.fromCssColorString(cssColor).withAlpha(alpha);
}

function formatTrackDistance(distanceMeters) {
	if (distanceMeters >= 1000) {
		const kilometers = distanceMeters / 1000;
		return `${kilometers >= 100 ? kilometers.toFixed(0) : kilometers.toFixed(1)} km`;
	}

	return `${Math.round(distanceMeters)} m`;
}

function offsetCoordinates(lon, lat, distanceMeters, headingDeg) {
	const headingRad = Cesium.Math.toRadians(normalizeHeading(headingDeg));
	const latRad = Cesium.Math.toRadians(lat);
	const dLat = (distanceMeters * Math.cos(headingRad)) / EARTH_RADIUS_M;
	const dLon =
		(distanceMeters * Math.sin(headingRad)) /
		(EARTH_RADIUS_M * Math.max(0.2, Math.cos(latRad)));

	return {
		lon: lon + Cesium.Math.toDegrees(dLon),
		lat: lat + Cesium.Math.toDegrees(dLat)
	};
}

function cartesianFromPoint(point) {
	return Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt);
}

function distanceMetersBetweenPoints(start, end) {
	const geodesic = new Cesium.EllipsoidGeodesic(
		Cesium.Cartographic.fromDegrees(start.lon, start.lat),
		Cesium.Cartographic.fromDegrees(end.lon, end.lat)
	);
	return Number.isFinite(geodesic.surfaceDistance) ? geodesic.surfaceDistance : 0;
}

function resolveOrientation(position, target, offsets = {}) {
	Cesium.Cartesian3.subtract(target, position, scratchDirection);
	if (Cesium.Cartesian3.magnitudeSquared(scratchDirection) < MIN_DIRECTION_MAGNITUDE_SQUARED) {
		return Cesium.Quaternion.IDENTITY;
	}

	Cesium.Cartesian3.normalize(scratchDirection, scratchDirection);
	Cesium.Transforms.eastNorthUpToFixedFrame(position, undefined, scratchTransform);
	Cesium.Matrix4.inverseTransformation(scratchTransform, scratchInverseTransform);
	Cesium.Matrix4.multiplyByPointAsVector(
		scratchInverseTransform,
		scratchDirection,
		scratchLocalDirection
	);

	const horizontalMagnitude = Math.hypot(
		scratchLocalDirection.x,
		scratchLocalDirection.y
	);

	scratchHeadingPitchRoll.heading =
		Math.atan2(scratchLocalDirection.x, scratchLocalDirection.y) +
		(offsets.heading ?? 0);
	scratchHeadingPitchRoll.pitch =
		Math.atan2(
			scratchLocalDirection.z,
			Math.max(horizontalMagnitude, 0.0001)
		) + (offsets.pitch ?? 0);
	scratchHeadingPitchRoll.roll = offsets.roll ?? 0;

	return Cesium.Transforms.headingPitchRollQuaternion(
		position,
		scratchHeadingPitchRoll
	);
}

function getProjectileVisual(variant) {
	switch (variant) {
		case 'aircraft':
			return {
				color: '#7fe7ff',
				modelUri: FOCUS_FIRE_ASSETS.projectiles.aircraft,
				modelScale: 2.2,
				minimumPixelSize: 64,
				maximumScale: 240,
				modelColorAlpha: 0.92,
				colorBlendAmount: 0.22,
				silhouetteAlpha: 0.66,
				silhouetteSize: 1.9,
				trailWidth: 2.5,
				trailGlowPower: 0.18,
				headGlowScale: 0.92,
				headGlowAlpha: 0.94,
				headCoreSize: 10,
				trailSpriteImage: FOCUS_FIRE_ASSETS.textures.trailTrace,
				trailSpriteScale: 0.72,
				trailSpriteAlpha: 0.82,
				trailLag: 0.05,
				launchScale: 0.4,
				impactScale: 0.82,
				impactFlashScale: 0.68,
				smokeScale: 0.84,
				dustScale: 0.5,
				impactRadius: 132,
				impactLifetime: 1.45,
				orientationOffsets: {
					roll: 0
				}
			};
		case 'armor':
			return {
				color: '#ffd166',
				modelUri: FOCUS_FIRE_ASSETS.projectiles.armor,
				modelScale: 0.82,
				minimumPixelSize: 28,
				maximumScale: 96,
				modelColorAlpha: 0.8,
				colorBlendAmount: 0.28,
				silhouetteAlpha: 0.58,
				silhouetteSize: 1.25,
				trailWidth: 2.1,
				trailGlowPower: 0.26,
				headGlowScale: 0.44,
				headGlowAlpha: 0.82,
				headCoreSize: 7,
				trailSpriteImage: FOCUS_FIRE_ASSETS.textures.trailSmoke,
				trailSpriteScale: 0.36,
				trailSpriteAlpha: 0.46,
				trailLag: 0.035,
				launchScale: 0.26,
				impactScale: 0.58,
				impactFlashScale: 0.5,
				smokeScale: 0.72,
				dustScale: 0.48,
				impactRadius: 90,
				impactLifetime: 1.2,
				orientationOffsets: {
					roll: 0
				}
			};
		default:
			return {
				color: '#ffb347',
				modelUri: FOCUS_FIRE_ASSETS.projectiles.artillery,
				modelScale: 1.08,
				minimumPixelSize: 34,
				maximumScale: 112,
				modelColorAlpha: 0.84,
				colorBlendAmount: 0.26,
				silhouetteAlpha: 0.6,
				silhouetteSize: 1.4,
				trailWidth: 3.25,
				trailGlowPower: 0.32,
				headGlowScale: 0.58,
				headGlowAlpha: 0.88,
				headCoreSize: 8,
				trailSpriteImage: FOCUS_FIRE_ASSETS.textures.trailSmoke,
				trailSpriteScale: 0.42,
				trailSpriteAlpha: 0.52,
				trailLag: 0.045,
				launchScale: 0.32,
				impactScale: 0.92,
				impactFlashScale: 0.58,
				smokeScale: 1.0,
				dustScale: 0.62,
				impactRadius: 165,
				impactLifetime: 1.55,
				orientationOffsets: {
					roll: 0
				}
			};
	}
}

function getTrajectoryOverlayVisual(variant) {
	switch (variant) {
		case 'aircraft':
			return {
				arcColor: '#9feaff',
				progressColor: '#dffbff',
				beamColor: '#dffbff',
				width: 2.5,
				progressWidth: 3.3,
				glowPower: 0.2,
				progressGlowPower: 0.34,
				arcAlpha: 0.3,
				progressAlpha: 0.96,
				beamAlpha: 0.56,
				apexMultiplier: 0.24,
				minApexHeight: 18000,
				maxApexHeight: 320000,
				maxBeamHeight: 56000
			};
		case 'armor':
			return {
				arcColor: '#ffe08a',
				progressColor: '#fff1bf',
				beamColor: '#fff1bf',
				width: 2.0,
				progressWidth: 2.6,
				glowPower: 0.18,
				progressGlowPower: 0.28,
				arcAlpha: 0.24,
				progressAlpha: 0.86,
				beamAlpha: 0.42,
				apexMultiplier: 0.15,
				minApexHeight: 4000,
				maxApexHeight: 80000,
				maxBeamHeight: 18000
			};
		default:
			return {
				arcColor: '#ffd166',
				progressColor: '#fff2c6',
				beamColor: '#fff2c6',
				width: 2.3,
				progressWidth: 3.1,
				glowPower: 0.24,
				progressGlowPower: 0.34,
				arcAlpha: 0.28,
				progressAlpha: 0.92,
				beamAlpha: 0.48,
				apexMultiplier: 0.22,
				minApexHeight: 14000,
				maxApexHeight: 240000,
				maxBeamHeight: 42000
			};
	}
}

function defaultFocusFireState() {
	return {
		objectiveLon: null,
		objectiveLat: null,
		objectiveName: '집중포격 목표',
		active: false,
		captureProgress: 0,
		aircraftCount: 0,
		artilleryCount: 0,
		armorCount: 0,
		weaponsInFlight: 0,
		launchPlatforms: [],
		weaponTracks: [],
		statusLabel: '대기'
	};
}

export class FocusFireSystem {
	constructor(viewer) {
		this.viewer = viewer;
		this.focusState = defaultFocusFireState();
		this.projectiles = [];
		this.impacts = [];
		this.trajectoryOverlays = new Map();
		this.renderedTrackIds = new Set();
		this.launchPlatformMarkers = new Map();
		this.objectiveMarker = null;
		this.objectiveRing = null;
		this.objectiveLabel = null;
	}

	hasObjective() {
		return (
			Number.isFinite(this.focusState.objectiveLon) &&
			Number.isFinite(this.focusState.objectiveLat)
		);
	}

	getTerrainHeight(lon, lat, fallback = 0) {
		const globe = this.viewer?.scene?.globe;
		if (!globe) return fallback;

		const terrainHeight = globe.getHeight(Cesium.Cartographic.fromDegrees(lon, lat));
		return Number.isFinite(terrainHeight) ? terrainHeight : fallback;
	}

	clearProjectiles() {
		for (const projectile of this.projectiles) {
			this.viewer.entities.remove(projectile.headEntity);
			this.viewer.entities.remove(projectile.headCoreEntity);
			this.viewer.entities.remove(projectile.headGlowEntity);
			this.viewer.entities.remove(projectile.trailEntity);
			this.viewer.entities.remove(projectile.trailSpriteEntity);
			if (projectile.launchFlash) {
				this.viewer.entities.remove(projectile.launchFlash);
			}
		}
		this.projectiles = [];
		this.renderedTrackIds.clear();

		for (const impact of this.impacts) {
			this.viewer.entities.remove(impact.ringEntity);
			this.viewer.entities.remove(impact.flashEntity);
			this.viewer.entities.remove(impact.fireballEntity);
			this.viewer.entities.remove(impact.smokeEntity);
			this.viewer.entities.remove(impact.dustEntity);
		}
		this.impacts = [];
	}

	removeTrajectoryOverlay(overlay) {
		if (!overlay) {
			return;
		}

		if (overlay.arcEntity) {
			this.viewer.entities.remove(overlay.arcEntity);
		}
		if (overlay.progressEntity) {
			this.viewer.entities.remove(overlay.progressEntity);
		}
		if (overlay.startBeamEntity) {
			this.viewer.entities.remove(overlay.startBeamEntity);
		}
		if (overlay.endBeamEntity) {
			this.viewer.entities.remove(overlay.endBeamEntity);
		}
	}

	clearTrajectoryOverlays() {
		for (const overlay of this.trajectoryOverlays.values()) {
			this.removeTrajectoryOverlay(overlay);
		}
		this.trajectoryOverlays.clear();
	}

	removeObjectiveEntities() {
		if (this.objectiveMarker) {
			this.viewer.entities.remove(this.objectiveMarker);
			this.objectiveMarker = null;
		}
		if (this.objectiveRing) {
			this.viewer.entities.remove(this.objectiveRing);
			this.objectiveRing = null;
		}
		if (this.objectiveLabel) {
			this.viewer.entities.remove(this.objectiveLabel);
			this.objectiveLabel = null;
		}
	}

	removeLaunchPlatformEntities() {
		for (const marker of this.launchPlatformMarkers.values()) {
			if (marker.pointEntity) {
				this.viewer.entities.remove(marker.pointEntity);
			}
			if (marker.ringEntity) {
				this.viewer.entities.remove(marker.ringEntity);
			}
			if (marker.labelEntity) {
				this.viewer.entities.remove(marker.labelEntity);
			}
		}
		this.launchPlatformMarkers.clear();
	}

	setState(payload = {}) {
		const previousState = this.focusState;
		const nextState = {
			objectiveLon: Number.isFinite(Number(payload.objectiveLon))
				? Number(payload.objectiveLon)
				: null,
			objectiveLat: Number.isFinite(Number(payload.objectiveLat))
				? Number(payload.objectiveLat)
				: null,
			objectiveName:
				typeof payload.objectiveName === 'string' && payload.objectiveName.trim().length > 0
					? payload.objectiveName.trim()
					: '집중포격 목표',
			active: payload.active === true,
			captureProgress: clamp(Number(payload.captureProgress) || 0, 0, 100),
			aircraftCount: Math.max(0, Math.floor(Number(payload.aircraftCount) || 0)),
			artilleryCount: Math.max(0, Math.floor(Number(payload.artilleryCount) || 0)),
			armorCount: Math.max(0, Math.floor(Number(payload.armorCount) || 0)),
			weaponsInFlight: Math.max(0, Math.floor(Number(payload.weaponsInFlight) || 0)),
			launchPlatforms: Array.isArray(payload.launchPlatforms)
				? payload.launchPlatforms.filter(
						(platform) =>
							Number.isFinite(Number(platform?.latitude)) &&
							Number.isFinite(Number(platform?.longitude))
				  )
				: [],
			weaponTracks: Array.isArray(payload.weaponTracks)
				? payload.weaponTracks.filter(
						(track) =>
							typeof track?.id === 'string' &&
							Number.isFinite(Number(track?.launcherLatitude)) &&
							Number.isFinite(Number(track?.launcherLongitude)) &&
							Number.isFinite(Number(track?.targetLatitude)) &&
							Number.isFinite(Number(track?.targetLongitude))
				  )
				: [],
			statusLabel:
				typeof payload.statusLabel === 'string' && payload.statusLabel.trim().length > 0
					? payload.statusLabel.trim()
					: '대기'
		};

		const objectiveChanged =
			nextState.objectiveLon !== previousState.objectiveLon ||
			nextState.objectiveLat !== previousState.objectiveLat;

		this.focusState = nextState;

		if (!this.hasObjective()) {
			this.clearProjectiles();
			this.clearTrajectoryOverlays();
			this.removeObjectiveEntities();
			this.removeLaunchPlatformEntities();
			return;
		}

		if (objectiveChanged) {
			this.clearProjectiles();
			this.clearTrajectoryOverlays();
		}

		this.ensureObjectiveEntities();
		this.syncLaunchPlatformMarkers();
		this.syncTrajectoryOverlays(nextState);
		this.syncWeaponTrackProjectiles(previousState, nextState);
	}

	ensureObjectiveEntities() {
		if (!this.hasObjective()) {
			this.removeObjectiveEntities();
			return;
		}

		const objectiveAltitude = this.getTerrainHeight(
			this.focusState.objectiveLon,
			this.focusState.objectiveLat,
			0
		);
		const objectivePosition = Cesium.Cartesian3.fromDegrees(
			this.focusState.objectiveLon,
			this.focusState.objectiveLat,
			objectiveAltitude + 18
		);

		if (!this.objectiveMarker) {
			this.objectiveMarker = this.viewer.entities.add({
				position: objectivePosition,
				point: {
					pixelSize: 10,
					color: color('#ffb347', 0.95),
					outlineColor: Cesium.Color.WHITE,
					outlineWidth: 2,
					disableDepthTestDistance: Number.POSITIVE_INFINITY
				}
			});
		}

		if (!this.objectiveRing) {
			this.objectiveRing = this.viewer.entities.add({
				position: Cesium.Cartesian3.fromDegrees(
					this.focusState.objectiveLon,
					this.focusState.objectiveLat,
					objectiveAltitude + 2
				),
				ellipse: {
					semiMajorAxis: 650,
					semiMinorAxis: 650,
					material: color('#ff8c42', 0.12),
					outline: true,
					outlineColor: color('#ffd166', 0.95),
					outlineWidth: 2,
					height: 0
				}
			});
		}

		if (!this.objectiveLabel) {
			this.objectiveLabel = this.viewer.entities.add({
				position: Cesium.Cartesian3.fromDegrees(
					this.focusState.objectiveLon,
					this.focusState.objectiveLat,
					objectiveAltitude + 320
				),
				label: {
					text: '',
					font: '700 15px Bahnschrift, sans-serif',
					fillColor: Cesium.Color.WHITE,
					outlineColor: color('#241003', 0.98),
					outlineWidth: 5,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
					disableDepthTestDistance: Number.POSITIVE_INFINITY,
					pixelOffset: new Cesium.Cartesian2(0, -10)
				}
			});
		}

		this.objectiveMarker.position = objectivePosition;
		this.objectiveRing.position = Cesium.Cartesian3.fromDegrees(
			this.focusState.objectiveLon,
			this.focusState.objectiveLat,
			objectiveAltitude + 2
		);
		this.objectiveLabel.position = Cesium.Cartesian3.fromDegrees(
			this.focusState.objectiveLon,
			this.focusState.objectiveLat,
			objectiveAltitude + 320
		);
		this.objectiveLabel.label.text = [
			this.focusState.objectiveName,
			`${this.focusState.statusLabel} · 점령 ${Math.round(this.focusState.captureProgress)}%`,
			`탄체 ${this.focusState.weaponsInFlight} · 포대 ${this.focusState.artilleryCount} / 기갑 ${this.focusState.armorCount} / 항공 ${this.focusState.aircraftCount}`
		].join('\n');
	}

	getLaunchPlatformMarkerStyle(variant, launched) {
		switch (variant) {
			case 'armor':
				return {
					color: launched ? '#ffd166' : '#d4a94d',
					ringColor: launched ? '#ffd166' : '#c7952e',
					labelColor: '#ffe7a2',
					labelPrefix: '기갑'
				};
			case 'aircraft':
				return {
					color: launched ? '#7fe7ff' : '#4db7df',
					ringColor: launched ? '#7fe7ff' : '#4db7df',
					labelColor: '#bfefff',
					labelPrefix: '항공'
				};
			default:
				return {
					color: launched ? '#ffb347' : '#ff8c42',
					ringColor: launched ? '#ffd166' : '#ff9f63',
					labelColor: '#fff1da',
					labelPrefix: '포대'
				};
		}
	}

	getDisplayedLaunchPlatforms() {
		return this.focusState.launchPlatforms;
	}

	getDisplayedWeaponTracks(state = this.focusState) {
		return state.weaponTracks;
	}

	getActiveLaunchPlatforms(launchPlatforms = [], options = {}) {
		const launchedOnly = options.launchedOnly === true;
		const validPlatforms = launchPlatforms.filter((platform) => {
			if (!platform || typeof platform.id !== 'string') {
				return false;
			}

			return launchedOnly ? platform.launched === true : true;
		});
		if (launchedOnly) {
			return validPlatforms;
		}

		const launchedPlatforms = validPlatforms.filter(
			(platform) => platform.launched === true
		);
		return launchedPlatforms.length > 0 ? launchedPlatforms : validPlatforms;
	}

	getLaunchPlatformVolleyWeight(platform) {
		switch (platform?.variant) {
			case 'aircraft':
				return 1;
			case 'armor':
				return 2;
			default:
				return 3;
		}
	}

	getLaunchPlatformVolleyPattern(launchPlatforms = [], options = {}) {
		const activePlatforms = this.getActiveLaunchPlatforms(
			launchPlatforms,
			options
		);
		const weightedPlatforms = [];

		activePlatforms.forEach((platform) => {
			const volleyWeight = this.getLaunchPlatformVolleyWeight(platform);
			for (let count = 0; count < volleyWeight; count += 1) {
				weightedPlatforms.push(platform);
			}
		});

		return weightedPlatforms;
	}

	getNewlyLaunchedPlatforms(previousPlatforms = [], nextPlatforms = []) {
		const previousLaunchState = new Map(
			previousPlatforms
				.filter(
					(platform) => platform && typeof platform.id === 'string'
				)
				.map((platform) => [platform.id, platform.launched === true])
		);

		return nextPlatforms.filter(
			(platform) =>
				platform &&
				typeof platform.id === 'string' &&
				platform.launched === true &&
				previousLaunchState.get(platform.id) !== true
		);
	}

	syncLaunchPlatformMarkers() {
		if (!this.hasObjective()) {
			this.removeLaunchPlatformEntities();
			return;
		}

		const visiblePlatforms = this.getDisplayedLaunchPlatforms();
		if (visiblePlatforms.length === 0) {
			this.removeLaunchPlatformEntities();
			return;
		}

		const activePlatformIds = new Set(
			visiblePlatforms.map((platform) => platform.id)
		);

		for (const [platformId, marker] of this.launchPlatformMarkers.entries()) {
			if (activePlatformIds.has(platformId)) {
				continue;
			}
			if (marker.pointEntity) {
				this.viewer.entities.remove(marker.pointEntity);
			}
			if (marker.ringEntity) {
				this.viewer.entities.remove(marker.ringEntity);
			}
			if (marker.labelEntity) {
				this.viewer.entities.remove(marker.labelEntity);
			}
			this.launchPlatformMarkers.delete(platformId);
		}

		visiblePlatforms.forEach((platform) => {
			const markerStyle = this.getLaunchPlatformMarkerStyle(
				platform.variant,
				platform.launched
			);
			const platformHeight = this.getTerrainHeight(
				platform.longitude,
				platform.latitude,
				platform.altitudeMeters
			);
			const pointPosition = Cesium.Cartesian3.fromDegrees(
				platform.longitude,
				platform.latitude,
				platformHeight + 20
			);
			const ringPosition = Cesium.Cartesian3.fromDegrees(
				platform.longitude,
				platform.latitude,
				platformHeight + 2
			);
			const labelPosition = Cesium.Cartesian3.fromDegrees(
				platform.longitude,
				platform.latitude,
				platformHeight + 170
			);
			let marker = this.launchPlatformMarkers.get(platform.id);

			if (!marker) {
				marker = {
					pointEntity: this.viewer.entities.add({
						position: pointPosition,
						point: {
							pixelSize: 9,
							color: color(markerStyle.color, 0.95),
							outlineColor: Cesium.Color.WHITE,
							outlineWidth: 2,
							disableDepthTestDistance: Number.POSITIVE_INFINITY
						}
					}),
					ringEntity: this.viewer.entities.add({
						position: ringPosition,
						ellipse: {
							semiMajorAxis: 210,
							semiMinorAxis: 210,
							material: color(markerStyle.ringColor, 0.08),
							outline: true,
							outlineColor: color(markerStyle.ringColor, 0.85),
							outlineWidth: 2,
							height: 0
						}
					}),
					labelEntity: this.viewer.entities.add({
						position: labelPosition,
						label: {
							text: '',
							font: '600 12px Bahnschrift, sans-serif',
							fillColor: color(markerStyle.labelColor, 0.96),
							outlineColor: color('#221204', 0.95),
							outlineWidth: 4,
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
							pixelOffset: new Cesium.Cartesian2(0, -10),
							disableDepthTestDistance: Number.POSITIVE_INFINITY
						}
					})
				};
				this.launchPlatformMarkers.set(platform.id, marker);
			}

			marker.pointEntity.position = pointPosition;
			marker.pointEntity.point.pixelSize = platform.launched ? 11 : 9;
			marker.pointEntity.point.color = color(markerStyle.color, 0.95);
			marker.ringEntity.position = ringPosition;
			marker.ringEntity.ellipse.semiMajorAxis = platform.launched ? 260 : 210;
			marker.ringEntity.ellipse.semiMinorAxis = platform.launched ? 260 : 210;
			marker.ringEntity.ellipse.material = color(
				markerStyle.ringColor,
				platform.launched ? 0.12 : 0.08
			);
			marker.ringEntity.ellipse.outlineColor = color(
				markerStyle.ringColor,
				platform.launched ? 0.95 : 0.82
			);
			marker.labelEntity.position = labelPosition;
			marker.labelEntity.label.text = `${markerStyle.labelPrefix} · ${platform.name}`;
			marker.labelEntity.label.fillColor = color(markerStyle.labelColor, 0.96);
		});
	}

	createProjectileVariant(index) {
		const artilleryWeight = Math.max(1, this.focusState.artilleryCount);
		const aircraftWeight = Math.max(0, this.focusState.aircraftCount);
		const armorWeight = Math.max(0, this.focusState.armorCount);
		const pattern = [];

		for (let i = 0; i < artilleryWeight; i += 1) pattern.push('artillery');
		for (let i = 0; i < Math.min(aircraftWeight, 3); i += 1) pattern.push('aircraft');
		for (let i = 0; i < Math.min(armorWeight, 2); i += 1) pattern.push('armor');

		return pattern[index % Math.max(pattern.length, 1)] ?? 'artillery';
	}

	buildProjectileArc(start, end, variant, progress = 0) {
		const distanceMeters = Math.max(distanceMetersBetweenPoints(start, end), 120);
		const baseApexHeight =
			variant === 'aircraft'
				? clamp(distanceMeters * 0.18, 520, 2800)
				: variant === 'armor'
					? clamp(distanceMeters * 0.11, 180, 820)
					: clamp(distanceMeters * 0.16, 460, 2400);
		const duration =
			variant === 'aircraft'
				? clamp(distanceMeters / 1100, 2.1, 7.2)
				: variant === 'armor'
					? clamp(distanceMeters / 750, 1.4, 5.4)
					: clamp(distanceMeters / 900, 2.2, 6.5);

		return {
			duration,
			apexHeight: baseApexHeight,
			elapsed: clamp(progress, 0, 0.96) * duration
		};
	}

	createProjectileEntity(projectile) {
		const initialT = clamp(projectile.elapsed / projectile.duration, 0, 1);
		const currentPoint = this.sampleArc(projectile, initialT);
		const currentPosition = cartesianFromPoint(currentPoint);
		const nextPosition = cartesianFromPoint(
			this.sampleArc(projectile, Math.min(initialT + 0.05, 1))
		);

		projectile.headEntity = this.viewer.entities.add({
			position: currentPosition,
			orientation: resolveOrientation(
				currentPosition,
				nextPosition,
				projectile.visual.orientationOffsets
			),
			model: {
				uri: assetUrl(projectile.visual.modelUri, 'Focus fire projectile'),
				scale: projectile.visual.modelScale,
				minimumPixelSize: projectile.visual.minimumPixelSize,
				maximumScale: projectile.visual.maximumScale,
				color: color(projectile.visual.color, projectile.visual.modelColorAlpha),
				colorBlendMode: Cesium.ColorBlendMode.MIX,
				colorBlendAmount: projectile.visual.colorBlendAmount ?? 0.3,
				silhouetteColor: color('#ffffff', projectile.visual.silhouetteAlpha ?? 0.5),
				silhouetteSize: projectile.visual.silhouetteSize
			}
		});

		projectile.headCoreEntity = this.viewer.entities.add({
			position: currentPosition,
			point: {
				pixelSize: projectile.visual.headCoreSize ?? 8,
				color: color('#ffffff', 0.98),
				outlineColor: color(projectile.visual.color, 0.98),
				outlineWidth: 2,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		projectile.headGlowEntity = this.viewer.entities.add({
			position: currentPosition,
			billboard: {
				image: assetUrl(FOCUS_FIRE_ASSETS.textures.headGlow, 'Focus fire glow'),
				scale: projectile.visual.headGlowScale,
				color: color(
					projectile.visual.color,
					projectile.visual.headGlowAlpha ?? 0.78
				),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		projectile.trailEntity = this.viewer.entities.add({
			polyline: {
				positions: this.buildArcSamples(projectile, 40),
				width: projectile.visual.trailWidth,
				material: new Cesium.PolylineGlowMaterialProperty({
					glowPower: projectile.visual.trailGlowPower,
					color: color(projectile.visual.color, 0.88)
				}),
				clampToGround: false
			}
		});

		projectile.trailSpriteEntity = this.viewer.entities.add({
			position: currentPosition,
			billboard: {
				image: assetUrl(projectile.visual.trailSpriteImage, 'Focus fire trail'),
				scale: projectile.visual.trailSpriteScale,
				color:
					projectile.variant === 'aircraft'
						? color(projectile.visual.color, projectile.visual.trailSpriteAlpha)
						: color('#f4d9b0', projectile.visual.trailSpriteAlpha),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		projectile.launchFlash =
			initialT <= 0.08
				? this.viewer.entities.add({
						position: cartesianFromPoint(projectile.start),
						billboard: {
							image: assetUrl(
								FOCUS_FIRE_ASSETS.textures.launchMuzzle,
								'Focus fire launch'
							),
							scale: projectile.visual.launchScale,
							color: color(projectile.visual.color, 0.86),
							disableDepthTestDistance: Number.POSITIVE_INFINITY
						}
				  })
				: null;

		this.projectiles.push(projectile);
	}

	spawnProjectileFromTrack(track) {
		const variant = track.variant ?? 'artillery';
		const visual = getProjectileVisual(variant);
		const targetGround = this.getTerrainHeight(
			track.targetLongitude,
			track.targetLatitude,
			0
		);
		const start = {
			lon: track.launcherLongitude,
			lat: track.launcherLatitude,
			alt:
				variant === 'aircraft'
					? Math.max(track.launcherAltitudeMeters, targetGround + 620)
					: this.getTerrainHeight(
							track.launcherLongitude,
							track.launcherLatitude,
							track.launcherAltitudeMeters
					  ) + (variant === 'armor' ? 8 : 16)
		};
		const end = {
			lon: track.targetLongitude,
			lat: track.targetLatitude,
			alt: targetGround + (variant === 'aircraft' ? 34 : 10)
		};
		const totalDistance = Math.max(distanceMetersBetweenPoints(start, end), 1);
		const currentDistance = distanceMetersBetweenPoints(start, {
			lon: track.longitude,
			lat: track.latitude,
			alt: track.altitudeMeters
		});
		const progress = clamp(currentDistance / totalDistance, 0, 0.94);
		const arc = this.buildProjectileArc(start, end, variant, progress);
		const blendedApexHeight =
			progress > 0.04 && progress < 0.96
				? (track.altitudeMeters -
						lerp(start.alt, end.alt, progress)) /
				  Math.max(4 * progress * (1 - progress), 0.08)
				: arc.apexHeight;

		this.createProjectileEntity({
			id: track.id,
			variant,
			visual,
			elapsed: arc.elapsed,
			duration: arc.duration,
			apexHeight: clamp(
				Number.isFinite(blendedApexHeight) ? blendedApexHeight : arc.apexHeight,
				variant === 'armor' ? 120 : 260,
				arc.apexHeight * 1.9
			),
			start,
			end
		});
	}

	spawnProjectileFromLaunchPlatform(platform, index, totalBursts) {
		const objectiveLon = this.focusState.objectiveLon;
		const objectiveLat = this.focusState.objectiveLat;
		if (!Number.isFinite(objectiveLon) || !Number.isFinite(objectiveLat)) {
			return;
		}

		const objectiveGround = this.getTerrainHeight(objectiveLon, objectiveLat, 0);
		const variant = platform?.variant ?? this.createProjectileVariant(index);
		const visual = getProjectileVisual(variant);
		const targetBearing = normalizeHeading(
			(360 / Math.max(totalBursts, 1)) * index + randomBetween(-18, 18)
		);
		const hasPlatformLocation =
			Number.isFinite(Number(platform?.longitude)) &&
			Number.isFinite(Number(platform?.latitude));
		let start;

		if (hasPlatformLocation) {
			start = {
				lon: Number(platform.longitude),
				lat: Number(platform.latitude),
				alt:
					variant === 'aircraft'
						? Math.max(Number(platform.altitudeMeters) || 0, objectiveGround + 640)
						: this.getTerrainHeight(
								Number(platform.longitude),
								Number(platform.latitude),
								Number(platform.altitudeMeters) || 0
						  ) + (variant === 'armor' ? 7 : 15)
			};
		} else {
			const fallbackRadius =
				variant === 'aircraft'
					? randomBetween(2500, 4200)
					: variant === 'armor'
						? randomBetween(1400, 2600)
						: randomBetween(4200, 7600);
			const fallbackStart = offsetCoordinates(
				objectiveLon,
				objectiveLat,
				fallbackRadius,
				targetBearing
			);
			start = {
				lon: fallbackStart.lon,
				lat: fallbackStart.lat,
				alt:
					variant === 'aircraft'
						? randomBetween(2200, 4200)
						: this.getTerrainHeight(
								fallbackStart.lon,
								fallbackStart.lat,
								0
						  ) + (variant === 'armor' ? 9 : 18)
			};
		}
		const endCoordinates = offsetCoordinates(
			objectiveLon,
			objectiveLat,
			randomBetween(16, 140),
			targetBearing
		);
		const end = {
			lon: endCoordinates.lon,
			lat: endCoordinates.lat,
			alt: objectiveGround + randomBetween(4, 16)
		};
		const arc = this.buildProjectileArc(start, end, variant, 0);

		this.createProjectileEntity({
			id: crypto.randomUUID(),
			variant,
			visual,
			elapsed: 0,
			duration: arc.duration,
			apexHeight: arc.apexHeight,
			start,
			end
		});
	}

	sampleArc(projectile, t) {
		const lon = lerp(projectile.start.lon, projectile.end.lon, t);
		const lat = lerp(projectile.start.lat, projectile.end.lat, t);
		const alt =
			lerp(projectile.start.alt, projectile.end.alt, t) +
			projectile.apexHeight * 4 * t * (1 - t);

		return {
			lon,
			lat,
			alt
		};
	}

	buildArcSamples(projectile, sampleCount = 28) {
		const positions = [];

		for (let index = 0; index <= sampleCount; index += 1) {
			const ratio = index / sampleCount;
			const point = this.sampleArc(projectile, ratio);
			positions.push(cartesianFromPoint(point));
		}

		return positions;
	}

	buildTrajectoryTrackEnvelope(track) {
		const variant = track.variant ?? 'artillery';
		const style = getTrajectoryOverlayVisual(variant);
		const launcherGround = this.getTerrainHeight(
			track.launcherLongitude,
			track.launcherLatitude,
			track.launcherAltitudeMeters
		);
		const targetGround = this.getTerrainHeight(
			track.targetLongitude,
			track.targetLatitude,
			0
		);
		const start = {
			lon: track.launcherLongitude,
			lat: track.launcherLatitude,
			alt:
				variant === 'aircraft'
					? Math.max(track.launcherAltitudeMeters, launcherGround + 1400)
					: launcherGround + (variant === 'armor' ? 12 : 24)
		};
		const end = {
			lon: track.targetLongitude,
			lat: track.targetLatitude,
			alt: targetGround + (variant === 'aircraft' ? 70 : 18)
		};
		const distanceMeters = Math.max(distanceMetersBetweenPoints(start, end), 1);
		const currentDistance = distanceMetersBetweenPoints(start, {
			lon: track.longitude,
			lat: track.latitude,
			alt: track.altitudeMeters
		});

		return {
			variant,
			style,
			start,
			end,
			distanceMeters,
			currentProgress: clamp(currentDistance / distanceMeters, 0, 1),
			apexHeight: clamp(
				distanceMeters * style.apexMultiplier,
				style.minApexHeight,
				style.maxApexHeight
			)
		};
	}

	buildTrajectoryArcSamples(envelope, sampleCount = 56, maxRatio = 1) {
		const safeRatio = clamp(maxRatio, 0, 1);
		const resolvedSampleCount = Math.max(
			4,
			Math.ceil(sampleCount * Math.max(safeRatio, 0.12))
		);
		const positions = [];

		for (let index = 0; index <= resolvedSampleCount; index += 1) {
			const ratio = safeRatio * (index / resolvedSampleCount);
			const point = this.sampleArc(envelope, ratio);
			positions.push(cartesianFromPoint(point));
		}

		return positions;
	}

	buildTrajectoryBeamPositions(lon, lat, groundAltitude, beamRise) {
		return [
			Cesium.Cartesian3.fromDegrees(lon, lat, groundAltitude + 12),
			Cesium.Cartesian3.fromDegrees(lon, lat, groundAltitude + beamRise)
		];
	}

	syncTrajectoryOverlays(state = this.focusState) {
		const visibleTracks = this.getDisplayedWeaponTracks(state);
		const activeTrackIds = new Set(visibleTracks.map((track) => track.id));

		for (const [trackId, overlay] of this.trajectoryOverlays.entries()) {
			if (activeTrackIds.has(trackId)) {
				continue;
			}
			this.removeTrajectoryOverlay(overlay);
			this.trajectoryOverlays.delete(trackId);
		}

		visibleTracks.forEach((track) => {
			const envelope = this.buildTrajectoryTrackEnvelope(track);
			const beamRise = clamp(
				envelope.apexHeight * 0.42,
				4200,
				envelope.style.maxBeamHeight
			);
			const fullArcPositions = this.buildTrajectoryArcSamples(envelope, 64, 1);
			const progressArcPositions = this.buildTrajectoryArcSamples(
				envelope,
				28,
				Math.max(envelope.currentProgress, 0.04)
			);
			const startBeamPositions = this.buildTrajectoryBeamPositions(
				envelope.start.lon,
				envelope.start.lat,
				envelope.start.alt,
				beamRise
			);
			const endBeamPositions = this.buildTrajectoryBeamPositions(
				envelope.end.lon,
				envelope.end.lat,
				envelope.end.alt,
				beamRise
			);
			const distanceLabel = `${track.launcherName} · ${formatTrackDistance(
				envelope.distanceMeters
			)}`;
			let overlay = this.trajectoryOverlays.get(track.id);

			if (!overlay) {
				overlay = {
					arcEntity: this.viewer.entities.add({
						name: distanceLabel,
						polyline: {
							positions: fullArcPositions,
							width: envelope.style.width,
							material: new Cesium.PolylineGlowMaterialProperty({
								glowPower: envelope.style.glowPower,
								color: color(
									envelope.style.arcColor,
									envelope.style.arcAlpha
								)
							}),
							clampToGround: false
						}
					}),
					progressEntity: this.viewer.entities.add({
						polyline: {
							positions: progressArcPositions,
							width: envelope.style.progressWidth,
							material: new Cesium.PolylineGlowMaterialProperty({
								glowPower: envelope.style.progressGlowPower,
								color: color(
									envelope.style.progressColor,
									envelope.style.progressAlpha
								)
							}),
							clampToGround: false
						}
					}),
					startBeamEntity: this.viewer.entities.add({
						polyline: {
							positions: startBeamPositions,
							width: 1.4,
							material: new Cesium.PolylineGlowMaterialProperty({
								glowPower: 0.16,
								color: color(
									envelope.style.beamColor,
									envelope.style.beamAlpha
								)
							}),
							clampToGround: false
						}
					}),
					endBeamEntity: this.viewer.entities.add({
						polyline: {
							positions: endBeamPositions,
							width: 1.6,
							material: new Cesium.PolylineGlowMaterialProperty({
								glowPower: 0.18,
								color: color('#ffffff', envelope.style.beamAlpha + 0.08)
							}),
							clampToGround: false
						}
					})
				};
				this.trajectoryOverlays.set(track.id, overlay);
			}

			overlay.arcEntity.name = distanceLabel;
			overlay.arcEntity.polyline.positions = fullArcPositions;
			overlay.arcEntity.polyline.width = envelope.style.width;
			overlay.arcEntity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
				glowPower: envelope.style.glowPower,
				color: color(envelope.style.arcColor, envelope.style.arcAlpha)
			});

			overlay.progressEntity.polyline.positions = progressArcPositions;
			overlay.progressEntity.polyline.width = envelope.style.progressWidth;
			overlay.progressEntity.polyline.material =
				new Cesium.PolylineGlowMaterialProperty({
					glowPower: envelope.style.progressGlowPower,
					color: color(
						envelope.style.progressColor,
						envelope.style.progressAlpha
					)
				});

			overlay.startBeamEntity.polyline.positions = startBeamPositions;
			overlay.startBeamEntity.polyline.material =
				new Cesium.PolylineGlowMaterialProperty({
					glowPower: 0.16,
					color: color(envelope.style.beamColor, envelope.style.beamAlpha)
				});

			overlay.endBeamEntity.polyline.positions = endBeamPositions;
			overlay.endBeamEntity.polyline.material =
				new Cesium.PolylineGlowMaterialProperty({
					glowPower: 0.18,
					color: color('#ffffff', envelope.style.beamAlpha + 0.08)
				});
		});
	}

	syncWeaponTrackProjectiles(previousState, nextState) {
		const visibleTracks = this.getDisplayedWeaponTracks(nextState);
		const activeTrackIds = new Set(visibleTracks.map((track) => track.id));
		for (const renderedTrackId of [...this.renderedTrackIds]) {
			if (!activeTrackIds.has(renderedTrackId)) {
				this.renderedTrackIds.delete(renderedTrackId);
			}
		}

		let spawnedFromTracks = 0;
		visibleTracks.forEach((track) => {
			if (this.renderedTrackIds.has(track.id)) {
				return;
			}

			this.spawnProjectileFromTrack(track);
			this.renderedTrackIds.add(track.id);
			spawnedFromTracks += 1;
		});

		const burstIncrease = Math.max(
			0,
			nextState.weaponsInFlight - previousState.weaponsInFlight
		);
		const activeLaunchPlatforms = this.getActiveLaunchPlatforms(
			nextState.launchPlatforms
		);
		if (activeLaunchPlatforms.length === 0) {
			return;
		}

		const newlyLaunchedPlatforms = this.getNewlyLaunchedPlatforms(
			previousState.launchPlatforms,
			activeLaunchPlatforms
		);
		if (burstIncrease <= 0 && newlyLaunchedPlatforms.length === 0) {
			return;
		}

		const volleyPlatforms = this.getLaunchPlatformVolleyPattern(
			newlyLaunchedPlatforms.length > 0
				? newlyLaunchedPlatforms
				: activeLaunchPlatforms
		);
		const supplementalBursts = Math.max(
			Math.max(0, burstIncrease - spawnedFromTracks),
			Math.min(volleyPlatforms.length, 12)
		);

		for (let index = 0; index < supplementalBursts; index += 1) {
			const launchPlatform =
				volleyPlatforms[index % Math.max(volleyPlatforms.length, 1)] ?? null;
			this.spawnProjectileFromLaunchPlatform(
				launchPlatform,
				index,
				supplementalBursts
			);
		}
	}

	createImpact(projectile) {
		const impactColor =
			projectile.variant === 'aircraft'
				? '#7fe7ff'
				: projectile.variant === 'armor'
					? '#ffd166'
					: '#ff8c42';
		const position = cartesianFromPoint(projectile.end);
		const altitudeOffset = projectile.variant === 'aircraft' ? 55 : 32;

		const ringEntity = this.viewer.entities.add({
			position,
			ellipse: {
				semiMajorAxis: 40,
				semiMinorAxis: 40,
				material: color(impactColor, 0.22),
				outline: true,
				outlineColor: color(impactColor, 0.92),
				outlineWidth: 2,
				height: 0
			}
		});

		const flashEntity = this.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(
				projectile.end.lon,
				projectile.end.lat,
				projectile.end.alt + altitudeOffset
			),
			billboard: {
				image: assetUrl(FOCUS_FIRE_ASSETS.textures.impactFlash, 'Focus fire impact'),
				scale: projectile.visual.impactFlashScale,
				color: color('#fff5d6', 0.92),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		const fireballEntity = this.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(
				projectile.end.lon,
				projectile.end.lat,
				projectile.end.alt + altitudeOffset * 0.9
			),
			billboard: {
				image: assetUrl(
					FOCUS_FIRE_ASSETS.textures.impactExplosion,
					'Focus fire explosion'
				),
				scale: projectile.visual.impactScale,
				color: color(impactColor, 0.9),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		const smokeEntity = this.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(
				projectile.end.lon,
				projectile.end.lat,
				projectile.end.alt + altitudeOffset * 1.1
			),
			billboard: {
				image: assetUrl(FOCUS_FIRE_ASSETS.textures.impactSmoke, 'Focus fire smoke'),
				scale: projectile.visual.smokeScale,
				color: color('#2d221b', 0.62),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		const dustEntity = this.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(
				projectile.end.lon,
				projectile.end.lat,
				projectile.end.alt + 8
			),
			billboard: {
				image: assetUrl(FOCUS_FIRE_ASSETS.textures.impactDust, 'Focus fire dust'),
				scale: projectile.visual.dustScale,
				color: color('#cca16b', 0.52),
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		this.impacts.push({
			elapsed: 0,
			lifetime: projectile.visual.impactLifetime,
			radius: projectile.visual.impactRadius,
			flashScale: projectile.visual.impactFlashScale,
			fireballScale: projectile.visual.impactScale,
			smokeScale: projectile.visual.smokeScale,
			dustScale: projectile.visual.dustScale,
			ringEntity,
			flashEntity,
			fireballEntity,
			smokeEntity,
			dustEntity,
			color: impactColor
		});
	}

	triggerBarrage(options = {}) {
		if (!this.hasObjective()) {
			return false;
		}

		const totalBursts = clamp(
			Math.floor(
				options.bursts ??
					Math.max(
						3,
						this.focusState.artilleryCount +
							Math.ceil(this.focusState.aircraftCount / 2) +
							Math.ceil(this.focusState.armorCount / 2)
					)
			),
			1,
			10
		);
		const launchPlatforms =
			Array.isArray(options.launchPlatforms) && options.launchPlatforms.length > 0
				? options.launchPlatforms
				: this.getDisplayedLaunchPlatforms();
		const weaponTracks =
			Array.isArray(options.weaponTracks) && options.weaponTracks.length > 0
				? this.getDisplayedWeaponTracks({
						...this.focusState,
						weaponTracks: options.weaponTracks
				  })
				: this.getDisplayedWeaponTracks();

		let spawnedFromTracks = 0;
		if (weaponTracks.length > 0) {
			weaponTracks.forEach((track) => {
				if (this.renderedTrackIds.has(track.id)) {
					return;
				}
				this.spawnProjectileFromTrack(track);
				this.renderedTrackIds.add(track.id);
				spawnedFromTracks += 1;
			});
		}

		const supplementalPlatforms =
			this.getLaunchPlatformVolleyPattern(launchPlatforms);
		const supplementalBursts =
			supplementalPlatforms.length > 0
				? Math.max(
						Math.min(supplementalPlatforms.length, 12),
						Math.max(0, totalBursts - spawnedFromTracks)
				  )
				: 0;

		for (let index = 0; index < supplementalBursts; index += 1) {
			const launchPlatform =
				supplementalPlatforms[
					index % Math.max(supplementalPlatforms.length, 1)
				] ?? null;
			this.spawnProjectileFromLaunchPlatform(
				launchPlatform,
				index,
				supplementalBursts
			);
		}
		return weaponTracks.length > 0 || supplementalBursts > 0;
	}

	updateProjectiles(dt) {
		for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
			const projectile = this.projectiles[index];
			projectile.elapsed += dt;
			const t = clamp(projectile.elapsed / projectile.duration, 0, 1);
			const point = this.sampleArc(projectile, t);
			const position = cartesianFromPoint(point);
			const futurePoint = this.sampleArc(projectile, Math.min(t + 0.04, 1));
			const futurePosition = cartesianFromPoint(futurePoint);

			projectile.headEntity.position = position;
			projectile.headEntity.orientation = resolveOrientation(
				position,
				futurePosition,
				projectile.visual.orientationOffsets
			);
			projectile.headCoreEntity.position = position;
			projectile.headCoreEntity.point.pixelSize = lerp(
				projectile.visual.headCoreSize ?? 8,
				Math.max((projectile.visual.headCoreSize ?? 8) * 0.72, 5),
				t
			);
			projectile.headCoreEntity.point.color = color(
				'#ffffff',
				clamp(0.98 - t * 0.26, 0.62, 0.98)
			);
			projectile.headCoreEntity.point.outlineColor = color(
				projectile.visual.color,
				clamp(0.95 - t * 0.22, 0.52, 0.95)
			);
			projectile.headGlowEntity.position = position;
			projectile.headGlowEntity.billboard.scale = lerp(
				projectile.visual.headGlowScale,
				projectile.visual.headGlowScale * 0.72,
				t
			);
			projectile.headGlowEntity.billboard.color = color(
				projectile.visual.color,
				clamp(
					(projectile.visual.headGlowAlpha ?? 0.78) - t * 0.32,
					0.3,
					projectile.visual.headGlowAlpha ?? 0.78
				)
			);

			const trailPoint = this.sampleArc(
				projectile,
				clamp(t - projectile.visual.trailLag, 0, 1)
			);
			projectile.trailSpriteEntity.position = cartesianFromPoint(trailPoint);
			projectile.trailSpriteEntity.billboard.scale = lerp(
				projectile.visual.trailSpriteScale,
				projectile.visual.trailSpriteScale * 0.65,
				t
			);
			projectile.trailSpriteEntity.billboard.color =
				projectile.variant === 'aircraft'
					? color(
							projectile.visual.color,
							clamp(projectile.visual.trailSpriteAlpha * (1 - t * 0.4), 0.18, 0.75)
						)
					: color(
							'#f4d9b0',
							clamp(projectile.visual.trailSpriteAlpha * (1 - t * 0.55), 0.12, 0.6)
						);

			if (projectile.launchFlash) {
				const alpha = clamp(0.86 - t * 4, 0, 0.86);
				projectile.launchFlash.billboard.scale = lerp(
					projectile.visual.launchScale,
					projectile.visual.launchScale * 1.8,
					clamp(t * 4, 0, 1)
				);
				projectile.launchFlash.billboard.color = color(
					projectile.visual.color,
					alpha
				);
				if (alpha <= 0.02) {
					this.viewer.entities.remove(projectile.launchFlash);
					projectile.launchFlash = null;
				}
			}

			if (t < 1) {
				continue;
			}

			this.viewer.entities.remove(projectile.headEntity);
			this.viewer.entities.remove(projectile.headCoreEntity);
			this.viewer.entities.remove(projectile.headGlowEntity);
			this.viewer.entities.remove(projectile.trailEntity);
			this.viewer.entities.remove(projectile.trailSpriteEntity);
			if (projectile.launchFlash) {
				this.viewer.entities.remove(projectile.launchFlash);
			}
			this.projectiles.splice(index, 1);
			this.createImpact(projectile);
		}
	}

	updateImpacts(dt) {
		for (let index = this.impacts.length - 1; index >= 0; index -= 1) {
			const impact = this.impacts[index];
			impact.elapsed += dt;
			const progress = clamp(impact.elapsed / impact.lifetime, 0, 1);
			const radius = lerp(40, impact.radius, progress);
			const alpha = clamp(0.25 * (1 - progress), 0, 0.25);
			const outlineAlpha = clamp(0.95 * (1 - progress * 0.7), 0, 0.95);

			impact.ringEntity.ellipse.semiMajorAxis = radius;
			impact.ringEntity.ellipse.semiMinorAxis = radius;
			impact.ringEntity.ellipse.material = color(impact.color, alpha);
			impact.ringEntity.ellipse.outlineColor = color(impact.color, outlineAlpha);

			impact.flashEntity.billboard.scale = lerp(
				impact.flashScale,
				impact.flashScale * 2.4,
				progress
			);
			impact.flashEntity.billboard.color = color(
				'#fff5d6',
				clamp(0.95 * (1 - progress * 1.05), 0, 0.95)
			);

			impact.fireballEntity.billboard.scale = lerp(
				impact.fireballScale,
				impact.fireballScale * 2.05,
				progress
			);
			impact.fireballEntity.billboard.color = color(
				impact.color,
				clamp(0.9 * (1 - progress * 0.9), 0, 0.9)
			);

			impact.smokeEntity.billboard.scale = lerp(
				impact.smokeScale,
				impact.smokeScale * 2.2,
				progress
			);
			impact.smokeEntity.billboard.color = color(
				'#2d221b',
				clamp(0.62 * (1 - progress * 0.55), 0, 0.62)
			);

			impact.dustEntity.billboard.scale = lerp(
				impact.dustScale,
				impact.dustScale * 2.1,
				progress
			);
			impact.dustEntity.billboard.color = color(
				'#cca16b',
				clamp(0.52 * (1 - progress), 0, 0.52)
			);

			if (impact.elapsed < impact.lifetime) {
				continue;
			}

			this.viewer.entities.remove(impact.ringEntity);
			this.viewer.entities.remove(impact.flashEntity);
			this.viewer.entities.remove(impact.fireballEntity);
			this.viewer.entities.remove(impact.smokeEntity);
			this.viewer.entities.remove(impact.dustEntity);
			this.impacts.splice(index, 1);
		}
	}

	update(dt) {
		if (!this.hasObjective()) {
			return;
		}

		this.ensureObjectiveEntities();
		this.updateProjectiles(dt);
		this.updateImpacts(dt);
	}
}
