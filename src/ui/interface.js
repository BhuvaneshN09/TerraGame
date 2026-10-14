const circuit = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 7h10v5h8v9h-8v5H7V7Z" stroke="currentColor" stroke-width="2"/><path d="M12 12h5v9h-5z" fill="currentColor"/><path d="M2 12h5M2 21h5M25 16h5" stroke="currentColor" stroke-width="2"/></svg>';

export function createInterface(app, actions) {
  app.innerHTML = `
    <div class="workspace">
      <section class="game-panel" aria-label="Game">
        <div class="viewport-heading"><div class="wordmark">${circuit}<span>DEAD CIRCUIT</span></div><div class="top-actions"><span id="room" aria-live="polite">Transit spine</span><button id="menu-button" class="menu-button" aria-label="Open menu">MENU</button><button id="help" class="help-button" aria-label="Show controls and mission information">?</button><button id="pause" class="text-button" aria-label="Pause game">Ⅱ</button></div></div>
        <div id="viewport" class="viewport">
          <canvas id="game" tabindex="0" aria-label="Spaceship exploration. Use W A S D or arrow keys to move, E to inspect, and Escape to pause." aria-describedby="keyboard-help">DEAD CIRCUIT uses a Canvas 2D viewport. Controls and inspection details are also available as text.</canvas>
          <span class="viewport-corner corner-a" aria-hidden="true"></span><span class="viewport-corner corner-b" aria-hidden="true"></span>
        </div>
        <div class="game-status"><span><span class="status-dot"></span><span id="game-mode">AWAITING INPUT</span></span><span id="position" aria-label="Player coordinates">X 488 / Y 360</span><span id="session-time" aria-label="Session time">00:00</span></div>
        <div class="interaction-bar" aria-live="polite"><span id="interaction-text">Explore the ship. Look for objects.</span><button id="interact" class="interact-button" hidden><kbd>E</kbd> INSPECT</button></div>
      </section>
      <aside class="sidebar" aria-label="Exploration information">
        <section class="briefing"><p class="eyebrow"><span class="accent">01</span> / RECONNAISSANCE</p><h2>Get your bearings.</h2><p>Explore the Meridian. Approach a highlighted object and inspect what remains.</p><div class="progress-heading"><span>OBJECTS INSPECTED</span><span id="inspection-count">0 / 7</span></div><div id="inspection-progress" class="progress-track" aria-hidden="true">${'<span></span>'.repeat(7)}</div><p class="scope-note">An exploration prototype.<br>Ship repairs are not available yet.</p></section>
        <section class="deck-map"><div class="section-heading"><h2>DECK SCHEMATIC</h2><span>01</span></div><canvas id="minimap" width="196" height="126" role="img" aria-label="Map of the ship: bridge north, crew west, engineering east, cargo south. Your location is the bright marker."></canvas><div class="map-legend"><span><i class="player-marker"></i>YOU</span><span><i class="object-marker"></i>OBJECT</span></div></section>
        <section class="mission-table" aria-label="Mission table"><div class="section-heading"><h2>MISSION TABLE</h2><span>LIVE</span></div><div class="mission-row active"><span class="mission-mark">◆</span><span id="mission-primary">Talk to Morrow</span><span id="mission-primary-status">ACTIVE</span></div><div class="mission-row"><span class="mission-mark">◇</span><span>Inspect objects</span><span id="mission-inspect-status">0 / 7</span></div><div class="mission-row"><span class="mission-mark">◇</span><span>Restore the circuit</span><span>LOCKED</span></div></section>
        <section class="field-notes"><div class="section-heading"><h2>FIELD NOTES</h2><span>↳</span></div><p id="field-note" aria-live="polite">No observations yet.<br>The junction console is nearby.</p><div class="signal"><span class="signal-bars" aria-hidden="true">▁▁▂▁▃▁▁▂▁▁▂▁▁▃▁▁</span><span>UPLINK UNAVAILABLE</span></div></section>
      </aside>
    </div>
    <div id="eject-notice" class="eject-notice" hidden></div>
    <section id="help-panel" class="help-panel" hidden aria-label="Controls and mission information">
      <button id="help-close" class="help-close" aria-label="Close information">×</button>
      <p class="eyebrow">DEAD CIRCUIT / FIELD GUIDE</p><h2>Explore the ship.</h2>
      <p>Look for highlighted objects and press <kbd>E</kbd> to inspect them.</p>
      <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys move. <kbd>ESC</kbd> pauses.</p>
      <p id="help-progress">Objects inspected: 0 / 7</p>
    </section>
    <footer><span>WASD / ARROWS MOVE <span class="footer-divider">·</span> E INSPECT</span><span>ESC PAUSE</span></footer>
    <dialog id="menu" aria-labelledby="dialog-heading"></dialog>`;

  const get = id => app.querySelector(`#${id}`);
  const canvas = get('game'); const dialog = get('menu');
  let shownMode = '';
  let lastNote = '';
  let typingTimer;
  const stopTyping = () => { clearInterval(typingTimer); typingTimer = undefined; };
  const typeText = (element, text) => {
    stopTyping(); element.textContent = '';
    let index = 0;
    typingTimer = setInterval(() => {
      element.textContent = text.slice(0, ++index);
      if (index >= text.length) stopTyping();
    }, 18);
  };
  get('pause').addEventListener('click', actions.pause);
  get('interact').addEventListener('click', actions.inspect);
  const toggleHelp = () => { get('help-panel').hidden = !get('help-panel').hidden; };
  get('help').addEventListener('click', toggleHelp);
  get('menu-button').addEventListener('click', toggleHelp);
  get('help-close').addEventListener('click', () => { get('help-panel').hidden = true; });
  dialog.addEventListener('cancel', event => event.preventDefault()); // Escape goes through the single input action path.
  dialog.addEventListener('click', event => {
    const action = event.target.closest('button')?.dataset.action;
    if (action) actions[action]?.();
  });

  let resizeFrame;
  let previousWidth = -1;
  const resize = new ResizeObserver(([entry]) => {
    const available = entry.contentRect.width;
    if (available === previousWidth) return;
    previousWidth = available;
    // Keep the logical canvas crisp internally while its CSS box owns the viewport.
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    });
  });
  resize.observe(get('viewport'));

  function showMenu(state) {
    if (shownMode === state.mode) return;
    shownMode = state.mode;
    dialog.dataset.mode = state.mode;
    if (state.mode === 'playing') {
      stopTyping();
      dialog.close(); canvas.focus({ preventScroll: true }); return;
    }
    if (state.mode === 'title') {
      dialog.innerHTML = `<p class="eyebrow">DEAD CIRCUIT / EXPLORATION BUILD</p><div class="dialog-symbol">${circuit}</div><h2 id="dialog-heading">The ship is silent.<br>You’re still here.</h2><p>Step aboard the Meridian. Explore its empty corridors and inspect the systems left behind.</p><button class="primary-button" data-action="start" autofocus>Begin exploration <span>→</span></button><p class="dialog-footnote">WASD / ARROWS TO MOVE <span>·</span> E TO INSPECT</p>`;
    } else if (state.mode === 'paused') {
      dialog.innerHTML = '<p class="eyebrow">EXPLORATION SUSPENDED</p><h2 id="dialog-heading">PAUSED</h2><p>Your position is held. Resume when you’re ready to continue the survey.</p><button class="primary-button" data-action="resume" autofocus>Resume exploration <span>→</span></button><button class="secondary-button" data-action="title">Return to title</button><p class="dialog-footnote">ESC TO RESUME · RETURNING TO TITLE RESETS THE SESSION</p>';
    } else if (state.mode === 'inspecting') {
      dialog.innerHTML = '<p class="eyebrow">OBJECT INSPECTION / <span id="object-status"></span></p><h2 id="dialog-heading"></h2><p id="object-description" class="typing-copy"></p><div class="placeholder-label">PLACEHOLDER SYSTEM — INSPECTION ONLY</div><button class="primary-button" data-action="close" autofocus>Back to exploration <span>↵</span></button><p class="dialog-footnote">E OR ESC TO CLOSE</p>';
      get('dialog-heading').textContent = state.inspection.name;
      get('object-status').textContent = state.inspection.status;
      typeText(get('object-description'), state.inspection.text);
    }
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[autofocus]')?.focus();
  }

  function render(state) {
    showMenu(state);
    canvas.dataset.mode = state.mode;
    const setText = (id, value) => { if (get(id).textContent !== value) get(id).textContent = value; };
    setText('room', state.room);
    setText('position', `X ${Math.round(state.player.x).toString().padStart(3, '0')} / Y ${Math.round(state.player.y).toString().padStart(3, '0')}`);
    const seconds = Math.floor(state.elapsed);
    setText('session-time', `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`);
    setText('game-mode', { title: 'AWAITING INPUT', playing: 'EXPLORING', paused: 'PAUSED', inspecting: 'INSPECTING' }[state.mode]);
    setText('inspection-count', `${state.inspected.size} / ${state.objects.length}`);
    setText('help-progress', `Objects inspected: ${state.inspected.size} / ${state.objects.length}`);
    setText('mission-primary', state.talkedToAlien ? 'Find the broken circuit' : 'Talk to Morrow');
    setText('mission-primary-status', state.talkedToAlien ? 'READY' : 'ACTIVE');
    setText('mission-inspect-status', `${state.inspected.size} / ${state.objects.length}`);
    const notice = get('eject-notice');
    if (state.notice) { notice.textContent = state.notice; notice.hidden = false; } else notice.hidden = true;
    get('pause').disabled = state.mode !== 'playing';
    const canInspect = state.mode === 'playing' && state.nearby;
    get('interact').hidden = !canInspect;
    setText('interaction-text', canInspect ? state.nearby.name : 'Explore the ship. Look for objects.');
    [...get('inspection-progress').children].forEach((segment, i) => segment.classList.toggle('filled', i < state.inspected.size));
    const note = [...state.inspected].at(-1);
    if (note !== lastNote) {
      lastNote = note;
      const object = state.objects.find(object => object.id === note);
      setText('field-note', object ? `${object.name} — ${object.status.toLowerCase()}. Observation recorded.` : 'No observations yet. The junction console is nearby.');
    }
  }
  return { canvas, minimap: get('minimap'), render, toggleHelp, destroy: () => { resize.disconnect(); cancelAnimationFrame(resizeFrame); } };
}
