// Advanced living-park systems: signature mega projects, individual guest stories,
// water engineering and destination maps. These are simulation systems, not placeholder UI.

export const MEGA_PROJECTS = [
  { id: "mega_wave_lagoon", name: "Titan Wave Lagoon", icon: "Waves", cost: 750000, level: 12, buildDays: 4, capacity: 420, incomeMult: 0.10, guestMult: 0.08, waterLoad: 22, prestige: 450, description: "A stadium-sized wave lagoon with timed surf sessions and family waves." },
  { id: "mega_slide_tower", name: "Skyfall Slide Tower", icon: "TowerControl", cost: 1100000, level: 16, buildDays: 5, capacity: 300, incomeMult: 0.14, guestMult: 0.10, waterLoad: 18, prestige: 650, description: "A landmark multi-slide tower with a near-vertical signature drop." },
  { id: "mega_lazy_river", name: "Endless River Resort", icon: "Waves", cost: 900000, level: 18, buildDays: 5, capacity: 360, incomeMult: 0.12, guestMult: 0.09, waterLoad: 16, prestige: 550, description: "A full resort-scale lazy river wrapped around the park." },
  { id: "mega_aquatic_stadium", name: "Aquatic Arena", icon: "Trophy", cost: 1500000, level: 22, buildDays: 7, capacity: 520, incomeMult: 0.18, guestMult: 0.14, waterLoad: 28, prestige: 1000, description: "A world-class aquatic stadium for competitions, night shows and VIP events." },
];

export const DESTINATIONS = [
  { id: "home_resort", name: "Home Resort", level: 1, cost: 0, theme: "tropical", weather: "balanced", guestMult: 1, incomeMult: 1, waterTempTarget: 28, description: "Your original flagship waterpark." },
  { id: "coastal_bay", name: "Coastal Bay", level: 10, cost: 250000, theme: "caribbean", weather: "sunny", guestMult: 1.06, incomeMult: 1.04, waterTempTarget: 26, description: "A seaside destination with strong summer demand." },
  { id: "tropical_island", name: "Tropical Island", level: 18, cost: 650000, theme: "tropical", weather: "hot", guestMult: 1.10, incomeMult: 1.08, waterTempTarget: 29, description: "Permanent holiday atmosphere and premium resort spending." },
  { id: "alpine_adventure", name: "Alpine Adventure", level: 24, cost: 1100000, theme: "extreme", weather: "cool", guestMult: 1.04, incomeMult: 1.12, waterTempTarget: 31, description: "Cold-climate engineering makes heated water and indoor attractions valuable." },
  { id: "celestial_resort", name: "Celestial Resort", level: 30, cost: 2500000, theme: "futuristic", weather: "clear", guestMult: 1.16, incomeMult: 1.18, waterTempTarget: 30, description: "The ultimate endgame destination." },
];

export const STORY_TYPES = [
  { id: "first_visit", text: (n) => `${n} arrived for their first family day and are already planning a return visit.` },
  { id: "thrill", text: (n) => `${n} conquered the park's biggest thrill rides and shared the experience with friends.` },
  { id: "foodie", text: (n) => `${n} spent heavily on food and called the dining experience a highlight of the visit.` },
  { id: "hotel", text: (n) => `${n} upgraded their stay and extended the trip after enjoying the park.` },
  { id: "complaint", text: (n) => `${n} reported frustration after long queues and warned that the park needs more capacity.` },
  { id: "weather", text: (n) => `${n} changed plans because of the weather but appreciated the park's covered and heated options.` },
  { id: "vip", text: (n) => `${n} received VIP treatment and left with a strong recommendation for the resort.` },
  { id: "returning", text: (n) => `${n} returned to a favourite attraction and brought friends along this time.` },
];

const NAMES = ["The Carter family", "Mia", "Oliver", "The Williams family", "Jack", "Amelia", "The Patel family", "Noah", "Sophie", "The Thompson family"];

export function simulateMegaProjects(projects, day) {
  const active = (projects || []).map((p) => {
    if (p.status !== "building") return p;
    const progress = Math.min(p.buildDays, (p.progress || 0) + 1);
    return { ...p, progress, status: progress >= p.buildDays ? "complete" : "building", completedDay: progress >= p.buildDays ? day : p.completedDay };
  });
  return active;
}

