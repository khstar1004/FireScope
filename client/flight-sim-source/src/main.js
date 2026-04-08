import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { initCesium, setCameraToPlane, getViewer, setControlsEnabled, setRenderOptimization, updateKoreaMapMode } from './world/cesiumWorld';
import { PlanePhysics } from './plane/planePhysics';
import { PlaneController } from './plane/planeController';
import { DronePhysics } from './plane/dronePhysics';
import { getCraftProfile, JET_CRAFT_OPTIONS } from './plane/craftProfiles';
import { movePosition, movePositionByVector } from './utils/math';
import { calculateDistance, reverseGeocode } from './world/regions';
import { HUD } from './ui/hud';
import { JetFlame } from './plane/jetFlame';
import { WeaponSystem } from './systems/weaponSystem';
import { FocusFireSystem } from './systems/focusFireSystem';
import { soundManager } from './utils/soundManager';
import { NPCSystem } from './systems/npcSystem';
import { DialogueSystem } from './systems/dialogueSystem';
import * as Cesium from 'cesium';
import { particles } from './utils/particles';
import { resolveAssetUrl as assetUrl } from './utils/assetPaths';
const runtimeConfig = window.__FLIGHT_SIM_CONFIG__ ?? {};
const urlParams = new URLSearchParams(window.location.search);
const FLIGHT_SIM_SETTINGS_STORAGE_KEY = 'flightSimSettings';
const DEFAULT_JET_CRAFT_ID = getCraftProfile('jet')?.id ?? 'f15';
const DEFAULT_GAME_SETTINGS = {
	graphicsQuality: 'medium',
	antialiasing: true,
	fogEffects: true,
	mouseSensitivity: 0.2,
	showHud: true,
	showHorizonLines: false,
	soundEnabled: true,
	minimapRange: 10,
	selectedJetCraftId: DEFAULT_JET_CRAFT_ID
};

function readPersistedSettings() {
	try {
		const saved = localStorage.getItem(FLIGHT_SIM_SETTINGS_STORAGE_KEY);
		if (!saved) {
			return { ...DEFAULT_GAME_SETTINGS };
		}

		const parsed = JSON.parse(saved);
		return { ...DEFAULT_GAME_SETTINGS, ...parsed };
	} catch (error) {
		console.error('Failed to load settings', error);
		return { ...DEFAULT_GAME_SETTINGS };
	}
}

function resolveRequestedCraftId(craftId, selectedJetCraftId) {
	if (craftId === 'jet') {
		return getCraftProfile(selectedJetCraftId)?.id ?? DEFAULT_JET_CRAFT_ID;
	}

	return getCraftProfile(craftId)?.id ?? DEFAULT_JET_CRAFT_ID;
}

const requestedLon = Number(urlParams.get('lon') ?? runtimeConfig.initialPosition?.lon);
const requestedLat = Number(urlParams.get('lat') ?? runtimeConfig.initialPosition?.lat);
const requestedAlt = Number(urlParams.get('alt') ?? runtimeConfig.initialPosition?.alt);
const requestedCraft = urlParams.get('craft') ?? runtimeConfig.craft ?? 'jet';
let gameSettings = readPersistedSettings();
const hasVWorldRuntimeConfig = Boolean((runtimeConfig.vworldApiKey ?? '').trim());
const hasMapTilerRuntimeConfig = Boolean((runtimeConfig.mapTilerApiKey ?? '').trim());
const DEFAULT_KOREA_START = {
	lon: 126.978,
	lat: 37.5665
};
const isInsideKorea = (lon, lat) =>
	lon >= 124.5 && lon <= 132.5 && lat >= 33.0 && lat <= 39.5;
const resolveFlightSimStartPosition = (lon, lat) =>
	Number.isFinite(lon) && Number.isFinite(lat) && isInsideKorea(lon, lat)
		? { lon, lat }
		: { ...DEFAULT_KOREA_START };
const requestedStartPosition = resolveFlightSimStartPosition(requestedLon, requestedLat);
let activeCraft = normalizeCraftProfile(
	getCraftProfile(resolveRequestedCraftId(requestedCraft, gameSettings.selectedJetCraftId))
);

const States = {
	MENU: 'MENU',
	PICK_SPAWN: 'PICK_SPAWN',
	TRANSITIONING: 'TRANSITIONING',
	FLYING: 'FLYING',
	PAUSED: 'PAUSED',
	CRASHED: 'CRASHED'
};

const CAMERA_MODES = {
	CHASE: 'CHASE',
	MISSILE: 'MISSILE',
	CINEMATIC: 'CINEMATIC'
};
const CAMERA_MODE_SEQUENCE = [
	CAMERA_MODES.CHASE,
	CAMERA_MODES.MISSILE,
	CAMERA_MODES.CINEMATIC
];
const CAMERA_MODE_LABELS = {
	[CAMERA_MODES.CHASE]: '추적',
	[CAMERA_MODES.MISSILE]: '미사일 캠',
	[CAMERA_MODES.CINEMATIC]: '시네마틱'
};

let currentState = States.MENU;

function normalizeCraftProfile(craftProfile) {
	const fallbackCraft = getCraftProfile('jet');
	const sourceCraft = craftProfile ?? fallbackCraft;
	const modelCandidates = Array.isArray(sourceCraft.modelCandidates)
		? sourceCraft.modelCandidates.filter(
			(candidate) => typeof candidate === 'string' && candidate.length > 0
		)
		: [];

	return {
		...fallbackCraft,
		...sourceCraft,
		modelCandidates:
			modelCandidates.length > 0
				? modelCandidates
				: fallbackCraft.modelCandidates.filter(
					(candidate) => typeof candidate === 'string' && candidate.length > 0
				),
		iconPath:
			typeof sourceCraft.iconPath === 'string' && sourceCraft.iconPath.length > 0
				? sourceCraft.iconPath
				: null,
		visual: {
			...fallbackCraft.visual,
			...(sourceCraft.visual ?? {}),
			basePosition: {
				...fallbackCraft.visual.basePosition,
				...(sourceCraft.visual?.basePosition ?? {})
			},
			baseRotation: {
				...fallbackCraft.visual.baseRotation,
				...(sourceCraft.visual?.baseRotation ?? {})
			}
		},
		animation: {
			...fallbackCraft.animation,
			...(sourceCraft.animation ?? {})
		}
	};
}

function loadSettings() {
	gameSettings = readPersistedSettings();
	applySettings();
	updateSettingsUI();
}

function saveSettings() {
	localStorage.setItem(
		FLIGHT_SIM_SETTINGS_STORAGE_KEY,
		JSON.stringify(gameSettings)
	);
}

function populateJetCraftOptions() {
	const jetCraftSelect = document.getElementById('jetCraftSelect');

	if (!jetCraftSelect || jetCraftSelect.dataset.initialized === 'true') {
		return;
	}

	jetCraftSelect.innerHTML = '';
	JET_CRAFT_OPTIONS.forEach((option) => {
		const element = document.createElement('option');
		element.value = option.id;
		element.textContent = option.label;
		jetCraftSelect.appendChild(element);
	});
	jetCraftSelect.dataset.initialized = 'true';
}

function updateJetCraftSettingVisibility() {
	const jetCraftHeading = document.getElementById('jetCraftSettingsHeading');
	const jetCraftRow = document.getElementById('jetCraftSettingRow');
	const showJetCraftSettings = activeCraft.mode === 'jet';

	if (jetCraftHeading) {
		jetCraftHeading.style.display = showJetCraftSettings ? '' : 'none';
	}

	if (jetCraftRow) {
		jetCraftRow.style.display = showJetCraftSettings ? 'grid' : 'none';
	}
}

function updateSettingsUI() {
	populateJetCraftOptions();
	updateJetCraftSettingVisibility();

	document.getElementById('graphicsQuality').value = gameSettings.graphicsQuality;
	document.getElementById('antialiasing').checked = gameSettings.antialiasing;
	document.getElementById('fogEffects').checked = gameSettings.fogEffects;
	document.getElementById('sensitivitySlider').value = gameSettings.mouseSensitivity;
	document.getElementById('sensitivityValue').textContent = gameSettings.mouseSensitivity;
	document.getElementById('showHud').checked = gameSettings.showHud;
	document.getElementById('showHorizonLines').checked = gameSettings.showHorizonLines;
	document.getElementById('soundEnabled').checked = gameSettings.soundEnabled;
	document.getElementById('minimapRange').value = gameSettings.minimapRange.toString();

	const jetCraftSelect = document.getElementById('jetCraftSelect');
	if (jetCraftSelect) {
		jetCraftSelect.value =
			activeCraft.mode === 'jet'
				? activeCraft.id
				: gameSettings.selectedJetCraftId;
	}
}

function applySettings() {


	if (controller) {
		controller.setSensitivity(gameSettings.mouseSensitivity);
	}

	if (hud) {
		hud.setMinimapRange(gameSettings.minimapRange);
		hud.setShowHorizonLines(gameSettings.showHorizonLines);
	}

	if (soundManager && soundManager.listener) {
		soundManager.listener.setMasterVolume(gameSettings.soundEnabled ? 1.0 : 0.0);
	}

	const viewer = getViewer();
	if (viewer) {
		if (gameSettings.graphicsQuality === 'low') {
			viewer.resolutionScale = 0.5;
			viewer.scene.globe.maximumScreenSpaceError = 4;
		} else if (gameSettings.graphicsQuality === 'medium') {
			viewer.resolutionScale = 0.75;
			viewer.scene.globe.maximumScreenSpaceError = 2;
		} else {
			viewer.resolutionScale = 1.0;
			viewer.scene.globe.maximumScreenSpaceError = 1.3;
		}

		if (viewer.scene.postProcessStages?.fxaa) {
			viewer.scene.postProcessStages.fxaa.enabled = gameSettings.antialiasing;
		}

		if (viewer.scene.fog) {
			viewer.scene.fog.enabled = gameSettings.fogEffects;
		}

		const atmosphere = viewer.scene.skyAtmosphere ?? viewer.scene.atmosphere;
		if (atmosphere && 'show' in atmosphere) {
			atmosphere.show = gameSettings.fogEffects;
		}
	}

	const hudElements = [
		document.getElementById('hud-top-left'),
		document.getElementById('hud-top-right'),
		document.getElementById('hud-speed-box'),
		document.getElementById('hud-alt-box'),
		document.getElementById('coords'),
		document.getElementById('minimap-container')
	];

	hudElements.forEach(el => {
		if (el) {
			el.style.display = gameSettings.showHud ? 'block' : 'none';
		}
	});
}

