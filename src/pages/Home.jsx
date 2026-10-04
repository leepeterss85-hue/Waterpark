import React, { useEffect, useRef } from "react";
import { Waves, BarChart3, Save, Trees } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import { Link } from "react-router-dom";
import { useGameState } from "@/hooks/useGameState";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useToast } from "@/components/ui/use-toast";
import StatsBar from "@/components/game/StatsBar";
import ParkGrid from "@/components/game/ParkGrid";
import BuildPanel from "@/components/game/BuildPanel";
import GameControls from "@/components/game/GameControls";
import EventLog from "@/components/game/EventLog";
import StaffPanel from "@/components/game/StaffPanel";
import SaveLoadPanel from "@/components/game/SaveLoadPanel";
import ExpansionPanel from "@/components/game/ExpansionPanel";
import MissionsPanel from "@/components/game/MissionsPanel";
import ChallengeBanner from "@/components/game/ChallengeBanner";
import VisitorInsights from "@/components/game/VisitorInsights";
import { TileDetailPanel } from "@/components/game/TileDetail";
import ParkToolbar from "@/components/game/ParkToolbar";
import { trackEvent } from "@/lib/gameAnalytics";
import ParkManagementPanel from "@/components/game/ParkManagementPanel";
import ParkObjectDetail from "@/components/game/ParkObjectDetail";
import PlayerProgressPanel from "@/components/game/PlayerProgressPanel";

