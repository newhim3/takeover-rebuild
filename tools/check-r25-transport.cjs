'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Motion=require('../snapshot-motion.js'),network=require('../multiplayer-server.cjs');
const checks=[];
function check(name,run){run();checks.push(name);}
function state(sequence,{speed=1,hp=100-sequence,x=sequence*2,owner='Green',garrisonId=null}={}){return {sequence,sentAt:1000+sequence*50,time:sequence*.05,speed,units:[{id:1,owner,hp,x,y:40,state:'move',garrisonId,walkDistance:x,path:[{x:400,y:40}]}]};}
try{
 check('Stable LAN RTT and 50 ms delivery reduce only the display buffer',()=>{
  const motion=new Motion();motion.setRoundTrip(24);
  for(let i=0;i<70;i++)motion.push(state(i),1012+i*50);
  assert(motion.delay>=50&&motion.delay<55);
  const sample=motion.sample(4462);assert.equal(sample.units.get(1).hp,sample.state.units[0].hp);
  assert(sample.units.get(1).x>=sample.state.units[0].x);
  assert(sample.units.get(1).x<sample.state.units[0].x+2);
 });
 check('Remote and unknown connections retain conservative buffering',()=>{
  const motion=new Motion();for(let i=0;i<20;i++)motion.push(state(i),1012+i*50);
  assert(motion.delay>=110);motion.setRoundTrip(240);assert(motion.delay>=110);
  motion.setRoundTrip(Infinity);assert.equal(motion.roundTrip,240);
 });
 check('Raising the buffer never replays older health or ownership',()=>{
  const motion=new Motion();motion.setRoundTrip(24);
  for(let i=0;i<70;i++)motion.push(state(i),1012+i*50);
  const before=motion.sample(4462);motion.setRoundTrip(280);
  const after=motion.sample(4463);assert(after.state.sequence>=before.state.sequence);
  assert.equal(after.units.get(1).hp,after.state.units[0].hp);
  assert.equal(motion.push(state(68),4470),false);
 });
 check('Paused authoritative purchases are displayed without interpolation delay',()=>{
  const motion=new Motion();motion.push(state(1),1062);motion.sample(1062);
  const paused=state(2,{speed:0,hp:49,x:90});paused.factions={Green:{gold:120}};
  motion.push(paused,1112);const sample=motion.sample(1112);
  assert.equal(sample.state,paused);assert.equal(sample.units.get(1).hp,49);
  assert.equal(sample.units.get(1).x,90);assert.equal(sample.state.factions.Green.gold,120);
 });
 check('Only all measured, fresh and uncongested peers permit 50 ms broadcasting',()=>{
  const now=10000,a={roundTripMs:20,roundTripAt:now,writableLength:0},b={roundTripMs:30,roundTripAt:now,writableLength:0};
  const room={streams:new Set([a,b])};assert.equal(network.snapshotInterval(room,now),50);
  b.roundTripMs=180;assert.equal(network.snapshotInterval(room,now),100);
  b.roundTripMs=30;b.writableLength=20000;assert.equal(network.snapshotInterval(room,now),100);
  b.writableLength=0;b.latestState='queued';assert.equal(network.snapshotInterval(room,now),100);delete b.latestState;
  b.roundTripAt=now-8000;assert.equal(network.snapshotInterval(room,now),100);
  b.roundTripAt=now;delete b.roundTripMs;assert.equal(network.snapshotInterval(room,now),100);
  room.streams.clear();assert.equal(network.snapshotInterval(room,now),100);
 });
 check('LAN discovery room entries expose no authentication or loadout fields',()=>{
  const base={code:'LAN123',phase:'lobby',host:'host-private',players:[{id:'host-private',token:'secret-token',name:'房主甲',edicts:{1:3}}],map:'small',streams:new Set()};
  network.rooms.set(base.code,base);
  assert.deepEqual(network.lanRooms(),[{code:'LAN123',hostName:'房主甲',phase:'lobby',players:1,maxPlayers:4,canJoin:true,map:'small'}]);
  base.phase='battle';assert.equal(network.lanRooms()[0].canJoin,false);
  base.battle={result:'finished'};assert.equal(network.lanRooms().length,0);
  network.rooms.clear();
 });
 const result={version:'r25',checkedAt:new Date().toISOString(),checks,passed:true,scope:'Transport and snapshot rendering only; no battle simulation or browser playthrough.'};
 fs.mkdirSync(path.join(__dirname,'../.tools'),{recursive:true});
 fs.writeFileSync(path.join(__dirname,'../.tools/r25-transport-check.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}finally{network.close();}
