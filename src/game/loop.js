export const FIXED_STEP = 1 / 60;
const MAX_STEPS = 8;

/** The clock is pure so frame-rate independence and catch-up limits can be tested. */
export function createClock(update) {
  let previous = null;
  let accumulator = 0;
  return {
    reset() { previous = null; accumulator = 0; },
    advance(timestamp) {
      if (previous === null) { previous = timestamp; return 0; }
      accumulator += Math.max(0, Math.min((timestamp - previous) / 1000, FIXED_STEP * MAX_STEPS));
      previous = timestamp;
      let steps = 0;
      while (accumulator + 1e-10 >= FIXED_STEP && steps < MAX_STEPS) {
        accumulator -= FIXED_STEP;
        steps++;
        update(FIXED_STEP); // A transition may reset the clock from inside update.
      }
      return steps;
    },
  };
}

export function startLoop(update, render) {
  const clock = createClock(update);
  let frame;
  function tick(timestamp) {
    clock.advance(timestamp);
    render();
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return { reset: () => clock.reset(), stop: () => cancelAnimationFrame(frame) };
}
