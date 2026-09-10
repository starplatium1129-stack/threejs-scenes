import * as THREE from 'three';

export function addGardenDetail({ root, shrine, M, box, mesh, ball, beam, cyl, random, range, mat }) {
 const patina = mat('#7c8a61'), soil = mat('#9e9c78');
 const iron = mat('#525651', { metalness: .65, roughness: .46 });
 const flatPatch = (x, z, radius, material, y = .247) => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 13; i++) { const a = i / 12 * Math.PI * 2, r = radius * (.7 + random() * .3); const px = Math.cos(a) * r, pz = Math.sin(a) * r; if (!i) shape.moveTo(px, pz); else shape.lineTo(px, pz); }
  shape.closePath(); const o = mesh(new THREE.ShapeGeometry(shape), material, x, y, z); o.rotation.x = -Math.PI / 2; o.castShadow = false;
 };
 // Moss lives in sheltered margins and joints, leaving the swept path clear.
 for (const [x, z, r] of [[-5.25,-5.25,.9],[5.5,3.8,.72],[-5.55,5.1,.62],[3.75,-6.1,.6],[-6.5,-3.2,.55],[6.5,5.4,.55],[-3.5,4.9,.48],[6.3,-.8,.45]]) {
  flatPatch(x, z, r, soil);
  for (let j = 0; j < 9; j++) flatPatch(x + range(-r, r), z + range(-r, r), range(.07, .22), patina, .249);
 }
 const gravelGeo = new THREE.IcosahedronGeometry(1, 0);
 const gravel = new THREE.InstancedMesh(gravelGeo, M.stone, 850);
 const transform = new THREE.Object3D();
 for (let i = 0; i < 850; i++) {
  const s = i % 2 ? -1 : 1, x = .2 + s * range(1.50, 1.75), z = range(.8, 6.8);
  transform.position.set(x, .263, z); transform.rotation.set(range(0, 1), range(0, 6), range(0, 1));
  transform.scale.set(range(.017, .047), range(.01, .028), range(.02, .05)); transform.updateMatrix(); gravel.setMatrixAt(i, transform.matrix);
  gravel.setColorAt(i, new THREE.Color().setHSL(.12, range(.04, .12), range(.60, .89)));
 }
 gravel.receiveShadow = true; root.add(gravel);
 for (let i = 0; i < 20; i++) {
  const s = i % 2 ? -1 : 1, z = .8 + i * .29;
  flatPatch(.2 + s * 1.45, z, range(.028, .07), patina, .253);
 }
 // Terrace retaining stones on both flanks, with thin mortar reveals.
 for (const s of [-1, 1]) for (let i = 0; i < 8; i++) box(.06, .25, .69, .3 + s * 4.52, .4, -1.29 - i * .73, i % 3 ? M.stone : M.stoneDark, root, .035);
 // Nail heads and corner plates make the red timber read as assembled structure.
 for (const x of [-3.03, 3.03]) for (const z of [-1.88, .2, 1.97]) {
  box(.232, .22, .235, x, .85, z, iron, shrine, .008);
  for (const dx of [-.07, .07]) ball(.018, x + dx, .85, z + .123, M.gold, shrine, 1);
 }
 for (const x of [-2.8, -1.4, 0, 1.4, 2.8]) for (const y of [.84, 2.82]) ball(.021, x, y, 1.405, iron, shrine, 1);
 for (let i = 0; i < 17; i++) {
  const x = -2.95 + i * .37;
  for (const z of [1.78, -.95]) ball(.012, x, .657, z, iron, shrine, 0);
 }
 // Rainwater chains, roof gutters and a collecting stone at each rear corner.
 for (const s of [-1, 1]) {
  beam([s * 3.48, 3.38, -2.55], [s * 3.48, 3.38, 2.1], .045, M.roofEdge, shrine);
  for (let i = 0; i < 17; i++) {
   const ring = mesh(new THREE.TorusGeometry(.047, .010, 5, 10), iron, s * 3.48, 3.13 - i * .14, -1.93, shrine);
   ring.rotation.y = i % 2 ? Math.PI / 2 : 0;
  }
  cyl(.27, .3, .1, s * 3.48, .06, -1.93, M.stoneDark, shrine, 12);
 }
 // Cut firewood and a slatted storage chest beside the caretaker's building.
 for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) {
  const x = 5.62 + i * .2 + row * .1, y = .36 + row * .17;
  const log = cyl(.085, .085, .62, x, y, -2.65, M.darkWood); log.rotation.x = Math.PI / 2;
  const end = cyl(.073, .073, .008, x, y, -2.332, M.lightWood, root, 10); end.rotation.x = Math.PI / 2;
  const ring = mesh(new THREE.TorusGeometry(.041, .005, 3, 10), M.wood, x, y, -2.324); ring.rotation.z = range(0, 2);
 }
 box(.82, .04, .8, 5.93, .88, -2.65, M.wood, root, .015);
 // A few fallen twigs and complete five-petal flowers nestle at the tree roots.
 for (let i = 0; i < 17; i++) {
  const x = range(4.3, 6.65), z = range(3.1, 6.6);
  if (i % 3 === 0) beam([x, .266, z], [x + .13, .269, z + .16], .008, M.wood);
  else for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; const o = ball(.022, x + Math.cos(a) * .027, .263, z + Math.sin(a) * .027, M.pink[i % 4], root, 0); o.scale.y = .15; o.castShadow = false; }
 }
 // Small ripples and a reflected strip of sky in the hand-washing basin.
 const rippleMaterial = new THREE.MeshBasicMaterial({ color: '#d9e7d3', transparent: true, opacity: .36, depthWrite: false });
 const ripples = [];
 for (let i = 0; i < 3; i++) {
  const ring = mesh(new THREE.TorusGeometry(.08 + i * .075, .004, 4, 40), rippleMaterial.clone(), -5.18, 1.053, -.43);
  ring.rotation.x = -Math.PI / 2; ring.scale.y = .65; ring.castShadow = false; ripples.push(ring);
 }
 return elapsed => ripples.forEach((r, i) => { const t = (elapsed * .20 + i / 3) % 1; r.scale.setScalar(.65 + t * .75); r.material.opacity = (1 - t) * .25; });
}
