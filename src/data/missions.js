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
  {
    id: "beautiful_grounds",
    title: "Beautiful Grounds",
    desc: "Reach 70 Park Appeal by zoning and decorating your park.",
    type: "park_appeal",
    target: 70,
    level: 3,
    reward: { money: 9000, xp: 130 },
  },
  {
    id: "perfect_districts",
    title: "Perfect Districts",
    desc: "Create 3 themed districts with a strong attraction match.",
    type: "themed_zones",
    target: 3,
    level: 5,
    reward: { money: 18000, xp: 220 },
  },
  {
    id: "five_star_resort",
    title: "Five-Star Resort",
    desc: "Reach 90 Park Appeal.",
    type: "park_appeal",
    target: 90,
    level: 8,
    reward: { money: 30000, xp: 350 },
  },
  {
    id: "happy_crowds",
    title: "Happy Crowds",
    desc: "Reach an average guest mood of 75%.",
    type: "guest_mood",
    target: 75,
    level: 6,
    reward: { money: 16000, xp: 220 },
  },
  {
    id: "water_empire_legend",
    title: "Water Empire Legend",
    desc: "Earn £250,000 across the life of your park.",
    type: "lifetime_earnings",
    target: 250000,
    level: 10,
    reward: { money: 50000, xp: 500 },
  },
  // --- Endgame missions (levels 15+) ---
  {
    id: "resort_magnate",
    title: "Resort Magnate",
    desc: "Reach a 4.5-star resort rating.",
    type: "resort_rating",
    target: 4.5,
    level: 15,
    reward: { money: 50000, xp: 500 },
  },
  {
    id: "mega_resort",
    title: "Mega Resort",
    desc: "Welcome 2,000 guests in a single day.",
    type: "guests",
    target: 2000,
    level: 18,
    reward: { money: 80000, xp: 800 },
  },
  {
    id: "empire_builder",
    title: "Empire Builder",
    desc: "Earn £1,000,000 across the life of your park.",
    type: "lifetime_earnings",
    target: 1000000,
    level: 20,
    reward: { money: 100000, xp: 1000 },
  },
  {
    id: "five_star_legend",
    title: "Five-Star Legend",
    desc: "Reach a perfect 5.0-star resort rating.",
    type: "resort_rating",
    target: 5.0,
    level: 22,
    reward: { money: 150000, xp: 1200 },
  },
  {
    id: "waterpark_empire",
    title: "Waterpark Empire",
    desc: "Fill all 144 tiles in your park.",
    type: "tiles_filled",
    target: 144,
    level: 25,
    reward: { money: 200000, xp: 1500 },
  },
  {
    id: "legendary_tycoon",
    title: "Legendary Tycoon",
    desc: "Reach Day 100.",
    type: "day",
    target: 100,
    level: 28,
    reward: { money: 250000, xp: 2000 },
  },
  // --- Mythic missions (levels 30+) ---
  {
    id: "peak_performance",
    title: "Peak Performance",
    desc: "Welcome 5,000 guests in a single day.",
    type: "guests",
    target: 5000,
    level: 30,
    reward: { money: 300000, xp: 2000 },
  },
  {
    id: "wealth_beyond_measure",
    title: "Wealth Beyond Measure",
    desc: "Earn £5,000,000 across the life of your park.",
    type: "lifetime_earnings",
    target: 5000000,
    level: 32,
    reward: { money: 400000, xp: 2500 },
  },
  {
    id: "master_of_waves",
    title: "Master of the Waves",
    desc: "Reach 99% park reputation.",
    type: "reputation",
    target: 99,
    level: 35,
    reward: { money: 500000, xp: 3000 },
  },
  {
    id: "full_spectrum",
    title: "Full Spectrum",
    desc: "Build 20 different attractions.",
    type: "builtCount",
    target: 20,
    level: 38,
    reward: { money: 600000, xp: 3500 },
  },
  {
    id: "eternal_tycoon",
    title: "Eternal Tycoon",
    desc: "Reach Day 200.",
    type: "day",
    target: 200,
    level: 40,
    reward: { money: 800000, xp: 4000 },
  },
  {
    id: "aquatic_deity",
    title: "Aquatic Deity",
    desc: "Welcome 10,000 guests in a single day.",
    type: "guests",
    target: 10000,
    level: 45,
    reward: { money: 1000000, xp: 5000 },
  },
  {
    id: "ultimate_tycoon",
    title: "Ultimate Waterpark Tycoon",
    desc: "Earn £50,000,000 across the life of your park.",
    type: "lifetime_earnings",
    target: 50000000,
    level: 50,
    reward: { money: 5000000, xp: 10000 },
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
    case "park_appeal":
      return state.parkAppeal;
    case "themed_zones":
      return state.themedZones;
    case "guest_mood":
      return state.avgMood;
    case "lifetime_earnings":
      return state.lifetimeEarnings;
    case "builtCount":
      return state.builtCount || 0;
    case "resort_rating":
      return state.resortRating || 0;
    case "tiles_filled":
      return state.tilesFilled || 0;
    default:
      return 0;
  }
}