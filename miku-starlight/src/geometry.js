import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { animeMaterial } from './anime-material.js';

export function geometryTools(root) {
 const unitBox=new THREE.BoxGeometry(1,1,1);
 const mesh=(g,m,x=0,y=0,z=0,parent=root)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(w,h,d,x,y,z,m,parent=root,r=0)=>{const o=mesh(r?new RoundedBoxGeometry(w,h,d,2,r):unitBox,m,x,y,z,parent);if(!r)o.scale.set(w,h,d);return o;};
 const cylinder=(r,h,x,y,z,m,parent=root,segments=16)=>mesh(new THREE.CylinderGeometry(r,r,h,segments),m,x,y,z,parent);
 const beam=(a,b,r,m,parent=root)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b);const o=cylinder(r,p.distanceTo(q),...p.clone().add(q).multiplyScalar(.5).toArray(),m,parent,8);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),q.sub(p).normalize());return o;};
 const curve=(points,r,m,parent=root)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,6,false),m,0,0,0,parent);
 const ring=(r,t,x,y,z,m,parent=root)=>mesh(new THREE.TorusGeometry(r,t,8,96),m,x,y,z,parent);
 const panel=(text,w,h,x,y,z,options={})=>{
  const {parent=root,bg='#111f31',color='#b9ffef',font='sans-serif',emissive=.15}=options;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');
  ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.textAlign='center';ctx.textBaseline='middle';
  const lines=text.split('\n');ctx.fillStyle=color;ctx.font=`600 ${Math.min(c.height/(lines.length+.45),112)}px ${font}`;
  lines.forEach((line,i)=>ctx.fillText(line,512,c.height*(i+.5)/lines.length));
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
  return mesh(new THREE.PlaneGeometry(w,h),animeMaterial('#ffffff',{map,emissive:'#ffffff',emissiveMap:map,emissiveIntensity:emissive,roughness:.9}),x,y,z,parent);
 };
 return {mesh,box,cylinder,beam,curve,ring,panel};
}
export function batchStatic(root,excluded=[]){
 root.updateMatrixWorld(true);const moving=new Set(excluded),groups=new Map();
 root.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||o.material.transparent||o.material.isShaderMaterial)return;
  for(let p=o;p&&p!==root;p=p.parent)if(moving.has(p))return;
  const key=`${o.material.uuid}:${o.castShadow}:${o.receiveShadow}:${Object.keys(o.geometry.attributes).sort().join(',')}`;
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
 });
 for(const objects of groups.values()){
  if(objects.length<2)continue;
  const gs=objects.map(o=>(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld));
  const merged=mergeGeometries(gs);if(merged){const m=new THREE.Mesh(merged,objects[0].material);m.castShadow=objects[0].castShadow;m.receiveShadow=objects[0].receiveShadow;objects.forEach(o=>o.removeFromParent());root.add(m);}gs.forEach(g=>g.dispose());
 }
}
