import React from "react";
import { Siren, Wrench, HeartPulse, Baby, CloudLightning, Droplet, Footprints, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { EMERGENCY_TYPES, SEVERITY_LABELS, SEVERITY_COLORS } from "@/data/emergencies";

const ICONS = { Wrench, HeartPulse, Baby, CloudLightning, Droplet, Footprints };

export default function EmergenciesPanel({ emergencies, emergencyStats }) {
  const active = emergencies || [];
  const activeCount = active.length;
  const criticalCount = active.filter((e) => e.severity >= 3).length;
  const totalCost = emergencyStats?.totalCost || 0;
  const totalEmergencies = emergencyStats?.totalEmergencies || 0;
  const resolvedCount = emergencyStats?.resolvedCount || 0;

  return (
    <div className="space-y-4">
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-sm">
          <Siren className="mx-auto h-4 w-4 text-rose-500" />
          <div className="mt-1 text-lg font-black text-slate-900">{activeCount}</div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Active</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-4 w-4 text-amber-500" />
          <div className="mt-1 text-lg font-black text-slate-900">{totalEmergencies}</div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Total</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
          <div className="mt-1 text-lg font-black text-slate-900">{resolvedCount}</div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Resolved</div>
        </div>
      </div>

      {totalCost > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-bold text-rose-600">
          Total emergency costs: ${totalCost.toLocaleString()}
        </div>
      )}

      {/* Active emergencies */}
      <div>
        <h3 className="mb-2 text-sm font-black text-slate-900">Active Emergencies</h3>
        {active.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-center text-xs text-emerald-600">
            <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-emerald-400" />
            No active emergencies. Your park is safe.
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((em) => {
              const Icon = ICONS[em.icon] || Siren;
              const sevColor = SEVERITY_COLORS[em.severity] || SEVERITY_COLORS[1];
              return (
                <div key={em.id} className={`rounded-xl border-2 ${sevColor.border} ${sevColor.bg} p-3`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/80 ${sevColor.text} shadow-sm`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-slate-900">{em.name}</h4>
                        <span className={`shrink-0 rounded-full ${sevColor.badge} px-2 py-0.5 text-[9px] font-black uppercase text-white`}>
                          {SEVERITY_LABELS[em.severity]}
                        </span>
                      </div>
                      {em.locationName && <p className="text-[11px] font-bold text-slate-500">📍 {em.locationName}</p>}
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        Cost: ${em.cost.toLocaleString()} · Rep impact: -{em.repImpact} · Day {em.day}
                      </p>
                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                          <span>Staff response: {em.staffRequired}{em.altStaff ? ` / ${em.altStaff}` : ""}</span>
                          <span>{em.progress}%</span>
                        </div>
                        <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-white/60">
                          <div className={`h-full rounded-full ${sevColor.badge} transition-all`} style={{ width: `${em.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Emergency types reference */}
      <div>
        <h3 className="mb-2 text-sm font-black text-slate-900">Emergency Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {EMERGENCY_TYPES.map((type) => {
            const Icon = ICONS[type.icon] || Siren;
            return (
              <div key={type.id} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-700">{type.name}</span>
                </div>
                <p className="mt-1 text-[10px] leading-snug text-slate-500">{type.description}</p>
                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-slate-400">
                  <Users className="h-2.5 w-2.5" /> {type.staffRequired}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-slate-100 p-3 text-center text-[11px] leading-relaxed text-slate-500">
        Emergencies occur based on park conditions — low ride condition, poor cleanliness, severe weather, and high guest counts all increase risk. Hire the right staff to respond quickly; fast resolution reduces reputation damage. Unresolved emergencies escalate in severity.
      </div>
    </div>
  );
}