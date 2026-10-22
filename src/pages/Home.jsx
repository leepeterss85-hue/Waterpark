import React, { useEffect, useRef, useState } from "react";
import { Waves, BarChart3, Save, PoundSterling, CalendarDays, Users, Star, Trophy } from "lucide-react";
import { getParkItem, levelTier } from "@/data/gameData";
import { Link } from "react-router-dom";
import { useGameState } from "@/hooks/useGameState";
import { ACHIEVEMENTS } from "@/data/achievements";
import { MISSIONS, missionProgress } from "@/data/missions";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import ParkGrid from "@/components/game/ParkGrid";
import GameControls from "@/components/game/GameControls";
import ChallengeBanner from "@/components/game/ChallengeBanner";
import MapMenuBar from "@/components/game/MapMenuBar";
import GameMenuSheets from "@/components/game/GameMenuSheets";
import StoryCoach from "@/components/game/StoryCoach";
import { TileDetailPanel } from "@/components/game/TileDetail";
import ParkObjectDetail from "@/components/game/ParkObjectDetail";
import ZooDetailPanel from "@/components/game/ZooDetailPanel";
import DailySummary from "@/components/game/DailySummary";
import DayTransition from "@/components/game/DayTransition";
import FloatingRewards from "@/components/game/FloatingRewards";
import SoundToggle from "@/components/game/SoundToggle";
import LevelUpCelebration from "@/components/game/LevelUpCelebration";
import Tutorial from "@/components/game/Tutorial";
import UndoButton from "@/components/game/UndoButton";
import VipBanner from "@/components/game/VipBanner";
import DisasterBanner from "@/components/game/DisasterBanner";
import HotelDetail from "@/components/game/HotelDetail";
import { hotelRooms } from "@/data/hotels";
import { getTheme } from "@/data/visualThemes";
import { trackEvent } from "@/lib/gameAnalytics";
import { sound } from "@/lib/soundManager";
import { haptics, getGraphicsQuality, setGraphicsQuality } from "@/lib/settings";
import confetti from "canvas-confetti";

const StatPill = ({ icon: Icon, value, tone }) => (
  <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-2 py-1 ring-1 ring-white/15">
    <Icon className={`h-3.5 w-3.5 ${tone}`} />
    <span className="text-xs font-black text-white">{value}</span>
  </div>
);

