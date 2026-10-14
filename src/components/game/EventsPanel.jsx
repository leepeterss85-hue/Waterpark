import React, { useState, useMemo } from "react";
import { PoundSterling, Users, TrendingUp, Star, Lock, Clock, Sparkles, AlertTriangle, Ban, Wrench } from "lucide-react";
import { MAJOR_EVENTS, EVENT_CATEGORIES, getCategory, isEventAvailable, getEvent, checkEventRequirements, checkEventConflict } from "@/data/parkEvents";
import { getIcon } from "@/components/game/icons";
import { getSeasonLabel } from "@/data/parkSystems";

function EventCard({ event, active, available, season, level, money, grid, staff, activeEvents, onLaunch }) {
  const Icon = getIcon(event.icon);
  const cat = getCategory(event.category);
  const canAfford = money >= event.cost;
  const locked = !available;
  const reqCheck = useMemo(() => checkEventRequirements(event, grid, staff), [event, grid, staff]);
  const conflictCheck = useMemo(() => checkEventConflict(event, activeEvents), [event, activeEvents]);
  const blockedByReq = !active && !locked && !reqCheck.met;
  const blockedByConflict = !active && !locked && conflictCheck.conflict;
  const disabled = locked || active || !canAfford || blockedByReq || blockedByConflict;

  return (
    <div
      className={`relative rounded-xl border-2 p-2.5 transition ${
        active
          ? "border-emerald-400 bg-emerald-50"
          : locked
          ? "border-slate-200 bg-slate-50 opacity-60"
          : canAfford
          ? "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm"
          : "border-slate-200 bg-white opacity-70"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${cat?.color || "from-slate-400 to-slate-500"} shadow-sm`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-800">{event.name}</span>
            {active && <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[7px] font-black text-white">ACTIVE</span>}
            {locked && !active && <Lock className="h-3 w-3 text-slate-400" />}
          </div>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{event.description}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-extrabold">
        <span className="inline-flex items-center gap-0.5 text-emerald-600"><PoundSterling className="h-2.5 w-2.5" />{event.cost.toLocaleString()}</span>
        <span className="inline-flex items-center gap-0.5 text-cyan-600"><Clock className="h-2.5 w-2.5" />{event.duration}d</span>
        <span className="inline-flex items-center gap-0.5 text-violet-500"><Users className="h-2.5 w-2.5" />+{Math.round((event.guestMult - 1) * 100)}%</span>
        <span className="inline-flex items-center gap-0.5 text-amber-500"><TrendingUp className="h-2.5 w-2.5" />+{Math.round((event.incomeMult - 1) * 100)}%</span>
        {event.revenuePerDay > 0 && <span className="inline-flex items-center gap-0.5 text-emerald-600"><PoundSterling className="h-2.5 w-2.5" />{event.revenuePerDay}/day</span>}
        <span className="inline-flex items-center gap-0.5 text-rose-400"><Star className="h-2.5 w-2.5" />+{event.repDelta}</span>
      </div>

      {/* Requirements & trade-offs — make events a real decision, not a button */}
      {!active && !locked && (
        <div className="mt-1.5 space-y-1">
          {reqCheck.missing.map((msg, i) => (
            <div key={i} className="flex items-center gap-1 text-[8px] font-bold text-rose-500">
              <AlertTriangle className="h-2.5 w-2.5 shrink-0" /> {msg}
            </div>
          ))}
          {blockedByConflict && (
            <div className="flex items-center gap-1 text-[8px] font-bold text-rose-500">
              <Ban className="h-2.5 w-2.5 shrink-0" /> Conflicts with: {conflictCheck.conflictingEvent?.name}
            </div>
          )}
          {event.downside?.label && reqCheck.met && !blockedByConflict && (
            <div className="flex items-center gap-1 text-[8px] font-bold text-amber-600">
              <Wrench className="h-2.5 w-2.5 shrink-0" /> {event.downside.label}
            </div>
          )}
        </div>
      )}
      {active && event.downside?.label && (
        <div className="mt-1.5 flex items-center gap-1 text-[8px] font-bold text-amber-600">
          <Wrench className="h-2.5 w-2.5 shrink-0" /> {event.downside.label}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {event.seasons.map((s) => getSeasonLabel(s)).join(" · ")}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onLaunch(event.id)}
          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black transition ${
            active
              ? "bg-emerald-100 text-emerald-600"
              : locked
              ? "bg-slate-100 text-slate-400"
              : blockedByReq || blockedByConflict
              ? "bg-rose-50 text-rose-400 ring-1 ring-rose-200"
              : canAfford
              ? "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-sm hover:from-emerald-300 hover:to-emerald-500"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {active ? "Running" : locked ? `Lv ${event.minLevel}+` : blockedByReq ? "Needs facility" : blockedByConflict ? "Conflicts" : canAfford ? "Launch" : "Too pricey"}
        </button>
      </div>
    </div>
  );
}

export default function EventsPanel({ money, level, day, activeEvents, grid, staff, onLaunch }) {
  const [filter, setFilter] = useState("all");
  const activeIds = useMemo(() => new Set((activeEvents || []).map((e) => e.id)), [activeEvents]);

  const filtered = useMemo(() => {
    if (filter === "all") return MAJOR_EVENTS;
    if (filter === "active") return MAJOR_EVENTS.filter((e) => activeIds.has(e.id));
    return MAJOR_EVENTS.filter((e) => e.category === filter);
  }, [filter, activeIds]);

  const totalEventRevenue = (activeEvents || []).reduce((s, e) => s + (e.revenuePerDay || 0), 0);
  const totalGuestBoost = (activeEvents || []).reduce((s, e) => s + Math.round((e.guestMult - 1) * 100), 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Active events summary */}
      {(activeEvents || []).length > 0 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            {activeEvents.length} Active Event{activeEvents.length > 1 ? "s" : ""}
          </div>
          <div className="mt-2 space-y-1.5">
            {activeEvents.map((ev) => {
              const def = getEvent(ev.id);
              const Icon = getIcon(def?.icon || "Sparkles");
              return (
                <div key={ev.id} className="flex items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="flex-1 text-[11px] font-bold text-slate-700">{ev.name}</span>
                  <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-black text-white">{ev.daysLeft}d left</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-extrabold text-emerald-700">
            <span>+{totalGuestBoost}% guests</span>
            {totalEventRevenue > 0 && <span>+${totalEventRevenue}/day revenue</span>}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-lg px-2 py-1 text-[9px] font-black transition ${filter === "all" ? "bg-cyan-500 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
        >
          All
        </button>
        {EVENT_CATEGORIES.map((cat) => {
          const Icon = getIcon(cat.icon);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black transition ${filter === cat.id ? "bg-cyan-500 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
            >
              <Icon className="h-2.5 w-2.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Event list */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            active={activeIds.has(event.id)}
            available={isEventAvailable(event, day, level)}
            season={getSeasonLabel}
            level={level}
            money={money}
            grid={grid}
            staff={staff}
            activeEvents={activeEvents}
            onLaunch={onLaunch}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl bg-slate-100 p-6 text-center text-xs font-bold text-slate-400">
          No events in this category yet.
        </div>
      )}
    </div>
  );
}