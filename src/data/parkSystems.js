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
