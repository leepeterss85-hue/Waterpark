// Instructions follow real game state; they never advance or reward objectives.
export function getStoryGuide(step, game) {
  if (!step) return null;
  if (game.selectedBuild) return { label: 'Show a plot', text: 'Tap a glowing empty grass plot to place your building. Drag the park to explore; Change lets you choose another building.', kind: 'plot', target: 'plot' };
  const guides = {
    welcome: ['Choose a ride', 'Tap Choose a ride, select an affordable pool or slide, then tap a glowing grass plot in the park.', 'build'],
    staff: ['Hire staff', 'Tap Hire staff. In the Staff panel, use Hire beside a lifeguard or cleaner.', 'staff'],
    open: [game.playing ? 'Next Day' : 'Open Park', game.playing ? 'The park is running. Wait for the day to finish, or tap Next Day to welcome guests now.' : 'Tap Open Park to start the clock and welcome guests. Complete one park day to finish this objective.', 'open'],
    manage: ['Open Manage', 'Tap Open Manage to review prices and operations. Use Next Day above the map to finish a park day.', 'manage'],
    upgrade: ['Find a ride', 'Tap Find a ride, then tap the highlighted attraction. Choose Upgrade in its details panel.', 'ride'],
    upgrade_master: ['Find a ride', 'Select an existing attraction in the park and choose Upgrade. Repeat until you have five upgrades.', 'ride'],
    expand: ['Open Build', 'Open Build and add another attraction, or use the land expansion controls at the top of that panel.', 'build'],
    resort: ['Build a hotel', 'Open Build, scroll to Hotels and select an affordable hotel. Place it on an empty plot.', 'build'],
    mastery: ['Park Mastery', 'Open Park Mastery to see which achievements award mastery points and work towards twelve points.', 'mastery'],
    empire: ['Global Empire', 'Open Global Empire, then choose an affordable rival acquisition or franchise.', 'empireExpansion'],
    award_winner: ['Park Awards', 'Open Park Awards to review the requirements. Improve your park and run more days for evaluation.', 'awards'],
    guest_voices: ['Guest Reviews', 'Open Guest Reviews to read feedback. Run more park days to collect five reviews.', 'reviews'],
    loyalty: ['Memberships', 'Open Memberships to review your passes. Keep guests happy and run days to grow membership.', 'memberships'],
    crystal_water: ['Water Quality', 'Open Water Quality to identify low-quality pools. Improve treatment and staffing, then run the park.', 'waterQuality'],
    signature_chain: ['Attraction Chains', 'Open Attraction Chains to see the required combination of rides, then build the missing attractions.', 'chains'],
    brand_builder: ['Social Activity', 'Open Social Activity to review posts. Improve guest experiences and run more days to generate posts.', 'social'],
  };
  const entry = guides[step.id];
  if (entry) return {label: entry[0], text: entry[1], target: entry[2], kind: entry[2] === 'ride' ? 'ride' : entry[2] === 'open' ? 'clock' : 'menu'};
  const names = {build:'Build', staff:'Staff', research:'Research', manage:'Manage', resort:'Resort', emergencies:'Emergency Centre', competitors:'Rival Parks', advancedPark:'Destinations'};
  return {label: `Open ${names[step.target] || 'Goals'}`, text: `${step.action} ${step.target ? `Tap Open ${names[step.target] || 'Goals'} below to reach the relevant controls.` : 'Continue running your park to complete this goal.'}`, kind:'menu', target:step.target || 'gameModes'};
}
