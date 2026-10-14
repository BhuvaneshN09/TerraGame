import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const args = process.argv[2] === 'install' ? ['install', '--no-shell', 'chromium'] : ['test', ...process.argv.slice(3)];
const result = spawnSync(process.execPath, [fileURLToPath(new URL('node_modules/@playwright/test/cli.js', root)), ...args], {
  cwd: fileURLToPath(root),
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: fileURLToPath(new URL('node_modules/.cache/ms-playwright', root)) },
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
