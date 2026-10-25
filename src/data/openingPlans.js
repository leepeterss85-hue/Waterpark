// Optional one-off opening-day management choices. Spend only once per park
// day; benefits apply on the following simulation tick, then expire naturally.
// No monetisation: all costs are fictional in-game pounds.
export const OPENING_PLANS = Object.freeze([
  { id: "queue_marshal", name: "Queue Marshals", cost: 650, icon: "Users",
    description: "Put extra marshals at popular rides to reduce real queue waits and help impatient visitors find alternatives.",
    benefit: "25% shorter waits at staffed queues", queueWaitMult: .75 },
  { id: "safety_drill", name: "Safety Walkthrough", cost: 900, icon: "ShieldCheck",
    description: "Conduct pre-opening safety checks, brief the lifeguards and inspect ride procedures.",
    benefit: "+8 percentage points safety today", safetyBoost: .08 },
  { id: "welcome_crew", name: "Guest Welcome Crew", cost: 450, icon: "HeartHandshake",
    description: "Offer free guidance and park maps; visitors find facilities faster and feel more welcome.",
    benefit: "+3 guest mood and 5% more guest demand", moodBoost: 3, demandMult: 1.05 },
]);
export const openingPlanFor = (savedPlan, currentDay) => {
  if (!savedPlan || savedPlan.targetDay !== Number(currentDay) + 1) return null;
  return OPENING_PLANS.find(p => p.id === savedPlan.id) || null;
};
export const canChooseOpeningPlan = (savedPlan, currentDay, money, sandbox, id) =>
  !openingPlanFor(savedPlan, currentDay) &&
  Boolean(OPENING_PLANS.find(p => p.id === id && (sandbox || Number(money) >= p.cost)));
