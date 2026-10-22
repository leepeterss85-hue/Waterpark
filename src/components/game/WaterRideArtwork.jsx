import React, { useId } from "react";
import { getRideScene, LAGOON_PATH, RIVER_PATH } from "@/components/game/artwork/rideScenes";
import SceneProp from "@/components/game/artwork/SceneProp";
import SlideStructure from "@/components/game/artwork/SlideStructure";
import PoolFeatures from "@/components/game/artwork/PoolFeatures";
import DryAttractionArtwork from "@/components/game/artwork/DryAttractionArtwork";
import PoolWaterSurface from "@/components/game/artwork/PoolWaterSurface";

export default function WaterRideArtwork({ attr }) {
  const artId = "resort" + useId().replace(/:/g, "");
  const scene = getRideScene(attr.id);
  const pool = scene.kind === "slide" ? "M14 65C27 55 77 56 87 68C98 85 76 91 51 88C22 92 3 83 14 65Z" : attr.id === "lap_sports_pool" ? "M15 22H85Q91 22 91 29V76Q91 83 84 83H16Q9 83 9 76V29Q9 22 15 22Z" : LAGOON_PATH;
  return <svg className="ride-art aquatic-ride-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-ride={attr.id}>
    <defs>
      <linearGradient id={artId + "-deck"} x2=".8" y2="1"><stop stopColor="#fff4d7"/><stop offset="1" stopColor="#d9bc85"/></linearGradient>
      <pattern id={artId + "-paving"} width="12" height="10" patternUnits="userSpaceOnUse"><path d="M0 0H12M0 10V0M6 0V10" fill="none" stroke="#8c7959" strokeOpacity=".18" strokeWidth=".5"/></pattern>
    </defs>
    <rect x="4" y="8" width="92" height="89" rx="8" fill="#6b7951" />
    <rect x="3" y="3" width="94" height="89" rx="7" fill={`url(#${artId}-deck)`} stroke="#fff8e5" strokeWidth="1.4" />
    <rect x="4" y="4" width="92" height="87" rx="6" fill={`url(#${artId}-paving)`} />
    <path d="M10 93H88" stroke="#4c6445" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    <g fill="#398457"><ellipse cx="9" cy="13" rx="5" ry="7"/><ellipse cx="17" cy="9" rx="6" ry="4"/><ellipse cx="89" cy="87" rx="5" ry="3"/></g>
    <g fill="#7fbd63"><ellipse cx="8" cy="11" rx="3" ry="4"/><ellipse cx="16" cy="8" rx="4" ry="2"/><ellipse cx="88" cy="86" rx="3" ry="1.5"/></g>
    {scene.kind === "dry" ? <DryAttractionArtwork id={attr.id} /> : scene.kind === "river" ? <><path d={RIVER_PATH} className="ride-river-rim" /><PoolWaterSurface path={RIVER_PATH} river /><path d={RIVER_PATH} className="ride-river-glint" /><ellipse cx="48" cy="49" rx="16" ry="13" className="ride-river-island" /><SceneProp kind="palm" x={49} y={46} scale={.5} /></> : <><path d={pool} className="pool-rim" strokeWidth="7" strokeLinejoin="round" /><PoolWaterSurface path={pool} /><path d="M10 58H19V70H10M14 60V68" className="pool-ladder" /></>}
    {scene.kind === "slide" ? <SlideStructure id={attr.id} paths={scene.paths} /> : scene.kind !== "dry" && <PoolFeatures id={attr.id} />}
    <SceneProp kind="palm" x={91} y={13} scale={.36} />
    {scene.kind === "pool" && <><SceneProp kind="chair" x={5} y={32} scale={.42} /><SceneProp kind="chair" x={95} y={60} scale={.42} /></>}
  </svg>;
}