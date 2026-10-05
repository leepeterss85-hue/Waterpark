import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Waves } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import SummaryCards from "@/components/dashboard/SummaryCards";
import IncomeChart from "@/components/dashboard/IncomeChart";
import VisitorsChart from "@/components/dashboard/VisitorsChart";
import SatisfactionChart from "@/components/dashboard/SatisfactionChart";
import AttractionBreakdown from "@/components/dashboard/AttractionBreakdown";
import VisitorGrowthChart from "@/components/dashboard/VisitorGrowthChart";
import AchievementsGallery from "@/components/dashboard/AchievementsGallery";
import LayoutAnalytics from "@/components/dashboard/LayoutAnalytics";
import PlayerActivityFeed from "@/components/dashboard/PlayerActivityFeed";
import RidePopularityCard from "@/components/dashboard/RidePopularityCard";
import MembershipsCard from "@/components/dashboard/MembershipsCard";

export default function Dashboard() {
  const game = useGameState();
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,.2),transparent_28%),linear-gradient(180deg,#e5f8ff_0%,#f5fbf5_52%,#deeed9_100%)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:py-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-700 shadow-lg"><Waves className="h-6 w-6 text-white" /></div>
          <div><div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-700">Splash Tycoon</div><h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Park Dashboard</h1></div>
          <Link to="/" className="ml-auto flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"><ArrowLeft className="h-4 w-4" /> Back to Park</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-4 rounded-[26px] border border-white/80 bg-white/75 px-4 py-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-cyan-600" /><div><h2 className="font-display text-lg font-extrabold text-slate-900">Park intelligence</h2><p className="text-xs text-slate-500">Keep an eye on guests, satisfaction, income and how efficiently your layout is performing.</p></div></div>
        </div>
        <SummaryCards history={game.history} guests={game.guests} reputation={game.reputation} day={game.day} lastNet={game.lastNet} />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2"><VisitorGrowthChart history={game.history} /></div>
          <IncomeChart history={game.history} />
          <VisitorsChart history={game.history} />
          <SatisfactionChart history={game.history} />
          <AttractionBreakdown grid={game.grid} />
        </div>
        <div className="mt-5"><RidePopularityCard grid={game.grid} upgrades={game.upgrades} popularity={game.popularity} popularityTrend={game.popularityTrend} prevPopularity={game.prevPopularity} visitorStats={game.visitorStats} /></div>
        <div className="mt-5"><MembershipsCard counts={game.membershipCounts} stats={game.membershipStats} level={game.level} /></div>
        <div className="mt-5"><LayoutAnalytics grid={game.grid} history={game.history} peakGuests={game.peakGuests} lifetimeEarnings={game.lifetimeEarnings} reputation={game.reputation} guests={game.guests} day={game.day} /></div>
        <div className="mt-5"><PlayerActivityFeed /></div>
        <div className="mt-5"><AchievementsGallery achievementState={game.achievementState} /></div>
      </main>
    </div>
  );
}