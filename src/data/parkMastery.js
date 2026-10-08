// Long-term park mastery, strategy and resort package systems.
// Kept deterministic so saves remain stable across mobile and desktop.

export const DEFAULT_PARK_STRATEGY = {
  strategy: "balanced",
  hotelPackage: "room_only",
};

export const PARK_STRATEGIES = [
  { id:"balanced", name:"Balanced Operations", description:"Reliable all-round growth.", incomeMult:1, guestMult:1, upkeepMult:1, appeal:0 },
  { id:"growth", name:"Growth Campaign", description:"Trade a little margin for more visitors.", incomeMult:0.98, guestMult:1.10, upkeepMult:1.02, appeal:1 },
  { id:"premium", name:"Premium Resort", description:"Higher spend and stronger resort appeal.", incomeMult:1.10, guestMult:0.97, upkeepMult:1.03, appeal:3 },
  { id:"efficiency", name:"Lean Operations", description:"Reduce running costs and wear.", incomeMult:0.96, guestMult:0.98, upkeepMult:0.84, appeal:0 },
];

export const HOTEL_PACKAGES = [
  { id:"room_only", name:"Room Only", priceMult:1, guestMult:1, happiness:0, description:"Lowest price; guests pay their own way." },
  { id:"breakfast", name:"Breakfast Included", priceMult:1.12, guestMult:1.04, happiness:4, description:"A simple package that lifts hotel satisfaction." },
  { id:"family_resort", name:"Family Resort Package", priceMult:1.22, guestMult:1.10, happiness:8, description:"Bundles breakfast, park access and family extras." },
  { id:"vip_retreat", name:"VIP Retreat", priceMult:1.42, guestMult:0.92, happiness:14, description:"Premium rooms for high-value guests." },
];

export const MASTERY_GOALS = [
  { id:"first_100_guests", name:"Crowd Builder", text:"Reach 100 peak guests.", check:s=>s.peakGuests>=100, reward:1500, xp:60, points:1 },
  { id:"ten_attractions", name:"Ride Portfolio", text:"Build 10 attractions.", check:s=>s.attractionCount>=10, reward:3000, xp:100, points:2 },
  { id:"ten_upgrades", name:"Modern Park", text:"Complete 10 upgrades.", check:s=>s.totalUpgrades>=10, reward:3500, xp:120, points:2 },
  { id:"appeal_75", name:"Guest Magnet", text:"Reach 75 park appeal.", check:s=>s.appeal>=75, reward:4500, xp:140, points:3 },
  { id:"rep_80", name:"Five-Star Reputation", text:"Reach 80 reputation.", check:s=>s.reputation>=80, reward:5000, xp:150, points:3 },
  { id:"hotel_70", name:"Resort Operator", text:"Reach 70% hotel occupancy.", check:s=>s.occupancy>=70, reward:5000, xp:160, points:3 },
  { id:"million_earnings", name:"Million Pound Park", text:"Reach $1,000,000 lifetime earnings.", check:s=>s.lifetimeEarnings>=1000000, reward:20000, xp:300, points:5 },
  { id:"day_120", name:"Long Game", text:"Operate the park for 120 days.", check:s=>s.day>=120, reward:12000, xp:250, points:4 },
];

export const MASTERY_PERKS = [
  { id:"marketing", name:"Master Marketer", threshold:3, description:"+3% guest demand." },
  { id:"finance", name:"Master Financier", threshold:7, description:"+4% operating income." },
  { id:"operations", name:"Master Operator", threshold:12, description:"-5% attraction upkeep." },
  { id:"resort", name:"Resort Expert", threshold:18, description:"+5% hotel demand and satisfaction." },
  { id:"empire", name:"Empire Builder", threshold:25, description:"+5% income and guest demand." },
];

export function strategyFor(id) {
  return PARK_STRATEGIES.find(x => x.id === id) || PARK_STRATEGIES[0];
}
export function packageFor(id) {
  return HOTEL_PACKAGES.find(x => x.id === id) || HOTEL_PACKAGES[0];
}
export function masteryPerkState(points = 0) {
  return MASTERY_PERKS.filter(p => points >= p.threshold).map(p => p.id);
}
export function masteryEffects(points = 0) {
  const perks = masteryPerkState(points);
  return {
    guestMult: 1 + (perks.includes("marketing") ? 0.03 : 0) + (perks.includes("empire") ? 0.05 : 0),
    incomeMult: 1 + (perks.includes("finance") ? 0.04 : 0) + (perks.includes("empire") ? 0.05 : 0),
    upkeepMult: perks.includes("operations") ? 0.95 : 1,
    hotelGuestMult: perks.includes("resort") ? 1.05 : 1,
    hotelHappiness: perks.includes("resort") ? 5 : 0,
    perks,
  };
}
export function evaluateMastery(state, completed = []) {
  const newly = [];
  for (const goal of MASTERY_GOALS) {
    if (!completed.includes(goal.id) && goal.check(state)) newly.push(goal);
  }
  return newly;
}
