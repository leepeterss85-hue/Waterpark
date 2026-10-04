import React, { useEffect, useMemo, useState } from "react";
import { getParkItem } from "@/data/gameData";
import PersonSprite from "@/components/game/PersonSprite";

const STAFF_ROLES = [
  { id: "lifeguard", color: "bg-red-500", label: "Lifeguard" },
  { id: "mechanic", color: "bg-orange-500", label: "Mechanic" },
  { id: "cleaner", color: "bg-emerald-600", label: "Cleaner" },
  { id: "security", color: "bg-slate-800", label: "Security" },
  { id: "entertainer", color: "bg-pink-500", label: "Entertainer" },
  { id: "fitness_coach", color: "bg-violet-600", label: "Fitness coach" },
  { id: "gardener", color: "bg-lime-600", label: "Groundskeeper" },
];

export default function GuestLayer({ grid, parkZones = [], guests = 0, movements = {}, queueStats = {}, staff = {}, staffAssignments = {}, incidents = [] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const timer = setInterval(() => setTick(value => value + 1), 1600); return () => clearInterval(timer); }, []);
  const rows = Math.max(1, Math.ceil(grid.length / 8));
  const targets = useMemo(() => grid.map((id, index) => id ? { index, id, attr: getParkItem(id) } : null).filter(Boolean), [grid]);
  const closed = new Set(incidents.filter(incident => incident.type === "breakdown").map(incident => incident.tileIndex));
  const destinations = targets.filter(target => target.attr?.category !== "environment" && !closed.has(target.index) && (movements[target.id] || 0) > 0);
  const entrance = targets.find(target => target.id === "park_entrance")?.index ?? Math.max(0, grid.length - 8);
  const entry = { x: entrance % 8 + .5, y: Math.floor(entrance / 8) + .65 };
  const position = (x, y) => ({ left: x / 8 * 100 + "%", top: y / rows * 100 + "%" });
  const walkers = Array.from({ length: Math.min(24, guests > 0 ? Math.max(4, Math.ceil(Math.sqrt(guests) * 1.7)) : 0) }, (_, i) => {
    const target = destinations[(i + Math.floor(tick / 10)) % Math.max(1, destinations.length)];
    if (!target) return null;
    const phase = (tick + i * 3) % 10, x = target.index % 8 + .12, y = Math.floor(target.index / 8) + .73;
    const inWater = target.attr.category === "attraction" && !["soft_play", "gem_mining"].includes(target.id);
    if (inWater && phase >= 4 && phase <= 7) return null;
    const spot = phase === 0 || phase === 9 ? entry : phase === 1 ? { x, y: entry.y } : phase === 2 ? { x, y: (entry.y + y) / 2 } : { x, y };
    const activity = phase >= 4 && phase <= 7 ? "waiting" : "walking";
    return <span key={"g" + i} className="park-pedestrian park-guest" data-activity={activity} data-destination={target.id} style={position(spot.x, spot.y)} title={`Guest ${activity === "waiting" ? "visiting" : "heading to"} ${target.attr.name}`}><PersonSprite activity={activity} variant={i} /></span>;
  });
  const personnel = STAFF_ROLES.flatMap((role, roleIndex) => {
    const assignment = staffAssignments[role.id] || "";
    const positions = targets.filter(target => !assignment || (parkZones[target.index] || "") === assignment);
    return Array.from({ length: Math.min(3, Math.max(0, staff[role.id] || 0)) }, (_, i) => {
      const target = positions[(i + tick + roleIndex) % Math.max(1, positions.length)];
      return target ? <span key={role.id + i} className="park-pedestrian park-staff" data-role={role.id} data-activity="walking" style={position(target.index % 8 + .88, Math.floor(target.index / 8) + .7)} title={role.label}><PersonSprite variant={roleIndex + 1} role={role.id} /></span> : null;
    });
  });
  return <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" data-people-layer>
    {walkers}{personnel}
    {guests > 0 && Object.entries(queueStats).filter(([, queue]) => queue.guests > 0).flatMap(([tileIndex, queue]) => Array.from({ length: Math.min(5, Math.max(1, Math.ceil(queue.guests / 5))) }, (_, i) => <span key={`q${tileIndex}-${i}`} className="park-pedestrian park-queue-guest" data-activity="waiting" title={`Queue: ${queue.guests} guests · ${queue.wait}m wait · rail capacity ${queue.queueCapacity ?? 8}${queue.overflow > 0 ? " · overflow " + queue.overflow : ""}`} style={position(Number(tileIndex) % 8 + .09 + i % 2 * .15, Math.floor(Number(tileIndex) / 8) + .28 + Math.floor(i / 2) * .16)}><PersonSprite activity="waiting" variant={i + 1} /></span>))}
  </div>;
}