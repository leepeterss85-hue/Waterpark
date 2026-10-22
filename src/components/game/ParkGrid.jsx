import React, { useEffect, useRef } from "react";
import { Footprints, Users, Map as MapIcon, Sparkles, Maximize2, Hammer, X, CheckCircle2, Settings2 } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import { getHotelDef, hotelRooms } from "@/data/hotels";
import Tile from "@/components/game/Tile";
import GuestLayer from "@/components/game/GuestLayer";
import MapAmbience from "@/components/game/MapAmbience";
import MascotSprite from "@/components/game/MascotSprite";
import GroupArrivalIndicator from "@/components/game/GroupArrivalIndicator";
import StrikeBanner from "@/components/game/StrikeBanner";
import ParkSceneryLayer from "@/components/game/ParkSceneryLayer";
import EventOverlay from "@/components/game/EventOverlay";
import { useTouchZoom } from "@/hooks/useTouchZoom";
import { sound } from "@/lib/soundManager";
import "@/components/game/parkMap.css";
import "@/components/game/parkArtwork.css";
import "@/components/game/parkPeople.css";
import "@/components/game/parkChrome.css";
import "@/components/game/eventOverlay.css";
import "@/components/game/resortFinish.css";

export default function ParkGrid({ grid, parkZones, upgrades, selectedBuild, selectedTile, selectedZone, incidents, guests, avgMood = 0, waterQualityAvg = 100, visitorMovements, queueStats = {}, attractionCondition = [], staff = {}, staffAssignments = {}, lifeguardTotal = 0, day = 1, weather, seasonEvent, hotelGuests = [], activeEvents = [], waterQuality = [], acceptedBookings = [], sponsorships = [], activeStrikes = [], money = 0, sandbox = false, graphicsQuality = "ultra", onGraphicsQualityChange, onOpenSettings, onCancelBuild, onChangeBuild, onTileClick, topControls, bottomMenu, statsBar, themeClass = "", mascot = null }) {
  const { zoom, setZoom, panX, panY, resetView, fitToWidth, containerRef, onMapClickCapture } = useTouchZoom(1, 0.35, 2.5);
  // Quality is controlled by Home so both the top bar and Settings stay in sync.
  const graphics = graphicsQuality;
  const toggleGraphics = () => {
    const options = ["ultra", "rich", "balanced"];
    onGraphicsQualityChange?.(options[(options.indexOf(graphics) + 1) % options.length]);
  };
  const graphicsLabel = graphics === "ultra" ? "Ultra" : graphics === "rich" ? "High" : "Balanced";
  const buildItem = selectedBuild ? getParkItem(selectedBuild) : null;
  const canAffordBuild = !!buildItem && (sandbox || money >= buildItem.cost);
  const incidentMap = new Map((incidents || []).map((incident) => [incident.tileIndex, incident]));
  const phase = ((day - 1) % 8);
  const timeOfDay = phase <= 1 ? "morning" : phase <= 5 ? "day" : phase === 6 ? "sunset" : "night";
  const weatherId = (typeof weather === "string" ? weather : weather?.id) || "clear";
  const previousWeather = useRef(weatherId);
  useEffect(() => { sound.setAmbience(weatherId, timeOfDay); }, [weatherId, timeOfDay]);
  useEffect(() => {
    const species = (grid || []).map((id) => getParkItem(id)).filter((item) => item?.parkType === "zoo" && item?.animal && !["All resident animals", "Conservation programmes"].includes(item.animal)).map((item) => item.animal);
    sound.setZooHabitats(species);
  }, [grid]);
  useEffect(() => {
    if (previousWeather.current !== weatherId) sound.weatherChange(weatherId);
    previousWeather.current = weatherId;
  }, [weatherId]);
  const attractionCount = grid.filter((id) => getParkItem(id)?.category === "attraction").length;
  const lifeguardStations = grid.filter((id) => id === "lifeguard_station").length;
  const toilets = grid.filter((id) => id === "toilets" || id === "lockers").length;
  const requiredGuards = Math.max(1, Math.ceil(attractionCount / 3));
  const guardCoverage = Math.min(1, lifeguardTotal / requiredGuards + lifeguardStations * 0.12);
  const facilityStatus = { toilets: guests <= Math.max(1, toilets) * 80 ? "COVERED" : "OVERLOADED", lifeguard_station: guardCoverage >= 0.7 ? "COVERED" : "OVERLOADED" };
  const entranceIndex = grid.indexOf("park_entrance") >= 0 ? grid.indexOf("park_entrance") : Math.max(0, grid.length - 8);
  const sponsorNames = (sponsorships || []).filter(Boolean).map((s) => s.name).join(" · ");

  return (
    <section data-graphics={graphics} className={"game-board-shell aquatic-map resort-finish park-time-" + timeOfDay + " park-weather-" + weatherId + " flex h-full flex-col " + themeClass}>
      <div className="game-board-titlebar">
        <div className="flex min-w-0 items-center gap-3"><div className="game-board-icon"><MapIcon className="h-5 w-5" /></div><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="font-display text-base font-black text-white sm:text-lg">Your Water Park</h2><span className="game-live-pill"><span /> LIVE</span></div><p className="hidden text-[10px] font-bold text-white/60 sm:block">Build, decorate and manage your resort.</p></div></div>
        <div className="flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-wider text-white/75 sm:text-[10px]"><span className="hidden items-center gap-1.5 sm:flex"><Users className="h-3.5 w-3.5 text-cyan-200" />{guests.toLocaleString()}</span><span className="hidden h-4 w-px bg-white/20 sm:block" /><span className="hidden items-center gap-1.5 sm:flex"><Footprints className="h-3.5 w-3.5 text-amber-200" />GUESTS MOVING</span><button type="button" onClick={onOpenSettings} aria-label="Open park settings" title="Park settings and graphics" className="resort-top-settings"><Settings2 className="h-4 w-4" /><span>Settings</span></button></div>
      </div>
      {sponsorNames && <div className="sponsor-ribbon"><span className="sponsor-dot" />Sponsored by <span className="sponsor-names">{sponsorNames}</span></div>}
      <StrikeBanner activeStrikes={activeStrikes} />
      {topControls}
      {(seasonEvent || weatherId === "storm") && <div className={"park-event-ribbon " + (weatherId === "storm" ? "storm" : "")}><Sparkles className="h-3.5 w-3.5" /><span>{weatherId === "storm" ? "THUNDERSTORM — SAFETY MODE" : seasonEvent?.name}</span><b>{weatherId === "storm" ? "Outdoor demand reduced" : seasonEvent?.description}</b></div>}
      {activeEvents.length > 0 && <div className="park-event-ribbon"><Sparkles className="h-3.5 w-3.5 text-amber-300" /><span>{activeEvents.map((e) => e.name).join(" · ")}</span><b>{activeEvents.length} active event{activeEvents.length > 1 ? "s" : ""} — bonuses applied</b></div>}
      <div className="game-board-frame flex flex-1 flex-col min-h-0">
        <div className="game-map-toolbar park-camera-toolbar"><div className="park-map-heading flex items-center gap-2"><span className="game-map-status"><span /> PARK MAP</span><span className="hidden text-[9px] font-extrabold uppercase tracking-wider text-slate-400 sm:inline">Tap a tile to build or inspect</span></div><div className="park-camera-actions flex items-center gap-1 rounded-xl bg-white/95 p-1 shadow-md ring-1 ring-slate-200"><button type="button" aria-label={`Graphics quality: ${graphicsLabel}. Tap to change`} title="Cycle Ultra, High or Balanced" onClick={toggleGraphics} className="resort-quality-button resort-quality-cycle" data-quality={graphics}><Sparkles className="h-3.5 w-3.5" />{graphicsLabel}</button><button aria-label="Fit park to screen" title="Fit all eight columns to your screen" onClick={fitToWidth} className="resort-quality-button resort-fit-button"><Maximize2 className="h-3.5 w-3.5" />Fit</button><button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))))} className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black text-slate-600 hover:bg-slate-100">−</button><button aria-label="Reset zoom" onClick={resetView} className="min-w-10 rounded-lg px-1.5 py-1 text-[9px] font-extrabold text-slate-500 hover:bg-slate-100">{Math.round(zoom * 100)}%</button><button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(1))))} className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black text-slate-600 hover:bg-slate-100">+</button></div></div>
        {buildItem && <div className="park-placement-tray" role="status" aria-live="polite">
          <span className="park-placement-icon"><Hammer className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-xs">{buildItem.name}</strong>
            <span className="block truncate text-[10px] text-slate-600">
              {canAffordBuild ? <>Tap an empty plot to place · {sandbox ? "Sandbox" : `£${buildItem.cost.toLocaleString("en-GB")}`}</> : `Need £${Math.max(0, buildItem.cost - money).toLocaleString("en-GB")} more`}
            </span>
          </span>
          {canAffordBuild && <CheckCircle2 className="hidden h-4 w-4 shrink-0 text-emerald-600 sm:block" />}
          <button type="button" className="park-placement-action" onClick={onChangeBuild} aria-label="Choose a different item">Change</button>
          <button type="button" className="park-placement-cancel" onClick={onCancelBuild} aria-label="Cancel placement"><X className="h-4 w-4" /></button>
        </div>}
        <div ref={containerRef} onClickCapture={onMapClickCapture} aria-label="Interactive water park map. Pinch to zoom, drag to explore and tap plots to build." className="relative flex-1 min-h-0 overflow-auto rounded-[20px] border-[5px] border-[#315f47] bg-[#7aa966] p-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,.15),inset_0_12px_35px_rgba(19,70,44,.18)] sm:p-3 game-map-surface">
          <div className="park-atmosphere" aria-hidden="true"><span className="park-sun" /><span className="park-cloud park-cloud-a" /><span className="park-cloud park-cloud-b" /><span className="park-rain" /><span className="park-lightning" /></div>
          <MapAmbience timeOfDay={timeOfDay} weather={weather} />
          <EventOverlay activeEvents={activeEvents} grid={grid} />
          
          <div className="relative h-full overflow-visible game-map-stage"><div className="relative h-full park-playfield" style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "top left", width: "100%" }}>
            <div className="relative grid h-full grid-rows-[repeat(var(--map-rows),1fr)] grid-cols-8 gap-1 sm:gap-1.5 game-map-grid" style={{ "--map-rows": Math.ceil(grid.length / 8) }}><ParkSceneryLayer grid={grid} selectedBuild={selectedBuild} />
              {grid.map((value, index) => {
                const item = value ? getParkItem(value) : null;
                const isWater = item?.category === "attraction" && item?.parkType !== "zoo";
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
                return <Tile graphicsQuality={graphics} key={index} index={index} grid={grid} zone={parkZones?.[index]} upgradeLevel={upgrades?.[index] || 0} value={value} selectedBuild={selectedBuild} expansionTheme={expansionTheme} isSelected={selectedTile === index} incident={incidentMap.get(index)} condition={attractionCondition?.[index]} queueWait={queueWait} queueConnected={queueConnected} movement={movement} guests={guests} facilityStatus={facilityStatus} timeOfDay={timeOfDay} nightSwim={seasonEvent?.id === "night_swim"} hotelOccupancy={hotelOcc} hotelRoomsTotal={hotelRm} waterQuality={waterQuality?.[index]} onClick={() => onTileClick(index)} />;
              })}
            </div>
            <GuestLayer grid={grid} parkZones={parkZones} guests={guests} avgMood={avgMood} waterQualityAvg={waterQualityAvg} movements={visitorMovements} queueStats={queueStats} staff={staff} staffAssignments={staffAssignments} incidents={incidents || []} attractionCondition={attractionCondition} hotelGuests={hotelGuests} />
            <GroupArrivalIndicator acceptedBookings={acceptedBookings} entranceIndex={entranceIndex} rows={Math.ceil(grid.length / 8)} />
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