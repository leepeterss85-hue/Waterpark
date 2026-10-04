import React from "react";
import { Play, Pause, SkipForward, RotateCcw, Clock3, FastForward } from "lucide-react";

export default function GameControls({ playing, speed, onTogglePlay, onSpeed, onAdvance, onReset }) {
  return (
    <section className="game-control-bar">
      <div className="flex flex-wrap items-center gap-2 p-2.5 sm:p-3">
        <button onClick={onTogglePlay} className={"game-primary-button " + (playing ? "game-button-stop" : "game-button-go")}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          <span>{playing ? "Park Open" : "Open Park"}</span>
        </button>
        <button onClick={onAdvance} className="game-action-button">
          <SkipForward className="h-4 w-4 text-cyan-600" /><span>Next Day</span>
        </button>
        <div className="game-speed-picker">
          <Clock3 className="ml-1 h-3.5 w-3.5 text-slate-400" />
          {[1, 2, 3].map((s) => (
            <button key={s} onClick={() => onSpeed(s)} className={speed === s ? "game-speed active" : "game-speed"}>
              {s === 3 ? <FastForward className="h-3 w-3" /> : null}{s}×
            </button>
          ))}
        </div>
        <button onClick={onReset} className="game-reset-button ml-auto"><RotateCcw className="h-3.5 w-3.5" /><span>Reset</span></button>
      </div>
    </section>
  );
}