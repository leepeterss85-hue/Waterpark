import { getParkItem, getAttractionProfile, staffEffects } from "@/data/gameData";
import { getHotelDef } from "@/data/hotels";

export const AWARD_CEREMONY_CYCLE = 30;

export const AWARD_CATEGORIES = [
  {
    id: "best_family_park",
    name: "Best Family Park",
    description: "Excellence in family-friendly attractions and services.",
    icon: "Users",
    color: "amber",
    requirements: {
      familyAttractions: 4,
      familyMemberships: 3,
      avgMood: 60,
      parkAppeal: 55,
    },
    requirementLabels: {
      familyAttractions: "Family attractions",
      familyMemberships: "Family memberships",
      avgMood: "Avg mood",
      parkAppeal: "Park appeal",
    },
    reward: { reputation: 5, guestMult: 1.06 },
  },
  {
    id: "best_thrill_park",
    name: "Best Thrill Park",
    description: "Outstanding extreme attractions for thrill seekers.",
    icon: "Flame",
    color: "red",
    requirements: {
      thrillAttractions: 4,
      avgPopularity: 60,
      peakGuests: 150,
      avgMood: 55,
    },
    requirementLabels: {
      thrillAttractions: "Thrill attractions",
      avgPopularity: "Avg popularity",
      peakGuests: "Peak guests",
      avgMood: "Avg mood",
    },
    reward: { reputation: 5, guestMult: 1.06 },
  },
  {
    id: "best_resort",
    name: "Best Resort",
    description: "Premium accommodation and resort experience.",
    icon: "Hotel",
    color: "violet",
    requirements: {
      hotels: 1,
      resortRating: 3,
      hotelOccupancy: 50,
      parkAppeal: 60,
    },
    requirementLabels: {
      hotels: "Hotels built",
      resortRating: "Resort rating",
      hotelOccupancy: "Hotel occupancy %",
      parkAppeal: "Park appeal",
    },
    reward: { reputation: 6, guestMult: 1.07 },
  },
  {
    id: "best_guest_experience",
    name: "Best Guest Experience",
    description: "Exceptional service, cleanliness and satisfaction.",
    icon: "Heart",
    color: "pink",
    requirements: {
      avgMood: 70,
      cleanliness: 0.75,
      safety: 0.80,
      maxIncidents: 1,
    },
    requirementLabels: {
      avgMood: "Avg mood",
      cleanliness: "Cleanliness",
      safety: "Safety",
      maxIncidents: "Max incidents",
    },
    reward: { reputation: 7, guestMult: 1.08 },
  },
  {
    id: "best_attractions",
    name: "Best Attractions",
    description: "Diverse, popular and well-maintained attractions.",
    icon: "Trophy",
    color: "cyan",
    requirements: {
      totalAttractions: 10,
      avgPopularity: 65,
      avgCondition: 65,
      totalUpgrades: 8,
    },
    requirementLabels: {
      totalAttractions: "Total attractions",
      avgPopularity: "Avg popularity",
      avgCondition: "Avg condition",
      totalUpgrades: "Total upgrades",
    },
    reward: { reputation: 6, guestMult: 1.07 },
  },
  {
    id: "five_star_park",
    name: "Five-Star Park Award",
    description: "The highest honor — all-around park excellence.",
    icon: "Star",
    color: "yellow",
    requirements: {
      parkAppeal: 75,
      reputation: 75,
      totalAttractions: 12,
      avgMood: 65,
      hasResort: true,
      maxIncidents: 1,
    },
    requirementLabels: {
      parkAppeal: "Park appeal",
      reputation: "Reputation",
      totalAttractions: "Total attractions",
      avgMood: "Avg mood",
      hasResort: "Has resort",
      maxIncidents: "Max incidents",
    },
    reward: { reputation: 10, guestMult: 1.12 },
  },
];

/**
 * Evaluate the park against all award categories.
 * Returns per-category met status plus the computed metrics.
 */
export function evaluateAwards(context) {
  const {
    grid, upgrades, attractionCondition, staff, visitorStats,
    parkAppeal, reputation, incidents, hotelStats, membershipCounts,
    popularity, peakGuests, totalUpgrades, resortRating,
  } = context;

  const attractions = (grid || [])
    .map((id, idx) => (id ? { id, idx, attr: getParkItem(id), profile: getAttractionProfile(id) } : null))
    .filter(Boolean)
    .filter((p) => p.attr.category === "attraction");

  const familyAttractions = attractions.filter((p) => p.profile?.zone === "family").length;
  const thrillAttractions = attractions.filter((p) => p.profile?.zone === "thrill").length;
  const totalAttractions = attractions.length;
  const hotels = (grid || []).filter((id) => getHotelDef(id)).length;

  const popScores = attractions.map((p) => (popularity || [])[p.idx] || 0).filter((v) => v > 0);
  const avgPopularity = popScores.length > 0 ? popScores.reduce((s, v) => s + v, 0) / popScores.length : 0;

  const condScores = attractions.map((p) => (attractionCondition || [])[p.idx] || 0).filter((v) => v > 0);
  const avgCondition = condScores.length > 0 ? condScores.reduce((s, v) => s + v, 0) / condScores.length : 0;

  const fx = staffEffects(staff);
  const avgMood = visitorStats?.avgMood || 0;
  const incidentCount = (incidents || []).length;

  const metrics = {
    familyAttractions,
    thrillAttractions,
    totalAttractions,
    hotels,
    avgPopularity: Math.round(avgPopularity),
    avgCondition: Math.round(avgCondition),
    totalUpgrades: totalUpgrades || 0,
    avgMood: Math.round(avgMood),
    cleanliness: fx.cleanliness,
    safety: fx.safety,
    maxIncidents: incidentCount,
    parkAppeal: parkAppeal?.score || 0,
    reputation: Math.round(reputation),
    peakGuests: peakGuests || 0,
    familyMemberships: (membershipCounts?.family_membership || 0),
    resortRating: resortRating || 0,
    hotelOccupancy: hotelStats?.occupancy || 0,
    hasResort: hotels > 0,
  };

  const results = AWARD_CATEGORIES.map((award) => {
    const req = award.requirements;
    const checks = {};
    let met = true;
    for (const [key, threshold] of Object.entries(req)) {
      const value = metrics[key];
      let passed;
      if (key === "maxIncidents") passed = value <= threshold;
      else if (key === "hasResort") passed = value === threshold;
      else passed = value >= threshold;
      checks[key] = { threshold, value: Math.round(value * 100) / 100, passed };
      if (!passed) met = false;
    }
    return { ...award, met, checks };
  });

  return { results, metrics };
}

/**
 * Compute the combined guest multiplier from all currently held awards.
 */
export function totalAwardGuestMult(heldAwards) {
  return (heldAwards || []).reduce((mult, a) => mult * (a.guestMult || 1), 1);
}