// Research tree: spend Research Points (RP) to unlock advanced attractions and park bonuses.
// RP is earned each operating day based on attractions built and staff hired.

export const RESEARCH = [
  // Tier 1 — unlock branches
  { id: "wave_tech", name: "Wave Simulation", desc: "Unlock the FlowRider — a stationary wave ride.", cost: 8, tier: 1, unlocks: ["flowrider"] },
  { id: "spin_tech", name: "Spin Cycle Tech", desc: "Unlock Aqua Spin — the swirling bowl slide.", cost: 10, tier: 1, unlocks: ["aqua_spin"] },
  { id: "zipline_infra", name: "Zipline Infrastructure", desc: "Unlock Water Zipline — soaring splash landings.", cost: 11, tier: 1, unlocks: ["water_zipline"] },
  { id: "filtration", name: "Advanced Filtration", desc: "Cleaner water lifts daily guest satisfaction.", cost: 9, tier: 1, bonus: "satisfaction" },

  // Tier 2 — advanced thrills (require a tier-1 branch)
  { id: "hydro_eng", name: "Hydro Engineering", desc: "Unlock Mega Slide Complex — the park's signature thrill.", cost: 16, tier: 2, requires: ["wave_tech"], unlocks: ["mega_slide_complex"] },
  { id: "extreme_thrill", name: "Extreme Thrill Systems", desc: "Unlock Freefall Drop — the tallest, fastest plunge.", cost: 18, tier: 2, requires: ["wave_tech"], unlocks: ["freefall_drop"] },
  { id: "cliff_mastery", name: "Cliff Diving Mastery", desc: "Unlock Cliff Jump — a high-dive spectacle.", cost: 14, tier: 2, requires: ["spin_tech"], unlocks: ["cliff_jump"] },

  // Tier 2 — park bonuses
  { id: "efficiency", name: "Efficient Maintenance", desc: "Reduce all ride upkeep costs by 15%.", cost: 12, tier: 2, requires: ["filtration"], bonus: "upkeep" },
  { id: "marketing", name: "Marketing Analytics", desc: "Increase ticket revenue by 10%.", cost: 15, tier: 2, requires: ["efficiency"], bonus: "tickets" },

  // Tier 3 — specialist attractions
  { id: "family_engineering", name: "Family Water Engineering", desc: "Unlock Adventure Lagoon — a large themed family pool complex.", cost: 20, tier: 3, requires: ["hydro_eng"], unlocks: ["adventure_lagoon"] },
  { id: "rapid_systems", name: "Rapid Flow Systems", desc: "Unlock Rapid Rafting — a high-capacity whitewater attraction.", cost: 22, tier: 3, requires: ["zipline_infra"], unlocks: ["rapid_rafting"] },
  { id: "skyline_design", name: "Skyline Ride Design", desc: "Unlock Sky Walk — a high-elevation park experience.", cost: 24, tier: 3, requires: ["cliff_mastery"], unlocks: ["sky_walk"] },
  { id: "tide_tech", name: "Tidal Propulsion", desc: "Unlock Tidal Coaster — a powered water coaster experience.", cost: 26, tier: 3, requires: ["hydro_eng"], unlocks: ["tidal_coaster"] },
  { id: "wave_lab", name: "Advanced Wave Lab", desc: "Unlock Surf Wave Pool — a premium surf and wave complex.", cost: 21, tier: 3, requires: ["wave_tech"], unlocks: ["surf_wave_pool"] },
  // Tier 4 — signature attractions
  { id: "rocket_flow", name: "Aqua Rocket Engineering", desc: "Unlock Aqua Rocket — a high-speed launch slide.", cost: 30, tier: 4, requires: ["rapid_systems"], unlocks: ["aqua_rocket"] },
  { id: "skybox_tech", name: "Skybox Drop Systems", desc: "Unlock Skybox Plunge — a premium extreme drop.", cost: 32, tier: 4, requires: ["skyline_design"], unlocks: ["skybox_plunge"] },
  { id: "twister_design", name: "Twister Hydrodynamics", desc: "Unlock Twister Slide — a high-capacity spinning slide.", cost: 28, tier: 4, requires: ["tide_tech"], unlocks: ["twister_slide"] },
  { id: "spiral_tech", name: "Spiral Flow Engineering", desc: "Unlock Spiral Plunge — a signature spiral descent.", cost: 27, tier: 4, requires: ["spin_tech"], unlocks: ["spiral_plunge"] },
  { id: "wave_rider_pro", name: "Professional Wave Systems", desc: "Unlock Wave Rider Pro — an advanced surfing attraction.", cost: 29, tier: 4, requires: ["wave_lab"], unlocks: ["wave_rider_pro"] },
];

export const RESEARCH_TIERS = [
  { tier: 1, label: "Foundation" },
  { tier: 2, label: "Advanced" },
  { tier: 3, label: "Specialist" },
  { tier: 4, label: "Signature" },
];

// Returns the research node that gates an attraction, or null if none.
export function researchReqFor(itemId) {
  return RESEARCH.find((r) => r.unlocks?.includes(itemId)) || null;
}

// Can a given research node be started right now?
export function canResearch(node, researchPoints, completedResearch) {
  if (!node) return false;
  if (completedResearch.includes(node.id)) return false;
  if (researchPoints < node.cost) return false;
  if (node.requires && !node.requires.every((r) => completedResearch.includes(r))) return false;
  return true;
}

// Daily RP earned — grows with attractions and staff.
export function dailyResearchPoints(attractionCount, staffTotal) {
  return 2 + Math.floor(attractionCount / 2) + Math.floor(staffTotal / 3);
}