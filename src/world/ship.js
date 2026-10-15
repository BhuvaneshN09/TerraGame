export const TILE_SIZE = 16;
export const VIEW = Object.freeze({ width: 480, height: 288 });

export const ROOMS = [
  { id: 'bridge', name: 'Command bridge', x: 21, y: 3, width: 19, height: 9 },
  { id: 'crew', name: 'Crew quarters', x: 5, y: 15, width: 22, height: 12 },
  { id: 'spine', name: 'Transit spine', x: 28, y: 12, width: 5, height: 18 },
  { id: 'engineering', name: 'Engineering', x: 34, y: 15, width: 21, height: 12 },
  { id: 'cargo', name: 'Cargo hold', x: 18, y: 30, width: 26, height: 6 },
];

/** Validate authored tile data before physics or rendering consumes it. */
export function parseMap(rows) {
  if (!rows.length || !rows[0].length) throw new Error('Map must not be empty.');
  const width = rows[0].length;
  for (const row of rows) {
    if (row.length !== width) throw new Error('Map rows must have equal widths.');
    if (/[^.# D]/.test(row)) throw new Error('Unknown map tile.');
  }
  return { rows, width, height: rows.length, tileSize: TILE_SIZE };
}

function authorShip() {
  const tiles = Array.from({ length: 39 }, () => Array(60).fill(' '));
  const carve = (x, y, width, height) => {
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) tiles[row][col] = '.';
    }
  };
  ROOMS.forEach(room => carve(room.x, room.y, room.width, room.height));
  carve(28, 10, 5, 23);
  for (const x of [27, 33]) for (const y of [20, 21]) tiles[y][x] = 'D';
  // Build one tile of hull around every authored floor, including diagonals.
  const floors = tiles.map(row => [...row]);
  for (let y = 1; y < 38; y++) for (let x = 1; x < 59; x++) {
    if (floors[y][x] !== ' ') continue;
    if ([-1, 0, 1].some(dy => [-1, 0, 1].some(dx => '.D'.includes(floors[y + dy][x + dx])))) tiles[y][x] = '#';
  }
  return parseMap(tiles.map(row => row.join('')));
}

export const SHIP = authorShip();
export const SPAWN = Object.freeze({ x: 30.5 * TILE_SIZE, y: 22.5 * TILE_SIZE });

export const OBJECTS = [
  { id: 'zombie-alien', name: 'Morrow, the stranded alien', kind: 'zombie', x: 31 * 16, y: 20 * 16, width: 18, height: 28,
    status: 'AWAKE', text: 'Morrow turns slowly, one cloudy eye catching the emergency light. “The Meridian is a dead ship carrying a living signal. Find the broken circuit, learn its language, and decide what deserves to wake up.” He points toward the transit spine. “That is all the story you need for now.”' },
  { id: 'junction', name: 'Junction console', kind: 'console', x: 29 * 16, y: 20 * 16, width: 32, height: 16,
    status: 'STANDBY', text: 'ISSUE FOUND: the junction control bus is silent. The existing lights_on() patch fails validation. Run the corrected function to restore the lights.' },
  { id: 'medkit', name: 'Medical locker', kind: 'locker', x: 7 * 16, y: 17 * 16, width: 24, height: 32,
    status: 'SEALED', text: 'Emergency supplies sit behind a sealed panel. The inventory manifest has faded.' },
  { id: 'bunks', name: 'Crew bunk', kind: 'bunk', x: 19 * 16, y: 17 * 16, width: 32, height: 48,
    status: 'UNOCCUPIED', text: 'An empty sleeping berth. Someone left a folded flight suit at its foot.' },
  { id: 'reactor', name: 'Auxiliary drive', kind: 'reactor', x: 44 * 16, y: 19 * 16, width: 48, height: 48,
    status: 'OFFLINE', text: 'The auxiliary drive is cold. A maintenance socket waits below the housing.' },
  { id: 'relay', name: 'Navigation relay', kind: 'console', x: 29 * 16, y: 5 * 16, width: 48, height: 24,
    status: 'NO SIGNAL', text: 'The navigation relay displays a frozen star chart. Its last coordinates are unreadable. The relay is only an observation point for this run.' },
  { id: 'freight', name: 'Cargo container', kind: 'crate', x: 23 * 16, y: 32 * 16, width: 32, height: 32,
    status: 'SECURED', text: 'A strapped-down container marked MERIDIAN / FLIGHT SPARES. It remains secured to the deck.' },
];

export function tileAt(map, col, row) {
  return map.rows[row]?.[col] ?? ' ';
}

export function isSolidTile(tile) { return tile !== '.' && tile !== 'D'; }

export function roomAt(x, y) {
  return ROOMS.find(room => x >= room.x * 16 && x < (room.x + room.width) * 16 && y >= room.y * 16 && y < (room.y + room.height) * 16)?.name ?? 'Transit spine';
}
