import { getAttraction } from "./gameData";
import { getThemeGuestAffinity } from "./parkThemes";

const MAX_AGENTS = 200;
const FACILITY_CAPACITY = 60;
const GUEST_PROFILES = [
  { type: "Family", group: "Family group", mood: [50, 78], hunger: [20, 50], thirst: [15, 45], energy: [55, 90], budget: [70, 150], patience: 62 },
  { type: "Thrill seeker", group: "Friends group", mood: [58, 88], hunger: [10, 40], thirst: [15, 40], energy: [65, 100], budget: [60, 130], patience: 48 },
  { type: "Relaxed guest", group: "Couple", mood: [45, 75], hunger: [15, 45], thirst: [20, 50], energy: [45, 80], budget: [80, 170], patience: 75 },
  { type: "Premium guest", group: "VIP group", mood: [55, 82], hunger: [15, 40], thirst: [10, 35], energy: [60, 90], budget: [120, 220], patience: 68 },
  { type: "Teen group", group: "Friends group", mood: [55, 85], hunger: [15, 45], thirst: [20, 55], energy: [70, 100], budget: [45, 100], patience: 42 },
];

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const rand = (min, max) => Math.random() * (max - min) + min;

function createGuest() {
  const profile = GUEST_PROFILES[Math.floor(Math.random() * GUEST_PROFILES.length)];
  return {
    type: profile.type,
    group: profile.group,
    mood: rand(...profile.mood),
    hunger: rand(...profile.hunger),
    thirst: rand(...profile.thirst),
    energy: rand(...profile.energy),
    patience: profile.patience,
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

function scoreDestination(guest, item) {
  const zoneAffinity = item.zone ? getThemeGuestAffinity(item.zone, guest.type) : 1;
  const attr = item.attr;
  let score = Math.max(0.5, attr.fun * 0.4 + 1);
  if (attr.category === "facility") {
    if (["dining", "ice_cream", "coffee_bar"].includes(attr.id)) score += guest.hunger * 0.075;
    if (["drinking_fountain", "concessions"].includes(attr.id)) score += guest.thirst * 0.08;
    if (["toilets", "lockers", "cabanas", "sun_lounge"].includes(attr.id)) score += (100 - guest.energy) * 0.045;
    if (attr.id === "guest_services") score += (100 - guest.mood) * 0.03 + 1.5;
    if (guest.type === "Premium guest" && ["cabanas", "vip_lounge", "spa", "retail"].includes(attr.id)) score += 4;
    score *= 0.8;
  } else {
    if (attr.fun >= 8 && guest.mood > 60) score += 2;
    if (guest.type === "Thrill seeker" && attr.fun >= 8) score += 4;
    if (guest.type === "Family" && ["kiddie_pool", "play_structure", "family_raft", "splash_pad", "soft_play", "lazy_river", "mini_golf", "carousel"].includes(attr.id)) score += 4;
    if (guest.type === "Relaxed guest" && ["lazy_river", "sun_lounge", "lap_sports_pool", "mini_golf"].includes(attr.id)) score += 3;
    if (guest.type === "Teen group" && ["multi_racer", "speed_slide", "kamikaze", "aqua_loop", "flowrider", "go_karts"].includes(attr.id)) score += 3;
  }
  if (item.overcrowded) score *= 0.58;
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
      const price = perVisitSpend(pick, pick.level) *
        (attr.category === "facility" ? facilityBonus : 1);
      if (guest.spend + price > guest.budget) break;

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
      } else if (["dining", "ice_cream", "coffee_bar", "concessions"].includes(attr.id)) {
        spendingByCategory.food += price * crowdScale;
        guest.hunger = Math.max(0, guest.hunger - 38);
        guest.thirst = Math.max(0, guest.thirst - (attr.id === "concessions" ? 22 : 8));
        guest.mood += 3;
        guest.energy += 3;
      } else if (["retail", "gift_shop", "photo_kiosk"].includes(attr.id)) {
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
      guest.mood += (safety - 0.7) * 6 + (cleanliness - 0.6) * 5 + entertainment;
      if (pick.overcrowded) guest.mood -= 2;
      if (pick.queueWait > guest.patience / 5) guest.mood -= 3;
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