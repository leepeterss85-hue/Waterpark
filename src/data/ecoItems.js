export const ECO_FACILITIES = [
  {
    id: "solar_panels",
    name: "Solar Panels",
    category: "facility",
    cost: 8000,
    income: 0,
    capacity: 0,
    fun: 0,
    maintenance: 100,
    icon: "Sun",
    color: "from-yellow-400 to-amber-500",
    description: "Cuts utility costs by 15% and boosts eco-reputation.",
    eco: { utilityReduction: 0.15, repBoost: 0.5 },
  },
  {
    id: "water_recycling",
    name: "Water Recycling Plant",
    category: "facility",
    cost: 10000,
    income: 0,
    capacity: 0,
    fun: 0,
    maintenance: 150,
    icon: "Recycle",
    color: "from-cyan-400 to-blue-500",
    description: "Recycles 25% of pool water — cuts water costs and boosts eco-reputation.",
    eco: { utilityReduction: 0.10, repBoost: 0.8, waterQualityBoost: 10 },
  },
  {
    id: "green_roof",
    name: "Green Roof Garden",
    category: "facility",
    cost: 5000,
    income: 0,
    capacity: 0,
    fun: 2,
    maintenance: 80,
    icon: "Leaf",
    color: "from-emerald-400 to-green-600",
    description: "Rooftop garden that cools buildings and lifts park appeal.",
    eco: { utilityReduction: 0.05, repBoost: 0.3, appealBoost: 3 },
  },
  {
    id: "wind_turbine",
    name: "Wind Turbine",
    category: "facility",
    cost: 12000,
    income: 0,
    capacity: 0,
    fun: 1,
    maintenance: 120,
    icon: "Wind",
    color: "from-sky-400 to-cyan-500",
    description: "Generates clean power — cuts utility costs by 20%.",
    eco: { utilityReduction: 0.20, repBoost: 0.6 },
  },
  {
    id: "rain_harvest",
    name: "Rain Harvest System",
    category: "facility",
    cost: 4000,
    income: 0,
    capacity: 0,
    fun: 0,
    maintenance: 60,
    icon: "CloudRain",
    color: "from-blue-400 to-indigo-500",
    description: "Collects rainwater for pool refills — cuts costs and boosts eco-score.",
    eco: { utilityReduction: 0.08, repBoost: 0.4, waterQualityBoost: 5 },
  },
];

export function getEcoFacility(id) {
  return ECO_FACILITIES.find((e) => e.id === id) || null;
}

export function calculateEcoBonuses(grid) {
  let utilityReduction = 0;
  let repBoost = 0;
  let appealBoost = 0;
  let waterQualityBoost = 0;
  let ecoCount = 0;
  for (const id of grid) {
    const eco = getEcoFacility(id);
    if (eco) {
      ecoCount++;
      utilityReduction += eco.eco.utilityReduction;
      repBoost += eco.eco.repBoost;
      appealBoost += eco.eco.appealBoost || 0;
      waterQualityBoost += eco.eco.waterQualityBoost || 0;
    }
  }
  return {
    utilityReduction: Math.min(0.6, utilityReduction),
    repBoost,
    appealBoost,
    waterQualityBoost,
    ecoCount,
    ecoScore: Math.min(100, ecoCount * 15),
  };
}