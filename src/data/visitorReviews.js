// Visitor review generation: guests leave star ratings and written reviews
// of rides, facilities, and the park overall.

const REVIEW_NAMES = [
  "Jamie", "Riley", "Sam", "Alex", "Casey", "Morgan", "Taylor", "Jordan",
  "Quinn", "Avery", "Drew", "Skyler", "Reese", "Hayden", "Rowan", "Sage",
  "Phoenix", "River", "Dakota", "Emerson", "Finley", "Harper", "Kai", "Nova",
];

const POSITIVE_COMMENTS = {
  attraction: [
    "Absolutely loved this ride! The splash at the end was incredible.",
    "Best slide in the park — worth the queue every time.",
    "My kids couldn't stop talking about it all day!",
    "The thrill factor is off the charts. Five stars!",
    "Smooth, fast, and so much fun. A must-visit!",
    "Perfect on a hot day. We went three times!",
    "The views from the top are almost as good as the ride down.",
  ],
  facility: [
    "Clean, well-stocked, and the staff were so friendly.",
    "Exactly what we needed after a few hours in the water.",
    "Great value and super convenient location.",
    "This made our day so much easier. Thank you!",
    "Spotless and well-maintained. Top marks!",
  ],
  park: [
    "Best water park we've ever visited. Already planning our return trip!",
    "From the moment we walked in, everything was perfect.",
    "The whole family had a blast. We'll be back!",
    "Incredible value for money. So much to do!",
    "Clean, safe, and endlessly fun. Five stars across the board!",
    "The atmosphere here is just magical. Love it!",
  ],
};

const EXPERIENCE_COMMENTS = {
  queues: [
    "The queues were the biggest issue today. A few rides really need more capacity.",
    "Loved the park, but the wait times took some of the shine off the day.",
    "The queue management felt good today — we spent more time riding than waiting.",
  ],
  food: [
    "We never went hungry — there were plenty of places to grab food and drinks.",
    "Food and drinks were easy to find and made the day much more comfortable.",
    "The food options felt stretched during the busiest parts of the day.",
  ],
  comfort: [
    "There were plenty of places to rest and recharge between rides.",
    "By the afternoon we were exhausted and could have used more places to sit and cool down.",
  ],
  event: [
    "The event atmosphere made the park feel completely different today — in a good way!",
    "The special event added loads of atmosphere and gave us another reason to stay longer.",
  ],
};

const NEUTRAL_COMMENTS = {
  attraction: [
    "Fun ride but the queue was a bit long. Still enjoyed it though.",
    "Decent slide. Nothing mind-blowing but worth a go.",
    "It was okay. Maybe needs a bit of a refresh.",
    "Good fun but over a bit too quickly for the wait.",
  ],
  facility: [
    "Did the job. Could be a bit cleaner though.",
    "It's fine for what it is. No complaints really.",
    "Adequate. Staff seemed a bit rushed.",
  ],
  park: [
    "Had a good time overall, though some areas need attention.",
    "Nice park but a few rides were closed. Still fun though.",
    "Decent day out. Some queues were long but kids enjoyed it.",
    "It's a nice park. Could use a few more thrill rides.",
  ],
};

