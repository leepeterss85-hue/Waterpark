import { useState, useEffect, useCallback, useRef } from "react";
import {
  ATTRACTIONS, getAttraction, STAFF, MAX_UPGRADE, upgradeCost,
  INITIAL_GRID_SIZE, EXPAND_ROW, MAX_EXPANSIONS, MAX_GRID_SIZE,
  expandCost, expandLevelReq, levelFromXp, xpForLevel, staffWages, staffEffects,
} from "@/data/gameData";
import { MISSIONS, missionProgress } from "@/data/missions";
import { rollChallenge } from "@/data/challenges";
import { simulateVisits } from "@/data/visitorLogic";

const STORAGE_KEY = "waterpark-tycoon-save-v1";
const SLOTS_KEY = "waterpark-tycoon-slots";
const GRID_SIZE = INITIAL_GRID_SIZE;
const INITIAL_MONEY = 50000;

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
  const [grid, setGrid] = useState(() => Array(GRID_SIZE).fill(null));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [lastNet, setLastNet] = useState(0);
  const [log, setLog] = useState([
    { day: 0, text: "Welcome to your new water park! Place an attraction to get started." },
  ]);
  const [history, setHistory] = useState([]);
  const [staff, setStaff] = useState({ lifeguard: 0, mechanic: 0, cleaner: 0 });
  const [saves, setSaves] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [upgrades, setUpgrades] = useState(() => Array(GRID_SIZE).fill(0));
  const [xp, setXp] = useState(0);
  const [expansionsDone, setExpansionsDone] = useState(0);
  const [peakGuests, setPeakGuests] = useState(0);
  const [totalUpgrades, setTotalUpgrades] = useState(0);
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [builtAttractionIds, setBuiltAttractionIds] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null });

  const level = levelFromXp(xp);
  const gridSize = grid.length;

  const stateRef = useRef({});
  stateRef.current = { money, day, reputation, grid, staff, incidents, upgrades, challenge };

  // Load saved game
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.money != null) setMoney(data.money);
        if (data.day != null) setDay(data.day);
        if (data.reputation != null) setReputation(data.reputation);
        if (data.grid) setGrid(data.grid);
        if (data.history) setHistory(data.history);
        if (data.staff) setStaff(data.staff);
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
          JSON.stringify({ money, day, reputation, grid, history, staff, incidents, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats })
        );
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [money, day, reputation, grid, history, staff, incidents, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats]);

  // Load save slots list on mount
  useEffect(() => {
    const slots = readSlots();
    setSaves(Object.entries(slots).map(([name, s]) => slotMeta(name, s)));
  }, []);

  const advanceDay = useCallback(() => {
    const { grid: prevGrid, reputation: rep, day: d, staff: currentStaff, incidents: currentIncidents, upgrades: currentUpgrades, challenge: currentChallenge } = stateRef.current;
    const eff = currentChallenge?.effects || {};
    const placedItems = prevGrid
      .map((id, idx) => (id ? { id, idx, attr: getAttraction(id), level: (currentUpgrades || [])[idx] || 0 } : null))
      .filter(Boolean);
    const attractions = placedItems.filter((p) => p.attr.category === "attraction");
    const facilities = placedItems.filter((p) => p.attr.category === "facility");
    const capOf = (p) => p.attr.capacity * (1 + 0.2 * p.level);
    const incOf = (p) => p.attr.income * (1 + 0.15 * p.level);
    const funOf = (p) => Math.min(10, p.attr.fun + p.level * 0.5);
    const upkeepOf = (p) => p.attr.maintenance * (1 + 0.1 * p.level);

    const counts = currentStaff || {};
    const fx = staffEffects(counts);
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
    for (const inc of currentIncidents || []) {
      const power = inc.type === "breakdown" ? mechPower : cleanPower;
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
    let visitorStats = { avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null };

    if (attractions.length > 0) {
      const demand = Math.floor(
        (rep / 100) * totalCapacity * 1.15 * (1 + d / 80) * (eff.guestMult ?? 1)
      );
      newGuests = Math.min(demand, totalCapacity);

      const sim = simulateVisits({
        demand: newGuests,
        placedItems,
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
      if (facilities.some((f) => f.attr.id === "lockers")) repDelta += 0.3;
      repDelta += (cleanliness - 0.6) * 1.5;
      repDelta += (safety - 0.7) * 0.8;
      repDelta += (counts.gardener || 0) * 0.1;
      repDelta -= remaining.reduce(
        (s, inc) => s + (inc.type === "breakdown" ? 1.2 : 0.6),
        0
      );
      repDelta += eff.repDelta ?? 0;
      newReputation = Math.max(0, Math.min(100, rep + repDelta));
    } else {
      newReputation = Math.max(0, rep - 1);
    }

    // --- Roll at most one new incident per day (staff reduce the odds) ---
    const incidentTiles = new Set(remaining.map((i) => i.tileIndex));
    const eligible = attractions.filter((p) => !incidentTiles.has(p.idx));
    const newIncidents = [];
    if (eligible.length > 0) {
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      const breakChance = Math.max(0, 0.15 - 0.02 * (counts.mechanic || 0) - 0.02 * (counts.security || 0));
      const maintChance = Math.max(0, 0.12 - 0.02 * (counts.cleaner || 0) - 0.02 * (counts.gardener || 0));
      const r = Math.random();
      if (r < breakChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "breakdown", attractionId: pick.id, since: d + 1 });
      } else if (r < breakChance + maintChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "maintenance", attractionId: pick.id, since: d + 1 });
      }
    }
    setIncidents([...remaining, ...newIncidents]);

    const expenses =
      placedItems.reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) +
      wages * (eff.wageMult ?? 1);
    const net = Math.round(income - expenses);

    // --- Build log entries (newest first) ---
    const entries = [];
    for (const inc of newIncidents) {
      const a = getAttraction(inc.attractionId);
      entries.push({
        day: d + 1,
        text:
          inc.type === "breakdown"
            ? `Day ${d + 1}: ⚠️ ${a.name} broke down! Hire mechanics to repair it.`
            : `Day ${d + 1}: 🔧 ${a.name} needs maintenance. Cleaners can speed it up.`,
      });
    }
    for (const inc of resolved) {
      const a = getAttraction(inc.attractionId);
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
    setGuests(newGuests);
    setPeakGuests((p) => Math.max(p, newGuests));
    setVisitorStats(visitorStats);
    setLifetimeEarnings((e) => e + Math.round(income));
    setReputation(Math.round(newReputation));
    setLastNet(net);
    setHistory((h) =>
      [...h, { day: d + 1, income: Math.round(income), guests: newGuests, reputation: Math.round(newReputation), net }].slice(-60)
    );
    setLog((l) => [...entries, ...l].slice(0, 12));

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
    const interval = setInterval(advanceDay, 4000 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, advanceDay]);

  const placeAttraction = useCallback(
    (index) => {
      if (!selectedBuild) return;
      const attr = getAttraction(selectedBuild);
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
    },
    [selectedBuild, money]
  );

  const handleTileClick = useCallback(
    (index) => {
      if (grid[index]) {
        setSelectedTile(index);
      } else if (selectedBuild) {
        placeAttraction(index);
      }
    },
    [grid, selectedBuild, placeAttraction]
  );

  const sellAttraction = useCallback((index) => {
    setGrid((g) => {
      if (!g[index]) return g;
      const attr = getAttraction(g[index]);
      setMoney((m) => m + Math.floor(attr.cost * 0.5));
      setUpgrades((u) => {
        const nu = [...u];
        nu[index] = 0;
        return nu;
      });
      const ng = [...g];
      ng[index] = null;
      return ng;
    });
    setSelectedTile(null);
  }, []);

  const upgradeAttraction = useCallback(
    (index) => {
      const id = grid[index];
      if (!id) return;
      const attr = getAttraction(id);
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
    },
    [grid, upgrades, money]
  );

  const hireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: (s[type] || 0) + 1 }));
  }, []);

  const fireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: Math.max(0, (s[type] || 0) - 1) }));
  }, []);

  const expandPark = useCallback(() => {
    if (expansionsDone >= MAX_EXPANSIONS) return;
    if (level < expandLevelReq(expansionsDone)) return;
    const cost = expandCost(expansionsDone);
    if (money < cost) return;
    setGrid((g) => [...g, ...Array(EXPAND_ROW).fill(null)]);
    setUpgrades((u) => [...u, ...Array(EXPAND_ROW).fill(0)]);
    setMoney((m) => m - cost);
    setExpansionsDone((e) => e + 1);
  }, [expansionsDone, level, money]);

  const claimMission = useCallback(
    (id) => {
      const mission = MISSIONS.find((m) => m.id === id);
      if (!mission || claimedMissions.includes(id) || level < mission.level) return;
      const ms = {
        attractionCount: grid.filter((x) => x && getAttraction(x)?.category === "attraction").length,
        peakGuests,
        money,
        reputation,
        day,
        staffTotal: (staff.lifeguard || 0) + (staff.mechanic || 0) + (staff.cleaner || 0),
        totalUpgrades,
        expansionsDone,
        maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
      };
      if (missionProgress(mission, ms) < mission.target) return;
      setMoney((m) => m + mission.reward.money);
      setXp((x) => x + mission.reward.xp);
      setClaimedMissions((c) => [...c, id]);
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
        history,
        staff,
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
        savedAt: new Date().toISOString(),
      };
      writeSlots(slots);
      setSaves(Object.entries(slots).map(([n, s]) => slotMeta(n, s)));
      return true;
    },
    [money, day, reputation, guests, grid, history, staff, log, lastNet, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats]
  );

  const loadPark = useCallback((name) => {
    const slots = readSlots();
    const data = slots[name];
    if (!data) return;
    setMoney(data.money ?? INITIAL_MONEY);
    setDay(data.day ?? 1);
    setReputation(data.reputation ?? 50);
    setGuests(data.guests ?? 0);
    setGrid(data.grid ?? Array(GRID_SIZE).fill(null));
    setHistory(data.history ?? []);
    setStaff(data.staff ?? { lifeguard: 0, mechanic: 0, cleaner: 0 });
    setIncidents(data.incidents ?? []);
    setUpgrades(data.upgrades ?? Array(GRID_SIZE).fill(0));
    setXp(data.xp ?? 0);
    setExpansionsDone(data.expansionsDone ?? 0);
    setPeakGuests(data.peakGuests ?? 0);
    setTotalUpgrades(data.totalUpgrades ?? 0);
    setClaimedMissions(data.claimedMissions ?? []);
    setChallenge(data.challenge ?? null);
    setLifetimeEarnings(data.lifetimeEarnings ?? 0);
    setBuiltAttractionIds(data.builtAttractionIds ?? []);
    setVisitorStats(data.visitorStats ?? { avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null });
    setLog(data.log ?? [{ day: 0, text: "Welcome back to your park!" }]);
    setLastNet(data.lastNet ?? 0);
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
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
    setGrid(Array(GRID_SIZE).fill(null));
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
    setLastNet(0);
    setLog([{ day: 0, text: "New park started! Place an attraction to begin." }]);
    setHistory([]);
    setStaff({ lifeguard: 0, mechanic: 0, cleaner: 0 });
    setIncidents([]);
    setUpgrades(Array(GRID_SIZE).fill(0));
    setXp(0);
    setExpansionsDone(0);
    setPeakGuests(0);
    setTotalUpgrades(0);
    setClaimedMissions([]);
    setChallenge(null);
    setLifetimeEarnings(0);
    setBuiltAttractionIds([]);
    setVisitorStats({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null });
  }, []);

  return {
    money,
    day,
    reputation,
    guests,
    grid,
    playing,
    speed,
    selectedBuild,
    selectedTile,
    lastNet,
    log,
    history,
    staff,
    incidents,
    upgrades,
    upgradeAttraction,
    level,
    xp,
    xpForNext: xpForLevel(level),
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
      facilityCount: grid.filter((id) => id && getAttraction(id)?.category === "facility").length,
      avgMood: visitorStats?.avgMood || 0,
      avgSpendPerVisit: visitorStats?.avgSpendPerVisit || 0,
    },
    missionState: {
      attractionCount: grid.filter((id) => id && getAttraction(id)?.category === "attraction").length,
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
    GRID_SIZE,
    setPlaying,
    setSpeed,
    setSelectedBuild,
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