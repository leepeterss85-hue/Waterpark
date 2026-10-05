// Pre-built starter parks players can choose from when starting a new game.
// Each park defines a starting grid (48-tile layout), starting money, and
// starting XP so the player begins at the park's intended level.

const EMPTY_GRID = Array(48).fill(null);
EMPTY_GRID[40] = "park_entrance";
EMPTY_GRID[41] = "main_path";
EMPTY_GRID[42] = "main_path";
EMPTY_GRID[43] = "main_path";

function buildGrid(placements) {
  const g = [...EMPTY_GRID];
  for (const [idx, id] of Object.entries(placements)) {
    g[Number(idx)] = id;
  }
  return g;
}

export const STARTER_PARKS = [
  {
    id: "empty_lot",
    name: "Empty Lot",
    tagline: "Start from scratch",
    description: "A blank canvas with just the entrance and a short path. Build your dream park from the ground up.",
    icon: "Sprout",
    color: "from-emerald-400 to-green-600",
    level: 1,
    money: 50000,
    xp: 0,
    grid: [...EMPTY_GRID],
  },
  {
    id: "family_splash",
    name: "Family Splash",
    tagline: "Kid-friendly starter park",
    description: "A cozy family park with a wave pool, lazy river and splash pad. Great for learning the ropes.",
    icon: "Baby",
    color: "from-pink-400 to-rose-500",
    level: 2,
    money: 35000,
    xp: 100,
    grid: buildGrid({
      0: "kiddie_pool",
      2: "splash_pad",
      5: "palm_tree",
      9: "lazy_river",
      13: "palm_tree",
      18: "wave_pool",
      19: "family_raft",
      35: "dining",
      44: "toilets",
    }),
  },
  {
    id: "thrill_seeker",
    name: "Thrill Seeker",
    tagline: "High-adrenaline slides",
    description: "Built for speed junkies — kamikaze slides, freefall drops and cliff jumps. Higher risk, higher reward.",
    icon: "Flame",
    color: "from-red-400 to-orange-600",
    level: 3,
    money: 40000,
    xp: 250,
    grid: buildGrid({
      0: "speed_slide",
      2: "kamikaze_slide",
      9: "aqua_loop",
      11: "first_aid",
      18: "freefall_drop",
      26: "cliff_jump",
      27: "halfpipe",
      35: "dining",
      44: "toilets",
    }),
  },
  {
    id: "resort_retreat",
    name: "Resort Retreat",
    tagline: "Relaxation & wellness",
    description: "A premium wellness resort with spas, hot tubs, cabanas and a lazy river. Steady income from happy guests.",
    icon: "Flower2",
    color: "from-violet-400 to-purple-500",
    level: 4,
    money: 60000,
    xp: 450,
    grid: buildGrid({
      0: "hot_tub",
      2: "spa",
      9: "sauna",
      11: "sun_lounge",
      18: "massage_pavilion",
      19: "lazy_river",
      26: "cabanas",
      27: "wave_pool",
      35: "beach_lounging",
      44: "dining",
    }),
  },
  {
    id: "mega_park",
    name: "Mega Park",
    tagline: "Established mega resort",
    description: "A large established park with top-tier attractions and VIP facilities. Big budget, big crowds, big challenges.",
    icon: "Crown",
    color: "from-amber-400 to-yellow-600",
    level: 5,
    money: 80000,
    xp: 700,
    grid: buildGrid({
      0: "wave_pool",
      2: "mega_slide_complex",
      9: "water_coaster",
      11: "dining",
      18: "tornado_bowl",
      19: "arcade",
      26: "flowrider",
      27: "spa",
      35: "family_raft",
      36: "first_aid",
      44: "vip_lounge",
    }),
  },
];

export function getStarterPark(id) {
  return STARTER_PARKS.find((p) => p.id === id) || STARTER_PARKS[0];
}