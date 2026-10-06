export const RIVER_PATH = "M24 31C37 18 71 20 78 36C89 60 75 78 49 76C21 77 11 52 24 31Z";
export const LAGOON_PATH = "M12 35C14 19 39 18 58 21C85 18 91 38 87 54C93 77 75 87 53 82C32 87 9 76 10 58Z";
const slides = {
  body_slide: ["M22 24C7 42 58 34 58 50S28 63 39 75", "M34 24C61 14 88 35 74 48S62 62 72 75"],
  speed_slide: ["M22 20L44 73", "M35 20L59 73", "M48 20L74 73"],
  kamikaze_slide: ["M30 14L33 43L63 77"],
  aqua_loop: ["M25 16L40 50C43 78 82 68 78 43C73 20 46 26 52 46L73 77"],
  raft_tube: ["M24 24C11 48 76 23 76 48S30 57 47 76"],
  family_raft: ["M24 24C4 44 65 33 68 47S39 59 54 76"],
  tornado_bowl: ["M24 22C20 39 74 23 75 43C76 63 44 65 48 45C53 29 74 44 63 55L63 76"],
  bowl_slide: ["M22 23C16 39 76 24 77 45C81 67 41 69 43 47C46 29 73 41 66 52L63 76"],
  water_coaster: ["M19 31Q28 8 37 39T57 40T78 71"],
  multi_racer: ["M16 24L29 75", "M29 24L43 75", "M42 24L57 75", "M55 24L71 75"],
  halfpipe: ["M21 23C11 56 54 85 81 38C70 72 50 79 43 69"],
  mega_slide_complex: ["M14 18C0 38 60 26 56 48S24 58 34 80", "M28 18C58 6 90 30 74 48S52 64 62 80", "M42 18C86 20 96 50 80 60S44 72 52 80", "M22 18C12 32 48 32 48 48S32 58 40 80"],
  freefall_drop: ["M38 12Q41 45 44 80", "M55 12Q52 45 49 80"],
  tidal_coaster: ["M16 30Q24 6 36 36T56 38T78 70", "M30 30Q42 18 50 40T72 70"],
  skybox_plunge: ["M40 12L42 50L60 80", "M58 12L56 50L38 80"],
  aqua_rocket: ["M20 70Q30 20 50 40Q80 20 75 70"],
  twister_slide: ["M18 22C5 42 45 28 38 48C30 70 72 55 75 78"],
  spiral_plunge: ["M50 14C72 14 78 38 50 40C22 40 28 62 50 62C72 62 72 80 56 80"],
  halfpipe_slide: ["M14 32C4 58 42 82 50 50C58 82 96 58 86 32"],
  conveyor_slide: ["M14 78Q30 30 50 46Q70 62 86 18"],
  cross_bowl: ["M25 22C14 48 76 48 75 78C76 48 24 48 25 22"],
  wave_rider_pro: ["M10 50Q25 30 40 50T70 50T90 50", "M10 60Q25 40 40 60T70 60T90 60"],
};
export function getRideScene(id) {
  if (slides[id]) return { kind: "slide", paths: slides[id] };
  if (id === "lazy_river" || id === "adventure_river" || id === "rapid_rafting") return { kind: "river", paths: [RIVER_PATH] };
  if (["soft_play", "gem_mining", "mini_golf", "carousel", "go_karts", "sky_walk", "ferris_wheel", "roller_coaster", "pendulum_ride", "drop_tower", "pirate_ship", "tea_cups", "bumper_cars", "swing_ride", "haunted_house", "funhouse", "observation_tower", "park_monorail", "ring_toss", "strongman_hammer", "fortune_teller", "duck_pond", "basketball_toss"].includes(id)) return { kind: "dry", paths: [] };
  if (id === "splash_pad") return { kind: "splash", paths: [] };
  if (id === "wave_rider_pro" || id === "flowrider") return { kind: "wave", paths: slides[id] || [] };
  return { kind: "pool", paths: [] };
}