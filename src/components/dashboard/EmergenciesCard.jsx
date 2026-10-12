import React from "react";
import { Siren, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SEVERITY_LABELS, SEVERITY_COLORS } from "@/data/emergencies";

const ICONS = { Wrench: AlertTriangle, HeartPulse: AlertTriangle, Baby: AlertTriangle, CloudLightning: AlertTriangle, Droplet: AlertTriangle, Footprints: AlertTriangle };

export default function EmergenciesCard({ emergencies, emergencyStats }) {
  const active = emergencies || [];
  const activeCount = active.length;
  const criticalCount = active.filter((e) => e.severity >= 3).length;
  const totalCost = emergencyStats?.totalCost || 0;
  const resolvedCount = emergencyStats?.resolvedCount || 0;

  return (
    <div className="waterpark-panel p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-xl shadow-md ${activeCount > 0 ? "bg-gradient-to-br from-rose-400 to-red-600" : "bg-gradient-to-br from-emerald-400 to-teal-500"}`}>
          <Siren className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-slate-900">Emergencies</h3>
          <p className="text-[11px] text-slate-500">Incident response & recovery</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Active</div>
          <div className={`text-lg font-black ${activeCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{activeCount}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Resolved</div>
          <div className="text-lg font-black text-emerald-600">{resolvedCount}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Costs</div>
          <div className="text-lg font-black text-rose-600">${totalCost > 999 ? `${(totalCost / 1000).toFixed(1)}K` : totalCost}</div>
        </div>
      </div>

      {active.length > 0 ? (
        <div className="space-y-1.5">
          {active.slice(0, 4).map((em) => {
            const sevColor = SEVERITY_COLORS[em.severity] || SEVERITY_COLORS[1];
            return (
              <div key={em.id} className={`flex items-center gap-2 rounded-lg ${sevColor.bg} p-2`}>
                <span className={`h-2 w-2 shrink-0 rounded-full ${sevColor.badge}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[11px] font-bold text-slate-700">{em.name}</span>
                    <span className="text-[9px] font-bold text-slate-500">{SEVERITY_LABELS[em.severity]}</span>
                  </div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-white/60">
                    <div className={`h-full rounded-full ${sevColor.badge}`} style={{ width: `${em.progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg bg-emerald-50 p-3 text-center text-[11px] text-emerald-600">
          <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
          No active emergencies. Park is operating safely.
        </div>
      )}
    </div>
  );
}