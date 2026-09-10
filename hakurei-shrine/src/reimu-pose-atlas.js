// Import genuinely different hand/broom/body poses instead of warping one image.
// Source-cell guides are measured against the 1448×1086 generated pose sheet.
export async function createReimuAtlas() {
 const url=typeof __REIMU_MOTION__==='string'?__REIMU_MOTION__:'/assets/reimu/reimu-motion-v2.png';
 const image=new Image();image.src=url;await image.decode();
 const raw=document.createElement('canvas');raw.width=image.width;raw.height=image.height;
 const ctx=raw.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,raw.width,raw.height),data=pixels.data;
 // Remove the generated neutral checker matte. Warm ivory cloth is preserved.
 const visited=new Uint8Array(raw.width*raw.height),queue=new Int32Array(visited.length);
 const neutral=i=>{const p=i*4,r=data[p],g=data[p+1],b=data[p+2];return Math.max(r,g,b)-Math.min(r,g,b)<15&&Math.min(r,g,b)>155;};
 for(let origin=0;origin<visited.length;origin++){
  if(visited[origin]||!neutral(origin))continue;
  let head=0,tail=1,min=255,max=0,touchesEdge=false;queue[0]=origin;visited[origin]=1;
  while(head<tail){const i=queue[head++],x=i%raw.width,y=Math.floor(i/raw.width),v=data[i*4];min=Math.min(min,v);max=Math.max(max,v);
   if(x===0||y===0||x===raw.width-1||y===raw.height-1)touchesEdge=true;
   for(const n of [x>0?i-1:-1,x<raw.width-1?i+1:-1,y>0?i-raw.width:-1,y<raw.height-1?i+raw.width:-1])if(n>=0&&!visited[n]&&neutral(n)){visited[n]=1;queue[tail++]=n;}
  }
  if(touchesEdge)for(let j=0;j<tail;j++)data[queue[j]*4+3]=0;
 }
 ctx.putImageData(pixels,0,0);
 const width=272,height=208,frames=12;
 const canvas=document.createElement('canvas');canvas.width=width*frames;canvas.height=height;
 const out=canvas.getContext('2d',{willReadFrequently:true});out.imageSmoothingEnabled=false;
 // Sole anchors are measured individually; fixed scale preserves the crouch.
 const cells=[
  [0,0,380,355,180,338],[390,0,377,355,534,338],[766,0,350,355,890,338],[1116,0,332,355,1253,338],
  [0,356,390,357,191,697],[391,356,370,357,541,697],[763,356,350,357,899,698],[1115,356,333,357,1265,698],
  [0,714,380,372,176,1056],[390,714,372,372,546,1056],[763,710,350,376,902,1020],[1115,714,333,372,1264,1056],
 ];
 const scale=.575,baseline=200;
 for(let frame=0;frame<12;frame++){
  const [x,y,w,h,footX,footY]=cells[frame],ratioX=image.width/1448,ratioY=image.height/1086;
  const dx=width/2-(footX-x)*scale,dy=baseline-(footY-y)*scale;
  out.drawImage(raw,x*ratioX,y*ratioY,w*ratioX,h*ratioY,frame*width+Math.round(dx),Math.round(dy),Math.round(w*scale),Math.round(h*scale));
 }
 const cleaned=out.getImageData(0,0,canvas.width,canvas.height);
 for(let i=0;i<cleaned.data.length;i+=4){cleaned.data[i+3]=cleaned.data[i+3]>127?255:0;for(let c=0;c<3;c++)cleaned.data[i+c]=Math.min(255,Math.round(cleaned.data[i+c]/4)*4);}
 out.putImageData(cleaned,0,0);
 return{canvas,width,height,frames,footInset:(height-baseline)/height*2,source:'generated-pose-sheet-v2'};
}
