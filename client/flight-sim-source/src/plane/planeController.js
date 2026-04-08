export class PlaneController {
	constructor(mode = 'jet') {
		this.keys = {};
		this.prevKeys = {};
		this.mode = mode;
		window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
		window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

		this.mouseDragging = false;
		this.mouseDeltaX = 0;
		this.mouseDeltaY = 0;
		this.lastMouseX = 0;
		this.lastMouseY = 0;

		window.addEventListener('mousedown', (e) => {
			if (e.button === 0) {
				this.mouseDragging = true;
				this.lastMouseX = e.clientX;
				this.lastMouseY = e.clientY;
			}
		});

		window.addEventListener('mousemove', (e) => {
			if (this.mouseDragging) {
				this.mouseDeltaX += e.clientX - this.lastMouseX;
				this.mouseDeltaY += e.clientY - this.lastMouseY;
				this.lastMouseX = e.clientX;
				this.lastMouseY = e.clientY;
			}
		});

		window.addEventListener('mouseup', (e) => {
			if (e.button === 0) {
				this.mouseDragging = false;
			}
		});

		this.input = {
			throttle: 0,
			forward: 0,
			vertical: 0,
			strafe: 0,
			pitch: 0,
			roll: 0,
			yaw: 0,
			boost: false,
			cameraYaw: 0,
			cameraPitch: 0,
			isDragging: false,
			fire: false,
			fireFlare: false,
			weaponIndex: -1,
			toggleWeapon: false,
			cycleMissileProfile: false,
			cycleCameraMode: false
		};

		this.sensitivity = 0.2;
	}

	setSensitivity(value) {
		this.sensitivity = value;
	}

	setMode(mode) {
		this.mode = mode;
		this.reset();
	}

	update() {
		this.input.isDragging = this.mouseDragging;
		
		this.input.fire = !!this.keys['enter'] || !!this.keys['f'];
		this.input.fireFlare = !!this.keys['v'];
		
		this.input.toggleWeapon = (!!this.keys['q'] && !this.prevKeys['q']);
		this.input.cycleMissileProfile = (!!this.keys['r'] && !this.prevKeys['r']);
		this.input.cycleCameraMode = (!!this.keys['c'] && !this.prevKeys['c']);

		this.input.weaponIndex = -1;
		if (this.keys['1']) this.input.weaponIndex = 0;
		if (this.keys['2']) this.input.weaponIndex = 1;

		if (this.mode === 'drone') {
			this.input.boost = false;
			this.input.forward = this.lerp(
				this.input.forward,
				(this.keys['w'] ? 1 : (this.keys['s'] ? -1 : 0)),
				0.14
			);
			this.input.vertical = this.lerp(
				this.input.vertical,
				(this.keys['arrowup'] ? 1 : (this.keys['arrowdown'] ? -1 : 0)),
				0.14
			);
			this.input.strafe = this.lerp(
				this.input.strafe,
				(this.keys['arrowright'] ? 1 : (this.keys['arrowleft'] ? -1 : 0)),
				0.14
			);
			this.input.throttle = Math.max(
				Math.abs(this.input.forward),
				Math.abs(this.input.vertical),
				Math.abs(this.input.strafe)
			);
			this.input.pitch = this.input.forward;
			this.input.roll = this.input.strafe;
		} else {
			this.input.boost = !!this.keys[' '];
			this.input.forward = 0;
			this.input.vertical = 0;
			this.input.strafe = 0;

			const accelRate = 0.5;
			if (this.keys['w']) {
				this.input.throttle = Math.min(1, this.input.throttle + accelRate * 0.016);
			} else if (this.keys['s']) {
				this.input.throttle = Math.max(0, this.input.throttle - accelRate * 0.016);
			}

			const pitchTarget = (this.keys['arrowup'] ? -1 : (this.keys['arrowdown'] ? 1 : 0));
			this.input.pitch = this.lerp(this.input.pitch, pitchTarget, 0.1);

			const rollTarget = (this.keys['arrowleft'] ? -1 : (this.keys['arrowright'] ? 1 : 0));
			this.input.roll = this.lerp(this.input.roll, rollTarget, 0.1);
		}

		const yawTarget = (this.keys['a'] ? -1 : (this.keys['d'] ? 1 : 0));
		this.input.yaw = this.lerp(this.input.yaw, yawTarget, 0.1);

		if (this.mouseDragging) {
			this.input.cameraYaw += this.mouseDeltaX * this.sensitivity;
			this.input.cameraPitch -= this.mouseDeltaY * this.sensitivity;

			this.input.cameraPitch = Math.max(-85, Math.min(85, this.input.cameraPitch));

			this.mouseDeltaX = 0;
			this.mouseDeltaY = 0;
		} else {
			this.input.cameraYaw = this.lerp(this.input.cameraYaw, 0, 0.1);
			this.input.cameraPitch = this.lerp(this.input.cameraPitch, 0, 0.1);
		}

		this.prevKeys = { ...this.keys };

		return this.input;
	}

	reset() {
		this.input.cameraYaw = 0;
		this.input.cameraPitch = 0;
		this.mouseDragging = false;
		this.mouseDeltaX = 0;
		this.mouseDeltaY = 0;
		this.input.throttle = 0;
		this.input.forward = 0;
		this.input.vertical = 0;
		this.input.strafe = 0;
		this.input.pitch = 0;
		this.input.roll = 0;
		this.input.yaw = 0;
	}

	lerp(start, end, amt) {
		return (1 - amt) * start + amt * end;
	}
}
