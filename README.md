# FALLSHIP

A local browser game foundation: explore the derelict USS Meridian as an engineer, meet Morrow the stranded zombie alien, and inspect six placeholder systems. This milestone includes movement, collisions, camera, pixel rendering, menus, mission HUD, and harmless corner/ejection easter eggs. It does **not** include programming, a virtual CPU, campaign, repair simulation, inventory, audio, or saved progress.

## Run in the existing VS Code workspace

Requirements: Node.js 22.12 or newer and npm. This workspace was verified with Node 24.21.0 and npm 11.19.0.

```sh
npm ci
npm run dev
```

Open the printed local address (normally `http://127.0.0.1:5173`). VS Code's **Terminal → Run Task** also exposes develop, check, browser test, and build tasks from `.vscode/tasks.json`. Development stays in this directory. No environment variables, account, backend, or external assets are required.

```sh
npm run check                 # Syntax checks, 17 unit tests, production build
npm run test:browser:install  # One-time Chromium download inside node_modules
npm run test:browser          # Build, then 5 Chromium tests against the production output
npm run preview              # Serve the built dist/ directory locally
```

The browser suite owns port 4173 and stops its preview server when finished. Close any other process on that port before running it. Vite development runs separately on port 5173 by default. Browser binaries are stored inside this project at `node_modules/.cache/ms-playwright`; no system browser installation is required. A host still needs the usual Chromium system libraries.

## Controls

| Action | Input |
| --- | --- |
| Move | WASD or arrow keys; diagonal movement is normalized |
| Inspect highlighted nearby object | E or the Inspect button |
| Close inspection | E, Escape, or Back to exploration |
| Pause / resume | Escape, or the pause/resume buttons |
| Start and navigate menus | Tab / Shift+Tab and Enter, or mouse |
| Reset session | Pause → Return to title → Begin exploration |

Focus loss or a hidden page pauses active exploration and clears input. Start/resume returns focus to the canvas. Native modal dialogs contain menu focus. No key should remain held after a transition. Session time, position, location, inspected-object count, and the minimap come from current game state. Ship status descriptions are placeholders.

## Structure and extension points

| Files | Responsibility |
| --- | --- |
| `index.html`, `src/main.js` | HTML entry and composition of simulation, input, rendering, and UI |
| `src/world/ship.js` | Validated authored map, room names, spawn, Morrow, and six placeholder objects |
| `src/world/collision.js` | Player bounds, tile/object collision, normalization, substepped sliding |
| `src/game/simulation.js` | Game state, movement update, inspection transitions |
| `src/game/input.js` | Held keys, edge-triggered actions, DOM listeners and focus cleanup |
| `src/game/loop.js` | Fixed 60 Hz simulation, capped catch-up and lifecycle |
| `src/game/camera.js`, `src/game/interactions.js` | Camera clamping and reachable-object selection |
| `src/render/environment.js` | Cached, original procedural pixel tile art and floor markings |
| `src/render/sprites.js` | Player and placeholder object pixel sprites |
| `src/render/renderer.js` | Camera transform, depth ordering, interaction indicator and minimap |
| `src/ui/interface.js`, `src/ui/dialog.css`, `src/style.css` | Accessible HTML menus, HUD and responsive layout |
| `tests/unit/game.test.js`, `input.test.js`, `world.test.js` | Pure game and input regressions |
| `tests/browser/foundation.spec.js`, `playwright.config.js` | Production-browser journey and rendering checks |
| `scripts/check.mjs`, `scripts/browser.mjs` | Local verification and project-local browser cache |
| `package.json`, `package-lock.json`, `.gitignore`, `.vscode/tasks.json` | Reproducible tooling and VS Code tasks |
| `docs/PLAN.md`, `docs/DEVELOPMENT_LOG.md`, `docs/VERIFICATION.md` | 120-hour plan, development record and evidence |
| `docs/screenshots/` | Captures from browser visual inspection |

There are **no runtime dependencies**. Vite provides development and production builds. Playwright provides browser testing; Node's built-in test runner handles pure logic. No external art or fonts are downloaded at runtime. `dist/`, test artifacts, browser binaries, and dependencies are generated and ignored.

## Architecture contracts

- Map tiles are 16 world pixels. `.` is floor, `D` is a passable threshold, `#` is hull, and space is solid void. Out-of-bounds space is solid.
- Player coordinates represent the center of a 10×10 collision footprint. Sprites extend upward from that footprint. Physics retains subpixel precision; rendering rounds both camera and sprite coordinates.
- The logical viewport is 480×288. Display scaling uses whole multiples when possible, with downscaling for smaller screens and letterboxing between integer sizes.
- Rendering uses `requestAnimationFrame`; simulation advances in fixed 1/60-second steps. At most eight steps run after a delayed frame. Hidden-page time is discarded rather than simulated on resume.
- Map/background drawing is cached. Sprites are sorted by their feet/bottom edge. Graphics never determine collision geometry.
- `title`, `playing`, `paused`, and `inspecting` are explicit modes. Only `playing` advances movement and session time.
- An object is selectable within 30 pixels of its bounds, with a clear tile line of sight. Ties resolve in authored object order. `inspected` is an in-memory set for HUD observations only.
- To add a room, edit authored rectangles and thresholds in `ship.js`; run map and collision-aware reachability tests. To add an object, add its bounds/text and sprite kind, then validate spawn and reachable interaction. If the number of objects changes, also update the HUD's six progress segments.
- Keep future interpreter/repair modules separate from the renderer and input adapter. Do not add those systems until their milestone is explicitly started.

## Verification and current limits

The production build, 17 unit tests, and five Chromium browser tests passed on 2026-10-14. See [the verification record](docs/VERIFICATION.md) for the exact scope and screenshots, and [the development log](docs/DEVELOPMENT_LOG.md) for issues fixed.

Keyboard and mouse are supported; touch and gamepad controls are not implemented. Layout is responsive, but mobile exploration still requires a keyboard. Only Chromium was browser-tested; Firefox and Safari compatibility is unverified. The canvas game is visual; text menus and HUD improve access but do not constitute a fully screen-reader-playable game. There is no persistent save data. No Git repository existed in the supplied directory, and this work did not create commits.

The foundation milestone ends here. The recommended next task is a short user playtest of navigation, collision feel, camera readability, and interaction feedback, followed by a small programming-interaction design specification. The [12-week plan](docs/PLAN.md) reserves later implementation separately.
