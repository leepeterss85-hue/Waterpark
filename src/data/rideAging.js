// Ride Aging & Refurbishment system: attractions age over time, increasing
// upkeep and reducing appeal. Players can refurbish to reset age.

export const AGE_RATE = 1; // years per day (scaled)
export const MAX_AGE = 100; // max age before ride is "decrepit"

export const AGE_TIERS = [
  { id: "pristine", name: "Pristine", maxAge: 10, upkeepMult: 1.0, appealMult: 1.0, color: "text-emerald-600", desc: "Like new" },
  { id: "good", name: "Good", maxAge: 25, upkeepMult: 1.05, appealMult: 0.98, color: "text-green-600", desc: "Well maintained" },
  { id: "worn", name: "Worn", maxAge: 50, upkeepMult: 1.15, appealMult: 0.92, color: "text-amber-600", desc: "Showing wear" },
  { id: "aging", name: "Aging", maxAge: 75, upkeepMult: 1.30, appealMult: 0.82, color: "text-orange-600", desc: "Needs refurbishment" },
  { id: "decrepit", name: "Decrepit", maxAge: 100, upkeepMult: 1.50, appealMult: 0.70, color: "text-red-600", desc: "Critical condition" },
];

export function getAgeTier(age) {
  for (const tier of AGE_TIERS) {
    if (age <= tier.maxAge) return tier;
  }
  return AGE_TIERS[AGE_TIERS.length - 1];
}

// Calculate refurbishment cost based on item cost and age
export function refurbishCost(itemCost, age) {
  const baseCost = itemCost || 5000;
  const ageFactor = 1 + (age / 100) * 0.5;
  return Math.round(baseCost * 0.25 * ageFactor);
}

// Advance age for all attractions by one day
export function tickRideAges(rideAges, grid) {
  // Older saves stored ages by tile in an object; normalize both formats.
  const next = Array.from({ length: grid.length }, (_, index) => rideAges?.[index] ?? 0);
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] && next[i] != null) {
      next[i] = Math.min(MAX_AGE, next[i] + AGE_RATE);
    }
  }
  return next;
}

// Initialize ride ages array when a new attraction is built
export function initRideAges(gridSize) {
  return Array(gridSize).fill(0);
}

// Refurbish a ride: reset its age to 0
export function refurbishRide(rideAges, tileIndex) {
  const next = [...rideAges];
  next[tileIndex] = 0;
  return next;
}

// Aggregate upkeep multiplier from aging across all attractions
export function aggregateAgingUpkeepMult(rideAges, grid) {
  if (!rideAges) return 1;
  let totalMult = 0;
  let count = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] && rideAges[i] != null) {
      const tier = getAgeTier(rideAges[i]);
      totalMult += tier.upkeepMult;
      count++;
    }
  }
  return count > 0 ? totalMult / count : 1;
}

// Aggregate appeal multiplier from aging
export function aggregateAgingAppealMult(rideAges, grid) {
  if (!rideAges) return 1;
  let totalMult = 0;
  let count = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] && rideAges[i] != null) {
      const tier = getAgeTier(rideAges[i]);
      totalMult += tier.appealMult;
      count++;
    }
  }
  return count > 0 ? totalMult / count : 1;
}