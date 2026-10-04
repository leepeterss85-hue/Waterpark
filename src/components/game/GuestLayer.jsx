import React, { useEffect, useMemo, useState } from "react";

export default function GuestLayer({ grid, guests = 0, movements = {}, staffTotal = 0 }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((v) => v + 1), 2200); return () => clearInterval(id); }, []);
  const rows = Math.max(1, Math.ceil(grid.length / 8));
  const targets = useMemo(() => grid.map((id, index) => id ? { index, id, weight: movements[id] || 1 } : null).filter(Boolean), [grid, movements]);
  const visibleGuests = Math.min(18, guests > 0 ? Math.max(4, Math.ceil(Math.sqrt(guests) * 1.7)) : 0);
  const guestDots = Array.from({ length: visibleGuests }, (_, i) => {
    const target = targets.length ? targets[(i * 3 + tick + Math.floor(i / 4)) % targets.length] : { index: 0 };
    const col = target.index % 8;
    const row = Math.floor(target.index / 8);
    return { i, left: ((col + 0.5) / 8) * 100, top: ((row + 0.5) / rows) * 100 };
  });
  const visibleStaff = Math.min(8, staffTotal);
  const staffDots = Array.from({ length: visibleStaff }, (_, i) => {
    const target = targets.length ? targets[(i * 5 + tick + 1) % targets.length] : { index: 0 };
    const col = target.index % 8;
    const row = Math.floor(target.index / 8);
    return { i, left: ((col + 0.35) / 8) * 100, top: ((row + 0.35) / rows) * 100 };
  });
  return <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
    {guestDots.map((g) => <span key={"g"+g.i} className="absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-fuchsia-400 shadow-md transition-[left,top] duration-[1800ms] ease-in-out" style={{ left: g.left + "%", top: g.top + "%", transform: "translate(-50%,-50%)" }}><span className="absolute left-1/2 top-0.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" /></span>)}
    {staffDots.map((g) => <span key={"s"+g.i} className="absolute h-3 w-3 rounded-full border-2 border-white bg-sky-700 shadow-md transition-[left,top] duration-[1800ms] ease-in-out" style={{ left: g.left + "%", top: g.top + "%", transform: "translate(-50%,-50%)" }} />)}
  </div>;
}