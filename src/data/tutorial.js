// Onboarding tutorial steps. Each step coaches one core action.
// `done` is a predicate over the live game state that auto-advances the step
// when the player completes the action, so the tutorial rewards doing, not just reading.

export const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Splash Tycoon!",
    body: "You've just taken over an empty water park. In a few quick steps you'll learn how to build rides, open the gates, and keep guests happy. Let's get started!",
    cta: "Let's go",
  },
  {
    id: "build",
    title: "Build your first attraction",
    body: "Tap the Build menu at the bottom, pick a slide or pool, then tap any empty grass tile to place it. Every park needs at least one ride before guests will come.",
    cta: "I'll place one",
    done: (g) => g.grid.some((id) => id && id !== "park_entrance" && id !== "main_path"),
  },
  {
    id: "open",
    title: "Open the park",
    body: "Press the green Open Park button at the top. The day cycle starts, guests arrive, and you earn income. Press it again to pause anytime.",
    cta: "Open my park",
    done: (g) => g.playing === true,
  },
  {
    id: "staff",
    title: "Hire your team",
    body: "Open the Staff menu and hire a lifeguard or two for safety, and a mechanic to prevent breakdowns. Staff keep guests safe and rides running.",
    cta: "Got it",
    done: (g) => Object.values(g.staff || {}).some((n) => n > 0),
  },
  {
    id: "stats",
    title: "Track your progress",
    body: "Tap the Activity menu for live guest feedback, or the chart icon up top for income and satisfaction charts. Check back often to spot problems early.",
    cta: "Start playing",
  },
];

export const TUTORIAL_KEY = "waterpark-tycoon-tutorial-done";