const LevelPill = ({ level }) => {
  const tier = levelTier(level);
  return (
    <div className={`flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-br ${tier.glow} px-2.5 py-1 ring-1 ${tier.ring} shadow-sm`}>
      <Trophy className="h-3.5 w-3.5 text-white" />
      <div className="flex flex-col leading-none">
        <span className="text-xs font-black text-white">Lv {level}</span>
        <span className="text-[7px] font-bold uppercase tracking-wider text-white/80">{tier.label}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const game = useGameState();
  const { toast } = useToast();
  const selectedAttrId = game.selectedTile != null ? game.grid[game.selectedTile] : null;
  const selectedItem = selectedAttrId ? getParkItem(selectedAttrId) : null;
  const prevUnlocked = useRef(null);
  const prevDay = useRef(game.day);
  const prevLevel = useRef(game.level);
  const [dailyReport, setDailyReport] = useState(null);
  const [openSheet, setOpenSheet] = useState(null);
  const [graphicsQuality, setGraphicsQualityState] = useState(getGraphicsQuality);
  const changeGraphicsQuality = (value) => {
    setGraphicsQualityState(setGraphicsQuality(value));
  };
  const [dayTrigger, setDayTrigger] = useState(null);
  const [rewardTrigger, setRewardTrigger] = useState(null);
  const [shake, setShake] = useState(false);
  const [levelUpTrigger, setLevelUpTrigger] = useState(null);
  const prevIncidentCount = useRef(0);

  useEffect(() => {
    if (prevDay.current !== game.day) {
      setDayTrigger(game.day);
      sound.dayStart();
      haptics.buzz(20);
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
        sound.achievement();
        haptics.buzz([20, 40, 20]);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.3 }, colors: ["#22d3ee", "#fbbf24", "#a78bfa", "#34d399"] });
      }
    }
    prevUnlocked.current = unlocked;
  }, [game.achievementState, toast]);

  useEffect(() => {
    if (game.lastNet && game.lastNet !== 0) {
      setRewardTrigger(Date.now());
      if (game.lastNet > 0) { sound.cash(); haptics.buzz(15); }
    }
  }, [game.lastNet]);

  useEffect(() => {
    const count = game.incidents.length;
    if (count > prevIncidentCount.current) {
      sound.incident();
      haptics.buzz([30, 20, 30]);
      setShake(true);
      const t = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(t);
    }
    prevIncidentCount.current = count;
  }, [game.incidents.length]);

  useEffect(() => {
    if (game.level > prevLevel.current) {
      setLevelUpTrigger(Date.now());
      haptics.buzz([20, 40, 20, 40]);
      confetti({ particleCount: 120, spread: 90, startVelocity: 45, origin: { y: 0.4 }, colors: ["#a78bfa", "#fbbf24", "#22d3ee", "#f472b6", "#34d399"] });
    }
    prevLevel.current = game.level;
  }, [game.level]);

  useEffect(() => {
    if (game.selectedTile != null) setOpenSheet(null);
  }, [game.selectedTile]);

  const handleTileClickWithSound = (index) => {
    const wasEmpty = !game.grid[index];
    const hadBuild = game.selectedBuild;
    game.handleTileClick(index);
    if (wasEmpty && hadBuild) {
      const builtItem = getParkItem(hadBuild);
      sound.build();
      if (builtItem?.category === "attraction" || /pool|fountain|waterfall|wave|river|slide|flume/i.test(`${hadBuild} ${builtItem?.name || ""}`)) {
        setTimeout(() => sound.attraction({ id: hadBuild, ...builtItem }), 180);
      }
      haptics.buzz(25);
    } else {
      sound.click();
      haptics.buzz(10);
    }
  };

  const handleOpenMenu = (key) => {
    if (key) game.setSelectedTile(null);
    setOpenSheet(key);
  };

  const claimableMissions = MISSIONS.filter((m) => game.level >= m.level && !game.claimedMissions.includes(m.id) && missionProgress(m, game.missionState) >= m.target).length;
  const incidentCount = game.incidents.length;
  const themeClass = getTheme(game.activeTheme).cssClass;

  const statsBar = (
    <div className="game-board-statsbar">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-lg ring-1 ring-white/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.55),transparent_24%)]" />
          <Waves className="relative z-10 h-4 w-4 text-white" />
        </div>
        <h1 className="hidden font-display text-base font-extrabold tracking-tight text-white sm:block">Splash Tycoon</h1>
        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto sm:justify-center sm:gap-2">
          <StatPill icon={PoundSterling} value={`£${game.money.toLocaleString()}`} tone="text-emerald-300" />
          <StatPill icon={CalendarDays} value={game.day} tone="text-sky-300" />
          <StatPill icon={Users} value={game.guests.toLocaleString()} tone="text-cyan-300" />
          <div className="hidden sm:block"><StatPill icon={Star} value={`${game.reputation}%`} tone="text-amber-300" /></div>
          <div className="hidden sm:block"><StatPill icon={Waves} value={`Appeal ${game.parkAppeal?.score ?? 50}`} tone="text-fuchsia-300" /></div>
          <LevelPill level={game.level} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <SoundToggle />
          <Link to="/load" className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15">
            <Save className="h-4 w-4 text-cyan-300" />
          </Link>
          <Link to="/dashboard" className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15">
            <BarChart3 className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.35),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(250,204,21,.16),transparent_24%),linear-gradient(180deg,#bdefff_0%,#e8f8ed_42%,#c8e1c0_100%)] ${themeClass}${shake ? " screen-shake" : ""}`}
      style={{ height: "100dvh" }}
    >
      <DayTransition day={game.day} weather={game.weather} seasonEvent={game.seasonEvent} trigger={dayTrigger} />
      <LevelUpCelebration level={game.level} trigger={levelUpTrigger} />
      <FloatingRewards amount={game.lastNet} trigger={rewardTrigger} />

      <main className="relative flex-1 min-h-0 overflow-hidden p-1.5 sm:p-2">
        <UndoButton onUndo={game.lastBuildAction ? game.undoLastBuild : null} />
        <ParkGrid
          grid={game.grid}
          parkZones={game.parkZones}
          upgrades={game.upgrades}
          selectedBuild={game.selectedBuild}
          graphicsQuality={graphicsQuality}
          onGraphicsQualityChange={changeGraphicsQuality}
          onOpenSettings={() => handleOpenMenu("settings")}
          money={game.money}
          sandbox={game.sandbox}
          onCancelBuild={() => game.setSelectedBuild(null)}
          onChangeBuild={() => handleOpenMenu("build")}
          selectedTile={game.selectedTile}
          selectedZone={game.selectedZone}
          incidents={game.incidents}
          guests={game.guests}
          visitorMovements={game.visitorStats?.movements}
          queueStats={game.visitorStats?.queueStats}
          attractionCondition={game.attractionCondition}
          staff={game.staff}
          staffAssignments={game.staffAssignments}
          lifeguardTotal={game.staff?.lifeguard || 0}
          day={game.day}
          weather={game.weather}
          seasonEvent={game.seasonEvent}
          hotelGuests={game.hotelGuests}
          activeEvents={game.activeEvents}
          waterQuality={game.waterQuality}
          acceptedBookings={game.acceptedBookings}
          sponsorships={game.sponsorships}
          activeStrikes={game.activeStrikes}
          mascot={game.mascotDef}
          onTileClick={handleTileClickWithSound}
          topControls={
            <>
              <GameControls
                playing={game.playing}
                speed={game.speed}
                onTogglePlay={() => game.setPlaying(!game.playing)}
                onSpeed={game.setSpeed}
                onAdvance={() => { trackEvent("day_advanced", { source: "manual" }); game.advanceDay(); }}
                onReset={game.resetGame}
              />
              <StoryCoach game={game} setOpenSheet={handleOpenMenu} />
              {game.challenge && <div className="park-game-notice"><ChallengeBanner challenge={game.challenge} /></div>}
              {game.vipVisit && <VipBanner vipVisit={game.vipVisit} />}
              {game.disaster && <DisasterBanner disaster={game.disaster} />}
            </>
          }
          bottomMenu={<MapMenuBar openSheet={openSheet} onOpen={handleOpenMenu} missionsBadge={claimableMissions} incidentBadge={incidentCount} />}
          statsBar={statsBar}
          themeClass={themeClass}
        />

        <Sheet open={game.selectedTile != null && !!selectedItem} onOpenChange={(v) => { if (!v) game.setSelectedTile(null); }}>
          <SheetContent side="right" className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md">
            <div className="flex items-center border-b border-slate-200 bg-white px-4 py-3 pr-12">
              <SheetTitle className="text-base font-black text-slate-900">{selectedItem?.name || "Tile"}</SheetTitle>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4">
              {selectedItem && (selectedItem.parkType === "zoo" ? (
                <ZooDetailPanel itemId={selectedAttrId} tileIndex={game.selectedTile} animalState={game.zooAnimals?.[game.selectedTile]} level={game.upgrades[game.selectedTile] || 0} money={game.money} zookeepers={game.staff?.zookeeper || 0} availableKeepers={Math.max(0, (game.staff?.zookeeper || 0) - Object.entries(game.zooAnimals || {}).reduce((sum, [tile, record]) => Number(tile) === Number(game.selectedTile) ? sum : sum + (Number(record?.keepersAssigned) || 0), 0))} hasVet={game.grid?.includes("wildlife_vet")} hasConservation={game.grid?.includes("conservation_centre")} sandbox={game.sandbox} onUpgrade={() => game.upgradeAttraction(game.selectedTile)} onSell={() => game.sellAttraction(game.selectedTile)} onClose={() => game.setSelectedTile(null)} onFeed={game.feedZooAnimal} onSchedule={game.setZooFeedingSchedule} onToggleBreeding={game.toggleZooBreeding} onTreat={game.treatZooAnimal} onAssignKeepers={game.assignZooKeepers} onUpgradeFeature={game.upgradeZooHabitatFeature} />
              ) : selectedItem.category === "environment" ? (
                <ParkObjectDetail itemId={selectedAttrId} onSell={() => game.sellAttraction(game.selectedTile)} onClose={() => game.setSelectedTile(null)} />
              ) : selectedItem.category === "hotel" ? (
                <HotelDetail
                  hotelDef={selectedItem}
                  level={game.upgrades[game.selectedTile] || 0}
                  occupancy={game.hotelStats?.occupancy || 0}
                  guestsInHotel={game.hotelGuests.filter((g) => g.hotelTile === game.selectedTile).length}
                  totalRooms={hotelRooms(selectedItem, game.upgrades[game.selectedTile] || 0)}
                  money={game.money}
                  onUpgrade={() => game.upgradeAttraction(game.selectedTile)}
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
                  popularityScore={game.popularity?.[game.selectedTile] ?? null}
                  trendBoost={game.popularityTrend?.[game.selectedTile] ?? 0}
                  onUpgrade={() => game.upgradeAttraction(game.selectedTile)}
                  onSell={() => game.sellAttraction(game.selectedTile)}
                  onClose={() => game.setSelectedTile(null)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </main>

      <GameMenuSheets game={game} openSheet={openSheet} setOpenSheet={setOpenSheet}
        graphicsQuality={graphicsQuality} onGraphicsQualityChange={changeGraphicsQuality} />

      <DailySummary report={dailyReport} onClose={() => setDailyReport(null)} />
      <Tutorial game={game} />
    </div>
  );
}