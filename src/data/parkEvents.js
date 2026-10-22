import { getSeason } from "@/data/parkSystems";

export const EVENT_CATEGORIES = [
  { id: "summer", name: "Summer", icon: "Sun", color: "from-orange-400 to-amber-500", tone: "text-orange-600", ring: "ring-orange-300" },
  { id: "halloween", name: "Halloween", icon: "Sparkles", color: "from-purple-500 to-indigo-600", tone: "text-purple-600", ring: "ring-purple-300" },
  { id: "winter", name: "Christmas / Winter", icon: "Snowflake", color: "from-cyan-400 to-blue-500", tone: "text-cyan-600", ring: "ring-cyan-300" },
  { id: "night", name: "Night Swimming", icon: "Moon", color: "from-indigo-600 to-slate-700", tone: "text-indigo-600", ring: "ring-indigo-300" },
  { id: "fireworks", name: "Fireworks", icon: "Flame", color: "from-rose-500 to-fuchsia-600", tone: "text-rose-600", ring: "ring-rose-300" },
  { id: "concert", name: "Concerts", icon: "Music", color: "from-pink-500 to-fuchsia-600", tone: "text-pink-600", ring: "ring-pink-300" },
  { id: "competition", name: "Competition Days", icon: "Trophy", color: "from-yellow-400 to-amber-500", tone: "text-amber-600", ring: "ring-amber-300" },
  { id: "promotion", name: "Special Promotions", icon: "Megaphone", color: "from-emerald-400 to-teal-500", tone: "text-emerald-600", ring: "ring-emerald-300" },
];

