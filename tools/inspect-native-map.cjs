'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const C=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),level=Number(process.argv[2]||7);
const source=fs.readFileSync(process.argv[4]||path.join(root,'assets/takeover/maps/level-'+level+'.js'),'utf8');
const canvas=(w=1,h=1)=>{const c=C.createCanvas(w,h);c.style={};const ctx=c.getContext('2d');for(const name of ['moveTo','lineTo','bezierCurveTo','quadraticCurveTo','rect','fillRect','clearRect']){const raw=ctx[name].bind(ctx);ctx[name]=(...args)=>raw(...args.map(x=>typeof x==='string'?Number(x):x));}c.getContext=()=>ctx;return c;};
const sourceFiles=[...source.matchAll(/imageObj\d+\.src="([^"]+)"/g)].map(m=>m[1]);
let preloaded=[];function LocalImage(){return preloaded.shift();}
let ready;const loaded=new Promise(resolve=>ready=resolve),win={NativeMaps:{},dispatchEvent:()=>ready()};
const context={window:win,document:{createElement:tag=>tag==='img'?new LocalImage():canvas(),body:{appendChild(){},removeChild(){}}},Image:LocalImage,Event:class{},console};
Promise.all(sourceFiles.map(file=>C.loadImage(fs.readFileSync(path.resolve(root,file))).then(im=>{Object.defineProperty(im,'src',{get:()=>file,set:value=>{if(value!==file)throw Error('Unexpected source');}});return im;}))).then(images=>{preloaded=images;vm.runInNewContext(source,context,{filename:'level-'+level+'.js'});}).catch(error=>{console.error(error);process.exitCode=1;});
loaded.then(()=>{
 const assert=require('node:assert/strict'),TerrainCache=require('../terrain-cache');
 const boundsContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'native-map-bounds.js'),'utf8'),boundsContext);
 const owners=process.argv[3]==='red'?{0:0,1:0,2:0,3:0,4:0,5:0}:{0:1,1:3,2:0,3:2},native=win.NativeMaps[level];let draws=0;
 const wrapped={draw(c,o){draws++;native.draw(c,o);},drawGround(c,o){draws++;native.drawGround(c,o);},objects:o=>native.objects(o)},cache=new TerrainCache(canvas,boundsContext.window.NativeMapBounds),item=cache.get(level,wrapped,owners,800,600);
 assert.equal(cache.get(level,wrapped,{...owners},800,600),item);assert.equal(draws,1,'camera rendering must not rerun the native timeline');
 const {bounds}=item,scale=Math.min(950/(bounds.right-bounds.left),610/(bounds.bottom-bounds.top)),x=500-(bounds.left+bounds.right)/2*scale,y=330-(bounds.top+bounds.bottom)/2*scale;
 assert(bounds.left*scale+x>=24&&bounds.right*scale+x<=976);assert(bounds.top*scale+y>=24&&bounds.bottom*scale+y<=636);
 const c=canvas(1000,660),ctx=c.getContext('2d');ctx.fillStyle='#9fe5f3';ctx.fillRect(0,0,1000,660);ctx.translate(x,y);ctx.scale(scale,scale);ctx.drawImage(item.canvas,item.left,item.top);for(const o of [...item.objects].sort((a,b)=>a.y+(a.footY||0)-b.y-(b.footY||0)))ctx.drawImage(o.image,o.x+o.offsetX,o.y+o.offsetY);assert(item.objects.length>10,'native decoration must be separate from the ground');
 const out=path.join(root,'reference/supplement-20261006/map-inspection');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,process.argv[5]||'level-'+level+'-framed.png'),c.toBuffer('image/png'));fs.writeFileSync(path.join(out,'level-'+level+'-bounds.json'),JSON.stringify(bounds));console.log({level,bounds,scale,nativeDrawsForTwoReads:draws,separateDecorations:item.objects.length,wholeArtInsideViewport:true});
}).catch(error=>{console.error(error);process.exitCode=1;});
