import { useState, useEffect, useCallback, useRef } from "react";
import { ATTRACTIONS, getAttraction } from "@/data/gameData";

const STORAGE_KEY = "waterpark-tycoon-save-v1";
const GRID_SIZE = 48;
const INITIAL_MONEY = 50000;

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

  const stateRef = useRef({});
  stateRef.current = { money, day, reputation, grid };

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
          JSON.stringify({ money, day, reputation, grid })
        );
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [money, day, reputation, grid]);

  const advanceDay = useCallback(() => {
    const { grid: prevGrid, reputation: rep, day: d } = stateRef.current;
    const placed = prevGrid.filter(Boolean).map(getAttraction).filter(Boolean);
    const attractions = placed.filter((a) => a.category === "attraction");
    const facilities = placed.filter((a) => a.category === "facility");
    const totalCapacity = attractions.reduce((s, a) => s + a.capacity, 0);

    let newGuests = 0;
    let income = 0;
    let newReputation = rep;

    if (attractions.length > 0) {
      const demand = Math.floor(
        (rep / 100) * totalCapacity * 1.15 * (1 + d / 80)
      );
      newGuests = Math.min(demand, totalCapacity);
      const fillRatio = totalCapacity > 0 ? newGuests / totalCapacity : 0;
      const attractionIncome = attractions.reduce(
        (s, a) => s + a.income * fillRatio,
        0
      );
      const facilityIncome = facilities.reduce(
        (s, f) => s + f.income * Math.min(1, newGuests / 60),
        0
      );
      income = attractionIncome + facilityIncome;

      const avgFun =
        attractions.reduce((s, a) => s + a.fun * a.capacity, 0) / totalCapacity;
      const overcrowded = newGuests > totalCapacity * 0.85;
      let repDelta = 0;
      if (avgFun >= 7) repDelta += 1.5;
      else if (avgFun < 4) repDelta -= 1;
      if (overcrowded) repDelta -= 2;
      if (facilities.some((f) => f.id === "first_aid")) repDelta += 0.5;
      if (facilities.some((f) => f.id === "dining")) repDelta += 0.5;
      if (facilities.some((f) => f.id === "lockers")) repDelta += 0.3;
      newReputation = Math.max(0, Math.min(100, rep + repDelta));
    } else {
      newReputation = Math.max(0, rep - 1);
    }

    const expenses = placed.reduce((s, a) => s + a.maintenance, 0);
    const net = Math.round(income - expenses);

    setMoney((m) => m + net);
    setDay((x) => x + 1);
    setGuests(newGuests);
    setReputation(Math.round(newReputation));
    setLastNet(net);
    setLog((l) =>
      [
        {
          day: d + 1,
          text:
            attractions.length === 0
              ? `Day ${d + 1}: No attractions yet — build something to draw guests!`
              : `Day ${d + 1}: ${newGuests} guests · income $${Math.round(
                  income
                )} · upkeep $${expenses} · net ${net >= 0 ? "+" : ""}$${net}`,
        },
        ...l,
      ].slice(0, 10)
    );
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
      const ng = [...g];
      ng[index] = null;
      return ng;
    });
    setSelectedTile(null);
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
    GRID_SIZE,
    setPlaying,
    setSpeed,
    setSelectedBuild,
    setSelectedTile,
    handleTileClick,
    sellAttraction,
    advanceDay,
    resetGame,
  };
}