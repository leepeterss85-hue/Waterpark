import React from "react";
import { useReducedMotion } from "framer-motion";
import PersonSprite from "@/components/game/PersonSprite";
import { getRideScene } from "@/components/game/artwork/rideScenes";

export default function RideVisitors({ attr, guests, movement, incident }) {
  const reduced = useReducedMotion();
  const scene = getRideScene(attr.id);
  if (guests <= 0 || movement <= 0 || incident?.type === "breakdown" || scene.kind === "dry") return null;
  const count = Math.min(4, Math.max(2, Math.ceil(movement / 30)));
  const positions = scene.kind === "slide" ? [[34, 73], [72, 73]] : attr.id === "play_structure" ? [[24, 68], [51, 72], [78, 68]] : [[28, 39], [69, 39], [28, 70], [69, 70]];
  const activity = scene.kind === "splash" ? "playing" : "swimming";
  return <svg className="ride-visitors" viewBox="0 0 100 100" aria-label={`Guests using ${attr.name}`} role="img" data-ride-visitors={attr.id}>
    {scene.kind === "river" ? Array.from({ length: Math.min(3, count) }, (_, i) => <g key={i} className="ride-visitor" data-activity="floating" transform={reduced ? `translate(${[24, 78, 49][i]} ${[31, 36, 76][i]})` : undefined}>
      {!reduced && <animateMotion path={scene.paths[0]} dur="16s" begin={`${-i * 5}s`} repeatCount="indefinite" />}
      <PersonSprite activity="floating" variant={i + 1} x="-14" y="-24" width="28" height="38" />
    </g>) : <>
      {positions.slice(0, count).map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} className="ride-visitor" data-activity={activity}><g className="ride-swimmer"><PersonSprite activity={activity === "playing" ? "waiting" : activity} variant={i + 2} x="-16" y="-28" width="32" height="44" /></g></g>)}
      {scene.kind === "slide" && scene.paths.slice(0, 2).map((path, i) => <g key={path} className="ride-visitor" data-activity="sliding" transform={reduced ? "translate(47 53)" : undefined}>
        {!reduced && <animateMotion path={path} dur={`${4 + i}s`} begin={`${-i * 2}s`} repeatCount="indefinite" />}
        <PersonSprite activity="sliding" variant={i} x="-14" y="-24" width="28" height="38" />
      </g>)}
    </>}
  </svg>;
}