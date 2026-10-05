import React from "react";
import { Crown, Utensils, Flower2, ShoppingBag, Gamepad2 } from "lucide-react";

const ICONS = { Crown, Utensils, Flower2, ShoppingBag, Gamepad2 };

export default function ResortFacilities({ facilities }) {
  const entries = Object.entries(facilities).filter(([, cat]) => cat.count > 0);
  if (!entries.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-[10px] font-bold text-slate-400">No resort facilities yet.</p>
        <p className="mt-1 text-[9px] text-slate-400">Build restaurants, spas, shops and entertainment to enhance your resort.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {entries.map(([key, cat]) => {
        const Icon = ICONS[cat.icon] || Crown;
        const names = cat.items.map((i) => i.name).slice(0, 3).join(", ");
        return (
          <div key={key} className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 ring-1 ring-slate-100">
            <div className={"grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br " + cat.color}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black text-slate-700">{cat.name}</div>
              <div className="truncate text-[9px] font-semibold text-slate-400">
                {names}{cat.items.length > 3 ? ` +${cat.items.length - 3} more` : ""}
              </div>
            </div>
            <div className="grid h-7 min-w-7 place-items-center rounded-full bg-slate-100 px-1.5 text-xs font-black text-slate-600">
              {cat.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}