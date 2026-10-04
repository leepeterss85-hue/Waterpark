import React from "react";
import { Expand, Maximize2 } from "lucide-react";
import {
  EXPAND_ROW,
  MAX_EXPANSIONS,
  MAX_GRID_SIZE,
  expandCost,
  expandLevelReq,
} from "@/data/gameData";

export default function ExpansionPanel({
  gridSize,
  expansionsDone,
  level,
  money,
  onExpand,
}) {
  const maxed = expansionsDone >= MAX_EXPANSIONS;
  const cost = expandCost(expansionsDone);
  const req = expandLevelReq(expansionsDone);
  const levelOk = level >= req;
  const canAfford = money >= cost;
  const canExpand = !maxed && levelOk && canAfford;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 p-4 shadow-sm ring-1 ring-sky-100">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-500">
          <Maximize2 className="h-3.5 w-3.5" /> Park Area
        </h3>
        <span className="text-[11px] font-semibold text-slate-500">
          {gridSize} / {MAX_GRID_SIZE} lots
        </span>
      </div>

      <div className="mt-2 mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500"
          style={{ width: `${(gridSize / MAX_GRID_SIZE) * 100}%` }}
        />
      </div>

      {maxed ? (
        <div className="rounded-xl bg-white/70 p-2 text-center text-xs font-semibold text-sky-600 ring-1 ring-sky-100">
          Park fully expanded
        </div>
      ) : (
        <button
          onClick={onExpand}
          disabled={!canExpand}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
        >
          <Expand className="h-4 w-4" />
          Expand park · +{EXPAND_ROW} lots
          <span className="ml-1 text-xs font-semibold opacity-90">
            ${cost.toLocaleString()}
          </span>
        </button>
      )}

      {!maxed && !levelOk && (
        <p className="mt-2 text-center text-[11px] font-semibold text-rose-500">
          Requires Level {req}
        </p>
      )}
      {!maxed && levelOk && !canAfford && (
        <p className="mt-2 text-center text-[11px] font-semibold text-rose-500">
          Need ${cost.toLocaleString()} to expand
        </p>
      )}
      <p className="mt-1.5 text-center text-[10px] text-slate-400">
        Expansion {Math.min(expansionsDone + 1, MAX_EXPANSIONS)} / {MAX_EXPANSIONS}
      </p>
    </div>
  );
}