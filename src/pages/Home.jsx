import React, { useEffect, useRef, useState } from "react";
import { Waves, BarChart3, Save, Hammer, Settings, Users, Activity, Target } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import { Link } from "react-router-dom";
import { useGameState } from "@/hooks/useGameState";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatsBar from "@/components/game/StatsBar";
import ParkGrid from "@/components/game/ParkGrid";
import BuildPanel from "@/components/game/BuildPanel";
import GameControls from "@/components/game/GameControls";
import ActivityLog from "@/components/game/ActivityLog";
import StaffPanel from "@/components/game/StaffPanel";
import SaveLoadPanel from "@/components/game/SaveLoadPanel";
import ExpansionPanel from "@/components/game/ExpansionPanel";
import MissionsPanel from "@/components/game/MissionsPanel";
import ChallengeBanner from "@/components/game/ChallengeBanner";
import VisitorInsight from "@/components/game/VisitorInsights";
import { TileDetailPanel } from "@/components/game/TileDetail";
import ParkToolbar from "@/components/game/ParkToolbar";
import { trackEvent } from "@/lib/gameAnalytics";
import ParkManagementPanel from "@/components/game/ParkManagementPanel";
import ParkObjectDetail from "@/components/game/ParkObjectDetail";
import PlayerProgressPanel from "@/components/game/PlayerProgressPanel";
import DailySummary from "@/components/game/DailySummary";

