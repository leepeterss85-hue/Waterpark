import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hammer, Settings, Users, Activity, BarChart3, Target, CloudSun, FlaskConical, SlidersHorizontal, Hotel, Flame, CalendarDays, Ticket, Trophy, Share2, Siren, HardHat, Wallet, Crown, Swords, Droplets, Medal, Link2, MapPin, Star, Clock, Wrench, Zap, Palette, RotateCcw, Gift, PawPrint, MessageSquare, Camera } from "lucide-react";
import { MISSIONS, missionProgress } from "@/data/missions";
import BuildPanel from "@/components/game/BuildPanel";
import ExpansionPanel from "@/components/game/ExpansionPanel";
import ParkManagementPanel from "@/components/game/ParkManagementPanel";
import StaffPanel from "@/components/game/StaffPanel";
import ActivityLog from "@/components/game/ActivityLog";
import VisitorInsight from "@/components/game/VisitorInsights";
import MissionsPanel from "@/components/game/MissionsPanel";
import PlayerProgressPanel from "@/components/game/PlayerProgressPanel";
import ParkToolbar from "@/components/game/ParkToolbar";
import ResearchPanel from "@/components/game/ResearchPanel";
import SettingsPanel from "@/components/game/SettingsPanel";
import ParkAppealPanel from "@/components/game/ParkAppealPanel";
import CampaignPanel from "@/components/game/CampaignPanel";
import ResortPanel from "@/components/game/ResortPanel";
import PricingPanel from "@/components/game/PricingPanel";
import RidePopularityPanel from "@/components/game/RidePopularityPanel";
import EventsPanel from "@/components/game/EventsPanel";
import MembershipsPanel from "@/components/game/MembershipsPanel";
import AwardsPanel from "@/components/game/AwardsPanel";
import SocialMediaPanel from "@/components/game/SocialMediaPanel";
import EmergenciesPanel from "@/components/game/EmergenciesPanel";
import ConstructionPanel from "@/components/game/ConstructionPanel";
import EconomyPanel from "@/components/game/EconomyPanel";
import EmpirePanel from "@/components/game/EmpirePanel";
import CompetitorsPanel from "@/components/game/CompetitorsPanel";
import WaterQualityPanel from "@/components/game/WaterQualityPanel";
import LeaderboardPanel from "@/components/game/LeaderboardPanel";
import ShareParkPanel from "@/components/game/ShareParkPanel";
import DistrictsPanel from "@/components/game/DistrictsPanel";
import VipGuestsPanel from "@/components/game/VipGuestsPanel";
import SeasonalCalendarPanel from "@/components/game/SeasonalCalendarPanel";
import RideAgingPanel from "@/components/game/RideAgingPanel";
import DailyChallengesPanel from "@/components/game/DailyChallengesPanel";
import SynergyPanel from "@/components/game/SynergyPanel";
import VisualThemesPanel from "@/components/game/VisualThemesPanel";
import PrestigePanel from "@/components/game/PrestigePanel";
import DailyRewardWheel from "@/components/game/DailyRewardWheel";
import MascotPanel from "@/components/game/MascotPanel";
import VisitorReviewsPanel from "@/components/game/VisitorReviewsPanel";
import MasterPlansPanel from "@/components/game/MasterPlansPanel";
import ParkPhotoMode from "@/components/game/ParkPhotoMode";
import StrategyCentre from "@/components/game/StrategyCentre";
import { isWaterAttraction } from "@/data/waterQuality";

