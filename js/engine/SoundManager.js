export default class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.6;
        this.volumePresets = [0, 0.3, 0.6, 1];
        this.musicState = {
            track: null,
            intervals: [],
            timers: [],
            masterGain: null
        };
        this.lastPlayedAt = new Map();
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

    getVolumeLabel() {
        if (this.masterVolume <= 0) return "MUTE";
        return `VOL ${Math.round(this.masterVolume * 100)}`;
    }

    cycleVolume() {
        const currentIndex = this.volumePresets.findIndex((value) => Math.abs(value - this.masterVolume) < 0.001);
        const nextIndex = currentIndex === -1 ? 2 : (currentIndex + 1) % this.volumePresets.length;
        this.setMasterVolume(this.volumePresets[nextIndex]);
        this.playClick();
        return this.masterVolume;
    }

    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        if (this.musicState.masterGain) {
            const ctx = this.ensureContext();
            if (ctx) {
                this.musicState.masterGain.gain.cancelScheduledValues(ctx.currentTime);
                this.musicState.masterGain.gain.setValueAtTime(this.musicState.masterGain.gain.value, ctx.currentTime);
                this.musicState.masterGain.gain.linearRampToValueAtTime(this.masterVolume * 0.06, ctx.currentTime + 0.12);
            }
        }
    }

    shouldThrottle(key, minGapMs) {
        const now = performance.now();
        const previous = this.lastPlayedAt.get(key) ?? 0;
        if (now - previous < minGapMs) return true;
        this.lastPlayedAt.set(key, now);
        return false;
    }

    createTone({ frequency = 440, duration = 0.12, type = "sine", volume = 0.05, attack = 0.01, release = 0.07, when = 0 }) {
        const ctx = this.ensureContext();
        if (!ctx || this.masterVolume <= 0) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const now = ctx.currentTime + when;
        const endTime = now + duration;
        const peakVolume = volume * this.masterVolume;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(peakVolume, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime + release);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(now);
        oscillator.stop(endTime + release + 0.02);
    }

    playTone(frequency, duration = 0.08, type = "sine", volume = 0.03, when = 0) {
        this.createTone({ frequency, duration, type, volume, when });
    }

    stopMusic() {
        this.musicState.intervals.forEach((id) => clearInterval(id));
        this.musicState.timers.forEach((id) => clearTimeout(id));
        this.musicState.intervals = [];
        this.musicState.timers = [];

        const ctx = this.ensureContext();
        if (ctx && this.musicState.masterGain) {
            const gain = this.musicState.masterGain.gain;
            gain.cancelScheduledValues(ctx.currentTime);
            gain.setValueAtTime(gain.value || 0.0001, ctx.currentTime);
            gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        }

        this.musicState.track = null;
        this.musicState.masterGain = null;
    }

    connectMusicGain() {
        const ctx = this.ensureContext();
        if (!ctx) return null;

        const gainNode = ctx.createGain();
        gainNode.gain.value = this.masterVolume * 0.06;
        gainNode.connect(ctx.destination);
        this.musicState.masterGain = gainNode;
        return gainNode;
    }

    scheduleMusicPulse({ notes, intervalMs, type = "sine", volume = 0.035, duration = 0.22, octaveShift = 1, startDelay = 0 }) {
        const pulse = () => {
            const ctx = this.ensureContext();
            if (!ctx || !this.musicState.masterGain || this.masterVolume <= 0) return;

            const root = notes[Math.floor((performance.now() / intervalMs) % notes.length)];
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const now = ctx.currentTime;
            const frequency = root * octaveShift;

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);

            gainNode.gain.setValueAtTime(0.0001, now);
            gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.musicState.masterGain);
            oscillator.start(now);
            oscillator.stop(now + duration + 0.03);
        };

        const timerId = window.setTimeout(() => {
            pulse();
            const intervalId = window.setInterval(pulse, intervalMs);
            this.musicState.intervals.push(intervalId);
        }, startDelay);

        this.musicState.timers.push(timerId);
    }

    startMenuMusic() {
        if (this.musicState.track === "menu") return;
        this.stopMusic();
        if (!this.connectMusicGain()) return;

        this.musicState.track = "menu";
        this.scheduleMusicPulse({ notes: [261.63, 329.63, 392.0, 329.63], intervalMs: 900, type: "triangle", volume: 0.045, duration: 0.52 });
        this.scheduleMusicPulse({ notes: [523.25, 659.25, 587.33, 659.25], intervalMs: 450, type: "sine", volume: 0.02, duration: 0.18, startDelay: 120 });
    }

    startGameplayMusic() {
        if (this.musicState.track === "gameplay") return;
        this.stopMusic();
        if (!this.connectMusicGain()) return;

        this.musicState.track = "gameplay";
        this.scheduleMusicPulse({ notes: [146.83, 174.61, 196.0, 174.61], intervalMs: 700, type: "sawtooth", volume: 0.038, duration: 0.32 });
        this.scheduleMusicPulse({ notes: [293.66, 349.23, 392.0, 349.23], intervalMs: 350, type: "square", volume: 0.012, duration: 0.08, startDelay: 90 });
        this.scheduleMusicPulse({ notes: [220.0, 246.94, 261.63, 246.94], intervalMs: 1400, type: "triangle", volume: 0.02, duration: 0.55, startDelay: 180 });
    }

    playClick() {
        this.playTone(540, 0.04, "square", 0.022);
    }

    playConfirm() {
        this.playTone(620, 0.06, "triangle", 0.028);
        this.playTone(820, 0.07, "triangle", 0.028, 0.05);
    }

    playPlaceTower() {
        this.playTone(410, 0.05, "square", 0.025);
        this.playTone(560, 0.08, "triangle", 0.022, 0.03);
    }

    playUpgrade() {
        this.playTone(520, 0.05, "triangle", 0.026);
        this.playTone(680, 0.06, "triangle", 0.026, 0.05);
        this.playTone(860, 0.08, "triangle", 0.024, 0.1);
    }

    playSell() {
        this.playTone(520, 0.06, "triangle", 0.024);
        this.playTone(360, 0.09, "sine", 0.022, 0.04);
    }

    playEnemyHit() {
        if (this.shouldThrottle("enemy-hit", 45)) return;
        this.playTone(220, 0.03, "square", 0.012);
    }

    playExplosion() {
        if (this.shouldThrottle("explosion", 80)) return;
        this.playTone(110, 0.08, "sawtooth", 0.03);
        this.playTone(68, 0.12, "triangle", 0.022, 0.02);
    }

    playWaveStart() {
        this.playTone(392, 0.08, "triangle", 0.024);
        this.playTone(523.25, 0.08, "triangle", 0.024, 0.07);
    }

    playBossSpawn() {
        this.playTone(164.81, 0.18, "sawtooth", 0.028);
        this.playTone(123.47, 0.22, "sawtooth", 0.026, 0.12);
    }

    playVictory() {
        this.playTone(523.25, 0.12, "triangle", 0.03);
        this.playTone(659.25, 0.12, "triangle", 0.03, 0.1);
        this.playTone(783.99, 0.18, "triangle", 0.03, 0.2);
    }

    playDefeat() {
        this.playTone(329.63, 0.16, "sawtooth", 0.026);
        this.playTone(246.94, 0.22, "sawtooth", 0.026, 0.12);
    }
}
