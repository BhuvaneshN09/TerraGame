import test from 'node:test';
import assert from 'node:assert/strict';
import { followCamera } from '../../src/game/camera.js';
import { createClock } from '../../src/game/loop.js';
import { createGame, updateGame, inspectNearby, closeInspection, solveChallenge, EJECT_ZONE, CORNER_ZONES, LEVEL_TIME_LIMITS, LEVEL_REPAIR_COUNTS } from '../../src/game/simulation.js';
import { LEVELS } from '../../src/game/levels.js';
import { LEVEL_MAPS } from '../../src/world/ship.js';
import { compilePython, testPythonChallenge } from '../../src/game/compiler.js';
import { isBlocked, overlaps } from '../../src/world/collision.js';

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
  state.inspected.add('machine-access');
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

test('each level has its own map and six positioned repair machines', () => {
  const puzzles = LEVELS.flatMap(level => level.machines);
  assert.ok(LEVELS.every(level => new Set(level.machines.map(puzzle => puzzle.id)).size === level.machines.length));
  assert.equal(new Set(LEVEL_MAPS.map(map => map.rows.join('\n'))).size, 5);
  assert.deepEqual(LEVELS.map(level => level.machines.length), [6, 6, 6, 6, 6]);
  assert.deepEqual(LEVELS.map(level => level.requiredMachines), [1, 2, 3, 4, 5]);
  assert.deepEqual(LEVEL_REPAIR_COUNTS, [1, 2, 3, 4, 5]);
  assert.ok(puzzles.every(puzzle => Number.isFinite(puzzle.x) && Number.isFinite(puzzle.y) && puzzle.machineName));
});

test('every level map keeps its spawn and console on walkable tiles', () => {
  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex++) {
    const state = createGame(levelIndex);
    for (const machine of state.objects.filter(object => object.kind === 'machine')) {
      const col = Math.floor(machine.x / 16);
      const row = Math.floor(machine.y / 16);
      assert.ok('.D'.includes(state.map.rows[row][col]), `level ${levelIndex + 1} machine ${machine.id} blocked`);
    }
    assert.ok(state.map.rows[Math.floor(state.player.y / 16)][Math.floor(state.player.x / 16)] === '.', `level ${levelIndex + 1} spawn blocked`);
    assert.notEqual(LEVELS[levelIndex].palette.floor, LEVELS[(levelIndex + 1) % LEVELS.length].palette.floor);
  }
});

test('every physical machine fits on the expanded map without overlapping another fault', () => {
  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex++) {
    const state = createGame(levelIndex);
    const machines = state.objects.filter(object => object.kind === 'machine');
    assert.equal(machines.length, 6);
    for (const machine of machines) assert.equal(isBlocked(machine, state.map), false, `${levelIndex + 1}:${machine.id}`);
    for (let i = 0; i < machines.length; i++) for (let j = i + 1; j < machines.length; j++) {
      assert.equal(overlaps(machines[i], machines[j]), false, `${levelIndex + 1}:${machines[i].id}+${machines[j].id}`);
    }
  }
});

test('all five level maps remain connected from the spawn', () => {
  for (const map of LEVEL_MAPS) {
    const start = [30, 22];
    const queue = [start];
    const seen = new Set([start.join(',')]);
    while (queue.length) {
      const [x, y] = queue.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx; const ny = y + dy; const key = `${nx},${ny}`;
        if (!seen.has(key) && '.D'.includes(map.rows[ny]?.[nx] ?? ' ')) { seen.add(key); queue.push([nx, ny]); }
      }
    }
    const floorCount = map.rows.join('').split('').filter(tile => '.D'.includes(tile)).length;
    assert.equal(seen.size, floorCount);
  }
});

test('repair runs use one minute, two minutes, then three minutes', () => {
  assert.deepEqual(LEVEL_TIME_LIMITS, [60, 120, 180, 180, 180]);
  LEVEL_TIME_LIMITS.forEach((seconds, levelIndex) => {
    const state = createGame(levelIndex);
    assert.equal(state.runTimeLeft, seconds);
    assert.equal(state.levelTimeLimit, seconds);
  });
});

test('a repair run stops when its timer reaches zero', () => {
  const state = createGame();
  state.mode = 'playing';
  updateGame(state, { x: 0, y: 0 }, LEVEL_TIME_LIMITS[0] + 0.1);
  assert.equal(state.runTimeLeft, 0);
  assert.equal(state.mode, 'expired');
  const elapsed = state.elapsed;
  updateGame(state, { x: 1, y: 0 }, 1);
  assert.equal(state.elapsed, elapsed);
  assert.equal(state.mode, 'expired');
});

