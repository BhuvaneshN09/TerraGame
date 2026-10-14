# DEAD CIRCUIT — 120-hour development plan

Twelve weeks at ten hours per week. These are planning allocations, not a claim of hours already worked. Advance only after the previous checkpoint passes. Reallocate later scope rather than skipping validation.

| Week | Hours | Deliverable and acceptance gate |
| --- | ---: | --- |
| 1 | 10 | Foundation: setup, fixed-step loop, input, movement, tilemap, collision. Deterministic core tests pass. |
| 2 | 10 | Foundation: pixel rendering, camera, placeholder inspection, menus/HUD, browser checks and documentation. Stop for review. |
| 3 | 10 | Design and prototype one small programming interaction, after foundation approval. Specify syntax and feedback first. |
| 4 | 10 | Minimal interpreter/virtual CPU with limits and isolated tests; scope agreed before implementation. |
| 5 | 10 | Connect one repair to that programming interaction; build one complete vertical slice. |
| 6 | 10 | Improve that slice through playtesting, onboarding, and failure/retry feedback. |
| 7 | 10 | Design bounded progression and save format; test state migration and reset. |
| 8 | 10 | Add a small set of ship encounters using existing systems. |
| 9 | 10 | Campaign structure and narrative only within the remaining content budget. |
| 10 | 10 | Visual/audio polish, accessibility, and input usability. |
| 11 | 10 | Performance, browser compatibility, regression and usability testing. |
| 12 | 10 | Fixes, release documentation, packaging and contingency. |
| **Total** | **120** | **Foundation now; later milestones require separate work.** |

## Current implementation sequence

1. Inspect environment and establish project scripts, VS Code tasks, and this log.
2. Implement pure simulation: map data, fixed-step timing, normalized movement, collisions, camera, interaction selection. Unit test before rendering.
3. Add procedural pixel art, follow camera, and a readable spaceship environment. Build and inspect the browser.
4. Connect input, accessible DOM menus/HUD, pause, and placeholder object inspection. Test focus and key transitions.
5. Run browser regressions and production build; review source; document evidence, limitations, and next task. Stop.

## Technical decisions

- Native Canvas 2D, JavaScript ES modules, and DOM UI. No runtime dependencies or game engine.
- Vite is development/build tooling; Playwright is browser test tooling; Node's built-in runner covers pure logic.
- A 480 × 288 logical viewport, 16-pixel tiles, and integer CSS scaling where space permits keep pixels crisp. Small viewports may downscale.
- A 60 Hz fixed simulation step with capped catch-up decouples gameplay from display refresh rate.
- Physics and map coordinates stay in world pixels; rendering alone rounds to screen pixels.
- Solid tiles and object rectangles share collision rules. Placeholder inspection never changes ship systems.
- All source/assets/tests/docs stay in this workspace. No deployment, account integration, programming system, virtual CPU, campaign, or repair implementation in this milestone.

## Foundation acceptance gate

Start → move → hit walls/objects → cross rooms with camera tracking → inspect a nearby object → close → pause/resume → return to title. Check that lost focus clears input and pauses. Verify the built application in Chromium, responsive layout, and no browser errors. Record exactly what passed, not inferred compatibility.
