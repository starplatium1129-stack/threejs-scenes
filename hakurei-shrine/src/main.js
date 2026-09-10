import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createReimu } from './reimu.js';
import { detailMaterials } from './surface-detail.js';
import { addGardenDetail } from './garden-detail.js';
import { animeMaterial } from './anime-material.js';
import { createBotanicalBuilder } from './botanical.js';
import { architecturalFinish } from './architectural-finish.js';
import { groundVegetation } from './ground-vegetation.js';
import { createAtmosphere } from './sky-cycle.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#c8d1d1');
scene.fog = new THREE.Fog('#c8d1d1', 40, 85);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.13;
document.body.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label', '可拖动旋转、滚轮缩放的博丽神社微缩场景');
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, .1, 110);
camera.position.set(19.3, 17.1, 25);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = .055;
controls.minDistance = 10;
controls.maxDistance = 43;
controls.maxPolarAngle = Math.PI * .485;
controls.minPolarAngle = .15;
controls.enablePan = false;
controls.update();
const hemisphere = new THREE.HemisphereLight('#d9e7f1', '#566057', 1.35); scene.add(hemisphere);
const sun = new THREE.DirectionalLight('#fff0d8', 3.1);
sun.position.set(-9, 16, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 45 });
sun.shadow.normalBias = .018;
sun.shadow.bias = -.00015;
sun.shadow.radius = 3;
scene.add(sun);
const fill = new THREE.DirectionalLight('#c4dfef', .65);
fill.position.set(8, 7, -9); scene.add(fill);

let seed = 43;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const range = (a, b) => a + random() * (b - a);
const gradient = new THREE.DataTexture(new Uint8Array([100, 166, 220, 255]), 4, 1, THREE.RedFormat);
gradient.minFilter = gradient.magFilter = THREE.NearestFilter; gradient.needsUpdate = true;
const mat = animeMaterial;
const characterMat = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });
const M = {
 red: mat('#a84a40', { roughness:.62 }), redLight: mat('#b65c4d', { roughness:.59 }), redDark: mat('#763e37'),
 wood: mat('#79614b'), lightWood: mat('#a08b6b'), darkWood: mat('#4c4036'),
 white: mat('#dddcd1'), paper: mat('#eee9db', { side: THREE.DoubleSide }), window: mat('#eee9db', { side: THREE.DoubleSide }),
 roof: mat('#3f494b', { roughness:.58 }), roofEdge: mat('#2d3538', { roughness:.55 }), tile: mat('#505b5d', { roughness:.52 }),
 stone: mat('#919b98'), stoneLight: mat('#b5bbb3'), stoneDark: mat('#657471'),
 ground: mat('#aaa997'), moss: mat('#65785d'), gold: mat('#b4a074', { metalness:.6, roughness:.4 }),
 leaf: [mat('#4b6554'), mat('#677e5c'), mat('#82956c'), mat('#385747')],
 pink: [mat('#bd9098'), mat('#d6afb4'), mat('#ead0cd'), mat('#ab7e8a')],
};
detailMaterials(M, renderer);
const root = new THREE.Group(); scene.add(root);
const animated = [];
const geoBox = new THREE.BoxGeometry(1, 1, 1);
function mesh(geo, material, x, y, z, parent = root) {
 const o = new THREE.Mesh(geo, material); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}
function box(w, h, d, x, y, z, material, parent = root, round = 0) {
 if (!round && w > .3 && h > .1 && d > .2) round = Math.min(.012, h * .04);
 let geometry = round ? new RoundedBoxGeometry(w, h, d, 2, round) : geoBox;
 if ([M.wood, M.lightWood, M.darkWood, M.red, M.redLight, M.redDark].includes(material) && w > h && w > d) {
  if (!round) geometry = geometry.clone();
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) { const u = uv.getX(i); uv.setX(i, uv.getY(i)); uv.setY(i, 1 - u); }
 }
 const o = mesh(geometry, material, x, y, z, parent);
 if (!round) o.scale.set(w, h, d); return o;
}
function cyl(r, rt, h, x, y, z, material, parent = root, segments = 10) { return mesh(new THREE.CylinderGeometry(rt, r, h, segments), material, x, y, z, parent); }
function ball(r, x, y, z, material, parent = root, detail = 1) { return mesh(new THREE.IcosahedronGeometry(r, detail), material, x, y, z, parent); }
function beam(a, b, radius, material, parent = root) {
 const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
 const o = cyl(radius, radius, start.distanceTo(end), ...start.clone().add(end).multiplyScalar(.5).toArray(), material, parent);
 o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize()); return o;
}
function curve(points, radius, material, parent = root) {
 const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
 return mesh(new THREE.TubeGeometry(path, 32, radius, 6, false), material, 0, 0, 0, parent);
}
function textPanel(text, w, h, x, y, z, parent = root, bg = '#4d5347', color = '#eddfbe') {
 const c = document.createElement('canvas'); c.width = 256; c.height = 256 * h / w;
 const ctx = c.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
 ctx.strokeStyle = '#b8a176'; ctx.lineWidth = 9; ctx.strokeRect(8, 8, c.width - 16, c.height - 16);
 ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
 const letters = text.split('\n'); ctx.font = `bold ${Math.min(c.height / (letters.length + .8), 72)}px serif`;
 letters.forEach((line, i) => ctx.fillText(line, 128, c.height * (i + .5) / letters.length));
 const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
 return mesh(new THREE.PlaneGeometry(w, h), mat('#ffffff', { map: tex }), x, y, z, parent);
}

