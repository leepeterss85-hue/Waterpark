import { getAttraction } from "./gameData";

// Guest feedback generator: turns a day's simulation results into a small set
// of representative visitor quotes tagged with sentiment + reason, so the
// player can see *why* guests are happy or unhappy in real time.

const HAPPY = {
  rides: [
    "The {ride} was absolutely worth the trip!",
    "We rode the {ride} three times — best slide ever.",
    "The {ride} had the perfect mix of splash and speed.",
  ],
  queues: [
    "Barely any waiting today — we did everything we wanted.",
    "Lines moved fast, the lifeguards kept it organised.",
  ],
  cleanliness: [
    "The whole park felt spotless and fresh.",
    "Changing rooms and toilets were really clean.",
  ],
  staff: [
    "Staff were so friendly and helpful with the kids.",
    "The entertainers made the queue fun — lovely vibe.",
  ],
  weather: [
    "Perfect sunshine for a water park day!",
    "Couldn't have picked a better weather day.",
  ],
  family: [
    "The kids' area was the highlight of our holiday.",
    "Something fun for every age — we'll be back.",
  ],
  value: [
    "Great day out for the price we paid.",
    "Felt like we got our money's worth and then some.",
  ],
};

const CONTENT = {
  rides: [
    "Rides were fun, just wish there were a couple more.",
    "The {ride} was decent, the rest was okay.",
  ],
  queues: [
    "Some queues, but nothing crazy.",
    "Waited a bit for the popular slides but it moved.",
  ],
  value: [
    "An okay day out — a little pricey but fine.",
    "Not bad, though we expected a bit more variety.",
  ],
  facilities: [
    "Could use more food options around the park.",
    "Decent day, just needed more shade spots.",
  ],
};

const UNHAPPY = {
  queues: [
    "We waited {wait} minutes for the {ride} — way too long!",
    "The queues ruined the day, we barely got on anything.",
  ],
  food: [
    "Nowhere decent to eat, and what there was felt overpriced.",
    "Kids were starving and the food queues were worse than the rides.",
  ],
  thirst: [
    "Couldn't find a drinking fountain anywhere — we were parched.",
    "Drinks were so expensive, we just stayed thirsty.",
  ],
  cleanliness: [
    "The toilets were grim, really let the place down.",
    "Bins overflowing and sticky paths — not good enough.",
  ],
  breakdown: [
    "The {ride} broke down while we were queuing — so frustrating!",
    "Two rides were closed when we got there, no warning.",
  ],
  safety: [
    "Didn't see a single lifeguard near the big pool, felt unsafe.",
    "Not enough staff watching the water — we kept the kids close.",
  ],
  tired: [
    "Nowhere to sit and rest, our feet were killing us.",
    "Not enough sun loungers for how busy it was.",
  ],
  weather: [
    "The weather really spoiled the outdoor bits.",
    "Wish we'd come on a sunnier day.",
  ],
  overcrowded: [
    "Way too crowded, couldn't move near the main pool.",
    "The park felt packed — maybe limit the tickets.",
  ],
};

const REASON_LABEL = {
  rides: "Rides", queues: "Queues", cleanliness: "Cleanliness", staff: "Staff",
  weather: "Weather", family: "Family", value: "Value", facilities: "Facilities",
  food: "Food", thirst: "Drinks", breakdown: "Breakdown", safety: "Safety",
  tired: "Rest spots", overcrowded: "Crowds",
};

