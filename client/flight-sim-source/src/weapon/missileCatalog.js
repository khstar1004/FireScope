const MISSILE_VISUALS = {
	sidewinder: {
		id: 'sidewinder',
		label: 'AIM-9B Sidewinder',
		modelPath: '/3d-bundles/missile/aim-9b_sidewinder.glb',
		desiredLengthM: 3.05,
		renderScale: 2.6,
		bodyTint: 0xd7dce2,
		emissive: 0x11151a,
		exhaustColor: 0xff9d47,
		glowColor: 0xfff0c8,
		smokeColor: 0x8a8279,
		emberColor: 0xffcb7d,
		trailIntervalM: 9.5,
		emberIntervalM: 18,
		smokeLife: 1.8,
		smokeStartScale: 0.56,
		smokeEndScale: 4.6,
		smokeOpacity: 0.58,
		emberLife: 0.48,
		emberStartScale: 0.2,
		emberEndScale: 1.0,
		emberOpacity: 0.92,
		boostDuration: 0.62,
		initialSpeedBonus: 300,
		cruiseSpeedBonus: 760,
		boostSpeedBonus: 1110,
		boostAcceleration: 2850,
		sustainAcceleration: 760,
		turnRateDeg: 128,
		terminalTurnRateDeg: 164,
		proximityRadiusM: 92,
		spinRate: 11.4,
		engineLightIntensity: 2.3,
		engineConeRadius: 0.24,
		engineConeLength: 2.05,
		engineGlowScale: 2.1
	},
	amraamC: {
		id: 'amraamC',
		label: 'AIM-120C AMRAAM',
		modelPath: '/3d-bundles/missile/aim-120c_amraam.glb',
		desiredLengthM: 3.65,
		renderScale: 2.45,
		bodyTint: 0xd9dee5,
		emissive: 0x101419,
		exhaustColor: 0xffa95c,
		glowColor: 0xfff4d8,
		smokeColor: 0x887a6d,
		emberColor: 0xffba63,
		trailIntervalM: 10.5,
		emberIntervalM: 20,
		smokeLife: 2.1,
		smokeStartScale: 0.62,
		smokeEndScale: 5.2,
		smokeOpacity: 0.6,
		emberLife: 0.55,
		emberStartScale: 0.22,
		emberEndScale: 1.08,
		emberOpacity: 0.96,
		boostDuration: 0.78,
		initialSpeedBonus: 340,
		cruiseSpeedBonus: 910,
		boostSpeedBonus: 1280,
		boostAcceleration: 3120,
		sustainAcceleration: 840,
		turnRateDeg: 102,
		terminalTurnRateDeg: 136,
		proximityRadiusM: 108,
		spinRate: 8.8,
		engineLightIntensity: 2.6,
		engineConeRadius: 0.28,
		engineConeLength: 2.3,
		engineGlowScale: 2.24
	},
	amraamLite: {
		id: 'amraamLite',
		label: 'AIM-120 AMRAAM',
		modelPath: '/3d-bundles/missile/aim-120_amraam.glb',
		desiredLengthM: 3.55,
		renderScale: 2.45,
		bodyTint: 0xd6d9de,
		emissive: 0x0f1216,
		exhaustColor: 0xffb46f,
		glowColor: 0xffefd2,
		smokeColor: 0x847a71,
		emberColor: 0xffc784,
		trailIntervalM: 10,
		emberIntervalM: 19,
		smokeLife: 1.95,
		smokeStartScale: 0.58,
		smokeEndScale: 4.9,
		smokeOpacity: 0.56,
		emberLife: 0.5,
		emberStartScale: 0.2,
		emberEndScale: 1.02,
		emberOpacity: 0.9,
		boostDuration: 0.72,
		initialSpeedBonus: 335,
		cruiseSpeedBonus: 880,
		boostSpeedBonus: 1220,
		boostAcceleration: 3000,
		sustainAcceleration: 800,
		turnRateDeg: 98,
		terminalTurnRateDeg: 132,
		proximityRadiusM: 104,
		spinRate: 8.1,
		engineLightIntensity: 2.45,
		engineConeRadius: 0.27,
		engineConeLength: 2.22,
		engineGlowScale: 2.18
	}
};

const MISSILE_VISUAL_IDS = Object.freeze(Object.keys(MISSILE_VISUALS));

export function getDefaultMissileVisualId() {
	return 'sidewinder';
}

export function getMissileVisualIds() {
	return [...MISSILE_VISUAL_IDS];
}

export function getMissileVisualById(id) {
	return MISSILE_VISUALS[id] ?? MISSILE_VISUALS[getDefaultMissileVisualId()];
}

export function selectMissileVisualIdForDistance(distanceM = 0) {
	if (distanceM > 6500) {
		return 'amraamLite';
	}

	if (distanceM > 3600) {
		return 'amraamC';
	}

	return 'sidewinder';
}
