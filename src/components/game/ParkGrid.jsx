import React from "react";
import { Droplets, Footprints, Users } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import Tile from "./Tile";
import GuestLayer from "./GuestLayer";

export default function ParkGrid({ grid, parkZones, selectedBuild, selectedTile, selectedZone, incidents, guests, visitorMovements, staffTotal, onTileClick }) {
  const incidentMap = new Map((incidents || []).map((i) => [i.tileIndex, i]));
  return <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[#719f5f] p-2.5 shadow-[0_18px_50px_rgba(30,64,50,.18)] sm:p-4">
    <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-sm">
      <div><div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-cyan-600" /><h2 className="font-display text-base font-extrabold text-slate-800">Water Park Layout</h2></div><p className="text-xs text-slate-500">Design pools, slide towers, paths, queues, landscaping and services.</p></div>
      <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:flex"><Footprints className="h-3.5 w-3.5 text-amber-600" /> Guest paths <span className="mx-1 text-slate-300">·</span><Users className="h-3.5 w-3.5 text-fuchsia-500" /> {guests.toLocaleString()} on site</div>
    </div>
    <div className="relative overflow-hidden rounded-[24px] border-2 border-[#638c55] bg-[#94b879] p-2 sm:p-3">
      <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-white/20" />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-5 -translate-y-1/2 bg-[#d7b97f]/28" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-5 -translate-x-1/2 bg-[#d7b97f]/22" />
      <div className="pointer-events-none absolute left-0 right-0 top-[25%] h-3 bg-[#d7b97f]/12" />
      <div className="relative">
        <div className="relative grid grid-cols-8 gap-1.5 sm:gap-2">
          {grid.map((value,index)=>{
            const item=value ? getParkItem(value) : null;
            const isWater=item?.category==="attraction";
            const capacity=item?.capacity || 1;
            const movement=visitorMovements?.[value] || 0;
            const queueWait=isWater ? Math.min(45, Math.round(Math.max(0, movement/(capacity*1.4)-0.35)*18)) : 0;
            return <Tile key={index} index={index} grid={grid} zone={parkZones?.[index]} value={value} selectedBuild={selectedBuild} isSelected={selectedTile===index} incident={incidentMap.get(index)} queueWait={queueWait} onClick={()=>onTileClick(index)} />;
          })}
        </div>
        <GuestLayer grid={grid} guests={guests} movements={visitorMovements} staffTotal={staffTotal} />
      </div>
    </div>
    <div className="mt-2 flex flex-wrap gap-x-4 px-2 text-[10px] font-semibold text-emerald-950/60">
      <span>Blue = water attraction</span><span>Built = facilities / scenery</span><span>Green = open land</span>{selectedZone && <span className="font-extrabold text-slate-700">Zoning mode: click tiles to paint</span>}
    </div>
  </section>;
}