// A continuous, rounded square plinth with individually laid masonry and timber courses.
box(15, .78, 15, 0, -.57, 0, M.stoneDark, root, .16);
for (let side = 0; side < 4; side++) {
 const edge = new THREE.Group(); edge.rotation.y = side * Math.PI / 2; root.add(edge);
 for (let row = 0; row < 2; row++) for (let i = 0; i < 15; i++) {
  const x = -6.97 + i * .994;
  box(.95, .3, .15, x, -.76 + row * .35, 7.49, [M.stone, M.stoneDark, M.stoneLight][Math.floor(random() * 3)], edge, .035);
 }
 for (let i = 0; i < 20; i++) box(.025, .17, .025, -7.1 + i * .75, -.13, 7.54, M.darkWood, edge);
}
box(15.1, .22, 15.1, 0, -.13, 0, M.wood, root, .085);
box(15.25, .12, 15.25, 0, .035, 0, M.lightWood, root, .09);
box(14.98, .16, 14.98, 0, .16, 0, M.ground, root, .12);
const groundY = .245;
const backdrop = mesh(new THREE.PlaneGeometry(200, 200), mat('#b8c3c2'), 0, -1.04, 0, scene);
backdrop.rotation.x = -Math.PI / 2; backdrop.castShadow = false;
// Raised rear shrine terrace and generous open forecourt.
box(9, .36, 6, .3, .4, -3.9, M.stone, root, .08);
box(9.1, .12, 6.1, .3, .62, -3.9, M.stoneLight, root, .05);
for (let i = 0; i < 9; i++) box(.93, .27, .08, -3.7 + i, .41, -.87, i % 3 ? M.stone : M.stoneDark, root, .02);
for (let i = 0; i < 3; i++) box(3.9 - i * .08, .14, .56, .2, .31 + i * .12, -.15 - i * .48, M.stoneLight, root, .035);
const paving = [];
for (let row = 0; row < 9; row++) for (let col = 0; col < 3; col++) {
 const x = (col - 1) * .83 + .2, z = 6.58 - row * .76;
 const tile = box(.79, .07, .7, x, .27, z, random() > .3 ? M.stoneLight : M.stone, root, .035);
 tile.rotation.y = range(-.02, .02); paving.push({ x, z, w: .79, d: .7, y: .305 });
 if (random() > .75) { const crack = box(.22, .004, .009, x + .15, .308, z + .12, M.stoneDark); crack.rotation.y = -.7; }
}
for (let i = 0; i < 12; i++) box(.62, .045, .54, 3.05 + Math.sin(i * .6) * .3, .264, 5.9 - i * .64, i % 2 ? M.stone : M.stoneLight, root, .08);
for (let s of [-1, 1]) for (let i = 0; i < 16; i++) box(.18, .10, .42, .2 + s * 1.38, .27, 6.7 - i * .45, M.stone, root, .035);

