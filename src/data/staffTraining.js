// Staff training system: level up individual staff types with XP earned
// from working, unlocking perks that improve their effectiveness.

export const MAX_STAFF_LEVEL = 5;

// XP needed to reach each staff training level (cumulative XP per staff type)
export const STAFF_XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400];

// Training cost in money to instantly boost a staff type's XP
export function trainingCost(staffType, currentXp) {
  const base = 2000;
  const tier = Math.floor(currentXp / 100);
  return Math.round(base * Math.pow(1.4, tier));
}

// XP gained per day by a staff type based on how many are employed
export function dailyStaffXp(count) {
  return Math.max(0, (count || 0) * 3);
}

// Perks unlocked at each training level, keyed by staff type
export const STAFF_PERKS = {
  lifeguard: [
    { level: 1, name: "Swift Rescue", desc: "+10% safety response speed" },
    { level: 2, name: "Vigilant Watch", desc: "+15% safety coverage" },
    { level: 3, name: "Rapid Response", desc: "+20% safety, cuts drown risk" },
    { level: 4, name: "Elite Guard", desc: "+25% safety, +5% guest mood" },
    { level: 5, name: "Lifeguard Legend", desc: "+30% safety, VIP visits more likely" },
  ],
  mechanic: [
    { level: 1, name: "Quick Fix", desc: "+12% repair speed" },
    { level: 2, name: "Preventive Care", desc: "-15% breakdown chance" },
    { level: 3, name: "Master Wrench", desc: "+20% uptime, +10% repair speed" },
    { level: 4, name: "Ride Whisperer", desc: "+25% uptime, -25% breakdowns" },
    { level: 5, name: "Engineering Guru", desc: "+30% uptime, rides age slower" },
  ],
  cleaner: [
    { level: 1, name: "Speedy Sweep", desc: "+12% cleaning speed" },
    { level: 2, name: "Deep Clean", desc: "+15% cleanliness boost" },
    { level: 3, name: "Spotless Standards", desc: "+20% cleanliness, +5% rep" },
    { level: 4, name: "Hygiene Hero", desc: "+25% cleanliness, cuts illness risk" },
    { level: 5, name: "Mr. Clean", desc: "+30% cleanliness, +10% rep" },
  ],
  security: [
    { level: 1, name: "Sharp Eye", desc: "+10% safety, -10% incidents" },
    { level: 2, name: "Crowd Control", desc: "+15% safety in busy zones" },
    { level: 3, name: "Night Watch", desc: "+20% safety, -20% incidents" },
    { level: 4, name: "Security Chief", desc: "+25% safety, +5% guest mood" },
    { level: 5, name: "Guardian Angel", desc: "+30% safety, near-zero incidents" },
  ],
  entertainer: [
    { level: 1, name: "Crowd Pleaser", desc: "+10% entertainment" },
    { level: 2, name: "Show Stopper", desc: "+15% entertainment, +5% mood" },
    { level: 3, name: "Star Performer", desc: "+20% entertainment, +10% mood" },
    { level: 4, name: "Headliner", desc: "+25% entertainment, event bonuses" },
    { level: 5, name: "Park Icon", desc: "+30% entertainment, viral social posts" },
  ],
  fitness_coach: [
    { level: 1, name: "Form Check", desc: "+10% gym/spa income" },
    { level: 2, name: "Class Act", desc: "+15% gym/spa income, +5% mood" },
    { level: 3, name: "Wellness Pro", desc: "+20% gym/spa income" },
    { level: 4, name: "Fitness Guru", desc: "+25% gym/spa income, +10% mood" },
    { level: 5, name: "Olympian", desc: "+30% gym/spa income, VIP attraction" },
  ],
  gardener: [
    { level: 1, name: "Green Thumb", desc: "+10% cleanliness, +5% appeal" },
    { level: 2, name: "Landscape Artist", desc: "+15% appeal from scenery" },
    { level: 3, name: "Master Gardener", desc: "+20% cleanliness, +10% appeal" },
    { level: 4, name: "Botanical Expert", desc: "+25% appeal, eco bonus" },
    { level: 5, name: "Garden Legend", desc: "+30% appeal, +15% rep" },
  ],
  manager: [
    { level: 1, name: "Org Chart", desc: "+5% all staff efficiency" },
    { level: 2, name: "Lean Ops", desc: "+10% staff efficiency, -5% wages" },
    { level: 3, name: "Strategic Leader", desc: "+15% staff efficiency, -10% wages" },
    { level: 4, name: "Operations Maestro", desc: "+20% efficiency, -15% wages" },
    { level: 5, name: "CEO of Fun", desc: "+25% efficiency, -20% wages, +10% income" },
  ],
  medic: [
    { level: 1, name: "First Aid Pro", desc: "+10% emergency response" },
    { level: 2, name: "Triage Expert", desc: "-15% emergency severity" },
    { level: 3, name: "Field Medic", desc: "+20% emergency response, +5% safety" },
    { level: 4, name: "Senior Medic", desc: "-25% emergency costs" },
    { level: 5, name: "Chief Medical Officer", desc: "Near-zero emergency impact" },
  ],
  dj: [
    { level: 1, name: "Good Vibes", desc: "+10% mood, +5% evening income" },
    { level: 2, name: "Beat Drop", desc: "+15% mood, +10% evening income" },
    { level: 3, name: "Pool Party Pro", desc: "+20% mood, event bonuses" },
    { level: 4, name: "Headliner DJ", desc: "+25% mood, +15% evening income" },
    { level: 5, name: "Festival Legend", desc: "+30% mood, viral social boost" },
  ],
  chef: [
    { level: 1, name: "Tasty Bites", desc: "+10% dining income" },
    { level: 2, name: "Menu Master", desc: "+15% dining income, +5% mood" },
    { level: 3, name: "Executive Chef", desc: "+20% dining income" },
    { level: 4, name: "Culinary Artist", desc: "+25% dining income, +10% mood" },
    { level: 5, name: "Michelin Star", desc: "+30% dining income, VIP draw" },
  ],
  photographer: [
    { level: 1, name: "Quick Snap", desc: "+10% photo/retail income" },
    { level: 2, name: "Good Angles", desc: "+15% photo income, +5% mood" },
    { level: 3, name: "Pro Lens", desc: "+20% photo income" },
    { level: 4, name: "Studio Pro", desc: "+25% photo income, +10% mood" },
    { level: 5, name: "Award Winner", desc: "+30% photo income, viral photos" },
  ],
  event_coordinator: [
    { level: 1, name: "Smooth Ops", desc: "+10% event bonuses" },
    { level: 2, name: "Crowd Magnet", desc: "+15% event guest boost" },
    { level: 3, name: "Festival Pro", desc: "+20% event bonuses, +5% mood" },
    { level: 4, name: "Master Planner", desc: "+25% event bonuses, +10% mood" },
    { level: 5, name: "Event Legend", desc: "+30% event bonuses, mega events" },
  ],
  aquatics_director: [
    { level: 1, name: "Flow Control", desc: "+10% water ride uptime" },
    { level: 2, name: "Safety First", desc: "+15% water ride safety" },
    { level: 3, name: "Pool Master", desc: "+20% water ride uptime, +5% mood" },
    { level: 4, name: "Water Expert", desc: "+25% uptime, +10% water quality" },
    { level: 5, name: "Aquatics Legend", desc: "+30% uptime, +15% water income" },
  ],
};

/**
 * Get the training level for a staff type from its XP.
 */
export function staffLevelFromXp(xp) {
  let level = 0;
  for (let i = 0; i < STAFF_XP_THRESHOLDS.length; i++) {
    if ((xp || 0) >= STAFF_XP_THRESHOLDS[i]) level = i;
  }
  return level;
}

/**
 * XP needed to reach the next training level.
 */
export function xpForNextStaffLevel(xp) {
  const level = staffLevelFromXp(xp);
  if (level >= MAX_STAFF_LEVEL) return null;
  return STAFF_XP_THRESHOLDS[level + 1];
}

/**
 * Get all unlocked perks for a staff type at its current XP level.
 */
export function getStaffPerks(staffType, xp) {
  const level = staffLevelFromXp(xp);
  const perks = STAFF_PERKS[staffType] || [];
  return perks.filter((p) => p.level <= level);
}

/**
 * Multiplier applied to staff effects based on training level.
 * Each training level adds 8% effectiveness.
 */
export function trainingEffectMult(staffType, xp) {
  const level = staffLevelFromXp(xp);
  return 1 + level * 0.08;
}