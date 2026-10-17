# Development log

Date: 2026-10-14 (America/Toronto). Effort estimates below are approximate active session time, separate from the 120-hour planning budget. No historical project time is assumed.

## Checkpoint 1 — inspection and setup (complete; ~5 minutes)

- Inspected `/home/bhuvaneshnallapati/fallship`: empty directory; no Git repository, source, configuration, or local instructions.
- Node 24.21.0 and npm 11.19.0 available. No system Chromium executable found.
- VS Code integrated-terminal control is unavailable through the attached tools. User explicitly approved using the attached terminal in the same directory. Added VS Code tasks for future local use.
- Chose native Canvas/ES modules with no runtime dependencies. Two development dependencies: Vite and Playwright, pinned from the npm registry.
- Created the 12-week/120-hour plan and an initial smoke entry point.
- Validation: dependency installation, JavaScript syntax check, initial smoke test, and Vite production build passed. npm reported no known dependency vulnerabilities at installation.
- Next: pure simulation and deterministic tests; do not start later game systems.

## Checkpoint 2 — pure simulation (complete; ~4 minutes)

- Added a validated five-area authored ship, Morrow the zombie alien, six solid placeholder objects, and an unobstructed spawn.
- Added normalized movement, axis-separated collision with two-pixel substeps, camera clamping, interaction range/line-of-sight, and a fixed 60 Hz clock with capped catch-up.
- All 13 deterministic tests passed. They cover map connectivity, object placement, collisions, interaction selection, menu/inspection freezing, camera edges and frame-rate independence.
- Review decision: keep gameplay state independent of the DOM; inspection records only which placeholders were viewed, without changing ship systems.
- Next: keyboard adapter and procedural pixel renderer; then actual browser verification.

## Checkpoint 3 — input and rendering (complete; ~7 minutes)

- Added edge-triggered keyboard actions, WASD/arrows, opposite-key cancellation, and input clearing on focus loss.
- Added cached 16-pixel ship tiles, original procedural pixel sprites, depth ordering, interaction outlines, star field and a camera-aware minimap renderer.
- All 15 unit tests, syntax checks, and production build passed.
- Opened the development server in the browser. Visually verified the ship, player, floor markings, and interaction indicator; browser reported no warnings/errors. Movement will receive measurable assertions once the HUD is connected.
- Next: DOM menus, HUD and inspection wiring, then end-to-end regression tests.

## Checkpoint 4 — menus, HUD and interactions (complete; ~8 minutes)

- Added native modal title/pause/inspection menus which work in a retro style, keyboard focus handling, reset-to-title, an actual position/session HUD, object count, field notes and a camera-aware deck schematic.
- Added responsive layout, integer canvas scaling, visible keyboard help, and a clear mobile keyboard requirement.
- Connected Morrow’s introductory inspection and all six placeholder inspections. Inspections do not mutate ship power, repair, inventory or campaign state.
- Re-ran syntax checks, 15 unit tests, and build successfully. Observed movement changing HUD coordinates in the local browser.
- Review found a reset-during-update clock bug and a misleading interactive wordmark label. Both fixed before final verification; added a clock regression.

## Checkpoint 5 — regression, visual QA and handoff (complete; ~13 minutes)

- Added a collision-aware route test proving every object is reachable, beyond plain tile connectivity.
- Added five production-browser tests: keyboard title/focus/pixels; wall/doorway/camera; inspection/repeat/freeze; pause/blur/resume/reset; narrow layout.
- Result: 17 unit tests and all five Chromium tests passed. Production build succeeded. No browser exceptions, console errors or failed HTTP responses in tested paths.
- Original browser download included an unused headless-shell variant; the documented install command now requests only the Chromium channel needed by the suite. Dependencies and browser cache remain project-local.
- Visually inspected desktop layout and console inspection, and saved screenshots. Added README, architecture contracts, explicit verification limits and the full file map.
- Final pass after source cleanup: syntax check, 17 unit tests, production build, and five browser tests passed (10.5 seconds for browser tests). Inspected the 360-pixel layout visually and saved the narrow capture. Full-page capture was intermittently unavailable in the browser tool; viewport captures succeeded for inspection and narrow views.
- Shutdown log inspection then exposed a development-only ResizeObserver notification loop during viewport changes. Reopened verification: scheduled dimension writes for the next frame, ignored height-only callbacks, and added repeated viewport changes to the browser regression. Final revalidation recorded below.
- See `VERIFICATION.md` for evidence and known limits. No foundation blocker found. Browser compatibility outside Chromium remains unverified; touch/gamepad, save data and later gameplay systems remain outside this milestone.
- Next recommended task: user playtest of movement/rooms/inspection feedback, then specify one small programming interaction. Implementation stops at the foundation.

Approximate total active session effort: 37 minutes, including review and verification; rounded estimates are not a claim that the planned 20-hour foundation allocation has been exhausted. The 12-week/120-hour plan includes human review, iteration and future work.
