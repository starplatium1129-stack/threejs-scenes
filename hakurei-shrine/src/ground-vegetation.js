import * as THREE from 'three';

// Dense planted margins with explicit clearances for paths, devotional objects
// and the maiden's complete sweep/hop route. All repeated plants are instanced.
export function groundVegetation({ root, mat }) {
 let seed = 20269;
 const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
 const range = (a,b) => a + random() * (b-a);
 const group = new THREE.Group(); group.name = 'Dense garden understory'; root.add(group);
 const clearRects = [
  [-6.45,-3.64,-1.67,.91], // hand washing pavilion
  [-6.53,-4.57,1.70,3.05], // notice board and approach
  [3.55,5.87,-1.19,.49], // ema rack
  [4.05,6.95,-6.43,-2.01], // caretaker building and storage
  [-4.42,4.93,-7.0,-.75], // shrine terrace
  [-5.1,-2.9,-1.55,-.55], // fortune rack
 ];
 const rocks = [[-6.38,3.8,.35],[6.28,1.74,.4],[-3.38,6.45,.29],[6.45,-6.7,.34]];
 const trunks = [[-5.25,-5.25],[5.5,3.8],[-5.55,5.1],[3.75,-6.1]];
 function density(x,z) {
  if (Math.abs(x)>6.93 || Math.abs(z)>6.94 || Math.abs(x-.2)<1.78) return 0;
  if (clearRects.some(([l,r,b,t])=>x>l&&x<r&&z>b&&z<t)) return 0;
  if (z>-.3 && z<6.5 && Math.abs(x-(3.05+Math.sin((5.9-z)/.64*.6)*.3))<.47) return 0;
  if (x>-3.4 && x<3.65 && z>.5 && z<5.35) return 0;
  if (rocks.some(([rx,rz,r])=>Math.hypot(x-rx,z-rz)<r)) return 0;
  if (trunks.some(([rx,rz])=>Math.hypot(x-rx,z-rz)<.22)) return 0;
  const side = Math.max(0,Math.min(1,(Math.abs(x)-3.25)/1.6));
  const edge = Math.max(0,(Math.max(Math.abs(x),Math.abs(z))-5.7)/1.3);
  const variation = .72+.18*Math.sin(x*3.7+z*1.4)+.1*Math.sin(z*5.8-x*2);
  const islands=[[-5.45,5.0,1.5,1.6],[5.65,4.0,1.15,1.8],[5.1,6.0,1.25,.8],[-5.85,-4.7,1.1,2.0],[-6.55,1.0,.7,1.25],[6.5,.5,.6,1.5]];
  let mass=.45;
  for(const [cx,cz,rx,rz]of islands)mass=Math.max(mass,Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2))*1.4);
  return Math.max(0,Math.min(.96,(side*.8+edge*.3)*variation*mass));
 }
 const points=[];
 for(let i=0;i<70000;i++) {
  const x=range(-6.93,6.93),z=range(-6.94,6.94),d=density(x,z);
  if(random()<d)points.push({x,z,d});
 }
 // Root-to-tip vertex colour keeps grass tips luminous and roots shaded.
 function bladeGeometry() {
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([-.055,0,0,.055,0,0,-.038,.4,.06,.038,.4,.06,-.017,.76,.17,.017,.76,.17,0,1,.28],3));
  g.setAttribute('color',new THREE.Float32BufferAttribute([.43,.54,.42,.43,.54,.42,.75,.82,.63,.75,.82,.63,.94,.97,.77,.94,.97,.77,1,1,.86],3));
  g.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);g.computeVertexNormals();return g;
 }
 const blades=bladeGeometry(),dummy=new THREE.Object3D();
 const wind={value:0};
 function windMaterial(color) {
  const m=mat(color,{side:THREE.DoubleSide,vertexColors:true,roughness:1});
  const base=m.onBeforeCompile;
  m.onBeforeCompile=shader=>{
   base(shader);shader.uniforms.gardenTime=wind;
   shader.vertexShader='uniform float gardenTime;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    float phase = instanceMatrix[3].x * 1.6 + instanceMatrix[3].z * 1.1;
    transformed.x += sin(gardenTime * 1.3 + phase) * position.y * position.y * 0.07;
    transformed.z += cos(gardenTime * 0.9 + phase) * position.y * position.y * 0.035;`);
  };
  m.customProgramCacheKey=()=> 'garden-grass-wind-v1';return m;
 }
 const colors=['#70845a','#819566','#586f4d','#8a9364'];
 for(let color=0;color<4;color++) {
  const selected=points.filter((_,i)=>i%4===color);
  const grass=new THREE.InstancedMesh(blades,windMaterial(colors[color]),selected.length*3);
  selected.forEach((p,i)=>{
   for(let j=0;j<3;j++) {
    dummy.position.set(p.x+range(-.022,.022),.248,p.z+range(-.022,.022));
    dummy.rotation.set(range(-.15,.15),range(0,Math.PI*2),range(-.35,.35));
    const h=range(.09,.25)*(p.d>.7?1.2:.8);dummy.scale.set(range(.18,.38),h,h*.8);dummy.updateMatrix();grass.setMatrixAt(i*3+j,dummy.matrix);
   }
  });
  grass.receiveShadow=true;grass.castShadow=false;grass.frustumCulled=false;group.add(grass);
 }
 // A low green floor between the stems follows exactly the same planting mask.
 const groundVerts=[],groundColors=[];
 for(let z=-6.85;z<6.85;z+=.15)for(let x=-6.85;x<6.85;x+=.15) {
  if(density(x,z)<.42 || density(x+.15,z+.15)<.42)continue;
  const c=new THREE.Color('#637454');c.multiplyScalar(range(.88,1.11));
  for(const [dx,dz]of[[0,0],[0,.15],[.15,0],[.15,0],[0,.15],[.15,.15]]){groundVerts.push(x+dx,.247,z+dz);groundColors.push(c.r,c.g,c.b);}
 }
 const turfGeo=new THREE.BufferGeometry();turfGeo.setAttribute('position',new THREE.Float32BufferAttribute(groundVerts,3));turfGeo.setAttribute('color',new THREE.Float32BufferAttribute(groundColors,3));turfGeo.computeVertexNormals();
 const turf=new THREE.Mesh(turfGeo,mat('#ffffff',{vertexColors:true,roughness:1}));turf.receiveShadow=true;group.add(turf);
 // Ferns: each frond carries paired tapering leaflets along a bent rachis.
 const verts=[];
 const tri=(a,b,c)=>verts.push(...a,...b,...c);
 for(let frond=0;frond<7;frond++) {
  const angle=frond*Math.PI*2/7,scale=range(.8,1.1);
  const world=(side,t)=>{const r=t*.52;return [Math.cos(angle)*r-Math.sin(angle)*side,Math.sin(t*Math.PI*.65)*.42*scale,Math.sin(angle)*r+Math.cos(angle)*side];};
  for(let step=1;step<10;step++) {
   const t=step/10,len=.12*Math.sin(t*Math.PI)*scale;
   tri(world(-.008,t-.07),world(.008,t-.07),world(0,t+.07));
   for(const s of [-1,1]){const a=world(0,t-.028),b=world(s*len,t+.038),c=world(s*len*.45,t+.11),d=world(0,t+.018);tri(a,b,c);tri(a,c,d);}
  }
 }
 const fernGeo=new THREE.BufferGeometry();fernGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));fernGeo.computeVertexNormals();
 const fernPositions=[[-6.33,4.53],[-4.9,5.70],[-6.35,6.2],[-4.05,6.53],[-6.42,-3.22],[-6.25,-5.8],[-6.3,1.20],[6.13,4.75],[5.13,5.73],[6.15,6.53],[4.40,5.50],[6.40,2.66],[6.4,-1.2],[6.57,-6.3]];
 const fern=new THREE.InstancedMesh(fernGeo,mat('#527852',{side:THREE.DoubleSide,roughness:.93}),fernPositions.length);
 fernPositions.forEach(([x,z],i)=>{dummy.position.set(x,.248,z);dummy.rotation.set(0,range(0,6.28),0);dummy.scale.setScalar(range(.62,1.03));dummy.updateMatrix();fern.setMatrixAt(i,dummy.matrix);});fern.castShadow=fern.receiveShadow=true;group.add(fern);
 // Small ivory and violet flower heads punctuate only a few planted islands.
 const flowerPositions=points.filter(p=>(p.x<-4.4&&p.z>5.9||p.x>4.3&&p.z>5.45)&&random()>.965);
 const flowerShape=new THREE.Shape();
 for(let i=0;i<=30;i++){const a=i/30*Math.PI*2,r=.70+.26*Math.cos(a*5);if(i===0)flowerShape.moveTo(Math.cos(a)*r,Math.sin(a)*r);else flowerShape.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
 const flowerGeo=new THREE.ShapeGeometry(flowerShape);
 for(let c=0;c<2;c++){
  const flower=new THREE.InstancedMesh(flowerGeo,mat(c?'#b7a3cc':'#eee6c4',{side:THREE.DoubleSide,roughness:1}),Math.ceil(flowerPositions.length/2));
  let index=0;flowerPositions.forEach((p,i)=>{if(i%2!==c)return;dummy.position.set(p.x,range(.37,.46),p.z);dummy.rotation.set(-Math.PI/2+range(-.4,.4),0,range(0,6));dummy.scale.setScalar(range(.022,.035));dummy.updateMatrix();flower.setMatrixAt(index++,dummy.matrix);});flower.count=index;flower.receiveShadow=true;group.add(flower);
 }
 return {update:elapsed=>{wind.value=elapsed;},stats:{tufts:points.length,blades:points.length*3,ferns:fernPositions.length,flowers:flowerPositions.length},density};
}