let state = {
	lon: requestedStartPosition.lon,
	lat: requestedStartPosition.lat,
	alt: Number.isFinite(requestedAlt) ? requestedAlt : activeCraft.initialAltitude,
	heading: 0,
	pitch: 0,
	roll: 0,
	speed: activeCraft.initialSpeed,
	throttle: 0,
	score: 0,
	weaponSystem: null,
	cameraModeLabel: CAMERA_MODE_LABELS[CAMERA_MODES.CHASE],
	renderPlayerOverlay: true
};

async function initUserLocation() {
	if (hasVWorldRuntimeConfig || hasMapTilerRuntimeConfig) {
		return;
	}
}

initUserLocation();

let currentRegionName = null;
let lastGeocodeTime = 0;
let lastGeocodePos = { lon: 0, lat: 0 };
const GEOCODE_INTERVAL = 10000;
const GEOCODE_MIN_DIST = 1000;

let lastGPWSWarningTime = 0;
const GPWS_COOLDOWN = 1800;
let gpwsActive = false;
let pauseStartTime = 0;

let scene, camera, renderer;
let planeModel;
let jetFlames = [];
let mixer, clock;
let physics = createPhysicsForCraft(activeCraft);
let controller = new PlaneController(activeCraft.mode);
let hud = new HUD();
let npcSystem;
let weaponSystem;
let focusFireSystem;
let dialogueSystem = new DialogueSystem(activeCraft);

let fps = 0;
let frameCount = 0;
let lastFpsUpdate = 0;

let basePlanePos = createBasePlanePos(activeCraft);
let visualOffset = new THREE.Vector3().copy(basePlanePos);
let visualRotation = new THREE.Euler(0, 0, 0);
let boostRoll = 0;
let currentBoostZOffset = 0;
let boostRollDirection = 1;
let lastIsBoosting = false;
let initialCameraView = null;
let lastThrottleLevel = 0;
let cameraDirector = {
	mode: CAMERA_MODES.CHASE,
	killCam: null
};

function createBasePlanePos(craftProfile) {
	const { x, y, z } = craftProfile.visual.basePosition;
	return new THREE.Vector3(x, y, z);
}

function createPhysicsForCraft(craftProfile) {
	return craftProfile.mode === 'drone'
		? new DronePhysics()
		: new PlanePhysics(craftProfile.physics);
}

function cycleCameraMode() {
	const currentIndex = CAMERA_MODE_SEQUENCE.indexOf(cameraDirector.mode);
	cameraDirector.mode =
		CAMERA_MODE_SEQUENCE[(currentIndex + 1) % CAMERA_MODE_SEQUENCE.length];

	if (cameraDirector.mode === CAMERA_MODES.CHASE) {
		cameraDirector.killCam = null;
	}
}

function calculateHeadingPitchBetween(from, to) {
	const avgLatRad = Cesium.Math.toRadians((from.lat + to.lat) * 0.5);
	const east =
		(to.lon - from.lon) * 111320 * Math.max(Math.cos(avgLatRad), 0.01);
	const north = (to.lat - from.lat) * 111320;
	const up = (to.alt ?? 0) - (from.alt ?? 0);
	const horizontalDistance = Math.sqrt(east * east + north * north) || 0.0001;

	return {
		heading: Cesium.Math.toDegrees(Math.atan2(east, north)),
		pitch: Cesium.Math.toDegrees(Math.atan2(up, horizontalDistance)),
		roll: 0
	};
}

function applyChaseCamera(input) {
	const planeHPR = new Cesium.HeadingPitchRoll(
		Cesium.Math.toRadians(state.heading),
		Cesium.Math.toRadians(state.pitch),
		Cesium.Math.toRadians(state.roll)
	);
	const planeQuat = Cesium.Quaternion.fromHeadingPitchRoll(planeHPR);

	const orbitHPR = new Cesium.HeadingPitchRoll(
		Cesium.Math.toRadians(input.cameraYaw),
		Cesium.Math.toRadians(-input.cameraPitch),
		0
	);
	const orbitQuat = Cesium.Quaternion.fromHeadingPitchRoll(orbitHPR);

	const finalQuat = Cesium.Quaternion.multiply(
		planeQuat,
		orbitQuat,
		new Cesium.Quaternion()
	);
	const finalHPR = Cesium.HeadingPitchRoll.fromQuaternion(finalQuat);

	setCameraToPlane(
		state.lon,
		state.lat,
		state.alt,
		Cesium.Math.toDegrees(finalHPR.heading),
		Cesium.Math.toDegrees(finalHPR.pitch),
		Cesium.Math.toDegrees(finalHPR.roll)
	);

	return {
		label: CAMERA_MODE_LABELS[CAMERA_MODES.CHASE],
		renderPlayerOverlay: true
	};
}

function applyMissileCameraView(missile, label = CAMERA_MODE_LABELS[CAMERA_MODES.MISSILE]) {
	const cameraPos = movePositionByVector(
		missile.lon,
		missile.lat,
		missile.alt,
		missile.heading,
		-22,
		2.8,
		5.5
	);
	const lookTarget = movePosition(
		missile.lon,
		missile.lat,
		missile.alt,
		missile.heading,
		missile.pitch,
		220
	);
	const orientation = calculateHeadingPitchBetween(cameraPos, lookTarget);

	setCameraToPlane(
		cameraPos.lon,
		cameraPos.lat,
		cameraPos.alt,
		orientation.heading,
		orientation.pitch,
		0
	);

	return {
		label,
		renderPlayerOverlay: false
	};
}

function applyKillCameraView(killCam) {
	const progress = 1 - killCam.timeRemaining / killCam.duration;
	const orbitHeading =
		killCam.baseHeading + 28 + progress * 70 * killCam.orbitDirection;
	const cameraPos = movePositionByVector(
		killCam.lon,
		killCam.lat,
		killCam.alt,
		orbitHeading,
		-58 + progress * 14,
		0,
		22 + Math.sin(progress * Math.PI) * 10
	);
	const lookTarget = {
		lon: killCam.lon,
		lat: killCam.lat,
		alt: killCam.alt + 8
	};
	const orientation = calculateHeadingPitchBetween(cameraPos, lookTarget);

	setCameraToPlane(
		cameraPos.lon,
		cameraPos.lat,
		cameraPos.alt,
		orientation.heading,
		orientation.pitch,
		0
	);

	return {
		label: '킬캠',
		renderPlayerOverlay: false
	};
}

function updateCombatCamera(dt, input) {
	if (cameraDirector.killCam) {
		cameraDirector.killCam.timeRemaining = Math.max(
			0,
			cameraDirector.killCam.timeRemaining - dt
		);
		if (cameraDirector.killCam.timeRemaining <= 0) {
			cameraDirector.killCam = null;
		}
	}

	if (
		cameraDirector.mode === CAMERA_MODES.CINEMATIC &&
		cameraDirector.killCam
	) {
		return applyKillCameraView(cameraDirector.killCam);
	}

	const trackedMissile = weaponSystem?.getLatestActiveMissile?.() ?? null;

	if (cameraDirector.mode === CAMERA_MODES.MISSILE) {
		if (trackedMissile) {
			return applyMissileCameraView(trackedMissile);
		}

		const chaseView = applyChaseCamera(input);
		return {
			...chaseView,
			label: '미사일 대기'
		};
	}

	if (cameraDirector.mode === CAMERA_MODES.CINEMATIC) {
		if (trackedMissile) {
			return applyMissileCameraView(trackedMissile, '시네마틱 추적');
		}

		const chaseView = applyChaseCamera(input);
		return {
			...chaseView,
			label: CAMERA_MODE_LABELS[CAMERA_MODES.CINEMATIC]
		};
	}

	return applyChaseCamera(input);
}

function updateCraftHud() {
	const aircraftLabel = document.getElementById('aircraft-label');
	const aircraftIconImage = document.querySelector('#aircraft-icon img');
	const weaponsHud = document.getElementById('weapons-hud');

	if (aircraftLabel) {
		aircraftLabel.textContent = activeCraft.hudLabel;
		aircraftLabel.style.marginTop = activeCraft.iconPath ? '' : '0';
	}

	if (aircraftIconImage) {
		if (activeCraft.iconPath) {
			aircraftIconImage.src = assetUrl(activeCraft.iconPath);
			aircraftIconImage.alt = `${activeCraft.label} 아이콘`;
			aircraftIconImage.style.display = '';
		} else {
			aircraftIconImage.style.display = 'none';
		}
	}

	if (weaponsHud) {
		weaponsHud.dataset.craft = activeCraft.id;
	}
}

function hasFocusFireObjective(payload) {
	return (
		Number.isFinite(Number(payload?.objectiveLon)) &&
		Number.isFinite(Number(payload?.objectiveLat))
	);
}

function normalizeFocusFireVariant(variant) {
	switch (variant) {
		case 'aircraft':
		case 'armor':
		case 'artillery':
			return variant;
		default:
			return 'artillery';
	}
}

