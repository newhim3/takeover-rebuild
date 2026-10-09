/* Appended inside each isolated JPEXS map closure by restore-native-maps.py. */
var objectTextureCache=new Map();
function layerContext(target){canvas=target;const ctx=target.getContext('2d'),m=ctx.getTransform();if(!ctx._matrix)enhanceContext(ctx);ctx._matrix=[m.a,m.b,m.c,m.d,m.e,m.f];return ctx;}
function objectTexture(item){
 const linear=item.matrix.slice(0,4),key=JSON.stringify([item.obj,linear,item.frame,item.ratio,item.time,item.ctrans,item.blendMode]);let cached=objectTextureCache.get(key);if(cached)return cached;
 for(const size of [256,512,1024]){
  const c=createCanvas(size,size),ctx=layerContext(c),half=size/2;ctx.setTransform(1,0,0,1,half,half);placeRaw(item.obj,c,ctx,[...linear,0,0],item.ctrans,item.blendMode,item.frame,item.ratio,item.time);
  const data=ctx.getImageData(0,0,size,size).data;let left=size,top=size,right=0,bottom=0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(data[(y*size+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
  if(right===0)return null;if((left===0||top===0||right===size||bottom===size)&&size<1024)continue;
  if(left===0||top===0||right===size||bottom===size)throw Error('Native decoration exceeds its texture bounds: '+item.obj);
  const image=createCanvas(right-left,bottom-top);image.getContext('2d').drawImage(c,left,top,right-left,bottom-top,0,0,right-left,bottom-top);
  let weight=0,footSum=0;for(let y=Math.max(top,bottom-3);y<bottom;y++)for(let x=left;x<right;x++){const a=data[(y*size+x)*4+3];weight+=a;footSum+=x*a;}
  cached={image,offsetX:left-half,offsetY:top-half,footX:(weight?footSum/weight:(left+right)/2)-half,footY:bottom-half};objectTextureCache.set(key,cached);return cached;
 }
}
function collectNativeObjects(owners){
 ownerFrames=owners;const scratch=createCanvas(1,1),ctx=layerContext(scratch),items=[];
 try{for(const region of nativeObjectRegions){ctx.save();ctx.transform(...region.matrix);objectCollector=items;objectLocation=region.location;eval('sprite'+region.symbol+'(ctx,new cxform(0,0,0,0,255,255,255,255),0,0,ownerTime(region.location))');objectCollector=null;ctx.restore();}
  return items.flatMap(item=>{const texture=objectTexture(item);return texture?[{x:item.matrix[4],y:item.matrix[5],location:item.location,...texture}]:[];});
 }finally{objectCollector=null;canvas=null;}
}
