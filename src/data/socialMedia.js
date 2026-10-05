// Social media reputation system for the water park tycoon.
// Guests generate posts based on their experience; posts can go viral,
// rides can trend, and the overall social reputation drives visitor demand.

export const PLATFORMS = [
  { id: "splashgram", name: "SplashGram", icon: "Camera", color: "pink", badge: "bg-pink-100 text-pink-600" },
  { id: "wavetok", name: "WaveTok", icon: "Video", color: "cyan", badge: "bg-cyan-100 text-cyan-600" },
  { id: "parkbook", name: "ParkBook", icon: "Users", color: "blue", badge: "bg-blue-100 text-blue-600" },
  { id: "thrillr", name: "Thrillr", icon: "Flame", color: "red", badge: "bg-red-100 text-red-600" },
];

const POSITIVE_TEMPLATES = [
  "Best day ever! {ride} was absolutely incredible 🎢💦",
  "The wave pool is everything! Already planning my next visit ⭐",
  "{ride} is a MUST-try. Best slide I've ever been on!",
  "Super clean and the staff were so friendly. 10/10 day 👏",
  "Lines moved fast and the food was great. Highly recommend!",
  "That VIP lounge was worth every penny. Feeling pampered 💎",
  "My kids loved the splash pad! Perfect family day out 👨‍👩‍👧‍👦",
  "Water park paradise! {ride} gave me the best adrenaline rush 🤩",
  "Five stars! Clean facilities, amazing rides, friendly staff ⭐⭐⭐⭐⭐",
  "Best water park I've been to. {ride} alone is worth the trip!",
];

const NEGATIVE_TEMPLATES = [
  "AVOID {ride} — it broke down while we were in line 😡",
  "Dirty changing rooms and overpriced food. Very disappointed.",
  "Waited 2 hours for {ride} only for it to close. Waste of money.",
  "Way too crowded. Could barely move. Needs better management.",
  "Saw a safety issue today. Won't be bringing my family back.",
  "Rude staff and long waits. Not worth the ticket price.",
  "The park looked run down and dirty. Sad 😞",
  "Overpriced and underwhelming. {ride} was the only decent thing.",
  "Poorly managed. Too many rides closed. Total ripoff.",
];

/**
 * Generate social media posts from the day's park experience.
 * Post count scales with visitors; sentiment follows guest mood.
 */
export function generateSocialPosts(context) {
  const { day, visitorStats, incidents, attractions, activeEvents, popularity } = context;
  const posts = [];
  const avgMood = visitorStats?.avgMood || 50;
  const totalVisits = visitorStats?.totalVisits || 0;
  const incidentCount = (incidents || []).length;

  const postCount = Math.min(6, Math.max(0, Math.ceil(totalVisits / 40)));

  for (let i = 0; i < postCount; i++) {
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    const positiveChance = Math.max(0.15, Math.min(0.9, avgMood / 100));
    const isPositive = Math.random() < positiveChance;

    let text, rideId = null, rideName = null, rideIdx = null;
    let viralChance = 0.04;

    if (isPositive) {
      const popularRides = attractions.filter((a) => (popularity?.[a.idx] || 0) > 45);
      if (popularRides.length > 0 && Math.random() < 0.55) {
        const ride = popularRides[Math.floor(Math.random() * popularRides.length)];
        rideId = ride.id;
        rideName = ride.attr.name;
        rideIdx = ride.idx;
        viralChance = 0.06 + Math.min(0.12, (popularity?.[ride.idx] || 0) / 800);
      }
      let template = POSITIVE_TEMPLATES[Math.floor(Math.random() * POSITIVE_TEMPLATES.length)];
      if (activeEvents?.length > 0 && Math.random() < 0.25) {
        template = `The ${activeEvents[0].name} was unreal! Best park day ever 🔥`;
        viralChance += 0.05;
      }
      text = template.replace("{ride}", rideName || "the park");
    } else {
      if (incidentCount > 0 && Math.random() < 0.5) {
        const incident = incidents[Math.floor(Math.random() * incidents.length)];
        const ride = attractions.find((a) => a.idx === incident.tileIndex);
        if (ride) {
          rideId = ride.id;
          rideName = ride.attr.name;
          rideIdx = ride.idx;
        }
      }
      const template = NEGATIVE_TEMPLATES[Math.floor(Math.random() * NEGATIVE_TEMPLATES.length)];
      text = template.replace("{ride}", rideName || "the park");
      viralChance = 0.07; // Bad experiences more likely to go viral
    }

    const viral = Math.random() < viralChance;
    const reach = viral
      ? Math.floor(5000 + Math.random() * 45000)
      : Math.floor(40 + Math.random() * 460);

    posts.push({
      id: `${day}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      day,
      text,
      sentiment: isPositive ? "positive" : "negative",
      platform: platform.id,
      platformName: platform.name,
      platformBadge: platform.badge,
      reach,
      viral,
      rideId,
      rideName,
      rideIdx,
    });
  }

  return posts;
}

/**
 * Compute social reputation (0–100) from recent posts.
 * Weighted by reach and viral status; shifts gradually toward the target.
 */
export function computeSocialReputation(posts, prevReputation) {
  const prev = prevReputation ?? 50;
  if (!posts || posts.length === 0) return Math.max(45, Math.min(55, prev));

  let weightedSentiment = 0;
  let totalWeight = 0;
  for (const post of posts) {
    const sentimentValue = post.sentiment === "positive" ? 1 : -1;
    const reachWeight = Math.log10(post.reach + 10);
    const viralMultiplier = post.viral ? 3 : 1;
    const weight = reachWeight * viralMultiplier;
    weightedSentiment += sentimentValue * weight;
    totalWeight += weight;
  }

  const avgSentiment = totalWeight > 0 ? weightedSentiment / totalWeight : 0;
  const targetScore = 50 + avgSentiment * 50;
  const shiftRate = 0.18;
  return Math.max(0, Math.min(100, Math.round(prev + (targetScore - prev) * shiftRate)));
}

/** Visitor demand multiplier from social reputation: 0.85 at 0, 1.15 at 100. */
export function socialDemandMult(socialReputation) {
  return 0.85 + ((socialReputation || 50) / 100) * 0.30;
}

/** Ticket price tolerance from social reputation: 0.90 at 0, 1.10 at 100. */
export function socialPriceTolerance(socialReputation) {
  return 0.90 + ((socialReputation || 50) / 100) * 0.20;
}

/** Reputation tier label and color for UI display. */
export function socialRepTier(score) {
  if (score >= 75) return { label: "Trending", color: "text-emerald-600", bg: "bg-emerald-500", ring: "from-emerald-400 to-teal-500" };
  if (score >= 60) return { label: "Positive", color: "text-green-600", bg: "bg-green-500", ring: "from-green-400 to-emerald-500" };
  if (score >= 45) return { label: "Mixed", color: "text-amber-600", bg: "bg-amber-500", ring: "from-amber-400 to-yellow-500" };
  if (score >= 25) return { label: "Negative", color: "text-orange-600", bg: "bg-orange-500", ring: "from-orange-400 to-red-500" };
  return { label: "Crisis", color: "text-red-600", bg: "bg-red-500", ring: "from-red-400 to-rose-600" };
}