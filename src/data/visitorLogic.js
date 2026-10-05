import { getAttraction } from "./gameData";
import { getThemeGuestAffinity } from "./parkThemes";

const MAX_AGENTS = 200;
const FACILITY_CAPACITY = 60;

// === Individual Guest Groups ===
// Each group has distinct spending habits, ride preferences, queue tolerance,
// food/shopping preferences and pricing reactions.
const GUEST_PROFILES = [
  {
    type: "Family",
    group: "Family group",
    mood: [50, 78],
    hunger: [20, 50],
    thirst: [15, 45],
    energy: [55, 90],
    budget: [70, 160],
    patience: 62,
    priceSensitivity: 1.6, // watch the wallet
    shoppingPref: 0.6,
    rideClass: "family",
    foodClass: "casual",
  },
  {
    type: "Couple",
    group: "Couple",
    mood: [48, 78],
    hunger: [15, 40],
    thirst: [18, 48],
    energy: [50, 85],
    budget: [100, 200],
    patience: 74,
    priceSensitivity: 0.9,
    shoppingPref: 1.3,
    rideClass: "relax",
    foodClass: "premium",
  },
  {
    type: "Teen group",
    group: "Friends group",
    mood: [55, 85],
    hunger: [15, 45],
    thirst: [20, 55],
    energy: [70, 100],
    budget: [45, 110],
    patience: 42,
    priceSensitivity: 2.0, // very price sensitive
    shoppingPref: 0.5,
    rideClass: "thrill",
    foodClass: "casual",
  },
  {
    type: "Thrill seeker",
    group: "Friends group",
    mood: [58, 88],
    hunger: [10, 40],
    thirst: [15, 40],
    energy: [65, 100],
    budget: [65, 140],
    patience: 48,
    priceSensitivity: 1.2,
    shoppingPref: 0.4,
    rideClass: "thrill",
    foodClass: "casual",
  },
  {
    type: "Tourist",
    group: "Tourist group",
    mood: [52, 82],
    hunger: [18, 48],
    thirst: [18, 50],
    energy: [50, 85],
    budget: [110, 220],
    patience: 58,
    priceSensitivity: 0.7, // here for the experience
    shoppingPref: 1.6,
    rideClass: "variety",
    foodClass: "variety",
  },
  {
    type: "VIP guest",
    group: "VIP group",
    mood: [55, 82],
    hunger: [15, 40],
    thirst: [10, 35],
    energy: [60, 90],
    budget: [180, 320],
    patience: 68,
    priceSensitivity: 0.3, // barely price sensitive
    shoppingPref: 2.2,
    rideClass: "premium",
    foodClass: "premium",
  },
];

// Typical mix of guest groups arriving at the park (used for demand weighting).
export const GUEST_MIX = {
  Family: 0.28,
  Couple: 0.18,
  "Teen group": 0.17,
  "Thrill seeker": 0.15,
  Tourist: 0.12,
  "VIP guest": 0.10,
};

// Ride class classification — each attraction belongs to one or more classes.
const RIDE_CLASSES = {
  family: new Set([
    "kiddie_pool", "play_structure", "family_raft", "splash_pad", "soft_play",
    "lazy_river", "mini_golf", "carousel", "water_volleyball", "water_playground",
    "splash_battle", "bumper_boats", "wave_pool", "adventure_river", "water_zipline",
  ]),
  thrill: new Set([
    "speed_slide", "kamikaze", "aqua_loop", "cliff_jump", "freefall_drop",
    "mega_slide_complex", "water_coaster", "tornado_bowl", "boomerang_halfpipe",
    "surf_wave_pool", "dive_pool", "multi_racer", "flowrider", "go_karts",
    "ninja_course", "aqua_spin", "halfpipe", "aqua_ninja_course",
  ]),
  relax: new Set([
    "lazy_river", "sun_lounge", "lap_sports_pool", "mini_golf", "adventure_river",
    "dive_pool", "hot_tub", "sauna", "beach_lounging", "spa", "wave_pool",
    "float_therapy", "massage_pavilion",
  ]),
  premium: new Set([
    "surf_wave_pool", "dive_pool", "vip_lounge", "spa", "sushi_bar", "cabanas",
    "float_therapy", "massage_pavilion", "hot_tub", "sauna",
  ]),
};

