import { SHIP, SPAWN, OBJECTS, VIEW, roomAt } from '../world/ship.js';
import { isBlocked, moveWithCollision, normalizedDirection, playerBounds } from '../world/collision.js';
import { followCamera } from './camera.js';
import { nearbyObject } from './interactions.js';

export const PLAYER_SPEED = 76;
export const EJECT_ZONE = Object.freeze({ x: 41 * 16, y: 33 * 16, width: 3 * 16, height: 3 * 16 });
export const CORNER_ZONES = Object.freeze([
  { x: 5 * 16, y: 15 * 16 }, { x: 26 * 16, y: 15 * 16 },
  { x: 21 * 16, y: 3 * 16 }, { x: 39 * 16, y: 3 * 16 },
  { x: 34 * 16, y: 15 * 16 }, { x: 54 * 16, y: 15 * 16 },
  { x: 18 * 16, y: 30 * 16 }, { x: 43 * 16, y: 30 * 16 },
]);

export function createGame() {
  const state = {
    mode: 'title', player: { ...SPAWN, facing: 'down', moving: false, walkTime: 0 },
    map: SHIP, objects: OBJECTS, camera: { x: 0, y: 0 },
    nearby: null, inspection: null, inspected: new Set(), elapsed: 0,
    ejectHold: 0, ejectCooldown: 0, cornerHold: 0, cornerCooldown: 0, notice: '', noticeTimer: 0,
    talkedToAlien: false,
    room: roomAt(SPAWN.x, SPAWN.y),
  };
  if (isBlocked(playerBounds(state.player), state.map, state.objects)) throw new Error('Player spawn is blocked.');
  refreshState(state);
  return state;
}

function refreshState(state) {
  state.camera = followCamera(state.player, { width: state.map.width * 16, height: state.map.height * 16 }, VIEW);
  state.nearby = nearbyObject(state.player, state.objects, state.map);
  state.room = roomAt(state.player.x, state.player.y);
}

export function updateGame(state, input, dt) {
  if (state.mode !== 'playing') return;
  const direction = normalizedDirection(input.x, input.y);
  const before = { x: state.player.x, y: state.player.y };
  moveWithCollision(state.player, direction.x * PLAYER_SPEED * dt, direction.y * PLAYER_SPEED * dt, state.map, state.objects);
  state.player.moving = before.x !== state.player.x || before.y !== state.player.y;
  if (direction.x) state.player.facing = direction.x < 0 ? 'left' : 'right';
  else if (direction.y) state.player.facing = direction.y < 0 ? 'up' : 'down';
  if (state.player.moving) state.player.walkTime += dt;
  state.elapsed += dt;
  state.ejectCooldown = Math.max(0, state.ejectCooldown - dt);
  state.cornerCooldown = Math.max(0, state.cornerCooldown - dt);
  state.noticeTimer = Math.max(0, state.noticeTimer - dt);
  if (state.noticeTimer === 0) state.notice = '';
  const insideEjectZone = state.player.x >= EJECT_ZONE.x && state.player.x <= EJECT_ZONE.x + EJECT_ZONE.width && state.player.y >= EJECT_ZONE.y && state.player.y <= EJECT_ZONE.y + EJECT_ZONE.height;
  state.ejectHold = insideEjectZone && !state.ejectCooldown ? state.ejectHold + dt : 0;
  if (state.ejectHold >= 2 && state.ejectCooldown === 0) {
    state.player.x = SPAWN.x;
    state.player.y = SPAWN.y;
    state.player.moving = false;
    state.ejectHold = 0;
    state.ejectCooldown = 3;
    state.notice = 'UNAUTHORIZED DECK ACCESS // RETURNING TO MERIDIAN';
    state.noticeTimer = 2.5;
  }
  const atCorner = CORNER_ZONES.some(corner => Math.hypot(state.player.x - corner.x, state.player.y - corner.y) <= 22);
  state.cornerHold = atCorner && !state.cornerCooldown ? state.cornerHold + dt : 0;
  if (state.cornerHold >= 2 && state.cornerCooldown === 0) {
    state.cornerHold = 0;
    state.cornerCooldown = 3;
    state.notice = 'What are you doing in the corner? huh?';
    state.noticeTimer = 3;
  }
  refreshState(state);
}

export function inspectNearby(state) {
  if (state.mode !== 'playing' || !state.nearby) return false;
  state.inspection = state.nearby;
  state.inspected.add(state.nearby.id);
  if (state.nearby.id === 'zombie-alien') state.talkedToAlien = true;
  state.mode = 'inspecting';
  return true;
}

export function closeInspection(state) {
  if (state.mode !== 'inspecting') return;
  state.inspection = null;
  state.mode = 'playing';
}
