// Optional scenario challenges layered over Story, Freeplay and Sandbox.
// Scenarios are non-destructive: they use the current park and add a clear
// objective/reward without resetting the player's existing save.

export const PARK_SCENARIOS = [
  { id:"small_budget", name:"Small Budget", icon:"WalletCards", description:"Prove you can build a profitable park without relying on endless expansion.", objective:"Reach $250,000 lifetime earnings with fewer than 5 expansions.", check:s=>s.lifetimeEarnings>=250000 && s.expansionsDone<5, reward:{money:25000,xp:350,reputation:3} },
  { id:"mega_resort", name:"Mega Resort", icon:"Hotel", description:"Turn your waterpark into a genuine destination resort.", objective:"Reach 80 resort rating and 75% hotel occupancy.", check:s=>s.resortRating>=80 && s.occupancy>=75, reward:{money:50000,xp:500,reputation:5} },
  { id:"extreme_weather", name:"Extreme Weather", icon:"CloudLightning", description:"Keep the park strong through difficult operating conditions.", objective:"Operate for 120 days while finishing with at least 70 reputation.", check:s=>s.day>=120 && s.reputation>=70, reward:{money:35000,xp:450,reputation:4} },
  { id:"rival_war", name:"Rival War", icon:"Swords", description:"Become the dominant regional waterpark.", objective:"Reach 65% market share and acquire at least one rival.", check:s=>s.marketShare>=65 && s.acquiredRivals>=1, reward:{money:75000,xp:650,reputation:6} },
  { id:"family_paradise", name:"Family Paradise", icon:"Baby", description:"Create the region's favourite family destination.", objective:"Reach 80 appeal and build at least 6 family attractions.", check:s=>s.appeal>=80 && s.familyAttractions>=6, reward:{money:45000,xp:500,reputation:5} },
  { id:"five_star_resort", name:"Five-Star Resort", icon:"Star", description:"Deliver a premium resort experience.", objective:"Reach 90 resort rating, 80% occupancy and 75 reputation.", check:s=>s.resortRating>=90 && s.occupancy>=80 && s.reputation>=75, reward:{money:100000,xp:800,reputation:8} },
  { id:"speed_builder", name:"Speed Builder", icon:"Timer", description:"Grow fast and prove your construction skills.", objective:"Build 12 attractions by day 60.", check:s=>s.day<=60 && s.attractionCount>=12, reward:{money:30000,xp:450,reputation:3} },
];

export function getScenario(id) {
  return PARK_SCENARIOS.find((scenario) => scenario.id === id) || null;
}
