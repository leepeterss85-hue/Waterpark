import { ATTRACTIONS } from "./gameData";

const ATTRACTION_TYPES = ATTRACTIONS.filter((a) => a.category === "attraction").length;

export const ACHIEVEMENTS = [
  { id: "first_guests", title: "First Guests", desc: "Welcome 100 guests in a single day.", icon: "Users", color: "from-cyan-400 to-teal-500", check: (s) => s.peakGuests >= 100 },
  { id: "crowd_pleaser", title: "Crowd Pleaser", desc: "Welcome 500 guests in a single day.", icon: "Droplets", color: "from-blue-400 to-indigo-500", check: (s) => s.peakGuests >= 500 },
  { id: "mega_park", title: "Mega Park", desc: "Welcome 1,000 guests in a single day.", icon: "Waves", color: "from-sky-400 to-blue-500", check: (s) => s.peakGuests >= 1000 },
  { id: "first_profit", title: "First Profit", desc: "Earn $10,000 in total revenue.", icon: "ShoppingBag", color: "from-emerald-400 to-green-500", check: (s) => s.lifetimeEarnings >= 10000 },
  { id: "tycoon", title: "Tycoon", desc: "Earn $1,000,000 in total revenue.", icon: "TrendingUp", color: "from-emerald-500 to-teal-600", check: (s) => s.lifetimeEarnings >= 1000000 },
  { id: "builder", title: "Builder", desc: "Build 5 different attractions.", icon: "Castle", color: "from-amber-400 to-orange-500", check: (s) => s.builtCount >= 5 },
  { id: "collector", title: "Collector", desc: "Build every type of water attraction.", icon: "Trophy", color: "from-violet-400 to-fuchsia-500", check: (s) => s.builtCount >= ATTRACTION_TYPES },
  { id: "maxed_out", title: "Maxed Out", desc: "Fully upgrade any attraction.", icon: "Zap", color: "from-fuchsia-400 to-purple-600", check: (s) => s.maxedUpgrades >= 1 },
  { id: "expanding", title: "Expanding", desc: "Expand your park area at least once.", icon: "Maximize2", color: "from-sky-400 to-cyan-500", check: (s) => s.expansionsDone >= 1 },
  { id: "survivor", title: "Survivor", desc: "Reach Day 30.", icon: "CalendarDays", color: "from-rose-400 to-red-500", check: (s) => s.day >= 30 },
  { id: "high_roller", title: "High Roller", desc: "Hold $100,000 cash at once.", icon: "Sparkles", color: "from-yellow-400 to-amber-500", check: (s) => s.money >= 100000 },
  { id: "renowned", title: "Renowned", desc: "Reach 95% reputation.", icon: "Star", color: "from-amber-400 to-orange-500", check: (s) => s.reputation >= 95 },
];

export function unlockedAchievements(state) {
  return ACHIEVEMENTS.filter((a) => a.check(state));
}