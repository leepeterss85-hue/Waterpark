import React, { useMemo, useState } from "react";
import { FlaskConical, Wallet, HardHat, CalendarDays, Droplets, Hotel, CloudSun, MapPin, Crown, Swords, Medal, Star, Ticket, Trophy, Clock, Siren, Activity, Target, Zap, Palette, Gift, PawPrint, MessageSquare, HeartPulse, Handshake, UsersRound, UtensilsCrossed, BookOpen, Globe2, Waves, Camera, RotateCcw, BarChart3, Settings, ChevronRight, ChevronDown, Search, X } from "lucide-react";

const GROUPS = [
  { title: "Command", items: [["overview","Park Overview",BarChart3],["mastery","Park Mastery",Crown],["annualReport","Management Report",BarChart3]] },
  { title: "Park Operations", items: [["research","Research",FlaskConical],["economy","Economy",Wallet],["construction","Projects",HardHat],["events","Events",CalendarDays],["waterQuality","Water Quality",Droplets],["resort","Resort",Hotel],["conditions","Weather & Conditions",CloudSun],["districts","Districts",MapPin]] },
  { title: "Growth & Competition", items: [["empire","Empire",Crown],["competitors","Rival Parks",Swords],["leaderboard","Leaderboards",Medal],["vipGuests","VIP Guests",Star],["memberships","Memberships",Ticket],["awards","Awards",Trophy],["sponsorships","Sponsors",Handshake],["bookings","Group Bookings",UsersRound],["empireExpansion","Global Empire",Globe2]] },
  { title: "Guests & Park Life", items: [["info","Activity & Missions",Activity],["trends","Ride Trends",BarChart3],["seasonalCalendar","Calendar",Clock],["emergencies","Emergencies",Siren],["challenges","Challenges",Target],["reviews","Visitor Reviews",MessageSquare],["needs","Guest Needs",HeartPulse],["guestExperience","Guest Experience",HeartPulse],["livingPark","Food & Retail",UtensilsCrossed],["chains","Ride Chains",Trophy],["campaignChapters","Campaign",BookOpen]] },
  { title: "Advanced & Creative", items: [["synergies","Ride Synergies",Zap],["themes","Park Themes",Palette],["rewards","Daily Rewards",Gift],["mascot","Park Mascot",PawPrint],["advancedPark","Park Life & Destinations",Waves],["photo","Photo Mode",Camera],["prestige","Prestige",RotateCcw],["sandboxLab","Sandbox Lab",Waves],["settings","Settings",Settings]] }
];

export default function ParkMenuHub({ onOpen }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({ Command: true, "Park Operations": true });
  const normalizedQuery = query.trim().toLowerCase();
  const visibleGroups = useMemo(() => GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(([key, label]) => {
      if (!normalizedQuery) return true;
      const searchable = `${key} ${label} ${group.title} ${key === "resort" ? "hotel accommodation rooms" : ""}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    }),
  })).filter((group) => group.items.length > 0), [normalizedQuery]);
  const resultCount = visibleGroups.reduce((total, group) => total + group.items.length, 0);

  return <div className="space-y-3">
    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-white p-3">
      <div className="text-sm font-black text-slate-900">Park Command Centre</div>
      <div className="mt-1 text-xs text-slate-500">Quick access to park management. Search for a tool or open a category.</div>
      <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find economy, hotels, staff…" aria-label="Search park management tools" className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>}
      </label>
      <div className="mt-2 text-[10px] font-semibold text-slate-400">{normalizedQuery ? `${resultCount} matching tools` : "Most-used controls are open; other categories stay tucked away."}</div>
    </div>
    {visibleGroups.map((group) => {
      const isOpen = Boolean(normalizedQuery || expanded[group.title]);
      return <section key={group.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button type="button" onClick={() => setExpanded((current) => ({ ...current, [group.title]: !current[group.title] }))} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left transition hover:bg-slate-50">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">{group.title}</span>
          <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400">{group.items.length} tools {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
        </button>
        {isOpen && <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-2 sm:grid-cols-3">
          {group.items.map(([key, label, Icon]) => <button key={key} type="button" onClick={() => onOpen(key)} className="flex min-h-14 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">
            <Icon className="h-4 w-4 shrink-0 text-cyan-600" strokeWidth={2.3}/><span className="min-w-0 flex-1 text-xs font-bold text-slate-700">{label}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300"/>
          </button>)}
        </div>}
      </section>;
    })}
    {visibleGroups.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center"><Search className="mx-auto h-6 w-6 text-slate-300"/><div className="mt-2 text-sm font-bold text-slate-700">No tools found</div><div className="mt-1 text-xs text-slate-500">Try a different search, such as “hotel”, “guest” or “money”.</div></div>}
  </div>;
}