function roof(w, d, y, z, parent, rise = 1.5) {
 // Curved gable roof: the ridge runs across x, with gently lifted eave tips.
 const slopeY = t => y + rise * (1 - t) ** 1.32 + .26 * t ** 7;
 for (const sign of [-1, 1]) {
  const vertices = [], indices = []; const rows = 14;
  for (let j = 0; j <= rows; j++) { const t = j / rows; for (const x of [-w / 2, w / 2]) vertices.push(x, slopeY(t), z + sign * d / 2 * t); }
  for (let j = 0; j < rows; j++) { const k = j * 2; indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); g.setIndex(indices); g.computeVertexNormals();
  const surface = mesh(g, M.roof, 0, 0, 0, parent); surface.material.side = THREE.DoubleSide;
  // Each shallow curved pan overlaps the next row. Geometry gives the seams a
  // real lip; the cover tiles above it shed water down the roof pitch.
  const columns = Math.round(w / .24), courses = Math.max(3, Math.round(d / .48));
  for (let col = 0; col < columns; col++) for (let row = 0; row < courses; row++) {
   const vertices = [], uvs = [], indices = [];
   const x0 = -w / 2 + col * w / columns;
   const t0 = row / courses, t1 = Math.min(1, (row + 1.10) / courses);
   for (let v = 0; v < 2; v++) for (let u = 0; u <= 6; u++) {
    const t = v ? t1 : t0, across = u / 6;
    vertices.push(x0 + across * w / columns, slopeY(t) + .025 + .023 * (2 * across - 1) ** 2 + v * .017, z + sign * d / 2 * t);
    uvs.push(across, v);
   }
   for (let u = 0; u < 6; u++) indices.push(u, u + 7, u + 1, u + 1, u + 7, u + 8);
   const tile = new THREE.BufferGeometry(); tile.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); tile.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); tile.setIndex(indices); tile.computeVertexNormals();
   const m = (row + col * 3) % 7 === 0 ? M.tile : M.roof; m.side = THREE.DoubleSide;
   mesh(tile, m, 0, 0, 0, parent);
  }
  for (let i = 0; i <= Math.round(w / .24); i++) {
   const x = -w / 2 + i * w / Math.round(w / .24);
   curve(Array.from({ length: 9 }, (_, j) => { const t = j / 8; return [x, slopeY(t) + .061, z + sign * d / 2 * t]; }), .033, M.tile, parent);
   const end = cyl(.065, .065, .045, x, slopeY(1) + .005, z + sign * (d / 2 + .055), M.tile, parent, 12);
   end.rotation.x = Math.PI / 2;
   const rim = mesh(new THREE.TorusGeometry(.043, .009, 4, 10), M.roofEdge, x, slopeY(1) + .005, z + sign * (d / 2 + .083), parent);
   ball(.012, x, slopeY(1) + .005, z + sign * (d / 2 + .087), M.stoneDark, parent, 0);
  }
  for (let j = 1; j < courses; j++) { const t = j / courses; beam([-w / 2, slopeY(t) + .04, z + sign * d / 2 * t], [w / 2, slopeY(t) + .04, z + sign * d / 2 * t], .006, M.roofEdge, parent); }
  for (const x of [-w / 2, w / 2]) {
   curve(Array.from({ length: 9 }, (_, j) => [x, slopeY(j / 8) - .06, z + sign * d / 2 * j / 8]), .068, M.white, parent);
   curve(Array.from({ length: 9 }, (_, j) => [x, slopeY(j / 8) + .04, z + sign * d / 2 * j / 8]), .07, M.roofEdge, parent);
  }
  beam([-w / 2 - .07, slopeY(1), z + sign * d / 2], [w / 2 + .07, slopeY(1), z + sign * d / 2], .105, M.roofEdge, parent);
 }
 box(w + .35, .18, .22, 0, y + rise + .09, z, M.roofEdge, parent, .05);
 for (const x of [-w / 2 - .07, w / 2 + .07]) ball(.17, x, y + rise + .12, z, M.tile, parent);
}
const shrine = new THREE.Group(); shrine.position.set(.2, .68, -3.95); root.add(shrine);
box(6.35, .48, 3.85, 0, .29, 0, M.darkWood, shrine);
for (let i = 0; i < 25; i++) box(.25, .12, 4.45, -3.12 + i * .26, .59, .18, i % 4 ? M.lightWood : M.wood, shrine);
box(5.7, 2.54, 2.95, 0, 1.96, -.32, M.white, shrine);
for (const x of [-2.8, -1.4, 0, 1.4, 2.8]) {
 box(.17, 2.68, .18, x, 1.99, 1.19, M.red, shrine);
 box(.19, 2.68, .2, x, 1.99, -1.85, M.red, shrine);
}
for (let x of [-3.03, 3.03]) for (let z of [-1.88, .2, 1.97]) {
 box(.22, 2.8, .22, x, 1.99, z, M.red, shrine);
 box(.32, .16, .32, x, .73, z, M.darkWood, shrine);
 box(.4, .17, .43, x, 3.2, z, M.redLight, shrine);
}
for (let y of [.83, 2.82, 3.21]) box(6.3, .15, .22, 0, y, 1.28, M.red, shrine);
for (let s of [-1, 1]) {
 box(.13, .15, 3.7, 2.94 * s, 2.8, -.18, M.red, shrine);
 box(.13, .13, 3.7, 2.94 * s, 1.1, -.18, M.wood, shrine);
 for (let i = 0; i < 14; i++) box(.07, .49, .12, 2.91 * s, .98, -1.65 + i * .22, M.wood, shrine);
 // Paper side windows and their wooden lattice.
 box(.05, 1.16, 1.32, 2.867 * s, 2.01, -.33, M.window, shrine);
 for (let j = 0; j < 6; j++) box(.09, 1.23, .036, 2.91 * s, 2.01, -.94 + j * .245, M.wood, shrine);
 for (let j = 0; j < 4; j++) box(.09, .035, 1.34, 2.91 * s, 1.44 + j * .38, -.33, M.wood, shrine);
}
// Front shoji doors, slats, lintels, joinery and under-eave rafters.
for (const s of [-1, 1]) {
 box(1.13, 2.0, .09, .61 * s, 1.71, 1.31, M.darkWood, shrine);
 box(.97, 1.5, .03, .61 * s, 1.93, 1.365, M.window, shrine);
 for (let i = 0; i < 6; i++) box(.027, 1.52, .025, .61 * s - .46 + i * .184, 1.93, 1.392, M.wood, shrine);
 for (let i = 0; i < 6; i++) box(.98, .025, .026, .61 * s, 1.2 + i * .29, 1.394, M.wood, shrine);
 box(.055, .17, .04, .1 * s, 1.46, 1.41, M.gold, shrine);
 for (let i = 0; i < 7; i++) box(.10, 1.6, .08, s * 2.09 - .51 + i * .17, 1.91, 1.35, M.wood, shrine);
}
for (let i = 0; i < 19; i++) box(.10, .15, 4.53, -3.05 + i * .34, 3.27, .03, M.wood, shrine);
for (let x of [-2.8, -1.4, 0, 1.4, 2.8]) {
 box(.48, .15, .52, x, 3.35, 1.5, M.redLight, shrine);
 box(.30, .2, .41, x, 3.16, 1.5, M.red, shrine);
}
roof(7.55, 5.2, 3.3, -.18, shrine, 2.25);
// Triangular gable infill on both side elevations.
for (const side of [-1, 1]) {
 const shape = new THREE.Shape(); shape.moveTo(-2.42, 0);
 for (let i=0;i<=24;i++) { const px=-2.42+i*4.84/24,t=Math.abs(px)/2.6; shape.lineTo(px,2.25*(1-t)**1.32+.26*t**7); } shape.lineTo(2.42,0); shape.closePath();
 const panel = mesh(new THREE.ShapeGeometry(shape), mat('#e9dabe', { side: THREE.DoubleSide }), side * 3.02, 3.20, -.18, shrine); panel.rotation.y = Math.PI / 2;
 for(const sign of [-1,1]) curve(Array.from({length:12},(_,i)=>{const t=i/11*.91;return [side*3.07,3.18+2.25*(1-t)**1.32+.26*t**7,-.18+sign*2.6*t];}),.06,M.red,shrine);
 beam([side * 3.08, 3.37, -.18], [side * 3.08, 5.4, -.18], .075, M.red, shrine);
}
// A projecting entrance gable gives the worship area its own architectural focus.
const porch = new THREE.Group(); porch.position.set(0,0,2.05); porch.rotation.y=Math.PI/2; shrine.add(porch);
roof(1.66,2.9,3.15,0,porch,.83);
for(const s of [-1,1]) {
 box(.17,2.48,.17,s*1.27,1.9,2.64,M.red,shrine);
 box(.26,.16,.26,s*1.27,.76,2.64,M.darkWood,shrine);
 box(.36,.12,.35,s*1.27,3.05,2.64,M.redLight,shrine);
 beam([s*1.27,2.72,2.64],[s*.91,3.14,2.64],.045,M.redDark,shrine);
}
box(2.8,.13,.17,0,3.16,2.78,M.red,shrine);
const porchFace=new THREE.Shape();porchFace.moveTo(-1.35,0);
for(let i=0;i<=20;i++){const x=-1.35+i*2.7/20,t=Math.abs(x)/1.45;porchFace.lineTo(x,.83*(1-t)**1.32+.26*t**7);}porchFace.lineTo(1.35,0);porchFace.closePath();
mesh(new THREE.ShapeGeometry(porchFace),M.white,0,3.18,2.86,shrine);
beam([0,3.19,2.885],[0,3.98,2.885],.046,M.red,shrine);
const crest=mesh(new THREE.TorusGeometry(.13,.022,6,24),M.gold,0,3.59,2.9,shrine);
for(let i=0;i<3;i++)ball(.043,Math.sin(i*Math.PI*2/3)*.063,3.59+Math.cos(i*Math.PI*2/3)*.063,2.913,M.gold,shrine,2);
for (let i = 0; i < 4; i++) box(2.52, .15, .4, 0, .10 + i * .145, 3.04 - i * .38, M.wood, shrine);
for (const s of [-1, 1]) {
 for (let i = 0; i < 5; i++) { box(.09, .65, .09, s * (1.55 + i * .36), .97, 2.15, M.red, shrine); }
 box(1.7, .12, .13, s * 2.32, 1.31, 2.15, M.redLight, shrine);
 box(1.7, .08, .11, s * 2.32, .89, 2.15, M.red, shrine);
 for (let i = 0; i < 6; i++) box(.09, .65, .09, s * 3.1, .97, 1.75 - i * .61, M.red, shrine);
 box(.13, .12, 3.6, s * 3.1, 1.31, .23, M.redLight, shrine);
}
// Offering box with actual spaced top bars.
box(1.24, .56, .66, 0, .94, 1.99, M.wood, shrine, .025);
box(1.36, .08, .77, 0, 1.25, 1.99, M.darkWood, shrine);
for (let i = 0; i < 11; i++) box(.065, .05, .74, -.6 + i * .12, 1.31, 1.99, M.lightWood, shrine);
for (let s of [-1, 1]) box(.08, .5, .025, s * .5, .94, 2.335, M.gold, shrine);
textPanel('奉 納', .58, .24, 0, 1.01, 2.337, shrine, '#94654b');
textPanel('博 麗 神 社', 1.22, .38, 0, 3.05, 1.41, shrine);
const shimenawa = [];
for (let i = 0; i <= 24; i++) { const x = -2.72 + i * 5.44 / 24; shimenawa.push([x, 2.93 - .32 * (1 - (x / 2.72) ** 2), 1.69]); }
curve(shimenawa, .07, M.lightWood, shrine);
for (let i = 0; i < 38; i++) { const x = -2.7 + i * .145; const o = cyl(.077, .077, .027, x, 2.93 - .32 * (1 - (x / 2.72) ** 2), 1.69, M.gold, shrine, 7); o.rotation.z = .9; }
function shide(x, y, z, parent, size = 1) {
 const pivot = new THREE.Group(); pivot.position.set(x, y, z); parent.add(pivot);
 for (let i = 0; i < 4; i++) { const p = box(.13 * size, .20 * size, .012, (i % 2) * .08 * size, -.12 * size - i * .13 * size, 0, M.paper, pivot); p.rotation.z = i % 2 ? -.36 : .36; }
 animated.push({ object: pivot, phase: range(0, 6), amount: .075 });
}
for (const x of [-2.05, -1.06, 1.06, 2.05]) shide(x, 2.72 + .03 * Math.abs(x), 1.71, shrine, .76);
const bellRope = new THREE.Group(); bellRope.position.set(0, 2.86, 1.78); shrine.add(bellRope);
ball(.17, 0, -.17, 0, M.gold, bellRope, 2); cyl(.15, .12, .08, 0, -.29, 0, M.gold, bellRope);
curve([[0, -.3, 0], [.02, -.85, .02], [-.02, -1.4, .1], [0, -1.8, .22]], .037, M.white, bellRope);
for (let i = 0; i < 17; i++) { const o = cyl(.04, .04, .025, Math.sin(i * .5) * .014, -.34 - i * .083, i / 17 * .18, M.red, bellRope, 7); o.rotation.z = .6; }
cyl(.09, .045, .23, 0, -1.91, .22, M.gold, bellRope);
animated.push({ object: bellRope, phase: 1.7, amount: .023 });
const lanterns = [];
function lantern(x, y, z, parent = root, scale = 1) {
 const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(scale); parent.add(g);
 const glow = mat('#f8dcb0', { emissive: '#d9914c', emissiveIntensity: .16 });
 const body = mesh(new THREE.SphereGeometry(.22, 12, 12), glow, 0, 0, 0, g); body.scale.set(1, 1.43, 1);
 for (let i = 0; i < 7; i++) { const y0 = -.24 + i * .08; const r = .22 * Math.sqrt(1 - (y0 / .325) ** 2); const ring = mesh(new THREE.TorusGeometry(r, .007, 4, 16), M.lightWood, 0, y0, 0, g); ring.rotation.x = Math.PI / 2; }
 for (let sy of [-1, 1]) cyl(.135, .135, .06, 0, sy * .30, 0, M.darkWood, g);
 beam([0, .33, 0], [0, .5, 0], .015, M.darkWood, g);
 textPanel('奉\n納', .15, .3, 0, 0, .222, g, '#efce9d', '#8c4d3d');
 lanterns.push(glow); return g;
}
for (let x of [-2.3, 2.3]) lantern(x, 2.35, 1.89, shrine);

