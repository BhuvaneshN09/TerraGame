import { VIEW, ROOMS } from '../world/ship.js';
import { paintEnvironment, COLORS } from './environment.js';
import { paintObject, paintPlayer } from './sprites.js';

export function createRenderer(canvas, map, minimap, overviewCanvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable in this browser.');
  canvas.width = VIEW.width; canvas.height = VIEW.height;
  ctx.imageSmoothingEnabled = false;
  let activeMap = map;
  let environment = paintEnvironment(map);
  const mini = minimap?.getContext('2d');
  const overview = overviewCanvas?.getContext('2d');

  function drawMap(state) {
    if (!mini) return;
    const currentMap = activeMap;
    const palette = { ...COLORS, ...state.level.palette };
    mini.clearRect(0, 0, minimap.width, minimap.height);
    const scale = 3;
    const ox = 8; const oy = 3;
    for (let y = 0; y < currentMap.height; y++) for (let x = 0; x < currentMap.width; x++) {
      if (!'.D'.includes(currentMap.rows[y][x])) continue;
      mini.fillStyle = palette.floor; mini.fillRect(ox + x * scale, oy + y * scale, scale, scale);
    }
    for (const room of ROOMS) {
      if (room.name !== state.room) continue;
      mini.fillStyle = palette.hull;
      mini.fillRect(ox + room.x * scale, oy + room.y * scale, room.width * scale, room.height * scale);
    }
    for (const object of state.objects) {
      if (object.kind === 'machine') {
        mini.fillStyle = state.repairedMachines.has(object.id) ? '#68766a' : palette.amber;
        mini.fillRect(ox + object.x / 16 * scale, oy + object.y / 16 * scale, 3, 3);
      } else {
        mini.fillStyle = '#718681';
        mini.fillRect(ox + object.x / 16 * scale, oy + object.y / 16 * scale, 2, 2);
      }
    }
    mini.strokeStyle = '#9aaf8b'; mini.lineWidth = 1;
    mini.strokeRect(Math.round(ox + state.camera.x / 16 * scale) + 0.5, Math.round(oy + state.camera.y / 16 * scale) + 0.5, VIEW.width / 16 * scale, VIEW.height / 16 * scale);
    mini.fillStyle = palette.mint;
    mini.fillRect(Math.round(ox + state.player.x / 16 * scale) - 1, Math.round(oy + state.player.y / 16 * scale) - 1, 3, 3);
  }

  function drawOverview(state) {
    if (!overview) return;
    const currentMap = activeMap;
    const palette = { ...COLORS, ...state.level.palette };
    const width = overviewCanvas.width; const height = overviewCanvas.height;
    overview.clearRect(0, 0, width, height);
    overview.fillStyle = palette.void; overview.fillRect(0, 0, width, height);
    const scale = Math.min((width - 40) / currentMap.width, (height - 40) / currentMap.height);
    const ox = (width - currentMap.width * scale) / 2; const oy = (height - currentMap.height * scale) / 2;
    for (let y = 0; y < currentMap.height; y++) for (let x = 0; x < currentMap.width; x++) {
      const tile = currentMap.rows[y][x];
      if (tile === ' ') continue;
      overview.fillStyle = tile === '#' ? palette.hull : tile === 'D' ? palette.amber : palette.floor;
      overview.fillRect(ox + x * scale, oy + y * scale, Math.ceil(scale), Math.ceil(scale));
      if (tile === '.') { overview.fillStyle = palette.seam; overview.fillRect(ox + x * scale, oy + (y + 1) * scale - 1, Math.ceil(scale), 1); }
    }
    overview.strokeStyle = '#789178'; overview.lineWidth = 1;
    for (const room of ROOMS) {
      overview.strokeRect(ox + room.x * scale, oy + room.y * scale, room.width * scale, room.height * scale);
      overview.fillStyle = '#d3dfc1'; overview.font = `${Math.max(8, Math.floor(scale * 0.7))}px "Fallship Pixel", monospace`;
      overview.fillText(room.name.toUpperCase(), ox + (room.x + 1) * scale, oy + (room.y + 1.5) * scale);
    }
    overview.strokeStyle = '#b7ca9a'; overview.strokeRect(ox + state.camera.x / 16 * scale, oy + state.camera.y / 16 * scale, VIEW.width / 16 * scale, VIEW.height / 16 * scale);
    for (const object of state.objects) {
      if (object.kind !== 'machine') continue;
      const repaired = state.repairedMachines.has(object.id);
      overview.fillStyle = repaired ? '#71847a' : '#e2a26a';
      const marker = repaired ? Math.max(4, scale * 0.45) : Math.max(6, scale * 0.65);
      overview.fillRect(ox + object.x / 16 * scale - marker / 2, oy + object.y / 16 * scale - marker / 2, marker, marker);
      if (!repaired) { overview.strokeStyle = '#f1d68b'; overview.strokeRect(ox + object.x / 16 * scale - marker, oy + object.y / 16 * scale - marker, marker * 2, marker * 2); }
    }
    overview.fillStyle = palette.mint;
    overview.fillRect(ox + state.player.x / 16 * scale - 4, oy + state.player.y / 16 * scale - 4, 8, 8);
  }

  return function render(state) {
    if (state.map !== activeMap) {
      activeMap = state.map;
      environment = paintEnvironment(activeMap, state.level.palette);
    }
    const palette = { ...COLORS, ...state.level.palette };
    ctx.fillStyle = palette.void; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    // Deterministic star field, independent of game state and frame rate.
    for (let index = 0; index < 85; index++) {
      const x = ((index * 137 + 53 - Math.round(state.camera.x * 0.12)) % 480 + 480) % 480;
      const y = ((index * 71 + 29 - Math.round(state.camera.y * 0.12)) % 288 + 288) % 288;
      ctx.fillStyle = index % 4 ? '#263b43' : '#5a7371'; ctx.fillRect(x, y, 1, 1);
    }
    ctx.save();
    ctx.translate(-Math.round(state.camera.x), -Math.round(state.camera.y));
    ctx.drawImage(environment, 0, 0);
    // Feet order keeps player/object overlap consistent in a top-down view.
    const drawables = [...state.objects.map(object => ({ depth: object.y + object.height, object })), { depth: state.player.y + 5, player: state.player }];
    drawables.sort((a, b) => a.depth - b.depth);
    for (const item of drawables) {
      if (item.player) paintPlayer(ctx, item.player, state.elapsed);
      else paintObject(ctx, item.object, state.elapsed);
    }
    if (state.nearby && state.mode === 'playing') {
      const object = state.nearby;
      ctx.strokeStyle = '#c5dc8b'; ctx.lineWidth = 1;
      ctx.strokeRect(object.x - 2.5, object.y - 2.5, object.width + 5, object.height + 5);
      const markerX = Math.round(object.x + object.width / 2 - 6);
      const markerY = Math.round(object.y - 16);
      ctx.save();
      ctx.fillStyle = '#c5dc8b'; ctx.fillRect(markerX, markerY, 12, 12);
      ctx.strokeStyle = '#172729'; ctx.strokeRect(markerX + 0.5, markerY + 0.5, 11, 11);
      ctx.fillStyle = '#172729';
      ctx.font = '8px "Fallship Pixel", "Courier New", "Lucida Console", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('E', markerX + 6, markerY + 6);
      ctx.restore();
    }
    ctx.restore();
    drawMap(state);
    drawOverview(state);
  };
}
