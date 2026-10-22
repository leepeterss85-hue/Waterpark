import { getHotelDef, hotelAmenities } from "./hotels.js";
// Optional Story Mode objectives added without altering saved story-step indices.
export const STORY_CONTRACTS = Object.freeze([
  { id: "splash_starter", title: "The Big Splash", chapter: 1, goal: "Build three attractions", metric: "attractions", target: 3, reward: { money: 2500, xp: 130 } },
  { id: "happy_guests", title: "Five-Star Smiles", chapter: 2, goal: "Reach 75 guest happiness", metric: "guestMood", target: 75, reward: { money: 4500, xp: 220 } },
  { id: "ride_engineer", title: "Ride Designer", chapter: 3, goal: "Complete three park upgrades", metric: "upgrades", target: 3, reward: { money: 6000, xp: 280 } },
  { id: "guest_voice", title: "Word Gets Around", chapter: 8, goal: "Collect ten guest reviews", metric: "reviews", target: 10, reward: { money: 12000, xp: 420 } },
  { id: "resort_regulars", title: "Return for More", chapter: 12, goal: "Welcome twenty members", metric: "members", target: 20, reward: { money: 18000, xp: 600 } },
  { id: "maya_family_bay", title: "Maya: Open Family Bay", chapter: 4, goal: "Place three attractions in Family zones", metric: "familyBay", target: 3, narrative: "Our next chapter starts with a welcoming new themed area. Use Zones to mark Family tiles, then build rides for the whole family.", reward: { money: 10000, xp: 450 } },
  { id: "maya_bay_upgrade", title: "Maya: Make It Shine", chapter: 4, prerequisite: "maya_family_bay", goal: "Upgrade three attractions in Family Bay", metric: "familyUpgrades", target: 3, narrative: "The bay is open! Select its rides and improve their capacity before the next rush.", reward: { money: 14000, xp: 600 } },
  { id: "maya_bay_holiday", title: "Maya: Stay for the Weekend", chapter: 4, prerequisite: "maya_bay_upgrade", goal: "Open a hotel with a restaurant", metric: "hotelRestaurant", target: 1, narrative: "Give families a reason to stay. Build Family Suites, or upgrade your Budget Inn to level 3.", reward: { money: 18000, xp: 800 } },
  { id: "maya_bay_finale", title: "Maya: Family Bay Celebration", chapter: 4, prerequisite: "maya_bay_holiday", goal: "Launch an Evening Pool Party", metric: "bayParty", target: 1, narrative: "Celebrate the district opening with an evening pool party from Events. Keep your lifeguards on duty!", reward: { money: 22000, xp: 1000 } },
  { id:"resort_welcome", arc:"resort", title:"Maya: Your First Overnight Guests", chapter:4, goal:"Build a hotel", metric:"hotelCount", target:1, destination:"build", narrative:"Open Build and choose a Budget Inn. This resort chapter turns your park into a holiday destination.", reward:{money:5000,xp:250}},
  { id:"resort_dining", arc:"resort", title:"Maya: Dinner Is Served", chapter:4, prerequisite:"resort_welcome", goal:"Upgrade or build a hotel with a restaurant", metric:"hotelRestaurant", target:1, destination:"resort", narrative:"Tap your Budget Inn and upgrade it to level 3, or build Family Suites. Check the upgrade preview before spending.", reward:{money:8000,xp:350}},
  { id:"resort_happy", arc:"resort", title:"Maya: Happy Holidaymakers", chapter:4, prerequisite:"resort_dining", goal:"Reach 80 hotel happiness with occupied rooms", metric:"hotelHappiness", target:80, destination:"resort", narrative:"Run the park to welcome overnight guests. Add amenities and keep the park pleasant until hotel guests rate their stay at 80 or higher.", reward:{money:10000,xp:450}},
  { id:"resort_busy", arc:"resort", title:"Maya: A Popular Destination", chapter:4, prerequisite:"resort_happy", goal:"Reach 60% hotel occupancy", metric:"hotelOccupancy", target:60, destination:"resort", narrative:"Keep rooms appealing and review hotel pricing. Run more park days to attract guests and fill your rooms.", reward:{money:12000,xp:550}},
  { id:"resort_celebrate", arc:"resort", title:"Maya: The Resort Celebration", chapter:4, prerequisite:"resort_busy", goal:"Host an Evening Pool Party with occupied hotel rooms", metric:"resortParty", target:1, destination:"events", narrative:"Hire two lifeguards, build a suitable pool, then launch Evening Pool Party in Events to celebrate your resort.", reward:{money:16000,xp:750}},
]);

export function contractProgress(contract, game = {}) {
  if (!contract) return { current: 0, target: 1, percent: 0, complete: false };
  const familyTiles = (game.grid || []).map((id,index)=>({id,index})).filter(({id,index})=>game.parkZones?.[index]==="family" && game.attractionIds?.includes(id));
  const occupied = Number(game.hotelStats?.totalGuests)||0;
  const values = {
    hotelCount: (game.grid||[]).filter(id=>getHotelDef(id)).length,
    hotelHappiness: occupied>0 ? Number(game.hotelStats?.avgHappiness)||0 : 0,
    hotelOccupancy: occupied>0 ? Number(game.hotelStats?.occupancy)||0 : 0,
    resortParty: occupied>0 && (game.activeEvents||[]).some(e=>e.id==="evening_pool_party") ? 1 : 0,
    familyBay: familyTiles.length,
    familyUpgrades: familyTiles.filter(({index})=>(game.upgrades?.[index]||0)>0).length,
    hotelRestaurant: (game.grid||[]).some((id,index)=>{ const hotel=getHotelDef(id); return hotel && hotelAmenities(hotel,game.upgrades?.[index]||0).includes("restaurant"); }) ? 1 : 0,
    bayParty: (game.activeEvents||[]).some(e=>e.id==="evening_pool_party") ? 1 : 0,
    attractions: Number(game.missionState?.attractionCount) || 0,
    guestMood: Number(game.visitorStats?.avgMood) || 0,
    upgrades: Number(game.totalUpgrades) || 0,
    reviews: Array.isArray(game.visitorReviews) ? game.visitorReviews.length : 0,
    members: Object.values(game.membershipCounts || {}).reduce((sum, value) => sum + (Number(value) || 0), 0),
  };
  const current = Math.max(0, Math.floor(values[contract.metric] || 0));
  const target = Math.max(1, Number(contract.target) || 1);
  return { current, target, percent: Math.min(100, Math.round(current / target * 100)), complete: current >= target };
}

export function availableStoryContracts(game = {}) {
  const chapter = Number(game.STORY_STEPS?.[game.storyStep]?.chapter) || 1;
  const claimed = new Set(game.claimedStoryContracts || []);
  return STORY_CONTRACTS.filter(c => chapter >= c.chapter).map(c => ({
    ...c, ...contractProgress(c, game), locked: Boolean(c.prerequisite && !claimed.has(c.prerequisite)), claimed: claimed.has(c.id),
  }));
}
