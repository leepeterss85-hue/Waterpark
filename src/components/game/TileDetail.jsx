import React from "react";
import { X, ArrowUpCircle, Wrench, CheckCircle2, AlertTriangle, Users, Clock, Flame, Sparkles, TrendingUp } from "lucide-react";
import { getAttraction, getAttractionProfile, MAX_UPGRADE, upgradeCost } from "@/data/gameData";
import { popularityLabel } from "@/data/popularity";
import { getIcon } from "./icons";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export function TileDetailPanel({ gridIndex, attractionId, level = 0, money = 0, incident = null, condition = 100, guests = 0, queueWait = 0, lifeguards = 0, movementCount = 0, totalVisits = 0, popularityScore = null, trendBoost = 0, onUpgrade, onSell, onClose }) {
  if (gridIndex == null || !attractionId) return null;
  const attr = getAttraction(attractionId);
  const profile = getAttractionProfile(attractionId);
  const Icon = attr ? getIcon(attr.icon) : null;
  if (!attr) return null;
  const maxed = level >= MAX_UPGRADE;
  const cost = upgradeCost(attr.cost, level);
  const canAfford = money >= cost;
  const status = incident?.type === "breakdown" ? "Broken down" : incident?.type === "maintenance" ? "Maintenance required" : "Operational";
  const statusClass = incident ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200";
  const statusIcon = incident ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />;
  const effectiveCapacity = Math.round((attr.capacity || 0) * (1 + level * 0.2));
  const estimatedLoad = attr.capacity ? Math.min(100, Math.round((guests / Math.max(1, effectiveCapacity)) * 100)) : 0;
  const visitShare = totalVisits ? Math.min(100, Math.round((movementCount / totalVisits) * 100)) : 0;
  const popScore = popularityScore != null ? popularityScore : null;
  const popMeta = popScore != null ? popularityLabel(popScore) : null;
  const isTrendy = trendBoost > 18;
  const isHot = trendBoost > 6 && !isTrendy;
  const guardGap = Math.max(0, (profile?.lifeguards || 0) - lifeguards);
  const conditionValue = Math.max(0, Math.min(100, Math.round(condition)));
  const conditionLabel = conditionValue >= 75 ? "Excellent" : conditionValue >= 50 ? "Good" : conditionValue >= 30 ? "Worn" : "Critical";
  const conditionClass = conditionValue >= 75 ? "bg-emerald-500" : conditionValue >= 50 ? "bg-lime-500" : conditionValue >= 30 ? "bg-amber-500" : "bg-rose-500";\n  const upgradeTier = level >= 10 ? "Legendary" : level >= 7 ? "Elite" : level >= 5 ? "Premium" : level >= 3 ? "Enhanced" : "Standard";\n  const upgradeBonus = { capacity: Math.round(level * 20), income: Math.round(level * 15), maintenance: Math.max(0, Math.round(level * 3)) };
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
      <p className="mb-3 text-sm text-slate-500">{attr.description}</p>
      <div className={`mb-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-extrabold ring-1 ${statusClass}`}>
        <div className="flex items-center gap-1.5">{statusIcon}{status}</div>
        {incident?.type === "breakdown" ? <span>Needs mechanic</span> : incident?.type === "maintenance" ? <span>Needs cleaning</span> : <span>Ready for guests</span>}
      </div>
      <div className="mb-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100"><div className="flex items-center justify-between text-xs font-extrabold"><span className="text-slate-500">Ride condition</span><span className="text-slate-800">{conditionValue}% · {conditionLabel}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className={"h-full rounded-full transition-all " + conditionClass} style={{ width: conditionValue + "%" }} /></div><div className="mt-1 text-[9px] text-slate-400">Use causes wear. Mechanics restore condition during operating cycles.</div></div><div className="divide-y divide-slate-100">
        <Row label="Build cost" value={`$${attr.cost.toLocaleString()}`} />
        <Row label="Daily income" value={`$${attr.income.toLocaleString()}`} />
        <Row label="Upkeep" value={`$${attr.maintenance.toLocaleString()}`} />
        {attr.capacity > 0 && <Row label="Capacity" value={`${effectiveCapacity} riders/day`} />}
        {attr.capacity > 0 && <Row label="Current park load" value={<span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{estimatedLoad}%</span>} />}
        {attr.capacity > 0 && <Row label="Estimated queue" value={<span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{queueWait ? `${queueWait} min` : "Low / none"}</span>} />}
        {attr.capacity > 0 && <Row label="Today's visits" value={`${Math.round(movementCount)} (${visitShare}% of all)`} />}
        {attr.capacity > 0 && popScore != null && (
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="flex items-center gap-1 text-slate-400"><Flame className="h-3 w-3" />Popularity</span>
            <span className="flex items-center gap-1.5">
              {isTrendy && <span className="inline-flex items-center gap-0.5 rounded-full bg-fuchsia-100 px-1.5 py-0.5 text-[9px] font-black text-fuchsia-700"><Sparkles className="h-2.5 w-2.5" />NEW</span>}
              {isHot && <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-700"><TrendingUp className="h-2.5 w-2.5" />HOT</span>}
              <span className={"font-semibold " + (popMeta?.tone || "text-slate-700")}>{Math.round(popScore)}%</span>
            </span>
          </div>
        )}
        {attr.capacity > 0 && popScore != null && (
          <div className="-mt-1 mb-1 pl-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className={"h-full rounded-full " + (popMeta?.dot || "bg-slate-400")} style={{ width: popScore + "%" }} />
            </div>
            {popMeta && <div className="mt-1 text-[9px] font-semibold text-slate-400">{popMeta.label} · popular rides earn more and draw more guests</div>}
          </div>
        )}
        {attr.capacity > 0 && <Row label="Safety" value={`${profile?.safety || "Medium"} · ${lifeguards}/${profile?.lifeguards || 1} guards`} />}
        {attr.fun > 0 && <Row label="Fun rating" value={`${attr.fun}/10`} />}
        <Row label="Upgrade level" value={<span className="font-semibold">{upgradeTier} · Lv {level}/{MAX_UPGRADE}</span>} />
      </div>
{guardGap > 0 && <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold text-red-700 ring-1 ring-red-100"><AlertTriangle className="h-3.5 w-3.5" /> Add {guardGap} more lifeguard{guardGap > 1 ? "s" : ""} for full safety coverage.</div>}
            {incident && <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-bold text-white"><Wrench className="h-3.5 w-3.5 text-amber-300" /> Staff will restore this attraction during the next operating cycle.</div>}
      {!maxed ? (
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