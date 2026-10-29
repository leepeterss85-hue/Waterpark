import React from "react";
import { Hammer, Settings, Users, Grid3x3, ChevronUp, Gamepad2 } from "lucide-react";

const PRIMARY = [
  { key: "build", icon: Hammer, label: "Build", tutorialTarget: "build" },
  { key: "manage", icon: Settings, label: "Manage", tutorialTarget: "manage" },
  { key: "staff", icon: Users, label: "Staff", tutorialTarget: "staff" },
  { key: "gameModes", icon: Gamepad2, label: "Modes", tutorialTarget: "gameModes" },
];

export default function MapMenuBar({ openSheet, onOpen, missionsBadge = 0, incidentBadge = 0 }) {
  const isHubOpen = openSheet === "menu";
  const handleOpen = (key) => onOpen(openSheet === key ? null : key);
  return (
    <nav className="park-menu-bar" aria-label="Park controls">
      <div className="park-menu-row">
        {PRIMARY.map((m) => {
          const Icon = m.icon;
          const active = openSheet === m.key;
          const badge = m.key === "manage" ? incidentBadge : 0;
          return <button key={m.key} type="button" onClick={() => handleOpen(m.key)} title={m.label} aria-label={m.label}
            aria-expanded={active} className={"park-menu-button" + (active ? " is-active" : "")}
            data-tutorial-target={m.tutorialTarget || undefined}>
            <Icon className="park-menu-icon" strokeWidth={2.5}/>
            <span className="park-menu-label">{m.label}</span>
            {badge > 0 && <span className="park-menu-badge">{badge}</span>}
          </button>;
        })}
        <button type="button" onClick={() => handleOpen("menu")} title="More park tools" aria-label="More park tools"
          aria-expanded={isHubOpen} className={"park-menu-button park-menu-more" + (isHubOpen ? " is-active" : "")}>
          {isHubOpen ? <ChevronUp className="park-menu-icon" strokeWidth={2.5}/> : <Grid3x3 className="park-menu-icon" strokeWidth={2.5}/>}
          <span className="park-menu-label">{isHubOpen ? "Close" : "More"}</span>
          {missionsBadge > 0 && !isHubOpen && <span className="park-menu-badge">{missionsBadge}</span>}
        </button>
      </div>
    </nav>
  );
}
