import * as THREE from 'three';

export function createAtmosphere({scene,renderer,hemisphere,sun,fill,backdrop,root,windowMaterial,lanterns}) {
 const night={value:0},time={value:0},aspect={value:innerWidth/innerHeight};
 const skyMaterial=new THREE.ShaderMaterial({
  uniforms:{night,time,aspect},depthTest:false,depthWrite:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.9999,1.0);}`,
  fragmentShader:`
   varying vec2 vUv;uniform float night;uniform float time;uniform float aspect;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   void main(){
    vec3 day=mix(vec3(.73,.78,.70),vec3(.28,.46,.50),smoothstep(.22,1.,vUv.y));
    vec3 dusk=vec3(.69,.48,.40);float twilight=sin(night*3.14159)*.20;
    vec3 dark=mix(vec3(.055,.095,.15),vec3(.018,.027,.075),vUv.y);
    vec3 color=mix(day,dark,night);color=mix(color,dusk,twilight*(1.-vUv.y));
    float ridge1=.37+.031*sin(vUv.x*9.+.5)+.018*sin(vUv.x*19.);
    float ridge2=.26+.044*sin(vUv.x*7.+1.8)+.023*sin(vUv.x*17.);
    float ridge3=.11+.047*sin(vUv.x*8.5+3.5)+.015*sin(vUv.x*24.);
    color=mix(color,mix(vec3(.43,.57,.52),vec3(.055,.085,.12),night),1.-smoothstep(ridge1-.004,ridge1+.004,vUv.y));
    color=mix(color,mix(vec3(.32,.48,.43),vec3(.037,.067,.087),night),1.-smoothstep(ridge2-.004,ridge2+.004,vUv.y));
    color=mix(color,mix(vec3(.24,.41,.36),vec3(.026,.047,.059),night),1.-smoothstep(ridge3-.004,ridge3+.004,vUv.y));
    vec2 cell=floor(vUv*vec2(130.,82.));vec2 star=fract(vUv*vec2(130.,82.));
    float stars=step(.976,hash(cell))*pow(max(0.,1.-length(star-.5)*3.),5.)*step(ridge1+.03,vUv.y);
    color+=vec3(.8,.86,1.)*stars*night*(.7+.3*sin(time*.8+hash(cell)*30.));
    vec2 moon=vUv-vec2(.83,.79);moon.x*=aspect;float r=length(moon);
    color+=vec3(.65,.71,.68)*exp(-r*65.)*.25*night;
    color=mix(color,vec3(.90,.92,.81),(1.-smoothstep(.020,.022,r))*night);
    gl_FragColor=vec4(color,1.);
   }`,
 });
 const sky=new THREE.Mesh(new THREE.PlaneGeometry(2,2),skyMaterial);sky.frustumCulled=false;sky.renderOrder=-1000;scene.add(sky);
 backdrop.material=new THREE.ShadowMaterial({color:'#243d3b',opacity:.20});
 const warmLights=[];
 for(const [x,y,z,power,distance]of[
  [.2,2.4,-1.92,12,6],[3.36,2.64,-3.9,6,4],[-2.91,2.5,-3.8,5,4],
  [5.2,1.9,-3.5,7,4],[-5.05,1.55,-.45,3,3],
  [-1.95,1.68,.65,3.2,3],[2.35,1.68,.65,3.2,3],[-1.95,1.68,5.7,2.5,2.8],[2.35,1.68,5.7,2.5,2.8],
 ]){const light=new THREE.PointLight('#ffc479',0,distance,2);light.position.set(x,y,z);light.userData.power=power;scene.add(light);warmLights.push(light);}
 // Find stone lantern emissive panels, sharing one material across their faces.
 const emitters=new Set(lanterns);
 root.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&o.material.emissive&&o.material.emissive.getHex()!==0)emitters.add(o.material);});
 emitters.delete(windowMaterial);
 const style=document.createElement('style');style.textContent=`
 .time-switch{position:fixed;z-index:10;left:24px;top:22px;color:#f2ecd9;font:12px/1.4 system-ui,sans-serif;user-select:none}
 .time-label{margin:0 0 10px 3px;letter-spacing:.23em;font-family:serif;font-size:14px;text-shadow:0 1px 6px #20373366}
 .time-buttons{display:flex;gap:3px;padding:4px;border:1px solid #ffffff23;border-radius:24px;background:#213d3d9c;backdrop-filter:blur(12px);box-shadow:0 3px 14px #12252512}
 .time-buttons button{border:0;border-radius:18px;padding:9px 14px;background:transparent;color:#e2e4d7;font:inherit;cursor:pointer;transition:background .2s,color .2s}
 .time-buttons button[aria-pressed=true]{background:#e7dbb4;color:#34463e;box-shadow:0 1px 3px #172a2933}
 .time-buttons button:focus-visible{outline:2px solid #faf0c8;outline-offset:3px}
 @media(max-width:500px){.time-switch{left:15px;top:16px}.time-buttons button{padding:8px 12px}.time-label{font-size:12px}}
 `;document.head.appendChild(style);
 const ui=document.createElement('section');ui.className='time-switch';ui.setAttribute('aria-label','场景时段');
 const label=document.createElement('p');label.className='time-label';label.textContent='博丽神社 · 昼';ui.appendChild(label);
 const row=document.createElement('div');row.className='time-buttons';ui.appendChild(row);
 const buttons=new Map();let mode='day',blend=0,autoTime=0;
 function setMode(value){if(!['day','night','cycle'].includes(value))return;mode=value;if(mode==='cycle')autoTime=blend>.5?85:0;for(const [key,b]of buttons)b.setAttribute('aria-pressed',String(key===mode));}
 for(const [key,text]of[['cycle','昼夜流转'],['day','白昼'],['night','夜晚']]){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-pressed',String(key===mode));b.addEventListener('click',()=>setMode(key));buttons.set(key,b);row.appendChild(b);}
 document.body.appendChild(ui);
 const daySky=new THREE.Color('#d9e7f1'),nightSky=new THREE.Color('#7188bd'),dayGround=new THREE.Color('#566057'),nightGround=new THREE.Color('#263745');
 const sunDay=new THREE.Color('#fff0d8'),sunDusk=new THREE.Color('#d8a092');
 const fogDay=new THREE.Color('#9fafaa'),fogNight=new THREE.Color('#16243b');
 function update(dt,elapsed){
  autoTime+=dt;
  const target=mode==='night'?1:mode==='day'?0:(1-Math.cos(autoTime*Math.PI*2/180))/2;
  blend=THREE.MathUtils.damp(blend,target,2.2,dt);if(Math.abs(blend-target)<.0001)blend=target;
  night.value=blend;time.value=elapsed;aspect.value=innerWidth/innerHeight;
  hemisphere.color.copy(daySky).lerp(nightSky,blend);hemisphere.groundColor.copy(dayGround).lerp(nightGround,blend);hemisphere.intensity=THREE.MathUtils.lerp(1.5,.42,blend);
  sun.intensity=THREE.MathUtils.lerp(3.3,.09,blend);sun.color.copy(sunDay).lerp(sunDusk,Math.sin(blend*Math.PI));
  fill.intensity=THREE.MathUtils.lerp(.72,.95,blend);fill.color.copy(new THREE.Color('#c4dfef')).lerp(new THREE.Color('#8ba9e0'),blend);
  fill.position.set(8-11*blend,7+7*blend,-9+19*blend);
  renderer.toneMappingExposure=THREE.MathUtils.lerp(1.13,1.18,blend);
  scene.fog.color.copy(fogDay).lerp(fogNight,blend);backdrop.material.opacity=THREE.MathUtils.lerp(.21,.08,blend);
  const glow=THREE.MathUtils.smoothstep(blend,.15,.92);
  windowMaterial.emissive.set('#ffd092');windowMaterial.emissiveIntensity=glow*1.15;
  let i=0;for(const material of emitters){material.emissiveIntensity=.10+glow*(.7+Math.sin(elapsed*1.7+i++)*.028);}
  for(const light of warmLights)light.intensity=light.userData.power*glow;
  label.textContent=`博丽神社 · ${blend<.25?'昼':blend>.75?'夜':'暮'}`;
 }
 return{update,setMode,get mode(){return mode;},get night(){return blend;},get lightPower(){return warmLights.reduce((v,l)=>v+l.intensity,0);}};
}
