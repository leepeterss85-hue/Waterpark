import { useState, useEffect, useCallback, useRef } from "react";
import {
  getParkItem, STAFF, MAX_UPGRADE, upgradeCost,
  INITIAL_GRID_SIZE, EXPAND_ROW, MAX_EXPANSIONS, MAX_GRID_SIZE,
  expandCost, expandLevelReq, levelFromXp, xpForLevel, staffWages, staffEffects,
} from "@/data/gameData";
import { WEATHER, getSeason, rollWeather, rollSeasonEvent } from "@/data/parkSystems";
import { MISSIONS, missionProgress } from "@/data/missions";
import { rollChallenge } from "@/data/challenges";
import { RESEARCH, dailyResearchPoints, researchReqFor } from "@/data/research";
import { simulateVisits, aggregatePriceReaction } from "@/data/visitorLogic";
import { generateFeedback } from "@/data/guestFeedback";
import { trackEvent } from "@/lib/gameAnalytics";
import { getSettings, getDifficulty, saveSettings } from "@/lib/settings";
import { rollDisaster, disasterMitigation } from "@/data/disasters";
import { CAMPAIGNS, campaignEffectiveness, getCampaign } from "@/data/campaigns";
import { getHotelDef, simulateHotelDay, calculateResortRating } from "@/data/hotels";
import { getStarterPark } from "@/data/starterParks";
import { calculateParkAppeal } from "@/data/parkThemes";
import { DEFAULT_PRICING } from "@/data/pricing";
import { tickPopularity, DEFAULT_POPULARITY, NEW_RIDE_TREND_BOOST } from "@/data/popularity";
import { getEvent, isEventAvailable, aggregateEventEffects } from "@/data/parkEvents";
import { MEMBERSHIP_TIERS, simulateMemberships, totalMemberCount } from "@/data/memberships";
import { AWARD_CATEGORIES, AWARD_CEREMONY_CYCLE, evaluateAwards, totalAwardGuestMult } from "@/data/awards";
import { generateSocialPosts, computeSocialReputation, socialDemandMult, socialPriceTolerance } from "@/data/socialMedia";
import { simulateEmergencies, EMERGENCY_TYPES } from "@/data/emergencies";
import { PROJECT_TYPES, getConstructionDisruption, simulateConstruction } from "@/data/construction";
import { LOAN_TERMS, createLoan, simulateLoans } from "@/data/loans";
import { EMPIRE_TIERS, getEmpireTier, calculateResortBonuses, calculateEmpirePoints } from "@/data/empire";
import { createCompetitors, simulateCompetitors } from "@/data/competitors";
import { createInitialWaterQuality, simulateWaterQuality, isWaterAttraction } from "@/data/waterQuality";
import { DISTRICTS, unlockedDistricts, checkDistrictLegendary, aggregateDistrictBonuses } from "@/data/districts";
import { VIP_TYPES, rollVipVisit, evaluateVipVisit, generateVipSocialPost, getVipType } from "@/data/vipGuests";
import { SEASONAL_EVENTS, getTriggeredCalendarEvent, getUpcomingEvents, calendarDay, getCalendarSeason } from "@/data/seasonalCalendar";
import { initRideAges, tickRideAges, refurbishRide as refurbishRideAge, refurbishCost, getAgeTier, aggregateAgingUpkeepMult, aggregateAgingAppealMult, MAX_AGE } from "@/data/rideAging";
import { rollDailyChallenges, isChallengeComplete, CHALLENGE_REFRESH_DAYS } from "@/data/dailyChallenges";
import { calculateSynergies } from "@/data/synergies";
import { calculatePrestigePoints, prestigeMultiplier, PRESTIGE_LEVEL_REQ } from "@/data/prestige";
import { getTheme as getVisualTheme } from "@/data/visualThemes";
import { calculateEcoBonuses } from "@/data/ecoItems";
import { getMascot } from "@/data/mascots";
import { canClaimReward, getStreakBonus } from "@/data/dailyRewards";
import { generateVisitorReviews, reviewReputationImpact } from "@/data/visitorReviews";
import { dailyStaffXp, trainingCost, staffLevelFromXp, trainingEffectMult } from "@/data/staffTraining";
import { base44 } from "@/api/base44Client";
import { sound } from "@/lib/soundManager";

