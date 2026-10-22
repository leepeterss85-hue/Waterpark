// Deterministic snippets from measured conditions, not invented reviews.
// Only display when real park guests have completed a simulation day.
export function parkGuestReaction({ guests = 0, avgMood = 0, longestQueue = null, waterQuality = 100, incidents = 0 } = {}) {
  if (!(Number(guests) > 0)) return null;
  const wait = Number(longestQueue?.wait) || 0;
  if (Number(incidents) > 0) return { text: "Is that ride open?", tone: "concerned", reason: "Ride disruption" };
  if (waterQuality < 45) return { text: "The pools need cleaning!", tone: "concerned", reason: "Water quality" };
  if (wait >= 18) return { text: "That queue is too long!", tone: "concerned", reason: "Queue waiting time" };
  if (avgMood >= 82) return { text: "Best water park ever!", tone: "delighted", reason: "Guest happiness" };
  if (avgMood >= 67) return { text: "Let's go on that again!", tone: "happy", reason: "Guest happiness" };
  if (avgMood < 45) return { text: "We need a better day.", tone: "concerned", reason: "Guest happiness" };
  return { text: "Where shall we go next?", tone: "neutral", reason: "Guest activity" };
}
