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
    legendary: { id: "family_legend", name: "Family Paradise", desc: "Have 4 family attractions in this district.", reward: { money: 25000, empirePoints: 200 } },
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
    legendary: { id: "thrill_legend", name: "Adrenaline Capital", desc: "Have 4 thrill attractions in this district.", reward: { money: 40000, empirePoints: 350 } },
    matchItems: ["mega_slide", "extreme_slide", "loop_slide", "halfpipe_slide", "coaster", "ninja_course"],
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
    legendary: { id: "resort_legend", name: "Five-Star Sanctuary", desc: "Have 3 resort facilities in this district.", reward: { money: 50000, empirePoints: 400 } },
    matchItems: ["vip_lounge", "spa", "cabanas", "luxury_hotel", "gym", "fine_dining"],
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
    legendary: { id: "wave_legend", name: "Tidal Empire", desc: "Have 3 wave attractions in this district.", reward: { money: 45000, empirePoints: 380 } },
    matchItems: ["wave_pool", "surf_wave_pool", "flow_rider", "adventure_river", "dive_pool"],
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
    legendary: { id: "extreme_legend", name: "Legend of Extreme", desc: "Have 3 extreme attractions in this district.", reward: { money: 60000, empirePoints: 500 } },
    matchItems: ["extreme_slide", "loop_slide", "halfpipe_slide", "ninja_course", "cliff_dive"],
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
    legendary: { id: "grand_legend", name: "Legendary Promenade", desc: "Fill this district with 5 attractions.", reward: { money: 100000, empirePoints: 800 } },
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

// Check legendary objective completion for a district given the grid + zones
export function checkDistrictLegendary(district, grid, parkZones, getItem) {
  const matching = grid.reduce((count, id, idx) => {
    if (!id) return count;
    const zone = parkZones?.[idx];
    if (zone !== district.id) return count;
    if (district.matchItems.length === 0) return count + 1; // grand promenade matches all
    return district.matchItems.includes(id) ? count + 1 : count;
  }, 0);
  const required = district.matchItems.length === 0 ? 5 : 4;
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