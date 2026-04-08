import * as THREE from 'three';
import * as Cesium from 'cesium';
import { Missile } from '../weapon/missile';
import { Bullet } from '../weapon/bullet';
import { Flare } from '../weapon/flare';
import {
	getMissileVisualById,
	getMissileVisualIds,
	selectMissileVisualIdForDistance
} from '../weapon/missileCatalog';
import { soundManager } from '../utils/soundManager';
import { movePosition } from '../utils/math';

export class WeaponSystem {
	constructor(viewer, scene, playerModel) {
		this.viewer = viewer;
		this.scene = scene;
		this.playerModel = playerModel;

		this.weapons = [
			{ id: 'gun', name: 'M61A1 기관포', ammo: Infinity, maxAmmo: Infinity, fireRate: 0.05, lastFire: 0 },
			{ id: 'missile', name: 'AAM 미사일', ammo: 50, maxAmmo: 50, fireRate: 1.0, lastFire: 0, type: 'AAM' }
		];

		this.flareWeapon = { id: 'flare', name: 'MJU-7A 플레어', ammo: 30, maxAmmo: 30, fireRate: 0.2, lastFire: 0 };

		this.selectedWeaponIndex = 0;
		this.projectiles = [];
		this.flares = [];
		this.onKill = null;

		this.target = null;
		this.isGunOverheated = false;
		this.gunHeat = 0;

		this.lockTime = 0;
		this.lockRequiredTime = 2.0;
		this.lockStatus = 'NONE';
		this.lockingTarget = null;

		this.flareQueue = 0;
		this.flareInterval = 0.15;
		this.lastFlarePulse = 0;

		this.lastMissileSide = false;
		this.missileSelectionMode = 'auto';
		this.missileSelectionIds = getMissileVisualIds();
		this.manualMissileVisualIndex = 0;
		this.lastLaunchedMissile = null;
		this.onMissileLaunch = null;
		this.onMissileDetonate = null;

		this.emptyWarningTimers = {
			gun: 0,
			missile: 0,
			flare: 0
		};
		this.lastEmptyWarningSoundTime = 0;
	}

	resetAmmo() {
		this.selectedWeaponIndex = 0;
		for (const w of this.weapons) {
			if (typeof w.maxAmmo !== 'undefined') w.ammo = w.maxAmmo;
		}
		if (this.flareWeapon && typeof this.flareWeapon.maxAmmo !== 'undefined') {
			this.flareWeapon.ammo = this.flareWeapon.maxAmmo;
		}
		this.gunHeat = 0;
		this.isGunOverheated = false;

		this.emptyWarningTimers = {
			gun: 0,
			missile: 0,
			flare: 0
		};
	}

	clearProjectiles() {
		for (const projectile of this.projectiles) {
			projectile.active = false;
			if (projectile.mesh) {
				this.scene.remove(projectile.mesh);
			}
			if (projectile.group) {
				this.scene.remove(projectile.group);
			}
			if (Array.isArray(projectile.trail)) {
				for (const fragment of projectile.trail) {
					this.scene.remove(fragment);
				}
				projectile.trail = [];
			}
		}
		for (const flare of this.flares) {
			if (typeof flare.destroy === 'function') {
				flare.destroy();
			}
		}

		this.projectiles = [];
		this.flares = [];
		this.lastLaunchedMissile = null;
	}

	getCurrentWeapon() {
		return this.weapons[this.selectedWeaponIndex];
	}

	toggleWeapon() {
		this.selectedWeaponIndex = (this.selectedWeaponIndex + 1) % this.weapons.length;
		try { soundManager.play('weapon-switch'); } catch (e) { }
	}

	selectWeapon(index) {
		if (index >= 0 && index < this.weapons.length) {
			this.selectedWeaponIndex = index;
		}
		try { soundManager.play('weapon-switch'); } catch (e) { }
	}

	cycleMissileProfile() {
		const sequence = ['auto', ...this.missileSelectionIds];
		const currentIndex = sequence.indexOf(this.getCurrentMissileSelectionMode());
		const nextMode = sequence[(currentIndex + 1) % sequence.length];

		if (nextMode === 'auto') {
			this.missileSelectionMode = 'auto';
		} else {
			this.missileSelectionMode = 'manual';
			this.manualMissileVisualIndex = Math.max(
				0,
				this.missileSelectionIds.indexOf(nextMode)
			);
		}

		try { soundManager.play('weapon-switch'); } catch (e) { }
	}

