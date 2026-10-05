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
    <div className="absolute right-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 sm:right-3">
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
              "group relative grid h-14 w-14 place-items-center rounded-2xl shadow-xl ring-1 backdrop-blur transition active:scale-95 sm:h-16 sm:w-16 " +
              (active
                ? "bg-cyan-500 text-white ring-cyan-300"
                : "bg-slate-900/90 text-white/90 ring-white/15 hover:scale-105 hover:bg-slate-800")
            }
          >
            <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
            <span className="pointer-events-none absolute right-full mr-2 hidden whitespace-nowrap rounded-lg bg-slate-900/95 px-2.5 py-1 text-xs font-bold text-white shadow-lg group-hover:block">
              {m.label}
            </span>
            {badge > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow ring-2 ring-white">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}