import React, { useEffect, useMemo, useState } from "react";

export default function GuestLayer({ grid, guests = 0, movements = {}, queueStats = {}, staffTotal = 0 }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 2200);
    return () => clearInterval(id);
  }, []);
  const rows = Math.max(1, Math.ceil(grid.length / 8));
  const targets = useMemo(() => grid.map((id, index) => id ? { index, id, weight: movements[id] || 1 } : null).filter(Boolean), [grid, movements]);
  const visibleGuests = Math.min(18, guests > 0 ? Math.max(4, Math.ceil(Math.sqrt(guests) * 1.7)) : 0);
  const guestDots = Array.from({ length: visibleGuests }, (_, index) => {
    const target = targets.length ? targets[(index * 3 + tick + Math.floor(index / 4)) % targets.length] : { index: 0 };
    const col = target.index % 8;
    const row = Math.floor(target.index / 8);
    return { id: index, left: ((col + 0.5) / 8) * 100, top: ((row + 0.5) / rows) * 100 };
  });
  const staffDots = Array.from({ length: Math.min(8, staffTotal) }, (_, index) => {
    const target = targets.length ? targets[(index * 5 + tick + 1) % targets.length] : { index: 0 };
    const col = target.index % 8;
    const row = Math.floor(target.index / 8);
    return { id: index, left: ((col + 0.35) / 8) * 100, top: ((row + 0.35) / rows) * 100 };
  });
  const queues = Object.entries(queueStats || {}).filter(([, queue]) => queue?.guests > 0);
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {guestDots.map((guest) => <span key={"g" + guest.id} className="guest-marker absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-fuchsia-400 shadow-md transition-[left,top] ease-in-out" style={{ left: guest.left + "%", top: guest.top + "%", transform: "translate(-50%,-50%)", transitionDuration: "1800ms" }}><span className="absolute left-1/2 top-0.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" /></span>)}
      {queues.map(([tileIndex, queue]) => {
        const col = Number(tileIndex) % 8;
        const row = Math.floor(Number(tileIndex) / 8);
        const count = Math.min(5, Math.max(1, Math.ceil(queue.guests / 5)));
        return Array.from({ length: count }, (_, index) => <span key={"q" + tileIndex + "-" + index} title={"Queue: " + queue.guests + " guests"} className="absolute h-2.5 w-2.5 rounded-full border border-white bg-amber-300 shadow" style={{ left: (((col + 0.5 + (index % 2) * 0.13) / 8) * 100) + "%", top: (((row + 0.5 + Math.floor(index / 2) * 0.13) / rows) * 100) + "%", transform: "translate(-50%,-50%)" }} />);
      })}
      {staffDots.map((staff) => <span key={"s" + staff.id} className="staff-marker absolute h-3 w-3 rounded-full border-2 border-white bg-sky-700 shadow-md transition-[left,top] ease-in-out" style={{ left: staff.left + "%", top: staff.top + "%", transform: "translate(-50%,-50%)", transitionDuration: "1800ms" }} />)}
    </div>
  );
}
