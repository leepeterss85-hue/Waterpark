// Active market warfare: let the player strike back at rival parks.
// A counter-strike is a targeted campaign / price war that temporarily
// weakens a rival's appeal and boosts the player's daily demand.

export function counterStrikeCost(rival, playerLevel) {
  const base = Math.round((rival?.appeal || 40) * 180);
  const levelFactor = 1 + Math.min(2, (playerLevel || 1) / 10);
  return Math.round(base * levelFactor);
}

export function createCounterStrike(rival, playerLevel) {
  return {
    rivalId: rival.id,
    rivalName: rival.name,
    cost: counterStrikeCost(rival, playerLevel),
    daysLeft: 3,
    // How much appeal is shaved off the rival while the strike is active.
    appealReduction: Math.min(22, 8 + (playerLevel || 1) * 0.5),
    // Demand boost applied to the player while the strike is active.
    guestBoost: 0.05 + Math.min(0.15, (playerLevel || 1) * 0.005),
  };
}

// Tick active strikes: reduce daysLeft and drop expired ones.
export function tickStrikes(strikes) {
  if (!Array.isArray(strikes) || strikes.length === 0) return [];
  return strikes
    .map((s) => ({ ...s, daysLeft: s.daysLeft - 1 }))
    .filter((s) => s.daysLeft > 0);
}

// Total demand boost from all active strikes.
export function strikeDemandBoost(strikes) {
  if (!Array.isArray(strikes) || strikes.length === 0) return 0;
  return strikes.reduce((sum, s) => sum + (s.guestBoost || 0), 0);
}

// Apply active strikes to a competitors array, returning rivals with
// reduced appeal for market-share calculation.
export function applyStrikesToRivals(competitors, strikes) {
  if (!Array.isArray(strikes) || strikes.length === 0) return competitors;
  const map = new Map(strikes.map((s) => [s.rivalId, s]));
  return competitors.map((c) => {
    const st = map.get(c.id);
    if (!st) return c;
    return { ...c, appeal: Math.max(10, (c.appeal || 40) - (st.appealReduction || 0)) };
  });
}