import {chromium} from '@playwright/test';
import {resolve} from 'node:path';
import {rename,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1120,height:900},recordVideo:{dir:resolve('test-results/video'),size:{width:1120,height:900}}});
const page=await context.newPage();await page.goto('http://localhost:5174');await page.waitForFunction(()=>window.__concert?.performer);
await page.evaluate(()=>{const c=window.__concert;c.camera.position.set(13,10.6,18);c.controls.target.set(0,2.3,-.1);c.controls.update();});
await page.getByRole('button',{name:'返场',exact:true}).click();await page.waitForTimeout(26000);
const video=page.video();await context.close();await browser.close();await mkdir('previews',{recursive:true});await rename(await video.path(),resolve('previews/performance.webm'));console.log('Performance video saved.');
