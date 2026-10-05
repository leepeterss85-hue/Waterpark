// Marketing campaign definitions for the water park tycoon.
// Each campaign runs for a fixed duration, boosting guest demand and/or reputation.
// Targeted campaigns are more effective when the park has matching attractions.

export const CAMPAIGNS = [
  {
    id: "social_media",
    name: "Social Media Push",
    icon: "Smartphone",
    cost: 800,
    duration: 4,
    guestBoost: 0.12,
    repBoost: 0.3,
    target: null,
    color: "from-sky-400 to-blue-500",
    description: "Targeted ads on social platforms reach local families and teens.",
  },
  {
    id: "radio_spot",
    name: "Local Radio Spot",
    icon: "Radio",
    cost: 600,
    duration: 4,
    guestBoost: 0.08,
    repBoost: 0.2,
    target: null,
    color: "from-amber-400 to-orange-500",
    description: "Affordable radio ads reach commuters and weekend planners.",
  },
  {
    id: "family_deal",
    name: "Family Package Promo",
    icon: "Users",
    cost: 1000,
    duration: 5,
    guestBoost: 0.16,
    repBoost: 0.4,
    target: "Family",
    color: "from-amber-400 to-rose-500",
    description: "Discounted family bundles attract parents with children.",
  },
  {
    id: "influencer",
    name: "Influencer Partnership",
    icon: "Star",
    cost: 1500,
    duration: 3,
    guestBoost: 0.20,
    repBoost: 0.5,
    target: "Teen group",
    color: "from-fuchsia-400 to-purple-500",
    description: "A popular influencer brings their followers — mostly teens and young adults.",
  },
  {
    id: "vip_event",
    name: "VIP Experience Promo",
    icon: "Crown",
    cost: 2500,
    duration: 4,
    guestBoost: 0.14,
    repBoost: 0.7,
    target: "Premium guest",
    color: "from-yellow-400 to-amber-600",
    description: "Luxury-focused campaign attracts high-spending premium guests.",
  },
  {
    id: "tv_ad",
    name: "TV Commercial",
    icon: "Tv",
    cost: 3000,
    duration: 6,
    guestBoost: 0.24,
    repBoost: 0.8,
    target: null,
    color: "from-violet-400 to-indigo-600",
    description: "Regional TV spot during prime time draws broad attention.",
  },
  {
    id: "billboard",
    name: "Highway Billboard",
    icon: "Image",
    cost: 2000,
    duration: 8,
    guestBoost: 0.14,
    repBoost: 0.3,
    target: null,
    color: "from-emerald-400 to-teal-600",
    description: "A prominent billboard keeps the park top-of-mind for weeks.",
  },
];

// Attractions that strongly appeal to each guest demographic.
export const DEMOGRAPHIC_ATTRACTIONS = {
  Family: ["kiddie_pool", "play_structure", "family_raft", "splash_pad", "soft_play", "lazy_river", "mini_golf", "carousel", "water_volleyball", "water_playground", "splash_battle", "bumper_boats"],
  "Teen group": ["multi_racer", "speed_slide", "kamikaze", "aqua_loop", "flowrider", "go_karts", "bumper_boats", "surf_wave_pool", "ninja_course", "water_zipline"],
  "Thrill seeker": ["speed_slide", "kamikaze", "aqua_loop", "cliff_jump", "freefall_drop", "mega_slide_complex", "water_coaster", "tornado_bowl", "halfpipe", "surf_wave_pool", "adventure_river", "dive_pool"],
  "Premium guest": ["surf_wave_pool", "dive_pool", "vip_lounge", "spa", "sushi_bar", "cabanas", "float_therapy", "massage_pavilion", "hot_tub", "sauna"],
  "Relaxed guest": ["lazy_river", "sun_lounge", "lap_sports_pool", "mini_golf", "adventure_river", "dive_pool", "hot_tub", "sauna", "beach_lounging", "spa"],
};

// Returns 0–1 effectiveness multiplier for a targeted campaign based on park attractions.
export function campaignEffectiveness(campaign, grid) {
  if (!campaign.target || !grid) return 1;
  const matching = DEMOGRAPHIC_ATTRACTIONS[campaign.target] || [];
  const hasMatch = grid.some((id) => id && matching.includes(id));
  if (!hasMatch) return 0.5; // targeted campaign with no matching attractions underperforms
  const matchCount = grid.filter((id) => id && matching.includes(id)).length;
  return Math.min(1.4, 1 + matchCount * 0.08); // more matching attractions = stronger boost
}

export function getCampaign(id) {
  return CAMPAIGNS.find((c) => c.id === id);
}