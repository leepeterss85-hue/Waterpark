import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getDecorativeScenery, SCENERY_TYPES } from "../src/lib/parkScenery.js";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("illustrated park scenery is deterministic, bounded and cosmetic", () => {
  assert.equal(getDecorativeScenery(-1), null);
  assert.equal(getDecorativeScenery(1.2), null);
  assert.equal(getDecorativeScenery("8"), null);
  const a = Array.from({length: 160}, (_, i) => getDecorativeScenery(i));
  const b = Array.from({length: 160}, (_, i) => getDecorativeScenery(i));
  assert.deepEqual(a, b);
  assert.ok(a.filter(Boolean).length >= 25);
  assert.ok(a.filter(Boolean).length <= 80);
  assert.ok(new Set(a.filter(Boolean)).size >= 5);
  assert.ok(a.every(type => type === null || SCENERY_TYPES.includes(type)));
});

test("scenery never replaces built attractions, eats taps or hides plot previews", () => {
  const layer = read("src/components/game/ParkSceneryLayer.jsx");
  const artwork = read("src/components/game/SceneryArtwork.jsx");
  const css = read("src/components/game/sceneryUpgrade.css");
  assert.match(layer, /if \(value\) return <span key=\{index\} \/>/);
  assert.match(layer, /data-building=\{Boolean\(selectedBuild\)\}/);
  assert.match(css, /park-scenery-layer \{ pointer-events:none; \}/);
  assert.match(css, /data-building="true"/);
  assert.match(artwork, /viewBox="0 0 100 100"/);
  assert.doesNotMatch(layer + artwork, /Math\.random/);
});

test("richer water and slides remain clipped and offer low-motion fallbacks", () => {
  const water = read("src/components/game/artwork/PoolWaterSurface.jsx");
  const waterCss = read("src/components/game/poolWater.css");
  const slides = read("src/components/game/artwork/SlideStructure.jsx");
  const css = read("src/components/game/resortFinish.css");
  assert.ok(water.indexOf('clipPath={`url(#${id}-clip)`}') < water.indexOf('className="water-surface-highlights"'));
  assert.match(waterCss, /\.water-halo-ring/);
  assert.match(waterCss, /prefers-reduced-motion:reduce/);
  assert.ok(slides.indexOf('className="ride-slide-crossbrace"') < slides.indexOf("paths.map"));
  for (const className of ["ride-slide-channel", "ride-slide-edge-shimmer", "ride-landing-foam", "ride-landing-spray"]) {
    assert.match(slides, new RegExp(className));
    assert.match(css, new RegExp("\\." + className));
  }
  assert.match(css, /data-graphics="balanced"/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test("guest accessories are cosmetic and reuse existing person sprite", () => {
  const sprite = read("src/components/game/PersonSprite.jsx");
  const css = read("src/components/game/parkPeople.css");
  for (const key of ["person-swim-gear", "person-sun-visor", "person-snack", "person-lifeguard-whistle"]) {
    assert.match(sprite, new RegExp(key));
    assert.match(css, new RegExp(key));
  }
  assert.doesNotMatch(sprite, /setInterval|setTimeout|Math\.random/);
});
