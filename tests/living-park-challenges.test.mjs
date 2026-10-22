import test from "node:test";
import assert from "node:assert/strict";
import {TIMED_CHALLENGES, startTimedChallenge, evaluateTimedChallenge, sanitiseTimedChallenges} from "../src/data/timedChallenges.js";
import {STORY_CONTRACTS, contractProgress, availableStoryContracts} from "../src/data/storyContracts.js";
import {getHotelDef, hotelAmenities, hotelRooms} from "../src/data/hotels.js";
import {buildSavePayload} from "../src/lib/savePayload.js";
const def=id=>TIMED_CHALLENGES.find(c=>c.id===id);
test("sprint counts only new upgrades and allows completion on final day",()=>{
 const c=def("quick_upgrades");const run=startTimedChallenge(c,{day:10,totalUpgrades:8});
 assert.equal(evaluateTimedChallenge(c,run,{day:10,totalUpgrades:8}).progress,0);
 assert.equal(evaluateTimedChallenge(c,run,{day:15,totalUpgrades:11}).status,"complete");
 assert.equal(evaluateTimedChallenge(c,run,{day:16,totalUpgrades:11}).status,"expired");
 assert.equal(evaluateTimedChallenge(c,run,{day:15,totalUpgrades:10}).status,"expired");
});
test("pause does not consume days, terminal runs remain terminal",()=>{
 const c=def("cash_dash");const run=startTimedChallenge(c,{day:4,lifetimeEarnings:20000});
 assert.strictEqual(evaluateTimedChallenge(c,run,{day:4,lifetimeEarnings:20000}),run);
 const complete=evaluateTimedChallenge(c,run,{day:6,lifetimeEarnings:35000});
 assert.equal(complete.status,"complete");
 assert.strictEqual(evaluateTimedChallenge(c,complete,{day:99,lifetimeEarnings:20000}),complete);
 const claimed={...complete,status:"claimed"};
 assert.strictEqual(evaluateTimedChallenge(c,claimed,{day:100}),claimed);
});
test("guest rush excludes old visitor totals and retry resets the baseline",()=>{
 const c=def("weekend_rush");const run=startTimedChallenge(c,{day:10,guests:300});
 assert.equal(evaluateTimedChallenge(c,run,{day:10,guests:300}).progress,0);
 assert.equal(evaluateTimedChallenge(c,run,{day:11,guests:160}).status,"complete");
 const retry=startTimedChallenge(def("quick_upgrades"),{day:20,totalUpgrades:12});
 assert.equal(retry.baseline,12);assert.equal(retry.deadline,25);
});
test("save roundtrip preserves deadlines and claims; legacy saves default safely",()=>{
 const runs={cash_dash:{...startTimedChallenge(def("cash_dash"),{day:20,lifetimeEarnings:100}),status:"claimed"}};
 assert.deepEqual(sanitiseTimedChallenges(JSON.parse(JSON.stringify(buildSavePayload({timedChallenges:runs}))).timedChallenges),runs);
 assert.deepEqual(sanitiseTimedChallenges(undefined),{});
 assert.deepEqual(sanitiseTimedChallenges({cash_dash:{status:"active"}}),{});
});
test("party and heatwave goals require the actual park event",()=>{
 const party=def("pool_party");const run=startTimedChallenge(party,{day:1});
 assert.equal(evaluateTimedChallenge(party,run,{day:2,activeEvents:[{id:"evening_pool_party"}]}).status,"complete");
 const hot=def("heatwave_hero"), heat=startTimedChallenge(hot,{day:1});
 assert.equal(evaluateTimedChallenge(hot,heat,{day:2,visitorStats:{avgMood:95}}).progress,0);
 assert.equal(evaluateTimedChallenge(hot,heat,{day:2,seasonEvent:{id:"heatwave"},visitorStats:{avgMood:85}}).status,"complete");
});
test("Maya Family Bay requires zoned attractions and upgrades; stages unlock in order",()=>{
 const game={grid:["wave_pool","lazy_river","body_slide","bench"],parkZones:["family","family","family","family"],attractionIds:["wave_pool","lazy_river","body_slide"],upgrades:[1,1,1,0],STORY_STEPS:[{chapter:4}],storyStep:0};
 assert.equal(contractProgress(STORY_CONTRACTS.find(c=>c.id==="maya_family_bay"),game).current,3);
 assert.equal(contractProgress(STORY_CONTRACTS.find(c=>c.id==="maya_bay_upgrade"),game).complete,true);
 assert.equal(availableStoryContracts(game).find(c=>c.id==="maya_bay_upgrade").locked,true);
 game.claimedStoryContracts=["maya_family_bay"];
 assert.equal(availableStoryContracts(game).find(c=>c.id==="maya_bay_upgrade").locked,false);
});
test("budget hotel grows into restaurant and luxury pool without removing amenities",()=>{
 const h=getHotelDef("budget_inn");
 assert.ok(!hotelAmenities(h,2).includes("restaurant"));
 assert.ok(hotelAmenities(h,3).includes("restaurant"));
 assert.ok(hotelAmenities(h,6).includes("luxury_pool"));
 assert.ok(hotelRooms(h,6)>hotelRooms(h,3));
 for(let level=0;level<10;level++) for(const amenity of hotelAmenities(h,level)) assert.ok(hotelAmenities(h,level+1).includes(amenity));
 assert.equal(contractProgress(STORY_CONTRACTS.find(c=>c.id==="maya_bay_holiday"),{grid:["budget_inn"],upgrades:[3]}).complete,true);
});
