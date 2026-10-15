import './style.css';
import { createGame, updateGame, inspectNearby, closeInspection, solveChallenge } from './game/simulation.js';
import { bindInput } from './game/input.js';
import { startLoop } from './game/loop.js';
import { createRenderer } from './render/renderer.js';
import { createInterface } from './ui/interface.js';

const app = document.querySelector('#app');
let state = createGame();
let loop;

function transition(change) {
  input.clear();
  change();
  loop?.reset();
  ui.render(state);
}

const actions = {
  start: () => { document.documentElement.requestFullscreen?.().catch(() => {}); transition(() => { state = createGame(); state.mode = 'playing'; }); },
  resume: () => { if (state.mode === 'paused') transition(() => { state.mode = 'playing'; }); },
  pause: () => { if (state.mode === 'playing') transition(() => { state.mode = 'paused'; state.player.moving = false; }); },
  title: () => transition(() => { state = createGame(); }),
  inspect: () => { if (state.mode === 'playing' && state.nearby) transition(() => inspectNearby(state)); },
  close: () => transition(() => closeInspection(state)),
  solve: code => { if (solveChallenge(state, code)) ui.refresh(state); },
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
  if (input.consume('menu')) actions.pause();
  if (input.consume('interact')) {
    if (state.mode === 'inspecting') actions.close();
    else actions.inspect();
  }
  updateGame(state, input.direction(), dt);
}, () => { render(state); ui.render(state); });

ui.render(state);
render(state);

if (import.meta.hot) import.meta.hot.dispose(() => { loop.stop(); binding.destroy(); ui.destroy(); });
