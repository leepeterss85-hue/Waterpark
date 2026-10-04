import React from "react";

export default function RideStatus({ incident, queueConnected, queueWait, movement, capacity, condition, level }) {
  const status = incident?.type === "breakdown" ? "CLOSED" : incident?.type === "maintenance" ? "MAINT" : movement > capacity * .8 ? "BUSY" : "OPEN";
  return <>
    <div className="park-ride-status"><span>{queueConnected === false ? "ADD QUEUE" : queueWait > 0 ? `${queueWait}m wait` : ""}</span><b data-status={status}>{status}</b></div>
    {condition < 75 && <span className="park-condition-badge" title={`Ride condition ${Math.round(condition)}%`}>⚙ {Math.round(condition)}%</span>}
    {level > 0 && <span className="park-level-badge">LV {level}</span>}
  </>;
}