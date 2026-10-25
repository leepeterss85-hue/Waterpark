// Deterministic guest route preferences for the *visual* park population.
// The simulation in visitorLogic.js remains authoritative for earnings,
// demand, happiness and queues. This keeps saves and game balance unchanged.
export const WALKER_PROFILES = Object.freeze([
  { type: "Family", label: "Family outing", badge: "👨‍👩‍👧", ride: ["kiddie_pool","splash_pad","play_structure","water_playground","wave_pool","family_raft","lazy_river"], food: ["dining","pizza_stand","burger_shack","ice_cream","concessions"], rest: ["bench","cabanas","sun_lounge"] },
  { type: "Teen group", label: "Thrill crew", badge: "⚡", ride: ["speed_slide","body_slide","kamikaze_slide","aqua_loop","water_coaster","freefall_drop","multi_racer","ninja_course","tornado_bowl"], food: ["burger_shack","pizza_stand","ice_cream","concessions"], rest: ["sun_lounge","bench"] },
  { type: "Thrill seeker", label: "Adrenaline fan", badge: "🎢", ride: ["freefall_drop","speed_slide","cliff_jump","water_coaster","tornado_bowl","aqua_loop","kamikaze_slide","multi_racer"], food: ["burger_shack","juice_bar","dining"], rest: ["sun_lounge","bench"] },
  { type: "Tourist", label: "Park explorer", badge: "📷", ride: ["adventure_river","wave_pool","lazy_river","family_raft","flowrider","surf_wave_pool"], food: ["dining","sushi_bar","beach_bar","coffee_bar"], rest: ["beach_lounging","cabanas","sun_lounge"] },
  { type: "VIP guest", label: "VIP experience", badge: "★", ride: ["surf_wave_pool","hot_tub","flowrider","wave_pool","lazy_river","dive_pool"], food: ["sushi_bar","beach_bar","coffee_bar","dining"], rest: ["cabanas","spa","sauna","sun_lounge"] },
  { type: "Couple", label: "Relaxed day out", badge: "☀", ride: ["lazy_river","hot_tub","wave_pool","adventure_river","lap_sports_pool"], food: ["coffee_bar","beach_bar","sushi_bar","dining"], rest: ["spa","sauna","cabanas","sun_lounge","beach_lounging"] },
]);

export function walkerProfile(index) {
  return WALKER_PROFILES[Math.abs(Math.floor(Number(index) || 0)) % WALKER_PROFILES.length];
}
export function preferredStops(candidates = [], profile, category) {
  if (!Array.isArray(candidates) || !candidates.length || !profile) return candidates;
  const favourites = profile[category] || [];
  const matched = candidates.filter(candidate => favourites.includes(candidate?.id));
  // When guests can't find their preferred attraction they try what's available.
  // Never send a walker to a missing ride or prevent them reaching a destination.
  return matched.length ? matched : candidates;
}
