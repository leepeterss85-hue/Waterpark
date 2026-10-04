import React from "react";
import { Banknote, Users, Ticket, Waves, Wrench, UserRound, Zap, Megaphone, Crown, CloudSun, Sparkles, X, TrendingUp } from "lucide-react";

const Row = ({ icon: Icon, label, value, tone = "text-slate-700" }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
    <span className="flex min-w-0 items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-600" />{label}
    </span>
    <b className={"text-xs " + tone}>{value}</b>
  </div>
);

export default function DailySummary({ report, onClose }) {
  if (!report) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl ring-1 ring-white/60" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-700 px-5 pb-5 pt-5 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/65">Daily Operations Report</div>
              <h2 className="mt-1 font-display text-2xl font-black">Day ${report.day} complete</h2>
              <p className="mt-1 text-[11px] font-semibold text-white/75">${report.weather || "Normal conditions"}${report.event ? " · " + report.event : ""}</p>
            </div>
            <button onClick={onClose} aria-label="Close daily report" className="rounded-xl bg-white/15 p-2 hover:bg-white/25"><X className="h-4 w-4" /></button>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/12 p-3"><Users className="h-4 w-4 text-white/80" /><div className="mt-1 text-lg font-black">${(report.guests || 0).toLocaleString()}</div><div className="text-[8px] font-bold uppercase text-white/60">Guests</div></div>
            <div className="rounded-2xl bg-white/12 p-3"><Banknote className="h-4 w-4 text-white/80" /><div className={"mt-1 text-lg font-black " + ((report.net || 0) >= 0 ? "text-emerald-200" : "text-rose-200")}>${(report.net || 0) >= 0 ? "+" : ""}${(report.net || 0).toLocaleString()}</div><div className="text-[8px] font-bold uppercase text-white/60">Net profit</div></div>
            <div className="rounded-2xl bg-white/12 p-3"><TrendingUp className="h-4 w-4 text-white/80" /><div className="mt-1 text-lg font-black">${Math.round(report.reputation || 0)}</div><div className="text-[8px] font-bold uppercase text-white/60">Reputation</div></div>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <div className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Revenue</div>
          <Row icon={Ticket} label="Admission" value={"$" + (report.ticketRevenue || 0).toLocaleString()} tone="text-emerald-600" />
          <Row icon={Waves} label="Attractions & rides" value={"$" + (report.rideIncome || 0).toLocaleString()} tone="text-emerald-600" />
          <div className="my-2 border-t border-slate-100" />
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Operating costs</div>
          <Row icon={Wrench} label="Upkeep" value={"-$" + (report.upkeep || 0).toLocaleString()} tone="text-rose-500" />
          <Row icon={UserRound} label="Staff wages" value={"-$" + (report.wages || 0).toLocaleString()} tone="text-rose-500" />
          <Row icon={Zap} label="Utilities" value={"-$" + (report.utilities || 0).toLocaleString()} tone="text-rose-500" />
          <Row icon={Megaphone} label="Marketing" value={"-$" + (report.marketing || 0).toLocaleString()} tone="text-rose-500" />
          ${report.premium > 0 && <Row icon={Crown} label="Premium service" value={"-$" + report.premium.toLocaleString()} tone="text-rose-500" />}
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
            <span className="text-[10px] font-black uppercase tracking-wider">Operating result</span>
            <span className={(report.net || 0) >= 0 ? "font-black text-emerald-300" : "font-black text-rose-300"}>${(report.net || 0) >= 0 ? "+" : ""}${(report.net || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 text-[9px] font-bold text-slate-400"><CloudSun className="h-3.5 w-3.5" /> ${report.weather || "Normal"} ${report.event ? "· " + report.event : ""}<Sparkles className="h-3.5 w-3.5 text-amber-400" /></div>
          <button onClick={onClose} className="mt-1 w-full rounded-xl bg-cyan-500 py-3 text-sm font-black text-white shadow-sm hover:bg-cyan-600">Continue to park</button>
        </div>
      </div>
    </div>
  );
}
