import React from "react";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

export default function GameControls({ playing, speed, onTogglePlay, onSpeed, onAdvance, onReset }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-slate-100">
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onTogglePlay}
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
          playing ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
        }`}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {playing ? "Pause" : "Play"}
      </button>
      <button
        onClick={onAdvance}
        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
      >
        <SkipForward className="h-4 w-4" />
        Next Day
      </button>
      <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              speed === s ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
      <button
        onClick={onReset}
        className="ml-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </button>
    </div>
    </div>
  );
}