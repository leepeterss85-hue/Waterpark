import React from "react";
import { Undo2 } from "lucide-react";

// Floating "Undo last build" button — appears only right after a placement,
// refunds the full build cost, then disappears. Sits just under the top bar.
export default function UndoButton({ onUndo }) {
  if (!onUndo) return null;
  return (
    <button
      type="button"
      onClick={onUndo}
      className="fixed left-1/2 top-16 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-lg ring-1 ring-white/15 transition hover:bg-slate-800 active:translate-y-px sm:top-20"
    >
      <Undo2 className="h-3.5 w-3.5" />
      Undo last build
    </button>
  );
}