import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { rename, mkdir } from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:960,height:800},recordVideo:{dir:resolve('test-results/motion-video'),size:{width:960,height:800}}});
const page=await context.newPage();
await page.goto('http://localhost:5173');
await page.waitForFunction(()=>window.__shrine?.reimu);
await page.evaluate(()=>{
 const s=window.__shrine;s.camera.position.set(2.6,4.6,11);s.controls.target.set(.2,.95,2.7);s.controls.update();
});
await page.waitForTimeout(17500);
const video=page.video();await context.close();await browser.close();
await mkdir('previews',{recursive:true});await rename(await video.path(),resolve('previews/reimu-motion.webm'));
console.log('Saved previews/reimu-motion.webm');
