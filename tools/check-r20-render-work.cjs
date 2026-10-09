/* Real renderer work counters and identical draw-call comparison.
 * No browser, asset decode, simulation ticks or AI decisions are performed. */
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),A=require('../native-unit-animation.js'),U=require('../unit-art.js'),R=require('../unit-rules.js'),P=require('../progression.js'),S=require('../native-status-art.js');
const sprites=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'assets/takeover/animation/anim_manifest.json'))).sheets.map(s=>[s.key,s]));
const prior=fs.readFileSync(path.join(root,'.tools/r20-render-before/game.js'),'utf8'),current=fs.readFileSync(path.join(root,'game.js'),'utf8');
function functionText(source,name,next){const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction '+next+'(',start);assert(start>=0&&end>start,name+' source is available');return source.slice(start,end);}
function renderer(source){
 const start=source.indexOf('const unitVisualKeys=new Map();'),end=source.indexOf('\nfunction drawEffects(',start);assert(start>=0&&end>start);
 const record=P.unit('Green','Infantry',1),stats=R.stats(record,'infantry'),u={id:'render-1',record,stats,hp:stats.hp,maxHp:stats.hp,state:'move',walkDistance:12,facing:'Down',x:100,y:100,heading:.6};
 const battle={time:3,units:[u],slots:[],buildings:[],chests:[],data:{},effects:[]},calls=[],work={poses:0,formations:0,images:0};
 const ctx={setTransform(){},clearRect(){},drawImage(){},save(){},restore(){},translate(){},scale(){}};
 const context={battle,ctx,canvas:{},terrain:{width:1000,height:660},renderScale:1,terrainWorld:null,paused:true,window:{},localMotion:{project:units=>units},localClock:{alpha:0},unitIds:new Set(),drag:null,spell:null,mouse:{x:0,y:0},GAME_DATA:{sprites},UnitArt:U,NativeStatusArt:S,
  NativeUnitAnimation:{...A,pose(...args){work.poses++;return A.pose(...args);}},UnitRules:{...R,formation(...args){work.formations++;return R.formation(...args);}},
  img(){work.images++;return{complete:true,naturalWidth:100};},sprite(...args){calls.push(args.slice(1));},drawUI(){},syncCanvasResolution(){},terrainBuild(){},mapCamera:()=>({x:0,y:0,scale:1}),drawEffects(){},drawBadge(){},drawOrders(){},drawOrderPath(){},drawSlot(){},drawBuilding(){},drawSpellCursor(){}};
 vm.runInNewContext(source.slice(start,end)+'\n'+functionText(source,'unitDrawItems','draw')+'\n'+functionText(source,'draw','position')+'\nthis.drawActual=draw;',context,{filename:'isolated-renderer'});
 return {context,battle,u,calls,work};
}
const before=renderer(prior),after=renderer(current);
before.context.drawActual();after.context.drawActual();
assert.equal(before.calls.length,before.u.stats.members,'old renderer retains every formation member');assert.deepEqual(after.calls,before.calls,'every native sprite key, frame, position, scale and tone is unchanged');
const first={before:{...before.work},after:{...after.work},members:before.calls.length};
const strict=process.argv.includes('--expect-improvement');
if(strict){assert(after.work.poses<before.work.poses,'display-frame cache reduces real native pose calls');assert(after.work.formations<before.work.formations,'display-frame cache reduces formation allocations');assert(after.work.images<before.work.images,'display-frame cache reduces image lookups');}
for(const item of [before,after]){item.u.state='attack';item.u.attackFacing='Right';item.u.attackVisualPhase=2;item.u.attackIsRanged=false;item.u.lastAttack=item.battle.time-.2;item.u.attackDuration=1;item.calls.length=0;item.context.drawActual();}
assert.deepEqual(after.calls,before.calls,'a new displayed frame at unchanged battle time notices an attack state change');assert(after.calls.every(args=>args[0].includes('Right_Attack')));
for(const item of [before,after]){item.u.frozen=2;item.battle.time+=.3;item.calls.length=0;item.context.drawActual();}
assert.deepEqual(after.calls,before.calls,'frozen display keeps the prior resolved native frame');
console.log(JSON.stringify({checks:4,scope:'Two short real draw() calls and a freeze frame; no game simulation or browser',work:first,improvementRequired:strict},null,2));
