// Competitor Parks: AI rival water parks that compete for market share.
// Each rival grows over time, stealing guests based on relative appeal.

export const COMPETITORS = [
  {
    id: "splash_kingdom",
    name: "Splash Kingdom",
    theme: "Family Fun",
    color: "from-orange-400 to-amber-500",
    icon: "Castle",
    baseAppeal: 45,
    growthRate: 1.8,
    aggression: 0.8,
    description: "Family-focused park targeting parents with young kids.",
  },
  {
    id: "adrenaline_cove",
    name: "Adrenaline Cove",
    theme: "Extreme Thrills",
    color: "from-red-500 to-rose-600",
    icon: "Flame",
    baseAppeal: 50,
    growthRate: 2.2,
    aggression: 1.0,
    description: "Thrill-seeker park with extreme slides and coasters.",
  },
  {
    id: "paradise_springs",
    name: "Paradise Springs",
    theme: "Luxury Resort",
    color: "from-violet-400 to-purple-600",
    icon: "Crown",
    baseAppeal: 55,
    growthRate: 1.5,
    aggression: 0.6,
    description: "Premium resort park targeting VIPs and high-spenders.",
  },
];

export function createCompetitors(day = 1) {
  return COMPETITORS.map((c) => ({
    ...c,
    appeal: c.baseAppeal,
    guests: Math.round(c.baseAppeal * 8),
    marketShare: 0,
    day,
  }));
}

// Simulate one day of competitor growth and market share competition.
export function simulateCompetitors({ competitors, playerReputation, playerAppeal, playerGuests, day, playerLevel, acquiredRivals = [] }) {
  competitors = (competitors || []).filter((c) => !acquiredRivals.includes(c.id));
  if (competitors.length === 0) return { updated: createCompetitors(day), playerGuestLoss: 0, marketShare: 100 };

  const updated = competitors.map((c) => {
    // Rivals grow based on their growth rate, modified by day progression
    const growth = c.growthRate * (1 + day / 100);
    const newAppeal = Math.min(95, c.appeal + growth * (0.5 + Math.random() * 0.5));
    const rivalGuests = Math.round(newAppeal * 8 * (1 + day / 50));
    return { ...c, appeal: newAppeal, guests: rivalGuests, day };
  });

  // Calculate market share: player vs all rivals
  const playerScore = Math.max(10, playerAppeal + (playerReputation - 50) * 0.5);
  const rivalScores = updated.map((c) => c.appeal + (c.aggression * 5));
  const totalScore = playerScore + rivalScores.reduce((s, v) => s + v, 0);
  const playerShare = (playerScore / totalScore) * 100;

  // Guests stolen from player based on market share loss.
  // If player has <50% market share, they lose guests proportional to the deficit.
  // Reactive aggression: when the player dominates the market, rivals fight back
  // harder and poach more guests — staying on top requires active defence.
  const shareDeficit = Math.max(0, 50 - playerShare);
  let guestLossPercent = shareDeficit / 100; // 0% to 50% guest loss
  const dominanceFactor = playerShare > 65 ? 1.45 : playerShare > 55 ? 1.2 : 1;
  const playerGuestLoss = Math.round(playerGuests * guestLossPercent * 0.3 * dominanceFactor);

  // Assign market share to each rival
  updated.forEach((c, i) => {
    c.marketShare = (rivalScores[i] / totalScore) * 100;
  });

  return { updated, playerGuestLoss, marketShare: playerShare };
}

// Competitive intelligence: what the player can see about each rival
export function getCompetitorIntel(competitor, playerLevel) {
  const intelLevel = Math.min(3, Math.floor(playerLevel / 3));
  const intel = {
    name: competitor.name,
    theme: competitor.theme,
    color: competitor.color,
    icon: competitor.icon,
    appeal: competitor.appeal,
    guests: competitor.guests,
    marketShare: competitor.marketShare,
  };
  if (intelLevel >= 1) intel.description = competitor.description;
  if (intelLevel >= 2) intel.growthRate = competitor.growthRate;
  if (intelLevel >= 3) intel.aggression = competitor.aggression;
  return intel;
}