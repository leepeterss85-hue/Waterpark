import React from "react";
import SceneProp from "@/components/game/artwork/SceneProp";
import ConnectedPathArtwork from "@/components/game/artwork/ConnectedPathArtwork";

export default function ParkObjectArtwork({ attr, grid = [], index = 0 }) {
  if (["main_path", "queue_path", "service_road"].includes(attr.id)) return <ConnectedPathArtwork kind={attr.id} grid={grid} index={index} />;
  return <svg viewBox="0 0 100 100" className="park-object-art" aria-hidden="true" focusable="false" data-object={attr.id}>
    {attr.id === "palm_tree" && <><ellipse cx="52" cy="68" rx="28" ry="14" className="scene-plant-bed" /><SceneProp kind="palm" x={51} y={50} scale={1.7} /></>}
    {attr.id === "bench" && <SceneProp kind="bench" x={50} y={49} scale={1.7} />}
    {attr.id === "shade_umbrella" && <><SceneProp kind="chair" x={30} y={66} scale={1.5} /><SceneProp kind="chair" x={69} y={66} scale={1.5} /><SceneProp kind="parasol" x={51} y={37} scale={1.8} /></>}
    {attr.id === "fountain" && <><ellipse cx="50" cy="62" rx="36" ry="24" className="pool-rim" /><ellipse cx="50" cy="62" rx="29" ry="18" className="scene-water" /><path d="M26 59Q50 3 75 59M36 62Q50 20 65 62M50 64V24" className="scene-water-jet" /><circle cx="50" cy="64" r="6" className="scene-spray-base" /></>}
    {attr.id === "fence" && <><path d="M8 37H92M8 65H92" className="scene-fence-rail" />{[12, 30, 49, 69, 88].map(x => <path key={x} d={`M${x} 28V78`} className="scene-fence-post" />)}</>}
    {attr.id === "wayfinding_sign" && <><path d="M49 19V85" className="scene-sign-post" /><path d="M19 22H65L79 33L65 44H19Z" className="scene-sign-board" /><path d="M81 47H36L22 58L36 69H81Z" className="scene-sign-board-blue" /><text x="46" y="37" className="scene-sign">POOLS →</text><text x="54" y="62" className="scene-sign">← FOOD</text></>}
    {attr.id === "park_entrance" && <><path d="M10 81V34Q50 -5 90 34V81" className="scene-entrance-arch" /><path d="M24 79V36Q50 10 76 36V79Z" className="scene-entrance-opening" /><path d="M27 64H73M37 57V75M50 57V75M63 57V75" className="scene-ticket-gate" /><rect x="9" y="23" width="82" height="17" rx="4" className="scene-entry-sign" /><text x="50" y="34" className="scene-dark-sign">WATER PARK</text><SceneProp kind="palm" x={8} y={67} scale={.55} /><SceneProp kind="palm" x={94} y={67} scale={.55} /></>}
  </svg>;
}