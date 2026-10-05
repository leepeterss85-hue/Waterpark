// Themed-zone gameplay layer. Kept data-driven so existing parks remain compatible.
export const PARK_THEMES = [
  {
    id: "tropical",
    name: "Tropical Paradise",
    icon: "Palmtree",
    description: "Palm trees, lazy rivers, wave pools and resort comforts.",
    affinities: { Family: 1.04, Couple: 1.12, "VIP guest": 1.08, "Thrill seeker": 0.98, "Teen group": 0.98, Tourist: 1.06 },
    attractionIds: ["wave_pool", "lazy_river", "kiddie_pool", "splash_pad", "family_raft", "wave_pool"],
    supportIds: ["palm_tree", "shade_umbrella", "cabanas", "sun_lounge", "fountain"],
  },
  {
    id: "family",
    name: "Family Beach",
    icon: "Baby",
    description: "Easy-going fun for families, younger guests and full-day visits.",
    affinities: { Family: 1.14, Couple: 1.05, "VIP guest": 1.02, "Thrill seeker": 0.96, "Teen group": 0.94, Tourist: 1.0 },
    attractionIds: ["kiddie_pool", "splash_pad", "play_structure", "family_raft", "soft_play", "carousel", "mini_golf"],
    supportIds: ["bench", "shade_umbrella", "toilets", "dining", "ice_cream"],
  },
  {
    id: "thrill",
    name: "Extreme Zone",
    icon: "Zap",
    description: "Big slides, high drops and adrenaline-heavy attractions.",
    affinities: { Family: 0.92, Couple: 0.94, "VIP guest": 1.02, "Thrill seeker": 1.18, "Teen group": 1.15, Tourist: 1.04 },
    attractionIds: ["speed_slide", "kamikaze", "aqua_loop", "tornado_bowl", "water_coaster", "flowrider", "cliff_jump", "freefall_drop", "mega_slide_complex", "multi_racer", "boomerang_halfpipe", "aqua_spin", "go_karts"],
    supportIds: ["wayfinding_sign", "first_aid", "dining", "drinking_fountain"],
  },
  {
    id: "resort",
    name: "Luxury Resort",
    icon: "Umbrella",
    description: "Premium relaxation, spa experiences, cabanas and VIP service.",
    affinities: { Family: 1.01, Couple: 1.16, "VIP guest": 1.2, "Thrill seeker": 0.98, "Teen group": 0.92, Tourist: 1.08 },
    attractionIds: ["lazy_river", "lap_sports_pool", "hot_tub"],
    supportIds: ["cabanas", "spa", "sauna", "sun_lounge", "massage_pavilion", "vip_lounge", "dining", "retail"],
  },
  {
    id: "adventure",
    name: "Adventure Island",
    icon: "Compass",
    description: "Mixed activities, challenges and adventure beyond the water.",
    affinities: { Family: 1.06, Couple: 1.0, "VIP guest": 1.02, "Thrill seeker": 1.1, "Teen group": 1.12, Tourist: 1.14 },
    attractionIds: ["ninja_course", "water_zipline", "gem_mining", "splash_battle", "go_karts", "mini_golf", "aqua_ninja_course"],
    supportIds: ["wayfinding_sign", "dining", "arcade"],
  },
];

export const PARK_THEME_BY_ID = Object.fromEntries(PARK_THEMES.map((theme) => [theme.id, theme]));

export function getParkTheme(id) {
  return PARK_THEME_BY_ID[id] || null;
}

export function themeForItem(itemId) {
  return PARK_THEMES.find((theme) => theme.attractionIds.includes(itemId) || theme.supportIds.includes(itemId))?.id || null;
}

export function calculateParkAppeal({ grid = [], zones = [], getItem }) {
  const occupied = grid.reduce((count, id) => count + (id ? 1 : 0), 0);
  if (!occupied) return { score: 50, label: "Untouched", zones: [], bestZone: null, coverage: 0, variety: 0, scenery: 0 };

  const zoneStats = {};
  const sceneryIds = new Set(["palm_tree", "bench", "shade_umbrella", "fountain", "wayfinding_sign", "trash_can"]);
  let scenery = 0;
  let attractionVariety = new Set();

  grid.forEach((id, index) => {
    if (!id) return;
    const item = getItem?.(id);
    if (!item) return;
    if (item.category === "attraction") attractionVariety.add(id);
    if (sceneryIds.has(id)) scenery += 1;
    const zone = zones[index];
    if (!zone) return;
    if (!zoneStats[zone]) zoneStats[zone] = { count: 0, attractions: 0, support: 0, matches: 0 };
    zoneStats[zone].count += 1;
    const theme = getParkTheme(zone);
    if (theme) {
      if (item.category === "attraction" && theme.attractionIds.includes(id)) zoneStats[zone].matches += 1;
      if (item.category !== "attraction" && theme.supportIds.includes(id)) zoneStats[zone].matches += 1;
    }
    if (item.category === "attraction") zoneStats[zone].attractions += 1;
    else zoneStats[zone].support += 1;
  });

  const zoneEntries = Object.entries(zoneStats);
  const covered = grid.filter((id, i) => id && zones[i]).length;
  const coverage = covered / occupied;
  const variety = Math.min(1, attractionVariety.size / 8);
  const sceneryScore = Math.min(1, scenery / Math.max(5, occupied * 0.18));
  let themeQuality = 0;
  let bestZone = null;
  for (const [id, stats] of zoneEntries) {
    const quality = stats.count ? Math.min(1, (stats.matches / stats.count) * 1.2 + (stats.attractions > 0 ? 0.15 : 0)) : 0;
    themeQuality += quality;
    if (!bestZone || quality > bestZone.quality) bestZone = { id, quality: Number(quality.toFixed(2)), count: stats.count, matches: stats.matches };
  }
  const themeAverage = zoneEntries.length ? themeQuality / zoneEntries.length : 0;

  const score = Math.max(0, Math.min(100, Math.round(
    35 + coverage * 20 + variety * 14 + sceneryScore * 11 + themeAverage * 20
  )));
  const label = score >= 90 ? "Legendary" : score >= 78 ? "Five-Star" : score >= 65 ? "Excellent" : score >= 52 ? "Good" : score >= 38 ? "Developing" : "Needs Attention";

  return {
    score,
    label,
    zones: zoneEntries.map(([id, stats]) => ({ id, ...stats, quality: Math.round((stats.matches / Math.max(1, stats.count)) * 100) })),
    bestZone,
    coverage: Math.round(coverage * 100),
    variety: attractionVariety.size,
    scenery: scenery,
  };
}

export function getThemeGuestAffinity(themeId, guestType) {
  return getParkTheme(themeId)?.affinities?.[guestType] || 1;
}