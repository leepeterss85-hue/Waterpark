import { useState, useEffect, useCallback, useRef } from "react";
import {
  getParkItem, STAFF, MAX_UPGRADE, upgradeCost,
  INITIAL_GRID_SIZE, EXPAND_ROW, MAX_EXPANSIONS, MAX_GRID_SIZE,
  expandCost, expandLevelReq, levelFromXp, xpForLevel, staffWages, staffEffects,
} from "@/data/gameData";
import { WEATHER, getSeason, rollWeather, rollSeasonEvent } from "@/data/parkSystems";
import { MISSIONS, missionProgress } from "@/data/missions";
import { rollChallenge } from "@/data/challenges";
import { RESEARCH, dailyResearchPoints, researchReqFor } from "@/data/research";
import { simulateVisits, aggregatePriceReaction } from "@/data/visitorLogic";
import { generateFeedback } from "@/data/guestFeedback";
import { trackEvent } from "@/lib/gameAnalytics";
import { getSettings, getDifficulty, saveSettings } from "@/lib/settings";
import { rollDisaster, disasterMitigation } from "@/data/disasters";
import { CAMPAIGNS, campaignEffectiveness, getCampaign } from "@/data/campaigns";
import { getHotelDef, simulateHotelDay, calculateResortRating } from "@/data/hotels";
import { getStarterPark } from "@/data/starterParks";
import { calculateParkAppeal } from "@/data/parkThemes";

const STORAGE_KEY = "waterpark-tycoon-save-v1";
const SLOTS_KEY = "waterpark-tycoon-slots";
const GRID_SIZE = INITIAL_GRID_SIZE;
const INITIAL_MONEY = 50000;

const DEFAULT_TICKET_PRICE = 28;
const DEFAULT_AD_BUDGET = 250;
const DEFAULT_STAFF = Object.fromEntries(Object.keys(STAFF).map((id) => [id, 0]));

function makeStartingGrid() {
  const g = Array(GRID_SIZE).fill(null);
  g[GRID_SIZE - 8] = "park_entrance";
  g[GRID_SIZE - 7] = "main_path";
  g[GRID_SIZE - 6] = "main_path";
  g[GRID_SIZE - 5] = "main_path";
  return g;
}

function makeEmptyZones(size) {
  return Array(size).fill(null);
}

