import './style.css';
import { createGame, updateGame, inspectNearby, closeInspection, solveChallenge, beginBriefing, advanceBriefing } from './game/simulation.js';
import { bindInput } from './game/input.js';
import { startLoop } from './game/loop.js';
import { createRenderer } from './render/renderer.js';
import { createInterface } from './ui/interface.js';

const app = document.querySelector('#app');
// Paint the low-resolution floor labels only after the shared pixel face is ready.
await document.fonts.load('8px "Fallship Pixel"');
let state = createGame();
let loop;
const savedLevel = () => Number.parseInt(localStorage.getItem('fallship-level') ?? '0', 10) || 0;

function transition(change) {
  input.clear();
  change();
  loop?.reset();
  ui.render(state);
}

const actions = {
  start: () => { document.documentElement.requestFullscreen?.().catch(() => {}); transition(() => { state = createGame(0); beginBriefing(state); }); },
  continue: () => { document.documentElement.requestFullscreen?.().catch(() => {}); transition(() => { state = createGame(savedLevel()); beginBriefing(state); }); },
  briefingNext: () => transition(() => advanceBriefing(state)),
  nextLevel: () => transition(() => { state = createGame(Math.min(state.levelIndex + 1, 4)); beginBriefing(state); }),
  resume: () => { if (state.mode === 'paused') transition(() => { state.mode = 'playing'; }); },
  pause: () => { if (state.mode === 'playing') transition(() => { state.mode = 'paused'; state.player.moving = false; }); },
  title: () => transition(() => { state = createGame(); }),
  inspect: () => { if (state.mode === 'playing' && state.nearby) transition(() => inspectNearby(state)); },
  close: () => transition(() => closeInspection(state)),
  solve: code => { solveChallenge(state, code); if (state.levelPassed) localStorage.setItem('fallship-level', String(Math.min(state.levelIndex + 1, 4))); ui.refresh(state); },
  challengeActivity: () => { state.challengeStarted = true; state.challengeIdleTime = 0; },
  dismissMorrowHint: () => transition(() => { state.morrowHint = ''; }),
};

const ui = createInterface(app, actions);
const binding = bindInput(window, () => { actions.pause(); loop?.reset(); });
const { input } = binding;
const render = createRenderer(ui.canvas, state.map, ui.minimap);

loop = startLoop(dt => {
  if (input.consume('pause')) {
    if (state.mode === 'playing') actions.pause();
    else if (state.mode === 'paused') actions.resume();
    else if (state.mode === 'inspecting') actions.close();
  }
  const interacted = input.consume('interact');
  if (interacted && state.mode === 'briefing') actions.briefingNext();
  if (input.consume('menu')) actions.pause();
  if (interacted && state.mode !== 'briefing') {
    if (state.mode === 'inspecting') actions.close();
    else actions.inspect();
  }
  updateGame(state, input.direction(), dt);
}, () => { render(state); ui.render(state); });

ui.render(state);
render(state);

if (import.meta.hot) import.meta.hot.dispose(() => { loop.stop(); binding.destroy(); ui.destroy(); });