export const MAJOR_EVENTS = [
  { id: "busy_weekend", name: "Big Weekend", category: "promotion", icon: "Users", cost: 2000, duration: 2, guestMult: 1.30, incomeMult: 1.08, repDelta: 0.4, minLevel: 1, seasons: ["spring","summer","autumn","winter"], revenuePerDay: 0, description: "Welcome the weekend crowds. Pair with the Weekend Rush timed challenge.", requires: [], minAttractions: 2, downside: { rideWearMult: 1.25, label: "+25% ride wear from weekend crowds" } },
  { id: "evening_pool_party", name: "Evening Pool Party", category: "night", icon: "Moon", cost: 2500, duration: 2, guestMult: 1.22, incomeMult: 1.18, repDelta: 0.6, minLevel: 1, seasons: ["spring","summer","autumn","winter"], revenuePerDay: 0, description: "Celebrate your new district with an evening pool party. Try the Party Planner timed challenge.", requires: ["wave_pool","kiddie_pool","lap_sports_pool","lazy_river"], requireMode: "any", downside: { minStaff: 2, minLifeguards: 2, label: "Needs 2 lifeguards for safe evening swimming" } },
  // Summer events
  { id: "summer_splash_festival", name: "Summer Splash Festival", category: "summer", icon: "Sun", cost: 8000, duration: 5, guestMult: 1.45, incomeMult: 1.15, repDelta: 1.2, minLevel: 2, seasons: ["summer"], revenuePerDay: 0, description: "A week-long celebration with music, games and special pool activities.", requires: ["wave_pool", "splash_pad"], requireMode: "any", downside: { rideWearMult: 1.5, label: "+50% ride wear from heavy use" } },
  { id: "tropical_weekend", name: "Tropical Paradise Weekend", category: "summer", icon: "Umbrella", cost: 5000, duration: 3, guestMult: 1.30, incomeMult: 1.10, repDelta: 0.8, minLevel: 1, seasons: ["summer", "spring"], revenuePerDay: 0, description: "Bring the island vibe with tropical decorations and themed drinks.", requires: ["dining", "beach_bar"], requireMode: "any", downside: { foodDepleteMult: 1.4, label: "Food stock depletes 40% faster" } },
  { id: "beach_bash", name: "Beach Bash Bonanza", category: "summer", icon: "Waves", cost: 3500, duration: 2, guestMult: 1.22, incomeMult: 1.08, repDelta: 0.5, minLevel: 1, seasons: ["summer", "spring"], revenuePerDay: 0, description: "Sand, sun and splash games for the whole family.", requires: ["beach_lounging", "sun_lounge"], requireMode: "any" },

  // Halloween events
  { id: "haunted_lagoon", name: "Haunted Lagoon Night", category: "halloween", icon: "Sparkles", cost: 6000, duration: 3, guestMult: 1.35, incomeMult: 1.25, repDelta: 1.0, minLevel: 2, seasons: ["autumn"], revenuePerDay: 0, description: "Spooky decorations, fog machines and monster-themed slides after dark.", requires: ["wave_pool", "lazy_river", "rapid_rafting"], requireMode: "any", downside: { familyGuestMult: 0.85, label: "Families 15% less likely to visit" } },
  { id: "pumpkin_plunge", name: "Pumpkin Plunge Festival", category: "halloween", icon: "Flame", cost: 4000, duration: 4, guestMult: 1.20, incomeMult: 1.18, repDelta: 0.7, minLevel: 1, seasons: ["autumn"], revenuePerDay: 0, description: "Halloween-themed water games and costume contests.", requires: ["splash_pad", "kiddie_pool"], requireMode: "any" },

  // Christmas / Winter events
  { id: "winter_wonderland", name: "Winter Wonderland", category: "winter", icon: "Sparkles", cost: 7000, duration: 5, guestMult: 1.30, incomeMult: 1.20, repDelta: 1.1, minLevel: 2, seasons: ["winter"], revenuePerDay: 0, description: "Transform the park with festive lights, heated pools and holiday cheer.", requires: ["hot_tub", "sauna"], requireMode: "any", downside: { utilityCostMult: 1.3, label: "+30% utility costs (heating)" } },
  { id: "holiday_lights_night", name: "Holiday Lights Night", category: "winter", icon: "Moon", cost: 4500, duration: 3, guestMult: 1.25, incomeMult: 1.22, repDelta: 0.8, minLevel: 1, seasons: ["winter"], revenuePerDay: 0, description: "Thousands of lights illuminate the park for a magical evening.", requires: [], minAttractions: 3 },

  // Night swimming
  { id: "moonlight_swim", name: "Moonlight Swim", category: "night", icon: "Moon", cost: 3000, duration: 2, guestMult: 1.18, incomeMult: 1.28, repDelta: 0.6, minLevel: 1, seasons: ["summer", "spring", "autumn"], revenuePerDay: 0, description: "Keep the pools open after dark with underwater lighting and ambient music.", requires: ["wave_pool", "lazy_river", "lap_sports_pool"], requireMode: "any", downside: { minLifeguards: 2, label: "Needs 2+ lifeguards on duty (safety risk)" } },
  { id: "midnight_wave_pool", name: "Midnight Wave Pool Party", category: "night", icon: "Moon", cost: 5500, duration: 3, guestMult: 1.32, incomeMult: 1.35, repDelta: 0.9, minLevel: 2, seasons: ["summer"], revenuePerDay: 0, description: "A late-night pool party with DJ, glow sticks and light shows.", requires: ["wave_pool"], downside: { minLifeguards: 3, incidentRiskMult: 1.2, label: "Needs 3+ lifeguards, +20% incident risk" } },

  // Fireworks
  { id: "fireworks_spectacular", name: "Fireworks Spectacular", category: "fireworks", icon: "Flame", cost: 6500, duration: 1, guestMult: 1.50, incomeMult: 1.30, repDelta: 1.5, minLevel: 2, seasons: ["summer", "autumn", "winter"], revenuePerDay: 0, description: "A grand fireworks display over the wave pool. Huge one-night draw.", requires: ["wave_pool"], downside: { familyGuestMult: 0.85, label: "Loud bangs scare some families away (-15%)" } },
  { id: "grand_finale_night", name: "Grand Finale Night", category: "fireworks", icon: "Sparkles", cost: 4000, duration: 1, guestMult: 1.35, incomeMult: 1.22, repDelta: 1.0, minLevel: 1, seasons: ["summer", "autumn"], revenuePerDay: 0, description: "End the season with a bang — fireworks and a full evening show.", requires: [], minAttractions: 2 },

  // Concerts
  { id: "poolside_concert", name: "Poolside Concert", category: "concert", icon: "Music", cost: 8000, duration: 2, guestMult: 1.40, incomeMult: 1.18, repDelta: 1.0, minLevel: 3, seasons: ["summer", "spring"], revenuePerDay: 2500, description: "Live music by the wave pool. Ticket sales boost revenue.", requires: ["wave_pool"], conflictGroup: "wave_pool", downside: { closesFacility: "wave_pool", label: "Wave pool closed to public during concert" } },
  { id: "live_dj_night", name: "Live DJ Night", category: "concert", icon: "Music", cost: 4500, duration: 1, guestMult: 1.28, incomeMult: 1.25, repDelta: 0.7, minLevel: 2, seasons: ["summer", "autumn"], revenuePerDay: 1800, description: "A top DJ spins tracks late into the night.", requires: [], minAttractions: 1, downside: { repPenalty: 0.3, label: "Noise complaints from neighbours (-0.3 rep)" } },
  { id: "summer_music_festival", name: "Summer Music Festival", category: "concert", icon: "Music", cost: 15000, duration: 4, guestMult: 1.60, incomeMult: 1.30, repDelta: 1.8, minLevel: 4, seasons: ["summer"], revenuePerDay: 5000, description: "A multi-day music festival with multiple acts. Big investment, big returns.", requires: ["wave_pool"], minAttractions: 3, requiresFood: true, downside: { rideWearMult: 1.4, minStaff: 4, label: "+40% ride wear, needs 4+ total staff" } },

  // Competition days
  { id: "swimming_championship", name: "Swimming Championship", category: "competition", icon: "Trophy", cost: 5000, duration: 2, guestMult: 1.25, incomeMult: 1.15, repDelta: 1.2, minLevel: 2, seasons: ["summer", "spring"], revenuePerDay: 2000, description: "Host a regional swimming competition. Draws athletes and spectators.", requires: ["lap_sports_pool"], conflictGroup: "wave_pool", downside: { closesFacility: "lap_sports_pool", label: "Lap pool closed for competition" } },
  { id: "diving_contest", name: "Diving Contest", category: "competition", icon: "Trophy", cost: 3500, duration: 1, guestMult: 1.18, incomeMult: 1.12, repDelta: 0.8, minLevel: 1, seasons: ["summer", "autumn"], revenuePerDay: 1200, description: "Thrill-seekers compete for the best dive off the platforms.", requires: ["dive_pool"], downside: { closesFacility: "dive_pool", label: "Dive pool closed during contest" } },
  { id: "slide_racing_cup", name: "Slide Racing Cup", category: "competition", icon: "Trophy", cost: 6000, duration: 3, guestMult: 1.30, incomeMult: 1.20, repDelta: 1.0, minLevel: 2, seasons: ["summer"], revenuePerDay: 2200, description: "A multi-day slide racing tournament with timed runs.", requires: ["speed_slide", "body_slide", "multi_racer"], requireMode: "any", downside: { closesFacility: "speed_slide", label: "Racing slides closed to casual riders" } },

  // Special promotions
  { id: "family_fun_day", name: "Family Fun Day", category: "promotion", icon: "Megaphone", cost: 2000, duration: 1, guestMult: 1.35, incomeMult: 0.95, repDelta: 0.5, minLevel: 1, seasons: ["spring", "summer", "autumn", "winter"], revenuePerDay: 0, description: "Discounted family tickets bring big crowds. Lower income per guest but big attendance.", requires: [], downside: { label: "Lower income per guest (-5%)" } },
  { id: "two_for_one_tuesday", name: "Two-for-One Tuesday", category: "promotion", icon: "Megaphone", cost: 1500, duration: 1, guestMult: 1.28, incomeMult: 0.88, repDelta: 0.3, minLevel: 1, seasons: ["spring", "summer", "autumn", "winter"], revenuePerDay: 0, description: "Buy one get one free tickets. Great for midweek attendance.", requires: [], downside: { label: "Lower income per guest (-12%)" } },
  { id: "vip_appreciation_day", name: "VIP Appreciation Day", category: "promotion", icon: "Crown", cost: 3000, duration: 1, guestMult: 1.10, incomeMult: 1.35, repDelta: 0.8, minLevel: 3, seasons: ["spring", "summer", "autumn", "winter"], revenuePerDay: 0, description: "Exclusive perks for VIP guests. Higher spending per visitor.", requires: ["vip_lounge", "cabanas"], requireMode: "any", downside: { nonVipMoodPenalty: 3, label: "Regular guests feel excluded (-3 mood)" } },
];

