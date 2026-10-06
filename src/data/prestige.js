// Prestige System: at level 50, players can reset for permanent multipliers.

export const PRESTIGE_LEVEL_REQ = 50;

// Calculate prestige points earned based on current progress.
// Based on level, empire points, and lifetime earnings.
export function calculatePrestigePoints(state) {
  const level = state.level || 1;
  const empirePoints = state.empirePoints || 0;
  const lifetimeEarnings = state.lifetimeEarnings || 0;
  const base = Math.floor(level / 10) + Math.floor(empirePoints / 2000) + Math.floor(lifetimeEarnings / 5000000);
  return Math.max(0, base);
}

// Each prestige point gives +2% to all income and +1% to guest demand.
export function prestigeMultiplier(prestigeCount) {
  return {
    incomeMult: 1 + prestigeCount * 0.02,
    demandMult: 1 + prestigeCount * 0.01,
    xpMult: 1 + prestigeCount * 0.03,
  };
}

export const PRESTIGE_TIERS = [
  { min: 0, label: "First Cycle", color: "from-cyan-400 to-blue-500" },
  { min: 1, label: "Reborn Tycoon", color: "from-violet-400 to-purple-500" },
  { min: 3, label: "Ascended Manager", color: "from-amber-400 to-orange-500" },
  { min: 5, label: "Eternal Tycoon", color: "from-rose-400 to-fuchsia-600" },
  { min: 10, label: "Mythic Overlord", color: "from-emerald-400 to-teal-600" },
];

export function getPrestigeTier(count) {
  let tier = PRESTIGE_TIERS[0];
  for (const t of PRESTIGE_TIERS) {
    if (count >= t.min) tier = t;
  }
  return tier;
}