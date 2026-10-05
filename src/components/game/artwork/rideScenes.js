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
  mega_slide_complex: ["M18 22C8 42 64 30 60 48S30 60 40 76", "M30 22C58 12 86 34 72 48S58 62 68 76", "M44 22C82 26 92 50 76 58S48 68 56 76"],
  freefall_drop: ["M40 16L43 78", "M55 16L58 78"],
};
export function getRideScene(id) {
  if (slides[id]) return { kind: "slide", paths: slides[id] };
  if (id === "lazy_river") return { kind: "river", paths: [RIVER_PATH] };
  if (["soft_play", "gem_mining"].includes(id)) return { kind: "dry", paths: [] };
  if (id === "splash_pad") return { kind: "splash", paths: [] };
  return { kind: "pool", paths: [] };
}