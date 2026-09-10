import * as THREE from 'three';

async function makeAtlas(){
 const image=new Image();image.src=typeof __MIKU_PERFORMANCE__==='string'?__MIKU_PERFORMANCE__:'/assets/miku/miku-performance.png';await image.decode();
 const raw=document.createElement('canvas');raw.width=image.width;raw.height=image.height;const ctx=raw.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const data=ctx.getImageData(0,0,image.width,image.height);
 for(let i=0;i<data.data.length;i+=4){const r=data.data[i],g=data.data[i+1],b=data.data[i+2];if(g>145&&g>r*1.55&&g>b*1.40)data.data[i+3]=0;}
 ctx.putImageData(data,0,0);
 const W=256,H=272,N=12,baseline=264,canvas=document.createElement('canvas');canvas.width=W*N;canvas.height=H;const out=canvas.getContext('2d',{willReadFrequently:true});out.imageSmoothingEnabled=false;
 const cw=image.width/4,ch=image.height/3,scale=.70*362/ch;
 for(let frame=0;frame<N;frame++){
  const col=frame%4,row=Math.floor(frame/4),x0=Math.round(col*cw),y0=Math.round(row*ch);
  // Prefer the dark boots in the central lower half, so the twin tails do not
  // pull the character's grounded anchor sideways or below the stage surface.
  let footY=0,left=cw,right=0;
  for(let y=Math.floor(ch*.60);y<ch;y++)for(let x=Math.floor(cw*.34);x<cw*.72;x++){
   const i=((y0+y)*image.width+x0+x)*4;
   if(data.data[i+3]>127&&data.data[i]<145&&data.data[i+1]<160&&data.data[i+2]<180){if(y>footY){footY=y;left=x;right=x;}else if(y===footY){left=Math.min(left,x);right=Math.max(right,x);}}
  }
  if(!footY)footY=ch-12;
  const footX=(left+right)/2;
  const dx=frame*W+W/2-footX*scale,dy=baseline-footY*scale;
  out.save();out.beginPath();out.rect(frame*W,0,W,H);out.clip();out.drawImage(raw,x0,y0,cw,ch,Math.round(dx),Math.round(dy),Math.round(cw*scale),Math.round(ch*scale));out.restore();
 }
 const clean=out.getImageData(0,0,canvas.width,H);for(let i=0;i<clean.data.length;i+=4){clean.data[i+3]=clean.data[i+3]>127?255:0;for(let c=0;c<3;c++)clean.data[i+c]=Math.min(255,Math.round(clean.data[i+c]/4)*4);}out.putImageData(clean,0,0);
 return{canvas,W,H,N,footInset:(H-baseline)/H*3.0};
}
export async function createPerformer({root,camera,surfaceY}){
 const {canvas:atlas,W,H,N,footInset}=await makeAtlas();const map=new THREE.CanvasTexture(atlas);map.colorSpace=THREE.SRGBColorSpace;map.minFilter=map.magFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(1/N,1);
 const gradient=new THREE.DataTexture(new Uint8Array([125,180,230,255]),4,1,THREE.RedFormat);gradient.minFilter=gradient.magFilter=THREE.NearestFilter;gradient.needsUpdate=true;
 const material=new THREE.MeshToonMaterial({color:'#bacbca',map,gradientMap:gradient,alphaTest:.5,side:THREE.DoubleSide,emissive:'#112a29',emissiveIntensity:.12});
 const sprite=new THREE.Mesh(new THREE.PlaneGeometry(W/H*3.0,3.0),material);sprite.geometry.translate(0,1.5,0);sprite.castShadow=sprite.receiveShadow=true;sprite.customDepthMaterial=new THREE.MeshDepthMaterial({map,alphaTest:.5,depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});root.add(sprite);
 const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(5,13,30,.70)');g.addColorStop(.4,'rgba(5,13,30,.35)');g.addColorStop(1,'rgba(5,13,30,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.38,.70),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:.65,depthWrite:false}));shadow.rotation.x=-Math.PI/2;root.add(shadow);
 const nodes=[[0,-2],[0,1.90],[0,3.80],[0,1.90],[0,-2],[-2.25,-2.10],[0,-2],[2.25,-2.10]];
 const state={pose:0,phase:'sing',x:0,z:-2,height:0,footY:surfaceY,cycles:0};
 const lerp=THREE.MathUtils.lerp,smooth=t=>t*t*(3-2*t);
 function update(dt,elapsed,beat,mode){
  const cycle=Math.floor(beat/32),local=beat%32,section=Math.floor(local/4),p=(local%4)/4;
  const from=nodes[cycle%nodes.length],to=nodes[(cycle+1)%nodes.length];let x=from[0],z=from[1],height=0,pose=0,lean=0;
  if(section>3){x=to[0];z=to[1];}
  if(section===0){pose=[0,1,0,1][Math.floor(p*4)];state.phase='sing';}
  else if(section===1){pose=[1,2,3,2][Math.floor(p*4)];state.phase='reach';lean=Math.sin(p*Math.PI)*.012;}
  else if(section===2){
   state.phase='dance';if(p<.24)pose=4;else if(p<.59){pose=5;state.phase='hop';height=Math.sin((p-.24)/.35*Math.PI)*.29;}else if(p<.77){pose=6;state.phase='land';}else pose=7;
  }else if(section===3){state.phase='walk';x=lerp(from[0],to[0],smooth(p));z=lerp(from[1],to[1],smooth(p));pose=Math.floor(p*8)%2?7:4;height=Math.abs(Math.sin(p*Math.PI*8))*.024;}
  else if(section===4){pose=8;state.phase='quiet';}
  else if(section===5){pose=Math.floor(p*4)%2?11:9;state.phase='wave';}
  else if(section===6){pose=Math.floor(p*4)%2?3:2;state.phase='chorus';}
  else {pose=mode==='encore'&&p<.64?10:11;state.phase=pose===10?'bow':'finish';}
  const breath=1+Math.sin(elapsed*2.1)*.003;
  map.offset.x=pose/N;sprite.position.set(x,surfaceY+height-footInset*breath,z);sprite.scale.set(1,breath,1);sprite.rotation.y=Math.atan2(camera.position.x-x,camera.position.z-z);sprite.rotation.z=lean;
  shadow.position.set(x,surfaceY+.011,z);shadow.scale.setScalar(1+height*1.1);shadow.material.opacity=.67/(1+height*2.4);
  Object.assign(state,{pose,x,z,height,footY:sprite.position.y+footInset*breath,cycles:cycle});
 }
 return{sprite,shadow,atlas,state,update};
}
