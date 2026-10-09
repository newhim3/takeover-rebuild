'use strict';
// Focused client display/ack fixtures. No browser play or AI/simulation loops.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {Battle}=require('../engine'),Motion=require('../snapshot-motion'),Codec=require('../snapshot-codec');
const server=require('../multiplayer-server.cjs');
const data={nativePlayer:'Red',width:800,height:240,grid:Array(24).fill('1'.repeat(80)),nodes:[
 {x:100,y:105,locationNum:1,markerClass:'NodeCastleRedClass'},
 {x:700,y:105,locationNum:2,markerClass:'NodeCastleGreenClass'}]};
const feedbackFile=require.resolve('../multiplayer-client.js').replace('multiplayer-client.js','paused-order-feedback.js');
// During the pre-fix reproduction the display helper is not yet installed.
const feedback=fs.existsSync(feedbackFile)?require(feedbackFile):{describe(b,owner,c){
 if(c.type==='stop')return {type:'stop',order:null};
 if(c.type!=='move')return null;const t=b.building(c.target)||b.unit(c.target)||b.chest(c.target);
 return {type:'move',order:{...c.point,target:c.target??null,enter:!!(t&&'queue' in t&&b.canEnter(t,owner)),collect:!!(t&&'collected' in t),capture:!!t?.ruined}};
}};
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
function client(){
 const b=new Battle(data,{player:'Red',difficulty:'normal',humanOwners:['Red','Green'],multiplayer:true,factionEdicts:{Red:{},Green:{}}}),u=b.spawn(b.buildings[0],'infantry');
 const elements=new Map(),sockets=[];
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',classList:{add(){},toggle(){}},append(){}});return elements.get(id);};
 const context={console,URLSearchParams,SnapshotMotion:Motion,SnapshotCodec:Codec,Battle,Progression:require('../progression'),PausedOrderFeedback:feedback,
  NativeResults:{record:()=>({})},setInterval:()=>0,setTimeout:()=>0,clearTimeout(){},location:{search:'',origin:'http://127.0.0.1:4387'},
  __now:1000,speed:0,player:'Red',battle:b,handledResult:false,$:element,sessionStorage:{setItem(){},removeItem(){}},document:{createElement:()=>element('networkStatus')},
  WebSocket:class{static OPEN=1;constructor(){this.readyState=1;this.sent=[];sockets.push(this);}send(value){this.sent.push(JSON.parse(value));}close(){this.onclose?.();}}};
 context.window=context;context.performance={now:()=>context.__now};
 const source=fs.readFileSync(require.resolve('../multiplayer-client.js'),'utf8').replace('open();showLobby();','open();').replace('})(window);',`
root.__fixture={connect,command,render,pending:()=>pendingOrders,install(b,state){api.active=true;remote=b;world=b.data;room={code:'PAUSE1',host:'a',players:[{id:'a',country:'Red',edicts:{}}]};me='a';secret='fixture';serverPlayer='Red';player='Red';speed=state.speed;stream={send:()=>true,close(){}};motion=new SnapshotMotion();motion.push(state,performance.now());renderedState=state;pendingOrders.clear();corrections.clear();wirePending.clear();commandId=0;},push(state){motion.push(state,performance.now());speed=state.speed;},setSpeed(value){speed=value;}};
})(window);`);
 vm.runInNewContext(source,context,{filename:'multiplayer-client.js'});
 const state=(seq=1,speed=0,ack=0,units=b.units,applied=speed>0?ack:0)=>({sequence:seq,sentAt:1000+(seq-1)*100,time:0,speed,acknowledged:{Red:ack},movementApplied:{Red:applied},units:units.map(q=>({...q,order:q.order&&{...q.order},path:q.path.map(p=>({...p}))})),factionEdicts:b.factionEdicts,factions:b.factions,spellCd:{},effects:[],result:null});
 context.__fixture.install(b,state());
 const deliver=(event,data)=>sockets.at(-1).onmessage({data:JSON.stringify({event,data})});
 const connect=(code='PAUSE1')=>context.__fixture.connect({room:{code,host:'a',players:[{id:'a',country:'Red',edicts:{}}]},me:'a',token:'fixture'});
 const push=(seq,speed,ack,units=b.units,applied=speed>0?ack:0)=>{context.__now=1000+(seq-1)*100+500;context.__fixture.push(state(seq,speed,ack,units,applied));context.__fixture.render();};
 return {context,b,u,state,push,connect,deliver,command:context.__fixture.command,preview:id=>context.Network.orderPreview(id)};
}
check('Paused move exposes the new destination without deploying or changing the authority',()=>{
 const f=client(),before=JSON.stringify(f.u),gold=f.b.factions.Red.gold;
 f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});
 assert.equal(f.preview(f.u.id)?.order.x,400);assert.equal(JSON.stringify(f.u),before);assert.equal(f.b.time,0);assert.equal(f.b.factions.Red.gold,gold);assert.equal(f.context.__fixture.pending().size,0);
});
check('Queued ack and paused acknowledged snapshots retain the planned destination',()=>{
 const f=client();f.connect();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});
 f.deliver('commandAck',{commandId:1,queued:true});f.push(2,0,1);
 assert.equal(f.preview(f.u.id)?.order.x,400);
});
check('Pause move-stop-move displays only the latest order, including a visible stop override',()=>{
 const f=client();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.command({type:'stop',ids:[f.u.id]});
 assert.equal(f.preview(f.u.id)?.type,'stop');assert.equal(f.preview(f.u.id)?.order,null);
 f.command({type:'move',ids:[f.u.id],point:{x:600,y:105}});assert.equal(f.preview(f.u.id)?.order.x,600);
});
check('Older rejected commands do not erase a newer planned order',()=>{
 const f=client();f.connect();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.command({type:'move',ids:[f.u.id],point:{x:600,y:105}});
 f.deliver('commandRejected',{commandId:1,error:'旧目标已失效'});assert.equal(f.preview(f.u.id)?.order.x,600);
 f.deliver('commandRejected',{commandId:2,error:'目标已失效'});assert.equal(f.preview(f.u.id),null);
});
check('A room resume notification alone cannot remove the preview before its applied frame',()=>{
 const f=client();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.push(2,0,1);
 f.context.__fixture.setSpeed(1);f.context.__fixture.render();assert(f.preview(f.u.id));
 f.push(3,1,1);assert.equal(f.preview(f.u.id),null);
});
check('Resume and pause again during disconnect clears previews from the actual movement receipt',()=>{
 const f=client();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});
 f.push(2,0,1,f.b.units.map(q=>({...q,commandVersion:(q.commandVersion||0)+1})),1);assert.equal(f.preview(f.u.id),null);
});
check('An older executed movement or a newer purchase acknowledgement cannot clear the last queued plan',()=>{
 const f=client();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.command({type:'move',ids:[f.u.id],point:{x:600,y:105}});
 f.push(2,0,3,f.b.units,1);assert.equal(f.preview(f.u.id)?.order.x,600);
 f.push(3,0,3,f.b.units,2);assert.equal(f.preview(f.u.id),null);
});
check('A short reconnection to the same room retains still queued commands',()=>{
 const f=client();f.connect();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.connect();f.push(2,0,1);
 assert.equal(f.preview(f.u.id)?.order.x,400);
});
check('Switching room identity clears old previews',()=>{
 const f=client();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.connect('PAUSE2');assert.equal(f.preview(f.u.id),null);
});
check('Eliminated or converted squads cannot retain a stale paused destination',()=>{
 const f=client();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.push(2,0,1,f.b.units.map(q=>({...q,owner:'Green'})));assert.equal(f.preview(f.u.id),null);
});
check('A running replacement uses existing prediction and supersedes only its own paused preview',()=>{
 const f=client();f.command({type:'move',ids:[f.u.id],point:{x:400,y:105}});f.context.__fixture.setSpeed(1);
 f.command({type:'move',ids:[f.u.id],point:{x:600,y:105}});assert.equal(f.preview(f.u.id),null);assert.equal(f.context.__fixture.pending().get(f.u.id).order.x,600);
});
check('A room speed notice cannot retime effects or animation belonging to the currently sampled frame',()=>{
 const f=client(),state={...f.state(2,1),effects:[{type:'death',t:2.7,max:3,fallDuration:1,visualKey:'RedInfantryDown_Die'}]};
 f.context.__now=1100;f.context.__fixture.push(state);f.context.__now=1340;f.context.__fixture.render();
 const elapsed=f.b.effects[0].renderTime,anim=f.b.units[0].anim;assert(elapsed>0);assert.equal(elapsed,.08);
 f.context.__fixture.setSpeed(0);f.context.__fixture.render();assert.equal(f.b.effects[0].renderTime,elapsed);assert.equal(f.b.units[0].anim,anim);
 f.context.__fixture.setSpeed(3);f.context.__fixture.render();assert.equal(f.b.effects[0].renderTime,elapsed);assert.equal(f.b.units[0].anim,anim);
});
check('The actual server queued ack means accepted, and its resume frame applies the order once',()=>{
 const f=client(),p={id:'a',country:'Red',lastCommand:0},r={battle:f.b,speed:0,players:[p],host:'a',streams:new Set()},before={x:f.u.x,y:f.u.y};
 const ack=server.acceptCommand(r,p,{commandId:1,command:{type:'move',ids:[f.u.id],point:{x:400,y:105}}});
 assert(ack.queued);assert.equal(f.u.order,null);assert.deepEqual({x:f.u.x,y:f.u.y},before);const paused=server.snapshot(r,true);assert.equal(paused.acknowledged.Red,1);assert.equal(paused.movementApplied.Red,0);
 server.roomSpeed(r,p,1);assert.equal(f.u.order.x,400);assert.equal(f.u.commandVersion,1);assert.equal(f.b.time,0);assert.equal(p.lastMovementApplied,1);
});
check('A paused purchase spends and appears immediately but never advances a queued movement receipt',()=>{
 const f=client(),p={id:'a',country:'Red',lastCommand:0},r={battle:f.b,speed:0,players:[p],host:'a',streams:new Set()},decoder=new Codec.Decoder();f.b.factions.Red.gold=500;
 server.acceptCommand(r,p,{commandId:1,command:{type:'move',ids:[f.u.id],point:{x:400,y:105}}});const full=decoder.decode(server.snapshot(r,true));assert.equal(full.movementApplied.Red,0);
 const oldGold=f.b.factions.Red.gold,oldCount=f.b.units.length;
 const purchase=server.acceptCommand(r,p,{commandId:2,command:{type:'recruit',id:f.b.buildings[0].id,unit:'infantry'}});
 assert.equal(purchase.queued,false);assert(f.b.factions.Red.gold<oldGold);assert.equal(f.b.units.length,oldCount+1);assert.equal(f.u.order,null);
 const pending=decoder.decode(server.snapshot(r));assert.equal(pending.acknowledged.Red,2);assert.equal(pending.movementApplied.Red,0);
 server.roomSpeed(r,p,1);const applied=decoder.decode(server.snapshot(r));assert.equal(applied.acknowledged.Red,2);assert.equal(applied.movementApplied.Red,1);assert.equal(applied.units.find(q=>q.id===f.u.id).order.x,400);assert.equal(f.b.time,0);
});
server.close();console.log(`Paused network display fixtures: ${passed} passed, ${failed} failed.`);process.exitCode=failed?1:0;
