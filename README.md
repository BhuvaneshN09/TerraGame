# FALLSHIP

FALLSHIP is a small browser game about waking up on the derelict USS Meridian. You play as an engineer moving through a quiet ship, meeting Morrow, a stranded zombie alien, and figuring out what still has power. The current build focuses on exploration: pixel-art rooms, collision, a following camera, readable menus, a minimap, simple objects to inspect, and a five-minute repair run at the junction console. There is also a small corner easter egg and an ejection gag hidden in the ship.

This is an early foundation rather than the finished game. The virtual machine, campaign, inventory, audio, saves, and larger repair system are still planned work. The first repair challenge is intentionally simple: find the junction console, correct the broken `lights_on()` Python function, and run the patch before the timer runs out.

## Running it

Use Node.js 22.12 or newer. From the project directory, install the packages and start Vite:

```sh
npm ci
npm run dev
```

Open the local address Vite prints, usually `http://127.0.0.1:5173`. The same commands are available through the tasks in `.vscode/tasks.json`. `npm run build` creates the production bundle, `npm run preview` serves that bundle locally, and `npm run check` runs the syntax checks, unit tests, and build together.

The browser tests use Playwright and Chromium. Run `npm run test:browser:install` once if the browser binary is not present, then use `npm run test:browser` to build the game and exercise it in a real browser.

## Playing

Move with WASD or the arrow keys. Press E when a highlighted object is close enough to inspect it. Escape pauses the run or closes an inspection, while the MENU button opens the pause menu and the question-mark button opens the field guide. A new run begins with Morrow near the spawn and a five-minute timer. After speaking with him, find the junction console and repair the function shown in its editor. The first failed patch asks you to try again; a later failure provides a hint. A successful repair confirms `RESTORED`, shows a level-passed screen, and awards stars based on the time remaining.

## How the code is arranged

The browser entry point is `index.html`, with `src/main.js` connecting the game state, input, renderer, and interface. The authored ship, rooms, objects, and spawn live in `src/world/ship.js`. Collision and movement rules are kept in `src/world/collision.js`, while `src/game/simulation.js` owns the run timer, player updates, inspections, easter eggs, and repair challenge. `src/game/input.js` translates keyboard events into held movement and one-shot actions.

Rendering is split between the procedural environment, pixel sprites, camera, and minimap under `src/render/`. The HTML menus, HUD, dialogue editor, and responsive layout are under `src/ui/`. Unit tests cover the pure movement, collision, map, input, timer, and interaction rules. The Playwright suite in `tests/browser/` checks the important browser journeys against the production build.

The game uses a 480×288 logical canvas, 16-pixel map tiles, and a fixed 60 Hz simulation behind `requestAnimationFrame`. The browser scales that canvas to the available screen. Collision geometry is kept separate from the artwork so the pixel sprites can change without changing movement behavior.

## Current status

The current foundation has been tested with the Node test runner, a Vite production build, and Chromium browser tests. It is designed to stay easy to extend: new rooms and objects are authored in the ship data, new interactions live in the simulation, and future repair systems can be added without putting game rules inside the renderer.

The longer development plan, decisions, and verification notes are in `docs/PLAN.md`, `docs/DEVELOPMENT_LOG.md`, and `docs/VERIFICATION.md`.
