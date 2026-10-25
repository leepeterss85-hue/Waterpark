import test from "node:test";
import assert from "node:assert/strict";
import {TIMED_CHALLENGES,canStartTimedChallenge,sanitiseTimedChallenges,startTimedChallenge,evaluateTimedChallenge} from "../src/data/timedChallenges.js";
import {guestJourney} from "../src/data/guestJourney.js";
import {STORY_CONTRACTS,contractProgress,availableStoryContracts} from "../src/data/storyContracts.js";
test("all challenges have sequential bronze silver gold medals and increasing rewards",()=>{
 assert.equal(TIMED_CHALLENGES.length % 3, 0);
 assert.equal(new Set(TIMED_CHALLENGES.map(c=>c.id)).size,TIMED_CHALLENGES.length);
 for(const bronze of TIMED_CHALLENGES.filter(c=>c.medal==="bronze")){
  const silver=TIMED_CHALLENGES.find(c=>c.id===bronze.id+"_silver");
  const gold=TIMED_CHALLENGES.find(c=>c.id===bronze.id+"_gold");
  assert.equal(canStartTimedChallenge(silver,{}),false);
  const runs={[bronze.id]:{status:"claimed"}};
  assert.equal(canStartTimedChallenge(silver,runs),true);
  assert.equal(canStartTimedChallenge(gold,runs),false);
  runs[silver.id]={status:"claimed"};
  assert.equal(canStartTimedChallenge(gold,runs),true);
  assert.ok(gold.reward.money>silver.reward.money && silver.reward.money>bronze.reward.money);
 }
});
test("legacy claimed runs remain bronze medals after save migration",()=>{
 const def=TIMED_CHALLENGES[0];
 const run={...startTimedChallenge(def,{day:4,totalUpgrades:0}),status:"claimed"};
 const migrated=sanitiseTimedChallenges({[def.id]:run});
 assert.equal(migrated[def.id].status,"claimed");
 assert.ok(canStartTimedChallenge(TIMED_CHALLENGES[1],migrated));
});
test("active or paid medal cannot start twice and active party cannot earn another medal",()=>{
 const def=TIMED_CHALLENGES.find(c=>c.id==="pool_party");
 assert.equal(canStartTimedChallenge(def,{}, {activeEvents:[{id:"evening_pool_party"}]}),false);
 assert.equal(canStartTimedChallenge(def,{cash_dash:{status:"active"}}),false);
 assert.equal(canStartTimedChallenge(def,{pool_party:{status:"claimed"}}),false);
 const gold=TIMED_CHALLENGES.find(c=>c.id==="quick_upgrades_gold");
 const run=startTimedChallenge(gold,{day:1,totalUpgrades:0});
 assert.equal(evaluateTimedChallenge(gold,run,{day:6,totalUpgrades:5}).status,"expired");
 assert.equal(evaluateTimedChallenge(gold,run,{day:6,totalUpgrades:6}).status,"complete");
});
test("guest journey visits food and rest then reaches its actual hotel",()=>{
 const home={index:1,id:"budget_inn",attr:{category:"hotel"}};
 const targets=[{index:3,id:"wave_pool",attr:{category:"attraction"}},{index:12,id:"dining",attr:{category:"facility"}},{index:20,id:"bench",attr:{category:"environment"}}];
 assert.equal(guestJourney(targets,9,0,home).activity,"eating");
 assert.equal(guestJourney(targets,15,0,home).activity,"resting");
 const finish=guestJourney(targets,23,0,home);
 assert.equal(finish.atHome,true);
 assert.equal(finish.x,1.5);assert.equal(finish.y,.73);
 assert.equal(guestJourney([],0,0,null),null);
 const empty=guestJourney([],0,0,home);
 assert.equal(empty.target.id,"budget_inn");
});
test("resort happiness and occupancy require actual overnight guests",()=>{
 const happy=STORY_CONTRACTS.find(c=>c.id==="resort_happy");
 assert.equal(contractProgress(happy,{hotelStats:{totalGuests:0,avgHappiness:100}}).complete,false);
 assert.equal(contractProgress(happy,{hotelStats:{totalGuests:5,avgHappiness:81}}).complete,true);
 const party=STORY_CONTRACTS.find(c=>c.id==="resort_celebrate");
 assert.equal(contractProgress(party,{hotelStats:{totalGuests:0},activeEvents:[{id:"evening_pool_party"}]}).complete,false);
 assert.equal(contractProgress(party,{hotelStats:{totalGuests:5},activeEvents:[{id:"evening_pool_party"}]}).complete,true);
});
test("resort chapter unlocks in order without changing saved story steps",()=>{
 const game={storyStep:0,STORY_STEPS:[{chapter:4}],claimedStoryContracts:[]};
 const steps=availableStoryContracts(game).filter(c=>c.arc==="resort");
 assert.equal(steps.length,5);
 assert.equal(steps.filter(c=>!c.locked).length,1);
 game.claimedStoryContracts=["resort_welcome","resort_dining"];
 assert.equal(availableStoryContracts(game).find(c=>c.id==="resort_happy").locked,false);
 assert.equal(game.storyStep,0);
});
