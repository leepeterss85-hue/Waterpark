import { useState, useEffect, useCallback, useRef } from "react";
import {
  getParkItem, STAFF, MAX_UPGRADE, upgradeCost,
  INITIAL_GRID_SIZE, EXPAND_ROW, MAX_EXPANSIONS, MAX_GRID_SIZE,
  expandCost, expandLevelReq, levelFromXp, xpForLevel, staffWages, staffEffects,
} from "@/data/gameData";
import { WEATHER, getSeason, rollWeather, rollSeasonEvent } from "@/data/parkSystems";
import { MISSIONS, missionProgress } from "@/data/missions";
import { RESEARCH, researchReqFor } from "@/data/research";
import { trackEvent } from "@/lib/gameAnalytics";
import { getSettings, getDifficulty, saveSettings } from "@/lib/settings";
import { CAMPAIGNS, campaignEffectiveness, getCampaign } from "@/data/campaigns";
import { getHotelDef } from "@/data/hotels";
import { getStarterPark } from "@/data/starterParks";
import { calculateParkAppeal } from "@/data/parkThemes";
import { DEFAULT_PRICING } from "@/data/pricing";
import { DEFAULT_POPULARITY, NEW_RIDE_TREND_BOOST } from "@/data/popularity";
import { getEvent, isEventAvailable, checkEventRequirements, checkEventConflict } from "@/data/parkEvents";
import { MEMBERSHIP_TIERS } from "@/data/memberships";
import { AWARD_CATEGORIES, AWARD_CEREMONY_CYCLE, evaluateAwards, totalAwardGuestMult } from "@/data/awards";
import { EMERGENCY_TYPES } from "@/data/emergencies";
import { PROJECT_TYPES } from "@/data/construction";
import { LOAN_TERMS, createLoan } from "@/data/loans";
import { EMPIRE_TIERS, getEmpireTier, calculateResortBonuses } from "@/data/empire";
import { createCompetitors } from "@/data/competitors";
import { createInitialWaterQuality, isWaterAttraction } from "@/data/waterQuality";
import { DISTRICTS, checkDistrictLegendary } from "@/data/districts";
import { VIP_TYPES, rollVipVisit } from "@/data/vipGuests";
import { initRideAges, refurbishCost } from "@/data/rideAging";
import { rollDailyChallenges, CHALLENGE_REFRESH_DAYS } from "@/data/dailyChallenges";
import { calculatePrestigePoints, prestigeMultiplier, PRESTIGE_LEVEL_REQ } from "@/data/prestige";
import { getTheme as getVisualTheme } from "@/data/visualThemes";
import { calculateEcoBonuses } from "@/data/ecoItems";
import { getMascot } from "@/data/mascots";
import { canClaimReward } from "@/data/dailyRewards";
import { DEFAULT_MORALE, bonusCost, MORALE_RESTORE_TARGET } from "@/data/staffMorale";
import { trainingCost, staffLevelFromXp } from "@/data/staffTraining";
import { SPONSOR_DURATION, MAX_SPONSORS, getTier } from "@/data/sponsorships";
import { createCounterStrike, counterStrikeCost } from "@/data/marketWarfare";
import { calculateMasterPlanBonuses, DEFAULT_MASTER_PLAN_BONUSES } from "@/data/masterPlans";
import { ACQUISITION_TARGETS, FRANCHISE_MAPS, empireBonuses } from "@/data/parkEmpire";
import { buildSavePayload } from "@/lib/savePayload";
import { runDay } from "@/hooks/runDay";
import { base44 } from "@/api/base44Client";
import { sound } from "@/lib/soundManager";
import { MEGA_PROJECTS, DESTINATIONS, megaBonuses as calculateMegaBonuses, waterEngineering } from "@/data/advancedParkSystems";
import { DEFAULT_PARK_STRATEGY, strategyFor, packageFor, masteryEffects } from "@/data/parkMastery";
import { PARK_SCENARIOS, getScenario } from "@/data/scenarios";

const STORAGE_KEY = "waterpark-tycoon-save-v1";
const FIRST_ATTRACTION_BONUS = 5000;
const SLOTS_KEY = "waterpark-tycoon-slots";
const GRID_SIZE = INITIAL_GRID_SIZE;
const INITIAL_MONEY = 50000;
const SAVE_SCHEMA_VERSION = 2;

