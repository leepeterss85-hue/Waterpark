import React from "react";
import { PoundSterling, Users, Star, CalendarDays, TrendingUp } from "lucide-react";

function satisfactionLabel(r) {
  if (r >= 80) return "Excellent";
  if (r >= 60) return "Good";
  if (r >= 40) return "Fair";
  return "Poor";
}

function Card({ icon: Icon, label, value, sub = "", tone }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="text-xl font-bold text-slate-800 font-display tabular-nums">
            {value}
          </div>
          {sub && <div className="truncate text-xs text-slate-400">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({ history, guests, reputation, day, lastNet }) {
  const avgIncome =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.income, 0) / history.length)
      : 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card
        icon={PoundSterling}
        label="Today's Income"
        value={`£${Math.max(0, lastNet).toLocaleString()}`}
        sub={`net ${lastNet >= 0 ? "+" : ""}£${lastNet.toLocaleString()}`}
        tone="bg-gradient-to-br from-emerald-400 to-green-500"
      />
      <Card
        icon={Users}
        label="Visitors Today"
        value={guests.toLocaleString()}
        tone="bg-gradient-to-br from-cyan-400 to-teal-500"
      />
      <Card
        icon={Star}
        label="Satisfaction"
        value={`${reputation}%`}
        sub={satisfactionLabel(reputation)}
        tone="bg-gradient-to-br from-amber-400 to-orange-500"
      />
      <Card
        icon={TrendingUp}
        label="Avg Daily Income"
        value={`£${avgIncome.toLocaleString()}`}
        tone="bg-gradient-to-br from-sky-400 to-blue-500"
      />
      <Card
        icon={CalendarDays}
        label="Days Operated"
        value={day}
        tone="bg-gradient-to-br from-violet-400 to-purple-500"
      />
    </div>
  );
}