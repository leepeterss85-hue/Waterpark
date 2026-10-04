import React, { useState } from "react";
import { Droplets, Footprints, Users } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import Tile from "./Tile";
import GuestLayer from "./GuestLayer";

export default function ParkGrid({ grid, parkZones, upgrades, selectedBuild, selectedTile, selectedZone, incidents, guests, visitorMovements, staffTotal, onTileClick }) {
  const [zoom, setZoom] = useState(1);
  const incidentMap = new Map((incidents || []).map((i) => [i.tileIndex, i]));
  return <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[#719f5f] p-2.5 shadow-[0_18px_50px_rgba(30,64,50,.18)] sm:p-4">
    <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-sm">
      <div><div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-cyan-600" /><h2 className="font-display text-base font-extrabold text-slate-800">Water Park Layout</h2></div><p className="text-xs text-slate-500">Design pools, slide towers, paths, queues, landscaping and services.</p></div>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"><Footprints className="h-3.5 w-3.5 text-amber-600" /> <span className="hidden sm:inline">Guest paths ·</span><Users className="h-3.5 w-3.5 text-fuchsia-500" /> {guests.toLocaleString()} <span className="hidden sm:inline">on site</span></div>
    </div>
    <div className="relative overflow-auto rounded-[24px] border-2 border-[#638c55] bg-[#94b879] p-2 sm:p-3">
      <div className="absolute right-3 top-3 z-40 flex items-center gap-1 rounded-xl bg-white/90 p-1 shadow-md ring-1 ring-slate-200 backdrop-blur">
        <button onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))} className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black text-slate-600 hover:bg-slate-100">−</button>
        <button onClick={() => setZoom(1)} className="min-w-10 rounded-lg px-1.5 py-1 text-[9px] font-extrabold text-slate-500 hover:bg-slate-100">{Math.round(zoom * 100)}%</button>
        <button onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))} className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black text-slate-600 hover:bg-slate-100">+</button>
      </div>
      <div className="pointer-events-none absolute inset-2 rounded-[20px] border border-white/20" />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-5 -translate-y-1/2 bg-[#d7b97f]/28" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-5 -translate-x-1/2 bg-[#d7b97f]/22" />
      <div className="pointer-events-none absolute left-0 right-0 top-[25%] h-3 bg-[#d7b97f]/12" />
      <div className="relative overflow-visible">
        <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, marginBottom: `${(zoom - 1) * 100 / zoom * 0.8}%` }}>
          <div className="relative grid grid-cols-8 gap-1.5 sm:gap-2">
          {grid.map((value,index)=>{
            const item=value ? getParkItem(value) : null;
            const isWater=item?.category==="attraction";
            const capacity=item?.capacity || 1;
            const movement=visitorMovements?.[value] || 0;
            const queueWait=isWater ? Math.min(45, Math.round(Math.max(0, movement/(capacity*1.4)-0.35)*18)) : 0;
            const row=Math.floor(index/8), col=index%8;
            const neighbors=[row>0?index-8:-1,row<Math.ceil(grid.length/8)-1?index+8:-1,col>0?index-1:-1,col<7?index+1:-1].filter((n)=>n>=0);
            const queueConnected=!isWater || neighbors.some((n)=>grid[n]==="queue_path"||grid[n]==="main_path");
            return <Tile key={index} index={index} grid={grid} zone={parkZones?.[index]} upgradeLevel={upgrades?.[index]||0} value={value} selectedBuild={selectedBuild} isSelected={selectedTile===index} incident={incidentMap.get(index)} queueWait={queueWait} queueConnected={queueConnected} onClick={()=>onTileClick(index)} />;
          })}
          </div>
          <GuestLayer grid={grid} guests={guests} movements={visitorMovements} staffTotal={staffTotal} />
        </div>
      </div>
    </div>
    <div className="mt-2 flex flex-wrap gap-x-4 px-2 text-[10px] font-semibold text-emerald-950/60">
      <span>Blue = water attraction</span><span>Built = facilities / scenery</span><span>Green = open land</span>{selectedZone && <span className="font-extrabold text-slate-700">Zoning mode: click tiles to paint</span>}
    </div>
  </section>;
}