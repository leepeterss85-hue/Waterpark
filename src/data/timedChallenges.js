import { isWaterAttraction } from "./waterQuality.js";

export const BASE_CHALLENGES = [
 {id:"quick_upgrades",title:"Upgrade Sprint",description:"Complete 3 new upgrades in 5 park days.",metric:"upgrades",target:3,days:5,reward:{money:4000,xp:200}},
 {id:"cash_dash",title:"Cash Dash",description:"Earn £15,000 in 4 park days.",metric:"earnings",target:15000,days:4,reward:{money:5000,xp:250}},
 {id:"weekend_rush",title:"Weekend Rush",description:"Welcome 150 guests in a single day within 3 park days.",metric:"guests",target:150,days:3,reward:{money:4500,xp:220}},
 {id:"pool_party",title:"Party Planner",description:"Launch an Evening Pool Party within 5 park days.",metric:"party",target:1,days:5,reward:{money:3500,xp:200}},
 {id:"heatwave_hero",title:"Heatwave Hero",description:"Reach 80 guest happiness during a heatwave within 7 park days.",metric:"heatwave",target:80,days:7,reward:{money:7500,xp:400}},
 {id:"guest_delight",title:"Guest Delight",description:"Reach 70 average guest happiness after accepting within 5 park days.",metric:"mood",target:70,days:5,reward:{money:5000,xp:300}},
 {id:"crystal_clear",title:"Crystal Clear",description:"Reach 75 average water quality after accepting within 6 park days.",metric:"water",target:75,days:6,reward:{money:5500,xp:320}},
 {id:"review_rally",title:"Review Rally",description:"Earn 6 new guest reviews within 7 park days.",metric:"reviews",target:6,days:7,reward:{money:6500,xp:360}},
 {id:"loyalty_drive",title:"Loyalty Drive",description:"Welcome 10 new membership holders within 9 park days.",metric:"members",target:10,days:9,reward:{money:8500,xp:440}},
 {id:"resort_weekend",title:"Resort Weekend",description:"Reach 60% occupied hotel rooms on a later park day within 8 park days.",metric:"occupancy",target:60,days:8,reward:{money:9000,xp:480}},
];
export const MEDALS = ["bronze", "silver", "gold"];
export const TIMED_CHALLENGES = BASE_CHALLENGES.flatMap(base => MEDALS.map((medal,index) => {
 const id = index ? base.id+"_"+medal : base.id;
 const target = base.metric==="party" ? 1 : base.metric==="heatwave" ? [80,88,95][index] : base.metric==="mood" ? [70,80,90][index] : base.metric==="water" ? [75,85,95][index] : base.metric==="occupancy" ? [60,75,90][index] : Math.ceil(base.target*[1,1.5,2][index]);
 const days = base.metric==="party" ? [5,3,2][index] : base.days;
 const goal = base.metric==="upgrades" ? "Complete "+target+" new upgrades" : base.metric==="earnings" ? "Earn £"+target.toLocaleString("en-GB") : base.metric==="guests" ? "Welcome "+target+" guests in one day" : base.metric==="heatwave" ? "Reach "+target+" happiness during a heatwave" : base.metric==="mood" ? "Reach "+target+" average guest happiness on a later park day" : base.metric==="water" ? "Reach "+target+" average pool water quality on a later park day" : base.metric==="reviews" ? "Collect "+target+" new guest reviews" : base.metric==="members" ? "Gain "+target+" new members" : base.metric==="occupancy" ? "Reach "+target+"% hotel occupancy after accepting" : "Launch an Evening Pool Party";
 return {...base,id,baseId:base.id,medal,target,days,title:base.title+" · "+medal[0].toUpperCase()+medal.slice(1),
  description:goal+" within "+days+" park days.",
  prerequisite:index ? (index===1 ? base.id : base.id+"_silver") : null,
  reward:{money:Math.round(base.reward.money*[1,1.5,2][index]),xp:Math.round(base.reward.xp*[1,1.5,2][index])}};
}));
export function canStartTimedChallenge(def,runs={},game={}) {
 return Boolean(def && !(def.metric==="party" && (game.activeEvents||[]).some(e=>e.id==="evening_pool_party")) && !Object.values(runs).some(r=>r.status==="active") &&
 !["claimed","complete"].includes(runs[def.id]?.status) &&
 (!def.prerequisite || runs[def.prerequisite]?.status==="claimed"));
}
export function challengeValue(def, game) {
 if(def.metric==="upgrades") return Number(game.totalUpgrades)||0;
 if(def.metric==="earnings") return Number(game.lifetimeEarnings)||0;
 if(def.metric==="guests") return Number(game.guests)||0;
 if(def.metric==="party") return (game.activeEvents||[]).some(e=>e.id==="evening_pool_party") ? 1 : 0;
 if(def.metric==="heatwave") return (game.challenge?.id==="heatwave" || game.seasonEvent?.id==="heatwave") ? Number(game.visitorStats?.avgMood)||0 : 0;
 if(def.metric==="mood") return Number(game.guests)>0 ? Number(game.visitorStats?.avgMood)||0 : 0;
 if(def.metric==="reviews") return Array.isArray(game.visitorReviews) ? game.visitorReviews.length : 0;
 if(def.metric==="members") return Object.values(game.membershipCounts||{}).reduce((sum,n)=>sum+(Number(n)||0),0);
 if(def.metric==="occupancy") return Number(game.hotelStats?.totalGuests)>0 ? Number(game.hotelStats?.occupancy)||0 : 0;
 if(def.metric==="water") {
  const tiles=(game.grid||[]).map((id,index)=>({id,index})).filter(tile=>isWaterAttraction(tile.id));
  if(!tiles.length) return 0;
  const values=tiles.map(tile=>Number(game.waterQuality?.[tile.index]));
  if(values.some(value=>!Number.isFinite(value))) return 0;
  return Math.round(values.reduce((sum,value)=>sum+value,0)/values.length);
 }
 return 0;
}
export function startTimedChallenge(def, game) {
 return {status:"active",startDay:game.day,deadline:game.day+def.days,baseline:challengeValue(def,game),progress:0};
}
export function evaluateTimedChallenge(def, run, game) {
 if(!run || run.status!=="active") return run;
 if(game.day>run.deadline) return {...run,status:"expired"};
 const delta=["upgrades","earnings","reviews","members"].includes(def.metric);
 const raw=challengeValue(def,game);
 // Daily guest totals from the day before accepting do not count.
 const eligible=!["guests","mood","water","occupancy"].includes(def.metric) || game.day>run.startDay;
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
