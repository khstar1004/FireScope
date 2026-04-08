import * as THREE from 'three';
import * as Cesium from 'cesium';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { movePosition } from '../utils/math';
import { particles } from '../utils/particles';
import { soundManager } from '../utils/soundManager';
import { resolveAssetUrl as assetUrl } from '../utils/assetPaths';
import {
	getDefaultMissileVisualId,
	getMissileVisualById
} from './missileCatalog';

const missileLoader = new GLTFLoader();
const missileTemplateCache = new Map();
const missileTemplatePromiseCache = new Map();
let missileSpriteTextures = null;

function buildSpriteTexture(size, draw) {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	const context = canvas.getContext('2d');
	draw(context, size);

	const texture = new THREE.CanvasTexture(canvas);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	return texture;
}

function getMissileSpriteTextures() {
	if (missileSpriteTextures) {
		return missileSpriteTextures;
	}

	missileSpriteTextures = {
		glow: buildSpriteTexture(128, (context, size) => {
			const center = size / 2;
			const gradient = context.createRadialGradient(
				center,
				center,
				0,
				center,
				center,
				center
			);
			gradient.addColorStop(0, 'rgba(255,255,255,1)');
			gradient.addColorStop(0.18, 'rgba(255,242,214,0.98)');
			gradient.addColorStop(0.44, 'rgba(255,179,92,0.82)');
			gradient.addColorStop(0.72, 'rgba(255,96,28,0.26)');
			gradient.addColorStop(1, 'rgba(0,0,0,0)');
			context.fillStyle = gradient;
			context.fillRect(0, 0, size, size);
		}),
		smoke: buildSpriteTexture(128, (context, size) => {
			const center = size / 2;
			const gradient = context.createRadialGradient(
				center,
				center,
				size * 0.08,
				center,
				center,
				size * 0.5
			);
			gradient.addColorStop(0, 'rgba(255,255,255,0.92)');
			gradient.addColorStop(0.25, 'rgba(220,220,220,0.72)');
			gradient.addColorStop(0.62, 'rgba(104,104,104,0.3)');
			gradient.addColorStop(1, 'rgba(0,0,0,0)');
			context.fillStyle = gradient;
			context.fillRect(0, 0, size, size);
		}),
		spark: buildSpriteTexture(96, (context, size) => {
			const center = size / 2;
			const gradient = context.createRadialGradient(
				center,
				center,
				0,
				center,
				center,
				center
			);
			gradient.addColorStop(0, 'rgba(255,255,255,1)');
			gradient.addColorStop(0.24, 'rgba(255,242,181,0.98)');
			gradient.addColorStop(0.48, 'rgba(255,177,74,0.84)');
			gradient.addColorStop(1, 'rgba(0,0,0,0)');
			context.fillStyle = gradient;
			context.fillRect(0, 0, size, size);
		})
	};

	return missileSpriteTextures;
}

function enableMissileLayers(object3D) {
	object3D.layers.enable(0);
	object3D.layers.enable(1);
}

function cloneConfiguredMaterial(material, visual) {
	if (!material || typeof material.clone !== 'function') {
		return material;
	}

	const nextMaterial = material.clone();
	const tintColor = new THREE.Color(visual.bodyTint);

	if (nextMaterial.color) {
		nextMaterial.color.lerp(tintColor, 0.28);
	}

	if ('metalness' in nextMaterial) {
		nextMaterial.metalness = Math.max(0.28, nextMaterial.metalness ?? 0.28);
	}

	if ('roughness' in nextMaterial) {
		nextMaterial.roughness = Math.min(0.72, nextMaterial.roughness ?? 0.72);
	}

	if ('emissive' in nextMaterial) {
		nextMaterial.emissive = new THREE.Color(visual.emissive);
		nextMaterial.emissiveIntensity = 0.14;
	}

	return nextMaterial;
}

