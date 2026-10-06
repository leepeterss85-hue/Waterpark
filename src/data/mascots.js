export const MASCOTS = [
  {
    id: "dolphin",
    name: "Splashy the Dolphin",
    emoji: "🐬",
    color: "from-cyan-400 to-blue-500",
    moodBoost: 8,
    incomeBoost: 0.05,
    unlockLevel: 1,
    description: "A playful dolphin mascot that loves posing for photos with guests.",
  },
  {
    id: "shark",
    name: "Finn the Shark",
    emoji: "🦈",
    color: "from-slate-400 to-blue-600",
    moodBoost: 10,
    incomeBoost: 0.08,
    unlockLevel: 3,
    description: "A friendly shark mascot that thrills kids and boosts photo sales.",
  },
  {
    id: "flamingo",
    name: "Pinky the Flamingo",
    emoji: "🦩",
    color: "from-pink-400 to-rose-500",
    moodBoost: 7,
    incomeBoost: 0.06,
    unlockLevel: 2,
    description: "An elegant flamingo mascot that lifts guest mood and social appeal.",
  },
  {
    id: "octopus",
    name: "Tentacle the Octopus",
    emoji: "🐙",
    color: "from-violet-400 to-purple-600",
    moodBoost: 9,
    incomeBoost: 0.07,
    unlockLevel: 5,
    description: "A quirky octopus mascot with eight arms of fun and photo ops.",
  },
  {
    id: "turtle",
    name: "Shelly the Turtle",
    emoji: "🐢",
    color: "from-emerald-400 to-teal-600",
    moodBoost: 6,
    incomeBoost: 0.04,
    unlockLevel: 1,
    description: "A gentle turtle mascot that calms guests and boosts relaxation zones.",
  },
  {
    id: "penguin",
    name: "Pip the Penguin",
    emoji: "🐧",
    color: "from-slate-600 to-slate-800",
    moodBoost: 11,
    incomeBoost: 0.10,
    unlockLevel: 8,
    description: "The ultimate crowd-pleaser — waddles around drawing huge photo crowds.",
  },
];

export function getMascot(id) {
  return MASCOTS.find((m) => m.id === id) || null;
}

export function getUnlockedMascots(level) {
  return MASCOTS.filter((m) => level >= m.unlockLevel);
}