import React from "react";
import { useReducedMotion } from "framer-motion";
import PersonSprite from "@/components/game/PersonSprite";
import { getRideScene } from "@/components/game/artwork/rideScenes";

export default function RideVisitors({ attr, guests, movement, incident }) {
  const reduced = useReducedMotion();
  const scene = getRideScene(attr.id);
  if (guests <= 0 || movement <= 0 || incident?.type === "breakdown" || scene.kind === "dry") return null;
  const count = Math.min(4, Math.max(2, Math.ceil(movement / 30)));
  const positions = scene.kind === "slide" ? [[28, 76], [55, 79]] : attr.id === "play_structure" ? [[24, 68], [51, 72], [74, 72]] : attr.id === "kiddie_pool" ? [[28, 61], [50, 50], [72, 42], [54, 72]] : [[28, 39], [55, 52], [73, 70], [32, 71]];
  const activity = scene.kind === "splash" ? "playing" : "swimming";
  return <svg className="ride-visitors" viewBox="0 0 100 100" aria-label={`Guests using ${attr.name}`} role="img" data-ride-visitors={attr.id}>
    {scene.kind === "river" ? Array.from({ length: Math.min(3, count) }, (_, i) => <g key={i} className="ride-visitor" data-activity="floating" transform={reduced ? `translate(${i === 0 ? 24 : 76} ${i === 0 ? 32 : 57})` : undefined}>
      {!reduced && <animateMotion path={scene.paths[0]} dur="16s" begin={`${-i * 5}s`} repeatCount="indefinite" />}
      <circle r="7" className={i % 2 ? "pool-float-coral" : "pool-float-gold"} /><PersonSprite activity="floating" variant={i + 1} x="-8" y="-6" width="16" height="12" />
    </g>) : <>
      {positions.slice(0, count).map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} className="ride-visitor" data-activity={activity}><g className="ride-swimmer"><PersonSprite activity={activity === "playing" ? "waiting" : activity} variant={i + 2} x="-10" y="-7" width={activity === "playing" ? 13 : 22} height={activity === "playing" ? 19 : 16} /></g></g>)}
      {scene.kind === "slide" && scene.paths.slice(0, 2).map((path, i) => <g key={path} className="ride-visitor" data-activity="sliding" transform={reduced ? "translate(47 53)" : undefined}>
        {!reduced && <animateMotion path={path} dur={`${4 + i}s`} begin={`${-i * 2}s`} rotate="auto" repeatCount="indefinite" />}
        <PersonSprite activity="sliding" variant={i} x="-9" y="-6" width="18" height="13" />
      </g>)}
    </>}
  </svg>;
}