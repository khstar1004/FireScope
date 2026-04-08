import * as THREE from 'three';

export class PlanePhysics {
	constructor(config = {}) {
		const defaults = {
			speed: 100,
			maxSpeed: 1000,
			minSpeed: 100,
			throttle: 0.5,
			enginePower: 1.2,
			drag: 0.005,
			liftFactor: 0.002,
			gravity: 9.8,
			pitch: 0,
			roll: 0,
			heading: 0,
			pitchRate: 1.2,
			rollRate: 2.5,
			yawRate: 0.5,
			isBoosting: false,
			boostTimeRemaining: 0,
			boostDuration: 2.5,
			boostMultiplier: 1.5,
			boostRotations: 2,
			boostPressed: false
		};

		Object.assign(this, defaults, config);

		this.quaternion = new THREE.Quaternion();
	}

	boost() {
		if (this.boostTimeRemaining <= 0) {
			this.isBoosting = true;
			this.boostTimeRemaining = this.boostDuration;
		}
	}

	reset(lon, lat, alt, heading, pitch, roll) {
		this.heading = heading || 0;
		this.pitch = pitch || 0;
		this.roll = roll || 0;

		const euler = new THREE.Euler(
			THREE.MathUtils.degToRad(this.pitch),
			THREE.MathUtils.degToRad(this.heading),
			THREE.MathUtils.degToRad(this.roll),
			'YXZ'
		);
		this.quaternion.setFromEuler(euler);
	}

	update(input, dt) {
		if (this.boostTimeRemaining > 0) {
			this.boostTimeRemaining -= dt;
			if (this.boostTimeRemaining <= 0) {
				this.isBoosting = false;
				this.boostTimeRemaining = 0;
			}
		}

		if (input.boost) {
			if (!this.boostPressed && !this.isBoosting) {
				this.boost();
			}
			this.boostPressed = true;
		} else {
			this.boostPressed = false;
		}

		this.throttle = input.throttle;
		let targetSpeed = this.minSpeed + (this.throttle * (this.maxSpeed - this.minSpeed));

		if (this.isBoosting) {
			targetSpeed = this.maxSpeed * this.boostMultiplier;
		}

		this.speed += (targetSpeed - this.speed) * dt * (this.isBoosting ? 4 : 2);

		const controlEffectiveness = this.speed > this.minSpeed ? 1 : (this.speed / this.minSpeed);

		const localPitch = input.pitch * this.pitchRate * dt * controlEffectiveness;
		const localRoll = input.roll * this.rollRate * dt * controlEffectiveness;
		const localYaw = input.yaw * this.yawRate * dt * controlEffectiveness;

		const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), localPitch);
		const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), localRoll);
		const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), localYaw);

		this.quaternion.multiply(qYaw);
		this.quaternion.multiply(qPitch);
		this.quaternion.multiply(qRoll);

		this.quaternion.normalize();

		const euler = new THREE.Euler().setFromQuaternion(this.quaternion, 'YXZ');

		this.heading = THREE.MathUtils.radToDeg(euler.y);
		this.pitch = THREE.MathUtils.radToDeg(euler.x);
		this.roll = THREE.MathUtils.radToDeg(euler.z);

		return {
			speed: this.speed,
			pitch: this.pitch,
			roll: this.roll,
			heading: this.heading,
			isBoosting: this.isBoosting,
			boostTimeRemaining: this.boostTimeRemaining,
			boostDuration: this.boostDuration,
			boostRotations: this.boostRotations
		};
	}
}
