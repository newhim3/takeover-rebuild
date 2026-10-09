/* Lossless raster cache of the original localized SVG timeline, including filters. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.join(__dirname,'..'),base=path.join(root,'assets/takeover/ui/ultimate'),out=path.join(base,'atlases');fs.mkdirSync(out,{recursive:true});
const specs=[['UltimateMessage1Class','神之降临',35],['UltimateMessage2Class','天灾陨星',50],['UltimateMessage3Class','墓穴召唤',52],['UltimateMessage4Class','大转化术',52]],bitmaps=new Map();
function svgFrame(key,n){return fs.readFileSync(path.join(base,key,n+'.svg'),'utf8').replace(/__ULT_BITMAP_([a-f0-9]+)__/g,(_,id)=>{if(!bitmaps.has(id))bitmaps.set(id,'data:image/png;base64,'+fs.readFileSync(path.join(base,'bitmaps',id+'.png')).toString('base64'));return bitmaps.get(id);});}
(async()=>{
 const result={};
 for(const [key,title,count]of specs){const cells=[],pages=[];let tiles=[],x=0,y=0,rowH=0,maxX=0,maxY=0;
  async function flush(){if(!tiles.length)return;const file=key+'-'+pages.length+'.webp';const pixels=Buffer.alloc(maxX*maxY*4);for(const tile of tiles)for(let row=0;row<tile.h;row++)tile.input.copy(pixels,((tile.top+row)*maxX+tile.left)*4,row*tile.w*4,(row+1)*tile.w*4);await sharp(pixels,{raw:{width:maxX,height:maxY,channels:4}}).webp({lossless:true,effort:4}).toFile(path.join(out,file));pages.push(file);tiles=[];x=y=rowH=maxX=maxY=0;}
  for(let n=1;n<=count;n++){
   const {data,info}=await sharp(Buffer.from(svgFrame(key,n))).ensureAlpha().raw().toBuffer({resolveWithObject:true});let left=info.width,top=info.height,right=-1,bottom=-1;
   for(let py=0;py<info.height;py++)for(let px=0;px<info.width;px++)if(data[(py*info.width+px)*4+3]){left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}
   if(right<0){cells.push(null);continue;}const w=right-left+1,h=bottom-top+1;
   if(x+w>2048){x=0;y+=rowH;rowH=0;}if(y+h>2048)await flush();
   const input=await sharp(data,{raw:info}).extract({left,top,width:w,height:h}).raw().toBuffer();
   tiles.push({input,left:x,top:y,w,h});cells.push({page:pages.length,x,y,w,h,ox:left,oy:top});x+=w;rowH=Math.max(rowH,h);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y+h);
   if(n===Math.min(25,count))await sharp(data,{raw:info}).png().toFile(path.join(root,'reference/native-declaration-'+key+'-check.png'));
  }
  await flush();const hashes=pages.map(file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex').slice(0,16));result[key]={title,frames:count,fps:30,width:800,height:600,pivot:[0,0],pages,hashes,cells};
  console.log(key+': '+count+' original frames, '+pages.length+' pages, '+pages.reduce((sum,f)=>sum+fs.statSync(path.join(out,f)).size,0)+' bytes');
 }
 fs.writeFileSync(path.join(out,'native-declarations.js'),'window.NativeDeclarationAtlas='+JSON.stringify(result)+';\n');
})().catch(e=>{console.error(e);process.exitCode=1;});
