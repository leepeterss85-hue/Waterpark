import React from "react";
import SceneProp from "@/components/game/artwork/SceneProp";

export default function ServiceFacilityDetails({ id }) {
  return <g data-building-detail={id}>
    {["dining", "coffee_bar"].includes(id) && <><path d="M16 50H84V60H16Z" className="scene-awning" />{[26, 73].map((x) => <g key={x}><circle cx={x} cy="80" r="9" className="scene-table" /><path d={`M${x - 11} 77V85M${x + 11} 77V85`} className="scene-seat" /></g>)}<SceneProp kind="parasol" x={73} y={76} scale={.75} /></>}
    {id === "ice_cream" && <><path d="M15 51H85V62H15Z" className="scene-awning" /><path d="M42 28L49 41L57 28Z" className="scene-cone" /><circle cx="45" cy="25" r="6" className="scene-scoop" /><circle cx="54" cy="25" r="6" className="scene-porcelain" /><circle cx="49" cy="18" r="6" className="scene-scoop" /></>}
    {id === "retail" && <><path d="M23 56H43V73H23Z" className="scene-shop-bag" /><path d="M27 57V52Q33 45 39 52V57" className="scene-metal" /><path d="M58 53H80M62 54V72M69 54V72M76 54V72" className="scene-towel-rack" /></>}
    {id === "first_aid" && <><path d="M44 22H55V31H64V42H55V51H44V42H35V31H44Z" className="scene-first-aid-cross" /><rect x="20" y="58" width="29" height="13" rx="3" className="scene-porcelain" /><path d="M22 72V77M46 72V77" className="scene-metal" /></>}
    {id === "gym" && <><path d="M20 62H45M20 57V68M25 54V71M40 54V71M45 57V68" className="scene-gym-weight" /><path d="M59 69H81L77 56H70M69 57V47H78" className="scene-treadmill" /></>}
    {id === "arcade" && <>{[26, 50, 74].map((x) => <g key={x}><path d={`M${x - 9} 52H${x + 9}L${x + 6} 77H${x - 8}Z`} className="scene-arcade-cabinet" /><rect x={x - 5} y="56" width="10" height="9" className="scene-arcade-screen" /><path d={`M${x} 68V71M${x - 4} 72H${x + 4}`} className="scene-arcade-controls" /></g>)}</>}
    {id === "party_room" && <><path d="M12 48L90 48M21 48L26 58L31 48M42 48L47 58L52 48M64 48L69 58L74 48" className="scene-bunting" />{[25, 49, 75].map((x) => <g key={x}><path d={`M${x} 40V25`} className="scene-balloon-string" /><ellipse cx={x} cy="18" rx="7" ry="9" className="scene-balloon" /></g>)}<rect x="39" y="65" width="22" height="10" rx="2" className="scene-cake" /></>}
    {id === "photo_kiosk" && <><rect x="32" y="25" width="39" height="24" rx="4" className="scene-camera" /><rect x="39" y="21" width="13" height="5" className="scene-camera" /><circle cx="51" cy="37" r="8" className="scene-camera-lens" />{[21, 67].map((x) => <g key={x}><rect x={x} y="58" width="15" height="18" className="scene-porcelain" /><path d={`M${x + 2} 70L${x + 6} 64L${x + 12} 70Z`} className="scene-photo" /></g>)}</>}
  </g>;
}