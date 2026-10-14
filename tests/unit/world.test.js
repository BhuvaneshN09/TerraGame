import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMap, SHIP, OBJECTS, SPAWN } from '../../src/world/ship.js';
import { isBlocked, moveWithCollision, normalizedDirection, playerBounds } from '../../src/world/collision.js';
import { nearbyObject } from '../../src/game/interactions.js';

const map = parseMap(['######', '#....#', '#.#..#', '#....#', '#....#', '######']);

test('map rejects empty, ragged, and unknown tile data', () => {
  for (const rows of [[], [''], ['..', '.'], ['?']]) assert.throws(() => parseMap(rows));
});

test('ship spawn and every placeholder sit on valid floors', () => {
  assert.equal(isBlocked(playerBounds(SPAWN), SHIP, OBJECTS), false);
  for (const object of OBJECTS) assert.equal(isBlocked(object, SHIP), false, object.id);
});

test('all walkable ship tiles form one connected environment', () => {
  const start = [Math.floor(SPAWN.x / 16), Math.floor(SPAWN.y / 16)];
  const seen = new Set([start.join(',')]);
  const queue = [start];
  for (let index = 0; index < queue.length; index++) {
    const [x, y] = queue[index];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${x + dx},${y + dy}`;
      if (!seen.has(key) && '.D'.includes(SHIP.rows[y + dy]?.[x + dx] ?? '#')) { seen.add(key); queue.push([x + dx, y + dy]); }
    }
  }
  assert.equal(seen.size, SHIP.rows.join('').replace(/[^.D]/g, '').length);
});

test('every placeholder can be inspected from a collision-safe route from spawn', () => {
  const reached = new Set();
  const seen = new Set([`${SPAWN.x},${SPAWN.y}`]);
  const queue = [{ ...SPAWN }];
  for (let i = 0; i < queue.length; i++) {
    const point = queue[i];
    const object = nearbyObject(point, OBJECTS, SHIP);
    if (object) reached.add(object.id);
    for (const [dx, dy] of [[4, 0], [-4, 0], [0, 4], [0, -4]]) {
      const next = { x: point.x + dx, y: point.y + dy };
      const key = `${next.x},${next.y}`;
      if (seen.has(key) || isBlocked(playerBounds(next), SHIP, OBJECTS)) continue;
      seen.add(key); queue.push(next);
    }
  }
  assert.deepEqual([...reached].sort(), OBJECTS.map(object => object.id).sort());
});

test('diagonal and cardinal movement have equal magnitude; opposing input cancels', () => {
  assert.equal(Math.hypot(...Object.values(normalizedDirection(1, 0))), 1);
  assert.ok(Math.abs(Math.hypot(...Object.values(normalizedDirection(1, 1))) - 1) < 1e-10);
  assert.deepEqual(normalizedDirection(0, 0), { x: 0, y: 0 });
});

test('walls and world edges stop even a large movement without tunneling', () => {
  const player = { x: 24, y: 40 };
  moveWithCollision(player, 1000, 0, map);
  assert.ok(player.x < 32);
  assert.equal(isBlocked(playerBounds(player), map), false);
  moveWithCollision(player, -1000, -1000, map);
  assert.ok(player.x >= 21 && player.y >= 21);
});

test('colliding on one axis still allows sliding on the other', () => {
  const player = { x: 26, y: 40 };
  moveWithCollision(player, 10, 10, map);
  assert.ok(player.x < 28);
  assert.equal(player.y, 50);
});

test('solid objects block players and touching rectangle edges are permitted', () => {
  const object = { x: 48, y: 48, width: 16, height: 16 };
  const player = { x: 24, y: 55 };
  moveWithCollision(player, 40, 0, map, [object]);
  assert.ok(player.x <= 43);
  assert.equal(isBlocked({ x: 38, y: 48, width: 10, height: 10 }, map, [object]), false);
});

test('interaction respects range, walls, and deterministic nearest selection', () => {
  const near = { id: 'near', x: 20, y: 20, width: 8, height: 8 };
  const far = { id: 'far', x: 64, y: 64, width: 8, height: 8 };
  assert.equal(nearbyObject({ x: 24, y: 40 }, [far, near], map), near);
  assert.equal(nearbyObject({ x: 24, y: 70 }, [near], map), null);
  assert.equal(nearbyObject({ x: 24, y: 40 }, [{ x: 50, y: 36, width: 8, height: 8 }], map), null);
});
