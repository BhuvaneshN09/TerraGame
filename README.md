# FALLSHIP

FALLSHIP is a small browser game set aboard the damaged Meridian. You play an engineer, meet Morrow, and travel through five ship maps to bring six machines back online on each level. Every machine gives you a clear Python goal and a starter program. Write the program, run the local checker, then travel to the next fault.

## Run it locally

The project uses Node.js, Vite, native Canvas, and ES modules. From this directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Useful checks are:

```sh
npm test
npm run build
npm run test:browser
```

`npm run check` runs the syntax checks, unit tests, and production build. The browser suite uses Playwright and may need `npm run test:browser:install` once on a new machine.

## Play

Use WASD or the arrow keys to move. Press E near Morrow or a machine. Press T to open the large ship map; orange markers are unrepaired machines. M or the MENU button pauses the run. Escape closes a panel or pauses. Each level has its own timer: 60 seconds for level 1, 120 seconds for level 2, and 180 seconds for levels 3 to 5. When time runs out, the run ends and you can retry that level.

The first briefing tells you what to repair. At a machine, read the GOAL before editing the Python starter. The checker reports syntax and goal problems. A successful program restores that machine, closes the editor, and sends you back to the ship so you can find the next one.

## Code layout

`src/main.js` connects the loop, simulation, renderer, and interface. `src/game/` contains input, timing, level data, the simulation, and the small static Python checker. `src/world/` contains the tile maps, objects, and collision rules. `src/render/` draws the pixel environment, sprites, camera view, and minimaps. `src/ui/` contains the DOM panels and styles. Tests live in `tests/unit/` and `tests/browser/`.

The game uses a 480×288 logical canvas and 16-pixel tiles. The simulation runs at a capped fixed step; the renderer rounds positions to keep the pixel art sharp. The level maps and machine placements are data, so new rooms and challenges can be added without putting game rules in the renderer.

## Current scope

The current build covers exploration, collision, camera tracking, physical machine interactions, map navigation, timed runs, menus, and the first set of program challenges. It does not include a general Python interpreter, audio, touch controls, or a larger campaign beyond the five authored levels.
