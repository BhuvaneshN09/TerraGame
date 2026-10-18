# Development log

## Current state

FALLSHIP is a browser game built with native Canvas, ES modules, Vite, and Playwright. The current playable slice has five connected ship maps, six physical machines per level, one to five active faults, Morrow’s briefing, a centered T-map, timed runs, collision, camera tracking, menus, and a small static Python checker. The bundled VT323 face is used for the canvas labels and DOM UI.

The project stays intentionally small: simulation rules live in `src/game/`, map and object data live in `src/world/`, drawing lives in `src/render/`, and panels live in `src/ui/`. The checker validates source shape and challenge requirements but never executes player code.

## Recent work

### Distinct level footprints

The five decks now have different floor silhouettes instead of sharing one outline with a color swap. The later maps branch into their own hooks, towers, side rooms, and wings, while the connectivity checks keep every machine reachable.

### Scaled repair lists

The player now repairs one fault on level 1, two on level 2, and so on through five on level 5. The other placed units stay on standby, and only active faults receive map markers or open the Python editor.

### Documentation tone cleanup

The README had started to read like a system overview. I shortened the code-layout and scope notes so they say what I actually need to remember when working on the game, without repeating the test and architecture details.

### Six-machine maps and map navigation

The old single junction repair object was removed. Each level now creates six physical machine objects from its level data, with only the level’s active faults requiring code. A faulty machine opens its own program panel when the player presses E, and solving one closes the panel and marks only that fault restored.

Morrow’s briefing names the repair list and explains T. The large map shows the full level, room labels, the player, the camera window, and orange markers for unrepaired machines. The side minimap and mission table use the same machine state.

### Timed-run expiry

The timer used to reach zero while the player could continue moving. The simulation now changes to `expired` at zero, freezes the player, and opens a retry panel. Retrying creates a clean state for the current level; returning to the title remains available.

## Verification record

The latest run passed `node scripts/check.mjs`, `npm test` with 33 unit tests, `npm run build`, `npm run test:browser` with 6 Chromium tests, and `git diff --check`. The browser was also inspected manually for the title, full HUD, centered map, and machine editor.

## Next step

Play all five levels from a clean save and record route or wording problems. After that, define the smallest safe programming model for the next repair mechanic before implementing it.
