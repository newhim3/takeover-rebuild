'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Motion=require('../snapshot-motion');
const checks=[];
function fixture(change={}){
 const motion=new Motion(),unit={id:1,owner:'Green',hp:100,x:0,y:0,state:'move',commandVersion:1,walkDistance:0,path:[{x:200,y:0}],order:{x:200,y:0}};
 const first={sequence:1,sentAt:1000,time:0,speed:1,units:[unit]};
 const latest={sequence:2,sentAt:1100,time:.1,speed:1,units:[{...unit,x:10,hp:76,walkDistance:10,...change}]};
 motion.push(first,1000);motion.push(latest,1100);
 return {motion,latest,sample:motion.sample(1300)};
}
function sameAuthority(sample,latest){assert.equal(sample.state,latest);assert.equal(sample.units.get(1).hp,76);assert.equal(sample.units.get(1).owner,'Green');}

{
 const control=fixture();assert.equal(control.sample.units.get(1).x,18);
 const {motion,latest,sample}=fixture({commandVersion:2});
 assert.equal(sample.units.get(1).x,10,'Changed manual command must not coast with the previous velocity');
 sameAuthority(sample,latest);const cursor=motion.cursor;motion.setRoundTrip(250);motion.sample(1301);assert(motion.cursor>=cursor);
 checks.push('A changed manual command version holds the newest authoritative position; unchanged straight marching still coasts safely.');
}
{
 for(const change of [{path:[{x:0,y:0}],order:{x:0,y:0}},{path:[],order:{x:0,y:0}}]){
  const {latest,sample}=fixture(change);
  assert.equal(sample.units.get(1).x,10,'A reversed path or transmitted AI endpoint must invalidate forward extrapolation');
  sameAuthority(sample,latest);
 }
 checks.push('A reversed next waypoint or AI endpoint prevents old-direction extrapolation without changing command versions.');
}
const result={version:'r25',checkedAt:new Date().toISOString(),passed:true,checks,scope:'Two display-input checks only. No battle simulation, browser playthrough, AI, or engine changes.'};
fs.writeFileSync(path.join(__dirname,'../.tools/r25-motion-order-check.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
