import React, { useState } from "react";
import { Hammer, Settings, Users, Activity, CloudSun, FlaskConical, SlidersHorizontal, Hotel, Flame, CalendarDays, Ticket, Trophy, Share2, Siren, HardHat, Wallet, Crown, Swords, Droplets, Medal, Link2, MapPin, Star, Clock, Wrench, Grid3x3, ChevronUp } from "lucide-react";

const PRIMARY = [
  { key: "build", icon: Hammer, label: "Build" },
  { key: "manage", icon: Settings, label: "Manage" },
  { key: "staff", icon: Users, label: "Staff" },
  { key: "research", icon: FlaskConical, label: "Research" },
  { key: "economy", icon: Wallet, label: "Economy" },
];

const SECONDARY = [
  { key: "construction", icon: HardHat, label: "Projects" },
  { key: "events", icon: CalendarDays, label: "Events" },
  { key: "waterQuality", icon: Droplets, label: "Quality" },
  { key: "resort", icon: Hotel, label: "Resort" },
  { key: "trends", icon: Flame, label: "Trends" },
  { key: "conditions", icon: CloudSun, label: "Weather" },
  { key: "rideAging", icon: Wrench, label: "Aging" },
  { key: "districts", icon: MapPin, label: "Districts" },
  { key: "empire", icon: Crown, label: "Empire" },
  { key: "competitors", icon: Swords, label: "Rivals" },
  { key: "leaderboard", icon: Medal, label: "Ranks" },
  { key: "share", icon: Link2, label: "Share" },
  { key: "vipGuests", icon: Star, label: "VIPs" },
  { key: "memberships", icon: Ticket, label: "Members" },
  { key: "awards", icon: Trophy, label: "Awards" },
  { key: "social", icon: Share2, label: "Social" },
  { key: "seasonalCalendar", icon: Clock, label: "Calendar" },
  { key: "emergencies", icon: Siren, label: "SOS" },
  { key: "info", icon: Activity, label: "Activity" },
  { key: "settings", icon: SlidersHorizontal, label: "Settings" },
];

export default function MapMenuBar({ openSheet, onOpen, missionsBadge = 0, incidentBadge = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const isSecondaryOpen = SECONDARY.some((m) => m.key === openSheet);

  const handleOpen = (key) => {
    onOpen(openSheet === key ? null : key);
    if (expanded && key) setExpanded(false);
  };

  const renderButton = (m, badge = 0) => {
    const Icon = m.icon;
    const active = openSheet === m.key;
    return (
      <button
        key={m.key}
        type="button"
        onClick={() => handleOpen(m.key)}
        title={m.label}
        aria-label={m.label}
        aria-expanded={active}
        className="park-menu-button"
      >
        <Icon className="park-menu-icon" strokeWidth={2.5} />
        <span className="park-menu-label">{m.label}</span>
        {badge > 0 && <span className="park-menu-badge">{badge}</span>}
      </button>
    );
  };

  return (
    <nav className="park-menu-bar" aria-label="Park menus">
      <div className="park-menu-row">
        {PRIMARY.map((m) => {
          const badge = m.key === "manage" ? incidentBadge : 0;
          return renderButton(m, badge);
        })}
        <button
          type="button"
          onClick={() => { setExpanded((e) => !e); if (!expanded) onOpen(null); }}
          title="More menus"
          aria-label="More menus"
          aria-expanded={expanded}
          className={"park-menu-button park-menu-more" + (expanded || isSecondaryOpen ? " is-active" : "")}
        >
          {expanded ? <ChevronUp className="park-menu-icon" strokeWidth={2.5} /> : <Grid3x3 className="park-menu-icon" strokeWidth={2.5} />}
          <span className="park-menu-label">{expanded ? "Close" : "More"}</span>
          {missionsBadge > 0 && !expanded && <span className="park-menu-badge">{missionsBadge}</span>}
        </button>
      </div>
      {expanded && (
        <div className="park-menu-expanded">
          <div className="park-menu-expanded-grid">
            {SECONDARY.map((m) => {
              const badge = m.key === "info" ? missionsBadge : 0;
              return renderButton(m, badge);
            })}
          </div>
        </div>
      )}
    </nav>
  );
}