// Construction Projects system for the water park tycoon.
// Large multi-day projects: hotels, major rides, resort expansion,
// renovations, and infrastructure — with costs, construction times,
// temporary disruption, and completion rewards.

export const PROJECT_TYPES = [
  // --- Hotels ---
  {
    id: "hotel_luxury",
    name: "Luxury Resort Hotel",
    category: "hotel",
    targetItemId: "hotel_luxury",
    cost: 80000,
    duration: 7,
    description: "5-star luxury resort with spa, fine dining, and premium suites.",
    disruption: { guestMult: 0.85, repPerDay: -0.5 },
    rewards: { reputation: 8, xp: 200 },
    icon: "Hotel",
    color: "violet",
  },
  {
    id: "hotel_family",
    name: "Family Resort Hotel",
    category: "hotel",
    targetItemId: "hotel_family",
    cost: 45000,
    duration: 5,
    description: "Family-friendly resort with kids club and pool.",
    disruption: { guestMult: 0.88, repPerDay: -0.3 },
    rewards: { reputation: 5, xp: 120 },
    icon: "Hotel",
    color: "blue",
  },
  {
    id: "hotel_budget",
    name: "Budget Hotel",
    category: "hotel",
    targetItemId: "hotel_budget",
    cost: 25000,
    duration: 3,
    description: "Budget-friendly hotel for cost-conscious guests.",
    disruption: { guestMult: 0.92, repPerDay: -0.2 },
    rewards: { reputation: 3, xp: 60 },
    icon: "Hotel",
    color: "amber",
  },
  // --- Major Rides ---
  {
    id: "ride_mega_coaster",
    name: "Mega Water Coaster",
    category: "ride",
    targetItemId: "water_coaster",
    cost: 35000,
    duration: 4,
    description: "Thrilling multi-drop water coaster — the park's signature attraction.",
    disruption: { guestMult: 0.90, repPerDay: -0.3 },
    rewards: { reputation: 6, xp: 150 },
    icon: "Waves",
    color: "cyan",
  },
  {
    id: "ride_tornado",
    name: "Tornado Bowl Complex",
    category: "ride",
    targetItemId: "tornado_bowl",
    cost: 28000,
    duration: 4,
    description: "Giant tornado bowl slide complex with multiple flumes.",
    disruption: { guestMult: 0.90, repPerDay: -0.3 },
    rewards: { reputation: 5, xp: 130 },
    icon: "Wind",
    color: "indigo",
  },
  {
    id: "ride_aqua_loop",
    name: "Aqua Loop Complex",
    category: "ride",
    targetItemId: "aqua_loop",
    cost: 22000,
    duration: 3,
    description: "Vertical drop aqua loop slide complex.",
    disruption: { guestMult: 0.92, repPerDay: -0.2 },
    rewards: { reputation: 4, xp: 100 },
    icon: "ArrowDownUp",
    color: "blue",
  },
  // --- Expansion ---
  {
    id: "expansion_resort",
    name: "Resort Expansion",
    category: "expansion",
    cost: 20000,
    duration: 5,
    description: "Expand the park with a new section of land for future development.",
    disruption: { guestMult: 0.85, repPerDay: -0.4 },
    rewards: { reputation: 4, xp: 100, lots: 8 },
    icon: "Maximize2",
    color: "emerald",
  },
  // --- Renovations ---
  {
    id: "renovation_ride",
    name: "Ride Renovation",
    category: "renovation",
    cost: 8000,
    duration: 2,
    description: "Renovate an existing ride — reset condition, max upgrade, boost popularity.",
    disruption: { guestMult: 0.95, repPerDay: -0.1 },
    rewards: { reputation: 2, xp: 50 },
    icon: "Sparkles",
    color: "amber",
  },
  // --- Infrastructure ---
  {
    id: "infrastructure_entrance",
    name: "Grand Entrance Plaza",
    category: "infrastructure",
    cost: 15000,
    duration: 4,
    description: "Grand entrance plaza with fountains, landscaping, and guest services.",
    disruption: { guestMult: 0.88, repPerDay: -0.3 },
    rewards: { reputation: 7, xp: 100 },
    icon: "DoorOpen",
    color: "teal",
  },
  {
    id: "infrastructure_parking",
    name: "Parking Complex",
    category: "infrastructure",
    cost: 12000,
    duration: 3,
    description: "Multi-level parking complex to increase guest capacity.",
    disruption: { guestMult: 0.92, repPerDay: -0.2 },
    rewards: { reputation: 3, xp: 80 },
    icon: "Car",
    color: "slate",
  },
];

