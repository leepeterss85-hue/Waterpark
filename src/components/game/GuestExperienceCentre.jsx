import React from "react";
import { Heart, Users, Utensils, BedDouble, Zap, Star, AlertTriangle, TrendingUp } from "lucide-react";

const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, Number(n) || 0));

function Meter({ label, value, icon: Icon }) {
  const v = clamp(value);
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><Icon className="h-3.5 w-3.5 text-cyan-600" />{label}</span>
        <span className="text-xs font-black text-slate-900">{Math.round(v)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export default function GuestExperienceCentre({ visitorStats, guests, reputation, parkAppeal, waterQualityAvg, hotelStats, activeEvents, weather }) {
  const stats = visitorStats || {};
  const queue = stats.queueStats || {};
  const experience = clamp(stats.guestExperience ?? reputation ?? 70);
  const mood = clamp(stats.mood ?? stats.averageMood ?? experience);
  const food = clamp(stats.foodSatisfaction ?? Math.max(45, experience - ((stats.unmetNeeds || 0) * 4)));
  const comfort = clamp((stats.energy ?? 70) * 0.7 + (hotelStats?.occupancy != null ? (100 - hotelStats.occupancy) * 0.3 : 20));
  const queuePressure = clamp(queue.averageWait ? 100 - queue.averageWait * 2 : 82);
  const water = clamp(waterQualityAvg ?? 90);
  const score = Math.round((experience + mood + food + comfort + queuePressure + water + clamp(parkAppeal?.score ?? reputation ?? 70)) / 7);

  const signals = [
    score >= 85 ? "Guests are having an excellent day — premium pricing and events are well supported." :
    score >= 70 ? "Guest experience is healthy. Improving the weakest service can lift repeat visits." :
    "Guest experience needs attention. Focus on queues, needs and comfort before expanding.",
    (queue.averageWait || 0) > 15 ? "Queue pressure is currently the biggest visible friction point." :
    (stats.unmetNeeds || 0) > Math.max(3, guests * 0.03) ? "Unmet guest needs are dragging satisfaction." :
    water < 75 ? "Water quality is becoming a reputation risk." :
    "No major guest-experience warning is currently dominating the park.",
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 p-4 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">Guest Experience Centre</p>
            <h3 className="mt-1 text-xl font-black">{score}/100 Guest Day Score</h3>
            <p className="mt-1 text-xs text-white/80">{guests?.toLocaleString?.() || 0} guests in the park{weather ? ` · ${weather}` : ""}{activeEvents?.length ? ` · ${activeEvents.length} event${activeEvents.length === 1 ? "" : "s"} live` : ""}</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><Heart className="h-5 w-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Meter label="Overall mood" value={mood} icon={Heart} />
        <Meter label="Queue comfort" value={queuePressure} icon={Users} />
        <Meter label="Food & service" value={food} icon={Utensils} />
        <Meter label="Comfort" value={comfort} icon={BedDouble} />
        <Meter label="Water confidence" value={water} icon={Zap} />
        <Meter label="Park appeal" value={parkAppeal?.score ?? reputation} icon={Star} />
      </div>

      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-800"><TrendingUp className="h-4 w-4 text-emerald-600" /> What guests are telling you</div>
        <div className="space-y-2">
          {signals.map((signal, i) => (
            <div key={i} className="flex gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
              {i === 1 && score < 80 ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> : <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500" />}
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