// Vermilion torii, offset to frame rather than hide the little maiden.
const torii = new THREE.Group(); torii.position.set(.2, groundY, 5.05); root.add(torii);
for (const s of [-1, 1]) {
 cyl(.25, .19, 3.35, s * 1.84, 1.7, 0, M.red, torii, 12);
 cyl(.28, .27, .39, s * 1.84, .22, 0, M.roofEdge, torii, 12);
 box(.72, .15, .66, s * 1.84, .04, 0, M.stoneLight, torii, .04);
 box(.64, .13, .24, s * 1.84, 2.55, 0, M.redDark, torii);
}
box(4.65, .22, .3, 0, 2.65, 0, M.red, torii);
box(.18, .62, .2, 0, 3.02, 0, M.red, torii);
curve([[-2.65, 3.6, 0], [-2.05, 3.47, 0], [0, 3.39, 0], [2.05, 3.47, 0], [2.65, 3.6, 0]], .16, M.roofEdge, torii);
curve([[-2.56, 3.38, 0], [-1.9, 3.29, 0], [0, 3.24, 0], [1.9, 3.29, 0], [2.56, 3.38, 0]], .13, M.redLight, torii);
textPanel('博\n麗', .36, .54, 0, 3.0, .17, torii);
curve([[-1.75, 2.57, .1], [0, 2.30, .1], [1.75, 2.57, .1]], .032, M.gold, torii);
for (let x of [-1.1, -.38, .38, 1.1]) shide(x, 2.31 + .09 * Math.abs(x), .12, torii, .52);

