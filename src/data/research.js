  { id: "marketing", name: "Marketing Analytics", desc: "Increase ticket revenue by 10%.", cost: 15, tier: 2, requires: ["efficiency"], bonus: "tickets" },
];

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
]

export const RESEARCH_TIERS = [
  { tier: 1, label: "Foundation" },
  { tier: 2, label: "Advanced" },
  { tier: 3, label: "Specialist" },
  { tier: 4, label: "Signature" },
];