const STORAGE_KEY = "waterpark-tycoon-save-v1";
const MILESTONE_DAYS = [25, 50, 75, 100, 150, 200];
const MILESTONE_REWARDS = { 25: 25000, 50: 75000, 75: 150000, 100: 500000, 150: 750000, 200: 1000000 };
const FIRST_ATTRACTION_BONUS = 5000;
const SLOTS_KEY = "waterpark-tycoon-slots";
const GRID_SIZE = INITIAL_GRID_SIZE;
const INITIAL_MONEY = 50000;

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
  try {
    return JSON.parse(localStorage.getItem(SLOTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSlots(obj) {
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

function slotMeta(name, s) {
  return {
    name,
    savedAt: s.savedAt,
    day: s.day,
    money: s.money,
    reputation: s.reputation,
    guests: s.guests,
  };
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
  const [log, setLog] = useState([
    { day: 0, text: "Welcome to your new water park! Place an attraction to get started." },
  ]);
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

  const level = levelFromXp(xp);
  const gridSize = grid.length;

  /** @type {import("react").MutableRefObject<Record<string, any>>} */
  const stateRef = useRef({});
  stateRef.current = { money, day, reputation, grid, staff, staffAssignments, incidents, upgrades, attractionCondition, challenge, parkZones, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, completedResearch, parkAppeal, disaster, sandbox, activeCampaigns, hotelGuests, resortRating, pricing, popularity, popularityTrend, activeEvents, xp, membershipCounts, membershipTimers, membershipStats, peakGuests, totalUpgrades, awards, awardCeremonyTimer, awardStats, awardGuestMult: totalAwardGuestMult(awards), socialPosts, socialReputation, emergencies, constructionProjects, loans, returnVisitorMult, empirePoints, competitors, marketShare, waterQuality, rideAges, vipHistory, claimedLegendary, activeCalendarEvent, dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses, builtToday, upgradedToday, mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp };

  // Load saved game
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.money != null) setMoney(data.money);
        if (data.day != null) setDay(data.day);
        if (data.reputation != null) setReputation(data.reputation);
        setGuests(data.guests ?? data.history?.[data.history.length - 1]?.guests ?? 0);
        if (data.grid) setGrid(data.grid);
        if (data.parkZones) setParkZones(data.parkZones);
        if (data.weather) setWeather(data.weather);
        if (data.forecast) setForecast(data.forecast);
        if (data.seasonEvent) setSeasonEvent(data.seasonEvent);
        if (data.ticketPrice != null) setTicketPrice(data.ticketPrice);
        if (data.adBudget != null) setAdBudget(data.adBudget);
        if (data.priorityPass != null) setPriorityPass(data.priorityPass);
        if (data.history) setHistory(data.history);
        if (data.staff) setStaff({ ...DEFAULT_STAFF, ...data.staff });
        if (data.staffAssignments) setStaffAssignments(data.staffAssignments);
        if (data.incidents) setIncidents(data.incidents);
        if (data.attractionCondition) setAttractionCondition(data.attractionCondition);
        if (data.xp != null) setXp(data.xp);
        if (data.expansionsDone != null) setExpansionsDone(data.expansionsDone);
        if (data.peakGuests != null) setPeakGuests(data.peakGuests);
        if (data.totalUpgrades != null) setTotalUpgrades(data.totalUpgrades);
        if (data.claimedMissions) setClaimedMissions(data.claimedMissions);
        if (data.challenge) setChallenge(data.challenge);
        if (data.lifetimeEarnings != null) setLifetimeEarnings(data.lifetimeEarnings);
        if (data.builtAttractionIds) setBuiltAttractionIds(data.builtAttractionIds);
        if (data.visitorStats) setVisitorStats(data.visitorStats);
        if (data.feedback) setFeedback(data.feedback);
        if (data.vipVisit) setVipVisit(data.vipVisit);
        if (data.researchPoints != null) setResearchPoints(data.researchPoints);
        if (data.completedResearch) setCompletedResearch(data.completedResearch);
        if (data.parkAppeal) setParkAppeal(data.parkAppeal);
        if (data.disaster) setDisaster(data.disaster);
        if (data.disastersSurvived != null) setDisastersSurvived(data.disastersSurvived);
        if (data.activeCampaigns) setActiveCampaigns(data.activeCampaigns);
        if (data.hotelGuests) setHotelGuests(data.hotelGuests);
        if (data.hotelStats) setHotelStats(data.hotelStats);
        if (data.resortRating != null) setResortRating(data.resortRating);
        if (data.pricing) setPricing({ ...DEFAULT_PRICING, ...data.pricing });
        if (data.popularity) setPopularity(data.popularity);
        if (data.popularityTrend) setPopularityTrend(data.popularityTrend);
        if (data.prevPopularity) setPrevPopularity(data.prevPopularity);
        if (data.activeEvents) setActiveEvents(data.activeEvents);
        if (data.membershipCounts) setMembershipCounts(data.membershipCounts);
        if (data.membershipTimers) setMembershipTimers(data.membershipTimers);
        if (data.membershipStats) setMembershipStats(data.membershipStats);
        if (data.awards) setAwards(data.awards);
        if (data.awardCeremonyTimer != null) setAwardCeremonyTimer(data.awardCeremonyTimer);
        if (data.awardStats) setAwardStats(data.awardStats);
        if (data.socialPosts) setSocialPosts(data.socialPosts);
        if (data.socialReputation != null) setSocialReputation(data.socialReputation);
        if (data.emergencies) setEmergencies(data.emergencies);
        if (data.emergencyStats) setEmergencyStats(data.emergencyStats);
        if (data.constructionProjects) setConstructionProjects(data.constructionProjects);
        if (data.loans) setLoans(data.loans);
        if (data.returnVisitorMult != null) setReturnVisitorMult(data.returnVisitorMult);
        if (data.empirePoints != null) setEmpirePoints(data.empirePoints);
        if (data.competitors) setCompetitors(data.competitors);
        if (data.marketShare != null) setMarketShare(data.marketShare);
        if (data.waterQuality) setWaterQuality(data.waterQuality);
        if (data.rideAges) setRideAges(data.rideAges);
        if (data.vipHistory) setVipHistory(data.vipHistory);
        if (data.claimedLegendary) setClaimedLegendary(data.claimedLegendary);
        if (data.activeCalendarEvent) setActiveCalendarEvent(data.activeCalendarEvent);
        if (data.dailyChallenges) setDailyChallenges(data.dailyChallenges);
        if (data.challengeDayCounter != null) setChallengeDayCounter(data.challengeDayCounter);
        if (data.autoPricing != null) setAutoPricing(data.autoPricing);
        if (data.activeTheme) setActiveTheme(data.activeTheme);
        if (data.prestigeCount != null) setPrestigeCount(data.prestigeCount);
        if (data.synergyBonuses) setSynergyBonuses(data.synergyBonuses);
        if (data.mascot !== undefined) setMascot(data.mascot);
        if (data.lastRewardDay !== undefined) setLastRewardDay(data.lastRewardDay);
        if (data.rewardStreak !== undefined) setRewardStreak(data.rewardStreak);
        if (data.visitorReviews) setVisitorReviews(data.visitorReviews);
        if (data.staffXp) setStaffXp(data.staffXp);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, incidents, attractionCondition, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents, membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer, awardStats, socialPosts, socialReputation, emergencies, emergencyStats, constructionProjects, loans, returnVisitorMult, empirePoints, rideAges, vipHistory, claimedLegendary, activeCalendarEvent, dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses, mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp })
        );
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, incidents, attractionCondition, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents, membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer, awardStats, socialPosts, socialReputation, emergencies, emergencyStats, constructionProjects, loans, returnVisitorMult, empirePoints, competitors, marketShare, waterQuality, rideAges, vipHistory, claimedLegendary, activeCalendarEvent, dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses, mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp]);

  // Load save slots list on mount
  useEffect(() => {
    const slots = readSlots();
    setSaves(Object.entries(slots).map(([name, s]) => slotMeta(name, s)));
  }, []);

  const advanceDay = useCallback(() => {
    const { grid: prevGrid, reputation: rep, day: d, staff: currentStaff, staffAssignments: currentAssignments, incidents: currentIncidents, upgrades: currentUpgrades, attractionCondition: currentCondition, challenge: currentChallenge, parkZones: currentZones, forecast: currentForecast, seasonEvent: currentSeasonEvent, parkAppeal: currentParkAppeal,     ticketPrice: currentTicketPrice, adBudget: currentAdBudget, priorityPass: currentPriorityPass, vipVisit: currentVipVisit, completedResearch: currentResearch } = stateRef.current;
    const hasResearch = (id) => (currentResearch || []).includes(id);
    const upkeepResearchMult = hasResearch("efficiency") ? 0.85 : 1;
    const ticketResearchMult = hasResearch("marketing") ? 1.10 : 1;
    const dayWeather = currentForecast || rollWeather(d + 1);
    const dayForecast = rollWeather(d + 2);
    const currentDisaster = stateRef.current.disaster;
    const isSandbox = stateRef.current.sandbox;
    const currentCampaigns = stateRef.current.activeCampaigns || [];
    const currentCalendarEvent = stateRef.current.activeCalendarEvent || null;
    const eff = { ...(currentChallenge?.effects || {}) };
    if (currentDisaster) {
      eff.guestMult = (eff.guestMult ?? 1) * (currentDisaster.effects?.guestMult ?? 1);
      eff.incomeMult = (eff.incomeMult ?? 1) * (currentDisaster.effects?.incomeMult ?? 1);
      eff.repDelta = (eff.repDelta ?? 0) + (currentDisaster.effects?.repDelta ?? 0);
      if (currentDisaster.effects?.utilityMult) eff.utilityMult = (eff.utilityMult ?? 1) * currentDisaster.effects.utilityMult;
    }
    const currentActiveEvents = stateRef.current.activeEvents || [];
    if (currentActiveEvents.length > 0) {
      const eventFx = aggregateEventEffects(currentActiveEvents);
      eff.guestMult = (eff.guestMult ?? 1) * eventFx.guestMult;
      eff.incomeMult = (eff.incomeMult ?? 1) * eventFx.incomeMult;
      eff.repDelta = (eff.repDelta ?? 0) + eventFx.repDelta;
    }
    const constructionDisruption = getConstructionDisruption(stateRef.current.constructionProjects);
    eff.guestMult = (eff.guestMult ?? 1) * constructionDisruption.guestMult;
    eff.repDelta = (eff.repDelta ?? 0) + constructionDisruption.repPerDay;
    // District bonuses from themed zones
    const activeDistrictIds = [...new Set((currentZones || []).filter((z) => z && DISTRICTS.some((d) => d.id === z)))];
    const districtBonuses = aggregateDistrictBonuses(activeDistrictIds, prevGrid, currentZones);
    // Apply district bonuses
    eff.guestMult = (eff.guestMult ?? 1) * districtBonuses.guestMult;
    eff.incomeMult = (eff.incomeMult ?? 1) * districtBonuses.incomeMult;
    // Ride synergy bonuses from adjacent complementary rides
    const synergies = calculateSynergies(prevGrid);
    setSynergyBonuses(synergies);
    eff.incomeMult = (eff.incomeMult ?? 1) * (1 + synergies.totalIncomeMult);
    // Prestige multipliers
    const pMult = prestigeMultiplier(stateRef.current.prestigeCount || 0);
    eff.incomeMult = (eff.incomeMult ?? 1) * pMult.incomeMult;
    eff.guestMult = (eff.guestMult ?? 1) * pMult.demandMult;
    // Compute aging modifiers before they affect appeal and visitor demand.
    const currentRideAges = stateRef.current.rideAges || initRideAges(prevGrid.length);
    const nextRideAges = tickRideAges(currentRideAges, prevGrid);
    const agingUpkeepMult = aggregateAgingUpkeepMult(currentRideAges, prevGrid);
    const agingAppealMult = aggregateAgingAppealMult(currentRideAges, prevGrid);
    const calculatedAppeal = calculateParkAppeal({ grid: prevGrid, zones: currentZones, getItem: getParkItem });
    calculatedAppeal.score = Math.round(calculatedAppeal.score * agingAppealMult);
    setParkAppeal(calculatedAppeal);
    const appealDemandMult = 0.85 + (calculatedAppeal.score / 100) * 0.30;
    const campaignGuestMult = currentCampaigns.reduce((sum, c) => sum + (c.effectiveBoost || 0), 1);
    const campaignRepBoost = currentCampaigns.reduce((sum, c) => sum + (c.repBoost || 0), 0);
    const placedItems = prevGrid
      .map((id, idx) => (id ? { id, idx, attr: getParkItem(id), zone: currentZones?.[idx] || null, level: (currentUpgrades || [])[idx] || 0 } : null))
      .filter(Boolean);
    const attractions = placedItems.filter((p) => p.attr.category === "attraction");
    const facilities = placedItems.filter((p) => p.attr.category === "facility");
    const lifeguardStations = facilities.filter((p) => p.id === "lifeguard_station").length;
    const toilets = facilities.filter((p) => p.id === "toilets" || p.id === "lockers").length;
    const environment = placedItems.filter((p) => p.attr.category === "environment");
    const hasEntrance = environment.some((p) => p.id === "park_entrance");
    const pathCount = environment.filter((p) => p.id === "main_path" || p.id === "service_road").length;
    const scenicCount = environment.filter((p) => ["palm_tree", "bench", "shade_umbrella", "fountain", "wayfinding_sign"].includes(p.id)).length;
    const capOf = (p) => p.attr.capacity * (1 + 0.2 * p.level);
    const incOf = (p) => p.attr.income * (1 + 0.15 * p.level);
    const funOf = (p) => Math.min(10, p.attr.fun + p.level * 0.5);
    const upkeepOf = (p) => p.attr.maintenance * (1 + 0.1 * p.level);

    const counts = currentStaff || {};
    const attractionZoneCoverage = (role) => {
      const assignedZone = currentAssignments?.[role] || "";
      if (!assignedZone) return 1;
      if (!attractions.length) return 0;
      return attractions.filter((item) => (currentZones?.[item.idx] || "") === assignedZone).length / attractions.length;
    };
    const serviceZoneCoverage = (role) => {
      const assignedZone = currentAssignments?.[role] || "";
      if (!assignedZone) return 1;
      const serviceTargets = [...attractions, ...facilities];
      if (!serviceTargets.length) return 0;
      return serviceTargets.filter((item) => (currentZones?.[item.idx] || "") === assignedZone).length / serviceTargets.length;
    };
    const currentStaffXp = stateRef.current.staffXp || {};
    const trainMult = (role) => trainingEffectMult(role, currentStaffXp[role] || 0);
    const effectiveStaff = {
      ...counts,
      lifeguard: (counts.lifeguard || 0) * attractionZoneCoverage("lifeguard") * trainMult("lifeguard"),
      mechanic: (counts.mechanic || 0) * attractionZoneCoverage("mechanic") * trainMult("mechanic"),
      cleaner: (counts.cleaner || 0) * serviceZoneCoverage("cleaner") * trainMult("cleaner"),
      security: (counts.security || 0) * attractionZoneCoverage("security") * trainMult("security"),
      entertainer: (counts.entertainer || 0) * serviceZoneCoverage("entertainer") * trainMult("entertainer"),
      fitness_coach: (counts.fitness_coach || 0) * serviceZoneCoverage("fitness_coach") * trainMult("fitness_coach"),
      gardener: (counts.gardener || 0) * serviceZoneCoverage("gardener") * trainMult("gardener"),
      chef: (counts.chef || 0) * serviceZoneCoverage("chef") * trainMult("chef"),
      photographer: (counts.photographer || 0) * serviceZoneCoverage("photographer") * trainMult("photographer"),
      event_coordinator: (counts.event_coordinator || 0) * serviceZoneCoverage("event_coordinator") * trainMult("event_coordinator"),
      aquatics_director: (counts.aquatics_director || 0) * attractionZoneCoverage("aquatics_director") * trainMult("aquatics_director"),
    };
    const fx = staffEffects(effectiveStaff);
    const uptime = fx.uptime;
    const safety = fx.safety;
    const trashCanCount = environment.filter((p) => p.id === "trash_can").length;
    const cleanliness = Math.min(1, fx.cleanliness + Math.min(0.15, trashCanCount * 0.02));
    const entertainment = fx.entertainment;
    const facilityBonus = fx.facilityBonus;
    const wages = staffWages(counts);

    // --- Eco-sustainability bonuses from green facilities ---
    const ecoBonuses = calculateEcoBonuses(prevGrid);
    // --- Park mascot mood & income bonus ---
    const mascotDef = getMascot(stateRef.current.mascot);
    const mascotMoodBoost = mascotDef ? mascotDef.moodBoost : 0;
    const mascotIncomeMult = mascotDef ? (1 + mascotDef.incomeBoost) : 1;

    // Empire tier and resort-wide bonuses
    const empireTier = getEmpireTier(stateRef.current.empirePoints || 0);
    const resortBonuses = calculateResortBonuses(prevGrid);

    // --- Resolve active incidents: staff improve the odds of a fix ---
    const mechPower = Math.min(0.9, 0.3 + (counts.mechanic || 0) * 0.2);
    const cleanPower = Math.min(0.9, 0.35 + (counts.cleaner || 0) * 0.2);
    const remaining = [];
    const resolved = [];
    const assignedCount = (role, tileIndex) => {
      const zone = currentZones?.[tileIndex] || "";
      const assignment = currentAssignments?.[role] || "";
      return assignment && assignment !== zone ? 0 : (counts[role] || 0);
    };
    for (const inc of currentIncidents || []) {
      const zone = currentZones?.[inc.tileIndex] || "";
      const mechanicCount = (currentAssignments?.mechanic && currentAssignments.mechanic !== zone) ? 0 : (counts.mechanic || 0);
      const cleanerCount = (currentAssignments?.cleaner && currentAssignments.cleaner !== zone) ? 0 : (counts.cleaner || 0);
      const power = inc.type === "breakdown"
        ? Math.min(0.9, 0.3 + mechanicCount * 0.2)
        : Math.min(0.9, 0.35 + cleanerCount * 0.2);
      if (Math.random() < power) resolved.push(inc);
      else remaining.push(inc);
    }
    const incidentByTile = new Map(remaining.map((i) => [i.tileIndex, i]));
    // --- Guests & income: agent-based visitor simulation ---
    const workingAttractions = attractions.filter(
      (p) => incidentByTile.get(p.idx)?.type !== "breakdown"
    );
    const totalCapacity = workingAttractions.reduce((s, p) => s + capOf(p), 0);

    let newGuests = 0;
    let income = 0;
    let newReputation = rep;
    let visitorStats = { avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} };
    let dayFeedback = [];

    if (attractions.length > 0) {
      const demand = Math.floor(
        (rep / 100) * totalCapacity * 1.15 * (1 + d / 80) *
        (eff.guestMult ?? 1) *
        (dayWeather.guestMult ?? 1) *
        (currentSeasonEvent?.guestMult ?? 1) *
        (1 + currentAdBudget / 5000) *
        campaignGuestMult *
        (stateRef.current.awardGuestMult || 1) *
        socialDemandMult(stateRef.current.socialReputation) *
        appealDemandMult *
        (hasEntrance ? 1 : 0.9) *
        Math.min(1.25, aggregatePriceReaction(currentTicketPrice) * socialPriceTolerance(stateRef.current.socialReputation)) *
        (stateRef.current.returnVisitorMult || 1) *
        (1 + empireTier.bonuses.demand)
      );
      const safetyCoverage = Math.min(1, (effectiveStaff.lifeguard || 0) / Math.max(1, Math.ceil(attractions.length / 3)) + lifeguardStations * 0.12);
      const guestSafetyMult = safetyCoverage < 0.45 ? 0.88 : safetyCoverage < 0.7 ? 0.96 : 1;
      newGuests = Math.min(demand, Math.round(totalCapacity * guestSafetyMult));

      const currentPricing = stateRef.current.pricing || DEFAULT_PRICING;
      const sim = simulateVisits({
        demand: newGuests,
        placedItems: [...attractions, ...facilities],
        queuePaths: environment.filter((p) => p.id === "queue_path"),
        incidents: incidentByTile,
        uptime,
        safety,
        cleanliness,
        incomeMult: eff.incomeMult ?? 1,
        entertainment,
        facilityBonus,
        appealBonus: (calculatedAppeal.score - 50) * 0.025 + empireTier.bonuses.satisfaction * 10 + resortBonuses.moodBoost,
        pricing: currentPricing,
        weather: dayWeather,
        seasonEvent: currentSeasonEvent,
        popularity: stateRef.current.popularity,
      });
      income = sim.income;
      visitorStats = sim;
      // Apply mascot mood boost
      if (mascotMoodBoost > 0 && visitorStats.avgMood != null) {
        visitorStats = { ...visitorStats, avgMood: Math.min(100, visitorStats.avgMood + mascotMoodBoost) };
      }
      // Return visitor system: satisfied guests boost future demand
      {
        const totalExp = (sim.guestExperience?.happy || 0) + (sim.guestExperience?.content || 0) + (sim.guestExperience?.unhappy || 0);
        const satRate = totalExp > 0 ? (sim.guestExperience?.happy || 0) / totalExp : 0;
        setReturnVisitorMult((prev) => Math.max(0.8, Math.min(1.3, prev * 0.7 + (0.9 + satRate * 0.4) * 0.3)));
      }
      if (currentDisaster?.effects?.repDelta) {
        visitorStats = { ...visitorStats, avgMood: Math.max(0, visitorStats.avgMood - Math.abs(currentDisaster.effects.repDelta) * 4) };
      }
      dayFeedback = generateFeedback(sim, { day: d + 1, weather: dayWeather, incidents: remaining, cleanliness, safety, entertainment });
      const signatureRides = attractions.filter((p) => ["water_coaster", "mega_slide_complex", "freefall_drop", "cliff_jump", "tornado_bowl", "aqua_loop"].includes(p.id));
      const bigMoment = signatureRides.find((p) => (visitorStats.movements?.[p.id] || 0) >= Math.max(10, p.attr.capacity * 0.08));
      if (bigMoment) dayFeedback = [{ day: d + 1, text: `🔥 MASSIVE SPLASH! ${bigMoment.attr.name} is the star of the park today.` }, ...dayFeedback];

      const avgMood = sim.avgMood;
      let repDelta = 0;
      if (avgMood >= 70) repDelta += 1.5;
      else if (avgMood < 40) repDelta -= 1.5;
      else if (avgMood < 55) repDelta -= 0.5;
      if (facilities.some((f) => f.attr.id === "first_aid")) repDelta += 0.5;
      if (facilities.some((f) => f.attr.id === "guest_services")) repDelta += 0.3;
      if (facilities.some((f) => f.attr.id === "dining")) repDelta += 0.5;
      if (facilities.some((f) => f.attr.id === "lockers" || f.attr.id === "toilets")) repDelta += 0.3;
      if (toilets > 0) repDelta += Math.min(0.4, toilets * 0.08);
      if (lifeguardStations > 0) repDelta += Math.min(0.5, lifeguardStations * 0.1);
      repDelta += (cleanliness - 0.6) * 1.5;
      repDelta += (safety - 0.7) * 0.8;
      repDelta += (effectiveStaff.gardener || 0) * 0.1;
      repDelta -= remaining.reduce(
        (s, inc) => s + (inc.type === "breakdown" ? 1.2 : 0.6),
        0
      );
      repDelta += eff.repDelta ?? 0;
      repDelta += campaignRepBoost;
      const currentHotelGuests = stateRef.current.hotelGuests || [];
      const currentResortRating = stateRef.current.resortRating || 0;
      if (currentHotelGuests.length > 0) {
        const avgHotelHappiness = currentHotelGuests.reduce((s, g) => s + (g.happiness || 50), 0) / currentHotelGuests.length;
        if (avgHotelHappiness >= 75) repDelta += 0.5;
        else if (avgHotelHappiness < 40) repDelta -= 0.4;
      }
      if (currentResortRating >= 4) repDelta += 0.3;
      if (dayWeather.id === "rain") repDelta -= 0.8;
      else if (dayWeather.id === "sunny") repDelta += 0.35;
      repDelta += Math.min(1.5, scenicCount * 0.08 + pathCount * 0.03);
      repDelta += (calculatedAppeal.score - 50) * 0.035;
      if (hasEntrance) repDelta += 0.2;
      if (environment.filter((p) => currentZones?.[p.idx]).length >= 5) repDelta += 0.25;
      if (currentSeasonEvent) repDelta += currentSeasonEvent.repDelta || 0;
      repDelta += ecoBonuses.repBoost;
      if (mascotDef) repDelta += 0.2;
      newReputation = Math.max(0, Math.min(100, rep + repDelta));
      if (hasResearch("filtration")) newReputation = Math.min(100, newReputation + 1);
    } else {
      newReputation = Math.max(0, rep - 1);
      setReturnVisitorMult((prev) => Math.max(0.8, prev * 0.95));
    }

    // Calculate wear after guest demand and capacity have been determined.
    const nextCondition = Array(prevGrid.length).fill(100);
    for (const p of attractions) {
      let condition = Number.isFinite(currentCondition?.[p.idx]) ? currentCondition[p.idx] : 100;
      const activeIncident = incidentByTile.get(p.idx);
      const resolvedIncident = resolved.find((inc) => inc.tileIndex === p.idx);
      const loadPressure = Math.min(1.5, newGuests / Math.max(1, totalCapacity || capOf(p)));
      const wear = 1.2 + loadPressure * 2.4 + p.level * 0.25 + (dayWeather.id === "storm" ? 1.2 : 0);
      if (resolvedIncident?.type === "breakdown") condition += 32;
      else if (resolvedIncident?.type === "maintenance") condition += 18;
      const zone = currentZones?.[p.idx] || "";
      const mechanicAssigned = currentAssignments?.mechanic && currentAssignments.mechanic !== zone ? 0 : (counts.mechanic || 0);
      condition += Math.min(10, mechanicAssigned * 3.5);
      condition -= wear;
      if (activeIncident?.type === "breakdown") condition = Math.min(condition, 8);
      if (activeIncident?.type === "maintenance") condition = Math.min(condition, 28);
      nextCondition[p.idx] = Math.max(0, Math.min(100, Math.round(condition)));
    }

    // --- Roll at most one new incident per day (staff reduce the odds) ---
    const incidentTiles = new Set(remaining.map((i) => i.tileIndex));
    const eligible = attractions.filter((p) => !incidentTiles.has(p.idx));
    const newIncidents = [];
    if (eligible.length > 0 && !isSandbox) {
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      const condition = nextCondition[pick.idx] ?? 100;
      const breakChance = Math.max(0, 0.11 - 0.018 * (counts.mechanic || 0) - 0.015 * (counts.security || 0) + (condition < 35 ? 0.16 : condition < 55 ? 0.06 : 0));
      const maintChance = Math.max(0, 0.09 - 0.015 * (counts.cleaner || 0) - 0.015 * (counts.gardener || 0) + (condition < 60 ? 0.08 : 0));
      const r = Math.random();
      if (condition <= 10 || r < breakChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "breakdown", attractionId: pick.id, since: d + 1 });
      } else if (condition <= 32 || r < breakChance + maintChance) {
        newIncidents.push({ tileIndex: pick.idx, type: "maintenance", attractionId: pick.id, since: d + 1 });
      }
    }
    setIncidents([...remaining, ...newIncidents]);
    if (currentDisaster?.id === "storm_damage") {
      for (const p of attractions) {
        nextCondition[p.idx] = Math.max(0, nextCondition[p.idx] - 12);
      }
    }
    setAttractionCondition(nextCondition);

    // --- Water quality simulation ---
    const hasWaterTreatment = prevGrid.some((id) => id === "water_treatment");
    const hasFiltration = hasResearch("filtration");
    const wqResult = simulateWaterQuality({
      grid: prevGrid,
      waterQuality: stateRef.current.waterQuality || Array(prevGrid.length).fill(100),
      guests: newGuests,
      staff: counts,
      weather: dayWeather,
      hasFiltration,
      hasWaterTreatment,
    });
    setWaterQuality(wqResult.nextQuality);
    if (wqResult.moodPenalty !== 0 && visitorStats) {
      visitorStats = { ...visitorStats, avgMood: Math.max(0, (visitorStats.avgMood || 0) - wqResult.moodPenalty) };
    }
    if (wqResult.reputationRisk > 0) {
      newReputation = Math.max(0, newReputation - wqResult.reputationRisk);
    }

    // --- Social media posts & viral ride boosts ---
    const newSocialPosts = generateSocialPosts({
      day: d + 1,
      visitorStats,
      incidents: remaining,
      attractions,
      activeEvents: currentActiveEvents,
      popularity: stateRef.current.popularity,
    });
    const viralRidePosts = newSocialPosts.filter((p) => p.viral && p.sentiment === "positive" && p.rideIdx != null);

    // --- Ride popularity & trends tick ---
    setPrevPopularity([...(stateRef.current.popularity || [])]);
    const popResult = tickPopularity({
      attractions,
      popularity: stateRef.current.popularity,
      trendBoost: stateRef.current.popularityTrend,
      movements: visitorStats?.movements || {},
      totalVisits: visitorStats?.totalVisits || 0,
      condition: nextCondition,
      reputation: Math.round(newReputation),
      pricing: stateRef.current.pricing || DEFAULT_PRICING,
      guestTypes: visitorStats?.guestTypes || {},
      weather: dayWeather,
    });
    const adjustedTrend = [...popResult.trendBoost];
    for (const post of viralRidePosts) {
      if (adjustedTrend[post.rideIdx] != null) {
        adjustedTrend[post.rideIdx] = Math.min(100, (adjustedTrend[post.rideIdx] || 0) + 15);
      }
    }
    setPopularity(popResult.popularity);
    setPopularityTrend(adjustedTrend);

    // --- Social media reputation ---
    const updatedSocialPosts = [...newSocialPosts, ...(stateRef.current.socialPosts || [])].slice(0, 30);
    setSocialPosts(updatedSocialPosts);
    const newSocialRep = computeSocialReputation(updatedSocialPosts, stateRef.current.socialReputation);
    setSocialReputation(newSocialRep);
    const viralToday = newSocialPosts.filter((p) => p.viral);
    if (viralToday.length > 0) {
      const top = viralToday[0];
      setLog((l) => [{
        day: d + 1,
        text: top.sentiment === "positive"
          ? `Day ${d + 1}: 📱 ${top.platformName}: "${top.text.slice(0, 42)}..." went VIRAL! +${top.reach.toLocaleString()} views`
          : `Day ${d + 1}: 📱 ${top.platformName}: Negative post going viral! "${top.text.slice(0, 42)}..." (${top.reach.toLocaleString()} views)`,
      }, ...l].slice(0, 12));
    }

    // --- Hotel / Resort simulation ---
    const placedHotels = prevGrid.map((id, idx) => {
      const def = getHotelDef(id);
      return def ? { def, tileIndex: idx } : null;
    }).filter(Boolean);
    let hotelResult = null;
    let newResortRating = stateRef.current.resortRating || 0;
    if (placedHotels.length > 0) {
      hotelResult = simulateHotelDay({
        hotels: placedHotels,
        hotelGuests: stateRef.current.hotelGuests || [],
        upgrades: currentUpgrades,
        day: d + 1,
        reputation: Math.round(newReputation),
        resortRating: stateRef.current.resortRating || 0,
        seasonEvent: currentSeasonEvent,
        weather: dayWeather,
        parkMood: visitorStats?.avgMood || 50,
        sandbox: isSandbox,
        hotelPriceMult: (stateRef.current.pricing || DEFAULT_PRICING).hotelPriceMult,
      });
      // Hotel guests visit the park — simulated spending at attractions & facilities
      if (hotelResult.totalGuests > 0) {
        const hotelParkSim = simulateVisits({
          demand: hotelResult.totalGuests,
          placedItems: [...attractions, ...facilities],
          queuePaths: environment.filter((p) => p.id === "queue_path"),
          incidents: incidentByTile,
          uptime,
          safety,
          cleanliness,
          incomeMult: eff.incomeMult ?? 1,
          entertainment,
          facilityBonus,
          appealBonus: (calculatedAppeal.score - 50) * 0.025 + empireTier.bonuses.satisfaction * 10 + resortBonuses.moodBoost + districtBonuses.moodBoost,
          pricing: stateRef.current.pricing || DEFAULT_PRICING,
          weather: dayWeather,
          seasonEvent: currentSeasonEvent,
          popularity: stateRef.current.popularity,
        });
        hotelResult.parkSpend = hotelParkSim.income;
        if (hotelResult.avgHappiness > 0) {
          hotelResult.avgHappiness = Math.round((hotelResult.avgHappiness + hotelParkSim.avgMood) / 2);
        }
      }
      newResortRating = calculateResortRating(placedHotels, currentUpgrades);
      setHotelGuests(hotelResult.remainingGuests);
      setResortRating(newResortRating);
      const guestsByHotel = {};
      for (const h of placedHotels) {
        guestsByHotel[h.tileIndex] = hotelResult.remainingGuests.filter((g) => g.hotelTile === h.tileIndex).length;
      }
      setHotelStats({
        roomRevenue: hotelResult.roomRevenue,
        hotelExpenses: hotelResult.hotelExpenses,
        parkSpend: hotelResult.parkSpend,
        occupancy: hotelResult.occupancy,
        avgHappiness: hotelResult.avgHappiness,
        totalGuests: hotelResult.totalGuests,
        totalRooms: hotelResult.totalRooms,
        guestsByHotel,
      });
    }
    const hotelRoomRevenue = hotelResult?.roomRevenue || 0;
    const hotelParkSpend = hotelResult?.parkSpend || 0;
    const hotelExpensesAmount = hotelResult?.hotelExpenses || 0;

    // --- Membership simulation: sales, renewals, member visits & spending ---
    const currentLevel = levelFromXp(stateRef.current.xp || 0);
    const membershipResult = simulateMemberships({
      counts: stateRef.current.membershipCounts || {},
      daysUntilRenewal: stateRef.current.membershipTimers || {},
      reputation: Math.round(newReputation),
      parkAppealScore: calculatedAppeal.score,
      dayGuests: newGuests,
      level: currentLevel,
      weather: dayWeather,
      seasonEvent: currentSeasonEvent,
      activeEvents: currentActiveEvents,
    });
    setMembershipCounts(membershipResult.counts);
    setMembershipTimers(membershipResult.daysUntilRenewal);
    setMembershipStats((prev) => ({
      totalMembers: totalMemberCount(membershipResult.counts),
      dailyRevenue: membershipResult.totalRevenue,
      totalRevenue: (prev?.totalRevenue || 0) + membershipResult.totalRevenue,
      memberVisits: membershipResult.memberVisits,
      memberSpend: membershipResult.memberSpend,
      totalRenewed: (prev?.totalRenewed || 0) + membershipResult.totalRenewed,
      totalChurned: (prev?.totalChurned || 0) + membershipResult.totalChurned,
    }));

    // --- Emergency simulation ---
    const emergencyResult = simulateEmergencies({
      day: d + 1,
      emergencies: stateRef.current.emergencies,
      staff: counts,
      staffAssignments: currentAssignments,
      parkZones: currentZones,
      attractionCondition: nextCondition,
      weather: dayWeather,
      cleanliness,
      safety,
      guests: newGuests,
      attractions,
      sandbox: isSandbox,
    });
    setEmergencies(emergencyResult.allActive);
    if (emergencyResult.resolvedEmergencies.length > 0 || emergencyResult.newEmergencies.length > 0) {
      setEmergencyStats((prev) => ({
        totalEmergencies: (prev?.totalEmergencies || 0) + emergencyResult.newEmergencies.length,
        totalCost: (prev?.totalCost || 0) + emergencyResult.totalCost,
        resolvedCount: (prev?.resolvedCount || 0) + emergencyResult.resolvedEmergencies.length,
      }));
    }
    if (emergencyResult.repImpact !== 0) {
      setReputation((rv) => Math.max(0, Math.min(100, rv - emergencyResult.repImpact)));
    }
    if (emergencyResult.moodImpact !== 0) {
      setVisitorStats((vs) => ({ ...vs, avgMood: Math.max(0, (vs?.avgMood || 0) + emergencyResult.moodImpact) }));
    }
    if (emergencyResult.logEntries.length) {
      setLog((l) => [...emergencyResult.logEntries, ...l].slice(0, 12));
    }

    // --- Loan simulation ---
    const loanResult = simulateLoans(stateRef.current.loans, d + 1);
    setLoans(loanResult.updatedLoans);
    if (loanResult.logEntries.length) {
      setLog((l) => [...loanResult.logEntries, ...l].slice(0, 12));
    }

    const ticketRevenue = newGuests * currentTicketPrice * ticketResearchMult;
    const conditionIncomeMult = workingAttractions.length ? workingAttractions.reduce((sum, p) => sum + (0.72 + (nextCondition[p.idx] || 0) * 0.0028), 0) / workingAttractions.length : 0;
    const rideIncome = income * conditionIncomeMult *
      (dayWeather.incomeMult ?? 1) *
      (currentSeasonEvent?.incomeMult ?? 1) *
      (currentPriorityPass ? 1.08 : 1) *
      (1 + empireTier.bonuses.income) *
      (1 + resortBonuses.spending) *
      mascotIncomeMult;
    const utilities = Math.round(
      (150 + attractions.length * 45 + facilities.length * 18 + newGuests * 2.2) *
      (dayWeather.utilityMult ?? 1) *
      (1 - (ecoBonuses.utilityReduction || 0))
    );
    const diffUpkeepMult = getDifficulty(getSettings().difficulty).upkeepMult;
    const expenses =
      (placedItems.filter((p) => p.attr.category !== "hotel").reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) * upkeepResearchMult * agingUpkeepMult +
      wages * (eff.wageMult ?? 1) * (1 - (fx.wageReduction || 0)) +
      utilities +
      currentAdBudget +
      (currentPriorityPass ? 120 : 0)) * diffUpkeepMult +
      hotelExpensesAmount;
    const eventRevenuePerDay = currentActiveEvents.reduce((s, e) => s + (e.revenuePerDay || 0), 0);
    const emergencyCost = emergencyResult.totalCost;
    const grossIncome = Math.round(ticketRevenue + rideIncome + hotelRoomRevenue + hotelParkSpend + eventRevenuePerDay + membershipResult.totalRevenue + membershipResult.memberSpend);
    const upkeep = Math.round(placedItems.filter((p) => p.attr.category !== "hotel").reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) * upkeepResearchMult);
    const wageCost = Math.round(wages * (eff.wageMult ?? 1) * (1 - (fx.wageReduction || 0)));
    const marketingCost = currentAdBudget;
    const utilityCost = utilities;
    const premiumCost = currentPriorityPass ? 120 : 0;
    const net = isSandbox ? Math.round(grossIncome - emergencyCost - loanResult.loanPayment) : Math.round(grossIncome - expenses - emergencyCost - loanResult.loanPayment);

    // --- Build log entries (newest first) ---
    const entries = [];
    for (const inc of newIncidents) {
      const a = getParkItem(inc.attractionId);
      entries.push({
        day: d + 1,
        text:
          inc.type === "breakdown"
            ? `Day ${d + 1}: ⚠️ ${a.name} broke down! Hire mechanics to repair it.`
            : `Day ${d + 1}: 🔧 ${a.name} needs maintenance. Cleaners can speed it up.`,
      });
    }
    for (const inc of resolved) {
      const a = getParkItem(inc.attractionId);
      entries.push({
        day: d + 1,
        text:
          inc.type === "breakdown"
            ? `Day ${d + 1}: ✅ Mechanics repaired the ${a.name}!`
            : `Day ${d + 1}: ✅ Cleaners restored the ${a.name}.`,
      });
    }
    entries.push({
      day: d + 1,
      text:
        attractions.length === 0
          ? `Day ${d + 1}: No attractions yet — build something to draw guests!`
          : `Day ${d + 1}: ${newGuests} guests · income $${Math.round(
              income
            )} · upkeep $${expenses} · net ${net >= 0 ? "+" : ""}$${net}`,
    });
    if (hotelResult && placedHotels.length > 0) {
      entries.push({
        day: d + 1,
        text: `Day ${d + 1}: 🏨 Resort: ${hotelResult.totalGuests} guests · $${(hotelResult.roomRevenue + hotelResult.parkSpend).toLocaleString()} revenue · ${hotelResult.occupancy}% occupancy · ${hotelResult.avgHappiness}% happiness`,
      });
    }
    if (currentActiveEvents.length > 0) {
      const eventNames = currentActiveEvents.map((e) => e.name).join(", ");
      entries.push({
        day: d + 1,
        text: eventRevenuePerDay > 0
          ? `Day ${d + 1}: 🎉 Events active: ${eventNames} · +$${eventRevenuePerDay.toLocaleString()} event revenue`
          : `Day ${d + 1}: 🎉 Events active: ${eventNames}`,
      });
    }
    if (membershipResult.totalRevenue > 0 || membershipResult.memberVisits > 0) {
      entries.push({
        day: d + 1,
        text: `Day ${d + 1}: 🎫 Members: ${totalMemberCount(membershipResult.counts)} active · ${membershipResult.memberVisits} visits · +$${membershipResult.totalRevenue.toLocaleString()} revenue`,
      });
    }

    setMoney((m) => m + net);
    setDay((x) => x + 1);
    setWeather(dayWeather);
    setForecast(dayForecast);
    setRideAges(nextRideAges);
    const totalGuestsToday = newGuests + (membershipResult?.memberVisits || 0);
    setGuests(totalGuestsToday);
    setPeakGuests((p) => Math.max(p, totalGuestsToday));
    setVisitorStats(visitorStats);
    if (dayFeedback.length) setFeedback((prev) => [...dayFeedback, ...prev].slice(0, 40));
    setLifetimeEarnings((e) => e + grossIncome);
    // --- Visitor reviews: guests leave star ratings and comments ---
    if (newGuests >= 5) {
      const newReviews = generateVisitorReviews({
        day: d + 1, guests: newGuests, avgMood: visitorStats?.avgMood || 50,
        attractions, facilities, incidents: remaining,
        popularity: stateRef.current.popularity, attractionCondition: nextCondition,
        cleanliness, safety,
      });
      if (newReviews.length) {
        setVisitorReviews((prev) => [...newReviews, ...prev].slice(0, 100));
        const repImpact = reviewReputationImpact(newReviews);
        if (repImpact !== 0) newReputation = Math.max(0, Math.min(100, newReputation + repImpact));
      }
    }
    // --- Staff training XP: staff gain XP from working each day ---
    {
      const xpGains = {};
      for (const role of Object.keys(STAFF)) {
        const cnt = counts[role] || 0;
        const gained = dailyStaffXp(cnt);
        if (gained > 0) xpGains[role] = (currentStaffXp[role] || 0) + gained;
      }
      if (Object.keys(xpGains).length > 0) {
        setStaffXp((prev) => ({ ...prev, ...xpGains }));
      }
    }
    // Award empire points based on daily performance
    const epEarned = calculateEmpirePoints({
      netIncome: Math.max(0, net),
      avgMood: visitorStats?.avgMood || 0,
      peakGuests: newGuests,
      resortRating: newResortRating,
    });
    if (epEarned > 0) setEmpirePoints((ep) => ep + epEarned);
    setReputation(Math.round(newReputation));

    // --- Competitor parks simulation ---
    const compResult = simulateCompetitors({
      competitors: stateRef.current.competitors || createCompetitors(d + 1),
      playerReputation: Math.round(newReputation),
      playerAppeal: calculatedAppeal.score,
      playerGuests: newGuests,
      day: d + 1,
      playerLevel: levelFromXp(stateRef.current.xp || 0),
    });
    setCompetitors(compResult.updated);
    setMarketShare(compResult.marketShare);
    if (compResult.playerGuestLoss > 0) {
      setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 🏊 Rivals stole ${compResult.playerGuestLoss} guests! Improve your park to win them back.` }, ...l].slice(0, 12));
    }

    setLastNet(net);
    const staffTotal = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
    const rpEarned = dailyResearchPoints(attractions.length, staffTotal);
    if (rpEarned > 0) setResearchPoints((rp) => rp + rpEarned);
    setHistory((h) =>
      [...h, {
        day: d + 1,
        income: grossIncome,
        guests: newGuests,
        reputation: Math.round(newReputation),
        net,
        ticketRevenue: Math.round(ticketRevenue),
        rideIncome: Math.round(rideIncome),
        upkeep,
        wages: wageCost,
        utilities: utilityCost,
        marketing: marketingCost,
        premium: premiumCost,
        weather: dayWeather.name,
        event: currentSeasonEvent?.name || null,
        parkAppeal: calculatedAppeal.score,
        hotelRevenue: hotelRoomRevenue + hotelParkSpend,
        hotelExpenses: hotelExpensesAmount,
        eventRevenue: eventRevenuePerDay,
        membershipRevenue: membershipResult.totalRevenue,
        memberSpend: membershipResult.memberSpend,
        memberVisits: membershipResult.memberVisits,
        emergencyCost: emergencyCost,
        loanPayment: loanResult.loanPayment,
      }].slice(-60)
    );

    // --- Milestone rewards at key days ---
    if (MILESTONE_DAYS.includes(d + 1)) {
      const reward = MILESTONE_REWARDS[d + 1] || 0;
      if (reward > 0) {
        setMoney((m) => m + reward);
        setXp((x) => x + Math.floor(reward / 100));
        sound.milestone();
        entries.push({ day: d + 1, text: `Day ${d + 1}: 🎖️ MILESTONE! Day ${d + 1} reached — bonus $${reward.toLocaleString()}!` });
      }
    }

    setLog((l) => [...entries, ...l].slice(0, 12));

    // --- Resolve seasonal park events ---
    if (currentSeasonEvent) {
      const daysLeft = currentSeasonEvent.daysLeft - 1;
      if (daysLeft <= 0) {
        setSeasonEvent(null);
        setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: Event ended — ${currentSeasonEvent.name}.` }, ...l].slice(0, 12));
      } else {
        setSeasonEvent({ ...currentSeasonEvent, daysLeft });
      }
    } else {
      const nextEvent = rollSeasonEvent(d + 1);
      if (nextEvent) {
        setSeasonEvent({ ...nextEvent, daysLeft: nextEvent.duration });
        setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: ${nextEvent.name}! ${nextEvent.description}` }, ...l].slice(0, 12));
      }
    }

    // --- Resolve active seasonal calendar event ---
    if (currentCalendarEvent) {
      const daysLeft = currentCalendarEvent.daysLeft - 1;
      if (daysLeft <= 0) {
        setActiveCalendarEvent(null);
        setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 📅 ${currentCalendarEvent.name} has ended.` }, ...l].slice(0, 12));
      } else {
        setActiveCalendarEvent({ ...currentCalendarEvent, daysLeft });
      }
    }

    // --- Resolve / advance / roll a random challenge ---
    const challengeEntries = [];
    if (currentChallenge) {
      const nextLeft = currentChallenge.daysLeft - 1;
      if (nextLeft <= 0) {
        if (currentChallenge.resolve?.type === "vip") {
          const r = currentChallenge.resolve;
          if (Math.round(newReputation) >= r.repRequired) {
            setMoney((m) => m + r.success.money);
            setReputation((rv) => Math.max(0, Math.min(100, rv + r.success.rep)));
            challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: 👑 VIP impressed! +$${r.success.money.toLocaleString()} and +${r.success.rep} reputation.` });
          } else {
            setReputation((rv) => Math.max(0, Math.min(100, rv + r.fail.rep)));
            challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: 👑 VIP left unimpressed. ${r.fail.rep} reputation.` });
          }
        } else {
          challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: ${currentChallenge.name} has passed.` });
        }
        setChallenge(null);
      } else {
        setChallenge({ ...currentChallenge, daysLeft: nextLeft });
      }
    } else if (d + 1 >= 3 && Math.random() < 0.18) {
      const picked = rollChallenge();
      setChallenge({ ...picked, daysLeft: picked.duration });
      challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: ⚡ ${picked.name}! ${picked.desc}` });
    }
    if (challengeEntries.length) {
      setLog((l) => [...challengeEntries, ...l].slice(0, 12));
    }

    // --- VIP celebrity visit: resolve an active visit, or occasionally spawn one ---
    const vipEntries = [];
    if (currentVipVisit) {
      const outcome = evaluateVipVisit(currentVipVisit, {
        avgMood: visitorStats?.avgMood || 0,
        cleanliness,
        safety,
        reputation: Math.round(newReputation),
      });
      if (outcome.money > 0) setMoney((m) => m + outcome.money);
      if (outcome.reputation !== 0) setReputation((rv) => Math.max(0, Math.min(100, rv + outcome.reputation)));
      vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ ${currentVipVisit.typeName} ${currentVipVisit.name} visited. ${outcome.message}` });
      // Track history
      setVipHistory((h) => [{ name: currentVipVisit.name, typeId: currentVipVisit.typeId, typeName: currentVipVisit.typeName, day: d + 1, outcome: outcome.outcome }, ...h].slice(0, 20));
      // Generate VIP social post
      if (outcome.socialBoost || outcome.outcome === "disappointed") {
        const vipPost = generateVipSocialPost(currentVipVisit, outcome, d + 1);
        setSocialPosts((sp) => [vipPost, ...sp].slice(0, 30));
      }
      setVipVisit(null);
    } else if (attractions.length > 0 && d + 1 >= 5 && Math.random() < 0.10) {
      const newVip = rollVipVisit(levelFromXp(stateRef.current.xp || 0));
      if (newVip) {
        newVip.day = d + 1;
        setVipVisit(newVip);
        sound.vip();
        vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ A ${newVip.typeName} arrived — ${newVip.name}! Impress them for a big reward.` });
      }
    }
    if (vipEntries.length) {
      setLog((l) => [...vipEntries, ...l].slice(0, 12));
    }

    // --- Seasonal calendar events: auto-trigger on specific days ---
    const calendarEvent = getTriggeredCalendarEvent(d + 1);
    if (calendarEvent) {
      setActiveCalendarEvent({ ...calendarEvent, daysLeft: calendarEvent.duration });
      setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 📅 ${calendarEvent.decoration} ${calendarEvent.name}! ${calendarEvent.desc}` }, ...l].slice(0, 12));
    }

    // --- Tick active marketing campaigns ---
    if (currentCampaigns.length) {
      const updatedCampaigns = [];
      const expiredEntries = [];
      for (const c of currentCampaigns) {
        const daysLeft = c.daysLeft - 1;
        if (daysLeft <= 0) {
          expiredEntries.push({ day: d + 1, text: `Day ${d + 1}: 📣 ${c.name} campaign ended.` });
        } else {
          updatedCampaigns.push({ ...c, daysLeft });
        }
      }
      setActiveCampaigns(updatedCampaigns);
      if (expiredEntries.length) setLog((l) => [...expiredEntries, ...l].slice(0, 12));
    }

    // --- Tick active major events ---
    if (currentActiveEvents.length) {
      const updatedEvents = [];
      const expiredEventEntries = [];
      for (const ev of currentActiveEvents) {
        const daysLeft = ev.daysLeft - 1;
        if (daysLeft <= 0) {
          expiredEventEntries.push({ day: d + 1, text: `Day ${d + 1}: 🎉 ${ev.name} has ended.` });
        } else {
          updatedEvents.push({ ...ev, daysLeft });
        }
      }
      setActiveEvents(updatedEvents);
      if (expiredEventEntries.length) setLog((l) => [...expiredEventEntries, ...l].slice(0, 12));
    }

    // --- Resolve / roll disasters ---
    if (!isSandbox) {
      const disasterEntries = [];
      if (currentDisaster) {
        const daysLeft = currentDisaster.daysLeft - 1;
        if (daysLeft <= 0) {
          setDisaster(null);
          setDisastersSurvived((n) => n + 1);
          disasterEntries.push({ day: d + 1, text: `Day ${d + 1}: ✅ ${currentDisaster.name} has passed.` });
        } else {
          setDisaster({ ...currentDisaster, daysLeft });
        }
      } else if (d + 1 >= 5) {
        const newDisaster = rollDisaster(d + 1, currentResearch);
        if (newDisaster) {
          const mitigation = disasterMitigation(newDisaster, counts, currentResearch);
          const adjustedDuration = Math.max(1, newDisaster.duration - Math.round(mitigation));
          setDisaster({ ...newDisaster, daysLeft: adjustedDuration });
          sound.disaster();
          disasterEntries.push({ day: d + 1, text: `Day ${d + 1}: 🚨 ${newDisaster.name}! ${newDisaster.description}` });
        }
      }
      if (disasterEntries.length) {
        setLog((l) => [...disasterEntries, ...l].slice(0, 12));
      }
    }

    // --- Annual Awards Ceremony (every AWARD_CEREMONY_CYCLE days) ---
    const ceremonyTimer = stateRef.current.awardCeremonyTimer ?? AWARD_CEREMONY_CYCLE;
    if (ceremonyTimer <= 1) {
      const evaluation = evaluateAwards({
        grid: prevGrid, upgrades: currentUpgrades, attractionCondition: nextCondition,
        staff: counts, visitorStats, parkAppeal: calculatedAppeal,
        reputation: Math.round(newReputation), incidents: remaining,
        hotelStats: stateRef.current.hotelStats || {}, membershipCounts: membershipResult.counts,
        popularity: popResult.popularity, peakGuests: Math.max(stateRef.current.peakGuests || 0, totalGuestsToday),
        totalUpgrades: stateRef.current.totalUpgrades || 0, resortRating: newResortRating,
      });
      const heldIds = new Set((stateRef.current.awards || []).map((a) => a.id));
      const newAwards = [];
      const ceremonyEntries = [];
      let repFromAwards = 0;
      for (const result of evaluation.results) {
        const wasHeld = heldIds.has(result.id);
        if (result.met && !wasHeld) {
          newAwards.push({ id: result.id, name: result.name, day: d + 1, color: result.color, guestMult: result.reward.guestMult });
          repFromAwards += result.reward.reputation;
          ceremonyEntries.push({ day: d + 1, text: `Day ${d + 1}: 🏆 Won "${result.name}"! +${result.reward.reputation} reputation, +${Math.round((result.reward.guestMult - 1) * 100)}% visitors.` });
        } else if (!result.met && wasHeld) {
          ceremonyEntries.push({ day: d + 1, text: `Day ${d + 1}: 📉 Lost the "${result.name}" award — requirements no longer met.` });
        }
      }
      const stillHeld = (stateRef.current.awards || []).filter((a) => evaluation.results.find((r) => r.id === a.id && r.met));
      const updatedAwards = [...stillHeld, ...newAwards];
      setAwards(updatedAwards);
      setAwardCeremonyTimer(AWARD_CEREMONY_CYCLE);
      setAwardStats({
        totalWon: (stateRef.current.awardStats?.totalWon || 0) + newAwards.length,
        ceremoniesHeld: (stateRef.current.awardStats?.ceremoniesHeld || 0) + 1,
        currentGuestMult: totalAwardGuestMult(updatedAwards),
      });
      if (repFromAwards > 0) {
        setReputation((rv) => Math.min(100, rv + repFromAwards));
      }
      if (ceremonyEntries.length) {
        setLog((l) => [...ceremonyEntries, ...l].slice(0, 12));
      }
    } else {
      setAwardCeremonyTimer(ceremonyTimer - 1);
    }

    // --- Construction project progression ---
    const constructionResult = simulateConstruction({
      day: d + 1,
      projects: stateRef.current.constructionProjects,
      grid: prevGrid,
    });
    setConstructionProjects(constructionResult.updatedProjects);
    for (const action of constructionResult.completionActions) {
      if (action.type === "place") {
        setGrid((g) => { const ng = [...g]; ng[action.tileIndex] = action.itemId; return ng; });
        setPopularity((p) => { const n = [...p]; while (n.length <= action.tileIndex) n.push(0); n[action.tileIndex] = DEFAULT_POPULARITY; return n; });
        setPopularityTrend((t) => { const n = [...t]; while (n.length <= action.tileIndex) n.push(0); n[action.tileIndex] = NEW_RIDE_TREND_BOOST; return n; });
        setBuiltAttractionIds((ids) => ids.includes(action.itemId) ? ids : [...ids, action.itemId]);
      } else if (action.type === "expand") {
        setGrid((g) => [...g, ...Array(action.lots).fill(null)]);
        setParkZones((z) => [...z, ...Array(action.lots).fill(null)]);
        setUpgrades((u) => [...u, ...Array(action.lots).fill(0)]);
        setAttractionCondition((c) => [...c, ...Array(action.lots).fill(100)]);
        setPopularity((p) => [...p, ...Array(action.lots).fill(0)]);
        setPopularityTrend((t) => [...t, ...Array(action.lots).fill(0)]);
        setPrevPopularity((p) => [...p, ...Array(action.lots).fill(0)]);
        setWaterQuality((wq) => [...wq, ...Array(action.lots).fill(100)]);
        setExpansionsDone((e) => e + 1);
      } else if (action.type === "renovate") {
        setUpgrades((u) => { const n = [...u]; n[action.tileIndex] = MAX_UPGRADE; return n; });
        setAttractionCondition((c) => { const n = [...c]; n[action.tileIndex] = 100; return n; });
        setPopularity((p) => { const n = [...p]; n[action.tileIndex] = Math.min(100, (n[action.tileIndex] || 50) + 30); return n; });
        setPopularityTrend((t) => { const n = [...t]; n[action.tileIndex] = NEW_RIDE_TREND_BOOST; return n; });
        setIncidents((items) => items.filter((i) => i.tileIndex !== action.tileIndex));
      }
    }
    if (constructionResult.totalRepReward > 0) {
      setReputation((rv) => Math.min(100, rv + constructionResult.totalRepReward));
    }
    if (constructionResult.totalXpReward > 0) {
      setXp((x) => x + constructionResult.totalXpReward);
    }
    if (constructionResult.logEntries.length) {
      setLog((l) => [...constructionResult.logEntries, ...l].slice(0, 12));
    }

    // --- Daily Challenges: track progress & refresh ---
    {
      const challengeState = {
        dailyNet: net,
        dailyGuests: newGuests,
        avgMood: visitorStats?.avgMood || 0,
        reputation: Math.round(newReputation),
        noIncidents: (remaining.length + newIncidents.length) === 0 ? 1 : 0,
        buildToday: stateRef.current.builtToday || 0,
        upgradeToday: stateRef.current.upgradedToday || 0,
        staffTotal: Object.values(counts).reduce((s, n) => s + (n || 0), 0),
        cleanliness: Math.round(cleanliness * 100),
        safety: Math.round(safety * 100),
      };
      const currentChallenges = stateRef.current.dailyChallenges || [];
      const updatedChallenges = currentChallenges.map((c) => {
        if (c.claimed) return c;
        const complete = isChallengeComplete(c, challengeState);
        const progress = challengeState[c.type] ?? 0;
        return { ...c, progress, completed: complete || c.completed };
      });
      const newCounter = (stateRef.current.challengeDayCounter || 0) + 1;
      if (newCounter >= CHALLENGE_REFRESH_DAYS || updatedChallenges.length === 0) {
        setDailyChallenges(rollDailyChallenges());
        setChallengeDayCounter(0);
      } else {
        setDailyChallenges(updatedChallenges);
        setChallengeDayCounter(newCounter);
      }
      setBuiltToday(0);
      setUpgradedToday(0);
    }

    // --- Dynamic pricing AI: auto-adjust ticket price ---
    if (stateRef.current.autoPricing) {
      const repFactor = (newReputation - 50) / 50;
      const weatherFactor = dayWeather.id === "sunny" ? 0.1 : dayWeather.id === "rain" ? -0.15 : dayWeather.id === "storm" ? -0.25 : 0;
      const crowdFactor = totalCapacity > 0 ? Math.min(0.2, (newGuests / totalCapacity - 0.7) * 0.5) : 0;
      const idealPrice = Math.max(15, Math.min(60, Math.round(DEFAULT_TICKET_PRICE * (1 + repFactor * 0.3 + weatherFactor + crowdFactor))));
      if (Math.abs(idealPrice - stateRef.current.ticketPrice) >= 2) {
        setTicketPrice(idealPrice);
      }
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(advanceDay, 8000 / speed);
    return () => clearInterval(interval);
  }, [playing, speed, advanceDay]);

  const placeAttraction = useCallback(
    (index) => {
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
      setPopularity((p) => {
        const n = [...p];
        while (n.length <= index) n.push(0);
        n[index] = attr.category === "attraction" ? DEFAULT_POPULARITY : 0;
        return n;
      });
      setPopularityTrend((t) => {
        const n = [...t];
        while (n.length <= index) n.push(0);
        n[index] = attr.category === "attraction" ? NEW_RIDE_TREND_BOOST : 0;
        return n;
      });
      setPrevPopularity((p) => {
        const n = [...p];
        while (n.length <= index) n.push(0);
        n[index] = 0;
        return n;
      });
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
    },
    [selectedBuild, money, parkZones, sandbox, builtAttractionIds, day]
  );

  const paintZone = useCallback((index) => {
    if (!selectedZone) return;
    setParkZones((z) => {
      const nz = [...z];
      nz[index] = selectedZone;
      setParkAppeal(calculateParkAppeal({ grid, zones: nz, getItem: getParkItem }));
      return nz;
    });
  }, [selectedZone, grid]);

  const handleTileClick = useCallback(
    (index) => {
      if (selectedZone) {
        paintZone(index);
      } else if (grid[index]) {
        setSelectedTile(index);
      } else if (selectedBuild) {
        placeAttraction(index);
      }
    },
    [grid, selectedBuild, selectedZone, placeAttraction, paintZone]
  );

  const sellAttraction = useCallback((index) => {
    setGrid((g) => {
      if (!g[index]) return g;
      const attr = getParkItem(g[index]);
      setMoney((m) => m + Math.floor((attr?.cost || 0) * 0.5));
      setUpgrades((u) => {
        const nu = [...u];
        nu[index] = 0;
        return nu;
      });
      setIncidents((items) => items.filter((item) => item.tileIndex !== index));
      setAttractionCondition((conditions) => { const next = [...conditions]; next[index] = 100; return next; });
      setParkZones((zones) => {
        const next = [...zones];
        next[index] = null;
        return next;
      });
      setPopularity((p) => { const n = [...p]; if (n[index] != null) n[index] = 0; return n; });
      setPopularityTrend((t) => { const n = [...t]; if (n[index] != null) n[index] = 0; return n; });
      setPrevPopularity((p) => { const n = [...p]; if (n[index] != null) n[index] = 0; return n; });
      const ng = [...g];
      ng[index] = null;
      return ng;
    });
    setHotelGuests((guests) => guests.filter((g) => g.hotelTile !== index));
    trackEvent("attraction_sold", { id: grid[index] });
    setSelectedTile(null);
  }, []);

  const undoLastBuild = useCallback(() => {
    if (!lastBuildAction) return;
    const { index, id, cost } = lastBuildAction;
    setGrid((g) => {
      if (g[index] !== id) return g;
      const ng = [...g];
      ng[index] = null;
      return ng;
    });
    setMoney((m) => m + cost);
    setUpgrades((u) => { const nu = [...u]; nu[index] = 0; return nu; });
    setIncidents((items) => items.filter((item) => item.tileIndex !== index));
    setAttractionCondition((c) => { const next = [...c]; next[index] = 100; return next; });
    setParkZones((z) => { const next = [...z]; next[index] = null; return next; });
    setLastBuildAction(null);
    setSelectedTile(null);
    trackEvent("build_undone", { id });
  }, [lastBuildAction]);

  const upgradeAttraction = useCallback(
    (index) => {
      const id = grid[index];
      if (!id) return;
      const attr = getParkItem(id);
      if (!attr || attr.category === "environment") return;
      const level = upgrades[index] || 0;
      if (level >= MAX_UPGRADE) return;
      const cost = upgradeCost(attr.cost, level);
      if (!sandbox && money < cost) return;
      setUpgrades((u) => {
        const nu = [...u];
        nu[index] = level + 1;
        return nu;
      });
      if (!sandbox) setMoney((m) => m - cost);
      setTotalUpgrades((t) => t + 1);
      setXp((x) => x + 15);
      setUpgradedToday((u) => u + 1);
      sound.upgrade();
      trackEvent("attraction_upgraded", { id, level: level + 1, cost });
    },
    [grid, upgrades, money, sandbox]
  );

  const hireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: (s[type] || 0) + 1 }));
    sound.hire();
    trackEvent("staff_hired", { type });
  }, []);

  const fireStaff = useCallback((type) => {
    setStaff((s) => ({ ...s, [type]: Math.max(0, (s[type] || 0) - 1) }));
    trackEvent("staff_fired", { type });
  }, []);

  const assignStaff = useCallback((type, zone) => {
    setStaffAssignments((current) => ({ ...current, [type]: zone || "" }));
    trackEvent("staff_assigned", { type, zone: zone || "park-wide" });
  }, []);

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

  const expandPark = useCallback(() => {
    if (expansionsDone >= MAX_EXPANSIONS) return;
    if (level < expandLevelReq(expansionsDone)) return;
    const cost = expandCost(expansionsDone);
    if (!sandbox && money < cost) return;
    setGrid((g) => [...g, ...Array(EXPAND_ROW).fill(null)]);
    setParkZones((z) => [...z, ...Array(EXPAND_ROW).fill(null)]);
    setUpgrades((u) => [...u, ...Array(EXPAND_ROW).fill(0)]);
    setAttractionCondition((conditions) => [...conditions, ...Array(EXPAND_ROW).fill(100)]);
    setPopularity((p) => [...p, ...Array(EXPAND_ROW).fill(0)]);
    setPopularityTrend((t) => [...t, ...Array(EXPAND_ROW).fill(0)]);
    setPrevPopularity((p) => [...p, ...Array(EXPAND_ROW).fill(0)]);
    setWaterQuality((wq) => [...wq, ...Array(EXPAND_ROW).fill(100)]);
    if (!sandbox) setMoney((m) => m - cost);
    setExpansionsDone((e) => e + 1);
    sound.expand();
    trackEvent("park_expanded", { expansions: expansionsDone + 1, cost });
  }, [expansionsDone, level, money, sandbox]);

  const toggleSandbox = useCallback(() => {
    setSandbox((prev) => {
      const next = !prev;
      saveSettings({ sandbox: next });
      return next;
    });
  }, []);

  const launchCampaign = useCallback((id) => {
    const def = getCampaign(id);
    if (!def) return;
    if (!sandbox && money < def.cost) return;
    const eff = campaignEffectiveness(def, grid);
    setActiveCampaigns((prev) => [
      ...prev,
      { id: def.id, name: def.name, daysLeft: def.duration, duration: def.duration, guestBoost: def.guestBoost, repBoost: def.repBoost, effectiveBoost: def.guestBoost * eff, target: def.target, startedDay: day },
    ]);
    if (!sandbox) setMoney((m) => m - def.cost);
    trackEvent("campaign_launched", { id, cost: def.cost });
  }, [grid, sandbox, day, money]);

  const launchEvent = useCallback((id) => {
    const def = getEvent(id);
    if (!def) return;
    if (!isEventAvailable(def, day, level)) return;
    if ((activeEvents || []).some((e) => e.id === id)) return;
    if (!sandbox && money < def.cost) return;
    setActiveEvents((prev) => [
      ...prev,
      { id: def.id, name: def.name, daysLeft: def.duration, guestMult: def.guestMult, incomeMult: def.incomeMult, repDelta: def.repDelta, revenuePerDay: def.revenuePerDay || 0, category: def.category, startedDay: day },
    ]);
    if (!sandbox) setMoney((m) => m - def.cost);
    trackEvent("event_launched", { id, cost: def.cost });
  }, [activeEvents, day, level, money, sandbox]);

  const startProject = useCallback((projectId, targetTile = null) => {
    const def = PROJECT_TYPES.find((p) => p.id === projectId);
    if (!def) return;
    if ((constructionProjects || []).some((p) => p.projectId === projectId && p.status === "in_progress")) return;
    if (!sandbox && money < def.cost) return;
    let finalTargetTile = targetTile;
    if (def.category === "renovation" && finalTargetTile == null) {
      let lowestCond = 100;
      let lowestIdx = -1;
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
    setConstructionProjects((prev) => [...prev, {
      projectId,
      name: def.name,
      startedDay: day,
      progress: 0,
      status: "in_progress",
      targetTile: finalTargetTile,
    }]);
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

  const chooseBuild = useCallback((id) => {
    setSelectedBuild(id);
    setSelectedZone(null);
  }, []);

  const chooseZone = useCallback((zoneId) => {
    setSelectedZone((current) => (current === zoneId ? null : zoneId));
    setSelectedBuild(null);
    setSelectedTile(null);
  }, []);

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
    if (kind === "boost") {
      setMoney((m) => m + 250000);
      setXp((x) => x + 2500);
      setReputation(100);
    }
  }, []);

  const claimMission = useCallback(
    (id) => {
      const mission = MISSIONS.find((m) => m.id === id);
      if (!mission || claimedMissions.includes(id) || level < mission.level) return;
      const ms = {
        attractionCount: grid.filter((x) => x && getParkItem(x)?.category === "attraction").length,
        peakGuests,
        money,
        reputation,
        day,
        staffTotal: Object.values(staff).reduce((sum, n) => sum + (n || 0), 0),
        totalUpgrades,
        expansionsDone,
        maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
        parkAppeal: parkAppeal.score,
        themedZones: (parkAppeal.zones || []).filter((z) => z.quality >= 60).length,
        avgMood: visitorStats?.avgMood || 0,
        lifetimeEarnings,
      };
      if (missionProgress(mission, ms) < mission.target) return;
      setMoney((m) => m + mission.reward.money);
      setXp((x) => x + mission.reward.xp);
      setClaimedMissions((c) => [...c, id]);
      sound.mission();
      trackEvent("mission_claimed", { id, money: mission.reward.money, xp: mission.reward.xp });
    },
    [claimedMissions, level, grid, upgrades, peakGuests, money, reputation, day, staff, totalUpgrades, expansionsDone, parkAppeal, visitorStats, lifetimeEarnings]
  );

  const refurbishRide = useCallback(
    (tileIndex) => {
      const itemId = grid[tileIndex];
      if (!itemId) return;
      const def = getParkItem(itemId);
      if (!def || def.category !== "attraction") return;
      const age = rideAges[tileIndex] || 0;
      if (age < 20) return;
      const cost = refurbishCost(def.cost || 5000, age);
      if (money < cost) return;
      setMoney((m) => m - cost);
      setRideAges((ra) => {
        const next = { ...ra };
        delete next[tileIndex];
        return next;
      });
      setLog((l) => [{ day, text: `Day ${day}: 🔧 Refurbished ${def.name} for $${cost.toLocaleString()}.` }, ...l].slice(0, 12));
      trackEvent("ride_refurbished", { item: itemId, cost });
    },
    [grid, rideAges, money, day]
  );

  const claimLegendary = useCallback(
    (objectiveId) => {
      if (claimedLegendary.includes(objectiveId)) return;
      const district = DISTRICTS.find((d) => d.legendary && d.legendary.id === objectiveId);
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
    },
    [claimedLegendary, grid, parkZones, day]
  );

  const savePark = useCallback(
    (name) => {
      const trimmed = (name || "").trim();
      if (!trimmed) return false;
      const slots = readSlots();
      slots[trimmed] = {
        money,
        day,
        reputation,
        guests,
        grid,
        parkZones,
        history,
        staff,
        staffAssignments,
        attractionCondition,
        log,
        lastNet,
        incidents,
        upgrades,
        xp,
        expansionsDone,
        peakGuests,
        totalUpgrades,
        claimedMissions,
        challenge,
        lifetimeEarnings,
        builtAttractionIds,
        visitorStats,
        feedback,
        weather,
        forecast,
        seasonEvent,
        ticketPrice,
        adBudget,
        priorityPass,
        researchPoints,
        completedResearch,
        parkAppeal,
        disaster,
        disastersSurvived,
        activeCampaigns,
        hotelGuests,
        hotelStats,
        resortRating,
        pricing,
        popularity,
        popularityTrend,
        prevPopularity,
        activeEvents,
        membershipCounts,
        membershipTimers,
        membershipStats,
        awards,
        awardCeremonyTimer,
        awardStats,
        socialPosts,
        socialReputation,
        emergencies,
        emergencyStats,
        constructionProjects,
        loans,
        returnVisitorMult,
        empirePoints,
        competitors,
        marketShare,
        waterQuality,
        rideAges,
        vipHistory,
        claimedLegendary,
        activeCalendarEvent,
        dailyChallenges,
        challengeDayCounter,
        autoPricing,
        activeTheme,
        prestigeCount,
        synergyBonuses,
        mascot,
        lastRewardDay,
        rewardStreak,
        visitorReviews,
        staffXp,
        savedAt: new Date().toISOString(),
      };
      writeSlots(slots);
      setSaves(Object.entries(slots).map(([n, s]) => slotMeta(n, s)));
      trackEvent("park_saved", { name: trimmed });
      return true;
    },
    [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, log, lastNet, incidents, attractionCondition, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents, membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer, awardStats, socialPosts, socialReputation, emergencies, emergencyStats, constructionProjects, loans, returnVisitorMult, empirePoints, competitors, marketShare, waterQuality, rideAges, vipHistory, claimedLegendary, activeCalendarEvent, dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses, mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp]
  );

  const saveToCloud = useCallback(
    async (name) => {
      const trimmed = (name || "").trim();
      if (!trimmed) return false;
      const gameData = {
        money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments,
        attractionCondition, log, lastNet, incidents, upgrades, xp, expansionsDone,
        peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings,
        builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent,
        ticketPrice, adBudget, priorityPass, researchPoints, completedResearch,
        parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats,
        resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents,
        membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer,
        awardStats, socialPosts, socialReputation, emergencies, emergencyStats,
        constructionProjects, loans, returnVisitorMult, empirePoints, competitors,
        marketShare, waterQuality, rideAges, vipHistory, claimedLegendary, activeCalendarEvent,
        dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses,
        mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp,
      };
      try {
        await base44.functions.invoke("cloudSaves", {
          action: "save", name: trimmed, gameData, day, money, reputation, guests,
        });
        trackEvent("park_saved_cloud", { name: trimmed });
        return true;
      } catch (e) {
        return false;
      }
    },
    [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, log, lastNet, incidents, attractionCondition, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, vipVisit, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents, membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer, awardStats, socialPosts, socialReputation, emergencies, emergencyStats, constructionProjects, loans, returnVisitorMult, empirePoints, competitors, marketShare, waterQuality, rideAges, vipHistory, claimedLegendary, activeCalendarEvent, dailyChallenges, challengeDayCounter, autoPricing, activeTheme, prestigeCount, synergyBonuses, mascot, lastRewardDay, rewardStreak, visitorReviews, staffXp]
  );

  const applyGameData = useCallback((data) => {
    setMoney(data.money ?? INITIAL_MONEY);
    setDay(data.day ?? 1);
    setReputation(data.reputation ?? 50);
    setGuests(data.guests ?? 0);
    setGrid(data.grid ?? makeStartingGrid());
    setParkZones(data.parkZones ?? makeEmptyZones((data.grid ?? makeStartingGrid()).length));
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
    setAttractionCondition(data.attractionCondition ?? Array((data.grid ?? makeStartingGrid()).length).fill(100));
    setUpgrades(data.upgrades ?? Array(GRID_SIZE).fill(0));
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
    setResearchPoints(data.researchPoints ?? 0);
    setCompletedResearch(data.completedResearch ?? []);
    setParkAppeal(data.parkAppeal ?? calculateParkAppeal({ grid: data.grid ?? makeStartingGrid(), zones: data.parkZones ?? [], getItem: getParkItem }));
    if (data.disaster) setDisaster(data.disaster);
    if (data.disastersSurvived != null) setDisastersSurvived(data.disastersSurvived);
    if (data.activeCampaigns) setActiveCampaigns(data.activeCampaigns);
    if (data.hotelGuests) setHotelGuests(data.hotelGuests);
    if (data.hotelStats) setHotelStats(data.hotelStats);
    if (data.resortRating != null) setResortRating(data.resortRating);
    if (data.pricing) setPricing({ ...DEFAULT_PRICING, ...data.pricing });
    if (data.popularity) setPopularity(data.popularity);
    if (data.popularityTrend) setPopularityTrend(data.popularityTrend);
    if (data.prevPopularity) setPrevPopularity(data.prevPopularity);
    if (data.activeEvents) setActiveEvents(data.activeEvents);
    if (data.membershipCounts) setMembershipCounts(data.membershipCounts);
    if (data.membershipTimers) setMembershipTimers(data.membershipTimers);
    if (data.membershipStats) setMembershipStats(data.membershipStats);
    if (data.awards) setAwards(data.awards);
    if (data.awardCeremonyTimer != null) setAwardCeremonyTimer(data.awardCeremonyTimer);
    if (data.awardStats) setAwardStats(data.awardStats);
    if (data.socialPosts) setSocialPosts(data.socialPosts);
    if (data.socialReputation != null) setSocialReputation(data.socialReputation);
    if (data.emergencies) setEmergencies(data.emergencies);
    if (data.emergencyStats) setEmergencyStats(data.emergencyStats);
    if (data.constructionProjects) setConstructionProjects(data.constructionProjects);
    if (data.loans) setLoans(data.loans);
    if (data.returnVisitorMult != null) setReturnVisitorMult(data.returnVisitorMult);
    if (data.empirePoints != null) setEmpirePoints(data.empirePoints);
    if (data.competitors) setCompetitors(data.competitors);
    if (data.marketShare != null) setMarketShare(data.marketShare);
    if (data.waterQuality) setWaterQuality(data.waterQuality);
    if (data.rideAges) setRideAges(data.rideAges);
    if (data.vipHistory) setVipHistory(data.vipHistory);
    if (data.claimedLegendary) setClaimedLegendary(data.claimedLegendary);
    if (data.activeCalendarEvent) setActiveCalendarEvent(data.activeCalendarEvent);
    if (data.dailyChallenges) setDailyChallenges(data.dailyChallenges);
    if (data.challengeDayCounter != null) setChallengeDayCounter(data.challengeDayCounter);
    if (data.autoPricing != null) setAutoPricing(data.autoPricing);
    if (data.activeTheme) setActiveTheme(data.activeTheme);
    if (data.prestigeCount != null) setPrestigeCount(data.prestigeCount);
    if (data.synergyBonuses) setSynergyBonuses(data.synergyBonuses);
    if (data.mascot !== undefined) setMascot(data.mascot);
    if (data.lastRewardDay !== undefined) setLastRewardDay(data.lastRewardDay);
    if (data.rewardStreak !== undefined) setRewardStreak(data.rewardStreak);
    if (data.visitorReviews) setVisitorReviews(data.visitorReviews);
    if (data.staffXp) setStaffXp(data.staffXp);
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
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
    trackEvent("park_loaded", { name });
  }, [applyGameData]);

  const loadFromCloud = useCallback((data) => {
    applyGameData(data);
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
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
      await base44.functions.invoke("sendGameAlert", {
        alertType, title, message,
        emailAlerts: settings.emailAlerts !== false,
        pushAlerts: settings.pushAlerts !== false,
      });
    } catch (e) { /* ignore — alerts are non-critical */ }
  }, []);

  const prevLevelRef = useRef(level);
  useEffect(() => {
    if (level > prevLevelRef.current) {
      sendGameAlert("level_up", `Level ${level} Reached!`, `Your water park has reached level ${level}. New attractions and expansions may now be available.`);
    }
    prevLevelRef.current = level;
  }, [level, sendGameAlert]);

  const submitLeaderboard = useCallback(async (playerName, parkName) => {
    try {
      await base44.functions.invoke("leaderboard", {
        action: "submit",
        playerName, parkName,
        level, day, reputation, guests, money,
        empirePoints, resortRating, peakGuests,
      });
      trackEvent("leaderboard_submitted", { level, day });
      return true;
    } catch (e) {
      return false;
    }
  }, [level, day, reputation, guests, money, empirePoints, resortRating, peakGuests]);

  const sharePark = useCallback(async (parkName, playerName) => {
    const gameData = {
      money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments,
      attractionCondition, log, lastNet, incidents, upgrades, xp, expansionsDone,
      peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings,
      builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent,
      ticketPrice, adBudget, priorityPass, researchPoints, completedResearch,
      parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats,
      resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents,
      membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer,
      awardStats, socialPosts, socialReputation, emergencies, emergencyStats,
      constructionProjects, loans, returnVisitorMult, empirePoints, competitors,
      marketShare, waterQuality, visitorReviews, staffXp,
    };
    try {
      const res = await base44.functions.invoke("sharePark", {
        action: "share", parkName, playerName, gameData,
        day, reputation, guests, level,
      });
      trackEvent("park_shared", { day, level });
      return res.data?.shareCode || null;
    } catch (e) {
      return null;
    }
  }, [money, day, reputation, guests, grid, parkZones, history, staff, staffAssignments, log, lastNet, incidents, upgrades, xp, expansionsDone, peakGuests, totalUpgrades, claimedMissions, challenge, lifetimeEarnings, builtAttractionIds, visitorStats, feedback, weather, forecast, seasonEvent, ticketPrice, adBudget, priorityPass, researchPoints, completedResearch, parkAppeal, disaster, disastersSurvived, activeCampaigns, hotelGuests, hotelStats, resortRating, pricing, popularity, popularityTrend, prevPopularity, activeEvents, membershipCounts, membershipTimers, membershipStats, awards, awardCeremonyTimer, awardStats, socialPosts, socialReputation, emergencies, emergencyStats, constructionProjects, loans, returnVisitorMult, empirePoints, competitors, marketShare, waterQuality, level, visitorReviews, staffXp]);

  const viewSharedPark = useCallback(async (shareCode) => {
    try {
      const res = await base44.functions.invoke("sharePark", { action: "view", shareCode });
      if (res.data?.ok && res.data?.park) return res.data.park;
      return null;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.detail) applyGameData(e.detail); };
    window.addEventListener("load-shared-park", handler);
    return () => window.removeEventListener("load-shared-park", handler);
  }, [applyGameData]);

  const claimDailyChallenge = useCallback((challengeId) => {
    const challenge = (stateRef.current.dailyChallenges || []).find((c) => c.id === challengeId);
    if (!challenge || challenge.claimed || !challenge.completed) return;
    setMoney((m) => m + challenge.reward.money);
    setXp((x) => x + challenge.reward.xp);
    setDailyChallenges((prev) => prev.map((c) => c.id === challengeId ? { ...c, claimed: true } : c));
    sound.mission();
    trackEvent("daily_challenge_claimed", { id: challenge.baseId });
  }, []);

  const toggleAutoPricing = useCallback(() => {
    setAutoPricing((prev) => !prev);
  }, []);

  const selectMascot = useCallback((mascotId) => {
    setMascot(mascotId);
    trackEvent("mascot_selected", { mascot: mascotId });
  }, []);

  const claimDailyReward = useCallback((reward) => {
    const currentDay = stateRef.current.day;
    const lastDay = stateRef.current.lastRewardDay;
    if (!canClaimReward(lastDay, currentDay)) return;
    const newStreak = (lastDay != null && currentDay === lastDay + 1) ? (stateRef.current.rewardStreak || 0) + 1 : 1;
    if (reward.id === "cash_small" || reward.id === "cash_big" || (reward.id === "mystery" && reward.mysteryContent?.id?.startsWith("cash"))) {
      setMoney((m) => m + reward.amount);
    } else if (reward.id === "xp" || (reward.id === "mystery" && reward.mysteryContent?.id === "xp")) {
      setXp((x) => x + reward.amount);
    } else if (reward.id === "rep" || (reward.id === "mystery" && reward.mysteryContent?.id === "rep")) {
      setReputation((r) => Math.min(100, r + reward.amount));
    } else if (reward.id === "research" || (reward.id === "mystery" && reward.mysteryContent?.id === "research")) {
      setResearchPoints((rp) => rp + reward.amount);
    }
    setLastRewardDay(currentDay);
    setRewardStreak(newStreak);
    sound.mission();
    trackEvent("daily_reward_claimed", { type: reward.id, amount: reward.amount, streak: newStreak });
  }, []);

  const selectTheme = useCallback((themeId) => {
    const theme = getVisualTheme(themeId);
    if (level < theme.unlockLevel) return;
    setActiveTheme(themeId);
    trackEvent("theme_selected", { theme: themeId });
  }, [level]);

  const prestigePark = useCallback(() => {
    if (level < PRESTIGE_LEVEL_REQ) return;
    const points = calculatePrestigePoints({ level, empirePoints, lifetimeEarnings });
    if (points <= 0) return;
    setPrestigeCount((p) => p + points);
    setXp(0);
    setDay(1);
    setReputation(50);
    setGuests(0);
    setGrid(makeStartingGrid());
    setParkZones(makeEmptyZones(GRID_SIZE));
    setUpgrades(Array(GRID_SIZE).fill(0));
    setAttractionCondition(Array(GRID_SIZE).fill(100));
    setIncidents([]);
    setStaff(DEFAULT_STAFF);
    setStaffAssignments({});
    setExpansionsDone(0);
    setPeakGuests(0);
    setBuiltAttractionIds([]);
    setMoney(INITIAL_MONEY);
    setPlaying(false);
    setDailyChallenges(rollDailyChallenges());
    setChallengeDayCounter(0);
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
    setDay(1);
    setReputation(park.reputation ?? 50);
    setGuests(0);
    setGrid(startGrid);
    setParkZones(startZones);
    setSelectedZone(null);
    setPlaying(false);
    setSelectedBuild(null);
    setSelectedTile(null);
    setLastNet(0);
    setWeather(WEATHER[0]);
    setForecast(WEATHER[1]);
    setSeasonEvent(null);
    setTicketPrice(park.ticketPrice ?? DEFAULT_TICKET_PRICE);
    setAdBudget(park.adBudget ?? DEFAULT_AD_BUDGET);
    setPriorityPass(false);
    setLog([{ day: 0, text: `Welcome to ${park.name}! ${park.description}` }]);
    setHistory([]);
    setStaff(DEFAULT_STAFF);
    setStaffAssignments({});
    setIncidents([]);
    setAttractionCondition(startCondition);
    setUpgrades(startUpgrades);
    setXp(park.xp || 0);
    setExpansionsDone(0);
    setPeakGuests(0);
    setTotalUpgrades(0);
    setClaimedMissions([]);
    setChallenge(null);
    setLifetimeEarnings(0);
    setBuiltAttractionIds(builtIds);
    setVisitorStats({ avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} });
    setFeedback([]);
    setResearchPoints(0);
    setCompletedResearch(starterResearch);
    setParkAppeal(calculateParkAppeal({ grid: startGrid, zones: startZones, getItem: getParkItem }));
    setDisaster(null);
    setDisastersSurvived(0);
    setActiveCampaigns([]);
    setActiveEvents([]);
    setMembershipCounts({ season_pass: 0, family_membership: 0, vip_membership: 0 });
    setMembershipTimers({ season_pass: 30, family_membership: 30, vip_membership: 30 });
    setMembershipStats({ totalMembers: 0, dailyRevenue: 0, totalRevenue: 0, memberVisits: 0, memberSpend: 0, totalRenewed: 0, totalChurned: 0 });
    setAwards([]);
    setAwardCeremonyTimer(AWARD_CEREMONY_CYCLE);
    setAwardStats({ totalWon: 0, ceremoniesHeld: 0, currentGuestMult: 1 });
    setSocialPosts([]);
    setSocialReputation(50);
    setEmergencies([]);
    setEmergencyStats({ totalEmergencies: 0, totalCost: 0, resolvedCount: 0 });
    setConstructionProjects([]);
    setLoans([]);
    setReturnVisitorMult(1.0);
    setEmpirePoints(0);
    setCompetitors(createCompetitors(1));
    setMarketShare(100);
    setWaterQuality(createInitialWaterQuality(startGrid.length));
    setRideAges(initRideAges(startGrid.length));
    setVipVisit(null);
    setVipHistory([]);
    setClaimedLegendary([]);
    setActiveCalendarEvent(null);
    setDailyChallenges(rollDailyChallenges());
    setChallengeDayCounter(0);
    setAutoPricing(false);
    setActiveTheme("tropical");
    setSynergyBonuses({ totalIncomeMult: 0, totalAppealBonus: 0, activeSynergies: [] });
    setBuiltToday(0);
    setUpgradedToday(0);
    setHotelGuests([]);
    setHotelStats({ roomRevenue: 0, hotelExpenses: 0, parkSpend: 0, occupancy: 0, avgHappiness: 0, totalGuests: 0, totalRooms: 0, guestsByHotel: {} });
    setResortRating(0);
    setPricing(DEFAULT_PRICING);
    setMascot(null);
    setLastRewardDay(null);
    setRewardStreak(0);
    setVisitorReviews([]);
    setStaffXp({});
    const startPopularity = Array(startGrid.length).fill(0);
    const startPopTrend = Array(startGrid.length).fill(0);
    for (let i = 0; i < startGrid.length; i += 1) {
      const item = startGrid[i] ? getParkItem(startGrid[i]) : null;
      if (item && item.category === "attraction") {
        startPopularity[i] = DEFAULT_POPULARITY;
        startPopTrend[i] = NEW_RIDE_TREND_BOOST * 0.5;
      }
    }
    setPopularity(startPopularity);
    setPopularityTrend(startPopTrend);
    setPrevPopularity(Array(startGrid.length).fill(0));
    trackEvent("park_reset", { starterPark: park.id, level: park.level, money: baseMoney });
  }, []);

  return {
    money,
    day,
    reputation,
    guests,
    grid,
    playing,
    speed,
    weather,
    forecast,
    season: getSeason(day),
    seasonEvent,
    ticketPrice,
    adBudget,
    priorityPass,
    parkZones,
    selectedZone,
    selectedBuild,
    selectedTile,
    lastNet,
    log,
    history,
    staff,
    staffAssignments,
    assignStaff,
    incidents,
    attractionCondition,
    upgrades,
    upgradeAttraction,
    level,
    xp,
    xpForNext: xpForLevel(level),
    applyCheat,
    expansionsDone,
    gridSize,
    maxGridSize: MAX_GRID_SIZE,
    expandPark,
    peakGuests,
    totalUpgrades,
    claimedMissions,
    claimMission,
    challenge,
    vipVisit,
    vipHistory,
    claimedLegendary,
    activeCalendarEvent,
    rideAges,
    refurbishRide,
    claimLegendary,
    lastBuildAction,
    undoLastBuild,
    lifetimeEarnings,
    visitorStats,
    feedback,
    researchPoints,
    completedResearch,
    parkAppeal,
    disaster,
    disastersSurvived,
    sandbox,
    toggleSandbox,
    activeCampaigns,
    launchCampaign,
    pricing,
    setPricing,
    popularity,
    popularityTrend,
    prevPopularity,
    activeEvents,
    launchEvent,
    membershipCounts,
    membershipTimers,
    membershipStats,
    membershipTiers: MEMBERSHIP_TIERS,
    awards,
    awardCeremonyTimer,
    awardStats,
    awardCategories: AWARD_CATEGORIES,
    socialPosts,
    socialReputation,
    emergencies,
    emergencyStats,
    emergencyTypes: EMERGENCY_TYPES,
    constructionProjects,
    startProject,
    projectTypes: PROJECT_TYPES,
    loans,
    takeLoan,
    repayLoan,
    loanTerms: LOAN_TERMS,
    returnVisitorMult,
    empirePoints,
    empireTier: getEmpireTier(empirePoints),
    resortBonuses: calculateResortBonuses(grid),
    competitors,
    marketShare,
    waterQuality,
    waterQualityAvg: (() => {
      const wq = waterQuality || [];
      let sum = 0, count = 0;
      for (let i = 0; i < grid.length; i++) {
        const id = grid[i];
        if (id && isWaterAttraction(id) && wq[i] != null) { sum += wq[i]; count++; }
      }
      return count > 0 ? Math.round(sum / count) : 100;
    })(),
    waterQualityCriticalCount: (() => {
      const wq = waterQuality || [];
      let count = 0;
      for (let i = 0; i < grid.length; i++) {
        const id = grid[i];
        if (id && isWaterAttraction(id) && wq[i] != null && wq[i] < 20) count++;
      }
      return count;
    })(),
    awardEvaluation: evaluateAwards({
      grid, upgrades, attractionCondition, staff, visitorStats,
      parkAppeal, reputation, incidents, hotelStats, membershipCounts,
      popularity, peakGuests, totalUpgrades, resortRating,
    }),
    hotels: grid.map((id, idx) => { const def = getHotelDef(id); return def ? { def, tileIndex: idx } : null; }).filter(Boolean),
    hotelGuests,
    hotelStats,
    resortRating,
    unlockResearch,
    builtCount: builtAttractionIds.length,
    achievementState: {
      peakGuests,
      lifetimeEarnings,
      builtCount: builtAttractionIds.length,
      builtAttractionIds,
      maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
      expansionsDone,
      day,
      money,
      reputation,
      staffTotal: Object.values(staff).reduce((s, n) => s + (n || 0), 0),
      facilityCount: grid.filter((id) => id && getParkItem(id)?.category === "facility").length,
      avgMood: visitorStats?.avgMood || 0,
      avgSpendPerVisit: visitorStats?.avgSpendPerVisit || 0,
      disastersSurvived,
      sandboxUsed: sandbox,
      empirePoints,
      resortRating,
      tilesFilled: grid.filter(Boolean).length,
      waterQualityAvg: (() => {
        const wq = waterQuality || [];
        let sum = 0, count = 0;
        for (let i = 0; i < grid.length; i++) {
          const id = grid[i];
          if (id && isWaterAttraction(id) && wq[i] != null) { sum += wq[i]; count++; }
        }
        return count > 0 ? Math.round(sum / count) : 100;
      })(),
    },
    missionState: {
      attractionCount: grid.filter((id) => id && getParkItem(id)?.category === "attraction").length,
      peakGuests,
      money,
      reputation,
      day,
      staffTotal: Object.values(staff).reduce((sum, n) => sum + (n || 0), 0),
      staffTypesHired: Object.values(staff).filter((n) => (n || 0) > 0).length,
      builtCount: (builtAttractionIds || []).length,
      builtAttractionIds: builtAttractionIds || [],
      totalUpgrades,
      expansionsDone,
      maxedUpgrades: upgrades.filter((lv) => lv >= MAX_UPGRADE).length,
      parkAppeal: parkAppeal.score,
      zonedTiles: (parkZones || []).filter(Boolean).length,
      themedZones: (parkAppeal.zones || []).filter((z) => z.quality >= 60).length,
      resortRating,
      tilesFilled: grid.filter(Boolean).length,
      lifetimeEarnings,
      avgMood: visitorStats?.avgMood || 0,
    },
    ...staffEffects(staff),
    staffWages: staffWages(staff),
    estimatedUtilities: Math.round((150 + grid.filter((id) => id && getParkItem(id)?.category === "attraction").length * 45 + grid.filter((id) => id && getParkItem(id)?.category === "facility").length * 18 + guests * 2.2) * (weather?.utilityMult ?? 1)),
    GRID_SIZE,
    setPlaying,
    setSpeed,
    setTicketPrice,
    setAdBudget,
    setPriorityPass,
    setSelectedBuild: chooseBuild,
    setSelectedZone: chooseZone,
    paintZone,
    setSelectedTile,
    handleTileClick,
    sellAttraction,
    advanceDay,
    resetGame,
    hireStaff,
    fireStaff,
    saves,
    savePark,
    saveToCloud,
    loadPark,
    deleteSave,
    loadFromCloud,
    submitLeaderboard,
    sharePark,
    viewSharedPark,
    dailyChallenges,
    claimDailyChallenge,
    challengeDaysLeft: CHALLENGE_REFRESH_DAYS - (challengeDayCounter % CHALLENGE_REFRESH_DAYS),
    autoPricing,
    toggleAutoPricing,
    activeTheme,
    selectTheme,
    prestigeCount,
    prestigePark,
    prestigeMultipliers: prestigeMultiplier(prestigeCount),
    synergyBonuses,
    mascot,
    mascotDef: getMascot(mascot),
    selectMascot,
    lastRewardDay,
    rewardStreak,
    canClaimDailyReward: canClaimReward(lastRewardDay, day),
    claimDailyReward,
    ecoBonuses: calculateEcoBonuses(grid),
    visitorReviews,
    staffXp,
    trainStaff,
  };
}