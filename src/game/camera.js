export function followCamera(target, world, view) {
  return {
    x: Math.max(0, Math.min(target.x - view.width / 2, Math.max(0, world.width - view.width))),
    y: Math.max(0, Math.min(target.y - view.height / 2, Math.max(0, world.height - view.height))),
  };
}
