// District system: themed zones that unlock at expansion milestones,
// providing passive bonuses and legendary endgame objectives.

export const DISTRICTS = [
  {
    id: "family_bay",
    name: "Family Bay",
    icon: "Baby",
    color: "from-amber-400 to-orange-500",
    tone: "text-amber-600",
    minExpansions: 0,
    desc: "A welcoming district for families with young children.",
    bonus: { guestMult: 1.05, moodBoost: 3, desc: "+5% families, +3 mood" },
    legendary: { id: "family_legend", name: "Family Paradise", desc: "Have 4 family attractions in this district.", reward: { money: 25000, empirePoints: 200 }, requiredCount: 4 } },
    matchItems: ["splash_pad", "water_playground", "lazy_river", "kiddie_pool", "soft_play", "water_volleyball"],
  },
  {
    id: "thrill_peak",
    name: "Thrill Peak",
    icon: "Zap",
    color: "from-rose-400 to-red-600",
    tone: "text-rose-600",
    minExpansions: 1,
    desc: "High-adrenaline slides and extreme drops for thrill seekers.",
    bonus: { guestMult: 1.08, incomeMult: 1.05, desc: "+8% thrill guests, +5% income" },
    legendary: { id: "thrill_legend", name: "Adrenaline Capital", desc: "Have 4 thrill attractions in this district.", reward: { money: 40000, empirePoints: 350 }, requiredCount: 4 } },
    matchItems: ["mega_slide_complex", "kamikaze_slide", "aqua_loop", "halfpipe", "water_coaster", "ninja_course", "freefall_drop"],
  },
  {
    id: "resort_springs",
    name: "Resort Springs",
    icon: "Hotel",
    color: "from-violet-400 to-purple-600",
    tone: "text-violet-600",
    minExpansions: 2,
    desc: "Luxury cabanas, spas and VIP lounges for premium guests.",
    bonus: { incomeMult: 1.10, moodBoost: 5, desc: "+10% income, +5 mood" },
    legendary: { id: "resort_legend", name: "Five-Star Sanctuary", desc: "Have 3 resort facilities in this district.", reward: { money: 50000, empirePoints: 400 }, requiredCount: 3 } },
    matchItems: ["vip_lounge", "spa", "cabanas", "grand_luxury", "gym", "dining", "sushi_bar"],
  },
  {
    id: "wave_plaza",
    name: "Wave Plaza",
    icon: "Waves",
    color: "from-cyan-400 to-blue-600",
    tone: "text-cyan-600",
    minExpansions: 3,
    desc: "Large wave pools and flow rides — the heart of the park.",
    bonus: { guestMult: 1.06, satisfaction: 0.05, desc: "+6% guests, +5% satisfaction" },
    legendary: { id: "wave_legend", name: "Tidal Empire", desc: "Have 3 wave attractions in this district.", reward: { money: 45000, empirePoints: 380 }, requiredCount: 3 } },
    matchItems: ["wave_pool", "surf_wave_pool", "flowrider", "adventure_river", "dive_pool"],
  },
  {
    id: "extreme_zone",
    name: "Extreme Zone",
    icon: "Flame",
    color: "from-orange-500 to-red-700",
    tone: "text-orange-600",
    minExpansions: 4,
    desc: "The most extreme attractions — only for the bravest visitors.",
    bonus: { incomeMult: 1.12, guestMult: 1.04, desc: "+12% income, +4% guests" },
    legendary: { id: "extreme_legend", name: "Legend of Extreme", desc: "Have 3 extreme attractions in this district.", reward: { money: 60000, empirePoints: 500 }, requiredCount: 3 } },
    matchItems: ["kamikaze_slide", "aqua_loop", "halfpipe", "ninja_course", "cliff_jump", "freefall_drop"],
  },
  {
    id: "grand_promenade",
    name: "Grand Promenade",
    icon: "Crown",
    color: "from-yellow-300 via-amber-400 to-rose-500",
    tone: "text-amber-600",
    minExpansions: 5,
    desc: "The crown jewel district — a legendary promenade of world-class attractions.",
    bonus: { guestMult: 1.10, incomeMult: 1.10, moodBoost: 8, desc: "+10% guests, +10% income, +8 mood" },
    legendary: { id: "grand_legend", name: "Legendary Promenade", desc: "Fill this district with 5 attractions.", reward: { money: 100000, empirePoints: 800 }, requiredCount: 5 } },
    matchItems: [], // matches any attraction
  },
  // --- Endgame districts (expansions 6-11) ---
  {
    id: "tropical_paradise",
    name: "Tropical Paradise",
    icon: "Palmtree",
    color: "from-lime-400 via-emerald-400 to-teal-500",
    tone: "text-emerald-600",
    minExpansions: 6,
    desc: "A lush tropical oasis with palm-lined pools and beach vibes.",
    bonus: { guestMult: 1.12, moodBoost: 10, satisfaction: 0.06, desc: "+12% guests, +10 mood, +6% satisfaction" },
    legendary: { id: "tropical_legend", name: "Paradise Found", desc: "Have 4 tropical attractions in this district.", reward: { money: 120000, empirePoints: 900 }, requiredCount: 4 } },
    matchItems: ["adventure_lagoon", "infinity_pool", "lazy_river", "adventure_river", "splash_pad", "beach_lounging", "hot_tub"],
  },
  {
    id: "extreme_sports",
    name: "Extreme Sports Zone",
    icon: "Flame",
    color: "from-red-500 via-orange-500 to-amber-500",
    tone: "text-orange-600",
    minExpansions: 7,
    desc: "Adrenaline-fueled extreme attractions for the bravest thrill seekers.",
    bonus: { incomeMult: 1.15, guestMult: 1.06, desc: "+15% income, +6% guests" },
    legendary: { id: "extreme_sports_legend", name: "Extreme Champion", desc: "Have 4 extreme attractions in this district.", reward: { money: 150000, empirePoints: 1000 }, requiredCount: 4 } },
    matchItems: ["cliff_jump", "water_zipline", "freefall_drop", "aqua_loop", "skybox_plunge", "ninja_course", "sky_walk"],
  },
  {
    id: "luxury_marina",
    name: "Luxury Marina",
    icon: "Sailboat",
    color: "from-violet-500 via-purple-500 to-indigo-600",
    tone: "text-violet-600",
    minExpansions: 8,
    desc: "Premium marina with yacht-style cabanas and five-star service.",
    bonus: { incomeMult: 1.18, moodBoost: 12, desc: "+18% income, +12 mood" },
    legendary: { id: "marina_legend", name: "Yacht Club Elite", desc: "Have 3 luxury facilities in this district.", reward: { money: 180000, empirePoints: 1200 }, requiredCount: 3 } },
    matchItems: ["vip_lounge", "cabanas", "spa", "float_therapy", "massage_pavilion", "sushi_bar", "beach_bar"],
  },
  {
    id: "adventure_cove",
    name: "Adventure Cove",
    icon: "Compass",
    color: "from-teal-500 via-cyan-500 to-blue-600",
    tone: "text-cyan-600",
    minExpansions: 9,
    desc: "A rugged adventure zone with rapids, caves and exploration rides.",
    bonus: { guestMult: 1.14, incomeMult: 1.08, satisfaction: 0.08, desc: "+14% guests, +8% income, +8% satisfaction" },
    legendary: { id: "adventure_cove_legend", name: "Explorer's Paradise", desc: "Have 4 adventure attractions in this district.", reward: { money: 200000, empirePoints: 1400 }, requiredCount: 4 } },
    matchItems: ["rapid_rafting", "adventure_river", "adventure_lagoon", "water_zipline", "cliff_jump", "ninja_course", "splash_battle"],
  },
  {
    id: "mythical_realm",
    name: "Mythical Realm",
    icon: "Sparkles",
    color: "from-fuchsia-500 via-purple-500 to-violet-600",
    tone: "text-fuchsia-600",
    minExpansions: 10,
    desc: "A fantastical realm of mythical water creatures and enchanted pools.",
    bonus: { guestMult: 1.16, incomeMult: 1.12, moodBoost: 15, desc: "+16% guests, +12% income, +15 mood" },
    legendary: { id: "mythical_legend", name: "Mythical Master", desc: "Fill this district with 5 attractions.", reward: { money: 250000, empirePoints: 1600 }, requiredCount: 5 } },
    matchItems: [], // matches any attraction
  },
  {
    id: "celestial_heights",
    name: "Celestial Heights",
    icon: "Star",
    color: "from-sky-400 via-cyan-300 to-blue-500",
    tone: "text-sky-600",
    minExpansions: 11,
    desc: "The ultimate endgame district — sky-high attractions among the clouds.",
    bonus: { guestMult: 1.20, incomeMult: 1.20, moodBoost: 20, satisfaction: 0.10, desc: "+20% guests, +20% income, +20 mood, +10% satisfaction" },
    legendary: { id: "celestial_legend", name: "Celestial Sovereign", desc: "Fill this district with 6 attractions.", reward: { money: 500000, empirePoints: 3000 }, requiredCount: 6 } },
    matchItems: [], // matches any attraction
  },
];

