// Emergency system for the water park tycoon.
// Covers ride breakdowns, medical incidents, lost children, weather emergencies,
// pool closures, and evacuations — with staff response, costs, guest reactions,
// reputation consequences, and recovery.

import { getParkItem } from "@/data/gameData";

export const EMERGENCY_TYPES = [
  {
    id: "ride_breakdown",
    name: "Ride Breakdown",
    icon: "Wrench",
    color: "amber",
    staffRequired: "mechanic",
    baseCost: 400,
    costPerSeverity: 300,
    repImpactPerSeverity: 1.2,
    moodImpact: -6,
    guestLeaveChance: 0.04,
    description: "A ride has suffered a major mechanical failure.",
  },
  {
    id: "medical_incident",
    name: "Medical Incident",
    icon: "HeartPulse",
    color: "red",
    staffRequired: "medic",
    altStaff: "lifeguard",
    baseCost: 600,
    costPerSeverity: 500,
    repImpactPerSeverity: 2.0,
    moodImpact: -10,
    guestLeaveChance: 0.08,
    description: "A guest requires urgent medical attention.",
  },
  {
    id: "lost_child",
    name: "Lost Child",
    icon: "Baby",
    color: "blue",
    staffRequired: "security",
    altStaff: "entertainer",
    baseCost: 150,
    costPerSeverity: 100,
    repImpactPerSeverity: 0.8,
    moodImpact: -4,
    guestLeaveChance: 0.02,
    description: "A child has been separated from their family.",
  },
  {
    id: "weather_emergency",
    name: "Weather Emergency",
    icon: "CloudLightning",
    color: "slate",
    staffRequired: "lifeguard",
    baseCost: 0,
    costPerSeverity: 800,
    repImpactPerSeverity: 0.8,
    moodImpact: -12,
    guestLeaveChance: 0.25,
    description: "Severe weather threatens guest safety.",
  },
  {
    id: "pool_closure",
    name: "Pool Contamination",
    icon: "Droplet",
    color: "cyan",
    staffRequired: "cleaner",
    baseCost: 500,
    costPerSeverity: 350,
    repImpactPerSeverity: 1.5,
    moodImpact: -8,
    guestLeaveChance: 0.06,
    description: "A pool has contamination and must be closed for cleaning.",
  },
  {
    id: "evacuation",
    name: "Park Evacuation",
    icon: "Footprints",
    color: "red",
    staffRequired: "security",
    baseCost: 1500,
    costPerSeverity: 1200,
    repImpactPerSeverity: 2.5,
    moodImpact: -18,
    guestLeaveChance: 1.0,
    description: "A severe emergency requires evacuating the entire park.",
  },
];

export const SEVERITY_LABELS = ["", "Minor", "Moderate", "Major", "Critical"];
export const SEVERITY_COLORS = {
  1: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", badge: "bg-amber-500" },
  2: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", badge: "bg-orange-500" },
  3: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", badge: "bg-red-500" },
  4: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-400", badge: "bg-rose-600" },
};

const POOL_IDS = ["wave_pool", "lazy_river", "kiddie_pool", "splash_pad", "lap_sports_pool", "surf_wave_pool", "adventure_river", "dive_pool", "water_volleyball", "hot_tub"];

function createEmergency(typeId, day, tileIndex, locationName, severity) {
  const def = EMERGENCY_TYPES.find((t) => t.id === typeId);
  if (!def) return null;
  const sev = Math.max(1, Math.min(4, severity));
  return {
    id: `${typeId}-${day}-${Math.random().toString(36).slice(2, 7)}`,
    type: typeId,
    name: def.name,
    icon: def.icon,
    color: def.color,
    severity: sev,
    tileIndex: tileIndex ?? null,
    locationName: locationName || null,
    day,
    progress: 0,
    cost: def.baseCost + def.costPerSeverity * sev,
    repImpact: Math.round(def.repImpactPerSeverity * sev),
    moodImpact: def.moodImpact,
    guestLeaveChance: def.guestLeaveChance,
    staffRequired: def.staffRequired,
    altStaff: def.altStaff || null,
  };
}

function getRespondingStaff(em, staff, staffAssignments, parkZones) {
  const primary = staff?.[em.staffRequired] || 0;
  const alt = em.altStaff ? (staff?.[em.altStaff] || 0) : 0;
  if (em.tileIndex != null && parkZones) {
    const zone = parkZones[em.tileIndex] || "";
    const assignment = staffAssignments?.[em.staffRequired] || "";
    if (assignment && assignment !== zone) return Math.floor(alt / 2);
  }
  return primary + Math.floor(alt / 2);
}

/**
 * Run the full emergency simulation for a day.
 * Returns new/updated/resolved emergencies plus aggregate effects.
 */
