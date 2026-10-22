import React, { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, CircleCheck, MapPin, Sparkles } from "lucide-react";
import { storyObjectiveProgress } from "@/data/storyObjectives";

const TARGETS = {
  build: { label: "Open Build", sheet: "build" },
  staff: { label: "Open Staff", sheet: "staff" },
  research: { label: "Open Research", sheet: "research" },
  manage: { label: "Open Manage", sheet: "manage" },
  resort: { label: "Open Resort", sheet: "resort" },
  emergencies: { label: "Open Emergency Centre", sheet: "emergencies" },
  competitors: { label: "Open Rival Parks", sheet: "competitors" },
  advancedPark: { label: "Open Destinations", sheet: "advancedPark" },
};

const money = amount => `£${(Number(amount) || 0).toLocaleString("en-GB")}`;

export default function StoryCoach({ game, setOpenSheet }) {
  const [expanded, setExpanded] = useState(false);
  const step = game.STORY_STEPS?.[game.storyStep];
  // A new objective starts compact, preserving map space on mobile.
  useEffect(() => { setExpanded(false); }, [step?.id]);
  if (game.gameMode !== "story" || game.storyCompleted || !step) return null;

  const progress = storyObjectiveProgress(step, game);
  const target = TARGETS[step.target];
  const totalSteps = Math.max(1, game.STORY_STEPS.length);
  const current = game.storyStep + 1;
  const chapter = step.chapter || 1;
  const headline = `Chapter ${chapter}: ${step.title}`;
  const primaryGoal = progress.milestones.find(item => item.current < item.target)
    || progress.milestones[0];

  return (
    <section className="story-coach-inline" aria-label="Story Mode objective" data-story-coach-step={step.id}>
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-600 text-white shadow-sm">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Maya's guide · Step {current}/{totalSteps}</p>
          <p className="truncate text-xs font-black text-slate-900 sm:text-sm">{headline}</p>
          <p className="truncate text-[11px] leading-4 text-slate-600">{step.action}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {primaryGoal && <span className="hidden max-w-36 truncate rounded-lg bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-800 sm:inline">
          {primaryGoal.current.toLocaleString("en-GB")}/{primaryGoal.target.toLocaleString("en-GB")} {primaryGoal.name}
        </span>}
        <span className="min-w-9 text-right text-xs font-black tabular-nums text-cyan-800">{progress.percent}%</span>
        {target && <button type="button" className="story-coach-toggle" onClick={() => setOpenSheet?.(target.sheet)}
          aria-label={target.label} title={target.label}><MapPin className="h-4 w-4" /></button>}
        <button type="button" className="story-coach-toggle" onClick={() => setExpanded(value => !value)}
          aria-label={expanded ? "Hide story instructions" : "Show story instructions"}
          aria-expanded={expanded} title={expanded ? "Less detail" : "Your next steps"}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      <div className="w-full overflow-hidden rounded-full bg-slate-200" style={{ height: 4 }} aria-hidden="true">
        <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress.percent}%` }} />
      </div>
      {expanded && <div className="w-full space-y-2 border-t border-cyan-100 pt-2">
        <p className="text-xs leading-5 text-slate-700">{step.text}</p>
        <p className="text-xs font-semibold text-cyan-900">{step.action}</p>
        {progress.milestones.length > 0 && <div className="grid gap-1 sm:grid-cols-2" aria-label="Objective progress">
          {progress.milestones.map(goal =>
            <div key={goal.name} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5 text-[11px] text-slate-700 ring-1 ring-cyan-100">
              <span className="inline-flex items-center gap-1 truncate">
                {goal.current >= goal.target ? <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
                {goal.name}
              </span>
              <b className="shrink-0 tabular-nums">{Math.min(goal.current,goal.target).toLocaleString("en-GB")}/{goal.target.toLocaleString("en-GB")}</b>
            </div>
          )}
        </div>}
        {progress.alternative && <p className="text-[10px] text-slate-500">Reach any one of the targets above to complete this objective.</p>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 text-[10px] font-bold text-slate-600">
            <span className="rounded-full bg-emerald-50 px-2 py-1">+{money(step.reward?.money)}</span>
            <span className="rounded-full bg-violet-50 px-2 py-1">+{step.reward?.xp || 0} XP</span>
            {step.reward?.research ? <span className="rounded-full bg-sky-50 px-2 py-1">+{step.reward.research} research</span> : null}
          </div>
          {target ? <button className="story-coach-cta" type="button" onClick={() => setOpenSheet?.(target.sheet)}>
            <MapPin className="h-3.5 w-3.5" />{target.label}<ArrowRight className="h-3.5 w-3.5" />
          </button> : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800"><Sparkles className="h-3.5 w-3.5" /> Play to complete</span>}
        </div>
      </div>}
    </section>
  );
}
