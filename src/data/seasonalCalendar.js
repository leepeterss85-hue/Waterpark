// Seasonal Calendar: a structured year-round calendar of themed events.
// Events auto-trigger based on the in-game day, adding replayability and variety.
// The in-game year is 120 days (4 seasons × 30 days).

export const CALENDAR_YEAR_LENGTH = 120;

export const SEASONAL_EVENTS = [
  // Spring (days 1-30)
  {
    id: "spring_break",
    name: "Spring Break Splash",
    season: "spring",
    triggerDay: 8,
    duration: 3,
    guestMult: 1.35,
    incomeMult: 1.10,
    repDelta: 0.8,
    icon: "Sun",
    color: "from-lime-400 to-green-500",
    tone: "text-lime-600",
    desc: "Students flood in for spring break! Huge guest surge.",
    decoration: "🌴",
  },
  {
    id: "blossom_festival",
    name: "Blossom Festival",
    season: "spring",
    triggerDay: 22,
    duration: 2,
    guestMult: 1.20,
    incomeMult: 1.08,
    repDelta: 0.5,
    icon: "Flower2",
    color: "from-pink-300 to-rose-400",
    tone: "text-pink-600",
    desc: "Cherry blossoms decorate the park. Aesthetic boost.",
    decoration: "🌸",
  },
  // Summer (days 31-60)
  {
    id: "summer_solstice",
    name: "Summer Solstice Bash",
    season: "summer",
    triggerDay: 35,
    duration: 4,
    guestMult: 1.45,
    incomeMult: 1.15,
    repDelta: 1.0,
    icon: "Sun",
    color: "from-orange-400 to-amber-500",
    tone: "text-orange-600",
    desc: "The longest days bring the biggest crowds!",
    decoration: "☀️",
  },
  {
    id: "heatwave_week",
    name: "Heatwave Week",
    season: "summer",
    triggerDay: 48,
    duration: 5,
    guestMult: 1.50,
    incomeMult: 1.20,
    repDelta: 0.6,
    icon: "Flame",
    color: "from-red-400 to-orange-600",
    tone: "text-red-600",
    desc: "Scorching heat drives everyone to the pools. Peak season!",
    decoration: "🔥",
  },
  // Autumn (days 61-90)
  {
    id: "harvest_splash",
    name: "Harvest Splash",
    season: "autumn",
    triggerDay: 65,
    duration: 3,
    guestMult: 1.25,
    incomeMult: 1.12,
    repDelta: 0.7,
    icon: "Wheat",
    color: "from-amber-500 to-yellow-600",
    tone: "text-amber-600",
    desc: "Autumn harvest theme with warm treats and cozy vibes.",
    decoration: "🍂",
  },
  {
    id: "halloween_spooktacular",
    name: "Halloween Spooktacular",
    season: "autumn",
    triggerDay: 82,
    duration: 5,
    guestMult: 1.40,
    incomeMult: 1.25,
    repDelta: 1.2,
    icon: "Ghost",
    color: "from-purple-500 to-indigo-700",
    tone: "text-purple-600",
    desc: "Spooky decorations, haunted lagoon and costume contests!",
    decoration: "🎃",
  },
  // Winter (days 91-120)
  {
    id: "winter_wonderland",
    name: "Winter Wonderland",
    season: "winter",
    triggerDay: 95,
    duration: 5,
    guestMult: 1.30,
    incomeMult: 1.20,
    repDelta: 1.0,
    icon: "Snowflake",
    color: "from-cyan-400 to-blue-500",
    tone: "text-cyan-600",
    desc: "Heated pools and festive lights. A magical winter experience.",
    decoration: "❄️",
  },
  {
    id: "holiday_extravaganza",
    name: "Holiday Extravaganza",
    season: "winter",
    triggerDay: 112,
    duration: 7,
    guestMult: 1.55,
    incomeMult: 1.30,
    repDelta: 1.5,
    icon: "Gift",
    color: "from-red-500 to-green-600",
    tone: "text-red-600",
    desc: "The grand finale! The biggest event of the year.",
    decoration: "🎁",
  },
];

export function getCalendarEvent(id) {
  return SEASONAL_EVENTS.find((e) => e.id === id) || null;
}

// Get the day within the calendar year (1-120)
export function calendarDay(day) {
  return ((day - 1) % CALENDAR_YEAR_LENGTH) + 1;
}

// Get the current calendar year number
export function calendarYear(day) {
  return Math.floor((day - 1) / CALENDAR_YEAR_LENGTH) + 1;
}

// Check if a calendar event should trigger on this day
export function getTriggeredCalendarEvent(day) {
  const cDay = calendarDay(day);
  return SEASONAL_EVENTS.find((e) => e.triggerDay === cDay) || null;
}

// Get upcoming events within the next N days
export function getUpcomingEvents(day, lookAhead = 14) {
  const cDay = calendarDay(day);
  return SEASONAL_EVENTS
    .filter((e) => {
      const diff = e.triggerDay - cDay;
      return diff > 0 && diff <= lookAhead;
    })
    .sort((a, b) => a.triggerDay - b.triggerDay);
}

// Get the current season from the calendar
export function getCalendarSeason(day) {
  const cDay = calendarDay(day);
  if (cDay <= 30) return "spring";
  if (cDay <= 60) return "summer";
  if (cDay <= 90) return "autumn";
  return "winter";
}