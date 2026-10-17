import React from "react";
import { X, PawPrint, ArrowUpCircle, HeartPulse, Sparkles, Users, Utensils, Stethoscope, Baby, Leaf } from "lucide-react";
import { MAX_UPGRADE, upgradeCost, getParkItem } from "@/data/gameData";
import { createZooRecord, getHabitatAssessment, HABITAT_FEATURES } from "@/data/zooSimulation";
import { getIcon } from "./icons";

const Meter = ({ label, value, color = "bg-emerald-500" }) => (
  <div>
    <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-600"><span>{label}</span><span>{Math.round(value)}%</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
  </div>
);

export default function ZooDetailPanel({
  itemId, tileIndex, animalState, level = 0, money = 0, zookeepers = 0, availableKeepers = 0, hasVet = false, hasConservation = false, sandbox = false,
  onUpgrade, onSell, onClose, onFeed, onSchedule, onToggleBreeding, onTreat, onAssignKeepers, onUpgradeFeature,
}) {
  const item = getParkItem(itemId);
  if (!item || item.parkType !== "zoo") return null;
  const isHabitat = !["wildlife_vet", "conservation_centre"].includes(itemId);
  const animal = animalState || createZooRecord(itemId);
  const Icon = getIcon(item.icon);
  const cost = upgradeCost(item.cost, level);
  const care = animal.welfare ?? item.welfare ?? 80;
  const careLabel = care >= 90 ? "Excellent" : care >= 75 ? "Good" : care >= 55 ? "Needs attention" : "At risk";
  const treatmentCost = 1200 + Math.max(1, animal.population || 1) * 120;
  const habitat = getHabitatAssessment(itemId, animal, level, hasVet, hasConservation);
  const features = Array.isArray(animal.habitatFeatures) ? animal.habitatFeatures : [];
  return <section className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3"><div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${item.color}`}>{Icon && <Icon className="h-6 w-6 text-white" />}</div><div><h3 className="font-extrabold text-slate-900">{item.name}</h3><p className="text-xs font-semibold text-emerald-700">{item.animal || "Wildlife care facility"}</p></div></div>
      <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={17}/></button>
    </div>
    <p className="text-sm leading-5 text-slate-600">{item.description}</p>
    {isHabitat ? <>
      <div className="my-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-50 p-3"><div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700"><HeartPulse size={13}/> Animal welfare</div><div className="mt-1 text-xl font-black text-slate-800">{Math.round(care)}%</div><div className="text-[10px] font-bold text-emerald-800">{careLabel}</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{width: care + "%"}} /></div></div>
        <div className="rounded-xl bg-sky-50 p-3"><div className="flex items-center gap-1 text-[10px] font-black uppercase text-sky-700"><Users size={13}/> Animal population</div><div className="mt-1 text-xl font-black text-slate-800">{animal.population || 0}</div><div className="text-[10px] text-slate-500">animals in habitat</div><div className="text-[10px] font-bold text-emerald-700">+{animal.births || 0} births · {animal.deaths || 0} losses</div></div>
      </div>
      <div className="my-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
        <div className="flex items-center justify-between gap-2"><div className="text-sm font-extrabold text-emerald-950">Habitat suitability</div><div className={`rounded-full px-2 py-1 text-xs font-black ${habitat.score >= 80 ? "bg-emerald-100 text-emerald-800" : habitat.score >= 55 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>{habitat.score}%</div></div>
        <p className="mt-1 text-[11px] text-emerald-900">{habitat.note}</p>
        <div className="mt-2 space-y-1">{habitat.requirements.map((featureId) => { const feature = HABITAT_FEATURES[featureId]; const built = features.includes(featureId); return <div key={featureId} className="flex items-center justify-between gap-2 text-xs"><span className={built ? "text-emerald-800" : "text-rose-700"}>{built ? "✓" : "○"} {feature.label}</span>{!built && <button onClick={() => onUpgradeFeature?.(tileIndex, featureId)} disabled={!sandbox && money < feature.cost} className="rounded-md bg-white px-2 py-1 font-bold text-emerald-800 ring-1 ring-emerald-200 disabled:opacity-40">Add · £{feature.cost.toLocaleString()}</button>}</div>; })}</div>
        {habitat.missing.length === 0 && <p className="mt-2 text-xs font-bold text-emerald-800">All core species habitat requirements met.</p>}
      </div>
      <div className="my-3 rounded-xl border border-sky-100 bg-sky-50/60 p-3">
        <div className="mb-1 flex items-center gap-2 text-sm font-extrabold text-sky-950"><Users size={15}/> Keeper assignment</div>
        <p className="mb-2 text-[11px] text-sky-900">This species normally needs {habitat.preferredKeepers} keeper(s) assigned for full daily care. {availableKeepers} unassigned keeper(s) available.</p>
        <select value={Math.min(Number(animal.keepersAssigned) || 0, zookeepers)} onChange={(e) => onAssignKeepers?.(tileIndex, Number(e.target.value))} className="w-full rounded-lg border border-sky-200 bg-white p-2 text-sm font-semibold text-slate-700">
          {Array.from({ length: Math.min(zookeepers, availableKeepers + (Number(animal.keepersAssigned) || 0)) + 1 }, (_, index) => <option key={index} value={index}>{index} keeper(s) assigned to this habitat</option>)}
        </select>
      </div>
      <div className="space-y-3 rounded-xl border border-slate-100 p-3">
        <Meter label="Health" value={animal.health ?? 100} color={(animal.health ?? 100) < 50 ? "bg-rose-500" : "bg-emerald-500"} />
        <Meter label="Fullness" value={animal.hunger ?? 92} color={(animal.hunger ?? 92) < 35 ? "bg-amber-500" : "bg-lime-500"} />
        <Meter label="Enrichment" value={animal.enrichment ?? 65} color="bg-violet-500" />
        <div className={`rounded-lg p-2 text-xs font-bold ${animal.disease ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{animal.disease ? `⚠ Illness: ${animal.disease} · ${animal.diseaseDays || 0} day(s)` : "✓ No illness detected"}</div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-100 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"><Utensils size={16} className="text-amber-600"/> Feeding plan</div>
        <select value={animal.feedingSchedule || "daily"} onChange={(e) => onSchedule?.(tileIndex, e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-semibold text-slate-700">
          <option value="twice_daily">Twice daily · best welfare, higher cost</option>
          <option value="daily">Daily · recommended</option>
          <option value="manual">Manual feeding · lowest cost, higher risk</option>
        </select>
        <button onClick={() => onFeed?.(tileIndex)} disabled={!sandbox && money < Math.max(1, animal.population || 1) * 18} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-sm font-extrabold text-white disabled:opacity-40"><Utensils size={15}/> Feed animals now</button>
        <button onClick={() => onToggleBreeding?.(tileIndex)} className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold ${animal.breeding === false ? "bg-slate-100 text-slate-700" : "bg-pink-50 text-pink-800"}`}><Baby size={15}/>{animal.breeding === false ? "Breeding paused" : "Breeding enabled"} · tap to change</button>
        <button onClick={() => onTreat?.(tileIndex)} disabled={(!animal.disease && (animal.health ?? 100) >= 90) || (!sandbox && money < treatmentCost)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 py-2 text-sm font-extrabold text-white disabled:opacity-40"><Stethoscope size={15}/> Veterinary treatment · £{treatmentCost.toLocaleString()}</button>
      </div>
    </> : <div className="my-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900"><Leaf size={16} className="mr-1 inline"/> {itemId === "wildlife_vet" ? "Provides daily veterinary support, reduces illness risk and speeds recovery across every animal habitat." : "Improves animal welfare and conservation outcomes, helping breeding programmes and habitat care."}</div>}
    <div className="my-3 divide-y divide-slate-100 rounded-xl border border-slate-100 px-3">
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Construction</span><b>£{item.cost.toLocaleString()}</b></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Daily income</span><b>£{Math.round(item.income * (1 + level * .15)).toLocaleString()}</b></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Daily upkeep</span><b>£{Math.round(item.maintenance * (1 + level * .1)).toLocaleString()}</b></div>
      <div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Upgrade level</span><b>{level}/{MAX_UPGRADE}</b></div>
      {isHabitat && <><div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Zookeepers employed</span><b>{zookeepers}</b></div><div className="flex justify-between py-2 text-sm"><span className="text-slate-500">Assigned here</span><b>{animal.keepersAssigned || 0}</b></div></>}
    </div>
    <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><PawPrint size={14} className="mr-1 inline"/> Upgrades increase habitat capacity and income, improve care efficiency and raise breeding capacity. Daily food and veterinary costs are included in your park accounts.</div>
    {level < MAX_UPGRADE ? <button onClick={onUpgrade} disabled={money < cost} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"><ArrowUpCircle size={17}/> Upgrade · £{cost.toLocaleString()}</button> : <div className="mt-3 rounded-xl bg-amber-50 p-3 text-center text-sm font-extrabold text-amber-800"><Sparkles size={15} className="mr-1 inline"/> Legendary habitat — fully upgraded</div>}
    <button onClick={onSell} className="mt-3 w-full rounded-xl bg-rose-50 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100">Sell habitat · £{Math.floor(item.cost * .5).toLocaleString()}</button>
  </section>;
}
