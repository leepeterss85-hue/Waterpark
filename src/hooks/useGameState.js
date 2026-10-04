import { useState, useEffect, useCallback, useRef } from "react";
import {
  getParkItem, STAFF, MAX_UPGRADE, upgradeCost,
  INITIAL_GRID_SIZE, EXPAND_ROW, MAX_EXPANSIONS, MAX_GRID_SIZE,
  expandCost, expandLevelReq, levelFromXp, xpForLevel, staffWages, staffEffects,
} from "@/data/gameData";
import { WEATHER, getSeason, rollWeather, rollSeasonEvent } from "@/data/parkSystems";
import { MISSIONS, missionProgress } from "@/data/missions";
import { rollChallenge } from "@/data/challenges";
import { simulateVisits } from "@/data/visitorLogic";
import { trackEvent } from "@/lib/gameAnalytics";

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

  const level = levelFromXp(xp);
  const gridSize = grid.length;

  /** @type {import("react").MutableRefObject<Record<string, any>>} */
  const stateRef = useRef({});
  stateRef.current = { money, day, reputation, grid, staff, staffAssignments, incidents, upgrades, attractionCondition, challenge, parkZones, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass };

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
          JSON.stringify({ money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, incidents, attractionCondition, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass })
        );
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, incidents, attractionCondition, upgrades, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass]);

  // Load save slots list on mount
  useEffect(() => {
    const slots = readSlots();
    setSaves(Object.entries(slots).map(([name, s]) => slotMeta(name, s)));
  }, []);

  const advanceDay = useCallback(() => {
    const { grid: prevGrid, reputation: rep, day: d, staff: currentStaff, staffAssignments: currentAssignments, incidents: currentIncidents, upgrades: currentUpgrades, attractionCondition: currentCondition, challenge: currentChallenge, parkZones: currentZones, forecast: currentForecast, seasonEvent: currentSeasonEvent, ticketPrice: currentTicketPrice, adBudget: currentAdBudget, priorityPass: currentPriorityPass } = stateRef.current;
    const dayWeather = currentForecast || rollWeather(d + 1);
    const dayForecast = rollWeather(d + 2);
    const eff = currentChallenge?.effects || {};
    const placedItems = prevGrid
      .map((id, idx) => (id ? { id, idx, attr: getParkItem(id), level: (currentUpgrades || [])[idx] || 0 } : null))
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
    const cleanliness = fx.cleanliness;
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

    if (attractions.length > 0) {
      const demand = Math.floor(
        (rep / 100) * totalCapacity * 1.15 * (1 + d / 80) *
        (eff.guestMult ?? 1) *
        (dayWeather.guestMult ?? 1) *
        (currentSeasonEvent?.guestMult ?? 1) *
        (1 + currentAdBudget / 5000) *
        (hasEntrance ? 1 : 0.9) *
        Math.max(0.65, Math.min(1.25, 1.12 - (currentTicketPrice - 20) * 0.012))
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
      });
      income = sim.income;
      visitorStats = sim;

      const avgMood = sim.avgMood;
      let repDelta = 0;
      if (avgMood >= 70) repDelta += 1.5;
      else if (avgMood < 40) repDelta -= 1.5;
      else if (avgMood < 55) repDelta -= 0.5;
      if (facilities.some((f) => f.attr.id === "first_aid")) repDelta += 0.5;
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
      if (dayWeather.id === "rain") repDelta -= 0.8;
      else if (dayWeather.id === "sunny") repDelta += 0.35;
      repDelta += Math.min(1.5, scenicCount * 0.08 + pathCount * 0.03);
      if (hasEntrance) repDelta += 0.2;
      if (environment.filter((p) => currentZones?.[p.idx]).length >= 5) repDelta += 0.25;
      if (currentSeasonEvent) repDelta += currentSeasonEvent.repDelta || 0;
      newReputation = Math.max(0, Math.min(100, rep + repDelta));
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
    if (eligible.length > 0) {
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
    setAttractionCondition(nextCondition);

    const ticketRevenue = newGuests * currentTicketPrice;
    const conditionIncomeMult = workingAttractions.length ? workingAttractions.reduce((sum, p) => sum + (0.72 + (nextCondition[p.idx] || 0) * 0.0028), 0) / workingAttractions.length : 0;
    const rideIncome = income * conditionIncomeMult *
      (dayWeather.incomeMult ?? 1) *
      (currentSeasonEvent?.incomeMult ?? 1) *
      (currentPriorityPass ? 1.08 : 1);
    const utilities = Math.round(
      (150 + attractions.length * 45 + facilities.length * 18 + newGuests * 2.2) *
      (dayWeather.utilityMult ?? 1)
    );
    const expenses =
      placedItems.reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) +
      wages * (eff.wageMult ?? 1) +
      utilities +
      currentAdBudget +
      (currentPriorityPass ? 120 : 0);
    const grossIncome = Math.round(ticketRevenue + rideIncome);
    const upkeep = Math.round(placedItems.reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1));
    const wageCost = Math.round(wages * (eff.wageMult ?? 1));
    const marketingCost = currentAdBudget;
    const utilityCost = utilities;
    const premiumCost = currentPriorityPass ? 120 : 0;
    const net = Math.round(grossIncome - expenses);

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

    setMoney((m) => m + net);
    setDay((x) => x + 1);
    setWeather(dayWeather);
    setForecast(dayForecast);
    setGuests(newGuests);
    setPeakGuests((p) => Math.max(p, newGuests));
    setVisitorStats(visitorStats);
    setLifetimeEarnings((e) => e + grossIncome);
    setReputation(Math.round(newReputation));
    setLastNet(net);
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
      if (money < attr.cost) return;
      setGrid((g) => {
        if (g[index]) return g;
        const ng = [...g];
        ng[index] = selectedBuild;
        return ng;
      });
      setMoney((m) => m - attr.cost);
      if (attr.category === "attraction") {
        setBuiltAttractionIds((ids) => (ids.includes(selectedBuild) ? ids : [...ids, selectedBuild]));
      }
      trackEvent("attraction_built", { id: selectedBuild, category: attr.category, cost: attr.cost });
    },
    [selectedBuild, money]
  );

  const paintZone = useCallback((index) => {
    if (!selectedZone) return;
    setParkZones((z) => {
      const nz = [...z];
      nz[index] = selectedZone;
      return nz;
    });
  }, [selectedZone]);

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
    trackEvent("attraction_sold", { id: grid[index] });
    setSelectedTile(null);
  }, []);

  const upgradeAttraction = useCallback(
    (index) => {
      const id = grid[index];
      if (!id) return;
      const attr = getParkItem(id);
      if (!attr || attr.category === "environment") return;
      const level = upgrades[index] || 0;
      if (level >= MAX_UPGRADE) return;
      const cost = upgradeCost(attr.cost, level);
      if (money < cost) return;
      setUpgrades((u) => {
        const nu = [...u];
        nu[index] = level + 1;
        return nu;
      });
      setMoney((m) => m - cost);
      setTotalUpgrades((t) => t + 1);
      setXp((x) => x + 15);
      trackEvent("attraction_upgraded", { id, level: level + 1, cost });
    },
    [grid, upgrades, money]
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
    if (money < cost) return;
    setGrid((g) => [...g, ...Array(EXPAND_ROW).fill(null)]);
    setParkZones((z) => [...z, ...Array(EXPAND_ROW).fill(null)]);
    setUpgrades((u) => [...u, ...Array(EXPAND_ROW).fill(0)]);
    setAttractionCondition((conditions) => [...conditions, ...Array(EXPAND_ROW).fill(100)]);
    setMoney((m) => m - cost);
    setExpansionsDone((e) => e + 1);
    trackEvent("park_expanded", { expansions: expansionsDone + 1, cost });
  }, [expansionsDone, level, money]);

  const chooseBuild = useCallback((id) => {
    setSelectedBuild(id);
    setSelectedZone(null);
  }, []);

  const chooseZone = useCallback((zoneId) => {
    setSelectedZone((current) => (current === zoneId ? null : zoneId));
    setSelectedBuild(null);
    setSelectedTile(null);
  }, []);

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
      };
      if (missionProgress(mission, ms) < mission.target) return;
      setMoney((m) => m + mission.reward.money);
      setXp((x) => x + mission.reward.xp);
      setClaimedMissions((c) => [...c, id]);
      trackEvent("mission_claimed", { id, money: mission.reward.money, xp: mission.reward.xp });
    },
    [claimedMissions, level, grid, upgrades, peakGuests, money, reputation, day, staff, totalUpgrades, expansionsDone]
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
        weather,
        forecast,
        seasonEvent,
        ticketPrice,
        adBudget,
        priorityPass,
        savedAt: new Date().toISOString(),
      };
      writeSlots(slots);
      setSaves(Object.entries(slots).map(([n, s]) => slotMeta(n, s)));
      trackEvent("park_saved", { name: trimmed });
      return true;
    },
    [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, log, lastNet, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass]
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

  const resetGame = useCallback(() => {
    setMoney(INITIAL_MONEY);
    setDay(1);
    setReputation(50);
    setGuests(0);
    setGrid(makeStartingGrid());
    setParkZones(makeEmptyZones(GRID_SIZE));
    setSelectedZone(null);
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
    setLastNet(0);
    setWeather(WEATHER[0]);
    setForecast(WEATHER[1]);
    setSeasonEvent(null);
    setTicketPrice(DEFAULT_TICKET_PRICE);
    setAdBudget(DEFAULT_AD_BUDGET);
    setPriorityPass(false);
    setLog([{ day: 0, text: "New park started! Your entrance is ready — now build the attractions guests will come for." }]);
    setHistory([]);
    setStaff(DEFAULT_STAFF);
    setStaffAssignments({});
    setIncidents([]);
    setAttractionCondition(Array(GRID_SIZE).fill(100));
    setUpgrades(Array(GRID_SIZE).fill(0));
    setXp(0);
    setExpansionsDone(0);
    setPeakGuests(0);
    setTotalUpgrades(0);
    setClaimedMissions([]);
    setChallenge(null);
    setLifetimeEarnings(0);
    setBuiltAttractionIds([]);
    setVisitorStats({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
    trackEvent("park_reset");
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
    lifetimeEarnings,
    visitorStats,
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