function orientModelAlongForwardAxis(modelRoot) {
	const initialBounds = new THREE.Box3().setFromObject(modelRoot);
	const initialSize = initialBounds.getSize(new THREE.Vector3());

	if (initialSize.x > initialSize.y && initialSize.x > initialSize.z) {
		modelRoot.rotation.z = -Math.PI / 2;
		return;
	}

	if (initialSize.z > initialSize.y && initialSize.z > initialSize.x) {
		modelRoot.rotation.x = -Math.PI / 2;
	}
}

function prepareMissileTemplate(sourceRoot, visual) {
	const root = sourceRoot.clone(true);

	root.traverse((child) => {
		enableMissileLayers(child);
		if (!child.isMesh) {
			return;
		}

		child.castShadow = false;
		child.receiveShadow = false;

		if (Array.isArray(child.material)) {
			child.material = child.material.map((material) =>
				cloneConfiguredMaterial(material, visual)
			);
			return;
		}

		child.material = cloneConfiguredMaterial(child.material, visual);
	});

	orientModelAlongForwardAxis(root);
	root.updateMatrixWorld(true);

	let bounds = new THREE.Box3().setFromObject(root);
	const size = bounds.getSize(new THREE.Vector3());
	const longestLength = Math.max(size.x, size.y, size.z) || 1;
	const visibleLength =
		visual.desiredLengthM * (visual.renderScale ?? 1);
	const scale = visibleLength / longestLength;
	root.scale.setScalar(scale);
	root.updateMatrixWorld(true);

	bounds = new THREE.Box3().setFromObject(root);
	const center = bounds.getCenter(new THREE.Vector3());
	root.position.sub(center);
	root.updateMatrixWorld(true);

	bounds = new THREE.Box3().setFromObject(root);
	const template = new THREE.Group();
	template.add(root);
	enableMissileLayers(template);
	template.userData.tailY = bounds.min.y;

	return template;
}

async function loadMissileTemplate(visual) {
	if (missileTemplateCache.has(visual.id)) {
		return missileTemplateCache.get(visual.id);
	}

	if (missileTemplatePromiseCache.has(visual.id)) {
		return missileTemplatePromiseCache.get(visual.id);
	}

	const promise = missileLoader
		.loadAsync(assetUrl(visual.modelPath, `Missile ${visual.label}`))
		.then((gltf) => {
			const sourceRoot = gltf?.scene ?? gltf?.scenes?.[0];
			if (!sourceRoot) {
				throw new Error(`Missile model ${visual.modelPath} is empty.`);
			}

			const template = prepareMissileTemplate(sourceRoot, visual);
			missileTemplateCache.set(visual.id, template);
			return template;
		})
		.catch((error) => {
			console.warn(`Failed to load missile model ${visual.modelPath}.`, error);
			return null;
		})
		.finally(() => {
			missileTemplatePromiseCache.delete(visual.id);
		});

	missileTemplatePromiseCache.set(visual.id, promise);
	return promise;
}

function cloneMissileTemplate(template) {
	const clone = template.clone(true);
	clone.userData = { ...template.userData };
	clone.traverse((child) => {
		enableMissileLayers(child);
	});
	return clone;
}

function approachValue(current, target, maxDelta) {
	const delta = target - current;
	if (Math.abs(delta) <= maxDelta) {
		return target;
	}

	return current + Math.sign(delta) * maxDelta;
}

function approachAngleDeg(current, target, maxDelta) {
	let delta = target - current;
	while (delta < -180) delta += 360;
	while (delta > 180) delta -= 360;
	return current + Math.max(-maxDelta, Math.min(maxDelta, delta));
}

