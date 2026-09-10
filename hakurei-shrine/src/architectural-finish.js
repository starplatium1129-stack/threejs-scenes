import * as THREE from 'three';

export function architecturalFinish({root,shrine,M,box,mesh,beam,cyl,range,random,mat}) {
 const hardware = mat('#454e50',{metalness:.72,roughness:.43});
 // Diagonal veranda braces carry the balcony into the main posts.
 for (const side of [-1,1]) {
  for (const z of [-1.6,.12,1.8]) {
   beam([side*2.62,.12,z],[side*3.13,.50,z],.055,M.darkWood,shrine);
   box(.10,.43,.11,side*2.73,.27,z,M.darkWood,shrine);
  }
  for (const z of [-1.85,1.92]) {
   beam([side*3.03,2.61,z],[side*3.03,3.22,z+.38],.058,M.redDark,shrine);
   box(.27,.14,.52,side*3.03,3.18,z+.13,M.wood,shrine);
  }
  // Recessed rail infill and metal pin heads, rather than solid red slabs.
  for (let i=0;i<9;i++) box(.035,.33,.035,side*(1.58+i*.18),1.1,2.15,M.redDark,shrine);
 }
 // Joint lines on the steps and the polished leading edge of the treads.
 for (let row=0;row<4;row++) {
  const y=.10+row*.145,z=3.04-row*.38;
  box(2.50,.018,.038,0,y+.077,z+.178,M.lightWood,shrine);
  for(const x of [-1.13,1.13]) {
   const pin = cyl(.013,.013,.008,x,y+.079,z+.05,hardware,shrine,8);
  }
 }
 // Concealed eave battens and exposed rafter end-grain.
 for(let i=0;i<19;i++) {
  const x=-3.05+i*.34;
  box(.102,.13,.012,x,3.27,2.30,M.lightWood,shrine);
  box(.056,.075,.014,x,3.27,2.311,M.wood,shrine);
 }
 // Drainage channel beside the raised court, with removable slatted covers.
 for(const side of [-1,1]) {
  const x=side<0?-4.34:4.95;
  for(let i=0;i<7;i++) {
   const z=-1.50-i*.52;
   box(.18,.045,.46,x,.272,z,M.stoneDark,root,.008);
   for(let j=0;j<5;j++) box(.16,.013,.025,x,.302,z-.18+j*.08,hardware);
  }
 }
 // Weathered boulders: non-uniform silhouettes and mineral strata, not spheres.
 const rockMaterial=M.stoneDark.clone(); rockMaterial.onBeforeCompile=M.stoneDark.onBeforeCompile; rockMaterial.customProgramCacheKey=M.stoneDark.customProgramCacheKey;
 rockMaterial.vertexColors=true; rockMaterial.roughness=.98;
 function rock(x,z,scale) {
  const g=new THREE.IcosahedronGeometry(1,2),p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++) {
   const ox=p.getX(i),oy=p.getY(i),oz=p.getZ(i);
   const radial=1+.09*Math.sin(ox*12+oz*5)+.065*Math.cos(oy*11-ox*7);
   p.setXYZ(i,ox*radial,oy*radial*.68,oz*radial*.8);
   const c=new THREE.Color().setHSL(.13,.055,.68+.12*Math.sin(oy*19+ox*3)); colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();
  const stone=mesh(g,rockMaterial,x,.245+scale*.29,z);stone.scale.setScalar(scale);stone.rotation.y=range(0,6);
 }
 for(const [x,z,s]of[[-6.38,3.8,.38],[6.28,1.74,.42],[-3.38,6.45,.30],[6.45,-6.7,.37]])rock(x,z,s);
 // Fine grass tufts form coherent patches around stones and fence feet.
 const grassGeo=new THREE.BufferGeometry();
 grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.04,0,0,.04,0,0,-.022,.55,.10,.022,.55,.10,0,1,.30],3));
 grassGeo.setIndex([0,1,2,1,3,2,2,3,4]);grassGeo.computeVertexNormals();
 const grassMat=mat('#6b7c58',{side:THREE.DoubleSide,roughness:1});
 const patches=[[-6.38,3.8],[6.28,1.74],[-3.38,6.45],[-6.65,6.45],[6.60,5.70],[-3.55,4.5],[4.3,6.6]];
 const grass=new THREE.InstancedMesh(grassGeo,grassMat,patches.length*50),dummy=new THREE.Object3D();
 patches.forEach(([x,z],j)=>{for(let i=0;i<50;i++) {
  const a=range(0,Math.PI*2),r=range(.18,.49);dummy.position.set(x+Math.cos(a)*r,.245,z+Math.sin(a)*r);
  dummy.rotation.set(0,range(0,6.28),range(-.28,.28));dummy.scale.set(.15,range(.09,.22),.2);dummy.updateMatrix();grass.setMatrixAt(j*50+i,dummy.matrix);
 }});
 grass.castShadow=grass.receiveShadow=true;root.add(grass);
}