function normalizeFocusFireLaunchPlatforms(launchPlatforms) {
	if (!Array.isArray(launchPlatforms)) {
		return [];
	}

	return launchPlatforms
		.map((platform) => {
			const latitude = Number(platform?.latitude);
			const longitude = Number(platform?.longitude);
			if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
				return null;
			}

			return {
				id:
					typeof platform?.id === 'string' && platform.id.length > 0
						? platform.id
						: crypto.randomUUID(),
				name:
					typeof platform?.name === 'string' && platform.name.trim().length > 0
						? platform.name.trim()
						: '집중포격 발사대',
				className:
					typeof platform?.className === 'string' && platform.className.trim().length > 0
						? platform.className.trim()
						: 'Launcher',
				latitude,
				longitude,
				altitudeMeters: Math.max(0, Number(platform?.altitudeMeters) || 0),
				variant: normalizeFocusFireVariant(platform?.variant),
				launched: platform?.launched === true
			};
		})
		.filter((platform) => platform !== null);
}

function normalizeFocusFireWeaponTracks(weaponTracks) {
	if (!Array.isArray(weaponTracks)) {
		return [];
	}

	return weaponTracks
		.map((track) => {
			const latitude = Number(track?.latitude);
			const longitude = Number(track?.longitude);
			const launcherLatitude = Number(track?.launcherLatitude);
			const launcherLongitude = Number(track?.launcherLongitude);
			const targetLatitude = Number(track?.targetLatitude);
			const targetLongitude = Number(track?.targetLongitude);
			if (
				!Number.isFinite(latitude) ||
				!Number.isFinite(longitude) ||
				!Number.isFinite(launcherLatitude) ||
				!Number.isFinite(launcherLongitude) ||
				!Number.isFinite(targetLatitude) ||
				!Number.isFinite(targetLongitude)
			) {
				return null;
			}

			return {
				id:
					typeof track?.id === 'string' && track.id.length > 0
						? track.id
						: crypto.randomUUID(),
				launcherId:
					typeof track?.launcherId === 'string' && track.launcherId.length > 0
						? track.launcherId
						: 'focus-fire-launcher',
				launcherName:
					typeof track?.launcherName === 'string' && track.launcherName.trim().length > 0
						? track.launcherName.trim()
						: '집중포격 발사대',
				latitude,
				longitude,
				altitudeMeters: Math.max(0, Number(track?.altitudeMeters) || 0),
				launcherLatitude,
				launcherLongitude,
				launcherAltitudeMeters: Math.max(
					0,
					Number(track?.launcherAltitudeMeters) || 0
				),
				targetLatitude,
				targetLongitude,
				variant: normalizeFocusFireVariant(track?.variant)
			};
		})
		.filter((track) => track !== null);
}

function normalizeFocusFirePayload(payload = {}) {
	if (!hasFocusFireObjective(payload)) {
		return null;
	}

	return {
		objectiveLon: Number(payload.objectiveLon),
		objectiveLat: Number(payload.objectiveLat),
		objectiveName:
			typeof payload.objectiveName === 'string' && payload.objectiveName.trim().length > 0
				? payload.objectiveName.trim()
				: '집중포격 목표',
		active: payload.active === true,
		captureProgress: Number(payload.captureProgress) || 0,
		aircraftCount: Number(payload.aircraftCount) || 0,
		artilleryCount: Number(payload.artilleryCount) || 0,
		armorCount: Number(payload.armorCount) || 0,
		weaponsInFlight: Number(payload.weaponsInFlight) || 0,
		launchPlatforms: normalizeFocusFireLaunchPlatforms(payload.launchPlatforms),
		weaponTracks: normalizeFocusFireWeaponTracks(payload.weaponTracks),
		statusLabel:
			typeof payload.statusLabel === 'string' && payload.statusLabel.trim().length > 0
				? payload.statusLabel.trim()
				: '대기'
	};
}

function updateFocusFireMainControl() {
	if (!focusFireMainControl || !focusFireMainStatus || !focusFireMainObjective || !focusFireMainMetrics || !focusFireMainStartBtn) {
		return;
	}

	const shouldShowFocusFireControl =
		Boolean(focusFireRuntimeState) &&
		(currentState === States.FLYING || currentState === States.PAUSED);

	if (!shouldShowFocusFireControl || !focusFireRuntimeState) {
		focusFireMainControl.classList.add('hidden');
		return;
	}

	focusFireMainControl.classList.remove('hidden');
	focusFireMainStatus.textContent = focusFireRuntimeState.statusLabel;
	focusFireMainObjective.textContent = focusFireRuntimeState.objectiveName;
	focusFireMainMetrics.textContent =
		`탄체 ${focusFireRuntimeState.weaponsInFlight} · 점령 ${Math.round(focusFireRuntimeState.captureProgress)}% · 포대 ${focusFireRuntimeState.artilleryCount} / 기갑 ${focusFireRuntimeState.armorCount} / 항공 ${focusFireRuntimeState.aircraftCount}`;
	focusFireMainStartBtn.disabled = !focusFireRuntimeState || currentState !== States.FLYING;
}

function applyFocusFireRuntime(payload) {
	focusFireRuntimeState = normalizeFocusFirePayload(payload);
	if (focusFireSystem) {
		focusFireSystem.setState(focusFireRuntimeState ?? {});
	}
	updateFocusFireMainControl();
}

function triggerFocusFireMainBarrage(bursts = null, focusState = focusFireRuntimeState) {
	if (!focusState) {
		return;
	}

	const resolvedBursts =
		Number.isFinite(Number(bursts)) && Number(bursts) > 0
			? Number(bursts)
			: Math.max(
				3,
				focusState.artilleryCount +
					Math.ceil(focusState.aircraftCount / 2) +
					Math.ceil(focusState.armorCount / 2)
			);

	if (focusFireSystem) {
		focusFireSystem.triggerBarrage({
			bursts: resolvedBursts,
			launchPlatforms: focusState.launchPlatforms,
			weaponTracks: focusState.weaponTracks
		});
	}
}

window.addEventListener('message', (event) => {
	if (event.origin !== window.location.origin || !event.data) {
		return;
	}

	if (event.data.type === 'firescope-focus-fire-update') {
		applyFocusFireRuntime(event.data.payload);
		return;
	}

	if (
		event.data.type === 'firescope-focus-fire-command' &&
		event.data.payload?.command === 'start-barrage'
	) {
		const bursts = Number(event.data.payload.bursts) || null;
		const commandState = normalizeFocusFirePayload({
			...(focusFireRuntimeState ?? {}),
			...event.data.payload
		});
		if (commandState) {
			focusFireRuntimeState = commandState;
			if (focusFireSystem) {
				focusFireSystem.setState(commandState);
			}
		}
		if (focusFireSystem && (commandState ?? focusFireRuntimeState)) {
			triggerFocusFireMainBarrage(bursts, commandState ?? focusFireRuntimeState);
		} else {
			pendingFocusFireBarrage = {
				bursts,
				focusState: commandState ?? focusFireRuntimeState
			};
		}
	}
});

function updateCraftHelp() {
	const helpTitle = document.querySelector('#helpModal .modal-title');
	const helpBody = document.querySelector('#helpModal .modal-body');

	if (helpTitle) {
		helpTitle.textContent = activeCraft.mode === 'drone' ? '드론 안내' : '비행 안내';
	}

	if (!helpBody) {
		return;
	}

	if (activeCraft.mode === 'drone') {
		helpBody.innerHTML = `
			<h3>기본 조작</h3>
			<div class="control-grid">
				<div class="key">W / S</div>
				<div>앞으로 / 뒤로 이동</div>
				<div class="key">↑ / ↓</div>
				<div>상승 / 하강</div>
				<div class="key">← / →</div>
				<div>좌우 이동</div>
				<div class="key">A / D</div>
				<div>좌우 회전</div>
			</div>
			<h3>시야</h3>
			<div class="control-grid">
				<div class="key">마우스 드래그</div>
				<div>주변 둘러보기</div>
				<div class="key">ESC / P</div>
				<div>잠시 멈추기</div>
			</div>
		`;
		return;
	}

	helpBody.innerHTML = `
		<h3>비행 조작</h3>
		<div class="control-grid">
			<div class="key">↑ / ↓</div>
			<div>기수 내리기 / 올리기</div>
			<div class="key">← / →</div>
			<div>좌우 기울이기</div>
			<div class="key">A / D</div>
			<div>좌우 방향 돌리기</div>
			<div class="key">W / S</div>
			<div>속도 올리기 / 내리기</div>
			<div class="key">스페이스</div>
			<div>순간 가속</div>
		</div>
		<h3>전투</h3>
		<div class="control-grid">
			<div class="key">1 / 2 / Q</div>
			<div>무기 바꾸기</div>
			<div class="key">F / 엔터</div>
			<div>선택한 무기 발사</div>
			<div class="key">R</div>
			<div>미사일 형식 바꾸기</div>
			<div class="key">V</div>
			<div>기만체 뿌리기</div>
			<div class="key">C</div>
			<div>카메라 모드 바꾸기</div>
		</div>
		<h3>시야</h3>
		<div class="control-grid">
			<div class="key">마우스 드래그</div>
			<div>주변 둘러보기</div>
			<div class="key">ESC / P</div>
			<div>잠시 멈추기</div>
		</div>
	`;
}

function createFallbackCraftModel(craftProfile) {
	if (craftProfile.mode !== 'drone') {
		return null;
	}

	const droneGroup = new THREE.Group();
	const bodyMaterial = new THREE.MeshStandardMaterial({
		color: 0x556b2f,
		metalness: 0.45,
		roughness: 0.5
	});
	const accentMaterial = new THREE.MeshStandardMaterial({
		color: 0x1c2118,
		metalness: 0.2,
		roughness: 0.8
	});

	const body = new THREE.Mesh(
		new THREE.BoxGeometry(1.25, 0.18, 0.42),
		bodyMaterial
	);
	droneGroup.add(body);

	const armLong = new THREE.Mesh(
		new THREE.BoxGeometry(1.75, 0.05, 0.12),
		bodyMaterial
	);
	droneGroup.add(armLong);

	const armWide = new THREE.Mesh(
		new THREE.BoxGeometry(0.12, 0.05, 1.75),
		bodyMaterial
	);
	droneGroup.add(armWide);

	const cameraPod = new THREE.Mesh(
		new THREE.SphereGeometry(0.14, 18, 18),
		accentMaterial
	);
	cameraPod.position.set(0, -0.16, 0.22);
	droneGroup.add(cameraPod);

	const rotorOffsets = [
		[0.85, 0.04, 0.85],
		[-0.85, 0.04, 0.85],
		[0.85, 0.04, -0.85],
		[-0.85, 0.04, -0.85]
	];

	rotorOffsets.forEach(([x, y, z]) => {
		const mast = new THREE.Mesh(
			new THREE.CylinderGeometry(0.025, 0.025, 0.14, 12),
			accentMaterial
		);
		mast.position.set(x, y, z);
		droneGroup.add(mast);

		const rotor = new THREE.Mesh(
			new THREE.CylinderGeometry(0.22, 0.22, 0.015, 18),
			accentMaterial
		);
		rotor.rotation.x = Math.PI / 2;
		rotor.position.set(x, y + 0.08, z);
		droneGroup.add(rotor);
	});

	return droneGroup;
}

