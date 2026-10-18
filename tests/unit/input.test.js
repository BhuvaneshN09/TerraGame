import test from 'node:test';
import assert from 'node:assert/strict';
import { InputState } from '../../src/game/input.js';

test('WASD/arrows share an axis without stacking, opposites cancel, release clears', () => {
  const input = new InputState();
  input.press('KeyW'); input.press('ArrowUp'); input.press('KeyD');
  assert.deepEqual(input.direction(), { x: 1, y: -1 });
  input.press('KeyS');
  assert.equal(input.direction().y, 0);
  input.release('KeyD');
  assert.equal(input.direction().x, 0);
  input.clear();
  assert.deepEqual(input.direction(), { x: 0, y: 0 });
});

test('actions fire once per physical press, and focus cleanup drops pending actions', () => {
  const input = new InputState();
  input.press('KeyE');
  assert.equal(input.consume('interact'), true);
  input.press('KeyE', true);
  assert.equal(input.consume('interact'), false);
  input.release('KeyE'); input.press('KeyE');
  assert.equal(input.consume('interact'), true);
  input.press('Escape'); input.clear();
  assert.equal(input.consume('pause'), false);
  assert.equal(input.press('KeyQ'), false);
});

test('M opens the menu action once per press', () => {
  const input = new InputState();
  assert.equal(input.press('KeyM'), true);
  assert.equal(input.consume('menu'), true);
  assert.equal(input.consume('menu'), false);
  input.press('KeyM', true);
  assert.equal(input.consume('menu'), false);
  input.release('KeyM');
  input.press('KeyM');
  assert.equal(input.consume('menu'), true);
});

test('T opens the expanded ship map action once per press', () => {
  const input = new InputState();
  input.press('KeyT');
  assert.equal(input.consume('map'), true);
  assert.equal(input.consume('map'), false);
  input.press('KeyT', true);
  assert.equal(input.consume('map'), false);
});
