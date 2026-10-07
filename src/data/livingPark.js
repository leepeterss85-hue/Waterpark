// Living park systems: guest personalities, memory and the food/retail economy.
export const GUEST_PERSONALITIES={
 family_planner:{id:"family_planner",name:"Family Planner",icon:"Users",traits:["family","value"],preferred:["kiddie_pool","lazy_river","splash_pad","play_structure"],spend:.95,queueTolerance:.75},
 thrill_hunter:{id:"thrill_hunter",name:"Thrill Hunter",icon:"Zap",traits:["thrill","adrenaline"],preferred:["mega_slide_complex","water_coaster","aqua_loop","freefall_drop","tidal_coaster"],spend:1.05,queueTolerance:1.25},
 relaxer:{id:"relaxer",name:"Relaxer",icon:"Waves",traits:["relax","comfort"],preferred:["lazy_river","hydro_spa_pool","hot_tub","spa"],spend:1.12,queueTolerance:.8},
 foodie:{id:"foodie",name:"Foodie",icon:"UtensilsCrossed",traits:["food","premium"],preferred:["dining","sushi_bar","beach_bar","coffee_bar","juice_bar"],spend:1.3,queueTolerance:.95},
 explorer:{id:"explorer",name:"Explorer",icon:"Compass",traits:["novelty","adventure"],preferred:["adventure_lagoon","rapid_rafting","water_zipline","ninja_course"],spend:1.15,queueTolerance:1.05},
 value_seeker:{id:"value_seeker",name:"Value Seeker",icon:"BadgePoundSterling",traits:["value","budget"],preferred:[],spend:.78,queueTolerance:.65},
};
const FOOD_IDS=["dining","burger_shack","pizza_stand","ice_cream","coffee_bar","beach_bar","smoothie_bar","juice_bar","sushi_bar"];
const RETAIL_IDS=["retail","swimwear_shop","towel_rental"];
const SERVICE_IDS=["lockers","guest_services","wifi_lounge","lost_found"];

export function buildGuestMemory(previous={}, {day=1,visitorStats={},activeEvents=[]}={}){
 const memory={...(previous||{})}; const types=visitorStats.guestTypes||{}; const movements=visitorStats.movements||{}; const top=visitorStats.topAttraction||null;
 for(const [type,count] of Object.entries(types)){if(!count)continue;
  const key=type==="Thrill seeker"?"thrill_hunter":type==="Family"?"family_planner":type==="Couple"?"relaxer":type==="Tourist"?"explorer":type==="VIP guest"?"foodie":"value_seeker";
  const old=memory[key]||{visits:0,happyDays:0,unhappyDays:0,favourite:null,lastVisit:0,lastMood:50,eventDays:0};
  const next={...old,visits:old.visits+count,lastVisit:day,lastMood:Math.round(visitorStats.avgMood||50)};
  if((visitorStats.avgMood||0)>=70)next.happyDays++; if((visitorStats.avgMood||100)<45)next.unhappyDays++;
  if(top&&(movements[top]||0)>0)next.favourite=top; if(activeEvents.length)next.eventDays+=count; memory[key]=next;
 }
 return memory;
}
export function guestMemoryDemandBoost(memory={},personalityId,grid=[]){
 const p=GUEST_PERSONALITIES[personalityId],m=memory[personalityId]; if(!p||!m?.visits)return 1;
 const matching=p.preferred.filter(id=>grid.includes(id)).length;
 const loyalty=Math.min(.10,m.happyDays*.008)-Math.min(.08,m.unhappyDays*.01);
 return Math.max(.85,1+loyalty+Math.min(.06,matching*.015));
}
export function simulateFoodRetail({grid=[],guests=0,visitorStats={},weather={},activeEvents=[],stock={},staff={},pricing={}}={}){
 const hasFood=grid.filter(id=>FOOD_IDS.includes(id)).length,hasRetail=grid.filter(id=>RETAIL_IDS.includes(id)).length,hasService=grid.filter(id=>SERVICE_IDS.includes(id)).length;
 const chef=staff.chef||0,photographer=staff.photographer||0;
 const eventBoost=activeEvents.reduce((s,e)=>s*(e.downside?.foodDepleteMult||1),1);
 const weatherMult=weather.id==="sunny"||weather.id==="warm"?1.16:weather.id==="rain"?.82:1;
 const foodDemand=Math.round(guests*Math.min(.92,.28+hasFood*.08)*weatherMult*eventBoost*(1+chef*.05));
 const retailDemand=Math.round(guests*Math.min(.45,hasRetail*.07)*(1+photographer*.04));
 const serviceDemand=Math.round(guests*Math.min(.5,hasService*.06));
 const serve=(key,d)=>d<=0?0:Math.round(d*Math.min(1,Math.max(0,(stock[key]==null?d:stock[key])/d)));
 const food=serve("food",foodDemand),retail=serve("retail",retailDemand),services=serve("services",serviceDemand);
 const revenue=Math.round(food*11*(pricing.food?.priceMult||1)+retail*16*(pricing.retail?.priceMult||1)+services*5*(pricing.services?.priceMult||1));
 const restockCost=Math.round((hasFood*260+hasRetail*180+hasService*70)*eventBoost);
 const nextStock={food:Math.max(0,Math.round((stock.food==null?hasFood*70:stock.food)-food+hasFood*45)),retail:Math.max(0,Math.round((stock.retail==null?hasRetail*45:stock.retail)-retail+hasRetail*28)),services:Math.max(0,Math.round((stock.services==null?hasService*55:stock.services)-services+hasService*35))};
 const unmetFood=Math.max(0,foodDemand-food);
 return {demand:{food:foodDemand,retail:retailDemand,services:serviceDemand},served:{food,retail,services},revenue,restockCost,nextStock,unmetFood,satisfactionBonus:hasFood?Math.min(5,hasFood+chef):-Math.min(5,Math.ceil(guests/250)),stockHealth:{food:hasFood?Math.min(100,Math.round(nextStock.food/(hasFood*90)*100)):100,retail:hasRetail?Math.min(100,Math.round(nextStock.retail/(hasRetail*60)*100)):100,services:hasService?Math.min(100,Math.round(nextStock.services/(hasService*70)*100)):100}};
}
export const FOOD_FACILITIES=FOOD_IDS;
export const RETAIL_FACILITIES=RETAIL_IDS;
export const SERVICE_FACILITIES=SERVICE_IDS;