function initializeCraftModel(mesh, animations = []) {
	planeModel = new THREE.Group();
	planeModel.add(mesh);
	scene.add(planeModel);

	planeModel.layers.set(1);
	planeModel.traverse(child => {
		child.layers.set(1);
	});

	const { x: baseRotX, y: baseRotY, z: baseRotZ } = activeCraft.visual.baseRotation;
	mesh.rotation.x += baseRotX;
	mesh.rotation.y += baseRotY;
	mesh.rotation.z += baseRotZ;
	mesh.updateMatrixWorld(true);

	const box = new THREE.Box3().setFromObject(mesh);
	const center = box.getCenter(new THREE.Vector3());
	mesh.position.sub(center);

	planeModel.position.copy(basePlanePos);
	planeModel.scale.setScalar(activeCraft.visual.scale);

	if (activeCraft.enableJetFlames) {
		const flameL = new JetFlame();
		const flameR = new JetFlame();

		flameL.group.position.set(-0.4, -0.065, 5);
		flameR.group.position.set(0.4, -0.065, 5);

		planeModel.add(flameL.group);
		planeModel.add(flameR.group);
		jetFlames.push(flameL, flameR);
	}

	weaponSystem = activeCraft.enableWeapons
		? new WeaponSystem(getViewer(), scene, planeModel)
		: null;
	if (weaponSystem) {
		weaponSystem.onKill = (npc) => {
			state.score += 1000;
			try { soundManager.play('glitch-random'); } catch (e) { }
			if (hud) {
				hud.showKillNotification(npc.name, 1000);
			}
		};
		weaponSystem.onMissileDetonate = (payload) => {
			if (cameraDirector.mode !== CAMERA_MODES.CINEMATIC) {
				return;
			}

			cameraDirector.killCam = {
				lon: payload.lon,
				lat: payload.lat,
				alt: payload.alt,
				baseHeading: payload.heading,
				duration: payload.type === 'npc' ? 1.8 : 1.35,
				timeRemaining: payload.type === 'npc' ? 1.8 : 1.35,
				orbitDirection: Math.random() > 0.5 ? 1 : -1
			};
		};
	}

	planeModel.traverse(child => {
		child.layers.set(1);
	});

	mixer = null;
	const clip = activeCraft.animation.name
		? THREE.AnimationClip.findByName(animations, activeCraft.animation.name)
		: animations[0];
	if (clip) {
		mixer = new THREE.AnimationMixer(mesh);
		const action = mixer.clipAction(clip);
		action.setLoop(
			activeCraft.animation.loop === 'repeat'
				? THREE.LoopRepeat
				: THREE.LoopOnce
		);
		action.clampWhenFinished = activeCraft.animation.loop !== 'repeat';
		action.play();
	}

	loadingStatus.model = true;
	updateLoadingUI();
}

function setSpawnAltitude(cartographicOrHeight) {
	const terrainHeight =
		typeof cartographicOrHeight === 'number'
			? cartographicOrHeight
			: cartographicOrHeight?.height;
	state.alt = Math.max(0, terrainHeight || 0) + activeCraft.spawnAltitudeOffset;
}

function loadCraftModel(loader, modelCandidates, onLoad, onError, index = 0) {
	const validCandidates = Array.isArray(modelCandidates)
		? modelCandidates.filter(
			(candidate) => typeof candidate === 'string' && candidate.length > 0
		)
		: [];

	if (index >= validCandidates.length) {
		onError(new Error(`Unable to load any model from: ${validCandidates.join(', ')}`));
		return;
	}

	const modelPath = validCandidates[index];
	loader.load(
		assetUrl(modelPath),
		(gltf) => onLoad(gltf, modelPath),
		undefined,
		(error) => {
			console.warn(`Failed to load model ${modelPath}`, error);
			loadCraftModel(loader, validCandidates, onLoad, onError, index + 1);
		}
	);
}

const mainMenu = document.getElementById('mainMenu');
const pauseMenu = document.getElementById('pauseMenu');
const crashMenu = document.getElementById('crashMenu');
const uiContainer = document.getElementById('uiContainer');
const threeContainer = document.getElementById('threeContainer');
const spawnInstruction = document.getElementById('spawnInstruction');
const confirmSpawnBtn = document.getElementById('confirmSpawnBtn');

let spawnMarker = null;

const startBtn = document.getElementById('startBtn');
const focusFireMainControl = document.getElementById('focus-fire-main-control');
const focusFireMainStatus = document.getElementById('focus-fire-main-status');
const focusFireMainObjective = document.getElementById('focus-fire-main-objective');
const focusFireMainMetrics = document.getElementById('focus-fire-main-metrics');
const focusFireMainStartBtn = document.getElementById('focus-fire-main-start');

const loadingIndicator = document.getElementById('loadingIndicator');
const loadingText = document.getElementById('loadingText');

let focusFireRuntimeState = null;
let pendingFocusFireBarrage = null;

const loadingStatus = {
	audio: false,
	model: false,
	cesium: false,
	globe: false,
	failed: false
};

function updateLoadingUI() {
	if (!loadingIndicator || !loadingText || !startBtn) return;

	if (currentState === States.FLYING || currentState === States.TRANSITIONING) {
		loadingIndicator.classList.add('hidden');
		return;
	}

	let msg = "";
	const isAllLoaded = loadingStatus.audio && loadingStatus.model && loadingStatus.cesium && loadingStatus.globe;

	if (loadingStatus.failed) {
		msg = "불러오기에 실패했습니다. 새로고침해 주세요.";
	} else if (!isAllLoaded) {
		if (!loadingStatus.audio) msg = "오디오를 불러오는 중...";
		else if (!loadingStatus.model) msg = activeCraft.loadingLabel;
		else if (!loadingStatus.cesium) msg = "위성 지도를 불러오는 중...";
		else if (!loadingStatus.globe) msg = "지형 표면을 불러오는 중...";
	}

	if (msg) {
		loadingText.textContent = msg;
		startBtn.disabled = true;
		startBtn.style.pointerEvents = "none";
		loadingIndicator.classList.remove('hidden');

		if (loadingStatus.failed) {
			loadingText.style.color = "#f00";
			const spinner = loadingIndicator.querySelector('.spinner');
			if (spinner) {
				spinner.style.borderColor = "rgba(255, 0, 0, 0.3)";
				spinner.style.borderTopColor = "#f00";
			}
		}
	} else {
		loadingIndicator.classList.add('hidden');
		startBtn.disabled = false;
		startBtn.style.pointerEvents = "auto";
	}
}

async function initSounds() {
	soundManager.init(camera);

	const soundDefinitions = [
		{ name: 'boost', path: 'assets/sounds/boost.mp3', loop: false, volume: 0.35 },
		{ name: 'throttle', path: 'assets/sounds/throttle.mp3', loop: false, volume: 0.4 },
		{ name: 'explode', path: 'assets/sounds/explode.mp3', loop: false, volume: 0.75 },
		{ name: 'explosion-1', path: 'assets/sounds/explosion-1.mp3', loop: false, volume: 0.8 },
		{ name: 'explosion-2', path: 'assets/sounds/explosion-2.mp3', loop: false, volume: 0.8 },
		{ name: 'explosion-3', path: 'assets/sounds/explosion-3.mp3', loop: false, volume: 0.8 },
		{ name: 'ambient-crash', path: 'assets/sounds/ambient.mp3', loop: true, volume: 0.5 },
		{ name: 'weapon-warning', path: 'assets/sounds/weapon-warning-1.mp3', loop: false, volume: 1.0 },
		{ name: 'jet-engine', path: 'assets/sounds/jet-engine.mp3', loop: true, volume: 0.5 },
		{ name: 'spawn', path: 'assets/sounds/spawn.mp3', loop: false, volume: 0.5 },
		{ name: 'roll', path: 'assets/sounds/roll.mp3', loop: true, volume: 0.75 },
		{ name: 'pitch', path: 'assets/sounds/pitch.mp3', loop: true, volume: 0.75 },
		{ name: 'button-click', path: 'assets/sounds/button-click.mp3', loop: false, volume: 1.0 },
		{ name: 'weapon-switch', path: 'assets/sounds/weapon-switch.mp3', loop: false, volume: 0.75 },
		{ name: 'button-hover', path: 'assets/sounds/button-hover.mp3', loop: false, volume: 0.25 },
		{ name: 'zoom-in', path: 'assets/sounds/zoom-in.mp3', loop: false, volume: 0.5 },
		{ name: 'missile-fire', path: 'assets/sounds/missile-firing-1.mp3', loop: false, volume: 0.75 },
		{ name: 'm61-firing', path: 'assets/sounds/m61-firing.mp3', loop: true, volume: 0.75 },
		{ name: 'rwr-tws', path: 'assets/sounds/rwr-tws.mp3', loop: true, volume: 0.2 },
		{ name: 'rwr-lock', path: 'assets/sounds/rwr-lock.mp3', loop: false, volume: 0.2 },
		{ name: 'wind', path: 'assets/sounds/wind.mp3', loop: true, volume: 0.25 },
		{ name: 'terrain-pull-up', path: 'assets/sounds/terrain-pull-up.mp3', loop: false, volume: 0.9 },
		{ name: 'warning', path: 'assets/sounds/warning.mp3', loop: false, volume: 0.6 },
		{ name: 'glitch-1', path: 'assets/sounds/glitch-transition-1.mp3', loop: false, volume: 0.25 },
		{ name: 'glitch-2', path: 'assets/sounds/glitch-transition-2.mp3', loop: false, volume: 0.25 },
		{ name: 'glitch-3', path: 'assets/sounds/glitch-transition-3.mp3', loop: false, volume: 0.25 },
		{ name: 'glitch-4', path: 'assets/sounds/glitch-transition-4.mp3', loop: false, volume: 0.25 }
	];
	const soundRequests = soundDefinitions.map((definition) => ({
		...definition,
		url: assetUrl(definition.path)
	}));
	const soundResults = await Promise.allSettled(
		soundRequests.map(({ name, url, loop, volume }) =>
			soundManager.loadSound(name, url, loop, volume)
		)
	);
	const failedSounds = soundResults.flatMap((result, index) =>
		result.status === 'rejected'
			? [{
				name: soundRequests[index].name,
				url: soundRequests[index].url,
				reason: result.reason
			}]
			: []
	);

	if (failedSounds.length > 0) {
		console.error('Failed to load one or more flight simulator sounds.', failedSounds);
	}

	if (failedSounds.length === soundRequests.length) {
		loadingStatus.failed = true;
		updateLoadingUI();
		throw new Error('Unable to load any flight simulator audio assets.');
	}

	loadingStatus.audio = true;
	updateLoadingUI();
	setupButtonSounds();
}

