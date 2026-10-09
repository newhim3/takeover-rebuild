const assert=require('node:assert/strict'),P=require('./progression'),R=require('./unit-rules');
function unit(name,bonus={}){const record=P.UNITS.find(r=>r.name===name),type=record.unitType.toLowerCase();return {record,type,stats:R.stats(record,type,1,bonus),bonus,hp:100,heroic:0,weakened:0};}
assert.equal(typeof R.onMoraleHit,'function');assert.equal(typeof R.tickMorale,'function');
const a=unit('Dark Knights',{47:15}),target=unit('Guards');R.onMoraleHit(a,target);assert.equal(target.moraleValue,443);
for(let i=0;i<8;i++)R.onMoraleHit(a,target);assert.equal(target.moraleValue,0);assert.equal(target.weakened,10);
target.weakened=0;R.tickMorale(target,.01);assert.equal(target.moraleValue,200);
for(const name of ['Zombie Warriors','Gunbots']){const locked=unit(name);for(let i=0;i<30;i++)R.onMoraleHit(a,locked);assert.equal(locked.moraleValue,500);assert.equal(locked.weakened,0);}
const discipline=unit('Legionaries');for(let i=0;i<20;i++)R.onMoraleHit(a,discipline);assert.equal(discipline.moraleValue,0);assert.equal(discipline.weakened,0);
const normal=unit('Guards');R.onMoraleHit(unit('Guards'),normal);assert.equal(normal.moraleValue,450);R.tickMorale(normal,.5);assert.equal(normal.moraleValue,455);R.tickMorale(normal,.5);assert.equal(normal.moraleValue,460);
normal.heroic=1;normal.moraleMode='heroic';normal.heroic=0;R.tickMorale(normal,.01);assert.equal(normal.moraleValue,800);
const raider=unit('Raiders'),enemy=unit('Guards');R.onMoraleHit(raider,enemy);assert.equal(enemy.moraleValue,430);
console.log('PASS: original morale baseline/calm, 10-second fear, undead/mechanism locks, Discipline, native intimidation; Empire15% pressure adaptation');
