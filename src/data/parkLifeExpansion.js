import { getParkItem } from "@/data/gameData";
import { DISTRICTS } from "@/data/districts";

export const PARK_LIFE_EVENTS = [
  { id: "school_trip", title: "A coachload of schoolchildren!", icon: "🚌", intro: "Forty children, six teachers and one clipboard have arrived. The clipboard looks the most dangerous.",
    valid: (g) => g.guests > 0, choices: [
      { id: "welcome", label: "Lay on extra supervision", money: -480, reputation: 2, result: "The teachers survived. One has asked for a permanent lifeguard." },
      { id: "charge", label: "Offer a modest group discount", money: 350, reputation: 0, result: "The children loved it. Accounts loved it slightly less." },
    ] },
  { id: "heatwave", title: "The great British heatwave", icon: "☀️", intro: "The sun has emerged for its annual public appearance. The queue for ice cream has its own queue.",
    valid: () => true, choices: [
      { id: "water", label: "Extra water, shade and staff breaks", money: -500, reputation: 2, result: "Guests are delighted and nobody has turned the paddling pool into soup." },
      { id: "festival", label: "Promote a sunshine special", money: 1200, reputation: -1, result: "Profits are up. The sun has already submitted its notice." },
    ] },
  { id: "influencer", title: "A surprise celebrity visit", icon: "📸", intro: "An influencer has arrived. The camera crew appears to be larger than the actual entourage.",
    valid: (g) => g.reputation >= 40, choices: [
      { id: "host", label: "Host a proper welcome", money: -600, reputation: 4, result: "A lovely review appeared online. Nobody mentioned the emergency glitter." },
      { id: "privacy", label: "Treat them like every other guest", money: 250, reputation: 1, result: "Apparently being treated normally is now a luxury experience." },
    ] },
  { id: "food_fair", title: "Food festival opportunity", icon: "🍕", intro: "Local food trucks want to visit. The smell alone could sell several hundred tickets.",
    valid: (g) => g.grid.some(id => ["dining","pizza_stand","burger_shack","concessions","coffee_bar"].includes(id)), choices: [
      { id: "invite", label: "Run a proper food festival", money: 650, reputation: 2, result: "The food was brilliant. The seagulls have requested a franchise." },
      { id: "small", label: "Keep the usual food service", money: 100, reputation: 0, result: "Business as usual. The seagulls remain in negotiations." },
    ] },
  { id: "storm", title: "Storm clouds over the flumes", icon: "⛈️", intro: "The weather forecast suggests more water than originally budgeted for.",
    valid: () => true, choices: [
      { id: "safety", label: "Pause exposed rides and inspect them", money: -380, reputation: 3, result: "Safety first. The clouds have failed to pay their admission." },
      { id: "indoors", label: "Move the entertainment undercover", money: -160, reputation: 1, result: "A respectable afternoon, despite the roof trying to become a swimming pool." },
    ] },
  { id: "lost_hat", title: "The mystery of the flying hat", icon: "🎩", intro: "A guest's favourite hat has departed on the lazy river without permission.",
    valid: () => true, choices: [
      { id: "rescue", label: "Send a team to retrieve it", money: -80, reputation: 1, result: "Hat recovered. Lifeguard deeply unimpressed." },
      { id: "souvenir", label: "Offer a complimentary replacement", money: -45, reputation: 1, result: "Guest satisfied. The original hat has reportedly started a new life downstream." },
    ] },
  { id: "resort_party", title: "A last-minute resort booking", icon: "🏨", intro: "A group wants to book the resort for a celebration. They have asked whether the flamingos can wear bow ties.",
    valid: (g) => (g.hotels || []).length > 0, choices: [
      { id: "premium", label: "Arrange an exclusive package", money: 1600, reputation: 2, result: "The party was a success. The flamingos declined the formalwear." },
      { id: "quiet", label: "Offer a quiet family package", money: 700, reputation: 1, result: "Guests slept peacefully. The inflatable flamingo stood guard." },
    ] },
  { id: "zoo", title: "A very cheeky animal escape", icon: "🦜", intro: "A zoo animal has been spotted examining the guest snack menu.",
    valid: (g) => g.grid.some(id => getParkItem(id)?.parkType === "zoo"), choices: [
      { id: "rescue", label: "Call the keepers and secure the area", money: -280, reputation: 3, result: "Animal returned safely. Snack kiosk now has a new security policy." },
      { id: "educate", label: "Turn it into a supervised talk", money: 300, reputation: 1, result: "Guests learned a lot. The animal learned where the biscuits are." },
    ] },
];

const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
const avg = (items, fallback = 80) => items.length ? items.reduce((a,b) => a + (Number(b) || 0), 0) / items.length : fallback;

export const blankParkLife = () => ({
  lastProcessedDay: 0, pendingEvent: null, pendingInspection: null,
  eventsResolved: [], inspections: [], lastBonusDay: 0,
});

export function nextParkEvent(game) {
  const available = PARK_LIFE_EVENTS.filter(event => event.valid(game));
  if (!available.length) return null;
  const choice = available[(Math.floor(game.day / 4) + Math.floor(game.guests / 40)) % available.length];
  return { id: `${game.day}:${choice.id}`, day: game.day, type: choice.id };
}

