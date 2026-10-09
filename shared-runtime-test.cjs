'use strict';
const assert=require('node:assert/strict'),{Battle}=require('./engine'),P=require('./progression');
const map={grid:Array(60).fill('1'.repeat(80)),roads:{points:[{x:100,y:300},{x:700,y:300}],edges:[[0,1]]},nodes:[
 {markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},
 {markerClass:'NodeBuildHereClass',x:130,y:310,locationNum:0},
 {markerClass:'NodeCastlePurpleClass',x:700,y:300,locationNum:1},
 {markerClass:'NodeBuildHereClass',x:670,y:310,locationNum:1}]};
const b=new Battle(map,{edicts:Object.fromEntries(P.tree('Green').map(e=>[e.n,3]))});b.ai=()=>{};
assert.equal(typeof b.spellState,'function','Spell HUD must have a runtime state');
assert.equal(b.spellState('ultimate').requiresTower,true);assert.equal(b.spellState('ultimate').remaining,0);
const enemy=b.buildings[1],slot=b.slots.find(s=>s.parent===enemy.id),gold=b.factions.Purple.gold;
assert.equal(b.buildFor('Purple',slot.id,'farm'),null);assert.equal(b.factions.Purple.gold,gold-70);
assert.equal(b.buildFor('Green',slot.id,'mine'),'请选择己方领地的空建筑位');
b.destroy(enemy);assert(b.siteVisible(slot),'Original site positions remain visible after destruction');b.claim(enemy,'Green');assert(b.siteVisible(slot),'Signs remain visible during repair');
assert.equal(b.build(slot.id,'mine'),'先修复所在据点');
assert.equal(b.spellState('fire').affordable,false);b.factions.Green.mana=500;assert(b.spellState('fire').ready);
const c=new Battle(map);const castle=c.buildings[0];c.factions.Green.gold=1000;castle.hp=600;
assert.equal(c.upgradeFor('Green',castle.id),null);assert.equal(castle.maxHp,1500,'Original castle level 2 has 150% base HP');assert.equal(castle.hp,1100,'Upgrade adds only the gained maximum HP');
assert.equal(c.upgradeFor('Green',castle.id),null);assert.equal(castle.maxHp,2000,'Original castle level 3 has 200% base HP');
console.log('PASS shared spell state, paid AI building, owner checks and persistent construction sites');
