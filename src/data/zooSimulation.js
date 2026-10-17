import { getParkItem } from "@/data/gameData";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const BASE_POPULATION = {
  lion_savannah: 2, elephant_reserve: 3, giraffe_plains: 4, penguin_coast: 8,
  tropical_aviary: 12, reptile_house: 8, meerkat_dunes: 6, red_panda_forest: 3,
  primate_island: 6, aquarium_dome: 18,
};
export const DEFAULT_ZOO_SETTINGS = { feedingSchedule: "daily", breeding: true };

export function createZooRecord(itemId, day = 1) {
  const population = BASE_POPULATION[itemId] || 4;
  return {
    population, health: 100, hunger: 92, welfare: 85, enrichment: 65,
    feedingSchedule: "daily", breeding: true, disease: null, diseaseDays: 0,
    lastFedDay: day, births: 0, deaths: 0, lifetimeFeeds: 0,
  };
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
  for (const { id, tile } of habitats) {
    const item = getParkItem(id);
    const prior = zooAnimals[tile] || createZooRecord(id, day);
    const level = Math.max(0, Number(upgrades[tile]) || 0);
    const populationCap = Math.max(prior.population, Math.round((BASE_POPULATION[id] || 4) * (2 + level * 0.35)));
    const keeperCoverage = Math.min(1, keeperCount / Math.max(1, habitats.length * 0.7));
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
    } else {
      hunger = clamp(hunger - 20, 0, 100);
    }
    enrichment = clamp(enrichment + (keeperCoverage > 0.35 ? 5 : -7) + level * 1.5, 0, 100);
    if (disease) {
      diseaseDays += 1;
      health = clamp(health - (hasVet ? 3 : 8) + (keeperCoverage > 0.4 ? 2 : 0), 0, 100);
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
      health = clamp(health + (hasVet ? 4 : 2) + keeperCoverage * 2 - (hunger < 25 ? 9 : 0), 0, 100);
    }
    if (hunger < 30) health = clamp(health - 7, 0, 100);
    if (hunger > 60 && health > 75 && welfare > 65) welfare = clamp(welfare + 2, 0, 100);
    else welfare = clamp(welfare + (keeperCoverage > 0.35 ? 2 : -4) + (hunger < 30 ? -10 : 0) + (disease ? -10 : 0), 0, 100);
    if (prior.breeding !== false && !disease && health >= 85 && welfare >= 80 && hunger >= 65 && day % 12 === 0 && population < populationCap) {
      population += 1; births += 1;
      logs.push(`Day ${day}: 🐣 A new ${item?.animal || "animal"} was born at ${item?.name || "your wildlife park"}!`);
    }
    if (hasConservation) welfare = clamp(welfare + 2, 0, 100);
    next[tile] = { ...prior, population, health, hunger, welfare, enrichment, disease, diseaseDays, births, deaths, lifetimeFeeds, lastFedDay: autoFeed ? day : prior.lastFedDay, feedingSchedule: schedule, breeding: prior.breeding !== false };
    welfareTotal += welfare; habitatCount += 1;
  }
  const stale = Object.keys(zooAnimals).filter((tile) => !habitats.some((h) => String(h.tile) === String(tile)));
  stale.forEach((tile) => { /* removed habitats intentionally drop their animal records */ });
  return { animals: next, logs, feedCost, vetCost, averageWelfare: habitatCount ? Math.round(welfareTotal / habitatCount) : 100, habitatCount, keeperCoverage: habitats.length ? Math.min(1, keeperCount / (habitats.length * 0.7)) : 1 };
}

export function getZooFeedCost(itemId, population, schedule = "daily") {
  const item = getParkItem(itemId);
  const base = item?.feedCost || 18;
  return Math.round(Math.max(1, population) * base * (schedule === "twice_daily" ? 1.7 : 1));
}
