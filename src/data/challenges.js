export const CHALLENGES = [
  {
    id: "heatwave",
    name: "Heatwave",
    desc: "A heatwave hits! Crowds surge, but safety is strained. Keep lifeguards posted.",
    icon: "Sun",
    color: "from-amber-400 to-orange-500",
    duration: 3,
    effects: { guestMult: 1.4, incomeMult: 1.2, repDelta: -1 },
  },
  {
    id: "vip_visit",
    name: "VIP Visit",
    desc: "A VIP is touring your park. Hold reputation high for a big bonus.",
    icon: "Crown",
    color: "from-violet-400 to-purple-500",
    duration: 2,
    effects: {},
    resolve: {
      type: "vip",
      repRequired: 60,
      success: { money: 8000, rep: 5 },
      fail: { rep: -8 },
    },
  },
  {
    id: "rainy_day",
    name: "Rainy Day",
    desc: "Heavy rain keeps crowds away and cuts into income.",
    icon: "CloudRain",
    color: "from-slate-400 to-slate-600",
    duration: 2,
    effects: { guestMult: 0.5, incomeMult: 0.7 },
  },
  {
    id: "marketing_boom",
    name: "Marketing Boom",
    desc: "A viral campaign goes live, drawing extra crowds.",
    icon: "Megaphone",
    color: "from-emerald-400 to-green-500",
    duration: 3,
    effects: { guestMult: 1.3, incomeMult: 1.15 },
  },
  {
    id: "staff_strike",
    name: "Staff Strike",
    desc: "Staff demand higher pay. Wages surge for the duration.",
    icon: "Users",
    color: "from-rose-400 to-red-500",
    duration: 2,
    effects: { wageMult: 1.6 },
  },
  {
    id: "parts_shortage",
    name: "Parts Shortage",
    desc: "A parts shortage raises maintenance costs across all attractions.",
    icon: "Wrench",
    color: "from-orange-400 to-amber-600",
    duration: 3,
    effects: { upkeepMult: 1.5 },
  },
];

export function rollChallenge() {
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
}