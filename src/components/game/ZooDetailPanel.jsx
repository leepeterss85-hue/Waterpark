import React from "react";
import { X, PawPrint, ArrowUpCircle, HeartPulse, Sparkles, Users } from "lucide-react";
import { MAX_UPGRADE, upgradeCost, getParkItem } from "@/data/gameData";
import { getIcon } from "./icons";

export default function ZooDetailPanel({ itemId, level = 0, money = 0, zookeepers = 0, onUpgrade, onSell, onClose }) {
  const item = getParkItem(itemId);
  if (!item || item.parkType !== "zoo") return null;
  const Icon = getIcon(item.icon);
  const cost = upgradeCost(item.cost, level);
  const care = Math.min(100, (item.welfare || 80) + level * 1.5 + zookeepers * 3);
  const careLabel = care >= 95 ? "Excellent" : care >= 85 ? "Good" : care >= 70 ? "Needs attention" : "At risk";
  return <section className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-emerald-100">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3"><div className={"grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br " + item.color}>{Icon && <Icon className="h-6 w-6 text-white" />}</div><div><h3 className="font-extrabold text-slate-900">{item.name}</h3><p className="text-xs font-semibold text-emerald-700">{item.animal}</p></div></div>
      <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={17}/></button>
    </div>
    <p className="text-sm leading-5 text-slate-600">{item.description}</p>
    <div className="my-4 grid grid-cols-2 gap-2">
      <div className="rounded-xl bg-emerald-50 p-3"><div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700"><HeartPulse size={13}/> Animal welfare</div><div className="mt-1 text-xl font-black text-slate-800">{Math.round(care)}%</div><div className="text-[10px] font-bold text-emerald-800">{careLabel}</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{width: care + "%"}} /></div></div>
      <div className="rounded-xl bg-sky-50 p-3"><div className="flex items-center gap-1 text-[10px] font-black uppercase text-sky-700"><Users size={13}/> Visitor capacity</div><div className="mt-1 text-xl font-black text-slate-800">{Math.round((item.capacity || 0) * (1 + level * .2))}</div><div className="text-[10px] text-slate-500">visitors per day</div></div>
    </div>
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 px-3">
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Construction</span><b>£{item.cost.toLocaleString()}</b></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Daily income</span><b>£{Math.round(item.income * (1 + level * .15)).toLocaleString()}</b></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Daily care & upkeep</span><b>£{Math.round(item.maintenance * (1 + level * .1)).toLocaleString()}</b></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Habitat upgrade</span><b>Level {level}/{MAX_UPGRADE}</b></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Zookeepers employed</span><b>{zookeepers}</b></div>
    </div>
    <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><PawPrint size={14} className="mr-1 inline"/> Upgrades improve habitat capacity, income, viewing areas and enrichment. Hire and train zookeepers to improve care. A veterinary hospital and conservation centre help round out your wildlife park.</div>
    {level < MAX_UPGRADE ? <button onClick={onUpgrade} disabled={money < cost} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"><ArrowUpCircle size={17}/> Upgrade habitat · £{cost.toLocaleString()} <span className="text-emerald-100">(+20% capacity / +15% income)</span></button> : <div className="mt-3 rounded-xl bg-amber-50 p-3 text-center text-sm font-extrabold text-amber-800"><Sparkles size={15} className="mr-1 inline"/> Legendary habitat — fully upgraded</div>}
    <button onClick={onSell} className="mt-3 w-full rounded-xl bg-rose-50 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100">Sell habitat · £{Math.floor(item.cost * .5).toLocaleString()}</button>
  </section>;
}
