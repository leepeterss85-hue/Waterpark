import React from "react";
import { FlaskConical, Wallet, HardHat, CalendarDays, Droplets, Hotel, CloudSun, MapPin, Crown, Swords, Medal, Star, Ticket, Trophy, Clock, Siren, Activity, Target, Zap, Palette, Gift, PawPrint, MessageSquare, HeartPulse, Handshake, UsersRound, UtensilsCrossed, BookOpen, Globe2, Waves, Camera, RotateCcw, BarChart3, Settings, ChevronRight } from "lucide-react";

const GROUPS = [
  { title: "Park Operations", items: [["research","Research",FlaskConical],["economy","Economy",Wallet],["construction","Projects",HardHat],["events","Events",CalendarDays],["waterQuality","Water Quality",Droplets],["resort","Resort",Hotel],["conditions","Weather & Conditions",CloudSun],["districts","Districts",MapPin]] },
  { title: "Growth & Competition", items: [["empire","Empire",Crown],["competitors","Rival Parks",Swords],["leaderboard","Leaderboards",Medal],["vipGuests","VIP Guests",Star],["memberships","Memberships",Ticket],["awards","Awards",Trophy],["sponsorships","Sponsors",Handshake],["bookings","Group Bookings",UsersRound],["empireExpansion","Global Empire",Globe2]] },
  { title: "Guests & Park Life", items: [["info","Activity & Missions",Activity],["trends","Ride Trends",BarChart3],["seasonalCalendar","Calendar",Clock],["emergencies","Emergencies",Siren],["challenges","Challenges",Target],["reviews","Visitor Reviews",MessageSquare],["needs","Guest Needs",HeartPulse],["guestExperience","Guest Experience",HeartPulse],["livingPark","Food & Retail",UtensilsCrossed],["chains","Ride Chains",Trophy],["campaignChapters","Campaign",BookOpen]] },
  { title: "Advanced & Creative", items: [["synergies","Ride Synergies",Zap],["themes","Park Themes",Palette],["rewards","Daily Rewards",Gift],["mascot","Park Mascot",PawPrint],["advancedPark","Park Life & Destinations",Waves],["photo","Photo Mode",Camera],["prestige","Prestige",RotateCcw],["annualReport","Management Report",BarChart3],["sandboxLab","Sandbox Lab",Waves],["settings","Settings",Settings]] }
];

export default function ParkMenuHub({ onOpen }) {
  return <div className="space-y-4">
    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-white p-3">
      <div className="text-sm font-black text-slate-900">Park Command Centre</div>
      <div className="mt-1 text-xs text-slate-500">Everything else is organised here so the main park controls stay simple.</div>
    </div>
    {GROUPS.map(group => <section key={group.title}>
      <div className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">{group.title}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {group.items.map(([key,label,Icon]) => <button key={key} type="button" onClick={() => onOpen(key)} className="flex min-h-14 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">
          <Icon className="h-4 w-4 shrink-0 text-cyan-600" strokeWidth={2.3}/><span className="min-w-0 flex-1 text-xs font-bold text-slate-700">{label}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300"/>
        </button>)}
      </div>
    </section>)}
  </div>;
}
