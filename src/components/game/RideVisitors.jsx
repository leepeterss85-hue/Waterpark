import React from "react";
import { useReducedMotion } from "framer-motion";
import PersonSprite from "@/components/game/PersonSprite";
import { getRideScene } from "@/components/game/artwork/rideScenes";

export default function RideVisitors({ attr, guests, movement, incident }) {
  const reduced = useReducedMotion();
  const scene = getRideScene(attr.id);
  if (guests <= 0 || movement <= 0 || incident?.type === "breakdown" || scene.kind === "dry") return null;
  const count = Math.min(6, Math.max(3, Math.ceil(movement / 18)));
  const positions = scene.kind === "slide" ? [[26, 72], [48, 76], [70, 72]] : attr.id === "play_structure" ? [[22, 66], [48, 70], [74, 66], [38, 78]] : [[26, 38], [50, 38], [74, 38], [28, 68], [58, 70], [76, 66]];
  const activity = scene.kind === "splash" ? "playing" : "swimming";
  const size = 42;
  return <svg className="ride-visitors" viewBox="0 0 100 100" aria-label={`Guests using ${attr.name}`} role="img" data-ride-visitors={attr.id}>
    {scene.kind === "river" ? Array.from({ length: Math.min(4, count) }, (_, i) => <g key={i} className="ride-visitor" data-activity="floating" transform={reduced ? `translate(${[22, 78, 35, 65][i]} ${[31, 36, 76, 60][i]})` : undefined}>
      {!reduced && <animateMotion path={scene.paths[0]} dur="16s" begin={`${-i * 4}s`} repeatCount="indefinite" />}
      <PersonSprite activity="floating" variant={i + 1} x={-size / 2} y={-size * 0.7} width={size} height={size * 1.4} />
    </g>) : <>
      {positions.slice(0, count).map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} className="ride-visitor" data-activity={activity}>
        <ellipse cx="0" cy={size * 0.55} rx={size * 0.4} ry={size * 0.12} className="ride-visitor-splash" />
        <g className="ride-swimmer"><PersonSprite activity={activity === "playing" ? "waiting" : activity} variant={i + 2} x={-size / 2} y={-size * 0.75} width={size} height={size * 1.4} /></g>
      </g>)}
      {scene.kind === "slide" && scene.paths.slice(0, 2).map((path, i) => <g key={path} className="ride-visitor" data-activity="sliding" transform={reduced ? "translate(47 53)" : undefined}>
        {!reduced && <animateMotion path={path} dur={`${4 + i}s`} begin={`${-i * 2}s`} repeatCount="indefinite" />}
        <PersonSprite activity="sliding" variant={i} x={-size / 2} y={-size * 0.7} width={size} height={size * 1.4} />
      </g>)}
    </>}
  </svg>;
}