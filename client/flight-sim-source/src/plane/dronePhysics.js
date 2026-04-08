export class DronePhysics {
	constructor() {
		this.heading = 0;
		this.pitch = 0;
		this.roll = 0;
		this.forwardSpeed = 0;
		this.lateralSpeed = 0;
		this.verticalSpeed = 0;

		this.maxForwardSpeed = 55;
		this.maxReverseSpeed = 18;
		this.maxLateralSpeed = 28;
		this.maxVerticalSpeed = 24;
		this.yawRate = 65;

		this.forwardResponse = 2.8;
		this.lateralResponse = 3.2;
		this.verticalResponse = 3.4;
		this.attitudeResponse = 4.5;
	}

	reset(lon, lat, alt, heading, pitch, roll) {
		this.heading = heading || 0;
		this.pitch = pitch || 0;
		this.roll = roll || 0;
		this.forwardSpeed = 0;
		this.lateralSpeed = 0;
		this.verticalSpeed = 0;
	}

	update(input, dt) {
		const clampLerp = (current, target, speed) =>
			current + ((target - current) * Math.min(1, dt * speed));

		const targetForwardSpeed =
			input.forward >= 0
				? input.forward * this.maxForwardSpeed
				: input.forward * this.maxReverseSpeed;
		const targetLateralSpeed = input.strafe * this.maxLateralSpeed;
		const targetVerticalSpeed = input.vertical * this.maxVerticalSpeed;

		this.forwardSpeed = clampLerp(
			this.forwardSpeed,
			targetForwardSpeed,
			this.forwardResponse
		);
		this.lateralSpeed = clampLerp(
			this.lateralSpeed,
			targetLateralSpeed,
			this.lateralResponse
		);
		this.verticalSpeed = clampLerp(
			this.verticalSpeed,
			targetVerticalSpeed,
			this.verticalResponse
		);

		this.heading += input.yaw * this.yawRate * dt;
		this.pitch = clampLerp(this.pitch, -input.forward * 14, this.attitudeResponse);
		this.roll = clampLerp(
			this.roll,
			(-input.strafe * 16) - (input.yaw * 6),
			this.attitudeResponse
		);

		return {
			speed: Math.sqrt(
				(this.forwardSpeed ** 2) +
				(this.lateralSpeed ** 2) +
				(this.verticalSpeed ** 2)
			),
			pitch: this.pitch,
			roll: this.roll,
			heading: this.heading,
			forwardSpeed: this.forwardSpeed,
			lateralSpeed: this.lateralSpeed,
			verticalSpeed: this.verticalSpeed,
			isBoosting: false,
			boostTimeRemaining: 0,
			boostDuration: 0,
			boostRotations: 0
		};
	}
}
