export const REWARD_TYPES = [
  { id: "cash_small", label: "Cash Drop", icon: "PoundSterling", color: "from-emerald-400 to-green-600", minAmount: 2000, maxAmount: 5000, weight: 30 },
  { id: "cash_big", label: "Jackpot!", icon: "Coins", color: "from-amber-400 to-yellow-600", minAmount: 10000, maxAmount: 25000, weight: 8 },
  { id: "xp", label: "XP Boost", icon: "Star", color: "from-violet-400 to-purple-600", minAmount: 100, maxAmount: 300, weight: 20 },
  { id: "rep", label: "Rep Surge", icon: "TrendingUp", color: "from-cyan-400 to-blue-600", minAmount: 3, maxAmount: 8, weight: 15 },
  { id: "research", label: "Research Grant", icon: "FlaskConical", color: "from-teal-400 to-cyan-600", minAmount: 50, maxAmount: 150, weight: 12 },
  { id: "free_upgrade", label: "Free Upgrade", icon: "ArrowUpCircle", color: "from-rose-400 to-pink-600", amount: 1, weight: 10 },
  { id: "mystery", label: "Mystery Box", icon: "Gift", color: "from-fuchsia-400 to-purple-600", amount: 0, weight: 5 },
];

export function spinWheel() {
  const totalWeight = REWARD_TYPES.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = REWARD_TYPES[0];
  for (const r of REWARD_TYPES) {
    roll -= r.weight;
    if (roll <= 0) { chosen = r; break; }
  }
  let amount = 0;
  if (chosen.minAmount && chosen.maxAmount) {
    amount = Math.round(chosen.minAmount + Math.random() * (chosen.maxAmount - chosen.minAmount));
  } else if (chosen.amount) {
    amount = chosen.amount;
  }
  if (chosen.id === "mystery") {
    const pool = REWARD_TYPES.filter((r) => r.id !== "mystery");
    const bonus = pool[Math.floor(Math.random() * pool.length)];
    if (bonus.minAmount && bonus.maxAmount) {
      amount = Math.round((bonus.minAmount + bonus.maxAmount) / 2);
    }
    return { ...chosen, amount, mysteryContent: bonus };
  }
  return { ...chosen, amount };
}

export function getStreakBonus(streak) {
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1.0;
}

export function canClaimReward(lastRewardDay, currentDay) {
  if (lastRewardDay == null) return true;
  return currentDay > lastRewardDay;
}