function pick(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function fill(template, { ride, wait } = {}) {
  return template
    .replace("{ride}", ride || "the slide")
    .replace("{wait}", wait || "");
}

function entry(sentiment, reason, quote, day) {
  return { sentiment, reason, reasonLabel: REASON_LABEL[reason] || reason, quote, day };
}

// Build a representative feedback feed for the day from sim results + context.
export function generateFeedback(sim, context = {}) {
  const { day = 1, weather, incidents = [], cleanliness = 0.6, safety = 0.7, entertainment = 0 } = context;
  const exp = sim?.guestExperience || { happy: 0, content: 0, unhappy: 0 };
  const needs = sim?.needs || { hunger: 0, thirst: 0, fatigue: 0 };
  const longest = sim?.longestQueue || { id: null, wait: 0, guests: 0 };
  const topAttraction = sim?.topAttraction || null;
  const breakdowns = incidents.filter((i) => i.type === "breakdown");

  const total = Math.max(1, exp.happy + exp.content + exp.unhappy);
  const happyShare = exp.happy / total;
  const unhappyShare = exp.unhappy / total;

  const feedback = [];
  const rideName = topAttraction?.name || "the main slide";

  // --- Happy voices (proportional to happy share, up to 3) ---
  const happyCount = Math.max(0, Math.round(happyShare * 3));
  const happyReasons = [];
  if (topAttraction) happyReasons.push("rides");
  if (longest.wait <= 10) happyReasons.push("queues");
  if (cleanliness >= 0.7) happyReasons.push("cleanliness");
  if (entertainment >= 1) happyReasons.push("staff");
  if (weather?.id === "sunny" || weather?.id === "warm") happyReasons.push("weather");
  if (!happyReasons.length) happyReasons.push("value");
  for (let i = 0; i < happyCount && happyReasons.length; i += 1) {
    const reason = happyReasons[i % happyReasons.length];
    feedback.push(entry("happy", reason, fill(pick(HAPPY[reason]), { ride: rideName }), day));
  }

  // --- Content voices (up to 2) ---
  const contentCount = Math.max(0, Math.round((exp.content / total) * 2));
  const contentReasons = [];
  if (topAttraction) contentReasons.push("rides");
  if (longest.wait > 10 && longest.wait <= 25) contentReasons.push("queues");
  contentReasons.push("value", "facilities");
  for (let i = 0; i < contentCount && contentReasons.length; i += 1) {
    const reason = contentReasons[i % contentReasons.length];
    feedback.push(entry("content", reason, fill(pick(CONTENT[reason] || CONTENT.value), { ride: rideName }), day));
  }

  // --- Unhappy voices (proportional, up to 3) driven by real signals ---
  const unhappyReasons = [];
  if (longest.wait > 25 || (sim?.queueChoices?.leftQueue || 0) > 0) unhappyReasons.push({ reason: "queues", ride: getAttraction(longest.id)?.name, wait: longest.wait });
  if (needs.hunger > 55) unhappyReasons.push({ reason: "food" });
  if (needs.thirst > 55) unhappyReasons.push({ reason: "thirst" });
  if (cleanliness < 0.5) unhappyReasons.push({ reason: "cleanliness" });
  if (breakdowns.length) unhappyReasons.push({ reason: "breakdown", ride: getAttraction(breakdowns[0].attractionId)?.name });
  if (safety < 0.5) unhappyReasons.push({ reason: "safety" });
  if (needs.fatigue > 60) unhappyReasons.push({ reason: "tired" });
  if (weather?.id === "rain" || weather?.id === "storm") unhappyReasons.push({ reason: "weather" });
  if (exp.unhappy > total * 0.4 && !unhappyReasons.length) unhappyReasons.push({ reason: "overcrowded" });

  const unhappyCount = Math.max((sim?.queueChoices?.leftQueue || 0) > 0 ? 1 : 0, Math.round(unhappyShare * 3));
  for (let i = 0; i < unhappyCount && unhappyReasons.length; i += 1) {
    const signal = unhappyReasons[i % unhappyReasons.length];
    feedback.push(entry("unhappy", signal.reason, fill(pick(UNHAPPY[signal.reason] || UNHAPPY.queues), { ride: signal.ride, wait: signal.wait }), day));
  }

  // Always surface at least one voice if there were guests.
  if (!feedback.length && total > 0) {
    feedback.push(entry(happyShare >= 0.5 ? "happy" : "content", "value", fill(pick(HAPPY.value)), day));
  }

  return feedback;
}