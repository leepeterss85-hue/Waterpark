import React from "react";
import { Sun, Flower2, Flame, Snowflake, Gift, Ghost, Wheat, Calendar } from "lucide-react";
import { SEASONAL_EVENTS, getUpcomingEvents, calendarDay, calendarYear, getCalendarSeason, CALENDAR_YEAR_LENGTH } from "@/data/seasonalCalendar";

const ICONS = { Sun, Flower2, Flame, Snowflake, Gift, Ghost, Wheat };
const SEASON_LABELS = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" };
const SEASON_COLORS = {
  spring: "text-lime-600 bg-lime-50",
  summer: "text-orange-600 bg-orange-50",
  autumn: "text-amber-600 bg-amber-50",
  winter: "text-cyan-600 bg-cyan-50",
};

export default function SeasonalCalendarPanel({ day, activeCalendarEvent }) {
  const cDay = calendarDay(day);
  const cYear = calendarYear(day);
  const season = getCalendarSeason(day);
  const upcoming = getUpcomingEvents(day, 20);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 p-3 ring-1 ring-cyan-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-cyan-700">Seasonal Calendar</div>
            <p className="mt-0.5 text-[10px] font-medium text-cyan-600">
              Year {cYear} · Day {cDay} of {CALENDAR_YEAR_LENGTH}
            </p>
          </div>
          <div className={`rounded-lg px-2 py-1 text-[10px] font-black ${SEASON_COLORS[season]}`}>
            {SEASON_LABELS[season]}
          </div>
        </div>
      </div>

      {activeCalendarEvent && (
        <div className={`overflow-hidden rounded-xl border-2 border-amber-300 bg-white shadow-md`}>
          <div className={`flex items-center gap-2 bg-gradient-to-r ${activeCalendarEvent.color} px-3 py-2`}>
            <span className="text-lg">{activeCalendarEvent.decoration}</span>
            <div className="flex-1">
              <div className="text-xs font-black text-white">{activeCalendarEvent.name}</div>
              <div className="text-[9px] font-bold text-white/80">Active now! {activeCalendarEvent.duration} days</div>
            </div>
          </div>
          <div className="p-3">
            <p className="text-[10px] font-medium text-slate-600">{activeCalendarEvent.desc}</p>
            <div className="mt-1.5 flex gap-2 text-[9px] font-bold">
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-600">+{Math.round((activeCalendarEvent.guestMult - 1) * 100)}% guests</span>
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-600">+{Math.round((activeCalendarEvent.incomeMult - 1) * 100)}% income</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Upcoming Events</div>
        {upcoming.length === 0 ? (
          <div className="rounded-lg bg-slate-50 p-3 text-center text-[10px] font-medium text-slate-400">
            No events in the next 20 days. Check back later!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((ev) => {
              const Icon = ICONS[ev.icon] || Calendar;
              const daysUntil = ev.triggerDay - cDay;
              return (
                <div key={ev.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${ev.color} text-white shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black text-slate-800">{ev.name}</div>
                    <div className="text-[9px] font-medium text-slate-500">{ev.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-slate-600">{daysUntil}d</div>
                    <div className="text-[8px] font-medium text-slate-400">Day {ev.triggerDay}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Full Calendar</div>
        <div className="grid grid-cols-2 gap-1.5">
          {SEASONAL_EVENTS.map((ev) => {
            const Icon = ICONS[ev.icon] || Calendar;
            const isPast = ev.triggerDay < cDay;
            const isActive = activeCalendarEvent?.id === ev.id;
            return (
              <div key={ev.id} className={`flex items-center gap-1.5 rounded-lg p-1.5 ${isActive ? "bg-amber-50 ring-1 ring-amber-200" : isPast ? "bg-slate-50 opacity-50" : "bg-white ring-1 ring-slate-100"}`}>
                <Icon className={`h-3 w-3 ${ev.tone}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[9px] font-bold text-slate-700">{ev.name}</div>
                  <div className="text-[8px] font-medium text-slate-400">Day {ev.triggerDay}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}