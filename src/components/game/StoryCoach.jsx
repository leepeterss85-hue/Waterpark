import React, { useEffect, useRef, useState } from "react";
import { BookOpen, ArrowRight, HelpCircle, ChevronDown, ChevronUp, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { storyObjectiveProgress } from "@/data/storyObjectives";
import { getStoryGuide } from "@/lib/storyGuide";

export default function StoryCoach({ game, setOpenSheet, openSheet }) {
  const [details, setDetails] = useState(false);
  const [compact, setCompact] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [chapterNotice, setChapterNotice] = useState(null);
  const previousStepRef = useRef(game.storyStep);
  const step = game.STORY_STEPS?.[game.storyStep];
  const active = game.gameMode === "story" && !game.storyCompleted && !!step;
  const guide = active ? getStoryGuide(step, game) : null;

  useEffect(() => { setExpanded(true); }, [game.storyStep]);

  useEffect(() => {
    const previousStep = previousStepRef.current;
    previousStepRef.current = game.storyStep;
    if (!active || game.storyStep === previousStep) return;
    // The old placement tool must not remain armed when Maya moves on to
    // staffing, time controls or management; that causes accidental purchases.
    const buildObjectives = new Set(["welcome", "expand", "variety", "resort"]);
    if (game.selectedBuild && !buildObjectives.has(step?.id)) game.setSelectedBuild(null);
    if (game.storyStep > previousStep) {
      setChapterNotice({
        previous: game.STORY_STEPS?.[previousStep]?.title || "Objective",
        next: step?.title || "Next objective",
      });
    }
  }, [game.storyStep, active]);

  useEffect(() => {
    if (!chapterNotice) return;
    const timeout = setTimeout(() => setChapterNotice(null), 5500);
    return () => clearTimeout(timeout);
  }, [chapterNotice]);

  useEffect(() => {
    if (!guide || openSheet || details) return;
    const selector = guide.kind === "plot"
      ? '[data-buildable="true"][data-build-affordable="true"]'
      : guide.kind === "ride"
        ? '[data-kind="attraction"]'
        : `[data-tutorial-target="${guide.target}"]`;
    const targets = [...document.querySelectorAll(selector)];
    targets.forEach((el) => el.classList.add("story-action-highlight"));
    return () => targets.forEach((el) => el.classList.remove("story-action-highlight"));
  }, [guide?.kind, guide?.target, openSheet, details, game.grid, active]);

  if (!active) return null;

  const progress = storyObjectiveProgress(step, game);
  const nextMilestone = progress.milestones.find((goal) => goal.current < goal.target) ||
    progress.milestones[0];

  const performAction = (action) => {
    if (!action) return;
    setDetails(false);
    if (action.kind === "clock") {
      if (game.playing) game.advanceDay();
      else game.setPlaying(true);
    } else if (action.kind === "plot" || action.kind === "ride") {
      const selector = action.kind === "plot"
        ? '[data-buildable="true"][data-build-affordable="true"]'
        : '[data-kind="attraction"]';
      const tile = document.querySelector(selector);
      if (tile) {
        tile.dispatchEvent(new CustomEvent("park-focus-tile", { bubbles: true }));
        tile.focus({ preventScroll: true });
      } else {
        setOpenSheet("build");
      }
    } else {
      if (game.selectedBuild && action.target !== "build") game.setSelectedBuild(null);
      setOpenSheet(action.target);
    }
  };

  return (
    <aside
      className={`story-play-guide story-coach-inline${expanded ? "" : " story-coach-collapsed"}`}
      aria-label="Story Mode objective"
      data-story-coach-step={step.id}
    >
      {chapterNotice && <div className="story-guide-chapter-notice" role="status">✓ {chapterNotice.previous} complete · Next: {chapterNotice.next}</div>}
      <div className="story-guide-heading">
        <BookOpen size={18} aria-hidden="true" />
        <span>Maya · Chapter {step.chapter || 1} · {step.title} · Step {game.storyStep + 1}/{game.STORY_STEPS.length}</span>
        <strong>{progress.percent}%</strong>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={expanded ? "Make story guide smaller" : "Show story guide instructions"}
        >
          {expanded ? <ChevronDown size={19} /> : <ChevronUp size={19} />}
        </button>
        <button type="button" onClick={() => setDetails(true)} aria-label="Show full story instructions">
          <HelpCircle size={20} />
        </button>
      </div>
      {expanded && (
        <div className="story-guide-copy" aria-live="polite" aria-atomic="true">
          <p>{guide.text}</p>
          {nextMilestone && (
            <p className="story-guide-milestone">
              {nextMilestone.name}: {Math.min(nextMilestone.current, nextMilestone.target).toLocaleString("en-GB")} / {nextMilestone.target.toLocaleString("en-GB")}
              {progress.alternative ? " · either target counts" : ""}
            </p>
          )}
          <div className="story-guide-progress-track" role="progressbar" aria-label={step.title + " progress"} aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}
      <div className="story-guide-actions">
        <button type="button" className="story-guide-action" onClick={() => performAction(guide)}>
          {guide.label}<ArrowRight size={17} aria-hidden="true" />
        </button>
        {guide.secondary && (
          <button type="button" className="story-guide-secondary" onClick={() => performAction(guide.secondary)}>
            {guide.secondary.label}
          </button>
        )}
      </div>
      <Dialog open={details} onOpenChange={setDetails}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogTitle>{step.title}</DialogTitle>
          <DialogDescription>{step.text}</DialogDescription>
          <p className="text-base font-bold leading-6 text-cyan-900">{guide.text}</p>
          <ul className="space-y-2 text-sm">
            {progress.milestones.map((goal) => (
              <li key={goal.name} className="flex items-center justify-between gap-2 rounded-lg bg-cyan-50 p-2">
                <span className="font-semibold">{goal.name}</span>
                <strong>{Math.min(goal.current, goal.target).toLocaleString("en-GB")} / {goal.target.toLocaleString("en-GB")}</strong>
              </li>
            ))}
          </ul>
          <p className="text-sm">
            {progress.alternative ? "Either listed goal counts." : "Complete the listed goals to continue."} Rewards: £{(step.reward?.money || 0).toLocaleString("en-GB")} and {step.reward?.xp || 0} XP.
          </p>
          <button type="button" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-black text-white hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700" onClick={() => performAction(guide)}>
            {guide.label}<ArrowRight size={18} aria-hidden="true" />
          </button>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