export function getEvent(id) {
  return MAJOR_EVENTS.find((e) => e.id === id) || null;
}

export function getCategory(id) {
  return EVENT_CATEGORIES.find((c) => c.id === id) || null;
}

export function isEventAvailable(event, day, level) {
  if (!event) return false;
  if (level < (event.minLevel || 0)) return false;
  if (event.seasons && !event.seasons.includes(getSeason(day))) return false;
  return true;
}

// Check whether an event's facility requirements are met by the current park grid.
// Returns { met: boolean, missing: string[], reason: string }
export function checkEventRequirements(event, grid, staff = {}) {
  if (!event) return { met: true, missing: [], reason: "" };
  const gridSet = new Set((grid || []).filter(Boolean));
  const missing = [];

  // Required facilities (any or all mode)
  if (event.requires?.length) {
    const mode = event.requireMode || "all";
    const found = event.requires.filter((id) => gridSet.has(id));
    if (mode === "any" && found.length === 0) {
      missing.push(`Needs: ${event.requires.map(id => getEvent(id)?.name || id).join(" or ")}`);
    } else if (mode === "all" && found.length < event.requires.length) {
      missing.push(`Needs all: ${event.requires.join(", ")}`);
    }
  }

  // Minimum attraction count
  if (event.minAttractions) {
    const count = (grid || []).filter((id) => {
      if (!id) return false;
      // lightweight check — any non-empty, non-path tile counts
      return id !== "main_path" && id !== "queue_path" && id !== "fence";
    }).length;
    if (count < event.minAttractions) {
      missing.push(`Needs ${event.minAttractions}+ attractions in park`);
    }
  }

  // Requires food facility
  if (event.requiresFood) {
    const foodIds = ["dining", "burger_shack", "pizza_stand", "concessions", "ice_cream", "beach_bar", "sushi_bar", "coffee_bar", "juice_bar", "smoothie_bar"];
    if (!foodIds.some((id) => gridSet.has(id))) {
      missing.push("Needs at least one food facility");
    }
  }

  if (event.downside?.minLifeguards && (staff.lifeguard || 0) < event.downside.minLifeguards) {
    missing.push("Needs " + event.downside.minLifeguards + " lifeguards on duty");
  }
  // Minimum staff
  if (event.downside?.minStaff) {
    const totalStaff = Object.values(staff).reduce((s, n) => s + (n || 0), 0);
    if (totalStaff < event.downside.minStaff) {
      missing.push(`Needs ${event.downside.minStaff}+ total staff on payroll`);
    }
  }

  return { met: missing.length === 0, missing, reason: missing.join("; ") };
}

// Check whether launching this event conflicts with an already-active event.
export function checkEventConflict(event, activeEvents) {
  if (!event?.conflictGroup) return { conflict: false, conflictingEvent: null };
  const existing = (activeEvents || []).find((e) => {
    const def = MAJOR_EVENTS.find((m) => m.id === e.id);
    return def?.conflictGroup === event.conflictGroup;
  });
  return { conflict: !!existing, conflictingEvent: existing };
}

export function aggregateEventEffects(activeEvents) {
  if (!activeEvents || activeEvents.length === 0) {
    return { guestMult: 1, incomeMult: 1, repDelta: 0, revenuePerDay: 0 };
  }
  let guestMult = 1;
  let incomeMult = 1;
  let repDelta = 0;
  let revenuePerDay = 0;
  for (const ev of activeEvents) {
    guestMult *= ev.guestMult ?? 1;
    incomeMult *= ev.incomeMult ?? 1;
    repDelta += ev.repDelta ?? 0;
    revenuePerDay += ev.revenuePerDay ?? 0;
  }
  return { guestMult, incomeMult, repDelta, revenuePerDay };
}