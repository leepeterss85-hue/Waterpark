import test from "node:test";
import assert from "node:assert/strict";
import { getOperationsBrief } from "../src/data/operationsBrief.js";
import { TIMED_CHALLENGES, startTimedChallenge, evaluateTimedChallenge, sanitiseTimedChallenges } from "../src/data/timedChallenges.js";

const definition = id => TIMED_CHALLENGES.find(item => item.id === id);

test("read-only preflight flags missing rides and does not alter the game", () => {
  const game = { day: 1, grid: [null, null], staff: {}, money: 5000, safety: .7, uptime: .65, cleanliness: .6 };
  const original = JSON.stringify(game);
  const brief = getOperationsBrief(game);
  assert.ok(brief.score >= 0 && brief.score <= 100);
  assert.ok(brief.priorities.some(p => p.id === "build" && p.sheet === "build"));
  assert.equal(JSON.stringify(game), original);
});

test("next day briefing scales staff percentages and does not show blank guest data", () => {
  const result = getOperationsBrief({day: 1, grid: ["body_slide"], guests: 0, staff: { lifeguard: 1 },
    safety: .95, uptime: .9, cleanliness: .9, waterQualityAvg: 100, parkAppeal: {score: 95}});
  assert.equal(result.metrics.find(metric => metric.id === "safety").value, 95);
  assert.equal(result.metrics.some(metric => metric.id === "mood"), false);
  assert.ok(result.score > 80);
});

test("briefing prioritises current emergencies and water quality", () => {
  const result = getOperationsBrief({day: 3, grid: ["wave_pool"], staff: {lifeguard: 1},
    waterQualityAvg: 35, waterQualityCriticalCount: 1,
    incidents: [{tileIndex: 0}], emergencies: [{status: "open"}]});
  assert.equal(result.priorities[0].id, "incidents");
  assert.equal(result.priorities[1].id, "water");
});

test("new medal chains have sensible, reachable thresholds", () => {
  for(const base of ["guest_delight", "crystal_clear"]) {
    const thresholds = [base, base+"_silver", base+"_gold"].map(id=>definition(id).target);
    assert.ok(thresholds[0]<thresholds[1] && thresholds[1]<thresholds[2]);
    assert.ok(thresholds[2]<=100);
  }
});

test("Guest Delight uses a later operating day, and not pre-acceptance mood", () => {
  const def = definition("guest_delight");
  const game = { day: 10, guests: 200, visitorStats: {avgMood: 91}};
  const run = startTimedChallenge(def, game);
  assert.equal(evaluateTimedChallenge(def,run,game).progress, 0);
  assert.equal(evaluateTimedChallenge(def,run,{...game,day: 11,visitorStats:{avgMood: 72}}).status,"complete");
  assert.equal(evaluateTimedChallenge(def,run,{...game,day: 11,guests:0}).status,"active");
});

test("Crystal Clear only counts real water attractions on a later day", () => {
  const def = definition("crystal_clear");
  const game = {day: 4,grid:["wave_pool","body_slide",null],waterQuality:[90,90,100]};
  const run = startTimedChallenge(def,game);
  assert.equal(evaluateTimedChallenge(def,run,game).status,"active");
  assert.equal(evaluateTimedChallenge(def,run,{...game,day:5,waterQuality:[80,80,100]}).status,"complete");
  assert.equal(evaluateTimedChallenge(def,run,{...game,day:5,grid:[null,null],waterQuality:[100,100]}).status,"active");
  assert.equal(sanitiseTimedChallenges({crystal_clear:run}).crystal_clear.status,"active");
});