test('every repair patch gives a goal and later levels teach varied Python shapes', () => {
  const puzzles = LEVELS.flatMap(level => level.machines);
  assert.ok(puzzles.every(puzzle => puzzle.goal.length > 12 && puzzle.prompt.length > 12 && puzzle.starter.length > 12));
  assert.deepEqual([...new Set(puzzles.map(puzzle => puzzle.kind))].sort(), ['access', 'battery', 'commands', 'computer', 'damage', 'decoder', 'faults', 'manifest', 'oxygen', 'scanner']);
  assert.ok(puzzles.some(puzzle => puzzle.kind === 'commands'));
  assert.ok(puzzles.some(puzzle => puzzle.starter.includes('{')));
});

test('the small Python checker reports syntax and challenge requirements', () => {
  assert.equal(compilePython('x = [1, 2').ok, false);
  const access = LEVELS[0].machines[0];
  assert.equal(testPythonChallenge(access, access.starter).ok, false);
  assert.equal(testPythonChallenge(access, 'code = input("ACCESS CODE: ")\nif code == "MERIDIAN":\n    print("ACCESS GRANTED")\nelse:\n    print("ACCESS DENIED")').ok, true);
});

test('a program is tested against the active machine goal instead of an exact patch string', () => {
  const state = createGame();
  state.mode = 'playing';
  state.nearby = state.objects.find(object => object.kind === 'machine');
  inspectNearby(state);
  assert.equal(solveChallenge(state, state.currentChallenge.starter), false);
  assert.match(state.inspection.text, /TEST FAILED/);
  const program = 'code = input("ACCESS CODE: ")\nif code == "MERIDIAN":\n    print("ACCESS GRANTED")\nelse:\n    print("ACCESS DENIED")';
  assert.equal(solveChallenge(state, program), true);
  assert.equal(state.levelPassed, true);
  assert.equal(state.repairedMachines.size, 1);
  assert.equal(state.mode, 'inspecting');
});

test('standby machines can be inspected but do not open a coding challenge', () => {
  const state = createGame();
  state.mode = 'playing';
  state.nearby = state.objects.find(object => object.kind === 'machine' && !object.faulty);
  assert.equal(inspectNearby(state), true);
  assert.equal(state.inspection.faulty, false);
  assert.equal(state.inspection.status, 'STANDBY');
  assert.equal(state.repairedMachines.size, 0);
});

test('level two waits for both active faults before passing', () => {
  const state = createGame(1);
  state.mode = 'playing';
  const faults = state.objects.filter(object => object.kind === 'machine' && object.faulty);
  state.nearby = faults[0];
  inspectNearby(state);
  assert.equal(solveChallenge(state, 'battery = 12\nusage = 3\nwhile battery > 0:\n    battery -= usage\n    print(battery)'), true);
  assert.equal(state.levelPassed, false);
  state.nearby = faults[1];
  closeInspection(state);
  inspectNearby(state);
  assert.equal(solveChallenge(state, 'readings = [42, 55, 61]\nsafe_limit = 60\nif any(reading > safe_limit for reading in readings):\n    print("FAULT DETECTED")\nelse:\n    print("ALL SYSTEMS NORMAL")'), true);
  assert.equal(state.levelPassed, true);
});

test('Morrow offers one repair hint after ten seconds at a machine', () => {
  const state = createGame();
  state.mode = 'playing';
  state.nearby = state.objects.find(object => object.kind === 'machine');
  inspectNearby(state);
  updateGame(state, { x: 0, y: 0 }, 9.9);
  assert.equal(state.morrowHint, '');
  updateGame(state, { x: 0, y: 0 }, 0.2);
  assert.match(state.morrowHint, /Need a hand/);
  updateGame(state, { x: 0, y: 0 }, 20);
  assert.equal(state.morrowHintShown, true);
});

test('Morrow does not interrupt once the player starts entering a patch', () => {
  const state = createGame();
  state.mode = 'playing';
  state.nearby = state.objects.find(object => object.kind === 'machine');
  inspectNearby(state);
  state.challengeStarted = true;
  updateGame(state, { x: 0, y: 0 }, 20);
  assert.equal(state.morrowHint, '');
  assert.equal(state.morrowHintShown, false);
});
