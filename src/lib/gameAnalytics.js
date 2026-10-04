import { base44 } from "@/api/base44Client";

const LOG_KEY = "waterpark-tycoon-activity";
const MAX_ENTRIES = 60;

/**
 * Track an in-game player action.
 * - Fires to the platform analytics dashboard (base44.analytics).
 * - Optionally appends to a local in-app activity log so it can be surfaced
 *   on the in-app Dashboard (platform analytics events are not readable in-app).
 */
export function trackEvent(eventName, properties = {}, { local = true } = {}) {
  try {
    Promise.resolve(base44.analytics.track({ eventName, properties })).catch(() => {});
  } catch {
    /* ignore */
  }
  if (!local) return;
  try {
    const list = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    list.unshift({ eventName, properties, at: new Date().toISOString() });
    localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore */
  }
}

export function readActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearActivityLog() {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch {
    /* ignore */
  }
}