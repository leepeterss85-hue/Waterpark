// Visual Themes: unlockable park skins that reskin the game board.
// Each theme is unlocked at a certain level and applies a CSS class to the board.

export const VISUAL_THEMES = [
  {
    id: "tropical",
    name: "Tropical Paradise",
    desc: "Classic lush green water park look.",
    unlockLevel: 1,
    cssClass: "theme-tropical",
    preview: "from-green-400 to-cyan-500",
  },
  {
    id: "pirate",
    name: "Pirate Cove",
    desc: "Weathered wood and treasure vibes.",
    unlockLevel: 8,
    cssClass: "theme-pirate",
    preview: "from-amber-700 to-yellow-600",
  },
  {
    id: "scifi",
    name: "Aqua Station",
    desc: "Futuristic neon water world.",
    unlockLevel: 15,
    cssClass: "theme-scifi",
    preview: "from-indigo-500 to-cyan-400",
  },
  {
    id: "sunset",
    name: "Sunset Bay",
    desc: "Warm golden hour glow across the park.",
    unlockLevel: 25,
    cssClass: "theme-sunset",
    preview: "from-orange-400 to-rose-500",
  },
  {
    id: "frozen",
    name: "Frozen Falls",
    desc: "Icy blue winter wonderland water park.",
    unlockLevel: 35,
    cssClass: "theme-frozen",
    preview: "from-sky-300 to-blue-200",
  },
  {
    id: "golden",
    name: "Golden Empire",
    desc: "Luxurious gold and marble prestige look.",
    unlockLevel: 45,
    cssClass: "theme-golden",
    preview: "from-yellow-400 to-amber-500",
  },
];

export function getUnlockedThemes(level) {
  return VISUAL_THEMES.filter((t) => level >= t.unlockLevel);
}

export function getTheme(id) {
  return VISUAL_THEMES.find((t) => t.id === id) || VISUAL_THEMES[0];
}