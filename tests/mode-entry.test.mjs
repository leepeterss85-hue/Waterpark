import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const panel = readFileSync(new URL('../src/components/game/GameModePanel.jsx', import.meta.url), 'utf8');
const sheets = readFileSync(new URL('../src/components/game/GameMenuSheets.jsx', import.meta.url), 'utf8');
const hook = readFileSync(new URL('../src/hooks/useGameState.js', import.meta.url), 'utf8');
for (const mode of ['story', 'sandbox', 'freeplay']) {
  test(`selecting ${mode} leaves mode selection and enters the correct screen`, () => {
    const calls = [];
    let screen = 'gameModes';
    const game = {setMode: id => calls.push(id), setSelectedBuild: v => calls.push(['build', v]), setSelectedTile: v => calls.push(['tile', v])};
    const enterSource = sheets.slice(sheets.indexOf('  const enterParkMode ='), sheets.indexOf('  const story ='));
    const onEnterPark = vm.runInNewContext(enterSource + '\nenterParkMode', {game, setOpenSheet: v => screen = v});
    const selectSource = panel.slice(panel.indexOf('  const select ='), panel.indexOf('  return <div'));
    const select = vm.runInNewContext(selectSource + '\nselect', {game, onEnterPark});
    select(mode);
    assert.equal(calls[0], mode);
    assert.equal(screen, mode === 'story' ? 'storyIntro' : null);
    assert.deepEqual(calls.slice(1), [['build', null], ['tile', null]]);
    // Clicking an already-selected mode must still leave the selection screen.
    screen = 'gameModes'; select(mode);
    assert.notEqual(screen, 'gameModes');
  });
}
test('resuming story preserves chapter progress and does not reset the park', () => {
  const updates = {};
  const source = hook.slice(hook.indexOf('  const setMode = useCallback'), hook.indexOf('  const advanceStory = useCallback'));
  const select = vm.runInNewContext(source + '\nsetMode', {
    useCallback: fn => fn, day: 12, storyStep: 7, storyCompleted: false, STORY_STEPS: [],
    setGameMode: v => updates.mode = v, setSandbox: v => updates.sandbox = v,
    setLog: fn => fn([]), saveSettings: v => Object.assign(updates, v),
  });
  select('story');
  assert.equal(updates.storyStep, 7);
  assert.equal(updates.storyCompleted, false);
  assert.equal(updates.sandbox, false);
});
