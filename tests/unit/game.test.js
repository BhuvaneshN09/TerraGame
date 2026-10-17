import test from 'node:test';
import assert from 'node:assert/strict';
import { followCamera } from '../../src/game/camera.js';
import { createClock } from '../../src/game/loop.js';
import { createGame, updateGame, inspectNearby, closeInspection, EJECT_ZONE, CORNER_ZONES } from '../../src/game/simulation.js';
import { LEVELS } from '../../src/game/levels.js';

test('camera follows and clamps at each edge, including worlds smaller than view', () => {
  const world = { width: 1000, height: 600 };
  const view = { width: 480, height: 288 };
  assert.deepEqual(followCamera({ x: 500, y: 300 }, world, view), { x: 260, y: 156 });
  assert.deepEqual(followCamera({ x: 0, y: 0 }, world, view), { x: 0, y: 0 });
  assert.deepEqual(followCamera({ x: 1000, y: 600 }, world, view), { x: 520, y: 312 });
  assert.deepEqual(followCamera({ x: 10, y: 10 }, { width: 20, height: 20 }, view), { x: 0, y: 0 });
});

test('fixed-step clock advances equally at 30, 60, and 144 Hz', () => {
  for (const rate of [30, 60, 144]) {
    let total = 0;
    const clock = createClock(dt => { total += dt; });
    for (let frame = 0; frame <= rate; frame++) clock.advance(frame * 1000 / rate);
    assert.ok(Math.abs(total - 1) < 1e-9, `${rate} Hz: ${total}`);
  }
});

test('clock caps catch-up and reset discards time away', () => {
  const clock = createClock(() => {});
  clock.advance(0);
  assert.equal(clock.advance(10000), 8);
  clock.reset();
  assert.equal(clock.advance(100000), 0);
});

test('reset inside an update does not subtract from the newly reset accumulator', () => {
  let updates = 0;
  const clock = createClock(() => { if (++updates === 1) clock.reset(); });
  clock.advance(0);
  assert.equal(clock.advance(1000 / 60), 1);
  assert.equal(clock.advance(2000 / 60), 0);
  assert.equal(clock.advance(3000 / 60), 1);
  assert.equal(updates, 2);
});

test('title, pause, and inspection freeze movement and elapsed time', () => {
  const state = createGame();
  const original = { ...state.player };
  for (const mode of ['title', 'paused', 'inspecting']) {
    state.mode = mode;
    updateGame(state, { x: 1, y: 1 }, 1 / 60);
    assert.deepEqual(state.player, original);
    assert.equal(state.elapsed, 0);
  }
});

test('movement updates position and inspection closes without changing objects', () => {
  const state = createGame();
  state.mode = 'playing';
  const originalX = state.player.x;
  updateGame(state, { x: 1, y: 0 }, 1 / 60);
  assert.ok(state.player.x > originalX);
  assert.equal(inspectNearby(state), true);
  assert.equal(state.mode, 'inspecting');
  assert.equal(state.inspected.size, 1);
  assert.equal(inspectNearby(state), false);
  closeInspection(state);
  assert.equal(state.mode, 'playing');
  assert.equal(state.inspection, null);
  assert.equal(createGame().inspected.size, 0);
});

test('cargo edge easter egg ejects after two seconds without changing inspection progress', () => {
  const state = createGame();
  state.mode = 'playing';
  state.inspected.add('junction');
  state.player.x = EJECT_ZONE.x + 8;
  state.player.y = EJECT_ZONE.y + 8;
  updateGame(state, { x: 0, y: 0 }, 1.9);
  assert.equal(state.player.x, EJECT_ZONE.x + 8);
  updateGame(state, { x: 0, y: 0 }, 0.2);
  assert.deepEqual({ x: state.player.x, y: state.player.y }, { x: 488, y: 360 });
  assert.equal(state.inspected.size, 1);
  assert.match(state.notice, /UNAUTHORIZED DECK ACCESS/);
});

test('every authored corner gives the three-second harmless easter egg notice', () => {
  for (const corner of CORNER_ZONES) {
    const state = createGame(); state.mode = 'playing';
    state.player.x = corner.x + 20; state.player.y = corner.y + 20;
    updateGame(state, { x: 0, y: 0 }, 2.01);
    assert.equal(state.notice, 'What are you doing in the corner? huh?');
    assert.equal(state.player.x, corner.x + 20);
  }
});

test('each level has its own repair puzzles and level two does not repeat lights', () => {
  const puzzles = LEVELS.flatMap(level => level.machines);
  assert.equal(new Set(puzzles.map(puzzle => puzzle.id)).size, puzzles.length);
  assert.equal(LEVELS[1].machines.some(puzzle => puzzle.id === 'lights'), false);
  assert.deepEqual(LEVELS.map(level => level.machines.length), [1, 2, 3, 4, 5]);
});

test('Morrow offers one repair hint after ten seconds in the junction', () => {
  const state = createGame();
  state.mode = 'playing';
  state.nearby = state.objects.find(object => object.id === 'junction');
  inspectNearby(state);
  updateGame(state, { x: 0, y: 0 }, 9.9);
  assert.equal(state.morrowHint, '');
  updateGame(state, { x: 0, y: 0 }, 0.2);
  assert.match(state.morrowHint, /Need a hand/);
  updateGame(state, { x: 0, y: 0 }, 20);
  assert.equal(state.morrowHintShown, true);
});
