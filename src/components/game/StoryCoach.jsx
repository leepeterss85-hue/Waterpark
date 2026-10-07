import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight, Sparkles, X, Zap } from "lucide-react";

export default function StoryCoach({ game, onOpen, onSkip }) {
  if (game.gameMode !== "story" || game.storyCompleted) return null;
  const step = game.STORY_STEPS?.[game.storyStep];
  if (!step) return null;
  const total = game.STORY_STEPS.length || 1;
  const progress = Math.min(100, Math.round((game.storyStep / Math.max(1, total - 1)) * 100));
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-3 sm:bottom-6">
      <Card className="pointer-events-auto w-full max-w-md overflow-hidden border-cyan-200 bg-white/95 shadow-2xl backdrop-blur">
        <div className="h-1 bg-slate-100"><div className="h-full bg-cyan-500 transition-all" style={{ width: progress + "%" }} /></div>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-700"><Sparkles className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-cyan-700">
                <BookOpen className="h-3.5 w-3.5" /> Maya • Story Mode
                <span className="ml-auto text-slate-400">{game.storyStep + 1}/{total}</span>
              </div>
              <h3 className="mt-1 text-base font-black text-slate-900">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{step.text}</p>
            </div>
            <button type="button" onClick={onSkip} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Skip Story Mode"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-cyan-800"><Zap className="h-3.5 w-3.5" /> Your objective</div>
            <div className="mt-1 text-sm font-bold text-slate-800">{step.action}</div>
            {step.reward && <div className="mt-2 text-[10px] font-semibold text-slate-500">Reward: +$(step.reward.money || 0).toLocaleString() • +{step.reward.xp || 0} XP • +{step.reward.reputation || 0} reputation</div>}
          </div>
          {step.target && (
            <Button className="mt-3 w-full" onClick={() => onOpen(step.target)}>
              Open {step.target === "build" ? "Build" : step.target === "staff" ? "Staff" : step.target === "research" ? "Research" : "Manage"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          <button type="button" onClick={onSkip} className="mt-2 w-full text-[10px] font-bold text-slate-400 hover:text-slate-600">Skip guided Story Mode</button>
        </CardContent>
      </Card>
    </div>
  );
}