function stopAllFlyingSounds(fadeOut = 0.5) {
	soundManager.stopAll(fadeOut);
}

function pauseGameplaySounds() {
	pauseStartTime = Date.now();
	soundManager.pauseAll();
}

function resumeGameplaySounds() {
	const pauseDuration = Date.now() - pauseStartTime;
	if (lastGPWSWarningTime > 0) {
		lastGPWSWarningTime += pauseDuration;
	}
	soundManager.resumeAll();
}

function setupButtonSounds() {
	document.addEventListener('mouseover', (e) => {
		const target = e.target.closest('button, .menu-btn, .clickable-ui');
		if (target && !target._hovered && soundManager.isUnlocked()) {
			soundManager.play('button-hover');
			target._hovered = true;
			target.addEventListener('mouseleave', () => { target._hovered = false; }, { once: true });
		}
	}, true);

	document.addEventListener('click', (e) => {
		const target = e.target.closest('button, .menu-btn, .clickable-ui, #search-toggle-btn');
		if (target) {
			soundManager.play('button-click');
		}
	}, true);
}

function initThree() {
	clock = new THREE.Clock();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000, 0);
	threeContainer.appendChild(renderer.domElement);

	threeContainer.classList.add('hidden');

	const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
	directionalLight.position.set(5, 10, 5);
	scene.add(directionalLight);

	ambientLight.layers.enable(1);
	directionalLight.layers.enable(1);

	updateCraftHud();
	updateCraftHelp();

	try { particles.init(scene, getViewer()); } catch (e) { }

	initSounds().catch(err => {
		console.error('Failed to init sounds', err);
		if (!loadingStatus.audio) {
			loadingStatus.failed = true;
			updateLoadingUI();
		}
	});

	const loader = new GLTFLoader();
	loadCraftModel(loader, activeCraft.modelCandidates, (gltf) => {
		initializeCraftModel(gltf.scene, gltf.animations);
	}, (error) => {
		const fallbackModel = createFallbackCraftModel(activeCraft);
		if (fallbackModel) {
			console.warn('Drone GLB asset not found. Using built-in fallback drone model.', error);
			initializeCraftModel(fallbackModel, []);
			return;
		}

		console.error('Error loading model:', error);
		loadingStatus.failed = true;
		updateLoadingUI();
	});
}

function update(dt) {
	if (currentState !== States.FLYING) return;

	const input = controller.update();
	const physicsResult = physics.update(input, dt);

	const prevSpeed = state.speed;
	state.speed = physicsResult.speed;
	state.pitch = physicsResult.pitch;
	state.roll = physicsResult.roll;
	state.heading = physicsResult.heading;
	state.throttle = input.throttle;
	state.yaw = input.yaw;
	state.isBoosting = physicsResult.isBoosting;
	state.weaponSystem = weaponSystem;
	state.npcs = npcSystem ? npcSystem.npcs : [];

	if (weaponSystem) {
		if (input.weaponIndex !== -1) {
			weaponSystem.selectWeapon(input.weaponIndex);
		}
		if (input.toggleWeapon) {
			weaponSystem.toggleWeapon();
		}
		if (input.cycleMissileProfile) {
			weaponSystem.cycleMissileProfile();
		}
		if (input.fire) {
			weaponSystem.fire(state);
		}
		if (input.fireFlare) {
			weaponSystem.fireFlare(state);
		}
		weaponSystem.update(dt, state, input);
	}
	if (input.cycleCameraMode) {
		cycleCameraMode();
	}

	const newPos = activeCraft.mode === 'drone'
		? movePositionByVector(
			state.lon,
			state.lat,
			state.alt,
			state.heading,
			physicsResult.forwardSpeed * dt,
			physicsResult.lateralSpeed * dt,
			physicsResult.verticalSpeed * dt
		)
		: movePosition(
			state.lon,
			state.lat,
			state.alt,
			state.heading,
			state.pitch,
			state.speed * dt
		);
	state.lon = newPos.lon;
	state.lat = newPos.lat;
	state.alt = newPos.alt;

	const nowTime = Date.now();
	const distFromLast = calculateDistance(state.lon, state.lat, lastGeocodePos.lon, lastGeocodePos.lat);

	if (nowTime - lastGeocodeTime > GEOCODE_INTERVAL || distFromLast > GEOCODE_MIN_DIST) {
		lastGeocodeTime = nowTime;
		lastGeocodePos = { lon: state.lon, lat: state.lat };

		reverseGeocode(state.lon, state.lat).then(name => {
			if (name && name !== currentRegionName) {
				currentRegionName = name;
				hud.showRegion(name);
			}
		});
	}

	checkCrash();
	checkGPWS();

	if (activeCraft.enableJetAudio && soundManager.isPlaying('jet-engine')) {
		const minSpeed = 100;
		const maxSpeed = 1000;
		const minVol = 0.5;
		const maxVol = 0.6;
		const speedFactor = Math.max(0, Math.min(1.0, (state.speed - minSpeed) / (maxSpeed - minSpeed)));
		const engineVol = minVol + speedFactor * (maxVol - minVol);
		soundManager.setVolume('jet-engine', engineVol);
	}

	if (activeCraft.enableBoost && state.isBoosting && !lastIsBoosting) {
		soundManager.play('boost');
	}

	if (activeCraft.enableJetAudio && state.throttle > lastThrottleLevel + 0.01) {
		if (!soundManager.isPlaying('throttle')) {
			soundManager.play('throttle');
		}
	}
	lastThrottleLevel = state.throttle;

	if (activeCraft.enableJetAudio && Math.abs(input.pitch) > 0.5) {
		if (!soundManager.isPlaying('pitch')) {
			soundManager.play('pitch', 0.1);
		}
	} else {
		if (soundManager.isPlaying('pitch')) {
			soundManager.stop('pitch', 0.1);
		}
	}

	if (activeCraft.enableJetAudio && (Math.abs(input.roll) > 0.5 || Math.abs(input.yaw) > 0.5)) {
		if (!soundManager.isPlaying('roll')) {
			soundManager.play('roll', 0.1);
		}
	} else {
		if (soundManager.isPlaying('roll')) {
			soundManager.stop('roll', 0.1);
		}
	}

	const activeCameraView = updateCombatCamera(dt, input);
	state.cameraModeLabel = activeCameraView.label;
	state.renderPlayerOverlay = activeCameraView.renderPlayerOverlay;

	if (npcSystem) {
		npcSystem.update(dt, state);
	}
	hud.update(state, currentState === States.FLYING ? (npcSystem ? npcSystem.npcs : []) : []);

	if (planeModel) {
		const accel = (state.speed - prevSpeed) / dt;
		const accelInertia = input.isDragging ? 0 : Math.max(-0.5, Math.min(1.5, accel * 0.001));
		let targetZ = basePlanePos.z - accelInertia;

		let boostZOffset = 0;
		if (activeCraft.enableBoost && physicsResult.isBoosting) {
			if (!lastIsBoosting) {
				boostRollDirection = Math.random() > 0.5 ? 1 : -1;
			}

			const T = physicsResult.boostDuration;
			const p = Math.max(0, Math.min(1.0, 1.0 - (physicsResult.boostTimeRemaining / T)));

			const totalRotationRad = Math.PI * 2 * physicsResult.boostRotations * boostRollDirection;

			if (p < 0.2) {
				const localP = p / 0.2;
				boostZOffset = -(localP * localP) * 1.5;
				boostRoll = 0;
			}
			else if (p < 0.8) {
				const localP = (p - 0.2) / 0.6;
				boostZOffset = -1.5;
				const easedP = localP < 0.5
					? 4 * localP * localP * localP
					: 1 - Math.pow(-2 * localP + 2, 3) / 2;
				boostRoll = easedP * (Math.PI * 2 * physicsResult.boostRotations) * boostRollDirection;
			}
			else {
				const localP = (p - 0.8) / 0.2;
				const easedReturn = localP * localP * (3 - 2 * localP);
				boostZOffset = -1.5 + (easedReturn * 0.7);
				boostRoll = (Math.PI * 2 * physicsResult.boostRotations) * boostRollDirection;
			}
		} else {
			boostRoll = 0;
			boostZOffset = 0;
		}
		lastIsBoosting = physicsResult.isBoosting;

		const zLerp = physicsResult.isBoosting ? 10.0 * dt : 2.0 * dt;
		currentBoostZOffset += (boostZOffset - currentBoostZOffset) * zLerp;
		targetZ += currentBoostZOffset;


		const time = performance.now() * 0.001;
		const idleX = Math.sin(time * 0.8) * (activeCraft.mode === 'drone' ? 0.015 : 0.035);
		const idleY = Math.cos(time * 0.6) * (activeCraft.mode === 'drone' ? 0.012 : 0.025);
		const idleRotX = Math.sin(time * 0.5) * (activeCraft.mode === 'drone' ? 0.01 : 0.015);
		const idleRotY = Math.cos(time * 0.4) * (activeCraft.mode === 'drone' ? 0.01 : 0.015);
		const idleRotZ = Math.sin(time * 0.7) * (activeCraft.mode === 'drone' ? 0.012 : 0.025);

		const targetX = input.isDragging
			? basePlanePos.x
			: activeCraft.mode === 'drone'
				? basePlanePos.x - (input.strafe * 0.28) - (input.yaw * 0.1) + idleX
				: basePlanePos.x - (input.roll * 0.6) - (input.yaw * 0.12) + idleX;
		const targetY = input.isDragging
			? basePlanePos.y
			: activeCraft.mode === 'drone'
				? basePlanePos.y + (input.vertical * 0.2) - (input.forward * 0.08) + idleY
				: basePlanePos.y - (input.pitch * 0.1) + idleY;

		let targetRotZ = input.isDragging
			? 0
			: activeCraft.mode === 'drone'
				? THREE.MathUtils.degToRad(physicsResult.roll) + idleRotZ
				: THREE.MathUtils.degToRad(-input.roll * 15) + idleRotZ;
		const targetRotX = input.isDragging
			? 0
			: activeCraft.mode === 'drone'
				? THREE.MathUtils.degToRad(physicsResult.pitch) + idleRotX
				: THREE.MathUtils.degToRad(input.pitch * 10) + idleRotX;
		const targetRotY = input.isDragging
			? 0
			: activeCraft.mode === 'drone'
				? THREE.MathUtils.degToRad(-input.yaw * 8) + idleRotY
				: THREE.MathUtils.degToRad(-input.yaw * 4) + idleRotY;

		const lerpFactor = activeCraft.enableBoost && physicsResult.isBoosting
			? 3.0 * dt
			: (activeCraft.mode === 'drone' ? 7.0 * dt : 5.0 * dt);
		visualOffset.x += (targetX - visualOffset.x) * lerpFactor;
		visualOffset.y += (targetY - visualOffset.y) * lerpFactor;
		visualOffset.z += (targetZ - visualOffset.z) * lerpFactor;

		visualRotation.z += (targetRotZ - visualRotation.z) * lerpFactor;
		visualRotation.x += (targetRotX - visualRotation.x) * lerpFactor;
		visualRotation.y += (targetRotY - visualRotation.y) * lerpFactor;

		const orbitQ = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(
				THREE.MathUtils.degToRad(-input.cameraPitch),
				THREE.MathUtils.degToRad(-input.cameraYaw),
				0,
				'YXZ'
			)
		);

		planeModel.position.copy(visualOffset);

		const flightLagQ = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(visualRotation.x, visualRotation.y, visualRotation.z + boostRoll)
		);

		const combinedQ = orbitQ.clone().invert().multiply(flightLagQ);
		planeModel.quaternion.copy(combinedQ);

		if (activeCraft.enableJetFlames && jetFlames.length > 0) {
			jetFlames.forEach(flame => {
				flame.update(state.throttle, state.isBoosting, clock.getElapsedTime(), dt);
			});
		}
	}
}

