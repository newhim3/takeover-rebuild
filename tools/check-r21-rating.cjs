/* Native medal pixels were checked by the builder; check actual image binding. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto'),root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'flow.js'),'utf8'),start=source.indexOf('function bindReadableWorldRating('),end=source.indexOf('\nfunction bindNativeCampaignHover',start);assert(start>=0&&end>start);
const images=[],base='http://127.0.0.1:4387/';
class Bitmap{constructor(){this.naturalWidth=0;images.push(this);this.decoded=new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject;});}set src(value){this.url=new URL(value,base).href;}decode(){return this.decoded;}load(){this.naturalWidth=168;return this.onload();}}
const c={window:{},UI_BASE:'assets/takeover/ui/',Image:Bitmap};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/takeover/ui/world-rating-readable.js'),'utf8'),c);
const api=vm.runInNewContext('const readableRatingImages=new Map();\n'+source.slice(start,end)+'\n({bind:bindReadableWorldRating})',c);
function button(rating){const flag={dataset:{rating:String(rating)},src:new URL('assets/takeover/ui/native-world-rating-'+rating+'.svg',base).href};return{isConnected:true,flag,querySelector:()=>flag};}
const flush=async()=>{await Promise.resolve();await Promise.resolve();};let checks=0;
async function check(name,run){await run();checks++;console.log('PASS '+name);}
(async()=>{
 await check('all three new raster resources have their actual content hashes and original footprint',()=>{for(const entry of Object.values(c.window.NativeWorldRatingArt)){const bytes=fs.readFileSync(path.join(root,entry.file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16),entry.hash);assert.equal(entry.width,168);assert.equal(entry.height,140);}});
 const b=button(3),old=b.flag.src;
 await check('original crown stays visible until the bright original ornament has decoded',async()=>{api.bind(b);const load=images[0].load();await flush();assert.equal(b.flag.src,old);assert.equal(images[0].url,new URL('assets/takeover/ui/world-rating-readable-3.webp?v='+c.window.NativeWorldRatingArt[3].hash,base).href);images[0].resolve();await load;await flush();assert.equal(b.flag.src,'assets/takeover/ui/world-rating-readable-3.webp?v='+c.window.NativeWorldRatingArt[3].hash);});
 await check('reentering a segment reuses the same decoded native ornament',()=>{const count=images.length,next=button(3);api.bind(next);assert.equal(images.length,count);assert(next.flag.src.includes('world-rating-readable-3.webp?v='));});
 await check('image download failure preserves the old crown and allows later retry',async()=>{const one=button(1),still=one.flag.src;api.bind(one);images.at(-1).onerror();await flush();assert.equal(one.flag.src,still);const count=images.length;api.bind(button(1));assert.equal(images.length,count+1);});
 await check('late decode does not replace a detached campaign segment',async()=>{const two=button(2),still=two.flag.src;api.bind(two);const im=images.at(-1),load=im.load();two.isConnected=false;im.resolve();await load;await flush();assert.equal(two.flag.src,still);});
 await check('a medal whose rating changed while loading cannot receive an old pattern',async()=>{const one=button(1),still=one.flag.src;api.bind(one);const im=images.at(-1),load=im.load();one.flag.dataset.rating='3';im.resolve();await load;await flush();assert.equal(one.flag.src,still);});
 console.log({checks,scope:'New asset hashes and actual load/decode/cache binding; no browser play'});
})().catch(e=>{console.error(e);process.exitCode=1;});
