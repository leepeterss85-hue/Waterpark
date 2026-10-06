import React, { useState } from "react";
import { Footprints, Users, Map as MapIcon, Sparkles } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import { getHotelDef, hotelRooms } from "@/data/hotels";
import Tile from "@/components/game/Tile";
import GuestLayer from "@/components/game/GuestLayer";
import MapAmbience from "@/components/game/MapAmbience";
import MascotSprite from "@/components/game/MascotSprite";
import { useTouchZoom } from "@/hooks/useTouchZoom";
import "@/components/game/parkMap.css";
import "@/components/game/parkArtwork.css";
import "@/components/game/parkPeople.css";
import "@/components/game/parkChrome.css";

export default function ParkGrid({ grid, parkZones, upgrades, selectedBuild, selectedTile, selectedZone, incidents, guests, visitorMovements, queueStats = {}, attractionCondition = [], staff = {}, staffAssignments = {}, lifeguardTotal = 0, day = 1, weather, seasonEvent, hotelGuests = [], activeEvents = [], onTileClick, topControls, bottomMenu, statsBar, themeClass = "", mascot = null }) {
  const { zoom, setZoom, panX, panY, resetView, containerRef } = useTouchZoom(1);
  const incidentMap = new Map((incidents || []).map((incident) => [incident.tileIndex, incident]));
  const phase = ((day - 1) % 8);
  const timeOfDay = phase <= 1 ? "morning" : phase <= 5 ? "day" : phase === 6 ? "sunset" : "night";
  const weatherId = weather?.id || "clear";
  const attractionCount = grid.filter((id) => getParkItem(id)?.category === "attraction").length;
  const lifeguardStations = grid.filter((id) => id === "lifeguard_station").length;
  const toilets = grid.filter((id) => id === "toilets" || id === "lockers").length;
  const requiredGuards = Math.max(1, Math.ceil(attractionCount / 3));
  const guardCoverage = Math.min(1, lifeguardTotal / requiredGuards + lifeguardStations * 0.12);
  const facilityStatus = { toilets: guests <= Math.max(1, toilets) * 80 ? "COVERED" : "OVERLOADED", lifeguard_station: guardCoverage >= 0.7 ? "COVERED" : "OVERLOADED" };

  return (
    <section className={"game-board-shell aquatic-map park-time-" + timeOfDay + " park-weather-" + weatherId + " flex h-full flex-col " + themeClass}>
      <div className="game-board-titlebar">
        <div className="flex min-w-0 items-center gap-3"><div className="game-board-icon"><MapIcon className="h-5 w-5" /></div><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="font-display text-base font-black text-white sm:text-lg">Your Water Park</h2><span className="game-live-pill"><span /> LIVE</span></div><p className="hidden text-[10px] font-bold text-white/60 sm:block">Build, decorate and manage your resort.</p></div></div>
        <div className="flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-wider text-white/75 sm:text-[10px]"><span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-cyan-200" />{guests.toLocaleString()}</span><span className="hidden h-4 w-px bg-white/20 sm:block" /><span className="hidden items-center gap-1.5 sm:flex"><Footprints className="h-3.5 w-3.5 text-amber-200" />GUESTS MOVING</span></div>
      </div>
      {topControls}
      {(seasonEvent || weatherId === "storm") && <div className={"park-event-ribbon " + (weatherId === "storm" ? "storm" : "")}><Sparkles className="h-3.5 w-3.5" /><span>{weatherId === "storm" ? "THUNDERSTORM — SAFETY MODE" : seasonEvent?.name}</span><b>{weatherId === "storm" ? "Outdoor demand reduced" : seasonEvent?.description}</b></div>}
      {activeEvents.length > 0 && <div className="park-event-ribbon"><Sparkles className="h-3.5 w-3.5 text-amber-300" /><span>{activeEvents.map((e) => e.name).join(" · ")}</span><b>{activeEvents.length} active event{activeEvents.length > 1 ? "s" : ""} — bonuses applied</b></div>}
      <div className="game-board-frame flex flex-1 flex-col min-h-0">
        <div className="game-map-toolbar"><div className="flex items-center gap-2"><span className="game-map-status"><span /> PARK MAP</span><span className="hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 sm:inline">Tap a tile to build or inspect</span></div><div className="flex items-center gap-1 rounded-xl bg-white/95 p-1 shadow-md ring-1 ring-slate-200"><button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))} className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black text-slate-600 hover:bg-slate-100">−</button><button aria-label="Reset zoom" onClick={resetView} className="min-w-10 rounded-lg px-1.5 py-1 text-[9px] font-extrabold text-slate-500 hover:bg-slate-100">{Math.round(zoom * 100)}%</button><button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))} className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black text-slate-600 hover:bg-slate-100">+</button></div></div>
        <div ref={containerRef} className="relative flex-1 min-h-0 overflow-auto rounded-[20px] border-[5px] border-[#315f47] bg-[#7aa966] p-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,.15),inset_0_12px_35px_rgba(19,70,44,.18)] sm:p-3 game-map-surface">
          <div className="park-atmosphere" aria-hidden="true"><span className="park-sun" /><span className="park-cloud park-cloud-a" /><span className="park-cloud park-cloud-b" /><span className="park-rain" /></div>
          <MapAmbience timeOfDay={timeOfDay} />
          
          <div className="relative h-full overflow-visible game-map-stage"><div className="relative h-full park-playfield" style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "top left", width: (100 / zoom) + "%", marginBottom: ((zoom - 1) * 100 / zoom * 0.8) + "%" }}>
            <div className="relative grid h-full grid-rows-[repeat(var(--map-rows),1fr)] grid-cols-8 gap-1 sm:gap-1.5 game-map-grid" style={{ "--map-rows": Math.ceil(grid.length / 8) }}>
              {grid.map((value, index) => {
                const item = value ? getParkItem(value) : null;
                const isWater = item?.category === "attraction";
                const capacity = item?.capacity || 1;
                const movement = visitorMovements?.[value] || 0;
                const queue = queueStats?.[index];
                const queueWait = queue?.wait ?? (isWater ? Math.min(45, Math.round(Math.max(0, movement / (capacity * 1.4) - 0.35) * 18)) : 0);
                const row = Math.floor(index / 8), col = index % 8;
                const expansionThemes = ["starter", "family", "thrill", "resort", "extreme", "vip", "grand"];
                const expansionTheme = expansionThemes[Math.max(0, Math.min(expansionThemes.length - 1, row - 5))];
                const neighbors = [row > 0 ? index - 8 : -1, row < Math.ceil(grid.length / 8) - 1 ? index + 8 : -1, col > 0 ? index - 1 : -1, col < 7 ? index + 1 : -1].filter((n) => n >= 0);
                const queueConnected = !isWater || neighbors.some((n) => grid[n] === "queue_path" || grid[n] === "main_path");
                const hotelDef = value ? getHotelDef(value) : null;
                const hotelOcc = hotelDef ? hotelGuests.filter((g) => g.hotelTile === index).length : 0;
                const hotelRm = hotelDef ? hotelRooms(hotelDef, upgrades?.[index] || 0) : 0;
                return <Tile key={index} index={index} grid={grid} zone={parkZones?.[index]} upgradeLevel={upgrades?.[index] || 0} value={value} selectedBuild={selectedBuild} expansionTheme={expansionTheme} isSelected={selectedTile === index} incident={incidentMap.get(index)} condition={attractionCondition?.[index]} queueWait={queueWait} queueConnected={queueConnected} movement={movement} guests={guests} facilityStatus={facilityStatus} timeOfDay={timeOfDay} nightSwim={seasonEvent?.id === "night_swim"} hotelOccupancy={hotelOcc} hotelRoomsTotal={hotelRm} onClick={() => onTileClick(index)} />;
              })}
            </div>
            <GuestLayer grid={grid} parkZones={parkZones} guests={guests} movements={visitorMovements} queueStats={queueStats} staff={staff} staffAssignments={staffAssignments} incidents={incidents || []} />
            {mascot && <MascotSprite mascot={mascot} grid={grid} />}
          </div></div>
        </div>
      </div>
      <div className="game-board-legend"><span><i className="legend-dot water" /> Water rides</span><span><i className="legend-dot path" /> Paths</span><span><i className="legend-dot land" /> Build plots</span>{selectedZone && <span className="flex items-center gap-1 font-black text-cyan-700"><Sparkles className="h-3 w-3" /> Zoning mode</span>}</div>
      {bottomMenu}
      {statsBar}
    </section>
  );
}