// Procedural Web Audio API sound effects and soundtrack controller for Tetris React

class SoundController {
    constructor() {
        this.ctx = null;
        this.bgmAudio = null;
        this.isMuted = false;
        try {
            const saved = localStorage.getItem('tetris_sound_muted');
            if (saved !== null) {
                this.isMuted = JSON.parse(saved);
            }
        } catch (e) {
            this.isMuted = false;
        }
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initBGM() {
        if (!this.bgmAudio && typeof Audio !== 'undefined') {
            try {
                this.bgmAudio = new Audio(process.env.PUBLIC_URL + '/Tetris.mp3');
                this.bgmAudio.loop = true;
                this.bgmAudio.volume = 0.35;
                if (!this.isMuted) {
                    this.bgmAudio.play().catch(() => {});
                }
            } catch (e) {}
        }
    }

    setLevel(level) {
        if (this.bgmAudio) {
            try {
                // Dynamically scale music playbackRate from 1.0x up to 1.30x with level
                const rate = Math.min(1.30, 1.0 + Math.max(0, level - 1) * 0.035);
                this.bgmAudio.playbackRate = rate;
            } catch (e) {}
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem('tetris_sound_muted', JSON.stringify(this.isMuted));
        } catch (e) {}

        if (this.bgmAudio) {
            if (this.isMuted) {
                this.bgmAudio.pause();
            } else {
                this.bgmAudio.play().catch(() => {});
            }
        }

        if (!this.isMuted) {
            this.playClick();
        }
        return this.isMuted;
    }

    playMove() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    playRotate() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.06);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playDrop() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playLineClear(lines = 1) {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = lines >= 4
            ? [523.25, 659.25, 783.99, 1046.50] // Tetris 4-line fanfare
            : [440, 554.37, 659.25];

        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
            const start = now + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.18, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.16);
        });
    }

    playGameOver() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const notes = [293.66, 261.63, 220, 174.61];
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const start = now + idx * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.16, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.2);
        });
    }

    playClick() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }
}

export const sound = new SoundController();
