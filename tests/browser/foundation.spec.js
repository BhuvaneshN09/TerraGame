import { test, expect } from '@playwright/test';

let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('/');
});
test.afterEach(() => expect(errors).toEqual([]));

async function start(page) {
  await page.getByRole('button', { name: 'Begin exploration' }).click();
  await expect(page.locator('#game')).toHaveAttribute('data-mode', 'playing');
}
async function position(page) {
  const value = await page.locator('#position').textContent();
  const [x, y] = value.match(/\d+/g).map(Number);
  return { x, y };
}
async function hold(page, key, milliseconds) {
  await page.keyboard.down(key);
  await page.waitForTimeout(milliseconds); // Real elapsed simulation time is the behavior under test.
  await page.keyboard.up(key);
}

test('title is keyboard accessible; rendered canvas is crisp and nonempty', async ({ page }) => {
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Begin exploration' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#game')).toBeFocused();
  const canvas = await page.locator('#game').evaluate(element => {
    const ctx = element.getContext('2d');
    const pixels = ctx.getImageData(0, 0, element.width, element.height).data;
    const colors = new Set();
    for (let i = 0; i < pixels.length; i += 4) colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
    return { width: element.width, height: element.height, smoothing: ctx.imageSmoothingEnabled, css: getComputedStyle(element).imageRendering, colors: colors.size };
  });
  expect(canvas).toMatchObject({ width: 480, height: 288, smoothing: false, css: 'pixelated' });
  expect(canvas.colors).toBeGreaterThan(25);
});

test('movement hits a wall, crosses a doorway, and keeps the follow camera centered', async ({ page }) => {
  await start(page);
  await hold(page, 'd', 900);
  const wall = await position(page);
  expect(wall.x).toBeGreaterThan(515);
  expect(wall.x).toBeLessThanOrEqual(523);
  expect(wall.y).toBe(360);
  await hold(page, 'w', 400);
  await hold(page, 'd', 950);
  await expect(page.locator('#room')).toHaveText('Engineering');
  expect((await position(page)).x).toBeGreaterThan(560);
  const playerPixels = await page.locator('#game').evaluate(element => {
    const data = element.getContext('2d').getImageData(0, 0, 480, 288).data;
    const xs = [];
    for (let y = 0; y < 288; y++) for (let x = 0; x < 480; x++) {
      const i = (y * 480 + x) * 4;
      if (data[i] === 206 && data[i + 1] === 140 && data[i + 2] === 88) xs.push(x);
    }
    return xs;
  });
  expect(playerPixels.length).toBeGreaterThan(0);
  expect(Math.min(...playerPixels)).toBeGreaterThanOrEqual(235);
  expect(Math.max(...playerPixels)).toBeLessThanOrEqual(245);
});

test('inspection is edge-triggered, freezes movement, and records one observation', async ({ page }) => {
  await start(page);
  const before = await position(page);
  await page.keyboard.down('e');
  await expect(page.getByRole('heading', { name: 'Junction console' })).toBeVisible();
  await page.keyboard.down('e'); // A repeat must not immediately close the panel.
  await hold(page, 's', 200);
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await position(page)).toEqual(before);
  await page.keyboard.up('e');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#inspection-count')).toHaveText('1 / 7');
  await page.getByRole('button', { name: 'E INSPECT' }).click();
  await expect(page.getByRole('heading', { name: 'Junction console' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to exploration' }).click();
  await expect(page.locator('#inspection-count')).toHaveText('1 / 7');
});

test('pause, focus loss, resume, and return to title never retain movement', async ({ page }) => {
  await start(page);
  await page.keyboard.down('s');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible();
  const paused = await position(page);
  await page.waitForTimeout(200);
  expect(await position(page)).toEqual(paused);
  await page.getByRole('button', { name: 'Resume exploration' }).click();
  await page.waitForTimeout(200);
  expect(await position(page)).toEqual(paused);
  await page.keyboard.up('s');
  await page.keyboard.down('a');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('#game')).toHaveAttribute('data-mode', 'paused');
  await page.keyboard.up('a');
  await page.keyboard.press('Escape');
  await expect(page.locator('#game')).toHaveAttribute('data-mode', 'playing');
  await page.getByRole('button', { name: 'Pause game' }).click();
  await page.getByRole('button', { name: 'Return to title' }).click();
  await start(page);
  expect(await position(page)).toEqual({ x: 488, y: 360 });
  await expect(page.locator('#inspection-count')).toHaveText('0 / 7');
});

test('small viewports keep menus and game within the page and explain keyboard requirement', async ({ page }) => {
  for (const width of [1024, 1440, 768, 360, 1440]) {
    await page.setViewportSize({ width, height: 740 });
    // Allow ResizeObserver and its queued frame to finish before the next resize.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 360, height: 740 });
  await expect(page.getByRole('button', { name: 'Begin exploration' })).toBeInViewport();
  await start(page);
  await expect(page.locator('.mission-table')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const bounds = await page.locator('#game').boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(360);
  expect(bounds.width).toBeGreaterThan(350);
});
