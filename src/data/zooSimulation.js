import { getParkItem } from "@/data/gameData";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const BASE_POPULATION = {
  lion_savannah: 2, elephant_reserve: 3, giraffe_plains: 4, penguin_coast: 8,
  tropical_aviary: 12, reptile_house: 8, meerkat_dunes: 6, red_panda_forest: 3,
  primate_island: 6, aquarium_dome: 18,
};

export const HABITAT_FEATURES = {
  shelter: { label: "Shelter & dens", cost: 1800, icon: "Home", description: "Protected resting, nesting and retreat spaces." },
  water: { label: "Water & bathing", cost: 2400, icon: "Waves", description: "Species-appropriate pools, streams or drinking stations." },
  enrichment: { label: "Enrichment course", cost: 2200, icon: "Sparkles", description: "Foraging puzzles, climbing, play and natural behaviours." },
  climate: { label: "Climate control", cost: 3600, icon: "Thermometer", description: "Temperature and humidity control for sensitive species." },
  terrain: { label: "Natural terrain", cost: 2800, icon: "Trees", description: "Species-appropriate planting, substrate and landscape." },
  expansion: { label: "Habitat expansion", cost: 5200, icon: "Maximize2", description: "More usable habitat area and additional animal capacity." },
};

export const SPECIES_REQUIREMENTS = {
  lion_savannah: { label: "Savannah", features: ["shelter", "enrichment", "terrain"], preferredKeepers: 1, note: "Dens, natural terrain and hunting-style enrichment" },
  elephant_reserve: { label: "Large mammal", features: ["shelter", "water", "enrichment", "terrain", "expansion"], preferredKeepers: 2, note: "Room to roam, bathing water and daily enrichment" },
  giraffe_plains: { label: "Tall browser", features: ["shelter", "enrichment", "terrain", "expansion"], preferredKeepers: 1, note: "Tall feeding points, browse and open space" },
  penguin_coast: { label: "Cold-water", features: ["water", "climate", "shelter", "enrichment"], preferredKeepers: 1, note: "Swimming water, cool temperatures and nesting ledges" },
  tropical_aviary: { label: "Tropical bird", features: ["shelter", "climate", "enrichment", "terrain"], preferredKeepers: 1, note: "Perches, nesting spaces, humidity and dense planting" },
  reptile_house: { label: "Reptile", features: ["climate", "shelter", "water", "enrichment"], preferredKeepers: 1, note: "Controlled heat, humidity and hiding places" },
  meerkat_dunes: { label: "Burrowing", features: ["shelter", "enrichment", "terrain"], preferredKeepers: 1, note: "Digging substrate, burrows and lookout mounds" },
  red_panda_forest: { label: "Forest", features: ["shelter", "climate", "enrichment", "terrain"], preferredKeepers: 1, note: "Cool shaded forest, climbing routes and retreat dens" },
  primate_island: { label: "Social climber", features: ["shelter", "water", "enrichment", "terrain", "expansion"], preferredKeepers: 2, note: "Climbing structures, social space and foraging" },
  aquarium_dome: { label: "Aquatic", features: ["water", "climate", "enrichment", "expansion"], preferredKeepers: 2, note: "Stable water systems, suitable conditions and habitat variety" },
};

export function createZooRecord(itemId, day = 1) {
  const population = BASE_POPULATION[itemId] || 4;
  return {
    population, health: 100, hunger: 92, welfare: 85, enrichment: 65,
    feedingSchedule: "daily", breeding: true, disease: null, diseaseDays: 0,
    lastFedDay: day, births: 0, deaths: 0, lifetimeFeeds: 0, keepersAssigned: 0,
    habitatFeatures: [], habitatQuality: 60,
  };
}

export function getHabitatAssessment(itemId, record = {}, level = 0, hasVet = false, hasConservation = false) {
  const requirements = SPECIES_REQUIREMENTS[itemId];
  if (!requirements) return { requirements: [], missing: [], score: 100, preferredKeepers: 0, note: "Wildlife support facility" };
  const features = Array.isArray(record.habitatFeatures) ? record.habitatFeatures : [];
  const missing = requirements.features.filter((feature) => !features.includes(feature));
  const levelBonus = Math.min(20, Math.max(0, level) * 4);
  const supportBonus = (hasVet ? 5 : 0) + (hasConservation ? 4 : 0);
  const score = clamp(Math.round(100 - missing.length * 14 + levelBonus + supportBonus), 0, 100);
  return { requirements: requirements.features, missing, score, preferredKeepers: requirements.preferredKeepers, note: requirements.note };
}

