import { createReimuAtlas } from './reimu-pose-atlas.js';
export async function createReimu({ THREE, root, camera, mat, heightAt, petals }) {
 const { canvas: atlas, width: W, height: H, frames, footInset } = await createReimuAtlas();
 const texture = new THREE.CanvasTexture(atlas); texture.colorSpace = THREE.SRGBColorSpace;
 texture.magFilter = texture.minFilter = THREE.NearestFilter; texture.generateMipmaps = false; texture.repeat.set(1 / frames, 1);
 const material = mat('#ffffff', { map: texture, alphaTest: .5, side: THREE.DoubleSide });
 const sprite = new THREE.Mesh(new THREE.PlaneGeometry(W / H * 2.0, 2.0), material);
 sprite.geometry.translate(0, 1.0, 0); sprite.castShadow = true; sprite.receiveShadow = true;
 sprite.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: texture, alphaTest: .5, side: THREE.DoubleSide });
 root.add(sprite);
 const c = document.createElement('canvas'); c.width = c.height = 64;
 const sc = c.getContext('2d'), gradient = sc.createRadialGradient(32, 32, 3, 32, 32, 31);
 gradient.addColorStop(0, 'rgba(59,48,42,.48)'); gradient.addColorStop(.5, 'rgba(59,48,42,.23)'); gradient.addColorStop(1, 'rgba(59,48,42,0)'); sc.fillStyle = gradient; sc.fillRect(0, 0, 64, 64);
 const shadow = new THREE.Mesh(new THREE.PlaneGeometry(.94, .66), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: .65 }));
 shadow.rotation.x = -Math.PI / 2; root.add(shadow);
 const spots = [[2.36, 3.12], [1.06, 2.55], [-.70, 2.92], [-2.6, 3.12], [-2.9, 4.23], [-.55, 3.72], [1.1, 3.75], [2.58, 4.18]];
 let spot = 0, time = 0, cycle = 0, direction = 1;
 const state = { phase: 'sweep', frame: 0, height: 0, direction: 1, x: spots[0][0], z: spots[0][1], hops: 0, petalsMoved: 0 };
 const setFrame = n => { texture.offset.x = n / frames; state.frame = n; };
 const smooth = x => x * x * (3 - 2 * x);
 const poseEnds=[.14,.30,.48,.64,.82,1.00,1.12,1.35];
 const subphases=['ready','reach','plant','pull','follow-through','lift','recover','settle'];
 function update(dt, elapsed) {
  time += dt;
  const duration = 8.8;
  while (time >= duration) { time -= duration; spot = (spot + 1) % spots.length; cycle++; state.hops++; }
  const from = spots[spot], to = spots[(spot + 1) % spots.length];
  const baseDirection=cycle%2?-1:1;direction=baseDirection;
  let x=from[0],z=from[1],h=0,sx=1,sy=1,turn=0,lean=0;
  Object.assign(state,{brushContact:false,turning:false,subphase:'rest'});
  if(time<5.4){
   const local=time%1.35,pose=poseEnds.findIndex(end=>local<end);
   state.phase='sweep';state.subphase=subphases[pose];setFrame(pose);
   sy=1+Math.sin(elapsed*2.2)*.003;
   lean=Math.sin(local/1.35*Math.PI*2)*.010;
   state.brushContact=local>=.30&&local<.82;
   const t=THREE.MathUtils.clamp((local-.48)/.34,0,1),offset=THREE.MathUtils.lerp(.90,-.72,smooth(t));
   const yaw=Math.atan2(camera.position.x-x,camera.position.z-z);
   const rx=Math.cos(yaw)*direction,rz=-Math.sin(yaw)*direction;
   const bx=x+rx*offset,bz=z+rz*offset;
   Object.assign(state,{brushX:bx,brushZ:bz,stroke:Math.floor(time/1.35)});
   if(state.brushContact&&local>=.48)for(const p of petals)if(Math.hypot(p.position.x-bx,p.position.z-bz)<.34){
    p.position.x=THREE.MathUtils.clamp(p.position.x-rx*dt*1.1,-7.15,7.15);
    p.position.z=THREE.MathUtils.clamp(p.position.z-rz*dt*1.1+dt*.08,-7.15,7.15);
    p.position.y=heightAt(p.position.x,p.position.z)+.012;p.rotation.z+=dt*2.4;state.petalsMoved++;
   }
  }else if(time<6.9){
   state.phase='pause';setFrame(8);sy=1+Math.sin(elapsed*2)*.004;
   const t=THREE.MathUtils.clamp((time-5.95)/.52,0,1);
   if(t>0&&t<1){state.turning=true;state.subphase='turn';turn=Math.PI*smooth(t);}
   else if(t===1)direction=-baseDirection;
  }else if(time<7.22){
   state.phase='anticipation';state.subphase='crouch';direction=-baseDirection;setFrame(9);
   const t=(time-6.9)/.32;sy=1-.014*Math.sin(t*Math.PI);sx=1+.012*t;
  }else if(time<8.03){
   state.phase='jump';state.subphase='airborne';direction=-baseDirection;setFrame(10);
   const t=(time-7.22)/.81;
   x=THREE.MathUtils.lerp(from[0],to[0],smooth(t));z=THREE.MathUtils.lerp(from[1],to[1],smooth(t));
   h=.48*4*t*(1-t);lean=Math.sin(t*Math.PI)*-.022;sy=1.008;
  }else{
   state.phase='landing';direction=-baseDirection;x=to[0];z=to[1];
   const t=time-8.03;
   if(t<.24){setFrame(11);state.subphase='absorb';}
   else if(t<.41){setFrame(9);state.subphase='rise';}
   else{setFrame(8);state.subphase='settle';}
   sy=1-.012*Math.sin(Math.min(t/.5,1)*Math.PI);
  }
  const floor = heightAt(x, z);
  sprite.position.set(x, floor + h - footInset * sy, z);
  sprite.rotation.y = Math.atan2(camera.position.x - x, camera.position.z - z)+turn;
  sprite.rotation.z = lean;
  sprite.scale.set(sx * direction, sy, 1);
  shadow.position.set(x, floor + .008, z); shadow.scale.setScalar(1 + h * 1.1); shadow.material.opacity = .68 / (1 + h * 2.5);
  Object.assign(state, { x, z, height: h, direction, floor, footY: sprite.position.y + footInset * sy });
 }
 return { update, state, sprite, shadow, atlas };
}

