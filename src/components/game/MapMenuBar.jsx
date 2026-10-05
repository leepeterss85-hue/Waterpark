import React from "react";
import { Hammer, Settings, Users, Save, Activity, CloudSun } from "lucide-react";

const MENUS = [
  { key: "build", icon: Hammer, label: "Build" },
  { key: "manage", icon: Settings, label: "Manage" },
  { key: "staff", icon: Users, label: "Staff" },
  { key: "save", icon: Save, label: "Save" },
  { key: "info", icon: Activity, label: "Activity" },
  { key: "conditions", icon: CloudSun, label: "Weather" },
];

export default function MapMenuBar({ openSheet, onOpen, missionsBadge = 0, incidentBadge = 0 }) {
  return (
    <div className="game-control-bar absolute bottom-1.5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 p-1 sm:gap-1 sm:p-1.5">
      {MENUS.map((m) => {
        const Icon = m.icon;
        const active = openSheet === m.key;
        const badge = m.key === "info" ? missionsBadge : m.key === "manage" ? incidentBadge : 0;
        return (
          <button
            key={m.key}
            onClick={() => onOpen(active ? null : m.key)}
            title={m.label}
            className={
              "relative flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 transition active:scale-95 sm:px-2.5 sm:py-1.5 " +
              (active
                ? "bg-emerald-400 text-slate-900 shadow-md"
                : "text-white/85 hover:bg-white/15 hover:text-white")
            }
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            <span className="text-[8px] font-bold tracking-wide sm:text-[9px]">{m.label}</span>
            {badge > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-slate-900 shadow ring-2 ring-emerald-950">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}