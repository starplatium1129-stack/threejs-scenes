import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { animeMaterial as mat } from './anime-material.js';
import { geometryTools,batchStatic } from './geometry.js';
import { createPerformer } from './performer.js';
import { createShow } from './show.js';
import { addAudience } from './audience.js';
import { createMusic } from './sound.js';

const scene=new THREE.Scene();scene.background=new THREE.Color('#101c32');scene.fog=new THREE.Fog('#14203c',38,95);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
document.body.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','初音未来星光演唱会三维微缩舞台，可拖动旋转和缩放');
const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,120);camera.position.set(20,17,25);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2.65,0);controls.enableDamping=true;controls.dampingFactor=.06;controls.minDistance=10;controls.maxDistance=47;controls.enablePan=false;controls.minPolarAngle=.16;controls.maxPolarAngle=Math.PI*.475;controls.update();
const ambient=new THREE.HemisphereLight('#a1c4ed','#26394b',1.3);scene.add(ambient);
const key=new THREE.DirectionalLight('#d1eeff',2.4);key.position.set(-7,14,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:1,far:45});key.shadow.normalBias=.025;key.shadow.bias=-.00015;scene.add(key);
const rim=new THREE.DirectionalLight('#9e7fdc',1.5);rim.position.set(9,10,-9);scene.add(rim);
const root=new THREE.Group();scene.add(root);const {mesh,box,cylinder,beam,curve,ring,panel}=geometryTools(root);
let seed=391;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const range=(a,b)=>a+random()*(b-a);
function surface(kind){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=kind==='grille'?'#303944':'#d9dce0';ctx.fillRect(0,0,256,256);
 if(kind==='grille'){for(let y=3;y<256;y+=7)for(let x=3;x<256;x+=7){ctx.fillStyle='#101922';ctx.beginPath();ctx.arc(x+(y%2)*2,y,2,0,7);ctx.fill();}}
 else{for(let i=0;i<6500;i++){const v=random()>.5?'rgba(30,45,53,.05)':'rgba(255,255,255,.12)';ctx.fillStyle=v;ctx.fillRect(random()*256,random()*256,kind==='metal'?range(1,14):1,1);}}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
const grain=surface('metal'),grille=surface('grille');
const M={metal:mat('#748695',{metalness:.7,roughness:.36,map:grain}),dark:mat('#172536',{metalness:.4,roughness:.58}),floor:mat('#334555',{map:grain,roughness:.84}),concrete:mat('#5c7080',{map:surface('concrete'),roughness:.94}),black:mat('#121a26',{roughness:.88}),rubber:mat('#192332',{roughness:.99}),grille:mat('#a7b1bc',{map:grille,roughness:.8,metalness:.3}),silver:mat('#b0c3d2',{metalness:.6,roughness:.35}),white:mat('#d9e5eb'),gold:mat('#bf9868',{metalness:.6,roughness:.5})};
const emit=(color,intensity=1)=>mat(color,{emissive:color,emissiveIntensity:intensity,roughness:.5,metalness:.1});
M.cyan=emit('#41e9d9',1.4);M.pink=emit('#dc74c8',1.25);M.blue=emit('#6c8ee6',1.1);M.warm=emit('#f3dcb1',.8);

// Complete layered square collector's plinth, with physical brushed edge strips.
box(16,.65,16,0,-.4,0,M.dark,root,.16);box(16.15,.12,16.15,0,-.05,0,M.metal,root,.08);box(15.98,.20,15.98,0,.10,0,M.concrete,root,.09);
for(const side of [-1,1]){box(15.55,.025,.022,0,-.22,side*8.005,M.cyan);box(.022,.025,15.55,side*8.005,-.22,0,M.blue);}
for(let i=0;i<15;i++)for(const side of [-1,1]){box(.009,.38,.012,-7.3+i*1.04,-.43,side*8.006,M.black);box(.012,.38,.009,side*8.006,-.43,-7.3+i*1.04,M.black);}
panel('MIKU  /  STARLIGHT',3.7,.29,0,-.37,8.012,{emissive:.3});
const shadowFloor=mesh(new THREE.PlaneGeometry(45,45),new THREE.ShadowMaterial({color:'#000c24',opacity:.3}),0,-.755,0,scene);shadowFloor.rotation.x=-Math.PI/2;shadowFloor.castShadow=false;
// Rear main stage, central runway and a broad T-shaped audience platform.
box(12.3,1.02,5.25,0,.72,-3.78,M.dark,root,.055);box(12.45,.14,5.38,0,1.30,-3.78,M.floor,root,.035);
box(2.50,1.0,4.65,0,.74,1.0,M.dark,root,.025);box(2.62,.12,4.75,0,1.30,1.0,M.floor,root,.025);
box(5.2,1.0,1.80,0,.74,3.90,M.dark,root,.055);box(5.32,.12,1.91,0,1.30,3.90,M.floor,root,.035);
const surfaceY=1.365;
for(const x of [-1.27,1.27])box(.025,.027,4.55,x,1.371,1.0,M.cyan);
for(const s of [-1,1]){box(5.12,.031,.033,0,1.37,3.90+s*.89,M.pink);box(.025,.031,1.73,s*2.58,1.37,3.9,M.cyan);}
box(12.2,.036,.04,0,1.37,-1.13,M.cyan);box(12.2,.023,.035,0,1.37,-6.41,M.blue);
for(let x=-5.8;x<=5.8;x+=.48)box(.018,.045,.02,x,.53,-1.142,M.silver);
for(let i=0;i<8;i++)box(.95,.38,.035,-5.48+i*1.56,.72,-1.153,M.black,root,.015);
for(let i=0;i<12;i++)box(.012,.008,5.1,-5.52+i*1.0,1.376,-3.78,M.dark);
for(let i=0;i<5;i++)box(12.05,.008,.012,0,1.378,-5.82+i*1.03,M.dark);
for(let i=0;i<6;i++)box(2.40,.008,.012,0,1.379,-.9+i*.73,M.dark);
const frontBadge=panel('01   /   ST★RLIGHT',2.8,.32,0,.83,4.807,{color:'#88eee1',emissive:.3});
for(const s of [-1,1])for(let i=0;i<5;i++){box(1.05,.20,.41,s*5.65,.30+i*.21,-.13-i*.40,M.dark,root,.018);box(1.02,.025,.055,s*5.65,.412+i*.21,.03-i*.40,M.silver);}
for(const s of [-1,1]){beam([s*6.2,.7,.1],[s*6.2,1.65,-1.6],.028,M.silver);for(let i=0;i<3;i++)beam([s*6.2,.22,-i*.7],[s*6.2,.72+i*.35,-i*.7],.025,M.silver);}
// A thin physical concentric pattern marks the main performance position.
for(const r of [1.00,1.14,1.32]){const o=ring(r,.013,0,1.384,-2.0,r===1.14?M.pink:M.cyan);o.rotation.x=-Math.PI/2;}
for(let i=0;i<8;i++){const a=i*Math.PI/4;const o=box(.12,.018,.032,Math.sin(a)*1.32,1.392,-2+Math.cos(a)*1.32,M.silver);o.rotation.y=a;}

// Bolted box trusses: four chords and alternating diagonal web members.
function tower(x,z,height){
 for(const dx of [-.17,.17])for(const dz of [-.17,.17])beam([x+dx,.23,z+dz],[x+dx,height,z+dz],.036,M.metal);
 for(let y=.28;y<height-.1;y+=.58){for(const s of [-1,1]){beam([x-.17,y,z+s*.17],[x+.17,y+.56,z+s*.17],.018,M.silver);beam([x+s*.17,y,z-.17],[x+s*.17,y+.56,z+.17],.018,M.silver);}box(.52,.08,.52,x,y===.28?.24:y,z,M.dark,root,.01);}
 box(.87,.14,.87,x,.28,z,M.black,root,.045);for(const dx of [-.31,.31])for(const dz of [-.31,.31])cylinder(.043,.028,x+dx,.365,z+dz,M.silver);
}
function crossTruss(x0,x1,y,z){
 for(const dy of [-.17,.17])for(const dz of [-.17,.17])beam([x0,y+dy,z+dz],[x1,y+dy,z+dz],.036,M.metal);
 const n=Math.ceil((x1-x0)/.61);for(let i=0;i<n;i++){const x=x0+(x1-x0)*i/n,nx=x0+(x1-x0)*(i+1)/n;for(const s of [-1,1])beam([x,y-.17,z+s*.17],[nx,y+.17,z+s*.17],.018,M.silver);}
}
for(const s of [-1,1]){tower(s*6.66,-5.48,7.66);tower(s*6.66,-.95,5.5);beam([s*6.66,7.66,-5.48],[s*6.66,5.5,-.95],.048,M.metal);beam([s*6.66,7.32,-5.48],[s*6.66,5.18,-.95],.048,M.metal);for(let j=0;j<7;j++)beam([s*6.66,7.64-j*.31,-5.4+j*.64],[s*6.66,7.28-(j+1)*.31,-5.4+(j+1)*.64],.022,M.silver);}
crossTruss(-6.66,6.66,7.66,-5.48);
// Segmented luminous halo and LED wall, with structural back braces.
ring(3.13,.09,0,4.48,-5.76,M.dark);ring(3.03,.034,0,4.48,-5.71,M.cyan);
for(let i=0;i<24;i++){const a=i*Math.PI/12;const o=box(.13,.23,.16,Math.cos(a)*3.13,4.48+Math.sin(a)*3.13,-5.77,M.metal);o.rotation.z=a-Math.PI/2;}
box(6.80,2.87,.20,0,4.45,-5.61,M.black,root,.06);box(6.98,.05,.14,0,5.94,-5.58,M.cyan);
for(const s of [-1,1]){box(1.13,3.35,.19,s*4.62,4.05,-5.55,M.black,root,.03);box(.04,3.31,.04,s*5.2,4.05,-5.4,M.pink);beam([s*3.22,1.36,-5.9],[s*3.22,6.06,-5.9],.055,M.dark);beam([s*3.22,2.4,-6.0],[s*4.0,1.37,-6.32],.036,M.silver);}
panel('M I K U',4.3,.60,0,6.52,-5.58,{bg:'#132134',color:'#d4fff5',emissive:.75});
panel('S T A R L I G H T   /   0 1',4.7,.25,0,6.06,-5.36,{bg:'#132134',color:'#74d6d3',emissive:.7});
for(const s of [-1,1]){const p=panel('LIVE\n39',.69,1.00,s*4.62,4.38,-5.435,{color:s<0?'#8df8e7':'#e7a4e0',emissive:.65});}
// Rear service deck: flight cases, coiled cable and equipment racks.
for(const s of [-1,1]){
 const x=s*5.05;box(.9,.72,.74,x,1.73,-5.72,M.black,root,.035);
 for(const y of [1.42,2.05])box(.94,.045,.78,x,y,-5.72,M.metal);
 for(const xx of [-.43,.43])box(.045,.7,.78,x+xx,1.73,-5.72,M.metal);
 box(.17,.055,.025,x,1.84,-5.327,M.silver);
 for(let i=0;i<3;i++){const o=ring(.21+i*.023,.009,x,1.39,-4.95,M.rubber);o.rotation.x=-Math.PI/2;}
 curve([[x,1.39,-4.95],[x*.7,1.392,-4.75],[x*.5,1.393,-5.1],[x*.1,1.39,-5.22]],.014,M.rubber);
}
// Line arrays and subs: cabinet seams, actual driver cones, grilles and rigging.
function speaker(x,y,z,w=.75,h=.56){
 box(w,h,.55,x,y,z,M.black,root,.025);box(w-.08,h-.09,.018,x,y,z+.282,M.grille,root,.012);
 for(const xx of [-1,1])for(const yy of [-1,1]){const pin=cylinder(.014,.011,x+xx*(w/2-.045),y+yy*(h/2-.046),z+.3,M.silver,root,6);pin.rotation.x=Math.PI/2;}
 for(const yy of [-.13,.13]){const o=ring(.11,.01,x,y+yy,z+.295,M.dark);}
}
for(const s of [-1,1]){
 for(let i=0;i<5;i++)speaker(s*5.85,5.90-i*.55,-4.40,.70,.52);
 beam([s*5.85,6.30,-4.4],[s*5.85,7.52,-5.4],.019,M.dark);
 for(let i=0;i<2;i++)speaker(s*(4.3+i*1.17),1.77,-1.79,1.02,.72);
 const wedge=box(.8,.30,.58,s*1.88,1.58,-.82,M.dark,root,.022);wedge.rotation.x=-.22;
 const grillePanel=mesh(new THREE.PlaneGeometry(.69,.39),M.grille,s*1.88,1.72,-.7);grillePanel.rotation.x=-Math.PI*.28;
 curve([[s*1.88,1.39,-.95],[s*2.35,1.39,-1.6],[s*3.4,1.39,-1.4],[s*4.3,1.39,-2.3]],.015,M.rubber);
}
// Safety barriers define crowd islands with a clear stage/front-of-house aisle.
function barrier(x,z,w,rotate=0){const g=new THREE.Group();g.position.set(x,.22,z);g.rotation.y=rotate;root.add(g);for(const xx of [-w/2,w/2]){beam([xx,0,0],[xx,.80,0],.022,M.silver,g);box(.33,.06,.33,xx,.03,0,M.dark,g);}for(const y of [.25,.74])beam([-w/2,y,0],[w/2,y,0],.022,M.metal,g);for(let i=0;i<Math.round(w/.17);i++){const xx=-w/2+i*.17;beam([xx,.25,0],[xx,.73,0],.009,M.metal,g);}}
for(const s of [-1,1]){for(let i=0;i<3;i++)barrier(s*2.1,1.0+i*1.38,1.27,Math.PI/2);barrier(s*4.6,6.94,4.6);barrier(s*7.18,3.65,5.5,Math.PI/2);}
for(const s of [-1,1]){panel('STARLIGHT',1.45,.22,s*4.7,.59,6.97,{color:'#d1e8e8',emissive:.1});}
// Tile seams, recessed path lamps, backstage access and front ticket stubs.
for(let i=0;i<13;i++)box(15.7,.005,.008,0,.207,-7.25+i*1.17,M.floor);
for(let i=0;i<13;i++)box(.008,.005,15.7,-7.25+i*1.17,.208,0,M.floor);
for(const s of [-1,1])for(let i=0;i<7;i++){box(.17,.035,.27,s*7.55,.237,-5.5+i*1.65,M.dark,root,.02);box(.09,.013,.13,s*7.55,.26,-5.5+i*1.65,M.cyan);}
for(let i=0;i<22;i++){const x=range(-6.8,6.8),z=range(5.6,7.5);if(Math.abs(x)<2.7)continue;const p=box(.08,.003,.12,x,.22,z,i%2?M.pink:M.cyan);p.rotation.y=range(0,6.3);}
const music=createMusic();
const show=createShow({scene,root,renderer,ambient,key,rim,camera,M,mesh,box,cylinder,beam,ring,panel,music});
const audience=addAudience({root,M,box,mesh,cylinder,beam,random,range});
batchStatic(root,[...show.moving,...audience.moving]);
const performer=await createPerformer({root,camera,surfaceY});
let last=0,elapsed=0;
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;const beat=elapsed*112/60;controls.update();show.update(dt,elapsed,beat);performer.update(dt,elapsed,beat,show.mode);audience.update(elapsed,beat);music.update(elapsed);renderer.render(scene,camera);}
requestAnimationFrame(animate);
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(17.5))*Math.max(1,1.3/camera.aspect)));camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);resize();
window.__concert={scene,renderer,camera,controls,performer,show,audience,music,get elapsed(){return elapsed;}};
