import {test,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

for(const offline of [false,true])test(`${offline?'offline file':'web'} concert renders, animates and responds`,async({page,context})=>{
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 if(offline)await context.setOffline(true);
 await page.goto(offline?pathToFileURL(resolve('offline/双击打开初音星光演唱会.html')).href:'http://localhost:5174');
 await page.waitForFunction(()=>window.__concert?.renderer.info.render.calls>0);
 await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('button')).toHaveCount(4);
 expect(await page.evaluate(()=>window.__concert.music.enabled)).toBe(false);
 const initial=await page.evaluate(()=>window.__concert.camera.position.toArray());
 await page.mouse.move(620,430);await page.mouse.down();await page.mouse.move(800,470,{steps:8});await page.mouse.up();await page.waitForTimeout(200);
 expect(await page.evaluate(()=>window.__concert.camera.position.toArray())).not.toEqual(initial);
 const distance=await page.evaluate(()=>window.__concert.camera.position.distanceTo(window.__concert.controls.target));await page.mouse.wheel(0,-200);await page.waitForTimeout(250);
 expect(await page.evaluate(()=>window.__concert.camera.position.distanceTo(window.__concert.controls.target))).toBeLessThan(distance);
 const result=await page.evaluate(()=>{
  const c=window.__concert,p=c.performer,poses=new Set(),phases=new Set(),positions=new Set();let maxHop=0,maxGroundError=0,offstage=0;
  for(let i=0;i<3100;i++){
   const t=i*.04;p.update(.04,t,t*112/60,'encore');const s=p.state;poses.add(s.pose);phases.add(s.phase);positions.add(`${s.x.toFixed(1)},${s.z.toFixed(1)}`);maxHop=Math.max(maxHop,s.height);
   if(s.phase!=='walk'&&s.phase!=='hop')maxGroundError=Math.max(maxGroundError,Math.abs(s.footY-1.365));
   const stage=s.z<=-1.09&&s.z>=-6.45&&Math.abs(s.x)<=6.22,runway=s.z>=-1.38&&s.z<=3.39&&Math.abs(s.x)<=1.31,front=s.z>=2.94&&s.z<=4.86&&Math.abs(s.x)<=2.66;
   if(!stage&&!runway&&!front)offstage++;
  }
  const pixels=p.atlas.getContext('2d').getImageData(0,0,p.atlas.width,p.atlas.height).data;let green=0,opaque=0;
  for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]){opaque++;if(pixels[i+1]>145&&pixels[i+1]>pixels[i]*1.55&&pixels[i+1]>pixels[i+2]*1.4)green++;}
  return{poses:poses.size,phases:[...phases],positions:positions.size,maxHop,maxGroundError,offstage,green,opaque,audience:c.audience.count};
 });
 expect(result.poses).toBe(12);expect(result.phases).toEqual(expect.arrayContaining(['sing','hop','land','walk','wave','bow']));expect(result.positions).toBeGreaterThan(40);expect(result.maxHop).toBeGreaterThan(.28);expect(result.maxGroundError).toBeLessThan(.001);expect(result.offstage).toBe(0);expect(result.green).toBeLessThan(40);expect(result.opaque).toBeGreaterThan(60000);expect(result.audience).toBe(40);
 await page.getByRole('button',{name:'日间彩排',exact:true}).click();await page.waitForFunction(()=>window.__concert.show.night<.05);
 await page.getByRole('button',{name:'返场',exact:true}).click();await page.waitForFunction(()=>window.__concert.show.night>.95);expect(await page.evaluate(()=>window.__concert.show.mode)).toBe('encore');
 await page.getByRole('button',{name:'开启伴奏',exact:true}).click();expect(await page.evaluate(()=>window.__concert.music.enabled)).toBe(true);await page.getByRole('button',{name:'关闭伴奏',exact:true}).click();expect(await page.evaluate(()=>window.__concert.music.enabled)).toBe(false);
 await page.setViewportSize({width:390,height:844});await expect(page.getByRole('button',{name:'星光现场',exact:true})).toBeVisible();expect(await page.locator('canvas').evaluate(c=>c.clientWidth)).toBe(390);
 expect(errors).toEqual([]);if(offline)expect(requests).toEqual([]);
});