function createFallbackMissileBody(visual) {
	const group = new THREE.Group();
	enableMissileLayers(group);

	const bodyLength =
		visual.desiredLengthM * (visual.renderScale ?? 1) * 0.82;
	const bodyRadius = bodyLength * 0.052;

	const bodyGeometry = new THREE.CylinderGeometry(
		bodyRadius,
		bodyRadius,
		bodyLength,
		18
	);
	const bodyMaterial = new THREE.MeshStandardMaterial({
		color: visual.bodyTint,
		metalness: 0.42,
		roughness: 0.48,
		emissive: new THREE.Color(visual.emissive),
		emissiveIntensity: 0.12
	});
	const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
	group.add(body);

	const noseLength = bodyLength * 0.14;
	const noseGeometry = new THREE.ConeGeometry(bodyRadius, noseLength, 18);
	noseGeometry.translate(0, bodyLength * 0.5 + noseLength * 0.5, 0);
	const nose = new THREE.Mesh(
		noseGeometry,
		new THREE.MeshStandardMaterial({
			color: 0x343a40,
			metalness: 0.64,
			roughness: 0.28
		})
	);
	group.add(nose);

	const bandGeometry = new THREE.CylinderGeometry(
		bodyRadius * 1.05,
		bodyRadius * 1.05,
		bodyLength * 0.06,
		18
	);
	bandGeometry.translate(0, bodyLength * 0.18, 0);
	group.add(
		new THREE.Mesh(
			bandGeometry,
			new THREE.MeshBasicMaterial({ color: 0xf6c04d })
		)
	);

	const finGeometry = new THREE.BoxGeometry(
		bodyRadius * 3.8,
		bodyLength * 0.16,
		bodyRadius * 0.18
	);
	finGeometry.translate(bodyRadius * 1.9, -bodyLength * 0.28, 0);
	const finMaterial = new THREE.MeshStandardMaterial({
		color: 0x515861,
		metalness: 0.3,
		roughness: 0.62
	});
	for (let index = 0; index < 4; index += 1) {
		const fin = new THREE.Mesh(finGeometry, finMaterial);
		fin.rotation.y = index * (Math.PI / 2);
		group.add(fin);
	}

	return {
		group,
		tailY: -(bodyLength * 0.5) - 0.04
	};
}

export class Missile {
	constructor(
		scene,
		viewer,
		startPos,
		heading,
		pitch,
		speed,
		target = null,
		onKill = null,
		options = {}
	) {
		this.scene = scene;
		this.viewer = viewer;
		this.target = target;
		this.onKill = onKill;
		this.onDetonate = options.onDetonate ?? null;
		this.visual = getMissileVisualById(
			options.visualId ?? getDefaultMissileVisualId()
		);
		this.isMissile = true;
		this.hasDetonated = false;

		this.lon = startPos.lon;
		this.lat = startPos.lat;
		this.alt = startPos.alt;
		this.heading = heading;
		this.pitch = pitch;
		this.roll = Math.random() * Math.PI * 2;

		this.speed = Math.max(420, speed + this.visual.initialSpeedBonus);
		this.cruiseSpeed = Math.max(
			this.speed + 120,
			speed + this.visual.cruiseSpeedBonus
		);
		this.boostSpeed = Math.max(
			this.cruiseSpeed + 180,
			speed + this.visual.boostSpeedBonus
		);
		this.boostTimeRemaining = this.visual.boostDuration;

		this.maxLife = 10;
		this.life = this.maxLife;
		this.active = true;

		this._scratchMatrix = new Cesium.Matrix4();
		this._scratchCartesian = new Cesium.Cartesian3();
		this._scratchThreeMatrix = new THREE.Matrix4();
		this._scratchCameraMatrix = new Cesium.Matrix4();
		this._scratchRight = new Cesium.Cartesian3();
		this._scratchForward = new Cesium.Cartesian3();
		this._scratchUp = new Cesium.Cartesian3();
		this._scratchRollQuaternion = new Cesium.Quaternion();
		this._scratchRollMatrix = new Cesium.Matrix3();

		this.trail = [];
		this.distanceSinceLastTrail = 0;
		this.distanceSinceLastEmber = 0;

		this.initMesh();
	}

	emitDetonation(type, extra = {}) {
		if (this.hasDetonated || typeof this.onDetonate !== 'function') {
			this.hasDetonated = true;
			return;
		}

		this.hasDetonated = true;
		this.onDetonate({
			type,
			missile: this,
			target: extra.target ?? null,
			lon: this.lon,
			lat: this.lat,
			alt: this.alt,
			heading: this.heading,
			pitch: this.pitch
		});
	}

