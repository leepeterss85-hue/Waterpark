import React, { useEffect, useMemo, useState } from "react";

const STAFF_ROLES = [
  { id: "lifeguard", color: "bg-red-500", label: "Lifeguard" },
  { id: "mechanic", color: "bg-orange-500", label: "Mechanic" },
  { id: "cleaner", color: "bg-emerald-600", label: "Cleaner" },
  { id: "security", color: "bg-slate-800", label: "Security" },
  { id: "entertainer", color: "bg-pink-500", label: "Entertainer" },
  { id: "fitness_coach", color: "bg-violet-600", label: "Fitness coach" },
  { id: "gardener", color: "bg-lime-600", label: "Groundskeeper" },
];

export default function GuestLayer({ grid, parkZones = [], guests = 0, movements = {}, queueStats = {}, staff = {}, staffAssignments = {} }) {
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
    const col = target.index % 8, row = Math.floor(target.index / 8);
    return { id: index, left: ((col + 0.5) / 8) * 100, top: ((row + 0.5) / rows) * 100 };
  });
  const staffDots = STAFF_ROLES.flatMap((role, roleIndex) => {
    const count = Math.max(0, staff?.[role.id] || 0);
    const assignment = staffAssignments?.[role.id] || "";
    const roleTargets = targets.filter((target) => !assignment || (parkZones?.[target.index] || "") === assignment);
    const positions = roleTargets.length ? roleTargets : (assignment ? [] : targets);
    return Array.from({ length: Math.min(3, count) }, (_, index) => {
      const target = positions[(index + tick + roleIndex) % Math.max(1, positions.length)];
      if (!target) return null;
      const col = target.index % 8, row = Math.floor(target.index / 8);
      return { id: role.id + "-" + index, role: role.label, color: role.color, left: ((col + 0.28 + index * 0.08) / 8) * 100, top: ((row + 0.28 + roleIndex * 0.06) / rows) * 100 };
    }).filter(Boolean);
  });
  const queues = Object.entries(queueStats || {}).filter(([, queue]) => queue?.guests > 0);
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {guestDots.map((guest) => <span key={"g" + guest.id} className="guest-marker absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-fuchsia-400 shadow-md transition-[left,top] ease-in-out" style={{ left: guest.left + "%", top: guest.top + "%", transform: "translate(-50%,-50%)", transitionDuration: "1800ms" }}><span className="absolute left-1/2 top-0.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/90" /></span>)}
      {queues.map(([tileIndex, queue]) => {
        const col = Number(tileIndex) % 8, row = Math.floor(Number(tileIndex) / 8);
        const count = Math.min(5, Math.max(1, Math.ceil(queue.guests / 5)));
        return Array.from({ length: count }, (_, index) => <span key={"q" + tileIndex + "-" + index} title={"Queue: " + queue.guests + " guests · estimated wait " + queue.wait + " min · rail capacity " + (queue.queueCapacity ?? 8) + (queue.overflow > 0 ? " · overflow " + queue.overflow : "")} className={`absolute h-2.5 w-2.5 rounded-full border border-white shadow ${queue.overflow > 0 ? "bg-rose-500" : "bg-amber-300"}`} style={{ left: (((col + 0.5 + (index % 2) * 0.13) / 8) * 100) + "%", top: (((row + 0.5 + Math.floor(index / 2) * 0.13) / rows) * 100) + "%", transform: "translate(-50%,-50%)" }} />);
      })}
      {staffDots.map((person) => <span key={"s" + person.id} title={person.role} className={`staff-marker absolute h-3 w-3 rounded-full border-2 border-white shadow-md transition-[left,top] ease-in-out ${person.color}`} style={{ left: person.left + "%", top: person.top + "%", transform: "translate(-50%,-50%)", transitionDuration: "1800ms" }} />)}
    </div>
  );
}
