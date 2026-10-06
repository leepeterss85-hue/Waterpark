import { ATTRACTIONS } from "./gameData";

const ATTRACTION_TYPES = ATTRACTIONS.filter((a) => a.category === "attraction").length;

export const ACHIEVEMENTS = [
  { id: "first_guests", title: "First Guests", desc: "Welcome 100 guests in a single day.", icon: "Users", color: "from-cyan-400 to-teal-500", check: (s) => s.peakGuests >= 100 },
  { id: "crowd_pleaser", title: "Crowd Pleaser", desc: "Welcome 500 guests in a single day.", icon: "Droplets", color: "from-blue-400 to-indigo-500", check: (s) => s.peakGuests >= 500 },
  { id: "mega_park", title: "Mega Park", desc: "Welcome 1,000 guests in a single day.", icon: "Waves", color: "from-sky-400 to-blue-500", check: (s) => s.peakGuests >= 1000 },
  { id: "first_profit", title: "First Profit", desc: "Earn $10,000 in total revenue.", icon: "ShoppingBag", color: "from-emerald-400 to-green-500", check: (s) => s.lifetimeEarnings >= 10000 },
  { id: "tycoon", title: "Tycoon", desc: "Earn $1,000,000 in total revenue.", icon: "TrendingUp", color: "from-emerald-500 to-teal-600", check: (s) => s.lifetimeEarnings >= 1000000 },
  { id: "builder", title: "Builder", desc: "Build 5 different attractions.", icon: "Castle", color: "from-amber-400 to-orange-500", check: (s) => s.builtCount >= 5 },
  { id: "diversified", title: "Diversified", desc: "Build 10 different attractions.", icon: "Castle", color: "from-lime-400 to-green-500", check: (s) => s.builtCount >= 10 },
  { id: "collector", title: "Collector", desc: "Build every type of water attraction.", icon: "Trophy", color: "from-violet-400 to-fuchsia-500", check: (s) => s.builtCount >= ATTRACTION_TYPES },
  { id: "resort", title: "Resort", desc: "Build 5 facilities.", icon: "Tent", color: "from-violet-400 to-purple-500", check: (s) => (s.facilityCount || 0) >= 5 },
  { id: "soft_play_master", title: "Soft Play Master", desc: "Build a Soft Play Zone.", icon: "ToyBrick", color: "from-rose-400 to-pink-500", check: (s) => s.builtAttractionIds?.includes("soft_play") },
  { id: "gem_hunter", title: "Gem Hunter", desc: "Build the Gem Mining attraction.", icon: "Gem", color: "from-violet-400 to-fuchsia-500", check: (s) => s.builtAttractionIds?.includes("gem_mining") },
  { id: "maxed_out", title: "Maxed Out", desc: "Fully upgrade any attraction.", icon: "Zap", color: "from-fuchsia-400 to-purple-600", check: (s) => s.maxedUpgrades >= 1 },
  { id: "expanding", title: "Expanding", desc: "Expand your park area at least once.", icon: "Maximize2", color: "from-sky-400 to-cyan-500", check: (s) => s.expansionsDone >= 1 },
  { id: "survivor", title: "Survivor", desc: "Reach Day 30.", icon: "CalendarDays", color: "from-rose-400 to-red-500", check: (s) => s.day >= 30 },
  { id: "marathon", title: "Marathon", desc: "Reach Day 60.", icon: "CalendarDays", color: "from-fuchsia-400 to-pink-600", check: (s) => s.day >= 60 },
  { id: "high_roller", title: "High Roller", desc: "Hold $100,000 cash at once.", icon: "Sparkles", color: "from-yellow-400 to-amber-500", check: (s) => s.money >= 100000 },
  { id: "millionaire", title: "Millionaire", desc: "Hold $500,000 cash at once.", icon: "Sparkles", color: "from-amber-400 to-orange-600", check: (s) => s.money >= 500000 },
  { id: "renowned", title: "Renowned", desc: "Reach 95% reputation.", icon: "Star", color: "from-amber-400 to-orange-500", check: (s) => s.reputation >= 95 },
  { id: "beloved", title: "Beloved", desc: "Reach 90% reputation.", icon: "Star", color: "from-pink-400 to-rose-500", check: (s) => s.reputation >= 90 },
  { id: "joyful", title: "Joyful Guests", desc: "Reach 85% average guest mood.", icon: "HeartPulse", color: "from-pink-400 to-rose-500", check: (s) => (s.avgMood || 0) >= 85 },
  { id: "big_spender", title: "Big Spenders", desc: "Reach $40 average spend per visit.", icon: "ShoppingBag", color: "from-emerald-400 to-green-500", check: (s) => (s.avgSpendPerVisit || 0) >= 40 },
  { id: "fully_staffed", title: "Fully Staffed", desc: "Hire 10 staff members in total.", icon: "Users", color: "from-cyan-400 to-blue-500", check: (s) => (s.staffTotal || 0) >= 10 },
  { id: "rapids_rider", title: "Rapids Rider", desc: "Build the Adventure Rapids attraction.", icon: "Wind", color: "from-teal-400 to-cyan-600", check: (s) => s.builtAttractionIds?.includes("adventure_river") },
  { id: "volleyball_pro", title: "Volleyball Pro", desc: "Build the Water Volleyball court.", icon: "CircleDot", color: "from-lime-400 to-emerald-500", check: (s) => s.builtAttractionIds?.includes("water_volleyball") },
  { id: "playground_builder", title: "Playground Builder", desc: "Build the Giant Water Playground.", icon: "Castle", color: "from-amber-400 to-orange-600", check: (s) => s.builtAttractionIds?.includes("water_playground") },
  { id: "surf_master", title: "Surf Master", desc: "Build the Surf Wave Pool.", icon: "Waves", color: "from-cyan-500 to-blue-700", check: (s) => s.builtAttractionIds?.includes("surf_wave_pool") },
  { id: "deep_diver", title: "Deep Diver", desc: "Build the Deep Dive Pool.", icon: "Anchor", color: "from-blue-600 to-indigo-700", check: (s) => s.builtAttractionIds?.includes("dive_pool") },
  { id: "disaster_survivor", title: "Disaster Survivor", desc: "Survive 3 disasters.", icon: "Shield", color: "from-rose-400 to-red-600", check: (s) => (s.disastersSurvived || 0) >= 3 },
  { id: "sandbox_explorer", title: "Sandbox Explorer", desc: "Try Sandbox Mode.", icon: "Sparkles", color: "from-amber-400 to-yellow-500", check: (s) => s.sandboxUsed },
  // --- Empire-level achievements ---
  { id: "empire_founder", title: "Empire Founder", desc: "Reach Tycoon empire tier.", icon: "Crown", color: "from-cyan-400 to-blue-500", check: (s) => (s.empirePoints || 0) >= 0 },
  { id: "resort_magnate_ach", title: "Resort Magnate", desc: "Reach 4.5-star resort rating.", icon: "Star", color: "from-violet-400 to-purple-600", check: (s) => (s.resortRating || 0) >= 4.5 },
  { id: "mega_resort_ach", title: "Mega Resort", desc: "Welcome 2,000 guests in a single day.", icon: "Users", color: "from-blue-400 to-indigo-600", check: (s) => s.peakGuests >= 2000 },
  { id: "billionaire", title: "Billionaire", desc: "Earn $10,000,000 in total revenue.", icon: "TrendingUp", color: "from-emerald-500 to-teal-700", check: (s) => s.lifetimeEarnings >= 10000000 },
  { id: "empire_legend_ach", title: "Empire Legend", desc: "Reach Legend empire tier (12,000 EP).", icon: "Sparkles", color: "from-yellow-300 via-amber-400 to-rose-500", check: (s) => (s.empirePoints || 0) >= 12000 },
  { id: "full_empire", title: "Full Empire", desc: "Fill all 144 tiles in your park.", icon: "Maximize2", color: "from-rose-400 to-fuchsia-600", check: (s) => (s.tilesFilled || 0) >= 144 },
  { id: "century_park", title: "Century Park", desc: "Reach Day 100.", icon: "CalendarDays", color: "from-amber-400 to-orange-600", check: (s) => s.day >= 100 },
  { id: "legendary_reputation", title: "Legendary Reputation", desc: "Reach 99% reputation.", icon: "Star", color: "from-yellow-400 to-amber-500", check: (s) => s.reputation >= 99 },
  { id: "milestone_25", title: "Survivor", desc: "Reach Day 25 and claim the milestone bonus.", icon: "Medal", color: "from-teal-400 to-cyan-600", check: (s) => s.day >= 25 },
  { id: "milestone_50", title: "Veteran", desc: "Reach Day 50.", icon: "Medal", color: "from-indigo-400 to-blue-600", check: (s) => s.day >= 50 },
  { id: "milestone_100", title: "Centurion", desc: "Reach Day 100.", icon: "Medal", color: "from-amber-400 to-orange-600", check: (s) => s.day >= 100 },
  { id: "milestone_200", title: "Immortal Tycoon", desc: "Reach Day 200.", icon: "Medal", color: "from-rose-400 via-fuchsia-500 to-purple-600", check: (s) => s.day >= 200 },
  { id: "water_quality_master", title: "Water Quality Master", desc: "Keep water quality above 90% for all attractions.", icon: "Droplets", color: "from-cyan-400 to-blue-500", check: (s) => (s.waterQualityAvg || 0) >= 90 && (s.peakGuests || 0) >= 100 },
  { id: "crowd_control", title: "Crowd Control", desc: "Welcome 5,000 guests in a single day.", icon: "Users", color: "from-violet-400 to-indigo-600", check: (s) => s.peakGuests >= 5000 },
  // --- Extended progression achievements ---
  { id: "decamillionaire", title: "Decamillionaire", desc: "Earn $50,000,000 in total revenue.", icon: "TrendingUp", color: "from-emerald-500 to-teal-700", check: (s) => s.lifetimeEarnings >= 50000000 },
  { id: "day_250", title: "Dedicated Tycoon", desc: "Reach Day 250.", icon: "CalendarDays", color: "from-indigo-400 to-purple-600", check: (s) => s.day >= 250 },
  { id: "year_round", title: "Year-Round Operation", desc: "Reach Day 365.", icon: "CalendarDays", color: "from-emerald-400 to-cyan-600", check: (s) => s.day >= 365 },
  { id: "ten_k_guests", title: "Ocean of Guests", desc: "Welcome 10,000 guests in a single day.", icon: "Users", color: "from-blue-500 to-indigo-700", check: (s) => s.peakGuests >= 10000 },
  { id: "mega_staff", title: "Mega Staff", desc: "Hire 50 staff members in total.", icon: "Users", color: "from-cyan-400 to-blue-600", check: (s) => (s.staffTotal || 0) >= 50 },
  { id: "full_team", title: "Full Team", desc: "Hire at least one of every staff type.", icon: "Users", color: "from-violet-400 to-fuchsia-600", check: (s) => (s.staffTypesHired || 0) >= 14 },
  { id: "master_builder", title: "Master Builder", desc: "Build 20 different attractions.", icon: "Castle", color: "from-amber-400 to-orange-600", check: (s) => (s.builtCount || 0) >= 20 },
];

export function unlockedAchievements(state) {
  return ACHIEVEMENTS.filter((a) => a.check(state));
}