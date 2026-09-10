import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

test('double-click HTML works through file:// with networking disabled', async ({ page, context }) => {
 const errors = [], network = [];
 page.on('pageerror', e => errors.push(e.message));
 page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
 page.on('request', r => { if (/^https?:/.test(r.url())) network.push(r.url()); });
 await context.setOffline(true);
 await page.goto(pathToFileURL(resolve('offline/双击打开博丽神社.html')).href);
 await page.waitForFunction(() => window.__shrine?.renderer.info.render.calls > 0);
 await expect(page.locator('canvas')).toHaveCount(1);
 const before = await page.evaluate(() => window.__shrine.camera.position.toArray());
 await page.mouse.move(700, 400); await page.mouse.down(); await page.mouse.move(850, 450, { steps: 8 }); await page.mouse.up();
 await page.waitForTimeout(250);
 expect(await page.evaluate(() => window.__shrine.camera.position.toArray())).not.toEqual(before);
 const result = await page.evaluate(() => {
  const { reimu, understory } = window.__shrine;
  for (let i = 0; i < 480; i++) reimu.update(.04, i * .04);
  const pixels = reimu.atlas.getContext('2d').getImageData(0,0,160,208).data;
  let visible = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) visible++;
  return { visible, hops: reimu.state.hops, blades: understory.stats.blades };
 });
 expect(result.visible).toBeGreaterThan(3000);
 expect(result.hops).toBeGreaterThanOrEqual(2);
 expect(result.blades).toBeGreaterThan(20000);
 await page.getByRole('button', { name: '夜晚', exact: true }).click();
 await page.waitForFunction(() => window.__shrine.atmosphere.night > .95);
 expect(await page.evaluate(() => window.__shrine.atmosphere.lightPower)).toBeGreaterThan(40);
 expect(network).toEqual([]);
 expect(errors).toEqual([]);
});
