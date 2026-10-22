export const TIMED_CHALLENGES = [
 {id:"quick_upgrades",title:"Upgrade Sprint",description:"Complete 3 new upgrades in 5 park days.",metric:"upgrades",target:3,days:5,reward:{money:4000,xp:200}},
 {id:"cash_dash",title:"Cash Dash",description:"Earn £15,000 in 4 park days.",metric:"earnings",target:15000,days:4,reward:{money:5000,xp:250}},
 {id:"weekend_rush",title:"Weekend Rush",description:"Welcome 150 guests in a single day within 3 park days.",metric:"guests",target:150,days:3,reward:{money:4500,xp:220}},
 {id:"pool_party",title:"Party Planner",description:"Launch an Evening Pool Party within 5 park days.",metric:"party",target:1,days:5,reward:{money:3500,xp:200}},
 {id:"heatwave_hero",title:"Heatwave Hero",description:"Reach 80 guest happiness during a heatwave within 7 park days.",metric:"heatwave",target:80,days:7,reward:{money:7500,xp:400}},
];
export function challengeValue(def, game) {
 if(def.metric==="upgrades") return Number(game.totalUpgrades)||0;
 if(def.metric==="earnings") return Number(game.lifetimeEarnings)||0;
 if(def.metric==="guests") return Number(game.guests)||0;
 if(def.metric==="party") return (game.activeEvents||[]).some(e=>e.id==="evening_pool_party") ? 1 : 0;
 if(def.metric==="heatwave") return game.challenge?.id==="heatwave" ? Number(game.visitorStats?.avgMood)||0 : 0;
 return 0;
}
export function startTimedChallenge(def, game) {
 return {status:"active",startDay:game.day,deadline:game.day+def.days,baseline:challengeValue(def,game),progress:0};
}
export function evaluateTimedChallenge(def, run, game) {
 if(!run || run.status!=="active") return run;
 if(game.day>run.deadline) return {...run,status:"expired"};
 const delta=["upgrades","earnings"].includes(def.metric);
 const raw=challengeValue(def,game);
 // Daily guest totals from the day before accepting do not count.
 const eligible=def.metric!=="guests" || game.day>run.startDay;
 const progress=Math.max(run.progress||0,eligible ? Math.max(0,raw-(delta?run.baseline:0)) : 0);
 const status=progress>=def.target ? "complete" : game.day>=run.deadline ? "expired" : "active";
 return progress===run.progress && status===run.status ? run : {...run,progress,status};
}
export function sanitiseTimedChallenges(value) {
 if(!value || typeof value!=="object" || Array.isArray(value)) return {};
 return Object.fromEntries(TIMED_CHALLENGES.flatMap(def=>{
  const run=value[def.id];
  return run && ["active","complete","claimed","expired"].includes(run.status) && Number.isFinite(run.deadline) && Number.isFinite(run.startDay) && Number.isFinite(run.baseline)
   ? [[def.id,{...run,progress:Math.max(0,Number(run.progress)||0)}]] : [];
 }));
}
