import React from "react";
import { HardHat, Hotel, Waves, Maximize2, Sparkles, DoorOpen, Clock, PoundSterling, AlertTriangle, CheckCircle2, Star, Construction } from "lucide-react";
import { PROJECT_TYPES, CATEGORY_LABELS } from "@/data/construction";

const CATEGORY_ICONS = { hotel: Hotel, ride: Waves, expansion: Maximize2, renovation: Sparkles, infrastructure: DoorOpen };

export default function ConstructionPanel({ projects, money, day, sandbox, onStartProject, attractionCount }) {
  const active = (projects || []).filter((p) => p.status === "in_progress");
  const completed = (projects || []).filter((p) => p.status === "completed").slice(-4).reverse();

  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
            <HardHat className="h-4 w-4 text-amber-500" /> Active Projects
          </h3>
          <div className="space-y-2">
            {active.map((p) => {
              const def = PROJECT_TYPES.find((pt) => pt.id === p.projectId);
              if (!def) return null;
              const daysElapsed = day - p.startedDay;
              const daysLeft = Math.max(0, def.duration - daysElapsed);
              return (
                <div key={p.projectId + p.startedDay} className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900">{def.name}</h4>
                    {p.needsSpace ? (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white">NEEDS SPACE</span>
                    ) : daysLeft === 0 ? (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">COMPLETING</span>
                    ) : (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black text-white">{daysLeft}d LEFT</span>
                    )}
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/60">
                    <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" /> -{Math.round((1 - def.disruption.guestMult) * 100)}% guests</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {def.duration}d total</span>
                  </div>
                  {p.needsSpace && <p className="mt-1.5 text-[10px] font-bold text-rose-600">No empty lots! Sell a tile or expand to complete.</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
          <Construction className="h-4 w-4 text-slate-600" /> Available Projects
        </h3>
        {["hotel", "ride", "expansion", "renovation", "infrastructure"].map((cat) => {
          const catProjects = PROJECT_TYPES.filter((p) => p.category === cat);
          if (catProjects.length === 0) return null;
          const CatIcon = CATEGORY_ICONS[cat] || HardHat;
          return (
            <div key={cat} className="mb-3">
              <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
                <CatIcon className="h-3.5 w-3.5" /> {CATEGORY_LABELS[cat]}
              </h4>
              <div className="space-y-1.5">
                {catProjects.map((def) => {
                  const isActive = active.some((p) => p.projectId === def.id);
                  const canAfford = sandbox || money >= def.cost;
                  const renovationBlocked = def.category === "renovation" && attractionCount === 0;
                  const disabled = isActive || !canAfford || renovationBlocked;
                  return (
                    <div key={def.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <h5 className="text-sm font-bold text-slate-900">{def.name}</h5>
                      <p className="text-[11px] leading-snug text-slate-500">{def.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                        <span className="flex items-center gap-0.5 rounded-lg bg-rose-50 px-1.5 py-0.5 text-rose-600"><PoundSterling className="h-3 w-3" /> {def.cost.toLocaleString()}</span>
                        <span className="flex items-center gap-0.5 rounded-lg bg-blue-50 px-1.5 py-0.5 text-blue-600"><Clock className="h-3 w-3" /> {def.duration}d</span>
                        <span className="flex items-center gap-0.5 rounded-lg bg-amber-50 px-1.5 py-0.5 text-amber-600"><AlertTriangle className="h-3 w-3" /> -{Math.round((1 - def.disruption.guestMult) * 100)}%</span>
                        <span className="flex items-center gap-0.5 rounded-lg bg-emerald-50 px-1.5 py-0.5 text-emerald-600"><Star className="h-3 w-3" /> +{def.rewards.reputation} rep</span>
                      </div>
                      <button
                        onClick={() => onStartProject(def.id)}
                        disabled={disabled}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 py-2 text-xs font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isActive ? "In Progress" : renovationBlocked ? "No Rides to Renovate" : !canAfford ? "Insufficient Funds" : "Start Construction"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {completed.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-black text-slate-900">Recently Completed</h3>
          <div className="space-y-1">
            {completed.map((p, i) => {
              const def = PROJECT_TYPES.find((pt) => pt.id === p.projectId);
              if (!def) return null;
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="truncate font-bold text-slate-700">{def.name}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-slate-400">Day {p.completedDay}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-slate-100 p-3 text-center text-[11px] leading-relaxed text-slate-500">
        Construction projects cause temporary disruption — reduced guest demand and reputation while work is underway. Upon completion, projects deliver reputation boosts, XP, and new attractions or park expansion. Multiple projects stack disruption, so plan carefully.
      </div>
    </div>
  );
}