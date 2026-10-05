// Ride popularity & trends engine.
// Each attraction carries a 0-100 popularity score that drifts daily based on
// queues, price, reputation, guest-type fit and age. New rides get a decaying
// "trendy" boost; older rides slowly fade. Popularity feeds back into visitor
// destination choice and ride revenue.

export const DEFAULT_POPULARITY = 60;
export const NEW_RIDE_TREND_BOOST = 30;

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

// Compact ride-class sets used for the guest-type fit bonus.
const RIDE_CLASS = {
  family: new Set([
    "kiddie_pool", "play_structure", "family_raft", "splash_pad", "soft_play",
    "lazy_river", "mini_golf", "carousel", "water_volleyball", "water_playground",
    "splash_battle", "bumper_boats", "wave_pool", "adventure_river", "water_zipline",
  ]),
  thrill: new Set([
    "speed_slide", "kamikaze", "aqua_loop", "cliff_jump", "freefall_drop",
    "mega_slide_complex", "water_coaster", "tornado_bowl", "boomerang_halfpipe",
    "surf_wave_pool", "dive_pool", "multi_racer", "flowrider", "go_karts",
    "ninja_course", "aqua_spin", "halfpipe", "aqua_ninja_course",
  ]),
  relax: new Set([
    "lazy_river", "sun_lounge", "lap_sports_pool", "mini_golf", "adventure_river",
    "dive_pool", "hot_tub", "sauna", "beach_lounging", "spa", "wave_pool",
    "float_therapy", "massage_pavilion",
  ]),
  premium: new Set([
    "surf_wave_pool", "dive_pool", "vip_lounge", "spa", "sushi_bar", "cabanas",
    "float_therapy", "massage_pavilion", "hot_tub", "sauna",
  ]),
};

function rideClassesFor(id) {
  const classes = [];
  for (const [cls, set] of Object.entries(RIDE_CLASS)) if (set.has(id)) classes.push(cls);
  return classes;
}

// How well a ride's classes line up with today's visiting guest mix.
const GUEST_CLASS_WEIGHT = {
  Family: { family: 1, thrill: -0.5, relax: 0.3, premium: -0.3 },
  Couple: { family: 0, thrill: 0.2, relax: 1, premium: 0.6 },
  "Teen group": { family: -0.3, thrill: 1, relax: -0.4, premium: 0 },
  "Thrill seeker": { family: -0.5, thrill: 1.2, relax: -0.6, premium: 0.2 },
  Tourist: { family: 0.2, thrill: 0.4, relax: 0.4, premium: 0.4, variety: 0.6 },
  "VIP guest": { family: 0, thrill: 0.2, relax: 0.6, premium: 1 },
};

function guestTypeFitBonus(attr, guestTypes, totalGuests) {
  if (!attr || attr.category !== "attraction") return 0;
  const classes = rideClassesFor(attr.id);
  if (!classes.length) return 0;
  let bonus = 0;
  for (const [type, count] of Object.entries(guestTypes || {})) {
    const share = count / Math.max(1, totalGuests);
    const weights = GUEST_CLASS_WEIGHT[type];
    if (!weights) continue;
    for (const cls of classes) bonus += (weights[cls] || 0) * share;
  }
  return bonus * 4;
}

// Popularity 0-100 -> revenue multiplier (0.7 .. 1.3).
export function popularityRevenueMult(pop) {
  return 0.7 + (clamp(pop, 0, 100) / 100) * 0.6;
}

// Popularity 0-100 -> destination selection weight (0.5 .. 1.5).
export function popularityDestinationWeight(pop) {
  return 0.5 + (clamp(pop, 0, 100) / 100) * 1.0;
}

export function popularityLabel(pop) {
  if (pop >= 85) return { label: "Viral sensation", tone: "text-fuchsia-600", dot: "bg-fuchsia-500" };
  if (pop >= 70) return { label: "Trending", tone: "text-emerald-600", dot: "bg-emerald-500" };
  if (pop >= 55) return { label: "Popular", tone: "text-sky-600", dot: "bg-sky-500" };
  if (pop >= 40) return { label: "Steady", tone: "text-slate-500", dot: "bg-slate-400" };
  if (pop >= 25) return { label: "Fading", tone: "text-amber-600", dot: "bg-amber-500" };
  return { label: "Unpopular", tone: "text-rose-600", dot: "bg-rose-500" };
}

// Daily tick. Returns updated { popularity, trendBoost } arrays.
export function tickPopularity({
  attractions,
  popularity,
  trendBoost,
  movements,
  totalVisits,
  condition,
  reputation,
  pricing,
  guestTypes,
  weather,
}) {
  const nextPop = [...(popularity || [])];
  const nextTrend = [...(trendBoost || [])];
  const ridePriceMult = pricing?.ridePriceMult || 1;
  const totalGuests = Object.values(guestTypes || {}).reduce((s, n) => s + n, 0) || 1;

  for (const p of attractions) {
    const idx = p.idx;
    let pop = nextPop[idx] ?? DEFAULT_POPULARITY;
    let trend = nextTrend[idx] ?? 0;

    // 1. Base decay — older rides slowly lose popularity.
    pop -= 1.2;

    // 2. New-ride trend boost decays; holds popularity while it lasts.
    trend = Math.max(0, trend - 2.2);
    pop += trend * 0.15;

    // 3. Visit momentum — above-average share boosts, below-average drains.
    const visits = movements?.[p.id] || 0;
    const visitShare = totalVisits > 0 ? visits / totalVisits : 0;
    pop += (visitShare - 0.1) * 25;

    // 4. Queue buzz — busy rides gain buzz, but overcrowding backfires.
    if (visitShare > 0.35) pop -= 1.5;
    else if (visitShare > 0.2) pop += 2;

    // 5. Condition — worn rides lose appeal; pristine rides hold it.
    const cond = condition?.[idx] ?? 100;
    if (cond < 40) pop -= 3;
    else if (cond < 60) pop -= 1.5;
    else if (cond >= 85) pop += 0.5;

    // 6. Reputation — a well-regarded park lifts every ride slightly.
    pop += (reputation - 50) * 0.02;

    // 7. Price — expensive rides lose popularity.
    pop -= (ridePriceMult - 1) * 12;

    // 8. Guest-type fit — rides matching today's crowd gain popularity.
    pop += guestTypeFitBonus(p.attr, guestTypes, totalGuests);

    // 9. Weather — bad weather dampens outdoor ride appeal.
    if (weather?.id === "rain" || weather?.id === "storm") pop -= 1.5;

    nextPop[idx] = clamp(pop);
    nextTrend[idx] = trend;
  }
  return { popularity: nextPop, trendBoost: nextTrend };
}