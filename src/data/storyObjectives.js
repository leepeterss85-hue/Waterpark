import { isWaterAttraction } from "./waterQuality.js";

const number = value => Math.max(0, Number(value) || 0);
const count = values => (Array.isArray(values) ? values : []).length;
const sum = values => Object.values(values || {}).reduce((total, value) => total + number(value), 0);
const achieved = (projects, threshold) =>
  count((projects || []).filter(item =>
    item?.status === "complete" || item?.status === "completed" || item?.completed
  )) >= threshold;
const target = (name, current, required) => ({
  name,
  current: Math.round(number(current)),
  target: required,
});
const badge = (name, met) => target(name, met ? 1 : 0, 1);

/**
 * Progress shown by Maya's coach. Observational only: the existing campaign
 * remains the sole authority for giving rewards and advancing chapters.
 * Never save, skip or award XP from this module.
 */
export function storyObjectiveProgress(step, game = {}) {
  if (!step?.id) return { milestones: [], percent: 0, satisfied: false, alternative: false };
  const grid = Array.isArray(game.grid) ? game.grid : [];
  // The hook already computes the canonical attraction count using gameData.
  // Reuse it to avoid a second, subtly different classification in the UI.
  const attractions = number(game.missionState?.attractionCount);
  const hotelBuilt = (game.hotels || []).length > 0 ||
    grid.some(id => /hotel|resort/i.test(String(id || "")));
  const finishedProjects = (game.megaProjects || []).filter(project =>
    project?.status === "complete" || project?.status === "completed" || project?.completed).length;
  const peak = Math.max(number(game.peakGuests), number(game.guests));
  const appeal = number(game.parkAppeal?.score);
  const waterTiles = grid.map((id, index) => ({ id, index })).filter(({ id }) => isWaterAttraction(id));
  const waterQuality = waterTiles.length
    ? waterTiles.reduce((total, { index }) => total + number(game.waterQuality?.[index]), 0) / waterTiles.length
    : 0;
  const rivals = count(game.acquiredRivals);
  const franchises = count(game.franchiseMaps);
  const level = number(game.level);
  const earnings = number(game.lifetimeEarnings);

  const goals = {
    welcome: [target("Attractions built", attractions, 1)],
    staff: [target("Team members hired", sum(game.staff), 1)],
    open: [target("Park day", game.day, 2), target("Days completed", count(game.history), 1)],
    manage: [target("Park day", game.day, 2), target("Days completed", count(game.history), 1)],
    upgrade: [target("Ride upgrades", game.totalUpgrades, 1)],
    guests: [target("Peak guests", peak, 100)],
    expand: [target("Attractions", attractions, 2), target("Land expansions", game.expansionsDone, 1)],
    research: [target("Research completed", count(game.completedResearch), 1)],
    emergency: [
      badge("Incidents encountered", count(game.incidents) > 0),
      badge("Emergencies encountered", count(game.emergencies) > 0),
      badge("Disasters survived", number(game.disastersSurvived) > 0),
    ],
    resort: [
      badge("Hotel built", hotelBuilt),
      badge("Hotel guests arrived", count(game.hotelGuests) > 0),
      badge("Resort established", number(game.resortRating) > 0),
    ],
    rival: [target("Peak guests", peak, 250), target("Market share (%)", game.marketShare, 60)],
    worldclass: [target("Park appeal", appeal, 80), target("Reputation (%)", game.reputation, 80)],
    mastery: [target("Mastery points", game.mastery?.points, 12)],
    mega: [target("Completed mega-projects", finishedProjects, 1)],
    empire: [target("Rivals acquired", rivals, 1), target("Franchises opened", franchises, 1)],
    variety: [target("Attractions built", attractions, 5)],
    upgrade_master: [target("Total upgrades", game.totalUpgrades, 5)],
    researcher: [target("Research completed", count(game.completedResearch), 3)],
    resort_living: [target("Hotel occupancy (%)", game.hotelStats?.occupancy, 50)],
    award_winner: [target("Industry awards", game.awardStats?.totalWon, 1)],
    land_developer: [target("Land expansions", game.expansionsDone, 3)],
    signature: [target("Completed mega-projects", finishedProjects, 2)],
    legendary_operations: [target("Park level", level, 30), target("Lifetime earnings (£)", earnings, 2000000)],
    prestige: [target("Park level", level, 35), target("Lifetime earnings (£)", earnings, 3000000)],
    train_the_team: [target("Staff training XP", sum(game.staffXp), 150)],
    guest_voices: [target("Visitor reviews", count(game.visitorReviews), 5)],
    loyalty: [target("Members", sum(game.membershipCounts), 10)],
    crystal_water: [target("Average water quality", waterQuality, 85), badge("Water attraction built", waterTiles.length > 0)],
    signature_chain: [target("Attraction chains", count(game.completedChains), 1)],
    brand_builder: [target("Social posts", count(game.socialPosts), 3)],
    finish: [
      target("Park level", level, 35),
      target("Lifetime earnings (£)", earnings, 3000000),
      target("Mastery points", game.mastery?.points, 12),
      badge("Rival or franchise", rivals + franchises > 0),
    ],
  };
  const milestones = goals[step.id] || [];
  const alternative = ["open", "expand", "emergency", "resort", "rival", "empire"].includes(step.id);
  const ratios = milestones.map(goal => Math.min(1, goal.current / Math.max(1, goal.target)));
  const fraction = ratios.length ? alternative ? Math.max(...ratios) :
    ratios.reduce((total, ratio) => total + ratio, 0) / ratios.length : 0;
  const satisfied = ratios.length > 0 && (alternative
    ? ratios.some(ratio => ratio >= 1)
    : ratios.every(ratio => ratio >= 1));
  return { milestones, alternative, satisfied, percent: Math.round(fraction * 100) };
}
