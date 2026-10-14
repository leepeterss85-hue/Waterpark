import { getParkItem } from "@/data/gameData";

export const MASTER_PLANS = [
  {
    id: "family_resort",
    name: "Family Resort Expansion",
    desc: "Build the park into a family-friendly destination with strong facilities and resort appeal.",
    reward: "+8% guest demand",
    bonuses: { guestDemandMult: 0.08 },
    goals: [
      { id: "family", label: "Reach 65 reputation", test: ({ reputation }) => reputation >= 65 },
      { id: "hotel", label: "Own a hotel", test: ({ grid }) => grid.some((id) => getParkItem(id)?.category === "hotel") },
      { id: "facility", label: "Own 2 guest facilities", test: ({ facilityCount }) => facilityCount >= 2 },
      { id: "guests", label: "Reach 150 guests in a day", test: ({ peakGuests }) => peakGuests >= 150 },
    ],
  },
  {
    id: "thrill_capital",
    name: "Thrill Capital",
    desc: "Become the park visitors talk about for high-energy attractions and strong ride performance.",
    reward: "+10% attraction income",
    bonuses: { attractionIncomeMult: 0.10 },
    goals: [
      { id: "rides", label: "Own 5 attractions", test: ({ attractionCount }) => attractionCount >= 5 },
      { id: "upgrade", label: "Upgrade 3 attractions", test: ({ totalUpgrades }) => totalUpgrades >= 3 },
      { id: "reputation", label: "Reach 70 reputation", test: ({ reputation }) => reputation >= 70 },
      { id: "rating", label: "Reach 4.0 resort rating", test: ({ resortRating }) => resortRating >= 4 },
    ],
  },
  {
    id: "five_star",
    name: "Five-Star Water Resort",
    desc: "Turn the whole park into a premium destination with hotels, guest satisfaction and polished operations.",
    reward: "+5% income and +5% guest satisfaction",
    bonuses: { incomeMult: 0.05, satisfactionBonus: 0.05 },
    goals: [
      { id: "rating", label: "Reach 4.5 resort rating", test: ({ resortRating }) => resortRating >= 4.5 },
      { id: "reputation", label: "Reach 80 reputation", test: ({ reputation }) => reputation >= 80 },
      { id: "hotel", label: "Own 2 hotels", test: ({ hotelCount }) => hotelCount >= 2 },
      { id: "appeal", label: "Reach 75 park appeal", test: ({ appeal }) => appeal >= 75 },
    ],
  },
  {
    id: "park_empire",
    name: "Park Empire",
    desc: "Scale from a local waterpark into a serious resort business.",
    reward: "+15% business value",
    bonuses: { businessValueMult: 0.15 },
    goals: [
      { id: "day", label: "Reach day 100", test: ({ day }) => day >= 100 },
      { id: "value", label: "Reach £500,000 business value", test: ({ businessValue }) => businessValue >= 500000 },
      { id: "peak", label: "Reach 500 peak guests", test: ({ peakGuests }) => peakGuests >= 500 },
      { id: "upgrades", label: "Complete 10 upgrades", test: ({ totalUpgrades }) => totalUpgrades >= 10 },
    ],
  },
];

export const DEFAULT_MASTER_PLAN_BONUSES = {
  guestDemandMult: 0,
  attractionIncomeMult: 0,
  incomeMult: 0,
  satisfactionBonus: 0,
  businessValueMult: 0,
};

export function getMasterPlanMetrics({ grid = [], money = 0, reputation = 50, peakGuests = 0, totalUpgrades = 0, resortRating = 0, appeal = 50, day = 1 } = {}) {
  const attractionCount = grid.filter((id) => getParkItem(id)?.category === "attraction").length;
  const hotelCount = grid.filter((id) => getParkItem(id)?.category === "hotel").length;
  const facilityCount = grid.filter((id) => getParkItem(id)?.category === "facility").length;
  const assetValue = grid.reduce((sum, id) => sum + (getParkItem(id)?.cost || 0), 0);
  const businessValue = Math.max(0, money + assetValue);
  return { grid, money, reputation, peakGuests, totalUpgrades, resortRating, appeal, day, attractionCount, hotelCount, facilityCount, businessValue };
}

export function getCompletedMasterPlans(context) {
  const completed = [];
  for (const plan of MASTER_PLANS) {
    if (plan.goals.every((goal) => goal.test(context))) completed.push(plan.id);
  }
  return completed;
}

export function calculateMasterPlanBonuses(completedIds = []) {
  return completedIds.reduce((out, id) => {
    const plan = MASTER_PLANS.find((item) => item.id === id);
    if (!plan) return out;
    for (const [key, value] of Object.entries(plan.bonuses || {})) out[key] = (out[key] || 0) + value;
    return out;
  }, { ...DEFAULT_MASTER_PLAN_BONUSES });
}
