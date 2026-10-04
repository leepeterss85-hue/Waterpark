import { getAttraction } from "./gameData";

const MAX_AGENTS = 200;
const FACILITY_CAPACITY = 60;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createGuest() {
  return {
    mood: rand(45, 75),
    hunger: rand(10, 35),
    spend: 0,
    visited: new Set(),
    budget: rand(60, 160),
  };
}

function perVisitSpend(attr, level) {
  const inc = attr.income * (1 + 0.15 * level);
  const base = attr.capacity > 0 ? attr.capacity : FACILITY_CAPACITY;
  return inc / base;
}

function popularity(attr, level) {
  return attr.fun + level * 0.5;
}

function scoreAttraction(guest, p) {
  const attr = p.attr;
  let score = popularity(attr, p.level) * 0.4 + 1;
  if (attr.category === "facility") {
    if (attr.id === "dining" || attr.id === "ice_cream" || attr.id === "coffee_bar") {
      score += guest.hunger * 0.08;
    }
    score *= 0.85;
  } else {
    if (attr.fun >= 8 && guest.mood > 60) score += 2.5;
    if (attr.fun <= 5 && (guest.mood < 45 || guest.hunger > 55)) score += 2;
  }
  if (p.overcrowded) score *= 0.6;
  score *= 0.5 + guest.mood / 100;
  return Math.max(0.1, score);
}

function pickAttraction(guest, options) {
  let total = 0;
  const weights = options.map((o) => {
    const w = scoreAttraction(guest, o);
    total += w;
    return w;
  });
  let r = Math.random() * total;
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

export function simulateVisits({ demand, placedItems, incidents, uptime, safety, cleanliness, incomeMult }) {
  const empty = { income: 0, avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {} };
  if (demand <= 0 || !placedItems || placedItems.length === 0) return empty;

  const options = placedItems
    .filter((p) => incidents.get(p.idx)?.type !== "breakdown")
    .map((p) => {
      const inc = incidents.get(p.idx);
      const cap = p.attr.capacity > 0 ? p.attr.capacity * (1 + 0.2 * p.level) : FACILITY_CAPACITY;
      const capMult = inc?.type === "maintenance" ? 0.5 : 1;
      return { ...p, cap: cap * capMult, load: 0, overcrowded: false };
    });

  if (options.length === 0) return { ...empty, avgMood: 35 };

  const agentCount = Math.min(demand, MAX_AGENTS);
  const crowdScale = demand / agentCount;

  let totalSpend = 0;
  let totalMood = 0;
  let totalVisits = 0;
  const movements = {};

  for (let a = 0; a < agentCount; a++) {
    const guest = createGuest();
    const maxSteps = Math.floor(rand(3, 6));
    for (let step = 0; step < maxSteps; step++) {
      for (const o of options) o.overcrowded = o.load > o.cap * 0.85;
      const avail = options.filter((o) => !guest.visited.has(o.idx) && o.load < o.cap);
      if (avail.length === 0) break;
      const pick = pickAttraction(guest, avail);
      const price = perVisitSpend(pick.attr, pick.level);
      if (guest.spend + price > guest.budget) break;
      guest.spend += price;
      guest.visited.add(pick.idx);
      pick.load += crowdScale;
      totalSpend += price * crowdScale;
      totalVisits += crowdScale;
      movements[pick.attr.id] = (movements[pick.attr.id] || 0) + crowdScale;

      const attr = pick.attr;
      if (attr.category === "attraction") {
        const funGain = attr.fun + pick.level * 0.5;
        guest.mood += (funGain - 5) * 0.8;
        guest.hunger += 7;
      } else if (attr.id === "dining" || attr.id === "ice_cream" || attr.id === "coffee_bar") {
        guest.hunger = Math.max(0, guest.hunger - 35);
        guest.mood += 3;
        guest.hunger += 4;
      } else {
        guest.mood += 1.5;
        guest.hunger += 4;
      }
      if (pick.overcrowded) guest.mood -= 2;
      if (guest.hunger > 80) guest.mood -= 4;
      guest.mood += (safety - 0.7) * 6;
      guest.mood += (cleanliness - 0.6) * 5;
      guest.mood = Math.max(0, Math.min(100, guest.mood));
    }
    totalMood += guest.mood;
  }

  const income = totalSpend * uptime * incomeMult;
  const avgMood = totalMood / agentCount;
  const avgSpendPerVisit = totalVisits > 0 ? totalSpend / totalVisits : 0;
  let topId = null;
  let topCount = 0;
  for (const [id, c] of Object.entries(movements)) {
    if (c > topCount) {
      topCount = c;
      topId = id;
    }
  }
  const topAttraction = topId ? getAttraction(topId) : null;

  return {
    income,
    avgMood,
    avgSpendPerVisit,
    totalVisits: Math.round(totalVisits),
    topAttraction,
    movements,
  };
}