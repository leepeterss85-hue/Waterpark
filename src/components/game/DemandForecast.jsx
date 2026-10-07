import React from "react";
import { CalendarClock, TrendingUp, TrendingDown, Sun, CloudRain, Cloud, Sparkles } from "lucide-react";
import { buildDemandOutlook, outlookSummary } from "@/data/demandForecast";

const TONE = {
  rose: "bg-rose-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
  sky: "bg-sky-400",
  blue: "bg-blue-400",
};

function weatherIcon(label) {
  if (/rain|storm|thunder/i.test(label)) return CloudRain;
  if (/cloud/i.test(label)) return Cloud;
  if (/sunny|warm|summer|spring/i.test(label)) return Sun;
  return Cloud;
}

export default function DemandForecast({ day, forecast, seasonEvent, marketShare, ticketPrice }) {
  const days = buildDemandOutlook({ day, forecast, seasonEvent, marketShare, ticketPrice });
  const summary = outlookSummary(days, ticketPrice);
  if (!summary) return null;
  const maxIndex = Math.max(150, ...days.map((d) => d.index));

  return (
    <section className="waterpark-panel bg-white/85 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-cyan-600" />
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">Forward planning</div>
          <h3 className="font-display text-base font-extrabold text-slate-900">7-day demand outlook</h3>
        </div>
      </div>

      <p className="mb-3 text-[11px] leading-4 text-slate-500">
        Projected daily demand from weather, seasonal events and rival pressure. Price ahead of the curve — surge on peak days, discount on soft ones.
      </p>

      {/* 7-day bar chart */}
      <div className="mb-3 flex items-end justify-between gap-1.5 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200" style={{ height: 132 }}>
        {days.map((d) => {
          const heightPct = Math.max(8, Math.round((d.index / maxIndex) * 100));
          const barTone = TONE[d.rec.tone] || "bg-slate-300";
          const WeatherIcon = weatherIcon(d.weatherLabel);
          return (
            <div key={d.offset} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[9px] font-extrabold tabular-nums text-slate-700">{d.index}</span>
              <div className="flex w-full items-end justify-center" style={{ height: 78 }}>
                <div className={`w-full max-w-[26px] rounded-t-md ${barTone} transition-all`} style={{ height: `${heightPct}%` }} />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <WeatherIcon className="h-3 w-3 text-slate-400" />
                <span className="text-[8px] font-bold text-slate-500">D+{d.offset}</span>
                {d.event && <Sparkles className="h-2.5 w-2.5 text-amber-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategy strip */}
      <div className="mb-3 rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 shrink-0 text-indigo-500" />
          <div className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Week strategy</div>
        </div>
        <p className="mt-1 text-[10px] leading-4 font-semibold text-indigo-800">{summary.strategy}</p>
      </div>

      {/* Best & worst day */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
            <TrendingUp className="h-3 w-3" /> Peak day
          </div>
          <div className="mt-0.5 text-xs font-extrabold text-slate-800">Day +{summary.best.offset}</div>
          <div className="text-[10px] font-semibold text-slate-500">
            {summary.best.event ? summary.best.event.name : summary.best.weatherLabel} · {summary.best.index}% demand
          </div>
          <div className="mt-1 text-[10px] font-bold text-emerald-700">Suggest ${summary.best.rec.suggest} ({summary.best.rec.label})</div>
        </div>
        <div className="rounded-xl bg-sky-50 p-2.5 ring-1 ring-sky-100">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-sky-700">
            <TrendingDown className="h-3 w-3" /> Soft day
          </div>
          <div className="mt-0.5 text-xs font-extrabold text-slate-800">Day +{summary.worst.offset}</div>
          <div className="text-[10px] font-semibold text-slate-500">
            {summary.worst.event ? summary.worst.event.name : summary.worst.weatherLabel} · {summary.worst.index}% demand
          </div>
          <div className="mt-1 text-[10px] font-bold text-sky-700">Suggest ${summary.worst.rec.suggest} ({summary.worst.rec.label})</div>
        </div>
      </div>
    </section>
  );
}