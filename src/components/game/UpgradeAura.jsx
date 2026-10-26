import React from "react";
import { Star } from "lucide-react";

const TIERS = [
  { min: 1, name: "enhanced", color: "#3b82f6", glow: "rgba(59,130,246,.5)" },
  { min: 3, name: "premium", color: "#a855f7", glow: "rgba(168,85,247,.55)" },
  { min: 5, name: "elite", color: "#f59e0b", glow: "rgba(245,158,11,.6)" },
  { min: 7, name: "legendary", color: "#ef4444", glow: "rgba(239,68,68,.65)" },
  { min: 10, name: "mythic", color: "#ec4899", glow: "rgba(236,72,153,.7)" },
];

export default function UpgradeAura({ level = 0 }) {
  if (level < 1) return null;
  const tier = [...TIERS].reverse().find((t) => level >= t.min);
  const stars = Math.min(5, Math.ceil(level / 2));
  return (
    <div className="upgrade-aura" data-tier={tier.name} aria-hidden="true" style={/** @type {React.CSSProperties} */ ({ "--aura-color": tier.color, "--aura-glow": tier.glow })}>
      <div className="upgrade-aura-ring" />
      <div className="upgrade-aura-stars">
        {Array.from({ length: stars }, (_, i) => <Star key={i} className="upgrade-star" />)}
      </div>
    </div>
  );
}