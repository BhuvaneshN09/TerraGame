# FALLSHIP

FALLSHIP is a small browser game set aboard the damaged Meridian. You play an engineer, meet Morrow, and travel through five ship maps with one to five active faults as the levels get harder. Each deck has six physical units, but only the highlighted faults need a Python program; walk up to a faulty unit and press E to open its checker.

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

Use WASD or the arrow keys to move. Press E near Morrow or a machine. Press T to open the large ship map; orange markers are active faults. M or the MENU button pauses the run. Escape closes a panel or pauses. Each level has its own timer: 60 seconds for level 1, 120 seconds for level 2, and 180 seconds for levels 3 to 5. When time runs out, the run ends and you can retry that level.

The first briefing tells you what to repair. At a machine, read the GOAL before editing the Python starter. The checker reports syntax and goal problems. A successful program restores that machine, closes the editor, and sends you back to the ship so you can find the next one.

## Code layout

It is mostly plain JavaScript split into game logic, ship data, drawing, and UI, with `src/main.js` wiring those pieces together. I kept the map and machine data separate from the renderer so I can move things around without rewriting the game loop.

## Current scope

Right now it is an exploration slice with five levels, timed machine challenges, and a small static checker; audio, touch controls, and a full Python runtime are still out of scope.
