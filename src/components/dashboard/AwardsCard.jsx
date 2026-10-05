import React from "react";
import { Trophy, Star, TrendingUp } from "lucide-react";

const COLORS = {
  amber: "from-amber-400 to-orange-500",
  red: "from-red-400 to-rose-500",
  violet: "from-violet-400 to-purple-500",
  pink: "from-pink-400 to-rose-500",
  cyan: "from-cyan-400 to-blue-500",
  yellow: "from-yellow-400 to-amber-500",
};

export default function AwardsCard({ awards, awardStats }) {
  const count = awards?.length || 0;
  const guestBoost = Math.round(((awardStats?.currentGuestMult || 1) - 1) * 100);

  return (
    <div className="waterpark-panel p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
          <Trophy className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-slate-900">Park Awards</h3>
          <p className="text-[11px] text-slate-500">Recognition for park excellence</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Awards Held</div>
          <div className="text-lg font-black text-amber-600">{count}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Visitor Boost</div>
          <div className="text-lg font-black text-emerald-600">+{guestBoost}%</div>
        </div>
      </div>

      {count > 0 ? (
        <div className="flex flex-wrap gap-2">
          {(awards || []).map((a) => (
            <div key={a.id} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${COLORS[a.color] || COLORS.cyan} shadow-sm`}>
                <Star className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-700">{a.name}</div>
                <div className="text-[8px] text-slate-400">Day {a.day}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-50 p-4 text-center text-[11px] text-slate-400">
          No awards yet. Meet the requirements to win at the next Annual Awards Ceremony.
        </div>
      )}
    </div>
  );
}