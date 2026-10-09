'use strict';
// Short real-Battle probes for reservation collisions; no simulated campaign.
const assert=require('node:assert/strict'),{Battle}=require('../engine'),AI=require('../enemy-ai');
const node=(x,type,owner,location)=>({x,y:105,locationNum:location,markerClass:`Node${type}${owner}Class`});
const site=(x,location)=>({x,y:145,locationNum:location,markerClass:'NodeBuildHereClass'});
const map=nodes=>({width:1200,height:300,grid:Array(30).fill('1'.repeat(120)),nodes});
const random=Math.random;Math.random=()=>.25;
let failed=0;function check(name,fn){try{fn();console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
function battle(nodes,difficulty='normal'){const b=new Battle(map(nodes),{player:'Green',difficulty});b.time=12;b.factions.Red.gold=0;return b;}
function troops(b,home,count){return Array.from({length:count},()=>b.spawn(home,'infantry'));}
function orders(units){return units.map(u=>({id:u.id,garrison:u.garrisonId,target:u.order?.target??null,defendHome:u.defendHome??null}));}
function report(name,data){console.log(name,JSON.stringify(data));}
check('A safe chest already assigned to a loot runner does not draw a second scout',()=>{
 const b=battle([node(100,'Castle','Red',1),node(1050,'Castle','Green',2),{x:350,y:105,markerClass:'NodeChestClass'}]),red=troops(b,b.buildings[0],2),chest=b.chests[0];
 const p=AI.plan(b,'Red'),assigned=red.filter(u=>u.order?.target===chest.id);
 report('loot-runner-and-offensive-scout',{phase:p.phase,target:p.target,chest:chest.id,assigned:assigned.length,orders:orders(red)});
 assert.equal(assigned.length,1,'One safe chest should use one reserved collector');
});
check('A retained repairer does not pin the remaining whole army to the captured ruin',()=>{
 const b=battle([node(100,'Castle','Red',1),node(450,'Castle','Green',2),node(1050,'Town','Green',3),site(80,1),site(100,1),site(120,1)]);
 b.slots[0].type='farm';const red=troops(b,b.buildings[0],3),initial=AI.plan(b,'Red'),captured=b.building(initial.target);
 assert(captured&&captured.owner==='Green');captured.owner='Red';captured.ruined=true;captured.captureOwner='Red';captured.hp=40;
 // The first squad has entered; the rest are still following their assault.
 red[0].garrisonId=captured.id;red[0].x=captured.x;red[0].y=captured.y;red[0].order=null;red[0].path=[];
 b.time=13;const p=AI.plan(b,'Red');
 report('claimed-repair-holds-whole-mission',{phase:p.phase,target:p.target,claimed:captured.id,available:p.available,orders:orders(red)});
 assert(p.available>=2);assert.notEqual(p.target,captured.id,'The main mission should advance after a repairer is reserved');assert(red.slice(1).some(u=>u.order?.target!==captured.id),'Surplus troops need a next objective');
});
check('A claimed ruin under actual attack is included in defense reservations',()=>{
 const b=battle([node(100,'Castle','Red',1),node(450,'Town','Red',2),node(1050,'Castle','Green',3),site(100,1)]),[home,claimed,enemyHome]=b.buildings;
 b.slots[0].type='farm';claimed.ruined=true;claimed.captureOwner='Red';claimed.hp=80;
 const red=[...troops(b,home,2),...troops(b,claimed,1)],enemy=b.spawn(enemyHome,'infantry');b.deploy(enemy);enemy.x=460;enemy.y=105;b.issue(enemy,claimed,claimed.id);
 assert(b.isHomeThreat(enemy,claimed,true));const p=AI.plan(b,'Red');
 report('claimed-ruin-missing-defense-threat',{actualThreat:true,plannedThreats:p.threats,available:p.available,claimed:claimed.id,enemy:enemy.id,orders:orders(red)});
 assert(p.threats>0,'Secured ruins must not disappear from defense planning');assert(red.some(u=>u.defendHome===claimed.id),'The threatened claimed ruin should receive an assigned defender');
});
check('The last building slot increases supply when a full army is still undersized',()=>{
 const b=battle([node(100,'Castle','Red',1),node(950,'Castle','Green',2),site(80,1),site(100,1),site(120,1),site(900,2),site(950,2),site(1000,2)]),[home,enemyHome]=b.buildings;
 for(const s of b.slots.filter(s=>s.parent===enemyHome.id))s.type='farm';
 b.slots[0].type='mine';b.slots[1].type='farm';const empty=b.slots[2],red=troops(b,home,3);troops(b,enemyHome,5);b.factions.Red.gold=500;
 const before={pop:b.pop('Red'),cap:b.cap('Red'),income:b.rates('Red').gold},p=AI.plan(b,'Red');
 report('last-site-mine-versus-needed-farm',{before,after:{type:empty.type,pop:b.pop('Red'),cap:b.cap('Red'),freeSites:b.slots.filter(s=>!s.type).length},phase:p.phase,investment:p.investment,orders:orders(red)});
 assert.equal(empty.type,'farm','An undersized full army needs supply before its final slot is spent on income');assert(b.cap('Red')>3);
});
function activeWaveWithChest(count,{defenders=1,weakenBackline=false}={}){
 const nodes=[node(100,'Castle','Red',1),node(900,'Castle','Green',2)];if(count>2)nodes.push(site(100,1));
 const b=battle(nodes,'hard'),[home,enemyHome]=b.buildings;if(count>2)b.slots[0].type='farm';
 const red=troops(b,home,count),guards=troops(b,enemyHome,defenders);
 // Equal public combat profiles isolate loss of a committed minimum wave
 // rather than depending on the different countries' base troop strength.
 for(const defender of guards){defender.stats={...red[0].stats};defender.hp=defender.maxHp=red[0].maxHp;}
 if(weakenBackline)for(const u of red.slice(1))u.weakened=30;
 const before=AI.plan(b,'Red');assert.equal(before.phase,'attack');assert.equal(before.target,enemyHome.id);
 assert.equal(red.filter(u=>u.order?.target===enemyHome.id).length,count);
 const chest={id:b.nextId++,x:220,y:145,collected:false};b.chests.push(chest);b.time=13;const after=AI.plan(b,'Red');
 report('loot-detachment-from-committed-wave',{count,before:before.phase,after:after.phase,available:after.available,castle:enemyHome.id,chest:chest.id,orders:orders(red)});
 return {red,chest,enemyHome};
}
check('Loot does not detach a member from a committed minimum assault wave',()=>{
 const {red,chest,enemyHome}=activeWaveWithChest(2);
 assert.equal(red.filter(u=>u.order?.target===chest.id).length,0,'The active two-squad minimum must stay together');
 assert.equal(red.filter(u=>u.order?.target===enemyHome.id).length,2);
});
check('A committed assault with spare strength can send one collector',()=>{
 const {red,chest,enemyHome}=activeWaveWithChest(3);
 assert.equal(red.filter(u=>u.order?.target===chest.id).length,1,'Loot should remain available to a genuine spare squad');
 assert.equal(red.filter(u=>u.order?.target===enemyHome.id).length,2);
});
check('Loot cannot remove the strength that makes an otherwise full-size wave viable',()=>{
 const {red,chest,enemyHome}=activeWaveWithChest(3,{defenders:2,weakenBackline:true});
 assert.equal(red.filter(u=>u.order?.target===chest.id).length,0,'The two weakened squads need their strong partner, despite meeting the count threshold');
 assert.equal(red.filter(u=>u.order?.target===enemyHome.id).length,3);
});
Math.random=random;
process.exitCode=failed?1:0;
