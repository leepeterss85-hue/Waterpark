// 7-day demand outlook: turns weather, seasonal events and rival pressure
// into a forward-looking demand index the player can price against.
// Pure derived data — no game state mutation.

import { WEATHER, SEASON_WEIGHTS, getSeason } from "@/data/parkSystems";
import { SEASONAL_EVENTS, calendarDay } from "@/data/seasonalCalendar";

// Expected weather guest multiplier for a season (probability-weighted).
function expectedWeatherMult(season) {
  const weights = SEASON_WEIGHTS[season];
  if (!weights) return 1;
  return Object.entries(weights).reduce((sum, [id, w]) => {
    const weather = WEATHER.find((x) => x.id === id);
    return sum + (weather?.guestMult || 1) * w;
  }, 0);
}

// Calendar event active on a given absolute day (covers its duration window).
function activeCalendarEvent(targetDay) {
  const cDay = calendarDay(targetDay);
  return SEASONAL_EVENTS.find((e) => {
    const start = e.triggerDay;
    return cDay >= start && cDay < start + e.duration;
  }) || null;
}

// Competitor pressure factor: high market share lifts demand, low share drains it.
function competitorFactor(marketShare) {
  const share = Math.max(0, Math.min(100, marketShare || 0));
  return 0.6 + (share / 100) * 0.4; // 0.6 at 0% share, 1.0 at 100%
}

function priceRecommendation(index, currentPrice) {
  if (index >= 120) return { label: "Surge", tone: "rose", suggest: Math.max(35, Math.min(50, currentPrice + 8)) };
  if (index >= 105) return { label: "Raise", tone: "amber", suggest: Math.max(30, Math.min(42, currentPrice + 4)) };
  if (index >= 90) return { label: "Hold", tone: "emerald", suggest: currentPrice };
  if (index >= 70) return { label: "Discount", tone: "sky", suggest: Math.max(20, Math.min(30, currentPrice - 4)) };
  return { label: "Deep cut", tone: "blue", suggest: Math.max(15, Math.min(22, currentPrice - 8)) };
}

// Build a 7-day demand outlook from current game state.
export function buildDemandOutlook({ day, forecast, seasonEvent, marketShare, ticketPrice }) {
  const today = day || 1;
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const targetDay = today + i;
    const season = getSeason(targetDay);
    // Day 1 uses the known forecast; later days use the season expectation.
    const weatherMult = i === 1 && forecast ? forecast.guestMult : expectedWeatherMult(season);
    const event = activeCalendarEvent(targetDay);
    const eventMult = event ? event.guestMult : 1;
    // Also fold in the currently-active season event if it's still running.
    const ongoingEvent = seasonEvent && seasonEvent.daysLeft && i <= seasonEvent.daysLeft ? seasonEvent : null;
    const ongoingMult = ongoingEvent ? ongoingEvent.guestMult || 1 : 1;
    const cFactor = competitorFactor(marketShare);
    const index = Math.round(100 * weatherMult * eventMult * ongoingMult * cFactor);
    days.push({
      offset: i,
      day: targetDay,
      season,
      weatherLabel: i === 1 && forecast ? forecast.name : seasonLabel(season),
      event: event || ongoingEvent || null,
      index,
      rec: priceRecommendation(index, ticketPrice || 28),
    });
  }
  return days;
}

function seasonLabel(season) {
  return season.charAt(0).toUpperCase() + season.slice(1);
}

// Summarise the outlook: best and worst days plus a week-level strategy.
export function outlookSummary(days, currentPrice) {
  if (!days || days.length === 0) return null;
  const sorted = [...days].sort((a, b) => b.index - a.index);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const avg = Math.round(days.reduce((s, d) => s + d.index, 0) / days.length);
  const surgeDays = days.filter((d) => d.rec.label === "Surge" || d.rec.label === "Raise").length;
  const discountDays = days.filter((d) => d.rec.label === "Discount" || d.rec.label === "Deep cut").length;
  let strategy;
  if (surgeDays >= 3) strategy = "Strong week ahead — enable peak pricing and raise gate admission for the high-demand days.";
  else if (discountDays >= 3) strategy = "Soft week ahead — discount admission early to protect attendance, then recover spend on food and retail.";
  else if (best.index - worst.index >= 40) strategy = "Volatile week — plan to adjust prices day-by-day as demand swings.";
  else strategy = "Steady week — current pricing should hold; watch the peak day for a small surge.";
  return { best, worst, avg, surgeDays, discountDays, strategy };
}