export function simulateZooDay(grid, zooAnimals = {}, staff = {}, upgrades = [], day = 1) {
  const next = {};
  const logs = [];
  let feedCost = 0;
  let vetCost = 0;
  let welfareTotal = 0;
  let habitatCount = 0;
  const hasVet = grid.some((id) => id === "wildlife_vet");
  const hasConservation = grid.some((id) => id === "conservation_centre");
  const keeperCount = Math.max(0, Number(staff.zookeeper) || 0);
  const habitats = grid.map((id, tile) => ({ id, tile })).filter(({ id }) => getParkItem(id)?.parkType === "zoo" && !["wildlife_vet", "conservation_centre"].includes(id));
  const assignedTotal = habitats.reduce((sum, { tile }) => sum + Math.max(0, Number(zooAnimals[tile]?.keepersAssigned) || 0), 0);
  const parkWideKeepers = Math.max(0, keeperCount - assignedTotal);
  for (const { id, tile } of habitats) {
    const item = getParkItem(id);
    const prior = zooAnimals[tile] || createZooRecord(id, day);
    const level = Math.max(0, Number(upgrades[tile]) || 0);
    const requirement = getHabitatAssessment(id, prior, level, hasVet, hasConservation);
    const populationCap = Math.max(prior.population, Math.round((BASE_POPULATION[id] || 4) * (2 + level * 0.35 + (Array.isArray(prior.habitatFeatures) && prior.habitatFeatures.includes("expansion") ? 1 : 0))));
    const assignedKeepers = Math.max(0, Number(prior.keepersAssigned) || 0);
    const keeperCoverage = Math.min(1, (assignedKeepers + parkWideKeepers / Math.max(1, habitats.length)) / Math.max(1, requirement.preferredKeepers));
    let hunger = prior.hunger;
    let health = prior.health;
    let welfare = prior.welfare;
    let enrichment = prior.enrichment;
    let population = prior.population;
    let disease = prior.disease || null;
    let diseaseDays = Math.max(0, Number(prior.diseaseDays) || 0);
    let births = prior.births || 0;
    let deaths = prior.deaths || 0;
    let lifetimeFeeds = prior.lifetimeFeeds || 0;
    const schedule = prior.feedingSchedule || "daily";
    const autoFeed = schedule === "daily" || schedule === "twice_daily";
    if (autoFeed) {
      const cost = Math.round(population * (item?.feedCost || 18) * (schedule === "twice_daily" ? 1.7 : 1) * (1 - level * 0.025));
      feedCost += cost;
      hunger = clamp(hunger + (schedule === "twice_daily" ? 65 : 48), 0, 100);
      lifetimeFeeds += 1;
    } else hunger = clamp(hunger - 20, 0, 100);
    const features = Array.isArray(prior.habitatFeatures) ? prior.habitatFeatures : [];
    const enrichmentFacility = features.includes("enrichment");
    enrichment = clamp(enrichment + (keeperCoverage > 0.6 ? 5 : keeperCoverage > 0.2 ? 1 : -7) + level * 1.5 + (enrichmentFacility ? 4 : 0), 0, 100);
    if (disease) {
      diseaseDays += 1;
      health = clamp(health - (hasVet ? 3 : 8) + (keeperCoverage > 0.6 ? 3 : keeperCoverage > 0.3 ? 1 : 0), 0, 100);
      if (hasVet) vetCost += Math.round(180 + population * 35);
      if (diseaseDays >= (hasVet ? 3 : 5) && health >= 45) {
        disease = null; diseaseDays = 0;
        logs.push(`Day ${day}: 🩺 The ${item?.animal || item?.name || "animals"} at ${item?.name || "the habitat"} recovered.`);
      } else if (health < 25 && Math.random() < 0.12) {
        population = Math.max(1, population - 1); deaths += 1;
        logs.push(`Day ${day}: ⚠️ An animal at ${item?.name || "a habitat"} was lost. Improve care and veterinary support.`);
      }
    } else if (health < 65 && Math.random() < (hasVet ? 0.015 : 0.055)) {
      disease = "under observation"; diseaseDays = 0;
      logs.push(`Day ${day}: 🩺 Illness detected at ${item?.name || "a habitat"}.${hasVet ? " The veterinary team is on site." : " Build a Wildlife Veterinary Hospital."}`);
    } else {
      health = clamp(health + (hasVet ? 4 : 2) + keeperCoverage * 2 - (hunger < 25 ? 9 : 0) - (requirement.score < 45 ? 2 : 0), 0, 100);
    }
    if (hunger < 30) health = clamp(health - 7, 0, 100);
    welfare = clamp(welfare + (keeperCoverage > 0.6 ? 3 : keeperCoverage > 0.2 ? 0 : -4) + (hunger < 30 ? -10 : hunger > 60 ? 2 : -2) + (disease ? -10 : 0) + (requirement.score < 45 ? -5 : requirement.score >= 85 ? 2 : 0), 0, 100);
    if (prior.breeding !== false && !disease && health >= 85 && welfare >= 80 && hunger >= 65 && requirement.score >= 70 && keeperCoverage >= 0.5 && day % 12 === 0 && population < populationCap) {
      population += 1; births += 1;
      logs.push(`Day ${day}: 🐣 A new ${item?.animal || "animal"} was born at ${item?.name || "your wildlife park"}!`);
    }
    if (hasConservation) welfare = clamp(welfare + 2, 0, 100);
    next[tile] = { ...prior, population, health, hunger, welfare, enrichment, disease, diseaseDays, births, deaths, lifetimeFeeds, lastFedDay: autoFeed ? day : prior.lastFedDay, feedingSchedule: schedule, breeding: prior.breeding !== false, keepersAssigned: Math.min(assignedKeepers, keeperCount), habitatQuality: requirement.score };
    welfareTotal += welfare; habitatCount += 1;
    if (requirement.missing.length && day % 7 === 0) logs.push(`Day ${day}: 🏡 ${item?.name || "A habitat"} needs ${requirement.missing.slice(0, 2).map((key) => HABITAT_FEATURES[key]?.label || key).join(" and ")}.`);
  }
  return { animals: next, logs, feedCost, vetCost, averageWelfare: habitatCount ? Math.round(welfareTotal / habitatCount) : 100, habitatCount, keeperCoverage: habitats.length ? Math.min(1, (keeperCount / Math.max(1, habitats.length))) : 1 };
}

export function getZooFeedCost(itemId, population, schedule = "daily") {
  const item = getParkItem(itemId);
  const base = item?.feedCost || 18;
  return Math.round(Math.max(1, population) * base * (schedule === "twice_daily" ? 1.7 : 1));
}
