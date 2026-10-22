import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { build } from "esbuild";

// Base44 source uses the Vite @ alias, so bundle the pure objective helper
// exactly as the app would rather than asking Node to resolve Vite aliases.
const compiled = await build({
  entryPoints: ["src/data/storyObjectives.js"],
  bundle: true, write: false, format: "esm", platform: "node",
  alias: { "@": "./src" }, logLevel: "silent",
});
const moduleUrl = "data:text/javascript;base64," +
  Buffer.from(compiled.outputFiles[0].text).toString("base64");
const { storyObjectiveProgress } = await import(moduleUrl);

const step = id => ({ id, title: id, chapter: 1 });
const game = overrides => ({
  grid: [], staff: {}, day: 1, completedResearch: [], parkAppeal: { score: 50 },
  reputation: 50, peakGuests: 0, totalUpgrades: 0, expansionsDone: 0,
  ...overrides,
});

test("Maya's progress starts at zero and tracks meaningful starter targets", () => {
  assert.equal(storyObjectiveProgress(step("welcome"), game()).percent, 0);
  assert.equal(storyObjectiveProgress(step("staff"), game({ staff: { lifeguard: 1 } })).satisfied, true);
  assert.equal(storyObjectiveProgress(step("open"), game({ day: 2 })).satisfied, true);
  const guests = storyObjectiveProgress(step("guests"), game({ peakGuests: 62 }));
  assert.equal(guests.percent, 62);
  assert.equal(guests.milestones[0].target, 100);
});

test("alternative objectives complete if either route succeeds; percentage uses best route", () => {
  const expanded = storyObjectiveProgress(step("expand"), game({ expansionsDone: 1 }));
  assert.equal(expanded.satisfied, true);
  assert.equal(expanded.percent, 100);
  assert.equal(expanded.alternative, true);
  const rival = storyObjectiveProgress(step("rival"), game({ peakGuests: 100, marketShare: 30 }));
  assert.equal(rival.percent, 50);
  assert.equal(rival.satisfied, false);
});

test("world-class and legend chapters need ALL required milestones", () => {
  const almost = storyObjectiveProgress(step("worldclass"), game({
    parkAppeal: { score: 80 }, reputation: 70,
  }));
  assert.equal(almost.satisfied, false);
  assert.ok(almost.percent < 100);
  assert.equal(storyObjectiveProgress(step("worldclass"), game({
    parkAppeal: { score: 80 }, reputation: 80,
  })).satisfied, true);
  const ending = storyObjectiveProgress(step("finish"), game({
    level: 35, lifetimeEarnings: 3000000, mastery: { points: 12 },
    acquiredRivals: [],
  }));
  assert.equal(ending.satisfied, false);
  assert.equal(storyObjectiveProgress(step("finish"), game({
    level: 35, lifetimeEarnings: 3000000, mastery: { points: 12 },
    acquiredRivals: ["park-2"],
  })).satisfied, true);
});

test("water standards require at least one real water attraction, not empty-park 100%", () => {
  const empty = storyObjectiveProgress(step("crystal_water"), game());
  assert.equal(empty.satisfied, false);
  const full = storyObjectiveProgress(step("crystal_water"), game({
    grid: ["body_slide"], waterQuality: [89],
  }));
  assert.equal(full.satisfied, true);
});

test("the new Story Coach is mounted inside the game board rather than blocking mobile menus", () => {
  const home = readFileSync(new URL("../src/pages/Home.jsx", import.meta.url), "utf8");
  const menu = readFileSync(new URL("../src/components/game/GameMenuSheets.jsx", import.meta.url), "utf8");
  const coach = readFileSync(new URL("../src/components/game/StoryCoach.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/components/game/parkChrome.css", import.meta.url), "utf8");
  assert.match(home, /<StoryCoach game=\{game\} setOpenSheet=\{handleOpenMenu\} \/>/);
  assert.doesNotMatch(menu, /<StoryCoach/);
  assert.doesNotMatch(coach, /fixed inset-x-0 bottom/);
  assert.match(coach, /storyObjectiveProgress\(step, game\)/);
  assert.match(coach, /aria-expanded=\{expanded\}/);
  assert.match(css, /\.aquatic-map \.story-coach-inline/);
});
