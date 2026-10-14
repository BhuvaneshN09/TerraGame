import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await check(path);
    else if (/\.m?js$/.test(path)) {
      const result = spawnSync(process.execPath, ['--check', path], { stdio: 'inherit' });
      if (result.status !== 0) process.exit(result.status ?? 1);
    }
  }
}
for (const directory of ['src', 'scripts', 'tests']) await check(directory);
console.log('JavaScript syntax checks passed.');
