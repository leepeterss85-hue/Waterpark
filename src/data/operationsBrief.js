import { getParkItem } from "./gameData.js";
import { isWaterAttraction } from "./waterQuality.js";

const clamp = (value, low = 0, high = 100) =>
  Math.max(low, Math.min(high, Number(value) || 0));
const staffPercent = (value, fallback) => {
  if (value == null || !Number.isFinite(Number(value))) return fallback;
  const n = Number(value);
  return Math.round(clamp(n <= 1 ? n * 100 : n));
};
const gbp = value => "£" + Math.round(Number(value) || 0).toLocaleString("en-GB");

/**
 * Read-only snapshot for the planning dashboard.
 * Does not touch the day simulation, purchases, saves or rewards.
 */
export function getOperationsBrief(game = {}) {
  const grid = Array.isArray(game.grid) ? game.grid : [];
  const attractions = grid.filter(id => getParkItem(id)?.category === "attraction").length;
  const hasWater = grid.some(id => isWaterAttraction(id));
  const incidentCount = Array.isArray(game.incidents) ? game.incidents.length : 0;
  const emergencyCount = (game.emergencies || []).filter(entry =>
    !entry.resolved && entry.status !== "resolved" && entry.status !== "complete").length;
  const waterAlerts = Math.max(0, Number(game.waterQualityCriticalCount) || 0);
  const waterQuality = clamp(game.waterQualityAvg ?? 100);
  const crowd = Math.max(0, Number(game.guests) || 0);
  const guestMood = clamp(game.visitorStats?.avgMood);

  const metrics = [
    { id: "safety", label: "Safety", value: staffPercent(game.safety, 70), weight: 25 },
    { id: "uptime", label: "Ride uptime", value: staffPercent(game.uptime, 65), weight: 20 },
    { id: "cleanliness", label: "Cleanliness", value: staffPercent(game.cleanliness, 60), weight: 15 },
    { id: "water", label: "Water quality", value: waterQuality, weight: 15, include: hasWater },
    { id: "mood", label: "Guest mood", value: guestMood, weight: 15, include: crowd > 0 && Number(game.day) > 1 },
    { id: "appeal", label: "Park appeal", value: clamp(game.parkAppeal?.score ?? 50), weight: 10 },
  ].filter(metric => metric.include !== false);
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weighted = metrics.reduce((sum, metric) => sum + metric.value * metric.weight, 0) / (totalWeight || 1);
  const score = Math.round(clamp(weighted - Math.min(25, (incidentCount + emergencyCount) * 5 + waterAlerts * 4)));

  const priorities = [];
  const add = (id, severity, title, explanation, action, sheet) =>
    priorities.push({ id, severity, title, explanation, action, sheet });
  if (incidentCount || emergencyCount) {
    add("incidents", 100, "Review urgent incidents", `${incidentCount} open incident(s) and ${emergencyCount} emergency alert(s).`,
      "Review emergencies", "emergencies");
  }
  if (hasWater && (waterAlerts || waterQuality < 65)) {
    add("water", waterAlerts ? 96 : 73, "Improve pool water quality",
      `${waterAlerts} critical water alert(s); park-wide water quality is ${Math.round(waterQuality)}%.`,
      "View water quality", "waterQuality");
  }
  if (!attractions) {
    add("build", 94, "Open your first water attraction", "Build a ride so your park can attract guests.",
      "Browse attractions", "build");
  }
  if (hasWater && Number(game.staff?.lifeguard) < 1) {
    add("lifeguard", 90, "Hire water safety staff", "Your water attractions have no lifeguards assigned yet.",
      "Manage staff", "staff");
  }
  if (staffPercent(game.safety, 70) < 80 && !priorities.some(p => p.id === "lifeguard")) {
    add("safety", 85, "Increase park safety", "Invest in lifeguards, security or supervision.",
      "Manage staff", "staff");
  }
  if (staffPercent(game.uptime, 65) < 80 && attractions) {
    add("uptime", 78, "Reduce ride downtime", "Maintenance staffing improves reliability and park availability.",
      "Manage staff", "staff");
  }
  if (staffPercent(game.cleanliness, 60) < 80) {
    add("clean", 67, "Improve cleanliness", "Extra cleaners and gardeners help protect visitor experience.",
      "Manage staff", "staff");
  }
  if (crowd > 0 && Number(game.day) > 1 && guestMood < 65) {
    add("mood", 75, "Raise guest happiness", "Check feedback, queues and guest amenities before expanding.",
      "Review guests", "guestExperience");
  }

  const lastWeek = (game.history || []).slice(-7);
  const net7 = lastWeek.reduce((sum, row) => sum + (Number(row?.net) || 0), 0);
  const coreCost = Math.max(0, Number(game.staffWages) || 0) +
    Math.max(0, Number(game.estimatedUtilities) || 0) + Math.max(0, Number(game.adBudget) || 0);
  const cash = Math.max(0, Number(game.money) || 0);
  if (coreCost > 0 && cash < coreCost * 2 && !game.sandbox) {
    add("cash", 88, "Protect your cash reserve", `You have ${gbp(cash)} against an estimated ${gbp(coreCost)} in daily staffing, utilities and advertising.`,
      "Open economy", "economy");
  }
  if (!priorities.length) {
    add("growth", 30, "Park is ready to grow", "Operations look stable. Consider a new attraction, research or a park event.",
      "Plan your next build", "build");
  }
  return {
    score,
    rating: score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs attention" : "At risk",
    metrics,
    priorities: priorities.sort((a, b) => b.severity - a.severity),
    net7,
    periods: lastWeek.length,
    coreCost,
    cash,
    attractions,
  };
}
