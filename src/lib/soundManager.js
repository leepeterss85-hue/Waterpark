let audioCtx = null;
let masterGain = null;
let effectsGain = null;
let ambienceLevelGain = null;
let musicGain = null;
let muted = false;
let volume = 0.7;
let categoryVolumes = { effects: 0.8, ambience: 0.42, music: 0.38 };
let musicTimer = null;
let lifeTimer = null;
let musicStep = 0;
let ambienceKey = "";
let ambienceNodes = [];
let ambienceGain = null;
let ambienceWanted = { weather: "clear", timeOfDay: "day" };
let hasUserGesture = false;

function readMuted() {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem("splash-sound-muted") === "true"; } catch { return false; }
}

function init() {
  muted = readMuted();
  try {
    const savedVolume = Number(window.localStorage.getItem("waterpark-sound-volume"));
    if (Number.isFinite(savedVolume) && window.localStorage.getItem("waterpark-sound-volume") !== null) volume = Math.max(0, Math.min(1, savedVolume));
  } catch {}
  try {
    const saved = window.localStorage.getItem("waterpark-audio-mix");
    if (saved) {
      const parsed = JSON.parse(saved);
      for (const key of ["effects", "ambience", "music"]) {
        if (Number.isFinite(parsed[key])) categoryVolumes[key] = Math.max(0, Math.min(1, parsed[key]));
      }
    }
  } catch {}
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = muted ? 0 : volume;
      masterGain.connect(audioCtx.destination);
      effectsGain = audioCtx.createGain();
      effectsGain.gain.value = categoryVolumes.effects;
      effectsGain.connect(masterGain);
      ambienceLevelGain = audioCtx.createGain();
      ambienceLevelGain.gain.value = categoryVolumes.ambience;
      ambienceLevelGain.connect(masterGain);
      musicGain = audioCtx.createGain();
      musicGain.gain.value = categoryVolumes.music;
      musicGain.connect(masterGain);
      audioCtx.addEventListener?.("statechange", () => {
        if (audioCtx?.state === "running" && hasUserGesture) applyAmbience();
      });
    } catch { return null; }
  }
  if (audioCtx.state === "suspended" && hasUserGesture) audioCtx.resume().catch(() => {});
  return audioCtx;
}

function unlockAudio() {
  hasUserGesture = true;
  const ctx = getCtx();
  if (ctx?.state === "suspended") ctx.resume().then(() => applyAmbience()).catch(() => {});
  else if (ctx?.state === "running") applyAmbience();
  return ctx;
}

function updateMasterGain() {
  if (!masterGain || !audioCtx) return;
  const target = muted ? 0 : volume;
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.035);
}

function tone(freq, dur, type = "sine", vol = 0.12, delay = 0) {
  if (muted) return;
  const ctx = unlockAudio();
  if (!ctx || !masterGain) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(effectsGain || masterGain);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function noiseBurst(dur, vol = 0.1, freq = 1500) {
  if (muted) return;
  const ctx = unlockAudio();
  if (!ctx || !masterGain) return;
  const size = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, size, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < size; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / size);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(filt); filt.connect(g); g.connect(effectsGain || masterGain);
  src.start();
}

function stopAmbience() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  if (ambienceGain) {
    try {
      ambienceGain.gain.cancelScheduledValues(now);
      ambienceGain.gain.setTargetAtTime(0, now, 0.12);
    } catch {}
  }
  const oldNodes = ambienceNodes;
  ambienceNodes = [];
  ambienceGain = null;
  ambienceKey = "";
  window.setTimeout?.(() => {
    oldNodes.forEach((node) => {
      try { node.stop?.(); } catch {}
      try { node.disconnect?.(); } catch {}
    });
  }, 650);
}

function addNoiseLayer(ctx, destination, { frequency = 700, q = 0.5, gain = 0.015, rate = 0.08 } = {}) {
  const size = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) channel[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const gainNode = ctx.createGain();
  gainNode.gain.value = gain;
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(destination);
  source.start();
  ambienceNodes.push(source, filter, gainNode);
  if (rate > 0) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = rate;
    lfoGain.gain.value = gain * 0.42;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    ambienceNodes.push(lfo, lfoGain);
  }
}

function addDrone(ctx, destination, frequency, gain, type = "sine") {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(destination);
  osc.start();
  ambienceNodes.push(osc, g);
}

// Original, synthesised hard-rock backing: palm-muted power-chord guitar,
 // melodic lead, bass and a punchy rock drum groove. No copied songs or recordings.
