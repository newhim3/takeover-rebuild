/* Exact pause-command display seam; no Battle.update or browser gameplay. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{Battle}=require('../engine.js');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'game.js'),'utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert(start>=0,'Missing '+name);let depth=0;for(let i=source.indexOf('{',start);i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}throw Error('Unclosed '+name);}
const data={nativePlayer:'Red',width:800,height:300,grid:Array(30).fill('1'.repeat(80)),nodes:[{x:100,y:105,locationNum:1,markerClass:'NodeCastleRedClass'},{x:700,y:105,locationNum:2,markerClass:'NodeCastleGreenClass'}]};
const b=new Battle(data,{player:'Red',difficulty:'normal',humanOwners:['Red','Green']}),u=b.spawn(b.buildings[0],'infantry');b.command([u.id],{x:260,y:105});
const icons=[],curves=[],fallback=[],c={battle:b,player:'Red',paused:true,localPausedCommands:[],localPausedOrders:new Map(),unitIds:new Set([u.id]),window:{},structuredClone,commandMarker:null,drag:null,ctx:{},active:()=>true,toast(){},result(){},sprite:()=>false,drawUI:(...args)=>fallback.push(args),drawCommandIcon:(art,p,size)=>icons.push({art,x:p.x,y:p.y,size}),NativeFeedback:{actions:{defending:{key:'ASTDefendingClass'}},drawOrderCurve:(...args)=>curves.push(args)},badgePoint:v=>({x:v.x,y:v.y-60})};
if(fs.existsSync(path.join(root,'paused-order-feedback.js')))c.PausedOrderFeedback=require('../paused-order-feedback.js');
for(const name of ['queueLocalActions','flushLocalActions','drawOrders','pendingOrder','displayOrder','pendingOrderSummary','stop'])if(source.includes('function '+name+'('))vm.runInNewContext(fn(name),c);
const before=JSON.stringify({x:u.x,y:u.y,hp:u.hp,garrisonId:u.garrisonId,order:u.order,path:u.path,gold:b.factions.Red.gold,time:b.time});
c.queueLocalActions();b.command([u.id],{x:610,y:105});c.drawOrders();
assert.equal(icons.find(p=>p.size===38)?.x,610,'Paused new destination must replace the OLD persistent destination marker');
assert.equal(JSON.stringify({x:u.x,y:u.y,hp:u.hp,garrisonId:u.garrisonId,order:u.order,path:u.path,gold:b.factions.Red.gold,time:b.time}),before,'Display preview must leave all actual battle state still');
assert.equal(c.localPausedCommands.length,1);c.paused=false;c.flushLocalActions();assert.equal(u.order.x,610);assert.equal(c.localPausedOrders.size,0);assert.equal(b.time,0);
console.log('PASS queued destination replaces its old display, stays stationary, then executes on resume');
// Use the real stop and FIFO flush with the same living squad, without ticks.
c.paused=true;const version=u.commandVersion,actual=JSON.stringify(u);b.command([u.id],{x:400,y:105});c.stop();
assert.equal(c.localPausedOrders.get(u.id).type,'stop');assert.equal(JSON.stringify(u),actual);
icons.length=0;c.drawOrders();assert.equal(icons.length,0);assert.equal(fallback.at(-1)[0],'defend');
console.log('PASS paused stop suppresses the old destination and retains original art fallback');
b.command([u.id],{x:560,y:105});assert.equal(c.displayOrder(u).x,560);assert.equal(c.localPausedCommands.length,3);
c.paused=false;c.flushLocalActions();assert.equal(u.order.x,560);assert.equal(u.commandVersion,version+3);assert.equal(b.time,0);assert.equal(c.pendingOrder(u),null);
console.log('PASS move-stop-move displays its final plan and executes all accepted orders once');
c.paused=true;const v=b.spawn(b.buildings[0],'infantry');c.unitIds.add(v.id);c.stop();b.command([u.id],{x:430,y:105});
assert.equal(c.pendingOrderSummary([u,v]),' · 已预排：调遣 1 队，停止 1 队；恢复后执行');
console.log('PASS mixed selected squad feedback describes each queued order');
const replacement=new Battle(data,{player:'Red',humanOwners:['Red','Green']});c.battle=replacement;c.queueLocalActions();assert.equal(c.localPausedOrders.size,0);assert.equal(c.localPausedCommands.length,0);
console.log('PASS a new battle clears queued actions and their display');
console.log({checks:5,scope:'Real paused move/stop handlers, isolated draw feedback and FIFO; no simulation or browser'});
