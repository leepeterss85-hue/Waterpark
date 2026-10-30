// Original character flavour. Names derive from role/roster slot so old saves
// gain dossiers without migrations. Personality does not change simulation stats.
const firstNames = ['Pat', 'Mo', 'Doris', 'Bert', 'Sharon', 'Clive', 'Wendy', 'Nigel', 'Mavis', 'Trevor', 'Jean', 'Gordon'];
const surnames = ['Puddleton', 'Bucket', 'Flumeworthy', 'Soggs', 'Teabreak', 'Wellington', 'Splashworth', 'Biscuit', 'Drizzle', 'Waders', 'Crumpet', 'Brolly'];
export const STAFF_CHARACTER_NOTES = {
  lifeguard: ['Eagle-eyed and dependable. Has given the wave machine a verbal warning.', 'Calm under pressure. Owns a whistle with more authority than management.', 'Takes safety seriously. Has asked a rubber duck to walk, not run.'],
  mechanic: ['Can repair anything except a relationship with management.', 'Practical and methodical. Describes every alarming noise as interesting.', 'Brings a full toolbox and a deeply pessimistic sandwich.'],
  cleaner: ['Hard-working and deeply suspicious of children carrying ice cream.', 'Believes every stain has a motive. Intends to get a confession.', 'Quietly efficient. Has named the mop Employee of the Month.'],
  security: ['Firm but fair. Once escorted an argumentative inflatable out of the park.', 'Observant and patient. Takes queue jumping as a personal insult.', 'Has a stern expression reserved exclusively for unattended bags.'],
  entertainer: ['Cheerful beyond reasonable working hours. Owns emergency jazz hands.', 'A born performer. The costume is less enthusiastic about the heat.', 'Can make a queue smile. Cannot explain the balloon giraffe to accounts.'],
  fitness_coach: ['Energetic and encouraging. Counts carrying chips as a warm-up only.', 'Believes in gentle exercise. The word gentle remains negotiable.', 'Has attempted to motivate the lazy river. Progress is limited.'],
  gardener: ['Patient with plants. Less patient with guests who sit on them.', 'Meticulous and green-fingered. Interviews weeds before removing them.', 'Speaks kindly to the flowers and firmly to the lawnmower.'],
  manager: ['Organised and ambitious. Has scheduled a meeting about fewer meetings.', 'Keeps excellent records. Even the biscuits have a quarterly forecast.', 'Confident decision-maker. Carries a clipboard for emotional support.'],
  medic: ['Calm, capable and prepared. Has heard every explanation for that sunburn.', 'Reassuring bedside manner. The first-aid kit is better organised than accounts.', 'Patient and professional. Prescribes common sense wherever possible.'],
  dj: ['Reads the crowd brilliantly. Still believes every song needs an air horn.', 'Enthusiastic mixer. Has received a noise complaint from the speakers.', 'Keeps the party moving. Refuses requests from the wave machine.'],
  chef: ['Proud of the food. Takes complaints about soggy chips personally.', 'Works well under pressure. The gravy has its own security clearance.', 'Creative and tidy. Has banned the phrase just microwave it.'],
  photographer: ['Excellent timing. Captures dignity just before it leaves the flume.', 'Patient with families. Negotiations with blinking guests are ongoing.', 'Has an eye for detail and a lens cloth permanently on overtime.'],
  zookeeper: ['Patient and attentive. The meerkats have accepted the references.', 'Excellent with animals. Finds management slightly harder to train.', 'Keeps detailed feeding records. The penguins dispute the portions.'],
  event_coordinator: ['Organised under pressure. Has a contingency plan for the contingency plan.', 'Loves a celebration. Can turn a lost flip-flop into an opening ceremony.', 'Great with schedules. Has put spontaneity in the diary for Thursday.'],
  aquatics_director: ['Knows water inside out. Still refuses to answer emails in the pool.', 'Methodical and focused. Has requested a performance review for gravity.', 'Runs a tight ship. Reminds everyone this is a water park, not an actual ship.'],
};
export function staffCharacter(role, slot = 0) {
  const index = Number.isFinite(slot) ? Math.max(0, Math.trunc(slot)) : 0;
  const seed = Array.from(String(role)).reduce((total, char) => total + char.charCodeAt(0), 0);
  const notes = STAFF_CHARACTER_NOTES[role] || ['Reliable and willing. Has brought a packed lunch and sensible shoes.'];
  return {
    id: `${role}-${index}`,
    name: `${firstNames[(seed + index) % firstNames.length]} ${surnames[(Math.floor(seed / firstNames.length) + Math.floor(index / firstNames.length)) % surnames.length]}${index >= 144 ? ` (${Math.floor(index / 144) + 1})` : ''}`,
    note: notes[index % notes.length],
  };
}
export function staffNotice({ morale = 75, guests = 0, total = 0 } = {}) {
  if (total <= 0) return { joke: 'The staff room is fully staffed by chairs.', advice: 'Hire a team below to improve park services.' };
  if (morale < 45) return { joke: 'Staff enthusiasm has been handed in at lost property.', advice: 'Low morale reduces service quality. Consider a bonus, higher wages or more staff.' };
  if (guests / total > 60) return { joke: 'The team has requested an extra pair of hands. Preferably attached to another employee.', advice: 'Workload is high. Hire more staff to reduce fatigue.' };
  if (morale >= 85) return { joke: 'Staff morale is excellent. Even the kettle has volunteered for overtime.', advice: 'Your team is thriving. Keep staffing in step with visitor growth.' };
  return { joke: 'Staff are content. Please leave the good biscuits where they can see them.', advice: 'Monitor workload and train your teams to improve their output.' };
}
