import { guestJourney } from "@/data/guestJourney";
import { guestPersonalityRemark, walkerProfile } from "@/data/guestWayfinding";
import { useReducedMotion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { getParkItem } from "@/data/gameData";
import { isWaterAttraction } from "@/data/waterQuality";
import PersonSprite from "@/components/game/PersonSprite";
import { parkGuestReaction } from "@/data/guestReactions";

const STAFF_ROLES = [
  { id: "lifeguard", color: "bg-red-500", label: "Lifeguard" },
  { id: "mechanic", color: "bg-orange-500", label: "Mechanic" },
  { id: "cleaner", color: "bg-emerald-600", label: "Cleaner" },
  { id: "security", color: "bg-slate-800", label: "Security" },
  { id: "entertainer", color: "bg-pink-500", label: "Entertainer" },
  { id: "fitness_coach", color: "bg-violet-600", label: "Fitness coach" },
  { id: "gardener", color: "bg-lime-600", label: "Groundskeeper" },
  { id: "zookeeper", color: "bg-emerald-700", label: "Zookeeper" },
];

export default function GuestLayer({ playing = true, graphicsQuality = "ultra", grid, parkZones = [], guests = 0, avgMood = 0, waterQualityAvg = 100, movements = {}, queueStats = {}, staff = {}, staffAssignments = {}, incidents = [], attractionCondition = [], hotelGuests = [], ticketPrice = 28, inspectionPending = false }) {
  const [tick, setTick] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => { if(reducedMotion || !playing) return; const timer = setInterval(() => setTick(value => document.hidden ? value : value + 1), graphicsQuality === "balanced" ? 3200 : 1600); return () => clearInterval(timer); }, [reducedMotion, graphicsQuality, playing]);
  const rows = Math.max(1, Math.ceil(grid.length / 8));
  const targets = useMemo(() => grid.map((id, index) => id ? { index, id, attr: getParkItem(id) } : null).filter(Boolean), [grid]);
  const closed = new Set(incidents.filter(incident => incident.type === "breakdown").map(incident => incident.tileIndex));
  const destinations = targets.filter(target => target.attr?.category !== "environment" && !closed.has(target.index) && (movements[target.id] || 0) > 0);
  const longestQueue = Object.values(queueStats || {}).reduce((best, candidate) => Number(candidate?.wait || 0) > Number(best?.wait || 0) ? candidate : best, null);
  const guestReaction = parkGuestReaction({ guests, avgMood, longestQueue, waterQuality: waterQualityAvg, incidents: incidents.length });
  const entrance = targets.find(target => target.id === "park_entrance")?.index ?? Math.max(0, grid.length - 8);
  const position = (x, y) => ({ left: x / 8 * 100 + "%", top: y / rows * 100 + "%" });
  const openTargets=targets.filter(t=>!closed.has(t.index));
  const home={index:entrance,id:"park_entrance",attr:{name:"Park entrance"}};
  const walkers = Array.from({length:Math.min(graphicsQuality==="balanced"?16:40,guests>0?Math.max(6,Math.ceil(Math.sqrt(guests)*2.2)):0)},(_,i)=>{
    // Three walkers share a stable party and move towards the same places.
    const party=Math.floor(i/3);
    const profile=walkerProfile(party);
    const maxWait=profile.type==="Teen group" || profile.type==="Thrill seeker" ? 16 : 24;
    const preferredRides=destinations.filter(t => (queueStats?.[t.index]?.wait || 0) <= maxWait);
    const trip=guestJourney(openTargets,tick,party,home,preferredRides,profile);
    if(!trip) return null;
    const {target,activity,x,y}=trip;
    if(activity==="waiting" && isWaterAttraction(target.id)) return null;
    const remark = guestPersonalityRemark(profile, {queueWait:queueStats?.[target.index]?.wait || 0,mood:avgMood,waterQuality:waterQualityAvg,ticketPrice,incidents:incidents.length});
    return <span key={"g"+i} className="park-pedestrian park-guest" data-activity={activity} data-destination={target.id} data-guest-activity={activity}
      data-guest-type={profile.type.replaceAll(" ","-").toLowerCase()} style={position(x+(i%3-1)*.16,y+((i%3)-1)*.045)} title={profile.label+" · "+activity+" · "+target.attr.name}>
      <PersonSprite activity={activity} variant={i}/>
      {i>0 && i%9===0 && graphicsQuality!=="balanced" && <span className="park-guest-profile-tag" aria-hidden="true" title={profile.label}>{profile.badge}</span>}
      {(i===0 && guestReaction || i%11===0 && (tick+i)%9===0) && <span className="guest-reaction-bubble" data-tone={i===0 && guestReaction ? guestReaction.tone : remark.tone} title={profile.type}>{i===0 && guestReaction ? guestReaction.text : remark.text}</span>}
    </span>;
  });
  const personnel = STAFF_ROLES.flatMap((role, roleIndex) => {
    const assignment = staffAssignments[role.id] || "";
    let positions = targets.filter(target => !assignment || (parkZones[target.index] || "") === assignment);
    // Role-aware placement: staff gravitate to the things they actually work on,
    // so the map shows lifeguards by pools, mechanics at degrading rides, cleaners at facilities.
    if (!assignment) {
      if (role.id === "zookeeper") positions = positions.filter(t => t.attr?.parkType === "zoo");
      else if (role.id === "lifeguard") positions = positions.filter(t => t.attr?.category === "attraction" && isWaterAttraction(t.id));
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
  const hotelSprites = hotelGuests.slice(0,graphicsQuality==="balanced"?3:8).map((hg,i)=>{
    const hotel=hotelTiles.find(h=>h.index===hg.hotelTile);
    if(!hotel) return null;
    const trip=guestJourney(openTargets,tick,i,hotel,destinations);
    if(!trip) return null;
    return <span key={hg.id||"hg"+i} className="park-pedestrian park-guest" data-guest-activity={trip.activity} data-destination={trip.target.id}
      style={position(trip.x,trip.y)} title={"Hotel guest · "+(trip.atHome?"back at "+hotel.attr.name:trip.activity+" · "+trip.target.attr.name)}>
      <PersonSprite activity={trip.activity} variant={i+2}/>
      <span className="hotel-guest-label">{trip.atHome?"🏨":trip.activity==="eating"?"🍽":trip.activity==="resting"?"☀":"🧳"}</span>
    </span>;
  });

  const inspectionTrip = inspectionPending ? guestJourney(openTargets, tick, 3, home, openTargets) : null;
  return <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" data-people-layer>
    {walkers}{personnel}{hotelSprites}
    {inspectionTrip && <span className="park-pedestrian park-inspector" role="img" aria-label="Park inspector visiting" style={position(inspectionTrip.x, inspectionTrip.y)}>
      <span className="park-inspector-avatar" aria-hidden="true">🕵️</span>
      <span className="park-inspector-label" aria-hidden="true">Clipboard inspection</span>
    </span>}
    {guests > 0 && Object.entries(queueStats).filter(([tile, queue]) => queue.guests > 0 && !closed.has(Number(tile))).slice(0, graphicsQuality === "balanced" ? 8 : 20).flatMap(([tileIndex, queue]) => Array.from({ length: Math.min(3, Math.max(1, Math.ceil(queue.guests / 5))) }, (_, i) => <span key={`q${tileIndex}-${i}`} className="park-pedestrian park-queue-guest" data-activity="waiting" title={`Queue: ${queue.guests} guests · ${queue.wait}m wait · rail capacity ${queue.queueCapacity ?? 8}${queue.overflow > 0 ? " · overflow " + queue.overflow : ""}`} style={position(Number(tileIndex) % 8 + .18 + i * .31, Math.floor(Number(tileIndex) / 8) + .76)}><PersonSprite activity="waiting" variant={(i + tick) % 8} /></span>))}
  </div>;
}