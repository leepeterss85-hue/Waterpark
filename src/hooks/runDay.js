// The daily park simulation tick, extracted from useGameState so the hook
// stays under the editor's line limit. Pure logic — no React hooks.
// Callers pass the state ref and a stable object of state setters.

import {
  getParkItem, STAFF, MAX_UPGRADE, staffWages, staffEffects, levelFromXp,
} from "@/data/gameData";
import { rollWeather, rollSeasonEvent } from "@/data/parkSystems";
import { rollChallenge } from "@/data/challenges";
import { RESEARCH, dailyResearchPoints } from "@/data/research";
import { simulateVisits, aggregatePriceReaction } from "@/data/visitorLogic";
import { generateFeedback } from "@/data/guestFeedback";
import { getSettings, getDifficulty } from "@/lib/settings";
import { rollDisaster, disasterMitigation } from "@/data/disasters";
import { getHotelDef, simulateHotelDay, calculateResortRating } from "@/data/hotels";
import { calculateParkAppeal } from "@/data/parkThemes";
import { DEFAULT_PRICING } from "@/data/pricing";
import { tickPopularity, DEFAULT_POPULARITY, NEW_RIDE_TREND_BOOST } from "@/data/popularity";
import { aggregateEventEffects } from "@/data/parkEvents";
import { simulateMemberships, totalMemberCount } from "@/data/memberships";
import { AWARD_CEREMONY_CYCLE, evaluateAwards, totalAwardGuestMult } from "@/data/awards";
import { generateSocialPosts, computeSocialReputation, socialDemandMult, socialPriceTolerance } from "@/data/socialMedia";
import { simulateEmergencies } from "@/data/emergencies";
import { getConstructionDisruption, simulateConstruction } from "@/data/construction";
import { simulateLoans } from "@/data/loans";
import { getEmpireTier, calculateResortBonuses, calculateEmpirePoints } from "@/data/empire";
import { createCompetitors, simulateCompetitors } from "@/data/competitors";
import { tickStrikes, strikeDemandBoost, applyStrikesToRivals } from "@/data/marketWarfare";
import { simulateWaterQuality } from "@/data/waterQuality";
import { DISTRICTS, aggregateDistrictBonuses } from "@/data/districts";
import { rollVipVisit, evaluateVipVisit, generateVipSocialPost } from "@/data/vipGuests";
import { getTriggeredCalendarEvent } from "@/data/seasonalCalendar";
import { initRideAges, tickRideAges, aggregateAgingUpkeepMult, aggregateAgingAppealMult } from "@/data/rideAging";
import { rollDailyChallenges, isChallengeComplete, CHALLENGE_REFRESH_DAYS } from "@/data/dailyChallenges";
import { calculateSynergies } from "@/data/synergies";
import { prestigeMultiplier } from "@/data/prestige";
import { calculateEcoBonuses } from "@/data/ecoItems";
import { getMascot } from "@/data/mascots";
import { generateVisitorReviews, reviewReputationImpact } from "@/data/visitorReviews";
import { dailyStaffXp, trainingEffectMult } from "@/data/staffTraining";
import { DEFAULT_MORALE, tickMorale, moraleEffectMult, moraleIncidentMult } from "@/data/staffMorale";
import { activeSponsorIncome, activeSponsorAppealCost, tickSponsors } from "@/data/sponsorships";
import { rollGroupBooking } from "@/data/groupBookings";
import { getMasterPlanMetrics, getCompletedMasterPlans, calculateMasterPlanBonuses } from "@/data/masterPlans";
import { sound } from "@/lib/soundManager";
import { simulateFoodRetail, buildGuestMemory } from "@/data/livingPark";
import { evaluateChains } from "@/data/attractionChains";
import { evaluateCampaigns } from "@/data/campaignChapters";
import { empireBonuses } from "@/data/parkEmpire";

const MILESTONE_DAYS = [25, 50, 75, 100, 150, 200];
const MILESTONE_REWARDS = { 25: 25000, 50: 75000, 75: 150000, 100: 500000, 150: 750000, 200: 1000000 };
const DEFAULT_TICKET_PRICE = 28;

