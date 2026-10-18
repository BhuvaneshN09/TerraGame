# FALLSHIP verification

Last verified: 2026-10-18 in `/home/bhuvaneshnallapati/fallship`.

## Commands

- `node scripts/check.mjs` passed JavaScript syntax checks.
- `npm test` passed 33 unit tests.
- `npm run build` passed and generated `dist/`.
- `npm run test:browser` passed 6 Chromium tests.
- `git diff --check` passed.

The browser suite checks the title and loading states, canvas pixel settings, movement into walls and Engineering, camera tracking, inspection repeat handling, pause and focus loss, return to title, and narrow viewport layout. The unit suite covers map validation and connectivity, machine placement, movement and collision, camera edges, fixed-step timing, input aliases and one-shot actions, inspection, timed-run expiry, compiler diagnostics, and the corner/ejection interactions.

A manual local-browser pass also checked the centered T map, the six orange fault markers, the overlaid mission table, the hidden viewport wordmark strip, and a physical machine code prompt.

## Limits

Firefox, Safari, touch, gamepad, full screen-reader gameplay, audio, deployment, and arbitrary Python execution were not verified. The Python checker is deliberately static so player code is never executed in the browser.

## Next check

Play all five levels from a clean save. Record any machine route that feels blocked or any challenge goal that is unclear before adding another system.