	initMesh() {
		const textures = getMissileSpriteTextures();
		this.mesh = new THREE.Group();
		enableMissileLayers(this.mesh);

		this.modelMount = new THREE.Group();
		enableMissileLayers(this.modelMount);
		this.mesh.add(this.modelMount);

		const fallback = createFallbackMissileBody(this.visual);
		this.fallbackBody = fallback.group;
		this.modelMount.add(this.fallbackBody);

		this.exhaustAnchor = new THREE.Group();
		enableMissileLayers(this.exhaustAnchor);
		this.exhaustAnchor.position.y = fallback.tailY;
		this.mesh.add(this.exhaustAnchor);

		const outerFlameGeometry = new THREE.ConeGeometry(1, 1, 18, 1, true);
		outerFlameGeometry.rotateX(Math.PI);
		outerFlameGeometry.translate(0, -0.5, 0);
		this.outerFlame = new THREE.Mesh(
			outerFlameGeometry,
			new THREE.MeshBasicMaterial({
				color: this.visual.exhaustColor,
				transparent: true,
				opacity: 0.82,
				side: THREE.DoubleSide,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		enableMissileLayers(this.outerFlame);
		this.exhaustAnchor.add(this.outerFlame);

		const innerFlameGeometry = new THREE.ConeGeometry(1, 1, 14, 1, true);
		innerFlameGeometry.rotateX(Math.PI);
		innerFlameGeometry.translate(0, -0.5, 0);
		this.innerFlame = new THREE.Mesh(
			innerFlameGeometry,
			new THREE.MeshBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: 0.94,
				side: THREE.DoubleSide,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		enableMissileLayers(this.innerFlame);
		this.exhaustAnchor.add(this.innerFlame);

		this.engineGlow = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: textures.glow,
				color: this.visual.glowColor,
				transparent: true,
				opacity: 0.98,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		enableMissileLayers(this.engineGlow);
		this.engineGlow.position.y = -0.08;
		this.exhaustAnchor.add(this.engineGlow);

		this.forwardGlow = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: textures.glow,
				color: 0xfff5da,
				transparent: true,
				opacity: 0.34,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		enableMissileLayers(this.forwardGlow);
		this.forwardGlow.position.y =
			this.visual.desiredLengthM * (this.visual.renderScale ?? 1) * 0.45;
		this.mesh.add(this.forwardGlow);

		this.engineHotCore = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: textures.spark,
				color: 0xffffff,
				transparent: true,
				opacity: 0.95,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		enableMissileLayers(this.engineHotCore);
		this.engineHotCore.position.y = -0.06;
		this.exhaustAnchor.add(this.engineHotCore);

		this.engineLight = new THREE.PointLight(
			this.visual.exhaustColor,
			this.visual.engineLightIntensity,
			22,
			2
		);
		enableMissileLayers(this.engineLight);
		this.engineLight.position.y = -0.02;
		this.exhaustAnchor.add(this.engineLight);

		this.mesh.matrixAutoUpdate = false;
		this.scene.add(this.mesh);

		this.loadVisualModel();
		this.updateEngineVisuals();
	}

	async loadVisualModel() {
		const template = await loadMissileTemplate(this.visual);
		if (!template || !this.active || !this.mesh) {
			return;
		}

		const model = cloneMissileTemplate(template);
		this.modelMount.clear();
		this.modelMount.add(model);
		this.exhaustAnchor.position.y = model.userData.tailY ?? this.exhaustAnchor.position.y;
	}

	updatePropulsion(dt) {
		if (this.boostTimeRemaining > 0) {
			this.boostTimeRemaining = Math.max(0, this.boostTimeRemaining - dt);
			this.speed = Math.min(
				this.boostSpeed,
				this.speed + this.visual.boostAcceleration * dt
			);
			return;
		}

		this.speed = Math.min(
			this.cruiseSpeed,
			this.speed + this.visual.sustainAcceleration * dt
		);
	}

	updateEngineVisuals() {
		const boostRatio =
			this.visual.boostDuration > 0
				? this.boostTimeRemaining / this.visual.boostDuration
				: 0;
		const flicker = 0.9 + Math.random() * 0.18;
		const outerLength =
			this.visual.engineConeLength * (0.92 + boostRatio * 0.72) * flicker;
		const outerRadius =
			this.visual.engineConeRadius * (0.96 + boostRatio * 0.24);
		const innerLength = outerLength * 0.62;
		const innerRadius = outerRadius * 0.44;

		this.outerFlame.scale.set(outerRadius, outerLength, outerRadius);
		this.outerFlame.material.opacity = 0.62 + boostRatio * 0.22;

		this.innerFlame.scale.set(innerRadius, innerLength, innerRadius);
		this.innerFlame.material.opacity = 0.9;

		const glowScale = this.visual.engineGlowScale * (1 + boostRatio * 0.4);
		this.engineGlow.scale.set(glowScale, glowScale, 1);
		this.engineGlow.material.opacity = 0.74 + boostRatio * 0.18;
		this.forwardGlow.scale.set(
			glowScale * 0.86,
			glowScale * 0.86,
			1
		);
		this.forwardGlow.material.opacity = 0.16 + boostRatio * 0.08;

		const hotCoreScale = 0.46 + boostRatio * 0.12;
		this.engineHotCore.scale.set(hotCoreScale, hotCoreScale, 1);
		this.engineHotCore.material.opacity = 0.95;

		this.engineLight.intensity =
			this.visual.engineLightIntensity * (0.92 + boostRatio * 0.26);
	}

	update(dt, npcs) {
		if (!this.active) {
			if (this.trail.length > 0) {
				this.updateTrail(dt);
			}
			return;
		}

		this.life -= dt;
		if (this.life <= 0) {
			this.destroy();
			return;
		}

		this.updatePropulsion(dt);
		this.roll =
			(this.roll + dt * this.visual.spinRate) % (Math.PI * 2);
		this.updateEngineVisuals();

		if (this.target && !this.target.destroyed) {
			this.trackTarget(dt);
		}

		const newPos = movePosition(
			this.lon,
			this.lat,
			this.alt,
			this.heading,
			this.pitch,
			this.speed * dt
		);
		this.lon = newPos.lon;
		this.lat = newPos.lat;
		this.alt = newPos.alt;

		this.updateTrail(dt);
		this.updateThreeMatrix();

		if (npcs) {
			const proximityRadiusSq =
				this.visual.proximityRadiusM * this.visual.proximityRadiusM;
			for (const npc of npcs) {
				const distSq = this.calculateDistSqToNPC(npc);
				if (distSq < proximityRadiusSq) {
					this.hitNPC(npc);
					return;
				}
			}
		}

		this.checkTerrainCollision();
	}

	trackTarget(dt) {
		const targetPos = Cesium.Cartesian3.fromDegrees(
			this.target.lon,
			this.target.lat,
			this.target.alt
		);
		const myPos = Cesium.Cartesian3.fromDegrees(this.lon, this.lat, this.alt);

		const direction = Cesium.Cartesian3.subtract(
			targetPos,
			myPos,
			new Cesium.Cartesian3()
		);
		const targetDistance =
			Cesium.Cartesian3.magnitude(direction) || 1;
		Cesium.Cartesian3.normalize(direction, direction);

		const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(myPos);
		const invEnu = Cesium.Matrix4.inverse(
			enuMatrix,
			new Cesium.Matrix4()
		);
		const localDir = Cesium.Matrix4.multiplyByPointAsVector(
			invEnu,
			direction,
			new Cesium.Cartesian3()
		);

		const targetHeading = Cesium.Math.toDegrees(
			Math.atan2(localDir.x, localDir.y)
		);
		const targetPitch = Cesium.Math.toDegrees(
			Math.asin(localDir.z)
		);
		const desiredPitch =
			this.boostTimeRemaining > 0.16 && targetDistance > 2800
				? Math.max(targetPitch, 8)
				: targetPitch;
		const turnRate =
			targetDistance < 1400
				? this.visual.terminalTurnRateDeg
				: this.visual.turnRateDeg;

		this.heading = approachAngleDeg(
			this.heading,
			targetHeading,
			turnRate * dt
		);
		this.pitch = approachValue(
			this.pitch,
			desiredPitch,
			turnRate * 0.82 * dt
		);
	}

	spawnTrailParticle(spawnPos, kind, boostRatio) {
		const textures = getMissileSpriteTextures();
		const isSmoke = kind === 'smoke';
		const sprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: isSmoke ? textures.smoke : textures.spark,
				color: isSmoke ? this.visual.smokeColor : this.visual.emberColor,
				transparent: true,
				opacity: isSmoke
					? this.visual.smokeOpacity
					: this.visual.emberOpacity,
				blending: isSmoke
					? THREE.NormalBlending
					: THREE.AdditiveBlending,
				depthWrite: false
			})
		);
		enableMissileLayers(sprite);
		sprite.matrixAutoUpdate = false;

		sprite.lon = spawnPos.lon;
		sprite.lat = spawnPos.lat;
		sprite.alt = spawnPos.alt;
		sprite.isSmoke = isSmoke;
		sprite.life = isSmoke ? this.visual.smokeLife : this.visual.emberLife;
		sprite.maxLife = sprite.life;
		sprite._scaleStart = isSmoke
			? this.visual.smokeStartScale * (0.95 + boostRatio * 0.1)
			: this.visual.emberStartScale;
		sprite._scaleEnd = isSmoke
			? this.visual.smokeEndScale * (0.92 + boostRatio * 0.18)
			: this.visual.emberEndScale;
		sprite._opacityStart = isSmoke
			? this.visual.smokeOpacity
			: this.visual.emberOpacity;
		sprite._spinSpeed = (Math.random() - 0.5) * (isSmoke ? 0.8 : 3.8);
		sprite._localVel = isSmoke
			? {
					east: (Math.random() - 0.5) * 2.2,
					north: (Math.random() - 0.5) * 2.2,
					up: 0.9 + Math.random() * 1.8
				}
			: {
					east: (Math.random() - 0.5) * 1.1,
					north: (Math.random() - 0.5) * 1.1,
					up: 0.2 + Math.random() * 0.6
				};

		this.scene.add(sprite);
		this.trail.push(sprite);
	}

	updateTrail(dt) {
		if (this.active) {
			const travelledDistance = this.speed * dt;
			const boostRatio =
				this.visual.boostDuration > 0
					? this.boostTimeRemaining / this.visual.boostDuration
					: 0;
			const trailInterval = THREE.MathUtils.lerp(
				this.visual.trailIntervalM,
				this.visual.trailIntervalM * 0.58,
				boostRatio
			);

			this.distanceSinceLastTrail += travelledDistance;
			while (this.distanceSinceLastTrail >= trailInterval) {
				const backDistance = this.distanceSinceLastTrail - trailInterval;
				const spawnPos = movePosition(
					this.lon,
					this.lat,
					this.alt,
					this.heading,
					this.pitch,
					-backDistance
				);

				this.distanceSinceLastTrail -= trailInterval;
				this.spawnTrailParticle(spawnPos, 'smoke', boostRatio);
			}

			if (boostRatio > 0.04 || this.life > this.maxLife * 0.55) {
				this.distanceSinceLastEmber += travelledDistance;
				while (this.distanceSinceLastEmber >= this.visual.emberIntervalM) {
					const backDistance =
						this.distanceSinceLastEmber - this.visual.emberIntervalM;
					const emberPos = movePosition(
						this.lon,
						this.lat,
						this.alt,
						this.heading,
						this.pitch,
						-backDistance
					);

					this.distanceSinceLastEmber -= this.visual.emberIntervalM;
					this.spawnTrailParticle(emberPos, 'ember', boostRatio);
				}
			}
		}

		const viewMatrix = this.viewer.camera.viewMatrix;
		for (let index = this.trail.length - 1; index >= 0; index -= 1) {
			const particle = this.trail[index];
			particle.life -= dt * (particle.isSmoke ? 0.9 : 1.18);

			if (particle.life <= 0) {
				this.scene.remove(particle);
				this.trail.splice(index, 1);
				continue;
			}

			particle._localVel.east *= particle.isSmoke ? 0.994 : 0.972;
			particle._localVel.north *= particle.isSmoke ? 0.994 : 0.972;
			particle._localVel.up += (particle.isSmoke ? 0.42 : -5.2) * dt;

			const latRad = Cesium.Math.toRadians(particle.lat);
			particle.lon +=
				(particle._localVel.east * dt) /
				(111320 * Math.max(Math.cos(latRad), 0.01));
			particle.lat += (particle._localVel.north * dt) / 111320;
			particle.alt += particle._localVel.up * dt;

			const progress = 1 - particle.life / particle.maxLife;
			const scale = THREE.MathUtils.lerp(
				particle._scaleStart,
				particle._scaleEnd,
				progress
			);
			particle.material.opacity =
				particle._opacityStart *
				Math.pow(particle.life / particle.maxLife, particle.isSmoke ? 1.18 : 0.72);
			particle.material.rotation += particle._spinSpeed * dt;

			const pos = Cesium.Cartesian3.fromDegrees(
				particle.lon,
				particle.lat,
				particle.alt,
				undefined,
				this._scratchCartesian
			);
			const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
				pos,
				undefined,
				this._scratchMatrix
			);
			const cameraSpaceMatrix = Cesium.Matrix4.multiply(
				viewMatrix,
				modelMatrix,
				this._scratchCameraMatrix
			);

			for (let elementIndex = 0; elementIndex < 16; elementIndex += 1) {
				this._scratchThreeMatrix.elements[elementIndex] =
					cameraSpaceMatrix[elementIndex];
			}

			particle.matrix.copy(this._scratchThreeMatrix);
			particle.matrix.scale(new THREE.Vector3(scale, scale, scale));
			particle.updateMatrixWorld(true);
		}
	}

