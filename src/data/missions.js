export const MISSIONS = [
  {
    id: "first_splash",
    title: "First Splash",
    desc: "Build your first water attraction.",
    type: "build",
    target: 1,
    level: 1,
    reward: { money: 5000, xp: 50 },
  },
  {
    id: "growing_crowds",
    title: "Growing Crowds",
    desc: "Welcome 100 guests in a single day.",
    type: "guests",
    target: 100,
    level: 1,
    reward: { money: 4000, xp: 60 },
  },
  {
    id: "tidy_park",
    title: "Tidy Park",
    desc: "Hire 2 staff members.",
    type: "staff",
    target: 2,
    level: 1,
    reward: { money: 3000, xp: 50 },
  },
  {
    id: "popular_spot",
    title: "Popular Spot",
    desc: "Reach 70% park reputation.",
    type: "reputation",
    target: 70,
    level: 2,
    reward: { money: 5000, xp: 70 },
  },
  {
    id: "bigger_better",
    title: "Bigger & Better",
    desc: "Upgrade attractions 3 times.",
    type: "upgrades",
    target: 3,
    level: 2,
    reward: { money: 4000, xp: 80 },
  },
  {
    id: "expanding_horizons",
    title: "Expanding Horizons",
    desc: "Expand your park area once.",
    type: "expand",
    target: 1,
    level: 3,
    reward: { money: 3000, xp: 100 },
  },
  {
    id: "tycoon_rising",
    title: "Tycoon Rising",
    desc: "Reach Day 15.",
    type: "day",
    target: 15,
    level: 3,
    reward: { money: 8000, xp: 120 },
  },
  {
    id: "water_empire",
    title: "Water Empire",
    desc: "Welcome 300 guests in a single day.",
    type: "guests",
    target: 300,
    level: 4,
    reward: { money: 12000, xp: 150 },
  },
  {
    id: "maxed_out",
    title: "Maxed Out",
    desc: "Fully upgrade any 2 attractions.",
    type: "maxed_upgrades",
    target: 2,
    level: 5,
    reward: { money: 15000, xp: 200 },
  },
];

export function missionProgress(mission, state) {
  switch (mission.type) {
    case "build":
      return state.attractionCount;
    case "guests":
      return state.peakGuests;
    case "reputation":
      return state.reputation;
    case "day":
      return state.day;
    case "staff":
      return state.staffTotal;
    case "upgrades":
      return state.totalUpgrades;
    case "expand":
      return state.expansionsDone;
    case "maxed_upgrades":
      return state.maxedUpgrades;
    default:
      return 0;
  }
}