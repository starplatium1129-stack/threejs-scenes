import * as THREE from 'three';

export function createShow({scene,root,renderer,ambient,key,rim,camera,M,mesh,box,cylinder,beam,ring,panel,music}) {
 const clock={value:0},energy={value:1},encore={value:0},skyNight={value:1},aspect={value:innerWidth/innerHeight};
 const background=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:{clock,skyNight,aspect},depthWrite:false,depthTest:false,
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,.9999,1.);}',
  fragmentShader:`varying vec2 v;uniform float clock;uniform float skyNight;uniform float aspect;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){
   vec3 day=mix(vec3(.48,.61,.64),vec3(.26,.39,.49),v.y);vec3 night=mix(vec3(.065,.13,.21),vec3(.018,.029,.075),v.y);
   vec3 col=mix(day,night,skyNight);vec2 p=(v-vec2(.55,.55))*vec2(aspect,1.);col+=vec3(.015,.07,.08)*exp(-length(p)*4.)*skyNight;
   vec2 cell=floor(v*vec2(150.,100.)),q=fract(v*vec2(150.,100.));float star=step(.983,hash(cell))*pow(max(0.,1.-length(q-.5)*3.),5.);col+=vec3(.45,.6,.7)*star*skyNight;
   float band=sin(v.x*3.8+v.y*5.1+clock*.025);col+=vec3(.022,.015,.045)*pow(max(0.,band),8.)*skyNight;gl_FragColor=vec4(col,1.);}`
 }));background.renderOrder=-1000;background.frustumCulled=false;scene.add(background);
 const screenMaterial=new THREE.ShaderMaterial({uniforms:{clock,energy,encore},side:THREE.DoubleSide,
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 v;uniform float clock;uniform float energy;uniform float encore;void main(){vec2 p=(v-.5)*vec2(2.25,1.);float r=length(p);float a=atan(p.y,p.x);float pulse=.5+.5*sin(clock*1.8);
   vec3 cyan=mix(vec3(.08,.8,.69),vec3(.9,.36,.68),encore);vec3 color=vec3(.018,.043,.09);
   float rings=pow(max(0.,cos(r*25.-clock*1.8+a*.8)),20.);float arc=smoothstep(.40,.42,r)*(1.-smoothstep(.44,.46,r));
   float wave=pow(max(0.,1.-abs(p.y-.18*sin(p.x*5.+clock))/.022),2.);
   float grid=pow(max(0.,sin(v.x*155.)),12.)*pow(max(0.,sin(v.y*80.)),12.);
   color+=cyan*(rings*.28+arc*.6+wave*.26)*energy;color+=vec3(.08,.13,.19)*grid*.32;
   float core=exp(-r*r*12.);color+=cyan*core*.14;gl_FragColor=vec4(color,1.);}`
 });
 mesh(new THREE.PlaneGeometry(6.57,2.64),screenMaterial,0,4.45,-5.492);
 const sideMaterial=screenMaterial.clone();sideMaterial.uniforms=screenMaterial.uniforms;
 for(const s of [-1,1])mesh(new THREE.PlaneGeometry(.95,3.16),sideMaterial,s*4.62,4.05,-5.445);
 const moving=[],heads=[];
 const coneGeometry=new THREE.CylinderGeometry(.025,.79,6.1,24,1,true);coneGeometry.translate(0,-3.05,0);
 const beamMaterials=[];
 const positions=[[-4.7,7.30,-5.14],[-2.35,7.30,-5.14],[0,7.30,-5.14],[2.35,7.30,-5.14],[4.7,7.30,-5.14],[-6.63,5.03,-.95],[6.63,5.03,-.95]];
 const cool=new THREE.Color('#58e7de'),pink=new THREE.Color('#d582db');
 positions.forEach(([x,y,z],i)=>{
  box(.10,.43,.10,x,y+.10,z,M.dark);box(.49,.10,.35,x,y+.27,z,M.metal);
  const pivot=new THREE.Group();pivot.position.set(x,y,z);root.add(pivot);moving.push(pivot);
  box(.34,.24,.34,0,0,0,M.dark,pivot,.035);cylinder(.135,.07,0,-.16,0,i%2?M.pink:M.cyan,pivot,20);
  const hazeMaterial=new THREE.ShaderMaterial({uniforms:{beamColor:{value:(i%2?pink:cool).clone()},alpha:{value:.04}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
   vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'varying vec2 v;uniform vec3 beamColor;uniform float alpha;void main(){float edge=pow(sin(v.x*3.14159),2.);float fade=smoothstep(0.,.22,v.y)*(.25+.75*v.y);gl_FragColor=vec4(beamColor,alpha*fade*edge);}'
  });mesh(coneGeometry,hazeMaterial,0,-.17,0,pivot).castShadow=false;beamMaterials.push(hazeMaterial);
  let spot=null;if(i%2===0){spot=new THREE.SpotLight(i%4?'#d582db':'#58e7de',38,18,.27,.6,2);spot.position.set(x,y,z);scene.add(spot);scene.add(spot.target);}
  heads.push({pivot,spot,index:i});
 });
 // Footlights and a soft white performer key make the small pixel figure readable.
 const fills=[];
 for(const [x,z,color]of[[-4.1,-2.4,'#36ded5'],[4.1,-2.4,'#c66ac4'],[-2.2,3.75,'#47dbe0'],[2.2,3.75,'#df79cc']]){
  const l=new THREE.PointLight(color,8,6,2);l.position.set(x,2.2,z);scene.add(l);fills.push(l);
  box(.37,.16,.30,x,1.48,z,M.dark,root,.03);const lens=cylinder(.105,.025,x,1.575,z,color==='#36ded5'?M.cyan:M.pink,root,16);
 }
 const performerKey=new THREE.PointLight('#e6ffff',12,10,2);performerKey.position.set(0,5.1,.15);scene.add(performerKey);
 const confettiGeometry=new THREE.BufferGeometry(),confettiPositions=[],confettiColors=[];
 for(let i=0;i<95;i++){confettiPositions.push(Math.sin(i*2.4)*5.3,2+i%7*.57,-4.8+(i%13)*.64);const c=i%2?cool:pink;confettiColors.push(c.r,c.g,c.b);}
 confettiGeometry.setAttribute('position',new THREE.Float32BufferAttribute(confettiPositions,3));confettiGeometry.setAttribute('color',new THREE.Float32BufferAttribute(confettiColors,3));
 const confetti=new THREE.Points(confettiGeometry,new THREE.PointsMaterial({vertexColors:true,size:.035,transparent:true,opacity:.42,depthWrite:false}));root.add(confetti);
 const css=document.createElement('style');css.textContent=`.show-ui{position:fixed;left:24px;top:22px;z-index:10;color:#dffbf7;font:12px/1.4 system-ui,sans-serif;user-select:none}.show-title{font-size:13px;letter-spacing:.25em;margin:0 0 3px 4px;font-weight:600}.show-subtitle{letter-spacing:.14em;color:#9eb8c8;font-size:10px;margin:0 0 12px 4px}.show-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.mode-group{display:flex;gap:3px;padding:4px;border:1px solid #80d9d62c;background:#10273bbb;border-radius:23px;backdrop-filter:blur(12px)}.show-ui button{font:inherit;cursor:pointer;color:#b9cdd7;border:0;background:transparent;border-radius:18px;padding:8px 13px}.show-ui button[aria-pressed=true]{background:#92e9df;color:#133c42}.show-ui .music-toggle{border:1px solid #86b6c944;background:#11283aa8;padding:11px 13px}.show-ui button:focus-visible{outline:2px solid #a2fff0;outline-offset:3px}@media(max-width:500px){.show-ui{left:14px;top:16px;right:14px}.show-ui button{padding:7px 10px}.show-ui .music-toggle{padding:10px}.show-title{font-size:12px}.show-subtitle{font-size:9px}}`;document.head.appendChild(css);
 const ui=document.createElement('section');ui.className='show-ui';ui.setAttribute('aria-label','演唱会控制');
 ui.innerHTML='<p class="show-title">MIKU · STARLIGHT</p><p class="show-subtitle">星光舞台  /  LIVE IN MINIATURE</p><div class="show-row"><div class="mode-group"></div></div>';
 const group=ui.querySelector('.mode-group'),row=ui.querySelector('.show-row');let mode='live',nightValue=1,encoreValue=0;
 const buttons=new Map();
 function setMode(next){if(!['rehearsal','live','encore'].includes(next))return;mode=next;buttons.forEach((b,key)=>b.setAttribute('aria-pressed',String(key===mode)));}
 for(const [value,label]of[['rehearsal','日间彩排'],['live','星光现场'],['encore','返场']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(value===mode));b.onclick=()=>setMode(value);group.appendChild(b);buttons.set(value,b);}
 const audio=document.createElement('button');audio.type='button';audio.className='music-toggle';audio.textContent='♫ 伴奏：关';audio.setAttribute('aria-pressed','false');audio.setAttribute('aria-label','开启伴奏');
 audio.onclick=async()=>{await music.toggle();audio.textContent=music.enabled?'♫ 伴奏：开':'♫ 伴奏：关';audio.setAttribute('aria-pressed',String(music.enabled));audio.setAttribute('aria-label',music.enabled?'关闭伴奏':'开启伴奏');};row.appendChild(audio);document.body.appendChild(ui);
 function update(dt,elapsed,beat){
  nightValue=THREE.MathUtils.damp(nightValue,mode==='rehearsal'?0:1,2,dt);encoreValue=THREE.MathUtils.damp(encoreValue,mode==='encore'?1:0,2,dt);clock.value=elapsed;skyNight.value=nightValue;encore.value=encoreValue;aspect.value=innerWidth/innerHeight;
  const pulse=.65+.35*Math.exp(-(beat%1)*4.5);energy.value=.4+nightValue*(.46+pulse*.16);
  ambient.intensity=THREE.MathUtils.lerp(2.15,.95,nightValue);key.intensity=THREE.MathUtils.lerp(3.1,1.65,nightValue);rim.intensity=THREE.MathUtils.lerp(.7,1.4,nightValue);
  renderer.toneMappingExposure=THREE.MathUtils.lerp(1.12,1.3,nightValue);performerKey.intensity=THREE.MathUtils.lerp(4,12,nightValue);
  M.cyan.emissiveIntensity=.6+nightValue*(.65+pulse*.25);M.pink.emissiveIntensity=.5+nightValue*(.75+pulse*.25);M.blue.emissiveIntensity=.5+nightValue*.7;
  heads.forEach(({pivot,spot,index:i})=>{
   const target=new THREE.Vector3(Math.sin(elapsed*.26+i*1.2)*4.1,1.05,-.25+Math.sin(elapsed*.19+i)*2.7);
   pivot.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),target.clone().sub(pivot.position).normalize());
   if(spot){spot.target.position.copy(target);spot.intensity=nightValue*(28+14*pulse);spot.color.copy(i%4?pink:cool).lerp(new THREE.Color('#efb6d5'),encoreValue*.25);}
   beamMaterials[i].uniforms.alpha.value=nightValue*(.046+encoreValue*.018);beamMaterials[i].uniforms.beamColor.value.copy(i%2?pink:cool).lerp(pink,encoreValue*.35);
  });
  fills.forEach((l,i)=>l.intensity=nightValue*(6+pulse*3));
  const p=confetti.geometry.attributes.position;for(let i=0;i<p.count;i++){p.setY(i,p.getY(i)-dt*(.12+encoreValue*.26));if(p.getY(i)<1.45)p.setY(i,5.7);p.setX(i,confettiPositions[i*3]+Math.sin(elapsed*.4+i)*.14);}p.needsUpdate=true;
  confetti.material.opacity=nightValue*(.12+encoreValue*.7);confetti.material.size=.026+encoreValue*.019;
 }
 return{update,setMode,moving,get mode(){return mode;},get night(){return nightValue;},get lightPower(){return performerKey.intensity+fills.reduce((sum,l)=>sum+l.intensity,0);}};
}
