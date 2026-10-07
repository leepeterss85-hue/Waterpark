import React from "react";
import { UsersRound, Check, X, Clock, TrendingDown } from "lucide-react";
import { getGroupType } from "@/data/groupBookings";
import { getIcon } from "./icons";

export default function GroupBookingsPanel({ bookings = [], onAccept, onDecline, guests, level }) {
  return (
    <section className="waterpark-panel bg-white/85 p-4">
      <div className="mb-3 flex items-center gap-2">
        <UsersRound className="h-4 w-4 text-cyan-600" />
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">Group sales</div>
          <h3 className="font-display text-base font-extrabold text-slate-900">Group bookings</h3>
        </div>
      </div>

      <p className="mb-3 text-[11px] leading-4 text-slate-500">
        Schools, camps and companies request group slots for guaranteed upfront cash. Accept to bank the payment now — the group arrives next day, crowding the park and dragging down guest mood.
      </p>

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
          <Clock className="mx-auto mb-1.5 h-6 w-6 text-slate-300" />
          <div className="text-[11px] font-semibold text-slate-400">No pending requests. New groups enquire as your reputation grows.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const Icon = getIcon(b.icon || "Users");
            return (
              <div key={b.id} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-700">{b.name}</div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {b.size} guests · ${b.payment.toLocaleString()} upfront
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600">
                  <TrendingDown className="h-3 w-3" /> Mood impact {b.moodImpact} on arrival
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => onAccept(b.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-2 text-[11px] font-extrabold text-white transition hover:bg-emerald-600"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept ${b.payment.toLocaleString()}
                  </button>
                  <button
                    onClick={() => onDecline(b.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}