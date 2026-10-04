import React from "react";

export default function ConnectedPathArtwork({ grid = [], index = 0, kind }) {
  const row = Math.floor(index / 8), col = index % 8;
  const connected = i => ["main_path", "queue_path", "service_road", "park_entrance"].includes(grid[i]);
  const ends = [[50, 0, row > 0 && connected(index - 8)], [50, 100, row < Math.ceil(grid.length / 8) - 1 && connected(index + 8)], [0, 50, col > 0 && connected(index - 1)], [100, 50, col < 7 && connected(index + 1)]].filter(([, , yes]) => yes);
  if (!ends.length) ends.push([0, 50, true], [100, 50, true]);
  const d = ends.map(([x, y]) => `M50 50L${x} ${y}`).join(" ");
  return <svg viewBox="0 0 100 100" className="park-path-art" aria-hidden="true" focusable="false" data-object={kind}>
    <path d={d} className="scene-path-rim" /><path d={d} className={kind === "service_road" ? "scene-service-road" : "scene-guest-path"} />
    {kind === "service_road" ? <path d={d} className="scene-road-marking" /> : <path d={d} className="scene-path-pavers" />}
    {kind === "queue_path" && <><path d="M16 22H83V47H17V75H83" className="scene-queue-rope" />{[17, 49, 83].map(x => <g key={x}><circle cx={x} cy="25" r="4" className="scene-queue-post" /><circle cx={x} cy="75" r="4" className="scene-queue-post" /></g>)}</>}
  </svg>;
}