export default function Home() {
  const game = useGameState();
  const { toast } = useToast();
  const selectedAttrId = game.selectedTile != null ? game.grid[game.selectedTile] : null;
  const selectedItem = selectedAttrId ? getParkItem(selectedAttrId) : null;
  const prevUnlocked = useRef(null);
  const prevDay = useRef(game.day);
  const [dailyReport, setDailyReport] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("build");
  const [infoTab, setInfoTab] = useState("activity");

  useEffect(() => {
    if (prevDay.current !== game.day) {
      if (game.day > 1 && game.day % 30 === 0) {
        const monthHistory = (game.history || []).filter(
          (entry) => entry.day > game.day - 30 && entry.day <= game.day
        );
        if (monthHistory.length) {
          const sum = (key) => monthHistory.reduce((total, entry) => total + (Number(entry[key]) || 0), 0);
          const latest = monthHistory[monthHistory.length - 1];
          setDailyReport({
            ...latest,
            period: "month",
            month: Math.ceil(game.day / 30),
            guests: sum("guests"),
            income: sum("income"),
            net: sum("net"),
            ticketRevenue: sum("ticketRevenue"),
            rideIncome: sum("rideIncome"),
            upkeep: sum("upkeep"),
            wages: sum("wages"),
            utilities: sum("utilities"),
            marketing: sum("marketing"),
            premium: sum("premium"),
            weather: "30-day operating period",
            event: null,
          });
        }
      }
      prevDay.current = game.day;
    }
  }, [game.day, game.history]);

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

  // Jump to the build tab when a tile is selected so the detail panel is visible
  useEffect(() => {
    if (game.selectedTile != null) setSidebarTab("build");
  }, [game.selectedTile]);

  const zones = [...new Set((game.parkZones || []).filter(Boolean))].map((id) => ({
    id,
    label: String(id).replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.35),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(250,204,21,.16),transparent_24%),linear-gradient(180deg,#bdefff_0%,#e8f8ed_42%,#c8e1c0_100%)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:py-3.5">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.55),transparent_24%)]" />
            <Waves className="relative z-10 h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">Splash Tycoon</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/load" className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-sky-50">
              <Save className="h-4 w-4 text-cyan-600" /><span className="hidden sm:inline">Saves</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800">
              <BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-5">
        <StatsBar money={game.money} day={game.day} guests={game.guests} reputation={game.reputation} lastNet={game.lastNet} level={game.level} />
        <div className="mt-2.5"><PlayerProgressPanel level={game.level} xp={game.xp} xpForNext={game.xpForNext} onCheat={game.applyCheat} /></div>

        <div className="mt-3"><GameControls playing={game.playing} speed={game.speed} onTogglePlay={() => game.setPlaying(!game.playing)} onSpeed={game.setSpeed} onAdvance={() => { trackEvent("day_advanced", { source: "manual" }); game.advanceDay(); }} onReset={game.resetGame} /></div>
        <div className="mt-3"><ParkToolbar weather={game.weather} forecast={game.forecast} season={game.season} seasonEvent={game.seasonEvent} guests={game.guests} selectedZone={game.selectedZone} onZoneSelect={game.setSelectedZone} /></div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <ChallengeBanner challenge={game.challenge} />
            <ParkGrid grid={game.grid} parkZones={game.parkZones} upgrades={game.upgrades} selectedBuild={game.selectedBuild} selectedTile={game.selectedTile} selectedZone={game.selectedZone} incidents={game.incidents} guests={game.guests} visitorMovements={game.visitorStats?.movements} queueStats={game.visitorStats?.queueStats} attractionCondition={game.attractionCondition} staff={game.staff} staffAssignments={game.staffAssignments} lifeguardTotal={game.staff?.lifeguard || 0} day={game.day} weather={game.weather} seasonEvent={game.seasonEvent} onTileClick={game.handleTileClick} />

            <Tabs value={infoTab} onValueChange={setInfoTab} className="waterpark-panel bg-white/85 p-3 sm:p-4">
              <TabsList className="w-full justify-between">
                <TabsTrigger value="activity" className="flex-1 gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
                <TabsTrigger value="insights" className="flex-1 gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Insights</TabsTrigger>
                <TabsTrigger value="missions" className="flex-1 gap-1.5 text-xs"><Target className="h-3.5 w-3.5" /> Missions</TabsTrigger>
              </TabsList>
              <TabsContent value="activity"><ActivityLog feedback={game.feedback} log={game.log} issueCount={game.incidents.length} guestExperience={game.visitorStats?.guestExperience} /></TabsContent>
              <TabsContent value="insights"><VisitorInsight visitorStats={game.visitorStats} /></TabsContent>
              <TabsContent value="missions"><MissionsPanel level={game.level} xp={game.xp} xpForNext={game.xpForNext} missionState={game.missionState} claimedMissions={game.claimedMissions} onClaim={game.claimMission} /></TabsContent>
            </Tabs>
          </div>

          <aside className="flex min-w-0 flex-col gap-4">
            {selectedItem && (
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
                  incident={game.incidents.find((x) => x.tileIndex === game.selectedTile) || null}
                  condition={game.attractionCondition?.[game.selectedTile] ?? 100}
                  guests={game.guests}
                  queueWait={selectedItem?.capacity ? Math.min(45, Math.round(Math.max(0, ((game.visitorStats?.movements?.[selectedAttrId] || 0) / (selectedItem.capacity * 1.4) - 0.35) * 18))) : 0}
                  lifeguards={game.staff?.lifeguard || 0}
                  movementCount={game.visitorStats?.movements?.[selectedAttrId] || 0}
                  totalVisits={game.visitorStats?.totalVisits || 0}
                  onUpgrade={() => game.upgradeAttraction(game.selectedTile)}
                  onSell={() => game.sellAttraction(game.selectedTile)}
                  onClose={() => game.setSelectedTile(null)}
                />
              )
            )}

            <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="waterpark-panel bg-white/85 p-3 sm:p-4">
              <TabsList className="w-full justify-between">
                <TabsTrigger value="build" className="flex-1 gap-1 text-xs"><Hammer className="h-3.5 w-3.5" /> Build</TabsTrigger>
                <TabsTrigger value="manage" className="flex-1 gap-1 text-xs"><Settings className="h-3.5 w-3.5" /> Manage</TabsTrigger>
                <TabsTrigger value="staff" className="flex-1 gap-1 text-xs"><Users className="h-3.5 w-3.5" /> Staff</TabsTrigger>
                <TabsTrigger value="save" className="flex-1 gap-1 text-xs"><Save className="h-3.5 w-3.5" /> Save</TabsTrigger>
              </TabsList>
              <TabsContent value="build" className="flex flex-col gap-3">
                <ExpansionPanel gridSize={game.gridSize} expansionsDone={game.expansionsDone} level={game.level} money={game.money} onExpand={game.expandPark} />
                <BuildPanel money={game.money} level={game.level} selectedBuild={game.selectedBuild} onSelect={game.setSelectedBuild} />
              </TabsContent>
              <TabsContent value="manage">
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
              </TabsContent>
              <TabsContent value="staff">
                <StaffPanel money={game.money} staff={game.staff} staffWages={game.staffWages} uptime={game.uptime} safety={game.safety} cleanliness={game.cleanliness} entertainment={game.entertainment} onHire={game.hireStaff} onFire={game.fireStaff} assignments={game.staffAssignments} zones={zones} onAssign={game.assignStaff} />
              </TabsContent>
              <TabsContent value="save">
                <SaveLoadPanel saves={game.saves} onSave={game.savePark} onLoad={game.loadPark} onDelete={game.deleteSave} />
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </main>
      <DailySummary report={dailyReport} onClose={() => setDailyReport(null)} />
    </div>
  );
}