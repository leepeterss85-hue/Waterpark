import React from "react";
import { Swords, Zap, TrendingUp } from "lucide-react";

// Shows active counter-strikes on the map so the player can see
// their market-warfare decisions playing out visually, not just in a menu.
export default function StrikeBanner({ activeStrikes = [] }) {
  if (!activeStrikes || activeStrikes.length === 0) return null;
  const totalBoost = activeStrikes.reduce((s, st) => s + (st.guestBoost || 0), 0);
  return (
    <div className="strike-banner">
      <Swords className="h-3.5 w-3.5 text-rose-300" />
      <span className="strike-banner-label">
        {activeStrikes.length === 1
          ? `Striking: ${activeStrikes[0].rivalName}`
          : `${activeStrikes.length} rival strikes active`}
      </span>
      <span className="strike-banner-boost">
        <TrendingUp className="h-2.5 w-2.5" />+{Math.round(totalBoost * 100)}% demand
      </span>
      {activeStrikes.slice(0, 3).map((s) => (
        <span key={s.rivalId} className="strike-banner-chip">
          <Zap className="h-2 w-2" />{s.rivalName} · {s.daysLeft}d
        </span>
      ))}
    </div>
  );
}