export function runDay(stateRef, setters) {
  const {
    setMoney, setDay, setReputation, setGuests, setGrid, setParkZones, setUpgrades,
    setAttractionCondition, setPopularity, setPopularityTrend, setPrevPopularity,
    setWaterQuality, setRideAges, setWeather, setForecast, setSeasonEvent, setIncidents,
    setParkAppeal, setSynergyBonuses, setHotelGuests, setResortRating, setHotelStats,
    setMembershipCounts, setMembershipTimers, setMembershipStats, setEmergencies,
    setEmergencyStats, setSocialPosts, setSocialReputation, setLoans, setReturnVisitorMult,
    setEmpirePoints, setCompetitors, setMarketShare, setVisitorStats, setFeedback,
    setLifetimeEarnings, setVisitorReviews, setStaffXp, setStaffMorale, setAcceptedBookings,
    setGroupBookings, setSponsorships, setActiveCalendarEvent, setChallenge, setVipVisit,
    setVipHistory, setActiveCampaigns, setActiveEvents, setDisaster, setDisastersSurvived,
    setAwards, setAwardCeremonyTimer, setAwardStats, setConstructionProjects,
    setExpansionsDone, setBuiltAttractionIds, setDailyChallenges, setChallengeDayCounter,
    setBuiltToday, setUpgradedToday, setTicketPrice, setLog, setLastNet, setHistory, setPeakGuests,
    setResearchPoints, setXp, setCompletedMasterPlans, setMasterPlanBonuses, setActiveStrikes,
    setGuestMemory, setRetailStock, setRetailStats, setCompletedChains, setCompletedCampaignChapters,
  } = setters;

  const { grid: prevGrid, reputation: rep, day: d, staff: currentStaff, staffAssignments: currentAssignments, incidents: currentIncidents, upgrades: currentUpgrades, attractionCondition: currentCondition, challenge: currentChallenge, parkZones: currentZones, forecast: currentForecast, seasonEvent: currentSeasonEvent, parkAppeal: currentParkAppeal, ticketPrice: currentTicketPrice, adBudget: currentAdBudget, priorityPass: currentPriorityPass, vipVisit: currentVipVisit, completedResearch: currentResearch } = stateRef.current;
  const hasResearch = (id) => (currentResearch || []).includes(id);
  const masterPlanContext = getMasterPlanMetrics({
    grid: prevGrid, money: stateRef.current.money || 0, reputation: rep,
    peakGuests: stateRef.current.peakGuests || 0, totalUpgrades: stateRef.current.totalUpgrades || 0,
    resortRating: stateRef.current.resortRating || 0, appeal: currentParkAppeal?.score || 50, day: d,
  });
  const eligibleMasterPlans = getCompletedMasterPlans(masterPlanContext);
  const priorMasterPlans = stateRef.current.completedMasterPlans || [];
  const newlyCompletedPlans = eligibleMasterPlans.filter((id) => !priorMasterPlans.includes(id));
  const nextMasterPlans = [...new Set([...priorMasterPlans, ...eligibleMasterPlans])];
  const activeMasterPlanBonuses = calculateMasterPlanBonuses(nextMasterPlans);
  if (newlyCompletedPlans.length > 0) {
    setCompletedMasterPlans(nextMasterPlans);
    setMasterPlanBonuses(activeMasterPlanBonuses);
    setLog((l) => [{ day: d, text: "Day " + d + ": 🏆 Master plan completed: " + newlyCompletedPlans.join(", ") + ". Permanent park bonus unlocked!" }, ...l].slice(0, 12));
  }
  const upkeepResearchMult = hasResearch("efficiency") ? 0.85 : 1;
  const masterGuestMult = 1 + (activeMasterPlanBonuses.guestDemandMult || 0);
  const masterIncomeMult = 1 + (activeMasterPlanBonuses.incomeMult || 0) + (activeMasterPlanBonuses.attractionIncomeMult || 0);
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
  // Aggregate downside effects from active events (ride wear, incident risk, etc.)
  const eventDownsides = { rideWearMult: 1, incidentRiskMult: 1, utilityCostMult: 1, familyGuestMult: 1, repPenalty: 0, nonVipMoodPenalty: 0, closedFacilities: new Set() };
  for (const ev of currentActiveEvents) {
    const ds = ev.downside;
    if (!ds) continue;
    if (ds.rideWearMult) eventDownsides.rideWearMult *= ds.rideWearMult;
    if (ds.incidentRiskMult) eventDownsides.incidentRiskMult *= ds.incidentRiskMult;
    if (ds.utilityCostMult) eventDownsides.utilityCostMult *= ds.utilityCostMult;
    if (ds.familyGuestMult) eventDownsides.familyGuestMult *= ds.familyGuestMult;
    if (ds.repPenalty) eventDownsides.repPenalty += ds.repPenalty;
    if (ds.nonVipMoodPenalty) eventDownsides.nonVipMoodPenalty += ds.nonVipMoodPenalty;
    if (ds.closesFacility) eventDownsides.closedFacilities.add(ds.closesFacility);
  }
  if (currentActiveEvents.length > 0) {
    const eventFx = aggregateEventEffects(currentActiveEvents);
    eff.guestMult = (eff.guestMult ?? 1) * eventFx.guestMult * eventDownsides.familyGuestMult;
    eff.incomeMult = (eff.incomeMult ?? 1) * eventFx.incomeMult;
    eff.repDelta = (eff.repDelta ?? 0) + eventFx.repDelta - eventDownsides.repPenalty;
  }
  const constructionDisruption = getConstructionDisruption(stateRef.current.constructionProjects);
  eff.guestMult = (eff.guestMult ?? 1) * constructionDisruption.guestMult;
  eff.repDelta = (eff.repDelta ?? 0) + constructionDisruption.repPerDay;
  const activeDistrictIds = [...new Set((currentZones || []).filter((z) => z && DISTRICTS.some((dd) => dd.id === z)))];
  const districtBonuses = aggregateDistrictBonuses(activeDistrictIds, prevGrid, currentZones);
  eff.guestMult = (eff.guestMult ?? 1) * districtBonuses.guestMult * masterGuestMult;
  eff.incomeMult = (eff.incomeMult ?? 1) * districtBonuses.incomeMult * masterIncomeMult;
  const synergies = calculateSynergies(prevGrid);
  setSynergyBonuses(synergies);
  eff.incomeMult = (eff.incomeMult ?? 1) * (1 + synergies.totalIncomeMult);
  const pMult = prestigeMultiplier(stateRef.current.prestigeCount || 0);
  eff.incomeMult = (eff.incomeMult ?? 1) * pMult.incomeMult;
  eff.guestMult = (eff.guestMult ?? 1) * pMult.demandMult;
  const empireExpansion = empireBonuses(stateRef.current.acquiredRivals || [], stateRef.current.franchiseMaps || []);
  eff.guestMult = (eff.guestMult ?? 1) * (1 + empireExpansion.guestMult);
  eff.incomeMult = (eff.incomeMult ?? 1) * (1 + empireExpansion.incomeMult);
  const currentStrikes = stateRef.current.activeStrikes || [];
  const strikeBoost = strikeDemandBoost(currentStrikes);
  eff.guestMult = (eff.guestMult ?? 1) * (1 + strikeBoost);
  const currentRideAges = stateRef.current.rideAges || initRideAges(prevGrid.length);
  const nextRideAges = tickRideAges(currentRideAges, prevGrid);
  const agingUpkeepMult = aggregateAgingUpkeepMult(currentRideAges, prevGrid);
  const agingAppealMult = aggregateAgingAppealMult(currentRideAges, prevGrid);
  const calculatedAppeal = calculateParkAppeal({ grid: prevGrid, zones: currentZones, getItem: getParkItem });
  calculatedAppeal.score = Math.round(calculatedAppeal.score * agingAppealMult);
  const currentSponsorships = stateRef.current.sponsorships || [];
  calculatedAppeal.score = Math.max(0, calculatedAppeal.score - activeSponsorAppealCost(currentSponsorships));
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
  const morale = stateRef.current.staffMorale ?? DEFAULT_MORALE;
  const moraleMult = moraleEffectMult(morale);
  const incidentMoraleMult = moraleIncidentMult(morale);
  const uptime = Math.min(1, fx.uptime * moraleMult);
  const safety = Math.min(1, fx.safety * moraleMult);
  const trashCanCount = environment.filter((p) => p.id === "trash_can").length;
  const cleanliness = Math.min(1, (fx.cleanliness + Math.min(0.15, trashCanCount * 0.02)) * moraleMult);
  const entertainment = fx.entertainment * moraleMult;
  const facilityBonus = fx.facilityBonus;
  const wages = staffWages(counts);

  const ecoBonuses = calculateEcoBonuses(prevGrid);
  const mascotDef = getMascot(stateRef.current.mascot);
  const mascotMoodBoost = mascotDef ? mascotDef.moodBoost : 0;
  const mascotIncomeMult = mascotDef ? (1 + mascotDef.incomeBoost) : 1;

  const empireTier = getEmpireTier(stateRef.current.empirePoints || 0);
  const resortBonuses = calculateResortBonuses(prevGrid);

  const remaining = [];
  const resolved = [];
  for (const inc of currentIncidents || []) {
    const zone = currentZones?.[inc.tileIndex] || "";
    const mechanicCount = (currentAssignments?.mechanic && currentAssignments.mechanic !== zone) ? 0 : (counts.mechanic || 0);
    const cleanerCount = (currentAssignments?.cleaner && currentAssignments.cleaner !== zone) ? 0 : (counts.cleaner || 0);
    const power = inc.type === "breakdown" ? Math.min(0.9, 0.3 + mechanicCount * 0.2) : Math.min(0.9, 0.35 + cleanerCount * 0.2);
    if (Math.random() < power) resolved.push(inc);
    else remaining.push(inc);
  }
  const incidentByTile = new Map(remaining.map((i) => [i.tileIndex, i]));
  const workingAttractions = attractions.filter((p) => incidentByTile.get(p.idx)?.type !== "breakdown" && !eventDownsides.closedFacilities.has(p.id));
  const totalCapacity = workingAttractions.reduce((s, p) => s + capOf(p), 0);

  let newGuests = 0;
  let income = 0;
  let newReputation = rep;
  let visitorStats = { avgMood: 0, avgSpendPerVisit: 0, totalVisits: 0, topAttraction: null, movements: {}, guestTypes: {} };
  let dayFeedback = [];
  let retailResult = { revenue: 0, restockCost: 0, nextStock: stateRef.current.retailStock || {}, unmetFood: 0, satisfactionBonus: 0, served: { food: 0, retail: 0, services: 0 }, stockHealth: { food: 100, retail: 100, services: 100 } };

  if (attractions.length > 0) {
    const demand = Math.floor(
      (rep / 100) * totalCapacity * 1.15 * (1 + d / 80) *
      (eff.guestMult ?? 1) * (dayWeather.guestMult ?? 1) * (currentSeasonEvent?.guestMult ?? 1) *
      (1 + currentAdBudget / 5000) * campaignGuestMult * (stateRef.current.awardGuestMult || 1) *
      socialDemandMult(stateRef.current.socialReputation) * appealDemandMult * (hasEntrance ? 1 : 0.9) *
      Math.min(1.25, aggregatePriceReaction(currentTicketPrice) * socialPriceTolerance(stateRef.current.socialReputation)) *
      (stateRef.current.returnVisitorMult || 1) * (1 + empireTier.bonuses.demand)
    );
    const safetyCoverage = Math.min(1, (effectiveStaff.lifeguard || 0) / Math.max(1, Math.ceil(attractions.length / 3)) + lifeguardStations * 0.12);
    const guestSafetyMult = safetyCoverage < 0.45 ? 0.88 : safetyCoverage < 0.7 ? 0.96 : 1;
    newGuests = Math.min(demand, Math.round(totalCapacity * guestSafetyMult));

    const currentPricing = stateRef.current.pricing || DEFAULT_PRICING;
    const sim = simulateVisits({
      demand: newGuests, placedItems: [...attractions, ...facilities],
      queuePaths: environment.filter((p) => p.id === "queue_path"), incidents: incidentByTile,
      uptime, safety, cleanliness, incomeMult: eff.incomeMult ?? 1, entertainment, facilityBonus,
      appealBonus: (calculatedAppeal.score - 50) * 0.025 + empireTier.bonuses.satisfaction * 10 + resortBonuses.moodBoost + (activeMasterPlanBonuses.satisfactionBonus || 0) * 10,
      pricing: currentPricing, weather: dayWeather, seasonEvent: currentSeasonEvent, popularity: stateRef.current.popularity,
    });
    income = sim.income;
    visitorStats = sim;
    if (mascotMoodBoost > 0 && visitorStats.avgMood != null) {
      visitorStats = { ...visitorStats, avgMood: Math.min(100, visitorStats.avgMood + mascotMoodBoost) };
    }
    // Accepted group bookings arrive today: guaranteed guests + mood drag.
    const currentAccepted = stateRef.current.acceptedBookings || [];
    if (currentAccepted.length > 0) {
      const groupSize = currentAccepted.reduce((s, b) => s + (b.size || 0), 0);
      const groupMood = currentAccepted.reduce((s, b) => s + (b.moodImpact || 0), 0);
      newGuests += groupSize;
      if (visitorStats.avgMood != null) visitorStats = { ...visitorStats, avgMood: Math.max(0, visitorStats.avgMood + groupMood) };
      setAcceptedBookings([]);
    }
    {
      const totalExp = (sim.guestExperience?.happy || 0) + (sim.guestExperience?.content || 0) + (sim.guestExperience?.unhappy || 0);
      const satRate = totalExp > 0 ? (sim.guestExperience?.happy || 0) / totalExp : 0;
      setReturnVisitorMult((prev) => Math.max(0.8, Math.min(1.3, prev * 0.7 + (0.9 + satRate * 0.4) * 0.3)));
    }
    if (currentDisaster?.effects?.repDelta) {
      visitorStats = { ...visitorStats, avgMood: Math.max(0, visitorStats.avgMood - Math.abs(currentDisaster.effects.repDelta) * 4) };
    }
    retailResult = simulateFoodRetail({
      grid: prevGrid, guests: newGuests, visitorStats: sim, weather: dayWeather,
      activeEvents: currentActiveEvents, stock: stateRef.current.retailStock || {},
      staff: counts, pricing: currentPricing,
    });
    setRetailStock(retailResult.nextStock);
    setRetailStats(retailResult);
    if (retailResult.unmetFood > 0) {
      visitorStats = { ...visitorStats, avgMood: Math.max(0, (visitorStats.avgMood || 50) - Math.min(6, Math.ceil(retailResult.unmetFood / Math.max(1, newGuests) * 100))) };
    } else if (retailResult.satisfactionBonus > 0) {
      visitorStats = { ...visitorStats, avgMood: Math.min(100, (visitorStats.avgMood || 50) + retailResult.satisfactionBonus) };
    }
    dayFeedback = generateFeedback(sim, { day: d + 1, weather: dayWeather, incidents: remaining, cleanliness, safety, entertainment });
    const signatureRides = attractions.filter((p) => ["water_coaster", "mega_slide_complex", "freefall_drop", "cliff_jump", "tornado_bowl", "aqua_loop"].includes(p.id));
    const bigMoment = signatureRides.find((p) => (visitorStats.movements?.[p.id] || 0) >= Math.max(10, p.attr.capacity * 0.08));
    if (bigMoment) dayFeedback = [{ day: d + 1, text: `🔥 MASSIVE SPLASH! ${bigMoment.attr.name} is the star of the park today.` }, ...dayFeedback];

    const avgMood = Math.max(0, sim.avgMood - eventDownsides.nonVipMoodPenalty);
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
    repDelta -= remaining.reduce((s, inc) => s + (inc.type === "breakdown" ? 1.2 : 0.6), 0);
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

  const nextCondition = Array(prevGrid.length).fill(100);
  for (const p of attractions) {
    let condition = Number.isFinite(currentCondition?.[p.idx]) ? currentCondition[p.idx] : 100;
    const activeIncident = incidentByTile.get(p.idx);
    const resolvedIncident = resolved.find((inc) => inc.tileIndex === p.idx);
    const loadPressure = Math.min(1.5, newGuests / Math.max(1, totalCapacity || capOf(p)));
    const wear = (1.2 + loadPressure * 2.4 + p.level * 0.25 + (dayWeather.id === "storm" ? 1.2 : 0)) * eventDownsides.rideWearMult;
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

  const incidentTiles = new Set(remaining.map((i) => i.tileIndex));
  const eligible = attractions.filter((p) => !incidentTiles.has(p.idx));
  const newIncidents = [];
  if (eligible.length > 0 && !isSandbox) {
    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    const condition = nextCondition[pick.idx] ?? 100;
    const breakChance = (Math.max(0, 0.11 - 0.018 * (counts.mechanic || 0) - 0.015 * (counts.security || 0) + (condition < 35 ? 0.16 : condition < 55 ? 0.06 : 0))) * incidentMoraleMult * eventDownsides.incidentRiskMult;
    const maintChance = (Math.max(0, 0.09 - 0.015 * (counts.cleaner || 0) - 0.015 * (counts.gardener || 0) + (condition < 60 ? 0.08 : 0))) * incidentMoraleMult * eventDownsides.incidentRiskMult;
    const r = Math.random();
    if (condition <= 10 || r < breakChance) newIncidents.push({ tileIndex: pick.idx, type: "breakdown", attractionId: pick.id, since: d + 1 });
    else if (condition <= 32 || r < breakChance + maintChance) newIncidents.push({ tileIndex: pick.idx, type: "maintenance", attractionId: pick.id, since: d + 1 });
  }
  setIncidents([...remaining, ...newIncidents]);
  if (currentDisaster?.id === "storm_damage") {
    for (const p of attractions) nextCondition[p.idx] = Math.max(0, nextCondition[p.idx] - 12);
  }
  setAttractionCondition(nextCondition);

  const hasWaterTreatment = prevGrid.some((id) => id === "water_treatment");
  const hasFiltration = hasResearch("filtration");
  const wqResult = simulateWaterQuality({
    grid: prevGrid, waterQuality: stateRef.current.waterQuality || Array(prevGrid.length).fill(100),
    guests: newGuests, staff: counts, weather: dayWeather, hasFiltration, hasWaterTreatment,
  });
  setWaterQuality(wqResult.nextQuality);
  if (wqResult.moodPenalty !== 0 && visitorStats) visitorStats = { ...visitorStats, avgMood: Math.max(0, (visitorStats.avgMood || 0) - wqResult.moodPenalty) };
  if (wqResult.reputationRisk > 0) newReputation = Math.max(0, newReputation - wqResult.reputationRisk);

  const newSocialPosts = generateSocialPosts({ day: d + 1, visitorStats, incidents: remaining, attractions, activeEvents: currentActiveEvents, popularity: stateRef.current.popularity });
  const viralRidePosts = newSocialPosts.filter((p) => p.viral && p.sentiment === "positive" && p.rideIdx != null);

  setPrevPopularity([...(stateRef.current.popularity || [])]);
  const popResult = tickPopularity({
    attractions, popularity: stateRef.current.popularity, trendBoost: stateRef.current.popularityTrend,
    movements: visitorStats?.movements || {}, totalVisits: visitorStats?.totalVisits || 0,
    condition: nextCondition, reputation: Math.round(newReputation), pricing: stateRef.current.pricing || DEFAULT_PRICING,
    guestTypes: visitorStats?.guestTypes || {}, weather: dayWeather,
  });
  const adjustedTrend = [...popResult.trendBoost];
  for (const post of viralRidePosts) {
    if (adjustedTrend[post.rideIdx] != null) adjustedTrend[post.rideIdx] = Math.min(100, (adjustedTrend[post.rideIdx] || 0) + 15);
  }
  setPopularity(popResult.popularity);
  setPopularityTrend(adjustedTrend);

  const updatedSocialPosts = [...newSocialPosts, ...(stateRef.current.socialPosts || [])].slice(0, 30);
  setSocialPosts(updatedSocialPosts);
  setSocialReputation(computeSocialReputation(updatedSocialPosts, stateRef.current.socialReputation));
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

  const placedHotels = prevGrid.map((id, idx) => { const def = getHotelDef(id); return def ? { def, tileIndex: idx } : null; }).filter(Boolean);
  let hotelResult = null;
  let newResortRating = stateRef.current.resortRating || 0;
  if (placedHotels.length > 0) {
    hotelResult = simulateHotelDay({
      hotels: placedHotels, hotelGuests: stateRef.current.hotelGuests || [], upgrades: currentUpgrades, day: d + 1,
      reputation: Math.round(newReputation), resortRating: stateRef.current.resortRating || 0, seasonEvent: currentSeasonEvent,
      weather: dayWeather, parkMood: visitorStats?.avgMood || 50, sandbox: isSandbox, hotelPriceMult: (stateRef.current.pricing || DEFAULT_PRICING).hotelPriceMult,
    });
    if (hotelResult.totalGuests > 0) {
      const hotelParkSim = simulateVisits({
        demand: hotelResult.totalGuests, placedItems: [...attractions, ...facilities],
        queuePaths: environment.filter((p) => p.id === "queue_path"), incidents: incidentByTile,
        uptime, safety, cleanliness, incomeMult: eff.incomeMult ?? 1, entertainment, facilityBonus,
        appealBonus: (calculatedAppeal.score - 50) * 0.025 + empireTier.bonuses.satisfaction * 10 + resortBonuses.moodBoost + districtBonuses.moodBoost,
        pricing: stateRef.current.pricing || DEFAULT_PRICING, weather: dayWeather, seasonEvent: currentSeasonEvent, popularity: stateRef.current.popularity,
      });
      hotelResult.parkSpend = hotelParkSim.income;
      if (hotelResult.avgHappiness > 0) hotelResult.avgHappiness = Math.round((hotelResult.avgHappiness + hotelParkSim.avgMood) / 2);
    }
    newResortRating = calculateResortRating(placedHotels, currentUpgrades);
    setHotelGuests(hotelResult.remainingGuests);
    setResortRating(newResortRating);
    const guestsByHotel = {};
    for (const h of placedHotels) guestsByHotel[h.tileIndex] = hotelResult.remainingGuests.filter((g) => g.hotelTile === h.tileIndex).length;
    setHotelStats({ roomRevenue: hotelResult.roomRevenue, hotelExpenses: hotelResult.hotelExpenses, parkSpend: hotelResult.parkSpend, occupancy: hotelResult.occupancy, avgHappiness: hotelResult.avgHappiness, totalGuests: hotelResult.totalGuests, totalRooms: hotelResult.totalRooms, guestsByHotel });
  }
  const hotelRoomRevenue = hotelResult?.roomRevenue || 0;
  const hotelParkSpend = hotelResult?.parkSpend || 0;
  const hotelExpensesAmount = hotelResult?.hotelExpenses || 0;

  const currentLevel = levelFromXp(stateRef.current.xp || 0);
  const membershipResult = simulateMemberships({
    counts: stateRef.current.membershipCounts || {}, daysUntilRenewal: stateRef.current.membershipTimers || {},
    reputation: Math.round(newReputation), parkAppealScore: calculatedAppeal.score, dayGuests: newGuests,
    level: currentLevel, weather: dayWeather, seasonEvent: currentSeasonEvent, activeEvents: currentActiveEvents,
  });
  setMembershipCounts(membershipResult.counts);
  setMembershipTimers(membershipResult.daysUntilRenewal);
  setMembershipStats((prev) => ({
    totalMembers: totalMemberCount(membershipResult.counts), dailyRevenue: membershipResult.totalRevenue,
    totalRevenue: (prev?.totalRevenue || 0) + membershipResult.totalRevenue, memberVisits: membershipResult.memberVisits,
    memberSpend: membershipResult.memberSpend, totalRenewed: (prev?.totalRenewed || 0) + membershipResult.totalRenewed,
    totalChurned: (prev?.totalChurned || 0) + membershipResult.totalChurned,
  }));

  const emergencyResult = simulateEmergencies({
    day: d + 1, emergencies: stateRef.current.emergencies, staff: counts, staffAssignments: currentAssignments,
    parkZones: currentZones, attractionCondition: nextCondition, weather: dayWeather, cleanliness, safety,
    guests: newGuests, attractions, sandbox: isSandbox,
  });
  setEmergencies(emergencyResult.allActive);
  if (emergencyResult.resolvedEmergencies.length > 0 || emergencyResult.newEmergencies.length > 0) {
    setEmergencyStats((prev) => ({
      totalEmergencies: (prev?.totalEmergencies || 0) + emergencyResult.newEmergencies.length,
      totalCost: (prev?.totalCost || 0) + emergencyResult.totalCost,
      resolvedCount: (prev?.resolvedCount || 0) + emergencyResult.resolvedEmergencies.length,
    }));
  }
  if (emergencyResult.repImpact !== 0) setReputation((rv) => Math.max(0, Math.min(100, rv - emergencyResult.repImpact)));
  if (emergencyResult.moodImpact !== 0) setVisitorStats((vs) => ({ ...vs, avgMood: Math.max(0, (vs?.avgMood || 0) + emergencyResult.moodImpact) }));
  if (emergencyResult.logEntries.length) setLog((l) => [...emergencyResult.logEntries, ...l].slice(0, 12));

  const loanResult = simulateLoans(stateRef.current.loans, d + 1);
  setLoans(loanResult.updatedLoans);
  if (loanResult.logEntries.length) setLog((l) => [...loanResult.logEntries, ...l].slice(0, 12));

  const ticketRevenue = newGuests * currentTicketPrice * ticketResearchMult;
  const conditionIncomeMult = workingAttractions.length ? workingAttractions.reduce((sum, p) => sum + (0.72 + (nextCondition[p.idx] || 0) * 0.0028), 0) / workingAttractions.length : 0;
  const rideIncome = income * conditionIncomeMult * (dayWeather.incomeMult ?? 1) * (currentSeasonEvent?.incomeMult ?? 1) * (currentPriorityPass ? 1.08 : 1) * (1 + empireTier.bonuses.income) * (1 + resortBonuses.spending) * mascotIncomeMult;
  const utilities = Math.round((150 + attractions.length * 45 + facilities.length * 18 + newGuests * 2.2) * (dayWeather.utilityMult ?? 1) * (1 - (ecoBonuses.utilityReduction || 0)));
  const diffUpkeepMult = getDifficulty(getSettings().difficulty).upkeepMult;
  const wageBoostMult = stateRef.current.wageBoost ? 1.2 : 1;
  const eventUtilityCost = utilities * eventDownsides.utilityCostMult;
  const expenses =
    (placedItems.filter((p) => p.attr.category !== "hotel").reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) * upkeepResearchMult * agingUpkeepMult +
    wages * (eff.wageMult ?? 1) * (1 - (fx.wageReduction || 0)) * wageBoostMult + eventUtilityCost + currentAdBudget + (currentPriorityPass ? 120 : 0) + retailRestockCost) * diffUpkeepMult +
    hotelExpensesAmount;
  const eventRevenuePerDay = currentActiveEvents.reduce((s, e) => s + (e.revenuePerDay || 0), 0);
  const retailRevenue = retailResult.revenue || 0;
  const retailRestockCost = retailResult.restockCost || 0;
  const emergencyCost = emergencyResult.totalCost;
  const sponsorIncome = activeSponsorIncome(currentSponsorships);
  const grossIncome = Math.round(ticketRevenue + rideIncome + hotelRoomRevenue + hotelParkSpend + retailRevenue + eventRevenuePerDay + membershipResult.totalRevenue + membershipResult.memberSpend + sponsorIncome);
  const upkeep = Math.round(placedItems.filter((p) => p.attr.category !== "hotel").reduce((s, p) => s + upkeepOf(p), 0) * (eff.upkeepMult ?? 1) * upkeepResearchMult);
  const wageCost = Math.round(wages * (eff.wageMult ?? 1) * (1 - (fx.wageReduction || 0)) * wageBoostMult);
  const marketingCost = currentAdBudget;
  const utilityCost = utilities;
  const premiumCost = currentPriorityPass ? 120 : 0;
  const net = isSandbox ? Math.round(grossIncome - emergencyCost - loanResult.loanPayment) : Math.round(grossIncome - expenses - emergencyCost - loanResult.loanPayment);

  const entries = [];
  for (const inc of newIncidents) {
    const a = getParkItem(inc.attractionId);
    entries.push({ day: d + 1, text: inc.type === "breakdown" ? `Day ${d + 1}: ⚠️ ${a.name} broke down! Hire mechanics to repair it.` : `Day ${d + 1}: 🔧 ${a.name} needs maintenance. Cleaners can speed it up.` });
  }
  for (const inc of resolved) {
    const a = getParkItem(inc.attractionId);
    entries.push({ day: d + 1, text: inc.type === "breakdown" ? `Day ${d + 1}: ✅ Mechanics repaired the ${a.name}!` : `Day ${d + 1}: ✅ Cleaners restored the ${a.name}.` });
  }
  entries.push({
    day: d + 1,
    text: attractions.length === 0 ? `Day ${d + 1}: No attractions yet — build something to draw guests!` : `Day ${d + 1}: ${newGuests} guests · income $${Math.round(income)} · upkeep $${expenses} · net ${net >= 0 ? "+" : ""}$${net}`,
  });
  if (hotelResult && placedHotels.length > 0) entries.push({ day: d + 1, text: `Day ${d + 1}: 🏨 Resort: ${hotelResult.totalGuests} guests · $${(hotelResult.roomRevenue + hotelResult.parkSpend).toLocaleString()} revenue · ${hotelResult.occupancy}% occupancy · ${hotelResult.avgHappiness}% happiness` });
  if (currentActiveEvents.length > 0) {
    const eventNames = currentActiveEvents.map((e) => e.name).join(", ");
    entries.push({ day: d + 1, text: eventRevenuePerDay > 0 ? `Day ${d + 1}: 🎉 Events active: ${eventNames} · +$${eventRevenuePerDay.toLocaleString()} event revenue` : `Day ${d + 1}: 🎉 Events active: ${eventNames}` });
  }
  if (membershipResult.totalRevenue > 0 || membershipResult.memberVisits > 0) entries.push({ day: d + 1, text: `Day ${d + 1}: 🎫 Members: ${totalMemberCount(membershipResult.counts)} active · ${membershipResult.memberVisits} visits · +$${membershipResult.totalRevenue.toLocaleString()} revenue` });
  if (sponsorIncome > 0) entries.push({ day: d + 1, text: `Day ${d + 1}: 🤝 Sponsors paid +$${sponsorIncome.toLocaleString()} (appeal -${activeSponsorAppealCost(currentSponsorships)}).` });

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
  if (newGuests >= 5) {
    const newReviews = generateVisitorReviews({ day: d + 1, guests: newGuests, avgMood: visitorStats?.avgMood || 50, attractions, facilities, incidents: remaining, popularity: stateRef.current.popularity, attractionCondition: nextCondition, cleanliness, safety, visitorStats, activeEvents: currentActiveEvents });
    if (newReviews.length) {
      setVisitorReviews((prev) => [...newReviews, ...prev].slice(0, 100));
      const repImpact = reviewReputationImpact(newReviews);
      if (repImpact !== 0) newReputation = Math.max(0, Math.min(100, newReputation + repImpact));
    }
  }
  {
    const xpGains = {};
    for (const role of Object.keys(STAFF)) {
      const gained = dailyStaffXp(counts[role] || 0);
      if (gained > 0) xpGains[role] = (currentStaffXp[role] || 0) + gained;
    }
    if (Object.keys(xpGains).length > 0) setStaffXp((prev) => ({ ...prev, ...xpGains }));
  }
  // Staff morale & fatigue tick
  {
    const staffTotal = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
    const nextMorale = tickMorale(morale, newGuests, staffTotal, stateRef.current.wageBoost);
    setStaffMorale(nextMorale);
    if (nextMorale < 25 && morale >= 25 && Math.random() < 0.18) {
      setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 😡 Staff morale is critical — workers are threatening to walk out! Pay a bonus or hire relief.` }, ...l].slice(0, 12));
    }
  }
  const epEarned = calculateEmpirePoints({ netIncome: Math.max(0, net), avgMood: visitorStats?.avgMood || 0, peakGuests: newGuests, resortRating: newResortRating });
  if (epEarned > 0) setEmpirePoints((ep) => ep + epEarned);
  setReputation(Math.round(newReputation));
  {
    const chainResult = evaluateChains(prevGrid, stateRef.current.completedChains || []);
    if (chainResult.newlyCompleted.length) {
      setCompletedChains(chainResult.completed);
      const rewardMoney = chainResult.newlyCompleted.reduce((s, c) => s + 25000 + Math.round((c.reward.incomeMult || 0) * 100000), 0);
      if (rewardMoney > 0) setMoney((m) => m + rewardMoney);
      if (chainResult.bonuses.mood) setVisitorStats((v) => ({ ...v, avgMood: Math.min(100, (v.avgMood || 0) + chainResult.bonuses.mood) }));
      setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 🏆 Attraction chain completed: ${chainResult.newlyCompleted.map((x) => x.name).join(", ")} — permanent destination bonus unlocked.` }, ...l].slice(0, 12));
    }
  }
  {
    const campaignResult = evaluateCampaigns(stateRef.current.completedCampaignChapters || [], levelFromXp(stateRef.current.xp || 0), {
      peakGuests: Math.max(stateRef.current.peakGuests || 0, newGuests),
      avgMood: visitorStats?.avgMood || 0,
      attractionCount: attractions.length,
      resortRating: newResortRating,
      marketShare: stateRef.current.marketShare || 0,
      appeal: calculatedAppeal.score,
    });
    if (campaignResult.newlyCompleted.length) {
      setCompletedCampaignChapters(campaignResult.completed);
      for (const chapter of campaignResult.newlyCompleted) {
        setMoney((m) => m + chapter.reward.money); setXp((x) => x + chapter.reward.xp);
        setReputation((rv) => Math.min(100, rv + chapter.reward.rep));
      }
      setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 📖 Campaign chapter complete: ${campaignResult.newlyCompleted.map((x) => x.name).join(", ")}!` }, ...l].slice(0, 12));
    }
  }

  const struckRivals = applyStrikesToRivals(stateRef.current.competitors || createCompetitors(d + 1), currentStrikes);
  const compResult = simulateCompetitors({
    competitors: struckRivals, playerReputation: Math.round(newReputation),
    playerAppeal: calculatedAppeal.score, playerGuests: newGuests, day: d + 1, playerLevel: levelFromXp(stateRef.current.xp || 0),
  });
  setCompetitors(compResult.updated);
  setMarketShare(compResult.marketShare);
  if (compResult.playerGuestLoss > 0) setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 🏊 Rivals stole ${compResult.playerGuestLoss} guests! Improve your park to win them back.` }, ...l].slice(0, 12));
  const nextStrikes = tickStrikes(currentStrikes);
  if (nextStrikes.length !== currentStrikes.length) {
    const expired = currentStrikes.filter((s) => !nextStrikes.some((n) => n.rivalId === s.rivalId));
    if (expired.length > 0) setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: ⚔️ Counter-strike against ${expired[0].rivalName} has ended. Their appeal is recovering.` }, ...l].slice(0, 12));
  }
  setActiveStrikes(nextStrikes);

  setLastNet(net);
  const staffTotal = Object.values(counts).reduce((s, n) => s + (n || 0), 0);
  const rpEarned = dailyResearchPoints(attractions.length, staffTotal);
  if (rpEarned > 0) setResearchPoints((rp) => rp + rpEarned);
  setHistory((h) => [...h, {
    day: d + 1, income: grossIncome, guests: newGuests, reputation: Math.round(newReputation), net,
    ticketRevenue: Math.round(ticketRevenue), rideIncome: Math.round(rideIncome), upkeep, wages: wageCost,
    utilities: utilityCost, marketing: marketingCost, premium: premiumCost, weather: dayWeather.name,
    event: currentSeasonEvent?.name || null, parkAppeal: calculatedAppeal.score,
    hotelRevenue: hotelRoomRevenue + hotelParkSpend, hotelExpenses: hotelExpensesAmount, eventRevenue: eventRevenuePerDay, retailRevenue, retailRestockCost,
    membershipRevenue: membershipResult.totalRevenue, memberSpend: membershipResult.memberSpend,
    memberVisits: membershipResult.memberVisits, emergencyCost, loanPayment: loanResult.loanPayment, sponsorIncome,
  }].slice(-60));

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

  if (currentSeasonEvent) {
    const daysLeft = currentSeasonEvent.daysLeft - 1;
    if (daysLeft <= 0) { setSeasonEvent(null); setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: Event ended — ${currentSeasonEvent.name}.` }, ...l].slice(0, 12)); }
    else setSeasonEvent({ ...currentSeasonEvent, daysLeft });
  } else {
    const nextEvent = rollSeasonEvent(d + 1);
    if (nextEvent) { setSeasonEvent({ ...nextEvent, daysLeft: nextEvent.duration }); setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: ${nextEvent.name}! ${nextEvent.description}` }, ...l].slice(0, 12)); }
  }

  if (currentCalendarEvent) {
    const daysLeft = currentCalendarEvent.daysLeft - 1;
    if (daysLeft <= 0) { setActiveCalendarEvent(null); setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 📅 ${currentCalendarEvent.name} has ended.` }, ...l].slice(0, 12)); }
    else setActiveCalendarEvent({ ...currentCalendarEvent, daysLeft });
  }

  const challengeEntries = [];
  if (currentChallenge) {
    const nextLeft = currentChallenge.daysLeft - 1;
    if (nextLeft <= 0) {
      if (currentChallenge.resolve?.type === "vip") {
        const r = currentChallenge.resolve;
        if (Math.round(newReputation) >= r.repRequired) { setMoney((m) => m + r.success.money); setReputation((rv) => Math.max(0, Math.min(100, rv + r.success.rep))); challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: 👑 VIP impressed! +$${r.success.money.toLocaleString()} and +${r.success.rep} reputation.` }); }
        else { setReputation((rv) => Math.max(0, Math.min(100, rv + r.fail.rep))); challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: 👑 VIP left unimpressed. ${r.fail.rep} reputation.` }); }
      } else challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: ${currentChallenge.name} has passed.` });
      setChallenge(null);
    } else setChallenge({ ...currentChallenge, daysLeft: nextLeft });
  } else if (d + 1 >= 3 && Math.random() < 0.18) {
    const picked = rollChallenge();
    setChallenge({ ...picked, daysLeft: picked.duration });
    challengeEntries.push({ day: d + 1, text: `Day ${d + 1}: ⚡ ${picked.name}! ${picked.desc}` });
  }
  if (challengeEntries.length) setLog((l) => [...challengeEntries, ...l].slice(0, 12));

  const vipEntries = [];
  if (currentVipVisit) {
    const outcome = evaluateVipVisit(currentVipVisit, { avgMood: visitorStats?.avgMood || 0, cleanliness, safety, reputation: Math.round(newReputation) });
    if (outcome.money > 0) setMoney((m) => m + outcome.money);
    if (outcome.reputation !== 0) setReputation((rv) => Math.max(0, Math.min(100, rv + outcome.reputation)));
    vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ ${currentVipVisit.typeName} ${currentVipVisit.name} visited. ${outcome.message}` });
    setVipHistory((h) => [{ name: currentVipVisit.name, typeId: currentVipVisit.typeId, typeName: currentVipVisit.typeName, day: d + 1, outcome: outcome.outcome }, ...h].slice(0, 20));
    if (outcome.socialBoost || outcome.outcome === "disappointed") {
      const vipPost = generateVipSocialPost(currentVipVisit, outcome, d + 1);
      setSocialPosts((sp) => [vipPost, ...sp].slice(0, 30));
    }
    setVipVisit(null);
  } else if (attractions.length > 0 && d + 1 >= 5 && Math.random() < 0.10) {
    const newVip = rollVipVisit(levelFromXp(stateRef.current.xp || 0));
    if (newVip) { newVip.day = d + 1; setVipVisit(newVip); sound.vip(); vipEntries.push({ day: d + 1, text: `Day ${d + 1}: ⭐ A ${newVip.typeName} arrived — ${newVip.name}! Impress them for a big reward.` }); }
  }
  if (vipEntries.length) setLog((l) => [...vipEntries, ...l].slice(0, 12));

  const calendarEvent = getTriggeredCalendarEvent(d + 1);
  if (calendarEvent) { setActiveCalendarEvent({ ...calendarEvent, daysLeft: calendarEvent.duration }); setLog((l) => [{ day: d + 1, text: `Day ${d + 1}: 📅 ${calendarEvent.decoration} ${calendarEvent.name}! ${calendarEvent.desc}` }, ...l].slice(0, 12)); }

  // Group booking enquiries: schools, camps and companies request slots.
  if (attractions.length > 0 && d + 1 >= 4 && Math.random() < 0.35) {
    const booking = rollGroupBooking(currentLevel, d + 1);
    if (booking) setGroupBookings((prev) => [...prev, booking].slice(-5));
  }

  if (currentCampaigns.length) {
    const updatedCampaigns = [];
    const expiredEntries = [];
    for (const c of currentCampaigns) {
      const daysLeft = c.daysLeft - 1;
      if (daysLeft <= 0) expiredEntries.push({ day: d + 1, text: `Day ${d + 1}: 📣 ${c.name} campaign ended.` });
      else updatedCampaigns.push({ ...c, daysLeft });
    }
    setActiveCampaigns(updatedCampaigns);
    if (expiredEntries.length) setLog((l) => [...expiredEntries, ...l].slice(0, 12));
  }

  // Sponsorship deals tick down daily.
  {
    const sponsorTick = tickSponsors(currentSponsorships, d + 1);
    if (sponsorTick.surviving.length !== currentSponsorships.length || sponsorTick.expiredEntries.length) {
      setSponsorships(sponsorTick.surviving);
      if (sponsorTick.expiredEntries.length) setLog((l) => [...sponsorTick.expiredEntries, ...l].slice(0, 12));
    }
  }

  if (currentActiveEvents.length) {
    const updatedEvents = [];
    const expiredEventEntries = [];
    for (const ev of currentActiveEvents) {
      const daysLeft = ev.daysLeft - 1;
      if (daysLeft <= 0) expiredEventEntries.push({ day: d + 1, text: `Day ${d + 1}: 🎉 ${ev.name} has ended.` });
      else updatedEvents.push({ ...ev, daysLeft });
    }
    setActiveEvents(updatedEvents);
    if (expiredEventEntries.length) setLog((l) => [...expiredEventEntries, ...l].slice(0, 12));
  }

  if (!isSandbox) {
    const disasterEntries = [];
    if (currentDisaster) {
      const daysLeft = currentDisaster.daysLeft - 1;
      if (daysLeft <= 0) { setDisaster(null); setDisastersSurvived((n) => n + 1); disasterEntries.push({ day: d + 1, text: `Day ${d + 1}: ✅ ${currentDisaster.name} has passed.` }); }
      else setDisaster({ ...currentDisaster, daysLeft });
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
    if (disasterEntries.length) setLog((l) => [...disasterEntries, ...l].slice(0, 12));
  }

  const ceremonyTimer = stateRef.current.awardCeremonyTimer ?? AWARD_CEREMONY_CYCLE;
  if (ceremonyTimer <= 1) {
    const evaluation = evaluateAwards({
      grid: prevGrid, upgrades: currentUpgrades, attractionCondition: nextCondition, staff: counts, visitorStats,
      parkAppeal: calculatedAppeal, reputation: Math.round(newReputation), incidents: remaining,
      hotelStats: stateRef.current.hotelStats || {}, membershipCounts: membershipResult.counts, popularity: popResult.popularity,
      peakGuests: Math.max(stateRef.current.peakGuests || 0, totalGuestsToday), totalUpgrades: stateRef.current.totalUpgrades || 0, resortRating: newResortRating,
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
    setAwardStats({ totalWon: (stateRef.current.awardStats?.totalWon || 0) + newAwards.length, ceremoniesHeld: (stateRef.current.awardStats?.ceremoniesHeld || 0) + 1, currentGuestMult: totalAwardGuestMult(updatedAwards) });
    if (repFromAwards > 0) setReputation((rv) => Math.min(100, rv + repFromAwards));
    if (ceremonyEntries.length) setLog((l) => [...ceremonyEntries, ...l].slice(0, 12));
  } else setAwardCeremonyTimer(ceremonyTimer - 1);

  const constructionResult = simulateConstruction({ day: d + 1, projects: stateRef.current.constructionProjects, grid: prevGrid });
  setConstructionProjects(constructionResult.updatedProjects);
  for (const action of constructionResult.completionActions) {
    if (action.type === "place") {
      setGrid((g) => { const ng = [...g]; ng[action.tileIndex] = action.itemId; return ng; });
      setPopularity((p) => { const n = [...p]; while (n.length <= action.tileIndex) n.push(0); n[action.tileIndex] = DEFAULT_POPULARITY; return n; });
      setPopularityTrend((t) => { const n = [...t]; while (n.length <= action.tileIndex) n.push(0); n[action.tileIndex] = NEW_RIDE_TREND_BOOST; return n; });
      setRideAges((ages) => { const n = [...ages]; while (n.length <= action.tileIndex) n.push(0); n[action.tileIndex] = 0; return n; });
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
      setRideAges((ages) => [...ages, ...Array(action.lots).fill(0)]);
      setExpansionsDone((e) => e + 1);
    } else if (action.type === "renovate") {
      setUpgrades((u) => { const n = [...u]; n[action.tileIndex] = MAX_UPGRADE; return n; });
      setAttractionCondition((c) => { const n = [...c]; n[action.tileIndex] = 100; return n; });
      setPopularity((p) => { const n = [...p]; n[action.tileIndex] = Math.min(100, (n[action.tileIndex] || 50) + 30); return n; });
      setPopularityTrend((t) => { const n = [...t]; n[action.tileIndex] = NEW_RIDE_TREND_BOOST; return n; });
      setIncidents((items) => items.filter((i) => i.tileIndex !== action.tileIndex));
    }
  }
  if (constructionResult.totalRepReward > 0) setReputation((rv) => Math.min(100, rv + constructionResult.totalRepReward));
  if (constructionResult.totalXpReward > 0) setXp((x) => x + constructionResult.totalXpReward);
  if (constructionResult.logEntries.length) setLog((l) => [...constructionResult.logEntries, ...l].slice(0, 12));

  {
    const challengeState = {
      dailyNet: net, dailyGuests: newGuests, avgMood: visitorStats?.avgMood || 0, reputation: Math.round(newReputation),
      noIncidents: (remaining.length + newIncidents.length) === 0 ? 1 : 0, buildToday: stateRef.current.builtToday || 0,
      upgradeToday: stateRef.current.upgradedToday || 0, staffTotal: Object.values(counts).reduce((s, n) => s + (n || 0), 0),
      cleanliness: Math.round(cleanliness * 100), safety: Math.round(safety * 100),
    };
    const currentChallenges = stateRef.current.dailyChallenges || [];
    const updatedChallenges = currentChallenges.map((c) => {
      if (c.claimed) return c;
      const complete = isChallengeComplete(c, challengeState);
      const progress = challengeState[c.type] ?? 0;
      return { ...c, progress, completed: complete || c.completed };
    });
    const newCounter = (stateRef.current.challengeDayCounter || 0) + 1;
    if (newCounter >= CHALLENGE_REFRESH_DAYS || updatedChallenges.length === 0) { setDailyChallenges(rollDailyChallenges()); setChallengeDayCounter(0); }
    else { setDailyChallenges(updatedChallenges); setChallengeDayCounter(newCounter); }
    setBuiltToday(0);
    setUpgradedToday(0);
  }

  if (stateRef.current.autoPricing) {
    const repFactor = (newReputation - 50) / 50;
    const weatherFactor = dayWeather.id === "sunny" ? 0.1 : dayWeather.id === "rain" ? -0.15 : dayWeather.id === "storm" ? -0.25 : 0;
    const crowdFactor = totalCapacity > 0 ? Math.min(0.2, (newGuests / totalCapacity - 0.7) * 0.5) : 0;
    const idealPrice = Math.max(15, Math.min(60, Math.round(DEFAULT_TICKET_PRICE * (1 + repFactor * 0.3 + weatherFactor + crowdFactor))));
    if (Math.abs(idealPrice - stateRef.current.ticketPrice) >= 2) setTicketPrice(idealPrice);
  }
}