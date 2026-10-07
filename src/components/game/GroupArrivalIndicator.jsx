import React from "react";
import { Bus } from "lucide-react";

// Shows a bus + headcount at the park entrance when accepted group bookings
// are queued to arrive tomorrow. Makes the group-booking decision visible on the map.
export default function GroupArrivalIndicator({ acceptedBookings = [], entranceIndex = 0, rows = 6 }) {
  if (!acceptedBookings.length) return null;
  const total = acceptedBookings.reduce((s, b) => s + (b.size || 0), 0);
  if (total <= 0) return null;
  const col = entranceIndex % 8;
  const row = Math.floor(entranceIndex / 8);
  const left = (col + 0.5) / 8 * 100;
  const top = (row + 0.15) / rows * 100;
  return (
    <div className="group-arrival-indicator" style={{ left: `${left}%`, top: `${top}%` }} title={`${total} group guests arriving tomorrow`}>
      <span className="group-arrival-bus"><Bus className="h-3.5 w-3.5" /></span>
      <span className="group-arrival-count">+{total}</span>
    </div>
  );
}