// Food facility classification.
const FOOD_CLASSES = {
  casual: new Set(["dining", "burger_shack", "pizza_stand", "concessions", "beach_bar", "ice_cream"]),
  healthy: new Set(["juice_bar", "smoothie_bar", "coffee_bar", "drinking_fountain"]),
  premium: new Set(["sushi_bar", "beach_bar", "coffee_bar"]),
};

const RETAIL_IDS = new Set(["retail", "gift_shop", "photo_kiosk"]);
const REST_IDS = new Set(["toilets", "lockers", "cabanas", "sun_lounge", "towel_rental", "wifi_lounge", "beach_lounging", "hot_tub", "sauna"]);

// Per-group ride class affinity bonus (added to destination score).
const RIDE_CLASS_AFFINITY = {
  Family: { family: 5, thrill: -2, relax: 2, premium: -1, variety: 1 },
  Couple: { family: 0, thrill: 1, relax: 5, premium: 3, variety: 2 },
  "Teen group": { family: -1, thrill: 5, relax: -2, premium: 0, variety: 2 },
  "Thrill seeker": { family: -2, thrill: 6, relax: -3, premium: 1, variety: 1 },
  Tourist: { family: 1, thrill: 2, relax: 2, premium: 2, variety: 4 },
  "VIP guest": { family: 0, thrill: 1, relax: 3, premium: 5, variety: 2 },
};

