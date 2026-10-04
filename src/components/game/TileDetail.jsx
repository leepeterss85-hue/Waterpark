import React from "react";
import { X, ArrowUpCircle, Wrench, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { getAttraction, MAX_UPGRADE, upgradeCost } from "@/data/gameData";
import { getIcon } from "./icons";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export function TileDetailPanel({ gridIndex, attractionId, level = 0, money = 0, incident = null, guests = 0, onUpgrade, onSell, onClose }) {
  if (gridIndex == null || !attractionId) return null;
  const attr = getAttraction(attractionId);
  const Icon = attr ? getIcon(attr.icon) : null;
  if (!attr) return null;
  const maxed = level >= MAX_UPGRADE;
  const cost = upgradeCost(attr.cost, level);
  const canAfford = money >= cost;\n  const status = incident?.type === "breakdown" ? "Broken down" : incident?.type === "maintenance" ? "Maintenance required" : "Operational";\n  const statusClass = incident ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200";\n  const statusIcon = incident ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />;\n  const effectiveCapacity = Math.round((attr.capacity || 0) * (1 + level * 0.2));\n  const estimatedLoad = attr.capacity ? Math.min(100, Math.round((guests / Math.max(1, effectiveCapacity)) * 100)) : 0;
  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-100">
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
      <p className="mb-3 text-sm text-slate-500">{attr.description}</p>\n      <div className={`mb-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-extrabold ring-1 ${statusClass}`}>\n        <div className="flex items-center gap-1.5">{statusIcon}{status}</div>\n        {incident?.type === "breakdown" ? <span>Needs mechanic</span> : incident?.type === "maintenance" ? <span>Needs cleaning</span> : <span>Ready for guests</span>}\n      </div>
      <div className="divide-y divide-slate-100">
        <Row label="Build cost" value={`$${attr.cost.toLocaleString()}`} />
        <Row label="Daily income" value={`$${attr.income.toLocaleString()}`} />
        <Row label="Upkeep" value={`$${attr.maintenance.toLocaleString()}`} />
        {attr.capacity > 0 && <Row label="Capacity" value={`${effectiveCapacity} riders/day`} />}\n        {attr.capacity > 0 && <Row label="Current park load" value={<span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{estimatedLoad}%</span>} />}
        {attr.fun > 0 && <Row label="Fun rating" value={`${attr.fun}/10`} />}
        <Row label="Upgrade level" value={maxed ? `Lv ${level} (max)` : `Lv ${level} / ${MAX_UPGRADE}`} />
      </div>
      {incident && <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-bold text-white"><Wrench className="h-3.5 w-3.5 text-amber-300" /> Staff will restore this attraction during the next operating cycle.</div>}\n      {!maxed ? (
        <div className="mt-3 rounded-xl bg-sky-50 p-3 ring-1 ring-sky-100">
          <div className="mb-2 text-xs text-slate-500">
            Next level: <span className="font-semibold text-slate-700">+20% capacity · +15% income</span>
          </div>
          <button
            onClick={onUpgrade}
            disabled={!canAfford}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-40"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade · ${cost.toLocaleString()}
          </button>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-amber-50 p-2 text-center text-xs font-semibold text-amber-600 ring-1 ring-amber-100">
          Fully upgraded
        </div>
      )}
      <button
        onClick={onSell}
        className="mt-4 w-full rounded-xl bg-rose-50 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100"
      >
        Sell (refund ${Math.floor(attr.cost * 0.5).toLocaleString()})
      </button>
    </div>
  );
}