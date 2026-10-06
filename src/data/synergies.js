// Ride Synergy Bonuses: adjacent complementary rides give a small income/appeal boost.

// Synergy groups — rides in the same group synergize when placed adjacent (including diagonals).
export const SYNERGY_GROUPS = [
  {
    id: "relaxation",
    name: "Relaxation Combo",
    desc: "Wave pools, lazy rivers & adventure rivers near each other",
    rides: ["wave_pool", "lazy_river", "adventure_river", "surf_wave_pool"],
    bonus: { incomeMult: 0.05, appealBonus: 3 },
  },
  {
    id: "thrill",
    name: "Thrill Seeker Cluster",
    desc: "Speed slides, freefall drops & aqua loops near each other",
    rides: ["speed_slide", "kamikaze_slide", "aqua_loop", "freefall_drop", "skybox_plunge"],
    bonus: { incomeMult: 0.06, appealBonus: 4 },
  },
  {
    id: "family",
    name: "Family Fun Zone",
    desc: "Kiddie pools, play structures & family raft rides near each other",
    rides: ["kiddie_pool", "play_structure", "family_raft", "splash_pad", "soft_play"],
    bonus: { incomeMult: 0.04, appealBonus: 5 },
  },
  {
    id: "extreme",
    name: "Extreme Sports Hub",
    desc: "FlowRiders, water coasters & cliff jumps near each other",
    rides: ["flowrider", "water_coaster", "cliff_jump", "wave_rider_pro", "aqua_rocket", "tidal_coaster"],
    bonus: { incomeMult: 0.07, appealBonus: 5 },
  },
  {
    id: "racing",
    name: "Racing District",
    desc: "Multi-lane racers & boomerang halfpipes near each other",
    rides: ["multi_racer", "halfpipe", "water_zipline", "go_karts"],
    bonus: { incomeMult: 0.05, appealBonus: 3 },
  },
];

// Grid is laid out as a flat array. We need to know the number of columns
// to compute adjacency. The game uses a square grid (gridSize = cols * rows).
export function getGridCols(gridSize) {
  return Math.round(Math.sqrt(gridSize));
}

// Check if two tile indices are adjacent (including diagonals).
function isAdjacent(idx1, idx2, cols) {
  const r1 = Math.floor(idx1 / cols);
  const c1 = idx1 % cols;
  const r2 = Math.floor(idx2 / cols);
  const c2 = idx2 % cols;
  return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1 && idx1 !== idx2;
}

// Calculate synergy bonuses for all placed attractions.
// Returns { totalIncomeMult, totalAppealBonus, activeSynergies: [{group, count}] }
export function calculateSynergies(grid) {
  const cols = getGridCols(grid.length);
  const placed = grid
    .map((id, idx) => ({ id, idx }))
    .filter((p) => p.id);

  const activeSynergies = [];
  let totalIncomeMult = 0;
  let totalAppealBonus = 0;

  for (const group of SYNERGY_GROUPS) {
    const groupTiles = placed.filter((p) => group.rides.includes(p.id));
    if (groupTiles.length < 2) continue;

    // Count pairs that are adjacent
    let adjacentPairs = 0;
    for (let i = 0; i < groupTiles.length; i++) {
      for (let j = i + 1; j < groupTiles.length; j++) {
        if (isAdjacent(groupTiles[i].idx, groupTiles[j].idx, cols)) {
          adjacentPairs++;
        }
      }
    }

    if (adjacentPairs > 0) {
      // Diminishing returns: each additional pair adds less
      const multiplier = Math.min(3, adjacentPairs) * 0.5 + (adjacentPairs > 3 ? 0.5 : 0);
      activeSynergies.push({
        group: group.id,
        name: group.name,
        pairs: adjacentPairs,
        incomeMult: group.bonus.incomeMult * multiplier,
        appealBonus: Math.round(group.bonus.appealBonus * multiplier),
      });
      totalIncomeMult += group.bonus.incomeMult * multiplier;
      totalAppealBonus += Math.round(group.bonus.appealBonus * multiplier);
    }
  }

  return {
    totalIncomeMult: Math.min(0.3, totalIncomeMult),
    totalAppealBonus,
    activeSynergies,
  };
}