function SheetShell({ open, onOpenChange, title, icon: Icon, width = "sm:max-w-md", children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={`flex w-full flex-col overflow-hidden p-0 ${width}`}>
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 pr-12">
          {Icon && <Icon className="h-5 w-5 text-cyan-600" />}
          <SheetTitle className="text-base font-black text-slate-900">{title}</SheetTitle>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export default function GameMenuSheets({ game, openSheet, setOpenSheet }) {
  const close = () => setOpenSheet(null);
  const zones = [...new Set((game.parkZones || []).filter(Boolean))].map((id) => ({
    id,
    label: String(id).replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  }));
  const claimableMissions = MISSIONS.filter(
    (m) => game.level >= m.level && !game.claimedMissions.includes(m.id) && missionProgress(m, game.missionState) >= m.target
  ).length;

  return (
    <>
      <SheetShell open={openSheet === "build"} onOpenChange={(v) => !v && close()} title="Build" icon={Hammer} width="sm:max-w-lg">
        <ExpansionPanel gridSize={game.gridSize} expansionsDone={game.expansionsDone} level={game.level} money={game.money} onExpand={game.expandPark} />
        <BuildPanel money={game.money} level={game.level} selectedBuild={game.selectedBuild} onSelect={game.setSelectedBuild} completedResearch={game.completedResearch} />
      </SheetShell>

      <SheetShell open={openSheet === "research"} onOpenChange={(v) => !v && close()} title="Research" icon={FlaskConical} width="sm:max-w-md">
        <ResearchPanel researchPoints={game.researchPoints} completedResearch={game.completedResearch} onUnlock={game.unlockResearch} />
      </SheetShell>

      <SheetShell open={openSheet === "manage"} onOpenChange={(v) => !v && close()} title="Manage" icon={Settings} width="sm:max-w-md">
        <PlayerProgressPanel level={game.level} xp={game.xp} xpForNext={game.xpForNext} onCheat={game.applyCheat} />
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
          uptime={game.uptime}
          safety={game.safety}
          cleanliness={game.cleanliness}
          entertainment={game.entertainment}
          waterQualityAvg={game.waterQualityAvg}
          waterQualityCriticalCount={game.waterQualityCriticalCount}
          marketShare={game.marketShare}
          popularity={game.popularity}
          popularityTrend={game.popularityTrend}
        />
        <PricingPanel
          pricing={game.pricing}
          ticketPrice={game.ticketPrice}
          weather={game.weather}
          seasonEvent={game.seasonEvent}
          onChange={game.setPricing}
          onTicketChange={game.setTicketPrice}
        />
        <CampaignPanel money={game.money} activeCampaigns={game.activeCampaigns} grid={game.grid} onLaunch={game.launchCampaign} />
      </SheetShell>

      <SheetShell open={openSheet === "resort"} onOpenChange={(v) => !v && close()} title="Resort" icon={Hotel} width="sm:max-w-md">
        <ResortPanel resortRating={game.resortRating} hotelStats={game.hotelStats} hotels={game.hotels} upgrades={game.upgrades} grid={game.grid} guests={game.guests} reputation={game.reputation} />
      </SheetShell>

      <SheetShell open={openSheet === "staff"} onOpenChange={(v) => !v && close()} title="Staff" icon={Users} width="sm:max-w-md">
        <StaffPanel
          money={game.money}
          staff={game.staff}
          staffWages={game.staffWages}
          uptime={game.uptime}
          safety={game.safety}
          cleanliness={game.cleanliness}
          entertainment={game.entertainment}
          onHire={game.hireStaff}
          onFire={game.fireStaff}
          assignments={game.staffAssignments}
          zones={zones}
          onAssign={game.assignStaff}
          staffXp={game.staffXp}
          onTrainStaff={game.trainStaff}
        />
      </SheetShell>

      <SheetShell open={openSheet === "settings"} onOpenChange={(v) => !v && close()} title="Settings" icon={SlidersHorizontal} width="sm:max-w-md">
        <SettingsPanel
          saves={game.saves}
          onSave={game.savePark}
          onLoad={game.loadPark}
          onDelete={game.deleteSave}
          onNewGame={game.resetGame}
          onContinue={close}
          sandbox={game.sandbox}
          onToggleSandbox={game.toggleSandbox}
          loadFromCloud={game.loadFromCloud}
          saveToCloud={game.saveToCloud}
        />
      </SheetShell>

      <SheetShell open={openSheet === "info"} onOpenChange={(v) => !v && close()} title="Park Activity" icon={Activity} width="sm:max-w-lg">
        <Tabs defaultValue="activity">
          <TabsList className="w-full">
            <TabsTrigger value="activity" className="flex-1 gap-1 text-xs"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Insights</TabsTrigger>
            <TabsTrigger value="missions" className="relative flex-1 gap-1 text-xs">
              <Target className="h-3.5 w-3.5" /> Missions
              {claimableMissions > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white ring-2 ring-white">{claimableMissions}</span>}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="activity"><ActivityLog feedback={game.feedback} log={game.log} issueCount={game.incidents.length} guestExperience={game.visitorStats?.guestExperience} /></TabsContent>
          <TabsContent value="insights"><VisitorInsight visitorStats={game.visitorStats} /></TabsContent>
          <TabsContent value="missions"><MissionsPanel level={game.level} xp={game.xp} xpForNext={game.xpForNext} missionState={game.missionState} claimedMissions={game.claimedMissions} onClaim={game.claimMission} /></TabsContent>\n          <TabsContent value="plans"><MasterPlansPanel grid={game.grid} reputation={game.reputation} peakGuests={game.peakGuests} totalUpgrades={game.totalUpgrades} resortRating={game.resortRating} appeal={game.parkAppeal?.score || 50} day={game.day} money={game.money} completedPlans={game.completedMasterPlans} /></TabsContent>
        </Tabs>
      </SheetShell>

      <SheetShell open={openSheet === "conditions"} onOpenChange={(v) => !v && close()} title="Park Conditions & Zoning" icon={CloudSun} width="sm:max-w-md">
        <ParkAppealPanel appeal={game.parkAppeal} reputation={game.reputation} visitorStats={game.visitorStats} />
        <ParkToolbar weather={game.weather} forecast={game.forecast} season={game.season} seasonEvent={game.seasonEvent} guests={game.guests} selectedZone={game.selectedZone} onZoneSelect={game.setSelectedZone} />
      </SheetShell>

      <SheetShell open={openSheet === "trends"} onOpenChange={(v) => !v && close()} title="Ride Trends" icon={Flame} width="sm:max-w-md">
        <RidePopularityPanel grid={game.grid} upgrades={game.upgrades} popularity={game.popularity} popularityTrend={game.popularityTrend} prevPopularity={game.prevPopularity} visitorStats={game.visitorStats} />
      </SheetShell>

      <SheetShell open={openSheet === "events"} onOpenChange={(v) => !v && close()} title="Park Events" icon={CalendarDays} width="sm:max-w-lg">
        <EventsPanel money={game.money} level={game.level} day={game.day} activeEvents={game.activeEvents} onLaunch={game.launchEvent} />
      </SheetShell>

      <SheetShell open={openSheet === "memberships"} onOpenChange={(v) => !v && close()} title="Memberships" icon={Ticket} width="sm:max-w-lg">
        <MembershipsPanel counts={game.membershipCounts} stats={game.membershipStats} level={game.level} />
      </SheetShell>

      <SheetShell open={openSheet === "awards"} onOpenChange={(v) => !v && close()} title="Park Awards" icon={Trophy} width="sm:max-w-lg">
        <AwardsPanel awards={game.awards} awardCeremonyTimer={game.awardCeremonyTimer} awardStats={game.awardStats} evaluation={game.awardEvaluation} />
      </SheetShell>

      <SheetShell open={openSheet === "social"} onOpenChange={(v) => !v && close()} title="Social Media" icon={Share2} width="sm:max-w-lg">
        <SocialMediaPanel socialPosts={game.socialPosts} socialReputation={game.socialReputation} />
      </SheetShell>

      <SheetShell open={openSheet === "emergencies"} onOpenChange={(v) => !v && close()} title="Emergencies" icon={Siren} width="sm:max-w-lg">
        <EmergenciesPanel emergencies={game.emergencies} emergencyStats={game.emergencyStats} />
      </SheetShell>

      <SheetShell open={openSheet === "construction"} onOpenChange={(v) => !v && close()} title="Construction" icon={HardHat} width="sm:max-w-lg">
        <ConstructionPanel
          projects={game.constructionProjects}
          money={game.money}
          day={game.day}
          sandbox={game.sandbox}
          onStartProject={game.startProject}
          attractionCount={game.missionState?.attractionCount || 0}
        />
      </SheetShell>

      <SheetShell open={openSheet === "economy"} onOpenChange={(v) => !v && close()} title="Park Economy" icon={Wallet} width="sm:max-w-lg">
        <EconomyPanel
          history={game.history}
          money={game.money}
          day={game.day}
          grid={game.grid}
          loans={game.loans}
          onTakeLoan={game.takeLoan}
          onRepayLoan={game.repayLoan}
          sandbox={game.sandbox}
        />
      </SheetShell>

      <SheetShell open={openSheet === "empire"} onOpenChange={(v) => !v && close()} title="Waterpark Empire" icon={Crown} width="sm:max-w-lg">
        <EmpirePanel
          empirePoints={game.empirePoints}
          resortBonuses={game.resortBonuses}
          missionState={game.missionState}
          claimedMissions={game.claimedMissions}
          level={game.level}
          resortRating={game.resortRating}
          grid={game.grid}
        />
      </SheetShell>

      <SheetShell open={openSheet === "competitors"} onOpenChange={(v) => !v && close()} title="Rival Parks" icon={Swords} width="sm:max-w-lg">
        <CompetitorsPanel
          competitors={game.competitors}
          playerReputation={game.reputation}
          playerAppeal={game.parkAppeal?.score || 50}
          playerGuests={game.guests}
          playerLevel={game.level}
          marketShare={game.marketShare}
        />
      </SheetShell>

      <SheetShell open={openSheet === "waterQuality"} onOpenChange={(v) => !v && close()} title="Water Quality" icon={Droplets} width="sm:max-w-md">
        <WaterQualityPanel
          grid={game.grid}
          waterQuality={game.waterQuality}
          avgQuality={game.waterQualityAvg}
          criticalCount={game.waterQualityCriticalCount}
          waterAttractionCount={game.grid.filter((id) => id && isWaterAttraction(id)).length}
        />
      </SheetShell>

      <SheetShell open={openSheet === "districts"} onOpenChange={(v) => !v && close()} title="Districts" icon={MapPin} width="sm:max-w-lg">
        <DistrictsPanel
          expansionsDone={game.expansionsDone}
          parkZones={game.parkZones}
          grid={game.grid}
          claimedLegendary={game.claimedLegendary}
          onClaimLegendary={game.claimLegendary}
        />
      </SheetShell>

      <SheetShell open={openSheet === "vipGuests"} onOpenChange={(v) => !v && close()} title="VIP Guests" icon={Star} width="sm:max-w-md">
        <VipGuestsPanel vipVisit={game.vipVisit} vipHistory={game.vipHistory} reputation={game.reputation} />
      </SheetShell>

      <SheetShell open={openSheet === "seasonalCalendar"} onOpenChange={(v) => !v && close()} title="Seasonal Calendar" icon={Clock} width="sm:max-w-lg">
        <SeasonalCalendarPanel day={game.day} activeCalendarEvent={game.activeCalendarEvent} />
      </SheetShell>

      <SheetShell open={openSheet === "rideAging"} onOpenChange={(v) => !v && close()} title="Ride Aging" icon={Wrench} width="sm:max-w-md">
        <RideAgingPanel grid={game.grid} rideAges={game.rideAges} money={game.money} onRefurbish={game.refurbishRide} selectedTile={game.selectedTile} />
      </SheetShell>

      <SheetShell open={openSheet === "leaderboard"} onOpenChange={(v) => !v && close()} title="Leaderboard" icon={Medal} width="sm:max-w-md">
        <LeaderboardPanel
          level={game.level}
          day={game.day}
          reputation={game.reputation}
          guests={game.guests}
          money={game.money}
          empirePoints={game.empirePoints}
          resortRating={game.resortRating}
          peakGuests={game.peakGuests}
          onSubmit={game.submitLeaderboard}
        />
      </SheetShell>

      <SheetShell open={openSheet === "share"} onOpenChange={(v) => !v && close()} title="Share Park" icon={Link2} width="sm:max-w-md">
        <ShareParkPanel
          day={game.day}
          reputation={game.reputation}
          guests={game.guests}
          level={game.level}
          onShare={game.sharePark}
          onViewShared={game.viewSharedPark}
        />
      </SheetShell>

      <SheetShell open={openSheet === "challenges"} onOpenChange={(v) => !v && close()} title="Daily Challenges" icon={Target} width="sm:max-w-md">
        <DailyChallengesPanel challenges={game.dailyChallenges} onClaim={game.claimDailyChallenge} daysUntilRefresh={game.challengeDaysLeft} />
      </SheetShell>

      <SheetShell open={openSheet === "synergies"} onOpenChange={(v) => !v && close()} title="Ride Synergies" icon={Zap} width="sm:max-w-md">
        <SynergyPanel activeSynergies={game.synergyBonuses?.activeSynergies || []} />
      </SheetShell>

      <SheetShell open={openSheet === "themes"} onOpenChange={(v) => !v && close()} title="Park Themes" icon={Palette} width="sm:max-w-md">
        <VisualThemesPanel level={game.level} activeTheme={game.activeTheme} onSelect={game.selectTheme} />
      </SheetShell>

      <SheetShell open={openSheet === "prestige"} onOpenChange={(v) => !v && close()} title="Prestige" icon={RotateCcw} width="sm:max-w-md">
        <PrestigePanel
          level={game.level}
          empirePoints={game.empirePoints}
          lifetimeEarnings={game.lifetimeEarnings}
          prestigeCount={game.prestigeCount}
          onPrestige={game.prestigePark}
        />
      </SheetShell>

      <SheetShell open={openSheet === "rewards"} onOpenChange={(v) => !v && close()} title="Daily Reward" icon={Gift} width="sm:max-w-md">
        <DailyRewardWheel day={game.day} lastRewardDay={game.lastRewardDay} streak={game.rewardStreak} onClaim={game.claimDailyReward} />
      </SheetShell>

      <SheetShell open={openSheet === "mascot"} onOpenChange={(v) => !v && close()} title="Park Mascot" icon={PawPrint} width="sm:max-w-md">
        <MascotPanel level={game.level} activeMascot={game.mascot} onSelect={game.selectMascot} />
      </SheetShell>

      <SheetShell open={openSheet === "reviews"} onOpenChange={(v) => !v && close()} title="Visitor Reviews" icon={MessageSquare} width="sm:max-w-md">
        <VisitorReviewsPanel reviews={game.visitorReviews || []} />
      </SheetShell>

      <SheetShell open={openSheet === "photo"} onOpenChange={(v) => !v && close()} title="Park Photo" icon={Camera} width="sm:max-w-md">
        <ParkPhotoMode game={game} />
      </SheetShell>
    </>
  );
}