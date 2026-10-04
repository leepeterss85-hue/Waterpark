import React, { useEffect, useRef } from "react";
import { Waves, BarChart3, Save } from "lucide-react";
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
import { TileDetailPanel } from "@/components/game/TileDetail";
import { getAttraction } from "@/data/gameData";

export default function Home() {
  const game = useGameState();
  const { toast } = useToast();
  const selectedAttrId =
    game.selectedTile != null ? game.grid[game.selectedTile] : null;

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
        toast({ title: "🏆 Achievement Unlocked!", description: `${a.title} — ${a.desc}` });
      }
    }
    prevUnlocked.current = unlocked;
  }, [game.achievementState, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-100">
      {/* Header */}
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md">
            <Waves className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-800">
              Splash Tycoon
            </h1>
            <p className="text-sm text-slate-400">Build your dream water park</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/load"
              className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:px-4"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Load Manager</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:px-4"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {/* Stats */}
        <StatsBar
          money={game.money}
          day={game.day}
          guests={game.guests}
          reputation={game.reputation}
          lastNet={game.lastNet}
          level={game.level}
        />

        {/* Controls */}
        <div className="mt-4">
          <GameControls
            playing={game.playing}
            speed={game.speed}
            onTogglePlay={() => game.setPlaying(!game.playing)}
            onSpeed={game.setSpeed}
            onAdvance={game.advanceDay}
            onReset={game.resetGame}
          />
        </div>

        {/* Main layout */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-5">
            <ChallengeBanner challenge={game.challenge} />
            <ExpansionPanel
              gridSize={game.gridSize}
              expansionsDone={game.expansionsDone}
              level={game.level}
              money={game.money}
              onExpand={game.expandPark}
            />
            <ParkGrid
              grid={game.grid}
              selectedBuild={game.selectedBuild}
              selectedTile={game.selectedTile}
              incidents={game.incidents}
              onTileClick={game.handleTileClick}
            />
            <EventLog log={game.log} issueCount={game.incidents.length} />
            <MissionsPanel
              level={game.level}
              xp={game.xp}
              xpForNext={game.xpForNext}
              missionState={game.missionState}
              claimedMissions={game.claimedMissions}
              onClaim={game.claimMission}
            />
          </div>

          <aside className="flex flex-col gap-4">
            {selectedAttrId ? (
              <TileDetailPanel
                gridIndex={game.selectedTile}
                attractionId={selectedAttrId}
                level={game.upgrades[game.selectedTile] || 0}
                money={game.money}
                onUpgrade={() => game.upgradeAttraction(game.selectedTile)}
                onSell={() => game.sellAttraction(game.selectedTile)}
                onClose={() => game.setSelectedTile(null)}
              />
            ) : (
              <div className="rounded-2xl bg-white/70 p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
                <span className="font-semibold text-slate-700">Tip:</span> Pick a
                build item, then tap an empty lot to place it. Tap a placed
                attraction to inspect or sell it.
              </div>
            )}
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-100">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Build Menu
              </h3>
              <BuildPanel
                money={game.money}
                selectedBuild={game.selectedBuild}
                onSelect={game.setSelectedBuild}
              />
            </div>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-100">
              <StaffPanel
                money={game.money}
                staff={game.staff}
                staffWages={game.staffWages}
                uptime={game.uptime}
                safety={game.safety}
                cleanliness={game.cleanliness}
                onHire={game.hireStaff}
                onFire={game.fireStaff}
              />
            </div>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-100">
              <SaveLoadPanel
                saves={game.saves}
                onSave={game.savePark}
                onLoad={game.loadPark}
                onDelete={game.deleteSave}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}