/* Original corpse timeline and one isolated death, no AI turns or long play. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{createRequire}=require('module'),root=path.resolve(__dirname,'..');
const {Battle}=require('../engine'),N=require('../native-feedback'),Codec=require('../snapshot-codec'),server=require('../multiplayer-server.cjs');
const sprites=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'assets/takeover/animation/anim_manifest.json'))).sheets.map(s=>[s.key,s]));
const old={require:createRequire(path.join(root,'engine.js')),module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(root,'.tools/r20-before/engine.js'),'utf8'),old);
const data={nativePlayer:'Green',width:800,height:240,grid:Array(24).fill('1'.repeat(80)),nodes:[{x:100,y:105,locationNum:1,markerClass:'NodeCastleGreenClass'},{x:700,y:105,locationNum:2,markerClass:'NodeCastleRedClass'}]},options={player:'Green',humanOwners:['Green','Red'],multiplayer:true,factionEdicts:{Green:{},Red:{}}};
function death(B){const b=new B(data,options),u=b.spawn(b.buildings[0],'infantry');u.hp=0;b.aiClock=Infinity;b.update(.01);return b;}
let checks=0;const check=(name,run)=>{run();checks++;console.log('PASS '+name);};
try{
 const before=death(old.module.exports.Battle),b=death(Battle),e=b.effects.find(e=>e.type==='death');
 check('native death stays three seconds from its fall start',()=>{assert.equal(e.max,Math.max(3,e.fallDuration));assert.equal(e.fallDuration,sprites[e.visualKey].frames/30);});
 check('death art does not postpone removal, rewards, ownership or result',()=>{const fields=['units','buildings','slots','chests','factions','lost','events','time','ultimateCharge','result'];for(const k of fields)assert.equal(JSON.stringify(b[k]),JSON.stringify(before[k]),k);assert.equal(b.units.length,0);});
 check('native falling frame becomes a retained original corpse frame',()=>{const fall={...e,t:e.max-.2},p=N.deathVisual(fall,sprites);assert.equal(Math.floor(p.frame),6);assert.equal(p.layer,'above');assert.equal(p.key,e.visualKey);const held=N.deathVisual({...e,t:e.max-1.5},sprites);assert.equal(held.frame,sprites[e.visualKey].frames-1);assert.equal(held.layer,'corpse');assert.equal(held.alpha,1);});
 check('held corpse survives to 2.9 seconds and does not fade early',()=>{const p=N.deathVisual({...e,t:e.max-2.9},sprites);assert.equal(p.frame,sprites[e.visualKey].frames-1);assert.equal(p.alpha,1);assert(N.effectInLayer({...e,t:e.max-2.9},'corpse',sprites));assert(!N.effectInLayer({...e,t:e.max-2.9},'above',sprites));});
 check('pause leaves the death frame and layer unchanged',()=>{const paused={...e,t:e.max-.4,renderTime:0};assert.deepEqual(N.deathVisual(paused,sprites),N.deathVisual({...paused},sprites));});
 check('client elapsed display reaches the same layer as host time',()=>{assert.deepEqual(N.deathVisual({...e,t:e.max-.8,renderTime:.4},sprites),N.deathVisual({...e,t:e.max-1.2,renderTime:0},sprites));});
 check('actual effect snapshots carry the original fall duration',()=>{const r={battle:b,players:[{country:'Green'}]},decoder=new Codec.Decoder(),state=decoder.decode(server.snapshot(r,true));assert.equal(state.effects.find(q=>q.type==='death').fallDuration,e.fallDuration);});
 check('effects still expire through the existing time filter',()=>{const event={...e,t:.001};b.effects=[event];b.update(.01);assert(!b.effects.some(q=>q.type==='death'));});
 console.log({checks,scope:'Two isolated death updates, original visual timeline and codec; no AI or browser play'});
}finally{server.close();}
