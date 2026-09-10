import { test, expect } from '@playwright/test';

test('renders the shrine with time controls and completes grounded sweep / jump cycles', async ({ page }) => {
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
 await page.goto('http://localhost:5173');
 await page.waitForFunction(() => window.__shrine?.renderer.info.render.calls > 0);
 await expect(page.locator('canvas')).toHaveCount(1);
 await expect(page.locator('button')).toHaveCount(3);
 await expect(page.locator('input, nav, header')).toHaveCount(0);
 const initial = await page.evaluate(() => window.__shrine.camera.position.toArray());
 await page.mouse.move(710, 450); await page.mouse.down(); await page.mouse.move(940, 520, { steps: 12 }); await page.mouse.up();
 await page.waitForTimeout(400);
 const rotated = await page.evaluate(() => window.__shrine.camera.position.toArray());
 expect(rotated).not.toEqual(initial);
 const d1 = await page.evaluate(() => window.__shrine.camera.position.distanceTo(window.__shrine.controls.target));
 await page.mouse.wheel(0, -250); await page.waitForTimeout(400);
 const d2 = await page.evaluate(() => window.__shrine.camera.position.distanceTo(window.__shrine.controls.target));
 expect(d2).toBeLessThan(d1);
 const result = await page.evaluate(() => {
  const { reimu } = window.__shrine, phases = new Set(), directions = new Set(), locations = new Set();
  let maxHeight = 0, groundError = 0, minOpacity = 1, maxScale = 0;
  for (let i = 0; i < 1100; i++) {
   reimu.update(.04, i * .04);
   const s = reimu.state;
   phases.add(s.phase); directions.add(s.direction); locations.add(`${s.x.toFixed(1)},${s.z.toFixed(1)}`);
   maxHeight = Math.max(maxHeight, s.height);
   if (s.phase !== 'jump') groundError = Math.max(groundError, Math.abs(s.footY - s.floor));
   minOpacity = Math.min(minOpacity, reimu.shadow.material.opacity); maxScale = Math.max(maxScale, reimu.shadow.scale.x);
  }
  return { phases: [...phases], directions: [...directions], locations: locations.size, maxHeight, groundError, minOpacity, maxScale, hops: reimu.state.hops, petalsMoved: reimu.state.petalsMoved };
 });
 expect(result.phases.sort()).toEqual(['anticipation', 'jump', 'landing', 'pause', 'sweep']);
 expect(result.directions.sort()).toEqual([-1, 1]);
 expect(result.hops).toBeGreaterThanOrEqual(5);
 expect(result.locations).toBeGreaterThan(20);
 expect(result.maxHeight).toBeGreaterThan(.45);
 expect(result.groundError).toBeLessThan(.001);
 expect(result.minOpacity).toBeLessThan(.35);
 expect(result.maxScale).toBeGreaterThan(1.4);
 expect(result.petalsMoved).toBeGreaterThan(0);
 expect(errors).toEqual([]);
 await page.getByRole('button', { name: '夜晚', exact: true }).click();
 await expect(page.getByRole('button', { name: '夜晚', exact: true })).toHaveAttribute('aria-pressed','true');
 await page.waitForFunction(() => window.__shrine.atmosphere.night > .95);
 expect(await page.evaluate(() => window.__shrine.atmosphere.lightPower)).toBeGreaterThan(40);
 await page.getByRole('button', { name: '白昼', exact: true }).click();
 await page.waitForFunction(() => window.__shrine.atmosphere.night < .05);
 await page.getByRole('button', { name: '昼夜流转', exact: true }).click();
 expect(await page.evaluate(() => window.__shrine.atmosphere.mode)).toBe('cycle');
 await page.setViewportSize({ width: 390, height: 844 });
 await page.waitForTimeout(300);
 expect(await page.evaluate(() => window.__shrine.camera.aspect)).toBeCloseTo(390 / 844);
 expect(await page.locator('canvas').evaluate(c => c.clientWidth)).toBe(390);
});
