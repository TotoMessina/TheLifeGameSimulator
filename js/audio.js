
// --- AUDIO SYSTEM ---
const AudioSys = {
    ctx: null,
    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            this.ctx = new AudioContext();
        }
    },
    playTone(freq, type, duration) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    playClick() { this.playTone(400, 'sine', 0.1); },
    playMoney() { this.playTone(800, 'triangle', 0.2); },
    playSuccess() {
        this.playTone(600, 'sine', 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.2), 100);
    },
    playBad() {
        this.playTone(150, 'sawtooth', 0.4);
    },
    playNotification() {
        this.playTone(500, 'sine', 0.1);
        setTimeout(() => this.playTone(1000, 'sine', 0.1), 100);
    }
};

const Haptics = {
    pulse() {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
    },
    success() {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([10, 50, 10]);
    },
    error() {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
    },
    medium() {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(30);
    },
    heavy() {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(80);
    },
    double() {
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate([20, 30, 20]);
    }
};