function checkGPWS() {
	if (currentState !== States.FLYING) {
		hud.setPullUpWarning(false);
		return;
	}

	if (!activeCraft.enableGpws) {
		hud.setPullUpWarning(false);
		return;
	}

	const viewer = getViewer();
	if (!viewer) return;

	const cartographic = Cesium.Cartographic.fromDegrees(state.lon, state.lat);
	const terrainHeight = viewer.scene.globe.getHeight(cartographic);

	if (terrainHeight === undefined) return;

	const agl = state.alt - terrainHeight;
	const pitchRad = Cesium.Math.toRadians(state.pitch);
	const verticalSpeed = state.speed * Math.sin(pitchRad);

	let showWarning = false;

	if (state.pitch < -1) {
		if (agl < 450) {
			if (agl < 150) {
				showWarning = true;
			}

			if (verticalSpeed < -20) {
				showWarning = true;
			}
		}
	}

	hud.setPullUpWarning(showWarning);

	if (showWarning) {
		const now = Date.now();
		if (!gpwsActive || (now - lastGPWSWarningTime > GPWS_COOLDOWN && !soundManager.isPlaying('terrain-pull-up'))) {
			soundManager.play('terrain-pull-up');
			lastGPWSWarningTime = now;
		}
		gpwsActive = true;
	} else {
		if (gpwsActive) {
			soundManager.stop('terrain-pull-up', 0.1);
			gpwsActive = false;
		}
	}
}

let lastCrashCheck = 0;
let flightStartTime = 0;

function checkCrash() {
	if (currentState !== States.FLYING) return;

	const now = Date.now();
	if (now - lastCrashCheck < 100) return;
	lastCrashCheck = now;

	if (now - flightStartTime < 3000) return;

	const viewer = getViewer();
	if (!viewer) return;

	const cartographic = Cesium.Cartographic.fromDegrees(state.lon, state.lat);
	const terrainHeight = viewer.scene.globe.getHeight(cartographic);

	if (terrainHeight !== undefined && state.alt <= terrainHeight + activeCraft.crashClearance) {
		currentState = States.CRASHED;
		if (dialogueSystem) dialogueSystem.stop();
		uiContainer.classList.add('hidden');
		const weaponsHud = document.getElementById('weapons-hud');
		if (weaponsHud) weaponsHud.classList.add('hidden');
		threeContainer.classList.add('hidden');
		crashMenu.classList.remove('hidden');
		hud.update(state, []);

		stopAllFlyingSounds(0.1);
		setTimeout(() => {
			soundManager.play('explode');
			soundManager.play('ambient-crash');
		}, 50);
	}
}

function animate() {
	requestAnimationFrame(animate);

	const dt = clock ? clock.getDelta() : 0.016;
	const now = performance.now();

	frameCount++;
	if (now - lastFpsUpdate >= 1000) {
		fps = (frameCount * 1000) / (now - lastFpsUpdate);
		frameCount = 0;
		lastFpsUpdate = now;
		hud.updateFPS(fps);

		const menuTimeElem = document.getElementById('menu-time');
		if (menuTimeElem) {
			menuTimeElem.textContent = new Date().toISOString().split('.')[0] + 'Z';
		}
	}

	if (currentState === States.FLYING || currentState === States.PAUSED || currentState === States.TRANSITIONING) {
		const viewer = getViewer();

		renderer.autoClear = false;
		renderer.clear();

		if (viewer && viewer.camera && viewer.camera.frustum.fovy) {
			const targetFov = Cesium.Math.toDegrees(viewer.camera.frustum.fovy);
			camera.fov = targetFov;
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}

		camera.layers.set(0);

		if (currentState === States.FLYING) {
			update(dt);
		} else if (currentState === States.PAUSED) {
			hud.updatePauseMenu(state, currentRegionName, npcSystem ? npcSystem.npcs : []);
		}
		if (focusFireSystem) {
			focusFireSystem.update(currentState === States.FLYING ? dt : 0);
		}
		updateFocusFireMainControl();

		if (mixer) mixer.update(dt);

		try { if (currentState === States.FLYING) particles.update(dt); } catch (e) { }

		renderer.render(scene, camera);

		renderer.clearDepth();

		if (state.renderPlayerOverlay !== false) {
			camera.fov = 75;
			camera.updateProjectionMatrix();

			camera.layers.set(1);

			renderer.render(scene, camera);
		}

	} else {
		threeContainer.classList.add('hidden');
	}
}

