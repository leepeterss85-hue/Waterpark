export const WEATHER = [
  { id:"sunny", name:"Sunny", icon:"Sun", temp:"26C", guestMult:1.18, incomeMult:1.05, utilityMult:1.18, description:"Perfect pool weather." },
  { id:"warm", name:"Warm", icon:"Sun", temp:"22C", guestMult:1.08, incomeMult:1.02, utilityMult:1.08, description:"Great conditions for the park." },
  { id:"cloudy", name:"Cloudy", icon:"Cloud", temp:"18C", guestMult:0.86, incomeMult:0.98, utilityMult:0.94, description:"Fewer guests, but rides can stay open." },
  { id:"rain", name:"Rain", icon:"CloudRain", temp:"14C", guestMult:0.58, incomeMult:0.92, utilityMult:0.8, description:"Outdoor attendance drops sharply." }
];
const SEASON_WEIGHTS={spring:{sunny:.28,warm:.3,cloudy:.25,rain:.17},summer:{sunny:.5,warm:.34,cloudy:.11,rain:.05},autumn:{sunny:.2,warm:.22,cloudy:.34,rain:.24},winter:{sunny:.08,warm:.14,cloudy:.35,rain:.43}};
export function getSeason(day){const n=((day-1)%120)+1;if(n<=30)return "spring";if(n<=60)return "summer";if(n<=90)return "autumn";return "winter";}
export function getSeasonLabel(season){return season.charAt(0).toUpperCase()+season.slice(1);}
export function rollWeather(day){const weights=SEASON_WEIGHTS[getSeason(day)];const roll=Math.random();let cursor=0;for(const weather of WEATHER){cursor+=weights[weather.id]||0;if(roll<=cursor)return weather;}return WEATHER[0];}

export const SEASONAL_EVENTS=[
  {id:"opening_weekend",name:"Opening Weekend",icon:"PartyPopper",seasons:["spring"],duration:3,guestMult:1.35,incomeMult:1.08,repDelta:.8,description:"A big launch weekend brings curious visitors."},
  {id:"school_half_term",name:"School Half-Term",icon:"Users",seasons:["spring","autumn","winter"],duration:4,guestMult:1.22,incomeMult:1.03,repDelta:.4,description:"Families are looking for a full day out."},
  {id:"summer_holidays",name:"Summer Holiday Rush",icon:"Umbrella",seasons:["summer"],duration:6,guestMult:1.42,incomeMult:1.12,repDelta:1,description:"Peak season has arrived and queues are longer."},
  {id:"heatwave",name:"Heatwave",icon:"Sun",seasons:["summer"],duration:3,guestMult:1.65,incomeMult:1.16,repDelta:1.1,description:"Everyone wants to cool down in the water."},
  {id:"bank_holiday",name:"Bank Holiday Weekend",icon:"CalendarDays",seasons:["spring","summer","autumn"],duration:3,guestMult:1.28,incomeMult:1.07,repDelta:.6,description:"A long weekend sends local families to the park."},
  {id:"halloween",name:"Halloween Splash Night",icon:"Sparkles",seasons:["autumn"],duration:3,guestMult:1.18,incomeMult:1.24,repDelta:.7,description:"Evening entertainment boosts spending."},
  {id:"winter_break",name:"Winter Family Break",icon:"Users",seasons:["winter"],duration:4,guestMult:.92,incomeMult:1.16,repDelta:.5,description:"Family breaks keep the park moving in winter."}
];
export function rollSeasonEvent(day){if(day<3||Math.random()>.14)return null;const choices=SEASONAL_EVENTS.filter(e=>e.seasons.includes(getSeason(day)));return choices.length?choices[Math.floor(Math.random()*choices.length)]:null;}
export const ZONES=[
  {id:"family",name:"Family Zone",icon:"Baby",className:"bg-amber-300/25 ring-amber-400/60 text-amber-800"},
  {id:"thrill",name:"Thrill Zone",icon:"Zap",className:"bg-rose-300/25 ring-rose-400/60 text-rose-800"},
  {id:"resort",name:"Resort Zone",icon:"Umbrella",className:"bg-violet-300/25 ring-violet-400/60 text-violet-800"},
  {id:"relax",name:"Relax Zone",icon:"Waves",className:"bg-cyan-300/25 ring-cyan-400/60 text-cyan-800"},
  {id:"services",name:"Services Zone",icon:"UtensilsCrossed",className:"bg-emerald-300/25 ring-emerald-400/60 text-emerald-800"}
];
