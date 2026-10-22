import React from "react";
import { useReducedMotion } from "framer-motion";
import PersonSprite from "@/components/game/PersonSprite";
import { getRideScene } from "@/components/game/artwork/rideScenes";

export default function RideVisitors({ attr, guests, movement, incident, queueWait = 0, graphicsQuality = "ultra" }) {
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced || graphicsQuality === "balanced";
  const scene = getRideScene(attr.id);
  if (guests <= 0 || movement <= 0 || incident?.type === "breakdown" || scene.kind === "dry") return null;
  const count = Math.min(graphicsQuality === "balanced" ? 3 : 6, Math.max(0, Math.ceil(movement / 14) + Math.ceil(queueWait / 12)));
  if (count === 0) return null;
  const positions = scene.kind === "slide" ? [[26, 72], [48, 76], [70, 72]] : attr.id === "play_structure" ? [[22, 66], [48, 70], [74, 66], [38, 78]] : [[26, 38], [50, 38], [74, 38], [28, 68], [58, 70], [76, 66]];
  const activity = scene.kind === "splash" ? "playing" : "swimming";
  const size = 42;
  return <svg className="ride-visitors" viewBox="0 0 100 100" aria-label={`Guests using ${attr.name}`} role="img" data-ride-visitors={attr.id}>
    {queueWait > 0 && <g data-activity="queueing">
      <path d="M8 87L8 63L18 63" fill="none" stroke="#e2e8f0" strokeWidth="2" />
      {Array.from({length:Math.min(reduced ? 2 : 4,Math.ceil(queueWait/6))},(_,i)=><g key={i} transform={\`translate(8 \${83-i*7})\`}>
        <PersonSprite activity="waiting" variant={i+5} x={-6} y={-10} width={12} height={17}/>
      </g>)}
    </g>}
    {scene.kind === "river" ? Array.from({ length: Math.min(4, count) }, (_, i) => <g key={i} className="ride-visitor" data-activity="floating" transform={reduced ? `translate(${[22, 78, 35, 65][i]} ${[31, 36, 76, 60][i]})` : undefined}>
      {!reduced && <animateMotion path={scene.paths[0]} dur="16s" begin={`${-i * 4}s`} repeatCount="indefinite" />}
      <PersonSprite activity="floating" variant={i + 1} x={-size / 2} y={-size * 0.7} width={size} height={size * 1.4} />
    </g>) : <>
      {positions.slice(0, count).map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} className="ride-visitor" data-activity={activity}>
        <ellipse cx="0" cy={size * 0.55} rx={size * 0.4} ry={size * 0.12} className="ride-visitor-splash" />
        <g className="ride-swimmer"><PersonSprite activity={activity === "playing" ? "waiting" : activity} variant={i + 2} x={-size / 2} y={-size * 0.75} width={size} height={size * 1.4} /></g>
      </g>)}
      {scene.kind === "slide" && scene.paths.slice(0, reduced ? 1 : 2).map((path, i) => {
        const coords=path.match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[];
        const start=coords.slice(0,2), end=coords.slice(-2);
        const cycle=10+i*2;
        // One rider waits at the gate, boards, rides, then exits at the splash pool.
        const route=\`M8 87L8 63L\${start[0]} \${start[1]}\`+path.replace(/^M[-\d.]+[ ,]+[-\d.]+/,"");
        return <React.Fragment key={path}>
          <g className="ride-visitor" data-activity="boarding-and-sliding" transform={reduced ? \`translate(\${start[0]} \${start[1]})\` : undefined}>
            {!reduced && <animateMotion path={route} dur={cycle+"s"} begin={-i*3+"s"} keyPoints="0;0;1;1" keyTimes="0;0.2;0.85;1" calcMode="linear" repeatCount="indefinite" />}
            <PersonSprite activity="sliding" variant={i} x={-8} y={-11} width={16} height={22}/>
          </g>
          <g transform={\`translate(\${end[0]} \${end[1]})\`} data-activity="splashdown">
            <ellipse rx="7" ry="3" fill="none" stroke="#fff" strokeWidth="1.6" opacity={reduced ? .6 : 0}>
              {!reduced && <animate attributeName="opacity" values="0;0;0.9;0" keyTimes="0;0.8;0.86;1" dur={cycle+"s"} begin={-i*3+"s"} repeatCount="indefinite"/>}
              {!reduced && <animate attributeName="rx" values="2;2;10;14" keyTimes="0;0.8;0.86;1" dur={cycle+"s"} begin={-i*3+"s"} repeatCount="indefinite"/>}
            </ellipse>
          </g>
        </React.Fragment>;
      })}
    </>}
  </svg>;
}