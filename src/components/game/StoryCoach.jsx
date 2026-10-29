import React, { useEffect, useState } from "react";
import { BookOpen, ArrowRight, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { storyObjectiveProgress } from "@/data/storyObjectives";
import { getStoryGuide } from "@/lib/storyGuide";

export default function StoryCoach({ game, setOpenSheet, openSheet }) {
  const [details, setDetails] = useState(false);
  const step = game.STORY_STEPS?.[game.storyStep];
  const active = game.gameMode === 'story' && !game.storyCompleted && !!step;
  const guide = active ? getStoryGuide(step, game) : null;
  useEffect(() => {
    if (!guide || openSheet || details) return;
    const selector = guide.kind === 'plot' ? '[data-buildable="true"][data-build-affordable="true"]' : guide.kind === 'ride' ? '[data-kind="attraction"]' : `[data-tutorial-target="${guide.target}"]`;
    const targets = [...document.querySelectorAll(selector)];
    targets.forEach(el => el.classList.add('story-action-highlight'));
    return () => targets.forEach(el => el.classList.remove('story-action-highlight'));
  }, [guide?.kind, guide?.target, openSheet, details, game.grid, active]);
  if (!active) return null;
  const progress = storyObjectiveProgress(step, game);
  const act = () => {
    setDetails(false);
    if (guide.kind === 'clock') {
      if (game.playing) game.advanceDay(); else game.setPlaying(true);
    } else if (guide.kind === 'plot' || guide.kind === 'ride') {
      const selector = guide.kind === 'plot' ? '[data-buildable="true"][data-build-affordable="true"]' : '[data-kind="attraction"]';
      const tile = document.querySelector(selector);
      if (tile) tile.dispatchEvent(new CustomEvent('park-focus-tile', {bubbles:true}));
      else setOpenSheet('build');
    } else setOpenSheet(guide.target);
  };
  return <aside className="story-play-guide story-coach-inline" aria-label="Story Mode objective" data-story-coach-step={step.id}>
    <div className="story-guide-heading"><BookOpen size={18}/><span>Maya · Chapter {step.chapter || 1}</span><strong>{progress.percent}%</strong><button type="button" onClick={() => setDetails(true)} aria-label="Show story instructions"><HelpCircle size={20}/></button></div>
    <div className="story-guide-copy" aria-live="polite" aria-atomic="true"><h3>{step.title}</h3><p>{guide.text}</p></div>
    <button type="button" className="story-guide-action" onClick={act}>{guide.label}<ArrowRight size={18}/></button>
    <Dialog open={details} onOpenChange={setDetails}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>{step.title}</DialogTitle><DialogDescription>{step.text}</DialogDescription>
        <p className="text-base font-bold leading-6 text-cyan-900">{guide.text}</p>
        <ul className="space-y-2 text-sm">{progress.milestones.map(goal => <li key={goal.name}>{goal.name}: <strong>{Math.min(goal.current, goal.target)} / {goal.target}</strong></li>)}</ul>
        <p className="text-sm">{progress.alternative ? 'Complete either target to progress.' : 'Complete the objective to progress automatically.'} Reward: £{(step.reward?.money || 0).toLocaleString('en-GB')} and {step.reward?.xp || 0} XP.</p>
        <button type="button" className="story-guide-action" onClick={act}>{guide.label}<ArrowRight size={18}/></button>
      </DialogContent>
    </Dialog>
  </aside>;
}