	updateThreeMatrix() {
		const viewMatrix = this.viewer.camera.viewMatrix;
		const pos = Cesium.Cartesian3.fromDegrees(
			this.lon,
			this.lat,
			this.alt,
			undefined,
			this._scratchCartesian
		);

		const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
			pos,
			undefined,
			this._scratchMatrix
		);
		const headingRad = Cesium.Math.toRadians(this.heading);
		const pitchRad = Cesium.Math.toRadians(this.pitch);

		const localForward = new Cesium.Cartesian3(
			Math.sin(headingRad) * Math.cos(pitchRad),
			Math.cos(headingRad) * Math.cos(pitchRad),
			Math.sin(pitchRad)
		);
		const worldForward = Cesium.Matrix4.multiplyByPointAsVector(
			enuMatrix,
			localForward,
			this._scratchForward
		);
		Cesium.Cartesian3.normalize(worldForward, worldForward);

		const enuUp = new Cesium.Cartesian3(
			enuMatrix[8],
			enuMatrix[9],
			enuMatrix[10]
		);
		let worldRight = this._scratchRight;
		if (Math.abs(Cesium.Cartesian3.dot(worldForward, enuUp)) > 0.999) {
			const enuNorth = new Cesium.Cartesian3(
				enuMatrix[4],
				enuMatrix[5],
				enuMatrix[6]
			);
			Cesium.Cartesian3.cross(worldForward, enuNorth, worldRight);
		} else {
			Cesium.Cartesian3.cross(worldForward, enuUp, worldRight);
		}
		Cesium.Cartesian3.normalize(worldRight, worldRight);