function stoneLantern(x, z) {
 const g = new THREE.Group(); g.position.set(x, groundY, z); root.add(g);
 box(.8, .15, .8, 0, .075, 0, M.stoneDark, g, .045);
 box(.61, .17, .61, 0, .21, 0, M.stone, g, .04);
 cyl(.22, .14, .84, 0, .70, 0, M.stoneLight, g, 6);
 box(.65, .15, .65, 0, 1.14, 0, M.stone, g, .025);
 box(.42, .42, .42, 0, 1.42, 0, M.darkWood, g);
 box(.30, .25, .435, 0, 1.43, 0, mat('#f3d396', { emissive: '#df9c4d', emissiveIntensity: .35 }), g);
 for (let xx of [-.22, .22]) for (let zz of [-.22, .22]) box(.1, .44, .1, xx, 1.42, zz, M.stoneLight, g);
 const cap = cyl(.55, .27, .28, 0, 1.77, 0, M.stone, g, 4); cap.rotation.y = Math.PI / 4;
 box(.86, .08, .86, 0, 1.64, 0, M.stoneDark, g, .05);
 ball(.13, 0, 1.98, 0, M.stoneLight, g);
}
for (const x of [-1.95, 2.35]) { stoneLantern(x, .65); stoneLantern(x, 5.7); }

