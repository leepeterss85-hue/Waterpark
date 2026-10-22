import React from "react";
import { Timer, BookOpen } from "lucide-react";
import { TIMED_CHALLENGES } from "@/data/timedChallenges";
import { availableStoryContracts } from "@/data/storyContracts";
export default function ObjectiveShortcuts({game,onOpen}) {
 const runs=game.timedChallenges||{};
 const pending=TIMED_CHALLENGES.find(c=>runs[c.id]?.status==="complete");
 const active=TIMED_CHALLENGES.find(c=>runs[c.id]?.status==="active");
 const challenge=pending||active;
 const resort=availableStoryContracts(game).find(c=>c.arc==="resort"&&!c.claimed&&!c.locked);
 const story=game.STORY_STEPS?.[game.storyStep];
 return <nav aria-label="Current goals" className="grid w-full grid-cols-2 gap-2 px-2 py-1">
  <button type="button" onClick={()=>onOpen("challenges")} className="min-h-11 min-w-0 rounded-xl bg-cyan-950 px-3 py-2 text-left text-white">
   <span className="flex items-center gap-1 text-xs font-black"><Timer size={14}/>Challenges</span>
   <span className="block truncate text-[10px]">{pending?"Reward ready: "+pending.title:active?Math.max(0,runs[active.id].deadline-game.day)+" park days left · "+active.title:"Earn Bronze, Silver and Gold"}</span>
  </button>
  <button type="button" onClick={()=>onOpen(resort&&game.gameMode==="story"?"resort":"gameModes")} className="min-h-11 min-w-0 rounded-xl bg-indigo-50 px-3 py-2 text-left text-indigo-950 ring-1 ring-indigo-200">
   <span className="flex items-center gap-1 text-xs font-black"><BookOpen size={14}/>{game.gameMode==="story"?"Next objective":"Story & modes"}</span>
   <span className="block truncate text-[10px]">{game.gameMode!=="story"?"Open Maya’s guided story":resort?resort.goal:game.storyCompleted?"Story completed":story?.action||"Explore your park"}</span>
  </button>
 </nav>;
}