		const worldUp = Cesium.Cartesian3.cross(
			worldRight,
			worldForward,
			this._scratchUp
		);
		Cesium.Cartesian3.normalize(worldUp, worldUp);

		Cesium.Quaternion.fromAxisAngle(
			worldForward,
			this.roll,
			this._scratchRollQuaternion
		);
		Cesium.Matrix3.fromQuaternion(
			this._scratchRollQuaternion,
			this._scratchRollMatrix
		);
		worldRight = Cesium.Matrix3.multiplyByVector(
			this._scratchRollMatrix,
			worldRight,
			worldRight
		);
		const rolledUp = Cesium.Matrix3.multiplyByVector(
			this._scratchRollMatrix,
			worldUp,
			worldUp
		);

		const finalModelMatrix = this._scratchMatrix;
		finalModelMatrix[0] = worldRight.x;
		finalModelMatrix[1] = worldRight.y;
		finalModelMatrix[2] = worldRight.z;
		finalModelMatrix[3] = 0;
		finalModelMatrix[4] = worldForward.x;
		finalModelMatrix[5] = worldForward.y;
		finalModelMatrix[6] = worldForward.z;
		finalModelMatrix[7] = 0;
		finalModelMatrix[8] = rolledUp.x;
		finalModelMatrix[9] = rolledUp.y;
		finalModelMatrix[10] = rolledUp.z;
		finalModelMatrix[11] = 0;
		finalModelMatrix[12] = pos.x;
		finalModelMatrix[13] = pos.y;
		finalModelMatrix[14] = pos.z;
		finalModelMatrix[15] = 1;

