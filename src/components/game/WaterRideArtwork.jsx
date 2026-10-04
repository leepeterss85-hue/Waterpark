import React, { useId } from "react";
import { getRideScene, LAGOON_PATH, RIVER_PATH } from "@/components/game/artwork/rideScenes";
import SceneProp from "@/components/game/artwork/SceneProp";
import SlideStructure from "@/components/game/artwork/SlideStructure";
import PoolFeatures from "@/components/game/artwork/PoolFeatures";
import DryAttractionArtwork from "@/components/game/artwork/DryAttractionArtwork";

export default function WaterRideArtwork({ attr }) {
  const uid = useId().replace(/:/g, "");
  const scene = getRideScene(attr.id);
  const pool = scene.kind === "slide" ? "M14 65C27 55 77 56 87 68C98 85 76 91 51 88C22 92 3 83 14 65Z" : attr.id === "lap_sports_pool" ? "M15 22H85Q91 22 91 29V76Q91 83 84 83H16Q9 83 9 76V29Q9 22 15 22Z" : LAGOON_PATH;
  return <svg className="ride-art aquatic-ride-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-ride={attr.id}>
    <defs><linearGradient id={uid} x2=".7" y2="1"><stop className="pool-stop-light" /><stop offset="1" className="pool-stop-deep" /></linearGradient><pattern id={uid + "ripple"} width="16" height="12" patternUnits="userSpaceOnUse"><path d="M0 6Q4 2 8 6T16 6" className="pool-caustic" /></pattern></defs>
    <rect x="3" y="3" width="94" height="92" rx="7" className="scene-plot-deck" />
    {scene.kind === "dry" ? <DryAttractionArtwork id={attr.id} /> : scene.kind === "river" ? <><path d={RIVER_PATH} className="ride-river-rim" /><path d={RIVER_PATH} className="ride-river-water" /><path d={RIVER_PATH} className="ride-river-glint" /><ellipse cx="48" cy="49" rx="16" ry="13" className="ride-river-island" /><SceneProp kind="palm" x={49} y={46} scale={.5} /></> : <><path d={pool} className="pool-rim" strokeWidth="7" strokeLinejoin="round" /><path d={pool} fill={`url(#${uid})`} /><path d={pool} fill={`url(#${uid}ripple)`} /><path d="M10 58H19V70H10M14 60V68" className="pool-ladder" /></>}
    {scene.kind === "slide" ? <SlideStructure id={attr.id} paths={scene.paths} /> : scene.kind !== "dry" && <PoolFeatures id={attr.id} />}
    <SceneProp kind="palm" x={91} y={13} scale={.36} />
    {scene.kind === "pool" && <><SceneProp kind="chair" x={5} y={32} scale={.42} /><SceneProp kind="chair" x={95} y={60} scale={.42} /></>}
  </svg>;
}