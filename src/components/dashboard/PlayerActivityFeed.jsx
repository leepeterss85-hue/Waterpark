import React, { useMemo, useState, useEffect } from "react";
import {
  Activity,
  Trash2,
  Hammer,
  ArrowUpCircle,
  Tag,
  Save,
  Upload,
  UserPlus,
  UserMinus,
  Maximize,
  Medal,
  RotateCcw,
  CalendarDays,
} from "lucide-react";
import { readActivityLog, clearActivityLog } from "@/lib/gameAnalytics";
import { getParkItem, STAFF } from "@/data/gameData";
import { formatDistanceToNow } from "date-fns";

const ICONS = {
  attraction_built: Hammer,
  attraction_upgraded: ArrowUpCircle,
  attraction_sold: Tag,
  park_saved: Save,
  park_loaded: Upload,
  staff_hired: UserPlus,
  staff_fired: UserMinus,
  park_expanded: Maximize,
  mission_claimed: Medal,
  park_reset: RotateCcw,
  day_advanced: CalendarDays,
};

function describe(eventName, props) {
  const p = props || {};
  switch (eventName) {
    case "attraction_built":
      return `Built ${getParkItem(p.id)?.name ?? p.id}`;
    case "attraction_upgraded":
      return `Upgraded ${getParkItem(p.id)?.name ?? p.id} to Lv ${p.level}`;
    case "attraction_sold":
      return `Sold ${getParkItem(p.id)?.name ?? p.id}`;
    case "park_saved":
      return `Saved park "${p.name}"`;
    case "park_loaded":
      return `Loaded park "${p.name}"`;
    case "staff_hired":
      return `Hired a ${STAFF[p.type]?.name ?? p.type}`;
    case "staff_fired":
      return `Let go of a ${STAFF[p.type]?.name ?? p.type}`;
    case "park_expanded":
      return `Expanded park — ${p.expansions} expansion${p.expansions === 1 ? "" : "s"}`;
    case "mission_claimed":
      return `Claimed mission "${p.id}"`;
    case "park_reset":
      return "Reset the park";
    case "day_advanced":
      return "Advanced to the next day";
    default:
      return eventName;
  }
}

export default function PlayerActivityFeed() {
  const [log, setLog] = useState([]);

  useEffect(() => {
    const refresh = () => setLog(readActivityLog());
    refresh();
    const i = setInterval(refresh, 4000);
    return () => clearInterval(i);
  }, []);

  const items = useMemo(() => log.slice(0, 14), [log]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-800">
          <Activity className="h-5 w-5 text-cyan-500" /> Player Activity
        </h2>
        {log.length > 0 && (
          <button
            onClick={() => {
              clearActivityLog();
              setLog([]);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-400">
        A live feed of the park owner's actions — builds, upgrades, staffing and saves.
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl bg-sky-50 p-4 text-sm text-slate-500 ring-1 ring-sky-100">
          No activity yet. Build, upgrade or manage your park and the actions will show up here.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((e, i) => {
            const Icon = ICONS[e.eventName] || Activity;
            return (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-slate-50/70 px-3 py-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-cyan-600 ring-1 ring-slate-200">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-700">
                    {describe(e.eventName, e.properties)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDistanceToNow(new Date(e.at), { addSuffix: true })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}