import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hammer, Settings, Users, Activity, BarChart3, Target, CloudSun, FlaskConical, SlidersHorizontal, Hotel, Flame, CalendarDays, Ticket, Trophy, Share2 } from "lucide-react";
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
import { getHotelDef, hotelRooms, isHotelItem } from "@/data/hotels";

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
        <ResortPanel resortRating={game.resortRating} hotelStats={game.hotelStats} hotels={game.hotels} upgrades={game.upgrades} />
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
          <TabsContent value="missions"><MissionsPanel level={game.level} xp={game.xp} xpForNext={game.xpForNext} missionState={game.missionState} claimedMissions={game.claimedMissions} onClaim={game.claimMission} /></TabsContent>
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
    </>
  );
}