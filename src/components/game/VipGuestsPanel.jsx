import React from "react";
import { Camera, Medal, PenLine, Crown, Music, Star, Clock } from "lucide-react";
import { VIP_TYPES, getVipType } from "@/data/vipGuests";

const ICONS = { Camera, Medal, PenLine, Crown, Music };

export default function VipGuestsPanel({ activeVip, vipHistory, level }) {
  const eligible = VIP_TYPES.filter((t) => level >= t.minLevel);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-gradient-to-r from-pink-50 to-fuchsia-50 p-3 ring-1 ring-pink-100">
        <div className="text-xs font-black text-pink-700">VIP Celebrity Guests</div>
        <p className="mt-0.5 text-[10px] font-medium text-pink-600">
          Celebrities visit randomly. Keep your park clean, safe and guests happy to impress them for big rewards.
        </p>
      </div>

      {activeVip ? (
        <div className={`overflow-hidden rounded-xl border-2 border-pink-300 bg-white shadow-md`}>
          <div className={`flex items-center gap-2 bg-gradient-to-r ${getVipType(activeVip.typeId)?.color || "from-pink-400 to-fuchsia-500"} px-3 py-2`}>
            <Star className="h-4 w-4 animate-pulse text-white" />
            <div className="flex-1">
              <div className="text-xs font-black text-white">{activeVip.name}</div>
              <div className="text-[9px] font-bold text-white/80">{activeVip.typeName} · Visiting now!</div>
            </div>
          </div>
          <div className="p-3">
            <p className="text-[10px] font-medium text-slate-600">{getVipType(activeVip.typeId)?.desc}</p>
            <p className="mt-1.5 text-[9px] font-bold text-amber-600">⏳ Their verdict comes at end of day.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <Star className="mx-auto h-5 w-5 text-slate-300" />
          <div className="mt-1 text-[10px] font-bold text-slate-400">No VIP visiting today</div>
          <div className="text-[9px] font-medium text-slate-400">Keep your park running well to attract celebrities!</div>
        </div>
      )}

      <div>
        <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Celebrity Types</div>
        <div className="flex flex-col gap-2">
          {VIP_TYPES.map((t) => {
            const Icon = ICONS[t.icon] || Star;
            const isUnlocked = level >= t.minLevel;
            return (
              <div key={t.id} className={`flex items-center gap-2 rounded-xl border p-2.5 ${isUnlocked ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${t.color} text-white shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black text-slate-800">{t.name}</div>
                  <div className="text-[9px] font-medium text-slate-500">{t.desc}</div>
                </div>
                {!isUnlocked && <div className="text-[8px] font-bold text-slate-400">Lvl {t.minLevel}+</div>}
              </div>
            );
          })}
        </div>
      </div>

      {vipHistory && vipHistory.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Recent Visits</div>
          <div className="flex flex-col gap-1.5">
            {vipHistory.slice(0, 8).map((v, i) => {
              const type = getVipType(v.typeId);
              const tone = v.outcome === "impressed" ? "text-emerald-600" : v.outcome === "disappointed" ? "text-red-500" : "text-amber-600";
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-100">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-slate-700">{v.name}</div>
                    <div className="text-[9px] font-medium text-slate-400">Day {v.day} · {type?.name}</div>
                  </div>
                  <div className={`text-[9px] font-black capitalize ${tone}`}>{v.outcome}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}