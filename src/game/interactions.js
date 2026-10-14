import { isSolidTile, tileAt } from '../world/ship.js';

function reachable(player, object, map) {
  const nearest = {
    x: Math.max(object.x, Math.min(player.x, object.x + object.width)),
    y: Math.max(object.y, Math.min(player.y, object.y + object.height)),
  };
  const distance = Math.hypot(nearest.x - player.x, nearest.y - player.y);
  if (distance > 30) return null;
  const steps = Math.max(1, Math.ceil(distance / 2));
  for (let i = 1; i <= steps; i++) {
    const x = player.x + (nearest.x - player.x) * i / steps;
    const y = player.y + (nearest.y - player.y) * i / steps;
    if (isSolidTile(tileAt(map, Math.floor(x / map.tileSize), Math.floor(y / map.tileSize)))) return null;
  }
  return distance;
}

export function nearbyObject(player, objects, map) {
  let nearest = null;
  let closest = Infinity;
  for (const object of objects) {
    const distance = reachable(player, object, map);
    if (distance !== null && distance < closest) { nearest = object; closest = distance; }
  }
  return nearest;
}
