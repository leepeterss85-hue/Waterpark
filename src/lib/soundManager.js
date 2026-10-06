let audioCtx = null;
let muted = false;

function init() {
  if (typeof window === "undefined") return;
  muted = localStorage.getItem("splash-sound-muted") === "true";
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(freq, dur, type = "sine", vol = 0.12, delay = 0) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(t); osc.stop(t + dur);
}

function noiseBurst(dur, vol = 0.1, freq = 1500) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const size = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < size; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / size);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(filt); filt.connect(g); g.connect(ctx.destination);
  src.start();
}

init();

export const sound = {
  click() { tone(700, 0.04, "square", 0.05); },
  cash() { tone(1318, 0.08, "sine", 0.1); tone(1760, 0.12, "sine", 0.08, 0.05); },
  build() { tone(523, 0.08, "triangle", 0.1); tone(659, 0.08, "triangle", 0.1, 0.07); tone(784, 0.12, "triangle", 0.1, 0.14); },
  splash() { noiseBurst(0.25, 0.08, 2000); },
  achievement() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, "triangle", 0.1, i * 0.07)); },
  incident() { tone(140, 0.25, "sawtooth", 0.1); },
  dayStart() { tone(440, 0.08, "sine", 0.07); tone(554, 0.08, "sine", 0.07, 0.06); tone(659, 0.12, "sine", 0.07, 0.12); },
  levelUp() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, "triangle", 0.11, i * 0.08)); },
  upgrade() { tone(659, 0.06, "triangle", 0.08); tone(880, 0.1, "triangle", 0.08, 0.05); },
  hire() { tone(440, 0.05, "sine", 0.07); tone(587, 0.08, "sine", 0.07, 0.04); },
  expand() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.1, "triangle", 0.09, i * 0.06)); },
  reject() { tone(200, 0.12, "sawtooth", 0.06); },
  mission() { [659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.1, "triangle", 0.1, i * 0.06)); },
  research() { tone(880, 0.08, "sine", 0.08); tone(1175, 0.12, "sine", 0.08, 0.06); },
  vip() { [784, 988, 1319, 1568].forEach((f, i) => tone(f, 0.12, "triangle", 0.1, i * 0.07)); },
  disaster() { tone(80, 0.4, "sawtooth", 0.12); tone(60, 0.5, "sawtooth", 0.1, 0.1); },
  milestone() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.16, "triangle", 0.12, i * 0.09)); },
  toggle() { muted = !muted; localStorage.setItem("splash-sound-muted", String(muted)); return muted; },
  isMuted() { return muted; },
};