// Side buildings and devotional objects.
const office = new THREE.Group(); office.position.set(5.35, groundY, -4.85); root.add(office);
box(2.18, .22, 2.5, 0, .13, 0, M.stone, office, .035);
box(1.95, 1.83, 2.1, 0, 1.13, 0, M.wood, office);
for (let i = 0; i < 13; i++) box(.11, 1.75, .05, -.91 + i * .15, 1.1, 1.08, M.lightWood, office);
box(.76, 1.5, .075, -.27, 1, 1.11, M.darkWood, office);
box(.62, 1.15, .025, -.27, 1.14, 1.16, M.window, office);
for (let i = 0; i < 5; i++) box(.025, 1.17, .03, -.55 + i * .14, 1.14, 1.19, M.wood, office);
for (let i = 0; i < 4; i++) box(.63, .025, .03, -.27, .63 + i * .33, 1.14, M.wood, office);
box(.14, 1.94, .14, -.94, 1.1, 1.07, M.darkWood, office);
box(.14, 1.94, .14, .94, 1.1, 1.07, M.darkWood, office);
roof(2.7, 2.9, 2.03, 0, office, .77);
textPanel('社務所', .64, .28, .48, 1.74, 1.15, office);
box(.9, .14, .52, -.27, .15, 1.4, M.stoneLight, office);
lantern(.85, 1.5, 1.38, office, .7);
function barrel(x, z, y = groundY) {
 cyl(.26, .29, .56, x, y + .28, z, M.lightWood);
 for (let h of [.12, .44]) { const ring = mesh(new THREE.TorusGeometry(.277, .025, 4, 12), M.darkWood, x, y + h, z); ring.rotation.x = Math.PI / 2; }
 cyl(.26, .26, .04, x, y + .57, z, M.wood);
}
barrel(6.65, -3.95); barrel(6.65, -4.65);
box(.77, .58, .66, 4.48, .54, -2.76, M.lightWood);
for (let i = 0; i < 3; i++) box(.8, .027, .68, 4.48, .35 + i * .20, -2.76, M.wood);
function rack(x, z, wishes = false) {
 const g = new THREE.Group(); g.position.set(x, groundY, z); root.add(g);
 for (let xx of [-.93, .93]) { box(.13, 1.88, .13, xx, .94, 0, M.wood, g); box(.5, .12, .5, xx, .06, 0, M.stone, g); }
 for (let y of [.85, 1.51]) box(2.0, .07, .07, 0, y, 0, M.darkWood, g);
 if (!wishes) roof(2.35, .74, 1.84, 0, g, .32);
 for (let row = 0; row < 2; row++) for (let i = 0; i < 7; i++) {
  const pivot = new THREE.Group(); pivot.position.set(-.77 + i * .255, 1.48 - row * .65, .07); g.add(pivot);
  if (wishes) {
   const paper = box(.16, .06, .05, 0, -.11, 0, M.paper, pivot); paper.rotation.z = range(-.5, .5);
   box(.035, .17, .02, .02, -.17, 0, M.paper, pivot);
  } else {
   beam([0, 0, 0], [0, -.1, 0], .008, M.gold, pivot);
   const shape = new THREE.Shape(); shape.moveTo(-.1, -.13); shape.lineTo(0, -.06); shape.lineTo(.1, -.13); shape.lineTo(.1, -.33); shape.lineTo(-.1, -.33); shape.closePath();
   mesh(new THREE.ShapeGeometry(shape), mat('#cba073', { side: THREE.DoubleSide }), 0, 0, 0, pivot);
   for (let j = 0; j < 3; j++) box(.014, .065, .005, -.05 + j * .05, -.22, .006, M.darkWood, pivot);
  }
  animated.push({ object: pivot, phase: range(0, 6), amount: .07 });
 }
}
rack(4.68, -.47); rack(-4.0, -1.06, true);
const notice = new THREE.Group(); notice.position.set(-5.6, groundY, 2.38); notice.rotation.y = .18; root.add(notice);
for (let x of [-.55, .55]) box(.12, 1.57, .12, x, .79, 0, M.darkWood, notice);
box(1.45, .93, .12, 0, 1.29, 0, M.wood, notice);
textPanel('境内のご案内\n博麗神社\nお参りは ご自由に', 1.29, .78, 0, 1.29, .07, notice, '#e7d7b7', '#715747');
roof(1.75, .55, 1.85, 0, notice, .22);
const wash = new THREE.Group(); wash.position.set(-5.05, groundY, -.45); root.add(wash);
box(2.1, .11, 1.84, 0, .06, 0, M.stone, wash, .06);
for (let x of [-.86, .86]) for (let z of [-.65, .65]) box(.12, 2.06, .12, x, 1.06, z, M.wood, wash);
roof(2.5, 2.15, 2.02, 0, wash, .62);
box(1.34, .6, .91, 0, .48, 0, M.stoneDark, wash, .08);
box(1.06, .025, .64, 0, .79, 0, mat('#83a9a2', { transparent: true, opacity: .85 }), wash);
for (let z of [-.43, .43]) box(1.40, .12, .15, 0, .8, z, M.stone, wash, .03);
for (let x of [-.62, .62]) box(.16, .12, .8, x, .8, 0, M.stone, wash, .03);
beam([-.59, .94, -.17], [.63, .94, -.17], .035, M.gold, wash);
for (let x of [-.3, .25]) { beam([x, .96, -.33], [x, .96, .32], .018, M.lightWood, wash); cyl(.073, .073, .09, x, .98, .30, M.lightWood, wash); }

