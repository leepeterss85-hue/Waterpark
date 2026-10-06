import React, { useState, useEffect } from "react";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { TUTORIAL_STEPS, TUTORIAL_KEY } from "@/data/tutorial";

const STEP_TARGETS = { build: "build", open: "open", staff: "staff" };

export default function Tutorial({ game }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(TUTORIAL_KEY) === "1");
  const [step, setStep] = useState(0);

  // Only show for a genuinely new park: day 1, nothing built yet, never dismissed.
  const hasProgress = game.grid.some((id) => id && id !== "park_entrance" && id !== "main_path");
  const shouldShow = !dismissed && game.day <= 1 && !hasProgress && step < TUTORIAL_STEPS.length;

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const targetId = STEP_TARGETS[current?.id];

  // Highlight the relevant UI element for the current step
  useEffect(() => {
    if (!shouldShow || !targetId) return;
    const el = document.querySelector(`[data-tutorial-target="${targetId}"]`);
    if (el) el.classList.add("tutorial-highlight-target");
    return () => {
      if (el) el.classList.remove("tutorial-highlight-target");
    };
  }, [targetId, step, shouldShow]);

  if (!shouldShow) return null;

  const finish = () => {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setDismissed(true);
  };

  const next = () => {
    if (isLast) finish();
    else setStep((s) => s + 1);
  };

  const skip = () => finish();

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="relative bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 px-5 py-4 text-white">
          <button type="button" onClick={skip} aria-label="Skip tutorial" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white transition hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80">
            <Sparkles className="h-3.5 w-3.5" />
            Tutorial · Step {step + 1} of {TUTORIAL_STEPS.length}
          </div>
          <h2 className="mt-1 font-display text-lg font-bold leading-tight">{current.title}</h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-600">{current.body}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {TUTORIAL_STEPS.map((s, i) => (
                <span key={s.id} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-cyan-500" : "bg-slate-200"}`} />
              ))}
            </div>
            <button type="button" onClick={next} className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 active:translate-y-px">
              {current.cta}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
          <button type="button" onClick={skip} className="mt-3 w-full text-center text-[11px] font-semibold text-slate-400 transition hover:text-slate-600">
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}