const riffRoots = [82.41, 82.41, 98, 82.41, 110, 110, 98, 82.41, 82.41, 82.41, 130.81, 110, 98, 98, 110, 146.83];
const chordRoots = [82.41, 110, 98, 73.42]; // E5, A5, G5, D5 power-chord movement
let rockDrumNoise = null;
let rockDistortion = null;

function getRockNoise(ctx) {
  if (rockDrumNoise) return rockDrumNoise;
  const length = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  rockDrumNoise = buffer;
  return buffer;
}

function getRockDistortion(ctx) {
  if (rockDistortion) return rockDistortion;
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(4096);
  for (let i = 0; i < curve.length; i++) {
    const x = (i * 2) / (curve.length - 1) - 1;
    curve[i] = Math.tanh(5.5 * x);
  }
  shaper.curve = curve;
  shaper.oversample = "2x";
  rockDistortion = shaper;
  return shaper;
}

function rockGuitar(freq, time, duration = 0.19, level = 0.035, sustain = false) {
  const ctx = audioCtx;
  if (!ctx || !musicGain) return;
  const out = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(sustain ? 2100 : 1450, time);
  filter.Q.value = 0.7;
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, time);
  envelope.gain.linearRampToValueAtTime(level, time + 0.012);
  envelope.gain.setTargetAtTime(level * (sustain ? 0.72 : 0.18), time + 0.035, sustain ? 0.12 : 0.045);
  envelope.gain.setTargetAtTime(0.0001, time + duration * 0.62, sustain ? 0.22 : 0.055);
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  oscA.type = "sawtooth";
  oscB.type = "sawtooth";
  oscA.frequency.setValueAtTime(freq, time);
  oscB.frequency.setValueAtTime(freq * 1.006, time);
  const mix = ctx.createGain();
  mix.gain.value = 0.55;
  oscA.connect(mix);
  oscB.connect(mix);
  mix.connect(getRockDistortion(ctx));
  getRockDistortion(ctx).connect(filter);
  filter.connect(envelope);
  envelope.connect(out);
  out.connect(musicGain);
  oscA.start(time); oscB.start(time);
  oscA.stop(time + duration + 0.04); oscB.stop(time + duration + 0.04);
  oscA.onended = () => { try { out.disconnect(); filter.disconnect(); envelope.disconnect(); mix.disconnect(); } catch {} };
}

function rockBass(freq, time, duration = 0.22) {
  const ctx = audioCtx;
  if (!ctx || !musicGain) return;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, time);
  filter.type = "lowpass";
  filter.frequency.value = 240;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(0.055, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(filter); filter.connect(gain); gain.connect(musicGain);
  osc.start(time); osc.stop(time + duration + 0.02);
}

