import { staffNotice } from "./staffPersonalities.js";

// Original park humour. Conditions come from the simulation; no fabricated events.
const lines = {
  staff: ["Staff are reminded that hiding behind a clipboard does not count as a break.", "The staff room kettle is not a substitute for a maintenance department.", "All staff: please return borrowed pens. Management is down to its ceremonial biro."],
  quiet: ["Welcome to the park. The grass is ready. Management is still finding the scissors.", "Maya says: start with one good ride. The empire can wait until after lunch.", "Planning permission granted. Permission to build something daft remains under review."],
  busy: ["The queue is now long enough to qualify as a separate attraction.", "Guests in the queue have formed a residents' association.", "Queueing is our most popular dry ride. Perhaps add another wet one."],
  repair: ["Our mechanic is investigating a noise described as 'probably expensive'.", "A ride needs attention. Staring at it sternly has not helped.", "Maintenance is on the agenda. Preferably before the agenda gets wet."],
  water: ["The pool needs cleaning. 'Rustic lagoon' is not an acceptable explanation.", "Water treatment requested. The ducks have declined to comment.", "Please improve the water quality. Guests prefer to see their own feet."],
  happy: ["Guest happiness is up. Accounts would like to know if we can bottle it.", "Another excellent day. Even the inflatable flamingo looks smug.", "Guests are smiling. Please do not immediately put the prices up."],
  rain: ["British summer service is operating normally: water above and below.", "Rain is complimentary. Towels remain a separate department.", "The weather has supplied an extra water feature. No planning required."],
  general: ["Please stop running beside the pool. The paperwork is not waterproof.", "Guests are reminded that the shallow end is not a comment on their personality.", "The lost-property office cannot accept responsibility for lost arguments.", "Please shower before entering the pool. Enthusiasm is not a disinfectant.", "Management would like to thank you for your patience. It was cheaper than another slide.", "Please do not reserve sun loungers with relatives who have gone home.", "The wave pool will resume shortly in your imagination. Actual waves follow their normal schedule.", "The gift shop reminds you that memories are free. Everything with our logo is not.", "Visitors seeking a quiet afternoon are advised to avoid the screaming tube.", "Please keep all limbs inside the inflatable. Especially if you are still wearing it.","Please use the bins. The seagulls are not on the cleaning rota.", "Lost property has acquired one flip-flop and several ambitious hats.", "Please keep your dignity with you. Management cannot retrieve it from the flume.", "The lazy river has declined an invitation to work harder.", "Running by the pool is prohibited. Enthusiastic waddling is under review.", "Please do not feed the lifeguards. They have a staff room.", "A reminder: the wave pool is not accepting requests for an encore.", "Our rubber ducks are decorative. Their management advice is not binding."]
};
export function parkAnnouncement({guests = 0, queueStats = {}, incidents = [], waterQuality = 100, avgMood = 0, weather = "", staff = {}, staffMorale = 75} = {}, turn = 0) {
  const rotation = Number.isFinite(turn) ? Math.abs(Math.trunc(turn)) : 0;
  const total = Object.values(staff || {}).reduce((sum, count) => sum + Math.max(0, Number(count) || 0), 0);
  const staffIssue = total > 0 && (staffMorale < 45 || guests / total > 60);
  const wet = /rain|storm/.test(String(weather || ""));
  const category = incidents.length ? "repair" : guests <= 0 ? "quiet" : waterQuality < 45 ? "water" :
    Object.values(queueStats).some(q => Number(q?.wait) >= 18) ? "busy" :
    wet ? "rain" : staffIssue ? "staff" : avgMood >= 82 ? "happy" : total > 0 && rotation % 4 === 3 ? "staff" : "general";
  if (category === "staff" && staffIssue) {
    const notice = staffNotice({ morale: staffMorale, guests, total });
    return { category, text: `${notice.joke} ${notice.advice}` };
  }
  const pool = lines[category];
  return {category, text: pool[rotation % pool.length]};
}
