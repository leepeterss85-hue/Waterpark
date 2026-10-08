import React, { useEffect, useMemo, useState } from "react";
import { getParkItem } from "@/data/gameData";
import { isWaterAttraction } from "@/data/waterQuality";
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

export default function GuestLayer({ grid, parkZones = [], guests = 0, movements = {}, queueStats = {}, staff = {}, staffAssignments = {}, incidents = [], attractionCondition = [], hotelGuests = [] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const timer = setInterval(() => setTick(value => value + 1), 1600); return () => clearInterval(timer); }, []);
  const rows = Math.max(1, Math.ceil(grid.length / 8));
  const targets = useMemo(() => grid.map((id, index) => id ? { index, id, attr: getParkItem(id) } : null).filter(Boolean), [grid]);
  const closed = new Set(incidents.filter(incident => incident.type === "breakdown").map(incident => incident.tileIndex));
  const destinations = targets.filter(target => target.attr?.category !== "environment" && !closed.has(target.index) && (movements[target.id] || 0) > 0);
  const entrance = targets.find(target => target.id === "park_entrance")?.index ?? Math.max(0, grid.length - 8);
  const entry = { x: entrance % 8 + .5, y: Math.floor(entrance / 8) + .65 };
  const position = (x, y) => ({ left: x / 8 * 100 + "%", top: y / rows * 100 + "%" });
  const walkers = Array.from({ length: Math.min(40, guests > 0 ? Math.max(6, Math.ceil(Math.sqrt(guests) * 2.2)) : 0) }, (_, i) => {
    const target = destinations[(i + Math.floor(tick / 10)) % Math.max(1, destinations.length)];
    if (!target) return null;
    const phase = (tick + i * 3) % 10, x = target.index % 8 + .3, y = Math.floor(target.index / 8) + .73;
    const inWater = target.attr.category === "attraction" && !["soft_play", "gem_mining"].includes(target.id);
    if (inWater && phase >= 4 && phase <= 7) return null;
    const spot = phase === 0 || phase === 9 ? entry : phase === 1 ? { x, y: entry.y } : phase === 2 ? { x, y: (entry.y + y) / 2 } : { x, y };
    const isFood = ["dining","burger_shack","pizza_stand","ice_cream","coffee_bar","beach_bar","smoothie_bar","juice_bar","sushi_bar"].includes(target.id);
    const isRelax = ["sun_lounge","spa","hot_tub","sauna","beach_lounging","cabanas"].includes(target.id);
    const activity = inWater && phase >= 4 && phase <= 7 ? (target.id === "lazy_river" ? "floating" : "swimming") :
      isFood && phase >= 4 && phase <= 7 ? "eating" :
      isRelax && phase >= 4 && phase <= 7 ? "resting" :
      phase >= 4 && phase <= 7 ? "waiting" : "walking";
    return <span key={"g" + i} className="park-pedestrian park-guest" data-activity={activity} data-destination={target.id} data-guest-activity={activity} style={position(spot.x + (i % 3 - 1) * .18, spot.y)} title={`Guest ${activity === "waiting" ? "visiting" : "heading to"} ${target.attr.name}`}><PersonSprite activity={activity} variant={i} /></span>;
  });
  const personnel = STAFF_ROLES.flatMap((role, roleIndex) => {
    const assignment = staffAssignments[role.id] || "";
    let positions = targets.filter(target => !assignment || (parkZones[target.index] || "") === assignment);
    // Role-aware placement: staff gravitate to the things they actually work on,
    // so the map shows lifeguards by pools, mechanics at degrading rides, cleaners at facilities.
    if (!assignment) {
      if (role.id === "lifeguard") positions = positions.filter(t => t.attr?.category === "attraction" && isWaterAttraction(t.id));
      else if (role.id === "mechanic") positions = positions.filter(t => t.attr?.category === "attraction" && (attractionCondition[t.index] ?? 100) < 75);
      else if (role.id === "cleaner") positions = positions.filter(t => t.attr?.category === "facility" || (attractionCondition[t.index] ?? 100) < 50);
      // fall back to all targets if the role-specific set is empty (nothing to work on yet)
      if (!positions.length) positions = targets.filter(target => !assignment || (parkZones[target.index] || "") === assignment);
    }
    return Array.from({ length: Math.min(3, Math.max(0, staff[role.id] || 0)) }, (_, i) => {
      const target = positions[(i + tick + roleIndex) % Math.max(1, positions.length)];
      return target ? <span key={role.id + i} className="park-pedestrian park-staff" data-role={role.id} data-activity="working" style={position(target.index % 8 + .8, Math.floor(target.index / 8) + .7)} title={role.label + " on duty"}><PersonSprite variant={roleIndex + 1} role={role.id} /></span> : null;
    });
  });
  // Hotel guests: visible resort visitors with luggage travelling between
  // their hotel and park attractions, so occupancy isn't just a number.
  const hotelTiles = targets.filter((t) => t.attr?.category === "hotel");
  const hotelSprites = hotelGuests.slice(0, 8).map((hg, i) => {
    const hotel = hotelTiles.find((h) => h.index === hg.hotelTile);
    if (!hotel) return null;
    const dest = destinations[(i + tick) % Math.max(1, destinations.length)] || hotel;
    const phase = (tick + i * 2) % 10;
    // 0-2: at hotel, 3-6: walking to park, 7-9: returning
    const hx = hotel.index % 8 + .5, hy = Math.floor(hotel.index / 8) + .5;
    const dx = dest.index % 8 + .5, dy = Math.floor(dest.index / 8) + .7;
    const t = phase < 3 ? 0 : phase < 7 ? (phase - 3) / 4 : 1 - (phase - 7) / 3;
    const x = hx + (dx - hx) * t, y = hy + (dy - hy) * t;
    const atHotel = phase < 3 || phase >= 7;
    return <span key={"hg" + i} className="hotel-guest-sprite" style={position(x, y)} title={`Hotel guest (${hg.tier}) — ${atHotel ? "at hotel" : "visiting park"}`}>
      <span className="hotel-guest-label">{atHotel ? "🏨" : "🏊"}</span>
      <span className={"hotel-guest-body " + (hg.tier || "family")} />
    </span>;
  });

  return <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" data-people-layer>
    {walkers}{personnel}{hotelSprites}
    {guests > 0 && Object.entries(queueStats).filter(([, queue]) => queue.guests > 0).flatMap(([tileIndex, queue]) => Array.from({ length: Math.min(3, Math.max(1, Math.ceil(queue.guests / 5))) }, (_, i) => <span key={`q${tileIndex}-${i}`} className="park-pedestrian park-queue-guest" data-activity="waiting" title={`Queue: ${queue.guests} guests · ${queue.wait}m wait · rail capacity ${queue.queueCapacity ?? 8}${queue.overflow > 0 ? " · overflow " + queue.overflow : ""}`} style={position(Number(tileIndex) % 8 + .18 + i * .31, Math.floor(Number(tileIndex) / 8) + .76)}><PersonSprite activity="waiting" variant={i + 1} /></span>))}
  </div>;
}