function closeAllModals() {
	document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function reloadFlightSimForSelectedCraft() {
	const currentUrl = new URL(window.location.href);
	const nextStartPosition = resolveFlightSimStartPosition(state.lon, state.lat);

	currentUrl.searchParams.set('lon', nextStartPosition.lon.toFixed(6));
	currentUrl.searchParams.set('lat', nextStartPosition.lat.toFixed(6));

	if (Number.isFinite(state.alt)) {
		currentUrl.searchParams.set('alt', state.alt.toFixed(0));
	}

	if (requestedCraft !== 'drone') {
		currentUrl.searchParams.set('craft', gameSettings.selectedJetCraftId);
	}

	window.history.replaceState({}, '', currentUrl.toString());
	window.location.reload();
}

function setupModalListeners() {
	document.getElementById('helpBtn').onclick = () => {
		closeAllModals();
		document.getElementById('helpModal').classList.remove('hidden');
	};

	document.getElementById('optionsBtn').onclick = () => {
		closeAllModals();
		updateSettingsUI();
		document.getElementById('optionsModal').classList.remove('hidden');
	};

	document.getElementById('pauseOptionsBtn').onclick = () => {
		closeAllModals();
		updateSettingsUI();
		document.getElementById('optionsModal').classList.remove('hidden');
	};

	document.getElementById('pauseHelpBtn').onclick = () => {
		closeAllModals();
		document.getElementById('helpModal').classList.remove('hidden');
	};

	document.getElementById('creditsBtn').onclick = () => {
		closeAllModals();
		document.getElementById('creditsModal').classList.remove('hidden');
	};

	document.getElementById('aboutBtn').onclick = () => {
		closeAllModals();
		document.getElementById('aboutBtnModal').classList.remove('hidden');
	};



	document.getElementById('sensitivitySlider').oninput = (e) => {
		document.getElementById('sensitivityValue').textContent = e.target.value;
	};

	document.getElementById('saveOptionsBtn').onclick = () => {
		const jetCraftSelect = document.getElementById('jetCraftSelect');
		gameSettings.graphicsQuality = document.getElementById('graphicsQuality').value;
		gameSettings.antialiasing = document.getElementById('antialiasing').checked;
		gameSettings.fogEffects = document.getElementById('fogEffects').checked;
		gameSettings.mouseSensitivity = parseFloat(document.getElementById('sensitivitySlider').value);
		gameSettings.showHud = document.getElementById('showHud').checked;
		gameSettings.showHorizonLines = document.getElementById('showHorizonLines').checked;
		gameSettings.soundEnabled = document.getElementById('soundEnabled').checked;
		gameSettings.minimapRange = parseInt(document.getElementById('minimapRange').value, 10);
		if (jetCraftSelect && activeCraft.mode === 'jet') {
			gameSettings.selectedJetCraftId = jetCraftSelect.value;
		}

		saveSettings();
		applySettings();
		closeAllModals();

		if (
			activeCraft.mode === 'jet' &&
			gameSettings.selectedJetCraftId !== activeCraft.id
		) {
			reloadFlightSimForSelectedCraft();
		}
	};

	document.querySelectorAll('.close-modal').forEach(btn => {
		btn.onclick = (e) => {
			e.stopPropagation();
			btn.closest('.modal').classList.add('hidden');
		};
	});

	window.addEventListener('click', (event) => {
		if (event.target.classList.contains('modal')) {
			event.target.classList.add('hidden');
		}
	});
}

document.getElementById('startBtn').onclick = () => {
	closeAllModals();
	mainMenu.classList.add('hidden');
	enterSpawnPicking(false);
};

if (focusFireMainStartBtn) {
	focusFireMainStartBtn.onclick = () => {
		triggerFocusFireMainBarrage();
	};
}

setupModalListeners();

document.getElementById('resumeBtn').onclick = () => {
	closeAllModals();
	pauseMenu.classList.add('hidden');
	uiContainer.classList.remove('hidden');
	const weaponsHud = document.getElementById('weapons-hud');
	if (weaponsHud) {
		weaponsHud.classList.toggle('hidden', !activeCraft.enableWeapons);
	}
	currentState = States.FLYING;
	if (dialogueSystem) dialogueSystem.resume();
	resumeGameplaySounds();
};

document.getElementById('restartBtn').onclick = () => {
	closeAllModals();
	pauseMenu.classList.add('hidden');
	if (dialogueSystem) dialogueSystem.stop();
	enterSpawnPicking(true);
};

document.getElementById('quitBtn').onclick = () => {
	closeAllModals();
	if (dialogueSystem) dialogueSystem.stop();
	setRenderOptimization(true);
	location.reload();
};

document.getElementById('respawnBtn').onclick = () => {
	closeAllModals();
	crashMenu.classList.add('hidden');
	if (dialogueSystem) dialogueSystem.stop();
	enterSpawnPicking(true);
};

function enterSpawnPicking(useVignette = true) {
	state.score = 0;
	if (npcSystem) npcSystem.clear();
	if (focusFireSystem) focusFireSystem.clearProjectiles();
	if (weaponSystem && typeof weaponSystem.clearProjectiles === 'function') {
		weaponSystem.clearProjectiles();
	}
	cameraDirector.killCam = null;
	stopAllFlyingSounds(0.3);
	soundManager.play('zoom-in');
	soundManager.play('wind', 1.0);
	const vignette = document.getElementById('transition-vignette');
	if (useVignette && vignette) vignette.style.opacity = '1';

	const delay = useVignette ? 500 : 0;

	setTimeout(() => {
		spawnInstruction.classList.remove('hidden');
		threeContainer.classList.add('hidden');
		uiContainer.classList.add('hidden');
		const weaponsHud = document.getElementById('weapons-hud');
		if (weaponsHud) weaponsHud.classList.add('hidden');
		currentState = States.PICK_SPAWN;
		confirmSpawnBtn.classList.add('hidden');

		const searchInput = document.getElementById('locationSearch');
		const instructionText = document.getElementById('instruction-text');
		const resultsContainer = document.getElementById('search-results');

		if (searchInput) {
			searchInput.value = '';
			searchInput.style.display = 'none';
		}
		if (instructionText) {
			instructionText.style.display = 'block';
			instructionText.textContent = '지도의 원하는 위치를 클릭해 출발 지점을 고르세요';
		}
		if (resultsContainer) {
			resultsContainer.style.display = 'none';
		}

		setControlsEnabled(true);

		if (spawnMarker) {
			const viewer = getViewer();
			viewer.entities.remove(spawnMarker);
			spawnMarker = null;
		}

		const viewer = getViewer();
		viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(state.lon, state.lat, 15000),
			duration: 2.0,
			complete: () => {
				if (vignette) vignette.style.opacity = '0';
			}
		});
	}, delay);
}

function exitSpawnPicking() {
	soundManager.play('zoom-in');
	soundManager.stop('wind', 1.0);
	stopAllFlyingSounds(0.3);
	if (focusFireSystem) focusFireSystem.clearProjectiles();
	spawnInstruction.classList.add('hidden');
	confirmSpawnBtn.classList.add('hidden');
	mainMenu.classList.remove('hidden');
	currentState = States.MENU;
	loadingIndicator.classList.add('hidden');
	setRenderOptimization(true);

	setControlsEnabled(false);

	if (spawnMarker) {
		const viewer = getViewer();
		viewer.entities.remove(spawnMarker);
		spawnMarker = null;
	}

	const viewer = getViewer();
	viewer.camera.flyTo({
		...initialCameraView,
		duration: 2.5
	});
}

function setupSpawnPicker() {
	const viewer = getViewer();
	const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	const instructionText = document.getElementById('instruction-text');

	handler.setInputAction((click) => {
		if (currentState !== States.PICK_SPAWN) return;

		const ray = viewer.camera.getPickRay(click.position);
		const cartesian = viewer.scene.globe.pick(ray, viewer.scene);

		if (cartesian) {
			const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			const lon = Cesium.Math.toDegrees(cartographic.longitude);
			const lat = Cesium.Math.toDegrees(cartographic.latitude);

			state.lon = lon;
			state.lat = lat;
			setSpawnAltitude(cartographic);
			updateKoreaMapMode(lon, lat);

			instructionText.textContent = '위치 정보를 확인하는 중...';

			reverseGeocode(lon, lat).then(regionName => {
				if (regionName && currentState === States.PICK_SPAWN) {
					instructionText.textContent = regionName;
					if (spawnMarker) {
						spawnMarker.label.text = regionName;
					}
				}
			}).catch(() => { });

			Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic])
				.then(([p]) => setSpawnAltitude(p))
				.catch(() => { });

			if (spawnMarker) {
				viewer.entities.remove(spawnMarker);
			}
			spawnMarker = viewer.entities.add({
				position: cartesian,
				point: {
					pixelSize: 15,
					color: Cesium.Color.RED,
					outlineColor: Cesium.Color.WHITE,
					outlineWidth: 2,
					disableDepthTestDistance: Number.POSITIVE_INFINITY
				},
				label: {
					text: "선택한 출격 지점",
					font: `14pt ${getComputedStyle(document.body).fontFamily}`,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					outlineWidth: 2,
					verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
					pixelOffset: new Cesium.Cartesian2(0, -20),
					disableDepthTestDistance: Number.POSITIVE_INFINITY
				}
			});

			confirmSpawnBtn.classList.remove('hidden');
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function setupLocationSearch() {
	const searchInput = document.getElementById('locationSearch');
	const resultsContainer = document.getElementById('search-results');
	const instructionText = document.getElementById('instruction-text');
	const searchToggleBtn = document.getElementById('search-toggle-btn');
	const originalSearchIcon = searchToggleBtn ? searchToggleBtn.innerHTML : '';
	let debounceTimer;

	if (searchToggleBtn) {
		searchToggleBtn.onclick = (e) => {
			e.stopPropagation();
			const isSearching = searchInput.style.display === 'block';

			if (isSearching) {
				searchInput.style.display = 'none';
				instructionText.style.display = 'block';
				resultsContainer.style.display = 'none';
			} else {
				searchInput.style.display = 'block';
				instructionText.style.display = 'none';
				searchInput.focus();
			}
		};
	}

	searchInput.addEventListener('input', (e) => {
		clearTimeout(debounceTimer);
		const query = e.target.value.trim();

		if (query.length < 3) {
			resultsContainer.style.display = 'none';
			return;
		}

		debounceTimer = setTimeout(async () => {
			if (searchToggleBtn) {
				searchToggleBtn.innerHTML = '<div class="loader-spinner"></div>';
			}

			try {
				const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
				const data = await response.json();

				resultsContainer.innerHTML = '';
				if (data.length > 0) {
					data.forEach(item => {
						const div = document.createElement('div');
						div.textContent = item.display_name;
						div.style.padding = '10px';
						div.style.cursor = 'pointer';
						div.onclick = () => {
							const lon = parseFloat(item.lon);
							const lat = parseFloat(item.lat);

							const viewer = getViewer();
							const position = Cesium.Cartesian3.fromDegrees(lon, lat);

							state.lon = lon;
							state.lat = lat;
							state.alt = activeCraft.spawnAltitudeOffset;
							updateKoreaMapMode(lon, lat);

							const cartographic = Cesium.Cartographic.fromDegrees(lon, lat);
							Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic])
								.then(([p]) => {
									setSpawnAltitude(p);
								})
								.catch(() => { });

							viewer.camera.flyTo({
								destination: Cesium.Cartesian3.fromDegrees(lon, lat, 15000),
								duration: 1.5
							});

							if (spawnMarker) {
								viewer.entities.remove(spawnMarker);
							}
							spawnMarker = viewer.entities.add({
								position: position,
								point: {
									pixelSize: 15,
									color: Cesium.Color.RED,
									outlineColor: Cesium.Color.WHITE,
									outlineWidth: 2,
									disableDepthTestDistance: Number.POSITIVE_INFINITY
								},
								label: {
									text: item.display_name.split(',')[0],
									font: `14pt ${getComputedStyle(document.body).fontFamily}`,
									style: Cesium.LabelStyle.FILL_AND_OUTLINE,
									outlineWidth: 2,
									verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
									pixelOffset: new Cesium.Cartesian2(0, -20),
									disableDepthTestDistance: Number.POSITIVE_INFINITY
								}
							});

							confirmSpawnBtn.classList.remove('hidden');
							resultsContainer.style.display = 'none';

							searchInput.style.display = 'none';
							instructionText.style.display = 'block';
							instructionText.textContent = item.display_name.split(',')[0];
							searchInput.value = item.display_name;
						};
						resultsContainer.appendChild(div);
					});
					resultsContainer.style.display = 'block';
				} else {
					resultsContainer.style.display = 'none';
				}
			} catch (error) {
				console.error('Search error:', error);
			} finally {
				if (searchToggleBtn) {
					searchToggleBtn.innerHTML = originalSearchIcon;
				}
			}
		}, 500);
	});

	document.addEventListener('click', (e) => {
		if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target) && !searchToggleBtn.contains(e.target)) {
			resultsContainer.style.display = 'none';
			if (searchInput.style.display === 'block') {
				searchInput.style.display = 'none';
				instructionText.style.display = 'block';
			}
		}
	});
}

