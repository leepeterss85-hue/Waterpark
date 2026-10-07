// Staff morale & fatigue: a management tension loop.
// Overworked staff lose morale; low morale cuts service quality and raises incident risk.
// Players restore morale by paying bonuses or enabling a wage boost.

export const DEFAULT_MORALE = 75;
export const MORALE_BONUS_COST_PER_POINT = 1500; // cost to restore 1 morale point
export const MORALE_RESTORE_TARGET = 85;

// Fatigue pressure: guests per staff. 50 guests/staff = balanced (1.0).
export function fatigueLevel(guests, staffTotal) {
  if (staffTotal <= 0) return 2;
  return Math.min(2.5, guests / (staffTotal * 50));
}

// Daily morale change from fatigue + wage boost.
export function tickMorale(morale, guests, staffTotal, wageBoost) {
  const fatigue = fatigueLevel(guests, staffTotal);
  let delta;
  if (fatigue > 1.2) delta = -(fatigue - 1) * 9; // overworked: drops fast
  else if (fatigue < 0.7) delta = 3.5; // well-staffed: recovers
  else delta = 0.5;
  if (wageBoost) delta += 2.5;
  return Math.max(0, Math.min(100, Math.round(morale + delta)));
}

// Multiplier applied to staff-driven service quality (uptime/safety/cleanliness).
// 100 morale = 1.10, 50 = 0.90, 0 = 0.70
export function moraleEffectMult(morale) {
  return 0.7 + (morale / 100) * 0.4;
}

// Incident chance multiplier from low morale.
export function moraleIncidentMult(morale) {
  if (morale < 25) return 1.7;
  if (morale < 45) return 1.3;
  if (morale < 65) return 1.1;
  return 1;
}

export function moraleLabel(morale) {
  if (morale >= 85) return "Thriving";
  if (morale >= 65) return "Content";
  if (morale >= 45) return "Stressed";
  if (morale >= 25) return "Burnt out";
  return "Critical";
}

export function moraleTone(morale) {
  if (morale >= 85) return "emerald";
  if (morale >= 65) return "lime";
  if (morale >= 45) return "amber";
  if (morale >= 25) return "orange";
  return "rose";
}

// Cost to restore morale to the target via a bonus payment.
export function bonusCost(morale) {
  const deficit = Math.max(0, MORALE_RESTORE_TARGET - morale);
  return Math.round(deficit * MORALE_BONUS_COST_PER_POINT);
}