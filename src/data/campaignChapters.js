export const CAMPAIGN_CHAPTERS=[
{id:"chapter_1",name:"Make a Splash",minLevel:2,goal:{type:"guests",target:250},reward:{money:12000,xp:250,rep:2},text:"Prove the park can attract a real crowd."},
{id:"chapter_2",name:"Keep Them Happy",minLevel:4,goal:{type:"mood",target:72},reward:{money:20000,xp:400,rep:3},text:"Deliver a guest experience people remember."},
{id:"chapter_3",name:"Build a Destination",minLevel:6,goal:{type:"attractions",target:8},reward:{money:35000,xp:650,rep:4},text:"Turn the park into a full-day destination."},
{id:"chapter_4",name:"The Resort Era",minLevel:10,goal:{type:"resort",target:70},reward:{money:60000,xp:1000,rep:5},text:"Build a resort people will travel for."},
{id:"chapter_5",name:"Beat the Rivals",minLevel:15,goal:{type:"market",target:55},reward:{money:100000,xp:1500,rep:7},text:"Take the majority of the local market."},
{id:"chapter_6",name:"World-Class Park",minLevel:20,goal:{type:"appeal",target:90},reward:{money:200000,xp:2500,rep:10},text:"Reach world-class park appeal."}
];
export function campaignProgress(c,state={}){const g=c?.goal;if(!g)return 0;if(g.type==="guests")return Math.min(g.target,state.peakGuests||0);if(g.type==="mood")return Math.min(g.target,Math.round(state.avgMood||0));if(g.type==="attractions")return Math.min(g.target,state.attractionCount||0);if(g.type==="resort")return Math.min(g.target,Math.round(state.resortRating||0));if(g.type==="market")return Math.min(g.target,Math.round(state.marketShare||0));if(g.type==="appeal")return Math.min(g.target,Math.round(state.appeal||0));return 0;}
export function evaluateCampaigns(completed=[],level=1,state={}){const ids=[...(completed||[])],newly=[];for(const c of CAMPAIGN_CHAPTERS){if(ids.includes(c.id)||level<c.minLevel)continue;if(campaignProgress(c,state)>=c.goal.target){ids.push(c.id);newly.push(c);}}return{completed:ids,newlyCompleted:newly};}