function readSlots() {
  try {
    return JSON.parse(localStorage.getItem(SLOTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSlots(obj) {
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

function slotMeta(name, s) {
  return {
    name,
    savedAt: s.savedAt,
    day: s.day,
    money: s.money,
    reputation: s.reputation,
    guests: s.guests,
  };
}

export function useGameState() {
  const [money, setMoney] = useState(INITIAL_MONEY);
  const [day, setDay] = useState(1);
  const [reputation, setReputation] = useState(50);
  const [guests, setGuests] = useState(0);
  const [grid, setGrid] = useState(() => makeStartingGrid());
const [parkZones, setParkZones] = useState(() => makeEmptyZones(GRID_SIZE));
const [selectedZone, setSelectedZone] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [weather, setWeather] = useState(WEATHER[0]);
  const [forecast, setForecast] = useState(WEATHER[1]);
  const [seasonEvent, setSeasonEvent] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(DEFAULT_TICKET_PRICE);
  const [adBudget, setAdBudget] = useState(DEFAULT_AD_BUDGET);
  const [priorityPass, setPriorityPass] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [lastBuildAction, setLastBuildAction] = useState(null);
  const [vipVisit, setVipVisit] = useState(null);
  const [lastNet, setLastNet] = useState(0);
  const [log, setLog] = useState([
    { day: 0, text: "Welcome to your new water park! Place an attraction to get started." },
  ]);
  const [history, setHistory] = useState([]);
  const [staff, setStaff] = useState(DEFAULT_STAFF);
  const [staffAssignments, setStaffAssignments] = useState({});
  const [saves, setSaves] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [attractionCondition, setAttractionCondition] = useState(() => Array(GRID_SIZE).fill(100));
  const [upgrades, setUpgrades] = useState(() => Array(GRID_SIZE).fill(0));
  const [xp, setXp] = useState(0);
  const [expansionsDone, setExpansionsDone] = useState(0);
  const [peakGuests, setPeakGuests] = useState(0);
  const [totalUpgrades, setTotalUpgrades] = useState(0);
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [builtAttractionIds, setBuiltAttractionIds] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
  const [feedback, setFeedback] = useState([]);
  const [researchPoints, setResearchPoints] = useState(0);
  const [completedResearch, setCompletedResearch] = useState([]);
  const [parkAppeal, setParkAppeal] = useState(() => ({ score: 50, label: "Untouched", zones: [], bestZone: null, coverage: 0, variety: 0, scenery: 0 }));
  const [disaster, setDisaster] = useState(null);
  const [disastersSurvived, setDisastersSurvived] = useState(0);
  const [sandbox, setSandbox] = useState(getSettings().sandbox || false);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [hotelGuests, setHotelGuests] = useState([]);
  const [hotelStats, setHotelStats] = useState({ roomRevenue: 0, hotelExpenses: 0, parkSpend: 0, occupancy: 0, avgHappiness: 0, totalGuests: 0, totalRooms: 0, guestsByHotel: {} });
  const [resortRating, setResortRating] = useState(0);

  const level = levelFromXp(xp);
  const gridSize = grid.length;

  /** @type {import("react").MutableRefObject<Record<string, any>>} */
  const stateRef = useRef({});
  stateRef.current = { money, day, reputation, grid, staff, staffAssignments, incidents, upgrades, attractionCondition, challenge, parkZones, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, completedResearch, parkAppeal, disaster, sandbox, activeCampaigns, hotelGuests, resortRating };

  // Load saved game
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.money != null) setMoney(data.money);
        if (data.day != null) setDay(data.day);
        if (data.reputation != null) setReputation(data.reputation);
        setGuests(data.guests ?? data.history?.[data.history.length - 1]?.guests ?? 0);
        if (data.grid) setGrid(data.grid);
        if (data.parkZones) setParkZones(data.parkZones);
        if (data.weather) setWeather(data.weather);
        if (data.forecast) setForecast(data.forecast);
        if (data.seasonEvent) setSeasonEvent(data.seasonEvent);
        if (data.ticketPrice != null) setTicketPrice(data.ticketPrice);
        if (data.adBudget != null) setAdBudget(data.adBudget);
        if (data.priorityPass != null) setPriorityPass(data.priorityPass);
        if (data.history) setHistory(data.history);
        if (data.staff) setStaff({ ...DEFAULT_STAFF, ...data.staff });
        if (data.staffAssignments) setStaffAssignments(data.staffAssignments);
        if (data.incidents) setIncidents(data.incidents);
        if (data.attractionCondition) setAttractionCondition(data.attractionCondition);
        if (data.xp != null) setXp(data.xp);
        if (data.expansionsDone != null) setExpansionsDone(data.expansionsDone);
        if (data.peakGuests != null) setPeakGuests(data.peakGuests);
        if (data.totalUpgrades != null) setTotalUpgrades(data.totalUpgrades);
        if (data.claimedMissions) setClaimedMissions(data.claimedMissions);
        if (data.challenge) setChallenge(data.challenge);
        if (data.lifetimeEarnings != null) setLifetimeEarnings(data.lifetimeEarnings);
        if (data.builtAttractionIds) setBuiltAttractionIds(data.builtAttractionIds);
        if (data.visitorStats) setVisitorStats(data.visitorStats);
        if (data.feedback) setFeedback(data.feedback);
        if (data.vipVisit) setVipVisit(data.vipVisit);
        if (data.researchPoints != null) setResearchPoints(data.researchPoints);
        if (data.completedResearch) setCompletedResearch(data.completedResearch);
        if (data.parkAppeal) setParkAppeal(data.parkAppeal);
        if (data.disaster) setDisaster(data.disaster);
        if (data.disastersSurvived != null) setDisastersSurvived(data.disastersSurvived);
        if (data.activeCampaigns) setActiveCampaigns(data.activeCampaigns);
        if (data.hotelGuests) setHotelGuests(data.hotelGuests);
        if (data.hotelStats) setHotelStats(data.hotelStats);
        if (data.resortRating != null) setResortRating(data.resortRating);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, incidents, attractionCondition, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating })
        );
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, incidents, attractionCondition, upgrades, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating]);

  // Load save slots list on mount
  useEffect(() => {
    const slots = readSlots();
    setSaves(Object.entries(slots).map(([name, s]) => slotMeta(name, s)));
  }, []);

  const advanceDay = useCallback(() => {
    const { grid: prevGrid, reputation: rep, day: d, staff: currentStaff, staffAssignments: currentAssignments, incidents: currentIncidents, upgrades: currentUpgrades, attractionCondition: currentCondition, challenge: currentChallenge, parkZones: currentZones, forecast: currentForecast, seasonEvent: currentSeasonEvent, parkAppeal: currentParkAppeal,     ticketPrice: currentTicketPrice, adBudget: currentAdBudget, priorityPass: currentPriorityPass, vipVisit: currentVipVisit, completedResearch: currentResearch } = stateRef.current;
    const hasResearch = (id) => (currentResearch || []).includes(id);
    const upkeepResearchMult = hasResearch("efficiency") ? 0.85 : 1;
    const ticketResearchMult = hasResearch("marketing") ? 1.10 : 1;
    const dayWeather = currentForecast || rollWeather(d + 1);
    const dayForecast = rollWeather(d + 2);
    const currentDisaster = stateRef.current.disaster;
    const isSandbox = stateRef.current.sandbox;
    const currentCampaigns = stateRef.current.activeCampaigns || [];
    const eff = { ...(currentChallenge?.effects || {}) };
    if (currentDisaster) {
      eff.guestMult = (eff.guestMult ?? 1) * (currentDisaster.effects?.guestMult ?? 1);
      eff.incomeMult = (eff.incomeMult ?? 1) * (currentDisaster.effects?.incomeMult ?? 1);
      eff.repDelta = (eff.repDelta ?? 0) + (currentDisaster.effects?.repDelta ?? 0);
      if (currentDisaster.effects?.utilityMult) eff.utilityMult = (eff.utilityMult ?? 1) * currentDisaster.effects.utilityMult;
    }
    const calculatedAppeal = calculateParkAppeal({ grid: prevGrid, zones: currentZones, getItem: getParkItem });
    setParkAppeal(calculatedAppeal);
    const appealDemandMult = 0.85 + (calculatedAppeal.score / 100) * 0.30;
    const campaignGuestMult = currentCampaigns.reduce((sum, c) => sum + (c.effectiveBoost || 0), 1);
    const campaignRepBoost = currentCampaigns.reduce((sum, c) => sum + (c.repBoost || 0), 0);
    const placedItems = prevGrid
      .map((id, idx) => (id ? { id, idx, attr: getParkItem(id), zone: currentZones?.[idx] || null, level: (currentUpgrades || [])[idx] || 0 } : null))
      .filter(Boolean);
    const attractions = placedItems.filter((p) => p.attr.category === "attraction");
    const facilities = placedItems.filter((p) => p.attr.category === "facility");
    const lifeguardStations = facilities.filter((p) => p.id === "lifeguard_station").length;
    const toilets = facilities.filter((p) => p.id === "toilets" || p.id === "lockers").length;
    const environment = placedItems.filter((p) => p.attr.category === "environment");
    const hasEntrance = environment.some((p) => p.id === "park_entrance");
    const pathCount = environment.filter((p) => p.id === "main_path" || p.id === "service_road").length;
    const scenicCount = environment.filter((p) => ["palm_tree", "bench", "shade_umbrella", "fountain", "wayfinding_sign"].includes(p.id)).length;
    const capOf = (p) => p.attr.capacity * (1 + 0.2 * p.level);
    const incOf = (p) => p.attr.income * (1 + 0.15 * p.level);
    const funOf = (p) => Math.min(10, p.attr.fun + p.level * 0.5);
    const upkeepOf = (p) => p.attr.maintenance * (1 + 0.1 * p.level);

    const counts = currentStaff || {};
    const attractionZoneCoverage = (role) => {
      const assignedZone = currentAssignments?.[role] || "";
      if (!assignedZone) return 1;
      if (!attractions.length) return 0;
      return attractions.filter((item) => (currentZones?.[item.idx] || "") === assignedZone).length / attractions.length;
    };
    const serviceZoneCoverage = (role) => {
      const assignedZone = currentAssignments?.[role] || "";
      if (!assignedZone) return 1;
      const serviceTargets = [...attractions, ...facilities];
      if (!serviceTargets.length) return 0;
      return serviceTargets.filter((item) => (currentZones?.[item.idx] || "") === assignedZone).length / serviceTargets.length;
    };
    const effectiveStaff = {
      ...counts,
      lifeguard: (counts.lifeguard || 0) * attractionZoneCoverage("lifeguard"),
      mechanic: (counts.mechanic || 0) * attractionZoneCoverage("mechanic"),
      cleaner: (counts.cleaner || 0) * serviceZoneCoverage("cleaner"),
      security: (counts.security || 0) * attractionZoneCoverage("security"),
      entertainer: (counts.entertainer || 0) * serviceZoneCoverage("entertainer"),
      fitness_coach: (counts.fitness_coach || 0) * serviceZoneCoverage("fitness_coach"),
      gardener: (counts.gardener || 0) * serviceZoneCoverage("gardener"),
    };
    const fx = staffEffects(effectiveStaff);
    const uptime = fx.uptime;
    const safety = fx.safety;
    const trashCanCount = environment.filter((p) => p.id === "trash_can").length;
    const cleanliness = Math.min(1, fx.cleanliness + Math.min(0.15, trashCanCount * 0.02));
    const entertainment = fx.entertainment;
    const facilityBonus = fx.facilityBonus;
    const wages = staffWages(counts);

    // --- Resolve active incidents: staff improve the odds of a fix ---
    const mechPower = Math.min(0.9, 0.3 + (counts.mechanic || 0) * 0.2);
    const cleanPower = Math.min(0.9, 0.35 + (counts.cleaner || 0) * 0.2);
    const remaining = [];
    const resolved = [];
    const assignedCount = (role, tileIndex) => {
      const zone = currentZones?.[tileIndex] || "";
      const assignment = currentAssignments?.[role] || "";
      return assignment && assignment !== zone ? 0 : (counts[role] || 0);
    };
    for (const inc of currentIncidents || []) {
      const zone = currentZones?.[inc.tileIndex] || "";
      const mechanicCount = (currentAssignments?.mechanic && currentAssignments.mechanic !== zone) ? 0 : (counts.mechanic || 0);
      const cleanerCount = (currentAssignments?.cleaner && currentAssignments.cleaner !== zone) ? 0 : (counts.cleaner || 0);
      const power = inc.type === "breakdown"
        ? Math.min(0.9, 0.3 + mechanicCount * 0.2)
        : Math.min(0.9, 0.35 + cleanerCount * 0.2);
      if (Math.random() < power) resolved.push(inc);
      else remaining.push(inc);
    }
    const incidentByTile = new Map(remaining.map((i) => [i.tileIndex, i]));
    // --- Guests & income: agent-based visitor simulation ---
    const workingAttractions = attractions.filter(
      (p) => incidentByTile.get(p.idx)?.type !== "breakdown"
    );
    const totalCapacity = workingAttractions.reduce((s, p) => s + capOf(p), 0);

    let newGuests = 0;
    let income = 0;
    let newReputation = rep;
    let visitorStats = { avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} };
    let dayFeedback = [];

    if (attractions.length > 0) {
      const demand = Math.floor(
        (rep / 100) * totalCapacity * 1.15 * (1 + d / 80) *
        (eff.guestMult ?? 1) *
        (dayWeather.guestMult ?? 1) *
        (currentSeasonEvent?.guestMult ?? 1) *
        (1 + currentAdBudget / 5000) *
        campaignGuestMult *
        appealDemandMult *
        (hasEntrance ? 1 : 0.9) *
        aggregatePriceReaction(currentTicketPrice)
      );
      const safetyCoverage = Math.min(1, (effectiveStaff.lifeguard || 0) / Math.max(1, Math.ceil(attractions.length / 3)) + lifeguardStations * 0.12);
      const guestSafetyMult = safetyCoverage < 0.45 ? 0.88 : safetyCoverage < 0.7 ? 0.96 : 1;
      newGuests = Math.min(demand, Math.round(totalCapacity * guestSafetyMult));

      const sim = simulateVisits({
        demand: newGuests,
        placedItems: [...attractions, ...facilities],
        queuePaths: environment.filter((p) => p.id === "queue_path"),
        incidents: incidentByTile,
        uptime,
        safety,
        cleanliness,
        incomeMult: eff.incomeMult ?? 1,
        entertainment,
        facilityBonus,
        appealBonus: (calculatedAppeal.score - 50) * 0.025,
      });
      income = sim.income;
      visitorStats = sim;
      if (currentDisaster?.effects?.repDelta) {
        visitorStats = { ...visitorStats, avgMood: Math.max(0, visitorStats.avgMood - Math.abs(currentDisaster.effects.repDelta) * 4) };
      }
      dayFeedback = generateFeedback(sim, { day: d + 1, weather: dayWeather, incidents: remaining, cleanliness, safety, entertainment });
      const signatureRides = attractions.filter((p) => ["water_coaster", "mega_slide_complex", "freefall_drop", "cliff_jump", "tornado_bowl", "aqua_loop"].includes(p.id));
      const bigMoment = signatureRides.find((p) => (visitorStats.movements?.[p.id] || 0) >= Math.max(10, p.attr.capacity * 0.08));
      if (bigMoment) dayFeedback = [{ day: d + 1, text: `🔥 MASSIVE SPLASH! ${bigMoment.attr.name} is the star of the park today.` }, ...dayFeedback];

      const avgMood = sim.avgMood;
      let repDelta = 0;
      if (avgMood >= 70) repDelta += 1.5;
      else if (avgMood < 40) repDelta -= 1.5;
      else if (avgMood < 55) repDelta -= 0.5;
      if (facilities.some((f) => f.attr.id === "first_aid")) repDelta += 0.5;
      if (facilities.some((f) => f.attr.id === "guest_services")) repDelta += 0.3;
      if (facilities.some((f) => f.attr.id === "dining")) repDelta += 0.5;
      if (facilities.some((f) => f.attr.id === "lockers" || f.attr.id === "toilets")) repDelta += 0.3;
      if (toilets > 0) repDelta += Math.min(0.4, toilets * 0.08);
      if (lifeguardStations > 0) repDelta += Math.min(0.5, lifeguardStations * 0.1);
      repDelta += (cleanliness - 0.6) * 1.5;
      repDelta += (safety - 0.7) * 0.8;
      repDelta += (effectiveStaff.gardener || 0) * 0.1;
      repDelta -= remaining.reduce(
        (s, inc) => s + (inc.type === "breakdown" ? 1.2 : 0.6),
        0
      );
      repDelta += eff.repDelta ?? 0;
      repDelta += campaignRepBoost;
      const currentHotelGuests = stateRef.current.hotelGuests || [];
      const currentResortRating = stateRef.current.resortRating || 0;
      if (currentHotelGuests.length > 0) {
        const avgHotelHappiness = currentHotelGuests.reduce((s, g) => s + (g.happiness || 50), 0) / currentHotelGuests.length;
        if (avgHotelHappiness >= 75) repDelta += 0.5;
        else if (avgHotelHappiness < 40) repDelta -= 0.4;
      }
      if (currentResortRating >= 4) repDelta += 0.3;
      if (dayWeather.id === "rain") repDelta -= 0.8;
      else if (dayWeather.id === "sunny") repDelta += 0.35;
      repDelta += Math.min(1.5, scenicCount * 0.08 + pathCount * 0.03);
      repDelta += (calculatedAppeal.score - 50) * 0.035;
      if (hasEntrance) repDelta += 0.2;
      if (environment.filter((p) => currentZones?.[p.idx]).length >= 5) repDelta += 0.25;
      if (currentSeasonEvent) repDelta += currentSeasonEvent.repDelta || 0;
      newReputation = Math.max(0, Math.min(100, rep + repDelta));
      if (hasResearch("filtration")) newReputation = Math.min(100, newReputation + 1);
    } else {
      newReputation = Math.max(0, rep - 1);
    }

    // Calculate wear after guest demand and capacity have been determined.
    const nextCondition = Array(prevGrid.length).fill(100);
    for (const p of attractions) {
      let condition = Number.isFinite(currentCondition?.[p.idx]) ? currentCondition[p.idx] : 100;
      const activeIncident = incidentByTile.get(p.idx);
      const resolvedIncident = resolved.find((inc) => inc.tileIndex === p.idx);
      const loadPressure = Math.min(1.5, newGuests / Math.max(1, totalCapacity || capOf(p)));
      const wear = 1.2 + loadPressure * 2.4 + p.level * 0.25 + (dayWeather.id === "storm" ? 1.2 : 0);
      if (resolvedIncident?.type === "breakdown") condition += 32;
      else if (resolvedIncident?.type === "maintenance") condition += 18;
      const zone = currentZones?.[p.idx] || "";
      const mechanicAssigned = currentAssignments?.mechanic && currentAssignments.mechanic !== zone ? 0 : (counts.mechanic || 0);
      condition += Math.min(10, mechanicAssigned * 3.5);
      condition -= wear;
      if (activeIncident?.type === "breakdown") condition = Math.min(condition, 8);
      if (activeIncident?.type === "maintenance") condition = Math.min(condition, 28);
      nextCondition[p.idx] = Math.max(0, Math.min(100, Math.round(condition)));
    }

    // --- Roll at most one new incident per day (staff reduce the odds) ---
    const incidentTiles = new Set(remaining.map((i) => i.tileIndex));
    const eligible = attractions.filter((p) => !incidentTiles.has(p.idx));
    const newIncidents = [];
    if (eligible.length > 0 && !isSandbox) {
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      const condition = nextCondition[pick.idx] ?? 100;
      const breakChance = Math.max(0, 0.11 - 0.018 * (counts.mechanic || 0) - 0.015 * (counts.security || 0) + (condition < 35 ? 0.16 : condition < 55 ? 0.06 : 0));
      const maintChance = Math.max(0, 0.09 - 0.015 * (counts.cleaner || 0) - 0.015 * (counts.gardener || 0) + (condition < 60 ? 0.08 : 0));
      const r = Math.random();
      if (condition <= 10 || r < breakChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "breakdown", attractionId: pick.id, since: d + 1 });
      } else if (condition <= 32 || r < breakChance + maintChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "maintenance", attractionId: pick.id, since: d + 1 });
      }
    }
    setIncidents([...remaining, ...newIncidents]);
    if (currentDisaster?.id === "storm_damage") {
      for (const p of attractions) {
        nextCondition[p.idx] = Math.max(0, nextCondition[p.idx] - 12);
      }
    }
    setAttractionCondition(nextCondition);

    // --- Hotel / Resort simulation ---
    const placedHotels = prevGrid.map((id, idx) => {
      const def = getHotelDef(id);
      return def ? { def, tileIndex: idx } : null;
    }).filter(Boolean);
    let hotelResult = null;
    let newResortRating = stateRef.current.resortRating || 0;
    if (placedHotels.length > 0) {
      hotelResult = simulateHotelDay({
        hotels: placedHotels,
        hotelGuests: stateRef.current.hotelGuests || [],
        upgrades: currentUpgrades,
        day: d + 1,
        reputation: Math.round(newReputation),
        resortRating: stateRef.current.resortRating || 0,
        seasonEvent: currentSeasonEvent,
        weather: dayWeather,
        parkMood: visitorStats?.avgMood || 50,
        sandbox: isSandbox,
      });
      newResortRating = calculateResortRating(placedHotels, currentUpgrades);
      setHotelGuests(hotelResult.remainingGuests);
      setResortRating(newResortRating);
      const guestsByHotel = {};
      for (const h of placedHotels) {
        guestsByHotel[h.tileIndex] = hotelResult.remainingGuests.filter((g) => g.hotelTile === h.tileIndex).length;
      }
      setHotelStats({
        roomRevenue: hotelResult.roomRevenue,
        hotelExpenses: hotelResult.hotelExpenses,
        parkSpend: hotelResult.parkSpend,
        occupancy: hotelResult.occupancy,
        avgHappiness: hotelResult.avgHappiness,
        totalGuests: hotelResult.totalGuests,
        totalRooms: hotelResult.totalRooms,
        guestsByHotel,
      });
    }
    const hotelRoomRevenue = hotelResult?.roomRevenue || 0;
    const hotelParkSpend = hotelResult?.parkSpend || 0;
    const hotelExpensesAmount = hotelResult?.hotelExpenses || 0;

    const ticketRevenue = newGuests * currentTicketPrice * ticketResearchMult;
    const conditionIncomeMult = workingAttractions.length ? workingAttractions.reduce((sum, p) => sum + (0.72 + (nextCondition[p.idx] || 0) * 0.0028), 0) / workingAttractions.length : 0;
    const rideIncome = income * conditionIncomeMult *
      (dayWeather.incomeMult ?? 1) *
      (currentSeasonEvent?.incomeMult ?? 1) *
      (currentPriorityPass ? 1.08 : 1);
    const utilities = Math.round(
      (150 + attractions.length * 45 + facilities.length * 18 + newGuests * 2.2) *
      (dayWeather.utilityMult ?? 1)
    );
    const diffUpkeepMult = getDifficulty(getSettings().difficulty).upkeepMult;
    const expenses =
      (placedItems.filter((p) => p.attr.category !== "hotel").reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) * upkeepResearchMult +
      wages * (eff.wageMult ?? 1) * (1 - (fx.wageReduction || 0)) +
      utilities +
      currentAdBudget +
      (currentPriorityPass ? 120 : 0)) * diffUpkeepMult +
      hotelExpensesAmount;
    const grossIncome = Math.round(ticketRevenue + rideIncome + hotelRoomRevenue + hotelParkSpend);
    const upkeep = Math.round(placedItems.filter((p) => p.attr.category !== "hotel").reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) * upkeepResearchMult);
    const wageCost = Math.round(wages * (eff.wageMult ?? 1) * (1 - (fx.wageReduction || 0)));
    const marketingCost = currentAdBudget;
    const utilityCost = utilities;
    const premiumCost = currentPriorityPass ? 120 : 0;
    const net = isSandbox ? Math.round(grossIncome) : Math.round(grossIncome - expenses);

    // --- Build log entries (newest first) ---
    const entries = [];
    for (const inc of newIncidents) {
      const a = getParkItem(inc.attractionId);
      entries.push({
        day: d + 1,
        text:
          inc.type === "breakdown"
            ? `Day ${d + 1}: ⚠️ ${a.name} broke down! Hire mechanics to repair it.`
            : `Day ${d + 1}: 🔧 ${a.name} needs maintenance. Cleaners can speed it up.`,
      });
    }
    for (const inc of resolved) {
      const a = getParkItem(inc.attractionId);
      entries.push({
        day: d + 1,
        text:
          inc.type === "breakdown"
            ? `Day ${d + 1}: ✅ Mechanics repaired the ${a.name}!`
            : `Day ${d + 1}: ✅ Cleaners restored the ${a.name}.`,
      });
    }
    entries.push({
      day: d + 1,
      text:
        attractions.length === 0
          ? `Day ${d + 1}: No attractions yet — build something to draw guests!`
          : `Day ${d + 1}: ${newGuests} guests · income $${Math.round(
              income
            )} · upkeep $${expenses} · net ${net >= 0 ? "+" : ""}$${net}`,
    });
    if (hotelResult && placedHotels.length > 0) {
      entries.push({
        day: d + 1,
        text: `Day ${d + 1}: 🏨 Resort: ${hotelResult.totalGuests} guests · $${(hotelResult.roomRevenue + hotelResult.parkSpend).toLocaleString()} revenue · ${hotelResult.occupancy}% occupancy · ${hotelResult.avgHappiness}% happiness`,
      });
    }

    setMoney((m) => m + net);
    setDay((x) => x + 1);
    setWeather(dayWeather);
    setForecast(dayForecast);
    setGuests(newGuests);
    setPeakGuests((p) => Math.max(p, newGuests));
    setVisitorStats(visitorStats);
    if (dayFeedback.length) setFeedback((prev) => [...dayFeedback, ...prev].slice(0, 40));
    setLifetimeEarnings((e) => e + grossIncome);
    setReputation(Math.round(newReputation));
    setLastNet(net);
    const staffTotal = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
    const rpEarned = dailyResearchPoints(attractions.length, staffTotal);
    if (rpEarned > 0) setResearchPoints((rp) => rp + rpEarned);
    setHistory((h) =>
      [...h, {
        day: d + 1,
        income: grossIncome,
        guests: newGuests,
        reputation: Math.round(newReputation),
        net,
        ticketRevenue: Math.round(ticketRevenue),
        rideIncome: Math.round(rideIncome),
        upkeep,
        wages: wageCost,
        utilities: utilityCost,
        marketing: marketingCost,
        premium: premiumCost,
        weather: dayWeather.name,
        event: currentSeasonEvent?.name || null,
        parkAppeal: calculatedAppeal.score,
        hotelRevenue: hotelRoomRevenue + hotelParkSpend,
        hotelExpenses: hotelExpensesAmount,
      }].slice(-60)
    );
    setLog((l) => [...entries, ...l].slice(0, 12));

    // --- Resolve seasonal park events ---
    if (currentSeasonEvent) {
      const daysLeft = currentSeasonEvent.daysLeft - 1;
      if (daysLeft <= 0) {
        setSeasonEvent(null);
        setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: Event ended — ${currentSeasonEvent.name}.` }, ...l].slice(0, 12));
      } else {
        setSeasonEvent({ ...currentSeasonEvent, daysLeft });
      }
    } else {
      const nextEvent = rollSeasonEvent(d + 1);
      if (nextEvent) {
        setSeasonEvent({ ...nextEvent, daysLeft: nextEvent.duration });
        setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: ${nextEvent.name}! ${nextEvent.description}` }, ...l].slice(0, 12));
      }
    }

    // --- Resolve / advance / roll a random challenge ---
    const challengeEntries = [];
    if (currentChallenge) {
      const nextLeft = currentChallenge.daysLeft - 1;
      if (nextLeft <= 0) {
        if (currentChallenge.resolve?.type === "vip") {
          const r = currentChallenge.resolve;
          if (Math.round(newReputation) >= r.repRequired) {
            setMoney((m) => m + r.success.money);
            setReputation((rv) => Math.max(0, Math.min(100, rv + r.success.rep)));
            challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: 👑 VIP impressed! +$${r.success.money.toLocaleString()} and +${r.success.rep} reputation.` });
          } else {
            setReputation((rv) => Math.max(0, Math.min(100, rv + r.fail.rep)));
            challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: 👑 VIP left unimpressed. ${r.fail.rep} reputation.` });
          }
        } else {
          challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: ${currentChallenge.name} has passed.` });
        }
        setChallenge(null);
      } else {
        setChallenge({ ...currentChallenge, daysLeft: nextLeft });
      }
    } else if (d + 1 >= 3 && Math.random() < 0.18) {
      const picked = rollChallenge();
      setChallenge({ ...picked, daysLeft: picked.duration });
      challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: ⚡ ${picked.name}! ${picked.desc}` });
    }
    if (challengeEntries.length) {
      setLog((l) => [...challengeEntries, ...l].slice(0, 12));
    }

    // --- VIP guest visit: resolve an active visit, or occasionally spawn one ---
    const vipEntries = [];
    if (currentVipVisit) {
      const mood = visitorStats?.avgMood || 0;
      const score = mood * 0.5 + cleanliness * 25 + safety * 25;
      if (score >= 65) {
        const reward = Math.round(2000 + score * 30);
        setMoney((m) => m + reward);
        setReputation((rv) => Math.max(0, Math.min(100, rv + 3)));
        vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ VIP ${currentVipVisit.name} was impressed! +$${reward.toLocaleString()} and +3 reputation.` });
      } else if (score >= 40) {
        vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ VIP ${currentVipVisit.name} had a decent visit.` });
      } else {
        setReputation((rv) => Math.max(0, Math.min(100, rv - 2)));
        vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ VIP ${currentVipVisit.name} left disappointed. -2 reputation.` });
      }
      setVipVisit(null);
    } else if (attractions.length > 0 && d + 1 >= 5 && Math.random() < 0.08) {
      const vipNames = ["Ambassador Rivera", "Celebrity Chen", "Mayor Okafor", "Travel Blogger Sam", "Influencer Priya"];
      const name = vipNames[Math.floor(Math.random() * vipNames.length)];
      setVipVisit({ name, day: d + 1 });
      vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ A VIP guest arrived — ${name}! Impress them for a big reward.` });
    }
    if (vipEntries.length) {
      setLog((l) => [...vipEntries, ...l].slice(0, 12));
    }

    // --- Tick active marketing campaigns ---
    if (currentCampaigns.length) {
      const updatedCampaigns = [];
      const expiredEntries = [];
      for (const c of currentCampaigns) {
        const daysLeft = c.daysLeft - 1;
        if (daysLeft <= 0) {
          expiredEntries.push({ day: d + 1, text: `Day ${d + 1}: 📣 ${c.name} campaign ended.` });
        } else {
          updatedCampaigns.push({ ...c, daysLeft });
        }
      }
      setActiveCampaigns(updatedCampaigns);
      if (expiredEntries.length) setLog((l) => [...expiredEntries, ...l].slice(0, 12));
    }

    // --- Resolve / roll disasters ---
    if (!isSandbox) {
      const disasterEntries = [];
      if (currentDisaster) {
        const daysLeft = currentDisaster.daysLeft - 1;
        if (daysLeft <= 0) {
          setDisaster(null);
          setDisastersSurvived((n) => n + 1);
          disasterEntries.push({ day: d + 1, text: `Day ${d + 1}: ✅ ${currentDisaster.name} has passed.` });
        } else {
          setDisaster({ ...currentDisaster, daysLeft });
        }
      } else if (d + 1 >= 5) {
        const newDisaster = rollDisaster(d + 1, currentResearch);
        if (newDisaster) {
          const mitigation = disasterMitigation(newDisaster, counts, currentResearch);
          const adjustedDuration = Math.max(1, newDisaster.duration - Math.round(mitigation));
          setDisaster({ ...newDisaster, daysLeft: adjustedDuration });
          disasterEntries.push({ day: d + 1, text: `Day ${d + 1}: 🚨 ${newDisaster.name}! ${newDisaster.description}` });
        }
      }
      if (disasterEntries.length) {
        setLog((l) => [...disasterEntries, ...l].slice(0, 12));
      }
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(advanceDay, 30000 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, advanceDay]);

  const placeAttraction = useCallback(
    (index) => {
      if (!selectedBuild) return;
      const attr = getParkItem(selectedBuild);
      if (!attr) return;
      if (!sandbox && money < attr.cost) return;
      setGrid((g) => {
        if (g[index]) return g;
        const ng = [...g];
        ng[index] = selectedBuild;
        setParkAppeal(calculateParkAppeal({ grid: ng, zones: parkZones, getItem: getParkItem }));
        return ng;
      });
      if (!sandbox) setMoney((m) => m - attr.cost);
      if (attr.category === "attraction") {
        setBuiltAttractionIds((ids) => (ids.includes(selectedBuild) ? ids : [...ids, selectedBuild]));
      }
      setLastBuildAction({ index, id: selectedBuild, cost: attr.cost });
      trackEvent("attraction_built", { id: selectedBuild, category: attr.category, cost: attr.cost });
    },
    [selectedBuild, money, parkZones, sandbox]
  );

  const paintZone = useCallback((index) => {
    if (!selectedZone) return;
    setParkZones((z) => {
      const nz = [...z];
      nz[index] = selectedZone;
      setParkAppeal(calculateParkAppeal({ grid, zones: nz, getItem: getParkItem }));
      return nz;
    });
  }, [selectedZone, grid]);

  const handleTileClick = useCallback(
    (index) => {
      if (selectedZone) {
        paintZone(index);
      } else if (grid[index]) {
        setSelectedTile(index);
      } else if (selectedBuild) {
        placeAttraction(index);
      }
    },
    [grid, selectedBuild, selectedZone, placeAttraction, paintZone]
  );

  const sellAttraction = useCallback((index) => {
    setGrid((g) => {
      if (!g[index]) return g;
      const attr = getParkItem(g[index]);
      setMoney((m) => m + Math.floor((attr?.cost || 0) * 0.5));
      setUpgrades((u) => {
        const nu = [...u];
        nu[index] = 0;
        return nu;
      });
      setIncidents((items) => items.filter((item) => item.tileIndex !== index));
      setAttractionCondition((conditions) => { const next = [...conditions]; next[index] = 100; return next; });
      setParkZones((zones) => {
        const next = [...zones];
        next[index] = null;
        return next;
      });
      const ng = [...g];
      ng[index] = null;
      return ng;
    });
    setHotelGuests((guests) => guests.filter((g) => g.hotelTile !== index));
    trackEvent("attraction_sold", { id: grid[index] });
    setSelectedTile(null);
  }, []);

  const undoLastBuild = useCallback(() => {
    if (!lastBuildAction) return;
    const { index, id, cost } = lastBuildAction;
    setGrid((g) => {
      if (g[index] !== id) return g;
      const ng = [...g];
      ng[index] = null;
      return ng;
    });
    setMoney((m) => m + cost);
    setUpgrades((u) => { const nu = [...u]; nu[index] = 0; return nu; });
    setIncidents((items) => items.filter((item) => item.tileIndex !== index));
    setAttractionCondition((c) => { const next = [...c]; next[index] = 100; return next; });
    setParkZones((z) => { const next = [...z]; next[index] = null; return next; });
    setLastBuildAction(null);
    setSelectedTile(null);
    trackEvent("build_undone", { id });
  }, [lastBuildAction]);

  const upgradeAttraction = useCallback(
    (index) => {
      const id = grid[index];
      if (!id) return;
      const attr = getParkItem(id);
      if (!attr || attr.category === "environment") return;
      const level = upgrades[index] || 0;
      if (level >= MAX_UPGRADE) return;
      const cost = upgradeCost(attr.cost, level);
      if (!sandbox && money < cost) return;
      setUpgrades((u) => {
        const nu = [...u];
        nu[index] = level + 1;
        return nu;
      });
      if (!sandbox) setMoney((m) => m - cost);
      setTotalUpgrades((t) => t + 1);
      setXp((x) => x + 15);
      trackEvent("attraction_upgraded", { id, level: level + 1, cost });
    },
    [grid, upgrades, money, sandbox]
  );

  const hireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: (s[type] || 0) + 1 }));
    trackEvent("staff_hired", { type });
  }, []);

  const fireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: Math.max(0, (s[type] || 0) - 1) }));
    trackEvent("staff_fired", { type });
  }, []);

  const assignStaff = useCallback((type, zone) => {
    setStaffAssignments((current) => ({ ...current, [type]: zone || "" }));
    trackEvent("staff_assigned", { type, zone: zone || "park-wide" });
  }, []);

  const expandPark = useCallback(() => {
    if (expansionsDone >= MAX_EXPANSIONS) return;
    if (level < expandLevelReq(expansionsDone)) return;
    const cost = expandCost(expansionsDone);
    if (!sandbox && money < cost) return;
    setGrid((g) => [...g, ...Array(EXPAND_ROW).fill(null)]);
    setParkZones((z) => [...z, ...Array(EXPAND_ROW).fill(null)]);
    setUpgrades((u) => [...u, ...Array(EXPAND_ROW).fill(0)]);
    setAttractionCondition((conditions) => [...conditions, ...Array(EXPAND_ROW).fill(100)]);
    if (!sandbox) setMoney((m) => m - cost);
    setExpansionsDone((e) => e + 1);
    trackEvent("park_expanded", { expansions: expansionsDone + 1, cost });
  }, [expansionsDone, level, money, sandbox]);

  const toggleSandbox = useCallback(() => {
    setSandbox((prev) => {
      const next = !prev;
      saveSettings({ sandbox: next });
      return next;
    });
  }, []);

  const launchCampaign = useCallback((id) => {
    const def = getCampaign(id);
    if (!def) return;
    if (!sandbox && money < def.cost) return;
    const eff = campaignEffectiveness(def, grid);
    setActiveCampaigns((prev) => [
      ...prev,
      { id: def.id, name: def.name, daysLeft: def.duration, duration: def.duration, guestBoost: def.guestBoost, repBoost: def.repBoost, effectiveBoost: def.guestBoost * eff, target: def.target, startedDay: day },
    ]);
    if (!sandbox) setMoney((m) => m - def.cost);
    trackEvent("campaign_launched", { id, cost: def.cost });
  }, [grid, sandbox, day, money]);

  const chooseBuild = useCallback((id) => {
    setSelectedBuild(id);
    setSelectedZone(null);
  }, []);

  const chooseZone = useCallback((zoneId) => {
    setSelectedZone((current) => (current === zoneId ? null : zoneId));
    setSelectedBuild(null);
    setSelectedTile(null);
  }, []);

  const unlockResearch = useCallback((id) => {
    const node = RESEARCH.find((r) => r.id === id);
    if (!node || completedResearch.includes(id)) return;
    if (node.requires && !node.requires.every((r) => completedResearch.includes(r))) return;
    if (researchPoints < node.cost) return;
    setResearchPoints((rp) => rp - node.cost);
    setCompletedResearch((c) => [...c, id]);
    trackEvent("research_unlocked", { id, cost: node.cost });
  }, [completedResearch, researchPoints]);

  const applyCheat = useCallback((kind) => {
    if (kind === "cash") setMoney((m) => m + 50000);
    if (kind === "xp") setXp((x) => x + 500);
    if (kind === "reputation") setReputation(100);
    if (kind === "boost") {
      setMoney((m) => m + 250000);
      setXp((x) => x + 2500);
      setReputation(100);
    }
  }, []);

  const claimMission = useCallback(
    (id) => {
      const mission = MISSIONS.find((m) => m.id === id);
      if (!mission || claimedMissions.includes(id) || level < mission.level) return;
      const ms = {
        attractionCount: grid.filter((x) => x && getParkItem(x)?.category === "attraction").length,
        peakGuests,
        money,
        reputation,
        day,
        staffTotal: Object.values(staff).reduce((sum, n) => sum + (n || 0), 0),
        totalUpgrades,
        expansionsDone,
        maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
        parkAppeal: parkAppeal.score,
        themedZones: (parkAppeal.zones || []).filter((z) => z.quality >= 60).length,
        avgMood: visitorStats?.avgMood || 0,
        lifetimeEarnings,
      };
      if (missionProgress(mission, ms) < mission.target) return;
      setMoney((m) => m + mission.reward.money);
      setXp((x) => x + mission.reward.xp);
      setClaimedMissions((c) => [...c, id]);
      trackEvent("mission_claimed", { id, money: mission.reward.money, xp: mission.reward.xp });
    },
    [claimedMissions, level, grid, upgrades, peakGuests, money, reputation, day, staff, totalUpgrades, expansionsDone, parkAppeal, visitorStats, lifetimeEarnings]
  );

  const savePark = useCallback(
    (name) => {
      const trimmed = (name || "").trim();
      if (!trimmed) return false;
      const slots = readSlots();
      slots[trimmed] = {
        money,
        day,
        reputation,
        guests,
        grid,
        parkZones,
        history,
        staff,
        staffAssignments,
        attractionCondition,
        log,
        lastNet,
        incidents,
        upgrades,
        xp,
        expansionsDone,
        peakGuests,
        totalUpgrades,
        claimedMissions,
        challenge,
        lifetimeEarnings,
        builtAttractionIds,
        visitorStats,
        feedback,
        weather,
        forecast,
        seasonEvent,
        ticketPrice,
        adBudget,
        priorityPass,
        researchPoints,
        completedResearch,
        parkAppeal,
        disaster,
        disastersSurvived,
        activeCampaigns,
        hotelGuests,
        hotelStats,
        resortRating,
        savedAt: new Date().toISOString(),
      };
      writeSlots(slots);
      setSaves(Object.entries(slots).map(([n, s]) => slotMeta(n, s)));
      trackEvent("park_saved", { name: trimmed });
      return true;
    },
    [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, log, lastNet, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating]
  );

  const loadPark = useCallback((name) => {
    const slots = readSlots();
    const data = slots[name];
    if (!data) return;
    setMoney(data.money ?? INITIAL_MONEY);
    setDay(data.day ?? 1);
    setReputation(data.reputation ?? 50);
    setGuests(data.guests ?? 0);
    setGrid(data.grid ?? makeStartingGrid());
    setParkZones(data.parkZones ?? makeEmptyZones((data.grid ?? makeStartingGrid()).length));
    if (data.weather) setWeather(data.weather);
    if (data.forecast) setForecast(data.forecast);
    if (data.seasonEvent) setSeasonEvent(data.seasonEvent);
    if (data.ticketPrice != null) setTicketPrice(data.ticketPrice);
    if (data.adBudget != null) setAdBudget(data.adBudget);
    if (data.priorityPass != null) setPriorityPass(data.priorityPass);
    setHistory(data.history ?? []);
    setStaff({ ...DEFAULT_STAFF, ...(data.staff || {}) });
    setStaffAssignments(data.staffAssignments || {});
    setIncidents(data.incidents ?? []);
    setAttractionCondition(data.attractionCondition ?? Array((data.grid ?? makeStartingGrid()).length).fill(100));
    setUpgrades(data.upgrades ?? Array(GRID_SIZE).fill(0));
    setXp(data.xp ?? 0);
    setExpansionsDone(data.expansionsDone ?? 0);
    setPeakGuests(data.peakGuests ?? 0);
    setTotalUpgrades(data.totalUpgrades ?? 0);
    setClaimedMissions(data.claimedMissions ?? []);
    setChallenge(data.challenge ?? null);
    setLifetimeEarnings(data.lifetimeEarnings ?? 0);
    setBuiltAttractionIds(data.builtAttractionIds ?? []);
    setVisitorStats(data.visitorStats ?? { avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
    setFeedback(data.feedback ?? []);
    setResearchPoints(data.researchPoints ?? 0);
    setCompletedResearch(data.completedResearch ?? []);
    setParkAppeal(data.parkAppeal ?? calculateParkAppeal({ grid: data.grid ?? makeStartingGrid(), zones: data.parkZones ?? [], getItem: getParkItem }));
    if (data.disaster) setDisaster(data.disaster);
    if (data.disastersSurvived != null) setDisastersSurvived(data.disastersSurvived);
    if (data.activeCampaigns) setActiveCampaigns(data.activeCampaigns);
    if (data.hotelGuests) setHotelGuests(data.hotelGuests);
    if (data.hotelStats) setHotelStats(data.hotelStats);
    if (data.resortRating != null) setResortRating(data.resortRating);
    setLog(data.log ?? [{ day: 0, text: "Welcome back to your park!" }]);
    setLastNet(data.lastNet ?? 0);
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
    trackEvent("park_loaded", { name });
  }, []);

  const deleteSave = useCallback((name) => {
    const slots = readSlots();
    delete slots[name];
    writeSlots(slots);
    setSaves((prev) => prev.filter((s) => s.name !== name));
  }, []);

  const resetGame = useCallback((starterParkId = "empty_lot") => {
    const diff = getDifficulty(getSettings().difficulty);
    const park = getStarterPark(starterParkId);
    const baseMoney = park.money;
    const startGrid = park.grid && park.grid.length === GRID_SIZE ? [...park.grid] : makeStartingGrid();
    const startZones = makeEmptyZones(startGrid.length);
    const startUpgrades = Array(startGrid.length).fill(0);
    const startCondition = Array(startGrid.length).fill(100);
    const builtIds = [];
    const starterResearch = [];
    for (const id of startGrid) {
      if (id) {
        const item = getParkItem(id);
        if (item && item.category === "attraction" && !builtIds.includes(id)) builtIds.push(id);
        const req = researchReqFor(id);
        if (req && !starterResearch.includes(req.id)) starterResearch.push(req.id);
      }
    }
    setMoney(Math.round(baseMoney * diff.moneyMult));
    setDay(1);
    setReputation(park.reputation ?? 50);
    setGuests(0);
    setGrid(startGrid);
    setParkZones(startZones);
    setSelectedZone(null);
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
    setLastNet(0);
    setWeather(WEATHER[0]);
    setForecast(WEATHER[1]);
    setSeasonEvent(null);
    setTicketPrice(park.ticketPrice ?? DEFAULT_TICKET_PRICE);
    setAdBudget(park.adBudget ?? DEFAULT_AD_BUDGET);
    setPriorityPass(false);
    setLog([{ day: 0, text: `Welcome to ${park.name}! ${park.description}` }]);
    setHistory([]);
    setStaff(DEFAULT_STAFF);
    setStaffAssignments({});
    setIncidents([]);
    setAttractionCondition(startCondition);
    setUpgrades(startUpgrades);
    setXp(park.xp || 0);
    setExpansionsDone(0);
    setPeakGuests(0);
    setTotalUpgrades(0);
    setClaimedMissions([]);
    setChallenge(null);
    setLifetimeEarnings(0);
    setBuiltAttractionIds(builtIds);
    setVisitorStats({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
    setFeedback([]);
    setResearchPoints(0);
    setCompletedResearch(starterResearch);
    setParkAppeal(calculateParkAppeal({ grid: startGrid, zones: startZones, getItem: getParkItem }));
    setDisaster(null);
    setDisastersSurvived(0);
    setActiveCampaigns([]);
    setHotelGuests([]);
    setHotelStats({ roomRevenue: 0, hotelExpenses: 0, parkSpend: 0, occupancy: 0, avgHappiness: 0, totalGuests: 0, totalRooms: 0, guestsByHotel: {} });
    setResortRating(0);
    trackEvent("park_reset", { starterPark: park.id, level: park.level, money: baseMoney });
  }, []);

  return {
    money,
    day,
    reputation,
    guests,
    grid,
    playing,
    speed,
    weather,
    forecast,
    season: getSeason(day),
    seasonEvent,
    ticketPrice,
    adBudget,
    priorityPass,
    parkZones,
    selectedZone,
    selectedBuild,
    selectedTile,
    lastNet,
    log,
    history,
    staff,
    staffAssignments,
    assignStaff,
    incidents,
    attractionCondition,
    upgrades,
    upgradeAttraction,
    level,
    xp,
    xpForNext: xpForLevel(level),
    applyCheat,
    expansionsDone,
    gridSize,
    maxGridSize: MAX_GRID_SIZE,
    expandPark,
    peakGuests,
    totalUpgrades,
    claimedMissions,
    claimMission,
    challenge,
    vipVisit,
    lastBuildAction,
    undoLastBuild,
    lifetimeEarnings,
    visitorStats,
    feedback,
    researchPoints,
    completedResearch,
    parkAppeal,
    disaster,
    disastersSurvived,
    sandbox,
    toggleSandbox,
    activeCampaigns,
    launchCampaign,
    hotels: grid.map((id, idx) => { const def = getHotelDef(id); return def ? { def, tileIndex: idx } : null; }).filter(Boolean),
    hotelGuests,
    hotelStats,
    resortRating,
    unlockResearch,
    builtCount: builtAttractionIds.length,
    achievementState: {
      peakGuests,
      lifetimeEarnings,
      builtCount: builtAttractionIds.length,
      builtAttractionIds,
      maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
      expansionsDone,
      day,
      money,
      reputation,
      staffTotal: Object.values(staff).reduce((s, n) => s + (n || 0), 0),
      facilityCount: grid.filter((id) => id && getParkItem(id)?.category === "facility").length,
      avgMood: visitorStats?.avgMood || 0,
      avgSpendPerVisit: visitorStats?.avgSpendPerVisit || 0,
      disastersSurvived,
      sandboxUsed: sandbox,
    },
    missionState: {
      attractionCount: grid.filter((id) => id && getParkItem(id)?.category === "attraction").length,
      peakGuests,
      money,
      reputation,
      day,
      staffTotal: (staff.lifeguard || 0) + (staff.mechanic || 0) + (staff.cleaner || 0),
      totalUpgrades,
      expansionsDone,
      maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
      parkAppeal: parkAppeal.score,
      zonedTiles: (parkZones || []).filter(Boolean).length,
      themedZones: (parkAppeal.zones || []).filter((z) => z.quality >= 60).length,
    },
    ...staffEffects(staff),
    staffWages: staffWages(staff),
    estimatedUtilities: Math.round((150 + grid.filter((id) => id && getParkItem(id)?.category === "attraction").length * 45 + grid.filter((id) => id && getParkItem(id)?.category === "facility").length * 18 + guests * 2.2) * (weather?.utilityMult ?? 1)),
    GRID_SIZE,
    setPlaying,
    setSpeed,
    setTicketPrice,
    setAdBudget,
    setPriorityPass,
    setSelectedBuild: chooseBuild,
    setSelectedZone: chooseZone,
    paintZone,
    setSelectedTile,
    handleTileClick,
    sellAttraction,
    advanceDay,
    resetGame,
    hireStaff,
    fireStaff,
    saves,
    savePark,
    loadPark,
    deleteSave,
  };
}