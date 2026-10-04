import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Waves } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";
import SummaryCards from "@/components/dashboard/SummaryCards";
import IncomeChart from "@/components/dashboard/IncomeChart";
import VisitorsChart from "@/components/dashboard/VisitorsChart";
import SatisfactionChart from "@/components/dashboard/SatisfactionChart";
import AttractionBreakdown from "@/components/dashboard/AttractionBreakdown";
import VisitorGrowthChart from "@/components/dashboard/VisitorGrowthChart";

export default function Dashboard() {
  const game = useGameState();
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-100">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md">
            <Waves className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-800">
              Park Dashboard
            </h1>
            <p className="text-sm text-slate-400">Track your park's performance</p>
          </div>
          <Link
            to="/"
            className="ml-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Park
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5">
        <SummaryCards
          history={game.history}
          guests={game.guests}
          reputation={game.reputation}
          day={game.day}
          lastNet={game.lastNet}
        />
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <VisitorGrowthChart history={game.history} />
          </div>
          <IncomeChart history={game.history} />
          <VisitorsChart history={game.history} />
          <SatisfactionChart history={game.history} />
          <AttractionBreakdown grid={game.grid} />
        </div>
      </main>
    </div>
  );
}