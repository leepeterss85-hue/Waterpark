import { useState, useEffect, useCallback, useRef } from "react";
import { ATTRACTIONS, getAttraction, STAFF, MAX_UPGRADE, upgradeCost } from "@/data/gameData";

const STORAGE_KEY = "waterpark-tycoon-save-v1";
const SLOTS_KEY = "waterpark-tycoon-slots";
const GRID_SIZE = 48;
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

  const stateRef = useRef({});
  stateRef.current = { money, day, reputation, grid, staff, incidents, upgrades };

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
          JSON.stringify({ money, day, reputation, grid, history, staff, incidents, upgrades })
        );
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [money, day, reputation, grid, history, staff, incidents, upgrades]);

  // Load save slots list on mount
  useEffect(() => {
    const slots = readSlots();
    setSaves(Object.entries(slots).map(([name, s]) => slotMeta(name, s)));
  }, []);

  const advanceDay = useCallback(() => {
    const { grid: prevGrid, reputation: rep, day: d, staff: currentStaff, incidents: currentIncidents, upgrades: currentUpgrades } = stateRef.current;
    const placedItems = prevGrid
      .map((id, idx) => (id ? { id, idx, attr: getAttraction(id), level: (currentUpgrades || [])[idx] || 0 } : null))
      .filter(Boolean);
    const attractions = placedItems.filter((p) => p.attr.category === "attraction");
    const facilities = placedItems.filter((p) => p.attr.category === "facility");
    const capOf = (p) => p.attr.capacity * (1 + 0.2 * p.level);
    const incOf = (p) => p.attr.income * (1 + 0.15 * p.level);
    const funOf = (p) => Math.min(10, p.attr.fun + p.level * 0.5);
    const upkeepOf = (p) => p.attr.maintenance * (1 + 0.1 * p.level);

    const counts = currentStaff || { lifeguard: 0, mechanic: 0, cleaner: 0 };
    const uptime = Math.min(1, 0.65 + (counts.mechanic || 0) * 0.07);
    const safety = Math.min(1, 0.7 + (counts.lifeguard || 0) * 0.06);
    const cleanliness = Math.min(1, 0.6 + (counts.cleaner || 0) * 0.1);
    const staffWages =
      (counts.lifeguard || 0) * STAFF.lifeguard.wage +
      (counts.mechanic || 0) * STAFF.mechanic.wage +
      (counts.cleaner || 0) * STAFF.cleaner.wage;

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

    // --- Guests & income: broken attractions take no riders ---
    const workingAttractions = attractions.filter(
      (p) => incidentByTile.get(p.idx)?.type !== "breakdown"
    );
    const totalCapacity = workingAttractions.reduce((s, p) => s + capOf(p), 0);

    let newGuests = 0;
    let income = 0;
    let newReputation = rep;

    if (attractions.length > 0) {
      const demand = Math.floor(
        (rep / 100) * totalCapacity * 1.15 * (1 + d / 80)
      );
      newGuests = Math.min(demand, totalCapacity);
      const fillRatio = totalCapacity > 0 ? newGuests / totalCapacity : 0;
      const attractionIncome =
        attractions.reduce((s, p) => {
          const inc = incidentByTile.get(p.idx);
          let mult = 1;
          if (inc?.type === "breakdown") mult = 0;
          else if (inc?.type === "maintenance") mult = 0.5;
          return s + incOf(p) * fillRatio * mult;
        }, 0) * uptime;
      const facilityIncome = facilities.reduce(
        (s, f) => s + incOf(f) * Math.min(1, newGuests / 60),
        0
      );
      income = attractionIncome + facilityIncome;

      const avgFun =
        totalCapacity > 0
          ? workingAttractions.reduce((s, p) => s + funOf(p) * capOf(p), 0) /
            totalCapacity
          : 0;
      const overcrowded = newGuests > totalCapacity * 0.85;
      let repDelta = 0;
      if (avgFun >= 7) repDelta += 1.5;
      else if (avgFun < 4) repDelta -= 1;
      if (overcrowded) repDelta -= 2 * (1 - safety);
      if (facilities.some((f) => f.attr.id === "first_aid")) repDelta += 0.5;
      if (facilities.some((f) => f.attr.id === "dining")) repDelta += 0.5;
      if (facilities.some((f) => f.attr.id === "lockers")) repDelta += 0.3;
      repDelta += (cleanliness - 0.6) * 1.5;
      repDelta += (safety - 0.7) * 0.8;
      // ongoing incident reputation drain
      repDelta -= remaining.reduce(
        (s, inc) => s + (inc.type === "breakdown" ? 1.2 : 0.6),
        0
      );
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
      const breakChance = Math.max(0, 0.15 - 0.02 * (counts.mechanic || 0));
      const maintChance = Math.max(0, 0.12 - 0.02 * (counts.cleaner || 0));
      const r = Math.random();
      if (r < breakChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "breakdown", attractionId: pick.id, since: d + 1 });
      } else if (r < breakChance + maintChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "maintenance", attractionId: pick.id, since: d + 1 });
      }
    }
    setIncidents([...remaining, ...newIncidents]);

    const expenses = placedItems.reduce((s, p) => s + upkeepOf(p), 0) + staffWages;
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
    setReputation(Math.round(newReputation));
    setLastNet(net);
    setHistory((h) =>
      [...h, { day: d + 1, income: Math.round(income), guests: newGuests, reputation: Math.round(newReputation), net }].slice(-60)
    );
    setLog((l) => [...entries, ...l].slice(0, 12));
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
    },
    [grid, upgrades, money]
  );

  const hireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: (s[type] || 0) + 1 }));
  }, []);

  const fireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: Math.max(0, (s[type] || 0) - 1) }));
  }, []);

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
        savedAt: new Date().toISOString(),
      };
      writeSlots(slots);
      setSaves(Object.entries(slots).map(([n, s]) => slotMeta(n, s)));
      return true;
    },
    [money, day, reputation, guests, grid, history, staff, log, lastNet]
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
    uptime: Math.min(1, 0.65 + (staff.mechanic || 0) * 0.07),
    safety: Math.min(1, 0.7 + (staff.lifeguard || 0) * 0.06),
    cleanliness: Math.min(1, 0.6 + (staff.cleaner || 0) * 0.1),
    staffWages:
      (staff.lifeguard || 0) * STAFF.lifeguard.wage +
      (staff.mechanic || 0) * STAFF.mechanic.wage +
      (staff.cleaner || 0) * STAFF.cleaner.wage,
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