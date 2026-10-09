/* Exact old/new terrain bounds and scenery comparison on deterministic pixels.
 * This does not load a browser, real image files or advance game logic. */
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),{createRequire}=require('module');
const root=path.resolve(__dirname,'..'),current=require('../terrain-cache.js'),oldPath=path.join(root,'.tools/r20-before/terrain-cache.js');
const priorContext={module:{exports:{}},require:createRequire(oldPath)};vm.runInNewContext(fs.readFileSync(oldPath,'utf8'),priorContext,{filename:oldPath});const prior=priorContext.module.exports;
const clone=value=>JSON.parse(JSON.stringify(value));
const cases=[
 ['solid ground',(x,y)=>x>=0&&x<64&&y>=0&&y<48?255:0],
 ['separate islands',(x,y)=>x>=4&&x<=24&&y>=8&&y<=38||x>=40&&x<=70&&y>=15&&y<=42?255:0],
 ['ground with holes',(x,y)=>x>=0&&x<64&&y>=0&&y<48&&!(x>12&&x<52&&y>10&&y<36)?255:0],
 ['exact alpha threshold',(x,y)=>y===20&&x>=6&&x<=66?(x===6||x===66?20:19):0],
 ['single opaque point',(x,y)=>x===32&&y===24?20:0],
 ['fully transparent',()=>0],
 ['deterministic scattered ground',(x,y)=>x>=0&&x<80&&y>=0&&y<48&&((x*31+y*43)%17===0)?255:0]
];
function fixture(Class,mask){
 const metrics={alphaReads:0,draws:0,canvases:0},scenery=[{id:'unregistered',x:100,y:100,offsetX:-3,offsetY:-20},{id:'inside',x:15,y:20,footX:0,footY:0,offsetX:-5,offsetY:-35},{id:'edge',x:70,y:38,footX:0,footY:0,offsetX:-4,offsetY:-20},{id:'outside',x:120,y:90,footX:0,footY:0,offsetX:-4,offsetY:-20}];
 const createCanvas=()=>{metrics.canvases++;const canvas={width:0,height:0};let tx=0,ty=0;const context={translate(x,y){tx=x;ty=y;},getImageData(){const pixels=new Uint8ClampedArray(canvas.width*canvas.height*4);for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)pixels[(y*canvas.width+x)*4+3]=canvas.mask(x-tx,y-ty);return{data:new Proxy(pixels,{get(target,key){if(typeof key==='string'&&/^\d+$/.test(key)&&Number(key)%4===3)metrics.alphaReads++;return Reflect.get(target,key,target);}})};}};canvas.getContext=()=>context;return canvas;};
 const native={drawGround(canvas,owners){metrics.draws++;canvas.mask=owners[1]===2?((x,y)=>mask(x-4,y)):mask;},objects:()=>scenery};
 const cache=new Class(createCanvas,{7:{left:0,top:0,right:80,bottom:48}}),owners={1:1,2:0};
 const first=cache.get(7,native,owners,80,48),repeat=cache.get(7,native,{2:0,1:1},80,48);assert.strictEqual(repeat,first,'unchanged ownership uses the same terrain canvas');
 const second=cache.get(7,native,{1:2,2:0},80,48);assert.equal(metrics.draws,2,'only actual ownership changes redraw ground');
 const summary=item=>({left:item.left,top:item.top,width:item.canvas.width,height:item.canvas.height,bounds:clone(item.bounds),objects:clone(item.objects)});
 return {metrics,first:summary(first),second:summary(second)};
}
let before=0,after=0;const details=[];
for(const [name,mask]of cases){const previous=fixture(prior,mask),next=fixture(current,mask);assert.deepEqual(next.first,previous.first,name+' initial bounds and every supported object remain identical');assert.deepEqual(next.second,previous.second,name+' captured ownership bounds and every supported object remain identical');before+=previous.metrics.alphaReads;after+=next.metrics.alphaReads;details.push({name,beforeReads:previous.metrics.alphaReads,afterReads:next.metrics.alphaReads});}
if(process.argv.includes('--expect-improvement'))assert(after<before,'row boundary scans reduce counted alpha lookups');
console.log(JSON.stringify({checks:cases.length*2,scope:'Old/new exact bounds and original scenery fields plus cache reuse; no browser or battle simulation',alphaReads:{before,after,reductionPercent:Number(((1-after/before)*100).toFixed(1))},details},null,2));
