// Daily Challenges: rotating 3-objective challenges with rewards.
// Challenges refresh every 3 days and track progress from the game state.

const CHALLENGE_POOL = [
  { id: "earn_cash", type: "dailyNet", label: "Earn £%target% net today", target: 5000, reward: { money: 3000, xp: 50 } },
  { id: "earn_cash_big", type: "dailyNet", label: "Earn £%target% net today", target: 15000, reward: { money: 8000, xp: 120 } },
  { id: "welcome_guests", type: "dailyGuests", label: "Welcome %target% guests today", target: 200, reward: { money: 2500, xp: 60 } },
  { id: "welcome_guests_big", type: "dailyGuests", label: "Welcome %target% guests today", target: 800, reward: { money: 6000, xp: 100 } },
  { id: "high_mood", type: "avgMood", label: "Keep guest mood above %target%%", target: 75, reward: { money: 4000, xp: 80 } },
  { id: "high_rep", type: "reputation", label: "Reach %target%% reputation", target: 85, reward: { money: 5000, xp: 90 } },
  { id: "no_incidents", type: "noIncidents", label: "Operate a day with zero incidents", target: 1, reward: { money: 3500, xp: 70 } },
  { id: "build_something", type: "buildToday", label: "Build at least 1 new item today", target: 1, reward: { money: 2000, xp: 40 } },
  { id: "upgrade_ride", type: "upgradeToday", label: "Upgrade at least 1 ride today", target: 1, reward: { money: 2500, xp: 50 } },
  { id: "spend_on_staff", type: "staffTotal", label: "Have %target%+ staff hired", target: 8, reward: { money: 3000, xp: 60 } },
  { id: "clean_park", type: "cleanliness", label: "Keep cleanliness above %target%%", target: 85, reward: { money: 3500, xp: 70 } },
  { id: "safe_park", type: "safety", label: "Keep safety above %target%%", target: 85, reward: { money: 3500, xp: 70 } },
];

export const CHALLENGE_REFRESH_DAYS = 3;

export function rollDailyChallenges() {
  // Fisher–Yates gives each challenge an equal chance of appearing.
  const shuffled = [...CHALLENGE_POOL];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3).map((c) => ({
    id: c.id + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
    baseId: c.id,
    type: c.type,
    label: c.label.replace("%target%", String(c.target)),
    target: c.target,
    reward: c.reward,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

export function challengeProgress(challenge, state) {
  if (challenge.completed) return challenge.progress;
  const val = state[challenge.type] ?? 0;
  const progress = challenge.type === "noIncidents" ? (val ? 1 : 0) : val;
  return Math.min(progress, challenge.target);
}

export function isChallengeComplete(challenge, state) {
  if (challenge.completed) return true;
  const val = state[challenge.type] ?? 0;
  if (challenge.type === "noIncidents") return val >= 1;
  return val >= challenge.target;
}