export const MEMBERSHIP_TIERS = [
  {
    id: "day_pass",
    name: "Day Pass",
    description: "Single-day admission to the park.",
    price: 28,
    category: "day",
    retentionRate: 0,
    spendingMult: 1.0,
    visitFrequency: 1,
    renewalCycle: 0,
    membersPerPass: 1,
    perks: ["Full park access for one day"],
    unlockLevel: 1,
    icon: "Ticket",
    color: "cyan",
  },
  {
    id: "season_pass",
    name: "Season Pass",
    description: "Unlimited visits all season long. Great for locals.",
    price: 180,
    category: "season",
    retentionRate: 0.65,
    spendingMult: 1.15,
    visitFrequency: 0.32,
    renewalCycle: 30,
    membersPerPass: 1,
    perks: [
      "Unlimited park visits",
      "10% off food & retail",
      "Early entry on weekends",
      "Exclusive pass-holder events",
    ],
    unlockLevel: 2,
    icon: "CalendarCheck",
    color: "emerald",
  },
  {
    id: "family_membership",
    name: "Family Membership",
    description: "Covers up to 4 family members. Perfect for regulars.",
    price: 450,
    category: "family",
    retentionRate: 0.72,
    spendingMult: 1.20,
    visitFrequency: 0.26,
    renewalCycle: 30,
    membersPerPass: 4,
    perks: [
      "Admission for up to 4 members",
      "15% off food & retail",
      "Free locker rental",
      "Kids club access",
      "Priority on family rides",
    ],
    unlockLevel: 4,
    icon: "Users",
    color: "amber",
  },
  {
    id: "vip_membership",
    name: "VIP Membership",
    description: "Premium experience with exclusive perks and priority access.",
    price: 950,
    category: "vip",
    retentionRate: 0.80,
    spendingMult: 1.35,
    visitFrequency: 0.20,
    renewalCycle: 30,
    membersPerPass: 1,
    perks: [
      "Priority access to all attractions",
      "VIP lounge access",
      "25% off food & retail",
      "Free cabana rental",
      "Concierge service",
      "Exclusive VIP-only events",
    ],
    unlockLevel: 6,
    icon: "Crown",
    color: "violet",
  },
];

export function getTier(id) {
  return MEMBERSHIP_TIERS.find((t) => t.id === id);
}

/**
 * Simulate one day of membership activity: new sales, renewals, member visits and spending.
 * @returns {object} updated counts, timers, revenue, visits, spend, renewal stats, log entries
 */
export function simulateMemberships({
  counts,
  daysUntilRenewal,
  reputation,
  parkAppealScore,
  dayGuests,
  level,
  weather,
  seasonEvent,
  activeEvents,
}) {
  const tiers = MEMBERSHIP_TIERS.filter((t) => t.category !== "day");
  const newCounts = { ...counts };
  const newTimers = { ...daysUntilRenewal };
  let newSalesRevenue = 0;
  let renewalRevenue = 0;
  let memberVisits = 0;
  let memberSpend = 0;
  let totalRenewed = 0;
  let totalChurned = 0;
  const logEntries = [];

  const appealFactor = 0.5 + (parkAppealScore / 100) * 0.8;
  const repFactor = 0.4 + (reputation / 100) * 0.8;
  const eventBoost = activeEvents?.length > 0 ? 1.12 : 1;
  const weatherFactor = weather?.id === "rain" ? 0.6 : weather?.id === "storm" ? 0.3 : 1;
  const seasonBoost = seasonEvent?.guestMult ? 1 + (seasonEvent.guestMult - 1) * 0.5 : 1;

  for (const tier of tiers) {
    if (level < tier.unlockLevel) continue;
    const currentCount = counts[tier.id] || 0;
    const timer = daysUntilRenewal[tier.id] ?? tier.renewalCycle;

    // New sales — conversion from day-pass guest volume
    const conversionRate =
      tier.id === "season_pass" ? 0.022
      : tier.id === "family_membership" ? 0.007
      : 0.0018;
    const newSales = Math.max(0, Math.floor(
      dayGuests * conversionRate * appealFactor * repFactor * eventBoost * weatherFactor * seasonBoost
    ));

    // Renewals — when timer expires, roll retention for existing members
    let retained = currentCount;
    if (timer <= 1 && currentCount > 0) {
      retained = Math.round(currentCount * tier.retentionRate);
      const churned = currentCount - retained;
      totalRenewed += retained;
      totalChurned += churned;
      renewalRevenue += retained * tier.price;
      if (retained > 0) {
        logEntries.push(`${retained} ${tier.name}${retained > 1 ? "s" : ""} renewed (+£${(retained * tier.price).toLocaleString()}).`);
      }
      if (churned > 0) {
        logEntries.push(`${churned} ${tier.name}${churned > 1 ? "s" : ""} lapsed.`);
      }
      newCounts[tier.id] = retained + newSales;
      newTimers[tier.id] = tier.renewalCycle;
    } else {
      newCounts[tier.id] = currentCount + newSales;
      newTimers[tier.id] = Math.max(0, timer - 1);
    }

    if (newSales > 0) {
      newSalesRevenue += newSales * tier.price;
      logEntries.push(`${newSales} new ${tier.name}${newSales > 1 ? "s" : ""} sold (+£${(newSales * tier.price).toLocaleString()}).`);
    }

    // Member visits today — a fraction of total members visit based on visitFrequency
    const totalMembers = newCounts[tier.id] * (tier.membersPerPass || 1);
    const visitingToday = Math.floor(totalMembers * tier.visitFrequency * weatherFactor);
    memberVisits += visitingToday;
    const avgSpend = 16;
    memberSpend += visitingToday * avgSpend * tier.spendingMult;
  }

  return {
    counts: newCounts,
    daysUntilRenewal: newTimers,
    newSalesRevenue,
    renewalRevenue,
    totalRevenue: newSalesRevenue + renewalRevenue,
    memberVisits,
    memberSpend: Math.round(memberSpend),
    totalRenewed,
    totalChurned,
    logEntries,
  };
}

export function totalMemberCount(counts) {
  const tiers = MEMBERSHIP_TIERS.filter((t) => t.category !== "day");
  return tiers.reduce((sum, t) => sum + ((counts || {})[t.id] || 0) * (t.membersPerPass || 1), 0);
}