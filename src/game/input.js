const MOVEMENT = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
const ACTIONS = new Map([['KeyE', 'interact'], ['Escape', 'pause']]);

/** State is independent of DOM listeners, including edge-triggered actions. */
export class InputState {
  held = new Set();
  actions = new Set();

  press(code, repeat = false) {
    if (!MOVEMENT.has(code) && !ACTIONS.has(code)) return false;
    if (!repeat && !this.held.has(code) && ACTIONS.has(code)) this.actions.add(ACTIONS.get(code));
    this.held.add(code);
    return true;
  }
  release(code) { this.held.delete(code); }
  clear() { this.held.clear(); this.actions.clear(); }
  consume(action) {
    const pressed = this.actions.has(action);
    this.actions.delete(action);
    return pressed;
  }
  direction() {
    const has = (...codes) => codes.some(code => this.held.has(code)) ? 1 : 0;
    return { x: has('KeyD', 'ArrowRight') - has('KeyA', 'ArrowLeft'), y: has('KeyS', 'ArrowDown') - has('KeyW', 'ArrowUp') };
  }
}

export function bindInput(target, onFocusLost) {
  const input = new InputState();
  const controller = new AbortController();
  const options = { signal: controller.signal };
  target.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;
    if (input.press(event.code, event.repeat)) event.preventDefault();
  }, options);
  target.addEventListener('keyup', event => input.release(event.code), options);
  const loseFocus = () => { input.clear(); onFocusLost(); };
  target.addEventListener('blur', loseFocus, options);
  document.addEventListener('visibilitychange', () => { if (document.hidden) loseFocus(); }, options);
  return { input, destroy: () => { controller.abort(); input.clear(); } };
}
