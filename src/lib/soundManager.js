let audioCtx = null;
let masterGain = null;
let effectsGain = null;
let ambienceLevelGain = null;
let musicGain = null;
let muted = false;
let volume = 0.7;
let categoryVolumes = { effects: 0.8, ambience: 0.55, music: 0.18 };
let musicTimer = null;
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

const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 587.33];
function startMusic() {
  if (musicTimer || !audioCtx || !hasUserGesture || muted) return;
  musicStep = 0;
  const playStep = () => {
    if (!audioCtx || audioCtx.state !== "running" || muted || !hasUserGesture) return;
    const time = audioCtx.currentTime;
    const notes = [melody[musicStep % melody.length], melody[(musicStep + 4) % melody.length] / 2];
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, time);
      filter.type = "lowpass"; filter.frequency.value = 1400;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.035 : 0.018, time + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.05);
      osc.connect(filter); filter.connect(gain); gain.connect(musicGain || masterGain);
      osc.start(time); osc.stop(time + 1.08);
    });
    musicStep = (musicStep + 1) % melody.length;
  };
  playStep();
  musicTimer = window.setInterval(playStep, 900);
}
function stopMusic() {
  if (musicTimer !== null && typeof window !== "undefined") window.clearInterval(musicTimer);
  musicTimer = null;
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
  setAmbience(weather = "clear", timeOfDay = "day") {
    ambienceWanted = { weather: typeof weather === "string" ? weather : weather?.id || "clear", timeOfDay: timeOfDay || "day" };
    if (muted) { stopAmbience(); stopMusic(); return; }
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
    if (muted) { stopAmbience(); stopMusic(); }
    else { unlockAudio(); applyAmbience(); startMusic(); }
    return muted;
  },
  isMuted() { return muted; },
};
