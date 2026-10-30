import React, { useEffect, useState } from "react";
import { Radio, ChevronDown, ChevronUp } from "lucide-react";
import { parkAnnouncement } from "@/data/parkAnnouncements";
export default function ParkRadio({ game }) {
  const [turn, setTurn] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!game.playing) return;
    const timer = setInterval(() => { if (!document.hidden) setTurn(n => n + 1); }, 45000);
    return () => clearInterval(timer);
  }, [game.playing]);
  const message = parkAnnouncement({guests:game.guests, queueStats:game.visitorStats?.queueStats, incidents:game.incidents,
    waterQuality:game.waterQualityAvg, avgMood:game.visitorStats?.avgMood, weather:typeof game.weather === "string" ? game.weather : game.weather?.id || ""}, turn);
  return <aside className="park-radio" data-expanded={expanded} aria-label="Park radio">
    <button type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded} aria-label={expanded ? "Collapse park announcement" : "Read park announcement"}>
      <Radio size={16}/><strong>Park radio</strong><span>{message.text}</span>{expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
    </button>
  </aside>;
}
