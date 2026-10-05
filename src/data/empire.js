// Empire system: endgame progression, resort-wide bonuses, and legendary objectives.
import { categorizeResortFacilities } from "./resort";

export const EMPIRE_TIERS = [
  { id: 0, name: "Tycoon", threshold: 0, bonuses: { income: 0.05, demand: 0.05, satisfaction: 0 }, color: "from-cyan-400 to-blue-500", desc: "Your resort empire begins to take shape." },
  { id: 1, name: "Magnate", threshold: 500, bonuses: { income: 0.10, demand: 0.10, satisfaction: 0.05 }, color: "from-violet-400 to-purple-600", desc: "A rising force in the resort world." },
  { id: 2, name: "Mogul", threshold: 2000, bonuses: { income: 0.15, demand: 0.15, satisfaction: 0.10 }, color: "from-amber-400 to-orange-600", desc: "A dominant resort mogul." },
  { id: 3, name: "Empire", threshold: 5000, bonuses: { income: 0.25, demand: 0.25, satisfaction: 0.15 }, color: "from-rose-400 to-fuchsia-600", desc: "A true waterpark empire." },
  { id: 4, name: "Legend", threshold: 12000, bonuses: { income: 0.40, demand: 0.40, satisfaction: 0.20 }, color: "from-yellow-300 via-amber-400 to-rose-500", desc: "A legendary waterpark empire that will be remembered for generations." },
];

export function getEmpireTier(empirePoints) {
  let tier = EMPIRE_TIERS[0];
  for (const t of EMPIRE_TIERS) {
    if (empirePoints >= t.threshold) tier = t;
  }
  return tier;
}

export function getNextEmpireTier(empirePoints) {
  for (const t of EMPIRE_TIERS) {
    if (empirePoints < t.threshold) return t;
  }
  return null;
}

// Resort-wide bonuses from facility coverage across the entire resort.
export function calculateResortBonuses(grid) {
  const facilities = categorizeResortFacilities(grid);
  const counts = {
    luxury: facilities.luxury.count,
    dining: facilities.restaurants.count,
    wellness: facilities.spaWellness.count,
    entertainment: facilities.entertainment.count,
    shops: facilities.shops.count,
  };
  const allCategories = Object.values(counts).filter((c) => c > 0).length;
  const completeBonus = allCategories >= 5 ? 0.05 : 0;

  return {
    spending: Math.min(0.10, counts.luxury * 0.01) + completeBonus,
    hungerReduction: Math.min(0.20, counts.dining * 0.02),
    moodBoost: Math.min(5, counts.wellness * 0.5),
    energyBoost: Math.min(5, counts.entertainment * 0.5),
    completeBonus,
    counts,
    allCategories,
  };
}

// Empire points earned per day based on performance.
export function calculateEmpirePoints({ netIncome, avgMood, peakGuests, resortRating }) {
  let points = 0;
  points += Math.floor(Math.max(0, netIncome) / 1000);
  if (avgMood >= 80) points += 5;
  points += Math.floor(peakGuests / 1000) * 10;
  if (resortRating > 4.0) points += Math.floor((resortRating - 4.0) / 0.5) * 20;
  return Math.max(0, points);
}