	getCurrentMissileSelectionMode() {
		if (this.missileSelectionMode !== 'manual') {
			return 'auto';
		}

		return (
			this.missileSelectionIds[this.manualMissileVisualIndex] ??
			this.missileSelectionIds[0] ??
			selectMissileVisualIdForDistance(0)
		);
	}

	getManualMissileVisualId() {
		return (
			this.missileSelectionIds[this.manualMissileVisualIndex] ??
			this.missileSelectionIds[0] ??
			selectMissileVisualIdForDistance(0)
		);
	}

	getMissileProfileStatus(playerState = null, target = null) {
		const selectionMode = this.getCurrentMissileSelectionMode();
		const resolvedVisualId =
			selectionMode === 'auto'
				? this.getAutoMissileVisualId(playerState, target)
				: this.getManualMissileVisualId();
		const visual = getMissileVisualById(resolvedVisualId);
		const shortLabel =
			selectionMode === 'auto'
				? `AUTO · ${visual.label}`
				: `MAN · ${visual.label}`;

		return {
			mode: selectionMode === 'auto' ? 'auto' : 'manual',
			selectedVisualId: selectionMode === 'auto' ? 'auto' : resolvedVisualId,
			resolvedVisualId,
			label: visual.label,
			shortLabel
		};
	}

	getActiveMissiles() {
		return this.projectiles.filter((projectile) => projectile?.isMissile === true);
	}

	getLatestActiveMissile() {
		if (this.lastLaunchedMissile?.active) {
			return this.lastLaunchedMissile;
		}

		for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
			const projectile = this.projectiles[index];
			if (projectile?.isMissile === true && projectile.active) {
				this.lastLaunchedMissile = projectile;
				return projectile;
			}
		}