function rockKick(time) {
  const ctx = audioCtx;
  if (!ctx || !musicGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(135, time);
  osc.frequency.exponentialRampToValueAtTime(48, time + 0.14);
  gain.gain.setValueAtTime(0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
  osc.connect(gain); gain.connect(musicGain);
  osc.start(time); osc.stop(time + 0.2);
}

function rockSnare(time) {
  const ctx = audioCtx;
  if (!ctx || !musicGain) return;
  const source = ctx.createBufferSource();
  source.buffer = getRockNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass"; filter.frequency.value = 1300;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(0.075, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
  source.connect(filter); filter.connect(gain); gain.connect(musicGain);
  source.start(time); source.stop(time + 0.14);
}

function rockHat(time, open = false) {
  const ctx = audioCtx;
  if (!ctx || !musicGain) return;
  const source = ctx.createBufferSource();
  source.buffer = getRockNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass"; filter.frequency.value = 6500;
  const gain = ctx.createGain();
  const end = open ? 0.12 : 0.045;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(open ? 0.026 : 0.016, time + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + end);
  source.connect(filter); filter.connect(gain); gain.connect(musicGain);
  source.start(time); source.stop(time + end + 0.01);
}

function startMusic() {
  if (musicTimer || !audioCtx || !hasUserGesture || muted) return;
  musicStep = 0;
  const playStep = () => {
    if (!audioCtx || audioCtx.state !== "running" || muted || !hasUserGesture) return;
    const time = audioCtx.currentTime + 0.012;
    const step = musicStep % 16;
    const root = riffRoots[step];
    // Driving, syncopated guitar riff with a sustained chord at each bar.
    if ([0, 3, 6, 8, 11, 14, 15].includes(step)) {
      rockGuitar(root, time, step % 4 === 0 ? 0.31 : 0.17, step % 4 === 0 ? 0.043 : 0.03, step % 4 === 0);
    }
    if (step % 4 === 0) {
      const chord = chordRoots[Math.floor(step / 4) % chordRoots.length];
      rockGuitar(chord * 1.5, time, 0.56, 0.022, true);
      rockBass(chord, time, 0.38);
    } else if (step % 2 === 0) {
      rockBass(root, time, 0.17);
    }
    if ([0, 6, 8, 10].includes(step)) rockKick(time);
    if (step === 4 || step === 12) rockSnare(time);
    if (step % 2 === 0) rockHat(time, step === 14);
    musicStep = (musicStep + 1) % 16;
  };
  playStep();
  musicTimer = window.setInterval(playStep, 220);
}
function stopMusic() {
  if (musicTimer !== null && typeof window !== "undefined") window.clearInterval(musicTimer);
  musicTimer = null;
}
function startParkLife() {
  if (lifeTimer !== null || !audioCtx || !hasUserGesture || muted || typeof window === "undefined") return;
  lifeTimer = window.setInterval(() => {
    if (!audioCtx || audioCtx.state !== "running" || muted || !ambienceLevelGain) return;
    const now = audioCtx.currentTime;
    // Tiny, infrequent synthetic water/guest accents sit under the main ambience.
    const isSplash = Math.random() < 0.62;
    const duration = isSplash ? 0.24 : 0.42;
    const length = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = audioCtx.createBufferSource(); source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = isSplash ? 1250 : 650; filter.Q.value = 0.55;
    const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(isSplash ? 0.012 : 0.006, now + 0.035); gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter); filter.connect(gain); gain.connect(ambienceLevelGain); source.start(now); source.stop(now + duration + 0.02);
    if (!isSplash && Math.random() < 0.35) {
      const osc = audioCtx.createOscillator(); const toneGain = audioCtx.createGain();
      osc.type = "sine"; osc.frequency.value = 520 + Math.random() * 260;
      toneGain.gain.setValueAtTime(0.0001, now); toneGain.gain.linearRampToValueAtTime(0.004, now + 0.04); toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(toneGain); toneGain.connect(ambienceLevelGain); osc.start(now); osc.stop(now + 0.2);
    }
  }, 14500);
}
function stopParkLife() {
  if (lifeTimer !== null && typeof window !== "undefined") window.clearInterval(lifeTimer);
  lifeTimer = null;
}

function applyAmbience() {
  const ctx = audioCtx;
  if (!ctx || ctx.state !== "running" || !hasUserGesture || muted) return;
  const weather = ambienceWanted.weather || "clear";
  const timeOfDay = ambienceWanted.timeOfDay || "day";
  const key = weather + ":" + timeOfDay;
  if (key === ambienceKey && ambienceGain) return;
  stopAmbience();
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.connect(ambienceLevelGain || masterGain);
  ambienceGain = bus;
  ambienceKey = key;

  // Gentle, synthesised park atmosphere; no remote audio files or tracking.
  const isRain = ["rain", "rainy", "storm", "thunderstorm"].includes(weather);
  const isNight = timeOfDay === "night";
  const isSunset = timeOfDay === "sunset";
  if (isRain) {
    addNoiseLayer(ctx, bus, { frequency: weather.includes("storm") ? 1250 : 1800, q: 0.4, gain: 0.018, rate: 0.16 });
    addNoiseLayer(ctx, bus, { frequency: 380, q: 0.7, gain: 0.009, rate: 0.07 });
    if (["storm", "thunderstorm"].includes(weather)) addDrone(ctx, bus, 48, 0.006, "triangle");
  } else {
    // Water and distant crowd are soft filtered noise, not loud constant white noise.
    addNoiseLayer(ctx, bus, { frequency: 1050, q: 0.35, gain: 0.009, rate: 0.12 });
    addNoiseLayer(ctx, bus, { frequency: 420, q: 0.5, gain: 0.0045, rate: 0.055 });
    if (isNight) {
      addDrone(ctx, bus, 196, 0.0028);
      addDrone(ctx, bus, 293.66, 0.0016);
    } else if (isSunset) {
      addDrone(ctx, bus, 261.63, 0.0018);
    }
  }
  bus.gain.setTargetAtTime(isNight ? 0.38 : 0.55, ctx.currentTime, 0.9);
  startMusic();
  startParkLife();
}

init();

export const sound = {
  click() { tone(700, 0.04, "square", 0.05); },
  cash() { tone(1318, 0.08, "sine", 0.1); tone(1760, 0.12, "sine", 0.08, 0.05); },
  build() { tone(523, 0.08, "triangle", 0.1); tone(659, 0.08, "triangle", 0.1, 0.07); tone(784, 0.12, "triangle", 0.1, 0.14); },
  splash() { noiseBurst(0.25, 0.08, 2000); },
  attraction(item) {
    const label = typeof item === "string" ? item.toLowerCase() : `${item?.id || ""} ${item?.name || ""} ${item?.category || ""}`.toLowerCase();
    if (/wave|surf/.test(label)) { tone(95, 0.65, "sine", 0.1); noiseBurst(0.45, 0.11, 650); tone(220, 0.22, "sine", 0.06, 0.3); }
    else if (/lazy|river|rapids/.test(label)) { noiseBurst(0.5, 0.055, 850); tone(440, 0.3, "sine", 0.025, 0.1); }
    else if (/fountain|spray|splash|pool/.test(label)) { noiseBurst(0.32, 0.09, 2300); tone(880, 0.16, "sine", 0.035, 0.06); }
    else if (/slide|flume|drop|coaster|thrill/.test(label)) { tone(330, 0.22, "sawtooth", 0.045); tone(220, 0.35, "triangle", 0.055, 0.12); noiseBurst(0.22, 0.065, 1800, 0.2); }
    else { noiseBurst(0.22, 0.06, 1600); tone(659, 0.1, "sine", 0.04, 0.06); }
  },
  guestCheer() { noiseBurst(0.18, 0.025, 900); [659, 784, 988].forEach((f, i) => tone(f, 0.12, "triangle", 0.045, i * 0.07)); },
  announcement() { [587, 784, 659].forEach((f, i) => tone(f, 0.16, "sine", 0.06, i * 0.18)); },
  breakdown() { tone(220, 0.18, "square", 0.07); tone(164, 0.28, "square", 0.055, 0.2); },
  hotel() { [392, 523, 659].forEach((f, i) => tone(f, 0.12, "sine", 0.055, i * 0.09)); },
  weatherChange(weather) {
    const kind = String(weather || "clear").toLowerCase();
    if (/storm|thunder/.test(kind)) { tone(72, 0.7, "triangle", 0.11); noiseBurst(0.5, 0.045, 300); }
    else if (/rain/.test(kind)) noiseBurst(0.45, 0.045, 1800);
    else this.announcement();
  },
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
  setAmbience(weather = "clear", timeOfDay = "day") {
    ambienceWanted = { weather: typeof weather === "string" ? weather : weather?.id || "clear", timeOfDay: timeOfDay || "day" };
    if (muted) { stopAmbience(); stopMusic(); stopParkLife(); return; }
    // Setting a scene never starts audio until the player interacts/unlocks audio.
    if (hasUserGesture) applyAmbience();
  },
  setVolume(nextVolume) {
    const parsed = Number(nextVolume);
    if (!Number.isFinite(parsed)) return volume;
    volume = Math.max(0, Math.min(1, parsed));
    try { if (typeof window !== "undefined") window.localStorage.setItem("waterpark-sound-volume", String(volume)); } catch {}
    updateMasterGain();
    return volume;
  },
  getVolume() { return volume; },
  setCategoryVolume(category, nextVolume) {
    if (!(category in categoryVolumes)) return null;
    const parsed = Number(nextVolume);
    if (!Number.isFinite(parsed)) return categoryVolumes[category];
    categoryVolumes[category] = Math.max(0, Math.min(1, parsed));
    const target = categoryVolumes[category];
    const node = category === "effects" ? effectsGain : category === "ambience" ? ambienceLevelGain : musicGain;
    if (node && audioCtx) node.gain.setTargetAtTime(target, audioCtx.currentTime, 0.04);
    try { if (typeof window !== "undefined") window.localStorage.setItem("waterpark-audio-mix", JSON.stringify(categoryVolumes)); } catch {}
    return target;
  },
  getCategoryVolume(category) { return categoryVolumes[category] ?? 0; },
  toggle() {
    muted = !muted;
    try { if (typeof window !== "undefined") window.localStorage.setItem("splash-sound-muted", String(muted)); } catch {}
    updateMasterGain();
    if (muted) { stopAmbience(); stopMusic(); stopParkLife(); }
    else { unlockAudio(); applyAmbience(); startMusic(); startParkLife(); }
    return muted;
  },
  isMuted() { return muted; },
};