function fence(x, z, length, rotate = 0) {
 const g = new THREE.Group(); g.position.set(x, groundY, z); g.rotation.y = rotate; root.add(g);
 const count = Math.round(length / .75);
 for (let i = 0; i <= count; i++) { const xx = -length / 2 + i * length / count; box(.12, .87, .12, xx, .44, 0, M.wood, g); box(.18, .08, .18, xx, .9, 0, M.darkWood, g); }
 for (let y of [.30, .67]) box(length + .13, .09, .095, 0, y, 0, M.lightWood, g);
}
fence(0, -7.1, 13.7); fence(-7.1, -1.5, 10.8, Math.PI / 2); fence(7.1, -1.5, 10.8, Math.PI / 2);
fence(-5.3, 7.07, 3.4); fence(5.3, 7.07, 3.4);

// Sculpted plants, clustered foliage and roots firmly planted within the plinth.
const foliage = [];
const { tree, shrub } = createBotanicalBuilder({ root, M, range, random, beam, curve, mat, foliage });
 tree(-5.25, -5.25, 1.37, true); tree(5.5, 3.8, 1.0, true); tree(-5.55, 5.1, .82, false); tree(3.75, -6.1, 1.17, false, true);
for (const [x, z, s] of [[-3.7, -6.6, 1.4], [-6.6, -3.2, 1.1], [3.7, 6.5, .9], [6.5, 5.4, 1.4], [-3.5, 4.9, 1], [-3.65, .5, .85], [3.9, 1.45, .8], [6.6, -.9, 1.15], [-6.6, 6.65, .8], [1.5, -6.8, 1]]) shrub(x, z, s);
for (let i = 0; i < 55; i++) {
 const x = range(-6.8, 6.8), z = range(-6.8, 6.8);
 if (Math.abs(x) < 3.6 && z < .7 || Math.abs(x - .2) < 1.55 || Math.abs(x) > 4.1 && z < 2.8) continue;
 const rock = ball(range(.08, .23), x, .27, z, random() > .5 ? M.stone : M.stoneDark); rock.scale.set(1.3, .7, 1);
}
const grasses = new THREE.Group(); root.add(grasses);
for (let i = 0; i < 135; i++) {
 const x = range(-6.85, 6.85), z = range(-6.8, 6.8);
 if (Math.abs(x) < 3.6 && z < .6 || Math.abs(x - .2) < 1.6 || Math.abs(x) > 4 && z < 2.7) continue;
 for (let j = 0; j < 3; j++) { const blade = mesh(new THREE.ConeGeometry(.023, range(.10, .24), 3), M.leaf[i % 4], x + j * .045, .32, z, grasses); blade.rotation.z = (j - 1) * .3; }
}
// A spare broom, bucket and small stacks beside the veranda.
beam([-3.13, .7, -1.30], [-3.53, 2.0, -1.50], .026, M.wood);
const bristles = cyl(.15, .048, .31, -3.1, .54, -1.28, M.gold); bristles.rotation.z = -.28;
barrel(-3.75, -2.38, .68);
for (let i = 0; i < 3; i++) box(.69, .16, .36, -3.3, .78 + i * .16, -4.9, M.lightWood);

