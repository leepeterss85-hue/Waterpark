// Shared serialisation payload for the water-park save.
// Extracted from useGameState to de-duplicate the field list across
// local saves, cloud saves and the auto-persist spread.

export const SAVE_FIELDS = [
  "money", "day", "reputation", "guests", "grid", "parkZones", "history", "sandbox",
  "staff", "staffAssignments", "attractionCondition", "log", "lastNet",
  "incidents", "upgrades", "rideSpecialties", "claimedStoryContracts", "xp", "expansionsDone", "peakGuests", "totalUpgrades",
  "claimedMissions", "challenge", "lifetimeEarnings", "builtAttractionIds",
  "visitorStats", "feedback", "weather", "forecast", "seasonEvent",
  "ticketPrice", "adBudget", "priorityPass", "vipVisit", "researchPoints",
  "completedResearch", "parkAppeal", "disaster", "disastersSurvived",
  "activeCampaigns", "sandboxSettings", "hotelGuests", "hotelStats", "resortRating", "pricing",
  "popularity", "popularityTrend", "prevPopularity", "activeEvents",
  "membershipCounts", "membershipTimers", "membershipStats", "awards",
  "awardCeremonyTimer", "awardStats", "socialPosts", "socialReputation",
  "emergencies", "emergencyStats", "constructionProjects", "loans",
  "returnVisitorMult", "empirePoints", "competitors", "marketShare",
  "waterQuality", "rideAges", "vipHistory", "claimedLegendary",
  "activeCalendarEvent", "dailyChallenges", "challengeDayCounter",
  "autoPricing", "activeTheme", "prestigeCount", "synergyBonuses",
  "builtToday", "upgradedToday", "mascot", "lastRewardDay", "rewardStreak",
  "visitorReviews", "staffXp", "staffMorale", "wageBoost", "sponsorships",
  "groupBookings", "acceptedBookings", "activeStrikes", "completedMasterPlans", "masterPlanBonuses", "gameMode", "storyStep", "storyCompleted",
  "guestMemory", "retailStock", "parkStrategy", "mastery", "resortMilestones", "activeScenario", "scenarioStatus", "completedScenarios", "megaProjects", "guestStories", "currentDestination", "retailStats", "completedChains", "completedCampaignChapters", "acquiredRivals", "franchiseMaps",
];

// Build the persistable game-data object from a state snapshot.
export function buildSavePayload(state) {
  const payload = {};
  for (const key of SAVE_FIELDS) {
    if (state[key] !== undefined) payload[key] = state[key];
  }
  return payload;
}