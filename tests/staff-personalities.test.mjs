import test from 'node:test';
import assert from 'node:assert/strict';
import { staffCharacter, staffNotice, STAFF_CHARACTER_NOTES } from '../src/data/staffPersonalities.js';
import { parkAnnouncement } from '../src/data/parkAnnouncements.js';

test('roster slots preserve existing characters through hiring, release and reload', () => {
  for (const role of Object.keys(STAFF_CHARACTER_NOTES)) {
    const before = Array.from({length: 3}, (_, i) => staffCharacter(role, i));
    const after = Array.from({length: 4}, (_, i) => staffCharacter(role, i));
    assert.deepEqual(after.slice(0, 3), before);
    assert.deepEqual(staffCharacter(role, 3), after[3]);
    assert.equal(new Set(after.map(p => p.name)).size, 4);
    assert.ok(after.every(p => p.note && p.name && p.id));
  }
});
test('staff advice reflects morale and workload rather than decorative personality', () => {
  assert.match(staffNotice().advice, /Hire/);
  assert.match(staffNotice({total: 2, morale: 30}).advice, /Low morale/);
  assert.match(staffNotice({total: 2, guests: 200}).advice, /Workload/);
  assert.match(staffNotice({total: 5, guests: 100, morale: 90}).advice, /thriving/);
});
test('park radio prioritises incidents and water over staff banter', () => {
  const park = {guests: 200, staff: {cleaner: 1}, staffMorale: 30};
  assert.equal(parkAnnouncement(park).category, 'staff');
  assert.match(parkAnnouncement(park).text, /Low morale/);
  assert.equal(parkAnnouncement({...park, incidents: [{}]}).category, 'repair');
  assert.equal(parkAnnouncement({...park, waterQuality: 20}).category, 'water');
  assert.equal(parkAnnouncement({guests: 200}).category, 'general');
});
test('radio rotation and legacy inputs always yield readable text', () => {
  for (const turn of [0, 1, -4, NaN, Infinity]) assert.ok(parkAnnouncement({}, turn).text);
  assert.ok(staffCharacter('new-role').note);
  assert.notEqual(parkAnnouncement({guests: 10}, 0).text, parkAnnouncement({guests: 10}, 1).text);
});
