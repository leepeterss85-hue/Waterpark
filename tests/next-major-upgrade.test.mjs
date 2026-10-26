import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { clampParkPan, zoomParkAtPoint } from "../src/lib/parkCamera.js";
import { STORY_CONTRACTS, contractProgress, availableStoryContracts } from "../src/data/storyContracts.js";
import { TIMED_CHALLENGES, canStartTimedChallenge, startTimedChallenge, evaluateTimedChallenge, sanitiseTimedChallenges } from "../src/data/timedChallenges.js";
import { buildSavePayload } from "../src/lib/savePayload.js";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("phone camera pans at auto-fit zoom, stays in bounds and preserves pinch focus", () => {
  assert.equal(clampParkPan(999, 360, 704, 1.5), 24);
  assert.equal(clampParkPan(-999, 360, 704, 1.5), 360 - 704 * 1.5 - 24);
  assert.equal(clampParkPan(1000, 360, 704, 0.49), 360 - 704 * 0.49 + 24);
  assert.equal(clampParkPan(-999, 360, 704, 0.49), -24);
  assert.equal(clampParkPan(Infinity, 0, 704, 1), 0);
  const camera = zoomParkAtPoint(
    {zoom:1,panX:-20,panY:-30},2,{x:110,y:120},
    {width:300,height:400,contentWidth:400,contentHeight:460}
  );
  assert.equal(camera.zoom,2);
  assert.equal(camera.panX,-150);
  assert.equal(camera.panY,-180);
  const hook = read("src/hooks/useTouchZoom.js");
  assert.match(hook,/drag to pan|Allow one-finger map exploration at ALL zoom levels/i);
  assert.match(hook,/zoomParkAtPoint/);
  assert.match(hook,/suppressGestureClickRef\.current = true/);
  assert.match(read("src/components/game/ParkGrid.jsx"),/canAffordBuild=\{canAffordBuild\}/);
});

test("Maya's festival offers alternative real objectives and rewards once", () => {
  const festival = STORY_CONTRACTS.filter(c => c.arc === "festival");
  assert.equal(festival.length,4);
  assert.deepEqual(festival.map(c=>c.id),[
    "festival_invitation","festival_preparation","festival_destination","festival_finale"
  ]);
  const game={
    STORY_STEPS:[{chapter:6}],storyStep:0,storyCompleted:false,
    missionState:{attractionCount:6},visitorStats:{avgMood:40},
    totalUpgrades:0,visitorReviews:[],membershipCounts:{},
    grid:[],parkZones:[],upgrades:[],completedChains:[],
    hotelStats:{totalGuests:0},reputation:20,
    claimedStoryContracts:[],
  };
  const first=contractProgress(festival[0],game);
  assert.equal(first.complete,true);
  assert.equal(first.alternative,true);
  assert.equal(first.routes.length,2);
  assert.equal(first.routes[0].complete,false);
  assert.equal(first.routes[1].complete,true);
  assert.equal(availableStoryContracts(game).find(c=>c.id===festival[1].id).locked,true);
  game.claimedStoryContracts=[festival[0].id];
  assert.equal(availableStoryContracts(game).find(c=>c.id===festival[1].id).locked,false);
  game.visitorReviews=Array.from({length:12},()=>({}));
  assert.equal(contractProgress(festival[1],game).complete,true);
  game.grid=["budget_inn"];
  assert.equal(contractProgress(festival[2],game).complete,true);
  game.membershipCounts={family_membership:40};
  assert.equal(contractProgress(festival[3],game).complete,true);
  assert.equal(STORY_CONTRACTS.filter(c=>c.arc==="legacy").length,5);
  assert.match(read("src/components/game/StoryContractsPanel.jsx"),/Choose either route/);
  assert.match(read("src/hooks/useGameState.js"),/claimedContractRef\.current\.has\(contractId\)/);
});

test("new timed medals measure progress from acceptance and preserve previous save fields", () => {
  for(const id of ["review_rally","loyalty_drive","resort_weekend"]){
    assert.equal(TIMED_CHALLENGES.filter(c=>c.baseId===id).length,3);
  }
  const review=TIMED_CHALLENGES.find(c=>c.id==="review_rally");
  const started=startTimedChallenge(review,{day:10,visitorReviews:Array(7).fill({})});
  assert.equal(evaluateTimedChallenge(review,started,{day:10,visitorReviews:Array(7).fill({})}).progress,0);
  assert.equal(evaluateTimedChallenge(review,started,{day:13,visitorReviews:Array(13).fill({})}).status,"complete");
  assert.equal(evaluateTimedChallenge(review,started,{day:18,visitorReviews:Array(7).fill({})}).status,"expired");

  const loyalty=TIMED_CHALLENGES.find(c=>c.id==="loyalty_drive");
  const run=startTimedChallenge(loyalty,{day:30,membershipCounts:{season_pass:5}});
  assert.equal(evaluateTimedChallenge(loyalty,run,{day:32,membershipCounts:{season_pass:14}}).progress,9);
  assert.equal(evaluateTimedChallenge(loyalty,run,{day:32,membershipCounts:{season_pass:15}}).status,"complete");

  const occupancy=TIMED_CHALLENGES.find(c=>c.id==="resort_weekend");
  const weekend=startTimedChallenge(occupancy,{day:30});
  assert.equal(evaluateTimedChallenge(occupancy,weekend,{day:30,hotelStats:{occupancy:80,totalGuests:20}}).progress,0);
  assert.equal(evaluateTimedChallenge(occupancy,weekend,{day:31,hotelStats:{occupancy:100,totalGuests:0}}).progress,0);
  assert.equal(evaluateTimedChallenge(occupancy,weekend,{day:31,hotelStats:{occupancy:65,totalGuests:12}}).status,"complete");

  assert.ok(!canStartTimedChallenge(TIMED_CHALLENGES.find(c=>c.id==="loyalty_drive_silver"),{},{}));
  const runs={review_rally:started};
  assert.deepEqual(sanitiseTimedChallenges(buildSavePayload({timedChallenges:runs}).timedChallenges),runs);
  assert.match(read("src/hooks/useGameState.js"),/\[day, totalUpgrades, lifetimeEarnings, guests, activeEvents, challenge, seasonEvent, visitorStats, visitorReviews, membershipCounts, hotelStats, timedChallenges\]/);
});

test("graphics activity is read-only, respects quality modes and building affordability", () => {
  const pulse = read("src/components/game/ParkActivityPulse.jsx");
  const map = read("src/components/game/ParkGrid.jsx");
  const tile = read("src/components/game/Tile.jsx");
  const css = read("src/components/game/parkActivityPulse.css");
  assert.match(map,/<ParkActivityPulse/);
  assert.match(pulse,/longestWait/);
  assert.match(pulse,/lifeguardTotal/);
  assert.match(tile,/data-build-affordable/);
  assert.match(tile,/movement > 0 && !incident && <RideParticles/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/data-graphics="balanced"/);
  assert.match(read("src/components/game/GameModePanel.jsx"),/cannot buy game cash, upgrades or items with real money/);
});