document.getElementById('confirmSpawnBtn').onclick = () => {
	const vignette = document.getElementById('transition-vignette');
	if (vignette) vignette.style.opacity = '1';

	soundManager.play('spawn');

	setTimeout(() => {
		const viewer = getViewer();
		if (spawnMarker) {
			viewer.entities.remove(spawnMarker);
			spawnMarker = null;
		}

		setControlsEnabled(false);

		state.speed = activeCraft.initialSpeed;
		state.pitch = 0;
		state.roll = 0;
		state.cameraModeLabel = CAMERA_MODE_LABELS[cameraDirector.mode];
		state.renderPlayerOverlay = true;
		cameraDirector.killCam = null;

		try {
			const cam = viewer && viewer.camera;
			if (cam && typeof cam.heading === 'number') {
				state.heading = Cesium.Math.toDegrees(cam.heading);
			} else {
				state.heading = 0;
			}
		} catch (e) {
			state.heading = 0;
		}

		currentRegionName = null;
		lastGeocodeTime = 0;
		lastGeocodePos = { lon: 0, lat: 0 };

		visualOffset.copy(basePlanePos);
		visualRotation.set(0, 0, 0);
		boostRoll = 0;
		currentBoostZOffset = 0;
		lastIsBoosting = false;

		controller.reset();
		physics = createPhysicsForCraft(activeCraft);
		physics.reset(state.lon, state.lat, state.alt, state.heading, state.pitch, state.roll);

		hud.resetTime();
		hud.resizeMinimap();

		if (weaponSystem && typeof weaponSystem.resetAmmo === 'function') {
			weaponSystem.resetAmmo();
			if (typeof weaponSystem.clearProjectiles === 'function') {
				weaponSystem.clearProjectiles();
			}
		}

		if (activeCraft.enableNpc && npcSystem) {
			npcSystem.spawnNPC(state.lon, state.lat, state.alt);
		}

		spawnInstruction.classList.add('hidden');
		confirmSpawnBtn.classList.add('hidden');
		loadingIndicator.classList.add('hidden');

		currentState = States.TRANSITIONING;
		setRenderOptimization(false);

		viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(state.lon, state.lat, state.alt),
			orientation: {
				heading: Cesium.Math.toRadians(state.heading),
				pitch: Cesium.Math.toRadians(state.pitch),
				roll: Cesium.Math.toRadians(state.roll)
			},
			duration: 2.0,
			easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
			complete: () => {
				flightStartTime = Date.now();
				uiContainer.classList.remove('hidden');
				const weaponsHud = document.getElementById('weapons-hud');
				if (weaponsHud) {
					weaponsHud.classList.toggle('hidden', !activeCraft.enableWeapons);
				}
				threeContainer.classList.remove('hidden');
				hud.resizeMinimap();
				currentState = States.FLYING;
				if (activeCraft.enableJetAudio) {
					soundManager.play('jet-engine', 1.0);
				}
				if (vignette) vignette.style.opacity = '0';

				if (dialogueSystem) {
					dialogueSystem.start();
				}
			}
		});
	}, 500);
};

window.addEventListener('keydown', (e) => {
	const key = e.key.toLowerCase();
	if (key === 'escape') {
		const openModals = document.querySelectorAll('.modal:not(.hidden)');
		if (openModals.length > 0) {
			openModals.forEach(m => m.classList.add('hidden'));
			return;
		}
	}

	if (key === 'escape' || key === 'p') {
		if (currentState === States.FLYING) {
			currentState = States.PAUSED;
			if (dialogueSystem) dialogueSystem.pause();
			uiContainer.classList.add('hidden');
			const weaponsHud = document.getElementById('weapons-hud');
			if (weaponsHud) weaponsHud.classList.add('hidden');
			pauseMenu.classList.remove('hidden');
			hud.resizeMinimap();
			pauseGameplaySounds();
			hud.update(state, []);
		} else if (currentState === States.PAUSED) {
			currentState = States.FLYING;
			if (dialogueSystem) dialogueSystem.resume();
			pauseMenu.classList.add('hidden');
			uiContainer.classList.remove('hidden');
			const weaponsHud = document.getElementById('weapons-hud');
			if (weaponsHud) {
				weaponsHud.classList.toggle('hidden', !activeCraft.enableWeapons);
			}
			resumeGameplaySounds();
		} else if (currentState === States.PICK_SPAWN && key === 'escape') {
			exitSpawnPicking();
		}
	}

	if (key === 'z' && currentState === States.FLYING) {
		if (dialogueSystem) dialogueSystem.skip();
	}
});

document.addEventListener('visibilitychange', () => {
	if (document.hidden && currentState === States.FLYING) {
		currentState = States.PAUSED;
		if (dialogueSystem) dialogueSystem.pause();
		uiContainer.classList.add('hidden');
		pauseMenu.classList.remove('hidden');
		hud.resizeMinimap();
		pauseGameplaySounds();
		hud.update(state, []);
	}
});

window.addEventListener('blur', () => {
	if (currentState === States.FLYING) {
		currentState = States.PAUSED;
		if (dialogueSystem) dialogueSystem.pause();
		uiContainer.classList.add('hidden');
		pauseMenu.classList.remove('hidden');
		hud.resizeMinimap();
		pauseGameplaySounds();
		hud.update(state, []);
	}
});

const resumeAudio = () => {
	void soundManager.unlock();
	window.removeEventListener('pointerdown', resumeAudio);
	window.removeEventListener('keydown', resumeAudio);
};
window.addEventListener('pointerdown', resumeAudio);
window.addEventListener('keydown', resumeAudio);

async function bootstrap() {
	const viewer = await initCesium({
		lon: state.lon,
		lat: state.lat,
		alt: hasVWorldRuntimeConfig && !hasMapTilerRuntimeConfig
			? Math.max(state.alt + activeCraft.spawnAltitudeOffset, 2800)
			: Math.max(state.alt + activeCraft.spawnAltitudeOffset, 12000)
	});

	updateKoreaMapMode(state.lon, state.lat);

	loadingStatus.cesium = true;
	updateLoadingUI();

	const unregisterGlobeTracker = viewer.scene.postRender.addEventListener(() => {
		const tilesLoaded = viewer.scene.globe.tilesLoaded;

		if (tilesLoaded) {
			const surface = viewer.scene.globe._surface;
			const hasTiles = surface && surface._tilesToRender && surface._tilesToRender.length > 0;

			if (hasTiles) {
				loadingStatus.globe = true;
				updateLoadingUI();
				unregisterGlobeTracker();
			}
		}
	});

	viewer.scene.globe.tileLoadProgressEvent.addEventListener((queueLength) => {
		if (loadingIndicator && loadingText) {
			if (currentState === States.PICK_SPAWN) {
				if (queueLength > 0) {
					loadingText.textContent = "지형 데이터를 불러오는 중...";
					loadingIndicator.classList.remove('hidden');
				} else {
					loadingIndicator.classList.add('hidden');
				}
			} else {
				const isAllLoaded = loadingStatus.audio && loadingStatus.model && loadingStatus.cesium && loadingStatus.globe;
				if (isAllLoaded) {
					loadingIndicator.classList.add('hidden');
				}
			}
		}
	});

	initialCameraView = {
		destination: viewer.camera.position.clone(),
		orientation: {
			heading: viewer.camera.heading,
			pitch: viewer.camera.pitch,
			roll: viewer.camera.roll
		}
	};

	initThree();
	npcSystem = activeCraft.enableNpc
		? new NPCSystem(viewer, scene, new GLTFLoader())
		: null;
	focusFireSystem = new FocusFireSystem(viewer);
	if (focusFireRuntimeState) {
		focusFireSystem.setState(focusFireRuntimeState);
	}
	if (pendingFocusFireBarrage) {
		if (pendingFocusFireBarrage.focusState) {
			focusFireSystem.setState(pendingFocusFireBarrage.focusState);
		}
		focusFireSystem.triggerBarrage({
			bursts: pendingFocusFireBarrage.bursts,
			launchPlatforms: pendingFocusFireBarrage.focusState?.launchPlatforms,
			weaponTracks: pendingFocusFireBarrage.focusState?.weaponTracks
		});
		pendingFocusFireBarrage = null;
	}
	setupSpawnPicker();
	setupLocationSearch();
	loadSettings();
	updateFocusFireMainControl();

	uiContainer.classList.add('hidden');
	threeContainer.classList.add('hidden');

	updateLoadingUI();
	animate();

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);

		const activeViewer = getViewer();
		if (activeViewer?.resize) {
			activeViewer.resize();
		}
	});

	window.addEventListener('contextmenu', (e) => {
		e.preventDefault();
	}, false);
}

bootstrap().catch((error) => {
	console.error('Failed to initialize flight simulator.', error);
	loadingStatus.failed = true;
	updateLoadingUI();
});
