import React, { useMemo } from "react";
import { Activity, CalendarDays, CloudSun, Construction, Hotel, Lightbulb, ShieldCheck, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { ATTRACTIONS, getParkItem } from "@/data/gameData";

const Card = ({ title, icon: Icon, children, tone = "slate" }) => {
  const bg = { slate:"border-slate-200 bg-white", emerald:"border-emerald-100 bg-emerald-50/60", amber:"border-amber-100 bg-amber-50/60", sky:"border-sky-100 bg-sky-50/60", violet:"border-violet-100 bg-violet-50/60", rose:"border-rose-100 bg-rose-50/60", cyan:"border-cyan-100 bg-cyan-50/60" };
  return <section className={"rounded-2xl border p-4 " + (bg[tone] || bg.slate)}><h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900"><Icon className="h-4 w-4" />{title}</h3>{children}</section>;
};

export default function StrategyCentre({
  money=0, day=1, grid=[], history=[], loans=[], incidents=[], waterQualityAvg=100, waterQualityCriticalCount=0,
  uptime=1, safety=1, cleanliness=1, weather, forecast, seasonEvent, researchPoints=0, completedResearch=[],
  hotelStats={}, resortRating=0, hotelGuests=[], constructionProjects=[], awards=[], awardStats={}, socialReputation=50,
  socialPosts=[], activeCalendarEvent=null, reputation=50, popularity=[], popularityTrend=[], visitorStats={}
}) {
  const performance = useMemo(() => {
    const rows = (grid || []).map((id,index) => {
      const item = id ? getParkItem(id) : null;
      if (!item || item.category === "environment" || !item.cost || !item.income) return null;
      return { id,index,name:item.name,cost:item.cost,income:item.income,maintenance:item.maintenance||0 };
    }).filter(Boolean);
    const weight = rows.reduce((s,x)=>s+x.income,0) || 1;
    const rideIncome = history?.[history.length-1]?.rideIncome || 0;
    return rows.map(x => {
      const revenue = Math.round(rideIncome * x.income / weight);
      const contribution = revenue - x.maintenance;
      return { ...x, contribution, roi:x.cost ? contribution / x.cost * 100 : 0 };
    }).sort((a,b)=>b.roi-a.roi);
  }, [grid,history]);

  const advisor = useMemo(() => {
    const risk = incidents.length || waterQualityCriticalCount || safety < .75 || uptime < .75;
    const upgrade = performance.find(x => x.contribution > 0 && x.roi > 2);
    const owned = new Set((grid||[]).filter(Boolean));
    const build = ATTRACTIONS.filter(x => !owned.has(x.id) && x.cost <= money)
      .map(x => ({...x,roi:x.cost ? ((x.income-(x.maintenance||0))/x.cost)*100 : 0}))
      .filter(x => x.roi > 0).sort((a,b)=>b.roi-a.roi)[0];
    if (risk) return { action:"MAINTAIN", title:"Stabilise operations first", text:"Resolve safety, water-quality or incident pressure before spending capital.", tone:"rose" };
    if (upgrade) return { action:"UPGRADE", title:"Upgrade your best return", text:upgrade.name+" is your strongest investment candidate at about "+upgrade.roi.toFixed(1)+"% ROI/day.", tone:"emerald" };
    if (build) return { action:"BUILD", title:"Expand the park", text:build.name+" is the strongest affordable attraction by base return.", tone:"sky" };
    return { action:"SAVE", title:"Protect your cash buffer", text:"No attractive affordable investment is clear yet. Build cash and wait.", tone:"amber" };
  }, [performance,grid,money,incidents.length,safety,uptime,waterQualityCriticalCount]);

  const health = Math.round(Math.max(0,Math.min(100,uptime*25+safety*25+cleanliness*20+(waterQualityAvg/100)*15+Math.max(0,Math.min(100,visitorStats.avgMood||50))*.15)));
  const occupancy = hotelStats.totalRooms ? (hotelStats.occupancy||0) : 0;
  const hotelAdvice = !hotelStats.totalRooms ? "No hotel yet — add one when resort demand can support it." :
    occupancy >= 85 && (hotelStats.avgHappiness||0) >= 75 ? "Hotels are strong. Upgrade rooms before adding another property." :
    occupancy >= 70 ? "Healthy hotel demand. Improve guest happiness before major expansion." :
    (hotelStats.avgHappiness||0) < 60 ? "Hotel guests are unhappy. Improve comfort, pricing or park experience." :
    "Hotel capacity is ahead of demand. Focus on park attendance and reputation.";
  const weatherText = weather ? ((weather.name||weather.label||"Current weather") + (forecast ? " → " + (forecast.name||forecast.label||"forecast") : "") + ". " + (String(weather.name||weather.label||"").toLowerCase().includes("rain") ? "Prioritise indoor facilities and guest comfort." : "Outdoor water attractions can carry more demand.")) : "Open the park to generate weather strategy data.";
  const researchText = completedResearch.length ? completedResearch.length+" research unlock(s) active. Spend new points against your weakest operational signal." : researchPoints > 0 ? "Research points are ready. Unlock an operational or guest-experience improvement." : "Keep operating to generate research points.";
  const construction = (constructionProjects||[]).filter(p=>!p.completed&&!p.cancelled);
  const hot = (grid||[]).map((id,i)=>({id,i,item:getParkItem(id),score:popularity[i]||0,trend:popularityTrend[i]||0})).filter(x=>x.item?.category==="attraction").sort((a,b)=>b.score-a.score)[0];

  return <div className="space-y-3">
    <Card title="Smart Investment Advisor" icon={Lightbulb} tone={advisor.tone}>
      <div className="flex items-center justify-between"><span className="rounded-full bg-white px-2 py-1 text-[9px] font-black ring-1 ring-slate-200">{advisor.action}</span><span className="text-[10px] font-bold text-slate-500">Cash $ {Math.round(money).toLocaleString()}</span></div>
      <div className="mt-2 text-xs font-black text-slate-800">{advisor.title}</div><div className="mt-1 text-[10px] font-semibold text-slate-600">{advisor.text}</div>
    </Card>

    <Card title="Attraction Performance Centre" icon={TrendingUp} tone="sky">
      {performance.slice(0,5).map((x,i)=><div key={x.index} className="mb-2 rounded-xl bg-white p-2.5 ring-1 ring-slate-100"><div className="flex justify-between text-[10px] font-black"><span className="truncate">{i+1}. {x.name}</span><span className="text-emerald-600">{x.roi.toFixed(1)}% ROI</span></div><div className="mt-1 flex justify-between text-[9px] text-slate-400"><span>$ {Math.max(0,x.contribution).toLocaleString()}/day</span><span>$ {x.cost.toLocaleString()} asset</span></div></div>)}
      {!performance.length&&<div className="text-[10px] text-slate-500">Build attractions to start performance tracking.</div>}
      {hot?.item&&<div className="mt-2 rounded-lg bg-sky-100 px-2.5 py-2 text-[10px] font-bold text-sky-800">Hot ride: {hot.item.name} · {Math.round(hot.score)}% {hot.trend>0?"↗ rising":hot.trend<0?"↘ falling":"→ stable"}</div>}
    </Card>

    <Card title="Hotel Intelligence" icon={Hotel} tone="violet">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Occupancy</div><div className="text-base font-black text-violet-700">{Math.round(occupancy)}%</div></div>
        <div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Happiness</div><div className="text-base font-black text-emerald-600">{Math.round(hotelStats.avgHappiness||0)}%</div></div>
        <div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Room Revenue</div><div className="text-base font-black">$ {Math.round(hotelStats.roomRevenue||0).toLocaleString()}</div></div>
        <div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Rating</div><div className="text-base font-black text-amber-600">{Number(resortRating||0).toFixed(1)} ★</div></div>
      </div><div className="mt-2 text-[10px] font-bold text-violet-800">{hotelAdvice}</div>
      {hotelGuests.length>0&&<div className="mt-2 text-[9px] text-slate-500">{hotelGuests.length} hotel guest record(s) active.</div>}
    </Card>

    <Card title="Monthly & Seasonal Events" icon={CalendarDays} tone="amber">
      <div className="text-[10px] font-bold text-amber-900">{activeCalendarEvent?.name||activeCalendarEvent?.title||"No special calendar event is active."}</div>
      <div className="mt-1 text-[9px] text-slate-500">Day {day} · {seasonEvent?.name||seasonEvent?.label||"normal seasonal conditions"}</div>
      <div className="mt-2 rounded-lg bg-white px-2.5 py-2 text-[10px] font-semibold text-slate-600">Plan pricing, staffing and capacity around seasonal demand spikes.</div>
    </Card>

    <Card title="Weather Strategy" icon={CloudSun} tone="cyan"><div className="text-[10px] font-bold leading-4 text-cyan-900">{weatherText}</div></Card>

    <Card title="Research & Innovation" icon={Sparkles} tone="violet">
      <div className="flex justify-between text-[10px] font-bold"><span>Research points</span><span className="text-violet-700">{researchPoints}</span></div>
      <div className="mt-2 text-[10px] font-semibold text-slate-600">{researchText}</div>
    </Card>

    <Card title="Park Awards & Reputation" icon={Trophy} tone="amber">
      <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Reputation</div><div className="text-base font-black text-amber-600">{Math.round(reputation)}</div></div><div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Social</div><div className="text-base font-black text-violet-600">{Math.round(socialReputation)}</div></div></div>
      <div className="mt-2 text-[10px] font-semibold text-slate-600">{awardStats.totalWon||awards.length ? "Awards won: "+(awardStats.totalWon||awards.length)+". Keep guest satisfaction and reputation high." : "No awards yet. Guest satisfaction and reputation are the fastest route to recognition."}</div>
      {socialPosts.length>0&&<div className="mt-2 text-[9px] text-slate-500">{socialPosts.length} social post record(s) in the park history.</div>}
    </Card>

    <Card title="Emergency Readiness" icon={ShieldCheck} tone={incidents.length||waterQualityCriticalCount?"rose":"emerald"}>
      <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Open incidents</div><div className="text-base font-black text-rose-600">{incidents.length}</div></div><div className="rounded-xl bg-white p-2.5"><div className="text-[8px] uppercase font-black text-slate-400">Water alerts</div><div className="text-base font-black text-cyan-600">{waterQualityCriticalCount}</div></div></div>
      <div className="mt-2 text-[10px] font-bold text-slate-600">{incidents.length||waterQualityCriticalCount?"Resolve active risks before major expansion.":"No critical readiness alert detected. Keep maintenance and staffing above target."}</div>
    </Card>

    <Card title="Construction Queue" icon={Construction}>
      <div className="flex justify-between text-[10px] font-bold"><span>Active projects</span><span>{construction.length}</span></div>
      {construction.slice(0,3).map((p,i)=><div key={p.id||i} className="mt-2 rounded-lg bg-slate-50 p-2 text-[9px] font-semibold text-slate-600">{p.name||p.itemName||"Construction project"} · completion {p.completionDay||"pending"}</div>)}
      {!construction.length&&<div className="mt-2 text-[10px] text-slate-500">No active construction projects.</div>}
    </Card>

    <Card title="Park Health Score" icon={Activity} tone={health>=80?"emerald":health>=60?"amber":"rose"}>
      <div className="flex items-end justify-between"><div className="text-3xl font-black">{health}</div><div className="text-[9px] font-black uppercase text-slate-400">/ 100</div></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={"h-full rounded-full "+(health>=80?"bg-emerald-500":health>=60?"bg-amber-500":"bg-rose-500")} style={{width:health+"%"}}/></div>
      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] font-bold text-slate-500"><span>Uptime {Math.round(uptime*100)}%</span><span>Safety {Math.round(safety*100)}%</span><span>Cleanliness {Math.round(cleanliness*100)}%</span><span>Water {Math.round(waterQualityAvg)}%</span></div>
    </Card>
  </div>;
}