function normalizeArrayLength(value, length, fillValue) {
  const source = Array.isArray(value) ? value : [];
  if (source.length === length) return source;
  const next = Array(length);
  for (let i = 0; i < length; i += 1) {
    next[i] = source[i] !== undefined ? source[i] : (typeof fillValue === "function" ? fillValue(i) : fillValue);
  }
  return next;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function safeNumber(value, fallback, { min = -Infinity, max = Infinity } = {}) {
  if (!isFiniteNumber(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function isValidSavedGrid(value) {
  return Array.isArray(value) && value.length >= GRID_SIZE && value.length <= MAX_GRID_SIZE;
}

const DEFAULT_TICKET_PRICE = 28;
const DEFAULT_AD_BUDGET = 250;
const DEFAULT_STAFF = Object.fromEntries(Object.keys(STAFF).map((id) => [id, 0]));

function makeStartingGrid() {
  const g = Array(GRID_SIZE).fill(null);
  g[GRID_SIZE - 8] = "park_entrance";
  g[GRID_SIZE - 7] = "main_path";
  g[GRID_SIZE - 6] = "main_path";
  g[GRID_SIZE - 5] = "main_path";
  return g;
}

function makeEmptyZones(size) {
  return Array(size).fill(null);
}

function readSlots() {
  try { return JSON.parse(localStorage.getItem(SLOTS_KEY) || "{}"); } catch { return {}; }
}

function writeSlots(obj) {
  try { localStorage.setItem(SLOTS_KEY, JSON.stringify(obj)); } catch { /* ignore */ }
}

function slotMeta(name, s) {
  return { name, savedAt: s.savedAt, day: s.day, money: s.money, reputation: s.reputation, guests: s.guests };
}

export function useGameState() {
  const [money, setMoney] = useState(INITIAL_MONEY);
  const [day, setDay] = useState(1);
  const [reputation, setReputation] = useState(50);
  const [guests, setGuests] = useState(0);
  const [grid, setGrid] = useState(() => makeStartingGrid());
  const [parkZones, setParkZones] = useState(() => makeEmptyZones(GRID_SIZE));
  const [selectedZone, setSelectedZone] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [weather, setWeather] = useState(WEATHER[0]);
  const [forecast, setForecast] = useState(WEATHER[1]);
  const [seasonEvent, setSeasonEvent] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(DEFAULT_TICKET_PRICE);
  const [adBudget, setAdBudget] = useState(DEFAULT_AD_BUDGET);
  const [priorityPass, setPriorityPass] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [lastBuildAction, setLastBuildAction] = useState(null);
  const [vipVisit, setVipVisit] = useState(null);
  const [lastNet, setLastNet] = useState(0);
  const [log, setLog] = useState([{ day: 0, text: "Welcome to your new water park! Place an attraction to get started." }]);
  const [history, setHistory] = useState([]);
  const [staff, setStaff] = useState(DEFAULT_STAFF);
  const [staffAssignments, setStaffAssignments] = useState({});
  const [saves, setSaves] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [attractionCondition, setAttractionCondition] = useState(() => Array(GRID_SIZE).fill(100));
  const [upgrades, setUpgrades] = useState(() => Array(GRID_SIZE).fill(0));
  const [xp, setXp] = useState(0);
  const [expansionsDone, setExpansionsDone] = useState(0);
  const [peakGuests, setPeakGuests] = useState(0);
  const [totalUpgrades, setTotalUpgrades] = useState(0);
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [builtAttractionIds, setBuiltAttractionIds] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
  const [feedback, setFeedback] = useState([]);
  const [researchPoints, setResearchPoints] = useState(0);
  const [completedResearch, setCompletedResearch] = useState([]);
  const [parkAppeal, setParkAppeal] = useState(() => ({ score: 50, label: "Untouched", zones: [], bestZone: null, coverage: 0, variety: 0, scenery: 0 }));
  const [disaster, setDisaster] = useState(null);
  const [disastersSurvived, setDisastersSurvived] = useState(0);
  const [sandbox, setSandbox] = useState(getSettings().sandbox || false);
  const [gameMode, setGameMode] = useState(() => getSettings().gameMode || "freeplay");
  const [storyStep, setStoryStep] = useState(() => getSettings().storyStep || 0);
  const [storyCompleted, setStoryCompleted] = useState(() => getSettings().storyCompleted || false);
  const [sandboxSettings, setSandboxSettings] = useState(() => ({ unlimitedCash: true, unlockAll: false, guestDemandMult: 1, instantConstruction: false, weatherLock: false, weather: null }));
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [hotelGuests, setHotelGuests] = useState([]);
  const [hotelStats, setHotelStats] = useState({ roomRevenue: 0, hotelExpenses: 0, parkSpend: 0, occupancy: 0, avgHappiness: 0, totalGuests: 0, totalRooms: 0, guestsByHotel: {} });
  const [resortRating, setResortRating] = useState(0);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [popularity, setPopularity] = useState(() => Array(GRID_SIZE).fill(0));
  const [popularityTrend, setPopularityTrend] = useState(() => Array(GRID_SIZE).fill(0));
  const [prevPopularity, setPrevPopularity] = useState(() => Array(GRID_SIZE).fill(0));
  const [activeEvents, setActiveEvents] = useState([]);
  const [membershipCounts, setMembershipCounts] = useState({ season_pass: 0, family_membership: 0, vip_membership: 0 });
  const [membershipTimers, setMembershipTimers] = useState({ season_pass: 30, family_membership: 30, vip_membership: 30 });
  const [membershipStats, setMembershipStats] = useState({ totalMembers: 0, dailyRevenue: 0, totalRevenue: 0, memberVisits: 0, memberSpend: 0, totalRenewed: 0, totalChurned: 0 });
  const [awards, setAwards] = useState([]);
  const [awardCeremonyTimer, setAwardCeremonyTimer] = useState(AWARD_CEREMONY_CYCLE);
  const [awardStats, setAwardStats] = useState({ totalWon: 0, ceremoniesHeld: 0, currentGuestMult: 1 });
  const [socialPosts, setSocialPosts] = useState([]);
  const [socialReputation, setSocialReputation] = useState(50);
  const [emergencies, setEmergencies] = useState([]);
  const [emergencyStats, setEmergencyStats] = useState({ totalEmergencies: 0, totalCost: 0, resolvedCount: 0 });
  const [constructionProjects, setConstructionProjects] = useState([]);
  const [loans, setLoans] = useState([]);
  const [returnVisitorMult, setReturnVisitorMult] = useState(1.0);
  const [empirePoints, setEmpirePoints] = useState(0);
  const [competitors, setCompetitors] = useState(() => createCompetitors(1));
  const [marketShare, setMarketShare] = useState(100);
  const [waterQuality, setWaterQuality] = useState(() => createInitialWaterQuality(GRID_SIZE));
  const [rideAges, setRideAges] = useState(() => initRideAges(GRID_SIZE));
  const [vipHistory, setVipHistory] = useState([]);
  const [claimedLegendary, setClaimedLegendary] = useState([]);
  const [activeCalendarEvent, setActiveCalendarEvent] = useState(null);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [challengeDayCounter, setChallengeDayCounter] = useState(0);
  const [autoPricing, setAutoPricing] = useState(false);
  const [activeTheme, setActiveTheme] = useState("tropical");
  const [prestigeCount, setPrestigeCount] = useState(0);
  const [synergyBonuses, setSynergyBonuses] = useState({ totalIncomeMult: 0, totalAppealBonus: 0, activeSynergies: [] });
  const [builtToday, setBuiltToday] = useState(0);
  const [upgradedToday, setUpgradedToday] = useState(0);
  const [mascot, setMascot] = useState(null);
  const [lastRewardDay, setLastRewardDay] = useState(null);
  const [rewardStreak, setRewardStreak] = useState(0);
  const [visitorReviews, setVisitorReviews] = useState([]);
  const [staffXp, setStaffXp] = useState({});
  const [staffMorale, setStaffMorale] = useState(DEFAULT_MORALE);
  const [wageBoost, setWageBoost] = useState(false);
  const [sponsorships, setSponsorships] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [activeStrikes, setActiveStrikes] = useState([]);
  const [completedMasterPlans, setCompletedMasterPlans] = useState([]);
  const [masterPlanBonuses, setMasterPlanBonuses] = useState(DEFAULT_MASTER_PLAN_BONUSES);
  const [guestMemory, setGuestMemory] = useState({});
  const [retailStock, setRetailStock] = useState({ food: 0, retail: 0, services: 0 });
  const [retailStats, setRetailStats] = useState({ revenue: 0, restockCost: 0, served: { food: 0, retail: 0, services: 0 }, unmetFood: 0, stockHealth: { food: 100, retail: 100, services: 100 } });
  const [completedChains, setCompletedChains] = useState([]);
  const [completedCampaignChapters, setCompletedCampaignChapters] = useState([]);
  const [acquiredRivals, setAcquiredRivals] = useState([]);
  const [franchiseMaps, setFranchiseMaps] = useState([]);
  const [megaProjects, setMegaProjects] = useState([]);
  const [guestStories, setGuestStories] = useState([]);
  const [currentDestination, setCurrentDestination] = useState("home_resort");
  const [parkStrategy, setParkStrategyState] = useState(DEFAULT_PARK_STRATEGY);
  const [mastery, setMastery] = useState({ points: 0, completed: [] });
  const [resortMilestones, setResortMilestones] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioStatus, setScenarioStatus] = useState("idle");

  const level = levelFromXp(xp);
  const gridSize = grid.length;

  /** @type {import("react").MutableRefObject<Record<string, any>>} */
  const stateRef = useRef({});
  stateRef.current = { parkStrategy, mastery, sandboxSettings, money, day, reputation, guests, grid, parkZones, history, log, lastNet, staff, staffAssignments, incidents, upgrades, attractionCondition, challenge, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, sandbox, activeCampaigns, sandboxSettings, hotelGuests, hotelStats, resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents, membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer, awardStats, socialPosts, socialReputation, emergencies, emergencyStats, constructionProjects, loans, returnVisitorMult, empirePoints, competitors, marketShare, waterQuality, rideAges, vipHistory, claimedLegendary, activeCalendarEvent, dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses, builtToday, upgradedToday, mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp, staffMorale, wageBoost, sponsorships, groupBookings, acceptedBookings, activeStrikes, completedMasterPlans, masterPlanBonuses, guestMemory, retailStock, retailStats, completedChains, completedCampaignChapters, acquiredRivals, franchiseMaps, megaProjects, guestStories, currentDestination, resortMilestones, activeScenario, scenarioStatus, gameMode, storyStep, storyCompleted, guestMemory, retailStock, retailStats, completedChains, completedCampaignChapters, acquiredRivals, franchiseMaps };

  // Load saved game
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid save payload");
      if (data.money != null) setMoney(safeNumber(data.money, INITIAL_MONEY, { min: 0 }));
      if (data.day != null) setDay(Math.floor(safeNumber(data.day, 1, { min: 1 })));
      if (data.reputation != null) setReputation(safeNumber(data.reputation, 50, { min: 0, max: 100 }));
      setGuests(Math.floor(safeNumber(data.guests ?? data.history?.[data.history.length - 1]?.guests, 0, { min: 0 })));
      if (isValidSavedGrid(data.grid)) {
        const loadedGrid = [...data.grid];
        setGrid(loadedGrid);
        setParkZones(normalizeArrayLength(data.parkZones, loadedGrid.length, null));
        setAttractionCondition(normalizeArrayLength(data.attractionCondition, loadedGrid.length, 100));
        setUpgrades(normalizeArrayLength(data.upgrades, loadedGrid.length, 0));
        setPopularity(normalizeArrayLength(data.popularity, loadedGrid.length, 0));
        setPopularityTrend(normalizeArrayLength(data.popularityTrend, loadedGrid.length, 0));
        setPrevPopularity(normalizeArrayLength(data.prevPopularity, loadedGrid.length, 0));
        setWaterQuality(normalizeArrayLength(data.waterQuality, loadedGrid.length, 100));
        setRideAges(normalizeArrayLength(data.rideAges, loadedGrid.length, 0));
      } else {
        const fallbackGrid = makeStartingGrid();
        setGrid(fallbackGrid);
        setParkZones(makeEmptyZones(fallbackGrid.length));
        setAttractionCondition(Array(fallbackGrid.length).fill(100));
        setUpgrades(Array(fallbackGrid.length).fill(0));
        setPopularity(Array(fallbackGrid.length).fill(0));
        setPopularityTrend(Array(fallbackGrid.length).fill(0));
        setPrevPopularity(Array(fallbackGrid.length).fill(0));
        setWaterQuality(Array(fallbackGrid.length).fill(100));
        setRideAges(Array(fallbackGrid.length).fill(0));
      }
      if (data.weather) setWeather(data.weather);
      if (data.forecast) setForecast(data.forecast);
      if (data.seasonEvent) setSeasonEvent(data.seasonEvent);
      if (data.ticketPrice != null) setTicketPrice(data.ticketPrice);
      if (data.adBudget != null) setAdBudget(data.adBudget);
      if (data.priorityPass != null) setPriorityPass(data.priorityPass);
      if (data.vipVisit !== undefined) setVipVisit(data.vipVisit);
      if (data.history) setHistory(data.history);
      if (data.staff) setStaff({ ...DEFAULT_STAFF, ...data.staff });
      if (data.staffAssignments) setStaffAssignments(data.staffAssignments);
      if (data.incidents) setIncidents(data.incidents);
      if (data.xp != null) setXp(safeNumber(data.xp, 0, { min: 0 }));
      if (data.expansionsDone != null) setExpansionsDone(Math.floor(safeNumber(data.expansionsDone, 0, { min: 0, max: MAX_EXPANSIONS })));
      if (data.peakGuests != null) setPeakGuests(Math.floor(safeNumber(data.peakGuests, 0, { min: 0 })));
      if (data.totalUpgrades != null) setTotalUpgrades(Math.floor(safeNumber(data.totalUpgrades, 0, { min: 0 })));
      if (data.claimedMissions) setClaimedMissions(data.claimedMissions);
      if (data.challenge) setChallenge(data.challenge);
      if (data.lifetimeEarnings != null) setLifetimeEarnings(data.lifetimeEarnings);
      if (data.builtAttractionIds) setBuiltAttractionIds(data.builtAttractionIds);
      if (data.visitorStats) setVisitorStats(data.visitorStats);
      if (data.feedback) setFeedback(data.feedback);
      if (data.researchPoints != null) setResearchPoints(data.researchPoints);
      if (data.completedResearch) setCompletedResearch(data.completedResearch);
      if (data.parkAppeal) setParkAppeal(data.parkAppeal);
      setDisaster(data.disaster ?? null);
      if (data.disastersSurvived != null) setDisastersSurvived(data.disastersSurvived);
      setActiveCampaigns(data.activeCampaigns ?? []);
      setHotelGuests(data.hotelGuests ?? []);
      setHotelStats(data.hotelStats ?? { roomRevenue: 0, hotelExpenses: 0, parkSpend: 0, occupancy: 0, avgHappiness: 0, totalGuests: 0, totalRooms: 0, guestsByHotel: {} });
      setResortRating(data.resortRating ?? 0);
      if (data.pricing) setPricing({ ...DEFAULT_PRICING, ...data.pricing });
      setActiveEvents(data.activeEvents ?? []);
      setMembershipCounts(data.membershipCounts ?? { season_pass: 0, family_membership: 0, vip_membership: 0 });
      setMembershipTimers(data.membershipTimers ?? { season_pass: 30, family_membership: 30, vip_membership: 30 });
      setMembershipStats(data.membershipStats ?? { totalMembers: 0, dailyRevenue: 0, totalRevenue: 0, memberVisits: 0, memberSpend: 0, totalRenewed: 0, totalChurned: 0 });
      setAwards(data.awards ?? []);
      if (data.awardCeremonyTimer != null) setAwardCeremonyTimer(data.awardCeremonyTimer);
      if (data.awardStats) setAwardStats(data.awardStats);
      setSocialPosts(data.socialPosts ?? []);
      if (data.socialReputation != null) setSocialReputation(data.socialReputation);
      setEmergencies(data.emergencies ?? []);
      setEmergencyStats(data.emergencyStats ?? { totalEmergencies: 0, totalCost: 0, resolvedCount: 0 });
      setConstructionProjects(data.constructionProjects ?? []);
      setLoans(data.loans ?? []);
      if (data.returnVisitorMult != null) setReturnVisitorMult(data.returnVisitorMult);
      if (data.empirePoints != null) setEmpirePoints(data.empirePoints);
      setCompetitors(data.competitors ?? createCompetitors(data.day ?? 1));
      setMarketShare(data.marketShare ?? 100);
      setVipHistory(data.vipHistory ?? []);
      setClaimedLegendary(data.claimedLegendary ?? []);
      setActiveCalendarEvent(data.activeCalendarEvent ?? null);
      setDailyChallenges(data.dailyChallenges ?? []);
      if (data.challengeDayCounter != null) setChallengeDayCounter(data.challengeDayCounter);
      if (data.autoPricing != null) setAutoPricing(data.autoPricing);
      if (data.activeTheme) setActiveTheme(data.activeTheme);
      if (data.prestigeCount != null) setPrestigeCount(data.prestigeCount);
      setSynergyBonuses(data.synergyBonuses ?? { totalIncomeMult: 0, totalAppealBonus: 0, activeSynergies: [] });
      if (data.mascot !== undefined) setMascot(data.mascot);
      if (data.lastRewardDay !== undefined) setLastRewardDay(data.lastRewardDay);
      if (data.rewardStreak !== undefined) setRewardStreak(data.rewardStreak);
      setVisitorReviews(data.visitorReviews ?? []);
      setStaffXp(data.staffXp ?? {});
      if (data.staffMorale != null) setStaffMorale(data.staffMorale);
      if (data.wageBoost != null) setWageBoost(data.wageBoost);
      setSponsorships(data.sponsorships ?? []);
      setGroupBookings(data.groupBookings ?? []);
      setAcceptedBookings(data.acceptedBookings ?? []);
      setCompletedMasterPlans(Array.isArray(data.completedMasterPlans) ? data.completedMasterPlans : []);
      setMasterPlanBonuses(calculateMasterPlanBonuses(Array.isArray(data.completedMasterPlans) ? data.completedMasterPlans : []));
      setBuiltToday(data.builtToday ?? 0);
      setMegaProjects(data.megaProjects ?? []);
      setGuestStories(data.guestStories ?? []);
      setCurrentDestination(data.currentDestination ?? "home_resort");
    setResortMilestones(Array.isArray(data.resortMilestones) ? data.resortMilestones : []);
      if (data.parkStrategy) setParkStrategyState({ ...DEFAULT_PARK_STRATEGY, ...data.parkStrategy });
      if (data.mastery) setMastery({ points: Math.max(0, Number(data.mastery.points) || 0), completed: Array.isArray(data.mastery.completed) ? data.mastery.completed : [] });
      if (data.activeScenario) setActiveScenario(data.activeScenario);
      if (data.scenarioStatus) setScenarioStatus(data.scenarioStatus);
      setResortMilestones(Array.isArray(data.resortMilestones) ? data.resortMilestones : []);
      if (data.gameMode) setGameMode(data.gameMode);
      if (data.storyStep != null) setStoryStep(data.storyStep);
      if (data.storyCompleted != null) setStoryCompleted(data.storyCompleted);
      if (data.sandboxSettings) setSandboxSettings({ unlimitedCash: true, unlockAll: false, guestDemandMult: 1, instantConstruction: false, weatherLock: false, weather: null, ...data.sandboxSettings });
      setUpgradedToday(data.upgradedToday ?? 0);
    } catch { /* ignore */ }
  }, []);

  // Persist
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ saveVersion: SAVE_SCHEMA_VERSION, savedAt: Date.now(), ...stateRef.current })); } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [parkStrategy, mastery, money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, incidents, attractionCondition, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, sandboxSettings, hotelGuests, hotelStats, resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents, membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer, awardStats, socialPosts, socialReputation, emergencies, emergencyStats, constructionProjects, loans, returnVisitorMult, empirePoints, competitors, marketShare, waterQuality, rideAges, vipHistory, claimedLegendary, activeCalendarEvent, dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses, mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp, staffMorale, wageBoost, sponsorships,     groupBookings, acceptedBookings, activeStrikes, completedMasterPlans, masterPlanBonuses, megaProjects, guestStories, currentDestination, resortMilestones, gameMode, storyStep, storyCompleted, activeScenario, scenarioStatus, log, guestMemory, retailStock, retailStats, completedChains, completedCampaignChapters, acquiredRivals, franchiseMaps]);

  // Flush save on background/close
  useEffect(() => {
    const flushSave = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ saveVersion: SAVE_SCHEMA_VERSION, savedAt: Date.now(), ...stateRef.current })); } catch { /* ignore */ } };
    const handleVisibility = () => { if (document.visibilityState === "hidden") flushSave(); };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", flushSave);
    return () => { document.removeEventListener("visibilitychange", handleVisibility); window.removeEventListener("pagehide", flushSave); };
  }, []);

  useEffect(() => {
    const slots = readSlots();
    setSaves(Object.entries(slots).map(([name, s]) => slotMeta(name, s)));
  }, []);

  const advanceDay = useCallback(() => {
    runDay(stateRef, {
      setMoney, setDay, setReputation, setGuests, setGrid, setParkZones, setUpgrades,
      setAttractionCondition, setPopularity, setPopularityTrend, setPrevPopularity,
      setWaterQuality, setRideAges, setWeather, setForecast, setSeasonEvent, setIncidents,
      setParkAppeal, setSynergyBonuses, setHotelGuests, setResortRating, setHotelStats,
      setMembershipCounts, setMembershipTimers, setMembershipStats, setEmergencies,
      setEmergencyStats, setSocialPosts, setSocialReputation, setLoans, setReturnVisitorMult,
      setEmpirePoints, setCompetitors, setMarketShare, setVisitorStats, setFeedback,
      setLifetimeEarnings, setVisitorReviews, setStaffXp, setStaffMorale, setAcceptedBookings,
      setGroupBookings, setSponsorships, setActiveCalendarEvent, setChallenge, setVipVisit,
      setGuestMemory, setRetailStock, setRetailStats, setCompletedChains, setCompletedCampaignChapters,
      setVipHistory, setActiveCampaigns, setActiveEvents, setDisaster, setDisastersSurvived,
      setAwards, setAwardCeremonyTimer, setAwardStats, setConstructionProjects,
      setExpansionsDone, setBuiltAttractionIds, setDailyChallenges, setChallengeDayCounter,
      setBuiltToday, setUpgradedToday, setTicketPrice, setLog, setLastNet, setHistory, setPeakGuests,
      setResearchPoints, setXp, setCompletedMasterPlans, setMasterPlanBonuses, setActiveStrikes,
      setMegaProjects, setGuestStories, setMastery, setResortMilestones,
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(advanceDay, 8000 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, advanceDay]);

  const placeAttraction = useCallback((index) => {
    if (!selectedBuild) return;
    const attr = getParkItem(selectedBuild);
    if (!attr) return;
    if (!sandbox && money < attr.cost) { sound.reject(); return; }
    setGrid((g) => {
      if (g[index]) return g;
      const ng = [...g];
      ng[index] = selectedBuild;
      setParkAppeal(calculateParkAppeal({ grid: ng, zones: parkZones, getItem: getParkItem }));
      return ng;
    });
    setPopularity((p) => { const n = [...p]; while (n.length <= index) n.push(0); n[index] = attr.category === "attraction" ? DEFAULT_POPULARITY : 0; return n; });
    setPopularityTrend((t) => { const n = [...t]; while (n.length <= index) n.push(0); n[index] = attr.category === "attraction" ? NEW_RIDE_TREND_BOOST : 0; return n; });
    setPrevPopularity((p) => { const n = [...p]; while (n.length <= index) n.push(0); n[index] = 0; return n; });
    if (!sandbox) setMoney((m) => m - attr.cost);
    if (attr.category === "attraction") {
      const isFirst = !builtAttractionIds.length;
      setBuiltAttractionIds((ids) => (ids.includes(selectedBuild) ? ids : [...ids, selectedBuild]));
      if (isFirst && !sandbox) {
        setMoney((m) => m + FIRST_ATTRACTION_BONUS);
        setLog((l) => [{ day, text: `Day ${day}: 🎉 Grand Opening bonus! +$${FIRST_ATTRACTION_BONUS.toLocaleString()} for your first attraction.` }, ...l].slice(0, 12));
      }
    }
    setLastBuildAction({ index, id: selectedBuild, cost: attr.cost });
    setBuiltToday((b) => b + 1);
    trackEvent("attraction_built", { id: selectedBuild, category: attr.category, cost: attr.cost });
  }, [selectedBuild, money, parkZones, sandbox, builtAttractionIds, day]);

  const paintZone = useCallback((index) => {
    if (!selectedZone) return;
    setParkZones((z) => { const nz = [...z]; nz[index] = selectedZone; setParkAppeal(calculateParkAppeal({ grid, zones: nz, getItem: getParkItem })); return nz; });
  }, [selectedZone, grid]);

  const handleTileClick = useCallback((index) => {
    if (selectedZone) paintZone(index);
    else if (grid[index]) setSelectedTile(index);
    else if (selectedBuild) placeAttraction(index);
  }, [grid, selectedBuild, selectedZone, placeAttraction, paintZone]);

  const sellAttraction = useCallback((index) => {
    setGrid((g) => {
      if (!g[index]) return g;
      const attr = getParkItem(g[index]);
      setMoney((m) => m + Math.floor((attr?.cost || 0) * 0.5));
      setUpgrades((u) => { const nu = [...u]; nu[index] = 0; return nu; });
      setIncidents((items) => items.filter((item) => item.tileIndex !== index));
      setAttractionCondition((c) => { const next = [...c]; next[index] = 100; return next; });
      setRideAges((ages) => { const next = [...ages]; next[index] = 0; return next; });
      setParkZones((zones) => { const next = [...zones]; next[index] = null; return next; });
      setPopularity((p) => { const n = [...p]; if (n[index] != null) n[index] = 0; return n; });
      setPopularityTrend((t) => { const n = [...t]; if (n[index] != null) n[index] = 0; return n; });
      setPrevPopularity((p) => { const n = [...p]; if (n[index] != null) n[index] = 0; return n; });
      const ng = [...g]; ng[index] = null; return ng;
    });
    setHotelGuests((guests) => guests.filter((g) => g.hotelTile !== index));
    trackEvent("attraction_sold", { id: grid[index] });
    setSelectedTile(null);
  }, []);

  const undoLastBuild = useCallback(() => {
    if (!lastBuildAction) return;
    const { index, id, cost } = lastBuildAction;
    setGrid((g) => { if (g[index] !== id) return g; const ng = [...g]; ng[index] = null; return ng; });
    setMoney((m) => m + cost);
    setUpgrades((u) => { const nu = [...u]; nu[index] = 0; return nu; });
    setIncidents((items) => items.filter((item) => item.tileIndex !== index));
    setAttractionCondition((c) => { const next = [...c]; next[index] = 100; return next; });
    setParkZones((z) => { const next = [...z]; next[index] = null; return next; });
    setLastBuildAction(null);
    setSelectedTile(null);
    trackEvent("build_undone", { id });
  }, [lastBuildAction]);

  const upgradeAttraction = useCallback((index) => {
    const id = grid[index];
    if (!id) return;
    const attr = getParkItem(id);
    if (!attr || attr.category === "environment") return;
    const lvl = upgrades[index] || 0;
    if (lvl >= MAX_UPGRADE) return;
    const cost = upgradeCost(attr.cost, lvl);
    if (!sandbox && money < cost) return;
    setUpgrades((u) => { const nu = [...u]; nu[index] = lvl + 1; return nu; });
    if (!sandbox) setMoney((m) => m - cost);
    setTotalUpgrades((t) => t + 1);
    setXp((x) => x + 15);
    setUpgradedToday((u) => u + 1);
    sound.upgrade();
    trackEvent("attraction_upgraded", { id, level: lvl + 1, cost });
  }, [grid, upgrades, money, sandbox]);

  const hireStaff = useCallback((type) => { setStaff((s) => ({ ...s, [type]: (s[type] || 0) + 1 })); sound.hire(); trackEvent("staff_hired", { type }); }, []);
  const fireStaff = useCallback((type) => { setStaff((s) => ({ ...s, [type]: Math.max(0, (s[type] || 0) - 1) })); trackEvent("staff_fired", { type }); }, []);
  const assignStaff = useCallback((type, zone) => { setStaffAssignments((current) => ({ ...current, [type]: zone || "" })); trackEvent("staff_assigned", { type, zone: zone || "park-wide" }); }, []);

  const trainStaff = useCallback((type) => {
    const currentXp = staffXp[type] || 0;
    const cost = trainingCost(type, currentXp);
    const count = staff[type] || 0;
    if (count <= 0) return;
    if (staffLevelFromXp(currentXp) >= 5) return;
    if (!sandbox && money < cost) return;
    if (!sandbox) setMoney((m) => m - cost);
    setStaffXp((prev) => ({ ...prev, [type]: (prev[type] || 0) + 150 }));
    sound.upgrade();
    trackEvent("staff_trained", { type, cost });
  }, [staffXp, staff, money, sandbox]);

  const payStaffBonus = useCallback(() => {
    const currentMorale = stateRef.current.staffMorale ?? DEFAULT_MORALE;
    const cost = bonusCost(currentMorale);
    if (cost <= 0) return;
    if (!sandbox && money < cost) return;
    if (!sandbox) setMoney((m) => m - cost);
    setStaffMorale(MORALE_RESTORE_TARGET);
    setLog((l) => [{ day, text: `Day ${day}: 💚 Staff bonus paid ($${cost.toLocaleString()}). Morale restored to ${MORALE_RESTORE_TARGET}.` }, ...l].slice(0, 12));
    trackEvent("staff_bonus_paid", { cost });
  }, [money, sandbox, day]);

  const toggleWageBoost = useCallback(() => {
    setWageBoost((prev) => {
      const next = !prev;
      setLog((l) => [{ day, text: `Day ${day}: ${next ? "💵 Wage boost enabled (+20% pay, faster morale recovery)." : "Wage boost disabled."}` }, ...l].slice(0, 12));
      return next;
    });
    trackEvent("wage_boost_toggled", {});
  }, [day]);

  const acceptSponsor = useCallback((tierId) => {
    const tier = getTier(tierId);
    if (!tier) return;
    if (level < tier.minLevel) return;
    if ((stateRef.current.sponsorships || []).length >= MAX_SPONSORS) return;
    if ((stateRef.current.sponsorships || []).some((s) => s.id === tierId)) return;
    setSponsorships((prev) => [...prev, { id: tier.id, name: tier.name, tier: tier.tier, dailyIncome: tier.dailyIncome, appealCost: tier.appealCost, daysLeft: SPONSOR_DURATION }]);
    setLog((l) => [{ day, text: `Day ${day}: 🤝 Signed ${tier.name} sponsorship: +$${tier.dailyIncome.toLocaleString()}/day, -${tier.appealCost} appeal for ${SPONSOR_DURATION} days.` }, ...l].slice(0, 12));
    trackEvent("sponsor_accepted", { id: tierId });
  }, [level, day]);

  const endSponsor = useCallback((tierId) => {
    const sp = (stateRef.current.sponsorships || []).find((s) => s.id === tierId);
    if (!sp) return;
    setSponsorships((prev) => prev.filter((s) => s.id !== tierId));
    setLog((l) => [{ day, text: `Day ${day}: Ended sponsorship with ${sp.name}. Appeal recovered.` }, ...l].slice(0, 12));
    trackEvent("sponsor_ended", { id: tierId });
  }, [day]);

  const acceptBooking = useCallback((bookingId) => {
    const booking = (stateRef.current.groupBookings || []).find((b) => b.id === bookingId);
    if (!booking) return;
    setGroupBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setAcceptedBookings((prev) => [...prev, { id: booking.id, name: booking.name, size: booking.size, moodImpact: booking.moodImpact }]);
    if (!sandbox) setMoney((m) => m + booking.payment);
    setLog((l) => [{ day, text: `Day ${day}: 🚌 Accepted ${booking.name} (${booking.size} guests, +$${booking.payment.toLocaleString()}). They arrive tomorrow.` }, ...l].slice(0, 12));
    trackEvent("group_booking_accepted", { id: bookingId, size: booking.size, payment: booking.payment });
  }, [day, sandbox]);

  const declineBooking = useCallback((bookingId) => {
    setGroupBookings((prev) => prev.filter((b) => b.id !== bookingId));
    trackEvent("group_booking_declined", { id: bookingId });
  }, []);

  const launchStrike = useCallback((rivalId) => {
    const rivals = stateRef.current.competitors || [];
    const rival = rivals.find((c) => c.id === rivalId);
    if (!rival) return;
    const cost = counterStrikeCost(rival, level);
    if (!sandbox && money < cost) return;
    if ((stateRef.current.activeStrikes || []).some((s) => s.rivalId === rivalId)) return;
    const strike = createCounterStrike(rival, level);
    if (!sandbox) setMoney((m) => m - cost);
    setActiveStrikes((prev) => [...prev, strike]);
    setLog((l) => [{ day, text: `Day ${day}: ⚔️ Counter-strike launched against ${rival.name}! Their appeal -${Math.round(strike.appealReduction)} for ${strike.daysLeft} days. Cost: $${cost.toLocaleString()}.` }, ...l].slice(0, 12));
    trackEvent("rival_strike_launched", { rivalId, cost });
  }, [level, money, sandbox, day]);

  const expandPark = useCallback(() => {
    if (expansionsDone >= MAX_EXPANSIONS) return;
    if (level < expandLevelReq(expansionsDone)) return;
    const cost = expandCost(expansionsDone);
    if (!sandbox && money < cost) return;
    setGrid((g) => [...g, ...Array(EXPAND_ROW).fill(null)]);
    setParkZones((z) => [...z, ...Array(EXPAND_ROW).fill(null)]);
    setUpgrades((u) => [...u, ...Array(EXPAND_ROW).fill(0)]);
    setAttractionCondition((c) => [...c, ...Array(EXPAND_ROW).fill(100)]);
    setPopularity((p) => [...p, ...Array(EXPAND_ROW).fill(0)]);
    setPopularityTrend((t) => [...t, ...Array(EXPAND_ROW).fill(0)]);
    setPrevPopularity((p) => [...p, ...Array(EXPAND_ROW).fill(0)]);
    setWaterQuality((wq) => [...wq, ...Array(EXPAND_ROW).fill(100)]);
    setRideAges((ages) => [...ages, ...Array(EXPAND_ROW).fill(0)]);
    if (!sandbox) setMoney((m) => m - cost);
    setExpansionsDone((e) => e + 1);
    sound.expand();
    trackEvent("park_expanded", { expansions: expansionsDone + 1, cost });
  }, [expansionsDone, level, money, sandbox]);

  const toggleSandbox = useCallback(() => { setSandbox((prev) => { const next = !prev; saveSettings({ sandbox: next }); return next; }); }, []);

  const launchCampaign = useCallback((id) => {
    const def = getCampaign(id);
    if (!def) return;
    if (!sandbox && money < def.cost) return;
    const eff = campaignEffectiveness(def, grid);
    setActiveCampaigns((prev) => [...prev, { id: def.id, name: def.name, daysLeft: def.duration, duration: def.duration, guestBoost: def.guestBoost, repBoost: def.repBoost, effectiveBoost: def.guestBoost * eff, target: def.target, startedDay: day }]);
    if (!sandbox) setMoney((m) => m - def.cost);
    trackEvent("campaign_launched", { id, cost: def.cost });
  }, [grid, sandbox, day, money]);

  const launchEvent = useCallback((id) => {
    const def = getEvent(id);
    if (!def) return;
    if (!isEventAvailable(def, day, level)) return;
    if ((activeEvents || []).some((e) => e.id === id)) return;
    if (!sandbox && money < def.cost) return;
    // Enforce facility requirements
    const reqCheck = checkEventRequirements(def, grid, staff);
    if (!reqCheck.met) { sound.reject(); return; }
    // Enforce conflict groups (e.g. concert + competition both need wave pool)
    const conflictCheck = checkEventConflict(def, activeEvents);
    if (conflictCheck.conflict) { sound.reject(); return; }
    setActiveEvents((prev) => [...prev, { id: def.id, name: def.name, daysLeft: def.duration, guestMult: def.guestMult, incomeMult: def.incomeMult, repDelta: def.repDelta, revenuePerDay: def.revenuePerDay || 0, category: def.category, startedDay: day, downside: def.downside || null, conflictGroup: def.conflictGroup || null }]);
    if (!sandbox) setMoney((m) => m - def.cost);
    trackEvent("event_launched", { id, cost: def.cost });
  }, [activeEvents, day, level, money, sandbox, grid, staff]);

  const startProject = useCallback((projectId, targetTile = null) => {
    const def = PROJECT_TYPES.find((p) => p.id === projectId);
    if (!def) return;
    if ((constructionProjects || []).some((p) => p.projectId === projectId && p.status === "in_progress")) return;
    if (!sandbox && money < def.cost) return;
    let finalTargetTile = targetTile;
    if (def.category === "renovation" && finalTargetTile == null) {
      let lowestCond = 100, lowestIdx = -1;
      for (let i = 0; i < grid.length; i++) {
        const id = grid[i];
        if (!id) continue;
        const item = getParkItem(id);
        if (item?.category !== "attraction") continue;
        const cond = attractionCondition[i] ?? 100;
        if (cond < lowestCond) { lowestCond = cond; lowestIdx = i; }
      }
      if (lowestIdx === -1) return;
      finalTargetTile = lowestIdx;
    }
    setConstructionProjects((prev) => [...prev, { projectId, name: def.name, startedDay: day, progress: 0, status: "in_progress", targetTile: finalTargetTile }]);
    if (!sandbox) setMoney((m) => m - def.cost);
    trackEvent("project_started", { id: projectId, cost: def.cost });
  }, [constructionProjects, money, sandbox, day, grid, attractionCondition]);

  const takeLoan = useCallback((amount, termId) => {
    if ((loans || []).filter((l) => !l.paidOff).length >= 3) return;
    const loan = createLoan(amount, termId, day);
    if (!loan) return;
    setLoans((prev) => [...prev, loan]);
    setMoney((m) => m + amount);
    trackEvent("loan_taken", { amount, termId });
  }, [loans, day]);

  const repayLoan = useCallback((loanId) => {
    const loan = (loans || []).find((l) => l.id === loanId);
    if (!loan || loan.paidOff) return;
    const remaining = loan.totalRepayable - loan.totalPaid;
    if (money < remaining) return;
    setLoans((prev) => prev.map((l) => (l.id === loanId ? { ...l, daysRemaining: 0, totalPaid: l.totalRepayable, paidOff: true, paidOffDay: day } : l)));
    setMoney((m) => m - remaining);
    trackEvent("loan_repaid", { loanId, amount: remaining });
  }, [loans, money, day]);

  const chooseBuild = useCallback((id) => { setSelectedBuild(id); setSelectedZone(null); }, []);
  const chooseZone = useCallback((zoneId) => { setSelectedZone((current) => (current === zoneId ? null : zoneId)); setSelectedBuild(null); setSelectedTile(null); }, []);

  const unlockResearch = useCallback((id) => {
    const node = RESEARCH.find((r) => r.id === id);
    if (!node || completedResearch.includes(id)) return;
    if (node.requires && !node.requires.every((r) => completedResearch.includes(r))) return;
    if (researchPoints < node.cost) return;
    setResearchPoints((rp) => rp - node.cost);
    setCompletedResearch((c) => [...c, id]);
    sound.research();
    trackEvent("research_unlocked", { id, cost: node.cost });
  }, [completedResearch, researchPoints]);

  const applyCheat = useCallback((kind) => {
    if (kind === "cash") setMoney((m) => m + 50000);
    if (kind === "xp") setXp((x) => x + 500);
    if (kind === "reputation") setReputation(100);
    if (kind === "boost") { setMoney((m) => m + 250000); setXp((x) => x + 2500); setReputation(100); }
  }, []);

  const claimMission = useCallback((id) => {
    const mission = MISSIONS.find((m) => m.id === id);
    if (!mission || claimedMissions.includes(id) || level < mission.level) return;
    const ms = {
      attractionCount: grid.filter((x) => x && getParkItem(x)?.category === "attraction").length,
      peakGuests, money, reputation, day,
      staffTotal: Object.values(staff).reduce((sum, n) => sum + (n || 0), 0),
      totalUpgrades, expansionsDone,
      maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
      parkAppeal: parkAppeal.score,
      themedZones: (parkAppeal.zones || []).filter((z) => z.quality >= 60).length,
      avgMood: visitorStats?.avgMood || 0, lifetimeEarnings,
    };
    if (missionProgress(mission, ms) < mission.target) return;
    setMoney((m) => m + mission.reward.money);
    setXp((x) => x + mission.reward.xp);
    setClaimedMissions((c) => [...c, id]);
    sound.mission();
    trackEvent("mission_claimed", { id, money: mission.reward.money, xp: mission.reward.xp });
  }, [claimedMissions, level, grid, upgrades, peakGuests, money, reputation, day, staff, totalUpgrades, expansionsDone, parkAppeal, visitorStats, lifetimeEarnings]);

  const refurbishRide = useCallback((tileIndex) => {
    const itemId = grid[tileIndex];
    if (!itemId) return;
    const def = getParkItem(itemId);
    if (!def || def.category !== "attraction") return;
    const age = rideAges[tileIndex] || 0;
    if (age < 20) return;
    const cost = refurbishCost(def.cost || 5000, age);
    if (money < cost) return;
    setMoney((m) => m - cost);
    setRideAges((ra) => { const next = Array.isArray(ra) ? [...ra] : []; while (next.length < grid.length) next.push(0); next[tileIndex] = 0; return next; });
    setLog((l) => [{ day, text: `Day ${day}: 🔧 Refurbished ${def.name} for $${cost.toLocaleString()}.` }, ...l].slice(0, 12));
    trackEvent("ride_refurbished", { item: itemId, cost });
  }, [grid, rideAges, money, day]);

  const claimLegendary = useCallback((objectiveId) => {
    if (claimedLegendary.includes(objectiveId)) return;
    const district = DISTRICTS.find((dd) => dd.legendary && dd.legendary.id === objectiveId);
    if (!district) return;
    const result = checkDistrictLegendary(district, grid, parkZones, getParkItem);
    if (!result.met) return;
    const reward = district.legendary.reward || {};
    setMoney((m) => m + (reward.money || 0));
    setXp((x) => x + (reward.xp || 0));
    setEmpirePoints((ep) => ep + (reward.empirePoints || 0));
    setClaimedLegendary((c) => [...c, objectiveId]);
    setLog((l) => [{ day, text: `Day ${day}: 👑 Legendary objective complete — ${district.legendary.name}!` }, ...l].slice(0, 12));
    trackEvent("legendary_claimed", { id: objectiveId });
  }, [claimedLegendary, grid, parkZones, day]);

  const savePark = useCallback((name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return false;
    const slots = readSlots();
    slots[trimmed] = { ...buildSavePayload(stateRef.current), savedAt: new Date().toISOString() };
    writeSlots(slots);
    setSaves(Object.entries(slots).map(([n, s]) => slotMeta(n, s)));
    trackEvent("park_saved", { name: trimmed });
    return true;
  }, []);

  const saveToCloud = useCallback(async (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return false;
    const gameData = buildSavePayload(stateRef.current);
    try {
      await base44.functions.invoke("cloudSaves", { action: "save", name: trimmed, gameData, day, money, reputation, guests });
      trackEvent("park_saved_cloud", { name: trimmed });
      return true;
    } catch (e) { return false; }
  }, [day, money, reputation, guests]);

  const applyGameData = useCallback((data) => {
    setMoney(data.money ?? INITIAL_MONEY);
    setDay(data.day ?? 1);
    setReputation(data.reputation ?? 50);
    setGuests(data.guests ?? 0);
    const loadedGrid = Array.isArray(data.grid) && data.grid.length ? data.grid : makeStartingGrid();
    setGrid(loadedGrid);
    setParkZones(normalizeArrayLength(data.parkZones, loadedGrid.length, null));
    if (data.weather) setWeather(data.weather);
    if (data.forecast) setForecast(data.forecast);
    if (data.seasonEvent) setSeasonEvent(data.seasonEvent);
    if (data.ticketPrice != null) setTicketPrice(data.ticketPrice);
    if (data.adBudget != null) setAdBudget(data.adBudget);
    if (data.priorityPass != null) setPriorityPass(data.priorityPass);
    setHistory(data.history ?? []);
    setStaff({ ...DEFAULT_STAFF, ...(data.staff || {}) });
    setStaffAssignments(data.staffAssignments || {});
    setIncidents(data.incidents ?? []);
    setAttractionCondition(normalizeArrayLength(data.attractionCondition, loadedGrid.length, 100));
    setUpgrades(normalizeArrayLength(data.upgrades, loadedGrid.length, 0));
    setXp(data.xp ?? 0);
    setExpansionsDone(data.expansionsDone ?? 0);
    setPeakGuests(data.peakGuests ?? 0);
    setTotalUpgrades(data.totalUpgrades ?? 0);
    setClaimedMissions(data.claimedMissions ?? []);
    setChallenge(data.challenge ?? null);
    setLifetimeEarnings(data.lifetimeEarnings ?? 0);
    setBuiltAttractionIds(data.builtAttractionIds ?? []);
    setVisitorStats(data.visitorStats ?? { avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
    setFeedback(data.feedback ?? []);
    setVipVisit(data.vipVisit ?? null);
    setResearchPoints(data.researchPoints ?? 0);
    setCompletedResearch(data.completedResearch ?? []);
    setParkAppeal(data.parkAppeal ?? calculateParkAppeal({ grid: data.grid ?? makeStartingGrid(), zones: data.parkZones ?? [], getItem: getParkItem }));
    setDisaster(data.disaster ?? null);
    if (data.disastersSurvived != null) setDisastersSurvived(data.disastersSurvived);
    setActiveCampaigns(data.activeCampaigns ?? []);
    setHotelGuests(data.hotelGuests ?? []);
    setHotelStats(data.hotelStats ?? { roomRevenue: 0, hotelExpenses: 0, parkSpend: 0, occupancy: 0, avgHappiness: 0, totalGuests: 0, totalRooms: 0, guestsByHotel: {} });
    setResortRating(data.resortRating ?? 0);
    if (data.pricing) setPricing({ ...DEFAULT_PRICING, ...data.pricing });
    setPopularity(normalizeArrayLength(data.popularity, loadedGrid.length, 0));
    setPopularityTrend(normalizeArrayLength(data.popularityTrend, loadedGrid.length, 0));
    setPrevPopularity(normalizeArrayLength(data.prevPopularity, loadedGrid.length, 0));
    setWaterQuality(normalizeArrayLength(data.waterQuality, loadedGrid.length, 100));
    setRideAges(normalizeArrayLength(data.rideAges, loadedGrid.length, 0));
    setActiveEvents(data.activeEvents ?? []);
    setMembershipCounts(data.membershipCounts ?? { season_pass: 0, family_membership: 0, vip_membership: 0 });
    setMembershipTimers(data.membershipTimers ?? { season_pass: 30, family_membership: 30, vip_membership: 30 });
    setMembershipStats(data.membershipStats ?? { totalMembers: 0, dailyRevenue: 0, totalRevenue: 0, memberVisits: 0, memberSpend: 0, totalRenewed: 0, totalChurned: 0 });
    setAwards(data.awards ?? []);
    if (data.awardCeremonyTimer != null) setAwardCeremonyTimer(data.awardCeremonyTimer);
    if (data.awardStats) setAwardStats(data.awardStats);
    setSocialPosts(data.socialPosts ?? []);
    if (data.socialReputation != null) setSocialReputation(data.socialReputation);
    setEmergencies(data.emergencies ?? []);
    setEmergencyStats(data.emergencyStats ?? { totalEmergencies: 0, totalCost: 0, resolvedCount: 0 });
    setConstructionProjects(data.constructionProjects ?? []);
    setLoans(data.loans ?? []);
    if (data.returnVisitorMult != null) setReturnVisitorMult(data.returnVisitorMult);
    if (data.empirePoints != null) setEmpirePoints(data.empirePoints);
    setCompetitors(data.competitors ?? createCompetitors(data.day ?? 1));
    setMarketShare(data.marketShare ?? 100);
    setVipHistory(data.vipHistory ?? []);
    setClaimedLegendary(data.claimedLegendary ?? []);
    setActiveCalendarEvent(data.activeCalendarEvent ?? null);
    setDailyChallenges(data.dailyChallenges ?? []);
    if (data.challengeDayCounter != null) setChallengeDayCounter(data.challengeDayCounter);
    if (data.autoPricing != null) setAutoPricing(data.autoPricing);
    if (data.activeTheme) setActiveTheme(data.activeTheme);
    if (data.prestigeCount != null) setPrestigeCount(data.prestigeCount);
    setSynergyBonuses(data.synergyBonuses ?? { totalIncomeMult: 0, totalAppealBonus: 0, activeSynergies: [] });
    if (data.mascot !== undefined) setMascot(data.mascot);
    if (data.lastRewardDay !== undefined) setLastRewardDay(data.lastRewardDay);
    if (data.rewardStreak !== undefined) setRewardStreak(data.rewardStreak);
    setVisitorReviews(data.visitorReviews ?? []);
    setStaffXp(data.staffXp ?? {});
    if (data.staffMorale != null) setStaffMorale(data.staffMorale);
    if (data.wageBoost != null) setWageBoost(data.wageBoost);
    setSponsorships(data.sponsorships ?? []);
    setGroupBookings(data.groupBookings ?? []);
    setAcceptedBookings(data.acceptedBookings ?? []);
    setActiveStrikes(data.activeStrikes ?? []);
    setGuestMemory(data.guestMemory ?? {});
    setRetailStock(data.retailStock ?? { food: 0, retail: 0, services: 0 });
    setRetailStats(data.retailStats ?? { revenue: 0, restockCost: 0, served: { food: 0, retail: 0, services: 0 }, unmetFood: 0, stockHealth: { food: 100, retail: 100, services: 100 } });
    setCompletedChains(data.completedChains ?? []);
    setCompletedCampaignChapters(data.completedCampaignChapters ?? []);
    setAcquiredRivals(data.acquiredRivals ?? []);
    setFranchiseMaps(data.franchiseMaps ?? []);
      setMegaProjects(data.megaProjects ?? []);
      setGuestStories(data.guestStories ?? []);
      setCurrentDestination(data.currentDestination ?? "home_resort");
    if (data.gameMode) setGameMode(data.gameMode);
    if (data.storyStep != null) setStoryStep(data.storyStep);
    if (data.storyCompleted != null) setStoryCompleted(data.storyCompleted);
    setBuiltToday(0);
    setUpgradedToday(0);
    setLog(data.log ?? [{ day: 0, text: "Welcome back to your park!" }]);
    setLastNet(data.lastNet ?? 0);
  }, []);

  const loadPark = useCallback((name) => {
    const slots = readSlots();
    const data = slots[name];
    if (!data) return;
    applyGameData(data);
    setPlaying(false); setSelectedBuild(null); setSelectedTile(null);
    trackEvent("park_loaded", { name });
  }, [applyGameData]);

  const loadFromCloud = useCallback((data) => {
    applyGameData(data);
    setPlaying(false); setSelectedBuild(null); setSelectedTile(null);
    trackEvent("park_loaded_cloud", {});
  }, [applyGameData]);

  const deleteSave = useCallback((name) => {
    const slots = readSlots();
    delete slots[name];
    writeSlots(slots);
    setSaves((prev) => prev.filter((s) => s.name !== name));
  }, []);

  const sendGameAlert = useCallback(async (alertType, title, message) => {
    const settings = getSettings();
    if (settings.emailAlerts === false && settings.pushAlerts === false) return;
    try {
      await base44.functions.invoke("sendGameAlert", { alertType, title, message, emailAlerts: settings.emailAlerts !== false, pushAlerts: settings.pushAlerts !== false });
    } catch (e) { /* ignore */ }
  }, []);

  const prevLevelRef = useRef(level);
  useEffect(() => {
    if (level > prevLevelRef.current) sendGameAlert("level_up", `Level ${level} Reached!`, `Your water park has reached level ${level}. New attractions and expansions may now be available.`);
    prevLevelRef.current = level;
  }, [level, sendGameAlert]);

  const submitLeaderboard = useCallback(async (playerName, parkName) => {
    try {
      await base44.functions.invoke("leaderboard", { action: "submit", playerName, parkName, level, day, reputation, guests, money, empirePoints, resortRating, peakGuests });
      trackEvent("leaderboard_submitted", { level, day });
      return true;
    } catch (e) { return false; }
  }, [level, day, reputation, guests, money, empirePoints, resortRating, peakGuests]);

  const sharePark = useCallback(async (parkName, playerName) => {
    const gameData = { ...stateRef.current, level };
    try {
      const res = await base44.functions.invoke("sharePark", { action: "share", parkName, playerName, gameData, day, reputation, guests, level });
      trackEvent("park_shared", { day, level });
      return res.data?.shareCode || null;
    } catch (e) { return null; }
  }, [day, reputation, guests, level]);

  const viewSharedPark = useCallback(async (shareCode) => {
    try {
      const res = await base44.functions.invoke("sharePark", { action: "view", shareCode });
      if (res.data?.ok && res.data?.park) return res.data.park;
      return null;
    } catch (e) { return null; }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.detail) applyGameData(e.detail); };
    window.addEventListener("load-shared-park", handler);
    return () => window.removeEventListener("load-shared-park", handler);
  }, [applyGameData]);

  const claimDailyChallenge = useCallback((challengeId) => {
    const ch = (stateRef.current.dailyChallenges || []).find((c) => c.id === challengeId);
    if (!ch || ch.claimed || !ch.completed) return;
    setMoney((m) => m + ch.reward.money);
    setXp((x) => x + ch.reward.xp);
    setDailyChallenges((prev) => prev.map((c) => c.id === challengeId ? { ...c, claimed: true } : c));
    sound.mission();
    trackEvent("daily_challenge_claimed", { id: ch.baseId });
  }, []);

  const toggleAutoPricing = useCallback(() => setAutoPricing((prev) => !prev), []);
  const selectMascot = useCallback((mascotId) => { setMascot(mascotId); trackEvent("mascot_selected", { mascot: mascotId }); }, []);

  const claimDailyReward = useCallback((reward) => {
    const currentDay = stateRef.current.day;
    const lastDay = stateRef.current.lastRewardDay;
    if (!canClaimReward(lastDay, currentDay)) return;
    const newStreak = (lastDay != null && currentDay === lastDay + 1) ? (stateRef.current.rewardStreak || 0) + 1 : 1;
    if (reward.id === "cash_small" || reward.id === "cash_big" || (reward.id === "mystery" && reward.mysteryContent?.id?.startsWith("cash"))) setMoney((m) => m + reward.amount);
    else if (reward.id === "xp" || (reward.id === "mystery" && reward.mysteryContent?.id === "xp")) setXp((x) => x + reward.amount);
    else if (reward.id === "rep" || (reward.id === "mystery" && reward.mysteryContent?.id === "rep")) setReputation((r) => Math.min(100, r + reward.amount));
    else if (reward.id === "research" || (reward.id === "mystery" && reward.mysteryContent?.id === "research")) setResearchPoints((rp) => rp + reward.amount);
    setLastRewardDay(currentDay);
    setRewardStreak(newStreak);
    sound.mission();
    trackEvent("daily_reward_claimed", { type: reward.id, amount: reward.amount, streak: newStreak });
  }, []);

  const buildMegaProject = useCallback((projectId) => {
    const def = MEGA_PROJECTS.find((p) => p.id === projectId);
    if (!def || level < def.level || (stateRef.current.megaProjects || []).some((p) => p.projectId === projectId && p.status !== "complete")) return false;
    if (!sandbox && money < def.cost) return false;
    if (!sandbox) setMoney((m) => m - def.cost);
    setMegaProjects((prev) => [...prev, { projectId: def.id, name: def.name, startedDay: day, progress: 0, buildDays: def.buildDays, status: "building" }]);
    setLog((l) => [{ day, text: `Day ${day}: 🏗️ Started signature project ${def.name}. It will open in ${def.buildDays} days.` }, ...l].slice(0, 12));
    setEmpirePoints((p) => p + Math.round(def.prestige / 4));
    return true;
  }, [level, sandbox, money, day]);
  const selectDestination = useCallback((id) => {
    const dest = DESTINATIONS.find((d) => d.id === id);
    if (!dest || level < dest.level || (!sandbox && money < dest.cost)) return false;
    if (currentDestination !== id && dest.cost > 0 && !franchiseMaps.includes(id)) {
      if (!sandbox) setMoney((m) => m - dest.cost);
      setFranchiseMaps((prev) => prev.includes(id) ? prev : [...prev, id]);
    }
    setCurrentDestination(id);
    setLog((l) => [{ day, text: `Day ${day}: 🌍 Destination changed to ${dest.name}.` }, ...l].slice(0, 12));
    return true;
  }, [level, sandbox, money, day, currentDestination, franchiseMaps]);
  const STORY_STEPS = [
    { id: "welcome", chapter: 1, title: "Make a Splash", text: "Maya is taking you through your first opening season. Build the park together, one decision at a time.", target: "build", action: "Open Build and place your first attraction.", reward: { money: 1500, xp: 50, reputation: 1 } },
    { id: "staff", chapter: 1, title: "Build Your Team", text: "A waterpark needs a lifeguard or cleaner before it can operate safely.", target: "staff", action: "Hire your first staff member.", reward: { money: 1200, xp: 60, reputation: 1 } },
    { id: "open", chapter: 1, title: "Open the Gates", text: "Your first attraction is ready. Start the park day and welcome your first guests.", target: null, action: "Start the park day.", reward: { money: 1800, xp: 75, reputation: 2 } },
    { id: "manage", chapter: 2, title: "Learn to Manage", text: "Watch the first day closely. Learn how guest demand, money and park operations move together.", target: "manage", action: "Run your first day, then open Manage.", reward: { money: 1800, xp: 80, reputation: 2 } },
    { id: "upgrade", chapter: 2, title: "Improve a Ride", text: "Invest in a ride and turn a good attraction into a great one.", target: "build", action: "Upgrade one attraction.", reward: { money: 2200, xp: 100, reputation: 2 } },
    { id: "guests", chapter: 2, title: "Make Them Happy", text: "Your next milestone is 100 guests in a day. Watch queues, cleanliness, safety and prices.", target: "manage", action: "Reach 100 guests in a day.", reward: { money: 3500, xp: 140, reputation: 3 } },
    { id: "expand", chapter: 3, title: "Grow the Park", text: "Give visitors variety. Add another attraction or expand the park footprint.", target: "build", action: "Build a second attraction or expand the park.", reward: { money: 3000, xp: 125, reputation: 3 } },
    { id: "research", chapter: 3, title: "Invest in the Future", text: "Research unlocks stronger rides, facilities and long-term strategies.", target: "research", action: "Complete your first research project.", reward: { money: 3500, xp: 150, reputation: 3 } },
    { id: "emergency", chapter: 4, title: "Stay Calm Under Pressure", text: "Every real park has problems. Survive or resolve your first incident, emergency or disaster.", target: "emergencies", action: "Resolve or survive your first major park incident.", reward: { money: 4000, xp: 175, reputation: 3 } },
    { id: "resort", chapter: 4, title: "Become a Destination", text: "Turn day visitors into holiday guests with accommodation and resort services.", target: "resort", action: "Build your first hotel or resort facility.", reward: { money: 5000, xp: 200, reputation: 5 } },
    { id: "rival", chapter: 5, title: "Beat the Rivals", text: "Build a park strong enough to compete for attention and market share.", target: "competitors", action: "Reach 250 peak guests or 60% market share.", reward: { money: 7500, xp: 250, reputation: 5 } },
    { id: "worldclass", chapter: 6, title: "World-Class Waterpark", text: "Reach a world-class standard: high appeal, strong reputation and a thriving destination.", target: "advancedPark", action: "Reach 80+ park appeal and 80+ reputation.", reward: { money: 15000, xp: 500, reputation: 10 } },
    { id: "mastery", chapter: 7, title: "Master the Park", text: "Turn a successful waterpark into a finely tuned operation. Master research, upgrades, guests and long-term strategy.", target: "manage", action: "Earn 12 Park Mastery points.", reward: { money: 18000, xp: 650, reputation: 8 } },
    { id: "mega", chapter: 7, title: "Build Something Legendary", text: "A true destination needs a signature attraction. Complete a mega project and make the skyline part of your brand.", target: "advancedPark", action: "Complete your first mega project.", reward: { money: 25000, xp: 800, reputation: 10 } },
    { id: "empire", chapter: 8, title: "Build the Empire", text: "Your home park is only the beginning. Expand your influence through rivals, franchises and destinations.", target: "competitors", action: "Acquire a rival or open a franchise.", reward: { money: 40000, xp: 1000, reputation: 12 } },
    { id: "prestige", chapter: 9, title: "Leave a Legacy", text: "Reach the highest levels of park management, then decide whether to prestige and build an even stronger legacy.", target: "advancedPark", action: "Reach level 25 and 1,000,000 lifetime earnings.", reward: { money: 75000, xp: 1500, reputation: 15 } },
    { id: "finish", chapter: 9, title: "Waterpark Legend", text: "The campaign is complete. Your park is now ready for endless Freeplay, Sandbox experiments and the global park empire.", target: null, action: "Continue building your own legacy.", reward: { money: 100000, xp: 2000, reputation: 10 } },
  ];

  useEffect(() => {
    if (gameMode !== "story" || storyCompleted) return;
    const attractions = grid.filter((id) => getParkItem(id)?.category === "attraction").length;
    const staffTotal = Object.values(staff || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);
    const hotelBuilt = grid.some((id) => { const item = getParkItem(id); return item?.category === "hotel" || /hotel|resort/i.test(item?.name || id || ""); });
    const majorIncident = (incidents || []).length > 0 || (emergencies || []).length > 0 || (disastersSurvived || 0) > 0;
    const completed = {
      welcome: attractions >= 1,
      staff: staffTotal >= 1,
      open: day >= 2 || (history || []).length >= 1,
      manage: day >= 2 && (history || []).length >= 1,
      upgrade: totalUpgrades >= 1,
      guests: (peakGuests || 0) >= 100 || (guests || 0) >= 100,
      expand: attractions >= 2 || expansionsDone >= 1,
      research: (completedResearch || []).length >= 1,
      emergency: majorIncident,
      resort: hotelBuilt || (hotelGuests || []).length > 0 || (resortRating || 0) > 0,
      rival: (peakGuests || 0) >= 250 || (marketShare || 0) >= 60,
      worldclass: (parkAppeal?.score || 0) >= 80 && reputation >= 80,
      mastery: (mastery?.points || 0) >= 12,
      mega: (megaProjects || []).some((p) => p.status === "complete" || p.status === "completed" || p.completed),
      empire: (acquiredRivals || []).length > 0 || (franchiseMaps || []).length > 0,
      prestige: level >= 25 && (lifetimeEarnings || 0) >= 1000000,
      finish: level >= 25 && (lifetimeEarnings || 0) >= 1000000 && ((mastery?.points || 0) >= 12) && ((acquiredRivals || []).length > 0 || (franchiseMaps || []).length > 0),
    };
    const step = STORY_STEPS[storyStep];
    if (!step || !completed[step.id]) return;
    const reward = step.reward || {};
    if (reward.money) setMoney((m) => m + reward.money);
    if (reward.xp) setXp((x) => x + reward.xp);
    if (reward.reputation) setReputation((rep) => Math.min(100, rep + reward.reputation));
    setLog((l) => [{ day, text: `Story complete: ${step.title}. +$${(reward.money || 0).toLocaleString()} • +${reward.xp || 0} XP.` }, ...l].slice(0, 12));
    sound.mission();
    trackEvent("story_step_completed", { id: step.id, chapter: step.chapter, step: storyStep + 1 });
    const next = Math.min(STORY_STEPS.length - 1, storyStep + 1);
    setStoryStep(next);
    const done = step.id === "finish";
    setStoryCompleted(done);
    saveSettings({ gameMode, storyStep: next, storyCompleted: done });
  }, [gameMode, storyCompleted, storyStep, grid, staff, day, history, totalUpgrades, expansionsDone, completedResearch, hotelGuests, resortRating, incidents, emergencies, disastersSurvived, peakGuests, guests, marketShare, parkAppeal, reputation, level, mastery, megaProjects, acquiredRivals, franchiseMaps, lifetimeEarnings]);

  const selectScenario = useCallback((id) => {
    const scenario = getScenario(id);
    if (!scenario) { setActiveScenario(null); setScenarioStatus("idle"); return; }
    setActiveScenario(id);
    setScenarioStatus("active");
    setLog((l) => [{ day, text: `🎯 Scenario started: ${scenario.name} — ${scenario.objective}` }, ...l].slice(0, 12));
  }, [day]);

  useEffect(() => {
    if (!activeScenario || scenarioStatus !== "active") return;
    const scenario = getScenario(activeScenario);
    if (!scenario) return;
    const attractionCount = grid.filter((id) => getParkItem(id)?.category === "attraction").length;
    const familyAttractions = grid.filter((id) => getParkItem(id)?.category === "attraction" && ["family","family_raft","kiddie_pool","splash_pad","water_playground","wave_pool","lazy_river","rapid_rafting","water_volleyball"].includes(id)).length;
    const metrics = { day, lifetimeEarnings, expansionsDone, resortRating, occupancy: hotelStats?.occupancy || 0, reputation, marketShare, acquiredRivals: acquiredRivals.length, appeal: parkAppeal?.score || 0, familyAttractions, attractionCount };
    if (activeScenario === "speed_builder" && day > 60 && attractionCount < 12) {
      setScenarioStatus("failed");
      setLog((l) => [{ day, text: "⏱️ Scenario failed: Speed Builder needed 12 attractions by day 60." }, ...l].slice(0, 12));
      return;
    }
    if (!scenario.check(metrics)) return;
    setScenarioStatus("completed");
    setMoney((m) => m + (scenario.reward.money || 0));
    setXp((x) => x + (scenario.reward.xp || 0));
    if (scenario.reward.reputation) setReputation((r) => Math.min(100, r + scenario.reward.reputation));
    setLog((l) => [{ day, text: `🏆 Scenario complete: ${scenario.name}! +$${(scenario.reward.money || 0).toLocaleString()} · +${scenario.reward.xp || 0} XP.` }, ...l].slice(0, 12));
  }, [activeScenario, scenarioStatus, day, lifetimeEarnings, expansionsDone, resortRating, hotelStats, reputation, marketShare, acquiredRivals, parkAppeal, grid]);

  const setMode = useCallback((mode) => {
    const nextMode = ["story", "freeplay", "sandbox"].includes(mode) ? mode : "freeplay";
    setGameMode(nextMode);
    const isSandbox = nextMode === "sandbox";
    setSandbox(isSandbox);
    saveSettings({ gameMode: nextMode, sandbox: isSandbox });
    if (nextMode === "story") {
      setStoryStep(0);
      setStoryCompleted(false);
      setLog((l) => [{ day, text: "📖 Story Mode started. Maya will guide you through nine chapters from your first splash to a full park empire." }, ...l].slice(0, 12));
      saveSettings({ gameMode: nextMode, sandbox: false, storyStep: 0, storyCompleted: false });
    } else if (nextMode === "sandbox") {
      setLog((l) => [{ day, text: "🛠️ Sandbox Mode enabled — creative testing controls are available." }, ...l].slice(0, 12));
    }
  }, [day]);

  const advanceStory = useCallback(() => {
    if (gameMode !== "story" || storyCompleted) return;
    const next = Math.min(STORY_STEPS.length - 1, storyStep + 1);
    setStoryStep(next);
    setStoryCompleted(STORY_STEPS[storyStep]?.id === "finish");
    saveSettings({ gameMode, storyStep: next, storyCompleted: next === STORY_STEPS.length - 1 });
  }, [storyStep, gameMode, storyCompleted]);

  const updateSandboxSettings = useCallback((patch) => {
    if (gameMode !== "sandbox") return;
    setSandboxSettings((prev) => ({ ...prev, ...patch }));
  }, [gameMode]);

  const sandboxAction = useCallback((action) => {
    if (gameMode !== "sandbox") return;
    if (action === "cash") setMoney(999999999);
    if (action === "unlock") setCompletedResearch(RESEARCH.map((r) => r.id));
    if (action === "reputation") setReputation(100);
    if (action === "level") setXp(xpForLevel(40));
    if (action === "guests") setPeakGuests((p) => Math.max(p, 1000));
    if (action === "clearConstruction") setConstructionProjects([]);
    if (action === "resetTools") setSandboxSettings({ unlimitedCash: true, unlockAll: false, guestDemandMult: 1, instantConstruction: false, weatherLock: false, weather: null });
    setLog((l) => [{ day, text: `🧪 Sandbox: ${action} applied.` }, ...l].slice(0, 12));
  }, [gameMode, day]);

  const acquireRival = useCallback((id) => {
    const target = ACQUISITION_TARGETS.find((x) => x.id === id);
    if (!target || acquiredRivals.includes(id) || level < 18 || reputation < target.rep || marketShare < target.market || money < target.cost) return false;
    setMoney((m) => m - target.cost); setAcquiredRivals((prev) => [...prev, id]);
    setEmpirePoints((p) => p + 1500); setLog((l) => [{ day, text: `Day ${day}: 🏢 Acquired ${target.name}! Your park empire gains a permanent operating network bonus.` }, ...l].slice(0, 12));
    return true;
  }, [acquiredRivals, level, reputation, marketShare, money, day]);
  const openFranchise = useCallback((id) => {
    const target = FRANCHISE_MAPS.find((x) => x.id === id);
    if (!target || franchiseMaps.includes(id) || level < target.level || money < target.cost) return false;
    setMoney((m) => m - target.cost); setFranchiseMaps((prev) => [...prev, id]);
    setEmpirePoints((p) => p + 2500); setLog((l) => [{ day, text: `Day ${day}: 🌍 ${target.name} franchise opened! Permanent group-wide bonus unlocked.` }, ...l].slice(0, 12));
    return true;
  }, [franchiseMaps, level, money, day]);
  const selectTheme = useCallback((themeId) => {
    const theme = getVisualTheme(themeId);
    if (level < theme.unlockLevel) return;
    setActiveTheme(themeId);
    trackEvent("theme_selected", { theme: themeId });
  }, [level]);

  const setParkStrategy = useCallback((next) => {
    const strategy = strategyFor(next?.strategy || parkStrategy.strategy);
    const hotelPackage = packageFor(next?.hotelPackage || parkStrategy.hotelPackage);
    setParkStrategyState({ strategy: strategy.id, hotelPackage: hotelPackage.id });
    setLog((l) => [{ day, text: "Day " + day + ": 🎯 Strategy set to " + strategy.name + " · hotel package: " + hotelPackage.name + "." }, ...l].slice(0, 12));
  }, [parkStrategy, day]);

  const prestigePark = useCallback(() => {
    if (level < PRESTIGE_LEVEL_REQ) return;
    const points = calculatePrestigePoints({ level, empirePoints, lifetimeEarnings });
    if (points <= 0) return;
    setPrestigeCount((p) => p + points);
    setXp(0); setDay(1); setReputation(50); setGuests(0);
    setGrid(makeStartingGrid()); setParkZones(makeEmptyZones(GRID_SIZE));
    setUpgrades(Array(GRID_SIZE).fill(0)); setAttractionCondition(Array(GRID_SIZE).fill(100));
    setIncidents([]); setStaff(DEFAULT_STAFF); setStaffAssignments({});
    setExpansionsDone(0); setPeakGuests(0); setBuiltAttractionIds([]);
    setMoney(INITIAL_MONEY); setPlaying(false);
    setDailyChallenges(rollDailyChallenges()); setChallengeDayCounter(0);
    setLog([{ day: 0, text: `👑 PRESTIGE! Reset with ${points} permanent bonus points. All income, demand & XP boosted forever.` }]);
    sound.milestone();
    trackEvent("park_prestiged", { points, total: prestigeCount + points });
  }, [level, empirePoints, lifetimeEarnings, prestigeCount]);

  const resetGame = useCallback((starterParkId = "empty_lot") => {
    const diff = getDifficulty(getSettings().difficulty);
    const park = getStarterPark(starterParkId);
    const baseMoney = park.money;
    const startGrid = park.grid && park.grid.length === GRID_SIZE ? [...park.grid] : makeStartingGrid();
    const startZones = makeEmptyZones(startGrid.length);
    const startUpgrades = Array(startGrid.length).fill(0);
    const startCondition = Array(startGrid.length).fill(100);
    const builtIds = [];
    const starterResearch = [];
    for (const id of startGrid) {
      if (id) {
        const item = getParkItem(id);
        if (item && item.category === "attraction" && !builtIds.includes(id)) builtIds.push(id);
        const req = researchReqFor(id);
        if (req && !starterResearch.includes(req.id)) starterResearch.push(req.id);
      }
    }
    setMoney(Math.round(baseMoney * diff.moneyMult));
    setDay(1); setReputation(park.reputation ?? 50); setGuests(0);
    setGrid(startGrid); setParkZones(startZones); setSelectedZone(null);
    setPlaying(false); setSelectedBuild(null); setSelectedTile(null); setLastNet(0);
    setWeather(WEATHER[0]); setForecast(WEATHER[1]); setSeasonEvent(null);
    setTicketPrice(park.ticketPrice ?? DEFAULT_TICKET_PRICE);
    setAdBudget(park.adBudget ?? DEFAULT_AD_BUDGET); setPriorityPass(false);
    setLog([{ day: 0, text: `Welcome to ${park.name}! ${park.description}` }]);
    setHistory([]); setStaff(DEFAULT_STAFF); setStaffAssignments({}); setIncidents([]);
    setAttractionCondition(startCondition); setUpgrades(startUpgrades);
    setXp(park.xp || 0); setExpansionsDone(0); setPeakGuests(0); setTotalUpgrades(0);
    setClaimedMissions([]); setChallenge(null); setLifetimeEarnings(0); setBuiltAttractionIds(builtIds);
    setVisitorStats({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
    setFeedback([]); setResearchPoints(0); setCompletedResearch(starterResearch);
    setParkAppeal(calculateParkAppeal({ grid: startGrid, zones: startZones, getItem: getParkItem }));
    setDisaster(null); setDisastersSurvived(0); setActiveCampaigns([]); setActiveEvents([]);
    setMembershipCounts({ season_pass: 0, family_membership: 0, vip_membership: 0 });
    setMembershipTimers({ season_pass: 30, family_membership: 30, vip_membership: 30 });
    setMembershipStats({ totalMembers: 0, dailyRevenue: 0, totalRevenue: 0, memberVisits: 0, memberSpend: 0, totalRenewed: 0, totalChurned: 0 });
    setAwards([]); setAwardCeremonyTimer(AWARD_CEREMONY_CYCLE); setAwardStats({ totalWon: 0, ceremoniesHeld: 0, currentGuestMult: 1 });
    setSocialPosts([]); setSocialReputation(50); setEmergencies([]); setEmergencyStats({ totalEmergencies: 0, totalCost: 0, resolvedCount: 0 });
    setConstructionProjects([]); setLoans([]); setReturnVisitorMult(1.0); setEmpirePoints(0);
    setCompetitors(createCompetitors(1)); setMarketShare(100);
    setWaterQuality(createInitialWaterQuality(startGrid.length)); setRideAges(initRideAges(startGrid.length));
    setVipVisit(null); setVipHistory([]); setClaimedLegendary([]); setActiveCalendarEvent(null);
    setDailyChallenges(rollDailyChallenges()); setChallengeDayCounter(0); setAutoPricing(false); setActiveTheme("tropical");
    setSynergyBonuses({ totalIncomeMult: 0, totalAppealBonus: 0, activeSynergies: [] });
    setBuiltToday(0); setUpgradedToday(0);
    setHotelGuests([]); setHotelStats({ roomRevenue: 0, hotelExpenses: 0, parkSpend: 0, occupancy: 0, avgHappiness: 0, totalGuests: 0, totalRooms: 0, guestsByHotel: {} });
    setResortRating(0); setPricing(DEFAULT_PRICING); setMascot(null); setLastRewardDay(null); setRewardStreak(0);
    setVisitorReviews([]); setStaffXp({});
    setStaffMorale(DEFAULT_MORALE); setWageBoost(false); setSponsorships([]); setGroupBookings([]); setAcceptedBookings([]); setActiveStrikes([]);
    setCompletedMasterPlans([]); setMasterPlanBonuses(DEFAULT_MASTER_PLAN_BONUSES);
    setGuestMemory({}); setRetailStock({ food: 0, retail: 0, services: 0 });
    setRetailStats({ revenue: 0, restockCost: 0, served: { food: 0, retail: 0, services: 0 }, unmetFood: 0, stockHealth: { food: 100, retail: 100, services: 100 } });
    setCompletedChains([]); setCompletedCampaignChapters([]); setAcquiredRivals([]); setFranchiseMaps([]);
    setMegaProjects([]); setGuestStories([]); setCurrentDestination("home_resort");
    setParkStrategyState(DEFAULT_PARK_STRATEGY); setMastery({ points: 0, completed: [] });
    setResortMilestones([]);
    setSandboxSettings({ unlimitedCash: true, unlockAll: false, guestDemandMult: 1, instantConstruction: false, weatherLock: false, weather: null });
    const startPopularity = Array(startGrid.length).fill(0);
    const startPopTrend = Array(startGrid.length).fill(0);
    for (let i = 0; i < startGrid.length; i += 1) {
      const item = startGrid[i] ? getParkItem(startGrid[i]) : null;
      if (item && item.category === "attraction") { startPopularity[i] = DEFAULT_POPULARITY; startPopTrend[i] = NEW_RIDE_TREND_BOOST * 0.5; }
    }
    setPopularity(startPopularity); setPopularityTrend(startPopTrend); setPrevPopularity(Array(startGrid.length).fill(0));
    trackEvent("park_reset", { starterPark: park.id, level: park.level, money: baseMoney });
  }, []);

  // Scenario challenges are intentionally layered over the main modes.
  return {
    money, day, reputation, guests, grid, playing, speed, weather, forecast,
    season: getSeason(day), seasonEvent, ticketPrice, adBudget, priorityPass,
    parkZones, selectedZone, selectedBuild, selectedTile, lastNet, log, history,
    staff, staffAssignments, assignStaff, incidents, attractionCondition, upgrades, upgradeAttraction,
    level, xp, xpForNext: xpForLevel(level), applyCheat,
    gameMode, storyStep, storyCompleted, STORY_STEPS, setMode, advanceStory, sandboxSettings, updateSandboxSettings, sandboxAction,
    parkStrategy, setParkStrategy, mastery, masteryEffects: masteryEffects(mastery.points), activeScenario, scenarioStatus, scenarios: PARK_SCENARIOS, selectScenario,
    expansionsDone, gridSize, maxGridSize: MAX_GRID_SIZE, expandPark,
    peakGuests, totalUpgrades, claimedMissions, claimMission,
    challenge, vipVisit, vipHistory, claimedLegendary, activeCalendarEvent,
    rideAges, refurbishRide, claimLegendary, lastBuildAction, undoLastBuild,
    lifetimeEarnings, visitorStats, feedback, researchPoints, completedResearch, parkAppeal,
    disaster, disastersSurvived, sandbox, toggleSandbox, activeCampaigns, launchCampaign,
    pricing, setPricing, popularity, popularityTrend, prevPopularity, activeEvents, launchEvent,
    membershipCounts, membershipTimers, membershipStats, membershipTiers: MEMBERSHIP_TIERS,
    awards, awardCeremonyTimer, awardStats, awardCategories: AWARD_CATEGORIES,
    socialPosts, socialReputation, emergencies, emergencyStats, emergencyTypes: EMERGENCY_TYPES,
    constructionProjects, startProject, projectTypes: PROJECT_TYPES,
    loans, takeLoan, repayLoan, loanTerms: LOAN_TERMS, returnVisitorMult,
    empirePoints, empireTier: getEmpireTier(empirePoints), resortBonuses: calculateResortBonuses(grid),
    competitors, marketShare,
    waterQuality,
    waterQualityAvg: (() => {
      const wq = waterQuality || []; let sum = 0, count = 0;
      for (let i = 0; i < grid.length; i++) { const id = grid[i]; if (id && isWaterAttraction(id) && wq[i] != null) { sum += wq[i]; count++; } }
      return count > 0 ? Math.round(sum / count) : 100;
    })(),
    waterQualityCriticalCount: (() => {
      const wq = waterQuality || []; let count = 0;
      for (let i = 0; i < grid.length; i++) { const id = grid[i]; if (id && isWaterAttraction(id) && wq[i] != null && wq[i] < 20) count++; }
      return count;
    })(),
    awardEvaluation: evaluateAwards({ grid, upgrades, attractionCondition, staff, visitorStats, parkAppeal, reputation, incidents, hotelStats, membershipCounts, popularity, peakGuests, totalUpgrades, resortRating }),
    hotels: grid.map((id, idx) => { const def = getHotelDef(id); return def ? { def, tileIndex: idx } : null; }).filter(Boolean),
    hotelGuests, hotelStats, resortRating, unlockResearch, builtCount: builtAttractionIds.length,
    achievementState: {
      peakGuests, lifetimeEarnings, builtCount: builtAttractionIds.length, builtAttractionIds,
      maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length, expansionsDone, day, money, reputation,
      staffTotal: Object.values(staff).reduce((s, n) => s + (n || 0), 0),
      facilityCount: grid.filter((id) => id && getParkItem(id)?.category === "facility").length,
      avgMood: visitorStats?.avgMood || 0, avgSpendPerVisit: visitorStats?.avgSpendPerVisit || 0,
      disastersSurvived, sandboxUsed: sandbox, empirePoints, resortRating,
      tilesFilled: grid.filter(Boolean).length,
      waterQualityAvg: (() => { const wq = waterQuality || []; let sum = 0, count = 0; for (let i = 0; i < grid.length; i++) { const id = grid[i]; if (id && isWaterAttraction(id) && wq[i] != null) { sum += wq[i]; count++; } } return count > 0 ? Math.round(sum / count) : 100; })(),
    },
    missionState: {
      attractionCount: grid.filter((id) => id && getParkItem(id)?.category === "attraction").length,
      peakGuests, money, reputation, day,
      staffTotal: Object.values(staff).reduce((sum, n) => sum + (n || 0), 0),
      staffTypesHired: Object.values(staff).filter((n) => (n || 0) > 0).length,
      builtCount: (builtAttractionIds || []).length, builtAttractionIds: builtAttractionIds || [],
      totalUpgrades, expansionsDone, maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
      parkAppeal: parkAppeal.score, zonedTiles: (parkZones || []).filter(Boolean).length,
      themedZones: (parkAppeal.zones || []).filter((z) => z.quality >= 60).length,
      resortRating, tilesFilled: grid.filter(Boolean).length, lifetimeEarnings, avgMood: visitorStats?.avgMood || 0,
    },
    ...staffEffects(staff),
    staffWages: staffWages(staff),
    staffMorale, wageBoost, payStaffBonus, toggleWageBoost,
    sponsorships, acceptSponsor, endSponsor,
    groupBookings, acceptBooking, declineBooking, acceptedBookings,
    activeStrikes, launchStrike,
    estimatedUtilities: Math.round((150 + grid.filter((id) => id && getParkItem(id)?.category === "attraction").length * 45 + grid.filter((id) => id && getParkItem(id)?.category === "facility").length * 18 + guests * 2.2) * (weather?.utilityMult ?? 1)),
    GRID_SIZE,
    setPlaying, setSpeed, setTicketPrice, setAdBudget, setPriorityPass,
    setSelectedBuild: chooseBuild, setSelectedZone: chooseZone, paintZone, setSelectedTile, handleTileClick,
    sellAttraction, advanceDay, resetGame, hireStaff, fireStaff,
    saves, savePark, saveToCloud, loadPark, deleteSave, loadFromCloud,
    submitLeaderboard, sharePark, viewSharedPark,
    dailyChallenges, claimDailyChallenge, challengeDaysLeft: CHALLENGE_REFRESH_DAYS - (challengeDayCounter % CHALLENGE_REFRESH_DAYS),
    autoPricing, toggleAutoPricing, activeTheme, selectTheme,
    prestigeCount, prestigePark, prestigeMultipliers: prestigeMultiplier(prestigeCount),
    synergyBonuses, mascot, mascotDef: getMascot(mascot), selectMascot,
    lastRewardDay, rewardStreak, canClaimDailyReward: canClaimReward(lastRewardDay, day), claimDailyReward,
    ecoBonuses: calculateEcoBonuses(grid), visitorReviews, staffXp, trainStaff,
    guestMemory, retailStock, retailStats, completedChains, completedCampaignChapters, acquiredRivals, franchiseMaps,
    acquisitionTargets: ACQUISITION_TARGETS, franchiseOptions: FRANCHISE_MAPS, empireExpansionBonuses: empireBonuses(acquiredRivals, franchiseMaps), acquireRival, openFranchise,
    completedMasterPlans, masterPlanBonuses,
    annualReport: (() => { const rows=(history||[]).filter((h)=>h.day > Math.max(0, day-30)); const income=rows.reduce((s,h)=>s+(h.income||h.net||0),0); const expenses=rows.reduce((s,h)=>s+Math.max(0,(h.income||0)-(h.net||0)),0); const avgGuests=rows.length?Math.round(rows.reduce((s,h)=>s+(h.guests||0),0)/rows.length):guests; const peak=rows.reduce((m,h)=>Math.max(m,h.guests||0),0); const best=rows.reduce((b,h)=>((h.income||0)>(b?.income||-Infinity)?h:b),null); const worst=rows.reduce((b,h)=>((h.net||0)<(b?.net||Infinity)?h:b),null); const recommendations=[]; if ((parkAppeal?.score||0)<65) recommendations.push("Add scenery and themed zones to raise park appeal."); if ((visitorStats?.avgMood||0)<60) recommendations.push("Improve queues, cleanliness, safety and guest services."); if ((hotelStats?.totalRooms||0)>0 && (hotelStats?.occupancy||0)<60) recommendations.push("Improve resort rating or adjust your hotel package to lift occupancy."); if (!recommendations.length) recommendations.push("Operations are healthy — reinvest in upgrades and signature attractions."); return { period: Math.ceil(day/30), days: rows.length, income, expenses, avgGuests, peakGuests:Math.max(peakGuests,peak), reputation, appeal: parkAppeal?.score||0, resortRating, marketShare, lifetimeEarnings, bestDay:best?.day||null, bestIncome:best?.income||0, worstDay:worst?.day||null, worstNet:worst?.net||0, recommendations }; })(),
  };
}