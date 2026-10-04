import React from "react";
import { Plus, Minus, Users } from "lucide-react";
import { STAFF } from "@/data/gameData";
import { getIcon } from "./icons";

function EffectMeter({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function StaffPanel({
  money,
  staff,
  staffWages,
  uptime,
  safety,
  cleanliness,
  entertainment,
  onHire,
  onFire,
}) {
  const types = Object.values(STAFF);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Staff
        </h3>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-500">
          ${staffWages}/day
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <EffectMeter
          label="Uptime"
          value={uptime}
          color="bg-gradient-to-r from-amber-400 to-orange-500"
        />
        <EffectMeter
          label="Safety"
          value={safety}
          color="bg-gradient-to-r from-cyan-400 to-blue-500"
        />
        <EffectMeter
          label="Clean"
          value={cleanliness}
          color="bg-gradient-to-r from-emerald-400 to-green-500"
        />
        <EffectMeter
          label="Vibe"
          value={Math.min(1, (entertainment || 0) / 6)}
          color="bg-gradient-to-r from-pink-400 to-rose-500"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {types.map((s) => {
          const count = staff[s.id] || 0;
          const Icon = getIcon(s.icon);
          const canHire = money >= s.wage;
          return (
            <div key={s.id} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${s.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                    <span className="text-xs font-semibold text-slate-400">${s.wage}/day</span>
                  </div>
                  <p className="truncate text-[11px] text-slate-400">{s.description}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <Users className="h-3.5 w-3.5" /> {count} hired
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onFire(s.id)}
                    disabled={count === 0}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onHire(s.id)}
                    disabled={!canHire}
                    className="flex h-7 items-center gap-1 rounded-lg bg-slate-900 px-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" /> Hire
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}