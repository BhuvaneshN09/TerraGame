import { isSolidTile, tileAt } from './ship.js';

export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function playerBounds(player) {
  return { x: player.x - 5, y: player.y - 5, width: 10, height: 10 };
}

export function isBlocked(box, map, objects = []) {
  const size = map.tileSize;
  for (let y = Math.floor(box.y / size); y <= Math.floor((box.y + box.height - 0.00001) / size); y++) {
    for (let x = Math.floor(box.x / size); x <= Math.floor((box.x + box.width - 0.00001) / size); x++) {
      if (isSolidTile(tileAt(map, x, y))) return true;
    }
  }
  return objects.some(object => overlaps(box, object));
}

/** Substeps prevent tunneling; independent axes let the player slide along walls. */
export function moveWithCollision(player, dx, dy, map, objects = []) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 2));
  for (let step = 0; step < steps; step++) {
    const nextX = { ...player, x: player.x + dx / steps };
    if (!isBlocked(playerBounds(nextX), map, objects)) player.x = nextX.x;
    const nextY = { ...player, y: player.y + dy / steps };
    if (!isBlocked(playerBounds(nextY), map, objects)) player.y = nextY.y;
  }
}

export function normalizedDirection(x, y) {
  const length = Math.hypot(x, y);
  return length ? { x: x / length, y: y / length } : { x: 0, y: 0 };
}
