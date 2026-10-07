// Sponsorships & brand deals: steady cash income in exchange for park appeal/prestige.
// Each active sponsor pays daily income but lowers the park's appeal score.

export const SPONSOR_TIERS = [
  { id: "local_diner", name: "Local Diner Chain", tier: "Bronze", dailyIncome: 800, appealCost: 3, minLevel: 1, icon: "Utensils" },
  { id: "sports_brand", name: "Sports Apparel Co.", tier: "Silver", dailyIncome: 2200, appealCost: 6, minLevel: 4, icon: "Dumbbell" },
  { id: "energy_drink", name: "Energy Drink Brand", tier: "Silver", dailyIncome: 2600, appealCost: 7, minLevel: 5, icon: "Zap" },
  { id: "tech_giant", name: "Tech Giant", tier: "Gold", dailyIncome: 5500, appealCost: 11, minLevel: 8, icon: "Cpu" },
  { id: "luxury_auto", name: "Luxury Automaker", tier: "Gold", dailyIncome: 6500, appealCost: 13, minLevel: 10, icon: "Car" },
  { id: "mega_corp", name: "Mega Conglomerate", tier: "Platinum", dailyIncome: 12000, appealCost: 18, minLevel: 14, icon: "Building2" },
];

export const MAX_SPONSORS = 3;
export const SPONSOR_DURATION = 14; // days per deal

export function getTier(id) {
  return SPONSOR_TIERS.find((s) => s.id === id) || null;
}

export function activeSponsorIncome(sponsorships) {
  return (sponsorships || []).reduce((s, sp) => s + (sp.dailyIncome || 0), 0);
}

export function activeSponsorAppealCost(sponsorships) {
  return (sponsorships || []).reduce((s, sp) => s + (sp.appealCost || 0), 0);
}

// Tick active sponsors: decrement daysLeft, return surviving + expired log entries.
export function tickSponsors(sponsorships, day) {
  const surviving = [];
  const expiredEntries = [];
  for (const sp of sponsorships || []) {
    const daysLeft = sp.daysLeft - 1;
    if (daysLeft <= 0) {
      expiredEntries.push({ day, text: `Day ${day}: 🤝 Sponsorship with ${sp.name} ended.` });
    } else {
      surviving.push({ ...sp, daysLeft });
    }
  }
  return { surviving, expiredEntries };
}