export const CATEGORY_LABELS = {
  hotel: "Hotels",
  ride: "Major Rides",
  expansion: "Expansion",
  renovation: "Renovations",
  infrastructure: "Infrastructure",
};

/**
 * Compute the aggregate disruption from all active construction projects.
 * Called early in advanceDay, before the demand calculation.
 */
export function getConstructionDisruption(projects) {
  let guestMult = 1;
  let repPerDay = 0;
  for (const project of (projects || [])) {
    if (project.status !== "in_progress") continue;
    const def = PROJECT_TYPES.find((p) => p.id === project.projectId);
    if (!def) continue;
    guestMult *= def.disruption.guestMult;
    repPerDay += def.disruption.repPerDay;
  }
  return { guestMult, repPerDay };
}

/**
 * Progress all active construction projects and check for completion.
 * Called late in advanceDay, after the day counter has advanced.
 * Returns updated projects, completion actions, rewards, and log entries.
 */
export function simulateConstruction(context) {
  const { day, projects, grid, instantConstruction = false } = context;
  const updatedProjects = [];
  const completionActions = [];
  const logEntries = [];
  let totalRepReward = 0;
  let totalXpReward = 0;
  const claimedTiles = new Set();

  for (const project of (projects || [])) {
    if (project.status !== "in_progress") {
      updatedProjects.push(project);
      continue;
    }
    const def = PROJECT_TYPES.find((p) => p.id === project.projectId);
    if (!def) {
      updatedProjects.push(project);
      continue;
    }

    const daysElapsed = day - project.startedDay;
    const progress = instantConstruction ? 100 : Math.min(100, (daysElapsed / def.duration) * 100);

    if (progress >= 100) {
      // Try to complete
      if (def.category === "hotel" || def.category === "ride") {
        const emptyTile = Number.isInteger(project.targetTile)
          ? (!grid[project.targetTile] && !claimedTiles.has(project.targetTile) ? project.targetTile : -1)
          : grid.findIndex((g, i) => !g && !claimedTiles.has(i));
        if (emptyTile === -1) {
          updatedProjects.push({ ...project, progress: 100, needsSpace: true });
          continue;
        }
        claimedTiles.add(emptyTile);
        completionActions.push({ type: "place", tileIndex: emptyTile, itemId: def.targetItemId });
      } else if (def.category === "expansion") {
        completionActions.push({ type: "expand", lots: def.rewards.lots || 8 });
      } else if (def.category === "renovation") {
        // A renovation is tied to a specific ride. If that ride disappeared while the
        // project was in progress (for example after loading an old save), do not grant
        // completion rewards for work that could not be applied.
        if (project.targetTile != null && grid[project.targetTile]) {
          completionActions.push({ type: "renovate", tileIndex: project.targetTile });
          totalRepReward += def.rewards.reputation || 0;
          totalXpReward += def.rewards.xp || 0;
          updatedProjects.push({ ...project, status: "completed", progress: 100, completedDay: day });
          logEntries.push({
            day,
            text: `Day ${day}: 🎉 ${def.category === "ride" || def.category === "hotel" ? "GRAND OPENING" : "PROJECT COMPLETE"}: ${def.name}! +${def.rewards.reputation} reputation, +${def.rewards.xp} XP.`,
          });
        } else {
          updatedProjects.push({ ...project, status: "cancelled", progress: 100, cancelledDay: day, cancelReason: "target_missing" });
          logEntries.push({
            day,
            text: `Day ${day}: ⚠️ ${def.name} could not complete because its target ride no longer exists. No completion reward was granted.`,
          });
        }
        continue;
      }
      totalRepReward += def.rewards.reputation || 0;
      totalXpReward += def.rewards.xp || 0;
      updatedProjects.push({ ...project, status: "completed", progress: 100, completedDay: day });
      logEntries.push({
        day,
        text: `Day ${day}: 🎉 ${def.category === "ride" || def.category === "hotel" ? "GRAND OPENING" : "PROJECT COMPLETE"}: ${def.name}! +${def.rewards.reputation} reputation, +${def.rewards.xp} XP.`,
      });
    } else {
      updatedProjects.push({ ...project, progress });
    }
  }

  return { updatedProjects, completionActions, totalRepReward, totalXpReward, logEntries };
}