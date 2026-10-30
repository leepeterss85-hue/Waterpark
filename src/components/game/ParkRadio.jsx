import React, { useEffect, useState } from "react";
import { Radio, ChevronDown, ChevronUp } from "lucide-react";
import { parkAnnouncement } from "@/data/parkAnnouncements";
export default function ParkRadio({ game, onOpenParkLife }) {
  const [turn, setTurn] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!game.playing) return;
    const timer = setInterval(() => { if (!document.hidden) setTurn(n => n + 1); }, 45000);
    return () => clearInterval(timer);
  }, [game.playing]);
  const message = parkAnnouncement({guests:game.guests, queueStats:game.visitorStats?.queueStats, incidents:game.incidents,
    waterQuality:game.waterQualityAvg, avgMood:game.visitorStats?.avgMood, weather:typeof game.weather === "string" ? game.weather : game.weather?.id || ""}, turn);
  const event = game.parkLife?.pendingEvent;
  const inspection = game.parkLife?.pendingInspection;
  const actionNeeded = !!(event || inspection);
  const announcement = inspection ? "📋 Your park inspector has arrived. Tap here for the report!" : event ? "🎭 Surprise event! Management has been summoned. Tap for decisions." : message.text;
  return <aside className="park-radio" data-expanded={expanded} data-action-needed={actionNeeded} aria-label="Park radio">
    <button type="button" onClick={() => actionNeeded ? onOpenParkLife?.() : setExpanded(v => !v)} aria-expanded={actionNeeded ? undefined : expanded} aria-label={actionNeeded ? "Open Park Life and respond to new alert" : expanded ? "Collapse park announcement" : "Read park announcement"}>
      <Radio size={16}/><strong>Park radio</strong><span>{announcement}</span>{actionNeeded ? <span className="park-radio-action-label">View</span> : expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
    </button>
  </aside>;
}
