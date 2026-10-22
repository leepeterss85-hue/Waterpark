// Persistent game settings: vibration + difficulty. Sound is owned by soundManager.
const KEY = "splash-settings";

const DEFAULTS = { vibration: true, difficulty: "normal", sandbox: false, emailAlerts: true, pushAlerts: true, graphicsQuality: "ultra" };

export const GRAPHICS_PRESETS = [
  { id: "ultra", label: "Ultra", desc: "Maximum water detail, lighting, reflections, scenery and effects" },
  { id: "rich", label: "High", desc: "Detailed graphics with slightly lighter effects" },
  { id: "balanced", label: "Balanced", desc: "Battery-friendly graphics with fewer effects" },
];

export function normaliseGraphicsQuality(value) {
  return GRAPHICS_PRESETS.some((preset) => preset.id === value) ? value : "ultra";
}

export function getGraphicsQuality() {
  return normaliseGraphicsQuality(getSettings().graphicsQuality);
}

export function setGraphicsQuality(value) {
  const graphicsQuality = normaliseGraphicsQuality(value);
  saveSettings({ graphicsQuality });
  return graphicsQuality;
}

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
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    // Preserve older user-selected Balanced/High settings while new installs
    // begin at maximum graphics. Do not modify anyone's saved game state.
    const legacy = localStorage.getItem("aqua-graphics");
    const graphicsQuality = saved && Object.hasOwn(saved, "graphicsQuality")
      ? normaliseGraphicsQuality(saved.graphicsQuality)
      : legacy === "balanced" || legacy === "rich" ? legacy : "ultra";
    return { ...DEFAULTS, ...(saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {}), graphicsQuality };
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