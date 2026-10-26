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
  // Story side-quest: two valid routes per milestone. Players choose through
  // NORMAL park building/management, not through extra currency or saves.
  // All IDs are new, so existing story steps and claimed contracts remain valid.
  { id:"festival_invitation", arc:"festival", title:"Maya: Festival Invitations", chapter:5,
    goal:"Make the park inviting to all — choose your strategy",
    metric:"guestMood", target:80,
    routes:[{metric:"guestMood",target:80,label:"Reach 80 guest happiness"},{metric:"attractions",target:6,label:"Build 6 water park attractions"}],
    narrative:"Maya is planning the splash festival! Delight your visitors OR expand the rides lineup. Either approach earns the same one-time reward.",
    reward:{money:10000,xp:500} },
  { id:"festival_preparation", arc:"festival", title:"Maya: The Festival Countdown", chapter:5, prerequisite:"festival_invitation",
    goal:"Get the resort ready for the festival",
    metric:"upgrades", target:6,
    routes:[{metric:"upgrades",target:6,label:"Complete 6 ride upgrades"},{metric:"reviews",target:12,label:"Collect 12 genuine guest reviews"}],
    narrative:"You decide: improve the hardware OR let happy guests spread the word. Both routes keep your park save and progress intact.",
    reward:{money:16000,xp:700} },
  { id:"festival_destination", arc:"festival", title:"Maya: Something for Everyone", chapter:6, prerequisite:"festival_preparation",
    goal:"Turn the festival into a destination",
    metric:"hotelCount", target:1,
    routes:[{metric:"hotelCount",target:1,label:"Open a hotel"},{metric:"chains",target:1,label:"Complete an attraction chain"}],
    narrative:"Families can stay overnight, or you can build a signature ride circuit. Pick the investment that suits your resort.",
    reward:{money:23000,xp:950} },
  { id:"festival_finale", arc:"festival", title:"Maya: Festival Headliner", chapter:6, prerequisite:"festival_destination",
    goal:"Earn a festival-worthy reputation",
    metric:"reputation", target:85,
    routes:[{metric:"reputation",target:85,label:"Reach 85 park reputation"},{metric:"members",target:40,label:"Welcome 40 loyal members"}],
    narrative:"The festival's big day is here. Become famous for excellence or build a loyal community. Maya has a celebration planned either way!",
    reward:{money:32000,xp:1350} },
  // A second, optional campaign after the finale. Keeping these outside
  // STORY_STEPS means completed parks and cloud saves retain their positions.
  { id:"legacy_smiles", arc:"legacy", requiresStoryComplete:true, title:"Season Two: The Guest Promise", chapter:13, goal:"Reach 85 average visitor happiness", metric:"guestMood", target:85, narrative:"Maya invites you back for a victory tour. Show that success hasn't changed your standards: happy guests come first.", reward:{money:30000,xp:1500} },
  { id:"legacy_resort", arc:"legacy", requiresStoryComplete:true, title:"Season Two: Holiday Season", chapter:13, prerequisite:"legacy_smiles", goal:"Fill 80% of your hotel rooms", metric:"hotelOccupancy", target:80, narrative:"Plan a proper holiday destination. Refresh the resort and keep rooms booked without relying on real-world purchases.", reward:{money:40000,xp:1800} },
  { id:"legacy_chains", arc:"legacy", requiresStoryComplete:true, title:"Season Two: Ride Revolution", chapter:13, prerequisite:"legacy_resort", goal:"Complete two attraction chains", metric:"chains", target:2, narrative:"Connect complementary rides into distinct districts. Maya wants a park visitors will remember.", reward:{money:50000,xp:2200} },
  { id:"legacy_megapark", arc:"legacy", requiresStoryComplete:true, title:"Season Two: Skyline Spectacular", chapter:13, prerequisite:"legacy_chains", goal:"Complete three signature mega-projects", metric:"megaProjects", target:3, narrative:"Your guests want a landmark. Finish an ambitious signature project portfolio to show them what's possible.", reward:{money:70000,xp:2900} },
  { id:"legacy_finale", arc:"legacy", requiresStoryComplete:true, title:"Season Two: A Lasting Legacy", chapter:13, prerequisite:"legacy_megapark", goal:"Reach 95 park reputation", metric:"reputation", target:95, narrative:"Bring everything together: guest experience, attractions, events and an outstanding reputation. A new legend begins.", reward:{money:100000,xp:4500} },
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
    chains: (game.completedChains || []).length,
    megaProjects: (game.megaProjects || []).filter(project => project && (project.status === "complete" || project.status === "completed" || project.completed)).length,
    reputation: Number(game.reputation) || 0,
  };
  // A player's chosen strategy is the better of the two measured paths.
  // Do not add a saved selection or ever reward a single contract twice.
  if (Array.isArray(contract.routes) && contract.routes.length) {
    const routes = contract.routes.map(route=>{
      const target=Math.max(1, Number(route.target)||1);
      const current=Math.max(0, Math.floor(Number(values[route.metric])||0));
      return {label:route.label,current,target,percent:Math.min(100,Math.round(current/target*100)),complete:current>=target};
    });
    const best=[...routes].sort((a,b)=>b.percent-a.percent)[0];
    return {...best, routes, alternative:true, complete:routes.some(route=>route.complete)};
  }
  const current = Math.max(0, Math.floor(Number(values[contract.metric]) || 0));
  const target = Math.max(1, Number(contract.target) || 1);
  return { current, target, percent: Math.min(100, Math.round(current / target * 100)), complete: current >= target };
}

export function availableStoryContracts(game = {}) {
  const chapter = Number(game.STORY_STEPS?.[game.storyStep]?.chapter) || 1;
  const claimed = new Set(game.claimedStoryContracts || []);
  return STORY_CONTRACTS.filter(c => chapter >= c.chapter && (!c.requiresStoryComplete || game.storyCompleted)).map(c => ({
    ...c, ...contractProgress(c, game), locked: Boolean(c.prerequisite && !claimed.has(c.prerequisite)), claimed: claimed.has(c.id),
  }));
}
