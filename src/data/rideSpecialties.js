// Upgrades have three meaningful specialisations. Stored by tile but validated
// against its attraction ID, so selling/rebuilding a plot cannot reuse old perks.
export const RIDE_FOCUSES = Object.freeze([
  { id: "capacity", title: "Fast lanes", description: "Move more visitors through the ride", short: "Capacity", icon: "users" },
  { id: "revenue", title: "Premium experience", description: "Raise ride income with every upgrade", short: "Earnings", icon: "coins" },
  { id: "comfort", title: "Guest-first design", description: "Keep visitors happier during their trip", short: "Happiness", icon: "heart" },
]);

export function validRideFocus(focus) {
  return RIDE_FOCUSES.some((option) => option.id === focus);
}

export function rideFocusFor(specialties, index, attractionId) {
  const record = specialties?.[index];
  return record?.attractionId === attractionId && validRideFocus(record.focus) ? record.focus : null;
}

export function rideFocusBonuses(focus, level) {
  const upgrades = Math.max(0, Math.min(20, Math.floor(Number(level) || 0)));
  return {
    extraCapacity: focus === "capacity" ? upgrades * .08 : 0,
    extraRevenue: focus === "revenue" ? upgrades * .055 : 0,
    extraMood: focus === "comfort" ? Math.min(6, upgrades * .65) : 0,
  };
}

export function parkRideFocusEffects(attractions, specialties) {
  let totalWeight = 0;
  let income = 0;
  let comfort = 0;
  for (const ride of attractions || []) {
    const capacity = Math.max(0, Number(ride.attr?.capacity) || 0);
    if (!capacity || ride.attr?.category !== "attraction") continue;
    const focus = rideFocusFor(specialties, ride.idx, ride.id);
    const bonus = rideFocusBonuses(focus, ride.level);
    totalWeight += capacity;
    income += capacity * bonus.extraRevenue;
    comfort += capacity * bonus.extraMood;
  }
  return {
    incomeMult: 1 + (totalWeight ? income / totalWeight : 0),
    moodBoost: totalWeight ? comfort / totalWeight : 0,
  };
}