const petals = [];
const petalGeo = new THREE.PlaneGeometry(.075, .045);
const petalMats = [mat('#e9a2ad', { side: THREE.DoubleSide }), mat('#f5c5c4', { side: THREE.DoubleSide }), mat('#b49b65', { side: THREE.DoubleSide })];
for (let i = 0; i < 175; i++) {
 const x = range(-6.9, 6.9), z = range(.6, 6.8);
 const p = mesh(petalGeo, petalMats[i % 3], x, groundY + .012, z); p.rotation.set(-Math.PI / 2, 0, range(0, Math.PI)); p.castShadow = false;
 if (Math.abs(x - .2) < 1.25) p.position.y = .316;
 petals.push(p);
}
const floating = [];
for (let i = 0; i < 27; i++) {
 const p = mesh(petalGeo, petalMats[i % 2], range(-6, 6), range(.7, 5.8), range(-5.5, 6.5));
 p.castShadow = false; floating.push({ object: p, speed: range(.11, .25), phase: range(0, 6) });
}
const moteGeo = new THREE.BufferGeometry();
moteGeo.setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 105 }, (_, i) => i % 3 === 1 ? range(.5, 4) : range(-6, 6)), 3));
const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: '#fff4cb', size: .032, transparent: true, opacity: .58, depthWrite: false })); root.add(motes);
const updateGarden = addGardenDetail({ root, shrine, M, box, mesh, ball, beam, cyl, random, range, mat });
architecturalFinish({ root, shrine, M, box, mesh, beam, cyl, range, random, mat });
const understory = groundVegetation({ root, mat });

// Batch immobile architectural parts; leave every animated pivot independently movable.
root.updateMatrixWorld(true);
const moving = new Set([...animated.map(a => a.object), ...foliage.map(f => f.object), ...petals, ...floating.map(f => f.object)]);
const batches = new Map();
root.traverse(o => {
 if (!o.isMesh || o.isInstancedMesh || o.material.transparent) return;
 for (let p = o; p && p !== root; p = p.parent) if (moving.has(p)) return;
 const key = `${o.material.uuid}:${o.castShadow}:${o.receiveShadow}:${Object.keys(o.geometry.attributes).sort().join(',')}`;
 if (!batches.has(key)) batches.set(key, []);
 batches.get(key).push(o);
});
for (const objects of batches.values()) {
 if (objects.length < 2) continue;
 const geometries = objects.map(o => {
  const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
  return g.applyMatrix4(o.matrixWorld);
 });
 const geometry = mergeGeometries(geometries);
 if (geometry) {
  const batch = new THREE.Mesh(geometry, objects[0].material);
  batch.castShadow = objects[0].castShadow; batch.receiveShadow = objects[0].receiveShadow;
  for (const o of objects) o.removeFromParent();
  root.add(batch);
 }
 for (const g of geometries) g.dispose();
}

function heightAt(x, z) {
 for (const p of paving) if (Math.abs(x - p.x) <= p.w / 2 && Math.abs(z - p.z) <= p.d / 2) return p.y;
 return groundY;
}
const atmosphere = createAtmosphere({ scene, renderer, hemisphere, sun, fill, backdrop, root, windowMaterial: M.window, lanterns });
const reimu = await createReimu({ THREE, root, camera, mat: characterMat, heightAt, petals });
let last = 0;
let elapsed = 0;
function frame(now) {
 requestAnimationFrame(frame);
 const dt = Math.min((now - last) / 1000, .05); last = now; elapsed += dt;
 controls.update();
 for (const a of animated) a.object.rotation.z = Math.sin(elapsed * 1.25 + a.phase) * a.amount;
 for (const f of foliage) { f.object.rotation.z = Math.sin(elapsed * .7 + f.phase) * .012; f.object.rotation.x = Math.cos(elapsed * .6 + f.phase) * .009; }
 for (let i = 0; i < lanterns.length; i++) lanterns[i].emissiveIntensity = .14 + Math.sin(elapsed * 1.7 + i) * .025;
 for (const f of floating) {
  f.object.position.y -= dt * f.speed;
  f.object.position.x += Math.sin(elapsed * .4 + f.phase) * dt * .065;
  f.object.rotation.set(elapsed * .65 + f.phase, elapsed * .3, f.phase);
  if (f.object.position.y < .32) f.object.position.set(range(-6, 6), range(4.7, 5.9), range(-5.5, 6.5));
 }
 motes.rotation.y = Math.sin(elapsed * .08) * .035;
 atmosphere.update(dt, elapsed);
 reimu.update(dt, elapsed);
 updateGarden(elapsed);
 understory.update(elapsed);
 renderer.render(scene, camera);
}
requestAnimationFrame(frame);
function resize() {
 camera.aspect = innerWidth / innerHeight;
 camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(17)) * Math.max(1, 1.3 / camera.aspect)));
 camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize); resize();
// Read-only inspection hooks for animation and rendering smoke tests.
window.__shrine = { scene, camera, renderer, controls, reimu, heightAt, understory, atmosphere, get elapsed() { return elapsed; } };


