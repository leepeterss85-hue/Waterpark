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
  // Summer events
  { id: "summer_splash_festival", name: "Summer Splash Festival", category: "summer", icon: "Sun", cost: 8000, duration: 5, guestMult: 1.45, incomeMult: 1.15, repDelta: 1.2, minLevel: 2, seasons: ["summer"], revenuePerDay: 0, description: "A week-long celebration with music, games and special pool activities." },
  { id: "tropical_weekend", name: "Tropical Paradise Weekend", category: "summer", icon: "Umbrella", cost: 5000, duration: 3, guestMult: 1.30, incomeMult: 1.10, repDelta: 0.8, minLevel: 1, seasons: ["summer", "spring"], revenuePerDay: 0, description: "Bring the island vibe with tropical decorations and themed drinks." },
  { id: "beach_bash", name: "Beach Bash Bonanza", category: "summer", icon: "Waves", cost: 3500, duration: 2, guestMult: 1.22, incomeMult: 1.08, repDelta: 0.5, minLevel: 1, seasons: ["summer", "spring"], revenuePerDay: 0, description: "Sand, sun and splash games for the whole family." },

  // Halloween events
  { id: "haunted_lagoon", name: "Haunted Lagoon Night", category: "halloween", icon: "Sparkles", cost: 6000, duration: 3, guestMult: 1.35, incomeMult: 1.25, repDelta: 1.0, minLevel: 2, seasons: ["autumn"], revenuePerDay: 0, description: "Spooky decorations, fog machines and monster-themed slides after dark." },
  { id: "pumpkin_plunge", name: "Pumpkin Plunge Festival", category: "halloween", icon: "Flame", cost: 4000, duration: 4, guestMult: 1.20, incomeMult: 1.18, repDelta: 0.7, minLevel: 1, seasons: ["autumn"], revenuePerDay: 0, description: "Halloween-themed water games and costume contests." },

  // Christmas / Winter events
  { id: "winter_wonderland", name: "Winter Wonderland", category: "winter", icon: "Sparkles", cost: 7000, duration: 5, guestMult: 1.30, incomeMult: 1.20, repDelta: 1.1, minLevel: 2, seasons: ["winter"], revenuePerDay: 0, description: "Transform the park with festive lights, heated pools and holiday cheer." },
  { id: "holiday_lights_night", name: "Holiday Lights Night", category: "winter", icon: "Moon", cost: 4500, duration: 3, guestMult: 1.25, incomeMult: 1.22, repDelta: 0.8, minLevel: 1, seasons: ["winter"], revenuePerDay: 0, description: "Thousands of lights illuminate the park for a magical evening." },

  // Night swimming
  { id: "moonlight_swim", name: "Moonlight Swim", category: "night", icon: "Moon", cost: 3000, duration: 2, guestMult: 1.18, incomeMult: 1.28, repDelta: 0.6, minLevel: 1, seasons: ["summer", "spring", "autumn"], revenuePerDay: 0, description: "Keep the pools open after dark with underwater lighting and ambient music." },
  { id: "midnight_wave_pool", name: "Midnight Wave Pool Party", category: "night", icon: "Moon", cost: 5500, duration: 3, guestMult: 1.32, incomeMult: 1.35, repDelta: 0.9, minLevel: 2, seasons: ["summer"], revenuePerDay: 0, description: "A late-night pool party with DJ, glow sticks and light shows." },

  // Fireworks
  { id: "fireworks_spectacular", name: "Fireworks Spectacular", category: "fireworks", icon: "Flame", cost: 6500, duration: 1, guestMult: 1.50, incomeMult: 1.30, repDelta: 1.5, minLevel: 2, seasons: ["summer", "autumn", "winter"], revenuePerDay: 0, description: "A grand fireworks display over the wave pool. Huge one-night draw." },
  { id: "grand_finale_night", name: "Grand Finale Night", category: "fireworks", icon: "Sparkles", cost: 4000, duration: 1, guestMult: 1.35, incomeMult: 1.22, repDelta: 1.0, minLevel: 1, seasons: ["summer", "autumn"], revenuePerDay: 0, description: "End the season with a bang — fireworks and a full evening show." },

  // Concerts
  { id: "poolside_concert", name: "Poolside Concert", category: "concert", icon: "Music", cost: 8000, duration: 2, guestMult: 1.40, incomeMult: 1.18, repDelta: 1.0, minLevel: 3, seasons: ["summer", "spring"], revenuePerDay: 2500, description: "Live music by the wave pool. Ticket sales boost revenue." },
  { id: "live_dj_night", name: "Live DJ Night", category: "concert", icon: "Music", cost: 4500, duration: 1, guestMult: 1.28, incomeMult: 1.25, repDelta: 0.7, minLevel: 2, seasons: ["summer", "autumn"], revenuePerDay: 1800, description: "A top DJ spins tracks late into the night." },
  { id: "summer_music_festival", name: "Summer Music Festival", category: "concert", icon: "Music", cost: 15000, duration: 4, guestMult: 1.60, incomeMult: 1.30, repDelta: 1.8, minLevel: 4, seasons: ["summer"], revenuePerDay: 5000, description: "A multi-day music festival with multiple acts. Big investment, big returns." },

  // Competition days
  { id: "swimming_championship", name: "Swimming Championship", category: "competition", icon: "Trophy", cost: 5000, duration: 2, guestMult: 1.25, incomeMult: 1.15, repDelta: 1.2, minLevel: 2, seasons: ["summer", "spring"], revenuePerDay: 2000, description: "Host a regional swimming competition. Draws athletes and spectators." },
  { id: "diving_contest", name: "Diving Contest", category: "competition", icon: "Trophy", cost: 3500, duration: 1, guestMult: 1.18, incomeMult: 1.12, repDelta: 0.8, minLevel: 1, seasons: ["summer", "autumn"], revenuePerDay: 1200, description: "Thrill-seekers compete for the best dive off the platforms." },
  { id: "slide_racing_cup", name: "Slide Racing Cup", category: "competition", icon: "Trophy", cost: 6000, duration: 3, guestMult: 1.30, incomeMult: 1.20, repDelta: 1.0, minLevel: 2, seasons: ["summer"], revenuePerDay: 2200, description: "A multi-day slide racing tournament with timed runs." },

  // Special promotions
  { id: "family_fun_day", name: "Family Fun Day", category: "promotion", icon: "Megaphone", cost: 2000, duration: 1, guestMult: 1.35, incomeMult: 0.95, repDelta: 0.5, minLevel: 1, seasons: ["spring", "summer", "autumn", "winter"], revenuePerDay: 0, description: "Discounted family tickets bring big crowds. Lower income per guest but big attendance." },
  { id: "two_for_one_tuesday", name: "Two-for-One Tuesday", category: "promotion", icon: "Megaphone", cost: 1500, duration: 1, guestMult: 1.28, incomeMult: 0.88, repDelta: 0.3, minLevel: 1, seasons: ["spring", "summer", "autumn", "winter"], revenuePerDay: 0, description: "Buy one get one free tickets. Great for midweek attendance." },
  { id: "vip_appreciation_day", name: "VIP Appreciation Day", category: "promotion", icon: "Crown", cost: 3000, duration: 1, guestMult: 1.10, incomeMult: 1.35, repDelta: 0.8, minLevel: 3, seasons: ["spring", "summer", "autumn", "winter"], revenuePerDay: 0, description: "Exclusive perks for VIP guests. Higher spending per visitor." },
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