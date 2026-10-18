import { SPAWN, OBJECTS, VIEW, ROOMS, roomAt, mapForLevel } from '../world/ship.js';
import { isBlocked, moveWithCollision, normalizedDirection, playerBounds } from '../world/collision.js';
import { followCamera } from './camera.js';
import { nearbyObject } from './interactions.js';
import { LEVELS } from './levels.js';
import { testPythonChallenge } from './compiler.js';

export const PLAYER_SPEED = 76;
export const LEVEL_TIME_LIMITS = Object.freeze([60, 120, 180, 180, 180]);
export const LEVEL_REPAIR_COUNTS = Object.freeze([1, 2, 3, 4, 5]);
export const EJECT_ZONE = Object.freeze({ x: 41 * 16, y: 33 * 16, width: 3 * 16, height: 3 * 16 });
export const CORNER_ZONES = Object.freeze(ROOMS.flatMap(room => [
  { x: room.x * 16, y: room.y * 16 },
  { x: (room.x + room.width) * 16, y: room.y * 16 },
  { x: room.x * 16, y: (room.y + room.height) * 16 },
  { x: (room.x + room.width) * 16, y: (room.y + room.height) * 16 },
]));

export function createGame(levelIndex = 0) {
  const safeLevelIndex = Math.min(levelIndex, LEVELS.length - 1);
  const level = LEVELS[safeLevelIndex];
  const requiredMachines = LEVEL_REPAIR_COUNTS[safeLevelIndex] ?? level.requiredMachines;
  const levelTimeLimit = LEVEL_TIME_LIMITS[safeLevelIndex];
  const scenery = OBJECTS;
  const machines = level.machines.map((machine, index) => ({
    id: `machine-${machine.id}`,
    name: machine.machineName,
    kind: 'machine',
    x: machine.x,
    y: machine.y,
    width: machine.width,
    height: machine.height,
    status: index < requiredMachines ? 'FAULT' : 'STANDBY',
    text: index < requiredMachines ? machine.text : `${machine.machineName} is on standby on this deck.`,
    faulty: index < requiredMachines,
    challengeIndex: index,
  }));
  const objects = [...scenery, ...machines];
  const state = {
    mode: 'title',
    player: { ...SPAWN, facing: 'down', moving: false, walkTime: 0 },
    map: mapForLevel(safeLevelIndex), objects, camera: { x: 0, y: 0 },
    nearby: null, inspection: null, inspected: new Set(), repairedMachines: new Set(), elapsed: 0, runTimeLeft: levelTimeLimit, levelTimeLimit,
    ejectHold: 0, ejectCooldown: 0, cornerHold: 0, cornerCooldown: 0,
    notice: '', noticeTimer: 0,
    challengeIdleTime: 0, challengeStarted: false, morrowHintShown: false, morrowHint: '',
    talkedToAlien: false, challengeSolved: false, levelPassed: false,
    stars: 0, challengeAttempts: 0, levelIndex: Math.min(levelIndex, LEVELS.length - 1), challengeIndex: 0,
    level, requiredMachines, currentChallenge: level.machines[0],
    room: roomAt(SPAWN.x, SPAWN.y),
  };
  if (isBlocked(playerBounds(state.player), state.map, state.objects)) throw new Error('Player spawn is blocked.');
  refreshState(state);
  return state;
}

export function beginBriefing(state) {
  state.mode = 'briefing';
  state.briefingStep = 0;
  state.inspection = { id: 'morrow-briefing', name: 'Morrow', status: 'BRIEFING', text: levelBriefing(state) };
}

export function advanceBriefing(state) {
  if (state.mode !== 'briefing') return;
  if (state.briefingStep === 0) {
    state.briefingStep = 1;
    state.inspection.text = `LEVEL ${state.levelIndex + 1}: repair ${state.requiredMachines} machine${state.requiredMachines === 1 ? '' : 's'}. Morrow marked the active faults on the ship map. Press T to open the centered map overview, then travel to each fault and press E.`;
    return;
  }
  state.inspection = null;
  state.mode = 'playing';
}

function levelBriefing(state) {
  const targets = state.level.machines.slice(0, state.requiredMachines).map(machine => machine.label).join(', ');
  return state.levelIndex === 0
    ? `Hello there traveler. This is the Meridian. Talk to me, find the broken machine, and write its Python program. Repair list: ${targets}. Press T for the map overview.`
    : `LEVEL ${state.levelIndex + 1}: ${state.level.name}. Morrow needs ${state.requiredMachines} machines repaired: ${targets}. Press T for the map overview and travel to each active fault.`;
}

function refreshState(state) {
  state.camera = followCamera(state.player, { width: state.map.width * 16, height: state.map.height * 16 }, VIEW);
  state.nearby = nearbyObject(state.player, state.objects, state.map);
  state.room = roomAt(state.player.x, state.player.y);
}

