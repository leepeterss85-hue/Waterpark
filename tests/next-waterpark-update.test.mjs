import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WALKER_PROFILES, walkerProfile, preferredStops } from "../src/data/guestWayfinding.js";
import { guestJourney } from "../src/data/guestJourney.js";
import { STORY_CONTRACTS, contractProgress, availableStoryContracts } from "../src/data/storyContracts.js";
import { STARTER_PARKS } from "../src/data/starterParks.js";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const storyContract = id => STORY_CONTRACTS.find(c=>c.id===id);

test("six visual profiles choose suitable park destinations and fall back safely", () => {
  assert.equal(WALKER_PROFILES.length, 6);
  assert.equal(walkerProfile(6), walkerProfile(0));
  const rides = [
    {id:"kiddie_pool",index:3,attr:{category:"attraction"}},
    {id:"speed_slide",index:10,attr:{category:"attraction"}},
  ];
  const family = preferredStops(rides,walkerProfile(0),"ride");
  const teen = preferredStops(rides,walkerProfile(1),"ride");
  assert.deepEqual(family.map(t=>t.id),["kiddie_pool"]);
  assert.deepEqual(teen.map(t=>t.id),["speed_slide"]);
  assert.deepEqual(preferredStops(rides,walkerProfile(4),"ride"),rides);
  assert.deepEqual(preferredStops([],walkerProfile(2),"ride"),[]);
});

test("guest journeys are still stable, reach home, and honour preferred rides",()=>{
  const home = {id:"park_entrance",index:40,attr:{name:"Entrance"}};
  const rides = [
    {id:"kiddie_pool",index:3,attr:{category:"attraction",name:"Kiddie pool"}},
    {id:"speed_slide",index:10,attr:{category:"attraction",name:"Speed slide"}},
  ];
  const targets = [...rides,{id:"pizza_stand",index:20,attr:{category:"facility"}},{id:"cabanas",index:30,attr:{category:"facility"}}];
  const familyTrip=guestJourney(targets,3,0,home,rides,walkerProfile(0));
  const teenTrip=guestJourney(targets,0,1,home,rides,walkerProfile(1));
  assert.equal(familyTrip.target.id,"kiddie_pool");
  assert.equal(teenTrip.target.id,"speed_slide");
  assert.equal(guestJourney(targets,21,0,home,rides,walkerProfile(0)).atHome,true);
});

test("late-game epilogue unlocks after finale, sequentially, without changing story indices",()=>{
  const legacy=STORY_CONTRACTS.filter(c=>c.arc==="legacy");
  assert.equal(legacy.length,5);
  const g={STORY_STEPS:[{chapter:13}],storyStep:0,storyCompleted:false,
    visitorStats:{avgMood:90},hotelStats:{occupancy:85,totalGuests:30},
    completedChains:["1","2"],megaProjects:[{status:"complete"},{status:"complete"},{status:"complete"}],reputation:96,claimedStoryContracts:[]};
  assert.ok(!availableStoryContracts(g).some(c=>c.arc==="legacy"));
  g.storyCompleted=true;
  let c=availableStoryContracts(g).filter(c=>c.arc==="legacy");
  assert.equal(c.length,5);
  assert.equal(c[0].complete,true);
  assert.equal(c[0].locked,false);
  assert.equal(c[1].locked,true);
  g.claimedStoryContracts=["legacy_smiles","legacy_resort","legacy_chains","legacy_megapark"];
  c=availableStoryContracts(g).filter(c=>c.arc==="legacy");
  assert.equal(c[4].complete,true);
  assert.equal(c[4].locked,false);
  assert.equal(contractProgress(storyContract("legacy_chains"),g).current,2);
});

test("two themed starter parks use the existing 48-tile map, with no paid purchases",()=>{
  for (const name of ["eco_oasis","festival_island"]) {
    const park=STARTER_PARKS.find(p=>p.id===name);
    assert.ok(park);
    assert.equal(park.grid.length,48);
    assert.equal(park.grid[40],"park_entrance");
    assert.equal(park.grid[41],"main_path");
    assert.equal(park.grid[42],"main_path");
    assert.equal(park.grid[43],"main_path");
    assert.ok(park.grid.filter(Boolean).length >= 10);
    assert.ok(park.money > 0);
  }
  assert.match(read("src/components/game/StarterParkPicker.jsx"),/STARTER_PARKS.map/);
});

test("new events use the actual launch requirements and have unique ids",async()=>{
  const source=read("src/data/parkEvents.js").replace(
    'import { getSeason } from "@/data/parkSystems";','const getSeason = () => "summer";');
  const module=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
  const ids=module.MAJOR_EVENTS.map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ["little_splash_academy","starlight_spa_retreat","turbo_slide_showdown","clean_water_carnival"]) {
    const event=module.getEvent(id);
    assert.ok(event);
    assert.ok(event.cost>0 && event.guestMult>1 && event.duration>0);
    assert.ok(module.isEventAvailable(event,40,event.minLevel));
    assert.equal(module.checkEventRequirements(event,[],{}).met,false);
  }
  const splash=module.getEvent("little_splash_academy");
  assert.equal(module.checkEventRequirements(splash,["splash_pad"],{lifeguard:1}).met,true);
  assert.equal(module.checkEventRequirements(splash,["splash_pad"],{lifeguard:0}).met,false);
  const race=module.getEvent("turbo_slide_showdown");
  assert.equal(module.checkEventRequirements(race,["body_slide"],{lifeguard:2}).met,true);
  assert.equal(module.checkEventRequirements(race,["body_slide"],{lifeguard:1}).met,false);
});

test("new map visuals respect performance and saves",()=>{
  const map=read("src/components/game/GuestLayer.jsx");
  const people=read("src/components/game/parkPeople.css");
  const mode=read("src/components/game/GameModePanel.jsx");
  const hook=read("src/hooks/useGameState.js");
  assert.match(map,/graphicsQuality!=="balanced"/);
  assert.match(map,/walkerProfile\(party\)/);
  assert.match(people,/prefers-reduced-motion:reduce/);
  assert.match(mode,/Season Two/);
  assert.match(hook,/contract.requiresStoryComplete && !storyCompleted/);
  assert.match(hook,/claimedContractRef\.current\.add\(contractId\)/);
});
