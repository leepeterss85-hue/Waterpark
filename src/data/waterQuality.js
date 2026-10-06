// Water Quality: pool chemistry management for water-based attractions.
// Quality degrades with usage and weather; needs cleaners and treatment to maintain.

export const QUALITY_THRESHOLDS = {
  excellent: { min: 85, label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-500", moodBonus: 3 },
  good: { min: 65, label: "Good", color: "text-cyan-600", bg: "bg-cyan-500", moodBonus: 1 },
  fair: { min: 40, label: "Fair", color: "text-amber-600", bg: "bg-amber-500", moodBonus: 0 },
  poor: { min: 20, label: "Poor", color: "text-orange-600", bg: "bg-orange-500", moodBonus: -2 },
  critical: { min: 0, label: "Critical", color: "text-red-600", bg: "bg-red-500", moodBonus: -5 },
};

export function getQualityLevel(value) {
  if (value >= QUALITY_THRESHOLDS.excellent.min) return "excellent";
  if (value >= QUALITY_THRESHOLDS.good.min) return "good";
  if (value >= QUALITY_THRESHOLDS.fair.min) return "fair";
  if (value >= QUALITY_THRESHOLDS.poor.min) return "poor";
  return "critical";
}

export function getQualityInfo(value) {
  const level = getQualityLevel(value);
  return QUALITY_THRESHOLDS[level];
}

// Water-based attraction IDs (pools, slides, rivers — anything with water)
const WATER_ATTRACTION_IDS = new Set([
  "body_slide", "raft_tube", "wave_pool", "lazy_river", "play_structure",
  "kiddie_pool", "speed_slide", "kamikaze_slide", "aqua_loop", "tornado_bowl",
  "family_raft", "water_coaster", "flowrider", "splash_pad", "diving_platform",
  "lap_sports_pool", "soft_play", "multi_racer", "bowl_slide", "halfpipe",
  "ninja_course", "cliff_jump", "water_zipline", "splash_battle",
  "mega_slide_complex", "freefall_drop", "aqua_spin", "surf_wave_pool",
  "adventure_river", "dive_pool", "water_volleyball", "bumper_boats",
  "water_playground", "hot_tub",
  "tidal_coaster", "skybox_plunge", "rapid_rafting", "aqua_rocket", "wave_rider_pro",
]);

export function isWaterAttraction(id) {
  return WATER_ATTRACTION_IDS.has(id);
}

// Simulate one day of water quality changes for all water attractions.
export function simulateWaterQuality({ grid, waterQuality, guests, staff, weather, hasFiltration, hasWaterTreatment }) {
  const next = [...waterQuality];
  const cleanerCount = (staff.cleaner || 0) + (staff.gardener || 0) * 0.3;
  const maintenancePower = Math.min(15, cleanerCount * 3);
  const treatmentBoost = hasWaterTreatment ? 8 : 0;
  const filtrationBoost = hasFiltration ? 4 : 0;

  let avgQuality = 0;
  let waterAttractionCount = 0;
  let criticalCount = 0;
  const occupiedTileCount = Math.max(1, grid.reduce((count, id) => count + (id ? 1 : 0), 0));

  for (let i = 0; i < grid.length; i++) {
    const id = grid[i];
    if (!id || !isWaterAttraction(id)) continue;

    waterAttractionCount++;
    let q = Number.isFinite(waterQuality[i]) ? waterQuality[i] : 100;

    // Degradation: based on guest load and weather
    const loadFactor = Math.min(2, guests / Math.max(50, occupiedTileCount * 20));
    let degradation = 2 + loadFactor * 3;
    if (weather.id === "storm") degradation += 4;
    else if (weather.id === "rain") degradation += 2;
    if (weather.id === "sunny") degradation += 1; // more swimmers = faster degradation

    // Recovery: cleaners, filtration, treatment facility
    const recovery = maintenancePower + treatmentBoost + filtrationBoost;

    q = q - degradation + recovery;
    q = Math.max(0, Math.min(100, Math.round(q)));

    next[i] = q;
    avgQuality += q;
    if (q < QUALITY_THRESHOLDS.poor.min) criticalCount++;
  }

  avgQuality = waterAttractionCount > 0 ? avgQuality / waterAttractionCount : 100;

  // Overall effects on the park
  const moodPenalty = criticalCount * 2;
  const reputationRisk = criticalCount > 2 ? criticalCount - 2 : 0;

  return {
    nextQuality: next,
    avgQuality: Math.round(avgQuality),
    waterAttractionCount,
    criticalCount,
    moodPenalty,
    reputationRisk,
  };
}

export function createInitialWaterQuality(gridSize) {
  return Array(gridSize).fill(100);
}