import React from "react";
import { Droplets, AlertTriangle, FlaskConical, ShieldCheck, Activity } from "lucide-react";
import { getQualityInfo, getQualityLevel, QUALITY_THRESHOLDS } from "@/data/waterQuality";
import { getParkItem } from "@/data/gameData";

export default function WaterQualityPanel({ grid, waterQuality, avgQuality, criticalCount, waterAttractionCount }) {
  const waterTiles = [];
  for (let i = 0; i < grid.length; i++) {
    const id = grid[i];
    if (!id) continue;
    const item = getParkItem(id);
    if (!item || item.category !== "attraction") continue;
    // Check if it's a water attraction by looking at the quality array
    if (waterQuality[i] == null) continue;
    waterTiles.push({ idx: i, id, name: item.name, quality: waterQuality[i], icon: item.icon });
  }

  const overallLevel = getQualityLevel(avgQuality);
  const overallInfo = QUALITY_THRESHOLDS[overallLevel];

  return (
    <div className="flex flex-col gap-3">
      {/* Overall quality header */}
      <div className={"rounded-xl p-4 text-white shadow-lg bg-gradient-to-br " + (overallLevel === "excellent" ? "from-emerald-500 to-teal-600" : overallLevel === "good" ? "from-cyan-500 to-blue-600" : overallLevel === "fair" ? "from-amber-500 to-orange-600" : overallLevel === "poor" ? "from-orange-500 to-red-500" : "from-red-500 to-rose-700")}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Overall Water Quality</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-2xl font-black text-white">
              <Droplets className="h-5 w-5" /> {Math.round(avgQuality)}/100
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Status</div>
            <div className="text-lg font-black text-white">{overallInfo.label}</div>
          </div>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${avgQuality}%` }} />
        </div>
        {criticalCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-bold text-white">
            <AlertTriangle className="h-3 w-3" /> {criticalCount} pool{criticalCount > 1 ? "s" : ""} at critical quality — guests are getting sick!
          </div>
        )}
      </div>

      {/* Quality guide */}
      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <FlaskConical className="h-3 w-3 text-cyan-500" /> Quality Levels
        </div>
        <div className="flex flex-col gap-1">
          {Object.entries(QUALITY_THRESHOLDS).map(([level, info]) => (
            <div key={level} className="flex items-center justify-between text-[9px] font-bold">
              <span className={info.color}>{info.label}</span>
              <span className="text-slate-400">{info.min}+ · Mood {info.moodBonus >= 0 ? "+" : ""}{info.moodBonus}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-attraction quality list */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Activity className="h-3 w-3 text-cyan-500" /> Pool Quality Monitor ({waterTiles.length})
        </div>
        {waterTiles.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[10px] font-bold text-slate-400">
            No water attractions built yet.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {waterTiles.map((t) => {
              const info = getQualityInfo(t.quality);
              return (
                <div key={t.idx} className="flex items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-slate-100">
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-700">{t.name}</div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className={"h-full rounded-full " + info.bg} style={{ width: `${t.quality}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={"text-xs font-black " + info.color}>{t.quality}</div>
                    <div className="text-[8px] font-bold uppercase text-slate-400">{info.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-lg bg-cyan-50 p-2.5 ring-1 ring-cyan-100">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-600">
          <ShieldCheck className="h-3 w-3" /> Maintenance Tips
        </div>
        <ul className="mt-1 space-y-0.5 text-[9px] font-medium text-cyan-700">
          <li>• Hire cleaners to maintain pool water quality</li>
          <li>• Research "Filtration Systems" for passive quality boost</li>
          <li>• Build a Water Treatment facility for a large quality boost</li>
          <li>• Storms and heavy rain accelerate quality degradation</li>
          <li>• Critical pools cause illness and reputation damage</li>
        </ul>
      </div>
    </div>
  );
}