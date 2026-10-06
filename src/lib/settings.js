// Persistent game settings: vibration + difficulty. Sound is owned by soundManager.
const KEY = "splash-settings";

const DEFAULTS = { vibration: true, difficulty: "normal", sandbox: false, emailAlerts: true };

export const DIFFICULTIES = [
  { id: "easy", label: "Easy", desc: "Generous starting budget, lighter upkeep", moneyMult: 1.6, upkeepMult: 0.85 },
  { id: "normal", label: "Normal", desc: "Balanced tycoon challenge", moneyMult: 1, upkeepMult: 1 },
  { id: "hard", label: "Hard", desc: "Tight budget, heavier upkeep", moneyMult: 0.6, upkeepMult: 1.2 },
];

export function getDifficulty(id) {
  return DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1];
}

export function getSettings() {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

// Haptics
let vibrationEnabled = getSettings().vibration;

export const haptics = {
  isEnabled() {
    return vibrationEnabled;
  },
  setEnabled(v) {
    vibrationEnabled = !!v;
  },
  buzz(pattern = 18) {
    if (!vibrationEnabled) return;
    if (typeof navigator === "undefined" || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  },
};