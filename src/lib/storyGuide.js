import { getParkItem } from "@/data/gameData";

// Each step opens a real park control. Guidance observes progress; only the
// campaign effect in useGameState can advance chapters or grant rewards.
const menu = (target, label, text, secondary = null) =>
  ({ kind: "menu", target, label, text, secondary });
const focusRide = (text) =>
  ({ kind: "ride", target: "ride", label: "Find a ride on the map", text });
const clock = (game, text, secondary = null) => ({
  kind: "clock",
  target: game.playing ? "nextDay" : "open",
  label: game.playing ? "Run next park day" : "Open the park",
  text,
  secondary,
});

export function getStoryGuide(step, game = {}) {
  if (!step) return null;

  const building = game.selectedBuild ? getParkItem(game.selectedBuild) : null;
  const placeAttraction = ["welcome", "expand", "variety"].includes(step.id) &&
    building?.category === "attraction";
  const placeHotel = step.id === "resort" && building?.category === "hotel";
  if (placeAttraction || placeHotel) {
    return {
      kind: "plot",
      target: "plot",
      label: "Find a glowing plot",
      text: "Now tap any highlighted empty plot on the park map to place your selection. Drag to move around the park, or use Fit and + to adjust the view.",
      secondary: { kind: "menu", target: "build", label: "Change building" },
    };
  }

  const guides = {
    welcome: () => menu("build", "Choose your first ride",
      "Tap this button to open Build, choose an affordable pool or slide, then tap a glowing empty plot on the park map."),
    staff: () => menu("staff", "Hire your first employee",
      "Open Staff and tap Hire beside a lifeguard or cleaner. You only need one employee to finish this chapter."),
    open: () => clock(game, game.playing
      ? "Your park is running. Tap Run next park day to complete the first day and welcome guests."
      : "Tap Open the park to begin the clock, then use Next Day above the map to complete your first day."),
    manage: () => clock(game, "Complete your first park day. You can inspect prices, cleaning and guest demand in Manage.",
      { kind: "menu", target: "manage", label: "View management" }),
    upgrade: () => focusRide("Tap Find a ride, then tap the highlighted existing attraction. In its details choose Upgrade.",
      ),
    guests: () => clock(game,
      "Run park days until you reach 100 peak guests. Improve ride variety, ticket prices, staffing and cleanliness in Manage.",
      { kind: "menu", target: "manage", label: "Improve operations" }),
    expand: () => menu("build", "Add a second ride",
      "Open Build and place another attraction. Alternatively, choose a land expansion at the top of Build."),
    research: () => menu("research", "Research an upgrade",
      "Open Research and unlock your first available project. If you lack research points, run more park days and complete missions."),
    emergency: () => menu("emergencies", "Review park emergencies",
      "Open Emergencies to prepare your team. This objective completes when the park encounters an incident or survives a disaster. Keep the park running to encounter events."),
    resort: () => menu("build", "Build a hotel",
      "Open Build, choose a hotel from the catalogue, then place it on an empty plot. Hotels turn day visits into holidays.",
      { kind: "menu", target: "resort", label: "View resort" }),
    rival: () => menu("competitors", "View rival parks",
      "Open Rival Parks and compare your position. Reach 250 peak guests or 60% market share to progress."),
    worldclass: () => menu("overview", "Check park appeal",
      "Open Park Overview to track appeal and reputation. Decorate, zone, upgrade and improve guest experience until both reach 80."),
    mastery: () => menu("mastery", "Open Park Mastery",
      "Use Park Mastery to check activities awarding mastery points. Earn twelve points to continue."),
    mega: () => menu("advancedPark", "Open major projects",
      "Open Park Life & Destinations to review major projects; complete one signature project."),
    empire: () => menu("empireExpansion", "Expand your empire",
      "Open Global Empire and acquire a rival or open a franchise once you can afford one."),
    variety: () => menu("build", "Add more attractions",
      "Open Build to add different pools, slides or rides. Reach five attractions in your park."),
    upgrade_master: () => focusRide("Select an existing ride, choose Upgrade and repeat until five upgrades have been completed in total."),
    researcher: () => menu("research", "Open the research lab",
      "Unlock a total of three research projects. Earn more research points through park progress and missions."),
    resort_living: () => menu("resort", "Improve hotel occupancy",
      "Review your resort and improve facilities, guest happiness and accommodation until hotel occupancy reaches 50%."),
    award_winner: () => menu("awards", "Check park awards",
      "Open Awards, review the judging requirements, then run park days and improve the park to earn an industry award."),
    land_developer: () => menu("build", "Expand your park",
      "Open Build and use the land expansion controls above the catalogue. You need three completed expansions."),
    signature: () => menu("advancedPark", "Build a signature project",
      "Open Park Life & Destinations and complete a second mega-project."),
    legendary_operations: () => menu("overview", "Review your operation",
      "Reach park level 30 and £2,000,000 in lifetime earnings. Run your park and invest in growth to achieve both."),
    prestige: () => menu("overview", "Track your legacy",
      "Reach level 35 and £3,000,000 lifetime earnings. Your park does not need to be reset or prestiged to progress."),
    train_the_team: () => menu("staff", "Train your employees",
      "Open Staff and use training controls to improve staff skills and accumulate 150 total staff XP."),
    guest_voices: () => menu("reviews", "Read guest reviews",
      "Open Visitor Reviews to understand feedback. Keep running successful park days to collect five reviews."),
    loyalty: () => menu("memberships", "Grow membership",
      "Open Memberships to see your pass options. Improve park appeal and run more days until you have ten members."),
    crystal_water: () => menu("waterQuality", "Improve water quality",
      "Open Water Quality, identify pools needing attention, then improve treatment and operations until the average reaches 85."),
    signature_chain: () => menu("chains", "Build an attraction chain",
      "Open Attraction Chains to check which rides form a chain. Use Build to place missing rides.",
      { kind: "menu", target: "build", label: "Open Build" }),
    brand_builder: () => menu("social", "Open social activity",
      "Open Social Media to review posts. Give visitors great experiences and run park days until three posts appear."),
    finish: () => menu("overview", "Check final requirements",
      "Reach level 35, £3,000,000 lifetime earnings, 12 Mastery points and a rival acquisition or franchise to complete Story Mode."),
  };

  const choose = guides[step.id];
  if (choose) return choose();

  // Future chapters use their actual menu destination rather than sending
  // the player back to mode selection with a misleading 'Goals' action.
  const knownTargets = new Set(["build", "staff", "research", "manage", "resort",
    "emergencies", "competitors", "advancedPark", "overview", "mastery",
    "empireExpansion", "awards", "reviews", "memberships", "waterQuality",
    "chains", "social"]);
  const target = knownTargets.has(step.target) ? step.target : "overview";
  return menu(target, "Show next objective",
    step.action || "Open the suggested park screen to see what needs attention next.");
}
