import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getSettings, getGraphicsQuality, setGraphicsQuality,
  GRAPHICS_PRESETS, normaliseGraphicsQuality,
} from "../src/lib/settings.js";

const source = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("new games use maximum Ultra graphics, not boosted gameplay difficulty", () => {
  const oldWindow = globalThis.window;
  globalThis.window = undefined;
  try {
    assert.equal(getGraphicsQuality(), "ultra");
    assert.equal(getSettings().difficulty, "normal");
    assert.deepEqual(GRAPHICS_PRESETS.map(item => item.id), ["ultra", "rich", "balanced"]);
    assert.equal(normaliseGraphicsQuality("invalid"), "ultra");
  } finally {
    globalThis.window = oldWindow;
  }
});

test("saved previous Balanced/High graphics preferences survive migration", () => {
  const oldWindow = globalThis.window;
  const oldStorage = globalThis.localStorage;
  const store = new Map();
  globalThis.window = {};
  globalThis.localStorage = {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  };
  try {
    assert.equal(getGraphicsQuality(), "ultra");
    store.set("aqua-graphics", "balanced");
    assert.equal(getGraphicsQuality(), "balanced");
    store.set("aqua-graphics", "rich");
    assert.equal(getGraphicsQuality(), "rich");
    assert.equal(setGraphicsQuality("ultra"), "ultra");
    assert.equal(getGraphicsQuality(), "ultra");
    assert.equal(JSON.parse(store.get("splash-settings")).graphicsQuality, "ultra");
    assert.equal(setGraphicsQuality("balanced"), "balanced");
    assert.equal(getGraphicsQuality(), "balanced");
    assert.equal(setGraphicsQuality("unknown"), "ultra");
    assert.equal(getSettings().graphicsQuality, "ultra");
  } finally {
    globalThis.window = oldWindow;
    globalThis.localStorage = oldStorage;
  }
});

test("main park screen exposes graphics and settings without navigating via More", () => {
  const home = source("src/pages/Home.jsx");
  const map = source("src/components/game/ParkGrid.jsx");
  const menus = source("src/components/game/GameMenuSheets.jsx");
  const panel = source("src/components/game/SettingsPanel.jsx");
  assert.match(home, /const \[graphicsQuality, setGraphicsQualityState\] = useState\(getGraphicsQuality\)/);
  assert.match(home, /onOpenSettings=\{\(\) => handleOpenMenu\("settings"\)\}/);
  assert.match(map, /aria-label="Open park settings"/);
  assert.match(map, /data-graphics=\{graphics\}/);
  assert.match(map, /Graphics quality: \$\{graphicsLabel\}/);
  assert.match(menus, /onGraphicsQualityChange=\{onGraphicsQualityChange\}/);
  assert.match(panel, /GRAPHICS_PRESETS\.map/);
  assert.match(panel, /aria-pressed=\{graphicsQuality === preset\.id\}/);
});

test("Ultra graphical styling is deliberate; performance and accessibility remain supported", () => {
  const css = source("src/components/game/resortFinish.css");
  assert.match(css, /\[data-graphics="ultra"\] \.pool-water-surface/);
  assert.match(css, /\[data-graphics="balanced"\] \.game-map-surface \*/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.resort-top-settings/);
});
