import * as THREE from 'three';
import { animeMaterial as mat } from './anime-material.js';

export function addAudience({root,M,box,mesh,cylinder,beam,random,range}){
 const moving=[],arms=[];
 const clothes=['#344358','#446a74','#675579','#697b85','#364d4d'].map(c=>mat(c,{roughness:.95}));
 const skins=['#bd9b88','#d6bda5','#a78a78'].map(c=>mat(c,{roughness:.95}));
 const hairs=['#25323c','#51483f','#34313e','#7a7062'].map(c=>mat(c));
 let people=0;
 for(const side of [-1,1])for(let row=0;row<5;row++)for(let col=0;col<4;col++){
  const x=side*(3.05+col*1.03)+range(-.08,.08),z=1.37+row*1.22+range(-.13,.13);
  const person=new THREE.Group();person.position.set(x,.22,z);person.rotation.y=-side*.13;const scale=range(.86,1.08);person.scale.setScalar(scale);root.add(person);
  const skin=skins[people%3],hair=hairs[people%4],shirt=clothes[people%5];
  for(const s of [-1,1]){box(.11,.23,.12,s*.085,.20,0,M.dark,person,.015);box(.14,.09,.21,s*.085,.055,-.018,M.black,person,.025);}
  box(.34,.39,.21,0,.50,0,shirt,person,.055);cylinder(.068,.10,0,.746,0,skin,person,10);
  const head=mesh(new THREE.SphereGeometry(.173,12,10),skin,0,.91,0,person);head.scale.set(.93,1.06,1);
  mesh(new THREE.SphereGeometry(.18,12,8,0,Math.PI*2,0,Math.PI*.64),hair,0,.94,.016,person);
  if(people%3===0)box(.26,.25,.115,0,.83,.11,hair,person,.04);
  for(const s of [-1,1])box(.022,.025,.008,s*.061,.915,-.17,M.black,person);
  for(const s of [-1,1]){
   const arm=new THREE.Group();arm.position.set(s*.19,.64,0);person.add(arm);moving.push(arm);
   beam([0,0,0],[s*.025,.22,-.07],.05,shirt,arm);beam([s*.025,.22,-.07],[s*.025,.41,-.08],.035,skin,arm);
   mesh(new THREE.SphereGeometry(.044,8,6),skin,s*.025,.41,-.08,arm);
   if(people%8===0&&s===1){box(.10,.18,.025,s*.025,.50,-.08,M.black,arm,.01);box(.07,.13,.008,s*.025,.50,-.096,M.cyan,arm);}
   else {cylinder(.025,.085,s*.025,.455,-.08,M.dark,arm,8);cylinder(.020,.25,s*.025,.61,-.08,(people+col)%4===0?M.pink:M.cyan,arm,8);}
   arms.push({object:arm,side:s,phase:people*.83+s*.3,raised:random()>.18});
  }
  people++;
 }
 // A compact sound desk at the back of the audience, with faders and meters.
 box(2.15,.51,.74,0,.48,6.80,M.dark,root,.045);box(2.28,.10,.89,0,.78,6.8,M.metal,root,.035);
 for(let i=0;i<12;i++){const x=-.95+i*.17;box(.012,.009,.28,x,.837,6.82,M.black);box(.07,.025,.04,x,.858,6.78+(i%3)*.075,M.silver);cylinder(.025,.03,x,.851,6.55,M.dark,root,8);}
 for(const x of [-.6,.6]){const screen=box(.38,.26,.035,x,1.00,6.62,M.black,root,.012);screen.rotation.x=-.17;box(.31,.18,.01,x,1.00,6.64,M.blue);}
 return{moving,count:people,update:(elapsed,beat)=>{for(const a of arms){const pulse=Math.sin(beat*Math.PI*.5+a.phase);a.object.rotation.z=a.side*(a.raised?.19:.7)+pulse*.16;a.object.rotation.x=-.11+Math.sin(elapsed*1.25+a.phase)*.09;}}};
}
