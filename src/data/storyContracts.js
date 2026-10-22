// Optional Story Mode objectives added without altering saved story-step indices.
export const STORY_CONTRACTS = Object.freeze([
  { id: "splash_starter", title: "The Big Splash", chapter: 1, goal: "Build three attractions", metric: "attractions", target: 3, reward: { money: 2500, xp: 130 } },
  { id: "happy_guests", title: "Five-Star Smiles", chapter: 2, goal: "Reach 75 guest happiness", metric: "guestMood", target: 75, reward: { money: 4500, xp: 220 } },
  { id: "ride_engineer", title: "Ride Designer", chapter: 3, goal: "Upgrade three attractions", metric: "upgrades", target: 3, reward: { money: 6000, xp: 280 } },
  { id: "guest_voice", title: "Word Gets Around", chapter: 8, goal: "Collect ten guest reviews", metric: "reviews", target: 10, reward: { money: 12000, xp: 420 } },
  { id: "resort_regulars", title: "Return for More", chapter: 12, goal: "Welcome twenty members", metric: "members", target: 20, reward: { money: 18000, xp: 600 } },
]);

export function contractProgress(contract, game = {}) {
  if (!contract) return { current: 0, target: 1, percent: 0, complete: false };
  const values = {
    attractions: Number(game.missionState?.attractionCount) || 0,
    guestMood: Number(game.visitorStats?.avgMood) || 0,
    upgrades: Number(game.totalUpgrades) || 0,
    reviews: Array.isArray(game.visitorReviews) ? game.visitorReviews.length : 0,
    members: Object.values(game.membershipCounts || {}).reduce((sum, value) => sum + (Number(value) || 0), 0),
  };
  const current = Math.max(0, Math.floor(values[contract.metric] || 0));
  const target = Math.max(1, Number(contract.target) || 1);
  return { current, target, percent: Math.min(100, Math.round(current / target * 100)), complete: current >= target };
}

export function availableStoryContracts(game = {}) {
  const chapter = Number(game.STORY_STEPS?.[game.storyStep]?.chapter) || 1;
  const claimed = new Set(game.claimedStoryContracts || []);
  return STORY_CONTRACTS.filter(c => chapter >= c.chapter).map(c => ({
    ...c, ...contractProgress(c, game), claimed: claimed.has(c.id),
  }));
}
