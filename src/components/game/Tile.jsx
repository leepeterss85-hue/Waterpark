import React from "react";
import { Wrench, Sparkles, Umbrella, CircleDot, MapPin, Users } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import ParkItemArtwork from "@/components/game/ParkItemArtwork";
import RideVisitors from "@/components/game/RideVisitors";
import RideStatus from "@/components/game/RideStatus";



const ZONE_TINT = {
  family:"bg-amber-300/20 ring-amber-300/40", thrill:"bg-rose-300/20 ring-rose-300/40",
  resort:"bg-violet-300/20 ring-violet-300/40", relax:"bg-cyan-300/20 ring-cyan-300/40",
  services:"bg-emerald-300/20 ring-emerald-300/40"
};

function ExpansionDecor({ theme, night, nightSwim }) {
  const items = {
    family:["☂","★","🛟"], thrill:["⚡","▲","!"], resort:["🌿","✦","⛲"],
    extreme:["⚠","◆","⚡"], vip:["✦","◇","♛"], grand:["✦","✧","◈"], starter:["•","•","•"],
  }[theme] || ["•","•","•"];
  return <div className={"expansion-decor expansion-decor-" + theme + (night ? " expansion-night" : "")}>
    <span>{items[0]}</span><span>{items[1]}</span><span>{items[2]}</span>
    {nightSwim && <div className="night-swim-lights"><i /><i /><i /><i /></div>}
  </div>;
}


export default function Tile({ value, index, grid, zone, expansionTheme = "starter", upgradeLevel = 0, selectedBuild, isSelected, incident, queueWait, queueConnected, movement = 0, guests = 0, condition = 100, facilityStatus, timeOfDay = "day", nightSwim = false, onClick }) {
  const attr = value ? getParkItem(value) : null;
  const canPlace = !attr && selectedBuild;
  const ghostAttr = canPlace ? getParkItem(selectedBuild) : null;
  const isWater = attr?.category === "attraction";
  const zoneTint = zone ? ZONE_TINT[zone] : "";

  return <button onClick={onClick} data-park-tile={index} data-item={value || undefined} data-kind={attr?.category || "empty"} data-buildable={Boolean(canPlace)} title={attr ? attr.name : canPlace ? "Build here" : zone ? "Park zone" : "Open land"} className={"group relative h-full w-full overflow-hidden rounded-[17px] border-2 transition-all duration-200 park-expansion-theme-" + expansionTheme + " " + (attr ? (isSelected ? "scale-[.97] border-white ring-4 ring-cyan-300/80 shadow-[0_10px_24px_rgba(15,23,42,.24)]" : "border-white/75 shadow-[0_6px_15px_rgba(15,23,42,.13)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,.18)]") : canPlace ? "border-dashed border-cyan-300 bg-cyan-50 hover:bg-white" : "border-white/70 bg-[#e8d8a8] hover:bg-[#f0e3b8]")}>
    {attr && <><ParkItemArtwork attr={attr} grid={grid} index={index} />{isWater && <RideVisitors attr={attr} guests={guests} movement={movement} incident={incident} />}{attr.category !== "environment" && <span className="park-tile-caption">{attr.name}</span>}</>}
    {canPlace && <div className="park-build-hint relative z-10 flex h-full flex-col items-center justify-center gap-1"><div className="park-build-symbol grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-cyan-200"><span className="text-xl font-light text-cyan-500">+</span></div><span className="park-build-label text-[8px] font-extrabold uppercase tracking-wider text-cyan-700">Build</span></div>}
    {canPlace && ghostAttr && <div className="pointer-events-none absolute inset-0 z-[5] opacity-40 transition-opacity duration-150 group-hover:opacity-70"><ParkItemArtwork attr={ghostAttr} grid={grid} index={index} /></div>}
    {zoneTint && <div className={"pointer-events-none absolute inset-0 z-10 rounded-[15px] ring-2 " + zoneTint} />}
    {isWater && <RideStatus incident={incident} queueConnected={queueConnected} queueWait={queueWait} movement={movement} capacity={attr.capacity || 1} condition={condition} level={upgradeLevel} />}
    {attr?.category === "facility" && facilityStatus?.[attr.id] && <span className={"absolute right-1 top-1 z-20 rounded bg-slate-950/65 px-1 py-0.5 text-[6px] font-black text-white " + (facilityStatus[attr.id] === "OVERLOADED" ? "facility-overloaded" : "facility-covered")}>{facilityStatus[attr.id]}</span>}
    {incident && <span className={"park-incident-marker absolute right-1.5 top-1.5 z-20 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white shadow-lg " + (incident.type === "breakdown" ? "animate-pulse bg-rose-500" : "bg-amber-500")}>{incident.type === "breakdown" ? <Wrench className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}</span>}
    {attr?.id === "sun_lounge" && <span className="absolute bottom-1 left-1 grid h-4 w-4 place-items-center rounded-full bg-white/25"><Umbrella className="h-2.5 w-2.5 text-white" /></span>}
    {attr?.id === "bench" && <Users className="absolute bottom-1 right-1 h-3 w-3 text-white/50" />}
    {attr?.id === "fence" && <span className="absolute inset-0 z-10 rounded-[15px] border-4 border-stone-500/80" />}
    {attr?.id === "park_entrance" && <MapPin className="absolute right-1 top-1 z-20 h-3.5 w-3.5 text-amber-300" />}
    {isSelected && <CircleDot className="absolute bottom-1.5 right-1.5 z-20 h-3.5 w-3.5 text-white drop-shadow" />}
  </button>;
}