import * as THREE from 'three';

// Small, seeded material studies: restrained colour variation plus fine relief.
// The surface reads as timber / dressed stone without relying on remote textures.
export function detailMaterials(materials, renderer) {
 let seed = 729;
 const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
 function texture(kind, size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = kind === 'ground' ? '#c7c3ae' : '#ded8cd'; ctx.fillRect(0, 0, size, size);
  const pixels = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
   const i = (y * size + x) * 4;
   let v = (rand() - .5) * (kind === 'wood' ? 8 : 19);
   if (kind === 'wood') v += Math.sin(x * .24 + Math.sin(y * .024) * 1.6 + Math.sin(x * .061) * 2) * 3 + Math.sin(x * .8 + y * .006) * 2;
   else v += Math.sin(x * .037 + Math.sin(y * .027) * 2) * 1.5 + Math.sin(y * .051 + x * .011) * 1.5;
   for (let j = 0; j < 3; j++) pixels.data[i + j] = Math.max(0, Math.min(255, pixels.data[i + j] + v));
  }
  ctx.putImageData(pixels, 0, 0);
  if (kind === 'wood') {
   for (let i = 0; i < 95; i++) {
    const x = rand() * size, y = rand() * size;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - 3, y + 30, x + 5, y + 90, x + 1, y + 160);
    ctx.strokeStyle = `rgba(87,64,41,${.04 + rand() * .1})`; ctx.lineWidth = rand() * 1.2 + .4; ctx.stroke();
   }
   for (let i = 0; i < 3; i++) { const x = rand() * size, y = rand() * size;
    for (let r = 2; r < 10; r += 2) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 2.7, .06, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(92,67,43,.13)'; ctx.lineWidth = .7; ctx.stroke(); }
   }
  } else {
   for (let i = 0; i < (kind === 'ground' ? 14500 : 3800); i++) {
    const x = rand() * size, y = rand() * size, r = rand() * 1.3 + .3;
    ctx.fillStyle = rand() > .4 ? 'rgba(83,79,65,.14)' : 'rgba(255,250,229,.38)'; ctx.fillRect(x, y, r * 1.5, r);
   }
   if (kind === 'stone') for (let i = 0; i < 6; i++) {
    const x = rand() * size, y = rand() * size;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 9, y + 6); ctx.lineTo(x + 17, y + 3); ctx.lineTo(x + 23, y + 13);
    ctx.lineWidth = .65; ctx.strokeStyle = 'rgba(98,92,77,.19)'; ctx.stroke();
   }
  }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return map;
 }
 const wood = texture('wood'), stone = texture('stone'), earth = texture('ground', 1024);
 for (const key of ['wood', 'lightWood', 'darkWood', 'red', 'redLight', 'redDark']) {
  const m = materials[key]; m.map = wood;
  m.bumpMap = wood.clone(); m.bumpMap.colorSpace = THREE.NoColorSpace; m.bumpScale = key.startsWith('red') ? .0015 : .005;
  m.roughnessMap = m.bumpMap;
 }
 for (const key of ['stone', 'stoneLight', 'stoneDark']) {
  const m = materials[key]; m.map = stone;
  m.bumpMap = stone.clone(); m.bumpMap.colorSpace = THREE.NoColorSpace; m.bumpScale = .012;
  m.roughnessMap = m.bumpMap;
 }
 materials.ground.map = earth; materials.ground.bumpMap = earth.clone(); materials.ground.bumpMap.colorSpace = THREE.NoColorSpace; materials.ground.bumpScale = .018;
 materials.white.map = stone; materials.white.bumpMap = stone.clone(); materials.white.bumpMap.colorSpace = THREE.NoColorSpace; materials.white.bumpScale = .002;
 for (const key of ['roof', 'roofEdge', 'tile']) {
  const m = materials[key]; m.map = stone; m.bumpMap = stone.clone(); m.bumpMap.colorSpace = THREE.NoColorSpace; m.bumpScale = .018;
 }
}
