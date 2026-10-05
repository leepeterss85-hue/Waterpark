import React from "react";
import { Play, Pause, SkipForward, RotateCcw, Clock3, FastForward } from "lucide-react";

export default function GameControls({ playing, speed, onTogglePlay, onSpeed, onAdvance, onReset }) {
  return (
    <section className="game-control-bar">
      <div className="flex items-center gap-1.5 p-1.5 sm:gap-2 sm:p-2">
        <button onClick={onTogglePlay} className={"game-primary-button " + (playing ? "game-button-stop" : "game-button-go") + " !min-h-[36px] !px-3 !py-2 text-xs sm:!min-h-[40px] sm:!px-4"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          <span className="hidden xs:inline sm:inline">{playing ? "Open" : "Start"}</span>
        </button>
        <button onClick={onAdvance} className="game-action-button !min-h-[36px] !px-3 !py-2 text-xs sm:!min-h-[40px] sm:!px-4">
          <SkipForward className="h-4 w-4 text-cyan-300" /><span className="hidden xs:inline sm:inline">Next Day</span>
        </button>
        <div className="game-speed-picker !min-h-[36px] sm:!min-h-[40px]">
          <Clock3 className="ml-1 h-3.5 w-3.5 text-white/50" />
          {[1, 2, 3].map((s) => (
            <button key={s} onClick={() => onSpeed(s)} className={speed === s ? "game-speed active" : "game-speed"}>
              {s === 3 ? <FastForward className="h-3 w-3" /> : null}{s}×
            </button>
          ))}
        </div>
        <button onClick={onReset} className="game-reset-button ml-auto !px-2 !py-1.5"><RotateCcw className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reset</span></button>
      </div>
    </section>
  );
}