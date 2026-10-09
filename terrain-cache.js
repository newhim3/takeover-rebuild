/* Native territory rendering is independent of camera position and zoom. */
(function(root){'use strict';
class TerrainCache{
 constructor(createCanvas,limits={},capacity=2){this.createCanvas=createCanvas;this.limits=limits;this.capacity=capacity;this.entries=new Map();}
 get(level,native,owners,width,height){
  const key=level+':'+JSON.stringify(Object.entries(owners).sort(([a],[b])=>Number(a)-Number(b)));
  let item=this.entries.get(key);
  if(item?.native===native){this.entries.delete(key);this.entries.set(key,item);return item;}
  const limit=this.limits[level]||{left:0,top:0,right:width,bottom:height},left=Math.floor(Math.min(0,limit.left))-48,top=Math.floor(Math.min(0,limit.top))-48;
  const canvas=this.createCanvas();canvas.width=Math.ceil(Math.max(width,limit.right))-left+48;canvas.height=Math.ceil(Math.max(height,limit.bottom))-top+48;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.translate(-left,-top);(native.drawGround||native.draw).call(native,canvas,owners);
  // Scan once when a territory changes, never while the camera is moving.
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let x0=canvas.width,y0=canvas.height,x1=0,y1=0,found=false;
  // Interior pixels cannot change a row's left/right bounds. Read the two
  // outer edges only, retaining the exact alpha threshold and complete pixels
  // below for scenery-foot support checks (including islands and holes).
  for(let y=0;y<canvas.height;y++){
   const row=y*canvas.width*4+3;let first=0;
   while(first<canvas.width&&pixels[row+first*4]<20)first++;
   if(first===canvas.width)continue;
   let last=canvas.width-1;while(last>first&&pixels[row+last*4]<20)last--;
   found=true;if(first<x0)x0=first;if(last+1>x1)x1=last+1;if(y<y0)y0=y;y1=y+1;
  }
  const bounds=found?{left:left+x0,top:top+y0,right:left+x1,bottom:top+y1}:{left:0,top:0,right:width,bottom:height};
  const objects=(native.objects?native.objects(owners):[]).filter(o=>{
   // A viewport export can contain scenery beyond the island. Retain complete
   // silhouettes only when their original foot is supported by original ground.
   if(o.footX===undefined)return true;
   const fx=Math.round(o.x+o.footX-left),fy=Math.round(o.y+o.footY-top);
   for(let dy=-12;dy<=0;dy+=3)for(let dx=-12;dx<=12;dx+=3){const x=fx+dx,y=fy+dy;if(x>=0&&y>=0&&x<canvas.width&&y<canvas.height&&pixels[(y*canvas.width+x)*4+3]>=20)return true;}
   return false;
  });
  item={native,canvas,left,top,bounds,objects};this.entries.set(key,item);
  while(this.entries.size>this.capacity)this.entries.delete(this.entries.keys().next().value);
  return item;
 }
}
if(typeof module!=='undefined')module.exports=TerrainCache;else root.TerrainCache=TerrainCache;
})(typeof window!=='undefined'?window:globalThis);
