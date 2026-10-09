/* Reconstruct the clipped export edges from original cliff support; central mask stays intact. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),C=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),level=Number(process.argv[2]||7),manifest=JSON.parse(fs.readFileSync(path.join(root,'reference/native-map-manifest.json'),'utf8')).find(v=>v.level===level),bounds={left:-240,top:-180,width:1280,height:1200};
const canvas=(w=1,h=1)=>{const c=C.createCanvas(w,h),ctx=c.getContext('2d');c.style={};for(const name of ['moveTo','lineTo','bezierCurveTo','quadraticCurveTo','rect','fillRect','clearRect']){const raw=ctx[name].bind(ctx);ctx[name]=(...args)=>raw(...args.map(x=>typeof x==='string'?Number(x):x));}c.getContext=()=>ctx;return c;};
(async()=>{let source=fs.readFileSync(path.join(root,'assets/takeover/maps/level-'+level+'.js'),'utf8'),start=source.indexOf('function sprite'+manifest.symbol+'('),body=source.slice(start,source.indexOf('/* Appended',start)),functions=new Map([...source.matchAll(/function (sprite\d+|shape\d+)\([^\n]*\)\{([\s\S]*?)\n\}/g)].map(m=>[m[1],m[2]]));
 const usesSky=(name,seen=new Set())=>{if(seen.has(name))return false;seen.add(name);const text=functions.get(name)||'';return text.includes('imageObj357')||[...text.matchAll(/place\("([^"]+)"/g)].some(m=>usesSky(m[1],seen));};
 const clipCall=manifest.landMaskCall||body.slice(body.indexOf('clips.push({ctx:ctx,canvas:canvas});')).match(/place\("shape\d+"[^\n]+/)[0];
 const regions=new Set(Object.keys(manifest.regions).map(id=>'sprite'+id)),calls=[...body.matchAll(/place\("(sprite\d+)"[^\n]+/g)].filter(m=>!regions.has(m[1])&&!usesSky(m[1])).map(m=>m[0]);
 if(!calls.length)throw Error('No original rim artwork');source=source.replace('objects:collectNativeObjects','objects:collectNativeObjects,drawRim(target){const ctx=layerContext(target),ctrans=new cxform(0,0,0,0,255,255,255,255),time=0;'+calls.join('\n')+';canvas=null;},drawOldMask(target){const ctx=layerContext(target),ctrans=new cxform(0,0,0,0,255,255,255,255),time=0;'+clipCall+';canvas=null;}');
 const files=[...source.matchAll(/imageObj\d+\.src="([^"]+)"/g)].map(m=>m[1]);let images=await Promise.all(files.map(file=>C.loadImage(fs.readFileSync(path.join(root,file))).then(im=>{Object.defineProperty(im,'src',{get:()=>file,set(){}});return im;}))),ready;const loaded=new Promise(r=>ready=r),window={NativeMaps:{},dispatchEvent:ready};
 const context={window,document:{createElement:tag=>tag==='img'?images.shift():canvas(),body:{appendChild(){},removeChild(){}}},Event:class{},console};vm.runInNewContext(source,context);await loaded;
 const c=canvas(bounds.width,bounds.height),ctx=c.getContext('2d');ctx.translate(-bounds.left,-bounds.top);window.NativeMaps[level].drawRim(c);const support=ctx.getImageData(0,0,c.width,c.height).data;
 const old=canvas(c.width,c.height),oc=old.getContext('2d');oc.translate(-bounds.left,-bounds.top);window.NativeMaps[level].drawOldMask(old);const oldMask=oc.getImageData(0,0,c.width,c.height).data,rgba=new Uint8ClampedArray(c.width*c.height*4);let interior=0;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
  const wx=x+bounds.left,wy=y+bounds.top,i=y*c.width+x;
  // Only the exported viewport edges need reconstruction. The playable centre
  // and its original holes stay exact. Lower cliff texture supplies support.
  const weight=wy<180?1:Math.max(0,Math.min(1,wx/80,(800-wx)/80,(600-wy)/100));let supported=0;
  const sy=y+200;if(sy<c.height)for(let dx=-3;dx<=3;dx++){const xx=x+dx;if(xx>=0&&xx<c.width)supported=Math.max(supported,support[(sy*c.width+xx)*4+3]/255);}
  const alpha=Math.min(1,oldMask[i*4+3]/255*weight+supported*(1-weight));const on=alpha>=.5;rgba[i*4]=rgba[i*4+1]=rgba[i*4+2]=255;rgba[i*4+3]=on?255:0;if(on)interior++;
 }
 if(interior<50000)throw Error('Natural outline lost usable land');
 const game={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'game-data.js'),'utf8'),game);const d=game.window.GAME_DATA.levels.find(v=>v.level===level),points=[...d.nodes,...d.roads.points];let checked=0,checkedMask=rgba;
 if(process.argv.includes('--check-shared')){const im=await C.loadImage(fs.readFileSync(path.join(root,'assets/takeover/maps/masks/level-7.png'))),mc=canvas(c.width,c.height);mc.getContext('2d').drawImage(im,0,0);checkedMask=mc.getContext('2d').getImageData(0,0,c.width,c.height).data;}
 const check=(point,label)=>{const x=Math.round(point.x-bounds.left),y=Math.round(point.y-bounds.top),i=y*c.width+x;assertInside(x,y);if(oldMask[i*4+3]>=128&&checkedMask[i*4+3]<128)throw Error('New mask clipped '+label+' at '+point.x+','+point.y);checked++;};
 const assertInside=(x,y)=>{if(x<0||y<0||x>=c.width||y>=c.height)throw Error('Map point outside mask');};
 for(const p of points)check(p,p.name||'road waypoint');for(const [a,b]of d.roads.edges){const p=d.roads.points[a],q=d.roads.points[b],steps=Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/4);for(let n=1;n<steps;n++)check({x:p.x+(q.x-p.x)*n/steps,y:p.y+(q.y-p.y)*n/steps},'road segment');}
 if(process.argv.includes('--check-shared')){console.log({level,protectedNodeAndRoadSamples:checked,sharedLevel7Mask:'passed'});return;}
 ctx.setTransform(1,0,0,1,0,0);const data=ctx.createImageData(c.width,c.height);data.data.set(rgba);ctx.putImageData(data,0,0);
 const dir=path.join(root,'assets/takeover/maps/masks');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'level-'+level+'.png'),c.toBuffer('image/png'));fs.writeFileSync(path.join(dir,'level-'+level+'.json'),JSON.stringify(bounds));console.log({level,originalRimCalls:calls.length,enclosedPixels:interior,protectedNodeAndRoadSamples:checked,bounds});
})().catch(error=>{console.error(error);process.exitCode=1;});