export function getDistrict(id) {
  return DISTRICTS.find((d) => d.id === id) || null;
}

export function unlockedDistricts(expansionsDone) {
  return DISTRICTS.filter((d) => expansionsDone >= d.minExpansions);
}

export function nextLockedDistrict(expansionsDone) {
  return DISTRICTS.find((d) => d.minExpansions > expansionsDone) || null;
}

// Check legendary objective completion using each district’s stated target count.
export function checkDistrictLegendary(district, grid, parkZones, getItem) {
  const matching = grid.reduce((count, id, idx) => {
    if (!id) return count;
    const zone = parkZones?.[idx];
    if (zone !== district.id) return count;
    if (district.matchItems.length === 0) return count + 1; // grand promenade matches all
    return district.matchItems.includes(id) ? count + 1 : count;
  }, 0);
  const required = district.legendary?.requiredCount ?? (district.matchItems.length === 0 ? 5 : 4);
  return { matching, required, met: matching >= required };
}

// Aggregate active district bonuses
export function aggregateDistrictBonuses(activeDistrictIds, grid, parkZones) {
  const bonuses = { guestMult: 1, incomeMult: 1, moodBoost: 0, satisfaction: 0 };
  for (const id of activeDistrictIds || []) {
    const district = getDistrict(id);
    if (!district) continue;
    // Only count the bonus if at least one matching item is in the district zone
    const hasMatch = grid.some((gid, idx) => {
      if (!gid || parkZones?.[idx] !== id) return false;
      return district.matchItems.length === 0 || district.matchItems.includes(gid);
    });
    if (hasMatch) {
      bonuses.guestMult *= district.bonus.guestMult || 1;
      bonuses.incomeMult *= district.bonus.incomeMult || 1;
      bonuses.moodBoost += district.bonus.moodBoost || 0;
      bonuses.satisfaction += district.bonus.satisfaction || 0;
    }
  }
  return bonuses;
}