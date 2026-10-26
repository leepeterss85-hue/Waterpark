import React from "react";
import { Activity, Heart, ShieldCheck, Timer, Waves } from "lucide-react";
import { getParkItem } from "@/data/gameData";

/**
 * Read-only visitor pulse: all values come from actual park statistics.
 * No new timers, fetches, score changes, costs or saved-game fields.
 */
export default function ParkActivityPulse({ guests = 0, avgMood = 0, queueStats = {}, grid = [], incidents = [], lifeguardTotal = 0, graphicsQuality = "ultra" }) {
  const openRides = grid.filter(id => getParkItem(id)?.category === "attraction").length;
  const queueValues = Object.values(queueStats || {}).map(queue => Number(queue?.wait || 0)).filter(Number.isFinite);
  const longestWait = Math.max(0, ...queueValues);
  const breakdowns = (incidents || []).filter(incident => incident?.type === "breakdown").length;
  const danger = breakdowns > 0 || longestWait >= 18;
  const mood = Math.max(0, Math.min(100, Math.round(Number(avgMood) || 0)));

  return <div className="park-activity-pulse" data-park-pulse data-quality={graphicsQuality}
    aria-label="Live activity and operating conditions in your water park">
    <span className="park-pulse-led" aria-hidden="true" />
    <span className="park-pulse-title"><Activity size={13} /> PARK LIVE</span>
    <span title="Attractions built"><Waves size={13} /> {openRides} rides</span>
    <span title="Average visitor happiness"><Heart size={13} /> {guests > 0 ? mood + "% happy" : "Waiting for guests"}</span>
    <span className={danger ? "park-pulse-warning" : ""} title="Longest queue today"><Timer size={13} /> {queueValues.length ? longestWait + "m queue" : "No queues"}</span>
    <span title="Lifeguards on duty and broken-down rides"><ShieldCheck size={13} /> {breakdowns ? breakdowns + " ride alerts" : lifeguardTotal + " lifeguards"}</span>
  </div>;
}
