import { test, expect } from '@playwright/test';

test('uses distinct sweep poses, deliberate contact and a gradual turn', async ({page})=>{
 await page.goto('http://localhost:5173');
 await page.waitForFunction(()=>window.__shrine?.reimu);
 const result=await page.evaluate(()=>{
  const r=window.__shrine.reimu,stages=new Set();let movingInAir=0,contactMoves=0,turnSamples=0,frames=new Set();
  const a=r.atlas.getContext('2d').getImageData(272,0,272,208).data;
  const b=r.atlas.getContext('2d').getImageData(4*272,0,272,208).data;
  let changed=0,opaque=0;
  for(let i=0;i<a.length;i+=4){if(a[i+3]||b[i+3]){opaque++;if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+3]!==b[i+3])changed++;}}
  for(let i=0;i<500;i++){
   const before=r.state.petalsMoved;r.update(.025,i*.025);stages.add(r.state.subphase);frames.add(r.state.frame);
   const diff=r.state.petalsMoved-before;
   if(!r.state.brushContact)movingInAir+=diff;else contactMoves+=diff;
   if(r.state.turning)turnSamples++;
  }
  return{stages:[...stages],movingInAir,contactMoves,turnSamples,frameCount:frames.size,changedFraction:changed/opaque};
 });
 expect(result.stages).toEqual(expect.arrayContaining(['reach','plant','pull','follow-through','lift','turn','crouch','airborne','absorb','rise']));
 expect(result.changedFraction).toBeGreaterThan(.25);
 expect(result.movingInAir).toBe(0);
 expect(result.contactMoves).toBeGreaterThan(0);
 expect(result.turnSamples).toBeGreaterThan(5);
 expect(result.frameCount).toBe(12);
});
