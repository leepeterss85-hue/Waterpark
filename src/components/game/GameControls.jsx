import React from "react";
import { Play, Pause, SkipForward, RotateCcw, Clock3 } from "lucide-react";

export default function GameControls({ playing, speed, onTogglePlay, onSpeed, onAdvance, onReset }) {
  return (
    <section className="waterpark-panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
        <button
          onClick={onTogglePlay}
          className={"flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5 " + (playing ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600")}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Park Open" : "Open Park"}
        </button>
        <button onClick={onAdvance} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-sky-50">
          <SkipForward className="h-4 w-4 text-cyan-600" />
          Next Day
        </button>
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200">
          <Clock3 className="ml-1 h-3.5 w-3.5 text-slate-400" />
          {[1, 2, 3].map((s) => (
            <button key={s} onClick={() => onSpeed(s)} className={"rounded-lg px-3 py-1.5 text-sm font-extrabold transition " + (speed === s ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-700")}>
              {s}×
            </button>
          ))}
        </div>
        <button onClick={onReset} className="ml-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
          <RotateCcw className="h-4 w-4" /> Reset Park
        </button>
      </div>
    </section>
  );
}