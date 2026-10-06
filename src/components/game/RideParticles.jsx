import React from "react";
import "@/components/game/particleFX.css";

// Ride-specific particle effect overlays
const RIDE_EFFECTS = {
  body_slide: { type: "spray", count: 6 },
  speed_slide: { type: "streak", count: 3 },
  kamikaze_slide: { type: "streak", count: 3 },
  aqua_loop: { type: "spray", count: 4 },
  raft_tube: { type: "spray", count: 4 },
  family_raft: { type: "spray", count: 4 },
  tornado_bowl: { type: "vortex", count: 1 },
  bowl_slide: { type: "vortex", count: 1 },
  water_coaster: { type: "spray", count: 4 },
  multi_racer: { type: "streak", count: 3 },
  halfpipe: { type: "spray", count: 4 },
  mega_slide_complex: { type: "spray", count: 6 },
  freefall_drop: { type: "streak", count: 3 },
  wave_pool: { type: "wavepool", count: 1 },
  lazy_river: { type: "current", count: 4 },
  splash_pad: { type: "groundjet", count: 5 },
  kiddie_pool: { type: "bubbles", count: 6 },
  activity_pool: { type: "bubbles", count: 4 },
  lap_sports_pool: { type: "bubbles", count: 4 },
  diving_platform: { type: "ripple", count: 3 },
  leisure_pool: { type: "mist", count: 3 },
};

function EffectLayer({ type, count }) {
  switch (type) {
    case "spray":
      return <>{Array.from({ length: count }, (_, i) => <span key={i} className="fx-spray" />)}</>;
    case "streak":
      return <>{Array.from({ length: count }, (_, i) => <span key={i} className="fx-motion-streak" />)}</>;
    case "vortex":
      return <span className="fx-vortex" />;
    case "wavepool":
      return <><div className="fx-wavepool-surface" /><span className="fx-water-glow" /></>;
    case "current":
      return <div className="fx-current-flow">{Array.from({ length: count }, (_, i) => <span key={i} className="fx-current-particle" />)}</div>;
    case "groundjet":
      return <>{Array.from({ length: count }, (_, i) => <span key={i} className="fx-ground-jet" />)}</>;
    case "bubbles":
      return <div className="fx-bubbles">{Array.from({ length: count }, (_, i) => <span key={i} className="fx-bubble" />)}</div>;
    case "ripple":
      return <>{Array.from({ length: count }, (_, i) => <span key={i} className="fx-ripple-ring" />)}</>;
    case "mist":
      return <>{Array.from({ length: count }, (_, i) => <span key={i} className="fx-mist" />)}</>;
    default:
      return null;
  }
}

export default function RideParticles({ rideId }) {
  const effect = RIDE_EFFECTS[rideId];
  if (!effect) return null;
  return (
    <div className="ride-particles" aria-hidden="true">
      <EffectLayer type={effect.type} count={effect.count} />
      {["body_slide", "speed_slide", "kamikaze_slide", "aqua_loop", "multi_racer", "mega_slide_complex"].includes(rideId) && (
        <div className="fx-slide-trail" />
      )}
    </div>
  );
}