		const cameraSpaceMatrix = Cesium.Matrix4.multiply(
			viewMatrix,
			finalModelMatrix,
			this._scratchCameraMatrix
		);

		for (let elementIndex = 0; elementIndex < 16; elementIndex += 1) {
			this._scratchThreeMatrix.elements[elementIndex] =
				cameraSpaceMatrix[elementIndex];
		}

		this.mesh.matrix.copy(this._scratchThreeMatrix);
		this.mesh.updateMatrixWorld(true);
	}

	calculateDistSqToNPC(npc) {
		const dLon =
			(npc.lon - this.lon) *
			111320 *
			Math.cos(Cesium.Math.toRadians(this.lat));
		const dLat = (npc.lat - this.lat) * 111320;
		const dAlt = npc.alt - this.alt;
		return dLon * dLon + dLat * dLat + dAlt * dAlt;
	}

	hitNPC(npc) {
		npc.destroyed = true;
		if (this.onKill) {
			this.onKill(npc);
		}
		this.emitDetonation('npc', { target: npc });

		try {
			particles.spawnExplosion(this.lon, this.lat, this.alt, {
				count: 84,
				smokeCount: 22,
				sparkCount: 38,
				big: true
			});
			particles.spawnSpark(this.lon, this.lat, this.alt, {
				count: 24
			});
			particles.spawnWreckage(this.lon, this.lat, this.alt, this.heading, this.pitch, {
				count: 56,
				sizeMultiplier: 1.45,
				speedMultiplier: 1.3,
				lifeMultiplier: 1.2,
				hotShardRatio: 0.55
			});
			soundManager.play('explosion-random');
		} catch (error) {
			console.warn('Missile hit effect failed.', error);
		}

		this.destroy();
	}

	checkTerrainCollision() {
		const cartographic = Cesium.Cartographic.fromDegrees(this.lon, this.lat);
		const terrainHeight = this.viewer.scene.globe.getHeight(cartographic);
		if (terrainHeight !== undefined && this.alt < terrainHeight) {
			this.emitDetonation('terrain');
			try {
				particles.spawnExplosion(this.lon, this.lat, this.alt, {
					count: 68,
					smokeCount: 24,
					sparkCount: 28,
					big: false
				});
				particles.spawnSpark(this.lon, this.lat, this.alt, {
					count: 18
				});
				particles.spawnWreckage(this.lon, this.lat, this.alt, this.heading, this.pitch, {
					count: 28,
					sizeMultiplier: 1.2,
					speedMultiplier: 1.15,
					lifeMultiplier: 1.08,
					fallMultiplier: 2.8,
					hotShardRatio: 0.42
				});
				soundManager.play('explosion-random');
			} catch (error) {
				console.warn('Missile terrain impact effect failed.', error);
			}

			this.destroy();
		}
	}

	destroy() {
		this.active = false;
		if (this.mesh) {
			this.scene.remove(this.mesh);
		}
	}
}
