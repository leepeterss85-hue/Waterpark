import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rideFocusFor, rideFocusBonuses, parkRideFocusEffects } from "../src/data/rideSpecialties.js";
import { STORY_CONTRACTS, contractProgress, availableStoryContracts } from "../src/data/storyContracts.js";
import { parkGuestReaction } from "../src/data/guestReactions.js";
import { SAVE_FIELDS } from "../src/lib/savePayload.js";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("ride focus only applies to its own tile and original attraction", () => {
  const perks = { 6: { attractionId: "wave_pool", focus: "capacity" }, 7: { attractionId: "other_ride", focus: "unknown" } };
  assert.equal(rideFocusFor(perks, 6, "wave_pool"), "capacity");
  assert.equal(rideFocusFor(perks, 6, "lazy_river"), null);
  assert.equal(rideFocusFor(perks, 7, "other_ride"), null);
  assert.equal(rideFocusFor({}, 3, "wave_pool"), null);
  assert.equal(rideFocusBonuses("capacity", 3).extraCapacity, .24);
  assert.equal(rideFocusBonuses("revenue", 2).extraRevenue, .11);
  assert.equal(rideFocusBonuses("comfort", 20).extraMood, 6);
  assert.equal(rideFocusBonuses(null, 4).extraMood, 0);
});

test("ride focus contributes weighted earnings and happiness without modifying input", () => {
  const attractions = [
    { idx: 1, id: "wave_pool", level: 2, attr: { category: "attraction", capacity: 100 } },
    { idx: 2, id: "lazy_river", level: 4, attr: { category: "attraction", capacity: 100 } },
  ];
  const snapshot = JSON.stringify(attractions);
  const effects = parkRideFocusEffects(attractions, {
    1: { attractionId: "wave_pool", focus: "revenue" },
    2: { attractionId: "lazy_river", focus: "comfort" },
  });
  assert.ok(effects.incomeMult > 1.05 && effects.incomeMult < 1.06);
  assert.equal(effects.moodBoost, 1.3);
  assert.equal(JSON.stringify(attractions), snapshot);
  assert.deepEqual(parkRideFocusEffects([], {}), { incomeMult: 1, moodBoost: 0 });
});

test("Story Mode bonus contracts are separate from canonical chapter progression", () => {
  const contracts = STORY_CONTRACTS;
  assert.ok(contracts.length >= 5);
  assert.equal(new Set(contracts.map(c => c.id)).size, contracts.length);
  const game = {
    gameMode: "story", storyStep: 0, STORY_STEPS: [{chapter: 1}],
    missionState: { attractionCount: 3 }, totalUpgrades: 3,
    visitorStats: { avgMood: 84 }, visitorReviews: [{},{}],
    membershipCounts: { vip_membership: 4 }, claimedStoryContracts: ["splash_starter"],
  };
  let available = availableStoryContracts(game);
  assert.equal(available.length, 1);
  assert.equal(available[0].claimed, true);
  assert.equal(contractProgress(contracts[0], game).complete, true);
  assert.equal(contractProgress(contracts.find(c=>c.id==="guest_voice"), game).complete, false);
  game.STORY_STEPS = [{chapter:13}];
  available = availableStoryContracts(game);
  assert.equal(available.length, contracts.filter(c=>!c.requiresStoryComplete).length);
  assert.equal(available.find(c=>c.id==="happy_guests").percent, 100);
  game.storyCompleted = true;
  available = availableStoryContracts(game);
  assert.equal(available.length, contracts.length);
  assert.ok(available.some(c=>c.id==="legacy_smiles"));
});

test("guest reactions come from measured conditions and do not fabricate reactions in an empty park", () => {
  assert.equal(parkGuestReaction({ guests:0, avgMood:95 }), null);
  assert.equal(parkGuestReaction({guests:30, avgMood:90}).tone, "delighted");
  assert.equal(parkGuestReaction({guests:30, avgMood:80, longestQueue:{wait:23}}).reason, "Queue waiting time");
  assert.equal(parkGuestReaction({guests:30, avgMood:80, waterQuality:20}).reason, "Water quality");
  assert.equal(parkGuestReaction({guests:30, avgMood:80, incidents:2}).reason, "Ride disruption");
});

test("new progress and ride focuses survive local and cloud slots, and gameplay UI is wired", () => {
  assert.ok(SAVE_FIELDS.includes("rideSpecialties"));
  assert.ok(SAVE_FIELDS.includes("claimedStoryContracts"));
  const hook = read("src/hooks/useGameState.js");
  const runDay = read("src/hooks/runDay.js");
  const home = read("src/pages/Home.jsx");
  const ride = read("src/components/game/TileDetail.jsx");
  const mode = read("src/components/game/GameModePanel.jsx");
  const map = read("src/components/game/GuestLayer.jsx");
  assert.match(hook, /setRideSpecialties\(data\.rideSpecialties/);
  assert.match(hook, /claimedContractRef\.current\.add\(contractId\)/);
  assert.match(hook, /setRideSpecialties\(\{\}\); setClaimedStoryContracts\(\[\]\)/);
  assert.match(hook, /rideSpecialties, claimedStoryContracts/);
  assert.match(home, /rideFocus=\{rideFocusFor\(/);
  assert.match(ride, /Choose this upgrade's focus/);
  assert.match(mode, /<StoryContractsPanel game=\{game\}\/>/);
  assert.match(map, /guest-reaction-bubble/);
  assert.match(runDay, /rideFocusEffects\.moodBoost/);
  assert.match(runDay, /rideFocusEffects\.incomeMult/);
  assert.match(runDay, /enhancedAttractions/);
  // Guards against the pre-existing TDZ error: counts must be defined before zoo day.
  assert.ok(runDay.indexOf("const counts = currentStaff || {};") < runDay.indexOf("simulateZooDay("));
});
