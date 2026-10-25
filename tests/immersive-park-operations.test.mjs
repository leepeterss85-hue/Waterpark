import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { OPENING_PLANS, canChooseOpeningPlan, openingPlanFor } from "../src/data/openingPlans.js";
import { simulateConstruction } from "../src/data/construction.js";
import { rollParkInspection } from "../src/data/parkInspections.js";
import { buildSavePayload } from "../src/lib/savePayload.js";

const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("opening choices are optional, paid once, apply on the next day and expire",()=>{
  assert.equal(OPENING_PLANS.length,3);
  assert.equal(new Set(OPENING_PLANS.map(p=>p.id)).size,3);
  const booked={id:"queue_marshal",targetDay:11};
  assert.equal(openingPlanFor(booked,10)?.queueWaitMult,.75);
  assert.equal(openingPlanFor(booked,11),null);
  assert.equal(openingPlanFor(booked,9),null);
  assert.equal(canChooseOpeningPlan(booked,10,100000,false,"welcome_crew"),false);
  assert.equal(canChooseOpeningPlan(null,10,100,false,"safety_drill"),false);
  assert.equal(canChooseOpeningPlan(null,10,100,true,"safety_drill"),true);
  assert.equal(canChooseOpeningPlan(null,10,100000,false,"fake"),false);
  assert.ok(buildSavePayload({openingPlan:booked}).openingPlan.targetDay===11);
});

test("construction stays at its reserved plot until the agreed park day",()=>{
  const grid=Array(48).fill(null);
  grid[40]="park_entrance";
  const p={projectId:"ride_tornado",status:"in_progress",startedDay:7,targetTile:11,name:"Tornado Bowl Complex",progress:0};
  const snapshot=JSON.stringify(grid);
  const working=simulateConstruction({day:8,projects:[p],grid});
  assert.equal(working.completionActions.length,0);
  assert.ok(working.updatedProjects[0].progress>0);
  assert.equal(working.updatedProjects[0].status,"in_progress");
  const done=simulateConstruction({day:11,projects:[p],grid});
  assert.deepEqual(done.completionActions,[{type:"place",tileIndex:11,itemId:"tornado_bowl"}]);
  assert.equal(done.updatedProjects[0].status,"completed");
  assert.match(done.logEntries[0].text,/GRAND OPENING/);
  assert.equal(JSON.stringify(grid),snapshot);
});

test("reserved sites are not overwritten; legacy construction and sandbox still complete",()=>{
  const grid=Array(48).fill(null);
  grid[11]="splash_pad";
  const project={projectId:"ride_tornado",status:"in_progress",startedDay:2,targetTile:11};
  const blocked=simulateConstruction({day:6,projects:[project],grid});
  assert.equal(blocked.completionActions.length,0);
  assert.equal(blocked.updatedProjects[0].status,"in_progress");
  assert.equal(blocked.updatedProjects[0].needsSpace,true);
  const legacy={projectId:"ride_tornado",status:"in_progress",startedDay:2};
  const legacyResult=simulateConstruction({day:6,projects:[legacy],grid});
  assert.equal(legacyResult.completionActions[0].tileIndex,0);
  const instant=simulateConstruction({day:2,projects:[{...legacy,targetTile:15}],grid,instantConstruction:true});
  assert.deepEqual(instant.completionActions,[{type:"place",tileIndex:15,itemId:"tornado_bowl"}]);
  const completed=simulateConstruction({day:12,projects:instant.updatedProjects,grid});
  assert.equal(completed.completionActions.length,0);
});

test("inspection is rare, requires a real park and reflects safety, water and incidents",()=>{
  const good={day:10,attractionCount:4,safety:.94,cleanliness:.9,uptime:.92,waterQuality:95,incidentCount:0};
  assert.equal(rollParkInspection(good, .9),null);
  assert.equal(rollParkInspection({...good,day:3},0),null);
  assert.equal(rollParkInspection({...good,attractionCount:0},0),null);
  const passed=rollParkInspection(good,0);
  assert.equal(passed.passed,true);
  assert.equal(passed.fine,0);
  assert.equal(passed.xp,50);
  const failed=rollParkInspection({...good,safety:.25,cleanliness:.4,waterQuality:30,incidentCount:4},0);
  assert.equal(failed.passed,false);
  assert.equal(failed.fine,450);
  assert.ok(failed.repDelta<0);
});

test("game wiring protects save data, displays sites and respects quality settings",()=>{
  const hook=read("src/hooks/useGameState.js");
  const tick=read("src/hooks/runDay.js");
  const tile=read("src/components/game/Tile.jsx");
  const map=read("src/components/game/ParkGrid.jsx");
  const home=read("src/pages/Home.jsx");
  const brief=read("src/components/game/OperationsBriefPanel.jsx");
  const css=read("src/components/game/parkImmersion.css");
  assert.match(hook,/setOpeningPlan\(data\.openingPlan/);
  assert.match(hook,/constructionProjects\.some\(p => p\.status === "in_progress"/);
  assert.match(hook,/setOpeningPlan\(null\)/);
  assert.match(tick,/openingPlanFor\(stateRef\.current\.openingPlan, d\)/);
  assert.match(tick,/inspectionCost: inspection\?\.fine/);
  assert.match(home,/constructionProjects=\{game\.constructionProjects\}/);
  assert.match(map,/constructionSite=\{site\}/);
  assert.match(tile,/data-kind=\{constructionSite \?/);
  assert.match(tile,/openingCelebration=|park-new-opening/);
  assert.match(brief,/chooseOpeningPlan/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/data-graphics="balanced"/);
});
