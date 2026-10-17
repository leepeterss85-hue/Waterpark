import React from "react";
import { Plus, Minus, Users } from "lucide-react";
import { STAFF } from "@/data/gameData";
import { getIcon } from "./icons";
import StaffTrainingSection from "./StaffTrainingSection";
import StaffMoraleSection from "./StaffMoraleSection";
import { staffLevelFromXp, trainingEffectMult, trainingCost, MAX_STAFF_LEVEL } from "@/data/staffTraining";

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
  assignments = {},
  zones = [],
  onAssign,
  staffXp = {},
  onTrainStaff,
  staffMorale,
  wageBoost,
  guests,
  onPayBonus,
  onToggleWageBoost,
}) {
  const types = Object.values(STAFF);
  const staffTotal = Object.values(staff).reduce((s, n) => s + (n || 0), 0);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Staff
        </h3>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-500">
          £{staffWages}/day
        </span>
      </div>

      <StaffMoraleSection
        morale={staffMorale}
        guests={guests || 0}
        staffTotal={staffTotal}
        wageBoost={wageBoost}
        money={money}
        onToggleWageBoost={onToggleWageBoost}
        onPayBonus={onPayBonus}
      />

      <p className="mb-3 text-[11px] leading-4 text-slate-500">Assign each team to a colour-coded park zone. Unassigned staff continue to cover the whole park. Mechanics and cleaners respond to incidents in their assigned area.</p>
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

      <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
        <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Workforce planner</span><span className="text-[9px] font-bold text-slate-500">Live staffing advice</span></div>
        {(() => {
          const gaps = [
            { label: "Safety", value: safety, target: 0.82, role: "lifeguards / security" },
            { label: "Uptime", value: uptime, target: 0.82, role: "mechanics" },
            { label: "Cleanliness", value: cleanliness, target: 0.82, role: "cleaners" },
          ];
          const gap = gaps.reduce((a, b) => (b.target - b.value) > (a.target - a.value) ? b : a, gaps[0]);
          const priority = gap.target - gap.value > 0.04 ? "Priority: strengthen " + gap.label.toLowerCase() + " with more " + gap.role + "." : entertainment < 2 ? "Consider an entertainer or event coordinator to improve guest atmosphere." : "Staffing is balanced. Train your strongest teams before hiring more.";
          return <div className="text-[10px] font-bold leading-4 text-emerald-900">{priority}</div>;
        })()}
      </div>

      <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wide text-indigo-500">Management efficiency</span>
          <span className="text-[10px] font-bold text-slate-500">Training improves output</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {types.filter((s) => (staff[s.id] || 0) > 0).slice(0, 4).map((s) => {
            const count = staff[s.id] || 0;
            const xp = staffXp[s.id] || 0;
            const level = staffLevelFromXp(xp);
            const efficiency = Math.round((trainingEffectMult(s.id, xp) - 1) * 100);
            const nextCost = level < MAX_STAFF_LEVEL ? trainingCost(s.id, xp) : null;
            return (
              <div key={s.id} className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-indigo-100">
                <div className="truncate text-[10px] font-black text-slate-700">{s.name}</div>
                <div className="mt-0.5 text-[9px] font-bold text-indigo-600">Lv {level} · +{efficiency}%</div>
                <div className="mt-0.5 text-[9px] text-slate-400">{count} employed{nextCost ? " · Train £" + nextCost.toLocaleString() : " · MAX"}</div>
              </div>
            );
          })}
        </div>
        {types.every((s) => !(staff[s.id] || 0)) && <div className="text-[10px] text-slate-400">Hire staff to start building trained management capacity.</div>}
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
                    <span className="text-xs font-semibold text-slate-400">£{s.wage}/day</span>
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
              <div className="mt-2 flex items-center gap-2">
                <label htmlFor={`staff-zone-${s.id}`} className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Assignment</label>
                <select
                  id={`staff-zone-${s.id}`}
                  value={assignments[s.id] || ""}
                  onChange={(event) => onAssign?.(s.id, event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-cyan-400"
                >
                  <option value="">Park-wide</option>
                  {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.label}</option>)}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <StaffTrainingSection staff={staff} staffXp={staffXp} money={money} onTrain={onTrainStaff} />
    </div>
  );
}