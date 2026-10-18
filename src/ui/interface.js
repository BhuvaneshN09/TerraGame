export function createInterface(app, actions) {
  app.innerHTML = `
    <div class="workspace">
      <section class="game-panel" aria-label="Game">
        <div class="viewport-heading"><div class="wordmark"><span>FALLSHIP</span></div><div class="top-actions"><span id="room" aria-live="polite">Transit spine</span><button id="menu-button" class="menu-button" aria-label="Open menu">MENU</button><button id="help" class="help-button" aria-label="Show controls and mission information">?</button><button id="pause" class="text-button" aria-label="Pause game">Ⅱ</button></div></div>
        <div id="viewport" class="viewport">
          <canvas id="game" tabindex="0" aria-label="Spaceship exploration. Use W A S D or arrow keys to move, E to inspect, and Escape to pause." aria-describedby="keyboard-help">FALLSHIP uses a Canvas 2D viewport. Controls and inspection details are also available as text.</canvas>
          <span class="viewport-corner corner-a" aria-hidden="true"></span><span class="viewport-corner corner-b" aria-hidden="true"></span>
        </div>
        <div class="game-status"><span><span class="status-dot"></span><span id="game-mode">AWAITING INPUT</span></span><span id="position" aria-label="Player coordinates">X 488 / Y 360</span><span id="session-time" aria-label="Session time">00:00</span></div>
        <div class="interaction-bar" aria-live="polite"><span id="interaction-text">Explore the ship. Look for objects.</span><button id="interact" class="interact-button" hidden><kbd>E</kbd> INSPECT</button></div>
      </section>
      <aside class="sidebar" aria-label="Exploration information">
        <section class="briefing"><p class="eyebrow"><span class="accent">01</span> / RECONNAISSANCE</p><h2>Get your bearings.</h2><p>Use T to open the map. Travel to each highlighted machine and press E.</p><div class="progress-heading"><span>MACHINES REPAIRED</span><span id="inspection-count">0 / 6</span></div><div id="inspection-progress" class="progress-track" aria-hidden="true">${'<span></span>'.repeat(6)}</div><p class="scope-note">Six faults per level.<br>Write a program at every machine.</p></section>
        <section class="deck-map"><div class="section-heading"><h2>DECK SCHEMATIC</h2><span>01</span></div><canvas id="minimap" width="220" height="142" role="img" aria-label="Map of the ship. Amber markers are machine faults. Your location is the bright marker."></canvas><div class="map-legend"><span><i class="player-marker"></i>YOU</span><span><i class="fault-marker"></i>FAULT</span></div></section>
        <section class="mission-table" aria-label="Mission table"><div class="section-heading"><h2>MISSION TABLE</h2><span id="level-label">LEVEL 01 / 05</span></div><div class="mission-row active"><span class="mission-mark">◆</span><span id="mission-primary">Talk to Morrow</span><span id="mission-primary-status">READY</span></div><div class="mission-row"><span class="mission-mark">◇</span><span>Machines repaired</span><span id="mission-inspect-status">0 / 6</span></div><div class="mission-row"><span class="mission-mark">◇</span><span>Map faults</span><span id="mission-fix-status">PRESS T</span></div><div class="mission-timer">RUN TIME <strong id="run-timer">01:00</strong></div></section>
        <section class="field-notes"><div class="section-heading"><h2>FIELD NOTES</h2><span>↳</span></div><p id="field-note" aria-live="polite">No observations yet.<br>Use T to open the ship map.</p><div class="signal"><span class="signal-bars" aria-hidden="true">▁▁▂▁▃▁▁▂▁▁▂▁▁▃▁▁</span><span>UPLINK UNAVAILABLE</span></div></section>
      </aside>
    </div>
    <div id="eject-notice" class="eject-notice" hidden></div>
    <section id="help-panel" class="help-panel" hidden aria-label="Controls and mission information">
      <button id="help-close" class="help-close" aria-label="Close information">×</button>
      <p class="eyebrow">FALLSHIP / FIELD GUIDE</p><h2>Explore the ship.</h2>
      <p>Look for highlighted objects and press <kbd>E</kbd> to inspect them.</p>
      <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys move. <kbd>ESC</kbd> pauses.</p>
      <p id="help-progress">Machines repaired: 0 / 6</p>
    </section>
    <footer><span>WASD / ARROWS MOVE <span class="footer-divider">·</span> E INSPECT</span><span>ESC PAUSE</span></footer>
    <section id="map-overlay" class="map-overlay" hidden aria-label="Full ship map"><div class="map-card"><div class="section-heading"><h2>SHIP OVERVIEW</h2><span>T TO CLOSE</span></div><canvas id="map-overview" width="820" height="520" role="img" aria-label="Expanded ship map with fault machines highlighted"></canvas><p class="map-overview-help"><span class="fault-key"></span> FAULT MACHINE <span class="player-key"></span> YOU <span>·</span> TRAVEL TO EACH FAULT AND PRESS E</p></div></section>
    <dialog id="menu" aria-labelledby="dialog-heading"></dialog>`;

  const get = id => app.querySelector(`#${id}`);
  const canvas = get('game'); const dialog = get('menu');
  let shownMode = '';
  let lastNote = '';
  let typingTimer;
  let shootingStarTimer;
  let loadingActive = false;
  let mapOpen = false;
  const stopTyping = () => { clearInterval(typingTimer); typingTimer = undefined; };
  const typeText = (element, text) => {
    stopTyping(); element.textContent = '';
    let index = 0;
    typingTimer = setInterval(() => {
      element.textContent = text.slice(0, ++index);
      if (index >= text.length) stopTyping();
    }, 18);
  };
  const stopShootingStars = () => {
    clearInterval(shootingStarTimer);
    shootingStarTimer = undefined;
  };
  const startShootingStars = () => {
    stopShootingStars();
    const spawn = () => {
      const field = get('shooting-stars');
      if (!field) return;
      const star = document.createElement('span');
      star.className = 'shooting-star';
      const angle = Math.random() * 360;
      const distance = 140 + Math.random() * 260;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--angle', `${angle}deg`);
      star.style.setProperty('--distance', `${distance}px`);
      star.style.setProperty('--flight', `${1800 + Math.random() * 1400}ms`);
      star.addEventListener('animationend', () => star.remove(), { once: true });
      field.append(star);
    };
    for (let count = 0; count < 2; count++) spawn();
    shootingStarTimer = setInterval(() => {
      for (let count = 0; count < 2; count++) spawn();
    }, 2000);
  };
  get('pause').addEventListener('click', actions.pause);
  get('interact').addEventListener('click', actions.inspect);
  const toggleHelp = () => { get('help-panel').hidden = !get('help-panel').hidden; };
  get('help').addEventListener('click', toggleHelp);
  get('menu-button').addEventListener('click', actions.pause);
  get('map-overlay').addEventListener('click', event => { if (event.target.id === 'map-overlay') toggleMap(); });
  get('help-close').addEventListener('click', () => { get('help-panel').hidden = true; });
  dialog.addEventListener('cancel', event => event.preventDefault()); // Escape goes through the single input action path.
  dialog.addEventListener('click', event => {
    const action = event.target.closest('button')?.dataset.action;
    if (action === 'help') { get('help-panel').hidden = false; dialog.close(); }
    else if (action === 'solve') actions.solve(get('patch-code').value);
    else if (action) actions[action]?.();
  });
  dialog.addEventListener('focusin', event => {
    if (event.target.id === 'patch-code') actions.challengeActivity();
  });
  dialog.addEventListener('input', event => {
    if (event.target.id === 'patch-code') actions.challengeActivity();
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

  function showLoading() {
    stopTyping();
    stopShootingStars();
    loadingActive = true;
    shownMode = 'loading';
    dialog.dataset.mode = 'loading';
    dialog.dataset.result = '';
    dialog.classList.remove('loading-exit');
    dialog.innerHTML = '<div class="loading-mark" aria-label="Loading FALLSHIP"><p class="eyebrow">MERIDIAN EXPLORATION PROGRAM</p><h2 id="dialog-heading">FALLSHIP</h2></div>';
    if (!dialog.open) dialog.showModal();
  }

  const fadeLoading = () => dialog.classList.add('loading-exit');

  function toggleMap() {
    mapOpen = !mapOpen;
    get('map-overlay').hidden = !mapOpen;
    if (mapOpen) stopTyping();
  }

  function showMenu(state) {
    if (loadingActive) {
      if (state.mode === 'title' || state.mode === 'inspecting') return;
      loadingActive = false;
    }
    if (state.morrowHint) {
      if (shownMode !== 'morrow-hint') {
        shownMode = 'morrow-hint';
        dialog.dataset.mode = 'morrow-hint';
        dialog.dataset.result = '';
        dialog.innerHTML = '<p class="eyebrow">MORROW / MESSAGE</p><h2 id="dialog-heading">Morrow</h2><p>Need a hand? Read the goal, then build the program one line at a time. The checker will run the ship tests after you submit.</p><button class="primary-button" data-action="dismissMorrowHint" autofocus>BACK TO PROGRAM <span>↵</span></button>';
        if (!dialog.open) dialog.showModal();
        dialog.querySelector('[autofocus]')?.focus();
      }
      return;
    }
    if (shownMode === 'morrow-hint') shownMode = '';
    if (state.mode !== 'title') stopShootingStars();
    if (state.mode !== 'playing' && mapOpen) { mapOpen = false; get('map-overlay').hidden = true; }
    if (shownMode === state.mode) return;
    shownMode = state.mode;
    dialog.dataset.mode = state.mode;
    if (state.mode === 'playing') {
      stopTyping();
      dialog.close(); canvas.focus({ preventScroll: true }); return;
    }
    if (state.mode === 'title') {
      const hasSave = Number.parseInt(localStorage.getItem('fallship-level') ?? '0', 10) > 0; dialog.innerHTML = `<div id="shooting-stars" class="shooting-stars" aria-hidden="true"></div><p class="eyebrow">FALLSHIP</p><h2 id="dialog-heading">FALLSHIP</h2><p>MERIDIAN EXPLORATION PROGRAM</p>${hasSave ? '<button class="primary-button" data-action="continue" autofocus>CONTINUE</button><button class="secondary-button" data-action="start">NEW GAME</button>' : '<button class="primary-button" data-action="start" autofocus>Begin exploration</button>'}<button class="secondary-button" data-action="help">CONTROLS</button><p class="dialog-footnote">WASD MOVE · E INTERACT · ESC PAUSE</p>`;
      startShootingStars();
    } else if (state.mode === 'paused') {
      dialog.innerHTML = '<p class="eyebrow">EXPLORATION SUSPENDED</p><h2 id="dialog-heading">PAUSED</h2><p>Your position is held. Resume when you’re ready to continue the survey.</p><button class="primary-button" data-action="resume" autofocus>Resume exploration <span>→</span></button><button class="secondary-button" data-action="title">Return to title</button><p class="dialog-footnote">ESC TO RESUME · RETURNING TO TITLE RESETS THE SESSION</p>';
    } else if (state.mode === 'expired') {
      dialog.innerHTML = '<p class="eyebrow">MERIDIAN / TIME LIMIT</p><h2 id="dialog-heading">RUN EXPIRED</h2><p>The repair window closed before all machines were restored. Start this level again to try the route.</p><button class="primary-button" data-action="retryLevel" autofocus>Retry level <span>↵</span></button><button class="secondary-button" data-action="title">Return to title</button><p class="dialog-footnote">YOUR REPAIRS RESET FOR THIS RUN</p>';
    } else if (state.mode === 'briefing') {
      dialog.dataset.result = '';
      dialog.innerHTML = '<p class="eyebrow">MORROW / BRIEFING</p><h2 id="dialog-heading">Morrow</h2><p id="object-description" class="typing-copy"></p><button class="primary-button" data-action="briefingNext" autofocus>NEXT <span>→</span></button>';
      typeText(get('object-description'), state.inspection.text);
    } else if (state.mode === 'inspecting') {
      const challenge = state.inspection.kind === 'machine' && !state.levelPassed && !state.repairedMachines.has(state.inspection.id);
      const result = state.levelPassed;
      dialog.dataset.result = result ? 'passed' : '';
      const code = state.currentChallenge?.starter ?? '# write the Python program here';
      dialog.innerHTML = `${result ? '<div class="confetti" aria-hidden="true">✦ · ✧ ✦ · ✧ ✦</div>' : ''}<p class="eyebrow">${result ? 'LEVEL PASSED / PROGRAMS CONFIRMED' : 'OBJECT INSPECTION / <span id="object-status"></span>'}</p><h2 id="dialog-heading">${result ? 'RESTORED' : ''}</h2><p id="object-description" class="typing-copy"></p>${challenge ? `<p class="challenge-prompt">${state.currentChallenge.prompt}</p><label class="code-label" for="patch-code">PYTHON PROGRAM / ${state.currentChallenge.label}</label><textarea id="patch-code" class="code-input" rows="8" spellcheck="false">${code}</textarea><p class="compiler-status">COMPILE + TEST CHECKER</p><button class="primary-button" data-action="solve" autofocus>Run tests <span>↵</span></button>` : result ? `<p class="level-result">LEVEL PASSED<br>${'★'.repeat(state.stars)}${'☆'.repeat(3 - state.stars)}<br>Run time ${Math.ceil(state.runTimeLeft)} seconds remaining.</p><button class="primary-button" data-action="nextLevel" autofocus>Next level <span>↵</span></button>` : '<button class="primary-button" data-action="close" autofocus>Back to exploration <span>↵</span></button>'}<p class="dialog-footnote">E OR ESC TO CLOSE</p>`;
      if (!result) {
        get('dialog-heading').textContent = state.inspection.name;
        get('object-status').textContent = state.inspection.status;
        typeText(get('object-description'), state.inspection.text);
      } else {
        typeText(get('object-description'), state.inspection.text);
      }
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
    const remaining = Math.ceil(state.runTimeLeft);
    setText('run-timer', `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`);
    setText('game-mode', { title: 'AWAITING INPUT', playing: 'EXPLORING', paused: 'PAUSED', expired: 'RUN EXPIRED', inspecting: 'INSPECTING' }[state.mode]);
    setText('inspection-count', `${state.repairedMachines.size} / ${state.level.machines.length}`);
    setText('help-progress', `Machines repaired: ${state.repairedMachines.size} / ${state.level.machines.length}`);
    setText('mission-primary', state.talkedToAlien ? 'Find the machine faults' : 'Talk to Morrow');
    setText('level-label', `LEVEL ${String(state.levelIndex + 1).padStart(2, '0')} / 05`);
    setText('mission-primary-status', state.talkedToAlien ? 'COMPLETE' : 'READY');
    setText('mission-inspect-status', `${state.repairedMachines.size} / ${state.level.machines.length}`);
    setText('mission-fix-status', state.levelPassed ? 'COMPLETE' : 'PRESS T');
    const notice = get('eject-notice');
    if (state.notice) { notice.textContent = state.notice; notice.hidden = false; } else notice.hidden = true;
    get('pause').disabled = state.mode !== 'playing';
    const canInspect = state.mode === 'playing' && state.nearby;
    get('interact').hidden = !canInspect;
    const greeting = 'Hello there traveler, talk to Morrow.';
    const openingText = state.mode === 'playing' && !state.talkedToAlien && state.elapsed < 4
      ? greeting.slice(0, Math.max(1, Math.floor(state.elapsed * 32)))
      : 'Explore the ship. Look for objects.';
    setText('interaction-text', canInspect ? state.nearby.name : openingText);
    [...get('inspection-progress').children].forEach((segment, i) => segment.classList.toggle('filled', i < state.repairedMachines.size));
    const note = [...state.inspected].at(-1);
    if (note !== lastNote) {
      lastNote = note;
      const object = state.objects.find(object => object.id === note);
      setText('field-note', object ? `${object.name}: ${object.status.toLowerCase()}. Observation recorded.` : 'No observations yet. Use T to open the ship map.');
    }
  }
  return { canvas, minimap: get('minimap'), mapOverview: get('map-overview'), render, refresh: state => { shownMode = ''; render(state); }, showLoading, fadeLoading, toggleHelp, toggleMap, isMapOpen: () => mapOpen, destroy: () => { stopShootingStars(); resize.disconnect(); cancelAnimationFrame(resizeFrame); } };
}
