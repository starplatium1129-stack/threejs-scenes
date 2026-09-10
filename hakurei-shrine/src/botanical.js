import * as THREE from 'three';

function leafGeometry() {
 const g = new THREE.BufferGeometry();
 g.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, -.43,.38,.045, 0,.47,.14, .43,.38,.045, -.28,.73,.025, .28,.73,.025, 0,1,-.05], 3));
 g.setAttribute('uv', new THREE.Float32BufferAttribute([.5,0, 0,.38, .5,.47, 1,.38, .16,.73, .84,.73, .5,1], 2));
 g.setIndex([0,1,2,0,2,3,1,4,2,3,2,5,4,6,2,2,6,5]); g.computeVertexNormals(); return g;
}
function blossomGeometry() {
 const shape = new THREE.Shape();
 for (let i = 0; i <= 40; i++) {
  const a = i / 40 * Math.PI * 2, r = .55 + .2 * Math.cos(a * 5);
  if (!i) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
 }
 const g = new THREE.ShapeGeometry(shape); const p = g.attributes.position;
 for (let i = 0; i < p.count; i++) p.setZ(i, .12 * (p.getX(i) ** 2 + p.getY(i) ** 2));
 g.computeVertexNormals(); return g;
}
export function createBotanicalBuilder({ root, M, range, random, beam, curve, mat, foliage }) {
 const leaf = leafGeometry(), bloom = blossomGeometry();
 const greens = M.leaf.map(m => { const c = m.clone(); c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; c.side = THREE.DoubleSide; c.roughness = .82; return c; });
 const pinks = M.pink.map(m => { const c = m.clone(); c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; c.side = THREE.DoubleSide; c.roughness = .96; return c; });
 const autumn=['#b29e57','#c3ae68','#8c995b','#dbc582'].map(color=>mat(color,{side:THREE.DoubleSide,roughness:.9}));
 const bark = mat('#50443a', { map: M.darkWood.map, bumpMap: M.darkWood.bumpMap, bumpScale: .025, roughness: .98 });
 const dummy = new THREE.Object3D();
 function scatter(parent, centers, cherry, count, spread, scale, override = null) {
  const palette = override || (cherry ? pinks : greens);
  for (let color = 0; color < 4; color++) {
   const leaves = new THREE.InstancedMesh(cherry ? bloom : leaf, palette[color], count);
   for (let i = 0; i < count; i++) {
    const c = centers[(i * 7 + color * 3) % centers.length];
    const a = range(0, Math.PI * 2), b = range(-1, 1), rad = Math.cbrt(random()) * spread;
    dummy.position.set(c.x + Math.cos(a) * rad, c.y + b * rad * .6, c.z + Math.sin(a) * rad);
    dummy.rotation.set(range(-2, 2), range(0, Math.PI * 2), range(-Math.PI, Math.PI));
    const s = range(scale * .6, scale * 1.2); dummy.scale.set(s * (cherry ? 1 : .8), s, s); dummy.updateMatrix();
    leaves.setMatrixAt(i, dummy.matrix);
   }
   leaves.castShadow = leaves.receiveShadow = true; parent.add(leaves);
  }
 }
 function tree(x, z, scale = 1, cherry = true, golden = false) {
  const tree = new THREE.Group(); tree.position.set(x, .245, z); tree.scale.setScalar(scale); root.add(tree);
  curve([[0,0,0],[.09,.7,.02],[-.10,1.5,.03],[.05,2.3,-.05],[-.2,3.05,-.1]], .105, bark, tree);
  for (let i = 0; i < 7; i++) {
   const a = i * 2.4;
   curve([[Math.cos(a)*.48,.015,Math.sin(a)*.42],[Math.cos(a)*.18,.12,Math.sin(a)*.18],[.01,.47,.01]], .035, bark, tree);
  }
  const crown = new THREE.Group(); crown.position.y = 1.8; tree.add(crown);
  const centers = [];
  for (let i = 0; i < 15; i++) {
   const a = i * 2.399, r = range(.65, 1.34), y = .58 + (1 - r / 1.5) * .65 + range(-.18,.22);
   const end = new THREE.Vector3(Math.cos(a)*r, y, Math.sin(a)*r*.85);
   const fork = new THREE.Vector3(end.x*.55, y*.68, end.z*.55);
   curve([[0,i*.015,0],fork.toArray(),end.toArray()], .032 - i * .001, bark, crown);
   for (let j = 0; j < 3; j++) {
    const tip = end.clone().add(new THREE.Vector3(Math.cos(a+j*1.8)*.3,range(.03,.28),Math.sin(a+j*1.8)*.27));
    beam(fork.toArray(),tip.toArray(),.008,bark,crown); centers.push(tip);
   }
  }
  scatter(crown, centers, cherry, cherry ? 1500 : 1050, .36, cherry ? .105 : .20, golden ? autumn : null);
  if (cherry) scatter(crown, centers.filter((_,i)=>i%3===0), false, 85, .29, .12);
  foliage.push({object:crown,phase:range(0,6)});
 }
 function shrub(x,z,scale=1) {
  const g = new THREE.Group(); g.position.set(x,.245,z); g.scale.setScalar(scale); root.add(g);
  const centers = [];
  for (let i=0;i<11;i++) {
   const a=i*2.4, end=new THREE.Vector3(Math.cos(a)*.29,.2+range(0,.19),Math.sin(a)*.24);
   beam([0,0,0],end.toArray(),.008,bark,g); centers.push(end);
  }
  scatter(g,centers,false,130,.16,.115);
 }
 return {tree,shrub};
}
