import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculateParkFitZoom } from "../src/lib/parkCamera.js";

const read = relative => readFileSync(new URL("../" + relative, import.meta.url), "utf8");

test("camera fits a 704px park into a narrow Android viewport", () => {
  assert.equal(calculateParkFitZoom(360, 704), 0.49);
  assert.equal(calculateParkFitZoom(430, 704), 0.59);
  assert.equal(calculateParkFitZoom(900, 704), 1.25);
});
test("camera avoids invalid sizes and respects min/max magnification", () => {
  assert.equal(calculateParkFitZoom(0, 704), 1);
  assert.equal(calculateParkFitZoom(360, 0), 1);
  assert.equal(calculateParkFitZoom(NaN, 704), 1);
  assert.equal(calculateParkFitZoom(100, 704), 0.35);
  assert.equal(calculateParkFitZoom(5000, 704), 2.5);
  assert.equal(calculateParkFitZoom(430, 704, 0.6, 2.5), 0.6);
});
test("map camera controls expose Fit, reset and a touch jitter threshold", () => {
  const hook = read("src/hooks/useTouchZoom.js");
  const map = read("src/components/game/ParkGrid.jsx");
  assert.match(hook, /const fitToWidth = useCallback/);
  assert.match(hook, /return \{ zoom, setZoom, panX, panY, resetView, fitToWidth, containerRef \}/);
  assert.match(hook, /Math\.hypot\(dx, dy\) < 8/);
  assert.match(map, /aria-label="Fit park to screen"/);
  assert.match(map, /useTouchZoom\(1, 0\.35, 2\.5\)/);
});
test("build catalogue returns to the park immediately and offers an accessible cancel and change", () => {
  const menu = read("src/components/game/GameMenuSheets.jsx");
  const map = read("src/components/game/ParkGrid.jsx");
  const home = read("src/pages/Home.jsx");
  assert.match(menu, /game\.setSelectedBuild\(id\); if \(id\) close\(\)/);
  assert.match(map, /park-placement-tray/);
  assert.match(map, /aria-label="Choose a different item"/);
  assert.match(map, /aria-label="Cancel placement"/);
  assert.match(home, /onCancelBuild=\{\(\) => game\.setSelectedBuild\(null\)\}/);
  assert.match(home, /onChangeBuild=\{\(\) => handleOpenMenu\("build"\)\}/);
});
test("new resort sunbeams stay clipped to water and respect reduced motion and balanced performance", () => {
  const water = read("src/components/game/artwork/PoolWaterSurface.jsx");
  const css = read("src/components/game/resortFinish.css");
  assert.match(water, /className="water-sun-sweep"/);
  assert.ok(water.indexOf('clipPath={`url(#${id}-clip)`}') < water.indexOf("water-sun-sweep"));
  assert.match(css, /\[data-graphics="balanced"\] \.water-sun-sweep \{ display:none !important; \}/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
