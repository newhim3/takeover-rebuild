const assert=require('node:assert/strict'),fs=require('fs'),P=require('./progression'),R=require('./unit-rules'),{Battle}=require('./engine');
const source=JSON.parse(fs.readFileSync('assets/takeover/data/units.json','utf8')).units;
assert.deepEqual(P.UNITS,source,'Runtime records must match every extracted field');
for(const row of source){
 const s=R.stats(row,row.unitType.toLowerCase(),1);
 assert.equal(s.hp,row.hp*row.unitsCount,row.name+' HP');
 assert.equal(s.members,row.unitsCount);assert.equal(s.damageMin,row.damageMin);assert.equal(s.damageMax,row.damageMax);
 for(const key of ['speed','range','morale','meleePenalty','cost','upkeep','attackSpeed'])assert.equal(s[key],row[key],row.name+' '+key);
 assert.equal(s.attackInterval,row.attackSpeed/10);
 for(const rank of [2,3]){const v=R.stats(row,row.unitType.toLowerCase(),rank),l=rank-1;assert.equal(v.hpPerMember,Math.max(Math.ceil(row.hp*(1+l/10)),row.hp+l));}
}
const map={grid:Array(60).fill('1'.repeat(80)),nodes:[{markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},{markerClass:'NodeCastlePurpleClass',x:700,y:300,locationNum:1}]};
const b=new Battle(map);b.ai=()=>{};const u=b.spawn(b.owned()[0],'archers'),enemy=b.spawn(b.buildings[1],'infantry');
u.garrisonId=enemy.garrisonId=null;u.x=300;u.y=300;enemy.x=370;enemy.y=300;enemy.frozen=100;b.update(.01);
assert.equal(u.attackCd,3);const hp=enemy.hp;assert(u.pendingAttack,'Attack begins before the hit frame');b.update(.5);assert(enemy.hp<hp,'First impact lands at the native animation marker');const after=enemy.hp;b.update(2);assert.equal(enemy.hp,after,'Archer must not fire again before its original 3-second interval');
console.log(`PASS: all ${source.length} original records match; base stats, veteran formulas and actual attack cadence verified`);
