import { soundManager } from '../utils/soundManager';

export class DialogueSystem {
	constructor(craftProfile = { id: 'jet', mode: 'jet' }) {
		this.container = document.getElementById('dialogue-container');
		this.textElem = document.getElementById('dialogue-text');
		this.dialogues = [];
		this.tutorialStorageKey = 'tutorialCompleted:jet';
		this.currentIndex = 0;
		this.isActive = false;
		this.isPaused = false;
		this.currentCharIndex = 0;
		this.isWaitingForNext = false;
		this.lastSoundIndex = -1;
		this.glitchSounds = [
			'glitch-1',
			'glitch-2',
			'glitch-3',
			'glitch-4'
		];

		this.setCraftProfile(craftProfile);
	}

	setCraftProfile(craftProfile = { id: 'jet', mode: 'jet' }) {
		const craftId = craftProfile.id || 'jet';
		const craftLabel = craftProfile.label || '전투기';
		this.tutorialStorageKey = `tutorialCompleted:${craftId}`;

		if (craftProfile.mode === 'drone') {
			this.dialogues = [
				"드론 모드 준비가 끝났습니다. 먼저 기본 조작부터 익히겠습니다.",
				"드론은 전투기보다 낮고 느리게 움직이므로 작은 입력이 더 안정적입니다.",
				"W와 S로 전진과 후진을 조절합니다.",
				"위와 아래 화살표로 상승과 하강을 제어합니다.",
				"왼쪽과 오른쪽 화살표로 좌우 이동을 합니다.",
				"A와 D로 기수를 좌우로 회전합니다.",
				"마우스를 드래그하면 주변을 둘러볼 수 있습니다.",
				"ESC 또는 P를 누르면 언제든 일시 정지할 수 있습니다.",
				"지면과 전선에 충분한 거리를 두고, 천천히 안정적으로 비행하십시오."
			];
			return;
		}

		this.dialogues = [
			"조종사님, 전술 조언관 디마르 타르미지입니다. 오늘 비행을 안내하겠습니다.",
			`현재 ${craftLabel} 기체를 조종 중입니다.`,
			"HUD 왼쪽은 속도, 오른쪽은 고도를 보여줍니다.",
			"상단 나침반은 현재 방위를, 중앙 조준선은 자세 유지를 돕습니다.",
			"무장은 준비되어 있습니다. M61A1 기관포와 공대공 미사일을 사용할 수 있습니다.",
			"W와 S로 추력을 조절하면서 속도와 에너지를 관리하십시오.",
			"화살표 키로 기수와 롤을 조정하고, A와 D로 방향타를 제어합니다.",
			"스페이스를 누르면 순간 가속이 가능하지만 속도 변화에 주의해야 합니다.",
			"1, 2 또는 Q로 무기를 바꾸고, F 또는 엔터로 목표를 공격합니다.",
			"위협을 감지하면 V를 눌러 플레어를 살포하고 락온을 끊으십시오.",
			"하단 미니맵에는 주변 표적과 현재 지역이 표시됩니다.",
			"행운을 빕니다. 전술 조언관 디마르 타르미지, 이상입니다."
		];
	}

	start() {
		if (localStorage.getItem(this.tutorialStorageKey)) return;

		this.stop();

		this.currentIndex = 0;
		this.currentCharIndex = 0;
		this.isActive = true;
		this.isPaused = false;
		this.isWaitingForNext = false;

		this.startTimeout = setTimeout(() => {
			if (!this.isActive || this.isPaused) return;
			this.container.classList.remove('hidden');
			this.showNext();
		}, 7000);
	}

	pause() {
		if (!this.isActive) return;
		this.isPaused = true;
		this.container.classList.add('hidden');
		if (this.startTimeout) clearTimeout(this.startTimeout);
		if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
		if (this.nextTimeout) clearTimeout(this.nextTimeout);
	}

	resume() {
		if (!this.isActive || !this.isPaused) return;
		this.isPaused = false;
		this.container.classList.remove('hidden');

		if (this.isWaitingForNext) {
			this.nextTimeout = setTimeout(() => {
				this.currentIndex++;
				this.currentCharIndex = 0;
				this.showNext();
			}, 2000);
		} else {
			this.typeWriter();
		}
	}

	stop() {
		this.isActive = false;
		this.isPaused = false;
		this.container.classList.add('hidden');
		if (this.startTimeout) clearTimeout(this.startTimeout);
		if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
		if (this.nextTimeout) clearTimeout(this.nextTimeout);
	}

	showNext() {
		if (!this.isActive || this.isPaused) return;

		if (this.currentIndex >= this.dialogues.length) {
			this.finish();
			return;
		}

		this.textElem.textContent = '';
		this.currentCharIndex = 0;
		this.isWaitingForNext = false;

		this.playRandomGlitch();
		this.typeWriter();
	}

	typeWriter() {
		if (!this.isActive || this.isPaused) return;

		const text = this.dialogues[this.currentIndex];
		if (this.currentCharIndex < text.length) {
			this.textElem.textContent = text.substring(0, this.currentCharIndex + 1);
			this.currentCharIndex++;
			this.typewriterTimeout = setTimeout(() => this.typeWriter(), 30);
		} else {
			this.isWaitingForNext = true;
			this.nextTimeout = setTimeout(() => {
				this.currentIndex++;
				this.currentCharIndex = 0;
				this.showNext();
			}, 4000);
		}
	}

	playRandomGlitch() {
		let index;
		do {
			index = Math.floor(Math.random() * this.glitchSounds.length);
		} while (index === this.lastSoundIndex);

		this.lastSoundIndex = index;
		soundManager.play(this.glitchSounds[index]);
	}

	skip() {
		if (!this.isActive || this.isPaused) return;

		const text = this.dialogues[this.currentIndex];
		if (!text) return;

		if (!this.isWaitingForNext) {
			if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
			this.textElem.textContent = text;
			this.currentCharIndex = text.length;
			this.isWaitingForNext = true;

			if (this.nextTimeout) clearTimeout(this.nextTimeout);
			this.nextTimeout = setTimeout(() => {
				this.currentIndex++;
				this.currentCharIndex = 0;
				this.showNext();
			}, 4000);
		} else {
			if (this.nextTimeout) clearTimeout(this.nextTimeout);
			this.currentIndex++;
			this.currentCharIndex = 0;
			this.showNext();
		}
	}

	finish() {
		this.isActive = false;
		this.container.classList.add('hidden');
		localStorage.setItem(this.tutorialStorageKey, 'true');
	}
}
