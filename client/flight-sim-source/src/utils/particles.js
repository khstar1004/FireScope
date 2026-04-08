import * as THREE from 'three';
import * as Cesium from 'cesium';

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

const particles = {
	scene: null,
	viewer: null,
	list: [],
	_textures: null,
	_scratchMatrix: new Cesium.Matrix4(),
	_scratchCameraMatrix: new Cesium.Matrix4(),
	_scratchThreeMatrix: new THREE.Matrix4(),
	_scratchCartesian: new Cesium.Cartesian3(),

	init(scene, viewer) {
		this.scene = scene;
		this.viewer = viewer;
	},

	ensureTextures() {
		if (this._textures) {
			return this._textures;
		}

		this._textures = {
			fire: buildSpriteTexture(128, (context, size) => {
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
				gradient.addColorStop(0.16, 'rgba(255,247,212,0.98)');
				gradient.addColorStop(0.34, 'rgba(255,187,84,0.92)');
				gradient.addColorStop(0.58, 'rgba(255,96,24,0.54)');
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
				gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
				gradient.addColorStop(0.24, 'rgba(208,208,208,0.68)');
				gradient.addColorStop(0.6, 'rgba(108,108,108,0.28)');
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
				gradient.addColorStop(0.24, 'rgba(255,242,190,0.98)');
				gradient.addColorStop(0.5, 'rgba(255,170,74,0.82)');
				gradient.addColorStop(1, 'rgba(0,0,0,0)');
				context.fillStyle = gradient;
				context.fillRect(0, 0, size, size);
			}),
			ring: buildSpriteTexture(160, (context, size) => {
				const center = size / 2;
				context.clearRect(0, 0, size, size);
				context.strokeStyle = 'rgba(255,229,194,0.95)';
				context.lineWidth = size * 0.08;
				context.beginPath();
				context.arc(center, center, size * 0.28, 0, Math.PI * 2);
				context.stroke();
				const glow = context.createRadialGradient(
					center,
					center,
					size * 0.18,
					center,
					center,
					size * 0.5
				);
				glow.addColorStop(0, 'rgba(255,255,255,0)');
				glow.addColorStop(0.45, 'rgba(255,188,102,0.2)');
				glow.addColorStop(1, 'rgba(0,0,0,0)');
				context.fillStyle = glow;
				context.fillRect(0, 0, size, size);
			})
		};

		return this._textures;
	},

	enableLayers(object3D) {
		object3D.layers.enable(0);
		object3D.layers.enable(1);
	},

	addBillboardParticle(options) {
		const sprite = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: options.texture,
				color: options.color,
				transparent: true,
				opacity: options.opacity,
				blending: options.blending ?? THREE.AdditiveBlending,
				depthWrite: false
			})
		);

		this.enableLayers(sprite);
		sprite.matrixAutoUpdate = false;
		sprite.lon = options.lon;
		sprite.lat = options.lat;
		sprite.alt = options.alt;
		sprite.life = options.life;
		sprite.maxLife = options.life;
		sprite.isSmoke = Boolean(options.isSmoke);
		sprite._scaleStart = options.scaleStart;
		sprite._scaleEnd = options.scaleEnd ?? options.scaleStart;
		sprite._opacityStart = options.opacity;
		sprite._drag = options.drag ?? 0;
		sprite._gravityMultiplier = options.gravityMultiplier ?? 0;
		sprite._riseBias = options.riseBias ?? 0;
		sprite._spinSpeed = options.spinSpeed ?? 0;
		sprite._fadePower = options.fadePower ?? 1;
		sprite._localVel = {
			east: options.velocity?.east ?? 0,
			north: options.velocity?.north ?? 0,
			up: options.velocity?.up ?? 0
		};

		this.scene.add(sprite);
		this.list.push(sprite);
		return sprite;
	},

	spawnExplosion(lon, lat, alt, opts = {}) {
		const textures = this.ensureTextures();
		const isBig = Boolean(opts.big);
		const fireCount = opts.count || (isBig ? 48 : 26);
		const smokeCount =
			typeof opts.smokeCount !== 'undefined'
				? opts.smokeCount
				: isBig
					? 12
					: 7;
		const sparkCount = opts.sparkCount || (isBig ? 28 : 16);

		this.addBillboardParticle({
			texture: textures.fire,
			color: 0xffffff,
			opacity: 1,
			lon,
			lat,
			alt,
			life: isBig ? 0.2 : 0.14,
			scaleStart: isBig ? 2.8 : 1.8,
			scaleEnd: isBig ? 10.2 : 6.1,
			gravityMultiplier: 0,
			riseBias: 0,
			spinSpeed: 0,
			fadePower: 1.65
		});

		this.addBillboardParticle({
			texture: textures.ring,
			color: 0xffd3a1,
			opacity: 0.86,
			lon,
			lat,
			alt,
			life: isBig ? 0.5 : 0.36,
			scaleStart: isBig ? 1.4 : 0.9,
			scaleEnd: isBig ? 16.5 : 11.5,
			gravityMultiplier: 0,
			riseBias: 0,
			spinSpeed: 0,
			fadePower: 1.25
		});

		for (let index = 0; index < fireCount; index += 1) {
			const heading = Math.random() * Math.PI * 2;
			const pitch = (Math.random() * 120 - 50) * (Math.PI / 180);
			const speed = (isBig ? 24 : 12) + Math.random() * (isBig ? 68 : 34);
			const hue = 0.05 + Math.random() * 0.05;
			const saturation = 0.9 + Math.random() * 0.1;
			const lightness = 0.56 + Math.random() * 0.14;

			this.addBillboardParticle({
				texture: textures.fire,
				color: new THREE.Color().setHSL(hue, saturation, lightness),
				opacity: 0.96,
				lon,
				lat,
				alt,
				life: (isBig ? 0.9 : 0.55) + Math.random() * (isBig ? 0.55 : 0.35),
				scaleStart: (isBig ? 0.9 : 0.45) + Math.random() * (isBig ? 1.4 : 0.6),
				scaleEnd: (isBig ? 3.6 : 2.1) + Math.random() * (isBig ? 2.2 : 1.1),
				velocity: {
					east: Math.sin(heading) * Math.cos(pitch) * speed,
					north: Math.cos(heading) * Math.cos(pitch) * speed,
					up: Math.sin(pitch) * speed
				},
				gravityMultiplier: 0.16,
				riseBias: 0.45,
				drag: 0.4,
				spinSpeed: (Math.random() - 0.5) * 4.5,
				fadePower: 0.84
			});
		}

		for (let index = 0; index < sparkCount; index += 1) {
			const heading = Math.random() * Math.PI * 2;
			const pitch = (Math.random() * 120 - 40) * (Math.PI / 180);
			const speed = (isBig ? 55 : 26) + Math.random() * (isBig ? 145 : 80);

			this.addBillboardParticle({
				texture: textures.spark,
				color: 0xffedbf,
				opacity: 1,
				lon,
				lat,
				alt,
				life: 0.18 + Math.random() * 0.34,
				scaleStart: 0.18 + Math.random() * 0.16,
				scaleEnd: 0.78 + Math.random() * 0.52,
				velocity: {
					east: Math.sin(heading) * Math.cos(pitch) * speed,
					north: Math.cos(heading) * Math.cos(pitch) * speed,
					up: Math.sin(pitch) * speed
				},
				gravityMultiplier: 1.4,
				riseBias: 0.05,
				drag: 1.05,
				spinSpeed: (Math.random() - 0.5) * 8,
				fadePower: 0.58
			});
		}

		for (let index = 0; index < smokeCount; index += 1) {
			const spread = (Math.random() - 0.5) * 0.00016;
			const heading = Math.random() * Math.PI * 2;
			const speed = 0.8 + Math.random() * 3.2;
			const gray = 0.18 + Math.random() * 0.14;

			this.addBillboardParticle({
				texture: textures.smoke,
				color: new THREE.Color(gray, gray * 0.98, gray * 0.94),
				opacity: 0.62,
				blending: THREE.NormalBlending,
				lon: lon + spread,
				lat: lat + spread,
				alt: alt + (Math.random() - 0.5) * 1.1,
				life: (isBig ? 1.5 : 0.9) + Math.random() * (isBig ? 1.3 : 0.75),
				scaleStart: (isBig ? 1.8 : 1.05) + Math.random() * (isBig ? 1.6 : 0.9),
				scaleEnd: (isBig ? 7.2 : 4.2) + Math.random() * (isBig ? 3.4 : 1.8),
				velocity: {
					east: Math.sin(heading) * speed,
					north: Math.cos(heading) * speed,
					up: 1.4 + Math.random() * 3.8
				},
				gravityMultiplier: 0.05,
				riseBias: 0.55,
				drag: 0.18,
				spinSpeed: (Math.random() - 0.5) * 1.3,
				fadePower: 1.55,
				isSmoke: true
			});
		}

		try {
			if (this.viewer?.scene) {
				this.viewer.scene.requestRender();
			}
		} catch (_error) {
			// Best effort only.
		}
	},

	spawnWreckage(lon, lat, alt, heading = 0, pitch = 0, opts = {}) {
		const count = opts.count || 30;
		const sizeMultiplier = opts.sizeMultiplier || 1;
		const speedMultiplier = opts.speedMultiplier || 1;
		const lifeMultiplier = opts.lifeMultiplier || 1;
		const hotShardRatio = opts.hotShardRatio || 0;
		const headingRad = Cesium.Math.toRadians(heading);
		const pitchRad = Cesium.Math.toRadians(pitch);
		const forward = {
			east: Math.sin(headingRad) * Math.cos(pitchRad),
			north: Math.cos(headingRad) * Math.cos(pitchRad),
			up: Math.sin(pitchRad)
		};

		for (let index = 0; index < count; index += 1) {
			const shapeType = Math.random();
			let geometry;
			const size = (0.4 + Math.random() * 2.4) * sizeMultiplier;

			if (shapeType < 0.6) {
				const points = [];
				const pointCount = 3 + Math.floor(Math.random() * 3);
				for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
					const angle =
						(pointIndex / pointCount) * Math.PI * 2 +
						(Math.random() - 0.5) * 0.6;
					const radius = size * (0.35 + Math.random() * 1.1);
					points.push(
						new THREE.Vector2(
							Math.cos(angle) * radius,
							Math.sin(angle) * radius
						)
					);
				}

				const shape = new THREE.Shape(points);
				const depth = Math.max(0.03, size * 0.12);
				geometry = new THREE.ExtrudeGeometry(shape, {
					depth,
					bevelEnabled: false
				});
				geometry.translate(0, 0, -depth * 0.5);
			} else {
				geometry = new THREE.ConeGeometry(size * 0.6, size, 3);
				geometry.rotateX(Math.PI / 2);
			}

			const gray = Math.random() * 0.08;
			const isHotShard = Math.random() < hotShardRatio;
			const emissiveStrength = isHotShard ? 0.7 + Math.random() * 0.8 : 0;
			const debris = new THREE.Mesh(
				geometry,
				new THREE.MeshPhongMaterial({
					color: new THREE.Color(gray, gray, gray),
					emissive: isHotShard
						? new THREE.Color(0.36, 0.12, 0.03)
						: new THREE.Color(0, 0, 0),
					emissiveIntensity: emissiveStrength,
					flatShading: true,
					side: THREE.DoubleSide
				})
			);

			this.enableLayers(debris);
			debris.matrixAutoUpdate = false;
			debris._rotEuler = new THREE.Euler(
				Math.random() * Math.PI,
				Math.random() * Math.PI,
				Math.random() * Math.PI
			);
			debris._rotVel = new THREE.Vector3(
				(Math.random() - 0.5) * 6,
				(Math.random() - 0.5) * 6,
				(Math.random() - 0.5) * 6
			);
			debris.life = (4.0 + Math.random() * 8.0) * lifeMultiplier;
			debris.maxLife = debris.life;
			debris.lon = lon + (Math.random() - 0.5) * 0.0001;
			debris.lat = lat + (Math.random() - 0.5) * 0.0001;
			debris.alt = alt + (Math.random() - 0.5) * 1.0;
			debris._emissiveStart = emissiveStrength;

			const debrisScale = new THREE.Vector3(
				1 + Math.random() * 1.5,
				1 + Math.random() * 1.5,
				1 + Math.random() * 1.5
			);
			debris._scaleVector = debrisScale;

			const spread = 1.2;
			const speed = (10 + Math.random() * 60) * speedMultiplier;
			debris._localVel = {
				east: (forward.east + (Math.random() - 0.5) * spread) * speed,
				north: (forward.north + (Math.random() - 0.5) * spread) * speed,
				up:
					(forward.up + (Math.random() - 0.5) * spread * 0.8) * speed -
					(4 + Math.random() * 6)
			};
			debris._gravityMultiplier = opts.fallMultiplier || 2.2;
			debris._drag = 0.12;

			this.scene.add(debris);
			this.list.push(debris);
		}
	},

	spawnSpark(lon, lat, alt, opts = {}) {
		const textures = this.ensureTextures();
		const count = opts.count || 12;

		for (let index = 0; index < count; index += 1) {
			const heading = Math.random() * Math.PI * 2;
			const pitch = (Math.random() * 120 - 60) * (Math.PI / 180);
			const speed = 18 + Math.random() * 40;

			this.addBillboardParticle({
				texture: textures.spark,
				color: 0xfff0be,
				opacity: 0.92,
				lon,
				lat,
				alt,
				life: 0.18 + Math.random() * 0.3,
				scaleStart: 0.14 + Math.random() * 0.1,
				scaleEnd: 0.6 + Math.random() * 0.3,
				velocity: {
					east: Math.sin(heading) * Math.cos(pitch) * speed,
					north: Math.cos(heading) * Math.cos(pitch) * speed,
					up: Math.sin(pitch) * speed
				},
				gravityMultiplier: 1.2,
				drag: 1.1,
				fadePower: 0.6
			});
		}
	},

	update(dt) {
		if (!this.viewer) {
			return;
		}

		const viewMatrix = this.viewer.camera.viewMatrix;
		for (let index = this.list.length - 1; index >= 0; index -= 1) {
			const particle = this.list[index];
			particle.life -= dt * (particle.isSmoke ? 0.95 : 1);

			if (particle.life <= 0) {
				this.scene.remove(particle);
				this.list.splice(index, 1);
				continue;
			}

			if (particle._localVel) {
				const drag = Math.max(0, 1 - particle._drag * dt);
				particle._localVel.east *= drag;
				particle._localVel.north *= drag;
				particle._localVel.up *= drag;
				particle._localVel.up += (particle._riseBias ?? 0) * dt;
				particle._localVel.up -=
					9.81 * dt * (particle._gravityMultiplier ?? 0);

				const latRad = Cesium.Math.toRadians(particle.lat);
				particle.lon +=
					(particle._localVel.east * dt) /
					(111320 * Math.max(Math.cos(latRad), 0.01));
				particle.lat += (particle._localVel.north * dt) / 111320;
				particle.alt += particle._localVel.up * dt;
			}

			const lifeRatio = particle.life / particle.maxLife;
			const progress = 1 - lifeRatio;
			if (particle.material && particle.material.opacity !== undefined) {
				particle.material.opacity =
					particle._opacityStart *
					Math.pow(
						Math.max(0, lifeRatio),
						particle._fadePower ?? (particle.isSmoke ? 1.4 : 0.9)
					);
			}
			if (
				particle.material &&
				typeof particle.material.emissiveIntensity === 'number'
			) {
				particle.material.emissiveIntensity =
					(particle._emissiveStart ?? 0) *
					Math.pow(Math.max(0, lifeRatio), 1.2);
			}
			if (particle.material && 'rotation' in particle.material) {
				particle.material.rotation += (particle._spinSpeed ?? 0) * dt;
			}

			const scaleVector = particle._scaleVector
				? particle._scaleVector
				: new THREE.Vector3(
						THREE.MathUtils.lerp(
							particle._scaleStart ?? 1,
							particle._scaleEnd ?? particle._scaleStart ?? 1,
							progress
						),
						THREE.MathUtils.lerp(
							particle._scaleStart ?? 1,
							particle._scaleEnd ?? particle._scaleStart ?? 1,
							progress
						),
						THREE.MathUtils.lerp(
							particle._scaleStart ?? 1,
							particle._scaleEnd ?? particle._scaleStart ?? 1,
							progress
						)
					);

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
			if (particle._rotEuler && particle._rotVel) {
				particle._rotEuler.x += particle._rotVel.x * dt;
				particle._rotEuler.y += particle._rotVel.y * dt;
				particle._rotEuler.z += particle._rotVel.z * dt;

				const rotationMatrix = new THREE.Matrix4();
				const rotationQuaternion = new THREE.Quaternion().setFromEuler(
					particle._rotEuler
				);
				rotationMatrix.compose(
					new THREE.Vector3(0, 0, 0),
					rotationQuaternion,
					scaleVector
				);
				particle.matrix.multiply(rotationMatrix);
			} else {
				particle.matrix.scale(scaleVector);
			}

			particle.updateMatrixWorld(true);
		}
	}
};

export { particles };