export default function Home() {
  const game = useGameState();
  const { toast } = useToast();
  const selectedAttrId = game.selectedTile != null ? game.grid[game.selectedTile] : null;
  const selectedItem = selectedAttrId ? getParkItem(selectedAttrId) : null;
  const prevUnlocked = useRef(null);

  useEffect(() => {
    const unlocked = ACHIEVEMENTS.filter((a) => a.check(game.achievementState)).map((a) => a.id);
    if (prevUnlocked.current == null) {
      prevUnlocked.current = unlocked;
      return;
    }
    for (const id of unlocked) {
      if (!prevUnlocked.current.includes(id)) {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        toast({ title: "🏆 Achievement Unlocked!", description: a.title + " — " + a.desc });
      }
    }
    prevUnlocked.current = unlocked;
  }, [game.achievementState, toast]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.35),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(250,204,21,.16),transparent_24%),linear-gradient(180deg,#bdefff_0%,#e8f8ed_42%,#c8e1c0_100%)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:py-4">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.55),transparent_24%)]" />
            <Waves className="relative z-10 h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Splash Tycoon</h1>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">Design, operate and grow your ultimate water park.</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/load" className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-sky-50 sm:px-4">
              <Save className="h-4 w-4 text-cyan-600" /><span className="hidden sm:inline">Load Manager</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 sm:px-4">
              <BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="game-welcome-banner mb-4 overflow-hidden rounded-[24px] border border-white/70 px-4 py-3 shadow-[0_12px_35px_rgba(21,80,60,.12)] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="hidden h-11 w-11 place-items-center rounded-2xl bg-white/20 shadow-inner ring-1 ring-white/30 sm:grid"><Trees className="h-6 w-6 text-white" /></div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">WATER PARK TYCOON</div>
              <h2 className="font-display text-lg font-black text-white sm:text-xl">Build the biggest water park in town!</h2>
              <p className="mt-0.5 text-[11px] font-semibold leading-5 text-white/70">Build rides, attract guests, earn cash and level up your park.</p>
            </div>
          </div>
        </div>

        <StatsBar money={game.money} day={game.day} guests={game.guests} reputation={game.reputation} lastNet={game.lastNet} level={game.level} />
        <div className="mt-3"><PlayerProgressPanel level={game.level} xp={game.xp} xpForNext={game.xpForNext} onCheat={game.applyCheat} /></div>

        <div className="mt-4"><GameControls playing={game.playing} speed={game.speed} onTogglePlay={() => game.setPlaying(!game.playing)} onSpeed={game.setSpeed} onAdvance={() => { trackEvent("day_advanced", { source: "manual" }); game.advanceDay(); }} onReset={game.resetGame} /></div>
        <div className="mt-4"><ParkToolbar weather={game.weather} forecast={game.forecast} season={game.season} seasonEvent={game.seasonEvent} guests={game.guests} selectedZone={game.selectedZone} onZoneSelect={game.setSelectedZone} /></div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <ChallengeBanner challenge={game.challenge} />
            <ExpansionPanel gridSize={game.gridSize} expansionsDone={game.expansionsDone} level={game.level} money={game.money} onExpand={game.expandPark} />
            <ParkGrid grid={game.grid} parkZones={game.parkZones} upgrades={game.upgrades} selectedBuild={game.selectedBuild} selectedTile={game.selectedTile} selectedZone={game.selectedZone} incidents={game.incidents} guests={game.guests} visitorMovements={game.visitorStats?.movements} staffTotal={Object.values(game.staff || {}).reduce((sum, n) => sum + (n || 0), 0)} onTileClick={game.handleTileClick} />
            <EventLog log={game.log} issueCount={game.incidents.length} />
            <VisitorInsights visitorStats={game.visitorStats} />
            <MissionsPanel level={game.level} xp={game.xp} xpForNext={game.xpForNext} missionState={game.missionState} claimedMissions={game.claimedMissions} onClaim={game.claimMission} />
          </div>

          <aside className="flex min-w-0 flex-col gap-4">
            {selectedItem ? (
              selectedItem.category === "environment" ? (
                <ParkObjectDetail
                  itemId={selectedAttrId}
                  onSell={() => game.sellAttraction(game.selectedTile)}
                  onClose={() => game.setSelectedTile(null)}
                />
              ) : (
                <TileDetailPanel
                  gridIndex={game.selectedTile}
                  attractionId={selectedAttrId}
                  level={game.upgrades[game.selectedTile] || 0}
                  money={game.money}
                  onUpgrade={() => game.upgradeAttraction(game.selectedTile)}
                  onSell={() => game.sellAttraction(game.selectedTile)}
                  onClose={() => game.setSelectedTile(null)}
                />
              )
            ) : (
              <div className="waterpark-panel border-dashed bg-white/80 p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">How to build</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">Choose a ride, facility or park object on the right, then tap an open lot. Use zoning mode to colour-code areas and click built tiles to inspect them.</p>
              </div>
            )}

            <div className="waterpark-panel overflow-hidden bg-white/85 p-4">
              <div className="mb-3 border-b border-slate-100 pb-3">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">Construction</div>
                <h3 className="mt-0.5 font-display text-lg font-extrabold text-slate-900">Build your park</h3>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">Pools, slides, family attractions and essential guest facilities.</p>
              </div>
              <BuildPanel money={game.money} selectedBuild={game.selectedBuild} onSelect={game.setSelectedBuild} />
            </div>

            <ParkManagementPanel
              admissionFee={game.ticketPrice}
              marketingSpend={game.adBudget}
              expressLane={game.priorityPass}
              utilities={game.estimatedUtilities}
              wages={game.staffWages}
              history={game.history}
              visitorStats={game.visitorStats}
              grid={game.grid}
              upgrades={game.upgrades}
              incidents={game.incidents}
              onAdmission={game.setTicketPrice}
              onMarketing={game.setAdBudget}
              onExpressLane={game.setPriorityPass}
            />
            <div className="waterpark-panel bg-white/85 p-4">
              <StaffPanel money={game.money} staff={game.staff} staffWages={game.staffWages} uptime={game.uptime} safety={game.safety} cleanliness={game.cleanliness} entertainment={game.entertainment} onHire={game.hireStaff} onFire={game.fireStaff} />
            </div>

            <div className="waterpark-panel bg-white/85 p-4">
              <SaveLoadPanel saves={game.saves} onSave={game.savePark} onLoad={game.loadPark} onDelete={game.deleteSave} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}