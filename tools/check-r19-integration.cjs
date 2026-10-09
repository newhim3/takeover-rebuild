/* Actual attack/snapshot calls only. No simulation loop, AI turns or browser. */
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),{createRequire}=require('module');
const root=path.resolve(__dirname,'..'),enginePath=path.join(root,'engine.js');
const {Battle}=require(enginePath),network=require('../multiplayer-server.cjs'),Codec=require('../snapshot-codec.js');
const A=require('../native-unit-animation.js'),U=require('../unit-art.js'),P=require('../progression.js'),R=require('../unit-rules.js');
const priorContext={require:createRequire(enginePath),module:{exports:{}},console,Math};
vm.runInNewContext(fs.readFileSync(path.join(root,'.tools/r19-before/engine.js'),'utf8'),priorContext,{filename:'r19-before/engine.js'});
const OldBattle=priorContext.module.exports.Battle;
const sprites=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'assets/takeover/animation/anim_manifest.json'))).sheets.map(s=>[s.key,s]));
const data={nativePlayer:'Blue',width:1100,height:300,grid:Array(30).fill('1'.repeat(110)),nodes:[{x:100,y:105,locationNum:1,markerClass:'NodeCastleBlueClass'},{x:900,y:105,locationNum:2,markerClass:'NodeCastleRedClass'}]};
const clone=value=>JSON.parse(JSON.stringify(value));
const options={player:'Blue',difficulty:'normal',humanOwners:['Blue','Red'],multiplayer:true};
let count=0;const check=(name,fn)=>{fn();count++;console.log('PASS '+name);};
function fixture(B=Battle,color='Blue',type='archers',tech=2,gap=20){
 const b=new B(data,options),home=b.buildings[0],enemy=b.buildings[1],u=b.spawn(home,type),v=b.spawn(enemy,'infantry');
 const record=P.unit(color,{archers:'Archers',infantry:'Infantry',magic:'Magic',cavalry:'Cavalry',siege:'Siege'}[type],tech),stats=R.stats(record,type,1,{});
 Object.assign(u,{record,stats,owner:color,tech:record.techLevel,x:400,y:105,garrisonId:null,facing:'Down',state:'attack',commandVersion:4});
 Object.assign(v,{x:400+gap,y:105,garrisonId:null});b.time=3.25;
 return {b,u,v};
}
try{
check('Battle near archer chooses original SpecialA with unchanged windup',()=>{
 const {b,u,v}=fixture();b.beginAttack(u,v,false);assert.equal(u.attackIsRanged,false);assert.equal(u.attackVisualPhase,3);
 const pose=A.pose(b,u,b.time+.1,sprites);assert.equal(pose.action,'SpecialA');assert(A.pivots[U.prefix(u.record)+u.attackFacing+'SpecialA']);assert.equal(u.pendingAttack.target,v.id);
});
check('Battle distance archer keeps original Attack at the 27-unit boundary',()=>{
 for(const gap of [27,80]){const {b,u,v}=fixture(Battle,'Blue','archers',2,gap);b.beginAttack(u,v,false);assert.equal(u.attackIsRanged,true);assert.equal(u.attackVisualPhase,2);assert.equal(A.pose(b,u,b.time+.1,sprites).action,'Attack');}
});
check('all added attack display fields leave prior combat fields and timing identical',()=>{
 const cases=[['Blue','archers',2,20],['Blue','archers',2,100],['Green','archers',1,20],['Green','infantry',3,20],['Red','cavalry',2,20],['Purple','magic',2,20]];
 for(const [color,type,tech,gap]of cases){const a=fixture(Battle,color,type,tech,gap),before=fixture(OldBattle,color,type,tech,gap);
  a.b.beginAttack(a.u,a.v,false);before.b.beginAttack(before.u,before.v,false);
  const current=clone(a.u);for(const key of ['attackIsRanged','attackVisualPhase','attackVisualSerial'])delete current[key];
  assert.deepEqual(current,clone(before.u));assert.deepEqual(clone(a.b.effects),clone(before.b.effects));assert.deepEqual(clone(a.u.pendingAttack),clone(before.u.pendingAttack));assert.equal(a.u.attackDuration,before.u.attackDuration);
 }
});
check('actual server snapshot and codec preserve display fields through full and delta',()=>{
 const {b,u,v}=fixture(),room={battle:b,speed:1,players:[{id:'a',country:'Blue',lastCommand:0},{id:'b',country:'Red',lastCommand:0}],streams:new Set()},decoder=new Codec.Decoder();
 b.beginAttack(u,v,false);const full=decoder.decode(network.snapshot(room,true)),one=full.units.find(q=>q.id===u.id);assert.equal(one.attackIsRanged,false);assert.equal(one.attackVisualPhase,3);assert.equal(one.attackDuration,Math.round(u.attackDuration*1000)/1000);
 v.x=500;b.time+=.1;b.beginAttack(u,v,false);const delta=network.snapshot(room),decoded=decoder.decode(delta),two=decoded.units.find(q=>q.id===u.id);assert(!delta.full);assert.equal(two.attackIsRanged,true);assert.equal(two.attackVisualPhase,2);assert.equal(two.attackFacing,'Right');assert.equal(two.lastAttack,3.35);assert.equal(A.pose(b,{...u,...two},two.lastAttack+.1,sprites).action,'Attack');
});
check('actual renderer can fall back to an already loaded sprite during SpecialA loading',()=>{
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8'),functionSource=source.match(/function unitVisual\([\s\S]*?(?=\nfunction drawUnit)/)?.[0];assert(functionSource);
 const ready=new Set(['GreenArchersRight_Go']),context={UnitArt:U,GAME_DATA:{sprites},img:key=>({complete:ready.has(key),naturalWidth:ready.has(key)?100:0})};
 vm.runInNewContext('const unitVisualKeys=new Map();'+functionSource+';this.pick=unitVisual;',context);
 const {u}=fixture(Battle,'Green','archers',1,20);u.attackFacing='Right';const fallback=context.pick(u,'SpecialA','Right');assert.equal(fallback,'GreenArchersRight_Go');
 ready.add('GreenArchersRightSpecialA');assert.equal(context.pick(u,'SpecialA','Right'),'GreenArchersRightSpecialA');
});
function resolvedFixture(){
 const source=fs.readFileSync(path.join(root,'game.js'),'utf8'),begin=source.indexOf('const unitVisualKeys=new Map();'),end=source.indexOf('\nfunction drawUnit',begin);assert(begin>=0&&end>begin);
 const ready=new Set(['GreenArchersRight_Attack']),{b,u,v}=fixture(Battle,'Green','archers',1,20);b.beginAttack(u,v,false);
 const context={UnitArt:U,NativeUnitAnimation:A,GAME_DATA:{sprites},battle:b,img:key=>({complete:ready.has(key),naturalWidth:ready.has(key)?100:0})};
 vm.runInNewContext(source.slice(begin,end)+';this.resolve=resolvedUnitPose;',context);
 return {b,u,ready,context};
}
check('resolved fallback attack progress uses loaded frame count without wrapping',()=>{
 const {b,u,context}=resolvedFixture();const start=b.time;b.time=start+u.attackDuration*.8;const p=context.resolve(u);assert.equal(p.key,'GreenArchersRight_Attack');
 const frames=sprites[p.key].frames;assert.equal(frames,20);assert(Math.abs(p.frame-16)<1e-8);assert(Math.floor(p.frame)>=15&&p.frame<frames);
 b.time=start+u.attackDuration*.99;const end=context.resolve(u);assert.equal(Math.floor(end.frame),frames-1);assert.equal(Math.floor(end.frame)%frames,frames-1);
});
check('frozen renderer retains the resolved key and frame when SpecialA finishes loading',()=>{
 const {b,u,ready,context}=resolvedFixture();b.time+=u.attackDuration*.8;const before=clone(context.resolve(u));assert.equal(before.key,'GreenArchersRight_Attack');
 ready.add('GreenArchersRightSpecialA');u.frozen=2;b.time+=.4;assert.deepEqual(clone(context.resolve(u)),before);
 const replacement={...u,facing:'Up',state:'idle'};assert.deepEqual(clone(context.resolve(replacement)),before);
 replacement.frozen=0;replacement.state='attack';const after=context.resolve(replacement);assert.equal(after.key,'GreenArchersRightSpecialA');
});
check('related current source parses without a browser',()=>{
 for(const name of ['game.js','engine.js','multiplayer-server.cjs','native-unit-animation.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
});
console.log({checks:count,scope:'Real beginAttack and server codec calls, plus isolated render fallback; no battle simulation or browser gameplay'});
}finally{network.close();}
