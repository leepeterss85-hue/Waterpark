import React from "react";
import { Hammer, Settings, Users, Activity, CloudSun, FlaskConical, SlidersHorizontal } from "lucide-react";

const MENUS = [
  { key: "build", icon: Hammer, label: "Build" },
  { key: "research", icon: FlaskConical, label: "Research" },
  { key: "manage", icon: Settings, label: "Manage" },
  { key: "staff", icon: Users, label: "Staff" },
  { key: "info", icon: Activity, label: "Activity" },
  { key: "conditions", icon: CloudSun, label: "Weather" },
  { key: "settings", icon: SlidersHorizontal, label: "Settings" },
];

export default function MapMenuBar({ openSheet, onOpen, missionsBadge = 0, incidentBadge = 0 }) {
  return (
    <nav className="park-menu-row" aria-label="Park menus">
      {MENUS.map((m) => {
        const Icon = m.icon;
        const active = openSheet === m.key;
        const badge = m.key === "info" ? missionsBadge : m.key === "manage" ? incidentBadge : 0;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onOpen(active ? null : m.key)}
            title={m.label}
            aria-label={m.label}
            aria-expanded={active}
            className="park-menu-button"
          >
            <Icon className="park-menu-icon" strokeWidth={2.5} />
            <span className="park-menu-label">{m.label}</span>
            {badge > 0 && (
              <span className="park-menu-badge">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}