// Per-group food class affinity bonus.
const FOOD_CLASS_AFFINITY = {
  Family: { casual: 4, healthy: 1, premium: -1, variety: 1 },
  Couple: { casual: 1, healthy: 2, premium: 4, variety: 2 },
  "Teen group": { casual: 5, healthy: 0, premium: -1, variety: 1 },
  "Thrill seeker": { casual: 3, healthy: 0, premium: 0, variety: 1 },
  Tourist: { casual: 2, healthy: 1, premium: 2, variety: 4 },
  "VIP guest": { casual: -1, healthy: 2, premium: 5, variety: 1 },
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const rand = (min, max) => Math.random() * (max - min) + min;

function createGuest() {
  // Weighted random selection based on typical guest mix.
  const types = Object.keys(GUEST_MIX);
  const totalWeight = types.reduce((sum, t) => sum + GUEST_MIX[t], 0);
  let roll = Math.random() * totalWeight;
  let chosenType = types[0];
  for (const t of types) {
    roll -= GUEST_MIX[t];
    if (roll <= 0) { chosenType = t; break; }
  }
  const profile = GUEST_PROFILES.find((p) => p.type === chosenType) || GUEST_PROFILES[0];
  return {
    type: profile.type,
    group: profile.group,
    mood: rand(...profile.mood),
    hunger: rand(...profile.hunger),
    thirst: rand(...profile.thirst),
    energy: rand(...profile.energy),
    patience: profile.patience,
    priceSensitivity: profile.priceSensitivity,
    shoppingPref: profile.shoppingPref,
    rideClass: profile.rideClass,
    foodClass: profile.foodClass,
    budget: rand(...profile.budget),
    spend: 0,
    visited: new Set(),
  };
}

function perVisitSpend(item, level) {
  const attr = item.attr;
  const income = attr.income * (1 + 0.15 * level);
  return income / (attr.capacity > 0 ? attr.capacity : FACILITY_CAPACITY);
}

function rideClassFor(attr) {
  for (const [cls, set] of Object.entries(RIDE_CLASSES)) {
    if (set.has(attr.id)) return cls;
  }
  return null;
}

function foodClassFor(attr) {
  for (const [cls, set] of Object.entries(FOOD_CLASSES)) {
    if (set.has(attr.id)) return cls;
  }
  return null;
}

function scoreDestination(guest, item) {
  const zoneAffinity = item.zone ? getThemeGuestAffinity(item.zone, guest.type) : 1;
  const attr = item.attr;
  let score = Math.max(0.5, attr.fun * 0.4 + 1);

  if (attr.category === "facility") {
    // Food preference
    const fClass = foodClassFor(attr);
    if (fClass && FOOD_CLASS_AFFINITY[guest.type]) {
      score += (FOOD_CLASS_AFFINITY[guest.type][fClass] || 0) * 0.8;
    }
    // Hunger / thirst driven scoring
    if (["dining", "ice_cream", "coffee_bar", "sushi_bar", "juice_bar", "burger_shack", "pizza_stand", "smoothie_bar", "beach_bar"].includes(attr.id)) score += guest.hunger * 0.075;
    if (["drinking_fountain", "concessions", "juice_bar", "smoothie_bar"].includes(attr.id)) score += guest.thirst * 0.08;
    // Rest / energy
    if (REST_IDS.has(attr.id)) score += (100 - guest.energy) * 0.045;
    // Services
    if (["lost_found", "atm", "guest_services"].includes(attr.id)) score += 1.5;
    if (attr.id === "guest_services") score += (100 - guest.mood) * 0.03 + 1.5;
    // Shopping preference
    if (RETAIL_IDS.has(attr.id)) score += guest.shoppingPref * 2.5;
    // VIP premium facilities
    if (guest.type === "VIP guest" && ["cabanas", "vip_lounge", "spa", "retail"].includes(attr.id)) score += 4;
    score *= 0.8;
  } else {
    // Ride class affinity
    const rClass = rideClassFor(attr);
    if (rClass && RIDE_CLASS_AFFINITY[guest.type]) {
      score += RIDE_CLASS_AFFINITY[guest.type][rClass] || 0;
    }
    // General mood/fun modifiers
    if (attr.fun >= 8 && guest.mood > 60) score += 2;
    // Backwards-compatible explicit preferences
    if (guest.type === "Family" && RIDE_CLASSES.family.has(attr.id)) score += 2;
    if (guest.type === "Couple" && RIDE_CLASSES.relax.has(attr.id)) score += 2;
    if (guest.type === "Teen group" && RIDE_CLASSES.thrill.has(attr.id)) score += 2;
    if (guest.type === "Thrill seeker" && attr.fun >= 8) score += 3;
    if (guest.type === "VIP guest" && RIDE_CLASSES.premium.has(attr.id)) score += 2;
    if (guest.type === "Tourist") score += 1.5; // tourists like variety
  }

  if (item.overcrowded) score *= 0.58;
  // Queue tolerance: impatient guests penalise crowded spots more
  if (item.queueWait > 0) {
    const queuePenalty = (item.queueWait / Math.max(1, guest.patience)) * 3;
    score *= Math.max(0.2, 1 - queuePenalty);
  }
  score *= zoneAffinity;
  return Math.max(0.1, score * (0.45 + guest.mood / 100));
}

function chooseDestination(guest, options) {
  const weights = options.map((item) => scoreDestination(guest, item));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (let index = 0; index < options.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return options[index];
  }
  return options[options.length - 1];
}

// Aggregate price reaction across all guest groups, weighted by their typical mix.
// Returns a 0.6–1.25 multiplier applied to daily demand based on ticket price.
export function aggregatePriceReaction(ticketPrice) {
  const base = 20;
  let weighted = 0;
  let totalWeight = 0;
  for (const profile of GUEST_PROFILES) {
    const weight = GUEST_MIX[profile.type] || 0.1;
    const reaction = Math.max(0.5, Math.min(1.2, 1.12 - (ticketPrice - base) * 0.012 * profile.priceSensitivity));
    weighted += reaction * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? Math.max(0.6, Math.min(1.25, weighted / totalWeight)) : 1;
}

export function simulateVisits({
  demand,
  placedItems,
  incidents,
  uptime,
  safety,
  cleanliness,
  incomeMult,
  entertainment = 0,
  facilityBonus = 1,
  queuePaths = [],
  appealBonus = 0,
}) {
  const empty = {
    income: 0, avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0,
    topAttraction: null, movements: {}, guestTypes: {}, queueStats: {},
    spendingByCategory: { rides: 0, food: 0, retail: 0, premium: 0, other: 0 },
    guestExperience: { happy: 0, content: 0, unhappy: 0 },
    needs: { hunger: 0, thirst: 0, fatigue: 0 },
    groupTypes: {},
  };
  if (demand <= 0 || !placedItems?.length) return empty;

  const queueSupportByTile = new Map();
  for (const attraction of placedItems.filter((item) => item.attr.category === "attraction")) {
    const nearbyRails = queuePaths.filter((path) => {
      const dx = Math.abs((path.idx % 8) - (attraction.idx % 8));
      const dy = Math.abs(Math.floor(path.idx / 8) - Math.floor(attraction.idx / 8));
      return dx + dy <= 2;
    }).length;
    queueSupportByTile.set(attraction.idx, nearbyRails);
  }

  const options = placedItems
    .filter((item) => incidents.get(item.idx)?.type !== "breakdown")
    .map((item) => {
      const incident = incidents.get(item.idx);
      const capacity = item.attr.capacity > 0
        ? item.attr.capacity * (1 + 0.2 * item.level)
        : FACILITY_CAPACITY;
      return {
        ...item,
        zone: item.zone || null,
        cap: capacity * (incident?.type === "maintenance" ? 0.5 : 1),
        load: 0,
        overcrowded: false,
        queueWait: 0,
        queueSupport: queueSupportByTile.get(item.idx) || 0,
      };
    });
  if (!options.length) return { ...empty, avgMood: 30, guestExperience: { happy: 0, content: 0, unhappy: demand } };

  const agentCount = Math.min(demand, MAX_AGENTS);
  const crowdScale = demand / agentCount;
  let totalSpend = 0;
  let totalMood = 0;
  let totalVisits = 0;
  let finalHunger = 0;
  let finalThirst = 0;
  let finalFatigue = 0;
  const movements = {};
  const guestTypes = {};
  const groupTypes = {};
  const spendingByCategory = { ...empty.spendingByCategory };
  const guestExperience = { happy: 0, content: 0, unhappy: 0 };

  for (let agent = 0; agent < agentCount; agent += 1) {
    const guest = createGuest();
    guestTypes[guest.type] = (guestTypes[guest.type] || 0) + crowdScale;
    groupTypes[guest.group] = (groupTypes[guest.group] || 0) + crowdScale;
    const steps = Math.floor(rand(3, 7));

    for (let step = 0; step < steps; step += 1) {
      for (const item of options) {
        item.overcrowded = item.load >= item.cap * 0.85;
        item.queueWait = item.attr.category === "attraction"
          ? Math.max(0, Math.round((item.load / Math.max(1, item.cap)) * (item.attr.duration || 4) * 3 - item.queueSupport * 1.5))
          : 0;
      }
      const available = options.filter((item) => !guest.visited.has(item.idx) && item.load < item.cap);
      if (!available.length || guest.energy < 12 || guest.mood < 8) break;

      const pick = chooseDestination(guest, available);
      const attr = pick.attr;
      let price = perVisitSpend(pick, pick.level) *
        (attr.category === "facility" ? facilityBonus : 1);

      // Pricing reaction: price-sensitive guests are more likely to skip expensive activities.
      const budgetFraction = price / Math.max(1, guest.budget);
      if (budgetFraction > 0.15 * guest.priceSensitivity) {
        // Too expensive for this guest — likely skip
        if (Math.random() < 0.5 * guest.priceSensitivity) break;
      }
      if (guest.spend + price > guest.budget) break;

      // Shopping preference scales retail spending
      if (RETAIL_IDS.has(attr.id)) {
        price *= guest.shoppingPref;
      }

      guest.spend += price;
      guest.visited.add(pick.idx);
      pick.load += crowdScale;
      totalSpend += price * crowdScale;
      totalVisits += crowdScale;
      movements[attr.id] = (movements[attr.id] || 0) + crowdScale;

      if (attr.category === "attraction") {
        spendingByCategory.rides += price * crowdScale;
        guest.mood += (attr.fun + pick.level * 0.5 - 5) * 0.8;
        guest.energy -= rand(7, 13);
        guest.hunger += 7;
        guest.thirst += 10;
      } else if (["dining", "ice_cream", "coffee_bar", "concessions", "sushi_bar", "juice_bar", "burger_shack", "pizza_stand", "smoothie_bar", "beach_bar"].includes(attr.id)) {
        spendingByCategory.food += price * crowdScale;
        guest.hunger = Math.max(0, guest.hunger - 38);
        guest.thirst = Math.max(0, guest.thirst - (["concessions", "juice_bar", "smoothie_bar"].includes(attr.id) ? 22 : 8));
        guest.mood += attr.id === "sushi_bar" ? 4 : 3;
        guest.energy += 3;
      } else if (RETAIL_IDS.has(attr.id)) {
        spendingByCategory.retail += price * crowdScale;
        guest.mood += 2;
      } else if (["cabanas", "vip_lounge", "spa"].includes(attr.id)) {
        spendingByCategory.premium += price * crowdScale;
        guest.mood += 4;
        guest.energy += 8;
      } else if (attr.id === "drinking_fountain") {
        spendingByCategory.other += price * crowdScale;
        guest.thirst = Math.max(0, guest.thirst - 35);
        guest.mood += 2;
      } else if (attr.id === "guest_services") {
        spendingByCategory.other += price * crowdScale;
        guest.mood += 5;
        guest.energy += 2;
      } else {
        spendingByCategory.other += price * crowdScale;
        guest.mood += 1.5;
        guest.energy += 5;
      }

      guest.hunger = clamp(guest.hunger + 3);
      guest.thirst = clamp(guest.thirst + 4);
      guest.energy = clamp(guest.energy, 0, 100);
      guest.mood += (safety - 0.7) * 6 + (cleanliness - 0.6) * 5 + entertainment + appealBonus;
      if (pick.overcrowded) guest.mood -= 2;
      // Queue reaction: impatient guests lose more mood in long queues
      if (pick.queueWait > guest.patience / 5) guest.mood -= 2 + (guest.patience < 50 ? 2 : 0);
      if (guest.hunger > 80) guest.mood -= 4;
      if (guest.thirst > 80) guest.mood -= 5;
      if (guest.energy < 25) guest.mood -= 3;
      guest.mood = clamp(guest.mood);
    }

    totalMood += guest.mood;
    finalHunger += guest.hunger;
    finalThirst += guest.thirst;
    finalFatigue += 100 - guest.energy;
    if (guest.mood >= 70) guestExperience.happy += crowdScale;
    else if (guest.mood >= 45) guestExperience.content += crowdScale;
    else guestExperience.unhappy += crowdScale;
  }

  const queueStats = {};
  let longestQueue = { id: null, wait: 0, guests: 0 };
  for (const item of options) {
    if (item.attr.category !== "attraction") continue;
    const guestsInQueue = Math.max(0, Math.round(item.load - item.cap * 0.55));
    const wait = Math.min(90, Math.max(0, Math.round((item.load / Math.max(1, item.cap)) * (item.attr.duration || 4) * 3 - item.queueSupport * 1.5)));
    const queueCapacity = item.queueSupport > 0 ? item.queueSupport * 12 : 8;
    queueStats[item.idx] = { id: item.attr.id, guests: guestsInQueue, wait, load: Math.round(item.load), capacity: Math.round(item.cap), queueCapacity, queueRails: item.queueSupport, overflow: Math.max(0, guestsInQueue - queueCapacity) };
    if (wait > longestQueue.wait) longestQueue = { id: item.attr.id, wait, guests: guestsInQueue };
  }

  const avgMood = totalMood / agentCount;
  const avgSpendPerVisit = totalVisits > 0 ? totalSpend / totalVisits : 0;
  const topId = Object.entries(movements).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return {
    income: totalSpend * uptime * incomeMult,
    avgMood,
    avgSpendPerVisit,
    totalVisits: Math.round(totalVisits),
    topAttraction: topId ? getAttraction(topId) : null,
    movements,
    guestTypes,
    groupTypes,
    queueStats,
    longestQueue,
    spendingByCategory,
    guestExperience,
    needs: {
      hunger: Math.round(finalHunger / agentCount),
      thirst: Math.round(finalThirst / agentCount),
      fatigue: Math.round(finalFatigue / agentCount),
    },
  };
}