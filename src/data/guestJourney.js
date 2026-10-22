export const FOOD_STOPS = ["dining","burger_shack","pizza_stand","ice_cream","coffee_bar","beach_bar","smoothie_bar","juice_bar","sushi_bar","concessions"];
export const REST_STOPS = ["bench","sun_lounge","beach_lounging","cabanas","spa","sauna"];
// A stable destination for each leg; returning guests actually reach home.
export function guestJourney(targets, tick, variant, home, rides=targets) {
 const pick=list=>list.length ? list[variant%list.length] : null;
 const food=pick(targets.filter(t=>FOOD_STOPS.includes(t.id)));
 const rest=pick(targets.filter(t=>REST_STOPS.includes(t.id)));
 const ride=pick(rides.filter(t=>t.attr?.category==="attraction"));
 const stops=[ride,food,rest,home].filter(Boolean);
 if(!stops.length) return null;
 const frame=(tick+variant*3)%(stops.length*6), leg=Math.floor(frame/6), phase=frame%6;
 const target=stops[leg], from=leg ? stops[leg-1] : home||stops[stops.length-1];
 const blend=Math.min(1,phase/3);
 const point=t=>({x:t.index%8+.5,y:Math.floor(t.index/8)+.73});
 const a=point(from), b=point(target);
 const activity=phase<3 ? "walking" : target===home ? "resting" : FOOD_STOPS.includes(target.id) ? "eating" : REST_STOPS.includes(target.id) ? "resting" : "waiting";
 return {target,activity,x:a.x+(b.x-a.x)*blend,y:a.y+(b.y-a.y)*blend,atHome:target===home && phase>=3};
}
