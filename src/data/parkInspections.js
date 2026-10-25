// A rare, deterministic-to-test compliance check during a park day.
// The simulator passes one random roll; no network, real-world payments,
// or automatic purchases are involved.
const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));
export function rollParkInspection({ day=1, attractionCount=0, safety=0, cleanliness=0, uptime=0, waterQuality=100, incidentCount=0 }={}, roll=1) {
  if (day < 6 || attractionCount < 1 || !(roll >= 0 && roll < .07)) return null;
  const score = Math.round(Math.max(0, Math.min(100,
    clamp(safety * 100) * .38 + clamp(cleanliness * 100) * .24 +
    clamp(uptime * 100) * .18 + clamp(waterQuality) * .20 -
    Math.max(0, incidentCount) * 6
  )));
  const passed = score >= 72 && incidentCount < 3;
  return {
    day, score, passed,
    repDelta: passed ? 1.5 : -1.5,
    xp: passed ? 50 : 0,
    fine: passed ? 0 : 450,
    text: passed
      ? `Day ${day}: ✅ Surprise park inspection passed (${score}/100). Guests can see a safer, cleaner park. +50 XP, +1.5 reputation.`
      : `Day ${day}: ⚠️ Surprise inspection flagged safety or cleanliness (${score}/100). £450 in-game compliance cost and -1.5 reputation. Check staff, repairs and water quality.`,
  };
}