		return null;
	}

	calculateWeaponPos(offset) {
		if (!this.playerModel || !this.viewer) return null;

		const scale = this.playerModel.scale.x;
		const scaledOffset = offset.clone().multiplyScalar(scale);

		scaledOffset.applyQuaternion(this.playerModel.quaternion);
		scaledOffset.add(this.playerModel.position);

		const planeFov = 75;
		const worldFov = Cesium.Math.toDegrees(this.viewer.camera.frustum.fovy);

		const factor = Math.tan(Cesium.Math.toRadians(worldFov) * 0.5) / Math.tan(Cesium.Math.toRadians(planeFov) * 0.5);

		scaledOffset.x *= factor;
		scaledOffset.y *= factor;

		const cam = this.viewer.camera;
		const right = cam.right;
		const up = cam.up;
		const dir = cam.direction;

		const worldOffset = new Cesium.Cartesian3();

		const xVec = Cesium.Cartesian3.multiplyByScalar(right, scaledOffset.x, new Cesium.Cartesian3());
		const yVec = Cesium.Cartesian3.multiplyByScalar(up, scaledOffset.y, new Cesium.Cartesian3());
		const zVec = Cesium.Cartesian3.multiplyByScalar(dir, -scaledOffset.z, new Cesium.Cartesian3());

		Cesium.Cartesian3.add(xVec, yVec, worldOffset);
		Cesium.Cartesian3.add(worldOffset, zVec, worldOffset);

		const camPos = cam.positionWC;
		const finalPos = new Cesium.Cartesian3();
		Cesium.Cartesian3.add(camPos, worldOffset, finalPos);

		const carto = Cesium.Cartographic.fromCartesian(finalPos);

		return {
			lon: Cesium.Math.toDegrees(carto.longitude),
			lat: Cesium.Math.toDegrees(carto.latitude),
			alt: carto.height
		};
	}

	fire(playerState, specificWeaponId = null) {
		const weapon = specificWeaponId
			? this.weapons.find(w => w.id === specificWeaponId)
			: this.weapons[this.selectedWeaponIndex];

		if (!weapon) return;

		const now = performance.now() * 0.001;

		if (weapon.ammo <= 0) {
			if (now - this.lastEmptyWarningSoundTime > 2.0) {
				this.emptyWarningTimers[weapon.id] = 1.0;
				this.lastEmptyWarningSoundTime = now;
				try { soundManager.play('weapon-warning'); } catch (e) { }
			}
			return;
		}
		if (weapon.id === 'gun' && this.isGunOverheated) return;
		if (now - weapon.lastFire < weapon.fireRate) return;

		if (weapon.id === 'missile' && this.lockStatus !== 'LOCKED') {
			return;
		}

		weapon.lastFire = now;
		if (weapon.ammo !== Infinity) weapon.ammo--;

		const startPos = {
			lon: playerState.lon,
			lat: playerState.lat,
			alt: playerState.alt
		};

		if (weapon.id === 'gun') {
			this.gunHeat += 0.02;
			if (this.gunHeat >= 1.0) {
				this.isGunOverheated = true;
				try { soundManager.play('weapon-warning'); } catch (e) { }
			}

			const gunOffset = new THREE.Vector3(0, 0, 0);
			const nosePos = this.calculateWeaponPos(gunOffset) || movePosition(startPos.lon, startPos.lat, startPos.alt, playerState.heading, playerState.pitch, 5);

			const bullet = new Bullet(
				this.scene,
				this.viewer,
				nosePos,
				playerState.heading,
				playerState.pitch,
				playerState.speed,
				this.onKill
			);
			this.projectiles.push(bullet);
		} else if (weapon.id === 'missile') {
			this.lastMissileSide = !this.lastMissileSide;
			const side = this.lastMissileSide ? 1 : -1;
			const missileOffset = new THREE.Vector3(18.0 * side, -11.0, -34.0);

			const launchPos = this.calculateWeaponPos(missileOffset) || startPos;

			const target = this.target;
			const visualId = this.getMissileVisualId(playerState, target);
			const visual = getMissileVisualById(visualId);
			const missile = new Missile(
				this.scene,
				this.viewer,
				launchPos,
				playerState.heading,
				playerState.pitch,
				playerState.speed,
				target,
				this.onKill,
				{
					visualId,
					onDetonate: (payload) => {
						if (typeof this.onMissileDetonate === 'function') {
							this.onMissileDetonate({
								...payload,
								visualId,
								visualLabel: visual.label
							});
						}
					}
				}
			);
			this.projectiles.push(missile);
			this.lastLaunchedMissile = missile;
			if (typeof this.onMissileLaunch === 'function') {
				this.onMissileLaunch({
					missile,
					visualId,
					visualLabel: visual.label,
					target
				});
			}

			try { soundManager.play('missile-fire'); } catch (e) { }
		}
	}

	getMissileVisualId(playerState, target) {
		if (this.missileSelectionMode === 'manual') {
			return this.getManualMissileVisualId();
		}

		return this.getAutoMissileVisualId(playerState, target);
	}

	getAutoMissileVisualId(playerState, target) {
		if (!target || !playerState) {
			return selectMissileVisualIdForDistance(0);
		}

		return selectMissileVisualIdForDistance(this.calculateDist(playerState, target));
	}

	fireFlare(playerState) {
		const flareWeapon = this.flareWeapon;
		const now = performance.now() * 0.001;

		if (!flareWeapon || flareWeapon.ammo <= 0) {
			if (now - this.lastEmptyWarningSoundTime > 2.0) {
				this.emptyWarningTimers['flare'] = 1.0;
				this.lastEmptyWarningSoundTime = now;
				try { soundManager.play('weapon-warning'); } catch (e) { }
			}
			return;
		}
		if (now - flareWeapon.lastFire < 1.0) return;

		flareWeapon.ammo--;
		flareWeapon.lastFire = now;

		this.flareQueue = 6;
		this.lastFlarePulse = 0;
	}

	_spawnSingleFlare(playerState) {
		const flareOffset = new THREE.Vector3(0, -10.0, 6.0);
		const startPos = this.calculateWeaponPos(flareOffset) || {
			lon: playerState.lon,
			lat: playerState.lat,
			alt: playerState.alt
		};

		const flare = new Flare(
			this.scene,
			this.viewer,
			startPos,
			playerState.heading,
			playerState.pitch,
			playerState.speed
		);

		this.flares.push(flare);
	}

	update(dt, playerState, input = null) {
		const prevLockStatus = this.lockStatus;
		const currentWeapon = this.getCurrentWeapon();

		try {
			const isFiringGun = input && input.fire && currentWeapon.id === 'gun' && !this.isGunOverheated && currentWeapon.ammo > 0;
			if (isFiringGun) {
				if (!soundManager.isPlaying('m61-firing')) {
					soundManager.play('m61-firing');
				}
			} else {
				if (soundManager.isPlaying('m61-firing')) {
					soundManager.stop('m61-firing');
				}
			}
		} catch (e) { }

		if (currentWeapon.id === 'missile') {
			const potentialTarget = this.findPotentialTarget(playerState);

			if (potentialTarget) {
				if (this.lockingTarget === potentialTarget) {
					this.lockTime += dt;
					if (this.lockTime >= this.lockRequiredTime) {
						this.lockStatus = 'LOCKED';
						this.target = potentialTarget;
					} else {
						this.lockStatus = 'LOCKING';
					}
				} else {
					this.lockingTarget = potentialTarget;
					this.lockTime = 0;
					this.lockStatus = 'LOCKING';
					this.target = null;
				}
			} else {
				this.lockingTarget = null;
				this.lockTime = 0;
				this.lockStatus = 'NONE';
				this.target = null;
			}
		} else {
			this.lockingTarget = null;
			this.lockTime = 0;
			this.lockStatus = 'NONE';
			this.target = null;
		}

		try {
			if (this.lockStatus === 'LOCKING') {
				if (!soundManager.isPlaying('rwr-tws')) {
					soundManager.play('rwr-tws');
				}
			} else {
				if (soundManager.isPlaying('rwr-tws')) {
					soundManager.stop('rwr-tws');
				}
			}

			if (prevLockStatus !== this.lockStatus && this.lockStatus === 'LOCKED') {
				soundManager.play('rwr-lock');
			}
			if (prevLockStatus === 'LOCKED' && this.lockStatus !== 'LOCKED') {
				if (soundManager.isPlaying('rwr-lock')) {
					soundManager.stop('rwr-lock');
				}
			}
		} catch (e) { }

		if (this.flareQueue > 0) {
			this.lastFlarePulse += dt;
			if (this.lastFlarePulse >= this.flareInterval || this.flareQueue === 6) {
				this._spawnSingleFlare(playerState);
				this.flareQueue--;
				this.lastFlarePulse = 0;
			}
		}

		if (this.gunHeat > 0) {
			this.gunHeat -= dt * 0.2;
			if (this.gunHeat <= 0) {
				this.gunHeat = 0;
				this.isGunOverheated = false;
			}
			if (this.isGunOverheated && this.gunHeat < 0.3) {
				this.isGunOverheated = false;
			}
		}

		for (const key in this.emptyWarningTimers) {
			if (this.emptyWarningTimers[key] > 0) {
				this.emptyWarningTimers[key] -= dt;
				if (this.emptyWarningTimers[key] < 0) this.emptyWarningTimers[key] = 0;
			}
		}

		const npcs = playerState.npcs || [];

		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const p = this.projectiles[i];
			p.update(dt, npcs);
			const hasTrail = p.trail && p.trail.length > 0;
			if (!p.active && !hasTrail) {
				if (this.lastLaunchedMissile === p) {
					this.lastLaunchedMissile = null;
				}
				this.projectiles.splice(i, 1);
			}
		}

		for (let i = this.flares.length - 1; i >= 0; i--) {
			const f = this.flares[i];
			f.update(dt);
			if (!f.active) {
				this.flares.splice(i, 1);
			}
		}
	}

	findPotentialTarget(playerState) {
		if (!playerState.npcs || playerState.npcs.length === 0) return null;

		let bestTarget = null;
		let maxDot = 0.985;

		for (const npc of playerState.npcs) {
			if (npc.destroyed) continue;

			const dot = this.calculateDotProduct(playerState, npc);
			if (dot > maxDot) {
				const dist = this.calculateDist(playerState, npc);
				if (dist < 10000) {
					bestTarget = npc;
					maxDot = dot;
				}
			}
		}
		return bestTarget;
	}

	calculateDotProduct(player, npc) {
		const hRad = Cesium.Math.toRadians(player.heading);
		const pRad = Cesium.Math.toRadians(player.pitch);
		const pDir = new THREE.Vector3(
			Math.sin(hRad) * Math.cos(pRad),
			Math.sin(pRad),
			Math.cos(hRad) * Math.cos(pRad)
		);

		const dLon = (npc.lon - player.lon) * 111320 * Math.cos(Cesium.Math.toRadians(player.lat));
		const dLat = (npc.lat - player.lat) * 111320;
		const dAlt = npc.alt - player.alt;
		const toNpc = new THREE.Vector3(dLon, dAlt, dLat).normalize();

		return pDir.dot(toNpc);
	}

	calculateDist(player, npc) {
		const dLon = (npc.lon - player.lon) * 111320 * Math.cos(Cesium.Math.toRadians(player.lat));
		const dLat = (npc.lat - player.lat) * 111320;
		const dAlt = npc.alt - player.alt;
		return Math.sqrt(dLon * dLon + dLat * dLat + dAlt * dAlt);
	}
}