export function updateGame(state, input, dt) {
  if (state.mode === 'inspecting' && state.inspection?.kind === 'machine' && state.inspection.faulty && !state.levelPassed && !state.challengeStarted && !state.morrowHintShown) {
    state.challengeIdleTime += dt;
    if (state.challengeIdleTime >= 10) {
      state.morrowHintShown = true;
      state.morrowHint = 'Need a hand? Read the function one line at a time. The machine label tells you what the finished check must return.';
    }
  }
  if (state.mode !== 'playing') return;
  const direction = normalizedDirection(input.x, input.y);
  const before = { x: state.player.x, y: state.player.y };
  moveWithCollision(state.player, direction.x * PLAYER_SPEED * dt, direction.y * PLAYER_SPEED * dt, state.map, state.objects);
  state.player.moving = before.x !== state.player.x || before.y !== state.player.y;
  if (direction.x) state.player.facing = direction.x < 0 ? 'left' : 'right';
  else if (direction.y) state.player.facing = direction.y < 0 ? 'up' : 'down';
  if (state.player.moving) state.player.walkTime += dt;
  state.elapsed += dt;
  state.runTimeLeft = Math.max(0, state.runTimeLeft - dt);
  if (state.runTimeLeft === 0 && !state.levelPassed) {
    state.mode = 'expired';
    state.player.moving = false;
    state.notice = 'RUN EXPIRED';
    state.noticeTimer = 0;
    return;
  }
  state.ejectCooldown = Math.max(0, state.ejectCooldown - dt);
  state.cornerCooldown = Math.max(0, state.cornerCooldown - dt);
  state.noticeTimer = Math.max(0, state.noticeTimer - dt);
  if (state.noticeTimer === 0) state.notice = '';
  // Check a radius around each room corner because walls block exact corner pixels.
  const atCorner = CORNER_ZONES.some(corner => Math.hypot(state.player.x - corner.x, state.player.y - corner.y) <= 42);
  const insideEjectZone = state.player.x >= EJECT_ZONE.x && state.player.x <= EJECT_ZONE.x + EJECT_ZONE.width && state.player.y >= EJECT_ZONE.y && state.player.y <= EJECT_ZONE.y + EJECT_ZONE.height;
  state.ejectHold = insideEjectZone && !state.ejectCooldown ? state.ejectHold + dt : 0;
  if (!atCorner && state.ejectHold >= 2 && state.ejectCooldown === 0) {
    state.player.x = SPAWN.x;
    state.player.y = SPAWN.y;
    state.player.moving = false;
    state.ejectHold = 0;
    state.ejectCooldown = 3;
    state.notice = 'UNAUTHORIZED DECK ACCESS // RETURNING TO MERIDIAN';
    state.noticeTimer = 2.5;
  }
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
  if (state.nearby.kind === 'machine' && state.nearby.faulty) {
    state.challengeIndex = state.nearby.challengeIndex;
    state.currentChallenge = state.level.machines[state.challengeIndex];
    state.challengeIdleTime = 0;
    state.challengeStarted = false;
    const repaired = state.repairedMachines.has(state.nearby.id);
    state.inspection = { ...state.nearby, status: repaired ? 'RESTORED' : 'FAULT', text: repaired
      ? `${state.currentChallenge.label} is already restored. Find the next highlighted fault.`
      : `FAULT ${state.challengeIndex + 1} / ${state.requiredMachines}: ${state.currentChallenge.label}. GOAL: ${state.currentChallenge.goal} Write the Python program here.` };
  }
  state.mode = 'inspecting';
  return true;
}

export function closeInspection(state) {
  if (state.mode !== 'inspecting') return;
  state.inspection = null;
  state.mode = 'playing';
}

export function solveChallenge(state, code) {
  if (state.mode !== 'inspecting' || state.inspection?.kind !== 'machine' || !state.inspection.faulty || state.repairedMachines.has(state.inspection.id)) return false;
  const result = testPythonChallenge(state.currentChallenge, code);
  if (!result.ok) {
    state.challengeAttempts += 1;
    state.inspection = { ...state.inspection, text: state.challengeAttempts >= 2 ? `TRY AGAIN. ${result.message} ${state.currentChallenge.hint}` : `TRY AGAIN. ${result.message}` };
    return false;
  }
  state.repairedMachines.add(state.inspection.id);
  if (state.repairedMachines.size < state.requiredMachines) {
    state.challengeSolved = false;
    state.challengeStarted = false;
    state.challengeIdleTime = 0;
    state.notice = `${result.message} // ${state.currentChallenge.label} RESTORED. FIND THE NEXT FAULT.`;
    state.noticeTimer = 3;
    state.inspection = null;
    state.mode = 'playing';
    return true;
  }
  state.challengeSolved = true;
  state.levelPassed = true;
  state.stars = state.runTimeLeft >= state.levelTimeLimit * 0.8 ? 3 : state.runTimeLeft >= state.levelTimeLimit * 0.4 ? 2 : 1;
  state.inspection = { ...state.inspection, status: 'RESTORED', text: `${result.message} All ${state.requiredMachines} required program${state.requiredMachines === 1 ? '' : 's'} are responding again.` };
  return true;
}
