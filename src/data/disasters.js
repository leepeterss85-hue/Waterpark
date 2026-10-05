// Major park-wide disasters — rare multi-day events that hit the whole park,
// distinct from per-attraction incidents. Staff and research can mitigate them.

export const DISASTERS = [
  {
    id: "water_contamination",
    name: "Water Contamination",
    icon: "Droplet",
    color: "from-red-500 to-rose-700",
    description: "A contamination alert forces pool closures. Guests drop sharply until resolved.",
    severity: "high",
    duration: 3,
    effects: { guestMult: 0.45, incomeMult: 0.55, repDelta: -2.5, utilityMult: 1.3 },
    mitigation: "Cleaners and filtration research reduce the duration.",
  },
  {
    id: "power_outage",
    name: "Power Outage",
    icon: "Zap",
    color: "from-amber-500 to-orange-700",
    description: "A grid failure shuts down pumps and rides across the park.",
    severity: "high",
    duration: 2,
    effects: { guestMult: 0.55, incomeMult: 0.50, repDelta: -2, utilityMult: 0.4 },
    mitigation: "Mechanics restore power faster. Backup generators help.",
  },
  {
    id: "heatwave_emergency",
    name: "Extreme Heatwave",
    icon: "Sun",
    color: "from-orange-400 to-red-600",
    description: "Dangerous temperatures surge guest numbers but strain facilities.",
    severity: "medium",
    duration: 4,
    effects: { guestMult: 1.4, incomeMult: 1.15, repDelta: -1.5, utilityMult: 1.6 },
    mitigation: "More lifeguards and drinking fountains keep guests safe.",
  },
  {
    id: "storm_damage",
    name: "Storm Damage",
    icon: "CloudLightning",
    color: "from-slate-600 to-slate-800",
    description: "A severe storm damages attractions and forces closures.",
    severity: "high",
    duration: 3,
    effects: { guestMult: 0.35, incomeMult: 0.40, repDelta: -3, utilityMult: 0.8 },
    mitigation: "Mechanics repair faster. Insurance research reduces losses.",
  },
  {
    id: "outbreak",
    name: "Illness Outbreak",
    icon: "HeartPulse",
    color: "from-rose-400 to-pink-600",
    description: "A stomach bug spreads among guests. Attendance plummets.",
    severity: "critical",
    duration: 5,
    effects: { guestMult: 0.30, incomeMult: 0.35, repDelta: -4, utilityMult: 1.2 },
    mitigation: "First aid stations, cleaners and medical staff reduce spread.",
  },
  {
    id: "water_shortage",
    name: "Water Shortage",
    icon: "Droplets",
    color: "from-cyan-500 to-blue-700",
    description: "A regional drought restricts water supply. Pools run at reduced capacity.",
    severity: "medium",
    duration: 4,
    effects: { guestMult: 0.65, incomeMult: 0.70, repDelta: -1, utilityMult: 1.5 },
    mitigation: "Filtration and efficiency research help weather the shortage.",
  },
  {
    id: "vip_injury",
    name: "VIP Incident",
    icon: "Crown",
    color: "from-violet-500 to-purple-700",
    description: "A high-profile guest was injured. Media coverage damages reputation.",
    severity: "medium",
    duration: 3,
    effects: { guestMult: 0.70, incomeMult: 0.80, repDelta: -5, utilityMult: 1 },
    mitigation: "Security and first aid stations limit the fallout.",
  },
];

// Roll for a disaster. Rare event — only after day 5, with low probability.
export function rollDisaster(day, completedResearch = []) {
  if (day < 5) return null;
  if (Math.random() > 0.04) return null;
  // Research "risk_management" cuts disaster chance (handled by caller)
  const available = DISASTERS.filter((d) => {
    if (d.id === "water_contamination" && completedResearch.includes("filtration")) return false;
    if (d.id === "storm_damage" && completedResearch.includes("reinforcement")) return false;
    return true;
  });
  return available[Math.floor(Math.random() * available.length)] || null;
}

// Compute mitigation factor: staff + research reduce effective duration.
export function disasterMitigation(disaster, staff = {}, completedResearch = []) {
  let reduction = 0;
  if (disaster.id === "water_contamination") {
    reduction += Math.min(1.5, (staff.cleaner || 0) * 0.3);
    if (completedResearch.includes("filtration")) reduction += 1;
  } else if (disaster.id === "power_outage") {
    reduction += Math.min(1.5, (staff.mechanic || 0) * 0.3);
  } else if (disaster.id === "storm_damage") {
    reduction += Math.min(1.5, (staff.mechanic || 0) * 0.25);
    if (completedResearch.includes("reinforcement")) reduction += 1;
  } else if (disaster.id === "outbreak") {
    reduction += Math.min(2, (staff.cleaner || 0) * 0.2 + (staff.security || 0) * 0.15);
  } else if (disaster.id === "vip_injury") {
    reduction += Math.min(1.5, (staff.security || 0) * 0.3 + (staff.lifeguard || 0) * 0.15);
  } else if (disaster.id === "heatwave_emergency") {
    reduction += Math.min(1, (staff.lifeguard || 0) * 0.2);
  }
  return reduction;
}