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

## Checkpoint 6 — unified floor-label typography (complete; ~4 minutes)

- Replaced the remaining legacy Arial and generic system font declarations with the same Courier/Lucida terminal stack used by the painted floor labels.
- Updated canvas room labels, floor markings, and interaction markers so rendered text follows the same retro face as menus, HUD text, dialogs, and code entry.
- Validation: 21 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 10 — one-shot repair help and unique level puzzles (complete; ~8 minutes)

- Added a one-time Morrow message after ten seconds of inactivity in a junction repair screen. It returns the player to the same patch without changing the timer or code.
- Replaced repeated machine definitions with unique puzzle sets for every level. Levels now contain 1, 2, 3, 4, and 5 distinct machines, and the lights spelling puzzle exists only in level 1.
- Added deterministic tests for the ten-second hint and unique level puzzle progression.
- Validation: 23 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 12 — repair activity guard (complete; ~4 minutes)

- Morrow's ten-second repair message now waits for an untouched patch. Focusing or editing the code editor marks the challenge as active and prevents the message from interrupting the attempt.
- Added a regression test covering active code entry and revalidated the existing one-shot idle hint.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 22 — removed title character (complete; ~3 minutes)

- Removed the decorative player canvas, gravity loop, animation styles, and title-only sprite import from the menu. The black starfield remains, and the gameplay player is unchanged.
- Validation: syntax checks, 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 23 — random title shooting stars (complete; ~5 minutes)

- Added a title-only shooting-star spawner that fires one streak every two seconds with random position, direction, distance, and flight time. Each streak cleans itself up, and the timer stops when the menu closes.
- Validation: syntax checks, 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 24 — populated shooting-star field (complete; ~5 minutes)

- Expanded title shooting stars to randomized bursts of two streaks, with positions and directions spread across the full menu screen.
- Validation: syntax checks, 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 25 — restrained shooting-star pair (complete; ~3 minutes)

- Reduced each title burst to two randomized shooting stars so the black menu stays clear while the animation still crosses the full screen.
- Validation: syntax checks, 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 20 — gravity title motion (complete; ~5 minutes)

- Replaced the scripted corner loop with a small title-only physics loop. The player has horizontal velocity, gravity, wall and ceiling collisions, floor rebounds, and impact damping, so it bounces freely inside the menu.
- The animation stops when the title closes and cannot affect gameplay state.
- Validation: syntax checks, 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 21 — top-edge launch and deflection (complete; ~2 minutes)

- Started the title physics at the top edge with a downward launch velocity and horizontal drift, making the gravity fall and boundary deflections immediately visible.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 19 — ball-style title bounce (complete; ~3 minutes)

- Changed the bounded corner path to linear DVD-style travel with a brief squash at each impact, including the loop’s top-left rebound.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 18 — bounded DVD-style character motion (complete; ~3 minutes)

- Constrained the title character to the dialog’s actual rectangle so it reaches each corner without negative offsets, clipping, or rotation outside the screen bounds.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 16 — title character drift (complete; ~5 minutes)

- Added the player’s pixel sprite to the title menu and animated it slowly through uneven corner positions with small rotations, giving the black starfield a floating character without changing gameplay.
- Validation: syntax checks, 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 17 — corner-to-corner title path (complete; ~2 minutes)

- Adjusted the title character’s animation coordinates to account for its transparent sprite padding, so the visible player reaches all four screen corners.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 15 — seamless varied starfield (complete; ~4 minutes)

- Reworked the title star animation to move repeating background tiles by exact cycle lengths, removing the visible loop break.
- Added varied round and stretched star shapes across two depth layers while keeping the title menu black and unobstructed.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 14 — animated title space (complete; ~4 minutes)

- Changed the title menu backdrop to black and added two subtle upward-moving star layers at different speeds. The menu remains centered above the animation with no ship artwork behind it.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 13 — interaction marker legibility (complete; ~3 minutes)

- Reworked the machine interaction marker into a 12px pixel badge with a centered 8px `E`, explicit text alignment, and a one-pixel inner border.
- Validation: 24 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 11 — canvas label clarity (complete; ~3 minutes)

- Increased painted room and floor label text from 8px to 10px and raised its contrast so the shared pixel font stays readable after the game canvas is enlarged.
- Validation: 23 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 9 — title screen cleanup (complete; ~5 minutes)

- Removed the circuit logo from the interface and replaced the browser icon with a blank data icon so no branded favicon is shown.
- Made the FALLSHIP title the dominant centered element and narrowed the menu controls with thin square pixel borders and centered labels.
- Validation: 21 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 8 — readable briefing scale (complete; ~4 minutes)

- Increased briefing, menu, inspection, repair labels, code entry, buttons, and dialog footnotes to roughly twice their previous size while preserving the bundled pixel face.
- Kept a smaller mobile heading override so the larger type does not push controls outside narrow screens.
- Validation: 21 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.
- Next recommended task: review the updated typography in the browser at desktop and narrow viewport sizes before adding another gameplay system.

## Checkpoint 7 — bundled pixel terminal face (complete; ~6 minutes)

- Added a local VT323 bitmap font and made it the shared `Fallship Pixel` face for menus, briefings, HUD text, dialogs, code entry, floor markings, and interaction labels.
- Font loading now completes before the canvas environment is painted, keeping canvas text and HTML text on the same face instead of relying on different browser fallbacks.
- Validation: 21 unit tests, five Chromium browser tests, `git diff --check`, and the production build passed.
