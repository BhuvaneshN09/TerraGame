# Development log

Date: 2026-10-14 (America/Toronto). Effort estimates below are approximate active session time, separate from the 120-hour planning budget. No historical project time is assumed.

## Current project record — FALLSHIP foundation and first repair campaign

FALLSHIP started as an empty project and was built into a browser game foundation using native Canvas, ES modules, Vite, and Playwright. The ship is rendered as a crisp pixel environment with authored rooms, connected walkable tiles, collision-safe objects, a follow camera, a minimap, and a player who moves with WASD, arrow keys, and edge-triggered interaction input. Movement is normalized, collisions are resolved one axis at a time, focus loss clears held input, and the simulation uses a capped fixed-step clock so movement stays consistent across different frame rates.

The interface was shaped around the requested retro presentation. The local VT323 font is bundled in the project and used for the floor labels, canvas text, HUD, menus, briefings, buttons, inspection panels, repair editor, and mission table. The game fills the browser, keeps the ship visible behind the UI, places the deck map and mission table over the play view, and uses a black FALLSHIP title screen with a moving starfield and two randomized shooting stars per burst. The title, pause, help, briefing, inspection, repair, level-passed, and loading states all use the same pixel language. Starting a new game, continuing a save, or moving to the next level now shows a button-free loading screen: the FALLSHIP mark enters from above, settles in the center, fades, and hands control to Morrow’s briefing.

The first campaign now has five levels with six physical machines each. The opening mission is to meet Morrow near the spawn, read the repair briefing, use T for the centered ship overview, travel to each highlighted fault, and write a Python program at every machine. Every machine includes a visible `GOAL:` statement that explains the machine’s job, its input, and the exact result required. The challenge set progresses from a simple return-value correction through comparisons, boolean checks, an `if` block, `sum()` over a list, dictionary `.get()`, and list membership. Morrow’s idle hint appears once only when the player is not editing, and retry feedback gives a general retry message before a more specific hint after repeated failures. A successful run confirms the patch, says RESTORED, shows the level-passed panel and stars, and offers the next level.

Each repair run has its own time limit: 60 seconds for level 1, 120 seconds for level 2, and 180 seconds for levels 3 through 5. Star ratings are proportional to the active level’s limit. Harmless corner notices trigger across authored room corners, and the cargo-edge easter egg ejects the player back to spawn without changing progress. These interactions are isolated from the repair state so exploration surprises do not corrupt a run.

The current verification baseline is 32 deterministic unit tests, six Chromium browser tests, JavaScript syntax checks, a production Vite build, and `git diff --check`. The browser tests cover title focus and canvas pixels, movement through walls and doorways, inspection freezing and repeat input, pause and focus loss, the loading screen, responsive layout, and the absence of browser errors on those paths. The next recommended work is a visual pass on the five repair levels and then a deeper repair interaction layer with clearer test fixtures for each Python program.

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

## Checkpoint 26 — level loading transition (complete; ~8 minutes)

- Added a button-free full-screen FALLSHIP loading screen with the moving star background for new games, continued games, and each next-level transition.
- The mark fades out after the short loading beat, then the next Morrow briefing appears. Added a browser regression for the no-button loading state.
- Validation: syntax checks, 24 unit tests, six Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 27 — centered loading logo (complete; ~3 minutes)

- Updated the loading animation so the FALLSHIP mark enters from above and settles in the center before the next briefing appears.
- Validation: syntax checks, 24 unit tests, six Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 28 — contextual progressive repair puzzles (complete; ~10 minutes)

- Added a clear `GOAL:` explanation to every repair machine, including the input reading and the exact ship outcome expected from the patch.
- Reworked later repairs to introduce `if` blocks, list processing with `sum`, dictionary `.get`, and list membership alongside the earlier comparisons, with difficulty increasing by level.
- Validation: syntax checks, 25 unit tests, six Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 29 — level-specific repair timers (complete; ~4 minutes)

- Set repair runs to 60 seconds for level 1, 120 seconds for level 2, and 180 seconds for levels 3 through 5.
- Kept the star rating proportional to each level's own time limit, so shorter early levels can still earn three stars.
- Validation: syntax checks, 26 unit tests, six Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 30 — working-tree regression repair (complete; ~5 minutes)

- Fixed the invalid CSS token that stopped Vite builds.
- Restored the verified retro font stack, readable interaction marker, pixel focus color, and title controls text after auditing uncommitted regressions.
- Validation: syntax checks, 26 unit tests, six Chromium browser tests, `git diff --check`, and the production build passed.

## Checkpoint 31 — five level maps and program challenges (complete; ~35 minutes)

- Added five authored map variants with different connected annexes and corridors, one unique palette per level, and a level-specific machine console placed on the matching map area.
- Replaced the old exact-answer repair patches with 15 program-writing challenges based on access control, loops, sensor scans, dictionaries, string decoding, command processing, and ship-state decisions.
- Added a small in-browser Python-shaped compiler and test checker. It reports bracket and indentation errors, checks the required structures for the current goal, and gives compile/test feedback instead of comparing against one hidden answer.
- Expanded the repair panel with a direct prompt, starter code, larger editor, and visible `COMPILE + TEST CHECKER` label.
- Added unit coverage for distinct maps, level palettes, console placement, challenge variety, compiler diagnostics, and the existing movement/interaction contracts.
- Validation: syntax checks, 30 unit tests, six Chromium browser tests, `git diff --check`, and the production build passed.

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
## Checkpoint 32 — six-machine level maps and centered fault overview (complete; ~25 minutes)

- Replaced the old single junction repair object with six physical machine objects in every level. Each machine has its own position, fault description, goal, starter program, and checker requirements; solving one machine closes its panel and sends the player back to exploration so the next machine must be reached in the world.
- Added a fifth-level-safe set of machine positions across the five connected map variants, including an expanded branch per level and distinct palette treatment. The minimap now marks unrepaired machines as FAULT markers and muted markers after repair.
- Added a centered, enlarged ship overview opened with T or t. It shows the full map, player marker, camera window, room labels, and highlighted unrepaired machines. Morrow’s briefing explains this route before each level.
- Removed the visible FALLSHIP viewport strip while retaining compact pause, menu, and help controls. Enlarged the overlaid minimap and mission table typography so the side boxes remain readable over the playfield.
- Added the lights and coolant checker requirements, migrated tests from the junction assumption to physical machines, and added an input regression for the T map action.
- Validation: JavaScript syntax checks, 31 unit tests, six Chromium browser tests, `git diff --check`, and the production build passed. The local browser was visually checked at the title screen, full HUD, centered T-map, and a physical machine code prompt.