export function getDistrictLife(game) {
  const grid = game.grid || [], zones = game.parkZones || [];
  const records = DISTRICTS.map(d => {
    const indices = zones.map((z, i) => z === d.id ? i : -1).filter(i => i >= 0);
    const built = indices.map(i => getParkItem(grid[i])).filter(Boolean);
    const matches = built.filter(item => (d.matchItems.length === 0 ? item.category === "attraction" : d.matchItems.includes(item.id)));
    const scenery = built.filter(item => item.category === "environment").length;
    const facilities = built.filter(item => ["facility","hotel"].includes(item.category)).length;
    const quality = clamp(matches.length * 21 + Math.min(4, scenery) * 7 + Math.min(3, facilities) * 6 + (indices.length >= 4 ? 10 : 0));
    const active = indices.length > 0 && matches.length > 0;
    const bonus = active && quality >= 55 ? Math.min(350, Math.round((quality - 40) * (1 + matches.length * .16) * 3)) : 0;
    return { id: d.id, name: d.name, desc: d.desc, count: indices.length, matches: matches.length, scenery, facilities, quality, active, bonus, icon: d.icon };
  }).filter(x => x.count > 0);
  return { records, bonusDaily: Math.min(1500, records.reduce((n, district) => n + district.bonus, 0)), active: records.filter(r => r.active).length };
}

export function inspectPark(game) {
  const grid = game.grid || [];
  const objects = grid.map(id => id ? getParkItem(id) : null).filter(Boolean);
  const rides = grid.map((id,i) => getParkItem(id)?.category === "attraction" ? i : -1).filter(i => i >= 0);
  const guards = Number(game.staff?.lifeguard || 0);
  const cleaners = Number(game.staff?.cleaner || 0);
  const mechanics = Number(game.staff?.mechanic || 0);
  const water = clamp(game.waterQualityAvg ?? 95);
  const condition = clamp(avg(rides.map(i => game.attractionCondition?.[i] ?? 100), 80));
  const safety = clamp(Math.round(condition * .55 + Math.min(100, guards / Math.max(1, Math.ceil(rides.length / 3)) * 100) * .35 + Math.min(100, mechanics * 35) * .10 - (game.incidents?.length || 0) * 9));
  const hygiene = clamp(Math.round(water * .75 + Math.min(100, cleaners * 45 + 25) * .25));
  const waits = Object.values(game.visitorStats?.queueStats || {}).map(q => Number(q?.wait) || 0);
  const queue = clamp(100 - Math.max(0, avg(waits, 5) - 5) * 3);
  const mood = clamp(game.visitorStats?.avgMood || (game.guests > 0 ? 62 : 45));
  const facilities = objects.filter(o => o.category === "facility").length;
  const service = clamp(30 + facilities * 13 + (game.guests > 180 && facilities < 2 ? -25 : 15));
  const hospitality = objects.some(o => o.category === "hotel") ? clamp(game.hotelStats?.occupancy || 40) : null;
  const zoo = objects.some(o => o.parkType === "zoo") ? clamp(30 + (game.staff?.zookeeper || 0) * 25 + (grid.includes("wildlife_vet") ? 20 : 0)) : null;
  const sections = [
    {name:"Ride safety", score:safety, hint:"Maintain rides and hire lifeguards and mechanics"},
    {name:"Water and cleanliness", score:hygiene, hint:"Improve water quality and cleaning staff"},
    {name:"Queues", score:queue, hint:"Add attractions and queue capacity"},
    {name:"Guest happiness", score:mood, hint:"Adjust prices and improve visitor experience"},
    {name:"Facilities", score:service, hint:"Build toilets, shops and other facilities"},
    ...(hospitality != null ? [{name:"Hotel hospitality",score:hospitality,hint:"Keep rooms occupied and comfortable"}] : []),
    ...(zoo != null ? [{name:"Zoo care",score:zoo,hint:"Hire keepers and invest in animal welfare"}] : []),
  ];
  const score = clamp(avg(sections.map(s => s.score), 50));
  const grade = score >= 90 ? "Legendary" : score >= 78 ? "Excellent" : score >= 65 ? "Good" : score >= 50 ? "Acceptable" : score >= 32 ? "Poor" : "Catastrophic";
  const worst = [...sections].sort((a,b) => a.score - b.score)[0];
  const remarks = {
    Legendary:"The park is exemplary. Even the rubber ducks have submitted compliments.",
    Excellent:"Most impressive. Management may now look briefly pleased.",
    Good:"A good visit. We found fewer problems than we brought clipboards.",
    Acceptable:"The park is operational. We recommend maintaining that tradition.",
    Poor:"Several improvements are required. The clipboard has requested overtime.",
    Catastrophic:"This inspection required a second pen and a strong cup of tea.",
  };
  const targeted = {
    "Ride safety": "Your mechanic is busy. The rides have been asked to make fewer expensive noises.",
    "Water and cleanliness": "The pool water should sparkle. The inspector's eyebrows should not.",
    "Queues": "The queue is long enough to apply for its own postcode.",
    "Guest happiness": "Several guests are smiling. Several others have requested a refund on the concept of fun.",
    "Facilities": "Your facilities need attention. Even the seagulls are filing formal complaints.",
    "Hotel hospitality": "The hotel has possibilities. We suggest beginning with guests who can find their rooms.",
    "Zoo care": "The zookeeper looks capable. The meerkats have requested a second opinion.",
  };
  const personalisedRemark = score >= 78 ? remarks[grade] : targeted[worst.name] + " " + remarks[grade];
  const money = ({Legendary:2000,Excellent:1100,Good:400,Acceptable:0,Poor:-450,Catastrophic:-950})[grade];
  const reputation = ({Legendary:3,Excellent:2,Good:1,Acceptable:0,Poor:-1,Catastrophic:-3})[grade];
  return {id:`inspection-${game.day}`, day:game.day, score, grade, sections, money, reputation,
    remark: personalisedRemark, advice: `Improve ${worst.name.toLowerCase()}: ${worst.hint}.`};
}
