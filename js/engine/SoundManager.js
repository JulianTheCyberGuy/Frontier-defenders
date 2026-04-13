export default class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }

    ensureContext() {
        if (!this.enabled) return null;

        if (!this.audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                this.enabled = false;
                return null;
            }

            this.audioContext = new AudioContextClass();
        }

        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }

        return this.audioContext;
    }

    playTone(frequency, duration = 0.08, type = "sine", volume = 0.03) {
        const ctx = this.ensureContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.value = volume;

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    playClick() {
        this.playTone(520, 0.05, "square", 0.025);
    }

    playConfirm() {
        this.playTone(680, 0.08, "triangle", 0.03);
        setTimeout(() => this.playTone(820, 0.08, "triangle", 0.03), 60);
    }

    playVictory() {
        this.playTone(523, 0.12, "triangle", 0.03);
        setTimeout(() => this.playTone(659, 0.12, "triangle", 0.03), 90);
        setTimeout(() => this.playTone(784, 0.16, "triangle", 0.03), 180);
    }

    playDefeat() {
        this.playTone(330, 0.16, "sawtooth", 0.025);
        setTimeout(() => this.playTone(262, 0.22, "sawtooth", 0.025), 120);
    }
}