import { ROOMS, tileAt } from '../world/ship.js';

export const COLORS = { void: '#0b1215', floor: '#273639', seam: '#1d292d', hull: '#536368', mint: '#c5dc8b', amber: '#d9a16b' };

export function paintEnvironment(map) {
  const layer = document.createElement('canvas');
  layer.width = map.width * 16;
  layer.height = map.height * 16;
  const ctx = layer.getContext('2d');
  const rect = (color, x, y, width, height) => { ctx.fillStyle = color; ctx.fillRect(x, y, width, height); };
  for (let row = 0; row < map.height; row++) for (let col = 0; col < map.width; col++) {
    const tile = tileAt(map, col, row);
    const x = col * 16; const y = row * 16;
    if (tile === ' ') continue;
    if (tile === '#') {
      rect('#141e22', x, y, 16, 16);
      rect('#45585d', x, y, 16, 10);
      rect('#718084', x, y, 16, 2);
      rect('#35454c', x + 1, y + 3, 14, 5);
      rect('#203036', x + 1, y + 11, 14, 3);
      rect('#8c9891', x + 3, y + 4, 1, 1);
      rect('#17262b', x + 13, y + 5, 1, 2);
      if (tileAt(map, col, row + 1) === '.') {
        rect('#162328', x, y + 14, 16, 2);
        if (col % 4 === 0) { rect('#b6d5bd', x + 4, y + 11, 8, 2); rect('#394f4a', x + 3, y + 13, 10, 3); }
      }
      continue;
    }
    rect((row + col) % 3 === 0 ? '#2b3a3d' : COLORS.floor, x, y, 16, 16);
    rect(COLORS.seam, x, y + 15, 16, 1);
    rect(COLORS.seam, x + 15, y, 1, 16);
    rect('#364649', x + 2, y + 2, 1, 1);
    rect('#344447', x + 13, y + 13, 1, 1);
    if (col === 30 && row > 11 && row < 30) {
      rect('#1c2c30', x + 2, y, 12, 15);
      for (let line = 2; line < 14; line += 3) rect('#35484a', x + 3, y + line, 10, 1);
    }
    if (tile === 'D') {
      rect('#16242b', x, y, 16, 16);
      rect('#657575', x + 2, y, 2, 16);
      rect('#657575', x + 12, y, 2, 16);
      for (let stripe = 0; stripe < 16; stripe += 5) rect('#c4aa6a', x + 6, y + stripe, 4, 2);
    }
  }

  for (const room of ROOMS.filter(room => room.id !== 'spine')) {
    const x = room.x * 16; const y = room.y * 16;
    ctx.strokeStyle = '#61716a'; ctx.lineWidth = 1;
    ctx.strokeRect(x + 9.5, y + 9.5, room.width * 16 - 19, room.height * 16 - 19);
    rect(COLORS.floor, x + 17, y + 5, Math.min(122, room.width * 16 - 40), 9);
    ctx.fillStyle = '#c4d3be'; ctx.font = '10px "Fallship Pixel", "Courier New", "Lucida Console", monospace';
    ctx.fillText(room.name.toUpperCase(), x + 20, y + 12);
  }
  // Inset observation windows, painted into the upper hull rather than obstacles.
  for (let x = 24 * 16; x < 37 * 16; x += 32) {
    rect('#0c1e29', x, 2 * 16 + 3, 28, 9);
    rect('#4c767b', x, 2 * 16 + 3, 28, 1);
    rect('#9bc2b0', x + 5, 2 * 16 + 6, 1, 1);
    rect('#324e5c', x + 19, 2 * 16 + 7, 4, 1);
  }
  // Floor markings communicate room purpose without adding hidden obstacles.
  ctx.font = '10px "Fallship Pixel", "Courier New", "Lucida Console", monospace'; ctx.fillStyle = '#a9bba8';
  ctx.fillText('HELLO CREW!', 8 * 16, 24 * 16);
  ctx.fillText('AUXILIARY DRIVE', 42 * 16, 24 * 16);
  ctx.fillStyle = '#998961'; ctx.fillText('CAUTION', 45 * 16, 18 * 16);
  for (let i = 0; i < 12; i++) rect(i % 2 ? '#857b54' : '#283536', 43 * 16 + i * 6, 23 * 16, 5, 3);
  return layer;
}