export function megaBonuses(projects) {
  return (projects || []).filter((p) => p.status === "complete").reduce((b, p) => {
    const d = MEGA_PROJECTS.find((x) => x.id === p.projectId);
    if (!d) return b;
    b.capacity += d.capacity;
    b.incomeMult += d.incomeMult;
    b.guestMult += d.guestMult;
    b.waterLoad += d.waterLoad;
    b.prestige += d.prestige;
    return b;
  }, { capacity: 0, incomeMult: 0, guestMult: 0, waterLoad: 0, prestige: 0 });
}

export function waterEngineering({ grid, waterQuality, weather, staff, upgrades, destination, megaProjects }) {
  const waterAttractions = (grid || []).filter((id) => id && ["wave_pool","lazy_river","kiddie_pool","splash_pad","surf_wave_pool","adventure_river","dive_pool","hot_tub","lap_sports_pool"].includes(id)).length;
  const pumps = Math.max(1, Math.ceil(waterAttractions / 3));
  const aquatics = staff?.aquatics_director || 0;
  const cleaners = staff?.cleaner || 0;
  const upgradeLoad = (upgrades || []).reduce((s, n) => s + (n || 0), 0) * 0.15;
  const megaLoad = megaBonuses(megaProjects).waterLoad;
  const target = destination?.waterTempTarget || 28;
  const ambient = weather?.id === "rain" ? 20 : weather?.id === "storm" ? 18 : weather?.id === "sunny" ? 27 : 24;
  const heatingNeed = Math.max(0, target - ambient);
  const filtration = Math.min(100, 58 + cleaners * 7 + aquatics * 9 + pumps * 2 - upgradeLoad - megaLoad * 0.35);
  const temperature = Math.max(15, Math.min(34, ambient + Math.min(8, pumps * 0.5 + aquatics * 0.8)));
  const energyCost = Math.round(waterAttractions * 22 + pumps * 55 + heatingNeed * 65 + megaLoad * 18);
  const qualityAvg = Array.isArray(waterQuality) && waterAttractions ? waterQuality.filter((_, i) => grid[i] && ["wave_pool","lazy_river","kiddie_pool","splash_pad","surf_wave_pool","adventure_river","dive_pool","hot_tub","lap_sports_pool"].includes(grid[i])).reduce((a,b)=>a+b,0) / Math.max(1, waterAttractions) : 100;
  const engineeringScore = Math.max(0, Math.min(100, filtration - Math.max(0, Math.abs(temperature-target)*4)));
  return { pumps, filtration: Math.round(filtration), temperature: Math.round(temperature * 10) / 10, targetTemperature: target, energyCost, qualityAvg: Math.round(qualityAvg), engineeringScore: Math.round(engineeringScore) };
}

export function generateGuestStories({ day, guests, visitorStats, hotelStats, retailStats, weather, megaProjects, activeEvents, waterEngineering: water }) {
  if (!guests || guests < 5) return [];
  const mood = visitorStats?.avgMood || 50;
  const stories = [];
  const pool = [
    ...(mood >= 72 ? ["first_visit", "returning", "vip"] : []),
    ...(visitorStats?.avgSpendPerVisit > 45 ? ["foodie"] : []),
    ...((hotelStats?.occupancy || 0) > 60 ? ["hotel"] : []),
    ...(mood < 48 ? ["complaint"] : []),
    ...(weather?.id === "rain" || weather?.id === "storm" ? ["weather"] : []),
    ...(megaProjects?.some((p) => p.status === "complete") ? ["thrill", "vip"] : []),
  ];
  const ids = pool.length ? pool : ["first_visit"];
  const count = Math.min(3, Math.max(1, Math.floor(guests / 180)));
  for (let i=0;i<count;i++) {
    const typeId = ids[(day + i) % ids.length];
    const type = STORY_TYPES.find((x) => x.id === typeId) || STORY_TYPES[0];
    const name = NAMES[(day + i) % NAMES.length];
    stories.push({ id: `story-${day}-${i}`, day, type: typeId, title: name, text: type.text(name), mood: Math.round(mood), waterScore: water?.engineeringScore || 0, event: activeEvents?.[0]?.name || null, createdAt: Date.now() });
  }
  return stories;
}
