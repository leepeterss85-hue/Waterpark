// VIP Celebrity Guest system: named celebrities with types, rewards, and social posts.
// Enhances the basic VIP visit with richer data and history tracking.

export const VIP_TYPES = [
  {
    id: "influencer",
    name: "Social Media Influencer",
    icon: "Camera",
    color: "from-pink-400 to-fuchsia-500",
    tone: "text-pink-600",
    names: ["SplashQueen Priya", "WaveRider Jake", "AquaVlogger Mia", "DripKing Leo"],
    repReward: 4,
    moneyReward: 3000,
    socialBoost: true,
    desc: "Posts to thousands of followers. Huge social reputation boost if impressed.",
    minLevel: 2,
    chance: 0.35,
  },
  {
    id: "athlete",
    name: "Olympic Swimmer",
    icon: "Medal",
    color: "from-amber-400 to-orange-600",
    tone: "text-amber-600",
    names: ["Champion Rivera", "Gold Medalist Chen", "Record Holder Okafor", "Sprint Star Aiko"],
    repReward: 3,
    moneyReward: 5000,
    socialBoost: false,
    desc: "A famous athlete visits. Big money reward and guest surge if impressed.",
    minLevel: 3,
    chance: 0.25,
  },
  {
    id: "critic",
    name: "Travel Critic",
    icon: "PenLine",
    color: "from-violet-400 to-purple-600",
    tone: "text-violet-600",
    names: ["Critic Sterling", "Reviewer Hawthorne", "Travel Writer Banks", "Inspector Vale"],
    repReward: 6,
    moneyReward: 2000,
    socialBoost: true,
    desc: "Writes a review that shapes your reputation. High risk, high reward.",
    minLevel: 4,
    chance: 0.20,
  },
  {
    id: "royal",
    name: "Royal Family Member",
    icon: "Crown",
    color: "from-yellow-300 via-amber-400 to-rose-500",
    tone: "text-amber-600",
    names: ["Prince Aldric", "Princess Isolde", "Duke Sebastian", "Duchess Aurora"],
    repReward: 5,
    moneyReward: 8000,
    socialBoost: true,
    desc: "A royal visit! Massive prestige and money if you meet their high standards.",
    minLevel: 6,
    chance: 0.12,
  },
  {
    id: "musician",
    name: "Famous Musician",
    icon: "Music",
    color: "from-cyan-400 to-blue-600",
    tone: "text-cyan-600",
    names: ["DJ Tidalwave", "Pop Star Harmony", "Rapper AquaFlow", "Band The Splash"],
    repReward: 4,
    moneyReward: 6000,
    socialBoost: true,
    desc: "A music star who might offer to perform. Big guest surge and social boost.",
    minLevel: 5,
    chance: 0.08,
  },
];

export function getVipType(id) {
  return VIP_TYPES.find((t) => t.id === id) || null;
}

// Roll a VIP visit based on player level
export function rollVipVisit(level) {
  const eligible = VIP_TYPES.filter((t) => level >= t.minLevel);
  if (eligible.length === 0) return null;
  // Weighted random by chance
  const totalWeight = eligible.reduce((s, t) => s + t.chance, 0);
  let roll = Math.random() * totalWeight;
  let chosen = eligible[0];
  for (const t of eligible) {
    roll -= t.chance;
    if (roll <= 0) { chosen = t; break; }
  }
  const name = chosen.names[Math.floor(Math.random() * chosen.names.length)];
  return {
    typeId: chosen.id,
    typeName: chosen.name,
    typeIcon: chosen.icon,
    color: chosen.color,
    tone: chosen.tone,
    name,
    day: null, // set by caller
  };
}

// Evaluate a VIP visit outcome
export function evaluateVipVisit(vip, { avgMood, cleanliness, safety, reputation }) {
  const score = avgMood * 0.4 + cleanliness * 30 + safety * 30;
  const type = getVipType(vip.typeId);
  const threshold = vip.typeId === "royal" ? 75 : vip.typeId === "critic" ? 70 : 55;

  if (score >= threshold) {
    return {
      outcome: "impressed",
      money: type.moneyReward + Math.round(score * 20),
      reputation: type.repReward,
      socialBoost: type.socialBoost,
      message: `${vip.name} was blown away! +£${(type.moneyReward + Math.round(score * 20)).toLocaleString()}, +${type.repReward} reputation.`,
    };
  } else if (score >= threshold - 20) {
    return {
      outcome: "satisfied",
      money: Math.round(type.moneyReward * 0.3),
      reputation: 1,
      socialBoost: false,
      message: `${vip.name} had a decent visit. +£${Math.round(type.moneyReward * 0.3).toLocaleString()}.`,
    };
  } else {
    return {
      outcome: "disappointed",
      money: 0,
      reputation: -3,
      socialBoost: type.socialBoost,
      message: `${vip.name} left disappointed. -3 reputation.`,
    };
  }
}

// Generate a social media post from a VIP visit
export function generateVipSocialPost(vip, outcome, day) {
  const type = getVipType(vip.typeId);
  const templates = {
    impressed: [
      `Just visited this water park and I'm OBSESSED! ${vip.name} approved 💦✨`,
      `Best water park experience ever! Staff were incredible 🤩 #WaterParkLife`,
      `This park knows what they're doing. 10/10 would visit again! ⭐⭐⭐⭐⭐`,
    ],
    disappointed: [
      `Not impressed with this park today. Expected better from the hype 😞`,
      `Visited and left wanting more. Needs work. 2/5 ⭐⭐`,
      `Overrated and overpriced. Won't be back.`,
    ],
    satisfied: [
      `Decent day at the water park. Nothing special but fun enough 👍`,
      `Had a good time today! Could improve but overall positive.`,
    ],
  };
  const pool = templates[outcome.outcome] || templates.satisfied;
  const text = pool[Math.floor(Math.random() * pool.length)];
  const reach = outcome.outcome === "impressed"
    ? Math.floor(20000 + Math.random() * 80000)
    : outcome.outcome === "disappointed"
      ? Math.floor(15000 + Math.random() * 50000)
      : Math.floor(5000 + Math.random() * 15000);
  return {
    id: `vip-${day}-${Math.random().toString(36).slice(2, 7)}`,
    day,
    text,
    sentiment: outcome.outcome === "disappointed" ? "negative" : "positive",
    platform: "splashgram",
    platformName: "SplashGram",
    platformBadge: "bg-pink-100 text-pink-600",
    reach,
    viral: outcome.outcome !== "satisfied",
    rideId: null,
    rideName: null,
    rideIdx: null,
    isVipPost: true,
    vipName: vip.name,
  };
}