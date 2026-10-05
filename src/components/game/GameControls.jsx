import React from "react";
import { Play, Pause, SkipForward, RotateCcw, Clock3, FastForward } from "lucide-react";

export default function GameControls({ playing, speed, onTogglePlay, onSpeed, onAdvance, onReset }) {
  return (
    <section className="park-control-row" aria-label="Park controls">
      <button type="button" onClick={onTogglePlay} aria-label={playing ? "Pause park" : "Open park"} aria-pressed={playing} className="park-control-button park-control-play" data-playing={playing}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        <span>{playing ? "Park Open" : "Open Park"}</span>
      </button>
      <button type="button" onClick={onAdvance} className="park-control-button park-control-next">
        <SkipForward className="h-4 w-4" /><span>Next Day</span>
      </button>
      <div className="park-speed-picker" role="group" aria-label="Game speed">
        <Clock3 className="h-3.5 w-3.5" />
        {[1, 2, 3].map((s) => (
          <button type="button" key={s} onClick={() => onSpeed(s)} aria-label={`${s} times speed`} aria-pressed={speed === s}>
            {s === 3 ? <FastForward className="h-3 w-3" /> : null}{s}×
          </button>
        ))}
      </div>
      <button type="button" onClick={onReset} className="park-control-button park-control-reset"><RotateCcw className="h-4 w-4" /><span>Reset</span></button>
    </section>
  );
}