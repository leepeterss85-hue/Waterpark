import React from "react";
import { X } from "lucide-react";
import { getAttraction } from "@/data/gameData";
import { getIcon } from "./icons";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export function TileDetailPanel({ gridIndex, attractionId, onSell, onClose }) {
  if (gridIndex == null || !attractionId) return null;
  const attr = getAttraction(attractionId);
  const Icon = attr ? getIcon(attr.icon) : null;
  if (!attr) return null;
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${attr.color}`}>
            {Icon && <Icon className="h-5 w-5 text-white" />}
          </div>
          <div>
            <div className="font-bold text-slate-800">{attr.name}</div>
            <div className="text-xs text-slate-400 capitalize">{attr.category}</div>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-3 text-sm text-slate-500">{attr.description}</p>
      <div className="divide-y divide-slate-100">
        <Row label="Build cost" value={`$${attr.cost.toLocaleString()}`} />
        <Row label="Daily income" value={`$${attr.income.toLocaleString()}`} />
        <Row label="Upkeep" value={`$${attr.maintenance.toLocaleString()}`} />
        {attr.capacity > 0 && <Row label="Capacity" value={attr.capacity} />}
        {attr.fun > 0 && <Row label="Fun rating" value={`${attr.fun}/10`} />}
      </div>
      <button
        onClick={onSell}
        className="mt-4 w-full rounded-xl bg-rose-50 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100"
      >
        Sell (refund ${Math.floor(attr.cost * 0.5).toLocaleString()})
      </button>
    </div>
  );
}