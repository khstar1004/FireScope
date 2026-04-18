const DEFAULT_JET_VISUAL = {
	basePosition: { x: 0, y: -0.8, z: -2.75 },
	baseRotation: { x: 0, y: 0, z: 0 },
	scale: 0.2
};

const DEFAULT_JET_ANIMATION = {
	name: 'flight_mode',
	loop: 'once'
};

const DEFAULT_JET_SETTINGS = {
	mode: 'jet',
	iconPath: 'assets/images/f-15.svg',
	spawnAltitudeOffset: 1500,
	initialAltitude: 1000,
	enableWeapons: true,
	enableNpc: true,
	enableJetFlames: true,
	enableJetAudio: true,
	enableBoost: true,
	enableGpws: true,
	crashClearance: 5,
	visual: DEFAULT_JET_VISUAL,
	animation: DEFAULT_JET_ANIMATION,
	loadingLabel: '전투기 모델을 불러오는 중...'
};

function createJetProfile(profile) {
	return {
		...DEFAULT_JET_SETTINGS,
		...profile,
		visual: {
			...DEFAULT_JET_VISUAL,
			...(profile.visual ?? {}),
			basePosition: {
				...DEFAULT_JET_VISUAL.basePosition,
				...(profile.visual?.basePosition ?? {})
			},
			baseRotation: {
				...DEFAULT_JET_VISUAL.baseRotation,
				...(profile.visual?.baseRotation ?? {})
			}
		},
		animation: {
			...DEFAULT_JET_ANIMATION,
			...(profile.animation ?? {})
		}
	};
}

const SHARED_F15_MODEL_CANDIDATES = [
	'/3d-bundles/aircraft/models/f-15.glb',
	'/3d-bundles/aircraft/models/mcdonnell_douglas_f-15_strike_eagle.glb',
	'/3d-bundles/aircraft/models/low_poly_f-15.glb'
];

const KF21_MODEL_CANDIDATES = [
	'/3d-bundles/aircraft/models/kf-21a_boramae_fighter_jet.glb',
	...SHARED_F15_MODEL_CANDIDATES
];

const KF21_PROFILE = createJetProfile({
	id: 'kf21',
	label: 'KF-21 Boramae',
	hudLabel: 'KF-21',
	modelCandidates: KF21_MODEL_CANDIDATES,
	initialSpeed: 108,
	visual: {
		baseRotation: { y: Math.PI }
	},
	physics: {
		minSpeed: 112,
		maxSpeed: 1060,
		pitchRate: 1.38,
		rollRate: 3.05,
		yawRate: 0.6,
		boostDuration: 2.7,
		boostMultiplier: 1.46
	}
});

const F15_PROFILE = createJetProfile({
	id: 'f15',
	label: 'F-15C Eagle',
	hudLabel: 'F-15C',
	modelCandidates: SHARED_F15_MODEL_CANDIDATES,
	initialSpeed: 110,
	physics: {
		minSpeed: 120,
		maxSpeed: 1100,
		pitchRate: 1.2,
		rollRate: 2.6,
		yawRate: 0.55,
		boostDuration: 2.8,
		boostMultiplier: 1.5
	}
});

const F16_PROFILE = createJetProfile({
	id: 'f16',
	label: 'F-16 Fighting Falcon',
	hudLabel: 'F-16',
	modelCandidates: SHARED_F15_MODEL_CANDIDATES,
	initialSpeed: 105,
	physics: {
		minSpeed: 105,
		maxSpeed: 1025,
		pitchRate: 1.45,
		rollRate: 3.35,
		yawRate: 0.62,
		boostDuration: 2.4,
		boostMultiplier: 1.48
	}
});

const F35_PROFILE = createJetProfile({
	id: 'f35',
	label: 'F-35A Lightning II',
	hudLabel: 'F-35A',
	modelCandidates: SHARED_F15_MODEL_CANDIDATES,
	initialSpeed: 100,
	physics: {
		minSpeed: 115,
		maxSpeed: 970,
		pitchRate: 1.3,
		rollRate: 2.9,
		yawRate: 0.58,
		boostDuration: 3.0,
		boostMultiplier: 1.42
	}
});

export const JET_CRAFT_OPTIONS = [
	{ id: F15_PROFILE.id, label: F15_PROFILE.label },
	{ id: KF21_PROFILE.id, label: KF21_PROFILE.label },
	{ id: F16_PROFILE.id, label: F16_PROFILE.label },
	{ id: F35_PROFILE.id, label: F35_PROFILE.label }
];

export const CRAFT_PROFILES = {
	jet: F15_PROFILE,
	kf21: KF21_PROFILE,
	f15: F15_PROFILE,
	f16: F16_PROFILE,
	f35: F35_PROFILE,
	drone: {
		id: 'drone',
		label: '드론',
		hudLabel: '드론',
		mode: 'drone',
		modelCandidates: [
			'/3d-bundles/drone/models/animated_drone.glb',
			'/3d-bundles/drone/models/drone.glb'
		],
		iconPath: null,
		spawnAltitudeOffset: 60,
		initialAltitude: 60,
		initialSpeed: 0,
		enableWeapons: false,
		enableNpc: false,
		enableJetFlames: false,
		enableJetAudio: false,
		enableBoost: false,
		enableGpws: false,
		crashClearance: 2,
		visual: {
			basePosition: { x: 0, y: -0.55, z: -2.25 },
			scale: 2.2
		},
		animation: {
			name: null,
			loop: 'repeat'
		},
		loadingLabel: '드론 모델을 불러오는 중...'
	}
};

export function getCraftProfile(craftId) {
	return CRAFT_PROFILES[craftId] ?? CRAFT_PROFILES.jet;
}