const NEGATIVE_COMMENTS = {
  attraction: [
    "Broke down while we were in line. So disappointing.",
    "Felt unsafe and poorly maintained. Needs urgent work.",
    "Waited ages and it wasn't even worth it. Needs upgrading.",
    "The water was dirty and the ride was rough. Not great.",
  ],
  facility: [
    "Filthy and poorly stocked. Really let the park down.",
    "Staff were rude and the place was a mess.",
    "Overpriced and underwhelming. Would not recommend.",
  ],
  park: [
    "Expected so much more. Several rides were broken and the park felt dirty.",
    "Overcrowded, overpriced, and underwhelming. Won't be returning.",
    "Disappointing visit. Staff seemed overwhelmed and facilities were lacking.",
    "Not worth the entrance fee. Too many closed attractions.",
  ],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ratingForMood(mood) {
  if (mood >= 75) return 5;
  if (mood >= 60) return 4;
  if (mood >= 40) return 3;
  if (mood >= 25) return 2;
  return 1;
}

function commentsForRating(rating, category) {
  if (rating >= 4) return pick(POSITIVE_COMMENTS[category] || POSITIVE_COMMENTS.park);
  if (rating === 3) return pick(NEUTRAL_COMMENTS[category] || NEUTRAL_COMMENTS.park);
  return pick(NEGATIVE_COMMENTS[category] || NEGATIVE_COMMENTS.park);
}

/**
 * Generate visitor reviews for the day based on park conditions.
 * @param {Object} params
 * @param {number} params.day - Current game day
 * @param {number} params.guests - Number of guests today
 * @param {number} params.avgMood - Average visitor mood (0-100)
 * @param {Array} params.attractions - Placed attraction items [{id, idx, attr}]
 * @param {Array} params.facilities - Placed facility items [{id, idx, attr}]
 * @param {Array} params.incidents - Active incidents
 * @param {Object} params.popularity - Per-tile popularity scores
 * @param {Object} params.attractionCondition - Per-tile condition (0-100)
 * @param {number} params.cleanliness - 0-1
 * @param {number} params.safety - 0-1
 * @param {Object} params.visitorStats - guest needs and queue experience from the daily simulation
 * @param {Array} params.activeEvents - launched park events affecting today
 * @returns {Array} New reviews (newest first)
 */
export function generateVisitorReviews({
  day,
  guests,
  avgMood,
  attractions,
  facilities,
  incidents,
  popularity,
  attractionCondition,
  cleanliness,
  safety,
  visitorStats = {},
  activeEvents = [],
}) {
  if (guests < 5) return [];

  const reviews = [];
  const queueStats = Object.values(visitorStats?.queueStats || {});
  const longestWait = Math.max(0, ...queueStats.map((q) => q?.wait || 0));
  const needs = visitorStats?.needs || {};
  const queueIssue = longestWait >= 20;
  const foodIssue = (needs.hunger || 0) >= 65 || (needs.thirst || 0) >= 70;
  const comfortIssue = (needs.fatigue || 0) >= 72;
  const eventActive = (activeEvents || []).length > 0;
  const incidentTiles = new Set((incidents || []).map((i) => i.tileIndex));
  const numReviews = Math.min(4, Math.max(1, Math.ceil(guests / 50)));

  const allItems = [
    ...attractions.map((a) => ({ ...a, category: "attraction" })),
    ...facilities.map((f) => ({ ...f, category: "facility" })),
  ];

  for (let i = 0; i < numReviews; i++) {
    const roll = Math.random();
    let target, category;

    if (roll < 0.35 || allItems.length === 0) {
      // Park overall review
      category = "park";
      target = null;
      const rating = ratingForMood(avgMood);
      let comment = commentsForRating(rating, "park");
      if (queueIssue && Math.random() < 0.55) comment = pick(EXPERIENCE_COMMENTS.queues);
      else if (foodIssue && Math.random() < 0.45) comment = pick(EXPERIENCE_COMMENTS.food);
      else if (comfortIssue && Math.random() < 0.45) comment = pick(EXPERIENCE_COMMENTS.comfort);
      else if (eventActive && Math.random() < 0.35) comment = pick(EXPERIENCE_COMMENTS.event);
      reviews.push({
        id: `${day}-park-${i}`,
        day,
        type: "park",
        targetId: null,
        targetName: null,
        rating,
        comment,
        author: pick(REVIEW_NAMES),
        timestamp: Date.now() + i,
      });
    } else {
      // Specific item review
      const item = allItems[Math.floor(Math.random() * allItems.length)];
      category = item.category;
      const pop = popularity?.[item.idx] ?? 50;
      const cond = attractionCondition?.[item.idx] ?? 100;
      const hasIncident = incidentTiles.has(item.idx);
      const itemQueue = item.category === "attraction" ? visitorStats?.queueStats?.[item.idx] : null;

      let baseMood = avgMood;
      if (hasIncident) baseMood -= 25;
      if (itemQueue?.wait >= 20) baseMood -= Math.min(15, itemQueue.wait * 0.25);
      baseMood += (pop - 50) * 0.2;
      baseMood += (cond - 70) * 0.15;
      baseMood = Math.max(0, Math.min(100, baseMood));

      const rating = ratingForMood(baseMood);
      let comment = commentsForRating(rating, category);
      if (itemQueue?.wait >= 25 && Math.random() < 0.65) comment = pick(EXPERIENCE_COMMENTS.queues);
      else if (eventActive && Math.random() < 0.25) comment = pick(EXPERIENCE_COMMENTS.event);
      reviews.push({
        id: `${day}-${item.id}-${i}`,
        day,
        type: category,
        targetId: item.id,
        targetIdx: item.idx,
        targetName: item.attr.name,
        rating,
        comment,
        author: pick(REVIEW_NAMES),
        timestamp: Date.now() + i,
      });
    }
  }

  return reviews;
}

/**
 * Compute aggregate review stats.
 * @param {Array} reviews - All reviews
 * @returns {Object} { averageRating, totalReviews, ratingBreakdown, topRated, worstRated }
 */
export function computeReviewStats(reviews) {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0, ratingBreakdown: [0, 0, 0, 0, 0], topRated: null, worstRated: null };
  }

  const total = reviews.length;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  const breakdown = [0, 0, 0, 0, 0];
  for (const r of reviews) breakdown[r.rating - 1]++;

  // Per-target averages
  const byTarget = {};
  for (const r of reviews) {
    if (!r.targetId) continue;
    if (!byTarget[r.targetId]) byTarget[r.targetId] = { id: r.targetId, name: r.targetName, ratings: [], type: r.type };
    byTarget[r.targetId].ratings.push(r.rating);
  }

  const targetAvgs = Object.values(byTarget).map((t) => ({
    ...t,
    avg: t.ratings.reduce((s, r) => s + r, 0) / t.ratings.length,
    count: t.ratings.length,
  })).filter((t) => t.count >= 1);

  const topRated = targetAvgs.length > 0 ? targetAvgs.reduce((best, t) => t.avg > best.avg ? t : best) : null;
  const worstRated = targetAvgs.length > 0 ? targetAvgs.reduce((worst, t) => t.avg < worst.avg ? t : worst) : null;

  return {
    averageRating: Math.round((sum / total) * 10) / 10,
    totalReviews: total,
    ratingBreakdown: breakdown,
    topRated,
    worstRated,
  };
}

/**
 * Reputation impact from reviews: high average boosts rep, low average hurts.
 * @param {Array} reviews - Recent reviews (last N)
 * @returns {number} Reputation delta to apply
 */
export function reviewReputationImpact(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  if (avg >= 4.5) return 0.6;
  if (avg >= 4) return 0.3;
  if (avg >= 3) return 0;
  if (avg >= 2) return -0.4;
  return -0.8;
}