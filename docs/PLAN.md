# FALLSHIP plan

The project has a 120-hour budget over twelve weeks. The first milestone is complete: the browser game has a stable loop, a playable ship, five maps, physical repair machines, and browser verification.

## Done

- Native Canvas rendering with the bundled pixel font.
- Fixed-step simulation, keyboard input, normalized movement, collision, camera following, and object inspection.
- Five connected maps with different shapes and palettes.
- Six machine challenges per level, map markers, timed runs, pause/retry states, and a small static Python checker.
- Title, loading, briefing, pause, inspection, map, and level-passed panels.
- Unit and Chromium browser tests.

## Next work

1. Playtest every level end to end and adjust machine positions, routes, and timer values.
2. Decide the smallest safe programming model for the next challenge set. Keep execution bounded and separate from the renderer.
3. Add one complete vertical slice of the next repair mechanic, then test it before adding more content.
4. Improve accessibility and input coverage, including touch or gamepad only if they fit the scope.
5. Profile the browser build and package a release after the gameplay loop is stable.

## Decisions

The game uses native Canvas and ES modules instead of a game engine. The simulation owns rules and state; the renderer only draws state; the DOM handles menus and text. A 480×288 logical view and 16-pixel tiles keep the art crisp. The current checker validates Python-shaped source and challenge requirements; it is not an interpreter and does not execute user code.

## Acceptance gate for the next milestone

A new mechanic should have a clear goal, a failure path, a reset path, one or two meaningful unit tests, a browser check, and a short entry in the development log. Keep future scope provisional until that gate passes.
