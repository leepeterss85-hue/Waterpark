import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { buildSavePayload, SAVE_FIELDS } from "../src/lib/savePayload.js";

const hook = readFileSync(new URL("../src/hooks/useGameState.js", import.meta.url), "utf8");
function callback(name, next, context) {
  const source = hook.slice(hook.indexOf("  const " + name + " = useCallback"), hook.indexOf("  const " + next + " = useCallback"));
  return vm.runInNewContext(source + "\n" + name, {useCallback: fn => fn, ...context});
}
test("all persistent game state, including zoo care, survives the shared save payload", () => {
  const fields = hook.match(/stateRef.current = \{([^}]+)\};/)[1].split(",").map(x => x.trim());
  assert.deepEqual(fields.filter(field => !SAVE_FIELDS.includes(field)), []);
  const state = {zooAnimals: {3: {population: 5, health: 75, keepersAssigned: 2, breeding: false, habitatFeatures:["shade"], feedingSchedule:"premium"}},
    hotelGuests: [{name:"Guest"}], storyStep: 7, timedChallenges: {challenge: {status:"active"}}};
  assert.deepEqual(JSON.parse(JSON.stringify(buildSavePayload(state))), state);
});
test("local save failure cannot add a phantom save or success analytics", () => {
  const calls = [];
  const save = callback("savePark", "saveToCloud", {
    readSlots: () => ({}), writeSlots: () => false,
    stateRef: {current:{money:100,zooAnimals:{}}}, buildSavePayload,
    setSaves: value => calls.push(value), trackEvent: value => calls.push(value),
  });
  assert.equal(save("My park"), false);
  assert.equal(calls.length, 0);
});
test("failed deletion keeps the displayed save intact", () => {
  let changed = false;
  const remove = callback("deleteSave", "sendGameAlert", {
    readSlots: () => ({park: {money:100}}), writeSlots: () => false,
    setSaves: () => {changed = true;},
  });
  assert.equal(remove("park"), false);
  assert.equal(changed, false);
});
test("cloud save requires backend acknowledgement", async () => {
  let response = {data:{ok:false}};
  let tracked = 0;
  const save = callback("saveToCloud", "applyGameData", {
    stateRef:{current:{zooAnimals:{}}}, buildSavePayload, day:1,money:100,reputation:50,guests:0,
    base44:{functions:{invoke:async () => response}}, trackEvent: () => tracked++,
  });
  assert.equal(await save("Zoo"), false);
  assert.equal(tracked, 0);
  response = {data:{ok:true}};
  assert.equal(await save("Zoo"), true);
  assert.equal(tracked, 1);
});
test("loading another park restores its zoo and clears animals for legacy parks", () => {
  const values = {};
  const setters = Object.fromEntries([...hook.matchAll(/\b(set[A-Z]\w*)\(/g)].map(m => [m[1], v => {values[m[1]]=v;}]));
  const load = callback("applyGameData", "loadPark", {
    ...setters, INITIAL_MONEY:50000, DEFAULT_STAFF:{}, DEFAULT_PRICING:{}, DEFAULT_PARK_STRATEGY:{},
    makeStartingGrid:()=>[null], normaliseTileRotations:()=>[0], normalizeArrayLength:(v,n,fill)=>v||Array(n).fill(fill),
    calculateParkAppeal:()=>({}), getParkItem:()=>null, createCompetitors:()=>[],rollDailyChallenges:()=>[],
    calculateMasterPlanBonuses:()=>({}), STORY_CONTRACTS:[], timedRef:{current:{}}, claimedContractRef:{current:new Set()},
    sanitiseTimedChallenges:()=>({}),safeNumber:(v,f)=>Number.isFinite(v)?v:f,
  });
  const zoo = {2:{population:6,keepersAssigned:1,habitatFeatures:["shade"]}};
  load({zooAnimals:zoo});
  assert.equal(values.setZooAnimals, zoo);
  load({});
  assert.equal(Object.keys(values.setZooAnimals).length, 0);
});