export function simulateEmergencies(context) {
  const {
    day, emergencies: active, staff, staffAssignments, parkZones,
    attractionCondition, weather, cleanliness, safety, guests,
    attractions, sandbox,
  } = context;

  const logEntries = [];
  const updated = [];
  const resolved = [];
  let totalCost = 0;
  let repImpact = 0;
  let moodImpact = 0;
  let guestsLost = 0;

  // 1. Progress existing emergencies
  for (const em of (active || [])) {
    const respondingStaff = getRespondingStaff(em, staff, staffAssignments, parkZones);
    const progressRate = 20 + respondingStaff * 22;
    const newProgress = Math.min(100, em.progress + progressRate);
    const daysActive = day - em.day;

    if (newProgress >= 100) {
      resolved.push(em);
      const speedMult = Math.max(0.3, 1 - Math.max(0, 3 - daysActive) * 0.2);
      const finalRep = Math.round(em.repImpact * speedMult);
      repImpact += finalRep;
      totalCost += em.cost;
      logEntries.push({
        day,
        text: `Day ${day}: ✅ ${em.name} resolved${em.locationName ? ` at ${em.locationName}` : ""}. Cost: £${em.cost.toLocaleString()}. ${finalRep > 0 ? `-${finalRep} reputation.` : "Minimal reputation impact!"}`,
      });
    } else {
      let severity = em.severity;
      if (respondingStaff === 0 && daysActive >= 2 && severity < 4) {
        severity += 1;
        logEntries.push({
          day,
          text: `Day ${day}: ⚠️ ${em.name} escalating — no ${em.staffRequired} on duty! Now ${SEVERITY_LABELS[severity]}.`,
        });
      }
      updated.push({ ...em, progress: newProgress, severity });
    }
  }

  // 2. Roll new emergencies
  const newEmergencies = [];
  if (!sandbox && guests > 0) {
    // Ride breakdown from very low condition
    const lowCondRides = attractions.filter((a) => (attractionCondition?.[a.idx] ?? 100) < 25);
    if (lowCondRides.length > 0 && Math.random() < 0.2) {
      const ride = lowCondRides[Math.floor(Math.random() * lowCondRides.length)];
      const sev = Math.min(4, Math.max(1, Math.ceil((100 - (attractionCondition?.[ride.idx] ?? 100)) / 25)));
      newEmergencies.push(createEmergency("ride_breakdown", day, ride.idx, ride.attr.name, sev));
    }

    // Medical incident — scales with guests, reduced by safety
    const medChance = 0.04 * (1 - safety * 0.4) * Math.min(1, guests / 100);
    if (Math.random() < medChance) {
      const sev = Math.random() < 0.15 ? 3 : Math.random() < 0.4 ? 2 : 1;
      newEmergencies.push(createEmergency("medical_incident", day, null, null, sev));
    }

    // Lost child
    if (guests > 20 && Math.random() < 0.03) {
      newEmergencies.push(createEmergency("lost_child", day, null, null, 1));
    }

    // Weather emergency — triggered by storms
    if (weather?.id === "storm" && Math.random() < 0.35) {
      const sev = Math.random() < 0.25 ? 4 : 3;
      newEmergencies.push(createEmergency("weather_emergency", day, null, null, sev));
    }

    // Pool closure — low cleanliness
    if (cleanliness < 0.55 && Math.random() < 0.1) {
      const pools = attractions.filter((a) => POOL_IDS.includes(a.id));
      if (pools.length > 0) {
        const pool = pools[Math.floor(Math.random() * pools.length)];
        const sev = Math.min(3, Math.max(1, Math.ceil((0.55 - cleanliness) * 6)));
        newEmergencies.push(createEmergency("pool_closure", day, pool.idx, pool.attr.name, sev));
      }
    }

    // Evacuation — only if a critical emergency is active or just triggered
    const hasCritical = (active || []).some((e) => e.severity >= 4) || newEmergencies.some((e) => e.severity >= 4);
    if (hasCritical && guests > 30 && Math.random() < 0.08) {
      newEmergencies.push(createEmergency("evacuation", day, null, null, 4));
    }
  }

  // 3. Apply effects for new emergencies
  for (const em of newEmergencies) {
    totalCost += em.cost;
    repImpact += em.repImpact;
    moodImpact += em.moodImpact;
    guestsLost += Math.round(guests * em.guestLeaveChance);
    logEntries.push({
      day,
      text: `Day ${day}: 🚨 ${em.name}${em.locationName ? ` at ${em.locationName}` : ""}! Severity: ${SEVERITY_LABELS[em.severity]}. Est. cost: £${em.cost.toLocaleString()}.`,
    });
  }

  return {
    newEmergencies,
    updatedEmergencies: updated,
    resolvedEmergencies: resolved,
    allActive: [...updated, ...newEmergencies],
    totalCost,
    repImpact,
    moodImpact,
    guestsLost,
    logEntries,
  };
}