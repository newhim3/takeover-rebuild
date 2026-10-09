'use strict';
const assert=require('node:assert/strict'),{Battle}=require('./engine'),AI=require('./enemy-ai');
function setup(ownType='MageTower'){
 const map={grid:Array(60).fill('1'.repeat(80)),roads:{points:[{x:100,y:300},{x:700,y:300}],edges:[[0,1]]},nodes:[{markerClass:'Node'+ownType+'RedClass',x:100,y:300,locationNum:0},{markerClass:'NodeCastleGreenClass',x:700,y:300,locationNum:1}]};
 const b=new Battle(map,{player:'Green'});b.time=20;b.factions.Red.gold=0;b.cap=()=>2;b.settings.upgradeAt=999999;return b;
}
const b=setup(),ours=[b.spawn(b.buildings[0],'infantry'),b.spawn(b.buildings[0],'infantry')],theirs=[b.spawn(b.buildings[1],'infantry'),b.spawn(b.buildings[1],'infantry')];
for(let i=0;i<2;i++){theirs[i].stats=structuredClone(ours[i].stats);theirs[i].hp=theirs[i].maxHp=ours[i].maxHp;theirs[i].bonus={...ours[i].bonus};}
assert.equal(AI.plan(b,'Red').phase,'attack','full equivalent force must leave the tower');assert(ours.every(u=>u.order?.target===b.buildings[1].id));
const repair=setup('Castle'),crew=[repair.spawn(repair.buildings[0],'infantry'),repair.spawn(repair.buildings[0],'infantry')],guard=repair.spawn(repair.buildings[1],'infantry');repair.buildings[0].hp*=.8;guard.hp*=.5;
assert.equal(AI.plan(repair,'Red').phase,'attack','a reserved repairer must not permanently block the remaining capable force');assert.equal(crew.filter(u=>u.garrisonId===repair.buildings[0].id).length,1);assert.equal(crew.filter(u=>u.order?.target===repair.buildings[1].id).length,1);
console.log('PASS: full equal force leaves tower; repair reserve does not lock the launch requirement');
