'use strict';
// Short fixtures only: no sockets, browser play, simulation loops or AI changes.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{createRequire}=require('node:module'),{EventEmitter}=require('node:events');
const {Battle}=require('../engine'),network=require('../multiplayer-server.cjs');
const Codec=require('../snapshot-codec'),Motion=require('../snapshot-motion');
const data={nativePlayer:'Red',width:1100,height:300,grid:Array(30).fill('1'.repeat(110)),nodes:[
 {x:100,y:105,locationNum:1,markerClass:'NodeCastleRedClass'},
 {x:700,y:105,locationNum:2,markerClass:'NodeCastleGreenClass'},
 {x:110,y:145,locationNum:1,markerClass:'NodeBuildHereClass'}]};
let failed=0,passed=0;
function check(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
function room(){const b=new Battle(data,{player:'Red',difficulty:'normal',humanOwners:['Red','Green'],multiplayer:true}),p={id:'a',country:'Red',lastCommand:0};return {r:{battle:b,speed:0,players:[p,{id:'b',country:'Green'}],host:'a',streams:new Set(),phase:'battle',code:'SHORT1'},p,b};}
function issue(r,p,id,c){return network.acceptCommand(r,p,{commandId:id,command:c});}
function streamFixture(){
 const file=path.resolve(__dirname,'../multiplayer-server.cjs'),ctx={require:createRequire(file),module:{exports:{}},__dirname:path.dirname(file),setInterval:()=>({unref(){}}),clearInterval(){},console};
 vm.runInNewContext(fs.readFileSync(file,'utf8')+'\nmodule.exports.fixture={send,attach};',ctx,{filename:file});
 const {r,p,b}=room(),out=[],stream=new EventEmitter();stream.writableLength=0;stream.send=value=>out.push(typeof value==='string'?JSON.parse(value):value);
 stream.write=line=>{const match=line.match(/^event: ([^\n]+)\ndata: (.+)\n\n$/s);if(match)out.push({event:match[1],data:JSON.parse(match[2])});};
 const audit=ctx.module.exports.fixture,decoder=new Codec.Decoder();audit.attach(r,p,stream);decoder.decode(out.find(v=>v.event==='start').data.state);out.length=0;
 return {r,p,b,out,stream,audit,decoder,snapshot:ctx.module.exports.snapshot};
}

check('Paused recruitment pays immediately without advancing time or deploying the recruit',()=>{
 const {r,p,b}=room(),home=b.buildings[0],before=b.factions.Red.gold,cost=b.recruitCost('infantry','Red');
 issue(r,p,1,{type:'recruit',id:home.id,unit:'infantry'});
 assert.equal(b.factions.Red.gold,before-cost);assert.equal(b.units.length,1);assert.equal(b.units[0].garrisonId,home.id);assert.equal(b.time,0);
 assert.equal(network.snapshot(r,true).acknowledged.Red,1);
});
check('Paused building and demolition both pay or refund immediately',()=>{
 const {r,p,b}=room(),slot=b.slots[0],gold=b.factions.Red.gold;
 issue(r,p,1,{type:'build',id:slot.id,building:'mine'});assert.equal(slot.type,'mine');assert.equal(b.factions.Red.gold,gold-90);
 issue(r,p,2,{type:'demolish',id:slot.id});assert.equal(slot.type,null);assert.equal(b.factions.Red.gold,gold-45);assert.equal(b.time,0);
});
check('Replayed purchase command is paid and applied exactly once',()=>{
 const {r,p,b}=room(),c={type:'recruit',id:b.buildings[0].id,unit:'infantry'};
 issue(r,p,1,c);const gold=b.factions.Red.gold,count=b.units.length;
 assert(issue(r,p,1,c).duplicate);assert.equal(b.factions.Red.gold,gold);assert.equal(b.units.length,count);
});
check('Paused move-stop-move remains stationary and the final order wins on resume',()=>{
 const {r,p,b}=room(),u=b.spawn(b.buildings[0],'infantry'),before={x:u.x,y:u.y};
 issue(r,p,1,{type:'move',ids:[u.id],point:{x:400,y:105}});
 issue(r,p,2,{type:'stop',ids:[u.id]});issue(r,p,3,{type:'move',ids:[u.id],point:{x:900,y:105}});
 assert.equal(u.order,null);assert.deepEqual({x:u.x,y:u.y},before);assert.equal(r.deferred.length,3);
 assert(issue(r,p,3,{type:'move',ids:[u.id],point:{x:900,y:105}}).duplicate);assert.equal(r.deferred.length,3);
 network.roomSpeed(r,p,1);assert.equal(r.deferred.length,0);assert.equal(u.order.x,900);assert.equal(u.commandVersion,3);assert.equal(b.time,0);
});
check('Only the room host can resume the authoritative simulation',()=>{
 const {r,p}=room();assert.throws(()=>network.roomSpeed(r,{id:'b'},1),/房主/);assert.equal(r.speed,0);network.roomSpeed(r,p,1);assert.equal(r.speed,1);
});
check('Snapshot HP and ownership remain in the same discrete frame',()=>{
 const motion=new Motion(),s=(seq,hp,owner,x)=>({sequence:seq,sentAt:1000+(seq-1)*100,time:(seq-1)*.1,speed:1,units:[{id:1,x,y:0,hp,state:'move'}],buildings:[{id:2,hp,owner}],effects:[{id:seq}]}),a=s(1,100,'Red',0),b=s(2,70,'Green',10);
 motion.push(a,1000);motion.push(b,1100);const sample=motion.sample(1160);
 assert.equal(sample.units.get(1).hp,sample.state.buildings[0].hp);assert.equal(sample.state.buildings[0].owner,sample.state===a?'Red':'Green');assert.equal(sample.state.effects[0].id,sample.state.sequence);
});
check('A paused snapshot does not extrapolate unit motion',()=>{
 const motion=new Motion();motion.push({sequence:1,sentAt:1000,time:0,speed:1,units:[{id:1,x:0,y:0,state:'move'}]},1000);
 motion.push({sequence:2,sentAt:1100,time:.1,speed:0,units:[{id:1,x:10,y:0,state:'move'}]},1100);
 for(const now of [1120,1500,9000]){const sample=motion.sample(now);assert.equal(sample.units.get(1).x,10);assert.equal(sample.time,.1);assert.equal(sample.elapsed,0);}
});
check('Delta packets recover from a lost intermediate state and reject a missing checkpoint',()=>{
 const enc=new Codec.Encoder(),dec=new Codec.Decoder(),state={sequence:1,sentAt:1000,time:0,speed:1,units:[{id:1,definitionKey:'a',hp:100}],definitions:[{key:'a',stats:{}}],buildings:[],slots:[],chests:[]};
 dec.decode(enc.encode(state,true));enc.encode({...state,sequence:2,time:.1});const latest=enc.encode({...state,sequence:3,time:.2,units:[{id:1,definitionKey:'a',hp:65}]});
 assert.equal(dec.decode(latest).units[0].hp,65);assert.equal(new Codec.Decoder().decode(latest),null);
});
check('Backpressure keeps the full checkpoint required by the latest queued delta',()=>{
 const {r,b,out,stream,audit,decoder,snapshot}=streamFixture();
 stream.writableLength=20000;audit.send(r,'state',snapshot(r,true));b.spawn(b.buildings[0],'infantry');const latest=snapshot(r);audit.send(r,'state',latest);
 stream.writableLength=0;stream.emit('drain');let decoded=null;for(const packet of out.filter(v=>v.event==='state'))decoded=decoder.decode(packet.data);
 assert(decoded,'the queued delta must arrive with its full checkpoint');assert.equal(decoded.sequence,latest.sequence);assert.equal(decoded.units.length,1);
});
check('A new checkpoint supersedes old queued data and normal writes flush it before their delta',()=>{
 const {r,out,stream,audit,decoder,snapshot}=streamFixture();stream.writableLength=20000;
 audit.send(r,'state',snapshot(r,true));audit.send(r,'state',snapshot(r));const checkpoint=snapshot(r,true);audit.send(r,'state',checkpoint);audit.send(r,'state',snapshot(r));
 assert.equal(JSON.parse(stream.latestCheckpoint).data.sequence,checkpoint.sequence);
 stream.writableLength=0;const latest=snapshot(r);audit.send(r,'state',latest);
 const sent=out.filter(v=>v.event==='state');assert.equal(sent.length,2);assert.equal(sent[0].data.sequence,checkpoint.sequence);
 for(const packet of sent)assert(decoder.decode(packet.data));assert.equal(sent[1].data.sequence,latest.sequence);
 assert.equal(stream.latestCheckpoint,null);assert.equal(stream.latestState,null);
});
check('A checkpoint that fills the socket keeps only its latest delta for the next drain',()=>{
 const {r,out,stream,audit,decoder,snapshot}=streamFixture(),send=stream.send;stream.send=value=>{send(value);const packet=typeof value==='string'?JSON.parse(value):value;if(packet.event==='state'&&packet.data.full)stream.writableLength=20000;};
 stream.writableLength=20000;audit.send(r,'state',snapshot(r,true));audit.send(r,'state',snapshot(r));
 stream.writableLength=0;stream.emit('drain');assert.equal(out.length,1);assert(out[0].data.full);assert(decoder.decode(out[0].data));assert(stream.latestState);
 const latest=snapshot(r);audit.send(r,'state',latest);assert.equal(out.length,1);
 stream.writableLength=0;stream.emit('drain');assert.equal(out.length,2);assert.equal(decoder.decode(out[1].data).sequence,latest.sequence);
});

// Exercise the actual client command/render code without a browser or network.
const context={console,URLSearchParams,SnapshotMotion:Motion,SnapshotCodec:Codec,Battle,Progression:require('../progression'),setInterval:()=>0,
 location:{search:'',origin:'http://127.0.0.1:4387'},__now:1000,speed:1,player:'Red',battle:null,handledResult:false};
context.window=context;context.performance={now:()=>context.__now};
const source=fs.readFileSync(require.resolve('../multiplayer-client.js'),'utf8').replace('})(window);',`
root.__fixture={command,render,pending:()=>pendingOrders,install(b,state){api.active=true;remote=b;world=b.data;room={code:'SHORT1',host:'a',players:[{id:'a',country:'Red',edicts:{}}]};me='a';secret='fixture';serverPlayer='Red';player='Red';speed=1;stream={send:()=>true};motion=new SnapshotMotion();motion.push(state,performance.now());renderedState=state;pendingOrders.clear();corrections.clear();wirePending.clear();}};
})(window);`);
vm.runInNewContext(source,context,{filename:'multiplayer-client.js'});
function previewUnit(status){const {b}=room(),u=b.spawn(b.buildings[0],'infantry');b.deploy(u);u.state='idle';Object.assign(u,status);context.__now=1000;
 const state={sequence:1,sentAt:1000,time:0,speed:1,units:b.units,effects:[],result:null};context.__fixture.install(b,state);const start=u.x;
 context.__fixture.command({type:'move',ids:[u.id],point:{x:500,y:105}});context.__now=1040;context.__fixture.render();return {step:b.units[0].x-start,u};}
check('Frozen unit command preview stays stationary until the server unfreezes it',()=>{
 const {step}=previewUnit({frozen:1});assert.equal(step,0);
});
check('Chilled command preview uses the same movement speed scale as the server',()=>{
 const {step,u}=previewUnit({chilled:1,chillScale:.5});assert(step<=u.stats.speed*.88*.04*.5+1e-8,'preview moved faster than the chilled authoritative speed');
});
network.close();console.log(`Network short fixtures: ${passed} passed, ${failed} failed.`);process.exitCode=failed?1:0;
