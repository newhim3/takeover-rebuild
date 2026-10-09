const assert=require('node:assert/strict'),{Battle}=require('./engine');
const data={grid:Array(60).fill('1'.repeat(80)),nodes:[
 {markerClass:'NodeCastlePurpleClass',x:100,y:300,locationNum:0},
 {markerClass:'NodeTownGreenClass',x:350,y:300,locationNum:1},
 {markerClass:'NodeCastleRedClass',x:650,y:300,locationNum:2},
]};
const b=new Battle(data),[home,town,last]=b.buildings,u=b.spawn(home,'infantry');
// Isolate occupation/repair continuity from a second AI buying defenders.
// An outmatched lone squad is deliberately allowed to regroup in tactical tests.
b.time=45;b.factions.Purple.gold=0;b.factions.Red.gold=0;b.ai();
assert.equal(u.order.target,town.id,'A lone army still starts an offensive');
b.destroy(town);b.time++;b.ai();assert.equal(u.order.target,town.id);assert.equal(u.order.enter,true,'Destruction must be followed by occupation');
b.claim(town,'Purple');u.order=null;u.garrisonId=town.id;b.time++;b.ai();assert.equal(u.garrisonId,town.id,'Keep repair crew until restoration completes');
b.capture(town,'Purple');b.time=81;b.ai();assert.equal(u.garrisonId,null);assert.equal(u.order.target,last.id,'Captured garrison continues toward another nation');
b.destroy(home);b.destroy(town);b.destroy(last);u.order=null;b.time++;b.ai();assert(u.order?.enter,'Survivors capture even without an intact home base');
assert.equal(b.factions.Purple.gold,0,'Offensive planning must not grant free gold');
console.log('PASS: offensive wave, occupation after destruction, repair crew, continued conquest and homeless survivors');
